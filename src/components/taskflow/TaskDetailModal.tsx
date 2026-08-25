import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Square,
  Clock,
  CheckCircle2,
  Calendar,
  Link2,
  Send,
  Plus,
  Building2,
  Edit2,
  Check,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCw,
  RotateCcw,
  Star,
  MessageSquare,
  FileText,
  AlertTriangle,
  Layers,
  CheckSquare,
  User,
  Users,
  Repeat,
  Trash2,
  ListChecks,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Share2,
  Archive,
  FolderInput,
  Copy
} from 'lucide-react';
import {
  TaskItem,
  ActiveTimerState,
  TaskDeliverable,
  TaskStatus,
  TaskPriority,
  ProjectPhase,
  TaskBlockerInfo,
  BlockerReason
} from './types';
import { PROJECT_PHASES_TEMPLATES } from './mockData';

const TEAM_MEMBERS_POOL = [
  { name: 'Paola (Lead PM)', initials: 'PL', avatarBg: 'bg-[#501f92]', role: 'Lead Project Manager' },
  { name: 'Catalina Tejada', initials: 'CT', avatarBg: 'bg-[#7c3aed]', role: 'Lead Designer' },
  { name: 'Andrés Ríos', initials: 'AR', avatarBg: 'bg-[#ef4444]', role: 'Growth & Tech Lead' },
  { name: 'Laura Gómez', initials: 'LG', avatarBg: 'bg-[#0284c7]', role: 'Colaborador UI / Frontend' },
  { name: 'Sebas (Trafficker)', initials: 'ST', avatarBg: 'bg-[#0284c7]', role: 'Trafficker Digital' },
  { name: 'Camilo Vélez', initials: 'CV', avatarBg: 'bg-[#10b981]', role: 'Growth Specialist' },
  { name: 'Esteban Mora', initials: 'EM', avatarBg: 'bg-[#f59e0b]', role: 'Backend Dev' }
];

const DEFAULT_CRITERIA = [
  { id: 'c-1', text: 'Ajustes de banners mobile y optimización SVG/Retina', completed: true },
  { id: 'c-2', text: 'Revisión de enlaces y flujo de navegación', completed: true },
  { id: 'c-3', text: 'Validación final y visto bueno del Project Manager', completed: false }
];

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  tasksList?: TaskItem[];
  onSelectTask?: (task: TaskItem) => void;
  activeTimer: ActiveTimerState | null;
  onStartTimer: (task: TaskItem) => void;
  onPauseResumeTimer?: () => void;
  onStopTimer?: () => void;
  onUpdateBudgetHours?: (taskId: string, newHours: number) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTaskPriority?: (taskId: string, newPriority: TaskPriority) => void;
  onUpdateDates?: (taskId: string, startDate: string, dueDate: string, dueText?: string) => void;
  onUpdateTeam?: (
    taskId: string,
    assignee: TaskItem['assignee'],
    collaborators: TaskItem['collaborators']
  ) => void;
  onUpdateCriteria?: (
    taskId: string,
    criteria: { id: string; text: string; completed: boolean }[]
  ) => void;
  onAddDeliverable?: (
    taskId: string,
    del: Omit<TaskDeliverable, 'id' | 'taskId' | 'submittedAt'>
  ) => void;
  onAddComment?: (taskId: string, commentText: string) => void;
  onRecalibrateDates?: (
    taskId: string,
    daysToAdd: number,
    reason: string,
    responsibleParty: string
  ) => void;
  onUpdateBlockerInfo?: (taskId: string, blockerInfo: TaskBlockerInfo | undefined) => void;
  onUpdatePhase?: (taskId: string, phase: ProjectPhase) => void;
  onDeleteTask?: (taskId: string) => void;
  onArchiveTask?: (taskId: string) => void;
  onNavigateToClient?: (clientName: string) => void;
  onNavigateToProject?: (projectName: string) => void;
  onOpenManualLog?: (taskId: string) => void;
  onMoveTask?: (
    taskId: string,
    targetProject: string,
    targetClient?: string,
    targetStatus?: TaskStatus
  ) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  tasksList = [],
  onSelectTask,
  activeTimer,
  onStartTimer,
  onPauseResumeTimer,
  onStopTimer,
  onUpdateBudgetHours,
  onUpdateTaskStatus,
  onUpdateTaskPriority,
  onUpdateDates,
  onUpdateTeam,
  onUpdateCriteria,
  onAddDeliverable,
  onAddComment,
  onRecalibrateDates,
  onUpdateBlockerInfo,
  onUpdatePhase,
  onDeleteTask,
  onArchiveTask,
  onNavigateToClient,
  onNavigateToProject,
  onOpenManualLog,
  onMoveTask
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'entregables'>('feed');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState('');
  const [isStarred, setIsStarred] = useState(false);

  // Actions states: Share, Move, Delete, Archive
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const [moveTargetProject, setMoveTargetProject] = useState(task?.projectName || task?.board || '');
  const [moveTargetClient, setMoveTargetClient] = useState(task?.clientName || '');
  const [moveTargetStatus, setMoveTargetStatus] = useState<TaskStatus>(task?.status || 'To Do');

  useEffect(() => {
    if (task) {
      setMoveTargetProject(task.projectName || task.board);
      setMoveTargetClient(task.clientName || 'PrismaKiddos');
      setMoveTargetStatus(task.status);
    }
  }, [task]);

  // Dates editing state with native interactive date picker
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [startDateInput, setStartDateInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');

  // Comment state
  const [newCommentText, setNewCommentText] = useState('');
  const [isAddingDeliverableInline, setIsAddingDeliverableInline] = useState(false);

  // Deliverable inline form state
  const [deliverableUrls, setDeliverableUrls] = useState<string[]>(['']);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>(['Paola (Lead PM)']);

  // Acceptance Criteria State
  const [criteria, setCriteria] = useState<{ id: string; text: string; completed: boolean }[]>(
    task?.acceptanceCriteria && task.acceptanceCriteria.length > 0
      ? task.acceptanceCriteria
      : DEFAULT_CRITERIA
  );
  const [newCriterionInput, setNewCriterionInput] = useState('');
  const [isAddingCriterion, setIsAddingCriterion] = useState(false);

  // Collaborators collapsed/expanded view state
  const [isCollaboratorsExpanded, setIsCollaboratorsExpanded] = useState(false);

  // Blocker Management Modal / Inline state
  const [isRegisteringBlocker, setIsRegisteringBlocker] = useState(false);
  const [blockerReasonSelect, setBlockerReasonSelect] = useState<BlockerReason>('client_inputs');
  const [blockerResponsibleSelect, setBlockerResponsibleSelect] = useState<'Cliente' | 'Uhura / Interno' | 'Tercero / Proveedor'>('Cliente');
  const [blockerDaysInput, setBlockerDaysInput] = useState('4');
  const [blockerNotesInput, setBlockerNotesInput] = useState('Cliente no ha entregado llaves de API / insumos de diseño requeridos.');

  // AI Assistant Insights state
  const [showAiAdvisor, setShowAiAdvisor] = useState(false);

  // Date formatting helpers for interactive date picker
  const parseToDateInput = (val?: string): string => {
    if (!val) return '2026-08-24';
    // If format like "20 ago. 2026, 09:00" or ISO
    const match = val.match(/(\d{1,2})\s+([a-zA-Záéíóú]+)\.?\s+(\d{4})/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const monthMap: Record<string, string> = {
        ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
        jul: '07', ago: '08', sep: '09', oct: '10', nov: '11', dic: '12'
      };
      const mStr = match[2].toLowerCase().slice(0, 3);
      const m = monthMap[mStr] || '08';
      const y = match[3];
      return `${y}-${m}-${day}`;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
    return '2026-08-24';
  };

  const formatDateOutput = (isoDate: string, timeStr = '18:00'): string => {
    if (!isoDate) return '24 ago. 2026, 18:00';
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        const y = parts[0];
        const mIdx = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        return `${d} ${months[mIdx] || 'ago'}. ${y}, ${timeStr}`;
      }
      return isoDate;
    } catch {
      return isoDate;
    }
  };

  // Sync criteria when task changes
  useEffect(() => {
    if (task) {
      setCriteria(
        task.acceptanceCriteria && task.acceptanceCriteria.length > 0
          ? task.acceptanceCriteria
          : DEFAULT_CRITERIA
      );
      setIsRegisteringBlocker(false);
    }
  }, [task?.id, task?.acceptanceCriteria]);

  if (!isOpen || !task) return null;

  const isCurrentTimerRunning = activeTimer?.taskId === task.id;
  const consumedHours = (task.consumedSeconds || 0) / 3600;
  const budgetedHours = task.budgetedHours || 1;
  const percent = Math.round((consumedHours / budgetedHours) * 100);
  const isOverBudget = consumedHours > budgetedHours;
  const surplusHours = Math.max(0, consumedHours - budgetedHours);
  const isInternal = task.categoryType === 'internal';

  // Format times
  const totalMinutes = Math.round((task.consumedSeconds || 0) / 60);
  const displayHours = Math.floor(totalMinutes / 60);
  const displayMinutes = totalMinutes % 60;

  const budgetTotalMin = Math.round(budgetedHours * 60);
  const budgetDisplayH = Math.floor(budgetTotalMin / 60);
  const budgetDisplayM = budgetTotalMin % 60;

  // Collaborators fallback
  const currentCollaborators =
    task.collaborators && task.collaborators.length > 0
      ? task.collaborators
      : [
          {
            name: 'Laura Gómez',
            initials: 'LG',
            avatarBg: 'bg-[#0284c7]',
            role: 'Colaborador UI / Frontend'
          }
        ];

  // Next / Previous Task navigation
  const currentIndex = tasksList.findIndex((t) => t.id === task.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < tasksList.length - 1;

  const handlePrevTask = () => {
    if (hasPrev && onSelectTask) onSelectTask(tasksList[currentIndex - 1]);
  };

  const handleNextTask = () => {
    if (hasNext && onSelectTask) onSelectTask(tasksList[currentIndex + 1]);
  };

  const handleSaveBudget = () => {
    const num = parseFloat(budgetValue);
    if (!isNaN(num) && num > 0 && onUpdateBudgetHours) {
      onUpdateBudgetHours(task.id, num);
    }
    setIsEditingBudget(false);
  };

  const handleSaveDates = () => {
    const start = startDateInput.trim() || task.startDate || '20 ago. 2026, 09:00';
    const due = dueDateInput.trim() || task.dueText || '24 ago. 2026, 18:00';
    if (onUpdateDates) {
      onUpdateDates(task.id, start, due, due);
    }
    setIsEditingDates(false);
  };

  const handleChangePM = (pmName: string) => {
    const foundMember = TEAM_MEMBERS_POOL.find((m) => m.name === pmName);
    if (!foundMember) return;
    const newAssignee = {
      name: foundMember.name,
      initials: foundMember.initials,
      avatarBg: foundMember.avatarBg,
      role: 'Project Manager'
    };
    if (onUpdateTeam) {
      onUpdateTeam(task.id, newAssignee, currentCollaborators);
    }
  };

  // Acceptance Criteria Handlers
  const handleToggleCriterion = (criterionId: string) => {
    const updated = criteria.map((c) =>
      c.id === criterionId ? { ...c, completed: !c.completed } : c
    );
    setCriteria(updated);
    if (onUpdateCriteria) {
      onUpdateCriteria(task.id, updated);
    }
  };

  const handleAddCriterion = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCriterionInput.trim()) return;

    const newCrit = {
      id: `crit-${Date.now()}`,
      text: newCriterionInput.trim(),
      completed: true
    };
    const updated = [...criteria, newCrit];
    setCriteria(updated);
    setNewCriterionInput('');
    setIsAddingCriterion(false);

    if (onUpdateCriteria) {
      onUpdateCriteria(task.id, updated);
    }
  };

  const handleRemoveCriterion = (criterionId: string) => {
    const updated = criteria.filter((c) => c.id !== criterionId);
    setCriteria(updated);
    if (onUpdateCriteria) {
      onUpdateCriteria(task.id, updated);
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    if (onAddComment) {
      onAddComment(task.id, newCommentText.trim());
    } else {
      if (!task.messages) task.messages = [];
      task.messages.push({
        id: `msg-${Date.now()}`,
        authorName: 'Paola (Lead PM)',
        authorInitials: 'PL',
        authorAvatarBg: 'bg-[#501f92]',
        timestamp: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs',
        content: newCommentText.trim()
      });
    }
    setNewCommentText('');
  };

  const handleSendDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = deliverableUrls.map((u) => u.trim()).filter(Boolean);
    if (validUrls.length === 0 || !onAddDeliverable) return;

    const checkedCriteriaTexts = criteria.filter((c) => c.completed).map((c) => c.text);
    const reviewersList = selectedReviewers.length > 0 ? selectedReviewers : ['Paola (Lead PM)'];

    onAddDeliverable(task.id, {
      url: validUrls[0],
      urls: validUrls,
      title: validUrls.length > 1 ? `Entregable (${validUrls.length} enlaces)` : 'Entregable de producción',
      submittedBy: task.assignee.name,
      status: 'submitted',
      taggedReviewer: reviewersList.join(', '),
      taggedReviewers: reviewersList,
      criteriaChecked: checkedCriteriaTexts
    });

    // Auto-post a rich notice in the feed with verified criteria count
    if (onAddComment) {
      const criteriaSummary =
        criteria.length > 0
          ? ` (${checkedCriteriaTexts.length}/${criteria.length} criterios validados)`
          : '';
      const taggedMentions = reviewersList.map((r) => `@${r}`).join(' ');
      onAddComment(
        task.id,
        `🚀 ${taggedMentions} he subido ${validUrls.length > 1 ? `${validUrls.length} enlaces de entregable` : 'el entregable'}${criteriaSummary}: ${validUrls.join(' | ')}`
      );
    }

    setDeliverableUrls(['']);
    setIsAddingDeliverableInline(false);
  };

  // Recalibration Trigger
  const handleTriggerRecalibration = () => {
    const days = task.blockerInfo?.blockedDays || 4;
    const reason = task.blockerInfo?.reasonText || 'Demora de insumos por parte del Cliente';
    const responsible = task.blockerInfo?.responsibleParty || 'Cliente';

    if (onRecalibrateDates) {
      onRecalibrateDates(task.id, days, reason, responsible);
    }
  };

  // Register New Blocker
  const handleSaveNewBlocker = () => {
    const days = parseInt(blockerDaysInput, 10) || 3;
    const newBlocker: TaskBlockerInfo = {
      isBlocked: true,
      reason: blockerReasonSelect,
      reasonText: blockerNotesInput.trim() || 'Bloqueo registrado por el Product Lead',
      responsibleParty: blockerResponsibleSelect,
      blockedDays: days,
      blockedAt: 'Hoy, 22 Ago 2026',
      notes: blockerNotesInput.trim()
    };

    if (onUpdateBlockerInfo) {
      onUpdateBlockerInfo(task.id, newBlocker);
    }

    if (onAddComment) {
      onAddComment(
        task.id,
        `🛑 Tarea puesta en Standby / Bloqueada (+${days} días de desfase). Responsable: ${blockerResponsibleSelect}. Motivo: ${blockerNotesInput.trim()}`
      );
    }

    setIsRegisteringBlocker(false);
  };

  // Resolve Blocker
  const handleResolveBlocker = () => {
    if (onUpdateBlockerInfo) {
      onUpdateBlockerInfo(task.id, {
        ...(task.blockerInfo || {
          isBlocked: false,
          reason: 'other',
          reasonText: 'Resuelto',
          responsibleParty: 'Cliente',
          blockedDays: 0
        }),
        isBlocked: false,
        resolvedAt: 'Hoy, 22 Ago 2026'
      });
    }

    if (onAddComment) {
      onAddComment(
        task.id,
        `✅ Bloqueo resuelto por el equipo. La tarea reanuda su flujo de ejecución normal.`
      );
    }
  };

  // Jump to dependency task
  const handleJumpToDependency = () => {
    if (task.dependencyTaskId && onSelectTask) {
      const target = tasksList.find((t) => t.id === task.dependencyTaskId);
      if (target) onSelectTask(target);
    }
  };

  // Status visual styles
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Done':
        return { label: 'Completada', bg: 'bg-[#ecfdf5]', text: 'text-[#065f46]', border: 'border-[#a7f3d0]' };
      case 'In Progress':
        return { label: 'En Ejecución', bg: 'bg-[#f2ecfb]', text: 'text-[#501f92]', border: 'border-[#8a4dff]/30' };
      case 'Review':
        return { label: 'En Revisión (PM)', bg: 'bg-[#fffbeb]', text: 'text-[#92400e]', border: 'border-[#fde68a]' };
      default:
        return { label: 'Por Iniciar', bg: 'bg-[#f1f5f9]', text: 'text-[#475569]', border: 'border-[#cbd5e1]' };
    }
  };

  const statusInfo = getStatusBadge(task.status);
  const isBlocked = task.blockerInfo?.isBlocked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#090513]/75 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Outer Floating Carousel Buttons */}
      {hasPrev && (
        <button
          onClick={handlePrevTask}
          aria-label="Tarea anterior"
          className="hidden xl:flex fixed left-5 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-2xl bg-white/95 hover:bg-white text-[#0f172a] shadow-xl hover:scale-105 transition-all cursor-pointer z-50 border border-[#e2e8f0]"
        >
          <ChevronLeft className="w-5 h-5 text-[#334155]" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={handleNextTask}
          aria-label="Siguiente tarea"
          className="hidden xl:flex fixed right-5 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-2xl bg-white/95 hover:bg-white text-[#0f172a] shadow-xl hover:scale-105 transition-all cursor-pointer z-50 border border-[#e2e8f0]"
        >
          <ChevronRight className="w-5 h-5 text-[#334155]" />
        </button>
      )}

      {/* Main Mission Control Card */}
      <div className="bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-6xl max-h-[88vh] flex flex-col overflow-hidden text-[#0f172a]">
        {/* TOP BRANDED BAR */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#334155] shrink-0">
          <div className="space-y-1.5 min-w-0">
            {/* Hierarchy Pill Breadcrumb with Fee / Project type */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToClient && task.clientName) {
                    onNavigateToClient(task.clientName);
                  } else {
                    setShareToast(`Cliente: ${task.clientName || 'Cliente'}`);
                    setTimeout(() => setShareToast(null), 2500);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold backdrop-blur-xs border border-white/15 hover:border-[#d4ff4a]/60 hover:text-[#d4ff4a] transition-all cursor-pointer group"
                title={`Ver proyectos y tareas de ${task.clientName || 'Cliente'}`}
              >
                <Building2 className="w-3 h-3 text-[#d4ff4a] group-hover:scale-110 transition-transform" />
                <span>{task.clientName || 'Cliente'}</span>
              </button>
              <span className="text-[#64748b] font-bold">/</span>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToProject && (task.projectName || task.board)) {
                    onNavigateToProject(task.projectName || task.board);
                  } else {
                    setShareToast(`Proyecto: ${task.projectName || task.board}`);
                    setTimeout(() => setShareToast(null), 2500);
                  }
                }}
                className="text-[#cbd5e1] hover:text-white hover:underline font-medium truncate max-w-xs cursor-pointer transition-colors"
                title={`Ver proyecto: ${task.projectName || task.board}`}
              >
                {task.projectName || task.board}
              </button>

              {task.projectType === 'fee_monthly' ? (
                <span className="px-2 py-0.5 rounded-md bg-[#d4ff4a]/20 text-[#d4ff4a] text-[10px] font-bold border border-[#d4ff4a]/30 flex items-center gap-1">
                  <Repeat className="w-2.5 h-2.5" />
                  <span>Fee Recurrente {task.feeCategory ? `· ${task.feeCategory}` : ''}</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-[#3b82f6]/20 text-[#93c5fd] text-[10px] font-bold border border-[#3b82f6]/40 flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5" />
                  <span>Proyecto con Fases {task.phase ? `· ${task.phase}` : ''}</span>
                </span>
              )}

              {task.isRecalibrated && (
                <span className="px-2 py-0.5 rounded-md bg-[#10b981]/20 text-[#a7f3d0] text-[10px] font-bold border border-[#10b981]/40 flex items-center gap-1">
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Recalibrada (+{task.recalibrationDays || 4}d)</span>
                </span>
              )}
            </div>

            {/* Task Title */}
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2 truncate">
              <span>{task.title}</span>
            </h1>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            {/* AI Advisor Button */}
            <button
              onClick={() => setShowAiAdvisor(!showAiAdvisor)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                showAiAdvisor
                  ? 'bg-[#d4ff4a] text-[#0f172a] border-[#d4ff4a]'
                  : 'bg-white/10 hover:bg-white/20 text-[#cbd5e1] hover:text-white border-white/15'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Orbit AI Insight</span>
            </button>

            {/* Integrated Live Timer Pill with STOP option + Manual Log Button */}
            <div className="flex items-center bg-white/10 border border-white/15 rounded-xl p-1 gap-1.5">
              {isCurrentTimerRunning ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onPauseResumeTimer}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTimer?.isPaused
                        ? 'bg-[#f59e0b] text-white'
                        : 'bg-[#d4ff4a] text-[#140b24] shadow-xs animate-pulse'
                    }`}
                    title={activeTimer?.isPaused ? 'Reanudar temporizador' : 'Pausar temporizador'}
                  >
                    {activeTimer?.isPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Reanudar</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span className="font-mono">En Vivo ({displayHours}h {displayMinutes}m)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onStopTimer}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                    title="Detener y registrar tiempo consumido"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onStartTimer(task)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#8a4dff] hover:bg-[#7c3aed] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  title="Iniciar temporizador en esta tarea"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Iniciar Timer</span>
                </button>
              )}

              {/* Manual Time Log Button (+) */}
              <button
                onClick={() => {
                  if (onOpenManualLog && task) {
                    onOpenManualLog(task.id);
                  }
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer border border-white/10 hover:border-white/25"
                title="Cargar horas manualmente (+)"
              >
                <Clock className="w-3.5 h-3.5 text-[#d4ff4a]" />
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>

            {/* Quick Actions: Share, Move, Archive, Delete */}
            <div className="flex items-center bg-white/10 border border-white/15 rounded-xl p-1 gap-1">
              {/* Share */}
              <button
                onClick={() => setShowShareModal(true)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-[#cbd5e1] hover:text-white transition-colors cursor-pointer"
                title="Compartir tarea (Enlace / Slack / WhatsApp)"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Move */}
              <button
                onClick={() => setShowMoveModal(true)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-[#cbd5e1] hover:text-white transition-colors cursor-pointer"
                title="Mover tarea a otro proyecto o estado"
              >
                <FolderInput className="w-4 h-4" />
              </button>

              {/* Archive */}
              <button
                onClick={() => {
                  if (onArchiveTask) {
                    onArchiveTask(task.id);
                  }
                }}
                className={`p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer ${
                  task.isArchived ? 'text-[#d4ff4a] bg-white/15' : 'text-[#cbd5e1] hover:text-white'
                }`}
                title={task.isArchived ? 'Desarchivar tarea' : 'Archivar tarea'}
              >
                <Archive className="w-4 h-4" />
              </button>

              {/* Delete */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg hover:bg-[#ef4444]/30 text-[#fca5a5] hover:text-white transition-colors cursor-pointer"
                title="Eliminar tarea"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Star Favorite */}
            <button
              onClick={() => setIsStarred(!isStarred)}
              className={`p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15 ${
                isStarred ? 'text-[#d4ff4a]' : 'text-[#cbd5e1]'
              }`}
              title="Marcar como favorita"
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15"
              title="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI ADVISOR INSIGHT BANNER */}
        {showAiAdvisor && (
          <div className="p-4 bg-[#f2ecfb] border-b border-[#8a4dff]/20 flex items-start justify-between gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#501f92] text-[#d4ff4a] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#501f92]">
                  Diagnóstico de Capacidad & Rentabilidad Orbit
                </h4>
                <p className="text-xs text-[#334155] leading-relaxed">
                  {isBlocked ? (
                    <>
                      🛑 <strong>Desfase en Standby:</strong> La tarea acumula{' '}
                      <strong className="text-[#dc2626]">+{task.blockerInfo?.blockedDays || 4} días de espera</strong> imputable a{' '}
                      <strong>{task.blockerInfo?.responsibleParty || 'Cliente'}</strong>. Se recomienda recalibrar la fecha de entrega para mantener limpio el cronograma del equipo.
                    </>
                  ) : isOverBudget ? (
                    <>
                      ⚠️ <strong>Alerta de Desvío:</strong> Se han invertido{' '}
                      <strong className="text-[#dc2626]">{displayHours}h {displayMinutes}m</strong>{' '}
                      superando el presupuesto de <strong>{task.budgetedHours}h</strong> (+{surplusHours.toFixed(1)}h de exceso).
                    </>
                  ) : (
                    <>
                      ✅ <strong>Ritmo Saludable:</strong> Has consumido el <strong>{percent}%</strong> ({displayHours}h {displayMinutes}m de {task.budgetedHours}h presupuestadas). El margen operativo para la cuenta {task.clientName} está protegido.
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAiAdvisor(false)}
              className="text-xs font-bold text-[#501f92] hover:underline shrink-0"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* BODY SPLIT VIEW (Left 60% Interactive Hub | Right 40% Smart Bento) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* LEFT INTERACTIVE HUB (Cols 1-7) */}
          <div className="lg:col-span-7 border-r border-[#e2e8f0] flex flex-col bg-white overflow-hidden">
            {/* Custom Tab Navigation Bar */}
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 bg-[#fcfcfd] shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'feed'
                      ? 'border-[#501f92] text-[#501f92]'
                      : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Timeline & Trazabilidad</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#f2ecfb] text-[#501f92] font-bold">
                    {(task.messages?.length || 2)}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('entregables')}
                  className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'entregables'
                      ? 'border-[#501f92] text-[#501f92]'
                      : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Entregables</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#e0f2fe] text-[#0369a1] font-bold">
                    {task.deliverables?.length || 0}
                  </span>
                </button>
              </div>

              {/* Quick Deliverable Button */}
              <button
                onClick={() => {
                  setActiveTab('entregables');
                  setIsAddingDeliverableInline(true);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                  isAddingDeliverableInline && activeTab === 'entregables'
                    ? 'bg-[#501f92] text-white border-[#501f92]'
                    : 'bg-[#f2ecfb] hover:bg-[#e6d8fa] text-[#501f92] border-[#8a4dff]/20'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Subir Entregable</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="p-4.5 flex-1 overflow-y-auto space-y-4">
              {/* TAB 1: FEED & ACTIVITY TIMELINE */}
              {activeTab === 'feed' && (
                <div className="flex flex-col h-full space-y-6">
                  {/* Standby / Blocker Alert Box if Active */}
                  {isBlocked && (
                    <div className="p-4 rounded-2xl bg-linear-to-r from-[#fef2f2] to-[#fff7ed] border border-[#fca5a5] shadow-xs space-y-3 animate-in fade-in">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#ef4444] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-[#991b1b]">
                                Tarea en Standby / Demora Activa (+{task.blockerInfo?.blockedDays || 4} días)
                              </h4>
                              <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]">
                                Origen del Desvío: {task.blockerInfo?.responsibleParty === 'Cliente' ? 'Espera de Insumos / Aprobación de Cliente' : task.blockerInfo?.responsibleParty || 'Cliente'}
                              </span>
                            </div>
                            <p className="text-xs text-[#7f1d1d] mt-1 leading-snug">
                              {task.blockerInfo?.reasonText}
                            </p>
                          </div>
                        </div>

                        {/* Recalibrate Button */}
                        <button
                          type="button"
                          onClick={handleTriggerRecalibration}
                          className="px-3.5 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                          title="Ajusta la fecha de entrega y actualiza el análisis de rentabilidad"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#d4ff4a]" />
                          <span>Ajustar Cronograma & Margen</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#9a3412] pt-2 border-t border-[#fed7aa]/60">
                        <span className="leading-snug pr-3">
                          💡 Este ajuste recalcula el impacto en el margen y horas presupuestadas. Si el desvío excede el umbral del fee/proyecto, generará una alerta de recotización o pausa preventiva para proteger la rentabilidad.
                        </span>
                        <button
                          type="button"
                          onClick={handleResolveBlocker}
                          className="font-bold text-[#501f92] hover:underline cursor-pointer shrink-0"
                        >
                          Marcar como Resuelto
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dependency Banner if waiting on another task */}
                  {task.dependencyTaskId && (
                    <div className="p-3.5 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#2563eb] text-white flex items-center justify-center shrink-0">
                          <Link2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#1e40af] uppercase">
                            Dependencia de Flujo Interno
                          </span>
                          <p className="text-xs font-semibold text-[#1e3a8a]">
                            Bloqueado en espera de: {task.dependencyTaskTitle || 'Tarea previa de creativos'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleJumpToDependency}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#93c5fd] hover:bg-[#dbeafe] text-[#1e40af] text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Ver Tarea Requisito</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Activity Thread */}
                  <div className="space-y-4 flex-1">
                    {(!task.messages || task.messages.length === 0) && (
                      <div className="p-8 text-center border-2 border-dashed border-[#e2e8f0] rounded-2xl">
                        <MessageSquare className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                        <p className="text-xs font-medium text-[#64748b]">No hay comentarios en la línea de tiempo todavía.</p>
                      </div>
                    )}

                    {/* Messages Feed */}
                    {task.messages?.map((msg) => (
                      <div key={msg.id} className="space-y-1.5 animate-in fade-in duration-150">
                        <div className="text-[11px] text-[#94a3b8] pl-11 font-medium">
                          {msg.timestamp}
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#501f92] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {msg.authorInitials}
                          </div>

                          <div className="flex-1 bg-[#f8fafc] hover:bg-[#f1f5f9]/80 transition-colors p-4 rounded-2xl border border-[#e2e8f0] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#0f172a]">
                                {msg.authorName}
                              </span>
                            </div>

                            <p className="text-xs text-[#334155] leading-relaxed">
                              {msg.content.split(' ').map((word, i) => {
                                if (word.startsWith('@')) {
                                  return (
                                    <span
                                      key={i}
                                      className="font-bold text-[#501f92] bg-[#f2ecfb] px-1.5 py-0.5 rounded-md inline-block mr-1"
                                    >
                                      {word}
                                    </span>
                                  );
                                }
                                return word + ' ';
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <form onSubmit={handleSendComment} className="pt-3 border-t border-[#e2e8f0] flex items-center gap-2">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Escribe un mensaje en el timeline o taggea a @Paola, @Catalina..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]/20 focus:border-[#8a4dff]"
                    />
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Comentar</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: ENTREGABLES */}
              {activeTab === 'entregables' && (
                <div className="space-y-6">
                  {/* Inline Deliverable Submission Form */}
                  {isAddingDeliverableInline && (
                    <div className="p-5 rounded-2xl bg-[#fcfaff] border-2 border-[#8a4dff]/30 shadow-xs space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#501f92] text-[#d4ff4a] flex items-center justify-center text-xs font-bold">
                            <Link2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-[#0f172a]">Subir Entregable / Links</h4>
                            <p className="text-[11px] text-[#64748b]">Añade uno o múltiples enlaces de producción</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddingDeliverableInline(false)}
                          className="text-[#94a3b8] hover:text-[#0f172a]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSendDeliverable} className="space-y-4">
                        {/* URL inputs */}
                        <div className="space-y-2">
                          <label className="block text-[11px] font-bold text-[#334155]">
                            Enlaces de Producción (Figma, GitHub, Drive, Vercel, etc.)
                          </label>
                          {deliverableUrls.map((url, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="url"
                                required={idx === 0}
                                value={url}
                                onChange={(e) => {
                                  const updated = [...deliverableUrls];
                                  updated[idx] = e.target.value;
                                  setDeliverableUrls(updated);
                                }}
                                placeholder="https://figma.com/... o https://drive.google.com/..."
                                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#8a4dff]"
                              />
                              {deliverableUrls.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setDeliverableUrls(deliverableUrls.filter((_, i) => i !== idx))}
                                  className="text-[#94a3b8] hover:text-[#ef4444] p-1.5"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setDeliverableUrls([...deliverableUrls, ''])}
                            className="text-xs font-bold text-[#501f92] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Añadir otro enlace</span>
                          </button>
                        </div>

                        {/* Acceptance criteria list */}
                        <div className="p-3.5 rounded-xl bg-white border border-[#e2e8f0] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#0f172a] flex items-center gap-1.5">
                              <ListChecks className="w-3.5 h-3.5 text-[#501f92]" />
                              <span>Criterios de Aceptación a Validar</span>
                            </span>
                            <span className="text-[10px] text-[#64748b]">
                              {criteria.filter((c) => c.completed).length}/{criteria.length} marcados
                            </span>
                          </div>

                          <div className="space-y-1.5 max-h-36 overflow-y-auto">
                            {criteria.map((c) => (
                              <div
                                key={c.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs"
                              >
                                <label className="flex items-center gap-2 cursor-pointer flex-1 mr-2">
                                  <input
                                    type="checkbox"
                                    checked={c.completed}
                                    onChange={() => handleToggleCriterion(c.id)}
                                    className="rounded text-[#501f92] focus:ring-[#8a4dff]"
                                  />
                                  <span className={c.completed ? 'text-[#0f172a] font-medium' : 'text-[#64748b]'}>
                                    {c.text}
                                  </span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCriterion(c.id)}
                                  className="text-[#94a3b8] hover:text-[#ef4444] p-1"
                                  title="Eliminar criterio"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Add new criterion inline */}
                          {isAddingCriterion ? (
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={newCriterionInput}
                                onChange={(e) => setNewCriterionInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCriterion();
                                  }
                                }}
                                placeholder="Escribe nuevo criterio..."
                                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[#f8fafc] border border-[#8a4dff] focus:outline-none"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleAddCriterion()}
                                className="px-3 py-1.5 rounded-xl bg-[#501f92] text-white text-xs font-bold hover:bg-[#381566] cursor-pointer"
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingCriterion(false);
                                  setNewCriterionInput('');
                                }}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsAddingCriterion(true)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#501f92] hover:text-[#381566] hover:underline pt-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Agregar Criterio de Aceptación</span>
                            </button>
                          )}
                        </div>

                        {/* Tagging Reviewers */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-[#334155]">
                            Taggear Revisor(es) a Notificar
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {['Paola (Lead PM)', 'Andrés Ríos', 'Catalina Tejada', 'Laura Gómez', 'Carlos Mendoza'].map(
                              (reviewer) => {
                                const isSelected = selectedReviewers.includes(reviewer);
                                return (
                                  <button
                                    key={reviewer}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        if (selectedReviewers.length > 1) {
                                          setSelectedReviewers(selectedReviewers.filter((r) => r !== reviewer));
                                        }
                                      } else {
                                        setSelectedReviewers([...selectedReviewers, reviewer]);
                                      }
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                                      isSelected
                                        ? 'bg-[#501f92] text-white border-[#501f92] shadow-2xs'
                                        : 'bg-white text-[#475569] border-[#e2e8f0] hover:border-[#8a4dff]/40 hover:bg-[#f8fafc]'
                                    }`}
                                  >
                                    <span>@{reviewer}</span>
                                    {isSelected && <Check className="w-3 h-3 text-[#d4ff4a]" />}
                                  </button>
                                );
                              }
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                          <button
                            type="button"
                            onClick={() => setIsAddingDeliverableInline(false)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Subir Entregable(s)</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Deliverables List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-[#0f172a] uppercase tracking-wider">
                        Historial de Entregables ({task.deliverables?.length || 0})
                      </h3>
                      {!isAddingDeliverableInline && (
                        <button
                          onClick={() => setIsAddingDeliverableInline(true)}
                          className="text-xs font-bold text-[#501f92] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Subir Entregable</span>
                        </button>
                      )}
                    </div>

                    {(!task.deliverables || task.deliverables.length === 0) ? (
                      <div className="p-8 text-center border-2 border-dashed border-[#e2e8f0] rounded-2xl">
                        <Link2 className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                        <p className="text-xs font-medium text-[#64748b]">No hay entregables subidos todavía.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {task.deliverables.map((del) => {
                          const linkList = del.urls && del.urls.length > 0 ? del.urls : (del.url ? [del.url] : []);
                          return (
                            <div
                              key={del.id}
                              className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3 shadow-2xs"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                                    {del.status === 'submitted' ? 'En Revisión' : 'Aprobado'}
                                  </span>
                                  <span className="text-[11px] text-[#64748b]">
                                    Subido por <strong className="text-[#0f172a]">{del.submittedBy}</strong> · {del.submittedAt}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 text-[10px] text-[#501f92] font-bold bg-[#f2ecfb] px-2 py-0.5 rounded-md">
                                  <span>Revisor(es): {del.taggedReviewers?.join(', ') || del.taggedReviewer || 'Paola (Lead PM)'}</span>
                                </div>
                              </div>

                              {del.criteriaChecked && del.criteriaChecked.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {del.criteriaChecked.map((cText, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ecfdf5] text-[#065f46] text-[9px] font-bold border border-[#a7f3d0]"
                                    >
                                      <Check className="w-2.5 h-2.5" />
                                      <span>{cText}</span>
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2 pt-1">
                                {linkList.map((linkUrl, lIdx) => (
                                  <a
                                    key={lIdx}
                                    href={linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e2e8f0] text-xs font-bold text-[#501f92] hover:bg-[#f2ecfb] hover:border-[#8a4dff]/40 transition-colors shadow-2xs"
                                  >
                                    <Link2 className="w-3.5 h-3.5 text-[#501f92]" />
                                    <span className="truncate max-w-[240px]">{linkUrl}</span>
                                    <ExternalLink className="w-3 h-3 text-[#94a3b8]" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SMART BENTO SIDEBAR (Cols 8-12) */}
          <div className="lg:col-span-5 p-4 bg-[#fbfbfe] space-y-3 overflow-y-auto max-h-full">
            {/* 1. PROJECT NATURE & PHASE STEPPER (Backlog & Fee Sync) */}
            <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#501f92]" />
                  <span>Naturaleza & Fase</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f2ecfb] text-[#501f92]">
                  {task.projectType === 'fee_monthly' ? 'Fee Mensual' : 'Proyecto con Fases'}
                </span>
              </div>

              {task.projectType === 'fixed_milestones' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#64748b] block">
                    Fase del Proyecto (Backlog sincronizado):
                  </label>
                  <select
                    value={task.phase || 'UI/UX & Prototipado'}
                    onChange={(e) => onUpdatePhase && onUpdatePhase(task.id, e.target.value as ProjectPhase)}
                    className="w-full px-3 py-2 text-xs font-bold text-[#2563eb] bg-[#eff6ff] border border-[#bfdbfe] rounded-xl focus:outline-none cursor-pointer"
                  >
                    {PROJECT_PHASES_TEMPLATES.map((phase) => (
                      <option key={phase} value={phase}>
                        {phase}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase block">
                    Categoría de Actividad Fee
                  </span>
                  <span className="text-xs font-bold text-[#501f92] block">
                    {task.feeCategory || 'Mantenimiento & Actualizaciones'}
                  </span>
                </div>
              )}
            </div>

            {/* 2. STANDBY & BLOCKER TRACEABILITY (Demora de Cliente vs Colaborador) */}
            <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444]" />
                  <span>Control de Bloqueos & Demoras</span>
                </span>
                {isBlocked ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#991b1b] animate-pulse">
                    En Standby
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46]">
                    Fluido
                  </span>
                )}
              </div>

              {isBlocked ? (
                <div className="space-y-2.5 p-3 rounded-xl bg-[#fff5f5] border border-[#fca5a5]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#7f1d1d]">
                      Demora Imputable:
                    </span>
                    <span className="font-bold text-xs text-[#991b1b]">
                      {task.blockerInfo?.responsibleParty || 'Cliente'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#7f1d1d]">
                      Días en Standby:
                    </span>
                    <span className="font-mono font-black text-xs text-[#dc2626] bg-white px-2 py-0.5 rounded border border-[#fca5a5]">
                      +{task.blockerInfo?.blockedDays || 4} días
                    </span>
                  </div>

                  <p className="text-[10px] text-[#7f1d1d] leading-snug">
                    {task.blockerInfo?.reasonText}
                  </p>

                  <div className="pt-2 border-t border-[#fed7aa] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleTriggerRecalibration}
                      className="w-full py-2 bg-[#501f92] hover:bg-[#381566] text-white text-[11px] font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#d4ff4a]" />
                      <span>Recalibrar Fechas (+{task.blockerInfo?.blockedDays || 4}d)</span>
                    </button>
                  </div>
                </div>
              ) : isRegisteringBlocker ? (
                <div className="space-y-2.5 p-3 rounded-xl bg-[#f8fafc] border border-[#8a4dff] animate-in fade-in">
                  <div>
                    <label className="text-[10px] font-bold text-[#334155] block mb-1">
                      Responsable de la Demora *
                    </label>
                    <select
                      value={blockerResponsibleSelect}
                      onChange={(e) => setBlockerResponsibleSelect(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-semibold"
                    >
                      <option value="Cliente">Cliente (Demora en Insumos / Credenciales)</option>
                      <option value="Uhura / Interno">Uhura / Interno (Dependencia Técnica)</option>
                      <option value="Tercero / Proveedor">Tercero / Proveedor</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#334155] block mb-1">
                      Días estimados en Standby
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={blockerDaysInput}
                      onChange={(e) => setBlockerDaysInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#334155] block mb-1">
                      Motivo / Detalle del Bloqueo
                    </label>
                    <textarea
                      rows={2}
                      value={blockerNotesInput}
                      onChange={(e) => setBlockerNotesInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs"
                      placeholder="Ej. Esperando llaves de API de la pasarela..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRegisteringBlocker(false)}
                      className="px-2.5 py-1 rounded-lg text-[10px] text-[#64748b] hover:bg-[#e2e8f0]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNewBlocker}
                      className="px-3 py-1 bg-[#501f92] text-white text-[10px] font-bold rounded-lg hover:bg-[#381566]"
                    >
                      Registrar Standby / Alerta
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRegisteringBlocker(true)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-[#cbd5e1] hover:border-[#8a4dff] text-[#64748b] hover:text-[#501f92] font-semibold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>+ Registrar Espera de Cliente / Insumos</span>
                </button>
              )}
            </div>

            {/* 3. STATUS & PRIORITY */}
            <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                  ESTADO DE LA TAREA
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                  {statusInfo.label}
                </span>
              </div>

              <select
                value={task.status}
                onChange={(e) => onUpdateTaskStatus && onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-xs font-bold text-[#0f172a] bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8a4dff]/20 focus:border-[#8a4dff] cursor-pointer"
              >
                <option value="In Progress">⚡ En Ejecución</option>
                <option value="Review">⏳ En Revisión (PM)</option>
                <option value="Done">✓ Completada / Finalizada</option>
                <option value="To Do">📋 Por Iniciar</option>
              </select>

              <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                  PRIORIDAD:
                </span>
                <select
                  value={task.priority}
                  onChange={(e) => onUpdateTaskPriority && onUpdateTaskPriority(task.id, e.target.value as TaskPriority)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:outline-none"
                >
                  <option value="High">🔴 Alta</option>
                  <option value="Medium">🟡 Media</option>
                  <option value="Low">🟢 Baja</option>
                </select>
              </div>
            </div>

            {/* 4. BURN-RATE & CAPACITY */}
            <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-[#64748b] tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#501f92]" />
                  <span>Control de Horas & Presupuesto</span>
                </span>
                <span className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-full ${
                  isOverBudget ? 'bg-[#fee2e2] text-[#991b1b]' : 'bg-[#f2ecfb] text-[#501f92]'
                }`}>
                  {percent}%
                </span>
              </div>

              {/* 2-Column Grid Metrics */}
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[9px] font-bold text-[#64748b] uppercase block">HRS ESTIMADAS</span>
                  {isEditingBudget ? (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={budgetValue}
                        onChange={(e) => setBudgetValue(e.target.value)}
                        className="w-12 text-center text-xs font-mono font-bold border border-[#8a4dff] rounded py-0.5 bg-white"
                        autoFocus
                      />
                      <button onClick={handleSaveBudget} className="text-[#16a34a] p-0.5 hover:scale-110">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditingBudget(true);
                        setBudgetValue(task.budgetedHours.toString());
                      }}
                      className="font-mono text-xs font-black text-[#501f92] hover:underline mt-1 block w-full cursor-pointer"
                      title="Clic para editar horas estimadas"
                    >
                      {budgetDisplayH}h {budgetDisplayM}m
                    </button>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[9px] font-bold text-[#64748b] uppercase block">HRS EJECUTADAS</span>
                  <span className={`font-mono text-xs font-black mt-1 block ${
                    isOverBudget ? 'text-[#dc2626]' : 'text-[#501f92]'
                  }`}>
                    {displayHours}h {displayMinutes}m
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min(100, percent)}%` }}
                    className={`h-full transition-all duration-500 ${
                      isOverBudget ? 'bg-[#ef4444]' : 'bg-[#501f92]'
                    }`}
                  />
                </div>
                {isOverBudget && (
                  <p className="text-[10px] text-[#dc2626] font-bold text-right">
                    ⚠️ Desvío de +{surplusHours.toFixed(1)}h sobre el presupuesto
                  </p>
                )}
              </div>
            </div>

            {/* 5. CRONOGRAMA & FECHAS CON CALENDARIO INTERACTIVO */}
            <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#501f92]" />
                  <span>Cronograma de Entrega</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (isEditingDates) {
                      handleSaveDates();
                    } else {
                      setStartDateInput(parseToDateInput(task.startDate));
                      setDueDateInput(parseToDateInput(task.dueText || task.dueDate));
                      setIsEditingDates(true);
                    }
                  }}
                  className="text-[11px] font-semibold text-[#501f92] hover:text-[#381566] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isEditingDates ? (
                    <>
                      <Check className="w-3 h-3 text-[#16a34a]" />
                      <span className="text-[#16a34a] font-bold">Guardar</span>
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-3 h-3" />
                      <span>Cambiar Fecha</span>
                    </>
                  )}
                </button>
              </div>

              {isEditingDates ? (
                <div className="space-y-3 pt-1 animate-in fade-in">
                  <div>
                    <label className="text-[10px] font-semibold text-[#64748b] flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3 text-[#501f92]" />
                      <span>Fecha de Inicio</span>
                    </label>
                    <input
                      type="date"
                      value={startDateInput}
                      onChange={(e) => setStartDateInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-[#8a4dff] text-[#0f172a] focus:outline-none shadow-2xs cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#64748b] flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-[#501f92]" />
                      <span>Fecha de Entrega / Vencimiento</span>
                    </label>
                    <input
                      type="date"
                      value={dueDateInput}
                      onChange={(e) => setDueDateInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-[#8a4dff] text-[#0f172a] focus:outline-none shadow-2xs cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingDates(false)}
                      className="px-2.5 py-1 text-[10px] text-[#64748b] hover:bg-[#f1f5f9] rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const start = formatDateOutput(startDateInput, '09:00');
                        const due = formatDateOutput(dueDateInput, '18:00');
                        if (onUpdateDates) {
                          onUpdateDates(task.id, start, due, due);
                        }
                        setIsEditingDates(false);
                      }}
                      className="px-3 py-1.5 text-[11px] font-bold bg-[#501f92] text-white rounded-lg hover:bg-[#381566] shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Aplicar Fecha</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <div
                    onClick={() => {
                      setStartDateInput(parseToDateInput(task.startDate));
                      setDueDateInput(parseToDateInput(task.dueText || task.dueDate));
                      setIsEditingDates(true);
                    }}
                    className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between cursor-pointer hover:border-[#8a4dff]/40 hover:bg-[#f2ecfb]/40 transition-all group"
                    title="Clic para abrir calendario"
                  >
                    <div>
                      <span className="text-[10px] font-semibold text-[#64748b] uppercase block">Inicio</span>
                      <span className="text-xs font-semibold text-[#0f172a] group-hover:text-[#501f92]">
                        {task.startDate || '20 ago. 2026, 09:00'}
                      </span>
                    </div>
                    <Calendar className="w-4 h-4 text-[#94a3b8] group-hover:text-[#501f92]" />
                  </div>

                  <div
                    onClick={() => {
                      setStartDateInput(parseToDateInput(task.startDate));
                      setDueDateInput(parseToDateInput(task.dueText || task.dueDate));
                      setIsEditingDates(true);
                    }}
                    className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between cursor-pointer hover:border-[#8a4dff]/40 hover:bg-[#f2ecfb]/40 transition-all group"
                    title="Clic para abrir calendario"
                  >
                    <div>
                      <span className="text-[10px] font-semibold text-[#64748b] uppercase block">Vencimiento</span>
                      <span className="text-xs font-bold text-[#501f92]">
                        {task.dueText || task.dueDate || '24 ago. 2026, 18:00'}
                      </span>
                    </div>
                    <Calendar className="w-4 h-4 text-[#8a4dff]" />
                  </div>
                </div>
              )}
            </div>

            {/* 6. EQUIPO & RESPONSABILIDADES */}
            <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-3 text-xs">
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#501f92]" />
                <span>Equipo & Responsabilidades</span>
              </span>

              {/* Responsable Principal */}
              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase">Responsable Principal</span>
                  <span className="text-[9px] font-black uppercase text-[#501f92] bg-[#f2ecfb] px-1.5 py-0.2 rounded">
                    Líder
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-xl ${task.assignee.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                    {task.assignee.initials}
                  </div>
                  <select
                    value={task.assignee.name}
                    onChange={(e) => handleChangePM(e.target.value)}
                    className="flex-1 text-xs font-bold text-[#0f172a] bg-transparent border-0 focus:outline-none cursor-pointer hover:text-[#501f92]"
                  >
                    {TEAM_MEMBERS_POOL.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Collaborators */}
              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#501f92]" />
                    <span className="text-[10px] font-bold text-[#64748b] uppercase">
                      Colaboradores ({currentCollaborators.length})
                    </span>
                  </div>
                  {currentCollaborators.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCollaboratorsExpanded(!isCollaboratorsExpanded)}
                      className="text-[10px] font-bold text-[#501f92] hover:underline cursor-pointer"
                    >
                      {isCollaboratorsExpanded ? 'Contraer' : 'Ver'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {currentCollaborators.map((colab) => (
                    <span
                      key={colab.name}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-[#e2e8f0] text-[11px] text-[#334155] font-medium"
                    >
                      <span className={`w-4 h-4 rounded-full ${colab.avatarBg} text-white text-[8px] flex items-center justify-center font-bold`}>
                        {colab.initials}
                      </span>
                      <span>{colab.name.split(' ')[0]}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST FEEDBACK NOTIFICATION */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#0f172a] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-white/20 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* MODAL 1: COMPARTIR TAREA */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#e2e8f0] space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#f1f5f9] text-[#0f172a] flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">Compartir Tarea</h3>
                  <p className="text-[11px] text-[#64748b]">Copia el enlace o resumen operativo</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Enlace Directo */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#475569] block">Enlace Directo Orbit</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`https://orbit.uhuragroup.com/tasks/${task.id}`}
                  className="flex-1 px-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#334155] focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://orbit.uhuragroup.com/tasks/${task.id}`);
                    setShareToast('Enlace copiado al portapapeles');
                    setShowShareModal(false);
                    setTimeout(() => setShareToast(null), 3000);
                  }}
                  className="px-3 py-2 bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </button>
              </div>
            </div>

            {/* Resumen para Slack / Teams */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#475569] block">Formato Resumen (Slack / WhatsApp)</label>
              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs text-[#334155] space-y-1 font-mono">
                <div>📌 <strong>{task.title}</strong></div>
                <div>🏢 Cliente: {task.clientName || 'PrismaKiddos'} · {task.projectName || task.board}</div>
                <div>👤 Responsable: {task.assignee.name}</div>
                <div>⏱️ Presupuesto: {task.budgetedHours}h | Vence: {task.dueText || task.dueDate}</div>
              </div>
              <button
                onClick={() => {
                  const summaryText = `📌 *${task.title}*\n🏢 Cliente: ${task.clientName || 'PrismaKiddos'} (${task.projectName || task.board})\n👤 Responsable: ${task.assignee.name}\n⏱️ Presupuesto: ${task.budgetedHours}h | Vence: ${task.dueText || task.dueDate}\n🔗 https://orbit.uhuragroup.com/tasks/${task.id}`;
                  navigator.clipboard.writeText(summaryText);
                  setShareToast('Resumen copiado para Slack / Teams');
                  setShowShareModal(false);
                  setTimeout(() => setShareToast(null), 3000);
                }}
                className="w-full py-2 bg-[#f2ecfb] hover:bg-[#e6d8fb] text-[#501f92] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-[#8a4dff]/20"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Resumen para Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MOVER TAREA */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#e2e8f0] space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#f1f5f9] text-[#0f172a] flex items-center justify-center">
                  <FolderInput className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">Mover Tarea</h3>
                  <p className="text-[11px] text-[#64748b]">Reasignar a otro proyecto o estado</p>
                </div>
              </div>
              <button
                onClick={() => setShowMoveModal(false)}
                className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Cliente */}
              <div>
                <label className="text-[11px] font-bold text-[#475569] block mb-1">Cliente Destino</label>
                <select
                  value={moveTargetClient}
                  onChange={(e) => setMoveTargetClient(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#cbd5e1] rounded-xl text-[#0f172a] focus:outline-none focus:border-[#501f92]"
                >
                  <option value="PrismaKiddos">PrismaKiddos</option>
                  <option value="Solaris Energy">Solaris Energy</option>
                  <option value="Fintech Nova">Fintech Nova</option>
                  <option value="Uhura Group">Uhura Group (Interno)</option>
                </select>
              </div>

              {/* Proyecto / Board */}
              <div>
                <label className="text-[11px] font-bold text-[#475569] block mb-1">Proyecto / Fee Destino</label>
                <select
                  value={moveTargetProject}
                  onChange={(e) => setMoveTargetProject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#cbd5e1] rounded-xl text-[#0f172a] focus:outline-none focus:border-[#501f92]"
                >
                  <option value="Fee Mantenimiento Web PrismaKiddos">Fee Mantenimiento Web PrismaKiddos</option>
                  <option value="Rediseño Web Corporativa Solaris">Rediseño Web Corporativa Solaris</option>
                  <option value="App Móvil Fintech Nova">App Móvil Fintech Nova</option>
                  <option value="Branding & Campaña Q3">Branding & Campaña Q3</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="text-[11px] font-bold text-[#475569] block mb-1">Estado de Columna</label>
                <select
                  value={moveTargetStatus}
                  onChange={(e) => setMoveTargetStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#cbd5e1] rounded-xl text-[#0f172a] focus:outline-none focus:border-[#501f92]"
                >
                  <option value="To Do">Por Iniciar (To Do)</option>
                  <option value="In Progress">En Ejecución (In Progress)</option>
                  <option value="Review">En Revisión (Review)</option>
                  <option value="Done">Completada (Done)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMoveModal(false)}
                className="px-3 py-2 text-xs text-[#64748b] hover:bg-[#f1f5f9] rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onMoveTask) {
                    onMoveTask(task.id, moveTargetProject, moveTargetClient, moveTargetStatus);
                    setShareToast(`Tarea movida a ${moveTargetProject}`);
                    setShowMoveModal(false);
                    setTimeout(() => setShareToast(null), 3000);
                  }
                }}
                className="px-4 py-2 bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Confirmar y Mover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRMAR ELIMINACIÓN */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#fee2e2] space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fee2e2] text-[#dc2626] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">¿Eliminar Tarea?</h3>
                <p className="text-xs text-[#64748b]">Esta acción es irreversible</p>
              </div>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              ¿Estás seguro de que deseas eliminar la tarea <strong className="text-[#0f172a]">"{task.title}"</strong>? Se eliminarán también sus horas registradas y criterios de aceptación.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-2 text-xs text-[#64748b] hover:bg-[#f1f5f9] rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteTask) {
                    onDeleteTask(task.id);
                  }
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Sí, Eliminar Tarea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
