import {
  ProjectSummaryItem,
  ProjectHealthResult,
  ProjectHealthStatus,
  ProjectDependency,
  TaskItem,
  ProjectReworkRound,
  normalizeProjectType
} from '../types';

/**
 * Tabla simplificada de festivos oficiales colombianos para cómputo de días hábiles.
 * Se proyectan para 2026.
 */
const COLOMBIAN_HOLIDAYS_2026: Set<string> = new Set([
  '2026-01-01', // Año Nuevo
  '2026-01-12', // Reyes Magos
  '2026-03-23', // San José
  '2026-04-02', // Jueves Santo
  '2026-04-03', // Viernes Santo
  '2026-05-01', // Día del Trabajo
  '2026-05-18', // Ascensión del Señor
  '2026-06-08', // Corpus Christi
  '2026-06-15', // Sagrado Corazón
  '2026-06-29', // San Pedro y San Pablo
  '2026-07-20', // Grito de Independencia
  '2026-08-07', // Batalla de Boyacá
  '2026-08-17', // Asunción de la Virgen
  '2026-10-12', // Día de la Raza
  '2026-11-02', // Todos los Santos
  '2026-11-16', // Independencia de Cartagena
  '2026-12-08', // Inmaculada Concepción
  '2026-12-25'  // Navidad
]);

/**
 * Determina si una fecha dada es un día hábil (lunes a viernes, no festivo).
 */
export function isBusinessDay(date: Date): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false; // Fin de semana
  const isoStr = date.toISOString().slice(0, 10);
  if (COLOMBIAN_HOLIDAYS_2026.has(isoStr)) return false;
  return true;
}

/**
 * Calcula los días hábiles entre dos fechas (excluyendo la fecha inicial, inclusive la final,
 * o 0 si startDate >= endDate).
 */
export function calculateBusinessDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (start >= end) return 0;

  let count = 0;
  const current = new Date(start);
  current.setDate(current.getDate() + 1);

  while (current <= end) {
    if (isBusinessDay(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Suma N días hábiles a una fecha dada.
 */
export function addBusinessDays(startDateStr: string, daysToAdd: number): string {
  if (!startDateStr || daysToAdd <= 0) return startDateStr;
  const current = new Date(startDateStr);
  let added = 0;
  while (added < daysToAdd) {
    current.setDate(current.getDate() + 1);
    if (isBusinessDay(current)) {
      added++;
    }
  }
  return current.toISOString().slice(0, 10);
}

/**
 * Parámetros de entrada para el cálculo del motor ProjectHealth.
 */
export interface HealthEvaluationInput {
  project: ProjectSummaryItem;
  currentDateStr?: string; // Formato YYYY-MM-DD (por defecto hoy)
  customTasks?: TaskItem[]; // Tareas asociadas si no vienen dentro de project.tasks
}

/**
 * Motor central de cálculo multivectorial de salud de proyectos (ProjectHealth).
 */
export function evaluateProjectHealth(input: HealthEvaluationInput): ProjectHealthResult {
  const { project } = input;
  const normalizedProjectType = normalizeProjectType(project.projectType);
  const nowStr = input.currentDateStr || new Date().toISOString().slice(0, 10);
  const now = new Date(nowStr);

  const tasks: TaskItem[] = input.customTasks || project.tasks || [];
  const deliverables = project.deliverables || [];
  const dependencies: ProjectDependency[] = project.dependencies || [];
  const reworkRounds: ProjectReworkRound[] = project.reworkRounds || [];
  const config = project.scheduleConfig || {
    clientKickoffWaitDays: 3,
    gateApprovalWaitDays: 5,
    gateCount: 2,
    includedReworkRounds: 2
  };

  // 1. Presupuesto Contractual Canónico (Inmutable)
  const totalBudget = project.soldHours && project.soldHours > 0
    ? project.soldHours
    : (project.budgetedHours && project.budgetedHours > 0 ? project.budgetedHours : 0);

  // 2. Cálculo de Horas de Presupuesto Ganadas (Avance Ponderado)
  let totalEarnedHours = 0;
  if (deliverables.length > 0) {
    deliverables.forEach((del) => {
      const delQuoted = del.totalQuotedHours ?? 0;
      if (del.status === 'completed') {
        totalEarnedHours += delQuoted;
      } else {
        const delTasks = tasks.filter((t) => t.deliverableId === del.id);
        if (delTasks.length > 0) {
          const tasksEarned = delTasks.reduce((sum, t) => {
            const taskBudget = t.budgetedHours || t.estimatedHours || 0;
            const progressRatio = t.completed
              ? 1.0
              : (t.progressPercent !== undefined && t.progressPercent !== null
                  ? Math.min(100, Math.max(0, t.progressPercent)) / 100
                  : 0.0);
            return sum + (taskBudget * progressRatio);
          }, 0);
          totalEarnedHours += Math.min(delQuoted, tasksEarned);
        } else if (del.progressPercent !== undefined || del.progressPercentage !== undefined) {
          const explicitPct = (del.progressPercent ?? del.progressPercentage ?? 0) / 100;
          totalEarnedHours += (delQuoted * Math.min(1.0, Math.max(0, explicitPct)));
        }
      }
    });
  } else if (tasks.length > 0) {
    totalEarnedHours = tasks.reduce((sum, t) => {
      const taskBudget = t.budgetedHours || t.estimatedHours || 0;
      const progressRatio = t.completed
        ? 1.0
        : (t.progressPercent !== undefined && t.progressPercent !== null
            ? Math.min(100, Math.max(0, t.progressPercent)) / 100
            : 0.0);
      return sum + (taskBudget * progressRatio);
    }, 0);
  }

  // Si todas las tareas y entregables están completados
  const allTasksCompleted = tasks.length > 0 && tasks.every((t) => t.completed);
  const allDeliverablesCompleted = deliverables.length > 0 && deliverables.every((d) => d.status === 'completed');

  let progressRatio = 0;
  if (allTasksCompleted || allDeliverablesCompleted || project.status === 'completed' || project.status === 'Cerrado') {
    progressRatio = 1.0;
  } else if (totalBudget > 0) {
    progressRatio = Math.min(1.0, Math.max(0, totalEarnedHours / totalBudget));
  } else if (tasks.length > 0) {
    progressRatio = tasks.filter((t) => t.completed).length / tasks.length;
  }

  const progressPct = Math.round(progressRatio * 100);
  const consumedHours = project.consumedHours ?? 0;
  const hoursPct = totalBudget > 0 ? Math.round((consumedHours / totalBudget) * 100) : 0;
  const deltaBurn = hoursPct - progressPct;

  // 3. Vector Calendario (Baseline vs Forecast)
  const baselineEnd = project.baselineEndDate || project.endDate || '';
  const forecastEnd = project.forecastEndDate || project.endDate || baselineEnd;

  let deltaBusinessDays = 0;
  if (baselineEnd && forecastEnd && forecastEnd > baselineEnd) {
    deltaBusinessDays = calculateBusinessDays(baselineEnd, forecastEnd);
  }

  // 4. Vector Dependencias de Cliente (D_act, D_unf, D_warn)
  let dAct = 0;
  let dUnf = 0;
  let dWarn = 0;
  let latestActiveFollowUpNote: string | null = null;
  let primaryBlockingDepTitle: string | null = null;
  let primaryBlockingDepDays = 0;

  dependencies.forEach((dep) => {
    if (dep.status === 'pending' && dep.expectedDate && nowStr > dep.expectedDate) {
      const delayDays = calculateBusinessDays(dep.expectedDate, nowStr);
      if (dep.blocking) {
        if (!primaryBlockingDepTitle) {
          primaryBlockingDepTitle = dep.title;
          primaryBlockingDepDays = delayDays;
        }
        // Verificar gestión reciente (<= 2 días hábiles)
        const hasFollowUpDate = !!dep.lastFollowUpAt;
        const daysSinceFollowUp = hasFollowUpDate
          ? calculateBusinessDays(dep.lastFollowUpAt!.slice(0, 10), nowStr)
          : 999;

        const isActivelyFollowed = delayDays <= 5 && hasFollowUpDate && daysSinceFollowUp <= 2;

        if (isActivelyFollowed) {
          dAct++;
          if (dep.followUpNotes) {
            latestActiveFollowUpNote = dep.followUpNotes;
          } else if (dep.followUpOwnerName) {
            latestActiveFollowUpNote = `Seguimiento registrado recientemente por ${dep.followUpOwnerName}`;
          }
        } else {
          dUnf++;
        }
      } else {
        dWarn++;
      }
    }
  });

  // 5. Vector Fricción Interna y Rondas de Ajuste
  const rAct = tasks.filter((t) => t.isRework && (t.reworkRound ?? 1) >= 2 && !t.completed).length;
  const tOverdue = tasks.filter((t) => !t.completed && t.dueDate && nowStr > t.dueDate).length;

  const includedReworkRounds = config.includedReworkRounds ?? 2;
  const additionalIterationsCount = reworkRounds.filter(
    (r) => r.roundNumber > includedReworkRounds || r.isAdditionalIteration
  ).length;
  const scopeRedefinitionsCount = reworkRounds.filter(
    (r) => r.cause === 'scope_redefinition'
  ).length;
  const internalAdjustmentsCount = reworkRounds.filter(
    (r) => r.cause === 'internal_adjustment'
  ).length;

  // 6. Normalización de Vectores a Escala 0-100
  // S_burn
  let sBurn = 100;
  if (deltaBurn > 40) {
    sBurn = 0;
  } else if (deltaBurn > 0) {
    sBurn = Math.round(100 - (deltaBurn / 40) * 100);
  }

  // S_sched
  let sSched = 100;
  if (normalizedProjectType === 'fixed_project') {
    if (deltaBusinessDays > 6) {
      sSched = 0;
    } else if (deltaBusinessDays > 0) {
      sSched = Math.round(100 - (deltaBusinessDays / 6) * 100);
    }
  } else {
    // Si no es un proyecto de entrega fija cerrada (fee_monthly, internal_non_billable o sin tipo definido),
    // la fecha final de entrega no penaliza el score ni activa desvíos de cronograma cerrado.
    sSched = 100;
  }

  // S_dep
  let sDep = 100;
  if (dependencies.length > 0) {
    const penaltyDep = (dAct * 20) + (dUnf * 50) + (dWarn * 10);
    sDep = Math.max(0, 100 - penaltyDep);
  }

  // S_fric
  const penaltyFric = (rAct * 25) + (tOverdue * 15) + (additionalIterationsCount * 15) + (scopeRedefinitionsCount * 20);
  const sFric = Math.max(0, 100 - penaltyFric);

  // Score Compuesto Interno
  const healthScore = Number(
    ((0.35 * sBurn) + (0.30 * sSched) + (0.20 * sDep) + (0.15 * sFric)).toFixed(1)
  );

  // 7. Evaluación Determinística de Guardrails
  let status: ProjectHealthStatus = 'healthy';
  let badge: 'Saludable' | 'Atención' | 'Riesgo' = 'Saludable';
  let primaryReason = '';
  let secondaryReason = '';
  let triggeredGuardrail: string | undefined = undefined;

  // PASO 1: Guardrails a RIESGO (Risk / Rojo)
  if (hoursPct >= 85 && progressPct < 50) {
    status = 'risk';
    triggeredGuardrail = 'G-R1';
    primaryReason = `Horas ${hoursPct}% · Avance ${progressPct}% · Sobregiro prematuro (+${deltaBurn}% vs avance)`;
  } else if (normalizedProjectType === 'fixed_project' && deltaBusinessDays > 5) {
    status = 'risk';
    triggeredGuardrail = 'G-R2';
    primaryReason = `Horas ${hoursPct}% · Avance ${progressPct}% · Desvío de +${deltaBusinessDays} días hábiles vs Baseline`;
  } else if (dUnf >= 1) {
    status = 'risk';
    triggeredGuardrail = 'G-R3';
    primaryReason = primaryBlockingDepTitle
      ? `Horas ${hoursPct}% · Avance ${progressPct}% · Dependencia crítica desatendida (${primaryBlockingDepTitle} +${primaryBlockingDepDays}d)`
      : `Horas ${hoursPct}% · Avance ${progressPct}% · ${dUnf} dependencia(s) crítica(s) vencida(s) sin seguimiento`;
  } else if (progressPct < 100 && hoursPct > 105) {
    status = 'risk';
    triggeredGuardrail = 'G-R4';
    primaryReason = `Horas ${hoursPct}% · Avance ${progressPct}% · Presupuesto excedido antes del cierre (+${hoursPct - 100}%)`;
  } else if (progressPct === 100 && hoursPct > 115) {
    status = 'risk';
    triggeredGuardrail = 'G-R5';
    primaryReason = `Proyecto completado con sobrecosto severo (+${hoursPct - 100}% de horas cotizadas)`;
  } else if (additionalIterationsCount >= 3 && deltaBusinessDays > 5) {
    status = 'risk';
    triggeredGuardrail = 'G-R6';
    primaryReason = `Riesgo por múltiples iteraciones adicionales (${additionalIterationsCount} rondas) y desvío de +${deltaBusinessDays} días`;
  }

  // PASO 2: Guardrails a ATENCIÓN (Attention / Amarillo) si no hubo riesgo
  if (!triggeredGuardrail) {
    if (progressPct === 100 && hoursPct > 100 && hoursPct <= 115) {
      status = 'attention';
      triggeredGuardrail = 'G-A6';
      primaryReason = `Proyecto completado · Horas ${hoursPct}% · Avance 100% · +${hoursPct - 100}% sobre presupuesto de horas`;
    } else if (progressPct < 100 && deltaBurn >= 15 && deltaBurn < 40) {
      status = 'attention';
      triggeredGuardrail = 'G-A1';
      primaryReason = `Horas ${hoursPct}% · Avance ${progressPct}% · Desbalance de consumo (+${deltaBurn}% vs avance)`;
    } else if (normalizedProjectType === 'fixed_project' && deltaBusinessDays >= 2 && deltaBusinessDays <= 5) {
      status = 'attention';
      triggeredGuardrail = 'G-A2';
      primaryReason = primaryBlockingDepTitle
        ? `Horas ${hoursPct}% · Avance ${progressPct}% · ${primaryBlockingDepTitle} +${primaryBlockingDepDays} días`
        : `Horas ${hoursPct}% · Avance ${progressPct}% · Desvío moderado de +${deltaBusinessDays} días hábiles`;
    } else if (dAct >= 1 && dUnf === 0) {
      status = 'attention';
      triggeredGuardrail = 'G-A3';
      primaryReason = primaryBlockingDepTitle
        ? `Horas ${hoursPct}% · Avance ${progressPct}% · ${primaryBlockingDepTitle} +${primaryBlockingDepDays} días`
        : `Horas ${hoursPct}% · Avance ${progressPct}% · ${dAct} dependencia(s) de cliente con seguimiento activo`;
      if (latestActiveFollowUpNote) {
        secondaryReason = latestActiveFollowUpNote;
      }
    } else if (scopeRedefinitionsCount >= 1) {
      status = 'attention';
      triggeredGuardrail = 'G-A8';
      primaryReason = `Horas ${hoursPct}% · Avance ${progressPct}% · Redefinición de alcance registrada (posible reforecast)`;
    } else if (additionalIterationsCount >= 1) {
      status = 'attention';
      triggeredGuardrail = 'G-A7';
      primaryReason = `Horas ${hoursPct}% · Avance ${progressPct}% · Ronda ${config.includedReworkRounds + additionalIterationsCount} de ajustes (Iteración adicional)`;
    } else if (rAct >= 2 || tOverdue >= 3 || internalAdjustmentsCount >= 2) {
      status = 'attention';
      triggeredGuardrail = 'G-A4';
      primaryReason = rAct >= 2
        ? `Horas ${hoursPct}% · Avance ${progressPct}% · ${rAct} tareas en retrabajo interno (QA)`
        : `Horas ${hoursPct}% · Avance ${progressPct}% · Deuda operativa (${tOverdue} tareas vencidas)`;
    } else if (hoursPct >= 80 && hoursPct < 100 && progressPct < 80) {
      status = 'attention';
      triggeredGuardrail = 'G-A5';
      primaryReason = `Horas ${hoursPct}% · Avance ${progressPct}% · Alerta preventiva de presupuesto de horas`;
    }
  }

  // PASO 3: Fallback a Score Compuesto si ningún guardrail se activó
  if (!triggeredGuardrail) {
    if (healthScore >= 80) {
      status = 'healthy';
      if (progressPct === 100) {
        primaryReason = `Horas ${hoursPct}% · Avance 100% · Proyecto culminado exitosamente en presupuesto`;
      } else if (consumedHours === 0 && progressPct === 0) {
        primaryReason = `Horas 0% · Avance 0% · Planificación inicial en curso`;
      } else {
        primaryReason = `Horas ${hoursPct}% · Avance ${progressPct}% · Cronograma y presupuesto al día`;
      }
    } else if (healthScore >= 60) {
      status = 'attention';
      primaryReason = `Horas ${hoursPct}% · Avance ${progressPct}% · Índice de salud compuesto en zona de atención (${healthScore}/100)`;
    } else {
      status = 'risk';
      primaryReason = `Horas ${hoursPct}% · Avance ${progressPct}% · Índice de salud compuesto en zona de riesgo (${healthScore}/100)`;
    }
  }

  badge = status === 'healthy' ? 'Saludable' : (status === 'attention' ? 'Atención' : 'Riesgo');

  return {
    status,
    score: healthScore,
    badge,
    primaryReason,
    secondaryReason: secondaryReason || undefined,
    vectors: {
      burn: { score: sBurn, deltaBurn, hoursPct, progressPct, consumedHours, totalBudget },
      schedule: { score: sSched, deltaDays: deltaBusinessDays, baselineEnd, forecastEnd },
      dependencies: { score: sDep, dAct, dUnf, dWarn },
      friction: { score: sFric, rAct, tOverdue, additionalIterationsCount, scopeRedefinitionsCount }
    },
    triggeredGuardrail,
    evaluatedAt: new Date().toISOString()
  };
}
