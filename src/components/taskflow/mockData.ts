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
    followers: ['Paola (Lead PM)'],
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
    followers: ['Andrés Ríos'],
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

export const initialUsers: UserItem[] = [
  {
    id: 'u-1',
    name: 'Ana María Giraldo',
    email: 'anamaria@uhuragroup.com',
    initials: 'AM',
    avatarBg: 'bg-[#501f92]',
    role: 'Admin',
    status: 'Active',
    tasksCount: 6,
    joinedDate: 'Ene 2024',
    capacityHours: 40,
    utilizedPercent: 80,
    jobTitle: 'CEO'
  },
  {
    id: 'u-2',
    name: 'Paola Londoño',
    email: 'paola@uhuragroup.com',
    initials: 'PL',
    avatarBg: 'bg-[#501f92]',
    role: 'Admin',
    status: 'Active',
    tasksCount: 8,
    joinedDate: 'Ene 2024',
    capacityHours: 40,
    utilizedPercent: 85,
    jobTitle: 'Product Lead'
  },
  {
    id: 'u-3',
    name: 'Luisa Urazán',
    email: 'luisa@uhuragroup.com',
    initials: 'LU',
    avatarBg: 'bg-[#0284c7]',
    role: 'Member',
    status: 'Active',
    tasksCount: 5,
    joinedDate: 'Feb 2024',
    capacityHours: 40,
    utilizedPercent: 78,
    jobTitle: 'Client Relationship'
  },
  {
    id: 'u-4',
    name: 'Catalina Tejada',
    email: 'catalina@uhuragroup.com',
    initials: 'CT',
    avatarBg: 'bg-[#7c3aed]',
    role: 'Admin',
    status: 'Active',
    tasksCount: 7,
    joinedDate: 'Feb 2024',
    capacityHours: 40,
    utilizedPercent: 82,
    jobTitle: 'Directora Comercial'
  },
  {
    id: 'u-5',
    name: 'Camilo Vélez',
    email: 'camilo@uhuragroup.com',
    initials: 'CV',
    avatarBg: 'bg-[#059669]',
    role: 'Admin',
    status: 'Active',
    tasksCount: 6,
    joinedDate: 'Mar 2024',
    capacityHours: 40,
    utilizedPercent: 76,
    jobTitle: 'Director de Growth'
  },
  {
    id: 'u-6',
    name: 'Diego',
    email: 'diego@uhuragroup.com',
    initials: 'DG',
    avatarBg: 'bg-[#dc2626]',
    role: 'Admin',
    status: 'Active',
    tasksCount: 9,
    joinedDate: 'Feb 2024',
    capacityHours: 40,
    utilizedPercent: 88,
    jobTitle: 'Líder Creativo'
  },
  {
    id: 'u-7',
    name: 'Laura Gómez',
    email: 'laura.g@uhuragroup.com',
    initials: 'LG',
    avatarBg: 'bg-[#0284c7]',
    role: 'Member',
    status: 'Active',
    tasksCount: 6,
    joinedDate: 'Abr 2024',
    capacityHours: 40,
    utilizedPercent: 84,
    jobTitle: 'Frontend Developer'
  },
  {
    id: 'u-8',
    name: 'Oscar Cerpa',
    email: 'oscar@uhuragroup.com',
    initials: 'OC',
    avatarBg: 'bg-[#f59e0b]',
    role: 'Member',
    status: 'Active',
    tasksCount: 5,
    joinedDate: 'May 2024',
    capacityHours: 40,
    utilizedPercent: 80,
    jobTitle: 'Full Stack Developer'
  },
  {
    id: 'u-9',
    name: 'Simón Vélez',
    email: 'simon@uhuragroup.com',
    initials: 'SV',
    avatarBg: 'bg-[#10b981]',
    role: 'Member',
    status: 'Active',
    tasksCount: 4,
    joinedDate: 'Jun 2024',
    capacityHours: 40,
    utilizedPercent: 72,
    jobTitle: 'Trafficker'
  },
  {
    id: 'u-10',
    name: 'Sebastián Caicedo',
    email: 'sebastian@uhuragroup.com',
    initials: 'SC',
    avatarBg: 'bg-[#10b981]',
    role: 'Member',
    status: 'Active',
    tasksCount: 5,
    joinedDate: 'Jul 2024',
    capacityHours: 40,
    utilizedPercent: 75,
    jobTitle: 'Trafficker'
  },
  {
    id: 'u-11',
    name: 'Sara Rivera',
    email: 'sara.r@uhuragroup.com',
    initials: 'SR',
    avatarBg: 'bg-[#ec4899]',
    role: 'Member',
    status: 'Active',
    tasksCount: 6,
    joinedDate: 'Mar 2024',
    capacityHours: 40,
    utilizedPercent: 77,
    jobTitle: 'Community Manager'
  },
  {
    id: 'u-12',
    name: 'Esmeralda Duque',
    email: 'esmeralda@uhuragroup.com',
    initials: 'ED',
    avatarBg: 'bg-[#8b5cf6]',
    role: 'Member',
    status: 'Active',
    tasksCount: 7,
    joinedDate: 'Feb 2024',
    capacityHours: 40,
    utilizedPercent: 81,
    jobTitle: 'Content Strategist'
  },
  {
    id: 'u-13',
    name: 'Melisa Gil',
    email: 'melisa@uhuragroup.com',
    initials: 'MG',
    avatarBg: 'bg-[#d946ef]',
    role: 'Member',
    status: 'Active',
    tasksCount: 8,
    joinedDate: 'Ene 2024',
    capacityHours: 40,
    utilizedPercent: 86,
    jobTitle: 'Creative Designer'
  },
  {
    id: 'u-14',
    name: 'Camilo Torres',
    email: 'camilo.t@uhuragroup.com',
    initials: 'CT',
    avatarBg: 'bg-[#6366f1]',
    role: 'Member',
    status: 'Active',
    tasksCount: 6,
    joinedDate: 'Mar 2024',
    capacityHours: 40,
    utilizedPercent: 79,
    jobTitle: 'Creative Designer'
  },
  {
    id: 'u-15',
    name: 'Sarimar Lagos',
    email: 'sarimar@uhuragroup.com',
    initials: 'SL',
    avatarBg: 'bg-[#f43f5e]',
    role: 'Member',
    status: 'Active',
    tasksCount: 7,
    joinedDate: 'Feb 2024',
    capacityHours: 40,
    utilizedPercent: 83,
    jobTitle: 'Creative Designer'
  },
  {
    id: 'u-16',
    name: 'Laura Salazar',
    email: 'laura.s@uhuragroup.com',
    initials: 'LS',
    avatarBg: 'bg-[#64748b]',
    role: 'Member',
    status: 'Active',
    tasksCount: 4,
    joinedDate: 'Ene 2024',
    capacityHours: 40,
    utilizedPercent: 70,
    jobTitle: 'Coordinadora Administrativa'
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
    type: 'Proyecto',
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
      volumen: 25,
      recurrencia: 40,
      salud: 85,
      cumplimiento: 80,
      facturacion: 20
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
    type: 'Fee Recurrente',
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
      volumen: 90,
      recurrencia: 95,
      salud: 92,
      cumplimiento: 86,
      facturacion: 94
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
      volumen: 70,
      recurrencia: 85,
      salud: 90,
      cumplimiento: 88,
      facturacion: 75
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
    type: 'Proyecto',
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
      volumen: 85,
      recurrencia: 70,
      salud: 65,
      cumplimiento: 72,
      facturacion: 80
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
    type: 'Proyecto',
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
      volumen: 75,
      recurrencia: 68,
      salud: 95,
      cumplimiento: 94,
      facturacion: 88
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
    type: 'Fee Recurrente',
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
      volumen: 88,
      recurrencia: 90,
      salud: 89,
      cumplimiento: 85,
      facturacion: 84
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
  }
];
