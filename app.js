// Set --nav-h to the current sticky header height, keep it updated.
function setNavHeightVar() {
  const nav = document.querySelector("header.nav");
  const h = nav ? nav.offsetHeight : 0;
  document.documentElement.style.setProperty("--nav-h", `${h}px`);
}

document.addEventListener("DOMContentLoaded", () => {
  setNavHeightVar();
  window.addEventListener("resize", setNavHeightVar);

  // If mobile menu toggles, header height may change → update var
  const navToggle = document.getElementById("nav-toggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      // allow CSS to apply, then measure
      requestAnimationFrame(() => setNavHeightVar());
    });
  }
});


// Mobile nav toggle
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (btn && links) {
    btn.addEventListener("click", () => {
      links.classList.toggle("open");
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
    });
    // Close after click
    links.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => links.classList.remove("open"));
    });
  }

  // Footer year (optional—remove if you prefer static)
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
});

// Global background particles across the whole page
document.addEventListener("DOMContentLoaded", () => {
  // Avoid duplicate init if you already added a particles canvas earlier
  const canvas = document.getElementById("bg-particles");
  if (!canvas) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReduced.matches) { canvas.remove(); return; }

  const ctx = canvas.getContext("2d");
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Viewport size in CSS px
  let vw = 0, vh = 0;

  // Config (tweak if you like)
  let COUNT = 100;               // will be recomputed on resize
  let LINK_DIST = 160;           // link radius (CSS px)
  const MOBILE = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const MAX_COUNT = MOBILE ? 90 : 140;

  let particles = [];
  const mouse = { x: 0, y: 0, active: false };

  function size() {
    vw = Math.max(1, window.innerWidth);
    vh = Math.max(1, window.innerHeight);

    // DPR backing store
    canvas.width = Math.floor(vw * dpr);
    canvas.height = Math.floor(vh * dpr);
    canvas.style.width = vw + "px";
    canvas.style.height = vh + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Density: scale with area, cap for perf
    const area = vw * vh;
    COUNT = Math.max(60, Math.min(MAX_COUNT, Math.floor(area / (MOBILE ? 14000 : 9000))));
    LINK_DIST = Math.min(vw, vh) * (MOBILE ? 0.10 : 0.14);

    spawn();
  }

  function spawn() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * vw,
        y: Math.random() * vh,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.3 + 0.6
      });
    }
  }

  // Pointer attraction (viewport-relative)
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
  }, { passive: true });
  window.addEventListener("mouseleave", () => mouse.active = false, { passive: true });

  // Touch = autopilot; still okay if you want to track touches:
  // window.addEventListener("touchmove", (e)=>{ const t = e.touches[0]; mouse.x=t.clientX; mouse.y=t.clientY; mouse.active=true; }, {passive:true});

  // Pause when tab is hidden
  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(step);
  });

  function step() {
    if (!running) return;
    ctx.clearRect(0, 0, vw, vh);

    // Soft glow
    const g = ctx.createRadialGradient(vw * 0.82, vh * 0.12, 0, vw * 0.82, vh * 0.12, Math.max(vw, vh) * 0.9);
    g.addColorStop(0, "rgba(56,189,248,0.14)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, vw, vh);

    // Autopilot cursor (pleasant motion on touch/idle)
    if (!mouse.active) {
      const t = performance.now() * 0.001;
      mouse.x = vw * 0.5 + Math.sin(t * 0.8) * vw * 0.25;
      mouse.y = vh * 0.55 + Math.sin(t * 1.3) * vh * 0.12;
    }

    // Update particles
    const attract = MOBILE ? 0.003 : 0.006;
    for (const p of particles) {
      if (mouse.active || !MOBILE) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < LINK_DIST) {
          p.vx += (dx / dist) * attract;
          p.vy += (dy / dist) * attract;
        }
      }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > vw) p.vx *= -1;
      if (p.y < 0 || p.y > vh) p.vy *= -1;
    }

    // Draw links (skip on mobile to save battery)
    if (!MOBILE) {
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            ctx.globalAlpha = 1 - dist / LINK_DIST;
            ctx.strokeStyle = "rgba(168,218,255,0.35)";
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    // Draw dots
    ctx.fillStyle = "#cfeeff";
    for (const p of particles) {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }

    requestAnimationFrame(step);
  }

  function onResize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    size();
  }

  size();
  window.addEventListener("resize", onResize, { passive: true });
  requestAnimationFrame(step);
});

// Typewriter headline (locale-aware: EN/SR)
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("word");
  if (!el) return;

  // Words per language (tweak freely)
  const lang = (document.documentElement.lang || "en").toLowerCase();
  const words =
    lang.startsWith("sr")
      ? ["skalabilne", "pouzdane", "sigurne", "održive"]
      : ["scalable", "reliable", "secure", "observable"];

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { el.textContent = words[0]; return; }

  let i = 0, j = 0, deleting = false;

  function tick(){
    const target = words[i];

    if (!deleting){
      el.textContent = target.slice(0, j++);
      if (j > target.length + 6){ deleting = true; }
    } else {
      el.textContent = target.slice(0, j--);
      if (j < 0){ deleting = false; i = (i + 1) % words.length; }
    }

    // Match the demo's feel
    const delay = deleting ? 60 : 90;
    setTimeout(tick, delay);
  }

  tick();
});
