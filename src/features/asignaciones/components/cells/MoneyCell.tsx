'use client';
import c from '../../styles/cells.module.css';

export default function MoneyCell({ value, onChange }:{ value?:string; onChange:(v:string)=>void }) {
  return (
    <span className={c.money}>
      <span>$</span>
      <input value={value ?? ''} onChange={(e)=>onChange(e.target.value)} inputMode="decimal" placeholder="0.00" />
    </span>
  );
}
