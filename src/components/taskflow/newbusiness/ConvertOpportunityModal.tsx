import React, { useState, useMemo } from 'react';
import {
  NewBusinessOpportunity,
  QuoteProposal,
  ProjectType,
  UserItem
} from '../types';
import { formatCurrency } from '../../../utils/formatters';
import {
  CheckCircle2,
  X,
  Briefcase,
  Building2,
  Layers,
  Calendar,
  User,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Users,
  FolderOpen
} from 'lucide-react';

interface ConvertOpportunityModalProps {
  isOpen: boolean;
  opportunity: NewBusinessOpportunity;
  activeQuote: QuoteProposal;
  users?: UserItem[];
  onClose: () => void;
  onConfirm: (payload: {
    projectName: string;
    projectType: ProjectType;
    leadUserId: string;
    leadName: string;
    specialistUserIds?: string[];
    startDate: string;
    endDate?: string;
    initialFormalizationStatus?: 'pendiente_formalizacion' | 'activo';
    startConditionsConfig?: any;
  }) => void;
}

export const ConvertOpportunityModal: React.FC<ConvertOpportunityModalProps> = ({
  isOpen,
  opportunity,
  activeQuote,
  users = [],
  onClose,
  onConfirm
}) => {
  // Resolver usuarios elegibles como líderes (admins, leads, directores, o todos si la lista es corta)
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

  // Preseleccionar al líder que realizó el scoping o el primer líder elegible
  const initialLeadUser = useMemo(() => {
    if (opportunity.leadUserId) {
      const match = users.find((u) => u.id === opportunity.leadUserId);
      if (match) return match;
    }
    if (opportunity.leadUserName) {
      const match = users.find(
        (u) =>
          u.name.toLowerCase().includes(opportunity.leadUserName!.toLowerCase()) ||
          opportunity.leadUserName!.toLowerCase().includes(u.name.toLowerCase())
      );
      if (match) return match;
    }
    return eligibleLeaders[0] || users[0] || null;
  }, [opportunity, users, eligibleLeaders]);

  const [projectName, setProjectName] = useState<string>(
    opportunity.title || `Proyecto ${opportunity.prospectAccountName}`
  );
  // En New Business solo permitimos proyectos de cliente (fijo o recurrente), no internal_non_billable
  const [projectType, setProjectType] = useState<ProjectType>('fixed_project');
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    initialLeadUser ? initialLeadUser.id : 'usr-paola'
  );
  const [selectedSpecialistIds, setSelectedSpecialistIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().slice(0, 10);
  });

  // Gates de inicio configurables (resumidos)
  const [contractSigned, setContractSigned] = useState<boolean>(
    opportunity.startConditions?.contractSignedCompleted || false
  );
  const [downPaymentRequired, setDownPaymentRequired] = useState<'not_applicable' | 'required'>(
    projectType === 'fee_monthly' ? 'not_applicable' : 'required'
  );
  const [downPaymentReceived, setDownPaymentReceived] = useState<boolean>(
    opportunity.startConditions?.downPaymentReceived || false
  );
  const [initialStatus, setInitialStatus] = useState<'pendiente_formalizacion' | 'activo'>(
    'pendiente_formalizacion'
  );

  if (!isOpen) return null;

  const totalHours = activeQuote.totalHoursRollup || 0;
  const currency = activeQuote.currency || 'COP';
  const totalQuotedValue =
    activeQuote.totalQuotedValue ||
    activeQuote.totalQuotedValueCOP ||
    activeQuote.financialSummary?.finalPriceWithTaxCOP ||
    activeQuote.financialSummary?.subtotalBeforeTaxCOP ||
    0;

  const totalActivities = activeQuote.deliverables.reduce(
    (sum, d) => sum + d.backlogItems.length,
    0
  );
  const isNewClient = !opportunity.clientId;
  const clientName = opportunity.prospectAccountName || 'Cliente';

  const currentSelectedLead = users.find((u) => u.id === selectedLeadId) || initialLeadUser;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLead = currentSelectedLead || {
      id: selectedLeadId,
      name: opportunity.leadUserName || 'Líder Operativo'
    };

    onConfirm({
      projectName: projectName.trim(),
      projectType,
      leadUserId: finalLead.id,
      leadName: finalLead.name,
      specialistUserIds: selectedSpecialistIds,
      startDate,
      endDate: endDate || undefined,
      initialFormalizationStatus: initialStatus,
      startConditionsConfig: {
        contractSignedRequired: true,
        contractSignedCompleted: contractSigned,
        downPaymentRequired,
        downPaymentPercentage: downPaymentRequired === 'required' ? 50 : 0,
        downPaymentReceived,
        fiscalDocsRequiredBeforeBilling: true,
        fiscalDocsCompleted: false,
        onboardingCompleted: false
      }
    });
  };

  const toggleSpecialist = (id: string) => {
    setSelectedSpecialistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
              <h3 className="text-base font-bold">Convertir a Proyecto Operativo</h3>
              <p className="text-xs text-white/80">
                Hereda alcance, entregables y cotización · Activa la ejecución en Orbit
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
          {/* Tarjeta de Datos Heredados desde New Business */}
          <div className="p-4 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#501f92] text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                <span>Información Heredada de New Business</span>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#501f92]/10 text-[#501f92]">
                Propuesta: {activeQuote.versionLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded-lg bg-white border border-[#e9d5ff]/80">
                <span className="text-[#64748b] block text-[10px]">Cliente / Cuenta</span>
                <span className="font-bold text-[#0f172a] truncate block">{clientName}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#e9d5ff]/80">
                <span className="text-[#64748b] block text-[10px]">Valor Vendido</span>
                <span className="font-black text-[#10b981] block">
                  {formatCurrency(totalQuotedValue, currency)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#e9d5ff]/80">
                <span className="text-[#64748b] block text-[10px]">Horas Totales</span>
                <span className="font-bold text-[#501f92] block">{totalHours}h cotizadas</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#e9d5ff]/80">
                <span className="text-[#64748b] block text-[10px]">Servicios / Tareas</span>
                <span className="font-bold text-[#0f172a] block">
                  {activeQuote.deliverables.length} frentes · {totalActivities} tareas
                </span>
              </div>
            </div>

            {(opportunity.hubspotDealId || opportunity.driveFolderUrl) && (
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#64748b]">
                {opportunity.hubspotDealId && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-[#0f172a]">HubSpot Deal:</span> #{opportunity.hubspotDealId}
                  </span>
                )}
                {opportunity.driveFolderUrl && (
                  <a
                    href={opportunity.driveFolderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#501f92] hover:underline"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Carpeta Google Drive vinculada</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Client & Project Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Nombre del Proyecto: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Modalidad del Proyecto: <span className="text-red-500">*</span>
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium bg-white focus:ring-2 focus:ring-[#501f92]"
              >
                <option value="fixed_project">Proyecto Único (Entregables fijos)</option>
                <option value="fee_monthly">Fee Mensual Recurrente</option>
              </select>
            </div>
          </div>

          {/* Líder Operativo Real & Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-1">
              <label className="font-bold text-[#475569] block">
                Líder del Proyecto: <span className="text-red-500">*</span>
              </label>
              {eligibleLeaders.length > 0 ? (
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium bg-white focus:ring-2 focus:ring-[#501f92]"
                >
                  {eligibleLeaders.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.officialRole || u.role || 'Líder'})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] font-medium text-[#0f172a]">
                  {opportunity.leadUserName || 'Líder asignado'}
                </div>
              )}
              <span className="text-[10px] text-[#64748b] block">
                Preseleccionado del scoping de New Business
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Fecha Inicio: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Fecha Estimada Entrega:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              />
            </div>
          </div>

          {/* Asignación Opcional de Especialistas */}
          {users.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0f172a] flex items-center gap-1.5 text-xs">
                  <Users className="w-4 h-4 text-[#501f92]" />
                  <span>Especialistas del Equipo (Opcional)</span>
                </span>
                <span className="text-[10px] text-[#64748b]">
                  Se pueden terminar de asignar después en Staffing
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {users
                  .filter((u) => u.id !== selectedLeadId)
                  .slice(0, 10)
                  .map((u) => {
                    const isSelected = selectedSpecialistIds.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleSpecialist(u.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border cursor-pointer ${
                          isSelected
                            ? 'bg-[#501f92] text-white border-[#501f92]'
                            : 'bg-white text-[#475569] border-[#cbd5e1] hover:border-[#501f92]'
                        }`}
                      >
                        {u.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Gates de Formalización Resumidos */}
          <div className="p-4 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#501f92] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Formalización Previa al Inicio</span>
              </span>
              <span className="text-[10px] text-[#64748b]">Requisitos antes de operar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 bg-white rounded-lg border border-[#e2e8f0] flex items-center justify-between">
                <span className="font-medium text-[#0f172a]">1. SOW / Contrato firmado</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[#475569]">
                  <input
                    type="checkbox"
                    checked={contractSigned}
                    onChange={(e) => setContractSigned(e.target.checked)}
                    className="rounded text-[#501f92] focus:ring-[#501f92]"
                  />
                  <span>Completado</span>
                </label>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-[#e2e8f0] flex items-center justify-between">
                <span className="font-medium text-[#0f172a]">2. Anticipo Monetario</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[#475569]">
                  <input
                    type="checkbox"
                    checked={downPaymentReceived}
                    onChange={(e) => setDownPaymentReceived(e.target.checked)}
                    className="rounded text-[#501f92] focus:ring-[#501f92]"
                  />
                  <span>Recibido</span>
                </label>
              </div>
            </div>

            {/* Estado de Transición Inicial */}
            <div className="pt-2 border-t border-[#e9d5ff]/60 flex items-center justify-between gap-2">
              <span className="font-bold text-[#0f172a]">
                Estado Inicial del Proyecto:
              </span>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as any)}
                className="p-1.5 rounded-lg border border-[#cbd5e1] bg-white font-bold text-[#501f92] focus:ring-2 focus:ring-[#501f92]"
              >
                <option value="pendiente_formalizacion">
                  Pendiente de Formalización (Recomendado)
                </option>
                <option value="activo">
                  Activo en Operación de Inmediato
                </option>
              </select>
            </div>
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
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#d4ff4a]" />
              <span>Aprobar y Crear Proyecto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
