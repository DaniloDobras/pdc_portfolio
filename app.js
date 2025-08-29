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
const track = document.getElementById("work-track");
const viewport = document.querySelector(".work-viewport");
const prevBtn = document.querySelector(".work-prev");
const nextBtn = document.querySelector(".work-next");

if (track && viewport && prevBtn && nextBtn) {
  const docLang = (document.documentElement.lang || "").toLowerCase();
  const path = (location.pathname || "").toLowerCase();
  const isSr =
    docLang.startsWith("sr") ||
    path.includes("_sr") ||
    path.endsWith("/sr") ||
    path.endsWith("/sr.html") ||
    /(^|\/)pdc_sr\.html$/.test(path);

  const projects = [
    {
      logo: "assets/bmll.png",
      title: "BMLL",
      desc_en:
        "Processing worldwide stock exchanges data and building system for universal Quote and LOB snapshots reconstruction, parsers for Nasdaq, Moscow, London, Madrid and other stock exchanges",
      desc_sr:
        "Obrada podataka sa svjetskih berzi i izgradnja sistema za univerzalnu rekonstrukciju Quote i LOB snimaka, parseri za Nasdaq, Moskvu, London, Madrid i druge berze."
    },
    {
      logo: "assets/gemini.png",
      title: "Gemini",
      desc_en:
        "Created graphical visualizations using matplotlib, providing data-driven insights through various charts and plots. Developed workflows for generating customized data reports in different formats. Training, evaluation and fine-tuning of open-source and frontier models",
      desc_sr:
        "Izrada grafičkih vizualizacija (matplotlib) i analitika kroz različite grafikone. Workflow-i za prilagođene izvještaje u više formata. Trening, evaluacija i fino podešavanje open-source i frontier modela."
    },
    {
      logo: "assets/insomniac.png",
      title: "Insomniac",
      desc_en:
        "Centralised repository of global company-level greenhouse gas emissions data",
      desc_sr:
        "Centralizovano skladište podataka o emisijama GHG na nivou kompanija, globalno."
    },
    {
      logo: "assets/galileo.svg",
      title: "Galileo.ai",
      desc_en:
        "AI integration support, automated RAG workflows, contribution to Galileo metrics and supporting NLP tasks",
      desc_sr:
        "Podrška za AI integracije, automatizovani RAG workflow-i, doprinos Galileo metrikama i prateći NLP zadaci."
    },
    {
      logo: "assets/bonfanti.png",
      title: "Bonfanti",
      desc_en:
        "Automated handling warehouses. Software for crane manipulation. Architecture setup from scratch, microservices, Kafka integration using different protocols for communication with PLCs (OPC UA).",
      desc_sr:
        "Automatizovana manipulacija skladištima. Softver za upravljanje kranovima. Arhitektura od nule: mikroservisi, Kafka, integracija i komunikacija sa PLC-evima (OPC UA)."
    },
    {
      logo: "assets/american-express.png",
      title: "Amex - Resy",
      desc_en:
        "Resy is a large-scale platform for restaurant discovery and reservations, available via mobile/web apps and venue management tools.",
      desc_sr:
        "Resy je platforma velikih razmjera za pronalazak restorana i rezervacije, kroz mobilne/web aplikacije i alate za upravljanje objektima."
    },
    {
      logo: "assets/audi.png",
      title: "Audi",
      desc_en:
        "Preparing structures for automotive integration, zFAS, Audi autonomous driving, autonomy level 3",
      desc_sr:
        "Priprema struktura za automobilsku integraciju, zFAS, autonomna vožnja Audi, nivo autonomije 3."
    },
    {
      logo: "assets/hm.png",
      title: "H&M",
      desc_en:
        "Improve global sales by 12% and reduce stockpiling. Dynamic allocation of items to stores based on sales and attributes. Large-scale, country-based processing.",
      desc_sr:
        "Povećanje globalne prodaje za 12% i smanjenje zaliha. Dinamička alokacija artikala po prodavnicama na osnovu prodaje i atributa. Projekat velikih razmjera po zemljama."
    },
    {
      logo: "assets/delta.svg",
      title: "DELTA AIRLINES",
      desc_en:
        "Flight schedule optimisation algorithm; reduce delay time; support in critical situations (sudden outages at airports, aircraft etc.).",
      desc_sr:
        "Algoritam za optimizaciju rasporeda letova; smanjenje kašnjenja i podrška u kritičnim situacijama (iznenadni kvarovi na aerodromima, avionima itd.)."
    },
    {
      logo: "assets/universal-music-group.png",
      title: "Universal music group",
      desc_en:
        "Alpha project: Jira for Artists with to-do lists, releases for songs/albums, concert scheduling.",
      desc_sr:
        "Alpha projekat: Jira za muzičare sa to-do listama, objavama pjesama i albuma, zakazivanjem koncerata."
    },
    {
      logo: "assets/aerwave.png",
      title: "Aerwave",
      desc_en:
        "Personalised managed Wi-Fi networks wherever you go; applicative software, server and firmware for different routers.",
      desc_sr:
        "Personalizovane, upravljane Wi-Fi mreže gdje god da ste; aplikativni softver, server i firmware za različite rutere."
    },
    {
      logo: "assets/kollex.png",
      title: "Kollex",
      desc_en:
        "BI tool: complex ETL pipelines with Python/Pandas, data visualizations and insights; classification models with scikit-learn.",
      desc_sr:
        "Kollex kao BI alat: ETL kompleksni pipeline-ovi u Pythonu/Pandas, vizualizacije i uvidi; klasifikacioni modeli (scikit-learn)."
    }
  ];


  projects.forEach(p => {
    const li = document.createElement("article");
    li.className = "work-card";
    li.setAttribute("role", "listitem");
    const desc = isSr ? p.desc_sr : p.desc_en;
    li.innerHTML = `
      <div class="logo-wrap">
        <img src="${p.logo}" alt="${p.title}" loading="lazy" />
      </div>
      <h3>${p.title}</h3>
      <p>${desc}</p>
    `;
    track.appendChild(li);
  });


  function getPer() {
    const cs = getComputedStyle(viewport);
    const per = parseInt(cs.getPropertyValue("--per").trim(), 10);
    return Math.max(1, per || 3);
  }

  function pageBy(direction = 1) {

    const step = viewport.clientWidth;
    viewport.scrollBy({ left: direction * step, behavior: "smooth" });
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
  viewport.addEventListener("pointermove", (e) => {
    if (!isDown) return; lastX = e.clientX;
  });
  viewport.addEventListener("pointerup", () => {
    if (!isDown) return; isDown = false;
    const dx = lastX - startX;
    if (Math.abs(dx) > THRESHOLD) pageBy(dx > 0 ? -1 : 1);
  });
}

});
