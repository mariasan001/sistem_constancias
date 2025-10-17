'use client';
import c from '../../styles/cells.module.css';

export default function OficioCell({ value, onChange }:{ value?:string; onChange:(v:string)=>void }) {
  return <input className={c.noficioInput} value={value ?? ''} onChange={(e)=>onChange(e.target.value)} placeholder="Sin número de oficio" />;
}
