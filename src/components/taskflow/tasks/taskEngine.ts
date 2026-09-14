import {
  TaskItem,
  TaskStatus,
  CanonicalTaskStatus,
  ProjectDeliverable,
  DeliverableRoleBudget,
  TaskAssigneeAllocation
} from '../types';

/**
 * Normaliza cualquier estado de tarea al estándar canónico:
 * 'todo' | 'in_progress' | 'in_review' | 'completed'
 */
export function normalizeTaskStatus(status: TaskStatus): CanonicalTaskStatus {
  switch (status) {
    case 'To Do':
    case 'todo':
      return 'todo';
    case 'In Progress':
    case 'in_progress':
      return 'in_progress';
    case 'Review':
    case 'in_review':
      return 'in_review';
    case 'Done':
    case 'completed':
      return 'completed';
    default:
      return 'todo';
  }
}

/**
 * Retorna la etiqueta legible en español para un estado de tarea
 */
export function getTaskStatusLabel(status: TaskStatus): string {
  const canonical = normalizeTaskStatus(status);
  switch (canonical) {
    case 'todo':
      return 'Por hacer';
    case 'in_progress':
      return 'En proceso';
    case 'in_review':
      return 'En revisión';
    case 'completed':
      return 'Completada';
  }
}

/**
 * Retorna los estilos visuales para un estado canónico
 */
export function getTaskStatusBadgeClass(status: TaskStatus): string {
  const canonical = normalizeTaskStatus(status);
  switch (canonical) {
    case 'todo':
      return 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]';
    case 'in_progress':
      return 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]';
    case 'in_review':
      return 'bg-[#f5f3ff] text-[#501f92] border-[#ddd6fe]';
    case 'completed':
      return 'bg-[#ecfdf5] text-[#15803d] border-[#bbf7d0]';
  }
}

/**
 * Calcula el esfuerzo total estimado para una tarea:
 * Si cuenta con `assigneeAllocations`, es estrictamente la suma de sus horas.
 * Fallback a `estimatedHours` o `budgetedHours`.
 */
export function calculateTaskEstimatedHours(task: Partial<TaskItem>): number {
  if (task.assigneeAllocations && task.assigneeAllocations.length > 0) {
    const sum = task.assigneeAllocations.reduce((acc, a) => acc + (Number(a.estimatedHours) || 0), 0);
    return Math.round(sum * 100) / 100;
  }
  if (task.estimatedHours !== undefined && task.estimatedHours !== null) {
    return Number(task.estimatedHours) || 0;
  }
  return Number(task.budgetedHours) || 0;
}

/**
 * Retorna las horas consumidas reales de una tarea en formato decimal
 */
export function getTaskConsumedHours(task: TaskItem): number {
  if (task.timeLogs && task.timeLogs.length > 0) {
    const totalSeconds = task.timeLogs.reduce((sum, log) => sum + (log.durationSeconds || 0), 0);
    return Math.round((totalSeconds / 3600) * 100) / 100;
  }
  return Math.round(((task.consumedSeconds || 0) / 3600) * 100) / 100;
}

export interface RoleBudgetWarningResult {
  hasWarning: boolean;
  roleName: string;
  quotedHours: number;
  existingTasksHours: number;
  newTaskHours: number;
  totalProjectedHours: number;
  exceededHours: number;
  warningMessage?: string;
}

/**
 * Decisión 2: Evalúa si la suma de tareas planificadas supera las horas cotizadas del rol.
 * Emite una alerta visible clara, NUNCA bloquea la operación.
 */
export function checkRoleBudgetWarning(
  deliverable: ProjectDeliverable | undefined,
  roleId: string,
  newTaskEstimatedHours: number,
  existingTasks: TaskItem[],
  editingTaskId?: string
): RoleBudgetWarningResult {
  if (!deliverable || !roleId) {
    return {
      hasWarning: false,
      roleName: roleId || '',
      quotedHours: 0,
      existingTasksHours: 0,
      newTaskHours: newTaskEstimatedHours,
      totalProjectedHours: newTaskEstimatedHours,
      exceededHours: 0
    };
  }

  // Buscar horas cotizadas para ese rol en este entregable
  const roleBudget = deliverable.roleBudgets?.find(
    (rb) => rb.roleId === roleId || rb.roleName === roleId
  );
  const quotedHours = roleBudget ? roleBudget.quotedHours : 0;

  // Sumar horas de las otras tareas existentes en este entregable bajo el mismo rol
  const otherTasksSameRole = existingTasks.filter((t) => {
    if (editingTaskId && t.id === editingTaskId) return false;
    const sameDeliverable = t.deliverableId === deliverable.id;
    const sameRole = (t.budgetedRoleId === roleId) || (t.budgetedRole === roleId);
    return sameDeliverable && sameRole;
  });

  const existingTasksHours = otherTasksSameRole.reduce(
    (sum, t) => sum + calculateTaskEstimatedHours(t),
    0
  );

  const totalProjectedHours = existingTasksHours + newTaskEstimatedHours;
  const exceededHours = Math.max(0, totalProjectedHours - quotedHours);
  const hasWarning = quotedHours > 0 && exceededHours > 0;

  let warningMessage: string | undefined;
  if (hasWarning) {
    warningMessage = `Las tareas planificadas suman ${totalProjectedHours.toFixed(1)}h frente a ${quotedHours.toFixed(1)}h cotizadas (+${exceededHours.toFixed(1)}h).`;
  }

  return {
    hasWarning,
    roleName: roleBudget?.roleName || roleId,
    quotedHours,
    existingTasksHours,
    newTaskHours: newTaskEstimatedHours,
    totalProjectedHours,
    exceededHours,
    warningMessage
  };
}

export type TaskRiskLevel = 'normal' | 'attention' | 'critical';

export interface TaskRiskAnalysis {
  riskLevel: TaskRiskLevel;
  isBlocked: boolean;
  isOverdue: boolean;
  isOverconsumed: boolean;
  consumedHours: number;
  estimatedHours: number;
  burnRatio: number;
  message?: string;
  badgeClass: string;
}

/**
 * Función centralizada para evaluar la salud y riesgo de una tarea
 * sin duplicar lógica en componentes
 */
export function getTaskRiskAnalysis(task: TaskItem, referenceDate?: string): TaskRiskAnalysis {
  const isBlocked = !!(task.isBlocked || task.blockerInfo?.isBlocked);
  const consumedHours = getTaskConsumedHours(task);
  const estimatedHours = calculateTaskEstimatedHours(task);
  const canonicalStatus = normalizeTaskStatus(task.status);
  const isCompleted = canonicalStatus === 'completed';

  const today = referenceDate || new Date().toISOString().split('T')[0];
  const targetDate = task.targetDate || task.dueDate;
  const isOverdue = !isCompleted && !!targetDate && targetDate < today;

  const burnRatio = estimatedHours > 0 ? consumedHours / estimatedHours : 0;
  const isOverconsumed = estimatedHours > 0 && consumedHours > estimatedHours;

  let riskLevel: TaskRiskLevel = 'normal';
  let message = 'En orden';
  let badgeClass = 'bg-[#ecfdf5] text-[#15803d] border-[#bbf7d0]';

  if (isBlocked) {
    riskLevel = 'critical';
    message = task.blockedReason ? `Bloqueada: ${task.blockedReason}` : 'Bloqueada por impedimento';
    badgeClass = 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]';
  } else if (isOverdue) {
    riskLevel = 'critical';
    message = `Vencida (${targetDate})`;
    badgeClass = 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]';
  } else if (burnRatio > 1.2 && !isCompleted) {
    riskLevel = 'critical';
    message = `Desvío grave (+${(consumedHours - estimatedHours).toFixed(1)}h sobre estimación)`;
    badgeClass = 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]';
  } else if (isOverconsumed && !isCompleted) {
    riskLevel = 'attention';
    message = `Sobreconsumo (+${(consumedHours - estimatedHours).toFixed(1)}h)`;
    badgeClass = 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]';
  } else if (burnRatio > 0.85 && canonicalStatus === 'in_progress') {
    riskLevel = 'attention';
    message = 'Cerca del límite de horas estimadas (85%+)';
    badgeClass = 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]';
  } else if (targetDate === today && !isCompleted) {
    riskLevel = 'attention';
    message = 'Vence hoy';
    badgeClass = 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]';
  }

  return {
    riskLevel,
    isBlocked,
    isOverdue,
    isOverconsumed,
    consumedHours,
    estimatedHours,
    burnRatio,
    message,
    badgeClass
  };
}

/**
 * Estructura de eventos desacoplados para Bucky
 */
export type TaskEventType =
  | 'TASK_CREATED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_BLOCKED'
  | 'TASK_UNBLOCKED'
  | 'TASK_REWORK_LOGGED'
  | 'TASK_OVERRUN_ALERT';

export interface TaskEvent {
  id: string;
  type: TaskEventType;
  taskId: string;
  projectId?: string;
  deliverableId?: string;
  budgetedRoleId?: string;
  timestamp: string;
  payload: Record<string, any>;
}

export function createTaskBuckyEvent(
  type: TaskEventType,
  task: TaskItem,
  payload: Record<string, any> = {}
): TaskEvent {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type,
    taskId: task.id,
    projectId: task.projectId,
    deliverableId: task.deliverableId,
    budgetedRoleId: task.budgetedRoleId || task.budgetedRole,
    timestamp: new Date().toISOString(),
    payload: {
      title: task.title,
      status: task.status,
      isBlocked: task.isBlocked,
      blockedReason: task.blockedReason,
      ...payload
    }
  };
}
