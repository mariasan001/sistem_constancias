'use client';
import styles from './EvidenceCell.module.css'; // ⬅️ antes: '../../styles/cells.module.css'

type PropsLegacy = {
  row: any;
  picked?: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  onPick: (f?: File) => void;
  onView: () => void;
  onDownload: () => void;
};

type PropsFlat = {
  folio: string;
  fileName?: string;
  isUploading: boolean;
  ok?: boolean;
  error?: string;
  onPick: (f?: File) => void;
  onView: () => void;
  onDownload: () => void;
};

type Props = PropsLegacy | PropsFlat;

function isLegacy(p: Props): p is PropsLegacy {
  return (p as any)?.row !== undefined;
}

export default function EvidenceCell(props: Props) {
  // Normaliza props para una sola renderización
  const folio = isLegacy(props)
    ? String(props.row?.folio ?? props.row?.id ?? 'row')
    : props.folio;

  const fileName   = isLegacy(props) ? props.picked       : props.fileName;
  const uploading  = isLegacy(props) ? props.uploading    : props.isUploading;
  const uploadedOk = isLegacy(props) ? props.uploaded     : !!props.ok;
  const error      = props.error;

  const { onPick, onView, onDownload } = props;
  const inputId = `file-${folio}`;

  return (
 <div className={styles.row}>
  <input id={inputId} type="file" className={styles.hiddenFile}
    onChange={(e) => { const f = (e.currentTarget as HTMLInputElement).files?.[0]; onPick(f); (e.currentTarget as HTMLInputElement).value=''; }} />

  <label htmlFor={inputId} className={styles.uploadBtn} aria-disabled={uploading}>
    <i className={styles.clip}></i> Subir
  </label>

  {fileName
    ? <span className={styles.fileName}>{fileName}</span>
    : <span className={styles.muted}>Sin evidencia</span>}

  {fileName && !uploading && (
    <>
      <button type="button" className={styles.linkBtn} onClick={onView}>Ver</button>
      <button type="button" className={styles.linkBtn} onClick={onDownload}>Descargar</button>
    </>
  )}

  {uploading   && <span className={styles.uploadInfo}>Subiendo…</span>}
  {uploadedOk  && !uploading && <span className={styles.uploadOk}>✓ Subido</span>}
  {error       && !uploading && <span className={styles.uploadErr}>⚠ {error}</span>}
</div>

  );
}
