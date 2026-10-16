import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  NewBusinessOpportunity,
  QuoteProposal,
  ClientProfile,
  ProductBacklogTemplate,
  ProjectType,
  AdministrativeChecklist,
  StartConditionsConfig,
  SowDocumentData,
  UserItem,
  TaskItem,
  TimeLog,
  ActiveTimerState
} from '../types';
import { can } from '../auth/permissions';
import { BacklogScoper } from './BacklogScoper';
import { NewOpportunityModal } from './NewOpportunityModal';
import { ConvertOpportunityModal } from './ConvertOpportunityModal';
import { SOWModal } from './SOWModal';
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
  History,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Copy,
  Printer,
  Play,
  Sliders,
  X,
  Trophy,
  Lock
} from 'lucide-react';

interface NewBusinessViewProps {
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
  opportunities,
  clients,
  templates,
  onUpdateOpportunity,
  onCreateOpportunity,
  onNavigateToView,
  onConvertOpportunityToProject,
  currentUser,
  users = [],
  tasks = [],
  timeLogs = [],
  activeTimer = null,
  onStartTimer,
  onStopTimer
}) => {
  // Leaders, Commercial, Executives, and System Admins can create and manage opportunities
  const isNotCollaboratorOrPending = !currentUser || (currentUser.accessLevel !== 'collaborator' && currentUser.accessLevel !== 'pending');
  const canCreateOpp = can(currentUser, 'create', 'new-business') || isNotCollaboratorOrPending;
  const canApproveOpp = can(currentUser, 'approve', 'new-business') || isNotCollaboratorOrPending;
  const canEditOpp = can(currentUser, 'edit', 'new-business') || isNotCollaboratorOrPending;

  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'scoping' | 'cotizacion' | 'documentos' | 'historial'>('resumen');
  const [isNewOppModalOpen, setIsNewOppModalOpen] = useState<boolean>(false);
  const [oppModalMode, setOppModalMode] = useState<'hubspot' | 'manual'>('hubspot');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isConvertModalOpen, setIsConvertModalOpen] = useState<boolean>(false);
  const [isSowModalOpen, setIsSowModalOpen] = useState<boolean>(false);
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
    const updated: NewBusinessOpportunity = {
      ...opp,
      status: 'won',
      updatedAt: new Date().toISOString()
    };
    onUpdateOpportunity(updated);
    setWonCelebrationOpp(updated);
    playWonFanfare();
    setConversionSuccessMessage('🎉 ¡FIESTA TOTAL EN LA COLONIA! ¡Propuesta GANADA! Revisa los gates de formalización (Contrato/Anticipo) en Documentos para habilitar la conversión a Proyecto.', {
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

  // Solicitud de ajustes (V2) modal confirmation
  const [showAdjustmentsModal, setShowAdjustmentsModal] = useState<boolean>(false);

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

  // Active quote inside the selected opportunity
  const [activeQuoteId, setActiveQuoteId] = useState<string>(
    activeOpp?.quotes[0]?.id || ''
  );

  const activeQuote =
    activeOpp?.quotes.find((q) => q.id === activeQuoteId) || activeOpp?.quotes[0];

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
  const assignedLeadUser = useMemo(() => {
    return users.find((u) => u.id === activeOpp?.leadUserId);
  }, [activeOpp?.leadUserId, users]);

  const currentLeadDisplayName = useMemo(() => {
    return (
      assignedLeadUser?.name ||
      activeOpp?.leadUserName?.split('·')[0]?.trim() ||
      'Sin asignar'
    );
  }, [assignedLeadUser, activeOpp?.leadUserName]);

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
  const canConvertToProject = isWon && isFormalizationGatesMet;

  // Handle updating administrative checklist directly
  const handleUpdateAdminChecklist = (patch: Partial<AdministrativeChecklist>) => {
    if (!activeOpp) return;
    const currentChecklist: AdministrativeChecklist = activeOpp.administrativeChecklist || {
      rutStatus: 'pending',
      idCardStatus: 'pending',
      billingEmail: activeOpp.contactEmail || '',
      alegraCreated: false,
      responsibleName: 'Vivian'
    };
    const updatedOpp: NewBusinessOpportunity = {
      ...activeOpp,
      administrativeChecklist: { ...currentChecklist, ...patch },
      updatedAt: new Date().toISOString()
    };
    onUpdateOpportunity(updatedOpp);
  };

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

  // Handle saving SOW data
  const handleSaveSowData = (sowData: SowDocumentData) => {
    if (!activeOpp) return;
    const updatedOpp: NewBusinessOpportunity = {
      ...activeOpp,
      sowData,
      updatedAt: new Date().toISOString()
    };
    onUpdateOpportunity(updatedOpp);
  };

  // Handle updating a quote within the current opportunity
  const handleUpdateQuote = (updatedQuote: QuoteProposal) => {
    if (!activeOpp) return;
    const updatedQuotes = activeOpp.quotes.map((q) =>
      q.id === updatedQuote.id ? updatedQuote : q
    );
    const updatedOpp: NewBusinessOpportunity = {
      ...activeOpp,
      quotes: updatedQuotes,
      updatedAt: new Date().toISOString()
    };
    onUpdateOpportunity(updatedOpp);
  };

  // Handle creating a new version of quote within current opportunity
  const handleCreateNewQuoteVersion = (baseQuote?: QuoteProposal) => {
    if (!activeOpp) return;
    const nextOrder = activeOpp.quotes.length + 1;
    const newQuoteId = `quote-${activeOpp.id}-v${nextOrder}-${Date.now()}`;

    let newQuote: QuoteProposal;
    if (baseQuote) {
      // Clone from base quote
      newQuote = {
        ...baseQuote,
        id: newQuoteId,
        versionLabel: `V${nextOrder} - Alternativa basada en ${baseQuote.versionLabel.split(' - ')[0]}`,
        order: nextOrder,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deliverables: baseQuote.deliverables.map((d, dIdx) => ({
          ...d,
          id: `qdel-${newQuoteId}-${dIdx}`,
          quoteId: newQuoteId,
          roleBudgets: d.roleBudgets.map((rb) => ({ ...rb })),
          backlogItems: d.backlogItems.map((b, bIdx) => ({
            ...b,
            id: `act-${newQuoteId}-${dIdx}-${bIdx}`,
            quoteDeliverableId: `qdel-${newQuoteId}-${dIdx}`
          }))
        }))
      };
    } else {
      // Empty new version
      newQuote = {
        id: newQuoteId,
        opportunityId: activeOpp.id,
        versionLabel: `V${nextOrder} - Nueva Versión`,
        order: nextOrder,
        status: 'draft',
        totalHoursRollup: 0,
        currency: 'COP',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deliverables: []
      };
    }

    const updatedOpp: NewBusinessOpportunity = {
      ...activeOpp,
      quotes: [...activeOpp.quotes, newQuote],
      updatedAt: new Date().toISOString()
    };

    onUpdateOpportunity(updatedOpp);
    setActiveQuoteId(newQuote.id);
  };

  // Callback when a new opportunity is created
  const handleCreatedOpportunity = (newOpp: NewBusinessOpportunity) => {
    onCreateOpportunity(newOpp);
    setSelectedOppId(newOpp.id);
    setActiveQuoteId(newOpp.quotes[0]?.id || '');
    setActiveTab('scoping');
  };

  // Handle conversion confirmation
  const handleConfirmConversion = (payload: {
    projectName: string;
    projectType: ProjectType;
    leadName: string;
    startDate: string;
    endDate?: string;
  }) => {
    if (!activeOpp || !activeQuote) return;
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
      message: `🎉 ¡"${payload.projectName}" ha sido aprobado y formalizado exitosamente como Proyecto en Orbit!`,
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
    const h = o.quotes[0]?.totalHoursRollup || 0;
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
                <button
                  type="button"
                  onClick={() => onNavigateToView('proyectos', activeOpp?.convertedProjectId || undefined)}
                  className="px-3 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  Ver en Proyectos →
                </button>
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
              Dimensionamiento técnico, cotizaciones, SOW y transición a proyectos
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
                    El espacio donde los líderes dimensionan técnicamente las oportunidades recibidas de Comercial (briefs), construyen entregables y actividades, generan cotizaciones, gestionan el SOW formal y habilitan la transición a Proyectos.
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
                    <th className="py-3 px-4">Líder de Alcance</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Tiempo / SLA</th>
                    <th className="py-3 px-4">Próxima Acción</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredOpps.map((opp) => {
                    const isWon = opp.status === 'won';
                    const mainQuote = opp.quotes[0];
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
                          setActiveQuoteId(opp.quotes[0]?.id || '');
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
                              {(opp.leadUserName || 'PL').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-[#334155] text-xs">
                              {opp.leadUserName?.split('·')[0]?.trim() || 'Product Lead'}
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
                                setActiveQuoteId(opp.quotes[0]?.id || '');
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
              const mainQuote = opp.quotes[0];
              const totalHours = mainQuote?.totalHoursRollup || 0;
              const isWon = opp.status === 'won';

              return (
                <div
                  key={opp.id}
                  onClick={() => {
                    setSelectedOppId(opp.id);
                    setActiveQuoteId(opp.quotes[0]?.id || '');
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
                        <span>Líder de alcance: <strong className="text-[#0f172a]">{opp.leadUserName || 'Product Lead'}</strong></span>
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
              <button
                type="button"
                onClick={() => onNavigateToView('proyectos', activeOpp.convertedProjectId || undefined)}
                className="px-3 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                Ver en Proyectos →
              </button>
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
                Líder de alcance:{' '}
                <strong className="text-[#0f172a]">{currentLeadDisplayName}</strong>
              </span>
              {canEditOpp && users.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsReassigningLead(!isReassigningLead)}
                  className="text-[10px] text-[#501f92] hover:underline font-bold ml-1 cursor-pointer"
                  title="Reasignar líder de alcance"
                >
                  (Reasignar)
                </button>
              )}

              {/* Popover reasignar líder (1 líder con persistencia real en leadUserId) */}
              {isReassigningLead && (
                <div className="absolute top-6 left-0 z-30 bg-white rounded-xl shadow-xl border border-[#cbd5e1] p-3 w-64 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-[#f1f5f9]">
                    <span className="text-[11px] font-bold text-[#0f172a] block">
                      Reasignar Líder de Alcance:
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
                    Selecciona el líder de alcance responsable del dimensionamiento:
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {users.map((u) => {
                      const isSelected = activeOpp?.leadUserId === u.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            const updated: NewBusinessOpportunity = {
                              ...activeOpp,
                              leadUserId: u.id,
                              leadUserName: u.name,
                              leadUserIds: [u.id],
                              updatedAt: new Date().toISOString()
                            };
                            onUpdateOpportunity(updated);
                            setIsReassigningLead(false);
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
              <span>SLA Handoff: <strong className="text-[#0f172a]">~{activeOpp.handoffHours || 36}h</strong></span>
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

          {activeOpp.driveFolderUrl && (
            <a
              href={activeOpp.driveFolderUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc] text-xs font-bold transition-colors"
            >
              <Folder className="w-3.5 h-3.5 text-[#501f92]" />
              <span>Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {activeOpp.convertedProjectId ? (
            onNavigateToView && (
              <button
                type="button"
                onClick={() => onNavigateToView('proyectos', activeOpp.convertedProjectId)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-bold text-[#0f172a] transition-colors cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-[#10b981]" />
                <span>Ver en Proyectos →</span>
              </button>
            )
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {!isWon ? (
                <>
                  <span
                    className="text-[10px] text-[#64748b] bg-[#f8fafc] px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] font-medium flex items-center gap-1.5"
                    title="La conversión a Proyecto requiere que el Deal alcance el estado Cerrado Ganado en HubSpot"
                  >
                    <Lock className="w-3 h-3 text-[#94a3b8]" />
                    <span>HubSpot: Pendiente Cerrado Ganado</span>
                  </span>

                  {canSimulateWon && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated: NewBusinessOpportunity = {
                          ...activeOpp,
                          status: 'won',
                          hubspotDealStage: 'closedwon',
                          updatedAt: new Date().toISOString()
                        };
                        onUpdateOpportunity(updated);
                        setBannerNotification({
                          message: 'ℹ️ Simulación (Fallback Demo): Deal actualizado localmente a "Cerrado Ganado". Ahora puedes convertir la oportunidad a Proyecto.',
                          showProjectLink: false
                        });
                        setTimeout(() => setBannerNotification(null), 6000);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] text-xs font-semibold text-[#475569] transition-all cursor-pointer shadow-2xs"
                      title="Acción exclusiva de demo/entornos no productivos: simula la sincronización de HubSpot como 'Cerrado Ganado'"
                    >
                      <Trophy className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>Simular Cerrado Ganado (Demo)</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <span className="text-[10px] text-[#047857] bg-[#ecfdf5] px-2.5 py-1.5 rounded-xl border border-[#a7f3d0] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                    <span>HubSpot: Cerrado Ganado</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsConvertModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs bg-[#10b981] hover:bg-[#059669] text-white cursor-pointer shadow-sm"
                    title="Convertir propuesta formalizada a Proyecto y tareas operativas en Orbit"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Convertir a Proyecto</span>
                  </button>
                </>
              )}

              {isWon && !isFormalizationGatesMet && (
                <button
                  type="button"
                  onClick={() => setActiveTab('documentos')}
                  className="text-[10px] text-[#c2410c] bg-[#fff7ed] hover:bg-[#ffedd5] px-2 py-1 rounded-lg border border-[#fed7aa] font-bold cursor-pointer"
                  title="Revisar condiciones de inicio en Documentos"
                >
                  ⚠️ Condiciones ({[!contractGatePassed ? 'Contrato' : null, !downPaymentGatePassed ? 'Anticipo' : null].filter(Boolean).join(' + ')})
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

        <button
          type="button"
          onClick={() => setActiveTab('documentos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'documentos'
              ? 'bg-white text-[#501f92] shadow-xs'
              : 'text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Documentos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('historial')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'historial'
              ? 'bg-white text-[#501f92] shadow-xs'
              : 'text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Historial ({activeOpp.quotes.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RESUMEN / BRIEF */}
      {/* ========================================================================= */}
      {activeTab === 'resumen' && activeQuote && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Tarjeta de Preventa & Time Tracking Interno (UHURA Group / New Business) */}
          <div className="bg-gradient-to-br from-[#140b24] via-[#241142] to-[#501f92] text-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 text-[#d4ff4a] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-white">Tiempo de Preventa & Scoping</h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#d4ff4a] text-[#0f172a]">
                      UHURA Group / New Business
                    </span>
                  </div>
                  <p className="text-xs text-white/75">
                    Imputación interna de horas al proyecto de prospección comercial
                  </p>
                </div>
              </div>

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
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                    isScopingTimerRunning
                      ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white animate-pulse'
                      : 'bg-[#d4ff4a] hover:bg-[#bceb34] text-[#0f172a]'
                  }`}
                  title="Grabar horas de preventa imputadas a UHURA Group / New Business"
                >
                  <Play className={`w-3.5 h-3.5 ${isScopingTimerRunning ? 'fill-current' : ''}`} />
                  <span>{isScopingTimerRunning ? 'Detener Timer Preventa' : 'Iniciar Timer Preventa'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-white/70 block">Tarea Interna Ligada</span>
                <span className="font-bold text-xs text-white truncate block" title={scopingTask?.title || `Scoping · ${activeOpp.prospectAccountName} · ${activeOpp.title}`}>
                  {scopingTask?.title || `Scoping · ${activeOpp.prospectAccountName} · ${activeOpp.title}`}
                </span>
                <span className="text-[10px] text-[#d4ff4a] font-mono">Proyecto: Comercial & Prospección</span>
              </div>

              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-white/70 block">Líder de Alcance</span>
                <span className="font-bold text-xs text-white block">
                  {currentLeadDisplayName}
                </span>
                <span className="text-[10px] text-white/70">SLA Handoff: ~{activeOpp.handoffHours || 36}h</span>
              </div>

              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-white/70 block">Horas Preventa Invertidas</span>
                <span className="text-xl font-extrabold text-[#d4ff4a] block font-mono">
                  {preventaHoursLogged.toFixed(1)} h
                </span>
                <span className="text-[10px] text-white/70">Costo interno de adquisición</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 space-y-1.5">
              <span className="font-bold text-white text-[11px] block">
                ¿Qué actividades de preventa cubre esta tarea interna?
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10.5px] text-white/75">
                <div className="flex items-center gap-1.5"><span>•</span><span>1. Revisar brief y Drive</span></div>
                <div className="flex items-center gap-1.5"><span>•</span><span>2. Discovery con cliente</span></div>
                <div className="flex items-center gap-1.5"><span>•</span><span>3. Agente de propuestas</span></div>
                <div className="flex items-center gap-1.5"><span>•</span><span>4. Pulir presentación comercial</span></div>
                <div className="flex items-center gap-1.5"><span>•</span><span>5. Scoping backlog y horas</span></div>
                <div className="flex items-center gap-1.5"><span>•</span><span>6. Revisión interna comercial</span></div>
                <div className="flex items-center gap-1.5"><span>•</span><span>7. Presentación al cliente</span></div>
                <div className="flex items-center gap-1.5"><span>•</span><span>8. Negociación y versión V2</span></div>
              </div>
              <div className="pt-1.5 border-t border-white/10 text-[10px] text-[#d4ff4a] flex items-center justify-between flex-wrap gap-1">
                <span>
                  🔒 <strong>Separación estricta de costos:</strong> Las horas de preventa se imputan a UHURA Group y nunca se mezclan ni descuentan de las horas cotizadas del proyecto.
                </span>
                {activeOpp.status === 'won' && (
                  <span className="font-bold bg-white/15 px-2 py-0.5 rounded text-white">
                    Métrica comercial: {preventaHoursLogged.toFixed(1)}h preventa / {activeQuote.totalHoursRollup}h vendidas
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Fila 1: Tarjeta de Información General y Enlaces Externos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Columna Izquierda: Datos del Prospecto & Contacto */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider">
                    Información del Prospecto
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Entrada comercial registrada para dimensionamiento
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#f1f5f9] text-[#475569]">
                  ID: {activeOpp.id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                  <span className="text-[10px] uppercase font-bold text-[#64748b] block">Empresa</span>
                  <span className="font-bold text-xs text-[#0f172a] truncate block">{activeOpp.prospectAccountName}</span>
                </div>

                <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                  <span className="text-[10px] uppercase font-bold text-[#64748b] block">Contacto</span>
                  <span className="font-medium text-xs text-[#0f172a] truncate block">
                    {activeOpp.contactName || 'No asignado'}
                  </span>
                </div>

                <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                  <span className="text-[10px] uppercase font-bold text-[#64748b] block">Líder de Alcance</span>
                  <span className="font-bold text-xs text-[#501f92] truncate block">
                    {activeOpp.leadUserName || 'Product Lead'}
                  </span>
                </div>

                <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                  <span className="text-[10px] uppercase font-bold text-[#64748b] block">Responsable Comercial</span>
                  <span className="font-bold text-xs text-[#0f172a] truncate block">
                    {activeOpp.commercialOwner || 'Comercial'}
                  </span>
                </div>
              </div>

              {/* Links de Integración Externa (HubSpot, Drive, Brief) */}
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-bold text-[#475569] block">
                  Conexiones & Archivos Externos:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {activeOpp.hubspotDealUrl ? (
                    <a
                      href={activeOpp.hubspotDealUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fff7ed] border border-[#fed7aa] text-xs font-bold text-[#c2410c] hover:bg-[#ffedd5] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver Deal en HubSpot</span>
                    </a>
                  ) : activeOpp.hubspotDealId ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-mono text-[#0284c7]">
                      HubSpot ID: {activeOpp.hubspotDealId}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#94a3b8] italic">
                      Sin enlace a HubSpot registrado
                    </span>
                  )}

                  {activeOpp.briefUrl && (
                    <a
                      href={activeOpp.briefUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] text-xs font-bold text-[#1d4ed8] hover:bg-[#dbeafe] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver Brief en Google Drive</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTab('documentos')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] text-xs font-bold text-[#501f92] hover:bg-[#f3e8ff] transition-colors cursor-pointer"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>Ver Carpeta de Documentos</span>
                  </button>
                </div>
              </div>

              {/* Resumen del Brief & Requerimientos */}
              <div className="pt-2 border-t border-[#e2e8f0] space-y-2">
                <span className="text-xs font-bold text-[#0f172a] block">
                  Resumen de Requerimientos / Discovery:
                </span>
                <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">
                  {activeOpp.briefSummary || activeOpp.discoveryNotes || 'Sin notas registradas aún. El líder técnico puede comenzar el scoping en la pestaña "Alcance & Backlog".'}
                </div>
              </div>
            </div>

            {/* Columna Derecha: Condiciones para Iniciar & Flujo de Formalización */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#501f92]" />
                    <span>Condiciones para Iniciar</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f1f5f9] text-[#475569]">
                    Gates de Entrada
                  </span>
                </div>

                <p className="text-xs text-[#64748b]">
                  Configurables por proyecto. Evitan bloqueos arbitrarios si es fee mensual o si la facturación en Alegra se realiza después.
                </p>

                {/* Checklist interactivo de condiciones */}
                <div className="space-y-2.5 pt-1 text-xs">
                  {/* Gate 1: SOW / Contrato firmado */}
                  <label className="p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-2 cursor-pointer hover:bg-white transition-colors">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeOpp.startConditions?.contractSignedCompleted || false}
                        onChange={(e) =>
                          handleUpdateStartConditions({ contractSignedCompleted: e.target.checked })
                        }
                        className="rounded text-[#501f92] focus:ring-[#501f92]"
                      />
                      <div>
                        <span className="font-bold text-[#0f172a] block">SOW / Contrato Firmado</span>
                        <span className="text-[10px] text-[#64748b]">Obligatorio antes de arrancar</span>
                      </div>
                    </div>
                    {activeOpp.startConditions?.contractSignedCompleted ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981]">
                        Listo
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f59e0b]/15 text-[#b45309]">
                        Pendiente
                      </span>
                    )}
                  </label>

                  {/* Gate 2: Anticipo recibido */}
                  <label className="p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-2 cursor-pointer hover:bg-white transition-colors">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeOpp.startConditions?.downPaymentReceived || false}
                        onChange={(e) =>
                          handleUpdateStartConditions({ downPaymentReceived: e.target.checked })
                        }
                        className="rounded text-[#501f92] focus:ring-[#501f92]"
                      />
                      <div>
                        <span className="font-bold text-[#0f172a] block">Anticipo Recibido</span>
                        <span className="text-[10px] text-[#64748b]">
                          {activeOpp.startConditions?.downPaymentRequired === 'required'
                            ? '50% para proyectos de alcance cerrado'
                            : 'No aplica / Fee mensual'}
                        </span>
                      </div>
                    </div>
                    {activeOpp.startConditions?.downPaymentReceived ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981]">
                        Recibido
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f59e0b]/15 text-[#b45309]">
                        Por cobrar
                      </span>
                    )}
                  </label>

                  {/* Gate 3: Docs Fiscales */}
                  <div className="p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-[#0f172a] block">Documentación Fiscal (Alegra)</span>
                      <span className="text-[10px] text-[#64748b]">
                        RUT y Cédula (no frenan kick-off operativo)
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        activeOpp.administrativeChecklist?.rutStatus === 'received'
                          ? 'bg-[#10b981]/15 text-[#10b981]'
                          : 'bg-[#64748b]/15 text-[#64748b]'
                      }`}
                    >
                      {activeOpp.administrativeChecklist?.rutStatus === 'received' ? 'Recibidos' : 'En trámite'}
                    </span>
                  </div>

                  {/* Gate 4: Onboarding inicial */}
                  <label className="p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-2 cursor-pointer hover:bg-white transition-colors">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeOpp.startConditions?.onboardingCompleted || false}
                        onChange={(e) =>
                          handleUpdateStartConditions({ onboardingCompleted: e.target.checked })
                        }
                        className="rounded text-[#501f92] focus:ring-[#501f92]"
                      />
                      <div>
                        <span className="font-bold text-[#0f172a] block">Onboarding Realizado</span>
                        <span className="text-[10px] text-[#64748b]">Kick-off con el equipo y cliente</span>
                      </div>
                    </div>
                    {activeOpp.startConditions?.onboardingCompleted ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981]">
                        Hecho
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#64748b]/15 text-[#64748b]">
                        Pendiente
                      </span>
                    )}
                  </label>
                </div>
              </div>

              {/* Botones de acción rápida */}
              <div className="pt-3 border-t border-[#e2e8f0] space-y-2">

                {activeOpp.convertedProjectId ? (
                  onNavigateToView && (
                    <button
                      type="button"
                      onClick={() => onNavigateToView('proyectos', activeOpp.convertedProjectId)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] text-xs font-bold transition-colors cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4 text-[#10b981]" />
                      <span>Ver Proyecto en Orbit</span>
                    </button>
                  )
                ) : isWon ? (
                  <button
                    type="button"
                    onClick={() => setIsConvertModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs bg-[#10b981] hover:bg-[#059669] text-white cursor-pointer"
                    title="Convertir propuesta ganada a Proyecto y tareas operativas en Orbit"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Convertir a Cliente & Proyecto</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#475569]">
                      <Lock className="w-3.5 h-3.5 text-[#94a3b8]" />
                      <span>Conversión sujeta a cierre comercial</span>
                    </div>
                    <p className="text-[11px] text-[#64748b] leading-tight">
                      HubSpot es la fuente de verdad comercial. La conversión a Proyecto se habilita al pasar el Deal a <strong>Cerrado Ganado</strong>.
                    </p>
                    {canSimulateWon ? (
                      <button
                        type="button"
                        onClick={() => {
                          const updated: NewBusinessOpportunity = {
                            ...activeOpp,
                            status: 'won',
                            hubspotDealStage: 'closedwon',
                            updatedAt: new Date().toISOString()
                          };
                          onUpdateOpportunity(updated);
                          setConversionSuccessMessage(
                            'ℹ️ Simulación (Fallback Demo): Deal actualizado a "Cerrado Ganado". Ahora puedes convertir la oportunidad a Proyecto.',
                            { timeoutMs: 6000 }
                          );
                        }}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] text-[11px] font-semibold text-[#475569] transition-all cursor-pointer shadow-2xs"
                        title="Acción exclusiva de demo/entornos no productivos: simula el cierre ganado de HubSpot"
                      >
                        <Trophy className="w-3.5 h-3.5 text-[#10b981]" />
                        <span>Simular 'Cerrado Ganado' en HubSpot (Demo)</span>
                      </button>
                    ) : isHubspotRealConnected ? (
                      <p className="text-[10px] text-[#047857] bg-[#ecfdf5] p-2 rounded-lg border border-[#a7f3d0]">
                        Sincronización activa con HubSpot: el estado cambiará automáticamente cuando el deal sea marcado como Closed Won en el CRM.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bloque de Negociación y Resultado de Propuesta */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#501f92]/10 text-[#501f92]">
                  <TrendingUp className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider">
                    Presentación & Negociación Comercial
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Gobernanza del ciclo: Líder presenta solución técnica, Comercial comunica precio y condiciones
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f1f5f9] text-[#475569]">
                {activeQuote.versionLabel} · {activeQuote.totalHoursRollup}h cotizadas
              </span>
            </div>

            <div className="p-4 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-[#64748b] block font-medium">Estado Comercial Actual:</span>
                <span className="font-extrabold text-sm text-[#0f172a]">
                  {activeOpp.status === 'won'
                    ? '✅ Propuesta Ganada (Lista para formalizar y crear proyecto)'
                    : activeOpp.status === 'negotiation'
                    ? '🟡 En Negociación con el Cliente'
                    : activeOpp.status === 'proposal_sent'
                    ? '📤 Propuesta Presentada · Esperando respuesta del cliente'
                    : activeOpp.status === 'internal_review'
                    ? '🔍 Alcance listo · En revisión de pricing y margen'
                    : '📝 En Scoping Técnico (Líder dimensionando backlog)'}
                </span>
              </div>

              {/* Acciones de Negociación */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const updated: NewBusinessOpportunity = {
                      ...activeOpp,
                      status: 'proposal_sent',
                      updatedAt: new Date().toISOString()
                    };
                    onUpdateOpportunity(updated);
                    setConversionSuccessMessage('Propuesta marcada como presentada al cliente.');
                    setTimeout(() => setConversionSuccessMessage(null), 3500);
                  }}
                  className="px-3 py-2 rounded-xl border border-[#cbd5e1] bg-white hover:bg-[#f1f5f9] text-xs font-bold text-[#475569] transition-colors cursor-pointer"
                >
                  Esperando respuesta
                </button>

                <button
                  type="button"
                  onClick={() => setShowAdjustmentsModal(true)}
                  className="px-3 py-2 rounded-xl border border-[#fed7aa] bg-[#fff7ed] hover:bg-[#ffedd5] text-xs font-bold text-[#c2410c] transition-colors cursor-pointer shadow-2xs"
                  title="Abre confirmación para crear V2 clonando V1 o mantener en negociación"
                >
                  Solicitó ajustes
                </button>

                <button
                  type="button"
                  onClick={() => handleMarkOpportunityWon(activeOpp)}
                  className="px-3.5 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4 text-[#d4ff4a]" />
                  <span>Ganada</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLossModalOpen(true)}
                  className="px-3 py-2 rounded-xl border border-[#fecaca] bg-[#fef2f2] hover:bg-[#fee2e2] text-xs font-bold text-[#dc2626] transition-colors cursor-pointer"
                >
                  Perdida
                </button>
              </div>
            </div>
          </div>

          {/* Fila 2: Resumen rápido de la cotización actual */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider">
                  Dimensionamiento Actual ({activeQuote.versionLabel})
                </h3>
                <p className="text-xs text-[#64748b]">
                  {activeQuote.deliverables.length} servicio(s) · {activeQuote.totalHoursRollup} horas presupuestadas
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('scoping')}
                  className="px-3 py-1.5 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-bold text-[#0f172a] transition-colors cursor-pointer"
                >
                  Editar Alcance →
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cotizacion')}
                  className="px-3 py-1.5 rounded-lg bg-[#501f92] hover:bg-[#3d1572] text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5 text-[#d4ff4a]" />
                  <span>Ver Cotización & Pricing →</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {activeQuote.deliverables.map((del) => {
                const totalH = del.backlogItems.reduce(
                  (s, it) => s + (Number(it.estimatedHours) || 0),
                  0
                );
                return (
                  <div key={del.id} className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                    <span className="font-bold text-xs text-[#0f172a] block truncate">{del.name}</span>
                    <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                      <span>{del.backlogItems.length} actividades</span>
                      <span className="font-mono font-bold text-[#501f92]">{totalH}h</span>
                    </div>
                  </div>
                );
              })}
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
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 sm:p-5 shadow-2xs space-y-4">
            {/* Encabezado con Identificación del Líder y Tipo de Proyecto */}
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9] flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#501f92]/10 text-[#501f92]">
                  <Layers className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Alcance Técnico & Estimación
                </h3>
              </div>

              {/* Selector de Tipo de Proyecto (Proyecto Único vs Fee Mensual) */}
              <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                <span>Modelo:</span>
                <select
                  value={activeOpp.projectType || 'fixed_project'}
                  onChange={(e) => {
                    const newType = e.target.value as ProjectType;
                    onUpdateOpportunity({
                      ...activeOpp,
                      projectType: newType,
                      updatedAt: new Date().toISOString()
                    });
                  }}
                  className="font-bold text-[#0f172a] bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-2.5 py-1 text-xs cursor-pointer outline-hidden hover:border-[#501f92] transition-colors"
                >
                  <option value="fixed_project">Proyecto Único (One-Shot)</option>
                  <option value="fee_monthly">Fee Mensual Recurrente</option>
                </select>
              </div>
            </div>

            {/* Insumos del Líder: 1. Propuesta/Presentación (PPT de Drive) + 2. Duración en Semanas */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs">
              {/* 1. Propuesta / Presentación (Google Drive / Slides) */}
              <div className="md:col-span-7 space-y-1">
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

              {/* 2. Duración en Semanas y Días Hábiles (Solo para Proyecto Único) */}
              <div className="md:col-span-5 space-y-1">
                {(!activeOpp.projectType || activeOpp.projectType === 'fixed_project') ? (
                  <>
                    <label className="font-semibold text-[#475569] flex items-center justify-between">
                      <span>Duración estimada</span>
                      {(activeQuote.estimatedWeeks ?? activeQuote.financialConfig?.projectDurationWeeks) ? (
                        <span className="text-[10px] font-medium text-[#047857] bg-[#ecfdf5] px-2 py-0.5 rounded-md border border-[#a7f3d0]">
                          ~{((activeQuote.estimatedWeeks ?? activeQuote.financialConfig?.projectDurationWeeks ?? 0) * 5)} días hábiles
                        </span>
                      ) : null}
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="1"
                        max="52"
                        step="1"
                        value={activeQuote.estimatedWeeks ?? activeQuote.financialConfig?.projectDurationWeeks ?? ''}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                          handleUpdateQuote({
                            ...activeQuote,
                            estimatedWeeks: val,
                            financialConfig: {
                              ...activeQuote.financialConfig,
                              projectDurationWeeks: val
                            }
                          });
                        }}
                        placeholder="Ej: 4"
                        className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] font-bold text-xs text-[#0f172a] placeholder:text-[#94a3b8] placeholder:font-normal focus:ring-1 focus:ring-[#501f92] focus:border-[#501f92]"
                      />
                      <span className="absolute right-3 text-xs text-[#64748b]">
                        semanas
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="p-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[11px] text-[#64748b] flex items-center gap-1.5 h-[38px] mt-4">
                    <Clock className="w-3.5 h-3.5 text-[#501f92] shrink-0" />
                    <span className="truncate">Fee Mensual Recurrente · Sin semanas fijas</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fila 3: Barra de acciones pulida */}
            <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between flex-wrap gap-2.5">
              {/* Selector de Versión de Cotización */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#64748b]">Versión:</span>
                <select
                  value={activeQuote.id}
                  onChange={(e) => setActiveQuoteId(e.target.value)}
                  className="text-xs font-bold text-[#0f172a] bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#501f92] cursor-pointer"
                >
                  {activeOpp.quotes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.versionLabel} ({q.totalHoursRollup}h)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleCreateNewQuoteVersion(activeQuote)}
                  className="p-1.5 rounded-lg border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-[#475569] hover:text-[#501f92] transition-colors cursor-pointer"
                  title="Duplicar este alcance para crear una versión alternativa"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Acciones: Guardar y Marcar alcance listo */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateQuote(activeQuote);
                    setConversionSuccessMessage('Alcance técnico guardado.');
                    setTimeout(() => setConversionSuccessMessage(null), 3000);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#475569] transition-colors cursor-pointer"
                >
                  Guardar
                </button>

                {(() => {
                  const isPptFilled = Boolean(activeQuote.commercialProposalUrl && activeQuote.commercialProposalUrl.trim().length > 5);
                  const isWeeksFilled = activeOpp.projectType === 'fee_monthly' || Boolean((activeQuote.estimatedWeeks ?? activeQuote.financialConfig?.projectDurationWeeks ?? 0) > 0);
                  const isScopeFilled = activeQuote.totalHoursRollup > 0 && activeQuote.deliverables.length > 0;
                  const isReadyToMark = isPptFilled && isWeeksFilled && isScopeFilled;

                  return (
                    <button
                      type="button"
                      onClick={() => {
                        const updatedOpp: NewBusinessOpportunity = {
                          ...activeOpp,
                          status: 'internal_review',
                          updatedAt: new Date().toISOString()
                        };
                        onUpdateOpportunity(updatedOpp);
                        setConversionSuccessMessage(
                          `Alcance técnico listo (${activeQuote.totalHoursRollup}h). Notificación enviada a Comercial.`,
                          {
                            showProjectLink: false,
                            timeoutMs: 7000
                          }
                        );
                      }}
                      disabled={!isReadyToMark}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isReadyToMark
                          ? 'bg-[#501f92] hover:bg-[#3d1572] text-white shadow-xs cursor-pointer'
                          : 'bg-[#f1f5f9] text-[#94a3b8] border border-[#e2e8f0] cursor-not-allowed'
                      }`}
                      title={
                        isReadyToMark
                          ? 'Marcar que el dimensionamiento técnico está listo para Comercial'
                          : 'Diligencia Propuesta (Drive), Semanas y Alcance para habilitar'
                      }
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Marcar alcance listo ({activeQuote.totalHoursRollup}h)</span>
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Hint sutil solo si falta algo */}
            {(() => {
              const isPptFilled = Boolean(activeQuote.commercialProposalUrl && activeQuote.commercialProposalUrl.trim().length > 5);
              const isWeeksFilled = activeOpp.projectType === 'fee_monthly' || Boolean((activeQuote.estimatedWeeks ?? activeQuote.financialConfig?.projectDurationWeeks ?? 0) > 0);
              const isScopeFilled = activeQuote.totalHoursRollup > 0 && activeQuote.deliverables.length > 0;
              const isReadyToMark = isPptFilled && isWeeksFilled && isScopeFilled;

              if (isReadyToMark) return null;

              return (
                <div className="text-[11px] text-[#b45309] bg-[#fffbeb] px-3 py-2 rounded-lg border border-[#fef3c7] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                  <span>
                    Pendiente para marcar listo:{' '}
                    {!isPptFilled && <span className="font-semibold mr-1">• Link Drive</span>}
                    {!isWeeksFilled && <span className="font-semibold mr-1">• Semanas</span>}
                    {!isScopeFilled && <span className="font-semibold mr-1">• Horas en alcance</span>}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Scoper Operativo de Backlog (Frentes, Entregables y Actividades) */}
          <BacklogScoper
            quote={activeQuote}
            allQuotes={activeOpp.quotes}
            opportunityTitle={activeOpp.title}
            prospectName={activeOpp.prospectAccountName}
            onSelectQuoteVersion={(quoteId) => setActiveQuoteId(quoteId)}
            onCreateNewQuoteVersion={(baseQuote) => handleCreateNewQuoteVersion(baseQuote)}
            templates={templates}
            onUpdateQuote={handleUpdateQuote}
            onGoToCalculator={() => setActiveTab('cotizacion')}
            onMarkScopeReady={(totalHours) => {
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
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Tarjeta de Insumos Recibidos del Líder */}
          <div className="bg-gradient-to-br from-[#140b24] via-[#241142] to-[#501f92] text-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#d4ff4a] bg-white/10 px-2.5 py-1 rounded-md">
                    Insumos Técnicos del Líder
                  </span>
                  <span className="text-xs text-white/70">
                    Líder: <strong className="text-white">{activeOpp.leadUserName || 'Líder de Alcance'}</strong>
                  </span>
                  <span className="text-xs text-white/70">
                    Versión: <strong className="text-white">{activeQuote.versionLabel}</strong>
                  </span>
                </div>
                <h2 className="text-lg font-black text-white mt-1">
                  Cotización Comercial & Pricing en Finanzas
                </h2>
                <p className="text-xs text-white/80 max-w-2xl mt-1">
                  Usa las horas totales y semanas estimadas por el líder para calcular el precio en la calculadora oficial de Google Sheets. Luego registra el valor oficial acordado aquí en Orbit.
                </p>
              </div>

              {activeQuote.commercialProposalUrl && (
                <a
                  href={activeQuote.commercialProposalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#d4ff4a]" />
                  <span>Ver Propuesta del Líder</span>
                </a>
              )}
            </div>

            {/* Métricas clave que Comercial ingresa a la calculadora */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-white/60 block">Total Horas</span>
                <div className="text-xl font-black text-[#d4ff4a]">
                  {activeQuote.totalHoursRollup}h
                </div>
                <span className="text-[10px] text-white/70">
                  {activeQuote.deliverables.reduce((acc, d) => acc + d.backlogItems.length, 0)} actividades
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-white/60 block">Duración Estimada</span>
                <div className="text-xl font-black text-white">
                  {activeQuote.estimatedWeeks ?? activeQuote.financialConfig?.projectDurationWeeks ?? 0} sem
                </div>
                <span className="text-[10px] text-white/70">
                  ~{((activeQuote.estimatedWeeks ?? activeQuote.financialConfig?.projectDurationWeeks ?? 0) * 5)} días hábiles
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-white/60 block">Modelo de Negocio</span>
                <div className="text-sm font-bold text-white mt-1">
                  {activeOpp.projectType === 'fee_monthly' ? 'Fee Mensual' : 'Proyecto Único'}
                </div>
                <span className="text-[10px] text-white/70">
                  {activeOpp.projectType === 'fee_monthly' ? 'Recurrente' : 'Alcance cerrado'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-white/60 block">Owner Comercial</span>
                <div className="text-sm font-bold text-[#d4ff4a] mt-1">
                  {activeOpp.commercialOwner || 'Catalina / Luisa'}
                </div>
                <span className="text-[10px] text-white/70">
                  Negociación y cierre
                </span>
              </div>
            </div>
          </div>

          {/* Formulario Comercial: Sheet de Finanzas, Valor Cotizado, Condiciones */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-2xs space-y-5">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-[#f1f5f9]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#10b981]/10 text-[#10b981]">
                    <DollarSign className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold text-[#0f172a]">
                    Registro de Acuerdo Comercial & Pricing Oficial
                  </h3>
                </div>
                <p className="text-xs text-[#64748b] mt-1">
                  Finanzas / Google Sheet Oficial es la fuente de verdad del pricing. Orbit registra el resultado acordado para gobernanza, SOW y conversión a proyecto.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#501f92]/10 text-[#501f92]">
                  {activeQuote.versionLabel}
                </span>
                {activeOpp.hubspotDealStage && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]">
                    HubSpot: {activeOpp.hubspotDealStage}
                  </span>
                )}
              </div>
            </div>

            {/* Grid: Sheet de Finanzas + Valor Cotizado + Moneda */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Enlace a Sheet oficial de Finanzas */}
              <div className="space-y-1 lg:col-span-1">
                <label className="font-bold text-[#475569] flex items-center justify-between">
                  <span>Sheet oficial de Finanzas: <span className="text-red-500">*</span></span>
                  {activeQuote.externalFinanceSheetUrl && (
                    <a
                      href={activeQuote.externalFinanceSheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#501f92] hover:underline flex items-center gap-0.5"
                    >
                      <span>Abrir Sheet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </label>
                <input
                  type="url"
                  value={activeQuote.externalFinanceSheetUrl || ''}
                  onChange={(e) => {
                    handleUpdateQuote({
                      ...activeQuote,
                      externalFinanceSheetUrl: e.target.value
                    });
                  }}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs font-mono text-[#0f172a] placeholder:text-[#7C8AA0] placeholder:font-sans placeholder:font-normal focus:ring-2 focus:ring-[#501f92]"
                />
                <span className="text-[10px] text-[#64748b]">
                  Planilla de Google Sheets donde Catalina/Luisa calculan el pricing con semanas y horas.
                </span>
              </div>

              {/* Valor Cotizado */}
              <div className="space-y-1 lg:col-span-1">
                <label className="font-bold text-[#475569] block">
                  Valor cotizado acordado: <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={activeQuote.totalQuotedValue ?? activeQuote.totalQuotedValueCOP ?? ''}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value) || 0);
                        handleUpdateQuote({
                          ...activeQuote,
                          totalQuotedValue: val,
                          totalQuotedValueCOP: activeQuote.currency === 'USD' ? 0 : val
                        });
                      }}
                      placeholder="0"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#cbd5e1] font-bold text-sm text-[#0f172a] placeholder:text-[#7C8AA0] placeholder:font-normal focus:ring-2 focus:ring-[#501f92]"
                    />
                  </div>
                  <select
                    value={activeQuote.currency || 'COP'}
                    onChange={(e) => {
                      const curr = e.target.value as 'COP' | 'USD';
                      const val = activeQuote.totalQuotedValue ?? activeQuote.totalQuotedValueCOP ?? 0;
                      handleUpdateQuote({
                        ...activeQuote,
                        currency: curr,
                        totalQuotedValue: val,
                        totalQuotedValueCOP: curr === 'USD' ? 0 : val
                      });
                    }}
                    className="p-2.5 rounded-xl border border-[#cbd5e1] font-bold text-xs bg-white text-[#501f92] focus:ring-2 focus:ring-[#501f92] cursor-pointer"
                  >
                    <option value="COP">COP ($)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <span className="text-[10px] text-[#64748b]">
                  Monto: <strong className="text-[#0f172a]">{formatCurrency(activeQuote.totalQuotedValue ?? activeQuote.totalQuotedValueCOP ?? 0, activeQuote.currency || 'COP')}</strong>
                </span>
              </div>

              {/* Presentación Comercial del Líder */}
              <div className="space-y-1 lg:col-span-1">
                <label className="font-bold text-[#475569] flex items-center justify-between">
                  <span>Propuesta / Presentación (PPT):</span>
                  {activeQuote.commercialProposalUrl && (
                    <a
                      href={activeQuote.commercialProposalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#501f92] hover:underline flex items-center gap-0.5"
                    >
                      <span>Ver Propuesta</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </label>
                <input
                  type="url"
                  value={activeQuote.commercialProposalUrl || ''}
                  onChange={(e) => {
                    handleUpdateQuote({
                      ...activeQuote,
                      commercialProposalUrl: e.target.value
                    });
                  }}
                  placeholder="https://docs.google.com/presentation/d/..."
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs font-mono text-[#0f172a] placeholder:text-[#7C8AA0] placeholder:font-sans placeholder:font-normal focus:ring-2 focus:ring-[#501f92]"
                />
                <span className="text-[10px] text-[#64748b]">
                  Enlace al documento o presentación entregada al cliente.
                </span>
              </div>
            </div>

            {/* Condiciones comerciales o notas */}
            <div className="space-y-1 text-xs pt-1">
              <label className="font-bold text-[#475569] block">
                Notas / Condiciones comerciales (Términos de pago, vigencia, supuestos):
              </label>
              <textarea
                rows={2}
                value={activeQuote.commercialNotes || ''}
                onChange={(e) => {
                  handleUpdateQuote({
                    ...activeQuote,
                    commercialNotes: e.target.value
                  });
                }}
                placeholder="Ej: 50% anticipo al kick-off y 50% contra entrega final; vigencia de oferta 15 días calendario; insumos requeridos en sprint 1."
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs text-[#0f172a] placeholder:text-[#7C8AA0] placeholder:font-normal focus:ring-2 focus:ring-[#501f92]"
              />
            </div>

            {/* Footer con CTA Guardar cambios y Acciones de Avance */}
            <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateQuote(activeQuote);
                    setConversionSuccessMessage('✅ Cotización comercial guardada correctamente.');
                    setTimeout(() => setConversionSuccessMessage(null), 4000);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
                >
                  Guardar cotización
                </button>
                <span className="text-[11px] text-[#64748b]">
                  Registrado para trazabilidad de la oportunidad ({activeQuote.versionLabel}).
                </span>
              </div>

              <div className="flex items-center gap-2">
                {activeOpp.status !== 'won' ? (
                  <button
                    type="button"
                    onClick={() => handleMarkOpportunityWon(activeOpp)}
                    className="px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                  >
                    <Trophy className="w-4 h-4 text-[#d4ff4a]" />
                    <span>Marcar Propuesta Ganada 🏆</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConvertModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-xs font-bold text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Convertir a Proyecto Operativo →</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DOCUMENTOS (Google Drive oficial + Propuesta + SOW) */}
      {/* ========================================================================= */}
      {activeTab === 'documentos' && activeQuote && (
        <div className="space-y-6 animate-in fade-in duration-150 text-xs">
          {/* Header de Documentos & Drive Simplificado */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#0f172a]">
                Documentos & Repositorio Oficial
              </h3>
              <p className="text-xs text-[#64748b]">
                Google Drive es la fuente documental oficial de Uhura. Orbit enlaza y sincroniza las referencias para evitar duplicidad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* 1. Carpeta Drive */}
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[#501f92]/10 text-[#501f92]">
                      <Folder className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-[#0f172a]">Carpeta Google Drive</h4>
                      <span className="text-[10px] text-[#64748b]">Repositorio del prospecto</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#64748b]">
                    Brief, propuesta, insumos y grabaciones de discovery en su ubicación oficial.
                  </p>
                </div>

                {activeOpp.driveFolderUrl ? (
                  <a
                    href={activeOpp.driveFolderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-white font-bold text-xs transition-colors"
                  >
                    <span>Abrir carpeta Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-[11px] text-[#94a3b8] italic">Sin carpeta vinculada</span>
                )}
              </div>

              {/* 2. Propuesta Comercial */}
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[#8a4dff]/10 text-[#8a4dff]">
                      <FileText className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-[#0f172a]">Propuesta Comercial</h4>
                      <span className="text-[10px] text-[#64748b]">{activeQuote.versionLabel}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#64748b]">
                    Presentación oficial elaborada con el agente y pulida por el líder.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('scoping')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#475569] font-bold text-xs transition-colors cursor-pointer"
                  >
                    <span>Ver Propuesta Comercial</span>
                  </button>
                  {activeOpp.driveFolderUrl && (
                    <a
                      href={activeOpp.driveFolderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center p-2 rounded-xl bg-[#501f92]/10 hover:bg-[#501f92]/20 text-[#501f92] font-bold text-xs transition-colors"
                      title="Abrir presentación en Drive"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* 3. SOW Contractual */}
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[#10b981]/10 text-[#10b981]">
                      <FileCheck className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-[#0f172a]">Statement of Work (SOW)</h4>
                      <span className="text-[10px] font-bold text-emerald-600">
                        {activeOpp.sowData?.status === 'signed'
                          ? 'Firmado'
                          : activeOpp.sowData?.status === 'ready_for_review'
                          ? 'Generado'
                          : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#64748b]">
                    Documento formal de alcance para cliente sin exponer horas por rol.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSowModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#10b981]/40 text-[#047857] hover:bg-emerald-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Abrir Editor de SOW</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sección SOW (Statement of Work) */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-[#8a4dff]/15 text-[#501f92]">
                    <FileText className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-[#0f172a]">
                        Statement of Work (SOW) - Plantilla Contractual
                      </h3>
                      {isWon && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#10b981] text-white shadow-xs">
                          🏆 Propuesta Ganada · Listo para Firma
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748b]">
                      Generado automáticamente desde el alcance de {activeQuote.versionLabel} sin exponer horas internas por rol
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSowModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border-2 border-[#501f92] hover:bg-[#501f92] hover:text-white text-xs font-black text-[#501f92] shadow-xs transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <Copy className="w-4 h-4 text-current" />
                  <span>Ver / Copiar SOW para Docs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSowModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#d4ff4a]" />
                  <span>Abrir Editor de SOW</span>
                </button>
              </div>
            </div>

            {/* Banner de protección de tarifas y secreto operativo */}
            <div className="p-3.5 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-between text-[#1e40af]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2563eb] shrink-0" />
                <span>
                  <strong>Gobernanza de Alcance Exterior:</strong> El SOW incluye objetivos, entregables, actividades formales, cronograma, exclusiones y valor comercial acordado. <strong>Las horas y tarifas internas por perfil quedan reservadas exclusivamente para la operación interna de Uhura.</strong>
                </span>
              </div>
            </div>

            {/* Resumen del Contenido del SOW */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748b]">Entregables Formales</span>
                <p className="font-bold text-[#0f172a] text-sm">{activeQuote.deliverables.length} Componentes</p>
                <p className="text-[11px] text-[#64748b]">
                  {activeQuote.deliverables.reduce((s, d) => s + d.backlogItems.length, 0)} actividades contempladas
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748b]">Duración Estimada</span>
                <p className="font-bold text-[#0f172a] text-sm">
                  {activeQuote.financialConfig?.projectDurationWeeks || 8} Semanas
                </p>
                <p className="text-[11px] text-[#64748b]">A partir del kick-off e insumos</p>
              </div>

              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748b]">Inversión Contractual</span>
                <p className="font-bold text-[#0f172a] text-sm">
                  {formatCurrency(
                    activeQuote.totalQuotedValue ??
                      activeQuote.totalQuotedValueCOP ??
                      activeQuote.financialSummary?.finalPriceWithTaxCOP ??
                      activeQuote.financialSummary?.subtotalBeforeTaxCOP ??
                      0,
                    activeQuote.currency || 'COP'
                  )}
                </p>
                <p className="text-[11px] text-[#64748b]">Forma de pago: 50% anticipo / 50% entrega</p>
              </div>

              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748b]">Firmante Contractual</span>
                <p className="font-bold text-[#0f172a] text-sm">
                  {activeOpp.sowData?.sowSigner || UHURA_LEGAL_SIGNER.name}
                </p>
                <p className="text-[11px] text-[#501f92] font-semibold">
                  {activeOpp.sowData?.sowSignerRole?.split('·')[0]?.trim() || 'Representante Legal'} · {activeOpp.sowData?.signatureProvider || UHURA_LEGAL_SIGNER.signatureProvider}
                </p>
              </div>
            </div>
          </div>

          {/* Checklist Administrativo (Vivian & Alegra) */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#501f92]" />
                  <span>Checklist Administrativo & Facturación (Vivian · Alegra)</span>
                </h3>
                <p className="text-xs text-[#64748b]">
                  Documentación requerida antes de emitir la factura en Alegra (no bloquea el kick-off operativo)
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f1f5f9] text-[#475569]">
                Responsable: {activeOpp.administrativeChecklist?.responsibleName || 'Vivian'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* RUT */}
              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0f172a]">1. RUT Actualizado</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      activeOpp.administrativeChecklist?.rutStatus === 'received'
                        ? 'bg-[#10b981]/15 text-[#10b981]'
                        : 'bg-[#f59e0b]/15 text-[#b45309]'
                    }`}
                  >
                    {activeOpp.administrativeChecklist?.rutStatus === 'received' ? 'Recibido' : 'Pendiente'}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateAdminChecklist({
                        rutStatus:
                          activeOpp.administrativeChecklist?.rutStatus === 'received'
                            ? 'pending'
                            : 'received'
                      })
                    }
                    className="text-xs font-bold text-[#501f92] hover:underline cursor-pointer"
                  >
                    {activeOpp.administrativeChecklist?.rutStatus === 'received'
                      ? 'Marcar como Pendiente'
                      : 'Marcar como Recibido'}
                  </button>
                </div>
              </div>

              {/* Cédula */}
              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0f172a]">2. Cédula Rep. Legal</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      activeOpp.administrativeChecklist?.idCardStatus === 'received'
                        ? 'bg-[#10b981]/15 text-[#10b981]'
                        : 'bg-[#f59e0b]/15 text-[#b45309]'
                    }`}
                  >
                    {activeOpp.administrativeChecklist?.idCardStatus === 'received' ? 'Recibida' : 'Pendiente'}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateAdminChecklist({
                        idCardStatus:
                          activeOpp.administrativeChecklist?.idCardStatus === 'received'
                            ? 'pending'
                            : 'received'
                      })
                    }
                    className="text-xs font-bold text-[#501f92] hover:underline cursor-pointer"
                  >
                    {activeOpp.administrativeChecklist?.idCardStatus === 'received'
                      ? 'Marcar como Pendiente'
                      : 'Marcar como Recibida'}
                  </button>
                </div>
              </div>

              {/* Correo Facturación */}
              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                <span className="font-bold text-[#0f172a] block">3. Correo Facturación</span>
                <input
                  type="email"
                  value={activeOpp.administrativeChecklist?.billingEmail || activeOpp.contactEmail || ''}
                  onChange={(e) => handleUpdateAdminChecklist({ billingEmail: e.target.value })}
                  placeholder="facturacion@empresa.com"
                  className="w-full p-1.5 rounded-lg border border-[#cbd5e1] text-xs bg-white text-[#0f172a]"
                />
              </div>

              {/* Alegra */}
              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0f172a]">4. Creado en Alegra</span>
                  <input
                    type="checkbox"
                    checked={activeOpp.administrativeChecklist?.alegraCreated || false}
                    onChange={(e) => handleUpdateAdminChecklist({ alegraCreated: e.target.checked })}
                    className="rounded text-[#501f92] focus:ring-[#501f92]"
                  />
                </div>
                <input
                  type="text"
                  value={activeOpp.administrativeChecklist?.alegraContactId || ''}
                  onChange={(e) => handleUpdateAdminChecklist({ alegraContactId: e.target.value })}
                  placeholder="ID Tercero Alegra (opcional)"
                  className="w-full p-1.5 rounded-lg border border-[#cbd5e1] text-xs bg-white text-[#0f172a]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: HISTORIAL DE VERSIONES & BITÁCORA */}
      {/* ========================================================================= */}
      {activeTab === 'historial' && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-2xs space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0f172a]">
                Historial de Versiones & Cotizaciones
              </h3>
              <p className="text-xs text-[#64748b]">
                Explora, duplica o compara alternativas de alcance y precio
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCreateNewQuoteVersion(activeQuote)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#d4ff4a]" />
              <span>+ Duplicar como Nueva Versión</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOpp.quotes.map((q) => {
              const isCurrent = q.id === activeQuoteId;
              const qVal = q.totalQuotedValue ?? q.totalQuotedValueCOP ?? 0;
              const qCurr = q.currency || 'COP';
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-[#501f92] bg-[#501f92]/5 shadow-sm'
                      : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#501f92]">
                      {q.versionLabel}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569]">
                      {q.totalHoursRollup}h
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-[#64748b]">
                    <p>{q.deliverables.length} servicio(s) en alcance</p>
                    <p className="font-bold text-[#0f172a]">
                      {qVal > 0 ? `Cotizado: ${formatCurrency(qVal, qCurr)}` : 'Sin valor cotizado'}
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-[#e2e8f0] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveQuoteId(q.id);
                        setActiveTab('scoping');
                      }}
                      className="text-xs font-bold text-[#501f92] hover:underline cursor-pointer"
                    >
                      {isCurrent ? 'Editando ahora' : 'Cargar versión'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bitácora de Conversión */}
          {activeOpp.convertedAt && (
            <div className="p-4 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-xs text-[#065f46] space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                <span>Conversión a Cliente y Proyecto completada</span>
              </span>
              <p className="text-[11px] text-[#047857]">
                Registrado en Orbit el: {new Date(activeOpp.convertedAt).toLocaleString('es-CO')}
              </p>
            </div>
          )}
        </div>
      )}

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

      {/* Modal de Confirmación: Solicitó Ajustes (Crear V2) */}
      {showAdjustmentsModal && activeOpp && activeQuote && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#e2e8f0] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffedd5] text-[#c2410c] flex items-center justify-center shrink-0">
                <Copy className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#0f172a]">
                  ¿Deseas crear una nueva versión (V2)?
                </h3>
                <p className="text-xs text-[#64748b]">
                  El cliente solicitó ajustes sobre la propuesta actual (<strong>{activeQuote.versionLabel}</strong>).
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] text-xs text-[#475569] space-y-1.5">
              <p>
                Al confirmar <strong>Crear V2</strong>, Orbit duplicará íntegramente los entregables y actividades de la V1 para que el líder pueda adaptar horas y roles sin sobreescribir el histórico original.
              </p>
              <p className="text-[11px] text-[#64748b]">
                Si prefieres seguir trabajando sobre la misma versión, puedes simplemente marcarla en negociación.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => {
                  handleCreateNewQuoteVersion(activeQuote);
                  const updated: NewBusinessOpportunity = {
                    ...activeOpp,
                    status: 'negotiation',
                    updatedAt: new Date().toISOString()
                  };
                  onUpdateOpportunity(updated);
                  setActiveTab('scoping');
                  setShowAdjustmentsModal(false);
                  setConversionSuccessMessage('Cliente solicitó ajustes: Versión V2 creada clonando V1 para adaptar el alcance sin sobreescribir.');
                  setTimeout(() => setConversionSuccessMessage(null), 5000);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#d4ff4a]" />
                <span>Crear V2 (Clonar V1)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const updated: NewBusinessOpportunity = {
                    ...activeOpp,
                    status: 'negotiation',
                    updatedAt: new Date().toISOString()
                  };
                  onUpdateOpportunity(updated);
                  setShowAdjustmentsModal(false);
                  setConversionSuccessMessage('Oportunidad actualizada a estado Negociación.');
                  setTimeout(() => setConversionSuccessMessage(null), 4000);
                }}
                className="w-full py-2 px-4 rounded-xl border border-[#fed7aa] bg-[#fff7ed] hover:bg-[#ffedd5] text-[#c2410c] text-xs font-bold transition-colors cursor-pointer"
              >
                Solo marcar en Negociación (Sin V2)
              </button>

              <button
                type="button"
                onClick={() => setShowAdjustmentsModal(false)}
                className="w-full py-1.5 text-xs text-[#64748b] hover:text-[#0f172a] font-medium cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
          onClose={() => setIsConvertModalOpen(false)}
          onConfirm={handleConfirmConversion}
        />
      )}

      {/* Modal de Generación de SOW */}
      {activeQuote && (
        <SOWModal
          isOpen={isSowModalOpen}
          opportunity={activeOpp}
          quote={activeQuote}
          onClose={() => setIsSowModalOpen(false)}
          onSaveSOWData={handleSaveSowData}
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
                    {wonCelebrationOpp.commercialOwner || 'Catalina / Luisa'}
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
                    {wonCelebrationOpp.leadUserName || 'Líder de Alcance'}
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

            {/* Botones de acción */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5 relative z-10">
              <button
                type="button"
                onClick={() => {
                  setWonCelebrationOpp(null);
                  setActiveTab('documentos');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#d4ff4a] hover:bg-[#bceb34] text-[#0f172a] text-xs font-black shadow-lg shadow-[#d4ff4a]/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                Ir a Documentos y Gates (Contrato/Anticipo) →
              </button>

              <button
                type="button"
                onClick={() => setWonCelebrationOpp(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                ¡A celebrar con el equipo! 🥂🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
