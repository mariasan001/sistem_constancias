// src/app/(private)/dashboard/asignaciones/components/Table.tsx
'use client';

import styles from '../styles/table.module.css';
import Row from './Row';
import type { ColumnDef, ColumnId } from './columns';

// 👇 RowProps que comparte Table con Row (sin t/cols/visibleCols)
type RowSharedProps = Omit<
  Parameters<typeof Row>[0],
  't' | 'cols' | 'visibleCols'
>;

export type TableProps = {
  rows: any[];
  loading: boolean;
  columns: ColumnDef[];
  rowProps: RowSharedProps; // 👈 ya no puede traer t
};

export default function Table({ rows, loading, columns, rowProps }: TableProps) {
  const visible = columns.filter(c => c.visible);
  const colCount = visible.length;

  return (
    <div className={styles.tableWrap} role="region" aria-label="Tabla de asignaciones">
      <table className={styles.table}>
        <colgroup>
          {visible.map((c) => (
            <col key={c.id} style={{ width: c.width }} />
          ))}
        </colgroup>

        <thead>
          <tr>
            {visible.map((c) => (
              <th
                key={c.id}
                className={c.sticky ? styles.stickyHead : undefined}
                style={c.sticky ? { left: 0 } : undefined}
                data-col={c.id}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr><td colSpan={colCount}>Cargando…</td></tr>
          ) : rows.length ? (
            rows.map((t) => (
              <Row
                key={t.id}
                t={t}                               // ✅ solo aquí va t
                cols={colCount}
                visibleCols={visible.map(v => v.id as ColumnId)}
                {...rowProps}                      // ✅ ya NO contiene t
              />
            ))
          ) : (
            <tr><td colSpan={colCount}>Sin resultados</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
