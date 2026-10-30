import type { UserItem, QuoteProposal } from '../types';

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

  return userRoles.some((assigned) => {
    const normAssigned = normalized(assigned);
    if (normAssigned === normTarget) return true;
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

export const findBestCandidateForRole = (
  role: string,
  users: UserItem[],
  proposedHours?: Map<string, number>
): UserItem | null => {
  const activeEligible = users.filter(isEligibleTeamMember);
  const matching = activeEligible.filter((u) => matchesQuotedRole(u, role));
  const pool = matching.length > 0 ? matching : activeEligible;

  if (pool.length === 0) return null;

  // Person with highest available capacity has the lowest utilized percent / pressure
  const sorted = [...pool].sort((a, b) => {
    const aUtil = typeof a.utilizedPercent === 'number' && Number.isFinite(a.utilizedPercent) ? a.utilizedPercent : 50;
    const bUtil = typeof b.utilizedPercent === 'number' && Number.isFinite(b.utilizedPercent) ? b.utilizedPercent : 50;
    const aExtra = proposedHours ? (proposedHours.get(a.id) || 0) : 0;
    const bExtra = proposedHours ? (proposedHours.get(b.id) || 0) : 0;
    const aTotal = aUtil + (a.capacityHours && a.capacityHours > 0 ? (aExtra / a.capacityHours) * 100 : aExtra);
    const bTotal = bUtil + (b.capacityHours && b.capacityHours > 0 ? (bExtra / b.capacityHours) * 100 : bExtra);
    return aTotal - bTotal || a.name.localeCompare(b.name);
  });

  return sorted[0] || null;
};

export const searchActiveTeam = (users: UserItem[], query: string): UserItem[] => {
  const term = query.trim().toLocaleLowerCase();
  return term ? users.filter(isEligibleTeamMember).filter((user) =>
    [user.name, user.email, user.jobTitle, user.officialRole, user.professionalRole,
      ...(user.officialRoles || []), ...(user.professionalRoles || [])].some((value) => value?.toLocaleLowerCase().includes(term))).slice(0, 5) : [];
};

// Elegibilidad visual basada en Access Levels existentes; no otorga permisos nuevos.
// Exclusión solicitada para Scoping; conserva el perfil canónico y sus permisos.
export const isEligibleScopingLeader = (user: UserItem): boolean => user.id !== 'u-19' && isEligibleTeamMember(user) &&
  ['leader', 'executive', 'system_admin', 'commercial', 'client_relationship'].includes(user.accessLevel || 'pending');

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
  return Boolean(quote.commercialProposalUrl?.trim() && quote.commercialProposalUrl.trim().length > 5) &&
    Number.isFinite(weeks) && weeks >= 1 && quote.totalHoursRollup > 0 &&
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
