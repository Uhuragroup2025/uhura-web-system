/**
 * Nuevo proyecto desde Proyectos (24 Nov 2026): mismo flujo que un proyecto que nace en New Business.
 *
 * 1. Proyecto: cliente, nombre, líder, tipo (Proyecto único o Fee mensual) y la característica
 *    «Interno · no facturable». Fecha de inicio para ambos; el fee pide además los meses del contrato.
 * 2. Alcance: el mismo editor de New Business («Importar alcance» / «Crear alcance»), con entregables,
 *    tareas, rol, horas y semanas por servicio.
 * 3. Fechas: en un proyecto único, la fecha de entrega se sugiere con el MISMO cálculo de «Iniciar proyecto»
 *    (semanas de producción + QA del cliente de cada presentación; cada presentación trae su ronda de
 *    ajustes; días hábiles sin festivos) y se puede editar. El fee no tiene fecha fin ni rondas.
 *
 * El proyecto nace «Por iniciar» con sus entregables y tareas. «Iniciar proyecto» programa las fechas
 * de cada tarea con el mismo motor que usa un proyecto convertido desde New Business.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  ClientProfile,
  FeeRolloverPolicy,
  ProductBacklogTemplate,
  ProjectDeliverable,
  ProjectScheduleConfig,
  ProjectTeamMember,
  ProjectType,
  QuoteProposal,
  TaskItem,
  UserItem
} from './types';
import { initialUsers } from './mockData';
import { BacklogScoper, ScopeServiceDraft } from './newbusiness/BacklogScoper';
import { getScopeWeeks, resolveServiceArea } from './newbusiness/teamCandidates';
import { CATALOG_2026 } from './templates/catalog2026';
import { buildDefaultSteps, computePhaseSchedule, rebalanceToTarget } from './schedule/clientTimeline';
import { businessDaysInRange } from './schedule/scheduleEngine';
import { formatDate } from '../../utils/formatters';
import { X, Briefcase, ChevronLeft, ChevronRight, CalendarDays, Layers, Info } from 'lucide-react';

export interface NewProjectPayload {
  name: string;
  clientId: string;
  clientName: string;
  taxEntityId?: string | null;
  brand: string;
  projectType: ProjectType;
  /** Interno / no facturable: característica de un proyecto único o un fee (no un tipo aparte). */
  nonBillable?: boolean;
  serviceBase: string;
  areas?: string[];
  leadName: string;
  leadAvatarBg: string;
  leadRole?: string;
  accountManagerId?: string;
  accountManagerName?: string;
  budgetedHours: number;
  soldHours?: number;
  soldValue?: number;
  soldValueCOP?: number;
  soldCurrency?: 'COP' | 'USD';
  startDate: string;
  /** Proyecto único: entrega sugerida (semanas + rondas) o la que eligió el líder. Fee: sin fecha fin. */
  endDate?: string;
  brief?: string;
  deliverables: ProjectDeliverable[];
  coreTeam: ProjectTeamMember[];
  rolloverPolicy?: FeeRolloverPolicy;
  /** Fee mensual: meses del contrato. */
  contractMonths?: number;
  /** Semanas y rondas que usará «Iniciar proyecto» (igual que un proyecto convertido). */
  scheduleConfig?: ProjectScheduleConfig;
  status: 'Activo' | 'Planificación';
  teamMembers?: { name: string; role: string; avatarBg: string; initials: string }[];
  tasksToCreate?: Omit<TaskItem, 'id'>[];
}

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientProfile[];
  users?: UserItem[];
  templates?: ProductBacklogTemplate[];
  preselectedClientId?: string | null;
  onAddProject: (projectData: NewProjectPayload) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyQuote = (): QuoteProposal => ({
  id: `quote-new-project-${Date.now()}`,
  opportunityId: 'new-project',
  versionLabel: 'Alcance del proyecto',
  order: 1,
  status: 'draft',
  deliverables: [],
  totalHoursRollup: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const LEAD_LEVELS = ['leader', 'executive', 'system_admin', 'commercial', 'client_relationship'];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  clients,
  users = initialUsers,
  templates = [],
  preselectedClientId,
  onAddProject
}) => {
  const people = users.length ? users : initialUsers;
  const leads = useMemo(
    () => people.filter((u) => u.status !== 'Inactive' && LEAD_LEVELS.includes(u.accessLevel || '')),
    [people]
  );

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [attempted, setAttempted] = useState(false);

  // Paso 1 · Proyecto
  const [clientId, setClientId] = useState('');
  const [taxEntityId, setTaxEntityId] = useState('none');
  const [name, setName] = useState('');
  const [leadId, setLeadId] = useState('');
  const [accountManagerId, setAccountManagerId] = useState('');
  const [projectType, setProjectType] = useState<'fixed_project' | 'fee_monthly'>('fixed_project');
  const [nonBillable, setNonBillable] = useState(false);
  const [startDate, setStartDate] = useState(today());
  const [contractMonths, setContractMonths] = useState(6);
  const [rolloverPolicy, setRolloverPolicy] = useState<FeeRolloverPolicy>('none');
  const [brief, setBrief] = useState('');

  // Paso 2 · Alcance (el mismo editor de New Business)
  const [quote, setQuote] = useState<QuoteProposal>(emptyQuote);
  const [services, setServices] = useState<ScopeServiceDraft[]>([]);

  // Paso 3 · Fechas (solo proyecto único)
  const [weeksOverride, setWeeksOverride] = useState<number | null>(null);
  const [endDateOverride, setEndDateOverride] = useState<string | null>(null);

  const client = clients.find((c) => c.id === clientId);
  const isFee = projectType === 'fee_monthly';

  // Al abrir: todo limpio, con el cliente preseleccionado si viene de la ficha del cliente
  useEffect(() => {
    if (!isOpen) return;
    const first = clients.find((c) => c.id === preselectedClientId) || clients[0];
    setStep(1);
    setAttempted(false);
    setClientId(first?.id || '');
    setTaxEntityId('none');
    setName('');
    setLeadId(leads[0]?.id || '');
    setAccountManagerId(first?.accountManagerId || '');
    setProjectType('fixed_project');
    setNonBillable(Boolean(first?.isInternal));
    setStartDate(today());
    setContractMonths(6);
    setRolloverPolicy('none');
    setBrief('');
    setQuote(emptyQuote());
    setServices([]);
    setWeeksOverride(null);
    setEndDateOverride(null);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalHours = quote.deliverables.reduce(
    (sum, d) => sum + d.backlogItems.reduce((s, i) => s + (Number(i.estimatedHours) || 0), 0),
    0
  );
  const taskCount = quote.deliverables.reduce((n, d) => n + d.backlogItems.length, 0);
  const scopeWeeks = getScopeWeeks(quote, services);
  const productionWeeks = weeksOverride ?? scopeWeeks;

  // Mismo cálculo que «Iniciar proyecto»: fases por entregable, presentaciones por área del servicio
  // (cada una con su QA del cliente y su ronda de ajustes). Interno: sin presentaciones.
  const suggested = useMemo(() => {
    if (isFee || !startDate || productionWeeks <= 0 || quote.deliverables.length === 0) return null;
    const ordered = [...quote.deliverables].sort((a, b) => a.order - b.order);
    const built = buildDefaultSteps(
      ordered.map((d) => ({ id: d.id, name: d.name, hours: d.backlogItems.reduce((s, i) => s + (Number(i.estimatedHours) || 0), 0) })),
      productionWeeks,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        area: resolveServiceArea({
          serviceName: name,
          catalog: CATALOG_2026,
          activities: ordered.flatMap((d) => d.backlogItems.map((i) => ({ roleName: i.roleName || '', estimatedHours: Number(i.estimatedHours) || 0 })))
        }),
        serviceName: name
      }
    );
    const steps = nonBillable ? rebalanceToTarget(built.map((st) => ({ ...st, rounds: [] })), productionWeeks * 5) : built;
    const { endDate: end } = computePhaseSchedule(startDate, steps);
    const presentations = steps.reduce((n, st) => n + st.rounds.length, 0);
    const clientQaDays = steps.reduce((n, st) => n + st.rounds.reduce((a, r) => a + Math.max(1, Math.round(r.reviewDays)), 0), 0);
    return {
      endDate: end,
      totalBusinessDays: businessDaysInRange(startDate, end).length,
      productionDays: Math.round(productionWeeks * 5),
      presentations,
      clientQaDays
    };
  }, [isFee, startDate, productionWeeks, quote.deliverables, nonBillable, name]);
  const endDate = isFee ? undefined : endDateOverride || suggested?.endDate;
  // Si el líder cambia la entrega, los días que gana o pierde van a la producción: así «Iniciar proyecto»
  // llega a la misma fecha (producción = días hábiles hasta la entrega − QA del cliente).
  const manualProductionDays = !isFee && endDateOverride && suggested && endDateOverride >= startDate
    ? Math.max(quote.deliverables.length || 1, businessDaysInRange(startDate, endDateOverride).length - suggested.clientQaDays)
    : null;

  // Validación de cada paso: lo que falta se dice en rojo
  const step1Missing = [
    !clientId && 'el cliente',
    !name.trim() && 'el nombre del proyecto',
    !leadId && 'el líder del proyecto',
    !startDate && 'la fecha de inicio',
    isFee && (!contractMonths || contractMonths < 1) && 'los meses del contrato'
  ].filter(Boolean) as string[];
  const missingRole = quote.deliverables.some((d) => d.backlogItems.some((i) => !i.roleName));
  const step2Missing = [
    taskCount === 0 && 'al menos una tarea',
    totalHours <= 0 && 'las horas',
    missingRole && 'el rol de cada tarea',
    !isFee && scopeWeeks <= 0 && 'las semanas de cada servicio'
  ].filter(Boolean) as string[];
  const step3Missing = [
    !isFee && productionWeeks <= 0 && 'las semanas de producción',
    !isFee && endDate && startDate && endDate < startDate && 'una entrega posterior al inicio'
  ].filter(Boolean) as string[];
  const missing = step === 1 ? step1Missing : step === 2 ? step2Missing : step3Missing;

  const next = () => {
    setAttempted(true);
    if (missing.length) return;
    setAttempted(false);
    setStep((s) => (s === 1 ? 2 : 3));
  };

  const handleCreate = () => {
    setAttempted(true);
    if (step3Missing.length || step1Missing.length || step2Missing.length) return;
    const lead = people.find((u) => u.id === leadId);
    const manager = people.find((u) => u.id === accountManagerId);
    const ordered = [...quote.deliverables].sort((a, b) => a.order - b.order);
    const deliverables: ProjectDeliverable[] = ordered.map((qd, idx) => ({
      id: `del-new-${idx + 1}`,
      projectId: '',
      name: qd.name,
      description: qd.description,
      order: idx + 1,
      status: 'pending',
      roleBudgets: (qd.roleBudgets || []).map((rb) => ({ id: `rb-${rb.id}`, roleId: rb.roleId, roleName: rb.roleName, quotedHours: rb.quotedHours })),
      totalQuotedHours: qd.backlogItems.reduce((s, i) => s + (Number(i.estimatedHours) || 0), 0),
      totalExecutedHours: 0,
      progressPercentage: 0
    } as ProjectDeliverable));
    const tasksToCreate: Omit<TaskItem, 'id'>[] = [];
    ordered.forEach((qd, dIdx) => {
      [...qd.backlogItems].sort((a, b) => a.order - b.order).forEach((item) => {
        const person = people.find((u) => u.id === item.suggestedUserId);
        tasksToCreate.push({
          title: item.title || 'Tarea sin título',
          status: 'todo',
          priority: 'Medium',
          projectName: name.trim(),
          clientName: client?.name,
          deliverableId: `del-new-${dIdx + 1}`,
          frente: qd.name,
          board: name.trim(),
          department: 'Operaciones',
          date: today(),
          dueDate: '', // Se programa al «Iniciar proyecto»
          dueStatus: 'normal',
          dueText: 'Se programa al iniciar el proyecto',
          budgetedHours: Number(item.estimatedHours) || 0,
          consumedSeconds: 0,
          completed: false,
          budgetedRole: item.roleName,
          budgetedRoleId: item.roleId,
          assigneeIds: person ? [person.id] : [],
          assignee: person
            ? { id: person.id, name: person.name, role: item.roleName, avatarBg: person.avatarBg || 'bg-[#501f92]', initials: person.initials || person.name.slice(0, 2).toUpperCase() }
            : { id: undefined, name: `Sin asignar (${item.roleName})`, role: item.roleName, avatarBg: 'bg-[#94a3b8]', initials: '--' }
        } as Omit<TaskItem, 'id'>);
      });
    });

    onAddProject({
      name: name.trim(),
      clientId,
      clientName: client?.name || '',
      taxEntityId: taxEntityId === 'none' ? null : taxEntityId,
      brand: client?.commercialInfo?.brands?.[0] || client?.name || '',
      projectType,
      nonBillable,
      serviceBase: isFee ? 'Servicios Recurrentes & Fee Mensual' : 'Desarrollo & Proyectos Puntuales',
      leadName: lead?.name || '',
      leadAvatarBg: lead?.avatarBg || 'bg-[#501f92]',
      leadRole: lead?.professionalRole || lead?.jobTitle,
      accountManagerId: manager?.id,
      accountManagerName: manager?.name,
      budgetedHours: totalHours,
      soldHours: totalHours,
      startDate,
      endDate,
      brief: brief.trim() || undefined,
      deliverables,
      coreTeam: [],
      rolloverPolicy: isFee ? rolloverPolicy : undefined,
      contractMonths: isFee ? contractMonths : undefined,
      scheduleConfig: {
        clientKickoffWaitDays: 0,
        // Cada presentación al cliente trae su ronda de ajustes (se ajustan en «Iniciar proyecto»)
        includedReworkRounds: isFee || nonBillable ? 0 : suggested?.presentations ?? 0,
        reworkRoundDays: isFee || nonBillable ? 0 : 5,
        productionWeeks: isFee ? 4 : manualProductionDays ? manualProductionDays / 5 : productionWeeks
      },
      status: 'Planificación',
      tasksToCreate
    });
    onClose();
  };

  if (!isOpen) return null;

  const field = 'w-full h-9 px-3 rounded-xl border border-[#cbd5e1] bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#501f92]';
  const label = 'block text-xs font-bold text-[#334155] mb-1';
  const steps = [
    { n: 1, t: 'Proyecto' },
    { n: 2, t: 'Alcance' },
    { n: 3, t: isFee ? 'Revisión' : 'Fechas y revisión' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs" role="dialog" aria-modal="true" aria-label="Nuevo proyecto">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl border border-[#e2e8f0] overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#f5f3ff] text-[#501f92] flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-[#0f172a]">Nuevo proyecto</h2>
              <p className="text-xs text-[#64748b]">Paso {step} de 3 · {steps[step - 1].t}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#0f172a] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 px-5 sm:px-6 py-3 border-b border-[#f1f5f9] text-xs">
          {steps.map((s) => (
            <span
              key={s.n}
              className={`px-3 py-1.5 rounded-full font-bold ${step === s.n ? 'bg-[#501f92] text-white' : step > s.n ? 'bg-[#ede9fe] text-[#501f92]' : 'bg-[#f1f5f9] text-[#64748b]'}`}
            >
              {s.n}. {s.t}
            </span>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 text-xs">
          {/* ── PASO 1 · PROYECTO ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Cliente *</label>
                  <select
                    value={clientId}
                    onChange={(e) => {
                      const c = clients.find((x) => x.id === e.target.value);
                      setClientId(e.target.value);
                      setTaxEntityId('none');
                      setAccountManagerId(c?.accountManagerId || '');
                      setNonBillable(Boolean(c?.isInternal));
                    }}
                    className={field}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}{c.isInternal ? ' (interno Uhura)' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Razón social / NIT <span className="font-normal text-[#94a3b8]">(opcional)</span></label>
                  <select value={taxEntityId} onChange={(e) => setTaxEntityId(e.target.value)} className={field}>
                    <option value="none">Sin asignar</option>
                    {(client?.taxEntities || []).map((t) => (
                      <option key={t.id} value={t.id}>{t.businessName}{t.nit ? ` · ${t.nit}` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={label}>Nombre del proyecto *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej.: Tienda online, Campaña Navidad 2026, Gerencia UHURA" className={field} />
                </div>
                <div>
                  <label className={label}>Líder del proyecto *</label>
                  <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className={field}>
                    {leads.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}{u.professionalRole ? ` · ${u.professionalRole}` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Responsable de cliente <span className="font-normal text-[#94a3b8]">(opcional)</span></label>
                  <select value={accountManagerId} onChange={(e) => setAccountManagerId(e.target.value)} className={field}>
                    <option value="">Sin asignar</option>
                    {people.filter((u) => u.status !== 'Inactive').map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <span className={label}>¿Qué tipo de proyecto es? *</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    { type: 'fixed_project', title: 'Proyecto único', desc: 'Tiene inicio y entrega. Se planea con el alcance, las semanas de producción y las rondas de ajuste.' },
                    { type: 'fee_monthly', title: 'Fee mensual', desc: 'Contrato por meses con una bolsa de horas cada mes. Sin fecha fin ni rondas de ajuste.' }
                  ] as const).map((o) => (
                    <button
                      key={o.type}
                      type="button"
                      onClick={() => setProjectType(o.type)}
                      aria-pressed={projectType === o.type}
                      className={`text-left p-4 rounded-2xl border-2 transition-colors cursor-pointer ${projectType === o.type ? 'border-[#501f92] bg-[#faf7ff]' : 'border-[#e2e8f0] hover:border-[#cbd5e1]'}`}
                    >
                      <span className={`block text-sm font-extrabold ${projectType === o.type ? 'text-[#501f92]' : 'text-[#0f172a]'}`}>{o.title}</span>
                      <span className="block text-[11px] text-[#64748b] mt-1">{o.desc}</span>
                    </button>
                  ))}
                </div>
                <label className="mt-3 flex items-start gap-2.5 p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] cursor-pointer select-none">
                  <input type="checkbox" checked={nonBillable} onChange={(e) => setNonBillable(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#501f92]" />
                  <span>
                    <span className="block font-bold text-[#0f172a]">Interno · no facturable</span>
                    <span className="block text-[11px] text-[#64748b]">Proyecto de UHURA Group que no se cobra (Gerencia, Administrativo, Rituales…). Sin rondas de ajuste ni insumos del cliente.</span>
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={label}>Fecha de inicio *</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={field} />
                </div>
                {isFee ? (
                  <>
                    <div>
                      <label className={label}>Meses del contrato *</label>
                      <input type="number" min={1} max={36} value={contractMonths} onChange={(e) => setContractMonths(Number(e.target.value))} className={field} />
                    </div>
                    <div>
                      <label className={label}>Horas no usadas del mes</label>
                      <select value={rolloverPolicy} onChange={(e) => setRolloverPolicy(e.target.value as FeeRolloverPolicy)} className={field}>
                        <option value="none">No pasan al mes siguiente (regla general)</option>
                        <option value="carry_over">Pasan todas (pactado con el cliente)</option>
                        <option value="contractual_cap">Pasan hasta el 25 % (pactado)</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <p className="sm:col-span-2 self-end text-[11px] text-[#64748b] flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#501f92]" />
                    La fecha de entrega se sugiere en el paso 3 con las semanas del alcance y las rondas de ajuste. La puedes cambiar.
                  </p>
                )}
              </div>

              <div>
                <label className={label}>Brief o contexto <span className="font-normal text-[#94a3b8]">(opcional)</span></label>
                <textarea rows={3} value={brief} onChange={(e) => setBrief(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs focus:outline-none focus:border-[#501f92]" />
              </div>
            </div>
          )}

          {/* ── PASO 2 · ALCANCE (mismo editor de New Business) ── */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-[11px] text-[#64748b] flex items-start gap-1.5">
                <Layers className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#501f92]" />
                {isFee
                  ? 'Las tareas del primer mes. Cada mes nuevo copia estas tareas al abrir su ciclo.'
                  : 'Entregables, tareas, rol y horas, y las semanas de cada servicio. Con esto se calcula la fecha de entrega.'}
              </p>
              <BacklogScoper
                quote={quote}
                onUpdateQuote={setQuote}
                services={services}
                onChangeServices={setServices}
                templates={templates}
                opportunityTitle={name}
                prospectName={client?.name}
                users={people}
              />
            </div>
          )}

          {/* ── PASO 3 · FECHAS Y REVISIÓN ── */}
          {step === 3 && (
            <div className="space-y-5">
              {!isFee && (
                <div className="rounded-2xl border border-[#e2e8f0] p-4 space-y-4">
                  <p className="font-extrabold text-sm text-[#0f172a] flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[#501f92]" /> Fecha de entrega</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className={label}>Semanas de producción</label>
                      <input type="number" min={1} max={104} value={productionWeeks || ''} onChange={(e) => { setWeeksOverride(Number(e.target.value)); setEndDateOverride(null); }} className={field} />
                      <span className="text-[10.5px] text-[#94a3b8]">Del alcance: {scopeWeeks || '—'}</span>
                    </div>
                    <div>
                      <span className={label}>Presentaciones al cliente</span>
                      <p className="h-9 flex items-center text-xs font-bold text-[#0f172a]">
                        {nonBillable ? 'Ninguna (proyecto interno)' : `${suggested?.presentations ?? 0} · cada una con su ronda de ajustes`}
                      </p>
                      {!nonBillable && <span className="text-[10.5px] text-[#94a3b8]">Se ajustan al «Iniciar proyecto»</span>}
                    </div>
                    <div>
                      <label className={label}>Entrega</label>
                      <input type="date" value={endDate || ''} min={startDate} onChange={(e) => setEndDateOverride(e.target.value || null)} className={field} />
                      {endDateOverride && suggested && endDateOverride !== suggested.endDate && (
                        <>
                          <span className="block text-[10.5px] text-[#92400e]">
                            Elegiste otra entrega: quedan {manualProductionDays} días de producción y «Iniciar proyecto» llegará a esta fecha.
                          </span>
                          <button type="button" onClick={() => setEndDateOverride(null)} className="text-[10.5px] font-bold text-[#501f92] hover:underline cursor-pointer">
                            Volver a la sugerida ({formatDate(suggested.endDate)})
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {suggested && (
                    <p className="text-[11px] text-[#475569] bg-[#faf7ff] border border-[#ede9fe] rounded-xl px-3 py-2">
                      <strong>Entrega sugerida: {formatDate(suggested.endDate)}</strong> · producción {suggested.productionDays} días
                      {suggested.clientQaDays > 0 ? ` + QA del cliente ${suggested.clientQaDays} días (${suggested.presentations} presentación${suggested.presentations === 1 ? '' : 'es'})` : ''}
                      {` = ${suggested.totalBusinessDays} días hábiles`} (sin fines de semana ni festivos). Es el mismo cálculo de «Iniciar proyecto», donde se programa cada tarea.
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-2xl border border-[#e2e8f0] p-4">
                <p className="font-extrabold text-sm text-[#0f172a] mb-3">Resumen</p>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div><dt className="text-[#64748b]">Tipo</dt><dd className="font-bold text-[#0f172a]">{isFee ? 'Fee mensual' : 'Proyecto único'}{nonBillable ? ' · interno' : ''}</dd></div>
                  <div><dt className="text-[#64748b]">Inicio</dt><dd className="font-bold text-[#0f172a]">{formatDate(startDate)}</dd></div>
                  <div><dt className="text-[#64748b]">{isFee ? 'Contrato' : 'Entrega'}</dt><dd className="font-bold text-[#0f172a]">{isFee ? `${contractMonths} meses` : endDate ? formatDate(endDate) : '—'}</dd></div>
                  <div><dt className="text-[#64748b]">Alcance</dt><dd className="font-bold text-[#0f172a]">{quote.deliverables.length} entregables · {taskCount} tareas · {totalHours} h{isFee ? ' / mes' : ''}</dd></div>
                </dl>
                <p className="mt-3 text-[11px] text-[#64748b]">El proyecto nace «Por iniciar». Revisa que las horas y las personas tengan sentido y luego pulsa «Iniciar proyecto»: ahí se programa cada tarea.</p>
              </div>
            </div>
          )}

          {attempted && missing.length > 0 && (
            <p role="alert" className="mt-4 text-[11px] font-semibold text-[#dc2626]">Falta: {missing.join(', ')}.</p>
          )}
        </div>

        {/* Pie */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-[#f1f5f9] bg-[#f8fafc]">
          {step > 1 ? (
            <button type="button" onClick={() => { setAttempted(false); setStep((s) => (s === 3 ? 2 : 1)); }} className="inline-flex items-center gap-1 h-9 px-3 rounded-xl text-xs font-bold text-[#475569] hover:bg-[#e2e8f0] cursor-pointer">
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
          ) : (
            <button type="button" onClick={onClose} className="h-9 px-3 rounded-xl text-xs font-bold text-[#475569] hover:bg-[#e2e8f0] cursor-pointer">Cancelar</button>
          )}
          {step < 3 ? (
            <button type="button" onClick={next} className="inline-flex items-center gap-1 h-9 px-4 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-white text-xs font-bold cursor-pointer">
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleCreate} className="h-9 px-4 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-white text-xs font-bold cursor-pointer">
              Crear proyecto
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
