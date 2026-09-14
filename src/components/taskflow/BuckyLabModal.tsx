/**
 * ============================================================================
 * BUCKY LAB (CONSOLA DE DESARROLLO Y PRUEBAS INTERNAS)
 * ============================================================================
 *
 * ⚠️ DOCUMENTACIÓN DE SEGURIDAD Y PERMISOS PARA PRODUCCIÓN:
 *
 * 1. MECANISMOS TEMPORALES DE PROTOTIPO:
 *    - El parámetro de consulta '?buckyLab=true' y el atajo de teclado 'Shift + Alt + B'
 *      son MECANISMOS TEMPORALES destinados exclusivamente a la fase de prototipado
 *      y desarrollo.
 *
 * 2. PROTECCIÓN OBLIGATORIA EN PRODUCCIÓN (RBAC):
 *    - En el entorno de producción final, BuckyLabModal DEBE estar condicionado y
 *      protegido por el sistema real de autenticación y control de acceso basado
 *      en roles (RBAC) de Uhura.
 *    - Sólo usuarios con rol de Administrador o con el permiso explícito
 *      'taskflow:bucky_lab' (o flag de entorno autorizado) podrán instanciar o
 *      desplegar este modal.
 *    - En producción, los listeners de URL y teclas deben inhabilitarse o requerir
 *      la validación de la sesión autenticada del administrador antes de abrirse.
 * ============================================================================
 */

import React, { useState } from 'react';
import { X, Copy, Download, Volume2, Sparkles, AlertTriangle, ShieldCheck, Terminal } from 'lucide-react';
import buckyHoodieHappyImg from '../../assets/images/bucky_hip_uhura_v3.png';
import buckyCelebratingImg from '../../assets/images/bucky_celebrating_cutout.png';
import buckyAlertImg from '../../assets/images/bucky_alert_cutout.png';
import buckyFocusImg from '../../assets/images/bucky_focus_cutout.png';
import buckyRestingImg from '../../assets/images/bucky_resting_cutout.png';
import buckyWavingImg from '../../assets/images/bucky_waving_cutout.png';
import buckyCelebrateRenderImg from '../../assets/images/bucky_celebrate_render_1788557761452.jpg';
import buckyWarningRenderImg from '../../assets/images/bucky_warning_render_1788557774378.jpg';
import buckySadRenderImg from '../../assets/images/bucky_sad_render_1788557787368.jpg';
import orbitMascotCutoutImg from '../../assets/images/orbit_mascot_cutout.png';
import { playBuckySound, BuckyPose } from './buckyEngine';

interface BuckyLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateState?: (pose: BuckyPose, phrase: string) => void;
}

export const BuckyLabModal: React.FC<BuckyLabModalProps> = ({
  isOpen,
  onClose,
  onSimulateState
}) => {
  const [selectedPose, setSelectedPose] = useState<string>('hoodie');
  const [viewMode, setViewMode] = useState<'cutout' | 'render3d'>('cutout');
  const [copiedToast, setCopiedToast] = useState(false);

  if (!isOpen) return null;

  const getImagePath = (pose: string): string => {
    if (viewMode === 'render3d') {
      switch (pose) {
        case 'celebrate':
        case 'clap':
          return buckyCelebrateRenderImg;
        case 'alert':
        case 'warning':
          return buckyWarningRenderImg;
        case 'sad':
          return buckySadRenderImg;
        default:
          return orbitMascotCutoutImg;
      }
    }

    switch (pose) {
      case 'wave':
        return buckyWavingImg;
      case 'celebrate':
      case 'clap':
        return buckyCelebratingImg;
      case 'alert':
        return buckyAlertImg;
      case 'focus':
        return buckyFocusImg;
      case 'rest':
      case 'tired':
      case 'sleep':
        return buckyRestingImg;
      case 'hoodie':
      case 'happy':
      case 'stand':
      default:
        return buckyHoodieHappyImg;
    }
  };

  const handleCopyPng = async () => {
    try {
      const src = getImagePath(selectedPose);
      const res = await fetch(src);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    } catch {
      handleDownload();
    }
  };

  const handleDownload = () => {
    const src = getImagePath(selectedPose);
    const link = document.createElement('a');
    link.href = src;
    link.download = `bucky_${selectedPose}_${viewMode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const posesList = [
    { id: 'hoodie', name: 'Buzo Uhura Oficial', emoji: '💜', desc: 'Identidad base', sound: 'happy' as const },
    { id: 'wave', name: 'Saludo Cordial', emoji: '👋', desc: 'Primer ingreso', sound: 'wave' as const },
    { id: 'focus', name: 'Foco Profundo', emoji: '🎧', desc: 'Timer activo', sound: 'focus' as const },
    { id: 'celebrate', name: 'Celebración', emoji: '🎉', desc: 'Cierre del día', sound: 'celebrate' as const },
    { id: 'clap', name: 'Aplauso', emoji: '👏', desc: 'Tarea completada', sound: 'clap' as const },
    { id: 'alert', name: 'Alerta de Peso', emoji: '⚠️', desc: 'Desvío de horas', sound: 'alert' as const },
    { id: 'rest', name: 'Pausa Saludable', emoji: '☕', desc: 'Pausa activa', sound: 'rest' as const },
    { id: 'sleep', name: 'Descanso Zzz', emoji: '💤', desc: 'Recarga nocturna', sound: 'rest' as const },
    { id: 'yawn', name: 'Bostezo / Relajo', emoji: '🥱', desc: 'Inactividad', sound: 'yawn' as const },
    { id: 'stretch', name: 'Estiramiento', emoji: '🧘', desc: 'Ergonomía', sound: 'stretch' as const },
    { id: 'sad', name: 'Empatía Suave', emoji: '🥺', desc: 'No punitivo', sound: 'sad' as const }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#0f0a1c] border border-[#8a4dff]/40 text-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#160d2e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#8a4dff]/20 border border-[#8a4dff]/40 flex items-center justify-center text-[#d4ff4a]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Bucky Lab</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ec4899]/20 text-[#f472b6] border border-[#ec4899]/30">
                  Dev / Admin Only
                </span>
              </div>
              <p className="text-xs text-white/50">Consola interna de pruebas visuales, estados, sonidos y assets.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Top stage */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Preview Canvas */}
            <div className="md:col-span-6 bg-[#080511] rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center min-h-[280px] relative">
              {/* Asset mode toggle */}
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-[10px]">
                <button
                  onClick={() => setViewMode('cutout')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'cutout' ? 'bg-[#8a4dff] text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  PNG Cutout
                </button>
                <button
                  onClick={() => setViewMode('render3d')}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                    viewMode === 'render3d' ? 'bg-[#8a4dff] text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  3D Render
                </button>
              </div>

              <img
                src={getImagePath(selectedPose)}
                alt="Bucky Test Pose"
                className="w-48 h-56 object-contain select-none transition-transform hover:scale-105"
              />

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleCopyPng}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
                >
                  <Copy className="w-3.5 h-3.5 text-[#d4ff4a]" />
                  <span>{copiedToast ? '¡Copiado!' : 'Copiar PNG'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
                >
                  <Download className="w-3.5 h-3.5 text-[#c9b7ff]" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>

            {/* Right: Simulation Quick Triggers */}
            <div className="md:col-span-6 space-y-3">
              <span className="text-[11px] font-bold text-[#c9b7ff] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#d4ff4a]" />
                Simulador de Triggers
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    playBuckySound('alert');
                    onSimulateState?.('alert', 'Simulando: Desvío en Proyecto Landing (+2.5h)');
                  }}
                  className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-200 text-left cursor-pointer transition-colors"
                >
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    Alerta / Overtime
                  </div>
                  <div className="text-[10px] text-red-300/70 mt-0.5">Disparar estado de desvío</div>
                </button>

                <button
                  onClick={() => {
                    playBuckySound('focus');
                    onSimulateState?.('focus', 'Simulando: Cronómetro en marcha en UI Kit');
                  }}
                  className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-purple-200 text-left cursor-pointer transition-colors"
                >
                  <div className="font-bold">🎧 Foco Profundo</div>
                  <div className="text-[10px] text-purple-300/70 mt-0.5">Timer activo</div>
                </button>

                <button
                  onClick={() => {
                    playBuckySound('celebrate');
                    onSimulateState?.('celebrate', 'Simulando: Día completado con éxito');
                  }}
                  className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-200 text-left cursor-pointer transition-colors"
                >
                  <div className="font-bold">🎉 Día Completo</div>
                  <div className="text-[10px] text-emerald-300/70 mt-0.5">Todas las piezas listas</div>
                </button>

                <button
                  onClick={() => {
                    playBuckySound('clap');
                    onSimulateState?.('clap', 'Simulando: Tarea completada con aplauso');
                  }}
                  className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-200 text-left cursor-pointer transition-colors"
                >
                  <div className="font-bold">👏 Micro-aplauso</div>
                  <div className="text-[10px] text-emerald-300/70 mt-0.5">Tarea tildada</div>
                </button>

                <button
                  onClick={() => {
                    playBuckySound('rest');
                    onSimulateState?.('rest', 'Simulando: Recomendación de pausa activa');
                  }}
                  className="p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/40 text-blue-200 text-left cursor-pointer transition-colors"
                >
                  <div className="font-bold">☕ Pausa Activa</div>
                  <div className="text-[10px] text-blue-300/70 mt-0.5">Estiramiento 2 min</div>
                </button>

                <button
                  onClick={() => {
                    playBuckySound('happy');
                    onSimulateState?.('happy', 'Equilibrio restablecido con Buzo Uhura');
                  }}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-left cursor-pointer transition-colors"
                >
                  <div className="font-bold">💜 Buzo Uhura Base</div>
                  <div className="text-[10px] text-white/60 mt-0.5">Equilibrio normal</div>
                </button>
              </div>
            </div>
          </div>

          {/* Catalog grid */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-[#c9b7ff] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4ff4a]" />
              Catálogo de Poses & Sonidos Web Audio
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {posesList.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPose(p.id);
                    playBuckySound(p.sound);
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedPose === p.id
                      ? 'bg-[#8a4dff]/40 border-[#d4ff4a] text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{p.emoji}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playBuckySound(p.sound);
                      }}
                      className="p-1 text-white/40 hover:text-[#d4ff4a] cursor-pointer"
                      title="Probar sonido"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs font-bold mt-1 text-white truncate">{p.name}</div>
                  <div className="text-[10px] text-white/50">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
