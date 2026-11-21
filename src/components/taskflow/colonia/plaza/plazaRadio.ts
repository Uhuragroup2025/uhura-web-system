/**
 * ============================================================================
 * RADIO DE LA PLAZA · LO-FI GENERATIVO (WEB AUDIO) — PROTOTIPO
 * ============================================================================
 * Música original generada en el navegador: no usa archivos ni licencias.
 * Acordes suaves, piano eléctrico, batería con swing y crujido de vinilo.
 * En producción se puede reemplazar por una playlist con licencia.
 */

type Chord = number[]; // notas MIDI

const PROGRESSIONS: Chord[][] = [
  [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], // Fmaj7 Em7 Dm7 Cmaj7
  [[50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [57, 60, 64, 67]], // Dm7 G7 Cmaj7 Am7
  [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]  // Am7 Fmaj7 Cmaj7 G7
];

const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

class PlazaRadio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private noise: AudioBuffer | null = null;
  private crackle: AudioBufferSourceNode | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private progIdx = 0;
  private bpm = 76;
  private volume = 0.55;
  private freq = new Uint8Array(32);
  playing = false;

  private ensure() {
    if (this.ctx) return this.ctx;
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new C();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 3800;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.freq = new Uint8Array(this.analyser.frequencyBinCount);
    this.filter.connect(this.master);
    this.master.connect(this.analyser);
    this.analyser.connect(ctx.destination);
    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  start() {
    const ctx = this.ensure();
    if (ctx.state === 'suspended') void ctx.resume();
    if (this.playing) return;
    this.playing = true;
    this.step = 0;
    this.progIdx = Math.floor(Math.random() * PROGRESSIONS.length);
    this.nextTime = ctx.currentTime + 0.1;
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setTargetAtTime(this.volume, ctx.currentTime, 0.6);
    this.startCrackle();
    this.timer = window.setInterval(() => this.schedule(), 25);
  }

  stop() {
    if (!this.ctx || !this.playing) return;
    this.playing = false;
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    this.master!.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
    const c = this.crackle;
    this.crackle = null;
    window.setTimeout(() => { try { c?.stop(); } catch { /* ya detenido */ } }, 1200);
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.ctx && this.master && this.playing) this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
  }

  getVolume() { return this.volume; }

  /** Nivel por banda (0..1) para animar el escenario y el ecualizador. */
  levels(bands = 8): number[] {
    if (!this.analyser || !this.playing) return Array(bands).fill(0);
    this.analyser.getByteFrequencyData(this.freq);
    const per = Math.floor(this.freq.length / bands) || 1;
    return Array.from({ length: bands }, (_, b) => {
      let s = 0;
      for (let i = 0; i < per; i++) s += this.freq[b * per + i] || 0;
      return Math.min(1, s / per / 200);
    });
  }

  private startCrackle() {
    const ctx = this.ctx!;
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.6 : (Math.random() * 2 - 1) * 0.012;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const g = ctx.createGain();
    g.gain.value = 0.35;
    src.connect(g).connect(this.master!);
    src.start();
    this.crackle = src;
  }

  private schedule() {
    const ctx = this.ctx!;
    const sixteenth = 60 / this.bpm / 4;
    while (this.nextTime < ctx.currentTime + 0.15) {
      const swing = this.step % 2 === 1 ? sixteenth * 0.18 : 0;
      this.playStep(this.step, this.nextTime + swing);
      this.nextTime += sixteenth;
      this.step = (this.step + 1) % 64; // 4 compases de 16 semicorcheas
      if (this.step === 0 && Math.random() < 0.35) this.progIdx = (this.progIdx + 1) % PROGRESSIONS.length;
    }
  }

  private playStep(step: number, t: number) {
    const bar = Math.floor(step / 16);
    const pos = step % 16;
    const chord = PROGRESSIONS[this.progIdx][bar];
    if (pos === 0) {
      this.pad(chord, t, (60 / this.bpm) * 4);
      this.bass(chord[0] - 12, t, 0.9);
    }
    if (pos === 10 && Math.random() < 0.6) this.bass(chord[0] - 12 + (Math.random() < 0.5 ? 7 : 12), t, 0.4);
    // Batería
    if (pos === 0 || pos === 7 || (pos === 10 && Math.random() < 0.5)) this.kick(t);
    if (pos === 4 || pos === 12) this.snare(t);
    if (pos % 2 === 0) this.hat(t, pos % 4 === 0 ? 0.09 : 0.05);
    // Piano eléctrico: frases sueltas sobre el acorde
    if ((pos === 2 || pos === 6 || pos === 9 || pos === 14) && Math.random() < 0.55) {
      const n = chord[Math.floor(Math.random() * chord.length)] + 12 + (Math.random() < 0.25 ? 12 : 0);
      this.keys(n, t);
    }
  }

  private pad(chord: Chord, t: number, dur: number) {
    const ctx = this.ctx!;
    chord.forEach((n, i) => {
      [-6, 6].forEach((det) => {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = midiToHz(n);
        o.detune.value = det + i;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.022, t + 0.4);
        g.gain.setTargetAtTime(0, t + dur - 0.3, 0.25);
        o.connect(g).connect(this.filter!);
        o.start(t);
        o.stop(t + dur + 1);
      });
    });
  }

  private keys(n: number, t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = midiToHz(n);
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = midiToHz(n) * 2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.07, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    o.connect(g);
    o2.connect(g2).connect(g);
    g.connect(this.filter!);
    o.start(t); o2.start(t);
    o.stop(t + 1.5); o2.stop(t + 1.5);
  }

  private bass(n: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = midiToHz(n);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.02);
    g.gain.setTargetAtTime(0, t + dur * 0.7, 0.12);
    o.connect(g).connect(this.master!);
    o.start(t);
    o.stop(t + dur + 0.5);
  }

  private kick(t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.32, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g).connect(this.master!);
    o.start(t);
    o.stop(t + 0.32);
  }

  private noiseHit(t: number, type: BiquadFilterType, freq: number, gain: number, dur: number) {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f).connect(g).connect(this.master!);
    s.start(t, Math.random());
    s.stop(t + dur + 0.02);
  }

  private snare(t: number) { this.noiseHit(t, 'bandpass', 1800, 0.13, 0.18); }
  private hat(t: number, gain: number) { this.noiseHit(t, 'highpass', 7000, gain, 0.04); }
}

export const plazaRadio = new PlazaRadio();
