// src/app/(private)/dashboard/asignaciones/components/ColumnsMenu.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import type { ColumnDef, ColumnId } from './columns';
import styles from './ColumnsMenu.module.css'; // ⬅️ NUEVO

type Props = { columns: ColumnDef[]; onToggle: (id: ColumnId, visible: boolean) => void; };

export default function ColumnsMenu({ columns, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const allOn = columns.every(c => c.visible);
  const anyOn = columns.some(c => c.visible);

  return (
    <div className={styles.container} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <span className={styles.icon} aria-hidden>▦</span>
        Columnas
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Configurar columnas">
          <div className={styles.grid}>
            {columns.map(col => (
              <label key={col.id} className={styles.item}>
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={(e) => onToggle(col.id, e.target.checked)}
                />
                <span className={styles.label}>{col.label}</span>
              </label>
            ))}
          </div>

          <div className={styles.actions}>
            <button className={styles.btnGhost} disabled={allOn}
              onClick={() => columns.forEach(c => onToggle(c.id, true))}
            >Mostrar todas</button>

            <button className={styles.btnGhost} disabled={!anyOn}
              onClick={() => columns.forEach(c => onToggle(c.id, false))}
            >Ocultar todas</button>

            <div className={styles.spacer} />
            <button className={styles.btnPrimary} onClick={() => setOpen(false)}>Listo</button>
          </div>
        </div>
      )}
    </div>
  );
}
