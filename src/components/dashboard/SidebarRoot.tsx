'use client';

import { SidebarProvider } from '@/context/SidebarContext';
import styles from '@/app/(private)/layout.module.css';
import Sidebar from './dashboard';

export default function SidebarRoot({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className={styles.shell}>
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.surface}>{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
