import React, { useState, useEffect, useMemo } from 'react';
import {
  TaskItem,
  TaskPriority,
  ProjectType,
  STANDARD_UHURA_ROLES,
  FeeActivityCategory
} from './types';
import {
  X,
  CheckSquare,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Users,
  ShieldCheck,
  Building2,
  ListChecks,
  AlertCircle,
  FileText,
  Check,
  ChevronDown,
  Layers,
  Link2,
  FolderKanban
} from 'lucide-react';
import {
  clientProjectHierarchy,
  FEE_ACTIVITY_TEMPLATES
} from './mockData';
import { ProjectSummaryItem } from './ProjectsView';
import { ClientProfile } from './types';

export interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: TaskItem) => void;
  existingTasks?: TaskItem[];
  preselectedProjectId?: string;
  preselectedProjectName?: string;
  preselectedClientName?: string;
  projectsList?: ProjectSummaryItem[];
  clientsList?: ClientProfile[];
  currentUserName?: string;
}

const TEAM_MEMBERS = [
  { name: 'Catalina Tejada', initials: 'CT', avatarBg: 'bg-[#7c3aed]', defaultRole: 'Web Designer' },
  { name: 'Laura Gómez', initials: 'LG', avatarBg: 'bg-[#0284c7]', defaultRole: 'Front End' },
  { name: 'Andrés Ríos', initials: 'AR', avatarBg: 'bg-[#ef4444]', defaultRole: 'Product Lead' },
  { name: 'Sebas (Trafficker)', initials: 'ST', avatarBg: 'bg-[#0284c7]', defaultRole: 'Trafficker' },
  { name: 'Camilo Vélez', initials: 'CV', avatarBg: 'bg-[#10b981]', defaultRole: 'Content Strategist' },
  { name: 'Diego Cadavid', initials: 'DC', avatarBg: 'bg-[#f59e0b]', defaultRole: 'Diseñador Gráfico' },
  { name: 'Mariana Toro', initials: 'MT', avatarBg: 'bg-[#ec4899]', defaultRole: 'Copywriter' },
  { name: 'Mateo Ruiz', initials: 'MR', avatarBg: 'bg-[#8b5cf6]', defaultRole: 'Community Manager' },
  { name: 'Esteban Mora', initials: 'EM', avatarBg: 'bg-[#0d9488]', defaultRole: 'Front End' },
  { name: 'Paola (Lead PM)', initials: 'PL', avatarBg: 'bg-[#501f92]', defaultRole: 'Lead PM' }
];

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  existingTasks = [],
  preselectedProjectId,
  preselectedProjectName,
  preselectedClientName,
  projectsList = [],
  clientsList = [],
  currentUserName = 'Paola (Lead PM)'
}) => {
  // Flatten all available projects
  const allProjects = useMemo(() => {
    const list: {
      id: string;
      name: string;
      clientName: string;
      projectType: ProjectType;
      serviceBase: string;
      leadName: string;
    }[] = [];

    // From hierarchy
    clientProjectHierarchy.forEach((cli) => {
      cli.projects.forEach((prj) => {
        list.push({
          id: prj.id,
          name: prj.name,
          clientName: cli.name,
          projectType: prj.projectType || 'fee_monthly',
          serviceBase: prj.feeCategory || 'Mantenimiento Web',
          leadName: 'Paola (Lead PM)'
        });
      });
    });

    // From dynamic projectsList
    projectsList.forEach((p) => {
      if (!list.some((existing) => existing.id === p.id || existing.name === p.name)) {
        list.push({
          id: p.id,
          name: p.name,
          clientName: p.clientName,
          projectType: p.projectType,
          serviceBase: p.serviceBase,
          leadName: p.leadName
        });
      }
    });

    return list;
  }, [projectsList]);

  // Selected project state
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Active project metadata
  const activeProject = useMemo(() => {
    return allProjects.find((p) => p.id === selectedProjectId) || allProjects[0] || {
      id: 'default',
      name: preselectedProjectName || 'Campaña Navidad Yamaha',
      clientName: preselectedClientName || 'INCOLMOTOS YAMAHA S.A.',
      projectType: 'fixed_milestones' as ProjectType,
      serviceBase: 'Desarrollo Web & E-commerce',
      leadName: 'Paola (Lead PM)'
    };
  }, [selectedProjectId, allProjects, preselectedProjectName, preselectedClientName]);

  // Frentes disponibles para el proyecto activo
  const availableFrentes = useMemo(() => {
    const fromTasks = existingTasks
      .filter((t) => (t.projectName || t.board)?.toLowerCase() === activeProject.name.toLowerCase() && t.frente)
      .map((t) => t.frente!);
    
    const unique = Array.from(new Set(fromTasks));
    if (unique.length > 0) return unique;

    // Fallbacks naturales según nombre o tipo
    if (activeProject.name.toLowerCase().includes('yamaha') || activeProject.name.toLowerCase().includes('navidad')) {
      return ['Redes Sociales', 'Landing Page', 'Pauta'];
    }
    if (activeProject.projectType === 'fee_monthly') {
      return ['Mantenimiento General', 'Banners & Assets', 'Soporte Continuo'];
    }
    return ['Estrategia & Concepto', 'Diseño & UI', 'Desarrollo Frontend', 'Pauta & Medios'];
  }, [existingTasks, activeProject]);

  // Form Fields
  const [frente, setFrente] = useState<string>('');
  const [isCustomFrente, setIsCustomFrente] = useState(false);
  const [customFrenteText, setCustomFrenteText] = useState('');

  const [title, setTitle] = useState('');
  const [budgetedRole, setBudgetedRole] = useState<string>('Web Designer');
  const [assigneeName, setAssigneeName] = useState('Catalina Tejada');
  const [description, setDescription] = useState('');
  const [reviewerName, setReviewerName] = useState('Paola (Lead PM)');
  const [hasReviewer, setHasReviewer] = useState(true);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);

  // Planning Fields
  const [budgetedHours, setBudgetedHours] = useState('8.0');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  });
  const [dueDate, setDueDate] = useState(() => {
    const target = new Date();
    target.setDate(target.getDate() + 5);
    return target.toISOString().split('T')[0];
  });

  // Dependencies (Depende de / Bloqueada por)
  const [dependencyTaskId, setDependencyTaskId] = useState<string>('');

  // Acceptance Criteria
  const [criteriaList, setCriteriaList] = useState<string[]>([]);
  const [criterionInput, setCriterionInput] = useState('');

  // Template selector
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('');

  // Available project sibling tasks for dependencies
  const siblingTasks = useMemo(() => {
    return existingTasks.filter(
      (t) => (t.projectName || t.board)?.toLowerCase() === activeProject.name.toLowerCase()
    );
  }, [existingTasks, activeProject]);

  // Initialize selected project and frente when modal opens
  useEffect(() => {
    if (isOpen) {
      if (preselectedProjectId) {
        const found = allProjects.find((p) => p.id === preselectedProjectId);
        if (found) setSelectedProjectId(found.id);
      } else if (preselectedProjectName) {
        const found = allProjects.find((p) => p.name === preselectedProjectName);
        if (found) setSelectedProjectId(found.id);
      } else if (allProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(allProjects[0].id);
      }
    }
  }, [isOpen, preselectedProjectId, preselectedProjectName, allProjects]);

  // Set default frente on project change
  useEffect(() => {
    if (availableFrentes.length > 0 && !frente) {
      setFrente(availableFrentes[0]);
    }
  }, [availableFrentes]);

  // Auto-suggest budgetedRole when assignee changes (if user hasn't heavily modified it)
  const handleAssigneeChange = (newAssigneeName: string) => {
    setAssigneeName(newAssigneeName);
    const member = TEAM_MEMBERS.find((m) => m.name === newAssigneeName);
    if (member?.defaultRole) {
      setBudgetedRole(member.defaultRole);
    }
  };

  // Sync default reviewer with project lead
  useEffect(() => {
    if (activeProject?.leadName) {
      setReviewerName(activeProject.leadName);
    }
  }, [activeProject]);

  // If closed, return null
  if (!isOpen) return null;

  // Context is locked if opened with preselected context
  const isContextLocked = Boolean(preselectedProjectId || preselectedProjectName);

  // Available templates based on serviceBase
  const availableTemplates = FEE_ACTIVITY_TEMPLATES[activeProject.serviceBase] || [
    { name: 'Conceptualización & Estructura', defaultHours: 2.0, role: 'Product Lead' },
    { name: 'Redacción de Copys & Contenidos', defaultHours: 1.0, role: 'Copywriter' },
    { name: 'Prototipo & Diseño UI', defaultHours: 8.0, role: 'Web Designer' },
    { name: 'Implementación Frontend & Testing', defaultHours: 8.0, role: 'Front End' },
    { name: 'Carga & Optimización de Pauta', defaultHours: 3.0, role: 'Trafficker' }
  ];

  const handleApplyTemplate = (templateName: string) => {
    setSelectedTemplateKey(templateName);
    const tpl = availableTemplates.find((t) => t.name === templateName);
    if (tpl) {
      setTitle(tpl.name);
      setBudgetedHours(tpl.defaultHours.toString());
      if (tpl.role.includes('Designer')) {
        setAssigneeName('Catalina Tejada');
        setBudgetedRole('Web Designer');
      } else if (tpl.role.includes('Tech') || tpl.role.includes('Front') || tpl.role.includes('Dev')) {
        setAssigneeName('Laura Gómez');
        setBudgetedRole('Front End');
      } else if (tpl.role.includes('Trafficker') || tpl.role.includes('Growth')) {
        setAssigneeName('Sebas (Trafficker)');
        setBudgetedRole('Trafficker');
      } else if (tpl.role.includes('Copy')) {
        setAssigneeName('Mariana Toro');
        setBudgetedRole('Copywriter');
      } else if (tpl.role.includes('Product') || tpl.role.includes('Lead') || tpl.role.includes('PM')) {
        setAssigneeName('Andrés Ríos');
        setBudgetedRole('Product Lead');
      }

      // Preload standard criteria if empty
      if (criteriaList.length === 0) {
        setCriteriaList([
          'Validación de requerimiento contra brief',
          'Revisión en staging / entregable final'
        ]);
      }
    }
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

  const handleToggleCollaborator = (memberName: string) => {
    if (collaborators.includes(memberName)) {
      setCollaborators(collaborators.filter((c) => c !== memberName));
    } else {
      setCollaborators([...collaborators, memberName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedUser = TEAM_MEMBERS.find((m) => m.name === assigneeName) || TEAM_MEMBERS[0];
    const reviewerUser = hasReviewer && reviewerName
      ? TEAM_MEMBERS.find((m) => m.name === reviewerName) || {
          name: reviewerName,
          initials: reviewerName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
          avatarBg: 'bg-[#501f92]',
          role: 'Revisor Accountable'
        }
      : undefined;

    const collaboratorObjects = collaborators.map((name) => {
      const found = TEAM_MEMBERS.find((m) => m.name === name);
      return (
        found || {
          name,
          initials: name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
          avatarBg: 'bg-[#64748b]',
          defaultRole: 'Colaborador'
        }
      );
    });

    const isInternal = activeProject.projectType === 'internal';
    const hoursNum = parseFloat(budgetedHours) || 4.0;

    // Selected Frente
    const finalFrente = isCustomFrente ? customFrenteText.trim() || 'General' : frente || availableFrentes[0] || 'General';

    // Format dueDate text
    const formattedDueDate = new Date(dueDate + 'T00:00:00').toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    // Sibling dependency
    const depTask = siblingTasks.find((t) => t.id === dependencyTaskId);

    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      department: activeProject.projectType === 'fee_monthly' ? 'Servicios Recurrentes' : 'Desarrollo & Proyectos',
      board: activeProject.name,
      clientName: activeProject.clientName,
      projectName: activeProject.name,
      frente: finalFrente,
      budgetedRole: budgetedRole || assignedUser.defaultRole,
      executedRoleSnapshot: assignedUser.defaultRole,
      projectType: activeProject.projectType,
      feeCategory: activeProject.projectType === 'fee_monthly' ? (activeProject.serviceBase as FeeActivityCategory) : undefined,
      categoryType: isInternal ? 'internal' : 'client',
      requestedBy: currentUserName,
      reviewer: reviewerUser,
      assignee: {
        name: assignedUser.name,
        initials: assignedUser.initials,
        avatarBg: assignedUser.avatarBg,
        role: assignedUser.defaultRole
      },
      collaborators: collaboratorObjects.length > 0 ? collaboratorObjects.map((c) => ({
        name: c.name,
        initials: c.initials,
        avatarBg: c.avatarBg,
        role: c.defaultRole
      })) : undefined,
      date: 'Hoy, ' + new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
      startDate,
      dueDate: formattedDueDate,
      dueStatus: 'soon',
      dueText: `Entrega: ${formattedDueDate}`,
      // Toda tarea nace como "To Do" (Por hacer)
      status: 'To Do',
      priority,
      completed: false,
      budgetedHours: hoursNum,
      consumedSeconds: 0,
      dependencyTaskId: depTask ? depTask.id : undefined,
      dependencyTaskTitle: depTask ? depTask.title : undefined,
      deliverables: [],
      acceptanceCriteria: criteriaList.map((crit, idx) => ({
        id: `crit-${Date.now()}-${idx}`,
        text: crit,
        completed: false
      }))
    };

    onAddTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#090513]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex items-center justify-between shrink-0 border-b border-[#334155]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d4ff4a]/20 border border-[#d4ff4a]/40 flex items-center justify-center text-[#d4ff4a]">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Nueva Tarea</h3>
              <p className="text-[11px] text-[#94a3b8]">
                Unidad mínima de ejecución, estado y tiempo. Hereda contexto y frentes del proyecto.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white p-1.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto custom-scrollbar">
          {/* 1. CONTEXTO HEREDADO */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                  Contexto del Proyecto
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <strong className="text-sm text-[#0f172a]">{activeProject.clientName}</strong>
                  <span className="text-[#94a3b8] font-bold">→</span>
                  <span className="text-sm font-semibold text-[#501f92]">{activeProject.name}</span>
                </div>
              </div>

              {/* Naturaleza & Servicio Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${
                    activeProject.projectType === 'fee_monthly'
                      ? 'bg-[#d4ff4a]/20 text-[#2e5e04] border border-[#d4ff4a]/40'
                      : activeProject.projectType === 'fixed_milestones'
                      ? 'bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]'
                      : 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
                  }`}
                >
                  {activeProject.projectType === 'fee_monthly'
                    ? 'Fee mensual'
                    : activeProject.projectType === 'fixed_milestones'
                    ? 'Proyecto único'
                    : 'Interno / No facturable'}
                </span>
                <span className="text-[11px] font-semibold text-[#475569] bg-white px-2 py-0.5 rounded-lg border border-[#e2e8f0]">
                  {activeProject.serviceBase}
                </span>
              </div>
            </div>

            {/* If not locked, allow switching project easily */}
            {!isContextLocked && allProjects.length > 1 && (
              <div className="pt-2 border-t border-[#e2e8f0] flex items-center gap-2">
                <label className="text-[10px] font-bold text-[#64748b] shrink-0">Cambiar Proyecto:</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="flex-1 bg-white border border-[#e2e8f0] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#0f172a]"
                >
                  {allProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.clientName} → {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. FRENTE / ENTREGABLE DEL PROYECTO */}
          <div className="p-3.5 rounded-2xl bg-[#f5f3ff]/50 border border-[#e9d5ff] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-[#501f92]" />
                <label className="font-bold text-[#0f172a] text-xs">
                  Frente / Entregable *
                </label>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomFrente(!isCustomFrente)}
                className="text-[10px] font-bold text-[#501f92] hover:underline cursor-pointer"
              >
                {isCustomFrente ? '← Seleccionar existente' : '+ Nuevo frente'}
              </button>
            </div>

            {isCustomFrente ? (
              <input
                type="text"
                required
                placeholder="Ej. Landing Page, Redes Sociales, Pauta, E-commerce..."
                value={customFrenteText}
                onChange={(e) => setCustomFrenteText(e.target.value)}
                className="w-full bg-white border border-[#8a4dff] px-3 py-2 rounded-xl text-xs text-[#0f172a] font-bold focus:outline-none focus:ring-1 focus:ring-[#8a4dff]"
              />
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {availableFrentes.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrente(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      frente === f
                        ? 'bg-[#501f92] text-white border-[#501f92] shadow-xs'
                        : 'bg-white text-[#475569] border-[#e2e8f0] hover:border-[#8a4dff]/40 hover:bg-[#f8fafc]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. TÍTULO DE LA TAREA */}
          <div>
            <label className="block font-bold text-[#0f172a] mb-1">
              Título de la tarea *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Prototipo landing, Estrategia de contenido, Carga/publicación de anuncios..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2.5 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8a4dff]/20 focus:border-[#8a4dff]"
            />
          </div>

          {/* 4. ROL PRESUPUESTADO & RESPONSABLE REAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Responsable Real */}
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Responsable asignado *
              </label>
              <select
                value={assigneeName}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#8a4dff] cursor-pointer"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.defaultRole})
                  </option>
                ))}
              </select>
            </div>

            {/* Rol Cotizado (Comercial) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-[#0f172a]">
                  Rol cotizado *
                </label>
                <span className="text-[10px] text-[#64748b]">Perfil vendido comercialmente</span>
              </div>
              <select
                value={budgetedRole}
                onChange={(e) => setBudgetedRole(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 rounded-xl text-xs font-semibold text-[#501f92] focus:outline-none focus:border-[#8a4dff] cursor-pointer"
              >
                {STANDARD_UHURA_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. DESCRIPCIÓN / REQUERIMIENTO */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-[#0f172a]">
                Descripción / requerimiento
              </label>
              <span className="text-[10px] text-[#64748b]">Contexto, links a Figma, Drive o especificaciones</span>
            </div>
            <textarea
              rows={3}
              placeholder="¿Qué se necesita? Agrega requerimientos, links de referencia, especificaciones de diseño o pauta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]/20 focus:border-[#8a4dff] resize-none leading-relaxed"
            />
          </div>

          {/* 6. PLANEACIÓN: HORAS ESTIMADAS, PRIORIDAD, FECHA INICIO, FECHA ENTREGA */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Horas cotizadas */}
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Horas cotizadas *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={budgetedHours}
                  onChange={(e) => setBudgetedHours(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 rounded-xl text-xs font-mono font-bold text-[#501f92] focus:outline-none focus:border-[#8a4dff]"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-[#94a3b8] pointer-events-none">h</span>
              </div>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className={`w-full border px-2.5 py-2 rounded-xl text-xs font-bold focus:outline-none cursor-pointer ${
                  priority === 'High'
                    ? 'bg-[#fef2f2] border-[#fecaca] text-[#dc2626]'
                    : priority === 'Low'
                    ? 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]'
                    : 'bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]'
                }`}
              >
                <option value="Medium">Normal (Default)</option>
                <option value="High">Alta</option>
                <option value="Low">Baja</option>
              </select>
            </div>

            {/* Fecha inicio */}
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Fecha inicio
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Hoy"
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 rounded-xl text-xs text-[#0f172a] font-medium"
              />
            </div>

            {/* Fecha de entrega * */}
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Fecha de entrega *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-2 rounded-xl text-xs text-[#0f172a] font-bold"
              />
            </div>
          </div>

          {/* 7. REVISOR & DEPENDENCIA DE TAREA (Opcionales) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Revisor */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-[#0f172a]">
                  Revisor / Aprobación
                </label>
                <button
                  type="button"
                  onClick={() => setHasReviewer(!hasReviewer)}
                  className={`text-[10px] font-bold cursor-pointer ${
                    hasReviewer ? 'text-[#501f92] hover:underline' : 'text-[#64748b]'
                  }`}
                >
                  {hasReviewer ? 'Con revisor' : 'Sin revisor (directo)'}
                </button>
              </div>

              {hasReviewer ? (
                <select
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 rounded-xl text-xs font-semibold text-[#501f92] focus:outline-none focus:border-[#8a4dff] cursor-pointer"
                >
                  {TEAM_MEMBERS.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name} {m.name === activeProject.leadName ? '(Project Lead default)' : `(${m.defaultRole})`}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full bg-[#f1f5f9] border border-[#e2e8f0] px-3 py-2 rounded-xl text-xs text-[#64748b] italic">
                  Flujo directo: Por hacer → En proceso → Listo
                </div>
              )}
            </div>

            {/* Dependencia (Depende de / Bloqueada por) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-[#0f172a]">
                  Depende de (Opcional)
                </label>
                <span className="text-[10px] text-[#64748b]">Cascada / Bloqueo</span>
              </div>
              <select
                value={dependencyTaskId}
                onChange={(e) => setDependencyTaskId(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2 rounded-xl text-xs font-medium text-[#334155] focus:outline-none focus:border-[#8a4dff] cursor-pointer"
              >
                <option value="">Sin dependencia (ejecución libre / paralela)</option>
                {siblingTasks.map((st) => (
                  <option key={st.id} value={st.id}>
                    🔒 Depende de: {st.title} ({st.frente || 'General'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 8. CRITERIOS DE ACEPTACIÓN */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-[#501f92]" />
                <label className="block font-bold text-[#0f172a] text-[11px] uppercase tracking-wider">
                  Criterios de Aceptación
                </label>
              </div>
              <span className="text-[10px] text-[#64748b]">
                {criteriaList.length} definidos
              </span>
            </div>

            {criteriaList.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {criteriaList.map((crit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-[#e2e8f0] text-xs shadow-2xs"
                  >
                    <span className="text-[#334155] truncate flex-1 font-medium">
                      {idx + 1}. {crit}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCriterion(idx)}
                      className="text-[#94a3b8] hover:text-[#ef4444] p-1 rounded cursor-pointer transition-colors"
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
                placeholder="Ej. Prototipo responsive con interacciones aprobado..."
                className="flex-1 bg-white border border-[#e2e8f0] px-3 py-2 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#8a4dff]"
              />
              <button
                type="button"
                onClick={handleAddCriterion}
                className="px-3.5 py-2 bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#0f172a] rounded-xl text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3 h-3 text-[#501f92]" />
                <span>Agregar</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
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
