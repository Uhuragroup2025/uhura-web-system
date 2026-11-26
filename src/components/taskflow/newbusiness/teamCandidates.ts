import type { UserItem, QuoteProposal } from '../types';
import { STANDARD_UHURA_ROLES } from '../types';

// Usa el equipo canónico recibido; excluye registros de prueba identificados en su identidad.
export const isEligibleTeamMember = (user: UserItem): boolean => user.status === 'Active' &&
  !/(^|[\s._@-])(demo|qa|legacy|test|prueba)(?=$|[\s._@-])/i.test(`${user.id} ${user.name} ${user.email}`);

const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const matchesQuotedRole = (user: UserItem, role: string): boolean => {
  const normTarget = normalized(role);
  const userRoles = [
    ...(user.officialRoles || []),
    ...(user.professionalRoles || []),
    user.officialRole,
    user.professionalRole,
    user.role,
    user.jobTitle
  ].filter(Boolean) as string[];

  const canonical = new Set(STANDARD_UHURA_ROLES.map((r) => normalized(r)));
  return userRoles.some((assigned) => {
    const normAssigned = normalized(assigned);
    if (normAssigned === normTarget) return true;
    // Dos roles oficiales distintos nunca son equivalentes (Creative Designer ≠ Digital Designer,
    // Content Creator ≠ Digital Content Specialist). Las equivalencias de abajo son solo para
    // nombres informales o legados.
    if (canonical.has(normAssigned) && canonical.has(normTarget)) return false;
    if (normTarget.includes('front') && normAssigned.includes('front')) return true;
    if ((normTarget.includes('design') || normTarget.includes('disen')) && (normAssigned.includes('design') || normAssigned.includes('disen'))) return true;
    if (normTarget.includes('product') && normAssigned.includes('product')) return true;
    if (normTarget.includes('content') && (normAssigned.includes('content') || normAssigned.includes('redac'))) return true;
    if (normTarget.includes('comercial') && normAssigned.includes('comercial')) return true;
    if (normTarget.includes('trafficker') && normAssigned.includes('trafficker')) return true;
    if (normTarget.includes('community') && normAssigned.includes('community')) return true;
    if (normTarget.includes('growth') && normAssigned.includes('growth')) return true;
    if (normTarget.includes('client') && normAssigned.includes('client')) return true;
    return false;
  });
};

/**
 * Roles afines (19 Nov 2026, acordado con Dirección): roles distintos pero parecidos, cuyas personas
 * pueden tomar tareas del otro. Es una regla por ROL, no por persona. Hoy: Digital Designer ↔ Front-End
 * Dev (Laura ↔ Oscar). Fuera de estos grupos, otro rol es «cubre otro rol» (p. ej. Laura en una tarea
 * de Trafficker o de Comercial). En backend es una tabla que mantiene Administración.
 */
export const AFFINE_ROLE_GROUPS: string[][] = [
  ['Digital Designer', 'Front-End Dev']
];

export const areAffineRoles = (a: string, b: string): boolean => {
  const na = normalized(a);
  const nb = normalized(b);
  return na !== nb && AFFINE_ROLE_GROUPS.some((g) => g.some((r) => normalized(r) === na) && g.some((r) => normalized(r) === nb));
};

/** ¿La persona tiene un rol afín al pedido? (su rol oficial o profesional está en el mismo grupo) */
export const hasAffineRole = (user: UserItem, role: string): boolean =>
  [user.officialRole, user.professionalRole, ...(user.officialRoles || []), ...(user.professionalRoles || [])]
    .filter(Boolean)
    .some((r) => areAffineRoles(r as string, role));

export const findBestCandidateForRole = (
  role: string,
  users: UserItem[],
  proposedHours?: Map<string, number>
): UserItem | null => {
  const activeEligible = users.filter(isEligibleTeamMember);
  // Personas del rol cotizado; si un rol lo tienen varias (p. ej. 3 Creative Designer), gana la de
  // menor ocupación. Nunca alguien de otro rol (Laura no reemplaza a un Trafficker ni a Comercial).
  const sameRole = activeEligible.filter((u) => matchesQuotedRole(u, role));
  // Rol afín (Digital Designer ↔ Front-End Dev): solo si no hay nadie del rol o todos están llenos
  const affine = activeEligible.filter((u) => !matchesQuotedRole(u, role) && hasAffineRole(u, role));

  // Ocupación = % real próximo (`withUpcomingUtilization`) + horas ya propuestas en este alcance
  const load = (u: UserItem) => {
    const util = typeof u.utilizedPercent === 'number' && Number.isFinite(u.utilizedPercent) ? u.utilizedPercent : 50;
    const extra = proposedHours ? (proposedHours.get(u.id) || 0) : 0;
    return util + (u.capacityHours && u.capacityHours > 0 ? (extra / u.capacityHours) * 100 : extra);
  };
  const byLoad = (list: UserItem[]) => [...list].sort((a, b) => load(a) - load(b) || a.name.localeCompare(b.name));

  const bestSame = byLoad(sameRole)[0];
  const bestAffine = byLoad(affine)[0];
  if (bestSame && (load(bestSame) < 100 || !bestAffine || load(bestAffine) >= 85)) return bestSame;
  return bestAffine || bestSame || null;
};

export const searchActiveTeam = (users: UserItem[], query: string): UserItem[] => {
  const term = query.trim().toLocaleLowerCase();
  return term ? users.filter(isEligibleTeamMember).filter((user) =>
    [user.name, user.email, user.jobTitle, user.officialRole, user.professionalRole,
      ...(user.officialRoles || []), ...(user.professionalRoles || [])].some((value) => value?.toLocaleLowerCase().includes(term))).slice(0, 5) : [];
};

// Elegibilidad visual basada en Access Levels existentes; no otorga permisos nuevos.
// Exclusión solicitada para Scoping; conserva el perfil canónico y sus permisos.
// Responsables del alcance = líderes de área (o dirección/administración). Comercial y Client
// Relationship van en «Responsable comercial», no aquí: así «Solución & Scoping» y «Comercial
// estrella» quedan alineados con lo que se asignó al crear el negocio.
export const isEligibleScopingLeader = (user: UserItem): boolean => user.id !== 'u-19' && isEligibleTeamMember(user) &&
  ['leader', 'executive', 'system_admin'].includes(user.accessLevel || 'pending');

export const serviceValidationMessages = (service: { weeks: string }): string[] => {
  const weeks = Number(service.weeks);
  return [
    ...(!service.weeks.trim() || !Number.isFinite(weeks) || weeks < 1 ? ['Define la duración estimada del servicio.'] : [])
  ];
};

export const isScopeReadyForReview = (
  quote: QuoteProposal,
  services: { weeks: string; saved?: boolean }[]
): boolean => {
  const weeks = Number(quote.estimatedWeeks ?? quote.financialConfig?.projectDurationWeeks);
  // La presentación es opcional (25 Nov 2026): un alcance de solo horas no necesita PPT.
  return Number.isFinite(weeks) && weeks >= 1 && quote.totalHoursRollup > 0 &&
    quote.deliverables.some((deliverable) => deliverable.backlogItems.some((activity) => activity.estimatedHours > 0)) &&
    services.length > 0 &&
    services.every((service) => service.saved === true && serviceValidationMessages(service).length === 0);
};

// Sugerencias del prototipo: según rol y menor carga (mayor capacidad disponible).
export const suggestActivityOwners = (
  deliverables: QuoteProposal['deliverables'],
  users: UserItem[],
  existing: QuoteProposal['deliverables'] = []
): QuoteProposal['deliverables'] => {
  const proposed = new Map<string, number>();
  for (const activity of [...existing, ...deliverables].flatMap((item) => item.backlogItems)) {
    if (activity.suggestedUserId) proposed.set(activity.suggestedUserId, (proposed.get(activity.suggestedUserId) || 0) + activity.estimatedHours);
  }

  return deliverables.map((deliverable) => ({
    ...deliverable,
    backlogItems: deliverable.backlogItems.map((activity) => {
      if (activity.suggestedUserId) return activity;
      const candidate = findBestCandidateForRole(activity.roleName, users, proposed);
      if (!candidate) return activity;
      proposed.set(candidate.id, (proposed.get(candidate.id) || 0) + activity.estimatedHours);
      return { ...activity, suggestedUserId: candidate.id, suggestedUserName: candidate.name };
    })
  }));
};

export const effectiveAssigneeRole = (user: UserItem, currentRole: string): string => {
  if (matchesQuotedRole(user, currentRole)) return currentRole;
  return user.officialRole || user.professionalRole || user.officialRoles?.[0] || user.professionalRoles?.[0] || user.jobTitle || user.role || currentRole;
};

export const getScopeWeeks = (quote: QuoteProposal, services: { weeks: string }[]): number => {
  if (!services.length) return Number(quote.estimatedWeeks ?? quote.financialConfig?.projectDurationWeeks) || 0;
  return Math.max(0, ...services.map((service) => Number.isFinite(Number(service.weeks)) && Number(service.weeks) >= 1 ? Number(service.weeks) : 0));
};

// ── Líder operativo sugerido por área del servicio ─────────────────────────────
// Producto Digital → Product Lead · Creativo → Creative Strategy Lead · Growth → Growth Manager.
export type ServiceArea = 'producto' | 'creativo' | 'growth';

const AREA_LEAD_ROLE: Record<ServiceArea, string> = {
  producto: 'Product Lead',
  creativo: 'Creative Strategy Lead',
  growth: 'Growth Manager'
};

/** Área a la que pertenece cada rol cotizable (para servicios que no vienen del catálogo). */
const ROLE_AREA: Record<string, ServiceArea> = {
  productlead: 'producto',
  frontenddev: 'producto',
  digitaldesigner: 'producto',
  digiopsspecialist: 'producto',
  creativestrategylead: 'creativo',
  creativedesigner: 'creativo',
  contentcreator: 'creativo',
  digitalcontentspecialist: 'creativo',
  communitymanager: 'creativo',
  growthmanager: 'growth',
  traffickermedia: 'growth'
};

export const areaFromLabel = (label?: string | null): ServiceArea | null => {
  const n = normalized(label || '');
  if (!n) return null;
  if (n.includes('product')) return 'producto';
  if (n.includes('creativ')) return 'creativo';
  if (n.includes('growth')) return 'growth';
  return null;
};

/**
 * Área del servicio: la del catálogo (por nombre) y, si no aparece, el área de los roles
 * con más horas en sus actividades (sin contar Client Relationship ni Comercial).
 */
export const resolveServiceArea = (params: {
  serviceName: string;
  catalog: { name: string; area: string }[];
  activities: { roleName: string; estimatedHours: number }[];
}): ServiceArea | null => {
  // Sin el paréntesis: los servicios por unidad cambian de nombre («× 2 mails» vs «por mail»)
  const base = (v: string) => normalized(v.replace(/\([^)]*\)/g, ''));
  const name = normalized(params.serviceName);
  const nameBase = base(params.serviceName);
  const fromCatalog = params.catalog
    .filter((s) => name.startsWith(normalized(s.name)) || normalized(s.name).startsWith(name) || (nameBase.length > 3 && base(s.name) === nameBase))
    .sort((a, b) => b.name.length - a.name.length)[0];
  const catalogArea = areaFromLabel(fromCatalog?.area);
  if (catalogArea) return catalogArea;

  const hoursByArea = new Map<ServiceArea, number>();
  params.activities.forEach((a) => {
    const area = ROLE_AREA[normalized(a.roleName)];
    if (area) hoursByArea.set(area, (hoursByArea.get(area) || 0) + (a.estimatedHours || 0));
  });
  const top = [...hoursByArea.entries()].sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : null;
};

/** Líder del área: prefiere a los líderes asignados a el negocio; si no, cualquier activo con ese rol. */
export const leadForArea = (area: ServiceArea | null, users: UserItem[], preferredIds: string[] = []): UserItem | null => {
  if (!area) return null;
  const role = AREA_LEAD_ROLE[area];
  const candidates = users.filter((u) => isEligibleTeamMember(u) && matchesQuotedRole(u, role));
  return candidates.find((u) => preferredIds.includes(u.id)) || candidates[0] || null;
};
