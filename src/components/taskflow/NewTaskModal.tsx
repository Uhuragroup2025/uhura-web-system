import React, { useState, useEffect } from 'react';
import {
  TaskItem,
  TaskPriority,
  ProjectType,
  ProjectPhase,
  FeeActivityCategory
} from './types';
import {
  X,
  CheckSquare,
  Building2,
  ListChecks,
  Plus,
  Trash2,
  Layers,
  Repeat,
  Sparkles,
  Link,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  clientProjectHierarchy,
  FEE_ACTIVITY_TEMPLATES,
  PROJECT_PHASES_TEMPLATES
} from './mockData';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: TaskItem) => void;
  existingTasks?: TaskItem[];
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  existingTasks = []
}) => {
  const [title, setTitle] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(clientProjectHierarchy[0].id);
  const [selectedProjectId, setSelectedProjectId] = useState(clientProjectHierarchy[0].projects[0].id);
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [assigneeName, setAssigneeName] = useState('Catalina Tejada');
  const [budgetedHours, setBudgetedHours] = useState('4.0');
  const [dueDateText, setDueDateText] = useState('Vence en 3 días');
  const [startDate, setStartDate] = useState('22 Ago 2026');
  const [dueDate, setDueDate] = useState('2026-08-26');

  // Specific project nature state
  const [projectType, setProjectType] = useState<ProjectType>('fee_monthly');
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase>('UI/UX & Prototipado');
  const [selectedFeeCategory, setSelectedFeeCategory] = useState<FeeActivityCategory>('Mantenimiento Web');
  const [dependencyTaskId, setDependencyTaskId] = useState<string>('');

  // Optional Acceptance Criteria
  const [criteriaList, setCriteriaList] = useState<string[]>([]);
  const [criterionInput, setCriterionInput] = useState('');

  const currentClient = clientProjectHierarchy.find((c) => c.id === selectedClientId) || clientProjectHierarchy[0];
  const currentProject = currentClient.projects.find((p) => p.id === selectedProjectId) || currentClient.projects[0];

  // Sync project type and defaults when project changes
  useEffect(() => {
    if (currentProject) {
      const type = currentProject.projectType || 'fee_monthly';
      setProjectType(type);
      if (currentProject.feeCategory) {
        setSelectedFeeCategory(currentProject.feeCategory);
      }
      if (currentProject.phases && currentProject.phases.length > 0) {
        setSelectedPhase(currentProject.phases[0]);
      }
    }
  }, [selectedProjectId, selectedClientId]);

  if (!isOpen) return null;

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const cli = clientProjectHierarchy.find((c) => c.id === clientId);
    if (cli && cli.projects.length > 0) {
      setSelectedProjectId(cli.projects[0].id);
      const prj = cli.projects[0];
      setProjectType(prj.projectType || 'fee_monthly');
      if (prj.feeCategory) setSelectedFeeCategory(prj.feeCategory);
    }
  };

  const handleApplyTemplate = (tpl: { name: string; defaultHours: number; role: string }) => {
    setTitle(tpl.name);
    setBudgetedHours(tpl.defaultHours.toString());
    if (tpl.role.includes('Designer')) setAssigneeName('Catalina Tejada');
    else if (tpl.role.includes('Growth') || tpl.role.includes('Trafficker')) setAssigneeName('Sebas (Trafficker)');
    else if (tpl.role.includes('Tech') || tpl.role.includes('Dev')) setAssigneeName('Andrés Ríos');
    else if (tpl.role.includes('PM')) setAssigneeName('Paola (Lead PM)');
  };

  const handleAddCriterion = () => {
    if (criterionInput.trim()) {
      setCriteriaList([...criteriaList, criterionInput.trim()]);
      setCriterionInput('');
    }
  };

  const handleRemoveCriterion = (idx: number) => {
    setCriteriaList(criteriaList.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const initials = assigneeName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'CT';

    const isInternal = currentClient.isInternal || false;
    const hoursNum = parseFloat(budgetedHours) || 4.0;

    const depTask = existingTasks.find((t) => t.id === dependencyTaskId);

    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title: title.trim(),
      department: projectType === 'fee_monthly' ? 'Servicios Recurrentes' : 'Desarrollo & Proyectos',
      board: currentProject.name,
      clientName: currentClient.name,
      projectName: currentProject.name,
      projectType,
      phase: projectType === 'fixed_milestones' ? selectedPhase : undefined,
      feeCategory: projectType === 'fee_monthly' ? selectedFeeCategory : undefined,
      categoryType: isInternal ? 'internal' : 'client',
      assignee: {
        name: assigneeName,
        initials,
        avatarBg: assigneeName.includes('Andrés')
          ? 'bg-[#ef4444]'
          : assigneeName.includes('Paola')
          ? 'bg-[#501f92]'
          : assigneeName.includes('Sebas')
          ? 'bg-[#0284c7]'
          : 'bg-[#7c3aed]',
        role: 'Responsable'
      },
      date: 'Hoy, 22 Ago 2026',
      startDate,
      dueDate,
      dueStatus: 'soon',
      dueText: dueDateText,
      status: dependencyTaskId ? 'To Do' : 'In Progress',
      priority,
      completed: false,
      budgetedHours: hoursNum,
      consumedSeconds: 0,
      dependencyTaskId: dependencyTaskId || undefined,
      dependencyTaskTitle: depTask?.title || undefined,
      blockerInfo: dependencyTaskId
        ? {
            isBlocked: true,
            reason: 'dependency',
            reasonText: `Bloqueado en espera de la tarea: ${depTask?.title || 'Tarea previa'}`,
            responsibleParty: 'Uhura / Interno',
            blockedDays: 0,
            blockedAt: 'Hoy, 22 Ago 2026'
          }
        : undefined,
      deliverables: [],
      acceptanceCriteria: criteriaList.map((crit, idx) => ({
        id: `crit-new-${Date.now()}-${idx}`,
        text: crit,
        completed: false
      }))
    };

    onAddTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090513]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex items-center justify-between shrink-0 border-b border-[#334155]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d4ff4a]/20 border border-[#d4ff4a]/40 flex items-center justify-center text-[#d4ff4a]">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Nueva Tarea / Entregable</h3>
              <p className="text-[11px] text-[#94a3b8]">
                Estructura por Fee Recurrente o Proyecto con Fases & Dependencias
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white p-1.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto custom-scrollbar">
          {/* Nivel 1 & 2: Cliente y Proyecto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                1. Cliente / Cuenta *
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2.5 rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]/20 focus:border-[#8a4dff]"
              >
                {clientProjectHierarchy.map((cli) => (
                  <option key={cli.id} value={cli.id}>
                    {cli.name} {cli.isInternal ? '(Interno)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                2. Proyecto Asociado *
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2.5 rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]/20 focus:border-[#8a4dff]"
              >
                {currentClient.projects.map((prj) => (
                  <option key={prj.id} value={prj.id}>
                    {prj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo de Proyecto Toggle / Badge */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                Naturaleza del Proyecto
              </span>
              <div className="inline-flex rounded-xl p-0.5 bg-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setProjectType('fee_monthly')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    projectType === 'fee_monthly'
                      ? 'bg-white text-[#501f92] shadow-xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  <Repeat className="w-3 h-3" />
                  <span>Fee Mensual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProjectType('fixed_milestones')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    projectType === 'fixed_milestones'
                      ? 'bg-white text-[#2563eb] shadow-xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Puntual con Fases</span>
                </button>
              </div>
            </div>

            {/* IF FEE MENSUAL: Show Fee Category and Quick Activity Templates */}
            {projectType === 'fee_monthly' && (
              <div className="space-y-2 pt-1 border-t border-[#e2e8f0]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#0f172a] text-[11px]">
                    Actividad Recurrente Sugerida (Plantilla 1-clic):
                  </label>
                  <select
                    value={selectedFeeCategory}
                    onChange={(e) => setSelectedFeeCategory(e.target.value as FeeActivityCategory)}
                    className="bg-white border border-[#e2e8f0] px-2 py-1 rounded-lg text-[11px] font-bold text-[#501f92]"
                  >
                    <option value="Mantenimiento Web">Mantenimiento Web</option>
                    <option value="Parrilla & Redes">Parrilla & Redes</option>
                    <option value="Growth & Pauta">Growth & Pauta</option>
                    <option value="Soporte Continuo">Soporte Continuo</option>
                  </select>
                </div>

                {/* Quick Templates Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {(FEE_ACTIVITY_TEMPLATES[selectedFeeCategory] || []).map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#f2ecfb] border border-[#e2e8f0] hover:border-[#8a4dff]/40 text-[#334155] hover:text-[#501f92] text-[11px] font-medium transition-colors cursor-pointer text-left flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-[#8a4dff]" />
                      <span>{tpl.name}</span>
                      <span className="text-[10px] text-[#64748b] font-mono">({tpl.defaultHours}h)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* IF FIXED MILESTONES: Show Phases and Dependencies */}
            {projectType === 'fixed_milestones' && (
              <div className="space-y-3 pt-1 border-t border-[#e2e8f0]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#0f172a] text-[11px] mb-1">
                      Fase / Hito del Backlog *
                    </label>
                    <select
                      value={selectedPhase}
                      onChange={(e) => setSelectedPhase(e.target.value as ProjectPhase)}
                      className="w-full bg-white border border-[#e2e8f0] px-2.5 py-2 rounded-xl text-xs font-semibold text-[#2563eb]"
                    >
                      {PROJECT_PHASES_TEMPLATES.map((phase) => (
                        <option key={phase} value={phase}>
                          {phase}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#0f172a] text-[11px] mb-1">
                      Dependencia previa (Opcional)
                    </label>
                    <select
                      value={dependencyTaskId}
                      onChange={(e) => setDependencyTaskId(e.target.value)}
                      className="w-full bg-white border border-[#e2e8f0] px-2.5 py-2 rounded-xl text-xs text-[#0f172a]"
                    >
                      <option value="">(Sin dependencia previa)</option>
                      {existingTasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          Bloqueada hasta que termine: {t.title.substring(0, 35)}...
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {dependencyTaskId && (
                  <div className="p-2 rounded-xl bg-[#fffbeb] border border-[#fef3c7] text-[11px] text-[#92400e] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#f59e0b]" />
                    <span>
                      Esta tarea iniciará en estado <strong>Bloqueada / En Espera</strong> hasta que se apruebe el entregable previo.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tarea Title */}
          <div>
            <label className="block font-bold text-[#0f172a] mb-1">
              3. Título de la Tarea / Entregable *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Carga de banners en Shopify, Prototipo de checkout en Figma, etc."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]/20 focus:border-[#8a4dff]"
            />
          </div>

          {/* Horas Presupuestadas, Responsable & Fechas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Horas Asignadas *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={budgetedHours}
                onChange={(e) => setBudgetedHours(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 rounded-xl text-xs font-mono font-bold text-[#501f92]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Responsable *
              </label>
              <select
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 rounded-xl text-xs font-semibold text-[#0f172a]"
              >
                <option value="Catalina Tejada">Catalina Tejada (Diseño)</option>
                <option value="Sebas (Trafficker)">Sebas (Trafficker & Pauta)</option>
                <option value="Andrés Ríos">Andrés Ríos (Growth & Tech)</option>
                <option value="Laura Gómez">Laura Gómez (Frontend)</option>
                <option value="Esteban Mora">Esteban Mora (Backend Dev)</option>
                <option value="Paola (Lead PM)">Paola (Lead PM)</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block font-bold text-[#0f172a] mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 rounded-xl text-xs font-semibold text-[#0f172a]"
              >
                <option value="High">Alta (Prioritaria)</option>
                <option value="Medium">Media</option>
                <option value="Low">Baja</option>
              </select>
            </div>
          </div>

          {/* Fechas de Entrega */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Fecha Inicio
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Ej. 22 Ago 2026"
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 rounded-xl text-xs text-[#0f172a]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Fecha Vencimiento (Due Date)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 rounded-xl text-xs text-[#0f172a]"
              />
            </div>
          </div>

          {/* Criterios de Aceptación (Opcionales) */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-[#501f92]" />
                <label className="block font-bold text-[#0f172a] text-[11px] uppercase tracking-wider">
                  Criterios de Aceptación (Opcional)
                </label>
              </div>
              <span className="text-[10px] text-[#64748b]">
                {criteriaList.length} añadidos
              </span>
            </div>

            <p className="text-[10px] text-[#64748b]">
              Puntos clave que el PM o revisor validará antes de dar por completado el entregable:
            </p>

            {criteriaList.length > 0 && (
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {criteriaList.map((crit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] text-xs"
                  >
                    <span className="text-[#334155] truncate flex-1">
                      {idx + 1}. {crit}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCriterion(idx)}
                      className="text-[#94a3b8] hover:text-[#ef4444] p-0.5 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={criterionInput}
                onChange={(e) => setCriterionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCriterion();
                  }
                }}
                placeholder="Ej. Formato 1080x1920 exportado y probado en dispositivo..."
                className="flex-1 bg-white border border-[#e2e8f0] px-3 py-1.5 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#8a4dff]"
              />
              <button
                type="button"
                onClick={handleAddCriterion}
                className="px-3 py-1.5 bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#0f172a] rounded-xl text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3 h-3 text-[#501f92]" />
                <span>Agregar</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] border border-[#e2e8f0] bg-white transition-colors cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Crear Tarea en Orbit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
