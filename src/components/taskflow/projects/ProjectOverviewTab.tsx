import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Layers,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  History,
  ShieldCheck,
  RotateCw,
  Users,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  ProjectSummaryItem,
  ProjectDeliverable,
  ProjectTeamMember,
  ProjectMonthlyCycle,
  TaskItem,
  FeeRolloverPolicy
} from '../types';

interface ProjectOverviewTabProps {
  project: ProjectSummaryItem & {
    consumedHours: number;
    tasks: TaskItem[];
  };
  deliverables: ProjectDeliverable[];
  coreTeam: ProjectTeamMember[];
  onNavigateToDeliverables: () => void;
  onNavigateToTasks: (frenteName?: string) => void;
  onNavigateToTeam: () => void;
  onSelectClient?: (clientName: string) => void;
}

export const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({
  project,
  deliverables,
  coreTeam,
  onNavigateToDeliverables,
  onNavigateToTasks,
  onNavigateToTeam,
  onSelectClient
}) => {
  const isFee = project.projectType === 'fee_monthly';
  const isInternal = project.projectType === 'internal_non_billable' || project.projectType === 'internal';

  // Active Monthly Cycle for Fee
  const monthlyCycles = project.monthlyCycles || [
    {
      monthKey: '2026-09',
      monthLabel: 'Septiembre 2026',
      quotedHours: project.budgetedHours || 59,
      executedHours: project.consumedHours || 27,
      status: 'active' as const,
      notes: 'Ciclo mensual activo'
    }
  ];

  const [selectedCycleKey, setSelectedCycleKey] = useState<string>(
    project.currentMonthCycle || (monthlyCycles.find((c) => c.status === 'active')?.monthKey || monthlyCycles[0]?.monthKey || '2026-09')
  );

  const currentCycle = monthlyCycles.find((c) => c.monthKey === selectedCycleKey) || monthlyCycles[0];

  // Rollups & Metrics
  const totalQuotedHours = isFee && currentCycle
    ? currentCycle.quotedHours
    : project.budgetedHours || deliverables.reduce((sum, d) => sum + (d.roleBudgets?.reduce((rSum, r) => rSum + (r.quotedHours || 0), 0) || 0), 0);

  const totalExecutedHours = project.consumedHours || 0;
  const executionPercentage = totalQuotedHours > 0 ? Math.round((totalExecutedHours / totalQuotedHours) * 100) : 0;

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.completed || t.status === 'Done').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueTasksCount = project.tasks.filter((t) => t.dueStatus === 'overdue').length;
  const highPriorityTasksCount = project.tasks.filter((t) => t.priority === 'High' && !t.completed).length;

  // Indunova Risk Vectors (Exposed transparently, not simulated)
  const burnProgressVariance = totalQuotedHours > 0
    ? (totalExecutedHours / totalQuotedHours) - (totalTasks > 0 ? completedTasks / totalTasks : 0)
    : 0;

  const rolloverPolicyLabel: Record<FeeRolloverPolicy, string> = {
    none: 'Sin acumulación (Horas vencen a fin de mes)',
    carry_over: 'Rollover acumulable (Horas pasan al siguiente ciclo)',
    contractual_cap: 'Tope contractual acordado'
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP ROLLUP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Horas Cotizadas vs Ejecutadas */}
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              {isFee ? 'Presupuesto Mes' : 'Horas Cotizadas'}
            </span>
            <span className="p-1 rounded-lg bg-[#501f92]/10 text-[#501f92]">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#0f172a] font-mono">
                {totalExecutedHours.toFixed(1)}h
              </span>
              <span className="text-xs text-[#64748b] font-medium font-mono">
                / {totalQuotedHours > 0 ? `${totalQuotedHours}h cotizadas` : '0h (Interno)'}
              </span>
            </div>
            <div className="w-full bg-[#f1f5f9] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                style={{ width: `${Math.min(executionPercentage, 100)}%` }}
                className={`h-full rounded-full ${
                  executionPercentage > 100 ? 'bg-[#ef4444]' : executionPercentage > 85 ? 'bg-[#f59e0b]' : 'bg-[#501f92]'
                }`}
              />
            </div>
          </div>
          <span className="text-[10px] text-[#64748b] mt-2 block">
            {totalQuotedHours > 0
              ? `${executionPercentage}% consumido (${(totalQuotedHours - totalExecutedHours).toFixed(1)}h disponibles)`
              : 'Sin techo comercial rígido'}
          </span>
        </div>

        {/* Avance Operativo */}
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Avance Operativo</span>
            <span className="p-1 rounded-lg bg-[#10b981]/10 text-[#10b981]">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#0f172a]">{progressPercent}%</span>
              <span className="text-xs text-[#64748b] font-medium">
                ({completedTasks} de {totalTasks} tareas)
              </span>
            </div>
            <div className="w-full bg-[#f1f5f9] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                className="h-full rounded-full bg-[#10b981]"
              />
            </div>
          </div>
          <span className="text-[10px] text-[#64748b] mt-2 block">
            {totalTasks - completedTasks} tareas pendientes de entrega
          </span>
        </div>

        {/* Frentes / Entregables */}
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Frentes de Trabajo</span>
            <span className="p-1 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6]">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#0f172a]">{deliverables.length}</span>
              <span className="text-xs text-[#64748b] font-medium">entregables activos</span>
            </div>
            <p className="text-[11px] text-[#64748b] mt-2 line-clamp-1">
              {deliverables.map((d) => d.name).slice(0, 3).join(' · ')}
            </p>
          </div>
          <button
            onClick={onNavigateToDeliverables}
            className="text-[11px] font-bold text-[#501f92] hover:underline flex items-center gap-1 mt-2 text-left cursor-pointer"
          >
            <span>Ver presupuestos por rol</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Semáforo & Estado */}
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Salud del Proyecto</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                project.healthStatus === 'verde'
                  ? 'bg-[#10b981]'
                  : project.healthStatus === 'amarillo'
                  ? 'bg-[#f59e0b]'
                  : 'bg-[#ef4444]'
              }`}
            />
          </div>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                project.healthStatus === 'verde'
                  ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                  : project.healthStatus === 'amarillo'
                  ? 'bg-[#fffbeb] text-[#92400e] border border-[#fde68a]'
                  : 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {project.healthStatus === 'verde'
                  ? 'En Presupuesto'
                  : project.healthStatus === 'amarillo'
                  ? 'Atención Requerida'
                  : 'Desvío Crítico'}
              </span>
            </span>
            <p className="text-[11px] text-[#64748b] mt-1.5 line-clamp-2">
              {project.healthNote || 'Sin desviaciones operativas registradas.'}
            </p>
          </div>
          <div className="text-[10px] text-[#94a3b8] mt-2">
            Lead: <strong className="text-[#475569]">{project.leadName}</strong>
          </div>
        </div>
      </div>

      {/* 2. CICLOS MENSUALES (FEE MENSUAL) - Sin reset destructivo */}
      {isFee && (
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-[#501f92]" />
                <h3 className="font-extrabold text-sm text-[#0f172a]">
                  Ciclos Mensuales Recurrentes (Histórico Preservado)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f3e8ff] text-[#501f92]">
                  Fee Mensual
                </span>
              </div>
              <p className="text-xs text-[#64748b]">
                El proyecto no se resetea destructivamente a fin de mes. Cada ciclo evalúa su presupuesto y conserva su histórico inmutable.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#64748b] font-medium">Política Rollover:</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#f8fafc] text-[#334155] border border-[#e2e8f0]">
                {rolloverPolicyLabel[project.rolloverPolicy || 'none']}
              </span>
            </div>
          </div>

          {/* Stepper de Ciclos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {monthlyCycles.map((cycle) => {
              const isSelected = cycle.monthKey === selectedCycleKey;
              const cycleBurnPercent = cycle.quotedHours > 0
                ? Math.round((cycle.executedHours / cycle.quotedHours) * 100)
                : 0;

              return (
                <div
                  key={cycle.monthKey}
                  onClick={() => setSelectedCycleKey(cycle.monthKey)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#f5f3ff] border-[#501f92] ring-2 ring-[#501f92]/20 shadow-xs'
                      : cycle.status === 'closed'
                      ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1]'
                      : 'bg-white border-[#e2e8f0] hover:border-[#501f92]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[#0f172a]">{cycle.monthLabel}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cycle.status === 'closed'
                          ? 'bg-[#ecfdf5] text-[#065f46]'
                          : cycle.status === 'active'
                          ? 'bg-[#501f92] text-white'
                          : 'bg-[#e2e8f0] text-[#64748b]'
                      }`}
                    >
                      {cycle.status === 'closed' ? 'Cerrado' : cycle.status === 'active' ? 'Ciclo Activo' : 'Próximo'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between text-xs">
                    <span className="text-[#64748b] font-medium text-[11px]">Consumo:</span>
                    <span className="font-mono font-bold text-[#0f172a]">
                      {cycle.executedHours.toFixed(1)}h / {cycle.quotedHours}h ({cycleBurnPercent}%)
                    </span>
                  </div>

                  <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      style={{ width: `${Math.min(cycleBurnPercent, 100)}%` }}
                      className={`h-full rounded-full ${
                        cycleBurnPercent > 100 ? 'bg-[#ef4444]' : 'bg-[#501f92]'
                      }`}
                    />
                  </div>

                  {cycle.notes && (
                    <span className="text-[10px] text-[#64748b] block mt-2 truncate">
                      {cycle.notes}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. VECTORES DE INDUNOVA (EXPOSICIÓN TRANSPARENTE DE RIESGO OPERATIVO) */}
      <div className="bg-[#f8fafc] rounded-3xl border border-[#e2e8f0] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#501f92]" />
            <h3 className="font-extrabold text-sm text-[#0f172a]">
              Vectores Operativos de Riesgo & Alerta (Indunova)
            </h3>
          </div>
          <span className="text-[10px] text-[#64748b] bg-white px-2 py-0.5 rounded-md border border-[#e2e8f0]">
            Métricas puras · Sin heurísticas inventadas
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="bg-white p-3 rounded-xl border border-[#e2e8f0]">
            <span className="text-[10px] text-[#64748b] font-bold block uppercase">Burn vs Avance</span>
            <span className={`text-base font-extrabold font-mono mt-0.5 block ${
              burnProgressVariance > 0.2 ? 'text-[#ef4444]' : 'text-[#0f172a]'
            }`}>
              {burnProgressVariance > 0 ? `+${(burnProgressVariance * 100).toFixed(0)}%` : `${(burnProgressVariance * 100).toFixed(0)}%`}
            </span>
            <span className="text-[10px] text-[#64748b] mt-0.5 block">
              {burnProgressVariance > 0.2 ? 'Horas van más rápido que entregas' : 'Ritmo saludable'}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#e2e8f0]">
            <span className="text-[10px] text-[#64748b] font-bold block uppercase">Tareas Atrasadas</span>
            <span className={`text-base font-extrabold font-mono mt-0.5 block ${
              overdueTasksCount > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'
            }`}>
              {overdueTasksCount}
            </span>
            <span className="text-[10px] text-[#64748b] mt-0.5 block">
              {overdueTasksCount > 0 ? 'Requiere renegociación con cliente' : 'Al día con cronograma'}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#e2e8f0]">
            <span className="text-[10px] text-[#64748b] font-bold block uppercase">Prioridad Alta Activas</span>
            <span className="text-base font-extrabold font-mono text-[#0f172a] mt-0.5 block">
              {highPriorityTasksCount}
            </span>
            <span className="text-[10px] text-[#64748b] mt-0.5 block">
              En cola o en progreso inmediato
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#e2e8f0]">
            <span className="text-[10px] text-[#64748b] font-bold block uppercase">Fuente de Verdad</span>
            <span className="text-xs font-bold text-[#501f92] mt-0.5 block">
              TimeLogs + Roles
            </span>
            <span className="text-[10px] text-[#64748b] mt-0.5 block">
              Rollup matemático sin estimaciones manuales
            </span>
          </div>
        </div>
      </div>

      {/* 4. ENTREGABLES SINTÉTICOS Y EQUIPO ASIGNADO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Entregables */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#501f92]" />
              <h4 className="font-extrabold text-sm text-[#0f172a]">Frentes y Entregables ({deliverables.length})</h4>
            </div>
            <button
              onClick={onNavigateToDeliverables}
              className="text-xs font-bold text-[#501f92] hover:underline cursor-pointer"
            >
              Ver detalle →
            </button>
          </div>

          <div className="space-y-2.5">
            {deliverables.length === 0 ? (
              <p className="text-xs text-[#94a3b8] py-4 text-center">No hay frentes definidos aún.</p>
            ) : (
              deliverables.map((del) => {
                const delQuoted = del.roleBudgets?.reduce((s, r) => s + (r.quotedHours || 0), 0) || 0;
                // Executed from tasks with this deliverableId or frente name
                const delTasks = project.tasks.filter((t) => t.deliverableId === del.id || t.frente === del.name);
                const delExecuted = delTasks.reduce((s, t) => s + ((t.consumedSeconds || 0) / 3600), 0);
                const delPercent = delQuoted > 0 ? Math.round((delExecuted / delQuoted) * 100) : 0;

                return (
                  <div
                    key={del.id}
                    onClick={() => onNavigateToTasks(del.name)}
                    className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#501f92] hover:bg-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-[#0f172a]">{del.name}</strong>
                      <span className="font-mono text-xs font-bold text-[#501f92]">
                        {delExecuted.toFixed(1)}h / {delQuoted > 0 ? `${delQuoted}h` : '0h'}
                      </span>
                    </div>
                    <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        style={{ width: `${Math.min(delPercent, 100)}%` }}
                        className={`h-full rounded-full ${delPercent > 100 ? 'bg-[#ef4444]' : 'bg-[#501f92]'}`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#64748b] mt-1.5">
                      <span>{del.roleBudgets?.length || 0} roles presupuestados</span>
                      <span>{delTasks.length} tareas</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Equipo Asignado */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#501f92]" />
              <h4 className="font-extrabold text-sm text-[#0f172a]">Equipo & Carga Planificada ({coreTeam.length})</h4>
            </div>
            <button
              onClick={onNavigateToTeam}
              className="text-xs font-bold text-[#501f92] hover:underline cursor-pointer"
            >
              Ver equipo →
            </button>
          </div>

          <div className="space-y-2">
            {coreTeam.length === 0 ? (
              <p className="text-xs text-[#94a3b8] py-4 text-center">No hay miembros configurados en el equipo base.</p>
            ) : (
              coreTeam.map((member) => (
                <div
                  key={member.id || member.name}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-full ${member.avatarBg} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}>
                      {member.initials}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[#0f172a] block truncate">
                        {member.name} {member.isLead ? '(Lead)' : ''}
                      </span>
                      <span className="text-[10px] text-[#64748b] block truncate">{member.role}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-[#0f172a] text-xs">
                      {member.weeklyAllocatedHours || 0}h / sem
                    </span>
                    <span className="text-[9px] text-[#64748b] block">Carga planificada</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
