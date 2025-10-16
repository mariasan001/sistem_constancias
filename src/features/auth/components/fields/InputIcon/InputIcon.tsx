'use client';

import { forwardRef, useId } from 'react';
import type { LucideIcon } from 'lucide-react';
import s from './InputIcon.module.css';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  leftIcon?: LucideIcon;
  rightSlot?: React.ReactNode; // ej. botón ojo
  error?: string | null;
};

const InputIcon = forwardRef<HTMLInputElement, Props>(function InputIcon(
  { label, hint, leftIcon:LeftIcon, rightSlot, error, className, ...rest }, ref
) {
  const id = useId();
  return (
    <div className={s.field}>
      <label className={s.label} htmlFor={id}>{label}</label>
      <div className={`${s.wrapper} ${error ? s.invalid : ''}`}>
        {LeftIcon && (
          <span className={s.iconLeft} aria-hidden>
            <LeftIcon />
          </span>
        )}
        <input id={id} ref={ref} className={s.input} {...rest} />
        {rightSlot && <span className={s.rightSlot}>{rightSlot}</span>}
      </div>
      {error ? (
        <p className={s.error} role="alert">{error}</p>
      ) : hint ? (
        <p className={s.hint}>{hint}</p>
      ) : null}
    </div>
  );
});

export default InputIcon;
