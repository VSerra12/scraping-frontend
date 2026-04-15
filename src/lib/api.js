export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
export const PAGE_SIZE = 50;
export const CATEGORIES = [
  "", "remera", "buzo", "campera", "pantalón", "zapatillas",
  "vestido", "falda", "bermuda",
];
export const COLORS = [
  "", "negro", "blanco", "rojo", "azul", "verde",
  "amarillo", "gris", "beige", "marrón", "rosa",
];
export const GENDERS = ["", "hombre", "mujer", "unisex"];

// ─── Auth ─────────────────────────────────────────────────────────────────────
// El token se guarda en localStorage y se envía en el header Authorization.
// La httpOnly cookie se sigue seteando como fallback desde el backend,
// pero en producción cross-site Chrome la bloquea → usamos Bearer token.
const TOKEN_KEY = "admin_token";
let _isAdmin = false;

export const auth = {
  setAdmin(val) { _isAdmin = val; },
  clearAdmin()  {
    _isAdmin = false;
    localStorage.removeItem(TOKEN_KEY);
  },
  isAdmin()     { return _isAdmin; },
  setToken(t)   { localStorage.setItem(TOKEN_KEY, t); },
  getToken()    { return localStorage.getItem(TOKEN_KEY); },
};

// ─── Cliente HTTP ─────────────────────────────────────────────────────────────
// Envía el token JWT en el header Authorization: Bearer <token>.
// credentials: "include" se mantiene como fallback para la cookie.
function baseHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = auth.getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  async get(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: baseHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  },
  async post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: baseHeaders(),
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  },
  async del(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: baseHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    if (res.status === 204) return null;
    return res.json();
  },
  async patch(path, body = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: baseHeaders(),
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatPrice(price, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function timeAgo(ts) {
  if (!ts) return "Nunca";
  const diff = (Date.now() - new Date(ts)) / 1000 / 3600;
  if (diff < 1) return "Hace menos de 1h";
  if (diff < 24) return `Hace ${Math.floor(diff)}h`;
  return `Hace ${Math.floor(diff / 24)}d`;
}

export function proxyImage(url) {
  if (!url) return null;
  return "https://wsrv.nl/?url=" + encodeURIComponent(url) + "&w=480&output=webp";
}

export function parseArr(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { return JSON.parse(val || "[]"); } catch { return []; }
  }
  return [];
}
