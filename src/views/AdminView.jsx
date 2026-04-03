/**
 * AdminView.jsx
 *
 * Acceso: navegar a /#/[RUTA_SECRETA] en el navegador.
 * La ruta secreta es el SHA-256 hex de la palabra clave.
 *
 * Para generar tu propia ruta secreta:
 *   node -e "const c=require('crypto');console.log(c.createHash('sha256').update('tu_palabra').digest('hex'))"
 *
 * El hash por defecto corresponde a "scrapeando_admin" — cambialo.
 * En App.jsx usar: window.location.hash === `#/${ADMIN_HASH}`
 */

import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

// SHA-256 de "scrapeando_admin" — reemplazá por el hash de tu palabra secreta
export const ADMIN_HASH = "114d6cf3d9727c19a144416dabcc11616dd54c2d53567764c290209d61774fbe";

export function AdminView({ isAdmin, onLogin, onLogout, loginLoading, loginError, onClearError }) {
  const [section, setSection] = useState("stores");

  // ── Estado ────────────────────────────────────────────────────────────────
  const [stores, setStores]           = useState([]);
  const [enrichStatus, setEnrichStatus] = useState(null);
  const [byStore, setByStore]         = useState([]);
  const [aiStats, setAiStats]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [log, setLog]                 = useState([]);

  // Formulario nueva tienda
  const [newStore, setNewStore] = useState({ name: "", url: "", catalog_url: "", country: "AR", location: "" });

  // Estados de operaciones en curso
  const [scraping, setScraping]       = useState(null);
  const [scrapingAll, setScrapingAll] = useState(false);
  const [enriching, setEnriching]     = useState(null);
  const [enrichingAll, setEnrichingAll] = useState(false);
  const [addingStore, setAddingStore] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const addLog = useCallback((msg, type = "info") => {
    const time = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLog(prev => [{ id: Date.now(), time, msg, type }, ...prev].slice(0, 50));
  }, []);

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/stores");
      setStores(Array.isArray(data) ? data : []);
    } catch (e) {
      addLog(`Error cargando tiendas: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [addLog]);

  const fetchEnrichStatus = useCallback(async () => {
    try {
      const data = await api.get("/enrich/status");
      setEnrichStatus(data);
      setByStore(data.by_store || []);
    } catch (e) {
      addLog(`Error cargando estado: ${e.message}`, "error");
    }
  }, [addLog]);

  const fetchAiStats = useCallback(async () => {
    try {
      const data = await api.get("/ai/stats");
      setAiStats(data);
    } catch (e) {
      addLog(`Error cargando stats IA: ${e.message}`, "error");
    }
  }, [addLog]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchStores();
    fetchEnrichStatus();
    fetchAiStats();
  }, [isAdmin]);

  // ── Handlers: tiendas ─────────────────────────────────────────────────────
  async function handleAddStore(e) {
    e.preventDefault();
    if (!newStore.name || !newStore.url || !newStore.catalog_url) return;
    setAddingStore(true);
    try {
      const store = await api.post("/stores", newStore);
      setStores(s => [...s, store]);
      setNewStore({ name: "", url: "", catalog_url: "", country: "AR", location: "" });
      addLog(`Tienda "${store.name}" agregada`, "success");
    } catch (e) {
      addLog(`Error: ${e.message}`, "error");
    } finally {
      setAddingStore(false);
    }
  }

  async function handleDeleteStore(id, name) {
    if (!confirm(`¿Eliminar "${name}" y todos sus productos?`)) return;
    try {
      await api.del(`/stores/${id}`);
      setStores(s => s.filter(st => st.id !== id));
      addLog(`Tienda "${name}" eliminada`, "success");
    } catch (e) {
      addLog(`Error: ${e.message}`, "error");
    }
  }

  async function handleToggleStore(id, name, current) {
    try {
      await api.post(`/stores/${id}/toggle`, {});
      setStores(s => s.map(st => st.id === id ? { ...st, active: !current } : st));
      addLog(`"${name}" ${current ? "desactivada" : "activada"}`, "success");
    } catch (e) {
      addLog(`Error: ${e.message}`, "error");
    }
  }

  // ── Handlers: scraping ────────────────────────────────────────────────────
  async function handleScrapeStore(id, name) {
    setScraping(id);
    addLog(`Iniciando scraping de "${name}"...`, "info");
    try {
      const r = await api.post(`/scrape/${id}`, {});
      addLog(`"${name}": ${r.new_products} nuevos, ${r.updated_products} actualizados`, "success");
      fetchStores();
      fetchEnrichStatus();
    } catch (e) {
      addLog(`Error scrapeando "${name}": ${e.message}`, "error");
    } finally {
      setScraping(null);
    }
  }

  async function handleScrapeAll() {
    setScrapingAll(true);
    addLog("Iniciando scraping de todas las tiendas activas...", "info");
    try {
      const results = await api.post("/scrape-all", {});
      const total = results.reduce((acc, r) => acc + r.new_products, 0);
      addLog(`Scraping completo — ${total} productos nuevos en ${results.length} tiendas`, "success");
      fetchStores();
      fetchEnrichStatus();
    } catch (e) {
      addLog(`Error: ${e.message}`, "error");
    } finally {
      setScrapingAll(false);
    }
  }

  // ── Handlers: enrich ──────────────────────────────────────────────────────
  async function handleEnrichStore(id, name) {
    setEnriching(id);
    addLog(`Enriqueciendo "${name}"...`, "info");
    try {
      const r = await api.post(`/enrich/${id}?batch_size=50`, {});
      addLog(`"${name}": ${r.enriched_this_run} clasificados, ${r.failed_this_run} fallidos`, "success");
      fetchEnrichStatus();
      fetchAiStats();
    } catch (e) {
      addLog(`Error: ${e.message}`, "error");
    } finally {
      setEnriching(null);
    }
  }

  async function handleEnrichAll() {
    setEnrichingAll(true);
    addLog("Enriqueciendo batch global (50 productos)...", "info");
    try {
      const r = await api.post("/enrich?batch_size=50", {});
      const pending = r.status?.pending ?? "?";
      addLog(`${r.enriched_this_run} clasificados — ${pending} pendientes`, "success");
      fetchEnrichStatus();
      fetchAiStats();
    } catch (e) {
      addLog(`Error: ${e.message}`, "error");
    } finally {
      setEnrichingAll(false);
    }
  }

  // ── Login form ────────────────────────────────────────────────────────────
  if (!isAdmin) {
    return <LoginPanel onLogin={onLogin} loading={loginLoading} error={loginError} onClearError={onClearError} />;
  }

  // ── Panel admin ───────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerDot} />
          <span style={styles.headerTitle}>PANEL DE ADMINISTRACIÓN</span>
        </div>
        <button style={styles.logoutBtn} onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>

      {/* Nav interna */}
      <div style={styles.tabs}>
        {[
          ["stores", "Tiendas"],
          ["scraping", "Scraping"],
          ["enrich", "Enrich"],
          ["ai", "IA / Stats"],
          ["log", `Log (${log.length})`],
        ].map(([id, label]) => (
          <button
            key={id}
            style={{ ...styles.tab, ...(section === id ? styles.tabActive : {}) }}
            onClick={() => setSection(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div style={styles.content}>

        {/* ── TIENDAS ── */}
        {section === "stores" && (
          <div>
            <SectionTitle>Agregar tienda</SectionTitle>
            <form onSubmit={handleAddStore} style={styles.form}>
              <div style={styles.formGrid}>
                <AdminInput placeholder="Nombre *" value={newStore.name} onChange={v => setNewStore(s => ({ ...s, name: v }))} />
                <AdminInput placeholder="URL base *" value={newStore.url} onChange={v => setNewStore(s => ({ ...s, url: v }))} />
                <AdminInput placeholder="URL catálogo *" value={newStore.catalog_url} onChange={v => setNewStore(s => ({ ...s, catalog_url: v }))} />
                <AdminInput placeholder="Ubicación" value={newStore.location} onChange={v => setNewStore(s => ({ ...s, location: v }))} />
              </div>
              <button type="submit" style={styles.btnPrimary} disabled={addingStore || !newStore.name || !newStore.url || !newStore.catalog_url}>
                {addingStore ? "Guardando…" : "+ Agregar"}
              </button>
            </form>

            <SectionTitle style={{ marginTop: "2rem" }}>Tiendas ({stores.length})</SectionTitle>
            {loading ? <p style={styles.muted}>Cargando…</p> : (
              <div style={styles.storeList}>
                {stores.map(s => {
                  const status = byStore.find(b => b.store_id === s.id);
                  return (
                    <div key={s.id} style={{ ...styles.storeRow, opacity: s.active ? 1 : 0.5 }}>
                      <div style={styles.storeInfo}>
                        <span style={{ ...styles.dot, background: s.active ? "#4ade80" : "#666" }} />
                        <div>
                          <div style={styles.storeName}>{s.name}</div>
                          <div style={styles.storeUrl}>{s.catalog_url}</div>
                          {status && (
                            <div style={styles.storeProgress}>
                              <div style={styles.progressBar}>
                                <div style={{ ...styles.progressFill, width: `${status.percent}%` }} />
                              </div>
                              <span style={styles.muted}>{status.classified}/{status.total} clasificados</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={styles.storeActions}>
                        <button style={styles.btnSmall} onClick={() => handleToggleStore(s.id, s.name, s.active)}>
                          {s.active ? "Desactivar" : "Activar"}
                        </button>
                        <button style={{ ...styles.btnSmall, ...styles.btnDanger }} onClick={() => handleDeleteStore(s.id, s.name)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── SCRAPING ── */}
        {section === "scraping" && (
          <div>
            <SectionTitle>Scraping global</SectionTitle>
            <button style={styles.btnPrimary} onClick={handleScrapeAll} disabled={scrapingAll}>
              {scrapingAll ? "⏳ Scrapeando todas…" : "⟳ Scrapear todas las tiendas activas"}
            </button>

            <SectionTitle style={{ marginTop: "2rem" }}>Por tienda</SectionTitle>
            <div style={styles.storeList}>
              {stores.filter(s => s.active).map(s => (
                <div key={s.id} style={styles.storeRow}>
                  <div style={styles.storeName}>{s.name}</div>
                  <button
                    style={styles.btnSmall}
                    onClick={() => handleScrapeStore(s.id, s.name)}
                    disabled={scraping === s.id}
                  >
                    {scraping === s.id ? "⏳" : "⟳ Scrapear"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ENRICH ── */}
        {section === "enrich" && (
          <div>
            <SectionTitle>Enriquecimiento global</SectionTitle>
            {enrichStatus && (
              <div style={styles.statRow}>
                <Stat label="Total" value={enrichStatus.total} />
                <Stat label="Enriquecidos" value={enrichStatus.enriched} />
                <Stat label="Pendientes" value={enrichStatus.pending} accent={enrichStatus.pending > 0} />
                <Stat label="%" value={`${enrichStatus.percent}%`} />
              </div>
            )}
            <button
              style={styles.btnPrimary}
              onClick={handleEnrichAll}
              disabled={enrichingAll || !enrichStatus || enrichStatus.pending === 0}
            >
              {enrichingAll ? "⏳ Clasificando…" : `✦ Enriquecer batch (50)${enrichStatus?.pending ? ` — ${enrichStatus.pending} pendientes` : ""}`}
            </button>

            <SectionTitle style={{ marginTop: "2rem" }}>Por tienda</SectionTitle>
            <div style={styles.storeList}>
              {byStore.map(s => (
                <div key={s.store_id} style={styles.storeRow}>
                  <div>
                    <div style={styles.storeName}>{s.store_name}</div>
                    <div style={styles.muted}>{s.classified}/{s.total} — {s.pending} pendientes</div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${s.percent}%` }} />
                    </div>
                  </div>
                  <button
                    style={{ ...styles.btnSmall, ...(s.pending === 0 ? styles.btnDisabled : {}) }}
                    onClick={() => handleEnrichStore(s.store_id, s.store_name)}
                    disabled={enriching === s.store_id || s.pending === 0}
                  >
                    {enriching === s.store_id ? "⏳" : s.pending === 0 ? "✓ Listo" : "✦ Enriquecer"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── IA / STATS ── */}
        {section === "ai" && (
          <div>
            <SectionTitle>Clasificación IA</SectionTitle>
            {aiStats ? (
              <>
                <div style={styles.statRow}>
                  <Stat label="Total productos" value={aiStats.total_products} />
                  <Stat label="Clasificados" value={aiStats.classified} />
                  <Stat label="Pendientes" value={aiStats.pending} accent={aiStats.pending > 0} />
                  <Stat label="Tasa" value={aiStats.classification_rate} />
                </div>
                {aiStats.cost_estimate_pending && (
                  <div style={styles.costBox}>
                    <div style={styles.muted}>Costo estimado para clasificar pendientes</div>
                    <div style={styles.costValue}>
                      USD {aiStats.cost_estimate_pending.estimated_cost_usd} · ARS {aiStats.cost_estimate_pending.estimated_cost_ars?.toLocaleString("es-AR")}
                    </div>
                    <div style={styles.muted}>{aiStats.cost_estimate_pending.product_count} productos × ~$0.0005</div>
                  </div>
                )}
              </>
            ) : (
              <p style={styles.muted}>Cargando…</p>
            )}
            <button style={{ ...styles.btnSmall, marginTop: "1rem" }} onClick={() => { fetchAiStats(); fetchEnrichStatus(); }}>
              ⟳ Actualizar
            </button>
          </div>
        )}

        {/* ── LOG ── */}
        {section === "log" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <SectionTitle>Log de operaciones</SectionTitle>
              <button style={styles.btnSmall} onClick={() => setLog([])}>Limpiar</button>
            </div>
            {log.length === 0 ? (
              <p style={styles.muted}>Sin operaciones registradas todavía.</p>
            ) : (
              <div style={styles.logContainer}>
                {log.map(entry => (
                  <div key={entry.id} style={{ ...styles.logEntry, ...(entry.type === "error" ? styles.logError : entry.type === "success" ? styles.logSuccess : {}) }}>
                    <span style={styles.logTime}>{entry.time}</span>
                    <span>{entry.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function LoginPanel({ onLogin, loading, error, onClearError }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    onLogin(username.trim(), password);
  }

  return (
    <div style={styles.loginWrap}>
      <div style={styles.loginBox}>
        <div style={styles.loginTitle}>ACCESO RESTRINGIDO</div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            style={styles.loginInput}
            value={username}
            onChange={e => { setUsername(e.target.value); onClearError(); }}
            placeholder="Usuario"
            autoFocus
            autoComplete="username"
          />
          <input
            style={styles.loginInput}
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); onClearError(); }}
            placeholder="Contraseña"
            autoComplete="current-password"
          />
          {error && <div style={styles.loginError}>{error}</div>}
          <button type="submit" style={styles.loginBtn} disabled={loading || !username || !password}>
            {loading ? "Verificando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

function SectionTitle({ children, style }) {
  return <div style={{ ...styles.sectionTitle, ...style }}>{children}</div>;
}

function AdminInput({ placeholder, value, onChange }) {
  return (
    <input
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}

function Stat({ label, value, accent }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statValue, color: accent ? "#f87171" : "#e8ff3b" }}>{value}</div>
    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = {
  container: {
    background: "#0f0f0f",
    minHeight: "100vh",
    color: "#e0e0e0",
    fontFamily: "'DM Mono', 'Courier New', monospace",
    fontSize: "0.85rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    borderBottom: "1px solid #222",
    background: "#0a0a0a",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "0.6rem" },
  headerDot: {
    width: "8px", height: "8px", borderRadius: "50%",
    background: "#e8ff3b", boxShadow: "0 0 8px #e8ff3b",
  },
  headerTitle: { color: "#e8ff3b", fontWeight: "700", letterSpacing: "0.15em", fontSize: "0.78rem" },
  logoutBtn: {
    background: "none", border: "1px solid #333", color: "#666",
    padding: "0.3rem 0.75rem", borderRadius: "4px", cursor: "pointer",
    fontFamily: "inherit", fontSize: "0.75rem", transition: "all 0.15s",
  },
  tabs: {
    display: "flex", gap: "0", borderBottom: "1px solid #222",
    background: "#0a0a0a",
  },
  tab: {
    background: "none", border: "none", borderRight: "1px solid #1a1a1a",
    color: "#555", padding: "0.75rem 1.5rem", cursor: "pointer",
    fontFamily: "inherit", fontSize: "0.78rem", letterSpacing: "0.05em",
    transition: "all 0.15s",
  },
  tabActive: { color: "#e8ff3b", borderBottom: "2px solid #e8ff3b", background: "#111" },
  content: { padding: "2rem", maxWidth: "900px", margin: "0 auto" },
  sectionTitle: {
    fontSize: "0.65rem", color: "#555", letterSpacing: "0.15em",
    textTransform: "uppercase", marginBottom: "1rem",
    paddingBottom: "0.5rem", borderBottom: "1px solid #1a1a1a",
  },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" },
  input: {
    background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#e0e0e0",
    padding: "0.6rem 0.85rem", borderRadius: "6px", fontFamily: "inherit",
    fontSize: "0.82rem", outline: "none", width: "100%", boxSizing: "border-box",
  },
  btnPrimary: {
    background: "#e8ff3b", color: "#0f0f0f", border: "none",
    padding: "0.6rem 1.25rem", borderRadius: "6px", cursor: "pointer",
    fontFamily: "inherit", fontSize: "0.78rem", fontWeight: "700",
    letterSpacing: "0.05em", alignSelf: "flex-start", transition: "opacity 0.15s",
  },
  btnSmall: {
    background: "none", border: "1px solid #2a2a2a", color: "#888",
    padding: "0.3rem 0.75rem", borderRadius: "4px", cursor: "pointer",
    fontFamily: "inherit", fontSize: "0.75rem", whiteSpace: "nowrap",
    transition: "all 0.15s",
  },
  btnDanger: { borderColor: "#3a1a1a", color: "#f87171" },
  btnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  storeList: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  storeRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#141414", border: "1px solid #1e1e1e", borderRadius: "8px",
    padding: "0.85rem 1rem", gap: "1rem",
  },
  storeInfo: { display: "flex", alignItems: "flex-start", gap: "0.75rem", flex: 1 },
  storeActions: { display: "flex", gap: "0.4rem", flexShrink: 0 },
  storeName: { fontWeight: "500", color: "#d0d0d0", marginBottom: "0.1rem" },
  storeUrl: { fontSize: "0.72rem", color: "#444", marginBottom: "0.3rem" },
  storeProgress: { display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" },
  progressBar: { height: "2px", background: "#222", borderRadius: "1px", width: "120px" },
  progressFill: { height: "100%", background: "#e8ff3b", borderRadius: "1px", transition: "width 0.4s" },
  dot: { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, marginTop: "5px" },
  statRow: { display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" },
  statCard: {
    background: "#141414", border: "1px solid #1e1e1e", borderRadius: "8px",
    padding: "1rem 1.25rem", minWidth: "120px",
  },
  statLabel: { fontSize: "0.65rem", color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" },
  statValue: { fontSize: "1.5rem", fontWeight: "700", color: "#e8ff3b", letterSpacing: "-0.02em" },
  costBox: {
    background: "#141414", border: "1px solid #1e1e1e", borderRadius: "8px",
    padding: "1rem 1.25rem", marginTop: "1rem",
  },
  costValue: { fontSize: "1.1rem", color: "#e0e0e0", fontWeight: "600", margin: "0.4rem 0" },
  muted: { color: "#444", fontSize: "0.78rem" },
  logContainer: {
    display: "flex", flexDirection: "column", gap: "0.25rem",
    maxHeight: "500px", overflowY: "auto",
  },
  logEntry: {
    display: "flex", gap: "1rem", padding: "0.4rem 0.75rem",
    borderRadius: "4px", background: "#141414", fontSize: "0.78rem",
  },
  logSuccess: { borderLeft: "2px solid #4ade80" },
  logError: { borderLeft: "2px solid #f87171", background: "#1a1010" },
  logTime: { color: "#444", flexShrink: 0 },
  loginWrap: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#0f0f0f",
  },
  loginBox: {
    background: "#141414", border: "1px solid #2a2a2a", borderRadius: "12px",
    padding: "2.5rem", width: "320px",
  },
  loginTitle: {
    color: "#e8ff3b", fontWeight: "700", letterSpacing: "0.2em",
    fontSize: "0.75rem", marginBottom: "1.5rem", textAlign: "center",
  },
  loginInput: {
    background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#e0e0e0",
    padding: "0.7rem 1rem", borderRadius: "6px", fontFamily: "inherit",
    fontSize: "0.85rem", outline: "none", width: "100%", boxSizing: "border-box",
  },
  loginBtn: {
    background: "#e8ff3b", color: "#0f0f0f", border: "none",
    padding: "0.75rem", borderRadius: "6px", cursor: "pointer",
    fontFamily: "inherit", fontSize: "0.82rem", fontWeight: "700",
    width: "100%", letterSpacing: "0.05em",
  },
  loginError: { color: "#f87171", fontSize: "0.78rem", textAlign: "center" },
};
