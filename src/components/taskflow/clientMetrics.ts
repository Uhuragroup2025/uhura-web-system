import type { ClientProfile, ClientProjectHistoryItem, ProjectSummaryItem } from './types';

/**
 * Métricas de la cuenta calculadas con datos reales (07 Nov 2026).
 * Regla: nunca inventar. Si no hay datos, se dice «Sin datos» y por qué.
 *
 * - Proyectos: los proyectos de ECO del cliente + el historial guardado (sin duplicar).
 * - Valor vendido: suma del valor vendido en COP de los proyectos de ECO.
 * - Margen: promedio del margen real de proyectos cerrados que lo tengan.
 * - Facturación y cartera: no existen en ECO hasta la integración con facturación (Alegra).
 * - Salud: solo con las dimensiones que tengan datos, y mínimo 2 (si no, «Sin datos»).
 */

export type DimStatus = 'verde' | 'amarillo' | 'rojo' | 'sin_datos';

export interface HealthDim {
  key: 'rentabilidad' | 'cartera' | 'cumplimiento' | 'relacion';
  title: string;
  status: DimStatus;
  score: number | null;
  note: string;
}

export type AccountHealth = 'Saludable' | 'Atención' | 'En riesgo' | 'Sin datos';

export interface ProjectRow extends Omit<ClientProjectHistoryItem, 'trafficLight'> {
  trafficLight: 'verde' | 'amarillo' | 'rojo' | null;
  isEcoProject: boolean;
}

export interface ClientMetrics {
  rows: ProjectRow[];
  total: number;
  active: number;
  closed: number;
  soldValueCOP: number;
  soldProjectsCount: number;
  averageMargin: number | null;
  dims: HealthDim[];
  health: AccountHealth;
  healthScore: number | null;
}

const isClientProject = (client: ClientProfile, p: ProjectSummaryItem) =>
  p.clientId === client.id ||
  (Boolean(p.clientName) && p.clientName.toLowerCase() === client.name.toLowerCase()) ||
  (Boolean(p.brand) && (p.brand || '').toLowerCase() === client.name.toLowerCase());

const projectStatus = (p: ProjectSummaryItem): ProjectRow['status'] => {
  const s = String(p.status || '').toLowerCase();
  if (p.closure || ['cerrado', 'completed', 'archivado', 'cancelled'].includes(s)) return 'Cerrado';
  if (['en pausa', 'on_hold'].includes(s)) return 'En Pausa';
  if (['planificación', 'draft'].includes(s) || p.isKickedOff === false) return 'Planificación';
  return 'Activo';
};

const healthLight = (p: ProjectSummaryItem): ProjectRow['trafficLight'] => {
  const b = p.projectHealth?.badge;
  return b === 'Saludable' ? 'verde' : b === 'Atención' ? 'amarillo' : b === 'Riesgo' ? 'rojo' : null;
};

export function computeClientMetrics(client: ClientProfile, projects: ProjectSummaryItem[] = []): ClientMetrics {
  const own = projects.filter((p) => isClientProject(client, p));
  const rows: ProjectRow[] = own.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand || client.name,
    tag: p.projectType === 'fee_monthly' ? 'FEE' : 'PRJ',
    status: projectStatus(p),
    quotedValueCOP: p.soldValue ? `$${p.soldValue.toLocaleString('es-CO')} ${p.soldCurrency || 'COP'}` : 'Por definir',
    realMarginPercent: null,
    trafficLight: healthLight(p),
    isEcoProject: true
  }));
  for (const h of client.projectsHistory || []) {
    if (!rows.some((r) => r.id === h.id || r.name === h.name)) rows.push({ ...h, isEcoProject: false });
  }

  const active = rows.filter((r) => r.status === 'Activo').length;
  const closed = rows.filter((r) => r.status === 'Cerrado').length;
  const soldOwn = own.filter((p) => (p.soldValueCOP || 0) > 0);
  const soldValueCOP = soldOwn.reduce((sum, p) => sum + (p.soldValueCOP || 0), 0);

  const margins = rows.map((r) => r.realMarginPercent).filter((m): m is number => typeof m === 'number');
  const averageMargin = margins.length ? Math.round(margins.reduce((a, b) => a + b, 0) / margins.length) : null;

  // 1. Rentabilidad
  const rentabilidad: HealthDim =
    averageMargin === null
      ? { key: 'rentabilidad', title: 'Rentabilidad', status: 'sin_datos', score: null, note: 'Sin datos: se calcula con el margen real de los proyectos cerrados.' }
      : {
          key: 'rentabilidad',
          title: 'Rentabilidad',
          status: averageMargin >= 35 ? 'verde' : averageMargin >= 25 ? 'amarillo' : 'rojo',
          score: Math.max(0, Math.min(100, Math.round((averageMargin / 40) * 100))),
          note: `Margen promedio ${averageMargin} % en ${margins.length} proyecto${margins.length === 1 ? '' : 's'} cerrado${margins.length === 1 ? '' : 's'} (meta ≥ 30 %).`
        };

  // 2. Cartera: no hay facturación en ECO todavía
  const cartera: HealthDim = {
    key: 'cartera',
    title: 'Cartera y cobranza',
    status: 'sin_datos',
    score: null,
    note: 'Sin datos: llega con la integración de facturación (Alegra).'
  };

  // 3. Cumplimiento: cierres a tiempo; si no hay cierres, salud actual de los proyectos activos
  const closures = own.filter((p) => p.closure && typeof p.closure.deviationBusinessDays === 'number');
  const withHealth = own.filter((p) => projectStatus(p) === 'Activo' && p.projectHealth);
  let cumplimiento: HealthDim;
  if (closures.length > 0) {
    const onTime = closures.filter((p) => (p.closure?.deviationBusinessDays || 0) <= 0).length;
    const pct = Math.round((onTime / closures.length) * 100);
    cumplimiento = {
      key: 'cumplimiento',
      title: 'Cumplimiento',
      status: pct >= 85 ? 'verde' : pct >= 70 ? 'amarillo' : 'rojo',
      score: pct,
      note: `${onTime} de ${closures.length} proyectos cerrados se entregaron a tiempo (${pct} %).`
    };
  } else if (withHealth.length > 0) {
    const ok = withHealth.filter((p) => p.projectHealth?.badge === 'Saludable').length;
    const pct = Math.round((ok / withHealth.length) * 100);
    cumplimiento = {
      key: 'cumplimiento',
      title: 'Cumplimiento',
      status: pct >= 85 ? 'verde' : pct >= 70 ? 'amarillo' : 'rojo',
      score: pct,
      note: `${ok} de ${withHealth.length} proyectos activos van saludables (sin cierres todavía).`
    };
  } else {
    cumplimiento = { key: 'cumplimiento', title: 'Cumplimiento', status: 'sin_datos', score: null, note: 'Sin datos: se calcula con la salud y los cierres de sus proyectos.' };
  }

  // 4. Relación / recurrencia: fee activo o cantidad de proyectos
  const hasActiveFee = own.some((p) => p.projectType === 'fee_monthly' && projectStatus(p) === 'Activo');
  const relacion: HealthDim =
    rows.length === 0
      ? { key: 'relacion', title: 'Recurrencia', status: 'sin_datos', score: null, note: 'Sin proyectos todavía.' }
      : hasActiveFee || rows.length >= 3
      ? { key: 'relacion', title: 'Recurrencia', status: 'verde', score: 90, note: hasActiveFee ? 'Fee mensual activo: relación continua.' : `${rows.length} proyectos con la cuenta.` }
      : {
          key: 'relacion',
          title: 'Recurrencia',
          status: 'amarillo',
          score: rows.length === 2 ? 75 : 60,
          note: rows.length === 2 ? '2 proyectos con la cuenta.' : 'Un proyecto puntual por ahora.'
        };

  const dims = [rentabilidad, cartera, cumplimiento, relacion];
  const known = dims.filter((d) => d.status !== 'sin_datos');
  // Se califica la salud solo con al menos 2 dimensiones con datos; con una sola no es confiable.
  const enough = known.length >= 2;
  const health: AccountHealth =
    !enough ? 'Sin datos' : known.some((d) => d.status === 'rojo') ? 'En riesgo' : known.some((d) => d.status === 'amarillo') ? 'Atención' : 'Saludable';
  const healthScore = enough ? Math.round(known.reduce((a, d) => a + (d.score || 0), 0) / known.length) : null;

  return { rows, total: rows.length, active, closed, soldValueCOP, soldProjectsCount: soldOwn.length, averageMargin, dims, health, healthScore };
}

export const HEALTH_STYLE: Record<AccountHealth, { text: string; dot: string }> = {
  Saludable: { text: 'text-[#16a34a]', dot: 'bg-[#10b981]' },
  Atención: { text: 'text-[#d97706]', dot: 'bg-[#f59e0b]' },
  'En riesgo': { text: 'text-[#dc2626]', dot: 'bg-[#ef4444]' },
  'Sin datos': { text: 'text-[#64748b]', dot: 'bg-[#cbd5e1]' }
};

export const DIM_DOT: Record<DimStatus, string> = {
  verde: 'bg-[#10b981]',
  amarillo: 'bg-[#f59e0b]',
  rojo: 'bg-[#ef4444]',
  sin_datos: 'bg-[#cbd5e1]'
};
