import Logo from "/src/assets/scrapeando_logotipo_3.svg";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "3rem 2rem 1.5rem",
        background: "var(--blanco)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: "2rem",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        <div>
          <img
            src={Logo}
            alt="Scrapeando"
            style={{ height: 60, marginBottom: "0.75rem" }}
          />
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--muted)",
              lineHeight: 1.7,
              maxWidth: 320,
            }}
          >
            Scrapeando indexa el catálogo de{" "}
            <strong style={{ color: "var(--negro)", fontWeight: 500 }}>
              múltiples tiendas argentinas de ropa
            </strong>{" "}
            y te permite buscarlas todas al mismo tiempo usando lenguaje natural
            — escribís "campera de cuero negra oversize" y el sistema encuentra
            resultados en todas las tiendas, sin que tengas que entrar una por
            una.
            <br />
            <br />
            Cada producto es analizado y clasificado automáticamente con{" "}
            <strong style={{ color: "var(--negro)", fontWeight: 500 }}>
              inteligencia artificial
            </strong>
            , extrayendo categoría, colores, materiales, corte y estilo para que
            los filtros funcionen de verdad.
          </p>
        </div>
        <div>
          <p
            style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Navegación
          </p>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "0.55rem",
            }}
          >
            {[
              ["Buscar prendas", "search"],
              ["Ver tiendas", "stores"],
              ["Estadísticas", "stats"],
            ].map(([label, view]) => (
              <li key={view}>
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("nav", { detail: view }),
                    )
                  }
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: "0.82rem",
                    color: "var(--muted)",
                    padding: 0,
                  }}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p
            style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Plataforma
          </p>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "0.55rem",
            }}
          >
            {["API REST", "Clasificación IA", "Scraping automático"].map(
              (l) => (
                <li
                  key={l}
                  style={{ fontSize: "0.82rem", color: "var(--muted)" }}
                >
                  {l}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "2rem auto 0",
          paddingTop: "1.25rem",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--muted2)" }}>
          © 2025 Scrapeando · Hecho en Argentina 🇦🇷
        </span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.72rem",
              color: "var(--muted)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 6px rgba(34,197,94,0.4)",
                display: "inline-block",
              }}
            />
            Sistemas operativos
          </span>
          <span
            style={{
              fontSize: "0.65rem",
              fontFamily: "'Unbounded', sans-serif",
              fontWeight: 700,
              padding: "0.22rem 0.6rem",
              borderRadius: 4,
              background: "var(--rosa)",
              border: "1px solid var(--coral-border)",
              color: "var(--coral)",
            }}
          >
            Claude AI
          </span>
          <span
            style={{
              fontSize: "0.65rem",
              fontFamily: "'Unbounded', sans-serif",
              fontWeight: 700,
              padding: "0.22rem 0.6rem",
              borderRadius: 4,
              background: "var(--lila)",
              border: "1px solid var(--indigo-border)",
              color: "var(--indigo)",
            }}
          >
            FastAPI
          </span>
        </div>
      </div>
    </footer>
  );
}
