import { useState, useEffect, useCallback } from "react";
import { api, proxyImage } from "../lib/api";

const CAT_COLORS = {
  otro:     { bg: "var(--rosa)",        border: "var(--coral-border)",  text: "var(--coral)"  },
  remera:   { bg: "var(--lila)",        border: "var(--indigo-border)", text: "var(--indigo)" },
  jean:     { bg: "var(--lila)",        border: "var(--indigo-border)", text: "var(--indigo)" },
  vestido:  { bg: "var(--lila)",        border: "var(--indigo-border)", text: "var(--indigo)" },
  default:  { bg: "var(--surface2)",    border: "var(--border)",        text: "var(--muted)"  },
};

function CategoryBadge({ category, aiClassified }) {
  if (!aiClassified) {
    return (
      <span style={{
        background: "var(--surface2)", border: "1px dashed var(--border)",
        color: "var(--muted2)", fontSize: "0.6rem", padding: "0.18rem 0.5rem",
        borderRadius: "4px", fontFamily: "'Unbounded', sans-serif",
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}>
        pendiente
      </span>
    );
  }
  const style = CAT_COLORS[category] || CAT_COLORS.default;
  return (
    <span style={{
      background: style.bg, border: `1px solid ${style.border}`,
      color: style.text, fontSize: "0.6rem", padding: "0.18rem 0.5rem",
      borderRadius: "4px", fontFamily: "'Unbounded', sans-serif",
      letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700,
    }}>
      {category || "—"}
    </span>
  );
}

const PAGE_SIZE = 30;

export function StoreProductsModal({ store, onClose }) {
  const [products, setProducts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [offset, setOffset]         = useState(0);
  const [loading, setLoading]       = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reclassing, setReclassing] = useState(null); // product_id en proceso
  const [filter, setFilter]         = useState("all"); // "all" | "otro" | "pending"

  // ── Cargar productos ──────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (currentOffset = 0, append = false) => {
    currentOffset === 0 ? setLoading(true) : setLoadingMore(true);
    try {
      const data = await api.post("/search", {
        query: "",
        limit: PAGE_SIZE,
        offset: currentOffset,
        store_id: store.id,
      });
      const results = data.results || [];
      setTotal(data.total ?? results.length);
      setProducts(prev => append ? [...prev, ...results] : results);
      setOffset(currentOffset + results.length);
    } catch (e) {
      console.error("Error cargando productos:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [store.id]);

  useEffect(() => { fetchProducts(0, false); }, [fetchProducts]);

  // ── Re-clasificar un producto ─────────────────────────────────────────────
  async function handleReclass(productId) {
    setReclassing(productId);
    try {
      const result = await api.post(`/enrich/product/${productId}`, {});
      // Actualizar el producto en la lista local con los nuevos datos
      setProducts(prev => prev.map(p =>
        p.id === productId
          ? {
              ...p,
              category:     result.category,
              subcategory:  result.subcategory,
              ai_classified: true,
              enriched:     true,
              colors:       result.colors,
              style_tags:   result.style_tags,
              neck_type:    result.neck_type,
              sleeve_type:  result.sleeve_type,
            }
          : p
      ));
    } catch (e) {
      console.error("Error re-clasificando:", e);
    } finally {
      setReclassing(null);
    }
  }

  // ── Filtrado local ────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    if (filter === "otro")    return p.category === "otro" || !p.ai_classified;
    if (filter === "pending") return !p.ai_classified;
    return true;
  });

  // ── Contadores para los filtros ───────────────────────────────────────────
  const countOtro    = products.filter(p => p.category === "otro" || !p.ai_classified).length;
  const countPending = products.filter(p => !p.ai_classified).length;

  return (
    <div
      className="variant-overlay"
      onClick={onClose}
      style={{ zIndex: 1100 }}
    >
      <div
        className="variant-modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 860, width: "100%", maxHeight: "88vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: "1rem", flexShrink: 0,
        }}>
          <div>
            <h2 className="variant-title" style={{ marginBottom: "0.2rem" }}>
              {store.name}
            </h2>
            <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
              {total} productos · click en ↺ para re-clasificar individualmente
            </p>
          </div>
          <button className="variant-close" onClick={onClose}>✕</button>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", flexShrink: 0 }}>
          {[
            { key: "all",     label: `Todos (${total})` },
            { key: "otro",    label: `Mal clasificados (${countOtro})` },
            { key: "pending", label: `Sin clasificar (${countPending})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                background: filter === key ? "var(--indigo)" : "var(--surface)",
                color:      filter === key ? "var(--blanco)" : "var(--muted)",
                border:     `1px solid ${filter === key ? "var(--indigo)" : "var(--border)"}`,
                borderRadius: "6px", fontSize: "0.72rem", padding: "0.3rem 0.75rem",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Lista de productos */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div className="state-box" style={{ padding: "3rem 1rem" }}>
              <div className="spinner" />
              <p>Cargando productos…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="state-box" style={{ padding: "3rem 1rem" }}>
              <div className="emoji">✓</div>
              <p>No hay productos en esta categoría.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {filtered.map(product => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onReclass={handleReclass}
                    isReclassing={reclassing === product.id}
                  />
                ))}
              </div>

              {/* Ver más */}
              {products.length < total && filter === "all" && (
                <div style={{ textAlign: "center", padding: "1.2rem 0" }}>
                  <button
                    className="btn secondary"
                    onClick={() => fetchProducts(offset, true)}
                    disabled={loadingMore}
                    style={{ fontSize: "0.8rem" }}
                  >
                    {loadingMore ? "⏳ Cargando…" : `Ver más (${total - products.length} restantes)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Fila de producto ──────────────────────────────────────────────────────────

function ProductRow({ product, onReclass, isReclassing }) {
  //const justDone = product.ai_classified && product._justReclassed;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "52px 1fr auto",
      gap: "0.75rem",
      alignItems: "center",
      padding: "0.55rem 0.75rem",
      borderRadius: "8px",
      background: isReclassing ? "var(--indigo-dim)" : "var(--surface)",
      border: `1px solid ${isReclassing ? "var(--indigo-border)" : "var(--border)"}`,
      transition: "background 0.2s, border-color 0.2s",
    }}>
      {/* Imagen */}
      <div style={{
        width: 52, height: 66, borderRadius: "6px",
        overflow: "hidden", background: "var(--surface2)", flexShrink: 0,
      }}>
        <img
          src={product.image_url ? proxyImage(product.image_url) : null}
          alt={product.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.src = "https://placehold.co/52x66/ececec/999?text=—"; }}
        />
      </div>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontSize: "0.82rem", fontWeight: 500, color: "var(--negro)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          marginBottom: "0.3rem",
        }}>
          {product.title}
        </p>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
          <CategoryBadge category={product.category} aiClassified={product.ai_classified} />
          {product.subcategory && (
            <span style={{
              fontSize: "0.65rem", color: "var(--muted)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              maxWidth: "260px",
            }}>
              {product.subcategory}
            </span>
          )}
        </div>
      </div>

      {/* Botón */}
      <button
        onClick={() => onReclass(product.id)}
        disabled={isReclassing}
        title="Re-clasificar este producto con la IA"
        style={{
          background: isReclassing ? "var(--indigo)" : "var(--surface2)",
          color:      isReclassing ? "var(--blanco)" : "var(--indigo)",
          border:     `1px solid ${isReclassing ? "var(--indigo)" : "var(--indigo-border)"}`,
          borderRadius: "6px", width: 34, height: 34,
          cursor: isReclassing ? "not-allowed" : "pointer",
          fontSize: "0.9rem", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}
      >
        {isReclassing ? (
          <span style={{
            width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
            borderTop: "2px solid white", borderRadius: "50%",
            display: "inline-block", animation: "spin 0.7s linear infinite",
          }} />
        ) : "↺"}
      </button>
    </div>
  );
}
