import type { NewBusinessOpportunity, QuoteProposal, UserItem } from '../types';

/** La calculadora admite enlaces web válidos, incluidos Sheets y enlaces compartidos. */
export const isValidFinanceSheetUrl = (value?: string): boolean => {
  try {
    const url = new URL(value?.trim() || '');
    return ['https:', 'http:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
};

export const quoteSignature = (value: number, url: string): string => JSON.stringify([value, url.trim()]);
export const quoteMissingRequirements = (value: number, url: string): string[] => [
  ...(!Number.isFinite(value) || value <= 0 ? ['Falta un valor mayor que cero.'] : []),
  ...(!url.trim() ? ['Falta el enlace de la calculadora.'] : !isValidFinanceSheetUrl(url) ? ['El enlace de la calculadora no es válido: usa una URL http o https completa.'] : [])
];

/**
 * Firma determinista de la estructura comercial y enlace de la calculadora.
 * Cualquier cambio en modalidad, valor, vigencia o enlace invalida el guardado anterior.
 */
export const commercialStructureSignature = (
  items: import('../types').ServiceCommercialItem[],
  sheetUrl: string
): string => {
  return JSON.stringify({
    url: sheetUrl.trim(),
    items: items.map((i) => ({
      id: i.serviceId,
      modality: i.modality,
      totalValue: i.totalValue || 0,
      monthlyValue: i.monthlyValue || 0,
      monthsDuration: i.monthsDuration || 0
    }))
  });
};

/**
 * Valida los requisitos comerciales por servicio y el enlace general de la calculadora:
 * 1. Todos los servicios deben tener modalidad ('fixed_project' | 'fee_monthly')
 * 2. Proyectos únicos: valor total > 0
 * 3. Fees: valor mensual > 0 y vigencia en meses > 0
 * 4. Enlace válido de calculadora
 */
export const validateCommercialStructure = (
  services: { id: string; name: string }[],
  commercialItems: import('../types').ServiceCommercialItem[],
  sheetUrl: string
): string[] => {
  const errors: string[] = [];

  if (services.length === 0) {
    errors.push('No hay servicios definidos en el alcance.');
  }

  // Enlace general de la calculadora
  if (!sheetUrl.trim()) {
    errors.push('Falta el enlace de la calculadora.');
  } else if (!isValidFinanceSheetUrl(sheetUrl)) {
    errors.push('El enlace de la calculadora no es válido: usa una URL http o https completa.');
  }

  // Validación servicio por servicio
  services.forEach((s) => {
    const item = commercialItems.find((ci) => ci.serviceId === s.id);
    if (!item || !item.modality) {
      errors.push(`Falta seleccionar la modalidad comercial para "${s.name}".`);
      return;
    }

    if (item.modality === 'fixed_project') {
      if (!item.totalValue || item.totalValue <= 0) {
        errors.push(`El servicio "${s.name}" (Proyecto único) debe tener un valor total mayor a cero.`);
      }
    } else if (item.modality === 'fee_monthly') {
      if (!item.monthlyValue || item.monthlyValue <= 0) {
        errors.push(`El servicio "${s.name}" (Fee mensual) debe tener un valor mensual mayor a cero.`);
      }
      if (!item.monthsDuration || item.monthsDuration <= 0) {
        errors.push(`El servicio "${s.name}" (Fee mensual) debe tener una vigencia válida en meses.`);
      }
    }
  });

  return errors;
};

// Los datos legacy sin referencia explícita conservan el primer alcance como hasta ahora.
// La lectura mantiene el orden existente y no migra ni elimina históricos.
export const getOperationalQuote = (opportunity?: NewBusinessOpportunity): QuoteProposal | undefined =>
  opportunity?.quotes[0];

export const withOperationalQuote = (
  opportunity: NewBusinessOpportunity,
  quote: QuoteProposal
): NewBusinessOpportunity => ({
  ...opportunity,
  quotes: opportunity.quotes.some((existing) => existing.id === quote.id)
    ? opportunity.quotes.map((existing) => existing.id === quote.id ? quote : existing)
    : [...opportunity.quotes, quote]
});

export const getCommercialOwnerName = (opportunity: NewBusinessOpportunity, users: UserItem[]): string => {
  const owner = users.find((user) => user.id === opportunity.commercialOwner || user.name === opportunity.commercialOwner);
  return owner?.status === 'Active' ? owner.name : 'Sin asignar';
};
