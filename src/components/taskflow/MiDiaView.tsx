import React, { useState } from 'react';
import {
  TaskItem,
  ActiveTimerState,
  OrbitView
} from './types';
import { resolveBuckyState } from './buckyEngine';
import {
  Clock,
  CheckCircle2,
  Circle,
  Play,
  Square,
  Plus,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Check,
  MessageSquare,
  X,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  Repeat,
  Flame,
  Coffee,
  Users2,
  ArrowUpRight,
  Briefcase
} from 'lucide-react';

interface MiDiaViewProps {
  tasks: TaskItem[];
  activeTimer: ActiveTimerState | null;
  onStartTimer: (task: TaskItem) => void;
  onPauseResumeTimer?: () => void;
  onStopTimer: () => void;
  onOpenTaskDetail: (taskId: string) => void;
  onOpenManualLog: (taskId?: string) => void;
  onToggleTask: (taskId: string) => void;
  onQuickLogHours: (hours: number, label: string, category?: 'client' | 'internal', projectName?: string) => void;
  loggedHoursToday?: number;
  configuredCapacityHours?: number;
  targetDayHours?: number;
  onNavigateToView?: (view: OrbitView) => void;
}

export const MiDiaView: React.FC<MiDiaViewProps> = ({
  tasks,
  activeTimer,
  onStartTimer,
  onStopTimer,
  onOpenTaskDetail,
  onOpenManualLog,
  onToggleTask,
  onQuickLogHours,
  loggedHoursToday = 5.5,
  configuredCapacityHours = 8.0,
  onNavigateToView
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tareas operativas de Paola para hoy, incluyendo una pieza en retrabajo explícito
  const [localTasks, setLocalTasks] = useState<TaskItem[]>([
    {
      id: 't-demo-rework-yamaha',
      title: 'Ajustes de arte según feedback de cliente (Ronda 2)',
      description: 'Ajuste tipográfico en banners display y corrección de logo según mesa técnica.',
      department: 'Creatividad & Diseño',
      board: 'Campaña Navidad Yamaha',
      clientName: 'INCOLMOTOS YAMAHA S.A.',
      projectName: 'Campaña Navidad Yamaha',
      budgetedHours: 1.5,
      consumedSeconds: 1800, // 0.5h
      completed: false,
      isRework: true,
      reworkReason: 'Feedback de cliente en mesa técnica (Ronda 2)',
      reworkRound: 2,
      date: 'Hoy',
      dueDate: '2026-08-25',
      dueStatus: 'urgent',
      status: 'In Progress',
      priority: 'High',
      dueText: 'Hoy, 3:00 PM',
      budgetedRoleId: 'Diseñador Gráfico',
      assignee: {
        id: 'u-pao',
        name: 'Pao Morales',
        initials: 'PM',
        avatarBg: 'bg-[#8a4dff]',
        role: 'Diseñador Gráfico'
      },
      tags: ['Ajuste', 'Feedback', 'Urgente']
    },
    {
      id: 't-demo-yamaha',
      title: 'Diseño de key visuals & adaptaciones de campaña',
      description: 'Adaptaciones para redes sociales, carruseles y banners display.',
      department: 'Creatividad & Diseño',
      board: 'Campaña Navidad Yamaha',
      clientName: 'INCOLMOTOS YAMAHA S.A.',
      projectName: 'Campaña Navidad Yamaha',
      budgetedHours: 3.0,
      consumedSeconds: 19800, // 5.5h (desvío presupuestal para decisión de gestión)
      completed: false,
      date: 'Hoy',
      dueDate: '2026-08-25',
      dueStatus: 'normal',
      status: 'In Progress',
      priority: 'High',
      dueText: 'Hoy, 5:00 PM',
      budgetedRoleId: 'Diseñador Gráfico',
      assignee: {
        id: 'u-pao',
        name: 'Pao Morales',
        initials: 'PM',
        avatarBg: 'bg-[#8a4dff]',
        role: 'Diseñador Gráfico'
      },
      tags: ['Navidad', 'Diseño', 'Prioridad Alta']
    },
    {
      id: 't-demo-flamingo',
      title: 'Redacción de copys & guiones para pauta digital',
      description: 'Textos de performance y hooks para campañas de conversión.',
      department: 'Creatividad & Copy',
      board: 'Pauta & Growth Q3',
      clientName: 'FLAMINGO S.A.S.',
      projectName: 'Pauta & Growth Q3',
      budgetedHours: 2.0,
      consumedSeconds: 7920, // 2.2h (variación normal)
      completed: false,
      date: 'Hoy',
      dueDate: '2026-08-25',
      dueStatus: 'normal',
      status: 'In Progress',
      priority: 'Medium',
      dueText: 'Hoy',
      budgetedRoleId: 'Copywriter Creativo',
      assignee: {
        id: 'u-pao',
        name: 'Pao Morales',
        initials: 'PM',
        avatarBg: 'bg-[#8a4dff]',
        role: 'Diseñador Gráfico'
      },
      tags: ['Copywriting', 'Pauta']
    },
    {
      id: 't-demo-explora',
      title: 'Landing Page STEM · Maquetación interactiva',
      description: 'Estructuración de componentes frontend y animaciones.',
      department: 'Desarrollo Web',
      board: 'Landing Page STEM',
      clientName: 'CORPORACION PARQUE EXPLORA',
      projectName: 'Landing Page STEM',
      budgetedHours: 3.0,
      consumedSeconds: 6480, // 1.8h
      completed: false,
      date: 'Mañana',
      dueDate: '2026-08-26',
      dueStatus: 'normal',
      status: 'In Progress',
      priority: 'High',
      dueText: 'Mañana, 12:00 PM',
      budgetedRoleId: 'Desarrollador Web Front-End',
      assignee: {
        id: 'u-pao',
        name: 'Pao Morales',
        initials: 'PM',
        avatarBg: 'bg-[#8a4dff]',
        role: 'Diseñador Gráfico'
      },
      tags: ['Web Dev', 'Frontend']
    },
    {
      id: 't-demo-distrihogar',
      title: 'Actualización de catálogo & stock e-commerce',
      description: 'Carga de nuevos SKUs y banners de temporada.',
      department: 'Mantenimiento Web',
      board: 'Mantenimiento Web E-commerce',
      clientName: 'DISTRIHOGAR S.A.S.',
      projectName: 'Mantenimiento Web',
      budgetedHours: 1.5,
      consumedSeconds: 0,
      completed: false,
      date: 'Próximos días',
      dueDate: '2026-08-27',
      dueStatus: 'normal',
      status: 'To Do',
      priority: 'Low',
      dueText: 'Jueves',
      budgetedRoleId: 'Diseñador Web',
      assignee: {
        id: 'u-pao',
        name: 'Pao Morales',
        initials: 'PM',
        avatarBg: 'bg-[#8a4dff]',
        role: 'Diseñador Gráfico'
      },
      tags: ['Soporte']
    }
  ]);

  // Modal de notificación de extensiones
  const [notifiedTasks, setNotifiedTasks] = useState<Record<string, { extraHours: number; reason: string; timestamp: string }>>({});
  const [chatModalTask, setChatModalTask] = useState<TaskItem | null>(null);
  const [selectedReason, setSelectedReason] = useState('Ajustes de brief no contemplados / cambios solicitados por cliente');
  const [extraHoursEstimate, setExtraHoursEstimate] = useState<number>(2.5);

  // Tareas de hoy (filtradas)
  const todayTasks = localTasks.filter((t) => t.date === 'Hoy');
  const reworkTasks = localTasks.filter((t) => t.isRework && !t.completed);
  const upcomingDeadlines = [...localTasks].sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1));

  // MODELO DE CAPACIDAD ORBIT:
  // Capacidad disponible = Disponibilidad configurada - Carga planificada
  const assignedHoursToday = todayTasks.reduce((acc, t) => acc + (t.budgetedHours || 0), 0); // 6.5h
  const configuredCapacity = configuredCapacityHours; // 8.0h por defecto (L-V)
  const availableCapacityHours = Number(Math.max(0, configuredCapacity - assignedHoursToday).toFixed(1));
  const isOverCapacity = assignedHoursToday > configuredCapacity;

  // Detección de tareas con desvío crítico presupuestal (> 25% del estimado cotizado)
  const criticalOvertimeTasks = localTasks.filter((t) => {
    const consumed = (t.consumedSeconds || 0) / 3600;
    const budgeted = t.budgetedHours || 1;
    return consumed > budgeted * 1.25 && !notifiedTasks[t.id];
  });

  const hasNotifiedAny = Object.keys(notifiedTasks).length > 0;

  // Bucky Contextual Companion State
  const buckyState = resolveBuckyState({
    loggedHoursToday,
    assignedHoursToday,
    configuredCapacityHours: configuredCapacity,
    availableCapacityHours,
    criticalOvertimeTasks,
    isOverCapacity,
    activeTimer,
    allTasksCompleted: localTasks.every((t) => t.completed),
    hasTasks: localTasks.length > 0,
    hasNotifiedOvertime: hasNotifiedAny
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggleLocalTask = (taskId: string) => {
    setLocalTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextVal = !t.completed;
          if (nextVal) {
            showToast('¡Pieza completada! Registrado el avance.');
          }
          return { ...t, completed: nextVal };
        }
        return t;
      })
    );
    onToggleTask(taskId);
  };

  const handleSendChatNotification = () => {
    if (!chatModalTask) return;

    setNotifiedTasks((prev) => ({
      ...prev,
      [chatModalTask.id]: {
        extraHours: extraHoursEstimate,
        reason: selectedReason,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }));

    showToast('Aviso de desvío enviado. El equipo de gestión evaluará redistribución de carga o ajuste de alcance.');
    setChatModalTask(null);
  };

  // Bolsas de Soporte Interno Uhura (No facturables a cliente)
  const supportBags = [
    { id: 'bag-daily', title: 'Daily & Sincronización', hours: 0.5 },
    { id: 'bag-weekly', title: 'Comité Operativo / Weekly', hours: 1.0 },
    { id: 'bag-cultura', title: 'Capacitación & Cultura Uhura', hours: 1.0 },
    { id: 'bag-admin', title: 'Gestión Interna & Soporte', hours: 0.5 }
  ];

  // Semana laboral planificada (Lunes a Viernes)
  const weekPlanDays = [
    { name: 'Lunes', date: '24 Ago', assigned: 4.0, executed: 4.0, available: 4.0, status: 'completed' },
    { name: 'Martes', date: '25 Ago', assigned: assignedHoursToday, executed: loggedHoursToday, available: availableCapacityHours, status: 'today' },
    { name: 'Miércoles', date: '26 Ago', assigned: 4.5, executed: 0, available: 3.5, status: 'planned' },
    { name: 'Jueves', date: '27 Ago', assigned: 4.0, executed: 0, available: 4.0, status: 'planned' },
    { name: 'Viernes', date: '28 Ago', assigned: 3.5, executed: 0, available: 4.5, status: 'planned' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-70 bg-[#0f172a] text-white text-xs px-4 py-3 rounded-2xl shadow-xl border border-[#334155] flex items-center gap-2.5 animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#d4ff4a]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP OPERATIONAL HEADER: GREETING & PRIMARY CTAS */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                Mi Día Operativo · Uhura OS
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0f172a] mt-0.5">
              Hola, Paola 👋
            </h1>
            <p className="text-xs text-[#64748b] mt-0.5">
              Foco en ejecución real, balance de capacidad y control de desvíos en tareas.
            </p>
          </div>

          {/* PRIMARY CTAS: CARGAR TIEMPO / INICIAR TIMER */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* CTA 1: CARGAR TIEMPO MANUAL */}
            <button
              onClick={() => onOpenManualLog()}
              className="px-4 py-2.5 rounded-2xl bg-[#501f92] hover:bg-[#401875] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#d4ff4a]" />
              <span>Cargar tiempo</span>
            </button>

            {/* CTA 2: INICIAR TIMER / TIMER ACTIVO */}
            {activeTimer ? (
              <div className="flex items-center gap-2 bg-[#0f172a] text-white px-3.5 py-2 rounded-2xl border border-[#1e293b]">
                <div className="w-2 h-2 rounded-full bg-[#d4ff4a] animate-pulse" />
                <span className="text-xs font-mono font-bold text-[#d4ff4a]">
                  En curso: {activeTimer.taskTitle.slice(0, 20)}...
                </span>
                <button
                  onClick={onStopTimer}
                  className="ml-1 px-2.5 py-1 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Detener</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const firstPending = localTasks.find((t) => !t.completed);
                  if (firstPending) {
                    onStartTimer(firstPending);
                    showToast(`Cronómetro iniciado en: ${firstPending.title}`);
                  } else {
                    onOpenManualLog();
                  }
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#cbd5e1] text-[#0f172a] text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 text-[#501f92]" />
                <span>Iniciar timer</span>
              </button>
            )}
          </div>
        </div>

        {/* INDICADOR DE CAPACIDAD REAL ORBIT (Sin meta universal de 8h) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 mt-4 border-t border-[#f1f5f9]">
          {/* Carga asignada */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wide block">
              Carga Asignada Hoy
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black font-mono text-[#0f172a]">
                {assignedHoursToday.toFixed(1)}h
              </span>
              <span className="text-xs text-[#64748b]">
                ({todayTasks.length} tareas)
              </span>
            </div>
            <span className="text-[11px] text-[#64748b] block mt-0.5">
              Planificado para la jornada
            </span>
          </div>

          {/* Carga ejecutada */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wide block">
              Carga Ejecutada
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black font-mono text-[#501f92]">
                {loggedHoursToday.toFixed(1)}h
              </span>
              <span className="text-xs text-[#059669] font-medium">
                registradas
              </span>
            </div>
            <span className="text-[11px] text-[#64748b] block mt-0.5">
              Tiempo real sobre misiones
            </span>
          </div>

          {/* Capacidad disponible */}
          <div className="p-3.5 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0]">
            <span className="text-[10px] font-bold text-[#065f46] uppercase tracking-wide block">
              Capacidad Disponible
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black font-mono text-[#047857]">
                +{availableCapacityHours.toFixed(1)}h
              </span>
              <span className="text-xs text-[#065f46] font-medium">
                libres
              </span>
            </div>
            <span className="text-[11px] text-[#065f46] block mt-0.5">
              Disponibilidad - Plan ({configuredCapacity}h base)
            </span>
          </div>

          {/* Diagnóstico de sobrecarga / desvío */}
          <div className={`p-3.5 rounded-2xl border ${
            criticalOvertimeTasks.length > 0 && !hasNotifiedAny
              ? 'bg-[#fef2f2] border-[#fecaca]'
              : isOverCapacity
              ? 'bg-[#fffbeb] border-[#fde68a]'
              : 'bg-[#f8fafc] border-[#f1f5f9]'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wide block text-[#64748b]">
              Diagnóstico de Carga
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {criticalOvertimeTasks.length > 0 && !hasNotifiedAny ? (
                <span className="text-xs font-bold text-[#dc2626] flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                  <span>Desvío presupuestal (+2.5h)</span>
                </span>
              ) : isOverCapacity ? (
                <span className="text-xs font-bold text-[#b45309] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Sobreasignado</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-[#059669] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Capacidad en equilibrio</span>
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#64748b] block mt-0.5">
              {criticalOvertimeTasks.length > 0 && !hasNotifiedAny
                ? 'Yamaha superó cotización'
                : 'Sin sobrecarga de jornada'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN OPERATIONAL GRID: 8 COLS OPERATIONS / 4 COLS CONTEXT & COMPANION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER 8 COLS: EJECUCIÓN PURA */}
        <div className="lg:col-span-8 space-y-6">

          {/* SECCIÓN 1: ¿QUÉ RETRABAJOS / AJUSTES TENGO? */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#fffbeb] text-[#b45309] flex items-center justify-center font-bold">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                    <span>Retrabajos y Ajustes</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                      {reworkTasks.length} pendiente{reworkTasks.length !== 1 ? 's' : ''}
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    Piezas devueltas por cliente o control de calidad que requieren corrección prioritaria.
                  </p>
                </div>
              </div>
            </div>

            {reworkTasks.length > 0 ? (
              <div className="space-y-3">
                {reworkTasks.map((rework) => (
                  <div
                    key={rework.id}
                    className="p-4 rounded-2xl bg-[#fffdf5] border border-[#fde68a] space-y-2.5 transition-all hover:border-[#f59e0b]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#fef3c7] text-[#92400e]">
                            {rework.clientName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Ronda {rework.reworkRound || 1} · {rework.dueText}
                          </span>
                          <span className="text-[10px] text-[#64748b]">
                            Bolsa: <strong>{rework.budgetedRoleId || 'Diseñador Gráfico'}</strong>
                          </span>
                        </div>
                        <h4
                          onClick={() => onOpenTaskDetail(rework.id)}
                          className="text-xs sm:text-sm font-bold text-[#0f172a] hover:text-[#501f92] cursor-pointer transition-colors"
                        >
                          {rework.title}
                        </h4>
                        <p className="text-xs text-[#78350f] font-medium bg-[#fef9c3]/60 px-2.5 py-1 rounded-lg border border-[#fef08a] inline-block">
                          Motivo: {rework.reworkReason}
                        </p>
                      </div>

                      {/* Quick Actions sobre el retrabajo */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => onOpenManualLog(rework.id)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#fef3c7] border border-[#fde68a] text-[#78350f] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Cargar tiempo</span>
                        </button>
                        {activeTimer?.taskId === rework.id ? (
                          <button
                            onClick={onStopTimer}
                            className="px-3 py-1.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span>Detener</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onStartTimer(rework)}
                            className="px-3 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#401875] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                          >
                            <Play className="w-3.5 h-3.5 text-[#d4ff4a]" />
                            <span>Iniciar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9] flex items-center gap-3 text-xs text-[#64748b]">
                <ShieldCheck className="w-5 h-5 text-[#10b981] shrink-0" />
                <span>Sin retrabajos pendientes. Todas las entregas aprobadas sin observaciones.</span>
              </div>
            )}
          </div>

          {/* SECCIÓN 2: ¿QUÉ TENGO QUE HACER HOY? (MISIONES ACTIVAS) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                  <span>¿Qué tengo que hacer hoy?</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b] font-medium">
                    {todayTasks.length} misiones
                  </span>
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Piezas asignadas para hoy. Marca avance, inicia el timer o carga tiempo con un clic.
                </p>
              </div>

              <span className="text-xs font-bold text-[#501f92] bg-[#f5f3ff] px-2.5 py-1 rounded-xl border border-[#ddd6fe]">
                Total plan: {assignedHoursToday.toFixed(1)}h
              </span>
            </div>

            {/* Listado de tareas */}
            <div className="space-y-3">
              {todayTasks.map((task) => {
                const consumedHrs = (task.consumedSeconds || 0) / 3600;
                const budgetedHrs = task.budgetedHours || 1;
                const ratio = consumedHrs / budgetedHrs;
                const isCriticalOver = ratio > 1.25;
                const isSlightOver = ratio > 1.0 && ratio <= 1.25;
                const isTimerActive = activeTimer?.taskId === task.id;
                const isNotified = notifiedTasks[task.id];
                const excessHours = Math.max(0, consumedHrs - budgetedHrs).toFixed(1);

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isTimerActive
                        ? 'border-[#8a4dff] bg-[#fbf9ff] shadow-xs'
                        : task.completed
                        ? 'border-[#e2e8f0] bg-[#f8fafc]/60 opacity-60'
                        : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: Checkbox & Task info */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => handleToggleLocalTask(task.id)}
                          className="mt-0.5 text-[#64748b] hover:text-[#501f92] cursor-pointer transition-colors shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-[#10b981] fill-[#ecfdf5]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#cbd5e1] hover:text-[#94a3b8]" />
                          )}
                        </button>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[#334155] truncate max-w-[150px]">
                              {task.clientName || 'Cliente'}
                            </span>
                            <span className="text-[#94a3b8] text-xs">›</span>
                            <span className="text-[10px] text-[#64748b] truncate max-w-[180px]">
                              {task.projectName || task.board}
                            </span>
                            <span className="text-[10px] text-[#64748b] bg-[#f8fafc] px-2 py-0.5 rounded border border-[#e2e8f0]">
                              Rol: {task.budgetedRoleId || 'Diseñador'}
                            </span>

                            {/* Alerta de Desvío / Protección */}
                            {isCriticalOver && !isNotified && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] flex items-center gap-1">
                                <AlertOctagon className="w-3 h-3" />
                                Desvío (+{excessHours}h)
                              </span>
                            )}
                            {isCriticalOver && isNotified && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5f3ff] text-[#7c3aed] border border-[#ddd6fe] flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Protegido (+{isNotified.extraHours}h en cotización)
                              </span>
                            )}
                            {isSlightOver && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
                                En tolerancia (+{excessHours}h)
                              </span>
                            )}
                          </div>

                          <p
                            onClick={() => onOpenTaskDetail(task.id)}
                            className={`text-sm font-bold cursor-pointer hover:text-[#501f92] transition-colors truncate ${
                              task.completed ? 'line-through text-[#64748b]' : 'text-[#0f172a]'
                            }`}
                          >
                            {task.title}
                          </p>
                        </div>
                      </div>

                      {/* Right: Consumption & Timer actions */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-[#64748b] block font-medium">Consumido</span>
                          <span
                            className={`text-xs font-mono font-bold ${
                              isCriticalOver && !isNotified
                                ? 'text-[#dc2626]'
                                : isSlightOver
                                ? 'text-[#b45309]'
                                : 'text-[#0f172a]'
                            }`}
                          >
                            {consumedHrs.toFixed(1)}h / {budgetedHrs.toFixed(1)}h
                          </span>
                        </div>

                        {/* Botón Cargar manual sobre tarea */}
                        <button
                          onClick={() => onOpenManualLog(task.id)}
                          className="p-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] cursor-pointer transition-colors"
                          title="Cargar horas manuales sobre esta tarea"
                        >
                          <Clock className="w-4 h-4" />
                        </button>

                        {/* Botón Start / Stop Timer */}
                        {isTimerActive ? (
                          <button
                            onClick={onStopTimer}
                            className="px-3 py-1.5 rounded-xl bg-[#dc2626] text-white hover:bg-[#b91c1c] cursor-pointer transition-colors shadow-2xs text-xs font-bold flex items-center gap-1"
                            title="Detener cronómetro y registrar"
                          >
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span>Detener</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onStartTimer(task)}
                            className="p-2 rounded-xl bg-[#501f92] text-white hover:bg-[#401875] cursor-pointer transition-colors shadow-2xs"
                            title="Iniciar cronómetro sobre esta tarea"
                          >
                            <Play className="w-4 h-4 text-[#d4ff4a]" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Barra de consumo vs cotización */}
                    <div className="mt-2.5 w-full h-1.5 rounded-full bg-[#f1f5f9] overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, (consumedHrs / budgetedHrs) * 100)}%` }}
                        className={`h-full transition-all duration-300 ${
                          isCriticalOver && !isNotified
                            ? 'bg-[#ef4444]'
                            : isCriticalOver && isNotified
                            ? 'bg-[#8a4dff]'
                            : isSlightOver
                            ? 'bg-[#f59e0b]'
                            : 'bg-[#10b981]'
                        }`}
                      />
                    </div>

                    {/* Notificación de desvío para no asumir costos en silencio */}
                    {isCriticalOver && !isNotified && (
                      <div className="mt-3 p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <span className="text-xs text-[#991b1b] leading-tight">
                          Esta pieza superó el tiempo estimado (+{excessHours}h). Avisa al equipo para cotizar los ajustes con el cliente.
                        </span>
                        <button
                          onClick={() => {
                            setChatModalTask(task);
                            setExtraHoursEstimate(Math.max(1.0, Number(excessHours)));
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Avisar en chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECCIÓN 3: ¿QUÉ DEADLINES TENGO PRÓXIMOS? */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#501f92]" />
                <h3 className="text-sm font-bold text-[#0f172a]">
                  ¿Qué deadlines tengo próximos?
                </h3>
              </div>
              <span className="text-[11px] text-[#64748b]">
                Orden cronológico de entrega
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingDeadlines.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onOpenTaskDetail(item.id)}
                  className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#cbd5e1] cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#334155] uppercase truncate max-w-[110px]">
                      {item.clientName}
                    </span>
                    <span className={`font-bold px-1.5 py-0.2 rounded-md ${
                      item.dueStatus === 'urgent'
                        ? 'bg-[#fee2e2] text-[#dc2626]'
                        : 'bg-[#eff6ff] text-[#1d4ed8]'
                    }`}>
                      {item.dueText}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#0f172a] line-clamp-1">
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#64748b] pt-0.5">
                    <span>Presupuesto: {item.budgetedHours}h</span>
                    <span className="text-[#501f92] font-semibold">Ver detalle →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN 4: ¿CÓMO ESTÁ MI SEMANA? (LUNES A VIERNES) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#f1f5f9]">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                  <span>¿Cómo está mi semana?</span>
                  <span className="text-xs font-medium text-[#64748b]">(Lunes a Viernes)</span>
                </h3>
                <p className="text-[11px] text-[#64748b]">
                  Carga planificada vs disponibilidad habitual. Sábado y domingo no cuentan como capacidad esperada.
                </p>
              </div>

              <span className="text-[11px] text-[#059669] font-bold px-2.5 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] shrink-0 self-start sm:self-auto">
                Semana balanceada
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {weekPlanDays.map((d) => (
                <div
                  key={d.name}
                  className={`p-3 rounded-2xl border space-y-1.5 ${
                    d.status === 'today'
                      ? 'bg-[#fbf9ff] border-2 border-[#8a4dff] shadow-xs'
                      : d.status === 'completed'
                      ? 'bg-white border-[#e2e8f0]'
                      : 'bg-[#f8fafc] border-[#f1f5f9]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${d.status === 'today' ? 'text-[#501f92]' : 'text-[#0f172a]'}`}>
                      {d.name}
                    </span>
                    <span className="text-[10px] text-[#64748b]">{d.date}</span>
                  </div>

                  <div className="space-y-0.5">
                    <p className="font-mono text-xs font-bold text-[#0f172a]">
                      {d.assigned.toFixed(1)}h <span className="text-[10px] font-normal text-[#64748b]">plan</span>
                    </p>
                    <span className="text-[10px] text-[#059669] font-semibold block">
                      +{d.available.toFixed(1)}h libres
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[#e2e8f0] overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, (d.assigned / 8) * 100)}%` }}
                      className={`h-full rounded-full ${
                        d.status === 'today'
                          ? 'bg-[#8a4dff]'
                          : d.status === 'completed'
                          ? 'bg-[#10b981]'
                          : 'bg-[#3b82f6]'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[#64748b] leading-relaxed pt-1">
              * La disponibilidad estándar de Uhura se planifica de lunes a viernes. Si realizas labores extraordinarias en fin de semana, Orbit te permite registrarlas con total libertad sin computarlas como cuota pendiente.
            </p>
          </div>
        </div>

        {/* RIGHT 4 COLS: BUCKY ACOMPAÑANTE CONTEXTUAL & ATAJOS */}
        <div className="lg:col-span-4 space-y-6">

          {/* TARJETA BUCKY EL CASTOR (COMPACTA, ELEGANTE, NO INVASIVA) */}
          <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-xs relative">
            {/* Header Bucky Status */}
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${buckyState.badgeColor}`}>
                  {buckyState.badgeText}
                </span>
              </div>
              <span className="text-[11px] text-[#64748b]">
                Acompañante Contextual
              </span>
            </div>

            {/* Bucky Stage Proporcionado */}
            <div className="py-3 flex flex-col items-center text-center space-y-2">
              {/* Dialogue Bubble */}
              <div className="w-full max-w-[260px] animate-in fade-in">
                <div
                  className={`text-xs font-medium px-3.5 py-2.5 rounded-2xl shadow-2xs text-center border ${
                    buckyState.isAlert
                      ? 'bg-[#fff5f5] border-[#fecaca] text-[#991b1b]'
                      : 'bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]'
                  }`}
                >
                  {buckyState.speech}
                </div>
                <div
                  className={`w-2.5 h-2.5 transform rotate-45 mx-auto -mt-1 border-r border-b ${
                    buckyState.isAlert
                      ? 'bg-[#fff5f5] border-[#fecaca]'
                      : 'bg-[#f8fafc] border-[#e2e8f0]'
                  }`}
                />
              </div>

              {/* Bucky Cutout Image con buzo morado Uhura oficial (~100px compacto) */}
              <div className="relative flex flex-col items-center pt-1">
                <img
                  src={buckyState.image}
                  alt="Bucky el Castor"
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 object-contain select-none transition-transform duration-200 hover:scale-105"
                />
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#0f172a]">
                  {buckyState.headline}
                </h4>
                <p className="text-[11px] text-[#64748b] max-w-xs mt-0.5 leading-relaxed">
                  {buckyState.description}
                </p>
              </div>

              {/* Botón de visita discreta a La Colonia */}
              {onNavigateToView && (
                <button
                  onClick={() => onNavigateToView('la-colonia')}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-bold text-[#501f92] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>🪵 Visitar La Colonia de Bucky</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ATAJOS RÁPIDOS DE CARGA DE TIEMPO */}
          <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
                Carga Rápida de Horas
              </h4>
              <button
                onClick={() => onOpenManualLog()}
                className="text-xs text-[#501f92] font-bold hover:underline cursor-pointer"
              >
                Manual +
              </button>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Registra bloques directos en tu tarea prioritaria en curso:
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  const target = localTasks.find((t) => !t.completed) || localTasks[0];
                  if (target) {
                    onQuickLogHours(0.5, '30m avance operativo', 'client', target.projectName);
                    showToast(`+30m cargados en ${target.title}`);
                  }
                }}
                className="py-2 px-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-bold text-[#0f172a] transition-all cursor-pointer flex flex-col items-center"
              >
                <span>+30m</span>
                <span className="text-[10px] text-[#64748b] font-normal">Bloque</span>
              </button>

              <button
                onClick={() => {
                  const target = localTasks.find((t) => !t.completed) || localTasks[0];
                  if (target) {
                    onQuickLogHours(1.0, '1h producción continua', 'client', target.projectName);
                    showToast(`+1h cargada en ${target.title}`);
                  }
                }}
                className="py-2 px-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-bold text-[#0f172a] transition-all cursor-pointer flex flex-col items-center"
              >
                <span>+1h</span>
                <span className="text-[10px] text-[#64748b] font-normal">1 hora</span>
              </button>

              <button
                onClick={() => {
                  const target = localTasks.find((t) => !t.completed) || localTasks[0];
                  if (target) {
                    onQuickLogHours(2.0, '2h sprint enfocado', 'client', target.projectName);
                    showToast(`+2h cargadas en ${target.title}`);
                  }
                }}
                className="py-2 px-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-bold text-[#0f172a] transition-all cursor-pointer flex flex-col items-center"
              >
                <span>+2h</span>
                <span className="text-[10px] text-[#64748b] font-normal">Sprint</span>
              </button>
            </div>
          </div>

          {/* BOLSAS DE SOPORTE INTERNO (UHURA GROUP) */}
          <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
                  Soporte Interno Uhura
                </h4>
                <p className="text-[11px] text-[#64748b]">
                  Actividades no facturables a clientes
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b] font-medium">
                Interno
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {supportBags.map((bag) => (
                <button
                  key={bag.id}
                  onClick={() => {
                    onQuickLogHours(bag.hours, bag.title, 'internal', 'Uhura Group');
                    showToast(`+${bag.hours}h registradas en ${bag.title}`);
                  }}
                  className="p-2.5 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-white hover:border-[#cbd5e1] text-left transition-all cursor-pointer flex flex-col justify-between gap-1 shadow-2xs"
                >
                  <span className="text-xs font-medium text-[#0f172a] line-clamp-1">
                    {bag.title}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#501f92]">
                    +{bag.hours}h
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MODAL DE NOTIFICACIÓN DE EXTENSIÓN AL EQUIPO */}
      {chatModalTask && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setChatModalTask(null);
          }}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95">
            {/* Header */}
            <div className="px-5 py-4 bg-[#0f172a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertOctagon className="w-5 h-5 text-[#f87171]" />
                <div>
                  <h3 className="font-bold text-sm text-white">Avisar Desvío al Equipo</h3>
                  <p className="text-[11px] text-[#94a3b8]">Visibilidad para redistribución de carga o ajuste de alcance</p>
                </div>
              </div>
              <button
                onClick={() => setChatModalTask(null)}
                className="text-[#94a3b8] hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#64748b]">
                  <span className="font-bold text-[#0f172a]">{chatModalTask.clientName}</span>
                  <span className="font-mono">
                    {((chatModalTask.consumedSeconds || 0) / 3600).toFixed(1)}h de {chatModalTask.budgetedHours}h presupuestadas
                  </span>
                </div>
                <p className="text-xs font-bold text-[#0f172a]">{chatModalTask.title}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#475569] tracking-wider block">
                  Motivo de la variación:
                </label>
                <div className="space-y-1.5">
                  {[
                    'Ajustes de brief no contemplados / cambios solicitados por cliente',
                    'Ronda adicional de correcciones de copy o diseño',
                    'Complejidad técnica imprevista / refactor requerido',
                    'Espera o retraso en entrega de insumos por parte del cliente'
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedReason(reason)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                        selectedReason === reason
                          ? 'bg-[#f5f3ff] border-[#8a4dff] text-[#501f92] font-bold'
                          : 'bg-white border-[#e2e8f0] text-[#334155] hover:bg-[#f8fafc]'
                      }`}
                    >
                      <span>{reason}</span>
                      {selectedReason === reason && (
                        <Check className="w-4 h-4 text-[#8a4dff] shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase text-[#475569] tracking-wider">
                    Tiempo adicional estimado:
                  </label>
                  <span className="font-mono font-bold text-sm text-[#0f172a]">
                    +{extraHoursEstimate.toFixed(1)} horas
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1.0, 2.0, 2.5, 4.0].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setExtraHoursEstimate(h)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        extraHoursEstimate === h
                          ? 'bg-[#0f172a] text-white border-[#0f172a]'
                          : 'bg-[#f8fafc] text-[#334155] border-[#e2e8f0] hover:border-[#cbd5e1]'
                      }`}
                    >
                      +{h}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Message preview */}
              <div className="p-3 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] text-[#1e293b] font-mono text-[11px] leading-relaxed">
                &ldquo;Equipo, en la tarea <strong>&apos;{chatModalTask.title}&apos;</strong> ({chatModalTask.clientName}) necesitaremos ~{extraHoursEstimate}h adicionales por: <em>{selectedReason}</em>. Les aviso para coordinar cotización con el cliente o reasignar tiempos.&rdquo;
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setChatModalTask(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#64748b] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendChatNotification}
                className="px-4 py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#a78bfa]" />
                <span>Enviar aviso al equipo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
