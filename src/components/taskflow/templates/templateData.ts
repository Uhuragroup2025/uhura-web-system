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
 * 
 * Reglas de Gobernanza:
 * 1. Base Operativa Confirmada: 7 plantillas paquetizadas directas de la fuente primaria de Producto Digital.
 * 2. Propuesta Técnica: 1 plantilla modular abierta ('custom' / 'tmpl-custom-blank') para soporte de New Business.
 * 3. Desacoplamiento: La edición de una plantilla maestra genera una nueva versión y no altera cotizaciones históricas.
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
    key: 'seo',
    label: 'SEO (Estrategia & Auditoría)',
    description: 'Diagnóstico integral, keyword research, auditoría técnica SEO on-page/off-page y estrategia inicial (47 hrs).',
    badgeBg: 'bg-[#10b981]/15',
    badgeText: 'text-[#10b981]'
  },
  {
    key: 'growth_pauta',
    label: 'Gestión & Optimización de Pauta',
    description: 'Monitoreo diario de alertas, pujas, audiencias, costos y planeación mensual estratégica de medios (52 hrs/mes).',
    badgeBg: 'bg-[#f59e0b]/15',
    badgeText: 'text-[#f59e0b]'
  },
  {
    key: 'crm_hubspot',
    label: 'Auditoría CRM & Email - HubSpot',
    description: 'Auditoría completa de contactos, segmentación, workflows de automatización, secuencias de email y roadmap (70 hrs).',
    badgeBg: 'bg-[#ef4444]/15',
    badgeText: 'text-[#ef4444]'
  },
  {
    key: 'branding',
    label: 'Diseño de Marca & Identidad (Branding)',
    description: 'Proceso integral de branding: buyer persona, arquitectura de marca, naming, narrativa, manual y manifiesto (81.4 hrs).',
    badgeBg: 'bg-[#8a4dff]/15',
    badgeText: 'text-[#8a4dff]'
  },
  {
    key: 'social_media',
    label: 'Contenido para Redes Sociales',
    description: 'Parrilla mensual de 12 publicaciones, producción de video corto UGC, diseño gráfico, publicación y reporte (42.4 hrs/mes).',
    badgeBg: 'bg-[#06b6d4]/15',
    badgeText: 'text-[#06b6d4]'
  },
  {
    key: 'campana_creativa',
    label: 'Creatividad & Campañas',
    description: 'Conceptualización estratégica, redacción de concepto creativo, diseño de Key Visual y presentación de campaña (41.4 hrs).',
    badgeBg: 'bg-[#ec4899]/15',
    badgeText: 'text-[#ec4899]'
  },
  {
    key: 'creativos_pauta',
    label: 'Creativos de Pauta Digital',
    description: 'Pack de redacción de copies y diseño de anuncios estáticos/animados optimizados para pruebas A/B de pauta (11 hrs).',
    badgeBg: 'bg-[#6366f1]/15',
    badgeText: 'text-[#6366f1]'
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
  // 8. GROWTH: SEO (ONE SHOT) O PRIMER MES (Total: 46.96 Horas)
  // Fuente: FORMATO DE PROCESO DE ÁREA UHURA - GROWTH
  // ==========================================================================
  {
    id: 'tmpl-seo-one-shot',
    name: 'SEO (One Shot) o Primer Mes',
    description: 'Servicio integral de diagnóstico, keyword research, auditoría técnica SEO y estrategia inicial para nuevos clientes SEO.',
    category: 'seo',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Growth',
    deliverables: [
      {
        id: 'del-seo-onboarding',
        templateId: 'tmpl-seo-one-shot',
        name: 'Onboarding & Insumos Iniciales',
        description: 'Briefing, alineación con cliente y entrega de requerimientos al equipo',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-seo-1',
            templateDeliverableId: 'del-seo-onboarding',
            title: 'Desarrollar formato de Brief',
            description: 'Estructuración de preguntas clave para el cliente',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 0.17,
            order: 1
          },
          {
            id: 'act-seo-2',
            templateDeliverableId: 'del-seo-onboarding',
            title: 'Solicitar reunión con cliente',
            description: 'Coordinación y agendamiento con stakeholders del cliente',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 0.08,
            order: 2
          },
          {
            id: 'act-seo-3',
            templateDeliverableId: 'del-seo-onboarding',
            title: 'Realizar reunión de kickoff con Brief',
            description: 'Levantamiento de objetivos comerciales y técnicos',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 1.0,
            order: 3
          },
          {
            id: 'act-seo-4',
            templateDeliverableId: 'del-seo-onboarding',
            title: 'Entregar brief al equipo',
            description: 'Socialización y asignación de tareas internas',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 1.0,
            order: 4
          },
          {
            id: 'act-seo-5',
            templateDeliverableId: 'del-seo-onboarding',
            title: 'Solicitar requerimiento de acuerdo al brief al equipo',
            description: 'Seguimiento de insumos técnicos iniciales',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 0.08,
            order: 5
          }
        ]
      },
      {
        id: 'del-seo-kw-research',
        templateId: 'tmpl-seo-one-shot',
        name: 'Keyword Research & Intenciones de Búsqueda',
        description: 'Investigación profunda, filtrado, dificultad y selección de palabras clave',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-seo-6',
            templateDeliverableId: 'del-seo-kw-research',
            title: 'Definición de objetivos y audiencia',
            description: 'Segmentación del público objetivo y metas de tráfico',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 0.33,
            order: 1
          },
          {
            id: 'act-seo-7',
            templateDeliverableId: 'del-seo-kw-research',
            title: 'Análisis de la competencia',
            description: 'Benchmark de términos de búsqueda de competidores directos',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 2
          },
          {
            id: 'act-seo-8',
            templateDeliverableId: 'del-seo-kw-research',
            title: 'Brainstorming y generación de palabras clave iniciales',
            description: 'Lluvia de ideas de temas y preguntas frecuentes',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 3
          },
          {
            id: 'act-seo-9',
            templateDeliverableId: 'del-seo-kw-research',
            title: 'Uso de herramientas de keyword research',
            description: 'Extracción de datos en Semrush, Ahrefs y Keyword Planner',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 4
          },
          {
            id: 'act-seo-10',
            templateDeliverableId: 'del-seo-kw-research',
            title: 'Filtrado y agrupación de palabras clave',
            description: 'Agrupación temática (topic clusters) y volúmenes',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 5
          },
          {
            id: 'act-seo-11',
            templateDeliverableId: 'del-seo-kw-research',
            title: 'Análisis de intención de búsqueda',
            description: 'Clasificación informativa, transaccional o navegacional',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 6
          },
          {
            id: 'act-seo-12',
            templateDeliverableId: 'del-seo-kw-research',
            title: 'Evaluación de dificultad de palabras clave',
            description: 'Análisis de Keyword Difficulty (KD) y viabilidad de ranking',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 0.5,
            order: 7
          },
          {
            id: 'act-seo-13',
            templateDeliverableId: 'del-seo-kw-research',
            title: 'Selección de palabras clave finales',
            description: 'Matriz priorizada de keywords objetivo para el cliente',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 0.5,
            order: 8
          },
          {
            id: 'act-seo-14',
            templateDeliverableId: 'del-seo-kw-research',
            title: 'Documentación del keyword research',
            description: 'Elaboración del entregable estructurado en hojas de cálculo',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 9
          },
          {
            id: 'act-seo-15',
            templateDeliverableId: 'del-seo-kw-research',
            title: 'Presentación de Keyword Research al cliente',
            description: 'Socialización y validación estratégica con el cliente',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 0.5,
            order: 10
          }
        ]
      },
      {
        id: 'del-seo-auditoria',
        templateId: 'tmpl-seo-one-shot',
        name: 'Auditoría SEO Técnica & On-Page',
        description: 'Revisión exhaustiva de indexación, rastreo, velocidad, código y contenido',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-seo-16',
            templateDeliverableId: 'del-seo-auditoria',
            title: 'Preparación y configuración de herramientas técnicas',
            description: 'Configuración de Screaming Frog, GSC y rastreadores',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 1
          },
          {
            id: 'act-seo-17',
            templateDeliverableId: 'del-seo-auditoria',
            title: 'Revisión de estructura del sitio web',
            description: 'Arquitectura web, jerarquía de URLs y profundidad de clics',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 2
          },
          {
            id: 'act-seo-18',
            templateDeliverableId: 'del-seo-auditoria',
            title: 'Análisis de indexación y rastreo',
            description: 'Páginas bloqueadas, errores 404 y estado del crawl budget',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 3
          },
          {
            id: 'act-seo-19',
            templateDeliverableId: 'del-seo-auditoria',
            title: 'Evaluación de la velocidad del sitio',
            description: 'Diagnóstico en PageSpeed Insights y Core Web Vitals',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 0.5,
            order: 4
          },
          {
            id: 'act-seo-20',
            templateDeliverableId: 'del-seo-auditoria',
            title: 'Análisis de SEO on-page',
            description: 'Títulos, meta descripciones, etiquetas H1-H3 y texto alt',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 5
          },
          {
            id: 'act-seo-21',
            templateDeliverableId: 'del-seo-auditoria',
            title: 'Revisión de SEO técnico (robots, sitemaps, redirecciones)',
            description: 'Directivas de indexación, canonicals, SSL y status codes',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 6
          },
          {
            id: 'act-seo-22',
            templateDeliverableId: 'del-seo-auditoria',
            title: 'Análisis de backlinks y perfil de enlaces',
            description: 'Autoridad de dominio (DA/DR), enlaces tóxicos y dominios de referencia',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 7
          },
          {
            id: 'act-seo-23',
            templateDeliverableId: 'del-seo-auditoria',
            title: 'Revisión de contenido existente',
            description: 'Detección de thin content, contenido duplicado y canibalización',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 8
          },
          {
            id: 'act-seo-24',
            templateDeliverableId: 'del-seo-auditoria',
            title: 'Análisis SEO de la competencia',
            description: 'Comparativo técnico y brechas de contenido (Content Gap)',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 9
          },
          {
            id: 'act-seo-25',
            templateDeliverableId: 'del-seo-auditoria',
            title: 'Revisión de datos de tráfico y rendimiento',
            description: 'Tendencias en Google Analytics 4 y Search Console',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 10
          },
          {
            id: 'act-seo-26',
            templateDeliverableId: 'del-seo-auditoria',
            title: 'Documentación de hallazgos y oportunidades',
            description: 'Consolidación del informe técnico con matriz de criticidad',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 11
          },
          {
            id: 'act-seo-27',
            templateDeliverableId: 'del-seo-auditoria',
            title: 'Presentación de Resultados de Auditoría',
            description: 'Reunión de entrega y sustentación técnica con cliente',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 12
          }
        ]
      },
      {
        id: 'del-seo-estrategia',
        templateId: 'tmpl-seo-one-shot',
        name: 'Estrategia SEO & Roadmap de Implementación',
        description: 'Estrategia integral, KPIs, plan on-page, mejoras técnicas y cronograma',
        order: 4,
        roleBudgets: [],
        activities: [
          {
            id: 'act-seo-28',
            templateDeliverableId: 'del-seo-estrategia',
            title: 'Definición de objetivos y KPIs de posicionamiento',
            description: 'Metas cuantificables de tráfico orgánico y conversiones',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 0.2,
            order: 1
          },
          {
            id: 'act-seo-29',
            templateDeliverableId: 'del-seo-estrategia',
            title: 'Planificación de optimización on-page',
            description: 'Priorización de páginas a intervenir y guías de optimización',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 2
          },
          {
            id: 'act-seo-30',
            templateDeliverableId: 'del-seo-estrategia',
            title: 'Planificación de mejoras técnicas en el sitio web',
            description: 'Requerimientos detallados para el desarrollador web',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 3.0,
            order: 3
          },
          {
            id: 'act-seo-31',
            templateDeliverableId: 'del-seo-estrategia',
            title: 'Estrategia de contenido nuevo y existente',
            description: 'Definición de pilares de contenido y clústeres temáticos',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 4
          },
          {
            id: 'act-seo-32',
            templateDeliverableId: 'del-seo-estrategia',
            title: 'Estrategia de adquisición de backlinks',
            description: 'Tácticas éticas de link building y menciones de marca',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.5,
            order: 5
          },
          {
            id: 'act-seo-33',
            templateDeliverableId: 'del-seo-estrategia',
            title: 'Alinear estrategia SEO con marketing digital general',
            description: 'Sinergias con pauta, redes sociales y campañas de marca',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 0.5,
            order: 6
          },
          {
            id: 'act-seo-34',
            templateDeliverableId: 'del-seo-estrategia',
            title: 'Desarrollar plan de implementación detallado y cronograma',
            description: 'Roadmap de ejecución mes a mes por fases',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 7
          },
          {
            id: 'act-seo-35',
            templateDeliverableId: 'del-seo-estrategia',
            title: 'Sistema de monitoreo de rendimiento y ajuste de tácticas',
            description: 'Configuración de dashboards y alertas de seguimiento',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 8
          },
          {
            id: 'act-seo-36',
            templateDeliverableId: 'del-seo-estrategia',
            title: 'Documentación de la estrategia completa en informe',
            description: 'Documento formal consolidado de estrategia SEO',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 9
          },
          {
            id: 'act-seo-37',
            templateDeliverableId: 'del-seo-estrategia',
            title: 'Presentación de Estrategia al cliente',
            description: 'Sustentación de la estrategia y acuerdo de siguientes pasos',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 10
          }
        ]
      },
      {
        id: 'del-seo-blog',
        templateId: 'tmpl-seo-one-shot',
        name: 'Planeación de Contenidos Blog',
        description: 'Calendario editorial, optimización de artículos existentes y validación',
        order: 5,
        roleBudgets: [],
        activities: [
          {
            id: 'act-seo-38',
            templateDeliverableId: 'del-seo-blog',
            title: 'Desarrollar calendario editorial de contenidos',
            description: 'Plan mensual de temas, títulos H1 y keywords principales',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 4.0,
            order: 1
          },
          {
            id: 'act-seo-39',
            templateDeliverableId: 'del-seo-blog',
            title: 'Revisión y optimización de artículos existentes',
            description: 'Afinación de textos ya publicados para mejorar su ranking',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 2
          },
          {
            id: 'act-seo-40',
            templateDeliverableId: 'del-seo-blog',
            title: 'Envío de contenidos para validación de cliente',
            description: 'Entrega formal para visto bueno del cliente',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 0.1,
            order: 3
          },
          {
            id: 'act-seo-41',
            templateDeliverableId: 'del-seo-blog',
            title: 'Aprobación y ronda de ajustes',
            description: 'Incorporación de observaciones de estilo del cliente',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 4
          }
        ]
      }
    ],
    totalHours: 46.96,
    estimatedDurationWeeks: 4,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-20T10:00:00Z'
  },

  // ==========================================================================
  // 9. GROWTH: GESTIÓN & OPTIMIZACIÓN MENSUAL DE PAUTA (Total: 52.0 Horas/mes)
  // Fuente: FORMATO DE PROCESO DE ÁREA UHURA - GROWTH
  // ==========================================================================
  {
    id: 'tmpl-pauta-gestion-mensual',
    name: 'Gestión & Optimización Mensual de Pauta',
    description: 'Servicio mensual recurrente de auditoría de alertas, optimización de pujas, audiencias, creativos y planeación estratégica de medios pagados (52 hrs/mes).',
    category: 'growth_pauta',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Growth',
    deliverables: [
      {
        id: 'del-pauta-verif',
        templateId: 'tmpl-pauta-gestion-mensual',
        name: 'Verificación & Auditoría Continua',
        description: 'Revisión de alertas diarias, anomalías en plataformas y control de gasto inicial',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-pauta-1',
            templateDeliverableId: 'del-pauta-verif',
            title: 'Revisión diaria de alertas y anomalías en plataformas',
            description: 'Monitoreo continuo de cuentas publicitarias (Meta, Google, TikTok)',
            roleId: R_TRAFFICKER_MEDIA,
            roleName: R_TRAFFICKER_MEDIA,
            estimatedHours: 6.0,
            order: 1
          },
          {
            id: 'act-pauta-2',
            templateDeliverableId: 'del-pauta-verif',
            title: 'Monitoreo de costos iniciales, pacing y CPA',
            description: 'Control de consumo de presupuesto contra objetivos comerciales',
            roleId: R_TRAFFICKER_MEDIA,
            roleName: R_TRAFFICKER_MEDIA,
            estimatedHours: 6.0,
            order: 2
          }
        ]
      },
      {
        id: 'del-pauta-opt',
        templateId: 'tmpl-pauta-gestion-mensual',
        name: 'Optimización de Campañas',
        description: 'Ajuste continuo de pujas, segmentación de audiencias y rotación de comunicación',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-pauta-3',
            templateDeliverableId: 'del-pauta-opt',
            title: 'Revisión y ajuste de pujas y estrategias de puja',
            description: 'Calibración de Target ROAS, Target CPA o Max Conversiones',
            roleId: R_TRAFFICKER_MEDIA,
            roleName: R_TRAFFICKER_MEDIA,
            estimatedHours: 8.0,
            order: 1
          },
          {
            id: 'act-pauta-4',
            templateDeliverableId: 'del-pauta-opt',
            title: 'Revisión, segmentación y testing de audiencias',
            description: 'Pruebas de públicos similares, intereses y listas de remarketing',
            roleId: R_TRAFFICKER_MEDIA,
            roleName: R_TRAFFICKER_MEDIA,
            estimatedHours: 8.0,
            order: 2
          },
          {
            id: 'act-pauta-5',
            templateDeliverableId: 'del-pauta-opt',
            title: 'Revisión y rotación de comunicación / creativos',
            description: 'Identificación de fatiga de anuncios y rotación de piezas de alto impacto',
            roleId: R_TRAFFICKER_MEDIA,
            roleName: R_TRAFFICKER_MEDIA,
            estimatedHours: 8.0,
            order: 3
          }
        ]
      },
      {
        id: 'del-pauta-seg',
        templateId: 'tmpl-pauta-gestion-mensual',
        name: 'Seguimiento & Trabajo Colaborativo',
        description: 'Análisis de métricas, retroalimentación continua y coordinación con el equipo',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-pauta-6',
            templateDeliverableId: 'del-pauta-seg',
            title: 'Feedback de seguimiento, análisis de métricas y hallazgos',
            description: 'Reportes de tendencias, insights y ajustes de tácticas de pauta',
            roleId: R_TRAFFICKER_MEDIA,
            roleName: R_TRAFFICKER_MEDIA,
            estimatedHours: 6.0,
            order: 1
          },
          {
            id: 'act-pauta-7',
            templateDeliverableId: 'del-pauta-seg',
            title: 'Trabajo colaborativo con equipo creativo y comercial',
            description: 'Alineación de nuevos requerimientos de piezas con Creativa y Cuentas',
            roleId: R_TRAFFICKER_MEDIA,
            roleName: R_TRAFFICKER_MEDIA,
            estimatedHours: 6.0,
            order: 2
          }
        ]
      },
      {
        id: 'del-pauta-plan',
        templateId: 'tmpl-pauta-gestion-mensual',
        name: 'Planeación Estratégica Mensual',
        description: 'Desarrollo de la estrategia de medios del siguiente mes con forecast de resultados',
        order: 4,
        roleBudgets: [],
        activities: [
          {
            id: 'act-pauta-8',
            templateDeliverableId: 'del-pauta-plan',
            title: 'Desarrollo de planeación estratégica para el siguiente mes',
            description: 'Estructuración de presupuesto, mix de canales y proyecciones de retorno',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 4.0,
            order: 1
          }
        ]
      }
    ],
    totalHours: 52.0,
    estimatedDurationWeeks: 4,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-20T10:00:00Z'
  },

  // ==========================================================================
  // 10. GROWTH: AUDITORÍA CRM & EMAIL - HUBSPOT (Total: 70.0 Horas)
  // Fuente: FORMATO DE PROCESO DE ÁREA UHURA - GROWTH
  // ==========================================================================
  {
    id: 'tmpl-auditoria-crm-hubspot',
    name: 'Auditoría CRM & Email - HubSpot',
    description: 'Diagnóstico integral de la instancia de HubSpot: contactos, higiene de datos, segmentación, workflows de automatización, secuencias de email y roadmap (70 hrs).',
    category: 'crm_hubspot',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Growth',
    deliverables: [
      {
        id: 'del-hub-config',
        templateId: 'tmpl-auditoria-crm-hubspot',
        name: 'Configuración de Cuenta & Accesos',
        description: 'Revisión técnica de configuraciones maestras, dominios y permisos de usuarios',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-hub-1',
            templateDeliverableId: 'del-hub-config',
            title: 'Revisión de configuración de cuenta (branding, dominios, integraciones)',
            description: 'Auditoría de DNS, tracking code, branding y conexiones API',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-hub-2',
            templateDeliverableId: 'del-hub-config',
            title: 'Evaluación de permisos y acceso de usuarios',
            description: 'Revisión de roles de seguridad y gobierno de la plataforma',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 1.0,
            order: 2
          }
        ]
      },
      {
        id: 'del-hub-db',
        templateId: 'tmpl-auditoria-crm-hubspot',
        name: 'Auditoría de Contactos & Segmentación',
        description: 'Higiene de base de datos, duplicados, listas activas y modelo de lead scoring',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-hub-3',
            templateDeliverableId: 'del-hub-db',
            title: 'Calidad de la base de datos (limpieza, duplicados, inactivos)',
            description: 'Diagnóstico de contactos no comprometidos y tasas de rebote',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 8.0,
            order: 1
          },
          {
            id: 'act-hub-4',
            templateDeliverableId: 'del-hub-db',
            title: 'Estrategia de segmentación (listas dinámicas y estáticas)',
            description: 'Auditoría de listas activas por comportamiento e información demográfica',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 5.0,
            order: 2
          },
          {
            id: 'act-hub-5',
            templateDeliverableId: 'del-hub-db',
            title: 'Estrategia y criterios de lead scoring',
            description: 'Revisión del modelo de puntuación predictiva de prospectos',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 5.0,
            order: 3
          },
          {
            id: 'act-hub-6',
            templateDeliverableId: 'del-hub-db',
            title: 'Estructuración de clusters de audiencia',
            description: 'Diseño de subgrupos de audiencia para campañas personalizadas',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 5.0,
            order: 4
          }
        ]
      },
      {
        id: 'del-hub-email',
        templateId: 'tmpl-auditoria-crm-hubspot',
        name: 'Auditoría de Email Marketing & Workflows',
        description: 'Rendimiento histórico de campañas, entregabilidad y flujos de nutrición',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-hub-7',
            templateDeliverableId: 'del-hub-email',
            title: 'Revisión de campañas de email pasadas (open rate, click, conversión)',
            description: 'Análisis de benchmarks de aperturas y clics en envíos históricos',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 1
          },
          {
            id: 'act-hub-8',
            templateDeliverableId: 'del-hub-email',
            title: 'Análisis de entregabilidad, rebotes y spam',
            description: 'Salud del remitente (DKIM/SPF) y prevención de listas negras',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 3.0,
            order: 2
          },
          {
            id: 'act-hub-9',
            templateDeliverableId: 'del-hub-email',
            title: 'Personalización y dinamismo de correos (campos dinámicos)',
            description: 'Uso de Smart Content y campos personalizados de HubSpot',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 3.0,
            order: 3
          },
          {
            id: 'act-hub-10',
            templateDeliverableId: 'del-hub-email',
            title: 'Auditoría de workflows existentes y triggers de automatización',
            description: 'Detección de bucles, conflictos entre flujos y secuencias rotas',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 3.0,
            order: 4
          },
          {
            id: 'act-hub-11',
            templateDeliverableId: 'del-hub-email',
            title: 'Estructuración de nuevos workflows de marketing',
            description: 'Definición de flujos optimizados de bienvenida y reactivación',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 5.0,
            order: 5
          },
          {
            id: 'act-hub-12',
            templateDeliverableId: 'del-hub-email',
            title: 'Lead nurturing (análisis y optimización de secuencias)',
            description: 'Maduración de leads desde Top of Funnel hasta oportunidad calificada',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 5.0,
            order: 6
          },
          {
            id: 'act-hub-13',
            templateDeliverableId: 'del-hub-email',
            title: 'Configuración de notificaciones y alertas de ventas',
            description: 'Rutas de escalamiento comercial ante leads calificados (MQL a SQL)',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 1.0,
            order: 7
          }
        ]
      },
      {
        id: 'del-hub-assets',
        templateId: 'tmpl-auditoria-crm-hubspot',
        name: 'Landing Pages, Formularios & Herramientas',
        description: 'Efectividad de puntos de captura, formularios, landing pages e integraciones',
        order: 4,
        roleBudgets: [],
        activities: [
          {
            id: 'act-hub-14',
            templateDeliverableId: 'del-hub-assets',
            title: 'Análisis y optimización de landing pages activas',
            description: 'Tasa de conversión de páginas de captura en HubSpot',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 3.0,
            order: 1
          },
          {
            id: 'act-hub-15',
            templateDeliverableId: 'del-hub-assets',
            title: 'Auditoría de formularios (usabilidad y captura de datos)',
            description: 'Campos progresivos (progressive profiling) y experiencia de usuario',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 3.0,
            order: 2
          },
          {
            id: 'act-hub-16',
            templateDeliverableId: 'del-hub-assets',
            title: 'Integraciones activas con otras plataformas técnicas',
            description: 'Sincronización con WordPress, Shopify o bases de datos externas',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 1.0,
            order: 3
          },
          {
            id: 'act-hub-17',
            templateDeliverableId: 'del-hub-assets',
            title: 'Evaluación de herramientas complementarias (Social, Blog, SEO)',
            description: 'Revisión del uso de funcionalidades adicionales de HubSpot',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 1.0,
            order: 4
          }
        ]
      },
      {
        id: 'del-hub-diag',
        templateId: 'tmpl-auditoria-crm-hubspot',
        name: 'Diagnóstico, Plan de Optimización & Roadmap',
        description: 'Consolidación de hallazgos, dashboards de KPIs y plan de implementación',
        order: 5,
        roleBudgets: [],
        activities: [
          {
            id: 'act-hub-18',
            templateDeliverableId: 'del-hub-diag',
            title: 'Revisión y auditoría de dashboards de KPIs actuales',
            description: 'Evaluación de reportes de atribución y ciclo de vida de clientes',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 3.0,
            order: 1
          },
          {
            id: 'act-hub-19',
            templateDeliverableId: 'del-hub-diag',
            title: 'Informe de Diagnóstico y hallazgos principales',
            description: 'Documento ejecutivo con hallazgos críticos de la auditoría',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 5.0,
            order: 2
          },
          {
            id: 'act-hub-20',
            templateDeliverableId: 'del-hub-diag',
            title: 'Plan de Optimización y Roadmap de Implementación técnica',
            description: 'Plan de acción priorizado por impacto y esfuerzo técnico',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 5.0,
            order: 3
          },
          {
            id: 'act-hub-21',
            templateDeliverableId: 'del-hub-diag',
            title: 'Presentación ejecutiva de resultados a cliente',
            description: 'Sustentación de la auditoría y entrega del roadmap estratégico',
            roleId: R_GROWTH_MANAGER,
            roleName: R_GROWTH_MANAGER,
            estimatedHours: 2.0,
            order: 4
          }
        ]
      }
    ],
    totalHours: 70.0,
    estimatedDurationWeeks: 6,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-20T10:00:00Z'
  },

  // ==========================================================================
  // 11. CREATIVA: DISEÑO DE MARCA & IDENTIDAD (BRANDING) (Total: 81.4 Horas)
  // Fuente: FORMATO DE PROCESO DE ÁREA UHURA - CREATIVA
  // ==========================================================================
  {
    id: 'tmpl-diseno-de-marca',
    name: 'Diseño de Marca & Identidad (Branding Completo)',
    description: 'Servicio integral de identidad visual y branding: buyer persona, arquitectura de marca, naming, narrativa, Key Visual, manual de identidad y manifiesto (81.4 hrs).',
    category: 'branding',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Creativa',
    deliverables: [
      {
        id: 'del-br-brief',
        templateId: 'tmpl-diseno-de-marca',
        name: 'Briefing & Alineación Inicial',
        description: 'Recepción de la necesidad, expectativas y sesión de preguntas con el cliente',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-br-1',
            templateDeliverableId: 'del-br-brief',
            title: 'Recepción de necesidad y alineación de objetivos',
            description: 'Revisión inicial del requerimiento de marca y alcance',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 2.0,
            order: 1
          },
          {
            id: 'act-br-2',
            templateDeliverableId: 'del-br-brief',
            title: 'Sesión de aclaración de dudas con el cliente',
            description: 'Aclaración de dudas estratégicas con stakeholders',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 2
          }
        ]
      },
      {
        id: 'del-br-investigacion',
        templateId: 'tmpl-diseno-de-marca',
        name: 'Investigación & Arquitectura de Marca',
        description: 'Referenciación, benchmark de competencia, talleres de buyer persona, arquitectura y naming',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-br-3',
            templateDeliverableId: 'del-br-investigacion',
            title: 'Referenciación de tendencias visuales e inspiración de marca',
            description: 'Moodboard de tendencias globales de diseño en la industria',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 3.0,
            order: 1
          },
          {
            id: 'act-br-4',
            templateDeliverableId: 'del-br-investigacion',
            title: 'Benchmark de competencia (comunicación y mensajes)',
            description: 'Análisis de posicionamiento visual y verbal de competidores',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.5,
            order: 2
          },
          {
            id: 'act-br-5',
            templateDeliverableId: 'del-br-investigacion',
            title: 'Taller de Buyer Persona con el cliente',
            description: 'Sesión colaborativa para definir los arquetipos de cliente ideal',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 4.0,
            order: 3
          },
          {
            id: 'act-br-6',
            templateDeliverableId: 'del-br-investigacion',
            title: 'Taller de Arquitectura de Marca',
            description: 'Definición de propósito, pilares, valores y personalidad de marca',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 8.0,
            order: 4
          },
          {
            id: 'act-br-7',
            templateDeliverableId: 'del-br-investigacion',
            title: 'Documentación de insights y conclusiones de investigación',
            description: 'Consolidación de hallazgos clave de los talleres y benchmark',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.5,
            order: 5
          },
          {
            id: 'act-br-8',
            templateDeliverableId: 'del-br-investigacion',
            title: 'Taller de Naming (co-creación y metodología)',
            description: 'Exploración etimológica, lingüística y conceptual de nombres',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 4.0,
            order: 6
          },
          {
            id: 'act-br-9',
            templateDeliverableId: 'del-br-investigacion',
            title: 'Selección, sustentación y presentación de opciones de Naming',
            description: 'Filtro legal preliminar, dominios y sustentación conceptual',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 1.5,
            order: 7
          }
        ]
      },
      {
        id: 'del-br-narrativa',
        templateId: 'tmpl-diseno-de-marca',
        name: 'Conceptualización Creativa & Narrativa',
        description: 'Vehículo de comunicación, textos para Key Visual y Manifiesto de Marca',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-br-10',
            templateDeliverableId: 'del-br-narrativa',
            title: 'Investigación de categoría y territorio de marca',
            description: 'Definición del territorio conceptual único de la marca',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 4.0,
            order: 1
          },
          {
            id: 'act-br-11',
            templateDeliverableId: 'del-br-narrativa',
            title: 'Conceptualización creativa de la propuesta',
            description: 'Desarrollo de la idea central y tagline de marca',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 6.0,
            order: 2
          },
          {
            id: 'act-br-12',
            templateDeliverableId: 'del-br-narrativa',
            title: 'Creación de narrativa y vehículo de comunicación',
            description: 'Storytelling corporativo y tono de voz de la marca',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 4.0,
            order: 3
          },
          {
            id: 'act-br-13',
            templateDeliverableId: 'del-br-narrativa',
            title: 'Sesión de co-creación e ideación de mejora',
            description: 'Afinación interna de la narrativa entre líderes creativos',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 1.5,
            order: 4
          },
          {
            id: 'act-br-14',
            templateDeliverableId: 'del-br-narrativa',
            title: 'Creación de textos y copys para Key Visual',
            description: 'Titulares de alto impacto para las piezas gráficas clave',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.5,
            order: 5
          },
          {
            id: 'act-br-15',
            templateDeliverableId: 'del-br-narrativa',
            title: 'Adaptación de textos a piezas clave',
            description: 'Microcopys para formatos digitales, impresos y presentaciones',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 6
          },
          {
            id: 'act-br-16',
            templateDeliverableId: 'del-br-narrativa',
            title: 'Redacción del Manifiesto de Marca',
            description: 'Texto fundacional y emocional de la declaración de marca',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 1.5,
            order: 7
          }
        ]
      },
      {
        id: 'del-br-visual',
        templateId: 'tmpl-diseno-de-marca',
        name: 'Diseño Visual, Key Visual & Manual',
        description: 'Key Visual, adaptaciones a 4 formatos, Manual de Identidad y Manifiesto audiovisual',
        order: 4,
        roleBudgets: [],
        activities: [
          {
            id: 'act-br-17',
            templateDeliverableId: 'del-br-visual',
            title: 'Referenciación gráfica y estética',
            description: 'Exploración de paletas cromáticas, tipografías y texturas',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 1.5,
            order: 1
          },
          {
            id: 'act-br-18',
            templateDeliverableId: 'del-br-visual',
            title: 'Diseño de Key Visual (KV) principal de marca',
            description: 'Composición gráfica maestra de la identidad visual',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 6.0,
            order: 2
          },
          {
            id: 'act-br-19',
            templateDeliverableId: 'del-br-visual',
            title: 'Adaptación de piezas gráficas a 4 formatos clave',
            description: 'Aplicación a papelería, avatar digital, banner web y mockup',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 2.0,
            order: 3
          },
          {
            id: 'act-br-20',
            templateDeliverableId: 'del-br-visual',
            title: 'Creación del Manual de Identidad de Marca',
            description: 'Guía de uso de logo, versiones, colores Pantone/RGB, fuentes y prohibiciones',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 5.0,
            order: 4
          },
          {
            id: 'act-br-21',
            templateDeliverableId: 'del-br-visual',
            title: 'Creación de Manifiesto audiovisual (hasta 1:30 min)',
            description: 'Video conceptual de lanzamiento de marca con locución y música',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 2.5,
            order: 5
          },
          {
            id: 'act-br-22',
            templateDeliverableId: 'del-br-visual',
            title: 'Ajustes internos de diseño y coherencia visual',
            description: 'Afinación de detalles visuales con el director de arte',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 1.5,
            order: 6
          }
        ]
      },
      {
        id: 'del-br-cierre',
        templateId: 'tmpl-diseno-de-marca',
        name: 'Presentación, Calidad & Entrega Final',
        description: 'PPT de sustentación, presentación formal, QA, consolidación de ajustes y entrega en COR',
        order: 5,
        roleBudgets: [],
        activities: [
          {
            id: 'act-br-23',
            templateDeliverableId: 'del-br-cierre',
            title: 'Diseño de PPT de historia y sustentación de marca',
            description: 'Presentación ejecutiva estructurada con el racional de diseño',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 4.0,
            order: 1
          },
          {
            id: 'act-br-24',
            templateDeliverableId: 'del-br-cierre',
            title: 'Presentación final de marca a cliente',
            description: 'Sustentación en vivo ante los directivos del cliente',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 2.0,
            order: 2
          },
          {
            id: 'act-br-25',
            templateDeliverableId: 'del-br-cierre',
            title: 'Checklist interno de Calidad',
            description: 'Verificación de ortografía, exportables en curvas y formatos PNG/SVG/PDF',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 0.5,
            order: 3
          },
          {
            id: 'act-br-26',
            templateDeliverableId: 'del-br-cierre',
            title: 'Revisión interna de ajustes',
            description: 'Validación de observaciones previas al cierre',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 0.8,
            order: 4
          },
          {
            id: 'act-br-27',
            templateDeliverableId: 'del-br-cierre',
            title: 'Carga inicial de entregables en COR',
            description: 'Gestión documental de la entrega en plataforma COR',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 0.2,
            order: 5
          },
          {
            id: 'act-br-28',
            templateDeliverableId: 'del-br-cierre',
            title: 'Consolidación y mediación de ajustes con cliente',
            description: 'Filtrado de retroalimentación de la presentación',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.5,
            order: 6
          },
          {
            id: 'act-br-29',
            templateDeliverableId: 'del-br-cierre',
            title: 'Aplicación de ajustes solicitados por cliente',
            description: 'Ronda final de afinación de color o detalles de manual',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 4.0,
            order: 7
          },
          {
            id: 'act-br-30',
            templateDeliverableId: 'del-br-cierre',
            title: 'Entrega final de activos en COR y handoff',
            description: 'Entrega de paquete de archivos maestros en Google Drive / COR',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.2,
            order: 8
          }
        ]
      }
    ],
    totalHours: 81.4,
    estimatedDurationWeeks: 6,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-20T10:00:00Z'
  },

  // ==========================================================================
  // 12. CREATIVA: CONTENIDO PARA REDES SOCIALES (MENSUAL) (Total: 42.4 Horas/mes)
  // Fuente: FORMATO DE PROCESO DE ÁREA UHURA - CREATIVA
  // ==========================================================================
  {
    id: 'tmpl-redes-sociales-mensual',
    name: 'Contenido para Redes Sociales (Mensual)',
    description: 'Servicio mensual recurrente de creación de contenido: parrilla de 12 publicaciones, producción de video corto UGC, diseño de piezas gráficas/animadas, publicación y reportes (42.4 hrs/mes).',
    category: 'social_media',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Creativa',
    deliverables: [
      {
        id: 'del-sm-kick',
        templateId: 'tmpl-redes-sociales-mensual',
        name: 'Kickoff & Ideación Mensual',
        description: 'Alineación de objetivos mensuales, recopilación de insumos e ideación',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-sm-1',
            templateDeliverableId: 'del-sm-kick',
            title: 'Recepción de necesidad y requerimientos del mes',
            description: 'Revisión de temas y lanzamientos prioritarios del cliente',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-sm-2',
            templateDeliverableId: 'del-sm-kick',
            title: 'Sesión de dudas y preguntas con cliente',
            description: 'Alineación de fechas clave y materiales fotográficos',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 0.3,
            order: 2
          },
          {
            id: 'act-sm-3',
            templateDeliverableId: 'del-sm-kick',
            title: 'Recopilación de material gráfico e insumos',
            description: 'Organización de carpetas en Google Drive para el mes',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 1.0,
            order: 3
          },
          {
            id: 'act-sm-4',
            templateDeliverableId: 'del-sm-kick',
            title: 'Co-creación e ideación de conceptos del mes',
            description: 'Lluvia de ideas de dinámicas, formatos interactivos y tendencias',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 1.5,
            order: 4
          }
        ]
      },
      {
        id: 'del-sm-parrilla',
        templateId: 'tmpl-redes-sociales-mensual',
        name: 'Redacción & Parrilla de Contenidos (12 Posts)',
        description: 'Ruta temática y redacción detallada de copys y llamados a la acción para 12 posts',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-sm-5',
            templateDeliverableId: 'del-sm-parrilla',
            title: 'Investigación de tendencias y efemérides',
            description: 'Monitoreo de audios en tendencia y fechas comerciales',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.5,
            order: 1
          },
          {
            id: 'act-sm-6',
            templateDeliverableId: 'del-sm-parrilla',
            title: 'Ruta de contenidos mensual',
            description: 'Estructuración del calendario de publicaciones semana a semana',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 2
          },
          {
            id: 'act-sm-7',
            templateDeliverableId: 'del-sm-parrilla',
            title: 'Redacción de parrilla de copys (12 publicaciones)',
            description: 'Redacción de textos persuasivos, hashtags e instrucciones visuales',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 5.5,
            order: 3
          },
          {
            id: 'act-sm-8',
            templateDeliverableId: 'del-sm-parrilla',
            title: 'Ajustes internos de redacción',
            description: 'Afinación de tono y ortografía antes del diseño',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 4
          }
        ]
      },
      {
        id: 'del-sm-ugc',
        templateId: 'tmpl-redes-sociales-mensual',
        name: 'Producción de Video Corto UGC',
        description: 'Referenciación, grabación y edición de contenido en video corto generado por usuario',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-sm-9',
            templateDeliverableId: 'del-sm-ugc',
            title: 'Referenciación de tendencias UGC',
            description: 'Guionización de ganchos (hooks) y transiciones de video',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.5,
            order: 1
          },
          {
            id: 'act-sm-10',
            templateDeliverableId: 'del-sm-ugc',
            title: 'Grabación de material audiovisual',
            description: 'Rodaje con producto, tomas de detalle y prueba de uso',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 6.0,
            order: 2
          },
          {
            id: 'act-sm-11',
            templateDeliverableId: 'del-sm-ugc',
            title: 'Edición de video (locución, subtítulos, música)',
            description: 'Montaje dinámico, ritmo, efectos de sonido y subtítulos de retención',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 4.0,
            order: 3
          },
          {
            id: 'act-sm-12',
            templateDeliverableId: 'del-sm-ugc',
            title: 'Ajustes internos de video',
            description: 'Afinación de cortes y corrección de color de los reels',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 1.5,
            order: 4
          }
        ]
      },
      {
        id: 'del-sm-diseno',
        templateId: 'tmpl-redes-sociales-mensual',
        name: 'Diseño Gráfico & Animación de Piezas',
        description: 'Composición visual de piezas estáticas, carruseles y creativos animados',
        order: 4,
        roleBudgets: [],
        activities: [
          {
            id: 'act-sm-13',
            templateDeliverableId: 'del-sm-diseno',
            title: 'Referenciación visual para piezas',
            description: 'Moodboard de estilo gráfico para los posts del mes',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-sm-14',
            templateDeliverableId: 'del-sm-diseno',
            title: 'Diseño de creativos estáticos',
            description: 'Maquetación de posts simples y carruseles informativos',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 1.4,
            order: 2
          },
          {
            id: 'act-sm-15',
            templateDeliverableId: 'del-sm-diseno',
            title: 'Animación de piezas gráficas (Motion/GIF)',
            description: 'Animación de tipografías y elementos gráficos para historias/reels',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 2.0,
            order: 3
          },
          {
            id: 'act-sm-16',
            templateDeliverableId: 'del-sm-diseno',
            title: 'Ajustes internos de diseño',
            description: 'Afinación visual y cumplimiento de la guía de marca',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 0.5,
            order: 4
          }
        ]
      },
      {
        id: 'del-sm-publi',
        templateId: 'tmpl-redes-sociales-mensual',
        name: 'Calidad, Ajustes, Publicación & Informe',
        description: 'Control de calidad, aplicación de ajustes de cliente, programación en redes e informe mensual',
        order: 5,
        roleBudgets: [],
        activities: [
          {
            id: 'act-sm-17',
            templateDeliverableId: 'del-sm-publi',
            title: 'Checklist interno de calidad',
            description: 'Verificación de formatos, dimensiones y ortografía',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.5,
            order: 1
          },
          {
            id: 'act-sm-18',
            templateDeliverableId: 'del-sm-publi',
            title: 'Revisión interna de líder',
            description: 'Visto bueno de dirección creativa previo a envío',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 0.8,
            order: 2
          },
          {
            id: 'act-sm-19',
            templateDeliverableId: 'del-sm-publi',
            title: 'Carga de piezas en COR',
            description: 'Subida de archivos organizados para aprobación del cliente',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.2,
            order: 3
          },
          {
            id: 'act-sm-20',
            templateDeliverableId: 'del-sm-publi',
            title: 'Consolidación de ajustes de cliente',
            description: 'Recepción y filtrado de retroalimentación de la parrilla',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.2,
            order: 4
          },
          {
            id: 'act-sm-21',
            templateDeliverableId: 'del-sm-publi',
            title: 'Aplicación de ajustes solicitados',
            description: 'Correcciones finales de copys o imágenes según el cliente',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 1.0,
            order: 5
          },
          {
            id: 'act-sm-22',
            templateDeliverableId: 'del-sm-publi',
            title: 'Entrega final a comercial',
            description: 'Notificación de parrilla aprobada lista para pauta y programación',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.2,
            order: 6
          },
          {
            id: 'act-sm-23',
            templateDeliverableId: 'del-sm-publi',
            title: 'Programación y publicación de contenidos',
            description: 'Configuración de fechas y horas en Meta Business Suite / Buffer',
            roleId: R_CONTENT_CREATOR,
            roleName: R_CONTENT_CREATOR,
            estimatedHours: 2.5,
            order: 7
          },
          {
            id: 'act-sm-24',
            templateDeliverableId: 'del-sm-publi',
            title: 'Seguimiento y verificación de salida',
            description: 'Comprobación de publicaciones en vivo y moderación inicial',
            roleId: R_CONTENT_CREATOR,
            roleName: R_CONTENT_CREATOR,
            estimatedHours: 2.0,
            order: 8
          },
          {
            id: 'act-sm-25',
            templateDeliverableId: 'del-sm-publi',
            title: 'Creación de informe mensual de métricas y rendimiento',
            description: 'Reporte ejecutivo de alcance, engagement, interacciones y mejores posts',
            roleId: R_CONTENT_CREATOR,
            roleName: R_CONTENT_CREATOR,
            estimatedHours: 2.5,
            order: 9
          }
        ]
      }
    ],
    totalHours: 42.4,
    estimatedDurationWeeks: 4,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-20T10:00:00Z'
  },

  // ==========================================================================
  // 13. CREATIVA: CREATIVIDAD & CAMPAÑAS (Total: 41.4 Horas)
  // Fuente: FORMATO DE PROCESO DE ÁREA UHURA - CREATIVA
  // ==========================================================================
  {
    id: 'tmpl-creatividad-campanas',
    name: 'Creatividad & Campañas',
    description: 'Campaña creativa integral: benchmark, conceptualización de la idea, redacción de copys, diseño de Key Visual (KV), mockups y presentación formal (41.4 hrs).',
    category: 'campana_creativa',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Creativa',
    deliverables: [
      {
        id: 'del-camp-brief',
        templateId: 'tmpl-creatividad-campanas',
        name: 'Briefing & Descubrimiento de Campaña',
        description: 'Recepción del requerimiento, sesión de preguntas, co-creación y benchmark',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-camp-1',
            templateDeliverableId: 'del-camp-brief',
            title: 'Recepción de necesidad y alcance',
            description: 'Alineación de objetivos de la campaña publicitaria',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-camp-2',
            templateDeliverableId: 'del-camp-brief',
            title: 'Sesión de aclaración de dudas con cliente',
            description: 'Resolución de inquietudes sobre mensaje y canales',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 2
          },
          {
            id: 'act-camp-3',
            templateDeliverableId: 'del-camp-brief',
            title: 'Co-creación e ideación inicial',
            description: 'Taller interno de ideación entre creativos y estrategas',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 1.5,
            order: 3
          },
          {
            id: 'act-camp-4',
            templateDeliverableId: 'del-camp-brief',
            title: 'Documento de hallazgos y territorio',
            description: 'Síntesis de oportunidades de comunicación para la campaña',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 0.5,
            order: 4
          },
          {
            id: 'act-camp-5',
            templateDeliverableId: 'del-camp-brief',
            title: 'Benchmark de competencia y referencias',
            description: 'Análisis de campañas previas de competidores directos',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 5
          }
        ]
      },
      {
        id: 'del-camp-concepto',
        templateId: 'tmpl-creatividad-campanas',
        name: 'Conceptualización & Redacción de Campaña',
        description: 'Referenciación, redacción del concepto creativo central y titulares de campaña',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-camp-6',
            templateDeliverableId: 'del-camp-concepto',
            title: 'Referenciación creativa de campañas',
            description: 'Búsqueda de casos de éxito internacionales inspiradores',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.0,
            order: 1
          },
          {
            id: 'act-camp-7',
            templateDeliverableId: 'del-camp-concepto',
            title: 'Redacción del concepto creativo principal',
            description: 'Estructuración del big idea, slogan y racional creativo',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 4.5,
            order: 2
          },
          {
            id: 'act-camp-8',
            templateDeliverableId: 'del-camp-concepto',
            title: 'Redacción de textos para piezas y KV',
            description: 'Titulares y llamadas a la acción adaptadas a la campaña',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 2.5,
            order: 3
          }
        ]
      },
      {
        id: 'del-camp-kv',
        templateId: 'tmpl-creatividad-campanas',
        name: 'Diseño de Key Visual & Presentación',
        description: 'Key Visual (2 rutas), adaptaciones a mockups, presentación ejecutiva y ajustes',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-camp-9',
            templateDeliverableId: 'del-camp-kv',
            title: 'Referenciación visual y moodboard',
            description: 'Dirección de arte visual, paleta cromática e iluminación',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 1.5,
            order: 1
          },
          {
            id: 'act-camp-10',
            templateDeliverableId: 'del-camp-kv',
            title: 'Diseño de Key Visual (2 propuestas visuales)',
            description: 'Creación de dos rutas gráficas alternativas para el cliente',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 6.0,
            order: 2
          },
          {
            id: 'act-camp-11',
            templateDeliverableId: 'del-camp-kv',
            title: 'Adaptación a mockups de contexto',
            description: 'Visualización en vallas, stories, pantallas digitales y prensa',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 2.0,
            order: 3
          },
          {
            id: 'act-camp-12',
            templateDeliverableId: 'del-camp-kv',
            title: 'Diseño de presentación ejecutiva de campaña',
            description: 'Maquetación de la presentación en PPT con alta calidad visual',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 10.0,
            order: 4
          },
          {
            id: 'act-camp-13',
            templateDeliverableId: 'del-camp-kv',
            title: 'Presentación interna de la propuesta',
            description: 'Ensayo y afinación del discurso ante el equipo directivo',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 1.0,
            order: 5
          },
          {
            id: 'act-camp-14',
            templateDeliverableId: 'del-camp-kv',
            title: 'Ajustes internos de diseño',
            description: 'Perfeccionamiento de las piezas previo al envío al cliente',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 3.0,
            order: 6
          }
        ]
      },
      {
        id: 'del-camp-cierre',
        templateId: 'tmpl-creatividad-campanas',
        name: 'Calidad, Ajustes & Entrega',
        description: 'Control de calidad, carga en COR, mediación de ajustes y entrega final',
        order: 4,
        roleBudgets: [],
        activities: [
          {
            id: 'act-camp-15',
            templateDeliverableId: 'del-camp-cierre',
            title: 'Checklist de calidad',
            description: 'Revisión técnica de resolución, pesos y legibilidad tipográfica',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.5,
            order: 1
          },
          {
            id: 'act-camp-16',
            templateDeliverableId: 'del-camp-cierre',
            title: 'Revisión interna por líder creativo',
            description: 'Aprobación formal del director creativo de la agencia',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 0.8,
            order: 2
          },
          {
            id: 'act-camp-17',
            templateDeliverableId: 'del-camp-cierre',
            title: 'Subir entregable a COR',
            description: 'Carga de archivos maestros y presentación en plataforma de gestión',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.2,
            order: 3
          },
          {
            id: 'act-camp-18',
            templateDeliverableId: 'del-camp-cierre',
            title: 'Consolidación de comentarios de cliente',
            description: 'Recepción y ordenamiento de observaciones del cliente',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.2,
            order: 4
          },
          {
            id: 'act-camp-19',
            templateDeliverableId: 'del-camp-cierre',
            title: 'Aplicación de ajustes solicitados',
            description: 'Ronda de correcciones sobre la propuesta seleccionada',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.5,
            order: 5
          },
          {
            id: 'act-camp-20',
            templateDeliverableId: 'del-camp-cierre',
            title: 'Entrega final en COR',
            description: 'Cierre de proyecto y entrega de master files editables',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.2,
            order: 6
          }
        ]
      }
    ],
    totalHours: 41.4,
    estimatedDurationWeeks: 4,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-20T10:00:00Z'
  },

  // ==========================================================================
  // 14. CREATIVA: CREATIVOS DE PAUTA DIGITAL (Total: 11.0 Horas)
  // Fuente: FORMATO DE PROCESO DE ÁREA UHURA - CREATIVA
  // ==========================================================================
  {
    id: 'tmpl-creativos-pauta',
    name: 'Creativos de Pauta Digital',
    description: 'Pack de redacción de copies y diseño de anuncios estáticos/animados optimizados para pruebas A/B de pauta (11 hrs).',
    category: 'creativos_pauta',
    version: '2026.1',
    status: 'active',
    isReusable: true,
    governedBy: 'Creativa',
    deliverables: [
      {
        id: 'del-crp-brief',
        templateId: 'tmpl-creativos-pauta',
        name: 'Briefing & Redacción de Copies',
        description: 'Alineación de objetivos de conversión y redacción publicitaria persuasiva',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-crp-1',
            templateDeliverableId: 'del-crp-brief',
            title: 'Recepción de necesidad y formatos requeridos',
            description: 'Definición de tamaños (1:1, 9:16, 16:9) y llamadas a la acción',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 1.0,
            order: 1
          },
          {
            id: 'act-crp-2',
            templateDeliverableId: 'del-crp-brief',
            title: 'Aclaración de dudas con cliente o tráfico',
            description: 'Alineación con el Trafficker sobre segmentación y mensaje',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 0.3,
            order: 2
          },
          {
            id: 'act-crp-3',
            templateDeliverableId: 'del-crp-brief',
            title: 'Creación de copies persuasivos para anuncios',
            description: 'Redacción de ganchos, textos principales y botones CTA',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 0.7,
            order: 3
          },
          {
            id: 'act-crp-4',
            templateDeliverableId: 'del-crp-brief',
            title: 'Adaptaciones de textos para distintos placements',
            description: 'Textos cortos para Feed, Stories y Reels',
            roleId: R_DIGITAL_CONTENT,
            roleName: R_DIGITAL_CONTENT,
            estimatedHours: 1.0,
            order: 4
          }
        ]
      },
      {
        id: 'del-crp-diseno',
        templateId: 'tmpl-creativos-pauta',
        name: 'Diseño Gráfico & Animación de Anuncios',
        description: 'Creativos estáticos, creativos animados, adaptaciones de ratios y A/B Testing',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-crp-5',
            templateDeliverableId: 'del-crp-diseno',
            title: 'Referenciación de creativos de alto impacto',
            description: 'Benchmarking de anuncios ganadores en Meta Ad Library',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 1.5,
            order: 1
          },
          {
            id: 'act-crp-6',
            templateDeliverableId: 'del-crp-diseno',
            title: 'Diseño de creativo estático principal',
            description: 'Composición visual de alto contraste y legibilidad mobile',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 1.4,
            order: 2
          },
          {
            id: 'act-crp-7',
            templateDeliverableId: 'del-crp-diseno',
            title: 'Animación de creativo publicitario',
            description: 'Animación motion de hasta 15 segundos para stories/reels',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 2.0,
            order: 3
          },
          {
            id: 'act-crp-8',
            templateDeliverableId: 'del-crp-diseno',
            title: 'Adaptaciones de formatos para A/B Testing',
            description: 'Variaciones de fondo, titular o color de botón para experimentación',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.2,
            order: 4
          },
          {
            id: 'act-crp-9',
            templateDeliverableId: 'del-crp-diseno',
            title: 'Ajustes internos de diseño',
            description: 'Correcciones de espaciado y regla del 20% de texto',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 1.5,
            order: 5
          }
        ]
      },
      {
        id: 'del-crp-cierre',
        templateId: 'tmpl-creativos-pauta',
        name: 'Calidad, Ajustes & Entrega',
        description: 'Control de calidad publicitaria, carga en COR y entrega al Trafficker',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-crp-10',
            templateDeliverableId: 'del-crp-cierre',
            title: 'Checklist de calidad publicitaria',
            description: 'Revisión de compresión de video, formatos MP4/PNG y ortografía',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.5,
            order: 1
          },
          {
            id: 'act-crp-11',
            templateDeliverableId: 'del-crp-cierre',
            title: 'Revisión interna por líder creativo',
            description: 'Aprobación del director de arte de la agencia',
            roleId: R_CREATIVE_STRATEGY_LEAD,
            roleName: R_CREATIVE_STRATEGY_LEAD,
            estimatedHours: 0.8,
            order: 2
          },
          {
            id: 'act-crp-12',
            templateDeliverableId: 'del-crp-cierre',
            title: 'Carga de entregables en COR',
            description: 'Subida de piezas a la tarea correspondiente en COR',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.2,
            order: 3
          },
          {
            id: 'act-crp-13',
            templateDeliverableId: 'del-crp-cierre',
            title: 'Consolidación de comentarios de cliente',
            description: 'Recepción de observaciones de la marca',
            roleId: R_CLIENT_RELATIONSHIP,
            roleName: R_CLIENT_RELATIONSHIP,
            estimatedHours: 0.2,
            order: 4
          },
          {
            id: 'act-crp-14',
            templateDeliverableId: 'del-crp-cierre',
            title: 'Aplicación de ajustes solicitados',
            description: 'Correcciones de detalle sobre piezas aprobadas',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.5,
            order: 5
          },
          {
            id: 'act-crp-15',
            templateDeliverableId: 'del-crp-cierre',
            title: 'Entrega final en COR y handoff a pauta',
            description: 'Entrega formal al Trafficker para activación en campañas',
            roleId: R_CREATIVE_DESIGNER,
            roleName: R_CREATIVE_DESIGNER,
            estimatedHours: 0.2,
            order: 6
          }
        ]
      }
    ],
    totalHours: 11.0,
    estimatedDurationWeeks: 2,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-20T10:00:00Z'
  },

  // ==========================================================================
  // 15. PROYECTO A LA MEDIDA [PROPUESTA TÉCNICA - NO CANÓNICA EN FUENTE PRIMARIA]
  // ==========================================================================
  {
    id: 'tmpl-custom-blank',
    name: 'Proyecto a la Medida (Propuesta Técnica)',
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
  rawInitialTemplates.map(recalculateTemplateHours);
