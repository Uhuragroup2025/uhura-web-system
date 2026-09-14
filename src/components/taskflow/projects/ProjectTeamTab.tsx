import React, { useState, useMemo } from 'react';
import {
  ProjectSummaryItem,
  ProjectAssignment,
  ProjectStakeholder,
  AssignmentHistory,
  UserItem,
  TaskItem,
  AssignmentNature,
  AssignmentChangeReason
} from '../types';
import { adaptCoreTeamToAssignments, getActiveWeeklyHoursForAssignment } from './assignmentAdapter';
import {
  Users,
  UserPlus,
  Shield,
  Briefcase,
  Layers,
  Clock,
  Calendar,
  AlertTriangle,
  History,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
  Eye,
  Info,
  CalendarDays,
  Trash2,
  Edit2,
  Sparkles,
  Search
} from 'lucide-react';
import { initialUsers } from '../mockData';

interface ProjectTeamTabProps {
  project: ProjectSummaryItem;
  allProjects: ProjectSummaryItem[];
  users?: UserItem[];
  tasks?: TaskItem[];
  onUpdateProject: (updated: ProjectSummaryItem) => void;
}

export const ProjectTeamTab: React.FC<ProjectTeamTabProps> = ({
  project,
  allProjects,
  users = initialUsers,
  tasks = [],
  onUpdateProject
}) => {
  // Lista de asignaciones asegurando el adaptador transitorio si no existen asignaciones nativas aún
  const assignments: ProjectAssignment[] = useMemo(() => {
    if (project.assignments && project.assignments.length > 0) {
      return project.assignments;
    }
    return adaptCoreTeamToAssignments(
      project.id,
      project.coreTeam,
      project.startDate,
      project.endDate
    );
  }, [project.assignments, project.coreTeam, project.id, project.startDate, project.endDate]);

  const stakeholders: ProjectStakeholder[] = project.stakeholders || [];
  const historyList: AssignmentHistory[] = project.assignmentHistory || [];

  // Modales y Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showStakeholderModal, setShowStakeholderModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ProjectAssignment | null>(null);

  // Form State para Agregar / Modificar Asignación
  const [formUserId, setFormUserId] = useState<string>('');
  const [formRoleId, setFormRoleId] = useState<string>('');
  const [formNature, setFormNature] = useState<AssignmentNature>('core_execution');
  const [formDeliverableId, setFormDeliverableId] = useState<string>('');
  const [formWeeklyHours, setFormWeeklyHours] = useState<number>(8);
  const [formStartDate, setFormStartDate] = useState<string>(project.startDate || '2026-08-15');
  const [formEndDate, setFormEndDate] = useState<string>(project.endDate || '');
  const [formReason, setFormReason] = useState<AssignmentChangeReason>('project_kickoff');
  const [formNotes, setFormNotes] = useState<string>('');

  // Form State para Stakeholders (sin roleId ni consumo de horas)
  const [stakeholderUserId, setStakeholderUserId] = useState<string>('');
  const [stakeholderDepartment, setStakeholderDepartment] = useState<string>('');
  const [stakeholderNotes, setStakeholderNotes] = useState<string>('');

  // Filtro de búsqueda dentro del equipo
  const [teamSearch, setTeamSearch] = useState('');

  // Catálogo de roles extraídos de los entregables del proyecto y roles estándar
  const availableRoles = useMemo(() => {
    const rolesSet = new Set<string>();
    // Roles cotizados en entregables
    project.deliverables?.forEach((d) => {
      d.roleBudgets?.forEach((rb) => {
        rolesSet.add(rb.roleName || rb.roleId);
      });
    });
    // Roles base
    ['Product Lead', 'Client Relationship Strategist', 'Diseñador Gráfico', 'Web Designer', 'Front End', 'Copywriter', 'Community Manager', 'Trafficker', 'Tech Lead'].forEach((r) => rolesSet.add(r));
    return Array.from(rolesSet);
  }, [project.deliverables]);

  // Cálculo de Horas Planificadas de este proyecto y proyecciones
  const totalWeeklyPlannedThisProject = useMemo(() => {
    return assignments.reduce((sum, asg) => sum + getActiveWeeklyHoursForAssignment(asg), 0);
  }, [assignments]);

  // Cálculo de capacidad global por usuario a través de todos los proyectos
  const userCapacities = useMemo(() => {
    const map = new Map<string, {
      configuredWeekly: number;
      otherProjectsWeekly: number;
      thisProjectWeekly: number;
      globalPlannedWeekly: number;
      availableWeekly: number;
      overallocatedWeekly: number;
    }>();

    users.forEach((u) => {
      const configuredWeekly = u.capacityHours || 40;
      let thisProjectWeekly = 0;
      let otherProjectsWeekly = 0;

      // Calcular en este proyecto
      assignments.forEach((asg) => {
        if (asg.userId === u.id && asg.isActive) {
          thisProjectWeekly += getActiveWeeklyHoursForAssignment(asg);
        }
      });

      // Calcular en los demás proyectos
      allProjects.forEach((p) => {
        if (p.id !== project.id) {
          const pAsgs = p.assignments || adaptCoreTeamToAssignments(p.id, p.coreTeam, p.startDate, p.endDate);
          pAsgs.forEach((asg) => {
            if (asg.userId === u.id && asg.isActive) {
              otherProjectsWeekly += getActiveWeeklyHoursForAssignment(asg);
            }
          });
        }
      });

      const globalPlannedWeekly = thisProjectWeekly + otherProjectsWeekly;
      const availableWeekly = Math.max(0, configuredWeekly - globalPlannedWeekly);
      const overallocatedWeekly = Math.max(0, globalPlannedWeekly - configuredWeekly);

      map.set(u.id, {
        configuredWeekly,
        otherProjectsWeekly,
        thisProjectWeekly,
        globalPlannedWeekly,
        availableWeekly,
        overallocatedWeekly
      });
    });

    return map;
  }, [users, assignments, allProjects, project.id]);

  // Agrupación de asignaciones por persona para vista tabular multi-rol
  const teamByPerson = useMemo(() => {
    const grouped = new Map<string, {
      user: UserItem;
      assignments: ProjectAssignment[];
      totalWeeklyInProject: number;
      isLead: boolean;
      hasGovernance: boolean;
      hasSupport: boolean;
    }>();

    assignments.forEach((asg) => {
      const user = users.find((u) => u.id === asg.userId) || {
        id: asg.userId,
        name: asg.userId,
        email: '',
        initials: asg.userId.slice(0, 2).toUpperCase(),
        avatarBg: 'bg-[#501f92]',
        role: 'Member' as const,
        status: 'Active' as const,
        tasksCount: 0,
        joinedDate: '',
        capacityHours: 40
      };

      const existing = grouped.get(asg.userId);
      const weeklyHours = getActiveWeeklyHoursForAssignment(asg);

      if (existing) {
        existing.assignments.push(asg);
        existing.totalWeeklyInProject += weeklyHours;
        if (asg.nature === 'governance') existing.hasGovernance = true;
        if (asg.nature === 'temporary_support') existing.hasSupport = true;
      } else {
        grouped.set(asg.userId, {
          user,
          assignments: [asg],
          totalWeeklyInProject: weeklyHours,
          isLead: asg.nature === 'governance' || user.name.toLowerCase().includes('lead'),
          hasGovernance: asg.nature === 'governance',
          hasSupport: asg.nature === 'temporary_support'
        });
      }
    });

    let list = Array.from(grouped.values());

    // Filtrar por búsqueda
    if (teamSearch.trim()) {
      const q = teamSearch.toLowerCase();
      list = list.filter((item) =>
        item.user.name.toLowerCase().includes(q) ||
        item.assignments.some((a) => a.roleId.toLowerCase().includes(q))
      );
    }

    // Ordenar: Gobernanza primero, luego por carga horaria descendente
    return list.sort((a, b) => {
      if (a.hasGovernance && !b.hasGovernance) return -1;
      if (!a.hasGovernance && b.hasGovernance) return 1;
      return b.totalWeeklyInProject - a.totalWeeklyInProject;
    });
  }, [assignments, users, teamSearch]);

  // Helper para resolver datos de usuario
  const resolveUser = (userId: string): UserItem => {
    return (
      users.find((u) => u.id === userId) || {
        id: userId,
        name: userId,
        email: '',
        initials: userId.slice(0, 2).toUpperCase(),
        avatarBg: 'bg-[#64748b]',
        role: 'Member' as const,
        status: 'Active' as const,
        tasksCount: 0,
        joinedDate: '',
        capacityHours: 40
      }
    );
  };

  // Guardar nueva asignación o edición
  const handleSaveAssignment = () => {
    if (!formUserId || !formRoleId || formWeeklyHours < 0) return;

    const targetUser = resolveUser(formUserId);
    const isEdit = !!editingAssignment;
    const nowIso = new Date().toISOString();

    let updatedAssignments: ProjectAssignment[] = [...assignments];
    const previousWeekly = isEdit ? getActiveWeeklyHoursForAssignment(editingAssignment!) : null;

    if (isEdit) {
      // Actualizar asignación existente
      updatedAssignments = updatedAssignments.map((a) => {
        if (a.id === editingAssignment!.id) {
          return {
            ...a,
            roleId: formRoleId,
            nature: formNature,
            deliverableId: formDeliverableId || null,
            notes: formNotes,
            allocations: [
              {
                id: a.allocations[0]?.id || `alloc-${Date.now()}`,
                startDate: formStartDate,
                endDate: formEndDate || null,
                weeklyHours: Number(formWeeklyHours),
                notes: formNotes
              }
            ]
          };
        }
        return a;
      });
    } else {
      // Nueva asignación (permite múltiples registros para la misma persona en roles distintos)
      const newAsg: ProjectAssignment = {
        id: `asg-${Date.now()}`,
        projectId: project.id,
        userId: formUserId,
        roleId: formRoleId,
        nature: formNature,
        deliverableId: formDeliverableId || null,
        allocations: [
          {
            id: `alloc-${Date.now()}`,
            startDate: formStartDate,
            endDate: formEndDate || null,
            weeklyHours: Number(formWeeklyHours),
            notes: formNotes
          }
        ],
        isActive: true,
        notes: formNotes,
        createdAt: nowIso,
        createdByUserId: 'u-current-lead'
      };
      updatedAssignments.push(newAsg);
    }

    // Registrar en auditoría inmutable
    const newHistoryEntry: AssignmentHistory = {
      id: `hist-${Date.now()}`,
      projectId: project.id,
      assignmentId: isEdit ? editingAssignment!.id : `asg-${Date.now()}`,
      userId: formUserId,
      roleId: formRoleId,
      action: isEdit ? 'updated' : 'created',
      previousWeeklyHours: previousWeekly,
      newWeeklyHours: Number(formWeeklyHours),
      previousEndDate: isEdit ? editingAssignment!.allocations[0]?.endDate : null,
      newEndDate: formEndDate || null,
      reason: formReason,
      notes: formNotes,
      affectedPeriod: `Semana ${new Date().toLocaleDateString()}`,
      changedByUserId: 'u-paola',
      changedByName: 'Paola (Lead PM)',
      changedAt: nowIso
    };

    const updatedHistory = [newHistoryEntry, ...(project.assignmentHistory || [])];

    // Actualizar proyecto en el store
    onUpdateProject({
      ...project,
      assignments: updatedAssignments,
      assignmentHistory: updatedHistory,
      // Actualizar también coreTeam transitorio para no romper vistas legadas
      coreTeam: updatedAssignments.map((a) => {
        const u = resolveUser(a.userId);
        return {
          id: u.id,
          name: u.name,
          initials: u.initials,
          avatarBg: u.avatarBg,
          role: a.roleId,
          isLead: a.nature === 'governance',
          weeklyAllocatedHours: getActiveWeeklyHoursForAssignment(a)
        };
      })
    });

    // Cerrar modal y limpiar
    setShowAddModal(false);
    setEditingAssignment(null);
    setFormUserId('');
    setFormRoleId('');
    setFormWeeklyHours(8);
    setFormNotes('');
  };

  // Retirar asignación
  const handleRemoveAssignment = (assignmentId: string, reason: AssignmentChangeReason = 'project_exit') => {
    const asgToRemove = assignments.find((a) => a.id === assignmentId);
    if (!asgToRemove) return;

    const updatedAssignments = assignments.filter((a) => a.id !== assignmentId);
    const nowIso = new Date().toISOString();

    const newHistoryEntry: AssignmentHistory = {
      id: `hist-${Date.now()}`,
      projectId: project.id,
      assignmentId: asgToRemove.id,
      userId: asgToRemove.userId,
      roleId: asgToRemove.roleId,
      action: 'removed',
      previousWeeklyHours: getActiveWeeklyHoursForAssignment(asgToRemove),
      newWeeklyHours: 0,
      reason,
      notes: 'Asignación retirada del proyecto',
      changedByUserId: 'u-paola',
      changedByName: 'Paola (Lead PM)',
      changedAt: nowIso
    };

    onUpdateProject({
      ...project,
      assignments: updatedAssignments,
      assignmentHistory: [newHistoryEntry, ...(project.assignmentHistory || [])]
    });
  };

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

    onUpdateProject({
      ...project,
      stakeholders: [...stakeholders, newStakeholder]
    });

    setShowStakeholderModal(false);
    setStakeholderUserId('');
    setStakeholderDepartment('');
    setStakeholderNotes('');
  };

  // Retirar Stakeholder
  const handleRemoveStakeholder = (id: string) => {
    onUpdateProject({
      ...project,
      stakeholders: stakeholders.filter((s) => s.id !== id)
    });
  };

  // Apertura de modal de edición
  const openEditModal = (asg: ProjectAssignment) => {
    setEditingAssignment(asg);
    setFormUserId(asg.userId);
    setFormRoleId(asg.roleId);
    setFormNature(asg.nature);
    setFormDeliverableId(asg.deliverableId || '');
    const activeAlloc = asg.allocations[0];
    setFormWeeklyHours(activeAlloc ? activeAlloc.weeklyHours : 8);
    setFormStartDate(activeAlloc ? activeAlloc.startDate : project.startDate || '2026-08-15');
    setFormEndDate(activeAlloc && activeAlloc.endDate ? activeAlloc.endDate : '');
    setFormReason('capacity_rebalance');
    setFormNotes(asg.notes || '');
    setShowAddModal(true);
  };

  // Cálculo de capacidad en vivo para el modal
  const selectedUserCapacity = useMemo(() => {
    if (!formUserId) return null;
    return userCapacities.get(formUserId) || null;
  }, [formUserId, userCapacities]);

  const potentialOverallocated = useMemo(() => {
    if (!selectedUserCapacity) return 0;
    const currentAssignmentHours = editingAssignment ? getActiveWeeklyHoursForAssignment(editingAssignment) : 0;
    const otherCommitted = selectedUserCapacity.globalPlannedWeekly - currentAssignmentHours;
    const newTotal = otherCommitted + Number(formWeeklyHours || 0);
    return Math.max(0, newTotal - selectedUserCapacity.configuredWeekly);
  }, [selectedUserCapacity, formWeeklyHours, editingAssignment]);

  return (
    <div className="space-y-6">
      {/* 1. BARRA SUPERIOR DE MÉTRICAS DE EQUIPO Y CAPACIDAD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748b] text-xs font-semibold">
            <span>Carga Semanal Activa</span>
            <Clock className="w-4 h-4 text-[#501f92]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-[#0f172a]">
              {totalWeeklyPlannedThisProject.toFixed(1)}h
            </span>
            <span className="text-xs text-[#64748b]">/ semana</span>
          </div>
          <p className="text-[11px] text-[#64748b] mt-1">
            Suma de dedicación activa del equipo en este proyecto
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748b] text-xs font-semibold">
            <span>Proyección Mensual</span>
            <Calendar className="w-4 h-4 text-[#0284c7]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-[#0f172a]">
              {(totalWeeklyPlannedThisProject * 4.333).toFixed(1)}h
            </span>
            <span className="text-xs text-[#64748b]">
              vs {project.budgetedHours}h cotizadas
            </span>
          </div>
          <p className="text-[11px] text-[#64748b] mt-1">
            {totalWeeklyPlannedThisProject * 4.333 > project.budgetedHours ? (
              <span className="text-[#b45309] font-semibold">⚠️ Proyección supera bolsa cotizada</span>
            ) : (
              <span className="text-[#15803d]">✓ Proyección alineada con presupuesto</span>
            )}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748b] text-xs font-semibold">
            <span>Colaboradores Únicos</span>
            <Users className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-[#0f172a]">
              {teamByPerson.length}
            </span>
            <span className="text-xs text-[#64748b]">
              ({assignments.length} asignaciones rol)
            </span>
          </div>
          <p className="text-[11px] text-[#64748b] mt-1">
            Permite personas con roles simultáneos
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748b] text-xs font-semibold">
            <span>Gobernanza y Alertas</span>
            <Shield className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {Array.from(userCapacities.values()).some((c) => c.overallocatedWeekly > 0) ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#fef2f2] text-[#dc2626] text-xs font-bold border border-[#fecaca]">
                <AlertTriangle className="w-3.5 h-3.5" />
                Sobreasignación detectada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#ecfdf5] text-[#15803d] text-xs font-bold border border-[#bbf7d0]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Capacidad balanceada
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#64748b] mt-1">
            Auditoría de sobrecupo y disponibilidad global
          </p>
        </div>
      </div>

      {/* 2. ACCIONES Y CONTROL DE EQUIPO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#e2e8f0] shadow-2xs">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            placeholder="Buscar por colaborador o rol..."
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-[#f8fafc] border border-[#e2e8f0] focus:outline-none focus:border-[#501f92] focus:bg-white transition-all text-[#0f172a]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowStakeholderModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-[#475569] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title="Agregar seguidor o stakeholder sin consumo de horas ni rol cotizado"
          >
            <Eye className="w-3.5 h-3.5 text-[#64748b]" />
            <span>+ Seguidor ({stakeholders.length})</span>
          </button>

          <button
            onClick={() => setShowHistoryDrawer(true)}
            className="px-3.5 py-2 text-xs font-bold text-[#501f92] bg-[#f5f3ff] hover:bg-[#ede9fe] border border-[#ddd6fe] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-[#501f92]" />
            <span>Historial ({historyList.length})</span>
          </button>

          <button
            onClick={() => {
              setEditingAssignment(null);
              setFormUserId('');
              setFormRoleId('');
              setFormWeeklyHours(8);
              setFormNotes('');
              setShowAddModal(true);
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3f1675] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Asignar Colaborador</span>
          </button>
        </div>
      </div>

      {/* 3. TABLA PRINCIPAL: EQUIPO Y ASIGNACIONES MULTIROL */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#f1f5f9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#501f92]" />
            <h3 className="font-extrabold text-sm text-[#0f172a]">
              Equipo Asignado ({teamByPerson.length} colaboradores · {assignments.length} asignaciones)
            </h3>
          </div>
          <span className="text-[11px] text-[#64748b]">
            Una persona puede tener asignaciones de gobernanza y ejecución simultáneamente
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f8fafc]">
                <th className="py-3 px-5 min-w-[200px]">PERSONA</th>
                <th className="py-3 px-4 min-w-[240px]">ROLES & NATURALEZA EN PROYECTO</th>
                <th className="py-3 px-4 text-right min-w-[130px]">CARGA EN ESTE PROYECTO</th>
                <th className="py-3 px-4 min-w-[200px]">CAPACIDAD GLOBAL AGENCIA</th>
                <th className="py-3 px-5 text-right pr-6 min-w-[120px]">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {teamByPerson.map((item) => {
                const userCap = userCapacities.get(item.user.id);
                const configured = userCap?.configuredWeekly || 40;
                const globalPlanned = userCap?.globalPlannedWeekly || item.totalWeeklyInProject;
                const available = userCap?.availableWeekly ?? Math.max(0, configured - globalPlanned);
                const overallocated = userCap?.overallocatedWeekly || 0;
                const utilPercent = Math.round((globalPlanned / configured) * 100);

                return (
                  <tr key={item.user.id} className="hover:bg-[#fbfcfe] transition-colors">
                    {/* Persona */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${item.user.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                          {item.user.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#0f172a] text-xs">{item.user.name}</span>
                            {item.hasGovernance && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#f5f3ff] text-[#501f92] border border-[#ddd6fe]">
                                Gobernanza
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#64748b] block">{item.user.jobTitle || item.user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Roles y Asignaciones Multirol */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5">
                        {item.assignments.map((asg) => {
                          const weekly = getActiveWeeklyHoursForAssignment(asg);
                          return (
                            <div
                              key={asg.id}
                              className="flex items-center justify-between p-1.5 rounded-lg bg-[#f8fafc] border border-[#f1f5f9] text-[11px]"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${
                                  asg.nature === 'governance' ? 'bg-[#501f92]' : asg.nature === 'temporary_support' ? 'bg-[#f59e0b]' : 'bg-[#0284c7]'
                                }`} />
                                <span className="font-bold text-[#0f172a]">{asg.roleId}</span>
                                <span className="text-[10px] text-[#64748b]">
                                  ({asg.nature === 'governance' ? 'Gobernanza' : asg.nature === 'temporary_support' ? 'Apoyo puntual' : 'Ejecución'})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#501f92]">{weekly.toFixed(1)}h/sem</span>
                                <button
                                  onClick={() => openEditModal(asg)}
                                  className="p-1 hover:bg-[#ede9fe] text-[#64748b] hover:text-[#501f92] rounded cursor-pointer transition-colors"
                                  title="Editar esta asignación de rol"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleRemoveAssignment(asg.id, 'project_exit')}
                                  className="p-1 hover:bg-[#fee2e2] text-[#64748b] hover:text-[#dc2626] rounded cursor-pointer transition-colors"
                                  title="Retirar esta asignación"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    {/* Carga en este proyecto */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-black text-sm text-[#0f172a]">
                        {item.totalWeeklyInProject.toFixed(1)} h
                      </span>
                      <span className="text-[10px] text-[#64748b] block font-normal">/ semana planificadas</span>
                    </td>

                    {/* Capacidad Global en la Agencia */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#64748b]">
                            {globalPlanned.toFixed(1)}h de {configured}h config.
                          </span>
                          <span className={`font-bold font-mono ${
                            overallocated > 0 ? 'text-[#dc2626]' : utilPercent > 85 ? 'text-[#b45309]' : 'text-[#15803d]'
                          }`}>
                            {overallocated > 0 ? `+${overallocated.toFixed(1)}h sobrecupo` : `${available.toFixed(1)}h libres`}
                          </span>
                        </div>

                        {/* Barra de progreso de utilización */}
                        <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              overallocated > 0 ? 'bg-[#ef4444]' : utilPercent > 85 ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
                            }`}
                            style={{ width: `${Math.min(100, utilPercent)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-5 text-right pr-6">
                      <button
                        onClick={() => {
                          setEditingAssignment(null);
                          setFormUserId(item.user.id);
                          setFormRoleId('');
                          setFormWeeklyHours(4);
                          setFormNotes('');
                          setShowAddModal(true);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#501f92] hover:bg-[#f5f3ff] border border-[#ddd6fe] rounded-lg transition-colors cursor-pointer"
                        title="Agregar otro rol a esta misma persona en este proyecto"
                      >
                        + Rol
                      </button>
                    </td>
                  </tr>
                );
              })}

              {teamByPerson.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#64748b]">
                    No se encontraron colaboradores asignados. Haz clic en "Asignar Colaborador" para comenzar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. SEGUIDORES & STAKEHOLDERS (Relación independiente sin rol cotizado ni consumo de horas) */}
      <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-xs space-y-3">
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
            <span>Añadir Seguidor</span>
          </button>
        </div>

        <p className="text-[11px] text-[#64748b] leading-relaxed">
          Personas que requieren visibilidad del proyecto (reportes, cambios de estado o hitos) sin representar un rol comercial cotizado ni consumir capacidad operativa.
        </p>

        {stakeholders.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {stakeholders.map((s) => {
              const u = resolveUser(s.userId);
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs"
                >
                  <div className={`w-5 h-5 rounded-full ${u.avatarBg} text-white flex items-center justify-center font-bold text-[10px]`}>
                    {u.initials}
                  </div>
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
        ) : (
          <div className="p-3 rounded-2xl bg-[#f8fafc] border border-dashed border-[#e2e8f0] text-center text-xs text-[#64748b]">
            No hay stakeholders o seguidores externos en este proyecto.
          </div>
        )}
      </div>

      {/* 5. MODAL: ASIGNAR / EDITAR COLABORADOR (SOPORTE MULTIROL) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div>
                <h3 className="font-extrabold text-base text-[#0f172a]">
                  {editingAssignment ? 'Modificar Asignación de Rol' : 'Asignar Colaborador al Proyecto'}
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Define el rol presupuestado, la naturaleza y la carga horaria semanal.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Persona */}
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Colaborador (Persona Real) <span className="text-[#ef4444]">*</span>
                </label>
                <select
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  disabled={!!editingAssignment}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#501f92]"
                >
                  <option value="">Seleccionar persona...</option>
                  {users.map((u) => {
                    const cap = userCapacities.get(u.id);
                    const free = cap ? cap.availableWeekly : 0;
                    return (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.jobTitle || u.role}) — {free.toFixed(1)}h disponibles
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Rol Cotizado / Disciplina */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Rol en este Proyecto <span className="text-[#ef4444]">*</span>
                  </label>
                  <select
                    value={formRoleId}
                    onChange={(e) => setFormRoleId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#501f92]"
                  >
                    <option value="">Seleccionar rol...</option>
                    {availableRoles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Naturaleza de Asignación
                  </label>
                  <select
                    value={formNature}
                    onChange={(e) => setFormNature(e.target.value as AssignmentNature)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#501f92]"
                  >
                    <option value="core_execution">Ejecución Base (Regular)</option>
                    <option value="governance">Gobernanza / Liderazgo</option>
                    <option value="temporary_support">Apoyo Temporal / Refuerzo</option>
                  </select>
                </div>
              </div>

              {/* Horas semanales planificadas */}
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Horas Semanales Planificadas ({formWeeklyHours}h/semana)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0.5"
                    max="60"
                    step="0.5"
                    value={formWeeklyHours}
                    onChange={(e) => setFormWeeklyHours(Number(e.target.value))}
                    className="w-28 px-3.5 py-2 text-xs rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a] font-mono font-bold"
                  />
                  <span className="text-xs text-[#64748b]">
                    ≈ {(formWeeklyHours * 4.333).toFixed(1)} horas estimadas al mes
                  </span>
                </div>
              </div>

              {/* Advertencia de sobreasignación en vivo */}
              {potentialOverallocated > 0 && (
                <div className="p-3 rounded-2xl bg-[#fffbeb] border border-[#fde68a] text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#b45309]">
                    <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                    <span>Aviso de Sobreasignación (+{potentialOverallocated.toFixed(1)}h)</span>
                  </div>
                  <p className="text-[11px] text-[#92400e] leading-relaxed">
                    Esta asignación llevará a {resolveUser(formUserId).name} a superar su disponibilidad contratada ({selectedUserCapacity?.configuredWeekly}h). Se permite guardar, pero quedará auditada como riesgo en Indunova.
                  </p>
                </div>
              )}

              {/* Ventana temporal de asignación */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">Fecha Inicio</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Fecha Fin (Opcional)
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a]"
                  />
                </div>
              </div>

              {/* Motivo del cambio (Auditoría limpia sin datos médicos) */}
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Motivo de la Asignación / Cambio
                </label>
                <select
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value as AssignmentChangeReason)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a]"
                >
                  <option value="project_kickoff">Arranque del Proyecto (Kickoff)</option>
                  <option value="capacity_rebalance">Rebalanceo de Capacidad / Carga</option>
                  <option value="scope_change">Ajuste de Alcance</option>
                  <option value="temporary_reinforcement">Refuerzo Temporal</option>
                  <option value="planned_absence">Cobertura por Ausencia Programada</option>
                  <option value="permanent_replacement">Reemplazo Definitivo</option>
                  <option value="role_change">Cambio de Rol Operativo</option>
                  <option value="availability_change">Cambio de Disponibilidad</option>
                </select>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">Notas u Observaciones</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="ej. Apoyo en sprint de lanzamiento o reuniones de alineación semanal"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAssignment}
                disabled={!formUserId || !formRoleId || formWeeklyHours <= 0}
                className="px-4 py-2 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3f1675] disabled:opacity-50 rounded-xl cursor-pointer shadow-xs"
              >
                {editingAssignment ? 'Guardar Cambios' : 'Confirmar Asignación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: AGREGAR STAKEHOLDER / SEGUIDOR */}
      {showStakeholderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <h3 className="font-extrabold text-base text-[#0f172a]">Añadir Seguidor / Stakeholder</h3>
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
                  placeholder="ej. Dirección Comercial, Finanzas o QA"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#f8fafc] border border-[#cbd5e1]"
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
                Guardar Seguidor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. DRAWER: HISTORIAL DE MODIFICACIONES DE ASIGNACIONES (AUDITORÍA INMUTABLE) */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-2xs">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-4 animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#501f92]" />
                <h3 className="font-extrabold text-base text-[#0f172a]">Historial de Asignaciones</h3>
              </div>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#64748b]">
              Trazabilidad inmutable de altas, bajas, redistribuciones de carga y reemplazos del equipo.
            </p>

            <div className="space-y-3 pt-2">
              {historyList.map((entry) => {
                const affectedUser = resolveUser(entry.userId);
                return (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${affectedUser.avatarBg} text-white flex items-center justify-center font-bold text-[10px]`}>
                          {affectedUser.initials}
                        </div>
                        <span className="font-bold text-[#0f172a]">{affectedUser.name}</span>
                      </div>
                      <span className="text-[10px] text-[#94a3b8]">
                        {new Date(entry.changedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#475569] space-y-0.5">
                      <div>
                        <span className="font-semibold text-[#0f172a]">Acción: </span>
                        {entry.action === 'created' ? 'Asignación creada' : entry.action === 'updated' ? 'Dedicación modificada' : 'Retirado del proyecto'}
                      </div>
                      <div>
                        <span className="font-semibold text-[#0f172a]">Rol: </span>
                        {entry.roleId || 'General'}
                      </div>
                      <div>
                        <span className="font-semibold text-[#0f172a]">Horas: </span>
                        {entry.previousWeeklyHours !== null && entry.previousWeeklyHours !== undefined && (
                          <span className="line-through text-[#94a3b8] mr-1">{entry.previousWeeklyHours}h</span>
                        )}
                        <span className="font-mono font-bold text-[#501f92]">{entry.newWeeklyHours}h / semana</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#0f172a]">Motivo: </span>
                        <span className="italic text-[#501f92]">
                          {entry.reason.replace('_', ' ')}
                        </span>
                      </div>
                      {entry.notes && (
                        <div className="text-[10px] text-[#64748b] bg-white p-2 rounded-lg border border-[#f1f5f9]">
                          "{entry.notes}"
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-[#94a3b8] pt-1 border-t border-[#f1f5f9]">
                      Registrado por: {entry.changedByName || 'Project Lead'}
                    </div>
                  </div>
                );
              })}

              {historyList.length === 0 && (
                <div className="p-8 text-center text-xs text-[#94a3b8]">
                  Aún no hay cambios registrados en el historial de este proyecto.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
