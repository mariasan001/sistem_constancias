// src/components/dashboard/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Bell, Settings, LogOut } from 'lucide-react';
import { MENU_ITEMS, type RoleCode } from '@/features/navigation/menu.config';
import s from './sidebar.module.css';

export default function Sidebar(){
  const pathname = usePathname();
  const { user, logout } = useAuthContext();

  const roleSet = useMemo(() => {
    const codes = (user?.roles ?? [])
      .map(r => (r.description ?? '').toUpperCase().trim())
      .filter(Boolean) as RoleCode[];
    return new Set<RoleCode>(codes.length ? codes : ['USER']);
  }, [user]);

  const menu = useMemo(
    () => MENU_ITEMS.filter(i => i.roles.some(r => roleSet.has(r))),
    [roleSet]
  );

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className={s.aside}>
      <div className={s.rail}>
        <div className={s.brand}><img src="/img/flor-2.png" alt="Marca" /></div>
        <div className={s.menuLabel}>MENU</div>

        <nav className={s.nav} aria-label="Navegación principal">
          {menu.map(({ id, href, label, icon:Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={id}
                href={href}
                className={`${s.item} ${active ? s.active : ''}`}
                aria-label={label}
              >
                <span className={s.activeRail} aria-hidden />
                <Icon className={s.icon} />
                <span className={s.tooltip}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={s.menuLabel}>ACCIONES</div>
        <div className={s.bottom}>
          <button className={s.item} aria-label="Notificaciones">
            <span className={s.activeRail} aria-hidden />
            <Bell className={s.icon} />
            <span className={s.tooltip}>Notificaciones</span>
          </button>
          <Link className={s.item} href="/dashboard/configuracion" aria-label="Configuración">
            <span className={s.activeRail} aria-hidden />
            <Settings className={s.icon} />
            <span className={s.tooltip}>Configuración</span>
          </Link>
          <button className={s.item} onClick={logout} aria-label="Cerrar sesión">
            <span className={s.activeRail} aria-hidden />
            <LogOut className={s.icon} />
            <span className={s.tooltip}>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}


