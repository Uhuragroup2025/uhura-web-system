/**
 * ============================================================================
 * LA COLONIA · ESPACIO EXPERIENCIAL Y HÁBITAT DE BUCKY (ORBIT BY UHURA)
 * ============================================================================
 * 
 * Principio Fundamental:
 * "Orbit no mide compromiso por cantidad de horas trabajadas. Mide claridad
 *  operativa, cumplimiento de lo asignado y capacidad de anticipar riesgos."
 */

import React, { useState, useEffect } from 'react';
import { OrbitView, TaskItem } from '../types';
import { ColonyState, ColonyStructure, ColonyMinigameType } from './types';
import {
  loadColonyState,
  saveColonyState,
  buildStructure,
  evaluateOrbitHabitsForColony,
  rewardMinigameCompletion,
  recordEarlyRiskAlertReward
} from './coloniaEngine';
import { ColoniaDiorama } from './ColoniaDiorama';
import { ColoniaMinigames } from './ColoniaMinigames';
import { ColoniaCustomizerModal } from './ColoniaCustomizerModal';
import {
  ArrowLeft,
  Sparkles,
  Hammer,
  Gamepad2,
  Palette,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HeartHandshake,
  Info,
  CalendarCheck2
} from 'lucide-react';

interface LaColoniaViewProps {
  tasks: TaskItem[];
  loggedHoursToday: number;
  targetDayHours?: number;
  plannedHoursToday?: number;
  onNavigateToView: (view: OrbitView) => void;
}

export const LaColoniaView: React.FC<LaColoniaViewProps> = ({
  tasks,
  loggedHoursToday,
  targetDayHours = 8.0,
  plannedHoursToday = 4.0,
  onNavigateToView
}) => {
  const [colonyState, setColonyState] = useState<ColonyState>(loadColonyState);
  const [activeMinigame, setActiveMinigame] = useState<ColonyMinigameType | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [buckyActivity, setBuckyActivity] = useState<'idle' | 'walking' | 'working' | 'resting'>('working');

  // Evaluar hábitos de Orbit al montar
  useEffect(() => {
    const { updatedState, newEvents } = evaluateOrbitHabitsForColony(
      colonyState,
      tasks,
      loggedHoursToday,
      plannedHoursToday
    );
    if (newEvents.length > 0) {
      setColonyState(updatedState);
      showToast(`Hábitos reconocidos en La Colonia: +${newEvents[0].amount} ${newEvents[0].rewardType === 'wood' ? '🪵' : '⚡'}`);
    }
  }, [tasks, loggedHoursToday, plannedHoursToday]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Encontrar la próxima estructura por construir
  const nextStructureToBuild = colonyState.structures.find(s => !s.unlocked);

  // Manejador de construcción
  const handleBuild = (structureId: string) => {
    const result = buildStructure(colonyState, structureId);
    if (result.success) {
      setColonyState(result.state);
      setBuckyActivity('working');
      showToast(result.message);
    } else {
      showToast(result.message);
    }
  };

  // Manejador de minijuego
  const handleCompleteMinigame = (type: ColonyMinigameType) => {
    const updated = rewardMinigameCompletion(colonyState, type);
    setColonyState(updated);
    setActiveMinigame(null);
    setBuckyActivity('resting');
    showToast('¡Pausa de bienestar completada! Bucky y tu hábitat descansaron 🌿');
  };

  // Manejador de personalización
  const handleToggleEquip = (id: string) => {
    const updatedAccessories = colonyState.accessories.map(a =>
      a.id === id ? { ...a, equipped: !a.equipped } : a
    );
    const updated = { ...colonyState, accessories: updatedAccessories };
    setColonyState(updated);
    saveColonyState(updated);
  };

  const handleUnlockAccessory = (id: string) => {
    const target = colonyState.accessories.find(a => a.id === id);
    if (!target) return;

    const { wood = 0, energy = 0, orbs = 0 } = target.cost;
    const { resources } = colonyState;

    if (resources.wood >= wood && resources.energy >= energy && resources.orbs >= orbs) {
      const updatedResources = {
        wood: resources.wood - wood,
        energy: resources.energy - energy,
        orbs: resources.orbs - orbs
      };
      const updatedAccessories = colonyState.accessories.map(a =>
        a.id === id ? { ...a, unlocked: true, equipped: true } : a
      );
      const updated = {
        ...colonyState,
        resources: updatedResources,
        accessories: updatedAccessories
      };
      setColonyState(updated);
      saveColonyState(updated);
      showToast(`¡${target.name} desbloqueado para Bucky! ✨`);
    } else {
      showToast('Recursos insuficientes para este accesorio.');
    }
  };

  // Simulación de prevención de desvío para ver el impacto real de un Orbe ✨
  const handleTriggerRiskSimulation = () => {
    const updated = recordEarlyRiskAlertReward(colonyState, 'Revisión de entrega');
    setColonyState(updated);
    showToast('¡Alerta preventiva de riesgo reconocida! +1 Orbe de Claridad ✨');
  };

  // Capacidad libre disponible calculada (información pura de gestión)
  const availableCapacityHours = Math.max(0, targetDayHours - loggedHoursToday);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200 text-white">
      {/* Toast flotante */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#140b24] border border-[#d4ff4a] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-[#d4ff4a] shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* 1. HEADER DE LA COLONIA CON REGRESO RÁPIDO A ORBIT */}
      {/* ================================================================= */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#1c0e38] via-[#140b24] to-[#0f071c] border border-[#8a4dff]/40 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToView('mi-dia')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer border border-white/10"
              title="Regresar a la operación diaria de Orbit"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Orbit</span>
            </button>
            <span className="px-2.5 py-0.5 rounded-full bg-[#501f92] text-[#d4ff4a] text-[11px] font-black tracking-wider uppercase border border-[#8a4dff]/50">
              La Colonia · Nivel {colonyState.level}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>El Hábitat Ribereño de Bucky</span>
            <span className="text-2xl">🦫🪵</span>
          </h1>
          <p className="text-xs text-[#c9b7ff] max-w-xl">
            Tus buenos hábitos de orden, cumplimiento de lo asignado y prevención temprana de riesgos hacen florecer la colonia.
          </p>
        </div>

        {/* HUD DE RECURSOS (MADERA, ENERGÍA, ORBES) */}
        <div className="flex items-center gap-3 bg-[#0d0718] p-2 sm:p-2.5 rounded-2xl border border-white/10 shadow-inner">
          {/* 🪵 Madera Fina */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#fdba74]/50 transition-colors"
            title="Madera Fina: Otorgada por higiene y certeza en tareas asignadas con avance claro."
          >
            <span className="text-xl">🪵</span>
            <div>
              <div className="text-xs font-mono font-black text-[#fdba74]">
                {colonyState.resources.wood}
              </div>
              <div className="text-[9px] text-white/50 font-bold uppercase">Madera</div>
            </div>
          </div>

          {/* ⚡ Energía Vital */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#93c5fd]/50 transition-colors"
            title="Energía Vital: Otorgada al cumplir el plan asignado para el día (sin importar si fueron 3h, 4h u 8h)."
          >
            <span className="text-xl">⚡</span>
            <div>
              <div className="text-xs font-mono font-black text-[#93c5fd]">
                {colonyState.resources.energy}
              </div>
              <div className="text-[9px] text-white/50 font-bold uppercase">Energía</div>
            </div>
          </div>

          {/* ✨ Orbes de Claridad */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#d4ff4a]/50 transition-colors"
            title="Orbes de Claridad: Otorgados por anticipar y alertar desvíos/riesgos antes del vencimiento."
          >
            <span className="text-xl">✨</span>
            <div>
              <div className="text-xs font-mono font-black text-[#d4ff4a]">
                {colonyState.resources.orbs}
              </div>
              <div className="text-[9px] text-white/50 font-bold uppercase">Orbes</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. CARD DE CLARIDAD OPERATIVA: PLAN CUMPLIDO + CAPACIDAD LIBRE */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cumplimiento de lo Planificado */}
        <div className="p-4 rounded-2xl bg-[#140b24] border border-[#8a4dff]/30 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#501f92]/40 border border-[#8a4dff]/40 flex items-center justify-center text-[#d4ff4a] shrink-0">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white">Plan de Hoy Cumplido</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#4ade80]/20 text-[#4ade80]">
                100%
              </span>
            </div>
            <p className="text-[11px] text-[#c9b7ff]">
              {loggedHoursToday.toFixed(1)}h ejecutadas de {plannedHoursToday.toFixed(1)}h planificadas.
            </p>
          </div>
        </div>

        {/* Capacidad Libre Disponible (celebrada, nunca penalizada) */}
        <div className="p-4 rounded-2xl bg-[#140b24] border border-[#4ade80]/40 flex items-center justify-between gap-3.5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center text-[#4ade80] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white">Capacidad Disponible</h3>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#4ade80] text-[#140b24]">
                  {availableCapacityHours.toFixed(1)}h Libres
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Visible para líderes y directores para asignar nuevos proyectos.
              </p>
            </div>
          </div>
        </div>

        {/* Prevención de Riesgo Rápida (Simular Alerta de Desvío) */}
        <div className="p-4 rounded-2xl bg-[#140b24] border border-[#d4ff4a]/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4ff4a]/10 border border-[#d4ff4a]/30 flex items-center justify-center text-[#d4ff4a] shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Prevención Temprana</h3>
              <p className="text-[11px] text-[#c9b7ff]">
                Avisar un desvío a tiempo genera Orbes de Claridad ✨
              </p>
            </div>
          </div>
          <button
            onClick={handleTriggerRiskSimulation}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-[#d4ff4a] hover:text-[#140b24] text-xs font-bold text-white transition-all cursor-pointer border border-white/10 shrink-0"
            title="Simular aviso preventivo de desvío"
          >
            +1 ✨
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. DIORAMA CENTRAL VIVO */}
      {/* ================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#c9b7ff] uppercase tracking-wider">
              Diorama Ribereño Isométrico
            </span>
            <span className="text-[10px] text-white/40">· Haz clic en Bucky o las estructuras</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#501f92]/50 hover:bg-[#501f92] text-white text-xs font-bold border border-[#8a4dff]/40 transition-colors cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-[#d4ff4a]" />
              <span>Personalizar a Bucky</span>
            </button>
          </div>
        </div>

        {/* Lienzo interactivo del Diorama */}
        <ColoniaDiorama
          structures={colonyState.structures}
          accessories={colonyState.accessories}
          onSelectStructureToBuild={handleBuild}
          onBuckyClick={() => {
            setBuckyActivity('resting');
            showToast('Bucky: "¡Gran trabajo cuidando la claridad del equipo hoy! 🦫☕"');
          }}
          buckyActivity={buckyActivity}
        />
      </div>

      {/* ================================================================= */}
      {/* 4. MÓDULO INFERIOR: PRÓXIMO ENSAMBLE + MINIJUEGOS + BITÁCORA */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TARJETA 1: PRÓXIMO ENSAMBLE DESBLOQUEABLE */}
        <div className="p-5 rounded-3xl bg-[#140b24] border border-[#8a4dff]/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔨</span>
              <h3 className="text-sm font-black text-white">Próximo Ensamble</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-[#d4ff4a]">
              Hábitat
            </span>
          </div>

          {nextStructureToBuild ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{nextStructureToBuild.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{nextStructureToBuild.name}</h4>
                    <span className="text-[10px] text-[#c9b7ff]">
                      Nivel {nextStructureToBuild.level} · {nextStructureToBuild.category}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  {nextStructureToBuild.description}
                </p>

                {/* Costo */}
                <div className="flex items-center gap-3 pt-1 text-xs font-mono font-bold">
                  {nextStructureToBuild.cost.wood > 0 && (
                    <span className={colonyState.resources.wood >= nextStructureToBuild.cost.wood ? 'text-[#fdba74]' : 'text-red-400'}>
                      🪵 {nextStructureToBuild.cost.wood}
                    </span>
                  )}
                  {nextStructureToBuild.cost.energy > 0 && (
                    <span className={colonyState.resources.energy >= nextStructureToBuild.cost.energy ? 'text-[#93c5fd]' : 'text-red-400'}>
                      ⚡ {nextStructureToBuild.cost.energy}
                    </span>
                  )}
                  {nextStructureToBuild.cost.orbs > 0 && (
                    <span className={colonyState.resources.orbs >= nextStructureToBuild.cost.orbs ? 'text-[#d4ff4a]' : 'text-red-400'}>
                      ✨ {nextStructureToBuild.cost.orbs}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleBuild(nextStructureToBuild.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#501f92] to-[#8a4dff] hover:from-[#43197a] hover:to-[#7c3aed] text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <Hammer className="w-4 h-4 text-[#d4ff4a]" />
                <span>Ensamblar en La Colonia</span>
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#d4ff4a] font-bold">
              🎉 ¡Todas las estructuras actuales han sido ensambladas!
            </div>
          )}
        </div>

        {/* TARJETA 2: MICRO-PAUSAS ACTIVAS (MINIJUEGOS 15s EN EQUIPO) */}
        <div className="p-5 rounded-3xl bg-[#140b24] border border-[#8a4dff]/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎮</span>
              <h3 className="text-sm font-black text-white">Retos Relámpago de Equipo</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4ff4a]/20 text-[#d4ff4a] border border-[#d4ff4a]/30">
              ⚡ 15 segundos
            </span>
          </div>

          <p className="text-xs text-white/70">
            Juegos ultrarrápidos con 1 sola regla. Juega, mira el ranking real de Uhura y reta a tus compañeros:
          </p>

          <div className="space-y-2">
            {/* Minijuego 1: El Río Rápido */}
            <button
              onClick={() => setActiveMinigame('vado')}
              className="w-full p-3 rounded-2xl bg-white/5 hover:bg-[#501f92]/40 border border-white/10 hover:border-[#d4ff4a] text-left transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🪵</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#d4ff4a] transition-colors">
                      El Río Rápido de Bucky
                    </h4>
                    <span className="text-[9px] font-mono font-bold text-[#d4ff4a]">15s</span>
                  </div>
                  <p className="text-[10px] text-[#c9b7ff]">Toca troncos y orbes que flotan en el río. Récord: Catalina (19 pts).</p>
                </div>
              </div>
              <span className="text-xs text-white/40 group-hover:text-white">→</span>
            </button>

            {/* Minijuego 2: La Torre de Cedro */}
            <button
              onClick={() => setActiveMinigame('respiracion')}
              className="w-full p-3 rounded-2xl bg-white/5 hover:bg-[#501f92]/40 border border-white/10 hover:border-[#d4ff4a] text-left transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌿</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#d4ff4a] transition-colors">
                      La Torre de Cedro
                    </h4>
                    <span className="text-[9px] font-mono font-bold text-[#d4ff4a]">15s</span>
                  </div>
                  <p className="text-[10px] text-[#c9b7ff]">Apila troncos en movimiento justo a tiempo. Récord: Diego (120 pts).</p>
                </div>
              </div>
              <span className="text-xs text-white/40 group-hover:text-white">→</span>
            </button>

            {/* Minijuego 3: Reflejos de Nenúfar */}
            <button
              onClick={() => setActiveMinigame('clasificador')}
              className="w-full p-3 rounded-2xl bg-white/5 hover:bg-[#501f92]/40 border border-white/10 hover:border-[#d4ff4a] text-left transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#d4ff4a] transition-colors">
                      Reflejos de Nenúfar
                    </h4>
                    <span className="text-[9px] font-mono font-bold text-[#d4ff4a]">15s</span>
                  </div>
                  <p className="text-[10px] text-[#c9b7ff]">Toca la hoja donde aparece Bucky antes de 1s. Récord: Laura (22 pts).</p>
                </div>
              </div>
              <span className="text-xs text-white/40 group-hover:text-white">→</span>
            </button>
          </div>
        </div>

        {/* TARJETA 3: BITÁCORA DE HÁBITOS SALUDABLES EN ORBIT */}
        <div className="p-5 rounded-3xl bg-[#140b24] border border-[#8a4dff]/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📜</span>
              <h3 className="text-sm font-black text-white">Bitácora de Hábitos</h3>
            </div>
            <span className="text-[10px] font-bold text-[#c9b7ff]/80">Eventos Reales</span>
          </div>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {colonyState.history.slice(0, 5).map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{ev.title}</span>
                  <span className="text-[10px] font-mono text-[#d4ff4a] font-bold">
                    {ev.rewardType === 'wood' ? `+${ev.amount} 🪵` : ev.rewardType === 'energy' ? `+${ev.amount} ⚡` : `+${ev.amount} ✨`}
                  </span>
                </div>
                <p className="text-[11px] text-white/70">{ev.description}</p>
                <span className="text-[9px] text-white/40 block">{ev.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODALES DE MINIJUEGOS Y PERSONALIZACIÓN */}
      {/* ================================================================= */}
      <ColoniaMinigames
        type={activeMinigame}
        onClose={() => setActiveMinigame(null)}
        onComplete={handleCompleteMinigame}
      />

      <ColoniaCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        accessories={colonyState.accessories}
        resources={colonyState.resources}
        onToggleEquip={handleToggleEquip}
        onUnlockAccessory={handleUnlockAccessory}
      />
    </div>
  );
};
