'use client';
import styles from './TypeCell.module.css'; // antes: '../../styles/cells.module.css'

type TypeOpt = { id: number; descArea: string };

// Firma 1 (tu snippet actual)
type PropsRow = {
  row: any;
  canEdit: boolean;
  types: TypeOpt[];
  editing: boolean;
  setEditing: (v: boolean) => void;
  onChange: (id: number) => void;
};

// Firma 2 (plana, la que propuse antes)
type PropsFlat = {
  typeId: number;
  typeDesc: string;
  canEdit: boolean;
  editing: boolean;
  types: TypeOpt[];
  onEdit: () => void;
  onChange: (id: number) => void;
  onCancel: () => void;
};

type Props = PropsRow | PropsFlat;

function toTitleCase(s?: string) {
  return (s ?? '').toLowerCase().replace(
    /([\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*)/gu,
    w => w[0].toUpperCase() + w.slice(1)
  );
}

export default function TypeCell(props: Props) {
  // Normalización de valores
  const typeId   = 'row' in props ? Number(props.row?.tramiteTypeId ?? 0) : props.typeId;
  const typeDesc = 'row' in props ? String(props.row?.tramiteTypeDesc ?? '') : props.typeDesc;
  const canEdit  = props.canEdit;
  const editing  = props.editing;
  const types    = props.types ?? [];

  // Normalización de handlers
  const onEdit   = 'row' in props ? () => props.setEditing(true) : props.onEdit;
  const onCancel = 'row' in props ? () => props.setEditing(false) : props.onCancel;

  const onChange = (id: number) => {
    props.onChange(id);
  };

  // data-attr para estilos por tipo
  const dataAttr = String(typeDesc || '').toLowerCase().replace(/\s+/g, '-');

  // Render no editable
  if (!canEdit) {
    return (
      <span className={styles.typePill} data-type={dataAttr}>
        {toTitleCase(typeDesc) || '—'}
      </span>
    );
  }

  // Modo edición
  if (editing) {
    return (
      <select
        autoFocus
        className={styles.select}
        value={typeId}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={onCancel}
      >
        {types.map(t => (
          <option key={t.id} value={t.id}>{toTitleCase(t.descArea)}</option>
        ))}
      </select>
    );
  }

  // Modo display con botón para entrar a edición
  return (
    <button
      className={styles.typePill}
      data-type={dataAttr}
      onClick={onEdit}
      title="Cambiar tipo"
      type="button"
    >
      {toTitleCase(typeDesc) || 'Seleccionar tipo'}
    </button>
  );
}
