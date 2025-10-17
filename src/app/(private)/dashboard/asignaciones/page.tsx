'use client';

import { useEffect, useState } from 'react';
import styles from './asignaciones.module.css';

// UI (rutas relativas dentro de /asignaciones)
import ColumnsMenu from '@/features/asignaciones/components/ColumnsMenu';
import Table from '@/features/asignaciones/components/Table';
import Pagination from '@/features/asignaciones/components/Pagination';
import { DEFAULT_COLUMNS, type ColumnDef, type ColumnId } from '@/features/asignaciones/components/columns';

// Hook de la feature (export default con parámetros)
import useAsignaciones from '@/features/asignaciones/hooks/useAsignaciones';

// Servicios (datos)
import {
  listTramiteTypes,
  listAnalystsBySubarea,
  getTramiteByFolio,
  changeTramiteType,
  changeTramiteStatus,
  assignTramite,
  getTramiteEvidence,
} from '@/features/asignaciones/tramite.service';
import Toolbar from '@/features/asignaciones/components/Toolbar';
import { useAuthContext } from '@/context/AuthContext';

const LS_COLS = 'asignaciones.columns.v1';

export default function PageAsignaciones() {
  // 👉 Sustituye por Auth real si ya lo tienes
  const subWorkUnitId = undefined as number | undefined;
  const isLeaderOrAdmin = true;
  const canAssign = isLeaderOrAdmin;
  const canChangeType = isLeaderOrAdmin;
  const canChangeStatus = true;
const { user } = useAuthContext();
  // Filtros superiores
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);

  // Hook de lista (usa firma: subWorkUnitId?, onlyUnassigned?, assignedTo?)
  const { rows, setRows, page, setPage, size, setSize, total, q, setQ, loading } =
    useAsignaciones(subWorkUnitId, onlyUnassigned, /* assignedTo */ undefined);

  // Columnas visibles (con persistencia en LS)
  const [columns, setColumns] = useState<ColumnDef[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(LS_COLS) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as ColumnDef[];
        const map = new Map(parsed.map(c => [c.id, c]));
        return DEFAULT_COLUMNS.map(def => map.get(def.id) ?? def);
      }
    } catch {}
    return DEFAULT_COLUMNS;
  });

  useEffect(() => {
    try { localStorage.setItem(LS_COLS, JSON.stringify(columns)); } catch {}
  }, [columns]);

  const toggleColumn = (id: ColumnId, visible: boolean) => {
    setColumns(cols => cols.map(c => (c.id === id ? { ...c, visible } : c)));
  };

  // Catálogos
  const [tramiteTypes, setTramiteTypes] = useState<{ id:number; descArea:string }[]>([]);
  const [analysts, setAnalysts] = useState<{ userId:string; name:string }[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const [types, people] = await Promise.all([
          listTramiteTypes(),
          subWorkUnitId ? listAnalystsBySubarea(subWorkUnitId) : Promise.resolve([]),
        ]);
        setTramiteTypes(types);
        setAnalysts(people);
      } catch {}
    })();
  }, [subWorkUnitId]);

  // UI por fila
  const [assigningFolio, setAssigningFolio] = useState<string | null>(null);
  const [editingTypeFolio, setEditingTypeFolio] = useState<string | null>(null);
  const [editingStatusFolio, setEditingStatusFolio] = useState<string | null>(null);
  const [rowSaving, setRowSaving] = useState<string | null>(null);

  const [adeudoMap, setAdeudoMap] = useState<Record<string, boolean>>({});
  const [montoMap, setMontoMap]   = useState<Record<string, string>>({});
  const [noficioMap, setNoficioMap] = useState<Record<string, string>>({});

  const [fileNameMap, setFileNameMap] = useState<Record<string, string>>({});
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [uploadOkMap, setUploadOkMap] = useState<Record<string, boolean>>({});
  const [uploadErrMap, setUploadErrMap] = useState<Record<string, string>>({});

  // Detalle
  const [selectedFolio, setSelectedFolio] = useState<string | null>(null);
  const [selectedData, setSelectedData]   = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const visibleRows = rows;

  // Actions
  const onSelect = async (folio: string) => {
    setSelectedFolio(prev => (prev === folio ? null : folio));
    if (selectedFolio === folio) return;
    setLoadingDetail(true);
    try {
      const detail = await getTramiteByFolio(folio);
      setSelectedData(detail);
    } catch {
      setSelectedData(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const onTypeChange = async (folio: string, newTypeId: number) => {
    setRowSaving(folio);
    try {
      await changeTramiteType(folio, newTypeId, '');
      setRows(prev =>
        prev.map(r =>
          r.folio === folio
            ? {
                ...r,
                tramiteTypeId: newTypeId,
                tramiteTypeDesc: tramiteTypes.find(t => t.id === newTypeId)?.descArea ?? r.tramiteTypeDesc,
              }
            : r
        )
      );
    } finally {
      setRowSaving(null);
      setEditingTypeFolio(null);
    }
  };

const onStatusChange = async (folio: string, newStatusId: number) => {
  if (!user) return; // o muestra un toast/redirect al login

  setRowSaving(folio);
  try {
    // Si tu flujo de negocio requiere oficio de no adeudo para ciertos estados:
    const oficio = (noficioMap[folio] ?? '').trim();
    const payload: {
      actorUserId: string;
      noficioNoAdeudo?: string;
      evidencia?: File | Blob | null;
      fin_adeudo?: number;
      fin_noficio?: string;
      fin_enAdeudo?: boolean;
    } = {
      actorUserId: user.userId,
      // Ejemplo: solo mandamos noficioNoAdeudo si hay oficio y NO está en adeudo.
      ...(oficio && !(adeudoMap[folio] ?? false) ? { noficioNoAdeudo: oficio } : {}),
    };

    await changeTramiteStatus(folio, newStatusId, payload);

    setRows(prev =>
      prev.map(r =>
        r.folio === folio
          ? { ...r, statusId: newStatusId, statusDesc: statusIdToDesc(newStatusId) }
          : r
      )
    );
  } finally {
    setRowSaving(null);
    setEditingStatusFolio(null);
  }
};

  const onAssign = async (folio: string, userId: string) => {
    setRowSaving(folio);
    try {
      await assignTramite(folio, userId);
      const analyst = analysts.find(a => a.userId === userId);
      setRows(prev =>
        prev.map(r =>
          r.folio === folio
            ? {
                ...r,
                statusId: 2,
                statusDesc: 'Asignado',
                assignedTo: userId,
                assignedToName: analyst?.name ?? userId,
              }
            : r
        )
      );
    } finally {
      setRowSaving(null);
      setAssigningFolio(null);
    }
  };

  const onPickEvidence = async (folio: string, f?: File) => {
    if (!f) return;
    setFileNameMap(m => ({ ...m, [folio]: f.name }));
    setUploadingMap(m => ({ ...m, [folio]: true }));
    setUploadOkMap(m => ({ ...m, [folio]: false }));
    setUploadErrMap(m => ({ ...m, [folio]: '' }));
    try {
      // Aquí iría tu subida real (multipart) si aplica
      await new Promise(res => setTimeout(res, 600));
      setUploadOkMap(m => ({ ...m, [folio]: true }));
    } catch (e: any) {
      setUploadErrMap(m => ({ ...m, [folio]: e?.message ?? 'Error al subir' }));
    } finally {
      setUploadingMap(m => ({ ...m, [folio]: false }));
    }
  };

  const onViewEvidence = (folio: string) => {
    getTramiteEvidence(folio, true).catch(() => {});
  };

  const onDownloadEvidence = (folio: string) => {
    getTramiteEvidence(folio, false).catch(() => {});
  };

  function statusIdToDesc(id?: number) {
    switch (id) {
      case 1: return 'Recibido';
      case 2: return 'Asignado';
      case 3: return 'En Proceso';
      case 5: return 'Entregado por ventanilla';
      default: return '—';
    }
  }

  return (
    <div className={styles.page}>
 
    {/* Header Hero */}
    <header className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>Asignaciones</h1>
        <p className={styles.pageSubtitle}>
          Gestiona tipos, estatus y responsables. Sube evidencia para finalizar y mantén el SLA bajo control.
        </p>
      </div>

   
    </header>

    <div className={styles.headerBar}>
      <Toolbar
        q={q}
        onQ={(v: string) => { setPage(0); setQ(v); }}
        onlyUnassigned={onlyUnassigned}
        onOnlyUnassigned={(v: boolean) => { setPage(0); setOnlyUnassigned(v); }}
        size={size}
        onSize={(n: number) => { setPage(0); setSize(n); }}
      />
      <ColumnsMenu columns={columns} onToggle={toggleColumn} />
    </div>

      <div className={styles.card}>
        <Table
          rows={visibleRows}
          loading={loading}
          columns={columns}
          rowProps={{
            ui: {
              canAssign,
              canChangeType,
              canChangeStatus,
              assigningFolio,
              rowSaving,
              editingTypeFolio,
              setEditingTypeFolio,
              editingStatusFolio,
              setEditingStatusFolio,
              setAssigningFolio,
              adeudoMap, setAdeudoMap,
              montoMap, setMontoMap,
              noficioMap, setNoficioMap,
              fileNameMap,
              uploadingMap,
              uploadOkMap,
              uploadErrMap,
            },
            catalogs: { types: tramiteTypes, analysts },
            actions: {
              onSelect, selectedFolio, selectedData, loadingDetail,
              onTypeChange,
              onStatusChange,
              onAssign,
              onPickEvidence,
              onViewEvidence,
              onDownloadEvidence,
            },
          }}
        />

        <Pagination
          page={page}
          size={size}
          total={total}
          onPage={setPage}
          onSize={(n: number) => { setPage(0); setSize(n); }}
        />
      </div>
    </div>
  );
}


