import React, { useState } from 'react';
import {
  NewBusinessOpportunity,
  QuoteProposal,
  ClientProfile,
  ProductBacklogTemplate,
  ProjectType,
  AdministrativeChecklist,
  StartConditionsConfig,
  SowDocumentData
} from '../types';
import { BacklogScoper } from './BacklogScoper';
import { NewOpportunityModal } from './NewOpportunityModal';
import { ConvertOpportunityModal } from './ConvertOpportunityModal';
import { SOWModal } from './SOWModal';
import { CommercialCalculator } from '../financial/CommercialCalculator';
import { computeQuoteFinancials, formatFinancialCurrency } from '../financial/financialEngine';
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
  Copy,
  Printer
} from 'lucide-react';

interface NewBusinessViewProps {
  opportunities: NewBusinessOpportunity[];
  clients: ClientProfile[];
  templates: ProductBacklogTemplate[];
  onUpdateOpportunity: (updatedOpp: NewBusinessOpportunity) => void;
  onCreateOpportunity: (newOpp: NewBusinessOpportunity) => void;
  onNavigateToView?: (view: any) => void;
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
}

export const NewBusinessView: React.FC<NewBusinessViewProps> = ({
  opportunities,
  clients,
  templates,
  onUpdateOpportunity,
  onCreateOpportunity,
  onNavigateToView,
  onConvertOpportunityToProject
}) => {
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'scoping' | 'cotizacion' | 'documentos' | 'historial'>('resumen');
  const [isNewOppModalOpen, setIsNewOppModalOpen] = useState<boolean>(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState<boolean>(false);
  const [isSowModalOpen, setIsSowModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'quoting' | 'won'>('all');
  const [conversionSuccessMessage, setConversionSuccessMessage] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const activeOpp = opportunities.find((o) => o.id === selectedOppId);

  // Active quote inside the selected opportunity
  const [activeQuoteId, setActiveQuoteId] = useState<string>(
    activeOpp?.quotes[0]?.id || ''
  );

  const activeQuote =
    activeOpp?.quotes.find((q) => q.id === activeQuoteId) || activeOpp?.quotes[0];

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
    setConversionSuccessMessage(
      `¡"${payload.projectName}" ha sido aprobado y activado como Cliente y Proyecto en Orbit!`
    );
    setTimeout(() => {
      setConversionSuccessMessage(null);
    }, 6000);
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
        {/* Banner de Notificación de Éxito de Conversión */}
        {conversionSuccessMessage && (
          <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] flex items-center justify-between gap-3 shadow-xs animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
              <span className="text-xs font-bold">{conversionSuccessMessage}</span>
            </div>
            {onNavigateToView && (
              <button
                type="button"
                onClick={() => onNavigateToView('proyectos')}
                className="px-3 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Ver en Proyectos →
              </button>
            )}
          </div>
        )}

        {/* Top Header */}
        <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#501f92]/10 text-[#501f92] uppercase tracking-wider">
                Preventa & Scoping
              </span>
              <span className="text-[11px] text-[#64748b]">
                Antes de ser cliente operativo en Orbit
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#0f172a] tracking-tight flex items-center gap-2">
              <Target className="w-6 h-6 text-[#501f92]" />
              <span>New Business</span>
            </h2>
            <p className="text-xs text-[#64748b] max-w-2xl leading-relaxed">
              El espacio donde los líderes dimensionan técnicamente las oportunidades recibidas de Comercial (briefs), construyen entregables y actividades, generan cotizaciones, gestionan el SOW formal y habilitan la transición a Proyectos.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsNewOppModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#d4ff4a]" />
              <span>+ Crear desde Brief</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-[#64748b]">Oportunidades</span>
            <div className="text-xl font-extrabold text-[#0f172a]">{opportunities.length}</div>
            <p className="text-[11px] text-[#94a3b8]">En pipeline comercial</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-[#64748b]">En Cotización</span>
            <div className="text-xl font-extrabold text-[#501f92]">{totalQuotingCount}</div>
            <p className="text-[11px] text-[#94a3b8]">Scoping activo</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-[#64748b]">Ganadas / En Orbit</span>
            <div className="text-xl font-extrabold text-[#10b981]">{totalWonCount}</div>
            <p className="text-[11px] text-[#94a3b8]">Convertidas a cliente y proyecto</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-1">
            <span className="text-xs font-semibold text-[#64748b]">Horas Cotizadas</span>
            <div className="text-xl font-extrabold text-[#0f172a]">{totalQuotedHours}h</div>
            <p className="text-[11px] text-[#94a3b8]">Rollup consolidado</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#e2e8f0] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
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

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-xs font-bold text-[#64748b] mr-1">Filtrar:</span>
            {(
              [
                { id: 'all', label: 'Todas' },
                { id: 'quoting', label: 'En Scoping' },
                { id: 'won', label: 'Ganadas / Proyectos' }
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
        </div>

        {/* Opportunities Cards Grid */}
        {filteredOpps.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-[#cbd5e1] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#501f92]/10 text-[#501f92] flex items-center justify-center mx-auto">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#0f172a]">
              No hay oportunidades registradas con estos criterios
            </h3>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto">
              Crea un nuevo prospecto para iniciar el scoping del alcance y cotizar con la calculadora financiera.
            </p>
            <button
              type="button"
              onClick={() => setIsNewOppModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-xs font-bold text-white shadow-xs transition-colors cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Prospecto</span>
            </button>
          </div>
        ) : (
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
                        <span>Líder: <strong className="text-[#0f172a]">{opp.leadUserName || 'Product Lead'}</strong></span>
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
                    <span>{isWon ? 'Ver Proyecto & Alcance' : 'Abrir Alcance & Cotizador'}</span>
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
          existingClients={clients}
          templates={templates}
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
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Banner de Notificación de Éxito de Conversión */}
      {conversionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] flex items-center justify-between gap-3 shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
            <span className="text-xs font-bold">{conversionSuccessMessage}</span>
          </div>
          {onNavigateToView && (
            <button
              type="button"
              onClick={() => onNavigateToView('proyectos')}
              className="px-3 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Ver en Proyectos →
            </button>
          )}
        </div>
      )}

      {/* Breadcrumbs (Migas de Pan) */}
      <div className="flex items-center justify-between gap-3 text-xs bg-white px-4 py-2.5 rounded-2xl border border-[#e2e8f0] shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedOppId(null)}
            className="font-bold text-[#501f92] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Target className="w-3.5 h-3.5" />
            <span>New Business</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />
          <span className="font-semibold text-[#475569]">{activeOpp.prospectAccountName}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />
          <span className="font-bold text-[#0f172a] truncate max-w-xs">{activeOpp.title}</span>
        </div>

        <button
          type="button"
          onClick={() => setSelectedOppId(null)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Prospectos</span>
        </button>
      </div>

      {/* Active Opp Summary Header Banner */}
      <div className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-extrabold text-[#0f172a]">
              {activeOpp.prospectAccountName}
            </span>
            <span className="text-xs text-[#94a3b8]">/</span>
            <span className="text-sm font-semibold text-[#501f92]">
              {activeOpp.title}
            </span>
            {activeOpp.status === 'won' ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Ganada · Proyecto en Orbit</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#501f92]/10 text-[#501f92]">
                En Scoping / Cotización
              </span>
            )}
            {activeOpp.clientId ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#6366f1]/10 text-[#6366f1]">
                Cliente Orbit
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f59e0b]/15 text-[#b45309]">
                Prospecto Nuevo
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-[#64748b] flex-wrap">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#501f92]" />
              <span>Líder: <strong className="text-[#0f172a]">{activeOpp.leadUserName || 'Product Lead'}</strong></span>
            </span>
            {activeOpp.contactName && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#94a3b8]" />
                {activeOpp.contactName}
              </span>
            )}
            {activeOpp.contactEmail && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#94a3b8]" />
                {activeOpp.contactEmail}
              </span>
            )}
            {activeOpp.hubspotDealId && (
              <span className="text-[11px] font-mono text-[#0284c7]">
                HubSpot: {activeOpp.hubspotDealId}
              </span>
            )}
          </div>
        </div>

        {/* Acciones principales del Workspace */}
        <div className="flex items-center gap-3 flex-wrap">
          {activeOpp.status !== 'won' ? (
            <button
              type="button"
              onClick={() => setIsConvertModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Convertir a Cliente & Proyecto</span>
            </button>
          ) : (
            onNavigateToView && (
              <button
                type="button"
                onClick={() => onNavigateToView('proyectos')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-bold text-[#0f172a] transition-colors cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-[#10b981]" />
                <span>Ver en Proyectos →</span>
              </button>
            )
          )}

          {/* Navigation Tabs */}
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
              <span>Resumen & Brief</span>
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
              <span>Alcance & Backlog</span>
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
              <Calculator className="w-3.5 h-3.5" />
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
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RESUMEN / BRIEF */}
      {/* ========================================================================= */}
      {activeTab === 'resumen' && activeQuote && (
        <div className="space-y-5 animate-in fade-in duration-150">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                  <span className="text-[10px] uppercase font-bold text-[#64748b] block">Empresa</span>
                  <span className="font-bold text-xs text-[#0f172a]">{activeOpp.prospectAccountName}</span>
                </div>

                <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                  <span className="text-[10px] uppercase font-bold text-[#64748b] block">Contacto</span>
                  <span className="font-medium text-xs text-[#0f172a]">
                    {activeOpp.contactName || 'No asignado'}
                  </span>
                </div>

                <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                  <span className="text-[10px] uppercase font-bold text-[#64748b] block">Líder Asignado</span>
                  <span className="font-bold text-xs text-[#501f92]">
                    {activeOpp.leadUserName || 'Product Lead'}
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
                <button
                  type="button"
                  onClick={() => setIsSowModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#faf5ff] hover:bg-[#f3e8ff] text-[#501f92] text-xs font-bold border border-[#e9d5ff] transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generar / Ver SOW Formal</span>
                </button>

                {activeOpp.status !== 'won' && (
                  <button
                    type="button"
                    onClick={() => setIsConvertModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Convertir a Cliente & Proyecto</span>
                  </button>
                )}
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
                  className="px-3 py-1.5 rounded-lg bg-[#501f92] hover:bg-[#3d1572] text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Ver Calculadora Financiera →
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
      {/* TAB 2: ALCANCE & BACKLOG */}
      {/* ========================================================================= */}
      {activeTab === 'scoping' && activeQuote && (
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
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COTIZACIÓN (Calculadora Comercial) */}
      {/* ========================================================================= */}
      {activeTab === 'cotizacion' && activeQuote && (
        <CommercialCalculator
          quote={activeQuote}
          allQuotes={activeOpp.quotes}
          opportunityTitle={activeOpp.title}
          prospectName={activeOpp.prospectAccountName}
          onUpdateQuote={handleUpdateQuote}
          onSelectQuoteVersion={(quoteId) => setActiveQuoteId(quoteId)}
          onGoToBacklogScoping={() => setActiveTab('scoping')}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DOCUMENTOS (Drive 4 Carpetas + SOW + Checklist Vivian/Alegra) */}
      {/* ========================================================================= */}
      {activeTab === 'documentos' && activeQuote && (
        <div className="space-y-6 animate-in fade-in duration-150 text-xs">
          {/* Header de Documentos & Drive */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-[#501f92]/10 text-[#501f92]">
                    <Folder className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#0f172a]">
                      Repositorio de Documentos (Google Drive)
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      Carpeta raíz: <code>{activeOpp.driveFolderUrl || `PROSPECTOS / ${activeOpp.prospectAccountName}`}</code>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeOpp.driveFolderUrl && (
                  <a
                    href={activeOpp.driveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-xs font-bold text-white shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir Carpeta en Drive</span>
                  </a>
                )}
              </div>
            </div>

            {/* Estructura Estándar de 4 Carpetas de Uhura */}
            <div className="pt-2">
              <span className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-2">
                Estructura Estándar Uhura (4 Carpetas)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 00. BRIEF */}
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 font-mono font-bold text-[10px]">
                      00
                    </span>
                    <span className="font-bold text-[#0f172a]">BRIEF</span>
                  </div>
                  <p className="text-[11px] text-[#64748b]">
                    Brief del cliente, requerimientos iniciales, notas de discovery.
                  </p>
                  {activeOpp.briefUrl ? (
                    <a
                      href={activeOpp.briefUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[#2563eb] hover:underline flex items-center gap-1 pt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Ver Documento Brief</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-[#94a3b8] italic">Sin brief vinculado</span>
                  )}
                </div>

                {/* 01. PROPUESTAS */}
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-purple-50 text-[#501f92] font-mono font-bold text-[10px]">
                      01
                    </span>
                    <span className="font-bold text-[#0f172a]">PROPUESTAS COMERCIALES</span>
                  </div>
                  <p className="text-[11px] text-[#64748b]">
                    Presentaciones, PDF de cotización ({activeOpp.quotes.length} versión/es generada/s).
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('cotizacion')}
                    className="text-[11px] font-bold text-[#501f92] hover:underline cursor-pointer pt-1 block"
                  >
                    Exportar Cotización PDF →
                  </button>
                </div>

                {/* 02. DOCUMENTOS ADMINISTRATIVOS */}
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-mono font-bold text-[10px]">
                      02
                    </span>
                    <span className="font-bold text-[#0f172a]">DOC ADMINISTRATIVOS</span>
                  </div>
                  <p className="text-[11px] text-[#64748b]">
                    SOW firmado, RUT, Cédula del representante, contratos marco.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSowModalOpen(true)}
                    className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer pt-1 block"
                  >
                    Ver SOW Contractual →
                  </button>
                </div>

                {/* 03. INSUMOS */}
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 font-mono font-bold text-[10px]">
                      03
                    </span>
                    <span className="font-bold text-[#0f172a]">INSUMOS</span>
                  </div>
                  <p className="text-[11px] text-[#64748b]">
                    Materiales entregados por el cliente, assets gráficos, manuales de marca, accesos.
                  </p>
                  <span className="text-[10px] text-[#94a3b8] italic">Listo para recepción</span>
                </div>
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
                    <h3 className="text-base font-bold text-[#0f172a]">
                      Statement of Work (SOW) - Plantilla Contractual
                    </h3>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
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
                  {formatFinancialCurrency(
                    activeQuote.financialSummary?.finalPriceWithTaxCOP ||
                      activeQuote.financialSummary?.subtotalBeforeTaxCOP ||
                      activeQuote.totalQuotedValueCOP ||
                      0,
                    'COP'
                  )} COP
                </p>
                <p className="text-[11px] text-[#64748b]">Forma de pago: 50% anticipo / 50% entrega</p>
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
              const fin = computeQuoteFinancials(q);
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
                      Estimado: {formatFinancialCurrency(fin.finalPriceWithTaxCOP)}
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

      {/* Modal de Creación de Nueva Oportunidad ("+ Crear desde Brief") */}
      <NewOpportunityModal
        isOpen={isNewOppModalOpen}
        existingClients={clients}
        templates={templates}
        onClose={() => setIsNewOppModalOpen(false)}
        onSaveOpportunity={handleCreatedOpportunity}
      />

      {/* Modal de Conversión a Cliente & Proyecto */}
      {activeQuote && (
        <ConvertOpportunityModal
          isOpen={isConvertModalOpen}
          opportunity={activeOpp}
          activeQuote={activeQuote}
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
    </div>
  );
};
