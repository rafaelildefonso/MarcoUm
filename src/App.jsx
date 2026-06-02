import { useState, useEffect, useRef } from "react"

/* ─── FONTS via CSS injection ─── */
const FONT_URL = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Barlow:wght@200;300;400;500&display=swap"

/* ─── GLOBAL STYLES ─── */
const GlobalStyle = () => {
  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"; link.href = FONT_URL
    document.head.appendChild(link)
    const style = document.createElement("style")
    style.textContent = `
      *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
      html{scroll-behavior:smooth;cursor:none}
      body{background:#f4f0e8;color:#111;font-family:'Barlow',sans-serif;font-weight:300;overflow-x:hidden;-webkit-font-smoothing:antialiased}
      ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#f4f0e8} ::-webkit-scrollbar-thumb{background:#c0392b}
      #prog{position:fixed;top:0;left:0;height:3px;background:#c0392b;z-index:10000;pointer-events:none;transition:width .05s linear}
      #cur{position:fixed;width:10px;height:10px;background:#c0392b;border-radius:50%;pointer-events:none;z-index:99999;top:-5px;left:-5px;transition:width .25s,height .25s,top .25s,left .25s}
      #cur2{position:fixed;width:34px;height:34px;border:1.5px solid rgba(0,0,0,.22);border-radius:50%;pointer-events:none;z-index:99998;top:-17px;left:-17px;transition:width .45s cubic-bezier(.16,1,.3,1),height .45s cubic-bezier(.16,1,.3,1),top .45s,left .45s}
      body.hov #cur{width:18px;height:18px;top:-9px;left:-9px}
      body.hov #cur2{width:54px;height:54px;top:-27px;left:-27px}
      .rv{opacity:0;transform:translateY(30px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
      .rv.in{opacity:1;transform:none}
      @keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      @keyframes lineUp{from{opacity:0;transform:translateY(110%)}to{opacity:1;transform:none}}
      @keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}
      @keyframes spin3d{from{transform:rotateX(-15deg) rotateY(0deg)}to{transform:rotateX(-15deg) rotateY(360deg)}}
      @media (max-width: 768px) {
        html { cursor: auto !important; }
        #cur, #cur2 { display: none !important; }
      }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(link); document.head.removeChild(style) }
  }, [])
  return null
}

/* ─── CUSTOM CURSOR ─── */
function Cursor() {
  useEffect(() => {
    const cur = document.getElementById("cur"), cur2 = document.getElementById("cur2")
    let mx = 0, my = 0, cx = 0, cy = 0
    const onMove = e => { mx = e.clientX; my = e.clientY; cur.style.transform = `translate(${mx}px,${my}px)` }
    const raf = () => { cur2.style.transform = `translate(${cx += (mx - cx) * .1}px,${cy += (my - cy) * .1}px)`; requestAnimationFrame(raf) }
    document.addEventListener("mousemove", onMove, { passive: true })
    raf()
    const addHov = () => document.querySelectorAll("a,button,.hov-target").forEach(el => {
      el.addEventListener("mouseenter", () => document.body.classList.add("hov"))
      el.addEventListener("mouseleave", () => document.body.classList.remove("hov"))
    })
    setTimeout(addHov, 500)
    return () => document.removeEventListener("mousemove", onMove)
  }, [])
  return null
}

/* ─── PROGRESS BAR ─── */
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

/* ─── SCROLL REVEAL ─── */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in") }), { threshold: 0.07 })
    setTimeout(() => document.querySelectorAll(".rv").forEach(el => io.observe(el)), 100)
    return () => io.disconnect()
  }, [])
}


/* ─── THREE.JS 3D HERO ─── */
function ThreeHero() {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current

    if (window.__THREE_LOADED) { initScene(); return }
    const s = document.createElement("script")
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
    s.onload = () => { window.__THREE_LOADED = true; initScene() }
    document.head.appendChild(s)

    function initScene() {
      const THREE = window.THREE
      if (!mount || sceneRef.current) return

      const W = mount.clientWidth, H = mount.clientHeight
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      mount.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100)
      camera.position.set(0, 2, 10)
      camera.lookAt(0, 0, 0)

      /* ── LIGHTS ── */
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

      /* ── MATERIALS ── */
      const matDark = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 })
      const matRed = new THREE.MeshStandardMaterial({ color: 0xc0392b, metalness: 0.6, roughness: 0.3 })
      const matCream = new THREE.MeshStandardMaterial({ color: 0xf4f0e8, metalness: 0.3, roughness: 0.6 })
      const matWire = new THREE.MeshBasicMaterial({ color: 0xc0392b, wireframe: true })

      /* ── STACKED CUBES ── */
      const cubes = []
      const cubeData = [
        { size: 2.2, y: -2.2, mat: matDark, rx: 0.3, rz: 0.4 },
        { size: 1.7, y: -0.1, mat: matRed, rx: -0.2, rz: -0.3 },
        { size: 1.2, y: 1.6, mat: matDark, rx: 0.5, rz: 0.2 },
        { size: 0.8, y: 2.8, mat: matCream, rx: -0.4, rz: 0.6 },
        { size: 0.5, y: 3.65, mat: matRed, rx: 0.2, rz: -0.5 },
      ]
      cubeData.forEach(d => {
        const geo = new THREE.BoxGeometry(d.size, d.size, d.size)
        const mesh = new THREE.Mesh(geo, d.mat)
        mesh.position.set(2.5, d.y, 0)
        mesh.rotation.set(d.rx, 0, d.rz)
        mesh.castShadow = true
        mesh.receiveShadow = true
        cubes.push({ mesh, targetY: d.y, vy: 0, rx: d.rx, rz: d.rz })
        scene.add(mesh)
      })

      /* ── WIREFRAME CUBE ── */
      const wGeo = new THREE.BoxGeometry(4, 4, 4)
      const wMesh = new THREE.Mesh(wGeo, matWire)
      wMesh.position.set(-3, 0, -2)
      scene.add(wMesh)

      /* ── FLOATING PARTICLES ── */
      const ptGeo = new THREE.BufferGeometry()
      const ptCount = 120
      const positions = new Float32Array(ptCount * 3)
      const ptVels = []
      for (let i = 0; i < ptCount; i++) {
        positions[i * 3] = (Math.random() - .5) * 18
        positions[i * 3 + 1] = (Math.random() - .5) * 14
        positions[i * 3 + 2] = (Math.random() - .5) * 10
        ptVels.push({ vx: (Math.random() - .5) * .005, vy: (Math.random() - .5) * .005 })
      }
      ptGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      const ptMat = new THREE.PointsMaterial({ color: 0xc0392b, size: 0.04, transparent: true, opacity: 0.6 })
      const pts = new THREE.Points(ptGeo, ptMat)
      scene.add(pts)

      /* ── GRID PLANE ── */
      const gridHelper = new THREE.GridHelper(20, 20, 0x222222, 0x1a1a1a)
      gridHelper.position.y = -3.5
      scene.add(gridHelper)

      /* ── GROUND SHADOW CATCHER ── */
      const shadowGeo = new THREE.PlaneGeometry(20, 20)
      const shadowMat = new THREE.ShadowMaterial({ opacity: 0.3 })
      const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat)
      shadowPlane.rotation.x = -Math.PI / 2
      shadowPlane.position.y = -3.5
      shadowPlane.receiveShadow = true
      scene.add(shadowPlane)

      /* ── MOUSE PARALLAX ── */
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
          if (Math.abs(pos[i * 3]) > 9) ptVels[i].vx *= -1
          if (Math.abs(pos[i * 3 + 1]) > 7) ptVels[i].vy *= -1
        }
        ptGeo.attributes.position.needsUpdate = true

        redLight.position.x = Math.sin(t * 0.7) * 5
        redLight.position.z = Math.cos(t * 0.7) * 5

        camera.position.x = mouseX * 3
        camera.position.y = 2 + scrollFactor * -1.5 - mouseY * 2
        camera.position.z = 10 + scrollFactor * -2
        camera.lookAt(0, 0, 0)

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

/* ─── 3D CARD (CSS 3D tilt) ─── */
// FIX: added isolation: "isolate" to contain the perspective stacking context
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

/* ─── HEADER ─── */
const HDR = {
  position: "fixed", top: 0, left: 0, right: 0, background: "#111", zIndex: 500,
  display: "flex", alignItems: "stretch", height: 58, fontFamily: "'Barlow Condensed',sans-serif"
}
function Header() {
  return (
    <header style={HDR}>
      <a href="#" style={{ display: "flex", alignItems: "center", padding: "0 32px", borderRight: "1px solid rgba(255,255,255,.1)", textDecoration: "none" }}>
        <div>
          <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1 }}>Marco Um</div>
          <div style={{ fontSize: "0.55rem", fontWeight: 700, color: "rgba(255,255,255,.35)", letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 3 }}>Web Dev</div>
        </div>
      </a>
      <nav style={{ display: "flex", marginLeft: "auto" }}>
        {[["#servicos", "Serviços"], ["#habilidades", "Skills"]].map(([h, l]) => (
          <a key={h} href={h} style={{ display: "flex", alignItems: "center", padding: "0 22px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", textDecoration: "none", borderLeft: "1px solid rgba(255,255,255,.07)" }}>{l}</a>
        ))}
        <a href="#contato" style={{ display: "flex", alignItems: "center", padding: "0 28px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff", textDecoration: "none", background: "#c0392b", borderLeft: "1px solid #a93226" }}>Contato</a>
      </nav>
    </header>
  )
}

/* ─── HERO SECTION ─── */
function HeroSection() {
  return (
    <section style={{ minHeight: "100vh", background: "#111", position: "relative", overflow: "hidden", display: "flex", alignItems: "center" }}>
      <ThreeHero />

      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

      <div style={{
        position: "absolute",
        bottom: "8%",
        left: "-20%",
        whiteSpace: "nowrap",
        fontFamily: "'Barlow Condensed',sans-serif",
        fontSize: "15vw",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "transparent",
        WebkitTextStroke: "1px rgba(255,255,255,0.03)",
        pointerEvents: "none",
        zIndex: 1,
        transform: "translateX(calc(var(--scroll-y-smooth) * 0.25))",
        transition: "transform 0s"
      }}>
        MARCO UM ✦ DIGITAL STUDIO ✦
      </div>

      <div style={{
        position: "relative",
        zIndex: 2,
        padding: "120px 60px 80px",
        transform: "translateY(calc(var(--scroll-y-smooth) * 0.2))",
        opacity: "max(0, calc(1 - var(--scroll-y-smooth) / 600px))",
        transition: "transform 0s, opacity 0s"
      }}>
        <div style={{ animation: "fadeUp .8s .2s cubic-bezier(.16,1,.3,1) both", fontSize: "0.65rem", fontWeight: 700, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.28em", textTransform: "uppercase", color: "#c0392b", marginBottom: 36, display: "flex", alignItems: "center", gap: 12 }}>
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
              <span style={{ display: "block", animation: `lineUp .9s ${.25 + i * .15}s cubic-bezier(.16,1,.3,1) both` }}>{t}</span>
            </span>
          ))}
        </h1>
        <p style={{ animation: "fadeUp .8s .75s cubic-bezier(.16,1,.3,1) both", fontSize: "1rem", lineHeight: 1.75, color: "rgba(255,255,255,.45)", maxWidth: 420, marginBottom: 48, fontWeight: 300 }}>
          Criação de sites, landing pages e presença digital completa — do design à entrega, com atenção a cada detalhe.
        </p>
        <div style={{ animation: "fadeUp .8s .9s cubic-bezier(.16,1,.3,1) both", display: "flex", gap: 3 }}>
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
        animation: "fadeUp .8s 1.1s cubic-bezier(.16,1,.3,1) both",
        transition: "transform 0s"
      }}>
        {[["7", "d", "Landing Page"], ["21", "d", "Site Completo"], ["2", "×", "Revisões incl."]].map(([n, s, l]) => (
          <div key={l} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", padding: "20px 26px", borderLeft: "3px solid #c0392b" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "2.8rem", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>{n}<span style={{ fontSize: "1.1rem", color: "#c0392b" }}>{s}</span></div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,.3)", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", bottom: 40, left: 60, fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,.25)", display: "flex", alignItems: "center", gap: 12, animation: "fadeUp .8s 1.3s cubic-bezier(.16,1,.3,1) both", zIndex: 2 }}>
        <span style={{ width: 1, height: 44, background: "linear-gradient(to bottom, #c0392b, transparent)", animation: "pulse 2s ease-in-out infinite", display: "block" }} />
        Scroll
      </div>
    </section>
  )
}

/* ─── MARQUEE ─── */
function Marquee() {
  const words = ["Sites", "✦", "Landing Pages", "✦", "SEO", "✦", "Google Maps", "✦", "WhatsApp", "✦", "Design", "✦", "Performance", "✦", "Mobile First", "✦"]
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
          <span key={i} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.24em", textTransform: "uppercase", color: w === "✦" ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.85)", paddingRight: 32 }}>{w}</span>
        ))}
      </div>
    </div>
  )
}

/* ─── 3D SPINNING CSS CUBE ─── */
function CSSCube({ size = 120, color1 = "#111", color2 = "#c0392b", speed = "12s" }) {
  const faces = ["front", "back", "right", "left", "top", "bottom"]
  const transforms = [
    `translateZ(${size / 2}px)`, `rotateY(180deg) translateZ(${size / 2}px)`,
    `rotateY(90deg) translateZ(${size / 2}px)`, `rotateY(-90deg) translateZ(${size / 2}px)`,
    `rotateX(90deg) translateZ(${size / 2}px)`, `rotateX(-90deg) translateZ(${size / 2}px)`,
  ]
  const labels = ["HTML", "CSS", "JS", "UX", "SEO", "Web"]
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

/* ─── ABOUT SECTION ─── */
function AboutSection() {
  return (
    <section style={{ padding: "120px 60px", background: "#f4f0e8", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 100, alignItems: "center", position: "relative", overflow: "hidden" }} className="rv">
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

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, position: "relative", zIndex: 1 }}>
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

/* ─── PLAN CARD ─── */
function PlanCard({ num, tag, name, price, period, features, deadline, featured }) {
  return (
   <Card3D style={{
  background: featured ? "#111" : "#ece8df",
  padding: "44px 32px",
  position: "relative",
  overflow: "hidden",
  borderTop: `3px solid ${featured ? "#c0392b" : "#111"}`,
  contain: "paint",
  marginTop: featured ? -24 : 0  // ← sobe o card featured
}}>
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
          <li key={i} style={{ display: "flex", gap: 10, padding: "8px 0", fontSize: "0.78rem", color: f.off ? (featured ? "rgba(255,255,255,.15)" : "#ccc") : (featured ? "rgba(255,255,255,.55)" : "#555"), borderBottom: `1px solid ${featured ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"}` }}>
            <span style={{ flexShrink: 0, fontSize: "0.68rem", marginTop: 2, color: f.off ? "#666" : "#c0392b", fontWeight: 700 }}>{f.off ? "–" : "✓"}</span>
            {f.t}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${featured ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`, fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: featured ? "rgba(255,255,255,.25)" : "#aaa" }}>{deadline}</div>
    </Card3D>
  )
}

/* ─── PRICING SECTION ─── */
const PLANS = [
  { num: "01", tag: "Mais rápido", name: "Landing Page", price: "500", period: "Pagamento único", deadline: "Entrega em 7 dias úteis", features: [{ t: "Design exclusivo e responsivo" }, { t: "Mobile-first" }, { t: "Formulário de contato / leads" }, { t: "Integração com WhatsApp" }, { t: "SEO básico" }, { t: "Certificado SSL (HTTPS)" }, { t: "Até 6 páginas internas", off: 1 }, { t: "Sistema de agendamento", off: 1 }, { t: "Blog com painel", off: 1 }, { t: "Treinamento incluído", off: 1 }] },
  { num: "02", tag: "Mais completo", name: "Site Completo", price: "1.500", period: "Pagamento único", deadline: "Entrega em 21 dias úteis", featured: true, features: [{ t: "Design exclusivo e responsivo" }, { t: "Mobile-first" }, { t: "Formulário de contato / leads" }, { t: "Integração com WhatsApp" }, { t: "SEO básico" }, { t: "Certificado SSL (HTTPS)" }, { t: "Até 6 páginas internas" }, { t: "Sistema de agendamento" }, { t: "Blog com painel" }, { t: "Treinamento incluído" }] },
  { num: "03", tag: "Presença local", name: "Google Meu Neg.", price: "150", period: "Por mês", deadline: "Gestão mensal contínua", features: [{ t: "Criação e configuração" }, { t: "Otimização Google Maps" }, { t: "Resposta a avaliações" }, { t: "Até 4 posts por mês" }, { t: "Atualização de infos" }, { t: "Relatório mensal" }, { t: "SEO local e regional" }] },
]

function PricingSection() {
  return (
    <section style={{ padding: "120px 60px", background: "#f4f0e8" }} id="servicos">
      <div className="rv" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60, borderBottom: "2px solid #111", paddingBottom: 24 }}>
        <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(2.5rem,5vw,5rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.01em", color: "#111" }}>
          Planos &<br /><span style={{ color: "#c0392b", fontStyle: "italic" }}>Preços</span>
        </h2>
        <p style={{ fontSize: "0.82rem", color: "#888", maxWidth: 200, textAlign: "right", lineHeight: 1.6, fontWeight: 300 }}>Transparência total, entrega no prazo.</p>
      </div>

      {/* FIX: added alignItems: "start" so cards don't stretch beyond their content height */}
      <div className="rv" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, transitionDelay: ".08s", alignItems: "stretch" }}>
       {PLANS.map((p, i) => {
  const factors = [-0.05, 0, -0.09]
  const factor = factors[i]
  return (
    <div key={i} style={{
      transform: `translateY(calc(max(0px, var(--scroll-y-smooth) - 1000px) * ${factor}))`,
      transition: "transform 0s",
      isolation: "isolate"
    }}>
      <PlanCard {...p} />
    </div>
  )
})}
      </div>

      {/* Extras */}
      <div className="rv" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginTop: 2, transitionDelay: ".14s" }}>
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
            items: [["Página extra além do plano", "R$ 120"], ["E-mail profissional @dominio", "R$ 100/ano"], ["Integração Instagram/WhatsApp", "R$ 80"], ["Criação de logo básica", "R$ 200"], ["Relatório de acessos e SEO", "R$ 60/mês"]]
          }
        ].map((ex, i) => (
          <div key={i} style={{ background: "#ece8df", padding: "40px 36px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.01em", color: "#111", lineHeight: 1 }}>{ex.title.replace("\\n", "\n").split("\n").map((l, j) => <span key={j} style={{ display: "block" }}>{l}</span>)}</div>
              {ex.priceEl}
            </div>
            <ul style={{ listStyle: "none" }}>
              {ex.items.map((item, j) => (
                <li key={j} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "9px 0", fontSize: "0.78rem", color: "#666", borderBottom: "1px solid rgba(0,0,0,.07)" }}>
                  {Array.isArray(item) ? <><span>{item[0]}</span><strong style={{ fontWeight: 700, color: "#111", whiteSpace: "nowrap" }}>{item[1]}</strong></> : item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Conditions */}
      <div className="rv" style={{ marginTop: 52, transitionDelay: ".2s" }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "#aaa", marginBottom: 14 }}>Condições gerais</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {[["Pagamento", "50% na assinatura · 50% na entrega"], ["Revisões", "Até 2 rodadas incluídas"], ["Conteúdo", "Textos e imagens fornecidos pelo cliente"], ["Validade", "30 dias a partir da emissão"]].map(([k, v]) => (
            <div key={k} style={{ background: "#ece8df", padding: "18px 24px", display: "flex", gap: 18, alignItems: "baseline" }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#aaa", minWidth: 110, flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.5, fontWeight: 300 }}>{v}</span>
            </div>
          ))}
          <div style={{ background: "#ece8df", padding: "18px 24px", display: "flex", gap: 18, alignItems: "baseline", gridColumn: "span 2" }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#aaa", minWidth: 110, flexShrink: 0 }}>Obs.</span>
            <span style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.5, fontWeight: 300 }}>Domínio e hospedagem não inclusos — orientação disponível. Valores sujeitos a ajuste conforme escopo.</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── SKILLS SECTION ─── */
const SKILLS = [
  { n: "01", name: "HTML & CSS", desc: "Interfaces responsivas e pixel-perfect" },
  { n: "02", name: "JavaScript", desc: "Interatividade e animações fluidas" },
  { n: "03", name: "SEO", desc: "Otimização orgânica para o Google" },
  { n: "04", name: "UX Design", desc: "Foco em conversão e usabilidade" },
  { n: "05", name: "Mobile First", desc: "Perfeito em qualquer dispositivo" },
  { n: "06", name: "WhatsApp", desc: "Integração direta para leads" },
  { n: "07", name: "Google Maps", desc: "Presença local e visibilidade" },
  { n: "08", name: "Performance", desc: "Sites rápidos e bem otimizados" },
]

function SkillsSection() {
  return (
    <section style={{ padding: "120px 60px", background: "#111", position: "relative", overflow: "hidden" }} id="habilidades">
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
      <div className="rv" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2, transitionDelay: ".08s", position: "relative", zIndex: 1 }}>
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

/* ─── CONTACT SECTION ─── */
function ContactLink({ l }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={l.href} target="_blank" rel="noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", background: hov ? "#e8e3d8" : "#ece8df", textDecoration: "none", color: "#111", borderLeft: `3px solid ${hov ? "#c0392b" : "transparent"}`, paddingLeft: hov ? 32 : 24, transition: "all .4s cubic-bezier(.16,1,.3,1)" }}>
      <div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: hov ? "#111" : "#999", marginBottom: 4, transition: "color .25s" }}>{l.name}</div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "1.1rem", fontWeight: 600, color: hov ? "#c0392b" : "#111", transition: "color .25s" }}>{l.sub}</div>
      </div>
      <div style={{ width: 36, height: 36, border: `1.5px solid ${hov ? "#c0392b" : "#ddd"}`, background: hov ? "#c0392b" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: hov ? "#fff" : "#999", transform: hov ? "translate(2px,-2px) rotate(45deg)" : "none", transition: "all .35s cubic-bezier(.16,1,.3,1)" }}>↗</div>
    </a>
  )
}

function ContactSection() {
  const links = [
    { href: "mailto:seuemail@email.com", name: "E-mail", sub: "seuemail@email.com" },
    { href: "https://wa.me/5531999999999", name: "WhatsApp", sub: "Resposta rápida" },
    { href: "https://instagram.com", name: "Instagram", sub: "@seuinstagram" },
    { href: "https://linkedin.com", name: "LinkedIn", sub: "Perfil profissional" },
  ]
  return (
    <section style={{ padding: "120px 60px 100px", background: "#f4f0e8" }} id="contato">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
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

/* ─── FOOTER ─── */
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
        <div>© 2026 — Desenvolvimento Web & Design</div>
        <div style={{ display: "flex", gap: 32 }}>
          <span>Belo Horizonte, MG</span>
          <a href="#" style={{ color: "#c0392b", textDecoration: "none" }} className="hov-target">Voltar ao topo ↑</a>
        </div>
      </div>
    </footer>
  )
}

/* ─── APP ─── */
export default function App() {
  useReveal()

  useEffect(() => {
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
  }, [])

  return (
    <>
      <GlobalStyle />
      <div id="prog" />
      <div id="cur" />
      <div id="cur2" />
      <Cursor />
      <ProgressBar />
      <Header />
      <HeroSection />
      <Marquee />
      <AboutSection />
      <PricingSection />
      <SkillsSection />
      <ContactSection />
      <Footer />
    </>
  )
}