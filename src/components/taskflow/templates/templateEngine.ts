import {
  ProductBacklogTemplate,
  TemplateDeliverable,
  TemplateBacklogItem,
  QuoteProposal,
  QuoteDeliverable,
  QuoteBacklogItem,
  QuoteRoleBudget,
  CommercialCalculatorContract,
  STANDARD_UHURA_ROLES
} from '../types';

/**
 * MOTOR DE CÁLCULO DE TRES NIVELES DE HORAS (Orbit Template Engine)
 *
 * Nivel 1 — Horas de Actividad:
 *   Suma de estimaciones técnicas de cada tarea del backlog.
 *
 * Nivel 2 — Horas Cotizadas por Rol (Rollup):
 *   Agrupación de horas de las actividades por cada roleId estándar.
 *
 * Nivel 3 — Horas Totales:
 *   Suma global de los roleBudgets (coincide exactamente con el total de actividades).
 */

/**
 * Nivel 2: Calcula el rollup de horas agrupadas por rol para una lista de actividades.
 */
export function computeRoleBudgetsFromActivities(
  activities: { roleId: string; roleName: string; estimatedHours: number }[]
): { roleId: string; roleName: string; quotedHours: number }[] {
  const roleMap = new Map<string, { roleName: string; hours: number }>();

  activities.forEach((act) => {
    const hours = Number(act.estimatedHours) || 0;
    const existing = roleMap.get(act.roleId);
    if (existing) {
      existing.hours += hours;
    } else {
      roleMap.set(act.roleId, {
        roleName: act.roleName || act.roleId,
        hours
      });
    }
  });

  return Array.from(roleMap.entries())
    .map(([roleId, data]) => ({
      roleId,
      roleName: data.roleName,
      quotedHours: Math.round(data.hours * 10) / 10
    }))
    .filter((rb) => rb.quotedHours > 0)
    .sort((a, b) => b.quotedHours - a.quotedHours);
}

/**
 * Nivel 3: Calcula el total de horas sumando los presupuestos por rol.
 */
export function computeTotalHoursFromRoleBudgets(
  roleBudgets: { quotedHours: number }[]
): number {
  const total = roleBudgets.reduce((acc, rb) => acc + (Number(rb.quotedHours) || 0), 0);
  return Math.round(total * 10) / 10;
}

/**
 * Recalcula completamente la estructura de horas (Niveles 1, 2 y 3) de una plantilla
 */
export function recalculateTemplateHours(template: ProductBacklogTemplate): ProductBacklogTemplate {
  const updatedDeliverables = template.deliverables.map((del) => {
    const roleBudgets = computeRoleBudgetsFromActivities(del.activities).map((rb, idx) => ({
      id: `trb-${del.id}-${idx}-${Date.now()}`,
      deliverableId: del.id,
      roleId: rb.roleId,
      roleName: rb.roleName,
      quotedHours: rb.quotedHours
    }));

    const deliverableTotal = computeTotalHoursFromRoleBudgets(roleBudgets);

    return {
      ...del,
      roleBudgets,
      totalHoursRollup: deliverableTotal
    };
  });

  // Rollup global de todas las actividades de la plantilla
  const allActivities = updatedDeliverables.flatMap((d) => d.activities);
  const globalRoleBudgets = computeRoleBudgetsFromActivities(allActivities).map((rb, idx) => ({
    id: `gtrb-${template.id}-${idx}`,
    deliverableId: template.id,
    roleId: rb.roleId,
    roleName: rb.roleName,
    quotedHours: rb.quotedHours
  }));

  const globalTotalHours = computeTotalHoursFromRoleBudgets(globalRoleBudgets);

  return {
    ...template,
    deliverables: updatedDeliverables,
    roleBudgetsRollup: globalRoleBudgets,
    totalHours: globalTotalHours,
    updatedAt: new Date().toISOString()
  };
}

/**
 * REGLA FUNDAMENTAL: CLONADO INDEPENDIENTE
 *
 * Clona una ProductBacklogTemplate hacia una QuoteProposal sin modificar
 * la plantilla maestra original (deep clone).
 */
export function cloneTemplateToQuote(
  template: ProductBacklogTemplate,
  options?: {
    opportunityId?: string;
    versionLabel?: string;
    order?: number;
  }
): QuoteProposal {
  const timestamp = Date.now();
  const quoteId = `quote-${timestamp}`;
  const opportunityId = options?.opportunityId || `opp-${timestamp}`;

  // Clona entregables y genera nuevos identificadores independientes
  const quoteDeliverables: QuoteDeliverable[] = template.deliverables.map((del, dIdx) => {
    const quoteDelId = `qd-${timestamp}-${dIdx + 1}`;

    const backlogItems: QuoteBacklogItem[] = del.activities.map((act, aIdx) => ({
      id: `qbi-${timestamp}-${dIdx + 1}-${aIdx + 1}`,
      quoteDeliverableId: quoteDelId,
      title: act.title,
      description: act.description || '',
      roleId: act.roleId,
      roleName: act.roleName,
      estimatedHours: act.estimatedHours,
      order: act.order || aIdx + 1,
      dependencies: act.dependencyIds ? [...act.dependencyIds] : [],
      suggestedUserId: null // Regla: sin ejecutor asignado al clonar
    }));

    // Nivel 2: Role budgets del entregable
    const roleBudgets: QuoteRoleBudget[] = computeRoleBudgetsFromActivities(backlogItems).map(
      (rb, rIdx) => ({
        id: `qrb-${quoteDelId}-${rIdx + 1}`,
        quoteDeliverableId: quoteDelId,
        roleId: rb.roleId,
        roleName: rb.roleName,
        quotedHours: rb.quotedHours
      })
    );

    const deliverableTotal = computeTotalHoursFromRoleBudgets(roleBudgets);

    return {
      id: quoteDelId,
      quoteId,
      name: del.name,
      description: del.description || '',
      order: del.order || dIdx + 1,
      roleBudgets,
      backlogItems,
      totalHoursRollup: deliverableTotal
    };
  });

  // Nivel 3: Horas totales de la cotización
  const allQuoteActivities = quoteDeliverables.flatMap((d) => d.backlogItems);
  const globalRoleBudgets = computeRoleBudgetsFromActivities(allQuoteActivities);
  const totalHoursRollup = computeTotalHoursFromRoleBudgets(globalRoleBudgets);

  const now = new Date().toISOString();

  return {
    id: quoteId,
    opportunityId,
    versionLabel: options?.versionLabel || `Opción A: ${template.name}`,
    order: options?.order || 1,
    templateId: template.id, // Referencia de trazabilidad histórica sin acoplamiento
    status: 'draft',
    deliverables: quoteDeliverables,
    totalHoursRollup,
    currency: 'COP',
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Crea una cotización desde cero (Proyecto a la medida)
 */
export function createBlankCustomQuote(options?: {
  opportunityId?: string;
  versionLabel?: string;
  order?: number;
}): QuoteProposal {
  const timestamp = Date.now();
  const quoteId = `quote-custom-${timestamp}`;
  const opportunityId = options?.opportunityId || `opp-${timestamp}`;
  const now = new Date().toISOString();

  const initialDeliverableId = `qd-${timestamp}-1`;

  const blankDeliverable: QuoteDeliverable = {
    id: initialDeliverableId,
    quoteId,
    name: 'Entregable 1 (Personalizado)',
    description: 'Alcance a la medida definido para esta propuesta',
    order: 1,
    roleBudgets: [],
    backlogItems: [
      {
        id: `qbi-${timestamp}-1`,
        quoteDeliverableId: initialDeliverableId,
        title: 'Discovery técnico inicial & Requerimientos',
        description: 'Levantamiento de especificaciones con el cliente',
        roleId: STANDARD_UHURA_ROLES[3], // Product Lead
        roleName: STANDARD_UHURA_ROLES[3],
        estimatedHours: 4.0,
        order: 1,
        dependencies: [],
        suggestedUserId: null
      }
    ],
    totalHoursRollup: 4.0
  };

  // Rollup de horas iniciales
  const roleBudgets: QuoteRoleBudget[] = [
    {
      id: `qrb-${initialDeliverableId}-1`,
      quoteDeliverableId: initialDeliverableId,
      roleId: STANDARD_UHURA_ROLES[3],
      roleName: STANDARD_UHURA_ROLES[3],
      quotedHours: 4.0
    }
  ];
  blankDeliverable.roleBudgets = roleBudgets;

  return {
    id: quoteId,
    opportunityId,
    versionLabel: options?.versionLabel || 'Cotización a la Medida (Desde Cero)',
    order: options?.order || 1,
    templateId: null, // Sin plantilla base
    status: 'draft',
    deliverables: [blankDeliverable],
    totalHoursRollup: 4.0,
    currency: 'COP',
    createdAt: now,
    updatedAt: now
  };
}

/**
 * CONTRATO PREPARADO PARA CALCULADORA COMERCIAL (Google Sheets)
 * No inventa tarifas, salarios, markup ni márgenes.
 */
export function prepareCommercialCalculatorContract(
  quote: QuoteProposal
): CommercialCalculatorContract {
  // Consolidar todos los role budgets de todos los entregables de la cotización
  const allItems = quote.deliverables.flatMap((d) => d.backlogItems);
  const consolidated = computeRoleBudgetsFromActivities(allItems).map((rb, idx) => ({
    id: `ccrb-${quote.id}-${idx}`,
    quoteDeliverableId: quote.id,
    roleId: rb.roleId,
    roleName: rb.roleName,
    quotedHours: rb.quotedHours
  }));

  const totalHours = computeTotalHoursFromRoleBudgets(consolidated);

  return {
    quoteId: quote.id,
    roleBudgets: consolidated,
    totalHours,
    currency: quote.currency || 'COP',
    estimatedTotalValue: null, // Pendiente de la fórmula real de Sheets que proporcionará el usuario
    status: 'pending_sheets_formula',
    notes: 'Contrato listo. Esperando matriz de tarifas y márgenes de Google Sheets.'
  };
}
