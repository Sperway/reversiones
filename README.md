# Reversiones · Web oficial

Sitio de la banda **Reversiones** de Firmat, Santa Fe, que hace **reversiones** de rock nacional argentino (no covers: reinterpretaciones con sonido propio). Estética 100% de ingeniería de audio: VU meters, analizador de espectro, osciloscopio, pedales, racks y consola de mezcla.

Es un sitio **estático** (HTML + CSS + JS, sin build): se puede publicar gratis en GitHub Pages, Netlify o Vercel.

## Secciones

| Canal | Sección | Qué hace |
|---|---|---|
| Hero | Inicio | Analizador de espectro + osciloscopio + VU meters animados. El botón **Probar sonido** reproduce un groove de rock sintetizado en vivo (Web Audio API) que mueve todas las animaciones. |
| CH1 | La banda | Descripción, contadores LCD y **tocadiscos funcional**: el vinilo y START/STOP reproducen el tema de la banda, el disco gira solo mientras suena y el PITCH cambia la velocidad real ±8% (como un vinilo, también cambia el tono). |
| CH2 | Integrantes | Cada músico es un **pedal de efecto real** (Web Audio): al pisarlo suena su instrumento con el efecto y al volver a pisarlo, en bypass. Las 3 perillas controlan parámetros reales del efecto. Cada pedal muestra su ficha "modo audio": canal, rango de frecuencias y qué aporta a la mezcla. |
| CH3 | Videos | Monitor con el video destacado y lista de cassettes. Usa YouTube (modo privacidad mejorada). |
| CH4 | Fechas | Secuenciador con las próximas fechas, cuenta regresiva al próximo show y shows anteriores (se separan solos según la fecha). Sin fechas cargadas, muestra el secuenciador en *standby* "esperando señal". |
| CH5 | Concepto | "¿Qué es una reversión?" explicado como una cadena de señal de audio (IN → SPLIT → FX → OUT). |
| REC | Contratar | Formatos de show (racks), formulario "booking console" que envía la consulta por **WhatsApp** o **email**, y **EQ master real** de 5 bandas (60 Hz–12 kHz, ±12 dB) que ecualiza todo lo que suena en la web. |

## Cómo actualizar el contenido

Todo el contenido está en **`assets/js/content.js`**: videos, integrantes, tema, concepto, cinta animada, formatos y datos de contacto. Las **fechas** y los **videos nuevos** se cargan desde una planilla de Google (ver abajo).

### Fechas y videos desde Google Sheets (sin tocar código)
Una sola planilla con **dos pestañas**:

| Pestaña | Columnas (fila 1) |
|---|---|
| **Fechas** | `Fecha` (DD/MM/AAAA) · `Hora` (22:00) · `Lugar` · `Ciudad` · `Entradas` (link, opcional) · `Estado` (ej. "Agotado", opcional) |
| **Videos** | `Link` (de YouTube) · `Título` · `Lugar` · `Destacado` ("sí" en el que va grande) |

1. **Compartir → Acceso general → Cualquier persona con el enlace → Lector.**
2. Pegar el link de la planilla en `planilla` dentro de `content.js` (una sola vez).

Desde ahí la banda solo edita la planilla: la web la lee cada vez que alguien entra. Las fechas pasadas se mueven solas a "Shows anteriores". Los videos de la planilla aparecen primero (en el orden de la planilla) y después los videos por defecto de `content.js`. Si la planilla no se puede leer, se usan los datos de `content.js`.

### Editar el archivo
Abrí `assets/js/content.js` y agregá un objeto a la lista correspondiente:

```js
videos: [
  { titulo: "En vivo en Firmat", url: "https://youtu.be/XXXXXXXXXXX", lugar: "Teatro X", destacado: true },
],
fechas: [
  { fecha: "2026-11-07", hora: "21:30", lugar: "La Usina Rock", ciudad: "Morón", entradas: "https://...", estado: "" },
],
```

### Tema del inicio
El botón del inicio puede reproducir un **tema real de la banda**: subí el archivo a `assets/audio/` (mp3 recomendado) y completá en `content.js`:

```js
tema: { archivo: "assets/audio/tema.mp3", titulo: "Nombre del tema", detalle: "Reversión en vivo · 2026" },
```

El tema mueve el espectro, el osciloscopio, los VU meters y el logo, y aparece un display con el título y el tiempo. Si `archivo` queda vacío, suena el loop instrumental sintetizado.

### Efectos de los pedales
Campo `fx` de cada integrante: `reverb`, `overdrive`, `chorus`, `lowend`, `thunder` (bus de batería), `synth` (filtro resonante), `delay` o `tremolo`. El campo `instrumento` define qué frase suena a través del pedal.

### Tomas reales de los integrantes
Cada integrante puede tener una **toma real** (campo `toma`, ej: `"assets/audio/integrantes/voz.mp3"`). Con toma, el botón ▶ del pedal la reproduce en loop y el footswitch prende o apaga el efecto en vivo sin cortarla; las perillas cambian el efecto en tiempo real. Conviene que sea una toma **seca** (sin efectos) de 10–30 s, en MP3. Sin toma, el pedal usa una frase sintetizada.

### Logo
Vectorizado a partir del logo oficial de la banda, sin fondo:
- `assets/img/logo-rv.svg` (blanco) y `assets/img/logo-rv-negro.svg` (negro) — vectores, se ven nítidos en cualquier tamaño.
- `assets/img/logo-rv-blanco.png` y `assets/img/logo-rv-negro.png` — 1200 px, fondo transparente.
- En la web se usa como símbolo `#rv` dentro de cada HTML (se puede pintar de cualquier color con CSS).
- Favicon: `favicon.svg` (negro en pestañas claras, blanco en oscuras), `favicon-32.png` de respaldo y `apple-touch-icon.png` (iPhone, con fondo negro).

### Fotos de los integrantes
Subí las fotos a `assets/img/integrantes/` y poné la ruta en el campo `foto` (ej: `assets/img/integrantes/juan.jpg`). Si queda vacío se muestra el ícono del instrumento.

### Datos pendientes de completar
- Nombres reales, bios y equipos de los integrantes.
- Número de WhatsApp (`contacto.whatsapp`, formato `5493465123456`) y email.
- Links de redes sociales y de los videos de YouTube.
- Opcional: endpoint de [Formspree](https://formspree.io) en `contacto.formspree` para recibir el formulario directo por mail.

## Evento especial: homenaje a Fito Páez
Subpágina en **`/eventos/fito-paez/`** con estética propia (afiche de los 90, colores "tecknicolor", mariposas, polaroids y un piano tocable con mouse, dedo o teclado). La portada muestra un banner y un link en el menú hacia ella.

Todos los datos están en **`assets/js/evento-fito.js`**: fecha, hora, sala, precio, descripción, cronograma, puntos de venta físicos (con botón "Cómo llegar"), sponsors (logo, link y tipo; "Sponsor principal" se muestra más grande) y el bloque `recuerdo`. Los integrantes se toman de `content.js`.

**Invitados sorpresa (juego de raspadita):** cada invitado es una tarjeta con una pista; se raspa con el mouse o el dedo para descubrirlo (hay un botón alternativo "Revelar sin raspar"). Con `desbloquea: "AAAA-MM-DD"` la tarjeta queda bloqueada con cuenta regresiva hasta ese día. Nombre, rol y foto van **codificados** en `secreto` para que no se lean a simple vista (no es cifrado real: alguien con conocimientos técnicos podría decodificarlo). Para generar uno, en la consola del navegador en la página del evento: `codificarInvitado({ nombre, rol, foto })`. Lo descubierto se recuerda en cada navegador.

El evento también **aparece solo en la sección Fechas** de la portada, destacado y con el botón "Ver evento" (no hace falta cargarlo en la planilla; si se carga para el mismo día, se usa la versión destacada).

**Después del evento** la página cambia sola a modo recuerdo: oculta la venta de entradas, destapa a todos los invitados, muestra el mensaje de agradecimiento y las fotos y videos cargados en `recuerdo`, y el banner de la portada pasa a decir "Así se vivió".

## Ver localmente

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Publicar en GitHub Pages
*Settings → Pages → Build and deployment → Deploy from a branch →* elegir la rama `main` y la carpeta `/ (root)`.

## Notas técnicas
- Sin dependencias externas: fuentes alojadas en `assets/fonts` (Bebas Neue, Inter, Share Tech Mono — licencia SIL OFL).
- Todo el audio se sintetiza en el navegador (no hay archivos de audio); solo suena tras un clic del usuario.
- Respeta `prefers-reduced-motion` y es responsive (desde 360 px).
