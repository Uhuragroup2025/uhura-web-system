import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import spriteImg from '../../../assets/images/eco/eco-walk-sprite.webp';

/**
 * ECO animado (login). Un solo sprite con 6 poses alineadas en la misma caja:
 *  0 camina (pie arriba) · 1 camina (apoyo) · 2 de frente · 3 manos en la cintura · 4 guiño · 5 camina de perfil
 *
 * - Entrada: camina desde fuera del panel (pasos alternados + balanceo), se pone las manos en la cintura y guiña.
 * - Reposo (cada 2,5–4 s): guiña, mira de frente o da un paseo corto (va y vuelve; de regreso se voltea).
 * - `wink()`: guiño a demanda (al ingresar). `look()`: se pone de frente (al haber un error).
 * - Con «reducir movimiento» activo en el dispositivo queda quieto en la pose 3.
 */
export interface AnimatedEcoHandle {
  wink: () => void;
  look: () => void;
}

type Step = { frame: number; ms: number; x?: number; flip?: boolean; bob?: number };

const FRAME_COUNT = 6;
const ASPECT = 297 / 320; // ancho / alto de cada pose
const STEP_MS = 150;

const prefersReducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

/** Pasos de caminata entre dos posiciones: alterna las dos poses de paso con un leve rebote. */
function walk(from: number, to: number, stride: number): Step[] {
  const flip = to < from;
  const n = Math.max(2, Math.round(Math.abs(to - from) / stride));
  const steps: Step[] = [{ frame: 5, ms: STEP_MS, x: from, flip, bob: 0 }];
  for (let i = 1; i <= n; i++) {
    steps.push({ frame: i % 2 ? 0 : 1, ms: STEP_MS, x: from + ((to - from) * i) / n, flip, bob: i % 2 ? -4 : 0 });
  }
  return steps;
}

export const AnimatedEco = forwardRef<AnimatedEcoHandle, { height?: number; enterFrom?: number; className?: string }>(
  ({ height = 120, enterFrom = -120, className = '' }, ref) => {
    const reduced = useRef(prefersReducedMotion());
    const [pose, setPose] = useState<{ frame: number; x: number; flip: boolean; bob: number }>({
      frame: reduced.current ? 3 : 5,
      x: reduced.current ? 0 : enterFrom,
      flip: false,
      bob: 0
    });
    const timers = useRef<number[]>([]);
    const busy = useRef(false);
    const stride = Math.max(14, height * 0.09);

    const clear = () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };

    const play = (steps: Step[], onDone?: () => void) => {
      clear();
      busy.current = true;
      let elapsed = 0;
      steps.forEach((s) => {
        timers.current.push(window.setTimeout(() => {
          setPose((p) => ({ frame: s.frame, x: s.x ?? p.x, flip: s.flip ?? p.flip, bob: s.bob ?? 0 }));
        }, elapsed));
        elapsed += s.ms;
      });
      timers.current.push(window.setTimeout(() => {
        busy.current = false;
        onDone?.();
      }, elapsed));
    };

    // Al terminar de caminar: de frente, manos en la cintura y guiño
    const settle: Step[] = [
      { frame: 2, ms: 320, flip: false },
      { frame: 3, ms: 450, flip: false },
      { frame: 4, ms: 650 },
      { frame: 3, ms: 0 }
    ];

    useEffect(() => {
      if (reduced.current) return;
      let idle: number | undefined;
      const stroll = Math.round(height * 0.45);
      const idleActions: Step[][] = [
        [{ frame: 4, ms: 700 }, { frame: 3, ms: 0 }],
        [{ frame: 2, ms: 1200 }, { frame: 3, ms: 0 }],
        [...walk(0, -stroll, stride), ...walk(-stroll, 0, stride), ...settle],
        [...walk(0, stroll, stride), ...walk(stroll, 0, stride), ...settle],
        [{ frame: 2, ms: 500 }, { frame: 4, ms: 650 }, { frame: 3, ms: 0 }]
      ];
      let last = -1;
      const scheduleIdle = () => {
        idle = window.setTimeout(() => {
          if (busy.current) return scheduleIdle();
          let next = Math.floor(Math.random() * idleActions.length);
          if (next === last) next = (next + 1) % idleActions.length;
          last = next;
          play(idleActions[next], scheduleIdle);
        }, 2500 + Math.random() * 1500);
      };
      play([...walk(enterFrom, 0, stride), ...settle], scheduleIdle);
      return () => {
        clear();
        if (idle) window.clearTimeout(idle);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      wink: () => {
        if (!reduced.current) play([{ frame: 4, ms: 700, flip: false }, { frame: 3, ms: 0 }]);
      },
      look: () => {
        if (!reduced.current) play([{ frame: 2, ms: 1100, flip: false }, { frame: 3, ms: 0 }]);
      }
    }));

    return (
      <div
        role="img"
        aria-label="ECO, la mascota de Uhura"
        className={`select-none pointer-events-none ${className}`}
        style={{
          height,
          width: Math.round(height * ASPECT),
          backgroundImage: `url(${spriteImg})`,
          backgroundSize: `${FRAME_COUNT * 100}% 100%`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: `${(pose.frame / (FRAME_COUNT - 1)) * 100}% 0`,
          transform: `translate(${pose.x}px, ${pose.bob}px) scaleX(${pose.flip ? -1 : 1})`,
          transition: `transform ${STEP_MS}ms linear`,
          filter: 'drop-shadow(0 18px 24px rgba(13,7,24,0.35))'
        }}
      />
    );
  }
);
AnimatedEco.displayName = 'AnimatedEco';
