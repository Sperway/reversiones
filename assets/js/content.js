/* =====================================================================
   REVERSIONES · CONTENIDO DEL SITIO
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que hace falta tocar para actualizar la web.
   - Videos:  agregá un objeto a "videos" con la URL de YouTube.
   - Fechas:  agregá un objeto a "fechas" (formato de fecha AAAA-MM-DD).
              Las fechas pasadas se mueven solas a "Shows anteriores".
   - Integrantes, concepto, formatos y contacto: más abajo.
   También podés usar /admin.html para generar este archivo sin
   escribir código.
   ===================================================================== */

window.REVERSIONES = {
  banda: {
    nombre: "Reversiones",
    bajada: "Reversiones de Rock Nacional",
    ciudad: "Firmat, Santa Fe, Argentina",
    descripcion:
      "Somos Reversiones, una banda de Firmat, Santa Fe. No hacemos covers: hacemos reversiones. Tomamos los clásicos del rock nacional, los desarmamos pista por pista y los volvemos a armar con nuestro sonido, para que los temas que todos cantan suenen como nunca los escuchaste. Fiestas, bares, eventos, casamientos y festivales.",
    stats: [
      { valor: 150, sufijo: "+", label: "Shows en vivo" },
      { valor: 80, sufijo: "+", label: "Temas reversionados" },
      { valor: 10, sufijo: "", label: "Años de ruta" },
      { valor: 6, sufijo: "", label: "Músicos en escena" }
    ]
  },

  contacto: {
    // Número con código de país, sin "+" ni espacios. Ej: 5491112345678
    whatsapp: "5493465000000",
    email: "contacto@reversiones.com.ar",
    // Opcional: endpoint de Formspree (https://formspree.io) para recibir el formulario por mail.
    // Si queda vacío, el formulario abre WhatsApp o el cliente de correo.
    formspree: "",
    redes: {
      instagram: "https://instagram.com/",
      youtube: "https://youtube.com/",
      facebook: "https://facebook.com/",
      tiktok: "https://tiktok.com/",
      spotify: ""
    }
  },

  /* ---------- INTEGRANTES ----------
     instrumento: voz | guitarra | bajo | bateria | teclados | otro
     foto: ruta a una imagen (ej: "assets/img/integrantes/juan.jpg") o "" para usar ilustración. */
  integrantes: [
    {
      nombre: "Nombre Apellido",
      rol: "Voz principal",
      instrumento: "voz",
      efecto: "REVERB",
      equipo: "Shure SM58 · In-ear Sennheiser",
      bio: "La voz que hace cantar a todo el lugar, de la primera estrofa al último estribillo.",
      foto: ""
    },
    {
      nombre: "Nombre Apellido",
      rol: "Guitarra líder",
      instrumento: "guitarra",
      efecto: "OVERDRIVE",
      equipo: "Stratocaster · Marshall JCM800",
      bio: "Riffs, solos y feedback controlado. El responsable del volumen en 11.",
      foto: ""
    },
    {
      nombre: "Nombre Apellido",
      rol: "Guitarra rítmica / Coros",
      instrumento: "guitarra",
      efecto: "CHORUS",
      equipo: "Telecaster · Fender Hot Rod",
      bio: "Los acordes que sostienen todo y las armonías que se te pegan.",
      foto: ""
    },
    {
      nombre: "Nombre Apellido",
      rol: "Bajo",
      instrumento: "bajo",
      efecto: "LOW END",
      equipo: "Jazz Bass · Ampeg SVT",
      bio: "Frecuencias graves que se sienten en el pecho antes que en los oídos.",
      foto: ""
    },
    {
      nombre: "Nombre Apellido",
      rol: "Batería",
      instrumento: "bateria",
      efecto: "THUNDER",
      equipo: "Pearl Export · Platos Zildjian",
      bio: "Metrónomo humano con alma de trueno. 4/4 y a la cancha.",
      foto: ""
    },
    {
      nombre: "Nombre Apellido",
      rol: "Teclados / Sintes",
      instrumento: "teclados",
      efecto: "SYNTH",
      equipo: "Nord Stage · Korg Minilogue",
      bio: "Pianos, órganos y sintes ochentosos: las texturas que le dan otro color a cada reversión.",
      foto: ""
    }
  ],

  /* ---------- VIDEOS ----------
     url: link de YouTube (watch, youtu.be o shorts). El primero marcado
     como destacado: true se muestra en grande. */
  videos: [
    { titulo: "En vivo · Reversiones", url: "", lugar: "Firmat, Santa Fe", destacado: true },
    { titulo: "Sesión en sala", url: "", lugar: "Ensayo abierto" },
    { titulo: "Fiesta privada", url: "", lugar: "Evento" },
    { titulo: "Show en bar", url: "", lugar: "Sur de Santa Fe" }
  ],

  /* ---------- FECHAS ----------
     fecha: "AAAA-MM-DD"  ·  hora: "21:30"  ·  entradas: link o "" */
  fechas: [
    // Ejemplo: { fecha: "2026-11-07", hora: "21:30", lugar: "Nombre del lugar", ciudad: "Firmat, Santa Fe", entradas: "", estado: "" }
  ],

  /* ---------- CONCEPTO: qué es una reversión ---------- */
  concepto: {
    lead: "No es un cover. Es una reversión: el mismo tema que conocés, pasado por nuestra cadena de señal.",
    pasos: [
      { codigo: "IN", titulo: "El clásico", texto: "Elegimos temas del rock nacional que son parte de la historia de todos." },
      { codigo: "SPLIT", titulo: "Lo desarmamos", texto: "Lo separamos pista por pista: voz, guitarras, bajo, batería y teclados." },
      { codigo: "FX", titulo: "Lo reversionamos", texto: "Cambiamos arreglos, grooves y climas. Le ponemos nuestro sonido." },
      { codigo: "OUT", titulo: "En vivo", texto: "Lo devolvemos al escenario para que lo cantes como nunca lo escuchaste." }
    ]
  },

  /* Palabras de la cinta que cruza la pantalla debajo del inicio */
  cinta: ["Rock nacional", "Reversiones", "En vivo", "Firmat · Santa Fe", "Fiestas", "Eventos", "Festivales", "Subí el volumen"],

  /* ---------- FORMATOS DE SHOW (para contratación) ---------- */
  formatos: [
    {
      nombre: "Acústico",
      codigo: "AC-01",
      duracion: "60 – 90 min",
      ideal: "Bares, cumpleaños, after office",
      incluye: ["3 músicos", "Sonido propio hasta 80 personas", "Reversiones en clave unplugged"]
    },
    {
      nombre: "Eléctrico Full Band",
      codigo: "FB-06",
      duracion: "2 sets de 60 min",
      ideal: "Fiestas, casamientos, eventos corporativos",
      incluye: ["6 músicos", "Backline completo", "Sonido e iluminación opcional", "Setlist a medida"],
      destacado: true
    },
    {
      nombre: "Festival / Escenario",
      codigo: "FS-XL",
      duracion: "Según grilla",
      ideal: "Festivales, municipios, clubes",
      incluye: ["Rider técnico profesional", "Plano de escenario", "Técnico de sonido propio"]
    }
  ]
};
