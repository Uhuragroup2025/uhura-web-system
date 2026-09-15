# Orbit — Estado de Producto y Decisiones Vigentes

> **Fecha de corte:** 15 de septiembre de 2026  
> **Producto:** Orbit — sistema operativo interno de Uhura Group  
> **Estado:** Prototipo funcional avanzado / preparación para integración con backend  
> **Última referencia funcional revisada:** `df3a71c` — `feat(orbit): add product templates and refine Orbit UX`

---

## 1. Qué es Orbit

Orbit es el sistema operativo interno de Uhura Group para conectar la operación diaria, la capacidad del equipo, el control de horas, los proyectos y la ingeniería de propuestas comerciales.

El objetivo no es replicar toda la complejidad de COR ni convertir Orbit en un CRM o ERP. El producto debe reducir fricción y mantener una única trazabilidad desde la propuesta hasta la ejecución.

Flujo objetivo:

```text
New Business
  → Plantilla de Producto
  → Backlog y horas por rol
  → Cotización(es)
  → Aprobación parcial o total
  → Cliente
  → Proyecto
  → Entregables
  → Tareas
  → Asignación por capacidad
  → Time Logs
  → Rollups operativos
```

---

## 2. Frontera entre sistemas

La arquitectura funcional separa responsabilidades:

- **HubSpot** administra la relación comercial: lead, deal, pipeline, seguimiento, llamadas, correos y probabilidad de cierre.
- **Orbit** administra la ingeniería de la propuesta y la operación: discovery técnico, plantillas de Producto, backlog, horas por rol, cotizaciones, aprobación, conversión a proyecto, tareas, capacidad y ejecución.
- **Alegra** administra la realidad fiscal y contable: entidad legal, NIT/RUT, facturación y cartera.

Regla de producto:

> **HubSpot administra la relación comercial; Orbit administra la ingeniería de la propuesta y su conversión a operación; Alegra administra la realidad fiscal y financiera.**

---

## 3. Modelo operativo canónico

Jerarquía principal:

```text
Cliente
  → Proyecto
    → Entregable (opcional)
    → Fase (opcional)
      → Tarea
        → Time Log
```

### Cliente

`ClientProfile` funciona como cuenta operativa o marca sombrilla.

- Un cliente puede existir sin NIT definitivo.
- Puede tener 0..N entidades fiscales (`ClientTaxEntity`).
- Puede tener 0..N contactos (`ClientContact`).
- El NIT es obligatorio antes de facturación/sincronización fiscal, no antes de iniciar operación.
- `UHURA Group` existe como cliente interno protegido.

### Proyecto

Tipos vigentes:

- `fee_monthly`
- `fixed_project`
- `internal_non_billable`

Las horas cotizadas viven en `DeliverableRoleBudget.quotedHours`. Las horas reales se derivan de `TimeLog`.

En fees mensuales no se destruye histórico al cambiar de mes: se manejan ciclos mensuales.

### Entregables

El término funcional vigente es **Entregable**, no “Frente”.

Un entregable agrupa:

- bolsa de horas por rol;
- tareas;
- horas cotizadas;
- horas ejecutadas;
- avance operativo.

### Equipo y asignaciones

La fuente de verdad es `ProjectAssignment`.

- Una persona puede tener múltiples roles/asignaciones en el mismo proyecto.
- Naturalezas: `governance`, `core_execution`, `temporary_support`.
- `AllocationPeriod.weeklyHours` expresa carga planificada por ventana temporal.
- Los stakeholders/seguidores tienen visibilidad, pero no consumen capacidad.
- Un líder puede coordinar y ejecutar.

---

## 4. Tareas

La tarea es la unidad atómica del MVP.

- No hay subtareas en el MVP.
- Puede pertenecer a un `deliverableId`.
- Conserva `budgetedRoleId` para comparar lo cotizado con la ejecución.
- Puede tener uno o varios ejecutores mediante `assigneeAllocations`.
- Estados canónicos: `todo → in_progress → in_review → completed`.
- `in_review` aplica cuando la tarea requiere revisión.
- Bloqueo es un flag (`isBlocked`), no un estado.
- Retrabajos se trazan explícitamente.
- El exceso de horas genera alerta, no recotización automática.

Al convertir una cotización a proyecto, las tareas nacen por defecto sin persona asignada:

```ts
assigneeAllocations = []
```

La persona real se asigna después, usando capacidad. No se autoasigna al Product Lead ni al creador de la cotización.

---

## 5. Time Tracking y capacidad

### Time Tracking

Reglas de producto vigentes:

- Todo `TimeLog` pertenece a una **Tarea**.
- Existe un solo timer activo por usuario.
- Flujo canónico: **Start / Stop**.
- No se debe trasladar silenciosamente un timer activo a otra tarea.
- Si el usuario intenta iniciar otro timer debe resolver explícitamente el timer actual.
- Registro manual: Tarea, Horas, Minutos, Descripción y Fecha.
- Soporte ad-hoc de una persona no asignada puede registrarse en una tarea real, sin modificar automáticamente las asignaciones del proyecto.
- Trabajo de fin de semana puede registrarse como ejecución real, pero no debe convertirse automáticamente en disponibilidad esperada.

### Capacidad

No existe una jornada universal de 8 horas como KPI.

```text
Capacidad disponible = disponibilidad configurada - carga planificada
```

La disponibilidad se configura por persona/período. Una referencia de 40h semanales puede existir como default para tiempo completo, pero no como constante de negocio.

Orbit debe diferenciar:

- disponibilidad configurada;
- carga planificada;
- ejecución real;
- capacidad libre.

La experiencia no debe premiar sobretrabajo.

---

## 6. Home contextual / Mi Día

La dirección UX vigente elimina la competencia entre “Dashboard” y “Mi Día”.

**Mi Día es el Home contextual de Orbit.**

La perspectiva cambia según permisos y responsabilidad:

- Colaborador: **Mi Trabajo**.
- Líder: **Mi Trabajo | Mi Equipo**.
- Comercial: **Mi Trabajo | Mis Cuentas**.
- Dirección: **Mi Trabajo | Pulso Uhura**.
- Perfiles híbridos pueden tener más de una perspectiva.

La pantalla personal debe priorizar:

- tareas de hoy;
- retrabajos/alertas accionables;
- próximos vencimientos;
- horas planificadas vs. registradas;
- trabajo planificado restante;
- acceso rápido a registrar tiempo;
- carga semanal.

Copy recomendado: **“3h de trabajo planificado restante”**, no “te faltan 3h para completar el día”.

---

## 7. Navegación vigente

La navegación se reorganiza por contexto:

### Operación

- Mi Día
- Proyectos
- Tareas
- Horas
- Capacidad

### Comercial / Ingeniería de propuesta

- Clientes
- New Business
- Cotizador
- Plantillas de Producto

`New Business` es el nombre preferido dentro de Orbit. No debe presentarse como un pipeline CRM paralelo a HubSpot.

Las finanzas operativas no deben tener todavía el mismo peso funcional que los módulos maduros mientras la lógica financiera esté pendiente de migración.

### Experiencia

- La Colonia

### Sistema / Administración

- usuarios;
- roles;
- permisos;
- configuraciones según RBAC.

---

## 8. New Business y cotizaciones

Entidad principal: `NewBusinessOpportunity`.

Una oportunidad puede tener varias cotizaciones (`QuoteProposal[]`) y cada una puede aprobarse o rechazarse de forma independiente.

Ejemplo:

```text
Oportunidad X
  ├─ Landing Page → approved
  ├─ Pauta Digital → approved
  └─ Creativos → rejected
```

Solo las cotizaciones aprobadas se convierten en estructura operativa. Varias cotizaciones aprobadas pueden consolidarse en un mismo proyecto cuando pertenecen al mismo negocio.

Las horas de preventa no migran al proyecto vendido. Se registran internamente bajo:

```text
Cliente: UHURA Group
Proyecto: New Business
```

Actividades típicas de preventa:

- Discovery;
- Research;
- Arquitectura;
- Backlog;
- Estimación;
- Preparación de propuesta;
- Revisión interna.

---

## 9. Biblioteca de Plantillas de Producto

La biblioteca de `ProductBacklogTemplate` está implementada como base funcional.

Gobernanza: **Producto**.

Cada plantilla contiene:

- entregables;
- actividades;
- rol cotizado;
- horas estimadas;
- orden;
- dependencias cuando aplica;
- rollup por rol;
- rollup total.

Estados:

- `draft`
- `active`
- `archived`

Acciones previstas/implementadas en prototipo:

- crear;
- editar;
- duplicar;
- inspeccionar;
- eliminar;
- clonar hacia una cotización.

Una cotización es un **snapshot independiente** de la plantilla. Editar o eliminar la plantilla maestra después no debe alterar cotizaciones ya creadas.

### Categorías actuales del prototipo

- Sitio WordPress hasta **8 páginas internas**.
- Mantenimiento Web.
- Landing Page.
- Tienda Online hasta **20 SKUs simples / 10 variables**.
- Shopify Store.
- Portal / Plataforma.
- Proyecto a la Medida.

> Los backlogs y horas de ejemplo todavía son placeholders hasta incorporar los backlogs maestros reales de Uhura.

### Roles

Las plantillas deben consumir únicamente el catálogo oficial `STANDARD_UHURA_ROLES / RoleDefinition`. No se deben inventar roles para completar ejemplos.

---

## 10. Cotizador / calculadora comercial

La capa funcional de horas está preparada mediante `CommercialCalculatorContract`.

Estado actual:

```text
status = pending_sheets_formula
```

Decisión vigente para esta fase:

- Orbit sí debe recibir horas por rol desde el backlog.
- Orbit sí puede diseñar la UX del Cotizador.
- Orbit **no debe inventar** tarifas, salarios, overhead, markup, margen ni fórmulas financieras.
- La lógica financiera maestra sigue en Google Sheets y queda como deuda de integración/migración.

Objetivo MVP operativo:

> **Que las horas que se cotizaron sean comparables con las horas que realmente se ejecutaron.**

---

## 11. Bucky y La Colonia

Bucky es el copiloto de Orbit. La Colonia es la experiencia opcional de gamificación.

Principios:

- Bucky no debe competir visualmente con el trabajo.
- Solo debe existir un Bucky visible por pantalla.
- En La Colonia, el widget externo de Bucky se oculta porque Bucky ya vive dentro del diorama.
- El widget operativo debe ser compacto.
- Con timer activo puede mostrar tarea y tiempo transcurrido.
- “Base” y “Pasear libre” no pertenecen a la operación; la exploración/juego vive dentro de La Colonia.
- La gamificación premia registro claro, cierres limpios, prevención y hábitos sanos; nunca sobretrabajo.

La Colonia mantiene:

- diorama;
- personalización;
- recursos/progresión;
- microjuegos;
- free roam dentro del contexto de La Colonia.

---

## 12. Integración backend

El backend productivo es responsabilidad de Indunova y está basado en Django REST Framework con PostgreSQL administrado.

La integración frontend/backend debe evitar duplicar reglas críticas en UI.

En particular:

- capacidad debe consumir disponibilidad/carga desde backend;
- riesgos deben consumir eventos/resultado del motor de riesgo;
- Alegra debe permanecer como integración fiscal;
- HubSpot debe integrarse como CRM, no ser replicado en Orbit.

---

## 13. Estado actual por módulo

| Módulo | Estado de producto | Nota |
|---|---|---|
| Clientes | MVP funcional definido | Cliente operativo separado de entidad fiscal |
| Proyectos | MVP funcional definido | Entregables + roles + ciclos de fee |
| Equipo / asignaciones | MVP funcional definido | Multirol + ventanas de capacidad |
| Tareas | MVP funcional definido | Atómicas, multi-ejecutor, revisión condicional |
| Time Tracking | Funcional, requiere cierre de inconsistencias UX | Regla canónica Start/Stop |
| Capacidad | Modelo funcional definido | Sin KPI universal de 8h |
| Mi Día / Home | Refactor UX en curso | Home contextual por rol |
| Bucky | Refactor UX en curso | Compacto, no invasivo |
| La Colonia | Prototipo avanzado | Experiencia opcional |
| New Business | Modelo funcional implementado | Múltiples cotizaciones |
| Plantillas Producto | Base funcional implementada | Backlogs reales pendientes |
| Cotizador | Contrato preparado | Fórmula financiera pendiente |
| HubSpot | Hook/modelo preparado | Integración operativa pendiente |
| Alegra | Frontera/modelo definido | Integración productiva backend |

---

## 14. Inconsistencias conocidas a corregir antes del freeze

La documentación refleja la **decisión de producto**, incluso cuando el prototipo todavía tenga deuda técnica.

1. **Timer:** la regla aprobada es Start/Stop. Cualquier control de Pause/Resume que permanezca en el prototipo debe retirarse o dejarse solo como compatibilidad técnica no visible.
2. **Riesgos:** Bucky no debe calcular riesgos con heurísticas hardcoded en frontend. Debe consumir un evento/estado de riesgo proveniente del core/backend.
3. **Catálogo de roles:** revisar plantillas demo para garantizar que todos los `roleId` pertenecen al catálogo oficial de Uhura.
4. **Plantillas demo:** reemplazar horas y actividades placeholder por backlogs maestros validados por Producto.
5. **Build:** actualmente `npm run build` ejecuta `vite build`; `npm run typecheck` ejecuta `tsc -b`. Antes del freeze técnico se debe decidir si el typecheck vuelve a ser gate obligatorio dentro del build de CI/CD.

---

## 15. Próximos pasos recomendados

1. Cerrar el refactor de Home contextual y Bucky respetando las reglas canónicas.
2. Limpiar roles no oficiales dentro de las plantillas demo.
3. Incorporar backlogs maestros reales de Producto.
4. Diseñar la UX del Cotizador sin migrar todavía fórmulas financieras no confirmadas.
5. Mapear contratos frontend ↔ API de Indunova para Clientes, Proyectos, Tareas, Time Logs, Capacidad y Riesgos.
6. Definir trigger y ownership exactos de HubSpot → Orbit y Orbit → Alegra.
7. Restaurar/definir el gate de typecheck para producción.
8. Ejecutar QA end-to-end del flujo: cotización aprobada → proyecto → tareas → asignación → tiempo → rollups.

---

## 16. Documentos relacionados

- [`NEW_BUSINESS_COTIZACION_ARCHITECTURE.md`](./NEW_BUSINESS_COTIZACION_ARCHITECTURE.md) — arquitectura detallada de New Business y cotización.
- [`../components/taskflow/types.ts`](../components/taskflow/types.ts) — contratos y tipos del prototipo.
- [`../../ai-context.md`](../../ai-context.md) — contexto de marca y Design System.
- [`../../design-system/`](../../design-system/) — documentación del Design System.

---

**Criterio de fuente de verdad:** si una pantalla demo contradice una regla de este documento, prevalece la decisión de producto aquí documentada hasta que el prototipo sea alineado.