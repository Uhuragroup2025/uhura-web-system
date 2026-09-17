import React, { useState } from 'react';
import {
  NewBusinessOpportunity,
  QuoteProposal,
  ProjectType
} from '../types';
import { formatFinancialCurrency } from '../financial/financialEngine';
import {
  CheckCircle2,
  X,
  Briefcase,
  Building2,
  Layers,
  Calendar,
  User,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface ConvertOpportunityModalProps {
  isOpen: boolean;
  opportunity: NewBusinessOpportunity;
  activeQuote: QuoteProposal;
  onClose: () => void;
  onConfirm: (payload: {
    projectName: string;
    projectType: ProjectType;
    leadName: string;
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
  onClose,
  onConfirm
}) => {
  const [projectName, setProjectName] = useState<string>(
    opportunity.title || `Proyecto ${opportunity.prospectAccountName}`
  );
  const [projectType, setProjectType] = useState<ProjectType>('fixed_project');
  const [leadName, setLeadName] = useState<string>(
    opportunity.leadUserName || 'Product Lead'
  );
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().slice(0, 10);
  });

  // Condiciones para iniciar configurables (no bloqueo universal de anticipo)
  const [contractRequired, setContractRequired] = useState<boolean>(true);
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
  const totalActivities = activeQuote.deliverables.reduce(
    (sum, d) => sum + d.backlogItems.length,
    0
  );
  const isNewClient = !opportunity.clientId;
  const clientName = opportunity.prospectAccountName || 'Cliente';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      projectName: projectName.trim(),
      projectType,
      leadName: leadName.trim(),
      startDate,
      endDate: endDate || undefined,
      initialFormalizationStatus: initialStatus,
      startConditionsConfig: {
        contractSignedRequired: contractRequired,
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

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#501f92] to-[#7839ee] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/15 text-white">
              <Sparkles className="w-5 h-5 text-[#d4ff4a]" />
            </span>
            <div>
              <h3 className="text-base font-bold">Convertir a Cliente & Proyecto</h3>
              <p className="text-xs text-white/80">
                Aprobación comercial · Activación operativa en Orbit
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Transition Summary Pill */}
          <div className="p-4 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#501f92] text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                <span>Propuesta aprobada por el cliente</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#501f92]/10 text-[#501f92]">
                Versión: {activeQuote.versionLabel}
              </span>
            </div>

            <p className="text-[#64748b] leading-relaxed">
              Al confirmar, el prospecto pasará al módulo de <strong>Clientes</strong> (sin requerir NIT de inmediato) 
              y se creará el <strong>Proyecto</strong> con sus <strong>{activeQuote.deliverables.length} servicio(s)</strong> y <strong>{totalActivities} tarea(s)</strong> operativas con sus horas presupuestadas.
            </p>
          </div>

          {/* Client & Project Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Empresa / Cliente en Orbit:
              </label>
              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] font-bold text-[#0f172a] flex items-center justify-between">
                <span>{clientName}</span>
                {isNewClient ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f59e0b]/15 text-[#b45309]">
                    Nuevo Cliente
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#10b981]/15 text-[#10b981]">
                    Cliente Activo
                  </span>
                )}
              </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Líder Operativo:
              </label>
              <select
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium bg-white focus:ring-2 focus:ring-[#501f92]"
              >
                <option value="Product Lead">Product Lead</option>
                <option value="Growth Manager">Growth Manager</option>
                <option value="CEO">CEO</option>
                <option value="Creative Lead">Creative Lead</option>
                <option value="Directora Comercial">Directora Comercial</option>
              </select>
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

          {/* Scoping Summary Box */}
          <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
            <h4 className="font-bold text-[#0f172a] text-xs flex items-center justify-between">
              <span>Presupuesto que heredará el Proyecto</span>
              <span className="text-[#501f92] font-black text-sm">{totalHours}h</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {activeQuote.deliverables.map((del) => {
                const h = del.backlogItems.reduce(
                  (sum, it) => sum + (Number(it.estimatedHours) || 0),
                  0
                );
                return (
                  <div
                    key={del.id}
                    className="p-2 rounded-lg bg-white border border-[#e2e8f0] text-[11px]"
                  >
                    <div className="font-bold text-[#0f172a] truncate">{del.name}</div>
                    <div className="text-[#64748b]">{del.backlogItems.length} act. · {h}h</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Configuración de Condiciones para Iniciar */}
          <div className="p-4 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#501f92] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Condiciones para Iniciar (Gates de Formalización)</span>
              </span>
              <span className="text-[10px] text-[#64748b]">Configurables por negocio</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] space-y-1.5">
                <label className="font-bold text-[#0f172a] block">
                  1. SOW / Contrato firmado:
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#475569]">
                    <input
                      type="checkbox"
                      checked={contractSigned}
                      onChange={(e) => setContractSigned(e.target.checked)}
                      className="rounded text-[#501f92] focus:ring-[#501f92]"
                    />
                    <span>¿Ya fue firmado?</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] space-y-1.5">
                <label className="font-bold text-[#0f172a] block">
                  2. Anticipo Monetario:
                </label>
                <select
                  value={downPaymentRequired}
                  onChange={(e) => setDownPaymentRequired(e.target.value as any)}
                  className="w-full p-1.5 rounded-lg border border-[#cbd5e1] text-xs bg-white"
                >
                  <option value="required">Obligatorio (ej. 50% proyecto)</option>
                  <option value="not_applicable">No aplica (ej. Fee o mes vencido)</option>
                </select>
                {downPaymentRequired === 'required' && (
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#475569] pt-1">
                    <input
                      type="checkbox"
                      checked={downPaymentReceived}
                      onChange={(e) => setDownPaymentReceived(e.target.checked)}
                      className="rounded text-[#501f92] focus:ring-[#501f92]"
                    />
                    <span>¿Anticipo ya recibido en banco?</span>
                  </label>
                )}
              </div>
            </div>

            {/* Estado de Transición Inicial */}
            <div className="pt-2 border-t border-[#e9d5ff]/60 flex items-center justify-between gap-2">
              <span className="font-bold text-[#0f172a]">
                Estado Inicial al Convertir:
              </span>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as any)}
                className="p-2 rounded-xl border border-[#cbd5e1] bg-white font-bold text-[#501f92] focus:ring-2 focus:ring-[#501f92]"
              >
                <option value="pendiente_formalizacion">
                  Pendiente de Formalización (Recomendado)
                </option>
                <option value="activo">
                  Activo en Operación de Inmediato
                </option>
              </select>
            </div>
            <p className="text-[10px] text-[#64748b]">
              La documentación fiscal (RUT, Cédula) la completará Vivian en Alegra antes de facturar, sin frenar el inicio operativo.
            </p>
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
              <span>Aprobar y Activar en Orbit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
