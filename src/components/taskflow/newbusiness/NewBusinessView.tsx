import React, { useState } from 'react';
import {
  NewBusinessOpportunity,
  QuoteProposal,
  ClientProfile,
  ProductBacklogTemplate
} from '../types';
import { BacklogScoper } from './BacklogScoper';
import { NewOpportunityModal } from './NewOpportunityModal';
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
  CheckCircle2,
  Share2,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';

interface NewBusinessViewProps {
  opportunities: NewBusinessOpportunity[];
  clients: ClientProfile[];
  templates: ProductBacklogTemplate[];
  onUpdateOpportunity: (updatedOpp: NewBusinessOpportunity) => void;
  onCreateOpportunity: (newOpp: NewBusinessOpportunity) => void;
  onNavigateToView?: (view: any) => void;
}

export const NewBusinessView: React.FC<NewBusinessViewProps> = ({
  opportunities,
  clients,
  templates,
  onUpdateOpportunity,
  onCreateOpportunity,
  onNavigateToView
}) => {
  const [selectedOppId, setSelectedOppId] = useState<string>(
    opportunities[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'scoping' | 'brief' | 'quotes'>('scoping');
  const [isNewOppModalOpen, setIsNewOppModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeOpp = opportunities.find((o) => o.id === selectedOppId) || opportunities[0];

  // Active quote inside the selected opportunity
  const [activeQuoteId, setActiveQuoteId] = useState<string>(
    activeOpp?.quotes[0]?.id || ''
  );

  const activeQuote =
    activeOpp?.quotes.find((q) => q.id === activeQuoteId) || activeOpp?.quotes[0];

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

  // Filter opportunities
  const filteredOpps = opportunities.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.title.toLowerCase().includes(q) ||
      (o.prospectAccountName && o.prospectAccountName.toLowerCase().includes(q)) ||
      (o.contactName && o.contactName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Context Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#501f92]/10 text-[#501f92] uppercase tracking-wider">
              New Business · Preventa & Scoping
            </span>
            <span className="text-[11px] text-[#64748b]">
              El Backlog Genera las Horas → Calculadora Define el Precio
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#0f172a] tracking-tight flex items-center gap-2">
            <span>Oportunidades & Scoping Operativo</span>
          </h2>
          <p className="text-xs text-[#64748b] max-w-3xl leading-relaxed">
            Estructura el alcance técnico real (Entregable → Actividad → Rol → Horas) sin redigitar. 
            El rollup consolidado de roles alimenta directamente la calculadora financiera y, al aprobarse, 
            se convierte en el baseline presupuestal del proyecto.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsNewOppModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Oportunidad / Brief</span>
          </button>
        </div>
      </div>

      {/* Opportunity Selector Cards Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-0.5">
        {opportunities.map((opp) => {
          const isSelected = opp.id === selectedOppId;
          const oppTotalHours =
            opp.quotes.find((q) => q.status === 'approved')?.totalHoursRollup ||
            opp.quotes[0]?.totalHoursRollup ||
            0;

          return (
            <button
              key={opp.id}
              type="button"
              onClick={() => {
                setSelectedOppId(opp.id);
                setActiveQuoteId(opp.quotes[0]?.id || '');
              }}
              className={`p-3.5 rounded-xl border text-left min-w-[260px] max-w-[320px] shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#501f92] shadow-sm ring-2 ring-[#501f92]/20'
                  : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8fafc]'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#501f92] truncate">
                  {opp.prospectAccountName || 'Prospecto'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-[#f1f5f9] text-[#475569]">
                  {oppTotalHours}h
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#0f172a] truncate" title={opp.title}>
                {opp.title}
              </h4>
              <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                Lead: {opp.leadUserName || 'Paola'} · {opp.quotes.length} versión(es)
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Opportunity Workspace */}
      {activeOpp ? (
        <div className="space-y-5">
          {/* Active Opp Summary Header Banner */}
          <div className="p-4 bg-white rounded-2xl border border-[#e2e8f0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-[#0f172a]">
                  {activeOpp.prospectAccountName}
                </span>
                <span className="text-xs text-[#94a3b8]">/</span>
                <span className="text-xs font-semibold text-[#501f92]">
                  {activeOpp.title}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981]">
                  {activeOpp.status === 'quoting'
                    ? 'En Scoping / Cotización'
                    : activeOpp.status === 'internal_review'
                    ? 'En Revisión Técnica'
                    : 'Propuesta'}
                </span>
                {activeOpp.clientId ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#6366f1]/10 text-[#6366f1]">
                    Cliente Existente en Orbit
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f59e0b]/15 text-[#b45309]">
                    Prospecto Nuevo (Sin NIT todavía)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-[#64748b] flex-wrap pt-0.5">
                {activeOpp.contactName && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#94a3b8]" />
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
                <span className="text-[11px]">
                  Lead Propuesta: <strong>{activeOpp.leadUserName || 'Paola'}</strong>
                </span>
              </div>
            </div>

            {/* Navigation Tabs for this Opportunity */}
            <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl shrink-0">
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
                <span>Scoping del Backlog (Fase 1)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('quotes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'quotes'
                    ? 'bg-white text-[#501f92] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Cotizaciones ({activeOpp.quotes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('brief')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'brief'
                    ? 'bg-white text-[#501f92] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ficha & Brief</span>
              </button>
            </div>
          </div>

          {/* TAB 1: SCOPING DEL BACKLOG (CORE FASE 1) */}
          {activeTab === 'scoping' && activeQuote && (
            <BacklogScoper
              quote={activeQuote}
              allQuotes={activeOpp.quotes}
              onUpdateQuote={handleUpdateQuote}
              onSelectQuoteVersion={(qId) => setActiveQuoteId(qId)}
              onCreateNewQuoteVersion={handleCreateNewQuoteVersion}
              templates={templates}
              opportunityTitle={activeOpp.title}
              prospectName={activeOpp.prospectAccountName}
            />
          )}

          {/* TAB 2: COTIZACIONES & PREVIEW CALCULADORA (PREPARACIÓN FASE 2) */}
          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <div className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#501f92]">
                    Versiones de Propuesta
                  </span>
                  <h3 className="text-base font-bold text-[#0f172a]">
                    Cotizaciones de {activeOpp.prospectAccountName}
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Puedes tener múltiples opciones de propuesta (ej. Web Completa vs MVP) manteniendo el backlog estructurado.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCreateNewQuoteVersion()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Nueva Versión de Cotización</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeOpp.quotes.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4 hover:border-[#cbd5e1] transition-all"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                      <div>
                        <span className="text-xs font-bold text-[#501f92]">
                          Opción #{qIdx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-[#0f172a]">
                          {q.versionLabel}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                          Total Esfuerzo
                        </span>
                        <span className="text-base font-black text-[#501f92]">
                          {q.totalHoursRollup}h
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-[#475569]">
                      <div className="flex items-center justify-between">
                        <span>Frentes / Entregables:</span>
                        <strong className="text-[#0f172a]">{q.deliverables.length}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Actividades técnicas de backlog:</span>
                        <strong className="text-[#0f172a]">
                          {q.deliverables.flatMap((d) => d.backlogItems).length}
                        </strong>
                      </div>
                    </div>

                    {/* Preview of Role Rollup */}
                    <div className="pt-2 border-t border-[#f1f5f9] space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                        Horas Rollup por Rol:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {q.deliverables
                          .flatMap((d) => d.roleBudgets)
                          .reduce((acc, rb) => {
                            const found = acc.find((r) => r.roleId === rb.roleId);
                            if (found) found.quotedHours += rb.quotedHours;
                            else acc.push({ ...rb });
                            return acc;
                          }, [] as typeof q.deliverables[0]['roleBudgets'])
                          .map((rb) => (
                            <div
                              key={rb.roleId}
                              className="p-1.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between"
                            >
                              <span className="truncate mr-1 text-[#475569]">{rb.roleName}</span>
                              <strong className="text-[#501f92] shrink-0">{rb.quotedHours}h</strong>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveQuoteId(q.id);
                          setActiveTab('scoping');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#501f92] hover:text-[#3d1572] cursor-pointer"
                      >
                        <span>Abrir Scoping de este Backlog</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#501f92]/10 text-[#501f92] font-semibold">
                        Listo para Fase 2 (Cotizador)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FICHA & BRIEF */}
          {activeTab === 'brief' && (
            <div className="p-6 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#0f172a]">
                  Ficha de la Oportunidad
                </h3>
                <p className="text-xs text-[#64748b]">
                  Información registrada en el brief inicial
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                      Empresa / Prospecto:
                    </span>
                    <span className="text-sm font-bold text-[#0f172a]">
                      {activeOpp.prospectAccountName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                      Contacto Principal:
                    </span>
                    <span className="font-medium text-[#0f172a]">
                      {activeOpp.contactName || 'No registrado'} ({activeOpp.contactEmail || 'Sin email'})
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                      Teléfono:
                    </span>
                    <span className="font-medium text-[#0f172a]">
                      {activeOpp.contactPhone || 'No registrado'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                      Líder de la Propuesta (Uhura):
                    </span>
                    <span className="font-bold text-[#501f92]">
                      {activeOpp.leadUserName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                      ID Oportunidad HubSpot:
                    </span>
                    <span className="font-mono text-[#0284c7]">
                      {activeOpp.hubspotDealId || 'Sin sincronizar'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                      Fecha Estimada Kickoff:
                    </span>
                    <span className="font-medium text-[#0f172a]">
                      {activeOpp.targetKickoffDate || 'Por definir'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#f1f5f9] space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                    Resumen del Brief:
                  </span>
                  <p className="text-[#334155] leading-relaxed mt-1 bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                    {activeOpp.briefSummary || 'No hay resumen de brief registrado.'}
                  </p>
                </div>

                {activeOpp.discoveryNotes && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                      Notas Técnicas de Discovery:
                    </span>
                    <p className="text-[#334155] leading-relaxed mt-1 bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                      {activeOpp.discoveryNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#e2e8f0]">
          <p className="text-sm font-bold text-[#0f172a]">No hay oportunidades registradas</p>
          <button
            type="button"
            onClick={() => setIsNewOppModalOpen(true)}
            className="mt-3 px-4 py-2 bg-[#501f92] text-white text-xs font-bold rounded-xl"
          >
            Crear Primera Oportunidad
          </button>
        </div>
      )}

      {/* New Opportunity Modal */}
      <NewOpportunityModal
        isOpen={isNewOppModalOpen}
        onClose={() => setIsNewOppModalOpen(false)}
        onSaveOpportunity={(newOpp) => {
          onCreateOpportunity(newOpp);
          setSelectedOppId(newOpp.id);
          setActiveQuoteId(newOpp.quotes[0]?.id || '');
          setActiveTab('scoping');
        }}
        existingClients={clients}
      />
    </div>
  );
};
