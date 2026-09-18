import { CurrencyCode, UhuraRoleFinancialRate, QuoteFinancialConfig } from './types';

/**
 * Tasas de cambio base según la Hoja 1 del Excel oficial de UHURA 2026
 * (Valores por cada unidad de moneda extranjera en pesos colombianos COP)
 */
export const DEFAULT_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  COP: 1,
  USD: 3130.32,
  MXN: 181.88,
  BRL: 608.94,
  INR: 32.59
};

/**
 * Factores prestacionales y base laboral Colombia (Paso 1)
 */
export const COLOMBIA_PAYROLL_CONFIG = {
  standardPayrollFactor: 0.47,     // 47% Factor prestacional ordinario
  integralPayrollFactor: 0.25,     // 25% Factor prestacional integral
  monthlyWorkingHours: 176,        // 176 horas al mes
  ivaRate: 0.19                    // 19% IVA Colombia
};

/**
 * Tarifa semanal de Gastos Fijos (Overhead) de UHURA Group.
 * En la calculadora oficial (Captura 1):
 * 8 semanas * 11% ocupación = $18.533.175 COP
 * Tarifa semanal base = $18.533.175 / (8 * 0.11) = $21.060.426 COP / semana
 */
export const DEFAULT_WEEKLY_FIXED_OVERHEAD_COP = 21060426;

/**
 * Catálogo Financiero Oficial de Roles UHURA (Hojas 1, 3 y 8)
 * Contiene tanto el costo interno variable por hora como la tarifa comercial por hora.
 */
export const UHURA_ROLE_FINANCIAL_RATES: UhuraRoleFinancialRate[] = [
  {
    roleName: 'Front-End Dev',
    matchedStandardRole: 'Front-End Dev',
    costPerHourCOP: 33638,
    sellingRatePerHourCOP: 570608,
    defaultTaxClassification: 'exempt' // Software y desarrollo web exento bajo marco tributario COL
  },
  {
    roleName: 'Product Lead',
    matchedStandardRole: 'Product Lead',
    costPerHourCOP: 51034,
    sellingRatePerHourCOP: 599601,
    defaultTaxClassification: 'exempt' // Dirección técnica de producto de software
  },
  {
    roleName: 'Digital Designer',
    matchedStandardRole: 'Digital Designer',
    costPerHourCOP: 25258,
    sellingRatePerHourCOP: 556641,
    defaultTaxClassification: 'taxed'
  },
  {
    roleName: 'Creative Designer',
    matchedStandardRole: 'Creative Designer',
    costPerHourCOP: 25258,
    sellingRatePerHourCOP: 556641,
    defaultTaxClassification: 'taxed'
  },
  {
    roleName: 'Digital Content Specialist',
    matchedStandardRole: 'Digital Content Specialist',
    costPerHourCOP: 30381,
    sellingRatePerHourCOP: 565180,
    defaultTaxClassification: 'taxed'
  },
  {
    roleName: 'Client Relationship Strategist',
    matchedStandardRole: 'Client Relationship Strategist',
    costPerHourCOP: 28598,
    sellingRatePerHourCOP: 562208,
    defaultTaxClassification: 'taxed'
  },
  {
    roleName: 'Directora Comercial',
    matchedStandardRole: 'Directora Comercial',
    costPerHourCOP: 58208,
    sellingRatePerHourCOP: 611557,
    defaultTaxClassification: 'taxed'
  },
  {
    roleName: 'Growth Manager',
    matchedStandardRole: 'Growth Manager',
    costPerHourCOP: 55000,
    sellingRatePerHourCOP: 631530,
    defaultTaxClassification: 'taxed'
  },
  {
    roleName: 'Community Manager',
    matchedStandardRole: 'Community Manager',
    costPerHourCOP: 24000,
    sellingRatePerHourCOP: 550364,
    defaultTaxClassification: 'taxed'
  },
  {
    roleName: 'Trafficker Media',
    matchedStandardRole: 'Trafficker Media',
    costPerHourCOP: 32000,
    sellingRatePerHourCOP: 572543,
    defaultTaxClassification: 'taxed'
  },
  {
    roleName: 'Creative Strategy Lead',
    matchedStandardRole: 'Creative Strategy Lead',
    costPerHourCOP: 54000,
    sellingRatePerHourCOP: 646492,
    defaultTaxClassification: 'taxed'
  },
  {
    roleName: 'Content Creator',
    matchedStandardRole: 'Content Creator',
    costPerHourCOP: 26500,
    sellingRatePerHourCOP: 560329,
    defaultTaxClassification: 'taxed'
  }
];

/**
 * Configuración financiera predeterminada para nuevas cotizaciones
 */
export const DEFAULT_QUOTE_FINANCIAL_CONFIG: QuoteFinancialConfig = {
  projectDurationWeeks: 8,
  overheadOccupancyPct: 11,
  weeklyFixedOverheadCOP: DEFAULT_WEEKLY_FIXED_OVERHEAD_COP,
  targetMarginPct: 40,
  minMarginPct: 35,
  maxMarginPct: 50,
  currency: 'COP',
  pricingMode: 'deliverables'
};
