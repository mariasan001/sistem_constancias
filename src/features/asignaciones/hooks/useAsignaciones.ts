// src/app/(private)/dashboard/asignaciones/hooks/useAsignaciones.ts
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';

// 🔧 Ajusta estos paths si en tu repo están en otra carpeta
import {
  listTramiteTypes,
  listAnalystsBySubarea,
  changeTramiteType,
  changeTramiteStatus,
  assignTramite,
  getTramiteByFolio,
  getTramiteEvidence,
} from '@/features/asignaciones/tramite.service';
import type {
  Tramite,
  TramiteFull,
  TramiteType,
  Analyst,
} from '@/features/asignaciones/tramite.model';
import { useTramites } from '@/hooks/useTramites';

// Si tu hook de lista es export default:
// Si fuera export nombrado, usa en cambio:
// import { useTramites } from '@/hooks/useTramites';

const FINALIZADO_ID = 4 as const;

export default function useAsignaciones(
  subWorkUnitId?: number,
  onlyUnassigned: boolean = false,
  assignedTo?: string
) {
  const { user } = useAuthContext();

  const isAdmin   = user?.roles?.some((r) => r.description === 'ADMIN') ?? false;
  const isLeader  = user?.roles?.some((r) => r.description === 'LIDER') ?? false;
  const isAnalyst = user?.roles?.some((r) => r.description === 'ANALISTA' || r.id === 3) ?? false;

  const canAssign       = isLeader || isAdmin;
  const canChangeType   = isLeader || isAdmin;
  const canChangeStatus = canAssign || isAnalyst;

  // 👇 Param > Contexto
  const effectiveSub =
    subWorkUnitId ?? (!isAdmin ? user?.subWorkUnit?.id : undefined);

  const effectiveAssignedTo =
    assignedTo ?? (isAnalyst ? user?.userId : undefined);

  // 📄 Lista (paginación/búsqueda) con control real de onlyUnassigned
  const {
    rows: baseRows,
    setRows,
    page, setPage,
    size, setSize,
    total,
    q, setQ,
    loading,
    fetchList,
  } = useTramites(effectiveSub, onlyUnassigned, effectiveAssignedTo);

  // 📚 Catálogos
  const [tramiteTypes, setTramiteTypes] = useState<TramiteType[]>([]);
  const [analysts, setAnalysts] = useState<Analyst[]>([]);

  useEffect(() => {
    listTramiteTypes().then(setTramiteTypes).catch(() => {});
  }, []);

  useEffect(() => {
    if (canAssign && effectiveSub) {
      listAnalystsBySubarea(effectiveSub).then(setAnalysts).catch(() => {});
    } else {
      setAnalysts([]);
    }
  }, [canAssign, effectiveSub]);

  // 🧩 UI por fila
  const [openFolio, setOpenFolio] = useState<string | null>(null);
  const [detail, setDetail] = useState<TramiteFull | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [savingRow, setSavingRow] = useState<string | null>(null);

  // 🗺️ Field maps (en memoria)
  const [adeudoMap, setAdeudoMap] = useState<Record<string, boolean>>({});
  const [montoMap, setMontoMap]   = useState<Record<string, string>>({});
  const [noficioMap, setNoficioMap] = useState<Record<string, string>>({});
  const [fileNameMap, setFileNameMap] = useState<Record<string, string>>({});
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [uploadOkMap, setUploadOkMap] = useState<Record<string, boolean>>({});
  const [uploadErrMap, setUploadErrMap] = useState<Record<string, string>>({});

  // 💧 Hidrata maps cuando llegan filas nuevas
  useEffect(() => {
    if (!baseRows?.length) return;

    setAdeudoMap((m) => {
      const n = { ...m };
      for (const r of baseRows) if (n[r.folio] === undefined)
        n[r.folio] = Boolean((r as any).enadeudo ?? false);
      return n;
    });

    setMontoMap((m) => {
      const n = { ...m };
      for (const r of baseRows) if (n[r.folio] === undefined) {
        const v = (r as any).adeudo;
        n[r.folio] = v == null ? '' : String(v);
      }
      return n;
    });

    setNoficioMap((m) => {
      const n = { ...m };
      for (const r of baseRows) if (n[r.folio] === undefined)
        n[r.folio] = (r as any).noficio ?? '';
      return n;
    });

    setFileNameMap((m) => {
      const n = { ...m };
      for (const r of baseRows) if (n[r.folio] === undefined) {
        const ev = (r as any).evidencia ?? '';
        n[r.folio] = ev ? ev.split('/').pop() || ev : '';
      }
      return n;
    });
  }, [baseRows]);

  // 👤 Si es analista y NO forzaste assignedTo por parámetro, filtra “mis trámites”
  const rows = useMemo(
    () =>
      isAnalyst && user?.userId && !effectiveAssignedTo
        ? baseRows.filter((r) => r.assignedTo === user.userId)
        : baseRows,
    [baseRows, isAnalyst, user?.userId, effectiveAssignedTo]
  );

  // 🔎 Selección + detalle (sin leer estado stale)
  const selectRow = async (folio: string) => {
    setOpenFolio((prev) => {
      const next = prev === folio ? null : folio;
      if (next) {
        (async () => {
          setLoadingDetail(true);
          try {
            const d = await getTramiteByFolio(next);
            setDetail(d);
          } finally {
            setLoadingDetail(false);
          }
        })();
      } else {
        setDetail(null);
      }
      return next;
    });
  };

  // 🧬 Cambiar tipo
  const changeType = async (folio: string, newTypeId: number) => {
    if (!canChangeType) return;
    try {
      await changeTramiteType(folio, newTypeId, 'Cambio de tipo desde asignaciones');
      setEditingType(null);
      fetchList();
    } catch {
      /* TODO: toast */
    }
  };

  // 🔁 Cambiar estatus (reglas mínimas)
  const changeStatus = async (row: Tramite, newStatusId: number) => {
    if (!canChangeStatus || !user) return;

    // Regla ejemplo: ENTREGADO(5) requiere FINALIZADO(4)
    if (newStatusId === 5 && row.statusId !== 4) {
      alert('Para ENTREGAR (5) debe estar FINALIZADO (4).');
      return;
    }

    const of = (noficioMap[row.folio] ?? '').trim();
    const hasOficioNoAdeudo = !!of && !(adeudoMap[row.folio] ?? false);

    try {
      await changeTramiteStatus(row.folio, newStatusId, {
        actorUserId: user.userId,
        noficioNoAdeudo: hasOficioNoAdeudo ? of : undefined,
      });

      setRows((prev) =>
        prev.map((r) =>
          r.folio === row.folio
            ? { ...r, statusId: newStatusId, statusDesc: statusLabel(newStatusId) }
            : r
        )
      );
      setEditingStatus(null);
    } catch {
      /* TODO: toast */
    }
  };

  // 👥 Asignar analista
  const assignTo = async (row: Tramite, assigneeUserId: string, list: Analyst[]) => {
    if (!canAssign) return;
    try {
      setSavingRow(row.folio);
      const chosenName = list.find((a) => a.userId === assigneeUserId)?.name ?? assigneeUserId;
      const res = await assignTramite(row.folio, assigneeUserId);

      setRows((prev) =>
        prev.map((r) =>
          r.folio === row.folio
            ? {
                ...r,
                assignedTo: res?.assigneeUserId ?? assigneeUserId,
                assignedToName: res?.assigneeName ?? chosenName,
                assignedBy: res?.assignedBy ?? user?.userId,
                assignedByName: res?.assignedByName ?? user?.name,
                assignedAt: res?.assignedAt ?? new Date().toISOString(),
                statusId: 2,
                statusDesc: 'Asignado',
              }
            : r
        )
      );
    } finally {
      setAssigning(null);
      setSavingRow(null);
    }
  };

  // 🟧 UI helpers
  const toggleAdeudo = (folio: string) =>
    setAdeudoMap((a) => ({ ...a, [folio]: !a[folio] }));

  const setMonto = (folio: string, raw: string) =>
    setMontoMap((m) => ({ ...m, [folio]: raw.replace(/[^\d.-]/g, '') }));

  const setNoficio = (folio: string, v: string) =>
    setNoficioMap((m) => ({ ...m, [folio]: v }));

  // 📎 Subir evidencia (FINALIZADO 4)
  const onPickEvidence = async (row: Tramite, f?: File) => {
    if (!f || !user) return;
    const folio = row.folio;

    setUploadErrMap((m) => ({ ...m, [folio]: '' }));
    setUploadOkMap((m) => ({ ...m, [folio]: false }));
    setUploadingMap((m) => ({ ...m, [folio]: true }));

    const enAdeudo = adeudoMap[folio] ?? false;
    const adeudo = Number((montoMap[folio] ?? '').replace(/[^\d.-]/g, '') || 0);
    const noficio = (noficioMap[folio] ?? '').trim();

    if (!noficio) {
      setUploadingMap((m) => ({ ...m, [folio]: false }));
      setUploadErrMap((m) => ({ ...m, [folio]: 'Escribe el No. de oficio antes de subir.' }));
      return;
    }

    try {
      await changeTramiteStatus(folio, FINALIZADO_ID, {
        actorUserId: user.userId,
        evidencia: f,
        fin_adeudo: adeudo,
        fin_noficio: noficio,
        fin_enAdeudo: enAdeudo,
      });

      setRows((prev) =>
        prev.map((r) =>
          r.folio === folio ? { ...r, statusId: FINALIZADO_ID, statusDesc: 'Finalizado' } : r
        )
      );
      setFileNameMap((m) => ({ ...m, [folio]: f.name }));
      setUploadOkMap((m) => ({ ...m, [folio]: true }));
      fetchList();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || 'No se pudo finalizar con evidencia.';
      setUploadErrMap((m) => ({ ...m, [folio]: msg }));
    } finally {
      setUploadingMap((m) => ({ ...m, [folio]: false }));
    }
  };

  // 👁️ Ver / ⬇️ Descargar
  const viewEvidence = async (folio: string) => {
    const { blob } = await getTramiteEvidence(folio, true);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  const downloadEvidence = async (folio: string) => {
    const { blob, filename } = await getTramiteEvidence(folio, false);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `evidencia-${folio}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    // flags
    user, isAdmin, isLeader, isAnalyst, canAssign, canChangeType, canChangeStatus,

    // listado
    rows, setRows, page, setPage, size, setSize, total, q, setQ, loading, fetchList,

    // catálogos
    tramiteTypes, analysts,

    // row UI
    openFolio, detail, loadingDetail,
    editingType, setEditingType,
    editingStatus, setEditingStatus,
    assigning, setAssigning,
    savingRow,

    // maps
    adeudoMap, montoMap, noficioMap, fileNameMap, uploadingMap, uploadOkMap, uploadErrMap,

    // handlers
    selectRow,
    changeType,
    changeStatus,
    assignTo,
    toggleAdeudo,
    setMonto,
    setNoficio,
    onPickEvidence,
    viewEvidence,
    downloadEvidence,
  };
}

// 🔎 helper
function statusLabel(id: number) {
  switch (id) {
    case 1: return 'Recibido';
    case 2: return 'Asignado';
    case 3: return 'En Proceso';
    case 4: return 'Finalizado';
    case 5: return 'Entregado por ventanilla';
    default: return '—';
  }
}
