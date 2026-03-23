import { useState } from "react";

export function AddStoreModal({ onClose, onAdd, loading }) {
  const [form, setForm] = useState({
    name: "",
    url: "",
    catalog_url: "",
    country: "AR",
    active: true,
    location: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
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
          placeholder="Ej: Zara Argentina"
        />

        <label className="input-label">URL Base</label>
        <input
          className="input"
          value={form.url}
          onChange={(e) => set("url", e.target.value)}
          placeholder="https://zara.com/ar"
        />

        <label className="input-label">URL Catálogo</label>
        <input
          className="input"
          value={form.catalog_url}
          onChange={(e) => set("catalog_url", e.target.value)}
          placeholder="https://zara.com/ar/mujer/ropa"
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
            <Toggle
              value={form.active}
              onChange={(v) => set("active", v)}
            />
          </div>
        </div>

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

// ── Toggle switch local ───────────────────────────────────────────────────────
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
