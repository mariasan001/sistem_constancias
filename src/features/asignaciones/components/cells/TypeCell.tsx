'use client';
import c from '../../styles/cells.module.css';

export default function TypeCell({ row, canEdit, types, editing, setEditing, onChange }:{
  row:any; canEdit:boolean; types:any[]; editing:boolean; setEditing:(v:boolean)=>void; onChange:(id:number)=>void;
}) {
  const typeAttr = String(row.tramiteTypeDesc||'').toLowerCase().replace(/\s+/g,'-');
  if (!canEdit) return <span className={c.typePill} data-type={typeAttr}>{row.tramiteTypeDesc}</span>;
  return editing ? (
    <select autoFocus value={row.tramiteTypeId} onChange={e=>onChange(Number(e.target.value))} onBlur={()=>setEditing(false)}>
      {types.map((t:any)=><option key={t.id} value={t.id}>{t.descArea}</option>)}
    </select>
  ) : (
    <button className={c.typePill} data-type={typeAttr} onClick={()=>setEditing(true)}>{row.tramiteTypeDesc}</button>
  );
}
