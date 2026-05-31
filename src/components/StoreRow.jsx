import { useState } from "react";
import { timeAgo } from "../lib/api";
import { StoreProductsPanel } from "./StoreProductsPanel";
import { EditStoreModal } from "./AddStoreModal";

const SCRAPER_LABELS = {
  auto:        "auto",
  tiendanube:  "TN",
  woocommerce: "WC",
  shopnatural: "SN",
  generic:     "gen",
};

export function StoreRow({
  store,
  onScrape,
  onDelete,
  onEnrich,
  onReEnrich,
  onUpdate,          // nuevo: callback para guardar edición
  scraping,
  enrichingStore,
  reEnrichingStore,
  storeStatus,
  isAdmin,
}) {
  const [showPanel, setShowPanel] = useState(false);
  const [showEdit,  setShowEdit]  = useState(false);
  const [saving,    setSaving]    = useState(false);

  const pct        = storeStatus?.percent    ?? null;
  const pending    = storeStatus?.pending    ?? null;
  const total      = storeStatus?.total      ?? null;
  const classified = storeStatus?.classified ?? null;

  const isEnriching   = enrichingStore === store.id;
  const isReEnriching = reEnrichingStore === store.id;
  const isScraping    = scraping === store.id;
  const isBusy        = isEnriching || isReEnriching || isScraping || saving;

  const scraperLabel = SCRAPER_LABELS[store.scraper_type] || store.scraper_type || "auto";

  async function handleSave(id, data) {
    setSaving(true);
    try {
      await onUpdate(id, data);
      setShowEdit(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div
        className={`store-row ${!store.active ? "inactive" : ""}`}
        style={{ borderRadius: showPanel ? "10px 10px 0 0" : undefined }}
      >
        <div className="store-info">
          <span className={`status-dot ${store.active ? "active" : ""}`} />
          <div style={{ flex: 1 }}>
            <p className="store-name">
              {store.name}
              {/* Badge del tipo de scraper */}
              <span style={{
                marginLeft: "0.5rem",
                fontSize: "0.58rem",
                fontFamily: "'Unbounded', sans-serif",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontWeight: 700,
                background: store.scraper_type === "auto" ? "var(--surface2)" : "var(--lila)",
                border: `1px solid ${store.scraper_type === "auto" ? "var(--border)" : "var(--indigo-border)"}`,
                color: store.scraper_type === "auto" ? "var(--muted)" : "var(--indigo)",
                padding: "0.1rem 0.4rem",
                borderRadius: "4px",
                verticalAlign: "middle",
              }}>
                {scraperLabel}
              </span>
            </p>
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
              {/* ☰ Panel de productos */}
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

              {/* ✎ Editar tienda */}
              <button
                className="btn-icon"
                onClick={() => setShowEdit(true)}
                disabled={isBusy}
                title="Editar tienda (nombre, URL, tipo de scraper…)"
                style={{ fontSize: "0.75rem" }}
              >
                ✎
              </button>

              {/* ↺ Re-enriquecer */}
              {total > 0 && (
                <button
                  className="btn-icon"
                  onClick={() => onReEnrich(store.id)}
                  disabled={isBusy}
                  title="Re-clasificar todos los productos de esta tienda"
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

      {showPanel && (
        <StoreProductsPanel store={store} onClose={() => setShowPanel(false)} />
      )}

      {showEdit && (
        <EditStoreModal
          store={store}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
          loading={saving}
        />
      )}
    </div>
  );
}