import { StoreRow } from "../components/StoreRow";
import { AddStoreModal } from "../components/AddStoreModal";

export function StoresView({
  stores,
  enrichStatus,
  byStore,
  loadingStores,
  enriching,
  enrichingStore,
  scrapingStore,
  scrapingAll,
  addingStore,
  showAddStore,
  setShowAddStore,
  isAdmin,
  onRefresh,
  onScrapeStore,
  onScrapeAll,
  onEnrich,
  onEnrichStore,
  onDeleteStore,
  onAddStore,
  // nuevas props para force re-enrich
  onReEnrich,
  onReEnrichStore,
  reEnriching,
  reEnrichingStore,
}) {
  const activeStores = stores.filter((s) => s.active);

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Tiendas</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            className="btn secondary"
            onClick={onRefresh}
            disabled={loadingStores}
          >
            {loadingStores ? "⏳" : "⟳ Actualizar"}
          </button>
          {isAdmin && (
            <button className="btn primary" onClick={() => setShowAddStore(true)}>
              + Agregar tienda
            </button>
          )}
        </div>
      </div>

      {loadingStores && (
        <div className="state-box">
          <div className="spinner" />
          <p>Cargando tiendas…</p>
        </div>
      )}

      {!loadingStores && stores.length === 0 && (
        <div className="state-box">
          <div className="emoji">🏪</div>
          <p>No hay tiendas todavía.{isAdmin ? " Agregá la primera." : ""}</p>
        </div>
      )}

      {!loadingStores && stores.length > 0 && (
        <div className="stores-list">
          {stores.map((s) => (
            <StoreRow
              key={s.id}
              store={s}
              onScrape={onScrapeStore}
              onDelete={onDeleteStore}
              onEnrich={onEnrichStore}
              onReEnrich={onReEnrichStore}
              scraping={scrapingStore}
              enrichingStore={enrichingStore}
              reEnrichingStore={reEnrichingStore}
              storeStatus={byStore.find((b) => b.store_id === s.id)}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Barra de acciones admin */}
      {isAdmin && !loadingStores && activeStores.length > 0 && (
        <div className="scrape-all-bar">
          {enrichStatus && enrichStatus.pending > 0 && (
            <div className="enrich-banner">
              <span>
                ⏳ <strong>{enrichStatus.pending}</strong> productos pendientes
                de clasificación ({enrichStatus.percent}% listo)
              </span>
              <div className="enrich-bar">
                <div
                  className="enrich-bar-fill"
                  style={{ width: `${enrichStatus.percent}%` }}
                />
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
            {/* Re-enriquecer todo (force) */}
            <button
              className="btn secondary"
              onClick={onReEnrich}
              disabled={reEnriching || enriching}
              title="Re-clasifica productos ya procesados (prioriza los con categoría 'otro')"
              style={{ borderColor: "var(--indigo-border)", color: "var(--indigo)" }}
            >
              {reEnriching ? "⏳ Re-clasificando…" : "↺ Re-enriquecer todo"}
            </button>

            {/* Enriquecer pendientes */}
            <button
              className="btn secondary"
              onClick={onEnrich}
              disabled={enriching || reEnriching || !enrichStatus || enrichStatus.pending === 0}
              title={enrichStatus?.pending === 0 ? "No hay pendientes" : "Clasificar hasta 50 productos nuevos"}
            >
              {enriching
                ? "⏳ Clasificando…"
                : `✦ Enriquecer ahora${enrichStatus?.pending ? ` (${enrichStatus.pending})` : ""}`}
            </button>

            <button
              className="btn danger-outline"
              onClick={onScrapeAll}
              disabled={scrapingAll}
            >
              {scrapingAll ? "⏳ Scrapeando todas…" : "⟳ Scrapear todas las tiendas activas"}
            </button>
          </div>
        </div>
      )}

      {/* Banner de progreso para no-admin */}
      {!isAdmin && enrichStatus && enrichStatus.pending > 0 && (
        <div className="enrich-banner" style={{ marginTop: "1rem" }}>
          <span>
            ⏳ <strong>{enrichStatus.pending}</strong> productos pendientes de clasificación
            ({enrichStatus.percent}% listo)
          </span>
          <div className="enrich-bar">
            <div className="enrich-bar-fill" style={{ width: `${enrichStatus.percent}%` }} />
          </div>
        </div>
      )}

      {showAddStore && (
        <AddStoreModal
          onClose={() => setShowAddStore(false)}
          onAdd={onAddStore}
          loading={addingStore}
        />
      )}
    </>
  );
}