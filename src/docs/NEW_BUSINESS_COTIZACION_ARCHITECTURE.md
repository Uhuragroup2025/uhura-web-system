# Arquitectura Funcional: New Business → Cotización → Proyecto en Orbit

> **Documento Maestro de Modelo Funcional y Reglas Operativas**  
> Fecha: Septiembre 2026  
> Sistema: Uhura Orbit (Operating System & Unified Work System)  
> Alcance: Separación estricta entre Pipeline Comercial (HubSpot), Ingeniería Operativa/Backlog (Orbit) y Facturación Fiscal (Alegra).

---

## 1. Principios y Decisiones Fundacionales de Negocio

El modelo se apoya en un principio cardinal: **el backlog nace estructurado en la cotización y se transfiere sin pérdida de granularidad al proyecto operativo**, eliminando el doble digitado sin convertir a Orbit en un CRM genérico ni en un ERP contable.

### DECISIÓN 1 — El backlog nace desde plantillas maestras gobernadas por Producto
* **Responsabilidad de Producto**: La creación y calibración del backlog técnico **no es responsabilidad del área Comercial**, sino que está **gobernado por Producto** para garantizar la calidad y coherencia sin quedar amarrado técnicamente a una sola persona.
* **Biblioteca Operativa Reutilizable**: El área de Producto mantiene y evoluciona una biblioteca centralizada de plantillas maestras operativas (`ProductBacklogTemplate`), por ejemplo:
  1. **Sitio WordPress hasta 12 páginas internas**.
  2. **Landing Page**.
  3. **Ecommerce hasta 15 SKUs**.
  4. **Shopify**.
  5. **Portal / plataforma**.
  6. **Proyecto a la medida**.
* **Contenido obligatorio de cada plantilla**:
  * Entregables (`TemplateDeliverable`).
  * Actividades técnicas (`TemplateBacklogItem`).
  * Rol responsable del catálogo estándar (`roleId`, ej. *Product Lead*, *Front End*, *Diseñador Gráfico*).
  * Horas estimadas por actividad y rol.
  * Orden y dependencias cuando aplique.
* **Flujo en New Business**:
  1. Producto o el líder técnico selecciona una plantilla de la biblioteca.
  2. Puede duplicarla para la oportunidad en curso.
  3. Agrega, elimina o modifica actividades específicas para el cliente.
  4. Ajusta roles y horas según la complejidad del brief.
  5. Esa versión ajustada se convierte en el backlog de la cotización (`QuoteDeliverable` + `QuoteBacklogItem`).
  6. **Comercial no vuelve a crear ese backlog**: consume directamente la sumatoria y horas resultantes para completar la calculadora y propuesta económica.
* **Evolución continua**: La biblioteca permite a Producto guardar nuevas plantillas reutilizables a partir de proyectos exitosos o nuevos servicios.

---

### DECISIÓN 2 — Una oportunidad puede tener múltiples cotizaciones simultáneas
* **No hay suposición de Quote única**: Una oportunidad (`NewBusinessOpportunity`) puede albergar simultáneamente múltiples cotizaciones (`QuoteProposal[]`).
  * *Ejemplo real*:
    * Cotización A: *Landing Page* (status: `approved`)
    * Cotización B: *Pauta Digital* (status: `approved`)
    * Cotización C: *Creativos para pauta* (status: `rejected`)
* **Autonomía por cotización**: Cada cotización tiene de forma independiente:
  * Su propio estado (`draft`, `internal_review`, `sent`, `approved`, `rejected`, `archived`).
  * Sus propios entregables y backlog.
  * Su propia suma de horas y desglose de roles.
  * Su etiqueta de versión (`versionLabel`).
  * Su registro de aprobación o rechazo con notas.
* **Aprobación selectiva y conversión**:
  * El cliente puede aprobar unas cotizaciones y rechazar otras.
  * **Solo las cotizaciones aprobadas (`approvedQuotes[]`)** se convierten en estructura operativa del proyecto.
  * Las cotizaciones rechazadas o descartadas **permanecen congeladas en el historial comercial** de la oportunidad para análisis y métricas de tasa de cierre (win/loss).
  * **Múltiples cotizaciones aprobadas se consolidan dentro de un mismo `ProjectProfile`** si corresponden al mismo negocio y cliente, agrupando los entregables de cada una en el proyecto operativo.
  * **Flujo estructural**:
    $$\text{Opportunity} \longrightarrow \text{Quote[]} \longrightarrow \text{approvedQuotes[]} \longrightarrow \text{Project}$$

---

### DECISIÓN 3 — El cliente puede iniciar operación sin NIT definitivo
* **Inicio operativo inmediato**: La información fiscal o tributaria formal (RUT, NIT, cámara de comercio) **nunca debe bloquear el inicio del trabajo del equipo**.
* **Secuencia de negocio**:
  1. Al marcar la oportunidad como ganada (o parcialmente ganada con cotizaciones aprobadas), se crea o vincula de inmediato el `ClientProfile` y el `ProjectProfile`.
  2. Se generan los entregables y las tareas en estado *To Do* listas para ser ejecutadas.
  3. El equipo técnico puede iniciar sprint, discovery y diseño sin retrasos burocráticos.
  4. Posteriormente, el área de Administración y Finanzas recopila los documentos tributarios, crea la entidad fiscal (`ClientTaxEntity`) y realiza la sincronización con **Alegra**.
* **Regla estricta de validación**:
  * El NIT y la entidad tributaria son **obligatorios antes del flujo de facturación electrónica y sincronización fiscal**, pero **no son requisito previo ni bloqueante para crear el proyecto e iniciar tareas en Orbit**.

---

### DECISIÓN 4 — Las horas de preventa son internas y no se trasladan al proyecto vendido
* **Horas de Uhura Group**: Todas las horas que el equipo invierte investigando, dimensionando y armando propuestas pertenecen a Uhura Group como costo operativo de preventa / adquisición.
* **Registro contable obligatorio**:
  * **Cliente**: `UHURA Group` (ID interno protegido).
  * **Proyecto**: `New Business` (o ID específico de la oportunidad en preventa).
* **Actividades internas tipificadas**:
  * *Discovery operativo*.
  * *Research de mercado / benchmark*.
  * *Arquitectura de solución*.
  * *Construcción y dimensionamiento de backlog*.
  * *Estimación de horas y roles*.
  * *Preparación de propuesta / presentación*.
  * *Revisión interna y comités técnicos*.
* **Aislamiento financiero**:
  * Cuando el negocio se gana, **estas horas de preventa NO se trasladan ni se descuentan del proyecto vendido**.
  * El proyecto vendido nace con su bolsa de horas presupuestadas (`soldHours`) limpia y dedicada al 100% a la ejecución de los entregables aprobados por el cliente.

---

### DECISIÓN 5 — Asignación de personas al convertir cotizaciones a tareas
* **Conservación de atributos clave**: Al transformarse cada `QuoteBacklogItem` en una tarea viva (`TaskItem`), debe conservar estrictamente:
  * `projectId`: ID del nuevo proyecto generado.
  * `deliverableId`: ID del entregable generado al que pertenece.
  * `budgetedRoleId`: ID del rol cotizado en la plantilla/estimación.
  * `budgetedRole`: Nombre del rol presupuestado.
  * `estimatedHours`: Horas cotizadas de la actividad.
  * `title`: Nombre de la actividad.
  * `description`: Alcance y notas técnicas.
  * `dependencies`: Precedencias y dependencias entre tareas.
  * `dueDate`: Fecha límite si fue delimitada en la propuesta.
* **Prohibición de autoasignación al Lead**:
  * **No se asigna automáticamente al Product Lead ni al creador de la cotización**.
  * Por defecto: `assigneeAllocations = []`.
  * La tarea nace sin ejecutor asignado (*Unassigned*) para que el líder planifique las personas reales utilizando la **Matriz de Asignaciones (`ProjectAssignment`) y la Vista de Capacidad (`CapacityView`)**, considerando la disponibilidad real y sin asumir jornadas de 8 horas estandarizadas.
  * *Excepción controlada*: Solo si durante la cotización previa existió un acuerdo explícito sobre una persona específica (`suggestedUserId`), Orbit puede sugerir esa preasignación, pero **siempre requiere confirmación expresa** del líder antes de aplicarse.

---

## 2. Frontera funcional propuesta entre sistemas

Orbit se integra armónicamente en el stack tecnológico de Uhura Group delimitando con nitidez las responsabilidades de cada plataforma:

```
┌────────────────────────────────┐    ┌────────────────────────────────┐    ┌────────────────────────────────┐
│            HUBSPOT             │    │             ORBIT              │    │             ALEGRA             │
│        (CRM Comercial)         │    │   (Ingeniería & Operaciones)   │    │      (Fiscal & Contable)       │
├────────────────────────────────┤    ├────────────────────────────────┤    ├────────────────────────────────┤
│ • Leads, MQL, SQL              │    │ • Discovery operativo & brief  │    │ • Razón Social Oficial         │
│ • Deals de ventas              │    │ • Plantillas maestras Producto │    │ • NIT y RUT certificado        │
│ • Pipeline y etapas comerciales│    │ • Backlog técnico granular     │    │ • Facturación electrónica DIAN │
│ • Actividades de closers       │───>│ • Desglose por roles y horas   │───>│ • Recibos de caja y cobranza   │
│   (llamadas, correos, citas)   │    │ • Múltiples cotizaciones       │    │ • Retenciones e impuestos      │
│ • Probabilidad de cierre       │    │ • Aprobación y conversión      │    │                                │
│                                │    │ • Proyectos, entregables y task│    │                                │
│ [Hook: hubspotDealId]          │    │ • Time Tracking inmutable      │    │ [Hook: alegraContactId]        │
└────────────────────────────────┘    └────────────────────────────────┘    └────────────────────────────────┘
```

1. **HubSpot (CRM Comercial)**:
   * Administra la prospección, el contacto inicial, las etapas del funnel comercial y las llamadas/reuniones de venta.
   * *Hook en Orbit*: `hubspotDealId` en la oportunidad de New Business.

2. **Orbit (Ingeniería de Propuesta, Backlog y Operación)**:
   * Administra el levantamiento técnico, la selección/personalización de plantillas maestras de Producto, la calculadora de horas por rol, las cotizaciones multiversión, la conversión transaccional a proyectos y la ejecución diaria del equipo con Time Tracking.

3. **Alegra (Fiscal y Contabilidad)**:
   * Administra la emisión legal de la factura electrónica DIAN, la validación del NIT, los pagos recibidos y la cartera contable.
   * *Hook en Orbit*: `alegraContactId` en `ClientTaxEntity` y `alegraContractId` en `ProjectProfile`.

---

## 3. Modelo de Datos y Entidades

### Diagrama de Relaciones

$$\text{ProductBacklogTemplate} \xrightarrow{\text{duplicar / instanciar}} \text{QuoteProposal}$$

$$\text{NewBusinessOpportunity} \begin{cases}
  \text{prospectAccountName} \lor \text{clientId} \\
  \text{hubspotDealId} \\
  \text{discoveryNotes} \\
  \text{preventaTimeLogTaskId (Client: Uhura Group, Project: New Business)} \\
  \text{quotes: QuoteProposal[]} \begin{cases}
    \text{Quote A (status: 'approved')} \searrow \\
    \text{Quote B (status: 'approved')} \longrightarrow \textbf{ProjectProfile} \longrightarrow \begin{cases}
      \text{ProjectDeliverable[]} \\
      \text{TaskItem[] (assigneeAllocations: [])} \\
      \text{approvedQuoteSnapshots[]}
    \end{cases} \\
    \text{Quote C (status: 'rejected')} \longrightarrow \text{Histórico Comercial}
  \end{cases}
\end{cases}$$

### Resumen de Entidades Principales

| Entidad | Propósito | Relaciones Principales |
| :--- | :--- | :--- |
| `ProductBacklogTemplate` | Plantilla maestra de backlog mantenida por Producto. Reutilizable para WordPress, Landing, Ecommerce, etc. | `deliverables[]`, `category`, `isReusable`. |
| `TemplateDeliverable` | Entregable marco dentro de la plantilla maestra. | `templateId`, `roleBudgets[]`, `activities[]`. |
| `TemplateBacklogItem` | Actividad técnica estimada en la plantilla maestra. | `templateDeliverableId`, `roleId`, `estimatedHours`, `dependencies[]`. |
| `NewBusinessOpportunity` | Representa la oportunidad de negocio comercial/operativa. | `clientId` (opcional), `prospectAccountName`, `quotes[]`, `hubspotDealId`. |
| `QuoteProposal` | Alternativa o cotización formulada para esa oportunidad. | `opportunityId`, `templateId`, `deliverables[]`, `status`, `totalHoursRollup`. |
| `QuoteDeliverable` | Entregable presupuestado en la cotización. | `quoteId`, `roleBudgets[]`, `backlogItems[]`. |
| `QuoteRoleBudget` | Bolsa presupuestada de horas por rol para ese entregable. | `quoteDeliverableId`, `roleId`, `quotedHours`. |
| `QuoteBacklogItem` | Tarea técnica cotizada (futuro `TaskItem`). | `quoteDeliverableId`, `roleId`, `estimatedHours`, `suggestedUserId`. |
| `QuoteProposalSnapshot` | Copia inmutable congelada en el instante exacto de la aprobación. | `quoteId`, `projectId`, `frozenData`, `approvedAt`, `approvedByUserId`. |

---

## 4. Ciclo de Vida de la Oportunidad (`OpportunityStatus`)

```
  [ discovery ] (Brief, dolor del cliente, objetivos)
        │
        ▼
   [ quoting ] (Selección de plantilla Producto, ajuste de backlog y horas)
        │
        ▼
[ internal_review ] (Aprobación técnica/operativa entre Líder y Dirección)
        │
        ▼
 [ proposal_sent ] (Propuesta presentada formalmente al cliente)
        │
        ├─────────────────────────────────┐
        ▼                                 ▼
  [ negotiation ]                    [ lost ] (Motivo documentado: precio, tiempo, competidor)
  (Ajustes de alcance/versiones)          │
        │                                 ▼
        ├──────────────────────────> [ archived ] (Pausada o descartada)
        ▼
   [ won / partial_won ]
   • Aprobación de cotizaciones específicas.
   • Congelamiento de snapshots inmutables.
   • Creación transaccional e idempotente de ClientProfile (sin NIT bloqueante) y ProjectProfile.
   • Generación de entregables y tareas vivas con assigneeAllocations = [].
   • Redirección a la Matriz de Capacidad.
```

---

## 5. Reglas de Idempotencia y Prevención de Duplicados

1. **Bandera `convertedProjectId`**: Tanto en `NewBusinessOpportunity` como en cada `QuoteProposal` se almacena `convertedProjectId: string | null`.
2. **Bloqueo de Reintentos**: Si una cotización aprobada ya tiene `convertedProjectId` asignado, el sistema bloquea una segunda ejecución y muestra el enlace directo al proyecto creado.
3. **Inmutabilidad Post-Conversión**: Una vez aprobada y convertida, la cotización pasa a modo de **Solo Lectura**. Cualquier cambio de alcance futuro durante el desarrollo del proyecto se gestiona como un *Adicional / Control de Cambios* en el proyecto vivo, protegiendo la auditoría de la cotización original.
