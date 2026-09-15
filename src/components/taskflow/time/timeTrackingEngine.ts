import {
  TimeLogSource,
  TimeLogItem,
  TimeTrackingEvent,
  TimeTrackingEventType,
  ActiveTimerState,
  TaskItem,
  ProjectDeliverable,
  DeliverableRoleBudget,
  ProjectSummaryItem
} from '../types';

/**
 * Configuración de Umbrales de Time Tracking.
 * NOTA DE ARQUITECTURA:
 * El valor de 10 horas (36,000 segundos) es un valor PROVISIONAL/CONFIGURABLE de prototipo.
 * No es una regla de negocio hardcoded: la arquitectura está preparada para que el backend
 * defina/configure este umbral según políticas de la organización, tipo de cliente o rol.
 */
export const DEFAULT_ABNORMAL_TIMER_THRESHOLD_SECONDS = 10 * 3600;

export function getAbnormalTimerThresholdSeconds(configuredThresholdSeconds?: number): number {
  return configuredThresholdSeconds && configuredThresholdSeconds > 0
    ? configuredThresholdSeconds
    : DEFAULT_ABNORMAL_TIMER_THRESHOLD_SECONDS;
}

export const ABNORMAL_TIMER_THRESHOLD_SECONDS = DEFAULT_ABNORMAL_TIMER_THRESHOLD_SECONDS;

/**
 * Determina si una fecha YYYY-MM-DD cae en fin de semana (Sábado o Domingo).
 * En Uhura, el calendario habitual es de Lunes a Viernes.
 * El trabajo en fin de semana es legítimo y suma a la ejecución real,
 * pero no cuenta como capacidad esperada regular ni debe premiarse como sobretrabajo.
 */
export function isWeekendWorkDate(dateString: string): boolean {
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const dayOfWeek = d.getDay(); // 0 = Domingo, 6 = Sábado
      return dayOfWeek === 0 || dayOfWeek === 6;
    }
  } catch (e) {
    // Si falla el parseo, fallback a false
  }
  return false;
}

/**
 * Determina si un TimeLog puede ser editado por el usuario actual.
 * Regla:
 * 1. Admin o Lead PM puede editar mientras el periodo contable no esté cerrado en backend.
 * 2. El autor puede editar si pertenece al periodo operativo abierto.
 */
export function canEditTimeLog(
  log: TimeLogItem,
  currentUserId: string,
  currentUserRole?: string,
  isOperatingPeriodOpen: boolean = true
): { canEdit: boolean; reason?: string } {
  if (log.isDeleted) {
    return { canEdit: false, reason: 'El registro ha sido eliminado (soft delete).' };
  }

  if (!isOperatingPeriodOpen) {
    return { canEdit: false, reason: 'El periodo operativo/contable se encuentra cerrado.' };
  }

  const isAdminOrLead = currentUserRole === 'Admin' || currentUserRole === 'Lead PM';
  const isAuthor = log.userId === currentUserId;

  if (isAuthor || isAdminOrLead) {
    return { canEdit: true };
  }

  return { canEdit: false, reason: 'Solo el autor del registro o un Lead/Admin pueden realizar modificaciones.' };
}

/**
 * Calcula la agregación segura de horas consumidas para una tarea a partir de sus TimeLogs activos.
 * Evita cualquier doble conteo sumando estrictamente logs con isDeleted !== true.
 */
export function calculateTaskConsumedHoursFromLogs(
  taskId: string,
  timeLogs: TimeLogItem[]
): { totalSeconds: number; consumedHours: number; logsCount: number } {
  const activeLogs = timeLogs.filter((l) => l.taskId === taskId && !l.isDeleted);
  const totalSeconds = activeLogs.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
  const consumedHours = parseFloat((totalSeconds / 3600).toFixed(2));
  return {
    totalSeconds,
    consumedHours,
    logsCount: activeLogs.length
  };
}

/**
 * Rollup de Entregable:
 * Suma de horas consumidas de todas las tareas pertenecientes a este entregable.
 */
export function calculateDeliverableExecutedHours(
  deliverableId: string,
  tasks: TaskItem[],
  timeLogs: TimeLogItem[]
): number {
  const deliverableTasks = tasks.filter((t) => t.deliverableId === deliverableId);
  const taskIds = new Set(deliverableTasks.map((t) => t.id));

  const relevantLogs = timeLogs.filter((l) => taskIds.has(l.taskId) && !l.isDeleted);
  const totalSeconds = relevantLogs.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
  return parseFloat((totalSeconds / 3600).toFixed(2));
}

/**
 * Rollup de RoleBudget:
 * Suma de horas ejecutadas imputadas al rol presupuestado específico dentro del entregable.
 */
export function calculateRoleBudgetExecutedHours(
  deliverableId: string,
  budgetedRoleId: string,
  tasks: TaskItem[],
  timeLogs: TimeLogItem[]
): number {
  const deliverableTasks = tasks.filter((t) => t.deliverableId === deliverableId);
  const taskMap = new Map(deliverableTasks.map((t) => [t.id, t]));

  const relevantLogs = timeLogs.filter((l) => {
    if (l.isDeleted) return false;
    const task = taskMap.get(l.taskId);
    if (!task) return false;
    // Compara el budgetedRoleId derivado del log o de la tarea
    const logRole = l.budgetedRoleId || task.budgetedRoleId || task.budgetedRole;
    return logRole === budgetedRoleId;
  });

  const totalSeconds = relevantLogs.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
  return parseFloat((totalSeconds / 3600).toFixed(2));
}

/**
 * Emite un evento desacoplado de Time Tracking para que Bucky u otros módulos lo escuchen.
 */
export function createTimeTrackingEvent(
  type: TimeTrackingEventType,
  payload: Record<string, any>
): TimeTrackingEvent {
  return {
    id: `ttevt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type,
    timestamp: new Date().toISOString(),
    payload
  };
}

/**
 * Formatea duración en segundos a una representación elegante y compacta:
 * e.g. "1h 30m" o "45m" o "01:25:40"
 */
export function formatDurationCompact(seconds: number): string {
  if (seconds <= 0) return '0m';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs > 0 && mins > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (hrs > 0) {
    return `${hrs}h`;
  }
  return `${mins}m`;
}

export function formatSecondsToDigital(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
