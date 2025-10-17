/* =============================================================
src/context/AuthContext.tsx — bootstrap sesión + expiración + logout
============================================================= */
'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { login as apiLogin, logout as apiLogout, me } from '@/features/auth/auth.service';
import type { User } from '@/features/auth/types';

type Ctx = {
  user: User | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<Ctx>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // (opcional) sync entre pestañas
  const bcRef = useRef<BroadcastChannel | null>(null);
  const hasBC = typeof window !== 'undefined' && 'BroadcastChannel' in window;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasBC) {
      bcRef.current = new BroadcastChannel('auth');
      bcRef.current.onmessage = (ev) => {
        if (ev.data === 'logout') {
          setUser(null);
          router.replace('/login?multi=1');
        }
      };
      return () => bcRef.current?.close();
    } else {
      const onStorage = (e: StorageEvent) => {
        if (e.key === 'auth:bc' && e.newValue === 'logout') {
          setUser(null);
          router.replace('/login?multi=1');
        }
      };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    }
  }, [router, hasBC]);

  const postLogoutSignal = useCallback(() => {
    if (hasBC) bcRef.current?.postMessage('logout');
    else if (typeof window !== 'undefined') {
      localStorage.setItem('auth:bc', 'logout');
      localStorage.removeItem('auth:bc');
    }
  }, [hasBC]);

  // Bootstrap: consulta /api/auth/me vía servicio
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await me();
        if (!alive) return;
        setUser(u);
      } catch {
        if (!alive) return;
        setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Expiración global (disparada desde interceptores)
  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      postLogoutSignal();
      const from = encodeURIComponent(pathname || '/');
      router.replace(`/login?expired=1&from=${from}`);
      router.refresh();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('auth:expired', onExpired as EventListener);
      return () => window.removeEventListener('auth:expired', onExpired as EventListener);
    }
  }, [pathname, router, postLogoutSignal]);

  // (opcional) Idle auto-logout (30 min)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const IDLE_MS = 30 * 60 * 1000;
    let t: number | undefined;

    const reset = () => {
      if (t) window.clearTimeout(t);
      if (user) {
        t = window.setTimeout(() => {
          window.dispatchEvent(new Event('auth:expired'));
        }, IDLE_MS);
      }
    };

    const opts: AddEventListenerOptions = { passive: true };
    const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart', 'visibilitychange'];
    const handleEvent = () => {
      if (document.visibilityState === 'hidden') return;
      reset();
    };

    events.forEach((ev) => window.addEventListener(ev, handleEvent, opts));
    reset();
    return () => {
      if (t) window.clearTimeout(t);
      events.forEach((ev) => window.removeEventListener(ev, handleEvent));
    };
  }, [user]);

  const login = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      try {
        await apiLogin({ username, password });
        const u = await me();
        setUser(u);
        router.replace('/dashboard'); // el server hará redirect por rol
        router.refresh();
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {}
    setUser(null);
    postLogoutSignal();
    router.replace('/login');
    router.refresh();
  }, [postLogoutSignal, router]);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);

/* =============================================================
AuthGate — gating de cliente SIN loops:
- En rutas privadas, NO redirige al login: deja que el guard server actúe.
- En públicas (ej. /login), si no hay user tras cargar, sí puede redirigir.
============================================================= */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  const isPrivate = pathname?.startsWith('/dashboard');

  // Sólo empuja al login si estás en PÚBLICO.
  useEffect(() => {
    if (!loading && !user && !isPrivate) {
      const from = encodeURIComponent(pathname || '/');
      router.replace(`/login?from=${from}`);
    }
  }, [loading, user, isPrivate, pathname, router]);

  if (loading) return null;
  if (isPrivate && !user) return null; // server guard decide
  return <>{children}</>;
}

/** (Opcional) HOC para páginas cliente que quieras proteger adicionalmente */
export function withAuth<P extends object>(Comp: React.ComponentType<P>) {
  const Wrapped: React.FC<P> = (props) => (
    <AuthGate>
      <Comp {...props} />
    </AuthGate>
  );
  Wrapped.displayName = `withAuth(${Comp.displayName || Comp.name || 'Component'})`;
  return Wrapped;
}

