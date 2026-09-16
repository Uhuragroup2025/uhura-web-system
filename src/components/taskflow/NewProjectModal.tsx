import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Briefcase,
  Layers,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Building2,
  ChevronRight,
  ChevronLeft,
  Info,
  ShieldCheck,
  Search,
  Sparkles,
  Check,
  AlertCircle,
  UserPlus,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import {
  ClientProfile,
  ProjectType,
  ProjectDeliverable,
  DeliverableRoleBudget,
  ProjectTeamMember,
  FeeRolloverPolicy,
  STANDARD_UHURA_ROLES,
  StandardUhuraRole,
  TaskItem
} from './types';
import { initialUsers } from './mockData';
import { checkAssigneeAvailability } from './copilot/teamLifeEngine';

export interface NewProjectPayload {
  name: string;
  clientId: string;
  clientName: string;
  taxEntityId?: string | null;
  brand: string;
  projectType: ProjectType;
  serviceBase: string;
  areas?: string[];
  leadName: string;
  leadAvatarBg: string;
  leadRole?: string;
  budgetedHours: number;
  soldHours?: number;
  soldValueCOP?: number;
  soldCurrency?: 'COP' | 'USD';
  startDate: string;
  endDate?: string;
  brief?: string;
  deliverables: ProjectDeliverable[];
  coreTeam: ProjectTeamMember[];
  rolloverPolicy?: FeeRolloverPolicy;
  status: 'Activo' | 'Planificación';
  teamMembers?: { name: string; role: string; avatarBg: string; initials: string }[];
  tasksToCreate?: Omit<TaskItem, 'id'>[];
}

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientProfile[];
  preselectedClientId?: string | null;
  onAddProject: (projectData: NewProjectPayload) => void;
}

const AVAILABLE_LEADS = [
  { id: 'lead-1', name: 'Paola Monsalve', role: 'Product Lead', avatarBg: 'bg-[#501f92]', initials: 'PM' },
  { id: 'lead-2', name: 'Catalina Tejada', role: 'Directora Comercial', avatarBg: 'bg-[#7c3aed]', initials: 'CT' },
  { id: 'lead-3', name: 'Diego Cadavid', role: 'Creative lead', avatarBg: 'bg-[#dc2626]', initials: 'DC' },
  { id: 'lead-4', name: 'Camilo Velez', role: 'Growth Manager', avatarBg: 'bg-[#059669]', initials: 'CV' },
  { id: 'lead-5', name: 'Ana Giraldo', role: 'CEO', avatarBg: 'bg-[#501f92]', initials: 'AG' },
  { id: 'lead-6', name: 'Luisa Fernanda Urazán', role: 'Client relationship', avatarBg: 'bg-[#0284c7]', initials: 'LU' }
];

export const AVAILABLE_TEAM_MEMBERS: {
  id: string;
  name: string;
  role: StandardUhuraRole;
  avatarBg: string;
  initials: string;
  configuredWeeklyHours: number;
  currentAllocatedWeeklyHours: number;
}[] = [
  { id: 'tm-1', name: 'Luisa Fernanda Urazán', role: 'Client relationship', avatarBg: 'bg-[#0284c7]', initials: 'LU', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 18 },
  { id: 'tm-2', name: 'Diego Cadavid', role: 'Creative lead', avatarBg: 'bg-[#dc2626]', initials: 'DC', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 28 },
  { id: 'tm-3', name: 'Esmeralda Duque Ramírez', role: 'Content Creator', avatarBg: 'bg-[#8b5cf6]', initials: 'ED', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 22 },
  { id: 'tm-4', name: 'Nayeliz Brunal', role: 'Digital Content Specialist', avatarBg: 'bg-[#14b8a6]', initials: 'NB', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 19 },
  { id: 'tm-5', name: 'Laura Isabel Gómez', role: 'Digital Designer', avatarBg: 'bg-[#0284c7]', initials: 'LG', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 25 },
  { id: 'tm-6', name: 'Catalina Tejada', role: 'Directora Comercial', avatarBg: 'bg-[#7c3aed]', initials: 'CT', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 20 },
  { id: 'tm-7', name: 'Juan Sebastian', role: 'Tracfiker', avatarBg: 'bg-[#10b981]', initials: 'JS', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 30 },
  { id: 'tm-8', name: 'Paola Monsalve', role: 'Product Lead', avatarBg: 'bg-[#501f92]', initials: 'PM', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 24 },
  { id: 'tm-9', name: 'Ana Giraldo', role: 'CEO', avatarBg: 'bg-[#501f92]', initials: 'AG', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 15 },
  { id: 'tm-10', name: 'Oscar Cerpa', role: 'Desarrollador Web Front-End', avatarBg: 'bg-[#f59e0b]', initials: 'OC', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 26 },
  { id: 'tm-11', name: 'Sara Rivera', role: 'Community Manager', avatarBg: 'bg-[#ec4899]', initials: 'SR', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 18 },
  { id: 'tm-12', name: 'Simón Vélez', role: 'Tracfiker y DigiOps', avatarBg: 'bg-[#10b981]', initials: 'SV', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 27 },
  { id: 'tm-13', name: 'Melisa Gil', role: 'Creative Designer', avatarBg: 'bg-[#d946ef]', initials: 'MG', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 29 },
  { id: 'tm-14', name: 'Camilo Velez', role: 'Growth Manager', avatarBg: 'bg-[#059669]', initials: 'CV', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 22 },
  { id: 'tm-15', name: 'Juan Camilo Torres', role: 'Creative Designer', avatarBg: 'bg-[#6366f1]', initials: 'JT', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 24 },
  { id: 'tm-16', name: 'Alejando Florez Vargas', role: 'Creative Designer', avatarBg: 'bg-[#06b6d4]', initials: 'AF', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 20 },
  { id: 'tm-17', name: 'Sara Mar L', role: 'Creative Designer', avatarBg: 'bg-[#f43f5e]', initials: 'SM', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 25 },
  { id: 'tm-18', name: 'Laura Viviana Salazar Perez', role: 'Administrativa', avatarBg: 'bg-[#64748b]', initials: 'LS', configuredWeeklyHours: 40, currentAllocatedWeeklyHours: 20 }
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  clients,
  preselectedClientId,
  onAddProject
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // --- Step 1: Identidad & Marco ---
  const [selectedClientId, setSelectedClientId] = useState<string>(
    preselectedClientId || clients[0]?.id || ''
  );
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');
  const [taxEntityId, setTaxEntityId] = useState<string>('none');
  const [projectName, setProjectName] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [projectType, setProjectType] = useState<ProjectType>('fee_monthly');
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState(AVAILABLE_LEADS[0]);
  const [brief, setBrief] = useState<string>('');

  // --- Step 2: Frentes, Horas & Asignación Inmediata de Equipo (Unificado) ---
  const [rolloverPolicy, setRolloverPolicy] = useState<FeeRolloverPolicy>('none');
  const [deliverables, setDeliverables] = useState<{
    id: string;
    name: string;
    description: string;
    roleBudgets: {
      id: string;
      roleName: StandardUhuraRole;
      quotedHours: number;
      assignedMemberIds: string[];
    }[];
  }[]>([
    {
      id: 'del-draft-1',
      name: 'Gestión de Redes & Contenido',
      description: 'Parrilla mensual de publicaciones, copys y diseño de piezas',
      roleBudgets: [
        { id: 'rb-draft-1', roleName: 'Creative Designer', quotedHours: 16, assignedMemberIds: ['tm-13'] },
        { id: 'rb-draft-2', roleName: 'Community Manager', quotedHours: 8, assignedMemberIds: ['tm-11'] }
      ]
    },
    {
      id: 'del-draft-2',
      name: 'Landing Page & Activos Web',
      description: 'Diseño, prototipado y ajustes de interfaz web',
      roleBudgets: [
        { id: 'rb-draft-3', roleName: 'Digital Designer', quotedHours: 6, assignedMemberIds: ['tm-5'] },
        { id: 'rb-draft-4', roleName: 'Desarrollador Web Front-End', quotedHours: 10, assignedMemberIds: ['tm-10'] }
      ]
    }
  ]);

  // Target for the immediate assignee picker popover/modal
  const [assigneeModalTarget, setAssigneeModalTarget] = useState<{
    delId: string;
    delName: string;
    roleBudgetId: string;
    roleName: StandardUhuraRole;
    quotedHours: number;
  } | null>(null);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState<string>('');

  // Dedicación semanal en equipo base
  const [selectedTeam, setSelectedTeam] = useState<{
    memberId: string;
    weeklyHours: number;
  }[]>([
    { memberId: 'tm-13', weeklyHours: 6 },
    { memberId: 'tm-11', weeklyHours: 4 },
    { memberId: 'tm-5', weeklyHours: 4 },
    { memberId: 'tm-10', weeklyHours: 6 }
  ]);

  // Unique member IDs assigned across all deliverables
  const assignedMemberIds = useMemo(() => {
    const set = new Set<string>();
    deliverables.forEach((del) => {
      del.roleBudgets.forEach((rb) => {
        rb.assignedMemberIds.forEach((mId) => set.add(mId));
      });
    });
    return Array.from(set);
  }, [deliverables]);

  // Sync selectedTeam automatically when deliverables assignees change
  useEffect(() => {
    setSelectedTeam((prev) => {
      // Keep existing allocations for members still assigned
      const kept = prev.filter((p) => assignedMemberIds.includes(p.memberId));
      // Add newly assigned members with default sensible allocation (4h/sem)
      assignedMemberIds.forEach((mId) => {
        if (!kept.some((p) => p.memberId === mId)) {
          kept.push({ memberId: mId, weeklyHours: 4 });
        }
      });
      return kept;
    });
  }, [assignedMemberIds]);

  // Calculated hours assigned per member in this project across deliverables
  const memberHoursInProject = useMemo(() => {
    const map: Record<string, number> = {};
    deliverables.forEach((del) => {
      del.roleBudgets.forEach((rb) => {
        const count = rb.assignedMemberIds.length;
        if (count > 0) {
          const share = rb.quotedHours / count;
          rb.assignedMemberIds.forEach((mId) => {
            map[mId] = (map[mId] || 0) + share;
          });
        }
      });
    });
    return map;
  }, [deliverables]);

  // Proactive Bucky team alerts (vacations or overcapacity)
  const teamOperationalAlerts = useMemo(() => {
    const alerts: { memberName: string; type: 'vacation' | 'capacity'; message: string }[] = [];
    assignedMemberIds.forEach((mId) => {
      const member = AVAILABLE_TEAM_MEMBERS.find((m) => m.id === mId);
      if (!member) return;
      const userAvail = checkAssigneeAvailability(member.name, initialUsers);
      if (userAvail.isOnVacation) {
        alerts.push({
          memberName: member.name,
          type: 'vacation',
          message: `${member.name} está de vacaciones (retorna el ${userAvail.returnDate || 'pronto'}). Considera respaldo.`
        });
      }
      const freeCap = member.configuredWeeklyHours - member.currentAllocatedWeeklyHours;
      const teamEntry = selectedTeam.find((t) => t.memberId === mId);
      const weeklyHours = teamEntry ? teamEntry.weeklyHours : 4;
      if (weeklyHours > freeCap) {
        alerts.push({
          memberName: member.name,
          type: 'capacity',
          message: `${member.name} tiene ${freeCap}h libres/sem pero se le asignan ${weeklyHours}h/sem.`
        });
      }
    });
    return alerts;
  }, [assignedMemberIds, selectedTeam]);

  // Sync preselected client when opening
  useEffect(() => {
    if (preselectedClientId) {
      setSelectedClientId(preselectedClientId);
      const matched = clients.find((c) => c.id === preselectedClientId);
      if (matched) {
        setBrand(matched.commercialInfo?.brands?.[0] || matched.name);
        if (matched.isInternal) {
          setProjectType('internal_non_billable');
        }
      }
    }
  }, [preselectedClientId, clients]);

  // Current client object
  const currentClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || clients[0];
  }, [clients, selectedClientId]);

  // Filtered clients for quick picker
  const filteredClients = useMemo(() => {
    if (!clientSearchQuery.trim()) return clients;
    const q = clientSearchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.commercialInfo?.brands && c.commercialInfo.brands.some((b: string) => b.toLowerCase().includes(q)))
    );
  }, [clients, clientSearchQuery]);

  // Dynamic calculated rollup: Total Quoted Hours
  const totalQuotedHours = useMemo(() => {
    return deliverables.reduce((acc, del) => {
      const delHours = del.roleBudgets.reduce((rAcc, rb) => rAcc + (rb.quotedHours || 0), 0);
      return acc + delHours;
    }, 0);
  }, [deliverables]);

  // Step 1 Validation
  const canProceedStep1 = useMemo(() => {
    if (!selectedClientId) return false;
    if (!projectName.trim()) return false;
    if (!startDate) return false;
    if (projectType === 'fixed_project' && !endDate) return false;
    return true;
  }, [selectedClientId, projectName, startDate, endDate, projectType]);

  // Step 2 Validation: at least one deliverable, all role hours >= 0 (0h permitted)
  const canProceedStep2 = useMemo(() => {
    if (deliverables.length === 0) return false;
    return deliverables.every((del) => del.name.trim().length > 0);
  }, [deliverables]);

  // Handlers for Deliverables
  const handleAddDeliverable = () => {
    const newId = `del-draft-${Date.now()}`;
    setDeliverables((prev) => [
      ...prev,
      {
        id: newId,
        name: `Nuevo Frente ${prev.length + 1}`,
        description: '',
        roleBudgets: [
          { id: `rb-${Date.now()}-1`, roleName: 'Creative Designer', quotedHours: 0, assignedMemberIds: [] }
        ]
      }
    ]);
  };

  const handleRemoveDeliverable = (delId: string) => {
    if (deliverables.length <= 1) return;
    setDeliverables((prev) => prev.filter((d) => d.id !== delId));
  };

  const handleUpdateDeliverableName = (delId: string, name: string) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === delId ? { ...d, name } : d))
    );
  };

  const handleUpdateDeliverableDesc = (delId: string, description: string) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === delId ? { ...d, description } : d))
    );
  };

  const handleAddRoleToDeliverable = (delId: string) => {
    setDeliverables((prev) =>
      prev.map((d) => {
        if (d.id !== delId) return d;
        return {
          ...d,
          roleBudgets: [
            ...d.roleBudgets,
            { id: `rb-${Date.now()}`, roleName: 'Desarrollador Web Front-End', quotedHours: 0, assignedMemberIds: [] }
          ]
        };
      })
    );
  };

  const handleRemoveRoleFromDeliverable = (delId: string, roleBudgetId: string) => {
    setDeliverables((prev) =>
      prev.map((d) => {
        if (d.id !== delId) return d;
        if (d.roleBudgets.length <= 1) return d;
        return {
          ...d,
          roleBudgets: d.roleBudgets.filter((rb) => rb.id !== roleBudgetId)
        };
      })
    );
  };

  const handleUpdateRoleBudget = (
    delId: string,
    roleBudgetId: string,
    field: 'roleName' | 'quotedHours',
    val: any
  ) => {
    setDeliverables((prev) =>
      prev.map((d) => {
        if (d.id !== delId) return d;
        return {
          ...d,
          roleBudgets: d.roleBudgets.map((rb) => {
            if (rb.id !== roleBudgetId) return rb;
            return {
              ...rb,
              [field]: field === 'quotedHours' ? Math.max(0, parseFloat(val) || 0) : val
            };
          })
        };
      })
    );
  };

  const handleToggleAssigneeToRole = (delId: string, roleBudgetId: string, memberId: string) => {
    setDeliverables((prev) =>
      prev.map((d) => {
        if (d.id !== delId) return d;
        return {
          ...d,
          roleBudgets: d.roleBudgets.map((rb) => {
            if (rb.id !== roleBudgetId) return rb;
            const exists = rb.assignedMemberIds.includes(memberId);
            const next = exists
              ? rb.assignedMemberIds.filter((id) => id !== memberId)
              : [...rb.assignedMemberIds, memberId];
            return { ...rb, assignedMemberIds: next };
          })
        };
      })
    );
  };

  // Handlers for Team Selection
  const toggleTeamMember = (memberId: string) => {
    setSelectedTeam((prev) => {
      const exists = prev.find((p) => p.memberId === memberId);
      if (exists) {
        return prev.filter((p) => p.memberId !== memberId);
      } else {
        return [...prev, { memberId, weeklyHours: 4 }];
      }
    });
  };

  const updateMemberWeeklyHours = (memberId: string, hours: number) => {
    setSelectedTeam((prev) =>
      prev.map((p) => (p.memberId === memberId ? { ...p, weeklyHours: Math.max(0, hours) } : p))
    );
  };

  // Submit Final
  const handleSubmit = (status: 'Activo' | 'Planificación') => {
    if (!currentClient || !projectName.trim()) return;

    const formattedDeliverables: ProjectDeliverable[] = deliverables.map((del, idx) => {
      const roleBudgets: DeliverableRoleBudget[] = del.roleBudgets.map((rb) => ({
        id: rb.id,
        roleId: rb.roleName,
        roleName: rb.roleName,
        quotedHours: rb.quotedHours
      }));
      const delQuotedTotal = roleBudgets.reduce((acc, r) => acc + r.quotedHours, 0);

      return {
        id: del.id.startsWith('del-draft') ? `del-${Date.now()}-${idx}` : del.id,
        projectId: '',
        name: del.name.trim(),
        description: del.description.trim() || undefined,
        order: idx + 1,
        status: 'pending',
        startDate,
        dueDate: endDate || undefined,
        roleBudgets,
        totalQuotedHours: delQuotedTotal,
        totalExecutedHours: 0,
        progressPercentage: 0
      };
    });

    const coreTeam: ProjectTeamMember[] = selectedTeam.map((item) => {
      const info = AVAILABLE_TEAM_MEMBERS.find((m) => m.id === item.memberId)!;
      return {
        id: info.id,
        name: info.name,
        initials: info.initials,
        avatarBg: info.avatarBg,
        role: info.role,
        weeklyAllocatedHours: item.weeklyHours,
        isLead: info.name === selectedLead.name
      };
    });

    // If lead not explicitly in selectedTeam, add them
    if (!coreTeam.some((m) => m.name === selectedLead.name)) {
      coreTeam.unshift({
        id: selectedLead.id,
        name: selectedLead.name,
        initials: selectedLead.initials,
        avatarBg: selectedLead.avatarBg,
        role: selectedLead.role,
        weeklyAllocatedHours: 4,
        isLead: true
      });
    }

    const payload: NewProjectPayload = {
      name: projectName.trim(),
      clientId: currentClient.id,
      clientName: currentClient.name,
      taxEntityId: taxEntityId === 'none' ? null : taxEntityId,
      brand: brand.trim() || currentClient.commercialInfo?.brands?.[0] || currentClient.name,
      projectType,
      serviceBase:
        projectType === 'fee_monthly'
          ? 'Fee Mensual Recurrente'
          : projectType === 'fixed_project'
          ? 'Proyecto Cerrado por Hitos'
          : 'Iniciativa Interna Uhura',
      leadName: selectedLead.name,
      leadAvatarBg: selectedLead.avatarBg,
      leadRole: selectedLead.role,
      budgetedHours: totalQuotedHours,
      soldHours: totalQuotedHours,
      startDate,
      endDate: endDate || undefined,
      brief: brief.trim() || undefined,
      deliverables: formattedDeliverables,
      coreTeam,
      rolloverPolicy: projectType === 'fee_monthly' ? rolloverPolicy : undefined,
      status,
      teamMembers: coreTeam.map((c) => ({
        name: c.name,
        role: c.role,
        avatarBg: c.avatarBg,
        initials: c.initials
      }))
    };

    onAddProject(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#e2e8f0] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#501f92]/10 text-[#501f92] flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0f172a]">Nuevo Proyecto en Orbit</h2>
              <p className="text-xs text-[#64748b]">
                Paso {currentStep} de 3: {
                  currentStep === 1 ? 'Identidad & Marco Operativo' :
                  currentStep === 2 ? 'Frentes, Horas & Asignación de Equipo' :
                  'Revisión & Cierre'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#94a3b8] hover:text-[#334155] hover:bg-[#f1f5f9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Bar (3 Clean Steps) */}
        <div className="px-6 py-3 bg-[#f8fafc] border-b border-[#f1f5f9] flex items-center justify-between">
          {[
            { step: 1, label: 'Identidad', icon: Building2 },
            { step: 2, label: 'Frentes, Horas & Equipo', icon: Layers },
            { step: 3, label: 'Revisión & Cierre', icon: CheckCircle2 }
          ].map((item) => {
            const Icon = item.icon;
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <button
                key={item.step}
                type="button"
                disabled={item.step > currentStep && ((item.step === 2 && !canProceedStep1) || (item.step === 3 && !canProceedStep2))}
                onClick={() => {
                  if (item.step < currentStep) setCurrentStep(item.step as any);
                  else if (item.step === 2 && canProceedStep1) setCurrentStep(2);
                  else if (item.step === 3 && canProceedStep1 && canProceedStep2) setCurrentStep(3);
                }}
                className={`flex items-center gap-2 py-1 px-3 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-[#501f92] text-white shadow-xs'
                    : isDone
                    ? 'text-[#501f92] bg-[#501f92]/10 hover:bg-[#501f92]/15'
                    : 'text-[#94a3b8] hover:text-[#64748b]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.step}. {item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Steps */}
        <div className="p-6 overflow-y-auto flex-1 text-[#0f172a]">
          {/* STEP 1: IDENTIDAD & MARCO OPERATIVO */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]/80">
                <div className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#501f92]" />
                  <span>1. Cliente Operativo (Cuenta Sombrilla)</span>
                </div>
                
                {/* Client Search and Select */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1">
                      Seleccionar Cliente *
                    </label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => {
                        const cId = e.target.value;
                        setSelectedClientId(cId);
                        const c = clients.find((x) => x.id === cId);
                        if (c) {
                          setBrand(c.commercialInfo?.brands?.[0] || c.name);
                          setTaxEntityId('none');
                          if (c.isInternal) {
                            setProjectType('internal_non_billable');
                          }
                        }
                      }}
                      className="w-full text-xs font-medium border border-[#cbd5e1] rounded-xl px-3 py-2 bg-white text-[#0f172a] focus:ring-2 focus:ring-[#501f92] focus:border-transparent"
                    >
                      {filteredClients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} {client.isInternal ? '(Interno Uhura)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tax Entity (100% Optional) */}
                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1 flex items-center justify-between">
                      <span>Razón Social / NIT</span>
                      <span className="text-[10px] text-[#64748b] bg-[#e2e8f0]/60 px-1.5 py-0.5 rounded font-normal">
                        Opcional
                      </span>
                    </label>
                    <select
                      value={taxEntityId}
                      onChange={(e) => setTaxEntityId(e.target.value)}
                      className="w-full text-xs font-medium border border-[#cbd5e1] rounded-xl px-3 py-2 bg-white text-[#0f172a] focus:ring-2 focus:ring-[#501f92] focus:border-transparent"
                    >
                      <option value="none">Sin asignar / Por definir (No bloquea la operación)</option>
                      {currentClient?.taxEntities?.map((te) => (
                        <option key={te.id} value={te.id}>
                          {te.nit} · {te.businessName} {te.isPrimary ? '(Principal)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {currentClient && (
                  <div className="mt-3 pt-3 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#64748b]">
                    <div>
                      Marca / Vertical:&nbsp;
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="Ej. Yamaha, Danone..."
                        className="font-semibold text-[#0f172a] bg-transparent border-b border-[#cbd5e1] px-1 py-0.5 focus:border-[#501f92] outline-hidden text-xs"
                      />
                    </div>
                    {currentClient.isInternal && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#501f92]/10 text-[#501f92]">
                        <ShieldCheck className="w-3 h-3" />
                        Cliente Interno Protegido
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Project Name and Nature */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#475569] mb-1">
                    Nombre del Proyecto *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ej. Campaña Navidad 2026, E-commerce Shopify, Mantenimiento Q4..."
                    className="w-full text-sm font-semibold border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#501f92] focus:border-transparent"
                  />
                </div>

                {/* Project Typology */}
                <div>
                  <label className="block text-xs font-medium text-[#475569] mb-1.5">
                    Naturaleza Operativa del Proyecto *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        type: 'fee_monthly' as ProjectType,
                        title: 'Fee Mensual (Retainer)',
                        desc: 'Ciclos mensuales con histórico acumulativo. Presupuesto evaluado por mes.',
                        badge: 'Mensual'
                      },
                      {
                        type: 'fixed_project' as ProjectType,
                        title: 'Proyecto Cerrado',
                        desc: 'Bolsa de horas cotizadas fija con fecha de cierre y frentes de entrega.',
                        badge: 'Hitos'
                      },
                      {
                        type: 'internal_non_billable' as ProjectType,
                        title: 'Interno / No Facturable',
                        desc: 'Iniciativas de UHURA Group. Permite 0h cotizadas sin considerarlo error.',
                        badge: 'Uhura'
                      }
                    ].map((item) => {
                      const isSelected = projectType === item.type;
                      return (
                        <div
                          key={item.type}
                          onClick={() => setProjectType(item.type)}
                          className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#501f92] bg-[#501f92]/5 text-[#501f92]'
                              : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white text-[#334155]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs">{item.title}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-[#f1f5f9] text-[#475569]">
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#64748b] leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dates & Governance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#501f92]" />
                      <span>Fecha de Inicio *</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs border border-[#cbd5e1] rounded-xl px-3 py-2 bg-white text-[#0f172a] focus:ring-2 focus:ring-[#501f92]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
                      <span>Fecha de Fin {projectType === 'fixed_project' ? '*' : '(Opcional)'}</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder={projectType === 'fee_monthly' ? 'Abierto / Renovación' : ''}
                      className="w-full text-xs border border-[#cbd5e1] rounded-xl px-3 py-2 bg-white text-[#0f172a] focus:ring-2 focus:ring-[#501f92]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#475569] mb-1">
                      Project Lead Responsable *
                    </label>
                    <select
                      value={selectedLead.name}
                      onChange={(e) => {
                        const lead = AVAILABLE_LEADS.find((l) => l.name === e.target.value);
                        if (lead) setSelectedLead(lead);
                      }}
                      className="w-full text-xs border border-[#cbd5e1] rounded-xl px-3 py-2 bg-white text-[#0f172a] focus:ring-2 focus:ring-[#501f92]"
                    >
                      {AVAILABLE_LEADS.map((lead) => (
                        <option key={lead.id} value={lead.name}>
                          {lead.name} ({lead.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Optional Brief */}
                <div>
                  <label className="block text-xs font-medium text-[#475569] mb-1">
                    Descripción Breve u Objetivos del Proyecto (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="Contexto estratégico, entregables clave o alcance comercial..."
                    className="w-full text-xs border border-[#cbd5e1] rounded-xl p-3 bg-white text-[#0f172a] focus:ring-2 focus:ring-[#501f92]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: FRENTES, HORAS & ASIGNACIÓN INMEDIATA DE EQUIPO (UNIFICADO) */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Top Operational Bar */}
              <div className="p-4 bg-linear-to-r from-[#501f92]/8 via-[#7c3aed]/5 to-[#f8fafc] border border-[#501f92]/20 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-[#501f92] text-white">
                      <Layers className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#501f92]">
                      Frentes, Horas & Asignación de Equipo
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#64748b] mt-1 leading-relaxed">
                    Asigna la bolsa de horas por frente y selecciona a los colaboradores de inmediato con visibilidad en tiempo real de su disponibilidad semanal y estado de vacaciones.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="px-3.5 py-2 rounded-xl bg-white border border-[#501f92]/30 shadow-2xs text-center">
                    <span className="text-[10px] text-[#64748b] uppercase font-bold block">
                      Total Cotizado
                    </span>
                    <span className="text-base font-black text-[#501f92]">
                      {totalQuotedHours}h
                    </span>
                    {projectType === 'fee_monthly' && (
                      <span className="text-[9px] text-[#64748b] block">/ mes</span>
                    )}
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-white border border-[#e2e8f0] shadow-2xs text-center">
                    <span className="text-[10px] text-[#64748b] uppercase font-bold block">
                      Frentes
                    </span>
                    <span className="text-base font-black text-[#0f172a]">
                      {deliverables.length}
                    </span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-white border border-[#e2e8f0] shadow-2xs text-center">
                    <span className="text-[10px] text-[#64748b] uppercase font-bold block">
                      Core Team
                    </span>
                    <span className="text-base font-black text-[#0f172a]">
                      {assignedMemberIds.length} pers.
                    </span>
                  </div>
                </div>
              </div>

              {/* Bucky Copilot Proactive Alerts */}
              {teamOperationalAlerts.length > 0 && (
                <div className="p-3 bg-[#fffbeb] border border-[#fde68a] rounded-xl text-xs text-[#92400e] flex items-start gap-2.5">
                  <span className="text-base shrink-0 leading-none">🦫</span>
                  <div className="space-y-1 flex-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>Copiloto Bucky: Alertas operativas del equipo asignado</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#78350f]">
                      {teamOperationalAlerts.map((alt, i) => (
                        <li key={i}>{alt.message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* If Fee Monthly: Rollover policy selector */}
              {projectType === 'fee_monthly' && (
                <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#e2e8f0] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#0f172a] block">
                      Política de Rollover de Horas (Fee Mensual)
                    </span>
                    <span className="text-[11px] text-[#64748b]">
                      Define qué ocurre al cerrar cada ciclo mensual con horas no consumidas.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setRolloverPolicy('none')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        rolloverPolicy === 'none'
                          ? 'bg-[#501f92] text-white shadow-xs'
                          : 'bg-white border border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]'
                      }`}
                    >
                      Sin Rollover (Vencen al mes)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRolloverPolicy('carry_over')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        rolloverPolicy === 'carry_over'
                          ? 'bg-[#501f92] text-white shadow-xs'
                          : 'bg-white border border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]'
                      }`}
                    >
                      Carry Over (Pasan al siguiente)
                    </button>
                  </div>
                </div>
              )}

              {/* Deliverables List with Direct Assignee Allocation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                    <span>Frentes de Trabajo & Asignación de Roles</span>
                    <span className="text-[10px] font-semibold bg-[#e2e8f0] text-[#475569] px-2 py-0.5 rounded-full">
                      {deliverables.length}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#501f92] bg-[#501f92]/10 hover:bg-[#501f92]/15 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Frente</span>
                  </button>
                </div>

                {deliverables.map((del, delIdx) => {
                  const delTotal = del.roleBudgets.reduce(
                    (sum, r) => sum + (r.quotedHours || 0),
                    0
                  );
                  const allRolesCovered = del.roleBudgets.every((rb) => rb.assignedMemberIds.length > 0);
                  const unassignedRolesCount = del.roleBudgets.filter((rb) => rb.assignedMemberIds.length === 0).length;

                  return (
                    <div
                      key={del.id}
                      className="border border-[#e2e8f0] rounded-2xl p-4 bg-white shadow-xs space-y-3.5"
                    >
                      {/* Deliverable Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#501f92]/10 text-[#501f92] text-xs font-bold flex items-center justify-center shrink-0">
                            {delIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={del.name}
                            onChange={(e) => handleUpdateDeliverableName(del.id, e.target.value)}
                            placeholder="Nombre del Frente (ej. Redes Sociales, Landing Page, Paid Media...)"
                            className="font-bold text-sm text-[#0f172a] border-b border-transparent hover:border-[#cbd5e1] focus:border-[#501f92] outline-hidden px-1 py-0.5 w-full transition-colors"
                          />
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-bold text-[#501f92] bg-[#501f92]/10 px-2.5 py-1 rounded-lg">
                            Subtotal: {delTotal}h
                          </span>
                          {deliverables.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDeliverable(del.id)}
                              className="p-1 text-[#94a3b8] hover:text-[#ef4444] transition-colors cursor-pointer"
                              title="Eliminar este frente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={del.description}
                        onChange={(e) => handleUpdateDeliverableDesc(del.id, e.target.value)}
                        placeholder="Alcance u objetivos de este frente..."
                        className="text-xs text-[#64748b] border-b border-transparent hover:border-[#e2e8f0] focus:border-[#501f92] outline-hidden px-1 py-0.5 w-full"
                      />

                      {/* Role Budgets + Direct Assignees within this deliverable */}
                      <div className="pt-2 border-t border-[#f1f5f9] space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#475569]">
                          <span>Bolsa de Horas & Personas Asignadas:</span>
                          <button
                            type="button"
                            onClick={() => handleAddRoleToDeliverable(del.id)}
                            className="text-[#501f92] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Añadir Rol</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {del.roleBudgets.map((rb) => {
                            const assignedMembers = rb.assignedMemberIds.map((id) =>
                              AVAILABLE_TEAM_MEMBERS.find((m) => m.id === id)
                            ).filter(Boolean) as typeof AVAILABLE_TEAM_MEMBERS;

                            return (
                              <div
                                key={rb.id}
                                className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]/90 space-y-2.5"
                              >
                                {/* Role & Hours Line */}
                                <div className="flex flex-wrap items-center justify-between gap-2.5">
                                  <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                                    <span className="text-[11px] font-bold text-[#64748b] shrink-0">
                                      Rol:
                                    </span>
                                    <select
                                      value={rb.roleName}
                                      onChange={(e) =>
                                        handleUpdateRoleBudget(
                                          del.id,
                                          rb.id,
                                          'roleName',
                                          e.target.value as StandardUhuraRole
                                        )
                                      }
                                      className="text-xs font-semibold bg-white border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 text-[#0f172a] focus:ring-2 focus:ring-[#501f92] cursor-pointer flex-1"
                                    >
                                      {STANDARD_UHURA_ROLES.map((role) => (
                                        <option key={role} value={role}>
                                          {role}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[11px] font-bold text-[#64748b]">
                                      Cotizado:
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      value={rb.quotedHours}
                                      onChange={(e) =>
                                        handleUpdateRoleBudget(
                                          del.id,
                                          rb.id,
                                          'quotedHours',
                                          e.target.value
                                        )
                                      }
                                      className="w-16 text-right text-xs font-bold border border-[#cbd5e1] rounded-lg px-2 py-1 bg-white text-[#0f172a] focus:ring-1 focus:ring-[#501f92]"
                                    />
                                    <span className="text-xs font-black text-[#501f92]">h</span>

                                    {del.roleBudgets.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveRoleFromDeliverable(del.id, rb.id)}
                                        className="text-[#94a3b8] hover:text-[#ef4444] p-1 transition-colors cursor-pointer ml-1"
                                        title="Eliminar este rol"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Immediate Assignee Line with Availability Pills */}
                                <div className="pt-2 border-t border-[#e2e8f0]/60 flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[11px] font-semibold text-[#475569] flex items-center gap-1">
                                      <Users className="w-3 h-3 text-[#501f92]" />
                                      <span>Asignado a:</span>
                                    </span>

                                    {assignedMembers.length === 0 ? (
                                      <span className="text-[11px] text-[#94a3b8] italic">
                                        Sin colaborador asignado aún
                                      </span>
                                    ) : (
                                      assignedMembers.map((member) => {
                                        const userAvail = checkAssigneeAvailability(member.name, initialUsers);
                                        const freeCap = member.configuredWeeklyHours - member.currentAllocatedWeeklyHours;
                                        return (
                                          <div
                                            key={member.id}
                                            className="inline-flex items-center gap-1.5 bg-white border border-[#cbd5e1] rounded-lg pl-1.5 pr-2 py-1 text-xs shadow-2xs"
                                          >
                                            <div
                                              className={`w-4 h-4 rounded-full ${member.avatarBg} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}
                                            >
                                              {member.initials}
                                            </div>
                                            <span className="font-semibold text-[#0f172a] text-[11px]">
                                              {member.name}
                                            </span>
                                            <span className="text-[10px] text-[#64748b]">
                                              ({freeCap}h libres)
                                            </span>
                                            {userAvail.isOnVacation && (
                                              <span
                                                className="text-[10px] bg-[#fef3c7] text-[#92400e] px-1 rounded font-bold"
                                                title={userAvail.alertMessage}
                                              >
                                                🏖️ Vacaciones
                                              </span>
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => handleToggleAssigneeToRole(del.id, rb.id, member.id)}
                                              className="text-[#94a3b8] hover:text-[#ef4444] p-0.5 transition-colors cursor-pointer"
                                              title="Remover de este rol"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>

                                  {/* Button to open Assignee Picker Popover */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAssigneeModalTarget({
                                        delId: del.id,
                                        delName: del.name,
                                        roleBudgetId: rb.id,
                                        roleName: rb.roleName,
                                        quotedHours: rb.quotedHours
                                      })
                                    }
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-[#501f92] bg-white hover:bg-[#501f92]/10 border border-[#501f92]/30 rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs"
                                  >
                                    <UserPlus className="w-3.5 h-3.5 text-[#501f92]" />
                                    <span>
                                      {assignedMembers.length === 0 ? '+ Asignar Colaborador' : '+ Agregar otro'}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Deliverable Coverage Summary */}
                      <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[11px]">
                        <div className="text-[#64748b]">
                          {allRolesCovered ? (
                            <span className="text-[#059669] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Todos los roles tienen colaboradores asignados</span>
                            </span>
                          ) : (
                            <span className="text-[#d97706] font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{unassignedRolesCount} rol(es) pendiente(s) por asignar</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[#64748b]">
                          Subtotal del frente: <strong className="text-[#0f172a]">{delTotal}h</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Consolidated Core Team Summary (Below Deliverables) */}
              <div className="mt-6 pt-5 border-t border-[#e2e8f0] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#501f92]" />
                      <span>Equipo Base Consolidado del Proyecto ({assignedMemberIds.length} colaboradores)</span>
                    </h4>
                    <p className="text-[11px] text-[#64748b] mt-0.5">
                      Consolidado automático de las personas asignadas a los frentes. Puedes ajustar la dedicación semanal estimada para cada uno.
                    </p>
                  </div>
                </div>

                {assignedMemberIds.length === 0 ? (
                  <div className="p-4 bg-[#f8fafc] rounded-xl border border-dashed border-[#cbd5e1] text-center text-xs text-[#64748b]">
                    Aún no has asignado colaboradores a los frentes. Haz clic en <strong>"+ Asignar Colaborador"</strong> en cualquiera de los frentes arriba.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {assignedMemberIds.map((mId) => {
                      const member = AVAILABLE_TEAM_MEMBERS.find((m) => m.id === mId);
                      if (!member) return null;
                      const assignment = selectedTeam.find((p) => p.memberId === member.id);
                      const weeklyHours = assignment ? assignment.weeklyHours : 4;
                      const freeCapacity = member.configuredWeeklyHours - member.currentAllocatedWeeklyHours;
                      const userAvail = checkAssigneeAvailability(member.name, initialUsers);
                      const projectHours = memberHoursInProject[member.id] || 0;
                      const isOverloaded = weeklyHours > freeCapacity;

                      return (
                        <div
                          key={member.id}
                          className="p-3.5 rounded-xl border border-[#e2e8f0] bg-white shadow-xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full ${member.avatarBg} text-white text-xs font-bold flex items-center justify-center shrink-0`}
                              >
                                {member.initials}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-[#0f172a]">{member.name}</div>
                                <div className="text-[10px] text-[#64748b]">{member.role}</div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-[#64748b] block">Total en Frentes</span>
                              <span className="text-xs font-black text-[#501f92]">{projectHours}h</span>
                            </div>
                          </div>

                          {/* Allocation & Availability Bar */}
                          <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[11px]">
                            <div className="text-[#64748b]">
                              Capacidad:&nbsp;
                              <span className="font-semibold text-[#0f172a]">
                                {freeCapacity}h libres
                              </span>
                              <span className="text-[10px] text-[#94a3b8]">
                                &nbsp;(de {member.configuredWeeklyHours}h/sem)
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-[#475569]">Dedicación:</span>
                              <input
                                type="number"
                                min="0"
                                max="40"
                                value={weeklyHours}
                                onChange={(e) =>
                                  updateMemberWeeklyHours(
                                    member.id,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-12 text-center text-xs font-bold border border-[#cbd5e1] rounded-lg px-1.5 py-0.5 bg-white"
                              />
                              <span className="text-[10px] text-[#64748b]">h/sem</span>
                            </div>
                          </div>

                          {userAvail.isOnVacation && (
                            <div className="text-[10px] bg-[#fffbeb] text-[#92400e] px-2 py-1 rounded-md font-medium flex items-center gap-1">
                              <span>🏖️</span>
                              <span>De vacaciones (retorna el {userAvail.returnDate || 'próxima semana'})</span>
                            </div>
                          )}

                          {isOverloaded && (
                            <div className="text-[10px] bg-[#fef2f2] text-[#ef4444] px-2 py-1 rounded-md font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>Supera la disponibilidad semanal ({weeklyHours}h vs {freeCapacity}h libres)</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: REVISIÓN & CIERRE (ANTERIOR STEP 4) */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                      Resumen del Proyecto
                    </span>
                    <h3 className="text-base font-bold text-[#0f172a]">{projectName}</h3>
                    <p className="text-xs text-[#64748b]">
                      Cliente: <span className="font-semibold text-[#0f172a]">{currentClient?.name}</span>
                      {brand && ` · Marca: ${brand}`}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#501f92]/10 text-[#501f92]">
                    {projectType === 'fee_monthly'
                      ? 'Fee Mensual'
                      : projectType === 'fixed_project'
                      ? 'Proyecto Cerrado'
                      : 'Interno Uhura'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#e2e8f0] text-xs">
                  <div>
                    <span className="text-[#64748b] block text-[10px]">Razón Social / NIT</span>
                    <span className="font-semibold text-[#0f172a]">
                      {taxEntityId !== 'none'
                        ? currentClient?.taxEntities?.find((te) => te.id === taxEntityId)?.businessName || 'Asignada'
                        : 'Por definir (Sin bloqueo)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[10px]">Project Lead</span>
                    <span className="font-semibold text-[#0f172a]">{selectedLead.name}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[10px]">Cronograma</span>
                    <span className="font-semibold text-[#0f172a]">
                      {startDate} {endDate ? `al ${endDate}` : '(Abierto)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[10px]">Presupuesto Cotizado</span>
                    <span className="font-black text-sm text-[#501f92]">
                      {totalQuotedHours}h {projectType === 'fee_monthly' ? '/ mes' : 'totales'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deliverables summary with assigned team members */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block mb-2">
                  Frentes / Entregables Configurados ({deliverables.length})
                </span>
                <div className="border border-[#e2e8f0] rounded-xl divide-y divide-[#f1f5f9] bg-white">
                  {deliverables.map((del) => {
                    const subtotal = del.roleBudgets.reduce(
                      (acc, r) => acc + (r.quotedHours || 0),
                      0
                    );
                    return (
                      <div key={del.id} className="p-3.5 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-[#0f172a]">{del.name}</div>
                          <div className="font-black text-[#501f92] text-right">
                            {subtotal}h
                          </div>
                        </div>

                        {/* List roles and assigned collaborators */}
                        <div className="space-y-1 pt-1">
                          {del.roleBudgets.map((rb) => {
                            const assignedNames = rb.assignedMemberIds
                              .map((id) => AVAILABLE_TEAM_MEMBERS.find((m) => m.id === id)?.name)
                              .filter(Boolean)
                              .join(', ');

                            return (
                              <div key={rb.id} className="flex items-center justify-between text-[11px] text-[#64748b]">
                                <span>
                                  <strong className="text-[#334155]">{rb.roleName}</strong> ({rb.quotedHours}h):&nbsp;
                                  {assignedNames ? (
                                    <span className="text-[#501f92] font-semibold">{assignedNames}</span>
                                  ) : (
                                    <span className="italic text-[#94a3b8]">Sin asignar</span>
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Team summary */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block mb-2">
                  Equipo Base Asignado ({selectedTeam.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedTeam.map((item) => {
                    const member = AVAILABLE_TEAM_MEMBERS.find((m) => m.id === item.memberId);
                    if (!member) return null;
                    return (
                      <div
                        key={item.memberId}
                        className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 rounded-xl text-xs"
                      >
                        <div
                          className={`w-6 h-6 rounded-full ${member.avatarBg} text-white font-bold text-[10px] flex items-center justify-center`}
                        >
                          {member.initials}
                        </div>
                        <div>
                          <span className="font-bold text-[#0f172a]">{member.name}</span>
                          <span className="text-[10px] text-[#64748b] ml-1.5 font-medium">
                            {item.weeklyHours}h/sem
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 border-t border-[#f1f5f9] bg-[#f8fafc]/80 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="px-4 py-2 rounded-xl border border-[#cbd5e1] hover:bg-white text-[#475569] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[#64748b] hover:text-[#0f172a] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2)
                }
                onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                className="px-5 py-2 rounded-xl bg-[#501f92] hover:bg-[#3d1572] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit('Planificación')}
                  className="px-4 py-2 rounded-xl border border-[#501f92] text-[#501f92] hover:bg-[#501f92]/5 text-xs font-bold transition-colors cursor-pointer"
                >
                  Guardar como Borrador
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('Activo')}
                  className="px-5 py-2 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Crear e Iniciar Proyecto</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Immediate Assignee Picker Modal */}
      {assigneeModalTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#e2e8f0] flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#501f92] bg-[#501f92]/10 px-2 py-0.5 rounded-md">
                    Asignación Inmediata
                  </span>
                  <span className="text-xs font-bold text-[#64748b]">
                    {assigneeModalTarget.quotedHours}h cotizadas
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#0f172a] mt-1">
                  {assigneeModalTarget.roleName}
                </h3>
                <p className="text-[11px] text-[#64748b]">
                  Frente: <span className="font-semibold text-[#0f172a]">{assigneeModalTarget.delName}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAssigneeModalTarget(null);
                  setAssigneeSearchQuery('');
                }}
                className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-5 py-3 border-b border-[#f1f5f9] bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={assigneeSearchQuery}
                  onChange={(e) => setAssigneeSearchQuery(e.target.value)}
                  placeholder="Buscar colaborador por nombre o rol..."
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#cbd5e1] focus:ring-2 focus:ring-[#501f92] focus:border-transparent outline-hidden"
                />
              </div>
            </div>

            {/* Collaborators List */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {(() => {
                const currentDel = deliverables.find((d) => d.id === assigneeModalTarget.delId);
                const currentRb = currentDel?.roleBudgets.find((r) => r.id === assigneeModalTarget.roleBudgetId);
                const targetAssignedIds = currentRb?.assignedMemberIds || [];

                const query = assigneeSearchQuery.toLowerCase().trim();
                const filteredMembers = AVAILABLE_TEAM_MEMBERS.filter(
                  (m) =>
                    !query ||
                    m.name.toLowerCase().includes(query) ||
                    m.role.toLowerCase().includes(query)
                );

                // Split into Suggested (matching role) and Others
                const suggestedMembers = filteredMembers.filter(
                  (m) => m.role.toLowerCase() === assigneeModalTarget.roleName.toLowerCase()
                );
                const otherMembers = filteredMembers.filter(
                  (m) => m.role.toLowerCase() !== assigneeModalTarget.roleName.toLowerCase()
                );

                const renderMemberCard = (member: typeof AVAILABLE_TEAM_MEMBERS[0]) => {
                  const isAssigned = targetAssignedIds.includes(member.id);
                  const freeCapacity = member.configuredWeeklyHours - member.currentAllocatedWeeklyHours;
                  const userAvail = checkAssigneeAvailability(member.name, initialUsers);
                  const isOptimal = freeCapacity >= assigneeModalTarget.quotedHours;

                  return (
                    <div
                      key={member.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isAssigned
                          ? 'border-[#501f92] bg-[#501f92]/5'
                          : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${member.avatarBg} text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs`}
                        >
                          {member.initials}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {userAvail.isOnVacation && (
                              <span
                                className="text-[10px] bg-[#fef3c7] text-[#92400e] px-1.5 py-0.5 rounded font-bold"
                                title={userAvail.alertMessage}
                              >
                                🏖️ Vacaciones
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#64748b]">{member.role}</div>

                          {/* Availability status line */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-semibold text-[#475569]">
                              {freeCapacity}h libres (de {member.configuredWeeklyHours}h/sem)
                            </span>
                            {isOptimal ? (
                              <span className="text-[10px] text-[#059669] bg-[#d1fae5] px-1.5 py-0.2 rounded font-bold">
                                Capacidad óptima
                              </span>
                            ) : freeCapacity > 0 ? (
                              <span className="text-[10px] text-[#d97706] bg-[#fef3c7] px-1.5 py-0.2 rounded font-bold">
                                Parcial
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#dc2626] bg-[#fee2e2] px-1.5 py-0.2 rounded font-bold">
                                Sin disponibilidad
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleAssigneeToRole(
                            assigneeModalTarget.delId,
                            assigneeModalTarget.roleBudgetId,
                            member.id
                          )
                        }
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                          isAssigned
                            ? 'bg-[#501f92] text-white shadow-xs'
                            : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                        }`}
                      >
                        {isAssigned ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Asignado</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Asignar</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                };

                return (
                  <div className="space-y-4">
                    {/* Suggested Group */}
                    {suggestedMembers.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#501f92] flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Sugeridos para {assigneeModalTarget.roleName} ({suggestedMembers.length})</span>
                        </span>
                        <div className="space-y-2">
                          {suggestedMembers.map(renderMemberCard)}
                        </div>
                      </div>
                    )}

                    {/* Other Members Group */}
                    {otherMembers.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                          Otros colaboradores de Uhura Group ({otherMembers.length})
                        </span>
                        <div className="space-y-2">
                          {otherMembers.map(renderMemberCard)}
                        </div>
                      </div>
                    )}

                    {filteredMembers.length === 0 && (
                      <div className="p-6 text-center text-xs text-[#64748b]">
                        No se encontraron colaboradores que coincidan con "{assigneeSearchQuery}".
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#f1f5f9] bg-[#f8fafc] flex items-center justify-between">
              <span className="text-xs text-[#64748b]">
                Los cambios se guardan automáticamente en el frente.
              </span>
              <button
                type="button"
                onClick={() => {
                  setAssigneeModalTarget(null);
                  setAssigneeSearchQuery('');
                }}
                className="px-4 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
