import React, { useState, useMemo } from 'react';
import {
  NewBusinessOpportunity,
  QuoteProposal,
  ProjectType,
  UserItem,
  ClientProfile
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
  Sparkles,
  Users,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Check
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
  clients = [],
  onClose,
  onConfirm
}) => {
  // Resolver si la cuenta ya existe en Clientes
  const matchedExistingClient = useMemo(() => {
    if (!clients || clients.length === 0) return null;
    if (opportunity.clientId) {
      return clients.find((c) => c.id === opportunity.clientId) || null;
    }
    const clean = (opportunity.prospectAccountName || '').trim().toLowerCase();
    if (!clean) return null;
    return clients.find((c) => c.name.trim().toLowerCase() === clean) || null;
  }, [clients, opportunity]);

  // Roles y horas dimensionados por el líder técnico en el backlog
  const scopedRoles = useMemo(() => {
    const roleMap: Record<string, number> = {};
    activeQuote.deliverables.forEach((d) => {
      d.backlogItems.forEach((b) => {
        const role = b.roleName || 'Front-End Dev';
        roleMap[role] = (roleMap[role] || 0) + (Number(b.estimatedHours) || 0);
      });
    });
    return Object.entries(roleMap).map(([roleName, hours]) => ({
      roleName,
      hours
    }));
  }, [activeQuote]);

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
  const [projectType, setProjectType] = useState<ProjectType>(
    opportunity.projectType || 'fixed_project'
  );
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
  const [isEndDateCustomized, setIsEndDateCustomized] = useState<boolean>(false);

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
      initialFormalizationStatus: 'pendiente_formalizacion',
      startConditionsConfig: {
        contractSignedRequired: true,
        contractSignedCompleted: false,
        downPaymentRequired: projectType === 'fee_monthly' ? 'not_applicable' : 'required',
        downPaymentPercentage: projectType === 'fee_monthly' ? 0 : 50,
        downPaymentReceived: false,
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

          {/* Tarjeta de Resumen Económico & Operativo Heredado */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
            <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[#64748b] block text-[10px] font-medium">Valor Aprobado</span>
              <span className="font-extrabold text-[#059669] text-xs block">
                {formatCurrency(totalQuotedValue, currency)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[#64748b] block text-[10px] font-medium">Horas Técnicas</span>
              <span className="font-extrabold text-[#501f92] text-xs block font-mono">
                {totalHours}h totales
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[#64748b] block text-[10px] font-medium">Entregables Scoped</span>
              <span className="font-bold text-[#0f172a] text-xs block">
                {activeQuote.deliverables.length} entregable(s)
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[#64748b] block text-[10px] font-medium">Líder Scoping</span>
              <span className="font-bold text-[#501f92] text-xs block truncate" title={opportunity.leadUserName || 'Diego Cadavid'}>
                {opportunity.leadUserName || 'Diego Cadavid'}
              </span>
            </div>
          </div>

          {/* Campos Principales del Proyecto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Nombre del Proyecto: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92] bg-white shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Modalidad del Proyecto: <span className="text-red-500">*</span>
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium bg-white focus:ring-2 focus:ring-[#501f92] shadow-2xs"
              >
                <option value="fixed_project">Proyecto Único (Entregables fijos)</option>
                <option value="fee_monthly">Fee Mensual Recurrente</option>
              </select>
            </div>
          </div>

          {/* Líder Operativo & Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-1">
              <label className="font-bold text-[#475569] block">
                Líder Operativo: <span className="text-red-500">*</span>
              </label>
              {eligibleLeaders.length > 0 ? (
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium bg-white focus:ring-2 focus:ring-[#501f92] shadow-2xs"
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

          {/* Roles dimensionados en el alcance técnico (Staffing Inicial) */}
          <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="font-bold text-[#0f172a] flex items-center gap-1.5 text-xs">
                <Users className="w-4 h-4 text-[#501f92]" />
                <span>Especialistas Dimensionados en el Alcance (Opcional)</span>
              </span>
              <span className="text-[10px] text-[#64748b]">
                {scopedRoles.length} rol(es) presupuestados por Diego
              </span>
            </div>

            {/* Lista de roles presupuestados con sus horas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {scopedRoles.map((sr) => {
                // Encontrar especialistas que coincidan con este rol
                const matchingUsers = users.filter((u) => {
                  const roleLower = (u.officialRole || u.role || '').toLowerCase();
                  const targetLower = sr.roleName.toLowerCase();
                  return roleLower.includes(targetLower) || targetLower.includes(roleLower);
                });

                return (
                  <div
                    key={sr.roleName}
                    className="p-2.5 rounded-lg bg-white border border-[#e2e8f0] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0f172a]">{sr.roleName}</span>
                      <span className="text-[10px] font-mono font-bold text-[#501f92] bg-[#501f92]/10 px-1.5 py-0.5 rounded">
                        {sr.hours}h
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(matchingUsers.length > 0 ? matchingUsers : users.slice(0, 3)).map((u) => {
                        const isSelected = selectedSpecialistIds.includes(u.id);
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => toggleSpecialist(u.id)}
                            className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium transition-colors border cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-[#501f92] text-white border-[#501f92]'
                                : 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1] hover:border-[#501f92]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-[#d4ff4a]" />}
                            <span>{u.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Asignación libre y flexible: Cualquier miembro del equipo (Laura, Catalina, Luisa...) */}
            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                  <span>👥 Asignar otros integrantes del equipo al proyecto</span>
                </span>
                <span className="text-[10px] text-[#64748b]">
                  {selectedSpecialistIds.length} seleccionado(s)
                </span>
              </div>
              <p className="text-[10.5px] text-[#64748b]">
                En la práctica real, podemos asignar a cualquier persona disponible (ej. Laura, Catalina, Diego) sin importar el rol estricto cotizado en el alcance.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {users.map((u) => {
                  const isSelected = selectedSpecialistIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleSpecialist(u.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#501f92] text-white border-[#501f92] shadow-2xs'
                          : 'bg-[#f8fafc] text-[#334155] border-[#cbd5e1] hover:border-[#501f92]'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-[#d4ff4a]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[#cbd5e1]" />
                      )}
                      <span>{u.name}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#64748b]'}`}>
                        ({u.officialRole || u.jobTitle || u.role || 'Equipo'})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Nota de gobernanza: la formalización legal y fiscal no bloquea la creación */}
          <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[11px] text-[#166534] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16a34a] shrink-0" />
            <span>
              El proyecto nacerá en estado <strong>Pendiente de Formalización</strong>. La recopilación de RUT, Cédula y creación en Alegra queda asignada a <strong>Finanzas (Vivian)</strong> en la ficha del Cliente sin bloquear la estructuración operativa.
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
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#d4ff4a]" />
              <span>Confirmar Alta y Crear Proyecto en Operación →</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
