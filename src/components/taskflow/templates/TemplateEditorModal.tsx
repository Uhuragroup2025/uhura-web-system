import React, { useState } from 'react';
import {
  ProductBacklogTemplate,
  TemplateDeliverable,
  TemplateBacklogItem,
  TemplateStatus,
  STANDARD_UHURA_ROLES,
  ROLE_PENDING_DEFINITION,
  StandardUhuraRole
} from '../types';
import { TEMPLATE_CATEGORIES } from './templateData';
import {
  recalculateTemplateHours,
  computeRoleBudgetsFromActivities,
  computeTotalHoursFromRoleBudgets
} from './templateEngine';
import {
  X,
  Plus,
  Trash2,
  Layers,
  Clock,
  Users2,
  Sparkles,
  AlertCircle,
  Save,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface TemplateEditorModalProps {
  isOpen: boolean;
  template: ProductBacklogTemplate | null; // null si es creación nueva
  onClose: () => void;
  onSave: (savedTemplate: ProductBacklogTemplate) => void;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  template,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const isEditing = !!template;

  // Estado del formulario
  const [name, setName] = useState<string>(template?.name || '');
  const [description, setDescription] = useState<string>(template?.description || '');
  const [category, setCategory] = useState<string>(template?.category || 'wordpress');
  const [version, setVersion] = useState<string>(template?.version || '1.0');
  const [status, setStatus] = useState<TemplateStatus>(template?.status || 'active');
  const [estimatedDurationWeeks, setEstimatedDurationWeeks] = useState<number>(
    template?.estimatedDurationWeeks || 4
  );

  // Estado de entregables y actividades
  const [deliverables, setDeliverables] = useState<TemplateDeliverable[]>(() => {
    if (template) {
      return JSON.parse(JSON.stringify(template.deliverables));
    }
    const initialTmplId = `tmpl-${Date.now()}`;
    const initialDelId = `del-${Date.now()}-1`;
    return [
      {
        id: initialDelId,
        templateId: initialTmplId,
        name: 'Entregable 1 (ej. Arquitectura / UX)',
        description: 'Alcance del primer hito de trabajo',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: `act-${Date.now()}-1`,
            templateDeliverableId: initialDelId,
            title: 'Actividad inicial de levantamiento',
            description: 'Definición de requerimientos y alcance',
            roleId: 'Product Lead',
            roleName: 'Product Lead',
            estimatedHours: 4.0,
            order: 1,
            optional: false
          }
        ]
      }
    ];
  });

  const [expandedDeliverables, setExpandedDeliverables] = useState<{ [id: string]: boolean }>({
    [deliverables[0]?.id || '']: true
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleExpand = (delId: string) => {
    setExpandedDeliverables((prev) => ({ ...prev, [delId]: !prev[delId] }));
  };

  // CÁLCULO EN TIEMPO REAL DE LOS TRES NIVELES
  // Nivel 1: Cada actividad tiene su estimatedHours
  // Nivel 2: Rollup por rol de todas las actividades
  const allActivities = deliverables.flatMap((d) => d.activities);
  const liveRoleBudgets = computeRoleBudgetsFromActivities(allActivities);
  // Nivel 3: Total de horas de la plantilla
  const liveTotalHours = computeTotalHoursFromRoleBudgets(liveRoleBudgets);

  // MANEJO DE ENTREGABLES
  const handleAddDeliverable = () => {
    const newId = `del-${Date.now()}-${deliverables.length + 1}`;
    const newDel: TemplateDeliverable = {
      id: newId,
      templateId: template?.id || `tmpl-${Date.now()}`,
      name: `Nuevo Entregable ${deliverables.length + 1}`,
      description: '',
      order: deliverables.length + 1,
      roleBudgets: [],
      activities: []
    };
    setDeliverables([...deliverables, newDel]);
    setExpandedDeliverables((prev) => ({ ...prev, [newId]: true }));
  };

  const handleRemoveDeliverable = (delId: string) => {
    if (deliverables.length <= 1) {
      setValidationError('La plantilla debe tener al menos un entregable.');
      return;
    }
    setDeliverables(deliverables.filter((d) => d.id !== delId));
  };

  const handleUpdateDeliverableName = (delId: string, newName: string) => {
    setDeliverables(
      deliverables.map((d) => (d.id === delId ? { ...d, name: newName } : d))
    );
  };

  // MANEJO DE ACTIVIDADES
  const handleAddActivity = (delId: string) => {
    const targetDel = deliverables.find((d) => d.id === delId);
    if (!targetDel) return;

    const newActId = `act-${Date.now()}-${targetDel.activities.length + 1}`;
    const newAct: TemplateBacklogItem = {
      id: newActId,
      templateDeliverableId: delId,
      title: '',
      description: '',
      roleId: 'Desarrollador Web Front-End',
      roleName: 'Desarrollador Web Front-End',
      estimatedHours: 2.0,
      order: targetDel.activities.length + 1,
      optional: false
    };

    setDeliverables(
      deliverables.map((d) =>
        d.id === delId ? { ...d, activities: [...d.activities, newAct] } : d
      )
    );
  };

  const handleRemoveActivity = (delId: string, actId: string) => {
    setDeliverables(
      deliverables.map((d) =>
        d.id === delId
          ? { ...d, activities: d.activities.filter((a) => a.id !== actId) }
          : d
      )
    );
  };

  const handleUpdateActivity = (
    delId: string,
    actId: string,
    field: keyof TemplateBacklogItem,
    value: any
  ) => {
    setDeliverables(
      deliverables.map((d) => {
        if (d.id !== delId) return d;
        return {
          ...d,
          activities: d.activities.map((a) => {
            if (a.id !== actId) return a;
            if (field === 'roleId') {
              const roleName = value;
              return { ...a, roleId: value, roleName };
            }
            return { ...a, [field]: value };
          })
        };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('El nombre de la plantilla es obligatorio.');
      return;
    }

    if (deliverables.length === 0) {
      setValidationError('Debes incluir al menos un entregable.');
      return;
    }

    const hasEmptyActivity = deliverables.some((d) =>
      d.activities.some((a) => !a.title.trim())
    );
    if (hasEmptyActivity) {
      setValidationError('Todas las actividades deben tener un título definido.');
      return;
    }

    const templateId = template?.id || `tmpl-${Date.now()}`;
    const now = new Date().toISOString();

    const draftTemplate: ProductBacklogTemplate = {
      id: templateId,
      name: name.trim(),
      description: description.trim() || 'Plantilla maestra gobernada por Producto',
      category: category.trim(),
      version: version.trim() || '1.0',
      status,
      isReusable: true,
      governedBy: 'Producto',
      deliverables,
      totalHours: liveTotalHours,
      estimatedDurationWeeks: Number(estimatedDurationWeeks) || 4,
      createdAt: template?.createdAt || now,
      updatedAt: now
    };

    // Pasa por el motor de cálculo para recalcular formalmente los 3 niveles
    const finalized = recalculateTemplateHours(draftTemplate);
    onSave(finalized);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto text-[#0f172a]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f1f5f9] flex items-center justify-between bg-[#fcfaff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8a4dff]/10 flex items-center justify-center text-[#8a4dff]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0f172a]">
                {isEditing ? 'Editar Plantilla Maestra de Producto' : 'Nueva Plantilla Maestra de Producto'}
              </h2>
              <p className="text-xs text-[#64748b]">
                Gobernado por Producto · Define la estructura de entregables, actividades y horas maestras
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-[#fee2e2] text-[#991b1b] text-xs flex items-center gap-2 border border-[#fecaca]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 1. Información General */}
          <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                1. Información General de la Plantilla
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#8a4dff]/10 text-[#8a4dff]">
                Gobernanza: Producto
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  Nombre de la Plantilla / Producto <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Sitio WordPress hasta 8 páginas internas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#8a4dff] focus:border-transparent outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  Categoría de Producto <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#8a4dff] focus:border-transparent outline-hidden bg-white"
                >
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                  <option value="custom">Proyecto a la Medida (Personalizado)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    Versión
                  </label>
                  <input
                    type="text"
                    placeholder="1.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#8a4dff] focus:border-transparent outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    Estado
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TemplateStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#8a4dff] focus:border-transparent outline-hidden bg-white"
                  >
                    <option value="active">Activa (disponible)</option>
                    <option value="draft">Borrador</option>
                    <option value="archived">Archivada</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  Descripción / Alcance Operativo
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalla el alcance marco, premisas del servicio y estándares técnicos..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#8a4dff] focus:border-transparent outline-hidden bg-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Entregables y Actividades (Nivel 1 de Horas) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#334155] uppercase tracking-wider">
                  2. Estructura de Entregables y Actividades
                </h3>
                <p className="text-[11px] text-[#64748b]">
                  Nivel 1: Cada actividad suma sus horas estimadas al entregable
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#8a4dff] bg-[#8a4dff]/10 hover:bg-[#8a4dff]/20 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Entregable</span>
              </button>
            </div>

            <div className="space-y-3">
              {deliverables.map((del, dIdx) => {
                const isExpanded = expandedDeliverables[del.id] ?? true;
                const delHours = del.activities.reduce(
                  (sum, a) => sum + (Number(a.estimatedHours) || 0),
                  0
                );

                return (
                  <div
                    key={del.id}
                    className="border border-[#e2e8f0] rounded-xl bg-white overflow-hidden shadow-xs"
                  >
                    {/* Header del Entregable */}
                    <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleExpand(del.id)}
                          className="p-1 rounded text-[#64748b] hover:text-[#0f172a] transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <span className="text-xs font-bold text-[#8a4dff] w-6">
                          #{dIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={del.name}
                          onChange={(e) => handleUpdateDeliverableName(del.id, e.target.value)}
                          placeholder="Nombre del entregable..."
                          className="text-xs font-bold text-[#0f172a] bg-transparent border-b border-dashed border-[#cbd5e1] focus:border-[#8a4dff] focus:outline-hidden px-1 py-0.5 flex-1"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#8a4dff]/10 text-[#8a4dff]">
                          {Math.round(delHours * 10) / 10}h
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDeliverable(del.id)}
                          className="p-1 text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                          title="Eliminar entregable"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Actividades del Entregable */}
                    {isExpanded && (
                      <div className="p-3.5 space-y-2.5">
                        {del.activities.length === 0 ? (
                          <div className="text-center py-4 text-xs text-[#94a3b8] bg-[#f8fafc] rounded-lg border border-dashed border-[#e2e8f0]">
                            No hay actividades en este entregable. Agrega la primera actividad abajo.
                          </div>
                        ) : (
                          del.activities.map((act, aIdx) => (
                            <div
                              key={act.id}
                              className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 rounded-lg bg-[#fcfaff] border border-[#f1f5f9] hover:border-[#8a4dff]/30 transition-colors"
                            >
                              <span className="text-[11px] font-semibold text-[#8a4dff] w-5">
                                {dIdx + 1}.{aIdx + 1}
                              </span>

                              {/* Título de la actividad */}
                              <div className="flex-1 min-w-[180px]">
                                <input
                                  type="text"
                                  placeholder="Título de la actividad técnica..."
                                  value={act.title}
                                  onChange={(e) =>
                                    handleUpdateActivity(del.id, act.id, 'title', e.target.value)
                                  }
                                  className="w-full text-xs text-[#0f172a] px-2 py-1.5 rounded-md border border-[#cbd5e1] bg-white focus:outline-hidden focus:ring-1 focus:ring-[#8a4dff]"
                                />
                              </div>

                              {/* Rol Responsable */}
                              <div className="w-full sm:w-[170px]">
                                <select
                                  value={act.roleId}
                                  onChange={(e) =>
                                    handleUpdateActivity(del.id, act.id, 'roleId', e.target.value)
                                  }
                                  className={`w-full text-xs px-2 py-1.5 rounded-md border bg-white focus:outline-hidden focus:ring-1 focus:ring-[#8a4dff] ${
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

                              {/* Horas Estimadas */}
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0.5}
                                  max={200}
                                  step={0.5}
                                  value={act.estimatedHours}
                                  onChange={(e) =>
                                    handleUpdateActivity(
                                      del.id,
                                      act.id,
                                      'estimatedHours',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-18 text-xs text-right font-semibold text-[#0f172a] px-2 py-1.5 rounded-md border border-[#cbd5e1] bg-white focus:outline-hidden focus:ring-1 focus:ring-[#8a4dff]"
                                />
                                <span className="text-[11px] font-medium text-[#64748b]">hrs</span>
                              </div>

                              {/* Opcional Toggle */}
                              <label className="flex items-center gap-1 text-[11px] text-[#64748b] cursor-pointer shrink-0">
                                <input
                                  type="checkbox"
                                  checked={!!act.optional}
                                  onChange={(e) =>
                                    handleUpdateActivity(del.id, act.id, 'optional', e.target.checked)
                                  }
                                  className="rounded border-[#cbd5e1] text-[#8a4dff] focus:ring-[#8a4dff]"
                                />
                                <span>Opcional</span>
                              </label>

                              {/* Eliminar Actividad */}
                              <button
                                type="button"
                                onClick={() => handleRemoveActivity(del.id, act.id)}
                                className="p-1 text-[#94a3b8] hover:text-[#ef4444] transition-colors shrink-0"
                                title="Eliminar actividad"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}

                        <button
                          type="button"
                          onClick={() => handleAddActivity(del.id)}
                          className="w-full py-1.5 border border-dashed border-[#cbd5e1] hover:border-[#8a4dff] text-[#8a4dff] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 bg-[#fcfaff]/50 transition-colors cursor-pointer mt-2"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar Actividad Técnica</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Panel de Resumen de Horas en Tiempo Real (Niveles 2 y 3) */}
          <div className="bg-[#10091d] text-white p-4 rounded-xl border border-[#2d1b4e] space-y-3">
            <div className="flex items-center justify-between border-b border-[#2d1b4e] pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d4ff4a]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#d4ff4a]">
                  Cálculo Dinámico de Horas (Niveles 2 y 3)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#c9b7ff]">Total de la Plantilla:</span>
                <span className="text-sm font-black text-[#d4ff4a] px-2.5 py-0.5 rounded-md bg-[#d4ff4a]/15">
                  {liveTotalHours} hrs
                </span>
              </div>
            </div>

            {/* Nivel 2: Rollup por Rol */}
            <div>
              <span className="text-[11px] font-semibold text-[#c9b7ff]/80 block mb-2">
                Nivel 2 — Horas Cotizadas por Rol (Rollup de todas las actividades):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {liveRoleBudgets.length === 0 ? (
                  <div className="col-span-full text-xs text-[#c9b7ff]/50 py-2">
                    Agrega actividades con horas para ver el desglose por roles.
                  </div>
                ) : (
                  liveRoleBudgets.map((rb) => (
                    <div
                      key={rb.roleId}
                      className="p-2 rounded-lg bg-[#1a0f30] border border-[#2d1b4e] flex items-center justify-between"
                    >
                      <span className="text-xs text-[#e2e8f0] truncate mr-2" title={rb.roleName}>
                        {rb.roleName}
                      </span>
                      <span className="text-xs font-bold text-[#d4ff4a] shrink-0">
                        {rb.quotedHours}h
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#f1f5f9] bg-white flex items-center justify-between">
          <span className="text-xs text-[#64748b]">
            Las modificaciones en esta plantilla maestra impactarán únicamente las futuras cotizaciones.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f1f5f9] rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#8a4dff] hover:bg-[#7839ee] rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios' : 'Guardar Plantilla Maestra'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
