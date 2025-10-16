'use client';
import { createContext, useContext, useMemo, useState, useCallback } from 'react';

type SidebarCtx = { open: boolean; toggle: () => void; set: (v: boolean) => void; };
const Ctx = createContext<SidebarCtx>({ open: false, toggle: () => {}, set: () => {} });

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // 👇 lazy init: en el servidor window no existe (queda false),
  // en el primer render del CLIENTE sí lee localStorage y evita el "abre-cierra".
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ui:sidebar') === '1';
  });

  const toggle = useCallback(() => {
    setOpen((v) => {
      const nv = !v;
      if (typeof window !== 'undefined') localStorage.setItem('ui:sidebar', nv ? '1' : '0');
      return nv;
    });
  }, []);

  const set = useCallback((v: boolean) => {
    setOpen(v);
    if (typeof window !== 'undefined') localStorage.setItem('ui:sidebar', v ? '1' : '0');
  }, []);

  const value = useMemo(() => ({ open, toggle, set }), [open, toggle, set]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSidebar = () => useContext(Ctx);
