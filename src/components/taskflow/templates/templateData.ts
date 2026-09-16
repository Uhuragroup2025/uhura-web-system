import {
  ProductBacklogTemplate,
  ProductBacklogTemplateCategory,
  STANDARD_UHURA_ROLES,
  ROLE_PENDING_DEFINITION
} from '../types';
import { recalculateTemplateHours } from './templateEngine';

/**
 * METADATOS DE CATEGORÍAS DE PRODUCTOS/SERVICIOS UHURA
 * Estructura extensible para dar soporte a nuevas líneas de negocio
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
    key: 'wordpress',
    label: 'Sitio WordPress (hasta 8 págs)',
    description: 'Sitios institucionales basados en WordPress CMS, arquitectura personalizada y optimización.',
    badgeBg: 'bg-[#8a4dff]/15',
    badgeText: 'text-[#8a4dff]'
  },
  {
    key: 'mantenimiento_web',
    label: 'Mantenimiento Web',
    description: 'Bolsa mensual de soporte preventivo, actualizaciones críticas de seguridad y ajustes menores.',
    badgeBg: 'bg-[#38bdf8]/15',
    badgeText: 'text-[#38bdf8]'
  },
  {
    key: 'landing_page',
    label: 'Landing Page',
    description: 'Página de aterrizaje de alta conversión para campañas, lead capture o lanzamientos de producto.',
    badgeBg: 'bg-[#10b981]/15',
    badgeText: 'text-[#10b981]'
  },
  {
    key: 'tienda_online',
    label: 'Tienda Online (20 SKUs / 10 Var)',
    description: 'E-commerce catálogo medio con pasarela de pagos integrada, checkout y cálculo de envíos.',
    badgeBg: 'bg-[#f59e0b]/15',
    badgeText: 'text-[#f59e0b]'
  },
  {
    key: 'shopify',
    label: 'Shopify Store',
    description: 'Configuración de tienda en Shopify, personalización de theme y activación de aplicaciones.',
    badgeBg: 'bg-[#ec4899]/15',
    badgeText: 'text-[#ec4899]'
  },
  {
    key: 'portal_platform',
    label: 'Portal / Plataforma',
    description: 'Plataformas web con roles de usuario, tableros privados, backend y lógica transaccional.',
    badgeBg: 'bg-[#6366f1]/15',
    badgeText: 'text-[#6366f1]'
  },
  {
    key: 'custom',
    label: 'Proyecto a la Medida',
    description: 'Estructura flexible para requerimientos especiales construidos desde cero o modulares.',
    badgeBg: 'bg-[#64748b]/15',
    badgeText: 'text-[#64748b]'
  }
];

// Roles oficiales de Uhura Group
const R_PRODUCT_LEAD = 'Product Lead';
const R_DIGITAL_DESIGNER = 'Digital Designer';
const R_FRONT_END = 'Desarrollador Web Front-End';
const R_CONTENT = 'Content Creator';

/**
 * DATOS DEMO MÍNIMOS DE PLANTILLAS MAESTRAS
 * Basadas en los roles oficiales del equipo Uhura Group
 */
const rawInitialTemplates: ProductBacklogTemplate[] = [
  // 1. Sitio WordPress hasta 8 páginas internas
  {
    id: 'tmpl-wp-8p',
    name: 'Sitio WordPress hasta 8 páginas internas',
    description: 'Estructura marco para desarrollo de sitio web institucional en WordPress con hasta 8 páginas internas.',
    category: 'wordpress',
    version: '1.0',
    status: 'active',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-wp-ux',
        templateId: 'tmpl-wp-8p',
        name: 'Arquitectura / UX',
        description: 'Estructura de contenidos, mapas de navegación y wireframes funcionales',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-wp-ux-1',
            templateDeliverableId: 'del-wp-ux',
            title: 'Levantamiento de contenidos & Arquitectura de información',
            description: 'Estructura de menú y jerarquía de hasta 8 páginas internas',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 4.0,
            order: 1,
            optional: false
          },
          {
            id: 'act-wp-ux-2',
            templateDeliverableId: 'del-wp-ux',
            title: 'Wireframes funcionales (Baja fidelidad)',
            description: 'Estructuración de componentes de Home y plantillas interiores',
            roleId: R_DIGITAL_DESIGNER,
            roleName: R_DIGITAL_DESIGNER,
            estimatedHours: 6.0,
            order: 2,
            optional: false
          }
        ]
      },
      {
        id: 'del-wp-ui',
        templateId: 'tmpl-wp-8p',
        name: 'Diseño UI',
        description: 'Diseño visual de alta fidelidad para desktop y mobile',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-wp-ui-1',
            templateDeliverableId: 'del-wp-ui',
            title: 'Diseño UI de Home y Guía de Estilo Digital',
            description: 'Tipografía, colores, botones y look & feel principal',
            roleId: R_DIGITAL_DESIGNER,
            roleName: R_DIGITAL_DESIGNER,
            estimatedHours: 8.0,
            order: 1,
            optional: false
          },
          {
            id: 'act-wp-ui-2',
            templateDeliverableId: 'del-wp-ui',
            title: 'Diseño UI de Plantillas Interiores (hasta 8 páginas)',
            description: 'Diseño de páginas de servicios, quiénes somos, contacto y blog',
            roleId: R_DIGITAL_DESIGNER,
            roleName: R_DIGITAL_DESIGNER,
            estimatedHours: 12.0,
            order: 2,
            optional: false
          }
        ]
      },
      {
        id: 'del-wp-dev',
        templateId: 'tmpl-wp-8p',
        name: 'Desarrollo',
        description: 'Maquetación frontend responsive y configuración de WordPress CMS',
        order: 3,
        roleBudgets: [],
        activities: [
          {
            id: 'act-wp-dev-1',
            templateDeliverableId: 'del-wp-dev',
            title: 'Setup de servidor, WordPress y Theme base',
            description: 'Configuración de entorno de staging, base de datos y plugins estándar',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 4.0,
            order: 1,
            optional: false
          },
          {
            id: 'act-wp-dev-2',
            templateDeliverableId: 'del-wp-dev',
            title: 'Maquetación Frontend de páginas e interacciones',
            description: 'Construcción en bloques / componentes responsive',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 20.0,
            order: 2,
            optional: false
          },
          {
            id: 'act-wp-dev-3',
            templateDeliverableId: 'del-wp-dev',
            title: 'Integración de formularios de contacto y seguridad',
            description: 'Anti-spam, SMTP transaccional y protección de login',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 4.0,
            order: 3,
            optional: false
          }
        ]
      },
      {
        id: 'del-wp-content',
        templateId: 'tmpl-wp-8p',
        name: 'Contenido / carga',
        description: 'Carga de textos provistos por el cliente y optimización de activos multimedia',
        order: 4,
        roleBudgets: [],
        activities: [
          {
            id: 'act-wp-cnt-1',
            templateDeliverableId: 'del-wp-content',
            title: 'Carga y diagramación de contenidos provistos',
            description: 'Diagramación de textos, imágenes e íconos en las 8 páginas',
            roleId: R_CONTENT,
            roleName: R_CONTENT,
            estimatedHours: 6.0,
            order: 1,
            optional: false
          }
        ]
      },
      {
        id: 'del-wp-qa',
        templateId: 'tmpl-wp-8p',
        name: 'QA / salida',
        description: 'Control de calidad técnico, pruebas cruzadas y paso a producción',
        order: 5,
        roleBudgets: [],
        activities: [
          {
            id: 'act-wp-qa-1',
            templateDeliverableId: 'del-wp-qa',
            title: 'Pruebas cross-browser y mobile en dispositivos físicos',
            description: 'Revisión en Chrome, Safari, iOS y Android',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 4.0,
            order: 1,
            optional: false
          },
          {
            id: 'act-wp-qa-2',
            templateDeliverableId: 'del-wp-qa',
            title: 'Despliegue a producción, DNS y handover técnico',
            description: 'Paso de staging a dominio final y verificación de certificados SSL',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 3.0,
            order: 2,
            optional: false
          }
        ]
      }
    ],
    totalHours: 0,
    estimatedDurationWeeks: 4,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-15T08:00:00Z'
  },

  // 2. Mantenimiento Web
  {
    id: 'tmpl-mantenimiento',
    name: 'Mantenimiento Web Mensual',
    description: 'Bolsa operativa mensual de soporte preventivo, salud del servidor y mejoras continuas.',
    category: 'mantenimiento_web',
    version: '1.0',
    status: 'active',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-mnt-prev',
        templateId: 'tmpl-mantenimiento',
        name: 'Soporte Preventivo & Seguridad',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-mnt-1',
            templateDeliverableId: 'del-mnt-prev',
            title: 'Auditoría mensual de seguridad & Actualización de plugins/core',
            description: 'Revisión de parches de seguridad y copias de respaldo offsite',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 3.0,
            order: 1
          },
          {
            id: 'act-mnt-2',
            templateDeliverableId: 'del-mnt-prev',
            title: 'Monitoreo de uptime y tiempos de respuesta (Core Web Vitals)',
            description: 'Diagnóstico de latencia de base de datos y optimización de caché',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 2.0,
            order: 2
          }
        ]
      },
      {
        id: 'del-mnt-ajustes',
        templateId: 'tmpl-mantenimiento',
        name: 'Ajustes Menores & Tickets de Soporte',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-mnt-3',
            templateDeliverableId: 'del-mnt-ajustes',
            title: 'Atención a tickets de ajustes visuales y de contenido',
            description: 'Reemplazo de banners, actualización de textos y enlaces',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 5.0,
            order: 1
          }
        ]
      }
    ],
    totalHours: 0,
    estimatedDurationWeeks: 4,
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-15T08:00:00Z'
  },

  // 3. Landing Page
  {
    id: 'tmpl-landing-page',
    name: 'Landing Page de Alta Conversión',
    description: 'Página única optimizada para conversión de pauta digital y captación de leads.',
    category: 'landing_page',
    version: '1.0',
    status: 'active',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-lp-est',
        templateId: 'tmpl-landing-page',
        name: 'Estrategia & Wireframe',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-lp-1',
            templateDeliverableId: 'del-lp-est',
            title: 'Estructura de secciones & Propuesta de valor',
            description: 'Definición de jerarquía de conversión y CTA principal',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 3.0,
            order: 1
          },
          {
            id: 'act-lp-2',
            templateDeliverableId: 'del-lp-est',
            title: 'Redacción persuasiva (Copywriting)',
            description: 'Headlines, beneficios y llamados a la acción',
            roleId: R_CONTENT,
            roleName: R_CONTENT,
            estimatedHours: 4.0,
            order: 2
          }
        ]
      },
      {
        id: 'del-lp-ui',
        templateId: 'tmpl-landing-page',
        name: 'Diseño UI & Maquetación',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-lp-3',
            templateDeliverableId: 'del-lp-ui',
            title: 'Diseño visual UI Desktop y Mobile',
            description: 'Diseño en Figma y especificaciones para desarrollo',
            roleId: R_DIGITAL_DESIGNER,
            roleName: R_DIGITAL_DESIGNER,
            estimatedHours: 6.0,
            order: 1
          },
          {
            id: 'act-lp-4',
            templateDeliverableId: 'del-lp-ui',
            title: 'Maquetación frontend & Medición de eventos',
            description: 'Implementación responsive con píxeles de Google y Meta',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 8.0,
            order: 2
          }
        ]
      }
    ],
    totalHours: 0,
    estimatedDurationWeeks: 2,
    createdAt: '2026-09-03T10:00:00Z',
    updatedAt: '2026-09-15T08:00:00Z'
  },

  // 4. Tienda Online hasta 20 SKUs simples o 10 variables
  {
    id: 'tmpl-ecommerce-20skus',
    name: 'Tienda Online hasta 20 SKUs simples o 10 variables',
    description: 'Comercio electrónico para marcas directas al consumidor con catálogo inicial acotado.',
    category: 'tienda_online',
    version: '1.0',
    status: 'active',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-ecom-cat',
        templateId: 'tmpl-ecommerce-20skus',
        name: 'Arquitectura de Catálogo & Pasarelas',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-ecom-1',
            templateDeliverableId: 'del-ecom-cat',
            title: 'Definición de atributos de productos y categorías',
            description: 'Taxonomía de variantes (tallas, colores) y cálculo de impuestos',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 4.0,
            order: 1
          },
          {
            id: 'act-ecom-2',
            templateDeliverableId: 'del-ecom-cat',
            title: 'Integración de pasarela de pago (Wompi / PayU / Stripe)',
            description: 'Configuración de webhooks, estados de orden y ambiente de pruebas',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 6.0,
            order: 2
          }
        ]
      },
      {
        id: 'del-ecom-dev',
        templateId: 'tmpl-ecommerce-20skus',
        name: 'Desarrollo de Flujo de Compra & Carga',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-ecom-3',
            templateDeliverableId: 'del-ecom-dev',
            title: 'Maquetación de Home, PLP, PDP y Carrito',
            description: 'Vistas de tienda con filtros de búsqueda interactivos',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 24.0,
            order: 1
          },
          {
            id: 'act-ecom-4',
            templateDeliverableId: 'del-ecom-dev',
            title: 'Carga inicial de 20 SKUs y pruebas de compra reales',
            description: 'Validación de flujo de pago y notificaciones transaccionales',
            roleId: R_CONTENT,
            roleName: R_CONTENT,
            estimatedHours: 6.0,
            order: 2
          }
        ]
      }
    ],
    totalHours: 0,
    estimatedDurationWeeks: 5,
    createdAt: '2026-09-04T10:00:00Z',
    updatedAt: '2026-09-15T08:00:00Z'
  },

  // 5. Shopify
  {
    id: 'tmpl-shopify',
    name: 'Shopify Store Estándar',
    description: 'Configuración técnica y visual de tienda sobre la plataforma Shopify.',
    category: 'shopify',
    version: '1.0',
    status: 'active',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-shp-setup',
        templateId: 'tmpl-shopify',
        name: 'Configuración & Theme Shopify',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-shp-1',
            templateDeliverableId: 'del-shp-setup',
            title: 'Parametrización general de tienda Shopify',
            description: 'Monedas, impuestos, zonas de envío y políticas legales',
            roleId: R_PRODUCT_LEAD,
            roleName: R_PRODUCT_LEAD,
            estimatedHours: 5.0,
            order: 1
          },
          {
            id: 'act-shp-2',
            templateDeliverableId: 'del-shp-setup',
            title: 'Personalización de Tema (Liquid) y Branding',
            description: 'Adaptación de fuentes, paleta de colores y banners en secciones nativas',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 14.0,
            order: 2
          }
        ]
      }
    ],
    totalHours: 0,
    estimatedDurationWeeks: 3,
    createdAt: '2026-09-05T10:00:00Z',
    updatedAt: '2026-09-15T08:00:00Z'
  },

  // 6. Portal / Plataforma
  {
    id: 'tmpl-portal-platform',
    name: 'Portal / Plataforma Web',
    description: 'Arquitectura de software modular con autenticación y panel de usuario.',
    category: 'portal_platform',
    version: '1.0',
    status: 'draft',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-plt-disc',
        templateId: 'tmpl-portal-platform',
        name: 'Discovery Técnico & Arquitectura',
        order: 1,
        roleBudgets: [],
        activities: [
          {
            id: 'act-plt-1',
            templateDeliverableId: 'del-plt-disc',
            title: 'Modelado de Base de Datos y Endpoints API',
            description: 'Diagrama Entidad-Relación y definición de contratos REST/GraphQL',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 12.0,
            order: 1
          },
          {
            id: 'act-plt-2',
            templateDeliverableId: 'del-plt-disc',
            title: 'Diseño de Prototipos de Tablero y Módulos de Usuario',
            description: 'Flujos de autenticación, perfil y gestión de entidades',
            roleId: R_DIGITAL_DESIGNER,
            roleName: R_DIGITAL_DESIGNER,
            estimatedHours: 16.0,
            order: 2
          }
        ]
      },
      {
        id: 'del-plt-dev',
        templateId: 'tmpl-portal-platform',
        name: 'Construcción Frontend & Backend',
        order: 2,
        roleBudgets: [],
        activities: [
          {
            id: 'act-plt-3',
            templateDeliverableId: 'del-plt-dev',
            title: 'Desarrollo de Vistas Frontend en React / Next.js',
            description: 'Componentes reutilizables y sincronización de estado',
            roleId: R_FRONT_END,
            roleName: R_FRONT_END,
            estimatedHours: 32.0,
            order: 1
          }
        ]
      }
    ],
    totalHours: 0,
    estimatedDurationWeeks: 8,
    createdAt: '2026-09-06T10:00:00Z',
    updatedAt: '2026-09-15T08:00:00Z'
  },

  // 7. Proyecto a la Medida
  {
    id: 'tmpl-custom-blank',
    name: 'Proyecto a la Medida (Personalizable)',
    description: 'Plantilla base flexible para construir soluciones personalizadas desde cero o por módulos.',
    category: 'custom',
    version: '1.0',
    status: 'active',
    isReusable: true,
    governedBy: 'Producto',
    deliverables: [
      {
        id: 'del-cst-scope',
        templateId: 'tmpl-custom-blank',
        name: 'Definición de Alcance & Discovery',
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
            title: 'Definición de requerimientos técnicos especiales',
            description: 'Rol técnico no asignado aún al catálogo estándar',
            roleId: ROLE_PENDING_DEFINITION,
            roleName: ROLE_PENDING_DEFINITION,
            estimatedHours: 4.0,
            order: 2,
            optional: true
          }
        ]
      }
    ],
    totalHours: 0,
    estimatedDurationWeeks: 6,
    createdAt: '2026-09-07T10:00:00Z',
    updatedAt: '2026-09-15T08:00:00Z'
  }
];

/**
 * Plantillas iniciales procesadas por el motor de cálculo
 * (garantiza exactitud en los 3 niveles de horas desde el arranque)
 */
export const INITIAL_PRODUCT_BACKLOG_TEMPLATES: ProductBacklogTemplate[] =
  rawInitialTemplates.map(recalculateTemplateHours);
