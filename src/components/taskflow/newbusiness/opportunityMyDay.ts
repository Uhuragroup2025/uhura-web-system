/**
 * ¿Esta negocio de New Business va en el «Mi Día» de esta persona? (25 Nov 2026)
 *
 * La regla es por ROL dentro del negocio, no por nivel de acceso:
 * - Responsables del alcance: la ven solo mientras el alcance está abierto. Cuando CUALQUIERA de ellos
 *   pulsa «Marcar alcance listo», sale del Mi Día de todos. Vuelve si Comercial pide un ajuste de alcance
 *   (el negocio regresa a «En scoping»).
 * - Responsable comercial y quien la creó: la ven mientras se dimensiona y mientras cotizan
 *   (y cuando un líder actualizó el alcance después de cotizar).
 * - Si la persona es las dos cosas en la misma negocio, la sigue viendo hasta que se cotice.
 * - Ganada, perdida o convertida: no aparece.
 */
export interface MyDayUser {
  id: string;
  name: string;
  accessLevel: string;
}

export interface MyDayOpportunity {
  status: string;
  leadUserId?: string | null;
  leadUserIds?: string[] | null;
  leadUserName?: string | null;
  commercialOwner?: string | null;
  createdByUserId?: string | null;
  scopeUpdateNotice?: unknown;
}

const SCOPE_OPEN = ['discovery', 'quoting'];
const COMMERCIAL_TURN = ['internal_review'];
const CLOSED = ['won', 'lost', 'converted'];

export function isOpportunityInMyDay(o: MyDayOpportunity, user: MyDayUser): boolean {
  if (!['leader', 'commercial', 'executive', 'system_admin'].includes(user.accessLevel)) return false;
  if (CLOSED.includes(o.status)) return false;
  const me = (user.name || '').toLowerCase();
  const scopeOpen = SCOPE_OPEN.includes(o.status);
  const commercialTurn = COMMERCIAL_TURN.includes(o.status);
  const hasScopeUpdate = Boolean(o.scopeUpdateNotice);

  const isScopeLead =
    o.leadUserId === user.id ||
    (Array.isArray(o.leadUserIds) && o.leadUserIds.includes(user.id)) ||
    Boolean(me && o.leadUserName && o.leadUserName.toLowerCase().includes(me));
  const owner = (o.commercialOwner || '').toLowerCase();
  const isCommercialSide =
    user.accessLevel !== 'leader' &&
    (o.createdByUserId === user.id || Boolean(owner && me && owner.includes(me)));

  if (isCommercialSide && (scopeOpen || commercialTurn || hasScopeUpdate)) return true;
  if (isScopeLead && scopeOpen) return true;
  return false;
}
