import { useState, useEffect, useRef } from "react"
import { Routes, Route, Link, useLocation } from "react-router-dom"
import { Analytics } from "@vercel/analytics/react"
import PortfolioCarousel from "./PortfolioCarousel"
import PortfolioPage from "./PortfolioPage"


function ProgressBar() {
  useEffect(() => {
    const el = document.getElementById("prog")
    const fn = () => {
      const h = document.documentElement
      el.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%"
    }
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])
  return null
}

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("in")
      }),
      { threshold: 0 }
    )
    setTimeout(() => {
      document.querySelectorAll(".rv").forEach(el => {
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight) {
          el.classList.add("in") // já visível, adiciona direto
        } else {
          io.observe(el) // fora da tela, observa normalmente
        }
      })
    }, 100)
    return () => io.disconnect()
  }, [])
}

function ThreeHero() {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    let playing = true

    const observer = new IntersectionObserver(([e]) => {
      playing = e.isIntersecting
    }, { threshold: 0 })
    if (mount) observer.observe(mount)

    if (window.__THREE_LOADED) { initScene(); return }
    const s = document.createElement("script")
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
    s.onload = () => { window.__THREE_LOADED = true; initScene() }
    document.head.appendChild(s)

    function isMobile() {
      return window.innerWidth < 768
    }

    function initScene() {
      const THREE = window.THREE
      if (!mount || sceneRef.current) return

      const mobile = isMobile()
      const W = mount.clientWidth, H = mount.clientHeight
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      mount.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(mobile ? 45 : 50, W / H, 0.1, 100)
      camera.position.set(0, mobile ? 0.5 : 2, mobile ? 14 : 10)
      camera.lookAt(0, mobile ? 0.5 : 0, 0)

      const ambient = new THREE.AmbientLight(0xffffff, 0.3)
      scene.add(ambient)
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
      dirLight.position.set(5, 10, 5)
      dirLight.castShadow = true
      scene.add(dirLight)
      const redLight = new THREE.PointLight(0xc0392b, 2, 15)
      redLight.position.set(-4, 3, 2)
      scene.add(redLight)
      const blueLight = new THREE.PointLight(0x1a1a2e, 1, 15)
      blueLight.position.set(4, -2, 3)
      scene.add(blueLight)

      const matDark = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 })
      const matRed = new THREE.MeshStandardMaterial({ color: 0xc0392b, metalness: 0.6, roughness: 0.3 })
      const matCream = new THREE.MeshStandardMaterial({ color: 0xf4f0e8, metalness: 0.3, roughness: 0.6 })
      const matWire = new THREE.MeshBasicMaterial({ color: 0xc0392b, wireframe: true })

      const s = mobile ? 0.75 : 1
      const cubes = []
      const cubeData = [
        { size: 2.2 * s, y: -2.2 * s, mat: matDark, rx: 0.3, rz: 0.4 },
        { size: 1.7 * s, y: -0.1 * s, mat: matRed, rx: -0.2, rz: -0.3 },
        { size: 1.2 * s, y: 1.6 * s, mat: matDark, rx: 0.5, rz: 0.2 },
        { size: 0.8 * s, y: 2.8 * s, mat: matCream, rx: -0.4, rz: 0.6 },
        { size: 0.5 * s, y: 3.65 * s, mat: matRed, rx: 0.2, rz: -0.5 },
      ]
      cubeData.forEach(d => {
        const geo = new THREE.BoxGeometry(d.size, d.size, d.size)
        const mesh = new THREE.Mesh(geo, d.mat)
        mesh.position.set(mobile ? 0 : 2.5, d.y, 0)
        mesh.rotation.set(d.rx, 0, d.rz)
        mesh.castShadow = true
        mesh.receiveShadow = true
        cubes.push({ mesh, targetY: d.y, vy: 0, rx: d.rx, rz: d.rz })
        scene.add(mesh)
      })

      const wGeo = new THREE.BoxGeometry(4 * s, 4 * s, 4 * s)
      const wMesh = new THREE.Mesh(wGeo, matWire)
      wMesh.position.set(mobile ? 0 : -3, 0, mobile ? -2.5 : -2)
      scene.add(wMesh)

      const ptRange = mobile ? 12 : 18
      const ptGeo = new THREE.BufferGeometry()
      const ptCount = 120
      const positions = new Float32Array(ptCount * 3)
      const ptVels = []
      for (let i = 0; i < ptCount; i++) {
        positions[i * 3] = (Math.random() - .5) * ptRange
        positions[i * 3 + 1] = (Math.random() - .5) * (mobile ? 10 : 14)
        positions[i * 3 + 2] = (Math.random() - .5) * (mobile ? 7 : 10)
        ptVels.push({ vx: (Math.random() - .5) * .005, vy: (Math.random() - .5) * .005 })
      }
      ptGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      const ptMat = new THREE.PointsMaterial({ color: 0xc0392b, size: 0.04, transparent: true, opacity: 0.6 })
      const pts = new THREE.Points(ptGeo, ptMat)
      scene.add(pts)

      const gridHelper = new THREE.GridHelper(20, 20, 0x222222, 0x1a1a1a)
      gridHelper.position.y = -3.5
      scene.add(gridHelper)

      const shadowGeo = new THREE.PlaneGeometry(20, 20)
      const shadowMat = new THREE.ShadowMaterial({ opacity: 0.3 })
      const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat)
      shadowPlane.rotation.x = -Math.PI / 2
      shadowPlane.position.y = -3.5
      shadowPlane.receiveShadow = true
      scene.add(shadowPlane)

      let mouseX = 0, mouseY = 0
      let targetMouseX = 0, targetMouseY = 0

      const onMouseMove = (e) => {
        targetMouseX = (e.clientX / window.innerWidth) - 0.5
        targetMouseY = (e.clientY / window.innerHeight) - 0.5
      }
      window.addEventListener("mousemove", onMouseMove, { passive: true })

      let frame = 0, animId

      const animate = () => {
        animId = requestAnimationFrame(animate)
        if (!playing) return
        frame++
        const t = frame * 0.005
        const scroll = (window.__smoothScrollY || 0)
        const scrollFactor = scroll / (window.innerHeight || 800)

        mouseX += (targetMouseX - mouseX) * 0.08
        mouseY += (targetMouseY - mouseY) * 0.08

        cubes.forEach((c, i) => {
          const floatY = c.targetY + Math.sin(t * 0.8 + i * 1.2) * 0.12
          const scrollOffset = scrollFactor * (i + 1) * -1.5
          c.mesh.position.y = floatY + scrollOffset
          c.mesh.rotation.y = t * (0.3 + i * 0.1) + mouseX * 0.8
          c.mesh.rotation.x = c.rx + t * 0.1 + mouseY * 0.8
        })

        wMesh.rotation.x = t * 0.2 + mouseY * 0.4
        wMesh.rotation.y = t * 0.3 + mouseX * 0.4
        wMesh.position.x = -3 + mouseX * 1.5
        wMesh.position.y = mouseY * 1.5

        const pos = ptGeo.attributes.position.array
        for (let i = 0; i < ptCount; i++) {
          pos[i * 3] += ptVels[i].vx
          pos[i * 3 + 1] += ptVels[i].vy
          if (Math.abs(pos[i * 3]) > (mobile ? 6 : 9)) ptVels[i].vx *= -1
          if (Math.abs(pos[i * 3 + 1]) > (mobile ? 5 : 7)) ptVels[i].vy *= -1
        }
        ptGeo.attributes.position.needsUpdate = true

        redLight.position.x = Math.sin(t * 0.7) * 5
        redLight.position.z = Math.cos(t * 0.7) * 5

        camera.position.x = mouseX * 3
        camera.position.y = (mobile ? 0.5 : 2) + scrollFactor * -1.5 - mouseY * 2
        camera.position.z = (mobile ? 14 : 10) + scrollFactor * -2
        camera.lookAt(0, mobile ? 0.5 : 0, 0)

        renderer.render(scene, camera)
      }
      animate()

      const onResize = () => {
        const W2 = mount.clientWidth, H2 = mount.clientHeight
        camera.aspect = W2 / H2; camera.updateProjectionMatrix()
        renderer.setSize(W2, H2)
      }
      window.addEventListener("resize", onResize)

      sceneRef.current = { renderer, animId, onResize, onMouseMove }
    }

    return () => {
      observer.disconnect()
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animId)
        window.removeEventListener("resize", sceneRef.current.onResize)
        window.removeEventListener("mousemove", sceneRef.current.onMouseMove)
        const renderer = sceneRef.current.renderer
        if (mount && renderer) {
          if (mount.contains(renderer.domElement)) {
            mount.removeChild(renderer.domElement)
          }
          renderer.dispose()
        }
        sceneRef.current = null
      }
    }
  }, [])

  return <div ref={mountRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />
}

function Card3D({ children, style = {}, className = "" }) {
  const ref = useRef(null)
  const onMove = e => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2)
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2)
    el.style.transform = `perspective(700px) rotateX(${dy * -6}deg) rotateY(${dx * 7}deg) translateY(-8px) scale(1.02)`
  }
  const onLeave = () => { if (ref.current) ref.current.style.transform = "" }
  return (
    <div ref={ref} className={`hov-target ${className}`}
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transition: "transform .15s ease", isolation: "isolate", ...style }}>
      {children}
    </div>
  )
}

const HDR = {
  position: "fixed", top: 0, left: 0, right: 0, background: "#111", zIndex: 500,
  display: "flex", alignItems: "stretch", height: 58, fontFamily: "'Barlow Condensed',sans-serif"
}
function Header() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const links = [
    ["#servicos", "Serviços"],
    ["#habilidades", "Skills"],
    [null, "Portfolio"],
    ["#contato", "Contato"],
  ]
  return (
    <header style={HDR}>
      <Link to="/" style={{ display: "flex", alignItems: "center", padding: "0 24px", borderRight: "1px solid rgba(255,255,255,.1)", textDecoration: "none" }}>
        <img src="/logo_full_cover.png" alt="Marco Um" width={131} height={40} style={{ display: "block" }} />
      </Link>
      <nav className="desktop-nav" style={{ display: "flex", marginLeft: "auto" }}>
        {links.map(([h, l]) => {
          if (h === null) return (
            <Link key={l} to="/portfolio" style={{
              display: "flex", alignItems: "center", padding: "0 22px", fontSize: "0.72rem", fontWeight: 700,
              letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none",
              borderLeft: "1px solid rgba(255,255,255,.07)", background: "transparent",
              color: location.pathname === "/portfolio" ? "#fff" : "rgba(255,255,255,.5)",
            }}>
              {l}
            </Link>
          )
          return (
            <a key={h}  href={h} style={{ display: "flex", alignItems: "center", padding: "0 22px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: h === "#contato" ? "#fff" : "rgba(255,255,255,.5)", textDecoration: "none", borderLeft: "1px solid rgba(255,255,255,.07)", background: h === "#contato" ? "#c0392b" : "transparent" }}>
              {l}
            </a>
          )
        })}
      </nav>
      <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
        <span />
        <span />
        <span />
      </button>
      {menuOpen && (
        <div className="mobile-menu" onClick={() => setMenuOpen(false)}>
          {links.map(([h, l]) => {
            if (h === null) return (
              <Link key={l} to="/portfolio" style={{
                display: "block", padding: "16px 24px", fontSize: "0.82rem", fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none",
                color: "rgba(255,255,255,.7)", background: "transparent",
                borderBottom: "1px solid rgba(255,255,255,.07)"
              }}>{l}</Link>
            )
            return (
              <a key={h}href={h} style={{
                display: "block", padding: "16px 24px", fontSize: "0.82rem", fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none",
                color: h === "#contato" ? "#fff" : "rgba(255,255,255,.7)",
                background: h === "#contato" ? "#c0392b" : "transparent",
                borderBottom: "1px solid rgba(255,255,255,.07)"
              }}>{l}</a>
            )
          })}
        </div>
      )}
    </header>
  )
}

function HeroSection() {
  return (
    <section style={{ minHeight: "100vh", background: "#111", position: "relative", overflow: "hidden", display: "flex", alignItems: "center" }}>
      <ThreeHero />

      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />


      <div style={{
        position: "relative",
        zIndex: 2,
        padding: "120px 60px 80px",
        transform: "translateY(calc(var(--scroll-y-smooth) * 0.2))",
        opacity: "max(0, calc(1 - var(--scroll-y-smooth) / 600px))",
        transition: "transform 0s, opacity 0s"
      }}>
        <div style={{ animation: "fadeUp .3s .05s cubic-bezier(.16,1,.3,1) both", fontSize: "0.65rem", fontWeight: 700, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.28em", textTransform: "uppercase", color: "#c0392b", marginBottom: 36, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 28, height: 2, background: "#c0392b", display: "block" }} />
          Desenvolvimento Web & Design
        </div>

        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(4.5rem,10vw,10rem)", fontWeight: 900, lineHeight: 0.88, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", marginBottom: 36 }}>
          {["Sites que", "realmente", <span key="c" style={{ color: "#c0392b" }}>convertem</span>].map((t, i) => (
            <span key={i} style={{
              display: "block",
              overflow: "hidden",
              transform: `translateY(calc(var(--scroll-y-smooth) * ${0.05 + i * 0.05}))`,
              transition: "transform 0s"
            }}>
              <span style={{ display: "block", animation: `lineUp .5s ${i * 0.08}s cubic-bezier(.16,1,.3,1) both` }}>{t}</span>
            </span>
          ))}
        </h1>
        <p style={{ animation: "fadeUp .3s .1s cubic-bezier(.16,1,.3,1) both", fontSize: "1rem", lineHeight: 1.75, color: "rgba(255,255,255,.45)", maxWidth: 420, marginBottom: 48, fontWeight: 300 }}>
          Criação de sites, landing pages e presença digital completa — do design à entrega, com atenção a cada detalhe.
        </p>
        <div style={{ animation: "fadeUp .3s .15s cubic-bezier(.16,1,.3,1) both", display: "flex", gap: 3, flexWrap: "wrap" }}>
          <a href="#servicos" style={{ background: "#c0392b", color: "#fff", fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", padding: "16px 36px", textDecoration: "none" }}>Ver planos →</a>
          <a href="#contato" style={{ background: "transparent", color: "rgba(255,255,255,.6)", fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", padding: "16px 36px", textDecoration: "none", border: "1.5px solid rgba(255,255,255,.15)" }}>Falar agora</a>
        </div>
      </div>

      <div style={{
        position: "absolute",
        right: 60,
        top: "50%",
        transform: "translateY(calc(-50% + (var(--scroll-y-smooth) * 0.15)))",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        zIndex: 2,
        animation: "fadeUp .3s .2s cubic-bezier(.16,1,.3,1) both",
        transition: "transform 0s"
      }}>
        {[["7", "d", "Landing Page"], ["21", "d", "Site Completo"], ["2", "×", "Revisões incl."]].map(([n, s, l]) => (
          <div key={l} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", padding: "20px 26px", borderLeft: "3px solid #c0392b" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "2.8rem", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>{n}<span style={{ fontSize: "1.1rem", color: "#c0392b" }}>{s}</span></div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,.3)", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", bottom: 40, left: 60, fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,.25)", display: "flex", alignItems: "center", gap: 12, animation: "fadeUp .3s .25s cubic-bezier(.16,1,.3,1) both", zIndex: 2 }}>
        <span style={{ width: 1, height: 44, background: "linear-gradient(to bottom, #c0392b, transparent)", animation: "pulse 2s ease-in-out infinite", display: "block" }} />
        Scroll
      </div>
    </section>
  )
}

function Marquee() {
  const words = ["Sites", "✦", "Landing Pages", "✦", "SEO", "✦", "Google Maps", "✦", "WhatsApp", "✦", "WordPress", "✦", "Design", "✦", "Performance", "✦", "Mobile First", "✦"]
  const doubled = [...words, ...words, ...words, ...words]
  return (
    <div style={{ background: "#c0392b", padding: "12px 0", overflow: "hidden" }}>
      <div style={{
        display: "flex",
        whiteSpace: "nowrap",
        animation: "mq 22s linear infinite",
        transform: "translateX(calc(var(--scroll-speed) * -0.5px)) skewX(calc(var(--scroll-speed) * -0.1deg))",
        transition: "transform 0.12s ease-out"
      }}>
        {doubled.map((w, i) => (
          <span key={i} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.24em", textTransform: "uppercase", color: w === "✦" ? "rgba(255,255,255,.4)" : "#fff", paddingRight: 32 }}>{w}</span>
        ))}
      </div>
    </div>
  )
}

function CSSCube({ size = 120, color1 = "#111", color2 = "#c0392b", speed = "12s" }) {
  const faces = ["front", "back", "right", "left", "top", "bottom"]
  const transforms = [
    `translateZ(${size / 2}px)`, `rotateY(180deg) translateZ(${size / 2}px)`,
    `rotateY(90deg) translateZ(${size / 2}px)`, `rotateY(-90deg) translateZ(${size / 2}px)`,
    `rotateX(90deg) translateZ(${size / 2}px)`, `rotateX(-90deg) translateZ(${size / 2}px)`,
  ]
  const labels = ["HTML", "CSS", "JS", "REACT", "UX", "WP"]
  return (
    <div style={{ width: size, height: size, perspective: 800, perspectiveOrigin: "50% 40%" }}>
      <div style={{ width: size, height: size, position: "relative", transformStyle: "preserve-3d", animation: `spin3d ${speed} linear infinite` }}>
        {faces.map((f, i) => (
          <div key={f} style={{
            position: "absolute", width: size, height: size,
            background: i % 2 === 0 ? color1 : color2,
            border: `1px solid rgba(255,255,255,.15)`,
            transform: transforms[i],
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Barlow Condensed',sans-serif", fontSize: size * 0.14,
            fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase",
            color: "rgba(255,255,255,.7)",
          }}>{labels[i]}</div>
        ))}
      </div>
    </div>
  )
}

function AboutSection() {
  return (
    <section className="about-grid rv" style={{ padding: "120px 60px", background: "#f4f0e8", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 100, alignItems: "center", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        top: "20%",
        left: "5%",
        width: 300,
        height: 300,
        borderRadius: "50%",
        border: "1.5px solid rgba(192, 57, 43, 0.06)",
        pointerEvents: "none",
        transform: "translateY(calc(max(0px, var(--scroll-y-smooth) - 600px) * 0.12))",
        transition: "transform 0s",
        zIndex: 0
      }} />

      <div style={{
        position: "absolute",
        bottom: "10%",
        right: "15%",
        width: 200,
        height: 200,
        borderRadius: "30px",
        border: "1.5px solid rgba(17, 17, 17, 0.04)",
        pointerEvents: "none",
        transform: "rotate(45deg) translateY(calc(max(0px, var(--scroll-y-smooth) - 600px) * -0.08))",
        transition: "transform 0s",
        zIndex: 0
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c0392b", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 28, height: 2, background: "#c0392b", display: "block" }} />Sobre o trabalho
        </div>
        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(3rem,6vw,5.5rem)", fontWeight: 900, lineHeight: 0.9, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#111", marginBottom: 28 }}>
          Código<br />com<br /><span style={{ color: "#c0392b", fontStyle: "italic" }}>propósito</span>
        </h2>
        <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#555", fontWeight: 300, marginBottom: 48, maxWidth: 420 }}>
          Sites desenvolvidos do zero com atenção a cada detalhe — design responsivo, velocidade, SEO e experiência do usuário. Cada projeto é único, feito para gerar resultado real.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2 }}>
          {[["7", "d", "Landing Page"], ["21", "d", "Site Completo"], ["2", "×", "Revisões"]].map(([n, s, l], idx) => (
            <Card3D key={l} style={{
              background: "#111",
              padding: "28px 20px",
              position: "relative",
              overflow: "hidden",
              transform: `translateY(calc(max(0px, var(--scroll-y-smooth) - 600px) * ${0.02 + idx * 0.02}))`,
              transition: "transform 0s"
            }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "3.2rem", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>{n}<sup style={{ fontSize: "1.2rem", color: "#c0392b" }}>{s}</sup></div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginTop: 6 }}>{l}</div>
            </Card3D>
          ))}
        </div>
      </div>

      <div className="about-cubes" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, position: "relative", zIndex: 1 }}>
        {[
          { size: 160, speed: "10s", color1: "#111", color2: "#c0392b", factor: -0.1 },
          { size: 120, speed: "8s", color1: "#c0392b", color2: "#333", factor: -0.22 },
          { size: 85, speed: "14s", color1: "#222", color2: "#a93226", factor: -0.35 },
        ].map((c, i) => (
          <div key={i} style={{
            transform: `translateY(calc(max(0px, var(--scroll-y-smooth) - 600px) * ${c.factor}))`,
            transition: "transform 0s"
          }}>
            <CSSCube size={c.size} speed={c.speed} color1={c.color1} color2={c.color2} />
          </div>
        ))}
      </div>
    </section>
  )
}

function PlanCard({ num, tag, name, price, period, features, deadline, featured }) {
  const cardRef = useRef(null)
  return (
    <div ref={cardRef} className="plan-card" style={{
      background: featured ? "#111" : "#ece8df",
      padding: "40px 36px",
      position: "relative",
      overflow: "hidden",
      borderTop: `3px solid ${featured ? "#c0392b" : "#111"}`,
      borderRadius: 8,
      boxShadow: "0 2px 20px rgba(0,0,0,.06)",
      marginTop: featured ? -24 : 0,
      transition: "transform .25s ease, box-shadow .25s ease",
      cursor: "default"
    }}
      onMouseEnter={() => { if (cardRef.current) { cardRef.current.style.transform = "translateY(-4px)"; cardRef.current.style.boxShadow = "0 8px 32px rgba(0,0,0,.1)" } }}
      onMouseLeave={() => { if (cardRef.current) { cardRef.current.style.transform = ""; cardRef.current.style.boxShadow = "0 2px 20px rgba(0,0,0,.06)" } }}>
      <div style={{
        position: "absolute",
        top: 20,
        right: 28,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "4.5rem",
        fontWeight: 900,
        color: featured ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)",
        pointerEvents: "none",
        lineHeight: 1
      }}>{num}</div>

      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "#c0392b", marginBottom: 20 }}>{tag}</div>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "2.2rem", fontWeight: 900, textTransform: "uppercase", color: featured ? "#fff" : "#111", marginBottom: 4, lineHeight: 1 }}>{name}</div>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "4rem", fontWeight: 900, color: featured ? "#fff" : "#111", lineHeight: 1, margin: "20px 0 4px", letterSpacing: "-0.02em" }}>
        <sup style={{ fontSize: "1.2rem", fontWeight: 700, color: "#c0392b", verticalAlign: "super" }}>R$</sup>{price}
      </div>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: featured ? "rgba(255,255,255,.3)" : "#999", marginBottom: 32 }}>{period}</div>
      <div style={{ height: 1, background: featured ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)", marginBottom: 24 }} />
      <ul style={{ listStyle: "none" }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: "flex", gap: 10, padding: "8px 0", fontSize: "0.82rem", fontWeight: 500, color: f.off ? (featured ? "rgba(255,255,255,.35)" : "#999") : (featured ? "rgba(255,255,255,.65)" : "#444"), borderBottom: `1px solid ${featured ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"}` }}>
            <span style={{ flexShrink: 0, fontSize: "0.68rem", marginTop: 2, color: f.off ? "#666" : "#c0392b", fontWeight: 700 }}>{f.off ? "–" : "✓"}</span>
            {f.t}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${featured ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`, fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: featured ? "rgba(255,255,255,.25)" : "#aaa" }}>{deadline}</div>
    </div>
  )
}

const PLANS = [
  { num: "01", tag: "Mais rápido", name: "Landing Page", price: "500", period: "Pagamento único", deadline: "Entrega em 7 dias úteis", features: [{ t: "Design exclusivo" }, { t: "Adaptado para celular" }, { t: "Formulário de contato / captação de leads" }, { t: "Conexão com WhatsApp" }, { t: "Otimização básica para Google (SEO)" }, { t: "Seções: banner, sobre, serviços, contato" }, { t: "Certificado SSL (HTTPS)" }, { t: "Até 6 páginas internas", off: 1 }, { t: "Seção de agendamento online", off: 1 }, { t: "Blog integrado", off: 1 }, { t: "Treinamento de uso incluído", off: 1 }] },
  { num: "02", tag: "Mais completo", name: "Site Completo", price: "1.500", period: "Pagamento único", deadline: "Entrega em 21 dias úteis", featured: true, features: [{ t: "Design exclusivo" }, { t: "Adaptado para celular" }, { t: "Formulário de contato / captação de leads" }, { t: "Conexão com WhatsApp" }, { t: "Otimização básica para Google (SEO)" }, { t: "Seções: banner, sobre, serviços, contato" }, { t: "Certificado SSL (HTTPS)" }, { t: "Até 6 páginas internas" }, { t: "Seção de agendamento online" }, { t: "Blog integrado" }, { t: "Treinamento de uso incluído" }] },
  { num: "03", tag: "Presença local", name: "Google Meu Neg.", price: "150", period: "Por mês", deadline: "Gestão mensal contínua", features: [{ t: "Criação e configuração completa do perfil" }, { t: "Otimização para aparecer no Google Maps" }, { t: "Resposta a avaliações e comentários" }, { t: "Publicação de posts / novidades — até 4 por mês" }, { t: "Atualização de informações (promoções, horários)" }, { t: "Relatório mensal de desempenho" }, { t: "SEO local e palavras-chave regionais" }] },
]

function PricingSection() {
  return (
    <section className="pricing-section" style={{ padding: "120px 60px", background: "#f4f0e8" }} id="servicos">
      <div className="rv pricing-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60, borderBottom: "2px solid #111", paddingBottom: 24 }}>
        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(2.5rem,5vw,5rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.01em", color: "#111" }}>
          Planos &<br /><span style={{ color: "#c0392b", fontStyle: "italic" }}>Preços</span>
        </h2>
        <p style={{ fontSize: "0.82rem", color: "#888", maxWidth: 200, textAlign: "right", lineHeight: 1.6, fontWeight: 300 }}>Transparência total, entrega no prazo.</p>
      </div>

      <div className="rv plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, transitionDelay: ".08s", alignItems: "stretch" }}>
        {PLANS.map((p, i) => (
          <div key={i}>
            <PlanCard {...p} />
          </div>
        ))}
      </div>

      <div className="rv extras-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20, transitionDelay: ".14s" }}>
        {[
          {
            title: "Manutenção\nMensal", priceEl: (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.8rem", fontWeight: 900, color: "#c0392b", lineHeight: 1 }}>R$80<span style={{ fontSize: "1rem" }}>/mês</span></div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888" }}>Landing Page</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.8rem", fontWeight: 900, color: "#c0392b", lineHeight: 1, marginTop: 8 }}>R$150<span style={{ fontSize: "1rem" }}>/mês</span></div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888" }}>Site Completo</div>
              </div>
            ),
            items: ["Correção de erros e bugs", "Atualização de textos e imagens", "Backup periódico", "Verificação de funcionamento", "Atendimento prioritário"]
          },
          {
            title: "Serviços\nAdicionais", priceEl: null,
            items: [["Página extra além do plano", "R$ 120"], ["E-mail profissional @dominio", "R$ 100"], ["Integração Instagram / WhatsApp Business", "R$ 80"], ["Criação de logo básica", "R$ 100"], ["Relatório de acessos e SEO", "R$ 60/mês"]]
          }
        ].map((ex, i) => (
          <div key={i} style={{ background: "#ece8df", padding: "36px 32px", borderRadius: 8, boxShadow: "0 2px 20px rgba(0,0,0,.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.01em", color: "#111", lineHeight: 1 }}>{ex.title.replace("\\n", "\n").split("\n").map((l, j) => <span key={j} style={{ display: "block" }}>{l}</span>)}</div>
              {ex.priceEl}
            </div>
            <ul style={{ listStyle: "none" }}>
              {ex.items.map((item, j) => (
                <li key={j} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "9px 0", fontSize: "0.82rem", color: "#666", borderBottom: "1px solid rgba(0,0,0,.07)" }}>
                  {Array.isArray(item) ? <><span>{item[0]}</span><strong style={{ fontWeight: 700, color: "#111", whiteSpace: "nowrap" }}>{item[1]}</strong></> : item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rv" style={{ marginTop: 52, transitionDelay: ".2s" }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "#aaa", marginBottom: 14 }}>Condições gerais</div>
        <div className="conditions-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Pagamento", "50% no início · 50% na entrega"], ["Revisões", "Até 2 rodadas de revisão incluídas"], ["Conteúdo", "Textos e imagens fornecidos pelo cliente"], ["Validade", "30 dias a partir da data de início"]].map(([k, v]) => (
            <div key={k} style={{ background: "#ece8df", padding: "18px 24px", display: "flex", gap: 18, alignItems: "baseline", borderRadius: 8 }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#aaa", minWidth: 110, flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.5, fontWeight: 300 }}>{v}</span>
            </div>
          ))}
          <div style={{ background: "#ece8df", padding: "18px 24px", display: "flex", gap: 18, alignItems: "baseline", borderRadius: 8 }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#aaa", minWidth: 110, flexShrink: 0 }}>Domínio e<br />hospedagem</span>
            <span style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.5, fontWeight: 300 }}>Não inclusos — orientação para contratação disponível.</span>
          </div>
          <div style={{ background: "#ece8df", padding: "18px 24px", display: "flex", gap: 18, alignItems: "baseline", gridColumn: "span 2", borderRadius: 8 }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#aaa", minWidth: 110, flexShrink: 0 }}>Obs.</span>
            <span style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.5, fontWeight: 300 }}>Valores sujeitos a ajuste conforme escopo. Proposta válida por 30 dias · Preços em Reais (R$) · Sujeito a contrato formal.</span>
          </div>
        </div>
      </div>
    </section>
  )
}

const SKILLS = [
  { n: "01", name: "HTML & CSS", desc: "Interfaces responsivas e pixel-perfect" },
  { n: "02", name: "JavaScript", desc: "Interatividade e animações fluidas" },
  { n: "03", name: "SEO", desc: "Otimização orgânica para o Google" },
  { n: "04", name: "REACT", desc: "Foco em conversão e usabilidade" },
  { n: "05", name: "Responsividade", desc: "Perfeito em qualquer dispositivo" },
  { n: "06", name: "Google Maps", desc: "Presença local e visibilidade" },
  { n: "07", name: "Performance", desc: "Sites rápidos e bem otimizados" },
  { n: "08", name: "WordPress", desc: "Gerenciamento de conteúdo dinâmico" },
]

function SkillsSection() {
  return (
    <section className="skills-section" style={{ padding: "120px 60px", background: "#111", position: "relative", overflow: "hidden" }} id="habilidades">
      <div style={{
        position: "absolute",
        top: "35%",
        right: "-10%",
        whiteSpace: "nowrap",
        fontFamily: "'Barlow Condensed',sans-serif",
        fontSize: "16vw",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "transparent",
        WebkitTextStroke: "1px rgba(255,255,255,0.022)",
        pointerEvents: "none",
        zIndex: 0,
        transform: "translateX(calc(max(0px, var(--scroll-y-smooth) - 1500px) * -0.2))",
        transition: "transform 0s"
      }}>
        EXCELÊNCIA ✦ PERFORMANCE ✦ FOCO ✦
      </div>

      <div className="rv" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60, position: "relative", zIndex: 1 }}>
        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(2.5rem,5vw,5rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, color: "#fff" }}>
          O que nós<br /><span style={{ color: "#c0392b", fontStyle: "italic" }}>dominamos</span>
        </h2>
        <CSSCube size={90} speed="9s" color1="#1a1a1a" color2="#c0392b" />
      </div>
      <div className="rv skills-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2, transitionDelay: ".08s", position: "relative", zIndex: 1 }}>
        {SKILLS.map((s) => (
          <Card3D key={s.n} style={{ background: "rgba(255,255,255,.03)", padding: "36px 26px", borderTop: "2px solid rgba(255,255,255,.06)" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,.2)", marginBottom: 24 }}>{s.n}</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.5rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em", color: "#fff", marginBottom: 8, lineHeight: 1 }}>{s.name}</div>
            <div style={{ fontSize: "0.75rem", lineHeight: 1.6, color: "rgba(255,255,255,.4)", fontWeight: 300 }}>{s.desc}</div>
          </Card3D>
        ))}
      </div>
    </section>
  )
}

function ContactLink({ l }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={l.href} target="_blank" rel="noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", background: hov ? "#e8e3d8" : "#ece8df", textDecoration: "none", color: "#111", borderLeft: `3px solid ${hov ? "#c0392b" : "transparent"}`, paddingLeft: hov ? 32 : 24, transition: "all .4s cubic-bezier(.16,1,.3,1)" }}>
      <div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: hov ? "#111" : "#999", marginBottom: 4, transition: "color .25s", textAlign: "left" }}>{l.name}</div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.1rem", fontWeight: 600, color: hov ? "#c0392b" : "#111", transition: "color .25s" }}>{l.sub}</div>
      </div>
      <div style={{ width: 36, height: 36, border: `1.5px solid ${hov ? "#c0392b" : "#ddd"}`, background: hov ? "#c0392b" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: hov ? "#fff" : "#999", transform: hov ? "translate(2px,-2px) rotate(45deg)" : "none", transition: "all .35s cubic-bezier(.16,1,.3,1)" }}>↗</div>
    </a>
  )
}

function ContactSection() {
  const links = [
    { href: "mailto:marcoumweb@gmail.com", name: "E-mail", sub: "marcoumweb@gmail.com" },
    { href: "https://wa.me/5531985979676", name: "WhatsApp", sub: "Resposta rápida" },
  ]
  return (
    <section className="contact-section" style={{ padding: "120px 60px 100px", background: "#f4f0e8" }} id="contato">
      <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
        <div className="rv">
          <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(3.5rem,7vw,7rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.88, letterSpacing: "-0.01em", color: "#111", marginBottom: 24 }}>
            Vamos<br />trabalhar<br /><span style={{ fontStyle: "italic", color: "#c0392b" }}>juntos</span>
          </h2>
          <p style={{ fontSize: "1rem", color: "#666", lineHeight: 1.75, fontWeight: 300 }}>Pronto para levar sua presença digital a outro nível? Entre em contato e receba uma proposta.</p>
        </div>
        <div className="rv" style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 12, transitionDelay: ".1s" }}>
          {links.map((l, i) => (
            <ContactLink key={i} l={l} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ background: "#111", padding: "80px 60px 40px", fontFamily: "'Barlow Condensed',sans-serif", borderTop: "1px solid rgba(255,255,255,.05)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.005) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.005) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

      <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", fontSize: "clamp(4rem, 15vw, 11rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.03em", color: "#fff", lineHeight: 1, marginBottom: 60, position: "relative", zIndex: 1 }}>
        <span style={{ display: "inline-block" }}>MAR</span>
        <span style={{
          color: "#c0392b",
          transform: "translateY(calc((1 - var(--footer-progress)) * -140px)) scale(calc(1.3 - (var(--footer-progress) * 0.3)))",
          opacity: "calc(0.3 + (var(--footer-progress) * 0.7))",
          transition: "transform 0s, opacity 0s",
          display: "inline-block"
        }}>CO</span>
        <span style={{ display: "inline-block", marginLeft: "0.22em", color: "#f4f0e8" }}>UM</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 30, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,.3)", position: "relative", zIndex: 1 }}>
        <div>© {new Date().getFullYear()} — Desenvolvimento Web & Design</div>
        <div style={{ display: "flex", gap: 32 }}>
          <span>Belo Horizonte, MG</span>
          <Link to="/" style={{ color: "#c0392b", textDecoration: "none" }} className="hov-target">Voltar ao topo ↑</Link>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const location = useLocation()
  const isLanding = location.pathname === "/"

  useEffect(() => {
  window.scrollTo(0, 0)
  setTimeout(() => {
    document.querySelectorAll(".rv").forEach(el => {
      el.classList.add("in")
    })
  }, 200)
}, [location.pathname])

  useReveal()

  useEffect(() => {
    if (!isLanding) return
    let targetY = window.scrollY
    let currentY = window.scrollY
    let lastScrollY = window.scrollY
    let rafId

    document.documentElement.style.setProperty("--scroll-y", `${targetY}px`)
    document.documentElement.style.setProperty("--scroll-y-smooth", `${currentY}px`)
    document.documentElement.style.setProperty("--scroll-speed", "0")
    document.documentElement.style.setProperty("--footer-progress", "0")

    const onScroll = () => {
      targetY = window.scrollY
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    const loop = () => {
      if (document.hidden) {
        rafId = requestAnimationFrame(loop)
        return
      }

      currentY += (targetY - currentY) * 0.1
      if (Math.abs(targetY - currentY) < 0.05) {
        currentY = targetY
      }

      const speed = targetY - lastScrollY
      lastScrollY = targetY

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      let footerProgress = 0
      if (maxScroll > 0) {
        const bottomDistance = Math.max(0, maxScroll - currentY)
        footerProgress = Math.max(0, 1 - bottomDistance / 250)
      }

      document.documentElement.style.setProperty("--scroll-y", `${targetY}px`)
      document.documentElement.style.setProperty("--scroll-y-smooth", `${currentY}px`)
      document.documentElement.style.setProperty("--scroll-speed", speed)
      document.documentElement.style.setProperty("--footer-progress", footerProgress)

      window.__smoothScrollY = currentY
      window.__scrollSpeed = speed

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [isLanding])

  return (
    <>
      <Analytics />
      <div id="prog" />
      <ProgressBar />
      <Header />
      <Routes>
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/" element={
          <>
            <HeroSection />
            <Marquee />
            <AboutSection />
            <PortfolioCarousel />
            <PricingSection />
            <SkillsSection />
            <ContactSection />
            <Footer />
          </>
        } />
      </Routes>
    </>
  )
}