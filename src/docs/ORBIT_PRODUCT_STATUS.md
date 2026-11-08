# ECO — Especificación Funcional Maestra de Producto y Arquitectura de Dominio

> **Nombre del producto:** **ECO** — *Espacio de Creación y Operaciones* (antes «Orbit», renombrado en noviembre de 2026). Los identificadores técnicos (`OrbitAccessLevel`, `CanonicalOrbitAccessLevel`, nombres de archivo como `ORBIT_PRODUCT_STATUS.md`) se conservan para no romper contratos de código ni enlaces.

> **Para Indunova — empezar por [§8.0 Reconciliación con producción y guía de entrega](#80-reconciliación-con-producción-y-guía-de-entrega-07-nov-2026--leer-primero):** qué ya está en producción (#132–#147) y no se rehace, y qué es nuevo en esta entrega.
>
> **Documento:** Especificación Funcional Maestra para Portabilidad, Backend y Modelo de Datos
> **Destinatario Técnico Principal:** Indunova (Backend Django REST Framework / PostgreSQL) y Equipo de Producto Uhura Group
> **Fecha de Actualización:** 07 de noviembre de 2026 (cronograma al «Iniciar proyecto», rondas de ajuste editables, equipo derivado de tareas, hallazgos E2E §10.2.3, cierre de proyecto Módulo 11 §11.7, visibilidad de tareas Módulo 17 §17.5, arranque en producción §9.4, ECO como PWA §9.5, integraciones Google Chat §11.8 y Google Calendar §11.5.1, mascota ECO Módulo 18)
> **Versión:** 3.4.0 (Aprobación Canónica UAT 2: 1 Servicio = 1 Proyecto, Decimales, Líderes por Servicio y Modo Desacoplado)
> **Estado:** Especificación Maestra Canónica Reconciliada — Fuente de Verdad Funcional de ECO
>
> **Convención de Estados de Implementación:**
> - 🟢 **Decisión funcional aprobada:** Definición canónica cerrada y acordada por Producto Uhura.
> - 🟣 **Implementado en prototipo:** Experiencia interactiva y validaciones visuales operativas en frontend React.
> - 🔵 **Implementado por Indunova:** Persistencia en PostgreSQL y endpoints REST en Django DRF completados en backend.
> - 🟡 **Pendiente de implementación o validación:** Requerimiento formalizado en espera de desarrollo o validación operativa.

> **AVISO DE PRIVACIDAD Y GOBERNANZA:**
> La documentación pública define reglas, estructuras y comportamientos. La identidad nominal de colaboradores, correos, relaciones de reporte, calendarios individuales y crosswalk con backend se administra exclusivamente mediante **Equipo Canónico Privado**.

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
   - [Módulo 5: Cotización / Propuesta Económica (Quotes)](#módulo-5-cotización--propuesta-económica-quotes)
   - [Módulo 6: Documentos y Repositorio Google Drive](#módulo-6-documentos-y-repositorio-google-drive)
   - [Módulo 7: Statement of Work (SOW Contractual)](#módulo-7-statement-of-work-sow-contractual)
   - [Módulo 8: Formalización, Conversión a Proyecto y Gates](#módulo-8-formalización-conversión-a-proyecto-y-gates)
   - [Módulo 9: Clientes (Cuentas y Entidades Fiscales)](#módulo-9-clientes)
   - [Módulo 10: Administración Fiscal y Frontera con Alegra](#módulo-10-administración-fiscal-y-frontera-con-alegra)
   - [Módulo 11: Proyectos (Estructura Operativa, Gobernanza y Vistas)](#módulo-11-proyectos-estructura-operativa-gobernanza-y-vistas)
   - [Módulo 12: Entregables (Componentes Operativos)](#módulo-12-entregables)
   - [Módulo 13: Tareas y Detalle Operativo (TaskDetailModal)](#módulo-13-tareas-y-detalle-operativo-taskdetailmodal)
   - [Módulo 14: Staffing y Asignaciones](#módulo-14-staffing-y-asignaciones)
   - [Módulo 15: Capacidad del Equipo](#módulo-15-capacidad-del-equipo)
   - [Módulo 16: Time Tracking (Registro de Tiempo)](#módulo-16-time-tracking-registro-y-corrección-de-tiempo)
   - [Módulo 17: Mi Día (Home Contextual y Bandeja de Acción)](#módulo-17-mi-día-home-contextual-y-bandeja-de-acción)
   - [Módulo 18: Mascota ECO y La Colonia (Copiloto y Gamificación)](#módulo-18-mascota-eco-antes-bucky-y-la-colonia-espacio-social--lúdico)
   - [Módulo 19: Costos de operación — Hardware y Licencias](#módulo-19-costos-de-operación--hardware-y-licencias--implementado-en-prototipo--07-nov-2026-existente-en-producción)
6. [Integraciones Externas: Arquitectura y Comportamiento](#6-integraciones-externas-arquitectura-y-comportamiento)
7. [Matriz Global de Portabilidad por Módulo](#7-matriz-global-de-portabilidad-por-módulo)
8. [Auditoría de Inconsistencias entre Prototipo UI y Especificación](#8-auditoría-de-inconsistencias-entre-prototipo-ui-y-especificación)
9. [Gaps de Portabilidad y Plan de Cierre](#9-gaps-de-portabilidad-y-plan-de-cierre)
10. [Roles, Niveles de Acceso y Matriz de Permisos (RBAC)](#10-roles-niveles-de-acceso-y-matriz-de-permisos-rbac)
11. [Arquitectura de Interoperabilidad Estructural y Reglas de Dominio](#11-arquitectura-de-interoperabilidad-estructural-bloque-4)

---

## 1. Propósito del Documento y Concepto de Freeze Funcional

Este documento constituye la **especificación funcional y de arquitectura de dominio maestra** de ECO, reconciliada directamente con el prototipo de producto y la experiencia aprobada en pruebas UAT. Ha sido estructurado específicamente para que el equipo de backend e infraestructura (**Indunova**) disponga del diseño relacional, reglas invariantes, contratos de transferencia y fronteras de integración necesarios para construir la persistencia en PostgreSQL y los servicios REST en Django.

### Definición de Freeze Funcional
> **El "Freeze Funcional" NO significa que todas las pantallas estén visualmente terminadas o que no puedan pulirse detalles estéticos de UI.**
> Significa que **la topología de entidades, las relaciones, las reglas de negocio, los estados de transición, la persistencia requerida y las fronteras con sistemas externos quedan congelados y formalizados**. Ningún cambio posterior alterará la lógica de datos aquí establecida sin un proceso formal de control de versiones.
> **Regla de oro de UAT:** Un defecto puntual de implementación en staging no cambia la especificación funcional; documenta el comportamiento esperado aprobado de ECO frente a las discrepancias.

### Clasificación de Componentes para Portabilidad:
1. **Core para Portabilidad (Crítico):** Bloquea la base de datos y los flujos indispensables de negocio. Debe implementarse con máxima prioridad (Clientes, Proyectos, Entregables, Tareas, New Business, Quotes, Time Tracking, Capacidad, Mi Día).
2. **UI Liviana / Transaccional Simple:** Puede operar con endpoints CRUD básicos mientras el frontend maneja la interactividad (Plantillas de Producto, Documentos/Drive Links, SOW).
3. **Evolutivo / No Bloqueante:** Funcionalidades de enriquecimiento que no deben demorar la migración del backend transaccional (La Colonia, Bucky Inteligente, Webhooks automáticos con HubSpot/Alegra).

---

## 2. Frontera de Sistemas y Cuadrilátero de Responsabilidades

ECO **no es un CRM generalista, ni una calculadora contable, ni un ERP tributario**. Su frontera funcional está delimitada por cuatro sistemas y un repositorio documental:

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
           │       ECO (Operating System)          │
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
           │         CONVERSIÓN EN ECO             │
           │ • Deal Ganado en HubSpot / ECO        │
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
* **Google Sheet Oficial / Calculadora Comercial:** Fuente de verdad del pricing y cálculo financiero (márgenes, costos internos, tarifas, IVA y TRM). **ECO no calcula internamente tarifas ni márgenes**.
* **ECO:** Dueño del alcance, dimensionamiento técnico, horas técnicas, conversión a proyectos, entregables, tareas, ejecución operativa, Mi Día y capacidad.
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

El flujo lineal de la información y los handoffs entre roles a través de ECO se rige por la siguiente cadena de valor:

```text
[1. HUBSPOT: Brief Recibido & Oportunidad Comercial]
         │
         ▼
[2. COMERCIAL EN ECO (Commercial / Client Relationship)]
         │ • Crea Oportunidad en New Business
         │ • Registra prospecto, brief y contacto
         │ • Asigna Líder de Alcance (ej. Product Lead / Creative Strategy Lead)
         │
         ▼ (Handoff 1: Notificación en campana y acción en Mi Día del Líder)
[3. LÍDER DE ALCANCE EN ECO (Product Lead / Creative Lead)]
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
         │ • Extrae horas técnicas y resumen de perfiles desde ECO
         │ • Realiza el cálculo financiero en el Google Sheet Oficial / Calculadora
         │ • Registra en ECO el resultado comercial acordado:
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
         │ • Comercial marca Oportunidad como Ganada en ECO
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
         ├─ Encabezado: Reglas Contractuales (Rondas de ajuste: 2 × 5 días · Insumos del cliente: 3d)
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
         └─ Alegra: Facturación electrónica DIAN a través del Área Administrativa y Terceros fiscales
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
6. **Comercial recibe el handoff:** Mi Día y la campana alertan a Comercial que la oportunidad está lista para cotización financiera.
7. **Comercial realiza cálculo financiero externo:** Abre el **Google Sheet Oficial / Calculadora Comercial** de Uhura Group y calcula el pricing, salarios, overhead, margen comercial e impuestos.
8. **Comercial registra el resultado comercial en ECO:** Registra en la cotización el monto total cotizado final, la moneda (`COP` o `USD`), la versión, la URL del Google Sheet de Finanzas y la URL del PDF/PPT de la propuesta comercial.
9. **Cliente aprueba la propuesta:** Tras presentar la propuesta formal, el cliente manifiesta su aprobación técnica y económica. HubSpot refleja el estado Cerrado Ganado (`won`). Comercial actualiza el estado a Ganada en ECO.
10. **Conversión a Proyecto Operativo:** Comercial o Líder ejecuta `Convertir a Proyecto Operativo`, transfiriendo el alcance y las horas aprobadas a la ejecución.

#### 1.3 Estado Actual
**Implementado en Frontend / Parcial para Backend.**
La navegación por pestañas (`Resumen`, `Alcance y propuesta`, `Documentos`) está operativa con reactividad en estado local. Falta persistencia en base de datos.

#### 1.4 Entidades y Campos Principales
- **`NewBusinessOpportunity`:**
  - `id`: UUID (ej. `opp-2026-001`).
  - `title`: String (Nombre del requerimiento/proyecto).
  - `prospectAccountName`: String (Nombre de la empresa prospecto).
  - `clientId`: UUID (Opcional, si el cliente ya existe en ECO).
  - `leadUserId` / `leadUserName`: String (Líder asignado canónico: *Product Lead, Creative Strategy Lead, Growth Manager, CEO, Directora Comercial*).
  - `commercialOwner`: String (Usuario comercial o de relación con cliente asignado).
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
3. **Roles Estándar Obligatorios:** Las plantillas solo pueden construirse con roles del catálogo oficial de Uhura (`STANDARD_UHURA_ROLES`). Nombres informales (*"diseñador web"*, *"redactor"*, *"developer"*, *"tracfiker"*) han sido normalizados a sus respectivos 13 roles canónicos (*"Digital Designer"*, *"Digital Content Specialist"*, *"Front-End Dev"*, *"Client Relationship Strategist"*, *"Trafficker Media"*).
4. **Cálculo Recursivo de Horas:** Toda plantilla recalcula automáticamente sus horas por actividad, horas acumuladas por entregable y total de horas por rol usando [`recalculateTemplateHours`](../components/taskflow/templates/templateEngine.ts).
5. **Gobernanza de Plantillas por Rol `leader` (🟢 Decisión funcional aprobada):** Los usuarios con Access Level `leader` están plenamente facultados para:
   - Crear nuevas plantillas del Catálogo de Servicios.
   - Editar plantillas existentes (horas, entregables, actividades y roles).
   - Duplicar plantillas para generar variantes de servicio.
   - Archivar plantillas en desuso (sin borrado físico ni afectación a cotizaciones ya emitidas).
   - Preparar y guardar alcances técnicos.

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
3. **Definición de roles canónicos:** Cada actividad se asocia obligatoriamente a uno de los 13 roles canónicos de Uhura (`STANDARD_UHURA_ROLES`).
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
En ECO rige la siguiente división estricta de dominios:

> **Finanzas / Google Sheet Oficial = Fuente de verdad del cálculo financiero y pricing.**
> Finanzas gobierna y evoluciona externamente la estructura salarial, costos de nómina, multiplicadores prestacionales, overhead operativo, bandas de margen comercial, tratamiento tributario (IVA) y TRM oficial. **ECO no calcula tarifas, márgenes, IVA, bandas financieras ni fórmulas salariales internas.**

> **ECO = Alcance Técnico + Horas por Rol + Registro del Acuerdo Comercial Cotizado**
> ECO es la plataforma operativa y de gestión de entrega. Los líderes estructuran entregables, actividades y roles requeridos; el rollup consolidado de horas alimenta el análisis de Finanzas; y Comercial registra en ECO el resultado comercial cotizado final acordado (monto cotizado, moneda, versión, enlaces al Google Sheet y PDF/PPT de propuesta, condiciones comerciales y trazabilidad hacia la creación del proyecto operativo).

#### 4.2 Retiro del Motor Financiero Interno de ECO
Se retiraron formalmente de ECO:
- El motor algorítmico interno (`financialEngine.ts`).
- Las constantes salariales y tarifarios hardcodeados (`constants.ts`).
- La vista de simulador comercial con sliders de margen (`FinancialCalculatorView.tsx`).
- Cualquier cálculo de overhead, margen o IVA en tiempo real dentro del frontend.

ECO no es un cotizador contable ni una calculadora comercial; ECO registra el resultado acordado externamente para gobernanza, emisión de SOW y conversión operativa.

#### 4.3 Entidad y Campos de Propuesta (`QuoteProposal`)
La entidad de cotización en ECO conserva exclusivamente los campos de alcance técnico y trazabilidad comercial:
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
- **`convertedToProjectId`:** Puntero idempotente al proyecto operativo en ECO tras la conversión.

#### 4.4 Separación entre Propuesta Aprobada y Cierre Ganado (HubSpot)
1. **Propuesta Aprobada (`status === 'approved'`):** Refleja la aceptación técnica y comercial por parte del cliente del alcance presentado.
2. **Deal Cerrado Ganado en HubSpot (`status === 'won'`):** Es la fuente de verdad comercial formal de Uhura Group.
3. **Regla de Conversión Canónica:** La conversión a proyecto operativo en ECO **está habilitada cuando el Deal alcanza el estado 'Cerrado Ganado' en HubSpot o se marca como Ganada en ECO**. Mientras la integración bidireccional automática con HubSpot esté en desarrollo, Comercial puede completar manualmente el flujo Ganada ➔ Convertir a proyecto en ECO.

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
  - **Pestaña Documental en New Business:** dentro de [`NewBusinessView.tsx`](../components/taskflow/newbusiness/NewBusinessView.tsx) (enlaces de Drive en la oportunidad)

#### 6.2 Estructura Estándar de Carpetas (Uhura Drive)
Toda oportunidad y proyecto en ECO se organiza bajo la siguiente convención:
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
  - Al crear el prospecto en ECO, un worker de backend creará automáticamente la carpeta en Drive con la estructura `00..03` y guardará los `folderId` en ECO.
  - Al ganar el proyecto, el backend moverá la carpeta desde `PROSPECTOS` hacia `CLIENTES / [Nombre Empresa]`.

---

### Módulo 7: Statement of Work (SOW Contractual)

#### 7.1 Propósito
Generador de la plantilla contractual técnica entre Uhura Group y el Cliente, extraída directamente del alcance aprobado en la cotización activa.
- **Referencias de Código:**
  - **Modal Generador de SOW:** [`src/components/taskflow/newbusiness/SOWModal.tsx`](../components/taskflow/newbusiness/SOWModal.tsx) · plantillas por tipo de servicio en [`sowTemplates.ts`](../components/taskflow/newbusiness/sowTemplates.ts) (e-commerce Shopify, web WordPress, app a la medida)
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

#### 7.4 Flujo de uso del SOW (revisado 07 Nov 2026)
- **Cuándo existe:** se genera de la cotización cuando la oportunidad se gana y se convierte en proyecto. Los proyectos creados a mano al arranque (Neroli, fee de Cristar; §9.4) no tienen SOW en ECO: su documento ya se firmó por fuera.
- **Dónde se abre:** New Business → oportunidad → SOW, y **Cliente → Proyectos de la cuenta → «Ver SOW»** (columna SOW; «—» si el proyecto no viene de una oportunidad).
- **Qué hace Comercial:** revisa la «Vista documento final», completa o corrige los datos en **«Completar y ajustar»** y pulsa **«Copiar para Docs»** para pegarlo en un documento de Google Drive, donde lo ajusta si quiere y lo envía a firma del cliente. «Guardar SOW» conserva lo completado en ECO.
- **Datos del acuerdo editables (se habían quedado sin campo):** NIT del cliente (precargado con la razón social elegida o la principal), orden de compra, supervisor del cliente y su cargo, representante legal del cliente con cédula y cargo, y supervisor de Uhura. Lo que falte aparece como «[COMPLETAR: …]» con el acceso «Completar ahora».
- **Cláusula de uso de IA (revisada 07 Nov 2026):** declara que Uhura usa IA como apoyo en investigación, prototipado, diseño, redacción, desarrollo, pruebas y documentación, como parte de su metodología. Cubre: supervisión humana de todo lo entregado; confidencialidad (no se usan datos del cliente para entrenar modelos; versiones empresariales o anonimización; Ley 1581); propiedad intelectual (el cliente recibe los derechos al pagar, pero lo generado con IA puede no ser protegible por derecho de autor ni exclusivo, y Uhura conserva sus herramientas, plantillas y prompts); diligencia y límites de responsabilidad (no responde por insumos del cliente, usos fuera del alcance ni cambios en herramientas de terceros; responsabilidad total limitada al valor pagado); validación del cliente antes de publicar; y la opción de pedir trabajo sin IA mediante Orden de Cambio. Fuente única: `SOW_AI_CLAUSES` en `sowTemplates.ts` (la vista, la copia para Docs y el HTML dicen lo mismo). **Debe validarla el asesor legal de Uhura antes de usarla con clientes.**
- **Secciones del documento:** 1. Antecedentes y objetivo · 2. Alcance y entregables · 3. Responsabilidades e insumos · 4. Pruebas (UAT) y silencio positivo · 5. Riesgos y mitigación · 6. Gates y control · 7. Uso de IA y datos · 8. Gestión de cambios · 9. Inversión y condiciones de pago · 10. Garantía técnica · Aceptación y firmas.

---

### Módulo 8: Formalización, Conversión a Proyecto y Gates

#### 8.1 Propósito
Asegurar una transición ordenada y atómica entre la oportunidad comercial aprobada y el proyecto operativo, garantizando que el equipo nunca arranque desde cero y que las condiciones contractuales de inicio queden registradas con total trazabilidad.
- **Referencias de Código:**
  - **Modal Conversión a Proyecto:** [`src/components/taskflow/newbusiness/ConvertOpportunityModal.tsx`](../components/taskflow/newbusiness/ConvertOpportunityModal.tsx)
  - **Controlador de Conversión:** [`src/sections/TaskFlowPrototype.tsx`](../sections/TaskFlowPrototype.tsx) (`handleConvertOpportunityToProject`)
  - **Modal Condiciones de Inicio:** «Programar inicio de proyecto» en [`ProjectsView.tsx`](../components/taskflow/ProjectsView.tsx)
  - **Checklist administrativo:** *(no existe como archivo propio en el prototipo; la regla es funcional)*
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`StartConditionsConfig`, `AdministrativeChecklist`, `FormalizationStatus`)

#### 8.2 Reglas Invariantes de la Conversión Operativa Vigente (🟢 Decisión funcional aprobada)

1. **Conversión Atómica de Oportunidad a Proyecto:**
   - Una oportunidad comercial en estado Ganada (`won`) se convierte en Cliente y Proyecto operativo mediante `ConvertOpportunityModal`.
   - Se trasladan automáticamente:
     - Entregables cotizados 1:1 (`ProjectDeliverable`) con su presupuesto de horas por rol.
     - Actividades cotizadas transformadas en tareas operativas (`TaskItem`).
     - Trazabilidad comercial: cliente asociado, enlaces a briefs, propuesta y referencias a HubSpot.
2. **Autorización de Conversión:**
   - La acción de conversión está habilitada para perfiles con Access Level `commercial` y `client_relationship`.

#### 8.3 Arquitectura de Conversión Aprobada: Regla 1:1:1 y Cronograma Paralelo (🟢 Decisión funcional aprobada - 04 Nov 2026)

Conforme a las definiciones acordadas para la UAT 2 (Ticket #132 y rama `feat/hubspot-commercial-sync-flow`):
1. **Regla Canónica 1:1:1:** Cada servicio ganado genera un proyecto independiente en la tabla `projects` de ECO. Todos quedan asociados al mismo Cliente en el Directorio sin duplicarlo.
2. **Asignación Granular de Líder Operativo:** En el modal de conversión, cada tarjeta de servicio ganado cuenta con su propio selector de Líder Operativo (`leadUserId`), permitiendo asignar líderes distintos o el mismo líder según la especialidad de cada servicio.
3. **Exclusión Estricta de Servicios Perdidos:** Cualquier servicio con etapa confirmada de `'Cierre perdido'` queda excluido de la conversión y NUNCA genera proyectos ni tareas.
4. **Estados Operativos y Botón «Iniciar proyecto 🚀»:**
   - *(Actualizado 07 Nov 2026)* La conversión **no define fechas de inicio ni de entrega**: cerrar el negocio no hace el proyecto ejecutable. Todo proyecto convertido nace **`Por iniciar`** con el botón **`Iniciar proyecto 🚀`**.
   - En la conversión se definen, por servicio de **proyecto único**, las **rondas de ajuste incluidas** y los **días hábiles por ronda** (una ronda = el cliente revisa una entrega, devuelve ajustes y aprueba; reemplaza el modelo anterior de gates × tandas). Son campos visibles y editables; los valores sugeridos (2 rondas × 5 días) solo precargan. Fee mensual no tiene rondas. Las semanas de producción se heredan del Alcance.
   - Al pulsar **`Iniciar proyecto 🚀`**, el líder fija la fecha de arranque y ECO calcula la línea base en días hábiles: entrega de insumos del cliente + producción + rondas de ajuste × días por ronda. Se congelan `baselineStartDate`/`baselineEndDate` y se programan inicio y vencimiento de cada tarea.
   - Desde ese momento el proyecto queda **`En ejecución`**.
5. **Modo Desacoplado / Manual:** La conversión opera 100% de manera autónoma cuando HubSpot no está disponible o el token está inactivo, registrando la trazabilidad en la auditoría de New Business para reconciliación posterior.

---

### Módulo 9: Clientes

#### 9.1 Propósito
Entidad que representa la cuenta comercial, operativa y de marca sombrilla con la que trabaja Uhura Group.
- **Referencias de Código:**
  - **Vista Principal de Clientes:** [`src/components/taskflow/ClientsView.tsx`](../components/taskflow/ClientsView.tsx) · **Ficha:** [`ClientDetailView.tsx`](../components/taskflow/ClientDetailView.tsx)
  - **Modal Nuevo Cliente:** [`src/components/taskflow/CreateClientModal.tsx`](../components/taskflow/CreateClientModal.tsx)
  - **Métricas de la cuenta:** [`src/components/taskflow/clientMetrics.ts`](../components/taskflow/clientMetrics.ts)
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

#### 9.3 Gobernanza Comercial, Eliminación y Fuentes de Verdad (🟢 Decisión funcional aprobada)
1. **Frente Comercial Unificado (`commercial` y `client_relationship`):**
   - Ambos roles forman parte integral del frente comercial. Para este ticket, están autorizados únicamente para:
     - Acceder a todos los Clientes y New Business.
     - Crear y editar Clientes.
     - Crear, editar y archivar oportunidades.
     - Convertir oportunidades en Cliente y Proyecto.
     - Eliminar únicamente borradores sin trazabilidad posterior.
   - *Aclaración:* El ajuste de fechas del cronograma o reforecast pertenece a la propuesta futura de planificación y queda expresamente fuera de este alcance.
2. **Reglas Estrictas de Eliminación vs. Archivo:**
   - **Eliminación permitida:** Únicamente sobre borradores huérfanos que no posean proyectos vinculados, tareas, horas computadas ni relaciones posteriores en la cadena de valor.
   - **Archivo obligatorio:** Si existe cualquier rastro de trazabilidad operativa, comercial o histórica, el registro NO se elimina: debe transicionar al estado `archived`.
   - **Eliminación definitiva controlada:** Queda reservada con carácter exclusivo para usuarios con nivel `system_admin`.
3. **Fuentes de Verdad e Integraciones Futuras:**
   - **HubSpot:** Fuente de verdad del estado comercial (empresas, contactos, pipeline y cierre de deals).
   - **Alegra:** Fuente de verdad fiscal y tributaria (terceros, NIT/RUT validado, facturas electrónicas e impuestos).
   - **ECO:** Centro de gravedad operativo que preserva la trazabilidad mediante identificadores externos (`hubspotDealId`, `alegraContactId`). Los cambios o bajas en los sistemas fuente se reflejarán bajo reglas de sincronización auditadas sin alterar el histórico de ejecución.

#### 9.4 Ficha del cliente: de dónde sale cada dato (revisado 07 Nov 2026)
Regla: **nada se inventa**. Si no hay datos, la ficha dice «—» o «Sin datos» y explica por qué. La lista de Clientes usa el mismo cálculo, así que ficha y lista siempre coinciden.

| Módulo | Fuente |
|---|---|
| Encabezado (estado, NIT, responsable) | Datos del cliente; se editan en «Editar cuenta». |
| Proyectos (total · activos · cerrados) | Proyectos de ECO del cliente + historial guardado, sin duplicar. Cerrado = con registro de cierre (§11.7), cerrado, completado o archivado. |
| Valor vendido | Suma del valor vendido en COP de sus proyectos de ECO. Proyectos en USD no se suman (no se convierte). |
| Margen promedio | Promedio del margen real de los proyectos cerrados que lo tengan. Sin cierres con margen: «—». |
| Facturación y cartera | «Pendiente de la integración con facturación (Alegra)». ECO no inventa facturado ni por cobrar. |
| Razones sociales y Contactos | Captura manual («Gestionar NITs» / «Gestionar contactos»). |
| Integraciones | Google Chat; solo `system_admin` (gestiona) y `executive` (consulta). Otros perfiles no ven esta sección. |
| Salud de la cuenta (4 dimensiones) | **Rentabilidad:** margen promedio (≥ 35 % verde, ≥ 25 % amarillo, menor rojo). **Cartera:** sin datos hasta Alegra. **Cumplimiento:** % de proyectos cerrados entregados a tiempo (desvío ≤ 0 días hábiles); si aún no hay cierres, % de proyectos activos con salud «Saludable» (≥ 85 % verde, ≥ 70 % amarillo). **Recurrencia:** fee activo o 3+ proyectos = verde; 1–2 proyectos = amarillo. |
| Salud general | Se califica solo con **al menos 2 dimensiones con datos**: cualquier rojo = «En riesgo», cualquier amarillo = «Atención», si no «Saludable». Con menos de 2: «Salud: sin datos suficientes». |
| Radar | Aparece cuando las 4 dimensiones tienen datos; si no, dice cuáles faltan. |
| Marcas y Notas | Captura manual en la edición del cliente. |
| Tabla de proyectos | Estado real del proyecto; semáforo = salud calculada del proyecto (Saludable/Atención/Riesgo) o «—» si aún no tiene evaluación; margen real solo al cerrar; columna SOW para proyectos que vienen de una oportunidad (§7.4). |

Los campos guardados `projectsCount`, `averageMarginPercent`, `billedCOP`, `receivableCOP`, `healthStatus` y `behavior` del cliente **ya no se muestran**: todo se calcula. En producción no deben persistirse como valores fijos.

---

### Módulo 10: Administración Fiscal y Frontera con Alegra

#### 10.1 Propósito
Gestión de datos de facturación electrónica y articulación con el sistema contable Alegra.
- **Referencias de Código:**
  - **Modal de Entidades Fiscales y Facturación:** «Gestionar NITs» en [`ClientDetailView.tsx`](../components/taskflow/ClientDetailView.tsx)
  - **Checklist administrativo:** *(no existe como archivo propio en el prototipo; la regla es funcional)*
  - **Tipos Fiscales:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`ClientTaxEntity`, `AdministrativeChecklist`)

#### 10.2 Responsable y Flujo de Trabajo
- **Responsable en Uhura:** Área Administrativa (Administración & Finanzas).
- **Checklist Administrativo (`AdministrativeChecklist`):**
  - `rutStatus`: Enum (`pending` | `received` | `verified`).
  - `idCardStatus`: Enum (`pending` | `received` | `verified`).
  - `billingEmail`: String (Correo receptor de factura electrónica DIAN).
  - `alegraCreated`: Boolean (Marca si el tercero ya fue registrado en Alegra).
  - `alegraContactId`: String (ID del tercero en la base de datos de Alegra).

#### 10.3 Reglas de Integración con Alegra
1. **ECO NO es un sistema de contabilidad:** ECO no calcula balances contables, cuentas contables PUC, ni retenciones en la fuente complejas.
2. **Alegra es la Fuente de Verdad Fiscal:** ECO solo necesita almacenar el `alegraContactId` del cliente y, a futuro, recibir el número de factura y estado de pago de los hitos cobrados.

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
1. Resumen: Entregables, cronograma y rondas de ajuste, y Equipo Asignado (derivado de tareas, Módulo 14 §14.3).
2. Tareas: Tablero operativo y lista de tareas con entregables colapsados por defecto y bloque de dependencias.
3. Matriz Horas por Rol: Horas cotizadas vs. ejecutadas por rol y por entregable. No visible para `collaborator`.
4. Backlog (Opcional): Visible únicamente cuando el proyecto contiene fases estructuradas.
```
*(Actualizado 07 Nov 2026)* Ya no existen pestañas «Equipo» (se integró en Resumen), «Actividad» ni «Configuración». Las acciones del proyecto viven en el menú ⋮: Editar, Notificaciones (Google Chat, §11.8), Archivar y Eliminar.

**Vista por perfil:**
- `collaborator`: Resumen y Tareas en solo lectura del proyecto (sin menú ⋮, sin «Iniciar proyecto» ni «Ajustar», sin Matriz Horas). Su trabajo diario está en Mi Día y Tareas.
- Perfiles con edición de proyectos (`leader`, `client_relationship`, `system_admin`): todas las acciones.
- `executive`: consulta; en el menú ⋮ solo Notificaciones (lectura).

> **DECISIÓN DE DISEÑO Y REDUCCIÓN DE RUIDO VISUAL (PESTAÑA RESUMEN):**
> Para evitar saturación y duplicidad cognitiva, la pestaña **Resumen** se optimizó radicalmente:
> 1. **Eliminación de KPI Cards Duplicadas:** Las 4 tarjetas de resumen ("Presupuesto", "Ejecución", "Entregables", "Cronograma") fueron retiradas del cuerpo de Resumen porque ya se muestran de manera destacada y siempre visible en la tarjeta superior del encabezado del proyecto.
> 2. **Eliminación de la Sección de Reworks Global:** Se retiró el bloque "Rondas de Ajuste & Retrabajos" del cuerpo de Resumen, dado que los retrabajos se auditan formalmente a nivel atómico en cada tarea y su límite contractual se visibiliza en la gobernanza.
> 3. **Traslado de Dependencias a Tareas:** La sección "Dependencias, Insumos & Aprobaciones de Cliente" se trasladó a la pestaña **Tareas**, situándose inmediatamente arriba de la lista de tareas para que el equipo resuelva bloqueos antes de iniciar su jornada de ejecución.

#### 11.3 Gobernanza Contractual en el Encabezado del Proyecto
En el encabezado del proyecto, especialmente para proyectos de alcance único (`fixed_project`), se visibilizan las reglas contractuales fundamentales acordadas:
- **Rondas de ajuste incluidas** (chip del encabezado): una ronda = el cliente revisa una entrega, devuelve ajustes y aprueba. Se define por proyecto (sugerido 2 × 5 días hábiles); reemplaza el modelo anterior de gates × tandas (§8.3).
- **Entrega de insumos del cliente:** días hábiles tras el kickoff (sugerido 3; 0 si no aplica), sin consumo de capacidad.
- **Trinomio de Cronograma:** Baseline inicial (inmutable), Forecast proyectado y Fecha Real de cierre. El KPI «Cronograma» muestra inicio → forecast y la diferencia en días hábiles frente a la línea base cuando existe.

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
    - `includedReworkRounds`: Integer (Default sugerido: 2 rondas de ajuste incluidas).
    - `reworkRoundDays`: Integer (Default sugerido: 5 días hábiles por ronda. No consume capacidad).
    - `productionWeeks`: Integer (Semanas de producción heredadas del Alcance).
    - *Obsoletos:* `gateCount` y `gateApprovalWaitDays` (modelo anterior de gates × tandas); no se usan para calcular.
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

#### 11.6.1 Fee mensual: vigencia, ciclos y renovación (🟢 Decisión aprobada · 🟣 Implementado en prototipo · 07 Nov 2026)
- **Un fee es un solo proyecto** con ciclos mensuales; no se crea un proyecto por mes.
- **Conversión:** por servicio fee se confirma la **vigencia en meses** (precargada de la cotización, editable: 3, 6, 12…) y la política de **horas no usadas**: `No se acumulan` (`none`) · `Pasan al mes siguiente` (`carry_over`) · `Pasan hasta un 25 %` (`contractual_cap`).
- **Regla general: las horas no usadas no se acumulan.** Trasladarlas es una excepción pactada con el cliente: se propone en la conversión y se **confirma o cambia en «Iniciar proyecto»** (y en «Ajustar»).
- **Iniciar proyecto:** fija el inicio del contrato y calcula el fin (`inicio + vigencia − 1 día`). Las tareas del alcance son la **plantilla del mes 1** y se reparten en ese mes. No aplica cronograma de rondas.
- **Ciclo mensual:** bolsa mensual de horas por rol (la del alcance) + horas trasladadas según la política. Cada tarea pertenece a un ciclo (`cycleKey = 'YYYY-MM'`; si falta, se deriva de su fecha).
- **Tareas recurrentes:** en producción, ECO crea el día 1 de cada mes las tareas del ciclo a partir de la plantilla del mes 1 (sin tiempo, estado ni registros). En el prototipo se hace con «Generar tareas de <mes>».
- **Consultar un mes (p. ej. enero):** selector **Ciclo** en el encabezado del proyecto; KPIs, Resumen, Tareas y Matriz se filtran a ese mes. Opción «Contrato completo» para ver todo.
- **Histórico corto:** el selector y la tabla de Resumen muestran mes anterior, actual y siguiente; el resto queda agrupado por año bajo demanda («Ver los N meses del contrato»). Cada mes es una fila: bolsa (+ trasladadas), ejecutadas, desvío y estado.
- **Renovación:** aviso 30 días antes del fin del contrato. «Renovar fee» agrega meses (nuevo periodo) con la bolsa mensual acordada y una nota; el histórico se conserva. Si no se renueva, se usa el cierre de proyecto (Módulo 11 §11.7).
- Referencias: `src/components/taskflow/schedule/feeCycles.ts`, `projects/FeeContractSection.tsx`.

#### 11.7 Cierre del Proyecto (🟢 Decisión aprobada · 🟣 Implementado en prototipo · 07 Nov 2026)
Acción **⋮ → Cerrar proyecto**, disponible para perfiles con edición de proyectos cuando el proyecto ya inició y no está cerrado ni archivado.
- **Tareas resueltas antes de cerrar:** si hay tareas sin completar, el cierre se bloquea y ofrece «Ir a Tareas».
- **Foto final (solo lectura):** horas ejecutadas vs. cotizadas, rondas de ajuste usadas vs. incluidas (proyecto único) y desviación de la fecha real frente a la línea base en días hábiles.
- **Datos obligatorios:** fecha real de entrega, motivo (`Entregado y aprobado por el cliente` · `Cerrado anticipadamente` · `Cancelado por el cliente`) y aprendizajes/observaciones.
- **Resultado:** `status = Cerrado`, `actualEndDate` y registro `closure` (autor, fecha/hora, motivo, nota y la foto final). El histórico de horas (`TimeLog`) y de tareas se conserva intacto; Resumen muestra la tarjeta «Proyecto cerrado».
- Archivar sigue siendo una acción distinta (ocultar del portafolio activo).
- Referencia: `src/components/taskflow/projects/CloseProjectModal.tsx`.

---

### Módulo 12: Entregables

#### 12.1 Propósito
Componente o fase operativa que agrupa un conjunto de tareas y un presupuesto específico de horas por rol.
- **Referencias de Código:**
  - **Vista y Lista de Entregables:** entregables dentro de [`ProjectsView.tsx`](../components/taskflow/ProjectsView.tsx) y [`ProjectTasksTab.tsx`](../components/taskflow/projects/ProjectTasksTab.tsx)
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
  - **Tarjeta de Tarea en Kanban:** [`BoardView.tsx`](../components/taskflow/BoardView.tsx) y [`MyTasksView.tsx`](../components/taskflow/MyTasksView.tsx)
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
  - **Matriz de Staffing:** equipo derivado de las tareas en [`ProjectTeamTab.tsx`](../components/taskflow/projects/ProjectTeamTab.tsx) y [`teamFromTasks.ts`](../components/taskflow/projects/teamFromTasks.ts) (no hay matriz de staffing separada)
  - **Tipos de Dominio:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`ProjectAssignment`, `AssignmentNature`)

#### 14.2 Diferencia Crítica: Rol Cotizado vs. Persona Asignada
- **Rol Cotizado (`budgetedRoleId`):** Perfil conceptual presupuestado en New Business (ej. *Front-End Dev*, tarifa de costo nómina según tarifario).
- **Persona Real (`assignedUserId`):** Colaborador específico de la empresa (ej. *Juan Pérez*, desarrollador real contratado).
- ECO permite comparar si la persona asignada coincide con el perfil cotizado o si hubo un cambio de seniorities que altere la rentabilidad real del proyecto.
- **Catálogo cerrado (07 Nov 2026):** solo los roles oficiales de `STANDARD_UHURA_ROLES` se cotizan, se sugieren y aparecen en selectores (alcance, tareas, plantillas). No se crean roles por funciones puntuales: QA, backend ligero o soporte son **actividades** cotizadas bajo un rol oficial; quién las ejecutó lo registra la tarea («cubre rol», §14.3). Roles heredados fuera del catálogo se muestran como «fuera del catálogo» para no perder datos, pero no se ofrecen para nuevas tareas.
- **Recursos externos / subcontratados** (backend, arquitectura de servidores, etc.): no son roles de Uhura. Se registran en la cotización como costo (valor fijo u horas × tarifa del proveedor), viajan al proyecto en la conversión (por servicio; sin servicio → primer proyecto) y se ven en Resumen para perfiles no colaboradores. No consumen capacidad, no aparecen en Mi Día ni en la Matriz de horas por rol.

#### 14.3 Equipo derivado de las tareas (🟢 Decisión aprobada - 07 Nov 2026)
Se elimina la asignación manual de colaboradores al proyecto (modal «Asignar / Modificar asignación de rol»). En la práctica el equipo reasigna directamente en la tarea, y el modal quedaba desactualizado (p. ej. 8 h/sem fijas).
- **Fuente única de verdad:** la tarea (`budgetedRole` + asignados + `scheduledDate`/`dueDate` + `timeLogs`).
- **El rol lo define la actividad, no la persona:** las horas registradas en una tarea de *Front-End Dev* consumen la bolsa de Front-End aunque las ejecute un Product Lead. Las horas cotizadas de la actividad **nunca cambian** al reasignar.
- **«Cubre rol»:** si el rol de la tarea no está entre los roles oficiales de la persona (`officialRole(s)` / `professionalRole(s)`), se marca para análisis de costo (líder ejecutando trabajo de un rol de menor tarifa).
- **Equipo Asignado (Resumen del proyecto)** se calcula por persona:
  - Roles desempeñados con horas cotizadas asignadas y ejecutadas por rol.
  - Carga de esta semana = horas de tareas no completadas prorrateadas en días hábiles sobre su ventana `scheduledDate → dueDate`.
  - Pendiente = horas de tareas no completadas; Ejecutado = `timeLogs` del usuario.
  - Capacidad global = misma carga semanal sumando todos los proyectos vs. `capacityHours`.
- **Gobernanza** (seguimiento, checkpoints, comités) se modela como tareas del líder dentro del alcance.
- **Seguidores/Stakeholders** se mantienen (visibilidad sin horas ni rol).
- La entidad `ProjectAssignment` queda **obsoleta para operación**; el backend puede exponer el equipo como vista/consulta agregada sobre `tasks` y `time_logs`.
- Referencia de implementación: `src/components/taskflow/projects/teamFromTasks.ts`.

---

### Módulo 15: Capacidad del Equipo

#### 15.1 Propósito
Visibilidad matemática de la disponibilidad real del equipo para asumir nuevos proyectos y evitar el burnout.
- **Referencias de Código:**
  - **Vista de Capacidad de Equipo:** [`CapacityView.tsx`](../components/taskflow/CapacityView.tsx)
  - **Tipos de Capacidad:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts) (`TeamMemberCapacity`)

#### 15.2 Reglas Fundamentales de Capacidad (🟢 Decisión funcional aprobada)

##### 1. Capacidad Semanal Base vs. Capacidad Neta Semanal
- **Capacidad Base Predeterminada:** **42 horas semanales por persona** para todo el equipo Uhura, independientemente del país o calendario asignado.
- **Configuración Individual:** Es editable de forma individual en el perfil del colaborador en *Equipo & Accesos*.
- **Permiso Exclusivo:** **Únicamente `system_admin`** puede modificar la capacidad semanal o el calendario laboral.
- **Estado "Sin configurar":** Solo debe mostrarse en la interfaz si en la base de datos realmente no existe un valor configurado (`capacityHours == null`).
- **No asumir jornada fija de 8 horas diarias:** La distribución horaria parte de la capacidad semanal base configurada. Para efectos de cómputo en semanas estándar de 5 días hábiles (L-V), el valor de referencia diario se deriva como:
  $$\text{Valor Diario Referencial} = \frac{\text{capacidadSemanalBase}}{5} \quad (\text{ej. } 42\text{h} / 5 = 8.4\text{h/día})$$
- **Distinción Conceptual Crítica:**
  - **Capacidad Semanal Base:** Cantidad contractual configurada en el perfil del usuario (ej. 42h).
  - **Capacidad Neta Semanal:** Disponibilidad real efectiva tras deducir festivos y ausencias.

  $$\text{Capacidad Neta Semanal} = \text{Capacidad Semanal Base} - \text{Horas Festivos del Calendario} - \text{Ausencias Aprobadas}$$

##### 2. Calendario Laboral por Persona (Colombia y México)
En **Equipo & Accesos**, cada colaborador debe tener configurado explícitamente:
- **Capacidad semanal base:** 42 horas predeterminadas (*Posible implementación técnica, sujeta a validación de Indunova: `weekly_capacity_hours`*).
- **Calendario laboral asignado:** Colombia o México (*Posible implementación técnica, sujeta a validación de Indunova: `work_calendar = 'colombia' | 'mexico'`*).
- **Fecha de vigencia:** Fecha a partir de la cual entra en vigencia el calendario o cualquier modificación (*Posible implementación técnica, sujeta a validación de Indunova: `calendar_effective_date`*).
- **Reglas Mandatorias:**
  - **La ciudad NO determina el calendario laboral.** No se infiere por ubicación geográfica ni por el campo de ciudad.
  - **Días festivos aplicables:** Se calculan exclusivamente según el calendario laboral asignado al colaborador (festivos de Colombia con traslados de Ley Emiliani vs. feriados oficiales de la LFT de México).
  - **Ausencias aprobadas:** Se descuentan adicionalmente sobre la capacidad neta.
  - **Irretroactividad:** Un cambio de calendario o de capacidad semanal entra en vigencia desde la fecha definida y **no recalcula ni altera silenciosamente periodos históricos cerrados**.
  - **Google Calendar:**
    > Google Calendar puede apoyar la sincronización de ausencias y vacaciones, pero no reemplaza el calendario laboral Colombia o México configurado explícitamente en Equipo & Accesos.
- **Asignación Actual de Calendarios (Corte Canónico):**
  - **Calendario México:** 5 colaboradores activos (detallados en Equipo Canónico Privado).
  - **Calendario Colombia:** 13 colaboradores activos (detallados en Equipo Canónico Privado).

##### 3. Propuesta Funcional en Evaluación: Estados de Capacidad Derivados del Cronograma (⚠️ Propuesta funcional pendiente de aprobación e implementación)

> **NOTA DE ALCANCE:**
> La diferenciación entre los tres estados de capacidad (*Demanda ganada pendiente de programar*, *Capacidad tentativa con alertas de sobreasignación futura* y *Capacidad comprometida*) hace parte de la nueva propuesta de activación y gobernanza del cronograma.
> **NO hace parte de las decisiones cerradas de este ticket ni está implementada en el core vigente**. Se evaluará e implementará en el ticket y prototipo independientes de cronograma.

- **Demanda Ganada Pendiente de Programar (Propuesta):** Proyectos convertidos pendientes de inicio; 0% descuento de capacidad oficial.
- **Capacidad Tentativa (Propuesta):** Proyección multivariable con alertas preventivas de sobrecarga antes de aprobar la línea base.
- **Capacidad Comprometida (Propuesta):** Tareas con línea base consolidada que descuentan capacidad disponible.

---

### Módulo 16: Time Tracking (Registro y Corrección de Tiempo)

#### 16.1 Propósito
Captura fidedigna, sin fricción y auditable de las horas realmente invertidas por el equipo en la ejecución de las tareas.

#### 16.2 Reglas Invariantes de Registro y Corrección (🟢 Decisión funcional aprobada)

1. **Validez Inmediata sin Aprobación Previa:**
   - Cualquier usuario activo puede registrar su propio tiempo sobre las tareas asignadas o frentes en los que colabore.
   - Las horas registradas **quedan válidas inmediatamente** sin requerir un flujo de aprobación previa.
   - Impactan en tiempo real el consumo de la tarea, el presupuesto del Proyecto y la capacidad disponible del colaborador.
2. **Historial Completo y Transparente en Tarea:**
   - Cada tarea debe mostrar en su detalle el historial completo de imputaciones:
     - Colaborador que ejecutó el trabajo.
     - Fecha civil del registro (`loggedDate`).
     - Duración registrada (horas y minutos).
     - Origen: Manual o Cronómetro (Timer).
     - Comentario / notas de la actividad realizada.
     - Estado del registro.
     - Acción para editar o anular.
   - **Ventana «Registrar tiempo» al detener el cronómetro (UI, 07 Nov 2026):** misma estructura visual que «Cargar horas» (registro manual): encabezado oscuro con reloj, banda «Tarea seleccionada» (cliente › proyecto › tarea), «Duración del trabajo» con campos de horas y minutos siempre visibles y precargados con lo medido, y una etiqueta «Cronómetro: 10 min 36 s». Si no se tocan los campos se registra lo medido exacto; al cambiarlos queda «Ajustado a mano (mínimo 1 min) · Usar lo medido». Una sola barra de uso de la tarea, visible solo si tiene horas estimadas. Pie: «Descartar» a la izquierda (pide confirmación), «Seguir trabajando» y «Registrar 10 min 36 s». **La X y Esc cierran y siguen midiendo; nunca descartan el tiempo.** La lógica de registro no cambia.
3. **Ventana de Corrección y Cierre Semanal:**
   - **Durante la semana en curso:** Cada colaborador puede **corregir o anular libremente sus propios registros de tiempo**.
   - **Después del cierre semanal:** La ventana de autocorrección se bloquea. Únicamente pueden corregir o anular registros cerrados los usuarios con rol:
     - `leader` (Project Lead del proyecto).
     - `administrative` (Área Administrativa).
     - `executive` (Dirección General / Representación Legal).
     - `system_admin` (Administradores de Sistema).
4. **Prohibición de Borrado Físico (Auditoría Inmutable):**
   - Los registros de tiempo **no se eliminan físicamente de la base de datos**.
   - Toda corrección o anulación (soft delete) conserva:
     - Valor original.
     - Valor corregido.
     - Usuario responsable que ejecutó la modificación.
     - Fecha y hora exacta (timestamp ISO UTC).
     - Motivo o justificación de la anulación o corrección.
   - *Posible implementación técnica, sujeta a validación de Indunova:* modelo `TimeLogAuditEntry` o tabla de eventos de auditoría inmutable.
5. **Recálculo Automático en Cascada:**
   - Cada modificación o anulación de horas recalcula automáticamente:
     - Horas ejecutadas totales de la tarea (`consumedHours`).
     - Horas disponibles restantes de la tarea.
     - Horas acumuladas del Proyecto (`Project.consumedHours`).
     - Carga ejecutada y capacidad libre del colaborador en el módulo de Capacidad.
     - Reportes y métricas de rentabilidad asociados.
6. **Reglas del Cronómetro (Timer Activo):**
   - Un solo temporizador activo o pausado por usuario a nivel global.
   - El tiempo en pausa (`PAUSED`) **bajo ninguna circunstancia cuenta como tiempo efectivo de trabajo**. Únicamente los segmentos en estado activo `RUNNING` computan al momento de guardar (`Stop`).

---

### Módulo 17: Mi Día (Home Contextual y Bandeja de Acción)

#### 17.1 Propósito
Pantalla principal de inicio para todo usuario de ECO, diseñada como una bandeja de acción contextual viva que responde en tiempo real a la pregunta: *"¿Quién tiene la siguiente acción?"*. Elimina la dispersión entre dashboards analíticos y listas de tareas desconectadas, organizando el día en tres niveles esenciales:
1. **¿Qué requiere mi atención hoy?** (Bandeja dinámica de excepciones y handoffs por rol; si el contador es 0, la sección desaparece).
2. **¿Qué tengo que hacer hoy?** (Lista priorizada de tareas asignadas para hoy con timer integrado y botón para solicitar revisión).
3. **¿Cómo voy?** (Progreso de horas de la jornada, carga rápida y consulta de registros de tiempo).

- **Referencias de Código:**
  - **Componente Principal Mi Día:** [`src/components/taskflow/MiDiaView.tsx`](../components/taskflow/MiDiaView.tsx)
  - **Tipos y Perspectivas:** [`src/components/taskflow/types.ts`](../components/taskflow/types.ts)
  - **Motor de Vida de Equipo:** [`src/components/taskflow/copilot/teamLifeEngine.ts`](../components/taskflow/copilot/teamLifeEngine.ts)

#### 17.2 Perspectivas y Handoffs Contextuales por Rol
Mi Día adapta dinámicamente sus secciones de atención según el rol activo del usuario:

- **1. Comercial (Access Level `commercial` / `client_relationship`):**
  - **Asignación de Líder:** Detecta oportunidades comerciales creadas que aún no tienen líder de alcance asignado.
  - **Registro de Cotización Externa (Handoff de Alcance Listo):** Detecta oportunidades en estado `internal_review` donde el Líder ya marcó el alcance técnico como listo (`Marcar alcance listo`). Muestra la acción para realizar el cálculo financiero en el Google Sheet oficial y registrar el valor cotizado en ECO.
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
  - **Tareas Asignadas para Hoy:** Solo las tareas propias que el cronograma pone para hoy (y vencidas), ordenadas por fecha y prioridad; si no hay, «Próximas» (ver §17.5).
  - **Acción Operativa Directa:** Inicio directo de cronómetro (timer), registro de horas y botón `Solicitar revisión ->` al terminar los entregables para pasar la tarea al líder.
  - **Retrabajos Asignados:** Notificación destacada de tareas devueltas en revisión o con retrabajo registrado que requieren corrección prioritaria.

- **5. Dirección / Management (CEO / Operaciones):**
  - Proyectos en riesgo en el motor multivectorial de salud.
  - Capacidad libre del equipo semana a semana para evaluar nuevos negocios.
  - Excepciones financieras y operativas de alto nivel sin ruido administrativo menor.

#### 17.3 Articulación entre Mi Día y la Campana de Notificaciones
ECO utiliza un modelo complementario de comunicación:
- **Mi Día:** Es la **bandeja de trabajo estructurada** donde el usuario encuentra sus tareas prioritarias, pendientes de revisión y handoffs accionables organizados por jerarquía.
- **Campana de Notificaciones (In-App):** Es el **canal de eventos inmediatos** que notifica en tiempo real cuando ocurre un handoff (ej. *"Comercial te asignó la oportunidad X"*, *"Líder de alcance marcó el alcance listo para la oportunidad Y"*, *"Colaborador solicitó revisión en la tarea Z"*). Ambos sistemas consumen el mismo modelo de eventos sin duplicar lógica de negocio.

#### 17.4 Eventos de Equipo en Mi Día (Cumpleaños, Aniversarios y Ausencias)
Mi Día puede mostrar de forma discreta y no invasiva:
- **Cumpleaños de hoy y próximos:** Calculados en tiempo de ejecución a partir de `birthDate` persistido en el perfil (`UserItem`).
- **Aniversarios en Uhura:** Calculados a partir de `fecha_ingreso` persistido en el perfil (derivando la fecha anual del año en curso y los años cumplidos).
- **Ausencias y vacaciones próximas relevantes:** Obtenidas del modelo canónico `TeamAbsenceEvent` (eventos aprobados y programados).
- *Criterio UI:* Información visible de manera sobria y secundaria, sin competir con la lista de tareas operativas ni saturar el home con widgets pesados.

#### 17.5 Regla de visibilidad de tareas (todos los perfiles)
- **Mi Día = el cronograma de hoy.** Solo aparecen las tareas cuyo cronograma cae hoy (inicio o vencimiento hoy, o en curso) y las vencidas sin cerrar. La urgencia no la decide ECO: viene marcada en la tarea por quien la pide, y solo sirve para ordenar. Si la persona no tiene nada agendado hoy, Mi Día le muestra **«Próximas»**: sus siguientes tareas por cercanía de fecha y prioridad, para adelantar.
- **Tareas = todo, ordenado por fecha.** Primero las vencidas, luego las urgentes con fecha hoy o mañana y después el resto por fecha más cercana.
- **Mis prioridades = solo lo que me pertenece.** En «Qué tengo que hacer hoy» y en «Mis tareas» aparecen únicamente las tareas donde la persona es responsable de ejecución (asignada o colaboradora) y las que le toca revisar. Nunca tareas de otras personas, aunque compartan rol, área o primer nombre.
- **Seguidores, sin la misma urgencia.** Quien está como seguidor para revisar o estar al tanto ve la tarea en **«Siguiendo»** (bloque plegado en Mi Día y pestaña en Tareas). No cuenta como pendiente, no suma a su carga ni a la bandeja de atención.
- **Mi Día es personal para todos los perfiles (#147 + decisión de Uhura, 07 Nov 2026):** todos, incluida Dirección (`executive`), ven en la atención solo lo que ejecutan o lideran; `leader` además recibe las alertas de los proyectos que lidera. La vista de toda la organización está en Tareas → Equipo y Capacidad → Organización. Las tareas propias **urgentes, que inician hoy o vencen hoy** van de primeras en «¿Qué requiere mi atención?» (#146).
- **Comercial y líder: lo de sus proyectos permea su día.** Insumos y dependencias del cliente, bloqueos, desvíos de horas y retrabajos llegan a la bandeja «¿Qué requiere mi atención?» (parte superior de Mi Día) solo de los proyectos de los que la persona es responsable (líder del proyecto o responsable de cuenta). Dirección y administración del sistema ven en esa misma bandeja las excepciones de todos los proyectos (además del semáforo de Proyectos y del Tablero de Dirección y Finanzas), pero no las tareas de otros en su lista personal.
- **Tareas · «Equipo»:** el colaborador no lo ve. Líder y comercial ven las tareas de sus proyectos; Dirección y administración, todas.
- Requisito técnico y criterios de aceptación: `BACKEND_REQUIREMENTS.md` §15.1. Implementación en el prototipo: `auth/taskVisibility.ts`, usada por `MiDiaView.tsx` y `MyTasksView.tsx`.

---

### Módulo 18: Mascota ECO (antes «Bucky») y La Colonia (Espacio Social & Lúdico)

> **Nombre (07 Nov 2026):** la mascota se llama **ECO**, igual que la plataforma (antes «Bucky»). Los textos visibles usan «ECO»; los nombres internos de código (`buckyEngine`, `BuckyLabModal`) se mantienen por compatibilidad.
>
> **Reglas de la mascota (revisadas 07 Nov 2026):**
> - **Personaje:** 13 imágenes oficiales, ya incluidas en el repositorio en `src/assets/images/eco/` (no hay que adjuntarlas aparte):
>   - **Estándar, buzo morado (8):** `eco-thumbs-up` (pulgar arriba), `eco-celebrating`, `eco-surprised`, `eco-worried`, `eco-sad`, `eco-thinking`, `eco-focus` (tablet), `eco-coffee`.
>   - **Navidad (5):** `eco-christmas` (pose base), `eco-xmas-coffee` (cafecito), `eco-xmas-hello` (hola), `eco-xmas-cheer` (crack, con regalo) y `eco-xmas-water` (agua).
> - **Emociones según el día de la persona** (`buckyEngine.ts`, siempre con sus propias tareas, regla §17.5), en este orden:
>   1. Cronómetro corriendo → **en foco**.
>   2. Una tarea propia superó sus horas cotizadas → **sorprendido** (aviso con opción de avisar al líder).
>   3. Tareas propias vencidas → **preocupado**, con tono de ayuda («¿la cerramos o pedimos nueva fecha?»).
>   4. Todas las tareas de hoy listas → **celebrando**; tarea recién terminada → celebrando breve.
>   5. Pausa recomendada o inactividad → **café**.
>   6. Más horas planeadas hoy que la jornada → **preocupado** («hoy viene pesado»).
>   7. Primera visita del día o todo en orden → **pulgar arriba**.
>   8. Nada agendado hoy → **pensativo**, sugiriendo la próxima tarea a adelantar.
>   - **Triste + recordatorio de horas (🟢 ya existe en producción · reconciliado 07 Nov 2026):** en día hábil, sin ausencia registrada y desde las 4:00 p. m., si la persona lleva **menos del 80 %** de su jornada diaria registrada (capacidad semanal ÷ 5), ECO se pone triste y muestra un recordatorio juguetón con «Cargar mis horas» y «Más tarde». No aparece si el cronómetro está corriendo. **Este comportamiento ya funciona en la plataforma de producción de Indunova: no se reimplementa ni se modifica con esta entrega.** El prototipo solo lo replica para que la mascota sea coherente. Si la hora o los canales de producción difieren de lo descrito aquí, **prevalece producción** y se ajusta el prototipo. **Excepción decidida por Uhura (07 Nov 2026): el umbral se unifica en 80 %** en todo ECO (este recordatorio, la racha, «Cerrar mi día» y el correo semanal); si producción usa hoy otro porcentaje, se cambia solo ese valor a 80 %.
>   - Fuera de ese caso, **triste** solo aparece como reacción breve.
>   - **Las emociones son reacciones, no estados fijos (07 Nov 2026):** cuando cambia el motivo, ECO muestra la emoción un rato y vuelve a su cara normal (pulgar arriba): sorprendido y triste ~45 s, preocupado ~30 s, café ~20 s, pensativo ~15 s, celebrando ~12 s. El aviso del globo se recoge con la emoción. Si el motivo de un aviso sigue vigente (p. ej. una tarea propia pasada de horas o las horas sin cargar), ECO lo vuelve a recordar cada 30 minutos. Concentrado se mantiene mientras corra el cronómetro. El motivo sigue visible al abrir la ventana de la mascota.
>   - **Moods de ambiente que rotan durante el día (07 Nov 2026):** cuando ECO está en reposo (sin avisos, sin cronómetro, sin ventanas abiertas), cambia de pose unos segundos y vuelve a la normal. Con la apariencia de Navidad: **cafecito** («Uff… un cafecito no caería nada mal ☕»), **hola** (solo cambia de pose, no dice nada), **crack** (mensaje de aliento: «¡Eres un crack! Lo que estás haciendo hoy suma 💪») y **agua** («Recuerda tomar agua 💧»). Cada mood tiene varias frases y se elige una al azar; nunca repite el mismo mood dos veces seguidas. Con la apariencia estándar salen solo los que tienen imagen (cafecito y crack). **No sale a todos al mismo tiempo:** cada persona tiene su propio momento aleatorio (el primero entre 2 y 6 min después de entrar y luego cada 6 a 18 min). Si aparece un aviso, una ventana o el cronómetro, el mood se retira enseguida. Reemplaza el ciclo anterior que hacía una acción aleatoria cada 45 s. Para revisarlo rápido en el prototipo: `?ecoMoods=fast` (solo desarrollo, igual que el laboratorio).
> - **Apariencia de temporada (07 Nov 2026):** **noviembre y diciembre = Navidad** de forma automática; de enero a octubre, estándar (buzo morado). `system_admin` puede cambiarla para toda la organización desde la ventana de la mascota («Apariencia de ECO para todo el equipo»), pero el cambio solo vale para la temporada en curso: el 1 de noviembre y el 1 de enero vuelve el valor por defecto. **En Navidad, ECO usa solo imágenes navideñas y nunca se cruza con el buzo morado:** pulgar arriba y en foco → pose navideña base; pensativo → hola; celebrando → crack; café → cafecito. Las emociones que aún no tienen versión navideña (sorprendido, preocupado, triste) usan la pose navideña base y el globo explica el motivo. Aplica en todas partes: mascota flotante, pausa activa, La Colonia y la celebración de New Business. Navidad también activa la nieve y el 🎄 junto al logo; cada persona puede apagar la nieve para sí («Nieve en pantalla»).
> - Sus alertas usan **solo las tareas de la persona**; nunca habla de tareas ajenas. Se oculta dentro de La Colonia y puede apagarse; al reactivarla sale saludando. Apagado y sonido son preferencias personales.
> - Los cumpleaños y aniversarios se calculan con la fecha real del día.
> - **Ventana de la mascota (UI):** fondo oscuro con texto e íconos claros. Se retiró el acceso «Ficha humana» de la mascota: ese espacio ya vive en la foto de perfil del menú superior (07 Nov 2026).
> - **Pausa activa (07 Nov 2026):** ya no es un modal que oscurece la pantalla. Es una tarjeta que sale de la mascota, en la posición de su ventana: 5 ejercicios de ~3 min, uno a la vez, con anillo de tiempo, progreso por ejercicio, pausar / siguiente / anterior y Esc para cerrar. No bloquea el trabajo. Al terminar, ECO celebra brevemente y vuelve a su estado normal.
> - **Modo del menú lateral:** sol (claro) o luna (oscuro, predeterminado), en el pie del menú. Solo cambia el menú; el área de trabajo sigue en blanco como en producción.
> - El laboratorio de la mascota (`Shift+Alt+B` / `?buckyLab=true`) es solo de desarrollo y no va a producción.

> **La Colonia en el prototipo (revisado 07 Nov 2026) — versión sencilla vigente:**
> - **Dos juegos de 15 s:** «Torre de Troncos» (soltar cada tronco alineado y apilar) y «Salto de Nenúfares» (tocar el nenúfar donde aparece ECO). Mismos nombres en tarjetas, partida, retos y ranking.
> - **Retar a alguien:** al terminar una partida se elige a un compañero activo de Equipo & Accesos. El reto queda «esperando» para quien retó y aparece como «te retó con N pts · Aceptar reto» para el retado. Al jugarlo se resuelve: gana el mayor puntaje; igual puntaje es empate.
> - **Quién ganó, para los dos:** la pantalla de juegos muestra el último resultado («Ganaste 104 a 90 contra Paola» / «Oscar te ganó 104 a 90») con «Revancha», y el botón «Retos» abre la bandeja: por responder, esperando y resultados.
> - **Ranking semanal sencillo:** una pestaña por juego con el mejor puntaje de cada persona en la semana; se reinicia el lunes; marca «Tú». Sin datos sembrados: si nadie ha jugado, lo dice.
> - Fechas reales en los retos («hace 5 min», «ayer»). El mensaje para compartir es para Google Chat.
> - **Pantalla de juegos «Universo de juegos» (07 Nov 2026):** hecha solo con CSS, sin ilustraciones: cielo con estrellas (noche, atardecer o día), un planeta por juego con su botón «Jugar», «Tu mejor · #puesto» y el récord de la semana, un planeta bloqueado «Próximamente», ECO como anfitrión con una frase según la situación (reto recibido → «Aceptar reto»; último resultado → «Revancha»; nadie ha jugado → «Estrena el ranking») y ranking con podio. Todos los datos son reales; la lógica de los juegos no cambia. Las animaciones se apagan si el sistema pide reducir movimiento.
> - La vista tipo mapa ilustrado (Diorama) descrita abajo queda como referencia histórica; no es la vista vigente.

#### 18.1 Propósito y Definición Funcional Cerrada
- **Bucky:** Asistente contextual de ECO que acompaña la jornada laboral, alerta sobre timers olvidados, tareas bloqueadas y deadlines. En la vista global de ECO actúa como widget flotante; al ingresar a La Colonia, el widget flotante global desaparece para dar paso al Bucky protagonista dentro de su hábitat.
- **La Colonia:** *"La Colonia es el espacio social y lúdico de ECO para desconectarse unos minutos y compartir pequeños retos con el equipo."*
- **Alcance Funcional Simplificado & Presentación Inmersiva (Videojuego):**
  1. **Pantalla Principal Inmersiva (Hábitat Completo):** En lugar de un dashboard corporativo con tarjetas fragmentadas, el Diorama Ribereño es el escenario interactivo completo. Las estructuras funcionan como portales visuales de navegación directa:
     - 🏡 **Taller de Cedro (Izquierda):** Portal directo a La Torre de Cedro (15s).
     - 🌸 **Jardín de Nenúfares (Derecha):** Portal directo a Reflejos de Nenúfar (15s).
     - 🔭 **Observatorio Orbital (Arriba):** Portal directo al Ranking semanal (#2 esta semana).
  2. **Bucky como Host Activo & Narrador Emocional:** Bucky guía emocionalmente convirtiendo los datos fríos en narrativa viva:
     - Si hay un reto recibido: *"Un compañero te dejó 85 puntos en Torre de Cedro 👀"* -> Botón primario: `[ SUPERAR RETO · 15s ]`.
     - Si no hay retos: *"El récord semanal está en 120. ¿Probamos una?"* -> Botón primario: `[ JUGAR TORRE DE CEDRO · 15s ]`.
     - Si acaba de jugar: *"106 👀 Te faltaron 14 para alcanzar el récord."* -> `[ RETAR A ALGUIEN ]` / `[ OTRA RONDA ]`.
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
- **5. Conexión con Sistema de Notificaciones de ECO:**
  Los avisos de reto ("Te han retado en La Torre de Cedro / Reflejos de Nenúfar", "Han superado tu marca", "Reto completado") deberán conectarse al **sistema central de notificaciones de ECO** (in-app / campana) como requisito funcional una vez el backend esté disponible. Las notificaciones push quedan como capacidad evolutiva futura, no como dependencia actual.
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

### Módulo 19: Costos de operación — Hardware y Licencias (🟣 Implementado en prototipo · 07 Nov 2026; existente en producción)
Reconciliado con los módulos que ya existen en producción. Acceso: **ver** `executive`, `administrative`, `system_admin`; **crear/editar** `administrative`, `system_admin`.

**Hardware (activo físico):** nombre*, tipo (texto con sugerencias), marca, modelo, **serial / placa de inventario**, **estado** (en uso · en reparación · de baja), **colaborador asignado** (o «compartido»), ubicación, valor de compra (COP)*, fecha de compra, vida útil (meses), garantía hasta, «es costo directo», servicios y proyectos que lo usan, notas.
- Depreciación mensual = valor ÷ vida útil; por hora = mensual ÷ 182 h (42 h × 52 ÷ 12). Si es costo directo, la depreciación por hora se reparte en partes iguales entre los servicios seleccionados. El formulario muestra el cálculo en vivo.
- La tabla marca garantías vencidas.

**Licencias (suscripción):** aplicación*, plan, área*, **responsable de la cuenta**, cantidad (cupos)*, frecuencia* (mensual · trimestral · anual), **próxima renovación**, moneda*, valor unitario*, **personas con cupo** (≤ cantidad), proyectos activos que la usan, pendiente de verificar + nota, estado activa/inactiva.
- Total = cantidad × valor unitario; costo mensual = total ÷ meses de la frecuencia; reparto igual entre proyectos (vacío = costo general). Moneda extranjera → COP con la **TRM vigente de Finanzas**.
- La tabla resalta renovaciones en los próximos 15 días.

**UX:** las listas de servicios, proyectos y personas usan búsqueda con casillas y chips (sin Ctrl/Cmd+clic).
- Referencias: `src/components/taskflow/assets/HardwareView.tsx`, `LicensesView.tsx`, `ChipMultiSelect.tsx`.
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
│             │                   │                      │ importa a ECO │ manual      │
├─────────────┼───────────────────┼──────────────────────┼─────────────────┼─────────────┤
│ Google      │ Manual en UI      │ `driveFolderUrl`     │ Creación de     │ Desorden de │
│ Drive       │ (pegar link)      │ `briefUrl`           │ Prospecto crea  │ carpetas si │
│             │                   │                      │ las 4 carpetas  │ no hay bot  │
├─────────────┼───────────────────┼──────────────────────┼─────────────────┼─────────────┤
│ Alegra      │ Manual Adm.       │ `alegraContactId`    │ Paso a "Activo" │ Crear NIT   │
│ (ERP DIAN)  │ (checkboxes/ID)   │ `billingEmail`       │ o primer hito   │ duplicado   │
│             │                   │ `rutStatus`          │ crea tercero    │ en Alegra   │
└─────────────┴───────────────────┴──────────────────────┴─────────────────┴─────────────┘
```

---

## 7. Matriz Global de Portabilidad por Módulo

> **Aclaración de Estado de Implementación:** Este repositorio frontend/contrato de TypeScript deja preparada la especificación canónica, tipos, vistas y validaciones de interfaz para que **Indunova implemente el backend real** (persistencia en PostgreSQL, endpoints en Django REST Framework, transacciones ACID y cálculo/persistencia definitiva del SLA e integraciones). **El backend Django/PostgreSQL no está implementado en este repositorio.**

| Módulo ECO | Estado Frontend / Contrato | UI | Lógica Dominio Frontend | Persistencia Requerida en Backend | Backend a implementar por Indunova | Dependencias Directas | Bloquea Portabilidad? |
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
| **Alegra / Fiscal** | Manual Adm. | Completa | Manual | IDs en DB | Integración Alegra API | Clientes | NO (Evolutivo) |
| **Bucky / La Colonia** | Prototipo | Completa | Frontend | State opcional | Modelos GameResult / Challenge (Asíncronos) | Ninguna | NO (Evolutivo) |

---

## 8. Auditoría de Inconsistencias entre Prototipo UI y Especificación

### 8.0 Reconciliación con producción y guía de entrega (07 Nov 2026) — LEER PRIMERO

**Cómo tomar esta entrega.** La rama `entrega-final-indunova` contiene **todo `main`** (incluidos los commits de referencia `97bf2e30` de #132/#133 y `f77f43ac`/`7b18456c` de #143) **más 38 commits nuevos**. Se toma **completa** (no por partes): la regla funcional es este documento y `BACKEND_REQUIREMENTS.md`; el código del prototipo es la referencia visual y de cálculo. Lo que ya está en producción se conserva; solo se implementa lo marcado como «Nuevo en esta entrega».

**1. Tickets que ya están en producción (orbit-00092-jns): el prototipo quedó alineado, no se rehacen.**

| Ticket | Lo que ya hizo Indunova | Estado del prototipo y de la documentación |
|---|---|---|
| **#147** Mi Día personal | Mi Día es personal también para perfiles globales. «¿Qué requiere mi atención?» para `system_admin`, `administrative`, `commercial` y `client_relationship`: solo lo que ejecutan o lideran (sus bloqueos y ajustes, revisiones de tareas que lideran, pendientes de cliente de sus proyectos, oportunidades que lideran o les tocan). `leader` conserva las alertas de su equipo; `executive` la vista de excepciones de la organización; desvíos de horas a Comercial y Relación con clientes (§15.4). Consulta global en Tareas → Equipo. | ✅ Alineado, **con un cambio nuevo:** por decisión de Uhura (07 Nov 2026) **`executive` también queda personal** en Mi Día: ya no ve las excepciones de toda la organización en «¿Qué requiere mi atención?»; la vista global está en Tareas → Equipo y Capacidad → Organización. **Indunova debe ajustar esto en producción.** Además, el prototipo trataba a `system_admin` como vista global y mostraba a Comercial todas las oportunidades; se corrigió. Formalizaciones fiscales: solo `administrative`. |
| **#146** Reasignación y urgentes | Aviso al nuevo colaborador («Luisa te asignó…»), abre la tarea; las tareas propias abiertas **urgentes, que inician hoy o vencen hoy van de primeras** en la atención; al retirar al responsable, pasa al siguiente colaborador; sin avisos repetidos al volver a guardar. «Mis tareas» mantiene las vencidas primero. | ✅ Alineado. Se agregó al prototipo el bloque de urgentes/inicio hoy/entrega hoy al inicio de la atención. Regla en `BACKEND_REQUIREMENTS.md` §15.1–§15.2. |
| **#145** Comercial en tareas | Comercial crea tareas en proyectos, comenta con @menciones y adjuntos, ajusta horas, cronograma y estado, con historial; avisa al líder y colaboradores. **No reasigna personas.** | ✅ Alineado. La matriz RBAC del prototipo tenía a Comercial solo con lectura en Tareas; se corrigió (§10.5). |
| **#144** Rol en el perfil | El encabezado y todas las vistas leen el rol profesional del perfil. | ✅ Ya coincidía. Se quitó un rol de respaldo inventado («Growth Manager»). |
| **#143** Capacidad | Planificado desde el cronograma, Libre = neto − máx(planificado, registrado), estados 75/85/100 %, dos barras, KPIs y Organización por área. | ✅ Coincide (el prototipo fue la referencia). Ver nota sobre 80 % vs 85 % abajo. |
| **#132** Cotización por servicio | Un proyecto por servicio aprobado, modalidad y valor por servicio, aprobación por servicio, nombre editable, mismo cliente. | ✅ Coincide (referencia `97bf2e30`). |
| **#133** HubSpot | Conexión construida en pruebas: traer empresa/contacto/nota, crear un negocio por servicio sin duplicar, etapas sincronizadas, aprobación manual con trazabilidad si HubSpot falla, «Cierre perdido» nunca genera proyecto, reintentos y aviso a la hora. Espera token nuevo. | ✅ Coincide. Lo que solo existe en producción (reintentos, «Sin vincular a HubSpot», «Pendiente de enviar», aviso de una hora) **prevalece**; el prototipo no lo contradice. |

**2. Nuevo en esta entrega (no existe en producción): implementar.**
- **Proyectos y cronograma:** línea base desde el alcance, rondas de ajuste editables, equipo derivado de las tareas, cierre de proyecto, fee mensual con ciclos y renovación, política de horas no usadas al iniciar (Módulo 11).
- **Mi Día:** personal también para `executive` (cambia lo que producción dejó en #147), regla del cronograma de hoy y «Próximas» (§17.5), racha de días cargados, «Cerrar mi día», tarjeta «En racha» (§9.4.1).
- **Horas:** modal «Registrar tiempo» igual a «Cargar horas»; la X y Esc no descartan (§Módulo 16).
- **Meta única de 80 %** para el recordatorio diario, la racha, «Cerrar mi día» y el correo semanal (`BACKEND_REQUIREMENTS.md` §26.2). Si el recordatorio de producción usa otro porcentaje, solo se cambia ese valor.
- **Clientes:** ficha y lista calculadas con datos reales, sin valores fijos (§9.4); SOW con datos del acuerdo editables y cláusula de IA nueva (Módulo 7.4).
- **Google Chat por proyecto:** dos opciones, «Activar» o «No enviar» (predeterminado); webhook único por cliente, registrable por `system_admin` también desde el proyecto (§11.8). Reemplaza el modelo de tres modos del commit `3278aca`.
- **Notificaciones por correo y recordatorio semanal** (`BACKEND_REQUIREMENTS.md` §26).
- **Mascota ECO y La Colonia:** emociones temporales, moods navideños, temporada automática noviembre–diciembre, retos y ranking (Módulo 18). Hardware y Licencias (Módulo 19). Acceso a ECO en el perfil (§10.8). Google Calendar admin (§11.5.1).
- **Móvil y PWA:** «Más» con permisos, sin hamburguesa; ECO instalable (§9.5).

**3. Puntos que podrían confundirse (no son contradicciones).**
- **80 % vs 85 %:** el 85 % de #143 es la **meta productiva de carga** en Capacidad (cuánto planear). El 80 % es el **mínimo de horas registradas** para recordatorios y racha. Son métricas distintas y conviven.
- **Mi Día por cronograma (§17.5):** es una decisión posterior a #147. «Qué tengo que hacer hoy» muestra solo lo programado para hoy y lo vencido; si no hay nada, «Próximas». No cambia la regla de #147 (solo lo propio) ni el orden de #146 (vencidas primero en «Mis tareas»).
- **SOW con varios servicios:** hoy el SOW se arma con la oportunidad completa y cada proyecto que viene de ella abre ese mismo SOW. *Pendiente de decisión de Uhura:* un SOW por oportunidad (solo con los servicios aprobados) o uno por servicio.

**4. Lo que solo es del prototipo (no va a producción):** Simulador QA, laboratorio de la mascota (`?buckyLab=true`), `?ecoMoods=fast`, datos de demostración y la comparación de personas por nombre.


Durante la auditoría end-to-end de UAT se detectaron y reconciliaron las siguientes inconsistencias funcionales:

1. **`initialStatus` ignorado en conversión:**
   El modal de conversión permite seleccionar si el proyecto arranca en `Pendiente de Formalización` o `Activo`. En el controlador del prototipo estaba forzándose siempre a `'Activo'`. **Regla:** Debe respetarse el valor seleccionado por el líder.
2. **`startConditionsConfig` no persistido en proyecto:**
   Las condiciones de formalización (si el anticipo aplica o si fue recibido) se enviaban en el evento pero no se almacenaban en la entidad del proyecto creado.
3. **Datos fiscales no propagados:**
   El checklist administrativo (RUT recibido, correo facturación) se guardaba en la oportunidad pero no se inyectaba a la entidad `ClientTaxEntity` del cliente recién creado.
4. **Desconexión con SOW Histórico:**
   Si el líder editaba los textos del SOW en New Business, estos se guardaban en la oportunidad, pero el proyecto recién creado no quedaba con un puntero directo a ese SOW aprobado.
5. **Staffing Automático Vacío y Tareas no en Blanco:**
   Las tareas se crean correctamente a partir de las actividades cotizadas con su presupuesto de horas y su rol cotizado correspondiente (`budgetedRole`, `budgetedRoleId`). Nacen con `assigneeAllocations = []` (sin persona física asignada) pero listas para la ejecución operativa; el equipo no empieza desde cero.
6. **Desacoplamiento de Cálculos Salariales:**
   Los cálculos salariales, prestaciones y márgenes de pricing están desacoplados de ECO y gobernados por Finanzas externamente; ECO no mantiene tarifas hardcodeadas ni calcula márgenes.
7. **Regla de Cronómetro / Timer en Pausa:**
   El tiempo transcurrido con el cronómetro en estado `PAUSED` **bajo ninguna circunstancia cuenta como tiempo efectivo de trabajo**. Únicamente los lapsos en estado activo `RUNNING` suman a la duración total del `TimeLog` al momento de hacer `Stop`.
8. **Disparador Canónico de New Business (Brief + Scoping):**
   New Business no se inicia cuando un deal se marca como "ganado" en el CRM ni sustituye la prospección comercial en frío. Se dispara exclusivamente cuando **se recibe un brief comercial calificado desde HubSpot que exige dimensionamiento técnico de entregables (scoping) y costeo operativo**.
9. **Desacoplamiento Financiero y Fuente de Verdad Económica:**
   La fuente de verdad financiera de Uhura Group es el **Google Sheet oficial de Finanzas**. ECO desacopló y retiró su motor financiero interno (`financialEngine.ts`, constantes salariales y calculadora de márgenes). ECO estructura el alcance técnico y las horas por rol, y registra con fidelidad el resultado comercial acordado externamente.
10. **Eliminación de Cotizaciones Huérfanas y Única Fuente de Verdad:**
    En el prototipo existía un contenedor huérfano (`createdQuotes`) y una vista independiente (`cotizador`) desconectada de las oportunidades. **Corrección de dominio:** Se eliminó la vista y el estado paralelo. Toda cotización (`QuoteProposal`) debe existir y persistirse exclusivamente dentro de una `NewBusinessOpportunity`. En el flujo "Usar en New Business" del catálogo de plantillas, la oportunidad debe existir previamente antes de fijar y persistir el snapshot de cotización.
11. **Detalle de Tarea y Ciclo Operativo (`TaskDetailModal`):**
    En UAT se detectó que el detalle de tarea difería entre staging y el prototipo. **Reconciliación oficial:** La experiencia aprobada incluye: franja superior con próximo paso operativo (`Iniciar tarea` ➔ `Solicitar revisión ->` ➔ `Aprobar y Completar / Devolver`), prioridad (`Urgente` a `Baja`), barra de consumo de horas (estimadas, ejecutadas, disponibles), cronograma (inicio y entrega), responsables (Project Lead, asignado, colaboradores y rol cotizado) y registro formal auditado de retrabajos (número de ronda, causa raíz, horas y solicitante).
12. **Reducción de Ruido en Resumen de Proyecto y Entregables Plegados:**
    En la vista de Proyectos, Resumen se depuró eliminando la duplicación de KPIs que ya están en el encabezado y el bloque redundante de retrabajos. La sección de dependencias de cliente se reubicó en la parte superior de la pestaña Tareas, y los entregables inician plegados (chips cerrados) para evitar sobrecarga visual.
13. **Consolidación de Matriz de Horas y Servicios:**
    Se consolidó la información presupuestal dentro de la pestaña `Matriz Horas`, ofreciendo visibilidad integrada tanto por Rol como por Servicio/Entregable, eliminando pestañas duplicadas en el proyecto.

---

### 8.1 Estándar visual de la interfaz (pulido 07 Nov 2026)
- **Navegación en móvil y tablet (07 Nov 2026):** barra inferior (Mi Día, Tareas, Cargar, Horas, Más) y **sin menú hamburguesa** en el encabezado, para que la búsqueda tenga más espacio. «Más» es la puerta a los demás módulos: muestra solo el título y el ícono (sin subtítulos), agrupados en Operación, Comercial, Experiencia, Costos de operación y Sistema, y **respeta los mismos permisos del menú lateral** (cada persona ve solo lo que puede abrir). Incluye Licencias y Hardware, que antes solo estaban en el menú lateral.
Reglas de presentación que el frontend de producción debe mantener (no cambian lógica):
1. **Encabezado de pantalla único** (`PageHeader`): título igual al nombre del menú, una línea de contexto y acciones a la derecha. La barra superior muestra solo la ruta («Operación › Proyectos»).
2. **Botones en mayúscula inicial** («Nuevo proyecto», «Nueva oportunidad», «Guardar insumo»). Los nombres propios conservan su forma (ECO, HubSpot).
3. **Estados del proyecto con un solo vocabulario:** Por iniciar · Programado · En ejecución · Cerrado · Archivado. No se repite el estado en dos chips.
4. **Fechas:** formato «15 ago 2026» (día civil, sin corrimientos de zona horaria). **Nunca se inventan fechas:** si no existe, se muestra «Sin fecha» (o «Por definir» / «No fijada» según el contexto). Ninguna pantalla rellena con fechas de ejemplo ni con «Hoy».
5. **Solo datos reales:** indicadores y gráficos se calculan desde tareas, registros y calendarios; si no hay datos, se muestra un estado vacío claro (p. ej. Capacidad: «Aún no tienes horas planificadas»). No hay series de ejemplo fijas. «Salud» solo se muestra cuando existe el cálculo.
6. **Menú lateral:** íconos de línea (sin emojis) y sin etiquetas decorativas; un contador solo cuando hay algo pendiente.
7. **Alertas:** tarjetas neutras con franja de color a la izquierda según severidad (rojo vencido/bloqueante, naranja desvío, ámbar atención), en lugar de fondos de color completos.
8. **Cifras** con la tipografía de la interfaz y dígitos tabulares (alineados), no con fuente monoespaciada.
9. **Esquinas:** `lg` etiquetas y controles pequeños · `xl` botones y campos · `2xl` tarjetas y paneles · `full` píldoras.
10. **Estados vacíos con acción** («Quitar filtros», «Nueva tarea») y textos neutros en género.
11. El marco del prototipo (barra del sistema de diseño, barra de navegador simulada y Simulador QA) **no** forma parte de ECO en producción.

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
5. **Evolución a Progressive Web App (PWA):** ECO deberá poder evolucionar a una Progressive Web App (PWA) instalable en dispositivos móviles, sin requerir inicialmente distribución vía App Store/Play Store. No hace parte del alcance actual ni bloquea el backend. La arquitectura de API y autenticación/sesiones no debería introducir dependencias que dificulten esta evolución posteriormente.

### 9.3 Delimitación de Responsabilidades: Comportamiento Funcional vs. Decisiones Técnicas de Indunova

Para asegurar una frontera limpia de trabajo entre Producto (Uhura) y la Fábrica de Software (Indunova), se establece la siguiente separación explícita:

#### A. Comportamiento Funcional Esperado (Definido por Producto - No Negociable):
1. **Reflejo Oportuno de Ausencias en Capacidad:**
   Las ausencias y vacaciones programadas y aprobadas en Google Calendar deben reflejarse oportunamente en la disponibilidad del módulo de Capacidad, impidiendo la sobreasignación de colaboradores en periodos no hábiles.
2. **Integridad de Fechas Calendario:**
   Fechas como `fecha_ingreso`, `birthDate` y los rangos de vacaciones (`startDate`, `endDate`) deben mantenerse íntegras en el día calendario civil correspondiente, sin desplazamientos o corrimientos de fecha provocados por conversiones de huso horario entre cliente y servidor.
3. **Fidelidad del Registro Comercial y Horas Cotizadas:**
   ECO debe preservar íntegramente el rollup de horas técnicas por rol presupuestadas, el monto cotizado, la moneda (`COP` o `USD`) y los enlaces a los documentos oficiales de soporte (Google Sheet de Finanzas y propuesta formal presentada).
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
   El backend no implementa cálculos de salarios ni márgenes en la API. El backend de ECO únicamente persiste y expone los campos comerciales de `QuoteProposal` (horas rollup, valor cotizado, moneda, estado y URLs de soporte).
2. **Acceso a Google Calendar:**
   Cuando Indunova defina el mecanismo técnico de integración, deberá indicar a Uhura qué calendario, permisos y credenciales necesita para staging/producción. Uhura facilitará el acceso correspondiente al calendario corporativo gestionado por Administrativa.

---

### 9.4 Arranque en producción: qué se hereda y cómo se crean los proyectos vigentes
- **Empezamos limpios.** Producción solo hereda **usuarios y clientes**. No se heredan proyectos ni tareas de COR (la herramienta actual, con proyectos y tareas viejas sin cerrar) ni de la plataforma que hoy opera Indunova, y nada anterior a noviembre de 2026. Así nadie arranca con pendientes viejos en Mi Día.
- **Proyectos vigentes, a mano.** Se crean desde ECO con el flujo normal: proyecto nuevo (o conversión si la oportunidad existe) → «Iniciar proyecto» con la **fecha real de inicio**, aunque sea pasada.
  - **Rediseño web Neroli:** primer proyecto en producción; se crea a mano porque su cierre comercial ya ocurrió.
  - **Fee de Cristar** (inicia en noviembre y se crea en ECO en diciembre): se inicia con fecha 1 de noviembre; noviembre queda como «Mes 1 · fuera de ECO» sin tareas y se generan solo las tareas de diciembre (Mes 2). Si el contrato tuviera la excepción de acumular horas, el saldo se registra como ajuste manual con nota.
- **Recomendación:** crear a mano los proyectos vigentes al iniciar cada mes mientras sean pocos (es la oportunidad de depurar alcance, líder y horas). Solo si al arranque hubiera más de los que se pueden crear en un día, usar la carga única por plantilla descrita en `BACKEND_REQUIREMENTS.md` §19.3: crea proyectos, nunca tareas ni horas, y pasa por una prueba antes de aplicarse.
- COR queda como archivo de consulta. Lo que finanzas necesite conservar se exporta antes de apagarlo; no se importa a ECO.
- **Dominio final: `app.uhuragroup.com`.** Indunova entrega a Uhura los registros DNS necesarios (CNAME del subdominio y TXT de verificación, más los que requiera el certificado TLS); Uhura los configura en su DNS. ECO solo se publica en ese dominio con HTTPS.
- **URL anterior de producción:** se retira cuando `app.uhuragroup.com` quede activo (se recomienda redirigirla al dominio nuevo durante la transición y luego darla de baja).

### 9.4.1 Hábito de carga: racha y «Cerrar mi día» con ECO (07 Nov 2026)
Objetivo: que cargar horas sea un hábito que guste. Se quita fricción y se premia la **constancia**, nunca la cantidad de horas (no hay ranking de horas).
- **Racha de días cargados** (Mi Día → «¿Cómo voy?»): «🔥 5 días seguidos». Un día hábil cuenta cuando la persona registró **al menos el 80 % de su jornada** (meta unificada de Uhura, igual que el recordatorio diario y el correo semanal). Fines de semana, festivos de Colombia y días con ausencia registrada **no cuentan ni rompen** la racha. Hoy suma apenas se alcanza la meta y, si aún no, no la rompe (el día no ha terminado). Sin racha: «Empieza tu racha hoy». Se calcula con los registros de tiempo reales.
- **«Cerrar mi día»** (botón en Mi Día y aviso de ECO): ventana con la misma estructura que «Cargar horas». Muestra:
  - ECO con una frase según el avance: día completo (celebra), vas bien, o a medio cargar (cuánto falta para que cuente).
  - La barra del día y el estado de la racha.
  - Lo registrado hoy, agrupado por tarea.
  - «¿Trabajaste en alguna de estas?»: tareas propias programadas para hoy sin tiempo; «Cargar» abre el registro manual con esa tarea (**nunca se inventan horas**).
  - «Agregar tiempo» y «Confirmar y cerrar el día». Al confirmar, ECO celebra («¡Día cerrado! 🔥 5 días seguidos…») y el botón queda «Día cerrado».
  - En fin de semana, festivo o ausencia lo dice así: hoy no cuenta y no rompe la racha.
- **Aviso de ECO a las 5:00 p. m.:** en día hábil, sin ausencia y si la persona no ha cerrado su día, ECO pregunta «¿Cerramos el día? 🌙» con «Cerrar mi día →» y «Más tarde». Una vez por día y solo con ECO en reposo (no interrumpe avisos, ventanas ni el cronómetro).
- Cerrar el día es un ritual de confirmación: **no bloquea** ni cambia las horas; se pueden seguir corrigiendo según las reglas de la semana.
- **Mi Día sin exceso de botones:** «¿Cómo voy?» solo tiene «Cerrar mi día» y «Cargar horas». La racha personal va como una línea dentro de la barra del día («🔥 Tu racha: 5 días seguidos» / «Empieza tu racha hoy…»).
- **Lo que ve todo el equipo:** sin ranking de horas ni comparación de posiciones. **Se activa solo, por comportamiento** (no hay que encender nada).
  - **Mi Día → tarjeta «En racha»** (columna derecha, debajo del Radar del equipo): **aparece sola** cuando alguien cumple la racha o el equipo tiene racha; si no, no se muestra. Lista a las personas en racha («Laura · 10 días seguidos 🔥») con **👏 aplaudir** (uno por persona; quien recibe ve cuántos) y, si aplica, «🔥 El equipo lleva 7 días con todos los días cargados».
  - **La Colonia** (arriba de las fichas): vista completa, siempre visible: racha del equipo con «Hoy: faltan 2 personas» **sin nombres** y «Esta semana: 92 % de los días cargados», más la lista «En racha» con la fecha en que cada quien llegó a su hito.
  - Una persona aparece «En racha» desde **5 días seguidos** (hitos 5, 10, 20, 50, 100). Solo se celebra a quien llega; nunca se muestra a quien no.
  - Un día cuenta para el equipo cuando **cada persona esperada** (activa, con capacidad configurada y sin ausencia ese día) registró al menos el 80 % de su jornada.
- **El Muro** era una pantalla de relleno (ya retirada del menú lateral) y se quitó también de «Más» en móvil. Los logros de racha viven en La Colonia.

### 9.5 ECO como app instalable (PWA) (07 Nov 2026)
- **Qué es:** ECO se puede instalar desde el navegador como una app: en el computador (Chrome o Edge: ícono «Instalar» en la barra de direcciones), en Android («Instalar app») y en iPhone (Safari → Compartir → «Agregar a pantalla de inicio»). Queda con el ícono de ECO y abre en su propia ventana, sin barra del navegador.
- **Al abrirla instalada** va directo a ECO (Mi Día), a pantalla completa, sin el menú del design system ni la barra de navegador simulada del prototipo. En iPhone respeta la muesca y la barra de gestos. Para ver ese modo sin instalar: `?app=eco` al final de la dirección.
- **Actualizaciones:** cuando hay versión nueva aparece «Hay una versión nueva de ECO · Actualizar»; nunca recarga sin preguntar.
- **Fase 1 (lista):** instalable, abre rápido y se actualiza con aviso. **No incluye** notificaciones push ni registro de horas sin conexión: ambas necesitan backend y quedan como fase 2 (`BACKEND_REQUIREMENTS.md` §23).
- Requisito de Indunova: HTTPS en `app.uhuragroup.com` y no dejar en caché `index.html` ni el service worker (detalle en §23).

## 10. Roles, Niveles de Acceso y Matriz de Permisos (RBAC)

### 10.1. Principio Arquitectónico Fundamental de Seguridad
> **"Ocultar botones en React NO constituye seguridad."**
> Toda regla de visibilidad, creación, edición, aprobación o administración aquí definida es de cumplimiento obligatorio y vinculante para el backend de Indunova (Django REST Framework / PostgreSQL).
> La interfaz web de ECO adapta dinámicamente sus menús, controles y vistas según el usuario activo, pero **cada endpoint de la API REST (`/api/...`) debe validar de manera estricta la identidad del usuario (`request.user`), su rol profesional, su nivel de acceso (`OrbitAccessLevel`) y el alcance territorial/operativo autorizado (`AccessScope`)** mediante `PermissionClasses` o decoradores a nivel de vista y filtrado estricto de QuerySets en el ORM.

### 10.2. Taxonomía de Identidad: Roles Canónicos vs. Perfiles de Sistema

ECO separa tajantemente entre **rol profesional/cotizable** (el oficio operativo de la persona que factura o ejecuta horas en proyectos de clientes) y **perfil interno de sistema** (funciones de dirección o soporte que no se cotizan en proyectos de clientes).

#### 1. Roles Profesionales Canónicos (`StandardUhuraRole`):
Existen exactamente 13 roles oficiales en el catálogo de servicios de Uhura:
1. `Client Relationship Strategist`
2. `Front-End Dev`
3. `Community Manager`
4. `Digital Designer`
5. `Digital Content Specialist`
6. `Product Lead`
7. `Trafficker Media`
8. `DigiOps Specialist`
9. `Creative Strategy Lead`
10. `Creative Designer`
11. `Content Creator`
12. `Directora Comercial`
13. `Growth Manager`

Un colaborador puede tener **uno o más roles profesionales/cotizables**. Esta relación no crea usuarios adicionales ni modifica su `accessLevel`: la identidad del colaborador sigue siendo única y el RBAC se administra por separado.

#### 2. Perfiles Internos de Sistema (`InternalSystemRole`):
Roles operativos no cotizables para tareas operativas estándar:
1. `CEO` (Dirección General y Visión Estratégica)
2. `Administrativa` (Datos fiscales, RUT, facturación en Alegra y cartera)
3. `Admin de Sistema` (TI y gobernanza de plataforma)

### 10.2.1. Responsabilidades Operativas Clave por Rol en los Journeys Aprobados
- **Comercial (Access Level `commercial` / `client_relationship`):**
  - Creación de oportunidades en New Business a partir de briefs.
  - Asignación formal del Líder de Alcance.
  - Recepción del handoff de alcance listo (`internal_review`) en Mi Día.
  - Realización del cálculo financiero externo en el Google Sheet oficial.
  - Registro del resultado comercial en ECO (monto cotizado, moneda, versión y URLs).
  - Marcación de oportunidad como Ganada (`won`) tras aprobación del cliente.
  - Ejecución de la conversión a proyecto operativo.
- **Líder de Alcance / Project Lead (Product Lead / Creative Strategy Lead / Líderes de Área):**
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
- **Dirección Ejecutiva (Access Level `executive`):**
  - Supervisión transversal del portafolio y salud de proyectos.
  - Monitoreo de capacidad global del equipo semana a semana.
  - Aprobación de excepciones de cronograma (reforecasts oficiales) y condiciones especiales.

### 10.2.2. Pendientes de Decisión de Producto
1. **[Pendiente de decisión de Producto] Tipologías de Tarea Exentas de Revisión:**
   Se requiere formalizar si ciertas tipologías de tareas operativas menores o no cotizables (ej. rituales internos de equipo, standups de 15 minutos, soporte ad-hoc) pueden auto-completarse directamente por el colaborador sin transicionar obligatoriamente por el estado `Review` del Líder.
2. **[Pendiente de decisión de Producto] Parametrización Multi-NIT por Proyecto:**
   Definir con la Dirección General y Administración si la facturación de un proyecto distribuido entre más de una entidad fiscal (`ClientTaxEntity`) se parametriza una sola vez a nivel global del proyecto o si puede variar por hito/factura emitida, y si se calcula mediante porcentajes, montos fijos o ambas modalidades.

---

### 10.2.3. Hallazgos del recorrido E2E (07 Nov 2026)
Recorrido Comercial → PM → Colaborador sobre el prototipo.

**Resueltos en el prototipo:** cronograma al «Iniciar proyecto» (Módulo 8 §8.3), rondas de ajuste (Módulo 11 §11.3), equipo derivado de tareas (Módulo 14 §14.3), cierre de proyecto (Módulo 11 §11.7), «Fecha límite del alcance» en Nueva Oportunidad (antes «Fecha máx. de entrega»), checklist visible de requisitos para «Marcar como listo», semanas del servicio precargadas desde `estimatedDurationWeeks` de la plantilla, etapa de HubSpot visible solo con negocio vinculado (si no: «Ganada manualmente · conciliar con HubSpot»), estados «Por iniciar» coherentes en la Matriz y eliminación de componentes sin uso (`ProjectSettingsTab`, `ScheduleProjectModal`, `ProjectDeliverablesTab`, `assignmentAdapter`).

**Pendiente:**
1. **Datos mock:** proyectos de ejemplo con roles fuera de `STANDARD_UHURA_ROLES` («Tech Lead», «QA Tester», «Front End») y ausencias con fechas vencidas en el radar de Mi Día. Solo afecta al prototipo.


### 10.2.4. Acceso a Dirección y Finanzas (07 Nov 2026)
El módulo **Dirección y Finanzas** del prototipo (en producción: **Tablero** y **Finanzas**) es visible solo para `commercial`, `client_relationship`, `executive` y `system_admin` (módulo RBAC `direccion-finanzas`). Antes heredaba el permiso de New Business y los líderes lo veían.

---

### 10.3. Niveles de Acceso Canónicos (`CanonicalOrbitAccessLevel`)
La experiencia de usuario y la autorización relacional se rigen por **7 niveles de acceso funcionales canónicos**:

1. **`collaborator`:**
   - Especialistas técnicos y creativos (Front-End, Diseñadores, Community Managers, etc.).
   - Foco en ejecución personal, avance de tareas, registro de horas, comentarios y reporte de bloqueos.
   - Sin acceso al Catálogo de Servicios, New Business, Clientes ni Administración.

2. **`leader`:**
   - Líderes de área y proyectos (Product Lead, Creative Strategy Lead, Growth Manager).
   - Foco en scoping técnico, estructuración de alcances y gestión integral de plantillas en el Catálogo de Servicios (crear, editar, duplicar y archivar).
   - Asignaciones, revisiones de calidad (QA) y seguimiento de equipo.
   - *Pendiente de definición funcional:* **alcance de visibilidad de capacidad para planificación entre equipos**.

3. **`client_relationship` & `commercial` (Frente Comercial Unificado):**
   - Dirección Comercial y Estrategas de Cuentas (roles comercial y relación con cliente).
   - Para este ticket, están autorizadas únicamente para:
     - Acceder a todos los Clientes y New Business.
     - Crear y editar Clientes.
     - Crear, editar y archivar oportunidades.
     - Convertir oportunidades en Cliente y Proyecto.
     - Eliminar únicamente borradores sin trazabilidad posterior.
   - *Aclaración:* El ajuste de fechas de cronograma pertenece a la propuesta futura de planificación y queda fuera de este alcance.

4. **`administrative`:**
   - Administración y Finanzas operativas (Área Administrativa).
   - Foco en información fiscal, RUT, sincronización con Alegra, cartera y soporte de facturación.

5. **`executive`:**
   - Dirección General y Representación Legal (perfiles con Access Level `executive`, detallados en Equipo Canónico Privado).
   - **Pueden:**
     - Visualizar toda la operación.
     - Crear y editar Clientes, New Business, Proyectos y Tareas.
     - Consultar Horas y Capacidad global.
     - Archivar registros.
     - Gestionar usuarios.
     - Cambiar Access Levels.
   - **No pueden:**
     - Eliminar definitivamente.
     - Ejecutar migraciones o conciliaciones.
     - Modificar integraciones.
     - Administrar credenciales o variables de entorno.
     - Modificar configuración técnica.
     - Eliminar definitivamente información fiscal.

6. **`system_admin`:**
   - Existen dos usuarios iniciales con Access Level `system_admin` con idénticos permisos técnicos en plataforma.
   - Un usuario administra cotidianamente usuarios, accesos, capacidad y ausencias.
   - El otro usuario conserva la responsabilidad funcional del producto digital.
   - **La diferencia es organizacional y operativa, no de permisos técnicos.**
   - No se describe a producto digital como responsable principal de infraestructura técnica.
   - La asignación nominal de estos perfiles se gestiona exclusivamente en *Equipo Canónico Privado*.

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
| **Tareas (`tareas`)** | assigned (view/edit/create) | team (view/create/edit/approve) | accounts (view/create) | all (view/create/edit; **no reasigna personas** · #145) | all (view) | all (view) | all (administer) |
| **Timesheets (`timesheets`)** | own (view/create) | team (view/edit) | accounts (view) | all (view) | all (view) | all (view) | all (administer) |
| **Clientes (`clientes`)** | Denegado | team (view) | accounts (view/edit) | all (view/create/edit) | all (view/edit) | all (view) | all (administer) |
| **Catálogo (`plantillas-producto`)** | **Denegado** | all (view) | all (view) | all (view) | Denegado | all (view) | all (view/administer) |
| **New Business (`new-business`)** | Denegado | team scoping (view/edit) | accounts (view) | all (view/create/edit/approve) | all (view/edit formalization) | all (view/approve) | all (administer) |
| **Dirección y Finanzas (`direccion-finanzas`)** *(act. 07 Nov 2026, §10.2.4)* | Denegado | Denegado | all (view) | all (view/edit) | Denegado | all (view/edit) | all (administer) |
| **Costos de operación (`costos-operacion`: Licencias y Hardware)** *(07 Nov 2026)* | Denegado | Denegado | Denegado | Denegado | all (view/create/edit) | all (view) | all (administer) |
| **Equipo & Accesos (`usuarios` / módulo `administracion`)** *(act. 07 Nov 2026)* | Denegado | Denegado | Denegado | Denegado | Denegado | all (view) | all (administer) |
| **Capacidad (`capacidad`)** *(07 Nov 2026)* | own: «Mi Capacidad» | own + «Organización» (all) | own + «Organización» (all) | own + «Organización» (all) | own + «Organización» (all) | own + «Organización» (all) | own + «Organización» (administer) |
| **La Colonia (`la-colonia`)** | all (view/edit) | all (view/edit) | all (view/edit) | all (view/edit) | all (view/edit) | all (view/edit) | all (administer) |

> **Configuraciones exclusivas de `system_admin` (07 Nov 2026):** webhooks de Google Chat (§11.8), conexión de Google Calendar y eventos por asociar en *Equipo & Accesos → Integraciones* (§11.5.1; `executive` solo consulta), «Acceso a ECO» en el perfil (usuario de ingreso, contraseña temporal, desactivar; §10.8) y apariencia de la mascota (Módulo 18).

### 10.6. Reglas de Negocio de Autorización Específica

1. **Scoping Operativo en New Business:**
   - La Directora Comercial crea oportunidades y briefs.
   - El Product Lead (o Leader asignado) realiza el dimensionamiento técnico (Backlog, Entregables y Horas por Rol).
   - Los colaboradores técnicos no tienen acceso al módulo New Business para evitar filtración de propuestas comerciales tempranas.
2. **Pricing y Márgenes:**
   - La edición de costos base, margen esperado (%) y valor final de la cotización es **exclusiva de la Directora Comercial** con visibilidad del CEO. Los líderes operativos proponen horas, no precios de venta.
3. **Formalización y Datos Fiscales:**
   - La carga del RUT, verificación en Alegra y datos de facturación electrónica es potestad de la **Administrativa** y la Directora Comercial.
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

> **Reconciliación con producción (07 Nov 2026):** el perfil del prototipo se alinea con el de producción: **rol profesional** como desplegable de selección múltiple (solo catálogo oficial; el primero es el principal), **calendario laboral** (Colombia/México) con **vigente desde** (las semanas anteriores no se recalculan), **desactivar usuario** (conserva su historia de horas y proyectos) e **historial de cambios del perfil** (rol, nivel de acceso, líder, área, capacidad, calendario). El historial autoritativo lo genera el backend (`UserProfileAuditEntry`).
>
> **Acceso a ECO (igual a producción, solo `system_admin`):** tarjeta en el perfil con estado (`Con contraseña` · `Sin acceso asignado` · `Desactivado`), usuario de ingreso y último ingreso. Permite **asignar o cambiar el usuario de ingreso** (único, sin espacios; la contraseña no cambia), **asignar o restablecer el acceso** con una contraseña temporal que escribe el admin dos veces (mínimo 8 caracteres; se entrega por canal privado y se obliga a cambiarla al entrar) y **desactivar o reactivar** a la persona. El historial registra cada cambio, nunca la contraseña. Reemplaza el modal anterior del prototipo que generaba y copiaba la contraseña en texto plano.

> **CIERRE DE DEFINICIÓN FUNCIONAL (EQUIPO & ACCESOS → PERFIL DEL COLABORADOR):**
> Se formaliza la separación estricta entre **identidad profesional**, **nivel RBAC funcional** y **compatibilidad técnica secundaria**, garantizando que la matriz RBAC permanezca cerrada y con una única fuente de verdad.

#### 1. Separación Conceptual de Atributos:
1. **`jobTitle` / `officialRoles` → Identidad Profesional:**
   - **`jobTitle`**: Denominación funcional y operativa visible del cargo en la organización (ej. *Product Lead*, *Front-End Dev*, *Senior Growth Strategist*).
   - **`officialRoles`**: Vinculación formal con uno o más de los **13 Roles Canónicos de Uhura** del Catálogo de Servicios (`StandardUhuraRole[]`). Es obligatorio para todo colaborador que ejecute o cotice horas en proyectos y propuestas de New Business.
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
1. **`jobTitle`** (string) / **`officialRoles`** (`StandardUhuraRole[]`, cuando corresponda al catálogo)
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
- **Consumo Unificado en Frontend:** Toda la interfaz de ECO consume las imágenes de perfil a través del componente centralizado `UserAvatar`.
- **Tratamiento Visual Estricto:** Relación de aspecto 1:1, centrado, `object-cover`, sin deformación ni alteración de la composición de tarjetas, headers o tablas.
- **Fallback Automático Resiliente:** Si el campo es `null`, vacío o si la imagen falla al cargar (`onError`), el componente automáticamente muestra las iniciales del colaborador sobre el color temático asignado (`avatarBg`).

#### 5. Auditoría de Cambios Sensibles en Backend:
> **REGLA DE GOBERNANZA DE AUDITORÍA:**
> `UserProfileAuditEntry` en frontend es **únicamente representación / previsualización en interfaz**. La auditoría autoritativa **debe generarse y persistirse en backend (Indunova) al guardar el cambio transaccional**. El frontend **no debe ser fuente de verdad del historial**.

Para modificaciones sobre campos sensibles que impactan la seguridad, jerarquía o nómina, el backend deberá registrar un historial de auditoría bajo la siguiente estructura canónica:
$$\text{Auditoría: } \text{valor anterior} \longrightarrow \text{valor nuevo} \longrightarrow \text{fecha (timestamp ISO)} \longrightarrow \text{usuario que realizó el cambio}$$

**Contrato Mínimo de Auditoría:**
- **`userId`** (string): Identificador único del colaborador afectado.
- **`field`** (string): Campo modificado (`accessLevel`, `officialRoles`, `leaderId`, `status`, `fecha_ingreso`, etc.).
- **`previousValue`** (string | null): Valor anterior del campo antes de la modificación.
- **`newValue`** (string | null): Nuevo valor asignado al campo tras la edición.
- **`changedAt`** (string): Timestamp ISO UTC registrado por el servidor en el momento exacto del guardado.
- **`changedByUserId`** (string): Identificador del usuario que realizó la modificación.
- **`reason`** (string, opcional): Justificación o motivo opcional del cambio sensible.

Campos sujetos a auditoría obligatoria en backend:
- **`accessLevel`** (Nivel de Acceso RBAC)
- **`officialRoles`** (Roles Profesionales del Catálogo)
- **`leaderId` / `reportsTo`** (Líder Directo de reporte)
- **`status`** (Estado de Cuenta)
- **`fecha_ingreso`** (Fecha Contractual de Ingreso, restringida a perfiles administrativos autorizados)

#### 6. Frontera Arquitectónica con el Futuro People Master:
Para la separación estricta entre la identidad operativa actual de `UserProfile` y la futura evolución administrativa de personas (contratos, salarios, dotación, SST), consultar la subsección [11.4.1. Frontera Arquitectónica: Perfil Operativo (UserProfile) vs. Evolución People Master](#1141-frontera-arquitectónica-perfil-operativo-userprofile-vs-evolución-people-master) y la guía técnica de referencia [`src/docs/PEOPLE_MASTER_EVOLUTION.md`](./PEOPLE_MASTER_EVOLUTION.md).

*El frontend de ECO ya se encuentra totalmente preparado para emitir y previsualizar esta estructura bajo el contrato acordado sin asumir persistencia autoritativa local.*

---

## 11. Arquitectura de Interoperabilidad Estructural (Bloque 4)

### 11.1. Principio Rector: Integraciones Silenciosas e Invisibles
> **PRINCIPIO ARQUITECTÓNICO DE UHURA:**
> **"Las integraciones deben sentirse casi invisibles."**
> En ECO no existen botones de "Sincronizar ahora", pantallas de configuración de tokens para usuarios finales, ni paneles que emulen dashboards de APIs externas. ECO es un sistema de gestión operativa enfocado en la claridad del trabajo. La interoperabilidad ocurre a nivel de modelo de dominio y claves foráneas canónicas, permitiendo que la capa de backend (Indunova) orqueste workers y webhooks sin obligar al frontend a rediseñar sus pantallas ni sus entidades principales.

---

> **Excepciones aprobadas (07 Nov 2026 · ticket #149):** solo dos pantallas de integración son visibles, ambas sin credenciales ni URLs: (1) **Google Chat** por cliente y proyecto, gestionada por `system_admin` (§11.8); (2) **Google Calendar · Ausencias del equipo** en *Equipo & Accesos → Integraciones*, gestionada por `system_admin` y de consulta para `executive` (§11.5.1). El resto de usuarios no ve estas pantallas.

### 11.2. Frontera Canónica de Sistemas (Sources of Truth)

| Sistema Externo | Rol en el Ecosistema | Source of Truth Canónico | Entidades Vinculadas en ECO | Claves Foráneas & Hooks en ECO |
| :--- | :--- | :--- | :--- | :--- |
| **HubSpot** | Comercial & CRM | Prospectos, empresas, contactos, deals, pipeline y actividad comercial | `NewBusinessOpportunity`, `ProjectSummaryItem` | `hubspotDealId`, `hubspotDealUrl`, `hubspotCompanyId`, `hubspotContactId` |
| **ECO** | Operativo & Capacidad | Alcance técnico, dimensionamiento, cotizaciones, proyectos, entregables, tareas, staffing, capacidad y horas | Todo el Core de ECO | Entidades maestras de ECO (`ProjectSummaryItem`, `TaskItem`, `UserItem`, etc.) |
| **Alegra** | Fiscal & Contable | Terceros fiscales (Razón Social / NIT), facturación electrónica, impuestos, cartera y recaudo | `ClientTaxEntity`, `ClientProfile`, `ProjectSummaryItem` | `taxEntityId` (selección fiscal operativa inicial hacia `ClientTaxEntity`), `alegraContactId` |
| **Google Drive** | Repositorio Documental | Almacenamiento seguro de archivos, briefs, contratos firmados, entregables y propuestas | `NewBusinessOpportunity`, `ProjectSummaryItem` | `driveFolderId`, `driveFolderUrl`, `briefUrl`, `briefFileId` |
| **Google Calendar** | Calendario de Disponibilidad | Vacaciones y licencias/permisos laborales aprobados del equipo | `TeamAbsenceEvent`, `CapacityView`, `BuckyEngine` | `TeamAbsenceEvent` (`externalCalendarEventId`, `externalCalendarId`, `source: 'google_calendar'`) |

---

### 11.3. Regla Canónica de Disparo: Cuándo se Activa New Business
> **CORRECCIÓN CRÍTICA DE GOBERNANZA:**
> **New Business NO se activa con "Deal Won" en HubSpot.**
> - **El Disparador Real:** New Business se activa en ECO tan pronto como existe un **Brief Comercial Calificado** que requiere **Dimensionamiento Técnico Operativo (Scoping)**.
> - **Razón:** Para poder cotizar y ganar el Deal en HubSpot, la Directora Comercial necesita que el Product Lead / Líder de Área desglose el alcance en entregables, actividades y horas por rol en ECO.
> - **Ciclo de Vida:**
>   1. Oportunidad creada en HubSpot (`hubspotDealId`).
>   2. Se activa en ECO para scoping técnico y generación de propuestas (`QuoteProposal`).
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
>    - Campos opcionales del perfil en ECO para enriquecimiento de experiencia y contexto de Bucky. **No forman parte del contrato obligatorio de interoperabilidad técnica**.
> 6. **Google Calendar NO es la Fuente de Cumpleaños ni Aniversarios:**
>    - La privacidad de fechas de nacimiento y datos contractuales reside exclusivamente en la base de datos interna de ECO (`UserItem`). Google Calendar se reserva de forma estricta para la programación operacional de ausencias y licencias.

#### Estructura y Reglas Canónicas del Perfil del Colaborador
El perfil del colaborador en ECO define la identidad funcional, contractual y de seguridad del usuario en el sistema. Los campos se estructuran bajo las siguientes reglas:

1. **Campos Canónicos Persistidos (Almacenados en Base de Datos):**
   - **`name` / `fullName`:** Nombre completo del colaborador (string, obligatorio).
   - **`firstName` / `lastName`:** Nombres y apellidos por separado (strings, obligatorios para búsquedas y comunicaciones).
   - **`email`:** Correo electrónico corporativo oficial (`@uhuragroup.com`) (string, obligatorio, identificador único de cuenta y acceso).
   - **`fecha_ingreso` / `joinedDate`:** Fecha fundacional de vinculación laboral en formato ISO `YYYY-MM-DD` (Date, obligatorio; dato canónico de edición restringida a perfiles autorizados [Administrativa / RRHH / Dirección General]. Antigüedad y aniversario se derivan directamente de él; no debe documentarse como inmutable).
   - **`birthDate`:** Fecha de nacimiento en formato ISO `YYYY-MM-DD` (Date, obligatorio para colaboradores activos; administrable y visualizable en *Equipo & Accesos*).
   - **`weeklyCapacityHours`:** Capacidad semanal base en horas (Integer/Decimal, predeterminada en 42h para todos; editable individualmente exclusivamente por `system_admin`).
   - **`workCalendar`:** Calendario laboral asignado (`'colombia'` | `'mexico'`, obligatorio; no inferido por ciudad; editable exclusivamente por `system_admin`).
   - **`calendarEffectiveDate`:** Fecha de vigencia del calendario o capacidad (ISO Date `YYYY-MM-DD`; no recalcula retroactivamente periodos cerrados).
   - **`jobTitle`:** Cargo operativo o denominación funcional visible (string, obligatorio).
   - **`officialRoles` (`StandardUhuraRole[]`):** Uno o más de los 13 roles oficiales del Catálogo de Servicios (obligatorio para todo perfil que cotice o ejecute horas en proyectos).
   - **`accessLevel` (`OrbitAccessLevel`):** Nivel de autorización gobernado exclusivamente por la matriz canónica RBAC (`collaborator`, `leader`, `client_relationship`, `commercial`, `administrative`, `executive`, `system_admin`, más estado transitorio `pending`).
   - **`role` (`UserRole`):** Atributo técnico secundario de compatibilidad heredada (`Admin` | `Member` | `Viewer`). **NO** gobierna permisos funcionales.
   - **`department`:** Área o departamento operativo (string, obligatorio para colaboradores activos).
   - **`leaderId` / `reportsTo`:** Identificador del líder directo del área para cadenas de reporte y jerarquía operativa.
   - **`city`:** Ciudad de residencia del colaborador (string, obligatorio para visibilidad de equipo distribuido; no determina el calendario laboral).
   - **`status` (`UserStatus`):** Estado de la cuenta en plataforma (`Active` | `Inactive` | `Invited`).
   - **`hobbies` / `petNames`:** Intereses personales, pasiones o mascotas (strings libres opcionales para contextualización de Bucky; no requeridos para interoperabilidad core).

2. **Campos Derivados en Tiempo de Ejecución (No Duplicidad en Almacenamiento):**
   - **Aniversario en Uhura:** NO se almacena como fecha ni evento independiente. Se proyecta anualmente combinando el mes y día de `fecha_ingreso` con el año en curso.
   - **Años de Antigüedad Cumplidos:** Se calcula restando el año de `fecha_ingreso` al año de la fecha evaluada.
   - **Cumpleaños Próximos:** Se calculan evaluando la proximidad temporal del mes y día de `birthDate` respecto a la fecha actual del sistema.

3. **Visibilidad, Privacidad y Gobernanza de Datos:**
   - La administración de estos campos se realiza desde el módulo **Equipo & Accesos** exclusivamente por usuarios con permisos autorizados (`system_admin` para accesos, capacidad y calendarios; `executive` y `administrative` para datos de contacto y fichas).
   - Mi Día y Bucky consumen estos datos para avisos discretos y contextuales, preservando la sobriedad visual del sistema.

4. **Gobernanza del Equipo Canónico y Cuentas identificadas para conciliación por Indunova (🟢 Decisión funcional aprobada):**
   > **AVISO DE PRIVACIDAD Y GOBERNANZA:**
   > La documentación pública define reglas, estructuras y comportamientos. La identidad nominal de colaboradores, correos, relaciones de reporte, calendarios individuales y crosswalk con backend se administra exclusivamente mediante **Equipo Canónico Privado**.

   - **Universo Canónico Vigente:**
     La matriz **Equipo Canónico Privado** continúa siendo la fuente autoritativa para colaboradores activos, `accessLevel`, roles y relación con el backend. El universo canónico vigente queda formalmente cerrado y confirmado en **exactamente 18 colaboradores activos**. La referencia anterior a 19 colaboradores ha sido corregida y descartada en la fuente autoritativa.
   - **Gobernanza del Perfil Ejecutivo (`executive`):**
     El perfil `executive` adicional definido en Equipo Canónico Privado forma parte de los 18 colaboradores activos y debe contar con usuario ECO. Su asociación con Backend User ID se resolverá durante el crosswalk con Indunova.
   - **Gobernanza de `system_admin`:**
     Existen dos usuarios iniciales con Access Level `system_admin` con idénticos permisos técnicos en plataforma. La diferenciación funcional y operativa (soporte técnico / producto digital vs. soporte administrativo y configuración de capacidades/calendarios) corresponde a su rol en la organización, según se define en Equipo Canónico Privado.
   - **Cuentas Duplicadas e Históricas identificadas para conciliación por Indunova:**
     Los pares de cuentas duplicadas y los perfiles históricos que requieren conciliación están identificados en Equipo Canónico Privado. Indunova deberá aplicar la inactivación lógica preservando todas las relaciones e historial.
     Indunova deberá implementar en sus scripts de conciliación el estado esperado sin ejecutar borrados físicos (`DELETE`) en base de datos:
     - Conservar activo únicamente el perfil canónico oficial (`is_active = True`) de cada uno de los 18 colaboradores activos.
     - Inactivar el registro duplicado o perfil histórico (`is_active = False` / `status: 'Inactive'`).
     - Preservar tareas, horas registradas (`TimeLog`), proyectos e historial de relaciones asociadas.
     - Excluir perfiles inactivos de los selectores activos y filtros de planificación.
   - **Principio de No Inferencia:** Queda estrictamente prohibido inferir o fusionar identidades de colaboradores por similitud de nombres o cargos. Toda resolución responde a la correspondencia unívoca con la matriz canónica privada.
   - **Carga Inicial Separada:** Para la estructura de inicialización y el dataset base de perfiles operativos, consultar el documento complementario: [`src/docs/INITIAL_TEAM_SEED.md`](./INITIAL_TEAM_SEED.md).

---

### 11.4.1. Frontera Arquitectónica: Perfil Operativo (`UserProfile`) vs. Evolución People Master

> **DECISIÓN ARQUITECTÓNICA Y DE PRODUCTO (FRONTERA DE GESTIÓN DE PERSONAS):**
> Se formaliza la frontera estricta entre la **identidad operativa y de acceso actual (`UserProfile` / `UserItem`)** y la futura evolución hacia un **People Master administrativo integral**.
> **Esta definición NO amplía el alcance actual ni bloquea la integración frontend ↔ backend con Indunova.**

#### 1. Alcance Actual: `UserProfile` como Identidad Operativa y de Acceso
El modelo actual de colaborador en ECO (`UserProfile` en backend Django / `UserItem` en frontend React) representa de manera suficiente y exhaustiva la **identidad operativa, jerárquica y de autorización** requerida para el flujo de trabajo core de la agencia:
- **Campos Core Actuales Persistidos:**
  - `id` (Identificador único UUID)
  - `name` / `fullName` (Nombre completo)
  - `email` (Correo electrónico corporativo único `@uhuragroup.com`)
  - `jobTitle` (Cargo funcional visible)
  - `officialRoles` / `professionalRoles` (`StandardUhuraRole[]`: uno o más de los 13 roles oficiales del catálogo)
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
  3. **No crear `hr_admin` como nivel RBAC:** Se mantienen estrictamente intactos los 7 niveles canónicos de ECO (`collaborator`, `leader`, `client_relationship`, `commercial`, `administrative`, `executive`, `system_admin`). La visibilidad futura de datos sensibles de RRHH se gobernará mediante permisos/capacidades específicas independientes del `accessLevel` (ej. `people.hr.read`, `people.compensation.read`, `people.sst.read`, referenciales).
  4. **Aislamiento de permisos técnicos:** `system_admin` **NO** obtiene por defecto acceso a información salarial, contractual, médica o sensible por el mero hecho de tener permisos técnicos de administración sobre la plataforma.
  5. **Controles de protección y auditoría:** Los datos sensibles deberán contar con controles reforzados de acceso, auditoría y protección en reposo. La estrategia técnica definitiva de persistencia y cifrado se definirá con backend e infraestructura antes de implementar People Master.
  6. **Criterio de necesidad para datos SST/médicos:** No debe asumirse que todo dato administrativo existente en las bases actuales deba migrarse a ECO; su incorporación futura dependerá de necesidad funcional real, privacidad y gobernanza.

#### 6. Matriz de Alcance: Core Actual vs. People Master Evolutivo

| Dimensión | Ahora (Core Personas en ECO) | Evolutivo (Futuro People Master) |
| :--- | :--- | :--- |
| **Identidad** | Nombre, email, avatar, ciudad | Documento legal, tipo de identificación, nacionalidad, dirección |
| **Puesto & Rol** | `jobTitle`, `officialRoles` (Catálogo), `department`, `leaderId` | Centro de costos, banda salarial, organigrama formal corporativo |
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
El flujo corporativo vigente para la solicitud y programación de vacaciones o ausencias opera por fuera de la capa transaccional de ECO a través de los siguientes 5 pasos estrictos:
1. **Solicitud Inicial:** El colaborador solicita formalmente la ausencia o periodo de vacaciones a su líder directo de área.
2. **Aprobación del Líder:** El líder de área evalúa la disponibilidad del equipo y aprueba la solicitud.
3. **Escalamiento por Rol:** Si quien solicita la ausencia es un **líder de área**, la aprobación corresponde de manera exclusiva a la **Dirección General (Access Level `executive`)**.
4. **Formalización Administrativa:** Una vez obtenida la aprobación del líder (o de la Dirección General), la novedad se formaliza mediante correo electrónico remitido al **Área Administrativa (Administrativa & RRHH)**, con copia obligatoria al líder de área correspondiente.
5. **Programación en Calendario Corporativo:** El Área Administrativa registra y programa formalmente la ausencia en el Google Calendar corporativo oficial de Uhura Group (ej. `ausencias@uhuragroup.com`).

#### Decisiones de Producto y Arquitectura ECO:
- **ECO NO Requiere Crear un Workflow Interno de Aprobación:**
  En esta fase, ECO no implementa un motor transaccional de solicitudes ni bandejas de aprobación burocrática de vacaciones. El proceso operativo existente por canales corporativos (Líder / Dirección General ➔ Correo Área Administrativa ➔ Google Calendar) funciona eficientemente.
- **Google Calendar como Fuente Operacional Externa:**
  El Google Calendar corporativo administrado por el Área Administrativa actúa como la **fuente de verdad operacional de las ausencias ya aprobadas y programadas**.
- **Consumo Unificado vía `TeamAbsenceEvent`:**
  ECO sincroniza y consume estas ausencias a través de la entidad canónica `TeamAbsenceEvent`. Se prohíbe taxativamente crear modelos paralelos de ausencias en el backend de Indunova.
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
  id: string;                          // UUID único de ECO
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

#### Regla Matemática de Deducción de Capacidad en ECO:
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


#### 11.5.1 Vista de administración: Equipo & Accesos → Integraciones (🟣 Implementado en prototipo · 07 Nov 2026)
- **Quién la ve:** `system_admin` gestiona; `executive` consulta; el resto de perfiles no ve la pestaña.
- **Qué muestra:** estado de la conexión (`Conectado` · `Pendiente de acceso` · `Pausado` · `Error`), nombre del calendario, última sincronización, ausencias importadas y eventos por asociar.
- **Acciones (`system_admin`):** probar conexión, pausar o reanudar, y resolver **eventos sin persona asociada**: ECO asocia cada evento por el correo del invitado; si no encuentra a nadie del equipo, el evento queda en esta lista para elegir a quién corresponde (la ausencia baja a Capacidad y Mi Día) o ignorarlo.
- **Cómo se lee el evento:** por el título. «Vacaciones», «Incapacidad», «Permiso» → 8 h/día; «Medio día» → 4 h/día; otro título → «Otra ausencia», 8 h/día. Un evento cancelado anula la ausencia.
- **Sin credenciales en pantalla:** la conexión la hace Indunova con una cuenta de servicio de Google Workspace de solo lectura; no se pegan tokens ni URLs. ECO nunca escribe en el calendario.
- En el prototipo la conexión y los eventos son simulados. Requisitos técnicos: `BACKEND_REQUIREMENTS.md` §20.

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
   - **Pendiente de Validación con Dirección General / Administración:** Queda explícitamente pendiente definir con la Dirección General y Administración:
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
   - Capacidad (Disponibilidad, asignación y carga). Todo el mundo ve su capacidad individual («Mi Capacidad»); `leader`, `client_relationship`, `commercial`, `administrative`, `executive` y `system_admin` ven además «Organización». `collaborator` solo ve la suya.
   - *Nota:* Se retiró `Horas` de la navegación primaria; Mi Día absorbió el timer, la carga manual y rápida, el progreso de jornada y los registros de hoy. El acceso a la auditoría histórica de timesheets se mantiene de forma contextual secundaria.
2. **Comercial:**
   - **Dirección y Finanzas:** Métricas de valor vendido vs meta, base de fees recurrentes, top clientes y semáforo de proyectos (exclusivo para perfiles de Liderazgo y Dirección).
   - **New Business:** Embudo de ventas, scoping de brief, cotizaciones y formalización contractual (SOW).
   - **Clientes:** Directorio de cuentas, razones sociales / NITs y contactos.
   - **Servicios:** Catálogo de servicios y plantillas maestras de entregables.
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

### 11.8. Integración con Google Chat por cliente y proyecto (🟣 Implementado en prototipo · ticket #149)
> **Autogestión (07 Nov 2026):** el webhook de cada cliente lo registra `system_admin` (Uhura) **desde la plataforma** (Cliente → Integraciones → Google Chat), sin pedírselo a Indunova ni compartirlo por WhatsApp, ticket o correo. Indunova construye la pantalla y el envío; Uhura pega, prueba, activa, reemplaza o desactiva cada webhook cuando lo necesite. Para la prueba inicial con Neroli, Uhura lo registra en el ambiente de pruebas cuando la pantalla esté disponible allí.
Objetivo: publicar en el espacio de Google Chat de cada cliente las novedades que requieren atención (asignación, solicitud de revisión, mención, devolución, aprobación, prioridad urgente), con mensajes breves y un enlace a la tarea. No se envían eventos de timer, cambios visuales ni actividad sin acción requerida. La notificación in-app sigue siendo la fuente principal.

**Dónde se configura**
- **Cliente → Integraciones → Google Chat:** el **único espacio** de Google Chat del cliente (un webhook por cliente). Muestra estado (`Pendiente de prueba` · `Conectado` · `Inactivo` · `Error`), espacio, cuántos proyectos lo tienen activado, última prueba y su resultado, y quién hizo la última modificación.
- **Proyecto → ⋮ → Notificaciones (simplificado 07 Nov 2026):** solo dos opciones: **`Activar notificaciones`** (las novedades llegan al espacio del cliente) y **`No enviar notificaciones a Google Chat`** (**predeterminado**: los proyectos nuevos no envían hasta que alguien lo active). Si se activa y el cliente aún no tiene espacio, `system_admin` lo registra ahí mismo (queda guardado en el cliente y sirve para todos sus proyectos); los demás perfiles ven que falta y a quién pedírselo. Ya no existe un espacio propio por proyecto. Muestra siempre el destino efectivo.

**Permisos**
| Perfil | Cliente | Proyecto |
|---|---|---|
| `system_admin` | Registra, guarda y prueba, desactiva, reactiva, reemplaza y elimina. Ve la referencia enmascarada. | Activa o desactiva; si el cliente no tiene espacio, lo registra desde el proyecto. |
| `executive` | Consulta estado, espacio, última prueba y última modificación. No ve URL ni máscara. | Consulta. |
| `leader` | Sin acceso a la sección del cliente. | Consulta estado y espacio; puede **activar** o **no enviar** (no registra URLs). |
| Demás perfiles | Sin acceso. | Sin acceso. |

**Acciones**
- *Desactivar:* conserva la configuración y detiene los envíos.
- *Reactivar:* ejecuta una prueba y vuelve a `Conectado` si es satisfactoria.
- *Reemplazar:* pide una URL nueva, la prueba y sustituye la anterior.
- *Eliminar:* borra la vinculación (requiere confirmación explícita); para volver a usar Google Chat se registra un webhook nuevo. Desactivar y eliminar son botones distintos.

**Regla de resolución (precedencia)**
1. Proyecto con Google Chat sin activar (predeterminado) → no se envía.
2. Proyecto activado → se usa el webhook **activo** del cliente.
3. Activado pero el cliente no tiene espacio, o está inactivo o con error → solo notificación in-app.
Desactivar la integración del cliente detiene los envíos de todos sus proyectos activados.

**Seguridad**
- Tras guardar, la URL no se vuelve a mostrar: solo una referencia enmascarada (`••••••••••••aB92`).
- El prototipo **simula** la prueba (valida el formato `https://chat.googleapis.com/v1/spaces/…`) y nunca hace solicitudes reales ni guarda URLs. Ninguna URL real debe existir en el repositorio, tickets ni documentación abierta.
- Caso de adopción: cliente **Neroli Fragancias** con integración activa (mock sin URL) y su proyecto «Fee mensual — Neroli Fragancias» heredándola.
- Referencias de código: `src/components/taskflow/integrations/googleChat.ts` (reglas), `GoogleChatIntegrationCard.tsx`, `ProjectNotificationsModal.tsx`.

### 11.9. Módulo de Dirección y Finanzas: Lógica Comercial, Metas y Gancho con Alegra

#### 1. Ubicación y Control de Acceso (RBAC)
- **Ubicación Canónica:** Pestaña primaria dentro del grupo **COMERCIAL** en la barra lateral, situada jerárquicamente **inmediatamente encima de New Business**.
- **Público Objetivo:** `executive`, `system_admin`, `commercial` y `client_relationship` (módulo RBAC `direccion-finanzas`). *(Actualizado 07 Nov 2026: `leader` ya no tiene acceso, alineado con producción; ver §10.2.4.)*
- **Restricción Estricta:** Acceso denegado a colaboradores operativos (`collaborator`), evitando filtración de metas de facturación o cifras comerciales consolidadas.

#### 2. Definición de los 3 Bloques No Redundantes
Para evitar duplicidades con tableros existentes, la vista se compone estrictamente de 3 bloques funcionales:
1. **Bloque 1: Cumplimiento Comercial & Proyección del Mes:**
   - **Selector de Período:** Mes calendario evaluado (por defecto el mes en curso).
   - **Meta del Mes:** Parámetro directivo editable en millones de COP (por defecto $350.000.000 COP).
   - **Vendido / Cerrado en el Mes (New Business Won):** Sumatoria del valor contractual cotizado de todas las propuestas que alcanzaron estado `won` en el mes evaluado.
   - **Base Recurrente Activa (Fees Mensuales):** Suma fija de los fees y retainers de clientes activos con facturación recurrente en curso.
   - **Barra de Avance:** Porcentaje global alcanzado `(Vendido New Business + Base Recurrente) / Meta del Mes`.
   - **Facturado Real (Alegra API) `[PENDIENTE INTEGRACIÓN]`:** Tarjeta visible que documenta explícitamente el hook de sincronización con Alegra. Muestra el estado "Por sincronizar / Pending Alegra" para contrastar ventas comprometidas vs. facturación electrónica efectivamente radicada y cobrada, sin recurrir a datos contables simulados.
2. **Bloque 2: Top Clientes Activos:**
   - Ranking de los 5 clientes con mayor concentración de horas registradas y volumen de entregables abiertos.
   - Acceso directo al directorio de clientes.
3. **Bloque 3: Proyectos · Semáforo de Consumo (Fuente Única de Salud Operativa):**
   - Agrupa los proyectos activos y compara horas consumidas vs. horas presupuestadas (`consumedSeconds / budgetedHours`).
   - Estados semafóricos:
     - 🟢 **Normal:** Consumo inferior al 75% de la bolsa presupuestada.
     - 🟡 **Alerta:** Consumo entre 75% y 100% de la bolsa.
     - 🔴 **Excedido / Sobrecosto:** Consumo superior al 100% de las horas presupuestadas.
   - Integra la visualización de entregables vencidos por proyecto (`dueDate < hoy` y `status !== 'Done'`), consolidando las alertas operativas en un solo punto sin tarjetas redundantes.

#### 3. Reconciliación con producción: «Tablero» y «Finanzas» (07 Nov 2026)
En producción, Indunova separó este módulo en **Tablero** (salud comercial y operativa) y **Finanzas** (cartera, P&G, proyecciones, facturas, metas). Cubren la misma necesidad que Dirección y Finanzas del prototipo, por lo que **no se requieren pantallas nuevas**. Las mejoras pendientes son de **lógica y fuentes de datos**:

1. **Costos reales en el P&G.** Hoy el margen aparece en 100 % porque los costos están en $0. El costo de un proyecto = horas registradas × costo hora de la persona + depreciación de hardware + licencias imputadas + recursos externos (BACKEND §12.8, §12.10). Si falta alguna fuente, mostrar «margen no disponible» en lugar de 100 %.
2. **Facturas ligadas a proyecto o servicio.** «Rentabilidad por servicio» muestra un bloque «(Sin proyecto)» con la mayoría de la facturación. Cada factura debe asociarse a proyecto (o cliente + servicio) al causarse; las no asociadas se muestran como **«Por conciliar»**, no como un servicio.
3. **Costo hora fuera de «Metas financieras».** El costo hora es un parámetro de costo por persona o rol con vigencia (tabla de costos), no una meta del periodo.
4. **Meta del mes desde la meta anual.** La meta anual se reparte por mes (como en el prototipo) y cada mes puede ajustarse manualmente con trazabilidad. Así «Meta del mes» y «Cumplimiento presupuestal» nunca quedan vacíos si hay meta anual.
5. **Proyección basada en contratos, no solo lineal.** Proyección = fees vigentes (valor mensual × meses restantes del contrato, Módulo 11 §11.6.1) + facturación pendiente de proyectos únicos por hitos + pipeline de New Business ponderado por probabilidad. La regresión lineal puede quedar como referencia secundaria.
6. **Una sola tabla de TRM.** Licencias muestra «TRM sin configurar». Finanzas administra una tabla única (fecha, moneda, valor) que usan licencias, cotizaciones en USD, recursos externos y P&G.
7. **Alertas sin duplicar el semáforo.** «Alertas operativas» y «Proyectos · semáforo» repiten la misma lista. El semáforo muestra conteos y la lista completa; las alertas solo los proyectos en **riesgo** con la acción recomendada (ej. reforecast, ronda adicional, sobrecosto).

---

*Fin del Documento Maestro — Uhura ECO 2026*

