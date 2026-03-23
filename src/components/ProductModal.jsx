import { formatPrice, proxyImage } from "../lib/api";

function parseArr(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { return JSON.parse(val || "[]"); } catch { return []; }
  }
  return [];
}

const cap = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : null;

export function ProductModal({ product, onClose }) {
  const storeName = product.store_name || product.store || "—";
  const styleTags      = parseArr(product.style_tags);
  const colors         = parseArr(product.colors);
  const colorsSecondary = parseArr(product.colors_secondary);
  const sizes          = parseArr(product.sizes);
  const designDetails  = parseArr(product.design_details);
  const materials      = parseArr(product.materials);

  return (
    <div className="variant-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="variant-close" onClick={onClose}>✕</button>

        <div className="product-modal-inner">

          {/* Imagen */}
          <div className="product-modal-img">
            <img
              src={product.image_url ? proxyImage(product.image_url) : null}
              alt={product.title}
              onError={(e) => {
                e.target.src = "https://placehold.co/400x500/1a1a1a/444?text=Sin+imagen";
              }}
            />
          </div>

          {/* Info */}
          <div className="product-modal-info">
            <p className="product-modal-store">{storeName}</p>
            <h2 className="product-modal-title">{product.title}</h2>
            <p className="product-modal-price">
              {formatPrice(product.price, product.currency || "ARS")}
            </p>

            {/* Categoría + subcategoría + género */}
            {(product.category || product.subcategory) && (
              <Section label="PRENDA">
                {product.category && <Tag accent>{cap(product.category)}</Tag>}
                {product.subcategory && <Tag>{cap(product.subcategory)}</Tag>}
                {product.gender && product.gender !== "unisex" && (
                  <Tag muted>{cap(product.gender)}</Tag>
                )}
              </Section>
            )}

            {/* Silueta */}
            {(product.cut || product.leg_cut || product.rise || product.length ||
              product.pattern || product.thickness || product.stretch != null) && (
              <Section label="SILUETA">
                {product.cut       && <Tag>{cap(product.cut)}</Tag>}
                {product.leg_cut   && <Tag>{cap(product.leg_cut)}</Tag>}
                {product.rise      && <Tag>{cap(product.rise)}</Tag>}
                {product.length    && <Tag>{cap(product.length)}</Tag>}
                {product.pattern   && <Tag>{cap(product.pattern)}</Tag>}
                {product.thickness && <Tag muted>{cap(product.thickness)}</Tag>}
                {product.stretch === true  && <Tag>Con stretch</Tag>}
                {product.stretch === false && <Tag muted>Sin stretch</Tag>}
              </Section>
            )}

            {/* Construcción */}
            {(product.neck_type || product.sleeve_type || product.hem_finish) && (
              <Section label="CONSTRUCCIÓN">
                {product.neck_type   && <Tag>Cuello {cap(product.neck_type)}</Tag>}
                {product.sleeve_type && <Tag>Manga {cap(product.sleeve_type)}</Tag>}
                {product.hem_finish  && <Tag muted>{cap(product.hem_finish)}</Tag>}
              </Section>
            )}

            {/* Diseño */}
            {designDetails.length > 0 && (
              <Section label="DISEÑO">
                {designDetails.map((d) => <Tag key={d}>{cap(d)}</Tag>)}
              </Section>
            )}

            {/* Estilo */}
            {styleTags.length > 0 && (
              <Section label="ESTILO">
                {styleTags.map((t) => <Tag key={t}>{cap(t)}</Tag>)}
              </Section>
            )}

            {/* Colores */}
            {(colors.length > 0 || colorsSecondary.length > 0) && (
              <Section label="COLORES">
                {colors.map((c) => <Tag key={c}>{cap(c)}</Tag>)}
                {colorsSecondary.map((c) => <Tag key={`sec-${c}`} muted>{cap(c)}</Tag>)}
              </Section>
            )}

            {/* Materiales */}
            {materials.length > 0 && (
              <Section label="MATERIALES">
                {materials.map((m) => <Tag key={m}>{cap(m)}</Tag>)}
              </Section>
            )}

            {/* Talles */}
            {sizes.length > 0 && (
              <Section label="TALLES">
                {sizes.map((s) => <Tag key={s} size>{s}</Tag>)}
              </Section>
            )}

            {/* Descripción */}
            {product.description && (
              <div className="product-modal-section">
                <p className="product-modal-label">DESCRIPCIÓN</p>
                <p className="product-modal-desc">{product.description}</p>
              </div>
            )}

            <a
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="product-modal-cta"
            >
              Ver en {storeName} ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-componentes locales ───────────────────────────────────────────────────

function Section({ label, children }) {
  return (
    <div className="product-modal-section">
      <p className="product-modal-label">{label}</p>
      <div className="product-modal-tags">{children}</div>
    </div>
  );
}

function Tag({ children, accent, muted, size }) {
  const cls = [
    "pmodal-tag",
    accent ? "accent" : "",
    muted  ? "muted"  : "",
    size   ? "size"   : "",
  ].filter(Boolean).join(" ");
  return <span className={cls}>{children}</span>;
}
