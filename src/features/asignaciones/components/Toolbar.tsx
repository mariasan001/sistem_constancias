'use client';
import s from '../styles/asignaciones.module.css';

export default function Toolbar({ q, setQ, page, setPage, size, setSize, total, loading }:{
  q:string; setQ:(v:string)=>void; page:number; setPage:(n:number)=>void; size:number; setSize:(n:number)=>void; total:number; loading:boolean;
}) {
  const pages = Math.max(1, Math.ceil(total / Math.max(1, size)));
  return (
    <div className={s.toolbar}>
      <input
        className={s.search}
        placeholder="Buscar por folio, solicitante…"
        value={q}
        onChange={(e)=>setQ(e.target.value)}
      />
      <div className={s.toolsRight}>
        <span className={s.muted}>{loading ? 'Cargando…' : `${total} resultados`}</span>
        <select value={size} onChange={(e)=>setSize(Number(e.target.value))} className={s.pageSize}>
          {[10,20,50].map(n=><option key={n} value={n}>{n}/página</option>)}
        </select>
        <button className={s.pagerBtn} disabled={page<=0} onClick={()=>setPage(page-1)}>◀</button>
        <span className={s.muted}>{page+1}/{pages}</span>
        <button className={s.pagerBtn} disabled={page+1>=pages} onClick={()=>setPage(page+1)}>▶</button>
      </div>
    </div>
  );
}
