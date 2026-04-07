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
// El token se guarda en memoria (nunca en localStorage/sessionStorage).
// Se pierde al recargar la página: el usuario deberá volver a iniciar sesión.
// isAdmin() lo determina el resultado de /auth/me al cargar la app.
let _isAdmin = false;
let _token = null;

export const auth = {
  setAdmin(val)   { _isAdmin = val; },
  clearAdmin()    { _isAdmin = false; },
  isAdmin()       { return _isAdmin; },
  setToken(token) { _token = token; },
  clearToken()    { _token = null; },
  getToken()      { return _token; },
};

// ─── Cliente HTTP ─────────────────────────────────────────────────────────────
function baseHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;
  return headers;
}

export const api = {
  async get(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: baseHeaders(),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  },
  async post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  },
  async del(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: baseHeaders(),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
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