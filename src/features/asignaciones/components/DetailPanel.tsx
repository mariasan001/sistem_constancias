// src/app/(private)/dashboard/asignaciones/components/DetailPanel.tsx
'use client';
import s from './DetailPanel.module.css'; // ⬅️ NUEVO

export default function DetailPanel({ loading, detail }:{ loading:boolean; detail:any }) {
  if (loading) return <div className={s.box}>Cargando detalle…</div>;
  if (!detail) return null;

  const h = detail.history;
  return (
    <div className={s.box}>
      <h4 className={s.title}>Detalle del trámite</h4>

      <div className={s.grid}>
        <p><b>Tipo:</b> {h.tramiteType}</p>
        <p><b>Solicitante:</b> {h.userName} ({h.userId})</p>
        <p><b>Estatus actual:</b> {h.currentStatus}</p>
        <p><b>Creado:</b> {new Date(h.createdAt).toLocaleString()}</p>
      </div>

      <div className={s.columns}>
        <div>
          <h5>Historial</h5>
          {h.history?.length ? (
            <ul className={s.timeline}>
              {h.history.map((x:any,i:number)=>(
                <li key={i} className={s.timelineItem}>
                  <span className={s.timelineDot} />
                  <div>
                    <div className={s.timelineLine}>{x.fromStatus} → {x.toStatus}</div>
                    <small className={s.muted}>Por {x.changedBy} · {new Date(x.changedAt).toLocaleString()}</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className={s.muted}>Sin historial</p>}
        </div>

        <div>
          <h5>Documentos</h5>
          {detail.docs?.length ? (
            <ul className={s.docs}>
              {detail.docs.map((d:any)=>(
                <li key={d.id} className={s.docRow}>
                  <a href={d.downloadUrl} target="_blank" rel="noopener noreferrer" className={s.docLink}>
                    {d.originalName}
                  </a>
                  <small className={s.muted}>· {Math.round((d.sizeBytes||0)/1024)} KB · {new Date(d.uploadedAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          ) : <p className={s.muted}>Sin documentos</p>}
        </div>
      </div>
    </div>
  );
}
