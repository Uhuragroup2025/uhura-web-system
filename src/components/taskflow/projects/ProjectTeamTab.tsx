import React, { useState, useMemo } from 'react';
import { ProjectSummaryItem, ProjectStakeholder, UserItem, TaskItem } from '../types';
import { UserAvatar } from '../UserAvatar';
import { Users, Eye, X, Plus, Search, Info, AlertTriangle } from 'lucide-react';
import { initialUsers } from '../mockData';
import { buildTeamFromTasks, buildGlobalWeekLoad } from './teamFromTasks';

interface ProjectTeamTabProps {
  project: ProjectSummaryItem;
  allProjects: ProjectSummaryItem[];
  users?: UserItem[];
  tasks?: TaskItem[];      // Tareas de este proyecto
  allTasks?: TaskItem[];   // Tareas de todos los proyectos (capacidad global)
  onUpdateProject: (updated: ProjectSummaryItem) => void;
  hideHeaderMetrics?: boolean;
}

/**
 * Equipo Asignado — derivado de las tareas.
 * No hay asignación manual: el equipo, los roles desempeñados y la carga salen de
 * quién tiene cada tarea. Reasignar = cambiar el colaborador en la tarea.
 */
export const ProjectTeamTab: React.FC<ProjectTeamTabProps> = ({
  project,
  users = initialUsers,
  tasks = [],
  allTasks,
  onUpdateProject
}) => {
  const stakeholders: ProjectStakeholder[] = project.stakeholders || [];
  const [showStakeholderModal, setShowStakeholderModal] = useState(false);
  const [stakeholderUserId, setStakeholderUserId] = useState<string>('');
  const [stakeholderDepartment, setStakeholderDepartment] = useState<string>('');
  const [stakeholderNotes, setStakeholderNotes] = useState<string>('');
  const [teamSearch, setTeamSearch] = useState('');

  const team = useMemo(
    () => buildTeamFromTasks({ projectTasks: tasks, users, leadName: project.leadName }),
    [tasks, users, project.leadName]
  );

  const globalWeekLoad = useMemo(
    () => buildGlobalWeekLoad(allTasks && allTasks.length > 0 ? allTasks : tasks, users),
    [allTasks, tasks, users]
  );

  const visibleTeam = useMemo(() => {
    const q = teamSearch.trim().toLowerCase();
    if (!q) return team;
    return team.filter((m) =>
      m.user.name.toLowerCase().includes(q) || m.roles.some((r) => r.role.toLowerCase().includes(q))
    );
  }, [team, teamSearch]);

  const coverageCount = team.filter((m) => m.hasCoverage).length;

  const resolveUser = (userId: string): UserItem =>
    users.find((u) => u.id === userId) || ({
      id: userId,
      name: userId,
      email: '',
      initials: userId.slice(0, 2).toUpperCase(),
      avatarBg: 'bg-[#64748b]',
      role: 'Member',
      status: 'Active',
      tasksCount: 0,
      joinedDate: '',
      capacityHours: 42
    } as UserItem);

  // Agregar Seguidor / Stakeholder (sin roleId ni consumo de horas)
  const handleAddStakeholder = () => {
    if (!stakeholderUserId) return;
    const newStakeholder: ProjectStakeholder = {
      id: `stk-${Date.now()}`,
      projectId: project.id,
      userId: stakeholderUserId,
      titleOrDepartment: stakeholderDepartment,
      notes: stakeholderNotes,
      addedAt: new Date().toISOString()
    };
    onUpdateProject({ ...project, stakeholders: [...stakeholders, newStakeholder] });
    setShowStakeholderModal(false);
    setStakeholderUserId('');
    setStakeholderDepartment('');
    setStakeholderNotes('');
  };

  const handleRemoveStakeholder = (id: string) => {
    onUpdateProject({ ...project, stakeholders: stakeholders.filter((s) => s.id !== id) });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#f1f5f9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#501f92]" />
              <h3 className="font-extrabold text-sm text-[#0f172a]">Equipo Asignado ({team.length})</h3>
              {coverageCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
                  <AlertTriangle className="w-3 h-3" />
                  {coverageCount} cubre{coverageCount === 1 ? '' : 'n'} otro rol
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#64748b] flex items-center gap-1">
              <Info className="w-3 h-3 shrink-0" />
              Se calcula desde las tareas. Para reasignar, cambia el colaborador en la tarea.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Buscar persona o rol..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#f8fafc] border border-[#e2e8f0] focus:outline-none focus:border-[#501f92] focus:bg-white text-[#0f172a]"
              />
            </div>
            <button
              onClick={() => setShowStakeholderModal(true)}
              className="shrink-0 px-3 py-1.5 text-xs font-bold text-[#475569] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Agregar seguidor o stakeholder sin consumo de horas ni rol cotizado"
            >
              <Eye className="w-3.5 h-3.5 text-[#64748b]" />
              <span>+ Seguidor ({stakeholders.length})</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f8fafc]">
                <th className="py-3 px-5 min-w-[190px]">Persona</th>
                <th className="py-3 px-4 min-w-[260px]">Roles que desempeña (horas cotizadas · ejecutadas)</th>
                <th className="py-3 px-4 text-right min-w-[120px]">Carga esta semana</th>
                <th className="py-3 px-4 text-right min-w-[110px]">Pendiente</th>
                <th className="py-3 px-5 min-w-[190px]">Capacidad global (semana)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {visibleTeam.map((m) => {
                const configured = m.user.capacityHours || 42;
                const globalWeek = globalWeekLoad.get(m.user.id) || 0;
                const free = Math.max(0, configured - globalWeek);
                const over = Math.max(0, globalWeek - configured);
                const util = Math.round((globalWeek / configured) * 100);
                return (
                  <tr key={m.user.id} className="hover:bg-[#fbfcfe] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={m.user} size="md" className="w-8 h-8 rounded-full text-xs shrink-0 shadow-2xs" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#0f172a] text-xs">{m.user.name}</span>
                            {m.isLead && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#f5f3ff] text-[#501f92] border border-[#ddd6fe]">
                                Líder
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#64748b] block">
                            {m.user.officialRole || m.user.jobTitle || m.user.email} · {m.tasksCount} tarea{m.tasksCount === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {m.roles.length === 0 ? (
                        <span className="text-[11px] text-[#94a3b8]">Sin tareas asignadas aún</span>
                      ) : (
                        <div className="space-y-1.5">
                          {m.roles.map((r) => (
                            <div
                              key={r.role}
                              className={`flex items-center justify-between gap-2 p-1.5 rounded-lg border text-[11px] ${
                                r.isCoverage ? 'bg-[#fffbeb] border-[#fde68a]' : 'bg-[#f8fafc] border-[#f1f5f9]'
                              }`}
                              title={r.isCoverage ? `${m.user.name} cubre el rol ${r.role}, distinto a su rol oficial` : undefined}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${r.isCoverage ? 'bg-[#f59e0b]' : 'bg-[#0284c7]'}`} />
                                <span className="font-bold text-[#0f172a] truncate">{r.role}</span>
                                {r.isCoverage && <span className="text-[10px] font-bold text-[#b45309] shrink-0">cubre rol</span>}
                              </div>
                              <span className="font-mono font-bold text-[#501f92] shrink-0">
                                {r.assignedHours.toFixed(1)}h · {r.executedHours.toFixed(1)}h
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-black text-sm text-[#0f172a]">{m.weekHours.toFixed(1)} h</span>
                      <span className="text-[10px] text-[#64748b] block">según cronograma</span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-xs text-[#0f172a]">{m.pendingHours.toFixed(1)} h</span>
                      <span className="text-[10px] text-[#64748b] block">{m.executedHours.toFixed(1)} h ejecutadas</span>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#64748b]">{globalWeek.toFixed(1)}h de {configured}h</span>
                          <span className={`font-bold font-mono ${over > 0 ? 'text-[#dc2626]' : util > 85 ? 'text-[#b45309]' : 'text-[#15803d]'}`}>
                            {over > 0 ? `+${over.toFixed(1)}h sobrecupo` : `${free.toFixed(1)}h libres`}
                          </span>
                        </div>
                        <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${over > 0 ? 'bg-[#ef4444]' : util > 85 ? 'bg-[#f59e0b]' : 'bg-[#10b981]'}`}
                            style={{ width: `${Math.min(100, util)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {visibleTeam.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#64748b]">
                    {team.length === 0
                      ? 'Aún no hay tareas asignadas. El equipo aparecerá al asignar colaboradores en las tareas.'
                      : 'Sin resultados para la búsqueda.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. SEGUIDORES & STAKEHOLDERS (Solo si existen seguidores registrados) */}
      {stakeholders.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#64748b]" />
              <h4 className="font-extrabold text-xs text-[#0f172a]">
                Seguidores & Stakeholders ({stakeholders.length})
              </h4>
            </div>
            <button
              onClick={() => setShowStakeholderModal(true)}
              className="text-xs font-bold text-[#501f92] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Añadir seguidor</span>
            </button>
          </div>

          <p className="text-[11px] text-[#64748b] leading-relaxed">
            Personas que requieren visibilidad del proyecto (reportes o hitos) sin rol cotizado ni consumo de horas.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {stakeholders.map((s) => {
              const u = resolveUser(s.userId);
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs"
                >
                  <UserAvatar
                    user={u}
                    size="custom"
                    className="w-5 h-5 rounded-full text-[10px]"
                  />
                  <span className="font-bold text-[#0f172a]">{u.name}</span>
                  {s.titleOrDepartment && (
                    <span className="text-[10px] text-[#64748b]">· {s.titleOrDepartment}</span>
                  )}
                  <button
                    onClick={() => handleRemoveStakeholder(s.id)}
                    className="text-[#94a3b8] hover:text-[#dc2626] ml-1 cursor-pointer"
                    title="Remover seguidor"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. MODAL: AGREGAR STAKEHOLDER / SEGUIDOR */}
      {showStakeholderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <h3 className="font-extrabold text-base text-[#0f172a]">Añadir seguidor</h3>
              <button onClick={() => setShowStakeholderModal(false)} className="p-1 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#64748b]">
              Los seguidores reciben visibilidad de avances sin computar en la carga horaria ni requerir rol cotizado.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Colaborador</label>
                <select
                  value={stakeholderUserId}
                  onChange={(e) => setStakeholderUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#f8fafc] border border-[#cbd5e1]"
                >
                  <option value="">Seleccionar persona...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.jobTitle || u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Área o Cargo de Interés</label>
                <input
                  type="text"
                  value={stakeholderDepartment}
                  onChange={(e) => setStakeholderDepartment(e.target.value)}
                  placeholder="Ej: Dirección Comercial, Finanzas o QA"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a] placeholder:text-[#7C8AA0] placeholder:font-normal"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
              <button
                onClick={() => setShowStakeholderModal(false)}
                className="px-3.5 py-2 text-xs font-bold text-[#64748b]"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddStakeholder}
                disabled={!stakeholderUserId}
                className="px-4 py-2 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3f1675] disabled:opacity-50 rounded-xl"
              >
                Guardar seguidor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
