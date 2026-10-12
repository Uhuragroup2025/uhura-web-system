/**
 * Utilidades de formateo para Orbit (moneda, números, fechas)
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
