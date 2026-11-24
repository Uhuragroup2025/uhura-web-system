/**
 * ============================================================================
 * EL GRAN QUIZ DE LA PLAZA (ECO BY UHURA) — PROTOTIPO
 * ============================================================================
 * Escalera de 10 preguntas que suben de nivel. Mezcla preguntas sobre el
 * equipo (ciudades, gustos, mascotas, cargos y cumpleaños, tomadas de las
 * fichas de La Colonia) con preguntas de marketing, creatividad y digital.
 *
 * Reglas:
 * - 20 segundos por pregunta. Puntos = nivel × 10 + segundos que sobran.
 * - Si fallas o se acaba el tiempo, el juego termina y te quedas con lo sumado.
 * - Dos ayudas, una vez cada una: «Pista de ECO» (quita dos opciones) y
 *   «Cambiar pregunta».
 * Solo del prototipo: el banco de preguntas generales vive en el código; en
 * producción lo puede administrar Dirección desde ECO.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UserItem } from '../../types';
import { mascotImage, useMascotSkin } from '../../mascot/ecoMascot';
import { playTapSound, playScoreChime } from '../coloniaAudio';
import { Lightbulb, Shuffle, Trophy } from 'lucide-react';

interface Question {
  text: string;
  options: string[];
  answer: number; // índice dentro de options
  tag: string;
}

type Level = 'facil' | 'medio' | 'dificil';
type Bank = { q: string; ok: string; bad: [string, string, string]; level: Level; tag: string }[];

// Banco general (marketing, creatividad y digital)
const GENERAL: Bank = [
  { level: 'facil', tag: 'Diseño', q: '¿Qué significan las siglas RGB?', ok: 'Rojo, verde y azul', bad: ['Ritmo, gráfica y brillo', 'Rojo, gris y blanco', 'Resolución, grano y brillo'] },
  { level: 'facil', tag: 'Diseño', q: '¿Qué formato de imagen conserva un fondo transparente?', ok: 'PNG', bad: ['JPG', 'BMP sin canal alfa', 'PDF escaneado'] },
  { level: 'facil', tag: 'Social', q: '¿Qué es un «engagement» en redes?', ok: 'La interacción de la audiencia con el contenido', bad: ['El número de seguidores', 'El presupuesto de la pauta', 'La frecuencia de publicación'] },
  { level: 'facil', tag: 'Marketing', q: '¿Qué es un «call to action»?', ok: 'Una invitación clara a hacer algo', bad: ['Una llamada al cliente', 'El logo animado', 'Un tipo de anuncio de radio'] },
  { level: 'facil', tag: 'Digital', q: '¿Para qué sirve un favicon?', ok: 'Es el ícono de la pestaña del navegador', bad: ['Para medir visitas', 'Para comprimir imágenes', 'Para traducir la página'] },
  { level: 'facil', tag: 'Creatividad', q: '¿Qué es un «moodboard»?', ok: 'Un tablero de referencias visuales', bad: ['Un cronograma de piezas', 'Un informe de resultados', 'Una lista de precios'] },
  { level: 'medio', tag: 'Performance', q: '¿Qué mide el CTR?', ok: 'Clics sobre impresiones', bad: ['Ventas sobre visitas', 'Costo por mil impresiones', 'Tiempo en la página'] },
  { level: 'medio', tag: 'Marketing', q: '¿Qué es el «funnel» de marketing?', ok: 'El recorrido del cliente desde conocer hasta comprar', bad: ['Una herramienta de diseño', 'Un formato de video', 'Un tipo de contrato'] },
  { level: 'medio', tag: 'Diseño', q: '¿Qué es el «kerning»?', ok: 'El espacio entre dos letras', bad: ['El grosor de la línea', 'El alto de las mayúsculas', 'El espacio entre párrafos'] },
  { level: 'medio', tag: 'Digital', q: '¿Qué es un test A/B?', ok: 'Comparar dos versiones para ver cuál funciona mejor', bad: ['Una prueba de velocidad', 'Revisar ortografía dos veces', 'Un backup del sitio'] },
  { level: 'medio', tag: 'Diseño', q: '¿Qué espacio de color se usa para imprimir?', ok: 'CMYK', bad: ['RGB', 'HEX', 'HSL'] },
  { level: 'medio', tag: 'Social', q: '¿Qué es el alcance (reach) de una publicación?', ok: 'Cuántas personas distintas la vieron', bad: ['Cuántas veces se mostró', 'Cuántos la compartieron', 'Cuánto costó'] },
  { level: 'medio', tag: 'Marketing', q: '¿Qué es un «buyer persona»?', ok: 'Un perfil del cliente ideal', bad: ['El vendedor estrella', 'Un influenciador pagado', 'El dueño de la marca'] },
  { level: 'dificil', tag: 'Performance', q: '¿Qué significa ROAS?', ok: 'Retorno sobre la inversión en publicidad', bad: ['Ranking orgánico de anuncios', 'Tasa de rebote del sitio', 'Costo por adquisición'] },
  { level: 'dificil', tag: 'Digital', q: '¿Qué es el «Core Web Vitals» de Google?', ok: 'Métricas de experiencia y velocidad de una página', bad: ['Un plan de pauta', 'Un tipo de dominio', 'Un formato de anuncio'] },
  { level: 'dificil', tag: 'Diseño', q: '¿Qué es una «retícula» en diseño editorial?', ok: 'Una estructura de columnas y márgenes para ordenar', bad: ['Un filtro de color', 'Un tipo de fuente', 'Un error de impresión'] },
  { level: 'dificil', tag: 'Performance', q: '¿Qué es el CPA?', ok: 'Costo por adquisición', bad: ['Clics por anuncio', 'Costo por audiencia', 'Conversiones por alcance'] },
  { level: 'dificil', tag: 'Marketing', q: '¿Qué es el «share of voice»?', ok: 'La presencia de una marca frente a su competencia', bad: ['El volumen de la música del anuncio', 'Los comentarios positivos', 'El número de voceros'] },
  { level: 'dificil', tag: 'Digital', q: '¿Qué hace un píxel de seguimiento?', ok: 'Registra acciones de los visitantes para medir campañas', bad: ['Mejora la resolución de las fotos', 'Bloquea anuncios', 'Comprime el sitio'] }
];

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const toQuestion = (text: string, ok: string, bad: string[], tag: string): Question => {
  const options = shuffle([ok, ...bad.slice(0, 3)]);
  return { text, options, answer: options.indexOf(ok), tag };
};

/** Preguntas sobre el equipo, a partir de las fichas de La Colonia. */
const teamQuestions = (users: UserItem[], meId?: string): Question[] => {
  const team = users.filter((u) => u.status !== 'Inactive' && u.id !== meId);
  const name = (u: UserItem) => u.name.split(' ').slice(0, 2).join(' ');
  const others = (u: UserItem, pool: UserItem[]) => shuffle(pool.filter((o) => o.id !== u.id)).slice(0, 3).map(name);
  const qs: Question[] = [];

  // Ciudad (solo si la ciudad es única en el equipo)
  team.filter((u) => u.city && team.filter((o) => o.city === u.city).length === 1).forEach((u) => {
    const pool = team.filter((o) => o.city !== u.city);
    if (pool.length >= 3) qs.push(toQuestion(`¿Quién del equipo vive en ${u.city}?`, name(u), others(u, pool), 'Equipo'));
  });
  // Mascotas
  team.filter((u) => u.petNames).forEach((u) => {
    const pool = team.filter((o) => !o.petNames);
    if (pool.length >= 3) qs.push(toQuestion(`¿De quién son las mascotas ${u.petNames}?`, name(u), others(u, pool), 'Equipo'));
  });
  // Gustos: un gusto que solo tenga esa persona
  team.filter((u) => u.hobbies).forEach((u) => {
    const items = u.hobbies!.split(/[,.(]/).map((s) => s.trim()).filter((s) => s.length > 3 && s.length < 40);
    // Solo gustos distintivos: nada genérico que varias personas compartan
    const generic = /familia|amig|viaj|leer|lectura|serie|comer|playa|música|musica|pel[ií]cula|cocinar|caminar|dormir|conocer|aprender|descansar/i;
    const words = (t: string) => t.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    const unique = items.find((it) => !generic.test(it) && !team.some((o) => o.id !== u.id && words(it).some((w) => (o.hobbies || '').toLowerCase().includes(w))));
    if (unique && team.length >= 4) qs.push(toQuestion(`¿A quién le gusta «${unique.charAt(0).toLowerCase() + unique.slice(1)}»?`, name(u), others(u, team), 'Equipo'));
  });
  // Cargo
  team.filter((u) => u.jobTitle && team.filter((o) => o.jobTitle === u.jobTitle).length === 1).forEach((u) => {
    const bad = shuffle(team.filter((o) => o.jobTitle && o.jobTitle !== u.jobTitle).map((o) => o.jobTitle!)).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
    if (bad.length === 3) qs.push(toQuestion(`¿Cuál es el cargo de ${name(u)}?`, u.jobTitle!, bad, 'Equipo'));
  });
  // Cumpleaños (mes único)
  team.filter((u) => u.birthDate).forEach((u) => {
    const m = Number(u.birthDate!.split('-')[1]) - 1;
    const pool = team.filter((o) => o.birthDate && Number(o.birthDate.split('-')[1]) - 1 !== m);
    if (pool.length >= 3) qs.push(toQuestion(`¿Quién cumple años en ${MONTHS[m]}?`, name(u), others(u, pool), 'Equipo'));
  });
  return shuffle(qs);
};

/** Arma la escalera: fácil → difícil, intercalando preguntas del equipo. */
const buildLadder = (users: UserItem[], meId?: string): { ladder: Question[]; spares: Question[] } => {
  const team = teamQuestions(users, meId);
  const bank = (lv: Level) => shuffle(GENERAL.filter((g) => g.level === lv)).map((g) => toQuestion(g.q, g.ok, g.bad, g.tag));
  const easy = bank('facil');
  const mid = bank('medio');
  const hard = bank('dificil');
  const plan: (Question | undefined)[] = [easy[0], team[0] || easy[1], easy[2], team[1] || mid[3], mid[0], team[2] || mid[4], mid[1], team[3] || hard[3], hard[0], hard[1]];
  const ladder = plan.filter(Boolean) as Question[];
  const spares = [...team.slice(4), easy[3], mid[2], hard[2]].filter(Boolean) as Question[];
  return { ladder, spares };
};

const SECONDS = 20;
const LETTERS = ['A', 'B', 'C', 'D'];

interface Props {
  teamUsers: UserItem[];
  currentUserId?: string;
  onFinish: (score: number) => void;
}

export const QuizGame: React.FC<Props> = ({ teamUsers, currentUserId, onFinish }) => {
  const { skin } = useMascotSkin();
  const initial = useMemo(() => buildLadder(teamUsers, currentUserId), [teamUsers, currentUserId]);
  const [ladder, setLadder] = useState(initial.ladder);
  const spares = useRef(initial.spares);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(SECONDS);
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<'ask' | 'lock' | 'reveal' | 'end'>('ask');
  const [hidden, setHidden] = useState<number[]>([]);
  const [usedHint, setUsedHint] = useState(false);
  const [usedSwap, setUsedSwap] = useState(false);
  const [gain, setGain] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);
  const scoreRef = useRef(0);
  const q = ladder[idx];
  const total = ladder.length;

  // Cuenta regresiva por pregunta
  useEffect(() => {
    if (phase !== 'ask') return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const l = Math.max(0, SECONDS - (performance.now() - start) / 1000);
      setLeft(l);
      if (l <= 0) {
        window.clearInterval(id);
        setPicked(-1);
        setPhase('reveal');
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, idx, nonce]);

  // Revelar y avanzar
  useEffect(() => {
    if (phase === 'lock') {
      const id = window.setTimeout(() => setPhase('reveal'), 900);
      return () => window.clearTimeout(id);
    }
    if (phase === 'reveal') {
      const correct = picked === q.answer;
      if (correct) {
        const pts = (idx + 1) * 10 + Math.ceil(left);
        scoreRef.current += pts;
        setScore(scoreRef.current);
        setGain(pts);
        playScoreChime();
      }
      const id = window.setTimeout(() => {
        setGain(null);
        if (correct && idx + 1 < total) {
          setIdx((i) => i + 1);
          setPicked(null);
          setHidden([]);
          setLeft(SECONDS);
          setPhase('ask');
        } else {
          setPhase('end');
          window.setTimeout(() => onFinish(scoreRef.current), correct ? 1600 : 1400);
        }
      }, correct ? 1300 : 1700);
      return () => window.clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const choose = (i: number) => {
    if (phase !== 'ask' || hidden.includes(i)) return;
    playTapSound();
    setPicked(i);
    setPhase('lock');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
      if (k in map) choose(map[k]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const useHint = () => {
    if (usedHint || phase !== 'ask') return;
    playTapSound();
    const wrong = shuffle([0, 1, 2, 3].filter((i) => i !== q.answer)).slice(0, 2);
    setHidden(wrong);
    setUsedHint(true);
  };

  const useSwap = () => {
    if (usedSwap || phase !== 'ask' || !spares.current.length) return;
    playTapSound();
    const next = spares.current.shift()!;
    setLadder((l) => l.map((x, i) => (i === idx ? next : x)));
    setHidden([]);
    setUsedSwap(true);
    setLeft(SECONDS);
    setNonce((n) => n + 1);
  };

  const won = phase === 'end' && picked === q.answer;
  const ecoEmotion = phase === 'reveal' || phase === 'end' ? (picked === q.answer ? 'celebrating' : 'surprised') : left < 6 ? 'worried' : 'thinking';
  const ecoLine =
    phase === 'end'
      ? won ? `¡Completaste la escalera! ${score} pts 🏆` : `¡Buen intento! Te llevas ${score} pts.`
      : phase === 'reveal'
      ? picked === q.answer ? '¡Correcto! 🎉' : picked === -1 ? 'Se acabó el tiempo ⏱️' : `Era la ${LETTERS[q.answer]}`
      : phase === 'lock'
      ? '¿Esa es tu respuesta final? 🤔'
      : idx === 0 ? '¡Empecemos! Vamos de a una.' : idx >= total - 2 ? 'Esta es de las difíciles…' : `Pregunta ${idx + 1}. ¡Tú puedes!`;

  return (
    <div className="relative w-full overflow-hidden rounded-[22px] border-2 border-[#f472b6]/40 select-none" style={{ background: 'radial-gradient(ellipse at 50% -10%, #5b21b6 0%, #2a0f5c 40%, #0d0620 80%)' }}>
      <style>{`
        @keyframes quiz-beam { 0%,100% { opacity:.35; transform: rotate(var(--r)) } 50% { opacity:.6; transform: rotate(calc(var(--r) + 4deg)) } }
        @keyframes quiz-lock { 0%,100% { box-shadow: 0 0 0 rgba(251,191,36,.0) } 50% { box-shadow: 0 0 26px rgba(251,191,36,.8) } }
        @keyframes quiz-pop { from { transform: translateY(6px) scale(.9); opacity:0 } to { transform:none; opacity:1 } }
      `}</style>
      {/* Reflectores */}
      {[-28, -10, 10, 28].map((r, i) => (
        <div key={i} className="absolute top-[-40px] left-1/2 w-[120px] h-[420px] origin-top pointer-events-none" style={{ ['--r' as string]: `${r}deg`, transform: `rotate(${r}deg)`, marginLeft: -60, background: `linear-gradient(${i % 2 ? 'rgba(61,217,235,.22)' : 'rgba(244,114,182,.22)'}, transparent 75%)`, filter: 'blur(6px)', animation: `quiz-beam ${4 + i}s ease-in-out infinite` } as React.CSSProperties} />
      ))}

      <div className="relative grid grid-cols-1 sm:grid-cols-[1fr_118px] gap-3 p-3 sm:p-4">
        <div className="min-w-0 space-y-3">
          {/* ECO presentador */}
          <div className="flex items-center gap-3">
            <img src={mascotImage(ecoEmotion as 'thinking', skin)} alt="ECO" className="w-14 h-14 object-contain shrink-0 drop-shadow-[0_6px_10px_rgba(0,0,0,.5)]" />
            <div key={ecoLine} className="relative min-w-0 rounded-2xl bg-white px-3 py-2 text-xs font-bold" style={{ color: '#1a0f30', background: '#ffffff', animation: 'quiz-pop .25s ease-out both' }}>
              {ecoLine}
            </div>
            <div className="ml-auto shrink-0 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Puntos</p>
              <p className="text-2xl font-black text-[#d4ff3f] leading-none tabular-nums" style={{ textShadow: '0 0 12px rgba(212,255,63,.6)' }}>{score}</p>
              {gain !== null && <p className="text-xs font-black text-[#d4ff3f]" style={{ animation: 'quiz-pop .25s ease-out' }}>+{gain}</p>}
            </div>
          </div>

          {/* Pregunta */}
          <div className="relative rounded-3xl border-2 border-[#3dd9eb]/60 bg-[#0d0620]/80 px-4 pt-5 pb-4 text-center shadow-[0_0_30px_rgba(61,217,235,.2)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#3dd9eb] px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0d0620]">
              {q.tag} · Pregunta {idx + 1} de {total}
            </span>
            <p key={q.text} className="text-base sm:text-lg font-black text-white leading-snug text-balance" style={{ animation: 'quiz-pop .3s ease-out' }}>{q.text}</p>
            {/* Tiempo */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(left / SECONDS) * 100}%`, background: left < 6 ? '#fb7185' : 'linear-gradient(90deg,#3dd9eb,#d4ff3f)', transition: 'width .1s linear' }} />
              </div>
              <span className={`w-8 text-right text-sm font-black tabular-nums ${left < 6 ? 'text-[#fb7185]' : 'text-white'}`}>{Math.ceil(left)}</span>
            </div>
          </div>

          {/* Opciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt, i) => {
              const isPicked = picked === i;
              const isAnswer = i === q.answer;
              const revealed = phase === 'reveal' || phase === 'end';
              const gone = hidden.includes(i);
              let cls = 'bg-[#1a0d38] border-[#8a4dff]/50 hover:border-[#d4ff3f] hover:bg-[#24124a]';
              if (phase === 'lock' && isPicked) cls = 'bg-[#f59e0b] border-[#fde68a] text-[#1a0f30]';
              if (revealed && isAnswer) cls = 'bg-[#22c55e] border-[#bbf7d0] text-[#06210f]';
              if (revealed && isPicked && !isAnswer) cls = 'bg-[#e11d48] border-[#fecdd3]';
              return (
                <button
                  key={`${q.text}-${i}`}
                  type="button"
                  disabled={gone || phase !== 'ask'}
                  onClick={() => choose(i)}
                  className={`group flex items-center gap-2.5 rounded-2xl border-2 px-3 py-2.5 text-left text-sm font-bold text-white transition-all cursor-pointer disabled:cursor-default ${cls} ${gone ? 'opacity-0 pointer-events-none' : ''}`}
                  style={{ animation: phase === 'lock' && isPicked ? 'quiz-lock .5s ease-in-out infinite' : `quiz-pop .3s ease-out ${i * 0.06}s both` }}
                >
                  <span className={`shrink-0 w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-black ${phase === 'ask' ? 'bg-[#d4ff3f] text-[#1a0f30]' : 'bg-black/25 text-current'}`}>{LETTERS[i]}</span>
                  <span className="leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Ayudas */}
          <div className="flex items-center justify-center gap-2">
            <button type="button" onClick={useHint} disabled={usedHint || phase !== 'ask'} className="inline-flex items-center gap-1.5 rounded-full border border-[#d4ff3f]/50 bg-[#d4ff3f]/10 px-3 py-1.5 text-[11px] font-black text-[#d4ff3f] cursor-pointer disabled:opacity-30 disabled:cursor-default hover:bg-[#d4ff3f]/20">
              <Lightbulb className="w-3.5 h-3.5" /> Pista de ECO
            </button>
            <button type="button" onClick={useSwap} disabled={usedSwap || phase !== 'ask' || !spares.current.length} className="inline-flex items-center gap-1.5 rounded-full border border-[#3dd9eb]/50 bg-[#3dd9eb]/10 px-3 py-1.5 text-[11px] font-black text-[#3dd9eb] cursor-pointer disabled:opacity-30 disabled:cursor-default hover:bg-[#3dd9eb]/20">
              <Shuffle className="w-3.5 h-3.5" /> Cambiar pregunta
            </button>
          </div>
        </div>

        {/* Escalera */}
        <div className="hidden sm:flex flex-col-reverse gap-1 rounded-2xl bg-[#0d0620]/70 border border-white/10 p-2">
          {ladder.map((_, i) => {
            const done = i < idx || (i === idx && (phase === 'reveal' || phase === 'end') && picked === q.answer);
            const current = i === idx;
            return (
              <div key={i} className={`flex items-center justify-between rounded-lg px-2 py-[3px] text-[11px] font-black tabular-nums ${current ? 'bg-[#f472b6] text-[#1a0f30]' : done ? 'text-[#d4ff3f]' : 'text-white/40'}`}>
                <span>{i + 1}</span>
                <span>{i === total - 1 ? <Trophy className="w-3 h-3 inline" /> : null} {(i + 1) * 10}</span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="relative pb-3 text-center text-[10.5px] text-white/45">Puntos por pregunta = nivel × 10 + segundos que te sobran · teclas A–D</p>
    </div>
  );
};
