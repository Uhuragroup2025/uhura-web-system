import React, { useState } from 'react';
import {
  orbitMonthlyBilling,
  orbitServicesProfitability,
  orbitOperationalAlerts,
  orbitTopClients,
  orbitTrafficLightProjects,
  orbitTeamCapacity,
  orbitUpcomingMilestones
} from './mockData';
import {
  OperationalAlert,
  ProjectTrafficLight,
  TeamMemberCapacity,
  TaskItem,
  ActiveTimerState
} from './types';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Briefcase,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  Target,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart2,
  Info,
  SlidersHorizontal,
  X,
  Plus,
  Play,
  Pause,
  ListTodo
} from 'lucide-react';

interface DashboardViewProps {
  tasks?: TaskItem[];
  activeTimer?: ActiveTimerState | null;
  onStartTimer?: (task: TaskItem) => void;
  onPauseResumeTimer?: () => void;
  onStopTimer?: () => void;
  onOpenTaskDetail?: (taskId: string) => void;
  onOpenManualLog?: (taskId: string) => void;
  onNavigateToTasks?: () => void;
  onNavigateToProjects?: () => void;
  onNavigateToClients?: () => void;
  onNavigateToCapacity?: () => void;
  onNavigateToFinance?: () => void;
  onSelectClientDetail?: (clientName: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks = [],
  activeTimer,
  onStartTimer,
  onPauseResumeTimer,
  onStopTimer,
  onOpenTaskDetail,
  onOpenManualLog,
  onNavigateToTasks,
  onNavigateToProjects,
  onNavigateToClients,
  onNavigateToCapacity,
  onNavigateToFinance,
  onSelectClientDetail
}) => {
  // Global Filters State
  const [selectedPeriod, setSelectedPeriod] = useState<string>('todo');
  const [selectedProjectType, setSelectedProjectType] = useState<string>('todos');
  const [selectedClient, setSelectedClient] = useState<string>('todos');
  const [dashboardRole, setDashboardRole] = useState<'executive' | 'creative' | 'tech'>('executive');
  const [personalTimeRange, setPersonalTimeRange] = useState<'day' | 'week' | 'month'>('day');

  // Interactive Target Setting State
  const [monthlyTarget, setMonthlyTarget] = useState<number | null>(null);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState<boolean>(false);
  const [targetInput, setTargetInput] = useState<string>('350');

  // Operational Alerts Tab Filter
  const [alertFilter, setAlertFilter] = useState<'TODAS' | 'RETRASO' | 'RENTABILIDAD' | 'CARTERA'>('TODAS');
  const [isAlertsExpanded, setIsAlertsExpanded] = useState<boolean>(false);

  // Selected Item Modal State
  const [selectedAlert, setSelectedAlert] = useState<OperationalAlert | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectTrafficLight | null>(null);

  // Traffic Light Filter
  const [trafficFilter, setTrafficFilter] = useState<'todos' | 'rojo' | 'amarillo' | 'verde'>('todos');

  // Chart Tooltip Hover State
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  // Filtered alerts
  const filteredAlerts = orbitOperationalAlerts.filter((alert) => {
    if (alertFilter === 'TODAS') return true;
    return alert.type === alertFilter;
  });

  const displayedAlerts = isAlertsExpanded ? filteredAlerts : filteredAlerts.slice(0, 6);

  // Filtered projects
  const filteredProjects = orbitTrafficLightProjects.filter((prj) => {
    if (trafficFilter === 'todos') return true;
    return prj.riskStatus === trafficFilter;
  });

  // Calculate total billing from services
  const totalServiceRevenue = orbitServicesProfitability.reduce((acc, curr) => acc + curr.revenue, 0);

  // Handle Save Target
  const handleSaveTarget = () => {
    const parsed = parseFloat(targetInput);
    if (!isNaN(parsed) && parsed > 0) {
      setMonthlyTarget(parsed);
      setIsTargetModalOpen(false);
    }
  };

  // Operational Tasks for Creative & Tech roles (priority today)
  const todayTasks = tasks.length > 0 ? tasks.slice(0, 5) : [];
  const loggedHoursToday = 3.5;
  const targetDayHours = 8.0;
  const progressDailyPercent = Math.min(100, Math.round((loggedHoursToday / targetDayHours) * 100));
  const remainingHours = Math.max(0, targetDayHours - loggedHoursToday);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Operational Greeting & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#64748b]">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          <span>
            Vista activa:{' '}
            <strong className="text-[#0f172a]">
              {dashboardRole === 'executive'
                ? 'Dirección & Finanzas (PM / Ejecutivo)'
                : dashboardRole === 'creative'
                ? '🎨 Diseñador / Creativo (Foco Operativo)'
                : '💻 Tech / Dev (Foco Operativo)'}
            </strong>
          </span>
        </div>

        {/* Role Switcher & Action Button */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          {/* Dynamic Role Tab Switcher */}
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl border border-[#e2e8f0]">
            <button
              onClick={() => setDashboardRole('executive')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                dashboardRole === 'executive'
                  ? 'bg-white text-[#501f92] shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              📊 Ejecutivo / PM
            </button>
            <button
              onClick={() => setDashboardRole('creative')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                dashboardRole === 'creative'
                  ? 'bg-white text-[#501f92] shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              🎨 Diseñador / Creativo
            </button>
            <button
              onClick={() => setDashboardRole('tech')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                dashboardRole === 'tech'
                  ? 'bg-white text-[#501f92] shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              💻 Tech / Dev
            </button>
          </div>

          {dashboardRole === 'executive' && (
            <button
              onClick={() => setIsTargetModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white text-[#0f172a] border border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[#cbd5e1] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-[#501f92]" />
              <span>{monthlyTarget ? 'Ajustar Meta' : 'Definir Meta'}</span>
            </button>
          )}

          {dashboardRole !== 'executive' && (
            <button
              onClick={() => {
                if (onOpenManualLog) {
                  onOpenManualLog(todayTasks[0]?.id || 'task-1');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cargar Horas (+)</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OPCIÓN B: CONTROL UNIVERSAL DE RITMO PERSONAL (DÍA · SEMANA · MES) */}
      {/* Visible para todos los roles: Dirección/PM, Diseñador y Tech/Dev */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-[#e2e8f0] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f2ecfb] text-[#501f92] border border-[#8a4dff]/20">
                Control de Jornada & Ritmo Personal
              </span>
              <span className="text-xs text-[#64748b]">
                • {dashboardRole === 'executive' ? 'Tu Control de Tiempo (PM / Dirección)' : 'Tu Jornada de Especialista'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#0f172a] mt-1 tracking-tight">
              {personalTimeRange === 'day'
                ? 'Progreso de Hoy (Jornada Diaria)'
                : personalTimeRange === 'week'
                ? 'Progreso Semanal (Lunes a Viernes)'
                : 'Progreso Mensual (Agosto 2026)'}
            </h2>
          </div>

          {/* Selector de Granularidad: Día / Semana / Mes */}
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl border border-[#e2e8f0] self-start sm:self-auto">
            <button
              onClick={() => setPersonalTimeRange('day')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                personalTimeRange === 'day'
                  ? 'bg-white text-[#501f92] shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Hoy (Día)</span>
            </button>
            <button
              onClick={() => setPersonalTimeRange('week')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                personalTimeRange === 'week'
                  ? 'bg-white text-[#501f92] shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Esta Semana</span>
            </button>
            <button
              onClick={() => setPersonalTimeRange('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                personalTimeRange === 'month'
                  ? 'bg-white text-[#501f92] shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Este Mes</span>
            </button>
          </div>
        </div>

        {/* TAB 1: HOY (DÍA) */}
        {personalTimeRange === 'day' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Metric Bar */}
            <div className="bg-[#f8fafc] p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#501f92]" />
                  <span className="font-semibold text-[#0f172a]">
                    Total Cargado Hoy: <strong className="font-mono text-base font-black text-[#0f172a]">{loggedHoursToday.toFixed(1)}h / {targetDayHours.toFixed(1)}h</strong>
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                    {progressDailyPercent}% de la jornada
                  </span>
                </div>
                <span className="text-xs text-[#64748b] font-medium">
                  {remainingHours > 0 ? `Faltan ${remainingHours.toFixed(1)}h para completar las 8.0h de hoy` : '¡Jornada de 8h completada!'}
                </span>
              </div>

              {/* Unified Progress Bar */}
              <div className="w-full h-3.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  style={{ width: `${progressDailyPercent}%` }}
                  className="h-full bg-gradient-to-r from-[#501f92] to-[#8a4dff] rounded-full transition-all duration-500 shadow-xs"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#64748b] pt-0.5">
                <span>0.0h</span>
                <span className="font-medium">Meta mínima recomendada: 5.6h (70%)</span>
                <span>8.0h meta diaria</span>
              </div>
            </div>

            {/* Actividades con tiempo cargado hoy */}
            <div className="pt-1 space-y-2">
              <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                Registros cargados hoy (3.5h total):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-[#2563eb]">Fintech Plus · Sprint 4</span>
                    <p className="text-xs font-bold text-[#0f172a]">Diseño UI/UX de Interfaz Móvil</p>
                  </div>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-[#e2e8f0] text-[#501f92]">
                    2.0h
                  </span>
                </div>
                <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-[#2563eb]">Retail Group · Campaña Q3</span>
                    <p className="text-xs font-bold text-[#0f172a]">Revisión de Flujos de Usuario & QA</p>
                  </div>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-[#e2e8f0] text-[#501f92]">
                    1.5h
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ESTA SEMANA (LUNES A VIERNES) */}
        {personalTimeRange === 'week' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Metric Bar */}
            <div className="bg-[#f8fafc] p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#501f92]" />
                  <span className="font-semibold text-[#0f172a]">
                    Total Esta Semana: <strong className="font-mono text-base font-black text-[#0f172a]">19.5h / 40.0h</strong>
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                    48.8% acumulado
                  </span>
                </div>
                <span className="text-xs text-[#64748b] font-medium">
                  2 de 5 días completados · 20.5h restantes en la semana
                </span>
              </div>

              {/* Weekly Progress Bar */}
              <div className="w-full h-3.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  style={{ width: '48.8%' }}
                  className="h-full bg-gradient-to-r from-[#10b981] via-[#501f92] to-[#8a4dff] rounded-full transition-all duration-500 shadow-xs"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#64748b] pt-0.5">
                <span>0.0h</span>
                <span className="font-medium">Meta semana laboral (40.0h)</span>
                <span>40.0h</span>
              </div>
            </div>

            {/* Lunes a Viernes Micro-Cards */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                Desglose diario (Lunes a Viernes):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* Lunes */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#a7f3d0] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0f172a]">Lunes</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#ecfdf5] text-[#065f46]">
                      ✓ Listo
                    </span>
                  </div>
                  <p className="font-mono text-base font-black text-[#0f172a]">
                    8.2h <span className="text-[10px] font-normal text-[#64748b]">/ 8h</span>
                  </p>
                  <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                    <div className="w-full h-full bg-[#10b981] rounded-full" />
                  </div>
                  <span className="text-[10px] text-[#64748b] block">20 Ago · 102%</span>
                </div>

                {/* Martes */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#a7f3d0] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0f172a]">Martes</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#ecfdf5] text-[#065f46]">
                      ✓ Listo
                    </span>
                  </div>
                  <p className="font-mono text-base font-black text-[#0f172a]">
                    7.8h <span className="text-[10px] font-normal text-[#64748b]">/ 8h</span>
                  </p>
                  <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                    <div style={{ width: '98%' }} className="h-full bg-[#10b981] rounded-full" />
                  </div>
                  <span className="text-[10px] text-[#64748b] block">21 Ago · 98%</span>
                </div>

                {/* Miércoles (Hoy) */}
                <div className="p-3.5 rounded-2xl bg-[#fbf9ff] border-2 border-[#8a4dff] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#501f92]">Miércoles</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#f2ecfb] text-[#501f92]">
                      Hoy
                    </span>
                  </div>
                  <p className="font-mono text-base font-black text-[#501f92]">
                    3.5h <span className="text-[10px] font-normal text-[#64748b]">/ 8h</span>
                  </p>
                  <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                    <div style={{ width: '44%' }} className="h-full bg-[#8a4dff] rounded-full" />
                  </div>
                  <span className="text-[10px] text-[#501f92] font-semibold block">22 Ago · En curso</span>
                </div>

                {/* Jueves */}
                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] opacity-75 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#64748b]">Jueves</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-[#f1f5f9] text-[#64748b]">
                      Pendiente
                    </span>
                  </div>
                  <p className="font-mono text-base font-bold text-[#64748b]">
                    0.0h <span className="text-[10px] font-normal text-[#94a3b8]">/ 8h</span>
                  </p>
                  <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-[#94a3b8] rounded-full" />
                  </div>
                  <span className="text-[10px] text-[#94a3b8] block">23 Ago</span>
                </div>

                {/* Viernes */}
                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] opacity-75 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#64748b]">Viernes</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-[#f1f5f9] text-[#64748b]">
                      Pendiente
                    </span>
                  </div>
                  <p className="font-mono text-base font-bold text-[#64748b]">
                    0.0h <span className="text-[10px] font-normal text-[#94a3b8]">/ 8h</span>
                  </p>
                  <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-[#94a3b8] rounded-full" />
                  </div>
                  <span className="text-[10px] text-[#94a3b8] block">24 Ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ESTE MES (160H META) */}
        {personalTimeRange === 'month' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Metric Bar */}
            <div className="bg-[#f8fafc] p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-[#501f92]" />
                  <span className="font-semibold text-[#0f172a]">
                    Total Mensual (Agosto 2026): <strong className="font-mono text-base font-black text-[#0f172a]">84.0h / 160.0h</strong>
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                    52.5% del mes
                  </span>
                </div>
                <span className="text-xs text-[#64748b] font-medium">
                  10 días hábiles completos · 1 día en curso · 11 días hábiles restantes
                </span>
              </div>

              {/* Monthly Progress Bar */}
              <div className="w-full h-3.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  style={{ width: '52.5%' }}
                  className="h-full bg-gradient-to-r from-[#501f92] to-[#8a4dff] rounded-full transition-all duration-500 shadow-xs"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#64748b] pt-0.5">
                <span>0.0h</span>
                <span className="font-medium">Meta mensual laborable (160.0h)</span>
                <span>160.0h</span>
              </div>
            </div>

            {/* Breakdown by Weeks & Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Weeks Progress */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                <h4 className="text-xs font-bold text-[#0f172a]">Avance por Semanas del Mes</h4>
                <div className="space-y-2.5 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-[#0f172a]">Semana 1 (1 - 7 Ago):</span>
                      <strong className="text-[#10b981] font-mono">40.5h / 40.0h (101%) ✓</strong>
                    </div>
                    <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div className="w-full h-full bg-[#10b981] rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-[#0f172a]">Semana 2 (8 - 14 Ago):</span>
                      <strong className="text-[#10b981] font-mono">38.0h / 40.0h (95%) ✓</strong>
                    </div>
                    <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div style={{ width: '95%' }} className="h-full bg-[#10b981] rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-[#501f92]">Semana 3 (15 - 21 Ago · En curso):</span>
                      <strong className="text-[#501f92] font-mono">5.5h / 40.0h (14%)</strong>
                    </div>
                    <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div style={{ width: '14%' }} className="h-full bg-[#8a4dff] rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#94a3b8]">
                      <span>Semana 4 (22 - 31 Ago):</span>
                      <span className="font-mono">0.0h / 40.0h (Pendiente)</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div className="w-0 h-full bg-[#94a3b8] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribution & Projection */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
                <h4 className="text-xs font-bold text-[#0f172a]">Distribución & Proyección</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-between">
                    <span className="text-[#64748b]">Proyectos Clientes (Fee Facturable):</span>
                    <strong className="text-[#0f172a] font-mono">71.5h (85%)</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-between">
                    <span className="text-[#64748b]">Gestión, Coordinación & Labs:</span>
                    <strong className="text-[#0f172a] font-mono">12.5h (15%)</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#f2ecfb] border border-[#8a4dff]/20 flex items-center justify-between">
                    <span className="text-[#501f92] font-semibold">Proyección Cierre de Mes:</span>
                    <strong className="text-[#501f92] font-mono">164.0h (102.5%)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VISTA OPERATIVA PARA CREATIVOS & TECH / DEV */}
      {/* ========================================================================= */}
      {dashboardRole !== 'executive' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Card 2: Acceso Rápido a Tareas de Hoy (Focus Desk) */}
          <div className="bg-white p-6 rounded-3xl border border-[#e2e8f0] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
              <div>
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-[#501f92]" />
                  <h3 className="text-base font-bold text-[#0f172a]">
                    Mi Foco de Hoy · Tareas Asignadas
                  </h3>
                </div>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Inicia el temporizador o carga tiempo directamente en 1 clic sin tener que buscar en la lista completa
                </p>
              </div>

              {onNavigateToTasks && (
                <button
                  onClick={onNavigateToTasks}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#501f92] hover:text-[#381566] cursor-pointer"
                >
                  <span>Ver todas mis tareas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* List of Tasks */}
            <div className="space-y-3">
              {todayTasks.map((t) => {
                const isRunning = activeTimer?.taskId === t.id && !activeTimer?.isPaused;
                const isPaused = activeTimer?.taskId === t.id && activeTimer?.isPaused;

                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isRunning
                        ? 'bg-[#f5f3ff] border-[#8a4dff] shadow-sm ring-1 ring-[#8a4dff]/30'
                        : 'bg-[#f8fafc] hover:bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                    }`}
                  >
                    {/* Left: Task Info & Breadcrumb */}
                    <div
                      onClick={() => onOpenTaskDetail && onOpenTaskDetail(t.id)}
                      className="min-w-0 flex-1 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-[#64748b] mb-1">
                        <span className="font-semibold text-[#501f92]">{t.clientName || 'Cliente'}</span>
                        <span>›</span>
                        <span className="truncate max-w-[160px]">{t.projectName || t.board}</span>
                        <span className="text-[#94a3b8]">• {t.department}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0f172a] group-hover:text-[#501f92] transition-colors truncate">
                        {t.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748b]">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          t.status === 'In Progress'
                            ? 'bg-[#eff6ff] text-[#2563eb]'
                            : t.status === 'Review'
                            ? 'bg-[#fef3c7] text-[#92400e]'
                            : t.status === 'Done'
                            ? 'bg-[#ecfdf5] text-[#065f46]'
                            : 'bg-[#f1f5f9] text-[#64748b]'
                        }`}>
                          {t.status}
                        </span>
                        <span className="font-mono text-[11px]">
                          Consumido: <strong className="text-[#0f172a]">{((t.consumedSeconds || 0) / 3600).toFixed(1)}h</strong> / {t.budgetedHours || 4}h
                        </span>
                      </div>
                    </div>

                    {/* Right: Timer & Manual Log Direct Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* Live Timer Button */}
                      {isRunning ? (
                        <button
                          onClick={onPauseResumeTimer}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#d4ff4a] text-[#140b24] text-xs font-bold shadow-xs cursor-pointer animate-pulse"
                          title="Pausar temporizador"
                        >
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Timer Activo</span>
                        </button>
                      ) : isPaused ? (
                        <button
                          onClick={onPauseResumeTimer}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f59e0b] text-white text-xs font-bold shadow-xs cursor-pointer"
                          title="Reanudar temporizador"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Reanudar</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onStartTimer && onStartTimer(t)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#8a4dff] text-[#501f92] hover:text-white border border-[#e2e8f0] hover:border-[#8a4dff] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          title="Iniciar temporizador en esta tarea"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Iniciar Timer</span>
                        </button>
                      )}

                      {/* Manual Log Button (+) */}
                      <button
                        onClick={() => onOpenManualLog && onOpenManualLog(t.id)}
                        className="p-2 rounded-xl bg-white hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#501f92] border border-[#e2e8f0] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                        title="Cargar tiempo manual (+)"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      {/* Detail Button */}
                      <button
                        onClick={() => onOpenTaskDetail && onOpenTaskDetail(t.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#f1f5f9] text-[#0f172a] border border-[#e2e8f0] text-xs font-semibold cursor-pointer"
                      >
                        Ver Detalle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics Grid for Specialist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                TAREAS EN PROCESO
              </span>
              <p className="text-2xl font-black text-[#0f172a]">3 activas</p>
              <span className="text-[11px] text-[#64748b]">En tu backlog inmediato</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                ENTREGABLES PENDIENTES
              </span>
              <p className="text-2xl font-black text-[#501f92]">2 entregas</p>
              <span className="text-[11px] text-[#64748b]">Esperando revisión de PM</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                TOTAL SEMANA EN CURSO
              </span>
              <p className="text-2xl font-black text-[#10b981]">19.5h / 40.0h</p>
              <span className="text-[11px] text-[#64748b]">48.7% acumulado semanal</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA EJECUTIVA / PM (Financiera, Rentabilidad, Alertas y Capacidad) */}
      {/* ========================================================================= */}
      {dashboardRole === 'executive' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 3. ROW 1: Facturación vs. Meta (Left 7 cols) & Rentabilidad por Servicio (Right 5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Facturación vs. Meta Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e5e7eb] shadow-2xs p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
          <div>
            {/* Card Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#f3f4f6]">
              <div>
                <h2 className="text-base font-bold text-[#0f172a] tracking-tight flex items-center gap-2">
                  <span>Facturación vs. meta</span>
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Mes corriente + últimos 6 meses · COP
                </p>
              </div>

              {monthlyTarget ? (
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-md bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                  META: ${monthlyTarget}M COP
                </span>
              ) : (
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]">
                  Sin meta definida
                </span>
              )}
            </div>

            {/* 4 Financial Metric Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-5">
              {/* Facturado Mes */}
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                  FACTURADO MES
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight mt-1 block">
                  $0
                </span>
                <span className="text-[10px] text-[#94a3b8] block mt-0.5">Agosto 2026</span>
              </div>

              {/* Meta del Mes */}
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                  META DEL MES
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight mt-1 block">
                  {monthlyTarget ? `$${monthlyTarget}M` : '—'}
                </span>
                <span className="text-[10px] text-[#94a3b8] block mt-0.5">
                  {monthlyTarget ? 'Objetivo fijado' : 'No configurada'}
                </span>
              </div>

              {/* Por Cobrar */}
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                  POR COBRAR
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#501f92] tracking-tight mt-1 block">
                  $577.7M
                </span>
                <span className="text-[10px] text-[#64748b] block mt-0.5">Total cartera</span>
              </div>

              {/* Vencido */}
              <div className="p-3 rounded-xl bg-[#faf5f5] border border-[#fecdd3]/70">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                    VENCIDO
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48]" />
                </div>
                <span className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight mt-1 block">
                  $501.9M
                </span>
                <span className="text-[10px] font-bold text-[#be123c] block mt-0.5">86.8% en mora</span>
              </div>
            </div>

            {/* Contextual Banner */}
            {!monthlyTarget && (
              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#334155] flex items-start sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-[#64748b] shrink-0" />
                  <p className="leading-relaxed text-[11px] sm:text-xs">
                    No hay <span className="font-semibold text-[#1e293b]">meta financiera</span> definida para este mes — el cumplimiento presupuestal no se puede calcular.
                  </p>
                </div>
                <button
                  onClick={() => setIsTargetModalOpen(true)}
                  className="text-[11px] font-bold text-[#501f92] hover:text-[#381566] shrink-0 underline decoration-[#8a4dff]/40 underline-offset-2 cursor-pointer"
                >
                  Definir en Finanzas →
                </button>
              </div>
            )}

            {/* Monthly Bar Chart (SVG High Precision) */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-[#64748b] mb-3">
                <span className="font-medium">Histórico mensual facturado (Millones COP)</span>
                <span className="text-[10px] text-[#94a3b8]">Escala $0M - $400M</span>
              </div>

              <div className="h-44 w-full flex items-end justify-between gap-2 sm:gap-4 pt-4 pb-2 border-b border-[#e5e7eb] relative">
                {/* Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                  <div className="border-b border-dashed border-[#e5e7eb] w-full" />
                  <div className="border-b border-dashed border-[#e5e7eb] w-full" />
                  <div className="border-b border-dashed border-[#e5e7eb] w-full" />
                  <div className="border-b border-dashed border-[#e5e7eb] w-full" />
                </div>

                {orbitMonthlyBilling.map((item) => {
                  const heightPercent = (item.billed / 400) * 100;
                  const isZero = item.billed === 0;

                  return (
                    <div
                      key={item.month}
                      onMouseEnter={() => setHoveredMonth(item.month)}
                      onMouseLeave={() => setHoveredMonth(null)}
                      className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                    >
                      {/* Tooltip on Hover */}
                      {hoveredMonth === item.month && (
                        <div className="absolute -top-10 bg-[#090513] text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg z-20 whitespace-nowrap animate-in fade-in duration-75">
                          {item.month}: ${item.billed}M COP
                        </div>
                      )}

                      {/* Bar Graphic */}
                      <div
                        style={{ height: `${Math.max(heightPercent, 3)}%` }}
                        className={`w-full max-w-[48px] rounded-t-lg transition-all duration-300 ${
                          isZero
                            ? 'bg-[#f8fafc] border border-dashed border-[#cbd5e1]'
                            : 'bg-gradient-to-t from-[#501f92] to-[#8a4dff] hover:from-[#6d2abf] hover:to-[#a77aff] shadow-xs'
                        }`}
                      >
                        {!isZero && (
                          <div className="text-[9px] font-bold text-white text-center pt-1 hidden sm:block">
                            ${item.billed}M
                          </div>
                        )}
                      </div>

                      {/* Month Label */}
                      <span className="text-[10px] sm:text-xs font-semibold text-[#64748b] mt-2 group-hover:text-[#501f92]">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Caption */}
              <p className="text-[10px] text-[#94a3b8] mt-2 italic">
                Barras = facturado por mes · línea = meta del mes (solo meses con meta definida).
              </p>
            </div>
          </div>
        </div>

        {/* Rentabilidad por Servicio Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#e5e7eb] shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="pb-4 border-b border-[#f3f4f6]">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0f172a] tracking-tight">
                  Rentabilidad por servicio
                </h2>
                <PieChartIcon className="w-4 h-4 text-[#8a4dff]" />
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Ingresos y margen por área · costos proxy por horas
              </p>
            </div>

            {/* Donut Chart Visual Representation */}
            <div className="my-5 flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* Circular Graphic */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-[#f1f5f9]"
                    strokeWidth="4.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 1: Sin proyecto (93.8%) */}
                  <path
                    className="text-[#501f92] hover:opacity-90 cursor-pointer transition-opacity"
                    strokeDasharray="93.8, 100"
                    strokeDashoffset="0"
                    strokeWidth="4.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 2: Growth (3.7%) */}
                  <path
                    className="text-[#8a4dff] hover:opacity-90 cursor-pointer transition-opacity"
                    strokeDasharray="3.7, 100"
                    strokeDashoffset="-93.8"
                    strokeWidth="4.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 3: Web/Dev (1.5%) */}
                  <path
                    className="text-[#4be5ff] hover:opacity-90 cursor-pointer transition-opacity"
                    strokeDasharray="1.5, 100"
                    strokeDashoffset="-97.5"
                    strokeWidth="4.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 4: Creatividad (1.0%) */}
                  <path
                    className="text-[#d4ff4a] hover:opacity-90 cursor-pointer transition-opacity"
                    strokeDasharray="1.0, 100"
                    strokeDashoffset="-99.0"
                    strokeWidth="4.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                {/* Donut Center */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold uppercase text-[#64748b]">Total</span>
                  <span className="text-xs font-black text-[#0f172a] tracking-tight">
                    $1,374M
                  </span>
                  <span className="text-[9px] text-[#16a34a] font-bold">100% Margen</span>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="text-xs space-y-1">
                <p className="font-semibold text-[#0f172a]">Desglose consolidado</p>
                <p className="text-[#64748b] text-[11px] leading-relaxed">
                  El 93.8% de los ingresos no tienen proyecto asignado directamente en el período.
                </p>
              </div>
            </div>

            {/* List of Services Breakdown */}
            <div className="space-y-2.5 pt-2 border-t border-[#f3f4f6]">
              {orbitServicesProfitability.map((srv) => (
                <div
                  key={srv.id}
                  onMouseEnter={() => setHoveredService(srv.id)}
                  onMouseLeave={() => setHoveredService(null)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f9fafb] transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      style={{ backgroundColor: srv.color }}
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                    />
                    <span className="font-medium text-[#475569] truncate">
                      {srv.service}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-[#0f172a]">
                      ${srv.revenue.toFixed(1)}M
                    </span>
                    <span className="text-[11px] text-[#64748b] font-mono w-14 text-right">
                      {srv.revenue > 0 ? `${srv.marginPercent.toFixed(1)}%` : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. ROW 2: Alertas Operativas (Left 8 cols) & Top Clientes (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alertas Operativas */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#e5e7eb] shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            {/* Card Header & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f3f4f6]">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]/60">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-[#0f172a] tracking-tight">
                    Alertas operativas
                  </h2>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                    47 activas
                  </span>
                </div>
                <p className="text-xs text-[#64748b] mt-1 ml-8 sm:ml-0">
                  47 señales · proyectos en rojo + cartera vencida
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setAlertFilter('TODAS')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    alertFilter === 'TODAS'
                      ? 'bg-white text-[#0f172a] shadow-2xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  Todas (47)
                </button>
                <button
                  onClick={() => setAlertFilter('RETRASO')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    alertFilter === 'RETRASO'
                      ? 'bg-white text-[#b91c1c] shadow-2xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  Retraso
                </button>
                <button
                  onClick={() => setAlertFilter('RENTABILIDAD')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    alertFilter === 'RENTABILIDAD'
                      ? 'bg-white text-[#b45309] shadow-2xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  Rentabilidad
                </button>
                <button
                  onClick={() => setAlertFilter('CARTERA')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    alertFilter === 'CARTERA'
                      ? 'bg-white text-[#c2410c] shadow-2xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  Cartera
                </button>
              </div>
            </div>

            {/* List of Operational Alerts */}
            <div className="space-y-3 mt-4">
              {displayedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className="p-3.5 rounded-xl bg-[#fafafa] hover:bg-[#f2ecfb]/40 border border-[#e5e7eb] hover:border-[#8a4dff]/40 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            alert.type === 'RETRASO'
                              ? 'bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]'
                              : alert.type === 'RENTABILIDAD'
                              ? 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]'
                              : 'bg-[#ffedd5] text-[#9a3412] border border-[#fed7aa]'
                          }`}
                        >
                          {alert.type}
                        </span>
                        <span className="text-xs font-bold text-[#0f172a] group-hover:text-[#501f92] transition-colors">
                          {alert.title}
                        </span>
                      </div>

                      <p className="text-xs text-[#64748b] leading-relaxed">
                        {alert.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {alert.amount && (
                        <span className="text-xs font-black text-[#be123c] bg-[#fff1f2] px-2 py-0.5 rounded-md border border-[#ffe4e6]">
                          {alert.amount}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#501f92] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Expand Button */}
          <div className="pt-4 mt-2 border-t border-[#f3f4f6] flex items-center justify-between">
            <span className="text-xs text-[#64748b]">
              {isAlertsExpanded ? 'Mostrando todas las alertas del sistema' : '+ 41 más en sus módulos.'}
            </span>
            <button
              onClick={() => setIsAlertsExpanded(!isAlertsExpanded)}
              className="text-xs font-bold text-[#501f92] hover:text-[#381566] cursor-pointer flex items-center gap-1"
            >
              <span>{isAlertsExpanded ? 'Ver menos' : 'Expandir todas las alertas'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top Clientes */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#e5e7eb] shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#f3f4f6]">
              <div>
                <h2 className="text-base font-bold text-[#0f172a] tracking-tight">
                  Top clientes
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Por facturación total · COP
                </p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]">
                Ranking
              </span>
            </div>

            {/* Clients List */}
            <div className="space-y-3 mt-4">
              {orbitTopClients.map((client, idx) => {
                const percentageOfTop = (client.billingAmount / 741.6) * 100;

                return (
                  <div
                    key={client.id}
                    onClick={() => {
                      if (onSelectClientDetail) {
                        onSelectClientDetail(client.name);
                      } else if (onNavigateToClients) {
                        onNavigateToClients();
                      }
                    }}
                    className="p-2 rounded-xl hover:bg-[#f8fafc] border border-transparent hover:border-[#8a4dff]/30 cursor-pointer transition-all space-y-1.5 group"
                    title={`Ver detalle de ${client.name}`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0f172a] group-hover:text-[#501f92] transition-colors truncate pr-2">
                        {idx + 1}. {client.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-extrabold text-[#0f172a]">
                          {client.billingCOP}
                        </span>
                        <span className="text-[11px] text-[#64748b] font-mono">
                          {client.marginPercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentageOfTop}%` }}
                        className="h-full bg-gradient-to-r from-[#501f92] to-[#8a4dff] rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Button to View All Clients */}
          <div className="pt-4 mt-4 border-t border-[#f3f4f6]">
            <button
              onClick={onNavigateToClients}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#f8fafc] text-[#0f172a] text-xs font-semibold border border-[#e2e8f0] hover:border-[#cbd5e1] shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Ver todos los clientes</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#64748b]" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. ROW 3: Proyectos · Semáforo (4 cols), Capacidad del Equipo (4 cols) & Próximos 7 Días (4 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Proyectos Semáforo */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#e5e7eb] shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#f3f4f6]">
              <div>
                <h2 className="text-base font-bold text-[#0f172a] tracking-tight">
                  Proyectos · semáforo
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Doble riesgo: rentabilidad + retraso
                </p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                26 en curso
              </span>
            </div>

            {/* Traffic Light Badges / Counters */}
            <div className="grid grid-cols-3 gap-2 my-4">
              <button
                onClick={() => setTrafficFilter(trafficFilter === 'verde' ? 'todos' : 'verde')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  trafficFilter === 'verde'
                    ? 'bg-[#ecfdf5] border-[#10b981] ring-2 ring-[#10b981]/20'
                    : 'bg-[#f0fdf4] border-[#bbf7d0] hover:bg-[#dcfce7]'
                }`}
              >
                <span className="text-xl font-black text-[#15803d] block">21</span>
                <span className="text-[9px] font-extrabold uppercase text-[#166534] tracking-wider">
                  VERDE
                </span>
              </button>

              <button
                onClick={() => setTrafficFilter(trafficFilter === 'amarillo' ? 'todos' : 'amarillo')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  trafficFilter === 'amarillo'
                    ? 'bg-[#fefce8] border-[#eab308] ring-2 ring-[#eab308]/20'
                    : 'bg-[#fefce8] border-[#fef08a] hover:bg-[#fef9c3]'
                }`}
              >
                <span className="text-xl font-black text-[#a16207] block">0</span>
                <span className="text-[9px] font-extrabold uppercase text-[#854d0e] tracking-wider">
                  AMARILLO
                </span>
              </button>

              <button
                onClick={() => setTrafficFilter(trafficFilter === 'rojo' ? 'todos' : 'rojo')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  trafficFilter === 'rojo'
                    ? 'bg-[#fff5f5] border-[#ef4444] ring-2 ring-[#ef4444]/20'
                    : 'bg-[#fafafa] border-[#e5e7eb] hover:bg-[#fef2f2] hover:border-[#fecaca]'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  <span className="text-xl font-black text-[#0f172a]">5</span>
                </div>
                <span className="text-[9px] font-bold uppercase text-[#991b1b] tracking-wider block mt-0.5">
                  CRÍTICO (ROJO)
                </span>
              </button>
            </div>

            {/* Critical Projects List */}
            <div className="space-y-3">
              {filteredProjects.map((prj) => (
                <div
                  key={prj.id}
                  onClick={() => setSelectedProject(prj)}
                  className="p-2.5 rounded-xl hover:bg-[#f9fafb] transition-colors cursor-pointer group flex items-start gap-2.5"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] mt-1 shrink-0 animate-pulse" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#0f172a] group-hover:text-[#501f92] truncate">
                      {prj.name}
                    </p>
                    <p className="text-[11px] text-[#64748b] truncate">
                      {prj.client} · {prj.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Button to View All Projects */}
          <div className="pt-4 mt-4 border-t border-[#f3f4f6]">
            <button
              onClick={onNavigateToProjects}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#f8fafc] text-[#0f172a] text-xs font-semibold border border-[#e2e8f0] hover:border-[#cbd5e1] shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Ver todos los proyectos</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#64748b]" />
            </button>
          </div>
        </div>

        {/* Capacidad del Equipo */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#e5e7eb] shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="pb-3 border-b border-[#f3f4f6]">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0f172a] tracking-tight">
                  Capacidad del equipo
                </h2>
                <Users className="w-4 h-4 text-[#8a4dff]" />
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Próximas 4 semanas
              </p>
            </div>

            {/* Big Utilization Metric */}
            <div className="my-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-[#0f172a] tracking-tight">
                  0%
                </span>
                <span className="text-xs text-[#64748b] ml-2">utilización global</span>
              </div>
              <span className="text-[11px] font-semibold text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#e2e8f0]">
                4400h/mes · 25 personas
              </span>
            </div>

            {/* Team Members Allocation List */}
            <div className="space-y-3">
              {orbitTeamCapacity.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg ${member.avatarBg} text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs`}
                    >
                      {member.initials}
                    </div>
                    <span className="font-semibold text-[#0f172a] truncate">
                      {member.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Capacity Progress Bar */}
                    <div className="w-16 sm:w-20 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(member.utilizationPercent, 2)}%` }}
                        className={`h-full rounded-full ${
                          member.utilizationPercent > 90
                            ? 'bg-[#ef4444]'
                            : member.utilizationPercent > 0
                            ? 'bg-[#10b981]'
                            : 'bg-[#cbd5e1]'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#64748b] w-6 text-right">
                      {member.utilizationPercent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Button to View Heatmap */}
          <div className="pt-4 mt-4 border-t border-[#f3f4f6]">
            <button
              onClick={onNavigateToCapacity}
              className="w-full py-2.5 px-3 rounded-xl bg-[#f8fafc] hover:bg-[#f2ecfb] text-[#501f92] text-xs font-bold border border-[#e2e8f0] hover:border-[#8a4dff]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Ver heatmap completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Próximos 7 Días */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#e5e7eb] shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="pb-3 border-b border-[#f3f4f6]">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0f172a] tracking-tight">
                  Próximos 7 días
                </h2>
                <Calendar className="w-4 h-4 text-[#8a4dff]" />
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Tareas que vencen + cierres de proyecto
              </p>
            </div>

            {/* Upcoming List */}
            <div className="space-y-3.5 mt-4">
              {orbitUpcomingMilestones.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#f8fafc] hover:bg-[#f2ecfb]/40 border border-[#e2e8f0]/80 transition-all flex items-start gap-3 group"
                >
                  {/* Date Block */}
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#e2e8f0] shadow-2xs flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-black text-[#0f172a] leading-none">
                      {item.dateDay}
                    </span>
                    <span className="text-[9px] font-bold text-[#501f92] uppercase mt-0.5">
                      {item.dateMonth}
                    </span>
                  </div>

                  {/* Task & Project Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-[#0f172a] group-hover:text-[#501f92] transition-colors truncate">
                        {item.title}
                      </p>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                          item.isUrgent
                            ? 'bg-[#fee2e2] text-[#b91c1c]'
                            : 'bg-[#e0e7ff] text-[#4338ca]'
                        }`}
                      >
                        {item.relativeTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                      {item.project} · {item.assignee}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Info Note */}
          <div className="pt-4 mt-4 border-t border-[#f3f4f6] text-[11px] text-[#64748b] flex items-center justify-between">
            <span>Sincronizado con Google Calendar & Orbit</span>
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          </div>
        </div>
      </div>
      </div>
      )}

      {/* 6. MODAL: Definir Meta Financiera */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#f3f4f6]">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#501f92]" />
                <h3 className="text-base font-bold text-[#111827]">
                  Definir Meta Financiera Mensual
                </h3>
              </div>
              <button
                onClick={() => setIsTargetModalOpen(false)}
                className="p-1 rounded-lg text-[#9ca3af] hover:text-[#111827] hover:bg-[#f3f4f6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-5 space-y-4">
              <p className="text-xs text-[#4b5563] leading-relaxed">
                Establece la meta de facturación para el mes corriente (Agosto 2026) en Millones de pesos colombianos (COP).
              </p>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  Meta del Mes (COP en Millones)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#9ca3af]">
                    $
                  </span>
                  <input
                    type="number"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    placeholder="Ej. 350"
                    className="w-full pl-8 pr-12 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-sm font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]/20 focus:border-[#8a4dff]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6b7280]">
                    M COP
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f2ecfb] text-xs text-[#501f92] border border-[#8a4dff]/20">
                <p className="font-semibold">Cálculo en vivo:</p>
                <p className="text-[11px] mt-0.5 text-[#6d2abf]">
                  Con esta meta, el cumplimiento del mes se visualizará automáticamente en la tarjeta principal y en los reportes ejecutivos.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f3f4f6]">
              <button
                onClick={() => setIsTargetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#4b5563] hover:bg-[#f3f4f6] rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTarget}
                className="px-4 py-2 bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Guardar Meta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: Detalle de Alerta Operativa */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#f3f4f6]">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${
                    selectedAlert.type === 'RETRASO'
                      ? 'bg-[#fee2e2] text-[#991b1b]'
                      : selectedAlert.type === 'RENTABILIDAD'
                      ? 'bg-[#fef3c7] text-[#92400e]'
                      : 'bg-[#ffedd5] text-[#9a3412]'
                  }`}
                >
                  {selectedAlert.type}
                </span>
                <h3 className="text-sm font-bold text-[#111827] truncate max-w-xs">
                  {selectedAlert.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 rounded-lg text-[#9ca3af] hover:text-[#111827] hover:bg-[#f3f4f6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-5 space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#f9fafb] border border-[#e5e7eb] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Cliente:</span>
                  <span className="font-bold text-[#111827]">{selectedAlert.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Severidad de impacto:</span>
                  <span className="font-bold text-[#b91c1c] uppercase">{selectedAlert.impactLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Fecha / Tiempo:</span>
                  <span className="font-semibold text-[#111827]">{selectedAlert.date}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#111827] mb-1">Descripción del desvío:</h4>
                <p className="text-xs text-[#4b5563] leading-relaxed bg-[#fafafa] p-3 rounded-xl border border-[#f3f4f6]">
                  {selectedAlert.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-xs text-[#065f46]">
                <p className="font-bold">Acción recomendada por Orbit:</p>
                <p className="text-[11px] mt-0.5">
                  Convocar reunión con el Account Lead para renegociar el alcance o autorizar adición de horas en cotizador.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f3f4f6]">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 text-xs font-semibold text-[#4b5563] hover:bg-[#f3f4f6] rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  alert(`Abriendo expediente del cliente ${selectedAlert.client} en el módulo Comercial.`);
                  setSelectedAlert(null);
                }}
                className="px-4 py-2 bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Ir a Expediente del Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL: Detalle de Proyecto en Semáforo */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#f3f4f6]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <h3 className="text-sm font-bold text-[#111827]">
                  {selectedProject.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 rounded-lg text-[#9ca3af] hover:text-[#111827] hover:bg-[#f3f4f6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-5 space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#f9fafb] border border-[#e5e7eb] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Cliente:</span>
                  <span className="font-bold text-[#111827]">{selectedProject.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Líder Asignado:</span>
                  <span className="font-semibold text-[#501f92]">{selectedProject.leadAssignee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Avance de Entregas:</span>
                  <span className="font-bold text-[#111827]">{selectedProject.progressPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Motivo de Alerta:</span>
                  <span className="font-bold text-[#b91c1c]">{selectedProject.reason}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f3f4f6]">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 text-xs font-semibold text-[#4b5563] hover:bg-[#f3f4f6] rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  alert(`Navegando a la vista detallada del proyecto ${selectedProject.name}.`);
                  setSelectedProject(null);
                  if (onNavigateToProjects) onNavigateToProjects();
                }}
                className="px-4 py-2 bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Abrir Tablero de Proyecto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
