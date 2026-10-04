/* =====================================================================
   REVERSIONES · Panel de contenido
   Edita una copia de window.REVERSIONES y genera un content.js nuevo.
   ===================================================================== */
(function () {
  "use strict";

  const KEY = "reversiones-draft";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));

  let data;
  try {
    data = JSON.parse(localStorage.getItem(KEY)) || clone(window.REVERSIONES);
  } catch (e) {
    data = clone(window.REVERSIONES);
  }

  const msg = $("#msg");
  const save = (text) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      msg.textContent = text || "Borrador guardado en este navegador.";
    } catch (e) {
      msg.textContent = "No se pudo guardar el borrador (el navegador lo bloquea). Descargá antes de cerrar.";
    }
  };

  const ytId = (url) => {
    const m = String(url || "").match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
    return m ? m[1] : /^[\w-]{11}$/.test(url || "") ? url : "";
  };

  /* Definición de campos por lista */
  const LISTS = {
    videos: {
      title: "Videos destacados",
      help: "Pegá el link de YouTube. Marcá uno como destacado para que aparezca en grande.",
      empty: { titulo: "", url: "", lugar: "", destacado: false },
      fields: [
        { k: "titulo", label: "Título" },
        { k: "url", label: "Link de YouTube", type: "url" },
        { k: "lugar", label: "Lugar / Descripción" },
        { k: "destacado", label: "Destacado", type: "check" }
      ],
      extra: (item) => {
        const id = ytId(item.url);
        return `<div class="thumb" style="${id ? `background-image:url(https://i.ytimg.com/vi/${id}/mqdefault.jpg)` : ""}">${id ? "" : "SIN VIDEO"}</div>`;
      }
    },
    fechas: {
      title: "Fechas",
      help: "Las fechas que ya pasaron se muestran solas en “Shows anteriores”.",
      empty: { fecha: "", hora: "21:00", lugar: "", ciudad: "", entradas: "", estado: "" },
      sort: (a, b) => String(a.fecha).localeCompare(String(b.fecha)),
      fields: [
        { k: "fecha", label: "Fecha", type: "date" },
        { k: "hora", label: "Hora", type: "time" },
        { k: "lugar", label: "Lugar" },
        { k: "ciudad", label: "Ciudad / Barrio" },
        { k: "entradas", label: "Link de entradas", type: "url" },
        { k: "estado", label: "Etiqueta (ej: Agotado, Privado)" }
      ]
    },
    integrantes: {
      title: "Integrantes",
      help: "Cada integrante aparece como un pedal con un efecto real. La foto es opcional (ruta dentro del sitio, ej: assets/img/integrantes/juan.jpg).",
      empty: { nombre: "", rol: "", instrumento: "guitarra", fx: "overdrive", equipo: "", rango: "", funcion: "", foto: "", toma: "" },
      fields: [
        { k: "nombre", label: "Nombre" },
        { k: "rol", label: "Rol" },
        { k: "instrumento", label: "Instrumento (sonido)", type: "select", options: ["voz", "guitarra", "bajo", "bateria", "teclados", "otro"] },
        { k: "fx", label: "Efecto del pedal", type: "select", options: ["reverb", "overdrive", "chorus", "lowend", "thunder", "synth", "delay", "tremolo"] },
        { k: "equipo", label: "Equipo" },
        { k: "rango", label: "Rango de frecuencias" },
        { k: "foto", label: "Foto (ruta o URL)" },
        { k: "toma", label: "Toma real (ruta del audio)" },
        { k: "funcion", label: "Qué aporta a la mezcla", type: "textarea" }
      ]
    }
  };

  function inputFor(f, val, i) {
    const name = `${f.k}`;
    if (f.type === "check")
      return `<label class="check"><input type="checkbox" data-k="${name}" data-i="${i}" ${val ? "checked" : ""}> ${esc(f.label)}</label>`;
    let control;
    if (f.type === "select")
      control = `<select data-k="${name}" data-i="${i}">${f.options.map((o) => `<option ${o === val ? "selected" : ""}>${o}</option>`).join("")}</select>`;
    else if (f.type === "textarea") control = `<textarea rows="2" data-k="${name}" data-i="${i}">${esc(val)}</textarea>`;
    else control = `<input type="${f.type || "text"}" data-k="${name}" data-i="${i}" value="${esc(val)}">`;
    return `<label class="field${f.type === "textarea" ? " field--wide" : ""}"><span>${esc(f.label)}</span>${control}</label>`;
  }

  function renderList(key) {
    const def = LISTS[key];
    const items = (data[key] = data[key] || []);
    const panel = $("#panel");
    panel.innerHTML = `
      <p class="adm-help" style="margin-top:0">${esc(def.help)}</p>
      <div class="rows">
        ${items
          .map(
            (it, i) => `
          <div class="row">
            ${def.extra ? def.extra(it) : ""}
            ${def.fields.map((f) => inputFor(f, it[f.k], i)).join("")}
            <div class="row__tools">
              <button data-act="up" data-i="${i}" aria-label="Subir">▲</button>
              <button data-act="down" data-i="${i}" aria-label="Bajar">▼</button>
              <button data-act="del" data-i="${i}" class="del">Eliminar</button>
            </div>
          </div>`
          )
          .join("")}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap" class="add">
        <button class="btn btn--primary btn--small" data-act="add">+ Agregar</button>
        ${def.sort ? `<button class="btn btn--ghost btn--small" data-act="sort">Ordenar por fecha</button>` : ""}
      </div>`;

    $$("[data-k]", panel).forEach((el) => {
      const ev = el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(ev, () => {
        const it = items[+el.dataset.i];
        it[el.dataset.k] = el.type === "checkbox" ? el.checked : el.value;
        if (key === "videos" && el.dataset.k === "destacado" && el.checked) {
          items.forEach((o, j) => j !== +el.dataset.i && (o.destacado = false));
          renderList(key);
        }
        if (key === "videos" && el.dataset.k === "url") {
          const thumb = el.closest(".row").querySelector(".thumb");
          const id = ytId(el.value);
          thumb.style.backgroundImage = id ? `url(https://i.ytimg.com/vi/${id}/mqdefault.jpg)` : "";
          thumb.textContent = id ? "" : el.value ? "LINK NO VÁLIDO" : "SIN VIDEO";
        }
        save();
      });
    });
    $$("[data-act]", panel).forEach((b) =>
      b.addEventListener("click", () => {
        const i = +b.dataset.i;
        const act = b.dataset.act;
        if (act === "add") items.push(clone(def.empty));
        if (act === "del" && confirm("¿Eliminar este elemento?")) items.splice(i, 1);
        if (act === "up" && i > 0) [items[i - 1], items[i]] = [items[i], items[i - 1]];
        if (act === "down" && i < items.length - 1) [items[i + 1], items[i]] = [items[i], items[i + 1]];
        if (act === "sort") items.sort(def.sort);
        save();
        renderList(key);
        if (act === "add") {
          const rows = $$(".row", panel);
          rows[rows.length - 1].scrollIntoView({ behavior: "smooth", block: "center" });
          $("input, textarea", rows[rows.length - 1]).focus({ preventScroll: true });
        }
      })
    );
  }

  function renderContacto() {
    const c = (data.contacto = data.contacto || {});
    c.redes = c.redes || {};
    const fields = [
      ["whatsapp", "WhatsApp (con código de país, solo números: 5491112345678)"],
      ["email", "Email"],
      ["formspree", "Endpoint de Formspree (opcional)"]
    ];
    const redes = ["instagram", "youtube", "facebook", "tiktok", "spotify"];
    $("#panel").innerHTML = `
      <div class="row" style="background:none;border:0;padding:0">
        ${fields.map(([k, l]) => `<label class="field"><span>${l}</span><input data-c="${k}" value="${esc(c[k])}"></label>`).join("")}
        ${redes.map((k) => `<label class="field"><span>${k}</span><input type="url" data-r="${k}" value="${esc(c.redes[k])}"></label>`).join("")}
      </div>`;
    $$("[data-c]").forEach((el) => el.addEventListener("input", () => ((c[el.dataset.c] = el.value), save())));
    $$("[data-r]").forEach((el) => el.addEventListener("input", () => ((c.redes[el.dataset.r] = el.value), save())));
  }

  function renderJson() {
    $("#panel").innerHTML = `
      <p class="adm-help" style="margin-top:0">Edición completa (banda, concepto, cinta, formatos…). Tocá <b>Aplicar</b> para validar.</p>
      <textarea class="json" id="json" spellcheck="false">${esc(JSON.stringify(data, null, 2))}</textarea>
      <div class="add"><button class="btn btn--primary btn--small" id="applyJson">Aplicar</button></div>`;
    $("#applyJson").addEventListener("click", () => {
      try {
        data = JSON.parse($("#json").value);
        save("JSON aplicado ✔");
      } catch (e) {
        msg.textContent = "⚠ JSON inválido: " + e.message;
      }
    });
  }

  function show(tab) {
    $$(".tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
    if (LISTS[tab]) renderList(tab);
    else if (tab === "contacto") renderContacto();
    else renderJson();
  }
  $$(".tabs button").forEach((b) => b.addEventListener("click", () => show(b.dataset.tab)));
  show("videos");

  function buildFile() {
    return `/* =====================================================================
   REVERSIONES · CONTENIDO DEL SITIO
   Generado con admin.html el ${new Date().toLocaleString("es-AR")}.
   Podés seguir editándolo con el panel o a mano.
   ===================================================================== */

window.REVERSIONES = ${JSON.stringify(data, null, 2)};
`;
  }

  $("#download").addEventListener("click", () => {
    const blob = new Blob([buildFile()], { type: "text/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "content.js";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    msg.textContent = "✔ Descargado. Reemplazá assets/js/content.js con este archivo.";
  });
  $("#preview").addEventListener("click", () => {
    save();
    window.open("index.html?preview=1", "_blank");
  });
  $("#reset").addEventListener("click", () => {
    if (!confirm("¿Descartar el borrador y volver al contenido publicado?")) return;
    try {
      localStorage.removeItem(KEY);
    } catch (e) {}
    data = clone(window.REVERSIONES);
    show("videos");
    msg.textContent = "Borrador descartado.";
  });
})();
