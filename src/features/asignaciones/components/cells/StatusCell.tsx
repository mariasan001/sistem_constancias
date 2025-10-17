'use client';
import c from '../../styles/cells.module.css';

export default function AssigneeCell({ row, canEdit, analysts, assigning, setAssigning, onAssign, saving }:{
  row:any; canEdit:boolean; analysts:any[]; assigning:boolean; setAssigning:(v:boolean)=>void; onAssign:(uid:string)=>void; saving:boolean;
}) {
  if (!canEdit) return <>{row.assignedToName ?? row.assignedTo ?? '—'}</>;
  return assigning ? (
    <select autoFocus className={c.assigneeSelect} value={row.assignedTo ?? ''} onChange={(e)=>onAssign(e.target.value)} onBlur={()=>setAssigning(false)}>
      <option value="">— Selecciona Analista —</option>
      {analysts.map((a:any)=><option key={a.userId} value={a.userId}>{a.name}</option>)}
    </select>
  ) : (
    <button className={c.assigneeBtn} onClick={()=>setAssigning(true)}>
      {saving ? 'Guardando…' : (row.assignedToName ?? 'Asignar')}
    </button>
  );
}
