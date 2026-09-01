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
import { TaskItem, TimeLog, ActiveTimerState } from './types';
import { initialUsers } from './mockData';

export type CapacityTimeframe = 'today' | 'week' | 'month';
export type CapacityPerspective = 'personal' | 'team' | 'org';

interface CapacityViewProps {
  tasks: TaskItem[];
  timeLogs: TimeLog[];
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

// Configuración Legal Colombia: Ley 2101 de 2021 (Jornada máxima 42 horas/semana)
// Para semana estándar de 5 días hábiles (Lunes a Viernes): 8.4h por día laborable.
const LEGAL_WEEKLY_HOURS = 42.0;
const STANDARD_DAILY_HOURS = 8.4;

export const CapacityView: React.FC<CapacityViewProps> = ({
  tasks,
  timeLogs,
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

  // Semana laboral simulada (Lunes 24 de Agosto a Viernes 28 de Agosto de 2026)
  const weekDays = [
    { dayName: 'Lunes', date: '24 Ago', fullDate: '2026-08-24', isHoliday: false, holidayName: '' },
    { dayName: 'Martes', date: '25 Ago', fullDate: '2026-08-25', isHoliday: false, holidayName: '' },
    { dayName: 'Miércoles', date: '26 Ago', fullDate: '2026-08-26', isHoliday: false, holidayName: '' },
    { dayName: 'Jueves', date: '27 Ago', fullDate: '2026-08-27', isHoliday: false, holidayName: '' },
    { dayName: 'Viernes', date: '28 Ago', fullDate: '2026-08-28', isHoliday: false, holidayName: '' },
  ];

  // Cálculo de Capacidad Legal del Periodo
  const calculatePeriodLegalCapacity = (period: CapacityTimeframe) => {
    if (period === 'today') {
      return STANDARD_DAILY_HOURS; // 8.4h
    }
    if (period === 'week') {
      // Si la semana tiene días festivos, se descuentan 8.4h por cada festivo
      const holidayCountInWeek = weekDays.filter(d => d.isHoliday).length;
      return LEGAL_WEEKLY_HOURS - (holidayCountInWeek * STANDARD_DAILY_HOURS);
    }
    // Mes de Agosto 2026: 21 días hábiles (2 festivos: 7 y 17 de agosto) -> 21 * 8.4 = 176.4h
    return 176.4;
  };

  const periodLegalCapacity = calculatePeriodLegalCapacity(timeframe);

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

  // Distribución del equipo completo con cálculo de horas reales
  const teamMembersData = useMemo(() => {
    // Lista completa de colaboradores con sus áreas y roles según la estructura organizacional oficial
    const teamList = [
      // ÁREA DIRECCIÓN / C-LEVEL
      { id: 'u-am', name: 'Ana María Giraldo', role: 'CEO (C-Level)', initials: 'AM', avatarBg: 'bg-[#501f92]', assigned: 38.0, executed: 34.0, dept: 'C-Level' },

      // ÁREA PRODUCTO
      { id: 'u-pm', name: 'Paola Monsalve', role: 'Product Lead / Digital Designer', initials: 'PM', avatarBg: 'bg-[#501f92]', assigned: 39.5, executed: 35.0, dept: 'Área Producto' },
      { id: 'u-lg', name: 'Laura Gómez', role: 'Desarrollador Web Front-End', initials: 'LG', avatarBg: 'bg-[#0284c7]', assigned: 40.0, executed: 36.5, dept: 'Área Producto' },
      { id: 'u-oc', name: 'Oscar Cerpa', role: 'Desarrollador Web Front-End', initials: 'OC', avatarBg: 'bg-[#f59e0b]', assigned: 26.0, executed: 20.0, dept: 'Área Producto' },
      { id: 'u-dd', name: 'Digital Designer', role: 'Digital Designer', initials: 'DD', avatarBg: 'bg-[#8b5cf6]', assigned: 36.0, executed: 30.5, dept: 'Área Producto' },
      { id: 'u-sv', name: 'Simón Vélez', role: 'Digiops / Trafficker Media', initials: 'SV', avatarBg: 'bg-[#10b981]', assigned: 38.5, executed: 33.0, dept: 'Área Producto' },

      // ÁREA CREATIVIDAD
      { id: 'u-dc', name: 'Diego Cadavid', role: 'Creative Strategy Lead', initials: 'DC', avatarBg: 'bg-[#dc2626]', assigned: 41.0, executed: 38.0, dept: 'Área Creatividad' },
      { id: 'u-sr', name: 'Sara Rivera', role: 'Community Manager', initials: 'SR', avatarBg: 'bg-[#ec4899]', assigned: 32.0, executed: 26.0, dept: 'Área Creatividad' },
      { id: 'u-sl', name: 'Sara Mar Lagos', role: 'Creative Designer', initials: 'SL', avatarBg: 'bg-[#f43f5e]', assigned: 39.0, executed: 34.5, dept: 'Área Creatividad' },
      { id: 'u-ct-c', name: 'Camilo Torres', role: 'Creative Designer', initials: 'CT', avatarBg: 'bg-[#6366f1]', assigned: 35.0, executed: 29.0, dept: 'Área Creatividad' },
      { id: 'u-mg', name: 'Melisa Gil', role: 'Creative Designer', initials: 'MG', avatarBg: 'bg-[#d946ef]', assigned: 40.5, executed: 36.0, dept: 'Área Creatividad' },
      { id: 'u-af', name: 'Alejandro Florez', role: 'Creative Designer', initials: 'AF', avatarBg: 'bg-[#06b6d4]', assigned: 36.5, executed: 31.0, dept: 'Área Creatividad' },
      { id: 'u-ed', name: 'Esmeralda Duque', role: 'Content Creator', initials: 'ED', avatarBg: 'bg-[#8b5cf6]', assigned: 38.0, executed: 32.5, dept: 'Área Creatividad' },

      // ÁREA GROWTH
      { id: 'u-cv', name: 'Camilo Vélez', role: 'Growth Manager', initials: 'CV', avatarBg: 'bg-[#059669]', assigned: 39.0, executed: 33.5, dept: 'Área Growth' },
      { id: 'u-nb', name: 'Nayeliz Brunal', role: 'Digital Content Specialist', initials: 'NB', avatarBg: 'bg-[#14b8a6]', assigned: 31.0, executed: 25.0, dept: 'Área Growth' },
      { id: 'u-sc', name: 'Sebastián Caicedo', role: 'Trafficker Media', initials: 'SC', avatarBg: 'bg-[#10b981]', assigned: 41.5, executed: 37.0, dept: 'Área Growth' },

      // ÁREA COMERCIAL
      { id: 'u-ct-d', name: 'Catalina Tejada', role: 'Directora Comercial', initials: 'CT', avatarBg: 'bg-[#7c3aed]', assigned: 38.0, executed: 32.0, dept: 'Área Comercial' },
      { id: 'u-lu', name: 'Luisa Urazán', role: 'Client Relationship Strategist', initials: 'LU', avatarBg: 'bg-[#0284c7]', assigned: 33.5, executed: 27.5, dept: 'Área Comercial' },

      // ÁREA ADMINISTRATIVA
      { id: 'u-ls', name: 'Laura Salazar', role: 'Administración', initials: 'LS', avatarBg: 'bg-[#64748b]', assigned: 28.0, executed: 22.0, dept: 'Área Administrativa' }
    ];

    return teamList.map(member => {
      const cap = periodLegalCapacity;
      let assigned = member.assigned;
      let executed = member.executed;

      if (timeframe === 'today') {
        assigned = Number((member.assigned / 5).toFixed(1));
        executed = Number((member.executed / 5).toFixed(1));
      } else if (timeframe === 'month') {
        assigned = Number((member.assigned * 4.2).toFixed(1));
        executed = Number((member.executed * 4.2).toFixed(1));
      }

      const utilPercent = Math.round((assigned / cap) * 100);
      const diffHours = Number((cap - assigned).toFixed(1));
      
      // Lógica de Semáforo de Capacidad y Estado:
      // - Verde (> 90%): Carga óptima / alta utilización efectiva
      // - Naranja (60% - 90%): En proceso / utilización media
      // - Rojo (< 60% o > 105% sobrecarga extrema): Muy bajo o sobrecarga
      let status: 'optimal' | 'available' | 'overloaded' | 'tight' = 'optimal';

      if (utilPercent > 105) {
        status = 'overloaded';
      } else if (utilPercent < 65) {
        status = 'available';
      } else if (utilPercent >= 90) {
        status = 'optimal';
      } else {
        status = 'tight';
      }

      return {
        ...member,
        assigned,
        executed,
        capacity: cap,
        utilPercent,
        diffHours,
        status
      };
    });
  }, [periodLegalCapacity, timeframe]);

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
    const optimalCount = teamMembersData.filter(m => m.status === 'optimal' || m.status === 'tight').length;

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
              Hoy (8.4h)
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === 'week' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Semana (42h)
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

          {/* Badge Ley Colombiana */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[11px] font-medium text-[#475569] shrink-0"
            title="Jornada máxima legal en Colombia: 42 horas/semana (Ley 2101 de 2021). Festivos oficiales no suman horas laborales."
          >
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="hidden sm:inline">Jornada Col: <strong>42h/sem</strong></span>
            <span className="sm:hidden"><strong>42h/sem</strong></span>
            <span className="text-[10px] text-[#64748b] bg-white px-1.5 py-0.5 rounded border border-[#e2e8f0]">Sin festivos</span>
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
              Semana transcurrida al <strong>60%</strong> (Miércoles). Horas ejecutadas al <strong>58%</strong> de la meta semanal.
            </p>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-[#475569] border-t border-[#f1f5f9]">
            <span>Meta semanal: <strong>42.0h</strong></span>
            <span className="text-[#501f92] font-semibold">Proyección: 41.5h</span>
          </div>
        </div>
      </div>

      {/* 3. VISTA SEGÚN PERSPECTIVA SELECCIONADA */}

      {/* PERSPECTIVA A: MI CAPACIDAD (VISTA INDIVIDUAL COLABORADOR) */}
      {perspective === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda / Central: Matriz de la Semana (Lunes a Viernes 42h) */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">Distribución de Carga Semanal</h3>
                <p className="text-xs text-[#64748b]">Jornada de 8.4h/día · Lunes a Viernes (42h máx legal)</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[#334155]">
                Semana 24 - 28 Ago 2026
              </span>
            </div>

            {/* 5 Columnas de Días */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {weekDays.map((day, idx) => {
                const dayAssigned = [7.8, 8.4, 7.6, 7.8, 5.5][idx];
                const dayExecuted = [7.5, 8.0, 6.5, 5.0, 3.5][idx];
                const isOver = dayAssigned > STANDARD_DAILY_HOURS;
                const dayUtil = Math.round((dayAssigned / STANDARD_DAILY_HOURS) * 100);
                const isToday = idx === 2; // Miércoles

                const dayBarColor = isOver
                  ? 'bg-[#dc2626]'
                  : dayUtil >= 90
                  ? 'bg-[#10b981]' // Verde >90%
                  : dayUtil >= 65
                  ? 'bg-[#f59e0b]' // Naranja en proceso
                  : 'bg-[#ef4444]'; // Rojo bajo

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
                        <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" title="Hoy" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748b] mb-2">{day.date}</p>

                    {/* Barra Vertical / Horizontal del Día */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-[#64748b]">Carga:</span>
                        <span className={`font-bold ${isOver ? 'text-[#dc2626]' : 'text-[#0f172a]'}`}>
                          {dayAssigned}h / 8.4h
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, (dayAssigned / STANDARD_DAILY_HOURS) * 100)}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${dayBarColor}`}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-[#64748b] pt-0.5">
                        <span>Hecho: {dayExecuted}h</span>
                        <span className={isOver ? 'text-[#dc2626] font-semibold' : 'text-[#059669]'}>
                          {isOver ? `+${(dayAssigned - STANDARD_DAILY_HOURS).toFixed(1)}h` : `${(STANDARD_DAILY_HOURS - dayAssigned).toFixed(1)}h libre`}
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
              const isLow = member.utilPercent < 65;
              const isHigh = member.utilPercent >= 90 && !isOver;
              const isMedium = member.utilPercent >= 65 && member.utilPercent < 90;

              // Color semafórico exacto solicitado por el usuario:
              // Verde: > 90% (Carga óptima alta)
              // Naranja: En proceso (65% - 90%)
              // Rojo: Muy bajo (< 65%) o sobrecarga extrema (> 105%)
              const barColor = isOver
                ? 'bg-[#dc2626]'
                : isHigh
                ? 'bg-[#10b981]' // Verde > 90%
                : isMedium
                ? 'bg-[#f59e0b]' // Naranja (en proceso / medio)
                : 'bg-[#ef4444]'; // Rojo (muy bajo)

              const statusBadgeBg = isOver
                ? 'bg-[#fee2e2] text-[#b91c1c] border-[#fca5a5]'
                : isHigh
                ? 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]'
                : isMedium
                ? 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]'
                : 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]';

              const statusLabel = isOver
                ? `⚠️ Sobrecarga (+${Math.abs(member.diffHours)}h)`
                : isHigh
                ? `Óptimo / >90% (${member.utilPercent}%)`
                : isMedium
                ? `En Proceso (${member.utilPercent}%)`
                : `Muy Bajo (${member.utilPercent}%)`;

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedUserDetail(member.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${
                    isOver
                      ? 'bg-[#fffbfa] border-[#fecdd3] hover:border-[#fda4af]'
                      : isLow
                      ? 'bg-[#fffdfd] border-[#fecdd3]/60 hover:border-[#fca5a5]'
                      : isHigh
                      ? 'bg-[#fcfdfd] border-[#e2e8f0] hover:border-[#a7f3d0]'
                      : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
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

                  {/* Barra de Capacidad del Colaborador */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#64748b]">
                        Asignado: <strong className="text-[#0f172a]">{member.assigned}h</strong> / {member.capacity}h
                      </span>
                      <span className={`font-bold ${
                        isHigh ? 'text-[#059669]' : isMedium ? 'text-[#d97706]' : 'text-[#dc2626]'
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

            {/* Resumen Numérico */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                <p className="text-[10px] text-[#64748b] uppercase font-bold">Capacidad Legal</p>
                <p className="text-base font-extrabold font-mono text-[#0f172a]">{selectedMemberObj.capacity}h</p>
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
