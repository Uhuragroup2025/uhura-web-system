# Requerimientos de Backend y Modelo de Datos (Orbit)

> **Documento de Especificación Técnica para Futura Implementación Backend**  
> Este documento consolida las deudas técnicas, relaciones inmutables y reglas de producto identificadas en el QA de **Proyectos y Tareas** antes de la conexión con los módulos de **Clientes, Finanzas, Cotizador, Capacidad y Dashboard**.

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
  "id": "usr-paola-002",
  "email": "paola@uhuragroup.com",
  "first_name": "Paola Andrea",
  "last_name": "Monsalve Giron",
  "job_title": "Product Lead",
  "official_role": "Digital Product Strategist",
  "access_level": "DIRECTOR",
  "avatar_url": "https://storage.googleapis.com/orbit-assets/team/paola-monsalve.webp",
  "initials": "PM",
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
5. Migración de datos iniciales: Si se realiza seeding, cargar las 18 imágenes del equipo en el bucket asignando sus URLs a los perfiles de `INITIAL_TEAM_SEED.md` (con `null` para perfiles sin fotografía como Álvaro Gómez).
```

---

## 7. Soporte para Múltiples Líderes de Scoping en Oportunidades (Pendiente de Backend)

> **Estado:** Pendiente backend: soporte multi-lead (por coordinar con Indunova). En frontend, el comportamiento productivo actual mantiene `leadUserId: UUID` como campo canónico persistido (1 líder), con preparación desacoplada de `leadUserIds?: string[]`. Una vez backend exponga la relación 1..N, se activará el selector multi-lead en la UI, la visibilidad compartida en Mi Día y la trazabilidad hacia el proyecto final.

### 7.1 Contexto de Negocio
Una oportunidad comercial compleja puede requerir el dimensionamiento técnico concurrente de 1..N líderes técnicos (ej. Paola en Estrategia de Producto y Camilo en Arquitectura Técnica). Ambos líderes comparten la misma responsabilidad técnica sobre el scoping, el dimensionamiento de horas y el SLA de handoff.

### 7.2 Especificación para Requerimiento Backend (Indunova)

```markdown
### [Pendiente Backend] Soporte para Múltiples Líderes de Scoping (1..N) en Oportunidades Comerciales

**Objetivo:** Permitir que una oportunidad comercial (`NewBusinessOpportunity`) registre uno o varios líderes técnicos (`lead_users`), conservando compatibilidad con el líder principal (`lead_user_id`).

**1. Modelo de Datos y Persistencia:**
* Opción A (Recomendada - Relación Many-to-Many):
  ```python
  class Opportunity(models.Model):
      # ... campos existentes ...
      lead_user = models.ForeignKey(
          User, on_delete=models.SET_NULL, null=True, blank=True,
          related_name='primary_opportunities'
      )
      lead_users = models.ManyToManyField(
          User, blank=True,
          related_name='scoping_opportunities'
      )
  ```
* Opción B (Array de UUIDs):
  ```python
  lead_user_ids = ArrayField(models.UUIDField(), default=list, blank=True)
  ```

**2. DTO / Serializer Contract:**
* **Payload de entrada (POST / PATCH / PUT):**
  ```json
  {
    "lead_user_id": "usr-paola-002",
    "lead_user_ids": ["usr-paola-002", "usr-camilo-003"]
  }
  ```
* **Respuesta esperada (GET / Detalle y Listado):**
  ```json
  {
    "id": "opp-corp-001",
    "title": "Rediseño E-commerce B2B",
    "lead_user_id": "usr-paola-002",
    "lead_user_ids": ["usr-paola-002", "usr-camilo-003"],
    "lead_users": [
      { "id": "usr-paola-002", "name": "Paola Monsalve", "role": "Product Lead" },
      { "id": "usr-camilo-003", "name": "Camilo Cruz", "role": "Tech Lead" }
    ]
  }
  ```

**3. Regla de Migración y Compatibilidad:**
* **Datos existentes:** Para todo registro existente con `lead_user_id`, poblar automáticamente `lead_users = [lead_user_id]` o `lead_user_ids = [lead_user_id]`.
* **Escritura retrocompatible:**
  * Si el cliente solo envía `lead_user_id`, establecer `lead_users = [lead_user_id]`.
  * Si el cliente envía `lead_user_ids: [A, B]`, asignar `lead_user_id = A` como líder principal de compatibilidad.

**4. Endpoints de Consulta Personalizada (Mi Día / Mis Oportunidades):**
* Al consultar oportunidades asignadas al usuario activo (`/api/opportunities/?my_opportunities=true` o `/api/my-day/`):
  ```python
  # Django ORM:
  Q(lead_user_id=request.user.id) | Q(lead_users__id=request.user.id)
  ```
```

### 7.3 Hoja de Ruta Frontend tras Entrega Backend
Cuando Indunova publique el soporte en API:
1. **Selector UI:** Habilitar multiselect con checkboxes (1..N líderes de scoping) en cabecera de New Business.
2. **Mi Día:** Filtro dinámico multidimensional que muestre la tarjeta de scoping en el dashboard de cada uno de los líderes asignados.
3. **Persistencia Real:** Enviar `lead_user_ids` junto con `lead_user_id` canónico sin riesgo de pérdida de selección.
4. **Handoff a Proyecto:** En la conversión a proyecto en Orbit (`ConvertOpportunityModal`), permitir transferir la dupla de líderes o seleccionar el Tech Lead / Project Manager principal asignando los roles correspondientes.

