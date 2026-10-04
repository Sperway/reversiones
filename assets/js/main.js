/* =====================================================================
   REVERSIONES · Interacciones y render del contenido
   ===================================================================== */
(function () {
  "use strict";

  let DATA = window.REVERSIONES || {};
  // Vista previa del borrador hecho en admin.html (index.html?preview=1)
  if (/[?&]preview=1/.test(location.search)) {
    try {
      const draft = JSON.parse(localStorage.getItem("reversiones-draft"));
      if (draft) DATA = draft;
    } catch (e) {}
  }
  const Audio = window.RevAudio;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const esc = (str) =>
    String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const safeUrl = (u) => (/^(https?:|mailto:|tel:)/i.test(u || "") ? u : "");

  /* ---------------- LOADER ---------------- */
  const loader = $("#loader");
  const loaderCount = $("#loaderCount");
  const loaderMsgs = ["1, 2… probando", "Chequeando línea", "Afinando en Mi", "Subiendo el master"];
  let li = 0;
  const loaderTimer = setInterval(() => {
    li = (li + 1) % loaderMsgs.length;
    if (loaderCount) loaderCount.textContent = loaderMsgs[li];
  }, 380);
  const hideLoader = () => {
    clearInterval(loaderTimer);
    loader && loader.classList.add("is-done");
    document.body.classList.add("is-loaded");
  };
  const started = performance.now();
  window.addEventListener("load", () => setTimeout(hideLoader, Math.max(0, (reduceMotion ? 0 : 1300) - (performance.now() - started))));
  setTimeout(hideLoader, 4000); // por si algún recurso externo tarda

  /* ---------------- NAV ---------------- */
  const nav = $("#nav");
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");
  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  });
  $$("a", navMenu).forEach((a) =>
    a.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    })
  );

  const scrollVu = $("#scrollVu");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollVu.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Link activo según sección visible
  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        $$("a", navMenu).forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main section[id]").forEach((s) => sectionObs.observe(s));

  /* ---------------- REVEAL ---------------- */
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  const observeReveal = (root = document) => $$(".reveal:not(.is-visible)", root).forEach((el) => revealObs.observe(el));

  /* ---------------- HERO ---------------- */
  const banda = DATA.banda || {};
  $("#heroCity").textContent = (banda.ciudad || "").toUpperCase();
  if (banda.bajada) $("#heroSubtitle").textContent = banda.bajada;
  $("#year").textContent = new Date().getFullYear();

  const canvas = $("#heroCanvas");
  const ctx2d = canvas.getContext("2d");
  let W = 0,
    H = 0,
    DPR = 1;
  const resize = () => {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx2d.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
  else addEventListener("resize", resize);
  resize();

  const freqData = new Uint8Array(1024);
  const timeData = new Uint8Array(2048);
  const peaks = [];
  let heroVisible = true;
  new IntersectionObserver((e) => (heroVisible = e[0].isIntersecting)).observe($(".hero"));

  const vuL = $("#vuL");
  const vuR = $("#vuR");
  let vuValL = 0,
    vuValR = 0;

  function drawHero(t) {
    requestAnimationFrame(drawHero);
    if (!heroVisible) return;
    const live = Audio && Audio.playing && Audio.analyser;
    ctx2d.clearRect(0, 0, W, H);

    const bars = Math.max(24, Math.min(72, Math.floor(W / 22)));
    const gap = 4;
    const bw = (W - gap * (bars - 1)) / bars;
    const segH = 7;
    const maxH = H * (W < 700 ? 0.26 : 0.34);

    if (live) Audio.analyser.getByteFrequencyData(freqData);

    for (let i = 0; i < bars; i++) {
      let v;
      if (live) {
        // escala logarítmica de frecuencias
        const lo = Math.floor(Math.pow(i / bars, 2) * 380) + 1;
        const hi = Math.floor(Math.pow((i + 1) / bars, 2) * 380) + 2;
        let s = 0;
        for (let k = lo; k < hi; k++) s += freqData[k];
        v = s / (hi - lo) / 255;
      } else {
        const tt = reduceMotion ? 0 : t / 1000;
        v =
          0.18 +
          0.16 * Math.sin(tt * 2.1 + i * 0.35) +
          0.1 * Math.sin(tt * 3.7 - i * 0.6) +
          0.08 * Math.sin(tt * 7 + i * 1.3) * Math.sin(tt * 0.7);
        v *= 1 - (i / bars) * 0.45;
      }
      v = Math.max(0, Math.min(1, v));
      const h = v * maxH;
      peaks[i] = Math.max((peaks[i] || 0) - 1.2, h);
      const x = i * (bw + gap);
      const segs = Math.floor(h / segH);
      for (let s = 0; s < segs; s++) {
        const ratio = (s * segH) / maxH;
        ctx2d.fillStyle = ratio > 0.82 ? "rgba(255,59,48,.85)" : ratio > 0.6 ? "rgba(255,176,0,.75)" : "rgba(57,255,140,.55)";
        ctx2d.fillRect(x, H - (s + 1) * segH, bw, segH - 2);
      }
      ctx2d.fillStyle = "rgba(255,255,255,.55)";
      ctx2d.fillRect(x, H - peaks[i] - 4, bw, 2);
    }

    // Osciloscopio
    ctx2d.lineWidth = 2;
    ctx2d.strokeStyle = W < 700 ? "rgba(255,176,0,.45)" : "rgba(255,176,0,.8)";
    ctx2d.shadowColor = "rgba(255,176,0,.8)";
    ctx2d.shadowBlur = 12;
    ctx2d.beginPath();
    const mid = H * 0.5;
    const amp = W < 700 ? 0.45 : 1;
    if (live) {
      Audio.analyser.getByteTimeDomainData(timeData);
      const step = timeData.length / W;
      for (let x = 0; x < W; x += 2) {
        const y = mid + ((timeData[Math.floor(x * step)] - 128) / 128) * H * 0.22 * amp;
        x === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
      }
    } else {
      const tt = reduceMotion ? 0 : t / 1000;
      for (let x = 0; x <= W; x += 3) {
        const env = Math.sin((x / W) * Math.PI);
        const y =
          mid +
          env *
            amp *
            (Math.sin(x * 0.018 + tt * 3) * 26 + Math.sin(x * 0.053 - tt * 5) * 10 + Math.sin(x * 0.11 + tt * 9) * 4);
        x === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
      }
    }
    ctx2d.stroke();
    ctx2d.shadowBlur = 0;

    // VU meters
    let tl, tr;
    if (live) {
      const lv = Audio.levels();
      tl = Math.min(1, lv.l * 3.2);
      tr = Math.min(1, lv.r * 3.2);
    } else {
      const tt = reduceMotion ? 0 : t / 1000;
      tl = 0.35 + 0.15 * Math.sin(tt * 2.3) + 0.08 * Math.sin(tt * 7.1);
      tr = 0.35 + 0.15 * Math.sin(tt * 2.1 + 1) + 0.08 * Math.sin(tt * 6.3);
    }
    vuValL += (tl - vuValL) * 0.25;
    vuValR += (tr - vuValR) * 0.25;
    vuL.style.transform = `rotate(${-50 + vuValL * 100}deg)`;
    vuR.style.transform = `rotate(${-50 + vuValR * 100}deg)`;
  }
  requestAnimationFrame(drawHero);

  // Botón "Probar sonido"
  const powerBtn = $("#powerBtn");
  if (Audio) {
    powerBtn.addEventListener("click", () => {
      const on = Audio.toggle();
      powerBtn.setAttribute("aria-pressed", String(!!on));
      powerBtn.querySelector("span").textContent = on ? "Cortar sonido" : "Probar sonido";
    });
    Audio.on((type, data) => {
      if (type === "state") {
        document.body.classList.toggle("is-playing", data);
      }
      if (type === "step" && data.step % 4 === 0) {
        const delay = Math.max(0, (data.time - Audio.ctx.currentTime) * 1000);
        setTimeout(() => {
          document.body.classList.add("beat");
          setTimeout(() => document.body.classList.remove("beat"), 90);
        }, delay);
      }
    });
  } else {
    powerBtn.hidden = true;
  }

  /* ---------------- MARQUEE ---------------- */
  const artists = (DATA.repertorio || []).map((r) => r.artista);
  const mq = $("#marquee");
  const mqItems = artists.map((a) => `<span>${esc(a)}</span><i>✦</i>`).join("");
  mq.innerHTML = mqItems + mqItems;

  /* ---------------- BANDA ---------------- */
  $("#bandDesc").textContent = banda.descripcion || "";
  const statsEl = $("#stats");
  statsEl.innerHTML = (banda.stats || [])
    .map(
      (s) => `
      <div class="stat reveal">
        <div class="stat__lcd"><span class="stat__ghost">888</span><b data-count="${Number(s.valor) || 0}">0</b><em>${esc(s.sufijo)}</em></div>
        <div class="stat__label">${esc(s.label)}</div>
      </div>`
    )
    .join("");
  const countObs = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        countObs.unobserve(e.target);
        const b = $("b", e.target);
        const target = +b.dataset.count;
        if (reduceMotion) return (b.textContent = target);
        const t0 = performance.now();
        const dur = 1600;
        const step = (now) => {
          const p = Math.min(1, (now - t0) / dur);
          b.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
    { threshold: 0.5 }
  );
  $$(".stat", statsEl).forEach((s) => countObs.observe(s));

  /* ---------------- KNOBS (arrastrables) ---------------- */
  function initKnob(el) {
    if (el.dataset.ready) return;
    el.dataset.ready = "1";
    let val = el.dataset.value != null ? +el.dataset.value : Math.round(Math.random() * 60 + 20);
    el.setAttribute("role", "slider");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-valuemin", "0");
    el.setAttribute("aria-valuemax", "100");
    el.setAttribute("aria-label", el.dataset.label || "Perilla");
    if (!el.querySelector(".knob__cap")) el.innerHTML = `<span class="knob__cap"><i></i></span>` + (el.dataset.label ? `<small>${esc(el.dataset.label)}</small>` : "");
    const cap = el.querySelector(".knob__cap");
    const set = (v) => {
      const nv = Math.max(0, Math.min(100, v));
      if (Math.round(nv / 10) !== Math.round(val / 10)) Audio && Audio.tick();
      val = nv;
      cap.style.transform = `rotate(${-135 + val * 2.7}deg)`;
      el.setAttribute("aria-valuenow", String(Math.round(val)));
      el.dispatchEvent(new CustomEvent("knob", { detail: val }));
    };
    set(val);
    let startY = 0,
      startV = 0;
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      startY = e.clientY;
      startV = val;
      el.classList.add("is-grab");
    });
    el.addEventListener("pointermove", (e) => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      set(startV + (startY - e.clientY) * 0.8);
    });
    el.addEventListener("pointerup", () => el.classList.remove("is-grab"));
    el.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowRight") (set(val + 5), e.preventDefault());
      if (e.key === "ArrowDown" || e.key === "ArrowLeft") (set(val - 5), e.preventDefault());
    });
  }

  // La perilla del tocadiscos cambia la velocidad del vinilo
  const vinyl = $("#vinyl");
  const pitchKnob = $(".turntable__knob");
  initKnob(pitchKnob);
  pitchKnob.addEventListener("knob", (e) => vinyl.style.setProperty("--spin", (3.2 - e.detail / 50).toFixed(2) + "s"));
  pitchKnob.dispatchEvent(new CustomEvent("knob", { detail: +pitchKnob.getAttribute("aria-valuenow") }));

  /* ---------------- INTEGRANTES (pedales) ---------------- */
  const ICONS = {
    voz: `<svg viewBox="0 0 64 64"><rect x="22" y="6" width="20" height="32" rx="10"/><path d="M14 30a18 18 0 0 0 36 0M32 48v10M22 58h20"/><path d="M26 16h12M26 22h12M26 28h12" class="thin"/></svg>`,
    guitarra: `<svg viewBox="0 0 64 64"><path d="M40 8l16 16-4 4-3-1-12 12 2 3a11 11 0 0 1-4 14c-6 4-14 3-19-2s-6-13-2-19a11 11 0 0 1 14-4l3 2 12-12-1-3z"/><circle cx="25" cy="39" r="4"/><path d="M15 43l6 6" class="thin"/></svg>`,
    bajo: `<svg viewBox="0 0 64 64"><path d="M44 4l16 16-4 4-3-1-14 14 2 3a12 12 0 0 1-4 15c-7 4-15 3-20-2s-6-13-2-20a12 12 0 0 1 15-4l3 2 14-14-1-3z"/><path d="M14 44l6 6M18 40l6 6" class="thin"/><circle cx="50" cy="10" r="1.5"/><circle cx="54" cy="14" r="1.5"/></svg>`,
    bateria: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="34" rx="20" ry="7"/><path d="M12 34v14c0 4 9 7 20 7s20-3 20-7V34"/><path d="M12 40l40 0M18 52l6-12M46 52l-6-12" class="thin"/><path d="M8 6l18 22M56 6L38 28"/></svg>`,
    teclados: `<svg viewBox="0 0 64 64"><rect x="4" y="18" width="56" height="30" rx="3"/><path d="M12 18v30M20 18v30M28 18v30M36 18v30M44 18v30M52 18v30" class="thin"/><path d="M16 18v18M24 18v18M40 18v18M48 18v18" class="fill"/></svg>`,
    otro: `<svg viewBox="0 0 64 64"><circle cx="20" cy="46" r="8"/><circle cx="48" cy="40" r="8"/><path d="M28 46V12l28-6v34"/></svg>`
  };
  const PEDAL_COLORS = ["#e63946", "#ffb000", "#22d3ee", "#7c3aed", "#39d98a", "#ff6b9d", "#f97316"];

  const board = $("#pedalboard");
  (DATA.integrantes || []).forEach((m, i) => {
    const color = PEDAL_COLORS[i % PEDAL_COLORS.length];
    const inst = ICONS[m.instrumento] ? m.instrumento : "otro";
    const photo = safeUrl(m.foto) || (m.foto && !/^[a-z]+:/i.test(m.foto) ? m.foto : "");
    const el = document.createElement("article");
    el.className = "pedal reveal";
    el.style.setProperty("--pedal", color);
    el.style.transitionDelay = `${i * 70}ms`;
    el.innerHTML = `
      <div class="pedal__jacks" aria-hidden="true"><i></i><i></i></div>
      <div class="pedal__knobs">
        <div class="knob knob--sm" data-label="VOL"></div>
        <div class="knob knob--sm" data-label="TONE"></div>
        <div class="knob knob--sm" data-label="GAIN"></div>
      </div>
      <div class="pedal__brand">
        <span class="led pedal__led"></span>
        <span class="pedal__fx">${esc(m.efecto || m.instrumento)}</span>
      </div>
      <div class="pedal__avatar">
        ${photo ? `<img src="${esc(photo)}" alt="${esc(m.nombre)}" loading="lazy">` : `<div class="pedal__icon" aria-hidden="true">${ICONS[inst]}</div>`}
      </div>
      <h3 class="pedal__name">${esc(m.nombre)}</h3>
      <p class="pedal__role">${esc(m.rol)}</p>
      <div class="pedal__lcd" aria-live="polite"><span>${esc(m.equipo || m.rol)}</span></div>
      <button class="pedal__switch" aria-pressed="false" aria-label="Escuchar a ${esc(m.nombre)} (${esc(m.rol)})">
        <span class="pedal__switch-cap"></span>
      </button>
      <span class="pedal__model">REV-${String(i + 1).padStart(2, "0")} · ${esc((m.instrumento || "").toUpperCase())}</span>
    `;
    const lcd = $(".pedal__lcd span", el);
    const sw = $(".pedal__switch", el);
    sw.addEventListener("click", () => {
      const on = !el.classList.contains("is-on");
      el.classList.toggle("is-on", on);
      sw.setAttribute("aria-pressed", String(on));
      lcd.textContent = on ? m.bio || m.equipo : m.equipo || m.rol;
      lcd.parentElement.classList.toggle("is-scrolling", on && lcd.textContent.length > 28);
      if (on && Audio) Audio.playInstrument(m.instrumento);
    });
    board.appendChild(el);
    $$(".knob", el).forEach(initKnob);
  });

  /* ---------------- VIDEOS ---------------- */
  function ytId(url) {
    if (!url) return "";
    const m = String(url).match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(url) ? url : "";
  }
  const videos = (DATA.videos || []).map((v) => ({ ...v, id: ytId(v.url) }));
  const featIdx = Math.max(0, videos.findIndex((v) => v.destacado));
  const featuredEl = $("#featuredVideo");
  const listEl = $("#videoList");

  function noSignal(v) {
    return `<div class="nosignal"><div class="nosignal__bars"></div><div class="nosignal__txt"><b>SIN SEÑAL</b><span>${esc(v.titulo)}</span><small>Video próximamente</small></div></div>`;
  }

  function renderFeatured(i, autoplay) {
    const v = videos[i];
    if (!v) {
      featuredEl.innerHTML = `<div class="monitor__screen">${noSignal({ titulo: "Videos próximamente" })}</div>`;
      return;
    }
    const screen = v.id
      ? autoplay
        ? `<iframe src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0" title="${esc(v.titulo)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
        : `<button class="monitor__play" aria-label="Reproducir ${esc(v.titulo)}"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy"><span class="playbtn"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span></button>`
      : noSignal(v);
    featuredEl.innerHTML = `
      <div class="monitor__bezel">
        <div class="monitor__screen">${screen}<div class="monitor__scan" aria-hidden="true"></div></div>
      </div>
      <div class="monitor__info">
        <span class="monitor__rec"><i class="led led--on led--red"></i>PLAY</span>
        <h3>${esc(v.titulo)}</h3>
        <span class="monitor__place">${esc(v.lugar || "")}</span>
      </div>`;
    const play = $(".monitor__play", featuredEl);
    if (play) play.addEventListener("click", () => {
      Audio && Audio.stop();
      renderFeatured(i, true);
    });
    $$(".tape", listEl).forEach((t) => t.classList.toggle("is-active", +t.dataset.i === i));
  }

  listEl.innerHTML = videos
    .map(
      (v, i) => `
      <button class="tape reveal" data-i="${i}" aria-label="Ver ${esc(v.titulo)}">
        <span class="tape__thumb">${v.id ? `<img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt="" loading="lazy">` : `<span class="tape__static"></span>`}</span>
        <span class="tape__body">
          <span class="tape__reels" aria-hidden="true"><i></i><i></i></span>
          <span class="tape__label"><b>${esc(v.titulo)}</b><small>${esc(v.lugar || "")}</small></span>
        </span>
      </button>`
    )
    .join("");
  $$(".tape", listEl).forEach((t) =>
    t.addEventListener("click", () => {
      renderFeatured(+t.dataset.i, !!videos[+t.dataset.i].id);
      if (innerWidth < 900) featuredEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    })
  );
  renderFeatured(featIdx, false);

  /* ---------------- FECHAS ---------------- */
  const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const DIAS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
  const parseGig = (g) => {
    const [y, mo, d] = String(g.fecha || "").split("-").map(Number);
    const [hh, mm] = String(g.hora || "21:00").split(":").map(Number);
    const date = new Date(y, (mo || 1) - 1, d || 1, hh || 0, mm || 0);
    return { ...g, date };
  };
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const gigs = (DATA.fechas || []).filter((g) => g.fecha).map(parseGig).filter((g) => !isNaN(g.date));
  const upcoming = gigs.filter((g) => g.date >= startOfToday).sort((a, b) => a.date - b.date);
  const past = gigs.filter((g) => g.date < startOfToday).sort((a, b) => b.date - a.date);

  const gigRow = (g, i, isPast) => {
    const tickets = safeUrl(g.entradas);
    const action = isPast
      ? `<span class="gig__tag">TOCADO ✓</span>`
      : tickets
      ? `<a class="btn btn--small btn--primary" href="${esc(tickets)}" target="_blank" rel="noopener">Entradas</a>`
      : `<span class="gig__tag">${esc(g.estado || "Entrada en puerta")}</span>`;
    return `
      <article class="gig reveal" style="transition-delay:${i * 60}ms">
        <div class="gig__date">
          <span class="gig__dow">${DIAS[g.date.getDay()]}</span>
          <b>${String(g.date.getDate()).padStart(2, "0")}</b>
          <span>${MESES[g.date.getMonth()]} ${String(g.date.getFullYear()).slice(2)}</span>
        </div>
        <div class="gig__steps" aria-hidden="true">${Array.from({ length: 8 }, () => "<i></i>").join("")}</div>
        <div class="gig__info">
          <h3>${esc(g.lugar)}</h3>
          <p>${esc(g.ciudad)}${g.hora ? ` · ${esc(g.hora)} hs` : ""}</p>
        </div>
        <div class="gig__action">${action}</div>
      </article>`;
  };
  $("#gigs").innerHTML = upcoming.length
    ? upcoming.map((g, i) => gigRow(g, i, false)).join("")
    : `<div class="gig gig--empty reveal"><p>No hay fechas anunciadas por ahora. <a href="#contratar">¿Querés que toquemos en tu evento?</a></p></div>`;
  if (past.length) $("#pastGigs").innerHTML = past.map((g, i) => gigRow(g, i, true)).join("");
  else $("#pastWrap").hidden = true;
  $("#pastWrap").addEventListener("toggle", () => observeReveal($("#pastWrap")));

  // Cuenta regresiva al próximo show
  const nextGig = upcoming.find((g) => g.date > now);
  if (nextGig) {
    const cd = $("#countdown");
    cd.hidden = false;
    $("#cdVenue").textContent = `${nextGig.lugar} · ${nextGig.ciudad}`;
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const diff = Math.max(0, nextGig.date - new Date());
      const s = Math.floor(diff / 1000);
      $("#cdD").textContent = pad(Math.floor(s / 86400));
      $("#cdH").textContent = pad(Math.floor((s % 86400) / 3600));
      $("#cdM").textContent = pad(Math.floor((s % 3600) / 60));
      $("#cdS").textContent = pad(s % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- REPERTORIO ---------------- */
  const setlist = $("#setlist");
  setlist.innerHTML =
    `<label class="setlist__search reveal"><span>BUSCAR</span><input type="search" id="songSearch" placeholder="Artista o tema…" autocomplete="off"></label>` +
    `<div class="setlist__grid">` +
    (DATA.repertorio || [])
      .map(
        (r, i) => `
      <article class="track reveal" style="transition-delay:${(i % 4) * 60}ms">
        <header><span class="track__n">${String(i + 1).padStart(2, "0")}</span><h3>${esc(r.artista)}</h3></header>
        <ul>${(r.temas || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        <div class="track__meter" aria-hidden="true"><i></i></div>
      </article>`
      )
      .join("") +
    `</div><p class="setlist__empty" hidden>No está en la lista… ¡pero lo podemos sacar para tu evento!</p>`;
  const search = $("#songSearch");
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  search.addEventListener("input", () => {
    const q = norm(search.value.trim());
    let shown = 0;
    $$(".track", setlist).forEach((card) => {
      const match = !q || norm(card.textContent).includes(q);
      card.hidden = !match;
      if (match) shown++;
      $$("li", card).forEach((li) => li.classList.toggle("is-hit", !!q && norm(li.textContent).includes(q)));
    });
    $(".setlist__empty", setlist).hidden = shown > 0;
  });

  /* ---------------- FORMATOS + BOOKING ---------------- */
  const formats = DATA.formatos || [];
  $("#formats").innerHTML = formats
    .map(
      (f, i) => `
      <article class="unit reveal${f.destacado ? " unit--hot" : ""}" style="transition-delay:${i * 80}ms">
        <span class="unit__screw" aria-hidden="true"></span><span class="unit__screw" aria-hidden="true"></span>
        <div class="unit__head">
          <span class="unit__code">${esc(f.codigo || "")}</span>
          ${f.destacado ? `<span class="unit__badge">MÁS PEDIDO</span>` : ""}
        </div>
        <h3>${esc(f.nombre)}</h3>
        <p class="unit__meta"><b>${esc(f.duracion || "")}</b> · ${esc(f.ideal || "")}</p>
        <ul>${(f.incluye || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        <div class="unit__foot">
          <div class="unit__meter" aria-hidden="true">${Array.from({ length: 10 }, () => "<i></i>").join("")}</div>
          <button class="btn btn--small ${f.destacado ? "btn--primary" : "btn--ghost"}" data-format="${esc(f.nombre)}">Elegir</button>
        </div>
      </article>`
    )
    .join("");

  const formatSelect = $("#formatSelect");
  formatSelect.innerHTML =
    `<option value="">A definir</option>` + formats.map((f) => `<option>${esc(f.nombre)}</option>`).join("");
  $$("[data-format]").forEach((b) =>
    b.addEventListener("click", () => {
      formatSelect.value = b.dataset.format;
      $("#bookingForm").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      setTimeout(() => $("#bookingForm [name=nombre]").focus({ preventScroll: true }), 600);
    })
  );

  const guests = $("#guests");
  const guestsOut = $("#guestsOut");
  const updateGuests = () => {
    guestsOut.textContent = guests.value === guests.max ? guests.value + "+" : guests.value;
    guests.style.setProperty("--p", ((guests.value - guests.min) / (guests.max - guests.min)) * 100 + "%");
  };
  guests.addEventListener("input", updateGuests);
  updateGuests();

  const contacto = DATA.contacto || {};
  const waNum = String(contacto.whatsapp || "").replace(/\D/g, "");
  const form = $("#bookingForm");
  const status = $("#formStatus");
  let via = "whatsapp";
  $$("button[type=submit]", form).forEach((b) => b.addEventListener("click", () => (via = b.dataset.via)));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const missing = ["nombre", "telefono", "evento"].filter((k) => !String(fd.get(k) || "").trim());
    $$(".field", form).forEach((f) => f.classList.remove("is-error"));
    if (missing.length) {
      missing.forEach((k) => form.elements[k].closest(".field").classList.add("is-error"));
      status.textContent = "⚠ Completá nombre, teléfono y tipo de evento.";
      status.className = "console__status is-error";
      form.elements[missing[0]].focus();
      return;
    }
    const fecha = fd.get("fecha") ? fd.get("fecha").split("-").reverse().join("/") : "a definir";
    const lines = [
      "¡Hola Reversiones! Quiero contratar la banda 🎸",
      "",
      `• Nombre: ${fd.get("nombre")}`,
      `• Teléfono: ${fd.get("telefono")}`,
      fd.get("email") ? `• Email: ${fd.get("email")}` : "",
      `• Evento: ${fd.get("evento")}`,
      `• Fecha: ${fecha}`,
      fd.get("lugar") ? `• Lugar: ${fd.get("lugar")}` : "",
      `• Formato: ${fd.get("formato") || "a definir"}`,
      `• Invitados aprox.: ${guestsOut.textContent}`,
      fd.get("mensaje") ? `\n${fd.get("mensaje")}` : ""
    ].filter((l) => l !== "");
    const text = lines.join("\n");

    if (via === "email" && contacto.formspree) {
      status.textContent = "Enviando…";
      status.className = "console__status";
      try {
        const res = await fetch(contacto.formspree, { method: "POST", body: fd, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error();
        status.textContent = "✔ ¡Recibimos tu consulta! Te contactamos a la brevedad.";
        status.className = "console__status is-ok";
        form.reset();
        updateGuests();
        return;
      } catch (err) {
        status.textContent = "No pudimos enviarlo. Abriendo tu correo…";
      }
    }
    if (via === "whatsapp" && waNum) {
      window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    } else {
      location.href = `mailto:${contacto.email}?subject=${encodeURIComponent("Contratación Reversiones – " + fd.get("evento"))}&body=${encodeURIComponent(text)}`;
    }
    status.textContent = "✔ ¡Listo! Te abrimos el mensaje para que lo envíes.";
    status.className = "console__status is-ok";
    Audio && Audio.init() && Audio.playInstrument("guitarra");
  });

  // Contacto directo + redes
  if (waNum) {
    $("#waLink").href = `https://wa.me/${waNum}`;
    $("#waText").textContent = "+" + waNum.replace(/^(\d{2})(\d)(\d{2})(\d{4})(\d{4})$/, "$1 $2 $3 $4-$5");
  } else $("#waLink").hidden = true;
  if (contacto.email) {
    $("#mailLink").href = `mailto:${contacto.email}`;
    $("#mailText").textContent = contacto.email;
  } else $("#mailLink").hidden = true;

  const SOCIAL_ICONS = {
    instagram: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="fill"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9v6l5-3z" class="fill"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8z"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24"><path d="M14 3v12a4 4 0 1 1-4-4M14 3c0 3 2 5 5 5"/></svg>`,
    spotify: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M7 9.5c3.5-1 7-.6 10 1M7.5 13c3-.8 6-.4 8.5 1M8 16.2c2.4-.6 4.6-.3 6.5.8"/></svg>`
  };
  $("#socials").innerHTML = Object.entries(contacto.redes || {})
    .filter(([, url]) => safeUrl(url))
    .map(
      ([k, url]) =>
        `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(k)}" class="social">${SOCIAL_ICONS[k] || esc(k)}</a>`
    )
    .join("");

  observeReveal();
})();
