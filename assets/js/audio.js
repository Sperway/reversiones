/* =====================================================================
   REVERSIONES · Motor de audio (Web Audio API, sin samples)
   Sintetiza batería, bajo, guitarra distorsionada, teclados y voz para
   la demo del hero y los pedales de los integrantes. Todo lo que suena
   pasa por un analizador que alimenta las animaciones.
   ===================================================================== */
(function () {
  "use strict";

  const A = {
    ctx: null,
    master: null,
    analyser: null,
    analyserL: null,
    analyserR: null,
    playing: false,
    bpm: 118,
    _step: 0,
    _nextTime: 0,
    _timer: null,
    _noise: null,
    _listeners: []
  };

  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  const EQ_BANDS = [
    ["lowshelf", 60],
    ["peaking", 250],
    ["peaking", 1000],
    ["peaking", 4000],
    ["highshelf", 12000]
  ];
  A.eqBands = EQ_BANDS.map((b) => b[1]);
  A._eqGains = EQ_BANDS.map(() => 0);

  // Ganancia de una banda del EQ master, en dB (-12 a +12)
  A.setEQ = function (i, db) {
    A._eqGains[i] = db;
    if (A.eq) A.eq[i].gain.setTargetAtTime(db, A.ctx.currentTime, 0.02);
  };

  /* Velocidad tipo tocadiscos (pitch): 1 = normal. Como en un vinilo,
     acelerar también sube el tono (no se preserva la afinación). */
  A.rate = 1;
  A.setRate = function (r) {
    A.rate = r;
    A.bpm = 118 * r;
    if (A._audioEl) A._audioEl.playbackRate = r;
  };

  A.init = function () {
    if (A.ctx) {
      if (A.ctx.state === "suspended") A.ctx.resume();
      return A.ctx;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    A.ctx = ctx;

    // Cadena master: bus -> compresor -> analizador -> salida
    const bus = ctx.createGain();
    bus.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 4;
    comp.attack.value = 0.005;
    comp.release.value = 0.15;
    const out = ctx.createGain();
    out.gain.value = 0.7;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.78;

    // Analizadores L/R para los VU meters
    const splitter = ctx.createChannelSplitter(2);
    const aL = ctx.createAnalyser();
    const aR = ctx.createAnalyser();
    aL.fftSize = aR.fftSize = 512;

    // EQ master de 5 bandas (el ecualizador de la sección Contratar)
    A.eq = EQ_BANDS.map(([type, freq], i) => {
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      if (type === "peaking") f.Q.value = 1.1;
      f.gain.value = A._eqGains[i];
      return f;
    });
    const eqOut = A.eq.reduce((prev, f) => (prev.connect(f), f), out);

    bus.connect(comp);
    comp.connect(out);
    eqOut.connect(analyser);
    analyser.connect(ctx.destination);
    eqOut.connect(splitter);
    splitter.connect(aL, 0);
    splitter.connect(aR, 1);

    A.master = bus;
    A._out = out;
    A.analyser = analyser;
    A.analyserL = aL;
    A.analyserR = aR;

    // Buffer de ruido blanco reutilizable
    const len = ctx.sampleRate;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    A._noise = buf;

    // Reverb corta (impulso sintético) para voz y teclados
    A.reverb = makeReverb(ctx, 1.8);
    const revGain = ctx.createGain();
    revGain.gain.value = 0.35;
    A.reverb.connect(revGain);
    revGain.connect(bus);

    return ctx;
  };

  function makeImpulse(ctx, seconds, curve = 2.5) {
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const imp = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const ch = imp.getChannelData(c);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, curve);
    }
    return imp;
  }

  function makeReverb(ctx, seconds) {
    const conv = ctx.createConvolver();
    conv.buffer = makeImpulse(ctx, seconds);
    return conv;
  }

  // Destino de los instrumentos: el master, o la entrada de un pedal
  const OUT = () => A._dest || A.master;

  function distCurve(amount) {
    const n = 2048;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
    }
    return curve;
  }

  function panner(ctx, pan) {
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      return p;
    }
    return ctx.createGain();
  }

  /* ---------------- Instrumentos ---------------- */

  function kick(t, vel = 1) {
    const ctx = A.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(1.1 * vel, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    o.connect(g).connect(OUT());
    o.start(t);
    o.stop(t + 0.45);
    // click del parche
    noiseHit(t, 0.012, 3500, "highpass", 0.25 * vel, 0);
  }

  function snare(t, vel = 1) {
    noiseHit(t, 0.2, 1800, "bandpass", 0.7 * vel, 0.05);
    const ctx = A.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(160, t + 0.08);
    g.gain.setValueAtTime(0.5 * vel, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g).connect(OUT());
    o.start(t);
    o.stop(t + 0.15);
  }

  function hat(t, open = false, vel = 1) {
    noiseHit(t, open ? 0.25 : 0.045, 8000, "highpass", 0.22 * vel, open ? 0.3 : 0.25);
  }

  function crash(t) {
    noiseHit(t, 1.4, 5000, "highpass", 0.3, -0.3);
  }

  function noiseHit(t, dur, freq, type, gain, pan) {
    const ctx = A.ctx;
    const src = ctx.createBufferSource();
    src.buffer = A._noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    const p = panner(ctx, pan);
    src.connect(f).connect(g).connect(p).connect(OUT());
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  function bass(t, note, dur) {
    const ctx = A.ctx;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = "sawtooth";
    o2.type = "sine";
    o.frequency.value = midi(note);
    o2.frequency.value = midi(note - 12);
    f.type = "lowpass";
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(220, t + dur);
    f.Q.value = 4;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.45, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(f);
    o2.connect(f);
    f.connect(g).connect(OUT());
    o.start(t);
    o2.start(t);
    o.stop(t + dur + 0.05);
    o2.stop(t + dur + 0.05);
  }

  // Power chord distorsionado: raíz + quinta + octava
  function guitar(t, root, dur, opts = {}) {
    const ctx = A.ctx;
    const pre = ctx.createGain();
    pre.gain.value = opts.drive || 3;
    const shaper = ctx.createWaveShaper();
    shaper.curve = distCurve(opts.amount || 60);
    shaper.oversample = "4x";
    const cab = ctx.createBiquadFilter(); // simulación de caja 4x12
    cab.type = "lowpass";
    cab.frequency.value = opts.tone || 3200;
    const mid = ctx.createBiquadFilter();
    mid.type = "peaking";
    mid.frequency.value = 800;
    mid.gain.value = 4;
    const g = ctx.createGain();
    const vol = opts.vol || 0.16;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.setValueAtTime(vol, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    const p = panner(ctx, opts.pan || 0);

    const notes = opts.notes || [root, root + 7, root + 12];
    const oscs = notes.map((n, i) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = midi(n);
      o.detune.value = (i - 1) * 6;
      o.connect(pre);
      o.start(t);
      o.stop(t + dur + 0.05);
      return o;
    });
    pre.connect(shaper).connect(mid).connect(cab).connect(g).connect(p).connect(OUT());
    return oscs;
  }

  function keys(t, notes, dur, vol = 0.12) {
    const ctx = A.ctx;
    notes.forEach((n, i) => {
      const o = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      o.type = "square";
      o2.type = "sawtooth";
      o.frequency.value = midi(n);
      o2.frequency.value = midi(n);
      o2.detune.value = 9;
      f.type = "lowpass";
      f.frequency.setValueAtTime(4000, t);
      f.frequency.exponentialRampToValueAtTime(900, t + dur);
      g.gain.setValueAtTime(0.0001, t + i * 0.015);
      g.gain.exponentialRampToValueAtTime(vol, t + i * 0.015 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(f);
      o2.connect(f);
      f.connect(g);
      g.connect(OUT());
      if (!A._dest) g.connect(A.reverb);
      o.start(t);
      o2.start(t);
      o.stop(t + dur + 0.05);
      o2.stop(t + dur + 0.05);
    });
  }

  // "Voz": oscilador con formantes de vocal "a" y vibrato
  function voice(t, notes, noteDur) {
    const ctx = A.ctx;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    const vib = ctx.createOscillator();
    const vibG = ctx.createGain();
    vib.frequency.value = 5.5;
    vibG.gain.value = 7;
    vib.connect(vibG).connect(o.detune);
    const g = ctx.createGain();
    const total = notes.length * noteDur;
    notes.forEach((n, i) => o.frequency.setTargetAtTime(midi(n), t + i * noteDur, 0.03));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.08);
    g.gain.setValueAtTime(0.35, t + total - 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, t + total);
    const formants = [
      [800, 1, 8],
      [1150, 0.5, 9],
      [2900, 0.25, 10]
    ];
    const sum = ctx.createGain();
    formants.forEach(([fq, amp, q]) => {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = fq;
      bp.Q.value = q;
      const ag = ctx.createGain();
      ag.gain.value = amp * 3;
      o.connect(bp).connect(ag).connect(sum);
    });
    sum.connect(g);
    g.connect(OUT());
    if (!A._dest) g.connect(A.reverb);
    o.start(t);
    vib.start(t);
    o.stop(t + total + 0.1);
    vib.stop(t + total + 0.1);
  }

  /* ---------------- Secuenciador de la demo ---------------- */
  // Progresión en Mi: E5 – C5 – G5 – D5 (4 compases de 16 semicorcheas)
  const PROG = [40, 36, 43, 38];
  const KICK = [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0];
  const SNARE = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1];
  const BASS = [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0];
  const GTR = [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0];

  function scheduleStep(step, t) {
    const sixteenth = 60 / A.bpm / 4;
    const s = step % 16;
    const bar = Math.floor(step / 16) % 4;
    const root = PROG[bar];

    if (step % 64 === 0) crash(t);
    if (KICK[s]) kick(t);
    if (SNARE[s]) snare(t, s === 15 ? 0.5 : 1);
    if (s % 2 === 0) hat(t, s === 14, s % 4 === 0 ? 1 : 0.6);
    if (BASS[s]) bass(t, root, sixteenth * 1.6);
    if (GTR[s]) guitar(t, root + 12, sixteenth * (GTR[s + 1] ? 0.9 : 1.8), { vol: 0.11, pan: s % 2 ? 0.35 : -0.35 });
    // Pad de teclado al inicio de cada compás
    if (s === 0) keys(t, [root + 24, root + 28 - (bar === 0 ? 1 : 0), root + 31], sixteenth * 14, 0.035);
  }

  function scheduler() {
    const ctx = A.ctx;
    const sixteenth = 60 / A.bpm / 4;
    while (A._nextTime < ctx.currentTime + 0.12) {
      scheduleStep(A._step, A._nextTime);
      A._emit("step", { step: A._step, time: A._nextTime });
      A._step++;
      A._nextTime += sixteenth;
    }
  }

  /* ---------------- Tema real de la banda ----------------
     Si hay un archivo configurado, el botón del inicio reproduce ese tema
     (en vez del loop sintetizado) y pasa por el mismo analizador que mueve
     el espectro, el osciloscopio y los VU meters. */
  A.track = null;
  A.trackMode = false;

  A.setTrack = function (url) {
    A.track = url || null;
  };

  function trackElement() {
    if (A._audioEl) return A._audioEl;
    const el = new Audio();
    el.src = A.track;
    el.preload = "metadata";
    el.preservesPitch = el.mozPreservesPitch = el.webkitPreservesPitch = false;
    el.playbackRate = A.rate;
    el.addEventListener("ended", () => {
      el.currentTime = 0;
      A.stop();
    });
    const src = A.ctx.createMediaElementSource(el);
    const g = A.ctx.createGain();
    g.gain.value = 1 / 0.7; // compensa la ganancia de salida: el tema suena a su volumen original
    src.connect(g).connect(A._out); // sin el compresor del bus: la mezcla del tema queda intacta
    A._audioEl = el;
    return el;
  }

  function startSynth() {
    A.trackMode = false;
    A._step = 0;
    A._nextTime = A.ctx.currentTime + 0.06;
    A._timer = setInterval(scheduler, 25);
  }

  A.start = function () {
    if (!A.init()) return false;
    if (A.playing) return true;
    A.playing = true;
    if (A.track) {
      A.trackMode = true;
      trackElement()
        .play()
        .catch(() => {
          // Si el archivo no carga, cae al loop sintetizado
          if (A.playing && A.trackMode) startSynth();
        });
    } else startSynth();
    A._emit("state", true);
    return true;
  };

  A.stop = function () {
    if (!A.playing) return;
    A.playing = false;
    clearInterval(A._timer);
    if (A._audioEl) A._audioEl.pause(); // queda en pausa: al volver a tocar sigue desde ahí
    A._emit("state", false);
  };

  A.toggle = function () {
    return A.playing ? (A.stop(), false) : A.start();
  };

  A.trackTime = function () {
    const el = A._audioEl;
    return el ? { current: el.currentTime, duration: el.duration || 0 } : null;
  };

  /* ---------------- Sonido de cada integrante ---------------- */
  // Guitarra limpia (sin distorsión) para que se escuche lo que agrega el pedal
  function cleanGuitar(t, notes, dur, vol = 0.09, strum = 0.018) {
    const ctx = A.ctx;
    notes.forEach((n, i) => {
      const st = t + i * strum;
      const o = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const f = ctx.createBiquadFilter();
      const g = ctx.createGain();
      o.type = "sawtooth";
      o2.type = "triangle";
      o.frequency.value = o2.frequency.value = midi(n);
      o2.detune.value = 4;
      f.type = "lowpass";
      f.frequency.setValueAtTime(5000, st);
      f.frequency.exponentialRampToValueAtTime(900, st + dur * 0.8);
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(vol, st + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, st + dur);
      o.connect(f);
      o2.connect(f);
      f.connect(g).connect(OUT());
      o.start(st);
      o2.start(st);
      o.stop(st + dur + 0.05);
      o2.stop(st + dur + 0.05);
    });
  }

  // Frases de ~2 segundos por instrumento. Con "dest" suenan a través de un pedal.
  A.playInstrument = function (type, dest) {
    if (!A.init()) return;
    A._dest = dest || null;
    const t = A.ctx.currentTime + 0.03;
    switch (type) {
      case "voz":
        voice(t, [64, 67, 69, 71, 69, 67, 64], 0.26);
        break;
      case "guitarra":
        if (dest) {
          // Acordes abiertos en Mi y un arpegio: limpio, para que el pedal haga su trabajo
          cleanGuitar(t, [40, 47, 52, 55], 0.5);
          cleanGuitar(t + 0.5, [43, 50, 55, 59], 0.3);
          cleanGuitar(t + 0.8, [45, 52, 57, 61], 0.6);
          [52, 56, 59, 64, 59, 56].forEach((n, i) => cleanGuitar(t + 1.3 + i * 0.12, [n], 0.5, 0.1, 0));
        } else {
          guitar(t, 52, 0.25, { vol: 0.2 });
          guitar(t + 0.3, 52, 0.12, { vol: 0.2 });
          guitar(t + 0.45, 55, 0.25, { vol: 0.2 });
          guitar(t + 0.75, 57, 0.7, { vol: 0.2 });
        }
        break;
      case "bajo":
        [28, 28, 40, 28, 31, 33, 35, 33, 31, 28].forEach((n, i) => bass(t + i * 0.16, n, 0.2));
        break;
      case "bateria":
        kick(t);
        hat(t + 0.13);
        snare(t + 0.26);
        hat(t + 0.39);
        kick(t + 0.52);
        kick(t + 0.65);
        snare(t + 0.78);
        [0, 1, 2, 3].forEach((i) => snare(t + 0.91 + i * 0.065, 0.5 + i * 0.15));
        crash(t + 1.17);
        kick(t + 1.17);
        break;
      case "teclados":
        keys(t, [48, 60, 64, 67, 71], 0.6, 0.07);
        keys(t + 0.6, [45, 57, 60, 64, 67], 0.6, 0.07);
        keys(t + 1.2, [41, 53, 57, 60, 64], 1.0, 0.07);
        break;
      default:
        keys(t, [64, 67, 71], 0.6, 0.1);
    }
    A._dest = null;
  };

  /* ---------------- Pedales de efecto reales ----------------
     Cada efecto define 3 perillas (valor 0–1) y cómo arma su cadena
     de nodos. La interfaz lee "label", "desc" y "knobs" sin crear audio. */
  const pct = (v) => Math.round(v * 100) + "%";
  const hz = (f) => (f >= 1000 ? (f / 1000).toFixed(1) + "k" : Math.round(f)) + "Hz";
  const db = (d) => (d > 0 ? "+" : "") + d.toFixed(0) + "dB";
  const ramp = (param, v) => param.setTargetAtTime(v, A.ctx.currentTime, 0.02);

  function lfo(ctx, freq, depth, target) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.value = depth;
    o.connect(g).connect(target);
    o.start();
    return { o, g };
  }

  const FX = {
    reverb: {
      label: "REVERB",
      desc: "Agrega el espacio de una sala: la señal rebota y se apaga de a poco.",
      knobs: [
        { n: "MIX", d: 55, f: pct },
        { n: "DECAY", d: 45, f: (v) => (0.4 + v * 5.6).toFixed(1) + "s" },
        { n: "TONE", d: 60, f: (v) => hz(1500 + v * 10500) }
      ],
      build(ctx) {
        const inp = ctx.createGain(), out = ctx.createGain(), dry = ctx.createGain(), wet = ctx.createGain();
        const conv = ctx.createConvolver(), lp = ctx.createBiquadFilter(), pre = ctx.createDelay(0.1);
        lp.type = "lowpass";
        pre.delayTime.value = 0.025; // pre-delay
        inp.connect(dry).connect(out);
        inp.connect(pre).connect(conv).connect(lp).connect(wet).connect(out);
        let timer;
        return {
          inp, out,
          set(i, v) {
            if (i === 0) {
              ramp(dry.gain, 1 - v * 0.55);
              ramp(wet.gain, v * 2.2);
            }
            if (i === 1) {
              const sec = 0.4 + v * 5.6;
              clearTimeout(timer);
              if (!conv.buffer) conv.buffer = makeImpulse(ctx, sec);
              else timer = setTimeout(() => (conv.buffer = makeImpulse(ctx, sec)), 80);
            }
            if (i === 2) ramp(lp.frequency, 1500 + v * 10500);
          }
        };
      }
    },
    overdrive: {
      label: "OVERDRIVE",
      desc: "Satura la señal como un amplificador al límite: más armónicos y más sustain.",
      knobs: [
        { n: "LEVEL", d: 60, f: pct },
        { n: "TONE", d: 55, f: (v) => hz(700 + v * 6300) },
        { n: "DRIVE", d: 70, f: (v) => db(20 * Math.log10(1 + v * v * 80)) }
      ],
      build(ctx) {
        const inp = ctx.createGain(), out = ctx.createGain(), hp = ctx.createBiquadFilter(), pre = ctx.createGain();
        const sh = ctx.createWaveShaper(), lp = ctx.createBiquadFilter(), mid = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 140; // recorta graves antes de saturar, como un Tube Screamer
        sh.curve = distCurve(12);
        sh.oversample = "4x";
        mid.type = "peaking";
        mid.frequency.value = 720;
        mid.gain.value = 5;
        lp.type = "lowpass";
        inp.connect(hp).connect(pre).connect(sh).connect(mid).connect(lp).connect(out);
        return {
          inp, out,
          set(i, v) {
            if (i === 0) ramp(out.gain, v * 0.11);
            if (i === 1) ramp(lp.frequency, 700 + v * 6300);
            if (i === 2) ramp(pre.gain, 1 + v * v * 80);
          }
        };
      }
    },
    chorus: {
      label: "CHORUS",
      desc: "Duplica la señal con un leve desafinado que se mueve: suena más ancha y en estéreo.",
      knobs: [
        { n: "LEVEL", d: 70, f: pct },
        { n: "RATE", d: 30, f: (v) => (0.1 + v * 4.9).toFixed(1) + "Hz" },
        { n: "DEPTH", d: 65, f: pct }
      ],
      build(ctx) {
        const inp = ctx.createGain(), out = ctx.createGain(), dry = ctx.createGain(), wet = ctx.createGain();
        dry.gain.value = 0.75;
        wet.gain.value = 0.85;
        inp.connect(dry).connect(out);
        const d1 = ctx.createDelay(0.1), d2 = ctx.createDelay(0.1);
        d1.delayTime.value = 0.018;
        d2.delayTime.value = 0.026;
        inp.connect(d1).connect(panner(ctx, -0.8)).connect(wet);
        inp.connect(d2).connect(panner(ctx, 0.8)).connect(wet);
        wet.connect(out);
        const mod = lfo(ctx, 0.8, 0.004, d1.delayTime);
        const inv = ctx.createGain();
        inv.gain.value = -1;
        mod.g.connect(inv).connect(d2.delayTime); // modulación invertida en el canal derecho
        return {
          inp, out,
          set(i, v) {
            if (i === 0) ramp(out.gain, 0.3 + v * 0.9);
            if (i === 1) ramp(mod.o.frequency, 0.1 + v * 4.9);
            if (i === 2) ramp(mod.g.gain, v * 0.007);
          }
        };
      }
    },
    lowend: {
      label: "LOW END",
      desc: "Realza y comprime los graves: el bajo queda parejo, gordo y con presencia.",
      knobs: [
        { n: "LEVEL", d: 60, f: pct },
        { n: "BOOST", d: 65, f: (v) => db(v * 15) },
        { n: "GRIT", d: 30, f: pct }
      ],
      build(ctx) {
        const inp = ctx.createGain(), out = ctx.createGain(), shelf = ctx.createBiquadFilter(), scoop = ctx.createBiquadFilter();
        const comp = ctx.createDynamicsCompressor(), pre = ctx.createGain(), sh = ctx.createWaveShaper(), post = ctx.createGain();
        shelf.type = "lowshelf";
        shelf.frequency.value = 110;
        scoop.type = "peaking";
        scoop.frequency.value = 450;
        scoop.Q.value = 1.2;
        scoop.gain.value = -5;
        comp.threshold.value = -28;
        comp.ratio.value = 6;
        comp.attack.value = 0.01;
        comp.release.value = 0.12;
        sh.curve = distCurve(6);
        inp.connect(shelf).connect(scoop).connect(comp).connect(pre).connect(sh).connect(post).connect(out);
        const st = { level: 0.6, grit: 0.3 };
        const upd = () => {
          ramp(pre.gain, 1 + st.grit * 10);
          ramp(post.gain, (st.level * 0.46) / (1 + st.grit * 3));
        };
        return {
          inp, out,
          set(i, v) {
            if (i === 0) (st.level = v), upd();
            if (i === 1) ramp(shelf.gain, v * 15);
            if (i === 2) (st.grit = v), upd();
          }
        };
      }
    },
    thunder: {
      label: "THUNDER",
      desc: "Compresión de bus de batería y sala grande: golpes con más punch y ambiente de estadio.",
      knobs: [
        { n: "LEVEL", d: 65, f: pct },
        { n: "PUNCH", d: 70, f: (v) => (2 + v * 10).toFixed(0) + ":1" },
        { n: "ROOM", d: 50, f: pct }
      ],
      build(ctx) {
        const inp = ctx.createGain(), out = ctx.createGain(), comp = ctx.createDynamicsCompressor(), makeup = ctx.createGain();
        const shelf = ctx.createBiquadFilter(), conv = ctx.createConvolver(), room = ctx.createGain();
        comp.release.value = 0.1;
        shelf.type = "lowshelf";
        shelf.frequency.value = 90;
        shelf.gain.value = 5;
        conv.buffer = makeImpulse(ctx, 1.6, 3);
        inp.connect(comp).connect(shelf).connect(makeup).connect(out);
        makeup.connect(conv).connect(room).connect(out);
        return {
          inp, out,
          set(i, v) {
            if (i === 0) ramp(out.gain, v * 0.6);
            if (i === 1) {
              ramp(comp.threshold, -8 - v * 30);
              ramp(comp.ratio, 2 + v * 10);
              comp.attack.value = 0.002 + (1 - v) * 0.02; // ataque lento deja pasar el transitorio
              ramp(makeup.gain, 1 + v * 1.8);
            }
            if (i === 2) ramp(room.gain, v * 1.1);
          }
        };
      }
    },
    synth: {
      label: "SYNTH",
      desc: "Filtro resonante que se abre y se cierra solo, con eco rítmico: textura de sintetizador.",
      knobs: [
        { n: "LEVEL", d: 60, f: pct },
        { n: "CUTOFF", d: 40, f: (v) => hz(200 + v * v * 4800) },
        { n: "RESO", d: 60, f: (v) => "Q" + (0.7 + v * 18).toFixed(1) }
      ],
      build(ctx) {
        const inp = ctx.createGain(), out = ctx.createGain(), f = ctx.createBiquadFilter();
        const dl = ctx.createDelay(1), fb = ctx.createGain(), echo = ctx.createGain();
        f.type = "lowpass";
        const sweep = lfo(ctx, 1.6, 600, f.frequency);
        dl.delayTime.value = (60 / 118 / 2) * 1.5; // corchea con punto
        fb.gain.value = 0.35;
        echo.gain.value = 0.35;
        inp.connect(f).connect(out);
        f.connect(dl).connect(fb).connect(dl);
        dl.connect(echo).connect(out);
        return {
          inp, out,
          set(i, v) {
            if (i === 0) ramp(out.gain, v * 0.8);
            if (i === 1) {
              const base = 200 + v * v * 4800;
              ramp(f.frequency, base);
              ramp(sweep.g.gain, base * 0.85);
            }
            if (i === 2) ramp(f.Q, 0.7 + v * 18);
          }
        };
      }
    },
    delay: {
      label: "DELAY",
      desc: "Repite la señal como un eco que se va apagando.",
      knobs: [
        { n: "MIX", d: 45, f: pct },
        { n: "TIME", d: 40, f: (v) => Math.round(80 + v * 720) + "ms" },
        { n: "REPEAT", d: 45, f: pct }
      ],
      build(ctx) {
        const inp = ctx.createGain(), out = ctx.createGain(), dl = ctx.createDelay(1.5), fb = ctx.createGain(), wet = ctx.createGain(), lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 3500; // repeticiones más oscuras, como un delay analógico
        inp.connect(out);
        inp.connect(dl).connect(lp).connect(fb).connect(dl);
        lp.connect(wet).connect(out);
        return {
          inp, out,
          set(i, v) {
            if (i === 0) ramp(wet.gain, v * 1.2);
            if (i === 1) ramp(dl.delayTime, 0.08 + v * 0.72);
            if (i === 2) ramp(fb.gain, v * 0.85);
          }
        };
      }
    },
    tremolo: {
      label: "TREMOLO",
      desc: "Sube y baja el volumen rítmicamente, como los amplificadores vintage.",
      knobs: [
        { n: "LEVEL", d: 70, f: pct },
        { n: "RATE", d: 45, f: (v) => (1 + v * 13).toFixed(1) + "Hz" },
        { n: "DEPTH", d: 75, f: pct }
      ],
      build(ctx) {
        const inp = ctx.createGain(), out = ctx.createGain(), amp = ctx.createGain();
        const mod = lfo(ctx, 6, 0.4, amp.gain);
        inp.connect(amp).connect(out);
        return {
          inp, out,
          set(i, v) {
            if (i === 0) ramp(out.gain, v * 1.4);
            if (i === 1) ramp(mod.o.frequency, 1 + v * 13);
            if (i === 2) {
              ramp(amp.gain, 1 - v / 2);
              ramp(mod.g.gain, v / 2);
            }
          }
        };
      }
    }
  };
  A.FX = FX;

  /* Crea un pedal: entrada -> [bypass | efecto] -> analizador -> master */
  A.makePedal = function (type, values) {
    if (!A.init()) return null;
    const ctx = A.ctx;
    const def = FX[type] || FX.reverb;
    const fx = def.build(ctx);
    const input = ctx.createGain(), dry = ctx.createGain(), wet = ctx.createGain(), post = ctx.createGain();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    input.connect(dry).connect(post);
    input.connect(fx.inp);
    fx.out.connect(wet).connect(post);
    post.connect(analyser).connect(A.master);
    dry.gain.value = 1;
    wet.gain.value = 0;
    def.knobs.forEach((k, i) => fx.set(i, values && values[i] != null ? values[i] : k.d / 100));
    const pedal = {
      on: false,
      set: (i, v) => fx.set(i, v),
      setOn(on) {
        pedal.on = on;
        ramp(dry.gain, on ? 0 : 1);
        ramp(wet.gain, on ? 1 : 0);
      },
      play: (instrument) => A.playInstrument(instrument, input),
      level: () => rms(analyser)
    };
    return pedal;
  };

  // Click sutil para interacciones (knobs, botones)
  A.tick = function () {
    if (!A.ctx || A.ctx.state !== "running") return;
    const t = A.ctx.currentTime;
    const o = A.ctx.createOscillator();
    const g = A.ctx.createGain();
    o.frequency.value = 2200;
    g.gain.setValueAtTime(0.04, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    o.connect(g).connect(A.ctx.destination);
    o.start(t);
    o.stop(t + 0.04);
  };

  /* ---------------- Lectura de niveles ---------------- */
  const tmp = new Float32Array(512);
  function rms(an) {
    if (!an) return 0;
    const n = Math.min(an.fftSize, tmp.length);
    an.getFloatTimeDomainData(tmp);
    let s = 0;
    for (let i = 0; i < n; i++) s += tmp[i] * tmp[i];
    return Math.sqrt(s / n);
  }
  A.levels = function () {
    return { l: rms(A.analyserL), r: rms(A.analyserR) };
  };

  A.on = function (fn) {
    A._listeners.push(fn);
  };
  A._emit = function (type, data) {
    A._listeners.forEach((fn) => fn(type, data));
  };

  window.RevAudio = A;
})();
