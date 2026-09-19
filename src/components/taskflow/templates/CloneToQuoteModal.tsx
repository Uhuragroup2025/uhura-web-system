import React, { useState } from 'react';
import {
  ProductBacklogTemplate,
  QuoteProposal,
  QuoteDeliverable,
  QuoteBacklogItem,
  NewBusinessOpportunity,
  STANDARD_UHURA_ROLES,
  StandardUhuraRole,
  ROLE_PENDING_DEFINITION,
  CommercialCalculatorContract
} from '../types';
import {
  cloneTemplateToQuote,
  createBlankCustomQuote,
  prepareCommercialCalculatorContract,
  computeRoleBudgetsFromActivities,
  computeTotalHoursFromRoleBudgets
} from './templateEngine';
import {
  X,
  Copy,
  Plus,
  Trash2,
  Layers,
  Clock,
  Users2,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Search,
  Sliders,
  Briefcase,
  Target
} from 'lucide-react';

interface CloneToQuoteModalProps {
  isOpen: boolean;
  templates: ProductBacklogTemplate[];
  opportunities?: NewBusinessOpportunity[];
  preselectedTemplateId?: string | null;
  preselectedOpportunityId?: string | null;
  onClose: () => void;
  onQuoteCreated?: (quote: QuoteProposal) => void;
  onSaveToOpportunity?: (opportunityId: string, quote: QuoteProposal) => void;
  onCreateOpportunityWithQuote?: (
    opportunityData: {
      title: string;
      prospectAccountName?: string;
      leadUserName?: string;
    },
    quote: QuoteProposal
  ) => void;
}

export const CloneToQuoteModal: React.FC<CloneToQuoteModalProps> = ({
  isOpen,
  templates,
  opportunities = [],
  preselectedTemplateId,
  preselectedOpportunityId,
  onClose,
  onQuoteCreated,
  onSaveToOpportunity,
  onCreateOpportunityWithQuote
}) => {
  if (!isOpen) return null;

  // Paso 1: Configuración del origen ('template' vs 'scratch')
  const [mode, setMode] = useState<'template' | 'scratch'>(
    preselectedTemplateId ? 'template' : 'template'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    preselectedTemplateId || templates[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selección de Oportunidad Contenedora (Regla arquitectónica: QuoteProposal siempre pertenece a NewBusinessOpportunity)
  const [targetOpportunityMode, setTargetOpportunityMode] = useState<'existing' | 'new'>(
    preselectedOpportunityId || opportunities.length > 0 ? 'existing' : 'new'
  );
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>(
    preselectedOpportunityId || opportunities[0]?.id || ''
  );
  const [newOpportunityTitle, setNewOpportunityTitle] = useState<string>('');
  const [newProspectAccountName, setNewProspectAccountName] = useState<string>('');

  // Etiqueta de la cotización
  const [versionLabel, setVersionLabel] = useState<string>('Opción A: Alcance Recomendado');

  // Paso 2: Vista de personalización de la copia independiente clonada
  const [clonedQuote, setClonedQuote] = useState<QuoteProposal | null>(null);
  const [expandedDelId, setExpandedDelId] = useState<string | null>(null);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const targetExistingOpp = opportunities.find((o) => o.id === selectedOpportunityId);

  // Filtrado de plantillas
  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Nombre de visualización de la oportunidad
  const displayOpportunityName =
    targetOpportunityMode === 'existing'
      ? targetExistingOpp
        ? `${targetExistingOpp.title} (${targetExistingOpp.prospectAccountName || 'Cliente'})`
        : 'Oportunidad Seleccionada'
      : newOpportunityTitle.trim() || 'Nueva Oportunidad Comercial';

  // ACCIÓN: CLONAR HACIA COPIA INDEPENDIENTE CON OPPORTUNITY ID RESUELTO
  const handleGenerateClone = () => {
    // Resolver opportunityId legítimo
    const resolvedOppId =
      targetOpportunityMode === 'existing' && selectedOpportunityId
        ? selectedOpportunityId
        : `opp-${Date.now()}`;

    let quote: QuoteProposal;
    if (mode === 'template' && selectedTemplate) {
      quote = cloneTemplateToQuote(selectedTemplate, {
        opportunityId: resolvedOppId,
        versionLabel: versionLabel.trim() || `Opción: ${selectedTemplate.name}`
      });
    } else {
      quote = createBlankCustomQuote({
        opportunityId: resolvedOppId,
        versionLabel: versionLabel.trim() || 'Cotización a la Medida (Desde Cero)'
      });
    }

    setClonedQuote(quote);
    setExpandedDelId(quote.deliverables[0]?.id || null);
  };

  // RECALCULO DINÁMICO EN LA COTIZACIÓN CLONADA
  const handleUpdateQuoteItem = (
    delId: string,
    actId: string,
    field: keyof QuoteBacklogItem,
    value: any
  ) => {
    if (!clonedQuote) return;

    const updatedDeliverables = clonedQuote.deliverables.map((del) => {
      if (del.id !== delId) return del;

      const updatedItems = del.backlogItems.map((act) => {
        if (act.id !== actId) return act;
        if (field === 'roleId') {
          return { ...act, roleId: value, roleName: value };
        }
        return { ...act, [field]: value };
      });

      // Recalcular role budgets del entregable (Nivel 2)
      const roleBudgets = computeRoleBudgetsFromActivities(updatedItems).map((rb, idx) => ({
        id: `qrb-${delId}-${idx}-${Date.now()}`,
        quoteDeliverableId: delId,
        roleId: rb.roleId,
        roleName: rb.roleName,
        quotedHours: rb.quotedHours
      }));

      const totalHoursRollup = computeTotalHoursFromRoleBudgets(roleBudgets);

      return {
        ...del,
        backlogItems: updatedItems,
        roleBudgets,
        totalHoursRollup
      };
    });

    // Recalcular Nivel 3 global de la cotización
    const allActivities = updatedDeliverables.flatMap((d) => d.backlogItems);
    const globalRoleBudgets = computeRoleBudgetsFromActivities(allActivities);
    const totalHoursRollup = computeTotalHoursFromRoleBudgets(globalRoleBudgets);

    setClonedQuote({
      ...clonedQuote,
      deliverables: updatedDeliverables,
      totalHoursRollup,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddActivityToCloned = (delId: string) => {
    if (!clonedQuote) return;

    const targetDel = clonedQuote.deliverables.find((d) => d.id === delId);
    if (!targetDel) return;

    const newAct: QuoteBacklogItem = {
      id: `qbi-${Date.now()}-${targetDel.backlogItems.length + 1}`,
      quoteDeliverableId: delId,
      title: 'Nueva actividad ajustada para el cliente',
      description: '',
      roleId: 'Front-End Dev',
      roleName: 'Front-End Dev',
      estimatedHours: 2.0,
      order: targetDel.backlogItems.length + 1,
      dependencies: [],
      suggestedUserId: null
    };

    const updatedDeliverables = clonedQuote.deliverables.map((del) => {
      if (del.id !== delId) return del;
      const items = [...del.backlogItems, newAct];
      const roleBudgets = computeRoleBudgetsFromActivities(items).map((rb, idx) => ({
        id: `qrb-${delId}-${idx}-${Date.now()}`,
        quoteDeliverableId: delId,
        roleId: rb.roleId,
        roleName: rb.roleName,
        quotedHours: rb.quotedHours
      }));
      return {
        ...del,
        backlogItems: items,
        roleBudgets,
        totalHoursRollup: computeTotalHoursFromRoleBudgets(roleBudgets)
      };
    });

    const allActs = updatedDeliverables.flatMap((d) => d.backlogItems);
    const total = computeTotalHoursFromRoleBudgets(computeRoleBudgetsFromActivities(allActs));

    setClonedQuote({
      ...clonedQuote,
      deliverables: updatedDeliverables,
      totalHoursRollup: total
    });
  };

  const handleRemoveActivityFromCloned = (delId: string, actId: string) => {
    if (!clonedQuote) return;

    const updatedDeliverables = clonedQuote.deliverables.map((del) => {
      if (del.id !== delId) return del;
      const items = del.backlogItems.filter((a) => a.id !== actId);
      const roleBudgets = computeRoleBudgetsFromActivities(items).map((rb, idx) => ({
        id: `qrb-${delId}-${idx}-${Date.now()}`,
        quoteDeliverableId: delId,
        roleId: rb.roleId,
        roleName: rb.roleName,
        quotedHours: rb.quotedHours
      }));
      return {
        ...del,
        backlogItems: items,
        roleBudgets,
        totalHoursRollup: computeTotalHoursFromRoleBudgets(roleBudgets)
      };
    });

    const allActs = updatedDeliverables.flatMap((d) => d.backlogItems);
    const total = computeTotalHoursFromRoleBudgets(computeRoleBudgetsFromActivities(allActs));

    setClonedQuote({
      ...clonedQuote,
      deliverables: updatedDeliverables,
      totalHoursRollup: total
    });
  };

  // Guardar cotización en la oportunidad correspondiente
  const handleFinalizeQuote = () => {
    if (!clonedQuote) return;

    if (targetOpportunityMode === 'existing' && selectedOpportunityId) {
      if (onSaveToOpportunity) {
        onSaveToOpportunity(selectedOpportunityId, clonedQuote);
      } else if (onQuoteCreated) {
        onQuoteCreated(clonedQuote);
      }
    } else {
      // Crear nueva oportunidad vinculada
      if (onCreateOpportunityWithQuote) {
        onCreateOpportunityWithQuote(
          {
            title: newOpportunityTitle.trim() || `Oportunidad: ${clonedQuote.versionLabel}`,
            prospectAccountName: newProspectAccountName.trim() || 'Nuevo Prospecto',
            leadUserName: 'Comercial Lead'
          },
          clonedQuote
        );
      } else if (onQuoteCreated) {
        onQuoteCreated(clonedQuote);
      }
    }

    onClose();
  };

  // Contrato de la calculadora comercial listo
  const calculatorContract: CommercialCalculatorContract | null = clonedQuote
    ? prepareCommercialCalculatorContract(clonedQuote)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-[#0f172a]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f1f5f9] flex items-center justify-between bg-[#fcfaff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8a4dff]/10 flex items-center justify-center text-[#8a4dff]">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0f172a]">
                {clonedQuote ? 'Personalizar Backlog de la Cotización' : 'Iniciar Nueva Cotización'}
              </h2>
              <p className="text-xs text-[#64748b]">
                {clonedQuote
                  ? 'Copia independiente generada · La plantilla maestra original en la biblioteca permanece intacta'
                  : 'Selecciona una plantilla de Producto o inicia un alcance a la medida desde cero'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {!clonedQuote ? (
            /* PASO 1: SELECCIÓN DE ORIGEN */
            <div className="space-y-6">
              {/* Opciones: Plantilla vs Desde Cero */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('template')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    mode === 'template'
                      ? 'border-[#8a4dff] bg-[#8a4dff]/5 ring-2 ring-[#8a4dff]/20'
                      : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-[#8a4dff]" />
                    <span className="text-xs font-bold text-[#0f172a]">
                      Usar Plantilla Maestra Existente
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748b] leading-relaxed">
                    Clona entregables, actividades y horas desde la biblioteca gobernada por Producto.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('scratch')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    mode === 'scratch'
                      ? 'border-[#8a4dff] bg-[#8a4dff]/5 ring-2 ring-[#8a4dff]/20'
                      : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-[#8a4dff]" />
                    <span className="text-xs font-bold text-[#0f172a]">
                      Crear Cotización Desde Cero
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748b] leading-relaxed">
                    Para proyectos a la medida o alcances atípicos sin estructura previa.
                  </p>
                </button>
              </div>

              {/* Datos de contexto y Asociación con New Business Opportunity */}
              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-4">
                <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#8a4dff]" />
                    <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                      Asociación con Oportunidad de New Business
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setTargetOpportunityMode('existing')}
                      disabled={opportunities.length === 0}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        targetOpportunityMode === 'existing'
                          ? 'bg-[#8a4dff] text-white'
                          : opportunities.length === 0
                          ? 'text-[#94a3b8] cursor-not-allowed'
                          : 'bg-white text-[#64748b] border border-[#cbd5e1] hover:bg-[#f1f5f9]'
                      }`}
                    >
                      Oportunidad Existente ({opportunities.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetOpportunityMode('new')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                        targetOpportunityMode === 'new'
                          ? 'bg-[#8a4dff] text-white'
                          : 'bg-white text-[#64748b] border border-[#cbd5e1] hover:bg-[#f1f5f9]'
                      }`}
                    >
                      Crear desde Brief / Nueva
                    </button>
                  </div>
                </div>

                {targetOpportunityMode === 'existing' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">
                        Seleccionar Oportunidad de New Business
                      </label>
                      <select
                        value={selectedOpportunityId}
                        onChange={(e) => setSelectedOpportunityId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#8a4dff] focus:border-transparent outline-hidden bg-white text-[#0f172a]"
                      >
                        {opportunities.map((opp) => (
                          <option key={opp.id} value={opp.id}>
                            {opp.title} · {opp.prospectAccountName || 'Cliente'} (Etapa: {opp.stage})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">
                        Etiqueta de la Cotización / Opción
                      </label>
                      <input
                        type="text"
                        value={versionLabel}
                        onChange={(e) => setVersionLabel(e.target.value)}
                        placeholder="ej. Opción A: Alcance Recomendado"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#8a4dff] focus:border-transparent outline-hidden bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">
                        Título de la Nueva Oportunidad
                      </label>
                      <input
                        type="text"
                        value={newOpportunityTitle}
                        onChange={(e) => setNewOpportunityTitle(e.target.value)}
                        placeholder="ej. Rediseño Web & Integración ERP"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#8a4dff] focus:border-transparent outline-hidden bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">
                        Cuenta / Prospecto / Cliente
                      </label>
                      <input
                        type="text"
                        value={newProspectAccountName}
                        onChange={(e) => setNewProspectAccountName(e.target.value)}
                        placeholder="ej. Grupo Argos"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#8a4dff] focus:border-transparent outline-hidden bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">
                        Etiqueta de la Cotización
                      </label>
                      <input
                        type="text"
                        value={versionLabel}
                        onChange={(e) => setVersionLabel(e.target.value)}
                        placeholder="ej. Opción A: Alcance Recomendado"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#8a4dff] focus:border-transparent outline-hidden bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Si es modo plantilla: Selector y Previsualización */}
              {mode === 'template' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#334155] uppercase tracking-wider">
                      Seleccionar Producto o Servicio de la Biblioteca
                    </span>
                    <div className="relative w-64">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#94a3b8]" />
                      <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#8a4dff] outline-hidden bg-white"
                      />
                    </div>
                  </div>

                  {/* Grid de selección */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {filteredTemplates.map((t) => {
                      const isSelected = t.id === selectedTemplateId;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTemplateId(t.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#8a4dff] bg-[#8a4dff]/10 ring-1 ring-[#8a4dff]'
                              : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-[#0f172a] line-clamp-1">
                                {t.name}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8a4dff]/15 text-[#8a4dff] shrink-0">
                                {t.totalHours}h
                              </span>
                            </div>
                            <p className="text-[11px] text-[#64748b] line-clamp-2 mb-2">
                              {t.description}
                            </p>
                          </div>
                          <div className="text-[10px] text-[#64748b] flex items-center gap-2 border-t border-[#f1f5f9] pt-1.5">
                            <span>{t.deliverables.length} entregables</span>
                            <span>·</span>
                            <span>{t.deliverables.flatMap((d) => d.activities).length} actividades</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Previsualización de los 3 Niveles de la Plantilla Seleccionada */}
                  {selectedTemplate && (
                    <div className="p-4 rounded-xl bg-[#10091d] text-white border border-[#2d1b4e] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#2d1b4e] pb-2">
                        <div>
                          <span className="text-xs font-bold text-[#d4ff4a]">
                            Resumen de Estimación de la Plantilla Maestra
                          </span>
                          <p className="text-[11px] text-[#c9b7ff]">
                            {selectedTemplate.name} (Versión {selectedTemplate.version})
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#c9b7ff] uppercase block">
                            Nivel 3: Total
                          </span>
                          <span className="text-sm font-black text-[#d4ff4a]">
                            {selectedTemplate.totalHours} hrs
                          </span>
                        </div>
                      </div>

                      {/* Nivel 2: Horas por Rol */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#c9b7ff]/80 block mb-1.5">
                          Nivel 2: Horas Cotizadas por Rol (Rollup):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedTemplate.roleBudgetsRollup?.map((rb) => (
                            <span
                              key={rb.roleId}
                              className="text-xs px-2.5 py-1 rounded-md bg-[#1a0f30] border border-[#2d1b4e] text-[#e2e8f0]"
                            >
                              <strong className="text-white font-semibold mr-1.5">{rb.roleName}:</strong>
                              <span className="text-[#d4ff4a] font-bold">{rb.quotedHours}h</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Nivel 1: Entregables Marco */}
                      <div className="border-t border-[#2d1b4e] pt-2">
                        <span className="text-[10px] uppercase font-bold text-[#c9b7ff]/80 block mb-1.5">
                          Nivel 1: Entregables Marco:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#c9b7ff]">
                          {selectedTemplate.deliverables.map((d, idx) => (
                            <div key={d.id} className="flex items-center justify-between px-2 py-1 rounded bg-[#1a0f30]/60">
                              <span className="truncate mr-2">{idx + 1}. {d.name}</span>
                              <span className="text-[#d4ff4a] font-semibold shrink-0">{d.totalHoursRollup}h</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botón de acción para pasar al clonado */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGenerateClone}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#8a4dff] hover:bg-[#7839ee] rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <span>Generar Copia Independiente para Cotización</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* PASO 2: EDICIÓN DE LA COPIA INDEPENDIENTE CLONADA */
            <div className="space-y-6">
              {/* Banner de Garantía de Aislamiento */}
              <div className="p-3.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
                <div className="text-xs text-[#065f46] space-y-0.5">
                  <p className="font-bold">
                    Copia editable independiente generada con éxito (ID: {clonedQuote.id})
                  </p>
                  <p className="text-[11px] text-[#047857] leading-relaxed">
                    Cualquier cambio de actividades, horas o roles que realices aquí afectará únicamente a esta cotización. 
                    La plantilla maestra original en la biblioteca permanece 100% inalterada.
                  </p>
                </div>
              </div>

              {/* Resumen de la Oportunidad */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div>
                  <span className="text-[11px] text-[#64748b] block">Oportunidad de New Business:</span>
                  <span className="text-xs font-bold text-[#0f172a]">{displayOpportunityName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#64748b] block">Etiqueta:</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8a4dff]/10 text-[#8a4dff]">
                    {clonedQuote.versionLabel}
                  </span>
                </div>
              </div>

              {/* Entregables y Actividades de la Cotización */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#334155] uppercase tracking-wider">
                    Backlog Técnico de la Cotización ({clonedQuote.deliverables.length} entregables)
                  </span>
                  <span className="text-xs font-semibold text-[#8a4dff]">
                    Total Horas Cotizadas: {clonedQuote.totalHoursRollup}h
                  </span>
                </div>

                {clonedQuote.deliverables.map((del, dIdx) => {
                  const isExpanded = expandedDelId === del.id;
                  return (
                    <div
                      key={del.id}
                      className="border border-[#e2e8f0] rounded-xl bg-white overflow-hidden shadow-xs"
                    >
                      <div
                        onClick={() => setExpandedDelId(isExpanded ? null : del.id)}
                        className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between cursor-pointer hover:bg-[#f1f5f9] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#8a4dff]">
                            Hito {dIdx + 1}:
                          </span>
                          <span className="text-xs font-bold text-[#0f172a]">{del.name}</span>
                          <span className="text-[11px] text-[#64748b]">
                            ({del.backlogItems.length} actividades)
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#8a4dff] px-2 py-0.5 rounded-md bg-[#8a4dff]/10">
                          {del.totalHoursRollup} hrs
                        </span>
                      </div>

                      {isExpanded && (
                        <div className="p-3.5 space-y-2">
                          {del.backlogItems.map((act, aIdx) => (
                            <div
                              key={act.id}
                              className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 rounded-lg bg-[#fcfaff] border border-[#f1f5f9]"
                            >
                              <span className="text-[11px] font-semibold text-[#8a4dff] w-5">
                                {dIdx + 1}.{aIdx + 1}
                              </span>

                              {/* Título de la actividad */}
                              <div className="flex-1 min-w-[200px]">
                                <input
                                  type="text"
                                  value={act.title}
                                  onChange={(e) =>
                                    handleUpdateQuoteItem(del.id, act.id, 'title', e.target.value)
                                  }
                                  className="w-full text-xs text-[#0f172a] px-2 py-1.5 rounded-md border border-[#cbd5e1] bg-white"
                                />
                              </div>

                              {/* Rol Presupuestado */}
                              <div className="w-full sm:w-[170px]">
                                <select
                                  value={act.roleId}
                                  onChange={(e) =>
                                    handleUpdateQuoteItem(del.id, act.id, 'roleId', e.target.value)
                                  }
                                  className={`w-full text-xs px-2 py-1.5 rounded-md border bg-white ${
                                    act.roleId === ROLE_PENDING_DEFINITION || act.roleName === ROLE_PENDING_DEFINITION
                                      ? 'border-[#f59e0b] text-[#b45309] font-medium bg-[#fffbeb]'
                                      : 'border-[#cbd5e1] text-[#334155]'
                                  }`}
                                >
                                  <optgroup label="Catálogo Oficial Uhura">
                                    {STANDARD_UHURA_ROLES.map((role) => (
                                      <option key={role} value={role}>
                                        {role}
                                      </option>
                                    ))}
                                  </optgroup>
                                  <optgroup label="Sin rol estándar asignado">
                                    <option value={ROLE_PENDING_DEFINITION}>
                                      ⚠️ {ROLE_PENDING_DEFINITION}
                                    </option>
                                  </optgroup>
                                </select>
                              </div>

                              {/* Horas */}
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0.5}
                                  max={200}
                                  step={0.5}
                                  value={act.estimatedHours}
                                  onChange={(e) =>
                                    handleUpdateQuoteItem(
                                      del.id,
                                      act.id,
                                      'estimatedHours',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-18 text-xs text-right font-semibold text-[#0f172a] px-2 py-1.5 rounded-md border border-[#cbd5e1] bg-white"
                                />
                                <span className="text-[11px] text-[#64748b]">hrs</span>
                              </div>

                              {/* Eliminar actividad */}
                              <button
                                type="button"
                                onClick={() => handleRemoveActivityFromCloned(del.id, act.id)}
                                className="p-1 text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleAddActivityToCloned(del.id)}
                            className="w-full py-1.5 border border-dashed border-[#cbd5e1] hover:border-[#8a4dff] text-[#8a4dff] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 bg-[#fcfaff]/50 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar Actividad Personalizada</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CONTRATO PREPARADO PARA CALCULADORA COMERCIAL */}
              {calculatorContract && (
                <div className="p-4 rounded-xl bg-[#0e1726] text-white border border-[#1e293b] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#38bdf8]" />
                      <span className="text-xs font-bold text-[#38bdf8] uppercase tracking-wider">
                        Contrato Preparado: Calculadora Comercial
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#38bdf8]/15 text-[#38bdf8]">
                      Consumo de Horas por Rol (Nivel 2)
                    </span>
                  </div>

                  <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                    Este contrato reúne la bolsa presupuestada de horas por rol (<code>QuoteRoleBudget[]</code>)
                    lista para alimentar la fórmula económica real de Google Sheets (salarios, tarifas y márgenes).
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {calculatorContract.roleBudgets.map((rb) => (
                      <div
                        key={rb.roleId}
                        className="p-2.5 rounded-lg bg-[#1e293b]/70 border border-[#334155] flex flex-col justify-between"
                      >
                        <span className="text-[11px] text-[#cbd5e1] truncate" title={rb.roleName}>
                          {rb.roleName}
                        </span>
                        <span className="text-xs font-black text-[#38bdf8] mt-1">
                          {rb.quotedHours} hrs
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1e293b] text-xs">
                    <span className="text-[#94a3b8]">Suma total presupuestada:</span>
                    <strong className="text-white text-sm">{calculatorContract.totalHours} hrs</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#f1f5f9] bg-white flex items-center justify-between">
          {clonedQuote ? (
            <button
              type="button"
              onClick={() => setClonedQuote(null)}
              className="px-3 py-2 text-xs font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
            >
              ← Volver a selección
            </button>
          ) : (
            <span className="text-xs text-[#64748b]">
              Gobernanza: Producto mantiene plantillas · Comercial consume copias independientes
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f1f5f9] rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            {clonedQuote && (
              <button
                type="button"
                onClick={handleFinalizeQuote}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#10b981] hover:bg-[#059669] rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Cotización y Guardar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
