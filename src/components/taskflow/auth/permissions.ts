import {
  AppAction,
  AccessScope,
  OrbitAccessLevel,
  OrbitModule,
  OrbitView,
  UserItem,
  NewBusinessOpportunity
} from '../types';

/**
 * Regla de autorización por módulo para un nivel de acceso específico.
 */
export interface ModuleAccessRule {
  allowedActions: AppAction[];
  scope: AccessScope;
}

/**
 * MATRIZ CENTRAL DE ACCESO POR MÓDULO (Fuente única de verdad RBAC)
 * Mapeo canónico: OrbitAccessLevel × OrbitModule -> ModuleAccessRule | null
 * 
 * Si un módulo no está definido para un nivel de acceso, el acceso es denegado
 * de forma estricta (no se visualiza en sidebar ni se autoriza en navegación directa).
 */
export const ROLE_PERMISSIONS_MATRIX: Record<
  OrbitAccessLevel,
  Partial<Record<OrbitModule, ModuleAccessRule>>
> = {
  // A. COLABORADORES OPERATIVOS
  collaborator: {
    'mi-dia': { allowedActions: ['view', 'edit'], scope: 'own' },
    'proyectos': { allowedActions: ['view'], scope: 'assigned' },
    'tareas': { allowedActions: ['view', 'edit'], scope: 'assigned' },
    'timesheets': { allowedActions: ['view', 'create', 'edit'], scope: 'own' },
    'capacidad': { allowedActions: ['view'], scope: 'own' },
    'la-colonia': { allowedActions: ['view', 'edit'], scope: 'own' }
    // Sin acceso a Clientes, New Business, Catálogo ni Administración
  },

  // B. LÍDERES DE ÁREA (Técnico / Creativo / Growth)
  leader: {
    'mi-dia': { allowedActions: ['view', 'edit'], scope: 'team' },
    'proyectos': { allowedActions: ['view', 'create', 'edit'], scope: 'team' },
    'tareas': { allowedActions: ['view', 'create', 'edit'], scope: 'team' },
    'timesheets': { allowedActions: ['view', 'create', 'edit'], scope: 'team' },
    'capacidad': { allowedActions: ['view'], scope: 'team' },
    'clientes': { allowedActions: ['view'], scope: 'team' },
    'new-business': { allowedActions: ['view', 'edit'], scope: 'team' },
    'plantillas-producto': { allowedActions: ['view'], scope: 'all' },
    'la-colonia': { allowedActions: ['view', 'edit'], scope: 'own' }
    // Sin acceso a Administración ni Finanzas globales
  },

  // C. CLIENT RELATIONSHIP STRATEGIST (Gestión de cuentas)
  client_relationship: {
    'mi-dia': { allowedActions: ['view', 'edit'], scope: 'accounts' },
    'proyectos': { allowedActions: ['view', 'edit'], scope: 'accounts' },
    'tareas': { allowedActions: ['view', 'create', 'edit'], scope: 'accounts' },
    'timesheets': { allowedActions: ['view', 'create', 'edit'], scope: 'own' },
    'capacidad': { allowedActions: ['view'], scope: 'accounts' },
    'clientes': { allowedActions: ['view', 'create', 'edit'], scope: 'accounts' },
    'new-business': { allowedActions: ['view', 'create'], scope: 'accounts' },
    'plantillas-producto': { allowedActions: ['view'], scope: 'all' },
    'la-colonia': { allowedActions: ['view', 'edit'], scope: 'own' }
  },

  // D. DIRECTORA COMERCIAL
  commercial: {
    'mi-dia': { allowedActions: ['view', 'edit'], scope: 'own' },
    'proyectos': { allowedActions: ['view'], scope: 'all' },
    'tareas': { allowedActions: ['view'], scope: 'assigned' },
    'timesheets': { allowedActions: ['view', 'create', 'edit'], scope: 'own' },
    'clientes': { allowedActions: ['view', 'create', 'edit'], scope: 'all' },
    'new-business': { allowedActions: ['view', 'create', 'edit', 'approve'], scope: 'all' },
    'plantillas-producto': { allowedActions: ['view'], scope: 'all' },
    'la-colonia': { allowedActions: ['view', 'edit'], scope: 'own' }
    // Sin acceso a Matriz de Capacidad interna ni Administración
  },

  // E. ADMINISTRATIVA (Vivian / Fiscal / Facturación)
  administrative: {
    'mi-dia': { allowedActions: ['view', 'edit'], scope: 'own' },
    'proyectos': { allowedActions: ['view'], scope: 'all' },
    'tareas': { allowedActions: ['view'], scope: 'assigned' },
    'timesheets': { allowedActions: ['view', 'create', 'edit'], scope: 'all' },
    'clientes': { allowedActions: ['view', 'edit'], scope: 'all' },
    'new-business': { allowedActions: ['view', 'edit'], scope: 'all' },
    'la-colonia': { allowedActions: ['view', 'edit'], scope: 'own' }
    // Sin acceso a Catálogo de Servicios, Capacidad ni Administración de sistema
  },

  // F. CEO / DIRECCIÓN (Lectura transversal - No superusuario operativo)
  executive: {
    'mi-dia': { allowedActions: ['view'], scope: 'all' },
    'proyectos': { allowedActions: ['view'], scope: 'all' },
    'tareas': { allowedActions: ['view'], scope: 'all' },
    'timesheets': { allowedActions: ['view'], scope: 'all' },
    'capacidad': { allowedActions: ['view'], scope: 'all' },
    'clientes': { allowedActions: ['view'], scope: 'all' },
    'new-business': { allowedActions: ['view'], scope: 'all' },
    'plantillas-producto': { allowedActions: ['view'], scope: 'all' },
    'la-colonia': { allowedActions: ['view', 'edit'], scope: 'own' },
    'administracion': { allowedActions: ['view'], scope: 'all' }
  },

  // G. ADMIN DE SISTEMA
  system_admin: {
    'mi-dia': { allowedActions: ['view', 'edit'], scope: 'own' },
    'proyectos': { allowedActions: ['view', 'create', 'edit', 'administer'], scope: 'all' },
    'tareas': { allowedActions: ['view', 'create', 'edit', 'administer'], scope: 'all' },
    'timesheets': { allowedActions: ['view', 'administer'], scope: 'all' },
    'capacidad': { allowedActions: ['view', 'administer'], scope: 'all' },
    'clientes': { allowedActions: ['view', 'create', 'edit', 'administer'], scope: 'all' },
    'new-business': { allowedActions: ['view', 'administer'], scope: 'all' },
    'plantillas-producto': { allowedActions: ['view'], scope: 'all' },
    'la-colonia': { allowedActions: ['view', 'edit'], scope: 'own' },
    'administracion': { allowedActions: ['view', 'create', 'edit', 'administer'], scope: 'all' }
  },

  // ESTADO TRANSITORIO: 'pending'
  // IMPORTANTE: NO es un octavo nivel funcional de la matriz RBAC.
  // Representa un estado de usuario en onboarding / sin perfil asignado.
  // Política: DENY-BY-DEFAULT estricto. Solo se concede acceso mínimo seguro a su propio "Mi Día"
  // para consulta personal básica, sin acciones sensibles ni acceso a datos operativos ni clientes.
  pending: {
    'mi-dia': { allowedActions: ['view'], scope: 'own' }
  }
};

/**
 * Mapeo de vistas de la UI (OrbitView) a módulos canónicos de Orbit (OrbitModule).
 */
export function viewToModule(view: OrbitView | string): OrbitModule {
  switch (view) {
    case 'mi-dia':
    case 'dashboard':
      return 'mi-dia';
    case 'proyectos':
      return 'proyectos';
    case 'tareas':
      return 'tareas';
    case 'timesheets':
      return 'timesheets';
    case 'capacidad':
      return 'capacidad';
    case 'clientes':
      return 'clientes';
    case 'new-business':
    case 'cotizador':
      return 'new-business';
    case 'plantillas-producto':
      return 'plantillas-producto';
    case 'la-colonia':
    case 'el-muro':
      return 'la-colonia';
    case 'usuarios':
    case 'config-roles':
    case 'config-permisos':
    case 'reportes':
    case 'nova-ia':
    case 'portal-cliente':
    case 'finanzas':
    default:
      return 'administracion';
  }
}

/**
 * Resuelve el nivel de acceso efectivo del usuario.
 * Si el usuario no tiene accessLevel explícito, retorna 'pending' para evitar permisos no autorizados.
 */
export function getUserAccessLevel(user: UserItem | null | undefined): OrbitAccessLevel {
  if (!user) return 'pending';
  return user.accessLevel || 'pending';
}

/**
 * Determina si un usuario tiene acceso de lectura (view) a un módulo de Orbit.
 * Usado por el Sidebar para visibilidad y por los Guards de navegación.
 */
export function canAccessModule(
  user: UserItem | null | undefined,
  moduleOrView: OrbitModule | OrbitView | string
): boolean {
  if (!user) return false;
  const accessLevel = getUserAccessLevel(user);
  const targetModule = typeof moduleOrView === 'string' && !isOrbitModule(moduleOrView)
    ? viewToModule(moduleOrView)
    : (moduleOrView as OrbitModule);

  const rule = ROLE_PERMISSIONS_MATRIX[accessLevel]?.[targetModule];
  if (!rule) return false;
  return rule.allowedActions.includes('view');
}

function isOrbitModule(val: string): val is OrbitModule {
  const modules: OrbitModule[] = [
    'mi-dia',
    'proyectos',
    'tareas',
    'timesheets',
    'capacidad',
    'clientes',
    'new-business',
    'plantillas-producto',
    'la-colonia',
    'administracion'
  ];
  return modules.includes(val as OrbitModule);
}

/**
 * Validador atómico de permisos.
 * Verifica si un usuario puede ejecutar una acción específica en un módulo dado.
 */
export function can(
  user: UserItem | null | undefined,
  action: AppAction,
  module: OrbitModule,
  context?: {
    resourceOwnerId?: string;
    assignedUserIds?: string[];
    isTechLead?: boolean;
  }
): boolean {
  if (!user) return false;
  const accessLevel = getUserAccessLevel(user);
  const rule = ROLE_PERMISSIONS_MATRIX[accessLevel]?.[module];

  if (!rule) return false;
  if (!rule.allowedActions.includes(action)) return false;

  // Validación de scopes
  switch (rule.scope) {
    case 'all':
      return true;

    case 'own':
      if (!context?.resourceOwnerId) return true; // Si no hay contexto de recurso, aplica permiso general
      return context.resourceOwnerId === user.id;

    case 'assigned':
      if (context?.assignedUserIds && context.assignedUserIds.length > 0) {
        return context.assignedUserIds.includes(user.id);
      }
      if (context?.resourceOwnerId) {
        return context.resourceOwnerId === user.id;
      }
      return true;

    case 'team':
      // Líderes gestionan los recursos de su equipo o donde son responsables técnicos
      if (context?.isTechLead !== undefined) {
        return context.isTechLead;
      }
      return true;

    case 'accounts':
      return true;

    default:
      return false;
  }
}

/* =========================================================================
   REGLAS ESPECÍFICAS DE SUB-ÁREAS SENSIBLES (Granularidad de Dominio)
   ========================================================================= */

/**
 * Regla de Catálogo Maestro:
 * - Únicamente Product Lead (gobernanza de producto) puede crear, editar o versionar el catálogo maestro.
 * - Los demás líderes y comerciales pueden consultar y clonar plantillas a New Business, pero no editar el master.
 * - System Admin gestiona configuración técnica del sistema, sin gobernanza de contenido de servicios.
 */
export function canEditMasterCatalog(user: UserItem | null | undefined): boolean {
  if (!user) return false;
  const accessLevel = getUserAccessLevel(user);
  if (accessLevel === 'leader' && (user.professionalRole === 'Product Lead' || user.officialRole === 'Product Lead')) {
    return true;
  }
  return false;
}

/**
 * Permiso para usar/clonar plantillas del catálogo hacia New Business.
 */
export function canUseCatalogTemplates(user: UserItem | null | undefined): boolean {
  if (!user) return false;
  const accessLevel = getUserAccessLevel(user);
  return ['leader', 'commercial', 'executive', 'system_admin'].includes(accessLevel);
}

/**
 * Reglas de New Business:
 * 1. Scoping Técnico (Alcance & Backlog, horas y roles):
 *    - Líderes (cuando son líderes técnicos de la oportunidad o no hay líder asignado).
 *    - Directora Comercial.
 *    - Otros perfiles no pueden modificar el backlog técnico.
 */
export function canEditOpportunityScoping(
  user: UserItem | null | undefined,
  opportunity?: NewBusinessOpportunity
): boolean {
  if (!user) return false;
  const accessLevel = getUserAccessLevel(user);
  if (accessLevel === 'commercial') return true;
  if (accessLevel === 'leader') {
    if (!opportunity) return true;
    const isTechLead =
      !opportunity.leadUserName ||
      opportunity.leadUserName === user.name;
    return isTechLead;
  }
  return false;
}

/**
 * 2. Condiciones Comerciales & Cotización Económica:
 *    - Exclusivo de Directora Comercial ('commercial').
 *    - CEO / Executive tiene visibilidad transversal de lectura, sin edición financiera.
 *    - Líderes técnicos y colaboradores NO pueden editar márgenes ni pricing.
 */
export function canEditOpportunityFinancials(
  user: UserItem | null | undefined
): boolean {
  if (!user) return false;
  return getUserAccessLevel(user) === 'commercial';
}

/**
 * 3. Aprobación Comercial y SOW Formal:
 *    - Exclusivo de Directora Comercial ('commercial').
 */
export function canApproveOpportunityQuote(
  user: UserItem | null | undefined
): boolean {
  if (!user) return false;
  return getUserAccessLevel(user) === 'commercial';
}

/**
 * 4. Formalización y Checklist Administrativo / Fiscal (RUT, NIT, Alegra):
 *    - Administrativa ('administrative') y Comercial ('commercial').
 *    - Lectura para Executive.
 */
export function canEditOpportunityFormalization(
  user: UserItem | null | undefined
): boolean {
  if (!user) return false;
  const level = getUserAccessLevel(user);
  return level === 'administrative' || level === 'commercial';
}

/**
 * Regla de Time Tracking:
 * - Cada colaborador solo puede registrar o editar sus propios logs.
 * - Ningún rol (ni líderes) puede registrar horas en tiempo real a nombre de otro.
 */
export function canLogTimeForUser(
  currentUser: UserItem | null | undefined,
  targetUserId: string
): boolean {
  if (!currentUser) return false;
  if (currentUser.id === targetUserId) return true;
  return getUserAccessLevel(currentUser) === 'system_admin';
}
