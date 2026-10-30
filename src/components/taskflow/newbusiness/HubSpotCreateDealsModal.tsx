import React from 'react';
import {
  NewBusinessOpportunity,
  QuoteProposal,
  ServiceCommercialItem,
  UserItem
} from '../types';
import { HUBSPOT_PIPELINE_NAME, generateSimulatedDealId } from './hubspotSimulatedData';
import { formatCurrency } from '../../../utils/formatters';
import {
  CheckCircle2,
  X,
  Building2,
  User,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Info
} from 'lucide-react';

interface HubSpotCreateDealsModalProps {
  isOpen: boolean;
  opportunity: NewBusinessOpportunity;
  activeQuote: QuoteProposal;
  commercialServices: ServiceCommercialItem[];
  currency: 'COP' | 'USD';
  onClose: () => void;
  onConfirmCreateDeals: (updatedServices: ServiceCommercialItem[]) => void;
}

export const HubSpotCreateDealsModal: React.FC<HubSpotCreateDealsModalProps> = ({
  isOpen,
  opportunity,
  activeQuote,
  commercialServices,
  currency,
  onClose,
  onConfirmCreateDeals
}) => {
  if (!isOpen) return null;

  const clientName = opportunity.prospectAccountName || 'Cliente';
  const companyId = opportunity.hubspotCompanyId || 'hs-comp-default';
  const contactId = opportunity.hubspotContactId || 'hs-cnt-default';
  const contactName = opportunity.contactName || 'Contacto Comercial';
  const commercialOwnerName = opportunity.commercialOwner || 'Comercial Asignado';

  // Analizar cuáles servicios ya tienen deal creado vs cuáles son nuevos
  const servicesSummary = commercialServices.map((svc) => {
    const isExisting = Boolean(svc.hubspotDealId);
    const suggestedName = svc.hubspotDealName || `${svc.serviceName} — ${clientName}`;
    const serviceValue =
      svc.modality === 'fixed_project'
        ? svc.totalValue || 0
        : (svc.monthlyValue || 0) * (svc.monthsDuration || 1);

    return {
      service: svc,
      isExisting,
      dealName: suggestedName,
      dealValue: serviceValue,
      modality: svc.modality,
      existingDealId: svc.hubspotDealId
    };
  });

  const newDealsCount = servicesSummary.filter((s) => !s.isExisting).length;
  const existingDealsCount = servicesSummary.filter((s) => s.isExisting).length;

  const handleConfirm = () => {
    const nowIso = new Date().toISOString();
    const updatedServices: ServiceCommercialItem[] = commercialServices.map((svc) => {
      const summary = servicesSummary.find((s) => s.service.serviceId === svc.serviceId);
      const dealId = svc.hubspotDealId || generateSimulatedDealId(svc.serviceName);
      const dealName = svc.hubspotDealName || `${svc.serviceName} — ${clientName}`;

      return {
        ...svc,
        hubspotDealId: dealId,
        hubspotDealName: dealName,
        hubspotDealStage: svc.hubspotDealStage || 'Presentación a cliente',
        hubspotLastSyncedAt: nowIso,
        hubspotSyncedValue: summary?.dealValue || 0,
        hubspotSyncedCurrency: currency,
        // Si ya estaba aprobado o en stage ganado, conservarlo
        approved: svc.hubspotDealStage === 'Cierre ganado' || svc.hubspotDealStage === 'Enviado para facturar'
      };
    });

    onConfirmCreateDeals(updatedServices);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header con branding HubSpot */}
        <div className="p-5 bg-gradient-to-r from-[#1c1917] via-[#292524] to-[#431407] text-white flex items-center justify-between border-b border-[#ff5c35]/30">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#ff5c35]/20 text-[#fed7aa] border border-[#ff5c35]/40">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5c35] inline-block animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">Crear negocios en HubSpot</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ff5c35]/20 text-[#fed7aa] border border-[#ff5c35]/30">
                  Regla 1:1
                </span>
              </div>
              <p className="text-xs text-white/75">
                1 servicio en Orbit = 1 negocio en HubSpot. Se sincronizarán {commercialServices.length} negocio(s) independiente(s).
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

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#0f172a]">
          {/* Metadatos generales que se asociarán a cada negocio */}
          <div className="p-3.5 rounded-2xl bg-[#fafaf9] border border-[#e7e5e4] space-y-2">
            <span className="text-[10.5px] uppercase font-bold tracking-wider text-[#78716c] block">
              Datos comerciales comunes en HubSpot
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-[#78716c] block">Empresa asociada:</span>
                <strong className="text-[#0f172a] font-bold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#ea580c]" />
                  <span>{clientName}</span>
                </strong>
                <span className="text-[10px] text-[#a8a29e] font-mono">ID: {companyId}</span>
              </div>

              <div>
                <span className="text-[11px] text-[#78716c] block">Contacto asociado:</span>
                <strong className="text-[#0f172a] font-bold flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#ea580c]" />
                  <span>{contactName}</span>
                </strong>
                <span className="text-[10px] text-[#a8a29e] font-mono">ID: {contactId}</span>
              </div>

              <div>
                <span className="text-[11px] text-[#78716c] block">Pipeline & Etapa:</span>
                <strong className="text-[#0f172a] font-bold">{HUBSPOT_PIPELINE_NAME}</strong>
                <span className="text-[10px] text-[#16a34a] font-semibold block">
                  Etapa inicial: Presentación a cliente
                </span>
              </div>
            </div>
          </div>

          {/* Advertencia explicativa de boundaries: datos que NO se envían a HubSpot */}
          <div className="p-3 rounded-xl bg-[#fff7ed] border border-[#ffedd5] text-[#9a3412] text-[11px] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#ea580c] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Privacidad y separación de datos:</strong> El enlace único de la calculadora de Orbit, las semanas de alcance, la vigencia del fee y las notas comerciales pertenecen exclusivamente a Orbit y <u>no</u> se envían a HubSpot. En HubSpot únicamente se registra el nombre del negocio, empresa, contacto, valor, moneda, pipeline y etapa.
            </div>
          </div>

          {/* Lista de negocios que se crearán / actualizarán */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0f172a]">
                Negocios a crear en HubSpot ({commercialServices.length}):
              </span>
              <span className="text-[10px] font-semibold text-[#64748b]">
                {newDealsCount} nuevo(s) · {existingDealsCount} ya existente(s)
              </span>
            </div>

            <div className="space-y-2.5">
              {servicesSummary.map((item, idx) => {
                const isFixed = item.modality === 'fixed_project';
                return (
                  <div
                    key={item.service.serviceId}
                    className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#ff5c35]/15 text-[#ea580c] font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <strong className="text-xs text-[#0f172a] block">
                            {item.dealName}
                          </strong>
                          <span className="text-[10.5px] text-[#64748b]">
                            Servicio base en Orbit: {item.service.serviceName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-[#0f172a] block">
                          {formatCurrency(item.dealValue, currency)}
                        </span>
                        <span className="text-[10px] text-[#64748b]">
                          {isFixed ? 'Valor total único' : `Fee mensual (${item.service.monthsDuration || 0} meses)`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9] text-[10.5px] text-[#64748b]">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold ${
                            isFixed
                              ? 'bg-[#501f92]/10 text-[#501f92]'
                              : 'bg-[#059669]/10 text-[#047857]'
                          }`}
                        >
                          Contexto Orbit: {isFixed ? 'Proyecto único' : 'Fee mensual'}
                        </span>
                        <span className="italic text-[#94a3b8]">
                          (Modalidad interna no enviada a HubSpot)
                        </span>
                      </div>

                      {item.isExisting ? (
                        <span className="font-bold text-[#16a34a] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ya vinculado: {item.existingDealId}</span>
                        </span>
                      ) : (
                        <span className="font-bold text-[#ea580c] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Se creará nuevo negocio</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold shadow-md shadow-[#ea580c]/20 transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.01]"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Confirmar y sincronizar con HubSpot →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
