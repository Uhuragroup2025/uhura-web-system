import React, { useEffect, useMemo, useState } from 'react';
import { Download, Mail, X, Pencil, Check, Plus, Trash2, CircleCheck, ExternalLink, Wrench, ShieldCheck, Presentation, Clock, RefreshCw, Users, CalendarDays, Inbox, Handshake } from 'lucide-react';
import { formatDate } from '../../../utils/formatters';
import { computePhaseSchedule, removeRound, appendRound, type PhaseSteps } from '../schedule/clientTimeline';
import { businessDaysInRange } from '../schedule/scheduleEngine';

/**
 * Cronograma y acuerdos (kickoff, 19 Nov 2026).
 * Vista amplia para proyectar con el cliente. Todo es editable en vivo («Editar»): días de cada
 * paso de cada fase, fechas de los insumos, encargados del cliente y acuerdos. Al cambiar un paso
 * se recalculan las fases y la entrega (días hábiles con festivos) y, al aplicar, las tareas.
 * Nunca muestra horas internas ni tarifas (regla del SOW).
 */
export interface ClientCommitment { key: string; title: string; date: string; blocking: boolean; phase: string }

export interface ClientKickoffViewProps {
  projectName: string;
  clientName?: string;
  isFee: boolean;
  startDate: string;
  leaderName: string;
  /** Equipo que lidera la ejecución (p. ej. Front-End, diseño): sale de los colaboradores de las tareas. */
  teamLeads: string[];
  commercialName?: string;
  clientApprover: string;
  clientApproverBackup: string;
  onChangeClientContacts: (approver: string, backup: string) => void;
  steps: PhaseSteps[];
  onChangeSteps: (steps: PhaseSteps[]) => void;
  /** Fecha mínima de inicio por fase (insumos bloqueantes acordados después del inicio de su fase). */
  notBefore: Record<string, string>;
  commitments: ClientCommitment[];
  onChangeCommitmentDate: (key: string, date: string) => void;
  agreements: string[];
  onChangeAgreements: (list: string[]) => void;
  monthPlan?: { phase: string; items: string[] }[];
  /** Qué se hace en cada fase (resumen de sus tareas, sin horas). */
  phaseSummaries?: Record<string, string[]>;
  contractMonths?: number;
  /** Aprobación del cronograma y los acuerdos por parte del cliente (en el kickoff). */
  clientApproval?: { name: string; date: string } | null;
  onClientApproval: (approval: { name: string; date: string } | null) => void;
  /** Proyecto ya iniciado: los cambios se aplican con este botón (reprograma tareas). */
  onApply?: () => void;
  applyPending?: boolean;
  onClose: () => void;
  /** En ventana propia (no como modal sobre ECO). */
  standalone?: boolean;
  /** Vista para compartir (pestaña sin conexión a ECO): se ve todo, sin editar. */
  readOnly?: boolean;
  /** Abre esta vista en una pestaña nueva (para proyectar o compartir). */
  onOpenInNewTab?: () => void;
}

export function defaultClientAgreements(isFee: boolean, includedRounds: number, approvalDays: number, rolloverLabel?: string): string[] {
  return isFee
    ? [
        'El plan del mes se aprueba en los primeros 3 días hábiles; sin aprobación, el mes arranca más tarde y lo no producido no se repone.',
        'Los ajustes del día a día salen de la bolsa de horas del mes.',
        'Lo que esté fuera del plan del mes se cotiza aparte o reemplaza otra cosa del plan, de común acuerdo.',
        `Horas no usadas: ${rolloverLabel || 'según el contrato'}.`,
        'Un solo interlocutor del cliente consolida los comentarios de cada entrega.',
        'Si el encargado del cliente no está, aprueba su suplente.',
        'Cada mes cierra con un reporte de resultados y la propuesta de ajustes.'
      ]
    : [
        'Cada presentación incluye una ronda: el cliente revisa y nosotros ajustamos. Las rondas adicionales se cotizan aparte antes de ejecutarlas.',
        `El cliente tiene ${approvalDays} días hábiles para aprobar cada presentación; sin respuesta, la entrega se da por aprobada.`,
        'Los comentarios llegan consolidados, de un solo interlocutor del cliente.',
        'Si el encargado del cliente no está, aprueba su suplente; si ninguno responde a tiempo, aplica la aprobación del punto anterior.',
        'Si un insumo que bloquea llega después de la fecha acordada, la fase y la entrega final se corren los mismos días hábiles.',
        'Si la espera supera 10 días hábiles, el proyecto se pausa y se reprograma según la disponibilidad del equipo.',
        'Si la pausa supera 30 días calendario, se factura lo ejecutado a la fecha y el reinicio se agenda de común acuerdo.',
        'Los cambios de alcance se cotizan y aprueban antes de ejecutarse.',
        'Facturación: 50 % al iniciar y 50 % en la entrega final. Si la entrega se corre más de 15 días hábiles por causas del cliente, el segundo pago se factura en la fecha original acordada.'
      ];
}

const PRINT_ID = 'client-kickoff-print';

const inputCls = 'px-2 py-1 rounded-lg border border-[#d8d3e8] bg-white text-[13px] text-[#0f172a] focus:outline-none focus:border-[#8a4dff]';

const DayInput: React.FC<{ value: number; min?: number; onChange: (n: number) => void; label: string }> = ({ value, min = 0, onChange, label }) => (
  <input
    type="number"
    min={min}
    value={value}
    aria-label={label}
    onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
    className={`w-14 text-center font-semibold ${inputCls}`}
  />
);

// Fechas amables: «3 nov», «lun 3 nov 2026»
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const parse = (iso?: string) => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? new Date(`${iso.slice(0, 10)}T12:00:00`) : null);
const short = (iso?: string) => { const d = parse(iso); return d ? `${d.getDate()} ${MONTHS[d.getMonth()]}` : '—'; };
const long = (iso?: string) => { const d = parse(iso); return d ? `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : '—'; };
const span = (a?: string, b?: string) => (a && b && a !== b ? `${short(a)} – ${short(b)}` : short(b || a));

// Avatar con iniciales y un color estable por nombre
const AVATAR_COLORS = ['#501f92', '#0284c7', '#0f766e', '#b45309', '#be185d', '#4338ca', '#15803d'];
const Avatar: React.FC<{ name: string; tone?: 'client' }> = ({ name, tone }) => {
  const clean = name.replace(/\(.*?\)/g, '').trim();
  const initials = clean.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
  const color = tone === 'client' ? '#d97706' : AVATAR_COLORS[Array.from(clean).reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
  return (
    <span className="w-9 h-9 rounded-xl shrink-0 inline-flex items-center justify-center text-white text-[12px] font-bold" style={{ background: color }} aria-hidden="true">
      {initials}
    </span>
  );
};

const SectionHeader: React.FC<{ title: string; meta?: React.ReactNode; icon: React.ReactNode }> = ({ title, meta, icon }) => (
  <div className="flex items-center justify-between gap-3 mb-3">
    <h3 className="flex items-center gap-2 text-[15px] font-bold text-[#0f172a]">
      <span className="w-7 h-7 rounded-lg bg-[#f5f3ff] text-[#501f92] inline-flex items-center justify-center">{icon}</span>
      {title}
    </h3>
    {meta && <span className="text-[12px] text-[#64748b]">{meta}</span>}
  </div>
);

type StepKind = 'work' | 'qa' | 'presentation' | 'checkpoint' | 'client' | 'adjust';
const STEP_STYLE: Record<StepKind, { icon: React.ReactNode; cls: string; text: string }> = {
  work: { icon: <Wrench className="w-3.5 h-3.5" />, cls: 'bg-[#f1f5f9] text-[#475569]', text: 'text-[#334155]' },
  qa: { icon: <ShieldCheck className="w-3.5 h-3.5" />, cls: 'bg-[#f1f5f9] text-[#475569]', text: 'text-[#334155]' },
  presentation: { icon: <Presentation className="w-3.5 h-3.5" />, cls: 'bg-[#501f92] text-white', text: 'text-[#0f172a] font-semibold' },
  checkpoint: { icon: <Presentation className="w-3.5 h-3.5" />, cls: 'bg-white text-[#501f92] ring-1 ring-[#c4b5fd]', text: 'text-[#0f172a] font-semibold' },
  client: { icon: <Clock className="w-3.5 h-3.5" />, cls: 'bg-[#fef3c7] text-[#b45309]', text: 'text-[#92400e]' },
  adjust: { icon: <RefreshCw className="w-3.5 h-3.5" />, cls: 'bg-[#f1f5f9] text-[#475569]', text: 'text-[#334155]' }
};

/** Un paso dentro de la fase: ícono · qué pasa · cuándo. */
const Step: React.FC<{ kind: StepKind; label: React.ReactNode; when: React.ReactNode; whenStrong?: boolean }> = ({ kind, label, when, whenStrong }) => {
  const st = STEP_STYLE[kind];
  return (
    <li className="flex items-center gap-3 py-1.5">
      <span className={`w-6 h-6 rounded-lg shrink-0 inline-flex items-center justify-center ${st.cls}`} aria-hidden="true">{st.icon}</span>
      <span className={`flex-1 min-w-0 text-[13px] ${st.text}`}>{label}</span>
      <span className={`shrink-0 text-right text-[13px] tabular-nums ${whenStrong ? 'font-semibold text-[#501f92]' : kind === 'client' ? 'text-[#92400e]' : 'text-[#64748b]'}`}>{when}</span>
    </li>
  );
};

export const ClientKickoffView: React.FC<ClientKickoffViewProps> = (props) => {
  const { isFee, steps, commitments } = props;
  const [editing, setEditing] = useState(false);
  const [newAgreement, setNewAgreement] = useState('');

  useEffect(() => {
    if (props.standalone) return; // en ventana propia se cierra la ventana, no con Esc
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') props.onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [props]);

  // Cronograma vivo: cualquier cambio de días o de insumos recalcula fechas y entrega
  const schedule = useMemo(() => computePhaseSchedule(props.startDate, steps, props.notBefore), [props.startDate, steps, props.notBefore]);
  const endDate = schedule.endDate;

  const updateStep = (idx: number, patch: Partial<PhaseSteps>) =>
    props.onChangeSteps(steps.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const updateRound = (idx: number, r: number, patch: Partial<PhaseSteps['rounds'][number]>) =>
    updateStep(idx, { rounds: steps[idx].rounds.map((x, k) => (k === r ? { ...x, ...patch } : x)) });

  // ── Edición por FECHAS (más natural en la reunión): cada fecha se traduce a días hábiles y todo lo
  // que sigue se corre. Presentación 1 → días de producción; presentación 2+ → días de ajustes de la
  // ronda anterior; «aprobación hasta» → días de QA del cliente; fin de una fase sin rondas → producción.
  const daysStrictlyBetween = (from: string, to: string) =>
    from && to && to > from ? businessDaysInRange(from, to).filter((d) => d > from && d < to).length : 0;
  const daysFromTo = (from: string, to: string) => (from && to && to >= from ? businessDaysInRange(from, to).length : 0);
  const setPresentationDate = (idx: number, k: number, date: string) => {
    const ph = schedule.phases[idx];
    if (!date || !ph) return;
    if (k === 0) {
      const before = businessDaysInRange(ph.start, date).filter((d) => d < date).length;
      updateStep(idx, { productionDays: Math.max(1, before - steps[idx].qaDays) });
    } else {
      // Días entre los ajustes de la presentación anterior y esta = trabajo (+ QA interno) previo a esta
      const gap = daysStrictlyBetween(ph.rounds[k - 1].adjustEnd, date);
      updateRound(idx, k, { workDays: Math.max(0, gap - (steps[idx].rounds[k].qaDays || 0)) });
    }
  };
  const setApprovalEnd = (idx: number, k: number, date: string) => {
    const r = schedule.phases[idx]?.rounds[k];
    if (!date || !r) return;
    updateRound(idx, k, { reviewDays: Math.max(1, daysFromTo(r.presentation, date)) });
  };
  const setPhaseEnd = (idx: number, date: string) => {
    const ph = schedule.phases[idx];
    if (!date || !ph) return;
    updateStep(idx, { productionDays: Math.max(1, daysFromTo(ph.start, date) - steps[idx].qaDays) });
  };
  const [approverName, setApproverName] = useState('');

  const plain = [
    `Cronograma y acuerdos — ${props.projectName}${props.clientName ? ` (${props.clientName})` : ''}`,
    '',
    ...(!isFee ? schedule.phases.map((p) => `${p.name}: ${formatDate(p.start)} → ${formatDate(p.end)}${p.rounds.map((r) => ` · presentación ${formatDate(r.presentation)}, aprobación hasta ${formatDate(r.approvalEnd)}`).join('')}`) : []),
    !isFee ? `Entrega final: ${formatDate(endDate)}` : '',
    '',
    ...(commitments.length ? ['Lo que necesitamos:', ...commitments.map((c) => `• ${c.title} — ${formatDate(c.date)}`)] : []),
    '',
    'Acuerdos:',
    ...props.agreements.map((a) => `• ${a}`)
  ].join('\n');
  const mailto = `mailto:?subject=${encodeURIComponent(`Cronograma y acuerdos — ${props.projectName}`)}&body=${encodeURIComponent(plain)}`;

  const today = new Date().toISOString().slice(0, 10);
  const canEdit = !props.readOnly;
  const totalDays = !isFee && props.startDate && endDate ? businessDaysInRange(props.startDate, endDate).length : 0;
  const phaseState = (start: string, end: string): 'done' | 'current' | 'next' => (end < today ? 'done' : start <= today ? 'current' : 'next');
  const people: { label: string; name: string; sub?: string; tone?: 'client' }[] = [
    { label: 'Líder del proyecto', name: props.leaderName.replace(/\s*\(.*?\)/, '') },
    ...props.teamLeads.slice(0, 3).map((n) => ({ label: 'Equipo líder', name: n })),
    ...(props.commercialName ? [{ label: 'Relación con el cliente', name: props.commercialName }] : [])
  ];
  const btn = 'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#e2e8f0] bg-white text-[13px] font-medium text-[#334155] hover:bg-[#f8fafc] hover:border-[#cbd5e1] cursor-pointer';

  return (
    <div className={props.standalone ? 'min-h-screen bg-[#f4f2f8]' : 'fixed inset-0 z-[80] bg-[#0f172a]/50 backdrop-blur-sm overflow-y-auto'} role={props.standalone ? 'main' : 'dialog'} aria-modal={props.standalone ? undefined : true} aria-label="Cronograma y acuerdos">
      <style>{`@media print { body * { visibility: hidden !important; } #${PRINT_ID}, #${PRINT_ID} * { visibility: visible !important; } #${PRINT_ID} { position: absolute; inset: 0; margin: 0; box-shadow: none; border: 0; } .no-print { display: none !important; } }`}</style>
      <div id={PRINT_ID} className={`relative mx-auto w-[min(940px,calc(100%-32px))] text-[13px] text-[#334155] ${props.standalone ? 'my-6' : 'my-8'} space-y-4`}>

        {/* ── Encabezado: proyecto, fechas clave y acciones ── */}
        <header className="bg-white rounded-2xl border border-[#e7e3ef] shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#501f92] via-[#8a4dff] to-[#d4ff4a]" />
          <div className="px-6 sm:px-7 pt-5 pb-5">
            {/* En celular y tablet las acciones van arriba y el título ocupa todo el ancho (sin espacio en blanco al lado); desde escritorio, lado a lado. */}
            <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
              <div className="min-w-0 lg:flex-1">
                <p className="text-[12px] font-medium text-[#64748b]">{props.clientName || 'Cliente'} · Uhura Group</p>
                <h2 className="text-[22px] font-extrabold text-[#0f172a] leading-tight [text-wrap:balance] mt-0.5">{props.projectName}</h2>
                <p className="text-[13px] text-[#64748b] mt-1">Cronograma y acuerdos del proyecto</p>
              </div>
              <div className="no-print flex items-center justify-end gap-1.5 flex-wrap lg:shrink-0">
                {canEdit && props.onApply && props.applyPending && (
                  <button type="button" onClick={props.onApply} className="inline-flex items-center h-8 px-3 rounded-lg bg-[#501f92] hover:bg-[#3d1572] text-white text-[13px] font-semibold cursor-pointer" title="Reprograma las fases y las tareas del proyecto con estos cambios">
                    Aplicar al cronograma
                  </button>
                )}
                {canEdit && (
                  <button type="button" onClick={() => setEditing((v) => !v)} className={editing ? 'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#501f92] text-white text-[13px] font-semibold cursor-pointer' : btn}>
                    {editing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />} {editing ? 'Listo' : 'Editar'}
                  </button>
                )}
                <button type="button" onClick={(e) => (e.currentTarget.ownerDocument.defaultView || window).print()} className={btn} title="Guardar como PDF desde el diálogo de impresión">
                  <Download className="w-4 h-4" /> PDF
                </button>
                <a href={mailto} className={btn}><Mail className="w-4 h-4" /> Correo</a>
                {props.onOpenInNewTab && (
                  <button type="button" onClick={props.onOpenInNewTab} className={btn} title="Abrir en otra pestaña para proyectar o compartir">
                    <ExternalLink className="w-4 h-4" /> Pestaña nueva
                  </button>
                )}
                {!props.readOnly && (
                  <button type="button" onClick={props.onClose} aria-label="Cerrar" className={`${btn} w-8 justify-center !px-0`}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Datos clave */}
            <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#efecf5] rounded-xl overflow-hidden border border-[#efecf5]">
              <div className="bg-white px-4 py-3">
                <dt className="text-[11px] font-medium text-[#64748b]">Inicio</dt>
                <dd className="text-[14px] font-semibold text-[#0f172a] mt-0.5">{long(props.startDate)}</dd>
              </div>
              <div className="bg-[#faf7ff] px-4 py-3">
                <dt className="text-[11px] font-medium text-[#501f92]">{isFee ? 'Vigencia' : 'Entrega final'}</dt>
                <dd className="text-[14px] font-bold text-[#501f92] mt-0.5">{isFee ? `${props.contractMonths || '—'} meses` : long(endDate)}</dd>
              </div>
              <div className="bg-white px-4 py-3">
                <dt className="text-[11px] font-medium text-[#64748b]">{isFee ? 'Modalidad' : 'Duración'}</dt>
                <dd className="text-[14px] font-semibold text-[#0f172a] mt-0.5">{isFee ? 'Fee mensual' : `${totalDays} días hábiles`}</dd>
              </div>
              <div className="bg-white px-4 py-3">
                <dt className="text-[11px] font-medium text-[#64748b]">Aprobación del cliente</dt>
                <dd className="mt-1">
                  {props.clientApproval
                    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#166534] text-[12px] font-semibold"><CircleCheck className="w-3.5 h-3.5" /> Aprobado</span>
                    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] text-[12px] font-semibold"><Clock className="w-3.5 h-3.5" /> Pendiente</span>}
                </dd>
              </div>
            </dl>
          </div>
        </header>

        {/* ── Quién está a cargo ── */}
        <section className="bg-white rounded-2xl border border-[#e7e3ef] px-6 sm:px-7 py-5">
          <SectionHeader title="Quién está a cargo" icon={<Users className="w-4 h-4" />} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {people.map((p, i) => (
              <div key={`${p.label}-${p.name}-${i}`} className="flex items-center gap-3 min-w-0">
                <Avatar name={p.name} />
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#0f172a] truncate">{p.name}</p>
                  <p className="text-[12px] text-[#64748b]">{p.label}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 min-w-0 rounded-xl bg-[#fffbeb] px-3 py-2 -mx-1">
              <Avatar name={props.clientApprover || 'Cliente'} tone="client" />
              <div className="min-w-0 flex-1">
                {editing ? (
                  <div className="space-y-1">
                    <input value={props.clientApprover} onChange={(e) => props.onChangeClientContacts(e.target.value, props.clientApproverBackup)} placeholder="Quien aprueba" className={`w-full ${inputCls}`} aria-label="Encargado del cliente" />
                    <input value={props.clientApproverBackup} onChange={(e) => props.onChangeClientContacts(props.clientApprover, e.target.value)} placeholder="Suplente" className={`w-full ${inputCls}`} aria-label="Suplente del cliente" />
                  </div>
                ) : (
                  <>
                    <p className="text-[14px] font-semibold text-[#0f172a] truncate">{props.clientApprover || 'Por definir'}</p>
                    <p className="text-[12px] text-[#92400e]">Aprueba por el cliente · suplente: {props.clientApproverBackup || 'por definir'}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {!isFee ? (
          /* ── Cronograma: barra de fases y una tarjeta por fase ── */
          <section className="bg-white rounded-2xl border border-[#e7e3ef] px-6 sm:px-7 py-5">
            <SectionHeader title="Cronograma" icon={<CalendarDays className="w-4 h-4" />} meta={`${schedule.phases.length} fases · días hábiles, sin festivos`} />

            {/* Vista rápida: cuánto dura cada fase y dónde estamos hoy */}
            {totalDays > 0 && (
              <div className="mb-5">
                <div className="flex h-2.5 rounded-full overflow-hidden bg-[#f1f5f9] gap-0.5">
                  {schedule.phases.map((ph) => {
                    const days = Math.max(1, businessDaysInRange(ph.start, ph.end).length);
                    const st = phaseState(ph.start, ph.end);
                    return <span key={ph.id} title={`${ph.name}: ${span(ph.start, ph.end)}`} style={{ flexGrow: days }} className={st === 'done' ? 'bg-[#a78bfa]' : st === 'current' ? 'bg-[#501f92]' : 'bg-[#e9e3f7]'} />;
                  })}
                </div>
                <div className="flex justify-between mt-1.5 text-[11px] text-[#64748b]">
                  <span>{short(props.startDate)}</span>
                  <span className="font-semibold text-[#501f92]">Entrega {short(endDate)}</span>
                </div>
              </div>
            )}

            <ol className="space-y-3">
              {schedule.phases.map((ph, idx) => {
                const st = phaseState(ph.start, ph.end);
                const summary = props.phaseSummaries?.[ph.id] || [];
                return (
                  <li key={ph.id} className={`rounded-xl border px-4 py-3.5 ${st === 'current' ? 'border-[#c4b5fd] bg-[#fcfbff] shadow-[0_1px_0_#ede9fe]' : 'border-[#eeeaf4]'}`}>
                    <div className="flex items-start gap-3">
                      <span className={`w-7 h-7 rounded-full shrink-0 inline-flex items-center justify-center text-[12px] font-bold ${st === 'done' ? 'bg-[#dcfce7] text-[#166534]' : st === 'current' ? 'bg-[#501f92] text-white' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                        {st === 'done' ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2">
                            {ph.name}
                            {st === 'current' && <span className="px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#501f92] text-[11px] font-semibold">En curso</span>}
                            {st === 'done' && <span className="px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#166534] text-[11px] font-semibold">Terminada</span>}
                          </p>
                          <span className="text-[13px] font-medium text-[#475569] tabular-nums">
                            {short(ph.start)} – {canEdit && editing && ph.rounds.length === 0
                              ? <input type="date" value={ph.end} min={ph.start} onChange={(e) => setPhaseEnd(idx, e.target.value)} className={inputCls} aria-label={`Fin de ${ph.name}`} />
                              : short(ph.end)}
                          </span>
                        </div>
                        {summary.length > 0 && <p className="text-[12px] text-[#64748b] mt-0.5 leading-snug">{summary.slice(0, 4).join(' · ')}{summary.length > 4 ? '…' : ''}</p>}

                        <ul className="mt-2 border-t border-[#f1f5f9] pt-1.5">
                          <Step kind="work" label="Producción" when={span(ph.productionStart, ph.productionEnd)} />
                          {(ph.qaDays > 0 || editing) && (
                            <Step kind="qa" label="QA interno" when={editing
                              ? <span className="inline-flex items-center gap-1"><DayInput value={steps[idx].qaDays} onChange={(n) => updateStep(idx, { qaDays: n })} label={`Días de QA interno de ${ph.name}`} /> días</span>
                              : span(ph.qaStart, ph.qaEnd)} />
                          )}
                          {ph.rounds.map((r, k) => {
                            const isCheck = r.kind === 'checkpoint';
                            return (
                              <React.Fragment key={r.n}>
                                {r.workDays > 0 && r.workStart && r.workEnd && <Step kind="work" label={r.label} when={span(r.workStart, r.workEnd)} />}
                                {r.preQaDays > 0 && r.preQaEnd && <Step kind="qa" label="QA interno" when={span(r.preQaStart, r.preQaEnd)} />}
                                <Step
                                  kind={isCheck ? 'checkpoint' : 'presentation'}
                                  whenStrong
                                  label={<>{isCheck ? 'Avance' : 'Presentación'} · {r.label}{isCheck && <span className="font-normal text-[#64748b]"> (valida el rumbo, sin aprobación formal)</span>}</>}
                                  when={editing
                                    ? <span className="inline-flex items-center gap-1">
                                        <input type="date" value={r.presentation} onChange={(e) => setPresentationDate(idx, k, e.target.value)} className={inputCls} aria-label={`Presentación ${r.n} de ${ph.name}`} />
                                        <button type="button" onClick={() => props.onChangeSteps(steps.map((st2, i) => (i === idx ? removeRound(st2, k) : st2)))} className="no-print p-1 text-[#94a3b8] hover:text-[#dc2626] cursor-pointer" aria-label={`Quitar presentación ${r.n}`}><Trash2 className="w-3.5 h-3.5" /></button>
                                      </span>
                                    : long(r.presentation)}
                                />
                                <Step
                                  kind="client"
                                  label={<>Revisión del cliente · {r.approvalDays} {r.approvalDays === 1 ? 'día hábil' : 'días hábiles'}</>}
                                  when={editing
                                    ? <input type="date" value={r.approvalEnd} min={r.presentation} onChange={(e) => setApprovalEnd(idx, k, e.target.value)} className={inputCls} aria-label={`Fin de la revisión del cliente ${r.n} de ${ph.name}`} />
                                    : `hasta ${short(r.approvalEnd)}`}
                                />
                                {(r.adjustDays > 0 || editing) && (
                                  <Step kind="adjust" label="Nuestros ajustes" when={editing
                                    ? <span className="inline-flex items-center gap-1"><DayInput value={steps[idx].rounds[k].adjustDays} onChange={(n) => updateRound(idx, k, { adjustDays: n })} label={`Días de nuestros ajustes ${r.n} de ${ph.name}`} /> días</span>
                                    : span(r.adjustStart, r.adjustEnd)} />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </ul>
                        {editing && (
                          <button type="button" onClick={() => props.onChangeSteps(steps.map((st2, i) => (i === idx ? appendRound(st2, { label: st2.name, kind: 'approval', reviewDays: 3, adjustDays: 2 }) : st2)))} className="no-print mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-[#501f92] hover:underline cursor-pointer">
                            <Plus className="w-3.5 h-3.5" /> Añadir presentación
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 text-[12px] text-[#64748b] leading-relaxed">
              Una <span className="font-semibold">presentación</span> es cada vez que te mostramos un avance para que lo revises y apruebes. Cada una incluye una ronda: en la <span className="font-semibold text-[#92400e]">revisión del cliente</span> revisas y nos mandas tus comentarios en un solo envío, y luego nosotros ajustamos. Si la revisión se extiende, lo que sigue se corre los mismos días. A las presentaciones asisten {props.leaderName.replace(/\s*\(.*?\)/, '')}{props.commercialName ? ` y ${props.commercialName}` : ''}.
            </p>
          </section>
        ) : (
          <>
            <section className="bg-white rounded-2xl border border-[#e7e3ef] px-6 sm:px-7 py-5">
              <SectionHeader title="Así funciona cada mes" icon={<CalendarDays className="w-4 h-4" />} />
              <ol className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {[
                  ['Planeación', 'Semana 1 · parrilla del mes'],
                  ['Aprobación del cliente', 'Semana 1 · 3 días'],
                  ['Producción y QA', 'Semanas 2 y 3'],
                  ['Publicación', 'Según calendario'],
                  ['Resultados', 'Semana 4 · reporte']
                ].map(([t, d], i) => (
                  <li key={t} className={`rounded-xl px-3 py-2.5 ${i === 1 ? 'bg-[#fffbeb]' : 'bg-[#f8f7fb]'}`}>
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] font-bold ${i === 1 ? 'bg-[#fef3c7] text-[#b45309]' : 'bg-white text-[#501f92]'}`}>{i + 1}</span>
                    <p className={`mt-1.5 font-semibold ${i === 1 ? 'text-[#92400e]' : 'text-[#0f172a]'}`}>{t}</p>
                    <p className="text-[12px] text-[#64748b]">{d}</p>
                  </li>
                ))}
              </ol>
            </section>
            {props.monthPlan && props.monthPlan.length > 0 && (
              <section className="bg-white rounded-2xl border border-[#e7e3ef] px-6 sm:px-7 py-5">
                <SectionHeader title="Lo que recibes cada mes" icon={<Inbox className="w-4 h-4" />} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {props.monthPlan.map((m) => (
                    <div key={m.phase}>
                      <p className="font-semibold text-[#0f172a]">{m.phase}</p>
                      <ul className="mt-1 text-[#475569] space-y-0.5 list-disc pl-4 marker:text-[#c4b5fd]">{m.items.map((it) => <li key={it}>{it}</li>)}</ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Lo que necesitamos del cliente ── */}
        {commitments.length > 0 && (
          <section className="bg-white rounded-2xl border border-[#fde68a] px-6 sm:px-7 py-5">
            <SectionHeader title="Lo que necesitamos de ti" icon={<Inbox className="w-4 h-4" />} meta="Si un insumo que bloquea llega tarde, la fase y la entrega se corren" />
            <ul className="space-y-2">
              {commitments.map((c) => (
                <li key={c.key} className="flex items-center justify-between gap-3 rounded-xl bg-[#fffdf5] border border-[#fef3c7] px-3.5 py-2.5 flex-wrap">
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-[#0f172a]">{c.title}</span>
                    <span className="flex items-center gap-1.5 mt-0.5 text-[12px] text-[#64748b]">
                      {c.phase && <span>Para {c.phase}</span>}
                      {c.blocking && <span className="px-1.5 py-0.5 rounded-md bg-[#fee2e2] text-[#b91c1c] text-[11px] font-semibold">Bloquea la fase</span>}
                    </span>
                  </span>
                  {editing
                    ? <input type="date" value={c.date} onChange={(e) => props.onChangeCommitmentDate(c.key, e.target.value)} className={inputCls} aria-label={`Fecha de ${c.title}`} />
                    : <span className="px-2.5 py-1 rounded-lg bg-[#fef3c7] text-[#92400e] text-[13px] font-semibold tabular-nums">{long(c.date)}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Acuerdos ── */}
        <section className="bg-white rounded-2xl border border-[#e7e3ef] px-6 sm:px-7 py-5">
          <SectionHeader title="Acuerdos" icon={<Handshake className="w-4 h-4" />} meta="Resumen del contrato (SOW); prevalece el contrato firmado" />
          <ol className="space-y-2">
            {props.agreements.map((a, i) => (
              <li key={`${i}-${a}`} className="flex items-start gap-3">
                <span className="w-5 h-5 mt-0.5 rounded-full bg-[#f5f3ff] text-[#501f92] text-[11px] font-bold inline-flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="flex-1 text-[13px] text-[#334155] leading-relaxed">{a}</span>
                {editing && (
                  <button type="button" onClick={() => props.onChangeAgreements(props.agreements.filter((_, j) => j !== i))} className="no-print p-0.5 text-[#94a3b8] hover:text-[#dc2626] cursor-pointer" aria-label="Quitar acuerdo">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ol>
          {editing && (
            <div className="no-print flex items-center gap-2 mt-3">
              <input value={newAgreement} onChange={(e) => setNewAgreement(e.target.value)} placeholder="Agregar un acuerdo…" className={`flex-1 ${inputCls}`}
                onKeyDown={(e) => { if (e.key === 'Enter' && newAgreement.trim()) { props.onChangeAgreements([...props.agreements, newAgreement.trim()]); setNewAgreement(''); } }} />
              <button type="button" disabled={!newAgreement.trim()} onClick={() => { props.onChangeAgreements([...props.agreements, newAgreement.trim()]); setNewAgreement(''); }} className="h-8 px-3 rounded-lg bg-[#501f92] text-white text-[13px] font-semibold disabled:opacity-40 cursor-pointer">Agregar</button>
            </div>
          )}
        </section>

        {/* ── Aprobación del cliente ── */}
        <section className={`rounded-2xl border px-6 sm:px-7 py-5 ${props.clientApproval ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'bg-white border-[#e7e3ef]'}`}>
          {props.clientApproval ? (
            <p className="flex items-center gap-2 text-[14px] text-[#166534] flex-wrap">
              <CircleCheck className="w-5 h-5" /> <span><strong>{props.clientApproval.name}</strong> aprobó el cronograma y los acuerdos el {long(props.clientApproval.date)}.</span>
              {canEdit && <button type="button" onClick={() => props.onClientApproval(null)} className="no-print text-[12px] text-[#64748b] hover:text-[#0f172a] underline cursor-pointer">Deshacer</button>}
            </p>
          ) : (
            <>
              <SectionHeader title="Aprobación del cliente" icon={<CircleCheck className="w-4 h-4" />} />
              {canEdit ? (
                <>
                  <p className="no-print text-[#64748b]">¿El cliente está de acuerdo? Si alguna fecha no le sirve, muévela con «Editar». Cuando apruebe, escribe su nombre y pulsa «Registrar aprobación».</p>
                  <p className="hidden print:block text-[#64748b]">Si alguna fecha no te funciona, avísanos y la ajustamos.</p>
                </>
              ) : (
                <p className="text-[#64748b]">Si alguna fecha no te funciona, avísanos y la ajustamos.</p>
              )}
              {canEdit && (
                <div className="no-print flex items-center gap-2 flex-wrap mt-3">
                  <input value={approverName} onChange={(e) => setApproverName(e.target.value)} placeholder={props.clientApprover || 'Nombre de quien aprueba'} className={`flex-1 min-w-[220px] ${inputCls}`} aria-label="Quien aprueba por el cliente" />
                  <button type="button" onClick={() => { const name = (approverName || props.clientApprover).trim(); if (name) props.onClientApproval({ name, date: new Date().toISOString().slice(0, 10) }); }} className="h-8 px-4 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-[13px] font-semibold cursor-pointer">Registrar aprobación</button>
                </div>
              )}
              <p className="hidden print:block pt-6">Aprobado por: ______________________ &nbsp;&nbsp; Fecha: ____________</p>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
