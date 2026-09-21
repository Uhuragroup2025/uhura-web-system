import React, { useState, useEffect } from 'react';
import {
  OrbitView,
  TaskItem,
  UserItem,
  TimeLog,
  ActiveTimerState,
  TaskDeliverable,
  TaskStatus,
  TaskPriority,
  ClientProfile,
  ProjectType,
  TaskRework,
  ProductBacklogTemplate,
  QuoteProposal,
  NewBusinessOpportunity
} from '../components/taskflow/types';
import { INITIAL_PRODUCT_BACKLOG_TEMPLATES } from '../components/taskflow/templates/templateData';
import { TemplateLibraryView } from '../components/taskflow/templates/TemplateLibraryView';
import {
  initialTasks,
  initialActivities,
  initialUsers,
  initialTimeLogs,
  orbitOperationalAlerts,
  orbitTopClients,
  orbitTrafficLightProjects,
  orbitTeamCapacity,
  clientProjectHierarchy,
  orbitClientsData
} from '../components/taskflow/mockData';
import { TaskflowSidebar } from '../components/taskflow/TaskflowSidebar';
import { TaskflowHeader } from '../components/taskflow/TaskflowHeader';
import { DashboardView } from '../components/taskflow/DashboardView';
import { MyTasksView } from '../components/taskflow/MyTasksView';
import { UsersView } from '../components/taskflow/UsersView';
import { BoardView } from '../components/taskflow/BoardView';
import { ClientsView } from '../components/taskflow/ClientsView';
import { ProjectsView, ProjectSummaryItem } from '../components/taskflow/ProjectsView';
import { NewProjectModal, NewProjectPayload } from '../components/taskflow/NewProjectModal';
import { InviteUserModal } from '../components/taskflow/InviteUserModal';
import { NewTaskModal } from '../components/taskflow/NewTaskModal';
import { ManualTimeLogModal } from '../components/taskflow/ManualTimeLogModal';
import { BandejaDelDiaWidget } from '../components/taskflow/BandejaDelDiaWidget';
import { TaskDetailModal } from '../components/taskflow/TaskDetailModal';
import { CapacityView } from '../components/taskflow/CapacityView';
import { MiDiaView } from '../components/taskflow/MiDiaView';
import { LaColoniaView } from '../components/taskflow/colonia/LaColoniaView';
import { FloatingBeaverWidget } from '../components/taskflow/FloatingBeaverWidget';
import { TimerSummaryModal, TimerSummaryData } from '../components/taskflow/TimerSummaryModal';
import { AssistedTimerRecoveryModal } from '../components/taskflow/time/AssistedTimerRecoveryModal';
import { ConflictTimerModal } from '../components/taskflow/time/ConflictTimerModal';
import {
  ABNORMAL_TIMER_THRESHOLD_SECONDS,
  createTimeTrackingEvent,
  isWeekendWorkDate
} from '../components/taskflow/time/timeTrackingEngine';
import { MobileBottomNav } from '../components/taskflow/MobileBottomNav';
import { MobileTimerMiniPlayer } from '../components/taskflow/MobileTimerMiniPlayer';
import { NewBusinessView } from '../components/taskflow/newbusiness/NewBusinessView';
import { INITIAL_NEW_BUSINESS_OPPORTUNITIES } from '../components/taskflow/newbusiness/mockOpportunities';
import { canAccessModule, viewToModule } from '../components/taskflow/auth/permissions';
import { AccessDeniedCard } from '../components/taskflow/auth/AccessDeniedCard';
import { DevQaRoleSimulator } from '../components/taskflow/auth/DevQaRoleSimulator';
import {
  Sparkles,
  Clock,
  ShieldCheck,
  Plus,
  Type,
  Building2,
  Briefcase,
  BrainCircuit,
  BookOpen,
  Layers,
  Copy,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';

const INITIAL_PROJECTS_LIST: ProjectSummaryItem[] = [
  {
    id: 'prj-yam-navidad',
    code: 'YAM-NAV-01',
    name: 'Campaña Navidad Yamaha',
    clientId: 'cli-yamaha',
    clientName: 'INCOLMOTOS YAMAHA S.A.',
    taxEntityId: null, // 100% opcional, sin asignar
    brand: 'Yamaha',
    leadName: 'Paola (Lead PM)',
    leadAvatarBg: 'bg-[#501f92]',
    leadRole: 'Lead Project Manager',
    projectType: 'fee_monthly',
    serviceBase: 'Fee Mensual · Campaña & Social',
    budgetedHours: 59,
    soldHours: 59,
    startDate: '2026-08-15',
    endDate: '2026-12-31',
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Consumo dentro de lo proyectado para el ciclo actual',
    rolloverPolicy: 'none',
    currentMonthCycle: '2026-09',
    monthlyCycles: [
      {
        monthKey: '2026-08',
        monthLabel: 'Agosto 2026',
        quotedHours: 59,
        executedHours: 54.5,
        status: 'closed',
        notes: 'Ciclo cerrado sin desvíos'
      },
      {
        monthKey: '2026-09',
        monthLabel: 'Septiembre 2026',
        quotedHours: 59,
        executedHours: 27.0,
        status: 'active',
        notes: 'Ciclo mensual en curso'
      },
      {
        monthKey: '2026-10',
        monthLabel: 'Octubre 2026',
        quotedHours: 59,
        executedHours: 0,
        status: 'upcoming'
      }
    ],
    deliverables: [
      {
        id: 'del-yam-rs',
        projectId: 'prj-yam-navidad',
        name: 'Redes Sociales',
        description: 'Parrilla mensual de contenidos, copies y carruseles',
        order: 1,
        status: 'in_progress',
        roleBudgets: [
          { id: 'rb-1', roleId: 'Diseñador Gráfico', roleName: 'Diseñador Gráfico', quotedHours: 24 },
          { id: 'rb-2', roleId: 'Community Manager', roleName: 'Community Manager', quotedHours: 4 },
          { id: 'rb-3', roleId: 'Content Strategist', roleName: 'Content Strategist', quotedHours: 4 }
        ],
        totalQuotedHours: 32,
        totalExecutedHours: 14.5,
        progressPercentage: 45
      },
      {
        id: 'del-yam-lp',
        projectId: 'prj-yam-navidad',
        name: 'Landing Page',
        description: 'Wireframes, diseño UI y maquetación web de temporada',
        order: 2,
        status: 'in_progress',
        roleBudgets: [
          { id: 'rb-4', roleId: 'Product Lead', roleName: 'Product Lead', quotedHours: 2 },
          { id: 'rb-5', roleId: 'Copywriter', roleName: 'Copywriter', quotedHours: 3 },
          { id: 'rb-6', roleId: 'Web Designer', roleName: 'Web Designer', quotedHours: 6 },
          { id: 'rb-7', roleId: 'Front End', roleName: 'Front End', quotedHours: 8 }
        ],
        totalQuotedHours: 19,
        totalExecutedHours: 8.5,
        progressPercentage: 44
      },
      {
        id: 'del-yam-pd',
        projectId: 'prj-yam-navidad',
        name: 'Pauta Digital & Ads',
        description: 'Estrategia de puja, audiencias y optimización de campañas',
        order: 3,
        status: 'in_progress',
        roleBudgets: [
          { id: 'rb-8', roleId: 'Trafficker', roleName: 'Trafficker', quotedHours: 8 }
        ],
        totalQuotedHours: 8,
        totalExecutedHours: 4.0,
        progressPercentage: 50
      }
    ],
    coreTeam: [
      { id: 'u-2', name: 'Paola Monsalve', role: 'Lead PM', avatarBg: 'bg-[#501f92]', initials: 'PM', isLead: true, weeklyAllocatedHours: 4 },
      { id: 'u-7', name: 'Diego Cadavid', role: 'Diseñador Gráfico', avatarBg: 'bg-[#dc2626]', initials: 'DC', weeklyAllocatedHours: 12 },
      { id: 'u-8', name: 'Sara Rivera', role: 'Community Manager', avatarBg: 'bg-[#ec4899]', initials: 'SR', weeklyAllocatedHours: 4 },
      { id: 'u-16', name: 'Sebastián Caicedo', role: 'Trafficker', avatarBg: 'bg-[#10b981]', initials: 'SC', weeklyAllocatedHours: 4 }
    ],
    // Asignaciones nativas con soporte multirol (Paola en Gobernanza + Ejecución Digital Designer)
    assignments: [
      {
        id: 'asg-yam-1',
        projectId: 'prj-yam-navidad',
        userId: 'u-2', // Paola Monsalve
        roleId: 'Lead Project Manager',
        nature: 'governance',
        deliverableId: null,
        allocations: [
          {
            id: 'alloc-yam-1-1',
            startDate: '2026-08-15',
            endDate: '2026-12-31',
            weeklyHours: 3,
            notes: 'Dirección de proyecto, control de alcance y gestión de riesgos'
          }
        ],
        isActive: true,
        notes: 'Líder operativa'
      },
      {
        id: 'asg-yam-2',
        projectId: 'prj-yam-navidad',
        userId: 'u-2', // Paola Monsalve en función operativa simultánea
        roleId: 'Product Lead',
        nature: 'core_execution',
        deliverableId: 'del-yam-lp',
        allocations: [
          {
            id: 'alloc-yam-2-1',
            startDate: '2026-08-15',
            endDate: '2026-10-15',
            weeklyHours: 2,
            notes: 'Conceptualización de wireframes y UX de la Landing Page'
          }
        ],
        isActive: true,
        notes: 'Ejecución UX'
      },
      {
        id: 'asg-yam-3',
        projectId: 'prj-yam-navidad',
        userId: 'u-7', // Diego Cadavid
        roleId: 'Diseñador Gráfico',
        nature: 'core_execution',
        deliverableId: 'del-yam-rs',
        allocations: [
          {
            id: 'alloc-yam-3-1',
            startDate: '2026-08-15',
            endDate: '2026-12-31',
            weeklyHours: 12,
            notes: 'Línea gráfica y producción de parrilla mensual'
          }
        ],
        isActive: true
      },
      {
        id: 'asg-yam-4',
        projectId: 'prj-yam-navidad',
        userId: 'u-8', // Sara Rivera
        roleId: 'Community Manager',
        nature: 'core_execution',
        deliverableId: 'del-yam-rs',
        allocations: [
          {
            id: 'alloc-yam-4-1',
            startDate: '2026-08-15',
            endDate: '2026-12-31',
            weeklyHours: 4,
            notes: 'Gestión y calendarización en Meta Business Suite'
          }
        ],
        isActive: true
      },
      {
        id: 'asg-yam-5',
        projectId: 'prj-yam-navidad',
        userId: 'u-16', // Sebastián Caicedo
        roleId: 'Trafficker',
        nature: 'core_execution',
        deliverableId: 'del-yam-pd',
        allocations: [
          {
            id: 'alloc-yam-5-1',
            startDate: '2026-09-01',
            endDate: '2026-12-31',
            weeklyHours: 4,
            notes: 'Optimización y pauta digital de temporada'
          }
        ],
        isActive: true
      },
      {
        id: 'asg-yam-6',
        projectId: 'prj-yam-navidad',
        userId: 'u-3', // Laura Gómez
        roleId: 'Front End',
        nature: 'temporary_support',
        deliverableId: 'del-yam-lp',
        allocations: [
          {
            id: 'alloc-yam-6-1',
            startDate: '2026-09-10',
            endDate: '2026-10-10',
            weeklyHours: 4,
            notes: 'Soporte puntual en integración del formulario de leads'
          }
        ],
        isActive: true,
        notes: 'Refuerzo de desarrollo'
      }
    ],
    // Stakeholders informados (sin rol cotizado ni cómputo de horas)
    stakeholders: [
      {
        id: 'stk-yam-1',
        projectId: 'prj-yam-navidad',
        userId: 'u-18', // Luisa Urazán
        titleOrDepartment: 'Client Relationship Strategist',
        notes: 'Seguimiento de relación con Incolmotos Yamaha'
      },
      {
        id: 'stk-yam-2',
        projectId: 'prj-yam-navidad',
        userId: 'u-1', // Ana María Giraldo
        titleOrDepartment: 'Dirección C-Level',
        notes: 'Supervisión de cuenta clave'
      }
    ],
    // Auditoría inmutable de cambios de equipo
    assignmentHistory: [
      {
        id: 'hist-yam-1',
        projectId: 'prj-yam-navidad',
        assignmentId: 'asg-yam-6',
        userId: 'u-3',
        roleId: 'Front End',
        action: 'created',
        previousWeeklyHours: null,
        newWeeklyHours: 4,
        reason: 'temporary_reinforcement',
        notes: 'Refuerzo temporal para acelerar entrega de maquetación Landing Page',
        affectedPeriod: '2026-W37',
        changedByUserId: 'u-2',
        changedByName: 'Paola Monsalve',
        changedAt: '2026-09-08T14:30:00Z'
      },
      {
        id: 'hist-yam-2',
        projectId: 'prj-yam-navidad',
        assignmentId: 'asg-yam-1',
        userId: 'u-2',
        roleId: 'Lead Project Manager',
        action: 'created',
        previousWeeklyHours: null,
        newWeeklyHours: 3,
        reason: 'project_kickoff',
        notes: 'Asignación inicial de liderazgo operativo y entrega',
        affectedPeriod: '2026-W33',
        changedByUserId: 'u-1',
        changedByName: 'Ana María Giraldo',
        changedAt: '2026-08-15T09:00:00Z'
      }
    ]
  },
  {
    id: 'prj-battsaver-1',
    code: 'BATT-SHO-01',
    name: 'Tienda Online BattSaver',
    clientId: 'cli-rockandride',
    clientName: 'Rock and Ride S.A.S.',
    taxEntityId: null,
    brand: 'BattSaver',
    leadName: 'Paola (Lead PM)',
    leadAvatarBg: 'bg-[#501f92]',
    leadRole: 'Lead Project Manager',
    projectType: 'fixed_project',
    serviceBase: 'Ecommerce / Shopify',
    budgetedHours: 110,
    soldHours: 110,
    startDate: '2026-08-15',
    endDate: '2026-11-15',
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Backlog habilitado: Discovery (14h), UX/UI (36h), Implementación (48h), QA (12h)',
    deliverables: [
      {
        id: 'del-batt-1',
        projectId: 'prj-battsaver-1',
        name: 'Discovery & Arquitectura',
        description: 'Flujos de compra y arquitectura de catálogo',
        order: 1,
        status: 'completed',
        roleBudgets: [{ id: 'rb-b1', roleId: 'Product Lead', roleName: 'Product Lead', quotedHours: 14 }],
        totalQuotedHours: 14,
        totalExecutedHours: 14,
        progressPercentage: 100
      },
      {
        id: 'del-batt-2',
        projectId: 'prj-battsaver-1',
        name: 'UI/UX & Prototipado',
        description: 'Diseño en Figma de vistas desktop y mobile',
        order: 2,
        status: 'in_progress',
        roleBudgets: [{ id: 'rb-b2', roleId: 'Web Designer', roleName: 'Web Designer', quotedHours: 36 }],
        totalQuotedHours: 36,
        totalExecutedHours: 22,
        progressPercentage: 60
      },
      {
        id: 'del-batt-3',
        projectId: 'prj-battsaver-1',
        name: 'Implementación Shopify Dev',
        description: 'Configuración de Liquid, checkout y pasarelas',
        order: 3,
        status: 'pending',
        roleBudgets: [{ id: 'rb-b3', roleId: 'Front End', roleName: 'Front End', quotedHours: 48 }],
        totalQuotedHours: 48,
        totalExecutedHours: 0,
        progressPercentage: 0
      },
      {
        id: 'del-batt-4',
        projectId: 'prj-battsaver-1',
        name: 'QA, Testing & Salida',
        description: 'Pruebas de pago, inventario y capacitación',
        order: 4,
        status: 'pending',
        roleBudgets: [{ id: 'rb-b4', roleId: 'Lead PM', roleName: 'Lead PM', quotedHours: 12 }],
        totalQuotedHours: 12,
        totalExecutedHours: 0,
        progressPercentage: 0
      }
    ],
    coreTeam: [
      { id: 'u-paola', name: 'Paola Monsalve', role: 'Product Lead', avatarBg: 'bg-[#501f92]', initials: 'PM', isLead: true, weeklyAllocatedHours: 4 },
      { id: 'u-oscar', name: 'Oscar Cerpa', role: 'Desarrollador Web Front-End', avatarBg: 'bg-[#f59e0b]', initials: 'OC', weeklyAllocatedHours: 8 },
      { id: 'u-catalina', name: 'Catalina Tejada', role: 'Directora Comercial', avatarBg: 'bg-[#7c3aed]', initials: 'CT', weeklyAllocatedHours: 15 },
      { id: 'u-laura', name: 'Laura Isabel Gómez', role: 'Digital Designer', avatarBg: 'bg-[#0284c7]', initials: 'LG', weeklyAllocatedHours: 18 }
    ]
  },
  {
    id: 'prj-uhura-orbit',
    code: 'UHU-ORB-03',
    name: 'Orbit 3.0 · Sistema Operativo Uhura',
    clientId: 'cli-uhura-internal',
    clientName: 'UHURA Group Internal',
    taxEntityId: null,
    brand: 'UHURA Group',
    leadName: 'Paola (Lead PM)',
    leadAvatarBg: 'bg-[#501f92]',
    leadRole: 'Lead Project Manager',
    projectType: 'internal_non_billable',
    serviceBase: 'Desarrollo de Producto Interno',
    budgetedHours: 0,
    soldHours: 0,
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Iniciativa interna estratégica sin techo comercial (0h cotizadas válido)',
    deliverables: [
      {
        id: 'del-orb-core',
        projectId: 'prj-uhura-orbit',
        name: 'Arquitectura & Módulos Core',
        description: 'Modelado de Cliente, Proyecto, Tareas y Capacidad',
        order: 1,
        status: 'in_progress',
        roleBudgets: [{ id: 'rb-oc1', roleId: 'Tech Lead', roleName: 'Tech Lead', quotedHours: 0 }],
        totalQuotedHours: 0,
        totalExecutedHours: 42,
        progressPercentage: 65
      },
      {
        id: 'del-orb-ux',
        projectId: 'prj-uhura-orbit',
        name: 'Diseño de Interfaz & Componentes UI',
        description: 'Design System de Orbit y ergonomía operativa',
        order: 2,
        status: 'in_progress',
        roleBudgets: [{ id: 'rb-oc2', roleId: 'Product Lead', roleName: 'Product Lead', quotedHours: 0 }],
        totalQuotedHours: 0,
        totalExecutedHours: 28,
        progressPercentage: 70
      }
    ],
    coreTeam: [
      { id: 'u-paola', name: 'Paola Monsalve', role: 'Product Lead', avatarBg: 'bg-[#501f92]', initials: 'PM', isLead: true, weeklyAllocatedHours: 5 },
      { id: 'u-oscar', name: 'Oscar Cerpa', role: 'Desarrollador Web Front-End', avatarBg: 'bg-[#f59e0b]', initials: 'OC', weeklyAllocatedHours: 10 }
    ]
  },
  {
    id: 'prj-1',
    name: 'Fee Mantenimiento Q3 · Tuya',
    clientId: 'cli-tuya',
    clientName: 'TUYA S.A.',
    brand: 'Tuya',
    leadName: 'Paola (Lead PM)',
    leadAvatarBg: 'bg-[#501f92]',
    projectType: 'fee_monthly',
    serviceBase: 'Mantenimiento Web',
    budgetedHours: 45,
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Horas y entregas en presupuesto',
    rolloverPolicy: 'none',
    deliverables: [
      {
        id: 'del-tuya-1',
        projectId: 'prj-1',
        name: 'Soporte Web & Ajustes',
        order: 1,
        status: 'in_progress',
        roleBudgets: [{ id: 'rb-t1', roleId: 'Front End', roleName: 'Front End', quotedHours: 45 }]
      }
    ]
  },
  {
    id: 'prj-2',
    name: 'Pauta & Growth Q3 · Flamingo',
    clientId: 'cli-flamingo',
    clientName: 'FLAMINGO S.A.S.',
    brand: 'Flamingo',
    leadName: 'Camilo Velez',
    leadAvatarBg: 'bg-[#059669]',
    projectType: 'fee_monthly',
    serviceBase: 'Paid Media & Ads Performance',
    budgetedHours: 60,
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Campaña activa con ROAS positivo',
    rolloverPolicy: 'none',
    deliverables: [
      {
        id: 'del-flam-1',
        projectId: 'prj-2',
        name: 'Gestión de Pauta & Ads',
        order: 1,
        status: 'in_progress',
        roleBudgets: [{ id: 'rb-fl1', roleId: 'Trafficker', roleName: 'Trafficker', quotedHours: 60 }]
      }
    ]
  },
  {
    id: 'prj-3',
    name: 'Mantenimiento Web E-commerce · Distrihogar',
    clientId: 'cli-distrihogar',
    clientName: 'DISTRIHOGAR S.A.S.',
    brand: 'Distrihogar',
    leadName: 'Catalina Tejada',
    leadAvatarBg: 'bg-[#7c3aed]',
    projectType: 'fee_monthly',
    serviceBase: 'Mantenimiento Web',
    budgetedHours: 35,
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Dentro del consumo acordado'
  },
  {
    id: 'prj-4',
    name: 'Parrilla Redes & Social · Tupperware',
    clientId: 'cli-dart',
    clientName: 'DART DE COLOMBIA S.A.S.',
    brand: 'Tupperware',
    leadName: 'Catalina Tejada',
    leadAvatarBg: 'bg-[#7c3aed]',
    projectType: 'fee_monthly',
    serviceBase: 'Parrilla de Contenidos & Social',
    budgetedHours: 30,
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Entregables aprobados'
  },
  {
    id: 'prj-5',
    name: 'Landing Page STEM · Parque Explora',
    clientId: 'cli-explora',
    clientName: 'CORPORACION PARQUE EXPLORA',
    brand: 'Parque Explora',
    leadName: 'Paola (Lead PM)',
    leadAvatarBg: 'bg-[#501f92]',
    projectType: 'fixed_project',
    serviceBase: 'Desarrollo Web & E-commerce',
    budgetedHours: 55,
    startDate: '2026-08-10',
    endDate: '2026-09-20',
    status: 'Activo',
    healthStatus: 'amarillo',
    healthNote: 'Alerta: esperando insumos de diseño'
  },
  {
    id: 'prj-6',
    name: 'Rediseño Portal B2B · Almacenes Éxito',
    clientId: 'cli-exito',
    clientName: 'ALMACENES EXITO S.A.',
    brand: 'Éxito',
    leadName: 'Paola (Lead PM)',
    leadAvatarBg: 'bg-[#501f92]',
    projectType: 'fixed_project',
    serviceBase: 'Desarrollo Web & E-commerce',
    budgetedHours: 80,
    startDate: '2026-06-01',
    endDate: '2026-08-15',
    status: 'Activo',
    healthStatus: 'rojo',
    healthNote: 'Desvío en horas y mora en pago'
  }
];

export const TaskFlowPrototype: React.FC = () => {
  const [currentView, setCurrentView] = useState<OrbitView>('mi-dia');
  const [saasFont, setSaasFont] = useState<'jakarta' | 'inter' | 'montserrat'>('jakarta');
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  // Default session user: Paola Monsalve (Product Lead / Leader)
  const [currentUser, setCurrentUser] = useState<UserItem>(
    () => initialUsers.find((u) => u.id === 'u-2') || initialUsers[0]
  );
  const [clients, setClients] = useState<ClientProfile[]>(orbitClientsData);
  const [projectsList, setProjectsList] = useState<ProjectSummaryItem[]>(INITIAL_PROJECTS_LIST);
  const [activities, setActivities] = useState(initialActivities);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(initialTimeLogs);
  const [productTemplates, setProductTemplates] = useState<ProductBacklogTemplate[]>(INITIAL_PRODUCT_BACKLOG_TEMPLATES);
  const [opportunities, setOpportunities] = useState<NewBusinessOpportunity[]>(INITIAL_NEW_BUSINESS_OPPORTUNITIES);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskPreselectedContext, setNewTaskPreselectedContext] = useState<{ projectName?: string; clientName?: string } | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectPreselectedClientId, setNewProjectPreselectedClientId] = useState<string | null>(null);
  const [selectedProjectIdForView, setSelectedProjectIdForView] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Time-Tracking Live State (Active timer starts at null by default)
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(null);

  const [isManualLogModalOpen, setIsManualLogModalOpen] = useState(false);
  const [manualLogDefaultTaskId, setManualLogDefaultTaskId] = useState<string | undefined>(undefined);

  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskItem | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Global view selection with automatic reset to section root
  const handleSelectView = (view: OrbitView) => {
    setCurrentView(view);
    // Reset specific sub-navigation states to return to the root screen of the chosen section
    if (view === 'proyectos') {
      setSelectedProjectIdForView(null);
    }
    if (view === 'clientes') {
      setSelectedClientId(null);
    }
  };

  // Timer Summary Modal State
  const [isTimerSummaryOpen, setIsTimerSummaryOpen] = useState(false);
  const [timerSummaryData, setTimerSummaryData] = useState<TimerSummaryData | null>(null);

  // Assisted Recovery Modal State (para timers anormalmente largos > 10h)
  const [isAssistedRecoveryOpen, setIsAssistedRecoveryOpen] = useState(false);

  // Conflict Timer Modal State (Solo un timer global; interacción explícita sin transferencias silenciosas)
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [pendingTaskForTimer, setPendingTaskForTimer] = useState<TaskItem | null>(null);

  // Live Timer Interval Effect (exact seconds, no rounding)
  useEffect(() => {
    if (!activeTimer || activeTimer.isPaused) return;

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev || prev.isPaused) return prev;
        return {
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isPaused, activeTimer?.taskId]);

  // Helper para inicializar un nuevo timer
  const startTimerForTask = (task: TaskItem) => {
    const nowIso = new Date().toISOString();
    const todayDateString = nowIso.split('T')[0];
    const isWeekend = isWeekendWorkDate(todayDateString);

    setActiveTimer({
      taskId: task.id,
      taskTitle: task.title,
      clientName: task.clientName || 'Cliente',
      projectName: task.projectName || task.board,
      categoryType: task.categoryType,
      startTime: Date.now(),
      startedAtISO: nowIso,
      elapsedSeconds: 0,
      isPaused: false,
      deliverableId: task.deliverableId,
      budgetedRoleId: task.budgetedRoleId || task.budgetedRole || 'Diseñador Gráfico',
      isOutsideRegularSchedule: isWeekend
    });
  };

  // Start / Switch Live Timer (Global: One active timer at a time)
  // Regla estricta: NO transferir silenciosamente. Si hay un timer activo en otra tarea,
  // solicitar interacción explícita para detener y registrar el actual antes de iniciar el nuevo.
  const handleStartTimer = (task: TaskItem) => {
    if (activeTimer && activeTimer.taskId !== task.id) {
      setPendingTaskForTimer(task);
      setIsConflictModalOpen(true);
      return;
    }

    startTimerForTask(task);
  };

  // Confirmación explícita para detener timer actual y arrancar en nueva tarea
  const handleConfirmSwitchTimer = () => {
    if (!pendingTaskForTimer) {
      setIsConflictModalOpen(false);
      return;
    }

    const nextTask = pendingTaskForTimer;
    setIsConflictModalOpen(false);
    setPendingTaskForTimer(null);

    // Detener y registrar timer actual si acumuló tiempo
    if (activeTimer) {
      if (activeTimer.elapsedSeconds >= 10) {
        commitTimerLog(activeTimer.elapsedSeconds, false);
      } else {
        setActiveTimer(null);
      }
    }

    // Iniciar timer en la nueva tarea
    startTimerForTask(nextTask);
  };

  const handleCancelSwitchTimer = () => {
    setIsConflictModalOpen(false);
    setPendingTaskForTimer(null);
  };

  // Pause / Resume (Mantenido para compatibilidad interna)
  const handlePauseResumeTimer = () => {
    setActiveTimer((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isPaused: !prev.isPaused
      };
    });
  };

  // Commit Time Log helper (usado tanto por parada normal como por recuperación asistida)
  const commitTimerLog = (sessionSeconds: number, isAdjusted: boolean = false, originalDuration?: number) => {
    if (!activeTimer) return;
    const targetTask = tasks.find((t) => t.id === activeTimer.taskId);
    if (!targetTask) {
      setActiveTimer(null);
      return;
    }

    const totalConsumedSeconds = (targetTask.consumedSeconds || 0) + sessionSeconds;
    const budgetedHours = targetTask.budgetedHours || 1;

    // 1. Actualizar consumo acumulado en tarea
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === activeTimer.taskId) {
          return {
            ...t,
            consumedSeconds: (t.consumedSeconds || 0) + sessionSeconds
          };
        }
        return t;
      })
    );

    // 2. Crear TimeLog con modelo canónico inmutable
    const stoppedAtIso = new Date().toISOString();
    const todayFormatted = 'Hoy, ' + new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    const todayIsoDate = stoppedAtIso.split('T')[0];
    const isWeekend = isWeekendWorkDate(todayIsoDate);

    // Identificar si es apoyo puntual (usuario que registra no estaba originalmente planificado en la tarea)
    const isAssignee = targetTask.assigneeAllocations?.some((a) => a.userId === targetTask.assignee?.id) ?? true;

    const newLog: TimeLog = {
      id: `log-${Date.now()}`,
      taskId: activeTimer.taskId,
      userId: targetTask.assignee?.id || 'u-pao',
      budgetedRoleId: activeTimer.budgetedRoleId || targetTask.budgetedRoleId || targetTask.budgetedRole || 'Diseñador Gráfico',
      durationSeconds: sessionSeconds,
      date: todayFormatted,
      source: 'timer',
      startedAt: activeTimer.startedAtISO || new Date(activeTimer.startTime).toISOString(),
      stoppedAt: stoppedAtIso,
      description: isAdjusted ? 'Tiempo ajustado tras recuperación asistida de timer prolongado.' : undefined,
      isLiveTimer: true,
      isOutsideRegularSchedule: isWeekend,
      isEdited: isAdjusted,
      originalDurationSeconds: originalDuration,
      isAdHocSupport: !isAssignee,
      createdAt: stoppedAtIso,
      taskTitle: activeTimer.taskTitle,
      clientName: activeTimer.clientName,
      projectName: activeTimer.projectName,
      userName: targetTask.assignee?.name || 'Paola Morales',
      userInitials: targetTask.assignee?.initials || 'PM',
      userAvatarBg: targetTask.assignee?.avatarBg || 'bg-[#501f92]',
      categoryType: activeTimer.categoryType
    };

    setTimeLogs((prev) => [newLog, ...prev]);

    // 3. Abrir resumen del tiempo registrado
    setTimerSummaryData({
      taskId: targetTask.id,
      taskTitle: targetTask.title,
      clientName: targetTask.clientName || 'Cliente',
      projectName: targetTask.projectName || targetTask.board,
      sessionSeconds,
      totalConsumedSeconds,
      budgetedHours
    });
    setIsTimerSummaryOpen(true);

    setActiveTimer(null);
  };

  // Stop Timer and Log (Verifica si amerita recuperación asistida > 10h)
  const handleStopTimer = () => {
    if (!activeTimer) return;

    // Regla de Timer Olvidado: Recuperación asistida si lleva más de 10 horas activo
    if (activeTimer.elapsedSeconds >= ABNORMAL_TIMER_THRESHOLD_SECONDS) {
      setIsAssistedRecoveryOpen(true);
      return;
    }

    commitTimerLog(activeTimer.elapsedSeconds);
  };

  // Manejo de la decisión de recuperación asistida
  const handleConfirmAssistedRecovery = (action: 'keep' | 'adjust' | 'discard', adjustedSeconds?: number) => {
    setIsAssistedRecoveryOpen(false);
    if (!activeTimer) return;

    if (action === 'discard') {
      setActiveTimer(null);
      return;
    }

    if (action === 'keep') {
      commitTimerLog(activeTimer.elapsedSeconds);
      return;
    }

    if (action === 'adjust') {
      const finalSeconds = adjustedSeconds || Math.min(activeTimer.elapsedSeconds, 3 * 3600);
      commitTimerLog(finalSeconds, true, activeTimer.elapsedSeconds);
    }
  };

  // Update Budget Hours for a task (by Lead/Director)
  const handleUpdateTaskBudgetHours = (taskId: string, newHours: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            budgetedHours: newHours
          };
        }
        return t;
      })
    );
  };

  // Add Deliverable directly to task
  const handleAddDeliverable = (
    taskId: string,
    del: Omit<TaskDeliverable, 'id' | 'taskId' | 'submittedAt'>
  ) => {
    const newDeliverable: TaskDeliverable = {
      ...del,
      id: `del-${Date.now()}`,
      taskId,
      submittedAt: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'Review',
            deliverables: [newDeliverable, ...(t.deliverables || [])]
          };
        }
        return t;
      })
    );
  };

  // Save Manual Log Fallback
  const handleSaveManualLog = (data: Omit<TimeLog, 'id'>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === data.taskId) {
          return {
            ...t,
            consumedSeconds: t.consumedSeconds + data.durationSeconds
          };
        }
        return t;
      })
    );

    const newLog: TimeLog = {
      ...data,
      id: `log-${Date.now()}`,
      date: data.date || 'Hoy, 22 Ago 2026'
    };

    setTimeLogs((prev) => [newLog, ...prev]);

    // If task detail modal is open for this task, synchronize its consumedSeconds in real time
    if (selectedTaskForDetail && selectedTaskForDetail.id === data.taskId) {
      setSelectedTaskForDetail((prev) =>
        prev ? { ...prev, consumedSeconds: prev.consumedSeconds + data.durationSeconds } : null
      );
    }
  };

  // Open Manual Time Log Modal with predefined task
  const handleOpenManualLogWithTask = (taskId?: string) => {
    setManualLogDefaultTaskId(taskId);
    setIsManualLogModalOpen(true);
  };

  // Update Task Status from Modal
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, completed: newStatus === 'Done' } : t))
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => prev ? { ...prev, status: newStatus, completed: newStatus === 'Done' } : null);
    }
  };

  // Update Task Priority from Modal
  const handleUpdateTaskPriority = (taskId: string, newPriority: TaskPriority) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t))
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => prev ? { ...prev, priority: newPriority } : null);
    }
  };

  // Add Comment to Task
  const handleAddComment = (taskId: string, commentText: string) => {
    const newComment = {
      id: `msg-${Date.now()}`,
      authorName: 'Paola (Lead PM)',
      authorInitials: 'PL',
      authorAvatarBg: 'bg-[#501f92]',
      timestamp: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs',
      content: commentText
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            messages: [...(t.messages || []), newComment]
          };
        }
        return t;
      })
    );

    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev ? { ...prev, messages: [...(prev.messages || []), newComment] } : null
      );
    }
  };

  // Update All Comments for a Task (for edits, deletions, reactions)
  const handleUpdateTaskComments = (taskId: string, comments: any[]) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            messages: comments
          };
        }
        return t;
      })
    );

    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev ? { ...prev, messages: comments } : null
      );
    }
  };

  // Update Task Dates (Inicio y Vencimiento)
  const handleUpdateTaskDates = (taskId: string, startDate: string, dueDate: string, dueText?: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              startDate,
              dueDate,
              dueText: dueText || t.dueText
            }
          : t
      )
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev
          ? {
              ...prev,
              startDate,
              dueDate,
              dueText: dueText || prev.dueText
            }
          : null
      );
    }
  };

  // Update Task Team (Project Lead, Assignee, Collaborators, Followers, BudgetedRole, etc.)
  const handleUpdateTaskTeam = (
    taskId: string,
    assignee: TaskItem['assignee'],
    collaborators: TaskItem['collaborators'],
    reviewer?: TaskItem['reviewer'],
    requestedBy?: string,
    budgetedRole?: string,
    requiresValidation?: boolean,
    projectLead?: TaskItem['projectLead'],
    followers?: TaskItem['followers']
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assignee,
              collaborators,
              reviewer,
              requestedBy: requestedBy || t.requestedBy,
              budgetedRole: budgetedRole !== undefined ? budgetedRole : t.budgetedRole,
              requiresValidation: requiresValidation !== undefined ? requiresValidation : t.requiresValidation,
              projectLead: projectLead !== undefined ? projectLead : t.projectLead,
              followers: followers !== undefined ? followers : t.followers
            }
          : t
      )
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev
          ? {
              ...prev,
              assignee,
              collaborators,
              reviewer,
              requestedBy: requestedBy || prev.requestedBy,
              budgetedRole: budgetedRole !== undefined ? budgetedRole : prev.budgetedRole,
              requiresValidation: requiresValidation !== undefined ? requiresValidation : prev.requiresValidation,
              projectLead: projectLead !== undefined ? projectLead : prev.projectLead,
              followers: followers !== undefined ? followers : prev.followers
            }
          : null
      );
    }
  };

  // Update Task Acceptance Criteria
  const handleUpdateTaskCriteria = (
    taskId: string,
    criteria: { id: string; text: string; completed: boolean }[]
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              acceptanceCriteria: criteria
            }
          : t
      )
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev
          ? {
              ...prev,
              acceptanceCriteria: criteria
            }
          : null
      );
    }
  };

  // Recalibrate Task Dates (Sincronización de cronograma sin penalizar al colaborador)
  const handleRecalibrateTaskDates = (
    taskId: string,
    daysToAdd: number,
    reason: string,
    responsibleParty: string
  ) => {
    const recalibrationAuditMessage = {
      id: `msg-${Date.now()}`,
      authorName: 'Paola (Lead PM)',
      authorInitials: 'PL',
      authorAvatarBg: 'bg-[#501f92]',
      timestamp: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs',
      content: `🗓️ Cronograma Recalibrado por Product Lead (+${daysToAdd} días). Causa: ${reason} (${responsibleParty}). La fecha límite se actualizó y este desfase NO penaliza el score ni la eficiencia del equipo.`
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const currentDue = t.dueText || t.dueDate || '24 ago. 2026, 18:00';
          const newDueDate = `28 ago. 2026, 18:00 (+${daysToAdd}d recalibrados)`;

          return {
            ...t,
            dueText: newDueDate,
            dueDate: newDueDate,
            isRecalibrated: true,
            recalibrationDays: daysToAdd,
            recalibrationReason: reason,
            blockerInfo: t.blockerInfo
              ? {
                  ...t.blockerInfo,
                  isBlocked: false,
                  resolvedAt: 'Hoy, 22 Ago 2026'
                }
              : undefined,
            messages: [...(t.messages || []), recalibrationAuditMessage]
          };
        }
        return t;
      })
    );

    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => {
        if (!prev) return null;
        const newDueDate = `28 ago. 2026, 18:00 (+${daysToAdd}d recalibrados)`;
        return {
          ...prev,
          dueText: newDueDate,
          dueDate: newDueDate,
          isRecalibrated: true,
          recalibrationDays: daysToAdd,
          recalibrationReason: reason,
          blockerInfo: prev.blockerInfo
            ? {
                ...prev.blockerInfo,
                isBlocked: false,
                resolvedAt: 'Hoy, 22 Ago 2026'
              }
            : undefined,
          messages: [...(prev.messages || []), recalibrationAuditMessage]
        };
      });
    }
  };

  // Update Blocker Info
  const handleUpdateBlockerInfo = (taskId: string, blockerInfo: TaskItem['blockerInfo']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, blockerInfo } : t))
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => (prev ? { ...prev, blockerInfo } : null));
    }
  };

  // Update Task Phase (Backlog Synchronization)
  const handleUpdateTaskPhase = (taskId: string, phase: any) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, phase } : t))
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => (prev ? { ...prev, phase } : null));
    }
  };

  // Update Task Title
  const handleUpdateTaskTitle = (taskId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, title: newTitle.trim() } : t))
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => (prev ? { ...prev, title: newTitle.trim() } : null));
    }
  };

  // Add Task Rework
  const handleAddRework = (
    taskId: string,
    reworkData: Omit<TaskRework, 'id' | 'taskId' | 'date'>
  ) => {
    const newRework: TaskRework = {
      ...reworkData,
      id: `rwk-${Date.now()}`,
      taskId,
      date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs'
    };

    const reworkAuditMessage = {
      id: `msg-${Date.now()}`,
      authorName: 'Paola (Lead PM)',
      authorInitials: 'PL',
      authorAvatarBg: 'bg-[#501f92]',
      timestamp: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs',
      content: `🔄 Retrabajo Registrado (${reworkData.origin === 'client' ? 'Cliente' : 'Interno'} - Ronda ${reworkData.roundNumber}): ${reworkData.reason} (Solicitado por: ${reworkData.requestedBy})`
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const currentReworks = t.reworks || [];
          return {
            ...t,
            reworks: [...currentReworks, newRework],
            messages: [...(t.messages || []), reworkAuditMessage]
          };
        }
        return t;
      })
    );

    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => {
        if (!prev) return null;
        const currentReworks = prev.reworks || [];
        return {
          ...prev,
          reworks: [...currentReworks, newRework],
          messages: [...(prev.messages || []), reworkAuditMessage]
        };
      });
    }
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskForDetail?.id === taskId) {
      setIsTaskDetailModalOpen(false);
      setSelectedTaskForDetail(null);
    }
  };

  // Archive / Unarchive Task
  const handleArchiveTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isArchived: !t.isArchived } : t))
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev ? { ...prev, isArchived: !prev.isArchived } : null
      );
    }
  };

  // Move Task to another Project / Board / Client
  const handleMoveTask = (
    taskId: string,
    targetProject: string,
    targetClient?: string,
    targetStatus?: TaskStatus
  ) => {
    const auditComment = {
      id: `msg-${Date.now()}`,
      authorName: 'Paola (Lead PM)',
      authorInitials: 'PL',
      authorAvatarBg: 'bg-[#501f92]',
      timestamp: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs',
      content: `📦 Tarea movida a: ${targetProject}${targetClient ? ` (${targetClient})` : ''}.`
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            projectName: targetProject,
            board: targetProject,
            clientName: targetClient || t.clientName,
            status: targetStatus || t.status,
            messages: [...(t.messages || []), auditComment]
          };
        }
        return t;
      })
    );

    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev
          ? {
              ...prev,
              projectName: targetProject,
              board: targetProject,
              clientName: targetClient || prev.clientName,
              status: targetStatus || prev.status,
              messages: [...(prev.messages || []), auditComment]
            }
          : null
      );
    }
  };

  // Delete Log
  const handleDeleteTimeLog = (id: string) => {
    const targetLog = timeLogs.find((l) => l.id === id);
    if (!targetLog) return;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === targetLog.taskId) {
          return {
            ...t,
            consumedSeconds: Math.max(0, t.consumedSeconds - targetLog.durationSeconds)
          };
        }
        return t;
      })
    );

    setTimeLogs((prev) => prev.filter((l) => l.id !== id));
  };

  // Open Task Detail
  const handleOpenTaskDetail = (taskOrId: TaskItem | string) => {
    const target = typeof taskOrId === 'string' ? tasks.find((t) => t.id === taskOrId) : taskOrId;
    if (target) {
      setSelectedTaskForDetail(target);
      setIsTaskDetailModalOpen(true);
    }
  };

  // Toggle task completed state
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? 'Done' : 'In Progress',
          };
        }
        return t;
      })
    );
  };

  // Add project handler
  const handleAddProject = (projectData: NewProjectPayload) => {
    const newProjectId = `prj-${Date.now()}`;
    const codePrefix = projectData.name.slice(0, 3).toUpperCase();
    const newPrj: ProjectSummaryItem = {
      id: newProjectId,
      code: `${codePrefix}-${Math.floor(10 + Math.random() * 90)}`,
      name: projectData.name,
      clientId: projectData.clientId,
      clientName: projectData.clientName,
      taxEntityId: projectData.taxEntityId || null,
      brand: projectData.brand,
      leadName: projectData.leadName,
      leadAvatarBg: projectData.leadAvatarBg,
      leadRole: projectData.leadRole,
      projectType: projectData.projectType,
      serviceBase: projectData.serviceBase,
      budgetedHours: projectData.budgetedHours,
      soldHours: projectData.soldHours,
      soldValueCOP: projectData.soldValueCOP,
      soldCurrency: projectData.soldCurrency,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      brief: projectData.brief,
      deliverables: (projectData.deliverables || []).map((d) => ({
        ...d,
        projectId: newProjectId
      })),
      coreTeam: projectData.coreTeam || [],
      rolloverPolicy: projectData.rolloverPolicy,
      currentMonthCycle: projectData.projectType === 'fee_monthly' ? new Date().toISOString().slice(0, 7) : undefined,
      monthlyCycles: projectData.projectType === 'fee_monthly'
        ? [
            {
              monthKey: new Date().toISOString().slice(0, 7),
              monthLabel: new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date()),
              quotedHours: projectData.budgetedHours,
              executedHours: 0,
              status: 'active'
            }
          ]
        : undefined,
      teamMembers: projectData.teamMembers,
      status: projectData.status || 'Activo',
      healthStatus: 'verde',
      healthNote: 'Recién creado · En planificación y arranque'
    };

    setProjectsList((prev) => [newPrj, ...prev]);

    // If template tasks were included, add them to global tasks list
    if (projectData.tasksToCreate && projectData.tasksToCreate.length > 0) {
      const generatedTasks: TaskItem[] = projectData.tasksToCreate.map((t, idx) => ({
        ...t,
        id: `task-${Date.now()}-${idx}`,
        projectId: newProjectId
      } as TaskItem));
      setTasks((prev) => [...generatedTasks, ...prev]);
    }

    // Update client projects history & count
    setClients((prev) =>
      prev.map((cli) => {
        if (cli.id === projectData.clientId || cli.name.toLowerCase() === projectData.clientName.toLowerCase()) {
          const formattedValue = projectData.soldValueCOP && projectData.soldValueCOP > 0
            ? `$${(projectData.soldValueCOP / 1000000).toFixed(1)}M`
            : `$${((projectData.budgetedHours * 120000) / 1000000).toFixed(1)}M`;

          const newHistoryItem = {
            id: newProjectId,
            name: projectData.name,
            brand: projectData.brand,
            status: 'Activo' as const,
            quotedValueCOP: formattedValue,
            realMarginPercent: 42.0,
            trafficLight: 'verde' as const,
            tag: projectData.projectType === 'fee_monthly' ? 'Fee mensual' : projectData.projectType === 'fixed_project' ? 'Proyecto único' : 'Interno'
          };
          return {
            ...cli,
            projectsCount: (cli.projectsCount || 0) + 1,
            activeProjectsCount: (cli.activeProjectsCount || 0) + 1,
            projectsHistory: [newHistoryItem, ...(cli.projectsHistory || [])]
          };
        }
        return cli;
      })
    );
  };

  // Update project handler
  const handleUpdateProject = (updatedProject: ProjectSummaryItem) => {
    setProjectsList((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
  };

  // Archive / Unarchive project
  const handleArchiveProject = (projectId: string) => {
    setProjectsList((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, status: p.status === 'Archivado' ? 'Activo' : 'Archivado' }
          : p
      )
    );
  };

  // Delete project
  const handleDeleteProject = (projectId: string) => {
    setProjectsList((prev) => prev.filter((p) => p.id !== projectId));
    if (selectedProjectIdForView === projectId) {
      setSelectedProjectIdForView(null);
    }
  };

  // Update client handler
  const handleUpdateClient = (updatedClient: ClientProfile) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
  };

  // Create client handler
  const handleCreateClient = (newClient: ClientProfile) => {
    setClients((prev) => [newClient, ...prev]);
  };

  // Convert New Business Opportunity to Client & Active Project
  const handleConvertOpportunityToProject = (payload: {
    opportunity: NewBusinessOpportunity;
    selectedQuote: QuoteProposal;
    projectName: string;
    projectType: ProjectType;
    leadName: string;
    startDate: string;
    endDate?: string;
  }) => {
    const opp = payload.opportunity;
    const quote = payload.selectedQuote;

    // 1. Resolver o registrar el Cliente en Orbit
    let resolvedClientId = opp.clientId;
    let resolvedClientName = opp.prospectAccountName || 'Cliente';

    if (!resolvedClientId) {
      resolvedClientId = `cli-${Date.now()}`;
      const newClient: ClientProfile = {
        id: resolvedClientId,
        name: resolvedClientName,
        status: 'active',
        type: payload.projectType === 'fee_monthly' ? 'Fee mensual' : 'Proyecto único',
        taxEntities: [],
        contacts: opp.contactName
          ? [
              {
                id: `con-${Date.now()}`,
                name: opp.contactName,
                email: opp.contactEmail || '',
                phone: opp.contactPhone,
                contactType: 'comercial',
                isPrimary: true
              }
            ]
          : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setClients((prev) => [newClient, ...prev]);
    } else {
      const existing = clients.find((c) => c.id === resolvedClientId);
      if (existing) {
        resolvedClientName = existing.name;
        setClients((prev) =>
          prev.map((c) =>
            c.id === resolvedClientId
              ? {
                  ...c,
                  projectsCount: (c.projectsCount || 0) + 1,
                  activeProjectsCount: (c.activeProjectsCount || 0) + 1
                }
              : c
          )
        );
      }
    }

    // 2. Crear Proyecto en projectsList con sus entregables
    const newProjectId = `prj-${Date.now()}`;
    const codePrefix = payload.projectName.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRJ') || 'PRJ';
    const soldCOP = quote.financialSummary?.finalPriceWithTaxCOP || quote.totalQuotedValueCOP || 0;

    const newProjectDeliverables = quote.deliverables.map((qd, idx) => ({
      id: `del-${newProjectId}-${idx + 1}`,
      projectId: newProjectId,
      name: qd.name,
      description: qd.description,
      order: qd.order || idx + 1,
      status: 'pending' as const,
      roleBudgets: qd.roleBudgets.map((rb) => ({
        id: `rb-${newProjectId}-${rb.id}`,
        roleId: rb.roleId,
        roleName: rb.roleName,
        quotedHours: rb.quotedHours
      })),
      totalQuotedHours: qd.totalHoursRollup || 0,
      totalExecutedHours: 0,
      progressPercentage: 0
    }));

    const newPrj: ProjectSummaryItem = {
      id: newProjectId,
      code: `${codePrefix}-${Math.floor(10 + Math.random() * 90)}`,
      name: payload.projectName,
      clientId: resolvedClientId,
      clientName: resolvedClientName,
      taxEntityId: null,
      brand: resolvedClientName,
      leadName: payload.leadName || opp.leadUserName || 'Product Lead',
      leadAvatarBg: 'bg-[#501f92]',
      leadRole: payload.leadName || opp.leadUserName || 'Product Lead',
      projectType: payload.projectType,
      serviceBase: 'Desarrollo & Estrategia',
      budgetedHours: quote.totalHoursRollup || 0,
      soldHours: quote.totalHoursRollup || 0,
      soldValueCOP: soldCOP,
      soldCurrency: quote.currency || 'COP',
      startDate: payload.startDate,
      endDate: payload.endDate,
      brief: opp.briefSummary || opp.discoveryNotes,
      deliverables: newProjectDeliverables,
      coreTeam: [
        {
          id: 'u-lead',
          name: payload.leadName || opp.leadUserName || 'Product Lead',
          role: payload.leadName || opp.leadUserName || 'Product Lead',
          avatarBg: 'bg-[#501f92]',
          initials: (payload.leadName || 'PL').slice(0, 2).toUpperCase(),
          isLead: true,
          weeklyAllocatedHours: 4
        }
      ],
      status: 'Activo',
      healthStatus: 'verde',
      healthNote: 'Proyecto recién ganado y aprobado en New Business'
    };

    setProjectsList((prev) => [newPrj, ...prev]);

    // 3. Crear tareas operativas en `tasks` a partir de las actividades del backlog
    const newTasksToCreate: TaskItem[] = [];
    quote.deliverables.forEach((qd, dIdx) => {
      const parentDelId = `del-${newProjectId}-${dIdx + 1}`;
      qd.backlogItems.forEach((bItem, bIdx) => {
        newTasksToCreate.push({
          id: `task-${newProjectId}-${dIdx + 1}-${bIdx + 1}`,
          title: bItem.title,
          status: 'todo',
          priority: 'Medium',
          projectId: newProjectId,
          projectName: payload.projectName,
          clientName: resolvedClientName,
          deliverableId: parentDelId,
          frente: qd.name,
          board: payload.projectName,
          department: 'Operaciones',
          date: new Date().toISOString().slice(0, 10),
          dueDate: payload.endDate || new Date().toISOString().slice(0, 10),
          dueStatus: 'normal',
          dueText: 'Planificado en Scoping',
          budgetedHours: bItem.estimatedHours || 0,
          consumedSeconds: 0,
          completed: false,
          budgetedRole: bItem.roleName,
          assignee: {
            id: 'unassigned',
            name: `Pendiente (${bItem.roleName})`,
            role: bItem.roleName,
            avatarBg: 'bg-[#94a3b8]',
            initials: bItem.roleName.slice(0, 2).toUpperCase()
          }
        });
      });
    });

    if (newTasksToCreate.length > 0) {
      setTasks((prev) => [...newTasksToCreate, ...prev]);
    }

    // 4. Actualizar estado de la oportunidad a ganada y vinculada al nuevo proyecto
    const updatedOpp: NewBusinessOpportunity = {
      ...opp,
      status: 'won',
      convertedProjectId: newProjectId,
      convertedAt: new Date().toISOString(),
      clientId: resolvedClientId,
      quotes: opp.quotes.map((q) =>
        q.id === quote.id
          ? { ...q, status: 'approved', convertedToProjectId: newProjectId }
          : q
      )
    };

    setOpportunities((prev) =>
      prev.map((o) => (o.id === opp.id ? updatedOpp : o))
    );
  };

  // Guardar cotización en oportunidad existente de New Business
  const handleSaveQuoteToOpportunity = (opportunityId: string, quote: QuoteProposal) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === opportunityId) {
          const existingQuotes = opp.quotes || [];
          const quoteExists = existingQuotes.some((q) => q.id === quote.id);
          const updatedQuotes = quoteExists
            ? existingQuotes.map((q) => (q.id === quote.id ? quote : q))
            : [quote, ...existingQuotes];
          return {
            ...opp,
            quotes: updatedQuotes,
            updatedAt: new Date().toISOString()
          };
        }
        return opp;
      })
    );
  };

  // Crear nueva oportunidad a partir de Brief/Prospecto y adjuntar la cotización inmediatamente
  const handleCreateOpportunityWithQuote = (
    opportunityData: {
      title: string;
      prospectAccountName?: string;
      leadUserName?: string;
    },
    quote: QuoteProposal
  ) => {
    const newOpportunityId = quote.opportunityId || `opp-${Date.now()}`;
    const finalizedQuote: QuoteProposal = {
      ...quote,
      opportunityId: newOpportunityId
    };

    const newOpp: NewBusinessOpportunity = {
      id: newOpportunityId,
      title: opportunityData.title,
      type: 'new_client',
      prospectAccountName: opportunityData.prospectAccountName || 'Prospecto New Business',
      leadUserId: 'usr-paola',
      leadUserName: opportunityData.leadUserName || 'Product Lead',
      status: 'quoting',
      quotes: [finalizedQuote],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      briefSummary: `Oportunidad generada desde plantilla ${quote.versionLabel || ''}.`
    };

    setOpportunities((prev) => [newOpp, ...prev]);
  };

  // Add task
  const handleAddTask = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  // Add user
  const handleAddUser = (newUser: UserItem) => {
    setUsers((prev) => [...prev, newUser]);
  };

  // Delete user
  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Calculate live logged hours today from timesheets
  const loggedHoursToday = timeLogs.reduce((acc, log) => acc + (log.durationSeconds || 0) / 3600, 0);

  // Quick Log Hours for Beaver Feeding & Uhura Bags
  const handleQuickLogHours = (
    hours: number,
    label: string,
    category: 'client' | 'internal' = 'internal',
    projectName: string = 'Uhura Group'
  ) => {
    const durationSeconds = Math.round(hours * 3600);
    const newLog: TimeLog = {
      id: `log-${Date.now()}`,
      taskId: 'quick-log',
      taskTitle: label,
      clientName: 'UHURA GROUP',
      projectName: projectName,
      categoryType: category,
      userId: 'u-pao',
      budgetedRoleId: 'Diseñador Gráfico',
      source: 'manual',
      createdAt: new Date().toISOString(),
      userName: 'Paola Monsalve',
      userInitials: 'PM',
      userAvatarBg: '#501f92',
      isLiveTimer: false,
      date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs',
      durationSeconds: durationSeconds
    };
    setTimeLogs((prev) => [newLog, ...prev]);
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'mi-dia':
        return 'Mi Día · Bucky el Castor de Orbit 🦫';
      case 'la-colonia':
        return 'La Colonia · El Hábitat de Bucky 🦫🪵';
      case 'dashboard':
        return 'Dashboard';
      case 'proyectos':
        return 'Proyectos';
      case 'tareas':
        return 'Mis Tareas';
      case 'timesheets':
        return 'Registro de Tiempos';
      case 'capacidad':
        return 'Capacidad del Equipo';
      case 'clientes':
        return 'Clientes';
      case 'plantillas-producto':
        return 'Biblioteca de Plantillas Maestras · Producto';
      case 'new-business':
        return 'New Business · Scoping & Oportunidades';
      case 'finanzas':
        return 'Finanzas';
      case 'el-muro':
        return 'El Muro';
      case 'reportes':
        return 'Reportes';
      case 'nova-ia':
        return 'Nova IA';
      case 'usuarios':
        return 'Usuarios';
      case 'config-roles':
        return 'Roles';
      case 'config-permisos':
        return 'Permisos';
      case 'portal-cliente':
        return 'Portal de Clientes';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="orbit-saas-root min-h-screen bg-[#0d0718] text-white selection:bg-[#ddd6fe] selection:text-[#0f172a]">
      {/* SaaS Live Demo Utility Bar (Compact single header) */}
      <section className="bg-gradient-to-r from-[#1b0d33] to-[#0d0718] py-2.5 px-4 sm:px-6 lg:px-8 border-b border-[#261845]/60">
        <div className="max-w-[1880px] w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f2ecfb] text-[#501f92] text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-[#501f92]" />
              <span>ORBIT</span>
            </span>
            <span className="text-xs text-[#c9b7ff] font-medium hidden sm:inline">
              Sistema Operativo Uhura Group
            </span>
          </div>

          {/* Typography Switcher Bar */}
          <div className="flex items-center gap-2 bg-[#140b24] px-2 py-1 rounded-xl border border-[#261845]">
            <span className="text-[10px] font-bold text-[#c9b7ff] px-1 flex items-center gap-1">
              <Type className="w-3 h-3 text-[#8a4dff]" />
              <span>Fuente:</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSaasFont('jakarta')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  saasFont === 'jakarta'
                    ? 'bg-[#501f92] text-white shadow-xs'
                    : 'text-[#c9b7ff]/70 hover:text-white hover:bg-[#261845]'
                }`}
              >
                Plus Jakarta Sans
              </button>
              <button
                onClick={() => setSaasFont('inter')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  saasFont === 'inter'
                    ? 'bg-[#501f92] text-white shadow-xs'
                    : 'text-[#c9b7ff]/70 hover:text-white hover:bg-[#261845]'
                }`}
              >
                Inter
              </button>
              <button
                onClick={() => setSaasFont('montserrat')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  saasFont === 'montserrat'
                    ? 'bg-[#501f92] text-white shadow-xs'
                    : 'text-[#c9b7ff]/70 hover:text-white hover:bg-[#261845]'
                }`}
              >
                Montserrat
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main SaaS Canvas Box */}
      <main className="max-w-[1880px] w-full mx-auto px-2 sm:px-4 lg:px-6 mt-3 pb-8">
        <div className={`bg-[#f9fafb] rounded-3xl border border-[#261845] shadow-2xl overflow-hidden flex flex-col min-h-[840px] ${
          saasFont === 'jakarta' ? 'font-saas' : saasFont === 'inter' ? 'font-inter' : 'font-montserrat'
        }`}>
          {/* Top Prototype Navigation Chrome */}
          <div className="bg-[#140b24] px-5 py-2.5 border-b border-[#261845] flex items-center justify-between text-xs text-[#c9b7ff]/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block" />
              <span className="ml-3 font-mono font-bold text-white text-[11px]">
                orbit.uhuragroup.com / {currentView}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-[#d4ff4a] font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#d4ff4a]" />
                <span>Timer en Vivo: <strong>{activeTimer ? 'Activo (Sin redondeo)' : 'En espera'}</strong></span>
              </span>
              <span className="text-[#8a4dff]/40">|</span>
              <span className="flex items-center gap-1 text-white font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8a4dff]" />
                Uhura Operating System 2.0
              </span>
            </div>
          </div>

          {/* Prototype App Body */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Sidebar Desktop */}
            <div className="hidden md:block shrink-0 h-full">
              <TaskflowSidebar
                currentView={currentView}
                onSelectView={handleSelectView}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                currentUser={currentUser}
              />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
              <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex">
                <div className="w-64 bg-[#0d0718] h-full shadow-2xl relative z-50">
                  <TaskflowSidebar
                    currentView={currentView}
                    onSelectView={(v) => {
                      handleSelectView(v);
                      setMobileMenuOpen(false);
                    }}
                    currentUser={currentUser}
                  />
                </div>
                <div
                  className="flex-1 h-full"
                  onClick={() => setMobileMenuOpen(false)}
                />
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-[#f8fafc] min-w-0 overflow-y-auto">
              {/* Header with live timer capsule & global task search */}
              <TaskflowHeader
                currentViewTitle={getHeaderTitle()}
                onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebarCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                onSelectAlert={() => handleSelectView('dashboard')}
                onNavigateToDashboard={() => handleSelectView('dashboard')}
                activeTimer={activeTimer}
                onPauseResumeTimer={handlePauseResumeTimer}
                onStopTimer={handleStopTimer}
                onOpenTaskDetail={handleOpenTaskDetail}
                tasks={tasks}
                loggedHoursToday={loggedHoursToday}
                targetDayHours={8.0}
                currentUser={currentUser}
                onSelectTask={(task) => {
                  setSelectedTaskForDetail(task);
                  setIsTaskDetailModalOpen(true);
                }}
              />

              {/* View Content with RBAC Protection */}
              <div className="p-4 sm:p-7 pb-28 md:pb-7 flex-1">
                {!canAccessModule(currentUser, currentView) ? (
                  <AccessDeniedCard
                    currentUser={currentUser}
                    targetModule={viewToModule(currentView)}
                    onReturnHome={() => handleSelectView('mi-dia')}
                  />
                ) : (
                  <>
                {/* 0. MI DÍA & BUCKY EL CASTOR */}
                {currentView === 'mi-dia' && (
                  <MiDiaView
                    tasks={tasks}
                    activeTimer={activeTimer}
                    onStartTimer={handleStartTimer}
                    onPauseResumeTimer={handlePauseResumeTimer}
                    onStopTimer={handleStopTimer}
                    onOpenTaskDetail={handleOpenTaskDetail}
                    onOpenManualLog={handleOpenManualLogWithTask}
                    onToggleTask={handleToggleTask}
                    onQuickLogHours={handleQuickLogHours}
                    loggedHoursToday={loggedHoursToday}
                    targetDayHours={8.0}
                    onNavigateToView={handleSelectView}
                  />
                )}

                {/* 0.1 LA COLONIA · HÁBITAT EXPERIENCIAL DE BUCKY */}
                {currentView === 'la-colonia' && (
                  <LaColoniaView
                    tasks={tasks}
                    loggedHoursToday={loggedHoursToday}
                    targetDayHours={8.0}
                    plannedHoursToday={4.0}
                    onNavigateToView={handleSelectView}
                  />
                )}

                {/* 1. DASHBOARD EJECUTIVO */}
                {currentView === 'dashboard' && (
                  <DashboardView
                    tasks={tasks}
                    activeTimer={activeTimer}
                    onStartTimer={handleStartTimer}
                    onPauseResumeTimer={handlePauseResumeTimer}
                    onStopTimer={handleStopTimer}
                    onOpenTaskDetail={handleOpenTaskDetail}
                    onOpenManualLog={handleOpenManualLogWithTask}
                    onNavigateToTasks={() => handleSelectView('tareas')}
                    onNavigateToProjects={() => handleSelectView('proyectos')}
                    onNavigateToClients={() => handleSelectView('clientes')}
                    onNavigateToCapacity={() => handleSelectView('capacidad')}
                    onNavigateToFinance={() => handleSelectView('finanzas')}
                    onNavigateToColonia={() => handleSelectView('la-colonia')}
                    onSelectClientDetail={(clientName) => {
                      const match = orbitClientsData.find(
                        (c) =>
                          c.name.toLowerCase().includes(clientName.toLowerCase()) ||
                          clientName.toLowerCase().includes(c.name.toLowerCase())
                      );
                      if (match) {
                        setSelectedClientId(match.id);
                      }
                      setCurrentView('clientes');
                    }}
                  />
                )}

                {/* 2. PROYECTOS & JERARQUÍA */}
                {currentView === 'proyectos' && (
                  <ProjectsView
                    tasks={tasks}
                    clients={clients}
                    projectsList={projectsList}
                    selectedProjectId={selectedProjectIdForView}
                    onSelectProject={(id) => setSelectedProjectIdForView(id)}
                    onOpenNewProjectModal={() => {
                      setNewProjectPreselectedClientId(null);
                      setIsNewProjectModalOpen(true);
                    }}
                    onOpenNewTaskModalWithProject={(projectName, clientName) => {
                      setNewTaskPreselectedContext({ projectName, clientName });
                      setIsNewTaskModalOpen(true);
                    }}
                    activeTimer={activeTimer}
                    onStartTimer={handleStartTimer}
                    onPauseResumeTimer={handlePauseResumeTimer}
                    onStopTimer={handleStopTimer}
                    onOpenTaskDetail={handleOpenTaskDetail}
                    onToggleTask={handleToggleTask}
                    onNavigateToClient={(clientName) => {
                      const match = clients.find(
                        (c) =>
                          c.name.toLowerCase().includes(clientName.toLowerCase()) ||
                          clientName.toLowerCase().includes(c.name.toLowerCase())
                      );
                      if (match) {
                        setSelectedClientId(match.id);
                      }
                      setCurrentView('clientes');
                    }}
                    onUpdateProject={handleUpdateProject}
                    onArchiveProject={handleArchiveProject}
                    onDeleteProject={handleDeleteProject}
                  />
                )}

                {/* 3. TAREAS */}
                {currentView === 'tareas' && (
                  <MyTasksView
                    tasks={tasks}
                    onToggleTask={handleToggleTask}
                    onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
                    activeTimer={activeTimer}
                    onStartTimer={handleStartTimer}
                    onPauseResumeTimer={handlePauseResumeTimer}
                    onStopTimer={handleStopTimer}
                    onOpenTaskDetail={handleOpenTaskDetail}
                    onOpenManualLogModal={(id) => {
                      setManualLogDefaultTaskId(id);
                      setIsManualLogModalOpen(true);
                    }}
                    onUpdateTaskBudgetHours={handleUpdateTaskBudgetHours}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                  />
                )}

                {/* 4. TIMESHEETS / TIME-TRACKING */}
                {currentView === 'timesheets' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <BandejaDelDiaWidget
                      timeLogs={timeLogs}
                      onOpenManualModal={() => {
                        setManualLogDefaultTaskId(undefined);
                        setIsManualLogModalOpen(true);
                      }}
                      onDeleteLog={handleDeleteTimeLog}
                      onOpenTaskDetail={handleOpenTaskDetail}
                    />
                  </div>
                )}

                {/* 5. CAPACIDAD DE EQUIPO & PERSONAL */}
                {currentView === 'capacidad' && (
                  <CapacityView
                    tasks={tasks}
                    timeLogs={timeLogs}
                    activeTimer={activeTimer}
                    onStartTimer={handleStartTimer}
                    onPauseResumeTimer={handlePauseResumeTimer}
                    onStopTimer={handleStopTimer}
                    onOpenTaskDetail={handleOpenTaskDetail}
                    onOpenManualLog={handleOpenManualLogWithTask}
                    onNavigateToTasks={() => handleSelectView('tareas')}
                    onNavigateToProjects={() => handleSelectView('proyectos')}
                  />
                )}

                {/* 6. CLIENTES & CARTERA */}
                {currentView === 'clientes' && (
                  <ClientsView
                    clients={clients}
                    selectedClientId={selectedClientId}
                    onSelectClient={(id) => setSelectedClientId(id)}
                    onNavigateToDashboard={() => {
                      setSelectedClientId(null);
                      setCurrentView('dashboard');
                    }}
                    onNavigateToProject={(projectName) => {
                      const match = projectsList.find((p) => p.name === projectName);
                      if (match) {
                        setSelectedProjectIdForView(match.id);
                      }
                      setCurrentView('proyectos');
                    }}
                    onOpenNewProjectForClient={(clientId) => {
                      setNewProjectPreselectedClientId(clientId);
                      setIsNewProjectModalOpen(true);
                    }}
                    onUpdateClient={handleUpdateClient}
                    onCreateClient={handleCreateClient}
                  />
                )}

                {/* 6.5. BIBLIOTECA DE PLANTILLAS MAESTRAS DE PRODUCTO */}
                {currentView === 'plantillas-producto' && (
                  <TemplateLibraryView
                    templates={productTemplates}
                    onUpdateTemplates={setProductTemplates}
                    opportunities={opportunities}
                    currentUser={currentUser}
                    onSaveToOpportunity={(oppId, quote) => {
                      handleSaveQuoteToOpportunity(oppId, quote);
                      setCurrentView('new-business');
                    }}
                    onCreateOpportunityWithQuote={(oppData, quote) => {
                      handleCreateOpportunityWithQuote(oppData, quote);
                      setCurrentView('new-business');
                    }}
                    onQuoteCreated={(newQuote) => {
                      if (newQuote.opportunityId) {
                        handleSaveQuoteToOpportunity(newQuote.opportunityId, newQuote);
                      }
                      setCurrentView('new-business');
                    }}
                  />
                )}

                {/* 6.7. NEW BUSINESS & SCOPING OPERATIVO (FASE 1) */}
                {currentView === 'new-business' && (
                  <NewBusinessView
                    opportunities={opportunities}
                    clients={clients}
                    templates={productTemplates}
                    currentUser={currentUser}
                    onUpdateOpportunity={(updatedOpp) => {
                      setOpportunities((prev) =>
                        prev.map((o) => (o.id === updatedOpp.id ? updatedOpp : o))
                      );
                    }}
                    onCreateOpportunity={(newOpp) => {
                      setOpportunities((prev) => [newOpp, ...prev]);
                    }}
                    onNavigateToView={handleSelectView}
                    onConvertOpportunityToProject={handleConvertOpportunityToProject}
                  />
                )}

                {/* 7.5. FINANZAS */}
                {currentView === 'finanzas' && (
                  <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                      <div className="text-xs text-[#64748b]">
                        <span>Presupuestación de proyectos por horas hombre y control de cartera</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#f8fafc] text-xs text-[#334155] border border-[#e2e8f0]">
                      <p className="font-bold text-[#0f172a]">Valores en firme de la operación:</p>
                      <p className="text-[11px] mt-1 text-[#64748b]">
                        Cartera por cobrar: <strong className="text-[#0f172a]">$577.7M COP</strong> · Cartera vencida: <strong className="text-[#dc2626]">$501.9M COP</strong> (86.8% en mora).
                      </p>
                    </div>
                  </div>
                )}

                {/* 8. USUARIOS & PERMISOS */}
                {(currentView === 'usuarios' || currentView === 'config-roles' || currentView === 'config-permisos') && (
                  <UsersView
                    users={users}
                    onInviteUser={() => setIsInviteModalOpen(true)}
                    onDeleteUser={handleDeleteUser}
                  />
                )}

                {/* 9. INTELIGENCIA & OTROS */}
                {(currentView === 'el-muro' || currentView === 'reportes' || currentView === 'nova-ia' || currentView === 'portal-cliente') && (
                  <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-[#8a4dff]" />
                      <span className="text-sm font-bold text-[#0f172a]">{getHeaderTitle()}</span>
                    </div>
                    <p className="text-xs text-[#64748b] leading-relaxed">
                      Módulo integrado en Orbit para análisis predictivo de desvíos en entregas y rentabilidad.
                    </p>
                  </div>
                )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Timer Mini-Player (Floating above Bottom Navigation) */}
        <MobileTimerMiniPlayer
          activeTimer={activeTimer}
          onPauseResumeTimer={handlePauseResumeTimer}
          onStopTimer={handleStopTimer}
          onOpenTaskDetail={handleOpenTaskDetail}
        />

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav
          currentView={currentView}
          onSelectView={handleSelectView}
          onOpenManualLogModal={() => {
            setManualLogDefaultTaskId(undefined);
            setIsManualLogModalOpen(true);
          }}
          onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
          hasActiveTimer={Boolean(activeTimer)}
        />
      </main>

      {/* Task Detail & Deliverables Modal (COR Visual Split View) */}
      <TaskDetailModal
        isOpen={isTaskDetailModalOpen}
        onClose={() => setIsTaskDetailModalOpen(false)}
        task={selectedTaskForDetail}
        tasksList={tasks}
        onSelectTask={(t) => setSelectedTaskForDetail(t)}
        activeTimer={activeTimer}
        onStartTimer={handleStartTimer}
        onPauseResumeTimer={handlePauseResumeTimer}
        onStopTimer={handleStopTimer}
        onUpdateTitle={handleUpdateTaskTitle}
        onAddRework={handleAddRework}
        onUpdateBudgetHours={handleUpdateTaskBudgetHours}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        onUpdateTaskPriority={handleUpdateTaskPriority}
        onUpdateDates={handleUpdateTaskDates}
        onUpdateTeam={handleUpdateTaskTeam}
        onUpdateCriteria={handleUpdateTaskCriteria}
        onAddDeliverable={handleAddDeliverable}
        onAddComment={handleAddComment}
        onUpdateComments={handleUpdateTaskComments}
        onRecalibrateDates={handleRecalibrateTaskDates}
        onUpdateBlockerInfo={handleUpdateBlockerInfo}
        onUpdatePhase={handleUpdateTaskPhase}
        onDeleteTask={handleDeleteTask}
        onArchiveTask={handleArchiveTask}
        onNavigateToClient={(clientName) => {
          setIsTaskDetailModalOpen(false);
          const match = orbitClientsData.find(
            (c) =>
              c.name.toLowerCase().includes(clientName.toLowerCase()) ||
              clientName.toLowerCase().includes(c.name.toLowerCase())
          );
          if (match) {
            setSelectedClientId(match.id);
          }
          setCurrentView('clientes');
        }}
        onNavigateToProject={(projectName) => {
          setIsTaskDetailModalOpen(false);
          const match = projectsList.find(
            (p) =>
              p.name.toLowerCase().includes(projectName.toLowerCase()) ||
              projectName.toLowerCase().includes(p.name.toLowerCase())
          );
          if (match) {
            setSelectedProjectIdForView(match.id);
          } else {
            setSelectedProjectIdForView(null);
          }
          setCurrentView('proyectos');
        }}
        onOpenManualLog={handleOpenManualLogWithTask}
        onMoveTask={handleMoveTask}
      />

      {/* Manual Time Log Modal (Rendered with z-60 above TaskDetailModal) */}
      <ManualTimeLogModal
        isOpen={isManualLogModalOpen}
        onClose={() => setIsManualLogModalOpen(false)}
        tasks={tasks}
        defaultTaskId={manualLogDefaultTaskId}
        onSaveManualLog={handleSaveManualLog}
      />

      {/* Modals */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onAddUser={handleAddUser}
      />

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => {
          setIsNewTaskModalOpen(false);
          setNewTaskPreselectedContext(null);
        }}
        onAddTask={handleAddTask}
        existingTasks={tasks}
        preselectedProjectName={newTaskPreselectedContext?.projectName}
        preselectedClientName={newTaskPreselectedContext?.clientName}
        projectsList={projectsList}
        clientsList={clients}
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => {
          setIsNewProjectModalOpen(false);
          setNewProjectPreselectedClientId(null);
        }}
        onAddProject={handleAddProject}
        clients={clients}
        preselectedClientId={newProjectPreselectedClientId || undefined}
      />

      {/* Assisted Timer Recovery Modal for Prolonged Timers (> 10h) */}
      <AssistedTimerRecoveryModal
        isOpen={isAssistedRecoveryOpen}
        onClose={() => setIsAssistedRecoveryOpen(false)}
        activeTimer={activeTimer}
        onConfirmDecision={handleConfirmAssistedRecovery}
      />

      {/* Conflict Timer Modal (No transferencias silenciosas; confirmación explícita) */}
      <ConflictTimerModal
        isOpen={isConflictModalOpen}
        activeTimer={activeTimer}
        pendingTask={pendingTaskForTimer}
        onConfirmSwitch={handleConfirmSwitchTimer}
        onCancel={handleCancelSwitchTimer}
      />

      {/* Timer Summary Modal on Stop */}
      <TimerSummaryModal
        isOpen={isTimerSummaryOpen}
        onClose={() => setIsTimerSummaryOpen(false)}
        data={timerSummaryData}
        onOpenTaskDetail={(taskId) => {
          const found = tasks.find((t) => t.id === taskId);
          if (found) {
            setSelectedTaskForDetail(found);
            setIsTaskDetailModalOpen(true);
          }
        }}
      />

      {/* Floating Beaver Mascot Companion (Codex-Style Interactive Character with Vida Propia) */}
      <FloatingBeaverWidget
        loggedHoursToday={loggedHoursToday}
        targetDayHours={8.0}
        onQuickLogHours={handleQuickLogHours}
        onNavigateToView={handleSelectView}
        streakDays={6}
        tasks={tasks}
        activeTimer={activeTimer}
      />

      {/* Herramienta de QA / Simulación de Roles & Permisos (RBAC Bloque 3) */}
      <DevQaRoleSimulator
        currentUser={currentUser}
        availableUsers={users}
        onSelectUser={setCurrentUser}
      />
    </div>
  );
};
