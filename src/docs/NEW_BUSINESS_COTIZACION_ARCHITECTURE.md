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

---

## 6. Propuesta de MVP: Calculadora Comercial UHURA en Orbit

A partir del análisis detallado de las hojas de trabajo de la **Calculadora Comercial UHURA 2026 (V.11/05/2026)** plasmada en las capturas oficiales, se define el diseño del **MVP de la Calculadora Comercial** integrado en New Business de Orbit.

### 6.1. Alcance Funcional del MVP (Fase 1)

El MVP traduce las 8 hojas del Excel en un flujo digital unificado dentro de cada cotización (`QuoteProposal`), garantizando rigor financiero sin sobrecargar a los líderes de proyecto:

1. **Parámetros Globales del Negocio (Configurables en Ajustes / Settings):**
   * **Tarifa Semanal de Gastos Fijos (Overhead Base UHURA)**: Costo semanal en COP de la operación fija de la agencia (arriendos, herramientas SaaS, salarios de estructura).
   * **Factores Laborales Colombia**:
     * Factor prestacional ordinario: `47%` (por defecto).
     * Factor prestacional integral: `25%` (por defecto).
     * Base de horas laborales mes: `176 h/mes`.
   * **Monedas y Tasas de Cambio**: COP (base), USD, MXN, BRL, INR con actualización de TRM.

2. **Dimensionamiento en la Cotización (Proyecto / Deal):**
   * **Tiempo estimado del proyecto en semanas** ($S$).
   * **% de Ocupación de Overhead asignado al proyecto** ($O\%$).
   * **Cálculo automático del Costo Overhead del Proyecto**:
     $$\text{Costo Overhead} = \text{Tarifa Semanal Gastos Fijos} \times S \times O\%$$
   * **Margen Deseado ($M\%$)**: Por defecto 40% (con cálculo de margen mínimo 35% y margen máximo 50% para bandas de negociación).

3. **Cálculo de Costos Variables de Recursos (Rol o Persona):**
   * Cada recurso asignado a las actividades/entregables suma sus horas:
     * **Modalidad Freelance**: Costo hora directo pactado.
     * **Modalidad Salario Interno**: (Salario Base mensual $\times (1 + \text{Factor Prestacional})$) / 176 h.
   * La suma de horas $\times$ costo hora genera el **Costo Variable Directo** del proyecto.
   * **Total Costos del Proyecto**:
     $$\text{Total Costos} = \text{Costo Variable Directo} + \text{Costo Overhead Asignado}$$

4. **Tratamiento Tributario e IVA Diferenciado (19% Colombia):**
   * En proyectos digitales/tecnológicos, la ley colombiana exime de IVA a servicios de desarrollo de software y páginas web, mientras otros servicios creativos/estratégicos son gravados.
   * El MVP permite etiquetar cada entregable o recurso como:
     * **Exento de IVA**
     * **Gravado con IVA (19%)**
   * La calculadora calcula el subtotal de venta antes de IVA y aplica el 19% **exclusivamente sobre la base gravada**:
     $$\text{IVA 19\%} = \text{Valor Base Gravado} \times 19\%$$
     $$\text{Precio Total a Cotizar} = \text{SubTotal (Exento + Gravado)} + \text{IVA 19\%}$$

5. **Modalidades de Cotización (Selector de Tipo):**
   * **Modo A — Proyecto por Entregables**: Semanas de duración, % overhead y backlog por entregables.
   * **Modo B — Bolsa de Horas / Tarifario Horario Directo**: Cotización ágil por horas vendidas con tarifa plena por rol (según Hoja 8 de la calculadora, ej. Front-End a $570.608/h, Product Lead a $599.601/h, etc.).

---

### 6.2. Puntos Clave y Dudas a Abordar en la Reunión

Para llevar a la mesa de discusión con el equipo y alinear criterios antes del despliegue final:

| # | Tema / Pregunta | Opciones a Evaluar | Recomendación Técnica |
|---|---|---|---|
| **D1** | **¿A qué nivel se define si es Exento o Gravado de IVA?** | **Opción A:** A nivel del **Entregable** (ej. "Desarrollo Front-End Web" = Exento, "Estrategia Creativa / Pauta" = Gravado).<br>**Opción B:** A nivel del **Rol** del catálogo (ej. Desarrollador siempre exento, Trafficker gravado). | **Opción A (Entregable)**: Ofrece mayor flexibilidad contable y coincide con cómo la DIAN audita los objetos contractuales. |
| **D2** | **Carga del Overhead Fijo de la Compañía** | **Opción A:** Configurar una **Tarifa Semanal Fija de UHURA** en Ajustes de Orbit, y que en la cotización el líder solo ingrese las *semanas* y el *% de ocupación* (idéntico al Excel).<br>**Opción B:** Permitir ingresar el monto directo de Overhead por proyecto. | **Opción A con override**: Calcula automáticamente con la fórmula del Excel, pero permite a la Dirección Comercial ajustar el monto si es necesario. |
| **D3** | **Tarifario Horario Directo (Hoja 8)** | ¿El tarifario por hora de venta directa (ej. $570.608/h) debe actualizarse automáticamente cuando cambien los salarios base y el overhead, o es una lista de precios comercial fija aprobada por gerencia anualmente? | Mantener una **Lista de Precios Base** editable por Dirección, con simulación de margen real sobre costo subyacente. |
| **D4** | **Bandas de Descuento y Aprobación Comercial** | La calculadora contempla *Margen Máximo (50%)*, *Margen Esperado (40%)* y *Margen Mínimo (35%)*, arrojando un descuento nominal y porcentual. ¿Si una cotización baja del margen mínimo del 35%, debe requerir un flujo de aprobación de la Dirección General antes de enviarse? | Sí, agregar una alerta visual o candado de "Requiere Visto Bueno de Dirección" si el margen proyectado es menor al 35%. |
| **D5** | **Integración de Tarifas Iniciales** | ¿Desean precargar en el catálogo de Orbit las 12 tarifas de recursos de la captura (Front-End, Product Lead, Digital Designer, Client Relationship Strategist, Content Creator, Directora Comercial, DigiOps, etc.) con sus costos internos y precios hora de venta? | Sí, precargar los 12 perfiles para que el cotizador sea utilizable de inmediato sin configuración manual extensa. |
