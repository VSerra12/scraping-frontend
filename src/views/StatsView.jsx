import { timeAgo } from "../lib/api";

export function StatsView({ stats, loadingStats, onRefresh, isAdmin, aiStats }) {
  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Estadísticas</h2>
        <button
          className="btn secondary"
          onClick={onRefresh}
          disabled={loadingStats}
        >
          {loadingStats ? "⏳" : "⟳ Actualizar"}
        </button>
      </div>

      {loadingStats && (
        <div className="state-box">
          <div className="spinner" />
          <p>Cargando estadísticas…</p>
        </div>
      )}

      {!loadingStats && stats && (
        <div className="stats-grid">

          <div className="stat-card">
            <span className="stat-label">Tiendas activas</span>
            <span className="stat-value">{stats.active_stores ?? "—"}</span>
            <span className="stat-sub">
              de {stats.total_stores ?? "—"} totales
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Productos indexados</span>
            <span className="stat-value">{stats.total_products ?? "—"}</span>
            <span className="stat-sub">
              {stats.classified_products ?? 0} clasificados por IA
            </span>
          </div>

          <div
            className="stat-card"
            style={{
              borderColor:
                stats.pending_enrichment > 0
                  ? "rgba(232,255,59,0.25)"
                  : "var(--border)",
            }}
          >
            <span className="stat-label">Pendientes de clasificar</span>
            <span
              className="stat-value"
              style={{
                color:
                  stats.pending_enrichment > 0 ? "var(--accent)" : "#4ade80",
              }}
            >
              {stats.pending_enrichment > 0 ? stats.pending_enrichment : "✓"}
            </span>
            <span className="stat-sub">
              {stats.pending_enrichment > 0
                ? `${stats.enriched_products ?? 0} enriquecidos de ${stats.total_products}`
                : "todo clasificado"}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Búsquedas realizadas</span>
            <span className="stat-value">{stats.total_searches ?? "—"}</span>
            <span className="stat-sub">total histórico</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Último scraping</span>
            <span
              className="stat-value"
              style={{ fontSize: "1.1rem", paddingTop: "0.4rem" }}
            >
              {stats.last_scraped ? timeAgo(stats.last_scraped) : "—"}
            </span>
            <span className="stat-sub">tienda más reciente</span>
          </div>

        </div>
      )}

      {/* Bloque de costo IA — solo visible para admin autenticado */}
      {!loadingStats && isAdmin && aiStats && (
        <div className="stat-card" style={{ marginTop: "1.5rem", display: "block" }}>
          <span className="stat-label">Costo estimado para clasificar pendientes</span>
          {aiStats.cost_estimate_pending ? (
            <>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0.5rem 0 0.25rem", color: "var(--fg)" }}>
                USD {aiStats.cost_estimate_pending.estimated_cost_usd}
                {" · "}
                ARS {aiStats.cost_estimate_pending.estimated_cost_ars?.toLocaleString("es-AR")}
              </div>
              <span className="stat-sub">
                {aiStats.cost_estimate_pending.product_count} productos × ~$0.0005
              </span>
            </>
          ) : (
            <span className="stat-sub" style={{ marginTop: "0.5rem", display: "block" }}>
              {aiStats.pending === 0 ? "✓ Todo clasificado, sin costo pendiente" : "Sin estimado disponible"}
            </span>
          )}
        </div>
      )}

      {!loadingStats && !stats && (
        <div className="state-box">
          <div className="emoji">📊</div>
          <p>No se pudieron cargar las estadísticas.</p>
        </div>
      )}
    </>
  );
}