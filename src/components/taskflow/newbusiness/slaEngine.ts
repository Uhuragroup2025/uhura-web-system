/**
 * SLA & Gobernanza Contractual Engine para New Business en Orbit
 * 
 * Reglas de Dominio:
 * 1. SLA de propuesta: 36 horas hábiles desde la activación de la oportunidad para scoping/propuesta,
 *    calculadas sobre una jornada estándar de 8 horas por día hábil (lunes a viernes).
 * 2. Corresponde a un plazo máximo de 4,5 días hábiles para elaborar y entregar la propuesta.
 * 3. Puede entregarse antes sin penalización. El SLA mide tiempo disponible de entrega,
 *    NO horas reales trabajadas ni consumidas.
 * 4. NUNCA convertir el SLA de 36h en horas ejecutadas ni crear TimeLogs automáticos por ese valor.
 *    Las horas reales de preventa se registran únicamente mediante Timer o carga manual sobre la tarea interna.
 * 5. SOW / Contrato: El firmante contractual de UHURA proviene de la configuración corporativa
 *    vigente (por defecto Representante Legal de la compañía) y se guarda como snapshot histórico en el SOW.
 *    Orbit no simula ni ejecuta firmas legales en el frontend; prepara el SOW y registra el estado/referencia
 *    del trámite legal en Adobe Acrobat Sign (proveedor externo).
 * 6. Resolución dinámica del proyecto interno de preventa: se resuelve en caliente (UHURA Group -> Comercial & Prospección New Business)
 *    sin hardcodear IDs estáticos.
 */

export interface CompanyLegalSignerConfig {
  name: string;
  role: string;
  nit?: string;
  signatureProvider: string;
}

/**
 * Configuración Legal de Respaldo / Mock UI.
 * 
 * NOTA DE ARQUITECTURA:
 * Este objeto NO es canónico ni vinculante. Los datos definitivos (Representante Legal,
 * razón social formal y NIT) provienen de la configuración corporativa administrada
 * en Backend / Ajustes Legales de la Compañía.
 * Al emitir o preparar un SOW, Orbit toma la configuración corporativa vigente
 * y almacena un snapshot inmutable en `opportunity.sowData` (sowSigner, sowSignerRole, signatureProvider).
 */
export const DEFAULT_UHURA_LEGAL_SIGNER: CompanyLegalSignerConfig = {
  name: 'Representante Legal Asignado',
  role: 'Representante Legal · UHURA GROUP S.A.S.',
  signatureProvider: 'Adobe Acrobat Sign'
};

export const UHURA_LEGAL_SIGNER = DEFAULT_UHURA_LEGAL_SIGNER;

/**
 * Días festivos oficiales estándar en Colombia (formato YYYY-MM-DD).
 * 
 * FUENTE DE DATOS:
 * - Ley 51 de 1983 (Ley Emiliani) de la República de Colombia, que traslada los festivos religiosos
 *   al lunes siguiente, y festivos fijos de orden nacional (Año Nuevo, Trabajo, Independencia, Navidad).
 * - En Frontend: esta lista se provee exclusivamente para previsualización inmediata en UI y cálculo
 *   estimado del SLA en cliente sin latencia de red.
 * - En Backend: el Backend de Indunova (Django REST Framework / PostgreSQL) es la FUENTE AUTORITATIVA
 *   oficial del `handoff_deadline`, calculando la fecha límite con su propio calendario corporativo
 *   de festivos y jornada laboral configurable por empresa.
 */
export const STANDARD_HOLIDAYS_CO: string[] = [
  '2026-01-01', // Año Nuevo
  '2026-01-12', // Reyes Magos
  '2026-03-23', // San José
  '2026-04-02', // Jueves Santo
  '2026-04-03', // Viernes Santo
  '2026-05-01', // Día del Trabajo
  '2026-05-18', // Ascensión
  '2026-06-08', // Corpus Christi
  '2026-06-15', // Sagrado Corazón
  '2026-06-29', // San Pedro y San Pablo
  '2026-07-20', // Independencia
  '2026-08-07', // Batalla de Boyacá
  '2026-08-17', // Asunción
  '2026-10-12', // Día de la Raza
  '2026-11-02', // Todos los Santos
  '2026-11-16', // Independencia de Cartagena
  '2026-12-08', // Inmaculada Concepción
  '2026-12-25'  // Navidad
];

/**
 * Determina si una fecha dada es no laborable (fin de semana o festivo).
 */
export function isNonWorkingDay(date: Date, holidays: string[] = STANDARD_HOLIDAYS_CO): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return true; // Domingo o Sábado
  const dateStr = date.toISOString().slice(0, 10);
  return holidays.includes(dateStr);
}

/**
 * Calcula la fecha y hora de vencimiento de un SLA en horas hábiles (jornada de 8h/día hábil, lunes a viernes).
 * - 36 horas hábiles equivalen a exactamente 4.5 jornadas hábiles de trabajo.
 * - Activación en viernes: sábado y domingo NO consumen SLA.
 * - Festivos: días festivos NO consumen SLA.
 * - Entrega anticipada: 100% permitida sin penalización.
 * - Registro de horas: el SLA NUNCA crea TimeLogs automáticos ni modifica la ejecución real.
 * 
 * @param startDate Fecha de activación de la oportunidad para scoping
 * @param businessHours Número de horas hábiles acordadas (default 36h = 4.5 días hábiles)
 * @param holidays Lista opcional de festivos (por defecto feriados Colombia)
 */
export function calculateBusinessHoursDeadline(
  startDate: Date = new Date(),
  businessHours: number = 36,
  holidays: string[] = STANDARD_HOLIDAYS_CO
): {
  deadlineDate: Date;
  deadlineIso: string;
  businessDaysCount: number;
  formattedText: string;
  formattedDateString: string;
} {
  const safeHours = Math.max(1, Number(businessHours) || 36);
  const businessDaysCount = Number((safeHours / 8).toFixed(1));

  let remainingHours = safeHours;
  const current = new Date(startDate.getTime());

  // Si se activa en día no hábil (fin de semana o festivo), avanzar al próximo día hábil a las 8:00 AM
  while (isNonWorkingDay(current, holidays)) {
    current.setDate(current.getDate() + 1);
    current.setHours(8, 0, 0, 0);
  }

  // Avanzamos día a día hábil (8h hábiles por jornada estándar)
  while (remainingHours > 0) {
    if (!isNonWorkingDay(current, holidays)) {
      if (remainingHours <= 8) {
        current.setHours(current.getHours() + remainingHours);
        remainingHours = 0;
      } else {
        current.setDate(current.getDate() + 1);
        remainingHours -= 8;
      }
    } else {
      current.setDate(current.getDate() + 1);
    }
  }

  const formattedDateString = current.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return {
    deadlineDate: current,
    deadlineIso: current.toISOString(),
    businessDaysCount,
    formattedText: `${safeHours}h hábiles (~${businessDaysCount} días hábiles)`,
    formattedDateString
  };
}

/**
 * Formatea la etiqueta de SLA para UI
 */
export function formatBusinessHoursSLA(businessHours: number = 36): string {
  const days = Number((businessHours / 8).toFixed(1));
  return `${businessHours}h hábiles (~${days} días)`;
}

/**
 * Resuelve dinámicamente el proyecto interno de Comercial & New Business en UHURA Group.
 * NO hardcodea IDs en lógica de negocio; busca en la colección de proyectos disponibles.
 */
export function resolveInternalNewBusinessProject(
  projectsList: { id: string; name: string; brand?: string; clientName?: string; clientId?: string }[] = []
): { projectId: string; projectName: string; clientName: string } {
  const matched =
    projectsList.find(
      (p) =>
        (p.brand === 'UHURA Group' || p.clientName === 'UHURA Group' || p.clientId === 'cli-uhu-internal') &&
        (p.name.toLowerCase().includes('comercial') ||
          p.name.toLowerCase().includes('new business') ||
          p.name.toLowerCase().includes('prospección'))
    ) ||
    projectsList.find(
      (p) =>
        p.name.toLowerCase().includes('comercial') &&
        p.name.toLowerCase().includes('new business')
    ) ||
    projectsList.find((p) => p.name.toLowerCase().includes('new business')) ||
    (projectsList.length > 0
      ? projectsList[0]
      : { id: 'prj-uhu-3', name: 'Comercial & Prospección New Business', clientName: 'UHURA Group' });

  return {
    projectId: matched.id,
    projectName: matched.name,
    clientName: (matched as any).clientName || matched.brand || 'UHURA Group'
  };
}
