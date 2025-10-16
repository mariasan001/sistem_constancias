/* =============================================================
src/features/auth/hooks/useLoginForm.ts — Hook del formulario
============================================================= */
"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import type { LoginPayload } from "../types";
import { login as apiLogin } from "../auth.service";

export function useLoginForm(opts?: { onSuccess?: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const valid = useMemo(
    () => username.trim().length > 0 && password.trim().length > 0,
    [username, password]
  );

  const handleUsername = useCallback((v: string) => setUsername(v), []);
  const handlePassword = useCallback((v: string) => setPassword(v), []);

  const submit = useCallback(async () => {
    if (!valid) {
      setError("Completa usuario y contraseña");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: LoginPayload = { username, password };
      await apiLogin(payload);
      opts?.onSuccess?.();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "No fue posible iniciar sesión";
      setError(msg);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [username, password, valid, opts]);

  return {
    username,
    password,
    loading,
    error,
    valid,
    handleUsername,
    handlePassword,
    submit,
  } as const;
}
