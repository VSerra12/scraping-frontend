import { useState } from "react";

export function EditStoreModal({ store, onClose, onSave, loading }) {
  const [form, setForm] = useState({
    name:        store.name        || "",
    url:         store.url         || "",
    catalog_url: store.catalog_url || "",
    country:     store.country     || "AR",
    location:    store.location    || "",
    active:      store.active      ?? true,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const isDirty =
    form.name        !== store.name        ||
    form.url         !== store.url         ||
    form.catalog_url !== store.catalog_url ||
    form.country     !== store.country     ||
    form.location    !== (store.location || "") ||
    form.active      !== store.active;

  const valid = form.name.trim() && form.url.trim() && form.catalog_url.trim();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal edit-store-modal" onClick={(e) => e.stopPropagation()}>

        {/* Título */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
          <span style={{
            background: "var(--indigo-dim)",
            border: "1px solid var(--indigo-border)",
            color: "var(--indigo)",
            fontSize: "0.55rem",
            fontFamily: "'Unbounded', sans-serif",
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "0.2rem 0.55rem",
            borderRadius: "4px",
            textTransform: "uppercase",
          }}>
            Editar
          </span>
          <h2 className="modal-title" style={{ margin: 0 }}>{store.name}</h2>
        </div>

        <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
          Modificá los datos de la tienda. El campo más importante es la <strong style={{ color: "var(--negro)" }}>URL de catálogo</strong>, desde donde se scrapean los productos.
        </p>

        {/* Nombre */}
        <label className="input-label">Nombre de la tienda</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Ej: Zara Argentina"
        />

        {/* URL base */}
        <label className="input-label">URL base</label>
        <input
          className="input"
          value={form.url}
          onChange={(e) => set("url", e.target.value)}
          placeholder="https://zara.com/ar"
        />

        {/* URL catálogo — campo destacado */}
        <label className="input-label" style={{ color: "var(--indigo)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          URL de catálogo
          <span style={{
            background: "var(--indigo)",
            color: "var(--blanco)",
            fontSize: "0.48rem",
            fontFamily: "'Unbounded', sans-serif",
            fontWeight: 700,
            letterSpacing: "0.08em",
            padding: "0.15rem 0.4rem",
            borderRadius: "3px",
            textTransform: "uppercase",
          }}>
            clave
          </span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            className="input"
            value={form.catalog_url}
            onChange={(e) => set("catalog_url", e.target.value)}
            placeholder="https://zara.com/ar/mujer/ropa"
            style={{
              borderColor: "var(--indigo-border)",
              boxShadow: "0 0 0 3px var(--indigo-dim)",
              paddingRight: "2.5rem",
            }}
          />
          {/* Ícono de link */}
          <span style={{
            position: "absolute",
            right: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--indigo)",
            fontSize: "0.85rem",
            pointerEvents: "none",
          }}>
            ⛓
          </span>
        </div>
        <p style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: "-0.25rem" }}>
          Esta URL es el punto de entrada del scraper. Puede incluir parámetros como <code style={{ fontSize: "0.65rem", background: "var(--surface2)", padding: "0.1rem 0.3rem", borderRadius: "3px" }}>?mpage=N</code> para Tienda Nube, o ser la URL de una categoría específica.
        </p>

        {/* País + Estado */}
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

        {/* Ubicación */}
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

        {/* Diff de cambios */}
        {isDirty && (
          <DiffPreview original={store} current={form} />
        )}

        {/* Acciones */}
        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn primary"
            disabled={!valid || !isDirty || loading}
            onClick={() => onSave(store.id, form)}
          >
            {loading ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Diff de campos modificados ────────────────────────────────────────────────
function DiffPreview({ original, current }) {
  const fields = [
    { key: "name",        label: "Nombre" },
    { key: "url",         label: "URL base" },
    { key: "catalog_url", label: "URL catálogo" },
    { key: "country",     label: "País" },
    { key: "location",    label: "Ubicación" },
    { key: "active",      label: "Estado" },
  ];

  const changed = fields.filter(({ key }) => {
    const orig = original[key] ?? "";
    const curr = current[key]  ?? "";
    return String(orig) !== String(curr);
  });

  if (!changed.length) return null;

  return (
    <div style={{
      background: "var(--indigo-dim)",
      border: "1px solid var(--indigo-border)",
      borderRadius: "8px",
      padding: "0.75rem 0.9rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.4rem",
    }}>
      <p style={{
        fontSize: "0.6rem",
        color: "var(--indigo)",
        fontFamily: "'Unbounded', sans-serif",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: "0.2rem",
      }}>
        Cambios detectados
      </p>
      {changed.map(({ key, label }) => (
        <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
          <span style={{ fontSize: "0.62rem", color: "var(--indigo)", fontWeight: 600 }}>{label}</span>
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{
              fontSize: "0.7rem", color: "var(--muted)",
              textDecoration: "line-through",
              maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {String(original[key] ?? "—")}
            </span>
            <span style={{ color: "var(--indigo)", fontSize: "0.7rem" }}>→</span>
            <span style={{
              fontSize: "0.7rem", color: "var(--negro)", fontWeight: 500,
              maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {String(current[key] ?? "—")}
            </span>
          </div>
        </div>
      ))}
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
        height: "100%",
        minHeight: "40px",
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
