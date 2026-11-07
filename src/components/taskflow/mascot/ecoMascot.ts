import { useEffect, useState } from 'react';
import ecoThumbsUp from '../../../assets/images/eco/eco-thumbs-up.webp';
import ecoCelebrating from '../../../assets/images/eco/eco-celebrating.webp';
import ecoSurprised from '../../../assets/images/eco/eco-surprised.webp';
import ecoWorried from '../../../assets/images/eco/eco-worried.webp';
import ecoSad from '../../../assets/images/eco/eco-sad.webp';
import ecoThinking from '../../../assets/images/eco/eco-thinking.webp';
import ecoFocus from '../../../assets/images/eco/eco-focus.webp';
import ecoCoffee from '../../../assets/images/eco/eco-coffee.webp';
import ecoChristmas from '../../../assets/images/eco/eco-christmas.webp';

/**
 * Personaje ECO: una imagen por emoción.
 * La emoción la decide buckyEngine según el día de la persona; la apariencia (temporada)
 * la configura system_admin para toda la organización.
 */
export type EcoEmotion =
  | 'ok'          // pulgar arriba: todo en orden (estado base)
  | 'celebrating' // día completo, tarea terminada
  | 'surprised'   // algo requiere atención ya (desvío de horas, revisión urgente)
  | 'worried'     // carga alta o tareas vencidas propias
  | 'sad'         // solo transitorio (al apagarla, despedidas); nunca como castigo
  | 'thinking'    // sin nada agendado hoy: «¿qué adelantamos?»
  | 'focus'       // cronómetro corriendo
  | 'coffee';     // pausa activa / descanso sugerido

export const ECO_EMOTION_IMAGES: Record<EcoEmotion, string> = {
  ok: ecoThumbsUp,
  celebrating: ecoCelebrating,
  surprised: ecoSurprised,
  worried: ecoWorried,
  sad: ecoSad,
  thinking: ecoThinking,
  focus: ecoFocus,
  coffee: ecoCoffee
};

export const ECO_CHRISTMAS_IMAGE = ecoChristmas;

export type MascotSkin = 'christmas' | 'standard';

export const MASCOT_SKIN_LABEL: Record<MascotSkin, string> = {
  christmas: 'Navidad',
  standard: 'Estándar (buzo morado)'
};

/**
 * Con la apariencia de temporada, los estados tranquilos (todo en orden, saludo, sin agenda)
 * usan el personaje de temporada. Las emociones que piden atención (sorpresa, preocupación,
 * tristeza, celebración, foco, café) conservan su imagen para que se sigan entendiendo.
 */
const SEASONAL_EMOTIONS: EcoEmotion[] = ['ok', 'thinking'];
export function mascotImage(emotion: EcoEmotion, skin: MascotSkin): string {
  if (skin === 'christmas' && SEASONAL_EMOTIONS.includes(emotion)) return ECO_CHRISTMAS_IMAGE;
  return ECO_EMOTION_IMAGES[emotion];
}

// ── Configuración de la organización (prototipo: navegador; producción: backend) ──
const SKIN_KEY = 'eco_mascot_skin';
const SNOW_KEY = 'eco_snow_off';
const EVENT = 'eco:mascot-skin';
export const DEFAULT_MASCOT_SKIN: MascotSkin = 'christmas';

const readSkin = (): MascotSkin => {
  try {
    const v = localStorage.getItem(SKIN_KEY);
    return v === 'standard' || v === 'christmas' ? v : DEFAULT_MASCOT_SKIN;
  } catch {
    return DEFAULT_MASCOT_SKIN;
  }
};

/** Solo system_admin debe llamar esto (la UI lo restringe; en producción, el backend). */
export function setMascotSkin(skin: MascotSkin) {
  try {
    localStorage.setItem(SKIN_KEY, skin);
  } catch {
    /* sin almacenamiento */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function setSnowEnabled(on: boolean) {
  try {
    localStorage.setItem(SNOW_KEY, String(!on));
  } catch {
    /* sin almacenamiento */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

const readSnow = () => {
  try {
    return localStorage.getItem(SNOW_KEY) !== 'true';
  } catch {
    return true;
  }
};

/** Apariencia vigente + preferencia personal de nieve. */
export function useMascotSkin(): { skin: MascotSkin; snow: boolean } {
  const [state, setState] = useState(() => ({ skin: readSkin(), snow: readSnow() }));
  useEffect(() => {
    const h = () => setState({ skin: readSkin(), snow: readSnow() });
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, []);
  return state;
}
