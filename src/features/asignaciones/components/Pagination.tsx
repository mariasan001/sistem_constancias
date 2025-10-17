// src/app/(private)/dashboard/asignaciones/components/Pagination.tsx
'use client';
import styles from './Pagination.module.css'; // ⬅️ NUEVO

type Props = {
  page: number; size: number; total: number;
  onPage: (p: number) => void;
  onSize: (s: number) => void;
  sizes?: number[];
};

export default function Pagination({ page, size, total, onPage, onSize, sizes=[10,20,30,50] }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  return (
    <div className={styles.root}>
      <div className={styles.info}>
        Página <b>{page + 1}</b> de <b>{totalPages}</b> · <span>{total.toLocaleString()} resultados</span>
      </div>

      <div className={styles.controls}>
        <label className={styles.sizeSel}>
          Tamaño:
          <select value={size} onChange={e => onSize(Number(e.target.value))}>
            {sizes.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>

        <button className={styles.btn} disabled={!canPrev} onClick={() => onPage(0)} title="Primera">«</button>
        <button className={styles.btn} disabled={!canPrev} onClick={() => onPage(page - 1)} title="Anterior">‹</button>
        <button className={styles.btn} disabled={!canNext} onClick={() => onPage(page + 1)} title="Siguiente">›</button>
        <button className={styles.btn} disabled={!canNext} onClick={() => onPage(totalPages - 1)} title="Última">»</button>
      </div>
    </div>
  );
}
