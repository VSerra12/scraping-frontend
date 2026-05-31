import { useState } from "react";

const SCRAPER_OPTIONS = [
  { value: "auto",        label: "Auto (detección automática)" },
  { value: "woocommerce", label: "WooCommerce" },
  { value: "tiendanube",  label: "Tienda Nube" },
  { value: "shopnatural", label: "ShopNatural (Flatsome)" },
  { value: "generic",     label: "Genérico" },
];

export function AddStoreModal({ onClose, onAdd, loading }) {
  const [form, setForm] = useState({
    name:         "",
    url:          "",
    catalog_url:  "",
    country:      "AR",
    active:       true,
    location:     "",
    scraper_type: "auto",
  });

  const set   = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.url.trim() && form.catalog_url.trim();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Agregar Tienda</h2>

        <label className="input-label">Nombre</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Ej: Hugs Jeans"
        />

        <label className="input-label">URL Base</label>
        <input
          className="input"
          value={form.url}
          onChange={(e) => set("url", e.target.value)}
          placeholder="https://www.hugs-jeans.com"
        />

        <label className="input-label">URL Catálogo</label>
        <input
          className="input"
          value={form.catalog_url}
          onChange={(e) => set("catalog_url", e.target.value)}
          placeholder="https://www.hugs-jeans.com/productos/"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label className="input-label">País</label>
            <select
              className="input"
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
            >
              <option value="AR">🇦🇷 Argentina</option>
              <option value="UY">🇺🇾 Uruguay</option>
              <option value="CL">🇨🇱 Chile</option>
              <option value="BR">🇧🇷 Brasil</option>
              <option value="MX">🇲🇽 México</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          <div>
            <label className="input-label">Estado</label>
            <Toggle value={form.active} onChange={(v) => set("active", v)} />
          </div>
        </div>

        <label className="input-label">Tipo de scraper</label>
        <select
          className="input"
          value={form.scraper_type}
          onChange={(e) => set("scraper_type", e.target.value)}
        >
          {SCRAPER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "-0.25rem" }}>
          Usá "Auto" si no sabés. Si el scraping da resultados incorrectos, cambialo acá.
        </p>

        <label className="input-label">
          Ubicación{" "}
          <span style={{ color: "var(--muted)", fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>
            (opcional)
          </span>
        </label>
        <input
          className="input"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="Ej: Buenos Aires, CABA"
        />

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn primary"
            disabled={!valid || loading}
            onClick={() => onAdd(form)}
          >
            {loading ? "Guardando…" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal de edición ─────────────────────────────────────────────────────────

export function EditStoreModal({ store, onClose, onSave, loading }) {
  const [form, setForm] = useState({
    name:         store.name,
    url:          store.url,
    catalog_url:  store.catalog_url,
    country:      store.country,
    location:     store.location || "",
    scraper_type: store.scraper_type || "auto",
  });

  const set   = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.url.trim() && form.catalog_url.trim();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Editar Tienda</h2>
        <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "-0.25rem" }}>
          {store.name}
        </p>

        <label className="input-label">Nombre</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />

        <label className="input-label">URL Base</label>
        <input
          className="input"
          value={form.url}
          onChange={(e) => set("url", e.target.value)}
        />

        <label className="input-label">URL Catálogo</label>
        <input
          className="input"
          value={form.catalog_url}
          onChange={(e) => set("catalog_url", e.target.value)}
        />

        <label className="input-label">Tipo de scraper</label>
        <select
          className="input"
          value={form.scraper_type}
          onChange={(e) => set("scraper_type", e.target.value)}
        >
          {SCRAPER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label className="input-label">País</label>
            <select
              className="input"
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
            >
              <option value="AR">🇦🇷 Argentina</option>
              <option value="UY">🇺🇾 Uruguay</option>
              <option value="CL">🇨🇱 Chile</option>
              <option value="BR">🇧🇷 Brasil</option>
              <option value="MX">🇲🇽 México</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
          <div>
            <label className="input-label">Ubicación</label>
            <input
              className="input"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Ej: Buenos Aires"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn primary"
            disabled={!valid || loading}
            onClick={() => onSave(store.id, form)}
          >
            {loading ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        background: "var(--surface2)",
        border: `1px solid ${value ? "rgba(74,222,128,0.4)" : "var(--border)"}`,
        borderRadius: "8px",
        padding: "0.6rem 0.85rem",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <span style={{
        width: "32px", height: "18px", borderRadius: "9px",
        position: "relative",
        background: value ? "#4ade80" : "var(--border)",
        transition: "background 0.2s",
        flexShrink: 0,
      }}>
        <span style={{
          position: "absolute",
          top: "3px",
          left: value ? "17px" : "3px",
          width: "12px", height: "12px",
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
        }} />
      </span>
      <span style={{ fontSize: "0.82rem", color: value ? "#4ade80" : "var(--muted)" }}>
        {value ? "Activa" : "Inactiva"}
      </span>
    </div>
  );
}