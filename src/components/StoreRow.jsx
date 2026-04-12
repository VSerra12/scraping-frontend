import { useState } from "react";
import { timeAgo } from "../lib/api";
import { StoreProductsPanel } from "./StoreProductsPanel";

export function StoreRow({
  store,
  onScrape,
  onDelete,
  onEnrich,
  onReEnrich,
  scraping,
  enrichingStore,
  reEnrichingStore,
  storeStatus,
  isAdmin,
}) {
  const [showPanel, setShowPanel] = useState(false);

  const pct        = storeStatus?.percent    ?? null;
  const pending    = storeStatus?.pending    ?? null;
  const total      = storeStatus?.total      ?? null;
  const classified = storeStatus?.classified ?? null;

  const isEnriching   = enrichingStore === store.id;
  const isReEnriching = reEnrichingStore === store.id;
  const isScraping    = scraping === store.id;
  const isBusy        = isEnriching || isReEnriching || isScraping;

  return (
    <div>
      <div className={`store-row ${!store.active ? "inactive" : ""}`}
        style={{ borderRadius: showPanel ? "10px 10px 0 0" : undefined }}
      >
        <div className="store-info">
          <span className={`status-dot ${store.active ? "active" : ""}`} />
          <div style={{ flex: 1 }}>
            <p className="store-name">{store.name}</p>
            <p className="store-url">{store.url}</p>
            {total > 0 && (
              <div className="store-progress">
                <div className="store-progress-bar">
                  <div className="store-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="store-progress-label">
                  {classified}/{total} clasificados
                  {pending > 0 && (
                    <span className="store-pending-badge">{pending} pendientes</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="store-meta">
          <span className="last-scraped">{timeAgo(store.last_scraped)}</span>

          {isAdmin && (
            <>
              {/* ☰ Ver / ocultar panel de productos */}
              {total > 0 && (
                <button
                  className="btn-icon"
                  onClick={() => setShowPanel(v => !v)}
                  title={showPanel ? "Ocultar productos" : "Ver productos y re-clasificar"}
                  style={{
                    background:  showPanel ? "var(--indigo)" : undefined,
                    color:       showPanel ? "var(--blanco)"  : undefined,
                    borderColor: showPanel ? "var(--indigo)"  : undefined,
                    fontSize:    "0.75rem",
                  }}
                >
                  ☰
                </button>
              )}

              {/* ↺ Re-enriquecer toda la tienda (batch) */}
              {total > 0 && (
                <button
                  className="btn-icon"
                  onClick={() => onReEnrich(store.id)}
                  disabled={isBusy}
                  title="Re-clasificar todos los productos de esta tienda (batch)"
                  style={{
                    borderColor: isReEnriching ? "var(--indigo)" : "var(--indigo-border)",
                    color:       isReEnriching ? "var(--indigo)" : "var(--muted)",
                  }}
                >
                  {isReEnriching ? "⏳" : "↺"}
                </button>
              )}

              {/* ✦ Enriquecer pendientes */}
              {pending > 0 && (
                <button
                  className="btn-icon enrich"
                  onClick={() => onEnrich(store.id)}
                  disabled={isBusy}
                  title="Clasificar productos pendientes"
                >
                  {isEnriching ? "⏳" : "✦"}
                </button>
              )}

              <button
                className="btn-icon"
                onClick={() => onScrape(store.id)}
                disabled={isBusy}
                title="Scrapear ahora"
              >
                {isScraping ? "⏳" : "⟳"}
              </button>

              <button
                className="btn-icon danger"
                onClick={() => onDelete(store.id)}
                disabled={isBusy}
                title="Eliminar tienda"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>

      {/* Panel expandible de productos */}
      {showPanel && (
        <StoreProductsPanel
          store={store}
          onClose={() => setShowPanel(false)}
        />
      )}
    </div>
  );
}