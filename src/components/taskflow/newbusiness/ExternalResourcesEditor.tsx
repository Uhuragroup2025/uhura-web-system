import React, { useState } from 'react';
import { Plus, Trash2, Truck, KeyRound } from 'lucide-react';
import type { ExternalResourceItem } from '../types';

interface ExternalResourcesEditorProps {
  items: ExternalResourceItem[];
  editable: boolean;
  currency: string;
  services?: Array<{ id: string; name: string }>;
  onChange?: (items: ExternalResourceItem[]) => void;
  /** En Cotización: solo lectura, con el total para sumar en la calculadora. */
  summaryForQuote?: boolean;
}

const fmt = (n: number, currency: string) =>
  `${currency === 'USD' ? 'US$' : '$'} ${Math.round(n).toLocaleString('es-CO')}`;

const KIND_LABEL: Record<'external' | 'license', string> = {
  external: 'Recurso externo',
  license: 'Licencia'
};

/**
 * Costos externos y licencias (ronda 2, 10 Nov 2026).
 * - Los agrega el líder en Alcance: recursos externos (proveedor o freelance) y licencias
 *   (ej. Claude, un plugin, hosting) que se imputan al proyecto.
 * - Comercial los ve en Cotización, con el total, para sumarlos en la calculadora.
 * - No son roles de Uhura: no consumen capacidad del equipo.
 * Orden de campos: tipo → proveedor (opcional) → descripción → costo → frecuencia.
 */
export const ExternalResourcesEditor: React.FC<ExternalResourcesEditorProps> = ({
  items,
  editable,
  currency,
  services = [],
  onChange = () => undefined,
  summaryForQuote = false
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [kind, setKind] = useState<'external' | 'license'>('external');
  const [provider, setProvider] = useState('');
  const [description, setDescription] = useState('');
  const [costModel, setCostModel] = useState<'fixed' | 'hourly'>('fixed');
  const [recurrence, setRecurrence] = useState<'one_time' | 'monthly'>('one_time');
  const [fixedCost, setFixedCost] = useState('');
  const [months, setMonths] = useState('1');
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState('');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');

  const baseCost = costModel === 'fixed' ? Number(fixedCost) || 0 : (Number(hours) || 0) * (Number(rate) || 0);
  const monthsN = Math.max(1, Number(months) || 1);
  const computedTotal = recurrence === 'monthly' ? baseCost * monthsN : baseCost;
  const total = items.reduce((sum, i) => sum + (i.totalCost || 0), 0);
  const licensesTotal = items.filter((i) => i.kind === 'license').reduce((sum, i) => sum + (i.totalCost || 0), 0);

  const reset = () => {
    setIsAdding(false);
    setKind('external');
    setProvider('');
    setDescription('');
    setCostModel('fixed');
    setRecurrence('one_time');
    setFixedCost('');
    setMonths('1');
    setHours('');
    setRate('');
  };

  const handleAdd = () => {
    if (!description.trim() || computedTotal <= 0) return;
    const isMonthly = recurrence === 'monthly';
    onChange([
      ...items,
      {
        id: `ext-${Date.now()}`,
        kind,
        description: description.trim(),
        providerName: provider.trim() || undefined,
        costModel: kind === 'license' ? 'fixed' : costModel,
        hours: kind !== 'license' && costModel === 'hourly' ? Number(hours) : undefined,
        hourlyRate: kind !== 'license' && costModel === 'hourly' ? Number(rate) : undefined,
        recurrence,
        monthlyCost: isMonthly ? baseCost : undefined,
        months: isMonthly ? monthsN : undefined,
        totalCost: computedTotal,
        serviceId: services.length > 1 ? serviceId || null : services[0]?.id || null
      }
    ]);
    reset();
  };

  const input = 'w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs text-[#0f172a] bg-white focus:ring-2 focus:ring-[#501f92]';
  const pill = (active: boolean) =>
    `px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${active ? 'bg-[#501f92] text-white' : 'text-[#64748b] hover:text-[#0f172a]'}`;

  const detail = (i: ExternalResourceItem) => {
    const parts: string[] = [];
    if (i.providerName) parts.push(i.providerName);
    if (i.recurrence === 'monthly') parts.push(`${fmt(i.monthlyCost || 0, currency)}/mes × ${i.months || 1} ${(i.months || 1) === 1 ? 'mes' : 'meses'}`);
    else if (i.costModel === 'hourly') parts.push(`${i.hours}h × ${fmt(i.hourlyRate || 0, currency)}`);
    else parts.push('Pago único');
    if (services.length > 1 && i.serviceId) parts.push(services.find((s) => s.id === i.serviceId)?.name || '');
    return parts.filter(Boolean).join(' · ');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="font-bold text-[#334155] text-xs flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-[#501f92]" /> Costos externos y licencias
        </label>
        {items.length > 0 && <span className="text-[11px] font-bold text-[#0f172a]">Total: {fmt(total, currency)}</span>}
      </div>
      <p className="text-[10.5px] text-[#64748b]">
        {summaryForQuote
          ? 'Los agrega el líder en Alcance. Súmalos en la calculadora: son costo del proyecto, no horas del equipo.'
          : 'Proveedores o freelance para necesidades puntuales y licencias que se imputan al proyecto (ej. Claude, un plugin, hosting). Comercial los ve en Cotización para sumarlos a la calculadora. No consumen capacidad del equipo.'}
      </p>

      {items.length > 0 && (
        <ul className="divide-y divide-[#f1f5f9] rounded-xl border border-[#e2e8f0]">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
              <div className="min-w-0 flex items-center gap-2">
                <span
                  className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    i.kind === 'license' ? 'bg-[#ecfeff] text-[#0e7490] border border-[#a5f3fc]' : 'bg-[#f5f3ff] text-[#501f92] border border-[#e9d5ff]'
                  }`}
                >
                  {KIND_LABEL[i.kind || 'external']}
                </span>
                <div className="min-w-0">
                  <span className="font-bold text-[#0f172a]">{i.description}</span>
                  <span className="text-[#64748b]"> · {detail(i)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono font-bold text-[#0f172a]">{fmt(i.totalCost, currency)}</span>
                {editable && (
                  <button
                    type="button"
                    onClick={() => onChange(items.filter((x) => x.id !== i.id))}
                    className="p-1 text-[#94a3b8] hover:text-[#dc2626] cursor-pointer"
                    title="Quitar"
                    aria-label={`Quitar ${i.description}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {summaryForQuote && licensesTotal > 0 && (
        <p className="text-[10.5px] text-[#0e7490] flex items-center gap-1">
          <KeyRound className="w-3 h-3" /> Incluye {fmt(licensesTotal, currency)} en licencias.
        </p>
      )}

      {editable && !isAdding && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="px-3 py-1.5 text-xs font-bold text-[#501f92] bg-[#f5f3ff] border border-[#ddd6fe] hover:bg-[#ede9fe] rounded-xl cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar costo externo o licencia
        </button>
      )}

      {editable && isAdding && (
        <div className="space-y-2.5 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] p-3">
          {/* 1. Tipo */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-white border border-[#e2e8f0]">
            <button type="button" className={pill(kind === 'external')} onClick={() => setKind('external')}>
              Recurso externo
            </button>
            <button
              type="button"
              className={pill(kind === 'license')}
              onClick={() => {
                setKind('license');
                setCostModel('fixed');
              }}
            >
              Licencia
            </button>
          </div>
          {/* 2. Proveedor  3. Descripción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              className={input}
              placeholder={kind === 'license' ? 'Proveedor (opcional, ej. Anthropic)' : 'Proveedor (opcional)'}
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
            <input
              className={input}
              placeholder={kind === 'license' ? 'Descripción (ej. Licencia Claude Team)' : 'Descripción (ej. Arquitectura de servidores)'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {/* 4. Costo */}
          {kind === 'external' && (
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={costModel === 'fixed'} onChange={() => setCostModel('fixed')} /> Valor fijo
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={costModel === 'hourly'} onChange={() => setCostModel('hourly')} /> Horas × tarifa
              </label>
            </div>
          )}
          {costModel === 'fixed' || kind === 'license' ? (
            <input
              className={input}
              type="number"
              min="0"
              step="0.01"
              placeholder={recurrence === 'monthly' ? `Costo mensual (${currency})` : `Costo total (${currency})`}
              value={fixedCost}
              onChange={(e) => setFixedCost(e.target.value)}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <input className={input} type="number" min="0" placeholder="Horas" value={hours} onChange={(e) => setHours(e.target.value)} />
              <input className={input} type="number" min="0" step="0.01" placeholder={`Tarifa por hora (${currency})`} value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
          )}
          {/* 5. Frecuencia */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={recurrence === 'one_time'} onChange={() => setRecurrence('one_time')} /> Pago único
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={recurrence === 'monthly'} onChange={() => setRecurrence('monthly')} /> Mensual
            </label>
            {recurrence === 'monthly' && (
              <label className="flex items-center gap-1.5">
                durante
                <input
                  className="w-16 px-2 py-1 rounded-lg border border-[#cbd5e1] text-xs bg-white"
                  type="number"
                  min="1"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  aria-label="Meses"
                />
                meses
              </label>
            )}
          </div>
          {services.length > 1 && (
            <select className={input} value={serviceId} onChange={(e) => setServiceId(e.target.value)} aria-label="Servicio">
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#475569]">Total: <strong>{fmt(computedTotal, currency)}</strong></span>
            <div className="flex gap-2">
              <button type="button" onClick={reset} className="px-3 py-1.5 text-xs font-bold text-[#64748b] hover:bg-white rounded-xl cursor-pointer">Cancelar</button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!description.trim() || computedTotal <= 0}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] disabled:opacity-50 rounded-xl cursor-pointer"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {!editable && items.length === 0 && (
        <p className="text-xs text-[#94a3b8] italic">
          {summaryForQuote ? 'El líder no agregó costos externos ni licencias en Alcance.' : 'Sin costos externos ni licencias.'}
        </p>
      )}
    </div>
  );
};
