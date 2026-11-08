# Requerimientos de Backend y Modelo de Datos (ECO)

> **Nombre del producto:** **ECO** — *Espacio de Creación y Operaciones* (antes «Orbit», renombrado en noviembre de 2026). Los identificadores técnicos (`OrbitAccessLevel`, `CanonicalOrbitAccessLevel`, nombres de archivo como `ORBIT_PRODUCT_STATUS.md`) se conservan para no romper contratos de código ni enlaces.

> **Documento de Especificación Técnica para Implementación Backend (Indunova)**
> **Fecha de Actualización:** 07 de noviembre de 2026 (Cronograma calculado al «Iniciar proyecto», rondas de ajuste editables, equipo derivado de tareas, visibilidad de tareas §15.1, arranque en producción §19, Google Chat §18, Google Calendar §20, mascota §21, acceso desde el perfil §16.1.1). Anterior: 04 de noviembre de 2026 (arquitectura 1:1:1 por servicio, ticket #132 y modo desacoplado manual)
> Este documento consolida las deudas técnicas, relaciones inmutables y reglas de producto identificadas en el QA de **Proyectos, Tareas, New Business, Cotización y Conversión a Proyectos**.

> **AVISO DE PRIVACIDAD Y GOBERNANZA:**
> La documentación pública define reglas, estructuras y comportamientos. La identidad nominal de colaboradores, correos, relaciones de reporte, calendarios individuales y crosswalk con backend se administra exclusivamente mediante **Equipo Canónico Privado**.

> **COMPONENTES EXCLUSIVOS DEL PROTOTIPO (NO VAN A PRODUCCIÓN):**
> **Principio de reconciliación con producción:** lo que ya funciona en la plataforma de producción de Indunova se conserva tal cual. Esta documentación solo pide cambios donde lo dice de forma explícita («mejora», «nuevo», «reemplaza»). Si un comportamiento descrito aquí ya existe en producción con otra regla, prevalece producción y se avisa a Uhura para decidir.
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
* `project_cycles` (un registro por mes de vigencia): `cycle_key` (`YYYY-MM`), `period_number`, `quoted_hours`, `rollover_hours_in`, `executed_hours` (rollup de `time_logs` de tareas del ciclo), `status` (`closed` | `active` | `upcoming`), `tasks_generated`.
* `project_contract_renewals`: `renewed_at`, `renewed_by_user_id`, `added_months`, `monthly_hours`, `note`. Una renovación agrega ciclos sin modificar los cerrados.
* `tasks.cycle_key` para fees. Job programado el día 1 de cada mes: abre el ciclo y clona las tareas plantilla del mes 1 (sin tiempo ni estado); idempotente por `(project_id, cycle_key)`.
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
| **Revisor** | Tarea en `Review` y `reviewer_id == user.id` (si no hay revisor, `project.lead_user_id == user.id`) | Mi Día y «Mis tareas» | Normal |
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

### 15.2 Sincronización en Tiempo Real al Modificar Colaboradores y Notificaciones
* **Retiro / Reemplazo de Colaborador:** Al quitar a un usuario de `collaborators` / `assignee`, el backend debe excluir esa tarea de su carga **Planificada** en Capacidad, de **Mi Día** y de **Mis Tareas** de forma inmediata.
* **Adición / Asignación de Colaborador:** Al asignar o sumar a un usuario como colaborador o revisor:
  1. La tarea debe aparecer inmediatamente en **Mis Tareas** (y en **Mi Día** si vence hoy o requiere su revisión) respetando su **prioridad**.
  2. Se debe disparar una **notificación** (`Notification` / alerta en campanita) al usuario asignado con: `task_id`, `task_title`, `client_name`, `priority` y `type = 'TASK_ASSIGNED'` (o `'REVIEW_REQUESTED'`).
  3. Al abrir el panel de notificaciones, el cliente marca las alertas como `read = true` automáticamente.

### 15.3 Reglas de Transición de Estados por Rol en la Tarea
* **Gobernanza de Cierre:** Las vistas de lista (`Mi Día` y `Mis Tareas`) no deben exponer checkbox circular de completado rápido; el cierre y aprobación de tareas se ejecuta desde el detalle de la tarea.
* **Auto-transición a `In Progress` (`En proceso`):** Si una tarea está en `To Do` y un **Colaborador** ejecuta cualquier acción (iniciar timer, comentar, subir entregable o registrar tiempo), su estado debe pasar automáticamente a `In Progress`.
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
* En `projects`: `google_chat_mode` (`inherit_client` | `disabled` | `custom`, default `inherit_client`) y, si es `custom`, una integración propia con los mismos campos.
* Bitácora de cambios de integración (quién, cuándo, acción) sin almacenar la URL.

### 18.2 Seguridad
* La URL del webhook se guarda **cifrada** y **nunca** se devuelve por API; las respuestas solo incluyen `webhook_last4` / máscara.
* Solo `system_admin` puede crear, probar, activar, desactivar, reemplazar o eliminar. `leader` solo puede cambiar `google_chat_mode` entre `inherit_client` y `disabled`.
* Las URLs no se registran en logs, tickets ni documentación.

### 18.3 Envío
* Resolución del destino según la precedencia de §11.8 (proyecto activo → desactivado → cliente activo predeterminado → solo in-app).
* «Guardar y probar» envía un mensaje real de prueba; si falla, `status = error` con el detalle.
* Eventos que se publican: nueva tarea/asignación relevante, solicitud de revisión, comentario con mención o solicitud de revisión, devolución, aprobación, cambio a prioridad urgente y recordatorio de pendientes sin repetición. **No** se publican eventos de timer ni cambios sin acción requerida.
* Envío asíncrono con reintentos **idempotentes** (clave por evento y destino): un reintento no duplica mensajes. Una falla de Google Chat **no** impide guardar la acción en ECO.
* Formato: mensaje corto y amigable con estructura reconocible y enlace directo a la tarea (ej.: «👋 ¡Hola, equipo! Soy ECO 🐻. … [Ver tarea en ECO]»).
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
* **Recordatorio de horas (ya existe en producción):** no se reimplementa ni se cambia. Lo que hace hoy la plataforma de Indunova (umbral del 70 %, hora, canales) es la referencia; el prototipo solo replica la reacción de la mascota. Cualquier diferencia se resuelve a favor de producción.

---

## 23. ECO como PWA instalable (07 Nov 2026)
Especificación funcional en `ORBIT_PRODUCT_STATUS.md` §9.5. **Fase 1 no requiere cambios en el backend.**
* **Qué incluye el frontend (ya listo en el prototipo):** `vite-plugin-pwa` en `vite.config.ts` genera `manifest.webmanifest` y el service worker `sw.js`. Nombre «ECO · Uhura Group», íconos en `public/pwa/` (192, 512, maskable 512 y `apple-touch-icon` 180), colores `#140b24` / `#0d0718` y `start_url` `/?app=eco`. Se precargan solo el código, los estilos, los íconos y las imágenes de ECO (~2,8 MB). Las capturas de referencia de `public/assets/aistudio` y los logos grandes de `public/brand` no se precargan.
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
* **Racha:** se calcula con `time_logs` existentes por usuario y día (`SUM(duration_seconds)` por `date`). Un día hábil cuenta si suma ≥ 70 % de la jornada diaria (capacidad semanal ÷ 5). Se saltan fines de semana, festivos de Colombia y días con ausencia activa (§20); no rompen la racha. Puede calcularse en el frontend con los registros de las últimas semanas o exponerse como `GET /api/me/streak` → `{ current, today_counts, today_is_workday }`. No hay ranking ni comparación entre personas.
* **Día cerrado:** tabla `day_closures` (`user_id`, `date`, `closed_at`), única por usuario y fecha. `POST /api/me/day-closures` con la fecha de hoy; idempotente. Es solo un registro de confirmación: **no bloquea ni modifica** `time_logs` (las reglas de corrección y cierre semanal no cambian). En el prototipo vive en el navegador (`eco_day_closed_v1`).
* **Aviso de las 5:00 p. m.:** es del frontend (mascota); se muestra una vez por día y no requiere backend. Si a futuro se quiere enviar también por Google Chat o push, se reutiliza el canal del recordatorio de horas de producción, sin duplicarlo.

