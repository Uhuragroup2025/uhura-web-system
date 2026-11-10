import type { ProjectDependency, ProjectDependencyType } from '../types';
import { addBusinessDays } from '../health/projectHealthEngine';

/**
 * Insumos a solicitar al cliente por tipo de servicio (ronda 2, 10 Nov 2026).
 *
 * - Cada servicio trae su plantilla de insumos. Al «Iniciar proyecto» se muestran precargados y
 *   el responsable marca los que aplican (cada cliente es distinto: hosting propio, Shopify,
 *   comprar hosting…), cambia si bloquean y agrega otros.
 * - Los confirmados se crean como Dependencias del proyecto (dueño: cliente) con fecha esperada.
 * - Los bloqueantes definen la espera tras el kickoff: la producción arranca cuando vence el
 *   bloqueante más largo. Si llega tarde, el desvío queda atribuido al cliente (Dependencias).
 * - Producción: estas plantillas viven en el catálogo de servicios (las define cada área).
 */

export interface ClientInputTemplate {
  title: string;
  type: ProjectDependencyType;
  blocking: boolean;
  /** Días hábiles después del kickoff en que se espera el insumo. */
  dueDays: number;
}

interface ServiceInputs {
  match: RegExp;
  label: string;
  inputs: ClientInputTemplate[];
}

const SERVICE_INPUTS: ServiceInputs[] = [
  {
    match: /shopify|tienda|e-?commerce/i,
    label: 'Tienda online',
    inputs: [
      { title: 'Manual de marca / branding (logos, colores, tipografías)', type: 'client_input', blocking: true, dueDays: 3 },
      { title: 'Acceso de colaborador a Shopify (o cuenta nueva)', type: 'access', blocking: true, dueDays: 3 },
      { title: 'Catálogo de productos (fotos, precios, descripciones)', type: 'client_input', blocking: false, dueDays: 5 },
      { title: 'Pasarela de pago y datos de envío', type: 'access', blocking: false, dueDays: 10 },
      { title: 'Acceso a dominio / DNS', type: 'access', blocking: false, dueDays: 10 }
    ]
  },
  {
    match: /landing|wordpress|webflow|sitio web|web informativ|mantenimiento web/i,
    label: 'Web / Landing',
    inputs: [
      { title: 'Manual de marca / branding (logos, colores, tipografías)', type: 'client_input', blocking: true, dueDays: 3 },
      { title: 'Acceso de administrador a WordPress / Webflow', type: 'access', blocking: true, dueDays: 3 },
      { title: 'Acceso al hosting (o decisión de adquirir hosting)', type: 'access', blocking: false, dueDays: 5 },
      { title: 'Acceso a dominio / DNS', type: 'access', blocking: false, dueDays: 5 },
      { title: 'Permiso de administrador en GA4 y Google Tag Manager', type: 'access', blocking: false, dueDays: 5 },
      { title: 'Textos e imágenes del contenido', type: 'client_input', blocking: false, dueDays: 5 }
    ]
  },
  {
    match: /pauta|meta|facebook|ads|paid|performance|trafic/i,
    label: 'Pauta digital',
    inputs: [
      { title: 'Acceso a Meta Business Manager (cuenta publicitaria)', type: 'access', blocking: true, dueDays: 2 },
      { title: 'Acceso a Google Ads', type: 'access', blocking: true, dueDays: 2 },
      { title: 'Método de pago de la pauta configurado', type: 'access', blocking: true, dueDays: 3 },
      { title: 'Permiso en GA4 / píxel instalado', type: 'access', blocking: false, dueDays: 3 },
      { title: 'Piezas o lineamientos de marca', type: 'client_input', blocking: false, dueDays: 3 }
    ]
  },
  {
    match: /mercado libre|marketplace|digital shelf|pdp|amazon|rappi/i,
    label: 'Marketplace / Digital Shelf',
    inputs: [
      { title: 'Acceso a la cuenta del marketplace / seller center', type: 'access', blocking: true, dueDays: 3 },
      { title: 'Fichas, fotos y atributos de los productos', type: 'client_input', blocking: false, dueDays: 5 },
      { title: 'Manual de marca', type: 'client_input', blocking: false, dueDays: 3 }
    ]
  },
  {
    match: /chatbot|manychat|whatsapp/i,
    label: 'Chatbot',
    inputs: [
      { title: 'Acceso a Meta Business Manager / WhatsApp Business', type: 'access', blocking: true, dueDays: 3 },
      { title: 'Preguntas frecuentes y flujos de atención', type: 'client_input', blocking: false, dueDays: 5 }
    ]
  },
  {
    match: /redes|social|contenido|community|parrilla/i,
    label: 'Redes y contenido',
    inputs: [
      { title: 'Acceso a las redes sociales (Meta Business Suite)', type: 'access', blocking: true, dueDays: 3 },
      { title: 'Manual de marca y piezas anteriores', type: 'client_input', blocking: false, dueDays: 3 }
    ]
  }
];

const GENERIC_INPUTS: ClientInputTemplate[] = [
  { title: 'Manual de marca / branding', type: 'client_input', blocking: false, dueDays: 3 },
  { title: 'Accesos a las plataformas del proyecto', type: 'access', blocking: false, dueDays: 3 }
];

/** Plantilla de insumos según el nombre del servicio/proyecto y sus entregables. */
export function suggestedClientInputs(text: string): { label: string; inputs: ClientInputTemplate[] } {
  const found = SERVICE_INPUTS.find((s) => s.match.test(text));
  return found ? { label: found.label, inputs: found.inputs } : { label: 'General', inputs: GENERIC_INPUTS };
}

/** Espera tras el kickoff = el insumo bloqueante que más tarda (0 si no hay bloqueantes). */
export function kickoffWaitFromInputs(inputs: ClientInputTemplate[]): number {
  return inputs.filter((i) => i.blocking).reduce((max, i) => Math.max(max, i.dueDays), 0);
}

export function inputsToDependencies(params: {
  projectId: string;
  kickoffDate: string;
  inputs: ClientInputTemplate[];
  followUpOwnerUserId: string;
  followUpOwnerName?: string;
}): ProjectDependency[] {
  const now = new Date().toISOString();
  return params.inputs.map((i, idx) => ({
    id: `dep-${params.projectId}-${Date.now()}-${idx}`,
    projectId: params.projectId,
    title: i.title,
    type: i.type,
    ownerType: 'client',
    followUpOwnerUserId: params.followUpOwnerUserId,
    followUpOwnerName: params.followUpOwnerName,
    requestedAt: params.kickoffDate,
    expectedDate: addBusinessDays(params.kickoffDate, i.dueDays),
    status: 'pending',
    blocking: i.blocking,
    createdAt: now,
    updatedAt: now
  }));
}
