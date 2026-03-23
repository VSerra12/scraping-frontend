import { useState } from "react";
import { formatPrice, proxyImage } from "../lib/api";
import { VariantModal } from "./VariantModal";
import { ProductModal } from "./ProductModal";

export function ProductCard({ product }) {
  const storeName = product.store_name || product.store || "—";
  const isEnriched = product.ai_classified === true;
  const variants = product.variants || [];
  const hasVariants = variants.length > 1;
  const [showVariants, setShowVariants] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const styleTags = Array.isArray(product.style_tags)
    ? product.style_tags
    : (() => {
        try { return JSON.parse(product.style_tags || "[]"); }
        catch { return []; }
      })();

  function handleClick(e) {
    e.preventDefault();
    if (hasVariants) { setShowVariants(true); return; }
    setShowDetail(true);
  }

  return (
    <>
      <a
        href={product.product_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`product-card ${!isEnriched ? "card-pending" : ""}`}
        onClick={handleClick}
      >
        {/* Imagen */}
        <div className="card-img-wrap">
          <img
            src={product.image_url ? proxyImage(product.image_url) : null}
            alt={product.title}
            loading="lazy"
            onError={(e) => {
              e.target.src = "https://placehold.co/300x400/1a1a1a/444?text=Sin+imagen";
            }}
          />

          {isEnriched ? (
            <>
              <span className="card-category">{product.category || "—"}</span>
              {product.gender && product.gender !== "unisex" && (
                <span className="card-gender">{product.gender}</span>
              )}
            </>
          ) : (
            <span className="card-classifying">⏳ clasificando…</span>
          )}

          {hasVariants && (
            <span className="card-variants-badge">{variants.length} colores</span>
          )}
        </div>

        {/* Body */}
        <div className="card-body">
          <p className="card-store">{storeName}</p>
          <h3 className="card-title">{product.title}</h3>

          {hasVariants && (
            <div className="card-color-dots">
              {variants.slice(0, 6).map((v) => (
                <span key={v.id} className="color-dot" title={v.color || ""} />
              ))}
              {variants.length > 6 && (
                <span className="color-dot-more">+{variants.length - 6}</span>
              )}
            </div>
          )}

          <div className="card-tags">
            {isEnriched
              ? styleTags.slice(0, 3).map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))
              : <span className="tag tag-pending">pendiente de análisis</span>
            }
          </div>

          <div className="card-footer">
            <span className="card-price">
              {formatPrice(product.price, product.currency || "ARS")}
            </span>
            <span className="card-link-icon">{hasVariants ? "⊞" : "↗"}</span>
          </div>
        </div>
      </a>

      {showVariants && (
        <VariantModal product={product} onClose={() => setShowVariants(false)} />
      )}
      {showDetail && (
        <ProductModal product={product} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}
