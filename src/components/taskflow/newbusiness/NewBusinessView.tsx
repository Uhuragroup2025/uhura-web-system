import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  NewBusinessOpportunity,
  QuoteProposal,
  ClientProfile,
  ProductBacklogTemplate,
  ProjectType,
  StartConditionsConfig,
  SowDocumentData,
  UserItem,
  TaskItem,
  TimeLog,
  ActiveTimerState
} from '../types';
import { getOperationalQuote, withOperationalQuote, getCommercialOwnerName, isValidFinanceSheetUrl, quoteSignature, quoteMissingRequirements } from './quoteRules';
import { can } from '../auth/permissions';
import { serviceValidationMessages, isScopeReadyForReview, isEligibleScopingLeader, getScopeWeeks } from './teamCandidates';
import { BacklogScoper, type ScopeServiceDraft } from './BacklogScoper';
import { NewOpportunityModal } from './NewOpportunityModal';
import { ConvertOpportunityModal } from './ConvertOpportunityModal';
import { UHURA_LEGAL_SIGNER } from './slaEngine';
import { formatCurrency, formatHours } from '../../../utils/formatters';
import {
  Target,
  Plus,
  Layers,
  Sparkles,
  FileText,
  Calculator,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Share2,
  ExternalLink,
  Search,
  Filter,
  ChevronRight,
  Briefcase,
  TrendingUp,
  FolderPlus,
  Folder,
  ShieldCheck,
  CheckSquare,
  FileCheck,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Copy,
  Printer,
  Play,
  Sliders,
  X,
  Trophy,
  Lock,
  Info,
  Pencil,
  Edit3,
  ThumbsDown
} from 'lucide-react';

interface NewBusinessViewProps {
  scopeUi: Record<string, { saved: boolean; services: ScopeServiceDraft[] }>;
  onChangeScopeUi: (quoteId: string, state: { saved: boolean; services: ScopeServiceDraft[] }) => void;
  onOpenSow: (opportunityId: string) => void;
  savedQuotes: Record<string, string>;
  onSetQuoteSaved: (quoteId: string, signature?: string) => void;
  opportunities: NewBusinessOpportunity[];
  clients: ClientProfile[];
  templates: ProductBacklogTemplate[];
  onUpdateOpportunity: (updatedOpp: NewBusinessOpportunity) => void;
  onCreateOpportunity: (newOpp: NewBusinessOpportunity) => void;
  onNavigateToView?: (view: any, targetId?: string | null) => void;
  onConvertOpportunityToProject?: (payload: {
    opportunity: NewBusinessOpportunity;
    selectedQuote: QuoteProposal;
    projectName: string;
    projectType: ProjectType;
    leadUserId: string;
    specialistUserIds?: string[];
    leadName: string;
    startDate: string;
    endDate?: string;
    initialFormalizationStatus?: 'pendiente_formalizacion' | 'activo';
    startConditionsConfig?: any;
  }) => void;
  currentUser?: UserItem;
  users?: UserItem[];
  tasks?: TaskItem[];
  timeLogs?: TimeLog[];
  activeTimer?: ActiveTimerState | null;
  onStartTimer?: (task: TaskItem) => void;
  onStopTimer?: () => void;
}

export const NewBusinessView: React.FC<NewBusinessViewProps> = ({
  scopeUi,
  onChangeScopeUi,
  savedQuotes,
  onSetQuoteSaved,
  opportunities,
  clients,
  templates,
  onUpdateOpportunity,
  onCreateOpportunity,
  onNavigateToView,
  onConvertOpportunityToProject,
  currentUser,
  users: teamUsers = [],
  tasks = [],
  timeLogs = [],
  activeTimer = null,
  onStartTimer,
  onStopTimer
}) => {
  const users = teamUsers.filter((user) => user.status === 'Active');

  // Leaders, Commercial, Executives, and System Admins can create and manage opportunities
  const isNotCollaboratorOrPending = !currentUser || (currentUser.accessLevel !== 'collaborator' && currentUser.accessLevel !== 'pending');
  const canCreateOpp = can(currentUser, 'create', 'new-business') || isNotCollaboratorOrPending;
  const canApproveOpp = can(currentUser, 'approve', 'new-business') || isNotCollaboratorOrPending;
  const canEditOpp = can(currentUser, 'edit', 'new-business') || isNotCollaboratorOrPending;

  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'scoping' | 'cotizacion'>('resumen');
  const [isNewOppModalOpen, setIsNewOppModalOpen] = useState<boolean>(false);
  const [oppModalMode, setOppModalMode] = useState<'hubspot' | 'manual'>('hubspot');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isConvertModalOpen, setIsConvertModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'quoting' | 'won'>('all');
  const [bannerNotification, setBannerNotification] = useState<{
    message: string;
    showProjectLink?: boolean;
    actionButton?: {
      label: string;
      onClick: () => void;
    };
  } | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [wonCelebrationOpp, setWonCelebrationOpp] = useState<NewBusinessOpportunity | null>(null);
  const [isQuoteSavedFeedback, setIsQuoteSavedFeedback] = useState<boolean>(false);
  const [isEditingQuoteFields, setIsEditingQuoteFields] = useState<boolean>(false);
  const [isEditingBrief, setIsEditingBrief] = useState<boolean>(false);
  const [isLostModalOpen, setIsLostModalOpen] = useState<boolean>(false);
  const [lostReason, setLostReason] = useState<string>('precio');
  const [lostNotes, setLostNotes] = useState<string>('');

  // Fanfarria triunfal Web Audio para celebrar propuesta ganada
  const playWonFanfare = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      // Arpegio mayor triunfal: C5, E5, G5, C6, E6
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.11);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.11 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.11);
        osc.stop(ctx.currentTime + idx * 0.11 + 0.45);
      });
    } catch {
      // AudioContext bloqueado o no disponible en navegador
    }
  };

  const handleMarkOpportunityWon = (opp: NewBusinessOpportunity) => {
    if (opp.id !== activeOpp?.id || !isQuoteDiligenciada) return;
    const updated: NewBusinessOpportunity = {
      ...opp,
      status: 'won',
      hubspotDealStage: 'closedwon',
      updatedAt: new Date().toISOString()
    };
    onUpdateOpportunity(updated);
    setWonCelebrationOpp(updated);
    playWonFanfare();
    setConversionSuccessMessage('🎉 ¡FIESTA TOTAL EN LA COLONIA! ¡Propuesta GANADA! Puedes convertir la oportunidad a Cliente y Proyecto. La formalización fiscal se gestiona en la ficha del Cliente y no bloquea la conversión.', {
      timeoutMs: 9000
    });
  };

  // Helper de notificación unificado con auto-dismiss
  const setConversionSuccessMessage = (
    message: string | null,
    options?: {
      showProjectLink?: boolean;
      actionButton?: { label: string; onClick: () => void };
      timeoutMs?: number;
    }
  ) => {
    if (!message) {
      setBannerNotification(null);
    } else {
      setBannerNotification({
        message,
        showProjectLink: options?.showProjectLink ?? false,
        actionButton: options?.actionButton
      });
      setTimeout(() => setBannerNotification(null), options?.timeoutMs || 6000);
    }
  };

  // SLA inline editing state
  const [isEditingSla, setIsEditingSla] = useState<boolean>(false);
  const [customSlaInput, setCustomSlaInput] = useState<number>(36);

  // Leader reassign state
  const [isReassigningLead, setIsReassigningLead] = useState<boolean>(false);

  // Loss reason modal
  const [lossModalOpen, setLossModalOpen] = useState<boolean>(false);
  const [lossReasonInput, setLossReasonInput] = useState<string>('Presupuesto fuera de rango');

  // Popover / Tooltip: ¿Cómo funciona New Business?
  const [showFlowInfo, setShowFlowInfo] = useState<boolean>(false);
  const flowInfoRef = useRef<HTMLDivElement>(null);

  // Close flow info popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (flowInfoRef.current && !flowInfoRef.current.contains(event.target as Node)) {
        setShowFlowInfo(false);
      }
    };
    if (showFlowInfo) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFlowInfo]);

  const activeOpp = opportunities.find((o) => o.id === selectedOppId);

  const activeQuote = getOperationalQuote(activeOpp);
  const scopeState = activeQuote ? scopeUi[activeQuote.id] || { saved: false, services: [] } : { saved: false, services: [] };
  const allServicesValid = scopeState.services.every((service) => serviceValidationMessages(service).length === 0);
  const allServicesPrepared = allServicesValid && scopeState.services.every((service) => service.saved === true);
  const isScopeReadOnly = scopeState.saved && allServicesPrepared;

  // Controlled Draft State for Cotización (prevents premature locking on keystroke)
  const [quoteValueDraft, setQuoteValueDraft] = useState<string>('');
  const [quoteCurrencyDraft, setQuoteCurrencyDraft] = useState<'COP' | 'USD'>('COP');
  const [quoteSheetUrlDraft, setQuoteSheetUrlDraft] = useState<string>('');
  const [quoteNotesDraft, setQuoteNotesDraft] = useState<string>('');

  // Controlled Draft State for Resumen Discovery Brief
  const [briefDraft, setBriefDraft] = useState<string>('');

  // Sync draft states when quote changes
  useEffect(() => {
    if (activeQuote) {
      const val = activeQuote.totalQuotedValue ?? activeQuote.totalQuotedValueCOP ?? 0;
      setQuoteValueDraft(val > 0 ? String(val) : '');
      setQuoteCurrencyDraft(activeQuote.currency || 'COP');
      setQuoteSheetUrlDraft(activeQuote.externalFinanceSheetUrl || '');
      setQuoteNotesDraft(activeQuote.commercialNotes || '');
      setIsEditingQuoteFields(!savedQuotes[activeQuote.id]);
      setIsQuoteSavedFeedback(false);
    }
  }, [activeQuote?.id]);

  // Sync brief draft when opportunity changes
  useEffect(() => {
    if (activeOpp) {
      const bText = activeOpp.briefSummary || activeOpp.discoveryNotes || '';
      setBriefDraft(bText);
      setIsEditingBrief(!bText);
    }
  }, [activeOpp?.id]);

  // Helper: ¿La cotización ya fue guardada con monto por comercial?
  const isQuoteDiligenciada = Boolean(
    activeQuote && savedQuotes[activeQuote.id] === quoteSignature(activeQuote.totalQuotedValue ?? activeQuote.totalQuotedValueCOP ?? 0, activeQuote.externalFinanceSheetUrl || '') &&
    isValidFinanceSheetUrl(activeQuote.externalFinanceSheetUrl) &&
    (activeQuote.totalQuotedValue ?? activeQuote.totalQuotedValueCOP ?? 0) > 0 &&
    !isEditingQuoteFields
  );

  const missingQuoteFields = quoteMissingRequirements(Number(quoteValueDraft), quoteSheetUrlDraft);
  const quotePendingMessage = missingQuoteFields.length ? missingQuoteFields.join(' ') : 'Falta guardar la cotización para habilitar Marcar como ganada.';

  // Scoping task and preventa hours calculation
  const scopingTask = tasks.find(
    (t) =>
      (activeOpp?.preventaTimeLogTaskId && t.id === activeOpp.preventaTimeLogTaskId) ||
      (activeOpp?.title && t.title.includes(activeOpp.title) && (t.clientName === 'UHURA Group' || t.board === 'New Business' || t.projectId === 'prj-uhu-3'))
  );

  const preventaHoursLogged = useMemo(() => {
    if (!scopingTask || !timeLogs) return 0;
    return timeLogs
      .filter((l) => l.taskId === scopingTask.id)
      .reduce((sum, l) => sum + ((l.durationSeconds || 0) / 3600), 0);
  }, [scopingTask, timeLogs]);

  // Context counts for pipeline overview
  const porDimensionarCount = opportunities.filter((o) => o.status === 'discovery').length;
  const scopingCount = opportunities.filter((o) => o.status === 'quoting' || o.status === 'internal_review').length;
  const negotiationCount = opportunities.filter((o) => o.status === 'proposal_sent' || o.status === 'negotiation').length;
  const wonCount = opportunities.filter((o) => o.status === 'won').length;

  const isScopingTimerRunning = activeTimer?.taskId === scopingTask?.id;

  // Líder productivo actual (1 líder con persistencia canónica en leadUserId)
  const currentLeadDisplayName = useMemo(() => {
    const ids = activeOpp?.leadUserIds?.length ? activeOpp.leadUserIds : [activeOpp?.leadUserId];
    return users.filter((user) => ids.includes(user.id)).map((user) => user.name).join(', ') || 'Sin asignar';
  }, [activeOpp?.leadUserIds, activeOpp?.leadUserId, users]);

  // Preparación interna desacoplada (futuro soporte multi-lead cuando backend soporte relación 1..N)
  const currentLeadUserIds: string[] = useMemo(() => {
    if (Array.isArray(activeOpp?.leadUserIds) && activeOpp.leadUserIds.length > 0) {
      return activeOpp.leadUserIds;
    }
    return activeOpp?.leadUserId ? [activeOpp.leadUserId] : [];
  }, [activeOpp?.leadUserIds, activeOpp?.leadUserId]);

  // HubSpot connection & simulation controls:
  // - En producción (import.meta.env.PROD) la simulación está deshabilitada/oculta.
  // - Si la oportunidad está conectada a HubSpot real (isHubspotConnected = true), la simulación está bloqueada.
  // - En desarrollo/staging/demo desconectado, permite simular 'closedwon' como herramienta de prototipado.
  const isDevEnvironment = import.meta.env.DEV || !import.meta.env.PROD;
  const isHubspotRealConnected = !!activeOpp?.isHubspotConnected;
  const canSimulateWon = isDevEnvironment && !isHubspotRealConnected;

  // Formalization Gates & Conversion eligibility
  const isWon = activeOpp?.status === 'won';
  const isContractSignedRequired = activeOpp?.startConditions?.contractSignedRequired !== false;
  const isContractSignedCompleted = !!activeOpp?.startConditions?.contractSignedCompleted;
  const contractGatePassed = !isContractSignedRequired || isContractSignedCompleted;

  const isDownPaymentRequired = activeOpp?.startConditions?.downPaymentRequired === 'required';
  const isDownPaymentReceived = !!activeOpp?.startConditions?.downPaymentReceived;
  const downPaymentGatePassed = !isDownPaymentRequired || isDownPaymentReceived;

  const isFormalizationGatesMet = contractGatePassed && downPaymentGatePassed;
  const canConvertToProject = isWon;

  // Handle updating start conditions directly
  const handleUpdateStartConditions = (patch: Partial<StartConditionsConfig>) => {
    if (!activeOpp) return;
    const currentConditions: StartConditionsConfig = activeOpp.startConditions || {
      contractSignedRequired: true,
      contractSignedCompleted: false,
      downPaymentRequired: 'required',
      downPaymentPercentage: 50,
      downPaymentReceived: false,
      fiscalDocsRequiredBeforeBilling: true,
      fiscalDocsCompleted: false,
      onboardingCompleted: false
    };
    const updatedOpp: NewBusinessOpportunity = {
      ...activeOpp,
      startConditions: { ...currentConditions, ...patch },
      updatedAt: new Date().toISOString()
    };
    onUpdateOpportunity(updatedOpp);
  };

  // Handle updating a quote within the current opportunity
  const handleUpdateQuote = (updatedQuote: QuoteProposal) => {
    if (!activeOpp) return;
    const updatedOpp: NewBusinessOpportunity = {
      ...withOperationalQuote(activeOpp, updatedQuote),
      updatedAt: new Date().toISOString()
    };
    onUpdateOpportunity(updatedOpp);
  };

  // Callback when a new opportunity is created
  const [commercialTeamUi, setCommercialTeamUi] = useState<Record<string, string[]>>({});
  const handleCreatedOpportunity = (newOpp: NewBusinessOpportunity, commercialUserIds: string[] = []) => {
    setCommercialTeamUi((previous) => ({ ...previous, [newOpp.id]: commercialUserIds }));
    onCreateOpportunity(newOpp);
    setSelectedOppId(newOpp.id);
    setActiveTab('scoping');
  };

  // Handle conversion confirmation
  const handleConfirmConversion = (payload: {
    projectName: string;
    projectType: ProjectType;
    leadUserId: string;
    specialistUserIds?: string[];
    leadName: string;
    startDate: string;
    endDate?: string;
  }) => {
    if (!activeOpp || !activeQuote || !users.some((user) => user.id === payload.leadUserId)) return;
    if (onConvertOpportunityToProject) {
      onConvertOpportunityToProject({
        opportunity: activeOpp,
        selectedQuote: activeQuote,
        ...payload
      });
    } else {
      // Fallback local update if parent handler not provided
      const updatedOpp: NewBusinessOpportunity = {
        ...activeOpp,
        status: 'won',
        convertedAt: new Date().toISOString()
      };
      onUpdateOpportunity(updatedOpp);
    }

    setIsConvertModalOpen(false);
    setBannerNotification({
      message: `🎉 ¡"${payload.projectName}" se ha convertido a Cliente y Proyecto! La formalización fiscal continúa en la ficha del Cliente.`,
      showProjectLink: true
    });
    setTimeout(() => {
      setBannerNotification(null);
    }, 10000);
  };

  // Filter opportunities for catalog view
  const filteredOpps = opportunities.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      o.title.toLowerCase().includes(q) ||
      (o.prospectAccountName && o.prospectAccountName.toLowerCase().includes(q)) ||
      (o.contactName && o.contactName.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'quoting') return o.status !== 'won';
    if (statusFilter === 'won') return o.status === 'won';
    return true;
  });

  // Global metrics for the header
  const totalQuotingCount = opportunities.filter((o) => o.status !== 'won').length;
  const totalWonCount = opportunities.filter((o) => o.status === 'won').length;
  const totalQuotedHours = opportunities.reduce((acc, o) => {
    const h = getOperationalQuote(o)?.totalHoursRollup || 0;
    return acc + h;
  }, 0);

  // =========================================================================
  // VIEW 1: CATALOG OF OPPORTUNITIES (Grid of Cards)
  // =========================================================================
  if (!selectedOppId || !activeOpp) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Banner de Notificación Contextual */}
        {bannerNotification && (
          <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] flex items-center justify-between gap-3 shadow-xs animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
              <span className="text-xs font-bold leading-relaxed">{bannerNotification.message}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {bannerNotification.actionButton && (
                <button
                  type="button"
                  onClick={bannerNotification.actionButton.onClick}
                  className="px-3 py-1.5 rounded-lg bg-[#501f92] hover:bg-[#3d1572] text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  {bannerNotification.actionButton.label}
                </button>
              )}
              {bannerNotification.showProjectLink && onNavigateToView && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onNavigateToView('clientes', activeOpp?.clientId || undefined)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#a7f3d0] hover:bg-[#d1fae5] text-[#065f46] text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    Ver Cliente →
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateToView('proyectos', activeOpp?.convertedProjectId || undefined)}
                    className="px-3 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    Ver en Proyectos →
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setBannerNotification(null)}
                className="p-1 rounded-lg hover:bg-[#d1fae5] text-[#065f46] cursor-pointer"
                title="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 1. Header Plano Estandarizado (Benchmark Clientes) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">
              New Business
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b] mt-1">
              Dimensionamiento técnico, cotizaciones y transición a proyectos
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {/* Popover / Tooltip: ¿Cómo funciona New Business? ⓘ */}
            <div className="relative" ref={flowInfoRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFlowInfo((prev) => !prev);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#501f92] hover:bg-black/5 transition-colors cursor-pointer"
                title="Explicación del flujo de New Business"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#8a4dff]" />
                <span className="hidden sm:inline">¿Cómo funciona?</span>
              </button>

              {showFlowInfo && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-96 bg-[#140b24] text-white p-4.5 rounded-2xl shadow-2xl border border-[#8a4dff]/40 text-xs z-30 animate-in zoom-in-95 duration-150 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10">
                    <span className="font-bold flex items-center gap-1.5 text-[#d4ff4a] text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      ¿Cómo funciona New Business?
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFlowInfo(false)}
                      className="text-white/40 hover:text-white cursor-pointer p-0.5 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[11.5px] text-white/90 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/10 mb-3">
                    El espacio donde los líderes dimensionan técnicamente las oportunidades recibidas de Comercial (briefs), construyen entregables y actividades, generan cotizaciones y habilitan la transición a Proyectos. El SOW se gestiona desde el Cliente, dentro del proyecto correspondiente.
                  </p>
                  <div className="space-y-2.5 text-[11px] text-white/85 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#8a4dff] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                        1
                      </span>
                      <p>
                        <strong className="text-white">Oportunidad & Brief:</strong> Se crea la oportunidad con cliente/prospecto, fecha estimada y objetivo comercial.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#8a4dff] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                        2
                      </span>
                      <p>
                        <strong className="text-[#d4ff4a]">Scoping & Plantillas:</strong> El líder dimensiona entregables, horas por rol y genera cotizaciones (`QuoteProposal`).
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#8a4dff] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                        3
                      </span>
                      <p>
                        <strong className="text-white">SOW & Gates de Entrada:</strong> Validación de condiciones de arranque (contrato formal, anticipo en Alegra, insumos recibidos).
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#8a4dff] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                        4
                      </span>
                      <p>
                        <strong className="text-[#d4ff4a]">Conversión a Proyecto:</strong> Al ganar la propuesta, se habilita en Orbit el proyecto operativo listo para asignación.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {canCreateOpp && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOppModalMode('hubspot');
                    setIsNewOppModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#fff7ed] hover:bg-[#ffedd5] border border-[#fed7aa] text-[#c2410c] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  title="Pegar URL o ID de Deal de HubSpot para autocompletar la oportunidad"
                >
                  <span className="w-2 h-2 rounded-full bg-[#ff5c35]" />
                  <span>Traer desde HubSpot</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOppModalMode('manual');
                    setIsNewOppModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Oportunidad</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Línea Resumen de Contexto (Una sola línea ejecutiva) */}
        <div className="bg-white px-4 py-3 rounded-2xl border border-[#e2e8f0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#475569] font-medium flex-wrap">
            <span className="font-bold text-[#0f172a]">{porDimensionarCount} por dimensionar</span>
            <span className="text-[#cbd5e1]">·</span>
            <span className="font-bold text-[#501f92]">{scopingCount} en scoping</span>
            <span className="text-[#cbd5e1]">·</span>
            <span className="font-bold text-[#0284c7]">{negotiationCount} esperando respuesta</span>
            <span className="text-[#cbd5e1]">·</span>
            <span className="font-bold text-[#10b981]">{wonCount} ganadas</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
            <Clock className="w-3.5 h-3.5 text-[#501f92]" />
            <span>SLA: ~36h para dimensionamiento técnico</span>
          </div>
        </div>

        {/* Search & Filter Bar con Toggle de Vista (Tabla vs Tarjetas) */}
        <div className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Buscar por empresa, propuesta o contacto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a] placeholder:text-[#94a3b8] focus:bg-white focus:ring-2 focus:ring-[#501f92] focus:border-[#501f92]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'all', label: 'Todas' },
                  { id: 'quoting', label: 'En Scoping' },
                  { id: 'won', label: 'Ganadas' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-[#501f92] text-white shadow-2xs'
                      : 'bg-[#f8fafc] text-[#64748b] hover:text-[#0f172a] border border-[#e2e8f0]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Toggle Table vs Cards */}
            <div className="flex items-center bg-[#f1f5f9] p-0.5 rounded-xl border border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-[#501f92] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
                title="Vista tabla compacta"
              >
                Tabla
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-[#501f92] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
                title="Vista tarjetas"
              >
                Tarjetas
              </button>
            </div>
          </div>
        </div>

        {/* Opportunities Listing: Table View or Cards View */}
        {filteredOpps.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-[#cbd5e1] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#501f92]/10 text-[#501f92] flex items-center justify-center mx-auto">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#0f172a]">
              No hay oportunidades registradas con estos criterios
            </h3>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto">
              Comercial puede traer una oportunidad desde HubSpot o crearla manualmente para iniciar el dimensionamiento técnico.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setOppModalMode('hubspot');
                  setIsNewOppModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#fff7ed] hover:bg-[#ffedd5] border border-[#fed7aa] text-[#c2410c] text-xs font-bold transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#ff5c35]" />
                <span>Traer desde HubSpot</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOppModalMode('manual');
                  setIsNewOppModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#d4ff4a]" />
                <span>Crear manualmente</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLA OPERATIVA COMPACTA (Recomendada para Comercial & Líderes) */
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Cuenta / Oportunidad</th>
                    <th className="py-3 px-4">Responsable de alcance</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Tiempo / SLA</th>
                    <th className="py-3 px-4">Próxima Acción</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredOpps.map((opp) => {
                    const isWon = opp.status === 'won';
                    const mainQuote = getOperationalQuote(opp);
                    const totalHours = mainQuote?.totalHoursRollup || 0;

                    let statusBadge = {
                      label: 'Por dimensionar',
                      bg: 'bg-[#501f92]/10 text-[#501f92] border-[#501f92]/20'
                    };
                    let nextAction = 'Iniciar dimensionamiento en Alcance';

                    if (opp.status === 'quoting') {
                      statusBadge = {
                        label: 'En scoping',
                        bg: 'bg-[#3b82f6]/10 text-[#2563eb] border-[#3b82f6]/20'
                      };
                      nextAction = 'Terminar alcance y notificar a Comercial';
                    } else if (opp.status === 'internal_review') {
                      statusBadge = {
                        label: 'Cotización / Pricing',
                        bg: 'bg-[#f59e0b]/10 text-[#b45309] border-[#f59e0b]/20'
                      };
                      nextAction = 'Comercial: Revisar precio y margen';
                    } else if (opp.status === 'proposal_sent' || opp.status === 'negotiation') {
                      statusBadge = {
                        label: 'En negociación',
                        bg: 'bg-[#8b5cf6]/10 text-[#6d28d9] border-[#8b5cf6]/20'
                      };
                      nextAction = 'Esperando respuesta / Ajustes';
                    } else if (isWon) {
                      statusBadge = {
                        label: 'Ganada',
                        bg: 'bg-[#10b981]/15 text-[#059669] border-[#10b981]/30'
                      };
                      nextAction = 'Convertir a proyecto';
                    } else if (opp.status === 'lost') {
                      statusBadge = {
                        label: 'Perdida',
                        bg: 'bg-[#ef4444]/10 text-[#b91c1c] border-[#ef4444]/20'
                      };
                      nextAction = 'Cerrada';
                    }

                    return (
                      <tr
                        key={opp.id}
                        onClick={() => {
                          setSelectedOppId(opp.id);
                          setActiveTab('scoping');
                        }}
                        className="hover:bg-[#f8fafc]/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-[#0f172a] text-xs">
                                {opp.prospectAccountName || 'Nuevo Prospecto'}
                              </span>
                              {opp.hubspotDealId && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#ff5c35]/10 text-[#ff5c35] border border-[#ff5c35]/20">
                                  HubSpot
                                </span>
                              )}
                              {opp.driveFolderUrl && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-[#f1f5f9] text-[#64748b]">
                                  📁 Drive
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#501f92] font-semibold truncate max-w-sm">
                              {opp.title}
                            </p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#501f92]/10 text-[#501f92] font-bold text-[10px] flex items-center justify-center">
                              {users.find((user) => user.id === opp.leadUserId)?.initials || '--'}
                            </div>
                            <span className="font-semibold text-[#334155] text-xs">
                              {users.find((user) => user.id === opp.leadUserId)?.name || 'Sin asignar'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}>
                            {statusBadge.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                            <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
                            <span className="font-medium">
                              {isWon ? 'Completado' : 'vence en ~24h'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-[11px] font-medium text-[#475569] bg-[#f1f5f9] px-2.5 py-1 rounded-lg">
                            {nextAction}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {opp.driveFolderUrl && (
                              <a
                                href={opp.driveFolderUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-[#64748b] hover:text-[#501f92] hover:bg-[#f1f5f9] transition-colors"
                                title="Abrir carpeta Drive"
                              >
                                <Folder className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {opp.hubspotDealUrl && (
                              <a
                                href={opp.hubspotDealUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-[#ff5c35] hover:bg-[#ff5c35]/10 transition-colors"
                                title="Abrir en HubSpot"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOppId(opp.id);
                                setActiveTab('scoping');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#501f92]/10 hover:bg-[#501f92] text-[#501f92] hover:text-white font-bold text-xs transition-colors cursor-pointer"
                            >
                              Abrir →
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TARJETAS COMPACTAS (Alternativa) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOpps.map((opp) => {
              const mainQuote = getOperationalQuote(opp);
              const totalHours = mainQuote?.totalHoursRollup || 0;
              const isWon = opp.status === 'won';

              return (
                <div
                  key={opp.id}
                  onClick={() => {
                    setSelectedOppId(opp.id);
                    setActiveTab('scoping');
                  }}
                  className={`bg-white rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md hover:border-[#501f92] ${
                    isWon
                      ? 'border-[#a7f3d0] hover:border-[#10b981]'
                      : 'border-[#e2e8f0]'
                  }`}
                >
                  <div className="p-5 space-y-3">
                    {/* Header: Company & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[11px] font-bold text-[#501f92] uppercase tracking-wider block truncate">
                          {opp.prospectAccountName || 'Nuevo Prospecto'}
                        </span>
                        <h3 className="text-sm font-extrabold text-[#0f172a] leading-snug line-clamp-2">
                          {opp.title}
                        </h3>
                      </div>

                      {isWon ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Ganada</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#501f92]/10 text-[#501f92] shrink-0">
                          En Scoping
                        </span>
                      )}
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#64748b]">
                      {opp.clientId ? (
                        <span className="px-2 py-0.5 rounded-md bg-[#6366f1]/10 text-[#6366f1] font-medium">
                          Cliente Orbit
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-[#f59e0b]/15 text-[#b45309] font-medium">
                          Prospecto Nuevo
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[#475569] font-bold">
                        {totalHours}h
                      </span>

                      <span className="text-[#94a3b8]">
                        {opp.quotes.length} versión(es)
                      </span>
                    </div>

                    {/* Lead & Contact info */}
                    <div className="pt-2 border-t border-[#f1f5f9] space-y-1 text-xs text-[#64748b]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#501f92]" />
                        <span>Responsable de alcance: <strong className="text-[#0f172a]">{users.find((user) => user.id === opp.leadUserId)?.name || 'Sin asignar'}</strong></span>
                      </div>
                      {opp.contactName && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] truncate">
                          <Building2 className="w-3.5 h-3.5 text-[#94a3b8]" />
                          <span>Contacto: {opp.contactName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer CTA */}
                  <div className="px-5 py-3 bg-[#fafbfc] border-t border-[#f1f5f9] rounded-b-2xl flex items-center justify-between text-xs font-bold text-[#501f92]">
                    <span>{isWon ? 'Ver Proyecto & Alcance' : 'Abrir Alcance'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Creación */}
        <NewOpportunityModal
          isOpen={isNewOppModalOpen}
          initialMode={oppModalMode}
          existingClients={clients}
          templates={templates}
          users={users}
          onClose={() => setIsNewOppModalOpen(false)}
          onSaveOpportunity={handleCreatedOpportunity}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE OPPORTUNITY WORKSPACE (With Breadcrumbs & Convert to Project)
  // =========================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner de Notificación Contextual */}
      {bannerNotification && (
        <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] flex items-center justify-between gap-3 shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
            <span className="text-xs font-bold leading-relaxed">{bannerNotification.message}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {bannerNotification.actionButton && (
              <button
                type="button"
                onClick={bannerNotification.actionButton.onClick}
                className="px-3 py-1.5 rounded-lg bg-[#501f92] hover:bg-[#3d1572] text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                {bannerNotification.actionButton.label}
              </button>
            )}
            {bannerNotification.showProjectLink && onNavigateToView && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onNavigateToView('clientes', activeOpp.clientId || undefined)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#a7f3d0] hover:bg-[#d1fae5] text-[#065f46] text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  Ver Cliente →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToView('proyectos', activeOpp.convertedProjectId || undefined)}
                  className="px-3 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  Ver en Proyectos →
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setBannerNotification(null)}
              className="p-1 rounded-lg hover:bg-[#d1fae5] text-[#065f46] cursor-pointer"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumbs minimalistas */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748b] px-1 py-0.5">
        <button
          type="button"
          onClick={() => setSelectedOppId(null)}
          className="font-medium hover:text-[#0f172a] transition-colors cursor-pointer"
        >
          New Business
        </button>
        <span className="text-[#cbd5e1]">/</span>
        <span className="font-medium text-[#475569]">{activeOpp.prospectAccountName}</span>
        <span className="text-[#cbd5e1]">/</span>
        <span className="font-semibold text-[#0f172a] truncate max-w-xs">{activeOpp.title}</span>
      </nav>

      {/* Active Opp Summary Header Banner */}
      <div className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-extrabold text-[#0f172a]">
              {activeOpp.prospectAccountName}
            </span>
            <span className="text-xs text-[#94a3b8]">·</span>
            <span className="text-base font-semibold text-[#501f92]">
              {activeOpp.title}
            </span>
            {activeOpp.status === 'won' ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Ganada · Proyecto en Orbit</span>
              </span>
            ) : activeOpp.status === 'internal_review' ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#b45309]">
                Cotización / Por Pricing
              </span>
            ) : activeOpp.status === 'proposal_sent' || activeOpp.status === 'negotiation' ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8b5cf6]/15 text-[#6d28d9]">
                En Negociación
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#501f92]/10 text-[#501f92]">
                En Scoping
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-[#64748b] flex-wrap">
            <div className="flex items-center gap-1 relative">
              <User className="w-3.5 h-3.5 text-[#501f92]" />
              <span>
                Responsable de alcance:{' '}
                <strong className="text-[#0f172a]">{currentLeadDisplayName}</strong>
              </span>
              {canEditOpp && users.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsReassigningLead(!isReassigningLead)}
                  className="text-[10px] text-[#501f92] hover:underline font-bold ml-1 cursor-pointer"
                  title="Reasignar responsable de alcance"
                >
                  (Reasignar)
                </button>
              )}

              {/* Popover reasignar líder (1 líder con persistencia real en leadUserId) */}
              {isReassigningLead && (
                <div className="absolute top-6 left-0 z-30 bg-white rounded-xl shadow-xl border border-[#cbd5e1] p-3 w-64 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-[#f1f5f9]">
                    <span className="text-[11px] font-bold text-[#0f172a] block">
                      Reasignar Responsable de alcance:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsReassigningLead(false)}
                      className="text-[#94a3b8] hover:text-[#0f172a] text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[10px] text-[#64748b]">
                    Selecciona las personas responsables del alcance:
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {users.filter(isEligibleScopingLeader).map((u) => {
                      const isSelected = currentLeadUserIds.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            const ids = isSelected ? currentLeadUserIds.filter((id) => id !== u.id) : [...currentLeadUserIds, u.id];
                            if (!ids.length) return;
                            const updated: NewBusinessOpportunity = {
                              ...activeOpp,
                              leadUserId: ids[0],
                              leadUserName: users.find((user) => user.id === ids[0])?.name || 'Sin asignar',
                              leadUserIds: ids,
                              updatedAt: new Date().toISOString()
                            };
                            onUpdateOpportunity(updated);
                          }}
                          className={`w-full text-left flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#501f92]/10 font-bold text-[#501f92]'
                              : 'hover:bg-[#f8fafc] text-[#334155]'
                          }`}
                        >
                          <span className="truncate">
                            {u.name}{' '}
                            <span className="text-[10px] text-[#64748b] font-normal">
                              ({u.officialRole || u.jobTitle || u.role})
                            </span>
                          </span>
                          {isSelected && <span className="text-[#501f92] text-xs font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 relative">
              <Clock className="w-3.5 h-3.5 text-[#501f92]" />
              {commercialTeamUi[activeOpp.id]?.length > 0 && <span className="text-xs">Responsables comerciales: <strong>{users.filter((user) => commercialTeamUi[activeOpp.id].includes(user.id)).map((user) => user.name).join(', ')}</strong></span>}
              <span>SLA Handoff: <strong className="text-[#0f172a]">~{Number((activeOpp.handoffHours || 36).toFixed(1))}h</strong></span>
              {canEditOpp && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomSlaInput(activeOpp.handoffHours || 36);
                    setIsEditingSla(!isEditingSla);
                  }}
                  className="text-[10px] text-[#501f92] hover:underline font-bold ml-1 cursor-pointer"
                  title="Editar deadline de SLA"
                >
                  (Editar)
                </button>
              )}

              {/* Popover editar SLA */}
              {isEditingSla && (
                <div className="absolute top-6 left-0 z-30 bg-white rounded-xl shadow-xl border border-[#cbd5e1] p-3 w-56 space-y-2.5">
                  <span className="text-[11px] font-bold text-[#0f172a] block">Editar SLA de Handoff:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={240}
                      value={customSlaInput}
                      onChange={(e) => setCustomSlaInput(Math.max(1, Number(e.target.value)))}
                      className="w-20 p-1.5 text-xs font-bold rounded-lg border border-[#cbd5e1] text-center"
                    />
                    <span className="text-xs text-[#64748b]">horas</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#f1f5f9]">
                    <button
                      type="button"
                      onClick={() => setIsEditingSla(false)}
                      className="px-2 py-1 text-[10px] text-[#64748b] hover:bg-[#f1f5f9] rounded font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const safeHours = Math.max(1, customSlaInput);
                        const deadlineIso = new Date(Date.now() + safeHours * 3600 * 1000).toISOString();
                        const updated: NewBusinessOpportunity = {
                          ...activeOpp,
                          handoffHours: safeHours,
                          handoffDeadline: deadlineIso,
                          updatedAt: new Date().toISOString()
                        };
                        onUpdateOpportunity(updated);
                        setIsEditingSla(false);
                      }}
                      className="px-3 py-1 bg-[#501f92] text-white text-[10px] font-bold rounded hover:bg-[#3d1572]"
                    >
                      Guardar SLA
                    </button>
                  </div>
                </div>
              )}
            </div>

            {activeOpp.contactName && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#94a3b8]" />
                <span>{activeOpp.contactName} {activeOpp.contactEmail ? `(${activeOpp.contactEmail})` : ''}</span>
              </span>
            )}
            {activeOpp.hubspotDealId && (
              <span className="text-[11px] font-mono text-[#ff5c35] font-semibold">
                HubSpot: {activeOpp.hubspotDealId}
              </span>
            )}
          </div>
        </div>

        {/* Acciones rápidas: HubSpot, Drive, Convertir */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeOpp.hubspotDealUrl && (
            <a
              href={activeOpp.hubspotDealUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] text-xs font-bold hover:bg-[#ffedd5] transition-colors"
            >
              <span>HubSpot</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* Timer Preventa sutil en la barra superior (Líder, Catalina, Luisa) */}
          {scopingTask && onStartTimer && (
            <button
              type="button"
              onClick={() => {
                if (isScopingTimerRunning && onStopTimer) {
                  onStopTimer();
                } else {
                  onStartTimer(scopingTask);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                isScopingTimerRunning
                  ? 'bg-[#ef4444] text-white border-[#dc2626] animate-pulse'
                  : 'bg-white hover:bg-[#f8fafc] text-[#0f172a] border-[#e2e8f0]'
              }`}
              title="Registrar tiempo de preventa invertido por Líder, Catalina o Luisa"
            >
              <Play className={`w-3 h-3 ${isScopingTimerRunning ? 'fill-current' : 'text-[#501f92]'}`} />
              <span>
                {isScopingTimerRunning ? 'Detener Timer' : 'Timer Preventa'}
              </span>
              <span className={`text-[10.5px] font-mono px-1.5 py-0.2 rounded font-bold ${
                isScopingTimerRunning ? 'bg-white/20 text-white' : 'bg-[#501f92]/10 text-[#501f92]'
              }`}>
                {preventaHoursLogged > 0 ? `${preventaHoursLogged.toFixed(1)}h` : '0h'}
              </span>
            </button>
          )}

          {activeOpp.convertedProjectId ? (
            <div className="flex items-center gap-2">
              {onNavigateToView && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigateToView('clientes', activeOpp.clientId || undefined)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#f8fafc] text-xs font-bold text-[#501f92] border border-[#e2e8f0] transition-colors cursor-pointer shadow-2xs"
                    title="Ver ficha del Cliente en el Directorio"
                  >
                    <Building2 className="w-4 h-4 text-[#501f92]" />
                    <span>Ver Cliente</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateToView('proyectos', activeOpp.convertedProjectId)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-bold text-[#0f172a] transition-colors cursor-pointer"
                    title="Ver proyecto operativo en el módulo de Proyectos"
                  >
                    <FolderPlus className="w-4 h-4 text-[#10b981]" />
                    <span>Ver en Proyectos →</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {!isWon ? (
                <>
                  <button
                    type="button"
                    disabled={!isQuoteDiligenciada}
                    onClick={() => handleMarkOpportunityWon(activeOpp)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      isQuoteDiligenciada
                        ? 'bg-[#10b981] hover:bg-[#059669] active:bg-[#047857] text-white cursor-pointer active:scale-95'
                        : 'bg-[#f1f5f9] text-[#94a3b8] border border-[#e2e8f0] cursor-not-allowed'
                    }`}
                    title={
                      isQuoteDiligenciada
                        ? 'Marcar propuesta aprobada formalmente por el cliente'
                        : quotePendingMessage
                    }
                  >
                    <Trophy className={`w-3.5 h-3.5 ${isQuoteDiligenciada ? 'text-[#d4ff4a]' : 'text-[#cbd5e1]'}`} />
                    <span>Marcar como ganada 🏆</span>
                  </button>
                  {!isQuoteDiligenciada && <span role="status" className="text-[11px] text-[#b45309] max-w-xs">{quotePendingMessage}</span>}

                  <button
                    type="button"
                    onClick={() => setIsLostModalOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Registrar que el cliente no aprobó la propuesta"
                  >
                    <span>No ganada</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs bg-[#501f92] hover:bg-[#3d1572] text-white cursor-pointer shadow-md animate-pulse hover:scale-[1.02]"
                  title="Convertir esta propuesta ganada a Cliente y Proyecto en Operación"
                >
                  <FolderPlus className="w-4 h-4 text-[#d4ff4a]" />
                  <span>Convertir a Cliente & Proyecto →</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs: Resumen | Alcance y propuesta | Documentos | Historial */}
      <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('resumen')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'resumen'
              ? 'bg-white text-[#501f92] shadow-xs'
              : 'text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Resumen</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scoping')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'scoping'
              ? 'bg-white text-[#501f92] shadow-xs'
              : 'text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Alcance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cotizacion')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'cotizacion'
              ? 'bg-white text-[#501f92] shadow-xs'
              : 'text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Cotización</span>
        </button>


      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RESUMEN / BRIEF */}
      {/* ========================================================================= */}
      {activeTab === 'resumen' && activeQuote && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Fila 1: Resumen Ejecutivo 360° de la Oportunidad */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Columna Izquierda: Información del Prospecto & Brief Discovery (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Card 1: Ficha del Prospecto & Contacto */}
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#501f92]/10 text-[#501f92]">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#0f172a]">
                        Información del Prospecto
                      </h3>
                      <p className="text-[11px] text-[#64748b]">Datos comerciales de entrada y contacto</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f1f5f9] text-[#475569]">
                    ID: {activeOpp.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                    <span className="text-[10px] uppercase font-bold text-[#64748b] block">Nombre del Prospecto</span>
                    <strong className="text-sm font-extrabold text-[#0f172a] block truncate mt-0.5">
                      {activeOpp.prospectAccountName}
                    </strong>
                    <span className="text-[10px] text-[#64748b] block mt-0.5">
                      {activeOpp.projectType === 'fee_monthly' ? 'Fee Mensual Recurrente' : 'Proyecto Único'}
                    </span>
                  </div>

                  <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                    <span className="text-[10px] uppercase font-bold text-[#64748b] block">Contacto Principal</span>
                    <span className="font-bold text-xs text-[#0f172a] block truncate mt-0.5">
                      {activeOpp.contactName || 'No especificado'}
                    </span>
                    <span className="text-[11px] text-[#64748b] block truncate">
                      {activeOpp.contactEmail || activeOpp.contactPhone || 'Sin datos de contacto'}
                    </span>
                  </div>
                </div>

                {/* Identificadores & Enlaces Externos */}
                <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
                  {activeOpp.hubspotDealUrl ? (
                    <a
                      href={activeOpp.hubspotDealUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fff7ed] border border-[#fed7aa] text-xs font-bold text-[#c2410c] hover:bg-[#ffedd5] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Deal HubSpot: {activeOpp.hubspotDealId || 'Ver en CRM'}</span>
                    </a>
                  ) : activeOpp.hubspotDealId ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-mono text-[#c2410c] font-bold">
                      HubSpot ID: {activeOpp.hubspotDealId}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[11px] text-[#94a3b8]">
                      HubSpot ID: Pendiente de sincronización
                    </span>
                  )}

                  {activeOpp.driveFolderUrl && (
                    <a
                      href={activeOpp.driveFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#501f92]/10 border border-[#501f92]/20 text-xs font-bold text-[#501f92] hover:bg-[#501f92]/20 transition-colors"
                    >
                      <Folder className="w-3.5 h-3.5" />
                      <span>Carpeta Drive</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Card 2: Resumen de Requerimientos / Discovery (Brief con guardado seguro sin congelado) */}
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#10b981]/10 text-[#10b981]">
                      <FileText className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-[#0f172a]">
                      Resumen de Requerimientos / Discovery
                    </h3>
                  </div>
                  {!isEditingBrief && (
                    <button
                      type="button"
                      onClick={() => setIsEditingBrief(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#501f92] hover:underline cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Editar Brief</span>
                    </button>
                  )}
                </div>

                {!isEditingBrief ? (
                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">
                    {activeOpp.briefSummary || activeOpp.discoveryNotes || 'Sin brief registrado.'}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <textarea
                      rows={4}
                      value={briefDraft}
                      onChange={(e) => setBriefDraft(e.target.value)}
                      placeholder="Escribe o actualiza los requerimientos comerciales y notas de discovery del cliente..."
                      className="w-full p-3 rounded-xl border border-[#cbd5e1] text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#501f92] bg-white transition-all"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#64748b]">
                        El texto permanecerá editable hasta hacer clic en Guardar Brief.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateOpportunity({
                            ...activeOpp,
                            briefSummary: briefDraft,
                            discoveryNotes: briefDraft,
                            updatedAt: new Date().toISOString()
                          });
                          setIsEditingBrief(false);
                          setConversionSuccessMessage('Brief de Discovery guardado correctamente.');
                          setTimeout(() => setConversionSuccessMessage(null), 3000);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-[#501f92] hover:bg-[#3d1572] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        Guardar Brief
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha: Dimensionamiento, Pricing Acordado & Herramientas (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Card 3: Resumen Económico & Solución (Lo que llenaron Líder y Comercial) */}
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#501f92]/10 text-[#501f92]">
                      <DollarSign className="w-4 h-4 text-[#501f92]" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#0f172a]">
                        Acuerdo Comercial & Pricing
                      </h3>
                      <p className="text-[11px] text-[#64748b]">Diligenciado por Comercial</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('cotizacion')}
                    className="text-[11px] font-bold text-[#501f92] hover:underline cursor-pointer"
                  >
                    Ir a Cotización →
                  </button>
                </div>

                {/* Precio Acordado */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#faf5ff] to-[#f5f3ff] border border-[#e9d5ff] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                    Precio / Valor Cotizado Acordado
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#0f172a]">
                      {activeQuote.totalQuotedValue || activeQuote.totalQuotedValueCOP
                        ? formatCurrency(activeQuote.totalQuotedValue ?? activeQuote.totalQuotedValueCOP ?? 0, activeQuote.currency || 'COP')
                        : 'Pendiente cotizar'}
                    </span>
                    <span className="text-xs font-bold text-[#501f92]">{activeQuote.currency || 'COP'}</span>
                  </div>

                  {Boolean(activeQuote.totalQuotedValue || activeQuote.totalQuotedValueCOP) && (
                    <div className="pt-2 border-t border-[#e9d5ff]/80 text-[11px] text-[#64748b] space-y-1">
                      <div className="flex justify-between">
                        <span>Anticipo 50%:</span>
                        <strong className="text-[#501f92]">
                          {formatCurrency(Math.round(((activeQuote.totalQuotedValue ?? activeQuote.totalQuotedValueCOP ?? 0)) / 2), activeQuote.currency || 'COP')}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Total con IVA 19%:</span>
                        <span className="text-[#0f172a] font-medium">
                          {formatCurrency(Math.round(((activeQuote.totalQuotedValue ?? activeQuote.totalQuotedValueCOP ?? 0)) * 1.19), activeQuote.currency || 'COP')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alcance Técnico & Esfuerzo */}
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#64748b]">
                      Horas de Alcance & Entrega
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('scoping')}
                      className="text-[10.5px] font-bold text-[#501f92] hover:underline"
                    >
                      Ver Entregables →
                    </button>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold font-mono text-[#501f92]">
                      {activeQuote.totalHoursRollup}h
                    </span>
                    <span className="text-[11px] text-[#64748b]">
                      en {activeQuote.deliverables.length} entregable(s) · {activeQuote.estimatedWeeks ?? activeQuote.financialConfig?.projectDurationWeeks ?? 0} sem
                    </span>
                  </div>
                </div>

                {/* Enlaces a Herramientas Oficiales (Calculadora + Presentación PPT) */}
                <div className="space-y-2 pt-1 text-xs">
                  <span className="text-[10.5px] font-bold text-[#475569] uppercase tracking-wider block">
                    Fuentes de Verdad & Enlaces:
                  </span>

                  {/* 1. Calculadora / Sheet */}
                  <div className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">📊</span>
                      <div className="min-w-0">
                        <span className="font-bold text-[#0f172a] block truncate text-xs">Calculadora Finanzas (Google Sheets)</span>
                        <span className="text-[10px] text-[#64748b] block truncate">
                          {activeQuote.externalFinanceSheetUrl ? 'Planilla oficial vinculada' : 'Sin registrar aún'}
                        </span>
                      </div>
                    </div>
                    {activeQuote.externalFinanceSheetUrl ? (
                      <a
                        href={activeQuote.externalFinanceSheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#501f92]/10 hover:bg-[#501f92]/20 text-[11px] font-bold text-[#501f92] transition-colors shrink-0"
                      >
                        <span>Abrir</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveTab('cotizacion')}
                        className="text-[10.5px] font-semibold text-[#501f92] hover:underline shrink-0"
                      >
                        + Vincular
                      </button>
                    )}
                  </div>

                  {/* 2. Presentación PPT */}
                  <div className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">📑</span>
                      <div className="min-w-0">
                        <span className="font-bold text-[#0f172a] block truncate text-xs">Presentación / Propuesta PPT</span>
                        <span className="text-[10px] text-[#64748b] block truncate">
                          {activeQuote.commercialProposalUrl ? 'Presentación de Drive vinculada' : 'Sin registrar por líder'}
                        </span>
                      </div>
                    </div>
                    {activeQuote.commercialProposalUrl ? (
                      <a
                        href={activeQuote.commercialProposalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#501f92]/10 hover:bg-[#501f92]/20 text-[11px] font-bold text-[#501f92] transition-colors shrink-0"
                      >
                        <span>Abrir</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveTab('scoping')}
                        className="text-[10.5px] font-semibold text-[#501f92] hover:underline shrink-0"
                      >
                        + Vincular
                      </button>
                    )}
                  </div>
                </div>

                {/* Equipo Responsable & Horas Preventa Invertidas */}
                <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748b]">Responsable de alcance:</span>
                    <strong className="text-[#501f92] font-bold">{currentLeadDisplayName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748b]">Owner Comercial:</span>
                    <strong className="text-[#0f172a] font-bold">{getCommercialOwnerName(activeOpp, users)}</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#e2e8f0]">
                    <span className="text-[#64748b]">Horas Preventa Invertidas:</span>
                    <span className="font-mono font-bold text-[#501f92]">
                      {preventaHoursLogged > 0 ? `${preventaHoursLogged.toFixed(1)}h` : '0h'}{' '}
                      <span className="text-[10px] font-normal text-[#64748b]">(no cobrables)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALCANCE TÉCNICO (Diligenciado por el Líder Asignado) */}
      {/* ========================================================================= */}
      {activeTab === 'scoping' && activeQuote && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Panel Superior del Líder Asignado: Limpio, minimalista y sin ruido visual */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-[#e2e8f0] pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Layers className="w-4 h-4 text-[#501f92]" /><h3 className="text-base font-bold text-[#0f172a]">Alcance técnico</h3>
                <span className="rounded-full bg-[#f5f3ff] px-2 py-1 text-[11px] font-semibold text-[#501f92]">{scopeState.saved && isScopeReadyForReview(activeQuote, scopeState.services) && ['internal_review', 'proposal_sent', 'negotiation', 'won'].includes(activeOpp.status) ? 'Listo para cotizar' : 'En elaboración'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isScopeReadOnly) {
                      onChangeScopeUi(activeQuote.id, { ...scopeState, saved: false });
                      return;
                    }
                    const invalidServices = scopeState.services.filter((service) => serviceValidationMessages(service).length > 0);
                    if (invalidServices.length) {
                      setConversionSuccessMessage(invalidServices.map((service) => `${service.name}: ${serviceValidationMessages(service).join(' ')}`).join(' '));
                      return;
                    }
                    handleUpdateQuote({ ...activeQuote, estimatedWeeks: getScopeWeeks(activeQuote, scopeState.services) });
                    onChangeScopeUi(activeQuote.id, { ...scopeState, saved: true, services: scopeState.services });
                    setConversionSuccessMessage('Alcance técnico guardado.');
                    setTimeout(() => setConversionSuccessMessage(null), 3000);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#475569] transition-colors cursor-pointer"
                >
                  {isScopeReadOnly ? <span className="inline-flex items-center gap-1"><Pencil className="w-3 h-3" />Editar alcance</span> : 'Guardar datos generales'}
                </button>

                {(() => {
                  const isPptFilled = Boolean(activeQuote.commercialProposalUrl && activeQuote.commercialProposalUrl.trim().length > 5);
                  const projectWeeks = Number(activeQuote.estimatedWeeks ?? activeQuote.financialConfig?.projectDurationWeeks);
                  const isWeeksFilled = Number.isFinite(projectWeeks) && projectWeeks >= 1;
                  const isScopeFilled = activeQuote.totalHoursRollup > 0 && activeQuote.deliverables.some((deliverable) => deliverable.backlogItems.some((activity) => activity.estimatedHours > 0));
                  const isReadyToMark = scopeState.saved && isScopeReadyForReview(activeQuote, scopeState.services);
                  const isAlreadyMarked = isReadyToMark && (activeOpp.status === 'internal_review' || activeOpp.status === 'proposal_sent' || activeOpp.status === 'negotiation' || activeOpp.status === 'won');

                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isReadyToMark || !window.confirm('¿Confirmas que no faltan servicios y que la PPT incluye la propuesta completa?')) return;
                        const updatedOpp: NewBusinessOpportunity = {
                          ...activeOpp,
                          status: 'internal_review',
                          updatedAt: new Date().toISOString()
                        };
                        onUpdateOpportunity(updatedOpp);
                        setConversionSuccessMessage(
                          `✓ Alcance técnico listo (${activeQuote.totalHoursRollup}h). Notificación enviada a Comercial.`,
                          {
                            showProjectLink: false,
                            timeoutMs: 7000
                          }
                        );
                      }}
                      disabled={!isReadyToMark && !isAlreadyMarked}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                        isAlreadyMarked
                          ? 'bg-[#059669] text-white ring-2 ring-[#a7f3d0] cursor-pointer'
                          : isReadyToMark
                            ? 'bg-[#501f92] hover:bg-[#3d1572] active:bg-[#2e0e57] text-white cursor-pointer active:scale-95'
                            : 'bg-[#f1f5f9] text-[#94a3b8] border border-[#e2e8f0] cursor-not-allowed'
                      }`}
                      title={
                        isAlreadyMarked
                          ? 'El alcance técnico ya fue marcado como listo para Comercial'
                          : isReadyToMark
                            ? 'Marcar que el dimensionamiento técnico está listo para Comercial'
                            : 'Diligencia Propuesta (Drive), Semanas y Alcance para habilitar'
                      }
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isAlreadyMarked ? 'text-[#d4ff4a]' : 'text-white'}`} />
                      <span>
                        {isAlreadyMarked
                          ? 'Listo para cotizar'
                          : 'Marcar como listo'}
                      </span>
                    </button>
                  );
                })()}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div><p className="text-[#64748b]">Esfuerzo estimado</p><strong className="text-lg text-[#0f172a]">{activeQuote.totalHoursRollup.toLocaleString('es-CO')} h</strong></div>
              <div><p className="text-[#64748b]">Semanas totales</p><strong className="text-lg text-[#0f172a]">{getScopeWeeks(activeQuote, scopeState.services) || 'Pendiente'} semanas</strong></div>

            </div>
            {isScopeReadOnly ? (
              <div className="space-y-2 text-xs text-[#334155]" aria-label="Datos generales del alcance guardado">
                <p>Presentación / propuesta técnica general: {activeQuote.commercialProposalUrl ? <a className="underline text-[#501f92]" href={activeQuote.commercialProposalUrl} target="_blank" rel="noreferrer">Abrir presentación</a> : 'Pendiente'}</p>


              </div>
            ) : (<>
            {/* Insumos del Líder: 1. Propuesta/Presentación (PPT de Drive) + 2. Duración en Semanas */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs">
              {/* 1. Propuesta / Presentación (Google Drive / Slides) */}
              <div className="md:col-span-12 space-y-1">
                <label className="font-semibold text-[#475569] flex items-center justify-between">
                  <span>Presentación / Propuesta (Drive)</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    value={activeQuote.commercialProposalUrl || ''}
                    onChange={(e) => {
                      handleUpdateQuote({
                        ...activeQuote,
                        commercialProposalUrl: e.target.value
                      });
                    }}
                    placeholder="https://docs.google.com/presentation/d/... o enlace a Drive"
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-[#cbd5e1] text-xs font-mono text-[#0f172a] placeholder:text-[#94a3b8] placeholder:font-sans focus:ring-1 focus:ring-[#501f92] focus:border-[#501f92] transition-colors"
                  />
                  {activeQuote.commercialProposalUrl && (
                    <a
                      href={activeQuote.commercialProposalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute right-2 p-1.5 text-[#501f92] hover:bg-[#501f92]/10 rounded-lg transition-colors cursor-pointer"
                      title="Abrir presentación en Google Drive"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

            </div>

            </>)}

            {/* Hint sutil solo si falta algo */}
            {(() => {
              const isPptFilled = Boolean(activeQuote.commercialProposalUrl && activeQuote.commercialProposalUrl.trim().length > 5);
              const projectWeeks = Number(activeQuote.estimatedWeeks ?? activeQuote.financialConfig?.projectDurationWeeks);
                  const isWeeksFilled = Number.isFinite(projectWeeks) && projectWeeks >= 1;
              const isScopeFilled = activeQuote.totalHoursRollup > 0 && activeQuote.deliverables.some((deliverable) => deliverable.backlogItems.some((activity) => activity.estimatedHours > 0));
              const isReadyToMark = scopeState.saved && isScopeReadyForReview(activeQuote, scopeState.services);

              if (isReadyToMark) return null;

              return (
                <div className="text-[11px] text-[#b45309] bg-[#fffbeb] px-3 py-2 rounded-lg border border-[#fef3c7] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                  <span>
                    Pendiente para marcar listo:{' '}
                    {!scopeState.saved && <span className="font-semibold mr-1">• Guardar datos generales</span>}
                    {!isPptFilled && <span className="font-semibold mr-1">• Link Drive</span>}
                    {!isWeeksFilled && <span className="font-semibold mr-1">• Semanas</span>}
                    {!isScopeFilled && <span className="font-semibold mr-1">• Horas en alcance</span>}
                    {!allServicesPrepared && <span className="font-semibold">• Servicios pendientes de duración o edición</span>}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Scoper Operativo de Backlog (Frentes, Entregables y Actividades) */}
          <BacklogScoper
            quote={activeQuote}
            readOnly={isScopeReadOnly}
            onRequestEdit={() => onChangeScopeUi(activeQuote.id, { ...scopeState, saved: false })}
            services={scopeState.services}
            onChangeServices={(services) => {
              onChangeScopeUi(activeQuote.id, { saved: false, services });
              const previousSuggested = getScopeWeeks(activeQuote, scopeState.services);
              const suggested = getScopeWeeks(activeQuote, services);
              if (suggested !== previousSuggested) handleUpdateQuote({ ...activeQuote, estimatedWeeks: suggested });
            }}
            opportunityTitle={activeOpp.title}
            prospectName={activeOpp.prospectAccountName}
            templates={templates}
            users={users}
            onUpdateQuote={(updated) => {
              const changedServices = scopeState.services.map((service) => {
                const before = activeQuote.deliverables.filter((item) => service.deliverableIds.includes(item.id));
                const after = updated.deliverables.filter((item) => service.deliverableIds.includes(item.id));
                return JSON.stringify(before) === JSON.stringify(after) ? service : { ...service, saved: false };
              });
              if (changedServices.some((service, index) => service !== scopeState.services[index])) onChangeScopeUi(activeQuote.id, { saved: false, services: changedServices });
              handleUpdateQuote(updated);
            }}
            onGoToCalculator={() => setActiveTab('cotizacion')}
            onMarkScopeReady={(totalHours) => {
              if (!scopeState.saved || !isScopeReadyForReview(activeQuote, scopeState.services) || !window.confirm('¿Confirmas que no faltan servicios y que la PPT incluye la propuesta completa?')) return;
              const updatedOpp: NewBusinessOpportunity = {
                ...activeOpp,
                status: 'internal_review',
                updatedAt: new Date().toISOString()
              };
              onUpdateOpportunity(updatedOpp);
              setConversionSuccessMessage(
                `Alcance técnico completado (${totalHours}h) · Listo para continuar con el proceso comercial.`,
                {
                  showProjectLink: false,
                  timeoutMs: 8000
                }
              );
            }}
            opportunityStatus={activeOpp.status}
            commercialOwner={activeOpp.commercialOwner}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COTIZACIÓN COMERCIAL & PRICING (Diligenciado por Comercial) */}
      {/* ========================================================================= */}
      {activeTab === 'cotizacion' && activeQuote && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#cbd5e1] p-6 shadow-sm space-y-5">
            {/* Cabecera integrada con contexto y tags */}
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-[#f1f5f9]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-[#501f92]/10 text-[#501f92]">
                    <DollarSign className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-[#0f172a]">
                      Cotización Comercial & Pricing Oficial
                    </h3>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Finanzas / Google Sheet Oficial es la fuente de verdad del pricing para SOW y conversión.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#501f92]/10 text-[#501f92]">
                  Alcance de la oportunidad
                </span>
                {activeOpp.hubspotDealStage && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]">
                    HubSpot: {activeOpp.hubspotDealStage}
                  </span>
                )}
              </div>
            </div>

            {/* Cinta compacta de Insumos Técnicos del Líder */}
            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#64748b]">Responsable de alcance:</span>
                  <strong className="text-[#0f172a] font-bold">{currentLeadDisplayName}</strong>
                </div>
                <span className="text-[#cbd5e1] hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#64748b]">Esfuerzo:</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#501f92]/10 text-[#501f92] font-black">
                    {activeQuote.totalHoursRollup}h
                  </span>
                  <span className="text-[10px] text-[#64748b]">
                    ({activeQuote.deliverables.reduce((acc, d) => acc + d.backlogItems.length, 0)} actividades)
                  </span>
                </div>
                <span className="text-[#cbd5e1] hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#64748b]">Duración:</span>
                  <strong className="text-[#0f172a] font-bold">
                    {activeQuote.estimatedWeeks ?? activeQuote.financialConfig?.projectDurationWeeks ?? 0} sem
                  </strong>
                  <span className="text-[10px] text-[#64748b]">
                    (~{((activeQuote.estimatedWeeks ?? activeQuote.financialConfig?.projectDurationWeeks ?? 0) * 5)} días hábiles)
                  </span>
                </div>
                <span className="text-[#cbd5e1] hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#64748b]">Modelo:</span>
                  <span className="font-semibold text-[#0f172a]">
                    {activeOpp.projectType === 'fee_monthly' ? 'Fee Mensual' : 'Proyecto Único'}
                  </span>
                </div>
                <span className="text-[#cbd5e1] hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#64748b]">Owner Comercial:</span>
                  <strong className="text-[#501f92] font-bold">{getCommercialOwnerName(activeOpp, users)}</strong>
                </div>
              </div>
            </div>

            {/* Grid Principal: Valor Acordado + Fuentes de Verdad */}
            {!isEditingQuoteFields && (activeQuote.totalQuotedValue || activeQuote.externalFinanceSheetUrl) ? (
              /* Modo Lectura / Congelado (Guardado con éxito) */
              <div className="p-4 rounded-2xl bg-[#faf5ff] border border-[#e9d5ff] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#e9d5ff]/70 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#501f92]/10 text-[#501f92]">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-[#0f172a]">Cotización Registrada & Consolidada</h4>
                      <p className="text-[11px] text-[#64748b]">Valores económicos validados por Comercial</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingQuoteFields(true);
                      setIsQuoteSavedFeedback(false);
                      setConversionSuccessMessage(null);
                      onSetQuoteSaved(activeQuote.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#cbd5e1] hover:border-[#501f92] text-xs font-bold text-[#501f92] transition-colors cursor-pointer shadow-2xs"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Editar Cotización</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bloque Izquierdo: Monto y Desglose */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#e9d5ff] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#64748b] block">Monto Total Acordado</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#0f172a]">
                        {formatCurrency(activeQuote.totalQuotedValue ?? activeQuote.totalQuotedValueCOP ?? 0, activeQuote.currency || 'COP')}
                      </span>
                      <span className="text-xs font-bold text-[#501f92]">{activeQuote.currency || 'COP'}</span>
                    </div>

                    {/* Desglose 50/50 e IVA */}
                    {(() => {
                      const val = activeQuote.totalQuotedValue ?? activeQuote.totalQuotedValueCOP ?? 0;
                      const curr = activeQuote.currency || 'COP';
                      const half = Math.round(val / 2);
                      const totalWithIva = Math.round(val * 1.19);
                      return (
                        <div className="pt-2 border-t border-[#f1f5f9] space-y-1 text-[11px] text-[#64748b]">
                          <div className="flex justify-between">
                            <span>Esquema estándar (50% / 50%):</span>
                            <strong className="text-[#501f92]">{formatCurrency(half, curr)} c/u</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Total estimado con IVA (19%):</span>
                            <span className="text-[#0f172a] font-medium">{formatCurrency(totalWithIva, curr)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Bloque Derecho: Sheet Oficial */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#e9d5ff] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#64748b] block">Sheet Oficial de Finanzas</span>
                    {activeQuote.externalFinanceSheetUrl ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-medium text-[#0f172a] truncate max-w-[280px]">
                            {activeQuote.externalFinanceSheetUrl}
                          </span>
                        </div>
                        <a
                          href={activeQuote.externalFinanceSheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#501f92]/10 hover:bg-[#501f92]/20 text-xs font-bold text-[#501f92] transition-colors"
                        >
                          <span>Abrir Planilla en Google Sheets</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-[#94a3b8] italic">Sin enlace de Google Sheets registrado</span>
                    )}

                    {activeQuote.commercialNotes && (
                      <div className="pt-2 border-t border-[#f1f5f9] text-[11px] text-[#475569]">
                        <strong>Condiciones:</strong> {activeQuote.commercialNotes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Modo Edición / Formulario */
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1 text-xs">
                  {/* Columna Izquierda: Pricing Acordado (5 cols) */}
                  <div className="lg:col-span-5 p-4 rounded-xl bg-gradient-to-br from-[#faf5ff] to-[#f5f3ff] border border-[#e9d5ff] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-[#501f92] text-xs">
                        Valor Cotizado Acordado: <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#501f92] border border-[#d8b4fe]">
                        Monto Oficial
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={quoteValueDraft}
                          onChange={(e) => setQuoteValueDraft(e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2.5 rounded-xl border border-[#cbd5e1] font-black text-base text-[#0f172a] placeholder:text-[#7C8AA0] placeholder:font-normal focus:ring-2 focus:ring-[#501f92] bg-white shadow-xs"
                        />
                      </div>
                      <select
                        value={quoteCurrencyDraft}
                        onChange={(e) => setQuoteCurrencyDraft(e.target.value as 'COP' | 'USD')}
                        className="p-2.5 rounded-xl border border-[#cbd5e1] font-bold text-xs bg-white text-[#501f92] focus:ring-2 focus:ring-[#501f92] cursor-pointer shadow-xs"
                      >
                        <option value="COP">COP ($)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>

                    {/* Desglose visual automático */}
                    {(() => {
                      const val = Math.max(0, Number(quoteValueDraft) || 0);
                      const curr = quoteCurrencyDraft || 'COP';
                      const half = Math.round(val / 2);
                      const iva = Math.round(val * 0.19);
                      const total = Math.round(val * 1.19);
                      return (
                        <div className="space-y-1.5 pt-2 border-t border-[#e9d5ff]/80 text-[11px]">
                          <div className="flex items-center justify-between text-[#64748b]">
                            <span>Subtotal antes de IVA:</span>
                            <strong className="text-[#0f172a] font-bold">{formatCurrency(val, curr)}</strong>
                          </div>
                          <div className="flex items-center justify-between text-[#64748b]">
                            <span>Esquema estándar (50% / 50%):</span>
                            <span className="font-semibold text-[#501f92]">{formatCurrency(half, curr)} c/u</span>
                          </div>
                          <div className="flex items-center justify-between text-[#64748b]">
                            <span>Total con IVA 19%:</span>
                            <span className="text-[#0f172a] font-medium">{formatCurrency(total, curr)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Columna Derecha: Sheet Oficial (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[#475569] text-xs">
                          Sheet oficial de Finanzas: <span className="text-red-500">*</span>
                        </label>
                        {quoteSheetUrlDraft.trim().length > 5 && (
                          <a
                            href={quoteSheetUrlDraft}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#501f92] hover:underline"
                          >
                            <span>Abrir Sheet</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <input
                        type="url"
                        value={quoteSheetUrlDraft}
                        onChange={(e) => setQuoteSheetUrlDraft(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs font-mono text-[#0f172a] placeholder:text-[#7C8AA0] placeholder:font-sans placeholder:font-normal focus:ring-2 focus:ring-[#501f92] bg-white"
                      />
                      <p className="text-[10px] text-[#64748b]">
                        Planilla de Google Sheets donde Finanzas calcula el pricing con semanas y horas.
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-[#475569] block">
                        Notas / Condiciones comerciales (Términos de pago, vigencia, supuestos):
                      </label>
                      <textarea
                        rows={2}
                        value={quoteNotesDraft}
                        onChange={(e) => setQuoteNotesDraft(e.target.value)}
                        placeholder="Ej: 50% anticipo al kick-off y 50% contra entrega final; vigencia de oferta 15 días calendario."
                        className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs text-[#0f172a] placeholder:text-[#7C8AA0] placeholder:font-normal focus:ring-2 focus:ring-[#501f92]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer con CTA Guardar cambios a la derecha como primer botón */}
            <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs text-[#64748b]">
                {isQuoteSavedFeedback && (
                  <span className="text-[#059669] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    <span>Cotización guardada exitosamente. Botón 'Marcar como ganada 🏆' habilitado arriba.</span>
                  </span>
                )}
                {!isQuoteSavedFeedback && !isQuoteDiligenciada && (
                  <span className="text-[11px] text-[#b45309]">
                    {quotePendingMessage}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap ml-auto">
                {/* Solo se guarda mientras los campos están en edición. */}
                {isEditingQuoteFields && <button
                  type="button"
                  onClick={() => {
                    const numVal = Math.max(0, Number(quoteValueDraft) || 0);
                    if (!Number.isFinite(numVal) || numVal <= 0 || !isValidFinanceSheetUrl(quoteSheetUrlDraft)) {
                      setIsQuoteSavedFeedback(false);
                      setConversionSuccessMessage(quoteMissingRequirements(numVal, quoteSheetUrlDraft).join(' '));
                      return;
                    }
                    const updatedQuote: QuoteProposal = {
                      ...activeQuote,
                      totalQuotedValue: numVal,
                      totalQuotedValueCOP: quoteCurrencyDraft === 'USD' ? 0 : numVal,
                      currency: quoteCurrencyDraft,
                      externalFinanceSheetUrl: quoteSheetUrlDraft.trim(),
                      commercialNotes: quoteNotesDraft.trim()
                    };
                    handleUpdateQuote(updatedQuote);
                    onSetQuoteSaved(activeQuote.id, quoteSignature(numVal, quoteSheetUrlDraft));
                    setIsQuoteSavedFeedback(true);
                    setIsEditingQuoteFields(false);
                    setConversionSuccessMessage('✅ Cotización comercial guardada correctamente. Ahora puedes marcar como ganada arriba.');
                    setTimeout(() => {
                      setIsQuoteSavedFeedback(false);
                      setConversionSuccessMessage(null);
                    }, 4000);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    isQuoteSavedFeedback
                      ? 'bg-[#059669] text-white ring-2 ring-[#a7f3d0]'
                      : 'bg-[#501f92] hover:bg-[#3d1572] active:bg-[#2e0e57] text-white'
                  }`}
                  title="Guardar los valores económicos y condiciones de esta cotización"
                >
                  {isQuoteSavedFeedback ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#d4ff4a]" />
                      <span>¡Cotización guardada!</span>
                    </>
                  ) : (
                    <span>Guardar cotización</span>
                  )}
                </button>}

                {activeOpp.status === 'won' && !activeOpp.convertedProjectId && (
                  <button
                    type="button"
                    onClick={() => setIsConvertModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer bg-[#10b981] hover:bg-[#059669] text-white animate-pulse"
                    title="Convertir esta oportunidad a Cliente en el directorio y Proyecto en Operación"
                  >
                    <FolderPlus className="w-4 h-4 text-[#d4ff4a]" />
                    <span>Convertir a Cliente & Proyecto →</span>
                  </button>
                )}

                {activeOpp.convertedProjectId && onNavigateToView && (
                  <button
                    type="button"
                    onClick={() => onNavigateToView('proyectos', activeOpp.convertedProjectId)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] border border-[#cbd5e1]"
                  >
                    <FolderPlus className="w-4 h-4 text-[#10b981]" />
                    <span>Ver Proyecto en Operación ➔</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal de Creación de Nueva Oportunidad */}
      <NewOpportunityModal
        isOpen={isNewOppModalOpen}
        initialMode={oppModalMode}
        existingClients={clients}
        templates={templates}
        users={users}
        onClose={() => setIsNewOppModalOpen(false)}
        onSaveOpportunity={handleCreatedOpportunity}
      />

      {/* Modal de Confirmación: Registrar como Perdida */}
      {lossModalOpen && activeOpp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#e2e8f0] p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[#dc2626]">
                Marcar Oportunidad como Perdida
              </h3>
              <p className="text-xs text-[#64748b]">
                Registra el motivo para estadísticas de cierre comercial en Orbit.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#475569] block">Motivo de pérdida:</label>
              <input
                type="text"
                value={lossReasonInput}
                onChange={(e) => setLossReasonInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs text-[#0f172a] placeholder:text-[#7C8AA0] placeholder:font-normal focus:ring-2 focus:ring-[#dc2626]"
                placeholder="Ej: Presupuesto fuera de rango, eligió otro proveedor, cancelado..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setLossModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated: NewBusinessOpportunity = {
                    ...activeOpp,
                    status: 'lost',
                    lossReason: lossReasonInput.trim() || 'Desestimado por cliente',
                    updatedAt: new Date().toISOString()
                  };
                  onUpdateOpportunity(updated);
                  setLossModalOpen(false);
                  setConversionSuccessMessage('Oportunidad registrada como perdida.');
                  setTimeout(() => setConversionSuccessMessage(null), 3500);
                }}
                className="px-4 py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold"
              >
                Confirmar Pérdida
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conversión a Cliente & Proyecto */}
      {activeQuote && (
        <ConvertOpportunityModal
          isOpen={isConvertModalOpen}
          opportunity={activeOpp}
          activeQuote={activeQuote}
          users={users}
          clients={clients}
          onClose={() => setIsConvertModalOpen(false)}
          onConfirm={handleConfirmConversion}
        />
      )}

      {/* Modal Fiesta Bucky: ¡Propuesta Ganada! */}
      {wonCelebrationOpp && (
        <div
          className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setWonCelebrationOpp(null)}
        >
          <div
            className="relative bg-gradient-to-b from-[#140b24] via-[#241142] to-[#0f172a] text-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#d4ff4a]/60 text-center overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confeti festivo animado en cascada */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[
                { left: '8%', delay: '0s', color: '#d4ff4a', size: '10px' },
                { left: '22%', delay: '0.3s', color: '#a78bfa', size: '12px' },
                { left: '36%', delay: '0.7s', color: '#38bdf8', size: '8px' },
                { left: '50%', delay: '0.2s', color: '#f43f5e', size: '10px' },
                { left: '64%', delay: '0.5s', color: '#fbbf24', size: '12px' },
                { left: '78%', delay: '0.1s', color: '#34d399', size: '9px' },
                { left: '92%', delay: '0.8s', color: '#ec4899', size: '11px' },
                { left: '16%', delay: '1.1s', color: '#d4ff4a', size: '9px' },
                { left: '44%', delay: '1.3s', color: '#60a5fa', size: '11px' },
                { left: '84%', delay: '1.0s', color: '#fbbf24', size: '8px' },
              ].map((c, i) => (
                <span
                  key={i}
                  className="absolute rounded-full opacity-80 animate-ping"
                  style={{
                    left: c.left,
                    top: `${12 + (i * 7)}%`,
                    width: c.size,
                    height: c.size,
                    backgroundColor: c.color,
                    animationDuration: '2.5s',
                    animationDelay: c.delay,
                  }}
                />
              ))}
            </div>

            {/* Luces y auras de neón */}
            <div className="absolute -top-20 -left-20 w-56 h-56 bg-[#d4ff4a]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-[#501f92]/60 rounded-full blur-3xl pointer-events-none" />

            {/* Botón cerrar */}
            <button
              type="button"
              onClick={() => setWonCelebrationOpp(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer z-10"
              aria-label="Cerrar celebración"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Bucky Celebrando con aura de fiesta */}
            <div className="relative mx-auto w-36 h-36 sm:w-44 sm:h-44 mb-3 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#d4ff4a]/30 to-[#a78bfa]/30 rounded-full blur-2xl scale-110 animate-pulse" />
              <img
                src="/bucky_celebrating_cutout.png"
                alt="Bucky Celebrando Propuesta Ganada"
                className="relative w-full h-full object-contain drop-shadow-[0_12px_32px_rgba(212,255,74,0.45)] animate-bounce"
                style={{ animationDuration: '1.8s' }}
              />
              <span className="absolute -top-1 -right-2 text-2xl animate-spin" style={{ animationDuration: '6s' }}>
                ✨
              </span>
              <span className="absolute top-2 -left-3 text-2xl animate-pulse">
                🍾
              </span>
            </div>

            {/* Título de Celebración */}
            <div className="space-y-1.5 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-[#d4ff4a] text-[#0f172a] shadow-md shadow-[#d4ff4a]/20">
                <span>🎉 ¡DESTAPEMOS LA CHICHA EN LA COLONIA! 🎉</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center justify-center gap-2 flex-wrap">
                <span>¡PROPUESTA GANADA!</span>
                <span>🏆</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#cbd5e1] max-w-md mx-auto">
                ¡Tremenda victoria para el equipo! Reconocimiento de honor tanto para el área Comercial como para el Líder de Solución.
              </p>
            </div>

            {/* Reconocimiento Dual: Comercial + Líder Técnico */}
            <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xs space-y-3 text-left text-xs relative z-10">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 flex-wrap gap-2">
                <span className="text-white/60 font-medium">Cuenta / Prospecto:</span>
                <strong className="text-white font-bold text-sm truncate max-w-[260px]">
                  {wonCelebrationOpp.prospectAccountName || 'Cliente'}
                </strong>
              </div>

              {/* Fila Doble de Héroes: Comercial y Líder Técnico */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 1. Héroe Comercial */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#d4ff4a] flex items-center gap-1">
                      <span>💼 Comercial Estrella</span>
                    </span>
                    <span className="text-[10px] text-white/50 font-bold">Cierre</span>
                  </div>
                  <div className="text-sm font-black text-white truncate">
                    {getCommercialOwnerName(wonCelebrationOpp, users)}
                  </div>
                  <p className="text-[10px] text-white/70 leading-snug">
                    Defensa de pricing, negociación estratégica y cierre formal del acuerdo.
                  </p>
                </div>

                {/* 2. Héroe Líder Técnico */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#a78bfa] flex items-center gap-1">
                      <span>⚡ Solución & Scoping</span>
                    </span>
                    <span className="text-[10px] text-white/50 font-bold">Técnico</span>
                  </div>
                  <div className="text-sm font-black text-white truncate">
                    {users.find((user) => user.id === wonCelebrationOpp.leadUserId)?.name || 'Sin asignar'}
                  </div>
                  <p className="text-[10px] text-white/70 leading-snug">
                    Dimensionamiento técnico de {activeQuote?.totalHoursRollup || 0}h, entregables claros y alcance blindado.
                  </p>
                </div>
              </div>

              {/* Métricas clave del acuerdo comercial */}
              {activeQuote && (
                <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-[9px] uppercase font-bold text-white/60 block">Valor Acordado</span>
                    <span className="text-xs font-black text-[#d4ff4a]">
                      {formatCurrency(
                        activeQuote.totalQuotedValue ?? activeQuote.totalQuotedValueCOP ?? 0,
                        activeQuote.currency || 'COP'
                      )}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-[9px] uppercase font-bold text-white/60 block">Duración</span>
                    <span className="text-xs font-bold text-white">
                      {activeQuote.estimatedWeeks ?? activeQuote.financialConfig?.projectDurationWeeks ?? 0} sem
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-[9px] uppercase font-bold text-white/60 block">Esfuerzo</span>
                    <span className="text-xs font-bold text-[#a78bfa]">
                      {activeQuote.totalHoursRollup}h
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Botón único de acción tras ganar la propuesta */}
            <div className="mt-6 flex items-center justify-center relative z-10">
              <button
                type="button"
                onClick={() => {
                  setWonCelebrationOpp(null);
                  setIsConvertModalOpen(true);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#d4ff4a] hover:bg-[#bceb34] text-[#0f172a] text-sm font-black shadow-lg shadow-[#d4ff4a]/25 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2.5 animate-pulse"
              >
                <FolderPlus className="w-4 h-4 text-[#0f172a]" />
                <span>Convertir a Cliente & Proyecto →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Marcar Oportunidad como No Ganada (Closed-Lost) */}
      {isLostModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsLostModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#e2e8f0] p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2 text-[#dc2626]">
                <ThumbsDown className="w-5 h-5" />
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Marcar como No Ganada
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLostModalOpen(false)}
                className="p-1 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748b] leading-relaxed">
              Registra el motivo por el cual el cliente no aprobó la propuesta. La oportunidad quedará archivada en New Business y se podrá reactivar en el futuro si el cliente retoma el proyecto.
            </p>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#475569] block">
                  Motivo Principal:
                </label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] font-medium text-[#0f172a] bg-white focus:ring-2 focus:ring-[#501f92]"
                >
                  <option value="precio">Precio / Fuera de presupuesto del cliente</option>
                  <option value="tiempos">Tiempos de entrega / Urgencia no alineada</option>
                  <option value="competencia">Eligieron a otra agencia o proveedor</option>
                  <option value="cancelado_cliente">Proyecto postergado o cancelado internamente</option>
                  <option value="sin_respuesta">Cliente no respondió / Stand-by prolongado</option>
                  <option value="otro">Otro motivo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#475569] block">
                  Notas de Aprendizaje / Feedback Comercial:
                </label>
                <textarea
                  rows={3}
                  value={lostNotes}
                  onChange={(e) => setLostNotes(e.target.value)}
                  placeholder="Ej: El cliente recortó presupuesto para marketing este trimestre, prometieron evaluar de nuevo en Q3..."
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#501f92]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setIsLostModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated: NewBusinessOpportunity = {
                    ...activeOpp,
                    status: 'lost',
                    lossReason: lostReason,
                    lossNotes: lostNotes,
                    updatedAt: new Date().toISOString()
                  };
                  onUpdateOpportunity(updated);
                  setIsLostModalOpen(false);
                  setBannerNotification({
                    message: `ℹ️ Oportunidad "${activeOpp.title}" marcada como no ganada. Queda archivada para reactivación futura.`,
                    showProjectLink: false
                  });
                  setTimeout(() => setBannerNotification(null), 6000);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirmar No Ganada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
