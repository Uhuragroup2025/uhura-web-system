import React, { useState, useMemo } from 'react';
import { ProjectSummaryItem, TaskItem, ProjectType } from './types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  X,
  Play,
  Layers,
  Sparkles,
  Info,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface ScheduleProjectModalProps {
  isOpen: boolean;
  project: ProjectSummaryItem;
  projectTasks: TaskItem[];
  onClose: () => void;
  onConfirmSchedule: (payload: {
    startDate: string;
    endDate: string;
    updatedTasks: TaskItem[];
    notifyTeam: boolean;
  }) => void;
}

// Helper: suma días evitando fines de semana si es posible o simplemente en calendario
function addDays(dateStr: string, daysToAdd: number): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + daysToAdd);
  return d.toISOString().slice(0, 10);
}

function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return 'Sin fecha';
  try {
    const d = new Date(dateStr + 'T12:00:00Z');
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export const ScheduleProjectModal: React.FC<ScheduleProjectModalProps> = ({
  isOpen,
  project,
  projectTasks,
  onClose,
  onConfirmSchedule
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const initialStartDate = project.startDate || todayStr;

  // Duración en semanas desde cotización o fallback a 4
  const quoteWeeks = (project.scheduleConfig as any)?.targetDurationWeeks || 4;
  const [durationWeeks, setDurationWeeks] = useState<number>(quoteWeeks);
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [notifyTeam, setNotifyTeam] = useState<boolean>(true);
  const [autoRecalculateDeadlines, setAutoRecalculateDeadlines] = useState<boolean>(true);

  // Calcular fecha final estimada
  const estimatedEndDate = useMemo(() => {
    if (!startDate) return '';
    const days = project.projectType === 'fee_monthly' ? 30 : Math.max(7, durationWeeks * 7);
    return addDays(startDate, days);
  }, [startDate, durationWeeks, project.projectType]);

  // Recalcular y sugerir fechas límites (deadlines) para las tareas que vinieron del alcance
  const suggestedTasksWithDeadlines = useMemo(() => {
    if (!autoRecalculateDeadlines || !startDate || !estimatedEndDate) {
      return projectTasks;
    }

    const totalDays = project.projectType === 'fee_monthly' ? 30 : Math.max(7, durationWeeks * 7);
    const count = projectTasks.length;
    if (count === 0) return [];

    return projectTasks.map((t, idx) => {
      // Distribución progresiva a lo largo de la duración
      // Las tareas se escalonan proporcionalmente a su orden
      const progressFraction = (idx + 1) / count;
      const daysOffset = Math.max(2, Math.round(progressFraction * totalDays));
      const calculatedDue = addDays(startDate, Math.min(daysOffset, totalDays));

      return {
        ...t,
        date: startDate,
        dueDate: calculatedDue,
        dueText: `Entrega sugerida (${formatDateDisplay(calculatedDue)})`
      };
    });
  }, [projectTasks, autoRecalculateDeadlines, startDate, estimatedEndDate, durationWeeks, project.projectType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSchedule({
      startDate,
      endDate: estimatedEndDate,
      updatedTasks: suggestedTasksWithDeadlines,
      notifyTeam
    });
  };

  const isFee = project.projectType === 'fee_monthly';

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#140b24] to-[#2e0e57] text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-white/10 text-[#d4ff4a]">
                <Play className="w-4 h-4 fill-current" />
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider text-[#d4ff4a]">
                Kick-off & Gobernanza de Cronograma
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              {project.startDate ? 'Reprogramar / Iniciar Proyecto' : 'Programar Inicio de Proyecto'}
            </h2>
            <p className="text-xs text-white/70">
              {project.name} · Cliente: <strong>{project.clientName}</strong> ({isFee ? 'Fee Mensual' : `${durationWeeks} semanas estimadas`})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Explicación de valor de negocio */}
          <div className="p-3.5 rounded-2xl bg-[#faf5ff] border border-[#e9d5ff] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#501f92] shrink-0 mt-0.5" />
            <div className="space-y-1 text-[#3b0764]">
              <p className="font-bold text-xs">
                Alineación automática del equipo con el alcance comercial
              </p>
              <p className="text-[11px] leading-relaxed text-[#501f92]">
                Al definir la fecha de arranque, Orbit calcula la entrega final y <strong>sugiere automáticamente los deadlines para cada una de las {projectTasks.length} actividades</strong> traídas de la cotización para que el equipo arranque con claridad absoluta.
              </p>
            </div>
          </div>

          {/* Configuración de Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Fecha de Inicio */}
            <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
              <label className="font-extrabold text-[#0f172a] block text-xs flex items-center justify-between">
                <span>Fecha Oficial de Inicio (Kick-off):</span>
                <span className="text-[10px] font-bold text-[#501f92]">Requerido</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] font-bold text-xs text-[#0f172a] bg-white focus:ring-2 focus:ring-[#501f92]"
              />
              <p className="text-[10px] text-[#64748b]">
                {isFee ? 'Día de arranque del ciclo mensual operativo' : 'Fecha en que el equipo técnico inicia actividades'}
              </p>
            </div>

            {/* 2. Duración y Fecha de Entrega */}
            <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
              <label className="font-extrabold text-[#0f172a] block text-xs flex items-center justify-between">
                <span>{isFee ? 'Ciclo Recurrente:' : 'Duración Estimada:'}</span>
                <span className="text-[10px] font-bold text-[#059669]">
                  {isFee ? 'Mensual' : `~${durationWeeks * 5} días hábiles`}
                </span>
              </label>
              {!isFee ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-20 p-2.5 rounded-xl border border-[#cbd5e1] font-bold text-xs text-[#0f172a] bg-white text-center focus:ring-2 focus:ring-[#501f92]"
                  />
                  <span className="text-xs font-semibold text-[#475569]">semanas</span>
                  <span className="text-[11px] text-[#64748b] ml-auto">
                    Entrega: <strong className="text-[#0f172a]">{formatDateDisplay(estimatedEndDate)}</strong>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <Clock className="w-4 h-4 text-[#501f92]" />
                  <span className="font-semibold text-[#0f172a]">30 días recurrentes</span>
                  <span className="text-[11px] text-[#64748b] ml-auto">
                    Corte: <strong className="text-[#0f172a]">{formatDateDisplay(estimatedEndDate)}</strong>
                  </span>
                </div>
              )}
              <p className="text-[10px] text-[#64748b]">
                Proyección de finalización: {formatDateDisplay(estimatedEndDate)}
              </p>
            </div>
          </div>

          {/* Sincronización Automática de Deadlines */}
          <div className="p-4 rounded-2xl bg-white border border-[#cbd5e1] space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#0f172a]">
                <input
                  type="checkbox"
                  checked={autoRecalculateDeadlines}
                  onChange={(e) => setAutoRecalculateDeadlines(e.target.checked)}
                  className="rounded text-[#501f92] focus:ring-[#501f92]"
                />
                <span>Recalcular y sugerir fechas límites (deadlines) para las {projectTasks.length} actividades</span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10b981]/10 text-[#059669]">
                Recomendado
              </span>
            </div>

            {autoRecalculateDeadlines && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                  Vista previa de la secuencia de entregas:
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 divide-y divide-[#f1f5f9]">
                  {suggestedTasksWithDeadlines.slice(0, 8).map((t, i) => (
                    <div key={t.id || i} className="pt-1.5 pb-1 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 truncate max-w-[340px]">
                        <span className="font-mono text-[#94a3b8] w-4 text-right">{i + 1}.</span>
                        <span className="font-medium text-[#0f172a] truncate">{t.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f8fafc] text-[#475569] border border-[#e2e8f0]">
                          {t.frente || 'Entregable'}
                        </span>
                        <span className="font-bold text-[#501f92] text-[10.5px]">
                          📅 {formatDateDisplay(t.dueDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {suggestedTasksWithDeadlines.length > 8 && (
                    <p className="text-[10px] text-[#64748b] pt-1 text-center italic">
                      + {suggestedTasksWithDeadlines.length - 8} actividades adicionales recibirán deadline escalonado.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notificación al equipo */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#334155]">
              <input
                type="checkbox"
                checked={notifyTeam}
                onChange={(e) => setNotifyTeam(e.target.checked)}
                className="rounded text-[#501f92] focus:ring-[#501f92]"
              />
              <span>Alinear y notificar al equipo del proyecto (Líder y Especialistas asignados)</span>
            </label>
            <span className="text-[10px] text-[#64748b]">Líder: {project.leadName}</span>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#3d1572] active:bg-[#2e0e57] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#d4ff4a]" />
              <span>Confirmar Inicio & Sincronizar Cronograma →</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
