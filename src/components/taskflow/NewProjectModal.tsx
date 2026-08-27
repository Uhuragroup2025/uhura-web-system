import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { ClientProfile, ProjectType, TaskItem, ProjectPhase } from './types';

export interface NewProjectPayload {
  name: string;
  clientName: string;
  brand: string;
  projectType: ProjectType;
  serviceBase: string;
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

const BASE_SERVICES = [
  { id: 'srv-mant', name: 'Mantenimiento Web', defaultType: 'fee_monthly' as ProjectType, desc: 'Soporte continuo, plugins y assets recurrentes' },
  { id: 'srv-paid', name: 'Paid Media & Ads Performance', defaultType: 'fee_monthly' as ProjectType, desc: 'Pauta, optimización ROAS y analítica' },
  { id: 'srv-dev', name: 'Desarrollo Web & E-commerce', defaultType: 'fixed_milestones' as ProjectType, desc: 'Proyectos de producto, plataformas y landings' },
  { id: 'srv-cont', name: 'Parrilla de Contenidos & Social', defaultType: 'fee_monthly' as ProjectType, desc: 'Estrategia, diseño creativo, reels y copy' },
  { id: 'srv-growth', name: 'Growth & SEO', defaultType: 'fee_monthly' as ProjectType, desc: 'Posicionamiento orgánico y CRO' },
  { id: 'srv-ops', name: 'Operaciones & Procesos Internos', defaultType: 'internal' as ProjectType, desc: 'Automatizaciones, optimización de flujos y herramientas' }
];

interface TemplateTaskDef {
  title: string;
  hours: number;
  role: string;
  phase?: ProjectPhase;
}

interface TemplatePreset {
  id: string;
  title: string;
  serviceBase: string;
  suggestedHours: number;
  defaultType: ProjectType;
  tasks: TemplateTaskDef[];
}

const TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  'none': {
    id: 'none',
    title: 'Sin plantilla (en blanco)',
    serviceBase: 'Desarrollo Web & E-commerce',
    suggestedHours: 20,
    defaultType: 'fixed_milestones',
    tasks: []
  },
  'mant-std': {
    id: 'mant-std',
    title: 'Mantenimiento Web Estándar (Fee)',
    serviceBase: 'Mantenimiento Web',
    suggestedHours: 20,
    defaultType: 'fee_monthly',
    tasks: [
      { title: 'Actualización de Core, Plugins & Seguridad', hours: 2.0, role: 'Tech Lead' },
      { title: 'Carga & Reemplazo de Banners y Assets de Campaña', hours: 2.5, role: 'Web Designer' },
      { title: 'Revisión de Data, Eventos & Analytics', hours: 1.5, role: 'Content Strategist' },
      { title: 'Soporte Preventivo & Healthcheck Mensual', hours: 2.0, role: 'Tech Lead' }
    ]
  },
  'mant-ecom': {
    id: 'mant-ecom',
    title: 'Mantenimiento Web E-commerce (Fee)',
    serviceBase: 'Mantenimiento Web',
    suggestedHours: 35,
    defaultType: 'fee_monthly',
    tasks: [
      { title: 'Actualización de Precios, Catálogo & Stock', hours: 4.0, role: 'Front End' },
      { title: 'Auditoría de Pasarela de Pagos & Checkout QA', hours: 3.0, role: 'Front End' },
      { title: 'Actualización de Plugins & Seguridad WooCommerce/Shopify', hours: 3.0, role: 'Tech Lead' },
      { title: 'Carga de Banners Promocionales & Mobile Assets', hours: 3.5, role: 'Web Designer' }
    ]
  },
  'paid-campaign': {
    id: 'paid-campaign',
    title: 'Campaña Paid Media & Ads',
    serviceBase: 'Paid Media & Ads Performance',
    suggestedHours: 30,
    defaultType: 'fee_monthly',
    tasks: [
      { title: 'Configuración & Activación de Campañas Meta / Google Ads', hours: 4.0, role: 'Trafficker' },
      { title: 'Optimización de Presupuestos & CBO/ABO', hours: 3.0, role: 'Trafficker' },
      { title: 'Auditoría de Conversiones, API & Píxeles', hours: 2.5, role: 'Trafficker' },
      { title: 'Reporte Ejecutivo de Rendimiento / ROAS', hours: 2.0, role: 'Product Lead' }
    ]
  },
  'dev-landing': {
    id: 'dev-landing',
    title: 'Landing Page & Web Pro (Puntual)',
    serviceBase: 'Desarrollo Web & E-commerce',
    suggestedHours: 60,
    defaultType: 'fixed_milestones',
    tasks: [
      { title: 'Fase 1: Discovery, Arquitectura & Wireframing', hours: 8.0, role: 'Product Lead', phase: 'Discovery & Arquitectura' },
      { title: 'Fase 2: Diseño UI en Figma & Prototipo Interactivo', hours: 16.0, role: 'Web Designer', phase: 'UI/UX & Prototipado' },
      { title: 'Fase 3: Maquetación Frontend & Integraciones', hours: 24.0, role: 'Front End', phase: 'Implementación / Dev' },
      { title: 'Fase 4: QA, Pruebas Cross-Browser & Performance', hours: 8.0, role: 'Front End', phase: 'QA & Testing' },
      { title: 'Fase 5: Despliegue en Producción & Capacitación', hours: 4.0, role: 'Tech Lead', phase: 'Despliegue & Cierre' }
    ]
  },
  'social-grid': {
    id: 'social-grid',
    title: 'Parrilla & Redes Creativas (Fee)',
    serviceBase: 'Parrilla de Contenidos & Social',
    suggestedHours: 35,
    defaultType: 'fee_monthly',
    tasks: [
      { title: 'Conceptualización & Estrategia de Contenidos Q3', hours: 5.0, role: 'Content Strategist' },
      { title: 'Redacción de Copys & Guiones para Reels', hours: 4.0, role: 'Copywriter' },
      { title: 'Diseño de Piezas Gráficas & Carruseles en Figma', hours: 8.0, role: 'Diseñador Gráfico' },
      { title: 'Publicación & Gestión de Comunidad', hours: 6.0, role: 'Community Manager' }
    ]
  },
  'internal-ops': {
    id: 'internal-ops',
    title: 'Procesos & Optimización Interna (Interno)',
    serviceBase: 'Operaciones & Procesos Internos',
    suggestedHours: 25,
    defaultType: 'internal',
    tasks: [
      { title: 'Mapeo de Flujo Operativo & Detección de Cuellos de Botella', hours: 6.0, role: 'Product Lead' },
      { title: 'Implementación de Plantillas & Automatización de Tareas', hours: 12.0, role: 'Tech Lead' },
      { title: 'Capacitación al Equipo & Documentación de Soporte', hours: 7.0, role: 'Product Lead' }
    ]
  }
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
  { id: 2, label: 'Naturaleza & Servicio', shortDesc: 'Tipo y plantilla operativa' },
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
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [customBrand, setCustomBrand] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState(ALL_TEAM_MEMBERS[0]);

  // 2. Naturaleza & Servicio State
  const [projectType, setProjectType] = useState<ProjectType>('fee_monthly');
  const [selectedService, setSelectedService] = useState<string>(BASE_SERVICES[0].name);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('mant-std');
  const [includeTemplateTasks, setIncludeTemplateTasks] = useState<boolean>(true);
  const [selectedTaskIndices, setSelectedTaskIndices] = useState<number[]>([0, 1, 2, 3]);

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

  // When client changes, update available brands
  useEffect(() => {
    if (currentClient && currentClient.commercialInfo.brands.length > 0) {
      setSelectedBrand(currentClient.commercialInfo.brands[0]);
    }
  }, [selectedClientId]);

  // When template key changes, sync tasks selection and hours
  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplateKey(templateKey);
    const template = TEMPLATE_PRESETS[templateKey];
    if (template) {
      if (templateKey !== 'none') {
        setSelectedService(template.serviceBase);
        setProjectType(template.defaultType);
        setSoldHours(template.suggestedHours);
        setSelectedTaskIndices(template.tasks.map((_, i) => i));
        if (!projectName || Object.values(TEMPLATE_PRESETS).some((t) => projectName.includes(t.title))) {
          setProjectName(`${template.serviceBase} · ${selectedBrand || currentClient?.name || 'Cliente'}`);
        }
      } else {
        setSelectedTaskIndices([]);
      }
    }
  };

  // Toggle individual task selection in template preview
  const handleToggleTaskIndex = (index: number) => {
    setSelectedTaskIndices((prev) => {
      const exists = prev.includes(index);
      const next = exists ? prev.filter((i) => i !== index) : [...prev, index];
      // Recalculate suggested hours from selected tasks
      const currentTasks = TEMPLATE_PRESETS[selectedTemplateKey]?.tasks || [];
      const sumHours = next.reduce((acc, i) => acc + (currentTasks[i]?.hours || 0), 0);
      if (sumHours > 0 && (!soldHours || soldHours < sumHours)) {
        setSoldHours(sumHours);
      }
      return next;
    });
  };

  // Toggle team member (Lead is managed separately, so we exclude Lead from this toggle)
  const handleToggleTeamMember = (memberName: string) => {
    if (memberName === selectedLead.name) return;
    setSelectedTeamMemberNames((prev) =>
      prev.includes(memberName) ? prev.filter((m) => m !== memberName) : [...prev, memberName]
    );
  };

  if (!isOpen) return null;

  const currentTemplate = TEMPLATE_PRESETS[selectedTemplateKey] || TEMPLATE_PRESETS['none'];
  const activeTemplateTasks = currentTemplate.tasks.filter((_, idx) => selectedTaskIndices.includes(idx));
  const activeTemplateHours = activeTemplateTasks.reduce((acc, t) => acc + t.hours, 0);

  // Compute duration in weeks / days
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffTime = Math.max(0, endD.getTime() - startD.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = (diffDays / 7).toFixed(1);

  // Step navigation validations
  const canProceedStep1 = Boolean(selectedClientId && projectName.trim());
  const canProceedStep2 = Boolean(projectType && selectedService);
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
    const finalName = projectName.trim() || `${selectedService} · ${finalBrand}`;

    // Prepare template tasks to create if selected and marked
    const tasksToCreate: Omit<TaskItem, 'id'>[] | undefined =
      includeTemplateTasks && selectedTemplateKey !== 'none' && activeTemplateTasks.length > 0
        ? activeTemplateTasks.map((taskTpl) => ({
            title: taskTpl.title,
            department: selectedService,
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

    // Team members: Project Lead is technically included in backend/team, plus selected team members (without duplicate)
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
      serviceBase: selectedService,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#e2e8f0] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Stepper */}
        <div className="px-6 pt-5 pb-4 border-b border-[#f1f5f9] bg-[#f8fafc] shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#501f92] text-white flex items-center justify-center font-bold shadow-xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-[#0f172a] leading-none">Crear Nuevo Proyecto</h2>
                <p className="text-[11px] text-[#64748b] mt-0.5">
                  Paso {currentStep} de 4: {STEPS[currentStep - 1].label}
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

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {STEPS.map((s) => {
              const isCompleted = currentStep > s.id;
              const isCurrent = currentStep === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id < currentStep) setCurrentStep(s.id);
                  }}
                  className={`text-left group cursor-pointer transition-all ${
                    s.id <= currentStep ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div className="w-full h-1.5 rounded-full overflow-hidden mb-1.5 bg-[#e2e8f0]">
                    <div
                      className={`h-full transition-all ${
                        isCompleted
                          ? 'bg-[#10b981]'
                          : isCurrent
                          ? 'bg-[#501f92]'
                          : 'bg-transparent'
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                        isCompleted
                          ? 'bg-[#10b981] text-white'
                          : isCurrent
                          ? 'bg-[#501f92] text-white'
                          : 'bg-[#e2e8f0] text-[#64748b]'
                      }`}
                    >
                      {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : s.id}
                    </span>
                    <span className={`truncate ${isCurrent ? 'text-[#501f92]' : 'text-[#64748b]'}`}>
                      {s.label.split('&')[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          
          {/* =========================================================================
              PASO 1 · CUENTA & IDENTIFICACIÓN (Cliente limpio, Marca, Nombre, Lead)
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
                <div>
                  <label className="block font-bold text-[#0f172a] mb-1">
                    Cliente *
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-bold focus:outline-none focus:border-[#501f92] focus:bg-white cursor-pointer"
                  >
                    {clients.map((cli) => (
                      <option key={cli.id} value={cli.id}>
                        {cli.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-[#64748b] mt-1 block">
                    NIT: {currentClient?.nit || 'N/A'} · La naturaleza la define el proyecto
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-[#0f172a] mb-1">
                    Marca del Cliente
                  </label>
                  {currentClient?.commercialInfo.brands && currentClient.commercialInfo.brands.length > 0 ? (
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
                  placeholder="Ej: Campaña Navidad Yamaha, Fee Mantenimiento Q3, Landing STEM..."
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
              PASO 2 · NATURALEZA & SERVICIO (Tipo, Servicio base, Plantilla de tareas)
             ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-[#f5f3ff] border border-[#e9d5ff] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#501f92]">Paso 2: Naturaleza del Proyecto y Clasificación Operativa</span>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    El tipo de proyecto determina la estructura comercial y las reglas de trazabilidad.
                  </p>
                </div>
              </div>

              {/* Tipo de Proyecto * (3 Cards) */}
              <div>
                <label className="block font-bold text-[#0f172a] mb-2">
                  Tipo de proyecto *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Fee mensual */}
                  <button
                    type="button"
                    onClick={() => {
                      setProjectType('fee_monthly');
                      if (selectedTemplateKey === 'dev-landing') setSelectedTemplateKey('mant-std');
                    }}
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
                      Soporte recurrente, bolsa de horas y facturación mensual.
                    </p>
                  </button>

                  {/* Proyecto único */}
                  <button
                    type="button"
                    onClick={() => {
                      setProjectType('fixed_milestones');
                      if (selectedTemplateKey === 'mant-std') setSelectedTemplateKey('dev-landing');
                    }}
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
                    onClick={() => {
                      setProjectType('internal');
                      setSelectedTemplateKey('internal-ops');
                    }}
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
                      Iniciativa propia de Uhura o procesos. Sin facturación comercial.
                    </p>
                  </button>
                </div>
              </div>

              {/* Servicio Base & Plantilla */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block font-bold text-[#0f172a] mb-1">
                    Servicio Base *
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-bold focus:outline-none focus:border-[#501f92] focus:bg-white cursor-pointer"
                  >
                    {BASE_SERVICES.map((srv) => (
                      <option key={srv.id} value={srv.name}>
                        {srv.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#0f172a] mb-1">
                    Plantilla de arranque <span className="text-[11px] font-normal text-[#64748b]">(Opcional)</span>
                  </label>
                  <select
                    value={selectedTemplateKey}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-bold focus:outline-none focus:border-[#501f92] focus:bg-white cursor-pointer"
                  >
                    <option value="none">📄 Sin plantilla (en blanco)</option>
                    <option value="mant-std">⚡ Mantenimiento Web Estándar (4 tareas / 8h)</option>
                    <option value="mant-ecom">🛒 Mantenimiento E-commerce (4 tareas / 13.5h)</option>
                    <option value="paid-campaign">🎯 Campaña Paid Media & Ads (4 tareas / 11.5h)</option>
                    <option value="dev-landing">🚀 Landing Page & Web Pro (5 fases / 60h)</option>
                    <option value="social-grid">🎨 Parrilla Contenidos & Social (4 tareas / 17.5h)</option>
                    <option value="internal-ops">⚙️ Procesos & Optimización Interna (3 tareas / 25h)</option>
                  </select>
                </div>
              </div>

              {/* Template Tasks Interactive Selector */}
              {selectedTemplateKey !== 'none' && currentTemplate.tasks.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a]">
                      <Sparkles className="w-4 h-4 text-[#8a4dff]" />
                      <span>
                        {activeTemplateTasks.length} de {currentTemplate.tasks.length} tareas sugeridas ({activeTemplateHours}h en tareas)
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

                  {/* Template Hours Distribution Rule Notice */}
                  <div className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] text-[11px] text-[#475569] space-y-1">
                    <p className="leading-relaxed">
                      💡 <strong>Distribución Operativa Sugerida:</strong> Las horas de la plantilla no tienen que consumir el 100% de las horas vendidas. Puedes dejar horas disponibles para contingencias, solicitudes adicionales o riesgo operativo.
                    </p>
                    {soldHours > activeTemplateHours && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#f5f3ff] text-[#501f92] font-semibold text-[10px]">
                        <span>{activeTemplateHours} h asignadas a tareas</span>
                        <span>·</span>
                        <span className="font-bold text-[#16a34a]">{(soldHours - activeTemplateHours).toFixed(1)} h disponibles (reserva)</span>
                      </div>
                    )}
                  </div>

                  {includeTemplateTasks && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {currentTemplate.tasks.map((taskTpl, idx) => {
                        const isChecked = selectedTaskIndices.includes(idx);
                        return (
                          <label
                            key={idx}
                            onClick={(e) => {
                              e.preventDefault();
                              handleToggleTaskIndex(idx);
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
                  )}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              PASO 3 · COMERCIAL & HORAS (100% dinámico según tipo de proyecto)
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
                        Este proyecto no genera facturación comercial a ningún cliente externo. No se registran valores comerciales ni moneda. Orbit auditará el presupuesto interno de horas contra las horas ejecutadas.
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
                    <span className="text-[10px] text-[#64748b] mt-1 block">
                      Bolsa total de horas hombre estimadas para la iniciativa
                    </span>
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
                      💡 <strong>Ciclo mensual recurrente:</strong> La bolsa de {soldHours} horas cotizadas se renueva cada mes calendario para este cliente.
                    </span>
                    {includeTemplateTasks && selectedTemplateKey !== 'none' && activeTemplateHours > 0 && (
                      <span className="font-semibold text-[#501f92]">
                        {activeTemplateHours}h en tareas iniciales · {Math.max(0, soldHours - activeTemplateHours).toFixed(1)}h reserva disponible
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
                    {includeTemplateTasks && selectedTemplateKey !== 'none' && activeTemplateHours > 0 && (
                      <span className="font-semibold text-[#501f92]">
                        {activeTemplateHours}h en tareas iniciales · {Math.max(0, soldHours - activeTemplateHours).toFixed(1)}h reserva disponible
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              PASO 4 · EQUIPO & FECHAS (Cronograma, Lead claro, Equipo de trabajo y Brief)
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
                    {/* Selected members chips (sin duplicar al Lead) */}
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
