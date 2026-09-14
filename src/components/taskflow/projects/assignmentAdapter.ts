import { ProjectAssignment, ProjectTeamMember, AllocationPeriod } from '../types';

/**
 * ADAPTADOR DE COMPATIBILIDAD TRANSITORIA: coreTeam -> ProjectAssignment[]
 * 
 * Este adaptador traduce los registros de coreTeam antiguos a la nueva entidad
 * normalizada ProjectAssignment con AllocationPeriod.
 * 
 * [MARCA DE TRANSICIÓN]: Esta función debe ser retirada una vez que todas las
 * mutaciones y vistas del sistema operen de manera nativa sobre project.assignments.
 */
export function adaptCoreTeamToAssignments(
  projectId: string,
  coreTeam?: ProjectTeamMember[],
  projectStartDate?: string,
  projectEndDate?: string
): ProjectAssignment[] {
  if (!coreTeam || coreTeam.length === 0) return [];

  const defaultStart = projectStartDate || '2026-08-15';
  const defaultEnd = projectEndDate || null;

  return coreTeam.map((member, index) => {
    const isLead = member.isLead || member.role.toLowerCase().includes('lead') || member.role.toLowerCase().includes('pm');
    const nature = isLead ? 'governance' : 'core_execution';
    const weeklyHours = member.weeklyAllocatedHours || (isLead ? 4 : 8);

    const initialAllocation: AllocationPeriod = {
      id: `alloc-compat-${member.id}-${index}`,
      startDate: defaultStart,
      endDate: defaultEnd,
      weeklyHours: weeklyHours,
      notes: 'Asignación migrada de equipo base'
    };

    return {
      id: `asg-compat-${member.id}-${index}`,
      projectId,
      userId: member.id,
      roleId: member.role, // Compatibilidad: mapea directo al nombre del rol
      nature,
      deliverableId: null,
      allocations: [initialAllocation],
      isActive: true,
      notes: member.isLead ? 'Líder de gobernanza / delivery' : undefined
    };
  });
}

/**
 * Calcula las horas semanales planificadas activas para una asignación en una fecha de referencia
 * (por defecto la fecha actual).
 */
export function getActiveWeeklyHoursForAssignment(
  assignment: ProjectAssignment,
  referenceDate: string = new Date().toISOString().split('T')[0]
): number {
  if (!assignment.isActive || !assignment.allocations || assignment.allocations.length === 0) {
    return 0;
  }

  // Buscar ventanas que contengan la fecha de referencia
  const matchingAllocations = assignment.allocations.filter((alloc) => {
    const afterStart = !alloc.startDate || alloc.startDate <= referenceDate;
    const beforeEnd = !alloc.endDate || alloc.endDate >= referenceDate;
    return afterStart && beforeEnd;
  });

  if (matchingAllocations.length > 0) {
    return matchingAllocations.reduce((sum, a) => sum + (a.weeklyHours || 0), 0);
  }

  // Fallback: si todas las ventanas son futuras o no intersectan, toma la última ventana definida
  const latestAlloc = assignment.allocations[assignment.allocations.length - 1];
  return latestAlloc ? latestAlloc.weeklyHours || 0 : 0;
}

/**
 * Calcula el total de horas semanales planificadas en un proyecto sumando las asignaciones activas
 */
export function getProjectTotalWeeklyPlannedHours(
  assignments: ProjectAssignment[],
  referenceDate?: string
): number {
  return assignments.reduce((sum, asg) => sum + getActiveWeeklyHoursForAssignment(asg, referenceDate), 0);
}
