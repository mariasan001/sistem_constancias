import api from '@/lib/apis';
import type { TramiteFull, TramitePage, TramiteType, Analyst } from './tramite.model';

export async function searchTramites(params: {
  subWorkUnitId?: number; statusId?: number; assignedTo?: string;
  assigned?: boolean; q?: string; page?: number; size?: number;
}): Promise<TramitePage> {
  const { data } = await api.get('/api/tramites/search', { params });
  return data as TramitePage;
}

export async function getTramiteByFolio(folio: string): Promise<TramiteFull> {
  const { data } = await api.get(`/api/tramites/${encodeURIComponent(folio)}/full`);
  return data as TramiteFull;
}

export async function changeTramiteType(folio: string, newTypeId: number, comment: string) {
  const { data } = await api.patch(`/api/tramites/type/${encodeURIComponent(folio)}/change-type`, { newTypeId, comment });
  return data;
}

export async function listTramiteTypes(): Promise<TramiteType[]> {
  const { data } = await api.get('/api/catalogs', { params: { size: 100 } });
  return data?.content ?? [];
}

type CommonData = {
  toStatusId: number; actorUserId: string; comment: string | 'null';
  adeudo: number | null; noficio: string | 'null'; enadeudo: boolean | null;
};

export async function changeTramiteStatus(
  folio: string,
  toStatusId: number,
  opts: {
    actorUserId: string;
    evidencia?: File | Blob | null;
    fin_adeudo?: number; fin_noficio?: string; fin_enAdeudo?: boolean;
    noficioNoAdeudo?: string;
  }
) {
  const isFinalizado = Number(toStatusId) === 4;

  if (isFinalizado) {
    const dataObj: CommonData = {
      toStatusId, actorUserId: opts.actorUserId,
      comment: 'Se aprobó con oficio y evidencia',
      adeudo: Number(opts.fin_adeudo ?? 0),
      noficio: String(opts.fin_noficio ?? ''),
      enadeudo: Boolean(opts.fin_enAdeudo ?? false),
    };
    const fd = new FormData();
    if (opts.evidencia) fd.append('evidencia', opts.evidencia as Blob);

    const { data } = await api.patch(
      `/api/tramites/${encodeURIComponent(folio)}/status`,
      fd,
      { params: { data: JSON.stringify(dataObj) }, headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  }

  const hasOficio = !!opts.noficioNoAdeudo?.trim();
  const dataObj: CommonData = hasOficio ? {
    toStatusId, actorUserId: opts.actorUserId, comment: 'null', adeudo: 0, noficio: String(opts.noficioNoAdeudo), enadeudo: false,
  } : {
    toStatusId, actorUserId: opts.actorUserId, comment: 'null', adeudo: null, noficio: 'null', enadeudo: null,
  };

  const { data } = await api.patch(
    `/api/tramites/${encodeURIComponent(folio)}/status`,
    {},
    { params: { data: JSON.stringify(dataObj) } }
  );
  return data;
}

export async function assignTramite(folio: string, assigneeUserId: string) {
  const payload = { assigneeUserId, comment: 'Asignación al analista', newStatusId: 2 };
  const { data } = await api.patch(`/api/tramites/tickets/${encodeURIComponent(folio)}/assign`, payload);
  return data;
}

export async function listAnalystsBySubarea(subWorkUnitId: number): Promise<Analyst[]> {
  const { data } = await api.get('/api/users/by-subarea', { params: { subWorkUnitId, onlyAnalysts: true, page: 0, size: 200 } });
  const list = (data?.content ?? data) as Array<{ userId:string; fullName?:string; name?:string; subWorkUnitId:number; }>;
  return list.map(u => ({ userId: u.userId, name: u.fullName ?? u.name ?? u.userId, subWorkUnitId: u.subWorkUnitId }));
}

export async function getTramiteEvidence(folio: string, inline = true) {
  const res = await api.get(`/api/tramites/${encodeURIComponent(folio)}/evidencia`, { params: { inline }, responseType: 'blob' });
  const contentType = res.headers['content-type'] || 'application/octet-stream';
  const cd = (res.headers['content-disposition'] as string) || '';
  const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd) || undefined;
  const rawName = m?.[1] ?? m?.[2] ?? `evidencia-${folio}`;
  const filename = decodeURIComponent(rawName);
  return { blob: res.data as Blob, filename, contentType };
}

