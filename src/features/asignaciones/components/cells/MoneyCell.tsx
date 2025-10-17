'use client';
import styles from './MoneyCell.module.css'; // ⬅️ nuevo

type Props = {
  value?: string | number;
  onChange: (v: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  name?: string;
  id?: string;
};

export default function MoneyCell({
  value = '',
  onChange,
  onBlur,
  disabled = false,
  placeholder = '0.00',
  name = 'monto',
  id = 'monto',
}: Props) {
  return (
    <span className={styles.wrap}>
      <span className={styles.currency}>$</span>
      <input
        className={styles.input}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        inputMode="decimal"
        placeholder={placeholder}
        disabled={disabled}
        name={name}
        id={id}
        autoComplete="off"
        spellCheck={false}
        aria-label="Monto"
        pattern="[0-9]*[.,]?[0-9]*"
      />
    </span>
  );
}
