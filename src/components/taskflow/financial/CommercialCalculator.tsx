import React, { useState, useMemo } from 'react';
import { QuoteProposal, QuoteDeliverable } from '../types';
import {
  CurrencyCode,
  PricingMode,
  QuoteFinancialConfig,
  TaxClassification
} from './types';
import {
  DEFAULT_EXCHANGE_RATES,
  DEFAULT_QUOTE_FINANCIAL_CONFIG,
  DEFAULT_WEEKLY_FIXED_OVERHEAD_COP
} from './constants';
import {
  computeQuoteFinancials,
  extractRoleBreakdown,
  formatFinancialCurrency
} from './financialEngine';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ChevronRight,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Sliders,
  RotateCcw
} from 'lucide-react';

interface CommercialCalculatorProps {
  quote: QuoteProposal;
  allQuotes?: QuoteProposal[];
  opportunityTitle?: string;
  prospectName?: string;
  onUpdateQuote: (updatedQuote: QuoteProposal) => void;
  onSelectQuoteVersion?: (quoteId: string) => void;
  onGoToBacklogScoping?: () => void;
}

export const CommercialCalculator: React.FC<CommercialCalculatorProps> = ({
  quote,
  allQuotes = [],
  opportunityTitle = 'Oportunidad Comercial',
  prospectName = 'Prospecto',
  onUpdateQuote,
  onSelectQuoteVersion,
  onGoToBacklogScoping
}) => {
  // Configuración local editable sincronizada con quote.financialConfig
  const currentConfig: QuoteFinancialConfig = useMemo(() => {
    return {
      ...DEFAULT_QUOTE_FINANCIAL_CONFIG,
      ...(quote.financialConfig || {})
    };
  }, [quote.financialConfig]);

  const [weeks, setWeeks] = useState<number>(currentConfig.projectDurationWeeks);
  const [occupancyPct, setOccupancyPct] = useState<number>(currentConfig.overheadOccupancyPct);
  const [targetMargin, setTargetMargin] = useState<number>(currentConfig.targetMarginPct);
  const [currency, setCurrency] = useState<CurrencyCode>(currentConfig.currency || 'COP');
  const [pricingMode, setPricingMode] = useState<PricingMode>(currentConfig.pricingMode || 'deliverables');
  const [weeklyOverhead, setWeeklyOverhead] = useState<number>(currentConfig.weeklyFixedOverheadCOP);
  const [showOverheadConfig, setShowOverheadConfig] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Overrides de exención por entregable
  const [customTaxStatus, setCustomTaxStatus] = useState<Record<string, TaxClassification>>(
    currentConfig.customDeliverableTaxStatus || {}
  );

  // Computar resumen en tiempo real
  const financialSummary = useMemo(() => {
    return computeQuoteFinancials(quote, {
      projectDurationWeeks: weeks,
      overheadOccupancyPct: occupancyPct,
      targetMarginPct: targetMargin,
      currency,
      pricingMode,
      weeklyFixedOverheadCOP: weeklyOverhead,
      customDeliverableTaxStatus: customTaxStatus
    });
  }, [quote, weeks, occupancyPct, targetMargin, currency, pricingMode, weeklyOverhead, customTaxStatus]);

  // Lista de recursos
  const resourceLines = useMemo(() => {
    return extractRoleBreakdown(quote, customTaxStatus);
  }, [quote, customTaxStatus]);

  // Sincronizar cambios hacia la cotización
  const handleSaveConfig = (newPartial: Partial<QuoteFinancialConfig>) => {
    const updatedConfig: QuoteFinancialConfig = {
      ...currentConfig,
      projectDurationWeeks: weeks,
      overheadOccupancyPct: occupancyPct,
      targetMarginPct: targetMargin,
      currency,
      pricingMode,
      weeklyFixedOverheadCOP: weeklyOverhead,
      customDeliverableTaxStatus: customTaxStatus,
      ...newPartial
    };

    const updatedQuote: QuoteProposal = {
      ...quote,
      financialConfig: updatedConfig,
      financialSummary,
      totalQuotedValueCOP: financialSummary.finalPriceWithTaxCOP,
      currency: currency === 'USD' ? 'USD' : 'COP',
      updatedAt: new Date().toISOString()
    };

    onUpdateQuote(updatedQuote);
  };

  // Toggle de exención por entregable
  const handleToggleDeliverableTax = (delId: string, current: TaxClassification) => {
    const next: TaxClassification = current === 'exempt' ? 'taxed' : 'exempt';
    const updated = {
      ...customTaxStatus,
      [delId]: next
    };
    setCustomTaxStatus(updated);
    handleSaveConfig({ customDeliverableTaxStatus: updated });
  };

  // Copiar resumen ejecutivo para enviar al cliente o dirección
  const handleCopySummary = () => {
    const text = `PROSPECTO: ${prospectName}
PROYECTO: ${opportunityTitle} (${quote.versionLabel})
DURACIÓN ESTIMADA: ${weeks} semanas
TOTAL HORAS: ${financialSummary.totalHours}h
--------------------------------------------------
MODALIDAD: ${pricingMode === 'deliverables' ? 'Proyecto por Entregables' : 'Bolsa de Horas Directa'}
COSTO VARIABLE DEL PROYECTO: ${formatFinancialCurrency(financialSummary.totalVariableCostCOP)}
OVERHEAD ASIGNADO (${occupancyPct}%): ${formatFinancialCurrency(financialSummary.overheadCostCOP)}
TOTAL COSTOS DIRECTOS: ${formatFinancialCurrency(financialSummary.totalProjectCostCOP)}
MARGEN DE UTILIDAD (${targetMargin}%): ${formatFinancialCurrency(financialSummary.marginAmountCOP)}
--------------------------------------------------
SUBTOTAL ANTES DE IVA: ${formatFinancialCurrency(financialSummary.subtotalBeforeTaxCOP)}
- Base Exenta de IVA: ${formatFinancialCurrency(financialSummary.subtotalExemptCOP)}
- Base Gravada con IVA: ${formatFinancialCurrency(financialSummary.subtotalTaxedCOP)}
IVA (19% sobre base gravada): ${formatFinancialCurrency(financialSummary.ivaTaxAmountCOP)}
PRECIO TOTAL COTIZADO (+IVA): ${formatFinancialCurrency(financialSummary.finalPriceWithTaxCOP)} COP
${currency !== 'COP' ? `EQUIVALENTE EN ${currency} (TRM $${financialSummary.exchangeRateToCOP}): ${formatFinancialCurrency(financialSummary.finalPriceWithTaxSelectedCurrency, currency)}` : ''}
--------------------------------------------------
Generado por Orbit · Calculadora Comercial UHURA 2026`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#501f92] bg-[#501f92]/10 px-2.5 py-0.5 rounded-full">
                Calculadora Comercial UHURA 2026 · V.11/05/2026
              </span>
              <span className="text-xs text-[#64748b]">
                {prospectName} · {opportunityTitle}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#0f172a] mt-1 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#501f92]" />
              <span>Cotizador Financiero & Rentabilidad</span>
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Matemática comercial oficial: Horas de Backlog + Gastos Variables + Overhead Asignado + Margen + Tratamiento Tributario de IVA (19% Colombia).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Version Selector */}
            {allQuotes.length > 1 && onSelectQuoteVersion && (
              <select
                value={quote.id}
                onChange={(e) => onSelectQuoteVersion(e.target.value)}
                className="text-xs font-bold text-[#0f172a] bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-2 cursor-pointer focus:ring-2 focus:ring-[#501f92]"
              >
                {allQuotes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.versionLabel} ({q.totalHoursRollup}h)
                  </option>
                ))}
              </select>
            )}

            {/* Currency Selector */}
            <div className="flex items-center rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-0.5">
              {(['COP', 'USD', 'MXN', 'BRL', 'INR'] as CurrencyCode[]).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => {
                    setCurrency(cur);
                    handleSaveConfig({ currency: cur });
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    currency === cur
                      ? 'bg-[#501f92] text-white shadow-xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-xs font-bold text-[#475569] transition-colors cursor-pointer"
              title="Copiar resumen estructurado para correo o propuesta"
            >
              <Copy className="w-3.5 h-3.5 text-[#501f92]" />
              <span>{copiedNotification ? '¡Copiado!' : 'Copiar Resumen'}</span>
            </button>

            {onGoToBacklogScoping && (
              <button
                type="button"
                onClick={onGoToBacklogScoping}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ver Backlog de Actividades</span>
              </button>
            )}
          </div>
        </div>

        {/* Mode Selector Toggle: Proyecto vs Bolsa de Horas */}
        <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#475569]">Modalidad de Cotización:</span>
            <div className="inline-flex rounded-xl bg-[#f1f5f9] p-1 border border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => {
                  setPricingMode('deliverables');
                  handleSaveConfig({ pricingMode: 'deliverables' });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  pricingMode === 'deliverables'
                    ? 'bg-white text-[#501f92] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Proyecto por Entregables (Semanas + Overhead + Margen)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPricingMode('rate_card');
                  handleSaveConfig({ pricingMode: 'rate_card' });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  pricingMode === 'rate_card'
                    ? 'bg-white text-[#501f92] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Bolsa de Horas / Tarifario Directo (Hoja 8)
              </button>
            </div>
          </div>

          <div className="text-xs text-[#64748b]">
            {currency !== 'COP' && (
              <span>
                TRM Referencial {currency}/COP: <strong>${DEFAULT_EXCHANGE_RATES[currency].toLocaleString('es-CO')}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Warning / Governance Alert if margin < 35% */}
      {financialSummary.requiresApproval && (
        <div className="p-4 rounded-2xl bg-[#fffbeb] border border-[#fde68a] flex items-start gap-3 text-xs text-[#92400e] animate-in fade-in">
          <ShieldAlert className="w-5 h-5 text-[#d97706] shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="font-bold text-sm text-[#b45309]">
              Alerta de Gobernanza Comercial · Requiere Aprobación
            </p>
            <p className="leading-relaxed">
              {financialSummary.warningMessage}
            </p>
          </div>
          <span className="text-[10px] uppercase font-black bg-[#fef3c7] text-[#b45309] px-2.5 py-1 rounded-md border border-[#fde68a]">
            Visto Bueno Pendiente
          </span>
        </div>
      )}

      {/* Drivers / Parámetros Principales del Negocio (Hoja 1 y 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Driver 1: Semanas del Proyecto */}
        <div className="p-4 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748b]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Paso 1: Duración</span>
            <Calendar className="w-4 h-4 text-[#501f92]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0f172a] block">
              Tiempo Estimado (Semanas)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="52"
                step="0.5"
                value={weeks}
                onChange={(e) => {
                  const val = Math.max(1, parseFloat(e.target.value) || 1);
                  setWeeks(val);
                  handleSaveConfig({ projectDurationWeeks: val });
                }}
                className="w-full p-2 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a] font-black text-lg focus:ring-2 focus:ring-[#501f92]"
              />
              <span className="text-xs font-bold text-[#64748b]">sem</span>
            </div>
          </div>
          <p className="text-[11px] text-[#94a3b8]">
            Multiplica la tarifa semanal de overhead.
          </p>
        </div>

        {/* Driver 2: % Ocupación Overhead */}
        <div className="p-4 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748b]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Paso 2: Overhead</span>
            <TrendingUp className="w-4 h-4 text-[#501f92]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#0f172a]">
                % Ocupación Overhead
              </label>
              <span className="text-xs font-black text-[#501f92]">{occupancyPct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={occupancyPct}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 1;
                  setOccupancyPct(val);
                  handleSaveConfig({ overheadOccupancyPct: val });
                }}
                className="w-full accent-[#501f92] cursor-pointer"
              />
              <input
                type="number"
                min="1"
                max="100"
                value={occupancyPct}
                onChange={(e) => {
                  const val = Math.max(0, parseFloat(e.target.value) || 0);
                  setOccupancyPct(val);
                  handleSaveConfig({ overheadOccupancyPct: val });
                }}
                className="w-16 p-1 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] text-xs font-bold text-center"
              />
            </div>
          </div>
          <p className="text-[11px] text-[#94a3b8]">
            Carga asignada: <strong>{formatFinancialCurrency(financialSummary.overheadCostCOP)}</strong>
          </p>
        </div>

        {/* Driver 3: Margen Objetivo */}
        <div className="p-4 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748b]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Paso 3: Rentabilidad</span>
            <Percent className="w-4 h-4 text-[#501f92]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#0f172a]">
                Margen Deseado
              </label>
              <span className={`text-xs font-black ${targetMargin < 35 ? 'text-[#b45309]' : 'text-[#501f92]'}`}>
                {targetMargin}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="15"
                max="65"
                step="1"
                value={targetMargin}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 15;
                  setTargetMargin(val);
                  handleSaveConfig({ targetMarginPct: val });
                }}
                className="w-full accent-[#501f92] cursor-pointer"
              />
              <input
                type="number"
                min="5"
                max="90"
                value={targetMargin}
                onChange={(e) => {
                  const val = Math.max(5, parseFloat(e.target.value) || 5);
                  setTargetMargin(val);
                  handleSaveConfig({ targetMarginPct: val });
                }}
                className="w-16 p-1 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] text-xs font-bold text-center"
              />
            </div>
          </div>
          <p className="text-[11px] text-[#94a3b8]">
            Mínimo institucional sugerido: <strong>35%</strong>
          </p>
        </div>

        {/* Driver 4: Total Horas Rollup */}
        <div className="p-4 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748b]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Backlog</span>
            <Layers className="w-4 h-4 text-[#501f92]" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#64748b] block">
              Esfuerzo Total Estructurado
            </span>
            <span className="text-2xl font-black text-[#501f92] block">
              {financialSummary.totalHours}h
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#475569] pt-1">
            <span>{resourceLines.length} roles requeridos</span>
            <span className="font-bold text-[#0f172a]">{quote.deliverables.length} frentes</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left = Resource / Deliverables Table / Right = Resumen Costos y Rentabilidad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Recursos & Desglose de Gastos Variables */}
        <div className="lg:col-span-7 space-y-6">
          {/* Deliverables Tax Status Classification Bar */}
          <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#501f92]">
                  Tratamiento Tributario (Colombia)
                </span>
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Clasificación de Frentes de Trabajo (Exento vs Gravado)
                </h3>
              </div>
              <span className="text-xs text-[#64748b]">IVA 19%</span>
            </div>

            <p className="text-xs text-[#64748b] leading-relaxed">
              En Colombia, el desarrollo de software y plataformas web está exento de IVA (Art. 476 E.T.). 
              Puedes marcar cada frente según su naturaleza:
            </p>

            <div className="space-y-2 pt-1">
              {quote.deliverables.map((del) => {
                const currentStatus: TaxClassification =
                  customTaxStatus[del.id] ||
                  (del.name.toLowerCase().includes('web') ||
                  del.name.toLowerCase().includes('desarrollo') ||
                  del.name.toLowerCase().includes('software') ||
                  del.name.toLowerCase().includes('portal')
                    ? 'exempt'
                    : 'taxed');

                const delHours = del.backlogItems.reduce(
                  (s, a) => s + (Number(a.estimatedHours) || 0),
                  0
                );

                return (
                  <div
                    key={del.id}
                    className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                      <div className="truncate">
                        <span className="text-xs font-bold text-[#0f172a] block truncate">
                          {del.name}
                        </span>
                        <span className="text-[10px] text-[#64748b]">
                          {delHours}h ({del.backlogItems.length} actividades)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleDeliverableTax(del.id, currentStatus)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                          currentStatus === 'exempt'
                            ? 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'
                            : 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]'
                        }`}
                        title="Haz clic para alternar entre Exento y Gravado de IVA"
                      >
                        {currentStatus === 'exempt' ? '✓ Exento de IVA' : '⚠ Gravado con IVA (19%)'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table: Horas y Gastos Variables por Rol (Hojas 1, 3 y 8) */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#501f92]">
                  Detalle de Recursos
                </span>
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Horas Requeridas & Costo Variable Imputado
                </h3>
              </div>
              <span className="text-xs font-black text-[#501f92]">
                Total: {formatFinancialCurrency(financialSummary.totalVariableCostCOP)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[11px] text-[#64748b] font-bold uppercase">
                    <th className="p-3">Recurso / Rol</th>
                    <th className="p-3 text-right">Horas</th>
                    {pricingMode === 'deliverables' ? (
                      <>
                        <th className="p-3 text-right">Costo/Hora</th>
                        <th className="p-3 text-right">Costo Variable</th>
                      </>
                    ) : (
                      <>
                        <th className="p-3 text-right">Tarifa Venta/Hora</th>
                        <th className="p-3 text-right">Venta Directa</th>
                      </>
                    )}
                    <th className="p-3 text-center">Tributación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {resourceLines.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-[#94a3b8] italic">
                        No hay horas registradas en el backlog de esta cotización.
                      </td>
                    </tr>
                  ) : (
                    resourceLines.map((res, idx) => (
                      <tr key={idx} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="p-3 font-semibold text-[#0f172a]">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#501f92]" />
                            <span>{res.roleName}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-black text-[#0f172a]">
                          {res.hours}h
                        </td>
                        {pricingMode === 'deliverables' ? (
                          <>
                            <td className="p-3 text-right text-[#64748b]">
                              {formatFinancialCurrency(res.costPerHourCOP)}
                            </td>
                            <td className="p-3 text-right font-bold text-[#0f172a]">
                              {formatFinancialCurrency(res.totalVariableCostCOP)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-right text-[#501f92] font-semibold">
                              {formatFinancialCurrency(res.sellingRatePerHourCOP)}
                            </td>
                            <td className="p-3 text-right font-bold text-[#0f172a]">
                              {formatFinancialCurrency(res.totalDirectSellingValueCOP)}
                            </td>
                          </>
                        )}
                        <td className="p-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              res.taxClassification === 'exempt'
                                ? 'bg-[#ecfdf5] text-[#059669]'
                                : 'bg-[#fef2f2] text-[#dc2626]'
                            }`}
                          >
                            {res.taxClassification === 'exempt' ? 'Exento' : 'Gravado'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-[#f8fafc] font-black border-t border-[#e2e8f0]">
                  <tr>
                    <td className="p-3 text-[#0f172a]">TOTALES</td>
                    <td className="p-3 text-right text-[#501f92]">{financialSummary.totalHours}h</td>
                    <td className="p-3 text-right text-[#64748b]">-</td>
                    <td className="p-3 text-right text-[#0f172a]">
                      {pricingMode === 'deliverables'
                        ? formatFinancialCurrency(financialSummary.totalVariableCostCOP)
                        : formatFinancialCurrency(financialSummary.subtotalBeforeTaxCOP)}
                    </td>
                    <td className="p-3 text-center text-[10px] text-[#64748b]">
                      {financialSummary.variableCostExemptCOP > 0 ? 'Mixto' : 'Gravado'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Cuadro Resumen Costos / Rentabilidad (Exacto a Hoja 1 Excel) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Profitability Summary Card */}
          <div className="bg-white rounded-2xl border-2 border-[#501f92]/20 shadow-md p-5 space-y-4">
            {/* Header */}
            <div className="pb-3 border-b border-[#e2e8f0] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#501f92] block">
                  Hoja 1 · Resumen Oficial
                </span>
                <h3 className="text-base font-extrabold text-[#0f172a]">
                  Resumen Costos / Rentabilidad
                </h3>
              </div>
              <span className="p-2 rounded-xl bg-[#501f92]/10 text-[#501f92]">
                <Calculator className="w-5 h-5" />
              </span>
            </div>

            {/* Breakdown Lines (Excel Rows) */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[#475569]">
                <span>Costo Exento IVA:</span>
                <strong className="text-[#0f172a]">
                  {formatFinancialCurrency(financialSummary.variableCostExemptCOP)}
                </strong>
              </div>

              <div className="flex items-center justify-between text-[#475569]">
                <span>Costo Gravado IVA:</span>
                <strong className="text-[#0f172a]">
                  {formatFinancialCurrency(financialSummary.variableCostTaxedCOP)}
                </strong>
              </div>

              <div className="flex items-center justify-between font-bold text-[#0f172a] pt-1 border-t border-[#f1f5f9]">
                <span>Costo Variable del Proyecto:</span>
                <span className="text-[#501f92]">
                  {formatFinancialCurrency(financialSummary.totalVariableCostCOP)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#475569]">
                <span>Tiempo Estimado Proyecto:</span>
                <strong className="text-[#0f172a]">{weeks} semanas</strong>
              </div>

              <div className="flex items-center justify-between text-[#475569]">
                <span>Ocupación Equipo Overhead:</span>
                <strong className="text-[#0f172a]">{occupancyPct}%</strong>
              </div>

              <div className="flex items-center justify-between font-bold text-[#0f172a] pt-1 border-t border-[#f1f5f9]">
                <span>Costo Overhead / Load del Proyecto:</span>
                <span>{formatFinancialCurrency(financialSummary.overheadCostCOP)}</span>
              </div>

              <div className="flex items-center justify-between font-black text-sm text-[#0f172a] p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <span>Total Costos del Proyecto:</span>
                <span>{formatFinancialCurrency(financialSummary.totalProjectCostCOP)}</span>
              </div>

              <div className="flex items-center justify-between text-[#475569]">
                <span>Margen ({targetMargin}%):</span>
                <strong className="text-[#059669]">
                  +{formatFinancialCurrency(financialSummary.marginAmountCOP)}
                </strong>
              </div>
            </div>

            {/* Subtotal Before Tax */}
            <div className="p-3 rounded-xl bg-[#501f92]/5 border border-[#501f92]/20 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#501f92] font-bold">
                <span>SubTotal Costos Variables:</span>
                <span>{formatFinancialCurrency(financialSummary.totalVariableCostCOP)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#501f92] font-bold">
                <span>SubTotal Overhead + Margen:</span>
                <span>
                  {formatFinancialCurrency(
                    financialSummary.overheadCostCOP + financialSummary.marginAmountCOP
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-extrabold text-[#0f172a] pt-1.5 border-t border-[#501f92]/20">
                <span>Precio a Cotizar antes de IVA:</span>
                <span>{formatFinancialCurrency(financialSummary.subtotalBeforeTaxCOP)}</span>
              </div>
            </div>

            {/* Tax Treatment Lines */}
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#475569]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#059669]" />
                  <span>Valor Total Exento IVA:</span>
                </span>
                <strong className="text-[#0f172a]">
                  {formatFinancialCurrency(financialSummary.subtotalExemptCOP)}
                </strong>
              </div>

              <div className="flex items-center justify-between text-[#475569]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
                  <span>Valor Total Gravado IVA:</span>
                </span>
                <strong className="text-[#0f172a]">
                  {formatFinancialCurrency(financialSummary.subtotalTaxedCOP)}
                </strong>
              </div>

              <div className="flex items-center justify-between font-bold text-[#b45309] pt-1 border-t border-[#e2e8f0]">
                <span>IVA 19% (sobre base gravada):</span>
                <span>{formatFinancialCurrency(financialSummary.ivaTaxAmountCOP)}</span>
              </div>
            </div>

            {/* BIG FINAL TOTAL PRICE */}
            <div className="p-4 rounded-2xl bg-linear-to-br from-[#501f92] to-[#3b126f] text-white shadow-lg space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-white/80 block">
                Valor Total Proyecto más IVA
              </span>
              <div className="text-2xl font-black tracking-tight">
                {formatFinancialCurrency(financialSummary.finalPriceWithTaxCOP)} COP
              </div>
              {currency !== 'COP' && (
                <div className="text-sm font-semibold text-white/90 pt-1 border-t border-white/20 flex items-center justify-between">
                  <span>Equivalente {currency}:</span>
                  <span className="font-black">
                    {formatFinancialCurrency(
                      financialSummary.finalPriceWithTaxSelectedCurrency,
                      currency
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bandas de Negociación y Descuento (Hoja 1 y 8) */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                Bandas de Descuento & Negociación
              </h4>
              <span className="text-[10px] text-[#64748b]">Simulación de piso y techo</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#475569]">
                <span>Valor Máximo Proyecto (Mg. 50%):</span>
                <strong className="text-[#0f172a]">
                  {formatFinancialCurrency(financialSummary.bands.maxPriceWithTaxCOP)}
                </strong>
              </div>

              <div className="flex items-center justify-between text-[#501f92] font-bold">
                <span>Valor Objetivo (Mg. {targetMargin}%):</span>
                <span>{formatFinancialCurrency(financialSummary.finalPriceWithTaxCOP)}</span>
              </div>

              <div className="flex items-center justify-between text-[#475569]">
                <span>Valor Mínimo Proyecto (Mg. 35%):</span>
                <strong className="text-[#0f172a]">
                  {formatFinancialCurrency(financialSummary.bands.minPriceWithTaxCOP)}
                </strong>
              </div>

              <div className="p-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between text-[11px] font-semibold">
                <span className="text-[#64748b]">Descuento comercial vs. Techo:</span>
                <span className="text-[#dc2626]">
                  -{formatFinancialCurrency(financialSummary.bands.nominalDiscountCOP)} (
                  {financialSummary.bands.percentDiscount}%)
                </span>
              </div>
            </div>
          </div>

          {/* Configuración avanzada de Overhead */}
          <div className="p-3 bg-white rounded-2xl border border-[#e2e8f0] text-xs">
            <button
              type="button"
              onClick={() => setShowOverheadConfig(!showOverheadConfig)}
              className="w-full flex items-center justify-between text-[#64748b] hover:text-[#0f172a] font-semibold cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#501f92]" />
                <span>Ajuste de Gastos Fijos Semanales</span>
              </span>
              <span>{showOverheadConfig ? '▲' : '▼'}</span>
            </button>

            {showOverheadConfig && (
              <div className="pt-3 mt-2 border-t border-[#f1f5f9] space-y-2 animate-in fade-in">
                <label className="text-[11px] text-[#475569] block">
                  Tarifa Semanal de Gastos Fijos UHURA (COP):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="100000"
                    value={weeklyOverhead}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || DEFAULT_WEEKLY_FIXED_OVERHEAD_COP;
                      setWeeklyOverhead(val);
                      handleSaveConfig({ weeklyFixedOverheadCOP: val });
                    }}
                    className="w-full p-1.5 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] font-bold text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setWeeklyOverhead(DEFAULT_WEEKLY_FIXED_OVERHEAD_COP);
                      handleSaveConfig({ weeklyFixedOverheadCOP: DEFAULT_WEEKLY_FIXED_OVERHEAD_COP });
                    }}
                    className="p-1.5 rounded-lg border border-[#cbd5e1] text-[#64748b] hover:text-[#0f172a]"
                    title="Restablecer al valor por defecto ($21.060.426 COP)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-[#94a3b8]">
                  Calculado del Excel oficial: $18.533.175 COP para 8 sem × 11% ocupación.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
