'use client';

import React from 'react';
import styles from '../styles/table.module.css';
import cells from '../styles/cells.module.css';

import TypeCell from './cells/TypeCell';
import StatusCell from './cells/StatusCell';
import AssigneeCell from './cells/AssigneeCell';
import MoneyCell from './cells/MoneyCell';
import OficioCell from './cells/OficioCell';
import EvidenceCell from './cells/EvidenceCell';
import DetailPanel from './DetailPanel';

// Si ya tienes ColumnId tipado en ./columns, importa y usa ese.
// Aquí lo dejamos como string para no romper.
type ColumnId = string;

function toTitleCase(s?: string) {
  return (s ?? '').toLowerCase().replace(
    /([\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*)/gu,
    w => w[0].toUpperCase() + w.slice(1)
  );
}

export type RowVM = any;

type Props = {
  t: RowVM;
  cols: number;
  visibleCols: ColumnId[];
  ui: {
    canAssign: boolean;
    canChangeType: boolean;
    canChangeStatus: boolean;

    assigningFolio: string | null;
    rowSaving?: string | null;

    editingTypeFolio: string | null;
    setEditingTypeFolio: (v: string | null) => void;

    editingStatusFolio: string | null;
    setEditingStatusFolio: (v: string | null) => void;

    setAssigningFolio?: (v: string | null) => void;

    adeudoMap: Record<string, boolean>;
    setAdeudoMap: (updater: (m: Record<string, boolean>) => Record<string, boolean>) => void;

    montoMap: Record<string, string>;
    setMontoMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;

    noficioMap: Record<string, string>;
    setNoficioMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;

    fileNameMap: Record<string, string>;
    uploadingMap: Record<string, boolean>;
    uploadOkMap: Record<string, boolean>;
    uploadErrMap: Record<string, string>;
  };
  catalogs: {
    types: { id: number; descArea: string }[];
    analysts: { userId: string; name: string }[];
  };
  actions: {
    onSelect: (folio: string) => void;
    selectedFolio: string | null;
    selectedData: any;
    loadingDetail: boolean;

    onTypeChange: (folio: string, newTypeId: number) => void;
    onStatusChange: (folio: string, newStatusId: number) => void;
    onAssign: (folio: string, userId: string) => void;

    onPickEvidence: (folio: string, f?: File) => void;
    onViewEvidence: (folio: string) => void;
    onDownloadEvidence: (folio: string) => void;
  };
};

export default function Row({ t, cols, visibleCols, ui, catalogs, actions }: Props) {
  const show = (id: ColumnId) => visibleCols.includes(id);

  // Estados por-fila (normalizados)
  const enAdeudo  = (t as any).enadeudo ?? ui.adeudoMap[t.folio] ?? false;
  const montoVal  = ui.montoMap[t.folio] ?? ((t as any).adeudo != null ? String((t as any).adeudo) : '');
  const picked    = ui.fileNameMap[t.folio];
  const noficio   = ui.noficioMap[t.folio] ?? (t as any).noficio ?? '';
  const isUploading = !!ui.uploadingMap[t.folio];

  return (
    <>
      <tr>
        {show('folio') && (
          <td
            className={`${styles.clickable} ${styles.stickyCell}`}
            onClick={() => actions.onSelect(t.folio)}
            style={{ left: 0 }}
            data-col="folio"
          >
            {t.folio}
          </td>
        )}

        {show('tipo') && (
          <td>
            <TypeCell
              // usamos la firma "plana" (híbrida también acepta row)
              typeId={t.tramiteTypeId}
              typeDesc={t.tramiteTypeDesc}
              canEdit={ui.canChangeType}
              editing={ui.editingTypeFolio === t.folio}
              types={catalogs.types}
              onEdit={() => ui.setEditingTypeFolio(t.folio)}
              onChange={(id) => actions.onTypeChange(t.folio, id)}
              onCancel={() => ui.setEditingTypeFolio(null)}
            />
          </td>
        )}

        {show('estatus') && (
          <td>
            <StatusCell
              statusId={t.statusId}
              statusDesc={t.statusDesc}
              canEdit={ui.canChangeStatus}
              editing={ui.editingStatusFolio === t.folio}
              onEdit={() => ui.setEditingStatusFolio(t.folio)}
              onChange={(id) => actions.onStatusChange(t.folio, id)}
              onCancel={() => ui.setEditingStatusFolio(null)}
            />
          </td>
        )}

        {show('asignadoA') && (
          <td>
            <AssigneeCell
              // usamos tu firma legacy basada en row
              row={t}
              canEdit={ui.canAssign}
              analysts={catalogs.analysts}
              assigning={ui.assigningFolio === t.folio}
              setAssigning={(v) => ui.setAssigningFolio?.(v ? t.folio : null)}
              onAssign={(uid) => actions.onAssign(t.folio, uid)}
              saving={ui.rowSaving === t.folio}
            />
          </td>
        )}

        {show('asigno') && (
          <td>{toTitleCase(t.assignedByName ?? t.assignedBy ?? '—')}</td>
        )}

        {show('solicitante') && (
          <td>
            {t.requesterId}
            {t.requesterName ? ` — ${toTitleCase(t.requesterName)}` : ''}
          </td>
        )}

        {show('creado') && (
          <td>{new Date(t.createdAt).toLocaleString()}</td>
        )}

        {show('enAdeudo') && (
          <td>
            <button
              type="button"
              className={cells.adeudoSwitch}
              data-yn={enAdeudo ? 'si' : 'no'}
              aria-pressed={enAdeudo}
              title={enAdeudo ? 'Sí en adeudo' : 'No en adeudo'}
              onClick={() => ui.setAdeudoMap((m) => ({ ...m, [t.folio]: !enAdeudo }))}
            />
          </td>
        )}

        {show('monto') && (
          <td>
            <MoneyCell
              value={montoVal}
              onChange={(raw) => {
                const cleaned = raw.replace(/[^\d.-]/g, '');
                ui.setMontoMap((m) => ({ ...m, [t.folio]: cleaned }));
              }}
              onBlur={() => {
                const raw = ui.montoMap[t.folio] ?? '';
                const num = Number(String(raw).replace(/[^\d.-]/g, '')) || 0;
                ui.setMontoMap((m) => ({
                  ...m,
                  [t.folio]: num.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }),
                }));
              }}
            />
          </td>
        )}

        {show('noficio') && (
          <td>
            <OficioCell
              value={noficio}
              onChange={(v) => ui.setNoficioMap((m) => ({ ...m, [t.folio]: v }))}
            />
          </td>
        )}

        {show('evidencia') && (
          <td>
            <EvidenceCell
              // usamos la firma "plana" (el componente ya es híbrido)
              folio={t.folio}
              fileName={picked}
              isUploading={isUploading}
              ok={ui.uploadOkMap[t.folio]}
              error={ui.uploadErrMap[t.folio]}
              onPick={(f) => actions.onPickEvidence(t.folio, f)}
              onView={() => actions.onViewEvidence(t.folio)}
              onDownload={() => actions.onDownloadEvidence(t.folio)}
            />
          </td>
        )}

        {show('vence') && (
          <td>{(t as any).dueDate ? new Date((t as any).dueDate).toLocaleDateString() : '—'}</td>
        )}

        {show('tiempo') && (
          <td>
            {/* Si usas SlaCells: */}
            {/* <SlaDue dueDate={(t as any).dueDate} /> */}
            {/* <SlaBadge label={(t as any).slaLabel} remainingDays={(t as any).remainingDays} /> */}
            {/* O simplemente muestra label si aún no conectas SlaCells: */}
            {(t as any).slaLabel ?? '—'}
          </td>
        )}
      </tr>

      {actions.selectedFolio === t.folio && (
        <tr className={styles.detailRow}>
          <td colSpan={cols}>
            {/* DetailPanel espera { loading, detail } */}
            <DetailPanel detail={actions.selectedData} loading={actions.loadingDetail} />
          </td>
        </tr>
      )}
    </>
  );
}
