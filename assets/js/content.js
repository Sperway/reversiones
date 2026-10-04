/* =====================================================================
   REVERSIONES · CONTENIDO DEL SITIO
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que hace falta tocar para actualizar la web.
   - Videos:  agregá un objeto a "videos" con la URL de YouTube.
   - Fechas:  agregá un objeto a "fechas" (formato de fecha AAAA-MM-DD).
              Las fechas pasadas se mueven solas a "Shows anteriores".
   - Integrantes, repertorio y datos de contacto: más abajo.
   También podés usar /admin.html para generar este archivo sin
   escribir código.
   ===================================================================== */

window.REVERSIONES = {
  banda: {
    nombre: "Reversiones",
    bajada: "Covers de Rock Nacional Argentino",
    ciudad: "Buenos Aires, Argentina",
    descripcion:
      "Somos una banda de covers dedicada al rock nacional argentino. Desde Charly hasta Cerati, desde Los Redondos hasta Divididos: tocamos los himnos que todos cantan, con sonido de estudio y la energía de un estadio. Fiestas, bares, eventos corporativos, casamientos y festivales.",
    stats: [
      { valor: 150, sufijo: "+", label: "Shows en vivo" },
      { valor: 80, sufijo: "+", label: "Temas en repertorio" },
      { valor: 10, sufijo: "", label: "Años de ruta" },
      { valor: 6, sufijo: "", label: "Músicos en escena" }
    ]
  },

  contacto: {
    // Número con código de país, sin "+" ni espacios. Ej: 5491112345678
    whatsapp: "5491100000000",
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
      bio: "La voz que lleva al público de «Mil horas» a «Ji ji ji» sin respirar.",
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
      bio: "Del piano de «Rasguña las piedras» a los sintes ochentosos de Virus.",
      foto: ""
    }
  ],

  /* ---------- VIDEOS ----------
     url: link de YouTube (watch, youtu.be o shorts). El primero marcado
     como destacado: true se muestra en grande. */
  videos: [
    { titulo: "En vivo · Medley Soda Stereo", url: "", lugar: "Teatro de Flores", destacado: true },
    { titulo: "Crimen · Gustavo Cerati (cover)", url: "", lugar: "Sesión en estudio" },
    { titulo: "Ji ji ji · Patricio Rey (cover)", url: "", lugar: "Fiesta privada" },
    { titulo: "Spaghetti del rock · Divididos (cover)", url: "", lugar: "Bar Lucille" }
  ],

  /* ---------- FECHAS ----------
     fecha: "AAAA-MM-DD"  ·  hora: "21:30"  ·  entradas: link o "" */
  fechas: [
    { fecha: "2026-10-24", hora: "22:00", lugar: "Bar El Ruido", ciudad: "Palermo, CABA", entradas: "", estado: "" },
    { fecha: "2026-11-07", hora: "21:30", lugar: "La Usina Rock", ciudad: "Morón, Bs. As.", entradas: "", estado: "" },
    { fecha: "2026-11-21", hora: "23:00", lugar: "Festival Primavera Rock", ciudad: "La Plata, Bs. As.", entradas: "", estado: "" },
    { fecha: "2026-12-12", hora: "22:30", lugar: "Fiesta de Fin de Año", ciudad: "Evento privado", entradas: "", estado: "Privado" },
    { fecha: "2026-08-15", hora: "22:00", lugar: "Club Cultural Matienzo", ciudad: "Colegiales, CABA", entradas: "", estado: "" },
    { fecha: "2026-07-04", hora: "21:00", lugar: "Peña Rockera", ciudad: "Quilmes, Bs. As.", entradas: "", estado: "" }
  ],

  /* ---------- REPERTORIO ---------- */
  repertorio: [
    { artista: "Soda Stereo", temas: ["De música ligera", "Persiana americana", "En la ciudad de la furia", "Prófugos"] },
    { artista: "Charly García", temas: ["Demoliendo hoteles", "Los dinosaurios", "Rezo por vos", "Yendo de la cama al living"] },
    { artista: "Patricio Rey y sus Redonditos de Ricota", temas: ["Ji ji ji", "Un poco de amor francés", "Juguetes perdidos", "Vencedores vencidos"] },
    { artista: "Gustavo Cerati", temas: ["Crimen", "Puente", "Adiós", "Lago en el cielo"] },
    { artista: "Divididos", temas: ["Spaghetti del rock", "Paisano de Hurlingham", "El arriero", "Qué tal"] },
    { artista: "Los Fabulosos Cadillacs", temas: ["Matador", "Vasos vacíos", "Mal bicho"] },
    { artista: "Fito Páez", temas: ["Mariposa Tecknicolor", "11 y 6", "A rodar mi vida"] },
    { artista: "Virus", temas: ["Wadu wadu", "Una luna de miel en la mano", "Pronta entrega"] },
    { artista: "Los Abuelos de la Nada", temas: ["Mil horas", "Costumbres argentinas", "Así es el calor"] },
    { artista: "Andrés Calamaro", temas: ["Flaca", "Loco", "Crímenes perfectos"] },
    { artista: "Los Piojos", temas: ["Como Alí", "El farolito", "Babilonia"] },
    { artista: "La Renga", temas: ["El revelde", "Hablando de la libertad"] },
    { artista: "Luis Alberto Spinetta", temas: ["Muchacha (ojos de papel)", "Seguir viviendo sin tu amor"] },
    { artista: "Enanitos Verdes", temas: ["Lamento boliviano", "La muralla verde"] },
    { artista: "Babasónicos", temas: ["Irresponsables", "Putita"] },
    { artista: "Attaque 77", temas: ["Hacelo por mí", "Arrancacorazones"] }
  ],

  /* ---------- FORMATOS DE SHOW (para contratación) ---------- */
  formatos: [
    {
      nombre: "Acústico",
      codigo: "AC-01",
      duracion: "60 – 90 min",
      ideal: "Bares, cumpleaños, after office",
      incluye: ["3 músicos", "Sonido propio hasta 80 personas", "Repertorio unplugged"]
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
