import React, { useState, useMemo, useEffect } from 'react';
import {
  NewBusinessOpportunity,
  QuoteProposal,
  ProjectType,
  UserItem,
  ClientProfile,
  ServiceCommercialItem,
  QuoteDeliverable
} from '../types';
import { isEligibleTeamMember } from './teamCandidates';
import { formatCurrency } from '../../../utils/formatters';
import {
  CheckCircle2,
  X,
  Building2,
  Calendar,
  Sparkles,
  FolderOpen,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export interface ConvertedProjectPlan {
  serviceId: string;
  serviceName: string;
  projectName: string;
  projectType: ProjectType;
  hubspotDealId?: string | null;
  hubspotDealStage?: string;
  soldValue?: number;
  soldMonthlyValue?: number;
  monthsDuration?: number;
  deliverableIds: string[];
}

export interface ConvertOpportunityPayload {
  projects: ConvertedProjectPlan[];
  leadUserId: string;
  leadUserIds?: string[];
  leadName: string;
  specialistUserIds?: string[];
  startDate: string;
  endDate?: string;
  initialFormalizationStatus?: 'pendiente_formalizacion' | 'activo';
  startConditionsConfig?: any;

  // Legacy fallback compatibility
  projectName: string;
  projectType: ProjectType;
  approvedServiceIds: string[];
  isMixed: boolean;
  fixedProjectName?: string;
  feeProjectName?: string;
}

interface ConvertOpportunityModalProps {
  isOpen: boolean;
  opportunity: NewBusinessOpportunity;
  activeQuote: QuoteProposal;
  users?: UserItem[];
  clients?: ClientProfile[];
  onClose: () => void;
  onConfirm: (payload: ConvertOpportunityPayload) => void;
}

export const ConvertOpportunityModal: React.FC<ConvertOpportunityModalProps> = ({
  isOpen,
  opportunity,
  activeQuote,
  users: teamUsers = [],
  clients = [],
  onClose,
  onConfirm
}) => {
  const users = teamUsers.filter(isEligibleTeamMember);

  // Cliente en cartera vs nuevo cliente
  const matchedExistingClient = useMemo(() => {
    if (!clients || clients.length === 0) return null;
    if (opportunity.clientId) {
      return clients.find((c) => c.id === opportunity.clientId) || null;
    }
    return null;
  }, [clients, opportunity]);

  const clientName = matchedExistingClient
    ? matchedExistingClient.name
    : opportunity.prospectAccountName || 'Cliente';

  // Obtener servicios comerciales de la cotización
  const allServices: ServiceCommercialItem[] = useMemo(() => {
    if (activeQuote.commercialStructure && activeQuote.commercialStructure.length > 0) {
      return activeQuote.commercialStructure;
    }
    return activeQuote.deliverables.map((d) => ({
      serviceId: d.id,
      serviceName: d.name,
      modality: (opportunity.projectType || 'fixed_project') as 'fixed_project' | 'fee_monthly',
      weeksRef: activeQuote.estimatedWeeks || 0,
      totalValue: activeQuote.totalQuotedValue || 0,
      deliverableIds: [d.id]
    }));
  }, [activeQuote, opportunity.projectType]);

  // Regla HubSpot: Solo los servicios en 'Cierre ganado' o 'Enviado para facturar'
  // (o approved: true si se validó previamente) se aprueban para conversión.
  // Los servicios en 'Cierre perdido' son expresamente excluidos.
  const wonServices = useMemo(() => {
    const won = allServices.filter((s) => {
      if (s.hubspotDealStage === 'Cierre perdido') return false;
      if (s.hubspotDealStage === 'Cierre ganado' || s.hubspotDealStage === 'Enviado para facturar') return true;
      return s.approved === true;
    });

    // Si ninguno está explícitamente ganado aún pero el usuario abrió el modal de conversión,
    // mostrar todos los no perdidos
    if (won.length === 0) {
      return allServices.filter((s) => s.hubspotDealStage !== 'Cierre perdido');
    }
    return won;
  }, [allServices]);

  const lostServices = useMemo(() => {
    return allServices.filter((s) => s.hubspotDealStage === 'Cierre perdido');
  }, [allServices]);

  // Mapear cada servicio a sus entregables correspondientes en activeQuote
  const getDeliverablesForService = (service: ServiceCommercialItem): QuoteDeliverable[] => {
    if (service.deliverableIds && service.deliverableIds.length > 0) {
      const matched = activeQuote.deliverables.filter((d) => service.deliverableIds?.includes(d.id));
      if (matched.length > 0) return matched;
    }
    // Fallback: match by service id or name
    const byIdOrName = activeQuote.deliverables.filter(
      (d) => d.id === service.serviceId || d.name.toLowerCase() === service.serviceName.toLowerCase()
    );
    if (byIdOrName.length > 0) return byIdOrName;
    return activeQuote.deliverables;
  };

  // Nombres sugeridos y editables: [Nombre del servicio] — [Nombre del cliente]
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});

  useEffect(() => {
    setProjectNames((prev) => {
      const next = { ...prev };
      wonServices.forEach((svc) => {
        if (!next[svc.serviceId]) {
          next[svc.serviceId] = `${svc.serviceName} — ${clientName}`;
        }
      });
      return next;
    });
  }, [wonServices, clientName]);

  // Resolver usuarios elegibles como líderes
  const eligibleLeaders = useMemo(() => {
    if (users.length === 0) return [];
    const filtered = users.filter(
      (u) =>
        u.accessLevel === 'system_admin' ||
        u.accessLevel === 'executive' ||
        u.accessLevel === 'leader' ||
        u.role?.toLowerCase().includes('lead') ||
        u.role?.toLowerCase().includes('direc') ||
        u.role?.toLowerCase().includes('geren') ||
        u.role?.toLowerCase().includes('ceo')
    );
    return filtered.length > 0 ? filtered : users;
  }, [users]);

  // Preseleccionar al líder del scoping
  const initialLeadUser = useMemo(() => {
    if (opportunity.leadUserId) {
      const match = users.find((u) => u.id === opportunity.leadUserId);
      if (match) return match;
    }
    return eligibleLeaders[0] || null;
  }, [opportunity, users, eligibleLeaders]);

  // Selección múltiple de líderes operativos
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>(() =>
    initialLeadUser ? [initialLeadUser.id] : []
  );

  const selectedSpecialistIds = Array.from(
    new Set(
      activeQuote.deliverables.flatMap((deliverable) =>
        deliverable.backlogItems.flatMap((activity) =>
          activity.suggestedUserId ? [activity.suggestedUserId] : []
        )
      )
    )
  );

  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [isEndDateCustomized, setIsEndDateCustomized] = useState<boolean>(false);

  if (!isOpen) return null;

  const currency = activeQuote.currency || 'COP';
  const selectedLeadUsers = users.filter((u) => selectedLeadIds.includes(u.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLeadUsers.length === 0 || (opportunity.clientId && !matchedExistingClient)) return;
    if (wonServices.length === 0) return;

    // Regla canónica 1:1:1:
    // 1 servicio en Orbit = 1 negocio en HubSpot = 1 proyecto independiente en Orbit
    const convertedProjects: ConvertedProjectPlan[] = wonServices.map((svc) => {
      const customName = (projectNames[svc.serviceId] || `${svc.serviceName} — ${clientName}`).trim();
      const serviceDeliverables = getDeliverablesForService(svc);
      return {
        serviceId: svc.serviceId,
        serviceName: svc.serviceName,
        projectName: customName,
        projectType: svc.modality,
        hubspotDealId: svc.hubspotDealId || null,
        hubspotDealStage: svc.hubspotDealStage,
        soldValue: svc.modality === 'fixed_project' ? svc.totalValue : undefined,
        soldMonthlyValue: svc.modality === 'fee_monthly' ? svc.monthlyValue : undefined,
        monthsDuration: svc.modality === 'fee_monthly' ? svc.monthsDuration : undefined,
        deliverableIds: serviceDeliverables.map((d) => d.id)
      };
    });

    const isMixed = wonServices.some((s) => s.modality === 'fixed_project') && wonServices.some((s) => s.modality === 'fee_monthly');

    onConfirm({
      projects: convertedProjects,
      leadUserId: selectedLeadUsers[0].id,
      leadUserIds: selectedLeadIds,
      leadName: selectedLeadUsers.map((u) => u.name).join(', '),
      specialistUserIds: selectedSpecialistIds.filter((id) => users.some((user) => user.id === id)),
      startDate,
      endDate: endDate || undefined,
      initialFormalizationStatus: 'pendiente_formalizacion',
      startConditionsConfig: {
        contractSignedRequired: true,
        contractSignedCompleted: false,
        downPaymentRequired: 'required',
        downPaymentPercentage: 50,
        downPaymentReceived: false,
        fiscalDocsRequiredBeforeBilling: true,
        fiscalDocsCompleted: false,
        onboardingCompleted: false
      },
      // Compatibilidad legacy
      projectName: convertedProjects[0]?.projectName || `${clientName} — Proyecto`,
      projectType: convertedProjects[0]?.projectType || 'fixed_project',
      approvedServiceIds: wonServices.map((s) => s.serviceId),
      isMixed,
      fixedProjectName: convertedProjects.find((p) => p.projectType === 'fixed_project')?.projectName,
      feeProjectName: convertedProjects.find((p) => p.projectType === 'fee_monthly')?.projectName
    });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#501f92] to-[#7839ee] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/15 text-white">
              <Sparkles className="w-5 h-5 text-[#d4ff4a]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Convertir a Cliente & Proyecto(s)</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-[#d4ff4a]">
                  1 Servicio = 1 Proyecto
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-[#0f172a]">
          {/* Banner de Detección de Cliente Existente vs Nuevo */}
          {matchedExistingClient ? (
            <div className="p-3.5 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-2 rounded-lg bg-[#10b981]/15 text-[#047857] shrink-0">
                  <Building2 className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs text-[#065f46]">
                      Cliente existente detectado: {matchedExistingClient.name}
                    </strong>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#10b981]/20 text-[#065f46]">
                      En cartera
                    </span>
                  </div>
                  <p className="text-[11px] text-[#047857] leading-relaxed">
                    Se asociarán los nuevos proyectos a esta cuenta existente en el directorio sin duplicar datos ni exigir RUT previo.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-[#501f92]/10 text-[#501f92] shrink-0">
                <Building2 className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-xs text-[#501f92]">
                  Alta de nuevo Cliente: {clientName}
                </strong>
                <p className="text-[11px] text-[#475569] leading-relaxed">
                  Se creará automáticamente en <em>/app/clientes</em> con el contacto <strong>{opportunity.contactName || 'Contacto Comercial'}</strong> ({opportunity.contactEmail || 'sin correo'}).
                </p>
              </div>
            </div>
          )}

          {/* Información de Servicios Ganados vs Perdidos */}
          {lostServices.length > 0 && (
            <div className="p-3 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-xs text-[#9f1239] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#e11d48]" />
              <span>
                <strong>{lostServices.length} servicio(s) en Cierre perdido:</strong>{' '}
                {lostServices.map((s) => s.serviceName).join(', ')}. Quedan excluidos de la conversión y no generarán proyectos ni tareas.
              </span>
            </div>
          )}

          {/* Vista previa de la conversión: Tarjeta editable por CADA servicio ganado */}
          <div className="p-4 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e9d5ff]/70">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#501f92]" />
                <span className="text-xs font-extrabold text-[#501f92] uppercase tracking-wider">
                  Proyectos a crear ({wonServices.length} independiente{wonServices.length === 1 ? '' : 's'})
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#501f92] border border-[#d8b4fe]">
                {wonServices.length} servicio{wonServices.length === 1 ? '' : 's'} ganado{wonServices.length === 1 ? '' : 's'} = {wonServices.length} proyecto{wonServices.length === 1 ? '' : 's'}
              </span>
            </div>

            <p className="text-[11px] text-[#64748b]">
              Conforme a la regla 1:1, cada servicio ganado genera su propio proyecto operativo con sus entregables y horas exclusivas:
            </p>

            {/* Tarjetas de Proyectos independientes */}
            <div className="space-y-3">
              {wonServices.map((service, idx) => {
                const isFixed = service.modality === 'fixed_project';
                const serviceDeliverables = getDeliverablesForService(service);
                const currentName = projectNames[service.serviceId] ?? `${service.serviceName} — ${clientName}`;

                return (
                  <div
                    key={service.serviceId || idx}
                    className="p-3.5 rounded-xl bg-white border border-[#cbd5e1] hover:border-[#94a3b8] transition-all shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#501f92]/10 text-[#501f92] flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <strong className="font-extrabold text-xs text-[#0f172a]">
                          {service.serviceName}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {service.hubspotDealId && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]">
                            Deal: {service.hubspotDealId}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            service.hubspotDealStage === 'Enviado para facturar'
                              ? 'bg-[#3b82f6]/10 text-[#1d4ed8] border border-[#bfdbfe]'
                              : 'bg-[#059669]/10 text-[#047857] border border-[#a7f3d0]'
                          }`}
                        >
                          {service.hubspotDealStage || 'Cierre ganado'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isFixed
                              ? 'bg-[#501f92]/10 text-[#501f92]'
                              : 'bg-[#059669]/10 text-[#047857]'
                          }`}
                        >
                          {isFixed ? 'Proyecto único' : 'Fee mensual'}
                        </span>
                      </div>
                    </div>

                    {/* Input editable de Nombre del proyecto */}
                    <div className="space-y-1">
                      <label className="font-bold text-[#475569] block text-[11px]">
                        Nombre del proyecto: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProjectNames((prev) => ({ ...prev, [service.serviceId]: val }));
                        }}
                        placeholder={`Ej: ${service.serviceName} — ${clientName}`}
                        className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] text-xs font-bold focus:ring-2 focus:ring-[#501f92] bg-white shadow-2xs"
                      />
                    </div>

                    {/* Entregables asignados exclusivamente a este proyecto */}
                    <div className="space-y-1.5 pt-1 border-t border-[#f1f5f9]">
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span className="uppercase font-bold text-[#64748b]">
                          Entregables de este servicio ({serviceDeliverables.length}):
                        </span>
                        <span className="font-black text-[#0f172a]">
                          {isFixed
                            ? formatCurrency(service.totalValue || 0, currency)
                            : `${formatCurrency(service.monthlyValue || 0, currency)}/mes (${service.monthsDuration || 0}m)`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {serviceDeliverables.map((d) => (
                          <span
                            key={d.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[11px] font-medium text-[#334155]"
                          >
                            <span>{d.name}</span>
                            <span className="text-[10px] text-[#64748b]">
                              ({d.totalHoursRollup || d.backlogItems.reduce((acc, a) => acc + (a.estimatedHours || 0), 0)}h)
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Líderes Operativos & Fechas */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="font-bold text-[#475569] block text-xs">
                Líder(es) Operativo(s): <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-[#64748b]">
                Selecciona uno o varios líderes para la gestión y asignación operativa de los proyectos creados:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2 rounded-xl bg-white border border-[#cbd5e1]">
                {eligibleLeaders.map((u) => {
                  const isSelected = selectedLeadIds.includes(u.id);
                  return (
                    <label
                      key={u.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-[#501f92]/10 border-[#501f92]/40 text-[#0f172a] font-bold shadow-2xs'
                          : 'bg-[#f8fafc] border-transparent hover:border-[#cbd5e1] text-[#475569]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedLeadIds((prev) => {
                            if (prev.includes(u.id)) {
                              if (prev.length <= 1) return prev; // Mantener al menos 1 líder
                              return prev.filter((id) => id !== u.id);
                            }
                            return [...prev, u.id];
                          });
                        }}
                        className="w-4 h-4 rounded text-[#501f92] focus:ring-[#501f92] cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[#0f172a]">{u.name}</p>
                        <p className="text-[10.5px] text-[#64748b] truncate font-normal">
                          {u.officialRole || u.professionalRole || u.role || 'Líder'}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {selectedLeadIds.length === 0 && (
                <p className="text-[11px] text-red-500 font-bold">
                  Selecciona al menos un líder operativo.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="font-bold text-[#475569] block">
                  Fecha Inicio estimada: <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium bg-white focus:ring-2 focus:ring-[#501f92] shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#475569] block">
                    Fecha Entrega:
                  </label>
                  {!isEndDateCustomized && (
                    <span className="text-[10px] font-semibold text-[#501f92] bg-[#f2ecfb] px-1.5 py-0.2 rounded">
                      Sugerida
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setIsEndDateCustomized(true);
                  }}
                  className={`w-full p-2.5 rounded-xl border transition-colors focus:ring-2 focus:ring-[#501f92] shadow-2xs ${
                    !isEndDateCustomized
                      ? 'bg-[#faf5ff] border-[#d8b4fe] text-[#475569] font-medium'
                      : 'bg-white border-[#cbd5e1] text-[#0f172a] font-medium'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Nota de gobernanza */}
          <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[11px] text-[#166534] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16a34a] shrink-0" />
            <span>
              Los proyectos nacerán en estado <strong>Pendiente de Formalización</strong>. La recopilación de RUT y formalización administrativa se gestiona en la ficha del Cliente sin bloquear la estructuración técnica.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={selectedLeadUsers.length === 0 || wonServices.length === 0 || Boolean(opportunity.clientId && !matchedExistingClient)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#d4ff4a]" />
              <span>Confirmar y Crear {wonServices.length} Proyecto(s) →</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
