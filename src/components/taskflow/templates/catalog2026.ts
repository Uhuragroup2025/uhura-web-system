/* eslint-disable */
// GENERADO desde servicios-uhura-2026-para-eco.xlsx (el mismo archivo que se entrega a Indunova).
// No editar a mano: regenerar con scratchpad/build_proto_catalog.py.
// 24 servicios + 17 tiempos sueltos.

export interface CatalogActivity {
  title: string;
  role: string;
  hours: number;
  description?: string;
  optional?: boolean;
  /** Si existe, las horas son por unidad y se multiplican por la cantidad del servicio. */
  unit?: string;
}

export interface CatalogService {
  id: string;
  name: string;
  area: string;
  category: string;
  description: string;
  serviceType: 'fixed_project' | 'fee_monthly' | null;
  unitLabel: string | null;
  weeks: number;
  deliverables: { name: string; activities: CatalogActivity[] }[];
}

export const CATALOG_2026: CatalogService[] = [
  {
    "id": "tmpl-landing-page",
    "name": "Landing page en WordPress / Webflow (hasta 6 bloques)",
    "area": "Producto Digital",
    "category": "producto_digital",
    "description": "1 landing de hasta 6 bloques (diseño con Figma Make), desktop y mobile; copy; 1 formulario; GA4 + GTM básico; SEO on-page; QA; 1 ronda de ajustes post-entrega.",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 3,
    "deliverables": [
      {
        "name": "Onboarding",
        "activities": [
          {
            "title": "Kickoff & alineación",
            "role": "Product Lead",
            "hours": 1.0,
            "description": "Accesos wordpress, hosting, dominio Generar codigo de seguimiento GTM, Analytics, Clarity. Imagenes, casos de exito, propuesta de valor Solicitar compra de Elementor PRO Solicitar suscripción de Hosting"
          },
          {
            "title": "Gestión y seguimiento con el cliente",
            "role": "Client Relationship Strategist",
            "hours": 1.5
          }
        ]
      },
      {
        "name": "UX y contenido",
        "activities": [
          {
            "title": "Diseño landing (hasta 6 bloques) con Figma Make",
            "role": "Product Lead",
            "hours": 2.0
          },
          {
            "title": "Ajustes visuales sobre base",
            "role": "Product Lead",
            "hours": 2.0
          },
          {
            "title": "Discovery de audiencias y arquitectura de mensajes",
            "role": "Digital Content Specialist",
            "hours": 1.5
          },
          {
            "title": "Redacción de copy",
            "role": "Digital Content Specialist",
            "hours": 1.0
          }
        ]
      },
      {
        "name": "Implementación",
        "activities": [
          {
            "title": "Maquetación WordPress (Bricks/Elementor) desktop / mobile",
            "role": "Front-End Dev",
            "hours": 8.0
          },
          {
            "title": "Configuración formulario",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "GA4 + GTM básico",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "SEO on-page",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "QA visual + funcional",
            "role": "Product Lead",
            "hours": 2.0
          }
        ]
      },
      {
        "name": "Entrega",
        "activities": [
          {
            "title": "1 ronda post-entrega - cliente",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "Entrega",
            "role": "Product Lead",
            "hours": 2.0
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-wp-informativo",
    "name": "Sitio web informativo WordPress (hasta 8 secciones)",
    "area": "Producto Digital",
    "category": "producto_digital",
    "description": "Hasta 8 secciones maquetadas en WordPress (Elementor Pro), desktop y mobile; arquitectura UX y diseño UX/UI con IA o plantilla; contenido H1/H2 por página; hasta 10 banners o elementos gráficos; hasta 3 formularios; hasta 3 mails de marketing; ACF (2 CPT / 6 campos máx.); SEO on-page y técnico; GA4, GTM y Clarity con evento de formulario; Search Console, robots.txt y sitemap; 2 aprobaciones del cliente (diseño y staging); 1 ronda de ajustes del cliente; capacitación, documentación y soporte post-lanzamiento.",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 8,
    "deliverables": [
      {
        "name": "Kickoff",
        "activities": [
          {
            "title": "Kickoff con cliente",
            "role": "Client Relationship Strategist",
            "hours": 2.0,
            "description": "Scoliazar: Modelo de negocio, necesidad o punto de dolor (B2B, B2C, transaccional o no, audiencia, TRX, Sitio web actual, servidor, si tiene o no equipo interno, Número de páginas, Número de productos, integraciones actuales, detalle de las soluciones web actuales - Funcionalidades, Temporalidad, presupuesto estimado, Accesos)"
          },
          {
            "title": "Insumo de accesos",
            "role": "Client Relationship Strategist",
            "hours": 1.0
          },
          {
            "title": "Gestión y checkpoints con el cliente",
            "role": "Client Relationship Strategist",
            "hours": 8.0
          }
        ]
      },
      {
        "name": "UX y contenido",
        "activities": [
          {
            "title": "Arquitectura UX con IA",
            "role": "Product Lead",
            "hours": 2.0
          },
          {
            "title": "Diseño UX/UI funcional IA o plantilla",
            "role": "Product Lead",
            "hours": 6.0
          },
          {
            "title": "Discovery de audiencias y arquitectura de mensajes",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Contenido con estructura H1/H2 por página",
            "role": "Digital Content Specialist",
            "hours": 4.0
          },
          {
            "title": "Diseño de banners y elementos graficos (hasta 10)",
            "role": "Creative Designer",
            "hours": 8.0
          },
          {
            "title": "QA visual + funcional",
            "role": "Product Lead",
            "hours": 2.0
          },
          {
            "title": "Ajustes UX/UI",
            "role": "Product Lead",
            "hours": 4.0
          },
          {
            "title": "Presentación y aprobación del cliente (Gate 1: diseño)",
            "role": "Client Relationship Strategist",
            "hours": 1.0,
            "description": "Congelamiento + UAT. Espera del cliente: 5 días hábiles (en ECO va como ronda de ajuste / aprobación en Dependencias, no como horas)"
          }
        ]
      },
      {
        "name": "Implementación",
        "activities": [
          {
            "title": "Setup técnico - wp + plugins base",
            "role": "Front-End Dev",
            "hours": 2.0,
            "description": "Ajustes de hosting (Instalar PHP, cpanel o hosting, HTTP, CDN, SMTP) Crear entorno wordpress e instalar child theme Conectar Elementor PRO Configuración de estilos globales Plugins (Yoast seo, Caché, wpforms)"
          },
          {
            "title": "Maquetación WordPress (8 secciones). desktop y mobile",
            "role": "Front-End Dev",
            "hours": 22.0
          },
          {
            "title": "Setup ACF (2 CPT / 6 campos máx.)",
            "role": "Front-End Dev",
            "hours": 4.0
          },
          {
            "title": "Implementación formularios (hasta 3)",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "Configurar envío de mails marketing (hasta 3)",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "Linkear botones e interacciones",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "SEO on-page técnico",
            "role": "Front-End Dev",
            "hours": 2.0,
            "description": "Asignar h1, h2, etc... metaetiquetas, títulos y meta descripciones, etiquetas de encabezado y palabras clave."
          },
          {
            "title": "Performance base (carga, imágenes, caché)",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "QA técnico",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "QA visual y funcional",
            "role": "Product Lead",
            "hours": 2.0
          },
          {
            "title": "Ajustes internos tras QA",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "Presentación y aprobación del cliente (Gate 2: staging)",
            "role": "Client Relationship Strategist",
            "hours": 1.0,
            "description": "Congelamiento + UAT. Espera del cliente: 3 días hábiles (en ECO va como ronda de ajuste / aprobación en Dependencias, no como horas)"
          },
          {
            "title": "Ajustes del cliente (1 ronda)",
            "role": "Front-End Dev",
            "hours": 6.0
          }
        ]
      },
      {
        "name": "Analítica web",
        "activities": [
          {
            "title": "Instalar codigos de seguimiento GTM, Google Analytics, Clarity",
            "role": "Front-End Dev",
            "hours": 1.0,
            "description": "Implementar etiquetas"
          },
          {
            "title": "Configuración de evento de clic en botón de formulario / conversión de formulario",
            "role": "Front-End Dev",
            "hours": 2.0
          }
        ]
      },
      {
        "name": "Lanzamiento",
        "activities": [
          {
            "title": "Go live / apuntamiento de dominio",
            "role": "Front-End Dev",
            "hours": 2.0,
            "description": "Dejar el sitio al aire, ajuste de dominio (Redirección, apuntar) / (Montar copia en el servidor)"
          },
          {
            "title": "Revisión de calidad y ajustes post-lanzamiento",
            "role": "Front-End Dev",
            "hours": 4.0
          }
        ]
      },
      {
        "name": "SEO técnico",
        "activities": [
          {
            "title": "Verifica la propiedad del sitio en Google Search Console",
            "role": "Digital Content Specialist",
            "hours": 1.0,
            "description": "Verificar la propiedad del sitio, Enviar sitemaps, Revisar errores de rastreo."
          },
          {
            "title": "Implementar robots.txt, sitemaps, Schema markup",
            "role": "Digital Content Specialist",
            "hours": 1.0
          }
        ]
      },
      {
        "name": "Entrega",
        "activities": [
          {
            "title": "Crear usuarios para cliente",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "Capacitación",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "Documentación entrega + checklist",
            "role": "Front-End Dev",
            "hours": 2.0
          }
        ]
      },
      {
        "name": "Soporte",
        "activities": [
          {
            "title": "Soporte post-lanzamiento",
            "role": "Front-End Dev",
            "hours": 6.0
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-mantenimiento-wp",
    "name": "Mantenimiento sitio web informativo WordPress (mensual)",
    "area": "Producto Digital",
    "category": "producto_digital",
    "description": "Mensual: backup inicial y final, actualización de WordPress, tema y plugins, revisión de seguridad, hasta 1,5 h de correcciones menores (sin cambios de funcionalidad, forma o estructura), ajustes de contenido, soporte y reporte de estado.",
    "serviceType": "fee_monthly",
    "unitLabel": null,
    "weeks": 4,
    "deliverables": [
      {
        "name": "Análisis y backup",
        "activities": [
          {
            "title": "Accesos a plataforma",
            "role": "Front-End Dev",
            "hours": 0.5,
            "description": "Hosting y wordpress"
          },
          {
            "title": "Diágnostico de plataforma",
            "role": "Front-End Dev",
            "hours": 1.0,
            "description": "Revisar métricas básicas como la velocidad de carga y el tráfico a través de Google Analytics o herramientas de rendimiento web como Google PageSpeed Insights."
          },
          {
            "title": "Backup inicial y verificación",
            "role": "Front-End Dev",
            "hours": 0.5
          },
          {
            "title": "Actualización WordPress core + actualización tema",
            "role": "Front-End Dev",
            "hours": 1.0,
            "description": "Asegurarse de que no haya intentos fallidos de acceso, ni comportamientos sospechosos, y que los sistemas de protección como firewalls estén operativos."
          }
        ]
      },
      {
        "name": "Actualización",
        "activities": [
          {
            "title": "Actualización plugins",
            "role": "Front-End Dev",
            "hours": 0.5,
            "description": "Se debe crear una copia de seguridad al inicio del mantenimiento y después de hacer mantenimeinto."
          },
          {
            "title": "Revisión seguridad básica (scan / vulnerabilidades)",
            "role": "Front-End Dev",
            "hours": 0.5
          },
          {
            "title": "Corrección errores menores (css roto, sección caída, plugin bug)",
            "role": "Front-End Dev",
            "hours": 1.5,
            "description": "Ajuste de palabras, subir banner o actualización de imagenes. (Nada que afecte funcionalidad, forma o estructura)"
          },
          {
            "title": "Ajustes de contenido",
            "role": "Front-End Dev",
            "hours": 0.5
          },
          {
            "title": "Status de mantenimiento y actualizaciones y prevenciones",
            "role": "Front-End Dev",
            "hours": 0.5
          },
          {
            "title": "Backup final",
            "role": "Front-End Dev",
            "hours": 0.5
          },
          {
            "title": "Soporte cliente",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "Gestión de cliente",
            "role": "Client Relationship Strategist",
            "hours": 1.0
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-tienda-shopify",
    "name": "Desarrollo de tienda online Shopify (hasta 20 SKUs)",
    "area": "Producto Digital",
    "category": "producto_digital",
    "description": "Tienda Shopify con hasta 20 SKUs y hasta 3 colecciones; 2 opciones de plantilla base; Home, PDP, carrito y páginas internas (Nosotros, Contacto, Políticas); 2 banners hero y 2 secundarios; configuración de tienda, checkout, envíos con tarifa fija e impuestos; contenido base y metadescripciones (Home + 3 colecciones); SEO básico y Search Console; GA4, GTM y Clarity con eventos de ecommerce; 2 aprobaciones del cliente; capacitación y soporte post-lanzamiento.",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 8,
    "deliverables": [
      {
        "name": "Kickoff",
        "activities": [
          {
            "title": "Reunión Kickoff + objetivos ecommerce",
            "role": "Client Relationship Strategist",
            "hours": 2.0
          },
          {
            "title": "Visión de producto y objetivos de ecommerce",
            "role": "Product Lead",
            "hours": 1.0
          },
          {
            "title": "Solicitud accesos / insumos cliente",
            "role": "Client Relationship Strategist",
            "hours": 1.0
          },
          {
            "title": "Checkpoints con cliente",
            "role": "Client Relationship Strategist",
            "hours": 6.0
          }
        ]
      },
      {
        "name": "Arquitectura base",
        "activities": [
          {
            "title": "Definición estructura catálogo (tipos, colecciones, variantes)",
            "role": "Product Lead",
            "hours": 2.0
          },
          {
            "title": "Definición plantilla base (2 opc)",
            "role": "Product Lead",
            "hours": 2.0,
            "description": "Link de insumos a recolectar"
          },
          {
            "title": "Presentación y aprobación del cliente (Gate 1: diseño)",
            "role": "Client Relationship Strategist",
            "hours": 1.0,
            "description": "Congelamiento + UAT. Espera del cliente: 5 días hábiles (en ECO va como ronda de ajuste / aprobación en Dependencias, no como horas)"
          }
        ]
      },
      {
        "name": "Contenido base",
        "activities": [
          {
            "title": "Investigación de keyword research e intenciones de búsqueda",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Home + nosotros + contacto + legales base adaptados",
            "role": "Digital Content Specialist",
            "hours": 4.0
          },
          {
            "title": "Metadescripciones home + hasta 3 colecciones",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Banners (2 banner hero home, 2 banners secundarios, placeholder producto)",
            "role": "Creative Designer",
            "hours": 8.0
          }
        ]
      },
      {
        "name": "Setup Shopify",
        "activities": [
          {
            "title": "Reunión de compra de licencia / pasarela de pagos",
            "role": "Product Lead",
            "hours": 1.0
          },
          {
            "title": "Configuración general tienda (moneda, mercado, idioma)",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "Configuración navegación (header + footer)",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "Configuración checkout",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "Configuración envíos tarifa fija",
            "role": "Front-End Dev",
            "hours": 3.0
          },
          {
            "title": "Configuración de impuestos",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "Políticas legales base",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "QA visual y funcional",
            "role": "Product Lead",
            "hours": 2.0
          }
        ]
      },
      {
        "name": "Template & UI",
        "activities": [
          {
            "title": "Instalación y configuración template",
            "role": "Digital Designer",
            "hours": 2.0
          },
          {
            "title": "Customización visual global (tipografías, colores, estilos)",
            "role": "Digital Designer",
            "hours": 4.0
          },
          {
            "title": "Home (banners + secciones)",
            "role": "Digital Designer",
            "hours": 4.0
          },
          {
            "title": "PDP producto",
            "role": "Digital Designer",
            "hours": 4.0
          },
          {
            "title": "Carrito",
            "role": "Digital Designer",
            "hours": 2.0
          },
          {
            "title": "Páginas internas (nosotros, contacto, políticas)",
            "role": "Digital Designer",
            "hours": 4.0
          }
        ]
      },
      {
        "name": "Catálogo (hasta 20 SKUs)",
        "activities": [
          {
            "title": "CSV títulos optimizados + plantilla descripción para hasta 20 productos",
            "role": "Digital Content Specialist",
            "hours": 4.0
          },
          {
            "title": "Creación colecciones (hasta 3)",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "Subcolecciones / organización",
            "role": "Front-End Dev",
            "hours": 3.0
          },
          {
            "title": "Configuración tipos producto",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "Carga productos (hasta 20 SKUs)",
            "role": "Front-End Dev",
            "hours": 6.0
          },
          {
            "title": "QA visual y funcional",
            "role": "Product Lead",
            "hours": 2.0
          }
        ]
      },
      {
        "name": "SEO",
        "activities": [
          {
            "title": "Implementar robots.txt, sitemaps, URLs",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "Verificación de la indexación del sitio y conf de Google Search Console.",
            "role": "Digital Content Specialist",
            "hours": 1.0
          }
        ]
      },
      {
        "name": "QA técnico",
        "activities": [
          {
            "title": "Revisión funcionamiento checkout",
            "role": "Front-End Dev",
            "hours": 0.5
          },
          {
            "title": "Validación responsive",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "Validación flujo de compra",
            "role": "Front-End Dev",
            "hours": 1.0
          }
        ]
      },
      {
        "name": "QA funcional",
        "activities": [
          {
            "title": "Flujo compra usuario real",
            "role": "Front-End Dev",
            "hours": 0.5
          },
          {
            "title": "Presentación y aprobación del cliente (Gate 2: staging)",
            "role": "Client Relationship Strategist",
            "hours": 1.0,
            "description": "Congelamiento + UAT. Espera del cliente: 3 días hábiles (en ECO va como ronda de ajuste / aprobación en Dependencias, no como horas)"
          }
        ]
      },
      {
        "name": "Lanzamiento",
        "activities": [
          {
            "title": "Go live / apuntamiento de dominio",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "QA post-lanzamiento",
            "role": "Front-End Dev",
            "hours": 4.0
          }
        ]
      },
      {
        "name": "Analítica web",
        "activities": [
          {
            "title": "Instalar codigos de seguimiento GTM, Google Analytics, Clarity",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "Configuración de eventos y conversiones GTM (compras, abandonos de carrito, etc.).",
            "role": "Front-End Dev",
            "hours": 4.0
          },
          {
            "title": "Pruebas de eventos",
            "role": "Front-End Dev",
            "hours": 2.0
          }
        ]
      },
      {
        "name": "Entrega",
        "activities": [
          {
            "title": "Capacitación",
            "role": "Product Lead",
            "hours": 1.0
          },
          {
            "title": "Documentación entrega + checklist",
            "role": "Product Lead",
            "hours": 2.0
          },
          {
            "title": "Reunión de cierre del proyecto con cliente",
            "role": "Product Lead",
            "hours": 1.0
          }
        ]
      },
      {
        "name": "Soporte",
        "activities": [
          {
            "title": "Soporte post-lanzamiento",
            "role": "Front-End Dev",
            "hours": 8.0
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-chatbot-manychat",
    "name": "Chatbot con ManyChat (1 flujo principal)",
    "area": "Producto Digital",
    "category": "producto_digital",
    "description": "1 flujo conversacional principal en 1 canal (WhatsApp, Instagram o Facebook): árbol conversacional, mensajes, palabras clave, captura de datos, transferencia a humano y horarios; pruebas, capacitación y documento de entrega. Opcionales: WhatsApp sin API y habilitación de WhatsApp API (Cloud).",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 4,
    "deliverables": [
      {
        "name": "Kickoff",
        "activities": [
          {
            "title": "Kickoff con cliente",
            "role": "Product Lead",
            "hours": 1.0
          },
          {
            "title": "Insumo de accesos (Meta, ManyChat y recolección de FAQs)",
            "role": "Client Relationship Strategist",
            "hours": 1.0
          },
          {
            "title": "Checkpoints con cliente",
            "role": "Client Relationship Strategist",
            "hours": 4.0,
            "description": "Preguntas frecuentes y respuestas predefinidas. Información general sobre servicios y horarios. Recolección de datos básicos del cliente para consultas posteriores. Redirección a un agente humano para consultas complejas o fuera del alcance del bot."
          }
        ]
      },
      {
        "name": "Diseño de flujo + cont",
        "activities": [
          {
            "title": "Definición de árbol conversacional",
            "role": "Product Lead",
            "hours": 2.0
          },
          {
            "title": "Redacción mensajes bot",
            "role": "Digital Content Specialist",
            "hours": 2.0
          }
        ]
      },
      {
        "name": "Opcional · WhatsApp sin API",
        "activities": [
          {
            "title": "Revisión Business Manager",
            "role": "Product Lead",
            "hours": 1.0,
            "optional": true
          },
          {
            "title": "Verificación empresa",
            "role": "Client Relationship Strategist",
            "hours": 1.0,
            "optional": true
          },
          {
            "title": "Alta número BSP",
            "role": "Front-End Dev",
            "hours": 2.0,
            "optional": true
          },
          {
            "title": "Vincular a ManyChat",
            "role": "Front-End Dev",
            "hours": 1.0,
            "optional": true
          },
          {
            "title": "Plantillas Meta",
            "role": "Product Lead",
            "hours": 1.5,
            "optional": true
          },
          {
            "title": "Pruebas envío recepción",
            "role": "Front-End Dev",
            "hours": 1.0,
            "optional": true
          },
          {
            "title": "Documentación cliente",
            "role": "Product Lead",
            "hours": 0.5,
            "optional": true
          }
        ]
      },
      {
        "name": "Configuración de ManyChat",
        "activities": [
          {
            "title": "Conexión canal (WA/IG/FB)",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "Configuración palabras clave",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "Construcción flujo principal",
            "role": "Front-End Dev",
            "hours": 4.0
          },
          {
            "title": "Captura de datos",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "Transferencia a humano",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "Horarios y fallback",
            "role": "Front-End Dev",
            "hours": 1.0
          },
          {
            "title": "Pruebas funcionales",
            "role": "Product Lead",
            "hours": 2.0
          },
          {
            "title": "Al aire",
            "role": "Front-End Dev",
            "hours": 0.5
          }
        ]
      },
      {
        "name": "Opcional · habilitación de WhatsApp API (Cloud)",
        "activities": [
          {
            "title": "WhatsApp API (Cloud) (habilitación de API) si no la tiene",
            "role": "Front-End Dev",
            "hours": 10.0,
            "optional": true
          }
        ]
      },
      {
        "name": "Entrega",
        "activities": [
          {
            "title": "Capacitación cliente",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Documento de entrega y accesos",
            "role": "Product Lead",
            "hours": 2.0
          }
        ]
      },
      {
        "name": "Soporte",
        "activities": [
          {
            "title": "Soporte post-lanzamiento",
            "role": "Client Relationship Strategist",
            "hours": 2.0
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-mercado-libre",
    "name": "Mercado Libre (hasta 15 SKUs)",
    "area": "Producto Digital",
    "category": "producto_digital",
    "description": "Tienda oficial en Mercado Libre con hasta 15 SKUs publicados: análisis de categoría, competencia y keywords; propuesta de valor y legales; categorías; configuración técnica, de cuenta, envíos, devoluciones y reputación; banners de la tienda; QA y capacitación.",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 4,
    "deliverables": [
      {
        "name": "Fase 0 – Kickoff & alcance",
        "activities": [
          {
            "title": "Kickoff con cliente",
            "role": "Product Lead",
            "hours": 1.0
          },
          {
            "title": "Definición de alcance y visión de producto",
            "role": "Product Lead",
            "hours": 2.0
          },
          {
            "title": "Insumo de accesos",
            "role": "Client Relationship Strategist",
            "hours": 2.0
          },
          {
            "title": "Checkpoints con cliente",
            "role": "Client Relationship Strategist",
            "hours": 4.0
          },
          {
            "title": "Análisis categoría + competencia + investigación keywords marketplace",
            "role": "Digital Content Specialist",
            "hours": 3.0
          }
        ]
      },
      {
        "name": "Setup tienda Mercado Libre",
        "activities": [
          {
            "title": "Propuesta de valor de la tienda + legales",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Categorías y subcategorías",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Setup configuración técnica tienda ml",
            "role": "Digital Designer",
            "hours": 4.0
          },
          {
            "title": "Banners y elementos graficos tienda general",
            "role": "Creative Designer",
            "hours": 4.0
          },
          {
            "title": "Configuración cuenta y datos comerciales",
            "role": "Digital Designer",
            "hours": 1.0
          },
          {
            "title": "Políticas de envío y devoluciones",
            "role": "Digital Designer",
            "hours": 1.0
          },
          {
            "title": "Configuración reputación & tiempos",
            "role": "Digital Designer",
            "hours": 1.0
          },
          {
            "title": "Validación QA",
            "role": "Product Lead",
            "hours": 1.0
          }
        ]
      },
      {
        "name": "Publicación y validación",
        "activities": [
          {
            "title": "Carga de hasta 15 SKUs",
            "role": "Digital Designer",
            "hours": 6.0
          },
          {
            "title": "QA visual y narrativa",
            "role": "Product Lead",
            "hours": 2.0
          },
          {
            "title": "QA SEO",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Validación final",
            "role": "Product Lead",
            "hours": 2.0
          },
          {
            "title": "Capacitación",
            "role": "Product Lead",
            "hours": 2.0
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-digital-shelf",
    "name": "Digital Shelf · optimización de PDP (por PDP, hasta 5 imágenes)",
    "area": "Producto Digital",
    "category": "producto_digital",
    "description": "Por cada PDP: auditoría, metatítulo y metadescripción, frases destacadas y hasta 5 imágenes optimizadas (beneficios, lifestyle, momento de consumo). Se cotiza por cantidad de PDP / SKUs; gestión, aprobación con el cliente e informe son fijos por proyecto.",
    "serviceType": "fixed_project",
    "unitLabel": "PDP",
    "weeks": 2,
    "deliverables": [
      {
        "name": "Gestión",
        "activities": [
          {
            "title": "Gestión y revisión del proyecto",
            "role": "Client Relationship Strategist",
            "hours": 0.5
          }
        ]
      },
      {
        "name": "Diagnóstico",
        "activities": [
          {
            "title": "Auditoría PDP´s",
            "role": "Product Lead",
            "hours": 0.5,
            "unit": "PDP"
          }
        ]
      },
      {
        "name": "Optimización de contenido",
        "activities": [
          {
            "title": "Meta descripción y metatitle",
            "role": "Digital Content Specialist",
            "hours": 0.5,
            "description": "Destacar los beneficios del producto con palabras clave relevantes. Utilizar listas y viñetas para mejorar la legibilidad.",
            "unit": "PDP"
          },
          {
            "title": "Frases destacadas para imágenes de beneficios, lifestyle, momento de consumo de cada producto",
            "role": "Digital Content Specialist",
            "hours": 0.5,
            "description": "Enfatizar los beneficios del producto para el cliente. Utilizar un lenguaje persuasivo.",
            "unit": "PDP"
          }
        ]
      },
      {
        "name": "Optimización de imágenes",
        "activities": [
          {
            "title": "Optimización de imágenes para cada hasta 5 imagenes para cada PDP",
            "role": "Creative Designer",
            "hours": 2.0,
            "description": "5 imagenes por producto optimizadas: Optimizada Beneficios (aspectos más relevantes del producto) Lifestyle Momento de consumo (Imagen o video) Family shot (Donde se muestran todos los productos) Product Size",
            "unit": "PDP"
          },
          {
            "title": "Control de calidad interna y ajustes",
            "role": "Creative Designer",
            "hours": 0.5,
            "unit": "PDP"
          },
          {
            "title": "Revisión de calidad (Product Lead)",
            "role": "Product Lead",
            "hours": 0.5,
            "unit": "PDP"
          },
          {
            "title": "Revisión y aprobación con cliente",
            "role": "Product Lead",
            "hours": 0.5,
            "description": "Aprobación para publicar en web"
          }
        ]
      },
      {
        "name": "Entrega",
        "activities": [
          {
            "title": "Informe de entrega",
            "role": "Product Lead",
            "hours": 0.5,
            "description": "Resultado 5 PDP´s optimizadas en contenido y diseño publicadas."
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-redes-sociales-mensual",
    "name": "Creación de contenido para redes sociales (parrilla de 12 publicaciones al mes)",
    "area": "Creativo",
    "category": "creativo",
    "description": "Mensual: parrilla de 12 publicaciones (ruta de contenidos y redacción), diseño estático o animado, UGC, publicación, seguimiento e informe del mes.",
    "serviceType": "fee_monthly",
    "unitLabel": null,
    "weeks": 4,
    "deliverables": [
      {
        "name": "Kickoff",
        "activities": [
          {
            "title": "Recepción de necesidad",
            "role": "Client Relationship Strategist",
            "hours": 1.0,
            "description": "Espacio para socializar el proyecto con el equipo"
          },
          {
            "title": "Dudas y preguntas",
            "role": "Client Relationship Strategist",
            "hours": 0.3,
            "description": "Espacio para socializar el proyecto con el equipo"
          },
          {
            "title": "Recopilación de material",
            "role": "Creative Strategy Lead",
            "hours": 1.0,
            "description": "Material gráfico que provee el cliente (fuentes, logos, imágenes, manual de marca) Se debe descargar el material apenas se envía por parte del cliente"
          }
        ]
      },
      {
        "name": "Creatividad",
        "activities": [
          {
            "title": "Co-creación e ideación",
            "role": "Creative Strategy Lead",
            "hours": 1.5,
            "description": "Se genera un espacio de co-creación con el cliente o el equipo interno"
          },
          {
            "title": "Redacción de documento con hallazgos",
            "role": "Creative Strategy Lead",
            "hours": 0.5,
            "description": "Se redacta un acta o presentación con los hallazgos de la reunión de co-creación (de uso interno)"
          }
        ]
      },
      {
        "name": "Redacción / parrilla 12 publicaciones",
        "activities": [
          {
            "title": "Investigación",
            "role": "Content Creator",
            "hours": 1.5,
            "description": "Se investigan fechas especiales o conmemorativas"
          },
          {
            "title": "Ruta de contenidos",
            "role": "Content Creator",
            "hours": 2.0,
            "description": "Un documento con los temas a tratar durante el periodo de tiempo de vigencia de la parrilla"
          },
          {
            "title": "Redacción de parrilla",
            "role": "Content Creator",
            "hours": 5.5,
            "description": "Redacción de los textos según lo aprobado y la dirección estratégica del negocio"
          },
          {
            "title": "Ajustes internos",
            "role": "Content Creator",
            "hours": 2.0,
            "description": "Ajustes de redacción y ortografía"
          }
        ]
      },
      {
        "name": "UGC x 1 post",
        "activities": [
          {
            "title": "Referenciación",
            "role": "Creative Designer",
            "hours": 0.5,
            "description": "Referentes de tendencias sobre contenido generado por usuario"
          },
          {
            "title": "Grabación",
            "role": "Creative Designer",
            "hours": 6.0,
            "description": "Se graba el material a utilizar (tener en cuenta los productos o recursos)"
          },
          {
            "title": "Edición",
            "role": "Creative Designer",
            "hours": 4.0,
            "description": "Editar el material grabado (Si se requiere locución se debe gestionar)"
          },
          {
            "title": "Ajustes",
            "role": "Creative Designer",
            "hours": 1.5,
            "description": "Se revisa internamente el entregable y se hacen los ajustes del equipo creativo"
          }
        ]
      },
      {
        "name": "Diseño x 1 post",
        "activities": [
          {
            "title": "Referenciación",
            "role": "Creative Designer",
            "hours": 1.0,
            "description": "Investigación de referentes visuales y tendencias"
          },
          {
            "title": "Creativo estático",
            "role": "Creative Designer",
            "hours": 1.4,
            "description": "Diseño de post según los lineamientos gráficos de la marca"
          },
          {
            "title": "Creativo animado",
            "role": "Creative Designer",
            "hours": 2.0,
            "description": "Animación de los elementos teniendo en cuenta una duración corta según el medio o canal"
          },
          {
            "title": "Ajustes internos",
            "role": "Creative Strategy Lead",
            "hours": 0.5,
            "description": "Revisión interna de estilo"
          }
        ]
      },
      {
        "name": "Calidad",
        "activities": [
          {
            "title": "Checklist de calidad",
            "role": "Creative Designer",
            "hours": 0.5,
            "description": "https://docs.google.com/spreadsheets/d/1prKfclda1NiZ3_DpLpWucmoYOTRC2_mlY2zGnsydTgQ/edit?usp=sharing"
          },
          {
            "title": "Revisión interna",
            "role": "Creative Strategy Lead",
            "hours": 0.8,
            "description": "Chequeo de calidad por parte del líder"
          }
        ]
      },
      {
        "name": "Entrega de material",
        "activities": [
          {
            "title": "Subir entregable a ECO",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Se sube el link de la tarea a ECO"
          }
        ]
      },
      {
        "name": "Ajustes de cliente",
        "activities": [
          {
            "title": "Consolidación",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Se verifican los ajustes del cliente y se validan con cliente y comercial de existir una duda"
          },
          {
            "title": "Aplicación de ajustes",
            "role": "Creative Designer",
            "hours": 1.0,
            "description": "Se realizan los ajustes"
          }
        ]
      },
      {
        "name": "Entrega final",
        "activities": [
          {
            "title": "Entrega a comercial",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Se sube el link de la tarea a ECO"
          }
        ]
      },
      {
        "name": "Administración",
        "activities": [
          {
            "title": "Publicación",
            "role": "Community Manager",
            "hours": 2.5,
            "description": "Se programa el material para publicar en la plataforma correspondiente"
          },
          {
            "title": "Seguimiento",
            "role": "Community Manager",
            "hours": 2.0,
            "description": "Se verifica que el material se suba con éxito y sin errores"
          },
          {
            "title": "Creación de informes",
            "role": "Community Manager",
            "hours": 2.5,
            "description": "Creación de un informe periódico con la actividad de las publicaciones durante el mes"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-creatividad-campanas",
    "name": "Creatividad y campañas (2 propuestas de key visual)",
    "area": "Creativo",
    "category": "creativo",
    "description": "Concepto creativo de campaña: benchmark, referenciación, concepto, textos, 2 propuestas de key visual, adaptaciones a mockups y presentación de la campaña.",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 4,
    "deliverables": [
      {
        "name": "Brief y necesidad",
        "activities": [
          {
            "title": "Recepción de necesidad",
            "role": "Client Relationship Strategist",
            "hours": 1.0,
            "description": "Espacio para socializar el proyecto con el equipo"
          },
          {
            "title": "Dudas y preguntas",
            "role": "Client Relationship Strategist",
            "hours": 1.0,
            "description": "Espacio para socializar el proyecto con el equipo"
          }
        ]
      },
      {
        "name": "Creatividad",
        "activities": [
          {
            "title": "Co-creación e ideación",
            "role": "Creative Strategy Lead",
            "hours": 1.5,
            "description": "Se genera un espacio de co-creación con el cliente o el equipo interno"
          }
        ]
      },
      {
        "name": "Investigación",
        "activities": [
          {
            "title": "Redacción de documento con hallazgos",
            "role": "Creative Strategy Lead",
            "hours": 0.5,
            "description": "Se redacta un acta o presentación con los hallazgos de la reunión de co-creación (de uso interno)"
          },
          {
            "title": "Benchmark competencia",
            "role": "Content Creator",
            "hours": 2.0,
            "description": "Se investiga la competencia directa del cliente y referentes del mercado"
          }
        ]
      },
      {
        "name": "Conceptualización",
        "activities": [
          {
            "title": "Referenciación",
            "role": "Content Creator",
            "hours": 2.0,
            "description": "Se buscan campañas y estrategias que sirvan como inspiración para la creación del concepto"
          },
          {
            "title": "Redacción concepto creativo",
            "role": "Content Creator",
            "hours": 4.5,
            "description": "Se crea un documento con la lluvia de ideas de la conceptualización, se escriben todos los conceptos en una lista. NO SE BORRA NADA"
          },
          {
            "title": "Redacción textos piezas",
            "role": "Content Creator",
            "hours": 2.5,
            "description": "Se redactan los textos para KV y piezas gráficas."
          }
        ]
      },
      {
        "name": "Diseño",
        "activities": [
          {
            "title": "Referenciación",
            "role": "Creative Designer",
            "hours": 1.5,
            "description": "Investigación de referentes visuales y tendencias"
          },
          {
            "title": "Diseño key visual",
            "role": "Creative Designer",
            "hours": 6.0,
            "description": "Diseño de 2 propuestas de KV"
          },
          {
            "title": "Adaptaciones",
            "role": "Creative Designer",
            "hours": 2.0,
            "description": "Se adaptan a mockups el KV elegido por el equipo"
          },
          {
            "title": "Diseño presentación",
            "role": "Content Creator",
            "hours": 10.0,
            "description": "Se crea la presentación de la campaña"
          },
          {
            "title": "Presentación interna",
            "role": "Creative Strategy Lead",
            "hours": 1.0,
            "description": "Se presenta a equipo interno"
          },
          {
            "title": "Ajustes",
            "role": "Creative Designer",
            "hours": 3.0,
            "description": "Se aplican los cambios internos"
          }
        ]
      },
      {
        "name": "Calidad",
        "activities": [
          {
            "title": "Checklist de calidad",
            "role": "Creative Designer",
            "hours": 0.5,
            "description": "https://docs.google.com/spreadsheets/d/1mcdi7L-757qwEoQP1m01jx0c6Ne8JrVbP1Qs9T0l6DY/edit?gid=321617146#gid=321617146"
          },
          {
            "title": "Revisión interna",
            "role": "Creative Strategy Lead",
            "hours": 0.8,
            "description": "Se validan los cambios y garantiza el entregable"
          }
        ]
      },
      {
        "name": "Entrega de material",
        "activities": [
          {
            "title": "Subir entregable a ECO",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Se linkea el material y notifica a comercial"
          }
        ]
      },
      {
        "name": "Ajustes de cliente",
        "activities": [
          {
            "title": "Consolidación",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Se verifican los ajustes del cliente y se validan con cliente y comercial de existir una duda"
          },
          {
            "title": "Aplicación de ajustes",
            "role": "Creative Designer",
            "hours": 0.5,
            "description": "Se realizan los ajustes"
          }
        ]
      },
      {
        "name": "Entrega final",
        "activities": [
          {
            "title": "Subir entregable a ECO",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Se sube el link de la tarea a ECO"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-creativos-pauta",
    "name": "Creativos de pauta (por creativo)",
    "area": "Creativo",
    "category": "creativo",
    "description": "Copies y creativos estáticos o animados para pauta, con versiones para pruebas A/B.",
    "serviceType": "fixed_project",
    "unitLabel": "creativo",
    "weeks": 2,
    "deliverables": [
      {
        "name": "Brief y necesidad",
        "activities": [
          {
            "title": "Recepción de necesidad",
            "role": "Client Relationship Strategist",
            "hours": 1.0,
            "description": "Espacio para socializar el proyecto con el equipo",
            "unit": "creativo"
          },
          {
            "title": "Dudas y preguntas",
            "role": "Client Relationship Strategist",
            "hours": 0.3,
            "description": "Espacio para socializar el proyecto con el equipo",
            "unit": "creativo"
          }
        ]
      },
      {
        "name": "Redacción",
        "activities": [
          {
            "title": "Creación de copies",
            "role": "Content Creator",
            "hours": 0.7,
            "description": "Se crean los copies según la necesidad y objetivo de la pauta",
            "unit": "creativo"
          },
          {
            "title": "Adaptaciones",
            "role": "Content Creator",
            "hours": 1.0,
            "description": "Se bajan los textos a las diferentes piezas",
            "unit": "creativo"
          }
        ]
      },
      {
        "name": "Diseño",
        "activities": [
          {
            "title": "Referenciación",
            "role": "Creative Designer",
            "hours": 1.5,
            "description": "Investigación de creativos de la categoría o competencia",
            "unit": "creativo"
          },
          {
            "title": "Creativo estático",
            "role": "Creative Designer",
            "hours": 1.4,
            "description": "Diseño de la pieza según el manual de marca",
            "unit": "creativo"
          },
          {
            "title": "Creativo animado",
            "role": "Creative Designer",
            "hours": 2.0,
            "description": "Se diseña el creativo animado (tener en cuenta si lleva o no locución se debe gestionar)",
            "unit": "creativo"
          },
          {
            "title": "Adaptaciones (AB testing)",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "se crean versiones de los creativos",
            "unit": "creativo"
          },
          {
            "title": "Ajustes",
            "role": "Creative Designer",
            "hours": 1.5,
            "description": "Se revisan por parte del líder del equipo",
            "unit": "creativo"
          }
        ]
      },
      {
        "name": "Calidad",
        "activities": [
          {
            "title": "Checklist de calidad",
            "role": "Creative Designer",
            "hours": 0.5,
            "description": "https://docs.google.com/spreadsheets/d/1prKfclda1NiZ3_DpLpWucmoYOTRC2_mlY2zGnsydTgQ/edit?usp=sharing",
            "unit": "creativo"
          },
          {
            "title": "Revisión interna",
            "role": "Creative Strategy Lead",
            "hours": 0.8,
            "description": "Se verifica los criterios de calidad",
            "unit": "creativo"
          }
        ]
      },
      {
        "name": "Entrega de material",
        "activities": [
          {
            "title": "Subir entregable a ECO",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Se sube a ECO y se notifica al comercial",
            "unit": "creativo"
          }
        ]
      },
      {
        "name": "Ajustes de cliente",
        "activities": [
          {
            "title": "Consolidación",
            "role": "Client Relationship Strategist",
            "hours": 0.2,
            "description": "Se reciben y evalúan los comentarios del cliente",
            "unit": "creativo"
          },
          {
            "title": "Aplicación de ajustes",
            "role": "Creative Designer",
            "hours": 0.5,
            "description": "Se aplican los ajustes",
            "unit": "creativo"
          }
        ]
      },
      {
        "name": "Entrega final",
        "activities": [
          {
            "title": "Subir entregable a ECO",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Se sube material a ECO",
            "unit": "creativo"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-diseno-de-marca",
    "name": "Diseño de marca (naming, KV, manual y manifiesto)",
    "area": "Creativo",
    "category": "creativo",
    "description": "Investigación, buyer persona y taller de arquitectura de marca; naming (mínimo 5 opciones); concepto y narrativa; key visual y adaptación a 4 piezas; manual de marca; manifiesto en texto y video (máx. 1:30); presentación de la marca.",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 6,
    "deliverables": [
      {
        "name": "Brief y necesidad",
        "activities": [
          {
            "title": "Recepción de necesidad",
            "role": "Client Relationship Strategist",
            "hours": 2.0,
            "description": "Espacio para socializar el proyecto con el equipo"
          },
          {
            "title": "Dudas y preguntas",
            "role": "Client Relationship Strategist",
            "hours": 1.0,
            "description": "Espacio para socializar el proyecto con el equipo"
          }
        ]
      },
      {
        "name": "Investigación",
        "activities": [
          {
            "title": "Referenciación",
            "role": "Content Creator",
            "hours": 3.0,
            "description": "Se hace una búsqueda de tendencias, referencias e inspiración gráfica"
          },
          {
            "title": "Benchmark de competencia",
            "role": "Content Creator",
            "hours": 2.5,
            "description": "Búsqueda de la información comunicacional y mensajes de la competencia"
          },
          {
            "title": "Buyer persona",
            "role": "Creative Strategy Lead",
            "hours": 4.0,
            "description": "Espacio de co-creación con cliente para definir el público objetivo"
          },
          {
            "title": "Taller de arquitectura de marca",
            "role": "Creative Strategy Lead",
            "hours": 8.0,
            "description": "Espacio de co-creación de cliente para definir la arquitectura de marca"
          },
          {
            "title": "Insights",
            "role": "Content Creator",
            "hours": 1.5,
            "description": "Resultado de los espacios y conclusiones (se entrega una ppt)"
          }
        ]
      },
      {
        "name": "Naming",
        "activities": [
          {
            "title": "Co-creación",
            "role": "Content Creator",
            "hours": 4.0,
            "description": "Se genera un espacio con una metodología predeterminada de co-creación y lluvia de ideas"
          },
          {
            "title": "Selección y presentación",
            "role": "Creative Strategy Lead",
            "hours": 1.5,
            "description": "Se hace la elección de mínimo 5 opciones y se crea una ppt para presentar a cliente"
          }
        ]
      },
      {
        "name": "Creatividad",
        "activities": [
          {
            "title": "Investigación",
            "role": "Content Creator",
            "hours": 4.0,
            "description": "Se investiga la categoría y los referentes del mercado"
          },
          {
            "title": "Conceptualización",
            "role": "Content Creator",
            "hours": 6.0,
            "description": "Creación del concepto creativo"
          },
          {
            "title": "Creación de narrativa",
            "role": "Content Creator",
            "hours": 4.0,
            "description": "Según el vehículo creativo se crea una narrativa para soportar la comunicación de la marca"
          },
          {
            "title": "Co-creación e ideación",
            "role": "Pendiente de definir",
            "hours": 1.5,
            "description": "Se presenta al equipo y se ven posibles oportunidades de mejora"
          }
        ]
      },
      {
        "name": "Redacción",
        "activities": [
          {
            "title": "Creación de textos",
            "role": "Content Creator",
            "hours": 2.5,
            "description": "Se redactan los textos para KV"
          },
          {
            "title": "Adaptación a piezas",
            "role": "Content Creator",
            "hours": 2.0,
            "description": "Se redactan los textos para las diferentes piezas"
          },
          {
            "title": "Redacción manifiesto",
            "role": "Creative Strategy Lead",
            "hours": 1.5,
            "description": "Se crea un texto emocional que reúna las cualidades de la marca, esta pieza busca emocionar y conectar con el propósito"
          }
        ]
      },
      {
        "name": "Diseño",
        "activities": [
          {
            "title": "Referenciación",
            "role": "Creative Designer",
            "hours": 1.5,
            "description": "Investigación de creativos de la categoría o competencia"
          },
          {
            "title": "Diseño key visual",
            "role": "Creative Designer",
            "hours": 6.0,
            "description": "Se crea una pieza que es la guía gráfica y visual de la comunicación de la marca"
          },
          {
            "title": "Adaptación de piezas x4",
            "role": "Creative Designer",
            "hours": 2.0,
            "description": "Se adapta el KV a 4 piezas elegidas con el cliente"
          },
          {
            "title": "Creación de manual de marca",
            "role": "Creative Designer",
            "hours": 5.0,
            "description": "Diseño del manual de marca con los usos, tipografías, colores y recomendaciones para la correcta adaptación de la marca"
          },
          {
            "title": "Creación de manifiesto",
            "role": "Creative Strategy Lead",
            "hours": 2.5,
            "description": "Según el texto redactado se crea una pieza audiovisual del mismo (video de máximo 1:30)"
          },
          {
            "title": "Ajustes",
            "role": "Creative Strategy Lead",
            "hours": 1.5,
            "description": "Se hacen los ajustes internos"
          }
        ]
      },
      {
        "name": "Presentación de marca",
        "activities": [
          {
            "title": "PPT con la historia de la marca",
            "role": "Creative Strategy Lead",
            "hours": 4.0,
            "description": "Se crea una presentación donde se haga un recorrido por lo que se creó narrativa y visualmente"
          },
          {
            "title": "Presentación a cliente",
            "role": "Creative Strategy Lead",
            "hours": 2.0,
            "description": "Se genera un espacio para exponerle al cliente lo creado"
          }
        ]
      },
      {
        "name": "Calidad",
        "activities": [
          {
            "title": "Checklist de calidad",
            "role": "Creative Strategy Lead",
            "hours": 0.5,
            "description": "Se revisa que todo lo que se planteó se entregue a conformidad con lo comprometido con el cliente"
          },
          {
            "title": "Revisión interna",
            "role": "Creative Strategy Lead",
            "hours": 0.8,
            "description": "Se revisa que los ajustes se realicen"
          }
        ]
      },
      {
        "name": "Entrega de material",
        "activities": [
          {
            "title": "Subir entregable a ECO",
            "role": "Creative Strategy Lead",
            "hours": 0.2,
            "description": "Se sube el material a ECO"
          }
        ]
      },
      {
        "name": "Ajustes de cliente",
        "activities": [
          {
            "title": "Consolidación",
            "role": "Client Relationship Strategist",
            "hours": 1.5,
            "description": "Se reciben los ajustes del cliente (ideal en reunión) y se consolidan"
          },
          {
            "title": "Aplicación de ajustes",
            "role": "Creative Designer",
            "hours": 4.0,
            "description": "Se aplican los cambios propuestos por el cliente"
          }
        ]
      },
      {
        "name": "Entrega final",
        "activities": [
          {
            "title": "Subir entregable a ECO",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Se sube a ECO el link"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-diseno-de-mailing-por-mail",
    "name": "Diseño de mailing (por mail)",
    "area": "Creativo",
    "category": "creativo",
    "description": "Redacción, banners (con GIF animados) y maquetación del mail en Figma.",
    "serviceType": "fixed_project",
    "unitLabel": "mail",
    "weeks": 1,
    "deliverables": [
      {
        "name": "Brief y necesidad",
        "activities": [
          {
            "title": "Recepción de necesidad",
            "role": "Client Relationship Strategist",
            "hours": 1.0,
            "description": "Espacio para socializar el proyecto con el equipo",
            "unit": "mail"
          },
          {
            "title": "Dudas y preguntas",
            "role": "Client Relationship Strategist",
            "hours": 0.3,
            "description": "Espacio para socializar el proyecto con el equipo",
            "unit": "mail"
          }
        ]
      },
      {
        "name": "Redacción",
        "activities": [
          {
            "title": "Redacción de los contenidos",
            "role": "Content Creator",
            "hours": 0.7,
            "description": "Redacción de los textos para mail",
            "unit": "mail"
          },
          {
            "title": "Ajustes",
            "role": "Content Creator",
            "hours": 0.5,
            "description": "Se ajustan los textos internamente",
            "unit": "mail"
          }
        ]
      },
      {
        "name": "Diseño",
        "activities": [
          {
            "title": "Diseño de banners",
            "role": "Creative Designer",
            "hours": 2.0,
            "description": "Diseño de los banners según los criterios gráficos de la marca (se animan los gifs correspondientes)",
            "unit": "mail"
          },
          {
            "title": "Maquetación en Figma",
            "role": "Creative Designer",
            "hours": 1.5,
            "description": "Se crea la maquetación de los mails en Figma",
            "unit": "mail"
          },
          {
            "title": "Ajustes",
            "role": "Creative Designer",
            "hours": 1.0,
            "description": "Se realizan los ajustes internos",
            "unit": "mail"
          }
        ]
      },
      {
        "name": "Calidad",
        "activities": [
          {
            "title": "Checklist de calidad",
            "role": "Creative Designer",
            "hours": 0.5,
            "description": "https://docs.google.com/spreadsheets/d/19ixGJUgtfk4X5lgurdpUifXCZKrNVgOFLc1dqdedpzY/edit",
            "unit": "mail"
          },
          {
            "title": "Revisión interna",
            "role": "Creative Designer",
            "hours": 0.8,
            "description": "Validación de los ajustes",
            "unit": "mail"
          }
        ]
      },
      {
        "name": "Entrega de material",
        "activities": [
          {
            "title": "Subir entregable a ECO",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Notificar en ECO",
            "unit": "mail"
          }
        ]
      },
      {
        "name": "Ajustes de cliente",
        "activities": [
          {
            "title": "Consolidación",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Revisar ajustes de cliente y validar su pertinencia",
            "unit": "mail"
          },
          {
            "title": "Aplicación de ajustes",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Aplicación de los ajustes y revisión",
            "unit": "mail"
          }
        ]
      },
      {
        "name": "Entrega final",
        "activities": [
          {
            "title": "Subir entregable a ECO",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Subir a ECO la niotificación de la realización de la tarea",
            "unit": "mail"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-diseno-de-piezas-extras-e-impresos-promedio-5-pi",
    "name": "Diseño de piezas extras e impresos (promedio 5 piezas)",
    "area": "Creativo",
    "category": "creativo",
    "description": "Promedio de 5 piezas a 2 h por pieza (impresos de más de 5 páginas equivalen a 2 piezas), con artes finales para impresión.",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 2,
    "deliverables": [
      {
        "name": "Brief y necesidad",
        "activities": [
          {
            "title": "Recepción de necesidad",
            "role": "Client Relationship Strategist",
            "hours": 1.0,
            "description": "Espacio para socializar el proyecto con el equipo"
          },
          {
            "title": "Dudas y preguntas",
            "role": "Client Relationship Strategist",
            "hours": 0.3,
            "description": "Espacio para socializar el proyecto con el equipo"
          }
        ]
      },
      {
        "name": "Redacción",
        "activities": [
          {
            "title": "Redacción de los contenidos",
            "role": "Content Creator",
            "hours": 2.0,
            "description": "Redacción de los textos para mail"
          },
          {
            "title": "Ajustes",
            "role": "Content Creator",
            "hours": 0.5,
            "description": "Se ajustan los textos internamente"
          }
        ]
      },
      {
        "name": "Diseño",
        "activities": [
          {
            "title": "Diseño de pïezas (promedio 5 / 2 horas por pieza) - impresos de más de 5 páginas equivalen a 2",
            "role": "Creative Designer",
            "hours": 7.0,
            "description": "Diseño de los piezas según los criterios gráficos de la marca"
          },
          {
            "title": "Ajustes",
            "role": "Creative Designer",
            "hours": 2.0,
            "description": "Se realizan los ajustes internos"
          }
        ]
      },
      {
        "name": "Calidad",
        "activities": [
          {
            "title": "Checklist de calidad",
            "role": "Creative Designer",
            "hours": 0.5,
            "description": "Validación de los ajustes"
          },
          {
            "title": "Revisión interna",
            "role": "Creative Designer",
            "hours": 1.0
          },
          {
            "title": "Subir entregable a ECO",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Notificar en ECO"
          }
        ]
      },
      {
        "name": "Ajustes de cliente",
        "activities": [
          {
            "title": "Consolidación",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Revisar ajustes de cliente y validar su pertinencia"
          },
          {
            "title": "Aplicación de ajustes",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Aplicación de los ajustes y revisión"
          }
        ]
      },
      {
        "name": "Entrega final",
        "activities": [
          {
            "title": "Subir entregable a ECO",
            "role": "Creative Designer",
            "hours": 0.2,
            "description": "Subir a ECO la niotificación de la realización de la tarea"
          },
          {
            "title": "Artes finales",
            "role": "Creative Designer",
            "hours": 2.0,
            "description": "Se crean los artes para impresión"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-onboarding-growth-cliente-nuevo-de-growth",
    "name": "Onboarding Growth (cliente nuevo de Growth)",
    "area": "Growth",
    "category": "growth",
    "description": "Se agrega a todo cliente nuevo de Growth: brief, kickoff, accesos, línea base de KPIs (6–12 meses), objetivos trimestrales y gobierno del proyecto.",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 1,
    "deliverables": [
      {
        "name": "Kickoff",
        "activities": [
          {
            "title": "Desarrollar / actualizar el formato de brief",
            "role": "Growth Manager",
            "hours": 0.5,
            "description": "Usar plantilla única de brief Growth"
          },
          {
            "title": "Solicitar reunión con el cliente",
            "role": "Client Relationship Strategist",
            "hours": 0.1
          },
          {
            "title": "Reunión de Kickoff con brief",
            "role": "Growth Manager",
            "hours": 1.0,
            "description": "Participan DG, GM, LC y especialistas del servicio contratado"
          },
          {
            "title": "Bajada al equipo de la propuesta aprobada y el brief",
            "role": "Growth Manager",
            "hours": 1.0,
            "description": "Incluye alcance: qué incluye / qué no incluye"
          }
        ]
      },
      {
        "name": "Accesos",
        "activities": [
          {
            "title": "Solicitar accesos (BM Meta, Google Ads, TikTok, GA4, GTM, Search Console, cms, ESP/CRM)",
            "role": "Growth Manager",
            "hours": 0.5,
            "description": "Checklist de accesos estándar"
          },
          {
            "title": "Validar accesos y documentarlos en el drive del cliente",
            "role": "Trafficker Media",
            "hours": 0.5
          }
        ]
      },
      {
        "name": "Línea base y objetivos",
        "activities": [
          {
            "title": "Levantar línea base de KPIs (últimos 6–12 meses)",
            "role": "Growth Manager",
            "hours": 2.0,
            "description": "Ventas, tráfico, CPA/ROAS, CR, base de contactos"
          },
          {
            "title": "Definir objetivos y metas trimestrales con el cliente",
            "role": "Growth Manager",
            "hours": 1.0,
            "description": "Metas aprobadas por el cliente por escrito"
          }
        ]
      },
      {
        "name": "Gobierno del proyecto",
        "activities": [
          {
            "title": "Definir canales de comunicación, cadencia de comités y raci",
            "role": "Client Relationship Strategist",
            "hours": 0.5
          },
          {
            "title": "Crear proyecto en ECO con taxonomía Growth y horas estimadas",
            "role": "Growth Manager",
            "hours": 0.5,
            "description": "Base para comparar estimado vs logueado"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-implementacion-de-medicion-y-tracking-ga4-pixel-",
    "name": "Implementación de medición y tracking (GA4, Pixel, Google Ads y dashboard)",
    "area": "Growth",
    "category": "growth",
    "description": "Auditoría y plan de medición; GTM + GA4 con eventos de ecommerce; Meta Pixel + Conversions API; conversiones de Google Ads; TikTok (si aplica); Clarity; QA de medición y dashboard en Looker Studio. Prerrequisito de pauta, email y CRO.",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 2,
    "deliverables": [
      {
        "name": "Diagnóstico",
        "activities": [
          {
            "title": "Auditoría de etiquetas actuales (GTM, GA4, Pixel, tags de Google Ads/TikTok)",
            "role": "Trafficker Media",
            "hours": 2.0
          },
          {
            "title": "Plan de medición: eventos, conversiones y parámetros",
            "role": "Trafficker Media",
            "hours": 2.0,
            "description": "Documento aprobado por DG"
          }
        ]
      },
      {
        "name": "Implementación",
        "activities": [
          {
            "title": "Configuración de GTM + GA4 con eventos de ecommerce",
            "role": "Front-End Dev",
            "hours": 4.0,
            "description": "view_item, add_to_cart, begin_checkout, purchase"
          },
          {
            "title": "Meta Pixel + Conversions API con deduplicación (event_id)",
            "role": "Trafficker Media",
            "hours": 3.0,
            "description": "Ver proceso de implementaciones Pixel + CAPI"
          },
          {
            "title": "Conversiones de Google Ads + conversiones mejoradas",
            "role": "Trafficker Media",
            "hours": 2.0
          },
          {
            "title": "TikTok Pixel / events API",
            "role": "Trafficker Media",
            "hours": 1.5,
            "description": "Solo si el cliente pauta en TikTok"
          },
          {
            "title": "Microsoft Clarity / mapas de calor",
            "role": "Trafficker Media",
            "hours": 0.5,
            "description": "Insumo para CRO"
          }
        ]
      },
      {
        "name": "QA de medición",
        "activities": [
          {
            "title": "Validación en Tag Assistant / Events Manager (EMQ)",
            "role": "Trafficker Media",
            "hours": 1.5
          },
          {
            "title": "Validación cruzada de conversiones vs ventas reales de la plataforma",
            "role": "Trafficker Media",
            "hours": 1.0,
            "description": "Desviación aceptable < 10%"
          }
        ]
      },
      {
        "name": "Dashboard",
        "activities": [
          {
            "title": "Conexión de fuentes de datos (Dataslayer / Looker Studio)",
            "role": "Trafficker Media",
            "hours": 2.0
          },
          {
            "title": "Construcción del dashboard",
            "role": "Trafficker Media",
            "hours": 6.0,
            "description": "Se trae de Implementación de Pauta (antes 8 h)"
          },
          {
            "title": "Revisión y entrega del dashboard al cliente",
            "role": "Trafficker Media",
            "hours": 1.0
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-implementacion-de-pauta-1-plataforma",
    "name": "Implementación de pauta (1 plataforma)",
    "area": "Growth",
    "category": "growth",
    "description": "Para 1 plataforma (Meta o Google): planeación, públicos, presupuesto, estructura, feed de productos, copys, montaje de campañas, UTMs, pruebas A/B, QA y reporte de lanzamiento. Cada plataforma adicional suma aprox. el 60 %.",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 2,
    "deliverables": [
      {
        "name": "Planeación",
        "activities": [
          {
            "title": "Definición de objetivos por campaña y etapa del funnel",
            "role": "Trafficker Media",
            "hours": 0.5
          },
          {
            "title": "Definición de públicos (1p, lookalikes, intereses, remarketing)",
            "role": "Trafficker Media",
            "hours": 1.5
          },
          {
            "title": "Definición y distribución de presupuesto",
            "role": "Trafficker Media",
            "hours": 1.0
          },
          {
            "title": "Estructura de cuenta y naming convention",
            "role": "Trafficker Media",
            "hours": 1.0
          },
          {
            "title": "Matriz de formatos y piezas requeridas",
            "role": "Trafficker Media",
            "hours": 1.0
          },
          {
            "title": "Brief creativo y comunicación por etapa",
            "role": "Trafficker Media",
            "hours": 1.0
          }
        ]
      },
      {
        "name": "Configuración de plataformas",
        "activities": [
          {
            "title": "Accesos a activos comerciales y métodos de pago",
            "role": "Trafficker Media",
            "hours": 0.5
          },
          {
            "title": "Catálogo / feed de productos (Meta Commerce, Merchant Center)",
            "role": "Trafficker Media",
            "hours": 2.0
          },
          {
            "title": "Validar que la medición esté activa",
            "role": "Trafficker Media",
            "hours": 0.3
          },
          {
            "title": "Formato de seguimiento de pauta",
            "role": "Trafficker Media",
            "hours": 0.5
          }
        ]
      },
      {
        "name": "Construcción de contenido",
        "activities": [
          {
            "title": "Redacción de copys de anuncios",
            "role": "Creative Designer",
            "hours": 1.5
          },
          {
            "title": "Diseño de piezas",
            "role": "Creative Designer",
            "hours": 0.0
          },
          {
            "title": "Ajustes de piezas",
            "role": "Client Relationship Strategist",
            "hours": 0.0
          },
          {
            "title": "Aprobación de contenido por el cliente",
            "role": "Trafficker Media",
            "hours": 0.5
          }
        ]
      },
      {
        "name": "Montaje de campañas",
        "activities": [
          {
            "title": "Creación de campañas y conjuntos con públicos",
            "role": "Trafficker Media",
            "hours": 2.0
          },
          {
            "title": "Carga de anuncios",
            "role": "Trafficker Media",
            "hours": 1.5
          },
          {
            "title": "Asignación de UTMs",
            "role": "Trafficker Media",
            "hours": 0.5
          },
          {
            "title": "Configuración de pruebas A/B",
            "role": "Trafficker Media",
            "hours": 0.5
          },
          {
            "title": "Reglas automatizadas y alertas",
            "role": "Trafficker Media",
            "hours": 0.5
          },
          {
            "title": "Publicación de campañas",
            "role": "Trafficker Media",
            "hours": 0.3
          }
        ]
      },
      {
        "name": "Verificación",
        "activities": [
          {
            "title": "QA prelanzamiento con checklist",
            "role": "Trafficker Media",
            "hours": 1.0
          },
          {
            "title": "Revisión a las 48–72 h (entrega, aprendizaje, costos iniciales)",
            "role": "Trafficker Media",
            "hours": 1.0
          },
          {
            "title": "Reporte de lanzamiento al cliente",
            "role": "Growth Manager",
            "hours": 0.5
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-pauta-gestion-mensual",
    "name": "Gestión y optimización de pauta (mensual, cliente mediano con 2 plataformas)",
    "area": "Growth",
    "category": "growth",
    "description": "Mensual, base cliente mediano con 2 plataformas: verificación diaria, optimización semanal, seguimiento con el cliente, informe y plan del siguiente mes.",
    "serviceType": "fee_monthly",
    "unitLabel": null,
    "weeks": 4,
    "deliverables": [
      {
        "name": "Verificación diaria",
        "activities": [
          {
            "title": "Revisión de alertas y entrega",
            "role": "Trafficker Media",
            "hours": 3.0,
            "description": "Estimacion mensual"
          },
          {
            "title": "Control de inversión vs presupuesto",
            "role": "Trafficker Media",
            "hours": 2.0,
            "description": "Estimacion mensual"
          }
        ]
      },
      {
        "name": "Optimización semanal",
        "activities": [
          {
            "title": "Revisión de pujas y presupuestos",
            "role": "Trafficker Media",
            "hours": 2.0,
            "description": "Estimacion mensual"
          },
          {
            "title": "Revisión de audiencias",
            "role": "Trafficker Media",
            "hours": 2.0,
            "description": "Estimacion mensual"
          },
          {
            "title": "Revisión de creativos y comunicación (fatiga, nuevos tests)",
            "role": "Trafficker Media",
            "hours": 3.0,
            "description": "Estimacion mensual"
          },
          {
            "title": "Términos de búsqueda y negativas (Google)",
            "role": "Trafficker Media",
            "hours": 2.0,
            "description": "Estimacion mensual"
          }
        ]
      },
      {
        "name": "Seguimiento",
        "activities": [
          {
            "title": "Feedback de seguimiento semanal con el cliente",
            "role": "Growth Manager",
            "hours": 2.0,
            "description": "Estimacion mensual"
          },
          {
            "title": "Trabajo colaborativo con el área creativa",
            "role": "Trafficker Media",
            "hours": 2.0,
            "description": "Estimacion mensual"
          }
        ]
      },
      {
        "name": "Reporte",
        "activities": [
          {
            "title": "Informe mensual de pauta",
            "role": "Trafficker Media",
            "hours": 2.0,
            "description": "Estimacion mensual"
          },
          {
            "title": "Revisión de calidad del informe con rúbrica",
            "role": "Trafficker Media",
            "hours": 0.5,
            "description": "Estimacion mensual"
          }
        ]
      },
      {
        "name": "Planeación",
        "activities": [
          {
            "title": "Plan del siguiente mes (tests priorizados con ICE, presupuesto)",
            "role": "Trafficker Media",
            "hours": 2.0,
            "description": "Estimacion mensual"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-seo-one-shot",
    "name": "Implementación de SEO (keyword research, auditoría y estrategia)",
    "area": "Growth",
    "category": "growth",
    "description": "Primer mes de SEO: keyword research por clusters, auditoría SEO (técnica, on-page, contenido, backlinks y buscadores con IA) y estrategia SEO con plan de implementación.",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 4,
    "deliverables": [
      {
        "name": "Keyword research",
        "activities": [
          {
            "title": "Definición de objetivos y audiencia",
            "role": "Digital Content Specialist",
            "hours": 0.33
          },
          {
            "title": "Análisis de la competencia",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Generación de palabras clave con herramientas (Semrush / Ahrefs / GSC)",
            "role": "Digital Content Specialist",
            "hours": 3.0
          },
          {
            "title": "Agrupación por clusters e intención de búsqueda",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Dificultad y priorización de palabras clave",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Documentación y presentación del keyword research",
            "role": "Digital Content Specialist",
            "hours": 1.5
          }
        ]
      },
      {
        "name": "Auditoría SEO",
        "activities": [
          {
            "title": "Preparación y configuración de herramientas (GSC, Screaming Frog)",
            "role": "Front-End Dev",
            "hours": 1.5
          },
          {
            "title": "Estructura del sitio, indexación y rastreo (robots.txt, sitemaps)",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "SEO técnico (Core Web Vitals, canonicals, Schema, redirecciones)",
            "role": "Front-End Dev",
            "hours": 2.5
          },
          {
            "title": "Análisis de SEO on-page",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Revisión de contenido y canibalización",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Análisis de backlinks y perfil de enlaces",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Revisión de datos de tráfico y rendimiento (GA4 / GSC)",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Visibilidad en buscadores con IA (AI Overviews, ChatGPT, Perplexity)",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Documentación y presentación de resultados",
            "role": "Digital Content Specialist",
            "hours": 2.0
          }
        ]
      },
      {
        "name": "Estrategia SEO",
        "activities": [
          {
            "title": "Definición de objetivos y KPIs",
            "role": "Digital Content Specialist",
            "hours": 0.5
          },
          {
            "title": "Directrices de optimización on-page (títulos, metas, H1–H3, enlazado interno)",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Plan de mejoras técnicas",
            "role": "Front-End Dev",
            "hours": 3.0
          },
          {
            "title": "Estrategia de contenidos por clusters",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Estrategia de linkbuilding",
            "role": "Digital Content Specialist",
            "hours": 1.5
          },
          {
            "title": "Alineación con pauta, email y redes",
            "role": "Digital Content Specialist",
            "hours": 0.5
          },
          {
            "title": "Plan de implementación y cronograma",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Documentación y presentación de la estrategia",
            "role": "Digital Content Specialist",
            "hours": 1.5
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-implementacion-de-blog-4-articulos-pilar",
    "name": "Implementación de blog (4 artículos pilar)",
    "area": "Growth",
    "category": "growth",
    "description": "Arquitectura y plantilla del blog, diseño UX, configuración en el CMS, maquetación, captura de leads, eventos de GA4, calendario editorial a 3 meses y 4 artículos pilar.",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 2,
    "deliverables": [
      {
        "name": "Arquitectura",
        "activities": [
          {
            "title": "Categorías y arquitectura de URLs según clusters",
            "role": "Digital Content Specialist",
            "hours": 1.5
          },
          {
            "title": "Plantilla de artículo (H1–H3, índice, autor, CTA, productos relacionados)",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Diseño UX del blog (home, categoría, artículo)",
            "role": "Creative Designer",
            "hours": 2.0
          }
        ]
      },
      {
        "name": "Configuración del cms",
        "activities": [
          {
            "title": "Configuración del blog en el cms (Shopify / WordPress / VTEX)",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "Plugins SEO, Schema Article/FAQ y sitemap",
            "role": "Front-End Dev",
            "hours": 1.5
          },
          {
            "title": "Maquetación de plantillas",
            "role": "Front-End Dev",
            "hours": 4.0
          },
          {
            "title": "Integración de CTAs, productos y captura de leads hacia el ESP",
            "role": "Front-End Dev",
            "hours": 2.0
          },
          {
            "title": "Eventos de GA4 (scroll, clic en CTA, lead)",
            "role": "Front-End Dev",
            "hours": 1.0
          }
        ]
      },
      {
        "name": "Calendario editorial",
        "activities": [
          {
            "title": "Calendario editorial a 3 meses",
            "role": "Digital Content Specialist",
            "hours": 3.0
          },
          {
            "title": "Optimización de artículos existentes",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Briefs de los primeros 4 artículos",
            "role": "Digital Content Specialist",
            "hours": 2.0
          }
        ]
      },
      {
        "name": "Contenido de lanzamiento",
        "activities": [
          {
            "title": "Redacción de 4 artículos pilar (asistida con IA + edición)",
            "role": "Digital Content Specialist",
            "hours": 6.0
          },
          {
            "title": "Recursos visuales de los artículos",
            "role": "Creative Designer",
            "hours": 2.0
          },
          {
            "title": "Aprobación del cliente",
            "role": "Client Relationship Strategist",
            "hours": 0.5
          }
        ]
      },
      {
        "name": "QA y lanzamiento",
        "activities": [
          {
            "title": "QA: enlaces, mobile, velocidad, indexabilidad",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Publicación y solicitud de indexación en GSC",
            "role": "Digital Content Specialist",
            "hours": 0.5
          },
          {
            "title": "Comunicación del lanzamiento por email y redes",
            "role": "Digital Content Specialist",
            "hours": 0.5
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-gestion-seo-y-contenido-mensual-por-articulo",
    "name": "Gestión SEO y contenido (mensual, por artículo)",
    "area": "Growth",
    "category": "growth",
    "description": "Mensual: producción de contenido por artículo (multiplicar por los artículos del plan), monitoreo, optimizaciones, linkbuilding, informe y plan del siguiente mes.",
    "serviceType": "fee_monthly",
    "unitLabel": "artículo",
    "weeks": 4,
    "deliverables": [
      {
        "name": "Producción de contenido (por artículo)",
        "activities": [
          {
            "title": "Brief y estructura del contenido",
            "role": "Digital Content Specialist",
            "hours": 0.25,
            "unit": "artículo"
          },
          {
            "title": "Redacción del borrador",
            "role": "Digital Content Specialist",
            "hours": 0.75,
            "unit": "artículo"
          },
          {
            "title": "Optimización SEO on-page",
            "role": "Digital Content Specialist",
            "hours": 0.3,
            "unit": "artículo"
          },
          {
            "title": "Revisión y edición",
            "role": "Digital Content Specialist",
            "hours": 0.25,
            "unit": "artículo"
          },
          {
            "title": "Recursos visuales",
            "role": "Creative Designer",
            "hours": 0.25,
            "unit": "artículo"
          },
          {
            "title": "Revisión final y publicación",
            "role": "Digital Content Specialist",
            "hours": 0.1,
            "unit": "artículo"
          }
        ]
      },
      {
        "name": "Optimización",
        "activities": [
          {
            "title": "Monitoreo de posiciones y Search Console",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Optimizaciones on-page y técnicas del mes",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Linkbuilding",
            "role": "Digital Content Specialist",
            "hours": 1.0
          }
        ]
      },
      {
        "name": "Reporte y planeación",
        "activities": [
          {
            "title": "Informe mensual de SEO",
            "role": "Digital Content Specialist",
            "hours": 1.5
          },
          {
            "title": "Plan del siguiente mes",
            "role": "Digital Content Specialist",
            "hours": 1.0
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-implementacion-de-email-4-flujos-automatizados",
    "name": "Implementación de email (4 flujos automatizados)",
    "area": "Growth",
    "category": "growth",
    "description": "Diagnóstico, autenticación de dominio, integración con ecommerce o CRM, segmentos, formularios, plantilla maestra y 4 flujos base (bienvenida, carrito abandonado, post-compra y winback), pruebas y lanzamiento.",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 2,
    "deliverables": [
      {
        "name": "Diagnóstico",
        "activities": [
          {
            "title": "Revisión de la plataforma actual o selección del ESP",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Auditoría de la base de datos (calidad, opt-in, duplicados)",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Objetivos y KPIs (apertura, ctr, ingresos por destinatario)",
            "role": "Digital Content Specialist",
            "hours": 0.5
          }
        ]
      },
      {
        "name": "Configuración técnica",
        "activities": [
          {
            "title": "Autenticación de dominio (SPF, DKIM, DMARC)",
            "role": "Front-End Dev",
            "hours": 1.5
          },
          {
            "title": "Integración con ecommerce / CRM (eventos y catálogo)",
            "role": "Front-End Dev",
            "hours": 3.0
          },
          {
            "title": "Importación y limpieza de contactos",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Listas, segmentos y propiedades",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Formularios y pop-ups de captura",
            "role": "Digital Content Specialist",
            "hours": 1.5
          },
          {
            "title": "Plan de calentamiento de dominio",
            "role": "Digital Content Specialist",
            "hours": 1.0
          }
        ]
      },
      {
        "name": "Diseño",
        "activities": [
          {
            "title": "Plantilla maestra responsive con la marca",
            "role": "Creative Designer",
            "hours": 3.0
          },
          {
            "title": "Bloques reutilizables en la plataforma",
            "role": "Digital Content Specialist",
            "hours": 1.0
          }
        ]
      },
      {
        "name": "Flujos automatizados base",
        "activities": [
          {
            "title": "Mapa de flujos y disparadores",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Flujo de bienvenida",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Flujo de carrito y navegación abandonada",
            "role": "Digital Content Specialist",
            "hours": 3.0
          },
          {
            "title": "Flujo post-compra / venta cruzada",
            "role": "Digital Content Specialist",
            "hours": 2.0
          },
          {
            "title": "Flujo de recuperación (winback)",
            "role": "Digital Content Specialist",
            "hours": 1.5
          },
          {
            "title": "Copys de los flujos",
            "role": "Digital Content Specialist",
            "hours": 3.0
          }
        ]
      },
      {
        "name": "Pruebas",
        "activities": [
          {
            "title": "Pruebas de visualización en dispositivos y clientes de correo",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Pruebas de enlaces y UTMs",
            "role": "Digital Content Specialist",
            "hours": 0.5
          },
          {
            "title": "Envío de prueba y aprobación del cliente",
            "role": "Digital Content Specialist",
            "hours": 0.5
          }
        ]
      },
      {
        "name": "Lanzamiento",
        "activities": [
          {
            "title": "Activación de flujos",
            "role": "Digital Content Specialist",
            "hours": 0.5
          },
          {
            "title": "Monitoreo de la primera semana (entregabilidad, spam, rebotes)",
            "role": "Digital Content Specialist",
            "hours": 1.0
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-gestion-de-email-mensual-por-campana",
    "name": "Gestión de email (mensual, por campaña)",
    "area": "Growth",
    "category": "growth",
    "description": "Mensual: calendario de campañas, producción por campaña (multiplicar por las campañas del mes), optimización de flujos, higiene de la base, informe y plan.",
    "serviceType": "fee_monthly",
    "unitLabel": "campaña",
    "weeks": 4,
    "deliverables": [
      {
        "name": "Planeación",
        "activities": [
          {
            "title": "Calendario mensual de campañas",
            "role": "Digital Content Specialist",
            "hours": 1.0
          }
        ]
      },
      {
        "name": "Producción (por campaña)",
        "activities": [
          {
            "title": "Segmentación de la campaña",
            "role": "Digital Content Specialist",
            "hours": 0.25,
            "unit": "campaña"
          },
          {
            "title": "Asunto y preheader",
            "role": "Digital Content Specialist",
            "hours": 0.25,
            "unit": "campaña"
          },
          {
            "title": "Redacción del contenido y CTA",
            "role": "Digital Content Specialist",
            "hours": 0.5,
            "unit": "campaña"
          },
          {
            "title": "Diseño del email",
            "role": "Creative Designer",
            "hours": 1.0,
            "unit": "campaña"
          },
          {
            "title": "Montaje en la plataforma",
            "role": "Digital Content Specialist",
            "hours": 0.5,
            "unit": "campaña"
          },
          {
            "title": "QA y prueba A/B",
            "role": "Digital Content Specialist",
            "hours": 0.5,
            "unit": "campaña"
          },
          {
            "title": "Programación y envío",
            "role": "Digital Content Specialist",
            "hours": 0.2,
            "unit": "campaña"
          }
        ]
      },
      {
        "name": "Optimización",
        "activities": [
          {
            "title": "Revisión de flujos activos",
            "role": "Digital Content Specialist",
            "hours": 1.0
          },
          {
            "title": "Higiene de la base (rebotes, inactivos)",
            "role": "Digital Content Specialist",
            "hours": 0.5
          }
        ]
      },
      {
        "name": "Reporte y planeación",
        "activities": [
          {
            "title": "Informe mensual de email",
            "role": "Digital Content Specialist",
            "hours": 1.5
          },
          {
            "title": "Plan del siguiente mes",
            "role": "Digital Content Specialist",
            "hours": 0.5
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-cro-y-experimentacion-1-experimento-por-sprint",
    "name": "CRO y experimentación (1 experimento por sprint)",
    "area": "Growth",
    "category": "growth",
    "description": "Un sprint = 1 experimento de punta a punta: diagnóstico del embudo, hipótesis priorizadas con ICE, variantes, implementación, QA y lectura de resultados.",
    "serviceType": "fixed_project",
    "unitLabel": null,
    "weeks": 2,
    "deliverables": [
      {
        "name": "Diagnóstico",
        "activities": [
          {
            "title": "Análisis del embudo en GA4 (puntos de abandono)",
            "role": "Growth Manager",
            "hours": 2.0
          },
          {
            "title": "Análisis de mapas de calor y grabaciones",
            "role": "Growth Manager",
            "hours": 2.0
          },
          {
            "title": "Auditoría heurística (PDP, carrito, checkout)",
            "role": "Growth Manager",
            "hours": 2.0
          }
        ]
      },
      {
        "name": "Backlog",
        "activities": [
          {
            "title": "Hipótesis y priorización con ICE",
            "role": "Growth Manager",
            "hours": 1.0
          },
          {
            "title": "Aprobación del experimento",
            "role": "Growth Manager",
            "hours": 0.5
          }
        ]
      },
      {
        "name": "Ejecución",
        "activities": [
          {
            "title": "Diseño de variantes",
            "role": "Growth Manager",
            "hours": 2.0
          },
          {
            "title": "Implementación del experimento",
            "role": "Creative Designer",
            "hours": 3.0
          },
          {
            "title": "QA del experimento",
            "role": "Front-End Dev",
            "hours": 0.5
          }
        ]
      },
      {
        "name": "Análisis",
        "activities": [
          {
            "title": "Lectura de resultados y significancia",
            "role": "Trafficker Media",
            "hours": 1.0
          },
          {
            "title": "Documentación de aprendizajes",
            "role": "Trafficker Media",
            "hours": 0.5
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-reporte-y-comite-de-growth-mensual",
    "name": "Reporte y comité de Growth (mensual)",
    "area": "Growth",
    "category": "growth",
    "description": "Mensual: informe consolidado multicanal, comité con el cliente, acta y control de horas.",
    "serviceType": "fee_monthly",
    "unitLabel": null,
    "weeks": 4,
    "deliverables": [
      {
        "name": "Consolidación",
        "activities": [
          {
            "title": "Informe consolidado multicanal (pauta, SEO, email, CRO)",
            "role": "Growth Manager",
            "hours": 2.0
          },
          {
            "title": "Auditoría del informe con rúbrica",
            "role": "Growth Manager",
            "hours": 1.0
          }
        ]
      },
      {
        "name": "Comité",
        "activities": [
          {
            "title": "Comité mensual con el cliente",
            "role": "Growth Manager",
            "hours": 1.5
          },
          {
            "title": "Acta, acuerdos y tareas",
            "role": "Client Relationship Strategist",
            "hours": 0.5
          }
        ]
      },
      {
        "name": "Control interno",
        "activities": [
          {
            "title": "Revisión de horas estimadas vs registradas en ECO",
            "role": "Growth Manager",
            "hours": 0.5
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-bloque-o-seccion-adicional-en-una-landing",
    "name": "Bloque o sección adicional en una landing",
    "area": "Producto Digital",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Producto Digital): 2.5 h por bloque. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "bloque",
    "weeks": 1,
    "deliverables": [
      {
        "name": "Bloque o sección adicional en una landing",
        "activities": [
          {
            "title": "Diseño · bloque o sección adicional en una landing",
            "role": "Digital Designer",
            "hours": 0.7,
            "unit": "bloque"
          },
          {
            "title": "Desarrollo · bloque o sección adicional en una landing",
            "role": "Front-End Dev",
            "hours": 1.4,
            "unit": "bloque"
          },
          {
            "title": "Contenido · bloque o sección adicional en una landing",
            "role": "Digital Content Specialist",
            "hours": 0.2,
            "unit": "bloque"
          },
          {
            "title": "QA · bloque o sección adicional en una landing",
            "role": "Product Lead",
            "hours": 0.2,
            "unit": "bloque"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-pagina-adicional-en-sitio-web-wordpress",
    "name": "Página adicional en sitio web WordPress",
    "area": "Producto Digital",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Producto Digital): 4.5 h por página. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "página",
    "weeks": 1,
    "deliverables": [
      {
        "name": "Página adicional en sitio web WordPress",
        "activities": [
          {
            "title": "Diseño · página adicional en sitio web WordPress",
            "role": "Digital Designer",
            "hours": 0.75,
            "unit": "página"
          },
          {
            "title": "Desarrollo · página adicional en sitio web WordPress",
            "role": "Front-End Dev",
            "hours": 2.75,
            "unit": "página"
          },
          {
            "title": "Contenido · página adicional en sitio web WordPress",
            "role": "Digital Content Specialist",
            "hours": 0.5,
            "unit": "página"
          },
          {
            "title": "QA · página adicional en sitio web WordPress",
            "role": "Product Lead",
            "hours": 0.5,
            "unit": "página"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-formulario-adicional",
    "name": "Formulario adicional",
    "area": "Producto Digital",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Producto Digital): 1 h por formulario. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "formulario",
    "weeks": 1,
    "deliverables": [
      {
        "name": "Formulario adicional",
        "activities": [
          {
            "title": "Formulario adicional",
            "role": "Front-End Dev",
            "hours": 1.0,
            "unit": "formulario"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-evento-o-conversion-adicional-en-ga4-gtm",
    "name": "Evento o conversión adicional en GA4 / GTM",
    "area": "Producto Digital",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Producto Digital): 0.5 h por evento. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "evento",
    "weeks": 1,
    "deliverables": [
      {
        "name": "Evento o conversión adicional en GA4 / GTM",
        "activities": [
          {
            "title": "Evento o conversión adicional en GA4 / GTM",
            "role": "Front-End Dev",
            "hours": 0.5,
            "unit": "evento"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-banner-o-elemento-grafico-adicional-para-web",
    "name": "Banner o elemento gráfico adicional para web",
    "area": "Producto Digital",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Producto Digital): 0.8 h por banner. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "banner",
    "weeks": 1,
    "deliverables": [
      {
        "name": "Banner o elemento gráfico adicional para web",
        "activities": [
          {
            "title": "Banner o elemento gráfico adicional para web",
            "role": "Creative Designer",
            "hours": 0.8,
            "unit": "banner"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-producto-sku-adicional-en-shopify",
    "name": "Producto (SKU) adicional en Shopify",
    "area": "Producto Digital",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Producto Digital): 0.5 h por SKU. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "SKU",
    "weeks": 1,
    "deliverables": [
      {
        "name": "Producto (SKU) adicional en Shopify",
        "activities": [
          {
            "title": "Desarrollo · producto (SKU) adicional en Shopify",
            "role": "Front-End Dev",
            "hours": 0.3,
            "unit": "SKU"
          },
          {
            "title": "Contenido · producto (SKU) adicional en Shopify",
            "role": "Digital Content Specialist",
            "hours": 0.2,
            "unit": "SKU"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-coleccion-adicional-en-shopify",
    "name": "Colección adicional en Shopify",
    "area": "Producto Digital",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Producto Digital): 0.75 h por colección. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "colección",
    "weeks": 1,
    "deliverables": [
      {
        "name": "Colección adicional en Shopify",
        "activities": [
          {
            "title": "Colección adicional en Shopify",
            "role": "Front-End Dev",
            "hours": 0.75,
            "unit": "colección"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-sku-adicional-en-mercado-libre",
    "name": "SKU adicional en Mercado Libre",
    "area": "Producto Digital",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Producto Digital): 0.4 h por SKU. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "SKU",
    "weeks": 1,
    "deliverables": [
      {
        "name": "SKU adicional en Mercado Libre",
        "activities": [
          {
            "title": "SKU adicional en Mercado Libre",
            "role": "Digital Designer",
            "hours": 0.4,
            "unit": "SKU"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-flujo-secundario-adicional-en-chatbot",
    "name": "Flujo secundario adicional en chatbot",
    "area": "Producto Digital",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Producto Digital): 4.5 h por flujo. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "flujo",
    "weeks": 1,
    "deliverables": [
      {
        "name": "Flujo secundario adicional en chatbot",
        "activities": [
          {
            "title": "Revisión · flujo secundario adicional en chatbot",
            "role": "Product Lead",
            "hours": 1.0,
            "unit": "flujo"
          },
          {
            "title": "Contenido · flujo secundario adicional en chatbot",
            "role": "Digital Content Specialist",
            "hours": 1.0,
            "unit": "flujo"
          },
          {
            "title": "Desarrollo · flujo secundario adicional en chatbot",
            "role": "Front-End Dev",
            "hours": 2.0,
            "unit": "flujo"
          },
          {
            "title": "Pruebas · flujo secundario adicional en chatbot",
            "role": "Product Lead",
            "hours": 0.5,
            "unit": "flujo"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-pdp-optimizada-digital-shelf",
    "name": "PDP optimizada (Digital Shelf)",
    "area": "Producto Digital",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Producto Digital): 4.5 h por PDP. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "PDP",
    "weeks": 1,
    "deliverables": [
      {
        "name": "PDP optimizada (Digital Shelf)",
        "activities": [
          {
            "title": "Revisión · PDP optimizada (Digital Shelf)",
            "role": "Product Lead",
            "hours": 1.0,
            "unit": "PDP"
          },
          {
            "title": "Contenido · PDP optimizada (Digital Shelf)",
            "role": "Digital Content Specialist",
            "hours": 1.0,
            "unit": "PDP"
          },
          {
            "title": "Diseño gráfico · PDP optimizada (Digital Shelf)",
            "role": "Creative Designer",
            "hours": 2.5,
            "unit": "PDP"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-hora-de-ajuste-o-soporte-web",
    "name": "Hora de ajuste o soporte web",
    "area": "Producto Digital",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Producto Digital): 1 h por hora. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "hora",
    "weeks": 1,
    "deliverables": [
      {
        "name": "Hora de ajuste o soporte web",
        "activities": [
          {
            "title": "Hora de ajuste o soporte web",
            "role": "Front-End Dev",
            "hours": 1.0,
            "unit": "hora"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-diseno-de-1-pieza-extras-e-impresos",
    "name": "Diseño de 1 pieza (extras e impresos)",
    "area": "Creativo",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Creativo): 2 h por pieza. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "pieza",
    "weeks": 1,
    "deliverables": [
      {
        "name": "Diseño de 1 pieza (extras e impresos)",
        "activities": [
          {
            "title": "Diseño de pieza (extras e impresos)",
            "role": "Creative Designer",
            "hours": 2.0,
            "unit": "pieza"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-diseno-de-1-post-estatico",
    "name": "Diseño de 1 post (estático)",
    "area": "Creativo",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Creativo): 2.9 h por post. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "post",
    "weeks": 1,
    "deliverables": [
      {
        "name": "Diseño de 1 post (estático)",
        "activities": [
          {
            "title": "Diseño gráfico · post (estático)",
            "role": "Creative Designer",
            "hours": 2.4,
            "unit": "post"
          },
          {
            "title": "Revisión creativa · post (estático)",
            "role": "Creative Strategy Lead",
            "hours": 0.5,
            "unit": "post"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-diseno-de-1-post-animado",
    "name": "Diseño de 1 post (animado)",
    "area": "Creativo",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Creativo): 3.5 h por post. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "post",
    "weeks": 1,
    "deliverables": [
      {
        "name": "Diseño de 1 post (animado)",
        "activities": [
          {
            "title": "Diseño gráfico · post (animado)",
            "role": "Creative Designer",
            "hours": 3.0,
            "unit": "post"
          },
          {
            "title": "Revisión creativa · post (animado)",
            "role": "Creative Strategy Lead",
            "hours": 0.5,
            "unit": "post"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-ugc-de-1-post",
    "name": "UGC de 1 post",
    "area": "Creativo",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Creativo): 12 h por post. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "post",
    "weeks": 1,
    "deliverables": [
      {
        "name": "UGC de 1 post",
        "activities": [
          {
            "title": "UGC de post",
            "role": "Creative Designer",
            "hours": 12.0,
            "unit": "post"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-1-articulo-de-blog-seo",
    "name": "1 artículo de blog / SEO",
    "area": "Growth",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Growth): 1.9 h por artículo. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "artículo",
    "weeks": 1,
    "deliverables": [
      {
        "name": "1 artículo de blog / SEO",
        "activities": [
          {
            "title": "Brief y estructura del contenido",
            "role": "Digital Content Specialist",
            "hours": 0.25,
            "unit": "artículo"
          },
          {
            "title": "Redacción del borrador",
            "role": "Digital Content Specialist",
            "hours": 0.75,
            "unit": "artículo"
          },
          {
            "title": "Optimización SEO on-page",
            "role": "Digital Content Specialist",
            "hours": 0.3,
            "unit": "artículo"
          },
          {
            "title": "Revisión y edición",
            "role": "Digital Content Specialist",
            "hours": 0.25,
            "unit": "artículo"
          },
          {
            "title": "Recursos visuales",
            "role": "Creative Designer",
            "hours": 0.25,
            "unit": "artículo"
          },
          {
            "title": "Revisión final y publicación",
            "role": "Digital Content Specialist",
            "hours": 0.1,
            "unit": "artículo"
          }
        ]
      }
    ]
  },
  {
    "id": "tmpl-suelto-1-campana-de-email",
    "name": "1 campaña de email",
    "area": "Growth",
    "category": "tiempos_sueltos",
    "description": "Tiempo suelto (Growth): 3.2 h por campaña. Se agrega al alcance y se ajusta la cantidad.",
    "serviceType": null,
    "unitLabel": "campaña",
    "weeks": 1,
    "deliverables": [
      {
        "name": "1 campaña de email",
        "activities": [
          {
            "title": "Segmentación de la campaña",
            "role": "Digital Content Specialist",
            "hours": 0.25,
            "unit": "campaña"
          },
          {
            "title": "Asunto y preheader",
            "role": "Digital Content Specialist",
            "hours": 0.25,
            "unit": "campaña"
          },
          {
            "title": "Redacción del contenido y CTA",
            "role": "Digital Content Specialist",
            "hours": 0.5,
            "unit": "campaña"
          },
          {
            "title": "Diseño del email",
            "role": "Creative Designer",
            "hours": 1.0,
            "unit": "campaña"
          },
          {
            "title": "Montaje en la plataforma",
            "role": "Digital Content Specialist",
            "hours": 0.5,
            "unit": "campaña"
          },
          {
            "title": "QA y prueba A/B",
            "role": "Digital Content Specialist",
            "hours": 0.5,
            "unit": "campaña"
          },
          {
            "title": "Programación y envío",
            "role": "Digital Content Specialist",
            "hours": 0.2,
            "unit": "campaña"
          }
        ]
      }
    ]
  }
];
