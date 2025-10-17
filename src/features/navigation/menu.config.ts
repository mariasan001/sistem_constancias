// src/features/navigation/menu.config.ts
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

import {
  BarChart3,
  ClipboardList,       // asignaciones / tareas
  Clock3,              // edición de tiempos
  LifeBuoy,            // apoyo a áreas
  UserPlus,            // alta de usuarios
  History,             // histórico laboral
  ReceiptText,         // recibos
  Trophy,              // ranking personal
  PackageCheck,        // entregas / listos para entrega
  RefreshCcw,          // actualizados
} from 'lucide-react';

export type RoleCode =
  | 'ADMIN'
  | 'LIDER'
  | 'ANALISTA'
  | 'VENTANILLA'
  | 'USER';

export type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<LucideProps>;
  roles: RoleCode[];
  feature?: string; // por si luego prendes/apagas features
};

/**
 * NOTA:
 * - "Configuración" se removió del menú principal; ahora está en el bloque de acciones del sidebar.
 * - Las rutas son sugeridas y coherentes; si ya tienes páginas listas con otras rutas,
 *   cambia el `href` sin problema.
 */
export const MENU_ITEMS: MenuItem[] = [
  /* ===== ADMIN ===== */
  { id: 'estadisticas',  label: 'Estadísticas',        href: '/dashboard/estadisticas', icon: BarChart3,   roles: ['ADMIN', 'LIDER'] },
  { id: 'asignaciones',  label: 'Asignaciones',        href: '/dashboard/asignaciones', icon: ClipboardList, roles: ['ADMIN', 'LIDER', 'ANALISTA'] },
  { id: 'edicion-tiempos', label: 'Edición de tiempos', href: '/dashboard/tiempos',      icon: Clock3,      roles: ['ADMIN'] },
  { id: 'apoyo-areas',   label: 'Apoyo a áreas',       href: '/dashboard/apoyo-areas',   icon: LifeBuoy,    roles: ['ADMIN'] },

  /* ===== LÍDER ===== */
  { id: 'alta-usuarios', label: 'Alta de usuarios',    href: '/dashboard/usuarios/crear', icon: UserPlus,   roles: ['LIDER'] },
  { id: 'historico',     label: 'Histórico laboral',   href: '/dashboard/historico',     icon: History,     roles: ['LIDER', 'ANALISTA'] },
  { id: 'recibos',       label: 'Recibos',             href: '/dashboard/recibos',       icon: ReceiptText, roles: ['LIDER', 'ANALISTA'] },

  /* ===== ANALISTA ===== */
  { id: 'mis-tareas',    label: 'Mis tareas',          href: '/dashboard/mis-tareas',    icon: ClipboardList, roles: ['ANALISTA'] },
  { id: 'ranking',       label: 'Ranking personal',    href: '/dashboard/ranking',       icon: Trophy,      roles: ['ANALISTA'] },
  { id: 'entregas',      label: 'Entregas',            href: '/dashboard/entregas',      icon: PackageCheck, roles: ['ANALISTA'] },

  /* ===== VENTANILLA ===== */
  { id: 'listos-entrega', label: 'Listos para entrega', href: '/dashboard/altas-entregas', icon: PackageCheck, roles: ['VENTANILLA'] },
  { id: 'actualizados',   label: 'Actualizados',        href: '/dashboard/actualizados',   icon: RefreshCcw,   roles: ['VENTANILLA'] },

  /* ===== USER (básico) ===== */
  { id: 'altas',         label: 'Altas',               href: '/dashboard/altas',         icon: ClipboardList, roles: ['USER'] },
];
