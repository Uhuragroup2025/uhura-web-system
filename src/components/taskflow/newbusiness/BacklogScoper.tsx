import React, { useState, useMemo, useEffect } from 'react';
import {
  QuoteProposal,
  QuoteDeliverable,
  QuoteBacklogItem,
  STANDARD_UHURA_ROLES,
  StandardUhuraRole,
  UserItem,
  ProductBacklogTemplate
} from '../types';
import { serviceValidationMessages, isEligibleTeamMember, suggestActivityOwners, effectiveAssigneeRole, getScopeWeeks } from './teamCandidates';
import { computeRoleBudgetsFromActivities, computeTotalHoursFromRoleBudgets } from '../templates/templateEngine';
import {
  Plus,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Info,
  Clock,
  CheckCircle2,
  FileText,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FolderPlus,
  GripVertical,
  Pencil
} from 'lucide-react';

// Metadatos visuales de la sesión; no forman parte del modelo ni del contrato de la oportunidad.
export type ScopeServiceDraft = { id: string; name: string; deliverableIds: string[]; weeks: string; saved?: boolean };

interface BacklogScoperProps {
  readOnly?: boolean;
  onRequestEdit?: () => void;
  services: ScopeServiceDraft[];
  onChangeServices: (services: ScopeServiceDraft[]) => void;
  quote: QuoteProposal;
  onUpdateQuote: (updatedQuote: QuoteProposal) => void;
  templates?: ProductBacklogTemplate[];
  opportunityTitle?: string;
  prospectName?: string;
  onGoToCalculator?: () => void;
  onMarkScopeReady?: (totalHours: number) => void;
  opportunityStatus?: string;
  commercialOwner?: string;
  users?: UserItem[];
}

// Role badge styling configuration for 12 canonical Uhura roles
const ROLE_BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Front-End Dev': { bg: 'bg-[#0284c7]/10', text: 'text-[#0284c7]', border: 'border-[#0284c7]/20' },
  'Product Lead': { bg: 'bg-[#501f92]/10', text: 'text-[#501f92]', border: 'border-[#501f92]/20' },
  'Digital Designer': { bg: 'bg-[#ec4899]/10', text: 'text-[#ec4899]', border: 'border-[#ec4899]/20' },
  'Creative Designer': { bg: 'bg-[#d946ef]/10', text: 'text-[#d946ef]', border: 'border-[#d946ef]/20' },
  'Content Creator': { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/20' },
  'Digital Content Specialist': { bg: 'bg-[#eab308]/10', text: 'text-[#ca8a04]', border: 'border-[#eab308]/20' },
  'Client Relationship Strategist': { bg: 'bg-[#10b981]/10', text: 'text-[#10b981]', border: 'border-[#10b981]/20' },
  'Creative Strategy Lead': { bg: 'bg-[#8b5cf6]/10', text: 'text-[#8b5cf6]', border: 'border-[#8b5cf6]/20' },
  'Trafficker Media': { bg: 'bg-[#06b6d4]/10', text: 'text-[#06b6d4]', border: 'border-[#06b6d4]/20' },
  'Growth Manager': { bg: 'bg-[#14b8a6]/10', text: 'text-[#14b8a6]', border: 'border-[#14b8a6]/20' },
  'Community Manager': { bg: 'bg-[#10b981]/10', text: 'text-[#059669]', border: 'border-[#10b981]/20' },
  'Directora Comercial': { bg: 'bg-[#6366f1]/10', text: 'text-[#6366f1]', border: 'border-[#6366f1]/20' },
  // Compatibility fallback for legacy entries
  'Desarrollador Web Front-End': { bg: 'bg-[#0284c7]/10', text: 'text-[#0284c7]', border: 'border-[#0284c7]/20' },
  'Client relationship': { bg: 'bg-[#10b981]/10', text: 'text-[#10b981]', border: 'border-[#10b981]/20' }
};

export const BacklogScoper: React.FC<BacklogScoperProps> = ({
  quote,
  readOnly = false,
  onRequestEdit,
  services,
  onChangeServices,
  onUpdateQuote,
  templates = [],
  opportunityTitle,
  prospectName,
  onGoToCalculator,
  onMarkScopeReady,
  opportunityStatus,
  commercialOwner,
  users: teamUsers = []
}) => {
  const users = teamUsers.filter((user) => user.status === 'Active');
  const [savedServiceFeedback, setSavedServiceFeedback] = useState<string | null>(null);
  useEffect(() => { if (!savedServiceFeedback) return; const timer = setTimeout(() => setSavedServiceFeedback(null), 3000); return () => clearTimeout(timer); }, [savedServiceFeedback]);
  const dragged = React.useRef<{ deliverableId: string; activityId?: string } | null>(null);
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
    const updatedDeliverables = deliverables.map((del, index) => {
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
        order: index + 1,
        backlogItems: del.backlogItems.map((item, activityIndex) => ({ ...item, order: activityIndex + 1 })),
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
  const handleAddDeliverable = (service?: ScopeServiceDraft) => {
    const newDelId = `qdel-${Date.now()}`;
    const newDeliverable: QuoteDeliverable = {
      id: newDelId,
      quoteId: quote.id,
      name: 'Nuevo entregable',
      description: '',
      order: quote.deliverables.length + 1,
      roleBudgets: [],
      backlogItems: [],
      totalHoursRollup: 0
    };

    const ordered = [...quote.deliverables].sort((a, b) => a.order - b.order);
    const lastIndex = service ? ordered.reduce((last, item, index) => service.deliverableIds.includes(item.id) ? index : last, -1) : ordered.length - 1;
    ordered.splice(lastIndex + 1, 0, newDeliverable);
    onUpdateQuote(recomputeQuoteRollups(ordered.map((item, index) => ({ ...item, order: index + 1 }))));
    onChangeServices(service
      ? services.map((item) => item.id === service.id ? { ...item, deliverableIds: [...item.deliverableIds, newDelId], saved: false } : item)
      : [...services, { id: `service-${newDelId}`, name: 'Servicio a medida', deliverableIds: [newDelId], weeks: '', saved: false }]);
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
    const updated = quote.deliverables.filter((d) => d.id !== delId);
    onUpdateQuote(recomputeQuoteRollups(updated));
  };

  const handleDrop = (event: React.DragEvent, deliverableId: string, activityId?: string) => {
    event.preventDefault();
    event.stopPropagation();
    const source = dragged.current;
    dragged.current = null;
    if (!source || Boolean(source.activityId) !== Boolean(activityId)) return;
    if (!activityId) {
      const list = [...quote.deliverables].sort((a, b) => a.order - b.order);
      const from = list.findIndex((item) => item.id === source.deliverableId);
      const to = list.findIndex((item) => item.id === deliverableId);
      if (from < 0 || to < 0 || from === to) return;
      list.splice(to, 0, list.splice(from, 1)[0]);
      onUpdateQuote(recomputeQuoteRollups(list.map((item, index) => ({ ...item, order: index + 1 }))));
      return;
    }
    if (source.deliverableId !== deliverableId) return;
    const list = quote.deliverables.map((del) => {
      if (del.id !== deliverableId) return del;
      const activities = [...del.backlogItems].sort((a, b) => a.order - b.order);
      const from = activities.findIndex((item) => item.id === source.activityId);
      const to = activities.findIndex((item) => item.id === activityId);
      if (from < 0 || to < 0) return del;
      activities.splice(to, 0, activities.splice(from, 1)[0]);
      return { ...del, backlogItems: activities.map((item, index) => ({ ...item, order: index + 1 })) };
    });
    onUpdateQuote(recomputeQuoteRollups(list));
  };

  // Activity (Backlog Item) Operations
  const handleAddActivity = (delId: string) => {
    const newAct: QuoteBacklogItem = {
      id: `act-${Date.now()}`,
      quoteDeliverableId: delId,
      title: '',
      roleId: 'Front-End Dev',
      roleName: 'Front-End Dev',
      estimatedHours: 8,
      suggestedUserId: null,
      suggestedUserName: null,
      order: (quote.deliverables.find((del) => del.id === delId)?.backlogItems.length || 0) + 1
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
        if (field === 'suggestedUserId') {
          const user = users.find((u) => u.id === value && isEligibleTeamMember(u));
          const role = user ? effectiveAssigneeRole(user, act.roleName) : act.roleName;
          return { ...act, suggestedUserId: user?.id || null, suggestedUserName: user?.name || null, roleName: role, roleId: role };
        }
        if (field === 'roleName') {
          const currentUser = users.find((user) => user.id === act.suggestedUserId && isEligibleTeamMember(user));
          const keepAssignee = currentUser && effectiveAssigneeRole(currentUser, value) === value;
          return { ...act, roleName: value, roleId: value, suggestedUserId: keepAssignee ? act.suggestedUserId : null, suggestedUserName: keepAssignee ? act.suggestedUserName : null };
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
      suggestedUserId: null,
      suggestedUserName: null,
      order: targetDel.backlogItems.length + 1
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

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImportModalOpen) {
        setIsImportModalOpen(false);
      }
    };
    if (isImportModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImportModalOpen]);

  // Import template items into current quote (incremental import)
  const handleImportTemplate = () => {
    const tpl = templates.find((t) => t.id === selectedTemplateToImport);
    if (!tpl) return;

    const importId = crypto.randomUUID();
    const templateDeliverables: QuoteDeliverable[] = tpl.deliverables.map((td, dIdx) => {
      const delId = `qdel-imported-${importId}-${dIdx}`;
      const backlogItems: QuoteBacklogItem[] = td.activities.map((act, aIdx) => {
        return {
          id: `act-imp-${Date.now()}-${dIdx}-${aIdx}`,
          quoteDeliverableId: delId,
          title: act.title,
          description: act.description,
          roleId: act.roleName,
          roleName: act.roleName,
          estimatedHours: act.estimatedHours,
          suggestedUserId: null,
          suggestedUserName: null,
          order: aIdx + 1
        };
      });

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

    const importedDeliverables = suggestActivityOwners(templateDeliverables, users, quote.deliverables);

    // UX: Incremental import keeps the first newly imported deliverable expanded,
    // and collapses all subsequent newly imported deliverables.
    const newCollapsedState: Record<string, boolean> = {};
    importedDeliverables.forEach((del, idx) => {
      if (idx > 0) {
        newCollapsedState[del.id] = true;
      }
    });

    setCollapsedDeliverables((prev) => ({
      ...prev,
      ...newCollapsedState
    }));

    onChangeServices([...services, { id: importId, name: tpl.name,
      deliverableIds: importedDeliverables.map((deliverable) => deliverable.id), weeks: '', saved: false }]);
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

  const serviceHeader = (service: ScopeServiceDraft) => {
    const issues = serviceValidationMessages(service);
    const serviceHours = quote.deliverables.filter((item) => service.deliverableIds.includes(item.id)).flatMap((item) => item.backlogItems).reduce((sum, item) => sum + item.estimatedHours, 0);
    const locked = Boolean(readOnly || service.saved) && issues.length === 0;
    return <section data-service={service.id} className="rounded-xl border border-[#ddd6fe] bg-[#f5f3ff] px-4 py-3 space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold text-[#3b176d]">{service.name}</h3>
        <span className="rounded-full px-2 py-1 bg-[#ede9fe] text-xs font-bold text-[#501f92]">{serviceHours.toLocaleString('es-CO')} h</span>
        {locked && <span className="rounded-full px-2 py-1 bg-[#ede9fe] text-xs font-bold text-[#501f92]">{service.weeks} semanas</span>}
        <button type="button" disabled={!locked && issues.length > 0} aria-label={`${locked ? 'Editar' : 'Guardar'} servicio ${service.name}`}
          onClick={() => {
            if (!locked && issues.length > 0) return;
            if (readOnly) onRequestEdit?.();
            onChangeServices(services.map((item) => item.id === service.id ? { ...item, saved: !locked } : item));
            setSavedServiceFeedback(locked ? null : service.id);
          }} className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed ${locked ? 'bg-white border-[#cbd5e1] text-[#501f92]' : 'bg-[#501f92] border-[#501f92] text-white hover:bg-[#3d1572] shadow-sm'}`}>
          {locked ? <Pencil className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}{locked ? 'Editar servicio' : 'Guardar servicio'}
        </button>
      </div>
      {savedServiceFeedback === service.id && <p role="status" className="text-xs font-semibold text-[#047857]">Servicio guardado. El alcance general continúa pendiente de revisión.</p>}
      {!locked && issues.map((issue) => <p key={issue} role="status" className="text-xs text-[#b45309]">{issue}</p>)}
      {!locked && <label className="flex items-center gap-3 text-xs font-semibold text-[#475569]">Duración del servicio en semanas
          <input aria-label={`Semanas del servicio ${service.name}`} type="number" min="1" step="1" value={service.weeks}
            onChange={(event) => onChangeServices(services.map((item) => item.id === service.id ? { ...item, weeks: event.target.value, saved: false } : item))}
            className="w-24 border border-[#c4b5fd] rounded-lg bg-white px-2 py-1.5" />
        </label>}
    </section>;
  };

  const hoursSummary = <aside aria-label="Resumen de horas del alcance" className="lg:col-span-4 lg:sticky lg:top-4 p-5 rounded-2xl border border-[#e2e8f0] bg-white space-y-4">
    <h3 className="font-bold text-[#0f172a]">Resumen del alcance</h3>
    <div className="border-b border-[#e2e8f0] pb-4"><strong className="text-4xl font-bold text-[#501f92]">{totalHours.toLocaleString('es-CO')} h</strong><p className="text-xs text-[#64748b] mt-1">Esfuerzo total estimado</p></div>
    <h3 className="font-bold text-[#0f172a]">Horas por rol</h3>
    <div className="divide-y divide-[#f1f5f9]">{globalRoleRollup.map((role) => <div key={role.roleId} className="flex justify-between gap-3 text-xs py-2"><span>{role.roleName}</span><strong className="whitespace-nowrap">{role.quotedHours.toLocaleString('es-CO')} h</strong></div>)}</div>
    <h3 className="font-bold text-[#0f172a] border-t border-[#e2e8f0] pt-3">Horas por servicio</h3>
    <div className="divide-y divide-[#f1f5f9]">{services.map((service) => <div key={service.id} className="flex justify-between gap-3 text-xs py-2"><span>{service.name}</span><strong className="whitespace-nowrap">{quote.deliverables.filter((item) => service.deliverableIds.includes(item.id)).flatMap((item) => item.backlogItems).reduce((sum, item) => sum + item.estimatedHours, 0).toLocaleString('es-CO')} h</strong></div>)}</div>
    <div className="border-t border-[#e2e8f0] pt-3 flex justify-between gap-3"><h3 className="font-bold text-[#0f172a]">Semanas totales</h3><strong className="text-[#501f92]">{getScopeWeeks(quote, services) || 'Pendiente'}</strong></div>
    <p className="text-xs text-[#64748b]">Duración del servicio más largo. Los servicios pueden ejecutarse en paralelo.</p>
  </aside>;

  const readingDeliverable = (deliverable: QuoteDeliverable) => <article className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
    <div className="px-4 py-3 flex justify-between gap-3"><h4 className="font-bold text-sm">{deliverable.name}</h4><strong className="text-xs text-[#501f92] whitespace-nowrap">Subtotal: {deliverable.backlogItems.reduce((sum, item) => sum + item.estimatedHours, 0).toLocaleString('es-CO')} h</strong></div>
    <div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead className="bg-[#f8fafc] text-[#64748b]"><tr><th className="px-4 py-2 font-medium">Actividad</th><th className="px-3 py-2 font-medium">Rol</th><th className="px-3 py-2 font-medium">Responsable</th><th className="px-3 py-2 font-medium">Horas</th></tr></thead>
    <tbody className="divide-y divide-[#f1f5f9]">{[...deliverable.backlogItems].sort((a,b) => a.order-b.order).map((activity) => <tr key={activity.id}><td className="px-4 py-2">{activity.title || 'Actividad sin título'}</td><td className="px-3 py-2">{activity.roleName}</td><td className="px-3 py-2"><span className="inline-block rounded bg-[#f1f5f9] px-2 py-1 whitespace-nowrap">{users.find((user) => user.id === activity.suggestedUserId)?.name || 'Sin asignar'}</span></td><td className="px-3 py-2 whitespace-nowrap">{activity.estimatedHours.toLocaleString('es-CO')} h</td></tr>)}</tbody></table></div>
  </article>;

  const orderedDeliverables = [...quote.deliverables].sort((a, b) => a.order - b.order);
  if (readOnly) return <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    <div className="lg:col-span-8 space-y-4" aria-label="Alcance guardado">{orderedDeliverables.map((deliverable) => {
      const service = services.find((item) => item.deliverableIds.includes(deliverable.id));
      return <div key={deliverable.id} className="space-y-3">
        {service && orderedDeliverables.find((item) => service.deliverableIds.includes(item.id))?.id === deliverable.id && serviceHeader(service)}
        {readingDeliverable(deliverable)}
      </div>;
    })}</div>
    {hoursSummary}
  </div>;

  return (
    <div className="space-y-6">
      <p className="text-xs text-[#64748b]">Responsables sugeridos por rol y menor carga registrada; editables antes de guardar. La carga no refleja disponibilidad semanal. Cambiar la persona actualiza el rol cotizado.</p>
      {/* Main Scoping Grid: Left = Deliverables & Activities / Right = Real-Time Rollup Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Entregables y Actividades (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {quote.deliverables.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border-2 border-dashed border-[#cbd5e1] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#501f92]/10 flex items-center justify-center mx-auto text-[#501f92]">
                <Layers className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#0f172a]">
                  ¿Cómo quieres iniciar el alcance?
                </h3>
                <p className="text-xs text-[#64748b] max-w-md mx-auto">
                  Como líder técnico, puedes partir de una plantilla oficial del catálogo o estructurar un alcance a medida desde cero.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {templates.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-[#501f92] bg-[#501f92]/10 hover:bg-[#501f92]/20 border border-[#501f92]/30 rounded-2xl transition-colors cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="w-4 h-4 text-[#501f92]" />
                    <span>Agregar plantilla</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleAddDeliverable()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] rounded-2xl transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 text-[#d4ff4a]" />
                  <span>Crear alcance a medida</span>
                </button>
              </div>
            </div>
          ) : (
            [...quote.deliverables].sort((a, b) => a.order - b.order).map((del, delIdx) => {
              const isCollapsed = !!collapsedDeliverables[del.id];
              const delTotalHours = del.backlogItems.reduce(
                (sum, item) => sum + (Number(item.estimatedHours) || 0),
                0
              );

              const service = services.find((item) => item.deliverableIds.includes(del.id));
              return (
                <div key={del.id} className="space-y-4">
                {service && orderedDeliverables.find((item) => service.deliverableIds.includes(item.id))?.id === del.id && serviceHeader(service)}
                {service?.saved && serviceValidationMessages(service).length === 0 ? readingDeliverable(del) : <div
                  key={del.id}
                  onDragEnter={(event) => event.preventDefault()}
                  onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
                  onDrop={(event) => handleDrop(event, del.id)}
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
                      <button
                        type="button" draggable aria-label="Arrastrar para reordenar"
                        className="cursor-grab active:cursor-grabbing"
                        onDragStart={(event) => {
                          event.stopPropagation();
                          dragged.current = { deliverableId: del.id };
                          event.dataTransfer.effectAllowed = 'move';
                          event.dataTransfer.setData('text/plain', del.id);
                        }}
                        onDragEnd={() => { dragged.current = null; }}
                      >
                        <GripVertical className="w-4 h-4 text-[#94a3b8] shrink-0 opacity-70 hover:opacity-100" />
                      </button>
                      <span className="w-6 h-6 rounded-full bg-[#501f92]/10 text-[#501f92] text-xs font-bold flex items-center justify-center shrink-0">
                        {delIdx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={del.name}
                          onChange={(e) => handleUpdateDeliverableName(del.id, e.target.value)}
                          placeholder="Nombre del entregable (Ej: Migración)"
                          className="font-bold text-sm text-[#0f172a] bg-transparent border-b border-transparent hover:border-[#cbd5e1] focus:border-[#501f92] outline-hidden px-1 py-0.5 w-full transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="px-2.5 py-1 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-right">
                        <span className="text-[10px] text-[#64748b] font-medium mr-1">
                          Subtotal:
                        </span>
                        <span className="text-xs font-bold font-mono text-[#501f92]">
                          {delTotalHours}h
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(del.id)}
                        className="p-1.5 text-[#94a3b8] hover:text-[#ef4444] rounded-lg hover:bg-white transition-colors cursor-pointer"
                        title="Eliminar este entregable"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                        placeholder="Alcance o especificaciones generales de este servicio (opcional)..."
                        className="text-xs text-[#0f172a] placeholder:text-[#7C8AA0] placeholder:font-normal bg-[#f8fafc]/60 border border-transparent hover:border-[#e2e8f0] focus:border-[#501f92] rounded-lg px-2.5 py-1.5 w-full outline-hidden transition-colors"
                      />

                      {/* Activities List: Tabla limpia con divisores y acciones en hover */}
                      <div className="pt-1">
                        {del.backlogItems.length === 0 ? (
                          <div className="p-4 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-center text-xs text-[#64748b]">
                            No hay actividades en este servicio. Haz clic en <strong>"Agregar actividad"</strong> abajo.
                          </div>
                        ) : (
                          <div className="rounded-xl border border-[#e2e8f0] bg-white divide-y divide-[#f1f5f9] overflow-hidden">
                            {[...del.backlogItems].sort((a, b) => a.order - b.order).map((act, actIdx) => {
                              const badgeStyle =
                                ROLE_BADGE_STYLES[act.roleName] || {
                                  bg: 'bg-[#501f92]/10',
                                  text: 'text-[#501f92]',
                                  border: 'border-[#501f92]/20'
                                };

                              return (
                                <div
                                  key={act.id}
                                  onDragOver={(event) => { event.preventDefault(); event.stopPropagation(); event.dataTransfer.dropEffect = 'move'; }}
                                  onDrop={(event) => handleDrop(event, del.id, dragged.current?.activityId ? act.id : undefined)}
                                  className="px-3 py-2 flex items-center justify-between gap-2.5 hover:bg-[#f8fafc] transition-colors group"
                                >
                                  {/* Left: Drag Handle, Index & Title */}
                                  <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                                    <button
                                      type="button" draggable aria-label="Arrastrar para reordenar"
                                      className="cursor-grab active:cursor-grabbing"
                                      onDragStart={(event) => {
                                        event.stopPropagation();
                                        dragged.current = { deliverableId: del.id, activityId: act.id };
                                        event.dataTransfer.effectAllowed = 'move';
                                        event.dataTransfer.setData('text/plain', act.id);
                                      }}
                                      onDragEnd={() => { dragged.current = null; }}
                                    >
                                      <GripVertical className="w-3.5 h-3.5 text-[#94a3b8] shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                    <span className="text-[11px] font-mono text-[#94a3b8] w-4 shrink-0 text-center">
                                      {actIdx + 1}.
                                    </span>
                                    <input
                                      type="text"
                                      value={act.title}
                                      onChange={(e) =>
                                        handleUpdateActivity(del.id, act.id, 'title', e.target.value)
                                      }
                                      placeholder="Nombre de la actividad..."
                                      className="text-xs font-medium text-[#0f172a] placeholder:text-[#94a3b8] bg-transparent outline-hidden w-full transition-colors"
                                    />
                                  </div>

                                  {/* Center: Role Dropdown */}
                                  <div className="shrink-0">
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
                                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border border-transparent hover:border-[#cbd5e1] ${badgeStyle.bg} ${badgeStyle.text} focus:ring-1 focus:ring-[#501f92] cursor-pointer outline-hidden transition-colors`}
                                      title="Rol presupuestado"
                                    >
                                      {[...new Set([...STANDARD_UHURA_ROLES, act.roleName])].map((role) => (
                                        <option key={role} value={role} className="bg-white text-[#0f172a]">
                                          {role}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Responsable de Ejecución */}
                                  <div className="shrink-0">
                                    <select
                                      value={users.some((user) => user.id === act.suggestedUserId) ? act.suggestedUserId || '' : ''}
                                      onChange={(e) => {
                                        handleUpdateActivity(del.id, act.id, 'suggestedUserId', e.target.value || null);
                                      }}
                                      className="text-[11px] font-medium px-2 py-0.5 rounded-md border border-[#e2e8f0] bg-white text-[#334155] hover:border-[#cbd5e1] focus:ring-1 focus:ring-[#501f92] cursor-pointer outline-hidden transition-colors max-w-[130px] truncate"
                                      title="Persona responsable de ejecutar la actividad"
                                    >
                                      <option value="">👤 (Sin responsable)</option>
                                      {users.filter(isEligibleTeamMember).map((u) => (
                                        <option key={u.id} value={u.id} className="text-[#0f172a]">
                                          {u.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Right: Estimated Hours & Action Icons (revealed on hover) */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <div className="flex items-center gap-1 bg-[#f8fafc] px-2 py-0.5 rounded-md border border-[#e2e8f0]">
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
                                        className="w-10 text-right text-xs font-bold font-mono text-[#0f172a] bg-transparent outline-hidden"
                                      />
                                      <span className="text-[10px] font-bold text-[#64748b]">h</span>
                                    </div>

                                    {/* Botones de acción discretos: visibles al pasar el cursor */}
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        type="button"
                                        onClick={() => handleDuplicateActivity(del.id, act.id)}
                                        className="p-1 text-[#94a3b8] hover:text-[#501f92] rounded hover:bg-white transition-colors cursor-pointer"
                                        title="Duplicar actividad"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveActivity(del.id, act.id)}
                                        className="p-1 text-[#94a3b8] hover:text-[#ef4444] rounded hover:bg-white transition-colors cursor-pointer"
                                        title="Eliminar actividad"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    {/* Add Activity Button in this deliverable */}
                    <div className="pt-2 flex items-center flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddActivity(del.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#501f92] hover:bg-[#501f92]/5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar actividad</span>
                      </button>
                      {service && <button type="button" aria-label={`Agregar entregable a ${service.name}`} onClick={() => handleAddDeliverable(service)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#cbd5e1] text-[#475569] hover:border-[#a78bfa] hover:text-[#501f92]">
                        <Plus className="w-3.5 h-3.5" />Agregar entregable
                      </button>}

                      <div className="text-[11px] text-[#64748b]">
                        {del.backlogItems.length} actividad(es) · Subtotal: <strong className="text-[#0f172a]">{delTotalHours}h</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>}
                </div>
            );
          }))}

          {quote.deliverables.length > 0 && templates.length > 0 && (
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[#a78bfa] bg-white hover:bg-[#f5f3ff] text-xs font-bold text-[#501f92] flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              Agregar plantilla
            </button>
          )}

        </div>

        {hoursSummary}
      </div>

      {/* Import Template Modal */}
      {isImportModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsImportModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#e2e8f0] p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
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
                    Importa actividades, horas y responsables sugeridos por rol. Revisa y confirma las asignaciones.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-[#94a3b8] hover:text-[#0f172a] text-sm p-1 rounded-lg cursor-pointer"
                aria-label="Cerrar modal"
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
                        Aportará {t.deliverables.length} servicios y {t.totalHours}h de actividades al alcance actual.
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
