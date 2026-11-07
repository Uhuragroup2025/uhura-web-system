import React, { useMemo, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Flag } from 'lucide-react';
import type { ProjectClosureReason, ProjectSummaryItem, TaskItem, UserItem } from '../types';
import { normalizeProjectType } from '../types';
import { calculateBusinessDays } from '../health/projectHealthEngine';

interface CloseProjectModalProps {
  project: ProjectSummaryItem & { consumedHours?: number };
  tasks: TaskItem[];                // Tareas del proyecto
  currentUser?: UserItem;
  onClose: () => void;
  onConfirm: (updated: ProjectSummaryItem) => void;
  onGoToTasks: () => void;
}

const REASONS: Array<{ id: ProjectClosureReason; label: string }> = [
  { id: 'delivered_approved', label: 'Entregado y aprobado por el cliente' },
  { id: 'closed_early', label: 'Cerrado anticipadamente' },
  { id: 'cancelled_by_client', label: 'Cancelado por el cliente' }
];

const isDone = (t: TaskItem) => t.completed || t.status === 'completed' || t.status === 'Done';

/**
 * Cierre formal del proyecto.
 * Reglas: (1) no se cierra con tareas pendientes: se resuelven antes;
 * (2) se conserva el histórico (horas, asignaciones); (3) queda registro de autor,
 * fecha, motivo y una foto final de horas, rondas y desviación de fecha.
 */
export const CloseProjectModal: React.FC<CloseProjectModalProps> = ({
  project,
  tasks,
  currentUser,
  onClose,
  onConfirm,
  onGoToTasks
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const [actualEndDate, setActualEndDate] = useState(today);
  const [reason, setReason] = useState<ProjectClosureReason>('delivered_approved');
  const [note, setNote] = useState('');

  const isFee = normalizeProjectType(project.projectType) === 'fee_monthly';
  const pending = tasks.filter((t) => !isDone(t));
  const quoted = project.budgetedHours || 0;
  const executed = project.consumedHours || 0;
  const hoursDelta = executed - quoted;
  const includedRounds = project.scheduleConfig?.includedReworkRounds ?? 0;
  const usedRounds = (project.reworkRounds || []).filter((r) => r.cause === 'client_adjustment').length;
  const baseline = project.baselineEndDate || null;

  const deviation = useMemo(() => {
    if (!baseline || !actualEndDate || baseline === actualEndDate) return baseline ? 0 : null;
    return actualEndDate > baseline
      ? calculateBusinessDays(baseline, actualEndDate)
      : -calculateBusinessDays(actualEndDate, baseline);
  }, [baseline, actualEndDate]);

  const canClose = pending.length === 0 && note.trim().length > 0 && Boolean(actualEndDate);

  const handleConfirm = () => {
    if (!canClose) return;
    onConfirm({
      ...project,
      status: 'Cerrado',
      actualEndDate,
      closure: {
        closedAt: new Date().toISOString(),
        closedByName: currentUser?.name || 'Sistema',
        actualEndDate,
        reason,
        note: note.trim(),
        quotedHours: quoted,
        executedHours: Number(executed.toFixed(1)),
        includedReworkRounds: isFee ? undefined : includedRounds,
        usedReworkRounds: isFee ? undefined : usedRounds,
        baselineEndDate: baseline,
        deviationBusinessDays: deviation
      }
    });
  };

  const row = 'flex items-center justify-between py-1.5 text-xs';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[#e2e8f0] space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#501f92]/10 text-[#501f92] flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#0f172a]">Cerrar proyecto</h3>
              <p className="text-xs text-[#64748b]">{project.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Tareas pendientes */}
        {pending.length > 0 ? (
          <div className="p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-xs text-[#92400e] space-y-2">
            <p className="flex items-start gap-1.5 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Hay {pending.length} tarea{pending.length === 1 ? '' : 's'} sin completar. Resuélvelas o márcalas antes de cerrar.
            </p>
            <button onClick={onGoToTasks} className="px-3 py-1.5 rounded-lg bg-white border border-[#fde68a] font-bold cursor-pointer hover:bg-[#fef3c7]">
              Ir a Tareas
            </button>
          </div>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-[#166534] font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Todas las tareas están completadas ({tasks.length}).
          </p>
        )}

        {/* 2. Foto final */}
        <div className="rounded-2xl border border-[#e2e8f0] px-4 py-2 divide-y divide-[#f1f5f9]">
          <div className={row}>
            <span className="text-[#64748b]">Horas ejecutadas / cotizadas</span>
            <span className="font-mono font-bold text-[#0f172a]">
              {executed.toFixed(1)}h / {quoted}h{' '}
              <span className={hoursDelta > 0 ? 'text-[#b91c1c]' : 'text-[#15803d]'}>
                ({hoursDelta > 0 ? '+' : ''}{hoursDelta.toFixed(1)}h)
              </span>
            </span>
          </div>
          {!isFee && (
            <div className={row}>
              <span className="text-[#64748b]">Rondas de ajuste usadas</span>
              <span className={`font-bold ${usedRounds > includedRounds ? 'text-[#b91c1c]' : 'text-[#0f172a]'}`}>
                {usedRounds} de {includedRounds}{usedRounds > includedRounds ? ` (+${usedRounds - includedRounds} adicionales)` : ''}
              </span>
            </div>
          )}
          <div className={row}>
            <span className="text-[#64748b]">Línea base de entrega</span>
            <span className="font-bold text-[#0f172a]">{baseline || 'Sin línea base'}</span>
          </div>
          {deviation !== null && (
            <div className={row}>
              <span className="text-[#64748b]">Desviación de fecha</span>
              <span className={`font-bold ${deviation > 0 ? 'text-[#b91c1c]' : 'text-[#15803d]'}`}>
                {deviation === 0 ? 'En fecha' : `${deviation > 0 ? '+' : ''}${deviation} días hábiles`}
              </span>
            </div>
          )}
        </div>

        {/* 3. Datos del cierre */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="space-y-1 block">
            <span className="font-semibold text-[#475569] block">Fecha real de entrega</span>
            <input type="date" value={actualEndDate} onChange={(e) => setActualEndDate(e.target.value)} className="w-full p-2 rounded-xl border border-[#cbd5e1] font-semibold text-[#0f172a]" />
          </label>
          <label className="space-y-1 block">
            <span className="font-semibold text-[#475569] block">Motivo</span>
            <select value={reason} onChange={(e) => setReason(e.target.value as ProjectClosureReason)} className="w-full p-2 rounded-xl border border-[#cbd5e1] font-semibold text-[#0f172a] bg-white">
              {REASONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </label>
          <label className="space-y-1 block sm:col-span-2">
            <span className="font-semibold text-[#475569] block">Aprendizajes y observaciones *</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Qué funcionó, qué se desvió y qué ajustar en la próxima cotización."
              className="w-full p-2 rounded-xl border border-[#cbd5e1] text-[#0f172a]"
            />
          </label>
        </div>

        <p className="text-[11px] text-[#64748b]">
          El histórico de horas y tareas se conserva. El proyecto queda en estado <strong>Cerrado</strong> con registro de quién, cuándo y por qué.
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl cursor-pointer">Cancelar</button>
          <button
            onClick={handleConfirm}
            disabled={!canClose}
            className="px-4 py-2 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cerrar proyecto
          </button>
        </div>
      </div>
    </div>
  );
};
