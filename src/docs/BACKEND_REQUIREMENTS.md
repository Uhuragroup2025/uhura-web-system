# Requerimientos de Backend y Modelo de Datos (ECO)

> **Nombre del producto:** **ECO** — *Espacio de Creación y Operaciones* (antes «Orbit», renombrado en noviembre de 2026). Los identificadores técnicos (`OrbitAccessLevel`, `CanonicalOrbitAccessLevel`, nombres de archivo como `ORBIT_PRODUCT_STATUS.md`) se conservan para no romper contratos de código ni enlaces.

> **Documento de Especificación Técnica para Implementación Backend (Indunova)**
> **Fecha de Actualización:** 07 de noviembre de 2026 (Cronograma calculado al «Iniciar proyecto», rondas de ajuste editables, equipo derivado de tareas, visibilidad de tareas §15.1, arranque en producción §19, Google Chat §18, Google Calendar §20, mascota §21, acceso desde el perfil §16.1.1). Anterior: 04 de noviembre de 2026 (arquitectura 1:1:1 por servicio, ticket #132 y modo desacoplado manual)
> Este documento consolida las deudas técnicas, relaciones inmutables y reglas de producto identificadas en el QA de **Proyectos, Tareas, New Business, Cotización y Conversión a Proyectos**.

> **AVISO DE PRIVACIDAD Y GOBERNANZA:**
> La documentación pública define reglas, estructuras y comportamientos. La identidad nominal de colaboradores, correos, relaciones de reporte, calendarios individuales y crosswalk con backend se administra exclusivamente mediante **Equipo Canónico Privado**.

> **COMPONENTES EXCLUSIVOS DEL PROTOTIPO (NO VAN A PRODUCCIÓN):**
> **Principio de reconciliación con producción:** lo que ya funciona en la plataforma de producción de Indunova se conserva tal cual. Esta documentación solo pide cambios donde lo dice de forma explícita («mejora», «nuevo», «reemplaza»). Si un comportamiento descrito aquí ya existe en producción con otra regla, prevalece producción y se avisa a Uhura para decidir.
> **Antes de implementar, leer `ORBIT_PRODUCT_STATUS.md` §8.0:** lista ticket por ticket (#132–#147) qué ya está en producción y no se rehace, y qué es nuevo en esta entrega.
>
> El **«Simulador QA»** (selector flotante para cambiar de usuario y probar visibilidad por `accessLevel`) es una herramienta de desarrollo del prototipo. **No debe implementarse en producción**: allí la identidad y el `accessLevel` se obtienen únicamente de la sesión autenticada del usuario.

---

## 1. Modelo de Jerarquía y Taxonomía Limpia

ECO adopta una jerarquía conceptual directa y sin sobrecarga taxonómica:

$$\text{Cliente} \longrightarrow \text{Proyecto} \longrightarrow \text{Frente / Fase (Opcionales)} \longrightarrow \text{Tarea} \longrightarrow \text{TimeLog (Horas inmutables)}$$

### Definición de Dimensiones:
* **Servicio (`servicio`):** Dimensión de trabajo, disciplina o entregable (e.g. *Diseño*, *Desarrollo Web*, *Pauta*, *Parrilla de Redes*). Representa **qué se hace**.
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

## 5. Nomenclatura Estándar de Estados de Tarea en ECO

Para mantener consistencia en todo el ecosistema (API, UI, Notificaciones, Webhooks):

1. **`Todo` (Por hacer):** Tarea creada en backlog o asignada, aún no iniciada.
2. **`In Progress` (En proceso):** Tarea en ejecución activa por el asignatario.
3. **`Review` (En revisión):** Entregable enviado por el ejecutor a revisión interna o de cliente.
4. **`Done` (Listo):** Tarea aprobada y cerrada.

---

## 6. Gestión de Perfil de Usuario y Fotografía (`avatar_url`) — Nota para Issue #6 (Indunova)

### 6.1 Contrato del Modelo de Datos (`UserProfile` en Django)
El modelo de colaborador en Django (`UserProfile` / `User`) debe incluir el soporte de URL de avatar con capacidad nullable:
```python
# orbit_core/models.py
class UserProfile(models.Model):
    # ... otros campos existentes ...
    avatar_url = models.URLField(
        max_length=500,
        null=True,
        blank=True,
        help_text="URL pública o CDN de la fotografía de perfil del colaborador"
    )
```

### 6.2 Contrato de Serialización REST
Los endpoints de consulta (`GET /api/users/`, `GET /api/users/<id>/`, `GET /api/auth/me/`) exponen el campo serializado:
```json
{
  "id": "usr-ejemplo-001",
  "email": "colaborador@ejemplo.com",
  "first_name": "Nombre",
  "last_name": "Apellido",
  "job_title": "Product Lead",
  "official_role": "Product Lead",
  "access_level": "system_admin",
  "avatar_url": "https://storage.googleapis.com/orbit-assets/team/avatar-ejemplo.webp",
  "initials": "NA",
  "avatar_bg": "bg-[#501f92]",
  "status": "Active"
}
```

### 6.3 Definición de Almacenamiento Físico
* **Desacople Arquitectónico:** El frontend de ECO consume exclusivamente la URL suministrada por el backend y **no depende ni asume** un directorio local estático como `public/assets/team/`.
* **Proveedor de Almacenamiento:** Indunova define la infraestructura física de almacenamiento persistente (ej. Google Cloud Storage, AWS S3, MinIO o CDN dedicada).
* **Manejo de Fallbacks:**
  * Si `avatar_url` es `null`, cadena vacía o si el archivo no puede cargarse (error 404 / 500 / red), el frontend ejecuta automáticamente el fallback canónico: iniciales en texto con el fondo de color institucional (`avatarBg`).
  * En ningún caso la falta de foto debe provocar excepciones en la API ni romper la navegación del usuario.

### 6.4 Especificación para el Issue #6 de Indunova
```markdown
### [Issue #6] Soporte de Carga y Exposición de Fotografía de Perfil (avatar_url)

**Objetivo:** Permitir que los colaboradores cuenten con su fotografía de perfil persistida en backend y servida vía CDN/Storage hacia el frontend de ECO.

**Alcance Técnico para Indunova:**
1. Agregar campo `avatar_url = models.URLField(null=True, blank=True, max_length=500)` al modelo `UserProfile`.
2. Actualizar `UserProfileSerializer` para incluir `avatar_url` en respuestas de lectura y listado.
3. Habilitar endpoint para actualización de imagen:
   - Opción A: `POST /api/users/{id}/avatar/` con `multipart/form-data`.
   - Opción B: Endpoint para generación de URL pre-firmada de subida directa a bucket (GCS/S3) con callback de confirmación.
4. Validaciones de subida recomendadas:
   - Formatos permitidos: `.webp`, `.png`, `.jpg`, `.jpeg`.
   - Tamaño máximo: 2 MB.
   - Normalización: Conversión a WebP y recorte centrado 1:1 o generación de thumbnail (256x256 px).
5. Migración de datos iniciales: Si se realiza seeding, cargar las 18 imágenes del equipo en el bucket asignando sus URLs a los perfiles de `INITIAL_TEAM_SEED.md` (con `null` para perfiles sin fotografía asignada).
```

---

## 7. Soporte para Múltiples Líderes (Alcance y Proyecto) y Trazabilidad (Pendiente de Backend)

> **Estado:** Pendiente backend: soporte multi-lead (por coordinar con Indunova). En frontend, el comportamiento productivo actual mantiene:
> - En New Business: `leadUserId: UUID` como campo canónico de 1 líder de alcance, con label canónico **"Líderes de alcance"**.
> - En Proyecto: `leadUserId` / `leadName` como campo canónico de 1 líder operativo, con label canónico **"Líderes del proyecto"**.
> - En Cliente / Negocio: label canónico **"Responsable comercial"** (en New Business) y **"Responsable de cliente"** (en Proyecto/Cliente).

### 7.1 Separación Canónica de Responsabilidades
1. **Líderes de alcance (`scoping_leads`):** Preventa / scoping. Bajan requerimientos técnicos, estructuran entregables, estiman horas y participan en la propuesta técnica y handoff comercial. Puede haber 1..N líderes técnicos.
2. **Líderes del proyecto (`project_leads`):** Delivery / ejecución operativa una vez el proyecto está activo o en arranque.
3. **Responsable comercial / Responsable de cliente:** Relación de cuenta y negocio (usuarios con Access Level `commercial` o `client_relationship`). No debe confundirse ni mezclarse con el liderazgo técnico.

### 7.2 Especificación para Requerimiento Backend (Indunova)

```markdown
### [Pendiente Backend] Soporte Multi-Lead (1..N) en Oportunidades y Proyectos + Trazabilidad

**1. Oportunidades Comerciales (New Business):**
* Permitir 1..N líderes de alcance en `Opportunity`:
  * Relación Many-to-Many `scoping_leads` (o `lead_users`) o array `lead_user_ids`.
  * Mantener `lead_user_id` como clave foránea para compatibilidad con datos existentes.
* Payload esperado (POST/PATCH):
  ```json
  {
    "lead_user_id": "usr-ejemplo-001",
    "lead_user_ids": ["usr-ejemplo-001", "usr-ejemplo-002"]
  }
  ```

**2. Proyectos Operativos (ECO Projects):**
* Permitir 1..N líderes del proyecto en `Project`:
  * Relación Many-to-Many `project_leads` o array `project_lead_ids`.
  * Mantener `lead_user_id` / `lead_name` como compatibilidad con el líder principal.
* Trazabilidad de Scoping:
  * Almacenar quiénes fueron los líderes de alcance que originaron el proyecto (`scoping_lead_ids` o metadatos de conversión) para conservar historial de preventa.

**3. Directriz Crítica: Responsable Comercial / Responsable de Cliente:**
* ⚠️ **NO congelar todavía nombres técnicos nuevos** (ej. `account_manager_id` o `commercial_owner_id`).
* Primero revisar qué modelo, entidad o campo equivalente ya existe actualmente en el backend de Indunova (en la entidad de Cliente, Cuenta o Negociación) para reutilizarlo sin duplicar conceptos.
* **Estado actual de contratos en frontend:**
  * En `ClientProfile`: ya existen `accountManagerId?: string;` y `accountManagerName?: string;`.
  * En `Project` / `ProjectSummaryItem`: se expone `accountManagerName?: string;` (y opcionalmente `accountManagerId?: string;` como referencia de usuario).
  * En `Opportunity`: se conserva `commercialOwner?: string;` (mapeado desde Deals de HubSpot o colaboradores comerciales).
  * **Pendiente con backend:** Validar si Indunova persistirá una FK de usuario canónica (`account_manager_id`) en la tabla de proyectos o si continuará derivándose en runtime desde la entidad `ClientProfile`.

**4. Regla de Migración y Compatibilidad:**
* **Datos existentes:** Poblar la relación múltiple con el ID del líder único existente (`lead_user_id` -> `[lead_user_id]`).
* **Escritura retrocompatible:** Si frontend o una integración externa solo envía el ID singular, backend debe actualizar automáticamente la relación múltiple con ese único miembro.
* **Filtros Mi Día:** Consultar `Q(lead_user_id=request.user.id) | Q(scoping_leads__id=request.user.id)` para que la oportunidad y el proyecto aparezcan en el panel de todos los líderes responsables.
```

### 7.3 Flujo de Conversión New Business → Proyecto
Cuando backend exponga el soporte multi-lead:
1. **Trazabilidad heredada:** `ConvertOpportunityModal` muestra a los líderes de alcance y al responsable comercial como datos heredados de solo lectura.
2. **Propuesta operativa:** Los líderes de alcance se preseleccionan automáticamente como propuesta inicial de líderes del proyecto.
3. **Confirmación / Ajuste:** El usuario puede confirmar, quitar o agregar líderes operativos reales antes de crear el proyecto.
4. **Desacoplamiento:** El responsable comercial o de cliente se mantiene por separado y nunca forma parte del selector técnico.

---

## 8. Responsabilidad Comercial vs Responsable de Cliente (Consistencia de Contratos)

### 8.1 Responsable Comercial (`commercialOwner` en New Business)
* **Contrato actual:** `commercialOwner?: string` en la entidad `Opportunity`.
* **Derivación de UI:** El selector de la interfaz se alimenta del catálogo de usuarios de ECO con nivel/capacidad `commercial` (`OrbitAccessLevel: 'commercial'` o funciones comerciales equivalentes). Al seleccionar un usuario de la lista, el valor guardado en `commercialOwner` es el nombre canónico del usuario (`user.name`), preservando compatibilidad exacta con el contrato de persistencia actual de Indunova sin crear campos no soportados (como `commercialOwnerId`).
* **Sincronización HubSpot:** Si el Deal importado trae un owner comercial (`deal.commercialOwner`), la UI busca coincidencia con los usuarios de ECO. Si no existe mapeo unívoco, se deja en blanco para selección explícita del usuario sin suposiciones ni hardcoding.

### 8.2 Responsable de Cliente (`accountManagerId` / `accountManagerName` en Proyecto)
* **Contrato en ClientProfile:** La entidad canónica de cliente almacena `accountManagerId?: string` y `accountManagerName?: string`.
* **Herencia en Nuevo Proyecto:** Al seleccionar un cliente en el Paso 1, el proyecto prellena el Responsable de cliente a partir de dicho perfil.
* **Sincronización bidireccional en UI:** Al cambiar el selector en el formulario de proyecto:
  * Si se selecciona un usuario de la lista de colaboradores con capacidad `client_relationship`, se actualizan sincrónicamente tanto `accountManagerId` (ID del usuario) como `accountManagerName` (nombre del usuario).
  * Si el cliente original tenía únicamente `accountManagerName` sin ID mapeado en runtime, se conserva dicho nombre como valor compatible.
  * Se evita en todo momento cualquier discrepancia o desincronización donde el ID corresponda a un colaborador y el nombre a otro.
* **Nota para Backend Indunova:** Actualmente la entidad `Project` en backend persiste principalmente `accountManagerName` o la relación del cliente. Mantener `accountManagerId` como referencia transitoria compatible en frontend hasta que el modelo relacional de backend confirme formalmente la clave foránea canónica para el responsable de cliente en la tabla/colección de proyectos.

---

## 9. Requerimientos Funcionales de Capacidad Semanal y Calendarios Laborales

> **Posible implementación técnica, sujeta a validación de Indunova.**
> Las definiciones funcionales aquí expresadas establecen el comportamiento esperado del sistema. Los nombres de campos (ej. `weekly_capacity_hours`, `work_calendar`, `calendar_effective_date`) y modelos son propuestas referenciales y están sujetos a la validación técnica definitiva de Indunova.

### 9.1 Reglas Funcionales de Capacidad
1. **Capacidad Semanal Base Predeterminada:** **42 horas semanales por persona** para todos los colaboradores activos.
2. **Edición Restringida:** Únicamente usuarios con nivel `system_admin` pueden modificar la capacidad semanal base o el calendario laboral asignado.
3. **Estado "Sin configurar":** Solo debe presentarse en interfaz si en la base de datos el valor no existe (`null`).
4. **Fórmula Canónica de Capacidad Neta Semanal:**
   $$\text{Capacidad Neta Semanal} = \text{Capacidad Base} - \text{Horas Festivos del Calendario} - \text{Ausencias Aprobadas}$$
5. **Distribución Diaria Referencial Dinámica:** No asumir una jornada fija universal de 8 horas diarias. Para semanas estándar de 5 días hábiles (Lunes a Viernes), el valor de referencia diario se deriva dinámicamente como $\frac{\text{Capacidad Base}}{5}$ (ej. 8.4h/día para una base de 42h).
6. **Calendarios Laborales Explícitos (Colombia y México):**
   - Configuración individual explícita (`colombia` o `mexico`).
   - La ciudad de residencia es estrictamente informativa y **nunca determina el calendario laboral**.
   - Los días festivos aplicables se calculan exclusivamente según el calendario asignado (festivos colombianos con Ley Emiliani vs. feriados oficiales de la LFT mexicana).
   - Ausencias y licencias aprobadas se descuentan adicionalmente sobre la capacidad neta.
   - **Irretroactividad:** Las modificaciones de calendario o capacidad entran en vigor a partir de su fecha de vigencia (`calendar_effective_date`) y **no alteran ni recalculan periodos históricos cerrados**.
7. **Rol de Google Calendar:**
   > Google Calendar puede apoyar la sincronización de ausencias y vacaciones, pero no reemplaza el calendario laboral Colombia o México configurado explícitamente en Equipo & Accesos.

### 9.2 Propuesta Referencial de Modelo para Backend (Indunova)
```python
# orbit_core/models.py (Referencial - sujeto a validación técnica de Indunova)
class UserProfile(models.Model):
    # ... otros campos existentes ...
    weekly_capacity_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=42.00,
        help_text="Capacidad semanal base contratada. Por defecto 42h para todos."
    )
    work_calendar = models.CharField(
        max_length=20,
        choices=[('colombia', 'Colombia'), ('mexico', 'México')],
        default='colombia',
        help_text="Calendario laboral oficial para cálculo de días hábiles y festivos."
    )
    calendar_effective_date = models.DateField(
        null=True,
        blank=True,
        help_text="Fecha de vigencia a partir de la cual entra en vigor la asignación."
    )
```

---

## 10. Requerimientos Funcionales de Registro de Tiempo (`TimeLog`), Edición Semanal y Auditoría

> **Posible implementación técnica, sujeta a validación de Indunova.**
> Los nombres de entidades (ej. `TimeLogAuditEntry`) y banderas (ej. `is_voided`) son propuestas referenciales. El backend de Indunova definirá el modelado relacional exacto garantizando el cumplimiento de las siguientes reglas de negocio:

### 10.1 Reglas de Autorización y Ciclo de Vida
1. **Validez Inmediata sin Aprobación Previa:** Todo registro de tiempo ingresado es válido inmediatamente; no requiere aprobación previa para impactar los consumos de la tarea, el presupuesto del proyecto y la capacidad del colaborador.
2. **Historial Completo en Tarea:** Cada tarea conserva y muestra el historial transparente de imputaciones (colaborador, fecha civil, duración, origen manual/timer, notas y estado).
3. **Ventana de Autocorrección Semanal:** Durante la semana civil en curso (hasta el cierre de semana), el propio colaborador puede corregir o anular libremente sus registros.
4. **Cierre Semanal y Modificación Restringida:** Tras el cierre semanal, la ventana de autocorrección se bloquea. Únicamente usuarios con nivel `leader`, `administrative`, `executive` o `system_admin` pueden modificar o anular registros cerrados, documentando obligatoriamente el motivo.
5. **Prohibición de Borrado Físico (Auditoría Inmutable):**
   - Los registros de tiempo nunca se eliminan físicamente mediante `DELETE` SQL.
   - Toda modificación o anulación (soft-delete) debe registrar: valor anterior, valor nuevo, usuario responsable, timestamp exacto (ISO UTC) y justificación.
6. **Recálculo Transaccional en Cascada:** Toda corrección o anulación ejecuta atómicamente el recálculo de horas ejecutadas de la tarea, horas disponibles restantes, horas acumuladas del proyecto y disponibilidad en el módulo de capacidad.

### 10.2 Propuesta Referencial de Modelos de Auditoría para Backend
```python
# orbit_core/models.py (Referencial - sujeto a validación técnica de Indunova)
class TimeLog(models.Model):
    # ... campos existentes ...
    is_voided = models.BooleanField(default=False, help_text="Marcado como anulado (soft-delete)")
    voided_at = models.DateTimeField(null=True, blank=True)
    voided_by = models.ForeignKey('UserProfile', null=True, blank=True, on_delete=models.PROTECT, related_name='+')
    void_reason = models.TextField(blank=True, null=True)

class TimeLogAuditEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    time_log = models.ForeignKey(TimeLog, on_delete=models.CASCADE, related_name='audit_entries')
    field_modified = models.CharField(max_length=50) # 'duration_seconds', 'note', 'logged_date', 'is_voided'
    previous_value = models.TextField(null=True)
    new_value = models.TextField(null=True)
    modified_by = models.ForeignKey('UserProfile', on_delete=models.PROTECT)
    modified_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True, null=True)
```

---

## 11. Cuentas duplicadas e históricas identificadas para conciliación por Indunova

> **AVISO DE PRIVACIDAD Y GOBERNANZA:**
> La documentación pública define reglas, estructuras y comportamientos. La identidad nominal de colaboradores, correos, relaciones de reporte, calendarios individuales y crosswalk con backend se administra exclusivamente mediante **Equipo Canónico Privado**.

Los pares de cuentas duplicadas y los perfiles históricos que requieren conciliación están identificados en Equipo Canónico Privado. Indunova deberá aplicar la inactivación lógica preservando todas las relaciones e historial.

Indunova deberá implementar en sus scripts de migración y conciliación de base de datos el estado esperado para los perfiles de usuario, garantizando que **bajo ninguna circunstancia se ejecuten borrados físicos (`DELETE`)**:

1. **Cuentas Duplicadas Identificadas para Conciliación:**
   - Conservar como activos (`is_active = True`) únicamente los perfiles canónicos oficiales de los 18 colaboradores activos.
   - Marcar los registros duplicados identificados en la matriz privada como inactivos (`is_active = False` / `status: 'Inactive'`), vinculados conceptualmente a la cuenta canónica activa.
   - **Preservar íntegramente las tareas, horas registradas (`TimeLog`), proyectos y relaciones pasadas** imputadas a estos registros.
   - Excluir perfiles inactivos de los selectores activos y endpoints de asignación.
2. **Colaboradores Históricos Desvinculados Identificados para Conciliación:**
   - Mantener los perfiles históricos desvinculados identificados en la matriz privada con `is_active = False` (`status: 'Inactive'`).
   - Excluirlos de los endpoints de listado de colaboradores activos para asignaciones de tareas, selectores de responsables y filtros de capacidad.
   - Preservar íntegramente su historial en proyectos pasados cerrados.
3. **Universo Canónico de Colaboradores Activos (18 Colaboradores):**
   - El universo activo queda cerrado y formalizado en **exactamente 18 colaboradores activos** según se define en *Equipo Canónico Privado*.
   - **Gobernanza del Perfil Ejecutivo (`executive`):** El perfil `executive` adicional definido en Equipo Canónico Privado forma parte de los 18 colaboradores activos y debe contar con usuario ECO. Su asociación con Backend User ID se resolverá durante el crosswalk con Indunova.
   - **Gobernanza de `system_admin`:** Existen dos usuarios iniciales con Access Level `system_admin` con idénticos permisos técnicos en plataforma. La diferenciación funcional y operativa (soporte técnico / producto digital vs. soporte administrativo y configuración de capacidades/calendarios) corresponde a su rol en la organización, según se define en Equipo Canónico Privado.
   - No afirmar que la conciliación ya fue ejecutada en base de datos: corresponde a las especificaciones y reglas para la ejecución de scripts por parte de Indunova.


---

## 12. Módulo New Business: Cotización Multidivisa por Servicio y Conversión Canónica a Proyectos (Regla 1:1:1 y Ticket #132)

### 12.1 Arquitectura Relacional 1:1:1
En la versión oficial (HEAD de la rama `feat/hubspot-commercial-sync-flow`), la propuesta comercial se descompone a nivel atómico:
* **1 Servicio en Alcance = 1 Bloque Comercial en Cotización = 1 Deal en HubSpot (si aplica) = 1 Proyecto Independiente en ECO**.
* La relación entre una Cotización (`QuoteProposal`) y sus servicios comerciales es de **1 a N** (`QuoteProposal` $\longrightarrow$ `ServiceCommercialItem[]`).
* Cada servicio define de manera independiente:
  * `modality`: `'fixed_project'` o `'fee_monthly'`
  * `totalValue` (si es proyecto único) o `monthlyValue` + `monthsDuration` (si es fee)
  * `currency`: `'COP'` o `'USD'`
  * `hubspotDealStage`: `'Presentación a cliente'`, `'Cierre ganado'`, `'Cierre perdido'`, `'Enviado para facturar'`.

### 12.2 Campos Numéricos en Base de Datos (Uso Obligatorio de `DECIMAL` / `NUMERIC`)
* **Problema detectado en pruebas (candidata `1c8f724`):** El backend tipó los valores monetarios como `INTEGER`, lo que rompe cuando se envían cotizaciones en USD con decimales o redondeos contables.
* **Requerimiento mandatorio:** Todos los campos de valores económicos (`sold_value`, `monthly_value`, `total_value`, `estimated_contract_value`) deben crearse como:
  ```sql
  sold_value NUMERIC(14, 2) NULL,
  monthly_value NUMERIC(14, 2) NULL
  ```
  En Django Models:
  ```python
  sold_value = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
  monthly_value = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
  ```

### 12.3 Endpoint de Conversión a Proyectos (`POST /api/convert-opportunity` - Ticket #132)
Al convertir una oportunidad con servicios ganados, el backend **NO DEBE crear un solo proyecto agrupado**. Debe iterar sobre el array de `projects` recibido en el payload y crear **un proyecto independiente en la tabla `projects` por cada servicio ganado**:
```typescript
interface ConvertedProjectPlanPayload {
  serviceId: string;
  serviceName: string;
  projectName: string;
  projectType: 'fixed_project' | 'fee_monthly';
  hubspotDealId?: string | null;
  hubspotDealStage?: string;
  soldValue?: number;
  soldMonthlyValue?: number;
  monthsDuration?: number;
  deliverableIds: string[];
  leadUserId?: string;       // ID del Líder Operativo asignado específicamente a este servicio
  leadUserName?: string;
}
```
**Reglas del endpoint:**
1. **Selección de Servicios Ganados:** El usuario comercial o líder selecciona expresamente cuáles de los servicios cotizados alcanzaron cierre ganado (`won`). El payload de conversión (`payload.projects`) contendrá únicamente los servicios aprobados por el cliente (pueden ser todos los servicios cotizados o solo un subconjunto, por ejemplo, 1 de 3). El backend crea proyectos única y exclusivamente para los servicios incluidos en el array recibido.
2. **Transaccionalidad Atómica Obligatoria (`@transaction.atomic`):** La creación de los N proyectos independientes, junto con la duplicación/asignación de sus entregables y tareas operativas, debe ejecutarse bajo una transacción atómica de base de datos. Si la creación de cualquier proyecto o tarea falla, la transacción completa debe revertirse (*rollback*) sin dejar registros huérfanos.
3. **Idempotencia:** Validar el campo `converted_project_id` en la oportunidad para evitar duplicidades si el usuario reenvía la petición.
4. Crear un registro en la tabla `projects` por cada elemento de `payload.projects`.
5. Asignar a cada proyecto su respectivo `lead_user_id` (proveniente de `project.leadUserId`).
6. Asociar todos los proyectos creados al mismo `client_id` (en cartera o nuevo).
7. Excluir expresamente cualquier servicio con etapa `'Cierre perdido'`: **los servicios perdidos NUNCA generan proyectos ni tareas**.
8. Duplicar o vincular los entregables y tareas del alcance exclusivamente al proyecto correspondiente a su servicio.

### 12.4 Modo Desacoplado / Operación Manual (Sin Token de HubSpot)
Para no bloquear New Business cuando la app privada de HubSpot esté caída o sin token válido:
1. Las oportunidades pueden crearse 100% de forma manual (sin ID de HubSpot).
2. En la Cotización, Comercial puede aprobar manualmente los servicios ganados pulsando **«Marcar como ganada 🏆»**, lo que dispara el flujo de conversión sin consultar la API de HubSpot.
3. Se registra una entrada de auditoría en la tabla de trazabilidad (`status: 'success'`, `source: 'orbit'`) indicando que la aprobación fue manual y que la reconciliación con el CRM queda pendiente.
4. **Orden de los botones en Cotización (13 Nov 2026).** «Crear negocios en HubSpot» y «Marcar como ganada 🏆» **nunca están activos a la vez**:

   | Situación | «Crear negocios en HubSpot» | «Marcar como ganada 🏆» |
   |---|---|---|
   | HubSpot conectado | Aparece al guardar la cotización: es el **primer paso**. Después pasa a «Sincronizar con HubSpot». | Solo **después** de crear los negocios. Lo normal es que «ganada» llegue al sincronizar (Cierre ganado). |
   | Sin HubSpot (sin credencial) | No se muestra. | Aparece al guardar la cotización: único camino para convertir. |

   Sin HubSpot tampoco se muestran «Traer desde HubSpot», «Trazabilidad HubSpot» ni las etiquetas «Sin negocio en HubSpot»: menos avisos mientras llega la credencial. Al conectarla, todo vuelve a aparecer sin cambiar código. En el prototipo se prueba con el interruptor «HubSpot conectado» del Simulador QA.

### 12.5 Estados Operativos de Proyecto («Por iniciar» vs «En ejecución»)
* **La conversión NO define fechas.** Cerrar un negocio y convertirlo en Cliente + Proyecto no lo hace ejecutable: el proyecto nace con `start_date = NULL`, `end_date = NULL`, `is_kicked_off = false` y se presenta como **«Por iniciar»** con la acción **«Iniciar proyecto 🚀»**.
* La conversión solo persiste la configuración contractual del cronograma en `schedule_config` por proyecto:
  `included_rework_rounds` (rondas de ajuste incluidas, sugerido 2), `rework_round_days` (días hábiles por ronda, sugerido 5), `production_weeks` (= `weeksRef` del servicio en el Alcance) y `client_kickoff_wait_days` (entrega de insumos del cliente tras el kickoff, sugerido 3; 0 si no aplica).
  - **Ronda de ajuste** = el cliente revisa una entrega, devuelve ajustes y aprueba. Es un único concepto: reemplaza el modelo anterior de «gates × tandas por gate» (`gate_count` y `gate_approval_wait_days` quedan obsoletos).
  - Todos los campos son **visibles y editables** por servicio en la conversión y se confirman en «Iniciar proyecto»; los valores sugeridos solo precargan.
  - **Solo proyectos únicos** tienen rondas. Fee mensual: `included_rework_rounds = 0`.
* Las tareas creadas en la conversión nacen sin fechas (`scheduled_date` y `due_date` vacíos).
* **«Iniciar proyecto 🚀»** (líder del proyecto) fija la fecha de arranque y calcula la línea base en **días hábiles** (excluye fines de semana y festivos de Colombia):
  ```
  total = client_kickoff_wait_days
        + production_weeks × 5
        + included_rework_rounds × rework_round_days
  ```
  - `baseline_start_date` / `baseline_end_date` se congelan en el primer arranque. Ajustes posteriores solo actualizan `forecast_end_date`.
  - Entregables: producción repartida según horas cotizadas; la entrega de insumos va tras el primer entregable; las rondas se ubican después de los entregables que revisa el cliente (los marcados «Gate» en la plantilla; si no hay, al final del último).
  - Tareas: reciben `scheduled_date` (inicio) y `due_date` (vencimiento) proporcionales a sus horas dentro del entregable. Mi Día muestra las tareas cuya ventana incluye hoy.
  - Las rondas incluidas **no son desvío**; solo una ronda adicional (`round_number > included_rework_rounds`) mueve el forecast y puede generar sobrecosto.
  - Proyectos Fee mensual: sin rondas.
* Referencia de implementación: `src/components/taskflow/schedule/scheduleEngine.ts`.

---

### 12.6 Equipo del proyecto derivado de tareas
* No existe endpoint de asignación manual de colaboradores a proyecto. El equipo es una **consulta agregada** sobre `tasks` (asignados, `budgeted_role`, `scheduled_date`, `due_date`, `budgeted_hours`) y `time_logs` (`user_id`, `budgeted_role_id`).
* Por persona y proyecto: roles desempeñados (horas cotizadas asignadas y ejecutadas por rol), carga de la semana (prorrateo en días hábiles sobre la ventana de cada tarea no completada), horas pendientes y ejecutadas.
* `covers_role = true` cuando `task.budgeted_role` no pertenece a los roles oficiales del usuario (insumo para costo real vs. cotizado).
* Reasignar una tarea **no** modifica sus horas cotizadas.

---

### 12.7 Cierre de proyecto
* Endpoint de cierre que **rechaza** la operación si existen tareas no completadas del proyecto.
* Persiste `status = 'closed'`, `actual_end_date` y un registro inmutable `project_closures`: `closed_by_user_id`, `closed_at`, `reason` (`delivered_approved` | `closed_early` | `cancelled_by_client`), `note` (obligatoria) y la foto final (`quoted_hours`, `executed_hours`, `included_rework_rounds`, `used_rework_rounds`, `baseline_end_date`, `deviation_business_days`).
* No modifica ni elimina `time_logs`, tareas ni asignaciones históricas. Detalle funcional: `ORBIT_PRODUCT_STATUS.md` Módulo 11 §11.7.

---

### 12.8 Catálogo de roles y recursos externos
* `budgeted_role` de tareas, presupuestos por entregable y plantillas solo acepta roles del catálogo oficial (`STANDARD_UHURA_ROLES`). Los datos heredados fuera del catálogo se migran a un rol oficial.
* Nueva entidad `external_resources` (por cotización y heredada al proyecto): `description`, `provider_name`, `cost_model` (`fixed` | `hourly`), `hours`, `hourly_rate`, `total_cost`, `currency`, `service_id`. Suma al costo real del proyecto (rentabilidad); **no** participa en capacidad, `planned_hours`, Mi Día ni la matriz de horas por rol.
* Creación de tareas: `scheduled_date` y `due_date` son **obligatorias** (`due_date >= scheduled_date`); una tarea nueva no nace bloqueada ni marcada como retrabajo (esos estados se aplican después en el detalle de la tarea).

---

### 12.9 Fee mensual: contrato y ciclos
* En `projects` (fee): `contract_months`, `contract_start_date`, `contract_end_date`, `rollover_policy` (`none` | `carry_over` | `contractual_cap` = 25 % de la bolsa mensual).
* `project_cycles` (un registro por mes de vigencia): `cycle_key` (`YYYY-MM` del mes en que empieza), `start_date` y `end_date` (actualizado 23 Nov 2026: el ciclo va del día del contrato al día anterior del mes siguiente; ver §34.1), `period_number`, `quoted_hours`, `rollover_hours_in`, `executed_hours` (rollup de `time_logs` de tareas del ciclo), `status` (`closed` | `active` | `upcoming`), `tasks_generated`.
* `project_contract_renewals`: `renewed_at`, `renewed_by_user_id`, `added_months`, `monthly_hours`, `note`. Una renovación agrega ciclos sin modificar los cerrados.
* `tasks.cycle_key` para fees. Job programado el primer día de cada ciclo (el día 1 si el contrato empieza el 1): abre el ciclo y clona las tareas plantilla del mes 1 (sin tiempo ni estado); idempotente por `(project_id, cycle_key)`.
* Endpoints con filtro `?cycle=YYYY-MM` para KPIs, tareas y matriz de horas; por defecto el ciclo activo.
* Notificación de renovación 30 días antes de `contract_end_date` al líder y a comercial.

---

### 12.10 Costos de operación: hardware, licencias y recursos externos en el P&G
* `hardware_assets`: agregar `serial_number`, `status` (`active` | `repair` | `retired`) y `assigned_user_id` (FK opcional a usuarios) a lo existente. Depreciación mensual = `purchase_value / useful_life_months`; por hora = mensual / 182.
* `software_licenses`: agregar `owner_user_id`, `next_renewal_date` y `license_seats` (relación licencia ↔ usuario, máximo `quantity`). Conversión a COP con la tabla única de TRM de Finanzas (fecha, moneda, valor).
* **Costo real del proyecto (P&G)** = horas registradas × costo hora de la persona + depreciación de hardware imputada + licencias imputadas + recursos externos (§12.8). Mientras alguna fuente de costo no esté disponible, el P&G debe mostrar «margen no disponible» en lugar de 100 %.

---

## 13. Módulo Capacidad: Jornada de 42h, Cálculo de Planificado vs. Ejecutado y Filtro por Área

### 13.1 Jornada Base y Deducción de Festivos/Ausencias
* La capacidad semanal predeterminada de todo colaborador activo en ECO es de **`42.0 horas semanales`** (`8.4h/día` hábil de lunes a viernes).
* Al descontar 1 día festivo oficial (ej. lunes festivo en Colombia), la capacidad neta de esa semana es `42.0 - 8.4 = 33.6h`.

### 13.2 Corrección de Cálculo de `Planificado` vs. `Ejecutado` (Hallazgo UAT #2)
* **Problema detectado en UAT #2:** El endpoint de Capacidad mostraba `Planificado: 0.0h` incluso cuando las tareas tenían fechas asignadas en su **Cronograma** (`startDate` / `dueDate`) y horas presupuestadas (`budgetedHours`), y no descontaba las horas ya registradas (`TimeLog`) de las horas libres.
* **Regla mandatoria para Backend:**
  1. **`planned_hours` (`Planificado`):** Debe sumar las horas presupuestadas (`budgeted_hours`) de las tareas asignadas al colaborador cuyo cronograma (`start_date` / `due_date`) se cruce con la semana/periodo consultado (además de las asignaciones semanales de proyecto si aplican).
  2. **`logged_hours` (`Ejecutado`):** Suma los `TimeLog` registrados por el colaborador en el periodo.
  3. **`free_hours` (`Libre`):** Debe calcularse como:
     ```python
     effective_load = max(planned_hours, logged_hours)
     free_hours = round(max(0, net_capacity - effective_load), 1)
     ```
     Así se evita mostrar `Libre: 33.6h` cuando el colaborador ya registró horas trabajadas en la semana.

### 13.3 Vista Unificada `Organización` y Permisos RBAC
* Se unifica la visibilidad de equipo y compañía en una sola vista **`Organización`** (eliminando la pestaña redundante *Mi Equipo*), habilitada para `leader`, `commercial`, `administrative`, `executive`, `client_relationship` y `system_admin`.
* **Todos** los perfiles ven **`Mi Capacidad`** (su capacidad individual), incluido `executive` (que abre por defecto en `Organización`).
* El perfil `collaborator` mantiene acceso exclusivo a **`Mi Capacidad`**.
* El endpoint debe devolver el campo `department` normalizado (`Área Creatividad`, `Área Growth`, `Área Producto`, `Área Administrativa`, `Área Comercial`, `C-Level`) para soportar el filtrado por área en el frontend.

### 13.4 Prorrateo Multi-Colaborador (`assigneeAllocations`) y Regla `0h` para `Seguidores` / `Project Lead`
> **Actualizado 18 Nov 2026 (§31):** una tarea tiene **un solo colaborador**; el trabajo en paralelo se hace con «Duplicar tarea» (horas a la mitad). El reparto entre varios colaboradores queda solo para tareas legadas.
* **Prorrateo de Bolsa en Tareas con Múltiples Ejecutores:**
  * Cuando una tarea tiene `N > 1` colaboradores (`Colaboradores`), el backend **no debe** sumar el 100% de `budgeted_hours` a cada colaborador.
  * Debe utilizar `assignee_allocations` (horas específicas asignadas a cada ejecutor sobre la bolsa de la tarea) o, en su defecto, prorratear `budgeted_hours / N` entre los colaboradores activos.
* **Impacto `0.0h` de `Seguidores` y `Project Lead`:**
  * Los usuarios en `followers` (`Seguidores`) o `project_lead` **nunca** suman horas a `planned_hours` en Capacidad ni descuentan horas de la bolsa de ejecución de la tarea.
  * Al reasignar una tarea (`Mover a Seguidores`), el colaborador saliente deja de sumar en `planned_hours` de esa tarea, pero sus `TimeLog` previamente registrados permanecen intactos en su `logged_hours` (`Ejecutado`).

---

## 14. Timer Global de Tareas: Estado Único, Persistencia y Cambio de Tarea

### 14.1 Unicidad y Persistencia del Timer Activo
* Solo puede existir **un timer activo por usuario** (`active_timer`) en toda la aplicación, sin importar si se inicia desde el Detalle de Tarea, `Mi Día` o `Tareas`.
* El estado debe persistir al navegar entre módulos, abrir/cerrar el modal de tarea y recargar la vista (`F5`).
* Al pausar (`is_paused = true`), el contador debe detenerse y el control debe cambiar a **Reanudar** en todos los puntos de entrada (Encabezado Global, Detalle de Tarea y miniaturas/filas).

### 14.2 Flujo `Cerrar el actual y cambiar`
* Al intentar iniciar una nueva tarea cuando ya existe un timer activo:
  1. **`Seguir con el actual`:** cierra el aviso y mantiene el timer vigente sin modificaciones.
  2. **`Cerrar el actual y cambiar`:**
     * Pausa el timer vigente y abre el flujo de **`Registrar tiempo`** para confirmar el tiempo trabajado de la **tarea anterior**.
     * Al confirmar el registro, persiste el `TimeLog` **únicamente en la tarea anterior** e **inicia automáticamente** el timer de la nueva tarea seleccionada, actualizando encabezado, detalle y listas.
     * Si el usuario **cancela el registro**, se mantiene el timer anterior y **no** se inicia el nuevo.
     * Garantizar idempotencia para no generar `TimeLog` duplicados ni dejar dos timers activos.

### 14.3 Restricción de Unicidad en Base de Datos para Timer Activo
* En el modelo `ActiveTimer`, aplicar una restricción única estricta para evitar inconsistencias cuando el usuario tiene múltiples pestañas de navegador abiertas:
  ```python
  class ActiveTimer(models.Model):
      user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='active_timer')
      task = models.ForeignKey('Task', on_delete=models.CASCADE)
      started_at = models.DateTimeField(auto_now_add=True)
      is_paused = models.BooleanField(default=False)
      paused_at = models.DateTimeField(null=True, blank=True)
      accumulated_seconds = models.PositiveIntegerField(default=0)
  ```
* Si entra una solicitud para iniciar un timer cuando el usuario ya tiene uno activo en otra tarea, el backend debe responder con `409 Conflict`, forzando el flujo de detención/cambio previo.

---

## 15. Reglas de «Mi Día», Sincronización de Colaboradores y Notificaciones

### 15.1 Regla de visibilidad de tareas (Mi Día, Tareas y bandeja de atención) — obligatoria para todos los perfiles
**Principio:** nadie ve en sus prioridades tareas que no le pertenecen. Ni por compartir rol, ni por ser líder de otra área, ni por tener el mismo primer nombre que otra persona. La relación de una persona con una tarea se calcula **siempre por `user_id`**, nunca por nombre.

| Relación con la tarea | Cómo se determina | Dónde aparece | Urgencia |
|---|---|---|---|
| **Responsable de ejecución** | `assignee_id`, `collaborators` o `assignee_allocations` | «Qué tengo que hacer hoy» (Mi Día) y «Mis tareas» | Normal: cuenta en pendientes, prioridad y capacidad |
| **Revisor** | Tarea en `Review` y el usuario está en `task_reviewers` (§33.4); si la tarea no tiene, el revisor por defecto del proyecto; si no, `project.lead_user_id` | Mi Día y «Mis tareas» | Normal |
| **Seguidor** | `followers` | «Siguiendo» (Mi Día plegado y pestaña en Tareas) | **Sin urgencia**: no suma a pendientes, contadores de atención, capacidad ni alertas |
| Ninguna | — | No aparece | — |

* **Mi Día · «Qué tengo que hacer hoy»** devuelve solo lo que **el cronograma pone para hoy**: tareas donde el usuario es responsable de ejecución con `scheduled_date == hoy` o `due_date == hoy`, **ventana en curso** (`scheduled_date <= hoy <= due_date`, no completada) o vencidas sin completar; las que le toca revisar; y la tarea con su timer activo. **Ningún nivel de acceso** (tampoco `leader` ni `system_admin`) recibe aquí revisiones de proyectos ajenos.
* **La prioridad no mete tareas al día.** ECO no clasifica urgencias: la urgencia viene marcada en la tarea (`priority = 'urgent'`, puesta por quien la pide). Una urgente con fecha de mañana no entra a Mi Día de hoy; se ordena primero en Tareas.
* **Sin tareas agendadas hoy:** Mi Día muestra «Próximas» (máx. 5) con las siguientes tareas propias, ordenadas por cercanía de fecha y prioridad, para que la persona pueda adelantar trabajo. No cambian su fecha ni cuentan como pendientes de hoy.
* **Orden (Mi Día y Tareas):** 1) vencidas; 2) urgentes con fecha hoy o mañana; 3) el resto por fecha más cercana (vencimiento; si no, inicio programado); a igual fecha, la de mayor prioridad. Completadas al final.
* **Excepciones de proyecto** en la bandeja «Qué requiere mi atención» (parte superior de Mi Día) (insumos y dependencias del cliente, bloqueos del equipo, desvíos de horas, retrabajos): solo de los proyectos de los que el usuario es **responsable** (`project.lead_user_id`, `account_manager_id` o líder comercial asignado). Así, al comercial o al líder les llegan los insumos y dependencias de **sus** proyectos aunque no ejecuten tareas. `executive` y `system_admin` ven todos los proyectos en la bandeja, pero **no** las tareas de otros en su lista personal.
* **Tareas · «Equipo»:** no existe para `collaborator`. Para `leader`, `commercial`, `client_relationship` y `administrative` muestra solo las tareas de los proyectos de los que es responsable. Para `executive` y `system_admin`, todas.
* **Seguidores:** se usan para que alguien revise o esté al tanto. Ver la tarea no la convierte en suya: no puede pedir revisión, no recibe recordatorios de vencimiento y no se cuenta en su carga.
* **Aceptación (QA):** con dos usuarios que comparten primer nombre (p. ej. dos «Diego» o dos «Laura»), cada uno ve únicamente sus tareas. Un colaborador no ve el selector «Equipo». Un seguidor ve la tarea en «Siguiendo» y no en «Qué tengo que hacer hoy». Una tarea urgente con fecha de mañana aparece primera en Tareas y no aparece en Mi Día de hoy.
* Implementación de referencia en el prototipo: `src/components/taskflow/auth/taskVisibility.ts` (la comparación por nombre del prototipo existe solo porque los datos de demostración no traen ID; en producción no se usa).

* **Mi Día personal (#147, en producción orbit-00092-jns):** la bandeja «Qué requiere mi atención» de `system_admin`, `administrative`, `commercial` y `client_relationship` incluye solo lo que la persona ejecuta o lidera directamente (sus bloqueos y ajustes, revisiones de las tareas que lidera, pendientes de cliente de sus proyectos, oportunidades que lidera o le tocan; formalizaciones fiscales solo para `administrative`). `leader` conserva las de los proyectos que lidera. **Cambio nuevo (decisión de Uhura, 07 Nov 2026): `executive` también queda personal**; ya no recibe las excepciones de toda la organización en Mi Día (antes se le dejaron en producción). La vista global de Dirección está en Tareas → Equipo y Capacidad → Organización. Desvíos de horas a Comercial y Relación con clientes según §15.4.
* **Urgentes de hoy primero (#146, en producción):** las tareas propias abiertas con prioridad `urgent`, `scheduled_date == hoy` o `due_date == hoy` van de primeras en la bandeja de atención, con su prioridad y fecha actuales.

### 15.2 Sincronización en Tiempo Real al Modificar Colaboradores y Notificaciones
* **Retiro / Reemplazo de Colaborador:** Al quitar a un usuario de `collaborators` / `assignee`, el backend debe excluir esa tarea de su carga **Planificada** en Capacidad, de **Mi Día** y de **Mis Tareas** de forma inmediata.
* **Adición / Asignación de Colaborador:** Al asignar o sumar a un usuario como colaborador o revisor:
  1. La tarea debe aparecer inmediatamente en **Mis Tareas** (y en **Mi Día** si vence hoy o requiere su revisión) respetando su **prioridad**.
  2. Se debe disparar una **notificación** (`Notification` / alerta en campanita) al usuario asignado con: `task_id`, `task_title`, `client_name`, `priority` y `type = 'TASK_ASSIGNED'` (o `'REVIEW_REQUESTED'`).
  3. Al abrir el panel de notificaciones, el cliente marca las alertas como `read = true` automáticamente.
* **Como quedó en producción (#146):** el aviso dice «{Quién} te asignó "{Tarea}" ({Cliente} · {Proyecto}). Prioridad {P}, entrega {fecha}.» y abre el detalle de la tarea. Si se retira a quien era responsable, la responsabilidad pasa al siguiente colaborador. Volver a guardar la tarea o cambiar horas a la misma persona **no** repite el aviso.
* **Comercial (#145, en producción):** crea tareas en proyectos y actualiza comentarios, adjuntos, horas, cronograma y estado; cada cambio queda en Actividad con autor, fecha, valor anterior y nuevo, y avisa al Project Lead y colaboradores (nunca a quien hizo el cambio). No reasigna personas.

### 15.3 Reglas de Transición de Estados por Rol en la Tarea
* **Gobernanza de Cierre:** Las vistas de lista (`Mi Día` y `Mis Tareas`) no deben exponer checkbox circular de completado rápido; el cierre y aprobación de tareas se ejecuta desde el detalle de la tarea.
* **Auto-transición a `In Progress` (`En proceso`):** Si una tarea está en `To Do` y un **Colaborador** ejecuta cualquier acción (iniciar timer, comentar, subir entregable o registrar tiempo), su estado debe pasar automáticamente a `In Progress`.
* ⚠ **Cambio (24 Nov 2026):** la tarea simplificada de §33 reemplaza esta sección: un solo botón según el momento (Iniciar → Entregar o Terminar → Aprobar o Pedir ajustes), sin selector de estado salvo para Dirección.
* **Visibilidad de Acciones por Rol:**
  * **Colaborador:** puede ejecutar `Iniciar tarea` (`To Do → In Progress`) y `Solicitar revisión` (`In Progress → Review`).
  * **Project Lead / Seguidor / Revisor:** **no** debe ver `Solicitar revisión`; tiene habilitado `Completar y aprobar` (y al marcar manualmente la tarea como completada, se asume aprobada en `Done`). Cuando la tarea entra en `Review`, se le habilitan **`Devolver`** (`Review → In Progress`) y **`Aprobar y Completar`** (`Review → Done`).

### 15.4 Visibilidad de Desvíos Presupuestales
* Cuando una tarea supera sus horas cotizadas (`logged_hours > budgeted_hours`), el endpoint de alertas/atención debe exponer el desvío (`Desvío X.Xh / Yh cotizadas`) **a Comercial (`commercial` / `client_relationship`) y al Líder del proyecto asignado (`project_lead_id` / `leader` de ese proyecto)**, siempre limitado a los proyectos de los que cada uno es responsable (§15.1); `executive` y `system_admin` ven todos.

---

## 16. Imputación por Fecha de Trabajo, Perfil Personal y La Colonia

### 16.1 Imputación de `TimeLog` por Fecha de Trabajo Ejecutado (`work_date`)
* Cada `TimeLog` debe persistir `user_id` (usuario autenticado que ejecuta el registro) y `work_date` (**Fecha del trabajo ejecutado**, por defecto la fecha actual, o la fecha seleccionada en el registro manual).
* El endpoint de **Mi Capacidad** debe agrupar y sumar `logged_hours` por `work_date` dentro de la semana laboral vigente (`Lunes` a `Viernes`) para alimentar tanto las tarjetas diarias como el desglose **`Timesheets · [Día]`**.

### 16.1.1 Acceso a ECO desde el perfil (solo `system_admin`)
* Campos en `users`: `login_username` (único, minúsculas, `[a-z0-9._-]{3,32}`), `last_login_at`, `password_hash`, `must_change_password`. La API expone `has_password` (booleano), nunca el hash.
* `POST /users/{id}/username` → valida unicidad; no toca la contraseña.
* `POST /users/{id}/temporary-password` → recibe la contraseña temporal por HTTPS, la guarda con hash, marca `must_change_password = true` e invalida las sesiones activas. Mínimo 8 caracteres.
* `POST /users/{id}/deactivate` / `reactivate` → sin borrado físico; desactivado no inicia sesión ni aparece para asignar trabajo.
* Cada acción queda en `UserProfileAuditEntry` (quién y cuándo), **sin** el valor de la contraseña. Nada de esto se registra en logs.
* **Pantalla de ingreso (13 Nov 2026, prototipo: `auth/LoginScreen.tsx`, se ve con `?login=1` o al cerrar sesión).** Fondo degradado a pantalla completa (lila → blanco → lila). Computador: a la izquierda un panel morado con bordes redondeados con el saludo «¡Hola, soy ECO!» en Playfair Display itálica (fuente de acento de ECO) y «Somos el Espacio de Creación y Operaciones de Uhura» (E, C y O resaltadas en lima), más ECO animado; a la derecha el formulario directamente sobre el fondo, sin tarjeta. Celular: solo el formulario con el logo arriba y un ECO animado pequeño encima. **ECO animado** (`auth/AnimatedEco.tsx`, sprite de 6 poses `src/assets/images/eco/eco-walk-sprite.webp`) reemplaza la imagen fija del panel: entra caminando desde fuera del panel (pasos alternados con leve rebote) se pone las manos en la cintura y guiña (lo mismo al terminar cada paseo); cada 2,5–4 s hace algo distinto (guiña, mira de frente o da un paseo corto de ida y vuelta, volteándose al regresar); guiña al pulsar «Ingresar» (~0,65 s antes de entrar) y se pone de frente si falta un dato. Con «reducir movimiento» activo (`prefers-reduced-motion`) queda quieto. Campos «Usuario» (`login_username`) y «Contraseña» con botón para mostrarla; botón «Ingresar». «¿Olvidaste tu contraseña?» muestra: pedirle a Administración una contraseña temporal (sin autoservicio por correo mientras no exista el buzón de notificaciones). Si la cuenta tiene `must_change_password`, el siguiente paso es «Crea tu contraseña» (nueva + confirmación, mínimo 8 caracteres) antes de entrar. Errores en línea, sin revelar si el usuario existe. Pie: «Uhura Group · ECO» (no el nombre del proveedor).

### 16.2 Gobernanza de Perfil Personal (`Mi Perfil`) y Vacaciones
* **Autoservicio limitado:** Cualquier usuario autenticado puede consultar y editar **únicamente su propio perfil** (`user_id == request.user.id`), restringido a los campos `hobbies` (pasatiempos e intereses) y `personal_dream` (sueño o meta personal).
* **Restricción de edición cruzada:** Ningún rol (incluidos `leader` o `system_admin`) puede editar perfiles de terceros desde `Mi Perfil` o `La Colonia`; la edición de perfiles de otros colaboradores es exclusiva del **Administrador desde `Equipo & Accesos`**.
* **Vacaciones:** El campo de vacaciones en `Mi Perfil` es de solo lectura en autoservicio y se sincroniza automáticamente desde **Google Calendar / Equipo & Accesos**.

---

## 17. Módulo de Dirección y Finanzas: Metas Comerciales, Recálculo y Hook con Alegra

### 17.1 Persistencia de Metas Comerciales y Recálculo Automático
Indunova debe proveer dos tablas relacionales para gobernar las metas sin depender del estado del frontend:
```python
class CommercialTarget(models.Model):
    year = models.PositiveSmallIntegerField(unique=True) # ej. 2026
    annual_target_cop = models.DecimalField(max_digits=14, decimal_places=2, default=4200000000.00) # $4.200M COP
    monthly_target_cop = models.DecimalField(max_digits=14, decimal_places=2, default=350000000.00) # annual_target / 12
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)

class MonthlyCommercialOverride(models.Model):
    year = models.PositiveSmallIntegerField() # ej. 2026
    month = models.PositiveSmallIntegerField() # 1 a 12
    override_amount_cop = models.DecimalField(max_digits=14, decimal_places=2) # Ajuste manual reportado por Dirección
    note = models.CharField(max_length=255, blank=True, default='')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('year', 'month')
```
* **Recálculo Automático:** Al actualizar `annual_target_cop`, el backend recalcula automáticamente `monthly_target_cop = annual_target_cop / 12`.
* **Prioridad de Cifra Efectiva Mensual:** Si existe un registro en `MonthlyCommercialOverride` para un mes específico, ese valor sustituye al cálculo automático de ECO (salvando delays con contabilidad mientras no haya integración). Si no existe, se calcula como: `Vendido New Business ganado en el mes + Base mensual de fees activos`.

### 17.2 Stub / Hook Desacoplado de Alegra (Cero Datos Simulados)
* **Regla estricta:** Indunova **NO debe crear modelos de cartera ficticia, saldos en mora ni facturas simuladas**.
* El endpoint de facturación real debe responder de manera honesta como stub hasta la entrega de credenciales contables:
  `GET /api/v1/finance/alegra/invoices-summary/?month=2026-11`
  ```json
  {
    "status": "pending_integration",
    "connected": false,
    "message": "Integración con Alegra pendiente de configuración de API Key contable",
    "total_invoiced_cop": null,
    "total_collected_cop": null
  }
  ```

### 17.3 Capacidad Base Universal Inmutable en 42 Horas
* La capacidad laboral contratada es de **`42.0 horas semanales`** (`8.4h/día` de Lunes a Viernes) para todos los colaboradores activos.
* No asumir jornadas de 40h ni 48h en ningún cálculo.
* La deducción de capacidad descuenta horas según la **`work_date`** (fecha real del trabajo ejecutado) y no según la fecha en que se envió la solicitud.

---

### 17.4 Mejoras de lógica en «Tablero» y «Finanzas» (07 Nov 2026)
Detalle funcional en `ORBIT_PRODUCT_STATUS.md` §11.9 (punto 3). Requisitos de backend:
* **P&G con costos reales:** `project_cost = Σ(time_logs.hours × person_hourly_cost vigente a la work_date) + depreciación de hardware imputada + licencias imputadas + external_resources`. Si alguna fuente no tiene datos para el periodo, la respuesta incluye `margin_available = false` y la UI no muestra 100 %.
* **Tabla de costos por persona/rol:** `person_hourly_costs` (`user_id` o `role`, `hourly_cost_cop`, `effective_from`). Retirar el costo hora de `financial_goals`.
* **Facturas:** `invoices.project_id` (o `client_id` + `service_id`) obligatorio al causar; las facturas importadas de Alegra sin vínculo quedan en estado `unreconciled` y se listan como «Por conciliar».
* **Metas:** `financial_goals` anual con distribución mensual automática (`monthly_goals`), sobrescribible por mes con auditoría (`changed_by`, `changed_at`, `reason`).
* **Proyección:** `forecast(month) = Σ fees activos (contract monthly value, mientras month ≤ contract_end_date) + hitos de facturación pendientes de proyectos únicos + Σ(oportunidades abiertas × probabilidad)`. Mantener la proyección lineal como referencia opcional.
* **TRM:** tabla única `exchange_rates` (`date`, `currency`, `rate_to_cop`), usada por licencias, cotizaciones, recursos externos y P&G; consulta por la fecha del hecho económico.
* **Alertas:** endpoint de alertas que devuelve solo proyectos en riesgo con `recommended_action`; el semáforo usa conteos agregados.

---

## 18. Integración con Google Chat (Ticket #149)
Especificación funcional y permisos en `ORBIT_PRODUCT_STATUS.md` §11.8. Requisitos de backend:

### 18.1 Modelo
* `client_google_chat_integrations` (1:1 con `clients`): `space_name`, `webhook_url_encrypted`, `webhook_last4`, `status` (`pending_test` | `active` | `inactive` | `error`), `is_default_for_projects` (default `true`), `last_test_at`, `last_test_result`, `last_test_error`, `updated_by_user_id`, `updated_at`.
* En `projects`: `google_chat_enabled` (boolean, **default `false`**). Activado = usa el webhook del cliente. No hay webhook propio por proyecto ni `is_default_for_projects` (simplificado 07 Nov 2026). En el prototipo: `googleChatMode` `inherit_client` (activado) / `disabled`.
* Bitácora de cambios de integración (quién, cuándo, acción) sin almacenar la URL.

### 18.2 Seguridad
* **Autogestión:** el webhook lo registra `system_admin` desde la ficha del cliente. Indunova **no** necesita recibir los webhooks de los clientes; solo construye la pantalla, el guardado cifrado y el envío. Para probar, usar un espacio de prueba propio.
* La URL del webhook se guarda **cifrada** y **nunca** se devuelve por API; las respuestas solo incluyen `webhook_last4` / máscara.
* Solo `system_admin` puede crear, probar, activar, desactivar, reemplazar o eliminar el webhook (también desde el proyecto, si el cliente no tiene uno: se guarda en el cliente). `leader` solo puede activar o desactivar `google_chat_enabled` en sus proyectos.
* Las URLs no se registran en logs, tickets ni documentación.

### 18.3 Envío
* Resolución del destino según §11.8: proyecto sin activar → no se envía; activado → webhook activo del cliente; si el cliente no tiene uno activo → solo in-app.
* «Guardar y probar» envía un mensaje real de prueba; si falla, `status = error` con el detalle.
* Eventos que se publican: nueva tarea/asignación relevante, solicitud de revisión, comentario con mención o solicitud de revisión, devolución, aprobación, cambio a prioridad urgente y recordatorio de pendientes sin repetición. **No** se publican eventos de timer ni cambios sin acción requerida.
* Envío asíncrono con reintentos **idempotentes** (clave por evento y destino): un reintento no duplica mensajes. Una falla de Google Chat **no** impide guardar la acción en ECO.
* Formato: mensaje corto y amigable con estructura reconocible y enlace directo a la tarea (ej.: «👋 ¡Hola, equipo! Soy ECO 🦫. … [Ver tarea en ECO]» (ECO es un castor: usar 🦫, no 🐻)).
* Pruebas controladas (espacio de prueba) para no notificar al equipo por error.

---

## 19. Arranque en producción y migración desde COR (07 Nov 2026)
Especificación funcional en `ORBIT_PRODUCT_STATUS.md` §9.4.

### 19.1 Qué se migra y qué no
* **Sí se migra:** usuarios (perfiles, roles, calendario laboral) y **clientes** (datos fiscales, contactos, integraciones). Nada más.
* **No se migra:** proyectos, entregables, tareas, comentarios, timers ni registros de horas de COR ni de la plataforma que hoy opera Indunova. Ningún script de seed o migración puede crear proyectos o tareas con fecha anterior al arranque (**corte: 1 de noviembre de 2026**).
* Los datos de demostración del prototipo (proyectos, tareas, oportunidades, mocks) **no** se cargan en producción, igual que el Simulador QA.
* COR queda como archivo histórico de solo lectura. Antes de apagarlo, Uhura exporta (CSV/PDF) las horas y proyectos que finanzas necesite conservar; esos archivos no se importan a ECO.

### 19.1.1 Dominio y URL anterior
* Dominio final de producción: **`app.uhuragroup.com`**. Indunova debe enviar a Uhura los registros DNS requeridos (CNAME del subdominio, TXT de verificación de dominio y los que pida el certificado TLS). Uhura los configura; Indunova confirma la emisión del certificado y el despliegue.
* Solo HTTPS. Las URLs de la app (enlaces de Google Chat, correos, notificaciones) se generan con este dominio.
* La URL anterior de producción se retira cuando `app.uhuragroup.com` esté activo; durante la transición puede redirigir (301) al dominio nuevo.
* El acceso a **Equipo & Accesos** (módulo `administracion`) queda solo para `executive` (consulta) y `system_admin` (administración).

### 19.2 Proyectos vigentes al arranque
* Se crean **a mano desde la interfaz** por el líder o comercial responsable, con el flujo normal: proyecto nuevo (o conversión desde New Business si existe la oportunidad) → «Iniciar proyecto».
* «Iniciar proyecto» debe aceptar una **fecha de inicio pasada**: es la fecha real del contrato. El cronograma y los ciclos se calculan desde ahí.
* **Fee mensual iniciado antes del arranque** (caso Cristar: inicia el 1 de noviembre y se crea en ECO en diciembre): `contract_start_date` real; los meses anteriores existen como ciclos **sin tareas** («Mes 1 · fuera de ECO»); las tareas se generan solo desde el ciclo actual. Si el contrato tiene la excepción de acumular horas, el saldo inicial se registra como un ajuste manual con nota y usuario, no como horas importadas.
* Cada proyecto guarda su origen: `origin = 'new_business' | 'manual_go_live'`, y los creados con `manual_go_live` registran quién los creó y cuándo.
* Primer proyecto en producción: **Rediseño web Neroli**, creado manualmente (su cierre comercial ocurrió fuera de ECO).

### 19.3 Si hubiera muchos proyectos vigentes
Si al momento del arranque hay más proyectos vigentes de los que se pueden crear a mano en un día, se habilita una **carga única por plantilla** (CSV) con: cliente, nombre, tipo (único / fee), fecha de inicio, vigencia en meses, horas contratadas por rol, líder y responsable de cuenta. La carga:
* Solo crea el proyecto y su configuración; **nunca** tareas, horas ni comentarios.
* Corre primero en modo de prueba (`dry_run`) y devuelve un informe para que Uhura lo apruebe.
* Rechaza filas con fecha de fin anterior al corte o cliente inexistente.
* Marca los proyectos con `origin = 'import'` y deja al líder la tarea de revisar e «Iniciar proyecto».

---

## 20. Sincronización con Google Calendar · Ausencias del equipo (Ticket #149)
Especificación funcional en `ORBIT_PRODUCT_STATUS.md` §11.5 y §11.5.1.

### 20.1 Conexión
* Cuenta de servicio de Google Workspace con **solo lectura** sobre el calendario corporativo de ausencias. Uhura comparte el calendario con la cuenta que indique Indunova. Las credenciales viven en el gestor de secretos del backend; nunca en el repositorio, tickets, logs ni respuestas de API.
* `calendar_integrations`: `calendar_label`, `status` (`active` | `pending_access` | `paused` | `error`), `last_sync_at`, `last_sync_result`, `last_sync_error`, `imported_count`, `updated_by_user_id`, `updated_at`. El ID del calendario no se expone al frontend.

### 20.2 Sincronización
* Mecanismo a criterio de Indunova (notificaciones push o tarea periódica). Idempotente por `external_calendar_event_id`: re-sincronizar no duplica ausencias.
* **Asociación a la persona:** por el correo del invitado (`attendee.email` = `users.email`). Si no hay coincidencia única, el evento se guarda en `calendar_unmatched_events` (`external_event_id`, `title`, `start_date`, `end_date`, `all_day`, `reason`, `status` = `pending` | `resolved` | `ignored`) y **no** descuenta capacidad hasta que `system_admin` lo asocie.
* **Tipo e impacto por título:** «Vacaciones» → `vacation`, «Incapacidad» → `sick_leave`, «Permiso» → `personal_leave` (8 h/día); «Medio día» → `personal_leave` 4 h/día; otro → `other` 8 h/día. Reglas configurables en backend.
* Evento cancelado o eliminado en el calendario → `TeamAbsenceEvent.status = 'cancelled'` (sin borrado físico).
* Fechas en día civil (sin corrimientos por zona horaria).

### 20.3 API y permisos
* `GET /integrations/google-calendar` (`system_admin`, `executive`): estado y contadores.
* `POST …/test`, `POST …/pause`, `POST …/resume` (`system_admin`).
* `GET …/unmatched` y `POST …/unmatched/{id}/resolve` con `user_id` o `ignore = true` (`system_admin`). Resolver crea el `TeamAbsenceEvent` con `source = 'google_calendar'` y queda en bitácora (quién, cuándo).

---

## 21. Mascota ECO: apariencia de temporada (07 Nov 2026)
Especificación funcional en `ORBIT_PRODUCT_STATUS.md` (Módulo 18, reglas de la mascota).
* **Valor por defecto según la fecha:** noviembre y diciembre = `christmas`; enero a octubre = `standard`. No hace falta que nadie lo active.
* Configuración de organización `mascot_skin` (`christmas` | `standard`) como **cambio manual para la temporada en curso**, editable **solo por `system_admin`**; lectura para todos los usuarios autenticados. Se guarda junto con la temporada (`navidad-2026` / `regular-2027`) y deja de aplicar al empezar la siguiente (1 de noviembre o 1 de enero). En el prototipo vive en el navegador (`eco_mascot_skin`); en producción debe persistirse en backend y quedar en bitácora (quién y cuándo la cambió).
* Imágenes: las 13 de `src/assets/images/eco/` (8 estándar + 5 navideñas `eco-christmas` y `eco-xmas-*`) van en el build; no se cargan desde backend.
* Preferencias personales (no requieren backend o pueden ir en el perfil): mascota apagada, sonido y nieve.
* Las emociones de la mascota se calculan en el frontend con las tareas propias del usuario (§15.1); no requieren endpoints nuevos.
* **Moods de ambiente (cafecito, hola, crack, agua) y la duración de las emociones:** son solo frontend (imágenes y frases en `mascot/ecoMascot.ts`, rotación aleatoria por persona en el navegador). **No requieren backend ni endpoints.** Producción solo debe incluir las imágenes `eco-xmas-*.webp` en el build. Si a futuro Uhura quiere editar las frases sin desplegar, se haría como configuración de organización (igual que `mascot_skin`); hoy no es necesario.

---

## 22. La Colonia: retos y ranking (07 Nov 2026)
Especificación funcional en `ORBIT_PRODUCT_STATUS.md` Módulo 18.
* `game_results` (`id`, `user_id`, `game_id` = `torre` | `nenufar`, `score`, `created_at`). Ranking semanal = `MAX(score)` por `user_id` y `game_id` desde el lunes 00:00 (hora Colombia) de la semana en curso; desempate por quien lo logró primero. Sin tabla propia de ranking.
* `colony_challenges` (`id`, `game_id`, `challenger_user_id`, `challenger_score`, `challenged_user_id`, `challenged_score` null hasta jugar, `status` = `pending` | `completed`, `created_at`, `completed_at`). Ganador derivado: mayor puntaje; igual = empate. Un reto se resuelve una sola vez.
* Rivales: solo usuarios activos de Equipo & Accesos, nunca uno mismo.
* Notificaciones en la campana: «X te retó en {juego} con N pts» (al retado) y «{Resultado} contra X» (a ambos, al resolverse).
* **Recordatorio de horas (ya existe en producción):** no se reimplementa. Lo que hace hoy la plataforma de Indunova (hora, canales) es la referencia; el prototipo solo replica la reacción de la mascota. **Única excepción, decidida por Uhura (07 Nov 2026): el umbral se unifica en 80 %**; si producción usa otro porcentaje, se ajusta solo ese valor.

---

## 23. ECO como PWA instalable (07 Nov 2026)
Especificación funcional en `ORBIT_PRODUCT_STATUS.md` §9.5. **Fase 1 no requiere cambios en el backend.**
* **Qué incluye el frontend (ya listo en el prototipo):** `vite-plugin-pwa` en `vite.config.ts` genera `manifest.webmanifest` y el service worker `sw.js`. Nombre «ECO · Uhura Group», íconos en `public/pwa/` (192, 512, maskable 512 y `apple-touch-icon` 180), colores `#140b24` / `#0d0718` y `start_url` `/?app=eco`. Se precargan solo el código, los estilos, los íconos y las imágenes de ECO (~2,8 MB). Las fotos del equipo (`public/assets/team`) y los logos grandes de `public/brand` no se precargan.
* **Requisitos de hosting (Indunova):**
  * Servir solo por **HTTPS** en `app.uhuragroup.com` (§19.1.1). Sin HTTPS no se puede instalar.
  * `sw.js`, `registerSW.js`, `index.html` y `manifest.webmanifest` con `Cache-Control: no-cache` (si quedan en caché del CDN, las actualizaciones no llegan). Los archivos con hash de `/assets/` pueden ir con caché larga (`immutable`).
  * `manifest.webmanifest` con `Content-Type: application/manifest+json`.
  * Si la SPA tiene rutas, todas responden con `index.html`; las llamadas a `/api/...` **nunca** pasan por el service worker (hoy no las intercepta: solo precarga archivos estáticos y fuentes).
* **Actualizaciones:** al publicar una versión nueva, la app muestra «Hay una versión nueva de ECO · Actualizar». Nunca recarga sin preguntar, para no perder un cronómetro o un formulario a medias. Revisa si hay versión nueva cada hora.
* **Al lanzar producción:** quitar del build el Simulador QA (ver nota al inicio de este documento) y el atajo `?ecoMoods=fast`; el modo app (`?app=eco` / instalada) se conserva.
* **Fuera de la fase 1 (requieren backend, a decidir):**
  * **Notificaciones push** (retos, horas por cargar, aprobaciones): llaves VAPID, endpoint para guardar la suscripción por usuario y dispositivo, y un servicio que envíe. En iPhone solo funcionan con la app instalada en la pantalla de inicio (iOS 16.4+).
  * **Registrar horas sin conexión** con sincronización posterior: necesita resolver conflictos en el backend. No se recomienda por ahora.

---

## 24. Racha de días cargados y cierre del día (07 Nov 2026)
Especificación funcional en `ORBIT_PRODUCT_STATUS.md` §9.4.1. Lógica de referencia en `src/components/taskflow/time/dayStreak.ts`.
* **Racha:** se calcula con `time_logs` existentes por usuario y día (`SUM(duration_seconds)` por `date`). Un día hábil cuenta si suma ≥ 80 % de la jornada diaria (capacidad semanal ÷ 5). Se saltan fines de semana, festivos de Colombia y días con ausencia activa (§20); no rompen la racha. Puede calcularse en el frontend con los registros de las últimas semanas o exponerse como `GET /api/me/streak` → `{ current, today_counts, today_is_workday }`. No hay ranking ni comparación entre personas.
* **Día cerrado:** tabla `day_closures` (`user_id`, `date`, `closed_at`), única por usuario y fecha. `POST /api/me/day-closures` con la fecha de hoy; idempotente. Es solo un registro de confirmación: **no bloquea ni modifica** `time_logs` (las reglas de corrección y cierre semanal no cambian). En el prototipo vive en el navegador (`eco_day_closed_v1`).
* **Aviso de las 5:00 p. m.:** es del frontend (mascota); se muestra una vez por día y no requiere backend. Si a futuro se quiere enviar también por Google Chat o push, se reutiliza el canal del recordatorio de horas de producción, sin duplicarlo.

---

## 25. Racha de equipo y logros de racha (07 Nov 2026)
Especificación funcional en `ORBIT_PRODUCT_STATUS.md` §9.4.1. Lógica de referencia en `src/components/taskflow/time/dayStreak.ts` (`computeTeamStreak`, `computeMilestones`).
* **Requiere cálculo en servidor:** cada persona solo puede leer sus propios `time_logs` (§15.1), así que la racha de equipo y los logros se calculan en el backend y se exponen ya agregados, sin horas individuales:
  * `GET /api/team/streak` → `{ current, today_loaded, today_expected, week_pct }`. Nunca devuelve quién faltó.
  * `GET /api/team/streak-milestones` → `[{ user_id, user_name, current, milestone, achieved_on, claps_count, clapped_by_me }]`. Se publica solo por comportamiento (sin preferencia de compartir).
* **Equipo esperado por día:** usuarios activos con `capacity_hours > 0`, sin ausencia activa ese día (§20). Días hábiles de Colombia. Un día cuenta para la persona si suma ≥ 80 % de `capacity_hours / 5`.
* **Hitos:** 5, 10, 20, 50 y 100 días seguidos. `achieved_on` = día en que la racha vigente alcanzó el hito. Si la racha se rompe, el hito deja de mostrarse (se celebran rachas vigentes).
* **Aplausos:** `streak_milestone_claps` (`milestone_key`, `user_id`, `created_at`), único por persona y hito; no se puede aplaudir el propio. `POST`/`DELETE /api/team/streak-milestones/{key}/clap`. En el prototipo: `eco_streak_claps_v1`.
* Opcional (fase 2): avisar en un espacio interno de Google Chat cuando alguien llega a un hito.

---

## 26. Notificaciones por correo y recordatorio semanal de horas (Ticket de integraciones, 07 Nov 2026)
Las notificaciones in-app siguen siendo la fuente principal; el correo y Google Chat (§18) son complementarios. Todas las URLs usan `app.uhuragroup.com` (§19.1.1).

### 26.1 Eventos por correo (al correo corporativo del usuario, con enlace directo al elemento)
| Evento | Destinatarios | Información mínima |
|---|---|---|
| Nueva asignación | Colaborador asignado | Tarea, cliente, proyecto, fecha de entrega, quién asignó |
| Reasignación | Colaborador agregado y colaborador retirado | El cambio y enlace a la tarea |
| Solicitud de revisión | Project Lead, revisor y seguidores habilitados | Tarea, quién solicita, enlace |
| Tarea devuelta | Colaboradores responsables | Observación, quién devolvió, enlace |
| Tarea aprobada y completada | Colaboradores responsables | Confirmación, quién aprobó, enlace |
| Comentario o mención | Responsables y mencionados con @ **que tengan acceso a la tarea** (§15.1) | Autor, fragmento, enlace |
| Cambio a prioridad urgente | Colaboradores responsables | Prioridad, fecha de entrega, quién cambió |
| Cambio relevante de cronograma | Responsables, Project Lead y seguidores | Fecha anterior, fecha nueva, enlace |
* Quien realiza la acción **no** recibe correo por su propia actividad. Si una persona cumple varios roles en el mismo evento, recibe **un solo** correo (deduplicar por `user_id` y `event_id`).
* Envío asíncrono e idempotente: una falla del proveedor no impide guardar la acción en ECO y un reintento no duplica correos.

### 26.2 Recordatorio semanal de horas (viernes, después de la jornada)
* A cada persona con **menos del 80 % de su capacidad neta semanal** registrada. Capacidad neta = capacidad − festivos − vacaciones y permisos aprobados (§20). Horas vigentes según `work_date`; los registros anulados no cuentan. Si la capacidad neta es 0 o ya alcanzó el 80 %, no se envía.
* Contenido: semana evaluada, horas registradas y capacidad neta, porcentaje, horas pendientes para el 80 %, resumen por tarea y proyecto, y botón **«Completar mis horas»** que abre esa semana en Mi Capacidad / Timesheets.
* **Resumen semanal:** `leader` → solo las personas de su área o alcance; `executive` y `system_admin` → consolidado de toda la organización.
* **Meta única de 80 % (decisión de Uhura, 07 Nov 2026):** el correo del viernes (80 % de la capacidad neta semanal), el recordatorio diario de la mascota, la racha y «Cerrar mi día» (80 % de la jornada diaria) usan el mismo porcentaje. Definirlo como una sola configuración de organización (`hours_min_ratio = 0.8`) para no tener valores distintos.

### 26.3 Proveedor de correo
* Si se requiere un proveedor, Indunova lo escala a Ana con copia a Pao indicando: servicio propuesto, accesos requeridos, remitente, registros DNS (SPF, DKIM, DMARC) y costos o límites.

### 26.4 Criterios de aceptación (del ticket)
* Los correos llegan a los destinatarios indicados y abren el elemento correcto en ECO.
* El recordatorio usa la capacidad neta y los registros vigentes de la semana evaluada.
* Una novedad de prueba de Neroli se publica **una sola vez** en el espacio correcto de Google Chat; el webhook se registra, prueba, activa y desactiva desde la plataforma (§18).
* Las vacaciones y permisos de Calendar se reflejan en el usuario y su capacidad; cambios y cancelaciones se actualizan sin duplicados (§20).
* Una falla externa no impide guardar en ECO; los reintentos no duplican notificaciones ni registros.
* Credenciales y webhooks protegidos: nunca en tickets ni documentación abierta. Pruebas controladas para no notificar al equipo por error.
* HubSpot: pendiente de credenciales y autorizaciones de Ana (§12.4 cubre la operación manual mientras tanto).

---

## 27. Métricas de la ficha del cliente (07 Nov 2026)
Especificación en `ORBIT_PRODUCT_STATUS.md` §9.4; lógica de referencia en `src/components/taskflow/clientMetrics.ts`.
* **Todo calculado, nada fijo:** proyectos (total, activos, cerrados), valor vendido (suma de `sold_value_cop`), margen promedio (proyectos cerrados con margen real), salud por dimensión y salud general. No persistir `projects_count`, `average_margin_percent`, `billed_cop`, `receivable_cop`, `health_status` ni `behavior` como valores editables; si se guardan, que sea como caché recalculada.
* **Facturado y por cobrar:** solo cuando exista la integración con Alegra (§ Módulo 10). Mientras tanto la API devuelve `null` y la UI muestra «Pendiente de la integración con facturación».
* **Salud general:** requiere al menos 2 dimensiones con datos; si no, `null` («Sin datos suficientes»). Mismo cálculo para la ficha y la lista de clientes.
* Endpoint sugerido: `GET /api/clients/{id}/metrics` y, para la lista, las mismas métricas resumidas en `GET /api/clients`.

## 28. Ronda 2 de mejoras del prototipo (10 Nov 2026)
Especificación funcional en `ORBIT_PRODUCT_STATUS.md` §8.0 puntos 3b, 3c y 3d. Esta sección reúne **todo lo que impacta backend** de esa ronda; lo puramente visual (íconos, textos, tamaños) no se repite aquí.
* **Versiones de la cotización:** tabla `quote_commercial_versions` (`quote_id`, `version`, `saved_at`, `saved_by`, `total`, `currency`, `synced_to_hubspot`, snapshot de la estructura comercial). Cada «Guardar cotización» / «Guardar cambios» crea una versión; nunca se sobrescribe la anterior.
* **Sincronización con HubSpot al editar:** si el servicio ya tiene `hubspot_deal_id`, al guardar se actualiza el monto (y la modalidad) del negocio en HubSpot. Dirección única por campo: ECO es dueño de valores y servicios; HubSpot es dueño de la etapa. Si falla, se aplica la cola de reintentos y el aviso de #133.
* **Eliminar servicio del alcance:** borra el servicio, sus entregables y actividades de la cotización y su línea comercial; si la cotización estaba guardada, pasa a «desactualizada» (exige guardar de nuevo). Si el servicio tenía negocio en HubSpot, se marca «Cierre perdido» en HubSpot con motivo «Retirado del alcance» (no se borra el negocio).
* **Costos externos y licencias:** ampliar `external_resources` con `kind` (`external` | `license`), `recurrence` (`one_time` | `monthly`), `monthly_cost` y `months`; `total_cost` = costo mensual × meses cuando es mensual. Los crea el líder en Alcance; Comercial los lee en Cotización. Se copian al proyecto al convertir y suman al costo real del P&G (§12.8).
* **Iniciar proyecto:** permiso para `commercial`, `client_relationship`, `executive`, `leader` (del proyecto) y `system_admin`.
* **Insumos del cliente (por fase, sin sumar días):** el catálogo de servicios guarda una plantilla de insumos por servicio (`title`, `type` = `access` | `client_input`, `blocking`, `phase_hint`: nombre o tipo de fase). Al iniciar el proyecto (primer arranque, sin dependencias previas) los confirmados se crean como `project_dependencies` con `deliverable_id` = fase para la que se necesitan y `expected_date` = inicio planeado de esa fase (`owner_type = client`, `requested_at` = kickoff, seguimiento del líder). **No** modifican `client_kickoff_wait_days` (queda en 0 para proyectos nuevos): un insumo solo genera desvío si su fase empieza sin él. Si la fase se reprograma, se recalcula `expected_date`.
* **Entregables:** «Enviar a revisión» pone la tarea en `Review` (nunca `Done`), crea un comentario del autor con el enlace y notifica (campana y correo, §26) al líder del proyecto, al revisor y a los seguidores. Solo líder o revisor pasan a `Done` («Aprobar») o devuelven a `In Progress` («Devolver», cuenta como ajuste).
* **Cerrar sesión:** disponible en todas las resoluciones; invalida la sesión de Google y vuelve al ingreso.
* **Montos:** aceptar decimales (2) en valores de cotización y costos externos; la UI muestra separador de miles con punto y decimales con coma.
* **Registro de tiempo:** `description` es opcional en carga manual y al detener el timer.
* **Menciones en la entrega:** el comentario de entrega admite @menciones; las personas mencionadas se suman a los destinatarios del aviso de revisión.
* **Iniciar proyecto (primer arranque):** recalcula siempre `start_date`, `scheduled_date` y `due_date` de todas las tareas del proyecto según el plan por fase; no es opcional. Al reprogramar un proyecto ya iniciado, el recálculo de tareas es opcional.
* **Conversión con varios servicios (3b):** solo se crean proyectos para los servicios con estado ganado; nunca «todos los no perdidos». Con un solo servicio, se aprueba automáticamente al convertir (#132). La selección de ganados / perdidos se guarda en la misma operación que el estado «ganada» (evitar dos escrituras donde la segunda pise la primera).
* **Fee mensual antes de iniciar (3b):** las tareas convertidas nacen sin `cycle_key`; se les asigna el mes de inicio al «Iniciar proyecto». Antes de eso, la API debe devolver todas las tareas del proyecto (no filtrar por mes).
* **Alcance con varios líderes:** cada líder guarda su servicio (`scope_services.saved_by`, `saved_at`). «Marcar alcance listo» lo puede hacer cualquier líder del alcance y exige confirmación en la UI; el backend valida antes de cambiar la oportunidad a `internal_review`: enlace de la presentación, al menos un servicio con actividades y horas, semanas ≥ 1 en cada servicio y todos los servicios guardados. Si falla, responde 422 con la lista de campos faltantes (la UI los resalta). Al pasar a `internal_review` notifica a Comercial (owner comercial) para cotizar.
* **Validación de la cotización en el servidor:** las mismas reglas de la UI (enlace válido de la calculadora; proyecto único: valor > 0; fee: valor mensual > 0 y meses ≥ 1); 422 con los campos faltantes. Estado `outdated` cuando cambia el alcance (servicio eliminado o agregado) después de guardada.
* **HubSpot, crear negocios idempotente:** «Crear negocios» solo crea los de servicios sin `hubspot_deal_id` y no perdidos (permite «Crear negocio faltante» si se agrega un servicio después); nunca duplica.
* **Esfuerzo de preventa:** endpoint `GET /api/opportunities/{id}/presales-effort` con horas registradas por persona en la tarea de preventa (no cobrables). El costo (horas × costo hora de `person_hourly_costs`, §12.10) solo para `system_admin`, `commercial`, `executive` y `administrative`.
* **Aviso de revisión:** tipo de notificación `task_review_requested` (en el prototipo, alerta «REVISIÓN») con tarea, quien entregó, revisor y mencionados.
* **Emojis más usados (opcional):** el prototipo los recuerda en el navegador; en producción pueden guardarse como preferencia del usuario (`user_preferences.frequent_emojis`). No es requisito.
* **Fechas:** la API entrega fechas en ISO (`YYYY-MM-DD` o ISO 8601 con hora); la UI las muestra como «2026-Nov-18». No guardar fechas ya formateadas como texto.
* **Lista de proyectos por estado:** `GET /api/projects?status=active|closed|archived|all` (predeterminado `active`) y conteos por estado para el filtro.
* **Eliminar tarea:** `DELETE /api/tasks/{id}` solo para `leader` (del proyecto) y `system_admin`; responde 409 si la tarea tiene registros de tiempo (se debe archivar).
* **Responsables del proyecto:** guardar `commercial_owner_id` (owner de la oportunidad) al convertir y heredar `account_manager_id` (Relación con clientes) de la cuenta. Las alertas de tareas bloqueadas (`task_blocked`) van al líder, al Comercial responsable y a Relación con clientes del proyecto.
* **Eliminar entregable:** `DELETE /api/projects/{id}/deliverables/{deliverableId}` (leader y system_admin) elimina también sus tareas; 409 si alguna tiene registros de tiempo. Tras eliminar una tarea o un entregable en un proyecto único iniciado, el servidor replanifica entregables y tareas no completadas desde `start_date` con el mismo motor del «Iniciar proyecto» (sin tocar la línea base).
* **Crear tarea:** el servidor valida título, entregable, rol, fecha de inicio y de entrega (entrega ≥ inicio) y responde 422 con los campos faltantes.
* **Insumos por gestionar (Mi Día):** endpoint con las dependencias `owner_type = client` y `status = pending` de los proyectos de los que la persona es responsable (líder, Comercial o Relación con clientes), filtradas a vencidas o con `expected_date` dentro de 5 días hábiles, ordenadas por atraso, bloqueante y `expected_date`, con el nombre de la fase (`deliverable_id`) y el conteo de las que quedan más adelante.

## 29. Catálogo de servicios 2026 y cantidad en servicios por unidad (12 Nov 2026)

Fuente: `servicios-uhura-2026-para-eco.xlsx` (catálogo normalizado: 24 servicios + 17 tiempos sueltos, solo roles existentes de ECO). En el prototipo se genera en `templates/catalog2026.ts` desde ese mismo archivo.

* **Carga (sin desarrollo):** cada servicio es una plantilla (fase = entregable, actividad = tarea con rol y horas). La columna *Alcance incluido* es la descripción. Cada tiempo suelto (ej. «Página adicional en sitio web WordPress», 4,5 h) es una plantilla de una unidad.
* **Modalidad sugerida:** la plantilla guarda `service_type` (`fixed_project` | `fee_monthly`); al agregarla al alcance, la cotización preselecciona esa modalidad y el comercial la puede cambiar.
* **Cantidad (mejora, ticket aparte):**
  * `template_activities.unit` (texto, opcional: «PDP», «post», «SKU», «artículo», «campaña»…): si existe, `estimated_hours` es por unidad. `templates.unit_label` = la unidad del servicio.
  * `scope_services.quantity` (entero ≥ 1, por defecto 1) en la línea del servicio en Alcance.
  * Al cambiar la cantidad: en las actividades con `unit`, `estimated_hours = unit_hours × quantity` y el título lleva la cantidad («Diseño gráfico · post (estático) (× 5 posts)»). Las actividades sin `unit` (gestión, aprobación, informe) no se multiplican. Guardar `unit`, `unit_hours` y `quantity` en la actividad cotizada para trazabilidad.
  * El **nombre del servicio y del entregable** también cambia con la cantidad (se guarda el nombre original del catálogo como `base_name`): «Diseño de 1 post (estático)» × 18 → «Diseño de 18 posts (estático)»; «1 campaña de email» × 3 → «3 campañas de email»; «Creativos de pauta (por creativo)» × 3 → «Creativos de pauta (× 3 creativos)»; si el nombre no dice «1 …» ni «por …» se agrega «(× N unidades)». Ese nombre es el que llega a Cotización, al nombre del proyecto y a la fase de las tareas al convertir. Con cantidad 1 vuelve al nombre original.
  * Al convertir se crea **una** tarea por actividad con las horas ya multiplicadas y el título con la cantidad (no N tareas). El rollup por rol que va a la calculadora no cambia de forma.
  * Si el líder edita a mano las horas de una actividad por unidad, `unit_hours = horas / quantity`.

## 30. Ronda 3: ajustes tras la validación en producción (12 Nov 2026)

Salen de la prueba de punta a punta en producción (`orbit-00167-dij`). Aquí van solo las reglas; la diferencia con producción está en el ticket.

**Cambios del prototipo (nuevos):**
* **Fase sugerida de los insumos:** la fase de recolección («Onboarding», «Insumos», «Kickoff», «Kick Off», «Kick-off») nunca es la fase sugerida. Comparar sin importar espacios ni guiones.
* **«Solicitar revisión» abre el panel de solicitud:** el botón rápido ya no pasa la tarea a `review` sin más. Abre el panel con enlace, archivo, mensaje y @menciones, **todos opcionales** (a veces la revisión es solo confirmar cambios hechos en una plataforma externa). Al enviar: la tarea pasa a `review`, queda un mensaje «Solicitó revisión a @revisor» (con el enlace o el mensaje si los hay) y se avisa al líder, al revisor y a los mencionados. Solo se crea un `task_deliverables` si hay enlace o archivo.
* **Timer en las filas de tareas:** mismos controles que el detalle: ▶ iniciar; corriendo: punto, ⏸ pausar / ▶ reanudar y ⏹ detener. La fila debe mostrar el estado «en pausa» y permitir detener sin abrir la tarea.
* **Detalle de la tarea en celular y tablet:** la X de cerrar va arriba a la derecha, en la línea de la ruta (cliente › proyecto › entregable); debajo el título y luego timer y «···». En escritorio, las acciones y la X quedan a la derecha del título.
* **Vista previa de «Iniciar proyecto» = plan real:** la entrega que muestra el modal sale del mismo motor que planifica las tareas (cada entregable mínimo 1 día hábil, festivos de Colombia, rondas). Si el reparto necesita más días que las semanas indicadas, la producción y la entrega mostradas crecen. Nunca mostrar una fecha distinta a la que queda guardada.
* **Iniciar el timer inicia la tarea:** al arrancar un timer sobre una tarea `todo`, pasa a `in_progress` (con registro en Actividad). Las tareas en revisión, listas o bloqueadas no cambian de estado. Iniciar la tarea no reinicia un timer que ya está corriendo.
* **«Pendiente» en Equipo del proyecto:** horas por ejecutar de las tareas abiertas = asignado − ejecutado (nunca negativo).
* **Horas sin asignar (Capacidad → Organización):** tareas abiertas sin responsable, agrupadas por rol cotizado: horas por ejecutar, horas de esta semana (tareas cuyo rango cae en la semana), número de tareas y proyectos. No suman a la carga de ninguna persona.

**Reglas que ya estaban en el prototipo y producción debe cumplir:**
* **Fee: el mes 1 cabe en el mes.** Las tareas del alcance son la plantilla del mes 1 y se planifican en 4 semanas desde el kickoff (`productionWeeks = 4`, sin rondas de ajuste). Ninguna tarea del mes 1 puede vencer después del fin del ciclo.
* **Decimales en la cotización:** se guardan y se muestran con decimales (formato es-CO: `4.500.000,50`); los totales no se redondean.
* **Carga planificada por proyecto (Mi capacidad):** agrupa las horas planificadas de las tareas abiertas de la persona por proyecto; si hay horas planificadas, el desglose no puede quedar vacío.
* **Dependencia manual con fase:** el formulario de «Nueva dependencia» permite elegir el entregable (`deliverable_id`); la fecha esperada sugerida es el inicio de esa fase.
* **Mi Día · «¿Qué requiere mi atención?»:** una tarjeta con contador y filas compactas; la acción es un enlace de texto a la derecha («Ver tarea →», «Listo para revisar →», «Gestionar insumo →»). Los insumos dicen «para {fase} · faltan N días hábiles para que bloquee».
* **Modelo de la propuesta:** el Resumen de la oportunidad muestra el tipo general (Proyecto único, Fee mensual o Mixta) según los servicios; no fijarlo en «Proyecto único».


## 31. Ronda 4: inducción con Dirección y prueba en producción (17–18 Nov 2026)

> **Estado vigente del cronograma de proyecto único (lean esto primero; 19 Nov 2026).** Las subsecciones 31 a 31.12 muestran cómo evolucionó el modelo; donde se contradicen, manda este resumen y la subsección más reciente.
> 1. **Una sola fuente de verdad:** los pasos por fase (`phase_steps`). El modal «Iniciar proyecto», su resumen, «Cronograma y acuerdos», las fechas de las tareas, el aviso de tarea fuera de fase y el insumo tardío salen del mismo cálculo (`schedule/clientTimeline.ts`).
> 2. **Total = semanas de producción × 5 + Σ días de QA del cliente.** El QA interno y los ajustes internos son tareas: van dentro de la producción. El QA del cliente es tiempo del cliente y es lo único que suma días. Días hábiles con los festivos de Colombia.
> 3. **Presentaciones al cliente** por fase, con nombre, tipo (checkpoint o aprobación) y días de QA del cliente y de ajustes. Por defecto según el área del servicio (§31.10). Quitar o agregar presentaciones no cambia la producción total (§31.12).
> 4. **Tareas:** se reparten en los días de trabajo de su fase (producción + trabajo previo a cada presentación; nunca en el QA del cliente). Las tareas de ajustes del cliente van en la ventana de ajustes de la aprobación formal de su fase.
> 5. **Cambios después de iniciar:**
>    - una tarea que pasa el último día de trabajo de su fase pide «Extender la fase» (§31.6);
>    - un insumo bloqueante recibido tarde pide «Recalcular cronograma» (§31.9);
>    - una fecha editada en «Cronograma cliente» recalcula todo lo que sigue y se aplica con «Aplicar al cronograma».
>    - La línea base no cambia; el forecast sí.
> 6. «Rondas incluidas por presentación» ya no es un campo: cada presentación incluye una ronda; una adicional es otra presentación que se cotiza (§31.9).
> 7. «Cronograma y acuerdos» se abre en una **pestaña propia** con su propia dirección, conectada en vivo al proyecto (§31.16). Si el navegador la bloquea, se muestra como modal. Es el primer paso hacia un portal del cliente.

Salen de la presentación de ECO a Dirección y RR. HH. y de la prueba con «PRUEBA CLIENTE». Aquí van las reglas; la diferencia con producción va en el ticket.

**Agenda por capacidad (motor del cronograma, `schedule/scheduleEngine.ts`):**
* Cada tarea tiene una **ventana**: desde que puede empezar (su turno en el entregable) hasta su **fecha límite** (`due_date`, protege la entrega). El **día de trabajo** (`scheduled_date`) es el primer día hábil de la ventana en que al colaborador le cabe la tarea, según lo que ya tiene agendado en **todos** sus proyectos (jornada 8,4 h; festivos).
* Reparto de horas para «Plan» (Capacidad y motor): desde el día de trabajo se llena la jornada y lo que sobra pasa al día siguiente, sin pasar de la fecha límite (`allocateTaskHours`). Reemplaza el prorrateo uniforme entre inicio y vencimiento.
* Si una tarea no cabe en su ventana, queda en el día con más espacio y se reporta como **conflicto** en «Iniciar proyecto», con una persona sugerida **del mismo rol** que sí tenga espacio en esa ventana («Asignar a …»). La persona propuesta en el Alcance puede haberse ocupado entre la cotización y el arranque: la revisión se hace al iniciar.
* Mi Día muestra la tarea desde su día de trabajo hasta la fecha límite (no toda la ventana), así no se acumulan tareas de varios días.

**Cronograma para el cliente en «Iniciar proyecto»:**
* Cada insumo tiene una **fecha acordada con el cliente** (editable en vivo en el kickoff; por defecto, el inicio de la fase). Si un insumo **bloqueante** se acuerda después del inicio de su fase, esa fase y las siguientes se corren hasta esa fecha (`deliverableNotBefore`), y la entrega se recalcula.
* La dependencia se crea con la fecha acordada como `expected_date`.
* El panel «Cronograma para el cliente» muestra fases, rondas, compromisos y entrega final; se **descarga** (PDF desde el navegador) y se **envía por correo** (en producción, con el buzón de ECO). Queda como compromiso de ambas partes, base de las penalidades del contrato.

**Conversión a proyecto:**
* **Líder operativo por área del servicio:** Producto Digital → Product Lead; Creativo → Creative Strategy Lead; Growth → Growth Manager. El área sale del catálogo (por nombre del servicio) y, si no aparece, del área de los roles con más horas. Prefiere a los líderes asignados a la oportunidad. Comercial lo puede cambiar.
* Las notas «Las fechas no se definen aquí…» y «Pendiente de formalización…» pasan a un tooltip («¿Y las fechas?»).
* La ventana de «Propuesta ganada» muestra **todos** los líderes del alcance y **todos** los comerciales asignados.
* El aviso «Oportunidad ganada: la cotización V1 quedó aprobada y congelada» se cierra solo (como los demás avisos).

**Tareas:**
* **Un solo colaborador por tarea.** Elegir otra persona la reasigna. Para trabajo en paralelo (p. ej. dos propuestas de logo) se usa **«Duplicar tarea»**: crea una copia sin colaborador ni horas cargadas y reparte las horas cotizadas a la mitad. Quien solo hace seguimiento va en Seguidores (0 h, notificado solo si lo mencionan).
* **Aprobar y completar / Devolver:** solo el **Project Lead de la tarea** (o su revisor asignado). Los seguidores y colaboradores no ven esos botones. Si el Project Lead se ausenta, se cambia el Project Lead. Tareas legadas sin Project Lead: aprueba un líder o administrador. ⚠ *Cambio (24 Nov 2026, §33.4): «Aprobar» y «Pedir ajustes» los ven los revisores de la tarea; por defecto revisa el líder del proyecto; si el revisor está ausente, ECO sugiere otro.*
* **Retrabajos:** el formulario cambia con el origen. Cliente: causa «Feedback del cliente» (cuenta como ronda; si supera las incluidas se cobra) o «Cambio de alcance» (avisar a Comercial para cotizarlo); «Solicitado por (cliente)». QA/Interno: causa «Error interno detectado en QA» (no consume rondas ni se cobra); «Detectado por». Campo `rework.root_cause`: `client_feedback | scope_change | internal_error`.
* Al guardar horas (cronómetro o manual) el usuario **se queda donde estaba** (tarea o proyecto); no se navega a Mi Día.

**Horas:**
* **Mes cerrado no recibe horas** («si no se cargó a tiempo, se perdió»). Se puede cargar del mes en curso hasta hoy; el mes anterior queda abierto solo hasta el final del **primer día hábil** del mes nuevo. Nada a futuro. Validar también en el servidor (`work_date`). Aplica a todos los perfiles; las correcciones después del cierre semanal siguen la regla de §10.
* **Horario por calendario:** Colombia 8:00–18:00; México 9:00–19:00 (hora Colombia). El recordatorio de horas sale a las 4:00 p. m. (Colombia) o 5:00 p. m. (México), hora Colombia.

**Capacidad:**
* **Ritmo personal** = horas cargadas ÷ horas **planeadas** hasta hoy en la semana (incluye tareas ya completadas). Sin tareas planeadas hasta hoy: «Sin plan aún» (nunca «Rezagado»). La vista Organización mantiene el ritmo contra la capacidad.
* Al elegir un día: lista **«Agendado»** (tareas de la persona con horas planeadas ese día, con su proyecto y fecha límite; clic abre la tarea) además de los registros del día. Sirve para adelantar trabajo de otros días.
* Las tarjetas de entregable del proyecto muestran **horas cargadas / cotizadas** además del avance por tareas completadas.

**Fee mensual:**
* Al abrir cada mes, el líder decide qué pasa con las horas no usadas del mes anterior: **regla del contrato** (por defecto) o excepción solo para ese mes (no pasan / pasan todas / hasta 25 %). Campo `projects.rollover_overrides` (clave = mes que recibe, `YYYY-MM`).

**New Business:**
* **Pedir ajuste de alcance** (Comercial, después de marcar el alcance listo y antes de ganar): nota obligatoria; la oportunidad vuelve a «en elaboración» y les llega a los líderes del alcance en Mi Día («🔁 Ajustar alcance: …»). Se limpia al volver a «Marcar alcance listo». Campo `opportunity.scope_change_request`.
* En Alcance la columna de la persona se llama **«Colaborador»** (es quien ejecuta la tarea que se crea).
* El brief **no** se sincroniza desde HubSpot (las notas del lead/negocio no traen el brief): Comercial lo escribe en ECO.
* Aviso de cotización: se recalcula al corregir los campos (no queda el texto de un intento anterior).

**Proyectos internos:** un proyecto del cliente Uhura nace **no facturable** (`internal_non_billable`), por ejemplo Administrativo, Finanzas o RR. HH., para que esas áreas puedan crear tareas y cargar horas.

**Perfil:** «Sueño» pasa a **«Mi propósito»** (campo `personal_dream` sin cambio de nombre).

**Correo semanal a líderes (pendiente del buzón):** los viernes, a cada líder, cómo cerró la semana su equipo: quién cargó sus horas (meta diaria de §24) y quién no, con enlace a Capacidad. Se configura en Correos.

### 31.1 Ajustes tras la revisión del prototipo (19 Nov 2026)

**Cronograma y acuerdos para el cliente (`projects/ClientKickoffView.tsx`, `schedule/clientTimeline.ts`):**
* Vista amplia para proyectar en el kickoff. Se abre desde «Iniciar proyecto» y, con el proyecto ya iniciado, desde el botón «Cronograma cliente» del encabezado. Si algo quedó mal, se corrige con «Ajustar» (fechas, rondas, insumos) y se vuelve a abrir. Se descarga como PDF y se envía por correo.
* **Nunca muestra horas internas ni tarifas** (regla del SOW).
* Contenido de un **proyecto único**: quién está a cargo (líder, **líder suplente**, comercial o relación con el cliente, equipo); cómo se trabaja cada fase; cronograma por fase con sus hitos; insumos del cliente con la fecha acordada y qué pasa si no llegan; y los acuerdos.
* Pasos de cada fase: producción → QA interno → presentación → aprobación del cliente → ajustes de Uhura.
* Hitos de una fase que revisa el cliente: producción (inicio → fin) → QA interno (último día de producción) → **presentación** al cliente (fecha tentativa; asisten el líder y el comercial o relación con el cliente, más los técnicos de esa fase si hace falta) → **ventana de aprobación** del cliente (días por ronda − 2) → **ajustes de Uhura** (2 días hábiles, una ventana, no 16 h). Una ronda = presentación + aprobación + ajustes. El total de días no cambia.
* **Las rondas se reparten entre las fases que el cliente revisa.** Prioridad: fases marcadas «gate/aprobación»; si no hay, todas menos las de arranque o cierre (Onboarding, Insumos, Kickoff, Entrega, Cierre). Antes todas caían en la última fase. La fecha de entrega no cambia.
* Contenido de un **fee mensual**:
  * cómo funciona cada mes: semana 1, planeación y aprobación de la parrilla en 3 días hábiles; semanas 2 y 3, producción y QA; durante el mes, publicación o ejecución; semana 4, reporte y reunión de resultados;
  * lo que recibe cada mes: las tareas del primer ciclo agrupadas por frente, sin horas;
  * los acuerdos del fee.
* **Acuerdos sugeridos** (resumen del SOW; prevalece el contrato firmado; validar con Dirección):
  * rondas incluidas; las adicionales se cotizan;
  * aprobación tácita si el cliente no responde en la ventana;
  * comentarios consolidados por un solo interlocutor;
  * un insumo bloqueante tardío corre la fase y la entrega los mismos días;
  * si la espera supera 10 días hábiles, el proyecto se pausa y se reprograma;
  * los cambios de alcance se cotizan antes de ejecutarse;
  * el líder suplente asume en ausencias.
* **Líder suplente** (`projects.backup_lead`): se elige en «Iniciar proyecto» entre líderes, dirección y administración. Asume el proyecto si el líder está de vacaciones o ausente.

**New Business:**
* **Responsables del alcance = líderes de área** (`leader`, `executive`, `system_admin`). Comercial y Client Relationship van solo en «Responsable comercial». Así «Solución & Scoping» y «Comercial estrella» coinciden con lo asignado al crear la oportunidad.
* **Sugerencia de colaborador en Alcance:** solo personas con **el mismo rol oficial**. Dos roles oficiales distintos nunca son equivalentes: Creative Designer ≠ Digital Designer y Content Creator ≠ Digital Content Specialist. Sin candidatos, la actividad queda «Sin colaborador». Antes caía a todo el equipo.
* Personas inactivas (p. ej., quien ya no está en Uhura) nunca se sugieren ni se asignan.
* **Confirmar servicios ganados** (ventana previa a la celebración): Comercial marca qué servicios aprobó el cliente; solo esos se convierten. Producción hoy celebra sin preguntar: implementar esta ventana antes de la celebración.
* Las horas se muestran con un decimal y formato es-CO, por ejemplo «42,1 h». Nunca el número crudo, como «42.10000000000001 h».
* El botón de la conversión dice **«Crear proyecto»** o **«Crear proyectos»**.
* **Edición después de ganar:** la cotización ganada queda congelada y no se reescribe en silencio el negocio cerrado en HubSpot. Un cambio pedido por el cliente después de ganar se maneja como **orden de cambio**: nueva versión o nueva oportunidad (upsell) con su propio negocio en HubSpot; los proyectos ya creados no se modifican solos. Antes de ganar, cada guardado crea una versión y actualiza los valores en HubSpot (ECO → HubSpot); de HubSpot a ECO solo llega la etapa.

**Interfaz:** «Iniciar proyecto», «Ver proyecto» y «Cronograma cliente» son botones tipo píldora, compactos y en una sola línea, también en tablet. El encabezado de cada servicio en Alcance tiene dos filas: título con acciones a la derecha, y horas, semanas y cantidad debajo.

### 31.2 Cronograma y acuerdos editable (19 Nov 2026)

* **Fases con pasos editables** (días hábiles; Colombia: sin fines de semana ni festivos): producción → QA interno → por cada ronda: presentación + QA del cliente (aprobación) → ajustes. Se pueden agregar o quitar presentaciones por fase. Las fases van una tras otra desde el arranque. **Cualquier cambio recalcula las fases, la entrega final y las tareas** (las tareas se reparten dentro de la producción de su fase, con agenda por capacidad). Campo `projects.phase_steps` (por fase: `production_days`, `qa_days`, `rounds[{review_days, adjust_days}]`).
* **Antes de iniciar:** lo que se edita en «Ver cronograma y acuerdos» se usa al confirmar «Iniciar proyecto».
* **Proyecto iniciado:** «Cronograma cliente» → «Editar» → **«Aplicar al cronograma»**. Reprograma las fases y las tareas abiertas (no las completadas), la fecha de fin y el forecast. La línea base no cambia.
* **Insumos («Lo que necesitamos de ti»):** la fecha sugerida es el inicio de la fase y se puede editar. Un insumo bloqueante con fecha posterior al inicio de su fase corre la fase.
* **Acuerdos:** lista simple (sin tarjetas) que se puede editar; se agregan o se quitan. Campo `projects.client_agreements`.
* **Quién está a cargo:**
  * líder del proyecto;
  * **equipo líder**: las personas con más horas asignadas, sin el líder ni Comercial;
  * relación y aprobaciones con el cliente (Comercial);
  * **encargado del cliente** y su **suplente**, por si sale a vacaciones. Por defecto, el contacto del cliente (HubSpot).
  * Campos `projects.client_approver_name` y `client_approver_backup_name`.
  * Se elimina el «líder suplente» de Uhura.
* **Acuerdo de continuidad:** si el encargado del cliente no está, aprueba su suplente; si ninguno responde dentro de la ventana, la entrega se da por aprobada.
* **Responsable comercial** (New Business): Comercial, Client Relationship y Dirección, p. ej. Catalina, Luisa y Ana María. Es quien sale en «Comercial estrella».
* **Capacidad:**
  * «Tu avance» / «Avance del equipo», con estados «Vas al día», «Vas adelantado», «Tienes horas por cargar» y «Sin plan aún» (nunca «Rezagado»);
  * los encabezados del día son «Agendado» y «Tiempos registrados»;
  * el **próximo festivo** se muestra en la barra lateral de **Mi Día**.
* **Mensaje al convertir:** «🎉 N proyectos creados. Siguiente paso: «Iniciar proyecto»».
* En un proyecto, «Iniciar proyecto» es el único botón principal; «Nuevo insumo» y «Nuevo entregable» son secundarios (contorno).
* Perfil: «Mi propósito y/o sueño es…».

### 31.3 Ajustes del 19 Nov 2026 (segunda revisión)

* **Mi Día · Radar del equipo** = vacaciones y ausencias + **cumpleaños** + **aniversarios en Uhura**, de los próximos 30 días y con la **fecha real de hoy** (cruzando meses y años). El prototipo tenía los cumpleaños fijos al 19 de octubre y no mostraba aniversarios. Fuentes: `birth_date` y `anniversary_date`/fecha de ingreso. Personas inactivas, nunca.
* **Semana corta (Mi Día):** «Se viene semana corta: el {día} es festivo; esa semana tienes {capacidad − 1 día} h en vez de {capacidad} h». Según el calendario de la persona (Colombia o México).
* **Pedir ajuste de alcance → notificación obligatoria** (en la app y por correo cuando exista el buzón) a **todos los líderes del alcance** de la oportunidad (`lead_user_ids`), con la nota de Comercial. Se marca como atendida al volver a «Marcar alcance listo». Botón con ícono de devolver (↶).
* **Alcance listo:** una vez marcado, solo se ve el tag «Listo para cotizar», sin un botón que invite a hacer clic.
* **Aviso de conversión:** el texto corto lleva solo un enlace de texto «Ver proyecto». «Ver cliente» y «Ver proyecto» ya están en el encabezado.
* **Encabezado del proyecto:**
  * Fila 1: cliente y tipo a la izquierda; acciones («Iniciar proyecto» o fechas, «Cronograma cliente», ⋮) a la derecha, en la misma línea también en tablet.
  * Fila 2: título a todo el ancho con corte equilibrado (`text-wrap: balance`).
* **Modal «Iniciar proyecto»:**
  * Campos en grilla simétrica, con la misma altura y la etiqueta arriba. Fee: kickoff · vigencia · horas no usadas. Proyecto único: kickoff · semanas.
  * Cada insumo se puede **quitar** con un ícono sutil. Desmarcarlo lo excluye sin borrarlo.
* **Proyecto único: siempre por fases.**
  * Arranque, vista previa y cronograma salen del mismo cálculo: producción → QA interno → por ronda: presentación + aprobación del cliente → ajustes. Sin edición, los pasos se derivan del reparto automático.
  * Las **tareas de ajustes del cliente** («Aplicación de ajustes», «Ajustes de/del cliente», «Ronda…», «Post-entrega», «Retrabajo») se ubican en la **ventana de ajustes** de las rondas de su fase, no en producción.
  * Las tareas de producción que dicen «ajustes» (p. ej. «Ajustes visuales sobre base») se quedan en producción.
* **Catálogo:** solo 10 de 35 servicios de proyecto único cotizan horas de ajustes de cliente. Las ventanas de ajustes están en el cronograma, pero sin una actividad cotizada esas horas no existen en el presupuesto. Recomendación para los líderes: agregar «Ajustes ronda de cliente» en cada fase que el cliente revisa.
* **«Cronograma y acuerdos» compacto:**
  * Encabezado más bajo, con «Inicio» y «Entrega final» siempre visibles.
  * Flujo de una línea: producción → QA interno → presentación → tu aprobación → ajustes → siguiente fase.
  * Tabla **«Entregables y fechas»**: fase, qué incluye (títulos de sus tareas, sin horas), producción, presentaciones con su aprobación y sus ajustes, y fin de fase. Es editable en línea.
* **«Lo que necesitamos de ti» resaltado:** un insumo bloqueante tardío corre la fase y la entrega; más de 10 días hábiles pausa el proyecto. Acuerdo nuevo: si la pausa supera 30 días calendario, se factura lo ejecutado y el reinicio se agenda de común acuerdo.

**Dónde cargar el tiempo que no es de un proyecto de cliente.** Todos son proyectos internos del cliente Uhura, no facturables; así cuentan en Capacidad sin ensuciar la rentabilidad de los clientes:

| Tiempo | Dónde |
|---|---|
| Comité operativo, weekly general, 1:1, dailies | Proyecto interno **«Rituales del equipo»** (una tarea recurrente por ritual) |
| Reuniones con leads o prospectos, aun sin HubSpot o si resultan «lead basura» | **«New Business · Prospección»** (tarea general); cuando ya existe la oportunidad, su tarea de scoping |
| Innovación, ECO, formación, retos al equipo | **«Innovación y retos»** |
| Administrativo, Finanzas, RR. HH. | Su proyecto interno |
| Seguimientos y weeklies **de un cliente** | El proyecto de ese cliente (regla de Dirección), en la tarea «Gestión y seguimiento con el cliente» |

### 31.4 Cronograma editable por fechas y aprobación del cliente (19 Nov 2026)

* **«Cómo avanza tu proyecto»:** el flujo real, fase por fase y con fechas: fase (producción) → QA interno → **Presentación** (destacada) → **QA del cliente · N días** (otro color, con borde: es la ventana crítica) → Ajustes · N días → siguiente fase.
* **«Entregables y fechas»:** fase · qué incluye · fechas de la fase · QA interno · presentación · QA del cliente (días y fecha límite) · ajustes. No muestra la columna de producción.
* **Edición por fechas** (en la reunión se habla de fechas, no de días). Cada fecha se traduce a días hábiles y **todo lo que sigue se corre**, incluidas la entrega final y las tareas:
  * fecha de la **presentación 1** → días de producción de la fase (sin contar el QA interno);
  * fecha de la **presentación 2 o siguientes** → días de ajustes de la ronda anterior;
  * **«QA del cliente hasta»** → días de aprobación de esa ronda;
  * **fin** de una fase sin presentaciones → sus días de producción;
  * el QA interno y los ajustes se editan en días.
  * Se guarda como pasos (`phase_steps`), no como fechas sueltas: así un cambio arriba arrastra todo lo de abajo.
* **Aprobación del cliente** (`projects.client_schedule_approval {name, date}`): al final de la vista, «Registrar aprobación» con el nombre de quien aprueba. En el PDF sale una línea de firma si aún no está aprobado. Si alguna fecha no le sirve al cliente, se mueve en la misma reunión antes de aprobar.
* **Acuerdo de facturación** (sugerido, editable): 50 % al iniciar y 50 % en la entrega final; si la entrega se corre más de 15 días hábiles por causas del cliente, el segundo pago se factura en la fecha original.
* **Mi Día:**
  * cumpleaños y aniversarios dicen «Hoy», «Mañana» o «En N días»;
  * el aviso de semana corta ya no menciona horas;
  * en Alcance, las horas y semanas del servicio van al lado del título.

### 31.5 Modelo único de cronograma para proyecto único (19 Nov 2026; reemplaza lo de rondas de §31–31.4)

**Problema:** las fechas salían de dos modelos y el término «ronda» mezclaba dos cosas.
* El modal partía «rondas × días» en aprobación + ajustes (3 días = 1 de QA del cliente + 2 de ajustes).
* La vista del cliente calculaba sus pasos por otro camino.
* «Ronda» se usaba a la vez para las veces que el cliente puede pedir cambios (contrato) y para los momentos del cronograma.

**Modelo único (una sola fuente de verdad: los pasos por fase, `phase_steps`):**
* **Producción:** las semanas del alcance × 5 días hábiles, repartidas entre fases según sus horas (mínimo 1 día por fase).
* **Cada fase que revisa el cliente** (todas menos Onboarding, Insumos, Kickoff, Entrega y Cierre) tiene: QA interno (1 día) → **una presentación** → **QA del cliente (N días)** → **ajustes de Uhura (N días)**.
* **En el modal «Iniciar proyecto»:** «QA del cliente __ días · Ajustes __ días · Rondas incluidas __, por presentación». Cambiar el QA o los ajustes se aplica a todas las presentaciones, también si ya se editaron fases.
* **«Rondas incluidas» es contrato, no cronograma:** cuántas veces el cliente puede pedir cambios en cada presentación. Si usa una ronda extra, se agrega otra ventana de QA y ajustes, corre el forecast y se cotiza.
* El modal, su resumen («Producción X d · QA interno Y d · N presentaciones…»), «Ver cronograma y acuerdos», el plan de tareas y lo que se guarda al iniciar salen del **mismo** cálculo. Se guardan `phase_steps` al iniciar, aunque no se hayan editado.
* **Tareas → cronograma:** las fechas de las tareas se derivan de las fases. Mover una tarea dentro de su fase no cambia los hitos. Recomendación para la siguiente iteración: si una tarea se mueve más allá del fin de su fase, ECO avisa «esto corre la presentación del {fecha}» y ofrece extender la fase (se guarda en `phase_steps` y recalcula lo que sigue).
* Vista del cliente con un solo tamaño de texto (13 px). Los títulos de sección son de 16 px.

### 31.6 Tarea → cronograma: aviso y extensión de fase (19 Nov 2026)

* Al cambiar la fecha límite de una tarea de un **proyecto único ya iniciado** (con `phase_steps`), si la nueva fecha **pasa el fin de la producción de su fase**, ECO no corre nada en silencio: muestra «Esta fecha corre el cronograma».
  * Muestra los días hábiles que habría que extender la fase y qué se corre: cada presentación (antes → después) y la entrega final.
  * **Extender la fase:** se suman esos días a la producción de la fase (`phase_steps`); se recalculan fases, presentaciones, entrega y forecast (la línea base no cambia); se reprograman las tareas abiertas de las **fases siguientes** con agenda por capacidad. Las tareas de la misma fase y la tarea movida no se tocan.
  * **Solo mover la tarea:** queda con su nueva fecha; el cronograma no cambia y la fase queda en riesgo.
* No aplica a tareas de ajustes del cliente (van en la ventana de ajustes) ni a fechas que caben dentro de la fase.
* Si el cambio lo pidió el cliente, se le avisa la nueva fecha; si es interno, se busca apoyo del mismo rol antes de correr la entrega.
* Prototipo: `schedule/clientTimeline.ts` (`detectPhaseOverflow`), `projects/PhaseOverflowModal.tsx`; se dispara desde el cambio de fechas en el detalle de la tarea.

### 31.7 Presentaciones al cliente configurables (19 Nov 2026; precisa §31.5)

* El modal «Iniciar proyecto» ya no usa un número único de QA y ajustes. Muestra la lista **«Presentaciones al cliente»**; cada una tiene:
  * **nombre** (Wireframe, Prototipo, Implementación…);
  * **tipo:** **checkpoint** (revisión informal: el cliente comenta, ajustamos y seguimos sin exigir aprobación por correo) o **aprobación formal**;
  * **QA del cliente** (días hábiles);
  * **ajustes internos** (días hábiles; ventana, no horas);
  * se puede quitar.
* **Por defecto:** una aprobación formal por fase que revisa el cliente. La primera tiene 5 días de QA del cliente (p. ej. prototipo) y las siguientes 3 (p. ej. implementación). Ajustes internos: 2 días.
* **«+ Checkpoint de wireframe»** parte la producción de la primera fase revisada: primero el wireframe, con un checkpoint de 2 días de revisión y 1 de ajustes; luego el resto de la producción y el QA interno antes de la aprobación formal (p. ej. prototipo).
* **«+ Presentación en…»** agrega otra aprobación a la fase que se elija.
* **Rondas de cambios incluidas por presentación:** sigue siendo un dato del contrato, no del cronograma.
* **Modelo de cada presentación:** `rounds[{label, kind: 'checkpoint'|'approval', review_days, adjust_days, work_days, qa_days}]`. `work_days` y `qa_days` son el trabajo y el QA interno antes de esa presentación (desde la 2.ª de la fase).
* **Al editar la fecha de una presentación 2+** en la vista del cliente, cambian sus días de trabajo previos.
* El resumen del modal lista cada presentación: «Prototipo (aprobación: QA cliente 5 d + ajustes internos 2 d)». La vista del cliente muestra el checkpoint con borde punteado y «Revisión del cliente», y la aprobación formal destacada como «QA del cliente».
* Caso landing «presentada sobre la implementación»: se quitan las presentaciones de UX y queda una sola en Implementación con 1 día de QA del cliente.

### 31.8 Editor de presentaciones simplificado (19 Nov 2026; reemplaza los botones de §31.7)

* **«Presentaciones al cliente»** es una tabla: presentación · fase · tipo (checkpoint/aprobación) · **QA interno** · **QA del cliente** · **ajustes internos** (días hábiles) · quitar. Un solo botón **«+ Añadir presentación»**.
  * Cambiar la fase mueve la presentación a esa fase.
  * El QA interno de la 1.ª presentación de una fase es el de la fase; el de las siguientes es propio.
* **Por defecto** (proyectos con fase de UX/diseño):
  * **Wireframe** (checkpoint: QA del cliente 2 d, ajustes 1 d);
  * **Prototipo** (aprobación: QA del cliente 5 d, ajustes 2 d);
  * **Funcionalidad** en Implementación (aprobación: QA del cliente 3 d, ajustes 2 d);
  * QA interno de 1 día antes de prototipo y funcionalidad.
* Sin fase de UX: una aprobación por fase revisada.
* Se elimina el campo «Rondas de cambios incluidas»: cada presentación incluye una ronda de ajustes; una adicional se agrega como otra presentación y se cotiza.
* El resumen muestra la suma explícita: «Producción X + QA interno Y + QA del cliente Z + ajustes internos W = N días hábiles».
* **Ejemplo verificado** (landing de 2 semanas desde el 23 de noviembre, festivo del 8 de diciembre):
  * 10 d de producción + 5 + 2 (prototipo) + 3 + 2 (funcionalidad) = **22 días → 23 de diciembre**;
  * con 1 día de QA interno antes de cada aprobación son 24 días: 28 de diciembre, porque el 25 es festivo;
  * con el checkpoint de wireframe por defecto (2 + 1) son 27 días: 31 de diciembre.

### 31.9 Insumo recibido tarde y rondas adicionales del cliente (19 Nov 2026)

**Insumo recibido tarde (implementado en el prototipo):**
* «Marcar recibido» guarda `received_at`. Si el insumo **bloquea**, su fecha acordada ya pasó y la recepción **corre** la fase (es decir, la fase ya debía haber empezado), ECO pregunta «Este insumo llegó tarde».
  * Muestra los días hábiles de retraso y qué se corre: presentaciones y entrega final, antes → después.
* **Recalcular cronograma:**
  * marca `dependency.shifts_schedule = true`: la fase no empieza antes del día hábil siguiente a la recepción;
  * recalcula fases, presentaciones, entrega y forecast (la línea base no cambia);
  * reprograma las tareas abiertas.
* **Mantener fechas:** el equipo absorbe el retraso y el cronograma no cambia.
* Si llegó tarde pero la fase todavía no empezaba, no se pregunta nada.
* El aviso recuerda que es un retraso del cliente: se le informa la nueva fecha y aplica el acuerdo de facturación (segundo pago en la fecha original si el corrimiento supera 15 días hábiles).

**Rondas adicionales del cliente (recomendación, pendiente de implementar):**
* **Qué hay hoy:**
  * cada tarea registra **retrabajos** (origen cliente/QA, causa, horas);
  * el proyecto tiene el modelo `ProjectReworkRound` con `is_additional_iteration`, pero no está conectado al cronograma;
  * el chip «Rondas de ajuste» del encabezado solo informa.
* **Regla propuesta:** cada presentación incluye **una** ronda de ajustes. Si el cliente pide otra:
  1. En el proyecto, sobre esa presentación: **«Registrar ronda adicional»**. Agrega otra ventana de QA del cliente + ajustes internos, con el mismo aviso de «qué se corre», y crea el registro `ProjectReworkRound` con `is_additional_iteration = true`, la nota del cliente y las horas estimadas.
  2. **Aviso a Comercial** (en la app y en Google Chat) para cotizarla como orden de cambio: horas × tarifa. La ronda **no se ejecuta** hasta que el cliente la aprueba (acuerdo «las adicionales se cotizan antes de ejecutarlas»).
  3. El corrimiento queda atribuido al cliente (forecast ≠ línea base) y no mueve el segundo pago más de lo pactado.
  4. **Dirección y Finanzas** cuenta las rondas adicionales por cliente y por servicio, para ajustar recetas y precios.
* **Ajustes pequeños** que no justifican otra ronda: se registran como retrabajo de la tarea (origen cliente), sin mover el cronograma. Si se acumulan más de X horas, el líder los convierte en ronda adicional.

### 31.10 Presentaciones por área del servicio (19 Nov 2026)

La lógica es la misma en todas las áreas: presentación → QA del cliente → ajustes, con checkpoint (informal) o aprobación formal. Lo que cambia es el **nombre** y la **fase** donde va cada presentación. El área sale del catálogo, por el nombre del servicio, o de los roles con más horas. Reglas en `schedule/clientTimeline.ts` (`PRESETS`, `presetPresentations`).

| Área | Servicio (ejemplo) | Presentaciones por defecto |
|---|---|---|
| Producto Digital | Landing / sitio WordPress | Wireframe (checkpoint 2 d + 1 d) · Prototipo (aprobación 5 d + 2 d) · Funcionalidad (aprobación 3 d + 2 d) |
| Producto Digital | Tienda Shopify | Diseño de la tienda (5 + 2) · Funcionalidad, en «QA funcional» (3 + 2) |
| Producto Digital | Chatbot · Mercado Libre · Digital Shelf | Flujo conversacional + Funcionalidad · Publicaciones · Contenido e Imágenes de PDP |
| Creativo | Posts, parrilla, piezas, mailing, creativos de pauta | «Piezas / Mailing / Creativos para aprobación» en «Entrega de material» (3 d) |
| Creativo | Creatividad y campañas (KV) | Concepto creativo (checkpoint) · Propuestas de key visual (aprobación) |
| Creativo | Diseño de marca | Naming (aprobación) · Marca, en «Presentación de marca» (5 d) |
| Growth | SEO / GEO | Keywords (checkpoint) · Estrategia SEO / GEO (aprobación 5 d) |
| Growth | Medición y tracking | Validación de la medición · Dashboard |
| Growth | Pauta · Blog · Email · CRO · Onboarding | Plan de medios + Anuncios · Calendario editorial + Artículos · Diseño de correos · Backlog de experimentos + Resultados (checkpoint) · Objetivos |

* **Creativo:** el catálogo ya trae «Calidad» (QA interno) y «Ajustes de cliente» (el trabajo de ajustes) como fases. Por eso la presentación no suma días extra de QA ni de ajustes: esas fases ya tienen su tiempo.
* Si ninguna regla aplica (servicio nuevo o fuera del catálogo), queda una aprobación por fase revisada con el nombre de la fase.
* Todo se puede renombrar, mover, agregar («+ Añadir presentación») o quitar en «Iniciar proyecto».

### 31.11 Solo el QA del cliente suma días (19 Nov 2026; precisa §31.7–31.10)

* **Regla:** el QA interno y los ajustes internos son **tareas con horas**, así que ya están dentro de las **semanas de producción** del alcance. El **QA del cliente** no es tarea de nadie (nadie carga horas ahí): es tiempo del cliente y **es lo único que suma días hábiles**.
  * **Total = semanas de producción × 5 + Σ días de QA del cliente.**
  * Ejemplo: landing de 2 semanas, con QA del cliente de 2 + 5 + 3 días = 20 días hábiles. Desde el 23 de noviembre, con el festivo del 8 de diciembre, la entrega cae el **21 de diciembre**.
* **Cómo se ubica:** la ventana de ajustes de cada presentación se **descuenta de la producción de su fase**; las tareas de ajustes del cliente se agendan en esa ventana. El QA interno queda al final de la producción (`qa_days = 0`).
  * Si una fase corta no alcanza a absorber sus ajustes, el excedente sale de las fases con más producción, para que se cumplan las semanas del alcance.
  * Subir los días de ajustes en el editor los toma de la producción de esa fase.
* **Editor:** sin columna de QA interno. «Ajustes» indica que es una ventana de tareas, dentro de la producción. Resumen: «Producción N (incluye QA interno y ajustes) + QA del cliente M = T días hábiles».
* **Condición:** para que esto sea cierto, cada servicio debe tener cotizadas sus tareas de QA interno y de ajustes de cliente. Revisión del catálogo 2026 (servicios de varias fases):
  * **QA interno:** lo tienen todos menos «Onboarding Growth» e «Implementación de SEO».
  * **Ajustes de cliente cotizados:** solo landing, sitio web y los 5 servicios de Creativo. **Faltan** en Shopify, Chatbot, Mercado Libre, Digital Shelf y en todos los de Growth.
  * Recomendación para los líderes de Producto y de Growth: agregar «Ajustes de cliente» por cada presentación. Si no, esas horas no existen en la cotización, el proyecto se pasa de horas y la ventana de ajustes queda sin tareas.

### 31.12 Quitar o agregar presentaciones no cambia la producción (19 Nov 2026)

* **Error corregido:** al quitar la presentación de wireframe se perdían su ventana de ajustes y el trabajo previo del prototipo. En un sitio web de 8 semanas, la producción bajaba de 40 a 33 días.
* **Regla:** quitar una presentación devuelve a la producción de su fase sus días de ajustes y su trabajo previo (`removeRound`). Agregar una descuenta sus ajustes de la producción (`appendRound`). La producción total siempre es igual a las semanas del alcance × 5. Así, en el ejemplo, 40 de producción + 8 de QA del cliente = 48 días hábiles.
* El trabajo previo (`work_days`) de una presentación cuenta también si queda como primera de su fase.

### 31.13 QA de la ronda 4 (19 Nov 2026)

Errores encontrados y corregidos en el prototipo:
* **Tareas del prototipo en el día del wireframe:** las tareas solo se repartían en la producción de la fase. Con wireframe, todo caía antes del checkpoint. Ahora se reparten en todos los días de trabajo de la fase (`phaseWorkDays`).
* **Falso aviso de «corre el cronograma»:** se comparaba con el fin de la producción del wireframe. Ahora se compara con el último día de trabajo de la fase, y la extensión se suma a ese último tramo.
* **Tareas de ajustes en una ventana demasiado amplia** (del wireframe al prototipo): ahora van en la ventana de ajustes de la aprobación formal.
* **Primer día hábil del mes** para el cierre de horas: ahora salta los festivos (p. ej. el 1 de enero).
* **Quitar el wireframe** borraba 7 días de producción (§31.12).
* Se limpió estado sin uso del modal anterior: rondas × días, QA del cliente global y líder suplente.

Verificado con casos de cálculo: landing de 2 y 3 semanas, sitio web de 8 semanas, ocho servicios de las tres áreas, tarea dentro y fuera de su fase, insumo tardío y ventana de horas en enero. **Falta recorrer las pantallas.**

### 31.14 Enlace vencido y pedir un enlace nuevo (19 Nov 2026; existe en producción, ahora también en el prototipo)

* **«Este enlace ya no sirve»:** el enlace de un solo uso para crear o recuperar la contraseña ya se usó o venció. Ofrece «Pedir un enlace nuevo» (botón principal) y «Volver a ingresar».
  * Usa el mismo diseño de la pantalla de ingreso: panel con ECO y el pie «By Uhura Group · ECO».
  * Prototipo: `?app=eco&login=enlace-vencido`.
* **Pedir un enlace nuevo** (mismo texto que producción): «¿Olvidaste tu contraseña?», «Escribe tu correo corporativo o tu usuario de ingreso y te enviamos un enlace para crear una contraseña nueva.», campo «Correo o usuario», botón «Enviar enlace» y «Volver a ingresar».
  * La respuesta es siempre la misma, exista o no la cuenta (para no revelar usuarios): «Si hay una cuenta con ese usuario, te enviamos un enlace nuevo. Sirve una sola vez y vence pronto».
  * Ofrece «Volver a ingresar» y la ayuda «¿No te llegó? Revisa spam o pídeselo a Administración».
* **«¿Olvidaste tu contraseña?»** en el ingreso lleva directo a esa pantalla, como en producción. La contraseña temporal de Administración queda como alternativa si el correo no llega.
* Depende del buzón de notificaciones de ECO (§26). Recomendado: enlace válido 30 minutos, un solo uso, y máximo 3 solicitudes por hora por usuario.

### 31.15 Las semanas del alcance mandan (19 Nov 2026)

* **Producción total = semanas del alcance × 5 días hábiles, siempre que quepa.** Incluye el trabajo, el QA interno y los ajustes internos, que son tareas. Solo el QA del cliente se suma aparte.
  * Ejemplo: 1 semana = 5 días de producción + 3 días de QA del cliente = 8 días hábiles; desde el 23 de noviembre, la entrega cae el 2 de diciembre.
* **Editar presentaciones** (agregar, quitar, cambiar días de ajustes o mover de fase) no cambia el total de producción. Lo que sobra o falta se compensa en la fase con más producción (`rebalanceToTarget`).
* **Si no cabe**, se avisa en el modal en vez de alargar en silencio: «No cabe en N semanas: F fases (mínimo 1 día cada una) y sus ajustes necesitan al menos M días. Sube las semanas o quita presentaciones». El mínimo es 1 día por fase más los días de ajustes.
* **Alcance corto por defecto:** si las presentaciones sugeridas no caben (p. ej. landing de 1 semana), ECO deja solo la presentación final, con 1 día de ajustes (o 0 si aun así no cabe).
* El resumen dice «Producción X de Y (N semanas, incluye QA interno y ajustes) + QA del cliente Z = T días hábiles».
* **Cambios hechos a propósito en «Cronograma y acuerdos»** después del kickoff (mover una presentación más tarde, extender una fase) sí pueden pasar del alcance: quedan como forecast frente a la línea base.

### 31.16 Revisión del 19 Nov 2026 (tarde)

**«Cronograma y acuerdos» en pestaña propia.**
* Antes la ventana nueva quedaba en blanco y «Cronograma cliente» no hacía nada: la ventana se abría vacía y se le «pintaba» el contenido desde ECO, y algunos navegadores no lo permiten.
* Ahora es una **página con su propia dirección**.
  * Prototipo: `?app=eco&cronograma=1`. Los datos van entre pestañas por `BroadcastChannel`, con localStorage de respaldo (`projects/clientScheduleBridge.ts`, `projects/ClientScheduleWindow.tsx`).
  * Lo que se edita en una pestaña se ve en la otra. Si ECO se cierra, la pestaña muestra la última versión con el aviso «no está conectada a ECO».
* **Producción:** la ruta `/proyectos/:id/cronograma` lee el proyecto del backend (misma pantalla, sin canal entre pestañas). Con permiso de solo lectura, es la base del portal del cliente.

**Vista más liviana.**
* Encabezado blanco: nombre del proyecto, inicio y entrega final.
* Acciones discretas: Editar, PDF, Correo, Cerrar.
* «Quién está a cargo» sin tarjetas.
* **Una sola lista «Cronograma»**: una fila por fase con sus hitos (producción, QA interno, presentación o checkpoint, QA del cliente, ajustes). Reemplaza el flujo de chips y la tabla de 7 columnas.
* Solo tres acentos de color:
  * morado para la presentación (punto hueco si es checkpoint);
  * ámbar para el tiempo del cliente;
  * gris para el trabajo interno.
* «Lo que necesitamos de ti» con borde ámbar. Acuerdos en lista numerada.
* En «Editar», las mismas filas muestran los campos de fecha y días.

**Reglas de New Business para Indunova: alcance editado después de cotizar y volver a guardar la cotización.**

*Problema en el prototipo (y a revisar en producción):*
* El líder agregó un servicio (landing) a un alcance ya marcado listo y ya cotizado. No pudo volver a marcarlo listo y Comercial no recibió aviso.
* En Cotización, el servicio nuevo apareció para llenar su valor, pero no había botón para guardar: «Editar cotización» solo aparece si la cotización coincide con la guardada, y «Guardar» solo en modo edición.

*Regla 1. El alcance listo tiene una huella.*
* Al «Marcar alcance listo» se guarda en la oportunidad:
  * `scope_ready_signature`: servicios del alcance más las horas por entregable, redondeadas a 0,1;
  * `scope_ready_services`: id y nombre de cada servicio;
  * `scope_ready_hours`: total de horas.
* Si la oportunidad ya estaba lista antes de este cambio y no tiene huella, se toma la del alcance actual la primera vez que se abre.

*Regla 2. Si el alcance cambia después de marcarlo listo* (se agrega o quita un servicio, o cambian las horas) *y la oportunidad no está ganada ni perdida:*
* el alcance vuelve a «por marcar listo»;
* se muestra «El alcance cambió después de marcarlo listo. Guarda los servicios y vuelve a "Marcar alcance listo"…»;
* el botón «Marcar alcance listo» vuelve a estar disponible;
* la etapa del negocio **no retrocede** (si iba en propuesta enviada o negociación, se queda ahí);
* con la oportunidad ganada no aplica: los cambios van por control de cambios del proyecto.

*Regla 3. Al marcarlo listo de nuevo, Comercial recibe el aviso.*
* Se guardan la huella nueva y `scope_update_notice` (fecha, quién, servicios agregados, servicios quitados, horas antes → después).
* Mensaje al líder: «✓ Alcance actualizado (+ Landing page) · 138h. Comercial recibe el aviso para ajustar la cotización».
* **Mi Día de Comercial** (dueño de la oportunidad) y de Dirección: «🔁 Alcance actualizado: + Landing page · actualiza la cotización». Aparece aunque la oportunidad ya no esté en «En scoping».
  * «Abrir oportunidad» lleva directo a esa oportunidad, en la pestaña **Cotización** con el banner de la regla 4 (no a la lista de New Business). Para el líder abre la pestaña Alcance.
  * Etiqueta de la tarjeta según quién la ve. Líder: «🟣 Nuevo brief asignado». Comercial y Dirección ven lo que les falta: «⏳ En alcance con el líder» (en scoping) → «💰 Alcance listo · por cotizar» (alcance listo, sin cotización guardada) → «📨 Lista para enviar la propuesta» (cotización guardada). Con alcance listo, «Abrir oportunidad» también lleva a Cotización.
* Marcar listo también guarda el alcance: si el enlace de la presentación ya está y es válido, no se pide otro «Guardar». La etiqueta «Listo para cotizar» sale de la etapa del negocio + la huella (no de un flag de guardado de la pantalla).
* **Notificación:** campana y correo (§26) al comercial dueño. Nunca al cliente.

*Regla 4. Volver a guardar la cotización mientras no esté ganada.*
* La cotización está **desactualizada** cuando la guardada no coincide con el alcance actual: hay un servicio nuevo o quitado, o un valor cambió.
* Si está desactualizada y la oportunidad no está ganada:
  * se muestra «Guardar cambios» directamente, sin pasar por «Editar cotización»;
  * aparece el banner «🔁 Paola actualizó el alcance: + Landing page · 111h → 138h. Completa los valores y guarda la cotización de nuevo».
* Guardar valida igual que la primera vez (valor de cada servicio y hoja financiera) y crea una **versión nueva** (v2, v3…, con fecha y autor).
* Si hay negocios en HubSpot, se envían los valores nuevos (ECO → HubSpot) y se crea el negocio del servicio nuevo con «Crear negocio faltante».
* Al guardar se apaga `scope_update_notice`.
* Con la oportunidad ganada, la cotización queda solo lectura.

*Criterios de aceptación:*
1. Alcance listo → cotización guardada v1 → agregar un servicio en Alcance → aparecen el aviso y «Marcar alcance listo».
2. Marcar listo de nuevo → el comercial dueño ve el aviso en Mi Día y en la campana, con el servicio agregado.
3. En Cotización se ve el banner y «Guardar cambios». Llenar el valor del servicio nuevo y guardar crea la v2 y apaga el aviso.
4. Con la oportunidad ganada, nada de lo anterior se habilita.
5. Cambiar solo horas (sin servicios nuevos) también pide marcar listo de nuevo y avisa «horas antes → después».

**Quién ejecuta qué rol (Equipo asignado, selector de «Colaborador» y matriz de horas).** Regla en `projects/teamFromTasks.ts` (`roleFit`):
1. **Cualquier persona activa puede ser colaboradora de una tarea**, también Comercial y Dirección. Por ejemplo, hacen el QA o gestionan algo puntual. No se bloquea a nadie por su nivel de acceso.
2. **La tarea pertenece al rol cotizado** (`budgeted_role`), no a la persona. Para cada persona y rol, ECO marca:
   * **su rol:** la persona tiene ese rol oficial o profesional. Sin marca.
   * **rol afín:** roles distintos pero parecidos, definidos POR ROL (no por persona) en `AFFINE_ROLE_GROUPS` (tabla que mantiene Administración). Hoy: Digital Designer ↔ Front-End Dev (Laura ↔ Oscar). Sin marca ni alerta. Fuera de esos grupos no aplica: Laura no reemplaza a un Trafficker (Simón) ni a Comercial (Catalina).
   * **cubre rol:** cualquier otro caso. Se permite (p. ej. Comercial haciendo un QA), pero queda en ámbar y suma en «N cubren otro rol».
   * Ya no existe el concepto «respaldo» por persona (`backup_roles`).
3. **Asignado y quién ejecutó son datos distintos.** El asignado es `task.assignee`; quién ejecutó sale de los registros de tiempo (`time_log.user_id`). Las horas cuentan para el rol cotizado de la tarea y para la persona que las registró.
   * La «Matriz horas por rol» muestra por persona «Xh asig. · Yh ejec.».
   * Quien registró horas sin estar asignado sale como «no asignado · Yh ejec.» (y «cubre rol» si no es su rol ni un rol afín).
   * Ejemplo en el prototipo: Paola registra 1,5 h en una tarea de diseño de Laura y sale «cubre rol» en Digital Designer.
   * El prototipo ahora guarda cada registro también en la tarea (`task.timeLogs`). En backend es la relación `time_logs.task_id`.

**Sugerir a otra persona del mismo rol según la capacidad** (`schedule/teamLoadAdvisor.ts`, `suggestLoadRebalance`).
* El alcance se cotiza por rol. La persona propuesta en el alcance puede estar llena cuando el proyecto arranca, o llenarse después. **El líder no debería tener que preguntar a mano quién puede.**
* **Cuándo:**
  * al «Iniciar proyecto» (panel de conflictos, §31);
  * mientras el proyecto está en curso: tarjeta «Carga del equipo» en el Resumen del proyecto.
* **Regla de carga:**
  * Carga del día = horas de las tareas abiertas de la persona en **todos** sus proyectos.
  * Cada tarea llena la jornada (8,4 h) desde su día de trabajo hasta su fecha límite (`allocateTaskHours`).
  * Una tarea está en sobrecarga si, en los días que ocupa (desde hoy), la persona pasa su jornada en más de 0,5 h.
* **A quién sugiere:** personas activas con el rol cotizado de la tarea (o un rol afín) que tengan, en la ventana de la tarea (hoy o día de trabajo → fecha límite), horas libres ≥ horas de la tarea.
  * Gana quien tiene el rol como propio; después, el rol afín; dentro de cada grupo, quien tenga más horas libres.
  * **Ausencias** (vacaciones, incapacidades, permisos de Google Calendar) restan sus horas de la capacidad del día: no se sugiere a alguien de vacaciones en esa ventana.
  * **Solo tareas sin empezar** (por hacer y sin horas registradas). Las tareas en curso suman a la carga, pero no se propone cambiarlas de manos.
  * El detalle de las 9 reglas, en orden, está en el encabezado de `schedule/teamLoadAdvisor.ts`.
  * Al sugerirle una tarea, esas horas se le descuentan para no proponerle más de lo que le cabe.
* **Qué ve el líder:**
  * «Sara María Lagos llega al 200 % de su jornada · 1 tarea de Creative Designer», con la tarea, sus horas, la ventana y las horas por encima.
  * Botones: «Asignar a Juan Camilo · 33,6 h libres», «Aplicar las N sugerencias» e «Ignorar».
  * Si nadie del rol tiene espacio: «Nadie más del rol tiene espacio: mueve la fecha o habla con Dirección».
  * **Nada se reasigna solo.**
* **Backend:**
  * Endpoint de solo lectura `GET /api/projects/:id/load-suggestions` con la misma regla.
  * Reasignar = `PATCH` de la tarea (cambia el colaborador; las horas cotizadas no cambian).
  * «Ignorar» se guarda por tarea y por líder, y se vuelve a mostrar si cambian las fechas o la carga.

**Aviso de capacidad al asignar una tarea (nueva tarea y cambio de colaborador).** Componente `CapacityAssignWarning`, regla `checkAssignment`:
* **Día lleno:** la carga de la persona ese día ya es ≥ 85 % de su capacidad, en todos sus proyectos y descontando ausencias. El 15 % restante es para chats, correos y reuniones.
* Si la persona elegida tiene días llenos en las fechas de la tarea, está ausente, o con esta tarea pasa del 100 %, ECO lo avisa. Ejemplo: «Agenda llena: Sara ya tiene ocupado el 100 % del 19 nov y el 162 % del 20 nov».
* Debajo propone hasta 3 personas del mismo rol (o de un rol afín) con espacio para toda la tarea. Un clic las asigna.
* **No bloquea:** el líder puede dejar a la persona elegida o tomar cualquier otra del selector, que queda «cubre rol» si no es su rol. Se decidió así porque a veces la única persona que puede hacerlo es la que está llena.
* **Antes de este cambio:** al asignar solo se avisaba si la persona estaba de vacaciones (`checkAssigneeAvailability`); la carga no se revisaba al asignar, solo al iniciar el proyecto.
* **Backend:** `GET /api/capacity/check?userId&start&due&hours&role` con la misma regla. La validación es informativa, no rechaza el PATCH.

**Tarjeta «Carga del equipo»: elegir a mano.**
* La tarea sugerida se puede abrir con un clic.
* Además de «Asignar a [sugerida]», hay un selector «Otra persona…» con todas las personas activas, agrupadas en mismo rol, rol afín y otro rol. Cada una muestra sus horas libres en esos días, o «ausente».

**Encabezado del proyecto iniciado.**
* La pastilla dice solo «Iniciado · Ajustar» («Programado» si arranca en el futuro). Las fechas están en la tarjeta «Cronograma».

**Reajustar un proyecto iniciado.**
* Se quitó el check «Programar las fechas de las N entregas y sus tareas desde el kickoff». Solo aparecía al reajustar.
* Si se desmarcaba, las fases cambiaban pero las tareas no, y quedaban fuera de su fase.
* Ahora siempre se reprograman las tareas abiertas. Las terminadas conservan sus fechas reales.

**Alcance de New Business: colaborador sugerido por capacidad real.**
* Cuando un rol lo tienen varias personas (p. ej. tres Creative Designer), el Alcance propone a la de **menor ocupación real en las próximas 4 semanas**. La ocupación son las horas de sus tareas abiertas más sus ausencias, divididas entre 8,4 h por día hábil (`withUpcomingUtilization`). Antes usaba un % fijo del perfil.
* Dentro del mismo alcance se suman las horas ya propuestas, para no cargarle todo a la misma persona.
* Se usa un rol afín solo si no hay nadie del rol, o si todos están al 100 % y la persona afín está por debajo del 85 %.
* Nunca se propone a alguien de otro rol.

**Cómo se abre «Cronograma y acuerdos».**
* «Cronograma cliente» y «Ver cronograma y acuerdos» la abren dentro de ECO, siempre conectada.
* «Pestaña nueva» abre la vista aparte con los datos en el enlace (`#d=…`):
  * en Chrome o Safari queda conectada en vivo;
  * si se abre en otro navegador o sin ECO abierto, es una vista de solo lectura para compartir.
* Motivo: el panel del navegador de la app de escritorio reemplaza la pestaña de ECO al abrir una ventana, y esa pestaña quedaba desconectada.
* Rediseño de la vista:
  * encabezado con inicio, entrega, duración y estado de aprobación;
  * personas con avatar;
  * barra de fases;
  * una tarjeta por fase con su estado (terminada o en curso) y los pasos con ícono;
  * fechas en formato «mié 4 nov 2026».

**Otros.**
* El popover «Reasignar» del responsable de alcance se cierra al hacer clic por fuera o con Esc.

**Datos de prueba del prototipo (limpios).** Solo dos proyectos, con fecha de hoy (19 Nov 2026):
1. **«Tienda Online BattSaver»** (Rock and Ride), proyecto único en curso del 3 Nov al 18 Dic. Tiene 11 tareas hechas, en curso y por hacer, y ejemplos de rol afín (Oscar en diseño), de «cubre rol» y de Comercial haciendo QA.
2. **«Fee mensual Contenido y Social · Yamaha»**, contrato de septiembre a noviembre que vence el 30 Nov. Septiembre y octubre están cerrados y noviembre en curso. Para practicar el mes siguiente: «Renovar fee» y luego «Generar tareas de Diciembre».
* Sara María Lagos queda con la agenda llena del 19 al 24 Nov, para ver la sugerencia de capacidad.
* Se quitaron los proyectos, tareas, alertas, actividad y clientes de ejemplo antiguos. Se mantienen las bolsas internas de UHURA (rituales, New Business).

Verificado en el prototipo:
* Equipo de BattSaver sin falsas alertas.
* Pestaña del cronograma conectada: la aprobación registrada en la pestaña queda en ECO y sigue después de recargar.
* Flujo completo con una oportunidad de prueba: alcance listo → cotización v1 → agregar landing → aviso y «Marcar alcance listo» → aviso en Cotización → «Guardar cambios» → v2.
* Datos limpios: carga del equipo con la sugerencia «Asignar a Juan Camilo» (y reasignación aplicada), matriz con asignado y ejecutado, fee con «Contrato vence en 11 días», renovación y «Generar tareas de Diciembre» (6 tareas).
* **Falta ver el aviso en el Mi Día de un usuario Comercial.**


## 33. Tarea simplificada (aprobada por Paola el 21 Nov 2026; entrega del 24 Nov 2026)
**Objetivo:** que la tarea tenga solo lo necesario para trabajar, sin reglas escondidas y sin acciones manuales que el sistema puede hacer solo. Lo automático ya existe: al ganar una oportunidad se crean cliente, proyectos por servicio y tareas con su colaborador (§12.3); «Iniciar proyecto» programa las fechas por capacidad y sugiere a otra persona del mismo rol si alguien pasa del 85 % de su jornada. Esta sección cubre lo que pasa dentro de la tarea.

### 33.1 Un solo botón según el momento
| Estado | Quien hace la tarea | Quien revisa | Los demás |
|---|---|---|---|
| Por hacer | «Iniciar tarea» (también se inicia sola al arrancar el cronómetro o comentar) | «Aprobar» (sin esperar entrega) | — |
| En proceso | «Entregar →» (con revisión) o «Terminar» (sin revisión) | «Aprobar»; si ya pidió ajustes: «Esperando ajustes de {Nombre}» | — |
| En revisión | — | «Pedir ajustes» y «Aprobar» | «Esperando a {revisores}» |
| Terminada | «Reabrir» | «Reabrir» | — |

* El banner dice quién la hace y quién revisa: «La hace Laura · revisa Paola» / «sin revisión» / «Aprobada por Paola».
* **Pedir ajustes** pide un texto (obligatorio): qué hay que ajustar. La tarea vuelve a «En proceso», el último entregable queda `changes_requested` con `changes_note`, y se publica un mensaje «🔁 Pidió ajustes a @{Nombre}: …». Ajustar es lo normal: no resta nada.
* **Aprobar** deja `approved_by` y `approved_at`, marca el último entregable `approved` y publica «✅ Aprobó la tarea».
* Las listas (Proyecto → Tareas) no cambian el estado: el círculo abre la tarea.

### 33.2 Estado y prioridad
* **El selector de estado sale de la tarea.** Solo `executive` y `system_admin` ven «Corregir estado», para errores. Queda en la Actividad. `PATCH /api/tasks/{id}/status` queda solo para ellos.
* **Prioridad:** Baja · Media · Alta · **Urgente** (`urgent`, la que usa el orden de Mi Día, §15.1). Disponible en la tarea, en Nueva tarea y en el formulario de tareas del proyecto.

### 33.3 Entregar
* Formulario «Entregar» (o «Terminar» sin revisión): **«¿Qué hiciste?»** obligatorio (una línea, admite @menciones) · enlace (opcional) · archivo (opcional) · **«Es un paso de otra tarea»** (opcional; lista las tareas del mismo proyecto; el resultado final vive en esa tarea) · criterios de aceptación.
* Con revisión → `Review` y aviso a los revisores. Sin revisión → `Done`.
* La pestaña Entregables muestra el historial de entregas: quién, cuándo, la línea, el enlace, «Paso de: …», y el estado (Entregada · Con ajustes · Aprobada). El formulario solo lo ve quien hace la tarea mientras está por hacer o en proceso.
* `task_deliverables` suma `step_of_task_id` (opcional) y `changes_note`. `tasks` suma `approved_by`, `approved_at` y `requires_review` (por defecto `true`).

### 33.4 Quién revisa: un solo término, «Revisa»
* Cada tarea tiene **uno o varios revisores** (`task_reviewers`: `task_id`, `user_id`, `is_manual`). **Por defecto, el líder del proyecto.** El revisor puede ser cualquier persona de Uhura, del mismo equipo o de otra área. **Basta un revisor** para aprobar o pedir ajustes.
* En la tarea el campo se llama **«Revisa»**. El Project Lead **sale de la tarea**: vive en el proyecto, donde responde por bloqueos, insumos y desvíos.
* **Tres niveles:** (1) automático: al crearse la tarea la revisa el revisor por defecto del proyecto (`projects.default_reviewer_id`; si es nulo, el líder); (2) por proyecto: el líder o Dirección cambian «Revisa por defecto» y se actualizan las tareas abiertas que no se cambiaron a mano; (3) por tarea, para excepciones.
* **Quién cambia qué:** quien hace la tarea puede **sumar** revisores, no quitarlos. Quitar revisores o poner **«Sin revisión»** (`requires_review = false`) solo lo hacen el líder del proyecto o Dirección.
* **Revisor ausente:** si todos los revisores tienen una ausencia activa hoy (§20), la tarea dice «{Nombre} no está hasta el {fecha}» y ECO sugiere a otra persona (primero el líder del proyecto; si también falta, alguien del mismo rol). El líder o Dirección lo aplican con un clic; los demás ven «ECO le avisó al líder del proyecto».
* **Migración:** `reviewer_id` actual pasa a una fila de `task_reviewers` (`is_manual = true`).
* `PUT /api/projects/{id}/default-reviewer` → `{ user_id }` (solo líder del proyecto o Dirección). `PUT /api/tasks/{id}/reviewers` → `{ user_ids[] }`.

### 33.5 Qué ve cada quien en la columna derecha
* **Todos:** prioridad, horas, cronograma, bloqueo («Marcar la tarea como bloqueada» con su motivo, y «Ya se desbloqueó»), «Revisa», colaborador, seguidores (quedan enterados, sin urgencia ni carga; aviso solo si los mencionan).
* **Solo líderes y Dirección:** rol cotizado y retrabajos.
* **Ya no está:** Project Lead (vive en el proyecto) y el selector de estado (salvo Dirección).

### 33.6 Pestañas
Mensajes · Entregables · Actividad.

### 33.7 Endpoints
* `POST /api/tasks/{id}/deliver` → `{ what, url?, file_id?, step_of_task_id?, criteria_checked[] }`. Con revisión pasa a `Review`; sin revisión, a `Done`. `what` obligatorio.
* `POST /api/tasks/{id}/approve` (solo revisores) · `POST /api/tasks/{id}/request-changes` → `{ note }` (solo revisores; `note` obligatorio).
* Prototipo: `TaskDetailModal.tsx` (banner, formulario de entrega, «Revisa»), `BlockerControl.tsx`, `TaskFlowPrototype.tsx` (`handleReviewDecision`, `handleUpdateReviewSettings`, `handleChangeProjectReviewer`), `ProjectsView.tsx` («Revisa por defecto»).


## 34. Mejoras del 23 y 24 Nov 2026 (rama `claude/mejoras-2026-11-24`)
Todo lo de esta sección es independiente de La Colonia. La propuesta de La Plaza sigue en otra rama, a la espera de aprobación.

### 34.1 Correcciones tras el QA de punta a punta
* **Ciclos del fee por fechas del contrato.** Un ciclo va del día del contrato al día anterior del mes siguiente (23 Nov – 22 Dic, 23 Dic – 22 Ene…): un contrato de 3 meses tiene 3 ciclos. Si el contrato empieza el día 1, el ciclo es el mes calendario («Noviembre 2026»); si no, se nombra por sus fechas. Si el día no existe en un mes (31), se usa el último día. El estado (cerrado / en curso / próximo) sale de las fechas. El encabezado dice «Ciclo X de N». `project_cycles` suma `start_date` y `end_date` (§12.9).
* **Rondas = presentaciones.** Cada presentación al cliente trae su ronda de ajustes: al «Iniciar proyecto» (y al editar el cronograma) `schedule_config.included_rework_rounds` = número de presentaciones.
* **Fee mensual sin rondas.** Un fee nunca tiene rondas de ajuste: `included_rework_rounds = 0` (también al convertir una propuesta; antes se guardaba 2 aunque el cálculo ya las ignoraba).
* **Un solo nombre de estado** del proyecto: **Por iniciar** · **Programado** · **En ejecución** · **En pausa** · **Cerrado** · **Archivado**. La etiqueta se deriva de `status`, `is_kicked_off` y `start_date`.
* **Responsable de cliente nunca vacío** tras convertir: el del cliente si ya tiene; si no, la persona con `client_relationship`; si no hay, el comercial de la oportunidad (§8.2).
* **«Creada el»** usa `created_at` de la tarea (nuevo campo, lo fija el servidor), no su fecha de trabajo.
* **Comercial por defecto** en una oportunidad nueva = quien la crea, si trae negocios (`commercial`, `client_relationship` o `executive`); si no, queda vacío y se elige.
* **«Pedir ajuste de alcance»** solo para Comercial: el comercial de la oportunidad, su equipo comercial, `commercial`, `client_relationship`, `executive` y `system_admin`. `POST /api/opportunities/{id}/scope-change-request` responde 403 a los demás.
* **Comercial no reasigna personas** (#145): en «Iniciar proyecto» y en «Carga del equipo» ve la sugerencia como texto («Sugerido: Laura · lo decide el líder»).
* **Capacidad semanal:** la vista semanal suma solo lo que el cronograma pone en esa semana (mismo reparto que el motor, desde el día de trabajo hasta la fecha límite). Antes sumaba todas las tareas asignadas, de cualquier fecha (119 % de «sobrecarga» sin plan).

### 34.2 Proyecto → Tareas: las tareas primero
* **Orden:** primero entregables y tareas; debajo, **«Insumos del cliente»** (antes «Dependencias, insumos y aprobaciones de cliente», arriba de todo). El texto aclara: «Lo que el cliente nos debe entregar… No son tareas del equipo: las tareas se crean arriba, en cada entregable». Motivo: una persona creó un insumo pensando que era una tarea.
* **Sin filtros** (Todas · Bloqueantes · Pendientes): un proyecto tiene 3 o 4 insumos. Orden fijo: pendientes que bloquean, pendientes por fecha, recibidos al final. La sección se abre sola si hay algo que bloquea.
* **Eliminar un insumo** creado por error: 🗑 con confirmación («¿Eliminar este insumo?»). `DELETE /api/projects/{id}/dependencies/{dep_id}` (líder del proyecto, Comercial, Relación con clientes, Dirección y Admin).
* **«Frentes» → «Entregables»** en el selector de vista, el filtro, el formulario de tarea y la importación de tareas. Un solo término en toda ECO.
* **Proyecto interno:** la sección de insumos no aparece (no hay cliente que entregue), salvo que ya tenga alguno.

### 34.3 «Cronograma de cliente» en tablet
En celular y tablet las acciones (Editar, PDF, Correo, Pestaña nueva, ✕) van arriba y el título del proyecto ocupa todo el ancho; desde escritorio, lado a lado. Antes el título quedaba en una columna angosta con un espacio en blanco al lado.

### 34.4 New Business: mismos nombres en todo el alcance
* Botones del alcance: **«Importar alcance»** (desde el catálogo de servicios) y **«Crear alcance»**. Los mismos al empezar y debajo de los servicios ya agregados (antes «Agregar alcance», «Crear alcance a medida» y «Servicio a medida»). Un alcance creado desde cero se llama «Alcance a medida». Solo cambian los nombres; la lógica es la misma.
* **«Actividad» → «Tarea»** en el alcance, la cotización y el catálogo de servicios (agregar, duplicar y eliminar tarea; «N tarea(s)»). Lo que se cotiza en el alcance es exactamente la tarea que se crea al ganar. El SOW (documento para el cliente) no cambia.
* **Esfuerzo de preventa solo en horas.** El resumen de la oportunidad muestra las horas por persona; **no** muestra costo en pesos (generaba ansiedad). Se retira el costo de preventa de §28 / §12.10 de la vista de la oportunidad.

### 34.5 Mi Día: botones cortos
En las oportunidades de «¿Qué requiere mi atención?»: el timer de preventa es solo el ícono ▶ (el nombre va en el tooltip y en `aria-label`, como el resto de timers de ECO) y «Abrir oportunidad →» pasa a **«Abrir →»**.

### 34.6 Nuevo proyecto desde Proyectos = mismo flujo que New Business
Antes «Nuevo proyecto» tenía su propio formulario («Frentes», equipo a mano, tipo «Interno» como tercera opción y fecha fin a mano). Ahora sigue el mismo modelo que un proyecto que nace en New Business:
1. **Proyecto:** cliente, razón social (opcional), nombre, líder del proyecto, responsable de cliente (opcional), brief (opcional) y **tipo: Proyecto único o Fee mensual**, elegido con **radios (uno u otro), igual que en Cotización de New Business**. **«Interno · no facturable» es una característica**, no un tipo: se marca sola si el cliente es UHURA Group y se puede cambiar. Este paso **no pide fechas**.
2. **Alcance:** el mismo editor de New Business («Importar alcance» / «Crear alcance»): entregables, tareas, rol, colaborador, horas y semanas por servicio. En un fee, son las tareas del primer mes.
3. **Fechas y revisión** (25 Nov 2026: **todas las fechas viven en este paso**, para los dos tipos).
   * **Fee mensual:** fecha de inicio, **meses del contrato** y qué pasa con las **horas no usadas del mes** (regla general: no pasan; pactado: todas o hasta 25 %). El fee **no** tiene fecha fin ni rondas.
   * **Proyecto único:** fecha de inicio, semanas de producción y entrega. La **entrega sugerida** sale del **mismo cálculo de «Iniciar proyecto»**: semanas de producción + QA del cliente de cada presentación (las presentaciones se sugieren por el área del servicio; cada una trae su ronda de ajustes), en días hábiles sin festivos. Se muestra el desglose («producción 10 días + QA del cliente 5 días (1 presentación) = 15 días hábiles»). **La entrega se puede editar:** los días que gana o pierde van a la producción, así «Iniciar proyecto» llega a la misma fecha. Se muestran los **nombres de las presentaciones** sugeridas («Estrategia SEO / GEO», «Piezas para aprobación», «Flujo conversacional», «Prototipo»…). Interno: sin presentaciones; todo el tiempo es producción.
   * **Aplica a cualquier área, no solo a producto digital.** Un proyecto único puede ser una web, un chatbot, una estrategia SEO o una campaña de Navidad; un fee puede ser soporte y mantenimiento web, administración de parrillas o SEO mensual. Una **presentación al cliente** es cada vez que el cliente revisa y aprueba un avance, sea del área que sea, y trae su ronda de ajustes. Los textos de la pantalla lo dicen con ejemplos de varias áreas.
* El proyecto nace **«Por iniciar»** con sus entregables, tareas y horas cotizadas por rol, y `schedule_config` (`production_weeks`, `included_rework_rounds` = presentaciones, `client_kickoff_wait_days = 0`). **«Iniciar proyecto»** programa cada tarea con el mismo motor que un proyecto convertido.
* **Backend:** `projects.non_billable` (boolean, por defecto `false`). Los proyectos con `project_type = 'internal_non_billable'` se leen como no facturables (sin migración obligatoria). El filtro «Proyectos internos» usa `non_billable` o el tipo antiguo.
* **Proyecto interno en «Iniciar proyecto»:** sin presentaciones al cliente, sin rondas y sin «Insumos a solicitar al cliente». El encabezado del proyecto muestra «Interno · no facturable» y no muestra «Rondas de ajuste». Motivo: al iniciar «Gerencia UHURA» producción mostraba 2 rondas de 5 días e insumos de un proyecto web.
* Prototipo: `NewProjectModal.tsx` (reemplaza el formulario anterior), `isInternalProject()` en `types.ts`, `ProjectsView.tsx` (iniciar proyecto interno), `ProjectOverviewTab.tsx`.

### 34.7 Reportado en producción (para Indunova)
* **Detener el timer en el encabezado de una propuesta (New Business):** en producción se detiene sin abrir la ventana para confirmar el tiempo, y lleva a Mi Día. Debe abrir la misma ventana «Registrar tiempo» que el resto de ECO y, al guardar, dejar a la persona en la propuesta (§31: «se queda donde estaba»). En el prototipo funciona así.
* **«Plazo del alcance» (Editar) en el encabezado de la oportunidad:** al elegir día y hora y hacer clic afuera, se cierra sin guardar; el calendario tapa «Guardar plazo». Debe guardarse al elegir la fecha y la hora (sin botón), con un aviso «Plazo guardado», y cerrar solo con Esc o ✕ sin perder lo elegido.
* **Esfuerzo de preventa con costo en pesos ($32.986):** quitarlo; solo horas (§34.4).
* **Plazo del alcance en el encabezado de la oportunidad:** hoy dice «Plazo del alcance: 28 h hábiles · quedan ~12 h hábiles (Editar)». Pasa a un texto corto: **«⏱ Quedan ~12 h hábiles»** (ver §34.8), con el detalle en el tooltip y «Editar» como ícono ✏️ al lado.

### 34.8 Plazo del alcance en palabras simples (25 Nov 2026)
* Una sola etiqueta en todos los lugares (encabezado de la oportunidad, tabla de New Business y Mi Día): **«Quedan ~12 h hábiles»**. Si ya pasó: **«Vencido hace ~3 h hábiles»** (en rojo). Con menos del 25 % del plazo: en ámbar. Si el alcance ya se entregó: «Alcance entregado». Sin fecha límite: «Plazo: ~36 h hábiles».
* **Tooltip:** «Plazo del alcance: 28 h hábiles · vence mié 25 nov, 6:00 p. m. (lun–vie, 8–12 y 2–6, hora Colombia)».
* Horas hábiles: lunes a viernes, 8:00–12:00 y 14:00–18:00 hora Colombia, sin festivos. Se calcula desde `handoff_deadline`.
* El número es el real de cada momento (horas hábiles que quedan hasta `handoff_deadline`) y se actualiza solo cada 5 minutos, sin recargar.
* Reemplaza «SLA ~36h handoff» (Mi Día) y «vence en ~24h» (fijo en la tabla).
* Prototipo: `newbusiness/scopeDeadline.ts` (`scopeTimeLeft`, `businessHoursBetween`).

### 34.9 Revisión del cliente y ajustes: una sola regla para todas las áreas (25 Nov 2026)
Antes la tabla de presentaciones decía «QA cliente», «Ajustes» y «Checkpoint». «QA» suena a probar software y no lo entienden igual creatividad, SEO o contenidos, y en «Ajustes» no se sabía si eran días del cliente o del equipo. Ahora hay una sola regla, con las mismas palabras para cualquier área (producto, creativo, growth/SEO):

> **Cada presentación incluye una ronda: el cliente revisa (X días) y nosotros ajustamos (Y días).** Una segunda ronda de comentarios, o una respuesta tarde del cliente, mueve la entrega o se cotiza.

| Antes | Ahora | Qué significa |
|---|---|---|
| QA cliente / QA del cliente | **Revisión del cliente** | Días hábiles que tiene el cliente para revisar y mandar todos sus comentarios en un solo envío. **Suman días a la entrega.** |
| Ajustes | **Nuestros ajustes** | Días que tiene el equipo para aplicar esos comentarios. Son tareas dentro de la producción: **no suman días.** |
| Tipo: Checkpoint / Aprobación | **Avance / Aprobación** | Avance: el cliente valida el rumbo, sin aprobación formal. Aprobación: el cliente aprueba formalmente y se pasa a lo siguiente. |

* **Fee mensual:** no tiene presentaciones ni rondas. Los ajustes del día a día con el cliente salen de la bolsa de horas del mes. Se agrega el acuerdo «Los ajustes del día a día salen de la bolsa de horas del mes» y los acuerdos del fee dejan de hablar de «parrilla» y «piezas» (no aplican a soporte web): «El plan del mes…», «Lo que esté fuera del plan del mes…».
* **Sin cambios:** «QA interno» (la revisión de nuestro equipo antes de presentar) y «ronda de ajustes» como concepto. Los nombres de cada presentación siguen saliendo del área del alcance (§34.6).
* **Backend:** solo etiquetas. Los campos no cambian: `review_days` = revisión del cliente, `adjust_days` = nuestros ajustes, `kind` `checkpoint` (se muestra «Avance») / `approval`.
* Pantallas: «Iniciar proyecto» (tabla de presentaciones y resumen de días), «Ver cronograma y acuerdos» (el documento del cliente) y el paso 3 de «Nuevo proyecto».
* **Unidades y ayudas en la tabla:** junto a cada número dice «días» («5 días», «2 días»), y los títulos «Tipo», «Revisión del cliente» y «Nuestros ajustes» tienen un ícono «i»: **al hacer clic** se abre la explicación corta (se cierra con otro clic, clic fuera o Escape). Sirve en tablet y móvil, donde no hay «pasar el mouse».
* **«Aprobación del cliente» en el cronograma:** el texto ya no mezcla a quién le habla. En ECO, al líder: «¿El cliente está de acuerdo? Si alguna fecha no le sirve, muévela con «Editar». Cuando apruebe, escribe su nombre y pulsa «Registrar aprobación».» En el documento impreso o en PDF, al cliente: «Si alguna fecha no te funciona, avísanos y la ajustamos.», con la línea para firmar.
* **Qué es una «presentación» (26 Nov 2026):** el término se mantiene, con su definición donde aparece. En ECO, junto a «Presentaciones al cliente» (paso 3 de «Nuevo proyecto» e «Iniciar proyecto») y en la columna «Presentación», hay un ícono «i»: «Cada vez que le mostramos al cliente un avance para que lo revise y apruebe: un concepto, un diseño, una estrategia, una parrilla… Cada una incluye una ronda: el cliente manda sus comentarios en un solo envío y nosotros ajustamos. Si vuelve a pedir cambios sobre lo mismo, es una ronda adicional.» En el documento del cliente (que también se imprime) va como frase fija: «Una presentación es cada vez que te mostramos un avance para que lo revises y apruebes. Cada una incluye una ronda…».
* Prototipo: `ProjectsView.tsx`, `projects/ClientKickoffView.tsx`, `NewProjectModal.tsx`.

### 34.10 Sonido leve al llegar una notificación (25 Nov 2026)
* Cuando llega una notificación nueva a la campana suena un **tono leve**: dos notas suaves, de medio segundo y a volumen bajo.
* **No suena** con las notificaciones que ya estaban al abrir ECO, ni más de una vez cada 2 segundos si llegan varias juntas.
* **Cada persona lo puede apagar** desde la campana con «Sonido / Silencio». La preferencia queda guardada en su navegador y por defecto está **activado**. Al reactivarlo suena una vez de prueba.
* Si el navegador bloquea el audio (por ejemplo, antes de que la persona haga su primer clic), no pasa nada: la notificación se ve igual.
* **Backend:** nada obligatorio. Si se quiere que la preferencia siga a la persona entre equipos, guardar `notification_sound` (boolean, por defecto `true`) en las preferencias del usuario.
* Prototipo: `notificationSound.ts` (tono con Web Audio, sin archivo de audio) y `TaskflowHeader.tsx` (campana).

### 34.11 «Mi Día»: la oportunidad sigue el rol de cada persona (25 Nov 2026)
Reportado en producción: la responsable del alcance marcó el alcance listo, la notificación le llegó a Comercial, pero la oportunidad le siguió apareciendo en «Mi Día». En el prototipo pasaba lo mismo por dos razones: «Mi Día» filtraba por estado y nivel de acceso (no por rol dentro de la oportunidad), y la **tarea de preventa** «Scoping · cliente · oportunidad» seguía abierta.

**Regla (por rol dentro de la oportunidad, no por nivel de acceso):**

| Estado de la oportunidad | Responsables del alcance | Responsable comercial / quien la creó |
|---|---|---|
| Dimensionando (`discovery`, `quoting`) | **Sí** | Sí |
| Alcance listo / cotizando (`internal_review`) | **No** | **Sí** |
| Alcance actualizado después de cotizar (`scope_update_notice`) | No | Sí |
| `proposal_sent`, `negotiation`, `won`, `lost`, `converted` | No | No |

* Cuando **cualquier** responsable del alcance pulsa «Marcar alcance listo», la oportunidad sale del «Mi Día» de **todos** los responsables del alcance.
* Si una persona es responsable del alcance **y** comercial en la misma oportunidad, la sigue viendo hasta que se cotice.
* **Tarea de preventa:** se cierra al marcar el alcance listo (o al cerrarse el negocio) y **se reabre** si Comercial pide un ajuste de alcance (la oportunidad vuelve a `quoting`). Su texto de plazo dice «Plazo del alcance: ~36 h hábiles» (antes «SLA ~36h handoff», §34.8).
* Prototipo: `newbusiness/opportunityMyDay.ts` (`isOpportunityInMyDay`, la regla en un solo lugar), `MiDiaView.tsx`, `TaskFlowPrototype.tsx` (`onUpdateOpportunity` cierra/reabre la tarea de preventa).

### 34.12 Presentación del alcance opcional, con aviso al confirmar (25 Nov 2026)
Reportado en producción: Ana le asignó a Catalina un alcance que solo era bajar horas (8 h). No requería presentación, y no pudo marcarlo listo porque el enlace era obligatorio.
* El enlace «Presentación / Propuesta (Drive)» pasa a ser **opcional**: no bloquea «Guardar» ni «Marcar alcance listo». El campo dice «(opcional)» con la ayuda «Súbela cuando el alcance la necesite (propuesta, solución técnica). Si solo son horas, puedes dejarla vacía.»
* **Para que no se le pase a ningún líder:** si no hay enlace, la confirmación de «Marcar alcance listo» muestra un aviso en amarillo: «**No adjuntaste presentación ni propuesta.** Está bien si este alcance es solo de horas. Si el cliente espera una propuesta o una solución técnica, pulsa «Falta algo» y agrega el enlace antes de enviarlo a Comercial.»
* Sin enlace, la oportunidad muestra «Sin presentación (opcional)» en vez de «Pendiente» o «Sin registrar por líder».
* **Backend:** `commercial_proposal_url` deja de ser requerido para pasar a `internal_review`.
* Prototipo: `teamCandidates.ts` (`isScopeReadyForReview` sin el enlace), `NewBusinessView.tsx`.

### 34.13 New Business: «Nuevo negocio», como en HubSpot (25 Nov 2026)
* El botón principal pasa de «Nueva oportunidad» a **«Nuevo negocio»**, igual que el título de la ventana. Es el mismo nombre que usa HubSpot en español para los *deals* («Negocios», «Crear negocio»), y New Business se sincroniza con los negocios de HubSpot: así Comercial habla el mismo idioma en las dos herramientas. «Lead» o «prospecto» en HubSpot es otra cosa (un contacto antes de calificar), por eso no se usa.
* Se quita el botón «Crear manualmente» de la pantalla vacía: repetía «Nuevo negocio». Dentro de la ventana siguen las dos pestañas «Traer desde HubSpot» / «Crear manualmente».
* Pantalla vacía: «No hay negocios con estos criterios» y «Comercial puede traerlo desde HubSpot o crearlo con «Nuevo negocio» para iniciar el dimensionamiento técnico».
* **Todos los textos de pantalla dicen «negocio» en vez de «oportunidad»**, con su concordancia («el negocio», «un negocio calificado», «Marcar negocio como perdido», «Negocio registrado como perdido», «Cuenta / Negocio», «Crear negocio», «Abrir el negocio», «Seleccionar negocio de New Business»…). En el modelo de datos no cambia nada: la entidad sigue siendo `opportunity` (y en HubSpot, `deal`).
* **Mismos nombres en «Traer desde HubSpot» y «Crear manualmente»**, como en producción: «Nombre del negocio / requerimiento», «Brief (opcional)», «Responsables del alcance» (antes «Líder asignado para scoping») y «Responsable comercial» (antes «Owner Comercial en Uhura»). En el detalle del negocio, «Owner Comercial» pasa a «Responsable comercial».

### 34.14 «Nueva tarea»: entregables del proyecto, menos ruido y rol ↔ persona (26 Nov 2026)
* **Entregable según el proyecto elegido.** Antes el campo «Servicio / Entregable» mostraba una lista inventada y no cambiaba al cambiar de cliente o proyecto (quedaba «Parrilla del mes» de otro proyecto). Ahora:
  * Si el proyecto **tiene** entregables (los del proyecto y los que ya usan sus tareas): el título es **«Elige el entregable»** y se elige de una lista desplegable. Si tiene uno solo, viene elegido. La última opción es «+ Nuevo entregable…».
  * Si el proyecto **no tiene** entregables: el campo es igual que en producción, «Servicio / Entregable del Proyecto» con un campo de texto, **sin** el enlace «Seleccionar existente» (no hay nada que seleccionar).
  * Al cambiar de cliente o de proyecto, el entregable y la dependencia se **reinician**. Un cliente sin proyectos ya no toma un proyecto de otro cliente «de relleno».
* **Se quita «Sugerencias rápidas»**: confundía y repetía información.
* **Equipo, en dos líneas:** arriba **Project Lead** y **Seguidores**; abajo **Colaborador** y **Rol cotizado**, uno al lado del otro.
  * Al elegir el **rol cotizado**, se propone la **persona de ese rol con más capacidad disponible** (la misma regla que el alcance de New Business).
  * Al elegir el **colaborador**, se llena su **rol cotizado** (si ya cumple el rol elegido, se respeta).
  * Rol y colaborador empiezan vacíos y son obligatorios. Si falta algo, se dice en rojo: «Falta el proyecto, el entregable…».
* **«Depende de otra tarea (opcional)»** (antes «Dependencia / Bloqueada por»): solo lista las tareas **abiertas** del **mismo proyecto**, primero las del mismo entregable, con el formato «Entregable · Tarea · Persona». Ayuda: «Úsalo cuando esta tarea no pueda empezar hasta que la otra termine: en la tarea verás «Depende de…» y cuándo queda libre». Es el mismo comportamiento que dentro de un proyecto: solo registra la relación; no bloquea el timer.
* Prototipo: `NewTaskModal.tsx`.

### 34.15 Cliente › Proyectos: columna «Documentos» (SOW + cronograma) (26 Nov 2026)
* La columna «SOW» pasa a **«Documentos»** con dos indicadores por proyecto:
  * **SOW:** «SOW» (abre el documento) o «Sin SOW».
  * **Cronograma:** «Cronograma» en verde si el cliente lo aprobó (al pasar el mouse: quién y cuándo), «Cronograma pendiente» en amarillo si el proyecto ya inició sin aprobación, o «Cronograma por iniciar». Clic: abre el proyecto.
  * Proyecto interno: «—».
* **Regla:** el SOW dice qué se hace y cuánto cuesta (se firma al ganar); el cronograma dice cuándo y con qué reglas (se aprueba en el kickoff). Se recomienda que el SOW diga: «El cronograma aprobado en el kickoff hace parte de este acuerdo».
* **Backend:** usa `client_schedule_approval` (nombre y fecha) e `is_kicked_off` del proyecto; no hay campos nuevos.
* Prototipo: `ClientDetailView.tsx`.

### 34.16 El comité operativo puede eliminar tareas (requerimiento de producción) (26 Nov 2026)
* **Hoy en producción no se puede.** En el prototipo sí, con la regla completa (decisión de Uhura, 26 Nov 2026):
  * **Comité operativo** (líderes, Comercial, Dirección/executive) y **system_admin**: siempre.
  * **Quien creó la tarea**, cualquiera que sea su rol: **solo mientras no tenga horas cargadas ni esté entregada** (en revisión o terminada). Así un colaborador puede borrar su propio duplicado, pero nunca trabajo con horas. Si ya tiene horas o está entregada, ve la opción deshabilitada con el motivo: «Ya tiene horas cargadas: pídele a tu líder que la elimine.»
  * Nadie más.
  * Desde el detalle de la tarea (menú ⋯, con confirmación: «¿Seguro? Clic para eliminar») y desde la lista de tareas del proyecto (con su ventana de confirmación).
  * Requiere guardar `created_by` en cada tarea. Las horas se cuentan con los `time_logs` no anulados de la tarea.
* Pide confirmación antes de eliminar. Recomendado para producción: borrado lógico (`deleted_at`, `deleted_by`) para no perder horas cargadas ni el historial, y que las horas ya registradas sigan contando en el costo del proyecto.
* Prototipo: `deletePermissions.ts` (`taskDeleteBlock`, `dependencyDeleteBlock`), usado en `TaskFlowPrototype.tsx`, `TaskDetailModal.tsx` y `projects/ProjectTasksTab.tsx`. Eliminar un **entregable** sigue siendo solo del comité.
* **Insumos (dependencias del cliente), misma regla:** el comité operativo y system_admin siempre; **quien lo agregó, solo mientras no esté recibido**. Requiere `created_by` en cada insumo. Marcar «Recibido» y agregar insumos no cambia. Respuesta a la propuesta de Indunova («creadores, líderes comerciales y system_admin»): **sí al creador, pero con límite** (sin horas y sin entregar; en insumos, sin recibir), y el comité completo, no solo los líderes comerciales. Prototipo: `projects/ProjectDependenciesSection.tsx`.

### 34.17 Acuerdos de la reunión con Indunova (26 Nov 2026)
Resumen de Indunova: tickets, flujo New Business → proyecto, permisos y fechas. Lo que toca al prototipo y a producción:

**1. Doble guardado (error en producción: un doble clic creó la tarea dos veces)**
* **Pantalla:** al pulsar «Crear tarea», «Crear proyecto», «Crear negocio» o «Crear proyecto(s)» (convertir negocio), el botón se bloquea y dice **«Guardando…»** hasta que termina. Un segundo clic no hace nada.
* **Servidor (obligatorio, la pantalla sola no basta):** cada creación lleva una llave única por envío (`Idempotency-Key` en el encabezado, generada al abrir el formulario). Si llega otra petición con la misma llave en los siguientes minutos, el servidor devuelve lo ya creado y no crea otro. Respaldo: rechazar una tarea con el mismo título, proyecto, entregable y colaborador creada por la misma persona en los últimos 10 segundos.
* Prototipo: `ui/useSubmitOnce.ts` en `NewTaskModal.tsx`, `projects/ProjectTasksTab.tsx`, `NewProjectModal.tsx`, `newbusiness/NewOpportunityModal.tsx`, `newbusiness/ConvertOpportunityModal.tsx`.

**2. Quién elimina tareas e insumos:** ver §34.16. Comité operativo (líderes, Comercial, Dirección) + system_admin siempre; quien la creó, solo mientras no tenga horas ni esté entregada (insumos: mientras no esté recibido).

**3. Insumos, rondas y fechas: sugeridos, no automáticos**
* **Proyectos internos:** sin insumos, sin presentaciones al cliente y 0 rondas (ya estaba, §34.6).
* **Proyectos con cliente:** los insumos salen como **sugerencias sin marcar**: «Sugeridos para {servicio} · marca los que necesites». Solo se crean como dependencias los que el líder marca. Se pueden editar (fase, «Bloquea») y agregar otros.
* **La sugerencia depende del proyecto, para cualquier área (no solo web):** sale del servicio (`service_base`), del nombre del proyecto y de sus entregables. Plantillas: tienda online, web/landing, pauta, marketplace, chatbot, **SEO**, **campaña/creatividad**, **video/foto**, **email/CRM**, **analítica** y redes. Sin coincidencia, una lista general: «Información del negocio (brochure, presentación o web actual)», «Manual de marca / branding», «Accesos o materiales que el equipo necesite», ninguno bloqueante.
* **Producción:** estas plantillas deben vivir en el catálogo de servicios (cada área define las suyas), no en código.
* Las presentaciones y sus rondas siguen sugeridas por el área del alcance (§34.6) y se pueden quitar o agregar; las fechas se recalculan.
* Prototipo: `schedule/clientInputs.ts`, `ProjectsView.tsx` («Iniciar proyecto»).

**4. Plazo del alcance en el encabezado del negocio (ajuste a lo que ya existe en producción)**
* **Texto:** hoy «Plazo del alcance: 28 h hábiles · quedan ~12 h hábiles (Editar)». Pasa a **«🕒 Plazo: 28 h · quedan ~12 h ✏️»**. «quedan» toma el color del estado (azul normal, ámbar con menos del 25 %, rojo «vencido hace ~3 h»). Sin fecha límite: «Plazo: 36 h». El detalle completo (horas hábiles, fecha y hora en que vence, horario) va en el tooltip. Reemplaza en este encabezado la etiqueta de §34.8; la tabla y Mi Día siguen con «Quedan ~12 h hábiles».
* **Editar sin perder el cambio:** hoy hay que pulsar «Guardar plazo», pero el calendario del navegador tapa ese botón; la gente hace clic por fuera, la ventana se cierra y el cambio se pierde («parece que no funciona»). Ahora **se guarda al elegir la fecha**: aparece «✓ Guardado · plazo de N h hábiles». Clic por fuera, Escape o «Listo» solo cierran. «Deshacer» vuelve a la fecha que había al abrir. No se acepta una fecha pasada.
* **Al cambiar la fecha** se recalcula el plazo total: horas hábiles desde que se creó el negocio hasta la nueva fecha (`handoff_hours`), y «quedan» se cuenta hasta `handoff_deadline`.
* Prototipo: `newbusiness/ScopeDeadlineChip.tsx` (encabezado en `NewBusinessView.tsx`).
* **Regla general para editar cualquier fecha o plazo en ECO** (tarea, entrega del proyecto, plazo del alcance; aprobada por Uhura): se edita **en el mismo lugar**, no en una ventana aparte; **se guarda al elegir el valor**, con un «✓ Guardado» visible; hacer clic por fuera, Escape o «Listo» solo cierran, **nunca descartan** lo elegido; «Deshacer» vuelve al valor anterior. Ningún botón de guardar puede quedar debajo del calendario del navegador. Si el cambio corre otras fechas (fases, entrega), se avisa antes y se pide confirmar, como ya hace el cronograma.

**5. Solo producción (tickets de error, sin cambios en el prototipo)**
* **Meta comercial:** el tablero muestra 7.000 millones acumulados contra una meta de 2.600 millones. La regla está en §17.1: lo vendido del mes = New Business **ganado en ese mes** + base mensual de los fees activos. Revisar que no se sume el pipeline abierto, los negocios perdidos, los duplicados de HubSpot ni el valor total de contratos de varios meses, y que todo esté en la misma unidad (pesos, no millones).
* **Alegra:** Indunova explora la integración; el contrato ya está en §17.2.
* **Módulos nuevos (p. ej. nómina):** análisis aparte, fuera de esta rama.


### 34.18 Reportado otra vez y por validar (26 Nov 2026)
**1. Notificaciones: se marcan leídas al abrir la campana (error, ya pedido en §15.2 punto 3)**
* **Hoy en producción:** al abrir la campana, las notificaciones siguen apareciendo como no leídas y hay que dar clic en cada una.
* **Debe ser:** al abrir el panel de la campana, **todas las que se ven quedan leídas** (`read = true`, `read_at`) y el número rojo se va a 0. No hay que dar clic en cada una. Dar clic en una sigue abriendo su tarea o negocio.
* «Marcar todas como leídas» se mantiene como botón, por si llegan nuevas con el panel abierto.
* **Aceptación:** con 3 notificaciones sin leer, abrir la campana → el contador queda en 0; cerrar y recargar la página → siguen leídas (se guarda en el servidor, no solo en pantalla). Una notificación que llega después sí cuenta como nueva.
* Prototipo: `TaskflowHeader.tsx` (`markAllAsRead` al abrir).

**2. Capacidad: todo debe leer la capacidad del perfil (validación)**
* Si Administración cambia la capacidad semanal de una persona (p. ej. de 42 h a 36 h por un contrato distinto), debe cambiar **todo** lo que depende de ella, no solo la vista de Capacidad: las fechas de «Iniciar proyecto», el día en que cae cada tarea, el aviso de sobrecarga, la persona que se sugiere por tener espacio, la meta diaria de horas (80 %) y la racha.
* La jornada diaria es la capacidad semanal ÷ 5 (42 h → 8,4 h). Los festivos y ausencias se descuentan (§13).
* El **80 %** (mínimo de horas cargadas) y el **85 %** (lo que se planea en tareas) son **una sola configuración de la organización cada uno**, no números repetidos en el código.
* **En el prototipo todavía no es así:** la vista de Capacidad usa el perfil, pero el motor de fechas usa 8,4 h fijas (`scheduleEngine.ts`, `teamLoadAdvisor.ts`). Pedimos que producción lo haga bien desde el inicio y que confirme cómo está hoy.
* **Aceptación:** una persona con 21 h semanales recibe la mitad de horas por día al iniciar un proyecto, su meta diaria es 3,4 h y su capacidad muestra 21 h.
