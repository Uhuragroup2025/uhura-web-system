import { evaluateProjectHealth } from './projectHealthEngine';
import { ProjectSummaryItem, TaskItem, normalizeProjectType } from '../types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAILED: ${message}`);
  }
}

console.log('=== TEST SUITE: PROJECT HEALTH ENGINE ===\n');

function makeTask(partial: Partial<TaskItem>): TaskItem {
  return {
    id: `t-${Math.random()}`,
    title: 'Tarea Test',
    department: 'Dev',
    board: 'Sprint',
    date: '2026-09-01',
    dueDate: '2026-10-15',
    dueStatus: 'normal',
    dueText: '',
    status: 'in_progress',
    priority: 'Medium',
    completed: false,
    budgetedHours: 10,
    consumedSeconds: 0,
    assignee: {
      name: 'Paola Monsalve',
      initials: 'PM',
      avatarBg: 'bg-purple-600'
    },
    ...partial
  };
}

// Base project generator
function makeProject(partial: Partial<ProjectSummaryItem>): ProjectSummaryItem {
  return {
    id: 'prj-test',
    name: 'Proyecto Test',
    clientName: 'Cliente Test',
    leadName: 'Paola Monsalve',
    leadAvatarBg: 'bg-purple-600',
    projectType: 'fixed_project',
    serviceBase: 'Desarrollo Web',
    budgetedHours: 100,
    soldHours: 100,
    consumedHours: 0,
    status: 'Activo',
    healthStatus: 'verde',
    startDate: '2026-09-01',
    endDate: '2026-10-30',
    baselineStartDate: '2026-09-01',
    baselineEndDate: '2026-10-30',
    forecastEndDate: '2026-10-30',
    scheduleConfig: {
      clientKickoffWaitDays: 3,
      gateApprovalWaitDays: 5,
      gateCount: 2,
      includedReworkRounds: 2
    },
    ...partial
  };
}

// 1. Caso A: Tiempo 50%, Horas 90%, Avance 45% => Riesgo (G-R1)
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 90,
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 45 }),
      makeTask({ id: 't2', status: 'in_progress', completed: false, budgetedHours: 55 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-09-30' });
  assert(res.status === 'risk', 'Caso A: Status es risk');
  assert(res.triggeredGuardrail === 'G-R1', 'Caso A: Guardrail G-R1 activado (sobregiro prematuro)');
}

// 2. Caso B: Tiempo 90%, Horas 90%, Avance 92% => Saludable
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 90,
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 92 }),
      makeTask({ id: 't2', status: 'in_progress', completed: false, budgetedHours: 8 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-10-25' });
  assert(res.status === 'healthy', 'Caso B: Status es healthy');
}

// 3. Caso C: Tiempo 55%, Horas 60%, Avance 52%, Gate 1 +3d con gestión ayer => Atención (G-A2 / G-A3)
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 60,
    forecastEndDate: '2026-11-04', // +3 días hábiles
    dependencies: [
      {
        id: 'dep-1',
        projectId: 'prj-test',
        title: 'Aprobación Gate 1',
        type: 'approval',
        ownerType: 'client',
        followUpOwnerUserId: 'u-3',
        followUpOwnerName: 'Luisa Urazán',
        requestedAt: '2026-09-15',
        expectedDate: '2026-09-27',
        status: 'pending',
        blocking: true,
        lastFollowUpAt: '2026-09-29T10:00:00Z', // 1 día hábil antes de 2026-09-30
        followUpNotes: 'Seguimiento registrado ayer por Luisa Urazán'
      }
    ],
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 52 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-09-30' });
  assert(res.status === 'attention', 'Caso C: Status es attention');
  assert(res.triggeredGuardrail === 'G-A2' || res.triggeredGuardrail === 'G-A3', 'Caso C: Guardrail G-A2 o G-A3 activado');
}

// 4. Caso D: Horas 50%, Avance 50%, 2 bloqueantes vencidas sin seguimiento => Riesgo (G-R3)
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 50,
    dependencies: [
      {
        id: 'dep-1',
        projectId: 'prj-test',
        title: 'Manual de marca',
        type: 'client_input',
        ownerType: 'client',
        followUpOwnerUserId: 'u-3',
        requestedAt: '2026-09-10',
        expectedDate: '2026-09-20',
        status: 'pending',
        blocking: true,
        lastFollowUpAt: null // Sin seguimiento
      },
      {
        id: 'dep-2',
        projectId: 'prj-test',
        title: 'Accesos hosting',
        type: 'access',
        ownerType: 'client',
        followUpOwnerUserId: 'u-3',
        requestedAt: '2026-09-10',
        expectedDate: '2026-09-22',
        status: 'pending',
        blocking: true,
        lastFollowUpAt: null // Sin seguimiento
      }
    ],
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 50 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-09-30' });
  assert(res.status === 'risk', 'Caso D: Status es risk');
  assert(res.triggeredGuardrail === 'G-R3', 'Caso D: Guardrail G-R3 activado por bloqueantes desatendidas');
}

// 5. Caso E: Horas 75%, Avance 60%, 2 tareas en retrabajo interno R2 => Atención (G-A1 / G-A4)
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 75,
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 60 }),
      makeTask({ id: 't2', status: 'in_progress', completed: false, isRework: true, reworkRound: 2, budgetedHours: 20 }),
      makeTask({ id: 't3', status: 'in_progress', completed: false, isRework: true, reworkRound: 2, budgetedHours: 20 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-09-30' });
  assert(res.status === 'attention', 'Caso E: Status es attention');
}

// 6. Caso F: Horas 70%, Avance 70%, Desvío +8 días hábiles => Riesgo (G-R2)
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 70,
    baselineEndDate: '2026-10-20',
    forecastEndDate: '2026-10-30', // +8 días hábiles
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 70 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-10-01' });
  assert(res.status === 'risk', 'Caso F: Status es risk');
  assert(res.triggeredGuardrail === 'G-R2', 'Caso F: Guardrail G-R2 activado por desvío > 5d');
}

// 7. Caso G: Kickoff día 2 de 3, Horas 5%, Avance 0% => Saludable
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 5,
    tasks: []
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-09-03' });
  assert(res.status === 'healthy', 'Caso G: Status es healthy en kickoff');
}

// 8. Caso H: Cierre de proyecto, Horas 94%, Avance 100%, Desvío 0d => Saludable
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 94,
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 100 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-10-30' });
  assert(res.status === 'healthy', 'Caso H: Status es healthy con cierre en presupuesto');
}

// 9. Edge 1: Proyecto sin horas registradas todavía => Saludable
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 0,
    tasks: []
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-09-01' });
  assert(res.status === 'healthy', 'Edge 1: Status es healthy sin horas');
}

// 10. Edge 2: Proyecto sin dependencias => Saludable
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 40,
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 45 })
    ],
    dependencies: []
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-09-25' });
  assert(res.status === 'healthy', 'Edge 2: Status es healthy sin dependencias');
}

// 11. Edge 3: Cliente dentro del SLA normal (Gate 1 día 3 de 5) => Saludable
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 48,
    dependencies: [
      {
        id: 'dep-1',
        projectId: 'prj-test',
        title: 'Revisión Gate 1',
        type: 'approval',
        ownerType: 'client',
        followUpOwnerUserId: 'u-3',
        requestedAt: '2026-09-20',
        expectedDate: '2026-09-27', // SLA vence el 27
        status: 'pending',
        blocking: true
      }
    ],
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 50 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-09-24' }); // En día 24, dentro de SLA
  assert(res.status === 'healthy', 'Edge 3: Status es healthy dentro de SLA');
}

// 12. Edge 4: Proyecto completado con 105% de horas y 100% de avance => Atención (G-A6)
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 105,
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 100 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-10-30' });
  assert(res.status === 'attention', 'Edge 4: Status es attention');
  assert(res.triggeredGuardrail === 'G-A6', 'Edge 4: Guardrail G-A6 activado por sobrecosto moderado en proyecto completado');
}

// 13. Caso 13: 2 dependencias bloqueantes vencidas +2 días, ambas con gestión ayer => Atención (G-A3), NO Riesgo
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 50,
    dependencies: [
      {
        id: 'dep-1',
        projectId: 'prj-test',
        title: 'Manual de marca',
        type: 'client_input',
        ownerType: 'client',
        followUpOwnerUserId: 'u-3',
        followUpOwnerName: 'Luisa Urazán',
        requestedAt: '2026-09-10',
        expectedDate: '2026-09-26', // Atraso de 2 días hábiles al día 30
        status: 'pending',
        blocking: true,
        lastFollowUpAt: '2026-09-29T10:00:00Z',
        followUpNotes: 'Seguimiento registrado ayer por Luisa Urazán'
      },
      {
        id: 'dep-2',
        projectId: 'prj-test',
        title: 'Accesos hosting',
        type: 'access',
        ownerType: 'client',
        followUpOwnerUserId: 'u-8',
        followUpOwnerName: 'Catalina Tejada',
        requestedAt: '2026-09-10',
        expectedDate: '2026-09-26', // Atraso de 2 días hábiles al día 30
        status: 'pending',
        blocking: true,
        lastFollowUpAt: '2026-09-29T11:00:00Z',
        followUpNotes: 'Seguimiento registrado ayer por Catalina Tejada'
      }
    ],
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 50 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-09-30' });
  assert(res.status === 'attention', 'Caso 13: Status es attention, NO riesgo');
  assert(res.triggeredGuardrail === 'G-A3', 'Caso 13: Guardrail G-A3 activado');
}

// 14. Rework Test 1: 2 rondas normales de cliente => NO penaliza (Saludable)
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 50,
    reworkRounds: [
      { id: 'rw-1', projectId: 'prj-test', roundNumber: 1, cause: 'client_adjustment', requestedAt: '2026-09-10', createdByUserId: 'u-3' },
      { id: 'rw-2', projectId: 'prj-test', roundNumber: 2, cause: 'client_adjustment', requestedAt: '2026-09-18', createdByUserId: 'u-3' }
    ],
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 50 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-09-25' });
  assert(res.status === 'healthy', 'Rework 1: 2 rondas normales no penalizan (healthy)');
}

// 15. Rework Test 2: Ronda 3 de cliente => Atención (G-A7)
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 60,
    reworkRounds: [
      { id: 'rw-1', projectId: 'prj-test', roundNumber: 1, cause: 'client_adjustment', requestedAt: '2026-09-10', createdByUserId: 'u-3' },
      { id: 'rw-2', projectId: 'prj-test', roundNumber: 2, cause: 'client_adjustment', requestedAt: '2026-09-18', createdByUserId: 'u-3' },
      { id: 'rw-3', projectId: 'prj-test', roundNumber: 3, cause: 'client_adjustment', requestedAt: '2026-09-26', createdByUserId: 'u-3', isAdditionalIteration: true }
    ],
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 55 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-09-28' });
  assert(res.status === 'attention', 'Rework 2: Ronda 3 de cliente activa attention');
  assert(res.triggeredGuardrail === 'G-A7', 'Rework 2: Guardrail G-A7 activado');
}

// 16. Rework Test 3: Ronda 3 con scope_redefinition => Atención (G-A8) y alerta de posible reforecast
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 60,
    reworkRounds: [
      { id: 'rw-1', projectId: 'prj-test', roundNumber: 1, cause: 'client_adjustment', requestedAt: '2026-09-10', createdByUserId: 'u-3' },
      { id: 'rw-2', projectId: 'prj-test', roundNumber: 2, cause: 'client_adjustment', requestedAt: '2026-09-18', createdByUserId: 'u-3' },
      { id: 'rw-3', projectId: 'prj-test', roundNumber: 3, cause: 'scope_redefinition', requestedAt: '2026-09-26', createdByUserId: 'u-3', isAdditionalIteration: true }
    ],
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 55 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-09-28' });
  assert(res.status === 'attention', 'Rework 3: scope_redefinition activa attention');
  assert(res.triggeredGuardrail === 'G-A8', 'Rework 3: Guardrail G-A8 activado');
}

// 17. Rework Test 4: Varias rondas internas => Impacto en fricción interna (G-A4)
{
  const p = makeProject({
    soldHours: 100,
    consumedHours: 50,
    reworkRounds: [
      { id: 'rw-1', projectId: 'prj-test', roundNumber: 1, cause: 'internal_adjustment', requestedAt: '2026-09-10', createdByUserId: 'u-2' },
      { id: 'rw-2', projectId: 'prj-test', roundNumber: 2, cause: 'internal_adjustment', requestedAt: '2026-09-18', createdByUserId: 'u-2' }
    ],
    tasks: [
      makeTask({ id: 't1', status: 'completed', completed: true, budgetedHours: 50 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-09-25' });
  assert(res.status === 'attention', 'Rework 4: Varias rondas internas activan attention por fricción interna');
  assert(res.triggeredGuardrail === 'G-A4', 'Rework 4: Guardrail G-A4 activado');
}

// 18. Normalization Tests: Valid explicit mappings
{
  assert(normalizeProjectType('internal') === 'internal_non_billable', 'Norm 1: internal -> internal_non_billable');
  assert(normalizeProjectType('internal_non_billable') === 'internal_non_billable', 'Norm 2: internal_non_billable -> internal_non_billable');
  assert(normalizeProjectType('fixed_milestones') === 'fixed_project', 'Norm 3: fixed_milestones -> fixed_project');
  assert(normalizeProjectType('fixed_project') === 'fixed_project', 'Norm 4: fixed_project -> fixed_project');
  assert(normalizeProjectType('fee_monthly') === 'fee_monthly', 'Norm 5: fee_monthly -> fee_monthly');
}

// 19. Normalization Tests: Empty, null or unknown must return undefined (NEVER silently fallback to fixed_project)
{
  assert(normalizeProjectType(null) === undefined, 'Norm 6: null -> undefined');
  assert(normalizeProjectType(undefined) === undefined, 'Norm 7: undefined -> undefined');
  assert(normalizeProjectType('') === undefined, 'Norm 8: empty string -> undefined');
  assert(normalizeProjectType('   ') === undefined, 'Norm 9: whitespace -> undefined');
  assert(normalizeProjectType('unknown_future_type') === undefined, 'Norm 10: unknown string -> undefined');
}

// 20. Unknown/Undefined ProjectType does not trigger fixed_project calendar guardrails
{
  const p = makeProject({
    projectType: 'unknown_type' as any,
    soldHours: 100,
    consumedHours: 20,
    baselineEndDate: '2026-09-30',
    forecastEndDate: '2026-10-20', // +14 días de atraso
    tasks: [
      makeTask({ id: 't1', status: 'in_progress', budgetedHours: 100, progressPercent: 20 })
    ]
  });
  const res = evaluateProjectHealth({ project: p, currentDateStr: '2026-09-15' });
  // Because it's not fixed_project, G-R2 is NOT triggered, sSched is 100!
  assert(res.status === 'healthy', 'Safety 1: Unknown project type does not inherit fixed_project risk (status is healthy)');
  assert(res.vectors.schedule.score === 100, 'Safety 2: sSched is 100 for non-fixed projects');
}

console.log(`\n========================================`);
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
