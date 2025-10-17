'use client';

import { useAsignaciones } from '@/features/asignaciones/hooks/useAsignaciones';
import styles from './asignaciones.module.css';
import Toolbar from '@/features/asignaciones/components/Toolbar';
import Table from '@/features/asignaciones/components/Table';

export default function AsignacionesPage() {
  const state = useAsignaciones();

  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Asignaciones</h1>
        <p className={styles.subtitle}>Distribución y seguimiento de trámites.</p>
      </header>

      <div className={styles.card}>
        <Toolbar
          q={state.q}
          setQ={state.setQ}
          page={state.page}
          setPage={state.setPage}
          size={state.size}
          setSize={state.setSize}
          total={state.total}
          loading={state.loading}
        />
        <Table state={state} />
      </div>
    </section>
  );
}
