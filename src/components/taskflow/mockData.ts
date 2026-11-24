import {
  TaskItem,
  ActivityItem,
  UserItem,
  MonthlyBillingData,
  ServiceProfitability,
  OperationalAlert,
  TopClient,
  ProjectTrafficLight,
  TeamMemberCapacity,
  TimeLog,
  ClientProjectNode,
  UpcomingMilestone,
  ClientProfile,
  TeamAbsenceEvent
} from './types';

// PLANTILLAS DE ACTIVIDADES RECURRENTES PARA PROYECTOS TIPO FEE
export const FEE_ACTIVITY_TEMPLATES: Record<string, { name: string; defaultHours: number; role: string }[]> = {
  'Mantenimiento Web': [
    { name: 'Actualización de Core, Plugins & Seguridad', defaultHours: 2.0, role: 'Product Lead' },
    { name: 'Carga & Reemplazo de Banners / Assets', defaultHours: 1.5, role: 'Digital Designer' },
    { name: 'Revisión de Data, Eventos & Analytics', defaultHours: 1.5, role: 'Growth Manager' },
    { name: 'Actualización de Precios, Catálogo & Stock', defaultHours: 2.0, role: 'DigiOps Specialist' },
    { name: 'Soporte Preventivo & Healthcheck Mensual', defaultHours: 1.0, role: 'Product Lead' }
  ],
  'Parrilla & Redes': [
    { name: 'Conceptualización & Estrategia Mensual', defaultHours: 4.0, role: 'Product Lead' },
    { name: 'Redacción de Copys & Guiones', defaultHours: 3.5, role: 'Content Creator' },
    { name: 'Diseño de Piezas Gráficas & Carruseles', defaultHours: 6.0, role: 'Digital Designer' },
    { name: 'Edición de Videos / Reels & Motion', defaultHours: 5.0, role: 'Creative Designer' },
    { name: 'Programación de Publicaciones & Community', defaultHours: 2.5, role: 'Community Manager' }
  ],
  'Growth & Pauta': [
    { name: 'Configuración & Activación de Pauta (Trafficker)', defaultHours: 3.0, role: 'Growth Manager' },
    { name: 'Optimización de Presupuestos & CBO/ABO', defaultHours: 2.0, role: 'Growth Manager' },
    { name: 'Auditoría de Conversiones & Píxeles Meta/Google', defaultHours: 2.5, role: 'Growth Manager' },
    { name: 'Reporte Ejecutivo de Rendimiento / ROAS', defaultHours: 2.0, role: 'Growth Manager' }
  ],
  'Soporte Continuo': [
    { name: 'Atención a Tickets de Soporte & Ajustes Rápidos', defaultHours: 2.0, role: 'Digital Designer' },
    { name: 'Optimización de Velocidad / Core Web Vitals', defaultHours: 3.0, role: 'Front-End Dev' },
    { name: 'QA & Pruebas Cruzadas de Compatibilidad', defaultHours: 2.0, role: 'Product Lead' }
  ]
};

// PLANTILLAS DE FASES PARA PROYECTOS PUNTUALES DE DESARROLLO
export const PROJECT_PHASES_TEMPLATES = [
  'Discovery & Arquitectura',
  'UI/UX & Prototipado',
  'Implementación / Dev',
  'QA & Testing',
  'Despliegue & Cierre'
] as const;

// JERARQUÍA DE 3 NIVELES (CLIENTES → PROYECTOS CON TIPO FEE VS PUNTUAL)
export const clientProjectHierarchy: ClientProjectNode[] = [
  {
    id: 'cli-yamaha',
    name: 'INCOLMOTOS YAMAHA S.A.',
    isInternal: false,
    projects: [
      {
        id: 'prj-yam-fee',
        name: 'Fee mensual Contenido y Social · Yamaha',
        budgetedHours: 42.0,
        projectType: 'fee_monthly',
        feeCategory: 'Parrilla & Redes'
      }
    ]
  },
  {
    id: 'cli-rockandride',
    name: 'Rock and Ride S.A.S.',
    isInternal: false,
    projects: [
      {
        id: 'prj-battsaver-1',
        name: 'Tienda Online BattSaver',
        budgetedHours: 100.0,
        projectType: 'fixed_project',
        startDate: '3 Nov 2026',
        endDate: '18 Dic 2026',
        phases: ['Discovery & Arquitectura', 'UI/UX & Prototipado', 'Implementación Shopify', 'QA & Salida']
      }
    ]
  },
  {
    id: 'cli-uhura-internal',
    name: '🏢 Uhura Interno / No Facturable',
    isInternal: true,
    projects: [
      {
        id: 'prj-uhu-2',
        name: 'Gestión Administrativa & Operaciones',
        budgetedHours: 30.0,
        projectType: 'fee_monthly',
        feeCategory: 'Soporte Continuo'
      }
    ]
  }
];

// FACTURACIÓN MENSUAL (Mes corriente + últimos 6 meses · COP)
export const orbitMonthlyBilling: MonthlyBillingData[] = [
  { month: 'Mar 26', billed: 260, target: null },
  { month: 'Abr 26', billed: 245, target: null },
  { month: 'May 26', billed: 360, target: null },
  { month: 'Jun 26', billed: 125, target: null },
  { month: 'Jul 26', billed: 0, target: null },
  { month: 'Ago 26', billed: 0, target: null },
];

// RENTABILIDAD POR SERVICIO
export const orbitServicesProfitability: ServiceProfitability[] = [
  { id: 'srv-1', service: '(Sin proyecto)', revenue: 1288.5, marginPercent: 100.0, color: '#501f92' },
  { id: 'srv-2', service: 'Growth / Performance', revenue: 50.9, marginPercent: 100.0, color: '#8a4dff' },
  { id: 'srv-3', service: 'Web / Desarrollo', revenue: 20.9, marginPercent: 100.0, color: '#4be5ff' },
  { id: 'srv-4', service: 'Creatividad', revenue: 14.0, marginPercent: 100.0, color: '#d4ff4a' },
  { id: 'srv-5', service: 'Otro', revenue: 0, marginPercent: 0, color: '#9ca3af' },
];

// ALERTAS OPERATIVAS
export const orbitOperationalAlerts: OperationalAlert[] = [];

// CLIENTES TOP
export const orbitTopClients: TopClient[] = [
  {
    id: 'cli-1',
    name: 'Danone S.A.',
    billingCOP: '$450.0M',
    billingAmount: 450.0,
    marginPercent: 100.0,
    projectCount: 5
  },
  {
    id: 'cli-2',
    name: 'Incolmotos Yamaha S.A.',
    billingCOP: '$320.0M',
    billingAmount: 320.0,
    marginPercent: 95.0,
    projectCount: 4
  },
  {
    id: 'cli-3',
    name: 'BAMBÚ BPO',
    billingCOP: '$180.0M',
    billingAmount: 180.0,
    marginPercent: 90.0,
    projectCount: 2
  }
];

// SEMÁFORO DE PROYECTOS
export const orbitTrafficLightProjects: ProjectTrafficLight[] = [
  {
    id: 'prj-1',
    name: 'Admin de pauta Bambú BPO',
    client: 'BAMBÚ BPO',
    riskStatus: 'rojo',
    reason: 'Retraso: 7 sem de 4 planeadas',
    delayWeeks: '7 sem / 4 plan',
    leadAssignee: 'Camilo Vélez',
    progressPercent: 78
  },
  {
    id: 'prj-2',
    name: 'Yamaha R15 · Campaña Social & Web',
    client: 'Incolmotos Yamaha S.A.',
    riskStatus: 'amarillo',
    reason: 'En fase final de maquetación',
    leadAssignee: 'Oscar Cerpa',
    progressPercent: 88
  }
];

// CAPACIDAD DEL EQUIPO
export const orbitTeamCapacity: TeamMemberCapacity[] = [
  {
    id: 'team-1',
    name: 'Oscar Cerpa',
    initials: 'OC',
    avatarBg: 'bg-[#f59e0b]',
    avatarUrl: '/assets/team/oscar-cerpa.webp',
    role: 'Front-End Dev',
    utilizationPercent: 68,
    hoursLogged: 27.2,
    hoursAvailable: 40.0
  },
  {
    id: 'team-2',
    name: 'Catalina Tejada',
    initials: 'CT',
    avatarBg: 'bg-[#7c3aed]',
    avatarUrl: '/assets/team/catalina-tejada.webp',
    role: 'Directora Comercial',
    utilizationPercent: 82,
    hoursLogged: 32.8,
    hoursAvailable: 40.0
  },
  {
    id: 'team-3',
    name: 'Paola Monsalve',
    initials: 'PM',
    avatarBg: 'bg-[#501f92]',
    avatarUrl: '/assets/team/paola-monsalve.webp',
    role: 'Product Lead',
    utilizationPercent: 75,
    hoursLogged: 30.0,
    hoursAvailable: 40.0
  }
];

// HISTORIAL INICIAL DE TIEMPOS REGISTRADOS
// Registros de esta sesión (los históricos de cada tarea están en task.timeLogs)
export const initialTimeLogs: TimeLog[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// DATOS DE PRUEBA (limpios, 19 Nov 2026): solo dos proyectos para ejercitar ECO.
//  1. «Tienda Online BattSaver» (Rock and Ride): proyecto único en curso, con tareas
//     hechas, en curso y por hacer; Laura recibe apoyo de Oscar (rol afín) y de Paola
//     (cubre rol); Catalina (Comercial) hace el QA de compra.
//  2. «Fee mensual Contenido y Social · Yamaha»: contrato sep–nov 2026 que vence el
//     30 Nov. Septiembre y octubre cerrados; noviembre en curso. Al renovar se abre
//     diciembre y se generan sus tareas desde la plantilla (septiembre).
//  Sara María Lagos queda con la agenda llena del 19 al 24 Nov (tareas de los dos
//  proyectos): ECO sugiere a otra persona del mismo rol (Creative Designer).
// ─────────────────────────────────────────────────────────────────────────────
type SeedPerson = { id: string; name: string; initials: string; avatarBg: string; role: string };
const SEED_PEOPLE: Record<string, SeedPerson> = {
  paola: { id: 'u-2', name: 'Paola Monsalve', initials: 'PM', avatarBg: 'bg-[#501f92]', role: 'Product Lead' },
  luisa: { id: 'u-3', name: 'Luisa Fernanda Urazán', initials: 'LU', avatarBg: 'bg-[#0284c7]', role: 'Client Relationship Strategist' },
  esmeralda: { id: 'u-5', name: 'Esmeralda Duque Ramírez', initials: 'ED', avatarBg: 'bg-[#8b5cf6]', role: 'Content Creator' },
  nayeliz: { id: 'u-6', name: 'Nayeliz Brunal', initials: 'NB', avatarBg: 'bg-[#14b8a6]', role: 'Digital Content Specialist' },
  laura: { id: 'u-7', name: 'Laura Isabel Gómez', initials: 'LG', avatarBg: 'bg-[#0284c7]', role: 'Digital Designer' },
  catalina: { id: 'u-8', name: 'Catalina Tejada', initials: 'CT', avatarBg: 'bg-[#7c3aed]', role: 'Directora Comercial' },
  oscar: { id: 'u-10', name: 'Oscar Cerpa', initials: 'OC', avatarBg: 'bg-[#f59e0b]', role: 'Front-End Dev' },
  saraRivera: { id: 'u-11', name: 'Sara Rivera', initials: 'SR', avatarBg: 'bg-[#ec4899]', role: 'Community Manager' },
  juanCamilo: { id: 'u-15', name: 'Juan Camilo Torres', initials: 'JT', avatarBg: 'bg-[#6366f1]', role: 'Creative Designer' },
  saraLagos: { id: 'u-17', name: 'Sara María Lagos Obando', initials: 'SL', avatarBg: 'bg-[#f43f5e]', role: 'Creative Designer' }
};

const SEED_TODAY = '2026-11-19';

type SeedProject = { id: string; name: string; clientName: string; projectType: 'fixed_project' | 'fee_monthly' };
const SEED_BATT: SeedProject = { id: 'prj-battsaver-1', name: 'Tienda Online BattSaver', clientName: 'Rock and Ride S.A.S.', projectType: 'fixed_project' };
const SEED_YAM: SeedProject = { id: 'prj-yam-fee', name: 'Fee mensual Contenido y Social · Yamaha', clientName: 'INCOLMOTOS YAMAHA S.A.', projectType: 'fee_monthly' };

function seedLog(taskId: string, p: SeedProject, title: string, who: SeedPerson, hours: number, date: string): TimeLog {
  return {
    id: `log-${taskId}-${who.id}-${date}`,
    taskId,
    taskTitle: title,
    projectName: p.name,
    clientName: p.clientName,
    userId: who.id,
    userName: who.name,
    userInitials: who.initials,
    userAvatarBg: who.avatarBg,
    categoryType: 'client',
    source: 'manual',
    durationSeconds: Math.round(hours * 3600),
    date
  };
}

function seedTask(p: SeedProject, t: {
  id: string;
  title: string;
  role: string;
  who: SeedPerson;
  hours: number;
  start: string;
  due: string;
  status: 'Done' | 'In Progress' | 'To Do';
  frente: string;
  deliverableId?: string;
  cycleKey?: string;
  /** Horas registradas: [persona, horas, fecha] (puede ser alguien distinto al asignado). */
  logs?: [SeedPerson, number, string][];
  priority?: 'Low' | 'Medium' | 'High';
  description?: string;
}): TaskItem {
  const done = t.status === 'Done';
  const logs = (t.logs || []).map(([who, h, d]) => seedLog(t.id, p, t.title, who, h, d));
  const consumed = logs.reduce((acc, l) => acc + l.durationSeconds, 0);
  const daysLeft = Math.round((new Date(t.due).getTime() - new Date(SEED_TODAY).getTime()) / 86400000);
  const dueStatus: TaskItem['dueStatus'] = done ? 'normal' : daysLeft < 0 ? 'overdue' : daysLeft === 0 ? 'urgent' : daysLeft === 1 ? 'tomorrow' : daysLeft <= 3 ? 'soon' : 'normal';
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    department: t.frente,
    board: p.name,
    projectId: p.id,
    projectName: p.name,
    clientName: p.clientName,
    projectType: p.projectType,
    categoryType: 'client',
    frente: t.frente,
    fase: t.frente,
    phase: t.frente,
    deliverableId: t.deliverableId,
    cycleKey: t.cycleKey,
    budgetedRole: t.role,
    executedRoleSnapshot: t.role,
    assignee: { id: t.who.id, name: t.who.name, initials: t.who.initials, avatarBg: t.who.avatarBg, role: t.who.role },
    requestedBy: 'Paola Monsalve',
    reviewer: { name: 'Paola Monsalve', initials: 'PM', avatarBg: 'bg-[#501f92]', role: 'Product Lead' },
    // Líder del proyecto con su nombre real (no el alias «Paola (Lead PM)»): permisos por persona, no por primer nombre
    projectLead: { name: 'Paola Monsalve', initials: 'PM', avatarBg: 'bg-[#501f92]', role: 'Product Lead' },
    scheduledDate: t.start,
    date: t.start,
    startDate: t.start,
    dueDate: t.due,
    baselineStartDate: t.start,
    baselineDueDate: t.due,
    dueStatus,
    dueText: done ? 'Completada' : `Fecha límite: ${t.due}`,
    status: t.status,
    priority: t.priority || 'Medium',
    completed: done,
    completedAt: done ? `${t.due}T17:00:00-05:00` : undefined,
    budgetedHours: t.hours,
    consumedSeconds: consumed,
    timeLogs: logs,
    tags: []
  } as TaskItem;
}

const P = SEED_PEOPLE;

// 1) Proyecto único en curso
const battsaverTasks: TaskItem[] = [
  seedTask(SEED_BATT, { id: 't-bs-1', title: 'Kickoff con el cliente', role: 'Client Relationship Strategist', who: P.luisa, hours: 2, start: '2026-11-03', due: '2026-11-03', status: 'Done', frente: 'Discovery & Arquitectura', deliverableId: 'del-batt-1', logs: [[P.luisa, 2, '2026-11-03']] }),
  seedTask(SEED_BATT, { id: 't-bs-2', title: 'Arquitectura de información y catálogo', role: 'Product Lead', who: P.paola, hours: 8, start: '2026-11-04', due: '2026-11-06', status: 'Done', frente: 'Discovery & Arquitectura', deliverableId: 'del-batt-1', logs: [[P.paola, 5, '2026-11-04'], [P.paola, 4, '2026-11-05']] }),
  // Laura ejecuta con apoyo de Oscar (Front-End, rol afín a Digital Designer): la matriz muestra quién registró qué
  seedTask(SEED_BATT, { id: 't-bs-3', title: 'Wireframes y flujo de checkout', role: 'Digital Designer', who: P.laura, hours: 12, start: '2026-11-09', due: '2026-11-12', status: 'Done', frente: 'UI/UX & Prototipado', deliverableId: 'del-batt-2', logs: [[P.laura, 9, '2026-11-11'], [P.oscar, 2, '2026-11-12']] }),
  // Paola registra horas en una tarea de diseño: «cubre rol»
  seedTask(SEED_BATT, { id: 't-bs-4', title: 'UI kit y vistas en Figma', role: 'Digital Designer', who: P.laura, hours: 16, start: '2026-11-17', due: '2026-11-23', status: 'In Progress', frente: 'UI/UX & Prototipado', deliverableId: 'del-batt-2', priority: 'High', logs: [[P.laura, 5, '2026-11-18'], [P.paola, 1.5, '2026-11-18']] }),
  seedTask(SEED_BATT, { id: 't-bs-5', title: 'Banners y piezas gráficas de la tienda', role: 'Creative Designer', who: P.saraLagos, hours: 10, start: '2026-11-19', due: '2026-11-23', status: 'To Do', frente: 'UI/UX & Prototipado', deliverableId: 'del-batt-2' }),
  seedTask(SEED_BATT, { id: 't-bs-6', title: 'Prototipo navegable y QA interno', role: 'Digital Designer', who: P.laura, hours: 6, start: '2026-11-23', due: '2026-11-24', status: 'To Do', frente: 'UI/UX & Prototipado', deliverableId: 'del-batt-2' }),
  seedTask(SEED_BATT, { id: 't-bs-7', title: 'Setup de Shopify y tema', role: 'Front-End Dev', who: P.oscar, hours: 16, start: '2026-12-02', due: '2026-12-04', status: 'To Do', frente: 'Implementación Shopify', deliverableId: 'del-batt-3' }),
  seedTask(SEED_BATT, { id: 't-bs-8', title: 'Pasarela de pagos Wompi y PSE', role: 'Front-End Dev', who: P.oscar, hours: 12, start: '2026-12-07', due: '2026-12-10', status: 'To Do', frente: 'Implementación Shopify', deliverableId: 'del-batt-3' }),
  seedTask(SEED_BATT, { id: 't-bs-9', title: 'Carga del catálogo y fichas de producto', role: 'Digital Content Specialist', who: P.nayeliz, hours: 8, start: '2026-12-07', due: '2026-12-10', status: 'To Do', frente: 'Implementación Shopify', deliverableId: 'del-batt-3' }),
  // Comercial también puede tener tareas (p. ej. QA): se permite y queda marcado «cubre rol»
  seedTask(SEED_BATT, { id: 't-bs-10', title: 'QA de compra de punta a punta', role: 'Product Lead', who: P.catalina, hours: 4, start: '2026-12-11', due: '2026-12-11', status: 'To Do', frente: 'QA & Salida', deliverableId: 'del-batt-4' }),
  seedTask(SEED_BATT, { id: 't-bs-11', title: 'Salida a producción y capacitación', role: 'Product Lead', who: P.paola, hours: 6, start: '2026-12-17', due: '2026-12-18', status: 'To Do', frente: 'QA & Salida', deliverableId: 'del-batt-4' })
];

// 2) Fee mensual: septiembre (plantilla) y octubre cerrados, noviembre en curso
type FeeRow = [string, string, SeedPerson, number, string, string, 'Done' | 'In Progress' | 'To Do', number];
const feeMonth = (key: string, rows: FeeRow[]) => rows.map(([slug, title, who, hours, start, due, status, executed], i) =>
  seedTask(SEED_YAM, {
    id: `t-yam-${slug}-${key}`,
    title,
    role: ['Digital Content Specialist', 'Content Creator', 'Creative Designer', 'Creative Designer', 'Community Manager', 'Product Lead'][i],
    who,
    hours,
    start,
    due,
    status,
    frente: 'Parrilla del mes',
    cycleKey: key,
    logs: executed > 0 ? [[who, executed, due]] : []
  }));
const yamahaFeeTasks: TaskItem[] = [
  ...feeMonth('2026-09', [
    ['plan', 'Planeación de la parrilla', P.nayeliz, 4, '2026-09-01', '2026-09-03', 'Done', 4],
    ['copys', 'Copys de la parrilla', P.esmeralda, 8, '2026-09-04', '2026-09-10', 'Done', 8.5],
    ['piezas', 'Diseño de piezas de la parrilla', P.saraLagos, 14, '2026-09-11', '2026-09-18', 'Done', 13],
    ['pauta', 'Creativos de pauta', P.juanCamilo, 8, '2026-09-21', '2026-09-24', 'Done', 7],
    ['publicacion', 'Publicación y comunidad', P.saraRivera, 6, '2026-09-21', '2026-09-28', 'Done', 6],
    ['reporte', 'Reporte y comité del mes', P.paola, 2, '2026-09-28', '2026-09-30', 'Done', 2]
  ]),
  ...feeMonth('2026-10', [
    ['plan', 'Planeación de la parrilla', P.nayeliz, 4, '2026-10-01', '2026-10-02', 'Done', 3.5],
    ['copys', 'Copys de la parrilla', P.esmeralda, 8, '2026-10-05', '2026-10-09', 'Done', 8],
    ['piezas', 'Diseño de piezas de la parrilla', P.saraLagos, 14, '2026-10-13', '2026-10-20', 'Done', 15],
    ['pauta', 'Creativos de pauta', P.juanCamilo, 8, '2026-10-21', '2026-10-24', 'Done', 8.5],
    ['publicacion', 'Publicación y comunidad', P.saraRivera, 6, '2026-10-21', '2026-10-28', 'Done', 6],
    ['reporte', 'Reporte y comité del mes', P.paola, 2, '2026-10-28', '2026-10-30', 'Done', 2]
  ]),
  // Noviembre: los creativos de pauta quedaron a cargo de Sara María (agenda llena del 19 al 24)
  ...feeMonth('2026-11', [
    ['plan', 'Planeación de la parrilla', P.nayeliz, 4, '2026-11-03', '2026-11-05', 'Done', 4],
    ['copys', 'Copys de la parrilla', P.esmeralda, 8, '2026-11-06', '2026-11-12', 'Done', 7.5],
    ['piezas', 'Diseño de piezas de la parrilla', P.saraLagos, 14, '2026-11-19', '2026-11-23', 'In Progress', 3],
    ['pauta', 'Creativos de pauta', P.saraLagos, 8, '2026-11-20', '2026-11-24', 'To Do', 0],
    ['publicacion', 'Publicación y comunidad', P.saraRivera, 6, '2026-11-23', '2026-11-27', 'To Do', 0],
    ['reporte', 'Reporte y comité del mes', P.paola, 2, '2026-11-27', '2026-11-30', 'To Do', 0]
  ])
];

export const initialTasks: TaskItem[] = [...battsaverTasks, ...yamahaFeeTasks];


export const orbitUpcomingMilestones: UpcomingMilestone[] = [
  {
    id: 'up-1',
    dateDay: '23',
    dateMonth: 'AGO',
    title: 'Admin de pauta Bambú BPO',
    project: 'Admin de pauta Bambú BPO',
    assignee: 'Camilo Vélez',
    relativeTime: 'mañana',
    isUrgent: true
  },
  {
    id: 'up-2',
    dateDay: '24',
    dateMonth: 'AGO',
    title: 'Entrega final de reporte de analítica Danone Q2',
    project: 'Investigación de Mercado',
    assignee: 'Ana Maria Giraldo',
    relativeTime: 'en 2 días',
    isUrgent: false
  },
  {
    id: 'up-3',
    dateDay: '26',
    dateMonth: 'AGO',
    title: 'Cierre y liquidación de campaña MT-03',
    project: 'Yamaha MT-03 · Lanzamiento',
    assignee: 'Andrea Velasquez',
    relativeTime: 'en 4 días',
    isUrgent: false
  }
];

// LISTA MAESTRA DE USUARIOS & COLABORADORES DE UHURA GROUP
export const initialUsers: UserItem[] = [
  {
    id: 'u-1',
    name: 'Ana María Giraldo',
    loginUsername: 'ana',
    hasPassword: true,
    lastLoginAt: '2026-11-05T11:07:00-05:00',
    email: 'ana@uhuragroup.com',
    initials: 'AG',
    avatarBg: 'bg-[#501f92]',
    avatarUrl: '/assets/team/ana-maria-giraldo.webp',
    role: 'Admin',
    status: 'Active',
    tasksCount: 4,
    joinedDate: '01 Jun 2020',
    capacityHours: 42,
    utilizedPercent: 75,
    jobTitle: 'Dirección General / CEO',
    department: 'Dirección General',
    leaderName: 'Dirección General (N/A)',
    city: 'Medellín',
    officialRole: undefined,
    professionalRole: 'CEO',
    accessLevel: 'executive',
    birthDate: '1990-06-23',
    birthDateFormatted: '23 de Jun',
    anniversaryDate: '2020-06-01',
    anniversaryYears: 6,
    hobbies: 'Leer, tocar piano, cantar, Yoga, Pilates, cocinar, estar con mis hijos, crochet, viajar, comer y tomar vino'
  },
  {
    id: 'u-2',
    name: 'Paola Monsalve',
    loginUsername: 'paola',
    hasPassword: true,
    lastLoginAt: '2026-11-07T08:15:00-05:00',
    email: 'paola@uhuragroup.com',
    initials: 'PM',
    avatarBg: 'bg-[#501f92]',
    avatarUrl: '/assets/team/paola-monsalve.webp',
    role: 'Admin',
    status: 'Active',
    tasksCount: 9,
    joinedDate: '05 Jul 2022',
    capacityHours: 42,
    utilizedPercent: 88,
    jobTitle: 'Product Lead',
    department: 'Dirección de Producto',
    leaderId: 'u-1',
    reportsTo: 'u-1',
    leaderName: 'Ana María Giraldo',
    city: 'Cali',
    officialRole: 'Product Lead',
    professionalRole: 'Product Lead',
    accessLevel: 'leader',
    birthDate: '1992-01-09',
    birthDateFormatted: '9 de Ene',
    anniversaryDate: '2022-07-05',
    anniversaryYears: 4,
    hobbies: 'Gym, tennis, deportes (tops deportivos, barritas o suplementos proteicos) cocinar saludable (gadgets de cocina o de bar), ir a la playa, viajar (amo pulseras, collares o tobilleras o pañoletas muy playeras), aprender, conocer nuevos lugares con amig@s y familia.'
  },
  {
    id: 'u-3',
    name: 'Luisa Fernanda Urazán',
    email: 'luisa@uhuragroup.com',
    initials: 'LU',
    avatarBg: 'bg-[#0284c7]',
    avatarUrl: '/assets/team/luisa-fernanda-urazan.webp',
    role: 'Member',
    status: 'Active',
    tasksCount: 5,
    joinedDate: '04 Abr 2022',
    capacityHours: 42,
    utilizedPercent: 80,
    jobTitle: 'Operaciones & Cuentas',
    department: 'Operaciones & Cuentas',
    leaderId: 'u-8',
    reportsTo: 'u-8',
    leaderName: 'Catalina Tejada',
    city: 'Bogotá',
    officialRole: 'Client Relationship Strategist',
    professionalRole: 'Client Relationship Strategist',
    accessLevel: 'client_relationship',
    birthDate: '1995-02-02',
    birthDateFormatted: '2 de Feb',
    anniversaryDate: '2022-04-04',
    anniversaryYears: 4,
    hobbies: 'viajar, leer, Kdramas, Recargas en Pluxee'
  },
  {
    id: 'u-4',
    name: 'Diego Cadavid',
    email: 'diego@uhuragroup.com',
    initials: 'DC',
    avatarBg: 'bg-[#dc2626]',
    avatarUrl: '/assets/team/diego-cadavid.webp',
    role: 'Admin',
    status: 'Active',
    tasksCount: 8,
    joinedDate: '16 Nov 2023',
    capacityHours: 42,
    utilizedPercent: 92,
    jobTitle: 'Creative & Copy Lead',
    department: 'Creatividad & Contenidos',
    leaderId: 'u-1',
    reportsTo: 'u-1',
    leaderName: 'Ana María Giraldo',
    city: 'Medellín',
    officialRole: 'Creative Strategy Lead',
    professionalRole: 'Creative Strategy Lead',
    accessLevel: 'leader',
    birthDate: '1991-02-26',
    birthDateFormatted: '26 de Feb',
    anniversaryDate: '2023-11-16',
    anniversaryYears: 3,
    hobbies: 'Los videojuegos y las series. El fútbol, Viajar, leer. La ilustración. Comer en la calle. Las camisetas básicas (negras como las de Don Ramón - Papá de Cristian Castro) Las cervezas raras pero no artesanales.'
  },
  {
    id: 'u-5',
    name: 'Esmeralda Duque Ramírez',
    email: 'esmeralda@uhuragroup.com',
    initials: 'ED',
    avatarBg: 'bg-[#8b5cf6]',
    avatarUrl: '/assets/team/esmeralda-duque.webp',
    role: 'Member',
    status: 'Active',
    tasksCount: 7,
    joinedDate: 'Feb 2024',
    capacityHours: 42,
    utilizedPercent: 85,
    jobTitle: 'Content Creator',
    department: 'Creatividad & Contenidos',
    leaderId: 'u-4',
    reportsTo: 'u-4',
    leaderName: 'Diego Cadavid',
    officialRole: 'Content Creator',
    professionalRole: 'Digital Content Specialist',
    accessLevel: 'collaborator',
    birthDate: '1997-08-11',
    birthDateFormatted: '11 de Ago',
    anniversaryDate: '2024-02-10',
    anniversaryYears: 2,
    hobbies: 'Ver memes, compartir tiempo en familia, viajar, comer tortas con café, cuidar mis plantas, conocer lugares nuevos, ver series, juegos de mesa, "maricaditas" de colección o curiosas, apoyar causas nobles, acariciar animales y escuchar podcasts.',
    petNames: 'Zeus, Kaiser, Nezuko, Cóndor y Cocoa'
  },
  {
    id: 'u-6',
    name: 'Nayeliz Brunal',
    email: 'nayeliz@uhuragroup.com',
    initials: 'NB',
    avatarBg: 'bg-[#14b8a6]',
    avatarUrl: '/assets/team/nayeliz-brunal.webp',
    role: 'Member',
    status: 'Active',
    tasksCount: 5,
    joinedDate: '14 Feb 2022',
    capacityHours: 42,
    utilizedPercent: 78,
    jobTitle: 'Digital Content Specialist',
    department: 'Área Growth',
    leaderId: 'u-14',
    reportsTo: 'u-14',
    leaderName: 'Camilo Vélez',
    city: 'Barranquilla',
    officialRole: 'Digital Content Specialist',
    professionalRole: 'Digital Content Specialist',
    accessLevel: 'collaborator',
    birthDate: '1998-07-14',
    birthDateFormatted: '14 de Jul',
    anniversaryDate: '2022-02-14',
    anniversaryYears: 4,
    hobbies: 'Viajar, leer, repetir series, caminar en el Malecón, conocer nuevos cafés, ir a la playa, compartir con amigos y familia'
  },
  {
    id: 'u-7',
    name: 'Laura Isabel Gómez',
    email: 'laura@uhuragroup.com',
    initials: 'LG',
    avatarBg: 'bg-[#0284c7]',
    avatarUrl: '/assets/team/laura-isabel-gomez.webp',
    role: 'Member',
    status: 'Active',
    tasksCount: 6,
    joinedDate: '05 Jun 2023',
    capacityHours: 42,
    utilizedPercent: 90,
    jobTitle: 'Digital Designer',
    department: 'Área Producto',
    leaderId: 'u-2',
    reportsTo: 'u-2',
    leaderName: 'Paola Monsalve',
    city: 'Medellín',
    officialRole: 'Digital Designer',
    professionalRole: 'Digital Designer',
    accessLevel: 'collaborator',
    birthDate: '1996-03-14',
    birthDateFormatted: '14 de Mar',
    anniversaryDate: '2023-06-05',
    anniversaryYears: 3,
    hobbies: 'Leer, compartir con mi familia y amigos, ver series, ir a cine, jugar e ir al parque con mis perros, probar nueva gastronomía, conocer nuevos lugares para tomar una cerveza o un café, armar rompecabezas'
  },
  {
    id: 'u-8',
    name: 'Catalina Tejada',
    loginUsername: 'catalina',
    hasPassword: true,
    lastLoginAt: '2026-11-06T17:40:00-05:00',
    email: 'catalina@uhuragroup.com',
    initials: 'CT',
    avatarBg: 'bg-[#7c3aed]',
    avatarUrl: '/assets/team/catalina-tejada.webp',
    role: 'Admin',
    status: 'Active',
    tasksCount: 7,
    joinedDate: '18 Abr 2024',
    capacityHours: 42,
    utilizedPercent: 82,
    jobTitle: 'Directora Comercial',
    department: 'Comercial & New Business',
    leaderId: 'u-1',
    reportsTo: 'u-1',
    leaderName: 'Ana María Giraldo',
    city: 'Medellín',
    officialRole: 'Directora Comercial',
    professionalRole: 'Directora Comercial',
    accessLevel: 'commercial',
    birthDate: '1993-05-10',
    birthDateFormatted: '10 de May',
    anniversaryDate: '2024-04-18',
    anniversaryYears: 2,
    hobbies: 'Deporte, comer, cine, escuchar musica. Leer, puebliar, viajar, compartir en familia'
  },
  {
    id: 'u-9',
    name: 'Juan Sebastian Caicedo',
    email: 'sebastian.caicedo@uhuragroup.com',
    initials: 'JS',
    avatarBg: 'bg-[#10b981]',
    avatarUrl: '/assets/team/juan-sebastian-caicedo.webp',
    role: 'Member',
    status: 'Active',
    tasksCount: 6,
    joinedDate: '12 Abr 2023',
    capacityHours: 42,
    utilizedPercent: 95,
    jobTitle: 'Traffic & Performance Specialist',
    department: 'Tráfico & Performance',
    leaderId: 'u-14',
    reportsTo: 'u-14',
    leaderName: 'Camilo Vélez',
    city: 'Medellín',
    officialRole: 'Trafficker Media',
    professionalRole: 'Trafficker Media',
    accessLevel: 'collaborator',
    birthDate: '1996-05-17',
    birthDateFormatted: '17 de May',
    anniversaryDate: '2023-04-12',
    anniversaryYears: 3
  },
  {
    id: 'u-10',
    name: 'Oscar Cerpa',
    email: 'oscar@uhuragroup.com',
    initials: 'OC',
    avatarBg: 'bg-[#f59e0b]',
    avatarUrl: '/assets/team/oscar-cerpa.webp',
    role: 'Member',
    status: 'Active',
    tasksCount: 6,
    joinedDate: '01 Sep 2024',
    capacityHours: 42,
    utilizedPercent: 70,
    jobTitle: 'Desarrollador Web Front-End',
    department: 'Tecnología & Desarrollo',
    leaderId: 'u-2',
    reportsTo: 'u-2',
    leaderName: 'Paola Monsalve',
    city: 'Cali',
    officialRole: 'Front-End Dev',
    professionalRole: 'Front-End Dev',
    accessLevel: 'collaborator',
    birthDate: '1994-06-14',
    birthDateFormatted: '14 de Jun',
    anniversaryDate: '2024-09-16',
    anniversaryYears: 2,
    hobbies: 'Videojuegos, restaurantes, Peliculas, senderismo, rodadas, Anime, música'
  },
  {
    id: 'u-11',
    name: 'Sara Rivera',
    email: 'community@uhuragroup.com',
    initials: 'SR',
    avatarBg: 'bg-[#ec4899]',
    avatarUrl: '/assets/team/sara-rivera.webp',
    role: 'Member',
    status: 'Active',
    tasksCount: 5,
    joinedDate: 'Mar 2024',
    capacityHours: 42,
    utilizedPercent: 76,
    jobTitle: 'Community Manager',
    department: 'Creatividad & Contenidos',
    leaderId: 'u-4',
    reportsTo: 'u-4',
    leaderName: 'Diego Cadavid',
    officialRole: 'Community Manager',
    professionalRole: 'Community Manager',
    accessLevel: 'collaborator',
    birthDate: '1997-10-16',
    birthDateFormatted: '16 de Oct',
    anniversaryDate: '2024-03-12',
    anniversaryYears: 2,
    hobbies: 'Me gusta mucho Comer, leer, el yoga, la meditación, todo lo que sea energía mística ver fútbol, viajar, rescatar peludos y compartir mis dones y capacidades con el mundo.',
    vacationStatus: {
      onVacation: true,
      startDate: '2026-09-15',
      returnDate: '2026-09-22',
      note: 'Vacaciones aprobadas. Regresa el 22 de Sep.'
    }
  },
  {
    id: 'u-12',
    name: 'Simón Vélez',
    email: 'simon@uhuragroup.com',
    initials: 'SV',
    avatarBg: 'bg-[#10b981]',
    avatarUrl: '/assets/team/simon-velez.webp',
    role: 'Member',
    status: 'Active',
    tasksCount: 6,
    joinedDate: 'Jun 2024',
    capacityHours: 42,
    utilizedPercent: 86,
    jobTitle: 'Trafficker Media / DigiOps Specialist',
    department: 'Growth & Soluciones Digitales',
    leaderId: 'u-14',
    reportsTo: 'u-14',
    leaderName: 'Camilo Vélez',
    officialRole: 'Trafficker Media',
    officialRoles: ['Trafficker Media', 'DigiOps Specialist'],
    professionalRole: 'Trafficker Media',
    professionalRoles: ['Trafficker Media', 'DigiOps Specialist'],
    accessLevel: 'collaborator',
    birthDate: '1995-06-21',
    birthDateFormatted: '21 de Jun',
    anniversaryDate: '2024-06-03',
    anniversaryYears: 2,
    hobbies: 'Comer, futbol, videos juegos, la música, los animales, el deporte en general, fin de semanas sociales'
  },
  {
    id: 'u-13',
    name: 'Melisa Gil',
    email: 'melisa@uhuragroup.com',
    initials: 'MG',
    avatarBg: 'bg-[#d946ef]',
    avatarUrl: '/assets/team/melisa-gil.webp',
    role: 'Member',
    status: 'Inactive', // Ya no está en Uhura (13 Nov 2026): no se sugiere ni se asigna
    tasksCount: 8,
    joinedDate: 'Ene 2024',
    capacityHours: 42,
    utilizedPercent: 91,
    jobTitle: 'Creative Designer',
    department: 'Diseño & Creatividad',
    leaderId: 'u-4',
    reportsTo: 'u-4',
    leaderName: 'Diego Cadavid',
    officialRole: 'Creative Designer',
    professionalRole: 'Digital Designer',
    accessLevel: 'collaborator',
    birthDate: '1998-04-22',
    birthDateFormatted: '22 de Abr',
    anniversaryDate: '2024-01-20',
    anniversaryYears: 2,
    hobbies: 'Conocer restaurantes y comer rico, ir a cine, ver series ,viajar a la playa, ir a bosques, pueblos...la naturaleza en general, caminar, leer y coleccionar libros ilustrados, las ferias, los tenis, la moda, compartir con mi familia, cuidar a mis perrhijos.'
  },
  {
    id: 'u-14',
    name: 'Camilo Vélez',
    email: 'camivelez@uhuragroup.com',
    initials: 'CV',
    avatarBg: 'bg-[#3b186b]',
    avatarUrl: null,
    role: 'Admin',
    status: 'Active',
    tasksCount: 6,
    joinedDate: '01 / 07 / 2024',
    capacityHours: 42,
    utilizedPercent: 88,
    jobTitle: 'Growth Manager',
    department: 'Operativo (Medios)',
    leaderId: 'u-1',
    reportsTo: 'u-1',
    leaderName: 'Ana María Giraldo',
    city: 'Medellín',
    officialRole: 'Growth Manager',
    professionalRole: 'Growth Manager',
    accessLevel: 'leader',
    birthDate: '26 / 10 / 1993',
    birthDateFormatted: '26 / 10 / 1993',
    anniversaryDate: '2024-07-01',
    anniversaryYears: 2,
    hobbies: 'Videojuegos, la playa, viajar, comer,deporte muy enfocado en triatlon. Regalos que me ayuden o lleven a mejorar mi rendimiento deportivo'
  },
  {
    id: 'u-15',
    name: 'Juan Camilo Torres',
    email: 'camilo.torres@uhuragroup.com',
    initials: 'JT',
    avatarBg: 'bg-[#6366f1]',
    avatarUrl: '/assets/team/juan-camilo-torres.webp',
    role: 'Member',
    status: 'Active',
    tasksCount: 6,
    joinedDate: '01 Feb 2024',
    capacityHours: 42,
    utilizedPercent: 82,
    jobTitle: 'Creative Designer',
    department: 'Creatividad & Contenidos',
    leaderId: 'u-4',
    reportsTo: 'u-4',
    leaderName: 'Diego Cadavid',
    city: 'Medellín',
    officialRole: 'Creative Designer',
    professionalRole: 'Creative Designer',
    accessLevel: 'collaborator',
    birthDate: '1996-10-18',
    birthDateFormatted: '18 de Oct',
    anniversaryDate: '2024-02-01',
    anniversaryYears: 2,
    hobbies: 'El fútbol, leer, salir a charcos, patinar, el DIM, probar comidas, ir a cine y la ilustración'
  },
  {
    id: 'u-16',
    name: 'Diego Alejandro Flores Vargas',
    email: 'diego.flores@uhuragroup.com',
    initials: 'DF',
    avatarBg: 'bg-[#06b6d4]',
    avatarUrl: '/assets/team/diego-alejandro-flores.webp',
    role: 'Member',
    status: 'Active',
    tasksCount: 5,
    joinedDate: '26 Ene 2026',
    capacityHours: 42,
    utilizedPercent: 84,
    jobTitle: 'Media & Design',
    department: 'Diseño & Multimedia',
    leaderId: 'u-4',
    reportsTo: 'u-4',
    leaderName: 'Diego Cadavid',
    city: 'Medellín',
    officialRole: 'Creative Designer',
    professionalRole: 'Creative Designer',
    accessLevel: 'collaborator',
    birthDate: '1995-08-16',
    birthDateFormatted: '16 de Ago',
    anniversaryDate: '2026-01-26',
    anniversaryYears: 1,
    hobbies: 'Pintar, ilustrar, leer, viajar, ver peliculas, hacer deporte, los animales, la pasta y un buen vino, pero el más importante es estar con la familia.'
  },
  {
    id: 'u-17',
    name: 'Sara María Lagos Obando',
    email: 'sara.lagos@uhuragroup.com',
    initials: 'SL',
    avatarBg: 'bg-[#f43f5e]',
    avatarUrl: '/assets/team/sara-maria-lagos.webp',
    role: 'Member',
    status: 'Active',
    tasksCount: 7,
    joinedDate: '12 Feb 2026',
    capacityHours: 42,
    utilizedPercent: 89,
    jobTitle: 'Creative Designer',
    department: 'Creatividad & Contenidos',
    leaderId: 'u-4',
    reportsTo: 'u-4',
    leaderName: 'Diego Cadavid',
    city: 'Medellín',
    officialRole: 'Creative Designer',
    professionalRole: 'Creative Designer',
    accessLevel: 'collaborator',
    birthDate: '1997-09-22',
    birthDateFormatted: '22 de Sep',
    anniversaryDate: '2026-02-12',
    anniversaryYears: 1,
    hobbies: 'Pausar la mente, ir a la montaña o lugares con naturaleza, salir a montar bici, aprender a patinar, ir a eventos culturales, hacer música, ir a conciertos de músicos locales, comer en lugares lindos. Muy importante para mi es ayudar en fundaciones y voluntariados con causas sociales, también viajar, y estar con mi familia y amigos.'
  },
  {
    id: 'u-18',
    name: 'Laura Viviana Salazar Perez',
    email: 'laura.salazar@uhuragroup.com',
    initials: 'LS',
    avatarBg: 'bg-[#64748b]',
    avatarUrl: '/assets/team/laura-viviana-salazar.webp',
    role: 'Admin',
    status: 'Active',
    tasksCount: 4,
    joinedDate: '19 Mar 2022',
    capacityHours: 42,
    utilizedPercent: 70,
    jobTitle: 'Administrativa & RRHH',
    department: 'Administración & Talento',
    leaderId: 'u-1',
    reportsTo: 'u-1',
    leaderName: 'Ana María Giraldo',
    city: 'Pereira',
    officialRole: undefined,
    professionalRole: 'Administrativa',
    accessLevel: 'administrative',
    birthDate: '1994-01-30',
    birthDateFormatted: '30 de Ene',
    anniversaryDate: '2022-03-19',
    anniversaryYears: 4,
    hobbies: 'La playa el sol el mar es mi lugar favorito en el MUNDOOOO amo leer, hacer ejercicio, ahora corro estoy iniciando en el mundo running, me gusta el pilates, Amo los animalitos CON TODO EL CORAZON, me gusta pasar tiempo con mi familia y amigos, me gusta el arte los museos y el teatro y toda la musica, aprender cosas diferentes , aprender de los que me rodean y tambien transmitir mis conocimientos , me gusta conversar de todos los temas, y me encanta la moda y la fotografia y comer rico.',
    petNames: 'Dulce'
  },
  {
    id: 'u-19',
    name: 'Álvaro Antonio Gómez Machuca',
    email: 'alvaro.gomez@uhuragroup.com',
    initials: 'AG',
    avatarBg: 'bg-[#1e293b]',
    avatarUrl: null,
    role: 'Admin',
    status: 'Active',
    tasksCount: 2,
    joinedDate: '26 Ene 2024',
    capacityHours: 42,
    utilizedPercent: 60,
    jobTitle: 'Representante Legal / Dirección',
    department: 'Dirección General & Legal',
    leaderName: 'Dirección General (N/A)',
    city: 'Bogotá',
    officialRole: undefined,
    professionalRole: 'CEO',
    accessLevel: 'executive',
    birthDate: '1985-11-20',
    birthDateFormatted: '20 de Nov',
    anniversaryDate: '2024-01-26',
    anniversaryYears: 2,
    hobbies: 'Estrategia corporativa, lectura de negocios, ciclismo de ruta y viajes en familia.'
  }
];

/**
 * Eventos iniciales de ausencia estructurada en ECO.
 * Google Calendar es el Source of Truth externo para vacaciones y licencias.
 * ECO y el motor de Capacidad de ECO consumen estos datos sin acoplarse a Google Calendar API.
 */
export const initialAbsenceEvents: TeamAbsenceEvent[] = [
  {
    id: 'abs-df-vac-1',
    userId: 'u-16',
    userName: 'Diego Alejandro Flores Vargas',
    type: 'vacation',
    title: 'Vacaciones — Diego Flores',
    startDate: '2026-11-19',
    endDate: '2026-11-27',
    allDay: true,
    impactHoursPerDay: 8.0,
    status: 'active',
    source: 'google_calendar',
    notes: 'Ejemplo: ECO no lo sugiere para tareas de esos días.'
  },
  {
    id: 'abs-lu-vac-1',
    userId: 'u-3',
    userName: 'Luisa Fernanda Urazán',
    type: 'vacation',
    title: 'Vacaciones programadas — Luisa Urazán',
    startDate: '2026-10-21',
    endDate: '2026-10-28',
    allDay: true,
    impactHoursPerDay: 8.0,
    status: 'active',
    source: 'google_calendar',
    externalCalendarEventId: 'gcal-evt-lu-vac-2026-10',
    externalCalendarId: 'ausencias@uhuragroup.com',
    lastSyncedAt: '2026-10-18T12:00:00Z',
    notes: 'Vacaciones de ley. Coordinar traspaso de cuentas y proyectos en curso.'
  },
  {
    id: 'abs-sr-vac-1',
    userId: 'u-11',
    userName: 'Sara Rivera',
    type: 'vacation',
    title: 'Vacaciones de Ley — Sara Rivera',
    startDate: '2026-09-15',
    endDate: '2026-09-22',
    allDay: true,
    impactHoursPerDay: 8.0,
    status: 'active',
    source: 'google_calendar',
    externalCalendarEventId: 'gcal-evt-sr-vac-2026-09',
    externalCalendarId: 'ausencias@uhuragroup.com',
    lastSyncedAt: '2026-09-15T08:00:00Z',
    notes: 'Aprobadas por Administración. Período anual de descanso.'
  },
  {
    id: 'abs-lg-perm-1',
    userId: 'u-7',
    userName: 'Laura Isabel Gómez',
    type: 'personal_leave',
    title: 'Permiso Personal / Estudio',
    startDate: '2026-09-28',
    endDate: '2026-09-28',
    allDay: false,
    impactHoursPerDay: 4.0,
    status: 'active',
    source: 'google_calendar',
    externalCalendarEventId: 'gcal-evt-lg-perm-2026-09',
    externalCalendarId: 'ausencias@uhuragroup.com',
    lastSyncedAt: '2026-09-20T09:30:00Z',
    notes: 'Media jornada por trámite personal.'
  }
];

export const initialActivities: ActivityItem[] = [];

export const UHURA_INTERNAL_CLIENT: ClientProfile = {
  id: 'cli-uhura-internal',
  name: 'UHURA Group',
  isInternal: true,
  status: 'active',
  type: 'Interno / No facturable',
  healthStatus: 'Saludable',
  portalActive: false,
  projectsCount: 4,
  activeProjectsCount: 4,
  closedProjectsCount: 0,
  averageMarginPercent: null,
  billedCOP: '$0',
  billedInvoicesCount: 0,
  receivableCOP: '$0',
  receivableStatus: 'al día',
  accountManagerId: 'u-19',
  accountManagerName: 'Laura Salazar',
  taxEntities: [
    {
      id: 'tax-uhu-1',
      nit: '901.882.341-0',
      businessName: 'Uhura Group S.A.S.',
      city: 'Medellín',
      isPrimary: true,
      alegraContactId: 'alg-uhu-001',
      notes: 'Entidad corporativa institucional para proyectos internos no facturables'
    }
  ],
  contacts: [
    {
      id: 'con-uhu-1',
      name: 'Ana María Giraldo',
      roleTitle: 'CEO & Founder',
      email: 'ana@uhuragroup.com',
      phone: '+57 (310) 887-2341',
      contactType: 'directivo',
      isPrimary: true
    },
    {
      id: 'con-uhu-2',
      name: 'Laura Salazar',
      roleTitle: 'Líder Operaciones & Admin',
      email: 'admin@uhuragroup.com',
      phone: '+57 (300) 412-8890',
      contactType: 'operativo',
      isPrimary: false
    }
  ],
  commercialInfo: {
    contactName: 'Ana María Giraldo',
    contactRole: 'CEO & Founder',
    contactEmail: 'ana@uhuragroup.com',
    contactPhone: '+57 (310) 887-2341',
    clientSince: '1 de Enero de 2024',
    brands: ['UHURA Group', 'ECO', 'Uhura Labs']
  },
  behavior: {
    rentabilidad: 100,
    cartera: 100,
    cumplimiento: 100,
    relacion: 100
  },
  projectsHistory: [
    {
      id: 'prj-uhu-1',
      name: 'Administración & Comités de Dirección',
      tag: 'FIN',
      brand: 'UHURA Group',
      status: 'Activo',
      quotedValueCOP: '$0',
      realMarginPercent: null,
      trafficLight: 'verde',
      progressPercent: 90
    },
    {
      id: 'prj-uhu-2',
      name: 'Innovación, Producto & ECO Labs',
      tag: 'DEV',
      brand: 'ECO',
      status: 'Activo',
      quotedValueCOP: '$0',
      realMarginPercent: null,
      trafficLight: 'verde',
      progressPercent: 75
    },
    {
      id: 'prj-uhu-3',
      name: 'Comercial & Prospección New Business',
      tag: 'FEE',
      brand: 'UHURA Group',
      status: 'Activo',
      quotedValueCOP: '$0',
      realMarginPercent: null,
      trafficLight: 'verde',
      progressPercent: 60
    },
    {
      id: 'prj-uhu-4',
      name: 'Capacitaciones, Talento & Cultura',
      tag: 'FEE',
      brand: 'UHURA Group',
      status: 'Activo',
      quotedValueCOP: '$0',
      realMarginPercent: null,
      trafficLight: 'verde',
      progressPercent: 85
    }
  ],
  notes: 'Cliente institucional protegido de Uhura Group. Contiene todos los proyectos internos no facturables: comités, weeklys, labs, capacitaciones y prospección.'
};

export const orbitClientsData: ClientProfile[] = [
  UHURA_INTERNAL_CLIENT,
  {
    id: 'cli-yamaha',
    name: 'INCOLMOTOS YAMAHA S.A.',
    nit: '890.900.943-1',
    isInternal: false,
    status: 'active',
    type: 'Fee mensual',
    healthStatus: 'Saludable',
    portalActive: true,
    projectsCount: 1,
    activeProjectsCount: 1,
    closedProjectsCount: 0,
    averageMarginPercent: 41.5,
    billedCOP: '$380.000.000',
    billedInvoicesCount: 9,
    receivableCOP: '$18.000.000',
    receivableStatus: 'al día',
    accountManagerId: 'u-8',
    accountManagerName: 'Catalina Tejada',
    taxEntities: [
      {
        id: 'tax-yam-1',
        nit: '890.900.943-1',
        businessName: 'Incolmotos Yamaha S.A.',
        city: 'Girardota / Medellín',
        isPrimary: true,
        alegraContactId: 'alg-yam-001',
        notes: 'NIT corporativo principal para ensamble y comercialización de motocicletas y repuestos'
      }
    ],
    contacts: [
      {
        id: 'con-yam-1',
        name: 'Mauricio Saldarriaga',
        roleTitle: 'Director Nacional de Mercadeo',
        email: 'msaldarriaga@incolmotos-yamaha.com.co',
        phone: '+57 (311) 789-4450',
        contactType: 'directivo',
        isPrimary: true
      },
      {
        id: 'con-yam-2',
        name: 'Paula Restrepo',
        roleTitle: 'Coordinadora de Campañas y Eventos',
        email: 'prestrepo@incolmotos-yamaha.com.co',
        phone: '+57 (314) 620-1122',
        contactType: 'operativo',
        isPrimary: false
      }
    ],
    commercialInfo: {
      contactName: 'Mauricio Saldarriaga',
      contactRole: 'Director Nacional de Mercadeo',
      contactEmail: 'msaldarriaga@incolmotos-yamaha.com.co',
      contactPhone: '+57 (311) 789-4450',
      clientSince: '15 de Mayo de 2024',
      brands: ['Yamaha', 'Yamalube', 'Motos Clásicas']
    },
    behavior: {
      rentabilidad: 85,
      cartera: 98,
      cumplimiento: 90,
      relacion: 95
    },
    projectsHistory: [
      {
        id: 'prj-yam-fee',
        name: 'Fee mensual Contenido y Social · Yamaha',
        tag: 'FEE',
        brand: 'Yamaha',
        status: 'Activo',
        quotedValueCOP: '$12.600.000 / mes',
        realMarginPercent: 40,
        trafficLight: 'verde',
        progressPercent: 90
      }
    ]
  },
  {
    id: 'cli-rockandride',
    name: 'Rock and Ride S.A.S.',
    nit: '901.442.890-1',
    isInternal: false,
    status: 'active',
    type: 'Proyecto único',
    healthStatus: 'Saludable',
    portalActive: true,
    projectsCount: 1,
    activeProjectsCount: 1,
    closedProjectsCount: 0,
    averageMarginPercent: 44.0,
    billedCOP: '$48.000.000',
    billedInvoicesCount: 2,
    receivableCOP: '$0',
    receivableStatus: 'al día',
    accountManagerId: 'u-3',
    accountManagerName: 'Luisa Fernanda Urazán',
    taxEntities: [
      {
        id: 'tax-rnr-1',
        nit: '901.442.890-1',
        businessName: 'Rock and Ride S.A.S.',
        city: 'Medellín',
        isPrimary: true,
        alegraContactId: 'alg-rnr-001'
      }
    ],
    contacts: [
      {
        id: 'con-rnr-1',
        name: 'Santiago Giraldo',
        roleTitle: 'Gerente General',
        email: 'santiago@rockandride.co',
        phone: '+57 (311) 555-9012',
        contactType: 'directivo',
        isPrimary: true
      }
    ],
    commercialInfo: {
      contactName: 'Santiago Giraldo',
      contactRole: 'Gerente General',
      contactEmail: 'santiago@rockandride.co',
      contactPhone: '+57 (311) 555-9012',
      clientSince: '10 de Julio de 2026',
      brands: ['BattSaver', 'Rock & Ride']
    },
    behavior: {
      rentabilidad: 90,
      cartera: 100,
      cumplimiento: 92,
      relacion: 95
    },
    projectsHistory: [
      {
        id: 'prj-battsaver-1',
        name: 'Tienda Online BattSaver',
        tag: 'DEV',
        brand: 'BattSaver',
        status: 'Activo',
        quotedValueCOP: '$32.000.000',
        realMarginPercent: 42,
        trafficLight: 'verde',
        progressPercent: 35
      }
    ]
  }
];
