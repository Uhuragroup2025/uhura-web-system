# Requerimientos de Backend y Modelo de Datos (Orbit)

> **Documento de Especificación Técnica para Futura Implementación Backend**  
> Este documento consolida las deudas técnicas, relaciones inmutables y reglas de producto identificadas en el QA de **Proyectos y Tareas** antes de la conexión con los módulos de **Clientes, Finanzas, Cotizador, Capacidad y Dashboard**.

---

## 1. Modelo de Jerarquía y Taxonomía Limpia

Orbit adopta una jerarquía conceptual directa y sin sobrecarga taxonómica:

$$\text{Cliente} \longrightarrow \text{Proyecto} \longrightarrow \text{Frente / Fase (Opcionales)} \longrightarrow \text{Tarea} \longrightarrow \text{TimeLog (Horas inmutables)}$$

### Definición de Dimensiones:
* **Frente (`frente`):** Dimensión de trabajo, disciplina o entregable (e.g. *Diseño*, *Desarrollo Web*, *Pauta*, *Parrilla de Redes*). Representa **qué se hace**.
* **Fase (`phase` / `fase`):** Dimensión temporal o etapa secuencial del proyecto (e.g. *Descubrimiento*, *Diseño UX*, *Implementación*, *Lanzamiento*). Representa **cuándo se hace**. Las fases pueden solaparse.
* **Opcionalidad según Metodología:**
  * **Fee Mensual:** `Proyecto → Frente → Tarea`
  * **Proyecto Cerrado Simple:** `Proyecto → Frente → Tarea`
  * **Proyecto Cerrado Complejo / Cascada:** `Proyecto → Fase + Frente → Tarea`

---

## 2. Inmutabilidad y Snapshots en el Registro de Horas (`TimeLog`)

El modelo `TimeLog` en base de datos no debe depender de referencias dinámicas que puedan mutar en el tiempo (como cambios de tarifa del usuario o renombramiento de cargos). Cada registro de tiempo debe ser un snapshot contable inmutable:

```typescript
interface TimeLogBackendRecord {
  id: string;                      // UUID inmutable
  taskId: string;                  // Llave foránea a la tarea
  projectId: string;               // Llave foránea directa al proyecto
  clientId: string;                // Llave foránea directa al cliente
  userId: string;                  // Identificador del usuario que ejecutó
  userNameSnapshot: string;        // Nombre al momento de la ejecución
  userRoleSnapshot: string;        // Rol del usuario al momento de la ejecución (e.g. 'Web Designer')
  hourlyCostSnapshotCOP: number;   // Costo hora real del usuario en esa fecha
  frenteNameSnapshot?: string;     // Frente imputado
  faseNameSnapshot?: string;       // Fase imputada (si aplica)
  durationSeconds: number;         // Duración registrada en segundos
  loggedDate: string;              // Fecha ISO (YYYY-MM-DD) del trabajo realizado
  startTime?: string;              // Hora inicio (HH:MM)
  endTime?: string;                // Hora fin (HH:MM)
  note: string;                    // Descripción de actividades
  deliverableUrl?: string;         // Enlace de entrega (opcional)
  reworkRoundId?: string;          // Si el tiempo corresponde a una ronda de reproceso
  createdAt: string;               // Timestamp de creación
}
```

---

## 3. Desacople de Entidades (`board` vs `projectId`)

* **Eliminación de `board`:** Actualmente en el prototipo coexisten `board` y `projectName` como strings libres. En backend, la tarea debe asociarse estrictamente con `projectId: UUID` y `clientId: UUID`.
* **Integridad Referencial:**
  * El cambio de nombre de un cliente o proyecto no debe romper las consultas de tareas ni los históricos de rentabilidad.
  * Finanzas y Cotizador consultarán el progreso consolidando por `projectId`.

---

## 4. Matriz Financiera: Horas Cotizadas vs. Horas Asignadas

* **Proyecto:** Define la bolsa total de horas vendidas (`soldHours`) y valor de venta (`soldValueCOP`).
* **Cotizador:** Genera la matriz de horas por rol cotizado (`budgetedRolesBreakdown`: e.g. 40h Diseñador, 20h Copywriter, 10h Lead PM).
* **Tarea:** Consume horas contra un rol cotizado (`budgetedRole`).
* **Validación:** El backend debe emitir una advertencia o requerir autorización cuando $\sum \text{Horas Tareas} > \text{Horas Vendidas del Proyecto}$.

---

## 5. Nomenclatura Estándar de Estados de Tarea en Orbit

Para mantener consistencia en todo el ecosistema (API, UI, Notificaciones, Webhooks):

1. **`Todo` (Por hacer):** Tarea creada en backlog o asignada, aún no iniciada.
2. **`In Progress` (En proceso):** Tarea en ejecución activa por el asignatario.
3. **`Review` (En revisión):** Entregable enviado por el ejecutor a revisión interna o de cliente.
4. **`Done` (Listo):** Tarea aprobada y cerrada.
