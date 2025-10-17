'use client';
import styles from './AssigneeCell.module.css';

type Analyst = { userId: string; name: string };

export default function AssigneeCell({
  row,
  canEdit,
  analysts,
  assigning,
  setAssigning,
  onAssign,
  saving,
}: {
  row: any;
  canEdit: boolean;
  analysts: Analyst[];
  assigning: boolean;
  setAssigning: (v: boolean) => void;
  onAssign: (uid: string) => void;
  saving: boolean;
}) {
  const value = String(row?.assignedTo ?? '');
  const label = String(row?.assignedToName ?? row?.assignedTo ?? '—');

  if (!canEdit) {
    return <span className={styles.readonly}>{label}</span>;
  }

  if (assigning) {
    return (
      <>
        <select
          autoFocus
          className={styles.select}
          value={value}
          onChange={(e) => onAssign(e.target.value)}
          onBlur={() => setAssigning(false)}
        >
          <option value="">— Selecciona Analista —</option>
          {analysts.map((a) => (
            <option key={a.userId} value={a.userId}>
              {a.name}
            </option>
          ))}
        </select>
        {saving && <small className={styles.muted}>&nbsp;Guardando…</small>}
      </>
    );
  }

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={() => setAssigning(true)}
      title="Cambiar asignación"
      disabled={saving}
    >
      {saving ? 'Guardando…' : (label || 'Asignar')}
    </button>
  );
}
