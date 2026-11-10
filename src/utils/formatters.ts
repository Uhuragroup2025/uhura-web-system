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

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Fecha para mostrar en pantalla: «2026-Ago-15» (año-mes abreviado-día; decisión de Uhura, ronda 2).
 * - Solo formatea fechas reales (ISO «YYYY-MM-DD…»), en día civil, sin corrimientos de zona horaria.
 * - Un texto que no es ISO (datos heredados como «16 Ago 2026») se muestra tal cual.
 * - Sin fecha → «Sin fecha» (o el texto que se indique). Nunca inventa una fecha.
 */
export function formatDate(value?: string | null, empty = 'Sin fecha'): string {
  if (!value) return empty;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) {
    // Datos heredados «2 nov. 2026», «02 Nov 2026» o «16 Ago 2026 a las 14:30» → mismo formato.
    const legacy = /^(\d{1,2})\s+([a-zA-ZáéíóúÁÉÍÓÚ]{3})[a-zA-Z.]*\s+(?:de\s+)?(\d{4})(.*)$/.exec(value.trim());
    const idx = legacy ? MONTHS_ES.findIndex((mo) => mo.toLowerCase() === legacy[2].toLowerCase()) : -1;
    return legacy && idx >= 0 ? `${legacy[3]}-${MONTHS_ES[idx]}-${legacy[1].padStart(2, '0')}${legacy[4]}` : value;
  }
  const month = MONTHS_ES[Number(m[2]) - 1];
  if (!month) return value;
  return `${m[1]}-${month}-${m[3]}`;
}

/** Rango «2026-Ago-15 → 2026-Dic-31»; si falta un extremo, «Sin fecha» en ese lado. */
export function formatDateRange(from?: string | null, to?: string | null, empty = 'Sin fecha'): string {
  return `${formatDate(from, empty)} → ${formatDate(to, empty)}`;
}
