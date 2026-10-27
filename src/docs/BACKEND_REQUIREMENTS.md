# Requerimientos de Backend y Modelo de Datos (Orbit)

> **Documento de Especificación Técnica para Futura Implementación Backend**
> **Fecha de Actualización:** 26 de octubre de 2026 (Alineación con decisiones confirmadas de producto y política de privacidad de repositorios públicos)
> Este documento consolida las deudas técnicas, relaciones inmutables y reglas de producto identificadas en el QA de **Proyectos y Tareas** antes de la conexión con los módulos de **Clientes, Finanzas, Cotizador, Capacidad y Dashboard**.

> **AVISO DE PRIVACIDAD Y GOBERNANZA:**
> La documentación pública define reglas, estructuras y comportamientos. La identidad nominal de colaboradores, correos, relaciones de reporte, calendarios individuales y crosswalk con backend se administra exclusivamente mediante **Equipo Canónico Privado**.

---

## 1. Modelo de Jerarquía y Taxonomía Limpia

Orbit adopta una jerarquía conceptual directa y sin sobrecarga taxonómica:

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

## 5. Nomenclatura Estándar de Estados de Tarea en Orbit

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
* **Desacople Arquitectónico:** El frontend de Orbit consume exclusivamente la URL suministrada por el backend y **no depende ni asume** un directorio local estático como `public/assets/team/`.
* **Proveedor de Almacenamiento:** Indunova define la infraestructura física de almacenamiento persistente (ej. Google Cloud Storage, AWS S3, MinIO o CDN dedicada).
* **Manejo de Fallbacks:**
  * Si `avatar_url` es `null`, cadena vacía o si el archivo no puede cargarse (error 404 / 500 / red), el frontend ejecuta automáticamente el fallback canónico: iniciales en texto con el fondo de color institucional (`avatarBg`).
  * En ningún caso la falta de foto debe provocar excepciones en la API ni romper la navegación del usuario.

### 6.4 Especificación para el Issue #6 de Indunova
```markdown
### [Issue #6] Soporte de Carga y Exposición de Fotografía de Perfil (avatar_url)

**Objetivo:** Permitir que los colaboradores cuenten con su fotografía de perfil persistida en backend y servida vía CDN/Storage hacia el frontend de Orbit.

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

**2. Proyectos Operativos (Orbit Projects):**
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
* **Derivación de UI:** El selector de la interfaz se alimenta del catálogo de usuarios de Orbit con nivel/capacidad `commercial` (`OrbitAccessLevel: 'commercial'` o funciones comerciales equivalentes). Al seleccionar un usuario de la lista, el valor guardado en `commercialOwner` es el nombre canónico del usuario (`user.name`), preservando compatibilidad exacta con el contrato de persistencia actual de Indunova sin crear campos no soportados (como `commercialOwnerId`).
* **Sincronización HubSpot:** Si el Deal importado trae un owner comercial (`deal.commercialOwner`), la UI busca coincidencia con los usuarios de Orbit. Si no existe mapeo unívoco, se deja en blanco para selección explícita del usuario sin suposiciones ni hardcoding.

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
   - **Gobernanza del Perfil Ejecutivo (`executive`):** El perfil `executive` adicional definido en Equipo Canónico Privado forma parte de los 18 colaboradores activos y debe contar con usuario Orbit. Su asociación con Backend User ID se resolverá durante el crosswalk con Indunova.
   - **Gobernanza de `system_admin`:** Existen dos usuarios iniciales con Access Level `system_admin` con idénticos permisos técnicos en plataforma. La diferenciación funcional y operativa (soporte técnico / producto digital vs. soporte administrativo y configuración de capacidades/calendarios) corresponde a su rol en la organización, según se define en Equipo Canónico Privado.
   - No afirmar que la conciliación ya fue ejecutada en base de datos: corresponde a las especificaciones y reglas para la ejecución de scripts por parte de Indunova.
