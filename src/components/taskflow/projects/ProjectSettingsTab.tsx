import React, { useState } from 'react';
import {
  Settings2,
  Building2,
  Check,
  Info,
  ShieldCheck,
  RotateCw,
  Save,
  Users
} from 'lucide-react';
import {
  ProjectSummaryItem,
  ClientProfile,
  FeeRolloverPolicy,
  ProjectType
} from '../types';

interface ProjectSettingsTabProps {
  project: ProjectSummaryItem;
  client?: ClientProfile;
  onUpdateProject: (updated: ProjectSummaryItem) => void;
}

export const ProjectSettingsTab: React.FC<ProjectSettingsTabProps> = ({
  project,
  client,
  onUpdateProject
}) => {
  const [name, setName] = useState(project.name);
  const [code, setCode] = useState(project.code || '');
  const [brief, setBrief] = useState(project.brief || '');
  const [leadName, setLeadName] = useState(project.leadName);
  const [status, setStatus] = useState(project.status || 'Activo');
  const [taxEntityId, setTaxEntityId] = useState<string>(project.taxEntityId || 'none');
  const [rolloverPolicy, setRolloverPolicy] = useState<FeeRolloverPolicy>(project.rolloverPolicy || 'none');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isFee = project.projectType === 'fee_monthly';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: ProjectSummaryItem = {
      ...project,
      name: name.trim(),
      code: code.trim() || undefined,
      brief: brief.trim() || undefined,
      leadName,
      status,
      taxEntityId: taxEntityId === 'none' ? null : taxEntityId,
      rolloverPolicy: isFee ? rolloverPolicy : undefined
    };

    onUpdateProject(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Top Notification */}
      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] text-xs font-bold text-[#065f46] flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#10b981]" />
          <span>Configuración del proyecto guardada exitosamente.</span>
        </div>
      )}

      {/* 1. Datos Generales */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#f1f5f9] pb-3">
          <Settings2 className="w-4 h-4 text-[#501f92]" />
          <h3 className="font-extrabold text-sm text-[#0f172a]">Información General del Proyecto</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#475569] mb-1">Nombre del Proyecto *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#475569] mb-1">Código Operativo (Opcional)</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ej. YAM-NAV-01"
              className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs font-mono text-[#0f172a] focus:ring-2 focus:ring-[#501f92]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#475569] mb-1">Project Lead Responsable</label>
            <input
              type="text"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#475569] mb-1">Estado del Proyecto</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs font-semibold text-[#0f172a] bg-white focus:ring-2 focus:ring-[#501f92]"
            >
              <option value="Activo">Activo (En ejecución)</option>
              <option value="Planificación">Planificación / Arranque</option>
              <option value="En Pausa">En Pausa (Temporal)</option>
              <option value="Cerrado">Cerrado (Completado)</option>
              <option value="Archivado">Archivado (Histórico)</option>
            </select>
          </div>
        </div>

        <div className="text-xs">
          <label className="block font-bold text-[#475569] mb-1">Brief / Alcance General</label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            placeholder="Objetivo estratégico y contexto de esta cuenta..."
            className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92]"
          />
        </div>
      </div>

      {/* 2. Razón Social / NIT (100% Opcional - Desacoplado) */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#501f92]" />
            <h3 className="font-extrabold text-sm text-[#0f172a]">Razón Social / NIT para Facturación</h3>
          </div>
          <span className="text-[10px] text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full font-bold">
            100% Opcional en Orbit
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#64748b] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#334155]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#501f92]" />
            <span>Principio de desacoplamiento Orbit:</span>
          </div>
          <p>
            No exigimos un NIT para operar, asignar equipo ni registrar horas. La razón social se puede asociar ahora, más tarde o dejarse pendiente según los tiempos de contratación del cliente.
          </p>
        </div>

        <div className="text-xs">
          <label className="block font-bold text-[#475569] mb-1">Razón Social Vinculada al Proyecto</label>
          <select
            value={taxEntityId}
            onChange={(e) => setTaxEntityId(e.target.value)}
            className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs font-semibold text-[#0f172a] bg-white focus:ring-2 focus:ring-[#501f92]"
          >
            <option value="none">Sin asignar / Por definir (No bloquea la operación)</option>
            {client?.taxEntities?.map((te) => (
              <option key={te.id} value={te.id}>
                {te.nit} · {te.businessName} {te.isPrimary ? '(Principal de la cuenta)' : ''}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-[#64748b] mt-1 block">
            {client?.taxEntities?.length || 0} razones sociales registradas en el cliente {client?.name || project.clientName}.
          </span>
        </div>
      </div>

      {/* 3. Configuración de Ciclos y Fee Mensual (si aplica) */}
      {isFee && (
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f1f5f9] pb-3">
            <RotateCw className="w-4 h-4 text-[#501f92]" />
            <h3 className="font-extrabold text-sm text-[#0f172a]">Política de Rollover (Fee Mensual)</h3>
          </div>

          <div className="text-xs space-y-3">
            <label className="block font-bold text-[#475569]">Política de Horas no consumidas:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  rolloverPolicy === 'none'
                    ? 'bg-[#f5f3ff] border-[#501f92] ring-2 ring-[#501f92]/20'
                    : 'bg-[#f8fafc] border-[#e2e8f0]'
                }`}
              >
                <input
                  type="radio"
                  name="rollover"
                  value="none"
                  checked={rolloverPolicy === 'none'}
                  onChange={() => setRolloverPolicy('none')}
                  className="mt-0.5 text-[#501f92] focus:ring-[#501f92]"
                />
                <div>
                  <strong className="block text-[#0f172a]">Sin Rollover (Vencimiento mensual)</strong>
                  <span className="text-[11px] text-[#64748b]">
                    Las horas presupuestadas no consumidas en el mes vencen. El nuevo ciclo arranca con la bolsa contractual contratada.
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  rolloverPolicy === 'carry_over'
                    ? 'bg-[#f5f3ff] border-[#501f92] ring-2 ring-[#501f92]/20'
                    : 'bg-[#f8fafc] border-[#e2e8f0]'
                }`}
              >
                <input
                  type="radio"
                  name="rollover"
                  value="carry_over"
                  checked={rolloverPolicy === 'carry_over'}
                  onChange={() => setRolloverPolicy('carry_over')}
                  className="mt-0.5 text-[#501f92] focus:ring-[#501f92]"
                />
                <div>
                  <strong className="block text-[#0f172a]">Rollover Acumulable (Carry-Over)</strong>
                  <span className="text-[11px] text-[#64748b]">
                    El remanente de horas se traspasa como saldo a favor para el siguiente ciclo mensual.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Cambios de Configuración</span>
        </button>
      </div>
    </form>
  );
};
