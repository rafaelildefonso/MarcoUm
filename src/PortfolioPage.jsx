import { Link } from "react-router-dom"
import { PORTFOLIO } from "./portfolioData"

function PortfolioCard({ project }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,.03)",
        border: "1px solid rgba(255,255,255,.08)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 220,
          background: [
            `url(${project.image}) center/cover no-repeat`,
            "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
          ].join(","),
          display: "flex",
          alignItems: "flex-end",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,.6), transparent)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: 20,
            fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: "1.2rem",
            fontWeight: 800,
            color: "#fff",
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          {project.title}
        </div>
      </div>
      <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
        <p
          style={{
            fontSize: "0.85rem",
            color: "rgba(255,255,255,.5)",
            lineHeight: 1.6,
            fontWeight: 300,
            marginBottom: 20,
            flex: 1,
          }}
        >
          {project.description}
        </p>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#c0392b",
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            alignSelf: "flex-start",
          }}
        >
          Visitar site ↗
        </a>
      </div>
    </div>
  )
}

export default function PortfolioPage() {
  return (
    <>
      <section
        className="pp-hero"
        style={{
          background: "#111",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "25%",
            right: "-5%",
            whiteSpace: "nowrap",
            fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: "18vw",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.02)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          PORTFOLIO ✦
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200 }}>
          <div
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#c0392b",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{ width: 28, height: 2, background: "#c0392b", display: "block" }}
            />
            Projetos realizados
          </div>
          <h1
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: "clamp(3rem,8vw,7rem)",
              fontWeight: 900,
              textTransform: "uppercase",
              lineHeight: 0.88,
              letterSpacing: "-0.01em",
              color: "#fff",
              marginBottom: 28,
            }}
          >
            Conheça nossos
            <br />
            <span style={{ color: "#c0392b", fontStyle: "italic" }}>
              Trabalhos
            </span>
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,.45)",
              lineHeight: 1.75,
              fontWeight: 300,
              maxWidth: 500,
            }}
          >
            Cada projeto é único e feito sob medida. Veja alguns dos sites que
            desenvolvemos do zero com foco em design, performance e resultado.
          </p>
        </div>
      </section>

      <section
        className="pp-grid-section"
        style={{
          background: "#111",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 24,
            maxWidth: 1400,
            margin: "0 auto",
          }}
          className="portfolio-grid"
        >
          {PORTFOLIO.map((p) => (
            <PortfolioCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      <section
        className="pp-cta"
        style={{
          background: "#f4f0e8",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: "clamp(2.5rem,5vw,5rem)",
            fontWeight: 900,
            textTransform: "uppercase",
            lineHeight: 0.9,
            letterSpacing: "-0.01em",
            color: "#111",
            marginBottom: 20,
          }}
        >
          Vamos criar o
          <br />
          <span style={{ color: "#c0392b", fontStyle: "italic" }}>seu projeto?</span>
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "#666",
            lineHeight: 1.75,
            fontWeight: 300,
            marginBottom: 36,
            maxWidth: 400,
          }}
        >
          Entre em contato e receba uma proposta personalizada para o seu site.
        </p>
        <Link 
          to="https://wa.me/5531985979676"
          style={{
            background: "#c0392b",
            color: "#fff",
            fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            padding: "16px 48px",
            textDecoration: "none",
            transition: "background .2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#a93226" }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#c0392b" }}
        >
          Falar agora →
        </Link>
      </section>

      <footer
        style={{
          background: "#111",
          padding: "40px 60px",
          borderTop: "1px solid rgba(255,255,255,.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.3)",
            fontFamily: "'Barlow Condensed',sans-serif",
          }}
        >
          <div>© {new Date().getFullYear()} — Desenvolvimento Web & Design</div>
          <Link
            to="/"
            style={{ color: "#c0392b", textDecoration: "none" }}
          >
            ← Voltar ao início
          </Link>
        </div>
      </footer>
    </>
  )
}
