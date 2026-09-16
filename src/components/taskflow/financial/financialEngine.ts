import { QuoteProposal, QuoteDeliverable } from '../types';
import {
  CurrencyCode,
  PricingMode,
  QuoteFinancialConfig,
  QuoteFinancialSummary,
  ResourceCalculationLine,
  TaxClassification,
  UhuraRoleFinancialRate
} from './types';
import {
  COLOMBIA_PAYROLL_CONFIG,
  DEFAULT_EXCHANGE_RATES,
  DEFAULT_QUOTE_FINANCIAL_CONFIG,
  UHURA_ROLE_FINANCIAL_RATES
} from './constants';

/**
 * Busca la tarifa oficial de un rol en el catálogo de UHURA.
 * Si no coincide exactamente, aplica normalización de texto o valores fallback seguros.
 */
export function getRoleFinancialRate(roleName: string): UhuraRoleFinancialRate {
  const normalized = roleName.trim().toLowerCase();

  const exactMatch = UHURA_ROLE_FINANCIAL_RATES.find(
    (r) =>
      r.roleName.toLowerCase() === normalized ||
      (typeof r.matchedStandardRole === 'string' &&
        r.matchedStandardRole.toLowerCase() === normalized)
  );

  if (exactMatch) return exactMatch;

  // Búsqueda por palabras clave comunes
  if (normalized.includes('desarroll') || normalized.includes('front') || normalized.includes('dev')) {
    return UHURA_ROLE_FINANCIAL_RATES[0]; // Desarrollador Web Front-End
  }
  if (normalized.includes('product') || normalized.includes('lead') || normalized.includes('pm')) {
    return UHURA_ROLE_FINANCIAL_RATES[1]; // Product Lead
  }
  if (normalized.includes('design') || normalized.includes('diseñ')) {
    return UHURA_ROLE_FINANCIAL_RATES[2]; // Digital Designer
  }
  if (normalized.includes('content') || normalized.includes('contenid') || normalized.includes('redac')) {
    return UHURA_ROLE_FINANCIAL_RATES[4]; // Digital Content Specialist
  }
  if (normalized.includes('client') || normalized.includes('cuenta') || normalized.includes('account')) {
    return UHURA_ROLE_FINANCIAL_RATES[5]; // Client relationship
  }
  if (normalized.includes('growth') || normalized.includes('analyst')) {
    return UHURA_ROLE_FINANCIAL_RATES[7]; // Growth Manager
  }
  if (normalized.includes('traff') || normalized.includes('pauta') || normalized.includes('media')) {
    return UHURA_ROLE_FINANCIAL_RATES[9]; // Tracfiker
  }

  // Fallback promedio
  return {
    roleName,
    matchedStandardRole: roleName,
    costPerHourCOP: 30000,
    sellingRatePerHourCOP: 560000,
    defaultTaxClassification: 'taxed'
  };
}

/**
 * Consolida las horas cotizadas agrupadas por rol a partir de los entregables
 */
export function extractRoleBreakdown(
  quote: QuoteProposal,
  customTaxStatus?: Record<string, TaxClassification>
): ResourceCalculationLine[] {
  const roleMap: Record<
    string,
    {
      hours: number;
      exemptHours: number;
      taxedHours: number;
    }
  > = {};

  // Iterar por cada entregable para respetar exenciones por frente de trabajo
  (quote.deliverables || []).forEach((del) => {
    const deliverableTaxOverride = customTaxStatus ? customTaxStatus[del.id] : undefined;

    (del.backlogItems || []).forEach((item) => {
      const roleName = item.roleName || 'Desarrollador Web Front-End';
      const hours = Number(item.estimatedHours) || 0;
      const rate = getRoleFinancialRate(roleName);

      // Si el entregable tiene override de exención se usa, de lo contrario la clasificación del rol
      const isExempt = deliverableTaxOverride
        ? deliverableTaxOverride === 'exempt'
        : rate.defaultTaxClassification === 'exempt';

      if (!roleMap[roleName]) {
        roleMap[roleName] = { hours: 0, exemptHours: 0, taxedHours: 0 };
      }

      roleMap[roleName].hours += hours;
      if (isExempt) {
        roleMap[roleName].exemptHours += hours;
      } else {
        roleMap[roleName].taxedHours += hours;
      }
    });
  });

  return Object.entries(roleMap).map(([roleName, data]) => {
    const rate = getRoleFinancialRate(roleName);
    const totalCost = data.hours * rate.costPerHourCOP;
    const totalSelling = data.hours * rate.sellingRatePerHourCOP;
    // Si la mayoría de sus horas son exentas, se clasifica como exento
    const classification: TaxClassification =
      data.exemptHours >= data.taxedHours ? 'exempt' : 'taxed';

    return {
      roleName,
      hours: data.hours,
      costPerHourCOP: rate.costPerHourCOP,
      totalVariableCostCOP: totalCost,
      sellingRatePerHourCOP: rate.sellingRatePerHourCOP,
      totalDirectSellingValueCOP: totalSelling,
      taxClassification: classification
    };
  });
}

/**
 * Motor Financiero Principal de la Calculadora Comercial UHURA 2026.
 * Reproduce exactamente la matemática de las hojas 1, 3, 5 y 8 del Excel oficial.
 */
export function computeQuoteFinancials(
  quote: QuoteProposal,
  userConfig?: Partial<QuoteFinancialConfig>
): QuoteFinancialSummary {
  const config: QuoteFinancialConfig = {
    ...DEFAULT_QUOTE_FINANCIAL_CONFIG,
    ...(quote.financialConfig || {}),
    ...(userConfig || {})
  };

  const resourceLines = extractRoleBreakdown(quote, config.customDeliverableTaxStatus);

  const totalHours = resourceLines.reduce((acc, r) => acc + r.hours, 0);

  // 1. Costos Variables del Proyecto
  let variableCostExemptCOP = 0;
  let variableCostTaxedCOP = 0;

  resourceLines.forEach((r) => {
    if (r.taxClassification === 'exempt') {
      variableCostExemptCOP += r.totalVariableCostCOP;
    } else {
      variableCostTaxedCOP += r.totalVariableCostCOP;
    }
  });

  const totalVariableCostCOP = variableCostExemptCOP + variableCostTaxedCOP;

  // 2. Costo Overhead del Proyecto
  // Fórmula Excel: Semanas * % Ocupación * Tarifa Semanal Fija
  const weeks = Math.max(1, config.projectDurationWeeks || 1);
  const occupancyFactor = (config.overheadOccupancyPct || 0) / 100;
  const overheadCostCOP = Math.round(
    config.weeklyFixedOverheadCOP * weeks * occupancyFactor
  );

  // 3. Total Costos del Proyecto
  const totalProjectCostCOP = totalVariableCostCOP + overheadCostCOP;

  // 4. Margen y Subtotal de Venta antes de IVA
  // Fórmula Excel: Total Costos / (1 - Margen%)
  const marginDecimal = (config.targetMarginPct || 40) / 100;
  const safeMargin = Math.min(0.95, Math.max(0.01, marginDecimal));
  
  let subtotalBeforeTaxCOP = 0;
  if (config.pricingMode === 'rate_card') {
    // Modo Bolsa de Horas Directa (Hoja 8): Suma directa de horas * tarifa horaria comercial
    subtotalBeforeTaxCOP = resourceLines.reduce((acc, r) => acc + r.totalDirectSellingValueCOP, 0);
  } else {
    // Modo Proyecto por Entregables (Hoja 1 y 5): Costos totales / (1 - margen)
    subtotalBeforeTaxCOP = Math.round(totalProjectCostCOP / (1 - safeMargin));
  }

  const marginAmountCOP = Math.max(0, subtotalBeforeTaxCOP - totalProjectCostCOP);

  // 5. Distribución Tributaria (Exento vs Gravado)
  // Se prorratea el subtotal antes de IVA según el ratio de costo exento y gravado
  const exemptCostRatio =
    totalVariableCostCOP > 0 ? variableCostExemptCOP / totalVariableCostCOP : 1;

  const subtotalExemptCOP = Math.round(subtotalBeforeTaxCOP * exemptCostRatio);
  const subtotalTaxedCOP = subtotalBeforeTaxCOP - subtotalExemptCOP;

  // IVA del 19% aplicado ÚNICAMENTE sobre la porción gravada
  const ivaTaxPct = 19;
  const ivaTaxAmountCOP = Math.round(subtotalTaxedCOP * (ivaTaxPct / 100));

  // Precio final total con IVA
  const finalPriceWithTaxCOP = subtotalBeforeTaxCOP + ivaTaxAmountCOP;

  // 6. Conversión a la moneda seleccionada
  const currency = config.currency || 'COP';
  const exchangeRate = DEFAULT_EXCHANGE_RATES[currency] || 1;
  const exchangeMultiplier = currency === 'COP' ? 1 : 1 / exchangeRate;

  const finalPriceWithTaxSelectedCurrency = Math.round(
    finalPriceWithTaxCOP * exchangeMultiplier * 100
  ) / 100;
  const subtotalBeforeTaxSelectedCurrency = Math.round(
    subtotalBeforeTaxCOP * exchangeMultiplier * 100
  ) / 100;

  // 7. Bandas de Negociación (Max 50%, Target 40%, Min 35%)
  const maxMarginDecimal = (config.maxMarginPct || 50) / 100;
  const minMarginDecimal = (config.minMarginPct || 35) / 100;

  const maxSubtotal = Math.round(totalProjectCostCOP / (1 - maxMarginDecimal));
  const maxTaxed = Math.round(maxSubtotal * (1 - exemptCostRatio));
  const maxPriceWithTaxCOP = maxSubtotal + Math.round(maxTaxed * 0.19);

  const minSubtotal = Math.round(totalProjectCostCOP / (1 - minMarginDecimal));
  const minTaxed = Math.round(minSubtotal * (1 - exemptCostRatio));
  const minPriceWithTaxCOP = minSubtotal + Math.round(minTaxed * 0.19);

  const nominalDiscountCOP = Math.max(0, maxPriceWithTaxCOP - finalPriceWithTaxCOP);
  const percentDiscount =
    maxPriceWithTaxCOP > 0
      ? Math.round((nominalDiscountCOP / maxPriceWithTaxCOP) * 1000) / 10
      : 0;

  // 8. Alertas y Gobernanza Comercial (Decisión 4 de la reunión)
  const minThreshold = config.minMarginPct || 35;
  const requiresApproval = config.targetMarginPct < minThreshold;
  let warningMessage: string | undefined = undefined;

  if (requiresApproval) {
    warningMessage = `El margen objetivo (${config.targetMarginPct}%) está por debajo del umbral mínimo institucional (${minThreshold}%). Esta cotización requiere visto bueno y aprobación de Dirección General antes del envío formal.`;
  }

  return {
    totalHours,
    variableCostExemptCOP,
    variableCostTaxedCOP,
    totalVariableCostCOP,
    overheadCostCOP,
    totalProjectCostCOP,
    targetMarginPct: config.targetMarginPct,
    marginAmountCOP,
    subtotalBeforeTaxCOP,
    subtotalExemptCOP,
    subtotalTaxedCOP,
    ivaTaxPct,
    ivaTaxAmountCOP,
    finalPriceWithTaxCOP,
    selectedCurrency: currency,
    exchangeRateToCOP: exchangeRate,
    finalPriceWithTaxSelectedCurrency,
    subtotalBeforeTaxSelectedCurrency,
    bands: {
      maxPriceWithTaxCOP,
      targetPriceWithTaxCOP: finalPriceWithTaxCOP,
      minPriceWithTaxCOP,
      nominalDiscountCOP,
      percentDiscount
    },
    requiresApproval,
    warningMessage
  };
}

/**
 * Formateador de moneda en pesos colombianos o divisas extranjeras
 */
export function formatFinancialCurrency(
  value: number,
  currency: CurrencyCode = 'COP'
): string {
  if (currency === 'COP') {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2
  }).format(value);
}
