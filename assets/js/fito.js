/* =====================================================================
   HOMENAJE A FITO PÁEZ · Página del evento
   Lee window.EVENTO_FITO (evento-fito.js) y los integrantes y el contacto
   de window.REVERSIONES (content.js).
   ===================================================================== */
(function () {
  "use strict";

  const EV = window.EVENTO_FITO || {};
  const BAND = window.REVERSIONES || {};
  const ROOT = "../../"; // la página vive en /eventos/fito-paez/
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (str) =>
    String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^(https?:|mailto:|tel:)/i.test(u || "") ? u : "");
  // Rutas de content.js / evento-fito.js son relativas a la raíz del sitio
  const asset = (p) => {
    const s = String(p || "").trim();
    if (!s || /^[a-z]+:/i.test(s)) return /^https?:/i.test(s) ? s : "";
    return ROOT + s.replace(/^\.?\//, "");
  };
  const ytId = (url) => {
    const m = String(url || "").match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
    return m ? m[1] : "";
  };

  /* ---------------- Fecha y estado del evento ---------------- */
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const [y, mo, d] = String(EV.fecha || "").split("-").map(Number);
  const [hh, mm] = String(EV.hora || "").split(":").map(Number);
  const hasDate = y && mo && d;
  const start = hasDate ? new Date(y, mo - 1, d, isNaN(hh) ? 0 : hh, isNaN(mm) ? 0 : mm) : null;
  // Se considera terminado a las 6 de la mañana del día siguiente
  const over = hasDate ? new Date(y, mo - 1, d + 1, 6, 0) : null;
  const isDone = over && new Date() > over;
  document.body.classList.toggle("is-done", !!isDone);

  /* ---------------- Afiche ---------------- */
  $("#presenta").textContent = EV.presenta || "";
  const NOMBRE = EV.titulo || "Todo Fito";
  $("#titulo").textContent = NOMBRE;
  $("#bajada").textContent = EV.bajada || "";
  document.title = `${NOMBRE} · Homenaje a ${EV.homenaje || "Fito Páez"} · Reversiones`;

  if (hasDate) {
    $("#stampDay").textContent = d;
    $("#stampMonth").textContent = MESES[mo - 1].slice(0, 3);
  } else $("#stamp").hidden = true;
  if (isDone) $("#stamp").classList.add("is-done");

  const facts = [];
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
  if (hasDate) facts.push(`<b>${cap(DIAS[start.getDay()])}</b> ${d} de ${MESES[mo - 1]}`);
  facts.push(EV.hora ? `<b>${esc(EV.hora)}</b> hs` : "Hora a confirmar");
  if (EV.apertura && !isDone) facts.push(`Puertas <b>${esc(EV.apertura)}</b>`);
  facts.push([EV.lugar ? `<b>${esc(EV.lugar)}</b>` : "Sala a confirmar", esc(EV.ciudad || "")].filter(Boolean).join(" · "));
  if (EV.precio && !isDone) facts.push(`Entrada <b>${esc(EV.precio)}</b>`);
  $("#facts").innerHTML = facts.map((f) => `<li>${f}</li>`).join("");

  if (isDone) {
    $("#posterCta").innerHTML = `<a href="#recuerdo" class="pill pill--ink">Ver cómo se vivió</a><a href="#banda" class="pill">Quiénes tocaron</a>`;
  }

  /* ---------------- Cinta con canciones de Fito ---------------- */
  const CANCIONES = [
    "Mariposa Tecknicolor",
    "11 y 6",
    "El amor después del amor",
    "Ciudad de pobres corazones",
    "Dar es dar",
    "A rodar mi vida",
    "Circo Beat",
    "Y dale alegría a mi corazón",
    "Brillante sobre el mic",
    "Tumbas de la gloria",
    "Un vestido y un amor",
    "Al lado del camino"
  ];
  const rib = CANCIONES.map((c) => `<span>${esc(c)}</span><i>✦</i>`).join("");
  $("#ribbon").innerHTML = rib + rib;

  /* ---------------- Cuenta regresiva / recuerdo ---------------- */
  const pad = (n) => String(n).padStart(2, "0");
  if (!hasDate) $("#countdownWrap").hidden = true;
  else if (isDone) {
    $(".countdown").classList.add("is-done");
    $("#cdLabel").textContent = (EV.recuerdo && EV.recuerdo.mensaje) || "¡Gracias por venir!";
  } else {
    const tick = () => {
      const diff = start - new Date();
      if (diff <= 0) {
        $("#cdLabel").textContent = "¡Es hoy! Te esperamos";
        $(".countdown__nums").hidden = true;
        return;
      }
      const s = Math.floor(diff / 1000);
      $("#cdD").textContent = pad(Math.floor(s / 86400));
      $("#cdH").textContent = pad(Math.floor((s % 86400) / 3600));
      $("#cdM").textContent = pad(Math.floor((s % 3600) / 60));
      $("#cdS").textContent = pad(s % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- Cómo va a ser ---------------- */
  $("#descripcion").textContent = EV.descripcion || "";
  // Setlist secreto: los temas se descubren en vivo (títulos tapados)
  if (EV.setlistSecreto || !(EV.cronograma || []).length) {
    $("#cronograma").outerHTML = `
      <div class="secret reveal">
        <div class="secret__head">
          <span class="secret__seal">Setlist secreto</span>
          <span class="secret__side">Lado A · Lado B</span>
        </div>
        <ol class="secret__list">${[62, 48, 74, 55, 68, 42, 60, 51]
          .map((w, i) => `<li><span class="secret__n">${String(i + 1).padStart(2, "0")}</span><span class="secret__bar" style="--w:${w}%"></span><span class="secret__q">?</span></li>`)
          .join("")}</ol>
        <p class="secret__foot">El repertorio <b>se descubre en vivo</b>. Vení a cantarlo.</p>
      </div>`;
  } else
  $("#cronograma").innerHTML = (EV.cronograma || [])
    .map(
      (c) => `
      <li class="reveal">
        <h3>${esc(c.titulo)}</h3>
        <time>${c.hora ? esc(c.hora) + " hs" : "—"}</time>
        ${c.texto ? `<p>${esc(c.texto)}</p>` : ""}
      </li>`
    )
    .join("");
  if (isDone) $("#show .sec__head h2").textContent = "Cómo fue";

  /* ---------------- En escena: polaroids ---------------- */
  const ICONS = {
    voz: `<svg viewBox="0 0 64 64"><rect x="22" y="6" width="20" height="32" rx="10"/><path d="M14 30a18 18 0 0 0 36 0M32 48v10M22 58h20"/></svg>`,
    guitarra: `<svg viewBox="0 0 64 64"><path d="M40 8l16 16-4 4-3-1-12 12 2 3a11 11 0 0 1-4 14c-6 4-14 3-19-2s-6-13-2-19a11 11 0 0 1 14-4l3 2 12-12-1-3z"/><circle cx="25" cy="39" r="4"/></svg>`,
    bajo: `<svg viewBox="0 0 64 64"><path d="M44 4l16 16-4 4-3-1-14 14 2 3a12 12 0 0 1-4 15c-7 4-15 3-20-2s-6-13-2-20a12 12 0 0 1 15-4l3 2 14-14-1-3z"/><path d="M14 44l6 6M18 40l6 6"/></svg>`,
    bateria: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="34" rx="20" ry="7"/><path d="M12 34v14c0 4 9 7 20 7s20-3 20-7V34M8 6l18 22M56 6L38 28"/></svg>`,
    teclados: `<svg viewBox="0 0 64 64"><rect x="4" y="18" width="56" height="30" rx="3"/><path d="M12 18v30M20 18v30M28 18v30M36 18v30M44 18v30M52 18v30"/></svg>`,
    otro: `<svg viewBox="0 0 64 64"><circle cx="20" cy="46" r="8"/><circle cx="48" cy="40" r="8"/><path d="M28 46V12l28-6v34"/></svg>`
  };
  const tilt = (i) => [-3, 2, -1.5, 3, -2.5, 1.5][i % 6];
  $("#integrantes").innerHTML = (BAND.integrantes || [])
    .map((m, i) => {
      const foto = asset(m.foto);
      return `
      <figure class="polaroid reveal" style="--tilt:${tilt(i)}deg">
        <div class="polaroid__img">${foto ? `<img src="${esc(foto)}" alt="${esc(m.nombre)}" loading="lazy">` : ICONS[m.instrumento] || ICONS.otro}</div>
        <figcaption><b>${esc(m.nombre)}</b><span>${esc(m.rol)}</span></figcaption>
      </figure>`;
    })
    .join("");

  /* ---------------- Entradas: puntos de venta ---------------- */
  const contacto = BAND.contacto || {};
  const wa = String(contacto.whatsapp || "").replace(/\D/g, "");
  const waLink = (text) => (wa ? `https://wa.me/${wa}?text=${encodeURIComponent(text)}` : "");
  const puntos = EV.puntosDeVenta || [];
  if (isDone) $("#entradas").hidden = true;
  else if (puntos.length) {
    $("#puntos").innerHTML = puntos
      .map((p) => {
        const dir = [p.direccion, p.ciudad || EV.ciudad].filter(Boolean).join(", ");
        const maps = p.direccion ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dir)}` : "";
        return `
        <article class="ticket reveal">
          <div class="ticket__main">
            <h3>${esc(p.nombre)}</h3>
            ${dir ? `<p>📍 ${esc(dir)}</p>` : ""}
            ${p.horario ? `<p>🕘 ${esc(p.horario)}</p>` : ""}
            ${p.telefono ? `<p>☎ ${esc(p.telefono)}</p>` : ""}
            ${maps ? `<a class="pill" href="${maps}" target="_blank" rel="noopener">Cómo llegar</a>` : ""}
          </div>
          <div class="ticket__stub"><span>ENTRADAS</span></div>
        </article>`;
      })
      .join("");
  } else {
    const link = waLink(`¡Hola Reversiones! Quiero entradas para ${NOMBRE}. ¿Dónde las consigo?`);
    $("#puntos").innerHTML = `
      <article class="ticket ticket--empty reveal">
        <div class="ticket__main">
          <h3>Puntos de venta a confirmar</h3>
          <p>Muy pronto publicamos dónde conseguir las entradas en Firmat.</p>
          ${link ? `<a class="pill" href="${link}" target="_blank" rel="noopener">Consultar por WhatsApp</a>` : ""}
        </div>
        <div class="ticket__stub"><span>PRÓXIMAMENTE</span></div>
      </article>`;
  }

  /* ---------------- Sponsors ---------------- */
  const sponsors = EV.sponsors || [];
  const sponsorCards = sponsors.map((s) => {
    const url = safeUrl(s.url);
    const logo = asset(s.logo);
    const tag = url ? "a" : "div";
    const main = /principal/i.test(s.tipo || "") ? " sponsor--main" : "";
    return `
      <${tag} class="sponsor reveal${main}"${url ? ` href="${esc(url)}" target="_blank" rel="noopener"` : ""}>
        ${logo ? `<img src="${esc(logo)}" alt="${esc(s.nombre)}" loading="lazy">` : `<b>${esc(s.nombre)}</b>`}
        ${s.tipo ? `<small>${esc(s.tipo)}</small>` : ""}
      </${tag}>`;
  });
  if (!isDone) {
    const link = waLink(`¡Hola Reversiones! Me interesa sumarme como sponsor de ${NOMBRE}.`);
    sponsorCards.push(`
      <${link ? "a" : "div"} class="sponsor sponsor--cta reveal"${link ? ` href="${link}" target="_blank" rel="noopener"` : ""}>
        <b>¿Querés sumarte?</b>
        <span>Escribinos y te contamos cómo ser parte.</span>
      </${link ? "a" : "div"}>`);
  }
  $("#sponsorList").innerHTML = sponsorCards.join("");
  if (!sponsorCards.length) $("#sponsors").hidden = true;

  /* ---------------- Recuerdo (después del evento) ---------------- */
  const rec = EV.recuerdo || {};
  const fotos = (rec.fotos || []).map(asset).filter(Boolean);
  const vids = (rec.videos || []).map(ytId).filter(Boolean);
  if (isDone) {
    $("#recuerdo").hidden = false;
    $("#recuerdoMsg").textContent = fotos.length || vids.length ? "Así se vivió" : "Fotos y videos, muy pronto";
    $("#recuerdo .sec__kicker").textContent = rec.mensaje || "Gracias";
    $("#galeria").innerHTML = fotos
      .map((f, i) => `<figure class="polaroid reveal" style="--tilt:${tilt(i)}deg"><div class="polaroid__img"><img src="${esc(f)}" alt="Foto del homenaje" loading="lazy"></div></figure>`)
      .join("");
    $("#recuerdoVideos").innerHTML = vids
      .map((id) => `<div class="memvideo reveal"><button data-id="${id}" aria-label="Reproducir video"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy"></button></div>`)
      .join("");
    $$("#recuerdoVideos button").forEach((b) =>
      b.addEventListener("click", () => {
        b.parentElement.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.id}?autoplay=1&rel=0" title="Video del homenaje" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
      })
    );
  }

  /* ---------------- Mariposas tecknicolor ---------------- */
  const bfWrap = $("#butterflies");
  const BF = reduceMotion ? 3 : innerWidth < 600 ? 5 : 9;
  for (let i = 0; i < BF; i++) {
    const b = document.createElement("div");
    b.className = "bf";
    b.style.cssText = `left:${5 + Math.random() * 88}%;top:${8 + Math.random() * 62}%;--s:${40 + Math.random() * 44}px;--d:${12 + Math.random() * 14}s;--delay:${-Math.random() * 20}s;--r:${-30 + Math.random() * 60}deg`;
    b.innerHTML = `<div class="bf__body"><svg viewBox="0 0 50 60"><use href="#wing"/></svg><i class="bf__torso"></i><svg viewBox="0 0 50 60"><use href="#wing" transform="matrix(-1 0 0 1 50 0)"/></svg></div>`;
    bfWrap.appendChild(b);
  }

  /* ---------------- Piano tocable ----------------
     Dos octavas desde Do4. Mouse/dedo (arrastrando hace glissando) o teclado:
     A S D F G H J K L = teclas blancas, W E T Y U = negras. */
  const piano = $("#piano");
  const WHITE = [0, 2, 4, 5, 7, 9, 11];
  const NAMES = { 0: "Do", 2: "Re", 4: "Mi", 5: "Fa", 7: "Sol", 9: "La", 11: "Si" };
  const BASE = 60; // Do4
  const whites = [];
  const RANGE = innerWidth < 600 ? 12 : 24; // en celular, una octava (teclas más anchas)
  for (let n = BASE; n <= BASE + RANGE; n++) if (WHITE.includes((n - BASE) % 12)) whites.push(n);
  const bw = `calc((100% - 20px) / ${whites.length} * 0.6)`;
  whites.forEach((n) => {
    const k = document.createElement("button");
    k.className = "key";
    k.dataset.note = n;
    k.setAttribute("aria-label", NAMES[(n - BASE) % 12]);
    if ((n - BASE) % 12 === 0) k.innerHTML = `<small>Do</small>`;
    piano.appendChild(k);
  });
  whites.forEach((n, i) => {
    const pc = (n - BASE) % 12;
    if (i === whites.length - 1 || pc === 4 || pc === 11) return; // sin negra después de Mi y Si
    const k = document.createElement("button");
    k.className = "key key--black";
    k.dataset.note = n + 1;
    k.setAttribute("aria-label", NAMES[pc] + " sostenido");
    k.style.setProperty("--bw", bw);
    k.style.left = `calc(10px + (100% - 20px) / ${whites.length} * ${i + 1} - ${bw} / 2)`;
    piano.appendChild(k);
  });

  let ctx = null;
  let master = null;
  function audio() {
    if (ctx) return ctx.state === "suspended" ? (ctx.resume(), ctx) : ctx;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createDynamicsCompressor();
    const g = ctx.createGain();
    g.gain.value = 0.8;
    master.connect(g).connect(ctx.destination);
    return ctx;
  }
  // Piano sintetizado: armónicos con caída rápida y brillo que se apaga
  function playNote(n) {
    if (!audio()) return;
    const t = ctx.currentTime;
    const f = 440 * Math.pow(2, (n - 69) / 12);
    const out = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(Math.min(9000, f * 10), t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(400, f * 2), t + 1.2);
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.35, t + 0.005);
    out.gain.exponentialRampToValueAtTime(0.12, t + 0.3);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    lp.connect(out).connect(master);
    [
      [1, "triangle", 1],
      [2, "sine", 0.35],
      [3, "sine", 0.12],
      [1.003, "sine", 0.4]
    ].forEach(([mul, type, vol]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = f * mul;
      g.gain.value = vol;
      o.connect(g).connect(lp);
      o.start(t);
      o.stop(t + 2.3);
    });
  }
  const press = (k) => {
    if (!k || !k.dataset.note) return;
    playNote(+k.dataset.note);
    k.classList.add("is-down");
    setTimeout(() => k.classList.remove("is-down"), 180);
  };
  let dragging = false;
  let lastKey = null;
  piano.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastKey = e.target.closest(".key");
    press(lastKey);
    e.preventDefault();
  });
  piano.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const k = document.elementFromPoint(e.clientX, e.clientY);
    const key = k && k.closest(".key");
    if (key && key !== lastKey) press((lastKey = key));
  });
  addEventListener("pointerup", () => (dragging = false));
  piano.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      press(e.target.closest(".key"));
      e.preventDefault();
    }
  });
  const KEYMAP = { a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66, g: 67, y: 68, h: 69, u: 70, j: 71, k: 72, l: 74 };
  addEventListener("keydown", (e) => {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
    const n = KEYMAP[e.key.toLowerCase()];
    if (n) press($(`.key[data-note="${n}"]`, piano));
  });

  /* ---------------- Invitados sorpresa: raspadita ----------------
     Cada tarjeta muestra una pista; al raspar la capa tecknicolor aparece
     el invitado (nombre/rol/foto vienen codificados en evento-fito.js).
     Las bloqueadas por fecha muestran cuánto falta. Lo descubierto se
     recuerda en este navegador. Después del evento, todo destapado. */
  const decodeSecret = (s) => {
    try {
      const bin = atob(String(s || "").split("").reverse().join(""));
      return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
    } catch (e) {
      return null;
    }
  };
  window.codificarInvitado = (o) => {
    const bytes = new TextEncoder().encode(JSON.stringify(o));
    return btoa(String.fromCharCode(...bytes)).split("").reverse().join("");
  };

  const invitados = EV.invitados || [];
  const SEEN_KEY = "todofito-invitados";
  let seen = [];
  try {
    seen = JSON.parse(localStorage.getItem(SEEN_KEY)) || [];
  } catch (e) {}
  const remember = (i) => {
    if (!seen.includes(i)) seen.push(i);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    } catch (e) {}
  };
  const unlockDate = (g) => {
    const [uy, um, ud] = String(g.desbloquea || "").split("-").map(Number);
    return uy && um && ud ? new Date(uy, um - 1, ud) : null;
  };
  const isLocked = (g) => !isDone && unlockDate(g) && new Date() < unlockDate(g);

  function updateProgress() {
    const total = invitados.length;
    const found = isDone ? total : $$(".scratcher.is-revealed").length;
    const locked = $$(".scratcher.is-locked").length;
    $("#invitadosProgreso").innerHTML = isDone
      ? ""
      : `Descubriste <b>${found}</b> de <b>${total}</b>${locked ? ` · ${locked} todavía bloqueado${locked > 1 ? "s" : ""}` : ""}`;
  }

  function celebrate(card) {
    // acorde de piano + mariposas que salen de la tarjeta
    [60, 64, 67, 72].forEach((n, i) => setTimeout(() => playNote(n), i * 70));
    if (reduceMotion) return;
    for (let k = 0; k < 8; k++) {
      const b = document.createElement("div");
      b.className = "bf bf--burst";
      b.style.cssText = `--s:${26 + Math.random() * 20}px;--x:${-160 + Math.random() * 320}px;--y:${-120 - Math.random() * 160}px;--r:${-40 + Math.random() * 80}deg`;
      b.innerHTML = `<div class="bf__body"><svg viewBox="0 0 50 60"><use href="#wing"/></svg><i class="bf__torso"></i><svg viewBox="0 0 50 60"><use href="#wing" transform="matrix(-1 0 0 1 50 0)"/></svg></div>`;
      $(".scratcher__media", card).appendChild(b);
      setTimeout(() => b.remove(), 1600);
    }
  }

  const people = invitados.map((g) => decodeSecret(g.secreto) || {});

  function reveal(card, i, animate) {
    card.classList.add("is-revealed");
    // el nombre recién se escribe al descubrirlo
    $(".scratcher__name b", card).textContent = people[i].nombre || "";
    $(".scratcher__name span", card).textContent = people[i].rol || "";
    const cv = $("canvas", card);
    if (cv) setTimeout(() => cv.remove(), animate ? 500 : 0);
    const btn = $(".scratcher__btn", card);
    if (btn) btn.remove();
    remember(i);
    if (animate) celebrate(card);
    updateProgress();
  }

  function setupScratch(card, i) {
    const media = $(".scratcher__media", card);
    const cv = document.createElement("canvas");
    cv.className = "scratcher__foil";
    cv.setAttribute("aria-hidden", "true");
    media.appendChild(cv);
    const c = cv.getContext("2d", { willReadFrequently: true });
    const size = () => {
      // tamaño sin la inclinación de la tarjeta (getBoundingClientRect la incluye)
      const r = { width: media.clientWidth, height: media.clientHeight };
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = r.width * dpr;
      cv.height = r.height * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      // capa raspable: franjas tecknicolor con brillo metálico
      const g = c.createLinearGradient(0, 0, r.width, r.height);
      ["#e8217c", "#ffb000", "#14b8c9", "#6f3bd8"].forEach((col, k) => g.addColorStop(k / 3, col));
      c.globalCompositeOperation = "source-over";
      c.fillStyle = g;
      c.fillRect(0, 0, r.width, r.height);
      c.fillStyle = "rgba(255,255,255,.18)";
      for (let x = -r.height; x < r.width; x += 18) {
        c.beginPath();
        c.moveTo(x, r.height);
        c.lineTo(x + r.height, 0);
        c.lineTo(x + r.height + 7, 0);
        c.lineTo(x + 7, r.height);
        c.fill();
      }
      c.fillStyle = "#fffdf7";
      c.textAlign = "center";
      c.font = `400 ${Math.round(r.width / 6.5)}px "Abril Fatface", Georgia, serif`;
      c.fillText("RASPÁ", r.width / 2, r.height / 2 + 4);
      c.font = `600 ${Math.round(r.width / 11)}px Caveat, cursive`;
      c.fillText("y descubrí quién es", r.width / 2, r.height / 2 + r.width / 7);
    };
    size();
    let down = false;
    let last = null;
    let moves = 0;
    // redibuja con las tipografías del afiche cuando terminan de cargar (si nadie raspó todavía)
    if (document.fonts)
      Promise.all([document.fonts.load('400 30px "Abril Fatface"'), document.fonts.load("600 20px Caveat")]).then(() => {
        if (!moves && cv.isConnected) size();
      });
    const scratchAt = (e) => {
      // coordenadas locales aunque la tarjeta esté inclinada
      const r = cv.getBoundingClientRect();
      const ang = (parseFloat(getComputedStyle(card).rotate) || 0) * (Math.PI / 180);
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const p = {
        x: cv.clientWidth / 2 + dx * Math.cos(-ang) - dy * Math.sin(-ang),
        y: cv.clientHeight / 2 + dx * Math.sin(-ang) + dy * Math.cos(-ang)
      };
      c.globalCompositeOperation = "destination-out";
      c.lineWidth = Math.max(26, cv.clientWidth / 8);
      c.lineCap = "round";
      c.beginPath();
      c.moveTo((last || p).x, (last || p).y);
      c.lineTo(p.x, p.y);
      c.stroke();
      last = p;
      if (++moves % 12 === 0 && clearedRatio() > 0.5) reveal(card, i, true);
    };
    const clearedRatio = () => {
      const d = c.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0, total = 0;
      for (let k = 3; k < d.length; k += 4 * 24) {
        total++;
        if (d[k] < 40) clear++;
      }
      return clear / total;
    };
    cv.addEventListener("pointerdown", (e) => {
      down = true;
      last = null;
      cv.setPointerCapture(e.pointerId);
      scratchAt(e);
      e.preventDefault();
    });
    // también raspa si se entra a la tarjeta con el botón ya apretado
    cv.addEventListener("pointermove", (e) => (down || e.buttons & 1) && scratchAt(e));
    cv.addEventListener("pointerleave", () => (last = null));
    cv.addEventListener("pointerup", () => ((down = false), (last = null)));
    // alternativa sin raspar (teclado / lectores de pantalla)
    $(".scratcher__btn", card).addEventListener("click", () => reveal(card, i, true));
  }

  if (invitados.length) {
    $("#invitados").hidden = false;
    if (isDone) {
      $("#invitados .sec__kicker").textContent = "Gracias";
      $("#invitados h2").textContent = "Invitados especiales";
      $("#invitadosLead").textContent = "Los que se sumaron a la noche.";
    }
    const fmtDay = (dt) => `${DIAS[dt.getDay()]} ${dt.getDate()}`;
    $("#invitadosList").innerHTML = invitados
      .map((g, i) => {
        const locked = isLocked(g);
        const who = locked ? {} : people[i]; // las bloqueadas no revelan nada
        const foto = asset(who.foto);
        return `
        <article class="scratcher reveal${locked ? " is-locked" : ""}" style="--tilt:${tilt(i + 1)}deg" data-i="${i}">
          <header class="scratcher__head"><span>Invitado especial</span><b>#${String(i + 1).padStart(2, "0")}</b></header>
          <div class="scratcher__media">
            <div class="scratcher__prize">
              ${foto ? `<img src="${esc(foto)}" alt="" loading="lazy">` : `<span class="scratcher__initial">${esc((who.nombre || "?").trim().charAt(0))}</span>`}
            </div>
            ${locked ? `<div class="scratcher__lock"><span>🔒</span><b>Se desbloquea</b><small>el ${fmtDay(unlockDate(g))}</small><em data-unlock="${unlockDate(g).getTime()}"></em></div>` : ""}
          </div>
          <div class="scratcher__body">
            ${g.pista ? `<p class="scratcher__clue">“${esc(g.pista)}”</p>` : ""}
            <p class="scratcher__name"><b></b><span></span></p>
            ${locked || isDone ? "" : `<button class="scratcher__btn" type="button">Revelar sin raspar</button>`}
          </div>
        </article>`;
      })
      .join("");
    $$(".scratcher").forEach((card) => {
      const i = +card.dataset.i;
      if (card.classList.contains("is-locked")) return;
      if (isDone || seen.includes(i)) reveal(card, i, false);
      else setupScratch(card, i);
    });
    // cuenta regresiva de las bloqueadas
    const lockTick = () =>
      $$(".scratcher__lock em").forEach((em) => {
        const s = Math.max(0, Math.floor((+em.dataset.unlock - Date.now()) / 1000));
        if (!s) return location.reload();
        em.textContent = `${Math.floor(s / 86400)}d ${pad(Math.floor((s % 86400) / 3600))}h ${pad(Math.floor((s % 3600) / 60))}m`;
      });
    lockTick();
    setInterval(lockTick, 30000);
    updateProgress();
  }

  /* ---------------- Aparición al hacer scroll ---------------- */
  const obs = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          obs.unobserve(e.target);
        }
      }),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => obs.observe(el));
})();
