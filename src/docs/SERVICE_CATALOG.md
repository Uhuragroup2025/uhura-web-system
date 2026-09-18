# Catálogo Oficial de Servicios y Plantillas de Producto — UHURA GROUP 2026

> **Fuente Canónica:** *FORMATO DE PROCESO DE ÁREA UHURA (2026) — PRODUCTO DIGITAL*  
> **Área Gobernadora:** Producto Digital & Operaciones  
> **Fecha de Actualización:** Septiembre 2026  
> **Versión:** 2026.1 (Freeze Funcional)  
> **Implementación en Código:**
> - Definiciones y Datos Maestros: [`src/components/taskflow/templates/templateData.ts`](../components/taskflow/templates/templateData.ts)
> - Motor de Clonación y Cálculo: [`src/components/taskflow/templates/templateEngine.ts`](../components/taskflow/templates/templateEngine.ts)
> - Tipos y Roles Canónicos: [`src/components/taskflow/types.ts`](../components/taskflow/types.ts)
> - Motor Financiero: [`src/components/taskflow/financial/financialEngine.ts`](../components/taskflow/financial/financialEngine.ts)
> - Interfaz de Biblioteca: [`src/components/taskflow/templates/TemplateLibraryView.tsx`](../components/taskflow/templates/TemplateLibraryView.tsx)
> - Modal de Clonación a Cotización: [`src/components/taskflow/templates/CloneToQuoteModal.tsx`](../components/taskflow/templates/CloneToQuoteModal.tsx)

---

## 1. Introducción y Gobernanza

El **Catálogo de Servicios** constituye la biblioteca oficial de especificaciones técnicas para los servicios comercializados y ejecutados por Uhura Group. Su propósito es garantizar:

1. **Estimaciones Técnicas Rigurosas:** Todo dimensionamiento parte de actividades atómicas previamente costeadas con horas y roles estándar.
2. **Desacoplamiento de Plantillas Maestras:** Al clonar una plantilla para una oportunidad en New Business, se genera una copia independiente (*snapshot*). Los cambios en la oportunidad nunca alteran la plantilla maestra, y las actualizaciones futuras de la plantilla no modifican cotizaciones históricas.
3. **Normalización Estricta de Roles:** Queda prohibido el uso de nombres informales, cargos ad-hoc o nombres de personas en la definición de actividades. Toda asignación presupuestada debe corresponder a uno de los 12 roles del catálogo oficial de Uhura.

---

## 2. Catálogo Oficial de Roles (12 Roles Canónicos)

| Rol Canónico | Identificador / Alias Normalizados | Departamento | Responsabilidad Principal en Servicios |
|---|---|---|---|
| **Client Relationship Strategist** | `Client relationship`, `Account Manager`, `Ejecutivo de Cuenta` | Cuentas / Comercial | Gestión de cliente, insumo de accesos, checkpoints, QA visual/cliente, gates de aprobación y soporte. |
| **Front-End Dev** | `Desarrollador Web Front-End`, `Front End`, `Web Developer` | Producto Digital | Maquetación web (WordPress/Shopify/Webflow), integraciones técnicas, APIs, analítica (GTM/GA4) y hosting. |
| **Product Lead** | `Product lead`, `Líder de Producto`, `PM Técnico` | Producto Digital | Arquitectura UX/UI, wireframing en Figma, visión técnica de producto, control de calidad y entregas. |
| **Digital Content Specialist** | `Digital content`, `Specialist Content Digital`, `Redactor` | Creativo / Contenido | Redacción de copys persuasivos, estructura H1/H2, keywords research, SEO on-page y metadatos. |
| **Digital Designer** | `Web designer`, `Diseñador Web`, `UI Designer` | Creativo / Diseño | Customización de templates UI, diseño de interfaces desktop/mobile, sistemas de diseño y layouts. |
| **Creative Designer** | `Creative designer`, `Diseñador Gráfico`, `Visual Designer` | Creativo / Arte | Banners publicitarios, recursos gráficos de campaña, optimización visual de producto (PDP) y branding. |
| **Creative Strategy Lead** | `Creative lead`, `Director Creativo`, `Head of Creative` | Creativo | Dirección conceptual, estrategia de comunicación y narrativa visual de propuestas. |
| **Trafficker Media** | `Tracfiker`, `Trafficker`, `Tracfiker y DigiOps` | Growth & Media | Estrategia de medios pagados, configuración de píxeles, eventos de conversión y optimización de pauta. |
| **Community Manager** | `Community Manager`, `CM` | Contenido & Social | Gestión de comunidades, moderación y soporte conversacional en redes. |
| **Content Creator** | `Content Creator`, `Creador de Contenido` | Creativo / Contenido | Producción multimedia, fotografía, video corto y assets de contenido orgánico. |
| **Directora Comercial** | `Directora Comercial`, `Head of Sales` | Comercial | Supervisión de márgenes, estrategia de negociación y pricing comercial. |
| **Growth Manager** | `Growth Manager`, `Lead Growth` | Growth & Media | Estrategia de crecimiento digital, embudos de conversión y experimentación. |

---

## 3. Matriz Resumen de Servicios Oficiales

| ID Servicio | Nombre Oficial del Servicio | Categoría | Horas Base | Duración Est. | Roles Principales |
|---|---|---|---|---|---|
| `tmpl-landing-page` | **Landing Page en WordPress / Webflow** | `landing_page` | 31.0 hrs | 3 semanas | Front-End Dev (18h), Product Lead (9h), Digital Content Specialist (4h) |
| `tmpl-sitio-web-informativo-wp` | **Sitio Web Informativo WordPress** | `wordpress` | 140.0 hrs | 8 semanas | Front-End Dev (90h), Product Lead (18h), Client Relationship Strategist (14h), Creative Designer (12h), Digital Content Specialist (6h) |
| `tmpl-mantenimiento-web-wp` | **Mantenimiento Web WordPress** | `mantenimiento_web` | 9.0 hrs/mes | 4 semanas (recurrente) | Front-End Dev (8h), Client Relationship Strategist (1h) |
| `tmpl-tienda-online-shopify` | **Tienda Online Shopify (hasta 20 SKUs)** | `shopify` | 116.0 hrs | 8 semanas | Front-End Dev (51h), Digital Designer (20h), Product Lead (15h), Digital Content Specialist (12h), Client Relationship Strategist (10h), Creative Designer (8h) |
| `tmpl-chatbot-manychat` | **Chatbot con ManyChat** | `chatbot_manychat` | 46.5 hrs | 4 semanas | Front-End Dev (24.5h), Product Lead (11h), Client Relationship Strategist (8h), Digital Content Specialist (3h) |
| `tmpl-mercado-libre` | **Mercado Libre Marketplace Store** | `mercado_libre` | 42.0 hrs | 4 semanas | Product Lead (17h), Digital Designer (10h), Digital Content Specialist (9h), Creative Designer (4h), Client Relationship Strategist (2h) |
| `tmpl-digital-shelf` | **Digital Shelf (Optimización PDPs)** | `digital_shelf` | 5.5 hrs | 2 semanas | Creative Designer (2.5h), Product Lead (1.5h), Digital Content Specialist (1.0h), Client Relationship Strategist (0.5h) |
| `tmpl-custom-project` | **Proyecto a la Medida (Scoping Abierto)** | `custom` | 12.0 hrs (base) | 6 semanas | Product Lead (8h), Front-End Dev (4h) *(personalizable)* |

---

## 4. Especificación Detallada por Servicio

---

### 4.1 Landing Page en WordPress / Webflow
- **ID:** `tmpl-landing-page`
- **Categoría:** `landing_page`
- **Objetivo:** Construcción de una página de aterrizaje de alta conversión para campañas digitales y captación de leads cualificados con medición de eventos analíticos.
- **Duración Estimada:** 3 semanas.
- **Horas Base Totales:** 31.0 horas.
- **Dependencias Clave:** Entrega de accesos por parte del cliente (hosting/dominio/WordPress), manual de marca e insumos gráficos. Licencia de Elementor Pro o Bricks Builder.
- **Desglose de Entregables y Actividades:**

| Entregable | Actividad | Rol Responsable | Horas | Notas / Criterio de Aceptación |
|---|---|---|---|---|
| **1. Onboarding & Insumos** | Kickoff & Alineación | Product Lead | 1.0 h | Alineación de propuesta de valor y objetivos de campaña. |
| | Accesos WordPress, hosting, dominio e insumos | Product Lead | 1.0 h | Recolección de accesos, códigos GTM/Analytics/Clarity, imágenes y casos de éxito. Solicitar compra de Elementor Pro. |
| **2. UX & Contenido** | Diseño landing (hasta 6 bloques) con Figma Make | Product Lead | 2.0 h | Wireframing y composición visual hasta 6 bloques. QA interno: Ana María Giraldo. |
| | Ajustes visuales sobre base | Product Lead | 2.0 h | Ronda de afinación visual sobre feedback interno. QA interno: Ana María Giraldo. |
| | Redacción de copy | Digital Content Specialist | 4.0 h | Textos persuasivos, titulares y microcopy de formularios. QA interno: Ana María Giraldo. |
| **3. Implementación & Analítica** | Maquetación WordPress (Bricks/Elementor) Desktop / Mobile | Front-End Dev | 12.0 h | Maquetación responsive en mobile y desktop con fidelity al diseño. QA interno: Ana María Giraldo. |
| | Configuración de formulario | Front-End Dev | 1.0 h | Setup de campos, validaciones y redirección/mensaje de éxito. |
| | GA4 + GTM básico | Front-End Dev | 2.0 h | Inyección de contenedor GTM, etiquetas base y evento de conversión en botón/formulario. |
| | SEO on-page | Front-End Dev | 1.0 h | Configuración de etiquetas H1-H3, metatítulo, meta descripción y Open Graph. |
| | QA visual + funcional | Product Lead | 2.0 h | Pruebas de compatibilidad cross-browser y validación de envíos. |
| **4. Entrega & Soporte** | 1 ronda post-entrega - Cliente | Front-End Dev | 2.0 h | Ajustes de detalle tras revisión del cliente. |
| | Entrega y handoff | Product Lead | 2.0 h | Entrega formal de credenciales y cierre del servicio. |

---

### 4.2 Sitio Web Informativo WordPress
- **ID:** `tmpl-sitio-web-informativo-wp`
- **Categoría:** `wordpress`
- **Objetivo:** Desarrollo de un sitio web corporativo/institucional completo con gestor de contenidos WordPress, hasta 8 secciones, Custom Post Types (ACF), optimización SEO técnica y analítica de conversión.
- **Duración Estimada:** 8 semanas.
- **Horas Base Totales:** 140.0 horas.
- **Dependencias Clave:** Hosting con PHP 8.x, acceso cPanel/DNS, insumos de contenido de cada sección, Gate 1 aprobado antes de maquetación, Gate 2 aprobado antes de Go-Live.
- **Desglose de Entregables y Actividades:**

| Entregable | Actividad | Rol Responsable | Horas | Notas / Criterio de Aceptación |
|---|---|---|---|---|
| **1. Kick-off & Discovery** | Kickoff con cliente | Client Relationship Strategist | 1.0 h | Reunión de presentación, objetivos comerciales y expectativas de entrega. |
| | Socializar: Modelo de negocio, Backlog y COR | Product Lead | 2.0 h | Análisis de modelo (B2B/B2C), número de páginas, integraciones actuales y alcance en COR. |
| | Insumo de accesos | Client Relationship Strategist | 1.0 h | Levantamiento de credenciales de servidor, dominio y servicios de terceros. |
| | Checkpoints con cliente (semanales) | Client Relationship Strategist | 6.0 h | Acompañamiento periódico durante las 8 semanas de ejecución. |
| **2. UX, Contenido & Gate 1** | Arquitectura UX con Figma Make | Product Lead | 2.0 h | Mapa de navegación, árbol de contenidos y jerarquía de páginas. |
| | Diseño UX/UI funcional con Figma Make | Product Lead | 6.0 h | Diseño visual de interfaz responsive en Figma. |
| | Contenido con estructura H1/H2 por página | Digital Content Specialist | 4.0 h | Copywriting estructurado por página (hasta 8 páginas). |
| | Diseño de banners y elementos gráficos (hasta 7) | Creative Designer | 12.0 h | Piezas gráficas, banners hero y assets visuales optimizados. |
| | QA visual + funcional interno | Client Relationship Strategist | 2.0 h | Revisión interna de consistencia de marca y requerimientos del brief. |
| | Ajustes UX/UI | Product Lead | 8.0 h | Ronda de afinación según observaciones de equipo. |
| | GATE 1: Aprobación Diseño (5 días) + Congelamiento UAT | Client Relationship Strategist | 1.0 h | Aprobación formal del cliente. Congela el alcance visual antes de programar. |
| **3. Implementación Frontend & Gate 2** | Setup técnico (WP + plugins base + CDN + hosting) | Front-End Dev | 2.0 h | Instalación de PHP, child theme, Elementor Pro, Yoast SEO, Caché y SMTP. |
| | Maquetación WordPress (8 secciones) Desktop & Mobile | Front-End Dev | 32.0 h | Programación frontend de 8 plantillas/secciones completas. |
| | Setup ACF (2 CPT / 6 campos máx.) | Front-End Dev | 4.0 h | Creación de Custom Post Types y campos personalizados para autogestión. |
| | Implementación formularios (hasta 3) | Front-End Dev | 2.0 h | Configuración de formularios con validaciones y destino de correo. |
| | Configurar envío de mails marketing (hasta 3) | Front-End Dev | 1.0 h | Conexión SMTP transaccional / marketing básico. |
| | Linkear botones e interacciones | Front-End Dev | 4.0 h | Enlaces internos, anclas de scroll, microinteracciones y estados hover. |
| | SEO on-page técnico | Front-End Dev | 2.0 h | Títulos, meta descripciones, etiquetas Open Graph y encabezados H1-H3. |
| | Performance base (carga, imágenes WebP, caché) | Front-End Dev | 2.0 h | Optimización en PageSpeed Insights, compresión y minificación. |
| | QA técnico de código y plugins | Front-End Dev | 2.0 h | Pruebas de consola, compatibilidad PHP y tiempos de respuesta. |
| | QA visual y funcional | Client Relationship Strategist | 2.0 h | Comprobación de navegación, legibilidad y fluidez. |
| | Ajustes post-QA | Front-End Dev | 4.0 h | Resolución de incidencias encontradas en QA interno. |
| | Ajustes internos cliente (Ronda 1) | Front-End Dev | 6.0 h | Incorporación de observaciones del cliente en staging. |
| | GATE 2: Aprobación staging (3 días) + Congelamiento UAT | Client Relationship Strategist | 1.0 h | Acta de aprobación del cliente para autorizar el paso a producción. |
| | Ajustes finales post-staging | Front-End Dev | 6.0 h | Ronda de afinación final antes de lanzamiento. |
| **4. Analítica & Go Live** | Instalar códigos de seguimiento (GTM, GA4, Clarity) | Front-End Dev | 1.0 h | Inyección de contenedores y verificación de eventos en vivo. |
| | Configuración de eventos de conversión en formulario | Front-End Dev | 4.0 h | Tagging en GTM para leads y conversiones clave. |
| | Go Live / Apuntamiento de dominio y DNS | Front-End Dev | 2.0 h | Migración de staging a producción, SSL, redirecciones 301. |
| | Revisión de calidad y ajustes post-lanzamiento | Front-End Dev | 4.0 h | Verificación en caliente en el servidor definitivo. |
| **5. SEO Técnico** | Verificación en Google Search Console | Digital Content Specialist | 1.0 h | Verificación de propiedad, envío de sitemap XML y revisión de cobertura. |
| | Implementar robots.txt, sitemaps y Schema Markup | Digital Content Specialist | 1.0 h | Configuración de directivas de indexación y marcado de datos estructurados. |
| **6. Entrega & Soporte** | Creación de usuarios y roles para cliente | Front-End Dev | 1.0 h | Usuarios editor/administrador con contraseñas seguras. |
| | Capacitación de administración de contenidos | Front-End Dev | 1.0 h | Sesión guiada de 1 hora para el equipo del cliente. |
| | Documentación de entrega + checklist | Front-End Dev | 2.0 h | Manual básico de uso y entrega de accesos maestros. |
| | Soporte técnico post-lanzamiento (garantía) | Front-End Dev | 8.0 h | Cobertura de garantía técnica de 30 días calendario. |

---

### 4.3 Mantenimiento Web WordPress
- **ID:** `tmpl-mantenimiento-web-wp`
- **Categoría:** `mantenimiento_web`
- **Objetivo:** Soporte técnico preventivo mensual, monitoreo de seguridad, backups regulares, actualización controlada de núcleo y plugins, y corrección de incidencias menores.
- **Duración Estimada:** 4 semanas (servicio recurrente mensual).
- **Horas Base Totales:** 9.0 horas / mes.
- **Dependencias Clave:** Accesos vigentes a hosting y panel de administración de WordPress.
- **Desglose de Entregables y Actividades:**

| Entregable | Actividad | Rol Responsable | Horas | Notas / Criterio de Aceptación |
|---|---|---|---|---|
| **1. Análisis & Backup** | Accesos a plataforma | Front-End Dev | 0.5 h | Verificación de credenciales y conectividad al servidor. |
| | Diagnóstico de plataforma y PageSpeed | Front-End Dev | 1.0 h | Medición de métricas de carga, logs de errores y tráfico. |
| | Backup y verificación de restauración | Front-End Dev | 0.5 h | Copia de seguridad completa (DB + archivos) previa a cambios. QA interno: Ana María Giraldo. |
| **2. Actualizaciones & Seguridad** | Actualización WordPress core + tema | Front-End Dev | 1.0 h | Actualización en entorno controlado con verificación de compatibilidad. |
| | Actualización de plugins | Front-End Dev | 0.5 h | Actualización escalonada y prueba de funcionalidades activas. |
| | Revisión de seguridad básica (scan de malware / firewall) | Front-End Dev | 0.5 h | Monitoreo de intentos de acceso sospechosos y reglas de seguridad. |
| | Corrección de errores menores (CSS roto, plugin bug) | Front-End Dev | 1.5 h | Reparación de problemas que no alteren la arquitectura base. |
| | Ajustes de contenido menores | Front-End Dev | 0.5 h | Actualización puntual de textos o banners facilitados por el cliente. |
| | Status de mantenimiento, informe y prevenciones | Front-End Dev | 0.5 h | Reporte ejecutivo mensual de salud del sitio. |
| | Backup final post-mantenimiento | Front-End Dev | 0.5 h | Nueva instantánea con los cambios consolidados. |
| **3. Soporte & Gestión** | Soporte técnico al cliente | Front-End Dev | 1.0 h | Atención de dudas técnicas e incidencias reportadas. |
| | Gestión de cliente y coordinación mensual | Client Relationship Strategist | 1.0 h | Envío de reporte y seguimiento de requerimientos con el cliente. |

---

### 4.4 Tienda Online Shopify (hasta 20 SKUs)
- **ID:** `tmpl-tienda-online-shopify`
- **Categoría:** `shopify`
- **Objetivo:** Creación e implementación de tienda de comercio electrónico en Shopify para catálogos de hasta 20 productos, con pasarela de pagos, configuración fiscal y logística, diseño UI de plantillas y analítica GA4 de e-commerce.
- **Duración Estimada:** 8 semanas.
- **Horas Base Totales:** 116.0 horas.
- **Dependencias Clave:** Plan activo de Shopify del cliente, contratación de pasarela (Wompi/PayU/MercadoPago), insumos de producto (precios, descripciones, fotos con fondo neutro).
- **Desglose de Entregables y Actividades:**

| Entregable | Actividad | Rol Responsable | Horas | Notas / Criterio de Aceptación |
|---|---|---|---|---|
| **1. Kick-off & Arquitectura** | Reunión kickoff + objetivos e-commerce | Client Relationship Strategist | 2.0 h | Definición de mercado objetivo, modelo de inventario y políticas. |
| | Backlog en COR + visión técnica de producto | Product Lead | 2.0 h | Alcance funcional y dimensionamiento en herramienta interna. |
| | Solicitud de accesos e insumos al cliente | Client Relationship Strategist | 1.0 h | Recolección de catálogo de productos e información bancaria/fiscal. |
| | Checkpoints con cliente | Client Relationship Strategist | 6.0 h | Reuniones de avance bisemanales durante las 8 semanas. |
| | Definición de estructura de catálogo (tipos, colecciones) | Product Lead | 2.0 h | Taxonomía de categorías y variantes. QA interno: Ana María Giraldo. |
| | Definición de plantilla base (2 opciones) | Product Lead | 2.0 h | Selección técnica de temas optimizados de Shopify. |
| | GATE 1: Aprobación de arquitectura y tema | Client Relationship Strategist | 1.0 h | Freeze de arquitectura previo al trabajo visual y de carga. |
| **2. Contenido Base & Banners** | Keyword research e intenciones de búsqueda de compra | Digital Content Specialist | 2.0 h | Palabras clave para títulos de colección y fichas de producto. |
| | Redacción Home, Nosotros, Contacto y legales base | Digital Content Specialist | 4.0 h | Copywriting para páginas institucionales y políticas estándar. |
| | Metadescripciones Home + hasta 3 colecciones | Digital Content Specialist | 1.0 h | Metatítulos y descripciones SEO para búsqueda orgánica. |
| | Banners (2 Hero, 2 secundarios, placeholder de producto) | Creative Designer | 8.0 h | Composición de banners publicitarios y diseño gráfico de la tienda. |
| **3. Setup Técnico Shopify** | Sesión de compra de licencia y pasarela de pagos | Product Lead | 1.0 h | Acompañamiento en la activación del plan de Shopify y merchant account. |
| | Configuración general (moneda, mercados, idioma) | Front-End Dev | 2.0 h | Configuración regional de la tienda. |
| | Configuración de navegación (header + footer) | Front-End Dev | 2.0 h | Menús principales, filtros y enlaces de pie de página. |
| | Configuración del checkout de Shopify | Front-End Dev | 2.0 h | Ajuste de campos obligatorios, propinas y opciones de pago. |
| | Configuración de envíos (tarifas fijas / transportadora) | Front-End Dev | 3.0 h | Reglas de despacho por departamento o cobertura. |
| | Configuración de impuestos (IVA 19% Colombia) | Front-End Dev | 1.0 h | Parámetros tributarios para productos gravados. |
| | Carga de políticas legales (T&C, devoluciones, privacidad) | Front-End Dev | 2.0 h | Adaptación legal estándar en el footer. |
| | QA visual y funcional de setup | Product Lead | 2.0 h | Validación interna de configuración técnica. |
| **4. Template & UI** | Instalación y configuración de tema | Digital Designer | 2.0 h | Instalación de child theme y configuración inicial. |
| | Customización visual global (fuentes, paleta, botones) | Digital Designer | 4.0 h | Aplicación de tokens visuales y guía de estilos de marca. |
| | Maquetación Home (banners + grilla de secciones) | Digital Designer | 4.0 h | Composición de bloques modulares de portada. |
| | Configuración y diseño de ficha PDP de producto | Digital Designer | 4.0 h | Layout de imagen, selector de variantes, badges y tabs de detalle. |
| | Diseño y optimización de Carrito (Drawer / Página) | Digital Designer | 2.0 h | Microcopys y llamados de urgencia/envío gratis. |
| | Maquetación páginas internas (Nosotros, Contacto) | Digital Designer | 4.0 h | Montaje de contenido institucional. |
| **5. Catálogo (hasta 20 SKUs)** | CSV títulos optimizados y plantillas de descripción | Digital Content Specialist | 4.0 h | Formato tabular para importación masiva. |
| | Creación de colecciones (hasta 3) | Front-End Dev | 2.0 h | Filtros automáticos por tags de producto. |
| | Subcolecciones y organización de catálogo | Front-End Dev | 3.0 h | Jerarquía interna de navegación comercial. |
| | Configuración de tipos de producto y atributos | Front-End Dev | 2.0 h | Tallas, colores, materiales o pesos. |
| | Carga de productos (hasta 20 SKUs con imágenes) | Front-End Dev | 6.0 h | Subida de fotos, variantes, SKUs e inventario inicial. |
| | QA visual y funcional de catálogo | Product Lead | 2.0 h | Revisión de coherencia de fotos y precios. |
| **6. SEO & QA Técnico** | Implementar robots.txt, sitemaps y URLs canónicas | Front-End Dev | 1.0 h | Verificación de indexación técnica en Shopify. |
| | Verificación en Google Search Console | Digital Content Specialist | 1.0 h | Envío del sitemap de productos. |
| | QA técnico de checkout y métodos de pago | Front-End Dev | 0.5 h | Prueba de pasarela en modo sandbox / test mode. |
| | Validación responsive en múltiples dispositivos | Front-End Dev | 1.0 h | Comprobación en iPhone, Android, tablet y laptop. |
| | Validación de flujo completo de compra | Front-End Dev | 1.0 h | Desde catálogo hasta confirmación de pedido por correo. |
| | QA funcional con compra simulada de usuario real | Front-End Dev | 0.5 h | Verificación del ciclo de inventario. |
| | GATE 2: Aprobación de staging por cliente | Client Relationship Strategist | 0.5 h | Visto bueno formal del cliente para salida en vivo. |
| **7. Lanzamiento & Analítica** | Go Live / Apuntamiento de dominio principal | Front-End Dev | 1.0 h | Cambio de DNS a los servidores de Shopify y certificado SSL. |
| | QA en vivo post-lanzamiento | Front-End Dev | 4.0 h | Verificación en producción con pasarela activa. |
| | Códigos de seguimiento (GTM, GA4, Clarity) | Front-End Dev | 1.0 h | Inyección en theme.liquid y checkout script. |
| | Configuración de eventos de e-commerce en GA4/GTM | Front-End Dev | 4.0 h | View item, add to cart, begin checkout y purchase. |
| | Pruebas de eventos analíticos en modo debug | Front-End Dev | 2.0 h | Validación en GA4 DebugView. |
| **8. Entrega & Soporte** | Capacitación al cliente en panel de Shopify | Product Lead | 1.0 h | Gestión de pedidos, clientes y actualización de inventario. |
| | Documentación de entrega + checklist | Product Lead | 2.0 h | Manual operativo de la tienda. |
| | Reunión formal de cierre de proyecto | Product Lead | 1.0 h | Cierre comercial y entrega de activos. |
| | Soporte técnico post-lanzamiento | Front-End Dev | 8.0 h | Bolsa de garantía de 30 días para ajustes técnicos. |

---

### 4.5 Chatbot con ManyChat
- **ID:** `tmpl-chatbot-manychat`
- **Categoría:** `chatbot_manychat`
- **Objetivo:** Automatización de flujos conversacionales mediante ManyChat para atención de leads, preguntas frecuentes, calificación comercial y transferencia a agentes humanos en WhatsApp (API Cloud / BSP), Instagram o Facebook.
- **Duración Estimada:** 4 semanas.
- **Horas Base Totales:** 46.5 horas.
- **Dependencias Clave:** Cuenta comercial de Meta verificada (si aplica WhatsApp Cloud API), suscripción activa de ManyChat Pro, línea de teléfono limpia (sin WhatsApp personal activo).
- **Desglose de Entregables y Actividades:**

| Entregable | Actividad | Rol Responsable | Horas | Notas / Criterio de Aceptación |
|---|---|---|---|---|
| **1. Kick-off & Flujos** | Kickoff con cliente | Product Lead | 1.0 h | Definición de objetivos conversacionales y canales. QA interno: Ana María Giraldo. |
| | Backlog y estructuración en COR | Product Lead | 1.0 h | Detalle de flujos y requerimientos de integración. |
| | Insumo de accesos (Meta, ManyChat y FAQs) | Client Relationship Strategist | 1.0 h | Recopilación de preguntas frecuentes y credenciales. QA interno: Ana María Giraldo. |
| | Checkpoints de seguimiento con cliente | Client Relationship Strategist | 4.0 h | Acompañamiento en pruebas intermedias. |
| | Definición de árbol conversacional | Product Lead | 2.0 h | Diagrama de bloques de decisión y caminos lógicos. |
| | Redacción de mensajes del bot y tono de voz | Digital Content Specialist | 2.0 h | Textos cálidos, concisos y claros con botones de respuesta. |
| **2. Gestión Meta & WhatsApp API** | Revisión de Business Manager de Meta | Product Lead | 1.0 h | Diagnóstico del estado de verificación de la empresa en Meta. |
| | Verificación de empresa ante Meta | Client Relationship Strategist | 1.0 h | Subida de documentos legales (cámara de comercio/factura). |
| | Alta de número de teléfono con proveedor BSP | Front-End Dev | 2.0 h | Desvinculación de app móvil y activación de línea oficial. |
| | Vincular canal a ManyChat | Front-End Dev | 1.0 h | Conexión OAuth con la cuenta de ManyChat. |
| | Redacción y aprobación de plantillas de Meta (HSM) | Product Lead | 1.5 h | Envío a aprobación de mensajes de inicio de conversación. |
| | Pruebas de envío y recepción de plantillas | Front-End Dev | 1.0 h | Verificación de respuesta en dispositivo real. |
| | Documentación técnica de credenciales | Product Lead | 0.5 h | Resumen de IDs de Meta y tokens de acceso. |
| **3. Configuración ManyChat** | Conexión de canales secundarios (IG / FB) | Front-End Dev | 2.0 h | Vinculación de mensajería directa en Instagram/Facebook. |
| | Habilitación de WhatsApp Cloud API (si no la tiene) | Front-End Dev | 10.0 h | Configuración técnica completa en Meta for Developers y webhooks. |
| | Configuración de palabras clave y disparadores | Front-End Dev | 1.0 h | Triggers por palabras como "precio", "asesor", "horario". |
| | Construcción del flujo principal de navegación | Front-End Dev | 4.0 h | Montaje de mensajes, botones, galerías y condicionales. |
| | Captura de datos (Nombre, Email, Teléfono, Ciudad) | Front-End Dev | 1.0 h | Almacenamiento en campos personalizados (Custom Fields). |
| | Transferencia a agente humano (Live Chat) | Front-End Dev | 1.0 h | Pausar automatización y notificar a ejecutivos de venta. |
| | Horarios de atención y respuestas fuera de horario | Front-End Dev | 1.0 h | Mensaje de fallback en noches y fines de semana. |
| | Pruebas funcionales de todas las ramas del bot | Product Lead | 2.0 h | Auditoría de callejones sin salida o respuestas rotas. |
| | Salida al aire / activación de flujos | Front-End Dev | 0.5 h | Switch a modo público. |
| **4. Entrega & Soporte** | Capacitación al cliente en uso de ManyChat Live Chat | Digital Content Specialist | 1.0 h | Entrenamiento a ejecutivos comerciales para responder chats. |
| | Documento de entrega y matriz de accesos | Product Lead | 2.0 h | Diagrama del árbol conversacional y accesos. |
| | Soporte y acompañamiento en primeros días | Client Relationship Strategist | 2.0 h | Monitoreo de interacciones reales de usuarios. |

---

### 4.6 Mercado Libre Marketplace Store
- **ID:** `tmpl-mercado-libre`
- **Categoría:** `mercado_libre`
- **Objetivo:** Setup integral de tienda oficial o cuenta profesional en el marketplace de Mercado Libre, optimización de categorización, diseño de piezas gráficas de portada y publicación optimizada de hasta 15 productos clave.
- **Duración Estimada:** 4 semanas.
- **Horas Base Totales:** 42.0 horas.
- **Dependencias Clave:** Cuenta de vendedor creada en Mercado Libre, documentación fiscal (RUT / certificación bancaria), fotos de catálogo con fondo blanco puro.
- **Desglose de Entregables y Actividades:**

| Entregable | Actividad | Rol Responsable | Horas | Notas / Criterio de Aceptación |
|---|---|---|---|---|
| **1. Fase 0 – Kickoff & Alcance** | Kickoff con cliente | Product Lead | 1.0 h | Objetivos comerciales y definición de SKUs estratégicos. |
| | Definición de alcance y visión de producto | Product Lead | 2.0 h | Estrategia de pricing y logística (Mercado Envíos / Flex). |
| | Insumo de accesos de Mercado Libre | Client Relationship Strategist | 2.0 h | Conexión al panel de vendedor y permisos de gestión. |
| | Checkpoints con cliente | Product Lead | 4.0 h | Revisiones semanales de avance de catálogo. |
| | Análisis de categoría, competencia y keywords | Digital Content Specialist | 3.0 h | Investigación de términos de búsqueda más usados por compradores. |
| **2. Setup Tienda ML** | Propuesta de valor de la tienda + legales | Digital Content Specialist | 2.0 h | Biografía, políticas de garantía y diferenciales de marca. |
| | Definición de categorías y subcategorías de producto | Digital Content Specialist | 2.0 h | Árbol de navegación para maximizar relevancia orgánica. |
| | Setup técnico y configuración de tienda oficial | Digital Designer | 4.0 h | Configuración de portada y layout de tienda en ML. |
| | Banners y elementos gráficos de tienda general | Creative Designer | 4.0 h | Banner principal, banners de categorías y destacados de oferta. |
| | Configuración de cuenta y datos comerciales | Product Lead | 1.0 h | Cédula/NIT, razón social, cuenta bancaria y datos fiscales. |
| | Políticas de envío y devoluciones | Product Lead | 1.0 h | Configuración de Mercado Envíos y tiempos de despacho. |
| | Configuración de reputación y tiempos de respuesta | Product Lead | 1.0 h | Calibración de parámetros de calidad operativa. |
| | Validación QA de configuración | Product Lead | 1.0 h | Comprobación de que la cuenta esté lista para vender. |
| **3. Publicación & Validación** | Carga y maquetación de hasta 15 SKUs | Digital Designer | 6.0 h | Subida de imágenes, fichas técnicas, precios y stock. |
| | QA visual y narrativa de publicaciones | Product Lead | 2.0 h | Coherencia de marca y calidad visual en mobile y desktop. |
| | QA SEO de títulos y descripciones | Digital Content Specialist | 2.0 h | Títulos estructurados sin palabras redundantes para el algoritmo. |
| | Validación final de compras de prueba | Product Lead | 2.0 h | Verificación de inventario y generación de etiquetas de envío. |
| | Capacitación al equipo del cliente en panel de ventas | Product Lead | 2.0 h | Gestión de preguntas, pedidos, envíos y métricas. |

---

### 4.7 Digital Shelf (Optimización PDPs de hasta 5 momentos)
- **ID:** `tmpl-digital-shelf`
- **Categoría:** `digital_shelf`
- **Objetivo:** Auditoría, optimización SEO y rediseño visual de fichas de producto (PDP - Product Detail Pages) para marketplaces (Mercado Libre, Amazon, Rappi) o e-commerce propio, cubriendo hasta 5 momentos visuales de alto impacto por producto.
- **Duración Estimada:** 2 semanas.
- **Horas Base Totales:** 5.5 horas.
- **Dependencias Clave:** Acceso a las PDPs actuales, fotografía base de los productos en alta resolución, beneficios principales certificados por la marca.
- **Desglose de Entregables y Actividades:**

| Entregable | Actividad | Rol Responsable | Horas | Notas / Criterio de Aceptación |
|---|---|---|---|---|
| **1. Gestión & Diagnóstico** | Gestión y revisión del proyecto | Client Relationship Strategist | 0.5 h | Coordinación inicial y entrega con el cliente. |
| | Auditoría diagnóstica de PDPs actuales | Product Lead | 0.5 h | Detección de fugas de conversión y debilidades visuales. QA interno: Ana María Giraldo. |
| **2. Optimización de Contenido** | Meta descripción y Metatítulo persuasivo | Digital Content Specialist | 0.5 h | Palabras clave relevantes y bullet points de alta lectura. |
| | Frases destacadas para imágenes de beneficios, Lifestyle y consumo | Digital Content Specialist | 0.5 h | Textos persuasivos para montar sobre las infografías. QA interno: Ana María Giraldo. |
| **3. Optimización de Imágenes** | Optimización de imágenes (hasta 5 por PDP) | Creative Designer | 2.0 h | 5 momentos por PDP: 1. Beneficios destacados; 2. Lifestyle en uso; 3. Momento de consumo; 4. Family shot; 5. Product size / dimensiones. |
| | Control de calidad interno y ajustes | Creative Designer | 0.5 h | Afinado de contrastes y legibilidad en pantallas móviles. |
| | Revisión y aprobación de creatividades con cliente | Product Lead | 0.5 h | Visto bueno del cliente antes de publicar. |
| **4. Entrega** | Informe de entrega con comparativo antes/después | Product Lead | 0.5 h | 5 PDPs optimizadas y listas para publicación en la plataforma. |

---

### 4.8 Proyecto a la Medida (Scoping Abierto)
- **ID:** `tmpl-custom-project`
- **Categoría:** `custom`
- **Objetivo:** Estructura modular y flexible para dimensionar proyectos especiales, desarrollos a la medida, consultorías estratégicas o integraciones de software que no encajan en las plantillas paquetizadas.
- **Duración Estimada:** 6 semanas (base modular).
- **Horas Base Totales:** 12.0 horas base iniciales (ampliables por el líder en New Business).
- **Dependencias Clave:** Brief detallado y sesión de discovery con el cliente.
- **Desglose de Entregables y Actividades Base:**

| Entregable | Actividad | Rol Responsable | Horas | Notas / Criterio de Aceptación |
|---|---|---|---|---|
| **1. Discovery & Definición** | Discovery técnico y levantamiento funcional | Product Lead | 4.0 h | Entrevistas con stakeholders y definición de requerimientos. |
| | Arquitectura de solución y diagrama técnico | Product Lead | 4.0 h | Especificación de stack tecnológico e integraciones. |
| **2. Implementación Inicial** | Setup de entorno y arquitectura base | Front-End Dev | 4.0 h | Repositorio base, variables de entorno y scaffolding. |

---

## 5. Reporte de Normalización y Dudas Encontradas

Siguiendo el principio de **"No inventar — clasificar con rigor"**, se documenta el análisis de hallazgos en la fuente maestra:

| Elemento Encontrado en PDF / Código | Actividad o Contexto | Clasificación Final | Motivo de Decisión / Evidencia |
|---|---|---|---|
| **`Ana María Giraldo`** | Columna "Responsable Calidad" en Landing, Mantenimiento, Shopify, Chatbot y Digital Shelf | **Persona Real (CEO & Founder)** | Aparece en el rol de sign-off/QA ejecutivo. No se asigna como rol operativo de ejecución técnica; la actividad operativa queda en manos del rol técnico correspondiente (Product Lead, Front-End Dev, etc.). |
| **`Desarrollador web front end` / `Front End`** | Maquetación WP, APIs, GTM, Shopify, ManyChat | **Normalizado a: `Front-End Dev`** | Forma parte del catálogo canónico de 12 roles oficiales. |
| **`Client relationship` / `Account`** | Kickoffs, accesos, checkpoints, QA cliente, gates | **Normalizado a: `Client Relationship Strategist`** | Forma parte del catálogo canónico de 12 roles oficiales. |
| **`Web designer`** | Template & UI en Shopify (20h), Setup ML (10h) | **Normalizado a: `Digital Designer`** | Forma parte del catálogo canónico de 12 roles oficiales. En el formato original cubría maquetación visual de temas. |
| **`Specialist Content Digital` / `Digital content`** | Redacción de copys, keywords, SEO | **Normalizado a: `Digital Content Specialist`** | Forma parte del catálogo canónico de 12 roles oficiales. |
| **`Creative designer`** | Banners, assets gráficos, optimización PDP | **Normalizado a: `Creative Designer`** | Forma parte del catálogo canónico de 12 roles oficiales. |
| **`Creative lead`** | Supervisión creativa en proyectos | **Normalizado a: `Creative Strategy Lead`** | Forma parte del catálogo canónico de 12 roles oficiales. |
| **`Tracfiker` / `Tracfiker y DigiOps`** | Tráfico de medios y campañas | **Normalizado a: `Trafficker Media`** | Forma parte del catálogo canónico de 12 roles oficiales. |
| **Suma de horas Client Relationship en Mantenimiento** | Pie de tabla decía "19" en el Excel | **Corregido a 1.0 h (Total: 9.0 h)** | La suma aritmética de las actividades reales de la tabla es 8.0 h (Front-End) + 1.0 h (Client Relationship) = 9.0 h. El "19" era un typo de tipeo en la celda resumen del documento original. |

---

## 6. Enlace a la Especificación Maestra

Para conocer el modelo de datos, la integración con New Business, la Calculadora Comercial y los lineamientos de persistencia para Indunova:
- Consulte la especificación completa en [`ORBIT_PRODUCT_STATUS.md`](./ORBIT_PRODUCT_STATUS.md).
