function setNavHeightVar() {
  const nav = document.querySelector("header.nav");
  const h = nav ? nav.offsetHeight : 0;
  document.documentElement.style.setProperty("--nav-h", `${h}px`);
}

document.addEventListener("DOMContentLoaded", () => {
  // ===== Sticky nav height var
  setNavHeightVar();
  window.addEventListener("resize", setNavHeightVar);

  // ===== Mobile nav toggle + a11y
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

  // ===== Year in footer
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // ===== Typewriter word
  const el = document.getElementById("word");
  if (el) {
    const lang = (document.documentElement.lang || "en").toLowerCase();
    const words = lang.startsWith("sr")
      ? ["skalabilne", "pouzdane", "sigurne", "održive"]
      : ["scalable", "reliable", "secure", "observable"];

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      el.textContent = words[0];
    } else {
      el.textContent = "";
      let i = 0, j = 0, deleting = false;
      const TYPING_MS = 90, DELETING_MS = 60, PAUSE_MS = 600;

      function tick() {
        const target = words[i];

        if (!deleting && j < target.length) {
          j++;
        } else if (!deleting && j === target.length) {
          return setTimeout(() => { deleting = true; tick(); }, PAUSE_MS);
        } else if (deleting && j > 0) {
          j--;
        } else if (deleting && j === 0) {
          deleting = false;
          i = (i + 1) % words.length;
        }

        el.textContent = target.slice(0, j);
        setTimeout(tick, deleting ? DELETING_MS : TYPING_MS);
      }
      requestAnimationFrame(tick);
    }
  }

  // ===== Background particles
  const canvas = document.getElementById("bg-particles");
  if (canvas) {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReduced.matches) { canvas.remove(); }
    else {
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
  }

// ===== OUR WORK: build 12 cards + responsive carousel behavior (EN/SR desc)
// ===== OUR WORK: 2-row slides (6/4/2 per page) + EN/SR desc =====
const track = document.getElementById("work-track");
const viewport = document.querySelector(".work-viewport");
const prevBtn = document.querySelector(".work-prev");
const nextBtn = document.querySelector(".work-next");

if (track && viewport && prevBtn && nextBtn) {
  // detekcija jezika
  const docLang = (document.documentElement.lang || "").toLowerCase();
  const path = (location.pathname || "").toLowerCase();
  const isSr =
    docLang.startsWith("sr") ||
    path.includes("_sr") ||
    path.endsWith("/sr") ||
    path.endsWith("/sr.html") ||
    /(^|\/)pdc_sr\.html$/.test(path);

  // projekti
  const projects = [
    {
      logo: "assets/bmll.png",
      title: "BMLL",
      desc_en:
        "Processing worldwide stock exchanges data and building system for universal Quote and LOB snapshots reconstruction, parsers for Nasdaq, Moscow, London, Madrid and other stock exchanges",
      desc_sr:
        "Obrada podataka sa svjetskih berzi i sistem za univerzalnu rekonstrukciju Quote/LOB snimaka; parseri za Nasdaq, Moskvu, London, Madrid i druge."
    },
    {
      logo: "assets/gemini.png",
      title: "Gemini",
      desc_en:
        "Matplotlib visualizations, custom report workflows, and training/evaluation/fine-tuning of open-source and frontier models.",
      desc_sr:
        "Matplotlib vizualizacije, workflow-i za izvještaje i trening/evaluacija/fino podešavanje open-source i frontier modela."
    },
    {
      logo: "assets/insomniac.png",
      title: "Insomniac",
      desc_en: "Centralised repository of global company-level greenhouse gas emissions data.",
      desc_sr: "Centralizovano skladište GHG podataka na nivou kompanija, globalno."
    },
    {
      logo: "assets/galileo.svg",
      title: "Galileo.ai",
      desc_en: "AI integration support, automated RAG workflows, Galileo metrics and NLP tasks.",
      desc_sr: "AI integracije, automatizovani RAG workflow-i, Galileo metrike i NLP zadaci."
    },
    {
      logo: "assets/bonfanti.png",
      title: "Bonfanti",
      desc_en:
        "Automated warehouses; crane control software; microservices + Kafka; PLC communication (OPC UA).",
      desc_sr:
        "Automatizovana skladišta; softver za kranove; mikroservisi + Kafka; komunikacija sa PLC-evima (OPC UA)."
    },
    {
      logo: "assets/american-express.png",
      title: "Amex - Resy",
      desc_en:
        "Large-scale restaurant discovery & reservations across mobile/web and venue tools.",
      desc_sr:
        "Platforma velikih razmjera za pronalazak restorana i rezervacije (mobilne/web aplikacije, alati za objekte)."
    },
    {
      logo: "assets/audi.png",
      title: "Audi",
      desc_en:
        "Automotive integration structures, zFAS, autonomous driving (level 3).",
      desc_sr:
        "Strukture za automobilsku integraciju, zFAS, autonomna vožnja (nivo 3)."
    },
    {
      logo: "assets/hm.png",
      title: "H&M",
      desc_en:
        "Improve global sales by 12% and reduce stockpiling; dynamic store allocation; country-scale processing.",
      desc_sr:
        "Povećanje globalne prodaje za 12% i smanjenje zaliha; dinamička alokacija; obrada na nivou zemalja."
    },
    {
      logo: "assets/delta.svg",
      title: "DELTA AIRLINES",
      desc_en:
        "Flight schedule optimisation; reduce delays; support critical outage scenarios.",
      desc_sr:
        "Optimizacija rasporeda letova; smanjenje kašnjenja; podrška u kritičnim scenarijima."
    },
    {
      logo: "assets/universal-music-group.png",
      title: "Universal music group",
      desc_en:
        "Alpha: Jira for Artists (to-dos, releases, concert scheduling).",
      desc_sr:
        "Alpha: Jira za muzičare (to-do, objave, zakazivanje koncerata)."
    },
    {
      logo: "assets/aerwave.png",
      title: "Aerwave",
      desc_en:
        "Managed, personalised Wi-Fi; app software, server and firmware for multiple routers.",
      desc_sr:
        "Upravljane, personalizovane Wi-Fi mreže; aplikativni softver, server i firmware za više rutera."
    },
    {
      logo: "assets/kollex.png",
      title: "Kollex",
      desc_en:
        "BI tool: complex Python/Pandas ETL, visualizations and insights; scikit-learn classification models.",
      desc_sr:
        "BI: kompleksni ETL u Pythonu/Pandas, vizualizacije i uvidi; klasifikacioni modeli (scikit-learn)."
    }
  ];

  function getPageSize() {
    const cs = getComputedStyle(viewport);
    const cols = parseInt(cs.getPropertyValue("--cols").trim(), 10) || 3;
    const rows = parseInt(cs.getPropertyValue("--rows").trim(), 10) || 2;
    return Math.max(1, cols * rows);
  }

  function renderSlides(pageSize, keepPageIndex = 0) {
    const currentIndex = Math.round(viewport.scrollLeft / Math.max(1, viewport.clientWidth));
    track.innerHTML = ""; // clear

    for (let i = 0; i < projects.length; i += pageSize) {
      const chunk = projects.slice(i, i + pageSize);
      const slide = document.createElement("div");
      slide.className = "work-slide";

      const grid = document.createElement("div");
      grid.className = "work-slide-grid";
      grid.setAttribute("role", "list");

      chunk.forEach(p => {
        const card = document.createElement("article");
        card.className = "work-card";
        card.setAttribute("role", "listitem");
        const desc = isSr ? p.desc_sr : p.desc_en;
        card.innerHTML = `
          <div class="logo-wrap">
            <img src="${p.logo}" alt="${p.title}" loading="lazy" />
          </div>
          <h3>${p.title}</h3>
          <p>${desc}</p>
        `;
        grid.appendChild(card);
      });

      slide.appendChild(grid);
      track.appendChild(slide);
    }

    const targetIndex = Number.isFinite(keepPageIndex) ? keepPageIndex : currentIndex;
    viewport.scrollTo({ left: targetIndex * viewport.clientWidth, behavior: "instant" in viewport ? "instant" : "auto" });
  }

  let pageSize = getPageSize();
  renderSlides(pageSize, 0);

  function pageBy(dir = 1) {
    viewport.scrollBy({ left: dir * viewport.clientWidth, behavior: "smooth" });
  }
  prevBtn.addEventListener("click", () => pageBy(-1));
  nextBtn.addEventListener("click", () => pageBy(1));

  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); pageBy(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); pageBy(1); }
  });

  let startX = 0, lastX = 0, isDown = false;
  const THRESHOLD = 40;
  viewport.addEventListener("pointerdown", (e) => {
    isDown = true; startX = lastX = e.clientX; viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener("pointermove", (e) => { if (isDown) lastX = e.clientX; });
  viewport.addEventListener("pointerup", () => {
    if (!isDown) return; isDown = false;
    const dx = lastX - startX;
    if (Math.abs(dx) > THRESHOLD) pageBy(dx > 0 ? -1 : 1);
  });

  let resizeTO = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => {
      const newSize = getPageSize();
      if (newSize !== pageSize) {
        const keepIndex = Math.round(viewport.scrollLeft / Math.max(1, viewport.clientWidth));
        pageSize = newSize;
        renderSlides(pageSize, keepIndex);
      }
    }, 120);
  });
}

});
