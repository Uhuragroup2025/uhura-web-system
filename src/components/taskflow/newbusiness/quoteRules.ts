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
