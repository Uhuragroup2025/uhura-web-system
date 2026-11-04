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
  ActiveTimerState,
  ServiceCommercialItem,
  ServiceCommercialModality,
  ProposalCommercialType,
  HubSpotDealStage,
  HubSpotSyncAuditEntry
} from '../types';
import {
  getOperationalQuote,
  withOperationalQuote,
  getCommercialOwnerName,
  isValidFinanceSheetUrl,
  quoteSignature,
  quoteMissingRequirements,
  commercialStructureSignature,
  validateCommercialStructure
} from './quoteRules';
import { can } from '../auth/permissions';
import { serviceValidationMessages, isScopeReadyForReview, isEligibleScopingLeader, getScopeWeeks } from './teamCandidates';
import { BacklogScoper, type ScopeServiceDraft } from './BacklogScoper';
import { NewOpportunityModal } from './NewOpportunityModal';
import { ConvertOpportunityModal } from './ConvertOpportunityModal';
import { HubSpotCreateDealsModal } from './HubSpotCreateDealsModal';
import { HubSpotSyncModal } from './HubSpotSyncModal';
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
  Square,
  Sliders,
  X,
  Trophy,
  Lock,
  Info,
  Pencil,
  Edit3,
  ThumbsDown,
  RefreshCw,
  History,
  XCircle
} from 'lucide-react';

interface NewBusinessViewProps {
  resetToOverviewSignal?: number;
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
    leadUserIds?: string[];
    specialistUserIds?: string[];
    leadName: string;
    startDate: string;
    endDate?: string;
    initialFormalizationStatus?: 'pendiente_formalizacion' | 'activo';
    startConditionsConfig?: any;
    approvedServiceIds?: string[];
    isMixed?: boolean;
    fixedProjectName?: string;
    feeProjectName?: string;
    projects?: Array<{
      serviceId: string;
      serviceName: string;
      projectName: string;
      projectType: ProjectType;
      hubspotDealId?: string | null;
      hubspotDealStage?: string;
      soldValue?: number;
      soldMonthlyValue?: number;
      monthsDuration?: number;
      deliverableIds: string[];
      leadUserId?: string;
      leadUserName?: string;
    }>;
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
  resetToOverviewSignal,
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
  const [isMarkWonModalOpen, setIsMarkWonModalOpen] = useState<boolean>(false);
  const [selectedWonServiceIds, setSelectedWonServiceIds] = useState<string[]>([]);
  const [unselectedAction, setUnselectedAction] = useState<'lost' | 'keep'>('lost');
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
  const [isHubspotCreateDealsOpen, setIsHubspotCreateDealsOpen] = useState<boolean>(false);
  const [isHubspotSyncOpen, setIsHubspotSyncOpen] = useState<boolean>(false);

  // Retorno a la pantalla principal de New Business al hacer clic en el sidebar
  useEffect(() => {
    if (resetToOverviewSignal && resetToOverviewSignal > 0) {
      setSelectedOppId(null);
    }
  }, [resetToOverviewSignal]);

  // Two-Way Sync Audit Trail & QA controls
  const [syncAuditTrail, setSyncAuditTrail] = useState<HubSpotSyncAuditEntry[]>([]);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState<boolean>(false);
  const [isQaSimulationOpen, setIsQaSimulationOpen] = useState<boolean>(false);
  const [simulateSyncError, setSimulateSyncError] = useState<boolean>(false);
  const [qaOverrideCommercialPermissions, setQaOverrideCommercialPermissions] = useState<boolean | null>(null);

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
  const rawScopeState = activeQuote ? scopeUi[activeQuote.id] || { saved: false, services: [] } : { saved: false, services: [] };
  const activeDeliverableIds = useMemo(() => new Set(activeQuote?.deliverables.map((d) => d.id) || []), [activeQuote?.deliverables]);
  const scopeState = useMemo(() => {
    if (!activeQuote) return rawScopeState;
    const sanitizedServices = rawScopeState.services
      .map((s) => ({
        ...s,
        deliverableIds: (s.deliverableIds || []).filter((id) => activeDeliverableIds.has(id))
      }))
      .filter((s) => s.deliverableIds.length > 0);
    return {
      ...rawScopeState,
      services: sanitizedServices
    };
  }, [rawScopeState, activeQuote, activeDeliverableIds]);
  const allServicesValid = scopeState.services.every((service) => serviceValidationMessages(service).length === 0);
  const allServicesPrepared = allServicesValid && scopeState.services.every((service) => service.saved === true);
  const isScopeReadOnly = scopeState.saved && allServicesPrepared;

  // Controlled Draft State for Cotización (prevents premature locking on keystroke)
  const [quoteValueDraft, setQuoteValueDraft] = useState<string>('');
  const [quoteCurrencyDraft, setQuoteCurrencyDraft] = useState<'COP' | 'USD'>('COP');
  const [quoteSheetUrlDraft, setQuoteSheetUrlDraft] = useState<string>('');
  const [quoteNotesDraft, setQuoteNotesDraft] = useState<string>('');
  const [commercialStructureDraft, setCommercialStructureDraft] = useState<ServiceCommercialItem[]>([]);
  const [hasAttemptedSaveQuote, setHasAttemptedSaveQuote] = useState<boolean>(false);

  // Controlled Draft State for Resumen Discovery Brief
  const [briefDraft, setBriefDraft] = useState<string>('');

  // Servicios activos en el alcance (de scopeState o deliverables de la cotización)
  const currentScopeServices = useMemo(() => {
    if (scopeState.services.length > 0) {
      return scopeState.services.map((s) => ({
        id: s.id,
        name: s.name,
        weeks: Number(s.weeks) || 0,
        deliverableIds: s.deliverableIds || []
      }));
    }
    if (activeQuote?.commercialStructure && activeQuote.commercialStructure.length > 0) {
      return activeQuote.commercialStructure.map((cs) => ({
        id: cs.serviceId,
        name: cs.serviceName,
        weeks: cs.weeksRef || 0,
        deliverableIds: cs.deliverableIds || []
      }));
    }
    if (activeQuote?.deliverables && activeQuote.deliverables.length > 0) {
      return activeQuote.deliverables.map((d) => ({
        id: d.id,
        name: d.name,
        weeks: activeQuote.estimatedWeeks || 0,
        deliverableIds: [d.id]
      }));
    }
    return [];
  }, [scopeState.services, activeQuote]);

  // Sync draft states when quote changes or services change
  useEffect(() => {
    if (activeQuote) {
      const val = activeQuote.totalQuotedValue ?? activeQuote.totalQuotedValueCOP ?? 0;
      setQuoteValueDraft(val > 0 ? String(val) : '');
      setQuoteCurrencyDraft(activeQuote.currency || 'COP');
      setQuoteSheetUrlDraft(activeQuote.externalFinanceSheetUrl || '');
      setQuoteNotesDraft(activeQuote.commercialNotes || '');
      setIsEditingQuoteFields(!savedQuotes[activeQuote.id]);
      setIsQuoteSavedFeedback(false);

      // Reconciliar estructura comercial con los servicios del alcance
      const savedStructure = activeQuote.commercialStructure || [];
      setCommercialStructureDraft((prevDraft) => {
        return currentScopeServices.map((svc) => {
          const inPrev = prevDraft.find((item) => item.serviceId === svc.id);
          if (inPrev) {
            return {
              ...inPrev,
              serviceName: svc.name,
              weeksRef: svc.weeks,
              deliverableIds: svc.deliverableIds
            };
          }
          const inSaved = savedStructure.find((item) => item.serviceId === svc.id);
          if (inSaved) {
            return {
              ...inSaved,
              serviceName: svc.name,
              weeksRef: svc.weeks,
              deliverableIds: svc.deliverableIds
            };
          }
          return {
            serviceId: svc.id,
            serviceName: svc.name,
            weeksRef: svc.weeks,
            modality: 'fixed_project',
            totalValue: undefined,
            monthlyValue: undefined,
            monthsDuration: undefined,
            deliverableIds: svc.deliverableIds
          };
        });
      });
    }
  }, [activeQuote?.id, currentScopeServices]);

  // Sync brief draft when opportunity changes
  useEffect(() => {
    if (activeOpp) {
      const bText = activeOpp.briefSummary || activeOpp.discoveryNotes || '';
      setBriefDraft(bText);
      setIsEditingBrief(!bText);
    }
  }, [activeOpp?.id]);

  // Orbit determina automáticamente el tipo general de la propuesta:
  // - todos los servicios son proyecto único → Proyecto único
  // - todos son fee mensual → Fee mensual
  // - existen servicios de ambas modalidades → Propuesta mixta
  const derivedProposalType: ProposalCommercialType = useMemo(() => {
    if (commercialStructureDraft.length === 0) return 'fixed_project';
    const hasFixed = commercialStructureDraft.some((item) => item.modality === 'fixed_project');
    const hasFee = commercialStructureDraft.some((item) => item.modality === 'fee_monthly');
    if (hasFixed && hasFee) return 'mixed';
    if (hasFee) return 'fee_monthly';
    return 'fixed_project';
  }, [commercialStructureDraft]);

  // Resumen comercial:
  // - Total proyectos únicos (excluyendo servicios en Cierre perdido)
  // - Fee mensual total (excluyendo servicios en Cierre perdido)
  // - Valor estimado del contrato = proyectos únicos + (fee mensual × vigencia)
  const commercialTotals = useMemo(() => {
    let totalOneOff = 0;
    let totalMonthlyFee = 0;
    let estimatedContractValue = 0;
    let lostCount = 0;
    let lostTotalValue = 0;

    commercialStructureDraft.forEach((item) => {
      const isLost = item.hubspotDealStage === 'Cierre perdido';
      const itemTotalVal =
        item.modality === 'fixed_project'
          ? Number(item.totalValue) || 0
          : (Number(item.monthlyValue) || 0) * (Number(item.monthsDuration) || 0);

      if (isLost) {
        lostCount += 1;
        lostTotalValue += itemTotalVal;
        return; // Excluir de la sumatoria de contrato ganado/activo
      }

      if (item.modality === 'fixed_project') {
        const val = Number(item.totalValue) || 0;
        totalOneOff += val;
        estimatedContractValue += val;
      } else if (item.modality === 'fee_monthly') {
        const monthly = Number(item.monthlyValue) || 0;
        const months = Number(item.monthsDuration) || 0;
        totalMonthlyFee += monthly;
        estimatedContractValue += (monthly * months);
      }
    });

    return { totalOneOff, totalMonthlyFee, estimatedContractValue, lostCount, lostTotalValue };
  }, [commercialStructureDraft]);

  // Firma determinista y validación de estructura comercial
  const currentCommercialSignature = useMemo(() => {
    return commercialStructureSignature(commercialStructureDraft, quoteSheetUrlDraft);
  }, [commercialStructureDraft, quoteSheetUrlDraft]);

  const commercialValidationErrors = useMemo(() => {
    return validateCommercialStructure(currentScopeServices, commercialStructureDraft, quoteSheetUrlDraft);
  }, [currentScopeServices, commercialStructureDraft, quoteSheetUrlDraft]);

  // Helper: ¿La cotización ya fue guardada con su estructura comercial completa?
  const isQuoteDiligenciada = Boolean(
    activeQuote &&
    savedQuotes[activeQuote.id] &&
    savedQuotes[activeQuote.id] === currentCommercialSignature &&
    isValidFinanceSheetUrl(quoteSheetUrlDraft) &&
    commercialStructureDraft.length > 0 &&
    commercialValidationErrors.length === 0 &&
    !isEditingQuoteFields
  );

  const hasAnyHubSpotDeals = useMemo(() => {
    return commercialStructureDraft.some((s) => Boolean(s.hubspotDealId));
  }, [commercialStructureDraft]);

  const hasAnyWonServices = useMemo(() => {
    return commercialStructureDraft.some(
      (s) => s.hubspotDealStage === 'Cierre ganado' || s.hubspotDealStage === 'Enviado para facturar' || s.approved === true
    );
  }, [commercialStructureDraft]);

  const quotePendingMessage = useMemo(() => {
    if (currentScopeServices.length === 0) {
      return 'Falta definir servicios en el alcance.';
    }
    if (commercialValidationErrors.length > 0) {
      return commercialValidationErrors[0];
    }
    return '';
  }, [currentScopeServices.length, commercialValidationErrors]);

  // Permisos comerciales para editar la etapa (Reglas 2 y 5)
  const hasCommercialPermissions = useMemo(() => {
    if (qaOverrideCommercialPermissions !== null) return qaOverrideCommercialPermissions;
    if (!currentUser) return true;
    return (
      currentUser.accessLevel === 'commercial' ||
      currentUser.accessLevel === 'system_admin' ||
      currentUser.accessLevel === 'leader' ||
      currentUser.role?.toLowerCase().includes('comercial') ||
      currentUser.role?.toLowerCase().includes('lead') ||
      currentUser.name === activeOpp?.commercialOwner
    );
  }, [currentUser, activeOpp?.commercialOwner, qaOverrideCommercialPermissions]);

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
    leadUserIds?: string[];
    specialistUserIds?: string[];
    leadName: string;
    startDate: string;
    endDate?: string;
    initialFormalizationStatus?: 'pendiente_formalizacion' | 'activo';
    startConditionsConfig?: any;
    approvedServiceIds?: string[];
    isMixed?: boolean;
    fixedProjectName?: string;
    feeProjectName?: string;
    projects?: any[];
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
    const count = payload.projects?.length || 1;
    const namesNotice = payload.projects && payload.projects.length > 0
      ? payload.projects.map((p) => `"${p.projectName}"`).join(', ')
      : payload.isMixed
      ? `"${payload.fixedProjectName || payload.projectName}" y "${payload.feeProjectName}"`
      : `"${payload.projectName}"`;
    setBannerNotification({
      message: `🎉 ¡${namesNotice} se ha convertido a Cliente y ${count} Proyecto(s) independiente(s)! La formalización fiscal continúa en la ficha del Cliente.`,
      showProjectLink: true
    });
    setTimeout(() => {
      setBannerNotification(null);
    }, 10000);
  };

  // Manejo de creación de negocios en HubSpot (1 servicio = 1 negocio)
  const handleConfirmCreateDeals = (updatedServices: ServiceCommercialItem[]) => {
    if (!activeOpp || !activeQuote) return;
    setCommercialStructureDraft(updatedServices);
    const sig = commercialStructureSignature(updatedServices, quoteSheetUrlDraft);
    const updatedQuote: QuoteProposal = {
      ...activeQuote,
      commercialStructure: updatedServices,
      updatedAt: new Date().toISOString()
    };
    handleUpdateQuote(updatedQuote);
    onSetQuoteSaved(activeQuote.id, sig);
    setConversionSuccessMessage(`✅ Se crearon exitosamente ${updatedServices.length} negocio(s) en HubSpot (1 por servicio). Etapa inicial: Presentación a cliente.`, {
      timeoutMs: 6000
    });
  };

  // Manejo de sincronización de etapas desde HubSpot (origen: 'HubSpot')
  const handleApplyHubspotSync = (updatedServices: ServiceCommercialItem[]) => {
    if (!activeOpp || !activeQuote) return;
    const nowIso = new Date().toISOString();

    // Regla 8: Registrar trazabilidad por cada servicio que cambió de etapa
    const newAuditEntries: HubSpotSyncAuditEntry[] = [];
    updatedServices.forEach((s) => {
      const prev = commercialStructureDraft.find((item) => item.serviceId === s.serviceId);
      const prevStage = prev?.hubspotDealStage || 'Presentación a cliente';
      const newStage = s.hubspotDealStage || 'Presentación a cliente';

      if (prevStage !== newStage) {
        newAuditEntries.push({
          id: `audit-${Date.now()}-${s.serviceId}`,
          serviceId: s.serviceId,
          serviceName: s.serviceName,
          dealId: s.hubspotDealId,
          previousStage: prevStage,
          newStage: newStage,
          userId: 'hubspot-webhook',
          userName: 'HubSpot CRM Webhook',
          timestamp: nowIso,
          origin: 'HubSpot',
          syncStatus: 'success',
          syncedFields: {
            dealName: `${s.serviceName} — ${activeOpp.prospectAccountName}`,
            companyName: activeOpp.prospectAccountName,
            contactName: activeOpp.contactName,
            commercialOwner: activeOpp.commercialOwner,
            value: s.modality === 'fixed_project' ? s.totalValue : s.monthlyValue,
            currency: quoteCurrencyDraft,
            stage: newStage
          }
        });
      }
    });

    if (newAuditEntries.length > 0) {
      setSyncAuditTrail((prev) => [...newAuditEntries, ...prev]);
    }

    setCommercialStructureDraft(updatedServices);
    const sig = commercialStructureSignature(updatedServices, quoteSheetUrlDraft);

    const hasWonOrBilling = updatedServices.some(
      (s) => s.hubspotDealStage === 'Cierre ganado' || s.hubspotDealStage === 'Enviado para facturar'
    );
    const allLost = updatedServices.length > 0 && updatedServices.every((s) => s.hubspotDealStage === 'Cierre perdido');

    const updatedQuote: QuoteProposal = {
      ...activeQuote,
      commercialStructure: updatedServices,
      updatedAt: nowIso
    };

    let updatedOpp: NewBusinessOpportunity = {
      ...withOperationalQuote(activeOpp, updatedQuote),
      updatedAt: nowIso
    };

    if (hasWonOrBilling) {
      updatedOpp = {
        ...updatedOpp,
        status: 'won',
        hubspotDealStage: 'closedwon'
      };
      playWonFanfare();
    } else if (allLost) {
      updatedOpp = {
        ...updatedOpp,
        status: 'lost',
        lossReason: 'Cierre perdido en HubSpot para todos los servicios'
      };
    }

    onUpdateOpportunity(updatedOpp);
    onSetQuoteSaved(activeQuote.id, sig);

    const wonCount = updatedServices.filter((s) => s.hubspotDealStage === 'Cierre ganado' || s.hubspotDealStage === 'Enviado para facturar').length;
    const lostCount = updatedServices.filter((s) => s.hubspotDealStage === 'Cierre perdido').length;

    let syncMessage = `Sincronización con HubSpot completada: `;
    if (wonCount > 0 && lostCount > 0) {
      syncMessage += `${wonCount} servicio(s) ganado(s) habilitado(s) para conversión, y ${lostCount} perdido(s) descartado(s).`;
    } else if (wonCount > 0) {
      syncMessage += `${wonCount} servicio(s) en Cierre ganado / Enviado para facturar. ¡Listos para convertir!`;
    } else if (allLost) {
      syncMessage += `Todos los servicios fueron registrados como Cierre perdido.`;
    } else {
      syncMessage += `Etapas actualizadas correctamente.`;
    }

    setConversionSuccessMessage(syncMessage, {
      timeoutMs: 7000
    });
  };

  // Cambiar etapa comercial directamente desde Orbit (Sincronización bidireccional Orbit -> HubSpot)
  const handleUpdateStageFromOrbit = (serviceId: string, newStage: HubSpotDealStage) => {
    if (!hasCommercialPermissions || !activeOpp || !activeQuote) return;
    const targetService = commercialStructureDraft.find((s) => s.serviceId === serviceId);
    if (!targetService) return;
    if (targetService.hubspotDealStage === newStage) return; // Regla 9: Evita duplicados o ciclos

    const prevStage = targetService.hubspotDealStage || 'Presentación a cliente';

    // 1. Estado transitorio: Sincronizando con HubSpot...
    setCommercialStructureDraft((prev) =>
      prev.map((s) => s.serviceId === serviceId ? { ...s, hubspotSyncStatus: 'syncing', hubspotSyncError: undefined } : s)
    );

    // 2. Espera de confirmación simulada de HubSpot (850ms)
    setTimeout(() => {
      // Si la simulación QA tiene activo el error de red:
      if (simulateSyncError) {
        setCommercialStructureDraft((prev) =>
          prev.map((s) => s.serviceId === serviceId ? {
            ...s,
            hubspotSyncStatus: 'error',
            hubspotSyncError: 'Error 503: Timeout de conexión con HubSpot Deals API'
          } : s)
        );

        const errorEntry: HubSpotSyncAuditEntry = {
          id: `audit-${Date.now()}-${serviceId}`,
          serviceId,
          serviceName: targetService.serviceName,
          dealId: targetService.hubspotDealId,
          previousStage: prevStage,
          newStage,
          userId: currentUser?.id || 'u-pao',
          userName: currentUser?.name || 'Paola Monsalve',
          timestamp: new Date().toISOString(),
          origin: 'Orbit',
          syncStatus: 'error',
          errorMessage: 'Error 503: Timeout de conexión con HubSpot Deals API',
          syncedFields: {
            dealName: `${targetService.serviceName} — ${activeOpp.prospectAccountName}`,
            companyName: activeOpp.prospectAccountName,
            contactName: activeOpp.contactName,
            commercialOwner: activeOpp.commercialOwner,
            value: targetService.modality === 'fixed_project' ? targetService.totalValue : targetService.monthlyValue,
            currency: quoteCurrencyDraft,
            stage: newStage
          }
        };
        setSyncAuditTrail((prev) => [errorEntry, ...prev]);
        return;
      }

      // Confirmación exitosa recibida de HubSpot
      const nowIso = new Date().toISOString();
      const isApproved = newStage === 'Cierre ganado' || newStage === 'Enviado para facturar';

      let updatedList: ServiceCommercialItem[] = [];
      setCommercialStructureDraft((prev) => {
        updatedList = prev.map((s) => s.serviceId === serviceId ? {
          ...s,
          hubspotDealStage: newStage,
          hubspotLastSyncedAt: nowIso,
          hubspotSyncStatus: 'synced',
          approved: isApproved
        } : s);
        return updatedList;
      });

      // Guardar en la cotización activa
      const sig = commercialStructureSignature(updatedList, quoteSheetUrlDraft);
      const updatedQuote: QuoteProposal = {
        ...activeQuote,
        commercialStructure: updatedList,
        updatedAt: nowIso
      };
      handleUpdateQuote(updatedQuote);
      onSetQuoteSaved(activeQuote.id, sig);

      // Trazabilidad (Regla 8):
      const auditEntry: HubSpotSyncAuditEntry = {
        id: `audit-${Date.now()}-${serviceId}`,
        serviceId,
        serviceName: targetService.serviceName,
        dealId: targetService.hubspotDealId,
        previousStage: prevStage,
        newStage,
        userId: currentUser?.id || 'u-pao',
        userName: currentUser?.name || 'Paola Monsalve',
        timestamp: nowIso,
        origin: 'Orbit',
        syncStatus: 'success',
        syncedFields: {
          dealName: `${targetService.serviceName} — ${activeOpp.prospectAccountName}`,
          companyName: activeOpp.prospectAccountName,
          contactName: activeOpp.contactName,
          commercialOwner: activeOpp.commercialOwner,
          value: targetService.modality === 'fixed_project' ? targetService.totalValue : targetService.monthlyValue,
          currency: quoteCurrencyDraft,
          stage: newStage
        }
      };
      setSyncAuditTrail((prev) => [auditEntry, ...prev]);

      // Si el servicio pasó a Cierre ganado o Enviado para facturar, actualizar estado de la oportunidad a 'won'
      if (isApproved) {
        const updatedOpp: NewBusinessOpportunity = {
          ...activeOpp,
          status: 'won',
          hubspotDealStage: 'closedwon',
          updatedAt: nowIso
        };
        onUpdateOpportunity(updatedOpp);
        playWonFanfare();
      }

      // Revertir badge 'synced' a 'idle' tras 3s
      setTimeout(() => {
        setCommercialStructureDraft((prev) =>
          prev.map((s) => s.serviceId === serviceId && s.hubspotSyncStatus === 'synced' ? { ...s, hubspotSyncStatus: 'idle' } : s)
        );
      }, 3000);
    }, 850);
  };

  // Reintentar sincronización fallida
  const handleRetrySync = (serviceId: string) => {
    setSimulateSyncError(false);
    const targetService = commercialStructureDraft.find((s) => s.serviceId === serviceId);
    if (!targetService) return;
    const stage = targetService.hubspotDealStage || 'Presentación a cliente';
    handleUpdateStageFromOrbit(serviceId, stage);
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

      {/* Active Opp Summary Header Banner - Executive & Clean UI */}
      <div className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-lg font-extrabold text-[#0f172a] tracking-tight">
              {activeOpp.prospectAccountName}
            </span>
            <span className="text-xs text-[#cbd5e1]">·</span>
            <span className="text-base font-semibold text-[#501f92]">
              {activeOpp.title}
            </span>
            {activeOpp.status === 'won' ? (
              <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#10b981]/15 text-[#059669] flex items-center gap-1 border border-[#10b981]/25">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ganada · Proyecto en Orbit</span>
              </span>
            ) : activeOpp.status === 'internal_review' ? (
              <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#b45309] border border-[#f59e0b]/25">
                Cotización / Por Pricing
              </span>
            ) : activeOpp.status === 'proposal_sent' || activeOpp.status === 'negotiation' ? (
              <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#8b5cf6]/15 text-[#6d28d9] border border-[#8b5cf6]/25">
                En Negociación
              </span>
            ) : (
              <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#501f92]/10 text-[#501f92] border border-[#501f92]/20">
                En Scoping
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-[#64748b] flex-wrap pt-0.5">
            <div className="flex items-center gap-1.5 relative">
              <User className="w-3.5 h-3.5 text-[#501f92]" />
              <span>
                Responsable de alcance:{' '}
                <strong className="text-[#0f172a] font-semibold">{currentLeadDisplayName}</strong>
              </span>
              {canEditOpp && users.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsReassigningLead(!isReassigningLead)}
                  className="text-[11px] text-[#501f92] hover:underline font-bold ml-0.5 cursor-pointer"
                  title="Reasignar responsable de alcance"
                >
                  (Reasignar)
                </button>
              )}

              {/* Popover reasignar líder */}
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

            {activeOpp.contactName && (
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#94a3b8]" />
                <span>
                  {activeOpp.contactName}
                  {activeOpp.contactEmail && (
                    <span className="text-[#64748b] font-normal ml-1">({activeOpp.contactEmail})</span>
                  )}
                </span>
              </span>
            )}

            {activeOpp.hubspotCompanyId && (
              <span className="text-[10.5px] font-mono text-[#c2410c] font-semibold bg-[#fff7ed] px-2 py-0.5 rounded border border-[#fed7aa]">
                HubSpot: {activeOpp.hubspotCompanyId}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Timer Preventa & Primary CTA (Conversion or HubSpot) */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Timer estandarizado como en Tareas y Proyectos (Iniciar / Detener) */}
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
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                isScopingTimerRunning
                  ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white border-[#dc2626] animate-pulse'
                  : 'bg-white hover:bg-[#f8fafc] text-[#0f172a] border-[#cbd5e1]'
              }`}
              title={isScopingTimerRunning ? 'Detener timer activo' : 'Iniciar timer para esta oportunidad'}
            >
              {isScopingTimerRunning ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current text-white" />
                  <span>Detener</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-[#501f92]" />
                  <span>Iniciar</span>
                </>
              )}
              <span
                className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  isScopingTimerRunning ? 'bg-white/20 text-white' : 'bg-[#501f92]/10 text-[#501f92]'
                }`}
              >
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#f8fafc] text-xs font-bold text-[#501f92] border border-[#e2e8f0] transition-colors cursor-pointer shadow-2xs"
                    title="Ver ficha del Cliente"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#501f92]" />
                    <span>Ver Cliente</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateToView('proyectos', activeOpp.convertedProjectId)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                    title="Ver proyecto operativo en el módulo de Proyectos"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Ver en Proyectos →</span>
                  </button>
                </>
              )}
            </div>
          ) : (hasAnyWonServices || activeOpp.status === 'won') ? (
            <button
              type="button"
              onClick={() => setIsConvertModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs bg-[#501f92] hover:bg-[#3d1572] text-white cursor-pointer shadow-md animate-pulse hover:scale-[1.02]"
              title="Convertir servicios ganados en proyectos operativos independientes"
            >
              <FolderPlus className="w-4 h-4 text-[#d4ff4a]" />
              <span>Convertir a Cliente & Proyecto →</span>
            </button>
          ) : null}
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
                <Layers className="w-4 h-4 text-[#501f92]" />
                <h3 className="text-base font-bold text-[#0f172a]">Alcance técnico</h3>
                <div className="relative group inline-flex items-center">
                  <Info className="w-3.5 h-3.5 text-[#94a3b8] hover:text-[#501f92] cursor-help" />
                  <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-30 w-72 p-2.5 bg-[#0f172a] text-white text-[11px] rounded-xl shadow-xl leading-relaxed pointer-events-none">
                    Responsables sugeridos por rol y menor carga registrada; editables antes de guardar. Cambiar la persona actualiza el rol cotizado.
                  </div>
                </div>
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
                    onChangeScopeUi(activeQuote.id, {
                      ...scopeState,
                      saved: true,
                      services: scopeState.services.map((s) => ({ ...s, saved: true }))
                    });
                    setConversionSuccessMessage('Alcance técnico guardado.');
                    setTimeout(() => setConversionSuccessMessage(null), 3000);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#475569] transition-colors cursor-pointer"
                >
                  {isScopeReadOnly ? <span className="inline-flex items-center gap-1"><Pencil className="w-3 h-3" />Editar alcance</span> : 'Guardar'}
                </button>

                {(() => {
                  const hasPresentation = Boolean(activeQuote.commercialProposalUrl?.trim() && activeQuote.commercialProposalUrl.trim().length > 5);
                  const hasDeliverablesAndActivities = activeQuote.deliverables.length > 0 && activeQuote.deliverables.some((d) => d.backlogItems.length > 0 && d.backlogItems.some((a) => a.estimatedHours > 0));
                  const hasValidServices = scopeState.services.length > 0 && scopeState.services.every((s) => Number(s.weeks) >= 1 && serviceValidationMessages(s).length === 0);
                  const isReadyToMark = Boolean(scopeState.saved && hasPresentation && hasDeliverablesAndActivities && hasValidServices);
                  const isAlreadyMarked = activeOpp.status === 'internal_review' || activeOpp.status === 'proposal_sent' || activeOpp.status === 'negotiation' || activeOpp.status === 'won';

                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isReadyToMark) return;
                        const updatedOpp: NewBusinessOpportunity = {
                          ...activeOpp,
                          status: 'internal_review',
                          updatedAt: new Date().toISOString()
                        };
                        onUpdateOpportunity(updatedOpp);
                        setConversionSuccessMessage(
                          `✓ Alcance técnico listo (${activeQuote.totalHoursRollup}h). Notificación enviada a Comercial para cotizar.`
                        );
                        setTimeout(() => setConversionSuccessMessage(null), 6000);
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
                            : !hasPresentation
                              ? 'Falta ingresar el enlace de la presentación en Drive'
                              : !hasDeliverablesAndActivities
                                ? 'Falta importar o agregar al menos un servicio con actividades'
                                : !scopeState.saved
                                  ? 'Haz clic en Guardar antes de marcar como listo'
                                  : 'Servicios pendientes de completar semanas'
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
              if (!scopeState.saved || !isScopeReadyForReview(activeQuote, scopeState.services)) return;
              const updatedOpp: NewBusinessOpportunity = {
                ...activeOpp,
                status: 'internal_review',
                updatedAt: new Date().toISOString()
              };
              onUpdateOpportunity(updatedOpp);
              setConversionSuccessMessage(
                `✅ Alcance técnico completado (${totalHours}h). Notificación enviada a Comercial para cotizar en la calculadora.`,
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
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-7 shadow-xs space-y-6">
            {/* Cabecera limpia e integrada: título, tipo de propuesta y controles en una sola línea */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-5 border-b border-[#f1f5f9]">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#501f92]/10 text-[#501f92] flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-[#0f172a]">
                        Cotización Comercial & Pricing Oficial
                      </h3>
                      {/* Pill de Tipo de Propuesta sin caja contenedora extra */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight inline-flex items-center gap-1 ${
                        derivedProposalType === 'mixed'
                          ? 'bg-[#7839ee]/10 text-[#6d28d9]'
                          : derivedProposalType === 'fee_monthly'
                          ? 'bg-[#059669]/10 text-[#047857]'
                          : 'bg-[#501f92]/10 text-[#501f92]'
                      }`}>
                        <Sliders className="w-3 h-3" />
                        <span>
                          {derivedProposalType === 'mixed'
                            ? 'Propuesta mixta'
                            : derivedProposalType === 'fee_monthly'
                            ? 'Fee mensual'
                            : 'Proyecto único'}
                        </span>
                      </span>
                      {activeOpp.hubspotDealStage && (
                        <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]">
                          HubSpot: {activeOpp.hubspotDealStage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selector de Moneda y botón de edición */}
              <div className="flex items-center gap-2.5 ml-auto">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-xs">
                  <span className="text-[11px] font-medium text-[#64748b]">Moneda:</span>
                  <select
                    disabled={!isEditingQuoteFields}
                    value={quoteCurrencyDraft}
                    onChange={(e) => setQuoteCurrencyDraft(e.target.value as 'COP' | 'USD')}
                    className="font-bold text-xs bg-transparent text-[#501f92] focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                  >
                    <option value="COP">COP ($)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>

                {!isEditingQuoteFields && isQuoteDiligenciada && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingQuoteFields(true);
                      setIsQuoteSavedFeedback(false);
                      setConversionSuccessMessage(null);
                      onSetQuoteSaved(activeQuote.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e8f0] hover:border-[#501f92] bg-white text-xs font-semibold text-[#501f92] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Editar cotización</span>
                  </button>
                )}
              </div>
            </div>

            {/* Estructura comercial de la propuesta (apilado limpio y directo) */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-bold text-sm text-[#0f172a] flex items-center gap-2">
                    <span>Estructura comercial por servicio</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b]">
                      {commercialStructureDraft.length} {commercialStructureDraft.length === 1 ? 'servicio' : 'servicios'}
                    </span>
                  </h4>
                  <p className="text-xs text-[#64748b]">
                    Define la modalidad comercial y los valores para cada servicio del alcance técnico.
                  </p>
                </div>

                {/* Acciones de Trazabilidad */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsAuditTrailOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#fed7aa] bg-[#fff7ed] hover:bg-[#ffedd5] text-xs font-bold text-[#c2410c] transition-colors cursor-pointer"
                    title="Ver registro de auditoría y trazabilidad de sincronización bidireccional Orbit ⇄ HubSpot"
                  >
                    <History className="w-3.5 h-3.5 text-[#ea580c]" />
                    <span>Trazabilidad HubSpot</span>
                    {syncAuditTrail.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[#ea580c] text-white text-[10px] font-mono font-bold">
                        {syncAuditTrail.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Lista de servicios */}
              {commercialStructureDraft.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#fffbeb] border border-[#fef3c7] text-xs text-[#b45309] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#d97706]" />
                  <span>No hay servicios definidos en el alcance. Configúralos en la pestaña "Alcance" primero.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {commercialStructureDraft.map((item, idx) => {
                    const isFixed = item.modality === 'fixed_project';
                    const isFee = item.modality === 'fee_monthly';

                    // Subcomponente de etapa bidireccional
                    const renderTwoWayStage = () => {
                      if (!item.hubspotDealId) {
                        return (
                          <span className="text-[10px] text-[#94a3b8] italic px-1.5 py-0.5 rounded bg-[#f8fafc]">
                            Sin negocio en HubSpot
                          </span>
                        );
                      }

                      if (item.hubspotSyncStatus === 'syncing') {
                        return (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin text-[#1d4ed8]" />
                            <span>Sincronizando con HubSpot...</span>
                          </span>
                        );
                      }

                      if (item.hubspotSyncStatus === 'error') {
                        return (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]">
                            <AlertCircle className="w-3 h-3 text-red-500" />
                            <span>Error de sincronización</span>
                            <button
                              type="button"
                              onClick={() => handleRetrySync(item.serviceId)}
                              className="underline font-bold text-red-700 hover:text-red-900 cursor-pointer ml-0.5"
                            >
                              Reintentar
                            </button>
                          </span>
                        );
                      }

                      if (item.hubspotSyncStatus === 'synced') {
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                            <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                            <span>Sincronizado</span>
                          </span>
                        );
                      }

                      if (hasCommercialPermissions) {
                        return (
                          <div className="flex items-center gap-1">
                            <select
                              value={item.hubspotDealStage || 'Presentación a cliente'}
                              onChange={(e) => handleUpdateStageFromOrbit(item.serviceId, e.target.value as HubSpotDealStage)}
                              className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer focus:ring-1 focus:ring-[#ea580c] ${
                                item.hubspotDealStage === 'Cierre ganado'
                                  ? 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]'
                                  : item.hubspotDealStage === 'Enviado para facturar'
                                  ? 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'
                                  : item.hubspotDealStage === 'Cierre perdido'
                                  ? 'bg-[#fff1f2] text-[#be123c] border-[#fecdd3]'
                                  : 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]'
                              }`}
                              title="Cambiar etapa en Orbit y sincronizar con HubSpot"
                            >
                              <option value="Presentación a cliente">Presentación a cliente</option>
                              <option value="Cierre ganado">Cierre ganado 🏆</option>
                              <option value="Enviado para facturar">Enviado para facturar 📄</option>
                              <option value="Cierre perdido">Cierre perdido ❌</option>
                            </select>
                          </div>
                        );
                      }

                      return (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            item.hubspotDealStage === 'Cierre ganado'
                              ? 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
                              : item.hubspotDealStage === 'Enviado para facturar'
                              ? 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]'
                              : item.hubspotDealStage === 'Cierre perdido'
                              ? 'bg-[#fff1f2] text-[#be123c] border border-[#fecdd3]'
                              : 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]'
                          }`}
                          title="Solo usuarios con permisos comerciales pueden cambiar la etapa"
                        >
                          <Lock className="w-2.5 h-2.5 text-current/60" />
                          <span>{item.hubspotDealStage || 'Presentación a cliente'}</span>
                        </span>
                      );
                    };

                    const isClosedLost = item.hubspotDealStage === 'Cierre perdido';

                    if (!isEditingQuoteFields && isQuoteDiligenciada) {
                      /* Modo lectura limpio: fila horizontal despejada */
                      return (
                        <div
                          key={item.serviceId || idx}
                          className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                            isClosedLost
                              ? 'border-dashed border-[#cbd5e1] bg-[#f8fafc]/90 opacity-70 hover:opacity-100'
                              : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-bold text-sm ${isClosedLost ? 'text-[#64748b] line-through' : 'text-[#0f172a]'}`}>
                                {item.serviceName}
                              </span>
                              {isClosedLost && (
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]">
                                  Cierre perdido / Descartado
                                </span>
                              )}
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#f8fafc] text-[#64748b] border border-[#f1f5f9]">
                                {item.weeksRef || 0} {item.weeksRef === 1 ? 'semana' : 'semanas'}
                              </span>
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                  isFixed
                                    ? 'bg-[#501f92]/10 text-[#501f92]'
                                    : 'bg-[#059669]/10 text-[#047857]'
                                }`}
                              >
                                {isFixed ? 'Proyecto único' : 'Fee mensual'}
                              </span>
                              {item.hubspotDealId && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] font-semibold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] inline-block" />
                                  <span>Deal: {item.hubspotDealId}</span>
                                </span>
                              )}
                              {renderTwoWayStage()}
                            </div>
                          </div>

                          <div className="flex items-center gap-5 flex-wrap">
                            {isFixed ? (
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Valor del servicio</span>
                                <span className={`text-sm font-black ${isClosedLost ? 'line-through text-[#94a3b8]' : 'text-[#0f172a]'}`}>
                                  {formatCurrency(item.totalValue || 0, quoteCurrencyDraft)}
                                </span>
                                {isClosedLost && (
                                  <span className="text-[10px] text-[#dc2626] font-semibold block">Excluido del total</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Valor mensual</span>
                                  <span className={`text-sm font-black ${isClosedLost ? 'line-through text-[#94a3b8]' : 'text-[#059669]'}`}>
                                    {formatCurrency(item.monthlyValue || 0, quoteCurrencyDraft)} / mes
                                  </span>
                                </div>
                                <div className="border-l border-[#f1f5f9] pl-4">
                                  <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Vigencia</span>
                                  <span className={`text-xs font-bold ${isClosedLost ? 'text-[#94a3b8]' : 'text-[#0f172a]'}`}>
                                    {item.monthsDuration || 0} meses
                                  </span>
                                </div>
                                <div className="border-l border-[#f1f5f9] pl-4">
                                  <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Total estimado</span>
                                  <span className={`text-xs font-extrabold ${isClosedLost ? 'line-through text-[#94a3b8]' : 'text-[#501f92]'}`}>
                                    {formatCurrency((item.monthlyValue || 0) * (item.monthsDuration || 0), quoteCurrencyDraft)}
                                  </span>
                                  {isClosedLost && (
                                    <span className="text-[10px] text-[#dc2626] font-semibold block">Excluido del total</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    /* Modo edición limpio */
                    return (
                      <div
                        key={item.serviceId || idx}
                        className={`p-4 rounded-xl border transition-all space-y-3.5 text-xs ${
                          isClosedLost
                            ? 'border-dashed border-[#cbd5e1] bg-[#f8fafc]/90 opacity-75 hover:opacity-100'
                            : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-bold text-sm ${isClosedLost ? 'text-[#64748b]' : 'text-[#0f172a]'}`}>
                              {item.serviceName}
                            </span>
                            {isClosedLost && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]">
                                Cierre perdido
                              </span>
                            )}
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#f8fafc] text-[#64748b] border border-[#f1f5f9]">
                              {item.weeksRef || 0} {item.weeksRef === 1 ? 'semana' : 'semanas'} en alcance
                            </span>
                            {item.hubspotDealId && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] font-semibold">
                                Deal: {item.hubspotDealId}
                              </span>
                            )}
                            {renderTwoWayStage()}
                          </div>

                          {/* Segmented Pill Selector de Modalidad */}
                          <div className="inline-flex items-center p-0.5 rounded-lg bg-[#f1f5f9] border border-[#e2e8f0]">
                            <button
                              type="button"
                              onClick={() => {
                                setCommercialStructureDraft((prev) =>
                                  prev.map((s) =>
                                    s.serviceId === item.serviceId
                                      ? { ...s, modality: 'fixed_project' }
                                      : s
                                  )
                                );
                              }}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                isFixed
                                  ? 'bg-[#501f92] text-white shadow-2xs'
                                  : 'text-[#64748b] hover:text-[#0f172a]'
                              }`}
                            >
                              Proyecto único
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCommercialStructureDraft((prev) =>
                                  prev.map((s) =>
                                    s.serviceId === item.serviceId
                                      ? { ...s, modality: 'fee_monthly', monthsDuration: s.monthsDuration || 6 }
                                      : s
                                  )
                                );
                              }}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                isFee
                                  ? 'bg-[#059669] text-white shadow-2xs'
                                  : 'text-[#64748b] hover:text-[#0f172a]'
                              }`}
                            >
                              Fee mensual
                            </button>
                          </div>
                        </div>

                        {/* Inputs limpios según modalidad */}
                        {isFixed ? (
                          <div className="space-y-1">
                            <label className="font-semibold text-[#475569] block text-xs">
                              Valor total del servicio ({quoteCurrencyDraft}): <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              value={item.totalValue !== undefined && item.totalValue !== null ? item.totalValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '');
                                const val = raw === '' ? undefined : parseInt(raw, 10);
                                setCommercialStructureDraft((prev) =>
                                  prev.map((s) => (s.serviceId === item.serviceId ? { ...s, totalValue: val } : s))
                                );
                              }}
                              className="w-full max-w-sm p-2.5 rounded-xl border border-[#cbd5e1] font-bold text-sm text-[#0f172a] focus:ring-2 focus:ring-[#501f92] focus:border-[#501f92] bg-white transition-all"
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end max-w-xl">
                            <div className="space-y-1">
                              <label className="font-semibold text-[#475569] block text-xs">
                                Valor mensual ({quoteCurrencyDraft}): <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                value={item.monthlyValue !== undefined && item.monthlyValue !== null ? item.monthlyValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                                onChange={(e) => {
                                  const raw = e.target.value.replace(/\D/g, '');
                                  const val = raw === '' ? undefined : parseInt(raw, 10);
                                  setCommercialStructureDraft((prev) =>
                                    prev.map((s) => (s.serviceId === item.serviceId ? { ...s, monthlyValue: val } : s))
                                  );
                                }}
                                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] font-bold text-sm text-[#059669] focus:ring-2 focus:ring-[#059669] focus:border-[#059669] bg-white transition-all"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-semibold text-[#475569] block text-xs">
                                Vigencia en meses: <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="60"
                                placeholder="6"
                                value={item.monthsDuration !== undefined ? item.monthsDuration : ''}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? undefined : Number(e.target.value);
                                  setCommercialStructureDraft((prev) =>
                                    prev.map((s) => (s.serviceId === item.serviceId ? { ...s, monthsDuration: val } : s))
                                  );
                                }}
                                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] font-bold text-sm text-[#0f172a] focus:ring-2 focus:ring-[#501f92] focus:border-[#501f92] bg-white transition-all"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Resumen Comercial: Strip ejecutivo horizontal sin cajas anidadas */}
            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e2e8f0] gap-4 sm:gap-6">
                {/* 1. Total proyectos únicos */}
                <div className="sm:pr-4 space-y-1">
                  <span className="text-[10.5px] uppercase font-bold text-[#64748b] tracking-wider block">
                    Total proyectos únicos
                  </span>
                  <div className="text-xl font-black text-[#0f172a]">
                    {formatCurrency(commercialTotals.totalOneOff, quoteCurrencyDraft)}
                  </div>
                  <p className="text-[11px] text-[#64748b]">Suma de servicios de ejecución puntual</p>
                </div>

                {/* 2. Fee mensual total */}
                <div className="pt-4 sm:pt-0 sm:px-6 space-y-1">
                  <span className="text-[10.5px] uppercase font-bold text-[#047857] tracking-wider block">
                    Fee mensual total
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-[#059669]">
                      {formatCurrency(commercialTotals.totalMonthlyFee, quoteCurrencyDraft)}
                    </span>
                    <span className="text-xs font-bold text-[#059669]">/ mes</span>
                  </div>
                  <p className="text-[11px] text-[#64748b]">Facturación recurrente mensual</p>
                </div>

                {/* 3. Valor estimado del contrato */}
                <div className="pt-4 sm:pt-0 sm:pl-6 space-y-1">
                  <span className="text-[10.5px] uppercase font-bold text-[#501f92] tracking-wider block">
                    Valor estimado del contrato
                  </span>
                  <div className="text-xl font-black text-[#501f92]">
                    {formatCurrency(commercialTotals.estimatedContractValue, quoteCurrencyDraft)}
                  </div>
                  <p className="text-[11px] text-[#64748b]">Proyectos únicos + (Fee × vigencia)</p>
                </div>
              </div>

              {commercialTotals.lostCount > 0 && (
                <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-[#b91c1c]">
                    <XCircle className="w-4 h-4 text-[#ef4444]" />
                    <span>
                      {commercialTotals.lostCount} {commercialTotals.lostCount === 1 ? 'servicio en Cierre perdido' : 'servicios en Cierre perdido'}
                    </span>
                  </span>
                  <span className="font-semibold text-[#64748b]">
                    {formatCurrency(commercialTotals.lostTotalValue, quoteCurrencyDraft)} excluidos de la suma del contrato ganado
                  </span>
                </div>
              )}
            </div>

            {/* Planilla de Finanzas / Calculadora Google Sheet y Notas: Integradas directamente sin bordes anidados */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-bold text-[#334155] text-xs flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-[#501f92]" />
                    <span>Enlace de la calculadora / Google Sheet oficial:</span>
                    <span className="text-red-500">*</span>
                  </label>
                  {quoteSheetUrlDraft.trim().length > 5 && (
                    <a
                      href={quoteSheetUrlDraft}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#501f92] hover:underline"
                    >
                      <span>Abrir Sheet en Google Drive</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {isEditingQuoteFields ? (
                  <div className="space-y-1">
                    <input
                      type="url"
                      value={quoteSheetUrlDraft}
                      onChange={(e) => {
                        setQuoteSheetUrlDraft(e.target.value);
                        if (hasAttemptedSaveQuote && e.target.value.trim().length > 0) {
                          setHasAttemptedSaveQuote(false);
                        }
                      }}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className={`w-full p-2.5 rounded-xl text-xs font-mono text-[#0f172a] placeholder:font-sans placeholder:font-normal focus:ring-2 bg-white transition-all ${
                        hasAttemptedSaveQuote && (!quoteSheetUrlDraft.trim() || !isValidFinanceSheetUrl(quoteSheetUrlDraft))
                          ? 'border-2 border-red-500 ring-2 ring-red-400/50 bg-red-50/20 placeholder:text-red-400'
                          : 'border border-[#cbd5e1] placeholder:text-[#94a3b8] focus:ring-[#501f92] focus:border-[#501f92]'
                      }`}
                    />
                    {hasAttemptedSaveQuote && (!quoteSheetUrlDraft.trim() || !isValidFinanceSheetUrl(quoteSheetUrlDraft)) && (
                      <p className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>Falta ingresar el enlace obligatorio de la calculadora oficial (Google Sheet).</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-mono text-[#0f172a] truncate">
                    {quoteSheetUrlDraft || <span className="text-[#94a3b8] italic">Sin enlace registrado</span>}
                  </div>
                )}
              </div>

              {/* Notas comerciales */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#334155] block text-xs">
                  Notas y supuestos comerciales:
                </label>
                {isEditingQuoteFields ? (
                  <textarea
                    rows={2}
                    value={quoteNotesDraft}
                    onChange={(e) => setQuoteNotesDraft(e.target.value)}
                    placeholder="Ej: Términos de pago, vigencia de oferta 15 días, entregables sujetos a insumos."
                    className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs text-[#0f172a] placeholder:text-[#94a3b8] placeholder:font-normal focus:ring-2 focus:ring-[#501f92] focus:border-[#501f92] bg-white transition-all"
                  />
                ) : (
                  <p className="text-xs text-[#475569] italic bg-[#f8fafc] p-2.5 rounded-xl border border-[#e2e8f0]">
                    {quoteNotesDraft || 'Sin condiciones adicionales registradas.'}
                  </p>
                )}
              </div>
            </div>

            {/* Footer con CTA Guardar cambios a la derecha como primer botón */}
            <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs text-[#64748b]">
                {isQuoteSavedFeedback && (
                  <span className="text-[#059669] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    <span>Cotización guardada exitosamente. Botón 'Marcar como ganada 🏆' habilitado arriba.</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap ml-auto">
                {/* Solo se guarda mientras los campos están en edición. */}
                {isEditingQuoteFields && (
                  <button
                    type="button"
                    onClick={() => {
                      setHasAttemptedSaveQuote(true);
                      const errors = validateCommercialStructure(
                        currentScopeServices,
                        commercialStructureDraft,
                        quoteSheetUrlDraft
                      );
                      if (errors.length > 0) {
                        setIsQuoteSavedFeedback(false);
                        setConversionSuccessMessage(errors.join(' '));
                        return;
                      }

                      const sig = commercialStructureSignature(commercialStructureDraft, quoteSheetUrlDraft);
                      const updatedQuote: QuoteProposal = {
                        ...activeQuote,
                        commercialStructure: commercialStructureDraft,
                        commercialProposalType: derivedProposalType,
                        commercialTotalOneOff: commercialTotals.totalOneOff,
                        commercialTotalMonthlyFee: commercialTotals.totalMonthlyFee,
                        commercialEstimatedContractValue: commercialTotals.estimatedContractValue,
                        totalQuotedValue: commercialTotals.estimatedContractValue,
                        totalQuotedValueCOP: quoteCurrencyDraft === 'USD' ? 0 : commercialTotals.estimatedContractValue,
                        currency: quoteCurrencyDraft,
                        externalFinanceSheetUrl: quoteSheetUrlDraft.trim(),
                        commercialNotes: quoteNotesDraft.trim(),
                        updatedAt: new Date().toISOString()
                      };
                      handleUpdateQuote(updatedQuote);
                      onSetQuoteSaved(activeQuote.id, sig);
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
                    title="Guardar los valores económicos y condiciones de esta cotización (obligatorio)"
                  >
                    {isQuoteSavedFeedback ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#d4ff4a]" />
                        <span>¡Cotización guardada!</span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <span>Guardar cotización</span>
                        <span className="text-[#d4ff4a] font-black text-sm leading-none" title="Obligatorio">*</span>
                      </span>
                    )}
                  </button>
                )}

                {/* Acciones de HubSpot y Conversión (habilitadas cuando la cotización está guardada) */}
                {!isEditingQuoteFields && isQuoteDiligenciada && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Botón 1: Crear negocios en HubSpot (1 por cada servicio) */}
                    <button
                      type="button"
                      onClick={() => setIsHubspotCreateDealsOpen(true)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                        hasAnyHubSpotDeals
                          ? 'border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] hover:bg-[#ffedd5]'
                          : 'bg-[#ea580c] hover:bg-[#c2410c] text-white'
                      }`}
                      title={
                        hasAnyHubSpotDeals
                          ? 'Los negocios ya fueron generados en HubSpot (puedes volver a abrir para revisar o recrear)'
                          : 'Crear un negocio independiente en HubSpot por cada servicio del alcance'
                      }
                    >
                      {hasAnyHubSpotDeals ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#ea580c]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-white inline-block animate-pulse" />
                      )}
                      <span>{hasAnyHubSpotDeals ? 'Negocios en HubSpot ✓' : 'Crear negocios en HubSpot'}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                        hasAnyHubSpotDeals ? 'bg-[#ffedd5] text-[#9a3412]' : 'bg-white/20 text-white'
                      }`}>
                        {commercialStructureDraft.length}
                      </span>
                    </button>

                    {/* Botón 2: Sincronizar con HubSpot (CTA primario tras crear negocios) */}
                    <button
                      type="button"
                      onClick={() => setIsHubspotSyncOpen(true)}
                      disabled={!hasAnyHubSpotDeals}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                        hasAnyHubSpotDeals
                          ? 'bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-md'
                          : 'border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] opacity-40 cursor-not-allowed'
                      }`}
                      title={
                        hasAnyHubSpotDeals
                          ? 'Sincronizar y conciliar etapas comerciales con HubSpot'
                          : 'Crea primero los negocios en HubSpot para sincronizar etapas'
                      }
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${hasAnyHubSpotDeals ? 'text-white' : 'text-[#ea580c]'}`} />
                      <span>Sincronizar con HubSpot</span>
                    </button>

                    {/* Botón 3: Aprobación Comercial Manual (cuando HubSpot no responde o es oportunidad manual) */}
                    {!hasAnyWonServices && activeOpp.status !== 'won' && (
                      <button
                        type="button"
                        onClick={() => {
                          const defaultWon = commercialStructureDraft
                            .filter((s) => s.hubspotDealStage !== 'Cierre perdido')
                            .map((s) => s.serviceId);
                          setSelectedWonServiceIds(defaultWon);
                          setUnselectedAction('lost');
                          setIsMarkWonModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 bg-[#059669] hover:bg-[#047857] text-white"
                        title="Seleccionar y confirmar qué servicios de la cotización quedaron ganados"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#d4ff4a]" />
                        <span>Marcar como ganada 🏆</span>
                      </button>
                    )}
                  </div>
                )}

                {(hasAnyWonServices || activeOpp.status === 'won') && !activeOpp.convertedProjectId && (
                  <button
                    type="button"
                    onClick={() => setIsConvertModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer bg-[#501f92] hover:bg-[#3d1572] text-white animate-pulse"
                    title="Convertir servicios ganados en proyectos operativos independientes"
                  >
                    <FolderPlus className="w-4 h-4 text-[#d4ff4a]" />
                    <span>Convertir a Cliente y Proyectos →</span>
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

      {/* Modal de Confirmación Granular: Marcar Servicios Ganados */}
      {isMarkWonModalOpen && activeOpp && activeQuote && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#e2e8f0] p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#f1f5f9] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center text-[#059669] shadow-xs">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#0f172a]">
                      Confirmar Servicios Ganados
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#d4ff4a]/20 text-[#2e5e04] border border-[#d4ff4a]/50">
                      Cierre Comercial
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    {activeOpp.prospectAccountName} · Selecciona qué servicios aprobó el cliente para marcarlos como ganados.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMarkWonModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of Services with Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0f172a]">
                  Servicios de la propuesta ({commercialStructureDraft.length})
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWonServiceIds(commercialStructureDraft.map((s) => s.serviceId));
                    }}
                    className="text-[#501f92] font-semibold hover:underline cursor-pointer"
                  >
                    Seleccionar todos
                  </button>
                  <span className="text-[#cbd5e1]">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedWonServiceIds([])}
                    className="text-[#64748b] font-semibold hover:underline cursor-pointer"
                  >
                    Deseleccionar todos
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {commercialStructureDraft.map((service) => {
                  const isChecked = selectedWonServiceIds.includes(service.serviceId);
                  const isCurrentlyLost = service.hubspotDealStage === 'Cierre perdido';
                  const val = service.modality === 'fixed_project' ? (service.totalValue || 0) : (service.monthlyValue || 0);

                  return (
                    <div
                      key={service.serviceId}
                      onClick={() => {
                        setSelectedWonServiceIds((prev) =>
                          prev.includes(service.serviceId)
                            ? prev.filter((id) => id !== service.serviceId)
                            : [...prev, service.serviceId]
                        );
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'border-[#10b981] bg-[#ecfdf5]/50 shadow-xs'
                          : 'border-[#e2e8f0] bg-[#f8fafc] opacity-75 hover:opacity-100 hover:border-[#cbd5e1]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-[#059669] focus:ring-[#059669] border-[#cbd5e1] cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0f172a]">
                              {service.serviceName}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                service.modality === 'fee_monthly'
                                  ? 'bg-[#d4ff4a]/20 text-[#2e5e04]'
                                  : 'bg-[#eff6ff] text-[#2563eb]'
                              }`}
                            >
                              {service.modality === 'fee_monthly' ? 'Fee mensual' : 'Proyecto único'}
                            </span>
                          </div>
                          {isCurrentlyLost && (
                            <span className="text-[10px] text-[#dc2626] font-semibold block">
                              (Actualmente en estado: Cierre perdido)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className="text-xs font-bold text-[#0f172a] block">
                          {formatCurrency(val, quoteCurrencyDraft)}
                        </span>
                        {service.modality === 'fee_monthly' && (
                          <span className="text-[10px] text-[#64748b]">
                            /mes · {service.monthsDuration || 1} meses
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unselected Services Decision */}
            {commercialStructureDraft.length > selectedWonServiceIds.length && (
              <div className="p-3.5 rounded-2xl bg-[#fff7ed] border border-[#fed7aa] space-y-2">
                <span className="text-[11px] font-bold text-[#9a3412] block">
                  ¿Cómo registrar los servicios no seleccionados? ({commercialStructureDraft.length - selectedWonServiceIds.length})
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    onClick={(e) => {
                      e.stopPropagation();
                      setUnselectedAction('lost');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      unselectedAction === 'lost'
                        ? 'bg-white border-[#ea580c] shadow-2xs font-bold text-[#9a3412]'
                        : 'border-[#fed7aa] bg-white/60 text-[#64748b]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="unselectedAction"
                      checked={unselectedAction === 'lost'}
                      onChange={() => setUnselectedAction('lost')}
                      className="text-[#ea580c] focus:ring-[#ea580c]"
                    />
                    <span>Marcar como 'Cierre perdido' (No generarán proyecto)</span>
                  </label>

                  <label
                    onClick={(e) => {
                      e.stopPropagation();
                      setUnselectedAction('keep');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      unselectedAction === 'keep'
                        ? 'bg-white border-[#ea580c] shadow-2xs font-bold text-[#9a3412]'
                        : 'border-[#fed7aa] bg-white/60 text-[#64748b]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="unselectedAction"
                      checked={unselectedAction === 'keep'}
                      onChange={() => setUnselectedAction('keep')}
                      className="text-[#ea580c] focus:ring-[#ea580c]"
                    />
                    <span>Mantener pendientes en negociación</span>
                  </label>
                </div>
              </div>
            )}

            {/* Won Summary Strip */}
            <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#64748b] block">
                  Servicios a ganar
                </span>
                <span className="text-sm font-extrabold text-[#0f172a]">
                  {selectedWonServiceIds.length} de {commercialStructureDraft.length} servicios seleccionados
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] font-bold uppercase text-[#64748b] block">
                  Total aprobado
                </span>
                <span className="text-sm font-black text-[#059669]">
                  {formatCurrency(
                    commercialStructureDraft
                      .filter((s) => selectedWonServiceIds.includes(s.serviceId))
                      .reduce((acc, s) => acc + (s.modality === 'fixed_project' ? (s.totalValue || 0) : (s.monthlyValue || 0) * (s.monthsDuration || 1)), 0),
                    quoteCurrencyDraft
                  )}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setIsMarkWonModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={selectedWonServiceIds.length === 0}
                onClick={() => {
                  const nowIso = new Date().toISOString();
                  const updatedCommercial: ServiceCommercialItem[] = commercialStructureDraft.map((s) => {
                    const isWon = selectedWonServiceIds.includes(s.serviceId);
                    if (isWon) {
                      return {
                        ...s,
                        hubspotDealStage: 'Cierre ganado' as HubSpotDealStage,
                        approved: true
                      };
                    } else if (unselectedAction === 'lost') {
                      return {
                        ...s,
                        hubspotDealStage: 'Cierre perdido' as HubSpotDealStage,
                        approved: false
                      };
                    } else {
                      return {
                        ...s,
                        approved: false
                      };
                    }
                  });
                  setCommercialStructureDraft(updatedCommercial);

                  const wonServices = updatedCommercial.filter((s) => selectedWonServiceIds.includes(s.serviceId));

                  const manualAuditEntries: HubSpotSyncAuditEntry[] = wonServices.map((s) => ({
                    id: `audit-${Date.now()}-${s.serviceId}`,
                    serviceId: s.serviceId,
                    serviceName: s.serviceName,
                    dealId: s.hubspotDealId || null,
                    previousStage: s.hubspotDealStage || 'Presentación a cliente',
                    newStage: 'Cierre ganado' as HubSpotDealStage,
                    userId: currentUser?.id || 'commercial-manual',
                    userName: currentUser?.name || 'Aprobación Comercial Manual',
                    timestamp: nowIso,
                    origin: 'Orbit' as const,
                    syncStatus: 'success' as const,
                    syncedFields: {
                      dealName: `${s.serviceName} — ${activeOpp.prospectAccountName}`,
                      companyName: activeOpp.prospectAccountName,
                      contactName: activeOpp.contactName,
                      commercialOwner: activeOpp.commercialOwner,
                      value: s.modality === 'fixed_project' ? s.totalValue : s.monthlyValue,
                      currency: quoteCurrencyDraft,
                      stage: 'Cierre ganado' as HubSpotDealStage
                    }
                  }));

                  if (manualAuditEntries.length > 0) {
                    setSyncAuditTrail((prev) => [...manualAuditEntries, ...prev]);
                  }

                  const updatedQuote: QuoteProposal = {
                    ...activeQuote,
                    commercialStructure: updatedCommercial
                  };
                  handleUpdateQuote(updatedQuote);

                  if (wonServices.length > 0) {
                    handleMarkOpportunityWon(activeOpp);
                  }

                  setIsMarkWonModalOpen(false);
                  setConversionSuccessMessage(
                    `🏆 ¡Propuesta confirmada con ${wonServices.length} servicio(s) ganado(s)! Listo para convertir a proyectos.`
                  );
                  setTimeout(() => setConversionSuccessMessage(null), 5000);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                  selectedWonServiceIds.length > 0
                    ? 'bg-[#059669] hover:bg-[#047857] text-white active:scale-95'
                    : 'bg-[#cbd5e1] text-[#64748b] cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#d4ff4a]" />
                <span>Confirmar y marcar ganados ({selectedWonServiceIds.length}) 🏆</span>
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

      {/* Modal Crear Negocios en HubSpot (1 servicio = 1 negocio) */}
      {activeQuote && (
        <HubSpotCreateDealsModal
          isOpen={isHubspotCreateDealsOpen}
          opportunity={activeOpp}
          activeQuote={activeQuote}
          commercialServices={commercialStructureDraft}
          currency={quoteCurrencyDraft}
          onClose={() => setIsHubspotCreateDealsOpen(false)}
          onConfirmCreateDeals={handleConfirmCreateDeals}
        />
      )}

      {/* Modal Sincronizar Etapas desde HubSpot */}
      {activeQuote && (
        <HubSpotSyncModal
          isOpen={isHubspotSyncOpen}
          services={commercialStructureDraft}
          clientName={activeOpp.prospectAccountName || 'Cliente'}
          currency={quoteCurrencyDraft}
          onClose={() => setIsHubspotSyncOpen(false)}
          onApplySync={handleApplyHubspotSync}
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

      {/* Modal: Trazabilidad de Sincronización HubSpot (Auditoría Bidireccional) */}
      {isAuditTrailOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsAuditTrailOpen(false)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#501f92]/10 text-[#501f92] flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#0f172a]">
                      Trazabilidad de Sincronización HubSpot
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ea580c]/10 text-[#c2410c] border border-[#fed7aa]">
                      Fuente primaria: HubSpot
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Historial de cambios de etapa y sincronizaciones bidireccionales entre Orbit y HubSpot Deals API.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditTrailOpen(false)}
                className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Banner de Garantía de Desacoplamiento */}
            <div className="px-5 py-3 bg-[#f0fdf4] border-b border-[#bbf7d0] text-xs text-[#166534] flex items-start gap-2.5 shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
              <div className="text-[11.5px] leading-relaxed">
                <strong className="font-bold">Desacoplamiento garantizado:</strong> La sincronización bidireccional impacta exclusivamente datos comerciales del negocio (Etapa, Valor, Moneda, Nombre, Contacto y Comercial). Los campos operativos de Orbit (modalidad de contratación, duración en semanas, entregables, horas, enlace de cálculo y supuestos) se mantienen bajo estricto control interno y nunca son alterados ni sobreescritos por HubSpot.
              </div>
            </div>

            {/* Listado de eventos de auditoría */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
              {syncAuditTrail.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-2 border-2 border-dashed border-[#e2e8f0] rounded-xl">
                  <Clock className="w-8 h-8 text-[#94a3b8] mx-auto opacity-70" />
                  <p className="font-bold text-[#475569]">Sin registros de sincronización aún</p>
                  <p className="text-xs text-[#64748b] max-w-sm mx-auto">
                    Los cambios de etapa efectuados desde Orbit o recibidos desde HubSpot se registrarán aquí automáticamente con fecha, usuario y campos transmitidos.
                  </p>
                </div>
              ) : (
                syncAuditTrail.map((entry) => {
                  const isWonStage = entry.newStage === 'Cierre ganado' || entry.newStage === 'Enviado para facturar';
                  const isLostStage = entry.newStage === 'Cierre perdido';
                  const isOutbound = entry.origin === 'Orbit';

                  return (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-xl border transition-all ${
                        entry.syncStatus === 'error'
                          ? 'bg-[#fef2f2] border-[#fecaca]'
                          : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1] shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2 pb-2 border-b border-[#f1f5f9]">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            isOutbound
                              ? 'bg-[#501f92]/10 text-[#501f92] border border-[#501f92]/20'
                              : 'bg-[#ea580c]/10 text-[#c2410c] border border-[#fed7aa]'
                          }`}>
                            {isOutbound ? (
                              <>
                                <span>Orbit → HubSpot</span>
                                <span className="text-[9px] font-normal opacity-75">(Saliente)</span>
                              </>
                            ) : (
                              <>
                                <span>HubSpot → Orbit</span>
                                <span className="text-[9px] font-normal opacity-75">(Entrante)</span>
                              </>
                            )}
                          </span>

                          <span className="font-bold text-[#0f172a] text-xs">
                            {entry.serviceName}
                          </span>

                          {entry.dealId && (
                            <span className="font-mono text-[10.5px] text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded">
                              {entry.dealId}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
                          <span className="font-medium">{entry.userName}</span>
                          <span>•</span>
                          <span className="font-mono">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Transición de Etapa */}
                      <div className="flex items-center gap-2.5 my-2">
                        <span className="text-[11px] font-medium text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#e2e8f0]">
                          {entry.previousStage}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                          isWonStage
                            ? 'bg-[#dcfce7] text-[#15803d] border-[#86efac]'
                            : isLostStage
                            ? 'bg-[#fee2e2] text-[#b91c1c] border-[#fca5a5]'
                            : 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'
                        }`}>
                          {isWonStage && <span>🏆</span>}
                          <span>{entry.newStage}</span>
                        </span>

                        {entry.syncStatus === 'success' ? (
                          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#15803d]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirmado por HubSpot</span>
                          </span>
                        ) : (
                          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#b91c1c]">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Fallo de red / Error de sincronización</span>
                          </span>
                        )}
                      </div>

                      {/* Resumen de campos transmitidos */}
                      {entry.syncedFields && (
                        <div className="mt-2 pt-2 border-t border-[#f1f5f9] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                          <div className="bg-[#f8fafc] p-2 rounded-lg">
                            <span className="text-[#64748b] block font-medium">Valor comercial:</span>
                            <span className="font-bold text-[#0f172a]">
                              {formatCurrency(entry.syncedFields.value, (entry.syncedFields.currency as 'COP' | 'USD') || 'COP')}
                            </span>
                          </div>
                          <div className="bg-[#f8fafc] p-2 rounded-lg">
                            <span className="text-[#64748b] block font-medium">Empresa:</span>
                            <span className="font-bold text-[#0f172a] truncate block">
                              {entry.syncedFields.companyName}
                            </span>
                          </div>
                          <div className="bg-[#f8fafc] p-2 rounded-lg">
                            <span className="text-[#64748b] block font-medium">Contacto:</span>
                            <span className="font-bold text-[#0f172a] truncate block">
                              {entry.syncedFields.contactName}
                            </span>
                          </div>
                          <div className="bg-[#f8fafc] p-2 rounded-lg">
                            <span className="text-[#64748b] block font-medium">Owner Comercial:</span>
                            <span className="font-bold text-[#0f172a] truncate block">
                              {entry.syncedFields.commercialOwner}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#64748b]">
                Total de eventos registrados: <strong className="text-[#0f172a]">{syncAuditTrail.length}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsAuditTrailOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar trazabilidad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Simulación QA / Testing Técnico (Aislado y Etiquetado) */}
      {isQaSimulationOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsQaSimulationOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border-2 border-[#f97316] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con Etiqueta Prominente QA */}
            <div className="p-5 border-b border-[#fed7aa] bg-[#fff7ed] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ea580c]/15 text-[#ea580c] flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-[#ea580c] text-white">
                      Simulación QA
                    </span>
                    <h3 className="text-sm font-bold text-[#0f172a]">
                      Herramientas de Validación HubSpot
                    </h3>
                  </div>
                  <p className="text-xs text-[#9a3412] mt-0.5">
                    Ajustes de pruebas para verificar la resiliencia y permisos de la sincronización.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQaSimulationOpen(false)}
                className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#ffedd5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Controles de Simulación */}
            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              {/* Control 1: Simular error de red 503 / Timeout */}
              <div className="p-3.5 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#0f172a] block">
                      Simular Fallo de Red / Error 503 en HubSpot API
                    </span>
                    <span className="text-[11px] text-[#64748b]">
                      Prueba el estado de error y la acción de reintentar.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSimulateSyncError((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      simulateSyncError
                        ? 'bg-[#dc2626] text-white shadow-xs'
                        : 'bg-white text-[#475569] border border-[#cbd5e1] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    {simulateSyncError ? 'Error Activado ⚠️' : 'Normal (200 OK)'}
                  </button>
                </div>
                {simulateSyncError && (
                  <p className="text-[11px] text-[#b91c1c] font-semibold bg-[#fee2e2] p-2 rounded-lg">
                    ⚠️ Al cambiar la etapa de un servicio, HubSpot responderá con error para validar el badge rojo y el botón 'Reintentar'.
                  </p>
                )}
              </div>

              {/* Control 2: Permisos comerciales */}
              <div className="p-3.5 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] space-y-2">
                <span className="font-bold text-[#0f172a] block">
                  Simulación de Permisos de Usuario
                </span>
                <p className="text-[11px] text-[#64748b]">
                  Regla 2 y 5: Sólo usuarios con permisos comerciales pueden cambiar la etapa desde Orbit. Los demás roles la ven como sólo lectura.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setQaOverrideCommercialPermissions(true)}
                    className={`p-2 rounded-lg font-bold text-xs text-center border cursor-pointer transition-all ${
                      hasCommercialPermissions && qaOverrideCommercialPermissions === true
                        ? 'bg-[#501f92] text-white border-[#501f92]'
                        : 'bg-white text-[#334155] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    Rol Comercial (Editable)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQaOverrideCommercialPermissions(false)}
                    className={`p-2 rounded-lg font-bold text-xs text-center border cursor-pointer transition-all ${
                      qaOverrideCommercialPermissions === false
                        ? 'bg-[#0f172a] text-white border-[#0f172a]'
                        : 'bg-white text-[#334155] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    Sin Permiso (Solo Lectura 🔒)
                  </button>
                </div>
              </div>

              {/* Control 3: Simular Webhook entrante desde HubSpot */}
              <div className="p-3.5 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] space-y-2">
                <span className="font-bold text-[#0f172a] block">
                  Simular Evento Webhook Entrante (HubSpot → Orbit)
                </span>
                <p className="text-[11px] text-[#64748b]">
                  Simula que un vendedor o directivo actualizó la etapa directamente en HubSpot.
                </p>
                {commercialStructureDraft.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {commercialStructureDraft.map((service) => (
                      <div key={service.serviceId} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#e2e8f0]">
                        <span className="font-medium text-[#0f172a] truncate max-w-[180px]">
                          {service.serviceName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = commercialStructureDraft.map((s) =>
                                s.serviceId === service.serviceId ? { ...s, hubspotDealStage: 'Cierre ganado' as HubSpotDealStage, approved: true } : s
                              );
                              handleApplyHubspotSync(updated);
                              setIsQaSimulationOpen(false);
                            }}
                            className="px-2 py-1 rounded bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#15803d] font-bold text-[10.5px] cursor-pointer"
                          >
                            Forzar Ganado
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = commercialStructureDraft.map((s) =>
                                s.serviceId === service.serviceId ? { ...s, hubspotDealStage: 'Cierre perdido' as HubSpotDealStage, approved: false } : s
                              );
                              handleApplyHubspotSync(updated);
                              setIsQaSimulationOpen(false);
                            }}
                            className="px-2 py-1 rounded bg-[#fee2e2] hover:bg-[#fecaca] text-[#b91c1c] font-bold text-[10.5px] cursor-pointer"
                          >
                            Forzar Perdido
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#94a3b8] italic">
                    Agrega servicios en el alcance para simular eventos de webhook.
                  </p>
                )}
              </div>

              {/* Control 4: Limpiar historial */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSyncAuditTrail([]);
                    setConversionSuccessMessage('Historial de auditoría reiniciado.');
                  }}
                  className="text-xs text-[#64748b] hover:text-[#b91c1c] underline font-medium cursor-pointer"
                >
                  Limpiar historial de auditoría ({syncAuditTrail.length} eventos)
                </button>
                <button
                  type="button"
                  onClick={() => setIsQaSimulationOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold cursor-pointer"
                >
                  Listo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
