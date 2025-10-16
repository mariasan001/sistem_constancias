'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import type { RoleCode } from '@/features/navigation/menu.config';
import { MENU_ITEMS } from '@/features/navigation/menu.config';
import s from './sidebar.module.css';
import { ChevronLeft, ChevronRight, Cog, Sun, Moon, CalendarClock, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuthContext();
  const { open, toggle } = useSidebar();

  // evita mismatch de clases dependientes de "open"
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // submenu
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState<{top:number; left:number}>({ top: 0, left: 0 });
  const gearRef = useRef<HTMLButtonElement>(null);

  const placeMenu = useCallback(() => {
    if (!gearRef.current) return;
    const r = gearRef.current.getBoundingClientRect();
    const top = Math.min(Math.max(12, r.top), window.innerHeight - 160); // clamp
    const left = r.right + 12;
    setMenuPos({ top, left });
  }, []);

  // cerrar al click fuera y reposicionar en resize/scroll
  useEffect(() => {
    if (!showMenu) return;
    placeMenu();
    const onDoc = (e: MouseEvent) => {
      if (!gearRef.current || !gearRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    const onMove = () => placeMenu();
    document.addEventListener('click', onDoc);
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      document.removeEventListener('click', onDoc);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [showMenu, placeMenu]);

  const roleSet = useMemo(() => {
    const codes = (user?.roles ?? [])
      .map((r) => (r.description ?? '').toUpperCase().trim())
      .filter(Boolean) as RoleCode[];
    return new Set<RoleCode>(codes.length ? codes : ['USER']);
  }, [user]);

  const menu = useMemo(
    () => (loading ? [] : MENU_ITEMS.filter((i) => i.roles.some((r) => roleSet.has(r)))),
    [loading, roleSet]
  );

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // dark mode
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const isDark = typeof window !== 'undefined' && localStorage.getItem('ui:theme') === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);
  const toggleDark = useCallback(() => {
    setDark((d) => {
      const v = !d;
      document.documentElement.classList.toggle('dark', v);
      if (typeof window !== 'undefined') localStorage.setItem('ui:theme', v ? 'dark' : 'light');
      return v;
    });
  }, []);

  const handleTipPos = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--tip-top', `${Math.round(r.top + r.height / 2)}px`);
    el.style.setProperty('--tip-left', `${Math.round(r.right + 12)}px`);
  };

  const asideClass = `${s.aside} ${hydrated ? (open ? s.open : s.closed) : ''}`;

  return (
    <aside className={asideClass} suppressHydrationWarning>
      {/* Header */}
      <div className={s.header}>
        <button className={s.toggle} onClick={toggle} aria-label={open ? 'Contraer' : 'Expandir'}>
          {open ? <ChevronLeft /> : <ChevronRight />}
        </button>
        <div className={s.brand}>
          <img src="/img/flor-2.png" alt="Marca" />
          {hydrated && open && <span className={s.brandName}>Constancias</span>}
        </div>
      </div>

      {/* Items */}
      <nav className={s.nav} aria-label="Navegación principal">
        {menu.map(({ id, href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={id}
              href={href}
              className={`${s.item} ${active ? s.active : ''}`}
              aria-label={label}
              onMouseEnter={(e) => handleTipPos(e.currentTarget)}
            >
              <span className={s.rail} aria-hidden />
              <Icon className={s.icon} />
              {hydrated && open && <span className={s.label}>{label}</span>}
              {!open && <span className={s.tooltip}>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Controles inferiores */}
      <div className={s.controls}>
        {/* Ajustes — mismo aspecto que cualquier item */}
        <button
          ref={gearRef}
          className={s.item}
          aria-label="Ajustes"
          onClick={() => setShowMenu((v) => !v)}
          onMouseEnter={(e) => handleTipPos(e.currentTarget)}
        >
          <span className={s.rail} aria-hidden />
          <Cog className={s.icon} />
          {hydrated && open && <span className={s.label}>Ajustes</span>}
          {!open && <span className={s.tooltip}>Ajustes</span>}
        </button>

        {/* Submenú lindo y alineado al engrane */}
        {showMenu && (
          <div className={s.menuPopup} style={{ top: menuPos.top, left: menuPos.left }}>
            <button className={`${s.menuItem} ${s.menuItemSmall}`} onClick={toggleDark}>
              {dark ? <Sun className={s.miIcon} /> : <Moon className={s.miIcon} />}
              <span>{dark ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>
            <Link
              href="/dashboard/configuracion/horarios"
              className={`${s.menuItem} ${s.menuItemBig}`}
              onClick={() => setShowMenu(false)}
            >
              <CalendarClock className={s.miIcon} />
              <span>Configurar horarios</span>
            </Link>
          </div>
        )}

        {/* Cerrar sesión */}
        <button
          className={`${s.item} ${s.itemDanger}`}
          onClick={logout}
          aria-label="Cerrar sesión"
          onMouseEnter={(e) => handleTipPos(e.currentTarget)}
        >
          <span className={s.rail} aria-hidden />
          <LogOut className={`${s.icon} ${s.iconDanger}`} />
          {hydrated && open && <span className={s.label}>Cerrar sesión</span>}
          {!open && <span className={s.tooltip}>Cerrar sesión</span>}
        </button>
      </div>

      {/* Perfil */}
      <div className={s.profile}>
        <img className={s.avatar} src="/img/avatar.png" alt="Avatar" />
        {hydrated && open && (
          <div className={s.userMeta}>
            <div className={s.userName}>{user?.name ?? 'Usuario'}</div>
            <div className={s.userEmail}>{user?.email ?? 'correo@dominio'}</div>
          </div>
        )}
      </div>
    </aside>
  );
}
