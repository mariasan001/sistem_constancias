'use client';
import s from '../styles/asignaciones.module.css';

export default function DetailPanel({ loading, detail }:{ loading:boolean; detail:any }) {
  if (loading) return <div className={s.detailBox}>Cargando detalle…</div>;
  if (!detail) return null;

  const h = detail.history;
  return (
    <div className={s.detailBox}>
      <h4 className={s.detailTitle}>Detalle del trámite</h4>

      <div style={{display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))'}}>
        <p><b>Tipo:</b> {h.tramiteType}</p>
        <p><b>Solicitante:</b> {h.userName} ({h.userId})</p>
        <p><b>Estatus actual:</b> {h.currentStatus}</p>
        <p><b>Creado:</b> {new Date(h.createdAt).toLocaleString()}</p>
      </div>

      <div style={{display:'grid', gap:16, gridTemplateColumns:'1fr 1fr'}}>
        <div>
          <h5>Historial</h5>
          {h.history?.length ? (
            <ul style={{listStyle:'none', padding:0, margin:0}}>
              {h.history.map((x:any,i:number)=>(
                <li key={i} style={{display:'flex', gap:8, margin:'8px 0'}}>
                  <span style={{width:8, height:8, marginTop:6, background:'var(--brand,#9f2141)', borderRadius:999}} />
                  <div>
                    <div style={{fontWeight:600}}>{x.fromStatus} → {x.toStatus}</div>
                    <small style={{color:'#667085'}}>Por {x.changedBy} · {new Date(x.changedAt).toLocaleString()}</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p style={{color:'#667085'}}>Sin historial</p>}
        </div>

        <div>
          <h5>Documentos</h5>
          {detail.docs?.length ? (
            <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:8}}>
              {detail.docs.map((d:any)=>(
                <li key={d.id} style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
                 
                  <a href={d.downloadUrl} target="_blank" rel="noopener noreferrer" style={{textDecoration:'underline'}}>
                    {d.originalName}
                  </a>
                  <small style={{color:'#667085'}}>· {Math.round((d.sizeBytes||0)/1024)} KB · {new Date(d.uploadedAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          ) : <p style={{color:'#667085'}}>Sin documentos</p>}
        </div>
      </div>
    </div>
  );
}
