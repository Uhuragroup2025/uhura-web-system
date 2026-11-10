import type { ProjectDependency, ProjectDependencyType } from '../types';

/**
 * Insumos a solicitar al cliente por tipo de servicio (ronda 2, 10 Nov 2026).
 *
 * Regla: un insumo NO suma días al cronograma. Se pide en el kickoff y se necesita para una
 * fase (entregable) concreta: su fecha esperada es el inicio de esa fase. Mientras esa fase no
 * empiece, gestionarlo no afecta el proyecto (se anticipa). Si la fase llega y el insumo no está,
 * la dependencia queda vencida: si «bloquea», esa fase se detiene y el desvío es del cliente.
 *
 * Ejemplo (landing): el brochure o la web actual se necesitan para UX / wireframe; el manual de
 * marca para el prototipo visual; los accesos a hosting y WordPress para la implementación.
 *
 * - Cada servicio trae su plantilla. Al «Iniciar proyecto» se muestran precargados con la fase
 *   sugerida; el responsable marca los que aplican, cambia la fase o si bloquea, y agrega otros.
 * - Los confirmados se crean como Dependencias del proyecto (dueño: cliente).
 * - Producción: estas plantillas viven en el catálogo de servicios (las define cada área).
 */

export interface ClientInputTemplate {
  title: string;
  type: ProjectDependencyType;
  blocking: boolean;
  /** Fase (entregable) para la que se necesita, por nombre, en orden de preferencia. */
  phaseHint?: RegExp[];
}

// Cada pista es una lista en orden de preferencia; se elige la primera fase que coincida.
// «Onboarding & Insumos» es donde se piden, no donde se usan: nunca es la fase sugerida.
const FIRST = [/ux|wireframe|arquitectura|estrategia|descubr|diagn/i, /contenido/i];
const DESIGN = [/prototip|dise[ñn]o|\bui\b|visual|creativ|piezas/i, /ux|contenido/i];
const BUILD = [/implement|desarrollo|maquet|construc|configur|montaje|integraci/i];
const LAUNCH = [/lanz|publica|salida|go.?live/i, /anal[ií]tica|medici/i, /qa|pruebas/i, ...BUILD];

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
      { title: 'Brochure o presentación del negocio (o web actual)', type: 'client_input', blocking: true, phaseHint: FIRST },
      { title: 'Manual de marca / branding (logos, colores, tipografías)', type: 'client_input', blocking: true, phaseHint: DESIGN },
      { title: 'Acceso de colaborador a Shopify (o cuenta nueva)', type: 'access', blocking: true, phaseHint: BUILD },
      { title: 'Catálogo de productos (fotos, precios, descripciones)', type: 'client_input', blocking: true, phaseHint: BUILD },
      { title: 'Pasarela de pago y datos de envío', type: 'access', blocking: true, phaseHint: LAUNCH },
      { title: 'Acceso a dominio / DNS', type: 'access', blocking: true, phaseHint: LAUNCH }
    ]
  },
  {
    match: /landing|wordpress|webflow|sitio web|web informativ|mantenimiento web/i,
    label: 'Web / Landing',
    inputs: [
      { title: 'Brochure o presentación del negocio (o web actual)', type: 'client_input', blocking: true, phaseHint: FIRST },
      { title: 'Manual de marca / branding (logos, colores, tipografías)', type: 'client_input', blocking: true, phaseHint: DESIGN },
      { title: 'Textos e imágenes del contenido', type: 'client_input', blocking: false, phaseHint: DESIGN },
      { title: 'Acceso al hosting (o decisión de adquirir hosting)', type: 'access', blocking: true, phaseHint: BUILD },
      { title: 'Acceso de administrador a WordPress / Webflow', type: 'access', blocking: true, phaseHint: BUILD },
      { title: 'Acceso a dominio / DNS', type: 'access', blocking: true, phaseHint: LAUNCH },
      { title: 'Permiso de administrador en GA4 y Google Tag Manager', type: 'access', blocking: false, phaseHint: LAUNCH }
    ]
  },
  {
    match: /pauta|meta|facebook|ads|paid|performance|trafic/i,
    label: 'Pauta digital',
    inputs: [
      { title: 'Acceso a Meta Business Manager (cuenta publicitaria)', type: 'access', blocking: true, phaseHint: FIRST },
      { title: 'Acceso a Google Ads', type: 'access', blocking: true, phaseHint: FIRST },
      { title: 'Método de pago de la pauta configurado', type: 'access', blocking: true, phaseHint: BUILD },
      { title: 'Permiso en GA4 / píxel instalado', type: 'access', blocking: false, phaseHint: BUILD },
      { title: 'Piezas o lineamientos de marca', type: 'client_input', blocking: false, phaseHint: DESIGN }
    ]
  },
  {
    match: /mercado libre|marketplace|digital shelf|pdp|amazon|rappi/i,
    label: 'Marketplace / Digital Shelf',
    inputs: [
      { title: 'Acceso a la cuenta del marketplace / seller center', type: 'access', blocking: true, phaseHint: FIRST },
      { title: 'Fichas, fotos y atributos de los productos', type: 'client_input', blocking: true, phaseHint: DESIGN },
      { title: 'Manual de marca', type: 'client_input', blocking: false, phaseHint: DESIGN }
    ]
  },
  {
    match: /chatbot|manychat|whatsapp/i,
    label: 'Chatbot',
    inputs: [
      { title: 'Preguntas frecuentes y flujos de atención', type: 'client_input', blocking: true, phaseHint: FIRST },
      { title: 'Acceso a Meta Business Manager / WhatsApp Business', type: 'access', blocking: true, phaseHint: BUILD }
    ]
  },
  {
    match: /redes|social|contenido|community|parrilla/i,
    label: 'Redes y contenido',
    inputs: [
      { title: 'Manual de marca y piezas anteriores', type: 'client_input', blocking: true, phaseHint: FIRST },
      { title: 'Acceso a las redes sociales (Meta Business Suite)', type: 'access', blocking: true, phaseHint: BUILD }
    ]
  }
];

const GENERIC_INPUTS: ClientInputTemplate[] = [
  { title: 'Brochure o presentación del negocio', type: 'client_input', blocking: true, phaseHint: FIRST },
  { title: 'Manual de marca / branding', type: 'client_input', blocking: false, phaseHint: DESIGN },
  { title: 'Accesos a las plataformas del proyecto', type: 'access', blocking: false, phaseHint: BUILD }
];

/** Plantilla de insumos según el nombre del servicio/proyecto y sus entregables. */
export function suggestedClientInputs(text: string): { label: string; inputs: ClientInputTemplate[] } {
  const found = SERVICE_INPUTS.find((s) => s.match.test(text));
  return found ? { label: found.label, inputs: found.inputs } : { label: 'General', inputs: GENERIC_INPUTS };
}

/** Fase sugerida para un insumo entre los entregables del proyecto (en orden). */
export function pickPhaseId(input: ClientInputTemplate, phases: { id: string; name: string }[]): string | undefined {
  if (phases.length === 0) return undefined;
  for (const re of input.phaseHint || []) {
    const hit = phases.find((p) => re.test(p.name));
    if (hit) return hit.id;
  }
  // Sin coincidencia: la primera fase que no sea la de recolección de insumos.
  return (phases.find((p) => !/onboarding|insumo|kickoff/i.test(p.name)) || phases[0]).id;
}

export interface SelectedClientInput extends ClientInputTemplate {
  /** Fase (entregable) para la que se necesita; sin fase = al inicio. */
  deliverableId?: string;
  /** Inicio de esa fase: fecha en que el insumo debe estar. */
  expectedDate: string;
}

export function inputsToDependencies(params: {
  projectId: string;
  kickoffDate: string;
  inputs: SelectedClientInput[];
  followUpOwnerUserId: string;
  followUpOwnerName?: string;
}): ProjectDependency[] {
  const now = new Date().toISOString();
  return params.inputs.map((i, idx) => ({
    id: `dep-${params.projectId}-${Date.now()}-${idx}`,
    projectId: params.projectId,
    deliverableId: i.deliverableId || null,
    title: i.title,
    type: i.type,
    ownerType: 'client',
    followUpOwnerUserId: params.followUpOwnerUserId,
    followUpOwnerName: params.followUpOwnerName,
    requestedAt: params.kickoffDate,
    expectedDate: i.expectedDate,
    status: 'pending',
    blocking: i.blocking,
    createdAt: now,
    updatedAt: now
  }));
}
