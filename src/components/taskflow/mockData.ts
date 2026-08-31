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
  ClientProfile
} from './types';

// PLANTILLAS DE ACTIVIDADES RECURRENTES PARA PROYECTOS TIPO FEE
export const FEE_ACTIVITY_TEMPLATES: Record<string, { name: string; defaultHours: number; role: string }[]> = {
  'Mantenimiento Web': [
    { name: 'Actualización de Core, Plugins & Seguridad', defaultHours: 2.0, role: 'Tech Lead' },
    { name: 'Carga & Reemplazo de Banners / Assets', defaultHours: 1.5, role: 'Designer / Dev' },
    { name: 'Revisión de Data, Eventos & Analytics', defaultHours: 1.5, role: 'Growth / Tech' },
    { name: 'Actualización de Precios, Catálogo & Stock', defaultHours: 2.0, role: 'Dev / Operations' },
    { name: 'Soporte Preventivo & Healthcheck Mensual', defaultHours: 1.0, role: 'Tech Lead' }
  ],
  'Parrilla & Redes': [
    { name: 'Conceptualización & Estrategia Mensual', defaultHours: 4.0, role: 'Lead PM / Strategist' },
    { name: 'Redacción de Copys & Guiones', defaultHours: 3.5, role: 'Copywriter' },
    { name: 'Diseño de Piezas Gráficas & Carruseles', defaultHours: 6.0, role: 'Lead Designer' },
    { name: 'Edición de Videos / Reels & Motion', defaultHours: 5.0, role: 'Motion / Designer' },
    { name: 'Programación de Publicaciones & Community', defaultHours: 2.5, role: 'Community Manager' }
  ],
  'Growth & Pauta': [
    { name: 'Configuración & Activación de Pauta (Trafficker)', defaultHours: 3.0, role: 'Growth Specialist' },
    { name: 'Optimización de Presupuestos & CBO/ABO', defaultHours: 2.0, role: 'Growth Specialist' },
    { name: 'Auditoría de Conversiones & Píxeles Meta/Google', defaultHours: 2.5, role: 'Growth & Tech' },
    { name: 'Reporte Ejecutivo de Rendimiento / ROAS', defaultHours: 2.0, role: 'Growth Lead' }
  ],
  'Soporte Continuo': [
    { name: 'Atención a Tickets de Soporte & Ajustes Rápidos', defaultHours: 2.0, role: 'Colaborador UI' },
    { name: 'Optimización de Velocidad / Core Web Vitals', defaultHours: 3.0, role: 'Frontend Dev' },
    { name: 'QA & Pruebas Cruzadas de Compatibilidad', defaultHours: 2.0, role: 'QA Lead' }
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
    id: 'cli-prisma',
    name: 'Prisma Kiddos',
    isInternal: false,
    projects: [
      {
        id: 'prj-pris-1',
        name: 'Fee Mantenimiento Web Prisma',
        budgetedHours: 20.0,
        projectType: 'fee_monthly',
        feeCategory: 'Mantenimiento Web'
      },
      {
        id: 'prj-pris-2',
        name: 'E-commerce & Landing STEM (Proyecto Web)',
        budgetedHours: 85.0,
        projectType: 'fixed_milestones',
        startDate: '10 Ago 2026',
        endDate: '30 Sep 2026',
        phases: [
          'Discovery & Arquitectura',
          'UI/UX & Prototipado',
          'Implementación / Dev',
          'QA & Testing',
          'Despliegue & Cierre'
        ]
      }
    ]
  },
  {
    id: 'cli-danone',
    name: 'Danone S.A.',
    isInternal: false,
    projects: [
      {
        id: 'prj-dan-1',
        name: 'Fee Parrilla Digital Q3 · Banners & Social',
        budgetedHours: 40.0,
        projectType: 'fee_monthly',
        feeCategory: 'Parrilla & Redes'
      },
      {
        id: 'prj-dan-2',
        name: 'Campaña Navidad 2026 (Flujo Creativos → Pauta)',
        budgetedHours: 65.0,
        projectType: 'fixed_milestones',
        startDate: '15 Ago 2026',
        endDate: '15 Nov 2026',
        phases: [
          'Discovery & Arquitectura',
          'UI/UX & Prototipado',
          'Implementación / Dev',
          'QA & Testing',
          'Despliegue & Cierre'
        ]
      }
    ]
  },
  {
    id: 'cli-bambu',
    name: 'BAMBÚ BPO',
    isInternal: false,
    projects: [
      {
        id: 'prj-bam-1',
        name: 'Fee Admin de Pauta & Ads Performance',
        budgetedHours: 35.0,
        projectType: 'fee_monthly',
        feeCategory: 'Growth & Pauta'
      }
    ]
  },
  {
    id: 'cli-yamaha',
    name: 'Incolmotos Yamaha S.A.',
    isInternal: false,
    projects: [
      {
        id: 'prj-yam-navidad',
        name: 'Campaña Navidad Yamaha',
        budgetedHours: 59.0,
        projectType: 'fee_monthly',
        feeCategory: 'Parrilla & Redes'
      },
      {
        id: 'prj-yam-1',
        name: 'Yamaha R15 · Campaña Social & Web',
        budgetedHours: 80.0,
        projectType: 'fixed_milestones',
        startDate: '01 Ago 2026',
        endDate: '15 Oct 2026',
        phases: [
          'Discovery & Arquitectura',
          'UI/UX & Prototipado',
          'Implementación / Dev',
          'QA & Testing',
          'Despliegue & Cierre'
        ]
      },
      {
        id: 'prj-yam-2',
        name: 'Yamaha MT-03 · Lanzamiento',
        budgetedHours: 50.0,
        projectType: 'fixed_milestones',
        startDate: '15 Ago 2026',
        endDate: '20 Nov 2026',
        phases: [
          'Discovery & Arquitectura',
          'UI/UX & Prototipado',
          'Implementación / Dev',
          'QA & Testing',
          'Despliegue & Cierre'
        ]
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
        budgetedHours: 110.0,
        projectType: 'fixed_milestones',
        startDate: '15 Ago 2026',
        endDate: '15 Nov 2026',
        phases: [
          'Discovery',
          'UX/UI',
          'Implementación',
          'QA',
          'Cierre'
        ]
      }
    ]
  },
  {
    id: 'cli-uhura-internal',
    name: '🏢 Uhura Interno / No Facturable',
    isInternal: true,
    projects: [
      {
        id: 'prj-uhu-1',
        name: 'Innovación & Orbit OS Labs',
        budgetedHours: 25.0,
        projectType: 'fixed_milestones',
        startDate: '01 Jul 2026',
        endDate: '31 Dic 2026',
        phases: [
          'Discovery & Arquitectura',
          'UI/UX & Prototipado',
          'Implementación / Dev',
          'QA & Testing',
          'Despliegue & Cierre'
        ]
      },
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
export const orbitOperationalAlerts: OperationalAlert[] = [
  {
    id: 'alt-1',
    type: 'RETRASO',
    title: 'Admin de pauta Bambú BPO',
    client: 'BAMBÚ BPO',
    description: 'Lleva 7 semanas (4 planeadas) y sigue abierto.',
    weeksElapsed: 7,
    weeksPlanned: 4,
    impactLevel: 'alto',
    severity: 'high',
    read: false,
    timeAgo: 'Hace 2 horas',
    date: '22 Ago 2026'
  },
  {
    id: 'alt-2',
    type: 'RENTABILIDAD',
    title: 'Danone · Banners Q3 desvío horas',
    client: 'Danone S.A.',
    description: 'Consumo al 82% del presupuesto con entregas pendientes.',
    impactLevel: 'medio',
    severity: 'critical',
    read: false,
    timeAgo: 'Hace 4 horas',
    date: '22 Ago 2026'
  }
];

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
    leadAssignee: 'Andrés Ríos',
    progressPercent: 88
  }
];

// CAPACIDAD DEL EQUIPO
export const orbitTeamCapacity: TeamMemberCapacity[] = [
  {
    id: 'team-1',
    name: 'Andrés Ríos',
    initials: 'AR',
    avatarBg: 'bg-[#ef4444]',
    role: 'Growth Lead',
    utilizationPercent: 68,
    hoursLogged: 27.2,
    hoursAvailable: 40.0
  },
  {
    id: 'team-2',
    name: 'Catalina Tejada',
    initials: 'CT',
    avatarBg: 'bg-[#7c3aed]',
    role: 'Lead Designer',
    utilizationPercent: 82,
    hoursLogged: 32.8,
    hoursAvailable: 40.0
  },
  {
    id: 'team-3',
    name: 'Paola (Lead PM)',
    initials: 'PL',
    avatarBg: 'bg-[#501f92]',
    role: 'Lead Project Manager',
    utilizationPercent: 75,
    hoursLogged: 30.0,
    hoursAvailable: 40.0
  }
];

// HISTORIAL INICIAL DE TIEMPOS REGISTRADOS
export const initialTimeLogs: TimeLog[] = [
  {
    id: 'log-1',
    taskId: 't-1',
    taskTitle: 'Diseño de Banners Promocionales Campaña Q3',
    clientName: 'Danone S.A.',
    projectName: 'Campaña Q3 · Banners & Social',
    userName: 'Catalina Tejada',
    userInitials: 'CT',
    userAvatarBg: 'bg-[#7c3aed]',
    categoryType: 'client',
    durationSeconds: 7200, // 2.0h
    startTime: '09:00',
    endTime: '11:00',
    isLiveTimer: true,
    date: 'Hoy, 22 Ago 2026',
    note: 'Creación de variantes 1080x1080 y 1080x1920 en Figma. Exportados a Drive.',
    deliverableUrl: 'https://figma.com/design/danone-q3-banners'
  },
  {
    id: 'log-2',
    taskId: 't-4',
    taskTitle: 'Desarrollo de Módulo de Tiempos Orbit OS',
    clientName: '🏢 Uhura Interno / No Facturable',
    projectName: 'Innovación & Orbit OS Labs',
    userName: 'Andrés Ríos',
    userInitials: 'AR',
    userAvatarBg: 'bg-[#ef4444]',
    categoryType: 'internal',
    durationSeconds: 5400, // 1.5h
    startTime: '11:15',
    endTime: '12:45',
    isLiveTimer: true,
    date: 'Hoy, 22 Ago 2026',
    note: 'Refactor de componentes y reducción de fricción en la UI.'
  }
];

// TAREAS INICIALES CON JERARQUÍA DE 3 NIVELES, FASES & FEES
export const initialTasks: TaskItem[] = [
  // --- FRENTE 1: REDES SOCIALES (Campaña Navidad Yamaha · 32 h) ---
  {
    id: 't-yam-rs-1',
    title: 'Estrategia de contenido',
    description: 'Estructuración de pilares de comunicación navideña, mensajes clave y formatos para IG/FB.',
    department: 'Creatividad & Social',
    board: 'Campaña Navidad Yamaha',
    clientName: 'INCOLMOTOS YAMAHA S.A.',
    projectName: 'Campaña Navidad Yamaha',
    frente: 'Redes Sociales',
    phase: 'Discovery & Estrategia',
    fase: 'Discovery & Estrategia',
    budgetedRole: 'Content Strategist',
    executedRoleSnapshot: 'Content Strategist',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Camilo Vélez',
      initials: 'CV',
      avatarBg: 'bg-[#10b981]',
      role: 'Content Strategist'
    },
    requestedBy: 'Paola (Lead PM)',
    reviewer: {
      name: 'Paola (Lead PM)',
      initials: 'PL',
      avatarBg: 'bg-[#501f92]',
      role: 'Lead PM'
    },
    date: '16 Ago 2026',
    startDate: '15 ago. 2026',
    dueDate: '2026-08-18',
    baselineStartDate: '2026-08-15',
    baselineDueDate: '2026-08-18',
    dueStatus: 'normal',
    dueText: 'Completado a tiempo',
    status: 'Done',
    priority: 'High',
    completed: true,
    budgetedHours: 4.0,
    consumedSeconds: 14400, // 4.0h
    tags: ['Navidad', 'Redes Sociales', 'Estrategia'],
    acceptanceCriteria: [
      { id: 'crit-rs1-1', text: 'Pilares temáticos aprobados por marca', completed: true },
      { id: 'crit-rs1-2', text: 'Calendario de entregables sincronizado', completed: true }
    ]
  },
  {
    id: 't-yam-rs-2',
    title: 'Diseño de piezas',
    description: 'Diseño de key visuals, carruseles y adaptaciones 1:1, 9:16 y banners display para pauta.',
    department: 'Creatividad & Diseño',
    board: 'Campaña Navidad Yamaha',
    clientName: 'INCOLMOTOS YAMAHA S.A.',
    projectName: 'Campaña Navidad Yamaha',
    frente: 'Redes Sociales',
    phase: 'UI/UX & Prototipado',
    fase: 'UI/UX & Prototipado',
    budgetedRole: 'Diseñador Gráfico',
    executedRoleSnapshot: 'Diseñador Gráfico',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Diego Cadavid',
      initials: 'DC',
      avatarBg: 'bg-[#f59e0b]',
      role: 'Diseñador Gráfico'
    },
    requestedBy: 'Paola (Lead PM)',
    reviewer: {
      name: 'Catalina Tejada',
      initials: 'CT',
      avatarBg: 'bg-[#7c3aed]',
      role: 'Web Designer'
    },
    dependencyTaskId: 't-yam-rs-1',
    dependencyTaskTitle: 'Estrategia de contenido',
    date: '20 Ago 2026',
    startDate: '18 ago. 2026',
    dueDate: '2026-08-28',
    baselineStartDate: '2026-08-18',
    baselineDueDate: '2026-08-28',
    dueStatus: 'soon',
    dueText: 'Vence en 2 días',
    status: 'In Progress',
    priority: 'High',
    completed: false,
    budgetedHours: 24.0,
    consumedSeconds: 72000, // 20.0h ejecutadas
    tags: ['Navidad', 'Figma', 'Key Visuals', 'Piezas'],
    acceptanceCriteria: [
      { id: 'crit-rs2-1', text: '12 artes para feed y stories en alta resolución', completed: true },
      { id: 'crit-rs2-2', text: 'Adaptaciones para anuncios de pauta en Meta', completed: false }
    ]
  },
  {
    id: 't-yam-rs-3',
    title: 'Redacción y publicación',
    description: 'Redacción de copys finales con emojis y hashtags, y programación en plataforma.',
    department: 'Social Media',
    board: 'Campaña Navidad Yamaha',
    clientName: 'INCOLMOTOS YAMAHA S.A.',
    projectName: 'Campaña Navidad Yamaha',
    frente: 'Redes Sociales',
    phase: 'Implementación Frontend & Backend',
    fase: 'Implementación Frontend & Backend',
    budgetedRole: 'Community Manager',
    executedRoleSnapshot: 'Community Manager',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Mateo Ruiz',
      initials: 'MR',
      avatarBg: 'bg-[#8b5cf6]',
      role: 'Community Manager'
    },
    requestedBy: 'Paola (Lead PM)',
    dependencyTaskId: 't-yam-rs-2',
    dependencyTaskTitle: 'Diseño de piezas',
    date: '24 Ago 2026',
    startDate: '28 ago. 2026',
    dueDate: '2026-08-30',
    baselineStartDate: '2026-08-28',
    baselineDueDate: '2026-08-30',
    dueStatus: 'soon',
    dueText: 'Programado para entrega',
    status: 'To Do',
    priority: 'Medium',
    completed: false,
    budgetedHours: 4.0,
    consumedSeconds: 0,
    tags: ['Copys', 'Social', 'Publicación']
  },

  // --- FRENTE 2: LANDING PAGE (Campaña Navidad Yamaha · 19 h) ---
  {
    id: 't-yam-lp-1',
    title: 'Conceptualización',
    description: 'Definición de flujo de conversión, arquitectura de secciones y oferta de temporada.',
    department: 'Producto & Dirección',
    board: 'Campaña Navidad Yamaha',
    clientName: 'INCOLMOTOS YAMAHA S.A.',
    projectName: 'Campaña Navidad Yamaha',
    frente: 'Landing Page',
    phase: 'Discovery & Estrategia',
    fase: 'Discovery & Estrategia',
    budgetedRole: 'Product Lead',
    executedRoleSnapshot: 'Product Lead',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Andrés Ríos',
      initials: 'AR',
      avatarBg: 'bg-[#ef4444]',
      role: 'Product Lead'
    },
    requestedBy: 'Paola (Lead PM)',
    date: '17 Ago 2026',
    startDate: '16 ago. 2026',
    dueDate: '2026-08-18',
    baselineStartDate: '2026-08-16',
    baselineDueDate: '2026-08-18',
    dueStatus: 'normal',
    dueText: 'Completado',
    status: 'Done',
    priority: 'High',
    completed: true,
    budgetedHours: 2.0,
    consumedSeconds: 10800, // 3.0h (desvío +1h)
    tags: ['Landing Page', 'Discovery', 'UX Flow'],
    acceptanceCriteria: [
      { id: 'crit-lp1-1', text: 'Wireframe en baja fidelidad aprobado', completed: true }
    ]
  },
  {
    id: 't-yam-lp-2',
    title: 'Copy',
    description: 'Redacción de textos persuasivos, claims navideños y microcopys para formulario de cotización.',
    department: 'Creatividad & Copy',
    board: 'Campaña Navidad Yamaha',
    clientName: 'INCOLMOTOS YAMAHA S.A.',
    projectName: 'Campaña Navidad Yamaha',
    frente: 'Landing Page',
    phase: 'Discovery & Estrategia',
    fase: 'Discovery & Estrategia',
    budgetedRole: 'Copywriter',
    executedRoleSnapshot: 'Copywriter',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Mariana Toro',
      initials: 'MT',
      avatarBg: 'bg-[#ec4899]',
      role: 'Copywriter'
    },
    requestedBy: 'Andrés Ríos',
    dependencyTaskId: 't-yam-lp-1',
    dependencyTaskTitle: 'Conceptualización',
    date: '19 Ago 2026',
    startDate: '18 ago. 2026',
    dueDate: '2026-08-20',
    baselineStartDate: '2026-08-18',
    baselineDueDate: '2026-08-20',
    dueStatus: 'normal',
    dueText: 'Completado a tiempo',
    status: 'Done',
    priority: 'Medium',
    completed: true,
    budgetedHours: 1.0,
    consumedSeconds: 3600, // 1.0h
    tags: ['Landing Page', 'Copywriting', 'Claims']
  },
  {
    id: 't-yam-lp-3',
    title: 'Prototipo',
    description: 'Diseño UI interactivo en Figma de la landing page responsive para desktop y mobile.',
    department: 'Creatividad & Diseño',
    board: 'Campaña Navidad Yamaha',
    clientName: 'INCOLMOTOS YAMAHA S.A.',
    projectName: 'Campaña Navidad Yamaha',
    frente: 'Landing Page',
    phase: 'UI/UX & Prototipado',
    fase: 'UI/UX & Prototipado',
    budgetedRole: 'Web Designer',
    executedRoleSnapshot: 'Web Designer',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Catalina Tejada',
      initials: 'CT',
      avatarBg: 'bg-[#7c3aed]',
      role: 'Web Designer'
    },
    requestedBy: 'Andrés Ríos',
    reviewer: {
      name: 'Paola (Lead PM)',
      initials: 'PL',
      avatarBg: 'bg-[#501f92]',
      role: 'Lead PM'
    },
    dependencyTaskId: 't-yam-lp-2',
    dependencyTaskTitle: 'Copy',
    date: '21 Ago 2026',
    startDate: '20 ago. 2026',
    dueDate: '2026-08-23',
    baselineStartDate: '2026-08-20',
    baselineDueDate: '2026-08-23',
    dueStatus: 'normal',
    dueText: 'Aprobado por cliente',
    status: 'Done',
    priority: 'High',
    completed: true,
    budgetedHours: 8.0,
    consumedSeconds: 25200, // 7.0h
    tags: ['Landing Page', 'Figma', 'UI/UX', 'Prototipo'],
    acceptanceCriteria: [
      { id: 'crit-lp3-1', text: 'Prototipo en Figma con interacciones completas', completed: true },
      { id: 'crit-lp3-2', text: 'Validación de contraste y legibilidad', completed: true }
    ]
  },
  {
    id: 't-yam-lp-4',
    title: 'Implementación',
    description: 'Maquetación frontend responsive en React/Tailwind, conexión con API de CRM y eventos de analítica.',
    department: 'Desarrollo Frontend',
    board: 'Campaña Navidad Yamaha',
    clientName: 'INCOLMOTOS YAMAHA S.A.',
    projectName: 'Campaña Navidad Yamaha',
    frente: 'Landing Page',
    phase: 'Implementación Frontend & Backend',
    fase: 'Implementación Frontend & Backend',
    budgetedRole: 'Front End',
    executedRoleSnapshot: 'Front End',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Laura Gómez',
      initials: 'LG',
      avatarBg: 'bg-[#0284c7]',
      role: 'Front End'
    },
    requestedBy: 'Paola (Lead PM)',
    reviewer: {
      name: 'Andrés Ríos',
      initials: 'AR',
      avatarBg: 'bg-[#ef4444]',
      role: 'Product Lead'
    },
    dependencyTaskId: 't-yam-lp-3',
    dependencyTaskTitle: 'Prototipo',
    date: '23 Ago 2026',
    startDate: '23 ago. 2026',
    dueDate: '2026-08-27',
    baselineStartDate: '2026-08-23',
    baselineDueDate: '2026-08-27',
    dueStatus: 'soon',
    dueText: 'Vence en 1 día',
    status: 'In Progress',
    priority: 'High',
    completed: false,
    budgetedHours: 8.0,
    consumedSeconds: 36000, // 10.0h ejecutadas (desvío +2h)
    tags: ['Landing Page', 'Frontend', 'React', 'Analytics'],
    acceptanceCriteria: [
      { id: 'crit-lp4-1', text: 'Puntuación Lighthouse > 90 en performance', completed: false },
      { id: 'crit-lp4-2', text: 'Envío correcto de leads al webhook de Yamaha', completed: true }
    ]
  },

  // --- FRENTE 3: PAUTA (Campaña Navidad Yamaha · 8 h) ---
  {
    id: 't-yam-pt-1',
    title: 'Carga/publicación de anuncios',
    description: 'Configuración de campañas en Meta Ads Manager y Google Ads, carga de creativos y segmentación.',
    department: 'Growth & Performance',
    board: 'Campaña Navidad Yamaha',
    clientName: 'INCOLMOTOS YAMAHA S.A.',
    projectName: 'Campaña Navidad Yamaha',
    frente: 'Pauta',
    phase: 'QA & Testing',
    fase: 'QA & Testing',
    budgetedRole: 'Trafficker',
    executedRoleSnapshot: 'Trafficker',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Sebas (Trafficker)',
      initials: 'ST',
      avatarBg: 'bg-[#0284c7]',
      role: 'Trafficker'
    },
    requestedBy: 'Paola (Lead PM)',
    dependencyTaskId: 't-yam-rs-2',
    dependencyTaskTitle: 'Diseño de piezas',
    date: '25 Ago 2026',
    startDate: '25 ago. 2026',
    dueDate: '2026-08-28',
    baselineStartDate: '2026-08-25',
    baselineDueDate: '2026-08-28',
    dueStatus: 'soon',
    dueText: 'En revisión de QC',
    status: 'Review',
    priority: 'High',
    completed: false,
    budgetedHours: 3.0,
    consumedSeconds: 10800, // 3.0h
    tags: ['Pauta', 'Meta Ads', 'Google Ads', 'Trafficker'],
    acceptanceCriteria: [
      { id: 'crit-pt1-1', text: 'Verificación de UTMs y tracking de conversión', completed: true },
      { id: 'crit-pt1-2', text: 'Presupuesto diario y puja configurada correctamente', completed: true }
    ]
  },
  {
    id: 't-yam-pt-2',
    title: 'Seguimiento/optimización',
    description: 'Monitoreo diario de CPA, CPL y ROAS, reasignación de presupuestos a creativos ganadores.',
    department: 'Growth & Performance',
    board: 'Campaña Navidad Yamaha',
    clientName: 'INCOLMOTOS YAMAHA S.A.',
    projectName: 'Campaña Navidad Yamaha',
    frente: 'Pauta',
    phase: 'Despliegue & Cierre',
    fase: 'Despliegue & Cierre',
    budgetedRole: 'Trafficker',
    executedRoleSnapshot: 'Trafficker',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Sebas (Trafficker)',
      initials: 'ST',
      avatarBg: 'bg-[#0284c7]',
      role: 'Trafficker'
    },
    requestedBy: 'Paola (Lead PM)',
    dependencyTaskId: 't-yam-pt-1',
    dependencyTaskTitle: 'Carga/publicación de anuncios',
    date: '26 Ago 2026',
    startDate: '28 ago. 2026',
    dueDate: '2026-11-30',
    baselineStartDate: '2026-08-28',
    baselineDueDate: '2026-11-30',
    dueStatus: 'normal',
    dueText: 'Optimización continua',
    status: 'To Do',
    priority: 'Medium',
    completed: false,
    budgetedHours: 5.0,
    consumedSeconds: 0,
    tags: ['Pauta', 'Optimización', 'ROAS', 'Reporting']
  },

  // =========================================================================
  // PROYECTO 2: TIENDA ONLINE BATTSAVER · CLIENTE ROCK AND RIDE S.A.S.
  // MODALIDAD: PROYECTO ÚNICO (E-COMMERCE / SHOPIFY CON BACKLOG & FASES)
  // FASES: Discovery -> UX/UI -> Implementación -> QA -> Cierre (12 TAREAS)
  // =========================================================================

  // --- FASE 1: DISCOVERY (14 h) ---
  {
    id: 't-bs-1',
    title: 'Benchmark y requerimientos e-commerce',
    description: 'Análisis de competencia en baterías de alto rendimiento, levantamiento de arquitectura de catálogo y requerimientos funcionales para Shopify.',
    department: 'Investigación & Producto',
    board: 'Tienda Online BattSaver',
    clientName: 'Rock and Ride S.A.S.',
    projectName: 'Tienda Online BattSaver',
    frente: 'Investigación',
    fase: 'Discovery',
    phase: 'Discovery',
    budgetedRole: 'Product Lead',
    executedRoleSnapshot: 'Product Lead',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Andrés Ríos',
      initials: 'AR',
      avatarBg: 'bg-[#ef4444]',
      role: 'Growth & Tech Lead'
    },
    requestedBy: 'Paola (Lead PM)',
    date: '15 Ago 2026',
    startDate: '15 ago. 2026',
    dueDate: '2026-08-20',
    baselineStartDate: '2026-08-15',
    baselineDueDate: '2026-08-20',
    dueStatus: 'normal',
    dueText: 'Completado',
    status: 'Done',
    priority: 'High',
    completed: true,
    budgetedHours: 6.0,
    consumedSeconds: 21600, // 6.0h
    tags: ['Shopify', 'Discovery', 'Benchmark'],
    acceptanceCriteria: [
      { id: 'c-bs1-1', text: 'Matriz comparativa de tiendas e-commerce', completed: true },
      { id: 'c-bs1-2', text: 'Documento de alcance funcional firmado', completed: true }
    ]
  },
  {
    id: 't-bs-2',
    title: 'Arquitectura de información y catálogo Shopify',
    description: 'Definición de colecciones, taxonomía de productos (baterías por marca/modelo de vehículo), filtros y navegación principal.',
    department: 'Arquitectura & Tech',
    board: 'Tienda Online BattSaver',
    clientName: 'Rock and Ride S.A.S.',
    projectName: 'Tienda Online BattSaver',
    frente: 'Arquitectura',
    fase: 'Discovery',
    phase: 'Discovery',
    budgetedRole: 'Tech Lead',
    executedRoleSnapshot: 'Tech Lead',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Paola (Lead PM)',
      initials: 'PL',
      avatarBg: 'bg-[#501f92]',
      role: 'Lead PM'
    },
    requestedBy: 'Andrés Ríos',
    dependencyTaskId: 't-bs-1',
    dependencyTaskTitle: 'Benchmark y requerimientos e-commerce',
    date: '20 Ago 2026',
    startDate: '20 ago. 2026',
    dueDate: '2026-08-25',
    baselineStartDate: '2026-08-20',
    baselineDueDate: '2026-08-25',
    dueStatus: 'normal',
    dueText: 'Completado',
    status: 'Done',
    priority: 'High',
    completed: true,
    budgetedHours: 8.0,
    consumedSeconds: 28800, // 8.0h
    tags: ['Shopify', 'Taxonomía', 'Arquitectura']
  },

  // --- FASE 2: UX/UI (36 h) ---
  {
    id: 't-bs-3',
    title: 'UI Kit y Design System en Figma',
    description: 'Diseño de componentes base, tipografía, paleta de color de BattSaver, tokens de diseño y componentes de cards de producto.',
    department: 'Diseño UI/UX',
    board: 'Tienda Online BattSaver',
    clientName: 'Rock and Ride S.A.S.',
    projectName: 'Tienda Online BattSaver',
    frente: 'Diseño UX/UI',
    fase: 'UX/UI',
    phase: 'UX/UI',
    budgetedRole: 'UI/UX Designer',
    executedRoleSnapshot: 'UI/UX Designer',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Catalina Tejada',
      initials: 'CT',
      avatarBg: 'bg-[#7c3aed]',
      role: 'Lead Designer'
    },
    requestedBy: 'Paola (Lead PM)',
    date: '26 Ago 2026',
    startDate: '26 ago. 2026',
    dueDate: '2026-09-02',
    baselineStartDate: '2026-08-26',
    baselineDueDate: '2026-09-02',
    dueStatus: 'normal',
    dueText: 'Completado a tiempo',
    status: 'Done',
    priority: 'High',
    completed: true,
    budgetedHours: 14.0,
    consumedSeconds: 50400, // 14.0h
    tags: ['Figma', 'Design System', 'UI Kit']
  },
  {
    id: 't-bs-4',
    title: 'Diseño Wireframes y Flujo de Checkout',
    description: 'Diseño responsive de páginas clave: Home, PDP (Página de Detalle de Batería), Carrito lateral y Checkout optimizado en Shopify.',
    department: 'Diseño UI/UX',
    board: 'Tienda Online BattSaver',
    clientName: 'Rock and Ride S.A.S.',
    projectName: 'Tienda Online BattSaver',
    frente: 'Diseño UX/UI',
    fase: 'UX/UI',
    phase: 'UX/UI',
    budgetedRole: 'UI/UX Designer',
    executedRoleSnapshot: 'UI/UX Designer',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Catalina Tejada',
      initials: 'CT',
      avatarBg: 'bg-[#7c3aed]',
      role: 'Lead Designer'
    },
    requestedBy: 'Andrés Ríos',
    dependencyTaskId: 't-bs-3',
    dependencyTaskTitle: 'UI Kit y Design System en Figma',
    date: '02 Sep 2026',
    startDate: '02 sep. 2026',
    dueDate: '2026-09-08',
    baselineStartDate: '2026-09-02',
    baselineDueDate: '2026-09-08',
    dueStatus: 'soon',
    dueText: 'En proceso de diseño',
    status: 'In Progress',
    priority: 'High',
    completed: false,
    budgetedHours: 16.0,
    consumedSeconds: 21600, // 6.0h
    tags: ['Figma', 'PDP', 'Checkout', 'UX Flow']
  },
  {
    id: 't-bs-5',
    title: 'Prototipo interactivo mobile y validación',
    description: 'Enlace interactivo en Figma con microinteracciones para aprobación del cliente Rock and Ride S.A.S.',
    department: 'Diseño UI/UX',
    board: 'Tienda Online BattSaver',
    clientName: 'Rock and Ride S.A.S.',
    projectName: 'Tienda Online BattSaver',
    frente: 'Diseño UX/UI',
    fase: 'UX/UI',
    phase: 'UX/UI',
    budgetedRole: 'UI/UX Designer',
    executedRoleSnapshot: 'UI/UX Designer',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Catalina Tejada',
      initials: 'CT',
      avatarBg: 'bg-[#7c3aed]',
      role: 'Lead Designer'
    },
    requestedBy: 'Paola (Lead PM)',
    dependencyTaskId: 't-bs-4',
    dependencyTaskTitle: 'Diseño Wireframes y Flujo de Checkout',
    date: '08 Sep 2026',
    startDate: '08 sep. 2026',
    dueDate: '2026-09-10',
    baselineStartDate: '2026-09-08',
    baselineDueDate: '2026-09-10',
    dueStatus: 'soon',
    dueText: 'Próxima entrega',
    status: 'To Do',
    priority: 'Medium',
    completed: false,
    budgetedHours: 6.0,
    consumedSeconds: 0,
    tags: ['Figma', 'Prototipo', 'Mobile']
  },

  // --- FASE 3: IMPLEMENTACIÓN (48 h) ---
  {
    id: 't-bs-6',
    title: 'Setup de Store Shopify & Tema Liquid',
    description: 'Instalación de Shopify Plus/Advanced, configuración de theme Dawn/Custom, secciones modulares Liquid y ajustes CSS.',
    department: 'Desarrollo Frontend',
    board: 'Tienda Online BattSaver',
    clientName: 'Rock and Ride S.A.S.',
    projectName: 'Tienda Online BattSaver',
    frente: 'Desarrollo Web',
    fase: 'Implementación',
    phase: 'Implementación',
    budgetedRole: 'Front End',
    executedRoleSnapshot: 'Front End',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Laura Gómez',
      initials: 'LG',
      avatarBg: 'bg-[#0284c7]',
      role: 'Front End'
    },
    requestedBy: 'Andrés Ríos',
    dependencyTaskId: 't-bs-5',
    dependencyTaskTitle: 'Prototipo interactivo mobile y validación',
    date: '11 Sep 2026',
    startDate: '11 sep. 2026',
    dueDate: '2026-09-22',
    baselineStartDate: '2026-09-11',
    baselineDueDate: '2026-09-22',
    dueStatus: 'normal',
    dueText: 'Pendiente de inicio',
    status: 'To Do',
    priority: 'High',
    completed: false,
    budgetedHours: 18.0,
    consumedSeconds: 0,
    tags: ['Shopify', 'Liquid', 'Frontend', 'CSS']
  },
  {
    id: 't-bs-7',
    title: 'Integración pasarela de pagos Wompi & PSE',
    description: 'Conexión con checkout transparente de Wompi, configuración de webhooks de notificación de pago y pruebas en sandbox.',
    department: 'Integraciones & Backend',
    board: 'Tienda Online BattSaver',
    clientName: 'Rock and Ride S.A.S.',
    projectName: 'Tienda Online BattSaver',
    frente: 'Integraciones',
    fase: 'Implementación',
    phase: 'Implementación',
    budgetedRole: 'Back End',
    executedRoleSnapshot: 'Back End',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Laura Gómez',
      initials: 'LG',
      avatarBg: 'bg-[#0284c7]',
      role: 'Back End'
    },
    requestedBy: 'Paola (Lead PM)',
    dependencyTaskId: 't-bs-6',
    dependencyTaskTitle: 'Setup de Store Shopify & Tema Liquid',
    date: '23 Sep 2026',
    startDate: '23 sep. 2026',
    dueDate: '2026-10-02',
    baselineStartDate: '2026-09-23',
    baselineDueDate: '2026-10-02',
    dueStatus: 'normal',
    dueText: 'Programado',
    status: 'To Do',
    priority: 'High',
    completed: false,
    budgetedHours: 14.0,
    consumedSeconds: 0,
    tags: ['Wompi', 'PSE', 'Pasarela', 'Webhooks']
  },
  {
    id: 't-bs-8',
    title: 'Carga masiva de catálogo y configuración de filtros',
    description: 'Importación de SKU de baterías por marca de moto/auto, matriz de compatibilidad y filtros dinámicos por amperaje y medidas.',
    department: 'Operaciones Web',
    board: 'Tienda Online BattSaver',
    clientName: 'Rock and Ride S.A.S.',
    projectName: 'Tienda Online BattSaver',
    frente: 'Operaciones Web',
    fase: 'Implementación',
    phase: 'Implementación',
    budgetedRole: 'Front End',
    executedRoleSnapshot: 'Front End',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Mateo Ruiz',
      initials: 'MR',
      avatarBg: 'bg-[#8b5cf6]',
      role: 'Community & Dev'
    },
    requestedBy: 'Laura Gómez',
    date: '03 Oct 2026',
    startDate: '03 oct. 2026',
    dueDate: '2026-10-09',
    baselineStartDate: '2026-10-03',
    baselineDueDate: '2026-10-09',
    dueStatus: 'normal',
    dueText: 'Programado',
    status: 'To Do',
    priority: 'Medium',
    completed: false,
    budgetedHours: 10.0,
    consumedSeconds: 0,
    tags: ['Catálogo', 'Filtros', 'Shopify CSV']
  },
  {
    id: 't-bs-9',
    title: 'Optimización SEO On-Page y Core Web Vitals',
    description: 'Estructura de metadatos, Schema.org para productos, optimización de imágenes WebP y score móvil.',
    department: 'Growth & Tech',
    board: 'Tienda Online BattSaver',
    clientName: 'Rock and Ride S.A.S.',
    projectName: 'Tienda Online BattSaver',
    frente: 'Growth & Tech',
    fase: 'Implementación',
    phase: 'Implementación',
    budgetedRole: 'Growth Specialist',
    executedRoleSnapshot: 'Growth Specialist',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Sebas (Trafficker)',
      initials: 'ST',
      avatarBg: 'bg-[#0284c7]',
      role: 'Trafficker'
    },
    requestedBy: 'Andrés Ríos',
    date: '10 Oct 2026',
    startDate: '10 oct. 2026',
    dueDate: '2026-10-15',
    baselineStartDate: '2026-10-10',
    baselineDueDate: '2026-10-15',
    dueStatus: 'normal',
    dueText: 'Programado',
    status: 'To Do',
    priority: 'Medium',
    completed: false,
    budgetedHours: 6.0,
    consumedSeconds: 0,
    tags: ['SEO', 'Core Web Vitals', 'Performance']
  },

  // --- FASE 4: QA (14 h) ---
  {
    id: 't-bs-10',
    title: 'Pruebas integrales de flujo de compra y pasarela (End-to-End)',
    description: 'Simulación de compras reales, pagos con tarjetas de prueba, rechazos, reintentos y generación de órdenes en Shopify Admin.',
    department: 'Calidad & QA',
    board: 'Tienda Online BattSaver',
    clientName: 'Rock and Ride S.A.S.',
    projectName: 'Tienda Online BattSaver',
    frente: 'Calidad & QA',
    fase: 'QA',
    phase: 'QA',
    budgetedRole: 'QA Tester',
    executedRoleSnapshot: 'QA Tester',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Paola (Lead PM)',
      initials: 'PL',
      avatarBg: 'bg-[#501f92]',
      role: 'Lead PM'
    },
    requestedBy: 'Andrés Ríos',
    dependencyTaskId: 't-bs-7',
    dependencyTaskTitle: 'Integración pasarela de pagos Wompi & PSE',
    date: '16 Oct 2026',
    startDate: '16 oct. 2026',
    dueDate: '2026-10-21',
    baselineStartDate: '2026-10-16',
    baselineDueDate: '2026-10-21',
    dueStatus: 'normal',
    dueText: 'Programado',
    status: 'To Do',
    priority: 'High',
    completed: false,
    budgetedHours: 8.0,
    consumedSeconds: 0,
    tags: ['QA', 'E2E', 'Checkout Testing']
  },
  {
    id: 't-bs-11',
    title: 'Testing multidispositivo (iOS, Android, Safari, Chrome)',
    description: 'Auditoría cross-browser en resoluciones mobile, tablet y desktop, verificando menús, filtros y botones sticky.',
    department: 'Calidad & QA',
    board: 'Tienda Online BattSaver',
    clientName: 'Rock and Ride S.A.S.',
    projectName: 'Tienda Online BattSaver',
    frente: 'Calidad & QA',
    fase: 'QA',
    phase: 'QA',
    budgetedRole: 'QA Tester',
    executedRoleSnapshot: 'QA Tester',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Catalina Tejada',
      initials: 'CT',
      avatarBg: 'bg-[#7c3aed]',
      role: 'Lead Designer'
    },
    requestedBy: 'Paola (Lead PM)',
    date: '22 Oct 2026',
    startDate: '22 oct. 2026',
    dueDate: '2026-10-25',
    baselineStartDate: '2026-10-22',
    baselineDueDate: '2026-10-25',
    dueStatus: 'normal',
    dueText: 'Programado',
    status: 'To Do',
    priority: 'Medium',
    completed: false,
    budgetedHours: 6.0,
    consumedSeconds: 0,
    tags: ['QA', 'Cross-browser', 'Mobile Testing']
  },

  // --- FASE 5: CIERRE (8 h) ---
  {
    id: 't-bs-12',
    title: 'Configuración Dominio, SSL y Launch Checklist',
    description: 'Apuntamientos DNS a servidores de Shopify, certificado SSL, verificación de Google Search Console y analytics de lanzamiento.',
    department: 'Despliegue & DevOps',
    board: 'Tienda Online BattSaver',
    clientName: 'Rock and Ride S.A.S.',
    projectName: 'Tienda Online BattSaver',
    frente: 'Despliegue',
    fase: 'Cierre',
    phase: 'Cierre',
    budgetedRole: 'Tech Lead',
    executedRoleSnapshot: 'Tech Lead',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Andrés Ríos',
      initials: 'AR',
      avatarBg: 'bg-[#ef4444]',
      role: 'Growth & Tech Lead'
    },
    requestedBy: 'Paola (Lead PM)',
    dependencyTaskId: 't-bs-10',
    dependencyTaskTitle: 'Pruebas integrales de flujo de compra y pasarela (End-to-End)',
    date: '26 Oct 2026',
    startDate: '26 oct. 2026',
    dueDate: '2026-10-30',
    baselineStartDate: '2026-10-26',
    baselineDueDate: '2026-10-30',
    dueStatus: 'normal',
    dueText: 'Programado',
    status: 'To Do',
    priority: 'High',
    completed: false,
    budgetedHours: 4.0,
    consumedSeconds: 0,
    tags: ['Go-Live', 'DNS', 'Shopify SSL']
  },
  {
    id: 't-bs-13',
    title: 'Capacitación al equipo de Rock and Ride en Shopify Admin',
    description: 'Sesión virtual de 2 horas para el equipo de operaciones: gestión de pedidos, creación de cupones, actualización de inventario y manual PDF.',
    department: 'Capacitación & Cierre',
    board: 'Tienda Online BattSaver',
    clientName: 'Rock and Ride S.A.S.',
    projectName: 'Tienda Online BattSaver',
    frente: 'Capacitación',
    fase: 'Cierre',
    phase: 'Cierre',
    budgetedRole: 'Product Lead',
    executedRoleSnapshot: 'Product Lead',
    projectType: 'fixed_milestones',
    categoryType: 'client',
    assignee: {
      name: 'Paola (Lead PM)',
      initials: 'PL',
      avatarBg: 'bg-[#501f92]',
      role: 'Lead PM'
    },
    requestedBy: 'Santiago Giraldo',
    date: '02 Nov 2026',
    startDate: '02 nov. 2026',
    dueDate: '2026-11-05',
    baselineStartDate: '2026-11-02',
    baselineDueDate: '2026-11-05',
    dueStatus: 'normal',
    dueText: 'Hito final de entrega',
    status: 'To Do',
    priority: 'Medium',
    completed: false,
    budgetedHours: 4.0,
    consumedSeconds: 0,
    tags: ['Capacitación', 'Shopify Admin', 'Manual']
  },

  {
    id: 't-cor-1',
    title: 'Actualización de Precios & Carga de Banners Campaña',
    department: 'Desarrollo Web & IT',
    board: 'Mantenimiento',
    clientName: 'Prisma Kiddos',
    projectName: 'Fee Mantenimiento Web Prisma',
    projectType: 'fee_monthly',
    feeCategory: 'Mantenimiento Web',
    categoryType: 'client',
    assignee: {
      name: 'Laura Gómez',
      initials: 'LG',
      avatarBg: 'bg-[#0284c7]',
      role: 'Colaborador Frontend'
    },
    collaborators: [
      {
        name: 'Catalina Tejada',
        initials: 'CT',
        avatarBg: 'bg-[#7c3aed]',
        role: 'PM'
      }
    ],
    followers: [
      {
        name: 'Paola (Lead PM)',
        initials: 'PL',
        avatarBg: 'bg-[#501f92]',
        role: 'Lead PM'
      }
    ],
    date: '22 Ago 2026',
    startDate: '20 ago. 2026, 08:00',
    dueDate: '2026-08-25',
    dueStatus: 'soon',
    dueText: '25 ago. 2026, 18:00',
    status: 'Done',
    priority: 'Medium',
    completed: true,
    budgetedHours: 2.5,
    plannedHours: 2.0,
    consumedSeconds: 9000, // 2.5h
    taskType: 'Mantenimiento Web',
    tags: ['Fee Recurrente', 'Banners', 'Precios', 'Shopify'],
    recurrence: 'Mensual',
    deliverables: [
      {
        id: 'del-cor-1',
        taskId: 't-cor-1',
        url: 'https://prismakiddos.com/pages/stem',
        title: 'Página de sustentabilidad & Actualización de Precios',
        submittedAt: 'Hoy, 08:10 AM',
        submittedBy: 'Laura Gómez',
        status: 'approved',
        notes: 'Ajustes de banners mobile y precios actualizados en catálogo.',
        taggedReviewer: 'Catalina Tejada'
      }
    ],
    messages: [
      {
        id: 'msg-1',
        authorName: 'Laura Gómez',
        authorInitials: 'LG',
        authorAvatarBg: 'bg-[#0284c7]',
        timestamp: 'Hoy 08:10 AM',
        content: 'Hola @Catalina Tejada ya quedaron subidos los banners y los nuevos precios en el e-commerce.',
        mentionedUsers: ['Catalina Tejada']
      }
    ]
  },
  {
    id: 't-1',
    title: 'Conceptualización & Diseño de Carruseles para Redes (Semana 34)',
    department: 'Creatividad & Diseño',
    board: 'Parrilla Digital',
    clientName: 'Danone S.A.',
    projectName: 'Fee Parrilla Digital Q3 · Banners & Social',
    projectType: 'fee_monthly',
    feeCategory: 'Parrilla & Redes',
    categoryType: 'client',
    assignee: {
      name: 'Catalina Tejada',
      initials: 'CT',
      avatarBg: 'bg-[#7c3aed]',
      role: 'Lead Designer'
    },
    collaborators: [
      {
        name: 'Paola (Lead PM)',
        initials: 'PL',
        avatarBg: 'bg-[#501f92]',
        role: 'PM'
      }
    ],
    followers: [
      {
        name: 'Andrés Ríos',
        initials: 'AR',
        avatarBg: 'bg-[#501f92]',
        role: 'Product Lead'
      }
    ],
    date: '22 Ago 2026',
    startDate: '20 ago. 2026, 09:00',
    dueDate: '2026-08-24',
    dueStatus: 'soon',
    dueText: '24 ago. 2026, 18:00',
    status: 'In Progress',
    priority: 'High',
    completed: false,
    budgetedHours: 8.0,
    plannedHours: 4.0,
    consumedSeconds: 16200, // 4.5h consumidas
    taskType: 'Parrilla Mensual',
    tags: ['Fee Social', 'Figma', 'Carruseles', 'Copys'],
    recurrence: 'Mensual',
    messages: [
      {
        id: 'msg-dan-1',
        authorName: 'Catalina Tejada',
        authorInitials: 'CT',
        authorAvatarBg: 'bg-[#7c3aed]',
        timestamp: '21 de ago. de 2026 14:30 hs',
        content: 'Hola @Paola ya monté las propuestas de carruseles en Figma para validación.',
        mentionedUsers: ['Paola'],
        linkUrl: 'https://figma.com/file/danone-q3-banners-artes',
        linkPreviewTitle: 'Figma: Artes Finales en 5 formatos',
        linkPreviewDesc: 'danone-q3-banners-artes · Archivo de producción'
      }
    ],
    deliverables: [
      {
        id: 'del-1',
        taskId: 't-1',
        url: 'https://figma.com/file/danone-q3-banners-artes',
        title: 'Figma: Artes Finales en 5 formatos',
        submittedAt: 'Hoy, 11:02 AM',
        submittedBy: 'Catalina Tejada',
        status: 'submitted',
        notes: '@Paola ya quedaron listos los formatos verticales y feed.',
        taggedReviewer: 'Paola (Lead PM)'
      }
    ]
  },
  {
    id: 't-stem-1',
    title: 'Arquitectura de Información & Wireframes E-commerce STEM',
    department: 'Desarrollo Web & IT',
    board: 'E-commerce STEM',
    clientName: 'Prisma Kiddos',
    projectName: 'E-commerce & Landing STEM (Proyecto Web)',
    projectType: 'fixed_milestones',
    phase: 'Discovery & Arquitectura',
    categoryType: 'client',
    assignee: {
      name: 'Andrés Ríos',
      initials: 'AR',
      avatarBg: 'bg-[#ef4444]',
      role: 'Tech Lead'
    },
    collaborators: [
      {
        name: 'Paola (Lead PM)',
        initials: 'PL',
        avatarBg: 'bg-[#501f92]',
        role: 'PM'
      }
    ],
    date: '18 Ago 2026',
    startDate: '10 ago. 2026',
    dueDate: '2026-08-18',
    dueStatus: 'normal',
    dueText: 'Completado a tiempo',
    status: 'Done',
    priority: 'High',
    completed: true,
    budgetedHours: 16.0,
    consumedSeconds: 54000, // 15.0h
    tags: ['Proyecto Web', 'Fase 1: Discovery', 'Sitemap', 'User Flows'],
    deliverables: [
      {
        id: 'del-stem-1',
        taskId: 't-stem-1',
        url: 'https://miro.com/app/board/stem-wireframes',
        title: 'Miro: Sitemap & Arquitectura de Navegación Aprobada',
        submittedAt: '18 Ago 2026',
        submittedBy: 'Andrés Ríos',
        status: 'approved',
        notes: 'Cliente aprobó sitemap en sesión de Discovery.',
        taggedReviewer: 'Paola (Lead PM)'
      }
    ]
  },
  {
    id: 't-stem-2',
    title: 'Diseño UI en Figma & Componentes del Checkout',
    department: 'Creatividad & Diseño',
    board: 'E-commerce STEM',
    clientName: 'Prisma Kiddos',
    projectName: 'E-commerce & Landing STEM (Proyecto Web)',
    projectType: 'fixed_milestones',
    phase: 'UI/UX & Prototipado',
    categoryType: 'client',
    assignee: {
      name: 'Catalina Tejada',
      initials: 'CT',
      avatarBg: 'bg-[#7c3aed]',
      role: 'Lead Designer'
    },
    date: '20 Ago 2026',
    startDate: '18 ago. 2026',
    dueDate: '2026-08-26',
    dueStatus: 'soon',
    dueText: 'Vence en 3 días',
    status: 'In Progress',
    priority: 'High',
    completed: false,
    budgetedHours: 24.0,
    consumedSeconds: 43200, // 12.0h
    tags: ['Proyecto Web', 'Fase 2: UI/UX', 'Figma', 'Design System'],
    acceptanceCriteria: [
      { id: 'crit-st-1', text: 'Diseño de catálogo responsive mobile/desktop', completed: true },
      { id: 'crit-st-2', text: 'Flujo de carrito y checkout 3 pasos', completed: true },
      { id: 'crit-st-3', text: 'Validación de contraste y accesibilidad WCAG', completed: false }
    ]
  },
  {
    id: 't-stem-3',
    title: 'Integración Pasarela de Pagos & Backend de Pedidos',
    department: 'Desarrollo Web & IT',
    board: 'E-commerce STEM',
    clientName: 'Prisma Kiddos',
    projectName: 'E-commerce & Landing STEM (Proyecto Web)',
    projectType: 'fixed_milestones',
    phase: 'Implementación / Dev',
    categoryType: 'client',
    assignee: {
      name: 'Esteban Mora',
      initials: 'EM',
      avatarBg: 'bg-[#f59e0b]',
      role: 'Backend Dev'
    },
    collaborators: [
      {
        name: 'Andrés Ríos',
        initials: 'AR',
        avatarBg: 'bg-[#ef4444]',
        role: 'Tech Reviewer'
      }
    ],
    date: '22 Ago 2026',
    startDate: '22 ago. 2026',
    dueDate: '2026-08-30',
    dueStatus: 'soon',
    dueText: 'En Standby (+4d retraso cliente)',
    status: 'To Do',
    priority: 'High',
    completed: false,
    budgetedHours: 20.0,
    consumedSeconds: 7200, // 2.0h
    tags: ['Proyecto Web', 'Fase 3: Dev', 'Pasarela', 'Backend'],
    // STANDBY / BLOQUEO POR INSUMOS DEL CLIENTE
    blockerInfo: {
      isBlocked: true,
      reason: 'client_inputs',
      reasonText: 'Esperando credenciales de producción y llaves API de la Pasarela del Cliente',
      responsibleParty: 'Cliente',
      blockedDays: 4,
      blockedAt: '18 Ago 2026',
      notes: 'El cliente no ha entregado accesos de pasarela. Cronograma en riesgo de desfase.'
    }
  },
  {
    id: 't-nav-1',
    title: 'Concepto Creativo & Piezas Gráficas Campaña Navidad',
    department: 'Creatividad & Diseño',
    board: 'Campaña Navidad',
    clientName: 'Danone S.A.',
    projectName: 'Campaña Navidad 2026 (Flujo Creativos → Pauta)',
    projectType: 'fixed_milestones',
    phase: 'UI/UX & Prototipado',
    categoryType: 'client',
    assignee: {
      name: 'Catalina Tejada',
      initials: 'CT',
      avatarBg: 'bg-[#7c3aed]',
      role: 'Lead Designer'
    },
    collaborators: [
      {
        name: 'Paola (Lead PM)',
        initials: 'PL',
        avatarBg: 'bg-[#501f92]',
        role: 'PM'
      }
    ],
    date: '22 Ago 2026',
    startDate: '19 ago. 2026',
    dueDate: '2026-08-23',
    dueStatus: 'tomorrow',
    dueText: 'En Revisión de Lead',
    status: 'Review',
    priority: 'High',
    completed: false,
    budgetedHours: 15.0,
    consumedSeconds: 46800, // 13.0h
    tags: ['Campaña Navidad', 'Creativos', 'Video', 'Aprobación'],
    deliverables: [
      {
        id: 'del-nav-1',
        taskId: 't-nav-1',
        url: 'https://drive.google.com/drive/folders/danone-navidad-artes',
        title: 'Google Drive: Master de Creativos & Formatos 9:16 y 1:1',
        submittedAt: 'Hoy, 09:30 AM',
        submittedBy: 'Catalina Tejada',
        status: 'submitted',
        notes: '@Paola esperando visto bueno para desbloquear la pauta de Sebas.',
        taggedReviewer: 'Paola (Lead PM)'
      }
    ]
  },
  {
    id: 't-nav-2',
    title: 'Montaje & Activación de Pauta en Meta & TikTok Ads (Sebas Trafficker)',
    department: 'Growth & Performance',
    board: 'Campaña Navidad',
    clientName: 'Danone S.A.',
    projectName: 'Campaña Navidad 2026 (Flujo Creativos → Pauta)',
    projectType: 'fixed_milestones',
    phase: 'Implementación / Dev',
    categoryType: 'client',
    assignee: {
      name: 'Sebas (Trafficker)',
      initials: 'ST',
      avatarBg: 'bg-[#0284c7]',
      role: 'Trafficker Digital'
    },
    date: '22 Ago 2026',
    startDate: '23 ago. 2026',
    dueDate: '2026-08-26',
    dueStatus: 'soon',
    dueText: 'En Espera de Creativos',
    status: 'To Do',
    priority: 'High',
    completed: false,
    budgetedHours: 6.0,
    consumedSeconds: 0,
    tags: ['Campaña Navidad', 'Pauta', 'Meta Ads', 'TikTok Ads'],
    dependencyTaskId: 't-nav-1',
    dependencyTaskTitle: 'Concepto Creativo & Piezas Gráficas Campaña Navidad',
    // BLOQUEADO POR DEPENDENCIA INTERNA (CREATIVOS NO APROBADOS AÚN)
    blockerInfo: {
      isBlocked: true,
      reason: 'dependency',
      reasonText: 'Bloqueado: Requiere aprobación del entregable de creativos de Catalina (#t-nav-1)',
      responsibleParty: 'Uhura / Interno',
      blockedDays: 1,
      blockedAt: '21 Ago 2026',
      notes: 'Sebas activará la pauta inmediatamente una vez Paola apruebe los entregables.'
    }
  },
  {
    id: 't-2',
    title: 'Optimización de Pauta Semanal en Meta & Google Ads',
    department: 'Growth & Performance',
    board: 'Growth',
    clientName: 'BAMBÚ BPO',
    projectName: 'Fee Admin de Pauta & Ads Performance',
    projectType: 'fee_monthly',
    feeCategory: 'Growth & Pauta',
    categoryType: 'client',
    assignee: {
      name: 'Camilo Vélez',
      initials: 'CV',
      avatarBg: 'bg-[#10b981]',
      role: 'Growth Specialist'
    },
    date: '21 Ago 2026',
    dueDate: '2026-08-23',
    dueStatus: 'tomorrow',
    dueText: 'Vence mañana',
    status: 'In Progress',
    priority: 'High',
    completed: false,
    budgetedHours: 6.0,
    consumedSeconds: 19800, // 5.5h
    tags: ['Fee Pauta', 'Google Ads', 'Meta Ads'],
    deliverables: []
  },
  {
    id: 't-4',
    title: 'Desarrollo de Módulo de Tiempos & Zero-Scroll Orbit OS',
    department: 'Innovación & Labs',
    board: 'Labs',
    clientName: '🏢 Uhura Interno / No Facturable',
    projectName: 'Innovación & Orbit OS Labs',
    projectType: 'fixed_milestones',
    phase: 'Implementación / Dev',
    categoryType: 'internal',
    assignee: {
      name: 'Andrés Ríos',
      initials: 'AR',
      avatarBg: 'bg-[#ef4444]',
      role: 'Growth Lead'
    },
    date: '22 Ago 2026',
    dueDate: '2026-08-25',
    dueStatus: 'soon',
    dueText: 'Vence en 3 días',
    status: 'In Progress',
    priority: 'High',
    completed: false,
    budgetedHours: 10.0,
    consumedSeconds: 5400, // 1.5h
    tags: ['Uhura Labs', 'Fase 3: Dev', 'Time Tracking'],
    deliverables: [
      {
        id: 'del-2',
        taskId: 't-4',
        url: 'https://github.com/uhura-labs/orbit-os-timetrack',
        title: 'PR #12: Control de Bloqueos, Jerarquía & Fases de Proyecto',
        submittedAt: 'Hoy, 12:45 PM',
        submittedBy: 'Andrés Ríos',
        status: 'submitted',
        notes: 'Listo para revisión del equipo.',
        taggedReviewer: 'Paola (Lead PM)'
      }
    ]
  }
];

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
  // C-LEVEL & DIRECCIÓN
  {
    id: 'u-1',
    name: 'Ana María Giraldo',
    email: 'ana@uhuragroup.com',
    initials: 'AM',
    avatarBg: 'bg-[#501f92]',
    role: 'Admin',
    status: 'Active',
    tasksCount: 4,
    joinedDate: 'Ene 2024',
    capacityHours: 42,
    utilizedPercent: 80,
    jobTitle: 'CEO (C-Level)'
  },

  // ÁREA PRODUCTO
  {
    id: 'u-2',
    name: 'Paola Monsalve',
    email: 'paola@uhuragroup.com',
    initials: 'PM',
    avatarBg: 'bg-[#501f92]',
    role: 'Admin',
    status: 'Active',
    tasksCount: 8,
    joinedDate: 'Ene 2024',
    capacityHours: 42,
    utilizedPercent: 88,
    jobTitle: 'Product Lead / Digital Designer'
  },
  {
    id: 'u-3',
    name: 'Laura Gómez',
    email: 'laura@uhuragroup.com',
    initials: 'LG',
    avatarBg: 'bg-[#0284c7]',
    role: 'Member',
    status: 'Active',
    tasksCount: 6,
    joinedDate: 'Abr 2024',
    capacityHours: 42,
    utilizedPercent: 92,
    jobTitle: 'Desarrollador Web Front-End'
  },
  {
    id: 'u-4',
    name: 'Oscar Cerpa',
    email: 'oscar@uhuragroup.com',
    initials: 'OC',
    avatarBg: 'bg-[#f59e0b]',
    role: 'Member',
    status: 'Active',
    tasksCount: 5,
    joinedDate: 'May 2024',
    capacityHours: 42,
    utilizedPercent: 68,
    jobTitle: 'Desarrollador Web Front-End'
  },
  {
    id: 'u-5',
    name: 'Digital Designer',
    email: '',
    initials: 'DD',
    avatarBg: 'bg-[#8b5cf6]',
    role: 'Member',
    status: 'Active',
    tasksCount: 5,
    joinedDate: 'Ene 2024',
    capacityHours: 42,
    utilizedPercent: 84,
    jobTitle: 'Digital Designer'
  },
  {
    id: 'u-6',
    name: 'Simón Vélez',
    email: 'simon@uhuragroup.com',
    initials: 'SV',
    avatarBg: 'bg-[#10b981]',
    role: 'Member',
    status: 'Active',
    tasksCount: 6,
    joinedDate: 'Jun 2024',
    capacityHours: 42,
    utilizedPercent: 86,
    jobTitle: 'Digiops / Trafficker Media'
  },

  // ÁREA CREATIVIDAD
  {
    id: 'u-7',
    name: 'Diego Cadavid',
    email: 'diego@uhuragroup.com',
    initials: 'DC',
    avatarBg: 'bg-[#dc2626]',
    role: 'Admin',
    status: 'Active',
    tasksCount: 9,
    joinedDate: 'Feb 2024',
    capacityHours: 42,
    utilizedPercent: 94,
    jobTitle: 'Creative Strategy Lead'
  },
  {
    id: 'u-8',
    name: 'Sara Rivera',
    email: 'community@uhuragroup.com',
    initials: 'SR',
    avatarBg: 'bg-[#ec4899]',
    role: 'Member',
    status: 'Active',
    tasksCount: 6,
    joinedDate: 'Mar 2024',
    capacityHours: 42,
    utilizedPercent: 78,
    jobTitle: 'Community Manager'
  },
  {
    id: 'u-9',
    name: 'Sara Mar Lagos',
    email: 'sarimar@uhuragroup.com',
    initials: 'SL',
    avatarBg: 'bg-[#f43f5e]',
    role: 'Member',
    status: 'Active',
    tasksCount: 7,
    joinedDate: 'Feb 2024',
    capacityHours: 42,
    utilizedPercent: 91,
    jobTitle: 'Creative Designer'
  },
  {
    id: 'u-10',
    name: 'Camilo Torres',
    email: 'designweb@uhuragroup.com',
    initials: 'CT',
    avatarBg: 'bg-[#6366f1]',
    role: 'Member',
    status: 'Active',
    tasksCount: 6,
    joinedDate: 'Mar 2024',
    capacityHours: 42,
    utilizedPercent: 82,
    jobTitle: 'Creative Designer'
  },
  {
    id: 'u-11',
    name: 'Melisa Gil',
    email: 'melisa@uhuragroup.com',
    initials: 'MG',
    avatarBg: 'bg-[#d946ef]',
    role: 'Member',
    status: 'Active',
    tasksCount: 8,
    joinedDate: 'Ene 2024',
    capacityHours: 42,
    utilizedPercent: 93,
    jobTitle: 'Creative Designer'
  },
  {
    id: 'u-12',
    name: 'Alejandro Florez',
    email: 'alejandro@uhuragroup.com',
    initials: 'AF',
    avatarBg: 'bg-[#06b6d4]',
    role: 'Member',
    status: 'Active',
    tasksCount: 5,
    joinedDate: 'Abr 2024',
    capacityHours: 42,
    utilizedPercent: 85,
    jobTitle: 'Creative Designer'
  },
  {
    id: 'u-13',
    name: 'Esmeralda Duque',
    email: 'esmeralda@uhuragroup.com',
    initials: 'ED',
    avatarBg: 'bg-[#8b5cf6]',
    role: 'Member',
    status: 'Active',
    tasksCount: 7,
    joinedDate: 'Feb 2024',
    capacityHours: 42,
    utilizedPercent: 89,
    jobTitle: 'Content Creator'
  },

  // ÁREA GROWTH
  {
    id: 'u-14',
    name: 'Camilo Vélez',
    email: 'camivelez@uhuragroup.com',
    initials: 'CV',
    avatarBg: 'bg-[#059669]',
    role: 'Admin',
    status: 'Active',
    tasksCount: 6,
    joinedDate: 'Mar 2024',
    capacityHours: 42,
    utilizedPercent: 91,
    jobTitle: 'Growth Manager'
  },
  {
    id: 'u-15',
    name: 'Nayeliz Brunal',
    email: 'nayeliz@uhuragroup.com',
    initials: 'NB',
    avatarBg: 'bg-[#14b8a6]',
    role: 'Member',
    status: 'Active',
    tasksCount: 5,
    joinedDate: 'May 2024',
    capacityHours: 42,
    utilizedPercent: 76,
    jobTitle: 'Digital Content Specialist'
  },
  {
    id: 'u-16',
    name: 'Sebastián Caicedo',
    email: 'juanse@uhuragroup.com',
    initials: 'SC',
    avatarBg: 'bg-[#10b981]',
    role: 'Member',
    status: 'Active',
    tasksCount: 6,
    joinedDate: 'Jul 2024',
    capacityHours: 42,
    utilizedPercent: 95,
    jobTitle: 'Trafficker Media'
  },

  // ÁREA COMERCIAL
  {
    id: 'u-17',
    name: 'Catalina Tejada',
    email: 'catalina@uhuragroup.com',
    initials: 'CT',
    avatarBg: 'bg-[#7c3aed]',
    role: 'Admin',
    status: 'Active',
    tasksCount: 7,
    joinedDate: 'Feb 2024',
    capacityHours: 42,
    utilizedPercent: 88,
    jobTitle: 'Directora Comercial'
  },
  {
    id: 'u-18',
    name: 'Luisa Urazán',
    email: 'luisa@uhuragroup.com',
    initials: 'LU',
    avatarBg: 'bg-[#0284c7]',
    role: 'Member',
    status: 'Active',
    tasksCount: 5,
    joinedDate: 'Feb 2024',
    capacityHours: 42,
    utilizedPercent: 81,
    jobTitle: 'Client Relationship Strategist'
  },

  // ÁREA ADMINISTRATIVA
  {
    id: 'u-19',
    name: 'Laura Salazar',
    email: 'admin@uhuragroup.com',
    initials: 'LS',
    avatarBg: 'bg-[#64748b]',
    role: 'Member',
    status: 'Active',
    tasksCount: 4,
    joinedDate: 'Ene 2024',
    capacityHours: 42,
    utilizedPercent: 72,
    jobTitle: 'Administración'
  }
];

export const initialActivities: ActivityItem[] = [
  {
    id: 'act-1',
    user: {
      name: 'Catalina Tejada',
      initials: 'CT',
      avatarBg: 'bg-[#7c3aed]'
    },
    action: 'adjuntó el entregable de Figma en',
    target: 'Diseño de Banners Promocionales Campaña Q3',
    timeAgo: 'hace 10 minutos'
  },
  {
    id: 'act-2',
    user: {
      name: 'Paola (Lead PM)',
      initials: 'PL',
      avatarBg: 'bg-[#501f92]'
    },
    action: 'actualizó las horas presupuestadas a 8.0h en',
    target: 'Diseño de Banners Promocionales',
    timeAgo: 'hace 25 minutos'
  }
];

export const orbitClientsData: ClientProfile[] = [
  {
    id: 'cli-bambu',
    name: 'BAMBÚ BPO',
    nit: '999999999',
    type: 'Proyecto único',
    healthStatus: 'Saludable',
    portalActive: false,
    projectsCount: 1,
    activeProjectsCount: 1,
    closedProjectsCount: 0,
    averageMarginPercent: null,
    billedCOP: '$0',
    billedInvoicesCount: 0,
    receivableCOP: '$0',
    receivableStatus: 'al día',
    commercialInfo: {
      contactName: 'Mariana Zapata',
      contactRole: 'Coordinadora Comercial',
      contactEmail: 'mariana.zapata@bambubpo.com',
      contactPhone: '+57 (301) 489-2210',
      clientSince: '15 de Julio de 2026',
      brands: ['BAMBÚ BPO']
    },
    behavior: {
      rentabilidad: 35,
      cartera: 100,
      cumplimiento: 80,
      relacion: 40
    },
    projectsHistory: [
      {
        id: 'prj-bam-hist-1',
        name: 'Admin de pauta BAMBÚ BPO',
        tag: 'FIN',
        brand: 'BAMBÚ BPO',
        status: 'Activo',
        quotedValueCOP: '$950.000',
        realMarginPercent: null,
        trafficLight: 'rojo',
        progressPercent: 78
      }
    ]
  },
  {
    id: 'cli-danone',
    name: 'Danone S.A.',
    nit: '860.003.456-2',
    type: 'Fee mensual',
    healthStatus: 'Saludable',
    portalActive: true,
    projectsCount: 2,
    activeProjectsCount: 2,
    closedProjectsCount: 3,
    averageMarginPercent: 42.8,
    billedCOP: '$450.000.000',
    billedInvoicesCount: 12,
    receivableCOP: '$28.500.000',
    receivableStatus: 'al día',
    commercialInfo: {
      contactName: 'Carlos Mendoza',
      contactRole: 'Brand & Growth Director',
      contactEmail: 'carlos.mendoza@danone.com',
      contactPhone: '+57 (310) 902-8314',
      clientSince: '10 de Febrero de 2025',
      brands: ['Danone', 'Activia', 'Bonafont']
    },
    behavior: {
      rentabilidad: 88,
      cartera: 95,
      cumplimiento: 86,
      relacion: 95
    },
    projectsHistory: [
      {
        id: 'prj-dan-hist-1',
        name: 'Fee Parrilla Digital Q3 · Banners & Social',
        tag: 'FEE',
        brand: 'Danone',
        status: 'Activo',
        quotedValueCOP: '$18.500.000',
        realMarginPercent: 44.5,
        trafficLight: 'verde',
        progressPercent: 65
      },
      {
        id: 'prj-dan-hist-2',
        name: 'Campaña Navidad 2026 (Flujo Creativos → Pauta)',
        tag: 'DEV',
        brand: 'Activia',
        status: 'Activo',
        quotedValueCOP: '$45.000.000',
        realMarginPercent: 41.2,
        trafficLight: 'amarillo',
        progressPercent: 30
      }
    ]
  },
  {
    id: 'cli-prisma',
    name: 'Prisma Kiddos',
    nit: '900.876.543-9',
    type: 'Mixto',
    healthStatus: 'Saludable',
    portalActive: true,
    projectsCount: 2,
    activeProjectsCount: 2,
    closedProjectsCount: 1,
    averageMarginPercent: 36.4,
    billedCOP: '$128.000.000',
    billedInvoicesCount: 6,
    receivableCOP: '$0',
    receivableStatus: 'al día',
    commercialInfo: {
      contactName: 'Valeria Restrepo',
      contactRole: 'Directora Digital & E-commerce',
      contactEmail: 'valeria@prismakiddos.com',
      contactPhone: '+57 (315) 771-4402',
      clientSince: '20 de Marzo de 2025',
      brands: ['Prisma Kiddos', 'STEM Labs Kids']
    },
    behavior: {
      rentabilidad: 78,
      cartera: 100,
      cumplimiento: 88,
      relacion: 85
    },
    projectsHistory: [
      {
        id: 'prj-pris-hist-1',
        name: 'Fee Mantenimiento Web Prisma',
        tag: 'FEE',
        brand: 'Prisma Kiddos',
        status: 'Activo',
        quotedValueCOP: '$6.500.000',
        realMarginPercent: 38.0,
        trafficLight: 'verde',
        progressPercent: 40
      },
      {
        id: 'prj-pris-hist-2',
        name: 'E-commerce & Landing STEM (Proyecto Web)',
        tag: 'DEV',
        brand: 'STEM Labs Kids',
        status: 'Activo',
        quotedValueCOP: '$32.000.000',
        realMarginPercent: 35.2,
        trafficLight: 'verde',
        progressPercent: 55
      }
    ]
  },
  {
    id: 'cli-yamaha',
    name: 'Incolmotos Yamaha S.A.',
    nit: '890.900.123-4',
    type: 'Proyecto único',
    healthStatus: 'En Riesgo',
    portalActive: true,
    projectsCount: 2,
    activeProjectsCount: 2,
    closedProjectsCount: 4,
    averageMarginPercent: 28.1,
    billedCOP: '$320.000.000',
    billedInvoicesCount: 8,
    receivableCOP: '$54.000.000',
    receivableStatus: 'en mora',
    commercialInfo: {
      contactName: 'Juan Camilo Vélez',
      contactRole: 'Brand Lead Marketing',
      contactEmail: 'jc.velez@incolmotos-yamaha.com.co',
      contactPhone: '+57 (312) 660-1928',
      clientSince: '05 de Enero de 2024',
      brands: ['Yamaha', 'Yamalube']
    },
    behavior: {
      rentabilidad: 62,
      cartera: 45,
      cumplimiento: 72,
      relacion: 70
    },
    projectsHistory: [
      {
        id: 'prj-yam-hist-1',
        name: 'Yamaha R15 · Campaña Social & Web',
        tag: 'DEV',
        brand: 'Yamaha',
        status: 'Activo',
        quotedValueCOP: '$38.000.000',
        realMarginPercent: 26.5,
        trafficLight: 'amarillo',
        progressPercent: 88
      },
      {
        id: 'prj-yam-hist-2',
        name: 'Yamaha MT-03 · Lanzamiento',
        tag: 'FIN',
        brand: 'Yamaha',
        status: 'Activo',
        quotedValueCOP: '$28.000.000',
        realMarginPercent: 29.8,
        trafficLight: 'verde',
        progressPercent: 45
      }
    ]
  },
  {
    id: 'cli-bancolombia',
    name: 'Bancolombia',
    nit: '890.903.938-8',
    type: 'Proyecto único',
    healthStatus: 'Saludable',
    portalActive: true,
    projectsCount: 1,
    activeProjectsCount: 1,
    closedProjectsCount: 5,
    averageMarginPercent: 45.0,
    billedCOP: '$240.000.000',
    billedInvoicesCount: 4,
    receivableCOP: '$0',
    receivableStatus: 'al día',
    commercialInfo: {
      contactName: 'Andrea Henao',
      contactRole: 'Líder Canales Digitales',
      contactEmail: 'ahenao@bancolombia.com.co',
      contactPhone: '+57 (300) 554-1189',
      clientSince: '12 de Agosto de 2024',
      brands: ['Bancolombia', 'Nequi']
    },
    behavior: {
      rentabilidad: 92,
      cartera: 100,
      cumplimiento: 94,
      relacion: 68
    },
    projectsHistory: [
      {
        id: 'prj-bco-hist-1',
        name: 'Rediseño App Móvil & Microinteracciones',
        tag: 'DEV',
        brand: 'Bancolombia',
        status: 'Activo',
        quotedValueCOP: '$60.000.000',
        realMarginPercent: 45.0,
        trafficLight: 'verde',
        progressPercent: 70
      }
    ]
  },
  {
    id: 'cli-exito',
    name: 'Grupo Éxito',
    nit: '890.900.608-9',
    type: 'Fee mensual',
    healthStatus: 'Saludable',
    portalActive: true,
    projectsCount: 2,
    activeProjectsCount: 2,
    closedProjectsCount: 6,
    averageMarginPercent: 39.2,
    billedCOP: '$195.000.000',
    billedInvoicesCount: 7,
    receivableCOP: '$12.000.000',
    receivableStatus: 'al día',
    commercialInfo: {
      contactName: 'Felipe Gómez',
      contactRole: 'Director E-commerce',
      contactEmail: 'fgomez@grupo-exito.com',
      contactPhone: '+57 (318) 402-9912',
      clientSince: '14 de Junio de 2024',
      brands: ['Éxito', 'Carulla']
    },
    behavior: {
      rentabilidad: 82,
      cartera: 90,
      cumplimiento: 85,
      relacion: 90
    },
    projectsHistory: [
      {
        id: 'prj-ext-hist-1',
        name: 'Fee Estrategia Digital Q3 & Pauta Retail',
        tag: 'FEE',
        brand: 'Éxito',
        status: 'Activo',
        quotedValueCOP: '$22.000.000',
        realMarginPercent: 40.1,
        trafficLight: 'verde',
        progressPercent: 60
      },
      {
        id: 'prj-ext-hist-2',
        name: 'Campaña Black Friday & Cyberlunes 2026',
        tag: 'DEV',
        brand: 'Carulla',
        status: 'Activo',
        quotedValueCOP: '$35.000.000',
        realMarginPercent: 38.5,
        trafficLight: 'verde',
        progressPercent: 25
      }
    ]
  },
  {
    id: 'cli-rockandride',
    name: 'Rock and Ride S.A.S.',
    nit: '901.442.890-1',
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
        quotedValueCOP: '$48.000.000',
        realMarginPercent: 44.0,
        trafficLight: 'verde',
        progressPercent: 35
      }
    ]
  }
];
