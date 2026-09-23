# ORBIT — Especificación Funcional Maestra de Producto y Arquitectura de Dominio

> **Documento:** Especificación Funcional Maestra para Portabilidad, Backend y Modelo de Datos  
> **Destinatario Técnico Principal:** Indunova (Backend Django REST Framework / PostgreSQL) y Equipo de Producto Uhura Group  
> **Fecha de Actualización:** Septiembre 2026  
> **Versión:** 3.0.0 (Master Functional Freeze Document)  
> **Estado:** Especificación Maestra Canónica — Fuente de Verdad Funcional de Orbit  

---

## Índice General

1. [Propósito del Documento y Concepto de Freeze Funcional](#1-propósito-del-documento-y-concepto-de-freeze-funcional)
2. [Frontera de Sistemas y Triángulo de Responsabilidades](#2-frontera-de-sistemas-y-triángulo-de-responsabilidades)
3. [Navegación del Sistema y Consolidación de Módulos](#3-navegación-del-sistema-y-consolidación-de-módulos)
4. [Mapa Macro de Dependencias y Ciclo de Vida](#4-mapa-macro-de-dependencias-y-ciclo-de-vida)
5. [Especificación Funcional por Módulo](#5-especificación-funcional-por-módulo)
   - [Módulo 1: New Business (Entrada Comercial y Gobernanza)](#módulo-1-new-business)
   - [Módulo 2: Catálogo de Servicios y Plantillas de Producto](#módulo-2-catálogo-de-servicios-y-plantillas-de-producto)
   - [Módulo 3: Alcance & Backlog (Scoping de Entregables y Actividades)](#módulo-3-alcance--backlog)
   - [Módulo 4: Calculadora Comercial y Motor Financiero](#módulo-4-calculadora-comercial-y-motor-financiero)
   - [Módulo 5: Cotización / Propuesta Económica (Quotes)](#módulo-5-cotización--propuesta-económica)
   - [Módulo 6: Documentos y Repositorio Google Drive](#módulo-6-documentos-y-repositorio-google-drive)
   - [Módulo 7: Statement of Work (SOW Contractual)](#módulo-7-statement-of-work-sow-contractual)
   - [Módulo 8: Formalización y Condiciones de Inicio (Gates)](#módulo-8-formalización-y-condiciones-de-inicio-gates)
   - [Módulo 9: Clientes (Cuentas y Entidades Fiscales)](#módulo-9-clientes)
   - [Módulo 10: Administración Fiscal y Frontera con Alegra](#módulo-10-administración-fiscal-y-frontera-con-alegra)
   - [Módulo 11: Proyectos (Estructura Operativa y Ciclos)](#módulo-11-proyectos)
   - [Módulo 12: Entregables (Componentes Operativos)](#módulo-12-entregables)
   - [Módulo 13: Tareas (Unidad Atómica de Trabajo)](#módulo-13-tareas)
   - [Módulo 14: Staffing y Asignaciones](#módulo-14-staffing-y-asignaciones)
   - [Módulo 15: Capacidad del Equipo](#módulo-15-capacidad-del-equipo)
   - [Módulo 16: Time Tracking (Registro de Tiempo)](#módulo-16-time-tracking)
   - [Módulo 17: Mi Día (Home Contextual)](#módulo-17-mi-día)
   - [Módulo 18: Bucky y La Colonia (Copiloto y Gamificación)](#módulo-18-bucky-y-la-colonia)
6. [Integraciones Externas: Arquitectura y Comportamiento](#6-integraciones-externas-arquitectura-y-comportamiento)
7. [Matriz Global de Portabilidad por Módulo](#7-matriz-global-de-portabilidad-por-módulo)
8. [Auditoría de Inconsistencias entre Prototipo UI y Especificación](#8-auditoría-de-inconsistencias-entre-prototipo-ui-y-especificación)
9. [Gaps de Portabilidad y Plan de Cierre](#9-gaps-de-portabilidad-y-plan-de-cierre)
10. [Roles, Niveles de Acceso y Matriz de Permisos (RBAC)](#10-roles-niveles-de-acceso-y-matriz-de-permisos-rbac)

---

## 1. Propósito del Documento y Concepto de Freeze Funcional

Este documento constituye la **especificación funcional y de arquitectura de dominio maestra** de Orbit. Ha sido estructurado específicamente para que el equipo de backend e infraestructura (**Indunova**) disponga del diseño relacional, reglas invariantes, contratos de transferencia y fronteras de integración necesarios para construir la persistencia en PostgreSQL y los servicios REST en Django.

### Definición de Freeze Funcional
> **El "Freeze Funcional" NO significa que todas las pantallas estén visualmente terminadas o que no puedan pulirse detalles estéticos de UI.**  
> Significa que **la topología de entidades, las relaciones, las reglas de negocio, los estados de transición, la persistencia requerida y las fronteras con sistemas externos quedan congelados y formalizados**. Ningún cambio posterior alterará la lógica de datos aquí establecida sin un proceso formal de control de versiones.

### Clasificación de Componentes para Portabilidad:
1. **Core para Portabilidad (Crítico):** Bloquea la base de datos y los flujos indispensables de negocio. Debe implementarse con máxima prioridad (Clientes, Proyectos, Entregables, Tareas, New Business, Quotes, Time Tracking, Capacidad).
2. **UI Liviana / Transaccional Simple:** Puede operar con endpoints CRUD básicos mientras el frontend maneja la interactividad (Plantillas de Producto, Documentos/Drive Links, SOW).
3. **Evolutivo / No Bloqueante:** Funcionalidades de enriquecimiento que no deben demorar la migración del backend transaccional (La Colonia, Bucky Inteligente, Webhooks automáticos con HubSpot/Alegra).

---

## 2. Frontera de Sistemas y Triángulo de Responsabilidades

Orbit **no es un CRM generalista ni un ERP contable**. Su frontera funcional está delimitada por tres sistemas:

```
           ┌─────────────────────────────────────────┐
           │        HUBSPOT (CRM Comercial)          │
           │ • Prospección, Leads, Deals             │
           │ • Pipeline de Ventas, Etapas Comerciales│
           │ • Actividades comerciales (mails, calls)│
           │ • SOURCE OF TRUTH COMERCIAL             │
           └────────────────────┬────────────────────┘
                                │ (Handoff por Brief o Deal Ganado)
                                ▼
           ┌─────────────────────────────────────────┐
           │       ORBIT (Operating System)          │
           │ • Dimensionamiento Técnico (Backlog)    │
           │ • Horas por Rol y Costos Variables      │
           │ • Cotización y Bandas de Margen         │
           │ • Generación de SOW y Formalización     │
           │ • Proyectos, Entregables y Tareas       │
           │ • Staffing, Capacidad y Time Tracking   │
           │ • SOURCE OF TRUTH OPERATIVO & ALCANCE   │
           └────────────────────┬────────────────────┘
                                │ (Handoff al Facturar)
                                ▼
           ┌─────────────────────────────────────────┐
           │         ALEGRA (ERP / Contabilidad)     │
           │ • Tercero Fiscal, NIT / RUT Validado    │
           │ • Facturación Electrónica DIAN          │
           │ • Cartera, Cobranza y Cuentas x Pagar   │
           │ • SOURCE OF TRUTH FISCAL Y TRIBUTARIO   │
           └─────────────────────────────────────────┘
```

* **HubSpot:** Dueño de la relación comercial.
* **Orbit:** Dueño del alcance, dimensionamiento técnico, horas, cotización, proyecto y ejecución.
* **Alegra:** Dueño de la facturación, los impuestos y el recaudo.
* **Google Drive:** Repositorio pasivo de archivos y entregables.

---

## 3. Navegación del Sistema y Consolidación de Módulos

Para eliminar redundancias cognitivas y reflejar el flujo real de trabajo, la barra de navegación lateral (Sidebar) se consolida en la siguiente estructura oficial:

### Estructura Vigente del Sidebar:
```
OPERACIÓN
  ├─ Mi Día (Home Contextual por Rol)
  ├─ Proyectos (Directorio Operativo, Fichas y Ciclos de Fee)
  ├─ Tareas (Listado / Kanban Operativo)
  ├─ Horas (Time Tracking y Auditoría de Time Logs)
  └─ Capacidad (Matriz de Carga Planificada vs. Ejecución)

COMERCIAL / PROPUESTAS
  ├─ Clientes (Marcas, Contactos y Fichas Administrativas)
  ├─ New Business (Pipeline Técnico: Resumen, Alcance, Cotización, SOW, Historial)
  └─ Catálogo de Servicios (Biblioteca de Plantillas Maestras de Producto)

EXPERIENCIA
  └─ La Colonia (Simulador / Gamificación de Productividad)

ADMINISTRACIÓN
  ├─ Equipo & Roles (Catálogo de Tarifas y Configuración de Personal)
  └─ Ajustes de Sistema
```

> **DECISIÓN DE CONSOLIDACIÓN:**  
> **El módulo antes denominado "Cotizador" NO existe como elemento independiente en el sidebar.** La cotización es una vista/fase interna que vive dentro de la oportunidad en **New Business**. No tiene sentido cotizar en el vacío sin un brief o cliente asociado.

---

## 4. Mapa Macro de Dependencias y Ciclo de Vida

El flujo lineal de la información a través del sistema se rige por la siguiente cadena de valor:

```text
[HUBSPOT: Brief Recibido & Necesidad de Scoping Técnico]
         │
         ▼
[1. New Business: Registro de Oportunidad]
         │
         ├───────────────────────────────┐
         ▼                               ▼
[2. Catálogo de Servicios]     [Creación desde Cero]
         │                               │
         └───────────────┬───────────────┘
                         ▼
[3. Alcance & Backlog: Entregable → Actividad → Rol → Horas]
                         │
                         ▼
[4. Calculadora Comercial: Horas x Rol + Overhead Uhura + Margen + IVA]
                         │
                         ▼
[5. Cotización (Quote): V1, V2... Snapshot Inmutable]
                         │
                         ▼
[6. SOW: Generación Contractual (Sin exponer tarifas ni horas internas)]
                         │
                         ▼
[7. Formalización: SOW Firmado + Anticipo Configurado (Gates de Inicio)]
                         │
                         ▼ (Evento de Conversión)
[8. Cliente Operativo] ──┼──► [9. Proyecto en Orbit (Código ej. ECO-42)]
                         │                    │
                         │                    ▼
                         │            [10. Entregables del Proyecto]
                         │                    │
                         │                    ▼
                         │            [11. Tareas Atómicas (To Do, sin asignar)]
                         │                    │
                         │                    ▼
                         │            [12. Staffing: Rol Cotizado ➔ Persona Real]
                         │                    │
                         │                    ▼
                         │            [13. Capacidad: Planificada vs. Disponible]
                         │                    │
                         │                    ▼
                         │            [14. Time Tracking: Start/Stop ➔ TimeLog]
                         │                    │
                         ▼                    ▼
               [15. Auditoría Vivian]   [16. Rollup Horas Cotizadas vs Reales]
                         │
                         ▼
               [17. Alegra: Facturación]
```

---

## 5. Especificación Funcional por Módulo

---

### Módulo 1: New Business

#### 1.1 Propósito
Espacio centralizado donde los líderes técnicos y de producto reciben oportunidades desde el área comercial (briefs), dimensionan el alcance técnico, generan cotizaciones, gestionan el SOW y las condiciones de inicio, y ejecutan la conversión formal a proyectos operativos.
- **Referencias de Código:**
  - **Vista Principal:** [`src/components/taskflow/newbusiness/NewBusinessView.tsx`](../components/taskflow/newbusiness/NewBusinessView.tsx)
  - **Scoper de Alcance:** [`src/components/taskflow/newbusiness/BacklogScoper.tsx`](../components/taskflow/newbusiness/BacklogScoper.tsx)
  - **Calculadora Financiera:** [`src/components/taskflow/newbusiness/FinancialCalculatorView.tsx`](../components/taskflow/newbusiness/FinancialCalculatorView.tsx)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`NewBusinessOpportunity`, `QuoteProposal`, `QuoteDeliverable`, `QuoteBacklogItem`)

#### 1.2 Usuarios y Roles
- **Product Lead / Creative Strategy Lead / Growth Manager / CEO:** Dimensionamiento técnico de entregables y actividades.
- **Directora Comercial:** Supervisión de márgenes, bandas de negociación y creación de nuevas versiones de cotización.
- **Vivian (Administración):** Validación de datos de facturación previa a la emisión fiscal.

#### 1.3 Estado Actual
**Implementado en Frontend / Parcial para Backend.**  
La navegación por pestañas (`Resumen & Brief`, `Alcance & Backlog`, `Cotización`, `Documentos`, `Historial`) está operativa con reactividad en estado local. Falta persistencia en base de datos.

#### 1.4 Entidades y Campos Principales
- **`NewBusinessOpportunity`:**
  - `id`: UUID (ej. `opp-2026-001`).
  - `title`: String (Nombre del requerimiento/proyecto).
  - `prospectAccountName`: String (Nombre de la empresa prospecto).
  - `clientId`: UUID (Opcional, si el cliente ya existe en Orbit).
  - `leadUserId` / `leadUserName`: String (Líder asignado: *Product Lead, Creative Strategy Lead, Growth Manager, CEO, Directora Comercial*).
  - `contactName`, `contactEmail`, `contactPhone`: String.
  - `hubspotDealId`, `hubspotDealUrl`: String (Identificador en HubSpot).
  - `briefUrl`: String (URL al documento de Google Drive).
  - `driveFolderUrl`: String (URL de la carpeta del prospecto).
  - `status`: Enum (`discovery` | `scoping` | `quoting` | `negotiation` | `won` | `lost` | `abandoned`).
  - `formalizationStatus`: Enum (`pendiente_formalizacion` | `listo_para_onboarding` | `activo`).
  - `quotes`: Array de `QuoteProposal`.
  - `startConditions`: `StartConditionsConfig`.
  - `administrativeChecklist`: `AdministrativeChecklist`.
  - `sowData`: `SowDocumentData`.
  - `convertedProjectId`: UUID (Opcional, enlace al proyecto generado).
  - `convertedAt`: Timestamp ISO.

#### 1.5 Reglas de Negocio
1. **Autonomía Multi-Quote:** Una oportunidad puede contener N cotizaciones. El cliente puede aprobar una y descartar otra.
2. **Gobernanza de Horas de Preventa:** El tiempo dedicado a dimensionar la oportunidad nunca se factura al cliente ni se resta del presupuesto vendido. Se imputa internamente a `Cliente: UHURA Group`, `Proyecto: New Business`.
3. **Trigger de Entrada (Brief Calificado + Necesidad de Scoping):** New Business se activa **únicamente cuando se recibe un Brief comercial en HubSpot y surge la necesidad de realizar un dimensionamiento técnico de alcance (scoping) y costeo operativo**. NO se dispara por el mero hecho de 'ganar' un deal comercial, ni gestiona prospección comercial en frío.

---

### Módulo 2: Catálogo de Servicios y Plantillas de Producto

#### 2.1 Propósito
Biblioteca centralizada de plantillas maestras de servicios estandarizados de Uhura Group, gobernada por el área de Producto para asegurar consistencia en estimaciones.
- **Referencias de Código:**
  - **Especificación Completa del Catálogo:** [`src/docs/SERVICE_CATALOG.md`](./SERVICE_CATALOG.md)
  - **Datos de Plantillas Maestra:** [`src/components/taskflow/templates/templateData.ts`](../components/taskflow/templates/templateData.ts)
  - **Motor de Recálculo Recursivo:** [`src/components/taskflow/templates/templateEngine.ts`](../components/taskflow/templates/templateEngine.ts)
  - **Interfaz de Biblioteca:** [`src/components/taskflow/templates/TemplateLibraryView.tsx`](../components/taskflow/templates/TemplateLibraryView.tsx)
  - **Modal de Clonación Desacoplada:** [`src/components/taskflow/templates/CloneToQuoteModal.tsx`](../components/taskflow/templates/CloneToQuoteModal.tsx)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`ProductBacklogTemplate`, `STANDARD_UHURA_ROLES`)

#### 2.2 Catálogo Oficial de Servicios (Normalizado 2026)
Fuente: *"FORMATO DE PROCESO DE ÁREA UHURA (2026) - PRODUCTO DIGITAL"*

| Servicio / Plantilla | Horas Totales | Entregables Clave | Roles Involucrados (Canónicos) | Duración Est. |
|---|---|---|---|---|
| **Landing Page WordPress / Webflow** | 31.0 hrs | Onboarding & Insumos, UX & Contenido, Implementación & Analítica, Entrega & Soporte | Product Lead, Digital Content Specialist, Front-End Dev | 3 semanas |
| **Sitio Web Informativo WordPress** | 140.0 hrs | Kick-off & Discovery, UX & Contenido & Gate 1, Implementación & Gate 2, Analítica & Go Live, Entrega & Soporte | Client Relationship Strategist, Product Lead, Digital Content Specialist, Creative Designer, Front-End Dev | 8 semanas |
| **Mantenimiento Web WordPress** | 9.0 hrs/mes | Análisis, Diagnóstico & Backups, Actualizaciones & Seguridad, Ajustes Menores & Soporte | Front-End Dev, Client Relationship Strategist | 4 semanas (recurrente) |
| **Tienda Online Shopify (hasta 20 SKUs)** | 116.0 hrs | Kick-off & Arquitectura, Contenido & Banners, Setup & Config Comercial, Template & UI, Catálogo, QA & Go Live, Entrega | Client Relationship Strategist, Product Lead, Digital Content Specialist, Creative Designer, Digital Designer, Front-End Dev | 8 semanas |
| **Chatbot con ManyChat (WhatsApp API / IG)** | 46.5 hrs | Kick-off & Flujos, Gestión Meta & WhatsApp API, Config ManyChat & Triggers, Entrega & Soporte | Product Lead, Client Relationship Strategist, Digital Content Specialist, Front-End Dev | 4 semanas |
| **Tienda Oficial en Mercado Libre** | 42.0 hrs | Fase 0 – Kickoff & Alcance, Setup Tienda ML, Publicación, Validación & Capacitación | Product Lead, Client Relationship Strategist, Digital Content Specialist, Digital Designer, Creative Designer | 4 semanas |
| **Digital Shelf (Optimización PDPs)** | 5.5 hrs | Gestión & Diagnóstico, Contenido & SEO, Optimización de Imágenes (hasta 5 PDPs) | Client Relationship Strategist, Product Lead, Digital Content Specialist, Creative Designer | 2 semanas |
| **Proyecto a la Medida (Personalizable)** | 12.0 hrs (base) | Discovery Técnico & Levantamiento Funcional, Arquitectura | Product Lead, Pendiente de definición técnica | 6 semanas |

#### 2.3 Entidades y Campos Principales
- **`ProductBacklogTemplate`:**
  - `id`: UUID.
  - `name`: String (ej. *Sitio Web Informativo WordPress*).
  - `category`: `ProductBacklogTemplateCategory` (`wordpress`, `landing_page`, `mantenimiento_web`, `shopify`, `chatbot_manychat`, `mercado_libre`, `digital_shelf`, `custom`).
  - `version`: String (ej. `2026.1`).
  - `deliverables`: Array de `TemplateDeliverable`:
    - `id`: UUID.
    - `name`: String (Nombre del entregable).
    - `orderIndex`: Integer.
    - `activities`: Array de `TemplateBacklogItem`:
      - `id`: UUID.
      - `title`: String.
      - `roleId`: String (FK a `STANDARD_UHURA_ROLES`).
      - `roleName`: String.
      - `estimatedHours`: Decimal.

#### 2.4 Reglas de Negocio
1. **Independencia de Snapshot:** Al importar una plantilla a una cotización en New Business, se genera una copia desacoplada. Las modificaciones que haga el líder técnico en la cotización NO alteran la plantilla maestra, y futuros cambios en la plantilla maestra NO alteran cotizaciones ya creadas.
2. **Flujo "Usar en New Business" y Asociación Previa Obligatoria:** La plantilla no genera cotizaciones huérfanas en el vacío ni en estados paralelos. La oportunidad debe existir previamente antes de persistir la cotización: el usuario selecciona una oportunidad existente en New Business o crea una nueva a partir de un Brief/prospecto, asignando `opportunityId` antes de finalizar la cotización.
3. **Roles Estándar Obligatorios:** Las plantillas solo pueden construirse con roles del catálogo oficial de Uhura (`STANDARD_UHURA_ROLES`). Nombres informales (*"diseñador web"*, *"redactor"*, *"developer"*, *"tracfiker"*) han sido normalizados a sus respectivos 12 roles canónicos (*"Digital Designer"*, *"Digital Content Specialist"*, *"Front-End Dev"*, *"Client Relationship Strategist"*, *"Trafficker Media"*).
4. **Cálculo Recursivo de Horas:** Toda plantilla recalcula automáticamente sus horas por actividad, horas acumuladas por entregable y total de horas por rol usando [`recalculateTemplateHours`](../components/taskflow/templates/templateEngine.ts).

---

### Módulo 3: Alcance & Backlog

#### 3.1 Propósito
Constructor jerárquico de la ingeniería de la propuesta técnica. Permite a los líderes desglosar el servicio en Entregables y Actividades concretas con asignación de rol y presupuesto de horas.
- **Referencias de Código:**
  - **Componente Scoper de Backlog:** [`src/components/taskflow/newbusiness/BacklogScoper.tsx`](../components/taskflow/newbusiness/BacklogScoper.tsx)
  - **Tipos de Datos:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`QuoteDeliverable`, `QuoteBacklogItem`)

#### 3.2 Estructura Jerárquica y Objetos
```text
Entregable (Servicio / Frente)
  └─ Actividad (QuoteBacklogItem)
       ├─ Rol Presupuestado (budgetedRoleId)
       └─ Horas Estimadas (estimatedHours)
```
- **`QuoteDeliverable`:**
  - `id`: UUID.
  - `name`: String.
  - `description`: String.
  - `taxClassification`: Enum (`tax_exempt_software` | `standard_vat_19`).
  - `backlogItems`: Array de `QuoteBacklogItem`:
    - `id`: UUID.
    - `title`: String.
    - `roleId`: String.
    - `estimatedHours`: Decimal.
    - `orderIndex`: Integer.

#### 3.3 Reglas de Negocio
1. **Rollup Dinámico:** La sumatoria de horas por rol y horas globales del proyecto se recalcula en tiempo real en frontend y debe ser revalidada por backend en cada guardado.
2. **Preparación para Ejecución:** Cada actividad del backlog está diseñada para transformarse 1:1 en una tarea atómica del proyecto operativo al momento de la conversión.

---

### Módulo 4: Calculadora Comercial y Motor Financiero

#### 4.1 Propósito
Motor de pricing y rentabilidad que traduce las horas técnicas estructuradas en el backlog a una propuesta comercial económicamente viable y rentable para Uhura Group.
- **Referencias de Código:**
  - **Motor de Cálculo Financiero:** [`src/components/taskflow/financial/financialEngine.ts`](../components/taskflow/financial/financialEngine.ts)
  - **Constantes y Tarifario Salarial:** [`src/components/taskflow/financial/constants.ts`](../components/taskflow/financial/constants.ts) (`UHURA_ROLE_FINANCIAL_RATES`, `FINANCIAL_CONSTANTS`)
  - **Interfaz de Calculadora:** [`src/components/taskflow/newbusiness/FinancialCalculatorView.tsx`](../components/taskflow/newbusiness/FinancialCalculatorView.tsx)
  - **Tipos Financieros:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`QuoteFinancialSummary`, `QuoteFinancialConfig`)

#### 4.2 Fuente de Verdad Financiera: Status Actual
> **ADVERTENCIA CRÍTICA PARA BACKEND (INDUNOVA):**  
> **La fuente de verdad financiera hoy sigue siendo el Google Sheet oficial de la "Calculadora Comercial UHURA 2026".**  
> El código actual de Orbit (`financialEngine.ts`) representa un prototipo funcional avanzado de esa lógica. Mientras Finanzas y Dirección General de Uhura no firmen la validación final de fórmulas y constantes, **las reglas financieras no deben considerarse pétreas y deben exponerse como parámetros configurables en backend**, nunca como constantes `const` fijas en código.

#### 4.3 Clasificación de Reglas Financieras

| Categoría | Concepto | Estado Actual | Regla de Implementación |
|---|---|---|---|
| **Regla Confirmada** | Costo Directo de Personal | Confirmada | Costo Salarial Base x 1.54 (54% de carga prestacional y aportes patronales en Colombia). |
| **Regla Confirmada** | Gobernanza de Margen | Confirmada | Margen Deseado: 40%. Margen Mínimo: 35%. Margen Máximo: 50%. Si margen < 35%, se activa alerta roja y bandera de aprobación obligatoria (`requiresApproval: true`). |
| **Regla Inferida (Sheet)** | Overhead Fijo Semanal | En validación | Sheet calcula gastos de estructura proporcionales a las semanas de ejecución. En Orbit está modelado sobre base de tarifa semanal prorrateada según porcentaje de dedicación. |
| **Regla Inferida (Sheet)** | Tratamiento de IVA | En validación | Software/Desarrollo web puro exento de IVA por normativa colombiana de exportación/servicios TIC; diseño y consultoría gravados al 19%. Orbit permite clasificación por entregable. |
| **Regla Confirmada** | TRM Dinámica e Integración Bancaria | Confirmada | Integración con API oficial de la Superfinanciera / Banco de la República vía cron job diario en el backend de Indunova. Debe admitir **override manual** por parte del equipo comercial en la cotización para fijar una tasa de cierre acordada con el cliente. |
| **Pendiente de Validar** | Modalidad Bolsa de Horas | Pendiente | El sheet maneja proyectos cerrados y fees mensuales. La bolsa de horas pura por tickets no está formalizada financieramente. |

#### 4.4 Inputs y Outputs del Motor Financiero
- **Inputs:**
  - Desglose de horas por rol desde el Backlog (`Record<roleId, hours>`).
  - Semanas de duración del proyecto (`projectDurationWeeks`).
  - Margen objetivo (`targetMarginPercentage`: ej. 40%).
  - Clasificación fiscal de entregables (Exento / Gravado 19%).
  - Moneda de cotización (`COP`, `USD`, `MXN`, `BRL`, `INR`).
- **Outputs (`QuoteFinancialSummary`):**
  - `totalDirectLaborCostCOP`: Costo salarial total + factor 1.54.
  - `overheadContributionCOP`: Aporte proporcional a costos fijos de Uhura.
  - `totalCostCOP`: Costo total (Labor + Overhead).
  - `subtotalBeforeTaxCOP`: Precio de venta antes de impuestos.
  - `ivaAmountCOP`: Impuesto calculado sobre entregables gravados.
  - `finalPriceWithTaxCOP`: Precio final facturable en COP.
  - `targetCurrency`: Moneda seleccionada y valores convertidos.
  - `marginHealth`: Semáforo de rentabilidad (`healthy` | `warning` | `critical`).

---

### Módulo 5: Cotización / Propuesta Económica (Quotes)

#### 5.1 Propósito
Documento comercial y financiero formal que se presenta al cliente. Es el contenedor del snapshot de alcance y pricing.
- **Referencias de Código:**
  - **Modal de Versiones de Cotización:** [`src/components/taskflow/newbusiness/QuoteVersioningModal.tsx`](../components/taskflow/newbusiness/QuoteVersioningModal.tsx)
  - **Vista de Presentación Comercial (PDF/Web):** [`src/components/taskflow/newbusiness/QuotePresentationView.tsx`](../components/taskflow/newbusiness/QuotePresentationView.tsx)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`QuoteProposal`, `QuoteStatus`)

#### 5.2 Entidades y Campos Principales
- **`QuoteProposal`:**
  - `id`: UUID.
  - `opportunityId`: UUID (FK a `NewBusinessOpportunity`).
  - `versionLabel`: String (ej. `V1`, `V2 - Alcance Ajustado`).
  - `status`: Enum (`draft` | `internal_review` | `sent` | `approved` | `rejected` | `archived`).
  - `deliverables`: Array de `QuoteDeliverable` (Snapshot independiente).
  - `financialConfig`: Parámetros de cálculo utilizados.
  - `financialSummary`: Resultados financieros calculados.
  - `approvalNotes`: String.
  - `totalQuotedValueCOP`: Decimal.
  - `totalHoursRollup`: Decimal.

#### 5.3 Reglas de Negocio
1. **Pertenencia Estricta a NewBusinessOpportunity (Única Fuente de Verdad):** Toda entidad `QuoteProposal` pertenece obligatoria e indisolublemente a una `NewBusinessOpportunity` vía `opportunityId`. Se prohíbe terminantemente la creación de cotizaciones huérfanas o la persistencia en estados paralelos de quotes (`createdQuotes`). La persistencia se realiza exclusivamente dentro del array `quotes` de la oportunidad correspondiente.
2. **Inmutabilidad del Snapshot:** Al aprobarse una cotización, su contenido queda congelado. No puede editarse; si el cliente pide cambios, se crea una nueva versión (`V2`).
3. **Aprobación Selectiva:** Múltiples cotizaciones aprobadas para una misma cuenta pueden agruparse en un único proyecto o dar origen a proyectos separados según decisión comercial.

---

### Módulo 6: Documentos y Repositorio Google Drive

#### 6.1 Propósito
Gobernanza y trazabilidad de los archivos asociados a la oportunidad y al proyecto, estructurados bajo el estándar de carpetas de Uhura Group.
- **Referencias de Código:**
  - **Pestaña Documental en New Business:** [`src/components/taskflow/newbusiness/DocumentsDriveTab.tsx`](../components/taskflow/newbusiness/DocumentsDriveTab.tsx)

#### 6.2 Estructura Estándar de Carpetas (Uhura Drive)
Toda oportunidad y proyecto en Orbit se organiza bajo la siguiente convención:
```text
PROSPECTOS / [Nombre Empresa] (en fase comercial)
  └─ CLIENTES / [Nombre Empresa] / [Código Proyecto] (al ganar el negocio)
       ├─ 00. BRIEF (Brief del cliente, requerimientos, minutas de discovery)
       ├─ 01. PROPUESTAS COMERCIALES (Versiones de cotización, PDF de propuesta)
       ├─ 02. DOCUMENTOS ADMINISTRATIVOS (SOW firmado, contrato marco, RUT, Cédula)
       └─ 03. INSUMOS (Manuales de marca, accesos, assets del cliente)
```

#### 6.3 Comportamiento Actual vs. Integración Futura
- **Hoy (Manual):** El usuario pega los links a la carpeta y al brief en campos de texto de la UI.
- **Backend Futuro (Google Drive API):**
  - Al crear el prospecto en Orbit, un worker de backend creará automáticamente la carpeta en Drive con la estructura `00..03` y guardará los `folderId` en Orbit.
  - Al ganar el proyecto, el backend moverá la carpeta desde `PROSPECTOS` hacia `CLIENTES / [Nombre Empresa]`.

---

### Módulo 7: Statement of Work (SOW Contractual)

#### 7.1 Propósito
Generador de la plantilla contractual técnica entre Uhura Group y el Cliente, extraída directamente del alcance aprobado en la cotización activa.
- **Referencias de Código:**
  - **Modal Generador de SOW:** [`src/components/taskflow/newbusiness/SowDocumentModal.tsx`](../components/taskflow/newbusiness/SowDocumentModal.tsx)
  - **Tipos de Datos:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`SowDocumentData`)

#### 7.2 Regla de Oro de Confidencialidad Operativa
> **REGLA ESTRICTA DE GOBERNANZA:**  
> **El SOW NUNCA debe exponer horas internas por rol ni tarifas salariales al cliente.**  
> El SOW expone: Objetivos, Entregables Formales, Actividades Contempladas, Cronograma en Semanas, Exclusiones Expresas, Inversión Total y Esquema de Pagos. El desglose de horas por rol y costo de nómina es secreto industrial y operativo exclusivo de Uhura.

#### 7.3 Entidad y Campos (`SowDocumentData`)
- `objective`: Text (Objetivo del servicio redactado para contrato).
- `scopeDeliverablesSummary`: Array de entregables y actividades visibles para el cliente.
- `timelineWeeks`: Integer (Duración estimada del servicio).
- `totalInvestmentCOP`: Decimal (Monto acordado).
- `paymentTerms`: Text (ej. *50% anticipo al kick-off, 50% contra entrega final*).
- `exclusions`: Text (Lo que no incluye el servicio).
- `clientResponsibilities`: Text (Insumos, accesos y aprobaciones que debe dar el cliente).
- `governanceNotes`: Text (Reglas sobre cambios de alcance o SLAs).

---

### Módulo 8: Formalización y Condiciones de Inicio (Gates)

#### 8.1 Propósito
Asegurar que la operación no arranque a ciegas, pero sin generar bloqueos burocráticos innecesarios que deterioren la experiencia del cliente o del equipo.
- **Referencias de Código:**
  - **Modal Condiciones de Inicio:** [`src/components/taskflow/newbusiness/StartConditionsModal.tsx`](../components/taskflow/newbusiness/StartConditionsModal.tsx)
  - **Modal Checklist Administrativo:** [`src/components/taskflow/newbusiness/AdministrativeChecklistModal.tsx`](../components/taskflow/newbusiness/AdministrativeChecklistModal.tsx)
  - **Modal Conversión a Proyecto:** [`src/components/taskflow/newbusiness/ConvertOpportunityModal.tsx`](../components/taskflow/newbusiness/ConvertOpportunityModal.tsx)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`StartConditionsConfig`, `AdministrativeChecklist`, `FormalizationStatus`)

#### 8.2 Estados de Transición hacia Operación
```text
[Cotización Aprobada]
         │
         ▼
[Estado: Pendiente de Formalización] ──► (El proyecto ya existe en Orbit para configuración)
         │
         ├─ Gate 1: SOW / Contrato Firmado (Obligatorio)
         ├─ Gate 2: Anticipo Bancario Recibido (Configurable: Requerido en proyectos cerrados / No aplica en fees)
         │
         ▼ (Se cumplen Gates 1 y 2)
[Estado: Listo para Onboarding / Kick-off]
         │
         ├─ Gate 3: Documentación Fiscal (RUT/Cédula) ──► NO BLOQUEA OPERACIÓN (Trámite paralelo con Vivian)
         ├─ Gate 4: Sesión de Onboarding Realizada
         │
         ▼
[Estado: Activo] ──► (El equipo registra tiempo y ejecuta tareas con normalidad)
```

#### 8.3 Invariantes de Negocio
- **El RUT y la Cédula NO son bloqueantes para el inicio operativo.** Son requeridos por Vivian antes de emitir la factura legal en Alegra, pero el equipo de desarrollo/diseño puede arrancar discovery y sprints.
- **El anticipo es configurable por tipo de negocio:** En proyectos de alcance cerrado es típicamente el 50%; en servicios mensuales recurrentes (retainer / fee) puede establecerse como *No Aplica* (mes vencido o cobro recurrente).

---

### Módulo 9: Clientes

#### 9.1 Propósito
Entidad que representa la cuenta comercial, operativa y de marca sombrilla con la que trabaja Uhura Group.
- **Referencias de Código:**
  - **Vista Principal de Clientes:** [`src/components/taskflow/clients/ClientsView.tsx`](../components/taskflow/clients/ClientsView.tsx)
  - **Modal Nuevo Cliente:** [`src/components/taskflow/clients/NewClientModal.tsx`](../components/taskflow/clients/NewClientModal.tsx)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`ClientProfile`, `ClientContact`, `ClientTaxEntity`)

#### 9.2 Entidades y Campos Principales
- **`ClientProfile`:**
  - `id`: UUID.
  - `name`: String (Nombre de la marca o empresa, ej. *Ecopetrol*).
  - `status`: Enum (`active` | `onboarding` | `lead` | `inactive` | `archived`).
  - `driveFolderUrl`: String.
  - `primaryContact`: `ClientContact`.
  - `contacts`: Array de `ClientContact` (Nombre, Cargo, Email, Teléfono).
  - `taxEntities`: Array de `ClientTaxEntity` (Entidades fiscales jurídicas asociadas).
  - `createdAt`, `updatedAt`: Timestamp.
- **Cliente Especial Protegido:**
  - `UHURA Group` existe como cliente interno de sistema (`id: 'client-uhura-internal'`), donde se cargan proyectos de preventa, I+D, operaciones internas y administración. No puede ser borrado.

---

### Módulo 10: Administración Fiscal y Frontera con Alegra

#### 10.1 Propósito
Gestión de datos de facturación electrónica y articulación con el sistema contable Alegra.
- **Referencias de Código:**
  - **Modal de Entidades Fiscales y Facturación:** [`src/components/taskflow/clients/ClientTaxEntitiesModal.tsx`](../components/taskflow/clients/ClientTaxEntitiesModal.tsx)
  - **Checklist Administrativo Vivian:** [`src/components/taskflow/newbusiness/AdministrativeChecklistModal.tsx`](../components/taskflow/newbusiness/AdministrativeChecklistModal.tsx)
  - **Tipos Fiscales:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`ClientTaxEntity`, `AdministrativeChecklist`)

#### 10.2 Responsable y Flujo de Trabajo
- **Responsable en Uhura:** Vivian (Administración & Finanzas).
- **Checklist Administrativo (`AdministrativeChecklist`):**
  - `rutStatus`: Enum (`pending` | `received` | `verified`).
  - `idCardStatus`: Enum (`pending` | `received` | `verified`).
  - `billingEmail`: String (Correo receptor de factura electrónica DIAN).
  - `alegraCreated`: Boolean (Marca si el tercero ya fue registrado en Alegra).
  - `alegraContactId`: String (ID del tercero en la base de datos de Alegra).

#### 10.3 Reglas de Integración con Alegra
1. **Orbit NO es un sistema de contabilidad:** Orbit no calcula balances contables, cuentas contables PUC, ni retenciones en la fuente complejas.
2. **Alegra es la Fuente de Verdad Fiscal:** Orbit solo necesita almacenar el `alegraContactId` del cliente y, a futuro, recibir el número de factura y estado de pago de los hitos cobrados.

---

### Módulo 11: Proyectos

#### 11.1 Propósito
Contenedor principal de la ejecución operativa, control de presupuesto de horas y entrega de valor al cliente.
- **Referencias de Código:**
  - **Vista Detalle de Proyecto:** [`src/components/taskflow/projects/ProjectDetailView.tsx`](../components/taskflow/projects/ProjectDetailView.tsx)
  - **Modal Nuevo Proyecto Operativo:** [`src/components/taskflow/NewProjectModal.tsx`](../components/taskflow/NewProjectModal.tsx)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`ProjectProfile`, `ProjectType`, `ProjectStatus`)

#### 11.2 Tipos de Proyecto
1. `fixed_project`: Proyecto de alcance cerrado (fecha inicio, fecha fin, entregables fijos, bolsa de horas cerrada).
2. `fee_monthly`: Servicio recurrente mensual (ciclos de facturación mensual, asignaciones estables de capacidad).
3. `internal_non_billable`: Proyectos internos de Uhura (preventa, diseño de marca propia, automatización).

#### 11.3 Entidades y Campos Principales
- **`ProjectProfile`:**
  - `id`: UUID.
  - `code`: String (Código corto de proyecto, ej. `ECO-42`, `ZAP-01`).
  - `name`: String.
  - `clientId`: UUID (FK a `ClientProfile`).
  - `type`: `ProjectType`.
  - `status`: Enum (`discovery` | `planning` | `in_progress` | `in_review` | `completed` | `paused` | `cancelled`).
  - `formalizationStatus`: Enum (`pendiente_formalizacion` | `listo_para_onboarding` | `activo`).
  - `startDate`, `endDate`: Date.
  - `leadUserId`: UUID (Líder del proyecto).
  - `soldHours`: Decimal (Total de horas vendidas según cotización aprobada).
  - `soldValueCOP`: Decimal (Valor económico del contrato).
  - `convertedFromOpportunityId`: UUID (Opcional, trazabilidad con New Business).
  - `deliverables`: Array de `ProjectDeliverable`.
  - `quoteSnapshots`: Array de `QuoteProposal` aprobadas que dieron origen al proyecto.

---

### Módulo 12: Entregables

#### 12.1 Propósito
Componente o fase operativa que agrupa un conjunto de tareas y un presupuesto específico de horas por rol.
- **Referencias de Código:**
  - **Vista y Lista de Entregables:** [`src/components/taskflow/projects/DeliverablesListView.tsx`](../components/taskflow/projects/DeliverablesListView.tsx)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`ProjectDeliverable`, `DeliverableRoleBudget`)

#### 12.2 Estructura y Rollup
- **`ProjectDeliverable`:**
  - `id`: UUID.
  - `projectId`: UUID.
  - `name`: String (ej. *Diseño UI/UX Sistema de Facturación*).
  - `description`: String.
  - `orderIndex`: Integer.
  - `status`: Enum (`pending` | `in_progress` | `review` | `completed`).
  - `budgetByRole`: Array de `DeliverableRoleBudget`:
    - `roleId`: String.
    - `quotedHours`: Decimal (Horas cotizadas en New Business).
    - `executedHours`: Decimal (Horas reales registradas vía TimeLog).
- **Métrica Clave de Control:**
  $$\text{Desviación de Horas} = \text{executedHours} - \text{quotedHours}$$

---

### Módulo 13: Tareas

#### 13.1 Propósito
Unidad atómica de trabajo ejecutable por el equipo.
- **Referencias de Código:**
  - **Componente Tarjeta de Tarea:** [`src/components/taskflow/tasks/TaskCard.tsx`](../components/taskflow/tasks/TaskCard.tsx)
  - **Modal Nueva Tarea:** [`src/components/taskflow/NewTaskModal.tsx`](../components/taskflow/NewTaskModal.tsx)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`Task`, `TaskStatus`, `TaskAssigneeAllocation`)

#### 13.2 Reglas Invariantes de Producto
1. **Sin Subtareas en MVP:** Para evitar dispersión y falta de control, la tarea es atómica. Si algo requiere división, se crean múltiples tareas bajo el mismo entregable.
2. **Conversión 1:1 desde New Business:** Cada actividad del backlog cotizado (`QuoteBacklogItem`) se convierte en una tarea con:
   - `status: 'todo'`
   - `estimatedHours = item.estimatedHours`
   - `budgetedRoleId = item.roleId`
   - `assigneeAllocations = []` (Nace sin persona física asignada).
3. **Multi-ejecutor:** Una tarea puede tener más de una persona asignada con distribución explícita de horas estimadas (`assigneeAllocations`).
4. **Estados Canónicos:**
   `todo` ➔ `in_progress` ➔ `in_review` ➔ `completed`
5. **Bloqueo:** Es un flag booleano (`isBlocked: true`) con campo de motivo (`blockReason`), no un estado de columna.
6. **Retrabajos:** Flag (`isRework: true`) para trazar desviaciones de calidad sin alterar el presupuesto original.

---

### Módulo 14: Staffing y Asignaciones

#### 14.1 Propósito
Asignación formal de personas del equipo a los proyectos, garantizando que el trabajo esté cubierto sin sobrecargar la capacidad.
- **Referencias de Código:**
  - **Matriz de Staffing:** [`src/components/taskflow/staffing/StaffingMatrixView.tsx`](../components/taskflow/staffing/StaffingMatrixView.tsx)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`ProjectAssignment`, `AssignmentNature`)

#### 14.2 Diferencia Crítica: Rol Cotizado vs. Persona Asignada
- **Rol Cotizado (`budgetedRoleId`):** Perfil conceptual presupuestado en New Business (ej. *Front-End Dev*, tarifa de costo nómina según tarifario).
- **Persona Real (`assignedUserId`):** Colaborador específico de la empresa (ej. *Juan Pérez*, desarrollador real contratado).
- Orbit permite comparar si la persona asignada coincide con el perfil cotizado o si hubo un cambio de seniorities que altere la rentabilidad real del proyecto.

#### 14.3 Entidad `ProjectAssignment`
- `id`: UUID.
- `projectId`: UUID.
- `userId`: UUID.
- `roleId`: String (Rol que asume en este proyecto).
- `nature`: Enum (`governance` | `core_execution` | `temporary_support`).
- `weeklyHours`: Decimal (Horas comprometidas por semana).
- `startDate`, `endDate`: Date.

---

### Módulo 15: Capacidad del Equipo

#### 15.1 Propósito
Visibilidad matemática de la disponibilidad real del equipo para asumir nuevos proyectos y evitar el burnout.
- **Referencias de Código:**
  - **Vista de Capacidad de Equipo:** [`src/components/taskflow/capacity/TeamCapacityView.tsx`](../components/taskflow/capacity/TeamCapacityView.tsx)
  - **Tipos de Capacidad:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`TeamMemberCapacity`)

#### 15.2 Reglas Fundamentales de Capacidad
1. **No a la Asunción Universal de 8 Horas Diarias:** Cada colaborador tiene una capacidad contractual y operativa configurada (ej. contratos de 40h semanales tienen típicamente 32h productivas y 8h de ceremonias/gestión interna).
2. **Ecuación Canónica de Capacidad:**
   $$\text{Capacidad Libre} = \text{Disponibilidad Neta} - \text{Carga Semanal Planificada (ProjectAssignments)}$$
3. **Fines de Semana:** No se consideran en la planificación de capacidad. Si alguien registra horas en sábado o domingo, se computa como ejecución real, pero nunca como disponibilidad proyectada.

---

### Módulo 16: Time Tracking (Registro de Tiempo)

#### 16.1 Propósito
Captura fidedigna y sin fricción de las horas realmente invertidas por el equipo en la ejecución de las tareas.

#### 16.2 Reglas Invariantes del Cronómetro
- **Referencias de Código:** [`src/components/taskflow/timer/GlobalTimerContext.tsx`](../components/taskflow/timer/GlobalTimerContext.tsx), [`src/components/taskflow/tasks/TaskCard.tsx`](../components/taskflow/tasks/TaskCard.tsx) y [`src/components/taskflow/timetracking/TimeTrackingView.tsx`](../components/taskflow/timetracking/TimeTrackingView.tsx).

1. **Todo TimeLog pertenece obligatoriamente a una Tarea:** No existe registro de tiempo "huérfano" en el vacío.
2. **Un Solo Timer Activo por Usuario:** El sistema solo permite tener un cronómetro activo o en pausa a la vez a nivel global. Si el usuario intenta iniciar un timer en la Tarea B mientras hay uno corriendo o pausado en la Tarea A, el sistema le exige detener o guardar el timer de la Tarea A.
3. **Ciclo de Vida Canónico del Timer (`Start ➔ Pause ↔ Resume ➔ Stop`):**
   - **Start:** Inicia el conteo de tiempo efectivo sobre la tarea seleccionada.
   - **Pause ↔ Resume:** El usuario puede pausar temporalmente el cronómetro ante interrupciones (reuniones rápidas, llamadas, almuerzo) y reanudarlo cuando retome la actividad.
   - **Regla Estricta de Pausa:** El tiempo transcurrido en estado `PAUSED` **NO suma ni cuenta como tiempo efectivo**. Al momento de guardar (`Stop`), solo se computan los segmentos de tiempo transcurridos en estado activo `RUNNING`.
   - **Stop:** Detiene el temporizador, calcula la sumatoria exacta de segundos efectivos, solicita una breve descripción del trabajo realizado y persiste el `TimeLog` en el backend.
4. **Registro Manual Retroactivo:** Siempre disponible para ingresos manuales (Tarea, Horas, Minutos, Fecha y Descripción obligatoria del trabajo realizado).
5. **Soporte Ad-hoc:** Una persona que no esté en el staffing oficial de un proyecto puede registrar un TimeLog en una tarea si prestó auxilio técnico puntual, sin romper las asignaciones estructurales.

---

### Módulo 17: Mi Día (Home Contextual)

#### 17.1 Propósito
Pantalla principal de inicio para todo usuario de Orbit, adaptada a su rol y prioridades de trabajo diario. Elimina la dispersión entre dashboards analíticos y listas de tareas.
- **Referencias de Código:**
  - **Vista Principal Mi Día:** [`src/components/taskflow/myday/MyDayView.tsx`](../components/taskflow/myday/MyDayView.tsx)

#### 17.2 Perspectivas por Rol
- **Colaborador / Operativo:** Tareas asignadas para hoy, tareas en revisión, timer activo, horas registradas hoy vs. planificadas restantes.
- **Líder de Proyecto / Product Lead:** Pulso de entregables, tareas bloqueadas de su equipo, solicitudes de revisión pendientes, desviaciones de horas.
- **Comercial / New Business:** Prospectos en cotización, propuestas por enviar, status de formalización.
- **Dirección (CEO / Operaciones):** Horas globales de la semana, proyectos en riesgo, capacidad disponible del equipo.

---

### Módulo 18: Bucky y La Colonia (Copiloto y Gamificación)

#### 18.1 Propósito
- **Bucky:** Asistente contextual de Orbit que acompaña la jornada laboral, alerta sobre timers olvidados, tareas bloqueadas y deadlines.
- **La Colonia:** Espacio visual optativo de gamificación donde la consistencia en el registro de horas y los hábitos saludables construyen un entorno virtual en equipo.
- **Referencias de Código:**
  - **Modal Copiloto Bucky:** [`src/components/taskflow/bucky/BuckyCopilotModal.tsx`](../components/taskflow/bucky/BuckyCopilotModal.tsx)
  - **Leaderboard La Colonia:** [`src/components/taskflow/colony/ColonyLeaderboardView.tsx`](../components/taskflow/colony/ColonyLeaderboardView.tsx)
  - **Assets de Bucky:** [`/public/bucky_*.png`](../../public/)

#### 18.2 Directrices Técnicas para Backend
- Bucky y La Colonia son componentes **Evolutivos / No Bloqueantes**.
- **No deben frenar la portabilidad ni la construcción del backend transaccional de Indunova.**
- Bucky consume eventos emitidos por el core (ej. `EVENT_TIMER_EXCEEDED_4H`, `EVENT_PROJECT_OVER_BUDGET`), no debe inventar lógica de negocio aislada.

---

## 6. Integraciones Externas: Arquitectura y Comportamiento

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MATRIZ DE INTEGRACIONES                                │
├─────────────┬───────────────────┬──────────────────────┬─────────────────┬─────────────┤
│ Sistema     │ Estado Actual     │ Datos que se Guardan │ Trigger Futuro  │ Riesgos     │
├─────────────┼───────────────────┼──────────────────────┼─────────────────┼─────────────┤
│ HubSpot     │ Manual en UI      │ `hubspotDealId`      │ Webhook Deal    │ Duplicidad  │
│ (CRM)       │ (pegar link / ID) │ `hubspotDealUrl`     │ "Won" en CRM    │ si se crea  │
│             │                   │                      │ importa a Orbit │ manual      │
├─────────────┼───────────────────┼──────────────────────┼─────────────────┼─────────────┤
│ Google      │ Manual en UI      │ `driveFolderUrl`     │ Creación de     │ Desorden de │
│ Drive       │ (pegar link)      │ `briefUrl`           │ Prospecto crea  │ carpetas si │
│             │                   │                      │ las 4 carpetas  │ no hay bot  │
├─────────────┼───────────────────┼──────────────────────┼─────────────────┼─────────────┤
│ Alegra      │ Manual Vivian     │ `alegraContactId`    │ Paso a "Activo" │ Crear NIT   │
│ (ERP DIAN)  │ (checkboxes/ID)   │ `billingEmail`       │ o primer hito   │ duplicado   │
│             │                   │ `rutStatus`          │ crea tercero    │ en Alegra   │
└─────────────┴───────────────────┴──────────────────────┴─────────────────┴─────────────┘
```

---

## 7. Matriz Global de Portabilidad por Módulo

| Módulo Orbit | Estado Producto | UI | Lógica Dominio | Persistencia Requerida | Backend Indunova | Dependencias Directas | Bloquea Portabilidad? |
|---|---|---|---|---|---|---|---|
| **Clientes** | Implementado | Completa | Completa | PostgreSQL | Modelos `Client`, `TaxEntity` | Ninguna | **SÍ (Core)** |
| **Catálogo / Plantillas** | Implementado | Completa | Completa | PostgreSQL | Modelos `ProductTemplate` | Roles | **SÍ (Core)** |
| **New Business** | Implementado | Completa | Completa | PostgreSQL | Modelo `Opportunity` | Clientes, Roles | **SÍ (Core)** |
| **Alcance & Backlog** | Implementado | Completa | Completa | PostgreSQL | Modelos `Deliverable`, `Item` | Plantillas, Roles | **SÍ (Core)** |
| **Calculadora / Pricing** | Prototipo Avanzado | Completa | 90% (Sheet) | Configurable DB | Motor de cálculo / Fórmulas | Backlog, Tarifas | **SÍ (Core)** |
| **Quotes (Cotizaciones)** | Implementado | Completa | Completa | PostgreSQL | Modelo `QuoteProposal` | New Business, Pricing| **SÍ (Core)** |
| **SOW Contractual** | Implementado | Completa | Completa | PostgreSQL / Doc | Modelo `SOWDocument` | Quotes | NO (UI Liviana) |
| **Formalización / Gates** | Implementado | Completa | Completa | PostgreSQL | Campos en `Opportunity/Project`| SOW, Quotes | **SÍ (Core)** |
| **Proyectos** | Implementado | Completa | Completa | PostgreSQL | Modelo `Project` | Clientes, New Business| **SÍ (Core)** |
| **Entregables** | Implementado | Completa | Completa | PostgreSQL | Modelo `ProjectDeliverable` | Proyectos, Roles | **SÍ (Core)** |
| **Tareas** | Implementado | Completa | Completa | PostgreSQL | Modelo `Task` | Entregables, Proyectos| **SÍ (Core)** |
| **Staffing / Asignación** | Implementado | Completa | Completa | PostgreSQL | Modelo `ProjectAssignment` | Usuarios, Proyectos | **SÍ (Core)** |
| **Capacidad** | Diseñado | Completa | Completa | Engine Backend | Endpoints agregados | Asignaciones, TimeLogs| **SÍ (Core)** |
| **Time Tracking** | Implementado | Completa | Completa | PostgreSQL | Modelo `TimeLog`, Locks | Tareas, Usuarios | **SÍ (Core)** |
| **Mi Día** | Refactor UX | Completa | Completa | Vistas agregadas| Queries agrupadas | Tareas, TimeLogs | NO (Frontend View) |
| **Documentos / Drive** | Manual | Completa | 30% (Manual) | Links en DB | Integración Google Drive API | Ninguna | NO (Evolutivo) |
| **Alegra / Fiscal** | Manual Vivian | Completa | Manual | IDs en DB | Integración Alegra API | Clientes | NO (Evolutivo) |
| **Bucky / La Colonia** | Prototipo | Completa | Frontend | State opcional | WebSocket / Telemetría | Ninguna | NO (Evolutivo) |

---

## 8. Auditoría de Inconsistencias entre Prototipo UI y Especificación

Durante la auditoría end-to-end se detectaron las siguientes inconsistencias que el backend de Indunova y el frontend deben subsanar:

1. **`initialStatus` ignorado en conversión:**  
   El modal de conversión permite seleccionar si el proyecto arranca en `Pendiente de Formalización` o `Activo`. En el controlador del prototipo estaba forzándose siempre a `'Activo'`. **Regla:** Debe respetarse el valor seleccionado por el líder.
2. **`startConditionsConfig` no persistido en proyecto:**  
   Las condiciones de formalización (si el anticipo aplica o si fue recibido) se enviaban en el evento pero no se almacenaban en la entidad del proyecto creado.
3. **Datos fiscales no propagados:**  
   El checklist de Vivian (RUT recibido, correo facturación) se guardaba en la oportunidad pero no se inyectaba a la entidad `ClientTaxEntity` del cliente recién creado.
4. **Desconexión con SOW Histórico:**  
   Si el líder editaba los textos del SOW en New Business, estos se guardaban en la oportunidad, pero el proyecto recién creado no quedaba con un puntero directo a ese SOW aprobado.
5. **Staffing Automático Vacío:**  
   Las tareas se crean correctamente a partir de las actividades cotizadas, pero quedan con `assigneeAllocations = []`. Esto es correcto según la especificación, pero en UI faltaba el botón directo de "Iniciar Staffing" desde la ficha del proyecto.
6. **Hardcode Financiero:**  
   El overhead semanal y el salario base por rol están en constantes de TypeScript (`constants.ts`). En backend deben ser leídos desde tablas de configuración para que Finanzas pueda actualizar salarios anuales sin desplegar nuevo código.
7. **Regla de Cronómetro / Timer en Pausa:**  
   El tiempo transcurrido con el cronómetro en estado `PAUSED` **bajo ninguna circunstancia cuenta como tiempo efectivo de trabajo**. Únicamente los lapsos en estado activo `RUNNING` suman a la duración total del `TimeLog` al momento de hacer `Stop`.
8. **Disparador Canónico de New Business (Brief + Scoping):**  
   New Business no se inicia cuando un deal se marca como "ganado" en el CRM ni sustituye la prospección comercial en frío. Se dispara exclusivamente cuando **se recibe un brief comercial calificado desde HubSpot que exige dimensionamiento técnico de entregables (scoping) y costeo operativo**.
9. **Fuente Canónica Financiera:**  
   La fuente de verdad financiera de Uhura Group es la **"Calculadora Comercial UHURA 2026" (Google Sheet)** administrada por Finanzas y Dirección. La implementación en `financialEngine.ts` es un prototipo algorítmico y el backend debe proveer persistencia paramétrica configurable para garantizar coherencia absoluta.
10. **Eliminación de Cotizaciones Huérfanas y Única Fuente de Verdad:**  
    En el prototipo existía un contenedor huérfano (`createdQuotes`) y una vista independiente (`cotizador`) desconectada de las oportunidades. **Corrección de dominio:** Se eliminó la vista y el estado paralelo. Toda cotización (`QuoteProposal`) debe existir y persistirse exclusivamente dentro de una `NewBusinessOpportunity`. En el flujo "Usar en New Business" del catálogo de plantillas, la oportunidad debe existir previamente (seleccionando una existente o creándola desde Brief) antes de fijar y persistir el snapshot de cotización.

---

## 9. Gaps de Portabilidad y Plan de Cierre

### Gaps Críticos que Bloquean Portabilidad (Deben resolverse primero en Backend):
1. **Modelado Relacional en PostgreSQL:** Creación de tablas para `Client`, `Project`, `Deliverable`, `Task`, `Opportunity`, `Quote`, `Assignment` y `TimeLog`.
2. **Endpoint de Conversión Atómica (`POST /api/opportunities/{id}/convert/`):** La creación del cliente (si es nuevo), el proyecto, sus N entregables y sus M tareas debe ocurrir en una **única transacción atómica de base de datos**. Si falla una tarea, debe hacerse rollback completo.
3. **Mecanismo de Bloqueo de Timer Único:** En PostgreSQL debe garantizarse mediante restricción única o validación transaccional que ningún usuario tenga dos registros `TimeLog` abiertos (`endTime IS NULL`) al mismo tiempo.
4. **Tablas Paramétricas de Tarifario y Overhead:** Tabla `RoleRate` (rol, salario base, factor prestacional) y tabla `FinancialConfig` (overhead semanal, TRMs) para reemplazar los hardcodes del prototipo.

### Gaps Evolutivos (Pueden quedar para fases posteriores):
1. **Webhooks automáticos con HubSpot y Alegra.**
2. **Creación automática de carpetas mediante Google Drive API.**
3. **Generación binaria de PDFs en servidor (Puppeteer / ReportLab).**
4. **Gamificación y telemetría de La Colonia.**

---

## 10. Roles, Niveles de Acceso y Matriz de Permisos (RBAC)

### 10.1. Principio Arquitectónico Fundamental de Seguridad
> **"Ocultar botones en React NO constituye seguridad."**  
> Toda regla de visibilidad, creación, edición, aprobación o administración aquí definida es de cumplimiento obligatorio y vinculante para el backend de Indunova (Django REST Framework / PostgreSQL).  
> La interfaz web de Orbit adapta dinámicamente sus menús, controles y vistas según el usuario activo, pero **cada endpoint de la API REST (`/api/...`) debe validar de manera estricta la identidad del usuario (`request.user`), su rol profesional, su nivel de acceso (`OrbitAccessLevel`) y el alcance territorial/operativo autorizado (`AccessScope`)** mediante `PermissionClasses` o decoradores a nivel de vista y filtrado estricto de QuerySets en el ORM.

### 10.2. Taxonomía de Identidad: Roles Canónicos vs. Perfiles de Sistema

Orbit separa tajantemente entre **rol profesional/cotizable** (el oficio operativo de la persona que factura o ejecuta horas en proyectos de clientes) y **perfil interno de sistema** (funciones de dirección o soporte que no se cotizan en proyectos de clientes).

#### 1. Roles Profesionales Canónicos (`StandardUhuraRole`):
Existen exactamente 12 roles oficiales en el catálogo de servicios de Uhura:
1. `Client Relationship Strategist`
2. `Front-End Dev`
3. `Community Manager`
4. `Digital Designer`
5. `Digital Content Specialist`
6. `Product Lead`
7. `Trafficker Media`
8. `Creative Strategy Lead`
9. `Creative Designer`
10. `Content Creator`
11. `Directora Comercial`
12. `Growth Manager`

#### 2. Perfiles Internos de Sistema (`InternalSystemRole`):
Roles operativos no cotizables para tareas operativas estándar:
1. `CEO` (Dirección General y Visión Estratégica)
2. `Administrativa` (Vivian: Datos fiscales, RUT, facturación en Alegra y cartera)
3. `Admin de Sistema` (TI y gobernanza de plataforma)

### 10.3. Niveles de Acceso Canónicos (`CanonicalOrbitAccessLevel`)
La experiencia de usuario y la autorización relacional se rigen por **7 niveles de acceso funcionales canónicos**:
- `collaborator`: Especialistas técnicos y creativos (Front-End, Diseñadores, Community Managers, etc.). Foco en ejecución personal y registro de tiempo. **Sin acceso al Catálogo de Servicios, New Business, Clientes ni Administración.**
- `leader`: Líderes de área y proyectos (Product Lead, Creative Strategy Lead, Growth Manager). Foco en scoping técnico, asignaciones, revisiones de calidad (QA) y seguimiento de equipo.
- `client_relationship`: Estrategas de relación con clientes (Account Leads). Foco en satisfacción, seguimiento de cuentas asignadas y enlace operativo.
- `commercial`: Dirección Comercial. Foco exclusivo en New Business, pricing, condiciones contractuales y cotizaciones.
- `administrative`: Administración y Finanzas operativas. Foco en información fiscal, RUT, sincronización con Alegra y cartera.
- `executive`: Dirección Ejecutiva (CEO). Supervisión transversal, aprobación de cotizaciones y analítica de rentabilidad de alto nivel.
- `system_admin`: Gobernanza integral de usuarios, roles y configuración de la plataforma.

#### Estado Transitorio de Usuario: `pending`
- **`pending` NO es un nivel funcional de la matriz canónica.**
- Representa el estado provisional de un usuario recién invitado o incorporado que aún no cuenta con un nivel de acceso formal asignado.
- **Política estricta `deny-by-default`:** Un usuario en estado `pending` tiene denegado el acceso a proyectos, tareas, clientes, cotizaciones, finanzas y catálogo. Únicamente se le permite acceso mínimo seguro a su vista personal de **Mi Día** en modo lectura (`view`), sin acciones sensibles ni exposición de datos operativos.

### 10.4. Acciones y Alcances Normalizados

#### Acciones Atómicas (`AppAction`):
Solo existen 5 verbos canónicos:
- `view`: Lectura y consulta de registros o módulos.
- `create`: Creación e inserción de nuevas entidades.
- `edit`: Modificación de campos permitidos en entidades existentes.
- `approve`: Validación formal o cambio de estado de gobernanza (ej. aprobar cotización o validar entregable en QA).
- `administer`: Control pleno (eliminación, archivo, reasignación maestra o configuración estructural).

*Regla: Casos como "usar una plantilla", "interactuar con La Colonia" o "ejecutar una tarea" se resuelven mediante combinaciones de estos 5 verbos o reglas funcionales específicas.*

#### Alcances de Acceso (`AccessScope`):
Solo existen 5 alcances autorizados:
- `own`: Solo entidades pertenecientes o registradas por el usuario actual (ej. sus propios logs de tiempo).
- `assigned`: Entidades donde el usuario figura explícitamente como responsable o asignado (ej. tareas asignadas).
- `team`: Entidades asociadas al equipo operativo o departamento bajo liderazgo del usuario.
- `accounts`: Entidades asociadas a las cuentas o clientes que el usuario lidera o acompaña.
- `all`: Acceso transversal a toda la organización (restringido a CEO, Comercial, Administrativa o Admin de Sistema).

### 10.5. Matriz Canónica de Permisos por Módulo

| Módulo / Vista | Collaborator | Leader | Client Relationship | Commercial | Administrative | Executive (CEO) | System Admin |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mi Día (`mi-dia`)** | own (view/edit) | own + team (view/edit) | own (view/edit) | own (view/edit) | own (view/edit) | own + all (view/edit) | own (view/edit) |
| **Proyectos (`proyectos`)** | assigned (view) | team (view/create/edit) | accounts (view/edit) | all (view) | all (view) | all (view/approve) | all (administer) |
| **Tareas (`tareas`)** | assigned (view/edit/create) | team (view/create/edit/approve) | accounts (view/create) | all (view) | all (view) | all (view) | all (administer) |
| **Timesheets (`timesheets`)** | own (view/create) | team (view/edit) | accounts (view) | all (view) | all (view) | all (view) | all (administer) |
| **Clientes (`clientes`)** | Denegado | team (view) | accounts (view/edit) | all (view/create/edit) | all (view/edit) | all (view) | all (administer) |
| **Catálogo (`plantillas-producto`)** | **Denegado** | all (view) | all (view) | all (view) | Denegado | all (view) | all (view/administer) |
| **New Business (`new-business`)** | Denegado | team scoping (view/edit) | accounts (view) | all (view/create/edit/approve) | all (view/edit formalization) | all (view/approve) | all (administer) |
| **Finanzas (`finanzas`)** | Denegado | Denegado | Denegado | own/quotes (view) | all (view/edit fiscal) | all (view/approve) | all (administer) |
| **Usuarios & Roles (`usuarios`)** | Denegado | team (view) | Denegado | Denegado | all (view) | all (view) | all (administer) |
| **La Colonia (`la-colonia`)** | all (view/edit) | all (view/edit) | all (view/edit) | all (view/edit) | all (view/edit) | all (view/edit) | all (administer) |

### 10.6. Reglas de Negocio de Autorización Específica

1. **Scoping Operativo en New Business:**  
   - La Directora Comercial crea oportunidades y briefs.  
   - El Product Lead (o Leader asignado) realiza el dimensionamiento técnico (Backlog, Entregables y Horas por Rol).  
   - Los colaboradores técnicos no tienen acceso al módulo New Business para evitar filtración de propuestas comerciales tempranas.
2. **Pricing y Márgenes:**  
   - La edición de costos base, margen esperado (%) y valor final de la cotización es **exclusiva de la Directora Comercial** con visibilidad del CEO. Los líderes operativos proponen horas, no precios de venta.
3. **Formalización y Datos Fiscales:**  
   - La carga del RUT, verificación en Alegra y datos de facturación electrónica es potestad de la **Administrativa (Vivian)** y la Directora Comercial.
4. **Time Tracking e Inmutabilidad de Horas:**  
   - Un usuario solo puede registrar tiempo en su propio nombre (`own`).  
   - Se prohíbe tener dos cronómetros activos concurrentes.  
   - El tiempo en pausa (`PAUSED`) no suma horas computadas.  
   - Ningún usuario puede eliminar logs históricos validados sin rol de administración.

### 10.7. Requerimientos de Implementación en Backend (Django REST Framework)

> **PRINCIPIO ARQUITECTÓNICO FUNDAMENTAL:**  
> **Los controles de interfaz en React son UX, NO seguridad.**  
> Ocultar botones o proteger rutas en el frontend solo sirve para ofrecer una experiencia fluida. El backend de Indunova en Django REST Framework **debe repetir y hacer cumplir de manera estricta e independiente todas las reglas de autorización**, sin confiar jamás en las peticiones del cliente:
> 1. **Autorización estricta por cada request HTTP**: Comprobación obligatoria de la identidad del usuario (`request.user`) y su nivel de acceso (`user.access_level`) en cada vista y APIView mediante `permission_classes`.
> 2. **Filtros de QuerySet según Scope en el ORM**: Todo ViewSet debe sobreescribir `get_queryset(self)` para restringir los registros recuperados según el `AccessScope` correspondiente (`own`, `assigned`, `team`, `accounts`, `all`).
> 3. **Validación de permisos a nivel de objeto**: Implementar `check_object_permissions(request, obj)` en operaciones de detalle para garantizar que un usuario con acceso al módulo no pueda modificar ni ver objetos que no le correspondan.
> 4. **Respuestas 403 Forbidden para acciones prohibidas**: Denegar inmediatamente cualquier intento de lectura, creación, edición, aprobación o eliminación fuera del alcance permitido con código HTTP 403.

1. **Autenticación Basada en Token / JWT:**  
   Inyección del usuario en `request.user` con claves foráneas a `Profile`, `RoleDefinition` y `AccessLevel`.
2. **Clases de Permiso Reutilizables:**  
   - `IsCollaboratorOrAbove`, `IsProjectLeader`, `IsCommercialLead`, `IsAdminOrCEO`.
3. **Filtrado de Consultas en ORM (QuerySet Scoping):**  
   Implementar `get_queryset(self)` en ViewSets de Django para aplicar el filtro de `AccessScope`:
   ```python
   def get_queryset(self):
       user = self.request.user
       if user.access_level in ['executive', 'system_admin']:
           return Task.objects.all()
       if user.access_level == 'leader':
           return Task.objects.filter(project__lead=user) | Task.objects.filter(assignees=user)
       if user.access_level == 'collaborator':
           return Task.objects.filter(assignees=user)
       # deny-by-default para pending o estados sin mapeo
       return Task.objects.none()
   ```
4. **Respuestas de Error Uniformes (403 Forbidden):**  
   Cuando un usuario intente acceder a un objeto o ejecutar una acción no autorizada, la API debe responder `403 Forbidden` con detalle estructurado:
   ```json
   {
     "error": "permission_denied",
     "message": "No tiene permisos para modificar los aspectos económicos de esta oportunidad.",
     "required_action": "edit",
     "module": "new-business"
   }
   ```

---

## 11. Arquitectura de Interoperabilidad Estructural (Bloque 4)

### 11.1. Principio Rector: Integraciones Silenciosas e Invisibles
> **PRINCIPIO ARQUITECTÓNICO DE UHURA:**  
> **"Las integraciones deben sentirse casi invisibles."**  
> En Orbit no existen botones de "Sincronizar ahora", pantallas de configuración de tokens para usuarios finales, ni paneles que emulen dashboards de APIs externas. Orbit es un sistema de gestión operativa enfocado en la claridad del trabajo. La interoperabilidad ocurre a nivel de modelo de dominio y claves foráneas canónicas, permitiendo que la capa de backend (Indunova) orqueste workers y webhooks sin obligar al frontend a rediseñar sus pantallas ni sus entidades principales.

---

### 11.2. Frontera Canónica de Sistemas (Sources of Truth)

| Sistema Externo | Rol en el Ecosistema | Source of Truth Canónico | Entidades Vinculadas en Orbit | Claves Foráneas & Hooks en Orbit |
| :--- | :--- | :--- | :--- | :--- |
| **HubSpot** | Comercial & CRM | Prospectos, empresas, contactos, deals, pipeline y actividad comercial | `NewBusinessOpportunity`, `ProjectSummaryItem` | `hubspotDealId`, `hubspotDealUrl`, `hubspotCompanyId`, `hubspotContactId` |
| **Orbit** | Operativo & Capacidad | Alcance técnico, dimensionamiento, cotizaciones, proyectos, entregables, tareas, staffing, capacidad y horas | Todo el Core de Orbit | Entidades maestras de Orbit (`ProjectSummaryItem`, `TaskItem`, `UserItem`, etc.) |
| **Alegra** | Fiscal & Contable | Terceros fiscales (Razón Social / NIT), facturación electrónica, impuestos, cartera y recaudo | `ClientTaxEntity`, `ClientProfile`, `ProjectSummaryItem` | `taxEntityId` (FK canónica a `ClientTaxEntity`), `alegraContactId` |
| **Google Drive** | Repositorio Documental | Almacenamiento seguro de archivos, briefs, contratos firmados, entregables y propuestas | `NewBusinessOpportunity`, `ProjectSummaryItem` | `driveFolderId`, `driveFolderUrl`, `briefUrl`, `briefFileId` |
| **Google Calendar** | Calendario de Disponibilidad | Vacaciones y licencias/permisos laborales aprobados del equipo | `TeamAbsenceEvent`, `CapacityView`, `BuckyEngine` | `TeamAbsenceEvent` (`externalCalendarEventId`, `externalCalendarId`, `source: 'google_calendar'`) |

---

### 11.3. Regla Canónica de Disparo: Cuándo se Activa New Business
> **CORRECCIÓN CRÍTICA DE GOBERNANZA:**  
> **New Business NO se activa con "Deal Won" en HubSpot.**  
> - **El Disparador Real:** New Business se activa en Orbit tan pronto como existe un **Brief Comercial Calificado** que requiere **Dimensionamiento Técnico Operativo (Scoping)**.
> - **Razón:** Para poder cotizar y ganar el Deal en HubSpot, la Directora Comercial necesita que el Product Lead / Líder de Área desglose el alcance en entregables, actividades y horas por rol en Orbit.
> - **Ciclo de Vida:**
>   1. Oportunidad creada en HubSpot (`hubspotDealId`).
>   2. Se activa en Orbit para scoping técnico y generación de propuestas (`QuoteProposal`).
>   3. Una vez el cliente aprueba la propuesta económica y se formaliza el acuerdo, la oportunidad se convierte en Proyecto Activo (`handleConvertOpportunityToProject`), propagando las referencias canónicas (`hubspotDealId`, `driveFolderUrl`, `taxEntityId`).

---

### 11.4. Datos Personales vs. Google Calendar: Cumpleaños, Hobbies y Ausencias
> **ACLARACIÓN ESTRUCTURAL ESTRICTA:**  
> - **Cumpleaños y Aniversarios NO provienen de Google Calendar.** Viven como datos estructurados propios del perfil del colaborador en Orbit (`UserItem`):
>   - `birthDate`: Fecha de cumpleaños en formato `YYYY-MM-DD` (ej. `'1993-09-18'`).
>   - `anniversaryDate`: Fecha de ingreso a Uhura Group (ej. `'2024-03-01'`).
> - **Hobbies y Mascotas (`hobbies?: string`, `petNames?: string`):** Ambos son campos opcionales de experiencia/perfil en Orbit y **NO forman parte del contrato obligatorio de interoperabilidad de Bloque 4**.
> - **Google Calendar se utiliza ÚNICAMENTE como fuente externa para:**
>   - Vacaciones de ley (`type: 'vacation'`)
>   - Licencias o incapacidades aprobadas (`type: 'sick_leave' | 'personal_leave' | 'other'`)
> - Bucky y Mi Día consumen las fechas de cumpleaños y aniversario directamente desde `UserItem` en Orbit, garantizando privacidad y evitando llamadas innecesarias a Google Calendar API.

---

### 11.5. Modelo de Dominio de Ausencias (`TeamAbsenceEvent`) y Flujo hacia Capacidad

```typescript
export type TeamAbsenceType =
  | 'vacation'
  | 'sick_leave'
  | 'personal_leave'
  | 'other';

export type TeamAbsenceStatus =
  | 'active'
  | 'cancelled';

export type TeamAbsenceSource =
  | 'google_calendar'
  | 'manual';

export interface TeamAbsenceEvent {
  id: string;                          // UUID único de Orbit
  userId: string;                      // FK al colaborador (UserItem.id)
  userName?: string;                   // Nombre para display rápido
  type: TeamAbsenceType;
  title: string;                       // e.g. "Vacaciones de Ley", "Incapacidad Médica"
  startDate: string;                   // Fecha inicio ISO (YYYY-MM-DD)
  endDate: string;                     // Fecha fin ISO (YYYY-MM-DD, inclusive)
  allDay: boolean;                     // true = jornada completa
  impactHoursPerDay: number;           // Horas hábiles a descontar por día (ej. 8.0 o 4.0)
  status: TeamAbsenceStatus;           // 'active' | 'cancelled'
  source: TeamAbsenceSource;           // 'google_calendar' | 'manual'
  externalCalendarEventId?: string;    // ID único del evento en Google Calendar
  externalCalendarId?: string;         // ID del calendario origen (ej. ausencias@uhuragroup.com)
  lastSyncedAt?: string;               // Timestamp ISO del último sync
  businessDaysImpact?: number;         // Días hábiles totales de impacto en el periodo
  notes?: string;
}
```

#### Regla Matemática de Deducción de Capacidad en Orbit:
1. **Deducción de Días Hábiles:** Por cada día hábil (Lunes a Viernes) comprendido entre `startDate` y `endDate`, se descuentan `impactHoursPerDay` de la disponibilidad del colaborador:
   $$\text{Capacidad Neta} = \max(0, \text{Capacidad Base Configurada} - \sum \text{Deducción Ausencias})$$
2. **Exclusión de Fines de Semana y Festivos:** Si una ausencia coincide con un fin de semana o un día festivo oficial (calendario colombiano), ese día NO resta horas laborales, porque su disponibilidad legal ya es 0h.
3. **Impacto en Asignación y Salud:**
   - Si la capacidad neta es 0h (vacaciones completas en la semana), el estado se marca con badge de descanso (`🌴 En Vacaciones`), y la carga asignada activa no computa como sobrecarga ni penaliza el score.
   - En la tarjeta del colaborador y en el drawer lateral se muestra el banner informativo de la ausencia con indicador de sincronización externa (*Google Calendar*).
4. **Protección en Asignación (Bucky):**
   - El motor de vida de equipo (`teamLifeEngine.ts`) evalúa `checkAssigneeAvailability`: si se intenta asignar o consultar a un colaborador con ausencia activa hoy, Bucky emite advertencia de bloqueo; si tiene una ausencia en los próximos 14 días, emite aviso preventivo para planificar entregables antes de su salida.
5. **Deuda Técnica Identificada (Prototipo Capacidad):**
   - La semana de cálculo simulada en `CapacityView` (del 15 al 19 de septiembre de 2026) se mantiene deliberadamente como deuda de prototipo visual. Será refactorizada para navegación de semanas dinámica y persistencia real en iteraciones posteriores (Navegación / Mi Día / Capacidad dinámica). No pertenece a este fix documental ni altera el contrato de interoperabilidad.

---

### 11.6. Resumen de Propagación de Entidades (New Business → Proyecto / Cliente)

Al ejecutarse la conversión de una Oportunidad a Proyecto (`handleConvertOpportunityToProject`):
1. **HubSpot:**
   - `opp.hubspotDealId` → `Project.hubspotDealId` (referencia externa canónica hacia HubSpot).
   - `opp.hubspotDealUrl` → `Project.hubspotDealUrl` (conveniencia de navegación UX únicamente; **NO representa una relación adicional de dominio** y no debe utilizarse como identificador canónico).
   - `opp.hubspotCompanyId` → `ClientProfile.hubspotCompanyId` (registrado en nuevo cliente o actualizado en cliente existente).
   - `opp.hubspotContactId` no se replica en `Project` (pertenece al directorio de contactos comerciales del cliente).
2. **Google Drive:**
   - `driveFolderUrl` y `driveFolderId` se transfieren al `ProjectSummaryItem`. Si no existen en la oportunidad, quedan como `null` / no vinculados (sin inventar URLs sintéticas).
3. **Alegra / Entidad Fiscal:**
   - **`NewBusinessOpportunity.selectedTaxEntityId`**: Entidad fiscal seleccionada durante New Business / formalización de propuesta. No compite con otros aliases dentro de la oportunidad.
   - **`ClientTaxEntity.id`**: Identificador real de la entidad fiscal (fuente canónica de verdad para `businessName`, `nit`, `billingEmail`, `alegraContactId`, `alegraContactUrl`, `alegraCreated`).
   - **`opp.selectedTaxEntityId` → `Project.taxEntityId`**: Al convertir la oportunidad, `Project` almacena únicamente `taxEntityId` como FK canónica de operación hacia `ClientTaxEntity`.
   - Se removió `alegraContractId` por inexistencia en API de Alegra y se eliminó la duplicidad de `selectedTaxEntityId` en `ProjectSummaryItem`.
   - Si la oportunidad contenía checklist administrativo (`administrativeChecklist`), sus datos (`billingEmail`, `alegraContactId`, `alegraContactUrl`) enriquecen la `ClientTaxEntity` en `ClientProfile`.

---

### 11.7. Bloque 5: Simplificación de Navegación, Mi Día y Equipo & Accesos

#### 1. Consolidación de Navegación Lateral (4 Grupos Canónicos)
Se eliminaron cards decorativas y accesos secundarios redundantes de la barra de navegación principal, consolidándola en 4 grupos estrictos:
1. **Operación:**
   - Mi Día (Home contextual del usuario).
   - Proyectos (Portafolio y entregables).
   - Tareas (Tableros operativos Kanban y Lista).
   - Capacidad (Disponibilidad, asignación y carga; se respeta el scope RBAC: `own` para colaboradores, `team` para líderes/CRS y `all` para administración/ejecutivo).
   - *Nota:* Se retiró `Horas` de la navegación primaria; Mi Día absorbió el timer, la carga manual y rápida, el progreso de jornada y los registros de hoy. El acceso a la auditoría histórica de timesheets se mantiene de forma contextual secundaria.
2. **Comercial:**
   - New Business (Embudo de ventas y cotizaciones).
   - Clientes (Cartera, perfiles y entidades fiscales).
   - Plantillas (Catálogo de servicios y producto).
   - *Nota:* Se retiró `Finanzas` del sidebar hasta su definición funcional en fase posterior.
3. **Experiencia:**
   - La Colonia (Hábitat vivencial de Bucky).
   - *Nota:* Se retiró `El Muro` del sidebar.
4. **Sistema:**
   - **Equipo & Accesos:** Centraliza en una sola experiencia con pestañas el directorio de colaboradores, invitaciones y la matriz de roles y permisos RBAC. Se eliminaron accesos independientes redundantes de Usuarios, Roles & Permisos y Portal Cliente.

#### 2. Mi Día: Los 3 Niveles Estructurales
Mi Día deja de ser un dashboard de métricas decorativas para convertirse en el home contextual operativo del usuario, respondiendo con rigor:
1. **¿Qué requiere mi atención?**
   - Se evalúa de manera dinámica con base en la matriz de perspectiva por rol (retrabajos urgentes, revisiones de calidad pendientes, bloqueos operativos, desvíos presupuestales `ejecutado > presupuestado`, cotizaciones comerciales en validación y formalizaciones fiscales de clientes ganados).
   - **Regla Invariante:** Si el conteo de acciones requeridas es 0, la sección desaparece por completo (0px de altura).
2. **¿Qué tengo que hacer hoy? (Protagonista)**
   - Lista clara de tareas asignadas al usuario activo con fecha límite hoy o activas en curso.
   - Integración directa del Timer (iniciar/detener por tarea), botón de alerta de desvío en chat para PM/Lead, checkbox de completado y modal de detalle.
   - En perfiles ejecutivos (`executive`) sin tareas de producción asignadas, muestra un estado limpio libre de ruido basado en excepciones.
3. **¿Cómo voy?**
   - Balance compacto de jornada con barra de progreso contra la disponibilidad configurada.
   - Carga rápida de tiempo (+30m, +1h, +2h y bolsas internas Uhura como Daily Standup o Sync Operativo).
   - Acordeón colapsable con los registros de tiempo de hoy (permite eliminar registros erróneos).
   - Acceso secundario textual hacia la vista de consulta histórica de Timesheets.
4. **Frontera de Bucky y Experiencia:**
   - Bucky se mantiene como acompañante contextual en la columna lateral resolviendo su estado emocional según desvíos y progreso del día, con acceso directo a La Colonia.
   - Se eliminaron el grid de 4 KPIs estáticos, el calendario semanal L-V y los widgets de ausencias globales permanentes.

---

*Fin del Documento Maestro — Uhura Orbit 2026*

