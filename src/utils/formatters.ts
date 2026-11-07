/**
 * Utilidades de formateo para ECO (moneda, números, fechas)
 * Centralizadas para evitar dependencias de módulos financieros retirados.
 */

export function formatCurrency(
  value: number = 0,
  currency: 'COP' | 'USD' = 'COP'
): string {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(safeValue);
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(safeValue);
}

// Alias de retrocompatibilidad
export const formatFinancialCurrency = formatCurrency;

export function formatHours(hours: number = 0): string {
  const safe = typeof hours === 'number' && !isNaN(hours) ? hours : 0;
  return `${safe}h`;
}

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * Fecha para mostrar en pantalla: «15 ago 2026».
 * - Solo formatea fechas reales (ISO «YYYY-MM-DD…»), en día civil, sin corrimientos de zona horaria.
 * - Un texto que no es ISO (datos heredados como «16 Ago 2026») se muestra tal cual.
 * - Sin fecha → «Sin fecha» (o el texto que se indique). Nunca inventa una fecha.
 */
export function formatDate(value?: string | null, empty = 'Sin fecha'): string {
  if (!value) return empty;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return value;
  const month = MONTHS_ES[Number(m[2]) - 1];
  if (!month) return value;
  return `${Number(m[3])} ${month} ${m[1]}`;
}

/** Rango «15 ago 2026 → 31 dic 2026»; si falta un extremo, «Sin fecha» en ese lado. */
export function formatDateRange(from?: string | null, to?: string | null, empty = 'Sin fecha'): string {
  return `${formatDate(from, empty)} → ${formatDate(to, empty)}`;
}
