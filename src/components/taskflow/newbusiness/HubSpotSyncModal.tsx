import React, { useState } from 'react';
import {
  ServiceCommercialItem,
  HubSpotDealStage
} from '../types';
import { HUBSPOT_STAGES, HUBSPOT_PIPELINE_NAME } from './hubspotSimulatedData';
import { formatCurrency } from '../../../utils/formatters';
import {
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sliders,
  Check,
  Building2,
  TrendingUp,
  FileCheck2,
  XCircle
} from 'lucide-react';

interface HubSpotSyncModalProps {
  isOpen: boolean;
  services: ServiceCommercialItem[];
  clientName: string;
  currency: 'COP' | 'USD';
  onClose: () => void;
  onApplySync: (updatedServices: ServiceCommercialItem[]) => void;
}

export const HubSpotSyncModal: React.FC<HubSpotSyncModalProps> = ({
  isOpen,
  services,
  clientName,
  currency,
  onClose,
  onApplySync
}) => {
  if (!isOpen) return null;

  // Local draft of stages being simulated from HubSpot
  const [stageDrafts, setStageDrafts] = useState<Record<string, HubSpotDealStage>>(() => {
    const init: Record<string, HubSpotDealStage> = {};
    services.forEach((s) => {
      init[s.serviceId] = s.hubspotDealStage || 'Presentación a cliente';
    });
    return init;
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleStageChange = (serviceId: string, stage: HubSpotDealStage) => {
    setStageDrafts((prev) => ({
      ...prev,
      [serviceId]: stage
    }));
  };

  const handleConfirmSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const nowIso = new Date().toISOString();
      const updated = services.map((s) => {
        const nextStage = stageDrafts[s.serviceId] || s.hubspotDealStage || 'Presentación a cliente';
        const isApproved = nextStage === 'Cierre ganado' || nextStage === 'Enviado para facturar';

        return {
          ...s,
          hubspotDealStage: nextStage,
          hubspotLastSyncedAt: nowIso,
          approved: isApproved
        };
      });

      onApplySync(updated);
      setIsSyncing(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#1c1917] via-[#292524] to-[#431407] text-white flex items-center justify-between border-b border-[#ff5c35]/30">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#ff5c35]/20 text-[#fed7aa] border border-[#ff5c35]/40">
              <RefreshCw className="w-5 h-5 text-[#ea580c]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">Sincronizar con HubSpot</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ff5c35]/20 text-[#fed7aa] border border-[#ff5c35]/30">
                  CRM Source of Truth
                </span>
              </div>
              <p className="text-xs text-white/75">
                Concilia y actualiza las etapas comerciales de cada negocio independiente en HubSpot
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#0f172a]">
          {/* Lista de negocios en HubSpot */}
          <div className="space-y-3">
            {services.map((svc, idx) => {
              const currentStage = stageDrafts[svc.serviceId] || svc.hubspotDealStage || 'Presentación a cliente';
              const isWon = currentStage === 'Cierre ganado';
              const isBilling = currentStage === 'Enviado para facturar';
              const isLost = currentStage === 'Cierre perdido';
              const isPresenting = currentStage === 'Presentación a cliente';

              return (
                <div
                  key={svc.serviceId}
                  className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#ff5c35]/15 text-[#ea580c] font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <strong className="text-xs text-[#0f172a] block">
                          {svc.hubspotDealName || `${svc.serviceName} — ${clientName}`}
                        </strong>
                        <span className="text-[10px] text-[#64748b] font-mono">
                          ID HubSpot: {svc.hubspotDealId || 'Pendiente de sincronizar'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-[#0f172a] block">
                        {formatCurrency(
                          svc.modality === 'fixed_project'
                            ? svc.totalValue || 0
                            : (svc.monthlyValue || 0) * (svc.monthsDuration || 1),
                          currency
                        )}
                      </span>
                      <span className="text-[10px] text-[#64748b]">
                        {svc.modality === 'fixed_project' ? 'Proyecto único' : `Fee mensual (${svc.monthsDuration || 0}m)`}
                      </span>
                    </div>
                  </div>

                  {/* Selector de etapa en HubSpot */}
                  <div className="space-y-1.5 pt-2 border-t border-[#f1f5f9]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#475569]">
                        Etapa reportada por HubSpot:
                      </span>
                      <span
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                          isWon
                            ? 'bg-[#059669]/10 text-[#047857] border-[#a7f3d0]'
                            : isBilling
                            ? 'bg-[#3b82f6]/10 text-[#1d4ed8] border-[#bfdbfe]'
                            : isLost
                            ? 'bg-[#dc2626]/10 text-[#dc2626] border-[#fecaca]'
                            : 'bg-[#501f92]/10 text-[#501f92] border-[#d8b4fe]'
                        }`}
                      >
                        {currentStage}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {HUBSPOT_STAGES.map((s) => {
                        const isSelected = currentStage === s.stage;
                        return (
                          <button
                            type="button"
                            key={s.stage}
                            onClick={() => handleStageChange(svc.serviceId, s.stage)}
                            className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              isSelected
                                ? 'bg-[#ff5c35]/10 border-[#ff5c35] text-[#c2410c] shadow-2xs'
                                : 'bg-white border-[#cbd5e1] text-[#64748b] hover:bg-[#fafaf9]'
                            }`}
                          >
                            <span>{s.stage}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explicación de impacto operativo según regla de negocio */}
                    <div className="text-[10.5px] leading-relaxed pt-1">
                      {isWon && (
                        <p className="text-[#059669] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Servicio formalmente aprobado. Creará 1 proyecto independiente al convertir.</span>
                        </p>
                      )}
                      {isBilling && (
                        <p className="text-[#1d4ed8] font-semibold flex items-center gap-1">
                          <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Servicio aprobado y enviado para facturar. No bloquea el proyecto operativo.</span>
                        </p>
                      )}
                      {isLost && (
                        <p className="text-[#dc2626] font-semibold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Servicio no aprobado por el cliente. No se creará proyecto para este servicio.</span>
                        </p>
                      )}
                      {isPresenting && (
                        <p className="text-[#64748b] italic">
                          En negociación comercial. Debe pasar a Ganado o Enviado para facturar antes de convertir.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#64748b] hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSyncing}
            onClick={handleConfirmSync}
            className="px-6 py-2.5 rounded-xl bg-[#ff5c35] hover:bg-[#ea580c] text-white text-xs font-bold shadow-md shadow-[#ff5c35]/20 transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.01]"
          >
            <RefreshCw className={`w-4 h-4 text-white ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sincronizar cambios a Orbit →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
