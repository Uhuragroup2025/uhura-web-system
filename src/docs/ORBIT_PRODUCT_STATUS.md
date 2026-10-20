# ORBIT — Especificación Funcional Maestra de Producto y Arquitectura de Dominio

> **Documento:** Especificación Funcional Maestra para Portabilidad, Backend y Modelo de Datos  
> **Destinatario Técnico Principal:** Indunova (Backend Django REST Framework / PostgreSQL) y Equipo de Producto Uhura Group  
> **Fecha de Actualización:** Octubre 2026  
> **Versión:** 3.2.0 (Master Functional Freeze & UAT Reconciliation)  
> **Estado:** Especificación Maestra Canónica Reconciliada — Fuente de Verdad Funcional de Orbit  

---

## Índice General

1. [Propósito del Documento y Concepto de Freeze Funcional](#1-propósito-del-documento-y-concepto-de-freeze-funcional)
2. [Frontera de Sistemas y Cuadrilátero de Responsabilidades](#2-frontera-de-sistemas-y-cuadrilátero-de-responsabilidades)
3. [Navegación del Sistema y Consolidación de Módulos](#3-navegación-del-sistema-y-consolidación-de-módulos)
4. [Mapa Macro de Dependencias y Ciclo de Vida](#4-mapa-macro-de-dependencias-y-ciclo-de-vida)
5. [Especificación Funcional por Módulo](#5-especificación-funcional-por-módulo)
   - [Módulo 1: New Business (Entrada Comercial y Gobernanza)](#módulo-1-new-business)
   - [Módulo 2: Catálogo de Servicios y Plantillas de Producto](#módulo-2-catálogo-de-servicios-y-plantillas-de-producto)
   - [Módulo 3: Alcance & Backlog (Scoping de Entregables y Actividades)](#módulo-3-alcance--backlog)
   - [Módulo 4: Alcance Técnico y Registro Comercial (Desacoplamiento Financiero)](#módulo-4-alcance-técnico-y-registro-comercial-desacoplamiento-financiero)
   - [Módulo 5: Cotización / Propuesta Económica (Quotes)](#módulo-5-cotización--propuesta-económica)
   - [Módulo 6: Documentos y Repositorio Google Drive](#módulo-6-documentos-y-repositorio-google-drive)
   - [Módulo 7: Statement of Work (SOW Contractual)](#módulo-7-statement-of-work-sow-contractual)
   - [Módulo 8: Formalización, Conversión a Proyecto y Gates](#módulo-8-formalización-conversión-a-proyecto-y-gates)
   - [Módulo 9: Clientes (Cuentas y Entidades Fiscales)](#módulo-9-clientes)
   - [Módulo 10: Administración Fiscal y Frontera con Alegra](#módulo-10-administración-fiscal-y-frontera-con-alegra)
   - [Módulo 11: Proyectos (Estructura Operativa, Gobernanza y Vistas)](#módulo-11-proyectos)
   - [Módulo 12: Entregables (Componentes Operativos)](#módulo-12-entregables)
   - [Módulo 13: Tareas y Detalle Operativo (TaskDetailModal)](#módulo-13-tareas-y-detalle-operativo-taskdetailmodal)
   - [Módulo 14: Staffing y Asignaciones](#módulo-14-staffing-y-asignaciones)
   - [Módulo 15: Capacidad del Equipo](#módulo-15-capacidad-del-equipo)
   - [Módulo 16: Time Tracking (Registro de Tiempo)](#módulo-16-time-tracking)
   - [Módulo 17: Mi Día (Home Contextual y Bandeja de Acción)](#módulo-17-mi-día)
   - [Módulo 18: Bucky y La Colonia (Copiloto y Gamificación)](#módulo-18-bucky-y-la-colonia)
6. [Integraciones Externas: Arquitectura y Comportamiento](#6-integraciones-externas-arquitectura-y-comportamiento)
7. [Matriz Global de Portabilidad por Módulo](#7-matriz-global-de-portabilidad-por-módulo)
8. [Auditoría de Inconsistencias entre Prototipo UI y Especificación](#8-auditoría-de-inconsistencias-entre-prototipo-ui-y-especificación)
9. [Gaps de Portabilidad y Plan de Cierre](#9-gaps-de-portabilidad-y-plan-de-cierre)
10. [Roles, Niveles de Acceso y Matriz de Permisos (RBAC)](#10-roles-niveles-de-acceso-y-matriz-de-permisos-rbac)
11. [Arquitectura de Interoperabilidad Estructural y Reglas de Dominio](#11-arquitectura-de-interoperabilidad-estructural-bloque-4)

---

## 1. Propósito del Documento y Concepto de Freeze Funcional

Este documento constituye la **especificación funcional y de arquitectura de dominio maestra** de Orbit, reconciliada directamente con el prototipo de producto y la experiencia aprobada en pruebas UAT. Ha sido estructurado específicamente para que el equipo de backend e infraestructura (**Indunova**) disponga del diseño relacional, reglas invariantes, contratos de transferencia y fronteras de integración necesarios para construir la persistencia en PostgreSQL y los servicios REST en Django.

### Definición de Freeze Funcional
> **El "Freeze Funcional" NO significa que todas las pantallas estén visualmente terminadas o que no puedan pulirse detalles estéticos de UI.**  
> Significa que **la topología de entidades, las relaciones, las reglas de negocio, los estados de transición, la persistencia requerida y las fronteras con sistemas externos quedan congelados y formalizados**. Ningún cambio posterior alterará la lógica de datos aquí establecida sin un proceso formal de control de versiones.
> **Regla de oro de UAT:** Un defecto puntual de implementación en staging no cambia la especificación funcional; documenta el comportamiento esperado aprobado de Orbit frente a las discrepancias.

### Clasificación de Componentes para Portabilidad:
1. **Core para Portabilidad (Crítico):** Bloquea la base de datos y los flujos indispensables de negocio. Debe implementarse con máxima prioridad (Clientes, Proyectos, Entregables, Tareas, New Business, Quotes, Time Tracking, Capacidad, Mi Día).
2. **UI Liviana / Transaccional Simple:** Puede operar con endpoints CRUD básicos mientras el frontend maneja la interactividad (Plantillas de Producto, Documentos/Drive Links, SOW).
3. **Evolutivo / No Bloqueante:** Funcionalidades de enriquecimiento que no deben demorar la migración del backend transaccional (La Colonia, Bucky Inteligente, Webhooks automáticos con HubSpot/Alegra).

---

## 2. Frontera de Sistemas y Cuadrilátero de Responsabilidades

Orbit **no es un CRM generalista, ni una calculadora contable, ni un ERP tributario**. Su frontera funcional está delimitada por cuatro sistemas y un repositorio documental:

```text
           ┌─────────────────────────────────────────┐
           │        HUBSPOT (CRM Comercial)          │
           │ • Prospección, Leads, Deals             │
           │ • Pipeline de Ventas, Etapas Comerciales│
           │ • Actividades comerciales (mails, calls)│
           │ • SOURCE OF TRUTH ESTADO COMERCIAL      │
           └────────────────────┬────────────────────┘
                                │ (Handoff por Brief: Creación de Oportunidad)
                                ▼
           ┌─────────────────────────────────────────┐
           │       ORBIT (Operating System)          │
           │ • Dimensionamiento Técnico (Alcance)    │
           │ • Entregables, Actividades y Roles      │
           │ • Horas Técnicas Totales y por Rol      │
           │ • Link a Propuesta Técnica (Drive/PPT)  │
           │ • Semanas Productivas de Entrega        │
           │ • SOURCE OF TRUTH OPERATIVO & ALCANCE   │
           └──────────┬───────────────────▲──────────┘
                      │                   │
  Rollup de Horas     │                   │ Registro de Resultado Comercial:
  y Perfiles Cotizados│                   │ Valor Cotizado, Moneda, Versión
                      ▼                   │ Enlaces a Sheet y Documentos
           ┌──────────────────────────────┴──────────┐
           │  GOOGLE SHEET / CALCULADORA COMERCIAL   │
           │ • Tarifas de Costo Salarial y Nómina    │
           │ • Multiplicadores Prestacionales        │
           │ • Overhead Operativo y Bandas de Margen │
           │ • Tratamiento de IVA y TRM Oficial      │
           │ • SOURCE OF TRUTH CÁLCULO FINANCIERO    │
           └─────────────────────────────────────────┘
                                │
                                ▼ (Cliente Aprueba Propuesta Económica)
           ┌─────────────────────────────────────────┐
           │         CONVERSIÓN EN ORBIT             │
           │ • Deal Ganado en HubSpot / Orbit        │
           │ • Oportunidad Ganada ➔ Proyecto Activo   │
           │ • Entregables y Tareas creados 1:1      │
           │ • Horas Cotizadas heredadas a control   │
           │ • Staffing, Capacidad y Time Tracking   │
           │ • Mi Día contextual por rol             │
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

* **HubSpot:** Dueño de la relación comercial y fuente de verdad del estado del deal (`won` / `lost`).
* **Google Sheet Oficial / Calculadora Comercial:** Fuente de verdad del pricing y cálculo financiero (márgenes, costos internos, tarifas, IVA y TRM). **Orbit no calcula internamente tarifas ni márgenes**.
* **Orbit:** Dueño del alcance, dimensionamiento técnico, horas técnicas, conversión a proyectos, entregables, tareas, ejecución operativa, Mi Día y capacidad.
* **Alegra:** Dueño de la facturación electrónica, los impuestos y el recaudo.
* **Google Drive:** Repositorio pasivo de archivos, minutas, briefs, presentaciones y entregables.

---

## 3. Navegación del Sistema y Consolidación de Módulos

Para eliminar redundancias cognitivas y reflejar el flujo real de trabajo, la barra de navegación lateral (Sidebar) se consolida en la siguiente estructura oficial de 4 grupos canónicos:

### Estructura Vigente del Sidebar:
```text
OPERACIÓN
  ├─ Mi Día (Home Contextual por Rol · Bandeja de Acción, Timer y Horas del Día)
  ├─ Proyectos (Directorio Operativo, Fichas de Proyecto, Tareas y Matriz de Horas)
  ├─ Tareas (Listado / Kanban Operativo con bloques de entregables plegados por defecto)
  └─ Capacidad (Matriz de Carga Planificada vs. Ejecución y Disponibilidad)

COMERCIAL / PROPUESTAS
  ├─ Clientes (Marcas, Contactos y Fichas Administrativas)
  ├─ New Business (Pipeline Técnico: Resumen, Alcance, Cotización, SOW, Historial)
  └─ Catálogo de Servicios (Biblioteca de Plantillas Maestras de Producto)

EXPERIENCIA
  └─ La Colonia (Simulador / Hábitat Vivencial de Bucky)

SISTEMA / ADMINISTRACIÓN
  └─ Equipo & Accesos (Directorio de Colaboradores, Invitaciones y Matriz RBAC Unificada)
```

> **DECISIONES DE CONSOLIDACIÓN Y REDUCCIÓN DE RUIDO:**  
> 1. **Horas / Time Tracking:** Se retiró `Horas` de la navegación primaria. Mi Día absorbió el cronómetro (timer), la carga rápida/manual y el registro de horas de hoy. La consulta histórica de Timesheets se accede de forma secundaria contextual.  
> 2. **Cotizador:** NO existe como módulo independiente en el sidebar. La cotización es una fase interna dentro de la oportunidad en **New Business**.  
> 3. **Finanzas y El Muro:** Se retiraron del sidebar de navegación diaria para preservar el foco operativo.  
> 4. **Equipo & Accesos:** Centraliza en una experiencia tabulada el directorio del equipo, invitaciones y la matriz RBAC.

---

## 4. Mapa Macro de Dependencias y Ciclo de Vida

El flujo lineal de la información y los handoffs entre roles a través de Orbit se rige por la siguiente cadena de valor:

```text
[1. HUBSPOT: Brief Recibido & Oportunidad Comercial]
         │
         ▼
[2. COMERCIAL EN ORBIT (Catalina / Luisa)]
         │ • Crea Oportunidad en New Business
         │ • Registra prospecto, brief y contacto
         │ • Asigna Líder de Alcance (ej. Paola Monsalve / Diego Cadavid)
         │
         ▼ (Handoff 1: Notificación en campana y acción en Mi Día del Líder)
[3. LÍDER DE ALCANCE EN ORBIT (Product Lead / Creative Lead)]
         │ • Recibe la oportunidad asignada en su bandeja de Mi Día
         │ • Ingresa a New Business ➔ "Alcance y propuesta"
         │ • Elige estructurar desde Catálogo de Servicios o desde cero
         │ • Define Entregables, Actividades, Roles canónicos y Horas estimadas
         │ • Asigna colaboradores tentativos si aplica
         │ • Diligencia semanas productivas de entrega (para Proyecto Único)
         │ • Pega enlace a la presentación de propuesta técnica (Drive / PPT)
         │ • Visualiza el rollup dinámico de horas técnicas
         │ • Ejecuta: [ Marcar alcance listo (X h) / Notificar a Comercial ]
         │
         ▼ (Handoff 2: Oportunidad pasa a status: 'internal_review')
[4. COMERCIAL RECIBE HANDOFF (Mi Día & Notificaciones)]
         │ • Recibe alerta de alcance técnico finalizado
         │ • Extrae horas técnicas y resumen de perfiles desde Orbit
         │ • Realiza el cálculo financiero en el Google Sheet Oficial / Calculadora
         │ • Registra en Orbit el resultado comercial acordado:
         │     - Valor cotizado final y moneda (COP / USD)
         │     - Versión de propuesta (V1, V2...)
         │     - URL de la Calculadora de Finanzas / Google Sheet
         │     - URL de la propuesta formal / PPT
         │     - Notas comerciales y condiciones de pago
         │ • Presenta la propuesta económica al cliente
         │
         ▼
[5. APROBACIÓN POR CLIENTE Y HUBSPOT]
         │ • Cliente aprueba propuesta técnica y comercial
         │ • HubSpot refleja Deal Ganado ('won') ── Fuente de verdad comercial
         │ • Comercial marca Oportunidad como Ganada en Orbit
         │
         ▼
[6. CONVERSIÓN A PROYECTO OPERATIVO (ConvertOpportunityModal)]
         │ • Comercial o Líder ejecuta "Convertir a Proyecto Operativo"
         │ • Se genera el Proyecto con código (ej. ECO-42, PRJ-01)
         │ • SE TRASLADAN AUTOMÁTICAMENTE:
         │     - Entregables cotizados (1:1 con snapshot aprobado)
         │     - Tareas operativas atómicas derivadas de las actividades
         │     - Presupuesto de horas por rol (soldHours / budgetedHours)
         │     - Trazabilidad: Comercial, Líder, Cliente, HubSpot Deal, Drive
         │ • El equipo NUNCA arranca de cero
         │
         ▼
[7. EJECUCIÓN OPERATIVA EN PROYECTO]
         ├─ Encabezado: Reglas Contractuales (Gates: 2, Rondas de ajuste: max 2, Kickoff: 3d)
         ├─ Pestaña Resumen: Scope, gobernanza y equipo asignado (sin KPIs redundantes)
         ├─ Pestaña Tareas:
         │    - Bloque de Dependencias, Insumos y Aprobaciones arriba de la lista
         │    - Lista de tareas con entregables colapsados por defecto (chips cerrados)
         │    - Detalle de Tarea (TaskDetailModal):
         │        * Ciclo: Iniciar ➔ Solicitar revisión ➔ Aprobar/Devolver
         │        * Horas estimadas, ejecutadas y disponibles con barra progresiva
         │        * Prioridad (Urgente / Alta / Media / Baja) y Fechas
         │        * Responsables: Project Lead, ejecutor, colaboradores, rol cotizado
         │        * Registro formal auditado de Retrabajos por tarea
         ├─ Pestaña Equipo: Staffing y asignación semanal
         ├─ Pestaña Matriz Horas: Consolidado de consumo por Rol y por Servicio
         └─ Pestaña Configuración y Actividad
         │
         ▼
[8. BANDEJA CONTEXTUAL: MI DÍA]
         │ • Comercial: Oportunidades por asignar, cotizaciones pendientes, formalización
         │ • Líder de Alcance: Oportunidades asignadas para dimensionar alcance técnico
         │ • Project Lead: Tareas en revisión (aprobar/devolver), blockers, insumos vencidos
         │ • Colaborador: Tareas asignadas activas, timer, solicitar revisión
         │
         ▼
[9. CONTROL DE CAPACIDAD Y FACTURACIÓN FISCAL]
         ├─ Capacidad: Disponibilidad semanal neta (descontando festivos y ausencias)
         └─ Alegra: Facturación electrónica DIAN a través de Vivian y Terceros fiscales
```

---

## 5. Especificación Funcional por Módulo

---

### Módulo 1: New Business

#### 1.1 Propósito
Espacio centralizado donde Comercial y los líderes de alcance/producto colaboran en el ciclo de preventa e ingeniería de propuestas: recepción de requerimientos comerciales (briefs), dimensionamiento técnico del alcance (scoping), registro del resultado comercial acordado externamente, emisión de SOW y formalización para la conversión a proyectos operativos.
- **Referencias de Código:**
  - **Vista Principal:** [`src/components/taskflow/newbusiness/NewBusinessView.tsx`](../components/taskflow/newbusiness/NewBusinessView.tsx)
  - **Scoper de Alcance:** [`src/components/taskflow/newbusiness/BacklogScoper.tsx`](../components/taskflow/newbusiness/BacklogScoper.tsx)
  - **Modal de Conversión a Proyecto:** [`src/components/taskflow/newbusiness/ConvertOpportunityModal.tsx`](../components/taskflow/newbusiness/ConvertOpportunityModal.tsx)
  - **Modal de SOW:** [`src/components/taskflow/newbusiness/SOWModal.tsx`](../components/taskflow/newbusiness/SOWModal.tsx)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`NewBusinessOpportunity`, `QuoteProposal`, `QuoteDeliverable`, `QuoteBacklogItem`)

#### 1.2 Flujo Canónico de Viaje de Usuario (Handoff Comercial ↔ Líder de Alcance)
El journey punta a punta de New Business está estructurado en 10 pasos coordinados:
1. **Comercial crea la oportunidad:** Registra el prospecto, título, tipo de proyecto (`fixed_project` o `fee_monthly`), deal de HubSpot y enlace al brief en Google Drive.
2. **Comercial asigna Líder de Alcance:** Selecciona el líder técnico responsable del dimensionamiento (Product Lead, Creative Strategy Lead, Growth Manager, CEO).
3. **Líder recibe la oportunidad:** Mi Día y la campana de notificaciones alertan al Líder con una acción prioritaria en su bandeja.
4. **Líder trabaja el Alcance Técnico:** Ingresa a la pestaña *Alcance y propuesta*, estructura los entregables y actividades (desde catálogo o desde cero), asigna roles oficiales (`StandardUhuraRole`), horas estimadas, colaboradores tentativos, diligencia las semanas productivas y adjunta el enlace a la presentación de propuesta técnica (PPT/Drive).
5. **Líder marca "Alcance listo / Notificar a Comercial":** Al pulsar el botón `Marcar alcance listo (X h)`, el sistema valida que estén diligenciados: (a) Enlace a la propuesta técnica/PPT en Drive, (b) Semanas productivas de entrega (para proyectos únicos), y (c) Horas técnicas en el alcance. La oportunidad pasa automáticamente a estado `internal_review` (*"Alcance listo · En revisión de pricing y margen"*).
6. **Comercial recibe el handoff:** Mi Día y la campana alertan a Comercial (Catalina / Luisa) que la oportunidad está lista para cotización financiera.
7. **Comercial realiza cálculo financiero externo:** Abre el **Google Sheet Oficial / Calculadora Comercial** de Uhura Group y calcula el pricing, salarios, overhead, margen comercial e impuestos.
8. **Comercial registra el resultado comercial en Orbit:** Registra en la cotización el monto total cotizado final, la moneda (`COP` o `USD`), la versión, la URL del Google Sheet de Finanzas y la URL del PDF/PPT de la propuesta comercial.
9. **Cliente aprueba la propuesta:** Tras presentar la propuesta formal, el cliente manifiesta su aprobación técnica y económica. HubSpot refleja el estado Cerrado Ganado (`won`). Comercial actualiza el estado a Ganada en Orbit.
10. **Conversión a Proyecto Operativo:** Comercial o Líder ejecuta `Convertir a Proyecto Operativo`, transfiriendo el alcance y las horas aprobadas a la ejecución.

#### 1.3 Estado Actual
**Implementado en Frontend / Parcial para Backend.**  
La navegación por pestañas (`Resumen`, `Alcance y propuesta`, `Documentos`) está operativa con reactividad en estado local. Falta persistencia en base de datos.

#### 1.4 Entidades y Campos Principales
- **`NewBusinessOpportunity`:**
  - `id`: UUID (ej. `opp-2026-001`).
  - `title`: String (Nombre del requerimiento/proyecto).
  - `prospectAccountName`: String (Nombre de la empresa prospecto).
  - `clientId`: UUID (Opcional, si el cliente ya existe en Orbit).
  - `leadUserId` / `leadUserName`: String (Líder asignado canónico: *Product Lead, Creative Strategy Lead, Growth Manager, CEO, Directora Comercial*).
  - `commercialOwner`: String (Comercial asignada: Catalina Tejada, Luisa Urazán, etc.).
  - `leadUserIds`: Array de UUIDs (Opcional, preparación interna desacoplada para asignación múltiple concurrente 1..N).
  - `contactName`, `contactEmail`, `contactPhone`: String.
  - `hubspotDealId`, `hubspotDealUrl`: String (Identificador en HubSpot).
  - `briefUrl`: String (URL al documento de Google Drive).
  - `driveFolderUrl`: String (URL de la carpeta del prospecto).
  - `status`: Enum (`discovery` | `scoping` | `quoting` | `internal_review` | `negotiation` | `won` | `lost` | `abandoned`).
  - `formalizationStatus`: Enum (`pendiente_formalizacion` | `listo_para_onboarding` | `activo`).
  - `quotes`: Array de `QuoteProposal`.
  - `startConditions`: `StartConditionsConfig`.
  - `administrativeChecklist`: `AdministrativeChecklist`.
  - `sowData`: `SowDocumentData`.
  - `convertedProjectId`: UUID (Opcional, enlace al proyecto generado).
  - `convertedAt`: Timestamp ISO.

#### 1.5 Reglas de Negocio
1. **Autonomía Multi-Quote:** Una oportunidad puede contener N versiones de cotización (`V1`, `V2`...). El cliente puede aprobar una versión específica y descartar otra.
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
Constructor jerárquico de la ingeniería de la propuesta técnica. Permite a los líderes de producto desglosar el servicio en Entregables y Actividades concretas, asignar roles presupuestados y horas estimadas, y validar el dimensionamiento antes de notificar al área comercial.
- **Referencias de Código:**
  - **Componente Scoper de Backlog:** [`src/components/taskflow/newbusiness/BacklogScoper.tsx`](../components/taskflow/newbusiness/BacklogScoper.tsx)
  - **Pestaña Alcance en New Business:** [`src/components/taskflow/newbusiness/NewBusinessView.tsx`](../components/taskflow/newbusiness/NewBusinessView.tsx)
  - **Tipos de Datos:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`QuoteDeliverable`, `QuoteBacklogItem`)

#### 3.2 Capacidades Obligatorias del Líder en Alcance
Durante la sesión de dimensionamiento técnico, el Líder de Alcance cuenta con las siguientes capacidades aprobadas:
1. **Punto de partida flexible:** Puede elegir partir de una plantilla estándar del Catálogo de Servicios (e.g. *Sitio Web Informativo WordPress*, *Tienda Shopify*) o estructurar el alcance desde cero para requerimientos a la medida.
2. **Ajuste fino de entregables y actividades:** Crear, renombrar, reordenar y eliminar entregables (frentes de servicio) y actividades atómicas.
3. **Definición de roles canónicos:** Cada actividad se asocia obligatoriamente a uno de los 12 roles canónicos de Uhura (`STANDARD_UHURA_ROLES`).
4. **Ajuste de horas estimadas:** Estimación decimal de horas por actividad, con recálculo dinámico en vivo del total por entregable y por rol.
5. **Asignación de colaboradores tentativos:** Definir colaboradores específicos cuando corresponda para proyectar staffing temprano sin romper la atomicidad del rol cotizado.
6. **Enlace a propuesta técnica (Drive / PPT):** Campo explícito para adjuntar/pegar la URL de la presentación comercial o documento de arquitectura técnica en Google Drive.
7. **Semanas productivas de entrega:** Para proyectos de alcance único (`fixed_project`), registrar la duración estimada en semanas productivas de calendario.
8. **Resumen y Rollup de Horas en Vivo:** Visualización clara de horas totales del alcance, horas por rol y distribución porcentual.
9. **Acción "Marcar Alcance Listo / Notificar a Comercial":** Cierre formal del scoping técnico mediante el botón `Marcar alcance listo (X h)`, detonando la transición a `internal_review` y alertando a Comercial.

#### 3.3 Estructura Jerárquica y Objetos
```text
Entregable (Servicio / Frente Operativo)
  └─ Actividad (QuoteBacklogItem ➔ Futura Tarea Atómica)
       ├─ Rol Presupuestado (budgetedRoleId)
       ├─ Horas Estimadas (estimatedHours)
       └─ Colaborador Tentativo Opcional (assigneeId / assigneeName)
```
- **`QuoteDeliverable`:**
  - `id`: UUID.
  - `name`: String.
  - `description`: String.
  - `taxClassification`: Enum (`tax_exempt_software` | `standard_vat_19`).
  - `backlogItems`: Array de `QuoteBacklogItem`:
    - `id`: UUID.
    - `title`: String.
    - `roleId`: String (FK a `STANDARD_UHURA_ROLES`).
    - `roleName`: String.
    - `estimatedHours`: Decimal.
    - `orderIndex`: Integer.

#### 3.4 Reglas de Negocio
1. **Rollup Dinámico:** La sumatoria de horas por rol y horas globales del proyecto se recalcula en tiempo real en frontend y debe ser revalidada por backend en cada guardado.
2. **Preparación para Ejecución:** Cada actividad del backlog está diseñada para transformarse 1:1 en una tarea atómica del proyecto operativo al momento de la conversión, garantizando que el equipo nunca arranque desde cero.

---

### Módulo 4: Alcance Técnico y Registro Comercial (Desacoplamiento Financiero)

#### 4.1 Regla Arquitectónica Vigente: Desacoplamiento de Responsabilidades
En Orbit rige la siguiente división estricta de dominios:

> **Finanzas / Google Sheet Oficial = Fuente de verdad del cálculo financiero y pricing.**  
> Finanzas gobierna y evoluciona externamente la estructura salarial, costos de nómina, multiplicadores prestacionales, overhead operativo, bandas de margen comercial, tratamiento tributario (IVA) y TRM oficial. **Orbit no calcula tarifas, márgenes, IVA, bandas financieras ni fórmulas salariales internas.**

> **Orbit = Alcance Técnico + Horas por Rol + Registro del Acuerdo Comercial Cotizado**  
> Orbit es la plataforma operativa y de gestión de entrega. Los líderes estructuran entregables, actividades y roles requeridos; el rollup consolidado de horas alimenta el análisis de Finanzas; y Comercial registra en Orbit el resultado comercial cotizado final acordado (monto cotizado, moneda, versión, enlaces al Google Sheet y PDF/PPT de propuesta, condiciones comerciales y trazabilidad hacia la creación del proyecto operativo).

#### 4.2 Retiro del Motor Financiero Interno de Orbit
Se retiraron formalmente de Orbit:
- El motor algorítmico interno (`financialEngine.ts`).
- Las constantes salariales y tarifarios hardcodeados (`constants.ts`).
- La vista de simulador comercial con sliders de margen (`FinancialCalculatorView.tsx`).
- Cualquier cálculo de overhead, margen o IVA en tiempo real dentro del frontend.

Orbit no es un cotizador contable ni una calculadora comercial; Orbit registra el resultado acordado externamente para gobernanza, emisión de SOW y conversión operativa.

#### 4.3 Entidad y Campos de Propuesta (`QuoteProposal`)
La entidad de cotización en Orbit conserva exclusivamente los campos de alcance técnico y trazabilidad comercial:
- **`id`:** UUID inmutable.
- **`opportunityId`:** UUID (FK a `NewBusinessOpportunity`).
- **`versionLabel`:** String (ej. `V1 - Alcance Inicial`, `V2 - Alcance Ajustado`).
- **`status`:** Enum (`draft` | `internal_review` | `sent` | `approved` | `rejected` | `archived`).
- **`deliverables`:** Array de `QuoteDeliverable` (snapshot de entregables, actividades y roles).
- **`totalHoursRollup`:** Sumatoria total de horas técnicas presupuestadas.
- **`totalQuotedValue`:** Monto total acordado de la propuesta en la moneda especificada.
- **`currency`:** Moneda de cotización (`COP` | `USD`).
- **`totalQuotedValueCOP`:** Persistido únicamente si la moneda es COP (`undefined` si es USD; nunca 0 ficticio ni conversión por TRM inventada).
- **`externalFinanceSheetUrl`:** Enlace directo al Google Sheet de Finanzas donde se calculó el pricing.
- **`commercialProposalUrl`:** Enlace al documento/PDF formal o PPT de la propuesta presentada al cliente.
- **`commercialNotes`:** Términos y condiciones comerciales acordadas (forma de pago, hitos, vigencia).
- **`convertedToProjectId`:** Puntero idempotente al proyecto operativo en Orbit tras la conversión.

#### 4.4 Separación entre Propuesta Aprobada y Cierre Ganado (HubSpot)
1. **Propuesta Aprobada (`status === 'approved'`):** Refleja la aceptación técnica y comercial por parte del cliente del alcance presentado.
2. **Deal Cerrado Ganado en HubSpot (`status === 'won'`):** Es la fuente de verdad comercial formal de Uhura Group.
3. **Regla de Conversión Canónica:** La conversión a proyecto operativo en Orbit **está habilitada cuando el Deal alcanza el estado 'Cerrado Ganado' en HubSpot o se marca como Ganada en Orbit**. Mientras la integración bidireccional automática con HubSpot esté en desarrollo, Comercial puede completar manualmente el flujo Ganada ➔ Convertir a proyecto en Orbit.

---

### Módulo 5: Cotización / Propuesta Económica (Quotes)

#### 5.1 Propósito
Documento formal que reúne el alcance técnico, las horas aprobadas y el resultado comercial acordado. Es el contenedor del snapshot de entregables y del acuerdo económico.
- **Referencias de Código:**
  - **Pestaña Alcance y Propuesta:** [`src/components/taskflow/newbusiness/NewBusinessView.tsx`](../components/taskflow/newbusiness/NewBusinessView.tsx)
  - **Scoping Técnico:** [`src/components/taskflow/newbusiness/BacklogScoper.tsx`](../components/taskflow/newbusiness/BacklogScoper.tsx)
  - **Generación de SOW:** [`src/components/taskflow/newbusiness/SOWModal.tsx`](../components/taskflow/newbusiness/SOWModal.tsx)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`QuoteProposal`, `QuoteStatus`)

#### 5.2 Reglas de Negocio
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

### Módulo 8: Formalización, Conversión a Proyecto y Gates

#### 8.1 Propósito
Asegurar una transición ordenada y atómica entre la oportunidad comercial aprobada y el proyecto operativo, garantizando que el equipo nunca arranque desde cero y que las condiciones contractuales de inicio queden registradas con total trazabilidad.
- **Referencias de Código:**
  - **Modal Conversión a Proyecto:** [`src/components/taskflow/newbusiness/ConvertOpportunityModal.tsx`](../components/taskflow/newbusiness/ConvertOpportunityModal.tsx)
  - **Controlador de Conversión:** [`src/sections/TaskFlowPrototype.tsx`](../sections/TaskFlowPrototype.tsx) (`handleConvertOpportunityToProject`)
  - **Modal Condiciones de Inicio:** [`src/components/taskflow/newbusiness/StartConditionsModal.tsx`](../components/taskflow/newbusiness/StartConditionsModal.tsx)
  - **Modal Checklist Administrativo:** [`src/components/taskflow/newbusiness/AdministrativeChecklistModal.tsx`](../components/taskflow/newbusiness/AdministrativeChecklistModal.tsx)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`StartConditionsConfig`, `AdministrativeChecklist`, `FormalizationStatus`)

#### 8.2 Reglas Invariantes de la Conversión a Proyecto Operativo
Al convertir una oportunidad ganada a proyecto (`handleConvertOpportunityToProject`), el sistema ejecuta las siguientes reglas determinísticas:
1. **Creación Atómica del Proyecto:** Se genera la entidad `ProjectSummaryItem` con código único (e.g. `ECO-42`, `PRJ-01`), asignando el tipo de proyecto (`fixed_project` o `fee_monthly`), cliente, fechas y líder operativo.
2. **Traslado de Entregables:** Los entregables cotizados en la propuesta aprobada (`QuoteDeliverable`) se transforman 1:1 en `ProjectDeliverable`, preservando su orden, descripción y desglose de horas cotizadas por rol (`budgetByRole`).
3. **Traslado de Tareas Atómicas:** Cada actividad del backlog cotizado (`QuoteBacklogItem`) se transforma en una tarea operativa (`TaskItem`) con:
   - `status: 'todo'`
   - `budgetedHours = item.estimatedHours`
   - `budgetedRole = item.roleName` y `budgetedRoleId = item.roleId`
   - `deliverableId = parentDeliverable.id`
   - Si la oportunidad traía actividades detalladas, se preservan 1:1; si contenía entregables macro, el proyecto arranca con esas unidades estructurales para que el equipo no empiece desde una hoja en blanco.
4. **Presupuesto Canónico de Horas:** `project.soldHours` hereda de forma inmutable el total de horas cotizadas de la propuesta (`quote.totalHoursRollup`).
5. **Trazabilidad Integral:** Se transfieren los enlaces y referencias clave: `commercialOwner`, `leadUserId`, `clientId`, `hubspotDealId`, `hubspotDealUrl`, `driveFolderUrl`, `driveFolderId`, y la referencia fiscal inicial `taxEntityId`.

#### 8.3 Estados de Transición hacia Operación
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

#### 8.4 Invariantes de Negocio
- **El RUT y la Cédula NO son bloqueantes para el inicio operativo:** Son gestionados por Vivian antes de emitir la factura legal en Alegra, pero el equipo técnico puede iniciar discovery y diseño.
- **Anticipo configurable:** En proyectos únicos cerrados es usualmente el 50%; en contratos de fee mensual se define como *No Aplica*.

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

### Módulo 11: Proyectos (Estructura Operativa, Gobernanza y Vistas)

#### 11.1 Propósito
Contenedor principal de la ejecución operativa, control presupuestal de horas, visibilidad de gobernanza contractual y entrega de valor al cliente.
- **Referencias de Código:**
  - **Vista Principal de Proyectos:** [`src/components/taskflow/ProjectsView.tsx`](../components/taskflow/ProjectsView.tsx)
  - **Pestaña Resumen Ejecutivo:** [`src/components/taskflow/projects/ProjectOverviewTab.tsx`](../components/taskflow/projects/ProjectOverviewTab.tsx)
  - **Pestaña Tareas Operativas:** [`src/components/taskflow/projects/ProjectTasksTab.tsx`](../components/taskflow/projects/ProjectTasksTab.tsx)
  - **Sección de Dependencias e Insumos:** [`src/components/taskflow/projects/ProjectDependenciesSection.tsx`](../components/taskflow/projects/ProjectDependenciesSection.tsx)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`ProjectProfile`, `ProjectSummaryItem`, `ProjectType`, `ProjectStatus`)

#### 11.2 Estructura Aprobada de Navegación Interna del Proyecto
La ficha de proyecto se organiza en la siguiente estructura de pestañas oficial:
```text
1. Resumen: Visión ejecutiva del proyecto, alcance técnico, gobernanza y equipo asignado.
2. Tareas: Tablero operativo y lista de tareas con entregables colapsados por defecto y bloque de dependencias.
3. Equipo: Matriz de staffing, colaboradores asignados, horas semanales y roles.
4. Matriz Horas: Matriz de consumo presupuestal con vistas consolidadas de "Horas por Rol" y "Horas por Servicio/Entregable".
5. Backlog (Opcional): Visible únicamente cuando el proyecto contiene fases estructuradas.
6. Actividad: Auditoría cronológica de cambios y eventos del proyecto.
7. Configuración: Parámetros del proyecto, fechas oficiales y estados de formalización.
```

> **DECISIÓN DE DISEÑO Y REDUCCIÓN DE RUIDO VISUAL (PESTAÑA RESUMEN):**  
> Para evitar saturación y duplicidad cognitiva, la pestaña **Resumen** se optimizó radicalmente:
> 1. **Eliminación de KPI Cards Duplicadas:** Las 4 tarjetas de resumen ("Presupuesto", "Ejecución", "Entregables", "Cronograma") fueron retiradas del cuerpo de Resumen porque ya se muestran de manera destacada y siempre visible en la tarjeta superior del encabezado del proyecto.
> 2. **Eliminación de la Sección de Reworks Global:** Se retiró el bloque "Rondas de Ajuste & Retrabajos" del cuerpo de Resumen, dado que los retrabajos se auditan formalmente a nivel atómico en cada tarea y su límite contractual se visibiliza en la gobernanza.
> 3. **Traslado de Dependencias a Tareas:** La sección "Dependencias, Insumos & Aprobaciones de Cliente" se trasladó a la pestaña **Tareas**, situándose inmediatamente arriba de la lista de tareas para que el equipo resuelva bloqueos antes de iniciar su jornada de ejecución.

#### 11.3 Gobernanza Contractual en el Encabezado del Proyecto
En el encabezado del proyecto, especialmente para proyectos de alcance único (`fixed_project`), se visibilizan las reglas contractuales fundamentales acordadas:
- **Gates de Aprobación Incluidos:** Número de hitos formales de validación con el cliente (Default: 2 gates, ej. Gate 1: UX/Contenido, Gate 2: Implementación/QA).
- **Rondas de Ajuste por Gate:** Límite contractual de iteraciones por cada gate (Default: máximo 2 tandas de ajustes: 1 tanda integral grande y 1 tanda de pulido menor).
- **Devolución de Kickoff:** Ventana de revisión y respuesta inicial (3 días hábiles sin consumo de capacidad).
- **Trinomio de Cronograma:** Baseline inicial (inmutable), Forecast proyectado (según dependencias confirmadas) y Fecha Real de cierre.

#### 11.4 Entidades y Campos Principales
- **`ProjectProfile` (`ProjectSummaryItem`):**
  - `id`: UUID.
  - `code`: String (Código corto de proyecto, ej. `ECO-42`, `ZAP-01`).
  - `name`: String.
  - `clientId`: UUID (FK a `ClientProfile`).
  - `type`: `ProjectType` (`fixed_project` | `fee_monthly` | `internal_non_billable`).
  - `status`: Enum (`discovery` | `planning` | `in_progress` | `in_review` | `completed` | `paused` | `cancelled`).
  - `formalizationStatus`: Enum (`pendiente_formalizacion` | `listo_para_onboarding` | `activo`).
  - **Cronograma Oficial (`fixed_project`):**
    - `baselineStartDate`, `baselineEndDate`: Date (Plan original acordado. Inmutable una vez iniciado).
    - `forecastEndDate`: Date (Fecha actualmente proyectada según dependencias y reforecasts confirmados).
    - `actualEndDate`: Date | null (Fecha real de cierre al culminar la ejecución).
  - `scheduleConfig`:
    - `clientKickoffWaitDays`: Integer (Default: 3 días hábiles. No consume capacidad).
    - `gateApprovalWaitDays`: Integer (Default: 5 días hábiles por gate. No consume capacidad).
    - `gateCount`: Integer (Default: 2 gates).
    - `includedReworkRounds`: Integer (Default: 2 rondas incluidas).
  - `leadUserId`: UUID (Líder del proyecto).
  - `soldHours`: Decimal (Total de horas vendidas según cotización aprobada — Fuente de verdad presupuestal canónica).
  - `soldValueCOP`: Decimal (Valor económico del contrato).
  - `dependencies`: Array de `ProjectDependency` (Insumos, accesos y aprobaciones del cliente).
  - `scheduleHistory`: Array de `ProjectScheduleChange` (Auditoría inmutable de reforecasts).
  - `reworkRounds`: Array de `ProjectReworkRound` (Historial de iteraciones de feedback y ajustes).
  - `projectHealth`: Objeto `ProjectHealthResult` calculado por el motor multivectorial.

#### 11.5 Dependencias e Insumos de Cliente (`ProjectDependency`)
Entidad persistente para insumos, accesos o gates que condicionan la ruta crítica:
- `id`: UUID.
- `projectId`: FK a `ProjectProfile`.
- `deliverableId`: FK opcional a `ProjectDeliverable`.
- `title`: String (ej. *Manual de Marca*, *Aprobación Gate 1*, *Credenciales Hosting*).
- `type`: Enum (`kickoff_input` | `client_input` | `approval` | `access` | `internal_dependency`).
- `ownerType`: Enum (`client` | `uhura`).
- `followUpOwnerUserId`: FK a User (Client Relationship o Líder responsable).
- `requestedAt`: Date.
- `expectedDate`: Date.
- `completedAt` / `receivedAt`: Date | null.
- `status`: Enum (`pending` | `received` | `overdue` | `waived`).
- `blocking`: Boolean (Indica si detiene la ruta crítica de entrega).
- `lastFollowUpAt`: DateTime | null.
- `followUpNotes`: String | null.

#### 11.6 Historial de Reforecast y Atribución (`ProjectScheduleChange`)
- `id`: UUID.
- `projectId`: FK a `ProjectProfile`.
- `previousForecastEndDate`, `newForecastEndDate`: Date.
- `deltaBusinessDays`: Integer.
- `cause`: Enum (`client_input_delay` | `client_approval_delay` | `internal_rework` | `internal_execution_delay` | `scope_change` | `other`).
- `confirmedByUserId`: FK a User (Exclusivo Líder o Dirección Ejecutiva).
- `note`: String (Justificación obligatoria).
- `createdAt`: DateTime inmutable.

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
  - `budgetByRole`: Array de `DeliverableRoleBudget` (`roleId`, `quotedHours`, `executedHours`).
- **Métrica Clave de Control:**
  $$\text{Desviación de Horas} = \text{executedHours} - \text{quotedHours}$$

---

### Módulo 13: Tareas y Detalle Operativo (TaskDetailModal)

#### 13.1 Propósito
Unidad atómica de trabajo ejecutable por el equipo con ciclo de vida completo de ejecución, validación de calidad, registro de tiempo y trazabilidad de retrabajos.
- **Referencias de Código:**
  - **Modal de Detalle de Tarea:** [`src/components/taskflow/TaskDetailModal.tsx`](../components/taskflow/TaskDetailModal.tsx)
  - **Pestaña Tareas de Proyecto:** [`src/components/taskflow/projects/ProjectTasksTab.tsx`](../components/taskflow/projects/ProjectTasksTab.tsx)
  - **Tarjeta de Tarea en Kanban:** [`src/components/taskflow/tasks/TaskCard.tsx`](../components/taskflow/tasks/TaskCard.tsx)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`TaskItem`, `TaskStatus`, `TaskPriority`, `TaskRework`, `TaskDeliverable`)

#### 13.2 Visualización en Pestaña Tareas: Entregables Plegados y Dependencias
1. **Entregables Plegados por Defecto (Chips Cerrados):**  
   Para evitar la saturación visual al abrir un proyecto con decenas de tareas, los bloques de entregables inician cerrados/colapsados por defecto (`expandedDeliverables = {}`). Cada bloque muestra su chip de resumen con conteo de tareas y horas. El usuario puede expandir o colapsar individualmente cualquier entregable o usar los botones de acción rápida *Expandir todo* / *Colapsar todo*.
2. **Dependencias e Insumos Arriba de la Lista:**  
   La sección `ProjectDependenciesSection` vive en la parte superior de la pestaña Tareas, permitiendo a los líderes y colaboradores visualizar de un vistazo si existen insumos o accesos pendientes de cliente antes de iniciar tareas bloqueadas.

#### 13.3 Detalle de Tarea: Flujo Operativo en `TaskDetailModal`
El modal de detalle de tarea representa la experiencia integral de ejecución con los siguientes 7 componentes funcionales:

1. **Franja Superior de Estado con Próximo Paso Contextual:**
   - Si la tarea está en **Por Hacer (`To Do`)**: Muestra *"Pendiente de inicio · Asignada a [Colaborador]"* y el botón primario `[ Iniciar tarea ]`.
   - Si la tarea está en **En Progreso (`In Progress`)**: Muestra *"Ejecución activa por [Colaborador] · Al terminar entregables, solicita revisión"* y el botón `[ Solicitar revisión → ]`.
   - Si la tarea está en **En Revisión (`Review`)**: El revisor o líder ve dos opciones inmediatas:
     - `[ Devolver ]`: Abre el diálogo para documentar observaciones y regresa la tarea a `In Progress`.
     - `[ Aprobar y Completar ]`: Valida la entrega y transiciona la tarea a `Done`.
   - Si la tarea está en **Completada (`Done`)**: Permite la acción `[ Reabrir ]` si surgieron novedades.
   - *Nota de producto:* Al terminar la ejecución, toda tarea pasa por revisión de calidad/liderazgo para asegurar el estándar de entrega.

2. **Tarjeta de Estado y Prioridad:**
   - Selector claro de prioridad: `Urgente` (rojo), `Alta` (naranja), `Media` (ámbar), `Baja` (azul/slate).

3. **Control Presupuestal de Horas:**
   - Visualización explícita de: **Horas estimadas**, **Horas ejecutadas** (vía cronómetro o log manual) y **Horas disponibles restantes**.
   - Barra de consumo progresiva con cambio semántico de color (verde ➔ ámbar ➔ rojo al superar el 100%).

4. **Cronograma Operativo:**
   - Fechas visibles de **Fecha de Inicio** y **Fecha Límite de Entrega (`dueDate`)**.

5. **Responsables y Rol Cotizado:**
   - **Project Lead:** Líder responsable del proyecto y de la aprobación final.
   - **Responsable de la Tarea:** Colaborador principal asignado.
   - **Colaboradores Ejecutores:** Miembros del equipo que registran horas en la tarea con su cuota correspondiente.
   - **Rol Cotizado Canónico (`budgetedRole`):** Muestra el perfil contractual que fue presupuestado en New Business (ej. *Front-End Dev*, *Digital Designer*), permitiendo auditar desvíos de seniority.

6. **Mensajes, Entregables y Actividad:**
   - Pestaña de conversación y mensajes de trabajo con menciones `@`, archivos adjuntos y enlaces formateados (Figma, Drive, GitHub, Loom).
   - Pestaña de Entregables con links de entrega, checklist de criterios de aceptación y marcación de estado.
   - Pestaña de Actividad con auditoría inmutable de cambios de estado, reasignaciones y registros de tiempo.

7. **Registro Formal de Retrabajos / Rondas de Ajuste (`TaskRework`):**
   - Panel dedicado para auditar iteraciones de ajuste sobre la tarea:
     - **Número de Ronda:** Ronda 1, Ronda 2, Ronda 3...
     - **Origen:** `client` (*Por Cliente · Solicitud de ajuste externo*) vs. `internal` (*QA / Interno · Control de calidad Uhura*).
     - **Causa Raíz:** Feedback de cliente, Error interno de QA o Cambio de alcance.
     - **Horas Adicionales Incurridas:** Horas dedicadas a subsanar el ajuste.
     - **Solicitante:** Nombre de la persona (cliente o líder interno) que exigió la ronda.
     - **Justificación:** Motivo documentado del ajuste.
     - **Trazabilidad:** Al registrarse el retrabajo, se inserta automáticamente un evento estructurado en el feed de mensajes de la tarea (`🔄 [Retrabajo Ronda X · Yh]: Motivo`) para conocimiento de todo el equipo.

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
1. **Capacidad Semanal Configurable por Perfil:** La capacidad base de un colaborador es una cantidad semanal pura definida en su perfil (`UserProfile.capacityHours`, ej. 40h semanales según jornada contractual legal). No se aplican deducciones fijas artificiales, fórmulas de `h/mes ÷ 4` ni reservas universales de horas internas (ej. prohibida la equivalencia automática `40h contractuales = 32h productivas + 8h internas`).
2. **Imputación Real de Trabajos Internos y de Cliente:** Los rituales, ceremonias, capacitaciones y gestiones internas reales se registran cuando ocurren contra proyectos y tareas de tipo `internal_non_billable`. Los seguimientos, reuniones y actividades atribuibles a un cliente se imputan al proyecto correspondiente del cliente.
3. **Ecuación Canónica de Capacidad:**
   $$\text{Capacidad Libre} = \text{Capacidad Semanal Configurada} - \text{Festivos Aplicables} - \text{Ausencias Aprobadas} - \text{Carga Planificada de Staffing}$$
   - **Base Diaria de Cálculo:** Para una semana estándar laboral de lunes a viernes, la capacidad diaria para efectos de festivos o ausencias se deriva estrictamente como:
     $$\text{Capacidad Diaria} = \frac{\text{capacityHours}}{5}$$
4. **Fines de Semana y Festivos:** No se consideran en la disponibilidad proyectada. Cada festivo oficial colombiano en día hábil resta su equivalente diario (`capacityHours / 5`) a la capacidad base de esa semana. Si alguien registra horas en sábado o domingo, se computa como ejecución real, pero nunca como disponibilidad planificada.
5. **Impacto Directo de Ausencias y Vacaciones (`TeamAbsenceEvent`):** Las ausencias activas/aprobadas descuentan horas de los días hábiles coincidentes:
   $$\text{Disponibilidad Neta} = \max(0, (\text{Capacidad Semanal Configurada} - \text{Festivos}) - \sum \text{Deducción Ausencias Aprobadas})$$
   Si un colaborador tiene vacaciones aprobadas durante toda la semana hábil, su capacidad neta disponible es 0h y la carga planificada no computa como sobrecarga ni penaliza la salud operativa.

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

### Módulo 17: Mi Día (Home Contextual y Bandeja de Acción)

#### 17.1 Propósito
Pantalla principal de inicio para todo usuario de Orbit, diseñada como una bandeja de acción contextual viva que responde en tiempo real a la pregunta: *"¿Quién tiene la siguiente acción?"*. Elimina la dispersión entre dashboards analíticos y listas de tareas desconectadas, organizando el día en tres niveles esenciales:
1. **¿Qué requiere mi atención hoy?** (Bandeja dinámica de excepciones y handoffs por rol; si el contador es 0, la sección desaparece).
2. **¿Qué tengo que hacer hoy?** (Lista priorizada de tareas asignadas para hoy con timer integrado y botón para solicitar revisión).
3. **¿Cómo voy?** (Progreso de horas de la jornada, carga rápida y consulta de registros de tiempo).

- **Referencias de Código:**
  - **Componente Principal Mi Día:** [`src/components/taskflow/MiDiaView.tsx`](../components/taskflow/MiDiaView.tsx)
  - **Tipos y Perspectivas:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts)
  - **Motor de Vida de Equipo:** [`src/components/taskflow/copilot/teamLifeEngine.ts`](../components/taskflow/copilot/teamLifeEngine.ts)

#### 17.2 Perspectivas y Handoffs Contextuales por Rol
Mi Día adapta dinámicamente sus secciones de atención según el rol activo del usuario:

- **1. Comercial (Catalina Tejada / Luisa Urazán / Equipo Comercial):**
  - **Asignación de Líder:** Detecta oportunidades comerciales creadas que aún no tienen líder de alcance asignado.
  - **Registro de Cotización Externa (Handoff de Alcance Listo):** Detecta oportunidades en estado `internal_review` donde el Líder ya marcó el alcance técnico como listo (`Marcar alcance listo`). Muestra la acción para realizar el cálculo financiero en el Google Sheet oficial y registrar el valor cotizado en Orbit.
  - **Formalización Administrativa:** Detecta oportunidades ganadas que requieren checklist de facturación (RUT, correo de facturación) o conversión formal a proyecto operativo.

- **2. Líder de Alcance (Product Lead / Creative Strategy Lead / Growth Manager):**
  - **Scoping Técnico Pendiente:** Muestra las oportunidades comerciales que Comercial le asignó para dimensionar alcance técnico (backlog, entregables, roles y horas).
  - **Handoff a Comercial:** Al completar la propuesta, el botón `Marcar alcance listo (X h)` remueve la oportunidad de la bandeja del Líder y la transfiere automáticamente a la bandeja de Comercial.

- **3. Project Lead (Líder del Proyecto Operativo):**
  - **Solicitudes de Revisión Pendientes:** Muestra las tareas que los colaboradores finalizaron y enviaron a revisión (`Review`). El líder puede `Aprobar y Completar` o `Devolver` con observaciones de ajuste.
  - **Bloqueos Operativos del Equipo:** Tareas marcadas con `isBlocked: true` que requieren intervención para destrabar el frente de trabajo.
  - **Desvíos Presupuestales:** Alertas tempranas de tareas o entregables donde `horas consumidas > horas presupuestadas`.
  - **Dependencias e Insumos Críticos Vencidos:** Insumos o accesos de clientes (`ownerType: 'client'`) que han superado la fecha límite y amenazan la ruta crítica.

- **4. Colaborador / Operativo (Front-End Dev, Diseñadores, Copywriters, etc.):**
  - **Tareas Asignadas para Hoy:** Lista clara y priorizada de tareas asignadas activas en orden de urgencia.
  - **Acción Operativa Directa:** Inicio directo de cronómetro (timer), registro de horas y botón `Solicitar revisión ->` al terminar los entregables para pasar la tarea al líder.
  - **Retrabajos Asignados:** Notificación destacada de tareas devueltas en revisión o con retrabajo registrado que requieren corrección prioritaria.

- **5. Dirección / Management (CEO / Operaciones):**
  - Proyectos en riesgo en el motor multivectorial de salud.
  - Capacidad libre del equipo semana a semana para evaluar nuevos negocios.
  - Excepciones financieras y operativas de alto nivel sin ruido administrativo menor.

#### 17.3 Articulación entre Mi Día y la Campana de Notificaciones
Orbit utiliza un modelo complementario de comunicación:
- **Mi Día:** Es la **bandeja de trabajo estructurada** donde el usuario encuentra sus tareas prioritarias, pendientes de revisión y handoffs accionables organizados por jerarquía.
- **Campana de Notificaciones (In-App):** Es el **canal de eventos inmediatos** que notifica en tiempo real cuando ocurre un handoff (ej. *"Comercial te asignó la oportunidad X"*, *"Paola marcó el alcance listo para la oportunidad Y"*, *"Diego solicitó revisión en la tarea Z"*). Ambos sistemas consumen el mismo modelo de eventos sin duplicar lógica de negocio.

#### 17.4 Eventos de Equipo en Mi Día (Cumpleaños, Aniversarios y Ausencias)
Mi Día puede mostrar de forma discreta y no invasiva:
- **Cumpleaños de hoy y próximos:** Calculados en tiempo de ejecución a partir de `birthDate` persistido en el perfil (`UserItem`).
- **Aniversarios en Uhura:** Calculados a partir de `fecha_ingreso` persistido en el perfil (derivando la fecha anual del año en curso y los años cumplidos).
- **Ausencias y vacaciones próximas relevantes:** Obtenidas del modelo canónico `TeamAbsenceEvent` (eventos aprobados y programados).
- *Criterio UI:* Información visible de manera sobria y secundaria, sin competir con la lista de tareas operativas ni saturar el home con widgets pesados.

---

### Módulo 18: Bucky y La Colonia (Espacio Social & Lúdico)

#### 18.1 Propósito y Definición Funcional Cerrada
- **Bucky:** Asistente contextual de Orbit que acompaña la jornada laboral, alerta sobre timers olvidados, tareas bloqueadas y deadlines. En la vista global de Orbit actúa como widget flotante; al ingresar a La Colonia, el widget flotante global desaparece para dar paso al Bucky protagonista dentro de su hábitat.
- **La Colonia:** *"La Colonia es el espacio social y lúdico de Orbit para desconectarse unos minutos y compartir pequeños retos con el equipo."*
- **Alcance Funcional Simplificado & Presentación Inmersiva (Videojuego):**
  1. **Pantalla Principal Inmersiva (Hábitat Completo):** En lugar de un dashboard corporativo con tarjetas fragmentadas, el Diorama Ribereño es el escenario interactivo completo. Las estructuras funcionan como portales visuales de navegación directa:
     - 🏡 **Taller de Cedro (Izquierda):** Portal directo a La Torre de Cedro (15s).
     - 🌸 **Jardín de Nenúfares (Derecha):** Portal directo a Reflejos de Nenúfar (15s).
     - 🔭 **Observatorio Orbital (Arriba):** Portal directo al Ranking semanal (#2 esta semana).
  2. **Bucky como Host Activo & Narrador Emocional:** Bucky guía emocionalmente convirtiendo los datos fríos en narrativa viva:
     - Si hay un reto recibido: *"Oscar te dejó 85 puntos en Torre de Cedro 👀"* -> Botón primario: `[ SUPERAR A OSCAR · 15s ]`.
     - Si no hay retos: *"Diego sigue arriba con 120. ¿Probamos una?"* -> Botón primario: `[ JUGAR TORRE DE CEDRO · 15s ]`.
     - Si acaba de jugar: *"106 👀 Te faltaron 14 para alcanzar a Diego."* -> `[ RETAR A ALGUIEN ]` / `[ OTRA RONDA ]`.
  3. **Una Sola Acción Primaria por Estado:** La interfaz detecta la acción más relevante y la sitúa en el centro del hábitat con máxima jerarquía, reduciendo la fatiga de decisiones.
  4. **Retos como Inbox Social (No Tabla):** Bandeja directa tipo mensajes de juego (retos recibidos con botón `[ Jugar ]`, esperando respuesta de compañeros, e historial de revanchas).
  5. **Ranking Visual, Aspiracional y Humano:** Podio con Top 3 y pin de posición del usuario sin tablas densas corporativas.
  6. **Ambientación Emocional Sutil:** Selector de ambiente (Noche / Atardecer / Día) controlado con un botón sutil `☾` y guardado como preferencia local.
  7. **Momento de Recompensa Cuidado:** Pantalla final de minijuego con Bucky celebrando, micro-confetti, audio chimes opcionales y narrativa de superación.
- **Referencias de Código:**
  - **Vista Principal:** [`src/components/taskflow/colonia/LaColoniaView.tsx`](../components/taskflow/colonia/LaColoniaView.tsx)
  - **Diorama Experiencial:** [`src/components/taskflow/colonia/ColoniaDiorama.tsx`](../components/taskflow/colonia/ColoniaDiorama.tsx)
  - **Microjuegos & Retos:** [`src/components/taskflow/colonia/ColoniaMinigames.tsx`](../components/taskflow/colonia/ColoniaMinigames.tsx)
  - **Motor de Retos & Rankings:** [`src/components/taskflow/colonia/coloniaEngine.ts`](../components/taskflow/colonia/coloniaEngine.ts)
  - **Tipos de Datos:** [`src/components/taskflow/colonia/types.ts`](../components/taskflow/colonia/types.ts)

#### 18.2 Directrices Técnicas para Backend y Consumo Contextual (Cierre de Checkpoint)
- Bucky y La Colonia son componentes **Evolutivos / No Bloqueantes**.
- **1. Persistencia de Prototipo vs. Backend Autoritativo (Retos Asíncronos):**  
  La persistencia local actual en `localStorage` (`GameResult`, `ColonyChallenge` y `WeeklyLeaderboardEntry`) es **exclusivamente de prototipo frontend** para validar la experiencia lúdica y social. En producción, el backend (Django REST Framework / PostgreSQL) será la **fuente de verdad autoritativa** que permitirá orquestar retos asíncronos entre usuarios físicos de la organización y generar un ranking semanal compartido unificado.
- **2. Fuente Canónica para "Retar a Alguien":**  
  El selector de rivales en los retos consume directamente los colaboradores activos desde la fuente canónica de **Equipo & Accesos** (`users: UserItem[]`), excluyendo de forma estricta al usuario activo en sesión (`currentUser.id`) y a colaboradores en estado inactivo. **Queda terminantemente prohibido hardcodear listas de compañeros o mantener un segundo directorio de personas en La Colonia.**
- **3. Historial Mínimo Estricto (Sin Competitividad Compleja):**  
  El historial de retos se mantiene única y exclusivamente como una **vista mínima de retos recientes y completados con opción de revancha inmediata**. No se crearán estadísticas históricas acumulativas, ligas, temporadas, rankings históricos ni perfiles competitivos de jugadores.
- **4. Contratos Mínimos de Backend y Read Model Derivado:**  
  - **`GameResult` (Tabla canónica de eventos de juego):**  
    `id` (UUID), `userId` (FK a User), `userName` (String), `gameId` (`'torre'` | `'nenufar'`), `score` (Integer), `createdAt` (Timestamp).
  - **`ColonyChallenge` (Tabla canónica de retos asíncronos 1-a-1):**  
    `id` (UUID), `gameId` (`'torre'` | `'nenufar'`), `challengerUserId` (FK a User), `challengerScore` (Integer), `challengedUserId` (FK a User), `challengedScore` (Integer, opcional hasta resolución), `status` (`'pending'` | `'completed'`), `winnerUserId` (FK a User, opcional / derivado a partir de la comparación de puntuaciones; no debe introducir persistencia redundante obligatoria en base de datos), `createdAt` (Timestamp), `completedAt` (Timestamp, opcional).
  - **`WeeklyLeaderboardEntry` (Read Model Proyectado / No Requiere Tabla Propia):**  
    Funciona como una estructura derivada / consulta agregada sobre `GameResult` filtrada por la semana civil en curso (`weekStartDate` a `weekEndDate`) calculando `MAX(score)` agrupado por `userId`. **Indunova no debe asumir que requiere una tabla física con persistencia propia en PostgreSQL.**
- **5. Conexión con Sistema de Notificaciones de Orbit:**  
  Los avisos de reto ("Te han retado en La Torre de Cedro / Reflejos de Nenúfar", "Han superado tu marca", "Reto completado") deberán conectarse al **sistema central de notificaciones de Orbit** (in-app / campana) como requisito funcional una vez el backend esté disponible. Las notificaciones push quedan como capacidad evolutiva futura, no como dependencia actual.
- **No deben frenar la portabilidad ni la construcción del backend transaccional de Indunova.**
- Bucky consume eventos emitidos por el core (ej. `EVENT_TIMER_EXCEEDED_4H`, `EVENT_PROJECT_OVER_BUDGET`), no debe inventar lógica de negocio aislada.
- **Consumo Contextual de Datos de Equipo:**  
  Bucky puede consumir:
  - `birthDate` (dato persistido del perfil)
  - `fecha_ingreso` (dato persistido del perfil)
  - `TeamAbsenceEvent` (ausencias y vacaciones aprobadas)
  - Opcionalmente `hobbies` e intereses ya existentes en el perfil (`UserItem.hobbies`)  
  para generar mensajes contextuales oportunos y cercanos.
  - *Ejemplos conceptuales:*
    - Felicitación de cumpleaños ("¡Hoy está de cumpleaños [Nombre]! 🎉").
    - Celebración de aniversario en Uhura ("Hoy [Nombre] cumple [X] años en la Colonia Uhura 🚀").
    - Aviso preventivo de ausencia próxima ("Recuerda coordinar entregables con [Nombre], estará en vacaciones a partir del jueves 🌴").
  - *Regla Estricta:* **No crear lógica avanzada de bienestar, workflows de aprobación de vacaciones ni automatizaciones complejas adicionales.**

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

> **Aclaración de Estado de Implementación:** Este repositorio frontend/contrato de TypeScript deja preparada la especificación canónica, tipos, vistas y validaciones de interfaz para que **Indunova implemente el backend real** (persistencia en PostgreSQL, endpoints en Django REST Framework, transacciones ACID y cálculo/persistencia definitiva del SLA e integraciones). **El backend Django/PostgreSQL no está implementado en este repositorio.**

| Módulo Orbit | Estado Frontend / Contrato | UI | Lógica Dominio Frontend | Persistencia Requerida en Backend | Backend a implementar por Indunova | Dependencias Directas | Bloquea Portabilidad? |
|---|---|---|---|---|---|---|---|
| **Clientes** | Preparado (Frontend) | Completa | Completa | PostgreSQL | Modelos `Client`, `TaxEntity` | Ninguna | **SÍ (Core)** |
| **Catálogo / Plantillas** | Preparado (Frontend) | Completa | Completa | PostgreSQL | Modelos `ProductTemplate` | Roles | **SÍ (Core)** |
| **New Business** | Preparado (Frontend) | Completa | Completa | PostgreSQL | Modelo `Opportunity` | Clientes, Roles | **SÍ (Core)** |
| **Alcance & Backlog** | Preparado (Frontend) | Completa | Completa | PostgreSQL | Modelos `Deliverable`, `Item` | Plantillas, Roles | **SÍ (Core)** |
| **Pricing / Finanzas** | Desacoplado (Google Sheet) | Completa | 100% (Sheet Externo) | Sheet Finanzas | Cálculo salarial/overhead externo | Ninguna | **NO (Externo a Finanzas)** |
| **Propuesta / Quotes** | Preparado (Frontend) | Completa | Completa | PostgreSQL | Modelo `QuoteProposal` | New Business, Alcance | **SÍ (Core)** |
| **SOW Contractual** | Preparado (Frontend) | Completa | Completa | PostgreSQL / Doc | Modelo `SOWDocument` | Quotes | NO (UI Liviana) |
| **Formalización / Gates** | Preparado (Frontend) | Completa | Completa | PostgreSQL | Campos en `Opportunity/Project`| SOW, Quotes | **SÍ (Core)** |
| **Proyectos** | Preparado (Frontend) | Completa | Completa | PostgreSQL | Modelo `Project` | Clientes, New Business| **SÍ (Core)** |
| **Entregables** | Preparado (Frontend) | Completa | Completa | PostgreSQL | Modelo `ProjectDeliverable` | Proyectos, Roles | **SÍ (Core)** |
| **Tareas** | Preparado (Frontend) | Completa | Completa | PostgreSQL | Modelo `Task` | Entregables, Proyectos| **SÍ (Core)** |
| **Staffing / Asignación** | Preparado (Frontend) | Completa | Completa | PostgreSQL | Modelo `ProjectAssignment` | Usuarios, Proyectos | **SÍ (Core)** |
| **Capacidad** | Diseñado (Frontend) | Completa | Completa | Engine Backend | Endpoints agregados | Asignaciones, TimeLogs| **SÍ (Core)** |
| **Time Tracking** | Preparado (Frontend) | Completa | Completa | PostgreSQL | Modelo `TimeLog`, Locks | Tareas, Usuarios | **SÍ (Core)** |
| **Mi Día** | Refactor UX | Completa | Completa | Vistas agregadas| Queries agrupadas | Tareas, TimeLogs | NO (Frontend View) |
| **Documentos / Drive** | Manual | Completa | 30% (Manual) | Links en DB | Integración Google Drive API | Ninguna | NO (Evolutivo) |
| **Alegra / Fiscal** | Manual Vivian | Completa | Manual | IDs en DB | Integración Alegra API | Clientes | NO (Evolutivo) |
| **Bucky / La Colonia** | Prototipo | Completa | Frontend | State opcional | Modelos GameResult / Challenge (Asíncronos) | Ninguna | NO (Evolutivo) |

---

## 8. Auditoría de Inconsistencias entre Prototipo UI y Especificación

Durante la auditoría end-to-end de UAT se detectaron y reconciliaron las siguientes inconsistencias funcionales:

1. **`initialStatus` ignorado en conversión:**  
   El modal de conversión permite seleccionar si el proyecto arranca en `Pendiente de Formalización` o `Activo`. En el controlador del prototipo estaba forzándose siempre a `'Activo'`. **Regla:** Debe respetarse el valor seleccionado por el líder.
2. **`startConditionsConfig` no persistido en proyecto:**  
   Las condiciones de formalización (si el anticipo aplica o si fue recibido) se enviaban en el evento pero no se almacenaban en la entidad del proyecto creado.
3. **Datos fiscales no propagados:**  
   El checklist de Vivian (RUT recibido, correo facturación) se guardaba en la oportunidad pero no se inyectaba a la entidad `ClientTaxEntity` del cliente recién creado.
4. **Desconexión con SOW Histórico:**  
   Si el líder editaba los textos del SOW en New Business, estos se guardaban en la oportunidad, pero el proyecto recién creado no quedaba con un puntero directo a ese SOW aprobado.
5. **Staffing Automático Vacío y Tareas no en Blanco:**  
   Las tareas se crean correctamente a partir de las actividades cotizadas con su presupuesto de horas y su rol cotizado correspondiente (`budgetedRole`, `budgetedRoleId`). Nacen con `assigneeAllocations = []` (sin persona física asignada) pero listas para la ejecución operativa; el equipo no empieza desde cero.
6. **Desacoplamiento de Cálculos Salariales:**  
   Los cálculos salariales, prestaciones y márgenes de pricing están desacoplados de Orbit y gobernados por Finanzas externamente; Orbit no mantiene tarifas hardcodeadas ni calcula márgenes.
7. **Regla de Cronómetro / Timer en Pausa:**  
   El tiempo transcurrido con el cronómetro en estado `PAUSED` **bajo ninguna circunstancia cuenta como tiempo efectivo de trabajo**. Únicamente los lapsos en estado activo `RUNNING` suman a la duración total del `TimeLog` al momento de hacer `Stop`.
8. **Disparador Canónico de New Business (Brief + Scoping):**  
   New Business no se inicia cuando un deal se marca como "ganado" en el CRM ni sustituye la prospección comercial en frío. Se dispara exclusivamente cuando **se recibe un brief comercial calificado desde HubSpot que exige dimensionamiento técnico de entregables (scoping) y costeo operativo**.
9. **Desacoplamiento Financiero y Fuente de Verdad Económica:**  
   La fuente de verdad financiera de Uhura Group es el **Google Sheet oficial de Finanzas**. Orbit desacopló y retiró su motor financiero interno (`financialEngine.ts`, constantes salariales y calculadora de márgenes). Orbit estructura el alcance técnico y las horas por rol, y registra con fidelidad el resultado comercial acordado externamente.
10. **Eliminación de Cotizaciones Huérfanas y Única Fuente de Verdad:**  
    En el prototipo existía un contenedor huérfano (`createdQuotes`) y una vista independiente (`cotizador`) desconectada de las oportunidades. **Corrección de dominio:** Se eliminó la vista y el estado paralelo. Toda cotización (`QuoteProposal`) debe existir y persistirse exclusivamente dentro de una `NewBusinessOpportunity`. En el flujo "Usar en New Business" del catálogo de plantillas, la oportunidad debe existir previamente antes de fijar y persistir el snapshot de cotización.
11. **Detalle de Tarea y Ciclo Operativo (`TaskDetailModal`):**  
    En UAT se detectó que el detalle de tarea difería entre staging y el prototipo. **Reconciliación oficial:** La experiencia aprobada incluye: franja superior con próximo paso operativo (`Iniciar tarea` ➔ `Solicitar revisión ->` ➔ `Aprobar y Completar / Devolver`), prioridad (`Urgente` a `Baja`), barra de consumo de horas (estimadas, ejecutadas, disponibles), cronograma (inicio y entrega), responsables (Project Lead, asignado, colaboradores y rol cotizado) y registro formal auditado de retrabajos (número de ronda, causa raíz, horas y solicitante).
12. **Reducción de Ruido en Resumen de Proyecto y Entregables Plegados:**  
    En la vista de Proyectos, Resumen se depuró eliminando la duplicación de KPIs que ya están en el encabezado y el bloque redundante de retrabajos. La sección de dependencias de cliente se reubicó en la parte superior de la pestaña Tareas, y los entregables inician plegados (chips cerrados) para evitar sobrecarga visual.
13. **Consolidación de Matriz de Horas y Servicios:**  
    Se consolidó la información presupuestal dentro de la pestaña `Matriz Horas`, ofreciendo visibilidad integrada tanto por Rol como por Servicio/Entregable, eliminando pestañas duplicadas en el proyecto.

---

## 9. Gaps de Portabilidad y Plan de Cierre

### Gaps Críticos que Bloquean Portabilidad (Deben resolverse primero en Backend):
1. **Modelado Relacional en PostgreSQL:** Creación de tablas para `Client`, `Project`, `Deliverable`, `Task`, `Opportunity`, `Quote`, `Assignment` y `TimeLog`.
2. **Endpoint de Conversión Atómica (`POST /api/opportunities/{id}/convert/`):** La creación del cliente (si es nuevo), el proyecto, sus N entregables y sus M tareas debe ocurrir en una **única transacción atómica de base de datos**. Si falla una tarea, debe hacerse rollback completo.
3. **Mecanismo de Bloqueo de Timer Único:** En PostgreSQL debe garantizarse mediante restricción única o validación transaccional que ningún usuario tenga dos registros `TimeLog` abiertos (`endTime IS NULL`) al mismo tiempo.
4. **Persistencia de Propuestas y Alcance:** Modelo para almacenar la cotización con horas por rol rollup, valor vendido, moneda y referencias documentales (Drive, Sheets).

### Gaps Evolutivos (Pueden quedar para fases posteriores):
1. **Webhooks automáticos con HubSpot y Alegra.**
2. **Creación automática de carpetas mediante Google Drive API.**
3. **Generación binaria de PDFs en servidor (Puppeteer / ReportLab).**
4. **Retos asíncronos y ranking semanal de La Colonia (modelos mínimos de backend `GameResult` y `ColonyChallenge`).**
5. **Evolución a Progressive Web App (PWA):** Orbit deberá poder evolucionar a una Progressive Web App (PWA) instalable en dispositivos móviles, sin requerir inicialmente distribución vía App Store/Play Store. No hace parte del alcance actual ni bloquea el backend. La arquitectura de API y autenticación/sesiones no debería introducir dependencias que dificulten esta evolución posteriormente.

### 9.3 Delimitación de Responsabilidades: Comportamiento Funcional vs. Decisiones Técnicas de Indunova

Para asegurar una frontera limpia de trabajo entre Producto (Uhura) y la Fábrica de Software (Indunova), se establece la siguiente separación explícita:

#### A. Comportamiento Funcional Esperado (Definido por Producto - No Negociable):
1. **Reflejo Oportuno de Ausencias en Capacidad:**  
   Las ausencias y vacaciones programadas y aprobadas en Google Calendar deben reflejarse oportunamente en la disponibilidad del módulo de Capacidad, impidiendo la sobreasignación de colaboradores en periodos no hábiles.
2. **Integridad de Fechas Calendario:**  
   Fechas como `fecha_ingreso`, `birthDate` y los rangos de vacaciones (`startDate`, `endDate`) deben mantenerse íntegras en el día calendario civil correspondiente, sin desplazamientos o corrimientos de fecha provocados por conversiones de huso horario entre cliente y servidor.
3. **Fidelidad del Registro Comercial y Horas Cotizadas:**  
   Orbit debe preservar íntegramente el rollup de horas técnicas por rol presupuestadas, el monto cotizado, la moneda (`COP` o `USD`) y los enlaces a los documentos oficiales de soporte (Google Sheet de Finanzas y propuesta formal presentada).
4. **Atomicidad en la Conversión de Oportunidades:**  
   La creación de cliente, proyecto, entregables y tareas a partir de una oportunidad ganada debe ser atómica (todo o nada), garantizando que jamás existan estados a medias o proyectos sin entregables por fallos en la operación.
5. **Exclusividad del Cronómetro:**  
   Un colaborador nunca debe tener más de un cronómetro de trabajo en ejecución activa simultáneamente.

#### B. Decisiones Técnicas de Arquitectura (Autonomía y Responsabilidad de Indunova):
1. **Estrategia de Sincronización con Google Calendar API:**  
   Indunova definirá libremente el mecanismo técnico que considere más robusto, escalable y mantenible (ej. push notifications/webhooks, tareas asíncronas periódicas o sincronización bajo demanda al consultar la vista).
2. **Modelado Físico y Tipos de Datos en Base de Datos:**  
   Indunova definirá los tipos de columnas SQL en PostgreSQL, la precisión decimal numérica, las claves primarias/foráneas, los índices y las restricciones de integridad relacional.
3. **Mecanismos de Transaccionalidad y Concurrencia:**  
   Indunova seleccionará e implementará las herramientas de control transaccional (ej. transacciones atómicas del ORM, bloqueos a nivel de fila o restricciones de base de datos) para cumplir con el comportamiento esperado.
4. **Serialización y Manejo Técnico de Zonas Horarias:**  
   Indunova implementará el parseo, serialización y almacenamiento de fechas/horas en Django REST Framework para garantizar la fidelidad del día calendario sin prescripciones tecnológicas desde Producto.

#### C. Coordinación y Gestión de Dependencias entre Uhura e Indunova:
1. **Desacoplamiento con Finanzas:**  
   El backend no implementa cálculos de salarios ni márgenes en la API. El backend de Orbit únicamente persiste y expone los campos comerciales de `QuoteProposal` (horas rollup, valor cotizado, moneda, estado y URLs de soporte).
2. **Acceso a Google Calendar:**  
   Cuando Indunova defina el mecanismo técnico de integración, deberá indicar a Uhura qué calendario, permisos y credenciales necesita para staging/producción. Uhura facilitará el acceso correspondiente al calendario corporativo gestionado por Administrativa.

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

### 10.3. Responsabilidades Operativas Clave por Rol en los Journeys Aprobados
- **Comercial (Catalina Tejada / Luisa Urazán / Equipo Comercial):**
  - Creación de oportunidades en New Business a partir de briefs.
  - Asignación formal del Líder de Alcance.
  - Recepción del handoff de alcance listo (`internal_review`) en Mi Día.
  - Realización del cálculo financiero externo en el Google Sheet oficial.
  - Registro del resultado comercial en Orbit (monto cotizado, moneda, versión y URLs).
  - Marcación de oportunidad como Ganada (`won`) tras aprobación del cliente.
  - Ejecución de la conversión a proyecto operativo.
- **Líder de Alcance / Project Lead (Paola Monsalve / Diego Cadavid / Líderes de Área):**
  - Estructuración del dimensionamiento técnico (entregables, actividades, roles y horas).
  - Estimación de semanas productivas de entrega y anclaje de propuesta técnica (Drive/PPT).
  - Notificación de alcance listo a Comercial (`Marcar alcance listo`).
  - Gestión y seguimiento de dependencias, insumos y aprobaciones de cliente en el proyecto.
  - Revisión formal de tareas finalizadas por colaboradores (aprobar y completar o devolver).
  - Registro y auditoría de rondas de retrabajo.
- **Colaborador (Especialistas Técnicos y Creativos):**
  - Visualización contextual de tareas asignadas para hoy en Mi Día.
  - Ejecución activa con cronómetro (timer) o registro manual de horas.
  - Solicitud formal de revisión al finalizar entregables (`Solicitar revisión ->`).
- **Dirección Ejecutiva (CEO / Ana Giraldo):**
  - Supervisión transversal del portafolio y salud de proyectos.
  - Monitoreo de capacidad global del equipo semana a semana.
  - Aprobación de excepciones de cronograma (reforecasts oficiales) y condiciones especiales.

### 10.4. Pendientes de Decisión de Producto
1. **[Pendiente de decisión de Producto] Tipologías de Tarea Exentas de Revisión:**  
   Se requiere formalizar si ciertas tipologías de tareas operativas menores o no cotizables (ej. rituales internos de equipo, standups de 15 minutos, soporte ad-hoc) pueden auto-completarse directamente por el colaborador sin transicionar obligatoriamente por el estado `Review` del Líder.
2. **[Pendiente de decisión de Producto] Parametrización Multi-NIT por Proyecto:**  
   Definir con la Dirección General y Administración si la facturación de un proyecto distribuido entre más de una entidad fiscal (`ClientTaxEntity`) se parametriza una sola vez a nivel global del proyecto o si puede variar por hito/factura emitida, y si se calcula mediante porcentajes, montos fijos o ambas modalidades.

---

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

### 10.8. Definición Funcional y Gobernanza: Perfil del Colaborador (Equipo & Accesos)

> **CIERRE DE DEFINICIÓN FUNCIONAL (EQUIPO & ACCESOS → PERFIL DEL COLABORADOR):**  
> Se formaliza la separación estricta entre **identidad profesional**, **nivel RBAC funcional** y **compatibilidad técnica secundaria**, garantizando que la matriz RBAC permanezca cerrada y con una única fuente de verdad.

#### 1. Separación Conceptual de Atributos:
1. **`jobTitle` / `officialRole` → Identidad Profesional:**
   - **`jobTitle`**: Denominación funcional y operativa visible del cargo en la organización (ej. *Product Lead*, *Front-End Dev*, *Senior Growth Strategist*).
   - **`officialRole`**: Vinculación formal con uno de los **12 Roles Canónicos de Uhura** del Catálogo de Servicios (`StandardUhuraRole`). Es obligatorio para todo colaborador que ejecute o cotice horas en proyectos y propuestas de New Business.
2. **`accessLevel` → Nivel RBAC Funcional:**
   - Nivel de autorización gobernado **exclusivamente por la Matriz Canónica RBAC** (`CanonicalOrbitAccessLevel`: `collaborator`, `leader`, `client_relationship`, `commercial`, `administrative`, `executive`, `system_admin`).
   - Gobierna de manera exhaustiva el acceso a módulos, vistas y alcances (`AccessScope`).
3. **`UserRole` (`Admin` | `Member` | `Viewer`) → Compatibilidad Técnica Secundaria:**
   - Atributo técnico heredado de plataforma mantenido para interoperabilidad con código base previo.
   - **NO gobierna permisos funcionales** y está terminantemente prohibido que compita con la matriz RBAC. En el frontend se mantiene oculto de la gestión regular y solo accesible en modo avanzado para administradores de sistema.

#### 2. Reglas de Inmutabilidad de la Matriz y Editabilidad de la Asignación:
- **Matriz RBAC Cerrada e Inmutable:** Los 7 niveles canónicos y sus permisos por módulo son cerrados. La pantalla de colaboradores no permite crear nuevos roles ni alterar la matriz de permisos.
- **Asignación Editable y Persistente:** La asignación de un colaborador a un nivel RBAC y a un rol profesional es **editable y persistente**.
- **Principio de No Alteración:** Cambiar la asignación de un colaborador (ej. ascenso de `collaborator` a `leader`) **NO crea un nuevo rol** ni altera la estructura del sistema; únicamente actualiza las relaciones del colaborador.
- **Única Fuente de Verdad:** Toda evaluación de autorización en el sistema (frontend y backend) consulta de forma unívoca `accessLevel` y la matriz canónica.

#### 3. Requerimientos de Persistencia Mínima en Backend (Indunova):
El backend debe persistir en base de datos como mínimo los siguientes campos del colaborador:
1. **`jobTitle`** (string) / **`officialRole`** (`StandardUhuraRole`, cuando corresponda al catálogo)
2. **`accessLevel`** (`OrbitAccessLevel`: 7 niveles canónicos + transitorio `pending`)
3. **`department`** (string: área operativa o departamento)
4. **`leaderId` / `reportsTo`** (UUID/FK al colaborador líder directo)
5. **`city`** (string: ciudad de residencia)
6. **`birthDate`** (Date / ISO `YYYY-MM-DD`: fecha de cumpleaños)
7. **`fecha_ingreso`** (Date / ISO `YYYY-MM-DD`: Hire Date / `joinedDate`; dato canónico de edición restringida a perfiles autorizados [Administrativa / RRHH / Dirección General]. Antigüedad y aniversario se derivan directamente de él; no debe documentarse como inmutable)
8. **`status`** (`Active` | `Inactive` | `Invited`)
9. **`avatar_url`** (URLField / string | null: URL pública de la fotografía de perfil del colaborador)

#### 4. Gestión Canónica de Fotografía de Perfil (`avatar_url`) y Fallback Visual:
- **Soporte Canónico:** La entidad `UserProfile` en backend y `UserItem` en frontend soportan el campo `avatar_url` / `avatarUrl` (URL nullable).
- **Desacople de Almacenamiento Físico:** El backend de Indunova define la infraestructura y proveedor de almacenamiento de medios físicos (e.g. Google Cloud Storage, Amazon S3, MinIO o CDN dedicada) y expone en la API únicamente la URL resultante (`avatar_url`). El frontend nunca asume dependencias locales de almacenamiento.
- **Consumo Unificado en Frontend:** Toda la interfaz de Orbit consume las imágenes de perfil a través del componente centralizado `UserAvatar`.
- **Tratamiento Visual Estricto:** Relación de aspecto 1:1, centrado, `object-cover`, sin deformación ni alteración de la composición de tarjetas, headers o tablas.
- **Fallback Automático Resiliente:** Si el campo es `null`, vacío o si la imagen falla al cargar (`onError`), el componente automáticamente muestra las iniciales del colaborador sobre el color temático asignado (`avatarBg`).

#### 5. Auditoría de Cambios Sensibles en Backend:
> **REGLA DE GOBERNANZA DE AUDITORÍA:**  
> `UserProfileAuditEntry` en frontend es **únicamente representación / previsualización en interfaz**. La auditoría autoritativa **debe generarse y persistirse en backend (Indunova) al guardar el cambio transaccional**. El frontend **no debe ser fuente de verdad del historial**.

Para modificaciones sobre campos sensibles que impactan la seguridad, jerarquía o nómina, el backend deberá registrar un historial de auditoría bajo la siguiente estructura canónica:
$$\text{Auditoría: } \text{valor anterior} \longrightarrow \text{valor nuevo} \longrightarrow \text{fecha (timestamp ISO)} \longrightarrow \text{usuario que realizó el cambio}$$

**Contrato Mínimo de Auditoría:**
- **`userId`** (string): Identificador único del colaborador afectado.
- **`field`** (string): Campo modificado (`accessLevel`, `officialRole`, `leaderId`, `status`, `fecha_ingreso`, etc.).
- **`previousValue`** (string | null): Valor anterior del campo antes de la modificación.
- **`newValue`** (string | null): Nuevo valor asignado al campo tras la edición.
- **`changedAt`** (string): Timestamp ISO UTC registrado por el servidor en el momento exacto del guardado.
- **`changedByUserId`** (string): Identificador del usuario que realizó la modificación.
- **`reason`** (string, opcional): Justificación o motivo opcional del cambio sensible.

Campos sujetos a auditoría obligatoria en backend:
- **`accessLevel`** (Nivel de Acceso RBAC)
- **`officialRole`** (Rol Profesional del Catálogo)
- **`leaderId` / `reportsTo`** (Líder Directo de reporte)
- **`status`** (Estado de Cuenta)
- **`fecha_ingreso`** (Fecha Contractual de Ingreso, restringida a perfiles administrativos autorizados)

#### 6. Frontera Arquitectónica con el Futuro People Master:
Para la separación estricta entre la identidad operativa actual de `UserProfile` y la futura evolución administrativa de personas (contratos, salarios, dotación, SST), consultar la subsección [11.4.1. Frontera Arquitectónica: Perfil Operativo (UserProfile) vs. Evolución People Master](#1141-frontera-arquitectónica-perfil-operativo-userprofile-vs-evolución-people-master) y la guía técnica de referencia [`src/docs/PEOPLE_MASTER_EVOLUTION.md`](./PEOPLE_MASTER_EVOLUTION.md).

*El frontend de Orbit ya se encuentra totalmente preparado para emitir y previsualizar esta estructura bajo el contrato acordado sin asumir persistencia autoritativa local.*

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
| **Alegra** | Fiscal & Contable | Terceros fiscales (Razón Social / NIT), facturación electrónica, impuestos, cartera y recaudo | `ClientTaxEntity`, `ClientProfile`, `ProjectSummaryItem` | `taxEntityId` (selección fiscal operativa inicial hacia `ClientTaxEntity`), `alegraContactId` |
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
>   3. Una vez el cliente aprueba la propuesta económica y se formaliza el acuerdo, la oportunidad se convierte en Proyecto Activo (`handleConvertOpportunityToProject`), propagando las referencias comerciales y de repositorio (`hubspotDealId`, `driveFolderUrl`) y la entidad fiscal inicial seleccionada (`taxEntityId`) como punto de partida administrativo (sin restringir que el proyecto definitivo pueda facturarse a múltiples NITs).

---

### 11.4. Perfil de Usuario: Ingreso, Cumpleaños, Aniversario y Datos Personales

> **REGLAS CANÓNICAS DE IDENTIDAD Y PERFIL:**  
> 1. **`fecha_ingreso` / Hire Date (`joinedDate` en `UserItem`):**  
>    - Es un **dato persistido canónico del perfil del colaborador** en base de datos.
>    - Constituye la fecha fundacional del vínculo laboral del colaborador con Uhura Group.
>    - **Regla de Gobernanza:** **NO debe documentarse como inmutable**. Es un dato canónico de **edición restringida a perfiles administrativos autorizados** (`administrative`, `system_admin`, `executive`). La antigüedad y el aniversario se derivan de él; no se crean campos independientes.
> 2. **`birthDate` (Fecha de Cumpleaños):**  
>    - Es un **dato persistido canónico del perfil del colaborador** en formato ISO `YYYY-MM-DD` (ej. `'1993-09-18'`).
>    - Debe poder visualizarse y administrarse de manera centralizada desde el módulo **Equipo & Accesos** (Directorio de Colaboradores).
> 3. **El Aniversario NO se Almacena como un Evento Independiente (No Duplicidad):**  
>    - El aniversario **no requiere persistirse en una tabla o campo redundante**: se deriva matemáticamente en tiempo de ejecución o consumo directamente a partir de `fecha_ingreso`:
>      - Se calcula la fecha anual correspondiente proyectando el mes y día de `fecha_ingreso` al año corriente.
>      - Se calculan los años de antigüedad cumplidos en Uhura Group ($\text{Años Cumplidos} = \text{Año Actual} - \text{Año de Ingreso}$, ponderado según la fecha del año).
> 4. **Consumo por Mi Día y Bucky:**  
>    - **Cumpleaños próximos:** Se calculan evaluando la proximidad de `birthDate` contra la fecha del sistema.
>    - **Aniversarios próximos:** Se calculan evaluando la proximidad de la fecha anual derivada de `fecha_ingreso`.
>    - Mi Día y Bucky consumen directamente estos campos estructurados del perfil para visibilidad de equipo y avisos contextuales, sin requerir llamadas externas a servicios terceros.
> 5. **Hobbies y Mascotas (`hobbies?: string`, `petNames?: string`):**  
>    - Campos opcionales del perfil en Orbit para enriquecimiento de experiencia y contexto de Bucky. **No forman parte del contrato obligatorio de interoperabilidad técnica**.
> 6. **Google Calendar NO es la Fuente de Cumpleaños ni Aniversarios:**  
>    - La privacidad de fechas de nacimiento y datos contractuales reside exclusivamente en la base de datos interna de Orbit (`UserItem`). Google Calendar se reserva de forma estricta para la programación operacional de ausencias y licencias.

#### Estructura y Reglas Canónicas del Perfil del Colaborador
El perfil del colaborador en Orbit define la identidad funcional, contractual y de seguridad del usuario en el sistema. Los campos se estructuran bajo las siguientes reglas:

1. **Campos Canónicos Persistidos (Almacenados en Base de Datos):**
   - **`name` / `fullName`:** Nombre completo del colaborador (string, obligatorio).
   - **`firstName` / `lastName`:** Nombres y apellidos por separado (strings, obligatorios para búsquedas y comunicaciones).
   - **`email`:** Correo electrónico corporativo oficial (`@uhuragroup.com`) (string, obligatorio, identificador único de cuenta y acceso).
   - **`fecha_ingreso` / `joinedDate`:** Fecha fundacional de vinculación laboral en formato ISO `YYYY-MM-DD` (Date, obligatorio; dato canónico de edición restringida a perfiles autorizados [Administrativa / RRHH / Dirección General]. Antigüedad y aniversario se derivan directamente de él; no debe documentarse como inmutable).
   - **`birthDate`:** Fecha de nacimiento en formato ISO `YYYY-MM-DD` (Date, obligatorio para colaboradores activos; administrable y visualizable en *Equipo & Accesos*).
   - **`jobTitle`:** Cargo operativo o denominación funcional visible (string, obligatorio).
   - **`officialRole` (`StandardUhuraRole`):** Uno de los 12 roles oficiales del Catálogo de Servicios (obligatorio para todo perfil que cotice o ejecute horas en proyectos).
   - **`accessLevel` (`OrbitAccessLevel`):** Nivel de autorización gobernado exclusivamente por la matriz canónica RBAC (`collaborator`, `leader`, `client_relationship`, `commercial`, `administrative`, `executive`, `system_admin`, más estado transitorio `pending`).
   - **`role` (`UserRole`):** Atributo técnico secundario de compatibilidad heredada (`Admin` | `Member` | `Viewer`). **NO** gobierna permisos funcionales.
   - **`department`:** Área o departamento operativo (string, obligatorio para colaboradores activos).
   - **`leaderId` / `reportsTo`:** Identificador del líder directo del área para cadenas de reporte y jerarquía operativa.
   - **`city`:** Ciudad de residencia del colaborador (string, obligatorio para gestión de equipo distribuido).
   - **`status` (`UserStatus`):** Estado de la cuenta en plataforma (`Active` | `Inactive` | `Invited`).
   - **`hobbies` / `petNames`:** Intereses personales, pasiones o mascotas (strings libres opcionales para contextualización de Bucky; no requeridos para interoperabilidad core).

2. **Campos Derivados en Tiempo de Ejecución (No Duplicidad en Almacenamiento):**
   - **Aniversario en Uhura:** NO se almacena como fecha ni evento independiente. Se proyecta anualmente combinando el mes y día de `fecha_ingreso` con el año en curso.
   - **Años de Antigüedad Cumplidos:** Se calcula restando el año de `fecha_ingreso` al año de la fecha evaluada.
   - **Cumpleaños Próximos:** Se calculan evaluando la proximidad temporal del mes y día de `birthDate` respecto a la fecha actual del sistema.

3. **Visibilidad, Privacidad y Gobernanza de Datos:**
   - La administración de estos campos se realiza desde el módulo **Equipo & Accesos** exclusivamente por usuarios con permisos autorizados (Dirección / RRHH).
   - Mi Día y Bucky consumen estos datos para avisos discretos y contextuales, preservando la sobriedad visual del sistema.

4. **Política de Seeding y Carga Inicial Separada:**
   > **REGLA DE GOBERNANZA:**  
   > **La carga inicial de colaboradores se realizará a partir de la fuente administrativa vigente suministrada por Uhura. Los datos concretos de seeding se mantienen separados de la especificación funcional.**  
   > Esta separación garantiza que `ORBIT_PRODUCT_STATUS.md` permanezca estable como fuente funcional maestra frente a cambios o rotaciones del equipo, y protege la privacidad de datos sensibles (documentos de identidad, salarios, contratos, direcciones, etc.), los cuales **NO** deben versionarse en la especificación funcional pública, sino canalizarse mediante fixtures o mecanismos controlados de migración por Indunova y RRHH.  
   > Para la estructura de inicialización y el dataset base de perfiles operativos, consultar el documento complementario: [`src/docs/INITIAL_TEAM_SEED.md`](./INITIAL_TEAM_SEED.md).

---

### 11.4.1. Frontera Arquitectónica: Perfil Operativo (`UserProfile`) vs. Evolución People Master

> **DECISIÓN ARQUITECTÓNICA Y DE PRODUCTO (FRONTERA DE GESTIÓN DE PERSONAS):**  
> Se formaliza la frontera estricta entre la **identidad operativa y de acceso actual (`UserProfile` / `UserItem`)** y la futura evolución hacia un **People Master administrativo integral**.  
> **Esta definición NO amplía el alcance actual ni bloquea la integración frontend ↔ backend con Indunova.**

#### 1. Alcance Actual: `UserProfile` como Identidad Operativa y de Acceso
El modelo actual de colaborador en Orbit (`UserProfile` en backend Django / `UserItem` en frontend React) representa de manera suficiente y exhaustiva la **identidad operativa, jerárquica y de autorización** requerida para el flujo de trabajo core de la agencia:
- **Campos Core Actuales Persistidos:**
  - `id` (Identificador único UUID)
  - `name` / `fullName` (Nombre completo)
  - `email` (Correo electrónico corporativo único `@uhuragroup.com`)
  - `jobTitle` (Cargo funcional visible)
  - `officialRole` / `professionalRole` (`StandardUhuraRole`: uno de los 12 roles oficiales del catálogo)
  - `accessLevel` (`CanonicalOrbitAccessLevel`: uno de los 7 niveles canónicos RBAC)
  - `department` (Área o departamento operativo)
  - `leaderId` / `reportsTo` (Identificador del líder directo)
  - `city` (Ciudad de residencia)
  - `birthDate` (Fecha de nacimiento ISO `YYYY-MM-DD`)
  - `fecha_ingreso` / `joinedDate` (Fecha contractual de ingreso ISO `YYYY-MM-DD`)
  - `capacityHours` (Capacidad semanal contractual en horas)
  - `status` (`Active` | `Inactive` | `Invited`)
  - `avatar_url` / `avatarUrl` (URL pública o storage de la fotografía de perfil)
- **Subsistemas que alimenta en el Core:**
  1. *Equipo & Accesos:* Directorio operativo, jerarquía, asignación de líderes y matriz de permisos RBAC.
  2. *Mi Día:* Saludo contextual, clima, bandeja diaria y eventos de personas (cumpleaños y aniversarios derivados).
  3. *Capacidad y Staffing:* Horas semanales disponibles para asignación en proyectos y tareas.
  4. *Bucky:* Contexto de equipo, reconocimientos y aniversarios en la agencia.
  5. *Seguridad & RBAC:* Control de acceso estricto y alcance de vistas según los 7 niveles canónicos.

#### 2. Principio Rector: Prohibición de la "Mega-Tabla" de RRHH
`UserProfile` **NO debe convertirse en una tabla monolítica** que absorba indiscriminadamente atributos administrativos, laborales, médicos o fiscales.  
A futuro, los dominios administrativos de personas deberán residir en entidades satélite desacopladas y relacionadas conceptualmente con el colaborador:

```text
User / Employee (Core Operativo)
├── EmployeeProfile (Identidad administrativa ampliada)
├── EmploymentRecord (Contrato, tipo de vinculación, jornada formal)
├── CompensationRecord (Historial salarial, ajustes, bonificaciones)
├── EmergencyContact (Contactos de emergencia y parentesco)
├── AssetAssignment (Equipos de cómputo, dotación, licencias asignadas)
├── LeaveRecord / LeaveLedger (Libro mayor de vacaciones causadas y disfrutadas)
└── SSTRecord (Información ocupacional y seguridad en el trabajo)
```
*(Nota: Estos nombres representan conceptos de dominio referenciales para modelado futuro, no contratos técnicos inmediatos).*

#### 3. Ficha Humana: Experiencia de Cercanía, No Ficha de RRHH
La **Ficha Humana** (`TeamHumanProfileModal`) es una experiencia visual de cercanía y cultura del equipo Uhura, no una ficha administrativa de personal:
- **Única Fuente de Verdad:** Consume directamente el mismo objeto del colaborador (`UserItem`). **No almacena ni sincroniza una base de datos paralela**.
- **Campos Apropiados Visibles:** Fotografía (`avatar_url`), nombre, cargo, ciudad, cumpleaños, aniversario en la agencia, y datos personales de aportación voluntaria (`hobbies`, `petNames`, `personalDream`).
- **Gobernanza:** Queda terminantemente prohibido incorporar datos contractuales, salariales, de dotación o confidenciales dentro de la Ficha Humana. La fuente sigue siendo el perfil y la Ficha Humana es únicamente otra experiencia de presentación.

#### 4. Evolución de Equipo & Accesos (Visión 360 No Inmediata)
A futuro, el módulo de **Equipo & Accesos** podrá evolucionar para permitir la administración 360 del colaborador mediante pestañas organizadas (*Perfil*, *Trabajo*, *Accesos*, *Administración*, *Activos*, *Vacaciones*).  
**Regla de alcance:** Esta estructura tabulada extendida **NO se implementa en la fase actual** y queda diferida para iteraciones posteriores a la estabilización del core operativo.

#### 5. Privacidad y Gobernanza de Datos Sensibles de RRHH
- **Datos Clasificados como Restringidos:** Documento de identidad (cédula/pasaporte), salario base, esquemas de compensación, tipo de contrato legal, dirección domiciliaria, afiliaciones a EPS/ARL/Pensión, contactos de emergencia y registros de SST.
- **Reglas de Seguridad Indiscutibles:**
  1. **Nunca versionarse:** Prohibido commitear datos personales o de nómina reales en repositorios Git ni dejarlos en mocks de frontend.
  2. **No visibilidad por defecto:** Estos datos no son visibles para el equipo general ni para perfiles de liderazgo operativo.
  3. **No crear `hr_admin` como nivel RBAC:** Se mantienen estrictamente intactos los 7 niveles canónicos de Orbit (`collaborator`, `leader`, `client_relationship`, `commercial`, `administrative`, `executive`, `system_admin`). La visibilidad futura de datos sensibles de RRHH se gobernará mediante permisos/capacidades específicas independientes del `accessLevel` (ej. `people.hr.read`, `people.compensation.read`, `people.sst.read`, referenciales).
  4. **Aislamiento de permisos técnicos:** `system_admin` **NO** obtiene por defecto acceso a información salarial, contractual, médica o sensible por el mero hecho de tener permisos técnicos de administración sobre la plataforma.
  5. **Controles de protección y auditoría:** Los datos sensibles deberán contar con controles reforzados de acceso, auditoría y protección en reposo. La estrategia técnica definitiva de persistencia y cifrado se definirá con backend e infraestructura antes de implementar People Master.
  6. **Criterio de necesidad para datos SST/médicos:** No debe asumirse que todo dato administrativo existente en las bases actuales deba migrarse a Orbit; su incorporación futura dependerá de necesidad funcional real, privacidad y gobernanza.

#### 6. Matriz de Alcance: Core Actual vs. People Master Evolutivo

| Dimensión | Ahora (Core Personas en Orbit) | Evolutivo (Futuro People Master) |
| :--- | :--- | :--- |
| **Identidad** | Nombre, email, avatar, ciudad | Documento legal, tipo de identificación, nacionalidad, dirección |
| **Puesto & Rol** | `jobTitle`, `officialRole` (Catálogo), `department`, `leaderId` | Centro de costos, banda salarial, organigrama formal corporativo |
| **Acceso & Permisos** | Matriz Canónica RBAC (7 niveles intactos) | Capacidades/permisos granulares específicos de RRHH y compensación |
| **Capacidad & Horas** | Capacidad semanal operativa (`capacityHours`), balance de ausencias | Historial de variaciones de jornada, cálculo de prestaciones |
| **Fechas Clave** | `fecha_ingreso` (Hire Date), `birthDate` (Cumpleaños) | Fechas de renovación de contrato, vencimiento de períodos de prueba |
| **Cultura & Equipo** | Ficha Humana (pasatiempos, mascotas, sueños) | Evaluaciones de desempeño formal, planes de carrera |
| **Compensación** | *Fuera de alcance* | Historial de salarios, comisiones, pagos variables |
| **Dotación & Activos** | *Fuera de alcance* | Seriales de laptops, actas de entrega, licencias individuales |
| **SST & Salud** | *Fuera de alcance* | Exámenes ocupacionales, registros restringidos bajo necesidad |

*Para la guía técnica de modelado y arquitectura de datos complementaria, consultar:* [`src/docs/PEOPLE_MASTER_EVOLUTION.md`](./PEOPLE_MASTER_EVOLUTION.md).

---

### 11.5. Ausencias / Vacaciones y Google Calendar: Proceso Operacional y Modelo `TeamAbsenceEvent`

#### Proceso Funcional Actual de Aprobación de Ausencias en Uhura:
El flujo corporativo vigente para la solicitud y programación de vacaciones o ausencias opera por fuera de la capa transaccional de Orbit a través de los siguientes 5 pasos estrictos:
1. **Solicitud Inicial:** El colaborador solicita formalmente la ausencia o periodo de vacaciones a su líder directo de área.
2. **Aprobación del Líder:** El líder de área evalúa la disponibilidad del equipo y aprueba la solicitud.
3. **Escalamiento por Rol:** Si quien solicita la ausencia es un **líder de área**, la aprobación corresponde de manera exclusiva a **Ana María Giraldo (Dirección General)**.
4. **Formalización Administrativa:** Una vez obtenida la aprobación del líder (o de Ana María), la novedad se formaliza mediante correo electrónico remitido a **Laura Viviana Salazar (Administrativa & RRHH)**, con copia obligatoria al líder de área correspondiente.
5. **Programación en Calendario Corporativo:** Laura Viviana registra y programa formalmente la ausencia en el Google Calendar corporativo oficial de Uhura Group (ej. `ausencias@uhuragroup.com`).

#### Decisiones de Producto y Arquitectura Orbit:
- **Orbit NO Requiere Crear un Workflow Interno de Aprobación:**  
  En esta fase, Orbit no implementa un motor transaccional de solicitudes ni bandejas de aprobación burocrática de vacaciones. El proceso operativo existente por canales corporativos (Líder / Ana María ➔ Correo Laura Viviana ➔ Google Calendar) funciona eficientemente.
- **Google Calendar como Fuente Operacional Externa:**  
  El Google Calendar corporativo administrado por Laura Viviana actúa como la **fuente de verdad operacional de las ausencias ya aprobadas y programadas**.
- **Consumo Unificado vía `TeamAbsenceEvent`:**  
  Orbit sincroniza y consume estas ausencias a través de la entidad canónica `TeamAbsenceEvent`. Se prohíbe taxativamente crear modelos paralelos de ausencias en el backend de Indunova.
- **Afectación Estricta a Capacidad:**  
  **Únicamente las ausencias aprobadas y programadas en `TeamAbsenceEvent` descuentan capacidad/disponibilidad operativa.** Ausencias en borrador, tentativas no formalizadas o eventos de otra índole jamás descuentan horas.
- **Frontera de Google Calendar:**  
  Google Calendar se utiliza **exclusivamente** para:
  - Vacaciones de ley (`type: 'vacation'`).
  - Licencias médicas, incapacidades o ausencias personales aprobadas (`type: 'sick_leave' | 'personal_leave' | 'other'`).
  - Google Calendar **bajo ninguna circunstancia es fuente de cumpleaños ni de aniversarios**.

#### Modelo de Dominio Canónico (`TeamAbsenceEvent`):

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
1. **Deducción de Días Hábiles:** Por cada día hábil (lunes a viernes) comprendido entre `startDate` y `endDate`, se descuentan `impactHoursPerDay` (o la cuota diaria `capacityHours / 5`) de la disponibilidad del colaborador:
   $$\text{Capacidad Neta} = \max(0, (\text{Capacidad Semanal Configurada} - \text{Festivos}) - \sum \text{Deducción Ausencias Aprobadas})$$
2. **Exclusión de Fines de Semana y Festivos:** Si una ausencia coincide con un fin de semana o un día festivo oficial (calendario colombiano), ese día NO resta horas adicionales, porque los festivos ya descuentan su cuota diaria (`capacityHours / 5`) de la semana laboral y los fines de semana tienen disponibilidad proyectada 0h.
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
3. **Alegra / Entidad Fiscal y Frontera Multi-NIT:**
   - **`ClientProfile` y `ClientTaxEntity`:** `ClientProfile` representa la cuenta o marca comercial del cliente (ej. *Danone*, *Bancolombia*), y contiene `hubspotCompanyId`. Cada cliente puede asociar múltiples razones sociales / NITs representados mediante `ClientTaxEntity` (`taxEntities: ClientTaxEntity[]`).
   - **`NewBusinessOpportunity.selectedTaxEntityId`**: Entidad fiscal seleccionada durante New Business / formalización de propuesta como punto de partida administrativo inicial. No compite con otros aliases dentro de la oportunidad.
   - **`ClientTaxEntity.id`**: Identificador real de la entidad fiscal (fuente canónica de verdad para `businessName`, `nit`, `billingEmail`, `alegraContactId`, `alegraContactUrl`, `alegraCreated`).
   - **`opp.selectedTaxEntityId` → `Project.taxEntityId` (Selección Inicial, No Excluyente):** Al convertir la oportunidad, `Project` recibe `taxEntityId` como referencia inicial de facturación. **No debe asumirse que esta selección representa necesariamente la estructura fiscal definitiva ni única del proyecto.**
   - **Frontera de Dominio Multi-NIT (Confirmada):** Un mismo proyecto **puede ser facturado a más de una entidad fiscal**. Por lo tanto, el backend **NO debe implementar una restricción de integridad de dominio que obligue a un único NIT por proyecto** ni cerrar el modelo relacional asumiendo que una FK singular es suficiente para todos los casos.
   - **Pendiente de Validación con Ana / Administración:** Queda explícitamente pendiente definir con la Dirección General y Administración:
     1. Si la distribución multi-NIT se define una sola vez a nivel global del proyecto o si puede variar por factura/hito;
     2. Si dicha distribución se parametriza mediante porcentajes, montos fijos en moneda, o admite ambas modalidades.
     *(Hasta cerrar esta definición con Administración, se mantiene `taxEntityId` como referencia inicial compatible sin imponer restricción mononit en backend).*
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
5. **Eventos y Clima de Equipo (Discretos y No Invasivos):**
   - Mi Día puede mostrar de forma discreta y contextual:
     - Cumpleaños de hoy o próximos (derivados de `birthDate` en `UserItem`).
     - Aniversarios de hoy o próximos en Uhura (derivados de `fecha_ingreso`).
     - Ausencias y vacaciones próximas relevantes del equipo (provenientes del modelo canónico `TeamAbsenceEvent`).
   - Esta información se visualiza de forma sobria y complementaria, reforzando la cercanía del equipo sin desviar el protagonismo de las tareas del día.

---

*Fin del Documento Maestro — Uhura Orbit 2026*

