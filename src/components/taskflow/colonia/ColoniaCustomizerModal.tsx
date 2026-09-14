/**
 * ============================================================================
 * COLONIA CUSTOMIZER MODAL · PERSONALIZACIÓN RESPETUOSA DE BUCKY
 * ============================================================================
 */

import React from 'react';
import { BuckyAccessory, ColonyResources } from './types';
import { X, Check, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import buckyHoodieHappyImg from '../../../assets/images/bucky_hip_uhura_v3.png';

interface ColoniaCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessories: BuckyAccessory[];
  resources: ColonyResources;
  onToggleEquip: (id: string) => void;
  onUnlockAccessory: (id: string) => void;
}

export const ColoniaCustomizerModal: React.FC<ColoniaCustomizerModalProps> = ({
  isOpen,
  onClose,
  accessories,
  resources,
  onToggleEquip,
  onUnlockAccessory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#140b24] border border-[#8a4dff]/50 rounded-3xl p-6 sm:p-7 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <h3 className="text-base font-black text-white">
                Personalización de Bucky · La Colonia
              </h3>
              <p className="text-xs text-[#c9b7ff]">
                Accesorios y herramientas de carpintería y órbita. Buzo oficial Uhura siempre presente.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview y Recursos */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-gradient-to-r from-[#1b0e36] to-[#251342] border border-[#8a4dff]/20">
          {/* Avatar de Bucky con preview */}
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-[#8a4dff]/20 rounded-full blur-lg" />
            <img
              src={buckyHoodieHappyImg}
              alt="Bucky Uhura"
              className="w-24 h-24 object-contain filter drop-shadow-lg"
            />
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-bold text-[#d4ff4a] uppercase tracking-wider">
                Guardarropa Oficial
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#501f92] text-white text-[10px] font-bold">
                Uhura Safe
              </span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Equipa herramientas ganadas con tus hábitos de orden y anticipación de riesgo en Orbit.
            </p>
            {/* Saldo de recursos */}
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs font-mono font-bold">
              <span className="text-[#fdba74]">🪵 {resources.wood}</span>
              <span className="text-[#93c5fd]">⚡ {resources.energy}</span>
              <span className="text-[#d4ff4a]">✨ {resources.orbs}</span>
            </div>
          </div>
        </div>

        {/* Lista de Accesorios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
          {accessories.map((acc) => {
            const canAfford =
              (!acc.cost.wood || resources.wood >= acc.cost.wood) &&
              (!acc.cost.energy || resources.energy >= acc.cost.energy) &&
              (!acc.cost.orbs || resources.orbs >= acc.cost.orbs);

            return (
              <div
                key={acc.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  acc.equipped
                    ? 'bg-[#501f92]/40 border-[#d4ff4a] shadow-sm'
                    : acc.unlocked
                    ? 'bg-white/5 border-white/10 hover:border-white/20'
                    : 'bg-black/20 border-white/5 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-white/5">{acc.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{acc.name}</h4>
                    <p className="text-[10px] text-[#c9b7ff]/80 line-clamp-1">{acc.description}</p>
                    {/* Costo si está bloqueado */}
                    {!acc.unlocked && (
                      <div className="text-[10px] font-mono text-[#d4ff4a] mt-0.5">
                        {acc.cost.wood ? `${acc.cost.wood}🪵 ` : ''}
                        {acc.cost.energy ? `${acc.cost.energy}⚡ ` : ''}
                        {acc.cost.orbs ? `${acc.cost.orbs}✨` : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div>
                  {acc.unlocked ? (
                    <button
                      onClick={() => onToggleEquip(acc.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        acc.equipped
                          ? 'bg-[#d4ff4a] text-[#140b24] shadow-xs'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {acc.equipped ? 'Equipado' : 'Equipar'}
                    </button>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => onUnlockAccessory(acc.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        canAfford
                          ? 'bg-[#8a4dff] text-white hover:bg-[#7c3aed] cursor-pointer'
                          : 'bg-white/5 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      <span>Desbloquear</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#c9b7ff]/70">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#d4ff4a]" />
            <span>Los recursos provienen exclusivamente de tu orden en Orbit.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 font-bold cursor-pointer transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
