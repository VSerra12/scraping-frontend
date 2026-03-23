import { useRef, useEffect } from "react";
import { ProductCard } from "../components/ProductCard";

const CATEGORIES = [
  "", "remera", "buzo", "campera", "pantalón", "zapatillas",
  "vestido", "falda", "bermuda",
];
const COLORS = [
  "", "negro", "blanco", "rojo", "azul", "verde",
  "amarillo", "gris", "beige", "marrón", "rosa",
];
const GENDERS = ["", "hombre", "mujer", "unisex"];
const PAGE_SIZE = 50;

export function SearchView({
  // datos
  stores,
  products,
  total,
  // estado de búsqueda
  query,
  setQuery,
  filters,
  setFilter,
  showFilters,
  setShowFilters,
  selectedStores,
  setSelectedStores,
  toggleStore,
  searched,
  // loading flags
  loadingSearch,
  loadingAll,
  loadingMore,
  // acciones
  onSearch,
  onLoadMore,
  onClear,
}) {
  const inputRef = useRef();
  const activeStores = stores.filter((s) => s.active);
  const isLoading = loadingSearch || loadingAll;

  // Dispara búsqueda automática al tocar una tienda del sidebar,
  // pero no en el montaje inicial (mounted ref lo evita).
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    onSearch();
  }, [selectedStores]);

  return (
    <div className="search-layout">

      {/* ── Sidebar de tiendas ── */}
      <aside className="store-sidebar">
        <p className="sidebar-title">TIENDAS</p>
        {activeStores.map((s) => (
          <button
            key={s.id}
            className={`sidebar-store-btn ${selectedStores.includes(s.id) ? "selected" : ""}`}
            onClick={() => toggleStore(s.id)}
          >
            <span className="sidebar-store-name">{s.name}</span>
            {selectedStores.includes(s.id) && (
              <span className="sidebar-check">✓</span>
            )}
          </button>
        ))}
        {selectedStores.length > 0 && (
          <button
            className="sidebar-clear"
            onClick={() => setSelectedStores([])}
          >
            Limpiar
          </button>
        )}
      </aside>

      {/* ── Área principal ── */}
      <div className="search-main">

        {/* Hero + buscador */}
        <div className="hero">
          <h1 className="hero-title">
            Encontrá tu <em>prenda</em>
            <br />
            en todas las tiendas
          </h1>
          <p className="hero-sub">
            Buscá en {activeStores.length} tiendas argentinas al mismo tiempo
          </p>

          <form onSubmit={onSearch}>
            <div className="search-bar">
              <input
                ref={inputRef}
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ej: campera de cuero negra, remera oriental..."
                autoFocus
              />
              <button
                type="submit"
                className="btn-search"
                disabled={isLoading}
              >
                {loadingSearch ? "…" : "BUSCAR"}
              </button>
            </div>
          </form>

          <button
            className="filter-toggle"
            onClick={() => setShowFilters((f) => !f)}
          >
            ⚙ Filtros {showFilters ? "▲" : "▼"}
          </button>

          {showFilters && (
            <div className="filters-panel">
              <select
                className="select"
                value={filters.category}
                onChange={(e) => setFilter("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c || "Categoría"}</option>
                ))}
              </select>

              <select
                className="select"
                value={filters.color}
                onChange={(e) => setFilter("color", e.target.value)}
              >
                {COLORS.map((c) => (
                  <option key={c} value={c}>{c || "Color"}</option>
                ))}
              </select>

              <select
                className="select"
                value={filters.gender}
                onChange={(e) => setFilter("gender", e.target.value)}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g || "Género"}</option>
                ))}
              </select>

              <input
                className="filter-input"
                type="number"
                placeholder="Precio mín"
                value={filters.min_price}
                onChange={(e) => setFilter("min_price", e.target.value)}
              />
              <input
                className="filter-input"
                type="number"
                placeholder="Precio máx"
                value={filters.max_price}
                onChange={(e) => setFilter("max_price", e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="state-box">
            <div className="spinner" />
            <p>
              {loadingSearch
                ? "Buscando en las tiendas…"
                : "Cargando productos…"}
            </p>
          </div>
        )}

        {/* Resultados */}
        {!isLoading && (
          <>
            <div className="results-meta">
              <span className="results-count">
                Mostrando <strong>{products.length}</strong> de{" "}
                <strong>{total}</strong>{" "}
                {searched ? `resultados para "${query}"` : "productos"}
              </span>
              {searched && (
                <button className="btn-clear" onClick={onClear}>
                  ✕ Limpiar búsqueda
                </button>
              )}
            </div>

            {products.length === 0 ? (
              <div className="state-box">
                <div className="emoji">{searched ? "🔍" : "👗"}</div>
                <p>
                  {searched
                    ? "Sin resultados. Probá con otra descripción."
                    : "No hay productos todavía. Agregá tiendas y ejecutá el scraping."}
                </p>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Ver más */}
                {products.length < total && (
                  <div className="load-more-wrap">
                    <button
                      className="btn secondary"
                      onClick={onLoadMore}
                      disabled={loadingMore}
                      style={{ padding: "0.7rem 2rem", fontSize: "0.85rem" }}
                    >
                      {loadingMore ? "⏳ Cargando…" : "Ver más productos"}
                    </button>
                    <div className="progress-bar" style={{ marginTop: "1rem" }}>
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${(products.length / total) * 100}%` }}
                      />
                    </div>
                    <p className="progress">
                      {products.length} de {total} productos
                    </p>
                  </div>
                )}

                {products.length >= total && total > PAGE_SIZE && (
                  <div className="load-more-wrap">
                    <p className="progress">
                      ✓ Todos los productos cargados ({total})
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}