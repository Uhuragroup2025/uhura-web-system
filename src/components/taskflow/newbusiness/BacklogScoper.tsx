import React, { useState, useMemo } from 'react';
import {
  QuoteProposal,
  QuoteDeliverable,
  QuoteBacklogItem,
  STANDARD_UHURA_ROLES,
  StandardUhuraRole,
  ProductBacklogTemplate
} from '../types';
import { computeRoleBudgetsFromActivities, computeTotalHoursFromRoleBudgets } from '../templates/templateEngine';
import {
  Plus,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Info,
  Clock,
  CheckCircle2,
  FileText,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FolderPlus
} from 'lucide-react';

interface BacklogScoperProps {
  quote: QuoteProposal;
  allQuotes: QuoteProposal[];
  onUpdateQuote: (updatedQuote: QuoteProposal) => void;
  onSelectQuoteVersion: (quoteId: string) => void;
  onCreateNewQuoteVersion: (baseQuote?: QuoteProposal) => void;
  templates?: ProductBacklogTemplate[];
  opportunityTitle?: string;
  prospectName?: string;
}

// Role badge styling configuration
const ROLE_BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Desarrollador Web Front-End': { bg: 'bg-[#0284c7]/10', text: 'text-[#0284c7]', border: 'border-[#0284c7]/20' },
  'Product Lead': { bg: 'bg-[#501f92]/10', text: 'text-[#501f92]', border: 'border-[#501f92]/20' },
  'Digital Designer': { bg: 'bg-[#ec4899]/10', text: 'text-[#ec4899]', border: 'border-[#ec4899]/20' },
  'Creative Designer': { bg: 'bg-[#d946ef]/10', text: 'text-[#d946ef]', border: 'border-[#d946ef]/20' },
  'Content Creator': { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/20' },
  'Digital Content Specialist': { bg: 'bg-[#eab308]/10', text: 'text-[#ca8a04]', border: 'border-[#eab308]/20' },
  'Client relationship': { bg: 'bg-[#10b981]/10', text: 'text-[#10b981]', border: 'border-[#10b981]/20' },
  'Creative lead': { bg: 'bg-[#8b5cf6]/10', text: 'text-[#8b5cf6]', border: 'border-[#8b5cf6]/20' },
  'Tracfiker': { bg: 'bg-[#06b6d4]/10', text: 'text-[#06b6d4]', border: 'border-[#06b6d4]/20' },
  'Tracfiker y DigiOps': { bg: 'bg-[#0891b2]/10', text: 'text-[#0891b2]', border: 'border-[#0891b2]/20' },
  'Growth Manager': { bg: 'bg-[#14b8a6]/10', text: 'text-[#14b8a6]', border: 'border-[#14b8a6]/20' },
  'CEO': { bg: 'bg-[#475569]/10', text: 'text-[#475569]', border: 'border-[#475569]/20' },
  'Directora Comercial': { bg: 'bg-[#6366f1]/10', text: 'text-[#6366f1]', border: 'border-[#6366f1]/20' },
  'Administrativa': { bg: 'bg-[#64748b]/10', text: 'text-[#64748b]', border: 'border-[#64748b]/20' }
};

export const BacklogScoper: React.FC<BacklogScoperProps> = ({
  quote,
  allQuotes,
  onUpdateQuote,
  onSelectQuoteVersion,
  onCreateNewQuoteVersion,
  templates = [],
  opportunityTitle,
  prospectName
}) => {
  const [collapsedDeliverables, setCollapsedDeliverables] = useState<Record<string, boolean>>({});
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedTemplateToImport, setSelectedTemplateToImport] = useState<string>('');

  // Toggle collapse for a deliverable card
  const toggleDeliverableCollapse = (delId: string) => {
    setCollapsedDeliverables((prev) => ({
      ...prev,
      [delId]: !prev[delId]
    }));
  };

  // Helper: Recompute rollups for a quote whenever deliverables change
  const recomputeQuoteRollups = (deliverables: QuoteDeliverable[]): QuoteProposal => {
    const updatedDeliverables = deliverables.map((del) => {
      const computedRoleBudgets = computeRoleBudgetsFromActivities(
        del.backlogItems.map((b) => ({
          roleId: b.roleName,
          roleName: b.roleName,
          estimatedHours: b.estimatedHours
        }))
      ).map((rb, idx) => ({
        id: `qrb-${del.id}-${idx}`,
        quoteDeliverableId: del.id,
        roleId: rb.roleId,
        roleName: rb.roleName,
        quotedHours: rb.quotedHours
      }));

      const subtotal = computeTotalHoursFromRoleBudgets(computedRoleBudgets);

      return {
        ...del,
        roleBudgets: computedRoleBudgets,
        totalHoursRollup: subtotal
      };
    });

    const allActivities = updatedDeliverables.flatMap((d) => d.backlogItems);
    const globalRoleBudgets = computeRoleBudgetsFromActivities(
      allActivities.map((b) => ({
        roleId: b.roleName,
        roleName: b.roleName,
        estimatedHours: b.estimatedHours
      }))
    );
    const totalHours = computeTotalHoursFromRoleBudgets(globalRoleBudgets);

    return {
      ...quote,
      deliverables: updatedDeliverables,
      totalHoursRollup: totalHours,
      updatedAt: new Date().toISOString()
    };
  };

  // Deliverable Operations
  const handleAddDeliverable = () => {
    const newDelId = `qdel-${Date.now()}`;
    const newDeliverable: QuoteDeliverable = {
      id: newDelId,
      quoteId: quote.id,
      name: `Nuevo Frente ${quote.deliverables.length + 1}`,
      description: '',
      order: quote.deliverables.length + 1,
      roleBudgets: [],
      backlogItems: [
        {
          id: `act-${Date.now()}-1`,
          quoteDeliverableId: newDelId,
          title: 'Definición y Alcance Inicial',
          roleId: 'Product Lead',
          roleName: 'Product Lead',
          estimatedHours: 4,
          order: 1
        }
      ],
      totalHoursRollup: 4
    };

    const updated = recomputeQuoteRollups([...quote.deliverables, newDeliverable]);
    onUpdateQuote(updated);
  };

  const handleUpdateDeliverableName = (delId: string, name: string) => {
    const updated = quote.deliverables.map((d) => (d.id === delId ? { ...d, name } : d));
    onUpdateQuote(recomputeQuoteRollups(updated));
  };

  const handleUpdateDeliverableDesc = (delId: string, description: string) => {
    const updated = quote.deliverables.map((d) => (d.id === delId ? { ...d, description } : d));
    onUpdateQuote(recomputeQuoteRollups(updated));
  };

  const handleRemoveDeliverable = (delId: string) => {
    if (quote.deliverables.length <= 1) return;
    const updated = quote.deliverables.filter((d) => d.id !== delId);
    onUpdateQuote(recomputeQuoteRollups(updated));
  };

  // Activity (Backlog Item) Operations
  const handleAddActivity = (delId: string) => {
    const newAct: QuoteBacklogItem = {
      id: `act-${Date.now()}`,
      quoteDeliverableId: delId,
      title: '',
      roleId: 'Desarrollador Web Front-End',
      roleName: 'Desarrollador Web Front-End',
      estimatedHours: 8,
      order: 99
    };

    const updated = quote.deliverables.map((d) => {
      if (d.id !== delId) return d;
      return {
        ...d,
        backlogItems: [...d.backlogItems, newAct]
      };
    });

    onUpdateQuote(recomputeQuoteRollups(updated));
  };

  const handleUpdateActivity = (
    delId: string,
    actId: string,
    field: keyof QuoteBacklogItem,
    value: any
  ) => {
    const updated = quote.deliverables.map((d) => {
      if (d.id !== delId) return d;
      const updatedItems = d.backlogItems.map((act) => {
        if (act.id !== actId) return act;
        if (field === 'roleName') {
          return { ...act, roleName: value, roleId: value };
        }
        if (field === 'estimatedHours') {
          return { ...act, estimatedHours: Math.max(0, parseFloat(value) || 0) };
        }
        return { ...act, [field]: value };
      });
      return { ...d, backlogItems: updatedItems };
    });

    onUpdateQuote(recomputeQuoteRollups(updated));
  };

  const handleDuplicateActivity = (delId: string, actId: string) => {
    const targetDel = quote.deliverables.find((d) => d.id === delId);
    if (!targetDel) return;
    const targetAct = targetDel.backlogItems.find((a) => a.id === actId);
    if (!targetAct) return;

    const duplicatedAct: QuoteBacklogItem = {
      ...targetAct,
      id: `act-${Date.now()}`,
      title: `${targetAct.title} (Copia)`,
      order: targetAct.order + 1
    };

    const updated = quote.deliverables.map((d) => {
      if (d.id !== delId) return d;
      return {
        ...d,
        backlogItems: [...d.backlogItems, duplicatedAct]
      };
    });

    onUpdateQuote(recomputeQuoteRollups(updated));
  };

  const handleRemoveActivity = (delId: string, actId: string) => {
    const updated = quote.deliverables.map((d) => {
      if (d.id !== delId) return d;
      return {
        ...d,
        backlogItems: d.backlogItems.filter((a) => a.id !== actId)
      };
    });

    onUpdateQuote(recomputeQuoteRollups(updated));
  };

  // Import template items into current quote
  const handleImportTemplate = () => {
    const tpl = templates.find((t) => t.id === selectedTemplateToImport);
    if (!tpl) return;

    const importedDeliverables: QuoteDeliverable[] = tpl.deliverables.map((td, dIdx) => {
      const delId = `qdel-imported-${Date.now()}-${dIdx}`;
      const backlogItems: QuoteBacklogItem[] = td.activities.map((act, aIdx) => ({
        id: `act-imp-${Date.now()}-${dIdx}-${aIdx}`,
        quoteDeliverableId: delId,
        title: act.title,
        description: act.description,
        roleId: act.roleName,
        roleName: act.roleName,
        estimatedHours: act.estimatedHours,
        order: aIdx + 1
      }));

      return {
        id: delId,
        quoteId: quote.id,
        name: td.name,
        description: td.description,
        order: quote.deliverables.length + dIdx + 1,
        roleBudgets: [],
        backlogItems,
        totalHoursRollup: 0
      };
    });

    const updated = recomputeQuoteRollups([...quote.deliverables, ...importedDeliverables]);
    onUpdateQuote(updated);
    setIsImportModalOpen(false);
    setSelectedTemplateToImport('');
  };

  // Real-Time Rollup Calculations
  const allBacklogItems = useMemo(() => {
    return quote.deliverables.flatMap((d) => d.backlogItems);
  }, [quote.deliverables]);

  const globalRoleRollup = useMemo(() => {
    return computeRoleBudgetsFromActivities(
      allBacklogItems.map((b) => ({
        roleId: b.roleName,
        roleName: b.roleName,
        estimatedHours: b.estimatedHours
      }))
    );
  }, [allBacklogItems]);

  const totalHours = useMemo(() => {
    return computeTotalHoursFromRoleBudgets(globalRoleRollup);
  }, [globalRoleRollup]);

  return (
    <div className="space-y-6">
      {/* Top Scoping Control Bar */}
      <div className="p-4 bg-white rounded-2xl border border-[#e2e8f0] shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Version Selector & Title */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#501f92]/10 text-[#501f92]">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#501f92] bg-[#501f92]/10 px-2 py-0.5 rounded-md">
                  Scoping Operativo de Backlog
                </span>
                <span className="text-xs text-[#64748b]">
                  {allBacklogItems.length} actividades en {quote.deliverables.length} frentes
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={quote.id}
                  onChange={(e) => onSelectQuoteVersion(e.target.value)}
                  className="text-sm font-bold text-[#0f172a] bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-[#501f92] cursor-pointer"
                >
                  {allQuotes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.versionLabel} ({q.totalHoursRollup}h)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onCreateNewQuoteVersion(quote)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#475569] transition-colors cursor-pointer"
                  title="Duplicar este alcance para crear una versión alternativa (ej. MVP priorizado o Fase 2)"
                >
                  <Copy className="w-3.5 h-3.5 text-[#501f92]" />
                  <span>Duplicar Versión</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Import from Template & Add Deliverable */}
        <div className="flex items-center gap-2">
          {templates.length > 0 && (
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#501f92] bg-[#501f92]/10 hover:bg-[#501f92]/15 rounded-xl transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Importar Plantilla Maestra</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAddDeliverable}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Frente de Trabajo</span>
          </button>
        </div>
      </div>

      {/* Main Scoping Grid: Left = Deliverables & Activities / Right = Real-Time Rollup Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Entregables y Actividades (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {quote.deliverables.map((del, delIdx) => {
            const isCollapsed = !!collapsedDeliverables[del.id];
            const delTotalHours = del.backlogItems.reduce(
              (sum, item) => sum + (Number(item.estimatedHours) || 0),
              0
            );

            return (
              <div
                key={del.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden transition-all"
              >
                {/* Deliverable Header */}
                <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleDeliverableCollapse(del.id)}
                      className="text-[#64748b] hover:text-[#0f172a] p-1 rounded transition-colors cursor-pointer"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <span className="w-6 h-6 rounded-full bg-[#501f92]/10 text-[#501f92] text-xs font-bold flex items-center justify-center shrink-0">
                      {delIdx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={del.name}
                        onChange={(e) => handleUpdateDeliverableName(del.id, e.target.value)}
                        placeholder="Nombre del Frente (ej. Desarrollo Web, Diseño UI, Carga de Contenidos...)"
                        className="font-bold text-sm text-[#0f172a] bg-transparent border-b border-transparent hover:border-[#cbd5e1] focus:border-[#501f92] outline-hidden px-1 py-0.5 w-full transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-2.5 py-1 rounded-lg bg-white border border-[#cbd5e1] text-right">
                      <span className="text-[10px] text-[#64748b] font-semibold uppercase mr-1">
                        Subtotal:
                      </span>
                      <span className="text-xs font-black text-[#501f92]">
                        {delTotalHours}h
                      </span>
                    </div>

                    {quote.deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(del.id)}
                        className="p-1.5 text-[#94a3b8] hover:text-[#ef4444] rounded-lg hover:bg-white transition-colors cursor-pointer"
                        title="Eliminar este frente completo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Deliverable Body */}
                {!isCollapsed && (
                  <div className="p-4 space-y-3">
                    {/* Optional Deliverable Description */}
                    <input
                      type="text"
                      value={del.description || ''}
                      onChange={(e) => handleUpdateDeliverableDesc(del.id, e.target.value)}
                      placeholder="Alcance o especificaciones generales de este frente (opcional)..."
                      className="text-xs text-[#64748b] bg-[#f8fafc]/60 border border-transparent hover:border-[#e2e8f0] focus:border-[#501f92] rounded-lg px-2.5 py-1.5 w-full outline-hidden transition-colors"
                    />

                    {/* Activities List (Table-like cards) */}
                    <div className="space-y-2 pt-1">
                      {del.backlogItems.length === 0 ? (
                        <div className="p-4 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-center text-xs text-[#64748b]">
                          No hay actividades en este frente. Haz clic en <strong>"+ Agregar Actividad"</strong> abajo.
                        </div>
                      ) : (
                        del.backlogItems.map((act, actIdx) => {
                          const badgeStyle =
                            ROLE_BADGE_STYLES[act.roleName] || {
                              bg: 'bg-[#501f92]/10',
                              text: 'text-[#501f92]',
                              border: 'border-[#501f92]/20'
                            };

                          return (
                            <div
                              key={act.id}
                              className="p-2.5 rounded-xl border border-[#e2e8f0] bg-white hover:border-[#cbd5e1] transition-all flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 group shadow-2xs"
                            >
                              {/* Left: Index & Title */}
                              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                <span className="text-[10px] font-bold text-[#94a3b8] w-4 shrink-0 text-center">
                                  {actIdx + 1}.
                                </span>
                                <input
                                  type="text"
                                  value={act.title}
                                  onChange={(e) =>
                                    handleUpdateActivity(del.id, act.id, 'title', e.target.value)
                                  }
                                  placeholder="Nombre de la actividad (ej. Home, Buscador, Checkout...)"
                                  className="text-xs font-semibold text-[#0f172a] bg-transparent border-b border-transparent hover:border-[#cbd5e1] focus:border-[#501f92] outline-hidden px-1 py-0.5 w-full transition-colors"
                                />
                              </div>

                              {/* Center: Role Dropdown with badge */}
                              <div className="flex items-center gap-2 shrink-0">
                                <select
                                  value={act.roleName}
                                  onChange={(e) =>
                                    handleUpdateActivity(
                                      del.id,
                                      act.id,
                                      'roleName',
                                      e.target.value as StandardUhuraRole
                                    )
                                  }
                                  className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${badgeStyle.border} ${badgeStyle.bg} ${badgeStyle.text} focus:ring-1 focus:ring-[#501f92] cursor-pointer outline-hidden`}
                                >
                                  {STANDARD_UHURA_ROLES.map((role) => (
                                    <option key={role} value={role} className="bg-white text-[#0f172a]">
                                      {role}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Right: Estimated Hours Input & Actions */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <div className="flex items-center gap-1 bg-[#f8fafc] px-2 py-1 rounded-lg border border-[#cbd5e1]">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={act.estimatedHours}
                                    onChange={(e) =>
                                      handleUpdateActivity(
                                        del.id,
                                        act.id,
                                        'estimatedHours',
                                        e.target.value
                                      )
                                    }
                                    className="w-14 text-right text-xs font-bold text-[#0f172a] bg-transparent outline-hidden"
                                  />
                                  <span className="text-[11px] font-black text-[#501f92]">h</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDuplicateActivity(del.id, act.id)}
                                  className="p-1 text-[#94a3b8] hover:text-[#501f92] rounded transition-colors cursor-pointer"
                                  title="Duplicar actividad"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveActivity(del.id, act.id)}
                                  className="p-1 text-[#94a3b8] hover:text-[#ef4444] rounded transition-colors cursor-pointer"
                                  title="Eliminar actividad"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add Activity Button in this deliverable */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleAddActivity(del.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#501f92] hover:bg-[#501f92]/5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Actividad</span>
                      </button>

                      <div className="text-[11px] text-[#64748b]">
                        {del.backlogItems.length} actividad(es) · Subtotal: <strong className="text-[#0f172a]">{delTotalHours}h</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom Add Deliverable CTA */}
          <button
            type="button"
            onClick={handleAddDeliverable}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[#cbd5e1] hover:border-[#501f92] bg-white hover:bg-[#501f92]/5 text-xs font-bold text-[#501f92] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Agregar Otro Frente / Entregable</span>
          </button>
        </div>

        {/* Right Column: Dynamic Rollup Engine (4 cols - Sticky) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
          {/* Card: Rollup de Horas por Rol (Nivel 2) */}
          <div className="p-5 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#501f92]">
                  Nivel 2 · Rollup Dinámico
                </span>
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Horas Cotizadas por Rol
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#64748b] block uppercase font-bold">
                  Nivel 3: Total
                </span>
                <span className="text-lg font-black text-[#501f92]">
                  {totalHours}h
                </span>
              </div>
            </div>

            {/* Explanatory note matching user prompt */}
            <div className="p-2.5 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] text-[11px] text-[#475569] leading-relaxed flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#501f92] shrink-0 mt-0.5" />
              <span>
                <strong>El backlog genera las horas:</strong> Cada actividad suma automáticamente al rol correspondiente. Este rollup se conecta directo al Cotizador Financiero (Fase 2).
              </span>
            </div>

            {/* Breakdown by Role with progress bar */}
            <div className="space-y-3">
              {globalRoleRollup.length === 0 ? (
                <p className="text-xs text-[#94a3b8] italic text-center py-2">
                  No hay horas estimadas todavía.
                </p>
              ) : (
                globalRoleRollup.map((rb) => {
                  const percentage = totalHours > 0 ? Math.round((rb.quotedHours / totalHours) * 100) : 0;
                  const badgeStyle =
                    ROLE_BADGE_STYLES[rb.roleName] || {
                      bg: 'bg-[#501f92]/10',
                      text: 'text-[#501f92]',
                      border: 'border-[#501f92]/20'
                    };

                  return (
                    <div key={rb.roleId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#0f172a] flex items-center gap-1.5 truncate max-w-[180px]">
                          <span
                            className={`w-2 h-2 rounded-full ${badgeStyle.bg} border ${badgeStyle.border}`}
                          />
                          <span title={rb.roleName}>{rb.roleName}</span>
                        </span>
                        <div className="text-right shrink-0">
                          <strong className="text-[#0f172a]">{rb.quotedHours}h</strong>
                          <span className="text-[10px] text-[#64748b] ml-1">({percentage}%)</span>
                        </div>
                      </div>

                      {/* Visual Bar */}
                      <div className="w-full bg-[#f1f5f9] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#501f92] h-full rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Deliverables Subtotal Rollup */}
            <div className="pt-3 border-t border-[#f1f5f9] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                Distribución por Frente:
              </span>
              <div className="space-y-1.5">
                {quote.deliverables.map((del) => {
                  const subtotal = del.backlogItems.reduce(
                    (acc, act) => acc + (Number(act.estimatedHours) || 0),
                    0
                  );
                  const pct = totalHours > 0 ? Math.round((subtotal / totalHours) * 100) : 0;

                  return (
                    <div
                      key={del.id}
                      className="flex items-center justify-between text-[11px] text-[#475569]"
                    >
                      <span className="truncate mr-2 max-w-[200px]" title={del.name}>
                        {del.name}
                      </span>
                      <span className="font-semibold text-[#0f172a] shrink-0">
                        {subtotal}h ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bucky Beaver Quality & Scoping Insights */}
          <div className="p-4 bg-linear-to-br from-[#501f92]/5 to-[#7c3aed]/5 rounded-2xl border border-[#501f92]/20 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">🦫</span>
              <h4 className="text-xs font-bold text-[#501f92]">
                Copiloto Bucky · Auditoría del Backlog
              </h4>
            </div>
            <p className="text-[11px] text-[#475569] leading-relaxed">
              {totalHours > 0 ? (
                <>
                  Has estructurado <strong>{totalHours}h</strong> de esfuerzo técnico en{' '}
                  <strong>{allBacklogItems.length} actividades</strong>. El frente con mayor peso es{' '}
                  <strong className="text-[#501f92]">
                    {quote.deliverables[0]?.name || 'el primer entregable'}
                  </strong>.
                </>
              ) : (
                'Comienza añadiendo horas a las actividades para calcular el esfuerzo de cada rol.'
              )}
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[10px] text-[#059669] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Rollup dinámico sincronizado para Fase 2 (Cotizador)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Import Template Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#e2e8f0] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#501f92]/10 text-[#501f92]">
                  <BookOpen className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">
                    Importar desde Plantilla Maestra
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Clona actividades y horas base de productos estándar de Uhura
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-[#94a3b8] hover:text-[#0f172a] text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#475569] block">
                Selecciona la Plantilla:
              </label>
              <select
                value={selectedTemplateToImport}
                onChange={(e) => setSelectedTemplateToImport(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] text-[#0f172a] focus:ring-2 focus:ring-[#501f92]"
              >
                <option value="">-- Elige una plantilla del catálogo --</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} ({tpl.totalHours}h totales)
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplateToImport && (
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] text-xs text-[#64748b] space-y-1">
                {(() => {
                  const t = templates.find((item) => item.id === selectedTemplateToImport);
                  if (!t) return null;
                  return (
                    <>
                      <div className="font-bold text-[#0f172a]">{t.name}</div>
                      <div>{t.description}</div>
                      <div className="text-[11px] text-[#501f92] font-semibold pt-1">
                        Aportará {t.deliverables.length} frentes y {t.totalHours}h de actividades al alcance actual.
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#64748b] hover:text-[#0f172a]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selectedTemplateToImport}
                onClick={handleImportTemplate}
                className="px-4 py-2 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] disabled:opacity-40 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Importar al Backlog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
