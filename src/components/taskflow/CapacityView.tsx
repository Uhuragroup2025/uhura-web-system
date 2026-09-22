import React, { useState, useMemo } from 'react';
import {
  Clock,
  User,
  Users,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Filter,
  Play,
  Pause,
  ArrowUpRight,
  Briefcase,
  Layers,
  ArrowRight,
  Info,
  X,
  Plus,
  Flame,
  BatteryCharging,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { TaskItem, TimeLog, ActiveTimerState, UserItem, TeamAbsenceEvent } from './types';
import { initialUsers, initialAbsenceEvents } from './mockData';

export type CapacityTimeframe = 'today' | 'week' | 'month';
export type CapacityPerspective = 'personal' | 'team' | 'org';

interface CapacityViewProps {
  tasks: TaskItem[];
  timeLogs: TimeLog[];
  users?: UserItem[];
  absenceEvents?: TeamAbsenceEvent[];
  activeTimer?: ActiveTimerState | null;
  onStartTimer?: (task: TaskItem) => void;
  onPauseResumeTimer?: () => void;
  onStopTimer?: () => void;
  onOpenTaskDetail?: (task: TaskItem) => void;
  onOpenManualLog?: (taskId?: string) => void;
  onNavigateToTasks?: () => void;
  onNavigateToProjects?: () => void;
}

// Festivos Oficiales Colombia 2026 (Ley Emiliani)
const COLOMBIA_HOLIDAYS_2026: { date: string; name: string; month: number; day: number }[] = [
  { date: '2026-01-01', name: 'Año Nuevo', month: 1, day: 1 },
  { date: '2026-01-12', name: 'Reyes Magos', month: 1, day: 12 },
  { date: '2026-03-23', name: 'San José', month: 3, day: 23 },
  { date: '2026-04-02', name: 'Jueves Santo', month: 4, day: 2 },
  { date: '2026-04-03', name: 'Viernes Santo', month: 4, day: 3 },
  { date: '2026-05-01', name: 'Día del Trabajo', month: 5, day: 1 },
  { date: '2026-05-18', name: 'Ascensión del Señor', month: 5, day: 18 },
  { date: '2026-06-08', name: 'Corpus Christi', month: 6, day: 8 },
  { date: '2026-06-15', name: 'Sagrado Corazón', month: 6, day: 15 },
  { date: '2026-06-29', name: 'San Pedro y San Pablo', month: 6, day: 29 },
  { date: '2026-07-20', name: 'Día de la Independencia', month: 7, day: 20 },
  { date: '2026-08-07', name: 'Batalla de Boyacá', month: 8, day: 7 },
  { date: '2026-08-17', name: 'Asunción de la Virgen', month: 8, day: 17 },
  { date: '2026-10-12', name: 'Día de la Raza', month: 10, day: 12 },
  { date: '2026-11-02', name: 'Todos los Santos', month: 11, day: 2 },
  { date: '2026-11-16', name: 'Independencia de Cartagena', month: 11, day: 16 },
  { date: '2026-12-08', name: 'Inmaculada Concepción', month: 12, day: 8 },
  { date: '2026-12-25', name: 'Navidad', month: 12, day: 25 },
];

// Configuración de Capacidad Orbit:
// Fórmula canónica: availableCapacity = configuredAvailability - plannedLoad
// La disponibilidad semanal proviene de la disponibilidad configurada del usuario para el periodo.
// Puede haber colaboradores con dedicación completa, media jornada, permisos o vacaciones.
const DEFAULT_FALLBACK_WEEKLY_HOURS = 40.0;

export const CapacityView: React.FC<CapacityViewProps> = ({
  tasks,
  timeLogs,
  users,
  absenceEvents,
  activeTimer,
  onStartTimer,
  onPauseResumeTimer,
  onStopTimer,
  onOpenTaskDetail,
  onOpenManualLog,
  onNavigateToTasks,
  onNavigateToProjects
}) => {
  const [timeframe, setTimeframe] = useState<CapacityTimeframe>('week');
  const [perspective, setPerspective] = useState<CapacityPerspective>('personal');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedUserDetail, setSelectedUserDetail] = useState<string | null>(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(null);

  // Usuario actual en sesión
  const currentUserName = 'Paola (Lead PM)';
  const currentUserRole = 'Lead Project Manager';

  // Semana laboral simulada (Lunes 15 de Septiembre a Viernes 19 de Septiembre de 2026)
  const weekDays = [
    { dayName: 'Lunes', date: '15 Sep', fullDate: '2026-09-15', isHoliday: false, holidayName: '' },
    { dayName: 'Martes', date: '16 Sep', fullDate: '2026-09-16', isHoliday: false, holidayName: '' },
    { dayName: 'Miércoles', date: '17 Sep', fullDate: '2026-09-17', isHoliday: false, holidayName: '' },
    { dayName: 'Jueves', date: '18 Sep', fullDate: '2026-09-18', isHoliday: false, holidayName: '' },
    { dayName: 'Viernes', date: '19 Sep', fullDate: '2026-09-19', isHoliday: false, holidayName: '' },
  ];

  // Helper para calcular disponibilidad de un usuario según periodo
  const getUserConfiguredCapacity = (configuredWeeklyHours: number, period: CapacityTimeframe) => {
    const dailyBase = configuredWeeklyHours / 5;
    if (period === 'today') {
      return Number(dailyBase.toFixed(1));
    }
    if (period === 'week') {
      const holidayCountInWeek = weekDays.filter(d => d.isHoliday).length;
      return Number((configuredWeeklyHours - (holidayCountInWeek * dailyBase)).toFixed(1));
    }
    // Mes (aprox. 4.2 semanas laborables)
    return Number((configuredWeeklyHours * 4.2).toFixed(1));
  };

  // Disponibilidad configurada para el usuario actual (Paola: 40h semanales configuradas)
  const myConfiguredWeeklyHours = 40.0;
  const periodLegalCapacity = getUserConfiguredCapacity(myConfiguredWeeklyHours, timeframe);
  const myDailyCapacity = Number((myConfiguredWeeklyHours / 5).toFixed(1));

  // Datos calculados para el usuario actual (Paola / Personal)
  const myTasks = useMemo(() => {
    return tasks.filter(t => 
      t.assignee?.name?.toLowerCase().includes('paola') ||
      t.collaborators?.some(c => c.name?.toLowerCase().includes('paola'))
    );
  }, [tasks]);

  const myTimeLogs = useMemo(() => {
    return timeLogs.filter(l => 
      l.userName?.toLowerCase().includes('paola') || 
      l.userInitials === 'PL'
    );
  }, [timeLogs]);

  // Horas asignadas (presupuestadas de tareas activas/pendientes)
  const myAssignedHours = useMemo(() => {
    return myTasks.reduce((acc, t) => acc + (t.budgetedHours || 0), 0);
  }, [myTasks]);

  // Horas ejecutadas (horas reales consumidas/trackeadas)
  const myExecutedHours = useMemo(() => {
    const fromLogs = myTimeLogs.reduce((acc, l) => acc + (l.durationSeconds / 3600), 0);
    const fromTasks = myTasks.reduce((acc, t) => acc + (t.consumedSeconds / 3600), 0);
    return Math.max(fromLogs, fromTasks, 31.5); // 31.5h ejecutadas esta semana
  }, [myTimeLogs, myTasks]);

  // Ajuste según timeframe
  const myCurrentExecuted = useMemo(() => {
    if (timeframe === 'today') return 3.5;
    if (timeframe === 'week') return myExecutedHours;
    return 142.0; // Mes
  }, [timeframe, myExecutedHours]);

  const myCurrentAssigned = useMemo(() => {
    if (timeframe === 'today') return 7.5;
    if (timeframe === 'week') return Math.max(myAssignedHours, 38.0);
    return 168.0; // Mes
  }, [timeframe, myAssignedHours]);

  // Cálculos de salud de capacidad
  const myUtilizationPercent = Math.round((myCurrentAssigned / periodLegalCapacity) * 100);
  const myExecutedPercent = Math.round((myCurrentExecuted / periodLegalCapacity) * 100);
  const myAvailableHours = Number((periodLegalCapacity - myCurrentAssigned).toFixed(1));
  const isOverloaded = myCurrentAssigned > periodLegalCapacity;
  const isOptimal = myUtilizationPercent >= 70 && myUtilizationPercent <= 100;

  // Helper para asignar departamento organizacional según rol o especialidad
  const resolveUserDept = (u: UserItem): string => {
    const role = (u.officialRole || u.jobTitle || '').toLowerCase();
    const name = u.name.toLowerCase();
    if (role.includes('ceo') || name.includes('ana maría')) return 'C-Level';
    if (role.includes('web') || role.includes('front-end') || role.includes('product') || role.includes('trafficker media') || name.includes('oscar') || name.includes('laura isabel') || name.includes('simón')) return 'Área Producto';
    if (role.includes('creative') || role.includes('community') || role.includes('content') || name.includes('diego') || name.includes('sara') || name.includes('camilo torres') || name.includes('melisa') || name.includes('alejandro') || name.includes('esmeralda')) return 'Área Creatividad';
    if (role.includes('growth') || name.includes('camilo vélez') || name.includes('nayeliz') || name.includes('sebastian')) return 'Área Growth';
    if (role.includes('comercial') || role.includes('client relationship') || name.includes('catalina') || name.includes('luisa')) return 'Área Comercial';
    if (role.includes('administra') || name.includes('salazar')) return 'Área Administrativa';
    return 'Área Producto';
  };

  // Distribución del equipo completo conectado con UserItem y TeamAbsenceEvent (Google Calendar / Orbit)
  const teamMembersData = useMemo(() => {
    const effectiveUsers = users && users.length > 0 ? users : initialUsers;
    const effectiveAbsences = absenceEvents && absenceEvents.length > 0 ? absenceEvents : initialAbsenceEvents;

    return effectiveUsers.map(user => {
      const dept = resolveUserDept(user);
      const memberWeeklyHours = user.capacityHours || DEFAULT_FALLBACK_WEEKLY_HOURS;
      const baseCap = getUserConfiguredCapacity(memberWeeklyHours, timeframe);

      // Calcular deducción por ausencias estructuradas (vacaciones, licencias)
      // Regla canónica Orbit: Por cada día hábil de ausencia: availableCapacity -= impactHoursPerDay (excluyendo fines de semana y festivos)
      let absenceDeduction = 0;
      let activeAbsence: TeamAbsenceEvent | undefined;

      const userAbsences = effectiveAbsences.filter(
        a => a.userId === user.id && a.status === 'active'
      );

      userAbsences.forEach(abs => {
        const dailyImpact = abs.impactHoursPerDay || (memberWeeklyHours / 5);

        if (timeframe === 'today') {
          const todayIso = '2026-09-16'; // Fecha simulada de trabajo (Miércoles)
          const isHoliday = COLOMBIA_HOLIDAYS_2026.some(h => h.date === todayIso);
          if (!isHoliday && todayIso >= abs.startDate && todayIso <= abs.endDate) {
            absenceDeduction += dailyImpact;
            activeAbsence = abs;
          }
        } else if (timeframe === 'week') {
          weekDays.forEach(day => {
            // Regla: No contar fines de semana (weekDays solo tiene L-V) ni festivos
            if (!day.isHoliday) {
              if (day.fullDate >= abs.startDate && day.fullDate <= abs.endDate) {
                absenceDeduction += dailyImpact;
                activeAbsence = abs;
              }
            }
          });
        } else if (timeframe === 'month') {
          // Mes: usar impacto en días hábiles (businessDaysImpact o cálculo)
          const businessDays = abs.businessDaysImpact || 5;
          absenceDeduction += businessDays * dailyImpact;
          activeAbsence = abs;
        }
      });

      // Compatibilidad con vacationStatus preexistente en perfil
      if (absenceDeduction === 0 && user.vacationStatus?.onVacation) {
        absenceDeduction = baseCap;
      }

      // Capacidad neta disponible tras deducir ausencias
      const netCapacity = Math.max(0, Number((baseCap - absenceDeduction).toFixed(1)));

      // Carga planificada/asignada desde tareas o baseline calibrado
      const userTasks = tasks.filter(t => 
        t.assignee?.id === user.id ||
        t.assignee?.name?.toLowerCase().includes(user.name.toLowerCase()) ||
        t.collaborators?.some(c => c.name?.toLowerCase().includes(user.name.toLowerCase()))
      );
      const tasksBudgeted = userTasks.reduce((sum, t) => sum + (t.budgetedHours || t.estimatedHours || 0), 0);

      let assigned = tasksBudgeted > 0 
        ? tasksBudgeted 
        : Number(((memberWeeklyHours * (user.utilizedPercent || 80)) / 100).toFixed(1));
      let executed = Number((assigned * 0.85).toFixed(1));

      // Si está en período de vacaciones completo, su carga planificada activa es 0h
      if (netCapacity === 0 && absenceDeduction > 0) {
        assigned = 0;
        executed = 0;
      }

      if (timeframe === 'today') {
        assigned = Number((assigned / 5).toFixed(1));
        executed = Number((executed / 5).toFixed(1));
      } else if (timeframe === 'month') {
        assigned = Number((assigned * 4.2).toFixed(1));
        executed = Number((executed * 4.2).toFixed(1));
      }

      const utilPercent = netCapacity > 0 ? Math.round((assigned / netCapacity) * 100) : 0;
      const diffHours = Number((netCapacity - assigned).toFixed(1));

      // Estado de capacidad
      let status: 'optimal' | 'available' | 'overloaded' | 'tight' = 'optimal';
      if (netCapacity === 0 && absenceDeduction > 0) {
        status = 'available'; // En descanso aprobado
      } else if (assigned > netCapacity) {
        status = 'overloaded';
      } else if (assigned < netCapacity * 0.75) {
        status = 'available';
      } else {
        status = 'optimal';
      }

      return {
        id: user.id,
        name: user.name,
        role: user.jobTitle || user.officialRole || 'Equipo Uhura',
        initials: user.initials,
        avatarBg: user.avatarBg,
        dept,
        weeklyHours: memberWeeklyHours,
        assigned,
        executed,
        capacity: netCapacity,
        configuredWeeklyHours: memberWeeklyHours,
        absenceDeduction: Number(absenceDeduction.toFixed(1)),
        activeAbsence,
        utilPercent,
        diffHours,
        status
      };
    });
  }, [users, absenceEvents, tasks, timeframe]);

  // Filtrado de equipo por departamento
  const filteredTeam = useMemo(() => {
    if (selectedDepartment === 'all') return teamMembersData;
    return teamMembersData.filter(m => m.dept === selectedDepartment);
  }, [teamMembersData, selectedDepartment]);

  // Resumen Organizacional
  const orgSummary = useMemo(() => {
    const totalMembers = teamMembersData.length;
    const totalCapacity = Number((totalMembers * periodLegalCapacity).toFixed(0));
    const totalAssigned = Number(teamMembersData.reduce((acc, m) => acc + m.assigned, 0).toFixed(0));
    const totalExecuted = Number(teamMembersData.reduce((acc, m) => acc + m.executed, 0).toFixed(0));
    const totalAvailable = Number((totalCapacity - totalAssigned).toFixed(0));
    const avgUtilization = Math.round((totalAssigned / totalCapacity) * 100);
    const overloadedCount = teamMembersData.filter(m => m.status === 'overloaded').length;
    const availableCount = teamMembersData.filter(m => m.status === 'available').length;
    const optimalCount = teamMembersData.filter(m => m.status === 'optimal').length;

    return {
      totalMembers,
      totalCapacity,
      totalAssigned,
      totalExecuted,
      totalAvailable,
      avgUtilization,
      overloadedCount,
      availableCount,
      optimalCount
    };
  }, [teamMembersData, periodLegalCapacity]);

  // Desglose por proyecto / concentración de carga personal
  const projectConcentration = useMemo(() => {
    return [
      { name: 'Campaña Navidad 2026 (Danone)', client: 'Danone S.A.', hours: 14.5, type: 'Fee', color: '#501f92' },
      { name: 'Campaña Navidad Yamaha', client: 'INCOLMOTOS YAMAHA S.A.', hours: 11.0, type: 'Proyecto', color: '#8a4dff' },
      { name: 'Fee Mantenimiento Web Prisma', client: 'Prisma Kiddos', hours: 7.5, type: 'Fee', color: '#0284c7' },
      { name: 'Innovación & Orbit OS Labs', client: 'Uhura Interno', hours: 5.0, type: 'Interno', color: '#64748b' },
    ];
  }, []);

  // Detalle del usuario seleccionado en drawer
  const selectedMemberObj = useMemo(() => {
    if (!selectedUserDetail) return null;
    return teamMembersData.find(m => m.id === selectedUserDetail);
  }, [selectedUserDetail, teamMembersData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Superior de Control de Capacidad */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Izquierda: Selector de Perspectiva (Mi Capacidad vs Equipo vs Organización) */}
        <div className="flex items-center overflow-x-auto pb-1 md:pb-0 scrollbar-none w-full md:w-auto">
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl text-xs font-bold shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setPerspective('personal')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                perspective === 'personal'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Mi Capacidad</span>
            </button>
            <button
              onClick={() => setPerspective('team')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                perspective === 'team'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Mi Equipo (PM / Lead)</span>
              <span className="sm:hidden">Equipo</span>
            </button>
            <button
              onClick={() => setPerspective('org')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                perspective === 'org'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Organización</span>
              <span className="sm:hidden">Org</span>
            </button>
          </div>
        </div>

        {/* Derecha: Selector de Temporalidad (Hoy · Semana · Mes) + Badge Legal */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap justify-between md:justify-end w-full md:w-auto">
          {/* Timeframe Tabs */}
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl text-xs font-bold shrink-0">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'today' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'week' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Semana (L-V)
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'month' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Mes
            </button>
          </div>

          {/* Disponibilidad Pactada L-V */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[11px] font-medium text-[#475569] shrink-0"
            title="Capacidad configurada de lunes a viernes. Fines de semana no computan como cuota esperada ni horas pendientes."
          >
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="hidden sm:inline">Disponibilidad base: <strong>L-V</strong></span>
            <span className="sm:hidden"><strong>Base L-V</strong></span>
            <span className="text-[10px] text-[#059669] bg-[#ecfdf5] px-1.5 py-0.5 rounded border border-[#a7f3d0]">Sin cuota 8h universal</span>
          </div>
        </div>
      </div>

      {/* 2. KPIs Esenciales de Capacidad (3 Tarjetas Clave sin Ruido) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Balance de Capacidad */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
              {perspective === 'personal' ? 'Mi Balance de Horas' : perspective === 'team' ? 'Horas Totales del Equipo' : 'Capacidad Global Orbit'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#f2ecfb] text-[#501f92] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-[#0f172a] font-mono">
                {perspective === 'personal' ? myCurrentAssigned.toFixed(1) : perspective === 'team' ? orgSummary.totalAssigned : orgSummary.totalAssigned}h
              </span>
              <span className="text-xs text-[#64748b] font-medium">
                asignadas de <strong className="text-[#0f172a] font-mono">{perspective === 'personal' ? periodLegalCapacity.toFixed(1) : (perspective === 'team' ? (teamMembersData.length * periodLegalCapacity).toFixed(0) : orgSummary.totalCapacity)}h</strong> disponibles
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              <strong className="text-[#501f92] font-mono">{perspective === 'personal' ? myCurrentExecuted.toFixed(1) : orgSummary.totalExecuted}h</strong> ya ejecutadas/cargadas ({perspective === 'personal' ? myExecutedPercent : Math.round((orgSummary.totalExecuted / orgSummary.totalCapacity) * 100)}%)
            </p>
          </div>

          {/* Barra Termométrica Doble Segmento */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full bg-[#f1f5f9] rounded-full overflow-hidden flex relative">
              {/* Segmento 1: Ejecutado (Morado Sólido) */}
              <div
                style={{ width: `${Math.min(100, perspective === 'personal' ? myExecutedPercent : Math.round((orgSummary.totalExecuted / orgSummary.totalCapacity) * 100))}%` }}
                className="bg-[#501f92] h-full transition-all duration-300 relative"
                title={`Ejecutado: ${perspective === 'personal' ? myCurrentExecuted : orgSummary.totalExecuted}h`}
              />
              {/* Segmento 2: Asignado Pendiente (Lila) */}
              <div
                style={{
                  width: `${Math.max(0, Math.min(100 - (perspective === 'personal' ? myExecutedPercent : Math.round((orgSummary.totalExecuted / orgSummary.totalCapacity) * 100)), (perspective === 'personal' ? myUtilizationPercent - myExecutedPercent : orgSummary.avgUtilization - Math.round((orgSummary.totalExecuted / orgSummary.totalCapacity) * 100))))}%`
                }}
                className="bg-[#c9b7ff] h-full transition-all duration-300"
                title="Asignado pendiente por ejecutar"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#64748b]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#501f92]" /> Ejecutado
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#c9b7ff]" /> Pendiente
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#e2e8f0]" /> Libre
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Disponibilidad Neta / Sobrecarga */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
              {perspective === 'personal' ? 'Disponibilidad Neta' : 'Estado de Carga del Equipo'}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              (perspective === 'personal' ? isOverloaded : orgSummary.overloadedCount > 0)
                ? 'bg-[#fef2f2] text-[#dc2626]'
                : 'bg-[#ecfdf5] text-[#10b981]'
            }`}>
              {(perspective === 'personal' ? isOverloaded : orgSummary.overloadedCount > 0) ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <BatteryCharging className="w-4 h-4" />
              )}
            </div>
          </div>

          <div>
            {perspective === 'personal' ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-extrabold font-mono ${
                    isOverloaded ? 'text-[#dc2626]' : 'text-[#10b981]'
                  }`}>
                    {myAvailableHours > 0 ? `+${myAvailableHours}h` : `${myAvailableHours}h`}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#334155]">
                    {myUtilizationPercent}% utilización
                  </span>
                </div>
                <p className="text-xs text-[#64748b] mt-1">
                  {isOverloaded
                    ? `Sobrecarga de ${Math.abs(myAvailableHours)}h sobre el límite legal de ${periodLegalCapacity}h.`
                    : isOptimal
                    ? `Carga balanceada. Cuentas con ${myAvailableHours}h para nuevas tareas o imprevistos.`
                    : `Carga liviana. Tienes ${myAvailableHours}h de disponibilidad en el periodo.`}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#0f172a] font-mono">
                    {orgSummary.avgUtilization}%
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                    Capacidad General Saludable
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="text-[#dc2626] font-bold">⚠️ {orgSummary.overloadedCount} sobrecargados</span>
                  <span className="text-[#64748b]">·</span>
                  <span className="text-[#059669] font-semibold">{orgSummary.availableCount} con disponibilidad</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KPI 3: Ritmo de Avance (Pacing) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Ritmo de Avance (Pacing)</span>
            <div className="w-8 h-8 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#0f172a]">En Ritmo</span>
              <span className="text-xs text-[#059669] font-bold bg-[#ecfdf5] px-2 py-0.5 rounded-md border border-[#a7f3d0]">
                +4% vs esperado
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
              Semana transcurrida al <strong>60%</strong> (Miércoles). Carga planificada ejecutada en balance saludable.
            </p>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-[#475569] border-t border-[#f1f5f9]">
            <span>Disponibilidad base: <strong>40.0h (L-V)</strong></span>
            <span className="text-[#501f92] font-semibold">Carga asignada: {myCurrentAssigned.toFixed(1)}h</span>
          </div>
        </div>
      </div>

      {/* 3. VISTA SEGÚN PERSPECTIVA SELECCIONADA */}

      {/* PERSPECTIVA A: MI CAPACIDAD (VISTA INDIVIDUAL COLABORADOR) */}
      {perspective === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda / Central: Matriz de la Semana (Lunes a Viernes) */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">Distribución de Carga Semanal</h3>
                <p className="text-xs text-[#64748b]">Disponibilidad configurada de {myDailyCapacity}h/día ({myConfiguredWeeklyHours}h/semana) · Lunes a Viernes</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[#334155]">
                Semana 24 - 28 Ago 2026
              </span>
            </div>

            {/* 5 Columnas de Días */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {weekDays.map((day, idx) => {
                const dayAssigned = [5.5, 6.5, 4.5, 5.0, 4.0][idx];
                const dayExecuted = [5.5, 3.5, 0, 0, 0][idx];
                const isOver = dayAssigned > myDailyCapacity;
                const freeHours = Number((myDailyCapacity - dayAssigned).toFixed(1));
                const isToday = idx === 1; // Martes

                const dayBarColor = isOver
                  ? 'bg-[#dc2626]'
                  : isToday
                  ? 'bg-[#8a4dff]'
                  : 'bg-[#10b981]';

                return (
                  <div
                    key={day.fullDate}
                    onClick={() => setSelectedDayDetail(day.dayName)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isToday
                        ? 'bg-[#fcfaff] border-[#8a4dff] shadow-xs ring-1 ring-[#8a4dff]/20'
                        : isOver
                        ? 'bg-[#fffbfa] border-[#fecdd3]'
                        : 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#0f172a]">{day.dayName}</span>
                      {isToday && (
                        <span className="w-2 h-2 rounded-full bg-[#8a4dff] animate-pulse" title="Hoy" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748b] mb-2">{day.date}</p>

                    {/* Barra del Día */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-[#64748b]">Plan:</span>
                        <span className={`font-bold ${isOver ? 'text-[#dc2626]' : 'text-[#0f172a]'}`}>
                          {dayAssigned}h
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, (dayAssigned / myDailyCapacity) * 100)}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${dayBarColor}`}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-[#64748b] pt-0.5">
                        <span>{dayExecuted > 0 ? `Hecho: ${dayExecuted}h` : 'Pendiente'}</span>
                        <span className={isOver ? 'text-[#dc2626] font-semibold' : 'text-[#059669]'}>
                          {isOver ? `+${(dayAssigned - myDailyCapacity).toFixed(1)}h` : `+${freeHours}h libre`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tareas que componen mi carga en el periodo */}
            <div className="pt-3 border-t border-[#f1f5f9] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                  Mis Tareas Activas en este Periodo ({myTasks.length})
                </h4>
                {onNavigateToTasks && (
                  <button
                    onClick={onNavigateToTasks}
                    className="text-xs font-bold text-[#501f92] hover:text-[#381566] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ir a Mis Tareas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {myTasks.slice(0, 4).map((task) => {
                  const isTimerActive = activeTimer?.taskId === task.id && !activeTimer.isPaused;
                  return (
                    <div
                      key={task.id}
                      onClick={() => onOpenTaskDetail && onOpenTaskDetail(task)}
                      className="p-3 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-between gap-3 transition-colors cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold text-[#501f92] bg-[#f2ecfb] px-1.5 py-0.5 rounded">
                            {task.clientName || 'Cliente'}
                          </span>
                          <span className="text-xs font-semibold text-[#0f172a] truncate">
                            {task.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748b] truncate">{task.projectName}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right font-mono text-xs">
                          <span className="font-bold text-[#0f172a]">
                            {(task.consumedSeconds / 3600).toFixed(1)}h
                          </span>
                          <span className="text-[#94a3b8]"> / {task.budgetedHours}h</span>
                        </div>

                        {onStartTimer && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isTimerActive && onPauseResumeTimer) {
                                onPauseResumeTimer();
                              } else {
                                onStartTimer(task);
                              }
                            }}
                            className={`p-1.5 rounded-lg text-white transition-all cursor-pointer ${
                              isTimerActive ? 'bg-[#ef4444]' : 'bg-[#501f92] hover:bg-[#381566]'
                            }`}
                            title={isTimerActive ? 'Pausar Timer' : 'Iniciar Timer'}
                          >
                            {isTimerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Concentración de Carga por Proyecto y Clientes */}
          <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
            <div className="pb-3 border-b border-[#f1f5f9]">
              <h3 className="text-sm font-bold text-[#0f172a]">Concentración de Horas</h3>
              <p className="text-xs text-[#64748b]">¿En qué proyectos se concentra mi tiempo?</p>
            </div>

            <div className="space-y-3">
              {projectConcentration.map((item) => {
                const percent = Math.round((item.hours / myCurrentAssigned) * 100);
                return (
                  <div key={item.name} className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0f172a] truncate max-w-[170px]" title={item.name}>
                        {item.name}
                      </span>
                      <span className="font-mono font-bold text-[#501f92]">{item.hours}h ({percent}%)</span>
                    </div>

                    <div className="h-1.5 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                        className="h-full rounded-full"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#64748b]">
                      <span>{item.client}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white border border-[#e2e8f0] font-semibold">
                        {item.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Nota de Próximo Festivo */}
            <div className="p-3 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] text-xs text-[#1e40af] space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Próximo Festivo Oficial Colombia
              </p>
              <p className="text-[11px] text-[#3b82f6]">
                <strong>Lunes 12 de Octubre</strong> (Día de la Raza) · Esa semana tendrá 33.6h de capacidad legal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PERSPECTIVA B: MI EQUIPO (LÍDER PM / MONITOREO Y BALANCE DE CARGAS) */}
      {(perspective === 'team' || perspective === 'org') && (
        <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">
                {perspective === 'team' ? 'Monitoreo de Capacidad del Equipo' : 'Mapa General de Capacidad de la Organización'}
              </h3>
              <p className="text-xs text-[#64748b]">
                {perspective === 'team'
                  ? 'Detecta sobrecargas y balancea asignaciones entre colaboradores'
                  : 'Visión agregada de talento por especialidades y áreas'}
              </p>
            </div>

            {/* Filtro por Especialidad/Área */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#64748b]" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#501f92]"
              >
                <option value="all">Todas las áreas ({teamMembersData.length})</option>
                <option value="Área Creatividad">Área Creatividad (7)</option>
                <option value="Área Producto">Área Producto (5)</option>
                <option value="Área Growth">Área Growth (3)</option>
                <option value="Área Comercial">Área Comercial (2)</option>
                <option value="Área Administrativa">Área Administrativa (1)</option>
                <option value="C-Level">C-Level / Dirección (1)</option>
              </select>
            </div>
          </div>

          {/* Grid / Lista de Miembros con Barras de Capacidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-3.5">
            {filteredTeam.map((member) => {
              const isOver = member.status === 'overloaded';
              const isAvailable = member.status === 'available';

              const barColor = isOver
                ? 'bg-[#dc2626]'
                : isAvailable
                ? 'bg-[#3b82f6]' // Azul capacidad disponible
                : 'bg-[#10b981]'; // Verde equilibrado

              const isAbsent = member.absenceDeduction > 0 && member.capacity === 0;

              const statusBadgeBg = isAbsent
                ? 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
                : isOver
                ? 'bg-[#fee2e2] text-[#b91c1c] border-[#fca5a5]'
                : isAvailable
                ? 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'
                : 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]';

              const statusLabel = isAbsent
                ? (member.activeAbsence?.type === 'vacation' ? '🌴 En Vacaciones' : 'Ausencia Aprobada')
                : isOver
                ? `⚠️ Sobreasignado (+${Math.abs(member.diffHours)}h)`
                : isAvailable
                ? `+${member.diffHours}h disponibles`
                : `Equilibrado (${member.assigned}h)`;

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedUserDetail(member.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${
                    isAbsent
                      ? 'bg-[#fffdf7] border-[#fef3c7] hover:border-[#fde68a]'
                      : isOver
                      ? 'bg-[#fffbfa] border-[#fecdd3] hover:border-[#fda4af]'
                      : isAvailable
                      ? 'bg-[#fcfdff] border-[#e2e8f0] hover:border-[#bfdbfe]'
                      : 'bg-white border-[#e2e8f0] hover:border-[#a7f3d0]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${member.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                        {member.initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-[#0f172a] truncate">{member.name}</h4>
                        <p className="text-xs text-[#64748b] truncate">{member.role}</p>
                      </div>
                    </div>

                    {/* Chip de Estado */}
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 border ${statusBadgeBg}`}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Banner de Ausencia Estructurada (Google Calendar / Orbit) */}
                  {member.absenceDeduction > 0 && (
                    <div className="mt-2.5 flex items-center justify-between text-[11px] px-2.5 py-1 rounded-lg bg-[#fffbeb] border border-[#fef3c7] text-[#92400e]">
                      <span className="flex items-center gap-1.5 font-medium truncate">
                        <Calendar className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                        {member.activeAbsence?.title || 'Ausencia'} (-{member.absenceDeduction}h)
                      </span>
                      {member.activeAbsence?.source === 'google_calendar' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#fde68a] font-semibold text-[#b45309] shrink-0">
                          Google Calendar
                        </span>
                      )}
                    </div>
                  )}

                  {/* Barra de Capacidad del Colaborador */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#64748b]">
                        Asignado: <strong className="text-[#0f172a]">{member.assigned}h</strong> / {member.capacity}h
                      </span>
                      <span className={`font-bold ${
                        isOver ? 'text-[#dc2626]' : isAvailable ? 'text-[#1d4ed8]' : 'text-[#059669]'
                      }`}>
                        {member.utilPercent}%
                      </span>
                    </div>

                    {/* Barra de Progreso de Capacidad con Reglas Semafóricas */}
                    <div className="h-2 w-full bg-[#f1f5f9] rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${Math.min(100, member.utilPercent)}%` }}
                        className={`h-full transition-all duration-300 ${barColor}`}
                        title={`Utilización: ${member.utilPercent}% (${member.assigned}h / ${member.capacity}h)`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#64748b] pt-0.5">
                      <span>Ejecutado: <strong>{member.executed}h</strong> · Disp: <strong>{member.diffHours > 0 ? `+${member.diffHours}h` : `${member.diffHours}h`}</strong></span>
                      <span className="text-[#501f92] font-medium hover:underline">Ver tareas →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DRAWER LATERAL DE DETALLE (SLIDE-OVER AL HACER CLIC EN UN COLABORADOR) */}
      {selectedMemberObj && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200">
            {/* Header del Drawer */}
            <div className="flex items-start justify-between pb-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl ${selectedMemberObj.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                  {selectedMemberObj.initials}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0f172a]">{selectedMemberObj.name}</h3>
                  <p className="text-xs text-[#64748b]">{selectedMemberObj.role} · {selectedMemberObj.dept}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Banner de Ausencia en Drawer */}
            {selectedMemberObj.absenceDeduction > 0 && (
              <div className="p-3 bg-[#fffbeb] border border-[#fde68a] rounded-xl text-xs text-[#92400e] flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#d97706] mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-bold text-[#78350f]">
                    {selectedMemberObj.activeAbsence?.title || 'Ausencia Aprobada'} (-{selectedMemberObj.absenceDeduction}h)
                  </p>
                  <p className="text-[11px] text-[#92400e]">
                    Período: {selectedMemberObj.activeAbsence?.startDate} al {selectedMemberObj.activeAbsence?.endDate}
                    {selectedMemberObj.activeAbsence?.source === 'google_calendar' && ' · Sincronizado vía Google Calendar'}
                  </p>
                </div>
              </div>
            )}

            {/* Resumen Numérico */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                <p className="text-[10px] text-[#64748b] uppercase font-bold">Disponibilidad Configurada</p>
                <p className="text-base font-extrabold font-mono text-[#0f172a]">{selectedMemberObj.capacity}h</p>
                <p className="text-[9px] text-[#64748b] mt-0.5">({selectedMemberObj.configuredWeeklyHours}h/sem)</p>
              </div>
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                <p className="text-[10px] text-[#64748b] uppercase font-bold">Asignado</p>
                <p className="text-base font-extrabold font-mono text-[#501f92]">{selectedMemberObj.assigned}h</p>
              </div>
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                <p className="text-[10px] text-[#64748b] uppercase font-bold">Ejecutado</p>
                <p className="text-base font-extrabold font-mono text-[#059669]">{selectedMemberObj.executed}h</p>
              </div>
            </div>

            {/* Tareas Asignadas a este Colaborador */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                  Tareas Asignadas ({tasks.filter(t => t.assignee?.name === selectedMemberObj.name).length || 3})
                </h4>
                <span className="text-[11px] text-[#501f92] font-semibold">Semana en curso</span>
              </div>

              <div className="space-y-2">
                {tasks
                  .filter(t => t.assignee?.name === selectedMemberObj.name || t.assignee?.initials === selectedMemberObj.initials)
                  .concat(tasks.slice(0, 2))
                  .slice(0, 4)
                  .map((task, idx) => (
                    <div
                      key={`${task.id}-${idx}`}
                      onClick={() => {
                        setSelectedUserDetail(null);
                        onOpenTaskDetail && onOpenTaskDetail(task);
                      }}
                      className="p-3 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] space-y-1.5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#0f172a] truncate">{task.title}</span>
                        <span className="font-mono text-[11px] font-bold text-[#501f92]">{task.budgetedHours}h</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#64748b]">
                        <span>{task.projectName}</span>
                        <span className="px-1.5 py-0.5 rounded bg-white border border-[#e2e8f0] font-medium">
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Acción de Balanceo Rápido */}
            <div className="pt-3 border-t border-[#e2e8f0] space-y-2">
              <p className="text-xs text-[#64748b]">¿Necesitas balancear la carga de este colaborador?</p>
              <button
                onClick={() => {
                  setSelectedUserDetail(null);
                  onNavigateToTasks && onNavigateToTasks();
                }}
                className="w-full py-2.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Reasignar Tareas en Vista de Tareas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
