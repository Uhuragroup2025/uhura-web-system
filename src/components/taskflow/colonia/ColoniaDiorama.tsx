/**
 * ============================================================================
 * COLONIA DIORAMA · LIVING AMBIENT HABITAT (ORBIT BY UHURA)
 * ============================================================================
 * Espacio visual relajante y experiencial. Bucky vive en su hábitat ribereño,
 * con río animado, constelaciones orbitales y rincones interactivos.
 * No requiere economía ni administración: es puro disfrute y ambientación.
 */

import React, { useState } from 'react';
import { ColonyStructure, BuckyAccessory } from './types';
import buckyHoodieHappyImg from '../../../assets/images/bucky_hip_uhura_v3.png';
import buckyFocusImg from '../../../assets/images/bucky_focus_cutout.png';
import buckyCelebratingImg from '../../../assets/images/bucky_celebrating_cutout.png';
import { Sparkles, Moon, Sun, Sunset, Coffee, MessageSquare, Compass, X } from 'lucide-react';

interface ColoniaDioramaProps {
  structures?: ColonyStructure[];
  accessories?: BuckyAccessory[];
  onSelectStructureToBuild?: (structureId: string) => void;
  onBuckyClick?: () => void;
  buckyActivity?: 'idle' | 'walking' | 'working' | 'resting';
}

const BUCKY_PHRASES = [
  '¡Bienvenida a La Colonia! Tómate 15 segundos para despejar la mente 🦫✨',
  'El agua del río fluye tranquila hoy. Respira hondo y relaja los hombros 🌿',
  '¡Diego tiene 120 pts en la Torre de Cedro! ¿Crees que lo puedes superar? 🪵⚡',
  'Un cafecito bien caliente con el equipo y volvemos con toda la claridad ☕🦫',
  '¡Oscar aceptó tu reto! A ver quién tiene mejores reflejos en el nenúfar ⚔️',
  'Orbit cuida tus proyectos; aquí venimos a respirar y compartir unas risas 💜'
];

type AmbientTime = 'night' | 'sunset' | 'day';

export const ColoniaDiorama: React.FC<ColoniaDioramaProps> = ({
  structures = [],
  accessories = [],
  onBuckyClick,
  buckyActivity = 'working'
}) => {
  const [selectedStructure, setSelectedStructure] = useState<{
    icon: string;
    name: string;
    description: string;
    hint: string;
  } | null>(null);

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [ambientTime, setAmbientTime] = useState<AmbientTime>('night');
  const [buckyMood, setBuckyMood] = useState<'happy' | 'focus' | 'celebrating'>('happy');

  const handleBuckyInteract = () => {
    setPhraseIndex((prev) => (prev + 1) % BUCKY_PHRASES.length);
    setBuckyMood((prev) => (prev === 'happy' ? 'celebrating' : prev === 'celebrating' ? 'focus' : 'happy'));
    if (onBuckyClick) onBuckyClick();
  };

  // Fondos según ambientTime
  const bgGradients: Record<AmbientTime, string> = {
    night: 'from-[#1b0e36] via-[#140b24] to-[#0c0617]',
    sunset: 'from-[#3b1548] via-[#241038] to-[#120822]',
    day: 'from-[#251b4d] via-[#1c133a] to-[#0f0922]'
  };

  return (
    <div
      className={`relative w-full h-[500px] sm:h-[540px] rounded-3xl overflow-hidden border border-[#8a4dff]/40 shadow-2xl bg-gradient-to-b ${bgGradients[ambientTime]} select-none transition-colors duration-500`}
    >
      {/* Selector ambiental sutil en esquina superior */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 p-1 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10">
        <button
          onClick={() => setAmbientTime('night')}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
            ambientTime === 'night'
              ? 'bg-[#501f92] text-[#d4ff4a] shadow-xs'
              : 'text-white/60 hover:text-white'
          }`}
          title="Noche orbital estrellada"
        >
          <Moon className="w-3 h-3" />
          <span className="hidden sm:inline">Noche</span>
        </button>
        <button
          onClick={() => setAmbientTime('sunset')}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
            ambientTime === 'sunset'
              ? 'bg-[#501f92] text-[#fdba74] shadow-xs'
              : 'text-white/60 hover:text-white'
          }`}
          title="Atardecer ribereño"
        >
          <Sunset className="w-3 h-3" />
          <span className="hidden sm:inline">Atardecer</span>
        </button>
        <button
          onClick={() => setAmbientTime('day')}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
            ambientTime === 'day'
              ? 'bg-[#501f92] text-[#38bdf8] shadow-xs'
              : 'text-white/60 hover:text-white'
          }`}
          title="Mañana fresca"
        >
          <Sun className="w-3 h-3" />
          <span className="hidden sm:inline">Día</span>
        </button>
      </div>

      {/* Cielo: Estrellas / Constelaciones */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-6 left-12 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <div className="absolute top-16 right-36 w-1 h-1 rounded-full bg-[#d4ff4a]" />
        <div className="absolute top-28 left-1/3 w-2 h-2 rounded-full bg-[#c9b7ff] opacity-60" />
        <div className="absolute top-10 left-1/2 w-1.5 h-1.5 rounded-full bg-white opacity-80" />

        {/* Constelación orbital sutil */}
        <svg className="absolute top-4 right-20 w-44 h-28 stroke-[#8a4dff]/30 stroke-[1] fill-none">
          <polyline points="10,20 60,10 110,40 150,25" />
          <circle cx="10" cy="20" r="2" fill="#8a4dff" />
          <circle cx="60" cy="10" r="2.5" fill="#d4ff4a" />
          <circle cx="110" cy="40" r="2" fill="#8a4dff" />
          <circle cx="150" cy="25" r="3" fill="#c9b7ff" />
        </svg>
      </div>

      {/* Relieve natural del hábitat: Colina izquierda */}
      <div className="absolute -bottom-16 -left-20 w-[420px] h-[340px] rounded-[140px] bg-gradient-to-tr from-[#1a0f2e] to-[#2a174a] border-t border-[#8a4dff]/20 shadow-xl transform -rotate-6 pointer-events-none" />

      {/* Relieve natural: Colina derecha */}
      <div className="absolute -bottom-12 -right-16 w-[450px] h-[360px] rounded-[160px] bg-gradient-to-tl from-[#170c29] to-[#251342] border-t border-[#8a4dff]/20 shadow-xl transform rotate-3 pointer-events-none" />

      {/* Valle central y Río vivo */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 overflow-hidden pointer-events-none">
        <div className="relative w-full h-full">
          <svg viewBox="0 0 800 300" className="w-full h-full preserve-3d">
            <defs>
              <linearGradient id="riverGradColonia" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="waterHighlightColonia" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#d4ff4a" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M 100,300 C 250,200 350,160 400,100 C 450,40 500,20 600,0 L 700,0 C 620,30 550,80 500,140 C 450,200 350,250 200,300 Z"
              fill="url(#riverGradColonia)"
            />
            <path
              d="M 180,280 Q 280,210 380,140"
              fill="none"
              stroke="url(#waterHighlightColonia)"
              strokeWidth="3"
              strokeDasharray="12 16"
              className="animate-pulse"
            />
            <path
              d="M 260,260 Q 360,180 460,110"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeOpacity="0.4"
              strokeDasharray="8 12"
            />
          </svg>
        </div>
      </div>

      {/* ================================================================= */}
      {/* ESTRUCTURAS AMBIENTALES DEL HÁBITAT */}
      {/* ================================================================= */}

      {/* 1. REPRESA DE PIEDRA Y CEDRO (Centro-inferior del río) */}
      <div
        onClick={() =>
          setSelectedStructure({
            icon: '🪨🪵',
            name: 'Represa de Piedra y Cedro',
            description: 'Regula el caudal del río cristalino para mantener el hábitat en serenidad constante.',
            hint: 'Bucky inspecciona las compuertas cada mañana antes de su primer café.'
          })
        }
        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 cursor-pointer group"
        title="Represa de Piedra y Cedro"
      >
        <div className="relative flex flex-col items-center">
          <div className="text-3xl sm:text-4xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-transform">
            🪨🪵
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#140b24]/90 text-[#d4ff4a] border border-[#d4ff4a]/40 shadow-xs mt-1">
            Represa Ribereña
          </span>
        </div>
      </div>

      {/* 2. MUELLE DE CEDRO (Orilla izquierda) */}
      <div
        onClick={() =>
          setSelectedStructure({
            icon: '🪵⛵',
            name: 'Muelle de Troncos Pulidos',
            description: 'El rincón favorito del equipo para sentarse a charlar y contemplar el agua.',
            hint: 'Aquí atracan las canoas de ideas y los descansos de 15 segundos.'
          })
        }
        className="absolute bottom-28 left-[22%] sm:left-[28%] z-20 cursor-pointer group"
        title="Muelle de Cedro"
      >
        <div className="relative flex flex-col items-center">
          <div className="text-3xl sm:text-4xl filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)] transform group-hover:scale-110 transition-transform">
            🪵⛵
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#140b24]/80 text-[#c9b7ff] border border-white/10 mt-1">
            Muelle de Pausa
          </span>
        </div>
      </div>

      {/* 3. BANCO DE DESCANSO (Orilla izquierda baja) */}
      <div
        onClick={() =>
          setSelectedStructure({
            icon: '🪑🌿',
            name: 'Banco Bajo el Sauce',
            description: 'Un rincón ergonómico a la sombra del sauce ribereño para estirar los brazos.',
            hint: 'Pausa activa recomendada: 2 minutos de respiración cada par de horas.'
          })
        }
        className="absolute bottom-8 left-[12%] sm:left-[16%] z-20 cursor-pointer group"
        title="Banco de Pausa"
      >
        <div className="relative flex flex-col items-center">
          <div className="text-2xl sm:text-3xl filter drop-shadow-md transform group-hover:scale-110 transition-transform">
            🪑🌿
          </div>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-[#140b24]/70 text-white/70 border border-white/5 mt-0.5">
            Banco de Pausa
          </span>
        </div>
      </div>

      {/* 4. JARDÍN BOTÁNICO RIBEREÑO (Orilla derecha baja) */}
      <div
        onClick={() =>
          setSelectedStructure({
            icon: '🌿🌸',
            name: 'Jardín de Nenúfares y Juncos',
            description: 'Hogar de nenúfares flotantes donde Bucky practica sus reflejos rápidos.',
            hint: '¡De aquí nacen los retos de Reflejos de Nenúfar!'
          })
        }
        className="absolute bottom-10 right-[14%] sm:right-[18%] z-20 cursor-pointer group"
        title="Jardín Botánico"
      >
        <div className="relative flex flex-col items-center">
          <div className="text-3xl sm:text-4xl filter drop-shadow-md transform group-hover:scale-110 transition-transform">
            🌿🌸
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#140b24]/90 text-[#4ade80] border border-[#4ade80]/30 mt-1">
            Jardín Ribereño
          </span>
        </div>
      </div>

      {/* 5. CABAÑA TALLER (Colina alta central) */}
      <div
        onClick={() =>
          setSelectedStructure({
            icon: '🏡',
            name: 'Cabaña Taller de Bucky',
            description: 'El taller de diseño y carpintería de cedro con planos y pizarra de retos.',
            hint: 'Bucky guarda aquí la lista de récords semanales de Uhura Group.'
          })
        }
        className="absolute top-24 left-[45%] sm:left-[48%] -translate-x-1/2 z-15 cursor-pointer group"
        title="Cabaña Taller de Bucky"
      >
        <div className="relative flex flex-col items-center">
          <div className="text-5xl sm:text-6xl filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform">
            🏡
          </div>
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#501f92] text-[#d4ff4a] border border-[#8a4dff] shadow-md mt-1 flex items-center gap-1">
            <span>Taller de Bucky</span>
            <Sparkles className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>

      {/* 6. PUENTE DE PASO (Sobre el río) */}
      <div
        onClick={() =>
          setSelectedStructure({
            icon: '🌉',
            name: 'Puente de Ensambles Precisos',
            description: 'Paso elevado de madera pulida que une ambas orillas del hábitat.',
            hint: 'Simboliza la conexión fluida entre los equipos de Uhura.'
          })
        }
        className="absolute bottom-36 left-1/2 -translate-x-1/2 z-15 cursor-pointer group"
        title="Puente de Paso"
      >
        <div className="relative flex flex-col items-center">
          <div className="text-4xl sm:text-5xl filter drop-shadow-lg transform group-hover:scale-105 transition-transform">
            🌉
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#140b24]/90 text-[#c9b7ff] border border-white/20 mt-0.5">
            Puente de Paso
          </span>
        </div>
      </div>

      {/* 7. OBSERVATORIO FLUVIAL */}
      <div
        onClick={() =>
          setSelectedStructure({
            icon: '🔭✨',
            name: 'Observatorio Orbital',
            description: 'Telescopio de latón orientado a las constelaciones de Orbit.',
            hint: 'Desde aquí se mira el horizonte sin apuros.'
          })
        }
        className="absolute top-10 right-[15%] z-15 cursor-pointer group"
        title="Observatorio Orbital"
      >
        <div className="relative flex flex-col items-center">
          <div className="text-4xl sm:text-5xl filter drop-shadow-[0_0_20px_rgba(212,255,74,0.4)] transform group-hover:scale-110 transition-transform">
            🔭✨
          </div>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#140b24] text-[#d4ff4a] border border-[#d4ff4a] mt-0.5">
            Observatorio
          </span>
        </div>
      </div>

      {/* Faroles sutiles */}
      <div className="absolute bottom-28 left-[17%] z-15 pointer-events-none animate-pulse">
        <div className="text-xl filter drop-shadow-[0_0_12px_#8a4dff]">🏮</div>
      </div>

      {/* ================================================================= */}
      {/* BUCKY EN EL HÁBITAT (PROTAGONISTA VIVO & INTERACTIVO) */}
      {/* ================================================================= */}
      <div
        onClick={handleBuckyInteract}
        className="absolute bottom-20 left-[42%] sm:left-[45%] z-30 cursor-pointer group"
        title="Haz clic en Bucky para charlar"
      >
        <div className="relative flex flex-col items-center">
          {/* Globo de diálogo interactivo */}
          <div className="absolute -top-14 bg-white text-[#140b24] text-xs font-bold px-3.5 py-1.5 rounded-2xl shadow-2xl border border-[#8a4dff]/40 max-w-xs whitespace-normal text-center animate-bounce flex items-center gap-1.5">
            <span>{BUCKY_PHRASES[phraseIndex]}</span>
          </div>

          {/* Halo luminoso */}
          <div className="absolute inset-0 bg-[#8a4dff]/30 rounded-full blur-xl transform group-hover:scale-125 transition-all" />

          {/* Sprite de Bucky */}
          <img
            src={
              buckyMood === 'celebrating'
                ? buckyCelebratingImg
                : buckyMood === 'focus'
                ? buckyFocusImg
                : buckyHoodieHappyImg
            }
            alt="Bucky en La Colonia"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] transform group-hover:scale-110 transition-all duration-200"
          />

          {/* Sombra de contacto */}
          <div className="w-16 h-3 bg-black/50 rounded-full blur-xs mt-0.5" />
        </div>
      </div>

      {/* Indicador sutil de clic en Bucky */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-[11px] text-white/50 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-xs">
        <MessageSquare className="w-3.5 h-3.5 text-[#d4ff4a]" />
        <span>Haz clic en Bucky o en las estructuras para explorar su hábitat</span>
      </div>

      {/* ================================================================= */}
      {/* MODAL / TARJETA FLOTANTE DE INFORMACIÓN AMBIENTAL */}
      {/* ================================================================= */}
      {selectedStructure && (
        <div className="absolute top-4 left-4 z-40 bg-[#140b24]/95 border border-[#8a4dff]/60 rounded-2xl p-4 text-white max-w-xs shadow-2xl backdrop-blur-md animate-in fade-in duration-150">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedStructure.icon}</span>
              <div>
                <h4 className="text-xs font-black text-white">{selectedStructure.name}</h4>
                <span className="text-[10px] text-[#d4ff4a] font-bold">Hábitat de Bucky</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedStructure(null)}
              className="text-white/60 hover:text-white text-xs cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-white/80 mt-2 leading-relaxed">
            {selectedStructure.description}
          </p>
          <div className="mt-2 text-[11px] text-[#c9b7ff] bg-white/5 p-2 rounded-xl border border-white/5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#d4ff4a] shrink-0" />
            <span>{selectedStructure.hint}</span>
          </div>
        </div>
      )}
    </div>
  );
};
