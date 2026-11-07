import React, { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, AlertTriangle, PauseCircle, Clock, RefreshCw, UserPlus, EyeOff } from 'lucide-react';
import type { TeamAbsenceEvent, TeamAbsenceType, UserItem } from '../types';

/**
 * Google Calendar → Ausencias del equipo (vista de administración).
 *
 * Prototipo: todo es simulado. No hay credenciales, tokens ni URLs en el repositorio.
 * En producción Indunova conecta el calendario corporativo con una cuenta de servicio de
 * Google Workspace (solo lectura); esta tarjeta muestra el estado y resuelve excepciones.
 */

export type CalendarSyncStatus = 'active' | 'pending_access' | 'paused' | 'error';

export interface CalendarSyncState {
  calendarLabel: string;           // Nombre visible del calendario (no es una credencial)
  status: CalendarSyncStatus;
  lastSyncAt: string | null;
  lastSyncResult: 'ok' | 'error' | null;
  lastSyncError?: string;
  importedCount: number;
}

/** Evento del calendario que ECO no pudo asociar a una persona del equipo. */
export interface UnmatchedCalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  reason: string;
}

const STATUS: Record<CalendarSyncStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  active: { label: 'Conectado', cls: 'bg-[#ecfdf5] text-[#166534] border-[#bbf7d0]', icon: <CheckCircle2 className="w-3 h-3" /> },
  pending_access: { label: 'Pendiente de acceso', cls: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]', icon: <Clock className="w-3 h-3" /> },
  paused: { label: 'Pausado', cls: 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]', icon: <PauseCircle className="w-3 h-3" /> },
  error: { label: 'Error', cls: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]', icon: <AlertTriangle className="w-3 h-3" /> }
};

/** Reglas para leer el tipo de ausencia desde el título del evento. */
export const CALENDAR_TYPE_RULES: { keyword: string; type: TeamAbsenceType; label: string; hoursPerDay: number }[] = [
  { keyword: 'Vacaciones', type: 'vacation', label: 'Vacaciones', hoursPerDay: 8 },
  { keyword: 'Incapacidad', type: 'sick_leave', label: 'Incapacidad', hoursPerDay: 8 },
  { keyword: 'Permiso', type: 'personal_leave', label: 'Permiso', hoursPerDay: 8 },
  { keyword: 'Medio día', type: 'personal_leave', label: 'Permiso de medio día', hoursPerDay: 4 }
];

const resolveType = (title: string) => {
  const t = title.toLowerCase();
  const rules = [...CALENDAR_TYPE_RULES].sort((a, b) => b.keyword.length - a.keyword.length);
  return rules.find((r) => t.includes(r.keyword.toLowerCase())) || { type: 'other' as TeamAbsenceType, label: 'Otra ausencia', hoursPerDay: 8, keyword: '' };
};

const fmtDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
const fmtDateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

interface Props {
  state: CalendarSyncState;
  unmatched: UnmatchedCalendarEvent[];
  absenceEvents: TeamAbsenceEvent[];
  users: UserItem[];
  canManage: boolean;   // system_admin
  onChangeState: (next: CalendarSyncState) => void;
  onResolveUnmatched: (eventId: string, absence: TeamAbsenceEvent | null) => void; // null = ignorar
}

export const GoogleCalendarIntegrationCard: React.FC<Props> = ({
  state,
  unmatched,
  absenceEvents,
  users,
  canManage,
  onChangeState,
  onResolveUnmatched
}) => {
  const [testing, setTesting] = useState(false);
  const [assignTo, setAssignTo] = useState<Record<string, string>>({});
  const st = STATUS[state.status];

  const synced = useMemo(
    () =>
      absenceEvents
        .filter((e) => e.source === 'google_calendar' && e.status === 'active')
        .sort((a, b) => (a.startDate < b.startDate ? 1 : -1))
        .slice(0, 5),
    [absenceEvents]
  );
  const activeUsers = useMemo(() => users.filter((u) => u.status !== 'Inactive').sort((a, b) => a.name.localeCompare(b.name)), [users]);

  // Simulado: no se llama a Google. Verifica que la configuración esté completa.
  const handleTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      onChangeState({ ...state, status: 'active', lastSyncAt: new Date().toISOString(), lastSyncResult: 'ok', lastSyncError: undefined });
    }, 700);
  };

  const handleAssign = (ev: UnmatchedCalendarEvent) => {
    const user = users.find((u) => u.id === assignTo[ev.id]);
    if (!user) return;
    const rule = resolveType(ev.title);
    onResolveUnmatched(ev.id, {
      id: `abs-gcal-${ev.id}`,
      userId: user.id,
      userName: user.name,
      type: rule.type,
      title: ev.title,
      startDate: ev.startDate,
      endDate: ev.endDate,
      allDay: ev.allDay,
      impactHoursPerDay: rule.hoursPerDay,
      status: 'active',
      source: 'google_calendar',
      externalCalendarEventId: ev.id,
      lastSyncedAt: new Date().toISOString(),
      notes: 'Asociado manualmente desde Integraciones'
    });
  };

  return (
    <section className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-4 sm:p-5 space-y-4" aria-labelledby="gcal-title">
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#1d4ed8] flex items-center justify-center shrink-0">
            <CalendarDays className="w-4.5 h-4.5" />
          </span>
          <div className="min-w-0">
            <h3 id="gcal-title" className="text-sm font-bold text-[#0f172a] flex items-center gap-2 flex-wrap">
              Google Calendar · Ausencias del equipo
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.cls}`}>
                {st.icon}
                {st.label}
              </span>
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              Las vacaciones, incapacidades y permisos aprobados que Administrativa programa en el calendario corporativo bajan solos a ECO y descuentan disponibilidad en Capacidad y Mi Día. Solo lectura: ECO no escribe en el calendario.
            </p>
          </div>
        </div>
        {canManage && state.status !== 'pending_access' && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#0f172a] hover:bg-[#f8fafc] cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Probando…' : 'Probar conexión'}
            </button>
            <button
              type="button"
              onClick={() => onChangeState({ ...state, status: state.status === 'paused' ? 'active' : 'paused' })}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#475569] hover:bg-[#f1f5f9] cursor-pointer"
            >
              {state.status === 'paused' ? 'Reanudar' : 'Pausar'}
            </button>
          </div>
        )}
      </header>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
          <dt className="text-[#64748b]">Calendario</dt>
          <dd className="font-semibold text-[#0f172a] truncate">{state.calendarLabel}</dd>
        </div>
        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
          <dt className="text-[#64748b]">Última sincronización</dt>
          <dd className="font-semibold text-[#0f172a]">{fmtDateTime(state.lastSyncAt)}</dd>
        </div>
        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
          <dt className="text-[#64748b]">Ausencias importadas</dt>
          <dd className="font-semibold text-[#0f172a]">{state.importedCount}</dd>
        </div>
        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
          <dt className="text-[#64748b]">Por asociar</dt>
          <dd className={`font-semibold ${unmatched.length > 0 ? 'text-[#b45309]' : 'text-[#0f172a]'}`}>{unmatched.length}</dd>
        </div>
      </dl>

      {state.status === 'pending_access' && (
        <p className="text-xs p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-[#92400e]">
          Indunova debe indicar qué cuenta de servicio necesita leer el calendario; Uhura la comparte desde Google Workspace. Aquí no se pegan credenciales.
        </p>
      )}
      {state.status === 'error' && state.lastSyncError && (
        <p className="text-xs p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]">{state.lastSyncError}</p>
      )}

      {/* Excepciones: eventos sin persona asociada */}
      {unmatched.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#0f172a]">Eventos sin persona asociada</h4>
          <p className="text-[11px] text-[#64748b]">
            ECO asocia cada evento por el correo del invitado. Si no lo encuentra, indica a quién corresponde o ignóralo.
          </p>
          <ul className="space-y-2">
            {unmatched.map((ev) => {
              const rule = resolveType(ev.title);
              return (
                <li key={ev.id} className="p-3 rounded-xl border border-[#fde68a] bg-[#fffdf5] flex flex-col md:flex-row md:items-center gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0f172a] truncate">{ev.title}</p>
                    <p className="text-[#64748b]">
                      {fmtDate(ev.startDate)} – {fmtDate(ev.endDate)} · {rule.label} · {ev.reason}
                    </p>
                  </div>
                  {canManage ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="sr-only" htmlFor={`assign-${ev.id}`}>Persona del evento {ev.title}</label>
                      <select
                        id={`assign-${ev.id}`}
                        value={assignTo[ev.id] || ''}
                        onChange={(e) => setAssignTo({ ...assignTo, [ev.id]: e.target.value })}
                        className="px-2.5 py-1.5 rounded-lg border border-[#cbd5e1] bg-white text-xs max-w-[200px]"
                      >
                        <option value="">Elegir persona…</option>
                        {activeUsers.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!assignTo[ev.id]}
                        onClick={() => handleAssign(ev)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#501f92] text-white font-bold disabled:opacity-40 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Asociar
                      </button>
                      <button
                        type="button"
                        onClick={() => onResolveUnmatched(ev.id, null)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
                        title="No es una ausencia del equipo"
                      >
                        <EyeOff className="w-3.5 h-3.5" /> Ignorar
                      </button>
                    </div>
                  ) : (
                    <span className="text-[#94a3b8] shrink-0">Lo resuelve el administrador del sistema</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#0f172a]">Cómo se lee cada evento</h4>
          <ul className="text-[11px] text-[#475569] space-y-1">
            {CALENDAR_TYPE_RULES.map((r) => (
              <li key={r.keyword}>
                Título con <strong>«{r.keyword}»</strong> → {r.label} · descuenta {r.hoursPerDay} h/día
              </li>
            ))}
            <li>Otro título → «Otra ausencia» · 8 h/día</li>
            <li>Evento cancelado en el calendario → la ausencia se anula en ECO.</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#0f172a]">Últimas ausencias sincronizadas</h4>
          {synced.length === 0 ? (
            <p className="text-[11px] text-[#94a3b8]">Aún no hay ausencias importadas.</p>
          ) : (
            <ul className="space-y-1">
              {synced.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate text-[#0f172a]">{e.userName}</span>
                  <span className="text-[#64748b] shrink-0">{fmtDate(e.startDate)} – {fmtDate(e.endDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};
