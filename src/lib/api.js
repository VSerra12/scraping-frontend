export const API_BASE = "http://localhost:8000/api";
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

// ─── Token en memoria (nunca en localStorage) ─────────────────────────────────
// Módulo-level: sobrevive re-renders pero se limpia al cerrar la pestaña.
let _token = null;

export const auth = {
  setToken(t)  { _token = t; },
  clearToken() { _token = null; },
  getToken()   { return _token; },
  isAdmin()    { return !!_token; },
};

// ─── Cliente HTTP ─────────────────────────────────────────────────────────────
function authHeaders() {
  return _token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${_token}` }
    : { "Content-Type": "application/json" };
}

export const api = {
  async get(path) {
    const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  },
  async post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  },
  async del(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    // DELETE devuelve 204 sin body
    if (res.status === 204) return null;
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