import { useState, useEffect, useCallback } from "react";
import { api, PAGE_SIZE } from "./lib/api";
import { useToast } from "./hooks/useToast";
import { useAuth } from "./hooks/useAuth";
import { Toast } from "./components/Toast";
import { SearchView } from "./views/SearchView";
import { StoresView } from "./views/StoresView";
import { StatsView } from "./views/StatsView";
import { AdminView, ADMIN_HASH } from "./views/AdminView";
import Logo from "/src/assets/scrapeando_isologo.svg";
import "./App.css";

export default function App() {
  const [view, setView] = useState("search");
  const { toasts, push } = useToast();
  const {
    isAdmin,
    login,
    logout,
    checkSession,
    loginLoading,
    loginError,
    setError,
  } = useAuth();

  // ── Ruta secreta admin ───────────────────────────────────────────────────────
  const [isAdminRoute, setIsAdminRoute] = useState(
    window.location.hash === `#/${ADMIN_HASH}`,
  );

  useEffect(() => {
    const onHash = () =>
      setIsAdminRoute(window.location.hash === `#/${ADMIN_HASH}`);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // ── Estado: búsqueda ────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    color: "",
    gender: "",
    min_price: "",
    max_price: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStores, setSelectedStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [searched, setSearched] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Estado: tiendas ─────────────────────────────────────────────────────────
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);
  const [addingStore, setAddingStore] = useState(false);
  const [scrapingStore, setScrapingStore] = useState(null);
  const [scrapingAll, setScrapingAll] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichingStore, setEnrichingStore] = useState(null);
  const [enrichStatus, setEnrichStatus] = useState(null);
  const [byStore, setByStore] = useState([]);

  // ── Estado: stats ───────────────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [dataVersion, setDataVersion] = useState(0);
  const bumpVersion = useCallback(() => setDataVersion((v) => v + 1), []);

  // ── Fetchers ────────────────────────────────────────────────────────────────
  const fetchStores = useCallback(async () => {
    setLoadingStores(true);
    try {
      const data = await api.get("/stores");
      setStores(Array.isArray(data) ? data : data.stores || []);
    } catch (e) {
      push(`Error cargando tiendas: ${e.message}`, "error");
    } finally {
      setLoadingStores(false);
    }
  }, [push]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await api.get("/stats");
      setStats(data);
    } catch (e) {
      push(`Error cargando estadísticas: ${e.message}`, "error");
    } finally {
      setLoadingStats(false);
    }
  }, [push]);

  const fetchEnrichStatus = useCallback(async () => {
    try {
      const data = await api.get("/enrich/status");
      setEnrichStatus(data);
      setByStore(data.by_store || []);
    } catch (e) {
      push(`Error cargando estado: ${e.message}`, "error");
    }
  }, [push]);

  const fetchAllProducts = useCallback(
    async (currentOffset = 0, append = false) => {
      currentOffset === 0 ? setLoadingAll(true) : setLoadingMore(true);
      try {
        const data = await api.post("/search", {
          query: "",
          limit: PAGE_SIZE,
          offset: currentOffset,
        });
        const results = Array.isArray(data) ? data : data.results || [];
        setTotal(data.total ?? results.length);
        setProducts((prev) => (append ? [...prev, ...results] : results));
        setOffset(currentOffset + results.length);
      } catch (e) {
        push(`Error cargando productos: ${e.message}`, "error");
      } finally {
        setLoadingAll(false);
        setLoadingMore(false);
      }
    },
    [push],
  );

  // ── Efectos ──────────────────────────────────────────────────────────────────
  useEffect(() => { checkSession(); }, []);
  useEffect(() => { fetchStores(); }, []);
  useEffect(() => { if (view === "stores") fetchStores(); }, [view]);
  useEffect(() => { if (view === "stats") fetchStats(); }, [view]);
  useEffect(() => { if (view === "search" && !searched) fetchAllProducts(0, false); }, [view]);

  useEffect(() => {
    if (dataVersion === 0) return;
    if (view === "search") fetchAllProducts(0, false);
    fetchStats();
  }, [dataVersion]);

  useEffect(() => {
    if (view !== "stores") return;
    fetchEnrichStatus();
    const id = setInterval(fetchEnrichStatus, 15_000);
    return () => clearInterval(id);
  }, [view]);

  // ── Auth handlers ─────────────────────────────────────────────────────────────
  async function handleLogin(username, password) {
    const ok = await login(username, password);
    if (ok) push("Sesión iniciada como administrador", "success");
    return ok;
  }

  async function handleLogout() {
    await logout();
    push("Sesión cerrada", "info");
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function setFilter(k, v) {
    setFilters((f) => ({ ...f, [k]: v }));
  }

  function toggleStore(id) {
    setSelectedStores((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function buildSearchBody(currentOffset = 0) {
    return {
      query: query.trim(),
      limit: PAGE_SIZE,
      offset: currentOffset,
      ...(filters.category && { category: filters.category }),
      ...(filters.color && { color: filters.color }),
      ...(filters.gender && { gender: filters.gender }),
      ...(filters.min_price && { min_price: Number(filters.min_price) }),
      ...(filters.max_price && { max_price: Number(filters.max_price) }),
      ...(selectedStores.length === 1 && { store_id: selectedStores[0] }),
    };
  }

  // ── Handlers: búsqueda ───────────────────────────────────────────────────────
  async function handleSearch(e) {
    e?.preventDefault();
    setLoadingSearch(true);
    setSearched(true);
    setOffset(0);
    try {
      const data = await api.post("/search", buildSearchBody(0));
      const results = Array.isArray(data) ? data : data.results || [];
      setTotal(data.total ?? results.length);
      setProducts(results);
      setOffset(results.length);
      if (results.length === 0)
        push("Sin resultados. Probá otra descripción.", "info");
    } catch (e) {
      push(`Error en búsqueda: ${e.message}`, "error");
      setProducts([]);
    } finally {
      setLoadingSearch(false);
    }
  }

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const body = searched
        ? buildSearchBody(offset)
        : { query: "", limit: PAGE_SIZE, offset };
      const data = await api.post("/search", body);
      const results = Array.isArray(data) ? data : data.results || [];
      setProducts((prev) => [...prev, ...results]);
      setOffset((prev) => prev + results.length);
    } catch (e) {
      push(`Error cargando más: ${e.message}`, "error");
    } finally {
      setLoadingMore(false);
    }
  }

  function handleClear() {
    setQuery("");
    setSearched(false);
    setOffset(0);
    setFilters({ category: "", color: "", gender: "", min_price: "", max_price: "" });
    setSelectedStores([]);
    fetchAllProducts(0, false);
  }

  // ── Handlers: tiendas ────────────────────────────────────────────────────────
  async function handleAddStore(form) {
    setAddingStore(true);
    try {
      const newStore = await api.post("/stores", form);
      setStores((s) => [...s, newStore]);
      setShowAddStore(false);
      push(`Tienda "${newStore.name}" agregada`, "success");
    } catch (e) {
      push(`Error agregando tienda: ${e.message}`, "error");
    } finally {
      setAddingStore(false);
    }
  }

  async function handleDeleteStore(id) {
    if (!confirm("¿Eliminar esta tienda y todos sus productos?")) return;
    try {
      await api.del(`/stores/${id}`);
      setStores((s) => s.filter((st) => st.id !== id));
      push("Tienda eliminada", "success");
    } catch (e) {
      push(`Error eliminando: ${e.message}`, "error");
    }
  }

  async function handleScrapeStore(id) {
    setScrapingStore(id);
    try {
      const result = await api.post(`/scrape/${id}`, {});
      setStores((s) =>
        s.map((st) =>
          st.id === id ? { ...st, last_scraped: new Date().toISOString() } : st,
        ),
      );
      const count = result.new_products ?? result.products_scraped ?? result.count ?? "?";
      push(`Scraping completo — ${count} productos nuevos`, "success");
      bumpVersion();
    } catch (e) {
      push(`Error scrapeando: ${e.message}`, "error");
    } finally {
      setScrapingStore(null);
    }
  }

  async function handleScrapeAll() {
    setScrapingAll(true);
    try {
      const result = await api.post("/scrape-all", {});
      const now = new Date().toISOString();
      setStores((s) => s.map((st) => (st.active ? { ...st, last_scraped: now } : st)));
      const count = result.total_products ?? result.count ?? "?";
      push(`Scraping completo — ${count} productos totales`, "success");
      bumpVersion();
    } catch (e) {
      push(`Error en scraping: ${e.message}`, "error");
    } finally {
      setScrapingAll(false);
    }
  }

  async function handleEnrich() {
    setEnriching(true);
    try {
      const result = await api.post("/enrich?batch_size=50", {});
      setEnrichStatus(result.status);
      setByStore(result.status?.by_store || []);
      const n = result.enriched_this_run ?? 0;
      const pending = result.status?.pending ?? 0;
      push(
        pending > 0
          ? `✓ ${n} clasificados — quedan ${pending} pendientes`
          : `✓ Todo clasificado (${n} procesados)`,
        "success",
      );
      bumpVersion();
    } catch (e) {
      push(`Error enriqueciendo: ${e.message}`, "error");
    } finally {
      setEnriching(false);
    }
  }

  async function handleEnrichStore(storeId) {
    setEnrichingStore(storeId);
    try {
      const result = await api.post(`/enrich/${storeId}?batch_size=50`, {});
      setEnrichStatus(result.status);
      setByStore(result.status?.by_store || []);
      const n = result.enriched_this_run ?? 0;
      const pending =
        result.status?.by_store?.find((s) => s.store_id === storeId)?.pending ?? 0;
      push(
        pending > 0
          ? `✓ ${n} clasificados — quedan ${pending} pendientes`
          : `✓ Tienda completamente clasificada (${n} procesados)`,
        "success",
      );
      bumpVersion();
    } catch (e) {
      push(`Error: ${e.message}`, "error");
    } finally {
      setEnrichingStore(null);
    }
  }

  function isRecent(date) {
    return (Date.now() - new Date(date).getTime()) / 1000 / 3600 < 48;
  }

  const storesWithError = byStore.filter(
    (s) =>
      s.last_scrape !== null &&
      s.last_scrape?.success === false &&
      isRecent(s.last_scrape?.started_at),
  );

  // ── Early return: ruta admin secreta ─────────────────────────────────────────
  if (isAdminRoute) {
    return (
      <>
        <Toast toasts={toasts} />
        <AdminView
          isAdmin={isAdmin}
          onLogin={handleLogin}
          onLogout={handleLogout}
          loginLoading={loginLoading}
          loginError={loginError}
          onClearError={() => setError("")}
        />
      </>
    );
  }

  // ── Render público — sin ninguna referencia a admin ───────────────────────────
  return (
    <>
      <Toast toasts={toasts} />

      <div className="app">
        <nav>
          <div className="nav-logo" onClick={() => setView("search")}>
            <img src={Logo} alt="Scrapeando" className="nav-logo-img-full" />
          </div>

          <div className="nav-tabs">
            {[
              ["search", "Buscar"],
              ["stores", "Tiendas"],
              ["stats", "Stats"],
            ].map(([id, label]) => (
              <button
                key={id}
                className={`nav-tab ${view === id ? "active" : ""}`}
                onClick={() => setView(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        <main>
          {view === "search" && (
            <SearchView
              stores={stores}
              products={products}
              total={total}
              query={query}
              setQuery={setQuery}
              filters={filters}
              setFilter={setFilter}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              selectedStores={selectedStores}
              setSelectedStores={setSelectedStores}
              toggleStore={toggleStore}
              searched={searched}
              loadingSearch={loadingSearch}
              loadingAll={loadingAll}
              loadingMore={loadingMore}
              onSearch={handleSearch}
              onLoadMore={handleLoadMore}
              onClear={handleClear}
            />
          )}

          {view === "stores" && (
            <StoresView
              stores={stores}
              enrichStatus={enrichStatus}
              byStore={byStore}
              loadingStores={loadingStores}
              enriching={enriching}
              enrichingStore={enrichingStore}
              scrapingStore={scrapingStore}
              scrapingAll={scrapingAll}
              addingStore={addingStore}
              showAddStore={showAddStore}
              setShowAddStore={setShowAddStore}
              isAdmin={false}
              onRefresh={fetchStores}
              onScrapeStore={handleScrapeStore}
              onScrapeAll={handleScrapeAll}
              onEnrich={handleEnrich}
              onEnrichStore={handleEnrichStore}
              onDeleteStore={handleDeleteStore}
              onAddStore={handleAddStore}
              storesWithError={storesWithError}
            />
          )}

          {view === "stats" && (
            <StatsView
              stats={stats}
              loadingStats={loadingStats}
              onRefresh={fetchStats}
            />
          )}
        </main>
      </div>
    </>
  );
}