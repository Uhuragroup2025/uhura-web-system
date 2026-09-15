export type BuckyMascotState =
  | 'idle'       // respira, parpadea, mueve ligeramente la cola
  | 'wave'       // saluda con una mano
  | 'clap'       // aplaude 3 veces
  | 'celebrate'  // pequeño salto + brazos arriba
  | 'letsGo'     // puño arriba / gesto "¡Vamos!"
  | 'stretch'    // se estira hacia un lado y luego al otro
  | 'yawn'       // bostezo + ojos cerrados
  | 'tired'      // hombros caídos, parpadeo lento
  | 'warning'    // expresión preocupada + mira hacia el indicador
  | 'sad'        // baja cabeza suavemente
  | 'point'      // señala un CTA/tarea
  | 'sleep';     // se duerme lentamente

export type OrbitView =
  | 'mi-dia'
  | 'la-colonia'
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

export type TaskPriority = 'High' | 'Medium' | 'Low' | 'urgent' | 'high' | 'medium' | 'low';
export type CanonicalTaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed';
export type TaskStatus = 'In Progress' | 'Done' | 'To Do' | 'Review' | 'todo' | 'in_progress' | 'in_review' | 'completed';

export interface TaskAssigneeAllocation {
  userId: string;
  userName?: string;
  userAvatarBg?: string;
  userInitials?: string;
  estimatedHours: number; // Esfuerzo planificado correspondiente a esta persona
}

export type TaskCategoryType = 'client' | 'internal';

export type ProjectType =
  | 'fee_monthly'
  | 'fixed_project'
  | 'internal_non_billable'
  | 'fixed_milestones' // compatibilidad
  | 'internal';        // compatibilidad

export type FeeRolloverPolicy = 'none' | 'carry_over' | 'contractual_cap';

export interface DeliverableRoleBudget {
  id: string;
  roleId: string;       // ej. 'Diseñador Gráfico', 'Front End', 'Tech Lead'
  roleName: string;
  quotedHours: number;  // Horas presupuestadas para este rol (0h permitido para proyectos internos o frentes organizativos)
}

export interface ProjectDeliverable {
  id: string;
  projectId: string;
  name: string;         // ej. 'Redes Sociales', 'Landing Page', 'Pauta Digital'
  description?: string;
  order: number;
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  startDate?: string;
  dueDate?: string;
  roleBudgets: DeliverableRoleBudget[];
  // Rollups calculados (no campos editables directos):
  totalQuotedHours?: number;   // rollup: suma de roleBudgets[].quotedHours
  totalExecutedHours?: number; // rollup: suma de logs de tareas con deliverableId
  progressPercentage?: number; // avance en %
}

export interface ProjectMonthlyCycle {
  monthKey: string;          // ej. "2026-08", "2026-09"
  monthLabel: string;        // ej. "Agosto 2026", "Septiembre 2026"
  quotedHours: number;       // Horas cotizadas contratadas para este ciclo
  rolloverHoursIn?: number;  // Horas traspasadas del ciclo anterior si aplica
  executedHours: number;     // Horas ejecutadas reales en este ciclo (rollup)
  status: 'closed' | 'active' | 'upcoming';
  notes?: string;
}



export type AssignmentNature = 'governance' | 'core_execution' | 'temporary_support';

export interface AllocationPeriod {
  id: string;
  startDate: string;                  // ISO Date (YYYY-MM-DD)
  endDate?: string | null;            // ISO Date (YYYY-MM-DD), null si es indefinido mientras el proyecto esté activo
  weeklyHours: number;                // Horas semanales planificadas durante esta ventana temporal
  notes?: string;
}

export interface ProjectAssignment {
  id: string;                         // UUID de la asignación
  projectId: string;                  // FK -> Project
  userId: string;                     // FK -> User (fuente de verdad de nombre, avatar, disponibilidad contractual)
  roleId: string;                     // FK -> Role del catálogo (ej. 'role-product-lead', 'role-frontend')
  nature: AssignmentNature;           // 'governance' | 'core_execution' | 'temporary_support'
  deliverableId?: string | null;      // Opcional: vinculado a un entregable específico
  allocations: AllocationPeriod[];    // Ventanas de asignación temporal (permite modular dedicación por semana/fase)
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  createdByUserId?: string;
}

export interface ProjectStakeholder {
  id: string;
  projectId: string;
  userId: string;
  titleOrDepartment?: string;
  notes?: string;
  addedAt?: string;
}

export type AssignmentChangeReason =
  | 'project_kickoff'
  | 'scope_change'
  | 'capacity_rebalance'
  | 'planned_absence'
  | 'temporary_reinforcement'
  | 'permanent_replacement'
  | 'role_change'
  | 'project_exit'
  | 'availability_change';

export interface AssignmentHistory {
  id: string;
  projectId: string;
  assignmentId?: string;
  userId: string;                     // Persona afectada
  roleId?: string;                    // Rol afectado si aplica
  action: 'created' | 'updated' | 'ended' | 'removed';
  previousWeeklyHours?: number | null;
  newWeeklyHours: number;
  previousEndDate?: string | null;
  newEndDate?: string | null;
  reason: AssignmentChangeReason;
  notes?: string;
  affectedPeriod?: string;            // ej. "2026-W38" o "Septiembre 2026"
  changedByUserId: string;
  changedByName?: string;
  changedAt: string;                  // ISO Timestamp
}

export interface ProjectTeamMember {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  role: string;
  isLead?: boolean;
  weeklyAllocatedHours?: number; // Carga planificada estimada semanal (sin asumir 8h universales)
  // Desglose multi-rol cuando aplica
  assignments?: ProjectAssignment[];
}

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
  code?: string;
  name: string;
  clientId?: string;          // ID estricto a ClientProfile
  clientName: string;
  taxEntityId?: string | null; // 100% opcional, vínculo a ClientTaxEntity
  brand?: string;
  leadName: string;
  leadAvatarBg: string;
  leadRole?: string;
  projectType: ProjectType;
  serviceBase: string;
  areas?: string[];
  budgetedHours: number;      // Rollup derivado de deliverables o ciclo activo
  soldHours?: number;
  soldValueCOP?: number;
  soldCurrency?: 'COP' | 'USD';
  startDate?: string;
  endDate?: string;
  brief?: string;
  
  // Entregables y Equipo Formal
  deliverables?: ProjectDeliverable[];
  coreTeam?: ProjectTeamMember[]; // Compatibilidad transitoria
  assignments?: ProjectAssignment[]; // Fuente de verdad de asignaciones multirol
  stakeholders?: ProjectStakeholder[]; // Seguidores/stakeholders (sin roleId ni consumo de horas)
  assignmentHistory?: AssignmentHistory[]; // Auditoría inmutable de cambios de equipo

  rolloverPolicy?: FeeRolloverPolicy;
  currentMonthCycle?: string;
  monthlyCycles?: ProjectMonthlyCycle[];
  
  // Vectores para análisis y alertas (Indunova)
  riskVectors?: {
    timeElapsedRatio: number;      // % tiempo transcurrido
    hoursConsumedRatio: number;    // % horas ejecutadas vs cotizadas
    operationalProgress: number;   // % tareas completadas
    burnProgressVariance: number;  // desvío entre consumo y avance
    blockedTasksCount: number;
    overdueTasksCount: number;
  };
  
  // Metadatos de integración futura (desacoplados)
  alegraContractId?: string | null;
  hubspotDealId?: string | null;
  commercialQuoteId?: string | null;

  teamMembers?: { name: string; role?: string; avatarBg: string; initials?: string }[];
  status: 'Activo' | 'En Pausa' | 'Cerrado' | 'Planificación' | 'Archivado' | 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  healthStatus: 'verde' | 'amarillo' | 'rojo';
  healthNote?: string;
  hasPhasesAndBacklog?: boolean;
  phasesList?: ProjectPhaseItem[];
  
  // Runtime Task associations
  tasks?: TaskItem[];
  consumedHours?: number;
  completedTasksCount?: number;
  totalTasksCount?: number;
  tasksAssignedHours?: number;
  inReviewCount?: number;
}

export type ProjectProfile = ProjectSummaryItem;

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

export type ReworkOrigin = 'client' | 'internal';

export interface TaskRework {
  id: string;
  taskId: string;
  origin: ReworkOrigin; // 'client' (ajustes solicitados por el cliente) | 'internal' (calidad / QA interno de Uhura)
  roundNumber: number; // Ronda 1, Ronda 2, etc.
  reason: string;
  requestedBy: string;
  date: string;
  hoursSpent?: number;
  resolved?: boolean;
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

export type TimeLogSource = 'timer' | 'manual';

export interface TimeLogItem {
  id: string;                         // UUID inmutable
  taskId: string;                     // FK -> Task (OBLIGATORIO: siempre sobre tarea)
  userId?: string;                    // FK -> User que ejecutó el trabajo
  budgetedRoleId?: string;            // Derivado inmutable de task.budgetedRoleId (o task.budgetedRole)
  durationSeconds: number;            // Entero exacto en segundos
  date: string;                       // YYYY-MM-DD (fecha de ejecución)
  description?: string;               // Detalle del trabajo realizado
  source?: TimeLogSource;             // 'timer' | 'manual'
  startedAt?: string | null;          // ISO Timestamp
  stoppedAt?: string | null;          // ISO Timestamp

  // Apoyo puntual (Decisión 4: no autoasignado a la tarea)
  isAdHocSupport?: boolean;           // Si el usuario no estaba en assigneeAllocations pero apoyó

  // Fin de semana / Fuera de calendario habitual (Ajuste 2)
  isOutsideRegularSchedule?: boolean; // Sábado o Domingo (no genera premio ni expectativa)

  // Auditoría y trazabilidad
  isEdited?: boolean;
  originalDurationSeconds?: number;
  editReason?: string | null;
  editedByUserId?: string | null;
  editedAt?: string | null;
  isDeleted?: boolean;                // Soft delete
  deletedAt?: string | null;

  // Timestamps de sistema
  createdAt?: string;
  updatedAt?: string;

  // Campos de compatibilidad de visualización (desnormalizados para UI rápida)
  taskTitle?: string;
  projectName?: string;
  clientName?: string;
  userName?: string;
  userInitials?: string;
  userAvatarBg?: string;
}

export type TimeTrackingEventType =
  | 'TIMER_STARTED'
  | 'TIMER_STOPPED'
  | 'TIME_LOG_CREATED'
  | 'TIME_LOG_UPDATED'
  | 'TIME_LOG_DELETED'
  | 'TASK_ESTIMATE_EXCEEDED';

export interface TimeTrackingEvent {
  id: string;
  type: TimeTrackingEventType;
  timestamp: string;
  payload: Record<string, any>;
}

export interface TimeLog extends TimeLogItem {
  startTime?: string;
  endTime?: string;
  isLiveTimer?: boolean;
  note?: string;
  deliverableUrl?: string;
  categoryType?: TaskCategoryType;
}

export interface TaskCommentAttachment {
  id: string;
  name: string;
  url?: string;
  previewUrl?: string;
  size?: string;
  type?: 'image' | 'file' | 'link';
  mimeType?: string;
}

export interface TaskCommentReaction {
  emoji: string;
  count: number;
  users: string[];
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
  attachments?: TaskCommentAttachment[];
  reactions?: TaskCommentReaction[];
  isEdited?: boolean;
  editedAt?: string;
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
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  deliverableId?: string; // Vínculo formal a ProjectDeliverable
  frente?: string; // e.g. 'Redes Sociales', 'Landing Page', 'Pauta' (compatibilidad)
  budgetedRole?: string; // e.g. 'Web Designer', 'Front End', etc. (compatibilidad)
  budgetedRoleId?: string; // FK estricta a rol cotizado que descuenta horas de la cotización
  executedRoleSnapshot?: string; // snapshot of the role under which hours were executed
  categoryType?: TaskCategoryType;
  requestedBy?: string;
  projectLead?: {
    name: string;
    initials: string;
    avatarBg: string;
    role?: string;
  };
  requiresReview?: boolean; // Decisión 1: Si es true requiere QA/Lead; si es false el ejecutor la completa directamente
  requiresValidation?: boolean; // Deprecated - replaced by requiresReview
  reviewer?: {
    name: string;
    initials: string;
    avatarBg: string;
    role?: string;
  };
  assignee: {
    id?: string;
    name: string;
    initials: string;
    avatarBg: string;
    role?: string;
  };
  assigneeIds?: string[]; // IDs de colaboradores asignados
  assigneeAllocations?: TaskAssigneeAllocation[]; // Decisión 3: Distribución de esfuerzo por colaborador
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
  followers?: {
    name: string;
    initials: string;
    avatarBg: string;
    role?: string;
  }[];
  date: string;
  startDate?: string;
  dueDate: string;
  targetDate?: string | null; // Fecha objetivo (opcional según contexto de proyecto)
  scheduledDate?: string | null; // Fecha planificada para ejecución (usada en Mi Día)
  isDeadlineStrict?: boolean; // Flag de deadline estricto vs fecha orientativa
  dueStatus: 'normal' | 'soon' | 'overdue' | 'tomorrow' | 'urgent';
  dueText: string;
  status: TaskStatus;
  priority: TaskPriority;
  completed: boolean;
  completedAt?: string;
  isArchived?: boolean;
  // Bloqueo como flag y no como estado (Decisión 5)
  isBlocked?: boolean;
  blockedReason?: string | null;
  blockedAt?: string | null;
  // Retrabajos y ajustes trazables
  isRework?: boolean;
  reworkRound?: number;
  originalTaskId?: string | null;
  reworkReason?: 'client_feedback' | 'internal_qa' | 'brief_change' | string | null;
  // Rentabilidad y tiempos
  budgetedHours: number;
  estimatedHours?: number; // Esfuerzo total combinado (suma de assigneeAllocations)
  plannedHours?: number;
  consumedSeconds: number;
  executionSeconds?: number;
  managementSeconds?: number;
  hourlyRateExecution?: number;
  hourlyRateManagement?: number;
  deliverables?: TaskDeliverable[];
  reworks?: TaskRework[];
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
  startedAtISO?: string; // ISO string
  elapsedSeconds: number;
  isPaused: boolean; // conservado para compatibilidad suave
  role?: string;
  deliverableId?: string;
  budgetedRoleId?: string;
  isOutsideRegularSchedule?: boolean;
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
  tier?: string;
}

export type ClientType = 'Fee mensual' | 'Proyecto único' | 'Interno / No facturable' | 'Mixto' | 'Fee Recurrente' | 'Proyecto';

export type ClientContactRole = 'operativo' | 'comercial' | 'facturacion' | 'directivo';

export interface ClientContact {
  id: string;
  name: string;
  roleTitle?: string;
  email: string;
  phone?: string;
  contactType: ClientContactRole;
  isPrimary: boolean;
}

export interface ClientTaxEntity {
  id: string;
  nit: string;
  businessName: string;
  city?: string;
  isPrimary: boolean;
  alegraContactId?: string; // Referencia de integración externa
  notes?: string;
}

/**
 * ClientProfile Status:
 * - 'active': Operación vigente.
 * - 'paused': Relación temporalmente detenida, conserva histórico.
 * - 'archived': Cliente histórico, no disponible para nueva operación.
 */
export type ClientStatus = 'active' | 'paused' | 'archived';

export interface ClientProfile {
  id: string;
  name: string;                         // Nombre Comercial / Marca Sombrilla
  isInternal?: boolean;                 // true para UHURA Group interno protegido
  status: ClientStatus;                 // 'active' | 'paused' | 'archived'
  
  // Múltiples Razones Sociales / NITs (0 a N, no bloquea creación)
  taxEntities: ClientTaxEntity[];
  
  // Directorio de Contactos (0 a N)
  contacts: ClientContact[];
  
  // Responsable de cuenta en Uhura (opcional, asignación explícita)
  accountManagerId?: string;
  accountManagerName?: string;
  
  // Notas y referencias de integración externa (no parte de la lógica principal)
  notes?: string;
  hubspotCompanyId?: string;
  createdAt?: string;
  updatedAt?: string;

  // Campos de compatibilidad y métricas operativas
  nit?: string;                         // Compatibilidad de lectura: devuelve taxEntity principal o el primero
  type?: ClientType;                    // Compatibilidad histórica mientras se desacopla en Proyecto
  healthStatus?: 'Saludable' | 'En Riesgo' | 'Crítico';
  portalActive?: boolean;
  projectsCount?: number;
  activeProjectsCount?: number;
  closedProjectsCount?: number;
  averageMarginPercent?: number | null;
  billedCOP?: string;
  billedInvoicesCount?: number;
  receivableCOP?: string;
  receivableStatus?: string;
  commercialInfo?: ClientCommercialInfo;
  behavior?: ClientBehaviorScores;
  projectsHistory?: ClientProjectHistoryItem[];
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
