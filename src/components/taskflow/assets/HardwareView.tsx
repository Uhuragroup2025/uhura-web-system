import React, { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Monitor } from 'lucide-react';
import type { HardwareAsset, ProjectSummaryItem, UserItem } from '../types';
import { ChipMultiSelect } from './ChipMultiSelect';

/** Horas productivas por mes para depreciación: 42 h/semana × 52 / 12. */
export const PRODUCTIVE_HOURS_PER_MONTH = (42 * 52) / 12;

export function hardwareMonthlyDepreciation(a: Pick<HardwareAsset, 'purchaseValue' | 'usefulLifeMonths'>): number | null {
  if (!a.usefulLifeMonths || a.usefulLifeMonths <= 0) return null;
  return a.purchaseValue / a.usefulLifeMonths;
}

const money = (n: number) => `$${Math.round(n).toLocaleString('es-CO')}`;
const TYPE_SUGGESTIONS = ['Laptop', 'Desktop', 'Monitor', 'Cámara', 'Lente', 'Micrófono', 'Iluminación', 'Tablet', 'Celular', 'Disco duro'];
const STATUS_LABEL: Record<HardwareAsset['status'], string> = { active: 'En uso', repair: 'En reparación', retired: 'De baja' };

interface HardwareViewProps {
  assets: HardwareAsset[];
  users: UserItem[];
  projects: ProjectSummaryItem[];
  services: Array<{ id: string; name: string; code?: string }>;
  canEdit: boolean;
  onChange: (assets: HardwareAsset[]) => void;
}

const empty = (): HardwareAsset => ({
  id: '',
  name: '',
  purchaseValue: 0,
  isDirectCost: true,
  serviceTemplateIds: [],
  projectIds: [],
  status: 'active'
});

export const HardwareView: React.FC<HardwareViewProps> = ({ assets, users, projects, services, canEdit, onChange }) => {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<HardwareAsset | null>(null);

  const userName = (id?: string | null) => users.find((u) => u.id === id)?.name;
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) =>
      [a.name, a.type, a.brand, a.model, a.location, a.serialNumber, userName(a.assignedUserId)].join(' ').toLowerCase().includes(q)
    );
  }, [assets, query, users]);

  const save = () => {
    if (!editing || !editing.name.trim() || editing.purchaseValue <= 0) return;
    const item = { ...editing, name: editing.name.trim(), id: editing.id || `hw-${Date.now()}` };
    onChange(editing.id ? assets.map((a) => (a.id === editing.id ? item : a)) : [item, ...assets]);
    setEditing(null);
  };

  const set = <K extends keyof HardwareAsset>(k: K, v: HardwareAsset[K]) => setEditing((prev) => (prev ? { ...prev, [k]: v } : prev));
  const input = 'w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs text-[#0f172a] bg-white focus:outline-none focus:ring-2 focus:ring-[#501f92]/30 focus:border-[#501f92]';
  const label = 'block text-xs font-bold text-[#334155] mb-1';
  const hint = 'text-[10.5px] text-[#64748b] mt-1 block';

  if (editing) {
    const monthly = hardwareMonthlyDepreciation(editing);
    const perHour = monthly !== null ? monthly / PRODUCTIVE_HOURS_PER_MONTH : null;
    const perService = perHour !== null && editing.isDirectCost && editing.serviceTemplateIds.length > 0 ? perHour / editing.serviceTemplateIds.length : null;
    return (
      <div className="max-w-3xl bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-lg font-extrabold text-[#0f172a]">{editing.id ? 'Editar equipo' : 'Nuevo equipo'}</h2>
          <p className="text-xs text-[#64748b]">Activo físico. Si es costo directo, su depreciación se imputa a los servicios y proyectos que lo usan.</p>
        </div>

        {/* 1. Identificación */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block"><span className={label}>Nombre <span className="text-[#ef4444]">*</span></span>
            <input className={input} value={editing.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej. MacBook Pro diseño 01" /></label>
          <label className="block"><span className={label}>Tipo</span>
            <input className={input} list="hw-types" value={editing.type || ''} onChange={(e) => set('type', e.target.value)} placeholder="Laptop, Cámara, Monitor…" />
            <datalist id="hw-types">{TYPE_SUGGESTIONS.map((t) => <option key={t} value={t} />)}</datalist></label>
          <label className="block"><span className={label}>Marca</span>
            <input className={input} value={editing.brand || ''} onChange={(e) => set('brand', e.target.value)} /></label>
          <label className="block"><span className={label}>Modelo</span>
            <input className={input} value={editing.model || ''} onChange={(e) => set('model', e.target.value)} /></label>
          <label className="block"><span className={label}>Serial / placa de inventario</span>
            <input className={input} value={editing.serialNumber || ''} onChange={(e) => set('serialNumber', e.target.value)} /></label>
          <label className="block"><span className={label}>Estado</span>
            <select className={input} value={editing.status} onChange={(e) => set('status', e.target.value as HardwareAsset['status'])}>
              {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></label>
        </section>

        {/* 2. Asignación */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f1f5f9]">
          <label className="block"><span className={label}>Colaborador asignado</span>
            <select className={input} value={editing.assignedUserId || ''} onChange={(e) => set('assignedUserId', e.target.value || null)}>
              <option value="">Sin asignar (uso compartido)</option>
              {users.filter((u) => u.status !== 'Inactive').map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <span className={hint}>Quién lo tiene a cargo. Para equipos compartidos, déjalo sin asignar.</span></label>
          <label className="block"><span className={label}>Ubicación</span>
            <input className={input} value={editing.location || ''} onChange={(e) => set('location', e.target.value)} placeholder="Ej. Oficina Medellín, casa del colaborador" /></label>
        </section>

        {/* 3. Costo y depreciación */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f1f5f9]">
          <label className="block"><span className={label}>Valor de compra (COP) <span className="text-[#ef4444]">*</span></span>
            <input type="number" min="0" className={input} value={editing.purchaseValue || ''} onChange={(e) => set('purchaseValue', Number(e.target.value) || 0)} /></label>
          <label className="block"><span className={label}>Fecha de compra</span>
            <input type="date" className={input} value={editing.purchaseDate || ''} onChange={(e) => set('purchaseDate', e.target.value || null)} /></label>
          <label className="block"><span className={label}>Vida útil (meses)</span>
            <input type="number" min="1" className={input} value={editing.usefulLifeMonths || ''} onChange={(e) => set('usefulLifeMonths', Number(e.target.value) || null)} placeholder="Ej. 36" /></label>
          <label className="block"><span className={label}>Garantía hasta</span>
            <input type="date" className={input} value={editing.warrantyEndDate || ''} onChange={(e) => set('warrantyEndDate', e.target.value || null)} /></label>
          <div className="sm:col-span-2 p-3 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] text-xs text-[#475569]">
            {monthly === null
              ? 'Indica la vida útil para calcular la depreciación.'
              : <>Depreciación: <strong className="text-[#501f92]">{money(monthly)}/mes</strong> · <strong className="text-[#501f92]">{money(perHour!)}/hora</strong> ({Math.round(PRODUCTIVE_HOURS_PER_MONTH)} h productivas al mes)
                {perService !== null && <> · {money(perService)}/hora por servicio</>}</>}
          </div>
        </section>

        {/* 4. Imputación del costo */}
        <section className="space-y-3 pt-4 border-t border-[#f1f5f9]">
          <label className="flex items-center gap-2 text-xs font-bold text-[#334155] cursor-pointer">
            <input type="checkbox" className="accent-[#501f92]" checked={editing.isDirectCost} onChange={(e) => set('isDirectCost', e.target.checked)} />
            Es costo directo (se imputa a servicios y proyectos)
          </label>
          {editing.isDirectCost && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><span className={label}>Servicios que lo usan</span>
                <ChipMultiSelect
                  options={services.map((s) => ({ id: s.id, label: s.name, hint: s.code }))}
                  selected={editing.serviceTemplateIds}
                  onChange={(ids) => set('serviceTemplateIds', ids)}
                  placeholder="Buscar servicio…"
                />
                <span className={hint}>La depreciación por hora se reparte en partes iguales entre estos servicios.</span></div>
              <div><span className={label}>Proyectos que lo usan</span>
                <ChipMultiSelect
                  options={projects.filter((p) => p.status !== 'Archivado').map((p) => ({ id: p.id, label: p.name, hint: p.clientName }))}
                  selected={editing.projectIds}
                  onChange={(ids) => set('projectIds', ids)}
                  placeholder="Buscar proyecto…"
                />
                <span className={hint}>Se completa también al crear un proyecto desde un servicio asociado.</span></div>
            </div>
          )}
          <label className="block"><span className={label}>Notas</span>
            <input className={input} value={editing.notes || ''} onChange={(e) => set('notes', e.target.value)} /></label>
        </section>

        <div className="flex gap-2 pt-2">
          <button onClick={save} disabled={!editing.name.trim() || editing.purchaseValue <= 0} className="px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-white text-xs font-bold cursor-pointer disabled:opacity-50">Guardar equipo</button>
          <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-[#501f92] text-[#501f92] text-xs font-bold cursor-pointer">Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">Hardware</h1>
          <p className="text-sm text-[#64748b]">Activos físicos (laptops, cámaras…) — costo directo de operación por depreciación.</p>
        </div>
        {canEdit && (
          <button onClick={() => setEditing(empty())} className="self-start px-4 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-white text-xs font-bold cursor-pointer flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Nuevo equipo
          </button>
        )}
      </div>
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, tipo, marca, serial o colaborador…" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-xs" />
      </div>
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-x-auto">
        <table className="w-full text-xs min-w-[820px]">
          <thead>
            <tr className="text-[10px] uppercase font-bold text-[#64748b] bg-[#f8fafc] border-b border-[#f1f5f9]">
              <th className="text-left py-3 px-4">Equipo</th>
              <th className="text-left py-3 px-4">Asignado a</th>
              <th className="text-right py-3 px-4">Valor de compra</th>
              <th className="text-right py-3 px-4">Depreciación/mes</th>
              <th className="text-left py-3 px-4">Garantía</th>
              <th className="text-left py-3 px-4">Estado</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {visible.length === 0 && (
              <tr><td colSpan={7} className="py-10 text-center text-[#64748b]">Aún no hay equipos registrados.</td></tr>
            )}
            {visible.map((a) => {
              const m = hardwareMonthlyDepreciation(a);
              const warrantyExpired = a.warrantyEndDate && a.warrantyEndDate < new Date().toISOString().slice(0, 10);
              return (
                <tr key={a.id} className="hover:bg-[#fbfcfe]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-[#501f92] shrink-0" />
                      <div>
                        <span className="font-bold text-[#0f172a] block">{a.name}</span>
                        <span className="text-[#64748b]">{[a.type, a.brand, a.model].filter(Boolean).join(' · ')}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#0f172a]">{userName(a.assignedUserId) || <span className="text-[#94a3b8]">Compartido</span>}</td>
                  <td className="py-3 px-4 text-right font-mono">{money(a.purchaseValue)}</td>
                  <td className="py-3 px-4 text-right font-mono">{m !== null ? money(m) : '—'}</td>
                  <td className={`py-3 px-4 ${warrantyExpired ? 'text-[#b91c1c]' : 'text-[#0f172a]'}`}>{a.warrantyEndDate || '—'}{warrantyExpired ? ' · vencida' : ''}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${a.status === 'active' ? 'bg-[#ecfdf5] text-[#166534]' : a.status === 'repair' ? 'bg-[#fffbeb] text-[#b45309]' : 'bg-[#f1f5f9] text-[#475569]'}`}>{STATUS_LABEL[a.status]}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {canEdit && (
                      <button onClick={() => setEditing(a)} className="text-[#501f92] hover:underline cursor-pointer inline-flex items-center gap-1"><Pencil className="w-3 h-3" /> Editar</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
