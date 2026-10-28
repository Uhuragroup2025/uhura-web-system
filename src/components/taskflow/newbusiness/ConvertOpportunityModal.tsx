import React, { useState, useMemo, useEffect } from 'react';
import {
  NewBusinessOpportunity,
  QuoteProposal,
  ProjectType,
  UserItem,
  ClientProfile,
  ServiceCommercialItem,
  ServiceCommercialModality
} from '../types';
import { isEligibleTeamMember } from './teamCandidates';
import { formatCurrency } from '../../../utils/formatters';
import {
  CheckCircle2,
  X,
  Briefcase,
  Building2,
  Layers,
  Calendar,
  User,
  Sparkles,
  Users,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Check,
  Sliders,
  AlertCircle
} from 'lucide-react';

interface ConvertOpportunityModalProps {
  isOpen: boolean;
  opportunity: NewBusinessOpportunity;
  activeQuote: QuoteProposal;
  users?: UserItem[];
  clients?: ClientProfile[];
  onClose: () => void;
  onConfirm: (payload: {
    projectName: string;
    projectType: ProjectType;
    leadUserId: string;
    leadUserIds?: string[];
    leadName: string;
    specialistUserIds?: string[];
    startDate: string;
    endDate?: string;
    initialFormalizationStatus?: 'pendiente_formalizacion' | 'activo';
    startConditionsConfig?: any;
    approvedServiceIds: string[];
    isMixed: boolean;
    fixedProjectName?: string;
    feeProjectName?: string;
  }) => void;
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

  // Regla estricta: NO reconciliar por coincidencia difusa de nombres.
  // Si existe opportunity.clientId, reutilizar ese cliente.
  // Si no existe, crear un nuevo Cliente.
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
  const opportunityTitle = opportunity.title || 'Propuesta Comercial';

  // Servicios cotizados provenientes de la estructura comercial de Cotización
  const quotedServices: ServiceCommercialItem[] = useMemo(() => {
    if (activeQuote.commercialStructure && activeQuote.commercialStructure.length > 0) {
      return activeQuote.commercialStructure;
    }
    return activeQuote.deliverables.map((d) => ({
      serviceId: d.id,
      serviceName: d.name,
      modality: (opportunity.projectType || 'fixed_project') as ServiceCommercialModality,
      weeksRef: activeQuote.estimatedWeeks || 0,
      totalValue: activeQuote.totalQuotedValue || 0,
      deliverableIds: [d.id]
    }));
  }, [activeQuote, opportunity.projectType]);

  // Si existe un solo servicio, se considera aprobado automáticamente
  const isSingleService = quotedServices.length === 1;

  // Selección de servicios aprobados por el cliente (por defecto todos aprobados)
  const [approvedServiceIds, setApprovedServiceIds] = useState<string[]>(() =>
    quotedServices.map((s) => s.serviceId)
  );

  useEffect(() => {
    if (quotedServices.length > 0) {
      setApprovedServiceIds(quotedServices.map((s) => s.serviceId));
    }
  }, [quotedServices]);

  const toggleServiceApproval = (serviceId: string) => {
    if (isSingleService) return; // Si es servicio único, queda aprobado automáticamente
    setApprovedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        if (prev.length <= 1) return prev; // Debe existir al menos un servicio aprobado
        return prev.filter((id) => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  };

  const approvedServices = useMemo(() => {
    return quotedServices.filter((s) => approvedServiceIds.includes(s.serviceId));
  }, [quotedServices, approvedServiceIds]);

  const fixedServices = useMemo(
    () => approvedServices.filter((s) => s.modality === 'fixed_project'),
    [approvedServices]
  );
  const feeServices = useMemo(
    () => approvedServices.filter((s) => s.modality === 'fee_monthly'),
    [approvedServices]
  );
  const isMixedApproved = fixedServices.length > 0 && feeServices.length > 0;
  const hasApprovedFee = feeServices.length > 0;

  // Regla para sugerir el nombre:
  // - Proyecto con un solo servicio: [Nombre del servicio] — [Nombre del cliente]
  // - Proyecto con varios servicios agrupados: [Nombre de la oportunidad] — [Nombre del cliente]
  const getSuggestedNameForServices = (servicesList: ServiceCommercialItem[]): string => {
    if (servicesList.length === 1) {
      return `${servicesList[0].serviceName} — ${clientName}`;
    }
    return `${opportunityTitle} — ${clientName}`;
  };

  // Nombres de los proyectos sugeridos y editables, manteniendo ediciones manuales del usuario
  const [projectNames, setProjectNames] = useState<{ [key: string]: string }>({});
  const [editedManually, setEditedManually] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setProjectNames((prev) => {
      const next = { ...prev };
      if (isMixedApproved) {
        if (!editedManually['fixed']) {
          next['fixed'] = getSuggestedNameForServices(fixedServices);
        }
        if (!editedManually['fee']) {
          next['fee'] = getSuggestedNameForServices(feeServices);
        }
      } else {
        if (!editedManually['single']) {
          next['single'] = getSuggestedNameForServices(approvedServices);
        }
      }
      return next;
    });
  }, [fixedServices, feeServices, approvedServices, isMixedApproved, clientName, opportunityTitle, editedManually]);

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

  // Preseleccionar al líder que realizó el scoping
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
    if (approvedServices.length === 0) return;

    const finalFixedName = (projectNames['fixed'] || getSuggestedNameForServices(fixedServices)).trim();
    const finalFeeName = (projectNames['fee'] || getSuggestedNameForServices(feeServices)).trim();
    const finalSingleName = (projectNames['single'] || getSuggestedNameForServices(approvedServices)).trim();

    onConfirm({
      projectName: isMixedApproved ? finalFixedName : finalSingleName,
      projectType: isMixedApproved ? 'fixed_project' : (hasApprovedFee ? 'fee_monthly' : 'fixed_project'),
      leadUserId: selectedLeadUsers[0].id,
      leadUserIds: selectedLeadIds,
      leadName: selectedLeadUsers.map((u) => u.name).join(', '),
      specialistUserIds: selectedSpecialistIds.filter((id) => users.some((user) => user.id === id)),
      startDate,
      endDate: endDate || undefined,
      initialFormalizationStatus: 'pendiente_formalizacion',
      approvedServiceIds,
      isMixed: isMixedApproved,
      fixedProjectName: finalFixedName,
      feeProjectName: finalFeeName,
      startConditionsConfig: {
        contractSignedRequired: true,
        contractSignedCompleted: false,
        downPaymentRequired: (!isMixedApproved && hasApprovedFee) ? 'not_applicable' : 'required',
        downPaymentPercentage: (!isMixedApproved && hasApprovedFee) ? 0 : 50,
        downPaymentReceived: false,
        fiscalDocsRequiredBeforeBilling: true,
        fiscalDocsCompleted: false,
        onboardingCompleted: false
      }
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
              <h3 className="text-base font-bold">Convertir a Cliente & Proyecto Operativo</h3>
              <p className="text-xs text-white/80">
                Alta en Directorio de Clientes y creación del Proyecto con los entregables dimensionados
              </p>
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

        {/* Content Form */}
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
                    Se asociará el nuevo proyecto a esta cuenta existente en el directorio sin duplicar datos ni exigir RUT previo.
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

          {/* Servicios cotizados y confirmación de aprobación */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-[#0f172a] text-xs flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#501f92]" />
                <span>Servicios cotizados y aprobación del cliente:</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-[#64748b]">
                {approvedServices.length} de {quotedServices.length} aprobados
              </span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              {isSingleService
                ? 'Al existir un solo servicio en la propuesta, se considera aprobado automáticamente para su conversión.'
                : 'Confirma cuáles servicios fueron aprobados formalmente por el cliente. Solo los aprobados se convertirán en proyectos y tareas.'}
            </p>

            <div className="space-y-2 pt-1">
              {quotedServices.map((service) => {
                const isApproved = approvedServiceIds.includes(service.serviceId);
                const isFixed = service.modality === 'fixed_project';
                return (
                  <div
                    key={service.serviceId}
                    onClick={() => toggleServiceApproval(service.serviceId)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isSingleService
                        ? 'bg-white border-[#501f92]/40 shadow-2xs cursor-default'
                        : isApproved
                        ? 'bg-white border-[#501f92]/40 shadow-2xs cursor-pointer'
                        : 'bg-[#f1f5f9]/60 border-[#e2e8f0] opacity-60 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isApproved}
                        onChange={() => toggleServiceApproval(service.serviceId)}
                        disabled={isSingleService || (isApproved && approvedServiceIds.length === 1)}
                        className="w-4 h-4 rounded text-[#501f92] focus:ring-[#501f92] cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#0f172a] text-xs truncate">
                            {service.serviceName}
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
                          <span className="text-[10px] text-[#64748b]">
                            {service.weeksRef || 0} {service.weeksRef === 1 ? 'semana' : 'semanas'}
                          </span>
                          {isSingleService && (
                            <span className="text-[10px] font-semibold text-[#059669] bg-[#ecfdf5] px-1.5 py-0.5 rounded">
                              Aprobado automáticamente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isFixed ? (
                        <span className="font-black text-[#0f172a] text-xs">
                          {formatCurrency(service.totalValue || 0, currency)}
                        </span>
                      ) : (
                        <div className="text-right">
                          <span className="font-black text-[#059669] text-xs block">
                            {formatCurrency(service.monthlyValue || 0, currency)} / mes
                          </span>
                          <span className="text-[10px] text-[#64748b]">
                            {service.monthsDuration || 0} meses
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vista previa de la conversión: Tarjeta por cada proyecto que se creará */}
          <div className="p-4 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e9d5ff]/70">
              <span className="text-xs font-extrabold text-[#501f92] uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-[#501f92]" />
                <span>Vista previa de la conversión</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#501f92] border border-[#d8b4fe]">
                {isMixedApproved
                  ? 'Propuesta mixta (2 Proyectos)'
                  : hasApprovedFee
                  ? 'Fee mensual (1 Proyecto)'
                  : 'Proyecto único (1 Proyecto)'}
              </span>
            </div>

            {/* Tarjetas de Proyectos que se crearán */}
            <div className="space-y-3">
              {isMixedApproved ? (
                <>
                  {/* Tarjeta 1: Proyecto Único */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#e2e8f0] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-[#501f92]" />
                        <span className="font-extrabold text-xs text-[#0f172a]">
                          Proyecto 1: Proyecto único
                        </span>
                      </div>
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#501f92]/10 text-[#501f92]">
                        Proyecto único
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[#475569] block text-[11px]">
                        Nombre del proyecto: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={projectNames['fixed'] ?? getSuggestedNameForServices(fixedServices)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditedManually((prev) => ({ ...prev, fixed: true }));
                          setProjectNames((prev) => ({ ...prev, fixed: val }));
                        }}
                        placeholder="Nombre del proyecto puntual"
                        className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] text-xs font-bold focus:ring-2 focus:ring-[#501f92] bg-white shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-[#f1f5f9]">
                      <span className="text-[10.5px] uppercase font-bold text-[#64748b] block">
                        {fixedServices.length === 1 ? 'Servicio incluido:' : `Servicios incluidos (${fixedServices.length}):`}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {fixedServices.map((s) => (
                          <span
                            key={s.serviceId}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold text-[#334155]"
                          >
                            <span>{s.serviceName}</span>
                            <span className="text-[10px] text-[#64748b]">({s.weeksRef || 0} sem)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 2: Fee Mensual */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#e2e8f0] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-[#059669]" />
                        <span className="font-extrabold text-xs text-[#0f172a]">
                          Proyecto 2: Fee mensual
                        </span>
                      </div>
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#059669]/10 text-[#047857]">
                        Fee mensual
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[#475569] block text-[11px]">
                        Nombre del proyecto: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={projectNames['fee'] ?? getSuggestedNameForServices(feeServices)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditedManually((prev) => ({ ...prev, fee: true }));
                          setProjectNames((prev) => ({ ...prev, fee: val }));
                        }}
                        placeholder="Nombre del proyecto fee mensual"
                        className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] text-xs font-bold focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-[#f1f5f9]">
                      <span className="text-[10.5px] uppercase font-bold text-[#64748b] block">
                        {feeServices.length === 1 ? 'Servicio recurrente incluido:' : `Servicios recurrentes incluidos (${feeServices.length}):`}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {feeServices.map((s) => (
                          <span
                            key={s.serviceId}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-xs font-semibold text-[#166534]"
                          >
                            <span>{s.serviceName}</span>
                            <span className="text-[10px] text-[#059669]">({s.monthsDuration || 0} meses)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Un solo proyecto (sea puntual o fee) */
                <div className="p-3.5 rounded-xl bg-white border border-[#e2e8f0] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <FolderOpen className={`w-4 h-4 ${hasApprovedFee ? 'text-[#059669]' : 'text-[#501f92]'}`} />
                      <span className="font-extrabold text-xs text-[#0f172a]">
                        {hasApprovedFee ? 'Proyecto Fee mensual' : 'Proyecto único'}
                      </span>
                    </div>
                    <span
                      className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${
                        hasApprovedFee
                          ? 'bg-[#059669]/10 text-[#047857]'
                          : 'bg-[#501f92]/10 text-[#501f92]'
                      }`}
                    >
                      {hasApprovedFee ? 'Fee mensual' : 'Proyecto único'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#475569] block text-[11px]">
                      Nombre del proyecto: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={projectNames['single'] ?? getSuggestedNameForServices(approvedServices)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditedManually((prev) => ({ ...prev, single: true }));
                        setProjectNames((prev) => ({ ...prev, single: val }));
                      }}
                      placeholder="Nombre del proyecto sugerido"
                      className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] text-xs font-bold focus:ring-2 focus:ring-[#501f92] bg-white shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-[#f1f5f9]">
                    <span className="text-[10.5px] uppercase font-bold text-[#64748b] block">
                      {approvedServices.length === 1 ? 'Servicio incluido:' : `Servicios incluidos (${approvedServices.length}):`}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {approvedServices.map((s) => (
                        <span
                          key={s.serviceId}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold text-[#334155]"
                        >
                          <span>{s.serviceName}</span>
                          <span className="text-[10px] text-[#64748b]">
                            {s.modality === 'fee_monthly'
                              ? `(${s.monthsDuration || 0} meses)`
                              : `(${s.weeksRef || 0} sem)`}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Líderes Operativos & Fechas */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="font-bold text-[#475569] block text-xs">
                Líder(es) Operativo(s): <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-[#64748b]">
                Selecciona uno o varios líderes para la gestión y asignación operativa del proyecto:
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

          {/* Nota de gobernanza: la formalización legal y fiscal no bloquea la creación */}
          <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[11px] text-[#166534] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16a34a] shrink-0" />
            <span>
              El proyecto nacerá en estado <strong>Pendiente de Formalización</strong>. La recopilación de RUT, Cédula y creación en Alegra queda asignada a <strong>Finanzas</strong> en la ficha del Cliente sin bloquear la estructuración operativa.
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
              disabled={selectedLeadUsers.length === 0 || Boolean(opportunity.clientId && !matchedExistingClient)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#d4ff4a]" />
              <span>Confirmar →</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
