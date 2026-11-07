import React, { useState } from 'react';
import { Plus, Trash2, Truck } from 'lucide-react';
import type { ExternalResourceItem } from '../types';

interface ExternalResourcesEditorProps {
  items: ExternalResourceItem[];
  editable: boolean;
  currency: string;
  services?: Array<{ id: string; name: string }>;
  onChange: (items: ExternalResourceItem[]) => void;
}

const fmt = (n: number, currency: string) =>
  `${currency === 'USD' ? 'US$' : '$'} ${Math.round(n).toLocaleString('es-CO')}`;

/**
 * Recursos externos / subcontratados de la cotización.
 * No son roles de Uhura: no consumen capacidad ni aparecen en roles cotizables.
 */
export const ExternalResourcesEditor: React.FC<ExternalResourcesEditorProps> = ({
  items,
  editable,
  currency,
  services = [],
  onChange
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState('');
  const [costModel, setCostModel] = useState<'fixed' | 'hourly'>('fixed');
  const [fixedCost, setFixedCost] = useState('');
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState('');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');

  const computedTotal = costModel === 'fixed' ? Number(fixedCost) || 0 : (Number(hours) || 0) * (Number(rate) || 0);
  const total = items.reduce((sum, i) => sum + (i.totalCost || 0), 0);

  const reset = () => {
    setIsAdding(false);
    setDescription('');
    setProvider('');
    setCostModel('fixed');
    setFixedCost('');
    setHours('');
    setRate('');
  };

  const handleAdd = () => {
    if (!description.trim() || computedTotal <= 0) return;
    onChange([
      ...items,
      {
        id: `ext-${Date.now()}`,
        description: description.trim(),
        providerName: provider.trim() || undefined,
        costModel,
        hours: costModel === 'hourly' ? Number(hours) : undefined,
        hourlyRate: costModel === 'hourly' ? Number(rate) : undefined,
        totalCost: computedTotal,
        serviceId: services.length > 1 ? serviceId || null : services[0]?.id || null
      }
    ]);
    reset();
  };

  const input = 'w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs text-[#0f172a] bg-white focus:ring-2 focus:ring-[#501f92]';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="font-bold text-[#334155] text-xs flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-[#501f92]" /> Recursos externos (subcontratados)
        </label>
        {items.length > 0 && <span className="text-[11px] font-bold text-[#0f172a]">Costo: {fmt(total, currency)}</span>}
      </div>
      <p className="text-[10.5px] text-[#64748b]">
        Proveedores para necesidades puntuales (ej. backend, arquitectura de servidores). Suman al costo del proyecto, pero no son roles de Uhura ni consumen capacidad del equipo.
      </p>

      {items.length > 0 && (
        <ul className="divide-y divide-[#f1f5f9] rounded-xl border border-[#e2e8f0]">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
              <div className="min-w-0">
                <span className="font-bold text-[#0f172a]">{i.description}</span>
                <span className="text-[#64748b]">
                  {i.providerName ? ` · ${i.providerName}` : ''}
                  {i.costModel === 'hourly' ? ` · ${i.hours}h × ${fmt(i.hourlyRate || 0, currency)}` : ' · Valor fijo'}
                  {services.length > 1 && i.serviceId ? ` · ${services.find((s) => s.id === i.serviceId)?.name || ''}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono font-bold text-[#0f172a]">{fmt(i.totalCost, currency)}</span>
                {editable && (
                  <button
                    type="button"
                    onClick={() => onChange(items.filter((x) => x.id !== i.id))}
                    className="p-1 text-[#94a3b8] hover:text-[#dc2626] cursor-pointer"
                    title="Quitar recurso externo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {editable && !isAdding && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="px-3 py-1.5 text-xs font-bold text-[#501f92] bg-[#f5f3ff] border border-[#ddd6fe] hover:bg-[#ede9fe] rounded-xl cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar recurso externo
        </button>
      )}

      {editable && isAdding && (
        <div className="space-y-2 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input className={input} placeholder="Descripción (ej. Arquitectura de servidores)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input className={input} placeholder="Proveedor (opcional)" value={provider} onChange={(e) => setProvider(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={costModel === 'fixed'} onChange={() => setCostModel('fixed')} /> Valor fijo
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={costModel === 'hourly'} onChange={() => setCostModel('hourly')} /> Horas × tarifa
            </label>
          </div>
          {costModel === 'fixed' ? (
            <input className={input} type="number" min="0" placeholder={`Costo total (${currency})`} value={fixedCost} onChange={(e) => setFixedCost(e.target.value)} />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <input className={input} type="number" min="0" placeholder="Horas" value={hours} onChange={(e) => setHours(e.target.value)} />
              <input className={input} type="number" min="0" placeholder={`Tarifa por hora (${currency})`} value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
          )}
          {services.length > 1 && (
            <select className={input} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
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
        <p className="text-xs text-[#94a3b8] italic">Sin recursos externos.</p>
      )}
    </div>
  );
};
