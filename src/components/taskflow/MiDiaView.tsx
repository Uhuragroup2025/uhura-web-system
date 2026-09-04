import React, { useState } from 'react';
import {
  TaskItem,
  ActiveTimerState,
  OrbitView
} from './types';
import beaverMascotImg from '../../assets/images/orbit_mascot_cutout.png';
import {
  Flame,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Plus,
  Sparkles,
  AlertTriangle,
  Send,
  Users2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  Coffee,
  Heart,
  Zap,
  Gift,
  Award,
  BellRing,
  HelpCircle,
  ThumbsUp,
  MessageCircle,
  Copy,
  Download,
  Check,
  MessageSquare,
  ShieldCheck,
  AlertOctagon,
  X,
  Radio
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
  targetHours: number;
  status: 'optimal' | 'building' | 'danger';
  streakDays: number;
  customMessage?: string;
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
  const [streakDays, setStreakDays] = useState(6);
  const [orbsCount, setOrbsCount] = useState(420);
  const [activeTab, setActiveTab] = useState<'mi-represa' | 'la-colonia'>('mi-represa');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [pokedMembers, setPokedMembers] = useState<Record<string, boolean>>({});

  // Real-world scenarios requested by Paola:
  // 1. Tarea que se pasó por casi el doble (3.0h asignadas vs 5.5h ejecutadas) -> Bucky triste y alerta de rentabilidad
  // 2. Tarea con variación normal (2.0h asignadas vs 2.2h ejecutadas -> +0.2h) -> Normal, en tolerancia
  // 3. Tarea en tiempo (3.0h asignadas vs 1.8h ejecutadas) -> En rango
  // 4. Tarea pendiente (1.5h asignadas vs 0h)
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
      consumedSeconds: 19800, // 5.5h (se pasó por el doble!)
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
      consumedSeconds: 7920, // 2.2h (+0.2h de variación normal)
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
      consumedSeconds: 6480, // 1.8h (60% en tiempo)
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

  // Map of notified task extensions: taskId -> { extraHours, reason, timestamp }
  const [notifiedTasks, setNotifiedTasks] = useState<Record<string, { extraHours: number; reason: string; timestamp: string }>>({});
  const [chatModalTask, setChatModalTask] = useState<TaskItem | null>(null);
  const [selectedReason, setSelectedReason] = useState('Ajustes de brief no contemplados / cambios solicitados por cliente');
  const [extraHoursEstimate, setExtraHoursEstimate] = useState<number>(2.5);

  const handleCopyRender = async () => {
    try {
      const response = await fetch('/orbit_bucky_render.png');
      const blob = await response.blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 3000);
      } else {
        handleDownloadRender();
      }
    } catch {
      handleDownloadRender();
    }
  };

  const handleDownloadRender = () => {
    const link = document.createElement('a');
    link.href = '/orbit_bucky_render.png';
    link.download = 'bucky_render_transparente.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  // Team Colony Members Simulation
  const [colonyMembers, setColonyMembers] = useState<ColonyMember[]>([
    {
      id: 'usr-pao',
      name: 'Paola (Tú)',
      role: 'Lead PM & Producto',
      avatarBg: 'bg-[#501f92]',
      hoursLogged: loggedHoursToday,
      targetHours: 8.0,
      status: loggedHoursToday >= 7.5 ? 'optimal' : loggedHoursToday >= 4.0 ? 'building' : 'danger',
      streakDays: streakDays,
      customMessage: '¡Construyendo la arquitectura de Orbit!'
    },
    {
      id: 'usr-cata',
      name: 'Catalina T.',
      role: 'Directora Comercial',
      avatarBg: 'bg-[#ec4899]',
      hoursLogged: 6.5,
      targetHours: 8.0,
      status: 'building',
      streakDays: 8,
      customMessage: 'Revisando propuesta con Yamaha'
    },
    {
      id: 'usr-luisa',
      name: 'Luisa U.',
      role: 'Operaciones & PM',
      avatarBg: 'bg-[#0284c7]',
      hoursLogged: 7.0,
      targetHours: 8.0,
      status: 'optimal',
      streakDays: 14,
      customMessage: 'Supervisando cronograma y entregas'
    },
    {
      id: 'usr-diego',
      name: 'Diego G.',
      role: 'Creative Designer',
      avatarBg: 'bg-[#8b5cf6]',
      hoursLogged: 5.0,
      targetHours: 8.0,
      status: 'building',
      streakDays: 4,
      customMessage: 'Key visual de campaña listo para QA'
    },
    {
      id: 'usr-cami',
      name: 'Camilo V.',
      role: 'Growth & Media Lead',
      avatarBg: 'bg-[#f59e0b]',
      hoursLogged: 1.5,
      targetHours: 8.0,
      status: 'danger',
      streakDays: 1,
      customMessage: '¡En pauta pero no ha registrado horas!'
    },
    {
      id: 'usr-ana',
      name: 'Ana María G.',
      role: 'CEO & Dirección',
      avatarBg: 'bg-[#10b981]',
      hoursLogged: 8.0,
      targetHours: 8.0,
      status: 'optimal',
      streakDays: 21,
      customMessage: 'Comité directivo y finanzas cerradas'
    }
  ]);

  // Web Audio sound synthesizer for gamer micro-rewards
  const playGamerSound = (type: 'success' | 'alert') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (type === 'success') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.08 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.2);
        });
      } else {
        [320, 260].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
          gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.12);
          osc.stop(ctx.currentTime + i * 0.12 + 0.22);
        });
      }
    } catch {
      // Audio context may be restricted before user gesture
    }
  };

  // Critical overtime tasks (>1.25x budgeted hours, e.g. 5.5h / 3.0h)
  const criticalOvertimeTasks = localTasks.filter(t => {
    const consumedHrs = (t.consumedSeconds || 0) / 3600;
    const budgetedHrs = t.budgetedHours || 1;
    const ratio = consumedHrs / budgetedHrs;
    return ratio > 1.25 && !notifiedTasks[t.id] && !t.completed;
  });

  const hasNotifiedAny = Object.keys(notifiedTasks).length > 0;

  // Total allocated vs consumed in today's missions
  const totalAssignedToday = localTasks.reduce((acc, t) => acc + (t.budgetedHours || 0), 0);
  const totalExecutedToday = localTasks.reduce((acc, t) => acc + ((t.consumedSeconds || 0) / 3600), 0);

  // Keep user in colony in sync with loggedHoursToday
  const userProgressPercent = Math.min(100, Math.round((loggedHoursToday / targetDayHours) * 100));

  // Determine Beaver mood & health status based on budget accuracy & project profitability
  const getBeaverState = () => {
    // 1. Critical overtime unnotified: Bucky is sad/worried because profitability is at risk!
    if (criticalOvertimeTasks.length > 0) {
      const crit = criticalOvertimeTasks[0];
      const consumedHrs = ((crit.consumedSeconds || 0) / 3600).toFixed(1);
      const budgetedHrs = (crit.budgetedHours || 1).toFixed(1);
      const extraHrs = (Number(consumedHrs) - Number(budgetedHrs)).toFixed(1);

      return {
        mood: 'warning_overtime',
        badge: '🚨 ¡Alerta de Desvío en Tarea!',
        badgeColor: 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca] animate-pulse',
        headline: `¡Ojo con el tiempo en ${crit.projectName || 'tu tarea'}!`,
        subhead: `En "${crit.title}" llevas ${consumedHrs}h de ${budgetedHrs}h asignadas (+${extraHrs}h). Duplicar el tiempo impacta la rentabilidad por detrás. ¡No te desgastes en silencio! Avisa en el chat para que el ejecutivo cotice con el cliente y reasigne tiempos.`,
        speech: `¡Pao! Nos pasamos en "${crit.title.slice(0, 22)}...". Avisa en el chat para que el ejecutivo cotice 🥺💬`,
        healthPercent: 35,
        healthColor: 'bg-[#ef4444]',
        woodText: `Desvío: +${extraHrs}h sin cotizar`,
        criticalTask: crit
      };
    }

    // 2. Critical overtime was notified: Bucky is relieved and proud, profitability is protected!
    if (hasNotifiedAny) {
      return {
        mood: 'rescued',
        badge: '🛡️ Rentabilidad Protegida',
        badgeColor: 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]',
        headline: '¡Excelente gestión de equipo!',
        subhead: 'Avisaste a tiempo sobre la extensión de horas. El ejecutivo ya tiene el dato para recotizar con el cliente y reasignar tiempos sin perder margen.',
        speech: '¡Misión protegida! Avisar a tiempo cuida la rentabilidad del proyecto 🚀👏',
        healthPercent: 95,
        healthColor: 'bg-[#8a4dff]',
        woodText: 'En recotización comercial',
        criticalTask: null
      };
    }

    // 3. User logged normal hours and all tasks are within budget
    return {
      mood: 'optimal',
      badge: '⚡ Tareas en Tiempo Asignado',
      badgeColor: 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]',
      headline: '¡Ritmo Óptimo y Colonia Organizada!',
      subhead: 'Tus entregables de hoy van dentro del tiempo presupuestado. Cero fricción operativa.',
      speech: '¡A buen ritmo! Horas dentro de lo presupuestado ☕🪵',
      healthPercent: 88,
      healthColor: 'bg-[#10b981]',
      woodText: 'Horas en rango',
      criticalTask: null
    };
  };

  const beaverState = getBeaverState();

  const handleSendChatNotification = () => {
    if (!chatModalTask) return;
    
    setNotifiedTasks(prev => ({
      ...prev,
      [chatModalTask.id]: {
        extraHours: extraHoursEstimate,
        reason: selectedReason,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }));

    setOrbsCount(prev => prev + 30);
    playGamerSound('success');
    showToast(`🚀 ¡Aviso enviado al equipo! Ganaste +30 Orbs por transparencia operativa. El ejecutivo ya fue notificado.`);
    setChatModalTask(null);
  };

  const handleToggleLocalTask = (taskId: string) => {
    setLocalTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    onToggleTask(taskId);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const handleFeedHours = (hours: number, label: string) => {
    onQuickLogHours(hours, label, 'internal', 'Uhura Group');
    setOrbsCount((prev) => prev + hours * 10);
    showToast(`🦫 ¡Bucky recibió +${hours}h de madera! (+${hours * 10} Orbs ganados)`);
  };

  const handlePokeColleague = (member: ColonyMember) => {
    setPokedMembers((prev) => ({ ...prev, [member.id]: true }));
    showToast(`🚀 ¡Le enviaste un toque cósmico a ${member.name.split(' ')[0]} para que alimente a su castor!`);
  };

  // Filter today's missions (active, not archived, assigned to Paola or general)
  const todaysTasks = tasks.filter((t) => !t.isArchived).slice(0, 5);

  // Quick Uhura bags that Ana María wanted easy access to:
  const quickBags = [
    {
      id: 'bag-weekly',
      title: 'Comité Operativo / Weekly',
      hours: 1.0,
      icon: Users2,
      color: 'text-[#8a4dff]',
      bg: 'bg-[#8a4dff]/10 hover:bg-[#8a4dff]/20 border-[#8a4dff]/30'
    },
    {
      id: 'bag-mgmt',
      title: 'Gestión / Slack / Correo',
      hours: 1.0,
      icon: MessageCircle,
      color: 'text-[#0284c7]',
      bg: 'bg-[#0284c7]/10 hover:bg-[#0284c7]/20 border-[#0284c7]/30'
    },
    {
      id: 'bag-training',
      title: 'Capacitación / Lab Uhura',
      hours: 2.0,
      icon: Sparkles,
      color: 'text-[#d4ff4a]',
      bg: 'bg-[#d4ff4a]/10 hover:bg-[#d4ff4a]/20 border-[#d4ff4a]/30'
    },
    {
      id: 'bag-medical',
      title: 'Permiso / Cita Médica',
      hours: 2.0,
      icon: Heart,
      color: 'text-[#ec4899]',
      bg: 'bg-[#ec4899]/10 hover:bg-[#ec4899]/20 border-[#ec4899]/30'
    }
  ];

  // Calculate total agency colony hours today
  const totalAgencyLogged = colonyMembers.reduce((acc, m) => acc + (m.id === 'usr-pao' ? loggedHoursToday : m.hoursLogged), 0);
  const totalAgencyTarget = colonyMembers.length * 8.0;
  const agencyPercent = Math.round((totalAgencyLogged / totalAgencyTarget) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#140b24] text-white px-4 py-3 rounded-2xl border border-[#8a4dff] shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <Sparkles className="w-5 h-5 text-[#d4ff4a] shrink-0 animate-spin-slow" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Modo Gamer HUD & Control de Rentabilidad */}
      <div className="bg-gradient-to-r from-[#140b24] via-[#1e113a] to-[#2e1859] p-5 sm:p-6 rounded-3xl border border-[#8a4dff]/30 shadow-md text-white space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#8a4dff]/20 border border-[#8a4dff]/40 flex items-center justify-center relative overflow-hidden shrink-0">
              <Flame className="w-7 h-7 text-[#f97316] animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold tracking-wider uppercase text-[#c9b7ff]">
                  Orbit HUD · Control de Asignación & Rentabilidad
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#f97316]/20 border border-[#f97316]/40 text-[#fdba74] text-[10px] font-bold">
                  🔥 {streakDays} DÍAS RACHA
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                ¡Hola Paola! Tus horas organizadas protegen la salud de la agencia.
              </h1>
            </div>
          </div>

          {/* Orbs & View Switcher */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
            <div
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/10 border border-white/15 text-xs font-black text-[#d4ff4a]"
              title="Orbs ganados por registrar a tiempo y alertar desvíos para cuidar el margen"
            >
              <Award className="w-4 h-4 text-[#d4ff4a]" />
              <span>{orbsCount} Orbs</span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex rounded-2xl bg-black/40 p-1 border border-white/10 text-xs font-bold">
              <button
                onClick={() => setActiveTab('mi-represa')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'mi-represa'
                    ? 'bg-[#8a4dff] text-white shadow-xs'
                    : 'text-[#c9b7ff] hover:text-white'
                }`}
              >
                🦫 Mi Día
              </button>
              <button
                onClick={() => setActiveTab('la-colonia')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'la-colonia'
                    ? 'bg-[#8a4dff] text-white shadow-xs'
                    : 'text-[#c9b7ff] hover:text-white'
                }`}
              >
                <Users2 className="w-3.5 h-3.5" />
                <span>La Colonia</span>
                <span className="w-2 h-2 rounded-full bg-[#d4ff4a] animate-pulse" />
              </button>
            </div>
          </div>
        </div>

        {/* Gamer HUD Bar: 4 Core Live Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-[#c9b7ff] block">Misiones Hoy</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-black text-white">{localTasks.length} Tareas</span>
              <span className="text-[11px] text-[#94a3b8]">({totalAssignedToday.toFixed(1)}h base)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-[#c9b7ff] block">Tiempo Registrado</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-black text-[#d4ff4a]">{totalExecutedToday.toFixed(1)}h</span>
              <span className="text-[11px] text-[#94a3b8]">/ 8.0h meta</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-[#c9b7ff] block">Control de Presupuesto</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {criticalOvertimeTasks.length > 0 ? (
                <span className="text-xs font-black text-[#f87171] flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  1 Desvío (+2.5h)
                </span>
              ) : hasNotifiedAny ? (
                <span className="text-xs font-black text-[#c084fc] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Avisos en Cotización
                </span>
              ) : (
                <span className="text-xs font-black text-[#4ade80] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  100% En Rango
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-[#c9b7ff] block">Salud de Rentabilidad</span>
            <div className="text-xs font-extrabold text-white mt-0.5 truncate">
              {criticalOvertimeTasks.length > 0 ? (
                <span className="text-[#fca5a5]">Requiere aviso en chat</span>
              ) : hasNotifiedAny ? (
                <span className="text-[#d8b4fe]">Margen Protegido 🛡️</span>
              ) : (
                <span className="text-[#86efac]">Óptimo · Sin fugas</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VIEW TAB 1: MI DÍA & BUCKY EL CASTOR */}
      {activeTab === 'mi-represa' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 5 COLS: Mi Represa & Bucky el Castor */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-sm relative overflow-hidden">
              {/* Glow backdrop */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#8a4dff]/5 rounded-full blur-3xl -z-0 pointer-events-none" />

              {/* Status Header */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className={`text-[11px] font-extrabold uppercase tracking-wide px-3 py-1 rounded-full border ${beaverState.badgeColor}`}>
                  {beaverState.badge}
                </span>

                <span className="text-xs font-bold text-[#64748b]">
                  Meta diaria: <strong>{targetDayHours.toFixed(1)}h</strong>
                </span>
              </div>

              {/* Mascot 3D Avatar Stage (Solito, suelto y con cuerpo) */}
              <div className="relative flex flex-col items-center justify-center p-2 text-center">
                {/* Speech bubble placed comfortably above Bucky with downward pointer */}
                <div className="relative z-10 mb-1 max-w-[280px] animate-in fade-in zoom-in-95">
                  <div className={`text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl text-center border ${
                    beaverState.mood === 'warning_overtime'
                      ? 'bg-[#450a0a] border-[#ef4444] text-[#fecaca]'
                      : beaverState.mood === 'rescued'
                      ? 'bg-[#2e1065] border-[#8a4dff] text-[#e9d5ff]'
                      : 'bg-[#140b24] border-[#8a4dff]'
                  }`}>
                    {beaverState.speech}
                  </div>
                  {/* Speech bubble tail pointer pointing down to Bucky's head */}
                  <div className={`w-3 h-3 transform rotate-45 mx-auto -mt-1.5 border-r border-b ${
                    beaverState.mood === 'warning_overtime'
                      ? 'bg-[#450a0a] border-[#ef4444]'
                      : beaverState.mood === 'rescued'
                      ? 'bg-[#2e1065] border-[#8a4dff]'
                      : 'bg-[#140b24] border-[#8a4dff]'
                  }`} />
                </div>

                <div className="relative group flex flex-col items-center">
                  <img
                    src={beaverMascotImg}
                    alt="Bucky el Castor de Orbit (Render Transparente)"
                    referrerPolicy="no-referrer"
                    className="w-56 sm:w-64 h-64 sm:h-72 object-contain filter drop-shadow-[0_12px_24px_rgba(20,11,36,0.22)] hover:scale-105 transition-transform duration-300 select-none"
                  />
                  
                  {/* Quick Export Render Bar */}
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <button
                      onClick={handleCopyRender}
                      className="px-3 py-1.5 rounded-xl bg-[#f1f5f9] hover:bg-[#8a4dff] text-[#0f172a] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-[#e2e8f0] hover:border-[#8a4dff] shadow-xs"
                      title="Copiar imagen PNG transparente al portapapeles"
                    >
                      {copiedToast ? (
                        <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#8a4dff] group-hover:text-white" />
                      )}
                      <span>{copiedToast ? '¡Copiado al portapapeles!' : 'Copiar PNG'}</span>
                    </button>

                    <button
                      onClick={handleDownloadRender}
                      className="px-2.5 py-1.5 rounded-xl bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-[#e2e8f0]"
                      title="Descargar archivo PNG en alta calidad sin fondo"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Descargar</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-black text-[#0f172a] mt-3">
                  {beaverState.headline}
                </h3>
                <p className="text-xs text-[#64748b] max-w-sm mt-1">
                  {beaverState.subhead}
                </p>

                {/* Overtime Alert Callout Box (When a task exceeded budget) */}
                {criticalOvertimeTasks.length > 0 && (
                  <div className="mt-3 w-full p-3.5 rounded-2xl bg-[#fef2f2] border border-[#fecaca] flex flex-col items-center gap-2 text-center shadow-xs animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#dc2626]">
                      <AlertOctagon className="w-4 h-4 shrink-0 animate-bounce" />
                      <span>Impacto en Rentabilidad del Proyecto</span>
                    </div>
                    <p className="text-[11px] text-[#991b1b] leading-tight">
                      En <strong>{criticalOvertimeTasks[0].projectName}</strong> superaste las horas asignadas (+2.5h). ¡No te desgastes en silencio! Avisa en el chat para que el ejecutivo cotice con el cliente.
                    </p>
                    <button
                      onClick={() => {
                        setChatModalTask(criticalOvertimeTasks[0]);
                        setExtraHoursEstimate(2.5);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-101"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Avisar Desvío en Chat del Proyecto (+30 Orbs)</span>
                    </button>
                  </div>
                )}

                {/* Confirmation Box when already notified */}
                {criticalOvertimeTasks.length === 0 && hasNotifiedAny && (
                  <div className="mt-3 w-full p-3.5 rounded-2xl bg-[#f5f3ff] border border-[#ddd6fe] flex items-center gap-3 text-left shadow-xs animate-in fade-in">
                    <div className="w-9 h-9 rounded-xl bg-[#8a4dff] text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-[#501f92]">¡Aviso enviado a tiempo! Margen protegido</p>
                      <p className="text-[11px] text-[#6b21a8]">El ejecutivo ya tiene los datos para recotizar con el cliente y reasignar horas.</p>
                    </div>
                  </div>
                )}

                {/* Energy & Wood Meters */}
                <div className="w-full mt-4 space-y-2 bg-white p-3.5 rounded-2xl border border-[#e2e8f0] text-left">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#0f172a] flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#eab308]" />
                      Estado de Combustible
                    </span>
                    <span className="font-mono text-[#501f92]">{beaverState.woodText}</span>
                  </div>

                  <div className="w-full h-3 bg-[#f1f5f9] rounded-full overflow-hidden p-0.5">
                    <div
                      style={{ width: `${beaverState.healthPercent}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${beaverState.healthColor}`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748b] pt-1 border-t border-[#f8fafc]">
                    <span>🔥 Racha personal: <strong>{streakDays} días</strong></span>
                    <span>Progreso: <strong>{userProgressPercent}%</strong></span>
                  </div>
                </div>
              </div>

              {/* Feed Buttons (Quick Log in 1 Click) */}
              <div className="mt-5 space-y-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#64748b]">
                  🪵 Alimentar a Bucky (Carga Rápida de Horas):
                </p>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleFeedHours(1.0, '1h Producción')}
                    className="px-2 py-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] hover:border-[#8a4dff] text-xs font-bold text-[#0f172a] transition-all hover:scale-102 cursor-pointer flex flex-col items-center gap-0.5 shadow-2xs"
                  >
                    <span className="text-[#8a4dff] text-sm">+1h</span>
                    <span className="text-[9px] text-[#64748b]">1 Tronco</span>
                  </button>

                  <button
                    onClick={() => handleFeedHours(2.0, '2h Diseño / Sprint')}
                    className="px-2 py-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] hover:border-[#8a4dff] text-xs font-bold text-[#0f172a] transition-all hover:scale-102 cursor-pointer flex flex-col items-center gap-0.5 shadow-2xs"
                  >
                    <span className="text-[#8a4dff] text-sm">+2h</span>
                    <span className="text-[9px] text-[#64748b]">2 Troncos</span>
                  </button>

                  <button
                    onClick={() => handleFeedHours(4.0, '4h Medio Día')}
                    className="px-2 py-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] hover:border-[#8a4dff] text-xs font-bold text-[#0f172a] transition-all hover:scale-102 cursor-pointer flex flex-col items-center gap-0.5 shadow-2xs"
                  >
                    <span className="text-[#8a4dff] text-sm">+4h</span>
                    <span className="text-[9px] text-[#64748b]">Medio Día</span>
                  </button>

                  <button
                    onClick={() => {
                      const needed = Math.max(0.5, targetDayHours - loggedHoursToday);
                      handleFeedHours(needed, 'Jornada Completa');
                    }}
                    className="px-2 py-2.5 rounded-xl bg-gradient-to-br from-[#8a4dff] to-[#501f92] hover:opacity-95 text-xs font-bold text-white transition-all hover:scale-102 cursor-pointer flex flex-col items-center gap-0.5 shadow-sm"
                  >
                    <span className="text-[#d4ff4a] text-sm">Completar</span>
                    <span className="text-[9px] text-white/80">a 8.0h</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Non-Billable Bags (The ones Ana María could never find!) */}
            <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0f172a]">
                    Bolsas Rápidas Uhura
                  </h4>
                  <p className="text-[11px] text-[#64748b]">
                    Carga directa a tiempo de agencia en 1 clic
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b] font-bold">
                  No facturables
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {quickBags.map((bag) => {
                  const Icon = bag.icon;
                  return (
                    <button
                      key={bag.id}
                      onClick={() => handleFeedHours(bag.hours, bag.title)}
                      className={`p-3 rounded-2xl border text-left transition-all hover:scale-101 cursor-pointer flex flex-col justify-between gap-2 shadow-2xs ${bag.bg}`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${bag.color}`} />
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/80 text-[#0f172a]">
                          +{bag.hours}h
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#0f172a] line-clamp-1 leading-tight">
                        {bag.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT 7 COLS: Mis Misiones de Hoy & Reprocesos */}
          <div className="lg:col-span-7 space-y-6">
            {/* Active Timer Capsule if running */}
            {activeTimer && (
              <div className="bg-gradient-to-r from-[#501f92] to-[#140b24] p-4 rounded-3xl text-white border border-[#8a4dff]/40 shadow-lg flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#d4ff4a] text-[#140b24] flex items-center justify-center shrink-0 font-bold">
                    <Clock className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4ff4a]">
                      Timer en Marcha · {activeTimer.clientName}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate">
                      {activeTimer.taskTitle}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={onPauseResumeTimer}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                  >
                    {activeTimer.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={onStopTimer}
                    className="px-3 py-1.5 rounded-xl bg-[#d4ff4a] hover:bg-[#b8f028] text-[#140b24] font-bold text-xs cursor-pointer transition-colors"
                  >
                    Detener y Registrar
                  </button>
                </div>
              </div>
            )}

            {/* Mis Misiones de Hoy */}
            <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <div>
                  <h3 className="text-base font-black text-[#0f172a] flex items-center gap-2">
                    <span>🚀 Mis Misiones de Hoy</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#501f92] font-bold">
                      {todaysTasks.length} pendientes
                    </span>
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Tareas con deadline prioritario. Completa o corre el timer para alimentar a Bucky.
                  </p>
                </div>

                <button
                  onClick={() => onNavigateToView('tareas')}
                  className="text-xs font-bold text-[#8a4dff] hover:text-[#501f92] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Ver todas ({tasks.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Task Items List (Clean Gamer HUD: Asignadas vs Consumidas & Rentabilidad) */}
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
                          ? 'bg-[#f8fafc] border-[#e2e8f0] opacity-75'
                          : isCriticalOver && !isNotified
                          ? 'bg-[#fff5f5] border-[#fecaca] shadow-xs'
                          : isTimerActive
                          ? 'bg-[#faf5ff] border-[#8a4dff] ring-1 ring-[#8a4dff]'
                          : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                      }`}
                    >
                      {/* Top row: Check, Titles, Badges and Timer/Hours */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            onClick={() => handleToggleLocalTask(task.id)}
                            className="mt-1 text-[#94a3b8] hover:text-[#10b981] transition-colors cursor-pointer shrink-0"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] truncate max-w-[150px]">
                                {task.clientName || 'Cliente'}
                              </span>
                              <span className="text-[#94a3b8] text-xs">›</span>
                              <span className="text-[10px] font-bold text-[#64748b] truncate max-w-[180px]">
                                {task.projectName || task.board}
                              </span>

                              {/* Status Badges */}
                              {isCriticalOver && !isNotified && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] flex items-center gap-1 animate-pulse">
                                  <AlertOctagon className="w-3 h-3" />
                                  ¡Te pasaste por el doble! (+{excessHours}h)
                                </span>
                              )}
                              {isCriticalOver && isNotified && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#f5f3ff] text-[#7c3aed] border border-[#ddd6fe] flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  Aviso Enviado (+{isNotified.extraHours}h en cotización)
                                </span>
                              )}
                              {isSlightOver && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
                                  Variación normal (+{excessHours}h) · Tolerancia OK
                                </span>
                              )}
                              {!isCriticalOver && !isSlightOver && consumedHrs > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                                  En tiempo asignado ({Math.round(ratio * 100)}%)
                                </span>
                              )}
                              {consumedHrs === 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b]">
                                  Sin iniciar
                                </span>
                              )}
                            </div>

                            <p
                              onClick={() => onOpenTaskDetail(task.id)}
                              className={`text-sm font-extrabold cursor-pointer hover:text-[#501f92] transition-colors truncate ${
                                task.completed ? 'line-through text-[#64748b]' : 'text-[#0f172a]'
                              }`}
                            >
                              {task.title}
                            </p>
                          </div>
                        </div>

                        {/* Right side: Hours indicator & Timer Play button */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-[#64748b] block font-medium">Asignadas vs Consumidas</span>
                            <span className={`text-xs font-mono font-black ${
                              isCriticalOver && !isNotified ? 'text-[#dc2626]' : isSlightOver ? 'text-[#b45309]' : 'text-[#0f172a]'
                            }`}>
                              {consumedHrs.toFixed(1)}h / {budgetedHrs.toFixed(1)}h
                            </span>
                          </div>

                          {isTimerActive ? (
                            <button
                              onClick={onPauseResumeTimer}
                              className="p-2.5 rounded-xl bg-[#501f92] text-white hover:bg-[#3b156b] cursor-pointer transition-colors shadow-xs"
                              title="Pausar timer"
                            >
                              {activeTimer.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            </button>
                          ) : (
                            <button
                              onClick={() => onStartTimer(task)}
                              className="p-2.5 rounded-xl bg-[#f1f5f9] text-[#0f172a] hover:bg-[#8a4dff] hover:text-white cursor-pointer transition-colors shadow-2xs"
                              title="Iniciar cronómetro para esta tarea"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Gamer Progress Bar: Consumed vs Budgeted */}
                      <div className="mt-3 space-y-1">
                        <div className="w-full h-2 rounded-full bg-[#f1f5f9] overflow-hidden flex">
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
                      </div>

                      {/* Contextual Alert for Critical Overtime (When not yet notified) */}
                      {isCriticalOver && !isNotified && (
                        <div className="mt-3 p-3 rounded-2xl bg-[#fee2e2]/70 border border-[#fecaca] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                          <div className="flex items-start sm:items-center gap-2 text-xs text-[#991b1b]">
                            <AlertOctagon className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5 sm:mt-0" />
                            <span>
                              <strong>Superaste las horas por bastante (+{excessHours}h).</strong> Esto impacta la rentabilidad por detrás. Es mejor avisar para que el ejecutivo cotice y reasigne tiempos.
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setChatModalTask(task);
                              setExtraHoursEstimate(Math.max(1.0, Number(excessHours)));
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs hover:scale-102"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Avisar en Chat (+30 Orbs)</span>
                          </button>
                        </div>
                      )}

                      {/* Contextual Confirmation if already notified */}
                      {isCriticalOver && isNotified && (
                        <div className="mt-2.5 p-2.5 rounded-2xl bg-[#f5f3ff] border border-[#ddd6fe] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#501f92]">
                          <span className="flex items-center gap-1.5 font-bold">
                            <ShieldCheck className="w-4 h-4 text-[#7c3aed] shrink-0" />
                            Aviso enviado ({isNotified.timestamp}): Se informaron +{isNotified.extraHours}h adicionales al ejecutivo.
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white text-[#7c3aed] border border-[#ddd6fe]">
                            🛡️ Rentabilidad Protegida
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reprocesos y Retrabajos (El dolor que Ana María quería transparentar) */}
            <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0f172a]">
                    Auditoría de Reprocesos (Sin castigar al equipo)
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e]">
                  Protección de Margen
                </span>
              </div>

              <p className="text-xs text-[#64748b]">
                Cuando un cliente solicita una ronda de ajuste fuera del alcance, queda registrada formalmente aquí. Así Dirección sabe por qué se desviaron las horas sin penalizar el score del colaborador.
              </p>

              <div className="p-3 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#0f172a]">Campaña Navidad Yamaha · Ajuste Copy Legal</span>
                  <p className="text-[11px] text-[#64748b]">Solicitado por Cliente (Ronda 2) · +3h imputadas</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ecfdf5] text-[#059669]">
                  Aprobado PM
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: LA SALA DE LA COLONIA (MULTIJUGADOR UHURA) */}
      {activeTab === 'la-colonia' && (
        <div className="space-y-6">
          {/* Mega Represa de la Agencia */}
          <div className="bg-gradient-to-br from-[#140b24] via-[#1e113a] to-[#2e1859] p-6 sm:p-8 rounded-3xl text-white border border-[#8a4dff]/40 shadow-xl relative overflow-hidden">
            <div className="max-w-2xl space-y-2 relative z-10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#d4ff4a] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#d4ff4a]" />
                La Gran Represa de Energía Uhura
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Domo Central de la Colonia ({totalAgencyLogged.toFixed(1)} / {totalAgencyTarget.toFixed(1)}h hoy)
              </h2>
              <p className="text-xs text-[#c9b7ff]">
                Cada miembro del equipo que completa sus 8 horas coloca un pilar en los motores de la nave. ¡Si toda la agencia cierra al 100%, se activa el Viernes Cósmico!
              </p>
            </div>

            {/* Agency Dam Progress Bar */}
            <div className="mt-6 space-y-2 relative z-10">
              <div className="flex items-center justify-between text-xs font-bold font-mono">
                <span className="text-[#c9b7ff]">Combustible Global: {agencyPercent}%</span>
                <span className="text-[#d4ff4a]">Meta diaria: {totalAgencyTarget}h</span>
              </div>
              <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  style={{ width: `${agencyPercent}%` }}
                  className="h-full bg-gradient-to-r from-[#8a4dff] via-[#d4ff4a] to-[#4be5ff] rounded-full transition-all duration-700 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Colony Members Grid (Beavers at work) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {colonyMembers.map((member) => {
              const memberPercent = Math.min(100, Math.round((member.hoursLogged / member.targetHours) * 100));
              const isPoked = pokedMembers[member.id];

              return (
                <div
                  key={member.id}
                  className={`bg-white rounded-3xl p-5 border transition-all hover:shadow-md flex flex-col justify-between gap-4 ${
                    member.status === 'optimal'
                      ? 'border-[#a7f3d0] bg-gradient-to-b from-[#f0fdf4] to-white'
                      : member.status === 'danger'
                      ? 'border-[#fecaca] bg-gradient-to-b from-[#fef2f2] to-white'
                      : 'border-[#e2e8f0]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Member Avatar & Streak */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl ${member.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs`}>
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#0f172a]">{member.name}</h4>
                          <p className="text-[11px] text-[#64748b]">{member.role}</p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[#f97316] flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-[#fed7aa] shadow-2xs">
                        <Flame className="w-3.5 h-3.5 fill-[#f97316]" />
                        {member.streakDays}d
                      </span>
                    </div>

                    {/* Speech / Status Note */}
                    <div className="p-2.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#334155] italic">
                      &ldquo;{member.customMessage}&rdquo;
                    </div>

                    {/* Wood Progress */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-[#64748b]">Madera cargada:</span>
                        <span className="font-mono text-[#0f172a]">{member.hoursLogged.toFixed(1)} / 8.0h</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${memberPercent}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            memberPercent >= 90
                              ? 'bg-[#10b981]'
                              : memberPercent >= 50
                              ? 'bg-[#3b82f6]'
                              : 'bg-[#ef4444]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action / Social Interaction */}
                  <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between">
                    <span className="text-[11px] font-bold">
                      {member.status === 'optimal' && <span className="text-[#059669]">🌟 Represa Completa</span>}
                      {member.status === 'building' && <span className="text-[#2563eb]">⚡ Construyendo</span>}
                      {member.status === 'danger' && <span className="text-[#dc2626]">❄️ En riesgo de hibernar</span>}
                    </span>

                    {member.id !== 'usr-pao' && (
                      <button
                        disabled={isPoked}
                        onClick={() => handlePokeColleague(member)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                          isPoked
                            ? 'bg-[#f1f5f9] text-[#94a3b8] border-[#e2e8f0] cursor-not-allowed'
                            : 'bg-white hover:bg-[#8a4dff] text-[#0f172a] hover:text-white border-[#cbd5e1] hover:border-[#8a4dff]'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-[#eab308]" />
                        <span>{isPoked ? 'Avisado ✨' : 'Toque Cósmico'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* MODAL: AVISO EN CHAT DEL PROYECTO (NOTIFY PM / COMERCIAL) */}
      {chatModalTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#140b24] via-[#1e113a] to-[#2e1859] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#8a4dff]/20 border border-[#8a4dff]/50 flex items-center justify-center text-[#d4ff4a]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#c9b7ff] flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-[#f87171] animate-pulse" />
                    Aviso a PM & Comercial · Protección de Margen
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Notificar Extensión de Horas
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setChatModalTask(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#cbd5e1] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Target Task Summary */}
              <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#64748b]">
                  <span className="font-bold text-[#2563eb]">{chatModalTask.clientName}</span>
                  <span className="font-mono">
                    {((chatModalTask.consumedSeconds || 0) / 3600).toFixed(1)}h ejecutadas de {chatModalTask.budgetedHours}h asignadas
                  </span>
                </div>
                <p className="text-xs font-bold text-[#0f172a]">{chatModalTask.title}</p>
              </div>

              {/* Reason Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase text-[#475569] tracking-wider block">
                  Motivo principal de la extensión:
                </label>
                <div className="space-y-1.5">
                  {[
                    'Ajustes de brief no contemplados / cambios de dirección de cliente',
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

              {/* Additional Hours Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase text-[#475569] tracking-wider">
                    Tiempo adicional estimado para terminar:
                  </label>
                  <span className="font-mono font-black text-sm text-[#8a4dff]">
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
                          ? 'bg-[#8a4dff] text-white border-[#8a4dff] shadow-xs'
                          : 'bg-[#f8fafc] text-[#334155] border-[#e2e8f0] hover:border-[#cbd5e1]'
                      }`}
                    >
                      +{h}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Message Preview (For Slack/Chat) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold uppercase text-[#64748b]">
                    Mensaje pre-generado para el chat del proyecto:
                  </span>
                  <span className="text-[10px] text-[#2563eb] font-bold">
                    #canal-{chatModalTask.clientName?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'proyecto'}
                  </span>
                </div>

                <div className="p-3 bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] text-[#1e293b] font-mono text-[11px] leading-relaxed relative group">
                  &ldquo;Chicos, en la tarea <strong>&apos;{chatModalTask.title}&apos;</strong> ({chatModalTask.clientName}) me va a tomar más tiempo del presupuestado (~{extraHoursEstimate}h adicionales) debido a: <em>{selectedReason}</em>. Les aviso para que el ejecutivo cotice con el cliente y reasignemos tiempos.&rdquo;
                </div>
              </div>

              {/* Financial & Game Benefit Pill */}
              <div className="p-3 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center gap-2 text-[#065f46]">
                <ShieldCheck className="w-5 h-5 text-[#059669] shrink-0" />
                <div className="text-[11px] leading-tight">
                  <strong>¡Premio por Transparencia Operativa!</strong> Al avisar a tiempo, el ejecutivo puede cobrar los excedentes al cliente. Ganas <strong>+30 Orbs</strong> y Bucky se pone feliz.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setChatModalTask(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendChatNotification}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8a4dff] to-[#501f92] hover:opacity-95 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-102"
              >
                <Send className="w-3.5 h-3.5 text-[#d4ff4a]" />
                <span>Enviar Aviso y Proteger Margen (+30 Orbs)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
