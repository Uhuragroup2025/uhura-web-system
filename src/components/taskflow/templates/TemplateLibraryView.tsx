import React, { useState, useMemo } from 'react';
import {
  ProductBacklogTemplate,
  ProductBacklogTemplateCategory,
  TemplateStatus,
  QuoteProposal,
  STANDARD_UHURA_ROLES,
  ROLE_PENDING_DEFINITION
} from '../types';
import { TEMPLATE_CATEGORIES } from './templateData';
import { TemplateEditorModal } from './TemplateEditorModal';
import { CloneToQuoteModal } from './CloneToQuoteModal';
import { recalculateTemplateHours } from './templateEngine';
import {
  BookOpen,
  Plus,
  Search,
  SlidersHorizontal,
  Layers,
  Clock,
  Users2,
  Copy,
  Edit3,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  HelpCircle,
  Filter
} from 'lucide-react';

interface TemplateLibraryViewProps {
  templates: ProductBacklogTemplate[];
  onUpdateTemplates: (templates: ProductBacklogTemplate[]) => void;
  onQuoteCreated?: (quote: QuoteProposal) => void;
  quotes?: QuoteProposal[];
}

export const TemplateLibraryView: React.FC<TemplateLibraryViewProps> = ({
  templates,
  onUpdateTemplates,
  onQuoteCreated,
  quotes = []
}) => {
  // Estado de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Estado de modales
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<ProductBacklogTemplate | null>(null);

  const [isCloneModalOpen, setIsCloneModalOpen] = useState<boolean>(false);
  const [templateToCloneId, setTemplateToCloneId] = useState<string | null>(null);

  // Modal de confirmación de eliminación segura de plantilla
  const [templateToDelete, setTemplateToDelete] = useState<ProductBacklogTemplate | null>(null);

  // Acordeón de entregables expandidos por tarjeta
  const [expandedCards, setExpandedCards] = useState<{ [templateId: string]: boolean }>({});

  // Mensaje de éxito flotante
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'info';
    text: string;
  } | null>(null);

  const triggerFeedback = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const toggleCardExpand = (templateId: string) => {
    setExpandedCards((prev) => ({ ...prev, [templateId]: !prev[templateId] }));
  };

  // Filtrado reactivo de plantillas
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.deliverables.some((d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.activities.some((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
        );

      const matchesCategory =
        selectedCategory === 'all' || t.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'all' || t.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [templates, searchQuery, selectedCategory, selectedStatus]);

  // Métricas agregadas
  const metrics = useMemo(() => {
    const activeCount = templates.filter((t) => t.status === 'active').length;
    const totalHoursSum = templates.reduce((sum, t) => sum + (t.totalHours || 0), 0);
    const avgHours = templates.length > 0 ? Math.round((totalHoursSum / templates.length) * 10) / 10 : 0;
    const totalActivities = templates.reduce(
      (sum, t) => sum + t.deliverables.flatMap((d) => d.activities).length,
      0
    );

    return {
      total: templates.length,
      activeCount,
      avgHours,
      totalActivities
    };
  }, [templates]);

  // ACCIONES
  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setIsEditorModalOpen(true);
  };

  const handleOpenEditModal = (tmpl: ProductBacklogTemplate) => {
    setEditingTemplate(tmpl);
    setIsEditorModalOpen(true);
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
  };

  const handleUpdateTemplateStatus = (templateId: string, newStatus: TemplateStatus) => {
    const updated = templates.map((t) =>
      t.id === templateId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    );
    onUpdateTemplates(updated);
    const label = newStatus === 'active' ? 'Activa' : newStatus === 'draft' ? 'Borrador' : 'Archivada';
    triggerFeedback(`Estado de la plantilla actualizado a "${label}".`);
  };

  const handleRequestDelete = (tmpl: ProductBacklogTemplate) => {
    setTemplateToDelete(tmpl);
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-lg ${
            feedbackMessage.type === 'success'
              ? 'bg-[#10b981]/10 text-[#065f46] border-[#10b981]/30'
              : 'bg-[#38bdf8]/10 text-[#0369a1] border-[#38bdf8]/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Principal de Biblioteca */}
      <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#8a4dff]/10 text-[#8a4dff] uppercase tracking-wider">
              Gobernado por Producto
            </span>
            <span className="text-[11px] font-semibold text-[#64748b]">
              Fuente de Verdad Operativa
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
            Biblioteca de Plantillas Maestras
          </h1>
          <p className="text-xs text-[#64748b] max-w-2xl leading-relaxed">
            Estructuras técnicas de productos y servicios Uhura. Define entregables, actividades y roles presupuestados. 
            Al cotizar, Orbit clona una copia independiente para que el equipo ajuste el alcance sin alterar la plantilla maestra.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleOpenCloneModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e2e8f0] hover:bg-[#f8fafc] text-xs font-bold text-[#334155] shadow-2xs transition-colors cursor-pointer"
            title="Crear una cotización directamente sin usar plantilla"
          >
            <Sparkles className="w-4 h-4 text-[#8a4dff]" />
            <span>Crear desde Cero</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8a4dff] hover:bg-[#7839ee] text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Plantilla Maestra</span>
          </button>
        </div>
      </div>

      {/* Métricas Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#64748b] block">Plantillas Activas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-extrabold text-[#0f172a]">{metrics.activeCount}</span>
            <span className="text-[11px] text-[#64748b]">de {metrics.total} totales</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#64748b] block">Categorías de Producto</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-extrabold text-[#8a4dff]">{TEMPLATE_CATEGORIES.length}</span>
            <span className="text-[11px] text-[#64748b]">líneas estándar</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#64748b] block">Promedio de Horas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-extrabold text-[#0f172a]">{metrics.avgHours}h</span>
            <span className="text-[11px] text-[#64748b]">por plantilla</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#64748b] block">Actividades Estructuradas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-extrabold text-[#10b981]">{metrics.totalActivities}</span>
            <span className="text-[11px] text-[#64748b]">tareas con rol</span>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros de Categoría */}
      <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Buscar por nombre, entregable o actividad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#8a4dff] outline-hidden bg-[#f8fafc]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-[#64748b] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Estado:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs text-[#334155] px-2.5 py-1.5 rounded-lg border border-[#cbd5e1] bg-white outline-hidden"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="draft">Borradores</option>
              <option value="archived">Archivadas</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#8a4dff] text-white shadow-2xs'
                : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0f172a]'
            }`}
          >
            Todas ({templates.length})
          </button>
          {TEMPLATE_CATEGORIES.map((cat) => {
            const count = templates.filter((t) => t.category === cat.key).length;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#8a4dff] text-white shadow-2xs'
                    : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0f172a]'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Plantillas */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-[#e2e8f0] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#f1f5f9] flex items-center justify-center mx-auto text-[#94a3b8]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#0f172a]">No se encontraron plantillas maestras</h3>
          <p className="text-xs text-[#64748b] max-w-md mx-auto">
            No hay productos que coincidan con los filtros aplicados. Puedes crear una nueva plantilla maestra o limpiar los filtros.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="px-4 py-2 rounded-lg bg-[#8a4dff]/10 hover:bg-[#8a4dff]/20 text-[#8a4dff] text-xs font-semibold transition-colors cursor-pointer"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTemplates.map((tmpl) => {
            const isExpanded = !!expandedCards[tmpl.id];
            const catMeta = TEMPLATE_CATEGORIES.find((c) => c.key === tmpl.category);
            const totalActivitiesCount = tmpl.deliverables.flatMap((d) => d.activities).length;

            return (
              <div
                key={tmpl.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] hover:border-[#cbd5e1] shadow-2xs flex flex-col justify-between transition-all overflow-hidden"
              >
                {/* Header de la Tarjeta */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                          catMeta ? `${catMeta.badgeBg} ${catMeta.badgeText}` : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {catMeta ? catMeta.label : tmpl.category}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[#64748b]">
                        v{tmpl.version}
                      </span>
                      {/* Selector de Estado Rápido */}
                      <select
                        value={tmpl.status}
                        onChange={(e) =>
                          handleUpdateTemplateStatus(tmpl.id, e.target.value as TemplateStatus)
                        }
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border-0 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#8a4dff] ${
                          tmpl.status === 'active'
                            ? 'bg-[#10b981]/15 text-[#10b981]'
                            : tmpl.status === 'draft'
                            ? 'bg-[#f59e0b]/15 text-[#f59e0b]'
                            : 'bg-[#94a3b8]/15 text-[#64748b]'
                        }`}
                        title="Cambiar estado de la plantilla (Borrador, Activa, Archivada)"
                      >
                        <option value="active">Activa</option>
                        <option value="draft">Borrador</option>
                        <option value="archived">Archivada</option>
                      </select>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                        Nivel 3: Total
                      </span>
                      <span className="text-base font-black text-[#8a4dff]">
                        {tmpl.totalHours} hrs
                      </span>
                    </div>
                  </div>

                  {/* Título y Descripción */}
                  <div>
                    <h3 className="text-sm font-bold text-[#0f172a] hover:text-[#8a4dff] transition-colors">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-[#64748b] mt-1 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  {/* Resumen Estructural (Nivel 1 & 2) */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#f8fafc] border border-[#f1f5f9] text-xs">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#8a4dff]" />
                      <span className="text-[#64748b]">
                        <strong className="text-[#0f172a]">{tmpl.deliverables.length}</strong> entregables marco
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#10b981]" />
                      <span className="text-[#64748b]">
                        <strong className="text-[#0f172a]">{totalActivitiesCount}</strong> actividades técnicas
                      </span>
                    </div>
                  </div>

                  {/* Nivel 2: Desglose de Horas por Rol */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#64748b] block mb-1.5">
                      Nivel 2: Rollup de Horas por Rol:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {tmpl.roleBudgetsRollup && tmpl.roleBudgetsRollup.length > 0 ? (
                        tmpl.roleBudgetsRollup.map((rb) => {
                          const isPending =
                            rb.roleId === ROLE_PENDING_DEFINITION ||
                            rb.roleName === ROLE_PENDING_DEFINITION ||
                            rb.roleId === 'pendiente-definicion';
                          return (
                            <span
                              key={rb.roleId}
                              className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-md border ${
                                isPending
                                  ? 'bg-[#fffbeb] border-[#fde68a] text-[#b45309]'
                                  : 'bg-[#f1f5f9] border-[#e2e8f0] text-[#334155]'
                              }`}
                            >
                              <span className="text-[#64748b] mr-1">
                                {isPending ? '⚠️ ' : ''}{rb.roleName}:
                              </span>
                              <strong className={isPending ? 'text-[#d97706]' : 'text-[#8a4dff]'}>
                                {rb.quotedHours}h
                              </strong>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-[#94a3b8]">Sin desglose de roles</span>
                      )}
                    </div>
                  </div>

                  {/* Toggle para ver detalles de Entregables (Nivel 1) */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleCardExpand(tmpl.id)}
                      className="text-xs font-semibold text-[#8a4dff] hover:text-[#7839ee] flex items-center gap-1 cursor-pointer pt-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Ocultar desglose de entregables y actividades</span>
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span>Ver entregables y actividades técnicas ({tmpl.deliverables.length})</span>
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-[#f1f5f9] max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        {tmpl.deliverables.map((del, dIdx) => (
                          <div key={del.id} className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                            <div className="flex items-center justify-between text-xs font-bold text-[#0f172a] mb-1.5">
                              <span>{dIdx + 1}. {del.name}</span>
                              <span className="text-[11px] font-semibold text-[#8a4dff]">
                                {del.totalHoursRollup}h
                              </span>
                            </div>
                            <div className="space-y-1">
                              {del.activities.map((act, aIdx) => {
                                const isPending =
                                  act.roleId === ROLE_PENDING_DEFINITION ||
                                  act.roleName === ROLE_PENDING_DEFINITION ||
                                  act.roleId === 'pendiente-definicion';
                                return (
                                  <div
                                    key={act.id}
                                    className="flex items-center justify-between text-[11px] text-[#64748b] pl-2 border-l-2 border-[#8a4dff]/40"
                                  >
                                    <span className="truncate mr-2">
                                      {act.title}
                                      {act.optional && (
                                        <span className="ml-1 text-[9px] text-[#f59e0b] font-semibold">
                                          (opcional)
                                        </span>
                                      )}
                                    </span>
                                    <span
                                      className={`shrink-0 font-semibold ${
                                        isPending
                                          ? 'text-[#b45309] bg-[#fffbeb] px-1.5 py-0.5 rounded border border-[#fde68a] text-[10px]'
                                          : 'text-[#334155]'
                                      }`}
                                    >
                                      {isPending ? '⚠️ ' : ''}{act.roleName} · {act.estimatedHours}h
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer de Acciones de la Tarjeta */}
                <div className="px-5 py-3 bg-[#fafbfc] border-t border-[#f1f5f9] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(tmpl)}
                      className="p-1.5 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-lg transition-colors cursor-pointer"
                      title="Editar plantilla maestra"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicateTemplate(tmpl)}
                      className="p-1.5 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-lg transition-colors cursor-pointer"
                      title="Duplicar plantilla maestra como borrador"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRequestDelete(tmpl)}
                      className="p-1.5 text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#fee2e2]/40 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar plantilla"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenCloneModal(tmpl.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8a4dff] hover:bg-[#7839ee] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Usar en Cotización (Clonar)</span>
                  </button>
                </div>
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
        preselectedTemplateId={templateToCloneId}
        onClose={() => setIsCloneModalOpen(false)}
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
