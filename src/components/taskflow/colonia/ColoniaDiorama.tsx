/**
 * ============================================================================
 * COLONIA DIORAMA · LIVING ISOMETRIC HABITAT (ORBIT BY UHURA)
 * ============================================================================
 */

import React, { useState } from 'react';
import { ColonyStructure, BuckyAccessory } from './types';
import buckyHoodieHappyImg from '../../../assets/images/bucky_hip_uhura_v3.png';
import buckyFocusImg from '../../../assets/images/bucky_focus_cutout.png';
import buckyCelebratingImg from '../../../assets/images/bucky_celebrating_cutout.png';
import { Sparkles, Hammer, Info, CheckCircle2 } from 'lucide-react';

interface ColoniaDioramaProps {
  structures: ColonyStructure[];
  accessories: BuckyAccessory[];
  onSelectStructureToBuild?: (structureId: string) => void;
  onBuckyClick?: () => void;
  buckyActivity?: 'idle' | 'walking' | 'working' | 'resting';
}

export const ColoniaDiorama: React.FC<ColoniaDioramaProps> = ({
  structures,
  accessories,
  onSelectStructureToBuild,
  onBuckyClick,
  buckyActivity = 'working'
}) => {
  const [selectedStructure, setSelectedStructure] = useState<ColonyStructure | null>(null);

  // Accesorios equipados
  const equippedCoffee = accessories.find(a => a.id === 'taza_cafe_uhura')?.equipped;
  const equippedGlasses = accessories.find(a => a.id === 'lentes_presicion')?.equipped;
  const equippedBeanie = accessories.find(a => a.id === 'gorro_tejido_morado')?.equipped;
  const equippedBackpack = accessories.find(a => a.id === 'mochila_cuero')?.equipped;
  const equippedFireflies = accessories.find(a => a.id === 'luciernagas_orbitales')?.equipped;

  // Mapa de estructuras construidas
  const isBuilt = (id: string) => structures.find(s => s.id === id)?.unlocked ?? false;

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden border border-[#8a4dff]/30 shadow-2xl bg-gradient-to-b from-[#1b0e36] via-[#140b24] to-[#0c0617] select-none">
      {/* Fondo: Cielo suave y estrellas / constelaciones orbitales de Orbit */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-6 left-12 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <div className="absolute top-16 right-24 w-1 h-1 rounded-full bg-[#d4ff4a]" />
        <div className="absolute top-28 left-1/3 w-2 h-2 rounded-full bg-[#c9b7ff] opacity-60" />
        <div className="absolute top-10 right-1/3 w-1.5 h-1.5 rounded-full bg-white opacity-80" />
        
        {/* Constelación suave conectada con líneas tenues */}
        <svg className="absolute top-4 right-10 w-48 h-32 stroke-[#8a4dff]/30 stroke-[1] fill-none">
          <polyline points="10,20 60,10 110,45 160,30" />
          <circle cx="10" cy="20" r="2" fill="#8a4dff" />
          <circle cx="60" cy="10" r="2.5" fill="#d4ff4a" />
          <circle cx="110" cy="45" r="2" fill="#8a4dff" />
          <circle cx="160" cy="30" r="3" fill="#c9b7ff" />
        </svg>
      </div>

      {/* Relieve natural del hábitat: Colina suave izquierda */}
      <div className="absolute -bottom-16 -left-20 w-[420px] h-[340px] rounded-[140px] bg-gradient-to-tr from-[#1a0f2e] to-[#2a174a] border-t border-[#8a4dff]/20 shadow-xl transform -rotate-6" />

      {/* Relieve natural: Colina alta derecha */}
      <div className="absolute -bottom-12 -right-16 w-[450px] h-[360px] rounded-[160px] bg-gradient-to-tl from-[#170c29] to-[#251342] border-t border-[#8a4dff]/20 shadow-xl transform rotate-3" />

      {/* Valle central y Río vivo que cruza el hábitat */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 overflow-hidden pointer-events-none">
        {/* Cauce del río curvado */}
        <div className="relative w-full h-full">
          <svg viewBox="0 0 800 300" className="w-full h-full preserve-3d">
            <defs>
              <linearGradient id="riverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="waterHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#d4ff4a" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Lecho del río */}
            <path
              d="M 100,300 C 250,200 350,160 400,100 C 450,40 500,20 600,0 L 700,0 C 620,30 550,80 500,140 C 450,200 350,250 200,300 Z"
              fill="url(#riverGrad)"
            />
            {/* Ondas sutiles de corriente */}
            <path
              d="M 180,280 Q 280,210 380,140"
              fill="none"
              stroke="url(#waterHighlight)"
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
      {/* CAPA DE ESTRUCTURAS INTERACTIVAS */}
      {/* ================================================================= */}

      {/* 1. REPRESA DE PIEDRA Y CEDRO (Centro-inferior del río) */}
      <div
        onClick={() => setSelectedStructure(structures.find(s => s.id === 'represa_1') || null)}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 cursor-pointer group"
      >
        <div className="relative flex flex-col items-center">
          <div className="text-3xl sm:text-4xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-transform">
            🪨🪵
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#140b24]/90 text-[#d4ff4a] border border-[#d4ff4a]/40 shadow-xs mt-1">
            Represa Base
          </span>
        </div>
      </div>

      {/* 2. MUELLE DE TRONCOS (Orilla izquierda) */}
      <div
        onClick={() => setSelectedStructure(structures.find(s => s.id === 'muelle_troncos') || null)}
        className="absolute bottom-28 left-[22%] sm:left-[28%] z-20 cursor-pointer group"
      >
        <div className="relative flex flex-col items-center">
          <div className="text-3xl sm:text-4xl filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)] transform group-hover:scale-110 transition-transform">
            🪵⛵
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#140b24]/80 text-[#c9b7ff] border border-white/10 mt-1">
            Muelle de Cedro
          </span>
        </div>
      </div>

      {/* 3. BANCO DE DESCANSO BAJO EL SAUCE (Orilla izquierda baja) */}
      <div
        onClick={() => setSelectedStructure(structures.find(s => s.id === 'banco_descanso') || null)}
        className="absolute bottom-8 left-[12%] sm:left-[16%] z-20 cursor-pointer group"
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

      {/* 4. JARDÍN RIBEREÑO (Orilla derecha baja) */}
      {isBuilt('jardin_ribereno') ? (
        <div
          onClick={() => setSelectedStructure(structures.find(s => s.id === 'jardin_ribereno') || null)}
          className="absolute bottom-10 right-[14%] sm:right-[18%] z-20 cursor-pointer group animate-in fade-in duration-300"
        >
          <div className="relative flex flex-col items-center">
            <div className="text-3xl sm:text-4xl filter drop-shadow-md transform group-hover:scale-110 transition-transform">
              🌿🌸
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#140b24]/90 text-[#4ade80] border border-[#4ade80]/30 mt-1">
              Jardín Botánico
            </span>
          </div>
        </div>
      ) : (
        <button
          onClick={() => onSelectStructureToBuild?.('jardin_ribereno')}
          className="absolute bottom-10 right-[14%] sm:right-[18%] z-10 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-[#8a4dff]/20 border border-dashed border-white/20 hover:border-[#d4ff4a] text-[10px] text-white/60 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
        >
          <Hammer className="w-3 h-3 text-[#d4ff4a]" />
          <span>+ Jardín</span>
        </button>
      )}

      {/* 5. CABAÑA TALLER (Colina alta central) */}
      {isBuilt('cabana_taller') ? (
        <div
          onClick={() => setSelectedStructure(structures.find(s => s.id === 'cabana_taller') || null)}
          className="absolute top-28 left-[45%] sm:left-[48%] -translate-x-1/2 z-10 cursor-pointer group animate-in zoom-in-90 duration-300"
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
      ) : (
        <button
          onClick={() => onSelectStructureToBuild?.('cabana_taller')}
          className="absolute top-32 left-[45%] sm:left-[48%] -translate-x-1/2 z-10 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-[#501f92]/40 border border-dashed border-[#8a4dff]/50 hover:border-[#d4ff4a] text-xs text-[#c9b7ff] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
        >
          <Hammer className="w-3.5 h-3.5 text-[#d4ff4a]" />
          <span>Ensamblar Cabaña Taller</span>
        </button>
      )}

      {/* 6. PUENTE DE MADERA (Paso sobre el río) */}
      {isBuilt('puente_madera') ? (
        <div
          onClick={() => setSelectedStructure(structures.find(s => s.id === 'puente_madera') || null)}
          className="absolute bottom-40 left-1/2 -translate-x-1/2 z-15 cursor-pointer group animate-in fade-in"
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
      ) : null}

      {/* 7. FAROLES SOLARES UHURA */}
      {isBuilt('faroles_solares') && (
        <div className="absolute bottom-28 left-[18%] z-15 pointer-events-none animate-pulse">
          <div className="text-2xl filter drop-shadow-[0_0_12px_#8a4dff]">🏮</div>
        </div>
      )}

      {/* 8. RUEDA HIDRÁULICA */}
      {isBuilt('rueda_hidraulica') && (
        <div
          onClick={() => setSelectedStructure(structures.find(s => s.id === 'rueda_hidraulica') || null)}
          className="absolute bottom-32 right-[28%] z-15 cursor-pointer group"
        >
          <div className="relative flex flex-col items-center">
            <div className="text-4xl filter drop-shadow-md transform group-hover:rotate-45 transition-transform">
              ⚙️
            </div>
            <span className="text-[9px] font-semibold text-[#38bdf8]">Energía limpia</span>
          </div>
        </div>
      )}

      {/* 9. OBSERVATORIO FLUVIAL (Nivel 3) */}
      {isBuilt('observatorio') ? (
        <div
          onClick={() => setSelectedStructure(structures.find(s => s.id === 'observatorio') || null)}
          className="absolute top-12 right-[15%] z-10 cursor-pointer group animate-in zoom-in"
        >
          <div className="relative flex flex-col items-center">
            <div className="text-5xl filter drop-shadow-[0_0_20px_rgba(212,255,74,0.4)] transform group-hover:scale-110 transition-transform">
              🔭✨
            </div>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#140b24] text-[#d4ff4a] border border-[#d4ff4a]">
              Observatorio Orbital
            </span>
          </div>
        </div>
      ) : null}

      {/* ================================================================= */}
      {/* BUCKY VIVO EN EL HÁBITAT (PERSONAJE CENTRAL CON ACCESORIOS) */}
      {/* ================================================================= */}
      <div
        onClick={onBuckyClick}
        className="absolute bottom-20 left-[42%] sm:left-[45%] z-30 cursor-pointer group"
        title="¡Hola! Soy Bucky en La Colonia. Haz clic para interactuar."
      >
        <div className="relative flex flex-col items-center">
          {/* Globo de diálogo flotante amigable */}
          <div className="absolute -top-12 bg-white text-[#140b24] text-[11px] font-bold px-3 py-1 rounded-2xl shadow-xl border border-[#8a4dff]/40 whitespace-nowrap animate-bounce flex items-center gap-1.5">
            <span>¡Bienvenida a La Colonia!</span>
            {equippedCoffee && <span title="Tomando café">☕</span>}
          </div>

          {/* Halo luminoso alrededor de Bucky */}
          <div className="absolute inset-0 bg-[#8a4dff]/20 rounded-full blur-xl transform group-hover:scale-125 transition-all" />

          {/* Sprite de Bucky con buzo oficial Uhura */}
          <img
            src={buckyActivity === 'working' ? buckyFocusImg : buckyHoodieHappyImg}
            alt="Bucky en La Colonia"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] transform group-hover:scale-110 transition-all duration-200"
          />

          {/* Accesorios visuales dinámicos */}
          {equippedBeanie && (
            <div className="absolute top-2 left-6 text-base filter drop-shadow">🧢</div>
          )}
          {equippedGlasses && (
            <div className="absolute top-8 left-9 text-xs filter drop-shadow">👓</div>
          )}
          {equippedBackpack && (
            <div className="absolute top-10 right-4 text-xs filter drop-shadow">🎒</div>
          )}
          {equippedFireflies && (
            <div className="absolute -top-4 -right-2 text-xs animate-ping">✨</div>
          )}

          {/* Sombra de contacto de Bucky en el suelo */}
          <div className="w-16 h-3 bg-black/50 rounded-full blur-xs mt-0.5" />
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODAL RÁPIDO DE INFORMACIÓN DE ESTRUCTURA SELECCIONADA */}
      {/* ================================================================= */}
      {selectedStructure && (
        <div className="absolute top-4 left-4 z-40 bg-[#140b24]/95 border border-[#8a4dff]/60 rounded-2xl p-4 text-white max-w-xs shadow-2xl backdrop-blur-md animate-in fade-in duration-150">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedStructure.icon}</span>
              <div>
                <h4 className="text-xs font-black text-white">{selectedStructure.name}</h4>
                <span className="text-[10px] text-[#d4ff4a] font-bold">
                  {selectedStructure.unlocked ? '✓ Ensamblado en la colonia' : 'Bloqueado'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedStructure(null)}
              className="text-white/60 hover:text-white text-xs cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-white/80 mt-2 leading-relaxed">
            {selectedStructure.description}
          </p>
          {selectedStructure.tooltipAction && (
            <div className="mt-2 text-[11px] text-[#c9b7ff] bg-white/5 p-2 rounded-xl border border-white/5">
              💡 {selectedStructure.tooltipAction}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
