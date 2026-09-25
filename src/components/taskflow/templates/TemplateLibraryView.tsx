import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ProductBacklogTemplate,
  TemplateStatus,
  QuoteProposal,
  NewBusinessOpportunity,
  ROLE_PENDING_DEFINITION,
  UserItem
} from '../types';
import { can } from '../auth/permissions';
import { TEMPLATE_CATEGORIES } from './templateData';
import { TemplateEditorModal } from './TemplateEditorModal';
import { CloneToQuoteModal } from './CloneToQuoteModal';
import { recalculateTemplateHours } from './templateEngine';
import {
  BookOpen,
  Plus,
  Search,
  Layers,
  Clock,
  Copy,
  Edit3,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  MoreHorizontal,
  Archive,
  Check,
  FileText
} from 'lucide-react';

interface TemplateLibraryViewProps {
  templates: ProductBacklogTemplate[];
  onUpdateTemplates: (templates: ProductBacklogTemplate[]) => void;
  opportunities?: NewBusinessOpportunity[];
  onSaveToOpportunity?: (opportunityId: string, quote: QuoteProposal) => void;
  onCreateOpportunityWithQuote?: (
    opportunityData: {
      title: string;
      prospectAccountName?: string;
      leadUserName?: string;
    },
    quote: QuoteProposal
  ) => void;
  onQuoteCreated?: (quote: QuoteProposal) => void;
  quotes?: QuoteProposal[];
  currentUser?: UserItem;
}

export const TemplateLibraryView: React.FC<TemplateLibraryViewProps> = ({
  templates,
  onUpdateTemplates,
  opportunities = [],
  onSaveToOpportunity,
  onCreateOpportunityWithQuote,
  onQuoteCreated,
  quotes = [],
  currentUser
}) => {
  // Permission checks (Leaders, Commercial, Executives, and Admins can create and edit catalog templates)
  const isNotCollaboratorOrPending = !currentUser || (currentUser.accessLevel !== 'collaborator' && currentUser.accessLevel !== 'pending');
  const canCreateTemplate = can(currentUser, 'create', 'plantillas-producto') || isNotCollaboratorOrPending;
  const canEditTemplate = can(currentUser, 'edit', 'plantillas-producto') || isNotCollaboratorOrPending;
  const canDeleteTemplate = can(currentUser, 'administer', 'plantillas-producto') || isNotCollaboratorOrPending;

  // Estado de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Flujo oficial Tooltip / Popover
  const [showFlowInfo, setShowFlowInfo] = useState<boolean>(false);
  const flowInfoRef = useRef<HTMLDivElement>(null);

  // Menú de opciones (...) por plantilla
  const [openMenuTemplateId, setOpenMenuTemplateId] = useState<string | null>(null);

  // Estado de modales
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<ProductBacklogTemplate | null>(null);

  const [isCloneModalOpen, setIsCloneModalOpen] = useState<boolean>(false);
  const [templateToCloneId, setTemplateToCloneId] = useState<string | null>(null);

  // Modal de confirmación de eliminación segura de plantilla
  const [templateToDelete, setTemplateToDelete] = useState<ProductBacklogTemplate | null>(null);

  // Progressive Disclosure: Plantillas expandidas (Ver detalle)
  const [expandedCards, setExpandedCards] = useState<{ [templateId: string]: boolean }>({});

  // Mensaje de feedback temporal
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'info';
    text: string;
  } | null>(null);

  const triggerFeedback = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const toggleCardExpand = (templateId: string) => {
    setExpandedCards((prev) => ({ ...prev, [templateId]: !prev[templateId] }));
  };

  // Cierre al hacer clic fuera del menú de acciones o del popover de ayuda
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (openMenuTemplateId && !target.closest('.template-menu-container')) {
        setOpenMenuTemplateId(null);
      }
      if (showFlowInfo && flowInfoRef.current && !flowInfoRef.current.contains(target as Node)) {
        setShowFlowInfo(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [openMenuTemplateId, showFlowInfo]);

  // Filtrado reactivo de plantillas
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.deliverables.some((d) =>
          d.name.toLowerCase().includes(q) ||
          d.activities.some((a) => a.title.toLowerCase().includes(q) || a.roleName.toLowerCase().includes(q))
        );

      const matchesCategory =
        selectedCategory === 'all' || t.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'all' || t.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [templates, searchQuery, selectedCategory, selectedStatus]);

  // Cantidad de plantillas activas
  const activeCount = useMemo(() => {
    return templates.filter((t) => t.status === 'active').length;
  }, [templates]);

  // ACCIONES
  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setIsEditorModalOpen(true);
  };

  const handleOpenEditModal = (tmpl: ProductBacklogTemplate) => {
    setEditingTemplate(tmpl);
    setIsEditorModalOpen(true);
    setOpenMenuTemplateId(null);
  };

  const handleSaveTemplate = (savedTemplate: ProductBacklogTemplate) => {
    const exists = templates.some((t) => t.id === savedTemplate.id);
    let updated: ProductBacklogTemplate[];
    if (exists) {
      updated = templates.map((t) => (t.id === savedTemplate.id ? savedTemplate : t));
      triggerFeedback(`Plantilla "${savedTemplate.name}" actualizada con éxito.`);
    } else {
      updated = [savedTemplate, ...templates];
      triggerFeedback(`Nueva plantilla maestra "${savedTemplate.name}" creada.`);
    }
    onUpdateTemplates(updated);
  };

  const handleDuplicateTemplate = (tmpl: ProductBacklogTemplate) => {
    const timestamp = Date.now();
    const cloned: ProductBacklogTemplate = {
      ...JSON.parse(JSON.stringify(tmpl)),
      id: `tmpl-copy-${timestamp}`,
      name: `${tmpl.name} (Copia)`,
      version: `${tmpl.version}.1`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const finalCloned = recalculateTemplateHours(cloned);
    onUpdateTemplates([finalCloned, ...templates]);
    triggerFeedback(`Plantilla duplicada como borrador: "${finalCloned.name}".`);
    setOpenMenuTemplateId(null);
  };

  const handleUpdateTemplateStatus = (templateId: string, newStatus: TemplateStatus) => {
    const updated = templates.map((t) =>
      t.id === templateId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    );
    onUpdateTemplates(updated);
    const label = newStatus === 'active' ? 'Activa' : newStatus === 'draft' ? 'Borrador' : 'Archivada';
    triggerFeedback(`Estado actualizado a "${label}".`);
    setOpenMenuTemplateId(null);
  };

  const handleRequestDelete = (tmpl: ProductBacklogTemplate) => {
    setTemplateToDelete(tmpl);
    setOpenMenuTemplateId(null);
  };

  const handleConfirmDelete = () => {
    if (!templateToDelete) return;
    const name = templateToDelete.name;
    onUpdateTemplates(templates.filter((t) => t.id !== templateToDelete.id));
    setTemplateToDelete(null);
    triggerFeedback(`Plantilla maestra "${name}" eliminada de la biblioteca.`, 'info');
  };

  const handleOpenCloneModal = (templateId?: string) => {
    setTemplateToCloneId(templateId || null);
    setIsCloneModalOpen(true);
  };

  const handleQuoteCreatedInternal = (quote: QuoteProposal) => {
    if (onQuoteCreated) {
      onQuoteCreated(quote);
    }
    triggerFeedback(
      `Cotización "${quote.versionLabel}" generada (${quote.totalHoursRollup}h). La plantilla maestra permanece intacta.`
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-lg ${
            feedbackMessage.type === 'success'
              ? 'bg-[#10b981]/10 text-[#065f46] border-[#10b981]/30'
              : 'bg-[#38bdf8]/10 text-[#0369a1] border-[#38bdf8]/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Simplificado: Título limpio, badge de activas y ayuda compacta */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg sm:text-xl font-extrabold text-[#0f172a] tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#8a4dff]" />
              <span>Catálogo de Plantillas</span>
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#8a4dff]/10 text-[#501f92] border border-[#8a4dff]/20">
              {activeCount} activas
            </span>
          </div>
          <p className="text-xs text-[#64748b]">
            Estructuras reutilizables para cotizar y ejecutar servicios.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Popover / Tooltip: ¿Cómo funciona el catálogo? ⓘ */}
          <div className="relative" ref={flowInfoRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowFlowInfo((prev) => !prev);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#501f92] hover:bg-[#f1f5f9] border border-transparent hover:border-[#e2e8f0] transition-colors cursor-pointer"
              title="Explicación del flujo de trabajo"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#8a4dff]" />
              <span className="hidden sm:inline">¿Cómo funciona el catálogo?</span>
              <span className="sm:hidden">Cómo funciona</span>
            </button>

            {showFlowInfo && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#140b24] text-white p-4 rounded-2xl shadow-2xl border border-[#8a4dff]/40 text-xs z-30 animate-in zoom-in-95 duration-150 backdrop-blur-md">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10">
                  <span className="font-bold flex items-center gap-1.5 text-[#d4ff4a] text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    Flujo Oficial Orbit
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFlowInfo(false)}
                    className="text-white/40 hover:text-white cursor-pointer p-0.5"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2.5 text-[11px] text-white/85 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#8a4dff] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      <strong className="text-white">Catálogo:</strong> Plantillas maestras estandarizadas con entregables y roles de la agencia.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#8a4dff] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      <strong className="text-[#d4ff4a]">Usar en New Business:</strong> Crea un snapshot independiente asociado a una oportunidad.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#8a4dff] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p>
                      <strong className="text-white">Cotización (QuoteProposal):</strong> Se ajusta y cotiza con el cliente sin alterar la plantilla maestra.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botón Nueva Plantilla */}
          {canCreateTemplate && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8a4dff] hover:bg-[#7839ee] text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Plantilla</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra Unificada de Búsqueda + Filtros (Sin chips gigantes) */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col sm:flex-row items-center gap-2.5">
        {/* Campo de búsqueda */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Buscar plantilla, entregable o actividad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#cbd5e1] focus:ring-2 focus:ring-[#8a4dff] focus:border-transparent outline-hidden bg-[#f8fafc] text-[#0f172a]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-[#94a3b8] hover:text-[#0f172a] text-xs cursor-pointer"
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown de Categorías */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto text-xs text-[#334155] font-semibold px-3 py-2 rounded-xl border border-[#cbd5e1] bg-white hover:border-[#94a3b8] focus:ring-2 focus:ring-[#8a4dff] outline-hidden cursor-pointer"
          >
            <option value="all">Todas las categorías ({templates.length})</option>
            {TEMPLATE_CATEGORIES.map((cat) => {
              const count = templates.filter((t) => t.category === cat.key).length;
              return (
                <option key={cat.key} value={cat.key}>
                  {cat.label} ({count})
                </option>
              );
            })}
          </select>

          {/* Dropdown de Estado */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto text-xs text-[#334155] font-semibold px-3 py-2 rounded-xl border border-[#cbd5e1] bg-white hover:border-[#94a3b8] focus:ring-2 focus:ring-[#8a4dff] outline-hidden cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas ({activeCount})</option>
            <option value="draft">Borradores ({templates.filter((t) => t.status === 'draft').length})</option>
            <option value="archived">Archivadas ({templates.filter((t) => t.status === 'archived').length})</option>
          </select>
        </div>
      </div>

      {/* Lista Compacta de Plantillas con Progressive Disclosure */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-[#e2e8f0] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#f1f5f9] flex items-center justify-center mx-auto text-[#94a3b8]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#0f172a]">No se encontraron plantillas</h3>
          <p className="text-xs text-[#64748b] max-w-md mx-auto">
            No hay productos que coincidan con la búsqueda o filtros aplicados.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#8a4dff]/10 hover:bg-[#8a4dff]/20 text-[#8a4dff] text-xs font-bold transition-colors cursor-pointer"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTemplates.map((tmpl) => {
            const isExpanded = !!expandedCards[tmpl.id];
            const catMeta = TEMPLATE_CATEGORIES.find((c) => c.key === tmpl.category);
            const totalActivitiesCount = tmpl.deliverables.flatMap((d) => d.activities).length;
            const isMenuOpen = openMenuTemplateId === tmpl.id;

            return (
              <div
                key={tmpl.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] hover:border-[#cbd5e1] shadow-2xs transition-all overflow-visible"
              >
                {/* Fila Principal Compacta */}
                <div className="p-3.5 sm:p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Información Principal: Título + Meta + Métricas */}
                    <div className="space-y-1 flex-1 min-w-0">
                      {/* Título de la plantilla */}
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#0f172a] hover:text-[#8a4dff] transition-colors truncate">
                          {tmpl.name}
                        </h3>
                      </div>

                      {/* Sub-línea 1: Categoría · Versión · Estado */}
                      <div className="flex items-center gap-2 text-xs text-[#64748b] flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            catMeta ? `${catMeta.badgeBg} ${catMeta.badgeText}` : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {catMeta ? catMeta.label : tmpl.category}
                        </span>
                        <span className="text-[#cbd5e1]">•</span>
                        <span className="text-[11px] font-mono text-[#64748b]">v{tmpl.version}</span>
                        <span className="text-[#cbd5e1]">•</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            tmpl.status === 'active'
                              ? 'bg-[#10b981]/15 text-[#059669]'
                              : tmpl.status === 'draft'
                              ? 'bg-[#f59e0b]/15 text-[#d97706]'
                              : 'bg-[#94a3b8]/15 text-[#64748b]'
                          }`}
                        >
                          {tmpl.status === 'active' ? 'Activa' : tmpl.status === 'draft' ? 'Borrador' : 'Archivada'}
                        </span>
                      </div>

                      {/* Sub-línea 2: Horas totales · Entregables · Actividades */}
                      <div className="flex items-center gap-2 text-xs text-[#334155] pt-0.5">
                        <span className="text-sm font-extrabold text-[#8a4dff]">{tmpl.totalHours} h</span>
                        <span className="text-[#cbd5e1]">•</span>
                        <span className="font-semibold">{tmpl.deliverables.length} entregables</span>
                        <span className="text-[#cbd5e1]">•</span>
                        <span className="text-[#64748b]">{totalActivitiesCount} actividades</span>
                      </div>

                      {/* Descripción concisa (1 sola línea, o se expande en Ver detalle) */}
                      {tmpl.description && !isExpanded && (
                        <p className="text-[11px] text-[#64748b] line-clamp-1 pt-0.5">
                          {tmpl.description}
                        </p>
                      )}
                    </div>

                    {/* Acciones de la Fila: Ver detalle + Usar en New Business + Menú (...) */}
                    <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#f1f5f9]">
                      {/* Ver Detalle Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleCardExpand(tmpl.id)}
                        className="text-xs font-semibold text-[#64748b] hover:text-[#501f92] px-2.5 py-1.5 rounded-xl hover:bg-[#f1f5f9] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronDown className="w-3.5 h-3.5 text-[#8a4dff]" />
                            <span>Ocultar detalle</span>
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-3.5 h-3.5 text-[#8a4dff]" />
                            <span>Ver detalle</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        {/* Botón directo de Editar Servicio */}
                        {canEditTemplate && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(tmpl)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#cbd5e1] hover:border-[#501f92] bg-white hover:bg-[#f8fafc] text-[#475569] hover:text-[#501f92] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                            title="Editar servicio y entregables"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#501f92]" />
                            <span>Editar</span>
                          </button>
                        )}

                        {/* Acción Principal Prominente: Usar en New Business */}
                        <button
                          type="button"
                          onClick={() => handleOpenCloneModal(tmpl.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#30108b] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                          title="Usar esta plantilla para cotizar en New Business"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#d4ff4a]" />
                          <span>Usar en New Business</span>
                        </button>

                        {/* Menú de Opciones (...) */}
                        <div className="relative template-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuTemplateId(isMenuOpen ? null : tmpl.id);
                            }}
                            className="p-1.5 rounded-xl text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                            title="Opciones de plantilla"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-[#e2e8f0] p-1.5 z-40 text-xs text-[#334155] animate-in zoom-in-95 duration-100">
                              {canEditTemplate && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuTemplateId(null);
                                    handleOpenEditModal(tmpl);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#f8fafc] text-left text-[#334155] font-medium cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#501f92]" />
                                  <span>Editar servicio</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDuplicateTemplate(tmpl)}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#f8fafc] text-left text-[#334155] font-medium cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-[#64748b]" />
                                <span>Duplicar</span>
                              </button>

                              <div className="my-1 border-t border-[#f1f5f9]" />

                              {/* Opciones de Estado */}
                              {tmpl.status !== 'active' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTemplateStatus(tmpl.id, 'active')}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#10b981]/10 text-left text-[#059669] font-medium cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Marcar como Activa</span>
                                </button>
                              )}

                              {tmpl.status !== 'draft' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTemplateStatus(tmpl.id, 'draft')}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#f59e0b]/10 text-left text-[#d97706] font-medium cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Pasar a Borrador</span>
                                </button>
                              )}

                              {tmpl.status !== 'archived' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTemplateStatus(tmpl.id, 'archived')}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#f1f5f9] text-left text-[#64748b] font-medium cursor-pointer"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                  <span>Archivar plantilla</span>
                                </button>
                              )}

                              {canDeleteTemplate && (
                                <>
                                  <div className="my-1 border-t border-[#f1f5f9]" />
                                  <button
                                    type="button"
                                    onClick={() => handleRequestDelete(tmpl)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#fee2e2]/60 text-left text-[#ef4444] font-medium cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Eliminar</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progressive Disclosure: Detalle Expandido */}
                {isExpanded && (
                  <div className="border-t border-[#f1f5f9] bg-[#f8fafc] p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
                    {/* Descripción Completa */}
                    {tmpl.description && (
                      <div className="text-xs text-[#475569] leading-relaxed bg-white p-3 rounded-xl border border-[#e2e8f0]">
                        <span className="font-bold text-[#0f172a] block mb-0.5">Descripción de la Plantilla:</span>
                        {tmpl.description}
                      </div>
                    )}

                    {/* Distribución de Esfuerzo (Rollup de Horas por Rol) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#8a4dff]" />
                          Distribución de esfuerzo por rol ({tmpl.totalHours} hrs totales)
                        </span>
                      </div>

                      {tmpl.roleBudgetsRollup && tmpl.roleBudgetsRollup.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {tmpl.roleBudgetsRollup.map((rb) => {
                            const isPending =
                              rb.roleId === ROLE_PENDING_DEFINITION ||
                              rb.roleName === ROLE_PENDING_DEFINITION ||
                              rb.roleId === 'pendiente-definicion';
                            const rolePct = tmpl.totalHours > 0
                              ? Math.round((rb.quotedHours / tmpl.totalHours) * 100)
                              : 0;

                            return (
                              <div
                                key={rb.roleId}
                                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                                  isPending
                                    ? 'bg-[#fffbeb] border-[#fde68a] text-[#b45309]'
                                    : 'bg-white border-[#e2e8f0] text-[#334155]'
                                }`}
                              >
                                <div className="min-w-0 mr-2 truncate">
                                  <span className="font-semibold block truncate">
                                    {isPending ? '⚠️ ' : ''}{rb.roleName}
                                  </span>
                                  <span className="text-[10px] text-[#94a3b8] block">
                                    {rolePct}% del total
                                  </span>
                                </div>
                                <span className={`font-mono font-extrabold text-xs shrink-0 ${isPending ? 'text-[#d97706]' : 'text-[#8a4dff]'}`}>
                                  {rb.quotedHours} h
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-[#94a3b8] italic">Sin desglose de roles registrado.</div>
                      )}
                    </div>

                    {/* Entregables y Actividades Técnicas */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#10b981]" />
                          Entregables marco ({tmpl.deliverables.length}) y Actividades técnicas ({totalActivitiesCount})
                        </span>
                      </div>

                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                        {tmpl.deliverables.map((del, dIdx) => (
                          <div
                            key={del.id}
                            className="p-3 rounded-xl bg-white border border-[#e2e8f0] space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-[#0f172a]">
                              <span>
                                {dIdx + 1}. {del.name}
                              </span>
                              <span className="text-[11px] font-mono font-bold text-[#8a4dff] bg-[#8a4dff]/10 px-2 py-0.5 rounded-md">
                                {del.totalHoursRollup} h
                              </span>
                            </div>

                            <div className="space-y-1 pt-1 border-t border-[#f1f5f9]">
                              {del.activities.map((act) => {
                                const isPending =
                                  act.roleId === ROLE_PENDING_DEFINITION ||
                                  act.roleName === ROLE_PENDING_DEFINITION ||
                                  act.roleId === 'pendiente-definicion';
                                return (
                                  <div
                                    key={act.id}
                                    className="flex items-center justify-between text-[11px] text-[#64748b] pl-2 border-l-2 border-[#8a4dff]/40 py-0.5"
                                  >
                                    <span className="truncate mr-2 text-[#334155]">
                                      {act.title}
                                      {act.optional && (
                                        <span className="ml-1 text-[9px] text-[#f59e0b] font-semibold">
                                          (opcional)
                                        </span>
                                      )}
                                    </span>
                                    <span
                                      className={`shrink-0 font-medium ${
                                        isPending
                                          ? 'text-[#b45309] bg-[#fffbeb] px-1.5 py-0.2 rounded border border-[#fde68a] text-[10px]'
                                          : 'text-[#64748b]'
                                      }`}
                                    >
                                      {isPending ? '⚠️ ' : ''}{act.roleName} · <strong className="text-[#0f172a]">{act.estimatedHours}h</strong>
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Barra de Acciones del Detalle Expandido */}
                    <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between flex-wrap gap-2">
                      <div className="text-[11px] text-[#94a3b8]">
                        ID: <span className="font-mono">{tmpl.id}</span> · Versión: <span className="font-mono">v{tmpl.version}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {canEditTemplate && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(tmpl)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#cbd5e1] bg-white hover:bg-[#f1f5f9] text-[#0f172a] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#501f92]" />
                            <span>Editar servicio</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenCloneModal(tmpl.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#30108b] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#d4ff4a]" />
                          <span>Usar en New Business</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE EDICIÓN / CREACIÓN */}
      <TemplateEditorModal
        isOpen={isEditorModalOpen}
        template={editingTemplate}
        onClose={() => setIsEditorModalOpen(false)}
        onSave={handleSaveTemplate}
      />

      {/* MODAL DE CLONADO / CREAR COTIZACIÓN */}
      <CloneToQuoteModal
        isOpen={isCloneModalOpen}
        templates={templates}
        opportunities={opportunities}
        preselectedTemplateId={templateToCloneId}
        onClose={() => setIsCloneModalOpen(false)}
        onSaveToOpportunity={(oppId, quote) => {
          if (onSaveToOpportunity) {
            onSaveToOpportunity(oppId, quote);
          } else if (onQuoteCreated) {
            onQuoteCreated(quote);
          }
          triggerFeedback(
            `Cotización "${quote.versionLabel}" guardada en la oportunidad (${quote.totalHoursRollup}h).`
          );
        }}
        onCreateOpportunityWithQuote={(oppData, quote) => {
          if (onCreateOpportunityWithQuote) {
            onCreateOpportunityWithQuote(oppData, quote);
          } else if (onQuoteCreated) {
            onQuoteCreated(quote);
          }
          triggerFeedback(
            `Nueva oportunidad "${oppData.title}" creada con la cotización "${quote.versionLabel}" (${quote.totalHoursRollup}h).`
          );
        }}
        onQuoteCreated={handleQuoteCreatedInternal}
      />

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN NO BLOQUEANTE */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-[#0f172a] animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-[#f1f5f9] flex items-center gap-3 bg-[#fff7ed]">
              <div className="w-10 h-10 rounded-xl bg-[#ea580c]/15 text-[#ea580c] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f172a]">
                  Eliminar Plantilla Maestra
                </h3>
                <p className="text-xs text-[#64748b]">
                  Gobernanza de Producto · Uhura Group
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              <p className="text-[#334155] leading-relaxed">
                Estás a punto de eliminar la plantilla maestra{' '}
                <strong className="text-[#0f172a]">"{templateToDelete.name}"</strong> (v{templateToDelete.version}, estado:{' '}
                <span className="font-semibold capitalize text-[#8a4dff]">
                  {templateToDelete.status === 'active'
                    ? 'Activa'
                    : templateToDelete.status === 'draft'
                    ? 'Borrador'
                    : 'Archivada'}
                </span>
                ).
              </p>

              {(() => {
                const quotesUsing = (quotes || []).filter(
                  (q) => q.templateId === templateToDelete.id
                );
                if (quotesUsing.length > 0) {
                  return (
                    <div className="p-3.5 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-[#92400e] space-y-2">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-[#d97706] mt-0.5" />
                        <div>
                          <strong className="block font-bold text-[#b45309]">
                            Plantilla en uso en {quotesUsing.length} cotización(es) existente(s)
                          </strong>
                          <span className="text-[11px] leading-relaxed text-[#78350f] mt-1 block">
                            <strong>Garantía de independencia arquitectónica:</strong> Las cotizaciones creadas en el pipeline (<em>QuoteProposal</em>, <em>QuoteDeliverable</em>, <em>QuoteBacklogItem</em>) son <strong>copias aisladas e independientes</strong>. Eliminar esta plantilla de la biblioteca <strong>NO alterará, borrará ni afectará</strong> ninguna de esas cotizaciones.
                          </span>
                          <span className="text-[11px] text-[#92400e] mt-1.5 block font-medium">
                            No existe bloqueo estructural: puedes eliminar la plantilla si así lo decides.
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b]">
                    Esta plantilla maestra se eliminará de la biblioteca de Producto. Esta acción no se puede deshacer.
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTemplateToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#ef4444] hover:bg-[#dc2626] shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, eliminar plantilla</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
