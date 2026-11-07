import React, { useMemo, useState } from 'react';
import { Plus, Search, Pencil, KeyRound } from 'lucide-react';
import type { ProjectSummaryItem, SoftwareLicense, UserItem } from '../types';
import { ChipMultiSelect } from './ChipMultiSelect';

const FREQ_LABEL: Record<SoftwareLicense['frequency'], string> = { monthly: 'Mensual', quarterly: 'Trimestral', annual: 'Anual' };
const FREQ_MONTHS: Record<SoftwareLicense['frequency'], number> = { monthly: 1, quarterly: 3, annual: 12 };
const AREAS: SoftwareLicense['area'][] = ['Operativos', 'Comercial', 'Admin', 'Varios'];
const fmt = (n: number, cur: string) => `${cur} $${n.toLocaleString('es-CO', { maximumFractionDigits: 2 })}`;

export const licenseTotal = (l: Pick<SoftwareLicense, 'quantity' | 'unitValue'>) => l.quantity * l.unitValue;
export const licenseMonthly = (l: Pick<SoftwareLicense, 'quantity' | 'unitValue' | 'frequency'>) => licenseTotal(l) / FREQ_MONTHS[l.frequency];

interface LicensesViewProps {
  licenses: SoftwareLicense[];
  users: UserItem[];
  projects: ProjectSummaryItem[];
  canEdit: boolean;
  onChange: (licenses: SoftwareLicense[]) => void;
}

const empty = (): SoftwareLicense => ({
  id: '',
  application: '',
  quantity: 1,
  frequency: 'monthly',
  currency: 'COP',
  unitValue: 0,
  area: 'Operativos',
  assignedUserIds: [],
  projectIds: [],
  pendingVerification: false,
  status: 'active'
});

export const LicensesView: React.FC<LicensesViewProps> = ({ licenses, users, projects, canEdit, onChange }) => {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<SoftwareLicense | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...licenses].sort((a, b) => a.application.localeCompare(b.application));
    return q ? list.filter((l) => [l.application, l.plan, l.area].join(' ').toLowerCase().includes(q)) : list;
  }, [licenses, query]);

  const save = () => {
    if (!editing || !editing.application.trim() || editing.quantity < 1 || editing.unitValue <= 0) return;
    const item = { ...editing, application: editing.application.trim().toUpperCase(), id: editing.id || `lic-${Date.now()}` };
    onChange(editing.id ? licenses.map((l) => (l.id === editing.id ? item : l)) : [item, ...licenses]);
    setEditing(null);
  };
  const toggleStatus = (l: SoftwareLicense) =>
    onChange(licenses.map((x) => (x.id === l.id ? { ...x, status: x.status === 'active' ? 'inactive' : 'active' } : x)));

  const set = <K extends keyof SoftwareLicense>(k: K, v: SoftwareLicense[K]) => setEditing((prev) => (prev ? { ...prev, [k]: v } : prev));
  const input = 'w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs text-[#0f172a] bg-white focus:outline-none focus:ring-2 focus:ring-[#501f92]/30 focus:border-[#501f92]';
  const label = 'block text-xs font-bold text-[#334155] mb-1';
  const hint = 'text-[10.5px] text-[#64748b] mt-1 block';
  const req = <span className="text-[#ef4444]">*</span>;

  if (editing) {
    const monthly = licenseMonthly(editing);
    const activeUsers = users.filter((u) => u.status !== 'Inactive');
    return (
      <div className="max-w-3xl bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-lg font-extrabold text-[#0f172a]">{editing.id ? 'Editar licencia' : 'Nueva licencia'}</h2>
          <p className="text-xs text-[#64748b]">Suscripción de software. Su costo mensual se reparte entre los proyectos activos que la usan.</p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block"><span className={label}>Aplicación {req}</span>
            <input className={input} value={editing.application} onChange={(e) => set('application', e.target.value)} placeholder="Ej. Adobe" /></label>
          <label className="block"><span className={label}>Plan</span>
            <input className={input} value={editing.plan || ''} onChange={(e) => set('plan', e.target.value)} placeholder="Ej. Creative Cloud All Apps" />
            <span className={hint}>Puede quedar vacío (ej. HubSpot).</span></label>
          <label className="block"><span className={label}>Área asignada {req}</span>
            <select className={input} value={editing.area} onChange={(e) => set('area', e.target.value as SoftwareLicense['area'])}>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select></label>
          <label className="block"><span className={label}>Responsable de la cuenta</span>
            <select className={input} value={editing.ownerUserId || ''} onChange={(e) => set('ownerUserId', e.target.value || null)}>
              <option value="">Sin responsable</option>
              {activeUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <span className={hint}>Quien administra pagos, accesos y renovación.</span></label>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#f1f5f9]">
          <label className="block"><span className={label}>Cantidad (cupos) {req}</span>
            <input type="number" min="1" className={input} value={editing.quantity} onChange={(e) => set('quantity', Math.max(1, parseInt(e.target.value, 10) || 1))} /></label>
          <label className="block"><span className={label}>Frecuencia {req}</span>
            <select className={input} value={editing.frequency} onChange={(e) => set('frequency', e.target.value as SoftwareLicense['frequency'])}>
              {Object.entries(FREQ_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></label>
          <label className="block"><span className={label}>Próxima renovación</span>
            <input type="date" className={input} value={editing.nextRenewalDate || ''} onChange={(e) => set('nextRenewalDate', e.target.value || null)} /></label>
          <label className="block"><span className={label}>Moneda {req}</span>
            <select className={input} value={editing.currency} onChange={(e) => set('currency', e.target.value as SoftwareLicense['currency'])}>
              <option value="COP">Peso colombiano (COP)</option>
              <option value="USD">Dólar (USD)</option>
              <option value="MXN">Peso mexicano (MXN)</option>
              <option value="EUR">Euro (EUR)</option>
            </select></label>
          <label className="block sm:col-span-2"><span className={label}>Valor unitario {req}</span>
            <input type="number" min="0" step="0.01" className={input} value={editing.unitValue || ''} onChange={(e) => set('unitValue', Number(e.target.value) || 0)} /></label>
          <div className="sm:col-span-3 p-3 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] text-xs text-[#475569]">
            Total {FREQ_LABEL[editing.frequency].toLowerCase()}: <strong className="text-[#501f92]">{fmt(licenseTotal(editing), editing.currency)}</strong> · Costo mensual: <strong className="text-[#501f92]">{fmt(monthly, editing.currency)}</strong>
            {editing.currency !== 'COP' && <> · el valor en COP se calcula con la TRM vigente de Finanzas</>}
            {editing.projectIds.length > 0 && <> · {fmt(monthly / editing.projectIds.length, editing.currency)}/mes por proyecto</>}
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f1f5f9]">
          <div><span className={label}>Personas con cupo ({editing.assignedUserIds.length} de {editing.quantity})</span>
            <ChipMultiSelect
              options={activeUsers.map((u) => ({ id: u.id, label: u.name, hint: u.officialRole || u.jobTitle }))}
              selected={editing.assignedUserIds}
              onChange={(ids) => set('assignedUserIds', ids)}
              max={editing.quantity}
              placeholder="Buscar persona…"
            />
            <span className={hint}>Permite saber quién usa cada cupo y liberar los que sobran.</span></div>
          <div><span className={label}>Proyectos activos que la usan</span>
            <ChipMultiSelect
              options={projects.filter((p) => p.status !== 'Archivado' && p.status !== 'Cerrado').map((p) => ({ id: p.id, label: p.name, hint: p.clientName }))}
              selected={editing.projectIds}
              onChange={(ids) => set('projectIds', ids)}
              placeholder="Buscar proyecto…"
            />
            <span className={hint}>El costo mensual se reparte en partes iguales. Vacío = costo general de la agencia.</span></div>
        </section>

        <section className="p-4 rounded-2xl border border-[#e2e8f0] space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-[#334155] cursor-pointer">
            <input type="checkbox" className="accent-[#501f92]" checked={editing.pendingVerification} onChange={(e) => set('pendingVerification', e.target.checked)} />
            Pendiente de verificar
          </label>
          {editing.pendingVerification && (
            <textarea rows={2} className={input} value={editing.verificationNote || ''} onChange={(e) => set('verificationNote', e.target.value)} placeholder="Qué falta confirmar (valor, plan, cupos…)" />
          )}
        </section>

        <div className="flex gap-2">
          <button onClick={save} disabled={!editing.application.trim() || editing.unitValue <= 0} className="px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-white text-xs font-bold cursor-pointer disabled:opacity-50">Guardar licencia</button>
          <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-[#501f92] text-[#501f92] text-xs font-bold cursor-pointer">Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">Licencias</h1>
          <p className="text-sm text-[#64748b]">Licencias y suscripciones de software — costo directo de operación.</p>
        </div>
        {canEdit && (
          <button onClick={() => setEditing(empty())} className="self-start px-4 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-white text-xs font-bold cursor-pointer flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Nueva licencia
          </button>
        )}
      </div>
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por aplicación, plan o área…" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-xs" />
      </div>
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-x-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead>
            <tr className="text-[10px] uppercase font-bold text-[#64748b] bg-[#f8fafc] border-b border-[#f1f5f9]">
              <th className="text-left py-3 px-4">Aplicación</th>
              <th className="text-right py-3 px-4">Cupos</th>
              <th className="text-left py-3 px-4">Frecuencia</th>
              <th className="text-right py-3 px-4">Costo mensual</th>
              <th className="text-left py-3 px-4">Renovación</th>
              <th className="text-left py-3 px-4">Área</th>
              <th className="text-left py-3 px-4">Estado</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {visible.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-[#64748b]">Aún no hay licencias registradas.</td></tr>}
            {visible.map((l) => {
              const soon = l.nextRenewalDate && l.nextRenewalDate >= today && (new Date(l.nextRenewalDate).getTime() - new Date(today).getTime()) / 86400000 <= 15;
              return (
                <tr key={l.id} className={`hover:bg-[#fbfcfe] ${l.status === 'inactive' ? 'opacity-60' : ''}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#501f92] shrink-0" />
                      <div>
                        <span className="font-bold text-[#0f172a] block">{l.application}</span>
                        <span className="text-[#64748b]">{l.plan || '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">{l.assignedUserIds.length > 0 ? `${l.assignedUserIds.length}/${l.quantity}` : l.quantity}</td>
                  <td className="py-3 px-4">{FREQ_LABEL[l.frequency]}</td>
                  <td className="py-3 px-4 text-right font-mono">
                    {l.pendingVerification
                      ? <span className="px-2 py-0.5 rounded-full bg-[#fffbeb] text-[#b45309] text-[10px] font-bold">Pendiente de verificar</span>
                      : fmt(licenseMonthly(l), l.currency)}
                  </td>
                  <td className={`py-3 px-4 ${soon ? 'text-[#b45309] font-bold' : ''}`}>{l.nextRenewalDate || '—'}{soon ? ' · pronto' : ''}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-lg bg-[#f5f3ff] text-[#501f92] text-[10px] font-bold">{l.area}</span></td>
                  <td className="py-3 px-4">{l.status === 'active' ? <span className="text-[#166534] font-semibold">● Activa</span> : <span className="text-[#64748b]">○ Inactiva</span>}</td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {canEdit && (
                      <>
                        <button onClick={() => setEditing(l)} className="text-[#501f92] hover:underline cursor-pointer inline-flex items-center gap-1 mr-3"><Pencil className="w-3 h-3" /> Editar</button>
                        <button onClick={() => toggleStatus(l)} className={`hover:underline cursor-pointer ${l.status === 'active' ? 'text-[#b91c1c]' : 'text-[#166534]'}`}>{l.status === 'active' ? 'Desactivar' : 'Activar'}</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-[#64748b]">Los valores en moneda extranjera se convierten a COP con la TRM vigente que administra Finanzas.</p>
    </div>
  );
};
