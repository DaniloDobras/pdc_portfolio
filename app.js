
function setNavHeightVar() {
  const nav = document.querySelector("header.nav");
  const h = nav ? nav.offsetHeight : 0;
  document.documentElement.style.setProperty("--nav-h", `${h}px`);
}

document.addEventListener("DOMContentLoaded", () => {

  setNavHeightVar();
  window.addEventListener("resize", setNavHeightVar);

  const btn = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");

  const closeMenu = () => {
    if (!links) return;
    links.classList.remove("open");
    if (btn) btn.setAttribute("aria-expanded", "false");
    setNavHeightVar();
  };

  if (btn && links) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const nowOpen = !links.classList.contains("open");
      links.classList.toggle("open", nowOpen);
      btn.setAttribute("aria-expanded", String(nowOpen));
      requestAnimationFrame(setNavHeightVar);
    });

    document.addEventListener("click", (e) => {
      if (!links.contains(e.target) && !btn.contains(e.target)) closeMenu();
    });

    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

    links.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
  }

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  const el = document.getElementById("word");
  if (el) {
    const lang = (document.documentElement.lang || "en").toLowerCase();
    const words = lang.startsWith("sr")
      ? ["skalabilne", "pouzdane", "sigurne", "održive"]
      : ["scalable", "reliable", "secure", "observable"];

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      el.textContent = words[0];
      return;
    }

    // prevent the initial flash of a full word
    el.textContent = "";

    let i = 0;   // which word
    let j = 0;   // how many chars shown
    let deleting = false;

    const TYPING_MS = 90;
    const DELETING_MS = 60;
    const PAUSE_MS = 600;

    function tick() {
      const target = words[i];

      if (!deleting && j < target.length) {
        j++; // type
      } else if (!deleting && j === target.length) {
        // pause at full word
        return setTimeout(() => { deleting = true; tick(); }, PAUSE_MS);
      } else if (deleting && j > 0) {
        j--; // delete
      } else if (deleting && j === 0) {
        // move to next word
        deleting = false;
        i = (i + 1) % words.length;
      }

      el.textContent = target.slice(0, j);
      setTimeout(tick, deleting ? DELETING_MS : TYPING_MS);
    }

    // start on the next frame to avoid flicker
    requestAnimationFrame(tick);
  }


  const canvas = document.getElementById("bg-particles");
  if (canvas) {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReduced.matches) { canvas.remove(); return; }

    const ctx = canvas.getContext("2d");
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let vw = 0, vh = 0, particles = [];
    const MOBILE = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    function size() {
      vw = Math.max(1, window.innerWidth);
      vh = Math.max(1, window.innerHeight);
      canvas.width = Math.floor(vw * dpr);
      canvas.height = Math.floor(vh * dpr);
      canvas.style.width = vw + "px";
      canvas.style.height = vh + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = vw * vh;
      const count = Math.max(60, Math.min(MOBILE ? 90 : 140, Math.floor(area / (MOBILE ? 14000 : 9000))));
      particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * vw,
        y: Math.random() * vh,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.3 + 0.6
      }));
    }

    function step() {
      ctx.clearRect(0, 0, vw, vh);

      const g = ctx.createRadialGradient(vw * 0.82, vh * 0.12, 0, vw * 0.82, vh * 0.12, Math.max(vw, vh) * 0.9);
      g.addColorStop(0, "rgba(56,189,248,0.14)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, vw, vh);

      ctx.fillStyle = "#cfeeff";
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > vw) p.vx *= -1;
        if (p.y < 0 || p.y > vh) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });

      requestAnimationFrame(step);
    }

    size();
    window.addEventListener("resize", () => { dpr = Math.min(window.devicePixelRatio || 1, 2); size(); }, { passive: true });
    requestAnimationFrame(step);
  }
});
