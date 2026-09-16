import React, { useState } from 'react';
import {
  Calendar,
  Gift,
  Award,
  Palmtree,
  AlertTriangle,
  Sparkles,
  Heart,
  X,
  Clock,
  Send,
  Users,
  CheckCircle2,
  CalendarDays,
  ShieldAlert,
  Copy,
  Check
} from 'lucide-react';
import { UserItem, TeamLifeEvent } from '../types';
import {
  processTeamLifeEvents,
  OperationalMilestone
} from './teamLifeEngine';

interface TeamLifeEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserItem[];
  currentUserName?: string;
}

export const TeamLifeEventsModal: React.FC<TeamLifeEventsModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUserName = 'Paola Monsalve'
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'vacations' | 'operational'>('today');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const result = processTeamLifeEvents(users);

  const handleCopyWish = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#e2e8f0] flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-[#501f92] to-[#6b21a8] text-white flex items-center justify-between shrink-0 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🦫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-[#d4ff4a] text-[#0f172a] px-2 py-0.5 rounded-full">
                  Bucky Copiloto
                </span>
                <span className="text-xs text-white/80 font-medium">Cultura & Operación</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Eventos & Recordatorios de Equipo
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-10"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-[#f8fafc] border-b border-[#e2e8f0] shrink-0">
          <div className="bg-white p-3 rounded-2xl border border-[#e2e8f0] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fdf2f8] text-[#db2777] flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-[#0f172a] leading-none">
                {result.copilotSummary.birthdaysToday}
              </div>
              <div className="text-[11px] font-medium text-[#64748b] mt-0.5">Cumpleaños hoy</div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#e2e8f0] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f5f3ff] text-[#7c3aed] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-[#0f172a] leading-none">
                {result.copilotSummary.anniversariesToday}
              </div>
              <div className="text-[11px] font-medium text-[#64748b] mt-0.5">Aniversarios hoy</div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#e2e8f0] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center shrink-0">
              <Palmtree className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-[#0f172a] leading-none">
                {result.copilotSummary.peopleOnVacation}
              </div>
              <div className="text-[11px] font-medium text-[#64748b] mt-0.5">En vacaciones</div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#e2e8f0] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-[#0f172a] leading-none">
                {result.operationalMilestones.length}
              </div>
              <div className="text-[11px] font-medium text-[#64748b] mt-0.5">Hitos operativos</div>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-[#e2e8f0] px-5 pt-2 bg-white shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'today'
                ? 'border-[#501f92] text-[#501f92]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Hoy en la Colonia ({result.todayEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'border-[#501f92] text-[#501f92]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Próximos Días ({result.upcomingEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vacations')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'vacations'
                ? 'border-[#501f92] text-[#501f92]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Palmtree className="w-4 h-4" />
            <span>Vacaciones & Ausencias ({result.activeAbsences.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('operational')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'operational'
                ? 'border-[#501f92] text-[#501f92]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Hitos & Bloqueos ({result.operationalMilestones.length})</span>
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: HOY */}
          {activeTab === 'today' && (
            <div className="space-y-4">
              {result.todayEvents.length === 0 ? (
                <div className="p-8 text-center bg-[#f8fafc] rounded-2xl border border-dashed border-[#cbd5e1]">
                  <div className="w-12 h-12 rounded-full bg-white text-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                    🦫
                  </div>
                  <h4 className="text-sm font-bold text-[#0f172a]">Todo tranquilo hoy en la colonia</h4>
                  <p className="text-xs text-[#64748b] mt-1 max-w-md mx-auto">
                    No hay cumpleaños ni aniversarios de ingreso para hoy. Puedes consultar los próximos días en la pestaña superior.
                  </p>
                </div>
              ) : (
                result.todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-5 rounded-2xl border border-[#e2e8f0] bg-linear-to-r from-white to-[#faf5ff] hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl ${event.userAvatarBg || 'bg-[#501f92]'} text-white flex items-center justify-center text-sm font-black shrink-0 shadow-xs`}>
                        {event.userInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            event.type === 'birthday'
                              ? 'bg-[#fdf2f8] text-[#be185d] border-[#fbcfe8]'
                              : 'bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]'
                          }`}>
                            {event.type === 'birthday' ? 'Cumpleaños Hoy 🎉' : 'Aniversario Uhura 🦫💜'}
                          </span>
                          <span className="text-[11px] text-[#64748b]">
                            {event.userRole}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0f172a] mt-1">
                          {event.headline}
                        </h4>
                        <p className="text-xs text-[#475569] mt-0.5 max-w-lg">
                          {event.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <button
                        onClick={() => handleCopyWish(
                          event.id,
                          event.type === 'birthday'
                            ? `¡Feliz cumpleaños ${event.userName}! 🎉🎂 Que tengas un día increíble de parte de toda la colonia Uhura.`
                            : `¡Feliz aniversario en Uhura ${event.userName}! 🦫💜 Gracias por estos ${event.yearsCount || 2} años de dedicación y talento.`
                        )}
                        className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] text-xs font-bold text-[#501f92] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        {copiedId === event.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#059669]" />
                            <span className="text-[#059669]">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar saludo Bucky</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PRÓXIMOS DÍAS */}
          {activeTab === 'upcoming' && (
            <div className="space-y-3">
              {result.upcomingEvents.length === 0 ? (
                <div className="p-8 text-center bg-[#f8fafc] rounded-2xl border border-dashed border-[#cbd5e1]">
                  <p className="text-xs text-[#64748b]">No hay eventos programados en los próximos 7 días.</p>
                </div>
              ) : (
                result.upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-2xl border border-[#e2e8f0] bg-white flex items-center justify-between gap-3 hover:border-[#cbd5e1] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${event.userAvatarBg || 'bg-[#501f92]'} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                        {event.userInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0f172a]">
                            {event.userName}
                          </span>
                          <span className="text-[10px] text-[#64748b]">
                            {event.userRole}
                          </span>
                        </div>
                        <div className="text-xs text-[#501f92] font-semibold mt-0.5">
                          {event.headline}
                        </div>
                        <div className="text-[11px] text-[#64748b]">
                          {event.message}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-[#501f92] bg-[#f5f3ff] px-2.5 py-1 rounded-lg border border-[#ddd6fe]">
                        En {event.daysRemaining} d
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: VACACIONES Y AUSENCIAS */}
          {activeTab === 'vacations' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-start gap-3">
                <Palmtree className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
                <div className="text-xs text-[#166534]">
                  <span className="font-bold">Protección Operativa de Bucky:</span> Si intentas asignar una tarea a un colaborador durante sus vacaciones aprobadas, Bucky te mostrará un recordatorio para evitar sobrecarga y asegurar el descanso.
                </div>
              </div>

              {result.activeAbsences.length === 0 ? (
                <div className="p-8 text-center bg-[#f8fafc] rounded-2xl border border-dashed border-[#cbd5e1]">
                  <p className="text-xs text-[#64748b]">Todo el equipo se encuentra actualmente activo sin ausencias.</p>
                </div>
              ) : (
                result.activeAbsences.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-2xl border border-[#e2e8f0] bg-white flex items-start justify-between gap-3 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl ${event.userAvatarBg || 'bg-[#10b981]'} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                        {event.userInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#0f172a]">
                            {event.userName}
                          </span>
                          <span className="text-[10px] font-bold bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] px-2 py-0.5 rounded-full">
                            Ausencia / Vacaciones
                          </span>
                        </div>
                        <div className="text-xs text-[#64748b] mt-0.5 font-medium">
                          {event.userRole}
                        </div>
                        <p className="text-xs text-[#475569] mt-1.5 max-w-md">
                          {event.message}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Regreso</div>
                      <div className="text-xs font-black text-[#059669] bg-[#ecfdf5] px-2.5 py-1 rounded-lg border border-[#a7f3d0] mt-0.5">
                        {event.returnDate || 'Pronto'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: HITOS OPERATIVOS */}
          {activeTab === 'operational' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#fff7ed] border border-[#ffedd5] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5" />
                <div className="text-xs text-[#9a3412]">
                  <span className="font-bold">Bloqueos & Congelamientos Operativos:</span> Fechas de corte institucional donde Bucky sincroniza alertas de no-despliegue o cierres contables mensuales.
                </div>
              </div>

              {result.operationalMilestones.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-[#e2e8f0] bg-white flex items-start justify-between gap-3 hover:border-[#cbd5e1] transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      m.impactLevel === 'critico'
                        ? 'bg-[#fef2f2] text-[#dc2626]'
                        : 'bg-[#fff7ed] text-[#ea580c]'
                    }`}>
                      {m.type === 'deployment_freeze' ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : (
                        <Calendar className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#0f172a]">
                          {m.title}
                        </span>
                        <span className="text-[10px] font-bold bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded">
                          {m.clientOrDepartment}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748b] mt-1 max-w-lg">
                        {m.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-[#0f172a] bg-[#f8fafc] px-3 py-1.5 rounded-xl border border-[#e2e8f0]">
                      {m.formattedDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#64748b] flex items-center gap-1.5">
            <span>🦫</span>
            <span>Bucky cuida a las personas de Uhura Group y vela por una operación saludable.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#501f92] hover:bg-[#3b156b] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
