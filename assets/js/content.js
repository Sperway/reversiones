/* =====================================================================
   REVERSIONES · CONTENIDO DEL SITIO
   ---------------------------------------------------------------------
   Contenido de la web: textos, integrantes, videos, tema, contacto.
   Las FECHAS y los VIDEOS nuevos se cargan desde una planilla de Google (ver "planilla").
   ===================================================================== */

window.REVERSIONES = {
  banda: {
    nombre: "Reversiones",
    bajada: "Reversiones de Rock Nacional",
    ciudad: "Firmat, Santa Fe, Argentina",
    descripcion:
      "Somos Reversiones, una banda de Firmat, Santa Fe. No hacemos covers: hacemos reversiones. Tomamos los clásicos del rock nacional, los desarmamos pista por pista y los volvemos a armar con nuestro sonido, para que los temas que todos cantan suenen como nunca los escuchaste. Fiestas, bares, eventos, casamientos y festivales.",
    // Contadores de "La banda" (se reemplazan por la pestaña "Datos" de la planilla, si existe)
    stats: [
      { valor: 150, sufijo: "+", label: "Shows en vivo" },
      { valor: 80, sufijo: "+", label: "Temas reversionados" },
      { valor: 10, sufijo: "", label: "Años de ruta" },
      { valor: 5, sufijo: "", label: "Músicos en escena" }
    ]
  },

  /* ---------- TEMA DEL INICIO ----------
     Tema real que suena al tocar el botón del inicio. Subí el archivo a
     assets/audio/ (mp3 recomendado) y poné la ruta. Si queda vacío,
     suena un loop instrumental sintetizado. */
  tema: {
    archivo: "assets/audio/tema.mp3",
    titulo: "El amor después del amor",
    detalle: "Reversión de Fito Páez · Adelanto de Todo Fito"
  },

  contacto: {
    // Número con código de país, sin "+" ni espacios. Ej: 5491112345678
    whatsapp: "5493465000000",
    email: "contacto@reversiones.com.ar",
    // Opcional: endpoint de Formspree (https://formspree.io) para recibir el formulario por mail.
    // Si queda vacío, el formulario abre WhatsApp o el cliente de correo.
    formspree: "",
    redes: {
      instagram: "https://instagram.com/reversion.es",
      youtube: "https://youtube.com/",
      facebook: "https://facebook.com/",
      tiktok: "https://tiktok.com/",
      spotify: ""
    }
  },

  /* ---------- INTEGRANTES ----------
     instrumento: voz | guitarra | bajo | bateria | teclados | otro  (define el sonido de demo)
     fx: efecto REAL que aplica el pedal:
         reverb | overdrive | chorus | lowend | thunder | synth | delay | tremolo
     rango: frecuencias que ocupa en la mezcla · funcion: qué aporta al sonido de la banda
     toma: toma real del músico (ej: "assets/audio/integrantes/voz.mp3"). Mejor una toma
           SECA (sin efectos) de 10–30 s: el pedal le aplica su efecto en vivo. Vacío = sonido sintetizado.
     foto: ruta a una imagen (ej: "assets/img/integrantes/juan.jpg") o "" para usar ilustración. */
  integrantes: [
    {
      nombre: "Javier Speratti",
      rol: "Voz principal",
      instrumento: "voz",
      fx: "reverb",
      equipo: "",
      rango: "100 Hz – 1,2 kHz",
      funcion: "Lleva la melodía y la letra. Va al centro y al frente de la mezcla.",
      toma: "",
      foto: "assets/img/integrantes/javier-speratti.jpg"
    },
    {
      nombre: "Gustavo Mansilla",
      rol: "Guitarra líder",
      instrumento: "guitarra",
      fx: "overdrive",
      equipo: "Les Paul Standard",
      rango: "80 Hz – 5 kHz",
      funcion: "Riffs y solos en los medios-agudos: le da filo y corta la mezcla.",
      toma: "",
      foto: "assets/img/integrantes/gustavo-mansilla.jpg"
    },
    {
      nombre: "Fernando Fabro",
      rol: "Bajo",
      instrumento: "bajo",
      fx: "lowend",
      equipo: "Squier Jazz Bass",
      rango: "40 Hz – 400 Hz",
      funcion: "Une el bombo con la armonía: es el piso de graves que se siente en el pecho.",
      toma: "",
      foto: "assets/img/integrantes/fernando-fabro.jpg"
    },
    {
      nombre: "Sebastián Micelli",
      rol: "Batería",
      instrumento: "bateria",
      fx: "thunder",
      equipo: "",
      rango: "40 Hz – 16 kHz",
      funcion: "Marca el pulso: bombo en los graves, redoblante en los medios, platos arriba.",
      toma: "",
      foto: "assets/img/integrantes/sebastian-micelli.jpg"
    },
    {
      nombre: "Fernando Cugno",
      rol: "Teclados",
      instrumento: "teclados",
      fx: "synth",
      equipo: "Korg Kross",
      rango: "30 Hz – 8 kHz",
      funcion: "Pianos, pads y sintes: las texturas que cambian el color de cada reversión.",
      toma: "",
      foto: "assets/img/integrantes/fernando-cugno.jpg"
    }
  ],

  /* ---------- VIDEOS POR DEFECTO ----------
     Se muestran siempre, después de los que la banda cargue en la planilla.
     url: link de YouTube (watch, youtu.be, shorts o live). El marcado como
     destacado: true se muestra en grande (si la planilla no marca otro). */
  videos: [
    { titulo: "En vivo · Reversiones", url: "", lugar: "Firmat, Santa Fe", destacado: true },
    { titulo: "Sesión en sala", url: "", lugar: "Ensayo abierto" },
    { titulo: "Fiesta privada", url: "", lugar: "Evento" },
    { titulo: "Show en bar", url: "", lugar: "Sur de Santa Fe" }
  ],

  /* ---------- PLANILLA DE GOOGLE (fechas y videos) ----------
     Link de la planilla compartida como "Cualquier persona con el enlace: Lector".
     Pestaña "Fechas": Fecha | Hora | Lugar | Ciudad | Entradas | Estado  (fecha DD/MM/AAAA)
     Pestaña "Videos": Link | Título | Lugar | Destacado  (Destacado: "sí" en el que va grande)
     Pestaña "Datos": Dato | Número  (los contadores de "La banda"; ej: Shows en vivo | 150+)
     La web la lee cada vez que alguien entra. */
  planilla: "",

  /* ---------- FECHAS (respaldo) ----------
     Se usan solo si no hay planilla o si la planilla no se puede leer.
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
      codigo: "FB-05",
      duracion: "2 sets de 60 min",
      ideal: "Fiestas, casamientos, eventos corporativos",
      incluye: ["5 músicos", "Backline completo", "Sonido e iluminación opcional", "Setlist a medida"],
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
