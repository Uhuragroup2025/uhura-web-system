import React, { useState } from 'react';
import { CalendarRange, RefreshCw, X } from 'lucide-react';
import type { ProjectSummaryItem, UserItem } from '../types';
import { contractEndDate, daysUntil, RENEWAL_NOTICE_DAYS } from '../schedule/feeCycles';

interface FeeContractSectionProps {
  project: ProjectSummaryItem;
  currentUser?: UserItem;
  canEdit: boolean;
  onUpdateProject?: (p: ProjectSummaryItem) => void;
  onSelectCycle?: (key: string) => void;
}

const ROLLOVER_LABEL: Record<string, string> = {
  none: 'No se acumulan',
  carry_over: 'Pasan al mes siguiente',
  contractual_cap: 'Pasan hasta un 25 %'
};

/**
 * Fee mensual: vigencia del contrato, ciclos compactos y renovación.
 * Historial corto por defecto: mes anterior, actual y siguiente; el resto, agrupado por año bajo demanda.
 */
export const FeeContractSection: React.FC<FeeContractSectionProps> = ({ project, currentUser, canEdit, onUpdateProject, onSelectCycle }) => {
  const cycles = project.monthlyCycles || [];
  const [showAll, setShowAll] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const lastMonthlyHours = cycles[cycles.length - 1]?.quotedHours || project.budgetedHours || 0;
  const [renewMonths, setRenewMonths] = useState(project.contractMonths && project.contractMonths <= 12 ? project.contractMonths : 6);
  const [renewHours, setRenewHours] = useState(lastMonthlyHours);
  const [renewNote, setRenewNote] = useState('');

  if (!project.contractStartDate || !project.contractMonths) return null;

  const activeIdx = Math.max(0, cycles.findIndex((c) => c.status === 'active'));
  const near = cycles.slice(Math.max(0, activeIdx - 1), activeIdx + 2);
  const visible = showAll ? cycles : near;
  const years = Array.from(new Set(visible.map((c) => c.monthKey.slice(0, 4))));
  const daysLeft = project.contractEndDate ? daysUntil(project.contractEndDate) : null;
  const monthNumber = cycles.filter((c) => c.status !== 'upcoming').length;

  const handleRenew = () => {
    if (!onUpdateProject || renewMonths < 1 || renewHours <= 0) return;
    const totalMonths = (project.contractMonths || 0) + renewMonths;
    onUpdateProject({
      ...project,
      contractMonths: totalMonths,
      contractEndDate: contractEndDate(project.contractStartDate!, totalMonths),
      endDate: contractEndDate(project.contractStartDate!, totalMonths),
      contractRenewals: [
        ...(project.contractRenewals || []),
        { renewedAt: new Date().toISOString(), renewedByName: currentUser?.name || 'Sistema', addedMonths: renewMonths, monthlyHours: renewHours, note: renewNote.trim() || undefined }
      ]
    });
    setIsRenewOpen(false);
    setRenewNote('');
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e2e8f0] p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-[#501f92]" />
            <h3 className="font-extrabold text-sm text-[#0f172a]">Contrato y ciclos mensuales</h3>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">
            {project.contractStartDate} → {project.contractEndDate} · Mes {Math.min(monthNumber, cycles.length)} de {cycles.length} · Horas no usadas: {ROLLOVER_LABEL[project.rolloverPolicy || 'none']}
            {(project.contractRenewals || []).length > 0 && ` · ${project.contractRenewals!.length} renovación(es)`}
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setIsRenewOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer self-start sm:self-auto ${
              daysLeft !== null && daysLeft <= RENEWAL_NOTICE_DAYS
                ? 'bg-[#501f92] hover:bg-[#3d1572] text-white'
                : 'bg-[#faf5ff] hover:bg-[#ede9fe] text-[#501f92] border border-[#ddd6fe]'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Renovar fee
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[520px]">
          <thead>
            <tr className="text-[10px] uppercase text-[#64748b] border-b border-[#f1f5f9]">
              <th className="text-left py-2 font-bold">Mes</th>
              <th className="text-right py-2 font-bold">Bolsa</th>
              <th className="text-right py-2 font-bold">Ejecutadas</th>
              <th className="text-right py-2 font-bold">Desvío</th>
              <th className="text-right py-2 font-bold">Estado</th>
            </tr>
          </thead>
          {years.map((y) => (
            <tbody key={y} className="divide-y divide-[#f8fafc]">
              {showAll && years.length > 1 && (
                <tr><td colSpan={5} className="pt-3 pb-1 text-[10px] font-extrabold text-[#94a3b8]">{y}</td></tr>
              )}
              {visible.filter((c) => c.monthKey.startsWith(y)).map((c) => {
                const bag = c.quotedHours + (c.rolloverHoursIn || 0);
                const delta = c.executedHours - bag;
                return (
                  <tr key={c.monthKey} className="hover:bg-[#fbfcfe] cursor-pointer" onClick={() => onSelectCycle?.(c.monthKey)} title="Ver este mes">
                    <td className="py-2 font-bold text-[#0f172a]">{c.monthLabel}</td>
                    <td className="py-2 text-right font-mono">{c.quotedHours}h{c.rolloverHoursIn ? <span className="text-[#64748b]"> +{c.rolloverHoursIn}</span> : ''}</td>
                    <td className="py-2 text-right font-mono">{c.executedHours}h</td>
                    <td className={`py-2 text-right font-mono ${c.status === 'upcoming' ? 'text-[#94a3b8]' : delta > 0 ? 'text-[#b91c1c]' : 'text-[#15803d]'}`}>
                      {c.status === 'upcoming' ? '—' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}h`}
                    </td>
                    <td className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'active' ? 'bg-[#ecfdf5] text-[#166534]' : c.status === 'closed' ? 'bg-[#f1f5f9] text-[#475569]' : 'bg-[#faf5ff] text-[#501f92]'
                      }`}>
                        {c.status === 'active' ? 'En curso' : c.status === 'closed' ? 'Cerrado' : 'Próximo'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>
      {cycles.length > near.length && (
        <button type="button" onClick={() => setShowAll(!showAll)} className="text-xs font-bold text-[#501f92] hover:underline cursor-pointer">
          {showAll ? 'Ver solo meses cercanos' : `Ver los ${cycles.length} meses del contrato`}
        </button>
      )}

      {isRenewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={(e) => { if (e.target === e.currentTarget) setIsRenewOpen(false); }}>
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#0f172a]">Renovar fee</h3>
              <button onClick={() => setIsRenewOpen(false)} className="p-1 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-[#64748b]">Agrega un nuevo periodo al mismo proyecto. El histórico de meses anteriores se conserva.</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="space-y-1 block">
                <span className="font-semibold text-[#475569] block">Meses adicionales</span>
                <input type="number" min="1" max="36" value={renewMonths} onChange={(e) => setRenewMonths(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-full p-2 rounded-xl border border-[#cbd5e1] font-bold" />
              </label>
              <label className="space-y-1 block">
                <span className="font-semibold text-[#475569] block">Horas por mes</span>
                <input type="number" min="1" value={renewHours} onChange={(e) => setRenewHours(Math.max(0, Number(e.target.value) || 0))} className="w-full p-2 rounded-xl border border-[#cbd5e1] font-bold" />
              </label>
              <label className="space-y-1 block col-span-2">
                <span className="font-semibold text-[#475569] block">Nota (opcional)</span>
                <input value={renewNote} onChange={(e) => setRenewNote(e.target.value)} placeholder="Ej: renovación anual con ajuste de horas" className="w-full p-2 rounded-xl border border-[#cbd5e1]" />
              </label>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Nuevo fin del contrato: <strong>{contractEndDate(project.contractStartDate!, (project.contractMonths || 0) + renewMonths)}</strong>
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <button onClick={() => setIsRenewOpen(false)} className="px-4 py-2 text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl cursor-pointer">Cancelar</button>
              <button onClick={handleRenew} className="px-4 py-2 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] rounded-xl cursor-pointer">Renovar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
