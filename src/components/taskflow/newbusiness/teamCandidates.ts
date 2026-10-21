import type { UserItem, QuoteProposal } from '../types';

// Usa el equipo canónico recibido; excluye registros de prueba identificados en su identidad.
export const isEligibleTeamMember = (user: UserItem): boolean => user.status === 'Active' &&
  !/(^|[\s._@-])(demo|qa|legacy|test|prueba)(?=$|[\s._@-])/i.test(`${user.id} ${user.name} ${user.email}`);

const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export const matchesQuotedRole = (user: UserItem, role: string): boolean =>
  [...(user.officialRoles || []), ...(user.professionalRoles || []), user.officialRole, user.professionalRole]
    .some((assigned) => Boolean(assigned) && normalized(assigned!) === normalized(role));

export const searchActiveTeam = (users: UserItem[], query: string): UserItem[] => {
  const term = query.trim().toLocaleLowerCase();
  return term ? users.filter(isEligibleTeamMember).filter((user) =>
    [user.name, user.email, user.jobTitle, user.officialRole, user.professionalRole,
      ...(user.officialRoles || []), ...(user.professionalRoles || [])].some((value) => value?.toLocaleLowerCase().includes(term))).slice(0, 5) : [];
};

// Elegibilidad visual basada en Access Levels existentes; no otorga permisos nuevos.
// Exclusión solicitada para Scoping; conserva el perfil canónico y sus permisos.
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
  return Boolean(quote.commercialProposalUrl?.trim() && quote.commercialProposalUrl.trim().length > 5) &&
    Number.isFinite(weeks) && weeks >= 1 && quote.totalHoursRollup > 0 &&
    quote.deliverables.some((deliverable) => deliverable.backlogItems.some((activity) => activity.estimatedHours > 0)) &&
    services.every((service) => service.saved === true && serviceValidationMessages(service).length === 0);
};
