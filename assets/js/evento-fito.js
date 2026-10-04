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
  titulo: "Todo Fito", // nombre del evento
  homenaje: "Fito Páez", // a quién se homenajea
  bajada: "Homenaje a Fito Páez · Un recorrido en vivo por las canciones del rosarino que le puso piano al rock nacional",

  fecha: "2026-10-11", // AAAA-MM-DD
  hora: "", // hora del show · vacío = no se muestra (o "Hora a confirmar" si tampoco hay apertura)
  apertura: "20:30", // apertura de puertas
  lugar: "Sala Cultural Intendente Cardinali", // vacío = "Sala a confirmar"
  direccion: "", // ej: "Calle 123"
  ciudad: "Firmat, Santa Fe",
  precio: "$15.000 anticipada", // vacío no se muestra

  descripcion:
    "Una noche entera dedicada a las canciones de Fito Páez, pasadas por el filtro de Reversiones: arreglos nuevos, la banda completa en escena y un piano en el centro de todo. Un homenaje hecho en Firmat, a pocos kilómetros de la Rosario que lo vio nacer.",

  /* ---------- CÓMO VA A SER ----------
     setlistSecreto: true muestra el repertorio "a descubrir" (títulos tapados).
     Si se quiere publicar un cronograma, completar la lista y poner false.
     cronograma: [{ hora: "21:00", titulo: "...", texto: "..." }] */
  setlistSecreto: true,
  cronograma: [],

  /* ---------- ENTRADAS: puntos de venta físicos ----------
     { nombre, direccion, ciudad, horario, telefono }
     La dirección se usa para el botón "Cómo llegar" (Google Maps). */
  puntosDeVenta: [
    { nombre: "Glam Music", direccion: "Av. 25 de Mayo 1025", ciudad: "Firmat, Santa Fe", horario: "", telefono: "" },
    { nombre: "Minimarket 10", direccion: "Bv. Solís 983", ciudad: "Firmat, Santa Fe", horario: "", telefono: "" },
    { nombre: "Pierina", direccion: "Av. Santa Fe 1329", ciudad: "Firmat, Santa Fe", horario: "", telefono: "" }
  ],

  /* ---------- SPONSORS Y PARTNERS ----------
     { nombre, logo, url, tipo }
     logo: ruta a la imagen (ej: "assets/img/sponsors/marca.png") o "" para mostrar el nombre.
     tipo: texto corto opcional, ej: "Sponsor principal", "Partner", "Apoyo". */
  sponsors: [
    { nombre: "Óptica Ponce", logo: "", url: "", tipo: "" },
    { nombre: "Beltrán", logo: "", url: "", tipo: "" },
    { nombre: "La Unión", logo: "", url: "", tipo: "" },
    { nombre: "Pizza Club", logo: "", url: "", tipo: "" },
    { nombre: "Piper Drone Producciones", logo: "", url: "", tipo: "" },
    { nombre: "Emcofir", logo: "", url: "", tipo: "" },
    { nombre: "Milenio", logo: "", url: "", tipo: "" },
    { nombre: "Paulucci Propiedades", logo: "", url: "", tipo: "" },
    { nombre: "Complejo Atenas", logo: "", url: "", tipo: "" }
  ],

  /* ---------- INVITADOS ESPECIALES (juego de raspadita) ----------
     pista: se ve antes de raspar · desbloquea: "AAAA-MM-DD" (vacío = ya se puede raspar)
     secreto: nombre, rol y foto CODIFICADOS para que no se lean a simple vista.
     Para generar uno, en la consola del navegador (en la página del evento):
       codificarInvitado({ nombre: "Nombre", rol: "Voz", foto: "assets/img/invitados/x.jpg" })
     Después del evento se muestran todos destapados. */
  invitados: [
    { pista: "Seis cuerdas y mucha calle", desbloquea: "", secreto: "==QfiICI6Iyb09mZiACLiEmcyFGdpV3RiAiOiw2byJCIsISaulmcnVGbsVGUg8WajVHTiAiOiUmci12buJye" },
    { pista: "La armonía que se te queda en la cabeza", desbloquea: "2026-10-05", secreto: "=0nIiAiOi8GdvZmIgwiI69mdgkHIz9mcvNkIgojIs9mciACLikGZuFmcQBSa0FGViAiOiUmci12buJye" },
    { pista: "Una voz para cantar a los gritos", desbloquea: "2026-10-06", secreto: "=0nIiAiOi8GdvZmIgwiI69mViAiOiw2byJCIsISYylXZyJXZGBSZkVmRiAiOiUmci12buJye" },
    { pista: "Aire que se vuelve melodía", desbloquea: "2026-10-07", secreto: "9JiIgojIvR3bmJCIsIycvRnbllmViAiOiw2byJCIsISYsVWd65WZsFmVgQWa2FGRiAiOiUmci12buJye" },
    { pista: "Metales que hacen brillar el escenario", desbloquea: "2026-10-08", secreto: "=0nIiAiOi8GdvZmIgwiIz9GduVWaWJCI6ICbvJnIgwiIzl6w0J3bDBSeu9GViAiOiUmci12buJye" },
    { pista: "El soplo que completa la sección", desbloquea: "2026-10-09", secreto: "==QfiICI6Iyb09mZiACLiM3b05WZpZlIgojIs9mciACLikmbpJnYtVGd0V2Ug8WasVnSiAiOiUmci12buJye" },
    { pista: "La última voz que se suma a la noche", desbloquea: "2026-10-10", secreto: "9JiIgojIvR3bmJCIsIievZlIgojIs9mciACLi8mc1FGbhBFIlxWQiAiOiUmci12buJye" }
  ],

  /* ---------- DESPUÉS DEL EVENTO ----------
     Fotos y videos de cómo se vivió (se muestran cuando ya pasó la fecha). */
  recuerdo: {
    mensaje: "¡Gracias Firmat! Fue una noche inolvidable.",
    fotos: [], // rutas, ej: "assets/img/fito/foto-1.jpg"
    videos: [] // links de YouTube
  }
};
