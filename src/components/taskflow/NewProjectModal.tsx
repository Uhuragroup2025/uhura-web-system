import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Briefcase,
  Layers,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  Check,
  User,
  Plus,
  Repeat,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Users,
  FileText,
  Trash2,
  AlertCircle,
  Search,
  CheckSquare
} from 'lucide-react';
import { ClientProfile, ProjectType, TaskItem, ProjectPhase } from './types';

export interface NewProjectPayload {
  name: string;
  clientName: string;
  brand: string;
  projectType: ProjectType;
  serviceBase: string;
  areas?: string[];
  leadName: string;
  leadAvatarBg: string;
  budgetedHours: number;
  soldHours?: number;
  soldValueCOP?: number;
  soldCurrency?: 'COP' | 'USD';
  startDate: string;
  endDate: string;
  brief?: string;
  teamMembers?: { name: string; role: string; avatarBg: string; initials: string }[];
  tasksToCreate?: Omit<TaskItem, 'id'>[];
}

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientProfile[];
  preselectedClientId?: string | null;
  onAddProject: (projectData: NewProjectPayload) => void;
}

export const UHURA_OPERATIONAL_AREAS = [
  { id: 'creatividad', name: 'Creatividad & Contenido', icon: '🎨', desc: 'Diseño visual, branding, copy, reels y piezas' },
  { id: 'producto', name: 'Producto & Dev Web', icon: '💻', desc: 'Desarrollo web, e-commerce, UX/UI, QA y plugins' },
  { id: 'paid', name: 'Paid Media & Ads', icon: '🎯', desc: 'Pauta digital, Meta/Google Ads, ROAS y analítica' },
  { id: 'growth', name: 'Growth & SEO', icon: '🚀', desc: 'Posicionamiento orgánico, CRO y automatizaciones' },
  { id: 'operaciones', name: 'Operaciones & Procesos', icon: '⚙️', desc: 'Procesos internos, optimización y herramientas' }
];

interface TemplateTaskDef {
  id: string;
  title: string;
  hours: number;
  role: string;
  area: string;
  phase?: ProjectPhase;
}

export const AREA_TASK_SUGGESTIONS: Record<string, TemplateTaskDef[]> = {
  'Creatividad & Contenido': [
    { id: 'cc-1', title: 'Conceptualización & Matriz Creativa de Contenidos', hours: 4.0, role: 'Content Strategist', area: 'Creatividad & Contenido' },
    { id: 'cc-2', title: 'Redacción de Copies, Hooks & Guiones para Reels', hours: 4.0, role: 'Copywriter', area: 'Creatividad & Contenido' },
    { id: 'cc-3', title: 'Diseño de Key Visuals & Carruseles de Marca en Figma', hours: 6.0, role: 'Diseñador Gráfico', area: 'Creatividad & Contenido' },
    { id: 'cc-4', title: 'Publicación, Programación & Monitoreo de Comunidad', hours: 5.0, role: 'Community Manager', area: 'Creatividad & Contenido' }
  ],
  'Producto & Dev Web': [
    { id: 'pw-1', title: 'Arquitectura de Información, Wireframes & UX Flow', hours: 5.0, role: 'Product Lead', area: 'Producto & Dev Web' },
    { id: 'pw-2', title: 'Maquetación Frontend Responsive & Componentes Web', hours: 10.0, role: 'Front End', area: 'Producto & Dev Web' },
    { id: 'pw-3', title: 'Integraciones Backend, Formulario & APIs', hours: 8.0, role: 'Backend & Tech Dev', area: 'Producto & Dev Web' },
    { id: 'pw-4', title: 'QA Funcional, Pruebas Cross-Browser & Performance', hours: 4.0, role: 'Front End', area: 'Producto & Dev Web' }
  ],
  'Paid Media & Ads': [
    { id: 'pm-1', title: 'Configuración de Campañas & Públicos en Meta/Google Ads', hours: 4.0, role: 'Trafficker & Paid Media', area: 'Paid Media & Ads' },
    { id: 'pm-2', title: 'Optimización de Presupuestos & Estrategia de Puja', hours: 3.0, role: 'Trafficker & Paid Media', area: 'Paid Media & Ads' },
    { id: 'pm-3', title: 'Auditoría de Píxeles, API de Conversiones & Eventos', hours: 2.5, role: 'Trafficker & Paid Media', area: 'Paid Media & Ads' },
    { id: 'pm-4', title: 'Dashboard Ejecutivo & Reporte de ROAS Semanal', hours: 2.0, role: 'Trafficker & Paid Media', area: 'Paid Media & Ads' }
  ],
  'Growth & SEO': [
    { id: 'gs-1', title: 'Auditoría On-Page, Core Web Vitals e Indexación', hours: 5.0, role: 'Product Lead', area: 'Growth & SEO' },
    { id: 'gs-2', title: 'Keyword Research & Estrategia de Contenidos SEO', hours: 4.0, role: 'Content Strategist', area: 'Growth & SEO' },
    { id: 'gs-3', title: 'Optimización de Tasa de Conversión (CRO) en Embudos', hours: 3.5, role: 'Front End', area: 'Growth & SEO' }
  ],
  'Operaciones & Procesos': [
    { id: 'op-1', title: 'Mapeo de Flujo Operativo & Detección de Fricciones', hours: 5.0, role: 'Product Lead', area: 'Operaciones & Procesos' },
    { id: 'op-2', title: 'Implementación de Plantillas & Automatización de Tareas', hours: 8.0, role: 'Backend & Tech Dev', area: 'Operaciones & Procesos' },
    { id: 'op-3', title: 'Documentación de SOPs & Capacitación del Equipo', hours: 4.0, role: 'Lead Project Manager', area: 'Operaciones & Procesos' }
  ]
};

const ALL_TEAM_MEMBERS = [
  { name: 'Paola (Lead PM)', role: 'Lead Project Manager', avatarBg: 'bg-[#501f92]', initials: 'PL', isLead: true },
  { name: 'Catalina Tejada', role: 'Directora Comercial / Web Designer', avatarBg: 'bg-[#7c3aed]', initials: 'CT' },
  { name: 'Andrés Ríos', role: 'Product Lead & Tech', avatarBg: 'bg-[#ef4444]', initials: 'AR' },
  { name: 'Camilo Vélez', role: 'Content Strategist', avatarBg: 'bg-[#059669]', initials: 'CV' },
  { name: 'Diego Cadavid', role: 'Diseñador Gráfico', avatarBg: 'bg-[#f59e0b]', initials: 'DC' },
  { name: 'Laura Gómez', role: 'Front End Developer', avatarBg: 'bg-[#0284c7]', initials: 'LG' },
  { name: 'Esteban Mora', role: 'Backend & Tech Dev', avatarBg: 'bg-[#0d9488]', initials: 'EM' },
  { name: 'Sebas (Trafficker)', role: 'Trafficker & Paid Media', avatarBg: 'bg-[#2563eb]', initials: 'ST' },
  { name: 'Mariana Toro', role: 'Copywriter', avatarBg: 'bg-[#ec4899]', initials: 'MT' },
  { name: 'Mateo Ruiz', role: 'Community Manager', avatarBg: 'bg-[#8b5cf6]', initials: 'MR' }
];

const STEPS = [
  { id: 1, label: 'Cuenta & Nombre', shortDesc: 'Cliente y Project Lead' },
  { id: 2, label: 'Naturaleza & Áreas', shortDesc: 'Tipo y frentes operativos' },
  { id: 3, label: 'Comercial & Horas', shortDesc: 'Cotización y presupuesto' },
  { id: 4, label: 'Equipo & Fechas', shortDesc: 'Asignaciones y cronograma' }
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  clients,
  preselectedClientId,
  onAddProject
}) => {
  // Step state (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // 1. Cuenta State
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState<boolean>(false);
  const clientSearchRef = useRef<HTMLDivElement>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [customBrand, setCustomBrand] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState(ALL_TEAM_MEMBERS[0]);

  // 2. Naturaleza & Áreas Involucradas State
  const [projectType, setProjectType] = useState<ProjectType>('fee_monthly');
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['Creatividad & Contenido', 'Producto & Dev Web']);
  const [includeTemplateTasks, setIncludeTemplateTasks] = useState<boolean>(true);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([
    'cc-1', 'cc-2', 'cc-3', 'cc-4',
    'pw-1', 'pw-2', 'pw-3', 'pw-4'
  ]);

  // 3. Presupuesto & Comercial State (dinámico según tipo de proyecto)
  const [soldHours, setSoldHours] = useState<number>(20);
  const [soldValueStr, setSoldValueStr] = useState<string>('12000000');
  const [soldCurrency, setSoldCurrency] = useState<'COP' | 'USD'>('COP');

  // 4. Equipo & Fechas State
  const todayIso = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState<string>(todayIso);
  const [endDate, setEndDate] = useState<string>('2026-11-30');
  const [brief, setBrief] = useState<string>('');
  const [isBriefExpanded, setIsBriefExpanded] = useState<boolean>(false);
  const [selectedTeamMemberNames, setSelectedTeamMemberNames] = useState<string[]>([
    ALL_TEAM_MEMBERS[1].name, // Catalina
    ALL_TEAM_MEMBERS[2].name  // Andrés
  ]);

  // Global Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync client when modal opens or preselectedClientId changes
  useEffect(() => {
    if (preselectedClientId) {
      const match = clients.find((c) => c.id === preselectedClientId);
      if (match) {
        setSelectedClientId(match.id);
        setSelectedBrand(match.commercialInfo.brands[0] || '');
      }
    } else if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
      setSelectedBrand(clients[0].commercialInfo.brands[0] || '');
    }
  }, [isOpen, preselectedClientId, clients]);

  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Close client search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(e.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered clients for predictive search
  const filteredClients = clients.filter((c) => {
    if (!clientSearchQuery.trim()) return true;
    const q = clientSearchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.nit && c.nit.toLowerCase().includes(q)) ||
      (c.commercialInfo?.tier && c.commercialInfo.tier.toLowerCase().includes(q)) ||
      c.commercialInfo?.brands?.some((b) => b.toLowerCase().includes(q))
    );
  });

  // When client changes, update available brands
  useEffect(() => {
    if (currentClient && currentClient.commercialInfo?.brands?.length > 0) {
      setSelectedBrand(currentClient.commercialInfo.brands[0]);
    }
  }, [selectedClientId]);

  // Toggle area selection and automatically add/remove suggested tasks
  const handleToggleArea = (areaName: string) => {
    setSelectedAreas((prev) => {
      const isRemoving = prev.includes(areaName);
      if (isRemoving) {
        if (prev.length === 1) return prev; // keep at least one
        const next = prev.filter((a) => a !== areaName);
        const areaTaskIds = (AREA_TASK_SUGGESTIONS[areaName] || []).map((t) => t.id);
        setSelectedTaskIds((curr) => curr.filter((id) => !areaTaskIds.includes(id)));
        return next;
      } else {
        const next = [...prev, areaName];
        const areaTaskIds = (AREA_TASK_SUGGESTIONS[areaName] || []).map((t) => t.id);
        setSelectedTaskIds((curr) => Array.from(new Set([...curr, ...areaTaskIds])));
        return next;
      }
    });
  };

  // Toggle individual suggested task selection
  const handleToggleTaskId = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  // Toggle team member
  const handleToggleTeamMember = (memberName: string) => {
    if (memberName === selectedLead.name) return;
    setSelectedTeamMemberNames((prev) =>
      prev.includes(memberName) ? prev.filter((m) => m !== memberName) : [...prev, memberName]
    );
  };

  if (!isOpen) return null;

  // Compute available tasks based on currently selected areas
  const availableSuggestedTasks: TemplateTaskDef[] = selectedAreas.flatMap(
    (areaName) => AREA_TASK_SUGGESTIONS[areaName] || []
  );
  const activeSuggestedTasks = availableSuggestedTasks.filter((t) => selectedTaskIds.includes(t.id));
  const activeSuggestedHours = activeSuggestedTasks.reduce((acc, t) => acc + t.hours, 0);

  // Compute duration in weeks / days
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffTime = Math.max(0, endD.getTime() - startD.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = (diffDays / 7).toFixed(1);

  // Step navigation validations
  const canProceedStep1 = Boolean(selectedClientId && projectName.trim());
  const canProceedStep2 = Boolean(projectType && selectedAreas.length > 0);
  const canProceedStep3 = projectType === 'internal' ? soldHours > 0 : Boolean(soldHours > 0 && soldValueStr.trim());

  const handleNextStep = () => {
    if (currentStep === 1 && !canProceedStep1) return;
    if (currentStep === 2 && !canProceedStep2) return;
    if (currentStep === 3 && !canProceedStep3) return;
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      handleNextStep();
      return;
    }

    const finalBrand = customBrand.trim() ? customBrand.trim() : selectedBrand || currentClient?.name || 'General';
    const primaryService = selectedAreas[0] || 'Multidisciplinario';
    const finalName = projectName.trim() || `${primaryService} · ${finalBrand}`;

    // Prepare template tasks to create if selected and marked
    const tasksToCreate: Omit<TaskItem, 'id'>[] | undefined =
      includeTemplateTasks && activeSuggestedTasks.length > 0
        ? activeSuggestedTasks.map((taskTpl) => ({
            title: taskTpl.title,
            department: taskTpl.area,
            board: finalName,
            clientName: currentClient?.name || 'Cliente',
            projectName: finalName,
            categoryType: projectType === 'internal' ? ('internal' as const) : ('client' as const),
            assignee: {
              name: selectedLead.name,
              initials: selectedLead.initials,
              avatarBg: selectedLead.avatarBg,
              role: taskTpl.role
            },
            date: 'Hoy',
            startDate: startDate,
            dueDate: endDate,
            dueStatus: 'normal' as const,
            dueText: 'En fecha',
            status: 'To Do' as const,
            priority: 'Medium' as const,
            completed: false,
            budgetedHours: taskTpl.hours,
            budgetedRole: taskTpl.role,
            consumedSeconds: 0,
            projectType,
            phase: taskTpl.phase
          }))
        : undefined;

    const otherTeamMembers = ALL_TEAM_MEMBERS.filter(
      (m) => selectedTeamMemberNames.includes(m.name) && m.name !== selectedLead.name
    );
    const team = [selectedLead, ...otherTeamMembers];

    const numericSoldValue = projectType === 'internal' ? 0 : parseFloat(soldValueStr.replace(/[^0-9.]/g, '')) || 0;

    onAddProject({
      name: finalName,
      clientName: currentClient?.name || 'Cliente',
      brand: finalBrand,
      projectType,
      serviceBase: primaryService,
      areas: selectedAreas,
      leadName: selectedLead.name,
      leadAvatarBg: selectedLead.avatarBg,
      budgetedHours: Number(soldHours) || 20,
      soldHours: Number(soldHours) || 20,
      soldValueCOP: numericSoldValue,
      soldCurrency: soldCurrency,
      startDate,
      endDate,
      brief: brief.trim() ? brief.trim() : undefined,
      teamMembers: team,
      tasksToCreate
    });

    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#e2e8f0] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Connected Stepper */}
        <div className="px-6 pt-5 pb-4 border-b border-[#f1f5f9] bg-[#f8fafc] shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#501f92] text-white flex items-center justify-center font-bold shadow-xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-[#0f172a] leading-none">Crear Nuevo Proyecto</h2>
                <p className="text-[11px] text-[#64748b] mt-0.5">
                  Paso {currentStep} de 4: <strong className="text-[#501f92]">{STEPS[currentStep - 1].label}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Bar with Connected Lines */}
          <div className="pt-2 pb-1 relative">
            {/* Background Connector Track */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#e2e8f0] z-0" />
            {/* Active Progress Track */}
            <div
              style={{ width: `${Math.max(0, ((currentStep - 1) / 3)) * 80}%` }}
              className="absolute top-4 left-6 h-0.5 bg-[#501f92] z-0 transition-all duration-300"
            />

            <div className="grid grid-cols-4 gap-2 relative z-10">
              {STEPS.map((s) => {
                const isCompleted = currentStep > s.id;
                const isCurrent = currentStep === s.id;
                const isFuture = currentStep < s.id;

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      if (s.id < currentStep) setCurrentStep(s.id);
                    }}
                    disabled={isFuture}
                    className={`flex flex-col items-center text-center transition-all ${
                      isCompleted || isCurrent ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    {/* Circle Indicator */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs mb-1.5 ${
                        isCompleted
                          ? 'bg-[#f2ecfb] text-[#501f92] border-2 border-[#501f92] ring-2 ring-[#501f92]/20'
                          : isCurrent
                          ? 'bg-[#501f92] text-white ring-4 ring-[#501f92]/25 scale-105'
                          : 'bg-[#f8fafc] border-2 border-[#cbd5e1] text-[#94a3b8]'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 text-[#501f92] stroke-[3]" /> : s.id}
                    </div>

                    {/* Step Label Pill */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all truncate max-w-full ${
                        isCompleted
                          ? 'bg-[#f2ecfb] text-[#501f92] border border-[#8a4dff]/30 font-bold'
                          : isCurrent
                          ? 'bg-[#501f92] text-white font-extrabold shadow-2xs'
                          : 'text-[#64748b] bg-transparent'
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          
          {/* =========================================================================
              PASO 1 · CUENTA & IDENTIFICACIÓN
             ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-[#f5f3ff] border border-[#e9d5ff] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#501f92]">Paso 1: Información de Cuenta y Gobernanza</span>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    Define la cuenta cliente, el nombre identificador del proyecto y el Project Lead responsable.
                  </p>
                </div>
              </div>

              {/* Cliente & Marca */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="relative" ref={clientSearchRef}>
                  <label className="block font-bold text-[#0f172a] mb-1">
                    Cliente *
                  </label>
                  
                  {/* Predictive Search Input */}
                  <div className="relative">
                    <div className="flex items-center w-full bg-[#f8fafc] hover:bg-white focus-within:bg-white border border-[#e2e8f0] focus-within:border-[#501f92] rounded-xl transition-all shadow-2xs">
                      <Search className="w-3.5 h-3.5 text-[#94a3b8] ml-3 shrink-0 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Buscar cliente por nombre o NIT..."
                        value={isClientDropdownOpen ? clientSearchQuery : currentClient?.name || ''}
                        onChange={(e) => {
                          setClientSearchQuery(e.target.value);
                          setIsClientDropdownOpen(true);
                        }}
                        onFocus={() => {
                          setClientSearchQuery('');
                          setIsClientDropdownOpen(true);
                        }}
                        className="w-full px-2.5 py-2 text-[#0f172a] font-bold text-xs bg-transparent focus:outline-none placeholder-[#94a3b8]"
                      />
                      <button
                        type="button"
                        onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                        className="p-2 text-[#64748b] hover:text-[#0f172a] cursor-pointer"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isClientDropdownOpen ? 'rotate-180 text-[#501f92]' : ''}`} />
                      </button>
                    </div>

                    {/* Predictive Search Results Dropdown */}
                    {isClientDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-[#e2e8f0] shadow-xl z-50 max-h-56 overflow-y-auto py-1 animate-in fade-in zoom-in-95">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] border-b border-[#f1f5f9] flex justify-between items-center">
                          <span>Resultados ({filteredClients.length})</span>
                          <span>Escribe para filtrar</span>
                        </div>
                        {filteredClients.length === 0 ? (
                          <div className="p-3 text-center text-xs text-[#64748b]">
                            No se encontraron clientes con "{clientSearchQuery}"
                          </div>
                        ) : (
                          filteredClients.map((cli) => {
                            const isSelected = cli.id === selectedClientId;
                            return (
                              <button
                                key={cli.id}
                                type="button"
                                onClick={() => {
                                  setSelectedClientId(cli.id);
                                  setClientSearchQuery('');
                                  setIsClientDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#f8fafc] transition-colors cursor-pointer ${
                                  isSelected ? 'bg-[#f5f3ff] text-[#501f92] font-bold' : 'text-[#0f172a]'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Building2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#501f92]' : 'text-[#94a3b8]'}`} />
                                  <div className="truncate">
                                    <span className="block truncate">{cli.name}</span>
                                    <span className="text-[10px] text-[#64748b] block font-normal">
                                      NIT: {cli.nit || 'N/A'} · {cli.commercialInfo?.brands?.join(', ') || 'Sin marcas'}
                                    </span>
                                  </div>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#501f92] shrink-0" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#64748b] mt-1 block">
                    NIT: {currentClient?.nit || 'N/A'} · Gobernanza multimarca
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-[#0f172a] mb-1">
                    Marca del Cliente
                  </label>
                  {currentClient?.commercialInfo?.brands && currentClient.commercialInfo.brands.length > 0 ? (
                    <select
                      value={selectedBrand}
                      onChange={(e) => {
                        setSelectedBrand(e.target.value);
                        if (e.target.value !== 'other') setCustomBrand('');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-semibold focus:outline-none focus:border-[#501f92] focus:bg-white cursor-pointer"
                    >
                      {currentClient.commercialInfo.brands.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                      <option value="other">+ Otra marca...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Nombre de la marca"
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white"
                    />
                  )}
                  {selectedBrand === 'other' && (
                    <input
                      type="text"
                      placeholder="Escribe el nombre de la nueva marca..."
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      className="w-full mt-2 px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white text-[#0f172a] focus:outline-none focus:border-[#501f92]"
                    />
                  )}
                </div>
              </div>

              {/* Nombre del Proyecto */}
              <div>
                <label className="block font-bold text-[#0f172a] mb-1">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Campaña Navidad Yamaha, Fee Integral Q3, Landing STEM..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0f172a] font-bold focus:outline-none focus:border-[#501f92] focus:bg-white"
                />
              </div>

              {/* Project Lead */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-[#0f172a]">
                    Project Lead Accountable *
                  </label>
                  <span className="text-[10px] text-[#64748b]">Lidera gobernanza, entregas y tiempos</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl ${selectedLead.avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-2xs`}>
                      {selectedLead.initials}
                    </div>
                    <div>
                      <strong className="text-xs text-[#0f172a] block">{selectedLead.name}</strong>
                      <span className="text-[10px] text-[#64748b]">{selectedLead.role}</span>
                    </div>
                  </div>

                  <select
                    value={selectedLead.name}
                    onChange={(e) => {
                      const lead = ALL_TEAM_MEMBERS.find((l) => l.name === e.target.value) || ALL_TEAM_MEMBERS[0];
                      setSelectedLead(lead);
                    }}
                    className="bg-white border border-[#e2e8f0] px-3 py-1.5 rounded-xl text-xs font-bold text-[#501f92] focus:outline-none focus:border-[#501f92] cursor-pointer"
                  >
                    {ALL_TEAM_MEMBERS.map((l) => (
                      <option key={l.name} value={l.name}>
                        {l.name} ({l.role.split('/')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              PASO 2 · NATURALEZA & ÁREAS INVOLUCRADAS (Multidisciplinario)
             ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-[#f5f3ff] border border-[#e9d5ff] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#501f92]">Paso 2: Naturaleza del Proyecto & Áreas Involucradas</span>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    Un proyecto puede combinar creatividad, producto, dev y growth en una misma venta y gobernanza.
                  </p>
                </div>
              </div>

              {/* Tipo de Proyecto (3 Cards) */}
              <div>
                <label className="block font-bold text-[#0f172a] mb-2">
                  Tipo de proyecto *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Fee mensual */}
                  <button
                    type="button"
                    onClick={() => setProjectType('fee_monthly')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      projectType === 'fee_monthly'
                        ? 'border-[#501f92] bg-[#f2ecfb]/60 ring-2 ring-[#501f92]'
                        : 'border-[#e2e8f0] bg-white hover:bg-[#f8fafc]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#0f172a]">
                        <Repeat className="w-4 h-4 text-[#501f92]" />
                        <span>Fee mensual</span>
                      </div>
                      {projectType === 'fee_monthly' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#501f92]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748b] leading-relaxed">
                      Soporte recurrente, bolsa de horas multidisciplinaria y facturación mensual.
                    </p>
                  </button>

                  {/* Proyecto único */}
                  <button
                    type="button"
                    onClick={() => setProjectType('fixed_milestones')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      projectType === 'fixed_milestones'
                        ? 'border-[#2563eb] bg-[#eff6ff] ring-2 ring-[#2563eb]'
                        : 'border-[#e2e8f0] bg-white hover:bg-[#f8fafc]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#0f172a]">
                        <Layers className="w-4 h-4 text-[#2563eb]" />
                        <span>Proyecto único</span>
                      </div>
                      {projectType === 'fixed_milestones' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748b] leading-relaxed">
                      Entregable puntual por hitos con fecha de inicio, cierre y valor cotizado total.
                    </p>
                  </button>

                  {/* Interno */}
                  <button
                    type="button"
                    onClick={() => setProjectType('internal')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      projectType === 'internal'
                        ? 'border-[#059669] bg-[#ecfdf5] ring-2 ring-[#059669]'
                        : 'border-[#e2e8f0] bg-white hover:bg-[#f8fafc]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#0f172a]">
                        <ShieldCheck className="w-4 h-4 text-[#059669]" />
                        <span>Interno / No facturable</span>
                      </div>
                      {projectType === 'internal' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748b] leading-relaxed">
                      Iniciativa propia de Uhura o procesos. Sin facturación comercial externa.
                    </p>
                  </button>
                </div>
              </div>

              {/* Áreas / Frentes Involucrados (Multi-selección flexible) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-[#0f172a]">
                    Áreas / Frentes Involucrados * <span className="text-[11px] font-normal text-[#64748b]">(Selecciona todas las que apliquen)</span>
                  </label>
                  <span className="text-[11px] font-bold text-[#501f92] bg-[#f2ecfb] px-2.5 py-0.5 rounded-lg border border-[#8a4dff]/30">
                    {selectedAreas.length} {selectedAreas.length === 1 ? 'área seleccionada' : 'áreas seleccionadas'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {UHURA_OPERATIONAL_AREAS.map((area) => {
                    const isSelected = selectedAreas.includes(area.name);
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => handleToggleArea(area.name)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#f2ecfb] border-[#501f92] text-[#0f172a] shadow-2xs'
                            : 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">{area.icon}</span>
                          <div className="truncate">
                            <strong className={`block text-xs truncate ${isSelected ? 'text-[#501f92]' : 'text-[#0f172a]'}`}>
                              {area.name}
                            </strong>
                            <span className="text-[10px] text-[#64748b] block truncate">{area.desc}</span>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#501f92] text-white' : 'border border-[#cbd5e1] bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tareas Sugeridas Automáticas por Áreas */}
              {availableSuggestedTasks.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#e2e8f0]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a]">
                      <Sparkles className="w-4 h-4 text-[#8a4dff]" />
                      <span>
                        Tareas sugeridas ({activeSuggestedTasks.length} de {availableSuggestedTasks.length} seleccionadas · {activeSuggestedHours}h estimadas)
                      </span>
                    </div>
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#501f92] cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-[#e2e8f0]">
                      <input
                        type="checkbox"
                        checked={includeTemplateTasks}
                        onChange={(e) => setIncludeTemplateTasks(e.target.checked)}
                        className="rounded text-[#501f92] focus:ring-0 cursor-pointer"
                      />
                      <span>Crear tareas al crear proyecto</span>
                    </label>
                  </div>

                  {includeTemplateTasks && (
                    <div className="space-y-3.5">
                      {selectedAreas.map((areaName) => {
                        const areaTasks = AREA_TASK_SUGGESTIONS[areaName] || [];
                        if (areaTasks.length === 0) return null;
                        const areaObj = UHURA_OPERATIONAL_AREAS.find((a) => a.name === areaName);

                        return (
                          <div key={areaName} className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-[#475569] font-bold">
                              <span className="flex items-center gap-1.5">
                                <span>{areaObj?.icon || '📁'}</span>
                                <span className="text-[#0f172a]">{areaName}</span>
                              </span>
                              <span className="text-[10px] text-[#64748b] font-mono">
                                {areaTasks.filter((t) => selectedTaskIds.includes(t.id)).length} de {areaTasks.length} tareas
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {areaTasks.map((taskTpl) => {
                                const isChecked = selectedTaskIds.includes(taskTpl.id);
                                return (
                                  <label
                                    key={taskTpl.id}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleToggleTaskId(taskTpl.id);
                                    }}
                                    className={`p-2 rounded-xl border flex items-center justify-between text-[11px] cursor-pointer transition-all ${
                                      isChecked
                                        ? 'bg-white border-[#501f92]/30 text-[#0f172a] shadow-2xs'
                                        : 'bg-[#f1f5f9] border-[#e2e8f0] text-[#94a3b8] opacity-75'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate pr-2">
                                      <div
                                        className={`w-4 h-4 rounded flex items-center justify-center text-white shrink-0 ${
                                          isChecked ? 'bg-[#501f92]' : 'bg-[#cbd5e1]'
                                        }`}
                                      >
                                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                      </div>
                                      <span className={`truncate ${isChecked ? 'font-medium' : 'line-through'}`}>
                                        {taskTpl.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <span className="text-[9px] text-[#64748b] bg-[#f8fafc] px-1.5 py-0.5 rounded border border-[#e2e8f0]">
                                        {taskTpl.role}
                                      </span>
                                      <span className="font-mono font-bold text-[#501f92]">{taskTpl.hours}h</span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              PASO 3 · COMERCIAL & HORAS
             ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-[#f5f3ff] border border-[#e9d5ff] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#501f92]">
                    Paso 3: {projectType === 'internal' ? 'Presupuesto Interno de Horas' : 'Información Comercial & Horas Cotizadas'}
                  </span>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    {projectType === 'fee_monthly'
                      ? 'Parámetros mensuales para Fee recurrente'
                      : projectType === 'fixed_milestones'
                      ? 'Parámetros totales para Proyecto único por entregables'
                      : 'Iniciativa interna no facturable'}
                  </p>
                </div>
              </div>

              {/* 3A: INTERNO / NO FACTURABLE */}
              {projectType === 'internal' && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-[#065f46]">Iniciativa Interna / No Facturable</h4>
                      <p className="text-[11px] text-[#047857] mt-0.5 leading-relaxed">
                        Este proyecto no genera facturación comercial externa. Orbit auditará el presupuesto interno de horas contra las horas ejecutadas.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#0f172a] mb-1">
                      Horas estimadas / presupuesto interno *
                    </label>
                    <div className="relative max-w-xs">
                      <Clock className="w-4 h-4 text-[#059669] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        required
                        value={soldHours}
                        onChange={(e) => setSoldHours(parseFloat(e.target.value) || 0)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#a7f3d0] bg-white text-[#065f46] font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3B: FEE MENSUAL */}
              {projectType === 'fee_monthly' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Valor Fee Mensual */}
                    <div>
                      <label className="block font-bold text-[#0f172a] mb-1">
                        Valor fee mensual *
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={soldValueStr}
                          onChange={(e) => setSoldValueStr(e.target.value)}
                          placeholder="Ej: 12.000.000"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-mono font-bold text-sm focus:outline-none focus:border-[#501f92] focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Moneda */}
                    <div>
                      <label className="block font-bold text-[#0f172a] mb-1">
                        Moneda *
                      </label>
                      <select
                        value={soldCurrency}
                        onChange={(e) => setSoldCurrency(e.target.value as 'COP' | 'USD')}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-bold focus:outline-none focus:border-[#501f92] focus:bg-white cursor-pointer"
                      >
                        <option value="COP">COP ($ Pesos Colombianos)</option>
                        <option value="USD">USD ($ Dólares Americanos)</option>
                      </select>
                    </div>

                    {/* Horas Mensuales Cotizadas */}
                    <div>
                      <label className="block font-bold text-[#0f172a] mb-1">
                        Horas mensuales cotizadas *
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          min="1"
                          step="0.5"
                          required
                          value={soldHours}
                          onChange={(e) => setSoldHours(parseFloat(e.target.value) || 0)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-mono font-bold text-sm focus:outline-none focus:border-[#501f92] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748b]">
                    <span>
                      💡 <strong>Ciclo mensual recurrente:</strong> La bolsa de {soldHours} horas cotizadas se renueva cada mes calendario.
                    </span>
                    {includeTemplateTasks && activeSuggestedHours > 0 && (
                      <span className="font-semibold text-[#501f92]">
                        {activeSuggestedHours}h en tareas sugeridas · {Math.max(0, soldHours - activeSuggestedHours).toFixed(1)}h reserva disponible
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 3C: PROYECTO ÚNICO */}
              {projectType === 'fixed_milestones' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Valor Vendido Total */}
                    <div>
                      <label className="block font-bold text-[#0f172a] mb-1">
                        Valor cotizado total *
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={soldValueStr}
                          onChange={(e) => setSoldValueStr(e.target.value)}
                          placeholder="Ej: 35.000.000"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-mono font-bold text-sm focus:outline-none focus:border-[#501f92] focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Moneda */}
                    <div>
                      <label className="block font-bold text-[#0f172a] mb-1">
                        Moneda *
                      </label>
                      <select
                        value={soldCurrency}
                        onChange={(e) => setSoldCurrency(e.target.value as 'COP' | 'USD')}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-bold focus:outline-none focus:border-[#501f92] focus:bg-white cursor-pointer"
                      >
                        <option value="COP">COP ($ Pesos Colombianos)</option>
                        <option value="USD">USD ($ Dólares Americanos)</option>
                      </select>
                    </div>

                    {/* Horas Totales Cotizadas */}
                    <div>
                      <label className="block font-bold text-[#0f172a] mb-1">
                        Horas totales cotizadas *
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          min="1"
                          step="0.5"
                          required
                          value={soldHours}
                          onChange={(e) => setSoldHours(parseFloat(e.target.value) || 0)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-mono font-bold text-sm focus:outline-none focus:border-[#501f92] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748b]">
                    <span>
                      🎯 <strong>Entregable puntual:</strong> Las {soldHours} horas cotizadas cubren la totalidad de los frentes e hitos comprometidos.
                    </span>
                    {includeTemplateTasks && activeSuggestedHours > 0 && (
                      <span className="font-semibold text-[#501f92]">
                        {activeSuggestedHours}h en tareas sugeridas · {Math.max(0, soldHours - activeSuggestedHours).toFixed(1)}h reserva disponible
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              PASO 4 · EQUIPO & FECHAS
             ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-[#f5f3ff] border border-[#e9d5ff] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#501f92]">Paso 4: Cronograma, Equipo de Trabajo & Contexto</span>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    Asigna el equipo de ejecución y el horizonte temporal del proyecto.
                  </p>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[#0f172a] mb-1">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-medium focus:outline-none focus:border-[#501f92] focus:bg-white cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#0f172a]">
                      Fecha de Cierre / Entrega *
                    </label>
                    {diffDays > 0 && (
                      <span className="text-[10px] text-[#501f92] font-semibold font-mono">
                        {diffWeeks} sem ({diffDays}d)
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-medium focus:outline-none focus:border-[#501f92] focus:bg-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Project Lead & Equipo de Trabajo */}
              <div className="space-y-3 pt-1">
                {/* 1. Lead destacado */}
                <div>
                  <label className="block font-bold text-[#0f172a] mb-1 text-[11px] uppercase tracking-wider">
                    Project Lead Asignado
                  </label>
                  <div className="p-3 rounded-2xl bg-[#f2ecfb] border border-[#8a4dff]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${selectedLead.avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-2xs`}>
                        {selectedLead.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-xs text-[#501f92]">{selectedLead.name}</strong>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white text-[#501f92] font-extrabold uppercase">Lead</span>
                        </div>
                        <span className="text-[10px] text-[#64748b]">{selectedLead.role}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#501f92] font-semibold">Accountable del Proyecto</span>
                  </div>
                </div>

                {/* 2. Equipo de Trabajo (solo el resto) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-[#0f172a] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#501f92]" />
                      <span>Equipo de Trabajo (Integrantes)</span>
                    </label>
                    <span className="text-[11px] text-[#64748b]">
                      {selectedTeamMemberNames.filter((n) => n !== selectedLead.name).length} colaboradores adicionales
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-[#e2e8f0] bg-white space-y-2.5">
                    {/* Selected members chips */}
                    <div className="flex flex-wrap items-center gap-2">
                      {ALL_TEAM_MEMBERS.filter(
                        (m) => selectedTeamMemberNames.includes(m.name) && m.name !== selectedLead.name
                      ).map((member) => (
                        <div
                          key={member.name}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] text-xs font-medium"
                        >
                          <div className={`w-4 h-4 rounded-full ${member.avatarBg} text-white text-[9px] flex items-center justify-center font-mono`}>
                            {member.initials}
                          </div>
                          <span>{member.name}</span>
                          <span className="text-[10px] text-[#64748b] font-normal">({member.role.split('/')[0].trim()})</span>
                          <button
                            type="button"
                            onClick={() => handleToggleTeamMember(member.name)}
                            className="text-[#94a3b8] hover:text-[#dc2626] ml-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {selectedTeamMemberNames.filter((n) => n !== selectedLead.name).length === 0 && (
                        <span className="text-[11px] text-[#94a3b8] italic">
                          No has asignado colaboradores adicionales aún.
                        </span>
                      )}
                    </div>

                    {/* Quick Add Available Members */}
                    <div className="pt-2 border-t border-[#f1f5f9] flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-[#64748b] font-medium">+ Agregar al equipo:</span>
                      {ALL_TEAM_MEMBERS.filter(
                        (m) => m.name !== selectedLead.name && !selectedTeamMemberNames.includes(m.name)
                      ).map((availMember) => (
                        <button
                          key={availMember.name}
                          type="button"
                          onClick={() => handleToggleTeamMember(availMember.name)}
                          className="px-2 py-0.5 rounded-lg bg-[#f1f5f9] hover:bg-[#501f92]/10 hover:text-[#501f92] text-[#334155] font-medium transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>+ {availMember.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Brief / Contexto colapsable */}
              <div className="rounded-2xl border border-[#e2e8f0] overflow-hidden bg-[#f8fafc]">
                <button
                  type="button"
                  onClick={() => setIsBriefExpanded(!isBriefExpanded)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-[#334155] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#501f92]" />
                    <span>Brief / Contexto del proyecto</span>
                    {brief.trim() ? (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#ecfdf5] text-[#166534]">
                        Con contenido
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#94a3b8] font-normal">(Opcional)</span>
                    )}
                  </div>
                  {isBriefExpanded ? <ChevronUp className="w-4 h-4 text-[#64748b]" /> : <ChevronDown className="w-4 h-4 text-[#64748b]" />}
                </button>

                {isBriefExpanded && (
                  <div className="p-3 bg-white border-t border-[#e2e8f0]">
                    <textarea
                      rows={3}
                      placeholder="Agrega alcance, links a Figma/Drive, requerimientos clave o contexto operativo para el equipo..."
                      value={brief}
                      onChange={(e) => setBrief(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#e2e8f0] text-xs text-[#0f172a] focus:outline-none focus:border-[#501f92] placeholder:text-[#94a3b8] resize-y"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions / Navigation */}
          <div className="pt-4 border-t border-[#f1f5f9] flex items-center justify-between gap-3 shrink-0">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#334155] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#64748b] font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 2 && !canProceedStep2) ||
                    (currentStep === 3 && !canProceedStep3)
                  }
                  className="px-5 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#381566] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Crear Proyecto</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
