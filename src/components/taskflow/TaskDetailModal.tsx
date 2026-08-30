import React, { useState, useEffect, useRef } from 'react';
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
  MessageSquare,
  RefreshCw,
  AlertTriangle,
  Briefcase,
  Crown,
  Eye,
  Bold,
  Italic,
  List,
  Code,
  Quote,
  Hash,
  Download,
  Image as ImageIcon,
  ThumbsUp,
  Heart,
  Rocket,
  Flame,
  CornerDownRight,
  MessageCircle,
  MoreVertical
} from 'lucide-react';
import {
  TaskItem,
  ActiveTimerState,
  TaskDeliverable,
  TaskStatus,
  TaskPriority,
  ProjectPhase,
  TaskBlockerInfo,
  TaskRework,
  ReworkOrigin,
  TaskCommentAttachment,
  TaskCommentReaction,
  STANDARD_UHURA_ROLES
} from './types';
import { DropdownMenu, DropdownOption } from '../ui/DropdownMenu';

export interface TeamMemberProfile {
  name: string;
  initials: string;
  avatarBg: string;
  role: string;
}

const TEAM_MEMBERS_POOL: TeamMemberProfile[] = [
  { name: 'Paola (Lead PM)', initials: 'PL', avatarBg: 'bg-[#501f92]', role: 'Lead PM' },
  { name: 'Catalina Tejada', initials: 'CT', avatarBg: 'bg-[#501f92]', role: 'Diseñador Gráfico' },
  { name: 'Andrés Ríos', initials: 'AR', avatarBg: 'bg-[#501f92]', role: 'Product Lead' },
  { name: 'Camilo Torres', initials: 'CT', avatarBg: 'bg-[#0284c7]', role: 'Web Designer' },
  { name: 'Laura Gómez', initials: 'LG', avatarBg: 'bg-[#059669]', role: 'Front End' },
  { name: 'Sebas (Trafficker)', initials: 'ST', avatarBg: 'bg-[#d97706]', role: 'Trafficker' },
  { name: 'Mariana Toro', initials: 'MT', avatarBg: 'bg-[#ec4899]', role: 'Copywriter' },
  { name: 'Camilo Vélez', initials: 'CV', avatarBg: 'bg-[#10b981]', role: 'Content Strategist' },
  { name: 'Mateo Ruiz', initials: 'MR', avatarBg: 'bg-[#8b5cf6]', role: 'Community Manager' },
  { name: 'Esteban Mora', initials: 'EM', avatarBg: 'bg-[#0d9488]', role: 'Tech Lead' },
  { name: 'Luisa Urazán', initials: 'LU', avatarBg: 'bg-[#e11d48]', role: 'Project Manager' },
  { name: 'Alejandro Florez', initials: 'AF', avatarBg: 'bg-[#0891b2]', role: 'QA & UI Reviewer' }
];

const DEFAULT_CRITERIA = [
  { id: 'c-1', text: 'Diseño responsive y optimización de assets', completed: true },
  { id: 'c-2', text: 'Revisión de ortografía, copies y alineación a marca', completed: true },
  { id: 'c-3', text: 'Validación de links y exportación final en alta resolución', completed: false }
];

export const QUICK_EMOJIS = ['👍', '❤️', '🚀', '👀', '🎉', '🔥'];

export interface FormattedLink {
  type: 'drive' | 'figma' | 'github' | 'loom' | 'generic';
  title: string;
  url: string;
}

export interface ChatMessage {
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
  attachments?: TaskCommentAttachment[];
  reactions?: TaskCommentReaction[];
  isEdited?: boolean;
  editedAt?: string;
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
  onUpdateTitle?: (taskId: string, newTitle: string) => void;
  onAddRework?: (
    taskId: string,
    rework: Omit<TaskRework, 'id' | 'taskId' | 'date'>
  ) => void;
  onUpdateBudgetHours?: (taskId: string, newHours: number) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTaskPriority?: (taskId: string, newPriority: TaskPriority) => void;
  onUpdateDates?: (taskId: string, startDate: string, dueDate: string, dueText?: string) => void;
  onUpdateTeam?: (
    taskId: string,
    assignee: TaskItem['assignee'],
    collaborators: TaskItem['collaborators'],
    reviewer?: TaskItem['reviewer'],
    requestedBy?: string,
    budgetedRole?: string,
    requiresValidation?: boolean,
    projectLead?: TaskItem['projectLead'],
    followers?: TaskItem['followers']
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
  onUpdateComments?: (taskId: string, comments: any[]) => void;
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
  onStopTimer,
  onUpdateTitle,
  onAddRework,
  onUpdateBudgetHours,
  onUpdateTaskStatus,
  onUpdateTaskPriority,
  onUpdateDates,
  onUpdateTeam,
  onUpdateCriteria,
  onAddDeliverable,
  onAddComment,
  onUpdateComments,
  onSelectTask,
  onDeleteTask,
  onArchiveTask,
  onNavigateToClient,
  onNavigateToProject,
  onOpenManualLog
}) => {
  // Tabs: 'mensajes' | 'entregables' | 'info' (info used on mobile)
  const [activeTab, setActiveTab] = useState<'mensajes' | 'entregables' | 'info'>('mensajes');

  // Menu and Toast
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Title inline edit state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  // Rework logging state
  const [isAddingRework, setIsAddingRework] = useState(false);
  const [reworkOrigin, setReworkOrigin] = useState<ReworkOrigin>('client');
  const [reworkReason, setReworkReason] = useState('');
  const [reworkRequestedBy, setReworkRequestedBy] = useState('');
  const [reworkHours, setReworkHours] = useState('1.0');

  // Team Edit Popovers: 'assignee' | 'collaborators' | 'reviewer' | 'requestedBy' | 'budgetedRole' | null
  const [openTeamDropdown, setOpenTeamDropdown] = useState<'assignee' | 'collaborators' | 'reviewer' | 'requestedBy' | 'budgetedRole' | null>(null);

  // Local team & responsibility tracking
  const [projectLead, setProjectLead] = useState<TaskItem['projectLead']>(
    task?.projectLead || { name: 'Paola (Lead PM)', initials: 'PL', avatarBg: 'bg-[#501f92]', role: 'Lead PM' }
  );
  const [assignee, setAssignee] = useState<TaskItem['assignee']>(
    task?.assignee || { name: 'Catalina Tejada', initials: 'CT', avatarBg: 'bg-[#501f92]', role: 'Diseñador Gráfico' }
  );
  const [collaborators, setCollaborators] = useState<NonNullable<TaskItem['collaborators']>>(
    task?.collaborators || []
  );
  const [followers, setFollowers] = useState<NonNullable<TaskItem['followers']>>(
    task?.followers || []
  );
  const [reviewer, setReviewer] = useState<TaskItem['reviewer']>(task?.reviewer);
  const [requestedBy, setRequestedBy] = useState<string>(task?.requestedBy || 'Andrés Ríos');
  const [budgetedRole, setBudgetedRole] = useState<string>(task?.budgetedRole || 'Diseñador Gráfico');
  const [requiresValidation, setRequiresValidation] = useState<boolean>(task?.requiresValidation ?? false);

  // Budget inline edit
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState('');

  // Date inline edit
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [startDateInput, setStartDateInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');

  // Message input & rich formatting state
  const [messageInput, setMessageInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [pendingAttachments, setPendingAttachments] = useState<TaskCommentAttachment[]>([]);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [showTaskMenu, setShowTaskMenu] = useState(false);
  const [quickEmojiMenuOpen, setQuickEmojiMenuOpen] = useState(false);

  // Autocomplete state (@ and #)
  const [autocompleteState, setAutocompleteState] = useState<{
    type: 'mention' | 'task';
    query: string;
    index: number;
  } | null>(null);

  // Link attachment popover
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkInputUrl, setLinkInputUrl] = useState('');
  const [linkInputTitle, setLinkInputTitle] = useState('');
  const [linkInputType, setLinkInputType] = useState<'figma' | 'drive' | 'loom' | 'github' | 'generic'>('generic');

  // Message edit / delete / reaction state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageContent, setEditingMessageContent] = useState('');
  const [deleteConfirmMessageId, setDeleteConfirmMessageId] = useState<string | null>(null);
  const [openMsgMenuId, setOpenMsgMenuId] = useState<string | null>(null);
  const [activeReactionPickerMsgId, setActiveReactionPickerMsgId] = useState<string | null>(null);

  // Lightbox Image Preview
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

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
      setProjectLead(
        task.projectLead || { name: 'Paola (Lead PM)', initials: 'PL', avatarBg: 'bg-[#501f92]', role: 'Lead PM' }
      );
      setAssignee(
        task.assignee || { name: 'Catalina Tejada', initials: 'CT', avatarBg: 'bg-[#501f92]', role: 'Diseñador Gráfico' }
      );
      setCollaborators(task.collaborators || []);
      setFollowers(task.followers || []);
      setReviewer(task.reviewer);
      setRequestedBy(task.requestedBy || 'Andrés Ríos');
      setBudgetedRole(task.budgetedRole || 'Diseñador Gráfico');
      setRequiresValidation(task.requiresValidation ?? false);
      setOpenTeamDropdown(null);

      setBudgetValue((task.budgetedHours || 1).toString());
      setTitleInput(task.title);
      setIsEditingTitle(false);
      setIsAddingRework(false);
      setReworkReason('');
      setReworkRequestedBy(task.clientName || 'Cliente');
      setReworkHours('1.0');
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
            content: m.content,
            attachments: m.attachments,
            reactions: m.reactions,
            isEdited: m.isEdited,
            editedAt: m.editedAt
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

  // Autocomplete detection and input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursorPos = e.target.selectionStart;
    setMessageInput(val);

    // Analyze token before cursor for autocomplete (@ or #)
    const textBeforeCursor = val.substring(0, cursorPos);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    const lastHash = textBeforeCursor.lastIndexOf('#');

    // Check mention (@)
    if (lastAt >= 0 && (lastAt === 0 || /\s/.test(textBeforeCursor[lastAt - 1]))) {
      const query = textBeforeCursor.substring(lastAt + 1);
      if (!query.includes(' ') && !query.includes('\n')) {
        setAutocompleteState({ type: 'mention', query, index: lastAt });
        return;
      }
    }

    // Check task reference (#)
    if (lastHash >= 0 && (lastHash === 0 || /\s/.test(textBeforeCursor[lastHash - 1]))) {
      const query = textBeforeCursor.substring(lastHash + 1);
      if (!query.includes(' ') && !query.includes('\n')) {
        setAutocompleteState({ type: 'task', query, index: lastHash });
        return;
      }
    }

    setAutocompleteState(null);
  };

  // Insert mention into textarea
  const insertMention = (memberName: string) => {
    if (!autocompleteState || autocompleteState.type !== 'mention') {
      setMessageInput((prev) => `${prev} @${memberName} `);
      setShowMentionMenu(false);
      return;
    }
    const before = messageInput.substring(0, autocompleteState.index);
    const after = messageInput.substring(autocompleteState.index + autocompleteState.query.length + 1);
    const newText = `${before}@${memberName} ${after}`;
    setMessageInput(newText);
    setAutocompleteState(null);
    setShowMentionMenu(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  // Insert task reference into textarea
  const insertTaskReference = (targetTask: TaskItem) => {
    const refCode = `#${targetTask.id.toUpperCase()}`;
    if (!autocompleteState || autocompleteState.type !== 'task') {
      setMessageInput((prev) => `${prev} ${refCode} `);
      setShowTaskMenu(false);
      return;
    }
    const before = messageInput.substring(0, autocompleteState.index);
    const after = messageInput.substring(autocompleteState.index + autocompleteState.query.length + 1);
    const newText = `${before}${refCode} ${after}`;
    setMessageInput(newText);
    setAutocompleteState(null);
    setShowTaskMenu(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  // Markdown formatting tool
  const applyFormatting = (format: 'bold' | 'italic' | 'list' | 'code' | 'quote') => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = messageInput.substring(start, end);
    let formatted = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        formatted = `**${selectedText || 'texto'}**`;
        cursorOffset = selectedText ? formatted.length : 2;
        break;
      case 'italic':
        formatted = `*${selectedText || 'texto'}*`;
        cursorOffset = selectedText ? formatted.length : 1;
        break;
      case 'list':
        formatted = `\n- ${selectedText || 'item'}`;
        cursorOffset = formatted.length;
        break;
      case 'code':
        formatted = `\`${selectedText || 'código'}\``;
        cursorOffset = selectedText ? formatted.length : 1;
        break;
      case 'quote':
        formatted = `\n> ${selectedText || 'cita'}`;
        cursorOffset = formatted.length;
        break;
    }

    const newValue = messageInput.substring(0, start) + formatted + messageInput.substring(end);
    setMessageInput(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  // Attach files handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const filesArray = Array.from(e.target.files);
    
    const newAttachments: TaskCommentAttachment[] = filesArray.map((file) => {
      const isImg = file.type.startsWith('image/');
      const sizeFormatted = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        size: sizeFormatted,
        type: isImg ? 'image' : 'file',
        previewUrl: isImg ? URL.createObjectURL(file) : undefined
      };
    });

    setPendingAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  // Attach link handler
  const handleSaveLinkAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInputUrl.trim()) return;

    let url = linkInputUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    let detectedType: 'figma' | 'drive' | 'loom' | 'github' | 'generic' = linkInputType;
    if (url.includes('figma.com')) detectedType = 'figma';
    else if (url.includes('drive.google.com') || url.includes('docs.google.com')) detectedType = 'drive';
    else if (url.includes('loom.com')) detectedType = 'loom';
    else if (url.includes('github.com')) detectedType = 'github';

    const newLinkAttachment: TaskCommentAttachment = {
      id: `link-${Date.now()}`,
      name: linkInputTitle.trim() || url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0],
      url,
      type: 'link'
    };

    setPendingAttachments((prev) => [...prev, newLinkAttachment]);
    setLinkInputUrl('');
    setLinkInputTitle('');
    setIsLinkModalOpen(false);
    showToast('Enlace adjuntado al comentario');
  };

  // Remove pending attachment
  const handleRemovePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Send Chat Message with mentions auto-followers logic
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() && pendingAttachments.length === 0) return;

    const content = messageInput.trim();

    // 1. Detect mentions (@Nombre) and auto-add to followers if not already in followers
    const mentionMatches = content.match(/@([A-Za-zÁ-ÿ0-9_() ]+?)(?=[.,!?\s]|$)/g) || [];
    const mentionedNames: string[] = [];

    mentionMatches.forEach((match) => {
      const rawName = match.substring(1).trim();
      const foundMember = TEAM_MEMBERS_POOL.find(
        (m) =>
          m.name.toLowerCase() === rawName.toLowerCase() ||
          m.name.toLowerCase().startsWith(rawName.toLowerCase()) ||
          rawName.toLowerCase().startsWith(m.name.toLowerCase())
      );
      if (foundMember && !mentionedNames.includes(foundMember.name)) {
        mentionedNames.push(foundMember.name);
      }
    });

    // Auto-add mentioned users as followers
    if (mentionedNames.length > 0) {
      const newFollowers = [...followers];
      let followersAdded = 0;
      let addedName = '';

      mentionedNames.forEach((name) => {
        const isAlreadyFollower = newFollowers.some((f) => f.name === name);
        const isPrimaryAssignee = assignee.name === name;
        const isProjectLead = projectLead ? projectLead.name === name : false;

        if (!isAlreadyFollower && !isPrimaryAssignee && !isProjectLead) {
          const member = TEAM_MEMBERS_POOL.find((m) => m.name === name);
          if (member) {
            newFollowers.push({
              name: member.name,
              initials: member.initials,
              avatarBg: member.avatarBg,
              role: member.role
            });
            followersAdded++;
            addedName = member.name.split(' ')[0];
          }
        }
      });

      if (followersAdded > 0) {
        setFollowers(newFollowers);
        applyTeamUpdate(
          assignee,
          collaborators,
          reviewer,
          requestedBy,
          budgetedRole,
          requiresValidation,
          projectLead,
          newFollowers
        );
        showToast(
          followersAdded === 1
            ? `${addedName} añadido a Seguidores por mención`
            : `${followersAdded} miembros añadidos a Seguidores`
        );
      }
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      authorName: 'Catalina Tejada',
      authorRoleLabel: 'Ejecutor',
      authorInitials: 'CT',
      authorAvatarBg: 'bg-[#501f92]',
      timestamp: 'Ahora mismo',
      content: content,
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
      reactions: []
    };

    const updated = [...chatMessages, newMessage];
    setChatMessages(updated);

    if (onUpdateComments) {
      onUpdateComments(task.id, updated);
    } else if (onAddComment && content) {
      onAddComment(task.id, content);
    }

    setMessageInput('');
    setPendingAttachments([]);
    setAutocompleteState(null);
    setShowMentionMenu(false);
    setShowTaskMenu(false);
  };

  // Toggle Reaction on a comment
  const handleToggleReaction = (messageId: string, emoji: string) => {
    const currentUserName = 'Catalina Tejada';
    const updated = chatMessages.map((msg) => {
      if (msg.id !== messageId) return msg;
      const currentReactions: TaskCommentReaction[] = msg.reactions ? [...msg.reactions] : [];
      const existingIdx = currentReactions.findIndex((r) => r.emoji === emoji);

      if (existingIdx >= 0) {
        const item = { ...currentReactions[existingIdx] };
        if (item.users.includes(currentUserName)) {
          item.users = item.users.filter((u) => u !== currentUserName);
          item.count = item.users.length;
        } else {
          item.users = [...item.users, currentUserName];
          item.count = item.users.length;
        }

        if (item.count === 0) {
          currentReactions.splice(existingIdx, 1);
        } else {
          currentReactions[existingIdx] = item;
        }
      } else {
        currentReactions.push({
          emoji,
          count: 1,
          users: [currentUserName]
        });
      }

      return { ...msg, reactions: currentReactions };
    });

    setChatMessages(updated);
    if (onUpdateComments) {
      onUpdateComments(task.id, updated);
    }
    setActiveReactionPickerMsgId(null);
  };

  // Start editing a comment
  const handleStartEditMessage = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setEditingMessageContent(msg.content);
    setOpenMsgMenuId(null);
  };

  // Save edited comment
  const handleSaveEditMessage = (msgId: string) => {
    if (!editingMessageContent.trim()) return;

    const updated = chatMessages.map((msg) => {
      if (msg.id === msgId) {
        return {
          ...msg,
          content: editingMessageContent.trim(),
          isEdited: true,
          editedAt: 'Editado'
        };
      }
      return msg;
    });

    setChatMessages(updated);
    if (onUpdateComments) {
      onUpdateComments(task.id, updated);
    }
    setEditingMessageId(null);
    setEditingMessageContent('');
    showToast('Comentario actualizado');
  };

  // Delete a comment
  const handleDeleteMessage = (msgId: string) => {
    const updated = chatMessages.filter((msg) => msg.id !== msgId);
    setChatMessages(updated);
    if (onUpdateComments) {
      onUpdateComments(task.id, updated);
    }
    setDeleteConfirmMessageId(null);
    setOpenMsgMenuId(null);
    showToast('Comentario eliminado');
  };

  // Enriched token renderer: Mentions (@), Task References (#), Bold, Italic, Code, Links
  const renderMessageContent = (content: string) => {
    if (!content) return null;

    // Split lines to preserve paragraphs & list items
    const lines = content.split('\n');

    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, lineIdx) => {
          if (!line.trim()) {
            return <div key={lineIdx} className="h-2" />;
          }

          const isQuote = line.startsWith('> ');
          const isListItem = line.startsWith('- ') || line.startsWith('* ');
          const lineText = isQuote ? line.substring(2) : isListItem ? line.substring(2) : line;

          // Tokenize line by @mentions, #tasks, **bold**, *italic*, `code`, URLs, markdown links
          const tokenRegex = /(@[A-Za-zÁ-ÿ0-9_() ]+)|(#[a-zA-Z0-9_-]+(?:\s*\[[^\]]+\])?)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)|(\[[^\]]+\]\(https?:\/\/[^\)]+\))|(https?:\/\/[^\s]+)/g;

          const tokens: React.ReactNode[] = [];
          let lastIndex = 0;
          let match;

          while ((match = tokenRegex.exec(lineText)) !== null) {
            if (match.index > lastIndex) {
              tokens.push(lineText.substring(lastIndex, match.index));
            }

            const token = match[0];

            if (token.startsWith('@')) {
              const mentionName = token.substring(1).trim();
              const memberProfile = TEAM_MEMBERS_POOL.find(
                (m) => m.name.toLowerCase() === mentionName.toLowerCase() ||
                       mentionName.toLowerCase().startsWith(m.name.toLowerCase())
              );

              tokens.push(
                <span
                  key={`mention-${match.index}`}
                  className="inline-flex items-center gap-1 font-bold text-[#501f92] bg-[#f5f3ff] hover:bg-[#ede9fe] border border-[#ddd6fe] px-1.5 py-0.2 rounded-md text-[11px] transition-colors align-baseline"
                  title={`Miembro: ${memberProfile ? memberProfile.role : 'Equipo'}`}
                >
                  <AtSign className="w-2.5 h-2.5 text-[#501f92]" />
                  <span>{token.substring(1)}</span>
                </span>
              );
            } else if (token.startsWith('#')) {
              // Extract task ID e.g. #TK-101 or #TASK-1
              const rawId = token.split(/[\s\[]/)[0].substring(1);
              const matchedTask = tasksList?.find(
                (t) => t.id.toLowerCase() === rawId.toLowerCase()
              );

              tokens.push(
                <button
                  key={`task-ref-${match.index}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (matchedTask && onSelectTask) {
                      onSelectTask(matchedTask);
                      showToast(`Navegando a ${matchedTask.title}`);
                    }
                  }}
                  className={`inline-flex items-center gap-1 font-mono font-bold px-1.5 py-0.2 rounded-md text-[11px] border transition-all align-baseline ${
                    matchedTask
                      ? 'bg-[#f0f9ff] text-[#0284c7] border-[#bae6fd] hover:bg-[#e0f2fe] hover:border-[#0284c7] cursor-pointer shadow-2xs'
                      : 'bg-[#f8fafc] text-[#475569] border-[#e2e8f0]'
                  }`}
                  title={matchedTask ? `Abrir tarea: ${matchedTask.title}` : `Referencia: ${token}`}
                >
                  <Hash className="w-2.5 h-2.5 text-[#0284c7]" />
                  <span>{token}</span>
                  {matchedTask && <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />}
                </button>
              );
            } else if (token.startsWith('**') && token.endsWith('**')) {
              tokens.push(
                <strong key={`bold-${match.index}`} className="font-bold text-[#0f172a]">
                  {token.slice(2, -2)}
                </strong>
              );
            } else if (token.startsWith('*') && token.endsWith('*')) {
              tokens.push(
                <em key={`italic-${match.index}`} className="italic text-[#334155]">
                  {token.slice(1, -1)}
                </em>
              );
            } else if (token.startsWith('`') && token.endsWith('`')) {
              tokens.push(
                <code
                  key={`code-${match.index}`}
                  className="bg-[#f1f5f9] text-[#0f172a] px-1 py-0.5 rounded font-mono text-[11px] border border-[#e2e8f0]"
                >
                  {token.slice(1, -1)}
                </code>
              );
            } else if (token.startsWith('[') && token.includes('](')) {
              const titleMatch = token.match(/\[(.*?)\]/);
              const urlMatch = token.match(/\((.*?)\)/);
              const linkTitle = titleMatch ? titleMatch[1] : 'Enlace';
              const linkUrl = urlMatch ? urlMatch[1] : '#';

              tokens.push(
                <a
                  key={`md-link-${match.index}`}
                  href={linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#501f92] hover:text-[#381566] underline underline-offset-2 hover:underline-offset-4 transition-all"
                >
                  <span>{linkTitle}</span>
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
              );
            } else if (token.startsWith('http://') || token.startsWith('https://')) {
              tokens.push(
                <a
                  key={`raw-link-${match.index}`}
                  href={token}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#501f92] hover:text-[#381566] underline underline-offset-2 break-all"
                >
                  <span>{token}</span>
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
              );
            }

            lastIndex = match.index + token.length;
          }

          if (lastIndex < lineText.length) {
            tokens.push(lineText.substring(lastIndex));
          }

          if (isQuote) {
            return (
              <div
                key={lineIdx}
                className="pl-3 border-l-2 border-[#8a4dff] text-[#475569] italic py-0.5 bg-[#fbfaff] rounded-r-md"
              >
                {tokens}
              </div>
            );
          }

          if (isListItem) {
            return (
              <div key={lineIdx} className="flex items-start gap-2 pl-2">
                <span className="text-[#501f92] font-bold text-xs mt-0.5">•</span>
                <div className="flex-1">{tokens}</div>
              </div>
            );
          }

          return <div key={lineIdx}>{tokens}</div>;
        })}
      </div>
    );
  };

  // Submit Deliverable
  const handleSubmitDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableUrl.trim() && !uploadedFileName) {
      showToast('Ingresa una URL o sube un archivo');
      return;
    }

    const nextStatus: TaskStatus = requiresValidation ? 'Review' : 'Done';

    if (onAddDeliverable) {
      onAddDeliverable(task.id, {
        url: deliverableUrl.trim() || uploadedFileName || 'Entrega de producción',
        title: deliverableNotes.trim() || 'Entregable de producción',
        submittedBy: task.assignee?.name || assignee?.name || 'Catalina Tejada',
        notes: deliverableNotes.trim(),
        status: 'submitted',
        taggedReviewer: requiresValidation ? (reviewer?.name || task.reviewer?.name || 'Validador') : undefined
      });
    }

    // Set task status based on requiresValidation rule
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(task.id, nextStatus);
    }

    // Add a system update in chat
    setChatMessages((prev) => [
      ...prev,
      {
        id: `deliv-${Date.now()}`,
        authorName: 'Sistema',
        authorInitials: 'SYS',
        timestamp: 'Ahora mismo',
        content: requiresValidation
          ? `${assignee?.name || 'El responsable'} envió el entregable a revisión para validación formal.`
          : `${assignee?.name || 'El responsable'} completó la entrega y pasó la tarea directamente a Completada.`,
        isSystem: true
      }
    ]);

    setDeliverableUrl('');
    setDeliverableNotes('');
    setUploadedFileName(null);
    showToast(requiresValidation ? 'Entregable enviado a revisión' : 'Tarea marcada como Completada');
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
    newRequester?: string,
    newBudgetedRole?: string,
    newRequiresValidation?: boolean,
    newProjectLead?: TaskItem['projectLead'],
    newFollowers?: NonNullable<TaskItem['followers']>
  ) => {
    setAssignee(newAssignee);
    setCollaborators(newCollabs);
    setReviewer(newReviewer);
    if (newRequester) setRequestedBy(newRequester);
    if (newBudgetedRole !== undefined) setBudgetedRole(newBudgetedRole);
    if (newRequiresValidation !== undefined) setRequiresValidation(newRequiresValidation);
    if (newProjectLead !== undefined) setProjectLead(newProjectLead);
    if (newFollowers !== undefined) setFollowers(newFollowers);

    if (onUpdateTeam && task) {
      onUpdateTeam(
        task.id,
        newAssignee,
        newCollabs,
        newReviewer,
        newRequester || requestedBy,
        newBudgetedRole !== undefined ? newBudgetedRole : budgetedRole,
        newRequiresValidation !== undefined ? newRequiresValidation : requiresValidation,
        newProjectLead !== undefined ? newProjectLead : projectLead,
        newFollowers !== undefined ? newFollowers : followers
      );
    }
  };

  // Progress task status: To Do -> In Progress -> Done (or back to In Progress)
  const handleProgressTaskStatus = () => {
    if (!onUpdateTaskStatus || !task) return;

    if (task.status === 'To Do') {
      onUpdateTaskStatus(task.id, 'In Progress');
      showToast('Tarea iniciada (En proceso)');
    } else if (task.status === 'In Progress') {
      onUpdateTaskStatus(task.id, 'Done');
      showToast('Tarea marcada como Completada');
    } else if (task.status === 'Review') {
      onUpdateTaskStatus(task.id, 'Done');
      showToast('Tarea marcada como Completada');
    } else if (task.status === 'Done') {
      onUpdateTaskStatus(task.id, 'In Progress');
      showToast('Tarea reabierta (En proceso)');
    }
  };

  return (
    <div
      id="task-detail-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
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
        className="bg-white sm:rounded-3xl max-w-5xl w-full h-full sm:h-auto sm:max-h-[92vh] border-0 sm:border sm:border-[#e2e8f0] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* ========================================================= */}
        {/* HEADER: Cliente > Proyecto > Frente | Title | Timer | + | 3-dots | X */}
        {/* ========================================================= */}
        <div
          id="task-detail-header"
          className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#f1f5f9] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0"
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

              {(task.phase || task.fase) && (
                <>
                  <span className="text-[#cbd5e1]">›</span>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe]"
                    title={`Fase del proyecto: ${task.phase || task.fase}`}
                  >
                    {task.phase || task.fase}
                  </span>
                </>
              )}
            </div>

            {isEditingTitle ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (onUpdateTitle && titleInput.trim()) {
                        onUpdateTitle(task.id, titleInput.trim());
                        showToast('Nombre de la tarea actualizado');
                      }
                      setIsEditingTitle(false);
                    } else if (e.key === 'Escape') {
                      setTitleInput(task.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="w-full text-lg sm:text-xl font-extrabold text-[#0f172a] px-2.5 py-1 rounded-xl border border-[#501f92] bg-white focus:outline-none shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateTitle && titleInput.trim()) {
                      onUpdateTitle(task.id, titleInput.trim());
                      showToast('Nombre de la tarea actualizado');
                    }
                    setIsEditingTitle(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#501f92] text-white text-xs font-bold hover:bg-[#381566] transition-colors cursor-pointer shrink-0"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitleInput(task.title);
                    setIsEditingTitle(false);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-[#64748b] hover:bg-[#f1f5f9] text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group/title">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight truncate">
                  {task.title}
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setTitleInput(task.title);
                    setIsEditingTitle(true);
                  }}
                  className="p-1 rounded-lg text-[#94a3b8] hover:text-[#501f92] hover:bg-[#f5f3ff] transition-colors cursor-pointer shrink-0"
                  title="Editar nombre de la tarea"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Actions Toolbar */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {/* Timer CTA: Defaults to Play. When running, shows clear Stop action */}
            {isRunning ? (
              <div className="flex items-center gap-1.5">
                <button
                  id="task-timer-stop-btn"
                  onClick={onStopTimer}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold shadow-xs cursor-pointer transition-all animate-pulse"
                  title="Detener timer y registrar tiempo"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Detener Timer</span>
                </button>
              </div>
            ) : (
              <button
                id="task-timer-start-btn"
                onClick={() => onStartTimer(task)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                title="Iniciar timer"
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
                  <Clock className="w-4 h-4 text-[#501f92]" />
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
        {/* MAIN BODY: 2 Columns on Desktop, Single Responsive View on Mobile */}
        {/* ========================================================= */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#f1f5f9] overflow-hidden">
          {/* --------------------------------------------------------- */}
          {/* LEFT: FEED & DELIVERABLES (Desktop: 8 cols, Mobile: when tab !== 'info') */}
          {/* --------------------------------------------------------- */}
          <div className={`${activeTab === 'info' ? 'hidden lg:flex' : 'flex'} lg:col-span-8 p-4 sm:p-6 flex-col justify-between space-y-6 overflow-y-auto max-h-full`}>
            <div className="space-y-5">
              {/* Tabs Navigation Header */}
              <div className="flex items-center gap-4 sm:gap-6 border-b border-[#e2e8f0]">
                <button
                  id="tab-mensajes-btn"
                  onClick={() => setActiveTab('mensajes')}
                  className={`pb-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
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
                  className={`pb-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
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

                {/* Mobile-only Tab for Info & Tiempos */}
                <button
                  id="tab-info-btn"
                  onClick={() => setActiveTab('info')}
                  className={`lg:hidden pb-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
                    activeTab === 'info'
                      ? 'text-[#501f92] font-extrabold'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  <span>Info & Tiempos</span>
                  {activeTab === 'info' && (
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
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] font-extrabold text-[#501f92] uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#501f92]" /> Requerimiento inicial
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-[#64748b]">
                          {requestedBy && (
                            <span className="flex items-center gap-1">
                              <span className="text-[#94a3b8]">Solicitada por:</span>
                              <span className="font-semibold text-[#0f172a]">{requestedBy}</span>
                            </span>
                          )}
                          <span className="text-[#cbd5e1]">·</span>
                          <span className="text-[#94a3b8]">
                            {task.date || 'Inicio de tarea'}
                          </span>
                        </div>
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
                      <p className="text-[11px] text-[#94a3b8] mt-0.5">Escribe un comentario, usa @ para mencionar a alguien o # para referenciar tareas.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
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

                        const isEditingThisMsg = editingMessageId === msg.id;
                        const isDeletingThisMsg = deleteConfirmMessageId === msg.id;

                        // User / Collaborator / Revisor Message
                        return (
                          <div
                            key={msg.id}
                            className="group relative flex items-start gap-3 p-3.5 rounded-2xl bg-[#f8fafc] hover:bg-[#fbfcfe] border border-[#e2e8f0] text-xs hover:border-[#cbd5e1] transition-all shadow-2xs"
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
                            <div className="flex-1 min-w-0 space-y-2">
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
                                  {msg.isEdited && (
                                    <span
                                      className="text-[10px] text-[#94a3b8] italic ml-1"
                                      title={msg.editedAt || 'Mensaje editado'}
                                    >
                                      (editado)
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-[#94a3b8]">{msg.timestamp}</span>
                              </div>

                              {/* Inline Edit Form */}
                              {isEditingThisMsg ? (
                                <div className="space-y-2 pt-1">
                                  <textarea
                                    value={editingMessageContent}
                                    onChange={(e) => setEditingMessageContent(e.target.value)}
                                    rows={3}
                                    className="w-full p-2.5 rounded-xl border border-[#501f92] bg-white text-xs text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#501f92]"
                                  />
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingMessageId(null)}
                                      className="px-3 py-1 rounded-lg text-xs font-semibold text-[#64748b] hover:bg-[#e2e8f0] cursor-pointer"
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditMessage(msg.id)}
                                      className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-[#501f92] hover:bg-[#381566] cursor-pointer"
                                    >
                                      Guardar cambios
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* Regular Content */
                                <div className="text-xs text-[#334155] leading-relaxed">
                                  {renderMessageContent(msg.content)}
                                </div>
                              )}

                              {/* Delete confirmation banner */}
                              {isDeletingThisMsg && (
                                <div className="p-2.5 rounded-xl bg-[#fef2f2] border border-[#fecaca] flex items-center justify-between gap-2">
                                  <span className="text-xs font-medium text-[#b91c1c]">
                                    ¿Eliminar este comentario? Esta acción no se puede deshacer.
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmMessageId(null)}
                                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#64748b] hover:bg-white cursor-pointer"
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-[#ef4444] hover:bg-[#dc2626] cursor-pointer"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Rich Attachments Section */}
                              {((msg.attachments && msg.attachments.length > 0) || (msg.links && msg.links.length > 0) || msg.attachedFile) && (
                                <div className="space-y-2 pt-1.5">
                                  {/* Legacy Links & Attached File support */}
                                  {msg.links && msg.links.length > 0 && (
                                    <div className="space-y-1.5">
                                      {msg.links.map((link, lIdx) => (
                                        <a
                                          key={lIdx}
                                          href={`https://${link.url}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#501f92] transition-colors group/link cursor-pointer max-w-md shadow-2xs"
                                        >
                                          <div className="w-7 h-7 rounded-lg bg-[#f5f3ff] text-[#501f92] flex items-center justify-center shrink-0 font-bold">
                                            <Sparkles className="w-4 h-4" />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <span className="block font-bold text-[#0f172a] text-xs truncate group-hover/link:text-[#501f92]">
                                              {link.title}
                                            </span>
                                            <span className="block text-[10px] text-[#64748b] truncate font-mono">
                                              {link.url}
                                            </span>
                                          </div>
                                          <ExternalLink className="w-3.5 h-3.5 text-[#94a3b8] group-hover/link:text-[#501f92] shrink-0" />
                                        </a>
                                      ))}
                                    </div>
                                  )}

                                  {msg.attachedFile && (
                                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#e2e8f0] text-xs max-w-xs">
                                      <FileText className="w-4 h-4 text-[#501f92]" />
                                      <span className="font-semibold text-[#0f172a] truncate">{msg.attachedFile.name}</span>
                                      <span className="text-[10px] text-[#94a3b8]">({msg.attachedFile.size})</span>
                                    </div>
                                  )}

                                  {/* Upgraded Attachments Array */}
                                  {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="space-y-2">
                                      {/* Image attachments gallery */}
                                      {msg.attachments.some((a) => a.type === 'image') && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                          {msg.attachments
                                            .filter((a) => a.type === 'image')
                                            .map((att) => (
                                              <div
                                                key={att.id}
                                                onClick={() =>
                                                  setLightboxImage({
                                                    url: att.previewUrl || att.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
                                                    title: att.name
                                                  })
                                                }
                                                className="group/img relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-[#e2e8f0] bg-black/5 cursor-pointer hover:shadow-md transition-all shrink-0"
                                              >
                                                <img
                                                  src={att.previewUrl || att.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'}
                                                  alt={att.name}
                                                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200"
                                                  referrerPolicy="no-referrer"
                                                />
                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                  <Eye className="w-5 h-5" />
                                                </div>
                                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-[9px] text-white truncate">
                                                  {att.name}
                                                </div>
                                              </div>
                                            ))}
                                        </div>
                                      )}

                                      {/* Link and File attachments */}
                                      <div className="space-y-1.5 max-w-md">
                                        {msg.attachments
                                          .filter((a) => a.type !== 'image')
                                          .map((att) => {
                                            if (att.type === 'link') {
                                              const isFigma = att.url?.includes('figma.com');
                                              const isDrive = att.url?.includes('drive.google.com') || att.url?.includes('docs.google.com');
                                              const isLoom = att.url?.includes('loom.com');
                                              const isGithub = att.url?.includes('github.com');

                                              return (
                                                <a
                                                  key={att.id}
                                                  href={att.url}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#501f92] hover:shadow-xs transition-all group/link cursor-pointer"
                                                >
                                                  <div
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                                                      isFigma
                                                        ? 'bg-[#fdf2f8] text-[#db2777]'
                                                        : isDrive
                                                        ? 'bg-[#f0fdf4] text-[#16a34a]'
                                                        : isLoom
                                                        ? 'bg-[#f0f9ff] text-[#0284c7]'
                                                        : isGithub
                                                        ? 'bg-[#f8fafc] text-[#0f172a]'
                                                        : 'bg-[#f5f3ff] text-[#501f92]'
                                                    }`}
                                                  >
                                                    {isFigma ? (
                                                      <Sparkles className="w-4 h-4" />
                                                    ) : isDrive ? (
                                                      <FolderKanban className="w-4 h-4" />
                                                    ) : (
                                                      <Link2 className="w-4 h-4" />
                                                    )}
                                                  </div>
                                                  <div className="min-w-0 flex-1">
                                                    <span className="block font-bold text-[#0f172a] text-xs truncate group-hover/link:text-[#501f92]">
                                                      {att.name}
                                                    </span>
                                                    <span className="block text-[10px] text-[#64748b] truncate font-mono">
                                                      {att.url}
                                                    </span>
                                                  </div>
                                                  <ExternalLink className="w-3.5 h-3.5 text-[#94a3b8] group-hover/link:text-[#501f92] shrink-0" />
                                                </a>
                                              );
                                            }

                                            // Document / File item
                                            return (
                                              <div
                                                key={att.id}
                                                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-[#e2e8f0] text-xs"
                                              >
                                                <div className="flex items-center gap-2 min-w-0">
                                                  <div className="w-7 h-7 rounded-lg bg-[#f1f5f9] text-[#475569] flex items-center justify-center shrink-0">
                                                    <FileText className="w-4 h-4 text-[#501f92]" />
                                                  </div>
                                                  <div className="min-w-0">
                                                    <span className="font-semibold text-[#0f172a] truncate block">
                                                      {att.name}
                                                    </span>
                                                    {att.size && (
                                                      <span className="text-[10px] text-[#94a3b8] block">
                                                        {att.size}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => showToast(`Descargando ${att.name}`)}
                                                  className="p-1.5 rounded-lg text-[#64748b] hover:text-[#501f92] hover:bg-[#f1f5f9] transition-colors cursor-pointer shrink-0"
                                                  title="Descargar archivo"
                                                >
                                                  <Download className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            );
                                          })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Reactions Row */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {msg.reactions &&
                                  msg.reactions.map((react) => {
                                    const hasReacted = react.users.includes('Catalina Tejada');
                                    return (
                                      <button
                                        key={react.emoji}
                                        type="button"
                                        onClick={() => handleToggleReaction(msg.id, react.emoji)}
                                        title={`Reaccionaron: ${react.users.join(', ')}`}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                                          hasReacted
                                            ? 'bg-[#f5f3ff] border-[#8a4dff] text-[#501f92] shadow-2xs'
                                            : 'bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1]'
                                        }`}
                                      >
                                        <span>{react.emoji}</span>
                                        <span className="text-[11px] font-mono">{react.count}</span>
                                      </button>
                                    );
                                  })}

                                {/* Add reaction button (always visible or on hover) */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveReactionPickerMsgId(
                                        activeReactionPickerMsgId === msg.id ? null : msg.id
                                      )
                                    }
                                    className="p-1 rounded-full text-[#94a3b8] hover:text-[#501f92] hover:bg-white border border-transparent hover:border-[#e2e8f0] transition-colors cursor-pointer text-xs"
                                    title="Añadir reacción"
                                  >
                                    <Smile className="w-3.5 h-3.5" />
                                  </button>

                                  {activeReactionPickerMsgId === msg.id && (
                                    <div className="absolute left-0 bottom-full mb-1.5 flex items-center gap-1 bg-white p-1.5 rounded-full border border-[#e2e8f0] shadow-lg z-30 animate-in fade-in zoom-in-95 duration-100">
                                      {QUICK_EMOJIS.map((emoji) => (
                                        <button
                                          key={emoji}
                                          type="button"
                                          onClick={() => handleToggleReaction(msg.id, emoji)}
                                          className="p-1 hover:scale-125 transition-transform text-sm cursor-pointer rounded-full hover:bg-[#f1f5f9]"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Hover Actions Toolbar (Top Right) */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2.5 top-2.5 flex items-center gap-0.5 bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-[#e2e8f0] shadow-2xs z-10">
                              {/* Quick reaction shortcut */}
                              <button
                                type="button"
                                onClick={() => handleToggleReaction(msg.id, '👍')}
                                className="p-1 hover:bg-[#f1f5f9] rounded-lg text-xs cursor-pointer"
                                title="Me gusta"
                              >
                                👍
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleReaction(msg.id, '❤️')}
                                className="p-1 hover:bg-[#f1f5f9] rounded-lg text-xs cursor-pointer"
                                title="Amor"
                              >
                                ❤️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleReaction(msg.id, '🚀')}
                                className="p-1 hover:bg-[#f1f5f9] rounded-lg text-xs cursor-pointer"
                                title="Cohete"
                              >
                                🚀
                              </button>

                              {/* 3-dots Menu for Edit / Delete */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenMsgMenuId(openMsgMenuId === msg.id ? null : msg.id)
                                  }
                                  className="p-1 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-lg cursor-pointer transition-colors"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {openMsgMenuId === msg.id && (
                                  <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white border border-[#e2e8f0] shadow-xl py-1 z-30 text-xs animate-in fade-in duration-100">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditMessage(msg)}
                                      className="w-full px-3 py-1.5 text-left text-[#334155] hover:bg-[#f8fafc] flex items-center gap-2 cursor-pointer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 text-[#64748b]" />
                                      <span>Editar</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeleteConfirmMessageId(msg.id);
                                        setOpenMsgMenuId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-[#ef4444] hover:bg-[#fef2f2] flex items-center gap-2 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Eliminar</span>
                                    </button>
                                  </div>
                                )}
                              </div>
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

            {/* --------------------------------------------------------- */}
            {/* BOTTOM ENRICHED COMMENT COMPOSER (Always available on Mensajes tab) */}
            {/* --------------------------------------------------------- */}
            {activeTab === 'mensajes' && (
              <div className="pt-2 border-t border-[#f1f5f9] relative">
                {/* FLOATING AUTOCOMPLETE POPOVER (@ or #) */}
                {autocompleteState && (
                  <div className="absolute bottom-full left-0 mb-2 w-72 max-h-56 overflow-y-auto rounded-2xl bg-white border border-[#e2e8f0] shadow-xl py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                    {autocompleteState.type === 'mention' ? (
                      <div>
                        <div className="px-3 py-1 text-[10px] font-extrabold text-[#501f92] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#f1f5f9] pb-1.5 mb-1">
                          <AtSign className="w-3 h-3" /> Mencionar miembro del equipo
                        </div>
                        {TEAM_MEMBERS_POOL.filter((m) =>
                          m.name.toLowerCase().includes(autocompleteState.query.toLowerCase()) ||
                          m.role.toLowerCase().includes(autocompleteState.query.toLowerCase())
                        ).length === 0 ? (
                          <div className="px-3 py-2 text-[#94a3b8] text-[11px]">No se encontraron miembros</div>
                        ) : (
                          TEAM_MEMBERS_POOL.filter((m) =>
                            m.name.toLowerCase().includes(autocompleteState.query.toLowerCase()) ||
                            m.role.toLowerCase().includes(autocompleteState.query.toLowerCase())
                          ).map((m) => (
                            <button
                              key={m.name}
                              type="button"
                              onClick={() => insertMention(m.name)}
                              className="w-full px-3 py-1.5 text-left hover:bg-[#f8fafc] flex items-center justify-between gap-2 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`w-5 h-5 rounded-full ${m.avatarBg} text-white flex items-center justify-center text-[9px] font-bold shrink-0`}>
                                  {m.initials}
                                </span>
                                <span className="font-bold text-[#0f172a] truncate">{m.name}</span>
                              </div>
                              <span className="text-[10px] text-[#64748b] shrink-0 font-medium">{m.role}</span>
                            </button>
                          ))
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="px-3 py-1 text-[10px] font-extrabold text-[#0284c7] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#f1f5f9] pb-1.5 mb-1">
                          <Hash className="w-3 h-3" /> Referenciar tarea del proyecto
                        </div>
                        {tasksList
                          ?.filter((t) =>
                            t.id.toLowerCase().includes(autocompleteState.query.toLowerCase()) ||
                            t.title.toLowerCase().includes(autocompleteState.query.toLowerCase())
                          ).slice(0, 5).length === 0 ? (
                          <div className="px-3 py-2 text-[#94a3b8] text-[11px]">No se encontraron tareas</div>
                        ) : (
                          tasksList
                            ?.filter((t) =>
                              t.id.toLowerCase().includes(autocompleteState.query.toLowerCase()) ||
                              t.title.toLowerCase().includes(autocompleteState.query.toLowerCase())
                            )
                            .slice(0, 5)
                            .map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => insertTaskReference(t)}
                                className="w-full px-3 py-1.5 text-left hover:bg-[#f0f9ff] flex items-center justify-between gap-2 cursor-pointer transition-colors"
                              >
                                <div className="min-w-0">
                                  <span className="font-mono font-bold text-[#0284c7] text-[10px] block">
                                    #{t.id.toUpperCase()}
                                  </span>
                                  <span className="font-medium text-[#0f172a] truncate block text-[11px]">
                                    {t.title}
                                  </span>
                                </div>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#f1f5f9] text-[#64748b] shrink-0 font-semibold">
                                  {t.status}
                                </span>
                              </button>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Form container */}
                <form
                  onSubmit={handleSendMessage}
                  className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs focus-within:border-[#501f92] focus-within:shadow-md transition-all overflow-hidden"
                >
                  {/* Pending attachments chips bar */}
                  {pendingAttachments.length > 0 && (
                    <div className="p-2.5 bg-[#f8fafc] border-b border-[#f1f5f9] flex flex-wrap items-center gap-2">
                      {pendingAttachments.map((att) => (
                        <div
                          key={att.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#e2e8f0] text-xs shadow-2xs"
                        >
                          {att.type === 'image' && att.previewUrl ? (
                            <img
                              src={att.previewUrl}
                              alt={att.name}
                              className="w-4 h-4 rounded object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : att.type === 'link' ? (
                            <Link2 className="w-3.5 h-3.5 text-[#501f92]" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-[#501f92]" />
                          )}
                          <span className="font-medium text-[#0f172a] max-w-[120px] truncate text-[11px]">
                            {att.name}
                          </span>
                          {att.size && (
                            <span className="text-[9px] text-[#94a3b8]">({att.size})</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePendingAttachment(att.id)}
                            className="p-0.5 text-[#94a3b8] hover:text-[#ef4444] rounded-md transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Textarea Input */}
                  <div className="p-2.5 flex items-start gap-2.5">
                    {/* User Avatar */}
                    <div className="w-7 h-7 rounded-full bg-[#501f92] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                      CT
                    </div>

                    <textarea
                      ref={inputRef}
                      rows={2}
                      placeholder="Escribe un comentario... Usa @ para mencionar o # para referenciar tareas"
                      value={messageInput}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none bg-transparent resize-none leading-relaxed min-h-[44px]"
                    />
                  </div>

                  {/* Rich Toolbar & Actions Footer */}
                  <div className="px-2.5 py-1.5 bg-[#f8fafc] border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-2">
                    {/* Left formatting tools */}
                    <div className="flex items-center gap-0.5 text-[#64748b]">
                      <button
                        type="button"
                        onClick={() => applyFormatting('bold')}
                        className="p-1.5 rounded-lg hover:bg-white hover:text-[#0f172a] transition-colors cursor-pointer"
                        title="Negrita (**texto**)"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting('italic')}
                        className="p-1.5 rounded-lg hover:bg-white hover:text-[#0f172a] transition-colors cursor-pointer"
                        title="Cursiva (*texto*)"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting('list')}
                        className="p-1.5 rounded-lg hover:bg-white hover:text-[#0f172a] transition-colors cursor-pointer"
                        title="Lista (- item)"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting('code')}
                        className="p-1.5 rounded-lg hover:bg-white hover:text-[#0f172a] transition-colors cursor-pointer"
                        title="Código (`código`)"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting('quote')}
                        className="p-1.5 rounded-lg hover:bg-white hover:text-[#0f172a] transition-colors cursor-pointer"
                        title="Cita (> cita)"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>

                      <div className="h-4 w-px bg-[#e2e8f0] mx-1" />

                      {/* @ Mention trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setShowMentionMenu(!showMentionMenu);
                            setShowTaskMenu(false);
                            setQuickEmojiMenuOpen(false);
                          }}
                          className={`p-1.5 rounded-lg hover:bg-white hover:text-[#501f92] transition-colors cursor-pointer flex items-center gap-0.5 ${
                            showMentionMenu ? 'bg-white text-[#501f92] font-bold' : ''
                          }`}
                          title="Mencionar miembro (@)"
                        >
                          <AtSign className="w-3.5 h-3.5" />
                        </button>

                        {showMentionMenu && (
                          <div className="absolute bottom-full left-0 mb-2 w-52 max-h-52 overflow-y-auto rounded-2xl bg-white border border-[#e2e8f0] shadow-xl py-1 z-50 text-xs">
                            <span className="px-3 py-1 text-[10px] font-extrabold text-[#501f92] uppercase block tracking-wider">
                              Mencionar a:
                            </span>
                            {TEAM_MEMBERS_POOL.map((m) => (
                              <button
                                key={m.name}
                                type="button"
                                onClick={() => {
                                  setMessageInput((prev) => `${prev} @${m.name} `);
                                  setShowMentionMenu(false);
                                  inputRef.current?.focus();
                                }}
                                className="w-full px-3 py-1.5 text-left hover:bg-[#f8fafc] text-[#0f172a] flex items-center justify-between gap-2 cursor-pointer"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`w-4 h-4 rounded-full ${m.avatarBg} text-white flex items-center justify-center text-[8px] font-bold shrink-0`}>
                                    {m.initials}
                                  </span>
                                  <span className="truncate">{m.name}</span>
                                </div>
                                <span className="text-[9px] text-[#94a3b8]">{m.role}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* # Task reference trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setShowTaskMenu(!showTaskMenu);
                            setShowMentionMenu(false);
                            setQuickEmojiMenuOpen(false);
                          }}
                          className={`p-1.5 rounded-lg hover:bg-white hover:text-[#0284c7] transition-colors cursor-pointer flex items-center gap-0.5 ${
                            showTaskMenu ? 'bg-white text-[#0284c7] font-bold' : ''
                          }`}
                          title="Referenciar tarea (#)"
                        >
                          <Hash className="w-3.5 h-3.5" />
                        </button>

                        {showTaskMenu && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 max-h-52 overflow-y-auto rounded-2xl bg-white border border-[#e2e8f0] shadow-xl py-1 z-50 text-xs">
                            <span className="px-3 py-1 text-[10px] font-extrabold text-[#0284c7] uppercase block tracking-wider">
                              Vincular Tarea:
                            </span>
                            {tasksList && tasksList.length > 0 ? (
                              tasksList.slice(0, 6).map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => {
                                    setMessageInput((prev) => `${prev} #${t.id.toUpperCase()} `);
                                    setShowTaskMenu(false);
                                    inputRef.current?.focus();
                                  }}
                                  className="w-full px-3 py-1.5 text-left hover:bg-[#f0f9ff] text-[#0f172a] block cursor-pointer"
                                >
                                  <span className="font-mono font-bold text-[#0284c7] text-[10px] block">
                                    #{t.id.toUpperCase()}
                                  </span>
                                  <span className="truncate block text-[11px]">{t.title}</span>
                                </button>
                              ))
                            ) : (
                              <span className="px-3 py-2 text-[11px] text-[#94a3b8] block">Sin tareas cargadas</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 📎 File upload */}
                      <label
                        className="p-1.5 rounded-lg hover:bg-white hover:text-[#0f172a] cursor-pointer transition-colors"
                        title="Adjuntar archivos o imágenes"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                      </label>

                      {/* 🔗 Enlace / Link modal trigger */}
                      <button
                        type="button"
                        onClick={() => setIsLinkModalOpen(true)}
                        className="p-1.5 rounded-lg hover:bg-white hover:text-[#0f172a] transition-colors cursor-pointer"
                        title="Adjuntar enlace (Figma, Drive, Loom, etc.)"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>

                      {/* 😀 Quick Emoji bar */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setQuickEmojiMenuOpen(!quickEmojiMenuOpen)}
                          className="p-1.5 rounded-lg hover:bg-white hover:text-[#0f172a] transition-colors cursor-pointer"
                          title="Insertar emoji"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>

                        {quickEmojiMenuOpen && (
                          <div className="absolute bottom-full left-0 mb-2 p-1.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xl flex items-center gap-1 z-50 animate-in fade-in duration-100">
                            {['👍', '🙌', '🚀', '👀', '🎉', '🔥', '✅', '❤️'].map((em) => (
                              <button
                                key={em}
                                type="button"
                                onClick={() => {
                                  setMessageInput((prev) => `${prev} ${em}`);
                                  setQuickEmojiMenuOpen(false);
                                  inputRef.current?.focus();
                                }}
                                className="p-1 hover:scale-125 transition-transform text-sm cursor-pointer"
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side: Send button */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#94a3b8] hidden sm:inline">
                        Enter ↵ para enviar
                      </span>
                      <button
                        type="submit"
                        disabled={!messageInput.trim() && pendingAttachments.length === 0}
                        className={`px-3.5 py-1.5 rounded-xl text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          messageInput.trim() || pendingAttachments.length > 0
                            ? 'bg-[#501f92] hover:bg-[#381566] hover:shadow-md'
                            : 'bg-[#cbd5e1] cursor-not-allowed opacity-70'
                        }`}
                      >
                        <Send className="w-3 h-3" />
                        <span>Comentar</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* --------------------------------------------------------- */}
          {/* RIGHT RAIL: METADATA & RESPONSIBLES - 4 COLS (Or Full view on Mobile when activeTab === 'info') */}
          {/* --------------------------------------------------------- */}
          <div
            id="task-right-rail"
            className={`${
              activeTab === 'info' ? 'block' : 'hidden lg:block'
            } lg:col-span-4 p-4 sm:p-6 bg-white space-y-5 text-xs overflow-y-auto max-h-full`}
          >
            {/* Mobile-only tab switcher at top of right rail for quick switching */}
            <div className="lg:hidden flex items-center gap-4 border-b border-[#e2e8f0] pb-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('mensajes')}
                className="text-xs font-bold text-[#64748b] hover:text-[#501f92] transition-colors cursor-pointer"
              >
                ← Volver a Mensajes
              </button>
              <span className="text-[#cbd5e1]">|</span>
              <button
                type="button"
                onClick={() => setActiveTab('entregables')}
                className="text-xs font-bold text-[#64748b] hover:text-[#501f92] transition-colors cursor-pointer"
              >
                Entregables
              </button>
            </div>

            {/* 1. Estado & Prioridad (2 Columns side-by-side) */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#64748b] mb-1.5">Estado</label>
                  <div className="relative">
                    <select
                      id="task-status-select"
                      value={task.status}
                      onChange={(e) => {
                        if (onUpdateTaskStatus) onUpdateTaskStatus(task.id, e.target.value as TaskStatus);
                        showToast(`Estado cambiado a ${e.target.value === 'Done' ? 'Completada' : e.target.value === 'Review' ? 'En revisión' : e.target.value === 'In Progress' ? 'En proceso' : 'Por hacer'}`);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white font-bold text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92] cursor-pointer shadow-2xs appearance-none pr-8"
                    >
                      <option value="To Do">⚪ Por hacer</option>
                      <option value="In Progress">🟡 En proceso</option>
                      <option value="Review">🔍 En revisión</option>
                      <option value="Done">🟢 Completada</option>
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

              {/* Action button to advance status */}
              <button
                type="button"
                onClick={handleProgressTaskStatus}
                className="w-full py-2 px-3 rounded-xl bg-[#f5f3ff] hover:bg-[#ede9fe] text-[#501f92] border border-[#ddd6fe] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {task.status === 'To Do' && (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Iniciar tarea → En proceso</span>
                  </>
                )}
                {task.status === 'In Progress' && (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Marcar como Completada</span>
                  </>
                )}
                {task.status === 'Review' && (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Marcar como Completada</span>
                  </>
                )}
                {task.status === 'Done' && (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reabrir tarea (En proceso)</span>
                  </>
                )}
              </button>
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

            {/* 4. Estructura de Responsabilidades & Roles */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0f172a] text-xs block">Equipo & Responsabilidades</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-3">
                {/* 1. Project Lead (Líder de proyecto / gestión general) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-[#0f172a] flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-[#501f92]" />
                      <span>Project Lead</span>
                    </span>
                    <span className="text-[10px] text-[#64748b]">Lidera la gestión</span>
                  </div>

                  <DropdownMenu
                    value={projectLead?.name || 'Paola (Lead PM)'}
                    onChange={(val) => {
                      const member = TEAM_MEMBERS_POOL.find((m) => m.name === val);
                      if (member) {
                        const newLead = {
                          name: member.name,
                          initials: member.initials,
                          avatarBg: member.avatarBg,
                          role: member.role
                        };
                        applyTeamUpdate(assignee, collaborators, reviewer, requestedBy, budgetedRole, requiresValidation, newLead, followers);
                        showToast(`Project Lead asignado: ${member.name}`);
                      }
                    }}
                    options={TEAM_MEMBERS_POOL.map((m) => ({
                      id: m.name,
                      label: m.name,
                      sublabel: m.role,
                      icon: (
                        <div className={`w-5 h-5 rounded-full ${m.avatarBg} text-white flex items-center justify-center text-[9px] font-bold shrink-0`}>
                          {m.initials}
                        </div>
                      )
                    }))}
                    trigger={
                      <div className="w-full flex items-center justify-between p-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] transition-colors text-left cursor-pointer group">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-full ${projectLead?.avatarBg || 'bg-[#501f92]'} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                            {projectLead?.initials || 'PL'}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#0f172a] truncate block">
                              {projectLead?.name || 'Sin Project Lead'}
                            </span>
                            <span className="text-[10px] text-[#64748b] truncate block">
                              {projectLead?.role || 'Líder del proyecto'}
                            </span>
                          </div>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#501f92] transition-colors shrink-0" />
                      </div>
                    }
                    className="w-full"
                    menuClassName="w-full z-40 max-h-56"
                  />
                </div>

                {/* 2. Colaboradores (Responsables de la ejecución - multiselección) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-[#0f172a] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>Colaboradores</span>
                    </span>
                    <span className="text-[10px] text-[#64748b]">Ejecutan la tarea</span>
                  </div>

                  <DropdownMenu
                    multiple={true}
                    value={
                      // Use collaborators combined with assignee if applicable
                      Array.from(new Set([assignee.name, ...collaborators.map((c) => c.name)].filter((n) => n && n !== '-')))
                    }
                    onChange={() => {}}
                    onMultiChange={(selectedNames) => {
                      if (selectedNames.length === 0) {
                        showToast('La tarea debe tener al menos un colaborador');
                        return;
                      }
                      const selectedMembers = selectedNames
                        .map((name) => TEAM_MEMBERS_POOL.find((m) => m.name === name))
                        .filter(Boolean) as TeamMemberProfile[];

                      const primary = selectedMembers[0] || {
                        name: 'Catalina Tejada',
                        initials: 'CT',
                        avatarBg: 'bg-[#501f92]',
                        role: 'Diseñador Gráfico'
                      };
                      const rest = selectedMembers.slice(1).map((m) => ({
                        name: m.name,
                        initials: m.initials,
                        avatarBg: m.avatarBg,
                        role: m.role
                      }));

                      const primaryAssignee = {
                        name: primary.name,
                        initials: primary.initials,
                        avatarBg: primary.avatarBg,
                        role: primary.role
                      };

                      applyTeamUpdate(primaryAssignee, rest, reviewer, requestedBy, budgetedRole, requiresValidation, projectLead, followers);
                    }}
                    options={TEAM_MEMBERS_POOL.map((m) => ({
                      id: m.name,
                      label: m.name,
                      sublabel: m.role,
                      icon: (
                        <div className={`w-5 h-5 rounded-full ${m.avatarBg} text-white flex items-center justify-center text-[9px] font-bold shrink-0`}>
                          {m.initials}
                        </div>
                      )
                    }))}
                    trigger={
                      <div className="w-full flex items-center justify-between p-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] transition-colors text-left cursor-pointer group">
                        <div className="flex items-center gap-2 min-w-0">
                          {(() => {
                            const map = new Map<string, typeof assignee>();
                            if (assignee && assignee.name && assignee.name !== '-') {
                              map.set(assignee.name, assignee);
                            }
                            collaborators.forEach((c) => {
                              if (c && c.name && c.name !== '-') {
                                map.set(c.name, c);
                              }
                            });
                            const allCollabs = Array.from(map.values());

                            if (allCollabs.length === 0) {
                              return (
                                <span className="text-xs text-[#94a3b8] italic">Seleccionar colaboradores...</span>
                              );
                            }

                            return (
                              <div className="flex items-center gap-1.5 overflow-hidden flex-wrap">
                                {allCollabs.slice(0, 3).map((c, i) => (
                                  <div
                                    key={i}
                                    className={`w-6 h-6 rounded-full ${c.avatarBg || 'bg-[#501f92]'} text-white flex items-center justify-center text-[10px] font-bold shadow-2xs`}
                                    title={c.name}
                                  >
                                    {c.initials || 'CT'}
                                  </div>
                                ))}
                                {allCollabs.length > 3 && (
                                  <span className="text-[10px] font-bold text-[#64748b]">
                                    +{allCollabs.length - 3}
                                  </span>
                                )}
                                <span className="text-xs font-semibold text-[#0f172a] truncate ml-0.5">
                                  {allCollabs.map((c) => c.name.split(' ')[0]).join(', ')}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#501f92] transition-colors shrink-0" />
                      </div>
                    }
                    className="w-full"
                    menuClassName="w-full z-40 max-h-56"
                  />
                </div>

                {/* 3. Seguidores (Enterados, acompañamiento y revisión sin responsabilidad de ejecución) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-[#0f172a] flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#6366f1]" />
                      <span>Seguidores</span>
                    </span>
                    <span className="text-[10px] text-[#64748b]">Acompañamiento</span>
                  </div>

                  <DropdownMenu
                    multiple={true}
                    value={followers.map((f) => f.name)}
                    onChange={() => {}}
                    onMultiChange={(selectedNames) => {
                      const updatedFollowers = selectedNames
                        .map((name) => TEAM_MEMBERS_POOL.find((m) => m.name === name))
                        .filter(Boolean)
                        .map((m) => ({
                          name: m!.name,
                          initials: m!.initials,
                          avatarBg: m!.avatarBg,
                          role: m!.role
                        }));

                      applyTeamUpdate(assignee, collaborators, reviewer, requestedBy, budgetedRole, requiresValidation, projectLead, updatedFollowers);
                    }}
                    options={TEAM_MEMBERS_POOL.map((m) => ({
                      id: m.name,
                      label: m.name,
                      sublabel: m.role,
                      icon: (
                        <div className={`w-5 h-5 rounded-full ${m.avatarBg} text-white flex items-center justify-center text-[9px] font-bold shrink-0`}>
                          {m.initials}
                        </div>
                      )
                    }))}
                    trigger={
                      <div className="w-full flex items-center justify-between p-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] transition-colors text-left cursor-pointer group">
                        <div className="flex items-center gap-2 min-w-0">
                          {followers.length === 0 ? (
                            <span className="text-xs text-[#94a3b8] italic">Sin seguidores</span>
                          ) : (
                            <div className="flex items-center gap-1.5 overflow-hidden flex-wrap">
                              {followers.slice(0, 3).map((f, i) => (
                                <div
                                  key={i}
                                  className={`w-6 h-6 rounded-full ${f.avatarBg || 'bg-[#6366f1]'} text-white flex items-center justify-center text-[10px] font-bold shadow-2xs`}
                                  title={f.name}
                                >
                                  {f.initials || 'U'}
                                </div>
                              ))}
                              {followers.length > 3 && (
                                <span className="text-[10px] font-bold text-[#64748b]">
                                  +{followers.length - 3}
                                </span>
                              )}
                              <span className="text-xs font-semibold text-[#0f172a] truncate ml-0.5">
                                {followers.map((f) => f.name.split(' ')[0]).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#501f92] transition-colors shrink-0" />
                      </div>
                    }
                    className="w-full"
                    menuClassName="w-full z-40 max-h-56"
                  />
                </div>

                {/* 4. Rol Cotizado (Informativo / Tarifa presupuestada) */}
                <div className="pt-2 border-t border-[#f1f5f9]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-[#0f172a] flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>Rol cotizado</span>
                    </span>
                    <span className="text-[10px] text-[#0284c7] font-semibold bg-[#f0f9ff] px-2 py-0.5 rounded-md border border-[#bae6fd]">
                      Tarifario
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0369a1] truncate block">
                        {budgetedRole}
                      </span>
                      <span className="text-[10px] text-[#64748b] block mt-0.5">
                        Definido en el presupuesto del proyecto
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Retrabajos (Medición de Calidad: Cliente vs Interno) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0f172a] text-xs flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-[#501f92]" />
                  <span>Retrabajos</span>
                  {task.reworks && task.reworks.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
                      {task.reworks.length}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingRework(!isAddingRework)}
                  className="text-[11px] font-bold text-[#501f92] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingRework ? 'Cancelar' : 'Registrar'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-3">
                {/* Form to log rework */}
                {isAddingRework && (
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2.5">
                    <span className="text-xs font-bold text-[#0f172a] block">
                      Registrar nuevo retrabajo
                    </span>

                    <div>
                      <label className="text-[10px] font-bold text-[#64748b] block mb-1">
                        Origen del retrabajo:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setReworkOrigin('client')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            reworkOrigin === 'client'
                              ? 'bg-[#501f92] text-white shadow-xs'
                              : 'bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-[#f1f5f9]'
                          }`}
                        >
                          👤 Por Cliente
                        </button>
                        <button
                          type="button"
                          onClick={() => setReworkOrigin('internal')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            reworkOrigin === 'internal'
                              ? 'bg-[#501f92] text-white shadow-xs'
                              : 'bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-[#f1f5f9]'
                          }`}
                        >
                          🛡️ QA / Interno
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#64748b] block mb-1">
                        Motivo / Observación del ajuste:
                      </label>
                      <textarea
                        rows={2}
                        value={reworkReason}
                        onChange={(e) => setReworkReason(e.target.value)}
                        placeholder="Ej. Cambio de copies por nueva directriz del cliente..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#501f92] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-[#64748b] block mb-1">
                          Solicitado por:
                        </label>
                        <input
                          type="text"
                          value={reworkRequestedBy}
                          onChange={(e) => setReworkRequestedBy(e.target.value)}
                          placeholder="Nombre persona"
                          className="w-full px-2 py-1 rounded-lg border border-[#e2e8f0] bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#501f92]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#64748b] block mb-1">
                          Horas estimadas:
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={reworkHours}
                          onChange={(e) => setReworkHours(e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-[#e2e8f0] bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#501f92]"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!reworkReason.trim()) {
                          showToast('Por favor describe el motivo del retrabajo');
                          return;
                        }
                        const nextRound = (task.reworks?.length || 0) + 1;
                        const reasonText = reworkReason.trim();
                        const requesterName =
                          reworkRequestedBy.trim() || (reworkOrigin === 'client' ? task.clientName || 'Cliente' : 'QA Interno');
                        const reworkHoursNum = parseFloat(reworkHours) || 1;

                        if (onAddRework) {
                          onAddRework(task.id, {
                            origin: reworkOrigin,
                            roundNumber: nextRound,
                            reason: reasonText,
                            requestedBy: requesterName,
                            hoursSpent: reworkHoursNum,
                            resolved: false
                          });
                        }

                        // Inject rework comment into general task message feed
                        const reworkMessage: ChatMessage = {
                          id: `msg-rwk-${Date.now()}`,
                          authorName: requesterName,
                          authorRoleLabel: reworkOrigin === 'client' ? 'Retrabajo por Cliente' : 'Retrabajo QA Interno',
                          authorInitials:
                            requesterName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase() || 'RT',
                          authorAvatarBg: reworkOrigin === 'client' ? 'bg-[#2563eb]' : 'bg-[#7e22ce]',
                          timestamp: 'Ahora mismo',
                          content: `🔄 [Retrabajo Ronda ${nextRound} · ${reworkHoursNum}h]: ${reasonText}`
                        };

                        setChatMessages((prev) => [...prev, reworkMessage]);
                        showToast(`Retrabajo registrado y cargado en mensajes`);
                        setIsAddingRework(false);
                        setReworkReason('');
                      }}
                      className="w-full py-1.5 rounded-lg bg-[#501f92] hover:bg-[#381566] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      Guardar Retrabajo
                    </button>
                  </div>
                )}

                {/* List of existing reworks */}
                {task.reworks && task.reworks.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {task.reworks.map((rwk, idx) => (
                      <div
                        key={rwk.id || idx}
                        className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              rwk.origin === 'client'
                                ? 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]'
                                : 'bg-[#faf5ff] text-[#7e22ce] border border-[#e9d5ff]'
                            }`}
                          >
                            {rwk.origin === 'client' ? '👤 Cliente' : '🛡️ Interno (QA)'} · Ronda {rwk.roundNumber || idx + 1}
                          </span>
                          <span className="text-[10px] text-[#94a3b8]">{rwk.date}</span>
                        </div>
                        <p className="text-[#334155] font-medium text-[11px] leading-relaxed">
                          {rwk.reason}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-[#64748b] pt-1 border-t border-[#f1f5f9]">
                          <span>Por: <strong className="text-[#0f172a]">{rwk.requestedBy}</strong></span>
                          {rwk.hoursSpent && (
                            <span className="font-mono font-semibold">{rwk.hoursSpent}h dedicadas</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !isAddingRework && (
                    <div className="text-center py-2">
                      <span className="text-[11px] text-[#94a3b8] block">
                        Sin retrabajos registrados. Tarea en estándar de calidad.
                      </span>
                    </div>
                  )
                )}
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

      {/* ========================================================= */}
      {/* MODAL: ADJUNTAR ENLACE (Figma, Drive, Loom, GitHub, etc.) */}
      {/* ========================================================= */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#e2e8f0] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-[#0f172a] text-sm flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#501f92]" />
                Adjuntar Enlace de Trabajo
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkInputUrl('');
                  setLinkInputTitle('');
                }}
                className="p-1 text-[#94a3b8] hover:text-[#0f172a] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#334155] mb-1">
                  URL del recurso *
                </label>
                <input
                  type="url"
                  placeholder="https://figma.com/..., https://drive.google.com/..., etc."
                  value={linkInputUrl}
                  onChange={(e) => {
                    setLinkInputUrl(e.target.value);
                    if (!linkInputTitle) {
                      if (e.target.value.includes('figma.com')) setLinkInputTitle('Archivo Figma');
                      else if (e.target.value.includes('drive.google.com')) setLinkInputTitle('Carpeta Google Drive');
                      else if (e.target.value.includes('loom.com')) setLinkInputTitle('Video Loom');
                      else if (e.target.value.includes('github.com')) setLinkInputTitle('Repositorio GitHub');
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#501f92]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#334155] mb-1">
                  Título descriptivo (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Maquetas UI v2, Grabación de feedback"
                  value={linkInputTitle}
                  onChange={(e) => setLinkInputTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#0f172a] focus:outline-none focus:border-[#501f92]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkInputUrl('');
                  setLinkInputTitle('');
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveLinkAttachment}
                disabled={!linkInputUrl.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
                  linkInputUrl.trim()
                    ? 'bg-[#501f92] hover:bg-[#381566] shadow-xs'
                    : 'bg-[#cbd5e1] cursor-not-allowed opacity-70'
                }`}
              >
                Adjuntar enlace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LIGHTBOX: VISOR DE IMÁGENES EN ALTA RESOLUCIÓN */}
      {/* ========================================================= */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
          >
            {/* Lightbox Header */}
            <div className="p-3 bg-black/40 text-white flex items-center justify-between text-xs px-4">
              <span className="font-semibold truncate max-w-md">{lightboxImage.title}</span>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-white/70 hover:text-white rounded-lg transition-colors"
                  title="Abrir en pestaña nueva"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1 text-white/70 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Image Preview */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
