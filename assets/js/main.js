/* =====================================================================
   REVERSIONES · Interacciones y render del contenido
   ===================================================================== */
(function () {
  "use strict";

  const DATA = window.REVERSIONES || {};
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

  function pulseBeat() {
    document.body.classList.add("beat");
    setTimeout(() => document.body.classList.remove("beat"), 90);
  }

  // Con un tema real no hay secuenciador: detecta los golpes por la energía de los graves
  let lowAvg = 0,
    lastBeat = 0,
    lastTimeTxt = "";
  const fmtTime = (sec) => (isFinite(sec) ? Math.floor(sec / 60) + ":" + String(Math.floor(sec % 60)).padStart(2, "0") : "--:--");
  function detectBeat(t) {
    let low = 0;
    for (let k = 1; k <= 5; k++) low += freqData[k];
    low /= 5;
    if (low > lowAvg * 1.18 && low > 140 && t - lastBeat > 260) {
      lastBeat = t;
      pulseBeat();
    }
    lowAvg = lowAvg * 0.94 + low * 0.06;
    const tt = Audio.trackTime();
    if (tt) {
      const txt = fmtTime(tt.current) + " / " + fmtTime(tt.duration);
      if (txt !== lastTimeTxt) {
        lastTimeTxt = txt;
        $("#npTime").textContent = txt;
        $("#npBar").style.transform = `scaleX(${tt.duration ? tt.current / tt.duration : 0})`;
      }
    }
  }

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
    if (live && Audio.trackMode) detectBeat(t);

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

  // Botón del inicio: tema real de la banda (si está cargado) o loop sintetizado
  const powerBtn = $("#powerBtn");
  const tema = DATA.tema || {};
  const hasTrack = !!String(tema.archivo || "").trim() && !/^\s*javascript:/i.test(tema.archivo);
  const btnLabel = (on) => (on ? (hasTrack ? "Pausar" : "Cortar sonido") : hasTrack ? "Escuchá a Reversiones" : "Probar sonido");
  const nowPlaying = $("#nowPlaying");
  if (Audio) {
    if (hasTrack) {
      Audio.setTrack(tema.archivo.trim());
      $("#npTitle").textContent = tema.titulo || "Reversiones";
      $("#npDetail").textContent = tema.detalle || "";
    }
    powerBtn.querySelector("span").textContent = btnLabel(false);
    powerBtn.addEventListener("click", () => Audio.toggle());
    Audio.on((type, data) => {
      if (type === "state") {
        document.body.classList.toggle("is-playing", data);
        powerBtn.setAttribute("aria-pressed", String(!!data));
        powerBtn.querySelector("span").textContent = btnLabel(data);
        if (hasTrack) nowPlaying.hidden = false;
        nowPlaying.classList.toggle("is-paused", !data);
      }
      if (type === "step" && data.step % 4 === 0) {
        const delay = Math.max(0, (data.time - Audio.ctx.currentTime) * 1000);
        setTimeout(pulseBeat, delay);
      }
    });
  } else {
    powerBtn.hidden = true;
  }

  /* ---------------- MARQUEE ---------------- */
  const mq = $("#marquee");
  const mqItems = (DATA.cinta || ["Rock nacional", "Reversiones", "En vivo"]).map((a) => `<span>${esc(a)}</span><i>✦</i>`).join("");
  mq.innerHTML = mqItems + mqItems;

  /* ---------------- EVENTO ESPECIAL (banner a la subpágina) ---------------- */
  const EV = window.EVENTO_FITO;
  if (EV && EV.fecha) {
    const MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const DIAS_LARGOS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const [ey, em, ed] = EV.fecha.split("-").map(Number);
    const evDate = new Date(ey, em - 1, ed);
    const evDone = new Date() > new Date(ey, em - 1, ed + 1, 6);
    $("#eventoEspecial").hidden = false;
    $("#navEvent").hidden = false;
    $("#ebDay").textContent = ed;
    $("#ebMonth").textContent = MESES_LARGOS[em - 1].slice(0, 3);
    $("#ebTitle").textContent = EV.titulo || "Todo Fito";
    $("#ebKicker").textContent = "Evento especial · Homenaje a " + (EV.homenaje || "Fito Páez");
    $("#navEvent").lastChild.textContent = EV.titulo || "Todo Fito";
    $("#ebInfo").textContent = [
      `${DIAS_LARGOS[evDate.getDay()]} ${ed} de ${MESES_LARGOS[em - 1]}`,
      EV.hora ? EV.hora + " hs" : EV.apertura ? "Puertas " + EV.apertura + " hs" : "",
      EV.lugar || "",
      EV.ciudad || ""
    ]
      .filter(Boolean)
      .join(" · ");
    if (evDone) {
      $("#ebKicker").textContent = "Así se vivió";
      $("#ebCta").textContent = "Ver fotos y videos →";
    }
  }

  /* ---------------- BANDA ---------------- */
  $("#bandDesc").textContent = banda.descripcion || "";
  const statsEl = $("#stats");
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
  // Contadores LCD (de content.js o de la pestaña "Datos" de la planilla)
  function renderStats(list) {
    statsEl.innerHTML = (list || [])
      .map(
        (s) => `
      <div class="stat reveal">
        <div class="stat__lcd"><span class="stat__ghost">888</span><b data-count="${Number(s.valor) || 0}">0</b><em>${esc(s.sufijo)}</em></div>
        <div class="stat__label">${esc(s.label)}</div>
      </div>`
      )
      .join("");
    $$(".stat", statsEl).forEach((st) => countObs.observe(st));
    observeReveal(statsEl);
  }
  renderStats(banda.stats);

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

  /* ---------------- TOCADISCOS ----------------
     El vinilo y START/STOP reproducen el tema de la banda (o el loop si no hay
     tema). El PITCH cambia la velocidad real ±8%, como una bandeja Technics:
     acelerar también sube el tono. El disco gira solo mientras suena. */
  const vinyl = $("#vinyl");
  const pitchKnob = $(".turntable__knob");
  const pitchOut = $("#pitchOut");
  const BASE_SPIN = 1.8; // segundos por vuelta a 33⅓ RPM
  if (hasTrack && tema.titulo) $("#vinylTitle").textContent = tema.titulo;
  initKnob(pitchKnob);
  pitchKnob.addEventListener("knob", (e) => {
    let pct = ((e.detail - 50) / 50) * 8;
    if (Math.abs(pct) < 0.35) pct = 0; // punto central con "detent", como el fader de pitch real
    const rate = 1 + pct / 100;
    if (Audio) Audio.setRate(rate);
    vinyl.style.setProperty("--spin", (BASE_SPIN / rate).toFixed(3) + "s");
    pitchOut.textContent = pct === 0 ? "±0.0%" : (pct > 0 ? "+" : "") + pct.toFixed(1) + "%";
    pitchOut.classList.toggle("is-off-center", pct !== 0);
  });
  pitchKnob.dispatchEvent(new CustomEvent("knob", { detail: 50 }));
  if (Audio) {
    vinyl.addEventListener("click", () => Audio.toggle());
    $("#vinylStart").addEventListener("click", () => Audio.toggle());
    Audio.on((type, on) => {
      if (type !== "state") return;
      vinyl.setAttribute("aria-pressed", String(on));
      vinyl.setAttribute("aria-label", on ? "Pausar el tocadiscos" : "Reproducir el tema en el tocadiscos");
      $("#vinylStart .led").classList.toggle("led--on", on);
    });
  }

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

  // Si no se indica "fx", se deduce del nombre del pedal o del instrumento
  const FX_BY_INSTRUMENT = { voz: "reverb", guitarra: "overdrive", bajo: "lowend", bateria: "thunder", teclados: "synth", otro: "delay" };
  const FXDEFS = (Audio && Audio.FX) || {};
  const fxFor = (m) => {
    const k = String(m.fx || m.efecto || "").toLowerCase().replace(/\s+/g, "");
    return FXDEFS[k] ? k : FX_BY_INSTRUMENT[m.instrumento] || "reverb";
  };

  const board = $("#pedalboard");
  (DATA.integrantes || []).forEach((m, i) => {
    const color = PEDAL_COLORS[i % PEDAL_COLORS.length];
    const inst = ICONS[m.instrumento] ? m.instrumento : "otro";
    const photo = safeUrl(m.foto) || (m.foto && !/^[a-z]+:/i.test(m.foto) ? m.foto : "");
    const fxKey = fxFor(m);
    const toma = String(m.toma || "").trim();
    const hasToma = !!toma && !/^\s*javascript:/i.test(toma);
    const fxDef = FXDEFS[fxKey] || { label: fxKey.toUpperCase(), desc: "", knobs: [{ n: "VOL", d: 50 }, { n: "TONE", d: 50 }, { n: "GAIN", d: 50 }] };
    const vals = fxDef.knobs.map((k) => k.d / 100);
    const ch = String(i + 1).padStart(2, "0");
    const el = document.createElement("article");
    el.className = "pedal reveal";
    el.style.setProperty("--pedal", color);
    el.style.transitionDelay = `${i * 70}ms`;
    el.innerHTML = `
      <div class="pedal__jacks" aria-hidden="true"><i></i><i></i></div>
      <div class="pedal__knobs">
        ${fxDef.knobs.map((k) => `<div class="knob knob--sm" data-label="${esc(k.n)}" data-value="${k.d}"></div>`).join("")}
      </div>
      <div class="pedal__brand">
        <span class="led pedal__led"></span>
        <span class="pedal__fx">${esc(fxDef.label)}</span>
      </div>
      <p class="pedal__fxdesc">${esc(fxDef.desc)}</p>
      <div class="pedal__avatar">
        ${photo ? `<img src="${esc(photo)}" alt="${esc(m.nombre)}" loading="lazy">` : `<div class="pedal__icon" aria-hidden="true">${ICONS[inst]}</div>`}
      </div>
      <h3 class="pedal__name">${esc(m.nombre)}</h3>
      <p class="pedal__role">${esc(m.rol)}</p>
      <dl class="pedal__spec">
        <div><dt>CANAL</dt><dd>CH ${ch}${m.equipo ? " · " + esc(m.equipo) : ""}</dd></div>
        ${m.rango ? `<div><dt>RANGO</dt><dd>${esc(m.rango)}</dd></div>` : ""}
        ${m.funcion ? `<div><dt>EN LA MEZCLA</dt><dd>${esc(m.funcion)}</dd></div>` : ""}
      </dl>
      <div class="pedal__lcd">
        <div class="pedal__lcd-top">
          <b class="pedal__state" aria-live="polite">BYPASS</b>
          <span class="pedal__meter" aria-hidden="true">${"<i></i>".repeat(10)}</span>
        </div>
        <div class="pedal__params"></div>
      </div>
      <div class="pedal__controls">
        <button class="pedal__switch" aria-pressed="false" aria-label="Activar ${esc(fxDef.label)} y escuchar a ${esc(m.rol)}">
          <span class="pedal__switch-cap"></span>
        </button>
        <button class="pedal__replay" aria-label="${hasToma ? "Reproducir la toma real" : "Volver a escuchar"}">▶</button>
      </div>
      <span class="pedal__hint">${hasToma ? "▶ Toma real · pisalo para prender el efecto" : "Pisalo: escuchá con y sin efecto"}</span>
      <span class="pedal__model">REV-${ch} · ${esc(fxKey.toUpperCase())}${hasToma ? ` · <b class="pedal__take">TOMA REAL</b>` : ""}</span>
    `;

    const state = $(".pedal__state", el);
    const params = $(".pedal__params", el);
    const meter = $$(".pedal__meter i", el);
    const sw = $(".pedal__switch", el);
    let audioPedal = null;
    let meterUntil = 0;

    const showParams = () => {
      params.textContent = fxDef.knobs.map((k, j) => `${k.n} ${k.f ? k.f(vals[j]) : Math.round(vals[j] * 100)}`).join(" · ");
    };
    showParams();

    let takeOn = false;
    let takeFailed = false;
    const replay = $(".pedal__replay", el);

    const runMeter = () => {
      const lv = audioPedal ? audioPedal.level() : 0;
      const n = Math.min(10, Math.round(lv * 40));
      meter.forEach((seg, j) => seg.classList.toggle("is-lit", j < n));
      if (takeOn || performance.now() < meterUntil) requestAnimationFrame(runMeter);
      else meter.forEach((seg) => seg.classList.remove("is-lit"));
    };
    const startMeter = (ms) => {
      const already = takeOn || performance.now() < meterUntil;
      meterUntil = Math.max(meterUntil, performance.now() + ms);
      if (!already) requestAnimationFrame(runMeter);
    };

    const ensurePedal = () => {
      if (!audioPedal && Audio) audioPedal = Audio.makePedal(fxKey, vals);
      if (audioPedal) audioPedal.setOn(el.classList.contains("is-on"));
      return audioPedal;
    };

    // Frase sintetizada (cuando no hay toma real, o si el archivo no carga)
    const play = () => {
      if (!ensurePedal()) return;
      audioPedal.play(m.instrumento);
      startMeter(3200);
    };

    // Toma real del músico: play/pausa en loop a través del pedal
    const onTakeState = (ev) => {
      if (ev === "error") {
        // El archivo no cargó: el pedal vuelve a la frase sintetizada
        takeFailed = true;
        takeOn = false;
        $(".pedal__hint", el).textContent = "Pisalo: escuchá con y sin efecto";
        const badge = $(".pedal__take", el);
        if (badge) badge.remove();
        play();
      } else {
        if (ev === "play") startMeter(0); // antes de marcar takeOn, para que arranque el medidor
        takeOn = ev === "play";
      }
      el.classList.toggle("is-take", takeOn);
      replay.textContent = takeOn ? "❚❚" : "▶";
      replay.setAttribute("aria-label", takeOn ? "Pausar la toma real" : "Reproducir la toma real");
    };
    const toggleTake = () => {
      if (!ensurePedal()) return;
      audioPedal.toggleTake(toma, onTakeState).catch(() => onTakeState("error"));
    };
    const useTake = () => hasToma && !takeFailed;

    sw.addEventListener("click", () => {
      const on = !el.classList.contains("is-on");
      el.classList.toggle("is-on", on);
      sw.setAttribute("aria-pressed", String(on));
      state.textContent = on ? `● ${fxDef.label} ON` : "BYPASS";
      if (useTake()) {
        ensurePedal();
        if (!takeOn) toggleTake(); // si la toma no sonaba, arranca; si sonaba, solo cambia el efecto
      } else play();
    });
    replay.addEventListener("click", () => (useTake() ? toggleTake() : play()));

    board.appendChild(el);
    $$(".knob", el).forEach((k, j) => {
      initKnob(k);
      k.addEventListener("knob", (e) => {
        vals[j] = e.detail / 100;
        showParams();
        if (audioPedal) audioPedal.set(j, vals[j]);
      });
    });
  });

  /* ---------------- VIDEOS ---------------- */
  function ytId(url) {
    if (!url) return "";
    const m = String(url).match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(url) ? url : "";
  }
  let videos = [];
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

  // Arma el monitor y la lista. Si hay videos con link, se ocultan los
  // placeholders vacíos; los repetidos (mismo video) se muestran una vez.
  function renderVideos(list) {
    const seen = new Set();
    videos = (list || []).map((v) => ({ ...v, id: ytId(v.url) }));
    if (videos.some((v) => v.id)) videos = videos.filter((v) => v.id && !seen.has(v.id) && seen.add(v.id));
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
    renderFeatured(Math.max(0, videos.findIndex((v) => v.destacado)), false);
    observeReveal($("#videos"));
  }
  renderVideos(DATA.videos);

  /* ---------------- FECHAS ---------------- */
  const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const DIAS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
  // Fechas como texto de planilla: "24/10/2026", "24/10/26" o "2026-10-24"; hora "22:00" o "10:00 p. m."
  const parseDate = (str) => {
    const t = String(str || "").trim();
    let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return [+m[1], +m[2], +m[3]];
    m = t.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
    if (m) return [m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2], +m[1]];
    return null;
  };
  const parseTime = (str) => {
    const m = String(str || "").match(/(\d{1,2})[:.](\d{2})/);
    if (!m) return [21, 0];
    let h = +m[1];
    if (/p\.?\s*m/i.test(str) && h < 12) h += 12;
    if (/a\.?\s*m/i.test(str) && h === 12) h = 0;
    return [h, +m[2]];
  };
  const parseGig = (g) => {
    const d = parseDate(g.fecha);
    if (!d) return null;
    const [hh, mm] = parseTime(g.hora);
    const date = new Date(d[0], d[1] - 1, d[2], hh, mm);
    const hora = g.hora ? String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0") : "";
    return isNaN(date) ? null : { ...g, hora, date };
  };

  const gigRow = (g, i, isPast) => {
    const tickets = safeUrl(g.entradas);
    const action = isPast
      ? g.link
        ? `<a class="btn btn--small btn--ghost" href="${esc(g.link)}">Así se vivió</a>`
        : `<span class="gig__tag">TOCADO ✓</span>`
      : g.link
      ? `<a class="btn btn--small btn--primary" href="${esc(g.link)}">Ver evento</a>`
      : tickets
      ? `<a class="btn btn--small btn--primary" href="${esc(tickets)}" target="_blank" rel="noopener">Entradas</a>`
      : `<span class="gig__tag">${esc(g.estado || "Entrada en puerta")}</span>`;
    return `
      <article class="gig reveal${g.especial ? " gig--special" : ""}" style="transition-delay:${i * 60}ms">
        <div class="gig__date">
          <span class="gig__dow">${DIAS[g.date.getDay()]}</span>
          <b>${String(g.date.getDate()).padStart(2, "0")}</b>
          <span>${MESES[g.date.getMonth()]} ${String(g.date.getFullYear()).slice(2)}</span>
        </div>
        <div class="gig__steps" aria-hidden="true">${Array.from({ length: 8 }, () => "<i></i>").join("")}</div>
        <div class="gig__info">
          ${g.especial ? `<span class="gig__badge">★ Evento especial</span>` : ""}
          <h3>${esc(g.nombre || g.lugar)}</h3>
          <p>${esc([g.nombre ? g.lugar : "", g.ciudad].filter(Boolean).join(" · "))}${g.hora ? ` · ${g.horaLabel || ""}${esc(g.hora)} hs` : ""}${g.precio && !isPast ? ` · ${esc(g.precio)}` : ""}</p>
        </div>
        <div class="gig__action">${action}</div>
      </article>`;
  };
  // Sin fechas: el secuenciador queda en "standby" esperando la próxima
  function standbyPanel() {
    const ig = safeUrl(((DATA.contacto || {}).redes || {}).instagram);
    return `
      <div class="standby reveal">
        <div class="standby__bar">
          <span class="standby__title"><span class="led led--on led--amber standby__led"></span>SEQUENCER · STANDBY</span>
          <span class="standby__bpm">BPM <b>---</b></span>
        </div>
        <div class="standby__body">
          <div class="standby__lcd" aria-hidden="true">
            <b>--/--</b>
            <small>SIN FECHAS CARGADAS</small>
          </div>
          <div class="standby__main">
            <div class="standby__steps" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</div>
            <div class="standby__scope" aria-hidden="true">
              <svg viewBox="0 0 400 60" preserveAspectRatio="none"><path d="M0 30H170L178 30L184 12L190 48L196 22L202 36L208 30H400"/></svg>
            </div>
          </div>
        </div>
        <div class="standby__msg">
          <h3>Esperando señal…</h3>
          <p>Estamos en la sala de ensayo preparando las próximas reversiones. Muy pronto anunciamos fechas.</p>
          <div class="standby__actions">
            <a href="#contratar" class="btn btn--primary btn--small"><span class="led led--on"></span>Llevanos a tu evento</a>
            ${ig ? `<a href="${esc(ig)}" class="btn btn--ghost btn--small" target="_blank" rel="noopener">Seguinos para enterarte</a>` : ""}
          </div>
        </div>
      </div>`;
  }
  let countdownTimer = null;
  // El evento especial (evento-fito.js) entra solo en la lista de fechas
  function eventoEspecial() {
    const ev = window.EVENTO_FITO;
    if (!ev || !ev.fecha) return null;
    return {
      fecha: ev.fecha,
      hora: ev.hora || ev.apertura || "",
      horaLabel: !ev.hora && ev.apertura ? "Puertas " : "",
      nombre: ev.titulo,
      lugar: ev.lugar,
      ciudad: ev.ciudad,
      precio: ev.precio,
      link: "eventos/fito-paez/",
      especial: true
    };
  }

  function renderFechas(list) {
    const now = new Date();
    const extra = eventoEspecial();
    if (extra) {
      // si la banda ya lo cargó en la planilla para ese día, se reemplaza por la versión destacada
      const d = parseGig(extra);
      list = (list || []).filter((g) => {
        const p = parseGig(g);
        return !(p && d && p.date.toDateString() === d.date.toDateString());
      });
      list = list.concat(extra);
    }
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const gigs = (list || []).map(parseGig).filter(Boolean);
    const upcoming = gigs.filter((g) => g.date >= startOfToday).sort((a, b) => a.date - b.date);
    const past = gigs.filter((g) => g.date < startOfToday).sort((a, b) => b.date - a.date);

    $("#gigs").innerHTML = upcoming.length ? upcoming.map((g, i) => gigRow(g, i, false)).join("") : standbyPanel();
    $("#pastGigs").innerHTML = past.map((g, i) => gigRow(g, i, true)).join("");
    $("#pastWrap").hidden = !past.length;

    // Cuenta regresiva al próximo show
    clearInterval(countdownTimer);
    const nextGig = upcoming.find((g) => g.date > now);
    $("#countdown").hidden = !nextGig;
    if (nextGig) {
      $("#cdVenue").textContent = [nextGig.nombre, nextGig.lugar, nextGig.ciudad].filter(Boolean).join(" · ");
      const pad = (n) => String(n).padStart(2, "0");
      const tick = () => {
        const s = Math.floor(Math.max(0, nextGig.date - new Date()) / 1000);
        $("#cdD").textContent = pad(Math.floor(s / 86400));
        $("#cdH").textContent = pad(Math.floor((s % 86400) / 3600));
        $("#cdM").textContent = pad(Math.floor((s % 3600) / 60));
        $("#cdS").textContent = pad(s % 60);
      };
      tick();
      countdownTimer = setInterval(tick, 1000);
    }
    observeReveal($("#fechas"));
  }
  $("#pastWrap").addEventListener("toggle", () => observeReveal($("#pastWrap")));

  /* ---------------- PLANILLA DE GOOGLE ----------------
     La banda edita una planilla con dos pestañas, "Fechas" y "Videos", y la
     web la lee al cargar. Acepta el link para compartir (".../d/ID/edit...")
     o el de "Publicar en la web". Si falla, quedan los datos de content.js. */
  function sheetCsvUrl(url, sheet) {
    const u = String(url || "").trim();
    if (!/^https:\/\/docs\.google\.com\/spreadsheets\//.test(u)) return "";
    const tab = sheet ? "&sheet=" + encodeURIComponent(sheet) : "";
    const gid = !sheet && (u.match(/[#&?]gid=(\d+)/) || [])[1];
    const pub = u.match(/^(https:\/\/docs\.google\.com\/spreadsheets\/d\/e\/[\w-]+)/);
    if (pub) return `${pub[1]}/pub?output=csv${tab}${gid ? "&gid=" + gid : ""}`;
    const id = (u.match(/\/d\/([\w-]+)/) || [])[1];
    return id ? `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv${tab}${gid ? "&gid=" + gid : ""}` : "";
  }
  function parseCsv(text) {
    const rows = [];
    let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') (cell += '"'), i++;
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ",") row.push(cell), (cell = "");
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell), rows.push(row), (row = []), (cell = "");
      } else cell += c;
    }
    if (cell || row.length) row.push(cell), rows.push(row);
    return rows;
  }
  // Convierte el CSV en objetos según los encabezados (sin importar mayúsculas ni tildes)
  function sheetRows(text, cols, required) {
    const [head, ...rows] = parseCsv(text);
    if (!head) return [];
    const norm = (h) => h.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    const idx = {};
    head.forEach((h, i) => Object.entries(cols).forEach(([k, re]) => idx[k] == null && re.test(norm(h)) && (idx[k] = i)));
    if (idx[required] == null) throw new Error("Falta la columna " + required);
    return rows
      .map((r) => Object.fromEntries(Object.keys(cols).map((k) => [k, idx[k] != null ? (r[idx[k]] || "").trim() : ""])))
      .filter((g) => g[required]);
  }
  const FECHA_COLS = { fecha: /^fecha/, hora: /^hora/, lugar: /^lugar/, ciudad: /^(ciudad|localidad)/, entradas: /^(entrada|link)/, estado: /^(estado|etiqueta|nota)/ };
  const DATO_COLS = { label: /^dato/, numero: /^(numero|valor|cantidad)/ };
  const VIDEO_COLS = { url: /^(link|url|video|youtube)/, titulo: /^titulo/, lugar: /^(lugar|descripcion)/, destacado: /^destacad/ };

  const planilla = DATA.planilla || DATA.fechasPlanilla;
  const loadSheet = (sheet, cols, required) => {
    const url = sheetCsvUrl(planilla, sheet);
    if (!url) return Promise.reject(new Error("Link de planilla inválido"));
    return fetch(url, { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((text) => sheetRows(text, cols, required));
  };

  if (sheetCsvUrl(planilla)) {
    $("#gigs").innerHTML = `<p class="gigs__loading">▸ Sincronizando fechas…</p>`;
    // Pestaña "Fechas"; si no existe con ese nombre, la primera pestaña
    loadSheet("Fechas", FECHA_COLS, "fecha")
      .catch(() => loadSheet(null, FECHA_COLS, "fecha"))
      .then(renderFechas)
      .catch(() => renderFechas(DATA.fechas));
    // Pestaña "Videos": primero los de la planilla, después los de content.js
    loadSheet("Videos", VIDEO_COLS, "url")
      .then((rows) => {
        const fromSheet = rows
          .filter((v) => ytId(v.url))
          .map((v) => ({ ...v, destacado: /^(si|sí|x|true|1|yes)$/i.test(v.destacado) }));
        if (!fromSheet.length) return;
        const defaults = (DATA.videos || []).map((v) => (fromSheet.some((f) => f.destacado) ? { ...v, destacado: false } : v));
        renderVideos(fromSheet.concat(defaults));
      })
      .catch(() => {});
    // Pestaña "Datos": los contadores LCD ("150+" -> 150 con sufijo "+")
    loadSheet("Datos", DATO_COLS, "label")
      .then((rows) => {
        const stats = rows
          .map((r) => {
            const m = String(r.numero).trim().match(/^([^\d]*)([\d.,]+)(.*)$/);
            return m ? { label: r.label, valor: parseInt(m[2].replace(/[.,]/g, ""), 10), sufijo: (m[1] + m[3]).trim() } : null;
          })
          .filter(Boolean);
        if (stats.length) renderStats(stats);
      })
      .catch(() => {});
  } else renderFechas(DATA.fechas);

  /* ---------------- CONCEPTO (cadena de señal) ---------------- */
  const concepto = DATA.concepto || {};
  $("#conceptLead").textContent = concepto.lead || "";
  $("#chain").innerHTML = (concepto.pasos || [])
    .map(
      (p, i) => `
      <article class="module reveal" style="transition-delay:${i * 120}ms">
        <span class="module__jack module__jack--in" aria-hidden="true"></span>
        <span class="module__jack module__jack--out" aria-hidden="true"></span>
        <div class="module__top">
          <span class="module__code">${esc(p.codigo || String(i + 1))}</span>
          <span class="led led--on${i === (concepto.pasos.length - 1) ? " led--red" : ""}"></span>
        </div>
        <div class="module__scope" aria-hidden="true"><svg viewBox="0 0 120 40" preserveAspectRatio="none"><path d="${wavePath(i)}"/></svg></div>
        <span class="module__n">${String(i + 1).padStart(2, "0")}</span>
        <h3>${esc(p.titulo)}</h3>
        <p>${esc(p.texto)}</p>
        <div class="module__knobs"><div class="knob knob--sm" data-label="IN"></div><div class="knob knob--sm" data-label="OUT"></div></div>
      </article>`
    )
    .join("");
  $$("#chain .knob").forEach(initKnob);

  // Cada etapa "procesa" la onda: limpia, separada, con efecto, saturada
  function wavePath(stage) {
    let d = "";
    for (let x = 0; x <= 120; x += 2) {
      const t = x / 120;
      let y;
      if (stage === 0) y = Math.sin(t * Math.PI * 4);
      else if (stage === 1) y = (x % 30 < 15 ? 1 : 0.4) * Math.sin(t * Math.PI * 8);
      else if (stage === 2) y = Math.sin(t * Math.PI * 4) * 0.6 + Math.sin(t * Math.PI * 13) * 0.4;
      else y = Math.max(-0.8, Math.min(0.8, Math.sin(t * Math.PI * 4) * 1.6));
      d += (x ? "L" : "M") + x + " " + (20 - y * 15).toFixed(1);
    }
    return d;
  }

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

  /* ---------------- EQ MASTER ----------------
     5 bandas reales sobre todo lo que suena en la web (tema, loop y pedales). */
  const eqInputs = $$("#eq input[type=range]");
  const eqOutputs = $$("#eq output");
  const eqPlay = $("#eqPlay");
  const setBand = (i, v) => {
    eqInputs[i].value = v;
    eqOutputs[i].textContent = (v > 0 ? "+" : "") + v;
    eqOutputs[i].classList.toggle("is-boost", v > 0);
    eqOutputs[i].classList.toggle("is-cut", v < 0);
    if (Audio) Audio.setEQ(i, +v);
  };
  eqInputs.forEach((inp, i) => inp.addEventListener("input", () => setBand(i, +inp.value)));
  $("#eqFlat").addEventListener("click", () => eqInputs.forEach((_, i) => setBand(i, 0)));
  if (Audio) {
    eqPlay.addEventListener("click", () => Audio.toggle());
    Audio.on((type, on) => {
      if (type !== "state") return;
      eqPlay.setAttribute("aria-pressed", String(on));
      eqPlay.textContent = on ? "❚❚ Pausar" : "▶ Escuchar";
      $("#eqLed").classList.toggle("led--on", on);
    });
  } else eqPlay.hidden = true;

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
