import { formatPrice, proxyImage } from "../lib/api";

export function VariantModal({ product, onClose }) {
  const variants = product.variants || [];
  const storeName = product.store_name || product.store || "—";

  return (
    <div className="variant-overlay" onClick={onClose}>
      <div className="variant-modal" onClick={(e) => e.stopPropagation()}>
        <button className="variant-close" onClick={onClose}>✕</button>

        <h2 className="variant-title">{product.title}</h2>
        <p className="variant-store">
          {storeName} · {formatPrice(product.price, product.currency || "ARS")}
        </p>

        <div className="variant-grid">
          {variants.map((v) => (
            <a
              key={v.id}
              href={v.product_url || product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="variant-item"
            >
              <div className="variant-img-wrap">
                <img
                  src={
                    v.image_url
                      ? proxyImage(v.image_url)
                      : product.image_url
                        ? proxyImage(product.image_url)
                        : null
                  }
                  alt={v.color || product.title}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/300x400/1a1a1a/444?text=Sin+imagen";
                  }}
                />
              </div>
              {v.color && <span className="variant-color">{v.color}</span>}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
