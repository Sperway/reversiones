/* =====================================================================
   EVENTO ESPECIAL · HOMENAJE A FITO PÁEZ
   ---------------------------------------------------------------------
   Datos de la página /eventos/fito-paez/ y del banner de la portada.
   Lo que está vacío no se muestra (o aparece como "a confirmar").
   Después de la fecha, la página pasa sola a modo "recuerdo": oculta
   la venta de entradas y muestra fotos y videos del evento.
   ===================================================================== */

window.EVENTO_FITO = {
  presenta: "Reversiones presenta",
  titulo: "Fito Páez",
  bajada: "Un homenaje en vivo al rosarino que le puso piano al rock nacional",

  fecha: "2026-10-11", // AAAA-MM-DD
  hora: "", // ej: "21:30" · vacío = "Hora a confirmar"
  apertura: "", // apertura de puertas, ej: "20:30"
  lugar: "", // nombre de la sala cultural · vacío = "Sala a confirmar"
  direccion: "", // ej: "Calle 123"
  ciudad: "Firmat, Santa Fe",
  precio: "", // ej: "$ 10.000" · vacío no se muestra

  descripcion:
    "Una noche entera dedicada a las canciones de Fito Páez, pasadas por el filtro de Reversiones: arreglos nuevos, la banda completa en escena y un piano en el centro de todo. Un homenaje hecho en Firmat, a pocos kilómetros de la Rosario que lo vio nacer.",

  /* ---------- CÓMO VA A SER (cronograma) ----------
     hora: "" muestra "—". */
  cronograma: [
    { hora: "", titulo: "Apertura de puertas", texto: "Recibimiento, barra y música para ir entrando en clima." },
    { hora: "", titulo: "Reversiones toca Fito", texto: "El show central: las canciones de Fito reversionadas por la banda completa." },
    { hora: "", titulo: "Cierre", texto: "Los temas que no pueden faltar, para cantar todos juntos." }
  ],

  /* ---------- ENTRADAS: puntos de venta físicos ----------
     { nombre, direccion, ciudad, horario, telefono }
     La dirección se usa para el botón "Cómo llegar" (Google Maps). */
  puntosDeVenta: [],

  /* ---------- SPONSORS Y PARTNERS ----------
     { nombre, logo, url, tipo }
     logo: ruta a la imagen (ej: "assets/img/sponsors/marca.png") o "" para mostrar el nombre.
     tipo: texto corto opcional, ej: "Sponsor principal", "Partner", "Apoyo". */
  sponsors: [],

  /* ---------- DESPUÉS DEL EVENTO ----------
     Fotos y videos de cómo se vivió (se muestran cuando ya pasó la fecha). */
  recuerdo: {
    mensaje: "¡Gracias Firmat! Fue una noche inolvidable.",
    fotos: [], // rutas, ej: "assets/img/fito/foto-1.jpg"
    videos: [] // links de YouTube
  }
};
