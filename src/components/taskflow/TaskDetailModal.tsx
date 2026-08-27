import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
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
  Sparkles,
  Paperclip,
  Smile,
  AtSign,
  UploadCloud,
  FileText,
  Copy,
  Archive,
  Trash2,
  MoreHorizontal,
  FolderKanban,
  Flag,
  CheckSquare,
  Bot,
  Users,
  User,
  Star,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import {
  TaskItem,
  ActiveTimerState,
  TaskDeliverable,
  TaskStatus,
  TaskPriority,
  ProjectPhase,
  TaskBlockerInfo
} from './types';

export interface TeamMemberProfile {
  name: string;
  initials: string;
  avatarBg: string;
  role: string;
}

const TEAM_MEMBERS_POOL: TeamMemberProfile[] = [
  { name: 'Paola (Lead PM)', initials: 'PL', avatarBg: 'bg-[#501f92]', role: 'Lead Project Manager' },
  { name: 'Catalina Tejada', initials: 'CT', avatarBg: 'bg-[#501f92]', role: 'Diseñador Gráfico' },
  { name: 'Andrés Ríos', initials: 'AR', avatarBg: 'bg-[#501f92]', role: 'Growth & Tech Lead' },
  { name: 'Camilo Torres', initials: 'CT', avatarBg: 'bg-[#0284c7]', role: 'Desarrollador Web' },
  { name: 'Laura Gómez', initials: 'LG', avatarBg: 'bg-[#059669]', role: 'Frontend Designer' },
  { name: 'Sebas (Trafficker)', initials: 'ST', avatarBg: 'bg-[#d97706]', role: 'Trafficker Digital' },
  { name: 'Luisa Urazán', initials: 'LU', avatarBg: 'bg-[#e11d48]', role: 'Project Manager' },
  { name: 'Alejandro Florez', initials: 'AF', avatarBg: 'bg-[#0891b2]', role: 'QA & UI Reviewer' }
];

const DEFAULT_CRITERIA = [
  { id: 'c-1', text: 'Diseño responsive y optimización de assets', completed: true },
  { id: 'c-2', text: 'Revisión de ortografía, copies y alineación a marca', completed: true },
  { id: 'c-3', text: 'Validación de links y exportación final en alta resolución', completed: false }
];

interface FormattedLink {
  type: 'drive' | 'figma' | 'github' | 'generic';
  title: string;
  url: string;
}

interface ChatMessage {
  id: string;
  authorName: string;
  authorRoleLabel?: string;
  authorInitials: string;
  authorAvatarBg?: string;
  timestamp: string;
  content: string;
  isInitialRequirement?: boolean;
  isSystem?: boolean;
  links?: FormattedLink[];
  attachedFile?: { name: string; size: string };
}

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
    collaborators: TaskItem['collaborators'],
    reviewer?: TaskItem['reviewer'],
    requestedBy?: string
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
  activeTimer,
  onStartTimer,
  onPauseResumeTimer,
  onUpdateBudgetHours,
  onUpdateTaskStatus,
  onUpdateTaskPriority,
  onUpdateDates,
  onUpdateTeam,
  onUpdateCriteria,
  onAddDeliverable,
  onAddComment,
  onDeleteTask,
  onArchiveTask,
  onNavigateToClient,
  onNavigateToProject,
  onOpenManualLog
}) => {
  // Tabs: ONLY 'mensajes' | 'entregables'
  const [activeTab, setActiveTab] = useState<'mensajes' | 'entregables'>('mensajes');

  // Menu and Toast
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Team Edit Popovers: 'collaborators' | 'reviewer' | 'requestedBy' | null
  const [openTeamDropdown, setOpenTeamDropdown] = useState<'collaborators' | 'reviewer' | 'requestedBy' | null>(null);

  // Local team tracking
  const [assignee, setAssignee] = useState<TaskItem['assignee']>(
    task?.assignee || { name: 'Catalina Tejada', initials: 'CT', avatarBg: 'bg-[#501f92]', role: 'Diseñador Gráfico' }
  );
  const [collaborators, setCollaborators] = useState<NonNullable<TaskItem['collaborators']>>(
    task?.collaborators || []
  );
  const [reviewer, setReviewer] = useState<TaskItem['reviewer']>(task?.reviewer);
  const [requestedBy, setRequestedBy] = useState<string>(task?.requestedBy || 'Andrés Ríos');

  // Budget inline edit
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState('');

  // Date inline edit
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [startDateInput, setStartDateInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');

  // Message input state
  const [messageInput, setMessageInput] = useState('');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  // Deliverable tab state
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Acceptance criteria
  const [criteria, setCriteria] = useState<{ id: string; text: string; completed: boolean }[]>(DEFAULT_CRITERIA);
  const [newCriterionInput, setNewCriterionInput] = useState('');
  const [isAddingCriterion, setIsAddingCriterion] = useState(false);

  // Conversation feed
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (task) {
      setAssignee(
        task.assignee || { name: 'Catalina Tejada', initials: 'CT', avatarBg: 'bg-[#501f92]', role: 'Diseñador Gráfico' }
      );
      setCollaborators(task.collaborators || []);
      setReviewer(task.reviewer);
      setRequestedBy(task.requestedBy || 'Andrés Ríos');
      setOpenTeamDropdown(null);

      setBudgetValue((task.budgetedHours || 1).toString());
      setStartDateInput(task.startDate || '2026-08-20');
      setDueDateInput(task.dueDate || '2026-08-24');

      const initialCriteria =
        task.acceptanceCriteria && task.acceptanceCriteria.length > 0
          ? task.acceptanceCriteria
          : DEFAULT_CRITERIA;
      setCriteria(initialCriteria);

      // Only load genuine messages if present on task, otherwise keep conversation clean
      const initialMsgs: ChatMessage[] = [];
      if (task.messages && task.messages.length > 0) {
        task.messages.forEach((m) => {
          initialMsgs.push({
            id: m.id,
            authorName: m.authorName,
            authorRoleLabel: 'Comentario',
            authorInitials: m.authorInitials || m.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
            authorAvatarBg: m.authorAvatarBg || 'bg-[#501f92]',
            timestamp: m.timestamp,
            content: m.content
          });
        });
      }

      setChatMessages(initialMsgs);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isRunning = activeTimer?.taskId === task.id;
  const consumedHours = (task.consumedSeconds || 0) / 3600;
  const budgetedHours = task.budgetedHours || 8;
  const remainingHours = Math.max(0, budgetedHours - consumedHours);
  const percentHours = Math.round((consumedHours / budgetedHours) * 100);

  // Check dependency status
  const depTask = tasksList?.find(
    (t) => t.id === task.dependencyTaskId || t.title.toLowerCase() === task.dependencyTaskTitle?.toLowerCase()
  );
  const isDepResolved = depTask
    ? depTask.completed || depTask.status === 'Done'
    : task.completed || task.status === 'Done';

  // Toggle criterion
  const handleToggleCriterion = (id: string) => {
    const updated = criteria.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c));
    setCriteria(updated);
    if (onUpdateCriteria) {
      onUpdateCriteria(task.id, updated);
    }
  };

  // Add criterion
  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCriterionInput.trim()) return;
    const newCrit = {
      id: `c-${Date.now()}`,
      text: newCriterionInput.trim(),
      completed: false
    };
    const updated = [...criteria, newCrit];
    setCriteria(updated);
    if (onUpdateCriteria) {
      onUpdateCriteria(task.id, updated);
    }
    setNewCriterionInput('');
    setIsAddingCriterion(false);
    showToast('Criterio de aceptación agregado');
  };

  // Send Chat Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() && !attachedFileName) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      authorName: 'Catalina Tejada',
      authorRoleLabel: 'Ejecutor',
      authorInitials: 'CT',
      authorAvatarBg: 'bg-[#501f92]',
      timestamp: 'Ahora mismo',
      content: messageInput.trim(),
      attachedFile: attachedFileName ? { name: attachedFileName, size: '2.4 MB' } : undefined
    };

    setChatMessages((prev) => [...prev, newMessage]);
    if (onAddComment && messageInput.trim()) {
      onAddComment(task.id, messageInput.trim());
    }

    setMessageInput('');
    setAttachedFileName(null);
    setShowMentionMenu(false);
  };

  // Submit Deliverable
  const handleSubmitDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableUrl.trim() && !uploadedFileName) {
      showToast('Ingresa una URL o sube un archivo');
      return;
    }

    if (onAddDeliverable) {
      onAddDeliverable(task.id, {
        url: deliverableUrl.trim() || uploadedFileName || 'Entrega de producción',
        title: deliverableNotes.trim() || 'Entregable de producción',
        submittedBy: task.assignee.name || 'Catalina Tejada',
        notes: deliverableNotes.trim(),
        status: 'submitted',
        taggedReviewer: task.reviewer?.name || 'Paola Monsalve'
      });
    }

    // Set task status to Review
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(task.id, 'Review');
    }

    // Add a system update in chat
    setChatMessages((prev) => [
      ...prev,
      {
        id: `deliv-${Date.now()}`,
        authorName: 'Sistema',
        authorInitials: 'SYS',
        timestamp: 'Ahora mismo',
        content: `${task.assignee.name || 'El colaborador'} envió el entregable formal a revisión.`,
        isSystem: true
      }
    ]);

    setDeliverableUrl('');
    setDeliverableNotes('');
    setUploadedFileName(null);
    showToast('Entregable enviado a revisión con éxito');
    setActiveTab('mensajes');
  };

  // Save budget
  const handleSaveBudget = () => {
    const num = parseFloat(budgetValue);
    if (!isNaN(num) && num > 0 && onUpdateBudgetHours) {
      onUpdateBudgetHours(task.id, num);
    }
    setIsEditingBudget(false);
    showToast('Horas estimadas actualizadas');
  };

  // Save dates
  const handleSaveDates = () => {
    if (onUpdateDates) {
      onUpdateDates(task.id, startDateInput, dueDateInput, 'En cronograma');
    }
    setIsEditingDates(false);
    showToast('Cronograma actualizado');
  };

  // Team update helpers
  const applyTeamUpdate = (
    newAssignee: TaskItem['assignee'],
    newCollabs: NonNullable<TaskItem['collaborators']>,
    newReviewer?: TaskItem['reviewer'],
    newRequester?: string
  ) => {
    setAssignee(newAssignee);
    setCollaborators(newCollabs);
    setReviewer(newReviewer);
    if (newRequester) setRequestedBy(newRequester);

    if (onUpdateTeam && task) {
      onUpdateTeam(task.id, newAssignee, newCollabs, newReviewer, newRequester || requestedBy);
    }
  };

  // Toggle collaborator in pool
  const handleToggleCollaborator = (member: TeamMemberProfile) => {
    const isCurrentAssignee = assignee.name === member.name;
    const isCurrentCollab = collaborators.some((c) => c.name === member.name);

    if (isCurrentAssignee) {
      // If removing current primary assignee, check if there's any other collaborator to promote
      const nextCollab = collaborators.find((c) => c.name !== member.name);
      if (nextCollab) {
        const remaining = collaborators.filter((c) => c.name !== member.name && c.name !== nextCollab.name);
        applyTeamUpdate(nextCollab, remaining, reviewer, requestedBy);
        showToast(`${nextCollab.name} es ahora el ejecutor principal`);
      } else {
        showToast('La tarea debe tener al menos un colaborador asignado');
      }
    } else if (isCurrentCollab) {
      // Remove from collaborators
      const updated = collaborators.filter((c) => c.name !== member.name);
      applyTeamUpdate(assignee, updated, reviewer, requestedBy);
      showToast(`${member.name} removido de colaboradores`);
    } else {
      // Add to collaborators
      const newEntry = {
        name: member.name,
        initials: member.initials,
        avatarBg: member.avatarBg,
        role: member.role
      };
      const updated = [...collaborators, newEntry];
      applyTeamUpdate(assignee, updated, reviewer, requestedBy);
      showToast(`${member.name} añadido como colaborador`);
    }
  };

  // Set member as primary assignee
  const handleSetPrimaryAssignee = (member: TeamMemberProfile) => {
    const previousAssignee = assignee;
    const newAssignee = {
      name: member.name,
      initials: member.initials,
      avatarBg: member.avatarBg,
      role: member.role
    };

    // Filter out new assignee from collaborators, and add previous assignee if not already there
    const cleanCollabs = collaborators.filter((c) => c.name !== member.name);
    if (previousAssignee && previousAssignee.name !== member.name) {
      cleanCollabs.push(previousAssignee);
    }

    applyTeamUpdate(newAssignee, cleanCollabs, reviewer, requestedBy);
    showToast(`${member.name} asignado como ejecutor principal`);
  };

  // Select reviewer
  const handleSelectReviewer = (member: TeamMemberProfile | null) => {
    if (!member) {
      applyTeamUpdate(assignee, collaborators, undefined, requestedBy);
      showToast('Revisor eliminado (opcional)');
    } else {
      const newRev = {
        name: member.name,
        initials: member.initials,
        avatarBg: member.avatarBg,
        role: member.role
      };
      applyTeamUpdate(assignee, collaborators, newRev, requestedBy);
      showToast(`${member.name} asignado como revisor`);
    }
    setOpenTeamDropdown(null);
  };

  // Select requester (Solicitada por)
  const handleSelectRequester = (member: TeamMemberProfile) => {
    applyTeamUpdate(assignee, collaborators, reviewer, member.name);
    showToast(`Solicitada por: ${member.name}`);
    setOpenTeamDropdown(null);
  };

  // Format mentions in text
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(@[A-Za-zÁ-ÿ0-9_() ]+)/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith('@')) {
            return (
              <span key={i} className="font-semibold text-[#501f92] bg-[#f5f3ff] px-1 py-0.5 rounded-md">
                {part}
              </span>
            );
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <div
      id="task-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="task-detail-toast"
          className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#0f172a] text-white text-xs font-bold shadow-xl border border-[#334155] flex items-center gap-2 animate-in slide-in-from-top-2"
        >
          <Sparkles className="w-4 h-4 text-[#d4ff4a]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div
        id="task-detail-modal-container"
        className="bg-white rounded-3xl max-w-5xl w-full border border-[#e2e8f0] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* ========================================================= */}
        {/* HEADER: Cliente > Proyecto > Frente | Title | Timer | + | 3-dots | X */}
        {/* ========================================================= */}
        <div
          id="task-detail-header"
          className="px-6 py-4 border-b border-[#f1f5f9] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0"
        >
          {/* Left: Interactive Breadcrumbs & Title */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#64748b]">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToClient && task.clientName) {
                    onNavigateToClient(task.clientName);
                  }
                }}
                title={`Ver cliente ${task.clientName || 'Cliente'}`}
                className="inline-flex items-center gap-1 font-bold text-[#501f92] hover:underline cursor-pointer transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{task.clientName || 'Danone S.A.'}</span>
              </button>

              <span className="text-[#cbd5e1]">›</span>

              <button
                type="button"
                onClick={() => {
                  const pName = task.projectName || task.board;
                  if (onNavigateToProject && pName) {
                    onNavigateToProject(pName);
                  }
                }}
                title={`Ver tareas del proyecto ${task.projectName || task.board}`}
                className="font-semibold text-[#0f172a] hover:text-[#501f92] hover:underline cursor-pointer transition-colors"
              >
                {task.projectName || task.board}
              </button>

              {task.frente && (
                <>
                  <span className="text-[#cbd5e1]">›</span>
                  <span className="font-semibold text-[#64748b]" title={`Frente de trabajo: ${task.frente}`}>
                    {task.frente}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight truncate">
              {task.title}
            </h1>
          </div>

          {/* Right: Actions Toolbar */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {/* Timer CTA */}
            {isRunning ? (
              <button
                id="task-timer-toggle-btn"
                onClick={onPauseResumeTimer}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer transition-all ${
                  activeTimer?.isPaused ? 'bg-[#f59e0b] hover:bg-[#d97706]' : 'bg-[#10b981] hover:bg-[#059669]'
                }`}
              >
                {activeTimer?.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                <span>{activeTimer?.isPaused ? 'Reanudar' : 'Timer Activo'}</span>
              </button>
            ) : (
              <button
                id="task-timer-start-btn"
                onClick={() => onStartTimer(task)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Iniciar Timer</span>
              </button>
            )}

            {/* Manual Time Logging Icon Button with Tooltip */}
            {onOpenManualLog && (
              <div className="relative group">
                <button
                  id="task-manual-time-btn"
                  onClick={() => onOpenManualLog(task.id)}
                  aria-label="Registrar tiempo manualmente"
                  className="p-2 rounded-xl bg-white hover:bg-[#f8fafc] text-[#501f92] border border-[#e2e8f0] shadow-2xs hover:border-[#8a4dff]/40 transition-all cursor-pointer flex items-center justify-center relative"
                >
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-[#501f92]" />
                    <Plus className="w-2.5 h-2.5 text-[#501f92] -ml-0.5 -mt-1 stroke-[3]" />
                  </div>
                </button>

                {/* Hover Tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:flex items-center px-2.5 py-1 rounded-lg bg-[#0f172a] text-white text-[10px] font-semibold whitespace-nowrap z-50 pointer-events-none shadow-lg">
                  Registrar tiempo manualmente
                </div>
              </div>
            )}

            {/* ··· Menu dropdown */}
            <div className="relative">
              <button
                id="task-options-menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl bg-white hover:bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] transition-colors cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-white border border-[#e2e8f0] shadow-xl py-1.5 z-50 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Enlace de tarea copiado al portapapeles');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-[#f8fafc] text-[#334155] flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#64748b]" />
                    <span>Copiar enlace</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onArchiveTask) onArchiveTask(task.id);
                      showToast('Tarea archivada');
                      setIsMenuOpen(false);
                      onClose();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-[#f8fafc] text-[#334155] flex items-center gap-2 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5 text-[#64748b]" />
                    <span>Archivar tarea</span>
                  </button>

                  {onDeleteTask && (
                    <button
                      onClick={() => {
                        onDeleteTask(task.id);
                        showToast('Tarea eliminada');
                        setIsMenuOpen(false);
                        onClose();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#fee2e2] text-[#dc2626] flex items-center gap-2 cursor-pointer border-t border-[#f1f5f9]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar tarea</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              id="task-detail-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN BODY: 2 Columns (Left: Tabs Feed vs Right: Meta Panel) */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#f1f5f9]">
          {/* --------------------------------------------------------- */}
          {/* LEFT: ONLY 2 TABS (Mensajes | Entregables) - 8 COLS */}
          {/* --------------------------------------------------------- */}
          <div className="lg:col-span-8 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Tabs Navigation Header */}
              <div className="flex items-center gap-6 border-b border-[#e2e8f0]">
                <button
                  id="tab-mensajes-btn"
                  onClick={() => setActiveTab('mensajes')}
                  className={`pb-2.5 text-sm font-bold transition-all cursor-pointer relative ${
                    activeTab === 'mensajes'
                      ? 'text-[#501f92] font-extrabold'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  <span>Mensajes</span>
                  {activeTab === 'mensajes' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#501f92] rounded-full" />
                  )}
                </button>

                <button
                  id="tab-entregables-btn"
                  onClick={() => setActiveTab('entregables')}
                  className={`pb-2.5 text-sm font-bold transition-all cursor-pointer relative ${
                    activeTab === 'entregables'
                      ? 'text-[#501f92] font-extrabold'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  <span>Entregables</span>
                  {activeTab === 'entregables' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#501f92] rounded-full" />
                  )}
                </button>
              </div>

              {/* --------------------------------------------------- */}
              {/* TAB 1: MENSAJES (Conversation & Requirement Feed) */}
              {/* --------------------------------------------------- */}
              {activeTab === 'mensajes' && (
                <div id="tab-mensajes-content" className="space-y-4">
                  {/* Dedicated Initial Requirement Box if present on task */}
                  {task.description && (
                    <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-[#501f92] uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#501f92]" /> Requerimiento inicial
                        </span>
                        <span className="text-[10px] text-[#94a3b8]">
                          {task.date || 'Inicio de tarea'}
                        </span>
                      </div>
                      <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">
                        {task.description}
                      </p>
                    </div>
                  )}

                  {/* Messages Stream */}
                  {chatMessages.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#94a3b8] bg-[#f8fafc]/50 rounded-2xl border border-dashed border-[#e2e8f0]">
                      <MessageSquare className="w-6 h-6 mx-auto mb-2 text-[#cbd5e1]" />
                      <p className="font-bold text-[#64748b]">Aún no hay mensajes</p>
                      <p className="text-[11px] text-[#94a3b8] mt-0.5">Escribe un comentario o consulta para el equipo.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                      {chatMessages.map((msg) => {
                        // System Event
                        if (msg.isSystem) {
                          return (
                            <div
                              key={msg.id}
                              className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f8fafc] border border-[#f1f5f9] text-xs text-[#64748b]"
                            >
                              <div className="w-6 h-6 rounded-full bg-[#f3e8ff] text-[#501f92] flex items-center justify-center font-bold shrink-0">
                                <Bot className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#0f172a]">Sistema</span>
                                <span className="text-[11px] text-[#94a3b8]">{msg.timestamp}</span>
                              </div>
                              <span className="text-[#334155] font-medium ml-1">· {msg.content}</span>
                            </div>
                          );
                        }

                        // User / Collaborator / Revisor Message
                        return (
                          <div
                            key={msg.id}
                            className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-xs hover:border-[#cbd5e1] transition-colors"
                          >
                            {/* Avatar */}
                            <div
                              className={`w-8 h-8 rounded-full ${
                                msg.authorAvatarBg || 'bg-[#501f92]'
                              } text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs`}
                            >
                              {msg.authorInitials}
                            </div>

                            {/* Message Body */}
                            <div className="flex-1 space-y-2">
                              {/* Author header */}
                              <div className="flex flex-wrap items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-[#0f172a]">{msg.authorName}</span>
                                  {msg.authorRoleLabel && (
                                    <>
                                      <span className="text-[#94a3b8]">·</span>
                                      <span className="text-[#64748b] font-medium">{msg.authorRoleLabel}</span>
                                    </>
                                  )}
                                  {msg.isInitialRequirement && (
                                    <span className="px-2 py-0.5 rounded-full bg-[#f5f3ff] text-[#501f92] font-extrabold text-[10px] border border-[#ddd6fe]">
                                      Requerimiento inicial
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-[#94a3b8]">{msg.timestamp}</span>
                              </div>

                              {/* Text content */}
                              <p className="text-xs text-[#334155] leading-relaxed">
                                {renderMessageContent(msg.content)}
                              </p>

                              {/* Links & Attachments Preview Cards */}
                              {msg.links && msg.links.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  {msg.links.map((link, lIdx) => (
                                    <a
                                      key={lIdx}
                                      href={`https://${link.url}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#501f92] transition-colors group cursor-pointer max-w-md shadow-2xs"
                                    >
                                      {link.type === 'drive' ? (
                                        <div className="w-7 h-7 rounded-lg bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center shrink-0 font-bold">
                                          <FolderKanban className="w-4 h-4" />
                                        </div>
                                      ) : (
                                        <div className="w-7 h-7 rounded-lg bg-[#f5f3ff] text-[#501f92] flex items-center justify-center shrink-0 font-bold">
                                          <Sparkles className="w-4 h-4" />
                                        </div>
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <span className="block font-bold text-[#0f172a] text-xs truncate group-hover:text-[#501f92]">
                                          {link.title}
                                        </span>
                                        <span className="block text-[10px] text-[#64748b] truncate font-mono">
                                          {link.url}
                                        </span>
                                      </div>
                                      <ExternalLink className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#501f92] shrink-0" />
                                    </a>
                                  ))}
                                </div>
                              )}

                              {/* Attached File Preview */}
                              {msg.attachedFile && (
                                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#e2e8f0] text-xs max-w-xs">
                                  <FileText className="w-4 h-4 text-[#501f92]" />
                                  <span className="font-semibold text-[#0f172a] truncate">{msg.attachedFile.name}</span>
                                  <span className="text-[10px] text-[#94a3b8]">({msg.attachedFile.size})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* --------------------------------------------------- */}
              {/* TAB 2: ENTREGABLES (Formal Delivery & Approval) */}
              {/* --------------------------------------------------- */}
              {activeTab === 'entregables' && (
                <div id="tab-entregables-content" className="space-y-5">
                  <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-4 text-xs">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0f172a]">Entrega Formal de Trabajo</h3>
                      <p className="text-[11px] text-[#64748b] mt-0.5">
                        Registra el entregable final con sus enlaces de producción o archivos para validación.
                      </p>
                    </div>

                    <form onSubmit={handleSubmitDeliverable} className="space-y-3.5">
                      {/* URL / Enlace */}
                      <div>
                        <label className="block font-bold text-[#334155] mb-1">URL / Enlace de Producción *</label>
                        <div className="relative">
                          <input
                            type="url"
                            placeholder="https://figma.com/file/..., https://drive.google.com/..., https://github.com/..."
                            value={deliverableUrl}
                            onChange={(e) => setDeliverableUrl(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#501f92] shadow-2xs"
                          />
                          <Link2 className="w-4 h-4 text-[#94a3b8] absolute left-3 top-2.5" />
                        </div>
                      </div>

                      {/* Opción de subir archivo */}
                      <div>
                        <label className="block font-bold text-[#334155] mb-1">Subir Archivo o Comprobante (Opcional)</label>
                        <label className="border-2 border-dashed border-[#cbd5e1] hover:border-[#501f92] bg-white rounded-xl p-3.5 flex items-center justify-center gap-2.5 cursor-pointer transition-colors text-center">
                          <UploadCloud className="w-5 h-5 text-[#501f92]" />
                          <div className="text-left">
                            <span className="font-bold text-[#0f172a] text-xs block">
                              {uploadedFileName || 'Haz clic para seleccionar o arrastra un archivo'}
                            </span>
                            <span className="text-[10px] text-[#64748b]">PNG, JPG, PDF, ZIP hasta 25MB</span>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setUploadedFileName(e.target.files[0].name);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Criterios de Aceptación */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#e2e8f0] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#334155] flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-[#501f92]" />
                            Criterios de Aceptación ({criteria.filter((c) => c.completed).length}/{criteria.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsAddingCriterion(!isAddingCriterion)}
                            className="text-[11px] font-bold text-[#501f92] hover:underline cursor-pointer"
                          >
                            + Agregar
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {criteria.map((c) => (
                            <label
                              key={c.id}
                              className="flex items-start gap-2.5 p-2 rounded-lg bg-[#f8fafc] border border-[#f1f5f9] hover:bg-[#f1f5f9] cursor-pointer text-xs transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={c.completed}
                                onChange={() => handleToggleCriterion(c.id)}
                                className="mt-0.5 rounded text-[#501f92] focus:ring-0 cursor-pointer"
                              />
                              <span
                                className={
                                  c.completed ? 'line-through text-[#94a3b8]' : 'text-[#0f172a] font-medium'
                                }
                              >
                                {c.text}
                              </span>
                            </label>
                          ))}
                        </div>

                        {isAddingCriterion && (
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Nuevo criterio de aceptación..."
                              value={newCriterionInput}
                              onChange={(e) => setNewCriterionInput(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-xs"
                            />
                            <button
                              type="button"
                              onClick={handleAddCriterion}
                              className="px-3 py-1.5 rounded-lg bg-[#501f92] text-white text-xs font-bold cursor-pointer"
                            >
                              Añadir
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Comentario de entrega opcional */}
                      <div>
                        <label className="block font-bold text-[#334155] mb-1">
                          Comentario de entrega (Opcional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Describe qué contiene la entrega o qué puntos clave deben revisarse..."
                          value={deliverableNotes}
                          onChange={(e) => setDeliverableNotes(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#501f92] resize-none"
                        />
                      </div>

                      {/* CTA Enviar a revisión */}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar a revisión</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Unified Message Box (Always available on Mensajes tab) */}
            {activeTab === 'mensajes' && (
              <div className="pt-2 border-t border-[#f1f5f9]">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2.5 bg-white p-2 rounded-2xl border border-[#e2e8f0] shadow-xs focus-within:border-[#501f92] transition-colors"
                >
                  {/* User Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#501f92] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    CT
                  </div>

                  {/* Input field */}
                  <input
                    type="text"
                    placeholder="Escribe un mensaje o actualización…"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none bg-transparent"
                  />

                  {/* Attached File indicator */}
                  {attachedFileName && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[10px] text-[#475569] font-medium">
                      <Paperclip className="w-2.5 h-2.5" />
                      <span className="truncate max-w-[80px]">{attachedFileName}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFileName(null)}
                        className="text-[#94a3b8] hover:text-[#ef4444]"
                      >
                        ✕
                      </button>
                    </span>
                  )}

                  {/* Toolbar icons */}
                  <div className="flex items-center gap-1 text-[#64748b]">
                    {/* Paperclip */}
                    <label className="p-1.5 rounded-lg hover:bg-[#f1f5f9] hover:text-[#0f172a] cursor-pointer transition-colors">
                      <Paperclip className="w-4 h-4" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAttachedFileName(e.target.files[0].name);
                          }
                        }}
                      />
                    </label>

                    {/* @ Mention */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowMentionMenu(!showMentionMenu)}
                        className="p-1.5 rounded-lg hover:bg-[#f1f5f9] hover:text-[#0f172a] cursor-pointer transition-colors"
                      >
                        <AtSign className="w-4 h-4" />
                      </button>

                      {showMentionMenu && (
                        <div className="absolute bottom-full right-0 mb-2 w-48 rounded-xl bg-white border border-[#e2e8f0] shadow-xl py-1 z-50 text-xs">
                          <span className="px-3 py-1 text-[10px] font-bold text-[#94a3b8] uppercase block">
                            Mencionar a:
                          </span>
                          {TEAM_MEMBERS_POOL.map((m) => (
                            <button
                              key={m.name}
                              type="button"
                              onClick={() => {
                                setMessageInput((prev) => `${prev} @${m.name} `);
                                setShowMentionMenu(false);
                              }}
                              className="w-full px-3 py-1.5 text-left hover:bg-[#f8fafc] text-[#0f172a] flex items-center gap-2 cursor-pointer"
                            >
                              <span className={`w-4 h-4 rounded-full ${m.avatarBg} text-white flex items-center justify-center text-[8px] font-bold`}>
                                {m.initials}
                              </span>
                              <span className="truncate">{m.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Smile */}
                    <button
                      type="button"
                      onClick={() => setMessageInput((prev) => `${prev} 👍`)}
                      className="p-1.5 rounded-lg hover:bg-[#f1f5f9] hover:text-[#0f172a] cursor-pointer transition-colors"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    {/* Send button */}
                    <button
                      type="submit"
                      disabled={!messageInput.trim() && !attachedFileName}
                      className={`p-2 rounded-xl text-white transition-colors cursor-pointer ${
                        messageInput.trim() || attachedFileName
                          ? 'bg-[#501f92] hover:bg-[#381566]'
                          : 'bg-[#cbd5e1] cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* --------------------------------------------------------- */}
          {/* RIGHT RAIL: METADATA & RESPONSIBLES - 4 COLS */}
          {/* --------------------------------------------------------- */}
          <div id="task-right-rail" className="lg:col-span-4 p-6 bg-white space-y-5 text-xs">
            {/* 1. Estado & Prioridad (2 Columns side-by-side) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#64748b] mb-1.5">Estado</label>
                <div className="relative">
                  <select
                    id="task-status-select"
                    value={task.status}
                    onChange={(e) => {
                      if (onUpdateTaskStatus) onUpdateTaskStatus(task.id, e.target.value as TaskStatus);
                      showToast(`Estado cambiado a ${e.target.value}`);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white font-bold text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92] cursor-pointer shadow-2xs appearance-none pr-8"
                  >
                    <option value="To Do">⚪ Por hacer</option>
                    <option value="In Progress">🟡 En proceso</option>
                    <option value="Review">🔍 En revisión</option>
                    <option value="Done">🟢 Listo</option>
                  </select>
                  <span className="absolute right-2.5 top-3 pointer-events-none text-[#64748b] text-[10px]">▼</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748b] mb-1.5">Prioridad</label>
                <div className="relative">
                  <select
                    id="task-priority-select"
                    value={task.priority}
                    onChange={(e) => {
                      if (onUpdateTaskPriority) onUpdateTaskPriority(task.id, e.target.value as TaskPriority);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white font-bold text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92] cursor-pointer shadow-2xs appearance-none pr-8"
                  >
                    <option value="Low">🟢 Baja</option>
                    <option value="Medium">🚩 Media</option>
                    <option value="High">🔴 Alta</option>
                  </select>
                  <span className="absolute right-2.5 top-3 pointer-events-none text-[#64748b] text-[10px]">▼</span>
                </div>
              </div>
            </div>

            {/* 2. Horas Card (4.5h Ejecutadas | 8h Estimadas | 3.5h Disponibles + Dynamic Progress Bar) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0f172a] text-xs">Horas</span>
                <button
                  onClick={() => setIsEditingBudget(!isEditingBudget)}
                  className="text-[11px] font-semibold text-[#501f92] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Ajustar horas</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-3">
                {isEditingBudget ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.5"
                      value={budgetValue}
                      onChange={(e) => setBudgetValue(e.target.value)}
                      className="w-20 px-2 py-1 rounded-lg border border-[#e2e8f0] text-xs font-mono font-bold"
                    />
                    <button
                      onClick={handleSaveBudget}
                      className="px-3 py-1 rounded-lg bg-[#501f92] text-white font-bold text-xs cursor-pointer"
                    >
                      Guardar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {/* Ejecutadas: Tono sutilmente diferenciado (púrpura suave) sin hacer ruido visual */}
                      <div className="p-2 rounded-xl bg-[#faf5ff] border border-[#f3e8ff]">
                        <span
                          className={`text-sm font-extrabold font-mono block ${
                            consumedHours > budgetedHours ? 'text-[#e11d48]' : 'text-[#501f92]'
                          }`}
                        >
                          {consumedHours.toFixed(1)} h
                        </span>
                        <span className="text-[10px] font-semibold text-[#7e22ce] block mt-0.5">Ejecutadas</span>
                      </div>

                      {/* Estimadas: Tono neutro sobrio */}
                      <div className="p-2 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
                        <span className="text-sm font-extrabold text-[#0f172a] font-mono block">
                          {budgetedHours} h
                        </span>
                        <span className="text-[10px] text-[#64748b] block mt-0.5">Estimadas</span>
                      </div>

                      {/* Disponibles: Verde sobrio si queda tiempo, o indicador de exceso si se pasa */}
                      <div
                        className={`p-2 rounded-xl border ${
                          remainingHours < 0
                            ? 'bg-[#fff1f2] border-[#ffe4e6]'
                            : 'bg-[#f0fdf4] border-[#dcfce7]'
                        }`}
                      >
                        <span
                          className={`text-sm font-extrabold font-mono block ${
                            remainingHours < 0 ? 'text-[#e11d48]' : 'text-[#16a34a]'
                          }`}
                        >
                          {remainingHours < 0
                            ? `+${Math.abs(remainingHours).toFixed(1)} h`
                            : `${remainingHours.toFixed(1)} h`}
                        </span>
                        <span
                          className={`text-[10px] font-semibold block mt-0.5 ${
                            remainingHours < 0 ? 'text-[#be123c]' : 'text-[#15803d]'
                          }`}
                        >
                          {remainingHours < 0 ? 'Excedidas' : 'Disponibles'}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Progress bar based on consumption limit */}
                    <div className="space-y-1 pt-1">
                      <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden relative">
                        <div
                          style={{ width: `${Math.min(percentHours, 100)}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            percentHours > 100
                              ? 'bg-[#e11d48]'
                              : percentHours >= 85
                              ? 'bg-[#f59e0b]'
                              : 'bg-[#501f92]'
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#64748b] font-medium px-0.5">
                        <span>Consumo: {percentHours}%</span>
                        {percentHours > 100 ? (
                          <span className="text-[#e11d48] font-bold">
                            Sobreconsumo (+{(consumedHours - budgetedHours).toFixed(1)}h)
                          </span>
                        ) : (
                          <span>{consumedHours.toFixed(1)}h de {budgetedHours}h</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 3. Cronograma Card (Inicio / Entrega) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0f172a] text-xs flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
                  <span>Cronograma</span>
                </span>
                <button
                  onClick={() => setIsEditingDates(!isEditingDates)}
                  className="text-[11px] font-semibold text-[#501f92] hover:underline cursor-pointer"
                >
                  {isEditingDates ? 'Cancelar' : 'Cambiar'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs">
                {isEditingDates ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-[#64748b] block mb-0.5">Inicio:</label>
                      <input
                        type="date"
                        value={startDateInput}
                        onChange={(e) => setStartDateInput(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-[#e2e8f0] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#64748b] block mb-0.5">Entrega:</label>
                      <input
                        type="date"
                        value={dueDateInput}
                        onChange={(e) => setDueDateInput(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-[#e2e8f0] text-xs"
                      />
                    </div>
                    <button
                      onClick={handleSaveDates}
                      className="w-full py-1.5 rounded-lg bg-[#501f92] text-white font-bold text-xs cursor-pointer"
                    >
                      Guardar
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[#64748b] block">Inicio</span>
                      <span className="text-xs font-bold text-[#0f172a] block mt-0.5">
                        {task.startDate || '20 ago. 2026'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#64748b] block">Entrega</span>
                      <span className="text-xs font-bold text-[#0f172a] block mt-0.5">
                        {task.dueDate || '24 ago. 2026'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Dependencia Discreta (En espera de / Dependencia resuelta) */}
            {task.dependencyTaskTitle && (
              <div>
                {!isDepResolved ? (
                  <div className="flex items-center gap-1.5 text-xs text-[#64748b] p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <Link2 className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                    <span>
                      Depende de:{' '}
                      <strong className="text-[#0f172a]">{task.dependencyTaskTitle}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#16a34a] p-2 rounded-xl bg-[#f0fdf4] border border-[#dcfce7] opacity-85">
                    <Check className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                    <span>
                      Dependencia resuelta:{' '}
                      <span className="font-semibold text-[#15803d]">{task.dependencyTaskTitle}</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 5. Equipo & Responsables (Editable with exact reference unassigned styling) */}
            <div className="space-y-2 pt-1 relative">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0f172a] text-xs block">Equipo & Responsables</span>
                <span className="text-[10px] text-[#64748b]">Click para editar</span>
              </div>

              <div className="space-y-1">
                {/* 1. Solicitada por */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenTeamDropdown(openTeamDropdown === 'requestedBy' ? null : 'requestedBy')}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#f8fafc] border border-transparent hover:border-[#e2e8f0] transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {requestedBy && requestedBy !== '-' ? (
                        <div className="w-8 h-8 rounded-full bg-[#501f92] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {requestedBy
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      ) : (
                        /* Reference Unassigned Circle: Dotted with user icon */
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#cbd5e1] text-[#94a3b8] flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-[11px] text-[#64748b] block font-medium">Solicitada por</span>
                        <span className={`text-xs truncate block ${requestedBy && requestedBy !== '-' ? 'font-bold text-[#0f172a]' : 'font-medium text-[#94a3b8]'}`}>
                          {requestedBy && requestedBy !== '-' ? requestedBy : '-'}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#501f92] transition-colors shrink-0" />
                  </button>

                  {/* Dropdown for Solicitada por */}
                  {openTeamDropdown === 'requestedBy' && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white rounded-2xl border border-[#e2e8f0] shadow-xl p-2 animate-in fade-in slide-in-from-top-1">
                      <div className="px-2 py-1 text-[11px] font-bold text-[#64748b] border-b border-[#f1f5f9] mb-1">
                        Seleccionar Solicitante
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {TEAM_MEMBERS_POOL.map((member, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectRequester(member)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                              requestedBy === member.name
                                ? 'bg-[#f5f3ff] text-[#501f92] font-bold'
                                : 'hover:bg-[#f8fafc] text-[#0f172a]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full ${member.avatarBg} text-white flex items-center justify-center text-[10px] font-bold`}
                              >
                                {member.initials}
                              </div>
                              <div>
                                <span className="block">{member.name}</span>
                                <span className="text-[10px] text-[#64748b] block">{member.role}</span>
                              </div>
                            </div>
                            {requestedBy === member.name && <Check className="w-3.5 h-3.5 text-[#501f92]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Colaboradores (Compact UI for multiple collaborators with reference unassigned state) */}
                <div className="relative">
                  {(() => {
                    const extraCollabs = collaborators.filter((c) => c.name !== assignee?.name);
                    const hasAssignee = Boolean(assignee && assignee.name && assignee.name !== '-');
                    const totalCollabsCount = (hasAssignee ? 1 : 0) + extraCollabs.length;

                    return (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenTeamDropdown(openTeamDropdown === 'collaborators' ? null : 'collaborators')
                          }
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#f8fafc] border border-transparent hover:border-[#e2e8f0] transition-colors text-left cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {totalCollabsCount === 0 ? (
                              /* Reference unassigned circle with dashed border */
                              <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#cbd5e1] text-[#94a3b8] flex items-center justify-center shrink-0">
                                <User className="w-4 h-4" />
                              </div>
                            ) : totalCollabsCount === 1 ? (
                              <div
                                className={`w-8 h-8 rounded-full ${
                                  assignee?.avatarBg || 'bg-[#501f92]'
                                } text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                              >
                                {assignee?.initials || 'CT'}
                              </div>
                            ) : (
                              /* Reference multi-collaborator circular count badge (e.g. 2 with dashed border) */
                              <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#94a3b8] bg-white text-[#334155] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                {totalCollabsCount}
                              </div>
                            )}

                            <div className="min-w-0">
                              <span className="text-[11px] text-[#64748b] block font-medium">Colaboradores</span>
                              {totalCollabsCount === 0 ? (
                                <span className="text-xs font-medium text-[#94a3b8] block">-</span>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-[#0f172a] truncate block">
                                      {assignee?.name || 'Asignado'}
                                    </span>
                                    {totalCollabsCount > 1 && (
                                      <span className="text-[#64748b] font-bold text-xs">
                                        +{totalCollabsCount - 1}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#64748b] block truncate">
                                    {task.budgetedRole || assignee?.role || 'Diseñador Gráfico'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#501f92] transition-colors shrink-0" />
                        </button>

                        {/* Dropdown / Popover for Colaboradores */}
                        {openTeamDropdown === 'collaborators' && (
                          <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white rounded-2xl border border-[#e2e8f0] shadow-xl p-3 animate-in fade-in slide-in-from-top-1">
                            <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9] mb-2">
                              <span className="text-xs font-bold text-[#0f172a]">Gestionar Colaboradores</span>
                              <button
                                type="button"
                                onClick={() => setOpenTeamDropdown(null)}
                                className="text-[11px] font-bold text-[#501f92] hover:underline cursor-pointer"
                              >
                                Listo
                              </button>
                            </div>

                            <p className="text-[10px] text-[#64748b] mb-2">
                              Marca los miembros que participan. Usa la estrella para fijar el ejecutor principal.
                            </p>

                            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                              {TEAM_MEMBERS_POOL.map((member, idx) => {
                                const isPrimary = assignee?.name === member.name;
                                const isAssigned = isPrimary || collaborators.some((c) => c.name === member.name);

                                return (
                                  <div
                                    key={idx}
                                    className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                                      isAssigned
                                        ? 'bg-[#faf5ff] border-[#e9d5ff]'
                                        : 'bg-white border-[#f1f5f9] hover:bg-[#f8fafc]'
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleToggleCollaborator(member)}
                                      className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                                    >
                                      <div
                                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                                          isAssigned
                                            ? 'bg-[#501f92] border-[#501f92] text-white'
                                            : 'border-[#cbd5e1] bg-white'
                                        }`}
                                      >
                                        {isAssigned && <Check className="w-3 h-3 stroke-[3]" />}
                                      </div>

                                      <div
                                        className={`w-6 h-6 rounded-full ${member.avatarBg} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}
                                      >
                                        {member.initials}
                                      </div>

                                      <div className="min-w-0">
                                        <span
                                          className={`text-xs block truncate ${
                                            isAssigned ? 'font-bold text-[#0f172a]' : 'text-[#334155]'
                                          }`}
                                        >
                                          {member.name}
                                        </span>
                                        <span className="text-[10px] text-[#64748b] block truncate">
                                          {member.role}
                                        </span>
                                      </div>
                                    </button>

                                    {isAssigned && (
                                      <button
                                        type="button"
                                        onClick={() => handleSetPrimaryAssignee(member)}
                                        title={
                                          isPrimary
                                            ? 'Ejecutor principal'
                                            : 'Establecer como ejecutor principal'
                                        }
                                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 ml-1 cursor-pointer transition-colors ${
                                          isPrimary
                                            ? 'bg-[#501f92] text-white'
                                            : 'bg-white text-[#64748b] hover:text-[#501f92] border border-[#e2e8f0]'
                                        }`}
                                      >
                                        <Star className={`w-3 h-3 ${isPrimary ? 'fill-current' : ''}`} />
                                        <span>{isPrimary ? 'Principal' : 'Fijar'}</span>
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* 3. Revisor (with exact unassigned reference styling) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenTeamDropdown(openTeamDropdown === 'reviewer' ? null : 'reviewer')}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#f8fafc] border border-transparent hover:border-[#e2e8f0] transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {reviewer && reviewer.name && reviewer.name !== '-' ? (
                        <div
                          className={`w-8 h-8 rounded-full ${
                            reviewer.avatarBg || 'bg-[#501f92]'
                          } text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                        >
                          {reviewer.initials || 'PL'}
                        </div>
                      ) : (
                        /* Reference unassigned circle with dashed border */
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#cbd5e1] text-[#94a3b8] flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <span className="text-[11px] text-[#64748b] block font-medium">Revisor</span>
                        <span
                          className={`text-xs truncate block ${
                            reviewer && reviewer.name && reviewer.name !== '-'
                              ? 'font-bold text-[#0f172a]'
                              : 'font-medium text-[#94a3b8]'
                          }`}
                        >
                          {reviewer && reviewer.name && reviewer.name !== '-' ? reviewer.name : '-'}
                        </span>
                        {reviewer && reviewer.role && (
                          <span className="text-[10px] text-[#64748b] block truncate">
                            {reviewer.role}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#501f92] transition-colors shrink-0" />
                  </button>

                  {/* Dropdown for Revisor */}
                  {openTeamDropdown === 'reviewer' && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white rounded-2xl border border-[#e2e8f0] shadow-xl p-2 animate-in fade-in slide-in-from-top-1">
                      <div className="px-2 py-1 text-[11px] font-bold text-[#64748b] border-b border-[#f1f5f9] mb-1">
                        Seleccionar Revisor
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        <button
                          type="button"
                          onClick={() => handleSelectReviewer(null)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                            !reviewer
                              ? 'bg-[#f5f3ff] text-[#501f92] font-bold'
                              : 'hover:bg-[#f8fafc] text-[#64748b]'
                          }`}
                        >
                          <span>✕ Sin revisor (-)</span>
                          {!reviewer && <Check className="w-3.5 h-3.5 text-[#501f92]" />}
                        </button>

                        {TEAM_MEMBERS_POOL.map((member, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectReviewer(member)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                              reviewer?.name === member.name
                                ? 'bg-[#f5f3ff] text-[#501f92] font-bold'
                                : 'hover:bg-[#f8fafc] text-[#0f172a]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full ${member.avatarBg} text-white flex items-center justify-center text-[10px] font-bold`}
                              >
                                {member.initials}
                              </div>
                              <div>
                                <span className="block">{member.name}</span>
                                <span className="text-[10px] text-[#64748b] block">{member.role}</span>
                              </div>
                            </div>
                            {reviewer?.name === member.name && (
                              <Check className="w-3.5 h-3.5 text-[#501f92]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FOOTER: ID · Creada el ... */}
        {/* ========================================================= */}
        <div
          id="task-detail-footer"
          className="px-6 py-3.5 border-t border-[#f1f5f9] bg-white flex items-center justify-between text-xs text-[#64748b] shrink-0"
        >
          <span>
            ID: <strong className="font-mono text-[#0f172a]">{task.id.toUpperCase()}</strong> · Creada el{' '}
            {task.date || '20 ago. 2026 a las 14:30'}
          </span>
        </div>
      </div>
    </div>
  );
};
