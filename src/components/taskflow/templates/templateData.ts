import {
  ProductBacklogTemplate,
  ProductBacklogTemplateCategory,
  STANDARD_UHURA_ROLES,
  ROLE_PENDING_DEFINITION
} from '../types';
import { recalculateTemplateHours } from './templateEngine';

/**
 * METADATOS DE CATEGORÍAS DE PRODUCTOS/SERVICIOS UHURA
 * Basados en el documento oficial 2026:
 * "FORMATO DE PROCESO DE ÁREA UHURA (2026) - PRODUCTO DIGITAL"
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
    key: 'landing_page',
    label: 'Landing Page en WordPress / Webflow',
    description: 'Página de aterrizaje de alta conversión para campañas y captación de leads (31 hrs promedio).',
    badgeBg: 'bg-[#10b981]/15',
    badgeText: 'text-[#10b981]'
  },
  {
    key: 'wordpress',
    label: 'Sitio Web Informativo WordPress',
    description: 'Sitio institucional completo con CMS, hasta 8 secciones, CPTs, SEO técnico y analítica (140 hrs).',
    badgeBg: 'bg-[#8a4dff]/15',
    badgeText: 'text-[#8a4dff]'
  },
  {
    key: 'mantenimiento_web',
    label: 'Mantenimiento Web WordPress',
    description: 'Soporte mensual preventivo, diagnóstico, backups, actualización de core/plugins y soporte (9 hrs/mes).',
    badgeBg: 'bg-[#38bdf8]/15',
    badgeText: 'text-[#38bdf8]'
  },
  {
    key: 'shopify',
    label: 'Tienda Online Shopify (hasta 20 SKUs)',
    description: 'E-commerce Shopify con catálogo, pasarelas, envíos, checkout optimizado y analítica GA4 (116 hrs).',
    badgeBg: 'bg-[#ec4899]/15',
    badgeText: 'text-[#ec4899]'
  },
  {
    key: 'chatbot_manychat',
    label: 'Chatbot con ManyChat',
    description: 'Automatización conversacional para WhatsApp (API Cloud / BSP), Instagram o Facebook (46.5 hrs).',
    badgeBg: 'bg-[#6366f1]/15',
    badgeText: 'text-[#6366f1]'
  },
  {
    key: 'mercado_libre',
    label: 'Mercado Libre Marketplace Store',
    description: 'Setup integral de tienda oficial en Mercado Libre, legales, banners y hasta 15 SKUs (42 hrs).',
    badgeBg: 'bg-[#f59e0b]/15',
    badgeText: 'text-[#f59e0b]'
  },
  {
    key: 'digital_shelf',
    label: 'Digital Shelf (Optimización PDPs)',
    description: 'Diagnóstico, optimización SEO y rediseño de contenido visual para hasta 5 PDPs de producto (5.5 hrs).',
    badgeBg: 'bg-[#06b6d4]/15',
    badgeText: 'text-[#06b6d4]'
  },
  {
    key: 'custom',
    label: 'Proyecto a la Medida',
    description: 'Estructura modular abierta para requerimientos y desarrollos especiales a la medida.',
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
const R_DIGITAL_DESIGNER = 'Digital Designer'; // Normalizado para Web Designer del formato

/**
 * DATOS MAESTROS OFICIALES DE PLANTILLAS
 * Fuente: "FORMATO DE PROCESO DE ÁREA UHURA(2026) - PRODUCTO DIGITAL"
 */
const rawInitialTemplates: ProductBacklogTemplate[] = [
  // ==========================================================================
  // 1. LANDING PAGE EN WORDPRESS / WEBFLOW (Total: 31 Horas)
  // ==========================================================================
  {
    id: 'tmpl-landing-page',
    name: 'Landing Page en WordPress / Webflow',
    description: 'Desarrollo de landing page de alta conversión para campañas (Kickoff, diseño en Figma, maquetación, analítica y QA).',
    category: 'landing_page',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-lp-onboarding',
        templateId: 'tmpl-landing-page',
        name: 'Onboarding & Insumos',
        description: 'Kickoff y recopilación de accesos, tracking e insumos gráficos',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-lp-1',
            templateDeliverableId: 'del-lp-onboarding',
            title: 'Kickoff & Alineación',
            description: 'Alineación de objetivos y propuesta de valor',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-lp-2',
            templateDeliverableId: 'del-lp-onboarding',
            title: 'Accesos WordPress, hosting, dominio e insumos',
            description: 'GTM, Analytics, Clarity, imágenes, casos de éxito y licencias (Elementor / Hosting)',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 1.0,
            order: 2
          }
        ]
      },
      {
        id: 'del-lp-ux',
        templateId: 'tmpl-landing-page',
        name: 'UX & Contenido',
        description: 'Diseño visual en Figma y redacción de copys persuasivos',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-lp-3',
            templateDeliverableId: 'del-lp-ux',
            title: 'Diseño landing (hasta 6 bloques) con Figma Make',
            description: 'Estructuración visual en Figma',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 1
          },
          {
            id: 'act-lp-4',
            templateDeliverableId: 'del-lp-ux',
            title: 'Ajustes visuales sobre base',
            description: 'Iteración y afinación de diseño',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 2
          },
          {
            id: 'act-lp-5',
            templateDeliverableId: 'del-lp-ux',
            title: 'Redacción de copy',
            description: 'Redacción de textos persuasivos y llamadas a la acción',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 4.0,
            order: 3
          }
        ]
      },
      {
        id: 'del-lp-impl',
        templateId: 'tmpl-landing-page',
        name: 'Implementación & Analítica',
        description: 'Maquetación responsive, formularios, analítica y SEO on-page',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-lp-6',
            templateDeliverableId: 'del-lp-impl',
            title: 'Maquetación WordPress (Bricks/Elementor) Desktop / Mobile',
            description: 'Desarrollo frontend responsive',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 12.0,
            order: 1
          },
          {
            id: 'act-lp-7',
            templateDeliverableId: 'del-lp-impl',
            title: 'Configuración de formulario',
            description: 'Setup de campos y notificación de leads',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 2
          },
          {
            id: 'act-lp-8',
            templateDeliverableId: 'del-lp-impl',
            title: 'GA4 + GTM básico',
            description: 'Instalación de código de seguimiento y evento de formulario',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 3
          },
          {
            id: 'act-lp-9',
            templateDeliverableId: 'del-lp-impl',
            title: 'SEO on-page',
            description: 'Títulos, meta descripciones y etiquetas H1/H2',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 4
          },
          {
            id: 'act-lp-10',
            templateDeliverableId: 'del-lp-impl',
            title: 'QA visual + funcional',
            description: 'Control de calidad interno previo a entrega',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 5
          }
        ]
      },
      {
        id: 'del-lp-entrega',
        templateId: 'tmpl-landing-page',
        name: 'Entrega & Soporte',
        description: 'Ronda de ajustes con cliente y entrega final',
        order: 4,
        roleBudgets: [],
        activities: [
          {
            id: 'act-lp-11',
            templateDeliverableId: 'del-lp-entrega',
            title: '1 ronda post-entrega - Cliente',
            description: 'Ajustes menores solicitados por el cliente',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 1
          },
          {
            id: 'act-lp-12',
            templateDeliverableId: 'del-lp-entrega',
            title: 'Entrega y Handover',
            description: 'Cierre del proyecto y entrega de accesos',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 2
          }
        ]
      }
    ],
    totalHours: 31,
    estimatedDurationWeeks: 3,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-17T10:00:00Z'
  },

  // ==========================================================================
  // 2. SITIO WEB INFORMATIVO WORDPRESS (Total: 140 Horas)
  // ==========================================================================
  {
    id: 'tmpl-wp-informativo',
    name: 'Sitio Web Informativo WordPress',
    description: 'Desarrollo web corporativo completo (hasta 8 secciones, CPTs, SEO técnico, analítica, capacitación y soporte).',
    category: 'wordpress',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-wp-kickoff',
        templateId: 'tmpl-wp-informativo',
        name: 'Kick-off & Discovery',
        description: 'Alineación estratégica, socialización de modelo de negocio, backlog y checkpoints',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-wp-ko-1',
            templateDeliverableId: 'del-wp-kickoff',
            title: 'Kickoff con cliente',
            description: 'Reunión inicial de alineación y presentación de equipo',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-wp-ko-2',
            templateDeliverableId: 'del-wp-kickoff',
            title: 'Socializar modelo de negocio, backlog y visión técnica',
            description: 'B2B/B2C, transaccional, servidor, integraciones actuales y alcance en Orbit/COR',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 2
          },
          {
            id: 'act-wp-ko-3',
            templateDeliverableId: 'del-wp-kickoff',
            title: 'Insumo de accesos',
            description: 'Recolección y verificación de credenciales de hosting y dominio',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 3
          },
          {
            id: 'act-wp-ko-4',
            templateDeliverableId: 'del-wp-kickoff',
            title: 'Checkpoints de seguimiento con cliente',
            description: 'Reuniones de avance semanal y actas de seguimiento',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 6.0,
            order: 4
          }
        ]
      },
      {
        id: 'del-wp-ux-cont',
        templateId: 'tmpl-wp-informativo',
        name: 'UX, Contenido & Gate 1',
        description: 'Arquitectura, diseño funcional en Figma, redacción SEO, banners gráficos y aprobación de diseño',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-wp-ux-1',
            templateDeliverableId: 'del-wp-ux-cont',
            title: 'Arquitectura UX con Figma Make',
            description: 'Definición de estructura y flujos de navegación',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 1
          },
          {
            id: 'act-wp-ux-2',
            templateDeliverableId: 'del-wp-ux-cont',
            title: 'Diseño UX/UI funcional con Figma Make',
            description: 'Wireframes y prototipo interactivo desktop/mobile',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 6.0,
            order: 2
          },
          {
            id: 'act-wp-ux-3',
            templateDeliverableId: 'del-wp-ux-cont',
            title: 'Contenido con estructura H1/H2 por página',
            description: 'Redacción de textos estructurados para SEO',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 4.0,
            order: 3
          },
          {
            id: 'act-wp-ux-4',
            templateDeliverableId: 'del-wp-ux-cont',
            title: 'Diseño de banners y elementos gráficos (hasta 7)',
            description: 'Activos gráficos visuales adaptados a la marca',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 12.0,
            order: 4
          },
          {
            id: 'act-wp-ux-5',
            templateDeliverableId: 'del-wp-ux-cont',
            title: 'QA visual + funcional diseño',
            description: 'Control de calidad del prototipo antes de presentar al cliente',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 2.0,
            order: 5
          },
          {
            id: 'act-wp-ux-6',
            templateDeliverableId: 'del-wp-ux-cont',
            title: 'Ajustes UX/UI',
            description: 'Iteraciones derivadas del feedback',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 8.0,
            order: 6
          },
          {
            id: 'act-wp-ux-7',
            templateDeliverableId: 'del-wp-ux-cont',
            title: 'GATE 1: Aprobación Diseño (5 días) + Congelamiento UAT',
            description: 'Firma y congelamiento formal del diseño aprobado',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 7
          }
        ]
      },
      {
        id: 'del-wp-implementacion',
        templateId: 'tmpl-wp-informativo',
        name: 'Implementación Técnica & Gate 2',
        description: 'Setup de servidor, maquetación de 8 secciones, ACF, formularios, performance y pruebas',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-wp-dev-1',
            templateDeliverableId: 'del-wp-implementacion',
            title: 'Setup técnico - WP + plugins base + CDN + hosting',
            description: 'PHP, cPanel, SSL, SMTP, Child theme, Elementor PRO, Yoast SEO y Caché',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 1
          },
          {
            id: 'act-wp-dev-2',
            templateDeliverableId: 'del-wp-implementacion',
            title: 'Maquetación WordPress (8 secciones) Desktop y Mobile',
            description: 'Construcción frontend responsive pixel-perfect',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 32.0,
            order: 2
          },
          {
            id: 'act-wp-dev-3',
            templateDeliverableId: 'del-wp-implementacion',
            title: 'Setup ACF (2 CPT / 6 campos máx.)',
            description: 'Custom Post Types y campos avanzados',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 4.0,
            order: 3
          },
          {
            id: 'act-wp-dev-4',
            templateDeliverableId: 'del-wp-implementacion',
            title: 'Implementación formularios (hasta 3)',
            description: 'Configuración y pruebas de envío',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 4
          },
          {
            id: 'act-wp-dev-5',
            templateDeliverableId: 'del-wp-implementacion',
            title: 'Configurar envío de Mails marketing (hasta 3)',
            description: 'Integración transaccional y notificaciones',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 5
          },
          {
            id: 'act-wp-dev-6',
            templateDeliverableId: 'del-wp-implementacion',
            title: 'Linkear botones e interacciones',
            description: 'Comprobación de rutas, modales y enlaces internos',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 4.0,
            order: 6
          },
          {
            id: 'act-wp-dev-7',
            templateDeliverableId: 'del-wp-implementacion',
            title: 'SEO on-page técnico (metaetiquetas, H1/H2, keywords)',
            description: 'Títulos, descripciones y estructura on-page',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 7
          },
          {
            id: 'act-wp-dev-8',
            templateDeliverableId: 'del-wp-implementacion',
            title: 'Performance base (carga, imágenes, caché)',
            description: 'Optimización de Core Web Vitals y PageSpeed',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 8
          },
          {
            id: 'act-wp-dev-9',
            templateDeliverableId: 'del-wp-implementacion',
            title: 'QA técnico',
            description: 'Revisión técnica de consola y responsiveness',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 9
          },
          {
            id: 'act-wp-dev-10',
            templateDeliverableId: 'del-wp-implementacion',
            title: 'QA visual y funcional de staging',
            description: 'Validación con la gerencia de cuenta',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 2.0,
            order: 10
          },
          {
            id: 'act-wp-dev-11',
            templateDeliverableId: 'del-wp-implementacion',
            title: 'Ajustes post-QA',
            description: 'Correcciones derivadas de pruebas internas',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 4.0,
            order: 11
          },
          {
            id: 'act-wp-dev-12',
            templateDeliverableId: 'del-wp-implementacion',
            title: 'Ajustes internos cliente (1 ronda)',
            description: 'Atención a observaciones del cliente en staging',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 6.0,
            order: 12
          },
          {
            id: 'act-wp-dev-13',
            templateDeliverableId: 'del-wp-implementacion',
            title: 'GATE 2: Aprobación staging (3 días) + Congelamiento UAT',
            description: 'Firma de aprobación de staging antes de Go Live',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 13
          },
          {
            id: 'act-wp-dev-14',
            templateDeliverableId: 'del-wp-implementacion',
            title: 'Ajustes finales post-aprobación staging',
            description: 'Últimas afinaciones previas al lanzamiento',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 6.0,
            order: 14
          }
        ]
      },
      {
        id: 'del-wp-lanzamiento',
        templateId: 'tmpl-wp-informativo',
        name: 'Analítica, Lanzamiento & SEO Técnico',
        description: 'GTM, GA4, Clarity, Go Live, Google Search Console, Schema y Sitemaps',
        order: 4,
        roleBudgets: [],
        activities: [
          {
            id: 'act-wp-lz-1',
            templateDeliverableId: 'del-wp-lanzamiento',
            title: 'Instalar códigos de seguimiento (GTM, GA4, Clarity)',
            description: 'Implementación de etiquetas base de analítica',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-wp-lz-2',
            templateDeliverableId: 'del-wp-lanzamiento',
            title: 'Configuración de evento de conversión en formulario',
            description: 'Tags y triggers de conversión en GTM',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 4.0,
            order: 2
          },
          {
            id: 'act-wp-lz-3',
            templateDeliverableId: 'del-wp-lanzamiento',
            title: 'Lanzamiento Go Live / Apuntamiento de dominio',
            description: 'Paso a producción, DNS, redirecciones y verificación SSL',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 3
          },
          {
            id: 'act-wp-lz-4',
            templateDeliverableId: 'del-wp-lanzamiento',
            title: 'Revisión de calidad y ajustes post-lanzamiento',
            description: 'Monitoreo de estabilidad las primeras horas',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 4.0,
            order: 4
          },
          {
            id: 'act-wp-lz-5',
            templateDeliverableId: 'del-wp-lanzamiento',
            title: 'Verificar propiedad en Google Search Console y sitemaps',
            description: 'Envío de sitemaps y comprobación de rastreo',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 5
          },
          {
            id: 'act-wp-lz-6',
            templateDeliverableId: 'del-wp-lanzamiento',
            title: 'Implementar robots.txt, sitemaps y schema markup',
            description: 'Datos estructurados para motores de búsqueda',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 6
          }
        ]
      },
      {
        id: 'del-wp-entrega-sop',
        templateId: 'tmpl-wp-informativo',
        name: 'Entrega, Capacitación & Soporte',
        description: 'Usuarios, manual de uso, checklist de entrega y bolsa de soporte de estabilización',
        order: 5,
        roleBudgets: [],
        activities: [
          {
            id: 'act-wp-ent-1',
            templateDeliverableId: 'del-wp-entrega-sop',
            title: 'Crear usuarios para cliente',
            description: 'Asignación de credenciales con roles seguros',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-wp-ent-2',
            templateDeliverableId: 'del-wp-entrega-sop',
            title: 'Capacitación al cliente',
            description: 'Sesión virtual de manejo de contenidos en WordPress',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 2
          },
          {
            id: 'act-wp-ent-3',
            templateDeliverableId: 'del-wp-entrega-sop',
            title: 'Documentación de entrega + checklist',
            description: 'Acta técnica de cierre y credenciales documentadas',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 3
          },
          {
            id: 'act-wp-ent-4',
            templateDeliverableId: 'del-wp-entrega-sop',
            title: 'Soporte post-lanzamiento',
            description: 'Acompañamiento y resolución de incidencias iniciales',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 8.0,
            order: 4
          }
        ]
      }
    ],
    totalHours: 140,
    estimatedDurationWeeks: 8,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-17T10:00:00Z'
  },

  // ==========================================================================
  // 3. MANTENIMIENTO WEB WORDPRESS (Total: 9 Horas / Mes)
  // ==========================================================================
  {
    id: 'tmpl-mantenimiento-wp',
    name: 'Mantenimiento Web WordPress',
    description: 'Bolsa de mantenimiento mensual preventivo (diagnóstico, backups, updates, scan de seguridad y soporte menor).',
    category: 'mantenimiento_web',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-mnt-analisis',
        templateId: 'tmpl-mantenimiento-wp',
        name: 'Análisis, Diagnóstico & Backups',
        description: 'Revisión de velocidad en PageSpeed, scan de métricas y copias de seguridad de arranque',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-mnt-1',
            templateDeliverableId: 'del-mnt-analisis',
            title: 'Accesos a plataforma y hosting',
            description: 'Verificación de credenciales de hosting y panel WP',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 0.5,
            order: 1
          },
          {
            id: 'act-mnt-2',
            templateDeliverableId: 'del-mnt-analisis',
            title: 'Diagnóstico de plataforma y PageSpeed',
            description: 'Velocidad de carga, tráfico e informe previo',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 2
          },
          {
            id: 'act-mnt-3',
            templateDeliverableId: 'del-mnt-analisis',
            title: 'Backup inicial y verificación de integridad',
            description: 'Copia de seguridad antes de cualquier cambio',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 0.5,
            order: 3
          }
        ]
      },
      {
        id: 'del-mnt-updates',
        templateId: 'tmpl-mantenimiento-wp',
        name: 'Actualizaciones & Seguridad',
        description: 'Actualización de WordPress core, plugins, tema y scan de vulnerabilidades',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-mnt-4',
            templateDeliverableId: 'del-mnt-updates',
            title: 'Actualización WordPress core + tema',
            description: 'Revisión de compatibilidad y parches de seguridad',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-mnt-5',
            templateDeliverableId: 'del-mnt-updates',
            title: 'Actualización de plugins',
            description: 'Update controlado de extensiones instaladas',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 0.5,
            order: 2
          },
          {
            id: 'act-mnt-6',
            templateDeliverableId: 'del-mnt-updates',
            title: 'Revisión de seguridad básica (scan de vulnerabilidades)',
            description: 'Firewalls, intentos de acceso y monitoreo',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 0.5,
            order: 3
          }
        ]
      },
      {
        id: 'del-mnt-soporte',
        templateId: 'tmpl-mantenimiento-wp',
        name: 'Ajustes Menores, Backup Final & Soporte',
        description: 'Corrección de bugs menores, ajustes de textos/imágenes, backup de cierre e informe',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-mnt-7',
            templateDeliverableId: 'del-mnt-soporte',
            title: 'Corrección de errores menores (CSS, sección caída)',
            description: 'Solución de bugs visuales o de plugins',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.5,
            order: 1
          },
          {
            id: 'act-mnt-8',
            templateDeliverableId: 'del-mnt-soporte',
            title: 'Ajustes de contenido menor',
            description: 'Cambios puntuales de textos o banners',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 0.5,
            order: 2
          },
          {
            id: 'act-mnt-9',
            templateDeliverableId: 'del-mnt-soporte',
            title: 'Status de mantenimiento, actualizaciones y prevenciones',
            description: 'Registro de actividades y reporte para cliente',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 0.5,
            order: 3
          },
          {
            id: 'act-mnt-10',
            templateDeliverableId: 'del-mnt-soporte',
            title: 'Backup final post-mantenimiento',
            description: 'Copia limpia de cierre',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 0.5,
            order: 4
          },
          {
            id: 'act-mnt-11',
            templateDeliverableId: 'del-mnt-soporte',
            title: 'Soporte técnico al cliente',
            description: 'Atención a dudas operativas del cliente',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 5
          },
          {
            id: 'act-mnt-12',
            templateDeliverableId: 'del-mnt-soporte',
            title: 'Gestión de cliente y entrega de informe',
            description: 'Envío de resumen ejecutivo de horas y mejoras',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 6
          }
        ]
      }
    ],
    totalHours: 9,
    estimatedDurationWeeks: 4,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-17T10:00:00Z'
  },

  // ==========================================================================
  // 4. TIENDA ONLINE SHOPIFY (Total: 116 Horas)
  // ==========================================================================
  {
    id: 'tmpl-tienda-shopify',
    name: 'Desarrollo de Tienda Online Shopify',
    description: 'Tienda Shopify completa con arquitectura de catálogo (hasta 20 SKUs), pasarela, envíos, analítica y capacitación.',
    category: 'shopify',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-shp-kickoff',
        templateId: 'tmpl-tienda-shopify',
        name: 'Kick-off & Arquitectura Base',
        description: 'Objetivos e-commerce, insumos, definición de plantilla y Gate 1 de diseño',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-shp-1',
            templateDeliverableId: 'del-shp-kickoff',
            title: 'Reunión kickoff + objetivos e-commerce',
            description: 'Estrategia comercial y metas de conversión',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 2.0,
            order: 1
          },
          {
            id: 'act-shp-2',
            templateDeliverableId: 'del-shp-kickoff',
            title: 'Backlog y visión de producto ecommerce',
            description: 'Estructuración de requerimientos en Orbit',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 2
          },
          {
            id: 'act-shp-3',
            templateDeliverableId: 'del-shp-kickoff',
            title: 'Solicitud accesos / insumos cliente',
            description: 'Imágenes, precios, inventarios e identificaciones fiscales',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 3
          },
          {
            id: 'act-shp-4',
            templateDeliverableId: 'del-shp-kickoff',
            title: 'Checkpoints semanales con cliente',
            description: 'Alineación de avances y actas',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 6.0,
            order: 4
          },
          {
            id: 'act-shp-5',
            templateDeliverableId: 'del-shp-kickoff',
            title: 'Definición estructura catálogo (tipos, colecciones, variantes)',
            description: 'Taxonomía de productos y atributos',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 5
          },
          {
            id: 'act-shp-6',
            templateDeliverableId: 'del-shp-kickoff',
            title: 'Definición plantilla base Shopify (2 opciones)',
            description: 'Selección de tema acorde a la identidad y requerimientos',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 6
          },
          {
            id: 'act-shp-7',
            templateDeliverableId: 'del-shp-kickoff',
            title: 'GATE 1: Aprobación Diseño (5 días) + Congelamiento UAT',
            description: 'Validación formal del cliente para iniciar desarrollo',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 7
          }
        ]
      },
      {
        id: 'del-shp-contenido',
        templateId: 'tmpl-tienda-shopify',
        name: 'Contenido Base & Banners',
        description: 'Keyword research, redacción de páginas institucionales, metadescripciones y diseño de banners',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-shp-8',
            templateDeliverableId: 'del-shp-contenido',
            title: 'Keyword research e intenciones de búsqueda e-commerce',
            description: 'Investigación de palabras clave con intención de compra',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 1
          },
          {
            id: 'act-shp-9',
            templateDeliverableId: 'del-shp-contenido',
            title: 'Redacción Home + Nosotros + Contacto + Legales adaptados',
            description: 'Copys institucionales adaptados a la marca',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 4.0,
            order: 2
          },
          {
            id: 'act-shp-10',
            templateDeliverableId: 'del-shp-contenido',
            title: 'Metadescripciones Home + hasta 3 colecciones',
            description: 'Optimización SEO on-page para ecommerce',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 3
          },
          {
            id: 'act-shp-11',
            templateDeliverableId: 'del-shp-contenido',
            title: 'Banners (2 Hero home, 2 secundarios, placeholder producto)',
            description: 'Diseño visual de activos para tienda online',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 8.0,
            order: 4
          }
        ]
      },
      {
        id: 'del-shp-setup',
        templateId: 'tmpl-tienda-shopify',
        name: 'Setup Shopify & Configuración Comercial',
        description: 'Licencias, pasarelas de pago, envíos, checkout, políticas legales y QA visual',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-shp-12',
            templateDeliverableId: 'del-shp-setup',
            title: 'Reunión de compra de licencia / pasarela de pagos',
            description: 'Acompañamiento en vinculación bancaria y pasarela (PayU, Wompi, etc.)',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-shp-13',
            templateDeliverableId: 'del-shp-setup',
            title: 'Configuración general tienda (moneda, mercado, idioma)',
            description: 'Ajustes regionales y de operación',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 2
          },
          {
            id: 'act-shp-14',
            templateDeliverableId: 'del-shp-setup',
            title: 'Configuración navegación (header + footer)',
            description: 'Menús principales y de pie de página',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 3
          },
          {
            id: 'act-shp-15',
            templateDeliverableId: 'del-shp-setup',
            title: 'Configuración de checkout',
            description: 'Campos requeridos, propinas y opciones de pago',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 4
          },
          {
            id: 'act-shp-16',
            templateDeliverableId: 'del-shp-setup',
            title: 'Configuración envíos tarifa fija',
            description: 'Zonas y tarifas nacionales/locales',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 3.0,
            order: 5
          },
          {
            id: 'act-shp-17',
            templateDeliverableId: 'del-shp-setup',
            title: 'Configuración de impuestos',
            description: 'IVA y reglas tributarias colombianas/regionales',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 6
          },
          {
            id: 'act-shp-18',
            templateDeliverableId: 'del-shp-setup',
            title: 'Políticas legales base (privacidad, términos, devoluciones)',
            description: 'Adaptación y publicación en Shopify',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 7
          },
          {
            id: 'act-shp-19',
            templateDeliverableId: 'del-shp-setup',
            title: 'QA visual y funcional de setup',
            description: 'Revisión de consistencia con el Lead de Producto',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 8
          }
        ]
      },
      {
        id: 'del-shp-ui',
        templateId: 'tmpl-tienda-shopify',
        name: 'Template & UI Styling',
        description: 'Instalación de template, personalización visual, diseño de Home, PDP, Carrito e interiores',
        order: 4,
        roleBudgets: [],
        activities: [
          {
            id: 'act-shp-20',
            templateDeliverableId: 'del-shp-ui',
            title: 'Instalación y configuración de template',
            description: 'Carga de theme y estructura inicial',
            roleId: R_DIGITAL_DESIGNER,
            roleName: R_DIGITAL_DESIGNER,
            estimatedHours: 2.0,
            order: 1
          },
          {
            id: 'act-shp-21',
            templateDeliverableId: 'del-shp-ui',
            title: 'Customización visual global (tipografías, colores, estilos)',
            description: 'Aplicación del manual de identidad',
            roleId: R_DIGITAL_DESIGNER,
            roleName: R_DIGITAL_DESIGNER,
            estimatedHours: 4.0,
            order: 2
          },
          {
            id: 'act-shp-22',
            templateDeliverableId: 'del-shp-ui',
            title: 'Home (banners + secciones)',
            description: 'Composición de la página principal',
            roleId: R_DIGITAL_DESIGNER,
            roleName: R_DIGITAL_DESIGNER,
            estimatedHours: 4.0,
            order: 3
          },
          {
            id: 'act-shp-23',
            templateDeliverableId: 'del-shp-ui',
            title: 'PDP Producto (Product Detail Page)',
            description: 'Diseño y diagramación de ficha de producto',
            roleId: R_DIGITAL_DESIGNER,
            roleName: R_DIGITAL_DESIGNER,
            estimatedHours: 4.0,
            order: 4
          },
          {
            id: 'act-shp-24',
            templateDeliverableId: 'del-shp-ui',
            title: 'Carrito de compras y drawer',
            description: 'Flujo visual de añadido y carrito',
            roleId: R_DIGITAL_DESIGNER,
            roleName: R_DIGITAL_DESIGNER,
            estimatedHours: 2.0,
            order: 5
          },
          {
            id: 'act-shp-25',
            templateDeliverableId: 'del-shp-ui',
            title: 'Páginas internas (Nosotros, Contacto, Políticas)',
            description: 'Diagramación de páginas secundarias',
            roleId: R_DIGITAL_DESIGNER,
            roleName: R_DIGITAL_DESIGNER,
            estimatedHours: 4.0,
            order: 6
          }
        ]
      },
      {
        id: 'del-shp-catalogo',
        templateId: 'tmpl-tienda-shopify',
        name: 'Catálogo de Productos (hasta 20 SKUs)',
        description: 'Plantilla de títulos y descripciones, colecciones, subcolecciones y carga de productos',
        order: 5,
        roleBudgets: [],
        activities: [
          {
            id: 'act-shp-26',
            templateDeliverableId: 'del-shp-catalogo',
            title: 'CSV Títulos optimizados + plantilla descripción para hasta 20 productos',
            description: 'Redacción de fichas persuasivas y optimizadas',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 4.0,
            order: 1
          },
          {
            id: 'act-shp-27',
            templateDeliverableId: 'del-shp-catalogo',
            title: 'Creación de colecciones (hasta 3)',
            description: 'Agrupaciones de productos',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 2
          },
          {
            id: 'act-shp-28',
            templateDeliverableId: 'del-shp-catalogo',
            title: 'Subcolecciones y organización de menú',
            description: 'Filtros y navegación anidada',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 3.0,
            order: 3
          },
          {
            id: 'act-shp-29',
            templateDeliverableId: 'del-shp-catalogo',
            title: 'Configuración tipos de producto y variantes',
            description: 'Tallas, colores o materiales',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 4
          },
          {
            id: 'act-shp-30',
            templateDeliverableId: 'del-shp-catalogo',
            title: 'Carga de productos (hasta 20 SKUs)',
            description: 'Imágenes, precios, SKU y control de stock',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 6.0,
            order: 5
          },
          {
            id: 'act-shp-31',
            templateDeliverableId: 'del-shp-catalogo',
            title: 'QA visual y funcional de catálogo',
            description: 'Verificación de precios e inventario',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 6
          }
        ]
      },
      {
        id: 'del-shp-qa-lanzamiento',
        templateId: 'tmpl-tienda-shopify',
        name: 'QA, Gate 2 & Lanzamiento',
        description: 'SEO técnico, pruebas de checkout real, Gate 2 de aprobación, dominio y analítica GA4',
        order: 6,
        roleBudgets: [],
        activities: [
          {
            id: 'act-shp-32',
            templateDeliverableId: 'del-shp-qa-lanzamiento',
            title: 'SEO técnico (robots.txt, sitemaps, URLs)',
            description: 'Configuración de rastreo e indexación',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-shp-33',
            templateDeliverableId: 'del-shp-qa-lanzamiento',
            title: 'Verificación de indexación y Google Search Console',
            description: 'Comprobación de etiquetas de verificación',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 2
          },
          {
            id: 'act-shp-34',
            templateDeliverableId: 'del-shp-qa-lanzamiento',
            title: 'QA técnico y pruebas de checkout',
            description: 'Prueba de pasarela en modo sandbox',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 0.5,
            order: 3
          },
          {
            id: 'act-shp-35',
            templateDeliverableId: 'del-shp-qa-lanzamiento',
            title: 'Validación responsive mobile / tablet / desktop',
            description: 'Comprobación de fluidez visual',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 4
          },
          {
            id: 'act-shp-36',
            templateDeliverableId: 'del-shp-qa-lanzamiento',
            title: 'Validación de flujo completo de compra',
            description: 'Test de pedido de prueba en tienda real',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 5
          },
          {
            id: 'act-shp-37',
            templateDeliverableId: 'del-shp-qa-lanzamiento',
            title: 'QA funcional de flujo de compra con usuario real',
            description: 'Simulación de experiencia de usuario final',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 0.5,
            order: 6
          },
          {
            id: 'act-shp-38',
            templateDeliverableId: 'del-shp-qa-lanzamiento',
            title: 'GATE 2: Aprobación staging (3 días) + Congelamiento UAT',
            description: 'Visto bueno formal del cliente para salir a producción',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 7
          },
          {
            id: 'act-shp-39',
            templateDeliverableId: 'del-shp-qa-lanzamiento',
            title: 'Lanzamiento Go Live / Apuntamiento de dominio',
            description: 'Conexión de dominio propio y activación SSL',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 8
          },
          {
            id: 'act-shp-40',
            templateDeliverableId: 'del-shp-qa-lanzamiento',
            title: 'QA post-lanzamiento en producción',
            description: 'Monitoreo de primeras transacciones',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 4.0,
            order: 9
          },
          {
            id: 'act-shp-41',
            templateDeliverableId: 'del-shp-qa-lanzamiento',
            title: 'Instalar códigos de seguimiento (GTM, GA4, Clarity)',
            description: 'Configuración de analítica avanzada para e-commerce',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 10
          },
          {
            id: 'act-shp-42',
            templateDeliverableId: 'del-shp-qa-lanzamiento',
            title: 'Configuración de eventos y conversiones en GTM',
            description: 'View item, Add to cart, Initiate checkout y Purchase',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 4.0,
            order: 11
          },
          {
            id: 'act-shp-43',
            templateDeliverableId: 'del-shp-qa-lanzamiento',
            title: 'Pruebas de eventos y conversiones',
            description: 'Debug de etiquetas en Tag Assistant',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 12
          }
        ]
      },
      {
        id: 'del-shp-entrega',
        templateId: 'tmpl-tienda-shopify',
        name: 'Entrega, Capacitación & Soporte',
        description: 'Capacitación al cliente en gestión de pedidos, checklist de entrega y soporte post-go-live',
        order: 7,
        roleBudgets: [],
        activities: [
          {
            id: 'act-shp-44',
            templateDeliverableId: 'del-shp-entrega',
            title: 'Capacitación en administración de pedidos e inventario',
            description: 'Sesión para que el cliente gestione su catálogo y despachos',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-shp-45',
            templateDeliverableId: 'del-shp-entrega',
            title: 'Documentación de entrega + checklist',
            description: 'Guía técnica y accesos documentados',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 2
          },
          {
            id: 'act-shp-46',
            templateDeliverableId: 'del-shp-entrega',
            title: 'Reunión de cierre del proyecto con cliente',
            description: 'Acta de entrega a satisfacción',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 1.0,
            order: 3
          },
          {
            id: 'act-shp-47',
            templateDeliverableId: 'del-shp-entrega',
            title: 'Soporte post-lanzamiento Shopify',
            description: 'Acompañamiento y resolución de incidencias iniciales',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 8.0,
            order: 4
          }
        ]
      }
    ],
    totalHours: 116,
    estimatedDurationWeeks: 8,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-17T10:00:00Z'
  },

  // ==========================================================================
  // 5. CHATBOT CON MANYCHAT (Total: 46.5 Horas)
  // ==========================================================================
  {
    id: 'tmpl-chatbot-manychat',
    name: 'Chatbot con ManyChat',
    description: 'Automatización conversacional para WhatsApp (API Cloud / BSP), Instagram o Facebook con árbol de respuestas y derivación.',
    category: 'chatbot_manychat',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-cht-kickoff',
        templateId: 'tmpl-chatbot-manychat',
        name: 'Kick-off & Arquitectura Conversacional',
        description: 'Alineación de objetivos, recolección de FAQs y diseño del árbol conversacional',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-cht-1',
            templateDeliverableId: 'del-cht-kickoff',
            title: 'Kickoff con cliente',
            description: 'Definición de casos de uso y objetivos del bot',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-cht-2',
            templateDeliverableId: 'del-cht-kickoff',
            title: 'Backlog y visión funcional del bot',
            description: 'Estructuración de flujos y requerimientos en Orbit',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 1.0,
            order: 2
          },
          {
            id: 'act-cht-3',
            templateDeliverableId: 'del-cht-kickoff',
            title: 'Insumo de accesos (Meta, ManyChat y recolección de FAQs)',
            description: 'Recolección de credenciales y catálogo de preguntas frecuentes',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 3
          },
          {
            id: 'act-cht-4',
            templateDeliverableId: 'del-cht-kickoff',
            title: 'Checkpoints de seguimiento con cliente',
            description: 'Alineación y revisión de avances',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 4.0,
            order: 4
          },
          {
            id: 'act-cht-5',
            templateDeliverableId: 'del-cht-kickoff',
            title: 'Definición de árbol conversacional',
            description: 'Mapeo de caminos, botones y bifurcaciones lógicas',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 5
          },
          {
            id: 'act-cht-6',
            templateDeliverableId: 'del-cht-kickoff',
            title: 'Redacción de mensajes y tono de voz del bot',
            description: 'Textos amables, directos y adaptados a la marca',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 6
          }
        ]
      },
      {
        id: 'del-cht-meta',
        templateId: 'tmpl-chatbot-manychat',
        name: 'Gestión Meta & WhatsApp API',
        description: 'Configuración de Business Manager, verificación de empresa, alta de número BSP y plantillas',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-cht-7',
            templateDeliverableId: 'del-cht-meta',
            title: 'Revisión Business Manager',
            description: 'Auditoría de activos y accesos en Meta',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-cht-8',
            templateDeliverableId: 'del-cht-meta',
            title: 'Verificación de empresa en Meta',
            description: 'Acompañamiento en el proceso formal de validación',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 2
          },
          {
            id: 'act-cht-9',
            templateDeliverableId: 'del-cht-meta',
            title: 'Alta de número telefónico en BSP',
            description: 'Aprovisionamiento de la línea para API',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 3
          },
          {
            id: 'act-cht-10',
            templateDeliverableId: 'del-cht-meta',
            title: 'Vincular número a ManyChat',
            description: 'Enlace de la línea aprobada con la cuenta de ManyChat',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 4
          },
          {
            id: 'act-cht-11',
            templateDeliverableId: 'del-cht-meta',
            title: 'Plantillas de mensajes Meta (HSMs)',
            description: 'Redacción y aprobación de plantillas en WhatsApp Manager',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 1.5,
            order: 5
          },
          {
            id: 'act-cht-12',
            templateDeliverableId: 'del-cht-meta',
            title: 'Pruebas de envío y recepción',
            description: 'Test de conectividad y mensajería',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 6
          },
          {
            id: 'act-cht-13',
            templateDeliverableId: 'del-cht-meta',
            title: 'Documentación técnica cliente',
            description: 'Ficha de estado de la cuenta Meta',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 0.5,
            order: 7
          }
        ]
      },
      {
        id: 'del-cht-config',
        templateId: 'tmpl-chatbot-manychat',
        name: 'Configuración ManyChat & Flujos',
        description: 'Conexión de canales, WhatsApp Cloud API, palabras clave, captura de datos y fallback a humano',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-cht-14',
            templateDeliverableId: 'del-cht-config',
            title: 'Conexión de canal (WA / IG / FB)',
            description: 'Integración del canal seleccionado en ManyChat',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 1
          },
          {
            id: 'act-cht-15',
            templateDeliverableId: 'del-cht-config',
            title: 'WhatsApp API (Cloud) habilitación y setup',
            description: 'Habilitación de API Cloud en Meta Developer si no se tiene',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 10.0,
            order: 2
          },
          {
            id: 'act-cht-16',
            templateDeliverableId: 'del-cht-config',
            title: 'Configuración de palabras clave (Keywords)',
            description: 'Triggers y disparadores por palabras de usuario',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 3
          },
          {
            id: 'act-cht-17',
            templateDeliverableId: 'del-cht-config',
            title: 'Construcción del flujo principal',
            description: 'Diagramación de bloques y automatizaciones en ManyChat',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 4.0,
            order: 4
          },
          {
            id: 'act-cht-18',
            templateDeliverableId: 'del-cht-config',
            title: 'Captura de datos de usuario',
            description: 'Campos personalizados (nombre, correo, consulta, etc.)',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 5
          },
          {
            id: 'act-cht-19',
            templateDeliverableId: 'del-cht-config',
            title: 'Transferencia a agente humano (Live Chat)',
            description: 'Reglas de escalado a asesor comercial/soporte',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 6
          },
          {
            id: 'act-cht-20',
            templateDeliverableId: 'del-cht-config',
            title: 'Horarios de atención y fallback fuera de servicio',
            description: 'Mensajes automáticos en horarios no hábiles',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 7
          },
          {
            id: 'act-cht-21',
            templateDeliverableId: 'del-cht-config',
            title: 'Pruebas funcionales de extremo a extremo',
            description: 'Testeo de todas las rutas y respuestas',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 8
          },
          {
            id: 'act-cht-22',
            templateDeliverableId: 'del-cht-config',
            title: 'Salida al aire (Go Live)',
            description: 'Activación del bot para el público general',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 0.5,
            order: 9
          }
        ]
      },
      {
        id: 'del-cht-entrega',
        templateId: 'tmpl-chatbot-manychat',
        name: 'Entrega, Capacitación & Soporte',
        description: 'Capacitación al equipo de asesores, manual de uso y soporte inicial',
        order: 4,
        roleBudgets: [],
        activities: [
          {
            id: 'act-cht-23',
            templateDeliverableId: 'del-cht-entrega',
            title: 'Capacitación al cliente / asesores',
            description: 'Entrenamiento en atención desde ManyChat Live Chat',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-cht-24',
            templateDeliverableId: 'del-cht-entrega',
            title: 'Documento de entrega y accesos',
            description: 'Acta de entrega y credenciales documentadas',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 2
          },
          {
            id: 'act-cht-25',
            templateDeliverableId: 'del-cht-entrega',
            title: 'Soporte y estabilización de bot',
            description: 'Acompañamiento inicial durante los primeros días',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 2.0,
            order: 3
          }
        ]
      }
    ],
    totalHours: 46.5,
    estimatedDurationWeeks: 4,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-17T10:00:00Z'
  },

  // ==========================================================================
  // 6. MERCADO LIBRE STORE (Total: 42 Horas)
  // ==========================================================================
  {
    id: 'tmpl-mercado-libre',
    name: 'Tienda Oficial en Mercado Libre',
    description: 'Setup integral de tienda oficial en Mercado Libre: alcance, configuración técnica, diseño de banners, reputación y hasta 15 SKUs.',
    category: 'mercado_libre',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-ml-kickoff',
        templateId: 'tmpl-mercado-libre',
        name: 'Fase 0 – Kickoff & Alcance',
        description: 'Kickoff, visión de producto, insumos, checkpoints y análisis de categoría/keywords',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-ml-1',
            templateDeliverableId: 'del-ml-kickoff',
            title: 'Kickoff con cliente',
            description: 'Alineación de objetivos en marketplace',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-ml-2',
            templateDeliverableId: 'del-ml-kickoff',
            title: 'Definición de alcance y visión de producto ML',
            description: 'Planificación de catálogo e inventario objetivo',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 2
          },
          {
            id: 'act-ml-3',
            templateDeliverableId: 'del-ml-kickoff',
            title: 'Insumo de accesos',
            description: 'Verificación de cuenta y documentación requerida por Mercado Libre',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 2.0,
            order: 3
          },
          {
            id: 'act-ml-4',
            templateDeliverableId: 'del-ml-kickoff',
            title: 'Checkpoints con cliente',
            description: 'Reuniones periódicas de seguimiento',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 4.0,
            order: 4
          },
          {
            id: 'act-ml-5',
            templateDeliverableId: 'del-ml-kickoff',
            title: 'Análisis categoría + competencia + keywords marketplace',
            description: 'Benchmark de precios, términos de búsqueda y competencia',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 3.0,
            order: 5
          }
        ]
      },
      {
        id: 'del-ml-setup',
        templateId: 'tmpl-mercado-libre',
        name: 'Setup Tienda Mercado Libre',
        description: 'Propuesta de valor, legales, configuración técnica, banners visuales, políticas de envío y reputación',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-ml-6',
            templateDeliverableId: 'del-ml-setup',
            title: 'Propuesta de valor de la tienda + legales',
            description: 'Redacción de perfil comercial y garantías',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 1
          },
          {
            id: 'act-ml-7',
            templateDeliverableId: 'del-ml-setup',
            title: 'Categorías y subcategorías',
            description: 'Estructuración de árbol de navegación en ML',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 2
          },
          {
            id: 'act-ml-8',
            templateDeliverableId: 'del-ml-setup',
            title: 'Setup configuración técnica tienda ML',
            description: 'Ajustes en Mercado Shops / Brand Store de ML',
            roleId: R_DIGITAL_DESIGNER,
            roleName: R_DIGITAL_DESIGNER,
            estimatedHours: 4.0,
            order: 3
          },
          {
            id: 'act-ml-9',
            templateDeliverableId: 'del-ml-setup',
            title: 'Banners y elementos gráficos tienda general',
            description: 'Piezas gráficas para cabecera y destacados',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 4.0,
            order: 4
          },
          {
            id: 'act-ml-10',
            templateDeliverableId: 'del-ml-setup',
            title: 'Configuración cuenta y datos comerciales',
            description: 'Facturación, Mercado Pago y datos de contacto',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 1.0,
            order: 5
          },
          {
            id: 'act-ml-11',
            templateDeliverableId: 'del-ml-setup',
            title: 'Políticas de envío y devoluciones',
            description: 'Mercado Envíos, Flex y reglas de logística',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 1.0,
            order: 6
          },
          {
            id: 'act-ml-12',
            templateDeliverableId: 'del-ml-setup',
            title: 'Configuración reputación & tiempos de despacho',
            description: 'Parámetros para proteger la medalla de vendedor',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 1.0,
            order: 7
          },
          {
            id: 'act-ml-13',
            templateDeliverableId: 'del-ml-setup',
            title: 'Validación QA de setup',
            description: 'Control de calidad interno',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 1.0,
            order: 8
          }
        ]
      },
      {
        id: 'del-ml-publicacion',
        templateId: 'tmpl-mercado-libre',
        name: 'Publicación, Validación & Capacitación',
        description: 'Carga de hasta 15 SKUs, QA visual, QA de SEO, validación final y capacitación al cliente',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-ml-14',
            templateDeliverableId: 'del-ml-publicacion',
            title: 'Carga de hasta 15 SKUs',
            description: 'Carga de fotos, fichas técnicas, precios y stock',
            roleId: R_DIGITAL_DESIGNER,
            roleName: R_DIGITAL_DESIGNER,
            estimatedHours: 6.0,
            order: 1
          },
          {
            id: 'act-ml-15',
            templateDeliverableId: 'del-ml-publicacion',
            title: 'QA visual y narrativa',
            description: 'Comprobación de fotos y coherencia de marca',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 2
          },
          {
            id: 'act-ml-16',
            templateDeliverableId: 'del-ml-publicacion',
            title: 'QA SEO en títulos y fichas de producto',
            description: 'Optimización para el algoritmo de búsqueda de ML',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 3
          },
          {
            id: 'act-ml-17',
            templateDeliverableId: 'del-ml-publicacion',
            title: 'Validación final de tienda publicada',
            description: 'Revisión general en vivo',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 4
          },
          {
            id: 'act-ml-18',
            templateDeliverableId: 'del-ml-publicacion',
            title: 'Capacitación al cliente en gestión de ML',
            description: 'Entrenamiento en despachos, preguntas y stock',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 2.0,
            order: 5
          }
        ]
      }
    ],
    totalHours: 42,
    estimatedDurationWeeks: 4,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-17T10:00:00Z'
  },

  // ==========================================================================
  // 7. DIGITAL SHELF - OPTIMIZACIÓN DE PDPs (Total: 5.5 Horas)
  // ==========================================================================
  {
    id: 'tmpl-digital-shelf',
    name: 'Digital Shelf - Optimización de PDP (hasta 5 momentos)',
    description: 'Diagnóstico, optimización SEO de contenidos y rediseño visual de hasta 5 fichas de producto (PDP) de alto impacto.',
    category: 'digital_shelf',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-ds-gestion',
        templateId: 'tmpl-digital-shelf',
        name: 'Gestión & Diagnóstico',
        description: 'Revisión y auditoría de fichas de producto existentes',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-ds-1',
            templateDeliverableId: 'del-ds-gestion',
            title: 'Gestión y revisión del proyecto',
            description: 'Coordinación con el cliente y seguimiento',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 0.5,
            order: 1
          },
          {
            id: 'act-ds-2',
            templateDeliverableId: 'del-ds-gestion',
            title: 'Auditoría de PDPs actuales',
            description: 'Diagnóstico de puntos de mejora en contenido e imágenes',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 0.5,
            order: 2
          }
        ]
      },
      {
        id: 'del-ds-contenido',
        templateId: 'tmpl-digital-shelf',
        name: 'Optimización de Contenido & SEO',
        description: 'Meta descripción, metatitle, viñetas de beneficios y frases persuasivas de consumo',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-ds-3',
            templateDeliverableId: 'del-ds-contenido',
            title: 'Meta descripción y Metatitle optimizados',
            description: 'Palabras clave relevantes y listas/viñetas de legibilidad',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 0.5,
            order: 1
          },
          {
            id: 'act-ds-4',
            templateDeliverableId: 'del-ds-contenido',
            title: 'Frases destacadas para beneficios y momentos de consumo',
            description: 'Textos persuasivos para imágenes (Lifestyle, Momento de consumo)',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 0.5,
            order: 2
          }
        ]
      },
      {
        id: 'del-ds-imagenes',
        templateId: 'tmpl-digital-shelf',
        name: 'Optimización de Imágenes & Entrega',
        description: 'Hasta 5 imágenes optimizadas por producto (Beneficios, Lifestyle, Family shot, Size) y control de calidad',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-ds-5',
            templateDeliverableId: 'del-ds-imagenes',
            title: 'Optimización de imágenes para cada PDP (hasta 5 imágenes)',
            description: 'Beneficios, Lifestyle, Momento de consumo, Family shot y Product size',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 2.0,
            order: 1
          },
          {
            id: 'act-ds-6',
            templateDeliverableId: 'del-ds-imagenes',
            title: 'Control de calidad interna y ajustes',
            description: 'Revisión de arte y legibilidad',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.5,
            order: 2
          },
          {
            id: 'act-ds-7',
            templateDeliverableId: 'del-ds-imagenes',
            title: 'Revisión y aprobación con cliente',
            description: 'Visto bueno para publicación en web o marketplace',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 0.5,
            order: 3
          },
          {
            id: 'act-ds-8',
            templateDeliverableId: 'del-ds-imagenes',
            title: 'Informe de entrega y publicación',
            description: 'Entrega final de las 5 PDPs optimizadas en contenido y diseño',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 0.5,
            order: 4
          }
        ]
      }
    ],
    totalHours: 5.5,
    estimatedDurationWeeks: 2,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-17T10:00:00Z'
  },

  // ==========================================================================
  // 8. PROYECTO A LA MEDIDA (Abierto)
  // ==========================================================================
  {
    id: 'tmpl-custom-blank',
    name: 'Proyecto a la Medida (Personalizable)',
    description: 'Plantilla base modular para estructurar soluciones técnicas específicas y personalizadas desde cero.',
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
  rawInitialTemplates.map(recalculateTemplateHours);
