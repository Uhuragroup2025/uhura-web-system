import React, { useState } from 'react';
import { ProjectPhaseItem, TaskItem } from './types';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  GripVertical
} from 'lucide-react';

interface ManagePhasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  phases: ProjectPhaseItem[];
  tasks: TaskItem[];
  onSavePhases: (updatedPhases: ProjectPhaseItem[]) => void;
}

export const ManagePhasesModal: React.FC<ManagePhasesModalProps> = ({
  isOpen,
  onClose,
  projectName,
  phases: initialPhases,
  tasks,
  onSavePhases
}) => {
  const [phases, setPhases] = useState<ProjectPhaseItem[]>(() => {
    if (initialPhases && initialPhases.length > 0) {
      return JSON.parse(JSON.stringify(initialPhases));
    }
    return [
      { id: 'ph-1', name: 'Discovery & Arquitectura', order: 1, status: 'completed' },
      { id: 'ph-2', name: 'UI/UX & Prototipado', order: 2, status: 'in_progress' },
      { id: 'ph-3', name: 'Implementación / Dev', order: 3, status: 'pending' },
      { id: 'ph-4', name: 'QA & Testing', order: 4, status: 'pending' },
      { id: 'ph-5', name: 'Despliegue & Cierre', order: 5, status: 'pending' }
    ];
  });

  const [newPhaseName, setNewPhaseName] = useState('');
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddPhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhaseName.trim()) return;

    const newPhase: ProjectPhaseItem = {
      id: `ph-${Date.now()}`,
      name: newPhaseName.trim(),
      order: phases.length + 1,
      status: 'pending'
    };

    setPhases([...phases, newPhase]);
    setNewPhaseName('');
    setWarningMsg(null);
  };

  const handleUpdatePhase = (id: string, updates: Partial<ProjectPhaseItem>) => {
    setPhases(phases.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleMovePhase = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === phases.length - 1)
    ) {
      return;
    }

    const newPhases = [...phases];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newPhases[index];
    newPhases[index] = newPhases[targetIndex];
    newPhases[targetIndex] = temp;

    // Update order numbers
    newPhases.forEach((p, idx) => {
      p.order = idx + 1;
    });

    setPhases(newPhases);
  };

  const handleDeletePhase = (id: string, name: string) => {
    const assignedTasks = tasks.filter(
      (t) => (t.phase?.toLowerCase() === name.toLowerCase() || t.fase?.toLowerCase() === name.toLowerCase())
    );

    if (assignedTasks.length > 0) {
      setWarningMsg(
        `La fase "${name}" tiene ${assignedTasks.length} tareas vinculadas. Te recomendamos reasignar las tareas antes de eliminarla.`
      );
    }

    const remaining = phases.filter((p) => p.id !== id);
    remaining.forEach((p, idx) => {
      p.order = idx + 1;
    });
    setPhases(remaining);
  };

  const handleSave = () => {
    onSavePhases(phases);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-[#e2e8f0] flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 md:p-6 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#501f92]/10 border border-[#501f92]/20 flex items-center justify-center text-[#501f92] shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-[#0f172a] truncate">
                Configuración de Fases del Proyecto
              </h2>
              <p className="text-xs text-[#64748b] truncate">{projectName} · Ciclo de vida y cronograma</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] flex items-center justify-center cursor-pointer transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 md:p-6 overflow-y-auto overflow-x-hidden space-y-4 sm:space-y-5 flex-1 custom-scrollbar">
          {warningMsg && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#fffbeb] border border-[#fde68a] text-xs text-[#92400e] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="font-bold">Aviso importante: </span>
                {warningMsg}
              </div>
              <button
                onClick={() => setWarningMsg(null)}
                className="text-[#92400e] hover:text-[#78350f] text-xs font-bold shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
              Define las etapas de ejecución para este proyecto. Puedes reordenarlas, fijar fechas estimadas y cambiar su estado conforme el equipo avanza.
            </p>
          </div>

          {/* Phases List */}
          <div className="space-y-3">
            {phases.map((phase, index) => {
              const taskCount = tasks.filter(
                (t) => (t.phase?.toLowerCase() === phase.name.toLowerCase() || t.fase?.toLowerCase() === phase.name.toLowerCase())
              ).length;

              return (
                <div
                  key={phase.id}
                  className="p-3 sm:p-4 rounded-2xl border border-[#e2e8f0] bg-white hover:border-[#cbd5e1] transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
                >
                  {/* Top / Left Section: Reorder, Order Num, Name input, Tasks badge */}
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMovePhase(index, 'up')}
                        className={`p-1 rounded text-[#94a3b8] hover:text-[#501f92] hover:bg-[#f1f5f9] transition-colors ${
                          index === 0 ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        title="Subir fase"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={index === phases.length - 1}
                        onClick={() => handleMovePhase(index, 'down')}
                        className={`p-1 rounded text-[#94a3b8] hover:text-[#501f92] hover:bg-[#f1f5f9] transition-colors ${
                          index === phases.length - 1 ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        title="Bajar fase"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="w-6 h-6 rounded-full bg-[#f1f5f9] text-[#501f92] font-bold text-xs flex items-center justify-center shrink-0">
                      {phase.order}
                    </span>

                    <input
                      type="text"
                      value={phase.name}
                      onChange={(e) => handleUpdatePhase(phase.id, { name: e.target.value })}
                      className="text-xs sm:text-sm font-bold text-[#0f172a] bg-transparent border-b border-transparent hover:border-[#cbd5e1] focus:border-[#501f92] px-1 py-0.5 outline-none flex-1 min-w-0"
                      placeholder="Nombre de la fase"
                    />

                    <span className="text-[10px] font-medium text-[#64748b] bg-[#f8fafc] px-2 py-0.5 rounded-full border border-[#e2e8f0] shrink-0 whitespace-nowrap">
                      {taskCount} tareas
                    </span>
                  </div>

                  {/* Bottom / Right Section: Dates, Status, Delete */}
                  <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-[#f1f5f9] shrink-0">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] flex-1 sm:flex-none">
                      <input
                        type="date"
                        value={phase.startDate || ''}
                        onChange={(e) => handleUpdatePhase(phase.id, { startDate: e.target.value })}
                        className="text-[11px] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-2 py-1 outline-none text-[#334155] focus:border-[#501f92] min-w-0 flex-1 sm:flex-none"
                        title="Fecha inicio"
                      />
                      <span className="text-[#94a3b8] font-bold">→</span>
                      <input
                        type="date"
                        value={phase.endDate || ''}
                        onChange={(e) => handleUpdatePhase(phase.id, { endDate: e.target.value })}
                        className="text-[11px] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-2 py-1 outline-none text-[#334155] focus:border-[#501f92] min-w-0 flex-1 sm:flex-none"
                        title="Fecha fin"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <select
                        value={phase.status}
                        onChange={(e) =>
                          handleUpdatePhase(phase.id, {
                            status: e.target.value as 'pending' | 'in_progress' | 'completed'
                          })
                        }
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                          phase.status === 'completed'
                            ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                            : phase.status === 'in_progress'
                            ? 'bg-[#f5f3ff] text-[#501f92] border-[#e9d5ff]'
                            : 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]'
                        }`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En proceso</option>
                        <option value="completed">Completada</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDeletePhase(phase.id, phase.name)}
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#fee2e2]/50 transition-colors cursor-pointer"
                        title="Eliminar fase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Phase Form */}
          <form onSubmit={handleAddPhase} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
            <input
              type="text"
              value={newPhaseName}
              onChange={(e) => setNewPhaseName(e.target.value)}
              placeholder="Ej: QA & Pruebas de Carga..."
              className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] focus:border-[#501f92] focus:bg-white outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!newPhaseName.trim()}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 ${
                newPhaseName.trim()
                  ? 'bg-[#501f92] hover:bg-[#381566] text-white cursor-pointer'
                  : 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Fase</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#cbd5e1] text-xs font-bold text-[#475569] hover:bg-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            Guardar Fases
          </button>
        </div>
      </div>
    </div>
  );
};
