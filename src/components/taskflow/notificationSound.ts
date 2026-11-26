/**
 * Sonido leve al llegar una notificación (25 Nov 2026).
 *
 * Dos notas suaves (tipo «ding-dong» corto, ~0,5 s) generadas con Web Audio: no hay archivo que cargar.
 * Volumen bajo, sin repetir más de una vez cada 2 segundos aunque lleguen varias juntas.
 * Cada persona lo puede apagar desde la campana; la preferencia se guarda en su navegador.
 */
const PREF_KEY = 'eco-notification-sound';
const MIN_GAP_MS = 2000;

let ctx: AudioContext | null = null;
let lastPlayed = 0;

export function isNotificationSoundOn(): boolean {
  try {
    return window.localStorage.getItem(PREF_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setNotificationSoundOn(on: boolean): void {
  try {
    window.localStorage.setItem(PREF_KEY, on ? 'on' : 'off');
  } catch {
    /* sin almacenamiento: queda solo para esta sesión */
  }
}

export function playNotificationSound(force = false): void {
  if (!force && !isNotificationSoundOn()) return;
  const now = Date.now();
  if (!force && now - lastPlayed < MIN_GAP_MS) return;
  lastPlayed = now;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    ctx = ctx || new AudioCtx();
    if (ctx.state === 'suspended') void ctx.resume();
    const t0 = ctx.currentTime;
    // Mi5 → La5, senoidal, ataque corto y caída suave
    ([[659.25, 0], [880, 0.14]] as const).forEach(([freq, delay]) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = t0 + delay;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.06, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + 0.42);
    });
  } catch {
    /* el navegador bloqueó el audio: la notificación igual se ve */
  }
}
