import React, { useEffect, useState } from 'react';

/**
 * Modo navideño de ECO (preferencia personal, solo visual).
 * Se activa desde la ventana de la mascota. Se guarda en el navegador de cada persona;
 * no cambia datos ni lógica. En producción puede quedar como preferencia del usuario.
 */
const KEY = 'eco_christmas_mode';
const EVENT = 'eco:christmas-mode';

const read = (): boolean => {
  try {
    return localStorage.getItem(KEY) === 'true';
  } catch {
    return false;
  }
};

export function setChristmasMode(on: boolean) {
  try {
    localStorage.setItem(KEY, String(on));
  } catch {
    /* sin almacenamiento: solo dura la sesión */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: on }));
}

export function useChristmasMode(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState<boolean>(read);
  useEffect(() => {
    const handler = (e: Event) => setOn(Boolean((e as CustomEvent).detail));
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);
  return [on, setChristmasMode];
}

/** Gorro navideño que se superpone a la mascota. */
export const SantaHat: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 64 48" className={className} aria-hidden="true">
    <path d="M8 38 C14 14, 34 2, 50 10 C56 13, 58 22, 56 30 L52 30 C52 22, 46 17, 38 18 C28 20, 22 30, 20 38 Z" fill="#dc2626" />
    <path d="M50 10 C56 13, 58 22, 56 30 L52 30 C52 22, 46 17, 40 18 Z" fill="#b91c1c" />
    <rect x="4" y="34" width="38" height="10" rx="5" fill="#f8fafc" />
    <circle cx="55" cy="33" r="6" fill="#f8fafc" />
  </svg>
);

/** Nieve suave sobre toda la app. Se desactiva con «reducir movimiento». */
export const Snowfall: React.FC = () => {
  const flakes = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div className="eco-snow pointer-events-none fixed inset-0 z-[35] overflow-hidden" aria-hidden="true">
      {flakes.map((i) => (
        <span
          key={i}
          className="eco-snowflake"
          style={{
            left: `${(i * 37) % 100}%`,
            animationDuration: `${9 + ((i * 7) % 9)}s`,
            animationDelay: `${-((i * 13) % 17)}s`,
            fontSize: `${8 + ((i * 5) % 8)}px`,
            opacity: 0.35 + ((i * 3) % 5) / 10
          }}
        >
          ❄
        </span>
      ))}
    </div>
  );
};
