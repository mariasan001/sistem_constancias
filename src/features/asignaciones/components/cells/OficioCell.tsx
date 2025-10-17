'use client';
import styles from './OficioCell.module.css'; // ⬅️ nuevo import

type Props = {
  value?: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  maxLength?: number;
  name?: string;
  id?: string;
};

export default function OficioCell({
  value = '',
  onChange,
  onBlur,
  disabled = false,
  maxLength = 40,
  name = 'noficio',
  id = 'noficio',
}: Props) {
  return (
    <input
      className={styles.input}        // ⬅️ usa el CSS propio
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder="Sin número de oficio"
      disabled={disabled}
      maxLength={maxLength}
      name={name}
      id={id}
      inputMode="text"
      autoComplete="off"
      spellCheck={false}
      aria-label="Número de oficio"
    />
  );
}
