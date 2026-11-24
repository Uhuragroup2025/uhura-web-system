import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ClientProjectHistoryItem,
  ProjectType,
  TaskRework,
  ProjectReworkRound,
  ProductBacklogTemplate,
  QuoteProposal,
  TaskActivityLogEntry,
  NewBusinessOpportunity,
  TeamAbsenceEvent
} from '../components/taskflow/types';
import { serviceDraftFromTemplate, type ScopeServiceDraft } from '../components/taskflow/newbusiness/BacklogScoper';
import { SOWModal } from '../components/taskflow/newbusiness/SOWModal';
import { isEligibleScopingLeader, suggestActivityOwners } from '../components/taskflow/newbusiness/teamCandidates';
import { withUpcomingUtilization } from '../components/taskflow/schedule/teamLoadAdvisor';
import { getOperationalQuote, withOperationalQuote } from '../components/taskflow/newbusiness/quoteRules';
import { INITIAL_PRODUCT_BACKLOG_TEMPLATES } from '../components/taskflow/templates/templateData';
import { TemplateLibraryView } from '../components/taskflow/templates/TemplateLibraryView';
import {
  initialTasks,
  initialActivities,
  initialUsers,
  initialTimeLogs,
  initialAbsenceEvents,
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
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { CapacityView } from '../components/taskflow/CapacityView';
import { MiDiaView } from '../components/taskflow/MiDiaView';
import { DECISIONS_EVENT, loadDecisions, seedDecisionsIfEmpty } from '../components/taskflow/decisions/decisionStore';
import { taskEarnings, syncTaskLedger, loadRewards, saveRewards } from '../components/taskflow/colonia/plaza/plazaRewards';
import { creditUser } from '../components/taskflow/colonia/plaza/contributionsStore';
import { LaColoniaView } from '../components/taskflow/colonia/LaColoniaView';
import { TeamHumanProfileModal } from '../components/taskflow/copilot/TeamHumanProfileModal';
import { FloatingBeaverWidget } from '../components/taskflow/FloatingBeaverWidget';
import { DayCloseModal } from '../components/taskflow/time/DayCloseModal';
import { hoursByDay, computeStreak, isDayClosed, markDayClosed, isOwnLog, logIsoDate, toIsoLocal, DAY_CLOSED_EVENT, streakLabel } from '../components/taskflow/time/dayStreak';
import { makePersonMatcher, isTaskOwner, isScheduledForDay } from '../components/taskflow/auth/taskVisibility';
import { TimerSummaryModal, TimerSummaryData } from '../components/taskflow/TimerSummaryModal';
import { StopTimerRegisterModal } from '../components/taskflow/time/StopTimerRegisterModal';
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
import { DireccionFinanzasView } from '../components/taskflow/DireccionFinanzasView';
import { INITIAL_NEW_BUSINESS_OPPORTUNITIES } from '../components/taskflow/newbusiness/mockOpportunities';
import { canAccessModule, viewToModule, can } from '../components/taskflow/auth/permissions';
import { HardwareView } from '../components/taskflow/assets/HardwareView';
import { LicensesView } from '../components/taskflow/assets/LicensesView';
import type { HardwareAsset, SoftwareLicense } from '../components/taskflow/types';
import { AccessDeniedCard } from '../components/taskflow/auth/AccessDeniedCard';
import { DevQaRoleSimulator } from '../components/taskflow/auth/DevQaRoleSimulator';
import { PhaseOverflowModal } from '../components/taskflow/projects/PhaseOverflowModal';
import { normalizeProjectType } from '../components/taskflow/types';
import { detectPhaseOverflow, notBeforeFromDependencies, planTasksFromPhases, type PhaseOverflow } from '../components/taskflow/schedule/clientTimeline';
import { buildExistingLoad, DEFAULT_DAILY_CAPACITY } from '../components/taskflow/schedule/scheduleEngine';
import { isEcoAppMode } from '../pwa/appMode';
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

// Datos de prueba limpios (19 Nov 2026): un proyecto único en curso y un fee mensual que vence el
// 30 Nov (para ejercitar la renovación y el arranque de diciembre). Tareas en mockData.initialTasks.
const INITIAL_PROJECTS_LIST: ProjectSummaryItem[] = [
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
    commercialOwnerName: 'Luisa Fernanda Urazán',
    clientApproverName: 'Andrés Mejía',
    clientApproverBackupName: 'Valentina Ríos',
    projectType: 'fixed_project',
    serviceBase: 'Ecommerce / Shopify',
    budgetedHours: 100,
    soldHours: 100,
    isKickedOff: true,
    startDate: '2026-11-03',
    endDate: '2026-12-18',
    baselineStartDate: '2026-11-03',
    baselineEndDate: '2026-12-18',
    forecastEndDate: '2026-12-18',
    scheduleConfig: {
      clientKickoffWaitDays: 3,
      includedReworkRounds: 1,
      reworkRoundDays: 5
    },
    // Presentaciones al cliente (cronograma acordado en el kickoff): checkpoint de wireframes,
    // aprobación del prototipo y de la tienda en staging. Entrega final: 18 Dic.
    phaseSteps: [
      { id: 'del-batt-1', name: 'Discovery & Arquitectura', productionDays: 4, qaDays: 0, rounds: [] },
      { id: 'del-batt-2', name: 'UI/UX & Prototipado', productionDays: 4, qaDays: 0, rounds: [
        { label: 'Wireframes', kind: 'checkpoint', reviewDays: 1, adjustDays: 0, workDays: 0, qaDays: 0 },
        { label: 'Prototipo', kind: 'approval', reviewDays: 3, adjustDays: 2, workDays: 5, qaDays: 1 }
      ] },
      { id: 'del-batt-3', name: 'Implementación Shopify', productionDays: 6, qaDays: 1, rounds: [
        { label: 'Tienda en staging', kind: 'approval', reviewDays: 2, adjustDays: 1, workDays: 0, qaDays: 0 }
      ] },
      { id: 'del-batt-4', name: 'QA & Salida', productionDays: 2, qaDays: 0, rounds: [] }
    ],
    dependencies: [
      {
        id: 'dep-batt-1',
        projectId: 'prj-battsaver-1',
        deliverableId: 'del-batt-2',
        title: 'Manual de marca y fotos de producto',
        type: 'client_input',
        ownerType: 'client',
        followUpOwnerUserId: 'u-3',
        followUpOwnerName: 'Luisa Fernanda Urazán',
        requestedAt: '2026-11-03',
        expectedDate: '2026-11-06',
        completedAt: '2026-11-05',
        receivedAt: '2026-11-05',
        status: 'received',
        blocking: true
      },
      {
        id: 'dep-batt-2',
        projectId: 'prj-battsaver-1',
        deliverableId: 'del-batt-3',
        title: 'Credenciales de Shopify y Wompi',
        type: 'access',
        ownerType: 'client',
        followUpOwnerUserId: 'u-3',
        followUpOwnerName: 'Luisa Fernanda Urazán',
        requestedAt: '2026-11-03',
        expectedDate: '2026-11-27',
        status: 'pending',
        blocking: true
      }
    ],
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Discovery cerrado; diseño en curso',
    deliverables: [
      {
        id: 'del-batt-1',
        projectId: 'prj-battsaver-1',
        name: 'Discovery & Arquitectura',
        description: 'Kickoff, flujos de compra y arquitectura del catálogo',
        order: 1,
        status: 'completed',
        startDate: '2026-11-03',
        dueDate: '2026-11-06',
        roleBudgets: [
          { id: 'rb-b1a', roleId: 'Client Relationship Strategist', roleName: 'Client Relationship Strategist', quotedHours: 2 },
          { id: 'rb-b1b', roleId: 'Product Lead', roleName: 'Product Lead', quotedHours: 8 }
        ],
        totalQuotedHours: 10,
        progressPercentage: 100
      },
      {
        id: 'del-batt-2',
        projectId: 'prj-battsaver-1',
        name: 'UI/UX & Prototipado',
        description: 'Wireframes, UI kit, piezas gráficas y prototipo navegable',
        order: 2,
        status: 'in_progress',
        startDate: '2026-11-09',
        dueDate: '2026-12-01',
        roleBudgets: [
          { id: 'rb-b2a', roleId: 'Digital Designer', roleName: 'Digital Designer', quotedHours: 34 },
          { id: 'rb-b2b', roleId: 'Creative Designer', roleName: 'Creative Designer', quotedHours: 10 }
        ],
        totalQuotedHours: 44,
        progressPercentage: 45
      },
      {
        id: 'del-batt-3',
        projectId: 'prj-battsaver-1',
        name: 'Implementación Shopify',
        description: 'Tema, checkout, pasarela de pagos y carga del catálogo',
        order: 3,
        status: 'pending',
        startDate: '2026-12-02',
        dueDate: '2026-12-16',
        roleBudgets: [
          { id: 'rb-b3a', roleId: 'Front-End Dev', roleName: 'Front-End Dev', quotedHours: 28 },
          { id: 'rb-b3b', roleId: 'Digital Content Specialist', roleName: 'Digital Content Specialist', quotedHours: 8 }
        ],
        totalQuotedHours: 36,
        progressPercentage: 0
      },
      {
        id: 'del-batt-4',
        projectId: 'prj-battsaver-1',
        name: 'QA & Salida',
        description: 'QA de compra, salida a producción y capacitación',
        order: 4,
        status: 'pending',
        startDate: '2026-12-17',
        dueDate: '2026-12-18',
        roleBudgets: [{ id: 'rb-b4', roleId: 'Product Lead', roleName: 'Product Lead', quotedHours: 10 }],
        totalQuotedHours: 10,
        progressPercentage: 0
      }
    ]
  },
  {
    id: 'prj-yam-fee',
    code: 'YAM-FEE-01',
    name: 'Fee mensual Contenido y Social · Yamaha',
    clientId: 'cli-yamaha',
    clientName: 'INCOLMOTOS YAMAHA S.A.',
    taxEntityId: null,
    brand: 'Yamaha',
    leadName: 'Paola (Lead PM)',
    leadAvatarBg: 'bg-[#501f92]',
    leadRole: 'Lead Project Manager',
    commercialOwnerName: 'Catalina Tejada',
    clientApproverName: 'Mauricio Saldarriaga',
    clientApproverBackupName: 'Paula Restrepo',
    projectType: 'fee_monthly',
    serviceBase: 'Fee Mensual · Contenido & Social',
    budgetedHours: 42,
    soldHours: 42,
    isKickedOff: true,
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    // Contrato de 3 meses (sep–nov 2026) que vence el 30 Nov: aviso de renovación y, al renovar, diciembre
    contractMonths: 3,
    contractStartDate: '2026-09-01',
    contractEndDate: '2026-11-30',
    rolloverPolicy: 'carry_over',
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Noviembre en curso; el contrato vence el 30 Nov',
    deliverables: [],
    monthlyCycles: [
      { monthKey: '2026-09', monthLabel: 'Septiembre 2026', quotedHours: 42, executedHours: 40.5, status: 'closed', tasksGenerated: true },
      { monthKey: '2026-10', monthLabel: 'Octubre 2026', quotedHours: 42, executedHours: 43.5, status: 'closed', tasksGenerated: true },
      { monthKey: '2026-11', monthLabel: 'Noviembre 2026', quotedHours: 42, executedHours: 14.5, status: 'active', tasksGenerated: true }
    ]
  }
];

// ── Persistencia del prototipo: cambios del flujo de las tareas ──────────
const TASK_PATCH_KEY = 'eco_task_patches_v1';
const TASK_PATCH_FIELDS = ['status', 'completed', 'completedAt', 'deliverables', 'approvedBy', 'approvedAt', 'reviewers', 'reviewersManual', 'requiresReview', 'priority', 'isBlocked', 'blockedReason', 'blockedAt', 'blockerInfo', 'messages', 'acceptanceCriteria'] as const;
const pickPatch = (t: TaskItem) => Object.fromEntries(TASK_PATCH_FIELDS.map((f) => [f, (t as unknown as Record<string, unknown>)[f]]));
function applyTaskPatches(seed: TaskItem[]): TaskItem[] {
  try {
    const raw = localStorage.getItem(TASK_PATCH_KEY);
    if (!raw) return seed;
    const patches = JSON.parse(raw) as Record<string, Partial<TaskItem>>;
    return seed.map((t) => (patches[t.id] ? { ...t, ...patches[t.id] } : t));
  } catch {
    return seed;
  }
}
function saveTaskPatches(seed: TaskItem[], tasks: TaskItem[]) {
  try {
    const seedById = new Map(seed.map((t) => [t.id, JSON.stringify(pickPatch(t))]));
    const out: Record<string, unknown> = {};
    tasks.forEach((t) => {
      const cur = JSON.stringify(pickPatch(t));
      if (seedById.has(t.id) && seedById.get(t.id) !== cur) out[t.id] = pickPatch(t);
    });
    localStorage.setItem(TASK_PATCH_KEY, JSON.stringify(out));
  } catch { /* solo prototipo */ }
}

export const TaskFlowPrototype: React.FC = () => {
  const [ecoAppMode] = useState(isEcoAppMode);
  const [currentView, setCurrentView] = useState<OrbitView>('mi-dia');
  const [saasFont, setSaasFont] = useState<'jakarta' | 'inter' | 'montserrat'>('jakarta');
  // Solo del prototipo: lo que cambia del flujo de cada tarea (estado, entregas, revisores…) se guarda
  // en el navegador para que sobreviva a una recarga, igual que ECOINS y decisiones. En producción manda el backend.
  const [tasks, setTasks] = useState<TaskItem[]>(() => applyTaskPatches(initialTasks));
  useEffect(() => { saveTaskPatches(initialTasks, tasks); }, [tasks]);
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  // ECOINS al momento (§32.4): cuando una tarea se aprueba o se reabre, el libro de quien la hizo se
  // actualiza enseguida, aunque nadie esté en La Plaza. En producción lo hace el servicio de eventos.
  useEffect(() => {
    let changed = false;
    users.forEach((u) => {
      const { owned } = taskEarnings(u, tasks, users);
      if (!owned.length) return;
      const before = loadRewards(u.id);
      const after = syncTaskLedger(before, owned);
      if (after !== before) { saveRewards(u.id, after); changed = true; }
    });
    if (changed) { try { window.dispatchEvent(new CustomEvent('eco:rewards-changed')); } catch { /* */ } }
  }, [tasks, users]);
  // Default session user: Paola Monsalve (Product Lead / Leader)
  const [currentUser, setCurrentUser] = useState<UserItem>(
    () => initialUsers.find((u) => u.id === 'u-2') || initialUsers[0]
  );
  const [clients, setClients] = useState<ClientProfile[]>(orbitClientsData);
  const [projectsList, setProjectsList] = useState<ProjectSummaryItem[]>(INITIAL_PROJECTS_LIST);
  // Tareas nacidas de New Business o de los ciclos del fee: toman el líder del proyecto como «Project Lead»
  // (y por tanto quien revisa por defecto, §32.7.1). QA 22 Nov 2026: llegaban sin líder y el modal inventaba uno.
  useEffect(() => {
    const byKey = new Map<string, ProjectSummaryItem>();
    projectsList.forEach((p) => { byKey.set(p.id, p); byKey.set(p.name, p); });
    if (!tasks.some((t) => !t.projectLead && (byKey.get(t.projectId || '') || byKey.get(t.projectName || ''))?.leadName)) return;
    setTasks((prev) => prev.map((t) => {
      if (t.projectLead) return t;
      const p = byKey.get(t.projectId || '') || byKey.get(t.projectName || '');
      if (!p?.leadName) return t;
      const initials = p.leadName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
      return { ...t, projectLead: { name: p.leadName, initials, avatarBg: p.leadAvatarBg?.startsWith('bg-') ? p.leadAvatarBg : 'bg-[#501f92]', role: p.leadRole }, reviewers: t.reviewers && t.reviewers.length ? t.reviewers : p.defaultReviewer ? [p.defaultReviewer] : t.reviewers };
    }));
  }, [tasks, projectsList]);
  const [activities, setActivities] = useState(initialActivities);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(initialTimeLogs);
  const [productTemplates, setProductTemplates] = useState<ProductBacklogTemplate[]>(INITIAL_PRODUCT_BACKLOG_TEMPLATES);
  // Costos de operación (datos de ejemplo; en producción vienen del backend)
  const [hardwareAssets, setHardwareAssets] = useState<HardwareAsset[]>([
    { id: 'hw-1', name: 'MacBook Pro diseño 01', type: 'Laptop', brand: 'Apple', model: 'MacBook Pro 14" M3', serialNumber: 'C02-UH-001', assignedUserId: 'u-7', location: 'Oficina Medellín', purchaseValue: 9800000, purchaseDate: '2025-02-10', usefulLifeMonths: 36, warrantyEndDate: '2026-02-10', isDirectCost: true, serviceTemplateIds: [], projectIds: [], status: 'active' },
    { id: 'hw-2', name: 'Cámara de producción', type: 'Cámara', brand: 'Sony', model: 'A7 IV', assignedUserId: null, location: 'Estudio', purchaseValue: 11500000, purchaseDate: '2025-06-01', usefulLifeMonths: 48, warrantyEndDate: '2027-06-01', isDirectCost: true, serviceTemplateIds: [], projectIds: [], status: 'active' }
  ]);
  const [softwareLicenses, setSoftwareLicenses] = useState<SoftwareLicense[]>([
    { id: 'lic-1', application: 'ADOBE', plan: 'Creative Cloud All Apps', quantity: 5, frequency: 'monthly', currency: 'COP', unitValue: 359000, area: 'Operativos', assignedUserIds: [], nextRenewalDate: '2026-11-15', projectIds: [], pendingVerification: false, status: 'active' },
    { id: 'lic-2', application: 'FIGMA', plan: 'Premium', quantity: 1, frequency: 'monthly', currency: 'USD', unitValue: 20, area: 'Operativos', assignedUserIds: [], projectIds: [], pendingVerification: false, status: 'active' },
    { id: 'lic-3', application: 'GOOGLE', plan: 'Workspace Business Standard', quantity: 23, frequency: 'monthly', currency: 'USD', unitValue: 16.8, area: 'Varios', assignedUserIds: [], projectIds: [], pendingVerification: false, status: 'active' },
    { id: 'lic-4', application: 'HUBSPOT', quantity: 5, frequency: 'quarterly', currency: 'USD', unitValue: 0.01, area: 'Comercial', assignedUserIds: [], projectIds: [], pendingVerification: true, verificationNote: 'Confirmar valor y plan vigente', status: 'active' },
    { id: 'lic-5', application: 'FREEPIK', plan: 'Freepik Premium Yearly', quantity: 1, frequency: 'annual', currency: 'COP', unitValue: 460000, area: 'Operativos', assignedUserIds: [], projectIds: [], pendingVerification: false, status: 'active' }
  ]);
  const [opportunities, setOpportunities] = useState<NewBusinessOpportunity[]>(INITIAL_NEW_BUSINESS_OPPORTUNITIES);
  // Estado de demostración del frontend; no agrega campos al contrato de datos.
  const [scopeUi, setScopeUi] = useState<Record<string, { saved: boolean; services: ScopeServiceDraft[] }>>({});
  const [savedQuotes, setSavedQuotes] = useState<Record<string, string>>({});
  const [sowOpportunityId, setSowOpportunityId] = useState<string | null>(null);
  const [sowVersions, setSowVersions] = useState<Record<string, string>>({});
  const [absenceEvents, setAbsenceEvents] = useState<TeamAbsenceEvent[]>(initialAbsenceEvents);
  // New Business: ocupación real próxima (4 semanas) para sugerir al colaborador del rol con más espacio
  const usersWithLoad = useMemo(() => withUpcomingUtilization(users, tasks, absenceEvents), [users, tasks, absenceEvents]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskPreselectedContext, setNewTaskPreselectedContext] = useState<{ projectName?: string; clientName?: string } | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectPreselectedClientId, setNewProjectPreselectedClientId] = useState<string | null>(null);
  const [selectedProjectIdForView, setSelectedProjectIdForView] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState(orbitOperationalAlerts);

  // Time-Tracking Live State (Persisted in localStorage across view reloads)
  const ACTIVE_TIMER_STORAGE_KEY = 'orbit_active_timer_v1';
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(() => {
    try {
      const raw = localStorage.getItem(ACTIVE_TIMER_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ActiveTimerState & { savedAt?: number };
      if (!parsed || !parsed.taskId) return null;
      const extraSeconds =
        !parsed.isPaused && parsed.savedAt
          ? Math.max(0, Math.floor((Date.now() - parsed.savedAt) / 1000))
          : 0;
      const { savedAt: _savedAt, ...timerState } = parsed;
      return {
        ...timerState,
        elapsedSeconds: (timerState.elapsedSeconds || 0) + extraSeconds
      };
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (activeTimer) {
        localStorage.setItem(
          ACTIVE_TIMER_STORAGE_KEY,
          JSON.stringify({ ...activeTimer, savedAt: Date.now() })
        );
      } else {
        localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [activeTimer]);

  const [isManualLogModalOpen, setIsManualLogModalOpen] = useState(false);
  const [manualLogDefaultTaskId, setManualLogDefaultTaskId] = useState<string | undefined>(undefined);

  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isMyProfileModalOpen, setIsMyProfileModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskItem | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [newBusinessResetSignal, setNewBusinessResetSignal] = useState(0);
  // Abrir una oportunidad concreta desde Mi Día (p. ej. Comercial ve «Alcance actualizado» → va directo a Cotización)
  const [newBusinessFocus, setNewBusinessFocus] = useState<{ id: string; tab: 'resumen' | 'scoping' | 'cotizacion'; nonce: number } | null>(null);

  // Global view selection with automatic reset to section root (allows optional targetId)
  const handleSelectView = (view: OrbitView, targetId?: string | null) => {
    setCurrentView(view);
    // Reset specific sub-navigation states to return to the root screen unless a targetId is provided
    if (view === 'proyectos') {
      if (targetId !== undefined) {
        setSelectedProjectIdForView(targetId);
      } else {
        setSelectedProjectIdForView(null);
      }
    }
    if (view === 'clientes') {
      if (targetId !== undefined) {
        setSelectedClientId(targetId);
      } else {
        setSelectedClientId(null);
      }
    }
    if (view === 'new-business') {
      setNewBusinessResetSignal((prev) => prev + 1);
    }
  };

  // Modal para detener y registrar el timer (Revisión antes de registrar)
  const [isStopTimerModalOpen, setIsStopTimerModalOpen] = useState(false);
  const [stopTimerInitialSeconds, setStopTimerInitialSeconds] = useState(0);

  // Timer Summary Modal State (Confirmación posterior al registro)
  const [isTimerSummaryOpen, setIsTimerSummaryOpen] = useState(false);
  const [timerSummaryData, setTimerSummaryData] = useState<TimerSummaryData | null>(null);

  // Assisted Recovery Modal State (para timers anormalmente largos > 10h)
  const [isAssistedRecoveryOpen, setIsAssistedRecoveryOpen] = useState(false);

  // Conflict Timer Modal State (Solo un timer global; interacción explícita sin transferencias silenciosas)
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [pendingTaskForTimer, setPendingTaskForTimer] = useState<TaskItem | null>(null);
  const [queuedTaskAfterStop, setQueuedTaskAfterStop] = useState<TaskItem | null>(null);
  const isCommittingTimerRef = useRef<boolean>(false);

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
      budgetedRoleId: task.budgetedRoleId || task.budgetedRole || 'Creative Designer',
      isOutsideRegularSchedule: isWeekend
    });
    // Ronda 3: empezar a medir tiempo es empezar la tarea. «Por hacer» pasa a «En proceso»
    // (las tareas en revisión, listas o bloqueadas no cambian de estado).
    const current = tasks.find((t) => t.id === task.id) || task;
    if (current.status === 'To Do') handleUpdateTaskStatus(task.id, 'In Progress');
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

  // Confirmación explícita para detener timer actual (abriendo Registrar tiempo) y arrancar en nueva tarea al confirmar
  const handleConfirmSwitchTimer = () => {
    if (!pendingTaskForTimer) {
      setIsConflictModalOpen(false);
      return;
    }

    const nextTask = pendingTaskForTimer;
    setIsConflictModalOpen(false);
    setPendingTaskForTimer(null);

    if (activeTimer) {
      setQueuedTaskAfterStop(nextTask);
      handleStopTimer();
      return;
    }

    startTimerForTask(nextTask);
  };

  const handleCancelSwitchTimer = () => {
    setIsConflictModalOpen(false);
    setPendingTaskForTimer(null);
    setQueuedTaskAfterStop(null);
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
    if (!activeTimer || isCommittingTimerRef.current) return;
    isCommittingTimerRef.current = true;
    setTimeout(() => {
      isCommittingTimerRef.current = false;
    }, 0);

    const targetTask = tasks.find((t) => t.id === activeTimer.taskId);
    if (!targetTask) {
      const nextQueued = queuedTaskAfterStop;
      setQueuedTaskAfterStop(null);
      if (nextQueued) {
        startTimerForTask(nextQueued);
      } else {
        setActiveTimer(null);
      }
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
      userId: currentUser?.id || targetTask.assignee?.id || 'u-pao',
      budgetedRoleId: activeTimer.budgetedRoleId || targetTask.budgetedRoleId || targetTask.budgetedRole || 'Creative Designer',
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
      userName: currentUser?.name || targetTask.assignee?.name || 'Paola Monsalve',
      userInitials: currentUser?.initials || targetTask.assignee?.initials || 'PM',
      userAvatarBg: currentUser?.avatarBg || targetTask.assignee?.avatarBg || 'bg-[#501f92]',
      categoryType: activeTimer.categoryType
    };

    setTimeLogs((prev) => [newLog, ...prev]);
    // El registro queda también en la tarea: así se ve quién ejecutó (puede no ser el asignado)
    setTasks((prev) => prev.map((t) => (t.id === newLog.taskId ? { ...t, timeLogs: [...(t.timeLogs || []), newLog] } : t)));

    // Finalizar sesión y cerrar sin doble confirmación; si había cambio en cola, iniciar nueva tarea
    setIsStopTimerModalOpen(false);
    const nextQueued = queuedTaskAfterStop;
    setQueuedTaskAfterStop(null);
    if (nextQueued) {
      startTimerForTask(nextQueued);
    } else {
      setActiveTimer(null);
    }
  };

  // Stop Timer: Pausar timer y abrir modal de revisión previa al registro
  const handleStopTimer = () => {
    if (!activeTimer) return;

    // Regla de Timer Olvidado: Recuperación asistida si lleva más de 10 horas activo
    if (activeTimer.elapsedSeconds >= ABNORMAL_TIMER_THRESHOLD_SECONDS) {
      setIsAssistedRecoveryOpen(true);
      return;
    }

    // Pausar timer y abrir modal de revisión
    setActiveTimer((prev) => (prev ? { ...prev, isPaused: true } : null));
    setStopTimerInitialSeconds(activeTimer.elapsedSeconds);
    setIsStopTimerModalOpen(true);
  };

  // Seguir trabajando / Cancelar registro: cierra modal, cancela cambio en cola y reanuda el timer anterior
  const handleResumeTimerFromModal = () => {
    setIsStopTimerModalOpen(false);
    setQueuedTaskAfterStop(null);
    setActiveTimer((prev) => (prev ? { ...prev, isPaused: false } : null));
  };

  // Descartar sesión: acción destructiva confirmada que limpia el timer sin registrar horas
  const handleDiscardTimerSession = () => {
    setIsStopTimerModalOpen(false);
    const nextQueued = queuedTaskAfterStop;
    setQueuedTaskAfterStop(null);
    if (nextQueued) {
      startTimerForTask(nextQueued);
    } else {
      setActiveTimer(null);
    }
  };

  // Aceptar: detiene definitivamente la sesión y guarda un único registro
  const handleConfirmTimerRegistration = (finalSeconds: number, isAdjusted: boolean) => {
    setIsStopTimerModalOpen(false);
    commitTimerLog(finalSeconds, isAdjusted, isAdjusted ? stopTimerInitialSeconds : undefined);
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
      submittedAt: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      submittedIso: new Date().toISOString()
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

    // Ronda 2: aviso al líder y al revisor (producción: a líder, revisor y seguidores de la tarea).
    const deliveredTask = tasks.find((t) => t.id === taskId);
    const mentioned = users
      .filter((u) => u.name && (del.notes || '').includes(`@${u.name}`))
      .map((u) => u.name);
    if (deliveredTask) {
      setActiveAlerts((prevAlerts) => [
        {
          id: `alt-rev-${Date.now()}`,
          type: 'REVISIÓN',
          title: deliveredTask.title,
          client: deliveredTask.clientName || 'ECO',
          description: `${del.submittedBy || 'Un colaborador'} envió un entregable a revisión${del.taggedReviewer ? ` · Revisa: ${del.taggedReviewer}` : ''}${
            mentioned.length ? ` · Menciona a ${mentioned.join(', ')}` : ''
          }`,
          impactLevel: 'medio',
          severity: 'info',
          read: false,
          timeAgo: 'Ahora',
          date: 'Hoy'
        },
        ...prevAlerts
      ]);
    }
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
      userId: currentUser?.id || data.userId || 'u-pao',
      userName: currentUser?.name || data.userName || 'Paola Monsalve',
      date: data.date || 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs'
    };

    setTimeLogs((prev) => [newLog, ...prev]);
    // El registro queda también en la tarea: así se ve quién ejecutó (puede no ser el asignado)
    setTasks((prev) => prev.map((t) => (t.id === newLog.taskId ? { ...t, timeLogs: [...(t.timeLogs || []), newLog] } : t)));

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
    const timestamp = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newEntry: TaskActivityLogEntry = {
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: 'status_change',
            actorName: 'Paola (Lead PM)',
            actorInitials: 'PL',
            actorAvatarBg: '#501f92',
            timestamp,
            description: `Estado actualizado a "${newStatus}"`,
            previousValue: t.status,
            newValue: newStatus
          };
          return {
            ...t,
            status: newStatus,
            completed: newStatus === 'Done',
            // Fecha de cierre: la usan la misión del equipo y las celebraciones de La Plaza
            completedAt: newStatus === 'Done' ? (t.status === 'Done' && t.completedAt ? t.completedAt : timestamp) : undefined,
            approvedBy: newStatus === 'Done' ? t.approvedBy : undefined,
            approvedAt: newStatus === 'Done' ? t.approvedAt : undefined,
            activityLog: [newEntry, ...(t.activityLog || [])]
          };
        }
        return t;
      })
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => {
        if (!prev) return null;
        const newEntry: TaskActivityLogEntry = {
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: 'status_change',
          actorName: 'Paola (Lead PM)',
          actorInitials: 'PL',
          actorAvatarBg: '#501f92',
          timestamp,
          description: `Estado actualizado a "${newStatus}"`,
          previousValue: prev.status,
          newValue: newStatus
        };
        return {
          ...prev,
          status: newStatus,
          completed: newStatus === 'Done',
          completedAt: newStatus === 'Done' ? (prev.status === 'Done' && prev.completedAt ? prev.completedAt : timestamp) : undefined,
          approvedBy: newStatus === 'Done' ? prev.approvedBy : undefined,
          approvedAt: newStatus === 'Done' ? prev.approvedAt : undefined,
          activityLog: [newEntry, ...(prev.activityLog || [])]
        };
      });
    }
  };

  // Update Task Priority from Modal
  const handleUpdateTaskPriority = (taskId: string, newPriority: TaskPriority) => {
    const timestamp = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newEntry: TaskActivityLogEntry = {
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: 'priority_change',
            actorName: 'Paola (Lead PM)',
            actorInitials: 'PL',
            actorAvatarBg: '#501f92',
            timestamp,
            description: `Prioridad actualizada a "${newPriority}"`,
            previousValue: t.priority,
            newValue: newPriority
          };
          return {
            ...t,
            priority: newPriority,
            activityLog: [newEntry, ...(t.activityLog || [])]
          };
        }
        return t;
      })
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => {
        if (!prev) return null;
        const newEntry: TaskActivityLogEntry = {
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: 'priority_change',
          actorName: 'Paola (Lead PM)',
          actorInitials: 'PL',
          actorAvatarBg: '#501f92',
          timestamp,
          description: `Prioridad actualizada a "${newPriority}"`,
          previousValue: prev.priority,
          newValue: newPriority
        };
        return {
          ...prev,
          priority: newPriority,
          activityLog: [newEntry, ...(prev.activityLog || [])]
        };
      });
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
  // Tarea → cronograma: si una tarea sale de la producción de su fase, se pregunta antes de correr hitos
  const [phaseOverflowPrompt, setPhaseOverflowPrompt] = useState<{ taskId: string; taskTitle: string; projectId: string; overflow: PhaseOverflow } | null>(null);

  const handleUpdateTaskDates = (taskId: string, startDate: string, dueDate: string, dueText?: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              startDate,
              scheduledDate: startDate || t.scheduledDate,
              dueDate,
              dueText: dueText || t.dueText
            }
          : t
      )
    );
    // ¿La nueva fecha límite pasa el fin de la producción de su fase? (proyecto único ya iniciado)
    const task = tasks.find((t) => t.id === taskId);
    const project = task && projectsList.find((p) => p.id === task.projectId || p.name === task.projectName);
    if (task && project && project.isKickedOff && project.startDate && project.phaseSteps?.length && normalizeProjectType(project.projectType) === 'fixed_project') {
      const phaseId = project.phaseSteps.some((st) => st.id === task.deliverableId)
        ? task.deliverableId!
        : (project.deliverables || []).find((d) => d.name === task.frente)?.id;
      const overflow = phaseId ? detectPhaseOverflow({
        startDate: project.startDate,
        steps: project.phaseSteps,
        notBefore: notBeforeFromDependencies(project.dependencies),
        phaseId,
        newDueDate: (dueDate || '').slice(0, 10),
        taskTitle: task.title
      }) : null;
      if (overflow) setPhaseOverflowPrompt({ taskId, taskTitle: task.title, projectId: project.id, overflow });
    }
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

  // Extender la fase: guarda los pasos, corre fases, presentaciones y entrega, y reprograma las tareas
  // abiertas de las fases SIGUIENTES (las de la misma fase y la tarea movida no se tocan).
  const handleExtendPhaseForTask = () => {
    if (!phaseOverflowPrompt) return;
    const { projectId, overflow, taskId } = phaseOverflowPrompt;
    const project = projectsList.find((p) => p.id === projectId);
    if (!project) { setPhaseOverflowPrompt(null); return; }
    const after = overflow.after;
    const laterPhaseIds = new Set(after.phases.slice(overflow.phaseIndex + 1).map((ph) => ph.id));
    const projectTasks = tasks.filter((t) => t.projectId === project.id || t.projectName === project.name);
    const toReplan = projectTasks.filter((t) => t.id !== taskId && !t.completed && t.status !== 'Done' && t.deliverableId && laterPhaseIds.has(t.deliverableId));
    const replanIds = new Set(toReplan.map((t) => t.id));
    const assignee = new Map(toReplan.map((t) => [t.id, t.assignee?.name && t.assignee.name !== '-' ? t.assignee.name : undefined]));
    const planned = planTasksFromPhases(
      after.phases.filter((ph) => laterPhaseIds.has(ph.id)),
      toReplan.map((t) => ({ id: t.id, deliverableId: t.deliverableId, budgetedHours: t.budgetedHours, title: t.title })),
      { assigneeOf: (id) => assignee.get(id), existingLoad: buildExistingLoad(tasks, replanIds), dailyCapacity: DEFAULT_DAILY_CAPACITY }
    );
    setTasks((prev) => prev.map((t) => {
      const slot = replanIds.has(t.id) ? planned.tasks[t.id] : undefined;
      return slot ? { ...t, date: slot.scheduledDate, startDate: slot.scheduledDate, scheduledDate: slot.scheduledDate, dueDate: slot.dueDate, dueText: `Deadline: ${slot.dueDate}` } : t;
    }));
    const byId = new Map(after.phases.map((ph) => [ph.id, ph]));
    const updated: ProjectSummaryItem = {
      ...project,
      phaseSteps: overflow.nextSteps,
      deliverables: (project.deliverables || []).map((d) => {
        const ph = byId.get(d.id);
        return ph ? ({ ...d, startDate: ph.start, dueDate: ph.end, endDate: ph.end } as typeof d) : d;
      }),
      endDate: after.endDate,
      forecastEndDate: after.endDate
    };
    setProjectsList((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
    setPhaseOverflowPrompt(null);
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
    followers?: TaskItem['followers'],
    assigneeAllocations?: TaskItem['assigneeAllocations']
  ) => {
    const timestamp = new Date().toISOString();
    const existingTask = tasks.find((item) => item.id === taskId);
    if (existingTask) {
      const prevNames = new Set(
        [existingTask.assignee?.name, ...(existingTask.collaborators || []).map((c) => c?.name)]
          .filter((n): n is string => Boolean(n && n !== '-'))
          .map((n) => n.toLowerCase())
      );
      const nextNames = [assignee?.name, ...(collaborators || []).map((c) => c?.name)].filter(
        (n): n is string => Boolean(n && n !== '-')
      );
      const addedNames = nextNames.filter((n) => !prevNames.has(n.toLowerCase()));
      if (addedNames.length > 0) {
        const prioLabel =
          existingTask.priority === 'High' || existingTask.priority === 'urgent'
            ? 'Alta'
            : existingTask.priority === 'Low' || existingTask.priority === 'low'
            ? 'Baja'
            : 'Media';
        setActiveAlerts((prevAlerts) => [
          {
            id: `alt-${Date.now()}`,
            type: 'ASIGNACIÓN',
            title: existingTask.title,
            client: existingTask.clientName || 'ECO',
            description: `Asignado a ${addedNames.join(', ')} · Prioridad ${prioLabel}`,
            impactLevel: prioLabel === 'Alta' ? 'alto' : 'medio',
            severity: prioLabel === 'Alta' ? 'high' : 'info',
            read: false,
            timeAgo: 'Ahora',
            date: 'Hoy'
          },
          ...prevAlerts
        ]);
      }
    }

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newLogs: TaskActivityLogEntry[] = [...(t.activityLog || [])];
          if (assignee && assignee.name !== t.assignee?.name) {
            newLogs.unshift({
              id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'assignee_change',
              actorName: 'Paola (Lead PM)',
              actorInitials: 'PL',
              actorAvatarBg: '#501f92',
              timestamp,
              description: `Responsable reasignado: ${t.assignee?.name || 'Sin asignar'} → ${assignee.name}`,
              previousValue: t.assignee?.name,
              newValue: assignee.name
            });
          }
          if (reviewer && reviewer.name !== t.reviewer?.name) {
            newLogs.unshift({
              id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'reviewer_change',
              actorName: 'Paola (Lead PM)',
              actorInitials: 'PL',
              actorAvatarBg: '#501f92',
              timestamp,
              description: `Revisor asignado: ${reviewer.name}`,
              previousValue: t.reviewer?.name,
              newValue: reviewer.name
            });
          }
          return {
            ...t,
            assignee,
            collaborators,
            reviewer,
            requestedBy: requestedBy || t.requestedBy,
            budgetedRole: budgetedRole !== undefined ? budgetedRole : t.budgetedRole,
            requiresValidation: requiresValidation !== undefined ? requiresValidation : t.requiresValidation,
            projectLead: projectLead !== undefined ? projectLead : t.projectLead,
            followers: followers !== undefined ? followers : t.followers,
            assigneeAllocations: assigneeAllocations !== undefined ? assigneeAllocations : t.assigneeAllocations,
            activityLog: newLogs
          };
        }
        return t;
      })
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => {
        if (!prev) return null;
        const newLogs: TaskActivityLogEntry[] = [...(prev.activityLog || [])];
        if (assignee && assignee.name !== prev.assignee?.name) {
          newLogs.unshift({
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: 'assignee_change',
            actorName: 'Paola (Lead PM)',
            actorInitials: 'PL',
            actorAvatarBg: '#501f92',
            timestamp,
            description: `Responsable reasignado: ${prev.assignee?.name || 'Sin asignar'} → ${assignee.name}`,
            previousValue: prev.assignee?.name,
            newValue: assignee.name
          });
        }
        return {
          ...prev,
          assignee,
          collaborators,
          reviewer,
          requestedBy: requestedBy || prev.requestedBy,
          budgetedRole: budgetedRole !== undefined ? budgetedRole : prev.budgetedRole,
          requiresValidation: requiresValidation !== undefined ? requiresValidation : prev.requiresValidation,
          projectLead: projectLead !== undefined ? projectLead : prev.projectLead,
          followers: followers !== undefined ? followers : prev.followers,
          assigneeAllocations: assigneeAllocations !== undefined ? assigneeAllocations : prev.assigneeAllocations,
          activityLog: newLogs
        };
      });
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
    // Unificar con ProjectReworkRound canónico del proyecto
    const targetTask = tasks.find((t) => t.id === taskId);
    const parentProject = targetTask
      ? projectsList.find((p) => p.name === targetTask.projectName || p.id === targetTask.board)
      : null;

    let roundId = `rw-${Date.now()}`;
    if (parentProject) {
      const existingRound = (parentProject.reworkRounds || []).find(
        (r) => r.roundNumber === reworkData.roundNumber
      );
      if (existingRound) {
        roundId = existingRound.id;
      } else {
        const newProjectRound: ProjectReworkRound = {
          id: roundId,
          projectId: parentProject.id,
          roundNumber: reworkData.roundNumber,
          cause: reworkData.origin === 'client' ? 'client_adjustment' : 'internal_adjustment',
          requestedAt: new Date().toISOString(),
          estimatedHours: reworkData.estimatedHours || 2,
          actualHours: 0,
          note: reworkData.reason,
          createdByUserId: currentUser.id,
          createdByName: currentUser.name,
          isAdditionalIteration: reworkData.roundNumber > (parentProject.scheduleConfig?.includedReworkRounds ?? 2)
        };
        setProjectsList((prevProjects) =>
          prevProjects.map((p) =>
            p.id === parentProject.id
              ? { ...p, reworkRounds: [...(p.reworkRounds || []), newProjectRound] }
              : p
          )
        );
      }
    }

    const newRework: TaskRework = {
      ...reworkData,
      id: `rwk-${Date.now()}`,
      taskId,
      reworkRoundId: roundId,
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
            isRework: true,
            reworkRound: reworkData.roundNumber,
            reworkRoundId: roundId,
            reworkReason: reworkData.reason,
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
          isRework: true,
          reworkRound: reworkData.roundNumber,
          reworkRoundId: roundId,
          reworkReason: reworkData.reason,
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

  // Duplicar tarea: una tarea = un colaborador. Si dos personas trabajan en paralelo (p. ej. dos
  // propuestas de logo), se duplica y las horas cotizadas se reparten en partes iguales.
  const handleDuplicateTask = (taskId: string) => {
    const original = tasks.find((t) => t.id === taskId);
    if (!original) return;
    const half = Math.round(((original.budgetedHours || 0) / 2) * 100) / 100;
    const copy: TaskItem = {
      ...original,
      id: `${original.id}-dup-${Date.now()}`,
      title: `${original.title} (2)`,
      status: 'To Do',
      completed: false,
      completedAt: undefined,
      budgetedHours: half,
      consumedSeconds: 0,
      executionSeconds: 0,
      managementSeconds: 0,
      timeLogs: [],
      reworks: [],
      collaborators: []
    };
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === taskId);
      const next = prev.map((t) => (t.id === taskId ? { ...t, budgetedHours: half } : t));
      next.splice(idx + 1, 0, copy);
      return next;
    });
    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail((prev) => (prev ? { ...prev, budgetedHours: half } : prev));
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
            consumedSeconds: Math.max(0, t.consumedSeconds - targetLog.durationSeconds),
            timeLogs: (t.timeLogs || []).filter((l) => l.id !== targetLog.id)
          };
        }
        return t;
      })
    );

    setTimeLogs((prev) => prev.filter((l) => l.id !== id));
  };

  // Open Task Detail
  const [taskDetailFocus, setTaskDetailFocus] = useState<'decisiones' | 'entregables' | null>(null);
  const handleOpenTaskDetail = (taskOrId: TaskItem | string, focus: 'decisiones' | 'entregables' | null = null) => {
    const target = typeof taskOrId === 'string' ? tasks.find((t) => t.id === taskOrId) : taskOrId;
    if (target) {
      setSelectedTaskForDetail(target);
      setTaskDetailFocus(focus);
      setIsTaskDetailModalOpen(true);
    }
  };

  // Abrir una tarea desde cualquier parte (La Plaza, Mi Día): evento «eco:open-task» { taskId, focus }
  useEffect(() => {
    const onOpen = (e: Event) => {
      const { taskId, focus } = (e as CustomEvent<{ taskId: string; focus?: 'decisiones' | 'entregables' }>).detail || ({} as { taskId: string });
      if (taskId) handleOpenTaskDetail(taskId, focus || null);
    };
    window.addEventListener('eco:open-task', onOpen);
    return () => window.removeEventListener('eco:open-task', onOpen);
  });

  // Decisiones (§32.7): ejemplo del prototipo y desbloqueo automático al cerrarse
  useEffect(() => { seedDecisionsIfEmpty(); }, []);
  useEffect(() => {
    const sync = () => {
      const closed = loadDecisions().filter((d) => d.blocksTask && d.taskId && d.status !== 'en_revision');
      if (!closed.length) return;
      setTasks((prev) => prev.map((t) => {
        const d = closed.find((x) => x.taskId === t.id);
        if (!d || !t.blockerInfo?.isBlocked || !String(t.blockerInfo.reasonText || '').includes(d.title)) return t;
        if (d.status === 'objeciones') return { ...t, blockerInfo: { ...t.blockerInfo, reasonText: `Decisión con objeciones: ${d.title}` } };
        return { ...t, blockerInfo: { isBlocked: false, unblockedAt: new Date().toISOString() } };
      }));
    };
    sync();
    window.addEventListener(DECISIONS_EVENT, sync);
    const id = window.setInterval(sync, 60_000);
    return () => { window.removeEventListener(DECISIONS_EVENT, sync); window.clearInterval(id); };
  }, []);

  const handleUpdateTaskReviewers = (taskId: string, reviewers: NonNullable<TaskItem['reviewer']>[]) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, reviewers } : t)));
    setSelectedTaskForDetail((prev) => (prev && prev.id === taskId ? { ...prev, reviewers } : prev));
  };

  /** §32.7.1: «Sin revisión» y revisores elegidos a mano (el cambio del proyecto no los toca). */
  const handleUpdateReviewSettings = (taskId: string, patch: { requiresReview?: boolean; reviewersManual?: boolean }) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));
    setSelectedTaskForDetail((prev) => (prev && prev.id === taskId ? { ...prev, ...patch } : prev));
  };

  /** Aprobar (queda quién aprobó: cuenta para ECOINS y la misión) o pedir ajustes. */
  const handleReviewDecision = (taskId: string, decision: 'approved' | 'changes', by: string, note?: string) => {
    // Revisión ágil (§32.4): +5 a quien revisa si aprueba o pide ajustes dentro de 1 día hábil desde la entrega. Máx. 20 al día.
    {
      const t = tasks.find((x) => x.id === taskId);
      const last = [...(t?.deliverables || [])].reverse().find((d) => d.status === 'submitted');
      const reviewerUser = users.find((u) => u.name === by) || users.find((u) => u.name.split(' ')[0] === by.split(' ')[0]);
      const at = last?.submittedIso ? new Date(last.submittedIso) : null;
      if (t && last && reviewerUser && at && !isNaN(at.getTime())) {
        // Horas hábiles (lunes a viernes) desde la entrega; 1 día hábil = 24 horas hábiles
        const d = new Date(at);
        let bizHours = 0;
        const now = new Date();
        while (d < now && bizHours <= 24) { d.setHours(d.getHours() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) bizHours++; }
        const biz = bizHours <= 24 ? 1 : 2;
        const todayKey = new Date().toISOString().slice(0, 10);
        const already = loadRewards(reviewerUser.id).ledger.filter((e) => e.kind === 'review_fast' && e.at.slice(0, 10) === todayKey).length;
        if (biz <= 1 && already < 4) {
          creditUser(reviewerUser.id, { key: `review_fast:${taskId}:${last.id}`, amount: 5, kind: 'review_fast', label: `Revisión ágil · ${t.title}` });
        }
      }
    }
    const apply = (t: TaskItem): TaskItem => {
      const dels = [...(t.deliverables || [])];
      const lastOpen = dels.map((d) => d.status).lastIndexOf('submitted');
      if (lastOpen >= 0) dels[lastOpen] = { ...dels[lastOpen], status: decision === 'approved' ? 'approved' : 'changes_requested', changesNote: decision === 'changes' ? note : undefined };
      return decision === 'approved'
        ? { ...t, deliverables: dels, approvedBy: by, approvedAt: new Date().toISOString() }
        : { ...t, deliverables: dels, approvedBy: undefined, approvedAt: undefined };
    };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? apply(t) : t)));
    setSelectedTaskForDetail((prev) => (prev && prev.id === taskId ? apply(prev) : prev));
  };

  /**
   * Cambio por proyecto (§32.7.1): quien revisa por defecto en el proyecto. Se aplica a las tareas
   * abiertas que siguen con el revisor por defecto; las que alguien cambió a mano no se tocan.
   */
  const handleChangeProjectReviewer = (projectName: string, person: NonNullable<TaskItem['reviewer']>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.projectName === projectName && !t.completed && t.status !== 'Done' && !t.reviewersManual
          ? { ...t, reviewers: [person] }
          : t
      )
    );
    setProjectsList((prev) => prev.map((p) => (p.name === projectName ? { ...p, defaultReviewer: person } : p)));
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
      accountManagerId: projectData.accountManagerId,
      accountManagerName: projectData.accountManagerName,
      projectType: projectData.projectType,
      nonBillable: projectData.nonBillable || undefined,
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
        id: d.id.startsWith('del-new-') ? `del-${newProjectId}-${d.id.slice('del-new-'.length)}` : d.id,
        projectId: newProjectId
      })),
      coreTeam: projectData.coreTeam || [],
      rolloverPolicy: projectData.rolloverPolicy,
      contractMonths: projectData.contractMonths,
      // Mismo punto de partida que un proyecto convertido: «Por iniciar» hasta «Iniciar proyecto»,
      // que programa las tareas con estas semanas y rondas.
      scheduleConfig: projectData.scheduleConfig,
      isKickedOff: projectData.scheduleConfig ? false : undefined,
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
        createdAt: new Date().toISOString(),
        projectId: newProjectId,
        deliverableId: t.deliverableId && t.deliverableId.startsWith('del-new-')
          ? `del-${newProjectId}-${t.deliverableId.slice('del-new-'.length)}`
          : t.deliverableId
      } as TaskItem));
      setTasks((prev) => [...generatedTasks, ...prev]);
    }

    // Update client projects history & count
    setClients((prev) =>
      prev.map((cli) => {
        if (cli.id === projectData.clientId || cli.name.toLowerCase() === projectData.clientName.toLowerCase()) {
          const formattedValue =
            projectData.soldCurrency === 'USD' && projectData.soldValue && projectData.soldValue > 0
              ? `$${projectData.soldValue.toLocaleString('en-US')} USD`
              : projectData.soldValueCOP && projectData.soldValueCOP > 0
              ? `$${(projectData.soldValueCOP / 1000000).toFixed(1)}M COP`
              : projectData.soldValue && projectData.soldValue > 0
              ? `$${projectData.soldValue.toLocaleString('es-CO')} ${projectData.soldCurrency || 'COP'}`
              : undefined;

          const newHistoryItem = {
            id: newProjectId,
            name: projectData.name,
            brand: projectData.brand,
            status: 'Activo' as const,
            quotedValueCOP: formattedValue || '$0',
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

  const handleConvertOpportunityToProject = (payload: {
    opportunity: NewBusinessOpportunity;
    selectedQuote: QuoteProposal;
    projectName: string;
    projectType: ProjectType;
    leadUserId: string;
    leadUserIds?: string[];
    specialistUserIds?: string[];
    leadName: string;
    startDate?: string; // Obsoleto: las fechas se fijan al «Iniciar proyecto»
    endDate?: string;   // Obsoleto: las fechas se fijan al «Iniciar proyecto»
    initialFormalizationStatus?: 'pendiente_formalizacion' | 'activo';
    startConditionsConfig?: any;
    approvedServiceIds?: string[];
    isMixed?: boolean;
    fixedProjectName?: string;
    feeProjectName?: string;
    projects?: Array<{
      serviceId: string;
      serviceName: string;
      projectName: string;
      projectType: ProjectType;
      hubspotDealId?: string | null;
      hubspotDealStage?: string;
      soldValue?: number;
      soldMonthlyValue?: number;
      monthsDuration?: number;
      deliverableIds: string[];
      leadUserId?: string;
      leadUserName?: string;
    }>;
  }) => {
    const opp = payload.opportunity;
    const quote = payload.selectedQuote;

    // Solo colaboradores activos del equipo canónico pueden incorporarse a la conversión.
    const activeTeam = users.filter((user) => user.status === 'Active');
    const leadIds = payload.leadUserIds && payload.leadUserIds.length > 0
      ? payload.leadUserIds
      : [payload.leadUserId];

    const leadUsers = activeTeam.filter((u) => leadIds.includes(u.id));
    const assignedLeadUser = leadUsers[0] || activeTeam.find((user) => user.id === payload.leadUserId);
    if (!assignedLeadUser) return;
    const leadId = assignedLeadUser.id;
    const leadName = leadUsers.length > 1
      ? leadUsers.map((u) => u.name).join(', ')
      : assignedLeadUser.name;
    const leadRole = assignedLeadUser?.officialRole || assignedLeadUser?.professionalRole || assignedLeadUser?.role || 'Líder de Proyecto';
    const leadAvatarBg = assignedLeadUser?.avatarBg || 'bg-[#501f92]';
    const leadInitials = assignedLeadUser?.initials || leadName.slice(0, 2).toUpperCase();

    const resolvedCoreTeam: any[] = leadUsers.map((lUser) => ({
      id: lUser.id,
      name: lUser.name,
      role: lUser.officialRole || lUser.professionalRole || lUser.role || 'Líder de Proyecto',
      avatarBg: lUser.avatarBg || 'bg-[#501f92]',
      initials: lUser.initials || lUser.name.slice(0, 2).toUpperCase(),
      isLead: true,
      weeklyAllocatedHours: 4
    }));

    if (payload.specialistUserIds && Array.isArray(payload.specialistUserIds)) {
      payload.specialistUserIds.forEach((specId: string) => {
        const specUser = activeTeam.find((u) => u.id === specId);
        if (specUser && specUser.id !== leadId) {
          resolvedCoreTeam.push({
            id: specUser.id,
            name: specUser.name,
            role: specUser.officialRole || specUser.professionalRole || specUser.role || 'Especialista',
            avatarBg: specUser.avatarBg || 'bg-[#7839ee]',
            initials: specUser.initials || specUser.name.slice(0, 2).toUpperCase(),
            isLead: false,
            weeklyAllocatedHours: 8
          });
        }
      });
    }

    // Resolver servicios y entregables aprobados
    const commercialItems = quote.commercialStructure || [];
    const isDeliverableApproved = (qd: any) => {
      if (!payload.approvedServiceIds || payload.approvedServiceIds.length === 0) return true;
      if (commercialItems.length === 0) return true;
      const parent = commercialItems.find((ci) =>
        (ci.deliverableIds && ci.deliverableIds.includes(qd.id)) ||
        ci.serviceId === qd.id ||
        ci.serviceName.toLowerCase() === qd.name.toLowerCase()
      );
      if (!parent) return true;
      return payload.approvedServiceIds.includes(parent.serviceId);
    };

    const getDeliverableModality = (qd: any): 'fixed_project' | 'fee_monthly' => {
      const parent = commercialItems.find((ci) =>
        (ci.deliverableIds && ci.deliverableIds.includes(qd.id)) ||
        ci.serviceId === qd.id ||
        ci.serviceName.toLowerCase() === qd.name.toLowerCase()
      );
      if (parent) return parent.modality;
      return payload.projectType === 'fee_monthly' ? 'fee_monthly' : 'fixed_project';
    };

    const quoteCurrency = quote.currency || 'COP';
    const effectiveTaxEntityId = opp.selectedTaxEntityId || null;

    // Regla estricta: NO reconciliar ni reutilizar Clientes mediante coincidencias por nombre:
    // - si existe clientId, reutilizar exactamente ese Cliente;
    // - si no existe clientId, crear un nuevo Cliente.
    if (opp.clientId && !clients.some((client) => client.id === opp.clientId)) return;
    let resolvedClientId = opp.clientId || undefined;
    let resolvedClientName = opp.prospectAccountName || 'Cliente';

    const isMixed = Boolean(payload.isMixed);

    // Preparar los proyectos a crear
    const projectsToCreate: ProjectSummaryItem[] = [];
    const historyItemsToCreate: ClientProjectHistoryItem[] = [];
    const newTasksToCreate: TaskItem[] = [];

    if (payload.projects && payload.projects.length > 0) {
      // Regla 1:1:1: 1 servicio en ECO = 1 negocio en HubSpot = 1 proyecto en ECO si se gana.
      payload.projects.forEach((projItem, pIdx) => {
        const prjId = `prj-${Date.now()}-${pIdx + 1}`;
        const serviceDeliverables = quote.deliverables.filter((qd) =>
          (projItem.deliverableIds && projItem.deliverableIds.includes(qd.id)) ||
          qd.id === projItem.serviceId ||
          qd.name.toLowerCase() === projItem.serviceName.toLowerCase()
        );

        const deliverablesForProject = serviceDeliverables.length > 0
          ? serviceDeliverables
          : quote.deliverables;

        const newProjectDeliverables = deliverablesForProject.map((qd, dIdx) => ({
          id: `del-${prjId}-${dIdx + 1}`,
          projectId: prjId,
          name: qd.name,
          description: qd.description,
          order: qd.order || dIdx + 1,
          status: 'pending' as const,
          roleBudgets: qd.roleBudgets.map((rb) => ({
            id: `rb-${prjId}-${rb.id}`,
            roleId: rb.roleId,
            roleName: rb.roleName,
            quotedHours: rb.quotedHours
          })),
          totalQuotedHours: qd.totalHoursRollup || 0,
          totalExecutedHours: 0,
          progressPercentage: 0
        }));

        const totalHours = deliverablesForProject.reduce((sum, d) => sum + (d.totalHoursRollup || 0), 0);
        const soldValue = projItem.projectType === 'fixed_project'
          ? (projItem.soldValue || 0)
          : ((projItem.soldMonthlyValue || 0) * (projItem.monthsDuration || 1));
        const soldValueCOP = quoteCurrency === 'COP' && soldValue > 0 ? soldValue : undefined;
        const codePrefix = projItem.projectType === 'fee_monthly' ? 'FEE' : 'PRJ';

        const specificLeadUser = (projItem.leadUserId ? activeTeam.find((u) => u.id === projItem.leadUserId) : null) || assignedLeadUser;
        const prjLeadName = specificLeadUser?.name || projItem.leadUserName || leadName;
        const prjLeadAvatarBg = specificLeadUser?.avatarBg || 'bg-[#501f92]';
        const prjLeadRole = specificLeadUser?.officialRole || specificLeadUser?.professionalRole || specificLeadUser?.role || 'Líder de Proyecto';

        const projectCoreTeam: any[] = [
          {
            id: specificLeadUser?.id || `lead-${prjId}`,
            name: prjLeadName,
            role: prjLeadRole,
            avatarBg: prjLeadAvatarBg,
            initials: specificLeadUser?.initials || prjLeadName.slice(0, 2).toUpperCase(),
            isLead: true,
            weeklyAllocatedHours: 4
          }
        ];

        if (payload.specialistUserIds && Array.isArray(payload.specialistUserIds)) {
          payload.specialistUserIds.forEach((specId: string) => {
            const specUser = activeTeam.find((u) => u.id === specId);
            if (specUser && specUser.id !== specificLeadUser?.id) {
              projectCoreTeam.push({
                id: specUser.id,
                name: specUser.name,
                role: specUser.officialRole || specUser.professionalRole || specUser.role || 'Especialista',
                avatarBg: specUser.avatarBg || 'bg-[#7839ee]',
                initials: specUser.initials || specUser.name.slice(0, 2).toUpperCase(),
                isLead: false,
                weeklyAllocatedHours: 8
              });
            }
          });
        }

        const newPrj: ProjectSummaryItem = {
          id: prjId,
          code: `${codePrefix}-${Math.floor(10 + Math.random() * 90)}`,
          name: projItem.projectName,
          clientId: resolvedClientId || '',
          clientName: resolvedClientName,
          taxEntityId: effectiveTaxEntityId || (clients.find(c => c.id === resolvedClientId)?.taxEntities?.[0]?.id) || null,
          brand: resolvedClientName,
          leadName: prjLeadName,
          leadAvatarBg: prjLeadAvatarBg,
          leadRole: prjLeadRole,
          projectType: projItem.projectType,
          serviceBase: projItem.serviceName,
          budgetedHours: totalHours,
          soldHours: totalHours,
          soldValue: soldValue > 0 ? soldValue : undefined,
          soldValueCOP,
          soldCurrency: quoteCurrency,
          startDate: undefined, // Se define al «Iniciar proyecto»
          endDate: undefined,
          brief: opp.briefSummary || opp.discoveryNotes,
          briefUrl: opp.briefUrl || null,
          deliverables: newProjectDeliverables,
          coreTeam: projectCoreTeam,
          originOpportunityId: opp.id,
          originQuoteIds: [quote.id],
          hubspotDealId: projItem.hubspotDealId || opp.hubspotDealId || null,
          hubspotDealUrl: opp.hubspotDealUrl || null,
          alegraContactId: opp.administrativeChecklist?.alegraContactId || null,
          driveFolderId: opp.driveFolderId || null,
          driveFolderUrl: opp.driveFolderUrl || null,
          status: 'Activo',
          healthStatus: 'verde',
          scheduleConfig: {
            clientKickoffWaitDays: (projItem as any).scheduleConfig?.clientKickoffWaitDays ?? 3,
            includedReworkRounds: (projItem as any).scheduleConfig?.includedReworkRounds ?? (projItem as any).includedReworkRounds ?? 2,
            reworkRoundDays: (projItem as any).scheduleConfig?.reworkRoundDays ?? 5,
            productionWeeks: (projItem as any).scheduleConfig?.productionWeeks
          },
          healthNote: `Proyecto independiente creado a partir del servicio ganado "${projItem.serviceName}"`,
          // Fee mensual: vigencia y política de horas no usadas (los ciclos se crean al iniciar)
          contractMonths: projItem.projectType === 'fee_monthly' ? ((projItem as any).monthsDuration ?? 6) : null,
          rolloverPolicy: projItem.projectType === 'fee_monthly' ? ((projItem as any).rolloverPolicy ?? 'none') : undefined,
          // Recursos externos del servicio; los que no tienen servicio van al primer proyecto
          externalResources: (quote.externalResources || []).filter((r) =>
            r.serviceId ? r.serviceId === projItem.serviceId : pIdx === 0
          )
        };

        projectsToCreate.push(newPrj);

        historyItemsToCreate.push({
          id: prjId,
          name: projItem.projectName,
          brand: resolvedClientName,
          tag: projItem.projectType === 'fee_monthly' ? 'FEE' : 'PRJ',
          status: 'Activo',
          quotedValueCOP: projItem.projectType === 'fee_monthly'
            ? `$${(projItem.soldMonthlyValue || 0).toLocaleString('es-CO')} ${quoteCurrency} / mes`
            : `$${soldValue.toLocaleString('es-CO')} ${quoteCurrency}`,
          realMarginPercent: null,
          trafficLight: 'verde'
        });

        // Crear tareas para cada actividad del entregable de este proyecto
        deliverablesForProject.forEach((qd, dIdx) => {
          const parentDelId = `del-${prjId}-${dIdx + 1}`;
          qd.backlogItems.forEach((bItem, bIdx) => {
            const activityUser = activeTeam.find((user) => user.id === bItem.suggestedUserId);
            newTasksToCreate.push({
              id: `task-${prjId}-${dIdx + 1}-${bIdx + 1}`,
              createdAt: new Date().toISOString(),
              title: bItem.title,
              status: 'todo',
              priority: 'Medium',
              projectId: prjId,
              projectName: projItem.projectName,
              clientName: resolvedClientName,
              deliverableId: parentDelId,
              frente: qd.name,
              board: projItem.projectName,
              department: 'Operaciones',
              date: new Date().toISOString().slice(0, 10),
              dueDate: '', // Se programa al «Iniciar proyecto»
              dueStatus: 'normal',
              dueText: 'Se programa al iniciar el proyecto',
              budgetedHours: bItem.estimatedHours || 0,
              consumedSeconds: 0,
              completed: false,
              budgetedRole: bItem.roleName,
              budgetedRoleId: bItem.roleId,
              assigneeIds: activityUser ? [activityUser.id] : [],
              assignee: activityUser ? {
                id: activityUser.id,
                name: activityUser.name,
                role: bItem.roleName,
                avatarBg: activityUser.avatarBg || 'bg-[#501f92]',
                initials: activityUser.initials || activityUser.name.slice(0, 2).toUpperCase()
              } : {
                id: undefined,
                name: `Sin asignar (${bItem.roleName})`,
                role: bItem.roleName,
                avatarBg: 'bg-[#94a3b8]',
                initials: '--'
              }
            });
          });
        });
      });
    } else if (isMixed) {
      // Caso C: Propuesta mixta (2 proyectos: 1 Proyecto único + 1 Proyecto fee)
      const fixedProjectId = `prj-${Date.now()}-1`;
      const feeProjectId = `prj-${Date.now()}-2`;

      // Entregables para el Proyecto Único (aprobados y de modalidad fixed_project)
      const fixedDeliverables = quote.deliverables
        .filter(isDeliverableApproved)
        .filter((qd) => getDeliverableModality(qd) === 'fixed_project');

      // Entregables para el Proyecto Fee (aprobados y de modalidad fee_monthly)
      const feeDeliverables = quote.deliverables
        .filter(isDeliverableApproved)
        .filter((qd) => getDeliverableModality(qd) === 'fee_monthly');

      const fixedApprovedCommercial = commercialItems
        .filter((ci) => (payload.approvedServiceIds || []).includes(ci.serviceId))
        .filter((ci) => ci.modality === 'fixed_project');

      const feeApprovedCommercial = commercialItems
        .filter((ci) => (payload.approvedServiceIds || []).includes(ci.serviceId))
        .filter((ci) => ci.modality === 'fee_monthly');

      const fixedSoldValue = fixedApprovedCommercial.reduce((sum, ci) => sum + (ci.totalValue || 0), 0);
      const feeSoldMonthly = feeApprovedCommercial.reduce((sum, ci) => sum + (ci.monthlyValue || 0), 0);
      const feeSoldTotal = feeApprovedCommercial.reduce((sum, ci) => sum + ((ci.monthlyValue || 0) * (ci.monthsDuration || 0)), 0);

      const fixedName = payload.fixedProjectName || `${payload.projectName} · Proyectos Únicos`;
      const feeName = payload.feeProjectName || `${payload.projectName} · Fee Mensual`;

      // 1. Proyecto Único
      const newProjectDeliverablesFixed = fixedDeliverables.map((qd, idx) => ({
        id: `del-${fixedProjectId}-${idx + 1}`,
        projectId: fixedProjectId,
        name: qd.name,
        description: qd.description,
        order: qd.order || idx + 1,
        status: 'pending' as const,
        roleBudgets: qd.roleBudgets.map((rb) => ({
          id: `rb-${fixedProjectId}-${rb.id}`,
          roleId: rb.roleId,
          roleName: rb.roleName,
          quotedHours: rb.quotedHours
        })),
        totalQuotedHours: qd.totalHoursRollup || 0,
        totalExecutedHours: 0,
        progressPercentage: 0
      }));

      const newPrjFixed: ProjectSummaryItem = {
        id: fixedProjectId,
        code: `PRJ-${Math.floor(10 + Math.random() * 90)}`,
        name: fixedName,
        clientId: resolvedClientId || '',
        clientName: resolvedClientName,
        taxEntityId: effectiveTaxEntityId || (clients.find(c => c.id === resolvedClientId)?.taxEntities?.[0]?.id) || null,
        brand: resolvedClientName,
        leadName,
        leadAvatarBg,
        leadRole,
        projectType: 'fixed_project',
        serviceBase: 'Desarrollo & Proyectos Puntuales',
        budgetedHours: fixedDeliverables.reduce((sum, d) => sum + (d.totalHoursRollup || 0), 0),
        soldHours: fixedDeliverables.reduce((sum, d) => sum + (d.totalHoursRollup || 0), 0),
        soldValue: fixedSoldValue > 0 ? fixedSoldValue : undefined,
        soldValueCOP: quoteCurrency === 'COP' && fixedSoldValue > 0 ? fixedSoldValue : undefined,
        soldCurrency: quoteCurrency,
        startDate: undefined, // Se define al «Iniciar proyecto»
        endDate: undefined,
        brief: opp.briefSummary || opp.discoveryNotes,
        briefUrl: opp.briefUrl || null,
        deliverables: newProjectDeliverablesFixed,
        coreTeam: resolvedCoreTeam,
        originOpportunityId: opp.id,
        originQuoteIds: [quote.id],
        hubspotDealId: opp.hubspotDealId || null,
        hubspotDealUrl: opp.hubspotDealUrl || null,
        alegraContactId: opp.administrativeChecklist?.alegraContactId || null,
        driveFolderId: opp.driveFolderId || null,
        driveFolderUrl: opp.driveFolderUrl || null,
        status: 'Activo',
        healthStatus: 'verde',
        scheduleConfig: {
          clientKickoffWaitDays: (payload as any).scheduleConfig?.clientKickoffWaitDays ?? 3,
          includedReworkRounds: (payload as any).scheduleConfig?.includedReworkRounds ?? (payload as any).includedReworkRounds ?? 2,
          reworkRoundDays: (payload as any).scheduleConfig?.reworkRoundDays ?? 5,
          productionWeeks: (payload as any).scheduleConfig?.productionWeeks
        },
        healthNote: 'Proyecto puntual de propuesta mixta ganado en New Business'
      };

      // 2. Proyecto Fee
      const newProjectDeliverablesFee = feeDeliverables.map((qd, idx) => ({
        id: `del-${feeProjectId}-${idx + 1}`,
        projectId: feeProjectId,
        name: qd.name,
        description: qd.description,
        order: qd.order || idx + 1,
        status: 'pending' as const,
        roleBudgets: qd.roleBudgets.map((rb) => ({
          id: `rb-${feeProjectId}-${rb.id}`,
          roleId: rb.roleId,
          roleName: rb.roleName,
          quotedHours: rb.quotedHours
        })),
        totalQuotedHours: qd.totalHoursRollup || 0,
        totalExecutedHours: 0,
        progressPercentage: 0
      }));

      const newPrjFee: ProjectSummaryItem = {
        id: feeProjectId,
        code: `FEE-${Math.floor(10 + Math.random() * 90)}`,
        name: feeName,
        clientId: resolvedClientId || '',
        clientName: resolvedClientName,
        taxEntityId: effectiveTaxEntityId || (clients.find(c => c.id === resolvedClientId)?.taxEntities?.[0]?.id) || null,
        brand: resolvedClientName,
        leadName,
        leadAvatarBg,
        leadRole,
        projectType: 'fee_monthly',
        serviceBase: 'Servicios Recurrentes & Fee Mensual',
        budgetedHours: feeDeliverables.reduce((sum, d) => sum + (d.totalHoursRollup || 0), 0),
        soldHours: feeDeliverables.reduce((sum, d) => sum + (d.totalHoursRollup || 0), 0),
        soldValue: feeSoldTotal > 0 ? feeSoldTotal : undefined,
        soldValueCOP: quoteCurrency === 'COP' && feeSoldTotal > 0 ? feeSoldTotal : undefined,
        soldCurrency: quoteCurrency,
        startDate: undefined, // Se define al «Iniciar proyecto»
        endDate: undefined,
        brief: opp.briefSummary || opp.discoveryNotes,
        briefUrl: opp.briefUrl || null,
        deliverables: newProjectDeliverablesFee,
        coreTeam: resolvedCoreTeam,
        originOpportunityId: opp.id,
        originQuoteIds: [quote.id],
        hubspotDealId: opp.hubspotDealId || null,
        hubspotDealUrl: opp.hubspotDealUrl || null,
        alegraContactId: opp.administrativeChecklist?.alegraContactId || null,
        driveFolderId: opp.driveFolderId || null,
        driveFolderUrl: opp.driveFolderUrl || null,
        status: 'Activo',
        healthStatus: 'verde',
        scheduleConfig: {
          clientKickoffWaitDays: (payload as any).scheduleConfig?.clientKickoffWaitDays ?? 3,
          includedReworkRounds: (payload as any).scheduleConfig?.includedReworkRounds ?? 0, // Fee mensual: sin rondas de ajuste
          reworkRoundDays: (payload as any).scheduleConfig?.reworkRoundDays ?? 5,
          productionWeeks: (payload as any).scheduleConfig?.productionWeeks
        },
        healthNote: 'Proyecto fee mensual de propuesta mixta ganado en New Business'
      };

      projectsToCreate.push(newPrjFixed, newPrjFee);

      historyItemsToCreate.push({
        id: fixedProjectId,
        name: fixedName,
        brand: resolvedClientName,
        tag: 'PRJ',
        status: 'Activo',
        quotedValueCOP: fixedSoldValue > 0 ? `$${fixedSoldValue.toLocaleString('es-CO')} ${quoteCurrency}` : 'Por definir',
        realMarginPercent: null,
        trafficLight: 'verde'
      });

      historyItemsToCreate.push({
        id: feeProjectId,
        name: feeName,
        brand: resolvedClientName,
        tag: 'FEE',
        status: 'Activo',
        quotedValueCOP: feeSoldMonthly > 0 ? `$${feeSoldMonthly.toLocaleString('es-CO')} ${quoteCurrency} / mes` : 'Por definir',
        realMarginPercent: null,
        trafficLight: 'verde'
      });

      // Crear tareas para ambos proyectos
      fixedDeliverables.forEach((qd, dIdx) => {
        const parentDelId = `del-${fixedProjectId}-${dIdx + 1}`;
        qd.backlogItems.forEach((bItem, bIdx) => {
          const activityUser = activeTeam.find((user) => user.id === bItem.suggestedUserId);
          newTasksToCreate.push({
            id: `task-${fixedProjectId}-${dIdx + 1}-${bIdx + 1}`,
            createdAt: new Date().toISOString(),
            title: bItem.title,
            status: 'todo',
            priority: 'Medium',
            projectId: fixedProjectId,
            projectName: fixedName,
            clientName: resolvedClientName,
            deliverableId: parentDelId,
            frente: qd.name,
            board: fixedName,
            department: 'Operaciones',
            date: new Date().toISOString().slice(0, 10),
            dueDate: '', // Se programa al «Iniciar proyecto»
            dueStatus: 'normal',
            dueText: 'Se programa al iniciar el proyecto',
            budgetedHours: bItem.estimatedHours || 0,
            consumedSeconds: 0,
            completed: false,
            budgetedRole: bItem.roleName,
            budgetedRoleId: bItem.roleId,
            assigneeIds: activityUser ? [activityUser.id] : [],
            assignee: activityUser ? {
              id: activityUser.id,
              name: activityUser.name,
              role: bItem.roleName,
              avatarBg: activityUser.avatarBg || 'bg-[#501f92]',
              initials: activityUser.initials || activityUser.name.slice(0, 2).toUpperCase()
            } : {
              id: undefined,
              name: `Sin asignar (${bItem.roleName})`,
              role: bItem.roleName,
              avatarBg: 'bg-[#94a3b8]',
              initials: '--'
            }
          });
        });
      });

      feeDeliverables.forEach((qd, dIdx) => {
        const parentDelId = `del-${feeProjectId}-${dIdx + 1}`;
        qd.backlogItems.forEach((bItem, bIdx) => {
          const activityUser = activeTeam.find((user) => user.id === bItem.suggestedUserId);
          newTasksToCreate.push({
            id: `task-${feeProjectId}-${dIdx + 1}-${bIdx + 1}`,
            createdAt: new Date().toISOString(),
            title: bItem.title,
            status: 'todo',
            priority: 'Medium',
            projectId: feeProjectId,
            projectName: feeName,
            clientName: resolvedClientName,
            deliverableId: parentDelId,
            frente: qd.name,
            board: feeName,
            department: 'Operaciones',
            date: new Date().toISOString().slice(0, 10),
            dueDate: '', // Se programa al «Iniciar proyecto»
            dueStatus: 'normal',
            dueText: 'Se programa al iniciar el proyecto',
            budgetedHours: bItem.estimatedHours || 0,
            consumedSeconds: 0,
            completed: false,
            budgetedRole: bItem.roleName,
            budgetedRoleId: bItem.roleId,
            assigneeIds: activityUser ? [activityUser.id] : [],
            assignee: activityUser ? {
              id: activityUser.id,
              name: activityUser.name,
              role: bItem.roleName,
              avatarBg: activityUser.avatarBg || 'bg-[#501f92]',
              initials: activityUser.initials || activityUser.name.slice(0, 2).toUpperCase()
            } : {
              id: undefined,
              name: `Sin asignar (${bItem.roleName})`,
              role: bItem.roleName,
              avatarBg: 'bg-[#94a3b8]',
              initials: '--'
            }
          });
        });
      });
    } else {
      // Caso A o B: Todos los servicios aprobados son de la misma modalidad
      const newProjectId = `prj-${Date.now()}`;
      const approvedDeliverables = quote.deliverables.filter(isDeliverableApproved);
      const codePrefix = payload.projectName.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRJ') || 'PRJ';

      const approvedCommercial = commercialItems.filter((ci) => (payload.approvedServiceIds || []).includes(ci.serviceId));
      const rawSoldValue = approvedCommercial.length > 0
        ? approvedCommercial.reduce((sum, ci) => sum + (ci.modality === 'fixed_project' ? (ci.totalValue || 0) : ((ci.monthlyValue || 0) * (ci.monthsDuration || 0))), 0)
        : (quote.totalQuotedValue || quote.totalQuotedValueCOP || 0);

      const soldValue = rawSoldValue > 0 ? rawSoldValue : undefined;
      const soldValueCOP = quoteCurrency === 'COP' && rawSoldValue > 0 ? rawSoldValue : undefined;

      const newProjectDeliverables = approvedDeliverables.map((qd, idx) => ({
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
        clientId: resolvedClientId || '',
        clientName: resolvedClientName,
        taxEntityId: effectiveTaxEntityId || (clients.find(c => c.id === resolvedClientId)?.taxEntities?.[0]?.id) || null,
        brand: resolvedClientName,
        leadName,
        leadAvatarBg,
        leadRole,
        projectType: payload.projectType,
        serviceBase: payload.projectType === 'fee_monthly' ? 'Servicios Recurrentes' : 'Desarrollo & Estrategia',
        budgetedHours: approvedDeliverables.reduce((sum, d) => sum + (d.totalHoursRollup || 0), 0),
        soldHours: approvedDeliverables.reduce((sum, d) => sum + (d.totalHoursRollup || 0), 0),
        soldValue,
        soldValueCOP,
        soldCurrency: quoteCurrency,
        startDate: undefined, // Se define al «Iniciar proyecto»
        endDate: undefined,
        brief: opp.briefSummary || opp.discoveryNotes,
        briefUrl: opp.briefUrl || null,
        deliverables: newProjectDeliverables,
        coreTeam: resolvedCoreTeam,
        originOpportunityId: opp.id,
        originQuoteIds: [quote.id],
        hubspotDealId: opp.hubspotDealId || null,
        hubspotDealUrl: opp.hubspotDealUrl || null,
        alegraContactId: opp.administrativeChecklist?.alegraContactId || null,
        driveFolderId: opp.driveFolderId || null,
        driveFolderUrl: opp.driveFolderUrl || null,
        status: 'Activo',
        healthStatus: 'verde',
        scheduleConfig: {
          clientKickoffWaitDays: (payload as any).scheduleConfig?.clientKickoffWaitDays ?? 3,
          includedReworkRounds: (payload as any).scheduleConfig?.includedReworkRounds ?? (payload as any).includedReworkRounds ?? 2,
          reworkRoundDays: (payload as any).scheduleConfig?.reworkRoundDays ?? 5,
          productionWeeks: (payload as any).scheduleConfig?.productionWeeks
        },
        healthNote: 'Proyecto recién ganado y aprobado en New Business'
      };

      projectsToCreate.push(newPrj);

      historyItemsToCreate.push({
        id: newProjectId,
        name: payload.projectName,
        brand: resolvedClientName,
        tag: payload.projectType === 'fee_monthly' ? 'FEE' : 'PRJ',
        status: 'Activo',
        quotedValueCOP: rawSoldValue > 0 ? `$${rawSoldValue.toLocaleString('es-CO')} ${quoteCurrency}` : 'Por definir',
        realMarginPercent: null,
        trafficLight: 'verde'
      });

      // Crear tareas para los entregables aprobados
      approvedDeliverables.forEach((qd, dIdx) => {
        const parentDelId = `del-${newProjectId}-${dIdx + 1}`;
        qd.backlogItems.forEach((bItem, bIdx) => {
          const activityUser = activeTeam.find((user) => user.id === bItem.suggestedUserId);
          newTasksToCreate.push({
            id: `task-${newProjectId}-${dIdx + 1}-${bIdx + 1}`,
            createdAt: new Date().toISOString(),
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
            dueDate: '', // Se programa al «Iniciar proyecto»
            dueStatus: 'normal',
            dueText: 'Se programa al iniciar el proyecto',
            budgetedHours: bItem.estimatedHours || 0,
            consumedSeconds: 0,
            completed: false,
            budgetedRole: bItem.roleName,
            budgetedRoleId: bItem.roleId,
            assigneeIds: activityUser ? [activityUser.id] : [],
            assignee: activityUser ? {
              id: activityUser.id,
              name: activityUser.name,
              role: bItem.roleName,
              avatarBg: activityUser.avatarBg || 'bg-[#501f92]',
              initials: activityUser.initials || activityUser.name.slice(0, 2).toUpperCase()
            } : {
              id: undefined,
              name: `Sin asignar (${bItem.roleName})`,
              role: bItem.roleName,
              avatarBg: 'bg-[#94a3b8]',
              initials: '--'
            }
          });
        });
      });
    }

    // Ronda 2: el proyecto guarda quién es el Comercial responsable (owner de la oportunidad) y la
    // Relación con clientes de la cuenta, para que les lleguen las alertas (p. ej. tareas bloqueadas).
    {
      const commercialUser = users.find((u) => u.id === opp.commercialOwner || u.name === opp.commercialOwner);
      const accountClient = clients.find((c) => c.id === resolvedClientId);
      projectsToCreate.forEach((p) => {
        p.commercialOwnerId = commercialUser?.id || p.commercialOwnerId;
        p.commercialOwnerName = commercialUser?.name || opp.commercialOwner || p.commercialOwnerName;
        if (!p.accountManagerName && accountClient?.accountManagerName) {
          p.accountManagerId = accountClient.accountManagerId;
          p.accountManagerName = accountClient.accountManagerName;
        }
      });
    }

    // Responsable de cliente (23 Nov 2026): el del cliente si ya existe; si no, quien tenga Relación con
    // clientes (Client Relationship); si no hay, el comercial de la oportunidad. Nunca queda vacío.
    const relationshipUser = users.find((u) => u.status === 'Active' && u.accessLevel === 'client_relationship');
    const ownerFallback = users.find((u) => u.id === opp.commercialOwner || u.name === opp.commercialOwner);
    const defaultAccountManager = relationshipUser || ownerFallback;
    projectsToCreate.forEach((p) => {
      if (!p.accountManagerName && defaultAccountManager) {
        p.accountManagerId = defaultAccountManager.id;
        p.accountManagerName = defaultAccountManager.name;
      }
    });

    // Actualizar Cliente en ECO
    if (!resolvedClientId) {
      resolvedClientId = `cli-${Date.now()}`;
      projectsToCreate.forEach((p) => { p.clientId = resolvedClientId!; });

      const newClient: ClientProfile = {
        id: resolvedClientId,
        name: resolvedClientName,
        status: 'active',
        type: isMixed ? 'Proyecto único' : (payload.projectType === 'fee_monthly' ? 'Fee mensual' : 'Proyecto único'),
        hubspotCompanyId: opp.hubspotCompanyId || undefined,
        accountManagerId: defaultAccountManager?.id,
        accountManagerName: defaultAccountManager?.name,
        projectsCount: projectsToCreate.length,
        activeProjectsCount: projectsToCreate.length,
        projectsHistory: historyItemsToCreate,
        taxEntities: effectiveTaxEntityId ? [
          {
            id: effectiveTaxEntityId,
            businessName: resolvedClientName,
            nit: '',
            billingEmail: opp.administrativeChecklist?.billingEmail || opp.contactEmail || undefined,
            alegraCreated: opp.administrativeChecklist?.alegraCreated || false,
            alegraContactId: opp.administrativeChecklist?.alegraContactId || undefined,
            alegraContactUrl: opp.administrativeChecklist?.alegraContactUrl || undefined,
            isPrimary: true
          }
        ] : [],
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
        projectsToCreate.forEach((p) => { p.clientName = existing.name; });
        setClients((prev) =>
          prev.map((c) => {
            if (c.id === resolvedClientId) {
              const updatedTaxEntities = [...(c.taxEntities || [])];
              if (effectiveTaxEntityId && !updatedTaxEntities.some(te => te.id === effectiveTaxEntityId)) {
                updatedTaxEntities.push({
                  id: effectiveTaxEntityId,
                  businessName: c.name,
                  nit: '',
                  billingEmail: opp.administrativeChecklist?.billingEmail || opp.contactEmail || undefined,
                  alegraCreated: opp.administrativeChecklist?.alegraCreated || false,
                  alegraContactId: opp.administrativeChecklist?.alegraContactId || undefined,
                  alegraContactUrl: opp.administrativeChecklist?.alegraContactUrl || undefined,
                  isPrimary: updatedTaxEntities.length === 0
                });
              }
              const currentHistory = c.projectsHistory || [];
              const updatedHistory = [...historyItemsToCreate, ...currentHistory];

              return {
                ...c,
                hubspotCompanyId: c.hubspotCompanyId || opp.hubspotCompanyId || undefined,
                accountManagerId: c.accountManagerName ? c.accountManagerId : defaultAccountManager?.id,
                accountManagerName: c.accountManagerName || defaultAccountManager?.name,
                taxEntities: updatedTaxEntities,
                projectsCount: (c.projectsCount || 0) + projectsToCreate.length,
                activeProjectsCount: (c.activeProjectsCount || 0) + projectsToCreate.length,
                projectsHistory: updatedHistory
              };
            }
            return c;
          })
        );
      }
    }

    // Agregar proyectos a la lista
    setProjectsList((prev) => [...projectsToCreate, ...prev]);

    // Agregar tareas operativas
    if (newTasksToCreate.length > 0) {
      setTasks((prev) => [...newTasksToCreate, ...prev]);
    }

    // Actualizar oportunidad a ganada y vincularla a los proyectos
    const mainCreatedProjectId = projectsToCreate[0]?.id || `prj-${Date.now()}`;

    const updatedOpp: NewBusinessOpportunity = {
      ...opp,
      status: 'won',
      convertedProjectId: mainCreatedProjectId,
      convertedAt: new Date().toISOString(),
      clientId: resolvedClientId,
      quotes: opp.quotes.map((q) =>
        q.id === quote.id
          ? {
              ...q,
              status: 'approved',
              convertedToProjectId: mainCreatedProjectId,
              commercialStructure: q.commercialStructure?.map((item) => ({
                ...item,
                approved: (payload.approvedServiceIds || []).includes(item.serviceId)
              }))
            }
          : q
      )
    };

    setOpportunities((prev) =>
      prev.map((o) => (o.id === opp.id ? updatedOpp : o))
    );

    setSelectedProjectIdForView(mainCreatedProjectId);
  };

  // Guardar cotización en oportunidad existente de New Business
  const handleSaveQuoteToOpportunity = (opportunityId: string, quote: QuoteProposal) => {
    const current = getOperationalQuote(opportunities.find((item) => item.id === opportunityId));
    const targetQuoteId = current?.id || quote.id;
    const importedTemplate = productTemplates.find((item) => item.id === quote.templateId);
    // Semanas precargadas desde la plantilla (editables por el líder)
    const service = serviceDraftFromTemplate(importedTemplate, quote.id,
      quote.deliverables.map((_, index) => `qdel-import-${quote.id}-${index}`));
    setScopeUi((previous) => ({ ...previous, [targetQuoteId]: { saved: false,
      services: [...(previous[targetQuoteId]?.services || []).filter((item) => item.id !== service.id), service] } }));
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === opportunityId) {
          const current = getOperationalQuote(opp);
          const suggested = suggestActivityOwners(quote.deliverables, usersWithLoad, current?.deliverables || []);
          const imported = suggested.map((del, index) => {
            const id = `qdel-import-${quote.id}-${index}`;
            return { ...del, id, quoteId: current?.id || quote.id,
              order: (current?.deliverables.length || 0) + index + 1,
              roleBudgets: del.roleBudgets.map((budget, budgetIndex) => ({ ...budget,
                id: `${id}-rb-${budgetIndex}`, quoteDeliverableId: id })),
              backlogItems: del.backlogItems.map((activity, activityIndex) => ({ ...activity,
                id: `${id}-act-${activityIndex}`, quoteDeliverableId: id, order: activityIndex + 1,
                suggestedUserId: activity.suggestedUserId, suggestedUserName: activity.suggestedUserName })) };
          });
          const deliverables = [...(current?.deliverables || []), ...imported];
          const updatedQuote: QuoteProposal = { ...(current || quote), deliverables,
            totalHoursRollup: deliverables.reduce((total, del) => total + del.backlogItems.reduce((sum, activity) => sum + activity.estimatedHours, 0), 0),
            updatedAt: new Date().toISOString() };
          return {
            ...withOperationalQuote(opp, updatedQuote),
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
      leadUserId: string;
      leadUserName?: string;
    },
    quote: QuoteProposal
  ) => {
    const mainLead = users.find((user) => user.id === opportunityData.leadUserId && isEligibleScopingLeader(user));
    if (!mainLead) return;
    const newOpportunityId = quote.opportunityId || `opp-${Date.now()}`;
    const finalizedQuote: QuoteProposal = {
      ...quote,
      deliverables: quote.templateId ? suggestActivityOwners(quote.deliverables, usersWithLoad) : quote.deliverables,
      opportunityId: newOpportunityId
    };

    if (quote.templateId) {
      const importedTemplate = productTemplates.find((item) => item.id === quote.templateId);
      setScopeUi((previous) => ({ ...previous, [finalizedQuote.id]: { saved: false, services: [
        serviceDraftFromTemplate(importedTemplate, quote.id, quote.deliverables.map((item) => item.id))
      ] } }));
    }
    const newOpp: NewBusinessOpportunity = {
      id: newOpportunityId,
      title: opportunityData.title,
      type: 'new_client',
      prospectAccountName: opportunityData.prospectAccountName || 'Prospecto New Business',
      leadUserId: mainLead.id,
      leadUserName: mainLead.name,
      status: 'quoting',
      quotes: [finalizedQuote],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      briefSummary: 'Oportunidad generada desde plantilla.'
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

  // Update user profile and permissions
  const handleUpdateUser = (updatedUser: UserItem) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  // Calculate live logged hours today from timesheets (strictly currentUser + today)
  const todayTimeLogs = (() => {
    const now = new Date();
    const monthsShort = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const todayShortStr = `${now.getDate()} ${monthsShort[now.getMonth()]}`;
    const todayIsoStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const cId = currentUser?.id?.toLowerCase();
    const cName = currentUser?.name?.toLowerCase();

    return timeLogs.filter((l) => {
      const matchesUser = !currentUser
        ? true
        : (l.userId && l.userId.toLowerCase() === cId) ||
          (l.userName && cName && l.userName.toLowerCase().includes(cName));
      if (!matchesUser) return false;
      const dLow = (l.date || '').toLowerCase().trim();
      return dLow.startsWith('hoy') || dLow.includes(todayShortStr) || dLow.includes(todayIsoStr);
    });
  })();

  const loggedHoursToday = Number(
    todayTimeLogs.reduce((acc, log) => acc + (log.durationSeconds || 0) / 3600, 0).toFixed(1)
  );

  // ── Racha de días cargados y «Cerrar mi día» (dayStreak.ts) ──
  const targetDayHoursValue = Number(((currentUser?.capacityHours || 42) / 5).toFixed(1));
  const todayIsoKey = toIsoLocal(new Date());
  const [isDayCloseOpen, setIsDayCloseOpen] = useState(false);
  const [dayClosedTick, setDayClosedTick] = useState(0);
  useEffect(() => {
    const h = () => setDayClosedTick((n) => n + 1);
    window.addEventListener(DAY_CLOSED_EVENT, h);
    return () => window.removeEventListener(DAY_CLOSED_EVENT, h);
  }, []);
  const myAbsentDays = React.useMemo(() => {
    const set = new Set<string>();
    for (const a of absenceEvents) {
      if (a.userId !== currentUser?.id || a.status !== 'active') continue;
      const d = new Date(`${a.startDate}T00:00:00`);
      const end = new Date(`${a.endDate || a.startDate}T00:00:00`);
      for (let i = 0; d <= end && i < 120; i++) {
        set.add(toIsoLocal(d));
        d.setDate(d.getDate() + 1);
      }
    }
    return set;
  }, [absenceEvents, currentUser?.id]);
  const myStreak = React.useMemo(
    () => computeStreak({ hours: hoursByDay(timeLogs, currentUser), targetDayHours: targetDayHoursValue, absentDays: myAbsentDays }),
    [timeLogs, currentUser, targetDayHoursValue, myAbsentDays]
  );
  const dayClosedToday = React.useMemo(
    () => isDayClosed(currentUser?.id, todayIsoKey),
    [currentUser?.id, todayIsoKey, dayClosedTick]
  );
  const myTodayLogs = timeLogs.filter((l) => isOwnLog(l, currentUser) && logIsoDate(l) === todayIsoKey);
  const dayCloseSuggestions = React.useMemo(() => {
    if (!currentUser) return [];
    const matches = makePersonMatcher(currentUser, users);
    const loggedTaskIds = new Set(myTodayLogs.map((l) => l.taskId));
    return tasks.filter((t) => !t.completed && isTaskOwner(t, currentUser, matches) && isScheduledForDay(t, todayIsoKey) && !loggedTaskIds.has(t.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, currentUser, users, timeLogs, todayIsoKey]);
  const handleConfirmDayClose = () => {
    markDayClosed(currentUser?.id, todayIsoKey);
    setIsDayCloseOpen(false);
    const streakNow = myStreak.current;
    window.dispatchEvent(
      new CustomEvent('orbit-mascot-reaction', {
        detail: {
          action: 'celebrate',
          phrase: myStreak.todayCounts
            ? `¡Día cerrado! 🔥 ${streakLabel(streakNow)} con tu día cargado. ¡A descansar!`
            : '¡Día cerrado! Mañana vamos por la racha 🔥 ¡A descansar!'
        }
      })
    );
  };

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
      userId: currentUser?.id,
      budgetedRoleId: 'Creative Designer',
      source: 'manual',
      createdAt: new Date().toISOString(),
      userName: currentUser?.name,
      userInitials: (currentUser?.name || '').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
      userAvatarBg: '#501f92',
      isLiveTimer: false,
      date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs',
      durationSeconds: durationSeconds
    };
    setTimeLogs((prev) => [newLog, ...prev]);
  };

  const getHeaderSection = (): string | undefined => {
    if (['mi-dia', 'dashboard', 'proyectos', 'tareas', 'capacidad', 'timesheets'].includes(currentView)) return 'Operación';
    if (['finanzas', 'new-business', 'clientes', 'plantillas-producto'].includes(currentView)) return 'Comercial';
    if (currentView === 'la-colonia') return 'Experiencia';
    if (['licencias', 'hardware'].includes(currentView)) return 'Costos de operación';
    if (['usuarios', 'config-roles', 'config-permisos'].includes(currentView)) return 'Sistema';
    return undefined;
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'mi-dia':
        return 'Mi Día';
      case 'la-colonia':
        return 'La Colonia';
      case 'dashboard':
        return 'Dashboard';
      case 'proyectos':
        return 'Proyectos';
      case 'tareas':
        return 'Tareas';
      case 'timesheets':
        return 'Registro de Tiempos';
      case 'capacidad':
        return 'Capacidad';
      case 'clientes':
        return 'Clientes';
      case 'plantillas-producto':
        return 'Servicios';
      case 'new-business':
        return 'New Business';
      case 'finanzas':
        return 'Dirección y Finanzas';
      case 'hardware':
        return 'Hardware';
      case 'licencias':
        return 'Licencias';
      case 'el-muro':
        return 'El Muro';
      case 'reportes':
        return 'Reportes';
      case 'nova-ia':
        return 'Nova IA';
      case 'usuarios':
        return 'Equipo & Accesos';
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

  const sowOpportunity = opportunities.find((item) => item.id === sowOpportunityId);
  const sowQuote = getOperationalQuote(sowOpportunity);
  const sowClient = clients.find((client) => client.id === sowOpportunity?.clientId);

  return (
    <div className="orbit-saas-root min-h-screen bg-[#0d0718] text-white selection:bg-[#ddd6fe] selection:text-[#0f172a] flex flex-col flex-1">
      {sowOpportunity && sowQuote && (
        <SOWModal key={sowOpportunity.id} isOpen opportunity={sowOpportunity} quote={sowQuote}
          client={sowClient} documentVersion={sowVersions[sowOpportunity.id] || '1.0'}
          onChangeDocumentVersion={(version) => setSowVersions((previous) => ({ ...previous, [sowOpportunity.id]: version }))}
          onClose={() => setSowOpportunityId(null)}
          onSaveSOWData={(sowData) => setOpportunities((previous) => previous.map((item) =>
            item.id === sowOpportunity.id ? { ...item, sowData: { ...item.sowData, ...sowData }, updatedAt: new Date().toISOString() } : item))} />
      )}
      {/* SaaS Live Demo Utility Bar (Compact single header) — oculta instalada como app */}
      {!ecoAppMode && (
      <section className="bg-gradient-to-r from-[#1b0d33] to-[#0d0718] py-2.5 px-4 sm:px-6 lg:px-8 border-b border-[#261845]/60">
        <div className="max-w-[1880px] w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f2ecfb] text-[#501f92] text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-[#501f92]" />
              <span>ECO</span>
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
      )}

      {/* Main SaaS Canvas Box (instalada como app: a pantalla completa, sin marco de demo) */}
      <main className={ecoAppMode ? 'w-full flex-1 flex flex-col min-h-0 pt-[env(safe-area-inset-top)]' : 'max-w-[1880px] w-full mx-auto px-2 sm:px-4 lg:px-6 mt-3 pb-8 flex-1 flex flex-col min-h-0'}>
        <div className={`bg-[#f9fafb] overflow-hidden flex flex-col flex-1 ${ecoAppMode ? 'min-h-[100dvh]' : 'rounded-2xl border border-[#261845] shadow-2xl min-h-[calc(100vh-140px)]'} ${
          saasFont === 'jakarta' ? 'font-saas' : saasFont === 'inter' ? 'font-inter' : 'font-montserrat'
        }`}>
          {/* Top Prototype Navigation Chrome (solo en la demo, no instalada como app) */}
          {!ecoAppMode && (
          <div className="bg-[#140b24] px-5 py-2.5 border-b border-[#261845] flex items-center justify-between text-xs text-[#c9b7ff]/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block" />
              <span className="ml-3 font-mono font-bold text-white text-[11px]">
                app.uhuragroup.com / {currentView}
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
          )}

          {/* Prototype App Body */}
          <div className="flex-1 flex overflow-hidden relative min-h-0">
            {/* Sidebar Desktop (Hidden on mobile and tablet < lg so dashboard doesn't cramp) */}
            <div className="hidden lg:flex flex-col shrink-0 self-stretch min-h-full">
              <TaskflowSidebar
                currentView={currentView}
                onSelectView={handleSelectView}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                currentUser={currentUser}
              />
            </div>

            {/* En móvil y tablet la navegación es la barra inferior + «Más» (sin menú hamburguesa). */}

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col ${currentView === 'la-colonia' ? 'bg-[#0a0418]' : 'bg-[#f8fafc]'} min-w-0 overflow-y-auto`}>
              {/* Header with live timer capsule & global task search */}
              <TaskflowHeader
                currentViewTitle={getHeaderTitle()}
                currentViewSection={getHeaderSection()}
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
                todayTimeLogs={todayTimeLogs}
                onOpenManualLog={() => handleOpenManualLogWithTask()}
                onNavigateToCapacity={() => handleSelectView('capacidad')}
                targetDayHours={Number(((currentUser?.capacityHours || 42) / 5).toFixed(1))}
                currentUser={currentUser}
                isDarkTheme={false}
                alerts={activeAlerts}
                onUpdateAlerts={setActiveAlerts}
                onOpenMyProfile={() => setIsMyProfileModalOpen(true)}
                onSelectTask={(task) => {
                  setSelectedTaskForDetail(task);
                  setIsTaskDetailModalOpen(true);
                }}
              />

              {/* View Content with RBAC Protection */}
              <div className={currentView === 'la-colonia' ? 'p-0 flex-1 flex flex-col min-h-0' : 'p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 flex-1'}>
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
                    currentUser={currentUser}
                    users={users}
                    absenceEvents={absenceEvents}
                    timeLogs={timeLogs}
                    onDeleteTimeLog={handleDeleteTimeLog}
                    activeTimer={activeTimer}
                    onStartTimer={handleStartTimer}
                    onPauseResumeTimer={handlePauseResumeTimer}
                    onStopTimer={handleStopTimer}
                    onOpenTaskDetail={handleOpenTaskDetail}
                    onOpenManualLog={handleOpenManualLogWithTask}
                    onToggleTask={handleToggleTask}
                    onQuickLogHours={handleQuickLogHours}
                    loggedHoursToday={loggedHoursToday}
                    targetDayHours={Number(((currentUser?.capacityHours || 42) / 5).toFixed(1))}
                    onNavigateToView={handleSelectView}
                    onOpenOpportunity={(id, tab) => {
                      handleSelectView('new-business');
                      setNewBusinessFocus({ id, tab, nonce: Date.now() });
                    }}
                    onOpenProject={(projectId) => {
                      setSelectedProjectIdForView(projectId);
                      setCurrentView('proyectos');
                    }}
                    streakDays={myStreak.current}
                    streakTodayCounts={myStreak.todayCounts}
                    isDayClosedToday={dayClosedToday}
                    onOpenDayClose={() => setIsDayCloseOpen(true)}
                    opportunities={opportunities}
                    projects={projectsList}
                    clients={clients}
                    onUpdateUser={handleUpdateUser}
                  />
                )}

                {/* 0.1 LA COLONIA · HÁBITAT EXPERIENCIAL DE BUCKY */}
                {currentView === 'la-colonia' && (
                  <LaColoniaView
                    tasks={tasks}
                    loggedHoursToday={loggedHoursToday}
                    targetDayHours={Number(((currentUser?.capacityHours || 42) / 5).toFixed(1))}
                    plannedHoursToday={4.0}
                    currentUser={currentUser}
                    teamUsers={users}
                    timeLogs={timeLogs}
                    absenceEvents={absenceEvents}
                    onNavigateToView={handleSelectView}
                    onUpdateUser={handleUpdateUser}
                    timerRunning={!!activeTimer && !activeTimer.isPaused}
                  />
                )}

                {/* COSTOS DE OPERACIÓN */}
                {currentView === 'hardware' && (
                  <HardwareView
                    assets={hardwareAssets}
                    users={users}
                    projects={projectsList}
                    services={productTemplates.map((t) => ({ id: t.id, name: t.name, code: (t as any).code }))}
                    canEdit={can(currentUser, 'edit', 'costos-operacion')}
                    onChange={setHardwareAssets}
                  />
                )}
                {currentView === 'licencias' && (
                  <LicensesView
                    licenses={softwareLicenses}
                    users={users}
                    projects={projectsList}
                    canEdit={can(currentUser, 'edit', 'costos-operacion')}
                    onChange={setSoftwareLicenses}
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
                    onUpdateAllTasks={setTasks}
                    clients={clients}
                    onUpdateClient={handleUpdateClient}
                    projectsList={projectsList}
                    currentUser={currentUser}
                    users={users}
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
                    onChangeProjectReviewer={handleChangeProjectReviewer}
                    onArchiveProject={handleArchiveProject}
                    onDeleteProject={handleDeleteProject}
                  />
                )}

                {/* 3. TAREAS */}
                {currentView === 'tareas' && (
                  <MyTasksView
                    tasks={tasks}
                    currentUser={currentUser}
                    users={users}
                    projects={projectsList}
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
                    users={users}
                    currentUser={currentUser}
                    absenceEvents={absenceEvents}
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
                    onViewProjectSow={(projectId) => {
                      const opportunity = opportunities.find((item) => item.convertedProjectId === projectId);
                      if (opportunity) setSowOpportunityId(opportunity.id);
                    }}
                    sowProjectIds={opportunities.flatMap((item) => item.convertedProjectId ? [item.convertedProjectId] : [])}
                    currentUser={currentUser}
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
                    projects={projectsList}
                    onUpdateClient={handleUpdateClient}
                    onCreateClient={handleCreateClient}
                  />
                )}

                {/* 6.5. BIBLIOTECA DE PLANTILLAS MAESTRAS DE PRODUCTO */}
                {currentView === 'plantillas-producto' && (
                  <TemplateLibraryView
                    users={users}
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
                    resetToOverviewSignal={newBusinessResetSignal}
                    focusOpportunity={newBusinessFocus}
                    scopeUi={scopeUi}
                    onChangeScopeUi={(quoteId, state) => setScopeUi((previous) => ({ ...previous, [quoteId]: state }))}
                    onOpenSow={setSowOpportunityId}
                    savedQuotes={savedQuotes}
                    onSetQuoteSaved={(quoteId, signature) => setSavedQuotes((previous) => {
                      const next = { ...previous };
                      if (signature) next[quoteId] = signature;
                      else delete next[quoteId];
                      return next;
                    })}
                    opportunities={opportunities}
                    clients={clients}
                    templates={productTemplates}
                    currentUser={currentUser}
                    users={usersWithLoad}
                    tasks={tasks}
                    timeLogs={timeLogs}
                    activeTimer={activeTimer}
                    onStartTimer={handleStartTimer}
                    onStopTimer={handleStopTimer}
                    onPauseResumeTimer={handlePauseResumeTimer}
                    onOpenManualLog={handleOpenManualLogWithTask}
                    onUpdateOpportunity={(updatedOpp) => {
                      setOpportunities((prev) =>
                        prev.map((o) => (o.id === updatedOpp.id ? updatedOpp : o))
                      );
                    }}
                    onCreateOpportunity={(newOpp) => {
                      const scopingTaskId = `task-scoping-${newOpp.id}`;
                      const slaHours = newOpp.handoffHours || 36;
                      const deadlineDate = new Date(Date.now() + slaHours * 3600 * 1000).toISOString().slice(0, 10);
                      const oppWithTask: NewBusinessOpportunity = {
                        ...newOpp,
                        preventaTimeLogTaskId: scopingTaskId,
                        handoffHours: slaHours
                      };

                      // Dynamic Leader resolution from users
                      const assignedUser = users.find((user) => user.status === 'Active' && user.id === newOpp.leadUserId);
                      if (!assignedUser) {
                        setOpportunities((prev) => [oppWithTask, ...prev]);
                        return;
                      }

                      // Resolución dinámica del proyecto interno de preventa (UHURA Group -> Comercial & Prospección New Business)
                      const matchedProject = projectsList.find(
                        (p) =>
                          (p.brand === 'UHURA Group' || p.clientName === 'UHURA Group' || p.clientId === 'cli-uhu-internal') &&
                          (p.name.toLowerCase().includes('comercial') ||
                            p.name.toLowerCase().includes('new business') ||
                            p.name.toLowerCase().includes('prospección'))
                      ) || {
                        id: 'prj-uhu-3',
                        name: 'Comercial & Prospección New Business',
                        clientName: 'UHURA Group'
                      };

                      // Crear tarea interna en UHURA Group -> Comercial & Prospección New Business
                      const newScopingTask: TaskItem = {
                        id: scopingTaskId,
                        title: `Scoping · ${newOpp.prospectAccountName || 'Cliente'} · ${newOpp.title}`,
                        status: 'todo',
                        priority: 'High',
                        projectId: matchedProject.id,
                        projectName: matchedProject.name,
                        clientName: matchedProject.clientName || 'UHURA Group',
                        department: 'Operaciones',
                        frente: 'Preventa & Scoping',
                        board: 'New Business',
                        date: new Date().toISOString().slice(0, 10),
                        dueDate: deadlineDate,
                        dueStatus: 'normal',
                        dueText: `SLA ~${slaHours}h handoff`,
                        budgetedHours: 4,
                        consumedSeconds: 0,
                        completed: false,
                        budgetedRole: assignedUser.officialRole || assignedUser.jobTitle || assignedUser.professionalRole || 'Product Lead',
                        assignee: {
                          id: assignedUser.id,
                          name: assignedUser.name,
                          role: assignedUser.jobTitle || assignedUser.officialRole || assignedUser.role || 'Leader',
                          avatarBg: assignedUser.avatarBg || 'bg-[#501f92]',
                          initials: assignedUser.initials || assignedUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                        }
                      };

                      setTasks((prev) => [newScopingTask, ...prev]);
                      setOpportunities((prev) => [oppWithTask, ...prev]);
                    }}
                    onNavigateToView={handleSelectView}
                    onConvertOpportunityToProject={handleConvertOpportunityToProject}
                  />
                )}

                {/* 7.5. DIRECCIÓN Y FINANZAS */}
                {currentView === 'finanzas' && (
                  <DireccionFinanzasView
                    opportunities={opportunities}
                    clients={clients}
                    tasks={tasks}
                    timeLogs={timeLogs}
                    currentUser={currentUser}
                    onNavigateToView={handleSelectView}
                  />
                )}

                {/* 8. USUARIOS & PERMISOS */}
                {(currentView === 'usuarios' || currentView === 'config-roles' || currentView === 'config-permisos') && (
                  <UsersView
                    users={users}
                    currentUser={currentUser}
                    onInviteUser={() => setIsInviteModalOpen(true)}
                    onDeleteUser={handleDeleteUser}
                    onUpdateUser={handleUpdateUser}
                    absenceEvents={absenceEvents}
                    onAddAbsenceEvent={(ev) => setAbsenceEvents((prev) => [...prev, ev])}
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
                      Módulo integrado en ECO para análisis predictivo de desvíos en entregas y rentabilidad.
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
          currentUser={currentUser}
        />
      </main>

      {/* Task Detail & Deliverables Modal (COR Visual Split View) */}
      {isTaskDetailModalOpen && selectedTaskForDetail && (
        <ErrorBoundary
          fallbackTitle="Error al abrir el detalle de la tarea"
          onReset={() => setIsTaskDetailModalOpen(false)}
        >
          <TaskDetailModal
            isOpen={isTaskDetailModalOpen}
            onClose={() => { setIsTaskDetailModalOpen(false); setTaskDetailFocus(null); }}
            task={selectedTaskForDetail}
            users={users}
            onUpdateReviewers={handleUpdateTaskReviewers}
            onUpdateReviewSettings={handleUpdateReviewSettings}
            onReviewDecision={handleReviewDecision}
            absenceEvents={absenceEvents}
            focusSection={taskDetailFocus}
            currentUser={currentUser}
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
            onDuplicateTask={handleDuplicateTask}
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
        </ErrorBoundary>
      )}

      {/* Manual Time Log Modal (Rendered with z-60 above TaskDetailModal) */}
      {isManualLogModalOpen && (
        <ManualTimeLogModal
          isOpen={isManualLogModalOpen}
          onClose={() => setIsManualLogModalOpen(false)}
          tasks={tasks}
          defaultTaskId={manualLogDefaultTaskId}
          onSaveManualLog={handleSaveManualLog}
        />
      )}

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
        users={users}
        templates={productTemplates}
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

      {/* Modal para detener y registrar el timer (Revisión y ajuste previo) */}
      <StopTimerRegisterModal
        isOpen={isStopTimerModalOpen}
        activeTimer={activeTimer}
        task={activeTimer ? tasks.find((t) => t.id === activeTimer.taskId) || null : null}
        onCloseAndResume={handleResumeTimerFromModal}
        onDiscardSession={handleDiscardTimerSession}
        onConfirmRegistration={handleConfirmTimerRegistration}
      />

      {/* Timer Summary Modal on Stop (Confirmación posterior al registro) */}
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

      {/* Cerrar mi día con ECO */}
      <DayCloseModal
        isOpen={isDayCloseOpen}
        onClose={() => setIsDayCloseOpen(false)}
        todayLabel={new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        todayLogs={myTodayLogs}
        suggestedTasks={dayCloseSuggestions}
        loggedHours={loggedHoursToday}
        targetDayHours={targetDayHoursValue}
        streak={myStreak.current}
        todayCounts={myStreak.todayCounts}
        todayIsWorkday={myStreak.todayIsWorkday}
        alreadyClosed={dayClosedToday}
        onAddTime={(taskId) => {
          setIsDayCloseOpen(false);
          handleOpenManualLogWithTask(taskId);
        }}
        onConfirm={handleConfirmDayClose}
      />

      {/* Floating Beaver Mascot Companion (Codex-Style Interactive Character with Vida Propia) */}
      <FloatingBeaverWidget
        currentView={currentView}
        loggedHoursToday={loggedHoursToday}
        targetDayHours={Number(((currentUser?.capacityHours || 42) / 5).toFixed(1))}
        onQuickLogHours={handleQuickLogHours}
        onNavigateToView={handleSelectView}
        isDayClosedToday={dayClosedToday}
        onOpenDayClose={() => setIsDayCloseOpen(true)}
        tasks={tasks}
        users={users}
        absenceEvents={absenceEvents}
        activeTimer={activeTimer}
        onUpdateUser={handleUpdateUser}
        currentUser={currentUser}
      />

      {/* Modal de Perfil Personal (Solo usuario autenticado, desde Header) */}
      <TeamHumanProfileModal
        isOpen={isMyProfileModalOpen}
        onClose={() => setIsMyProfileModalOpen(false)}
        users={users}
        selectedUserId={currentUser?.id}
        onUpdateUser={handleUpdateUser}
        currentUser={currentUser}
        singleUserMode={true}
      />

      {/* Herramienta de QA / Simulación de Roles & Permisos (RBAC Bloque 3) */}
      {phaseOverflowPrompt && (
        <PhaseOverflowModal
          taskTitle={phaseOverflowPrompt.taskTitle}
          overflow={phaseOverflowPrompt.overflow}
          onExtend={handleExtendPhaseForTask}
          onKeepTaskOnly={() => setPhaseOverflowPrompt(null)}
        />
      )}

      <DevQaRoleSimulator
        currentUser={currentUser}
        availableUsers={users}
        onSelectUser={setCurrentUser}
      />
    </div>
  );
};
