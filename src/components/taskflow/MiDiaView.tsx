import React, { useState, useEffect } from 'react';
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
  Pause,
  Square,
  Plus,
  Sparkles,
  AlertTriangle,
  Send,
  Users2,
  ChevronRight,
  ShieldCheck,
  Check,
  MessageSquare,
  AlertOctagon,
  X,
  Radio,
  Copy,
  Download,
  Flame,
  Zap,
  Coffee,
  Heart,
  HelpCircle,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface MiDiaViewProps {
  tasks: TaskItem[];
  activeTimer: ActiveTimerState | null;
  onStartTimer: (task: TaskItem) => void;
  onPauseResumeTimer: () => void;
  onStopTimer: () => void;
  onOpenTaskDetail: (taskId: string) => void;
  onOpenManualLog: (taskId?: string) => void;
  onToggleTask: (taskId: string) => void;
  onQuickLogHours: (hours: number, label: string, category: 'client' | 'internal', projectName?: string) => void;
  loggedHoursToday: number;
  targetDayHours: number;
  onNavigateToView: (view: OrbitView) => void;
}

interface ColonyMember {
  id: string;
  name: string;
  role: string;
  avatarBg: string;
  hoursLogged: number;
  capacityHours: number;
  status: 'balanced' | 'building' | 'overloaded';
  consistencyDays: number;
  statusNote: string;
}

export const MiDiaView: React.FC<MiDiaViewProps> = ({
  tasks,
  activeTimer,
  onStartTimer,
  onPauseResumeTimer,
  onStopTimer,
  onOpenTaskDetail,
  onOpenManualLog,
  onToggleTask,
  onQuickLogHours,
  loggedHoursToday = 5.5,
  targetDayHours = 8.0,
  onNavigateToView
}) => {
  const [consistencyDays, setConsistencyDays] = useState(6);
  const [activeTab, setActiveTab] = useState<'habitat' | 'colonia'>('habitat');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [supportedMembers, setSupportedMembers] = useState<Record<string, boolean>>({});

  // Real-world tasks representing construction blocks in the Orbit Habitat
  const [localTasks, setLocalTasks] = useState<TaskItem[]>([
    {
      id: 't-demo-yamaha',
      title: 'Diseño de key visuals & adaptaciones de campaña',
      description: 'Adaptaciones para redes sociales, carruseles y banners display.',
      department: 'Creatividad & Diseño',
      board: 'Campaña Navidad Yamaha',
      clientName: 'INCOLMOTOS YAMAHA S.A.',
      projectName: 'Campaña Navidad Yamaha',
      budgetedHours: 3.0,
      consumedSeconds: 19800, // 5.5h (sobrecarga / desvío)
      completed: false,
      date: 'Hoy',
      dueDate: '2026-03-30',
      dueStatus: 'normal',
      status: 'In Progress',
      priority: 'High',
      dueText: 'Hoy, 5:00 PM',
      assignee: {
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
      consumedSeconds: 7920, // 2.2h (+0.2h variación normal en tolerancia)
      completed: false,
      date: 'Hoy',
      dueDate: '2026-03-30',
      dueStatus: 'normal',
      status: 'In Progress',
      priority: 'Medium',
      dueText: 'Hoy',
      assignee: {
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
      consumedSeconds: 6480, // 1.8h (en tiempo)
      completed: false,
      date: 'Hoy',
      dueDate: '2026-03-31',
      dueStatus: 'normal',
      status: 'In Progress',
      priority: 'High',
      dueText: 'Mañana',
      assignee: {
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
      date: 'Hoy',
      dueDate: '2026-04-01',
      dueStatus: 'normal',
      status: 'To Do',
      priority: 'Low',
      dueText: 'En cola',
      assignee: {
        name: 'Pao Morales',
        initials: 'PM',
        avatarBg: 'bg-[#8a4dff]',
        role: 'Diseñador Gráfico'
      },
      tags: ['Soporte']
    }
  ]);

  // Notifications map for extensions: taskId -> details
  const [notifiedTasks, setNotifiedTasks] = useState<Record<string, { extraHours: number; reason: string; timestamp: string }>>({});
  const [chatModalTask, setChatModalTask] = useState<TaskItem | null>(null);
  const [selectedReason, setSelectedReason] = useState('Ajustes de brief no contemplados / cambios solicitados por cliente');
  const [extraHoursEstimate, setExtraHoursEstimate] = useState<number>(2.5);

  // Colony Members (Uhura team in harmonious equilibrium)
  const [colonyMembers, setColonyMembers] = useState<ColonyMember[]>([
    {
      id: 'usr-pao',
      name: 'Paola (Tú)',
      role: 'Lead PM & Producto',
      avatarBg: 'bg-[#501f92]',
      hoursLogged: loggedHoursToday,
      capacityHours: 8.0,
      status: loggedHoursToday > 8.5 ? 'overloaded' : 'balanced',
      consistencyDays: consistencyDays,
      statusNote: 'Construyendo con el equipo y balanceando entregas.'
    },
    {
      id: 'usr-cata',
      name: 'Catalina T.',
      role: 'Directora Comercial',
      avatarBg: 'bg-[#ec4899]',
      hoursLogged: 6.5,
      capacityHours: 8.0,
      status: 'balanced',
      consistencyDays: 8,
      statusNote: 'Revisando acuerdos y cotizaciones con Yamaha.'
    },
    {
      id: 'usr-luisa',
      name: 'Luisa U.',
      role: 'Operaciones & PM',
      avatarBg: 'bg-[#0284c7]',
      hoursLogged: 7.0,
      capacityHours: 8.0,
      status: 'balanced',
      consistencyDays: 14,
      statusNote: 'Supervisando estabilidad de cronograma.'
    },
    {
      id: 'usr-diego',
      name: 'Diego G.',
      role: 'Creative Designer',
      avatarBg: 'bg-[#8b5cf6]',
      hoursLogged: 5.0,
      capacityHours: 8.0,
      status: 'building',
      consistencyDays: 4,
      statusNote: 'Bloques visuales de campaña en fase de pulido.'
    },
    {
      id: 'usr-cami',
      name: 'Camilo V.',
      role: 'Growth & Media Lead',
      avatarBg: 'bg-[#f59e0b]',
      hoursLogged: 2.0,
      capacityHours: 8.0,
      status: 'building',
      consistencyDays: 3,
      statusNote: 'Configurando pauta de conversión.'
    },
    {
      id: 'usr-ana',
      name: 'Ana María G.',
      role: 'CEO & Dirección',
      avatarBg: 'bg-[#10b981]',
      hoursLogged: 7.5,
      capacityHours: 8.0,
      status: 'balanced',
      consistencyDays: 21,
      statusNote: 'Equilibrio financiero y planeación estratégica.'
    }
  ]);

  // Operational metrics
  const totalAssignedToday = localTasks.reduce((acc, t) => acc + (t.budgetedHours || 0), 0);
  const totalExecutedToday = localTasks.reduce((acc, t) => acc + ((t.consumedSeconds || 0) / 3600), 0);
  const allTasksCompleted = localTasks.every((t) => t.completed);
  const completedCount = localTasks.filter((t) => t.completed).length;

  // Detect critical overtime tasks that have not been notified
  const criticalOvertimeTasks = localTasks.filter((t) => {
    const consumed = (t.consumedSeconds || 0) / 3600;
    const budgeted = t.budgetedHours || 1;
    return consumed > budgeted * 1.25 && !notifiedTasks[t.id];
  });

  const hasNotifiedAny = Object.keys(notifiedTasks).length > 0;
  const isOverloaded = loggedHoursToday > 8.5 || criticalOvertimeTasks.length > 0;

  // Emit event to Bucky's floating mascot companion
  const notifyMascot = (action: string, phrase: string) => {
    window.dispatchEvent(
      new CustomEvent('orbit-mascot-reaction', {
        detail: { action, phrase }
      })
    );
  };

  // Automated Bucky Runtime State via central resolveBuckyState
  const buckyState = resolveBuckyState({
    loggedHoursToday,
    targetDayHours: 8.0,
    criticalOvertimeTasks,
    activeTimer,
    allTasksCompleted,
    hasTasks: localTasks.length > 0,
    hasNotifiedOvertime: hasNotifiedAny
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Handling task completion -> Bucky applauds
  const handleToggleLocalTask = (taskId: string) => {
    setLocalTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextVal = !t.completed;
          if (nextVal) {
            notifyMascot('clap', '¡Pieza lista! 👏 Estructura reforzada.');
            showToast('¡Pieza completada! Bucky aplaude el avance 👏');
          }
          return { ...t, completed: nextVal };
        }
        return t;
      })
    );
    onToggleTask(taskId);
  };

  // Handling hour registration -> Bucky adjusts habitat block
  const handleLogResource = (hours: number, label: string) => {
    onQuickLogHours(hours, label, 'internal', 'Uhura Group');
    notifyMascot('stretch', `Acomodando pieza en el hábitat... +${hours}h de recurso registrado 🪵`);
    showToast(`Recurso registrado (+${hours}h). Pieza encajada en el hábitat.`);
  };

  // Handling team support action
  const handleSupportMember = (member: ColonyMember) => {
    setSupportedMembers((prev) => ({ ...prev, [member.id]: true }));
    showToast(`Mensaje de coordinación enviado a ${member.name.split(' ')[0]}.`);
  };

  // Handling project extension notice
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

    notifyMascot('wave', 'Aviso enviado al equipo. Proyecto protegido y balance asegurado 🛡️');
    showToast('Aviso de extensión enviado. El ejecutivo ya cuenta con el detalle para recotizar.');
    setChatModalTask(null);
  };

  // Clean support bags (Uhura non-billables)
  const supportBags = [
    {
      id: 'bag-weekly',
      title: 'Comité Operativo / Weekly',
      hours: 1.0,
      icon: Users2
    },
    {
      id: 'bag-mgmt',
      title: 'Gestión & Coordinación',
      hours: 1.0,
      icon: MessageSquare
    },
    {
      id: 'bag-training',
      title: 'Capacitación / Lab Uhura',
      hours: 2.0,
      icon: Sparkles
    },
    {
      id: 'bag-medical',
      title: 'Permiso Personal / Cita',
      hours: 2.0,
      icon: Heart
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#0f172a] text-white px-4 py-2.5 rounded-2xl border border-[#334155] shadow-xl flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-[#a78bfa] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean Top Bar: Orbit Habitat Status & Balance */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Orbit Habitat · La Colonia Orbital
              </span>
              <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${buckyState.badgeColor}`}>
                {buckyState.badgeText}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a]">
              Hola Paola, construyamos en equilibrio
            </h1>
            <p className="text-xs text-[#64748b]">
              Orbit mantiene la colonia saludable: cuidamos que cada proyecto avance sin sobrecargar al equipo.
            </p>
          </div>

          {/* Navigation Tab: Mi Hábitat vs La Colonia */}
          <div className="flex items-center gap-2 bg-[#f8fafc] p-1 rounded-2xl border border-[#e2e8f0] text-xs font-medium self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab('habitat')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'habitat'
                  ? 'bg-white text-[#0f172a] font-bold shadow-xs border border-[#e2e8f0]'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Mi Día
            </button>
            <button
              onClick={() => setActiveTab('colonia')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'colonia'
                  ? 'bg-white text-[#0f172a] font-bold shadow-xs border border-[#e2e8f0]'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Users2 className="w-3.5 h-3.5 text-[#64748b]" />
              <span>La Colonia</span>
            </button>
          </div>
        </div>

        {/* 4 Clean System Pillars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#f1f5f9]">
          <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wide block">
              Misiones Activas
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-[#0f172a]">{localTasks.length} bloques</span>
              <span className="text-xs text-[#64748b]">({completedCount} listos)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wide block">
              Recurso Registrado
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-[#0f172a] font-mono">{totalExecutedToday.toFixed(1)}h</span>
              <span className="text-xs text-[#64748b]">invertidas hoy</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wide block">
              Estabilidad
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {criticalOvertimeTasks.length > 0 ? (
                <span className="text-xs font-bold text-[#dc2626] flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Demasiado peso (+2.5h)
                </span>
              ) : hasNotifiedAny ? (
                <span className="text-xs font-bold text-[#7c3aed] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Proyecto protegido
                </span>
              ) : (
                <span className="text-xs font-bold text-[#059669] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Sin pendientes de registro
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wide block">
              Consistencia
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Flame className="w-3.5 h-3.5 text-[#ea580c] fill-[#ea580c]" />
              <span className="text-xs font-bold text-[#0f172a]">
                {consistencyDays} días en equilibrio
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: MI HÁBITAT (VERY CLEAN MI DÍA) */}
      {activeTab === 'habitat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 5 COLS: Bucky el Castor & Carga de Recurso */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs relative">
              {/* Header Status */}
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${buckyState.badgeColor}`}>
                  {buckyState.badgeText}
                </span>
                <span className="text-xs text-[#64748b]">
                  Compañero de colonia
                </span>
              </div>

              {/* Bucky Stage with Dialogue Bubble */}
              <div className="py-4 flex flex-col items-center text-center">
                {/* Clean Speech Bubble */}
                <div className="mb-2 max-w-[290px] animate-in fade-in zoom-in-95">
                  <div
                    className={`text-xs font-medium px-4 py-2.5 rounded-2xl shadow-sm text-center border ${
                      buckyState.isAlert
                        ? 'bg-[#fff5f5] border-[#fecaca] text-[#991b1b]'
                        : 'bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]'
                    }`}
                  >
                    {buckyState.speech}
                  </div>
                  {/* Bubble Pointer */}
                  <div
                    className={`w-3 h-3 transform rotate-45 mx-auto -mt-1.5 border-r border-b ${
                      buckyState.isAlert
                        ? 'bg-[#fff5f5] border-[#fecaca]'
                        : 'bg-[#f8fafc] border-[#e2e8f0]'
                    }`}
                  />
                </div>

                {/* Beaver Cutout Image */}
                <div className="relative group flex flex-col items-center">
                  <img
                    src={buckyState.image}
                    alt="Bucky el Castor de Orbit"
                    referrerPolicy="no-referrer"
                    className="w-60 sm:w-72 h-72 sm:h-80 object-contain select-none transition-transform duration-300 hover:scale-102"
                  />
                </div>

                {/* Subtitle description */}
                <h3 className="text-base font-bold text-[#0f172a] mt-3">
                  {buckyState.headline}
                </h3>
                <p className="text-xs text-[#64748b] max-w-sm mt-1 leading-relaxed">
                  {buckyState.description}
                </p>

                {/* Banner de acceso a La Colonia */}
                <div className="mt-4 w-full p-4 rounded-2xl bg-gradient-to-r from-[#1c0e38] to-[#140b24] border border-[#8a4dff]/40 text-left space-y-2 text-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🪵✨</span>
                      <span className="text-xs font-black text-[#d4ff4a] uppercase tracking-wider">
                        La Colonia de Bucky
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#501f92] text-white font-bold">
                      Nivel 1
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c9b7ff] leading-relaxed">
                    Tus hábitos de orden y prevención de hoy generan recursos para el hábitat de Bucky.
                  </p>
                  <button
                    onClick={() => onNavigateToView?.('la-colonia')}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#501f92] to-[#8a4dff] hover:from-[#43197a] hover:to-[#7c3aed] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Visitar La Colonia</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Overtime Alert Action Banner */}
                {criticalOvertimeTasks.length > 0 && (
                  <div className="mt-4 w-full p-4 rounded-2xl bg-[#fef2f2] border border-[#fecaca] text-left space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#dc2626]">
                      <AlertOctagon className="w-4 h-4 shrink-0" />
                      <span>Desvío en {criticalOvertimeTasks[0].projectName}</span>
                    </div>
                    <p className="text-xs text-[#991b1b] leading-relaxed">
                      Esta pieza superó el recurso asignado (+2.5h). Para no asumir el costo en silencio, avisa en el canal del proyecto para cotizar o reasignar.
                    </p>
                    <button
                      onClick={() => {
                        setChatModalTask(criticalOvertimeTasks[0]);
                        setExtraHoursEstimate(2.5);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Avisar extensión al equipo</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Clean Quick Task Time Logging */}
              <div className="pt-4 border-t border-[#f1f5f9] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#334155]">Registrar tiempo rápido</span>
                  <button
                    onClick={() => onOpenManualLog()}
                    className="text-[#501f92] hover:text-[#381566] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Carga manual</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      const firstTask = localTasks.find(t => !t.completed) || localTasks[0];
                      if (firstTask) {
                        onQuickLogHours(0.5, '30m avance operativo', 'client', firstTask.projectName);
                        showToast(`+30m registrados en ${firstTask.title}`);
                      }
                    }}
                    className="py-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-bold text-[#0f172a] transition-all cursor-pointer flex flex-col items-center"
                  >
                    <span>+30 min</span>
                    <span className="text-[10px] text-[#64748b] font-normal">Bloque corto</span>
                  </button>

                  <button
                    onClick={() => {
                      const firstTask = localTasks.find(t => !t.completed) || localTasks[0];
                      if (firstTask) {
                        onQuickLogHours(1.0, '1h producción continua', 'client', firstTask.projectName);
                        showToast(`+1h registrada en ${firstTask.title}`);
                      }
                    }}
                    className="py-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-bold text-[#0f172a] transition-all cursor-pointer flex flex-col items-center"
                  >
                    <span>+1 hora</span>
                    <span className="text-[10px] text-[#64748b] font-normal">1 bloque</span>
                  </button>

                  <button
                    onClick={() => {
                      const firstTask = localTasks.find(t => !t.completed) || localTasks[0];
                      if (firstTask) {
                        onQuickLogHours(2.0, '2h sprint enfocado', 'client', firstTask.projectName);
                        showToast(`+2h registradas en ${firstTask.title}`);
                      }
                    }}
                    className="py-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-bold text-[#0f172a] transition-all cursor-pointer flex flex-col items-center"
                  >
                    <span>+2 horas</span>
                    <span className="text-[10px] text-[#64748b] font-normal">Sprint</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Clean Support Bags (No-facturables Uhura) */}
            <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
                    Bolsas de Soporte Interno
                  </h4>
                  <p className="text-[11px] text-[#64748b]">
                    Actividades operativas internas de Uhura (Lunes a Viernes)
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b] font-medium">
                  Interno
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {supportBags.map((bag) => {
                  const Icon = bag.icon;
                  return (
                    <button
                      key={bag.id}
                      onClick={() => handleLogResource(bag.hours, bag.title)}
                      className="p-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-white hover:border-[#cbd5e1] text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="w-4 h-4 text-[#64748b]" />
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#0f172a] border border-[#e2e8f0]">
                          +{bag.hours}h
                        </span>
                      </div>
                      <span className="text-xs font-medium text-[#0f172a] line-clamp-1">
                        {bag.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT 7 COLS: Misiones de hoy (Tus tareas reales) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Active Timer Pill if running (Start / Stop canonical model, no pause) */}
            {activeTimer && (
              <div className="bg-[#0f172a] p-4 rounded-3xl text-white border border-[#1e293b] shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/10 text-[#d4ff4a] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#94a3b8]">
                      Cronómetro activo · {activeTimer.clientName}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate">
                      {activeTimer.taskTitle}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={onStopTimer}
                    className="px-3.5 py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Detener y Registrar</span>
                  </button>
                </div>
              </div>
            )}

            {/* Misiones de hoy (Tus tareas reales) */}
            <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div>
                  <h3 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                    <span>Misiones de hoy</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b] font-medium">
                      Tus tareas reales ({localTasks.length})
                    </span>
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Piezas asignadas para hoy. Cada tarea completada refuerza la estabilidad de la colonia.
                  </p>
                </div>

                <button
                  onClick={() => onNavigateToView('tareas')}
                  className="text-xs font-bold text-[#501f92] hover:text-[#8a4dff] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Ver todas ({tasks.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Task Items List */}
              <div className="space-y-3">
                {localTasks.map((task) => {
                  const isTimerActive = activeTimer?.taskId === task.id;
                  const consumedHrs = Number(((task.consumedSeconds || 0) / 3600).toFixed(1));
                  const budgetedHrs = Number((task.budgetedHours || 1).toFixed(1));
                  const ratio = consumedHrs / budgetedHrs;
                  const isSlightOver = ratio > 1.0 && ratio <= 1.25;
                  const isCriticalOver = ratio > 1.25;
                  const isNotified = notifiedTasks[task.id];
                  const excessHours = (consumedHrs - budgetedHrs).toFixed(1);

                  return (
                    <div
                      key={task.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        task.completed
                          ? 'bg-[#f8fafc] border-[#e2e8f0] opacity-80'
                          : isCriticalOver && !isNotified
                          ? 'bg-[#fffbfb] border-[#fecaca]'
                          : isTimerActive
                          ? 'bg-[#faf5ff] border-[#8a4dff]'
                          : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                      }`}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            onClick={() => handleToggleLocalTask(task.id)}
                            className="mt-0.5 text-[#94a3b8] hover:text-[#10b981] transition-colors cursor-pointer shrink-0"
                            title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                            ) : (
                              <Circle className="w-5 h-5" />
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

                              {/* Alert scale: Neutral (in time), Amber (near limit/slight over), Red (over-consumption) */}
                              {isCriticalOver && !isNotified && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] flex items-center gap-1">
                                  <AlertOctagon className="w-3 h-3" />
                                  Demasiado peso (+{excessHours}h)
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
                                  Variación normal (+{excessHours}h)
                                </span>
                              )}
                              {!isCriticalOver && !isSlightOver && consumedHrs > 0 && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                                  En rango ({Math.round(ratio * 100)}%)
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

                        {/* Right side: Resource indicator & Timer action */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-[#64748b] block font-medium">Recurso</span>
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

                          {isTimerActive ? (
                            <button
                              onClick={onStopTimer}
                              className="px-3 py-1.5 rounded-xl bg-[#dc2626] text-white hover:bg-[#b91c1c] cursor-pointer transition-colors shadow-2xs text-xs font-bold flex items-center gap-1"
                              title="Detener y registrar tiempo"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" />
                              <span>Detener</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onStartTimer(task)}
                              className="p-2.5 rounded-xl bg-[#f8fafc] text-[#0f172a] hover:bg-[#e2e8f0] border border-[#e2e8f0] cursor-pointer transition-colors"
                              title="Iniciar cronómetro"
                            >
                              <Play className="w-4 h-4 text-[#501f92]" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Clean resource bar */}
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

                      {/* Contextual notification if critical */}
                      {isCriticalOver && !isNotified && (
                        <div className="mt-3 p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <span className="text-xs text-[#991b1b] leading-tight">
                            Esta pieza superó el tiempo previsto. Avisa al equipo para cotizar los ajustes con el cliente.
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
          </div>
        </div>
      )}

      {/* TAB 2: LA COLONIA (EQUILIBRIO DEL EQUIPO) */}
      {activeTab === 'colonia' && (
        <div className="space-y-6">
          {/* Header colony overview */}
          <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Users2 className="w-5 h-5 text-[#501f92]" />
              <h2 className="text-lg font-bold text-[#0f172a]">
                Avance de la Colonia · Equilibrio del Equipo
              </h2>
            </div>
            <p className="text-xs text-[#64748b] max-w-2xl leading-relaxed">
              En Uhura construimos en conjunto. Orbit monitorea que la carga esté balanceada y que ningún integrante cargue demasiado peso en silencio.
            </p>
          </div>

          {/* Colony Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {colonyMembers.map((member) => {
              const isSupported = supportedMembers[member.id];
              return (
                <div
                  key={member.id}
                  className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-4 transition-all hover:border-[#cbd5e1]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl ${member.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}
                        >
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#0f172a]">{member.name}</h4>
                          <p className="text-[11px] text-[#64748b]">{member.role}</p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[#64748b] flex items-center gap-1 bg-[#f8fafc] px-2 py-1 rounded-xl border border-[#e2e8f0]">
                        <Flame className="w-3.5 h-3.5 text-[#ea580c] fill-[#ea580c]" />
                        {member.consistencyDays}d
                      </span>
                    </div>

                    <p className="p-3 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9] text-xs text-[#475569] leading-relaxed">
                      &ldquo;{member.statusNote}&rdquo;
                    </p>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-[#64748b]">
                        <span>Recurso invertido</span>
                        <span className="font-mono font-bold text-[#0f172a]">
                          {member.hoursLogged.toFixed(1)}h / {member.capacityHours}h
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, (member.hoursLogged / member.capacityHours) * 100)}%` }}
                          className={`h-full rounded-full transition-all ${
                            member.status === 'overloaded'
                              ? 'bg-[#ef4444]'
                              : 'bg-[#10b981]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold ${
                        member.status === 'overloaded'
                          ? 'text-[#dc2626]'
                          : 'text-[#059669]'
                      }`}
                    >
                      {member.status === 'overloaded' ? 'Demasiado peso' : 'Carga balanceada'}
                    </span>

                    {member.id !== 'usr-pao' && (
                      <button
                        disabled={isSupported}
                        onClick={() => handleSupportMember(member)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isSupported
                            ? 'bg-[#f8fafc] text-[#94a3b8] border-[#e2e8f0] cursor-not-allowed'
                            : 'bg-white hover:bg-[#f8fafc] text-[#0f172a] border-[#cbd5e1]'
                        }`}
                      >
                        {isSupported ? 'Apoyo enviado' : 'Coordinar'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: AVISO EN CHAT PARA PROTEGER EL PROYECTO */}
      {chatModalTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-[#f1f5f9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#f5f3ff] text-[#501f92] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748b]">
                    Protección de margen & equilibrio
                  </span>
                  <h3 className="text-base font-bold text-[#0f172a]">
                    Notificar extensión de horas
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setChatModalTask(null)}
                className="p-1.5 rounded-xl text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#64748b]">
                  <span className="font-bold text-[#0f172a]">{chatModalTask.clientName}</span>
                  <span className="font-mono">
                    {((chatModalTask.consumedSeconds || 0) / 3600).toFixed(1)}h consumidas de {chatModalTask.budgetedHours}h presupuestadas
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
                <span>Enviar aviso y proteger equilibrio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
