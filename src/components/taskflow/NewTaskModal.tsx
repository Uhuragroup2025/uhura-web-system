import React, { useState, useEffect, useMemo } from 'react';
import {
  TaskItem,
  TaskPriority,
  ProjectType,
  STANDARD_UHURA_ROLES,
  FeeActivityCategory,
  ClientProfile
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
  Building2,
  ListChecks,
  AlertCircle,
  FileText,
  Check,
  ChevronDown,
  Layers,
  Link2,
  FolderKanban,
  Briefcase,
  Crown,
  Eye
} from 'lucide-react';
import { DropdownMenu } from '../ui/DropdownMenu';
import {
  clientProjectHierarchy,
  FEE_ACTIVITY_TEMPLATES
} from './mockData';
import { ProjectSummaryItem } from './ProjectsView';

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
  // 1. Build list of all existing projects with client associations
  const allProjects = useMemo(() => {
    const list: {
      id: string;
      name: string;
      clientName: string;
      projectType: ProjectType;
      serviceBase: string;
      leadName: string;
    }[] = [];

    // From mock hierarchy
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
      if (!list.some((existing) => existing.id === p.id || existing.name.toLowerCase() === p.name.toLowerCase())) {
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

  // Extract list of all unique clients
  const availableClients = useMemo(() => {
    const set = new Set<string>();
    clientsList.forEach((c) => set.add(c.name));
    allProjects.forEach((p) => set.add(p.clientName));
    return Array.from(set).filter(Boolean);
  }, [clientsList, allProjects]);

  // Cascading Selection State: Cliente -> Proyecto
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Available projects for the chosen client
  const projectsForSelectedClient = useMemo(() => {
    if (!selectedClientName) return allProjects;
    return allProjects.filter(
      (p) => p.clientName.toLowerCase() === selectedClientName.toLowerCase()
    );
  }, [allProjects, selectedClientName]);

  // Active project metadata
  const activeProject = useMemo(() => {
    const byId = allProjects.find((p) => p.id === selectedProjectId);
    if (byId) return byId;

    if (projectsForSelectedClient.length > 0) {
      return projectsForSelectedClient[0];
    }

    return (
      allProjects[0] || {
        id: 'default',
        name: 'Campaña Navidad Yamaha',
        clientName: 'INCOLMOTOS YAMAHA S.A.',
        projectType: 'fee_monthly' as ProjectType,
        serviceBase: 'Parrilla de Contenidos & Social',
        leadName: 'Paola (Lead PM)'
      }
    );
  }, [selectedProjectId, projectsForSelectedClient, allProjects]);

  // Frentes disponibles para el proyecto activo
  const availableFrentes = useMemo(() => {
    const fromTasks = existingTasks
      .filter((t) => (t.projectName || t.board)?.toLowerCase() === activeProject.name.toLowerCase() && t.frente)
      .map((t) => t.frente!);

    const unique = Array.from(new Set(fromTasks));
    if (unique.length > 0) return unique;

    // Natural fallbacks based on project nature
    if (activeProject.name.toLowerCase().includes('yamaha') || activeProject.name.toLowerCase().includes('navidad')) {
      return ['Redes Sociales', 'Landing Page', 'Pauta'];
    }
    if (activeProject.name.toLowerCase().includes('battsaver')) {
      return ['Discovery & Estrategia', 'UX/UI & Prototipo', 'Implementación Shopify', 'QA & Cierre'];
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
  const [projectLeadName, setProjectLeadName] = useState('Paola (Lead PM)');
  const [collaborators, setCollaborators] = useState<string[]>(['Catalina Tejada']);
  const [followers, setFollowers] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  // Planning Fields
  const [budgetedHours, setBudgetedHours] = useState('4.0');
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

  // Context lock check
  const isContextLocked = Boolean(preselectedProjectId || preselectedProjectName);

  // Initialize selected client & project when modal opens
  useEffect(() => {
    if (isOpen) {
      if (preselectedProjectId) {
        const found = allProjects.find((p) => p.id === preselectedProjectId);
        if (found) {
          setSelectedClientName(found.clientName);
          setSelectedProjectId(found.id);
        }
      } else if (preselectedProjectName) {
        const found = allProjects.find(
          (p) => p.name.toLowerCase() === preselectedProjectName.toLowerCase()
        );
        if (found) {
          setSelectedClientName(found.clientName);
          setSelectedProjectId(found.id);
        } else if (preselectedClientName) {
          setSelectedClientName(preselectedClientName);
        }
      } else if (preselectedClientName) {
        setSelectedClientName(preselectedClientName);
        const clientPrjs = allProjects.filter(
          (p) => p.clientName.toLowerCase() === preselectedClientName.toLowerCase()
        );
        if (clientPrjs.length > 0) {
          setSelectedProjectId(clientPrjs[0].id);
        }
      } else if (availableClients.length > 0) {
        const defaultClient = availableClients[0];
        setSelectedClientName(defaultClient);
        const clientPrjs = allProjects.filter(
          (p) => p.clientName.toLowerCase() === defaultClient.toLowerCase()
        );
        if (clientPrjs.length > 0) {
          setSelectedProjectId(clientPrjs[0].id);
        }
      }
    }
  }, [isOpen, preselectedProjectId, preselectedProjectName, preselectedClientName, allProjects, availableClients]);

  // Handle client select change
  const handleClientSelectChange = (newClientName: string) => {
    setSelectedClientName(newClientName);
    const clientPrjs = allProjects.filter(
      (p) => p.clientName.toLowerCase() === newClientName.toLowerCase()
    );
    if (clientPrjs.length > 0) {
      setSelectedProjectId(clientPrjs[0].id);
    } else {
      setSelectedProjectId('');
    }
  };

  // Set default frente on project change
  useEffect(() => {
    if (availableFrentes.length > 0) {
      setFrente(availableFrentes[0]);
    }
  }, [availableFrentes]);

  // Responsable selection does NOT overwrite budgetedRole
  const handleAssigneeChange = (newAssigneeName: string) => {
    if (!collaborators.includes(newAssigneeName)) {
      setCollaborators([newAssigneeName, ...collaborators]);
    }
  };

  // Sync default project lead
  useEffect(() => {
    if (activeProject?.leadName) {
      setProjectLeadName(activeProject.leadName);
    }
  }, [activeProject]);

  if (!isOpen) return null;

  // Available templates based on serviceBase
  const availableTemplates = FEE_ACTIVITY_TEMPLATES[activeProject.serviceBase] || [
    { name: 'Conceptualización & Estructura', defaultHours: 2.0, role: 'Product Lead' },
    { name: 'Redacción de Copys & Contenidos', defaultHours: 1.0, role: 'Copywriter' },
    { name: 'Prototipo & Diseño UI', defaultHours: 6.0, role: 'Web Designer' },
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
        setCollaborators(['Catalina Tejada']);
        setBudgetedRole('Web Designer');
      } else if (tpl.role.includes('Tech') || tpl.role.includes('Front') || tpl.role.includes('Dev')) {
        setCollaborators(['Laura Gómez']);
        setBudgetedRole('Front End');
      } else if (tpl.role.includes('Trafficker') || tpl.role.includes('Growth')) {
        setCollaborators(['Sebas (Trafficker)']);
        setBudgetedRole('Trafficker');
      } else if (tpl.role.includes('Copy')) {
        setCollaborators(['Mariana Toro']);
        setBudgetedRole('Copywriter');
      } else if (tpl.role.includes('Product') || tpl.role.includes('Lead') || tpl.role.includes('PM')) {
        setCollaborators(['Andrés Ríos']);
        setBudgetedRole('Product Lead');
      }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeProject) return;

    const leadUser = TEAM_MEMBERS.find((m) => m.name === projectLeadName) || {
      name: projectLeadName || 'Paola (Lead PM)',
      initials: 'PL',
      avatarBg: 'bg-[#501f92]',
      defaultRole: 'Lead PM'
    };

    const collaboratorObjects = (collaborators.length > 0 ? collaborators : ['Catalina Tejada']).map((name) => {
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

    const followerObjects = followers.map((name) => {
      const found = TEAM_MEMBERS.find((m) => m.name === name);
      return (
        found || {
          name,
          initials: name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
          avatarBg: 'bg-[#6366f1]',
          defaultRole: 'Seguidor'
        }
      );
    });

    const primaryAssignee = collaboratorObjects[0];
    const secondaryCollaborators = collaboratorObjects.slice(1);

    const isInternal = activeProject.projectType === 'internal';
    const hoursNum = parseFloat(budgetedHours) || 4.0;

    const finalFrente = isCustomFrente ? customFrenteText.trim() || 'General' : frente || availableFrentes[0] || 'General';

    const formattedDueDate = new Date(dueDate + 'T00:00:00').toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

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
      budgetedRole: budgetedRole || primaryAssignee.defaultRole,
      executedRoleSnapshot: primaryAssignee.defaultRole,
      projectType: activeProject.projectType,
      feeCategory: activeProject.projectType === 'fee_monthly' ? (activeProject.serviceBase as FeeActivityCategory) : undefined,
      categoryType: isInternal ? 'internal' : 'client',
      requestedBy: currentUserName,
      projectLead: {
        name: leadUser.name,
        initials: leadUser.initials,
        avatarBg: leadUser.avatarBg,
        role: leadUser.defaultRole
      },
      assignee: {
        name: primaryAssignee.name,
        initials: primaryAssignee.initials,
        avatarBg: primaryAssignee.avatarBg,
        role: primaryAssignee.defaultRole
      },
      collaborators: secondaryCollaborators.length > 0 ? secondaryCollaborators.map((c) => ({
        name: c.name,
        initials: c.initials,
        avatarBg: c.avatarBg,
        role: c.defaultRole
      })) : undefined,
      followers: followerObjects.length > 0 ? followerObjects.map((f) => ({
        name: f.name,
        initials: f.initials,
        avatarBg: f.avatarBg,
        role: f.defaultRole
      })) : undefined,
      date: 'Hoy, ' + new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
      startDate,
      dueDate: formattedDueDate,
      dueStatus: 'soon',
      dueText: `Entrega: ${formattedDueDate}`,
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
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#090513]/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-[#0f172a] text-white flex items-center justify-between shrink-0 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-purple-300 shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Nueva Tarea</h3>
              <p className="text-[11px] text-[#94a3b8]">
                Asociada a un Proyecto (Cliente → Proyecto → Frente / Fase → Tarea)
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto custom-scrollbar">
          {/* PASO 1: JERARQUÍA OBLIGATORIA (Cliente → Proyecto) */}
          <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#501f92] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#501f92]" />
                <span>1. Cliente y Proyecto Asociado</span>
              </span>
              {isContextLocked && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e0e7ff] text-[#3730a3]">
                  Contexto Bloqueado
                </span>
              )}
            </div>

            {isContextLocked ? (
              // Locked context view (from inside a project)
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-[#cbd5e1]">
                <div>
                  <span className="text-[10px] text-[#64748b] block font-bold uppercase">Cliente</span>
                  <span className="text-xs font-extrabold text-[#0f172a]">{activeProject.clientName}</span>
                </div>
                <div className="hidden sm:block text-[#94a3b8] font-bold">→</div>
                <div>
                  <span className="text-[10px] text-[#64748b] block font-bold uppercase">Proyecto</span>
                  <span className="text-xs font-extrabold text-[#501f92]">{activeProject.name}</span>
                </div>
                <div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      activeProject.projectType === 'fee_monthly'
                        ? 'bg-[#d4ff4a]/20 text-[#2e5e04]'
                        : activeProject.projectType === 'fixed_milestones'
                        ? 'bg-[#eff6ff] text-[#2563eb]'
                        : 'bg-[#ecfdf5] text-[#047857]'
                    }`}
                  >
                    {activeProject.projectType === 'fee_monthly'
                      ? 'Fee mensual'
                      : activeProject.projectType === 'fixed_milestones'
                      ? 'Proyecto único'
                      : 'Interno'}
                  </span>
                </div>
              </div>
            ) : (
              // Cascading Selectors (Cliente -> Proyecto)
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Seleccionar Cliente */}
                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">
                    Cliente *
                  </label>
                  <select
                    value={selectedClientName}
                    onChange={(e) => handleClientSelectChange(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] px-3 py-2 rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:ring-1 focus:ring-[#501f92] cursor-pointer"
                  >
                    {availableClients.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Seleccionar Proyecto de ese Cliente */}
                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">
                    Proyecto ({projectsForSelectedClient.length}) *
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-white border border-[#cbd5e1] px-3 py-2 rounded-xl text-xs font-semibold text-[#501f92] focus:outline-none focus:border-[#501f92] focus:ring-1 focus:ring-[#501f92] cursor-pointer"
                  >
                    {projectsForSelectedClient.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.projectType === 'fee_monthly' ? 'Fee' : p.projectType === 'fixed_milestones' ? 'Único' : 'Interno'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* PASO 2: FRENTE / ENTREGABLE */}
          <div className="p-3.5 rounded-2xl bg-[#f5f3ff]/60 border border-[#e9d5ff] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-[#501f92]" />
                <label className="font-bold text-[#0f172a] text-xs">
                  Frente / Entregable del Proyecto *
                </label>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomFrente(!isCustomFrente)}
                className="text-[10px] font-bold text-[#501f92] hover:underline cursor-pointer"
              >
                {isCustomFrente ? '← Seleccionar existente' : '+ Nuevo frente personalizado'}
              </button>
            </div>

            {isCustomFrente ? (
              <input
                type="text"
                required
                placeholder="Ej. Redes Sociales, Landing Page, Pauta, E-commerce..."
                value={customFrenteText}
                onChange={(e) => setCustomFrenteText(e.target.value)}
                className="w-full bg-white border border-[#8a4dff] px-3 py-2 rounded-xl text-xs text-[#0f172a] font-bold focus:outline-none focus:ring-1 focus:ring-[#8a4dff]"
              />
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                {availableFrentes.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrente(f)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      frente === f
                        ? 'bg-[#501f92] text-white border-[#501f92] shadow-xs'
                        : 'bg-white text-[#475569] border-[#cbd5e1] hover:border-[#8a4dff]/40 hover:bg-[#f8fafc]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PLANTILLAS RÁPIDAS (OPCIONAL) */}
          {availableTemplates.length > 0 && (
            <div className="p-3 rounded-2xl bg-white border border-[#e2e8f0] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#501f92]" />
                  <span>Sugerencias rápidas para {activeProject.serviceBase}</span>
                </span>
                <span className="text-[10px] text-[#94a3b8]">Opcional</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableTemplates.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => handleApplyTemplate(t.name)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border text-left ${
                      selectedTemplateKey === t.name
                        ? 'bg-[#f2ecfb] text-[#501f92] border-[#501f92] font-bold'
                        : 'bg-[#f8fafc] text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className="ml-1 text-[10px] opacity-70">({t.defaultHours}h)</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO 3: TÍTULO Y DESCRIPCIÓN */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Título de la tarea *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Prototipo landing, Estrategia de contenidos, Publicación de pauta..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3.5 py-2.5 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8a4dff]/20 focus:border-[#8a4dff]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#64748b] mb-1">
                Descripción / Requerimiento detallado (opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Detalla el alcance, insumos requeridos, enlaces a Figma o brief..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3.5 py-2 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#8a4dff]"
              />
            </div>
          </div>

          {/* PASO 4: EQUIPO Y RESPONSABILIDADES */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0f172a] text-xs">Equipo & Responsabilidades</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Project Lead */}
              <div>
                <label className="block font-bold text-[#0f172a] text-[11px] mb-1 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-[#501f92]" />
                  <span>Project Lead *</span>
                </label>
                <DropdownMenu
                  value={projectLeadName}
                  onChange={(val) => setProjectLeadName(val)}
                  options={TEAM_MEMBERS.map((m) => ({
                    id: m.name,
                    label: m.name,
                    sublabel: m.defaultRole,
                    icon: (
                      <div className={`w-5 h-5 rounded-full ${m.avatarBg} text-white flex items-center justify-center text-[9px] font-bold shrink-0`}>
                        {m.initials}
                      </div>
                    )
                  }))}
                  trigger={
                    <div className="w-full bg-white border border-[#cbd5e1] px-3 py-2 rounded-xl text-xs font-semibold text-[#0f172a] flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-5 h-5 rounded-full ${TEAM_MEMBERS.find((m) => m.name === projectLeadName)?.avatarBg || 'bg-[#501f92]'} text-white flex items-center justify-center text-[9px] font-bold shrink-0`}>
                          {TEAM_MEMBERS.find((m) => m.name === projectLeadName)?.initials || 'PL'}
                        </div>
                        <span className="truncate">{projectLeadName}</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                    </div>
                  }
                  className="w-full"
                  menuClassName="w-full z-40 max-h-56"
                />
              </div>

              {/* Rol Cotizado */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-[#0f172a] text-[11px] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Rol cotizado *</span>
                  </label>
                  <span className="text-[10px] text-[#0284c7] font-medium bg-[#f0f9ff] px-1.5 py-0.5 rounded border border-[#bae6fd]">
                    Tarifario
                  </span>
                </div>
                <DropdownMenu
                  value={budgetedRole}
                  onChange={(val) => setBudgetedRole(val)}
                  options={STANDARD_UHURA_ROLES.map((role) => ({
                    id: role,
                    label: role
                  }))}
                  trigger={
                    <div className="w-full bg-white border border-[#cbd5e1] px-3 py-2 rounded-xl text-xs font-semibold text-[#0369a1] flex items-center justify-between cursor-pointer">
                      <span className="truncate">{budgetedRole}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                    </div>
                  }
                  className="w-full"
                  menuClassName="w-full z-40 max-h-56"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 border-t border-[#e2e8f0]/80">
              {/* Colaboradores (Multiselección) */}
              <div>
                <label className="block font-bold text-[#0f172a] text-[11px] mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Colaboradores (Ejecutan) *</span>
                </label>
                <DropdownMenu
                  multiple={true}
                  value={collaborators}
                  onChange={() => {}}
                  onMultiChange={(vals) => {
                    if (vals.length > 0) {
                      setCollaborators(vals);
                    }
                  }}
                  options={TEAM_MEMBERS.map((m) => ({
                    id: m.name,
                    label: m.name,
                    sublabel: m.defaultRole,
                    icon: (
                      <div className={`w-5 h-5 rounded-full ${m.avatarBg} text-white flex items-center justify-center text-[9px] font-bold shrink-0`}>
                        {m.initials}
                      </div>
                    )
                  }))}
                  trigger={
                    <div className="w-full bg-white border border-[#cbd5e1] px-3 py-2 rounded-xl text-xs font-semibold text-[#0f172a] flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-1.5 truncate">
                        {collaborators.length === 0 ? (
                          <span className="text-[#94a3b8]">Seleccionar colaboradores...</span>
                        ) : (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="font-bold text-[#501f92]">
                              {collaborators.map((c) => c.split(' ')[0]).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                    </div>
                  }
                  className="w-full"
                  menuClassName="w-full z-40 max-h-56"
                />
              </div>

              {/* Seguidores (Multiselección) */}
              <div>
                <label className="block font-bold text-[#0f172a] text-[11px] mb-1 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#6366f1]" />
                  <span>Seguidores (Acompañamiento)</span>
                </label>
                <DropdownMenu
                  multiple={true}
                  value={followers}
                  onChange={() => {}}
                  onMultiChange={(vals) => setFollowers(vals)}
                  options={TEAM_MEMBERS.map((m) => ({
                    id: m.name,
                    label: m.name,
                    sublabel: m.defaultRole,
                    icon: (
                      <div className={`w-5 h-5 rounded-full ${m.avatarBg} text-white flex items-center justify-center text-[9px] font-bold shrink-0`}>
                        {m.initials}
                      </div>
                    )
                  }))}
                  trigger={
                    <div className="w-full bg-white border border-[#cbd5e1] px-3 py-2 rounded-xl text-xs font-semibold text-[#0f172a] flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-1.5 truncate">
                        {followers.length === 0 ? (
                          <span className="text-[#94a3b8] italic">Sin seguidores</span>
                        ) : (
                          <span className="font-bold text-[#6366f1]">
                            {followers.map((f) => f.split(' ')[0]).join(', ')}
                          </span>
                        )}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                    </div>
                  }
                  className="w-full"
                  menuClassName="w-full z-40 max-h-56"
                />
              </div>
            </div>
          </div>

          {/* PASO 5: HORAS, PRIORIDAD Y FECHAS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Horas */}
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Horas cotizadas *
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={budgetedHours}
                  onChange={(e) => setBudgetedHours(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] pl-8 pr-3 py-2 rounded-xl text-xs font-mono font-bold text-[#0f172a] focus:outline-none focus:border-[#8a4dff]"
                />
              </div>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Prioridad *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#8a4dff] cursor-pointer"
              >
                <option value="Low">Baja</option>
                <option value="Medium">Media</option>
                <option value="High">Alta</option>
                <option value="Critical">Crítica / Urgente</option>
              </select>
            </div>

            {/* Fecha Límite */}
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Fecha límite *
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] pl-8 pr-3 py-2 rounded-xl text-xs font-bold text-[#0f172a] focus:outline-none focus:border-[#8a4dff]"
                />
              </div>
            </div>
          </div>

          {/* PASO 6: DEPENDENCIAS (Tareas Hermanas del mismo Proyecto) */}
          {siblingTasks.length > 0 && (
            <div>
              <label className="block font-semibold text-[#64748b] mb-1">
                Dependencia / Bloqueada por (opcional)
              </label>
              <div className="flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                <select
                  value={dependencyTaskId}
                  onChange={(e) => setDependencyTaskId(e.target.value)}
                  className="flex-1 bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-xl text-xs text-[#0f172a] focus:outline-none focus:border-[#8a4dff] cursor-pointer"
                >
                  <option value="">Sin dependencias (inicia de inmediato)</option>
                  {siblingTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* PASO 7: CRITERIOS DE ACEPTACIÓN (CHECKLIST) */}
          <div className="space-y-2 pt-2 border-t border-[#f1f5f9]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#0f172a] text-xs">
                Criterios de Aceptación & Entregables
              </label>
              <span className="text-[10px] text-[#64748b]">Checklist para revisión</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ej. Aprobación de copy por parte del cliente, link de staging activo..."
                value={criterionInput}
                onChange={(e) => setCriterionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCriterion();
                  }
                }}
                className="flex-1 bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-xl text-xs text-[#0f172a] focus:outline-none focus:border-[#8a4dff]"
              />
              <button
                type="button"
                onClick={handleAddCriterion}
                className="px-3 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                + Agregar
              </button>
            </div>

            {criteriaList.length > 0 && (
              <div className="space-y-1 pt-1">
                {criteriaList.map((crit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs"
                  >
                    <span className="text-[#334155]">✓ {crit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCriterion(idx)}
                      className="text-[#94a3b8] hover:text-[#ef4444] p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Tarea</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
