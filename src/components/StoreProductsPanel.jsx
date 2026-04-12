import { useState, useEffect, useCallback } from "react";
import { api, proxyImage } from "../lib/api";

const CAT_STYLE = {
  otro:    { bg: "var(--rosa)",     border: "var(--coral-border)",  color: "var(--coral)"  },
  _default:{ bg: "var(--lila)",     border: "var(--indigo-border)", color: "var(--indigo)" },
  _pending:{ bg: "var(--surface2)", border: "var(--border)",        color: "var(--muted2)" },
};

function CatBadge({ category, classified }) {
  if (!classified) {
    const s = CAT_STYLE._pending;
    return (
      <span style={{
        background: s.bg, border: `1px dashed ${s.border}`, color: s.color,
        fontSize: "0.58rem", padding: "0.15rem 0.45rem", borderRadius: "4px",
        fontFamily: "'Unbounded', sans-serif", letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}>pendiente</span>
    );
  }
  const s = CAT_STYLE[category] || CAT_STYLE._default;
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      fontSize: "0.58rem", padding: "0.15rem 0.45rem", borderRadius: "4px",
      fontFamily: "'Unbounded', sans-serif", letterSpacing: "0.06em",
      textTransform: "uppercase", fontWeight: 700,
    }}>
      {category || "—"}
    </span>
  );
}

const PAGE = 40;

export function StoreProductsPanel({ store, onClose }) {
  const [products, setProducts]       = useState([]);
  const [total, setTotal]             = useState(0);
  const [offset, setOffset]           = useState(0);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reclassing, setReclassing]   = useState(null);
  const [filter, setFilter]           = useState("all");

  // ── Cargar productos ──────────────────────────────────────────────────────
  const load = useCallback(async (off = 0, append = false) => {
    off === 0 ? setLoading(true) : setLoadingMore(true);
    try {
      const data = await api.post("/search", {
        query: "", limit: PAGE, offset: off, store_id: store.id,
      });
      const results = data.results || [];
      setTotal(data.total ?? results.length);
      setProducts(prev => append ? [...prev, ...results] : results);
      setOffset(off + results.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [store.id]);

  useEffect(() => { load(0, false); }, [load]);

  // ── Re-clasificar producto individual ─────────────────────────────────────
  async function reclass(productId) {
    setReclassing(productId);
    try {
      const result = await api.post(`/enrich/product/${productId}`, {});
      setProducts(prev => prev.map(p =>
        p.id === productId
          ? { ...p,
              category:      result.category,
              subcategory:   result.subcategory,
              ai_classified: true,
              enriched:      true,
              colors:        result.colors,
              style_tags:    result.style_tags,
              neck_type:     result.neck_type,
              sleeve_type:   result.sleeve_type,
            }
          : p
      ));
    } catch (e) {
      console.error(e);
    } finally {
      setReclassing(null);
    }
  }

  // ── Filtrado local ────────────────────────────────────────────────────────
  const shown = products.filter(p => {
    if (filter === "otro")    return p.category === "otro" || !p.ai_classified;
    if (filter === "pending") return !p.ai_classified;
    return true;
  });

  const nOtro    = products.filter(p => p.category === "otro" || !p.ai_classified).length;
  const nPending = products.filter(p => !p.ai_classified).length;

  return (
    <div style={{
      border:       "1px solid var(--indigo-border)",
      borderRadius: "10px",
      background:   "var(--blanco)",
      overflow:     "hidden",
      marginTop:    "0.25rem",
      marginBottom: "0.5rem",
      boxShadow:    "0 2px 12px var(--indigo-dim)",
    }}>

      {/* Header del panel */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        padding:        "0.75rem 1rem",
        borderBottom:   "1px solid var(--border)",
        background:     "var(--indigo-dim)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{
            fontFamily: "'Unbounded', sans-serif", fontSize: "0.72rem",
            fontWeight: 700, color: "var(--indigo)",
          }}>
            {store.name}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
            {total} productos
          </span>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
          {[
            { key: "all",     label: `Todos` },
            { key: "otro",    label: `Mal clasificados (${nOtro})`, hide: nOtro === 0 },
            { key: "pending", label: `Sin clasificar (${nPending})`, hide: nPending === 0 },
          ].filter(f => !f.hide).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                background:   filter === key ? "var(--indigo)" : "transparent",
                color:        filter === key ? "var(--blanco)"  : "var(--muted)",
                border:       `1px solid ${filter === key ? "var(--indigo)" : "var(--border)"}`,
                borderRadius: "5px", fontSize: "0.65rem",
                padding:      "0.25rem 0.6rem",
                cursor:       "pointer", fontFamily: "inherit",
                transition:   "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}

          <button
            onClick={onClose}
            style={{
              background: "none", border: "1px solid var(--border)",
              color: "var(--muted)", width: 26, height: 26,
              borderRadius: "50%", cursor: "pointer", fontSize: "0.8rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginLeft: "0.25rem",
            }}
          >✕</button>
        </div>
      </div>

      {/* Lista */}
      <div style={{ maxHeight: 480, overflowY: "auto", padding: "0.5rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
            <div className="spinner" style={{ width: 28, height: 28, marginBottom: "0.5rem" }} />
            <p style={{ fontSize: "0.8rem" }}>Cargando productos…</p>
          </div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)", fontSize: "0.82rem" }}>
            ✓ No hay productos en esta categoría.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "0.5rem",
          }}>
            {shown.map(p => (
              <ProductTile
                key={p.id}
                product={p}
                onReclass={reclass}
                busy={reclassing === p.id}
              />
            ))}
          </div>
        )}

        {/* Ver más */}
        {!loading && products.length < total && filter === "all" && (
          <div style={{ textAlign: "center", padding: "0.75rem 0 0.25rem" }}>
            <button
              className="btn secondary"
              onClick={() => load(offset, true)}
              disabled={loadingMore}
              style={{ fontSize: "0.75rem", padding: "0.4rem 1.2rem" }}
            >
              {loadingMore ? "⏳" : `Ver más (${total - products.length} restantes)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tile de producto ──────────────────────────────────────────────────────────

function ProductTile({ product, onReclass, busy }) {
  return (
    <div style={{
      background:   busy ? "var(--indigo-dim)" : "var(--surface)",
      border:       `1px solid ${busy ? "var(--indigo-border)" : "var(--border)"}`,
      borderRadius: "8px",
      overflow:     "hidden",
      transition:   "border-color 0.2s, background 0.2s",
      position:     "relative",
    }}>
      {/* Imagen */}
      <div style={{
        aspectRatio: "3/4", background: "var(--surface2)", position: "relative",
        overflow: "hidden",
      }}>
        <img
          src={product.image_url ? proxyImage(product.image_url) : null}
          alt={product.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.src = "https://placehold.co/200x266/ececec/aaa?text=—"; }}
        />
        {/* Badge categoría sobre la imagen */}
        <div style={{ position: "absolute", top: "0.4rem", left: "0.4rem" }}>
          <CatBadge category={product.category} classified={product.ai_classified} />
        </div>
      </div>

      {/* Info + botón */}
      <div style={{ padding: "0.55rem 0.6rem 0.6rem" }}>
        <p style={{
          fontSize: "0.75rem", fontWeight: 500, color: "var(--negro)",
          marginBottom: "0.45rem", lineHeight: 1.3,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {product.title}
        </p>

        {/* Subcategoría si existe */}
        {product.subcategory && product.ai_classified && (
          <p style={{
            fontSize: "0.62rem", color: "var(--muted)", marginBottom: "0.45rem",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {product.subcategory}
          </p>
        )}

        {/* Botón re-clasificar */}
        <button
          onClick={() => onReclass(product.id)}
          disabled={busy}
          style={{
            width:        "100%",
            background:   busy ? "var(--indigo)" : "var(--lila)",
            color:        busy ? "var(--blanco)"  : "var(--indigo)",
            border:       `1px solid var(--indigo-border)`,
            borderRadius: "6px",
            padding:      "0.35rem 0",
            fontSize:     "0.7rem",
            fontFamily:   "inherit",
            fontWeight:   500,
            cursor:       busy ? "not-allowed" : "pointer",
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            gap:          "0.35rem",
            transition:   "all 0.15s",
          }}
        >
          {busy ? (
            <>
              <span style={{
                width: 10, height: 10,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "white", borderRadius: "50%",
                display: "inline-block", animation: "spin 0.7s linear infinite",
              }} />
              Clasificando…
            </>
          ) : (
            <>↺ Re-clasificar</>
          )}
        </button>
      </div>
    </div>
  );
}
