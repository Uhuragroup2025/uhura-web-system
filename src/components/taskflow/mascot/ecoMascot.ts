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
import ecoXmasCoffee from '../../../assets/images/eco/eco-xmas-coffee.webp';
import ecoXmasHello from '../../../assets/images/eco/eco-xmas-hello.webp';
import ecoXmasCheer from '../../../assets/images/eco/eco-xmas-cheer.webp';
import ecoXmasWater from '../../../assets/images/eco/eco-xmas-water.webp';

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
 * Con la apariencia de Navidad, ECO usa SOLO imágenes navideñas: nunca se cruza con el buzo
 * morado. Cada emoción se lleva a la pose navideña más cercana; las que todavía no tienen
 * versión navideña (sorprendido, preocupado, triste, en foco) usan la pose navideña base y el
 * mensaje del globo explica el motivo.
 */
const CHRISTMAS_IMAGES: Record<EcoEmotion, string> = {
  ok: ecoChristmas,
  thinking: ecoXmasHello,
  celebrating: ecoXmasCheer,
  coffee: ecoXmasCoffee,
  focus: ecoChristmas,
  surprised: ecoChristmas,
  worried: ecoChristmas,
  sad: ecoChristmas
};
export function mascotImage(emotion: EcoEmotion, skin: MascotSkin): string {
  return skin === 'christmas' ? CHRISTMAS_IMAGES[emotion] : ECO_EMOTION_IMAGES[emotion];
}

/** Imagen de ECO para una emoción con la apariencia vigente de la organización. */
export function useMascotImage(emotion: EcoEmotion): string {
  const { skin } = useMascotSkin();
  return mascotImage(emotion, skin);
}

// ── Moods de ambiente: rotan a lo largo del día cuando ECO está tranquilo ──
/**
 * Pequeñas sorpresas mientras la persona trabaja: ECO cambia de pose unos segundos y, a veces,
 * dice algo cercano. Solo aparecen en reposo (sin avisos, sin cronómetro, sin ventanas abiertas),
 * cada uno en un momento aleatorio distinto para cada persona, y luego vuelve a su pose normal.
 * No necesitan backend: son imágenes y frases del frontend.
 */
export type EcoAmbientMood = 'coffee' | 'hello' | 'cheer' | 'water';

export interface EcoAmbientMoodDef {
  id: EcoAmbientMood;
  /** Imagen por apariencia; si una apariencia no tiene imagen, ese mood no sale con ella. */
  image: Partial<Record<MascotSkin, string>>;
  /** Frases posibles; vacío = solo cambia de pose, sin decir nada. */
  lines: string[];
}

export const ECO_AMBIENT_MOODS: EcoAmbientMoodDef[] = [
  {
    id: 'coffee',
    image: { christmas: ecoXmasCoffee, standard: ecoCoffee },
    lines: [
      'Uff… un cafecito no caería nada mal ☕',
      '¿Cafecito y seguimos? Este castor ya va por el segundo ☕',
      'Modo cafecito activado. Tú también te mereces uno ☕'
    ]
  },
  {
    id: 'hello',
    image: { christmas: ecoXmasHello },
    lines: []
  },
  {
    id: 'cheer',
    image: { christmas: ecoXmasCheer, standard: ecoCelebrating },
    lines: [
      '¡Eres un crack! Lo que estás haciendo hoy suma 💪',
      'Psst… vas muy bien. ¡Sigue así, crack! 🎁',
      'Ese ritmo tuyo merece regalo 🎁 ¡Vamos con toda!',
      'No te lo digo seguido, pero qué bien trabajas ✨'
    ]
  },
  {
    id: 'water',
    image: { christmas: ecoXmasWater },
    lines: [
      'Recuerda tomar agua 💧 tu cabeza te lo agradece',
      '¡Hidrátate! Un vaso de agua y seguimos 💧',
      'Glu, glu… ¿y tú ya tomaste agua hoy? 💧'
    ]
  }
];

export function ambientMoodsFor(skin: MascotSkin): EcoAmbientMoodDef[] {
  return ECO_AMBIENT_MOODS.filter((m) => Boolean(m.image[skin]));
}

// ── Configuración de la organización (prototipo: navegador; producción: backend) ──
const SKIN_KEY = 'eco_mascot_skin';
const SNOW_KEY = 'eco_snow_off';
const EVENT = 'eco:mascot-skin';

/**
 * Temporada: noviembre y diciembre = Navidad; el resto del año = estándar (buzo morado).
 * Si system_admin cambia la apariencia, el cambio vale solo para la temporada en curso:
 * al empezar la siguiente (1 de noviembre o 1 de enero) vuelve el valor por defecto.
 */
export const isChristmasSeason = (d: Date = new Date()) => d.getMonth() >= 10;
export const seasonalDefaultSkin = (d: Date = new Date()): MascotSkin => (isChristmasSeason(d) ? 'christmas' : 'standard');
const seasonKey = (d: Date = new Date()) => `${isChristmasSeason(d) ? 'navidad' : 'regular'}-${d.getFullYear()}`;
/** @deprecated se conserva por compatibilidad: hoy el valor por defecto depende de la fecha. */
export const DEFAULT_MASCOT_SKIN: MascotSkin = seasonalDefaultSkin();

const readSkin = (): MascotSkin => {
  try {
    const raw = localStorage.getItem(SKIN_KEY);
    if (raw && raw.startsWith('{')) {
      const v = JSON.parse(raw) as { skin?: MascotSkin; season?: string };
      if ((v.skin === 'christmas' || v.skin === 'standard') && v.season === seasonKey()) return v.skin;
    }
  } catch {
    /* sin almacenamiento */
  }
  return seasonalDefaultSkin();
};

/** Solo system_admin debe llamar esto (la UI lo restringe; en producción, el backend). */
export function setMascotSkin(skin: MascotSkin) {
  try {
    localStorage.setItem(SKIN_KEY, JSON.stringify({ skin, season: seasonKey() }));
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
