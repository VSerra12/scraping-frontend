import { useState, useCallback } from "react";
import { api, auth } from "../lib/api";

/**
 * Hook de autenticación.
 * Devuelve: { isAdmin, login, logout, loginLoading, loginError }
 *
 * - isAdmin: true si hay token válido en memoria
 * - login(username, password): llama al backend, guarda el token
 * - logout(): limpia el token
 */
export function useAuth() {
  const [isAdmin, setIsAdmin]       = useState(false);
  const [loginLoading, setLoading]  = useState(false);
  const [loginError, setError]      = useState("");

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/login", { username, password });
      auth.setToken(data.token);
      setIsAdmin(true);
      return true;
    } catch (e) {
      setError("Usuario o contraseña incorrectos");
      e.message === "Failed to fetch" && setError("No se pudo conectar al servidor");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    auth.clearToken();
    setIsAdmin(false);
  }, []);

  return { isAdmin, login, logout, loginLoading, loginError, setError };
}
