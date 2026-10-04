# Reversiones · Web oficial

Sitio de la banda **Reversiones** de Firmat, Santa Fe, que hace **reversiones** de rock nacional argentino (no covers: reinterpretaciones con sonido propio). Estética 100% de ingeniería de audio: VU meters, analizador de espectro, osciloscopio, pedales, racks y consola de mezcla.

Es un sitio **estático** (HTML + CSS + JS, sin build): se puede publicar gratis en GitHub Pages, Netlify o Vercel.

## Secciones

| Canal | Sección | Qué hace |
|---|---|---|
| Hero | Inicio | Analizador de espectro + osciloscopio + VU meters animados. El botón **Probar sonido** reproduce un groove de rock sintetizado en vivo (Web Audio API) que mueve todas las animaciones. |
| CH1 | La banda | Descripción, tocadiscos con perilla de pitch y contadores LCD. |
| CH2 | Integrantes | Cada músico es un **pedal de efecto real** (Web Audio): al pisarlo suena su instrumento con el efecto y al volver a pisarlo, en bypass. Las 3 perillas controlan parámetros reales del efecto. Cada pedal muestra su ficha "modo audio": canal, rango de frecuencias y qué aporta a la mezcla. |
| CH3 | Videos | Monitor con el video destacado y lista de cassettes. Usa YouTube (modo privacidad mejorada). |
| CH4 | Fechas | Secuenciador con las próximas fechas, cuenta regresiva al próximo show y shows anteriores (se separan solos según la fecha). Sin fechas cargadas, muestra el secuenciador en *standby* "esperando señal". |
| CH5 | Concepto | "¿Qué es una reversión?" explicado como una cadena de señal de audio (IN → SPLIT → FX → OUT). |
| REC | Contratar | Formatos de show (racks) + formulario "booking console" que envía la consulta por **WhatsApp** o **email**. |

## Cómo actualizar el contenido

Todo el contenido está en **`assets/js/content.js`**: videos, fechas, integrantes, concepto, cinta animada, formatos y datos de contacto.

### Opción A — Panel (sin código)
1. Abrí `admin.html` (por ejemplo `https://tusitio.com/admin.html`).
2. Cargá videos (pegando el link de YouTube), fechas, integrantes y contacto.
3. Con **Vista previa** ves cómo queda.
4. Tocá **Descargar content.js** y subí ese archivo reemplazando `assets/js/content.js` (en GitHub: carpeta `assets/js` → *Add file* → *Upload files*).

### Opción B — Editar el archivo
Abrí `assets/js/content.js` y agregá un objeto a la lista correspondiente:

```js
videos: [
  { titulo: "En vivo en Firmat", url: "https://youtu.be/XXXXXXXXXXX", lugar: "Teatro X", destacado: true },
],
fechas: [
  { fecha: "2026-11-07", hora: "21:30", lugar: "La Usina Rock", ciudad: "Morón", entradas: "https://...", estado: "" },
],
```

### Efectos de los pedales
Campo `fx` de cada integrante: `reverb`, `overdrive`, `chorus`, `lowend`, `thunder` (bus de batería), `synth` (filtro resonante), `delay` o `tremolo`. El campo `instrumento` define qué frase suena a través del pedal.

### Logo
El logo RV está en `assets/img/logo-rv.svg` (vector) y como símbolo `#rv` dentro de `index.html`.

### Fotos de los integrantes
Subí las fotos a `assets/img/integrantes/` y poné la ruta en el campo `foto` (ej: `assets/img/integrantes/juan.jpg`). Si queda vacío se muestra el ícono del instrumento.

### Datos pendientes de completar
- Nombres reales, bios y equipos de los integrantes.
- Número de WhatsApp (`contacto.whatsapp`, formato `5493465123456`) y email.
- Links de redes sociales y de los videos de YouTube.
- Opcional: endpoint de [Formspree](https://formspree.io) en `contacto.formspree` para recibir el formulario directo por mail.

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
