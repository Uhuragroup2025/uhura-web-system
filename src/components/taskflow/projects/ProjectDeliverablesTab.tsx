import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  X,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  ProjectDeliverable,
  DeliverableRoleBudget,
  TaskItem,
  STANDARD_UHURA_ROLES
} from '../types';

interface ProjectDeliverablesTabProps {
  deliverables: ProjectDeliverable[];
  tasks: TaskItem[];
  projectName: string;
  onUpdateDeliverables: (newDeliverables: ProjectDeliverable[]) => void;
  onNavigateToTasksWithFilter: (frenteName: string) => void;
}

export const ProjectDeliverablesTab: React.FC<ProjectDeliverablesTabProps> = ({
  deliverables,
  tasks,
  projectName,
  onUpdateDeliverables,
  onNavigateToTasksWithFilter
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<ProjectDeliverable | null>(null);

  // Form State for new/edit deliverable
  const [delName, setDelName] = useState('');
  const [delDescription, setDelDescription] = useState('');
  const [delRoleBudgets, setDelRoleBudgets] = useState<DeliverableRoleBudget[]>([]);
  const [roleInput, setRoleInput] = useState<string>(STANDARD_UHURA_ROLES[0]);
  const [hoursInput, setHoursInput] = useState<number>(0);

  const openCreateModal = () => {
    setEditingDeliverable(null);
    setDelName('');
    setDelDescription('');
    setDelRoleBudgets([
      { id: `rb-${Date.now()}-1`, roleId: STANDARD_UHURA_ROLES[0], roleName: STANDARD_UHURA_ROLES[0], quotedHours: 0 }
    ]);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (del: ProjectDeliverable) => {
    setEditingDeliverable(del);
    setDelName(del.name);
    setDelDescription(del.description || '');
    setDelRoleBudgets(del.roleBudgets ? [...del.roleBudgets] : []);
    setIsCreateModalOpen(true);
  };

  const handleAddRoleBudget = () => {
    if (!roleInput.trim()) return;
    setDelRoleBudgets((prev) => [
      ...prev,
      {
        id: `rb-${Date.now()}-${Math.random()}`,
        roleId: roleInput,
        roleName: roleInput,
        quotedHours: Math.max(0, Number(hoursInput) || 0)
      }
    ]);
    setHoursInput(0);
  };

  const handleRemoveRoleBudget = (rbId: string) => {
    setDelRoleBudgets((prev) => prev.filter((r) => r.id !== rbId));
  };

  const handleSaveDeliverable = () => {
    if (!delName.trim()) return;

    if (editingDeliverable) {
      // Update existing
      const updated = deliverables.map((d) =>
        d.id === editingDeliverable.id
          ? {
              ...d,
              name: delName.trim(),
              description: delDescription.trim(),
              roleBudgets: delRoleBudgets
            }
          : d
      );
      onUpdateDeliverables(updated);
    } else {
      // Create new
      const newDel: ProjectDeliverable = {
        id: `del-${Date.now()}`,
        projectId: deliverables[0]?.projectId || 'prj-current',
        name: delName.trim(),
        description: delDescription.trim(),
        order: deliverables.length + 1,
        status: 'in_progress',
        roleBudgets: delRoleBudgets
      };
      onUpdateDeliverables([...deliverables, newDel]);
    }

    setIsCreateModalOpen(false);
  };

  const handleDeleteDeliverable = (delId: string) => {
    if (confirm('¿Estás seguro de eliminar este frente? Las tareas existentes conservarán su registro de tiempo.')) {
      onUpdateDeliverables(deliverables.filter((d) => d.id !== delId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-[#e2e8f0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#501f92]" />
            <h3 className="font-extrabold text-base text-[#0f172a]">
              Frentes de Trabajo & Presupuestos por Rol
            </h3>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">
            Cada frente agrupa entregables y define la bolsa de horas cotizadas por especialidad. Las horas de rol se ejecutan mediante las tareas.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs cursor-pointer self-start sm:self-auto transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir Frente</span>
        </button>
      </div>

      {/* Deliverables Cards List */}
      <div className="space-y-4">
        {deliverables.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-[#e2e8f0] text-[#94a3b8] space-y-3">
            <Layers className="w-8 h-8 mx-auto text-[#cbd5e1]" />
            <p className="text-sm font-semibold">No hay frentes ni entregables configurados aún.</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#501f92] text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear el primer frente</span>
            </button>
          </div>
        ) : (
          deliverables.map((del) => {
            const delQuoted = del.roleBudgets?.reduce((acc, rb) => acc + (rb.quotedHours || 0), 0) || 0;
            const delTasks = tasks.filter((t) => t.deliverableId === del.id || t.frente === del.name);
            const delExecuted = delTasks.reduce((acc, t) => acc + ((t.consumedSeconds || 0) / 3600), 0);
            const delCompletedCount = delTasks.filter((t) => t.completed || t.status === 'Done').length;
            const delPercent = delQuoted > 0 ? Math.round((delExecuted / delQuoted) * 100) : 0;

            return (
              <div
                key={del.id}
                className="bg-white rounded-3xl border border-[#e2e8f0] p-5 shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#f1f5f9] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#501f92]/10 text-[#501f92] font-extrabold text-xs flex items-center justify-center">
                        {del.order || 1}
                      </span>
                      <h4 className="font-extrabold text-base text-[#0f172a]">{del.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[#475569]">
                        {delTasks.length} tareas ({delCompletedCount} listas)
                      </span>
                    </div>
                    {del.description && (
                      <p className="text-xs text-[#64748b] pl-8">{del.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pl-8 sm:pl-0">
                    <button
                      onClick={() => onNavigateToTasksWithFilter(del.name)}
                      className="px-2.5 py-1 rounded-lg bg-[#f8fafc] hover:bg-[#501f92] hover:text-white border border-[#e2e8f0] text-xs font-bold text-[#475569] transition-colors cursor-pointer"
                    >
                      Ver tareas ({delTasks.length})
                    </button>
                    <button
                      onClick={() => openEditModal(del)}
                      className="p-1.5 rounded-lg text-[#64748b] hover:text-[#501f92] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                      title="Editar frente y roles"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDeliverable(del.id)}
                      className="p-1.5 rounded-lg text-[#64748b] hover:text-[#ef4444] hover:bg-[#fee2e2]/40 transition-colors cursor-pointer"
                      title="Eliminar frente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rollup Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#f8fafc] p-3 rounded-2xl border border-[#e2e8f0]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#64748b] block">Horas Cotizadas</span>
                    <span className="font-extrabold font-mono text-sm text-[#0f172a] mt-0.5 block">
                      {delQuoted > 0 ? `${delQuoted.toFixed(1)}h` : '0h (Sin bolsa)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#64748b] block">Horas Ejecutadas</span>
                    <span className={`font-extrabold font-mono text-sm mt-0.5 block ${
                      delQuoted > 0 && delExecuted > delQuoted ? 'text-[#ef4444]' : 'text-[#0f172a]'
                    }`}>
                      {delExecuted.toFixed(1)}h
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#64748b] block">Avance Tareas</span>
                    <span className="font-extrabold text-sm text-[#0f172a] mt-0.5 block">
                      {delTasks.length > 0 ? `${Math.round((delCompletedCount / delTasks.length) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#64748b] block">Consumo Presupuesto</span>
                    <span className="font-extrabold font-mono text-sm text-[#501f92] mt-0.5 block">
                      {delQuoted > 0 ? `${delPercent}%` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Roles Budget Table */}
                <div>
                  <h5 className="text-xs font-extrabold text-[#334155] uppercase tracking-wider mb-2">
                    Presupuesto por Rol en este Frente:
                  </h5>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f8fafc]">
                          <th className="py-2 px-3">ROL / ESPECIALIDAD</th>
                          <th className="py-2 px-3 text-right">HORAS COTIZADAS</th>
                          <th className="py-2 px-3 text-right">HORAS EJECUTADAS</th>
                          <th className="py-2 px-3 text-right">DESVIACIÓN</th>
                          <th className="py-2 px-3 text-right pr-4">ESTADO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f1f5f9]">
                        {del.roleBudgets && del.roleBudgets.length > 0 ? (
                          del.roleBudgets.map((rb) => {
                            // Find executed hours in tasks matching role
                            const roleTasks = delTasks.filter(
                              (t) => t.budgetedRole?.toLowerCase() === rb.roleName.toLowerCase()
                            );
                            const roleExecuted = roleTasks.reduce(
                              (acc, t) => acc + ((t.consumedSeconds || 0) / 3600),
                              0
                            );
                            const diff = roleExecuted - rb.quotedHours;
                            const isOver = rb.quotedHours > 0 && roleExecuted > rb.quotedHours;

                            return (
                              <tr key={rb.id} className="hover:bg-[#f8fafc]">
                                <td className="py-2 px-3 font-semibold text-[#0f172a]">
                                  {rb.roleName}
                                  {rb.quotedHours === 0 && (
                                    <span className="text-[9px] text-[#64748b] ml-1.5 font-normal">
                                      (0h válido · Frente organizativo)
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-[#501f92]">
                                  {rb.quotedHours}h
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-[#0f172a]">
                                  {roleExecuted.toFixed(1)}h
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold">
                                  {rb.quotedHours === 0 ? (
                                    <span className="text-[#64748b] font-normal">{roleExecuted.toFixed(1)}h reg.</span>
                                  ) : diff > 0 ? (
                                    <span className="text-[#ef4444]">+{diff.toFixed(1)}h ⚠️</span>
                                  ) : (
                                    <span className="text-[#10b981]">{diff.toFixed(1)}h</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-right pr-4">
                                  {isOver ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#dc2626]">
                                      Desvío
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#047857]">
                                      En rango
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-3 px-3 text-center text-[#94a3b8]">
                              Sin roles presupuestados aún. Clic en editar para asignar horas.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Crear o Editar Frente */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0f172a]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#e2e8f0] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <h3 className="font-extrabold text-base text-[#0f172a]">
                {editingDeliverable ? 'Editar Frente y Presupuestos' : 'Nuevo Frente de Trabajo'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#475569] font-bold mb-1">Nombre del Frente / Entregable *</label>
                <input
                  type="text"
                  value={delName}
                  onChange={(e) => setDelName(e.target.value)}
                  placeholder="ej. Redes Sociales, Landing Page, Discovery..."
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs focus:ring-2 focus:ring-[#501f92]"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-bold mb-1">Descripción / Alcance (Opcional)</label>
                <textarea
                  value={delDescription}
                  onChange={(e) => setDelDescription(e.target.value)}
                  rows={2}
                  placeholder="Qué incluye este frente..."
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs focus:ring-2 focus:ring-[#501f92]"
                />
              </div>

              {/* Roles & Hours builder */}
              <div className="pt-2 border-t border-[#f1f5f9] space-y-2">
                <label className="block text-[#475569] font-bold">
                  Bolsa de Horas Cotizadas por Rol (Permite 0h):
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs bg-white"
                  >
                    {STANDARD_UHURA_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={hoursInput}
                    onChange={(e) => setHoursInput(Math.max(0, Number(e.target.value)))}
                    placeholder="Horas"
                    className="w-20 px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddRoleBudget}
                    className="px-3 py-2 rounded-xl bg-[#501f92] text-white font-bold cursor-pointer hover:bg-[#381566]"
                  >
                    + Rol
                  </button>
                </div>

                {/* List of assigned roles */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pt-1">
                  {delRoleBudgets.map((rb) => (
                    <div
                      key={rb.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]"
                    >
                      <span className="font-semibold text-[#0f172a]">{rb.roleName}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#501f92]">{rb.quotedHours}h cotizadas</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRoleBudget(rb.id)}
                          className="text-[#94a3b8] hover:text-[#ef4444]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#cbd5e1] text-xs font-bold text-[#64748b] hover:bg-[#f8fafc] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDeliverable}
                disabled={!delName.trim()}
                className="px-4 py-2 rounded-xl bg-[#501f92] text-white text-xs font-bold hover:bg-[#381566] disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {editingDeliverable ? 'Guardar Cambios' : 'Crear Frente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
