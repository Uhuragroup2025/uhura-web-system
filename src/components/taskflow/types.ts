export type OrbitView =
  | 'dashboard'
  | 'proyectos'
  | 'tareas'
  | 'timesheets'
  | 'capacidad'
  | 'clientes'
  | 'cotizador'
  | 'finanzas'
  | 'el-muro'
  | 'reportes'
  | 'nova-ia'
  | 'config-roles'
  | 'config-permisos'
  | 'usuarios'
  | 'portal-cliente';

export type TaskFlowView = OrbitView | 'board' | 'tasks' | 'users' | 'settings' | 'projects';

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'In Progress' | 'Done' | 'To Do' | 'Review';

export type TaskCategoryType = 'client' | 'internal';

export type ProjectType = 'fee_monthly' | 'fixed_milestones' | 'internal';

export type ProjectPhase =
  | 'Discovery & Arquitectura'
  | 'UI/UX & Prototipado'
  | 'Implementación / Dev'
  | 'QA & Testing'
  | 'Despliegue & Cierre'
  | string;

export interface ProjectPhaseItem {
  id: string;
  name: string;
  order: number;
  startDate?: string;
  endDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  description?: string;
  color?: string;
}

export interface ProjectSummaryItem {
  id: string;
  name: string;
  clientName: string;
  brand?: string;
  leadName: string;
  leadAvatarBg: string;
  projectType: ProjectType;
  serviceBase: string;
  budgetedHours: number;
  soldHours?: number;
  soldValueCOP?: number;
  soldCurrency?: 'COP' | 'USD';
  startDate?: string;
  endDate?: string;
  brief?: string;
  teamMembers?: { name: string; role?: string; avatarBg: string; initials?: string }[];
  status: 'Activo' | 'En Pausa' | 'Cerrado' | 'Planificación';
  healthStatus: 'verde' | 'amarillo' | 'rojo';
  healthNote?: string;
  hasPhasesAndBacklog?: boolean;
  phasesList?: ProjectPhaseItem[];
}

export type FeeActivityCategory =
  | 'Mantenimiento Web'
  | 'Parrilla & Redes'
  | 'Growth & Pauta'
  | 'Soporte Continuo';

export type BlockerReason =
  | 'client_inputs'      // Esperando insumos o feedback del Cliente
  | 'dependency'         // Bloqueado por tarea / entrega anterior
  | 'scope_creep'        // Ajustes fuera de brief / alcance
  | 'team_capacity'      // Sobrecarga de capacidad del equipo
  | 'external_blocker'   // Problema técnico / pasarela externa
  | 'other';             // Otro motivo

export interface TaskBlockerInfo {
  isBlocked: boolean;
  reason?: BlockerReason;
  reasonText?: string;
  responsibleParty?: 'Cliente' | 'Uhura / Interno' | 'Tercero' | 'Tercero / Proveedor';
  blockedDays?: number;
  blockedAt?: string;
  unblockedAt?: string;
  resolvedAt?: string;
  notes?: string;
}

export interface TaskDeliverable {
  id: string;
  taskId: string;
  url?: string;
  urls?: string[];
  title?: string;
  submittedAt: string;
  submittedBy: string;
  status?: 'submitted' | 'approved' | 'changes_requested';
  notes?: string;
  taggedReviewer?: string;
  taggedReviewers?: string[];
  criteriaChecked?: string[];
}

export interface TimeLog {
  id: string;
  taskId: string;
  taskTitle: string;
  clientName: string;
  projectName: string;
  userName: string;
  userInitials: string;
  userAvatarBg: string;
  categoryType?: TaskCategoryType;
  durationSeconds: number;
  startTime?: string;
  endTime?: string;
  isLiveTimer: boolean;
  date: string;
  note?: string;
  deliverableUrl?: string;
}

export interface TaskComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorInitials: string;
  authorAvatarBg?: string;
  timestamp: string;
  content: string;
  mentionedUsers?: string[];
  linkUrl?: string;
  linkPreviewTitle?: string;
  linkPreviewDesc?: string;
}

export const STANDARD_UHURA_ROLES = [
  'Content Strategist',
  'Diseñador Gráfico',
  'Community Manager',
  'Product Lead',
  'Copywriter',
  'Web Designer',
  'Front End',
  'Trafficker',
  'Tech Lead',
  'Lead PM'
] as const;

export type StandardUhuraRole = typeof STANDARD_UHURA_ROLES[number];

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  department: string;
  board: string;
  clientName?: string;
  projectName?: string;
  frente?: string; // e.g. 'Redes Sociales', 'Landing Page', 'Pauta'
  budgetedRole?: string; // e.g. 'Web Designer', 'Front End', etc.
  executedRoleSnapshot?: string; // snapshot of the role under which hours were executed
  categoryType?: TaskCategoryType;
  requestedBy?: string;
  reviewer?: {
    name: string;
    initials: string;
    avatarBg: string;
    role?: string;
  };
  assignee: {
    name: string;
    initials: string;
    avatarBg: string;
    role?: string;
  };
  managerAssignee?: {
    name: string;
    initials: string;
    avatarBg: string;
  };
  collaborators?: {
    name: string;
    initials: string;
    avatarBg: string;
    role?: string;
  }[];
  followers?: string[];
  date: string;
  startDate?: string;
  dueDate: string;
  dueStatus: 'normal' | 'soon' | 'overdue' | 'tomorrow';
  dueText: string;
  status: TaskStatus;
  priority: TaskPriority;
  completed: boolean;
  isArchived?: boolean;
  // Rentabilidad y tiempos
  budgetedHours: number;
  plannedHours?: number;
  consumedSeconds: number;
  executionSeconds?: number;
  managementSeconds?: number;
  hourlyRateExecution?: number;
  hourlyRateManagement?: number;
  deliverables?: TaskDeliverable[];
  timeLogs?: TimeLog[];
  messages?: TaskComment[];
  acceptanceCriteria?: { id: string; text: string; completed: boolean }[];
  tags?: string[];
  taskType?: string;
  recurrence?: string;
  externalCorId?: string;
  // Naturaleza de proyecto & Fases / Fees
  projectType?: ProjectType;
  phase?: ProjectPhase;
  fase?: string; // alias/nombre de fase configurada
  feeCategory?: FeeActivityCategory;
  // Control de Bloqueos, Deuda y Trazabilidad de Causa Raíz / Baseline
  blockerInfo?: TaskBlockerInfo;
  isRecalibrated?: boolean;
  recalibrationDays?: number;
  recalibrationReason?: string;
  originalDueDate?: string;
  baselineStartDate?: string;
  baselineDueDate?: string;
  dependencyTaskId?: string;
  dependencyTaskTitle?: string;
}

export interface ActiveTimerState {
  taskId: string;
  taskTitle: string;
  clientName: string;
  projectName: string;
  categoryType?: TaskCategoryType;
  startTime: number; // Date.now() timestamp
  elapsedSeconds: number;
  isPaused: boolean;
  role?: string;
}

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    initials: string;
    avatarBg: string;
  };
  action: string;
  target: string;
  timeAgo: string;
}

export type UserRole = 'Admin' | 'Member' | 'Viewer';
export type UserStatus = 'Active' | 'Invited' | 'Inactive';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarBg: string;
  role: UserRole;
  status: UserStatus;
  tasksCount: number;
  joinedDate: string;
  capacityHours?: number;
  utilizedPercent?: number;
  jobTitle?: string;
}

export interface MonthlyBillingData {
  month: string;
  billed: number;
  target: number | null;
}

export interface ServiceProfitability {
  id: string;
  service: string;
  revenue: number;
  marginPercent: number;
  color: string;
}

export type OperationalAlertType = 'RETRASO' | 'RENTABILIDAD' | 'CARTERA';

export interface OperationalAlert {
  id: string;
  type: OperationalAlertType;
  title: string;
  client: string;
  description: string;
  weeksElapsed?: number;
  weeksPlanned?: number;
  overdueDays?: number;
  amount?: string;
  impactLevel: 'alto' | 'medio' | 'critico';
  severity?: 'critical' | 'high' | 'info';
  read?: boolean;
  timeAgo?: string;
  date: string;
}

export interface TopClient {
  id: string;
  name: string;
  billingCOP: string;
  billingAmount: number;
  marginPercent: number;
  projectCount: number;
}

export interface ProjectTrafficLight {
  id: string;
  name: string;
  client: string;
  riskStatus: 'rojo' | 'amarillo' | 'verde';
  reason: string;
  delayWeeks?: string;
  marginIssue?: boolean;
  leadAssignee?: string;
  progressPercent: number;
}

export interface TeamMemberCapacity {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  role: string;
  utilizationPercent: number;
  hoursLogged: number;
  hoursAvailable: number;
}

export interface UpcomingMilestone {
  id: string;
  dateDay: string;
  dateMonth: string;
  title: string;
  project: string;
  assignee: string;
  relativeTime: string;
  isUrgent?: boolean;
}

export interface ClientProjectHistoryItem {
  id: string;
  name: string;
  tag?: string; // e.g. 'FIN', 'FEE', 'DEV'
  brand: string;
  status: 'Activo' | 'Cerrado' | 'En Pausa' | 'Planificación';
  quotedValueCOP: string;
  realMarginPercent: number | null;
  trafficLight: 'verde' | 'amarillo' | 'rojo';
  progressPercent?: number;
}

export interface ClientBehaviorScores {
  rentabilidad: number; // 0-100
  cartera: number;      // 0-100 (salud de cartera y cobranza)
  cumplimiento: number; // 0-100 (% entregas a tiempo y horas)
  relacion: number;     // 0-100 (recurrencia y relación comercial)
  // Campos opcionales para compatibilidad
  volumen?: number;
  recurrencia?: number;
  salud?: number;
  facturacion?: number;
}

export interface ClientCommercialInfo {
  contactName: string;
  contactRole: string;
  contactEmail?: string;
  contactPhone?: string;
  clientSince: string;
  brands: string[];
}

export type ClientType = 'Fee mensual' | 'Proyecto único' | 'Interno / No facturable' | 'Mixto' | 'Fee Recurrente' | 'Proyecto';

export interface ClientProfile {
  id: string;
  name: string;
  nit: string;
  type: ClientType;
  healthStatus: 'Saludable' | 'En Riesgo' | 'Crítico';
  portalActive: boolean;
  projectsCount: number;
  activeProjectsCount: number;
  closedProjectsCount: number;
  averageMarginPercent: number | null;
  billedCOP: string;
  billedInvoicesCount: number;
  receivableCOP: string;
  receivableStatus: string;
  commercialInfo: ClientCommercialInfo;
  behavior: ClientBehaviorScores;
  projectsHistory: ClientProjectHistoryItem[];
}

export interface ClientProjectNode {
  id: string;
  name: string;
  isInternal?: boolean;
  projects: {
    id: string;
    name: string;
    budgetedHours: number;
    projectType?: ProjectType;
    feeCategory?: FeeActivityCategory;
    startDate?: string;
    endDate?: string;
    phases?: ProjectPhase[];
  }[];
}
