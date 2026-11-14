import {
  ProductBacklogTemplate,
  ProductBacklogTemplateCategory,
  STANDARD_UHURA_ROLES,
  ROLE_PENDING_DEFINITION
} from '../types';
import { recalculateTemplateHours } from './templateEngine';
import { CATALOG_2026 } from './catalog2026';

/**
 * METADATOS DE CATEGORÍAS DE PRODUCTOS/SERVICIOS UHURA
 * Fuente: servicios-uhura-2026-para-eco.xlsx (catálogo normalizado que se entrega a Indunova),
 * generado en ./catalog2026.ts: 24 servicios (Producto Digital, Creativo, Growth) + tiempos sueltos.
 *
 * Reglas de Gobernanza:
 * 1. Cada servicio es una plantilla; fase = entregable; actividad = tarea con rol y horas.
 * 2. Tiempos sueltos = mini plantillas de una unidad (ej. «Página adicional»), con campo Cantidad en Alcance.
 * 3. Servicios por unidad (por PDP, por post…): horas por unidad × cantidad.
 * 4. 1 plantilla modular abierta ('tmpl-custom-blank') para proyectos a la medida.
 * 5. Desacoplamiento: la edición de una plantilla maestra genera una nueva versión y no altera cotizaciones históricas.
 */
export interface TemplateCategoryMeta {
  key: ProductBacklogTemplateCategory;
  label: string;
  description: string;
  badgeBg: string;
  badgeText: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategoryMeta[] = [
  {
    key: 'producto_digital',
    label: 'Producto Digital',
    description: 'Web, landing, ecommerce, marketplace, chatbot y Digital Shelf.',
    badgeBg: 'bg-[#8a4dff]/15',
    badgeText: 'text-[#8a4dff]'
  },
  {
    key: 'creativo',
    label: 'Creativo',
    description: 'Contenido para redes, campañas, marca, mailing, piezas y creativos de pauta.',
    badgeBg: 'bg-[#ec4899]/15',
    badgeText: 'text-[#ec4899]'
  },
  {
    key: 'growth',
    label: 'Growth',
    description: 'Medición, pauta, SEO, blog, email, CRO y comité.',
    badgeBg: 'bg-[#10b981]/15',
    badgeText: 'text-[#10b981]'
  },
  {
    key: 'tiempos_sueltos',
    label: 'Tiempos sueltos',
    description: 'Unidades sueltas (página, SKU, post, artículo…) para alcances a la medida: horas por unidad × cantidad.',
    badgeBg: 'bg-[#f59e0b]/15',
    badgeText: 'text-[#f59e0b]'
  },
  {
    key: 'custom',
    label: 'Proyecto a la Medida (Propuesta Técnica)',
    description: 'Estructura modular abierta para requerimientos y desarrollos especiales a la medida (No canónica en fuente primaria).',
    badgeBg: 'bg-[#64748b]/15',
    badgeText: 'text-[#64748b]'
  }
];

// Roles estándar del catálogo oficial Uhura (12 roles canónicos)
const R_PRODUCT_LEAD = 'Product Lead';
const R_FRONT_END = 'Front-End Dev';
const R_CLIENT_RELATIONSHIP = 'Client Relationship Strategist';
const R_DIGITAL_CONTENT = 'Digital Content Specialist';
const R_CREATIVE_DESIGNER = 'Creative Designer';
const R_DIGITAL_DESIGNER = 'Digital Designer';
const R_CREATIVE_STRATEGY_LEAD = 'Creative Strategy Lead';
const R_TRAFFICKER_MEDIA = 'Trafficker Media';
const R_COMMUNITY_MANAGER = 'Community Manager';
const R_CONTENT_CREATOR = 'Content Creator';
const R_DIRECTORA_COMERCIAL = 'Directora Comercial';
const R_GROWTH_MANAGER = 'Growth Manager';

/**
 * DATOS MAESTROS OFICIALES DE PLANTILLAS
 * Fuente: "FORMATO DE PROCESO DE ÁREA UHURA(2026) - PRODUCTO DIGITAL"
 */
/**
 * Catálogo 2026 (generado desde el Excel) → plantillas maestras del prototipo.
 */
const catalogTemplates: ProductBacklogTemplate[] = CATALOG_2026.map((svc) => ({
  id: svc.id,
  name: svc.name,
  description: svc.description,
  category: svc.category,
  version: '2026.2',
  status: 'active',
  isReusable: true,
  governedBy: svc.area,
  area: svc.area,
  serviceType: svc.serviceType,
  unitLabel: svc.unitLabel,
  estimatedDurationWeeks: svc.weeks,
  totalHours: 0,
  createdAt: '2026-11-12T10:00:00Z',
  updatedAt: '2026-11-12T10:00:00Z',
  deliverables: svc.deliverables.map((del, dIdx) => {
    const delId = `${svc.id}-del-${dIdx + 1}`;
    return {
      id: delId,
      templateId: svc.id,
      name: del.name,
      order: dIdx + 1,
      roleBudgets: [],
      activities: del.activities.map((act, aIdx) => ({
        id: `${delId}-act-${aIdx + 1}`,
        templateDeliverableId: delId,
        title: act.title,
        description: act.description,
        roleId: act.role,
        roleName: act.role,
        estimatedHours: act.hours,
        order: aIdx + 1,
        optional: act.optional,
        unit: act.unit
      }))
    };
  })
}));

const rawInitialTemplates: ProductBacklogTemplate[] = [
  // ==========================================================================
  // 15. PROYECTO A LA MEDIDA [PROPUESTA TÉCNICA - NO CANÓNICA EN FUENTE PRIMARIA]
  // ==========================================================================
  {
    id: 'tmpl-custom-blank',
    name: 'Proyecto a la Medida (Propuesta Técnica)',
    area: 'A la medida',
    description: 'Plantilla base modular abierta para dimensionar requerimientos y desarrollos especiales a la medida sin alterar las plantillas canónicas fijas.',
    category: 'custom',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-cst-scope',
        templateId: 'tmpl-custom-blank',
        name: 'Definición de Alcance & Discovery Técnico',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-cst-1',
            templateDeliverableId: 'del-cst-scope',
            title: 'Taller de Discovery & Levantamiento Funcional',
            description: 'Definición de requerimientos específicos y criterios de aceptación',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 8.0,
            order: 1
          },
          {
            id: 'act-cst-2',
            templateDeliverableId: 'del-cst-scope',
            title: 'Definición de arquitectura y requerimientos técnicos',
            description: 'Modelado de base de datos e integraciones especiales',
            roleId: ROLE_PENDING_DEFINITION,
            roleName: ROLE_PENDING_DEFINITION,
            estimatedHours: 4.0,
            order: 2,
            optional: true
          }
        ]
      }
    ],
    totalHours: 12,
    estimatedDurationWeeks: 6,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-17T10:00:00Z'
  }
];

/**
 * Plantillas iniciales procesadas por el motor de cálculo
 * (garantiza exactitud en los 3 niveles de horas desde el arranque)
 */
export const INITIAL_PRODUCT_BACKLOG_TEMPLATES: ProductBacklogTemplate[] =
  [...catalogTemplates, ...rawInitialTemplates].map(recalculateTemplateHours);
