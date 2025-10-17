// src/app/(private)/dashboard/asignaciones/components/cells/SlaCells.tsx
'use client';

import styles from './SlaCells.module.css'; // antes: '../../../styles/cells.module.css'

export function formatDateShort(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
}
export function normalizeSla(label?: string | null): 'en-tiempo' | 'por-vencer' | 'vencido' | 'desconocido' {
  const t = (label ?? '').trim().toLowerCase();
  if (t.includes('vencid')) return 'vencido';
  if (t.includes('por vencer') || t.includes('por-vencer')) return 'por-vencer';
  if (t.includes('tiempo')) return 'en-tiempo';
  return 'desconocido';
}

export function SlaDue({ dueDate }: { dueDate?: string | null }) {
  return <span>{formatDateShort(dueDate)}</span>;
}

export function SlaBadge({ label, remainingDays }: { label?: string | null; remainingDays?: number | null }) {
  const v = normalizeSla(label);
  const text = `${label ?? '—'}${Number.isFinite(remainingDays) ? ` (${remainingDays} d)` : ''}`;
  return <span className={styles.badge} data-variant={v}>{text}</span>;
}
