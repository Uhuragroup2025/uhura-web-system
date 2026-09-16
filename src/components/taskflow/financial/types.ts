import { StandardUhuraRole } from '../types';

export type CurrencyCode = 'COP' | 'USD' | 'MXN' | 'BRL' | 'INR';

export type TaxClassification = 'exempt' | 'taxed';

export type PricingMode = 'deliverables' | 'rate_card';

/**
 * Tarifa financiera oficial por rol en UHURA
 */
export interface UhuraRoleFinancialRate {
  roleName: string;
  matchedStandardRole: StandardUhuraRole | string;
  // Costo variable interno por hora (costo empresa)
  costPerHourCOP: number;
  // Tarifa comercial directa de venta por hora (Hoja 8 del Excel oficial)
  sellingRatePerHourCOP: number;
  // Clasificación DIAN por defecto para Colombia (software/desarrollo exento, consultoría/creatividad gravado)
  defaultTaxClassification: TaxClassification;
}

/**
 * Configuración financiera del proyecto / cotización
 */
export interface QuoteFinancialConfig {
  projectDurationWeeks: number;      // Tiempo estimado en semanas (ej. 8)
  overheadOccupancyPct: number;      // % de ocupación del overhead de la agencia (ej. 11%)
  weeklyFixedOverheadCOP: number;    // Tarifa semanal de gastos fijos de UHURA (ej. $21.060.426 COP)
  targetMarginPct: number;           // Margen objetivo deseado (ej. 40%)
  minMarginPct: number;              // Margen mínimo para banda de descuento (ej. 35%)
  maxMarginPct: number;              // Margen máximo para banda de negociación (ej. 50%)
  currency: CurrencyCode;            // Moneda de presentación (ej. COP, USD)
  pricingMode: PricingMode;          // 'deliverables' (proyecto) | 'rate_card' (bolsa horas directa)
  customDeliverableTaxStatus?: Record<string, TaxClassification>; // Overrides por entregable
  customRoleCosts?: Record<string, number>;
  customRoleSellingRates?: Record<string, number>;
}

/**
 * Línea de recurso calculada
 */
export interface ResourceCalculationLine {
  roleName: string;
  hours: number;
  costPerHourCOP: number;
  totalVariableCostCOP: number;
  sellingRatePerHourCOP: number;
  totalDirectSellingValueCOP: number;
  taxClassification: TaxClassification;
}

/**
 * Resumen consolidado del motor de cotización (Resumen Costos / Rentabilidad)
 */
export interface QuoteFinancialSummary {
  totalHours: number;
  
  // Costos Variables
  variableCostExemptCOP: number;
  variableCostTaxedCOP: number;
  totalVariableCostCOP: number;
  
  // Overhead Asignado
  overheadCostCOP: number;
  
  // Total Costos Proyecto (Variable + Overhead)
  totalProjectCostCOP: number;
  
  // Margen y Precios antes de IVA
  targetMarginPct: number;
  marginAmountCOP: number;
  subtotalBeforeTaxCOP: number;
  
  // Distribución Tributaria (Colombia)
  subtotalExemptCOP: number;
  subtotalTaxedCOP: number;
  ivaTaxPct: number;                 // 19%
  ivaTaxAmountCOP: number;            // 19% sobre la base gravada exclusivamente
  
  // Precio Final de Venta al Cliente
  finalPriceWithTaxCOP: number;
  
  // En moneda seleccionada (si es diferente de COP)
  selectedCurrency: CurrencyCode;
  exchangeRateToCOP: number;
  finalPriceWithTaxSelectedCurrency: number;
  subtotalBeforeTaxSelectedCurrency: number;
  
  // Bandas de Negociación y Descuentos
  bands: {
    maxPriceWithTaxCOP: number;      // Al margen máximo (50%)
    targetPriceWithTaxCOP: number;   // Al margen deseado (40%)
    minPriceWithTaxCOP: number;      // Al margen mínimo (35%)
    nominalDiscountCOP: number;      // Descuento respecto al precio lista máximo
    percentDiscount: number;         // % descuento respecto al precio lista máximo
  };
  
  // Gobernanza y Alertas Comerciales
  requiresApproval: boolean;         // true si targetMarginPct < minMarginPct (35%)
  warningMessage?: string;
}
