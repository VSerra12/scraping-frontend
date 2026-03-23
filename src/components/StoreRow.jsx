import { timeAgo } from "../lib/api";

export function StoreRow({
  store,
  onScrape,
  onDelete,
  onEnrich,
  scraping,
  enrichingStore,
  storeStatus,
  isAdmin,
}) {
  const pct        = storeStatus?.percent    ?? null;
  const pending    = storeStatus?.pending    ?? null;
  const total      = storeStatus?.total      ?? null;
  const classified = storeStatus?.classified ?? null;

  return (
    <div className={`store-row ${!store.active ? "inactive" : ""}`}>

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

        {/* Acciones solo para admin */}
        {isAdmin && (
          <>
            {pending > 0 && (
              <button
                className="btn-icon enrich"
                onClick={() => onEnrich(store.id)}
                disabled={enrichingStore === store.id}
                title="Clasificar productos pendientes"
              >
                {enrichingStore === store.id ? "⏳" : "✦"}
              </button>
            )}
            <button
              className="btn-icon"
              onClick={() => onScrape(store.id)}
              disabled={scraping === store.id}
              title="Scrapear ahora"
            >
              {scraping === store.id ? "⏳" : "⟳"}
            </button>
            <button
              className="btn-icon danger"
              onClick={() => onDelete(store.id)}
              title="Eliminar tienda"
            >
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  );
}