'use client';
import c from '../../styles/cells.module.css';

export default function EvidenceCell({ row, picked, uploading, uploaded, error, onPick, onView, onDownload }:{
  row:any; picked?:string; uploading:boolean; uploaded:boolean; error?:string;
  onPick:(f?:File)=>void; onView:()=>void; onDownload:()=>void;
}) {
  const id = `file-${row.folio}`;
  return (
    <div className={c.uploadRow}>
      <input id={id} type="file" style={{display:'none'}} onChange={(e)=>{const f=e.currentTarget.files?.[0]; onPick(f); e.currentTarget.value='';}} />
      <label htmlFor={id} className={c.uploadBtn} aria-disabled={uploading}><i className={c.clip}></i> Subir</label>
      {picked ? <span className={c.fileName}>{picked}</span> : <span className={c.muted}>Sin evidencia</span>}
      {picked && !uploading && (
        <>
          <button type="button" className={c.linkBtn} onClick={onView}>Ver</button>
          <button type="button" className={c.linkBtn} onClick={onDownload}>Descargar</button>
        </>
      )}
      {uploading && <span className={c.uploadInfo}>Subiendo…</span>}
      {uploaded && !uploading && <span className={c.uploadOk}>✓ Subido</span>}
      {error && !uploading && <span className={c.uploadErr}>⚠ {error}</span>}
    </div>
  );
}
