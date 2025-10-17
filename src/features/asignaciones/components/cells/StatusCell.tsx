'use client';

import styles from './StatusCell.module.css'; // antes: '../../styles/cells.module.css'

function toTitleCase(s?: string) {
  return (s ?? '').toLowerCase().replace(
    /([\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*)/gu,
    w => w[0].toUpperCase() + w.slice(1)
  );
}

// ===== Firmas =====
type PropsLegacy = {
  row: any;
  canEdit: boolean;
  editing: boolean;
  setEditing: (v: boolean) => void;
  onChange: (newId: number) => void;
};

type PropsFlat = {
  statusId: number;
  statusDesc: string;
  canEdit: boolean;
  editing: boolean;
  onEdit: () => void;
  onChange: (newId: number) => void;
  onCancel: () => void;
};

type Props = PropsLegacy | PropsFlat;
function isLegacy(p: Props): p is PropsLegacy { return (p as any)?.row !== undefined; }

export default function StatusCell(props: Props) {
  const canEdit = props.canEdit;
  const editing = props.editing;

  const statusId = isLegacy(props) ? Number(props.row?.statusId ?? 0) : props.statusId;
  const statusDesc = isLegacy(props) ? String(props.row?.statusDesc ?? '') : props.statusDesc;

  const onEdit   = isLegacy(props) ? () => props.setEditing(true)  : props.onEdit;
  const onCancel = isLegacy(props) ? () => props.setEditing(false) : props.onCancel;

  const variant = String(statusDesc || '').toLowerCase();

  if (!canEdit) {
    return (
      <span className={styles.badge} data-variant={variant}>
        <span className={styles.dot} /> {toTitleCase(statusDesc) || '—'}
      </span>
    );
  }

  if (editing) {
    return (
      <select
        autoFocus
        className={styles.select}
        value={statusId}
        onChange={(e) => props.onChange(Number(e.target.value))}
        onBlur={onCancel}
      >
        <option value={1}>Recibido</option>
        <option value={2}>Asignado</option>
        <option value={3}>En Proceso</option>
        <option value={5}>Entregado por ventanilla</option>
      </select>
    );
  }

  return (
    <button
      className={styles.badge}
      data-variant={variant}
      onClick={onEdit}
      title="Cambiar estatus"
      type="button"
    >
      <span className={styles.dot} /> {toTitleCase(statusDesc) || '—'}
    </button>
  );
}
