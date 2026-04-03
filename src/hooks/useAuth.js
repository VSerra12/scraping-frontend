import { useState, useCallback } from "react";
import { api, auth } from "../lib/api";

/**
 * Hook de autenticación con httpOnly cookie.
 *
 * - El token vive en la cookie del navegador, no en JS.
 * - isAdmin es estado local que se sincroniza con /auth/me al montar.
 * - login() llama a /auth/login → el backend setea la cookie.
 * - logout() llama a /auth/logout → el backend borra la cookie.
 *
 * Uso en App.jsx:
 *   const { isAdmin, login, logout, checkSession, loginLoading, loginError } = useAuth();
 *   useEffect(() => { checkSession(); }, []);
 */
export function useAuth() {
  const [isAdmin, setIsAdmin]      = useState(false);
  const [loginLoading, setLoading] = useState(false);
  const [loginError, setError]     = useState("");

  // Llamar al montar App para restaurar sesión si la cookie sigue vigente
  const checkSession = useCallback(async () => {
    try {
      await api.get("/auth/me");
      auth.setAdmin(true);
      setIsAdmin(true);
    } catch {
      // Cookie ausente o expirada — no es un error, simplemente no hay sesión
      auth.clearAdmin();
      setIsAdmin(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/login", { username, password });
      auth.setAdmin(true);
      setIsAdmin(true);
      return true;
    } catch (e) {
      setError(
        e.message === "Failed to fetch"
          ? "No se pudo conectar al servidor"
          : "Usuario o contraseña incorrectos"
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // Si falla el request igual limpiamos el estado local
    } finally {
      auth.clearAdmin();
      setIsAdmin(false);
    }
  }, []);

  return { isAdmin, login, logout, checkSession, loginLoading, loginError, setError };
}