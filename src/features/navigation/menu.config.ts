// src/features/navigation/menu.config.ts
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  BarChart3, UserPlus, ClipboardList, FileCheck2, FilePlus2, ListChecks, Settings
} from 'lucide-react';

export type RoleCode = 'ADMIN' | 'LIDER' | 'ANALISTA' | 'VENTANILLA' | 'USER';

export type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<LucideProps>;
  roles: RoleCode[];
  feature?: string; // por si luego prendes/apagas features
};

export const MENU_ITEMS: MenuItem[] = [
  { id:'estadisticas', label:'Estadísticas', href:'/dashboard/estadisticas', icon:BarChart3,  roles:['ADMIN','LIDER'] },
  { id:'crear-usuarios',label:'Crear usuarios', href:'/dashboard/usuarios/crear', icon:UserPlus,   roles:['LIDER'] },
  { id:'asignaciones',  label:'Asignaciones',   href:'/dashboard/asignaciones',   icon:ClipboardList, roles:['LIDER','ADMIN','ANALISTA'] },
  { id:'altas-entregas',label:'Altas y entregas', href:'/dashboard/altas-entregas', icon:FileCheck2, roles:['VENTANILLA'] },
  { id:'altas',         label:'Altas',          href:'/dashboard/altas',          icon:FilePlus2,  roles:['USER'] },
  { id:'bitacora',      label:'Bitácora',       href:'/dashboard/bitacora',       icon:ListChecks, roles:['ADMIN'] },
  { id:'configuracion', label:'Configuración',  href:'/dashboard/configuracion',  icon:Settings,   roles:['ADMIN'] },
];
