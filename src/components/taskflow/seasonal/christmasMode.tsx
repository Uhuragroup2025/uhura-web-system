import React from 'react';

// Efectos de temporada. La apariencia la decide system_admin (ver mascot/ecoMascot.ts).

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
