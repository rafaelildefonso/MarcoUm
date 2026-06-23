import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { PORTFOLIO } from "./portfolioData"

function ProjectCard({ project }) {
  return (
    <div
      style={{
        flex: "0 0 auto",
        width: 400,
        background: "rgba(255,255,255,.03)",
        border: "1px solid rgba(255,255,255,.08)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 200,
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
            background: "linear-gradient(to top, rgba(0,0,0,.7), transparent)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: 20,
            fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: "1.1rem",
            fontWeight: 800,
            color: "#fff",
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          {project.title}
        </div>
      </div>
      <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
        <p
          style={{
            fontSize: "0.82rem",
            color: "rgba(255,255,255,.5)",
            lineHeight: 1.5,
            fontWeight: 300,
            marginBottom: 16,
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
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#c0392b",
            display: "flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
            alignSelf: "flex-start",
          }}
        >
          Ver projeto ↗
        </a>
      </div>
    </div>
  )
}

export default function PortfolioCarousel() {
  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const isDown = useRef(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)

  const handleMouseDown = (e) => {
    isDown.current = true
    setDragging(true)
    startX.current = e.pageX - (trackRef.current?.offsetLeft || 0)
    scrollLeftStart.current = trackRef.current?.scrollLeft || 0
    if (trackRef.current) trackRef.current.style.scrollBehavior = "auto"
  }

  const handleMouseUp = () => {
    isDown.current = false
    setDragging(false)
    if (trackRef.current) trackRef.current.style.scrollBehavior = ""
  }

  const handleMouseLeave = () => {
    isDown.current = false
    setDragging(false)
    if (trackRef.current) trackRef.current.style.scrollBehavior = ""
  }

  const handleMouseMove = (e) => {
    if (!isDown.current) return
    e.preventDefault()
    const x = e.pageX - (trackRef.current?.offsetLeft || 0)
    const walk = (x - startX.current) * 1.2
    if (trackRef.current) {
      trackRef.current.scrollLeft = scrollLeftStart.current - walk
    }
  }

  const handleTouchStart = (e) => {
    isDown.current = true
    setDragging(true)
    startX.current = e.touches[0].pageX - (trackRef.current?.offsetLeft || 0)
    scrollLeftStart.current = trackRef.current?.scrollLeft || 0
    if (trackRef.current) trackRef.current.style.scrollBehavior = "auto"
  }

  const handleTouchMove = (e) => {
    if (!isDown.current) return
    const x = e.touches[0].pageX - (trackRef.current?.offsetLeft || 0)
    const walk = (x - startX.current) * 1.2
    if (trackRef.current) {
      trackRef.current.scrollLeft = scrollLeftStart.current - walk
    }
  }

  const handleTouchEnd = () => {
    isDown.current = false
    setDragging(false)
    if (trackRef.current) trackRef.current.style.scrollBehavior = ""
  }

  return (
      <section
        style={{
          padding: "120px 0",
          background: "#111",
          position: "relative",
        }}
      >
      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: "0 60px",
    marginBottom: 60,
    flexWrap: "wrap",      // ← evita sobreposição
    gap: 24,               // ← espaço entre título e botão
  }}
>
        <div>
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
            Trabalhos recentes
          </div>
          <h2
            style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: "clamp(2.5rem,5vw,5rem)",
              fontWeight: 900,
              textTransform: "uppercase",
              lineHeight: 0.9,
              letterSpacing: "-0.01em",
              color: "#fff",
            }}
          >
            Nosso
            <br />
            <span style={{ color: "#c0392b", fontStyle: "italic" }}>Portfolio</span>
          </h2>
        </div>
        <Link
  to="/portfolio"
  style={{
    fontFamily: "'Barlow Condensed',sans-serif",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "#fff",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#c0392b",
    padding: "14px 28px",
    flexShrink: 0,
    transition: "background .2s ease, gap .2s ease",
  }}
  onMouseEnter={(e) => { e.currentTarget.style.background = "#a93226"; e.currentTarget.style.gap = "16px" }}
  onMouseLeave={(e) => { e.currentTarget.style.background = "#c0392b"; e.currentTarget.style.gap = "10px" }}
>
  Ver todos os projetos →
</Link>
      </div>

      <div
        ref={trackRef}
        className="portfolio-track"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          display: "flex",
          gap: 20,
          padding: "12px 60px 4px",
          overflowX: "auto",
          cursor: dragging ? "grabbing" : "grab",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {PORTFOLIO.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  )
}
