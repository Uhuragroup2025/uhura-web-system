import React, { useState } from 'react';
import {
  ProjectSummaryItem,
  ProjectDependency,
  ProjectDependencyType,
  UserItem
} from '../types';
import {
  Hourglass,
  Plus,
  Check,
  CheckCircle2,
  MessageSquare,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { calculateBusinessDays } from '../tasks/taskEngine';

interface ProjectDependenciesSectionProps {
  project: ProjectSummaryItem;
  currentUser?: UserItem | null;
  allUsers?: UserItem[];
  canManageDependencies?: boolean;
  onUpdateProject?: (updatedProject: ProjectSummaryItem) => void;
}

export const ProjectDependenciesSection: React.FC<ProjectDependenciesSectionProps> = ({
  project,
  currentUser,
  allUsers = [],
  canManageDependencies = true,
  onUpdateProject
}) => {
  const dependencies = project.dependencies || [];
  const [isExpanded, setIsExpanded] = useState(true);
  const [depFilter, setDepFilter] = useState<'all' | 'blocking' | 'pending' | 'received'>('all');

  // Modal states
  const [isNewDependencyModalOpen, setIsNewDependencyModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedDependencyForFollowUp, setSelectedDependencyForFollowUp] = useState<ProjectDependency | null>(null);
  const [followUpNoteText, setFollowUpNoteText] = useState('');

  // Form states
  const [newDepTitle, setNewDepTitle] = useState('');
  const [newDepType, setNewDepType] = useState<ProjectDependencyType>('approval');
  const [newDepOwnerType, setNewDepOwnerType] = useState<'client' | 'uhura'>('client');
  const [newDepExpectedDate, setNewDepExpectedDate] = useState('');
  const [newDepBlocking, setNewDepBlocking] = useState(true);
  const [newDepFollowUpOwnerId, setNewDepFollowUpOwnerId] = useState(currentUser?.id || 'u-3');
  const [newDepDeliverableId, setNewDepDeliverableId] = useState<string>('');

  const filteredDependencies = dependencies.filter((d) => {
    if (depFilter === 'blocking') return d.blocking && d.status === 'pending';
    if (depFilter === 'pending') return d.status === 'pending';
    if (depFilter === 'received') return d.status === 'received';
    return true;
  });

  const pendingCount = dependencies.filter((d) => d.status === 'pending').length;
  const blockingCount = dependencies.filter((d) => d.blocking && d.status === 'pending').length;

  const handleMarkReceived = (depId: string) => {
    if (!onUpdateProject) return;
    const updated = dependencies.map((d) => {
      if (d.id === depId) {
        return {
          ...d,
          status: 'received' as const,
          receivedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });
    onUpdateProject({
      ...project,
      dependencies: updated
    });
  };

  const handleSaveFollowUp = () => {
    if (!onUpdateProject || !selectedDependencyForFollowUp) return;
    const updated = dependencies.map((d) => {
      if (d.id === selectedDependencyForFollowUp.id) {
        return {
          ...d,
          lastFollowUpAt: new Date().toISOString(),
          followUpNotes: followUpNoteText.trim() || 'Seguimiento registrado con el cliente',
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });
    onUpdateProject({
      ...project,
      dependencies: updated
    });
    setIsFollowUpModalOpen(false);
    setSelectedDependencyForFollowUp(null);
    setFollowUpNoteText('');
  };

  const handleCreateDependency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProject || !newDepTitle.trim() || !newDepExpectedDate) return;

    const assignedUser = allUsers.find((u) => u.id === newDepFollowUpOwnerId) || currentUser;
    const newDep: ProjectDependency = {
      id: `dep-${Date.now()}`,
      projectId: project.id,
      deliverableId: newDepDeliverableId || null,
      title: newDepTitle.trim(),
      type: newDepType,
      ownerType: newDepOwnerType,
      followUpOwnerUserId: newDepFollowUpOwnerId,
      followUpOwnerName: assignedUser?.name || 'Client Relationship',
      requestedAt: new Date().toISOString(),
      expectedDate: newDepExpectedDate,
      status: 'pending',
      blocking: newDepBlocking,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onUpdateProject({
      ...project,
      dependencies: [newDep, ...dependencies]
    });

    setIsNewDependencyModalOpen(false);
    setNewDepTitle('');
    setNewDepExpectedDate('');
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs space-y-3.5 mb-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
            title={isExpanded ? 'Colapsar sección' : 'Expandir sección'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Hourglass className="w-4 h-4 text-[#501f92]" />
              <h3 className="font-extrabold text-sm text-[#0f172a]">
                Dependencias, Insumos & Aprobaciones de Cliente
              </h3>
              {blockingCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]">
                  {blockingCount} bloqueante{blockingCount > 1 ? 's' : ''}
                </span>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0369a1]">
                {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] mt-0.5">
              Control de entregables y tareas bloqueadas por accesos, manuales o feedback del cliente.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
          {/* Filter Pills */}
          <div className="flex items-center bg-[#f1f5f9] p-0.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setDepFilter('all');
                setIsExpanded(true);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                depFilter === 'all' ? 'bg-white text-[#501f92] shadow-2xs font-bold' : 'text-[#64748b]'
              }`}
            >
              Todas ({dependencies.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setDepFilter('blocking');
                setIsExpanded(true);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                depFilter === 'blocking' ? 'bg-white text-[#501f92] shadow-2xs font-bold' : 'text-[#64748b]'
              }`}
            >
              Bloqueantes
            </button>
            <button
              type="button"
              onClick={() => {
                setDepFilter('pending');
                setIsExpanded(true);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                depFilter === 'pending' ? 'bg-white text-[#501f92] shadow-2xs font-bold' : 'text-[#64748b]'
              }`}
            >
              Pendientes
            </button>
          </div>

          {canManageDependencies && (
            <button
              type="button"
              onClick={() => setIsNewDependencyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Insumo / Gate</span>
            </button>
          )}
        </div>
      </div>

      {/* Body content when expanded */}
      {isExpanded && (
        <div className="space-y-2">
          {filteredDependencies.length === 0 ? (
            <div className="text-center py-5 bg-[#f8fafc] rounded-2xl border border-dashed border-[#cbd5e1]">
              <p className="text-xs font-bold text-[#475569]">No hay dependencias registradas en este filtro</p>
              <p className="text-[11px] text-[#64748b] mt-0.5">
                Registra insumos pendientes de cliente como manuales de marca, accesos o aprobaciones de gates.
              </p>
            </div>
          ) : (
            filteredDependencies.map((dep) => {
              const todayStr = new Date().toISOString().slice(0, 10);
              const isOverdue = dep.status === 'pending' && dep.expectedDate && todayStr > dep.expectedDate;
              const delayDays = isOverdue ? calculateBusinessDays(dep.expectedDate, todayStr) : 0;

              return (
                <div
                  key={dep.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs ${
                    dep.status === 'received'
                      ? 'bg-[#f8fafc] border-[#e2e8f0] opacity-80'
                      : isOverdue
                      ? 'bg-[#fffbeb] border-[#fde68a]'
                      : 'bg-white border-[#e2e8f0]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        dep.status === 'received'
                          ? 'bg-[#ecfdf5] text-[#059669]'
                          : isOverdue
                          ? 'bg-[#fef2f2] text-[#dc2626]'
                          : 'bg-[#eff6ff] text-[#2563eb]'
                      }`}
                    >
                      {dep.status === 'received' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Hourglass className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#0f172a]">{dep.title}</span>
                        {dep.blocking && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#fee2e2] text-[#991b1b]">
                            Bloqueante
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f1f5f9] text-[#475569]">
                          {dep.type === 'approval' ? 'Aprobación Gate' : dep.type === 'client_input' ? 'Insumo Cliente' : dep.type === 'access' ? 'Accesos' : 'Kickoff'}
                        </span>
                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]">
                            Vencido: +{delayDays} días hábiles
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#64748b] mt-0.5 flex-wrap">
                        <span>Esperado: <strong className="text-[#334155]">{dep.expectedDate}</strong></span>
                        <span>Seguimiento: <strong className="text-[#334155]">{dep.followUpOwnerName || 'Client Relationship'}</strong></span>
                        {dep.lastFollowUpAt && (
                          <span className="text-[#059669] font-medium">
                            Última gestión: {new Date(dep.lastFollowUpAt).toLocaleDateString('es-CO')}
                          </span>
                        )}
                      </div>

                      {dep.followUpNotes && (
                        <p className="text-[11px] text-[#475569] mt-1 italic bg-black/5 px-2 py-0.5 rounded-md">
                          "{dep.followUpNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {dep.status === 'pending' && canManageDependencies && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDependencyForFollowUp(dep);
                            setFollowUpNoteText(dep.followUpNotes || '');
                            setIsFollowUpModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] text-[#475569] text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1.5"
                          title="Registrar nota de seguimiento o contacto con cliente"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#501f92]" />
                          <span>Gestionar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkReceived(dep.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold cursor-pointer shadow-2xs flex items-center gap-1.5"
                          title="Marcar como recibido del cliente"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Marcar recibido</span>
                        </button>
                      </>
                    )}

                    {dep.status === 'received' && (
                      <span className="text-[11px] font-bold text-[#059669] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Recibido
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL: REGISTRAR INSUMO / GATE */}
      {isNewDependencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white text-[#0f172a] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-[#501f92]" />
                <h3 className="text-base font-extrabold text-[#0f172a]">Registrar Insumo o Gate</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewDependencyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#0f172a] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDependency} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Título del Insumo / Gate:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Manual de Marca, Aprobación Gate 1, Credenciales hosting"
                  value={newDepTitle}
                  onChange={(e) => setNewDepTitle(e.target.value)}
                  style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                  className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] bg-white text-[#0f172a] placeholder:text-[#7C8AA0] placeholder:font-normal text-xs focus:outline-none focus:border-[#501f92]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Tipo:</label>
                  <select
                    value={newDepType}
                    onChange={(e) => setNewDepType(e.target.value as ProjectDependencyType)}
                    style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                    className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] bg-white text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92]"
                  >
                    <option value="approval">Aprobación / Gate</option>
                    <option value="client_input">Insumo del Cliente</option>
                    <option value="access">Accesos / Credenciales</option>
                    <option value="kickoff_input">Respuestas Kickoff</option>
                    <option value="internal_dependency">Dependencia Interna</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Fecha Acordada:</label>
                  <input
                    type="date"
                    required
                    value={newDepExpectedDate}
                    onChange={(e) => setNewDepExpectedDate(e.target.value)}
                    style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                    className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] bg-white text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Responsable Seguimiento:</label>
                  <select
                    value={newDepFollowUpOwnerId}
                    onChange={(e) => setNewDepFollowUpOwnerId(e.target.value)}
                    style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                    className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] bg-white text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92]"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Origen:</label>
                  <select
                    value={newDepOwnerType}
                    onChange={(e) => setNewDepOwnerType(e.target.value as 'client' | 'uhura')}
                    style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                    className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] bg-white text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92]"
                  >
                    <option value="client">Cliente Externo</option>
                    <option value="uhura">Uhura Interno</option>
                  </select>
                </div>
              </div>

              {project.deliverables && project.deliverables.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Entregable Asociado (Opcional):</label>
                  <select
                    value={newDepDeliverableId}
                    onChange={(e) => setNewDepDeliverableId(e.target.value)}
                    style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                    className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] bg-white text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92]"
                  >
                    <option value="">Afecta todo el proyecto</option>
                    {project.deliverables.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newDepBlocking}
                    onChange={(e) => setNewDepBlocking(e.target.checked)}
                    className="w-4 h-4 text-[#501f92] rounded-md focus:ring-0"
                  />
                  <span className="font-bold text-xs text-[#991b1b]">
                    Insumo Crítico / Bloqueante (Detiene la ruta crítica si se atrasa)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setIsNewDependencyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Guardar Insumo / Gate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEGUIMIENTO DE DEPENDENCIA */}
      {isFollowUpModalOpen && selectedDependencyForFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white text-[#0f172a] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#501f92]" />
                <h3 className="text-base font-extrabold text-[#0f172a]">Gestionar Insumo de Cliente</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFollowUpModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#0f172a] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                <p className="font-extrabold text-[#0f172a]">{selectedDependencyForFollowUp.title}</p>
                <div className="flex items-center gap-2 text-[11px] text-[#64748b] mt-1">
                  <span>Fecha esperada: <strong>{selectedDependencyForFollowUp.expectedDate}</strong></span>
                  {selectedDependencyForFollowUp.blocking && (
                    <span className="text-[#dc2626] font-bold">· Bloqueante</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Nota de Gestión / Respuesta del Cliente:
                </label>
                <textarea
                  rows={3}
                  value={followUpNoteText}
                  onChange={(e) => setFollowUpNoteText(e.target.value)}
                  placeholder="Ej: Se envió correo y recordatorio por WhatsApp. El cliente confirma entrega mañana a primera hora..."
                  style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                  className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] bg-white text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setIsFollowUpModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveFollowUp}
                className="px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Guardar Nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
