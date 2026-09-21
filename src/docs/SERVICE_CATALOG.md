# Catálogo Oficial de Servicios y Gobernanza de Plantillas — UHURA GROUP 2026

> **Fuente Primaria de Verificación:** *INSTRUCTIVO DILIGENCIAMIENTO, SEGUIMIENTO Y EVALUACIÓN DE ACTIVIDADES & FORMATO DE PROCESO DE ÁREA UHURA (2026)*  
> **Área Gobernadora:** Dirección General, Producto Digital y Operaciones  
> **Fecha de Actualización:** Septiembre 2026  
> **Versión del Catálogo:** 2026.1  
> **Implementación en Código:**
> - Definiciones y Datos Maestros: [`src/components/taskflow/templates/templateData.ts`](../components/taskflow/templates/templateData.ts)
> - Motor de Clonación y Cálculo: [`src/components/taskflow/templates/templateEngine.ts`](../components/taskflow/templates/templateEngine.ts)
> - Tipos y Roles Canónicos: [`src/components/taskflow/types.ts`](../components/taskflow/types.ts)
> - Motor Financiero: [`src/components/taskflow/financial/financialEngine.ts`](../components/taskflow/financial/financialEngine.ts)
> - Interfaz de Biblioteca: [`src/components/taskflow/templates/TemplateLibraryView.tsx`](../components/taskflow/templates/TemplateLibraryView.tsx)
> - Modal de Clonación e Integración con New Business: [`src/components/taskflow/templates/CloneToQuoteModal.tsx`](../components/taskflow/templates/CloneToQuoteModal.tsx)

---

## 1. Estado de Validación y Gobernanza

El Catálogo de Servicios de Orbit actúa como la biblioteca oficial de especificaciones y estimaciones técnicas de Uhura Group. Para evitar confusiones entre datos definitivos, requerimientos específicos y supuestos en evolución, toda definición se rige bajo la siguiente matriz de gobernanza:

### 1.1 Leyenda Oficial de Clasificación

1. 🟢 **Base operativa confirmada:** Datos, actividades y horas base explícitamente sustentados en la documentación fuente oficial (PDF de procesos por área Uhura 2026).
2. 🔵 **Propuesta técnica:** Especificaciones complementarias, estructuraciones de arquitectura o plantillas modulares abiertas (ej. `tmpl-custom-blank`) implementadas en Orbit para soportar New Business sin alterar la fuente canónica.
3. 🟡 **Pendiente de validación operativa:** Elementos metodológicos, dependencias de software o condiciones de servicio que dependen de acuerdos por SOW con cada cliente y no constituyen restricciones absolutas del sistema.
4. 🟠 **Pendiente de validación financiera/fiscal:** Parámetros tributarios, tasas de cambio o tarifas horarias que son gobernados por la Dirección Comercial/Financiera y la Calculadora Comercial, no por el catálogo técnico.

### 1.2 Anotaciones Críticas de Gobernanza

Para salvaguardar la exactitud del modelo operativo, se establecen las siguientes delimitaciones puntuales:

- **“Freeze Funcional” en Gates de Aprobación:** *(🟡 Pendiente de validación operativa)*. Es una buena práctica metodológica de gestión de proyectos y UAT para mitigar el *scope creep*, pero no representa un bloqueo contractual inflexible del sistema.
- **IVA 19% Colombia y TRM:** *(🟠 Pendiente de validación financiera/fiscal)*. La configuración tributaria y la tasa representativa del mercado son variables externas sujetas a la legislación aplicable, residencia fiscal del cliente y fecha de corte de la cotización.
- **Tarifas Horarias y Márgenes Financieros:** *(🟠 Pendiente de validación financiera/fiscal)*. Las plantillas del catálogo gobiernan exclusivamente **horas técnicas y roles asignados**. El cálculo de costos, salarios brutos, factores multiplicadores, precios de venta y márgenes es responsabilidad exclusiva de la Calculadora Comercial.
- **Builders de WordPress (Elementor Pro / Bricks Builder):** *(🟡 Pendiente de validación operativa)*. Constituyen herramientas de referencia estándar sugeridas en el proceso operativo de Producto Digital; su uso específico se valida según el stack técnico del cliente y no es obligatorio por defecto.
- **Pasarelas de Pago E-commerce (Wompi / PayU / MercadoPago / Shopify Payments):** *(🟡 Pendiente de validación operativa)*. Opciones sugeridas del mercado. La integración definitiva depende de las comisiones, cuenta bancaria y modelo comercial de cada cliente.
- **Aseguramiento de Calidad (QA) y Personas Reales:** *(🟢 Base operativa confirmada / Normalizada a Rol)*. Las menciones a personas específicas en la fuente se desacoplan a roles canónicos operativos (`Product Lead` para QA técnico/funcional; `Client Relationship Strategist` para validación de cara al cliente). Las referencias a fundadores o directores se reservan exclusivamente como sign-off ejecutivo de gobernanza.
- **Garantía Universal de 30 Días:** *(🟡 Pendiente de validación operativa)*. Bolsa de soporte post-lanzamiento estándar sugerida; su aplicación formal está sujeta a los términos negociados en el Statement of Work (SOW).

---

## 2. Principios de Desacoplamiento e Inmutabilidad de Plantillas

Orbit implementa un modelo de datos robusto para la evolución del catálogo:

1. **Evolución por Versionamiento:** Cuando un líder autorizado edita una plantilla maestra para optimizar un proceso, el sistema genera o actualiza una nueva versión de la plantilla (ej. de `2026.1` a `2026.2`).
2. **Inmutabilidad de Cotizaciones Históricas:** La modificación de una plantilla maestra **nunca altera ni retroalimenta cotizaciones, presupuestos o proyectos ya creados**. Cada cotización en New Business opera sobre una copia profunda y desacoplada del alcance vigente al momento de su creación.
3. **Gobierno Multiarea Abierto:** La interfaz de Orbit permite que los líderes autorizados de cada departamento (Producto Digital, Growth, Creativa, Comercial) gestionen y evolucionen sus propias plantillas a medida que sus servicios se paquetizan y maduran.

---

## 3. Catálogo Oficial de 12 Roles Canónicos y Normalización de Personas

Orbit estandariza los perfiles requeridos para la ejecución técnica y comercial en un catálogo cerrado de **12 roles canónicos cotizables**, complementados por el estado de reserva **`Pendiente de definición`**.

### 3.1 Matriz Oficial de Roles Canónicos

| Rol Canónico | Identificador / Alias en Fuente | Área / Departamento | Responsabilidad Principal en Servicios |
|---|---|---|---|
| **Client Relationship Strategist** | `Client relationship`, `Líder de Cuenta`, `Account` | Comercial / Cuentas | Gestión de cliente, insumo de accesos, checkpoints, QA visual/cliente, gates de aprobación y soporte. |
| **Front-End Dev** | `Desarrollador Web Front-End`, `Front End` | Producto Digital | Maquetación web (WordPress/Shopify/Webflow), integraciones técnicas, APIs, analítica (GTM/GA4) y hosting. |
| **Product Lead** | `Product lead`, `Líder de Producto` | Producto Digital | Arquitectura UX/UI, wireframing en Figma, visión técnica de producto, control de calidad interno y entregas. |
| **Digital Content Specialist** | `Digital content`, `Specialist Content Digital`, `Creativo Copy` | Creativa / Contenido | Redacción de copys persuasivos, estructura H1/H2, keyword research, SEO on-page y metadatos. |
| **Digital Designer** | `Web designer`, `Diseñador Web`, `UI Designer` | Creativa / Diseño | Customización de templates UI, diseño de interfaces desktop/mobile, sistemas de diseño y layouts. |
| **Creative Designer** | `Creative designer`, `Creativo Gráfico` | Creativa / Arte | Banners publicitarios, recursos gráficos de campaña, optimización visual de producto (PDP) y branding. |
| **Creative Strategy Lead** | `Líder Área Creativa`, `Director Creativo` | Creativa | Dirección conceptual, estrategia de comunicación y narrativa visual de propuestas de marca. |
| **Trafficker Media** | `Tracfiker`, `Trafficker Media`, `Especialista Pauta` | Growth & Media | Estrategia de medios pagados, configuración de píxeles, eventos de conversión y optimización de pauta. |
| **Community Manager** | `Community Manager`, `CM` | Contenido & Social | Gestión de comunidades, moderación y soporte conversacional en redes sociales. |
| **Content Creator** | `Content Creator`, `Creador de Contenido` | Creativa / Social | Producción multimedia, fotografía, video corto (UGC) y assets de contenido orgánico. |
| **Directora Comercial** | `Directora Comercial`, `Head of Sales` | Comercial | Supervisión de márgenes, estrategia de negociación, propuestas comerciales y pricing. |
| **Growth Manager** | `Growth Manager`, `Director de Growth` | Growth & Media | Estrategia de crecimiento digital, embudos de conversión, planeación mensual y experimentación. |
| *Pendiente de definición* | `ROLE_PENDING_DEFINITION` | Gobernanza | Estado reservado para actividades cuya correlación funcional de rol no sea inequívoca en la fuente. |

### 3.2 Tratamiento de Personas Reales Detectadas en la Fuente

Siguiendo el principio de **"interpretar la función y no convertir personas en roles"**, las personas identificadas en los formatos primarios son normalizadas de la siguiente manera:

- **Ana María Giraldo (CEO & Founder):** Aparece en la columna "Responsable Calidad" en los formatos de Producto Digital. Se mantiene como **referencia de sign-off y gobernanza ejecutiva**. En las actividades operativas del catálogo, el QA se desacopla y asigna al rol funcional correspondiente (`Product Lead` para calidad técnica; `Client Relationship Strategist` para validación con el cliente).
- **Sebastián / "Sebas":** Aparece como responsable en la tabla de Gestión y Optimización de Pauta en Growth. Se normaliza según la función específica: **`Trafficker Media`** para las tareas operativas de revisión de alertas, pujas, audiencias y costos; y **`Growth Manager`** para el desarrollo de la planeación estratégica mensual.
- **Catalina Tejada:** Aparece como responsable de calidad y autora de notas en el Área Comercial. Se normaliza según la naturaleza de la actividad: **`Directora Comercial`** en negociación, pricing, presentaciones de propuesta y seguimiento comercial; y **`Client Relationship Strategist`** en gestión de cuentas, actas y relación con el cliente.
- **Luisa:** Mencionada en notas de seguimiento comercial ("En esta reunión estamos Luisa y yo"). Se asigna funcionalmente a **`Client Relationship Strategist`**.

---

## 4. Clasificación del Inventario Multiarea de Uhura

A partir del análisis exhaustivo del documento fuente oficial (PDF de procesos por área Uhura 2026), los elementos identificados se clasifican formalmente en 4 categorías operativas. **Únicamente los elementos clasificados como "Servicio comercializable / plantilla de catálogo" se incorporan como plantillas maestras en Orbit**.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                INVENTARIO MULTIAREA DE PROCESOS UHURA                                  │
├────────────────────────────────┬───────────────────────────────┬───────────────────────────────────────┤
│ 1. SERVICIOS COMERCIALIZABLES  │ 2. PROCESOS INTERNOS          │ 3. RITUALES / GOBERNANZA              │
│    (Plantillas Maestras Orbit) │    (Ejecución Operativa)      │    (No paquetizables como plantilla)  │
├────────────────────────────────┼───────────────────────────────┼───────────────────────────────────────┤
│ • 7 Servicios Producto Digital │ • SEO Monthly (Contenido)     │ • Planteamiento Propuesta Growth      │
│ • 3 Servicios Growth           │ • Implementación Pauta        │ • Servicio & Relacionamiento Cuentas  │
│ • 4 Servicios Creativa         │ • Estrategia Mailing General  │ • Gestión Operativa, COR & Tráfico    │
│ • 1 Proyecto a la Medida       │ • Email Salesforce Mkt Cloud  │ • Prospección Comercial & Calificación│
│   (Propuesta Técnica Abierta)  │ • Diseño de Piezas Extras/POP │ • Rituales de Cliente (Onboarding/CSAT)│
└────────────────────────────────┴───────────────────────────────┴───────────────────────────────────────┘
```

### 4.1 Servicios Comercializables / Plantillas Maestras de Catálogo (14 Canónicas + 1 Propuesta Técnica)
Servicios paquetizados con alcance comercializable cerrado, horas y actividades atómicas extraídas de la fuente primaria, estructurados por área gobernadora:

#### A. Área Producto Digital (7 Servicios Canónicos)
1. `tmpl-landing-page`: **Landing Page en WordPress / Webflow** (31.0 hrs) — *🟢 Base operativa confirmada*
2. `tmpl-wp-informativo`: **Sitio Web Informativo WordPress** (140.0 hrs) — *🟢 Base operativa confirmada*
3. `tmpl-mantenimiento-wp`: **Mantenimiento Web WordPress** (9.0 hrs/mes) — *🟢 Base operativa confirmada*
4. `tmpl-tienda-shopify`: **Tienda Online Shopify (hasta 20 SKUs)** (116.0 hrs) — *🟢 Base operativa confirmada*
5. `tmpl-chatbot-manychat`: **Chatbot con ManyChat** (46.5 hrs) — *🟢 Base operativa confirmada*
6. `tmpl-mercado-libre`: **Mercado Libre Marketplace Store** (42.0 hrs) — *🟢 Base operativa confirmada*
7. `tmpl-digital-shelf`: **Digital Shelf (Optimización PDPs)** (5.5 hrs) — *🟢 Base operativa confirmada*

#### B. Área Growth (3 Servicios Canónicos)
8. `tmpl-seo-one-shot`: **SEO (One Shot) o Primer Mes** (46.96 hrs) — *🟢 Base operativa confirmada*  
   *Diagnóstico inicial, keyword research, auditoría SEO técnica/on-page y estrategia integral para clientes nuevos.*
9. `tmpl-pauta-gestion-mensual`: **Gestión & Optimización Mensual de Pauta** (52.0 hrs/mes) — *🟢 Base operativa confirmada*  
   *Servicio recurrente mensual de monitoreo de alertas, calibración de pujas, audiencias, pacing y planeación estratégica.*
10. `tmpl-auditoria-crm-hubspot`: **Auditoría CRM & Email - HubSpot** (70.0 hrs) — *🟢 Base operativa confirmada*  
   *Diagnóstico integral de la instancia de HubSpot: calidad de contactos, segmentación, flujos de automatización y roadmap.*

#### C. Área Creativa (4 Servicios Canónicos)
11. `tmpl-diseno-de-marca`: **Diseño de Marca & Identidad (Branding Completo)** (81.4 hrs) — *🟢 Base operativa confirmada*  
   *Servicio integral de branding: buyer persona, arquitectura de marca, naming, narrativa, Key Visual, manual y manifiesto.*
12. `tmpl-redes-sociales-mensual`: **Contenido para Redes Sociales (Mensual)** (42.4 hrs/mes) — *🟢 Base operativa confirmada*  
   *Parrilla mensual de 12 publicaciones, producción de video corto UGC, diseño gráfico/animado, publicación y reporte.*
13. `tmpl-creatividad-campanas`: **Creatividad & Campañas** (41.4 hrs) — *🟢 Base operativa confirmada*  
   *Campaña publicitaria: benchmark, concepto creativo central, textos persuasivos, diseño de Key Visual (2 rutas) y presentación.*
14. `tmpl-creativos-pauta`: **Creativos de Pauta Digital** (11.0 hrs) — *🟢 Base operativa confirmada*  
   *Pack publicitario: redacción de copies y diseño de piezas estáticas y animadas adaptadas para A/B testing en pauta.*

#### D. Propuesta Técnica Abierta (1 Plantilla Modular)
15. `tmpl-custom-blank`: **Proyecto a la Medida (Scoping Abierto)** (12.0 hrs base) — *🔵 Propuesta técnica*  
   *Estructura modular flexible para dimensionar alcances especiales en New Business sin alterar las plantillas canónicas fijas.*

---

### 4.2 Procesos Internos (Ejecución Operativa No Empaquetada como Servicio Unitario)
Flujos operativos continuos o de soporte interno que NO se comercializan como una plantilla cerrada independiente:

- **SEO Monthly (Generación de Contenido Continuo):** Ejecución operativa mensual de redacción y publicación de artículos; sus horas varían contractualmente por volumen de artículos pactado en el SOW y depende de la estrategia fijada en el servicio de SEO One Shot.
- **Implementación Inicial de Pauta:** Configuración de business managers, píxeles y conversiones API; actúa como fase de setup operativo vinculada a cuentas de pauta o desarrollo web.
- **Estrategia Mailing General:** Flujo de diseño y redacción de campañas de email puntuales que se cotizan como piezas específicas o bajo fee de relacionamiento.
- **Implementación Email Salesforce Marketing Cloud:** Servicio altamente técnico enterprise cuyas horas dependen de la arquitectura de datos del cliente (pendiente de dimensionamiento estándar).
- **Diseño de Piezas Extras & Impresos (POP, Brochures):** Solicitudes puntuales de soporte gráfico bajo demanda que se gestionan vía bolsa de horas de diseño.

### 4.3 Rituales y Gobernanza (No Comercializables)
Actividades de gestión interna, coordinación de equipo y relación con el cliente que forman parte del costo indirecto o del acompañamiento de cuenta:

- **Planteamiento de Propuesta (Paid / Organic) en Growth:** Proceso comercial interno para dimensionar cuentas de prospección.
- **Servicio y Relacionamiento (Cuentas):** Gestión diaria, atención de tickets, comités semanales y presentación de resultados.
- **Comercial & Prospección:** Registro de leads en CRM, calificación de oportunidades y elaboración de presupuestos.
- **Gestión Operativa y Tráfico:** Apertura de proyectos en COR, weeklys de capacidad de equipo y gestión documental en Google Drive.
- **Rituales de Cliente:** Sesiones de kickoff comercial de bienvenida, encuestas periódicas de satisfacción (CSAT) y reuniones de gobernanza ejecutiva.

### 4.4 Actividades Reutilizables Transversales
Micro-actividades que se integran dentro de los servicios comercializables pero no constituyen un producto comercializable independiente:
- Inyección de códigos de seguimiento (GTM, GA4, Meta Pixel).
- Checklist de control de calidad interno (QA de código, diseño o textos).
- Redacción de microcopys o corrección de estilo.
- Carga y entrega documental en COR / Google Drive.

---

## 5. Especificación Detallada de las Plantillas Maestras

---

### 5.1 Landing Page en WordPress / Webflow
- **ID:** `tmpl-landing-page` | **Categoría:** `landing_page` | **Clasificación:** 🟢 Base operativa confirmada
- **Horas Base:** 31.0 hrs | **Duración Estimada:** 3 semanas *(🔵 Propuesta técnica de cronograma)*
- **Entregables y Actividades:**

| Entregable | Actividad | Rol Canónico | Horas | Notas de Gobernanza |
|---|---|---|---|---|
| **1. Onboarding & Insumos** | Kickoff & Alineación | Product Lead | 1.0 h | Alineación de propuesta de valor y objetivos de campaña. |
| | Accesos WordPress, hosting, dominio e insumos | Product Lead | 1.0 h | Recolección de credenciales y requerimientos. *(Elementor Pro/Hosting sugeridos)*. |
| **2. UX & Contenido** | Diseño landing (hasta 6 bloques) con Figma Make | Product Lead | 2.0 h | Composición visual. *(Sign-off de calidad: Dirección)*. |
| | Ajustes visuales sobre base | Product Lead | 2.0 h | Afinación visual sobre observaciones internas. |
| | Redacción de copy | Digital Content Specialist | 4.0 h | Textos persuasivos y microcopy de conversión. |
| **3. Implementación & Analítica** | Maquetación WordPress (Bricks/Elementor) Desktop / Mobile | Front-End Dev | 12.0 h | Desarrollo frontend responsive. *(Builder según stack acordado)*. |
| | Configuración de formulario | Front-End Dev | 1.0 h | Campos, validaciones y notificación de leads. |
| | GA4 + GTM básico | Front-End Dev | 2.0 h | Contenedor GTM y evento de conversión en formulario. |
| | SEO on-page | Front-End Dev | 1.0 h | Metatítulos, metadescripciones y jerarquía H1-H3. |
| | QA visual + funcional | Product Lead | 2.0 h | Auditoría técnica previa a entrega. |
| **4. Entrega & Soporte** | 1 ronda post-entrega - Cliente | Front-End Dev | 2.0 h | Ajustes de detalle solicitados por el cliente. |
| | Entrega y handoff | Product Lead | 2.0 h | Entrega de credenciales y cierre formal. |

---

### 5.2 Sitio Web Informativo WordPress
- **ID:** `tmpl-wp-informativo` | **Categoría:** `wordpress` | **Clasificación:** 🟢 Base operativa confirmada
- **Horas Base:** 140.0 hrs | **Duración Estimada:** 8 semanas *(🔵 Propuesta técnica de cronograma)*
- **Entregables y Actividades:**

| Entregable | Actividad | Rol Canónico | Horas | Notas de Gobernanza |
|---|---|---|---|---|
| **1. Kick-off & Discovery** | Kickoff con cliente | Client Relationship Strategist | 1.0 h | Presentación formal de equipo y expectativas. |
| | Socializar: Modelo de negocio, Backlog y COR | Product Lead | 2.0 h | Arquitectura funcional y alcance en herramientas de gestión. |
| | Insumo de accesos | Client Relationship Strategist | 1.0 h | Credenciales de servidor, hosting y dominio. |
| | Checkpoints con cliente (semanales) | Client Relationship Strategist | 6.0 h | Acompañamiento periódico durante el proyecto. |
| **2. UX, Contenido & Gate 1** | Arquitectura UX con Figma Make | Product Lead | 2.0 h | Mapa de navegación y jerarquía de secciones. |
| | Diseño UX/UI funcional con Figma Make | Product Lead | 6.0 h | Diseño visual de interfaz responsive. |
| | Contenido con estructura H1/H2 por página | Digital Content Specialist | 4.0 h | Copywriting estructurado por página (hasta 8 páginas). |
| | Diseño de banners y elementos gráficos (hasta 7) | Creative Designer | 12.0 h | Piezas gráficas y banners hero optimizados. |
| | QA visual + funcional interno | Client Relationship Strategist | 2.0 h | Validación interna de coherencia de marca. |
| | Ajustes UX/UI | Product Lead | 8.0 h | Ronda de afinación según observaciones. |
| | GATE 1: Aprobación Diseño (5 días) + Congelamiento UAT | Client Relationship Strategist | 1.0 h | *(🟡 Freeze Funcional metodológico)*. |
| **3. Implementación Frontend & Gate 2** | Setup técnico (WP + plugins base + CDN + hosting) | Front-End Dev | 2.0 h | Entorno de desarrollo, child theme y plugins base. |
| | Maquetación WordPress (8 secciones) Desktop & Mobile | Front-End Dev | 32.0 h | Programación frontend de 8 plantillas/secciones. |
| | Setup ACF (2 CPT / 6 campos máx.) | Front-End Dev | 4.0 h | Custom Post Types y campos para autogestión. |
| | Implementación formularios (hasta 3) | Front-End Dev | 2.0 h | Setup de formularios de contacto con validaciones. |
| | Configurar envío de mails marketing (hasta 3) | Front-End Dev | 1.0 h | Conexión SMTP transaccional / marketing básico. |
| | Linkear botones e interacciones | Front-End Dev | 4.0 h | Enlaces internos, microinteracciones y estados hover. |
| | SEO on-page técnico | Front-End Dev | 2.0 h | Títulos, meta descripciones y encabezados H1-H3. |
| | Performance base (carga, imágenes WebP, caché) | Front-End Dev | 2.0 h | Optimización en PageSpeed Insights y compresión. |
| | QA técnico de código y plugins | Front-End Dev | 2.0 h | Pruebas de consola y compatibilidad. |
| | QA visual y funcional | Client Relationship Strategist | 2.0 h | Comprobación de navegación y legibilidad. |
| | Ajustes post-QA | Front-End Dev | 4.0 h | Corrección de incidencias encontradas internamente. |
| | Ajustes internos cliente (Ronda 1) | Front-End Dev | 6.0 h | Incorporación de observaciones del cliente en staging. |
| | GATE 2: Aprobación staging (3 días) + Congelamiento UAT | Client Relationship Strategist | 1.0 h | Visto bueno formal para autorizar salida a producción. |
| | Ajustes finales post-staging | Front-End Dev | 6.0 h | Afinación previa a Go Live. |
| **4. Analítica & Go Live** | Instalar códigos de seguimiento (GTM, GA4, Clarity) | Front-End Dev | 1.0 h | Inyección de contenedores y verificación de eventos. |
| | Configuración de eventos de conversión en formulario | Front-End Dev | 4.0 h | Tagging en GTM para captación de leads. |
| | Go Live / Apuntamiento de dominio y DNS | Front-End Dev | 2.0 h | Migración a producción, SSL y redirecciones 301. |
| | Revisión de calidad y ajustes post-lanzamiento | Front-End Dev | 4.0 h | Verificación en caliente en el servidor definitivo. |
| **5. SEO Técnico** | Verificación en Google Search Console | Digital Content Specialist | 1.0 h | Envío de sitemap XML y revisión de cobertura. |
| | Implementar robots.txt, sitemaps y Schema Markup | Digital Content Specialist | 1.0 h | Directivas de indexación y marcado de datos estructurados. |
| **6. Entrega & Soporte** | Creación de usuarios y roles para cliente | Front-End Dev | 1.0 h | Usuarios editor/administrador con credenciales seguras. |
| | Capacitación de administración de contenidos | Front-End Dev | 1.0 h | Sesión de inducción para el equipo del cliente. |
| | Documentación de entrega + checklist | Front-End Dev | 2.0 h | Manual básico de uso y entrega de accesos maestros. |
| | Soporte técnico post-lanzamiento | Front-End Dev | 8.0 h | *(🟡 Soporte referencial sujeto a SOW)*. |

---

### 5.3 Mantenimiento Web WordPress
- **ID:** `tmpl-mantenimiento-wp` | **Categoría:** `mantenimiento_web` | **Clasificación:** 🟢 Base operativa confirmada
- **Horas Base:** 9.0 hrs / mes | **Modalidad:** Recurrente mensual
- **Entregables y Actividades:**

| Entregable | Actividad | Rol Canónico | Horas | Notas de Gobernanza |
|---|---|---|---|---|
| **1. Análisis & Backup** | Accesos a plataforma | Front-End Dev | 0.5 h | Verificación de credenciales y conectividad. |
| | Diagnóstico de plataforma y PageSpeed | Front-End Dev | 1.0 h | Medición de rendimiento, logs de errores y tráfico. |
| | Backup y verificación de restauración | Front-End Dev | 0.5 h | Copia de seguridad completa previa a cambios. |
| **2. Actualizaciones & Seguridad** | Actualización WordPress core + tema | Front-End Dev | 1.0 h | Actualización controlada en entorno seguro. |
| | Actualización de plugins | Front-End Dev | 0.5 h | Actualización escalonada y prueba funcional. |
| | Revisión de seguridad básica (scan de malware / firewall) | Front-End Dev | 0.5 h | Monitoreo de accesos sospechosos y firewall. |
| | Corrección de errores menores (CSS roto, plugin bug) | Front-End Dev | 1.5 h | Reparaciones menores sin alterar arquitectura base. |
| | Ajustes de contenido menores | Front-End Dev | 0.5 h | Actualización puntual de textos o banners facilitados. |
| | Status de mantenimiento, informe y prevenciones | Front-End Dev | 0.5 h | Reporte ejecutivo mensual de estado del sitio. |
| | Backup final post-mantenimiento | Front-End Dev | 0.5 h | Nueva instantánea con los cambios consolidados. |
| **3. Soporte & Gestión** | Soporte técnico al cliente | Front-End Dev | 1.0 h | Atención de incidencias reportadas. |
| | Gestión de cliente y coordinación mensual | Client Relationship Strategist | 1.0 h | Envío de reporte y seguimiento con el cliente. |

*Nota aritmética de normalización:* En el formato fuente, la celda resumen indicaba "19" por un error de tipografía en el Excel. La suma rigurosa de las actividades individuales es 8.0 h (Front-End) + 1.0 h (Client Relationship) = **9.0 h/mes**.

---

### 5.4 Tienda Online Shopify (hasta 20 SKUs)
- **ID:** `tmpl-tienda-shopify` | **Categoría:** `shopify` | **Clasificación:** 🟢 Base operativa confirmada
- **Horas Base:** 116.0 hrs | **Duración Estimada:** 8 semanas *(🔵 Propuesta técnica de cronograma)*
- **Entregables y Actividades:**

| Entregable | Actividad | Rol Canónico | Horas | Notas de Gobernanza |
|---|---|---|---|---|
| **1. Kick-off & Arquitectura** | Reunión kickoff + objetivos e-commerce | Client Relationship Strategist | 2.0 h | Modelo de negocio, inventario y políticas. |
| | Backlog en COR + visión técnica de producto | Product Lead | 2.0 h | Alcance funcional y dimensionamiento. |
| | Solicitud de accesos e insumos al cliente | Client Relationship Strategist | 1.0 h | Catálogo e información comercial. |
| | Checkpoints con cliente | Client Relationship Strategist | 6.0 h | Acompañamiento periódico durante el proyecto. |
| | Definición de estructura de catálogo (tipos, colecciones) | Product Lead | 2.0 h | Taxonomía de categorías y variantes. |
| | Definición de plantilla base (2 opciones) | Product Lead | 2.0 h | Selección técnica de temas optimizados. |
| | GATE 1: Aprobación de arquitectura y tema | Client Relationship Strategist | 1.0 h | *(🟡 Freeze de arquitectura previo al diseño)*. |
| **2. Contenido Base & Banners** | Keyword research e intenciones de búsqueda de compra | Digital Content Specialist | 2.0 h | Palabras clave para títulos y categorías. |
| | Redacción Home, Nosotros, Contacto y legales base | Digital Content Specialist | 4.0 h | Copywriting para páginas institucionales y políticas. |
| | Metadescripciones Home + hasta 3 colecciones | Digital Content Specialist | 1.0 h | Metatítulos y descripciones SEO. |
| | Banners (2 Hero, 2 secundarios, placeholder de producto) | Creative Designer | 8.0 h | Composición de banners publicitarios y diseño gráfico. |
| **3. Setup Técnico Shopify** | Sesión de compra de licencia y pasarela de pagos | Product Lead | 1.0 h | *(🟡 Pasarela a definir según cliente)*. |
| | Configuración general (moneda, mercados, idioma) | Front-End Dev | 2.0 h | Parámetros regionales de la tienda. |
| | Configuración de navegación (header + footer) | Front-End Dev | 2.0 h | Menús principales y enlaces de navegación. |
| | Configuración del checkout de Shopify | Front-End Dev | 2.0 h | Campos obligatorios y opciones de pago. |
| | Configuración de envíos (tarifas fijas / transportadora) | Front-End Dev | 3.0 h | Reglas de despacho y logística. |
| | Configuración de impuestos | Front-End Dev | 1.0 h | *(🟠 Parámetros tributarios según régimen del cliente)*. |
| | Carga de políticas legales (T&C, devoluciones, privacidad) | Front-End Dev | 2.0 h | Adaptación legal estándar en footer. |
| | QA visual y funcional de setup | Product Lead | 2.0 h | Validación interna de configuración técnica. |
| **4. Template & UI** | Instalación y configuración de tema | Digital Designer | 2.0 h | Instalación de tema y setup inicial. |
| | Customización visual global (fuentes, paleta, botones) | Digital Designer | 4.0 h | Aplicación de guía de estilos y tokens visuales. |
| | Maquetación Home (banners + grilla de secciones) | Digital Designer | 4.0 h | Composición de bloques modulares de portada. |
| | Configuración y diseño de ficha PDP de producto | Digital Designer | 4.0 h | Selector de variantes, badges y tabs informativos. |
| | Diseño y optimización de Carrito (Drawer / Página) | Digital Designer | 2.0 h | Microcopys y llamados de urgencia/envío gratis. |
| | Maquetación páginas internas (Nosotros, Contacto) | Digital Designer | 4.0 h | Montaje de contenido institucional. |
| **5. Catálogo (hasta 20 SKUs)** | CSV títulos optimizados y plantillas de descripción | Digital Content Specialist | 4.0 h | Formato tabular para importación masiva. |
| | Creación de colecciones (hasta 3) | Front-End Dev | 2.0 h | Filtros automáticos por tags de producto. |
| | Subcolecciones y organización de catálogo | Front-End Dev | 3.0 h | Jerarquía interna de navegación comercial. |
| | Configuración de tipos de producto y atributos | Front-End Dev | 2.0 h | Atributos comerciales (tallas, colores, materiales). |
| | Carga de productos (hasta 20 SKUs con imágenes) | Front-End Dev | 6.0 h | Subida de fotos, variantes, SKUs e inventario. |
| | QA visual y funcional de catálogo | Product Lead | 2.0 h | Revisión de coherencia de fotos y precios. |
| **6. SEO & QA Técnico** | Implementar robots.txt, sitemaps y URLs canónicas | Front-End Dev | 1.0 h | Verificación de indexación técnica en Shopify. |
| | Verificación en Google Search Console | Digital Content Specialist | 1.0 h | Envío del sitemap de productos. |
| | QA técnico de checkout y métodos de pago | Front-End Dev | 0.5 h | Prueba de pasarela en modo sandbox / test. |
| | Validación responsive en múltiples dispositivos | Front-End Dev | 1.0 h | Comprobación en mobile, tablet y desktop. |
| | Validación de flujo completo de compra | Front-End Dev | 1.0 h | Desde catálogo hasta confirmación por correo. |
| | QA funcional con compra simulada de usuario real | Front-End Dev | 0.5 h | Verificación del ciclo de inventario. |
| | GATE 2: Aprobación de staging por cliente | Client Relationship Strategist | 0.5 h | Visto bueno formal para salida en vivo. |
| **7. Lanzamiento & Analítica** | Go Live / Apuntamiento de dominio principal | Front-End Dev | 1.0 h | Configuración DNS en servidores de Shopify y SSL. |
| | QA en vivo post-lanzamiento | Front-End Dev | 4.0 h | Verificación en producción con pasarela activa. |
| | Códigos de seguimiento (GTM, GA4, Clarity) | Front-End Dev | 1.0 h | Inyección en theme.liquid y scripts base. |
| | Configuración de eventos de e-commerce en GA4/GTM | Front-End Dev | 4.0 h | View item, add to cart, begin checkout y purchase. |
| | Pruebas de eventos analíticos en modo debug | Front-End Dev | 2.0 h | Validación en GA4 DebugView. |
| **8. Entrega & Soporte** | Capacitación al cliente en panel de Shopify | Product Lead | 1.0 h | Gestión de pedidos, clientes e inventario. |
| | Documentación de entrega + checklist | Product Lead | 2.0 h | Manual operativo de la tienda. |
| | Reunión formal de cierre de proyecto | Product Lead | 1.0 h | Cierre comercial y entrega de activos. |
| | Soporte técnico post-lanzamiento | Front-End Dev | 8.0 h | *(🟡 Soporte referencial sujeto a SOW)*. |

---

### 5.5 Chatbot con ManyChat
- **ID:** `tmpl-chatbot-manychat` | **Categoría:** `chatbot_manychat` | **Clasificación:** 🟢 Base operativa confirmada
- **Horas Base:** 46.5 hrs | **Duración Estimada:** 4 semanas *(🔵 Propuesta técnica de cronograma)*
- **Entregables y Actividades:**

| Entregable | Actividad | Rol Canónico | Horas | Notas de Gobernanza |
|---|---|---|---|---|
| **1. Kick-off & Flujos** | Kickoff con cliente | Product Lead | 1.0 h | Canales (WA/IG/FB) y objetivos conversacionales. |
| | Backlog y estructuración en COR | Product Lead | 1.0 h | Detalle de flujos y requerimientos de integración. |
| | Insumo de accesos (Meta, ManyChat y FAQs) | Client Relationship Strategist | 1.0 h | Recolección de preguntas frecuentes y credenciales. |
| | Checkpoints de seguimiento con cliente | Client Relationship Strategist | 4.0 h | Acompañamiento en pruebas intermedias. |
| | Definición de árbol conversacional | Product Lead | 2.0 h | Diagrama de bloques lógicos y respuestas. |
| | Redacción de mensajes del bot y tono de voz | Digital Content Specialist | 2.0 h | Textos cálidos y concisos con botones de opción. |
| **2. Gestión Meta & WhatsApp API** | Revisión de Business Manager de Meta | Product Lead | 1.0 h | Diagnóstico del estado de la empresa en Meta. |
| | Verificación de empresa ante Meta | Client Relationship Strategist | 1.0 h | Subida de documentación legal requerida. |
| | Alta de número de teléfono con proveedor BSP | Front-End Dev | 2.0 h | Activación de línea comercial oficial. |
| | Vincular canal a ManyChat | Front-End Dev | 1.0 h | Conexión OAuth con la cuenta de ManyChat. |
| | Redacción y aprobación de plantillas de Meta (HSM) | Product Lead | 1.5 h | Envío a aprobación de mensajes de inicio. |
| | Pruebas de envío y recepción de plantillas | Front-End Dev | 1.0 h | Verificación de respuesta en dispositivo real. |
| | Documentación técnica de credenciales | Product Lead | 0.5 h | Resumen de IDs y tokens de acceso. |
| **3. Configuración ManyChat** | Conexión de canales secundarios (IG / FB) | Front-End Dev | 2.0 h | Vinculación de mensajería directa en Instagram/Facebook. |
| | Habilitación de WhatsApp Cloud API (si no la tiene) | Front-End Dev | 10.0 h | Setup técnico en Meta for Developers y webhooks. |
| | Configuración de palabras clave y disparadores | Front-End Dev | 1.0 h | Triggers por palabras como "precio", "asesor", "horario". |
| | Construcción del flujo principal de navegación | Front-End Dev | 4.0 h | Montaje de mensajes, botones y condicionales. |
| | Captura de datos (Nombre, Email, Teléfono, Ciudad) | Front-End Dev | 1.0 h | Almacenamiento en campos personalizados (Custom Fields). |
| | Transferencia a agente humano (Live Chat) | Front-End Dev | 1.0 h | Pausar bot y notificar al equipo de ventas. |
| | Horarios de atención y respuestas fuera de horario | Front-End Dev | 1.0 h | Mensaje de fallback en noches y fines de semana. |
| | Pruebas funcionales de todas las ramas del bot | Product Lead | 2.0 h | Auditoría de respuestas y callejones sin salida. |
| | Salida al aire / activación de flujos | Front-End Dev | 0.5 h | Switch a modo público. |
| **4. Entrega & Soporte** | Capacitación al cliente en uso de ManyChat Live Chat | Digital Content Specialist | 1.0 h | Entrenamiento comercial para atención en vivo. |
| | Documento de entrega y matriz de accesos | Product Lead | 2.0 h | Diagrama del árbol conversacional y credenciales. |
| | Soporte y acompañamiento en primeros días | Client Relationship Strategist | 2.0 h | Monitoreo de interacciones reales de usuarios. |

---

### 5.6 Mercado Libre Marketplace Store
- **ID:** `tmpl-mercado-libre` | **Categoría:** `mercado_libre` | **Clasificación:** 🟢 Base operativa confirmada
- **Horas Base:** 42.0 hrs | **Duración Estimada:** 4 semanas *(🔵 Propuesta técnica de cronograma)*
- **Entregables y Actividades:**

| Entregable | Actividad | Rol Canónico | Horas | Notas de Gobernanza |
|---|---|---|---|---|
| **1. Fase 0 – Kickoff & Alcance** | Kickoff con cliente | Product Lead | 1.0 h | Objetivos comerciales y definición de SKUs estratégicos. |
| | Definición de alcance y visión de producto | Product Lead | 2.0 h | Estrategia de pricing y logística (Mercado Envíos). |
| | Insumo de accesos de Mercado Libre | Client Relationship Strategist | 2.0 h | Conexión al panel de vendedor y permisos. |
| | Checkpoints con cliente | Product Lead | 4.0 h | Revisiones semanales de avance de catálogo. |
| | Análisis de categoría, competencia y keywords | Digital Content Specialist | 3.0 h | Investigación de términos de búsqueda más usados. |
| **2. Setup Tienda ML** | Propuesta de valor de la tienda + legales | Digital Content Specialist | 2.0 h | Biografía, políticas de garantía y diferenciales. |
| | Definición de categorías y subcategorías de producto | Digital Content Specialist | 2.0 h | Árbol de navegación para maximizar relevancia. |
| | Setup técnico y configuración de tienda oficial | Digital Designer | 4.0 h | Configuración de portada y layout de tienda en ML. |
| | Banners y elementos gráficos de tienda general | Creative Designer | 4.0 h | Banner principal, banners de categorías y destacados. |
| | Configuración de cuenta y datos comerciales | Product Lead | 1.0 h | Datos fiscales, bancarios y razón social. |
| | Políticas de envío y devoluciones | Product Lead | 1.0 h | Parámetros de Mercado Envíos y tiempos de entrega. |
| | Configuración de reputación y tiempos de respuesta | Product Lead | 1.0 h | Calibración de parámetros de calidad operativa. |
| | Validación QA de configuración | Product Lead | 1.0 h | Comprobación de cuenta lista para operar. |
| **3. Publicación & Validación** | Carga y maquetación de hasta 15 SKUs | Digital Designer | 6.0 h | Subida de imágenes, fichas técnicas, precios y stock. |
| | QA visual y narrativa de publicaciones | Product Lead | 2.0 h | Coherencia de marca en mobile y desktop. |
| | QA SEO de títulos y descripciones | Digital Content Specialist | 2.0 h | Títulos estructurados según el algoritmo de búsqueda. |
| | Validación final de compras de prueba | Product Lead | 2.0 h | Verificación de inventario y generación de etiquetas. |
| | Capacitación al equipo del cliente en panel de ventas | Product Lead | 2.0 h | Gestión de preguntas, pedidos y métricas. |

---

### 5.7 Digital Shelf (Optimización PDPs de hasta 5 momentos)
- **ID:** `tmpl-digital-shelf` | **Categoría:** `digital_shelf` | **Clasificación:** 🟢 Base operativa confirmada
- **Horas Base:** 5.5 hrs | **Duración Estimada:** 2 semanas *(🔵 Propuesta técnica de cronograma)*
- **Entregables y Actividades:**

| Entregable | Actividad | Rol Canónico | Horas | Notas de Gobernanza |
|---|---|---|---|---|
| **1. Gestión & Diagnóstico** | Gestión y revisión del proyecto | Client Relationship Strategist | 0.5 h | Coordinación inicial y seguimiento con el cliente. |
| | Auditoría diagnóstica de PDPs actuales | Product Lead | 0.5 h | Detección de fugas de conversión y debilidades visuales. |
| **2. Optimización de Contenido** | Meta descripción y Metatítulo persuasivo | Digital Content Specialist | 0.5 h | Palabras clave relevantes y bullet points de alto impacto. |
| | Frases destacadas para imágenes de beneficios, Lifestyle y consumo | Digital Content Specialist | 0.5 h | Textos persuasivos para montar sobre las infografías. |
| **3. Optimización de Imágenes** | Optimización de imágenes (hasta 5 por PDP) | Creative Designer | 2.0 h | 5 momentos por PDP: 1. Beneficios; 2. Lifestyle; 3. Momento de consumo; 4. Family shot; 5. Product size. |
| | Control de calidad interno y ajustes | Creative Designer | 0.5 h | Calibración de contraste y legibilidad en mobile. |
| | Revisión y aprobación de creatividades con cliente | Product Lead | 0.5 h | Visto bueno del cliente antes de publicar. |
| **4. Entrega** | Informe de entrega con comparativo antes/después | Product Lead | 0.5 h | 5 PDPs optimizadas y listas para publicación. |

---

### 5.8 SEO (One Shot) o Primer Mes — Growth
- **ID:** `tmpl-seo-one-shot` | **Categoría:** `seo` | **Clasificación:** 🟢 Base operativa confirmada
- **Horas Base:** 46.96 hrs | **Duración Estimada:** 4 semanas *(🔵 Propuesta técnica de cronograma)*
- **Área Gobernadora:** Growth | **Total Actividades:** 41
- **Entregables y Resumen de Horas:**
  1. *Onboarding & Insumos Iniciales:* 3.25 hrs (`Growth Manager`, `Client Relationship Strategist`)
  2. *Keyword Research & Intenciones de Búsqueda:* 8.83 hrs (`Digital Content Specialist`)
  3. *Auditoría SEO Técnica & On-Page:* 15.50 hrs (`Front-End Dev`, `Digital Content Specialist`)
  4. *Estrategia SEO & Roadmap de Implementación:* 11.28 hrs (`Digital Content Specialist`, `Front-End Dev`)
  5. *Planeación de Contenidos Blog:* 8.10 hrs (`Digital Content Specialist`)
- **Notas de Gobernanza:** Los desarrollos y correcciones en robots.txt, sitemaps y Core Web Vitals se normalizan a `Front-End Dev`. La investigación y redacción se normalizan a `Digital Content Specialist`. La coordinación se normaliza a `Growth Manager`.

---

### 5.9 Gestión & Optimización Mensual de Pauta — Growth
- **ID:** `tmpl-pauta-gestion-mensual` | **Categoría:** `growth_pauta` | **Clasificación:** 🟢 Base operativa confirmada
- **Horas Base:** 52.0 hrs / mes | **Modalidad:** Recurrente mensual
- **Área Gobernadora:** Growth | **Total Actividades:** 8
- **Entregables y Resumen de Horas:**
  1. *Verificación & Auditoría Continua:* 12.0 hrs/mes (`Trafficker Media` — 6h revisión alertas + 6h costos/CPA)
  2. *Optimización de Campañas:* 24.0 hrs/mes (`Trafficker Media` — 8h pujas + 8h audiencias + 8h rotación de anuncios)
  3. *Seguimiento & Trabajo Colaborativo:* 12.0 hrs/mes (`Trafficker Media` — 6h feedback/métricas + 6h trabajo con Creativa/Cuentas)
  4. *Planeación Estratégica Mensual:* 4.0 hrs/mes (`Growth Manager` — 4h planeación de medios y forecast)
- **Notas de Gobernanza:** Roles normalizados desde la fuente: "Sebastián" / "Tracfiker" se normaliza a `Trafficker Media` para tareas tácticas y a `Growth Manager` para la planeación mensual.

---

### 5.10 Auditoría CRM & Email - HubSpot — Growth
- **ID:** `tmpl-auditoria-crm-hubspot` | **Categoría:** `crm_hubspot` | **Clasificación:** 🟢 Base operativa confirmada
- **Horas Base:** 70.0 hrs | **Duración Estimada:** 6 semanas *(🔵 Propuesta técnica de cronograma)*
- **Área Gobernadora:** Growth | **Total Actividades:** 21
- **Entregables y Resumen de Horas:**
  1. *Configuración de Cuenta & Accesos:* 2.0 hrs (`Growth Manager`)
  2. *Auditoría de Contactos & Segmentación:* 23.0 hrs (`Digital Content Specialist`, `Growth Manager`)
  3. *Auditoría de Email Marketing & Workflows:* 22.0 hrs (`Digital Content Specialist`, `Growth Manager`)
  4. *Landing Pages, Formularios & Herramientas:* 8.0 hrs (`Digital Content Specialist`, `Front-End Dev`, `Growth Manager`)
  5. *Diagnóstico, Plan de Optimización & Roadmap:* 15.0 hrs (`Growth Manager`)
- **Notas de Gobernanza:** Auditoría exhaustiva de higiene de datos, lead scoring predictivo, entregabilidad y flujos de nutrición. Integraciones técnicas con el sitio web normalizadas a `Front-End Dev`.

---

### 5.11 Diseño de Marca & Identidad (Branding Completo) — Creativa
- **ID:** `tmpl-diseno-de-marca` | **Categoría:** `branding` | **Clasificación:** 🟢 Base operativa confirmada
- **Horas Base:** 81.4 hrs | **Duración Estimada:** 6 semanas *(🔵 Propuesta técnica de cronograma)*
- **Área Gobernadora:** Creativa | **Total Actividades:** 30
- **Entregables y Resumen de Horas:**
  1. *Briefing & Alineación Inicial:* 3.0 hrs (`Client Relationship Strategist`)
  2. *Investigación & Arquitectura de Marca:* 24.5 hrs (`Digital Content Specialist`, `Creative Strategy Lead`)
  3. *Conceptualización Creativa & Narrativa:* 21.5 hrs (`Digital Content Specialist`, `Creative Strategy Lead`)
  4. *Diseño Visual, Key Visual & Manual:* 18.0 hrs (`Creative Designer`, `Creative Strategy Lead`)
  5. *Presentación, Calidad & Entrega Final:* 14.4 hrs (`Creative Strategy Lead`, `Client Relationship Strategist`, `Creative Designer`)
- **Notas de Gobernanza:** El rol "Líder de Área Creativa" se normaliza canónicamente a `Creative Strategy Lead`. El rol "Creativo Gráfico" se normaliza a `Creative Designer`. Incluye talleres de buyer persona, arquitectura, naming, manual de identidad y manifiesto audiovisual (hasta 1:30 min).

---

### 5.12 Contenido para Redes Sociales (Mensual) — Creativa
- **ID:** `tmpl-redes-sociales-mensual` | **Categoría:** `social_media` | **Clasificación:** 🟢 Base operativa confirmada
- **Horas Base:** 42.4 hrs / mes | **Modalidad:** Recurrente mensual
- **Área Gobernadora:** Creativa | **Total Actividades:** 25
- **Entregables y Resumen de Horas:**
  1. *Kickoff & Ideación Mensual:* 3.8 hrs/mes (`Client Relationship Strategist`, `Creative Strategy Lead`)
  2. *Redacción & Parrilla de Contenidos (12 Posts):* 11.0 hrs/mes (`Digital Content Specialist`)
  3. *Producción de Video Corto UGC:* 12.0 hrs/mes (`Creative Designer` — grabación 6h, edición 4h, ajustes 2h)
  4. *Diseño Gráfico & Animación de Piezas:* 4.9 hrs/mes (`Creative Designer`, `Creative Strategy Lead`)
  5. *Calidad, Ajustes, Publicación & Informe:* 10.7 hrs/mes (`Creative Designer`, `Creative Strategy Lead`, `Content Creator`)
- **Notas de Gobernanza:** Programación, verificación de salida y reporte mensual de métricas asignados canónicamente a `Content Creator`.

---

### 5.13 Creatividad & Campañas — Creativa
- **ID:** `tmpl-creatividad-campanas` | **Categoría:** `campana_creativa` | **Clasificación:** 🟢 Base operativa confirmada
- **Horas Base:** 41.4 hrs | **Duración Estimada:** 4 semanas *(🔵 Propuesta técnica de cronograma)*
- **Área Gobernadora:** Creativa | **Total Actividades:** 20
- **Entregables y Resumen de Horas:**
  1. *Briefing & Descubrimiento de Campaña:* 6.0 hrs (`Client Relationship Strategist`, `Creative Strategy Lead`, `Digital Content Specialist`)
  2. *Conceptualización & Redacción de Campaña:* 9.0 hrs (`Digital Content Specialist`)
  3. *Diseño de Key Visual & Presentación:* 23.5 hrs (`Creative Designer`, `Digital Content Specialist`, `Creative Strategy Lead`)
  4. *Calidad, Ajustes & Entrega:* 2.9 hrs (`Creative Designer`, `Creative Strategy Lead`)
- **Notas de Gobernanza:** Desarrollo del gran concepto ("Big Idea"), dos rutas visuales de Key Visual, maquetación de PPT de alto nivel y entrega en plataforma de gestión.

---

### 5.14 Creativos de Pauta Digital — Creativa
- **ID:** `tmpl-creativos-pauta` | **Categoría:** `creativos_pauta` | **Clasificación:** 🟢 Base operativa confirmada
- **Horas Base:** 11.0 hrs | **Duración Estimada:** 2 semanas *(🔵 Propuesta técnica de cronograma)*
- **Área Gobernadora:** Creativa | **Total Actividades:** 15
- **Entregables y Resumen de Horas:**
  1. *Briefing & Redacción de Copies:* 3.0 hrs (`Client Relationship Strategist`, `Digital Content Specialist`)
  2. *Diseño Gráfico & Animación de Anuncios:* 6.1 hrs (`Creative Designer`)
  3. *Calidad, Ajustes & Entrega:* 1.9 hrs (`Creative Designer`, `Creative Strategy Lead`, `Client Relationship Strategist`)
- **Notas de Gobernanza:** Pack ágil de creativos publicitarios orientados a conversión y pruebas A/B de pauta con entrega directa al área de Growth.

---

### 5.15 Proyecto a la Medida (Scoping Abierto)
- **ID:** `tmpl-custom-blank` | **Categoría:** `custom` | **Clasificación:** 🔵 Propuesta técnica *(Claramente diferenciada de la fuente canónica)*
- **Horas Base:** 12.0 hrs iniciales *(ampliables según el alcance en New Business)*
- **Objetivo:** Estructura modular abierta para dimensionar desarrollos a la medida, consultorías técnicas o integraciones especiales sin alterar las plantillas fijas de la fuente.
- **Entregables y Actividades Base:**

| Entregable | Actividad | Rol Canónico | Horas | Notas de Gobernanza |
|---|---|---|---|---|
| **1. Definición & Discovery** | Taller de Discovery & Levantamiento Funcional | Product Lead | 8.0 h | Entrevistas con stakeholders y criterios de aceptación. |
| | Definición de arquitectura y requerimientos técnicos | Pendiente de definición | 4.0 h | Modelado técnico e integraciones especiales *(Rol modular)*. |

---

## 6. Enlace a la Especificación Maestra

Para detalles complementarios sobre el modelo de datos relacional, el desacoplamiento en New Business, la Calculadora Comercial y los lineamientos de arquitectura:
- Consulte la especificación completa en [`ORBIT_PRODUCT_STATUS.md`](./ORBIT_PRODUCT_STATUS.md).
