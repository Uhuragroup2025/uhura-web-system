# Requerimientos de Backend e Infraestructura (Indunova) — Evolución de Cronograma, Dependencias y ProjectHealth

> **Destinatario:** Indunova (Equipo de Backend Django REST Framework / PostgreSQL)  
> **Origen:** Especificación Aprobada de Producto Uhura Group (Orbit 3.0)  
> **Objetivo:** Definir el modelo de datos relacional, endpoints REST y reglas invariantes para soportar la gestión de cronograma, dependencias de clientes, rondas de ajustes y el motor de salud multivectorial.

---

## 1. Extensiones al Modelo de Datos Relacional (PostgreSQL / Django ORM)

### 1.1 Modelo `ProjectProfile` (`orbit_core_projectprofile`)
Campos adicionales para soportar el trinomio Baseline / Forecast / Real:

```python
# Campos de cronograma
baseline_start_date = models.DateField(null=True, blank=True, help_text="Plan original aprobado. Inmutable tras inicio.")
baseline_end_date = models.DateField(null=True, blank=True, help_text="Plan original aprobado. Inmutable tras inicio.")
forecast_end_date = models.DateField(null=True, blank=True, help_text="Fecha actualmente proyectada.")
actual_end_date = models.DateField(null=True, blank=True, help_text="Fecha real al finalizar el proyecto.")

# Configuración de tiempos de espera de cliente (JSONField o campos individuales)
schedule_config = models.JSONField(
    default=dict,
    blank=True,
    help_text="Configuración de tiempos de espera: {clientKickoffWaitDays: 3, gateApprovalWaitDays: 5, gateCount: 2, includedReworkRounds: 2}"
)
```

### 1.2 Nuevo Modelo: `ProjectDependency` (`orbit_core_projectdependency`)
Almacena insumos, accesos o gates que el cliente (o Uhura) debe suministrar:

```python
class ProjectDependency(models.Model):
    TYPE_CHOICES = [
        ('kickoff_input', 'Respuestas Kickoff'),
        ('client_input', 'Insumo del Cliente'),
        ('approval', 'Aprobación / Gate'),
        ('access', 'Accesos / Credenciales'),
        ('internal_dependency', 'Dependencia Interna'),
    ]
    OWNER_CHOICES = [
        ('client', 'Cliente'),
        ('uhura', 'Uhura'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('received', 'Recibido'),
        ('overdue', 'Vencido'),
        ('waived', 'Dispensado / No Requerido'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('ProjectProfile', on_delete=models.CASCADE, related_name='dependencies')
    deliverable = models.ForeignKey('ProjectDeliverable', on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='client_input')
    owner_type = models.CharField(max_length=20, choices=OWNER_CHOICES, default='client')
    follow_up_owner = models.ForeignKey('UserProfile', on_delete=models.PROTECT, related_name='assigned_dependencies')
    
    requested_at = models.DateField(auto_now_add=True)
    expected_date = models.DateField()
    received_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    blocking = models.BooleanField(default=True, help_text="Si es true, detiene la ruta crítica del entregable/proyecto")
    
    # Auditoría objetiva de seguimiento activo
    last_follow_up_at = models.DateTimeField(null=True, blank=True)
    next_follow_up_date = models.DateField(null=True, blank=True)
    follow_up_notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 1.3 Nuevo Modelo: `ProjectScheduleChange` (`orbit_core_projectschedulenote`)
Historial inmutable de auditoría para cada reforecast confirmado por el líder:

```python
class ProjectScheduleChange(models.Model):
    CAUSE_CHOICES = [
        ('client_input_delay', 'Insumos de cliente tardíos'),
        ('client_approval_delay', 'Aprobación / Gate demorado'),
        ('internal_rework', 'Retrabajo interno / QA'),
        ('internal_execution_delay', 'Desvío operativo interno'),
        ('scope_change', 'Cambio de alcance'),
        ('other', 'Otro motivo'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('ProjectProfile', on_delete=models.CASCADE, related_name='schedule_history')
    previous_forecast_end_date = models.DateField()
    new_forecast_end_date = models.DateField()
    delta_business_days = models.IntegerField()
    cause = models.CharField(max_length=30, choices=CAUSE_CHOICES)
    dependency = models.ForeignKey('ProjectDependency', on_delete=models.SET_NULL, null=True, blank=True)
    confirmed_by = models.ForeignKey('UserProfile', on_delete=models.PROTECT)
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### 1.4 Nuevo Modelo: `ProjectReworkRound` (`orbit_core_projectreworkround`)
Registra cada ronda formal de feedback o iteración:

```python
class ProjectReworkRound(models.Model):
    CAUSE_CHOICES = [
        ('client_adjustment', 'Feedback ordinario de cliente'),
        ('internal_adjustment', 'QA / Corrección de error interno'),
        ('scope_redefinition', 'Redefinición de alcance / nuevo requerimiento'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('ProjectProfile', on_delete=models.CASCADE, related_name='rework_rounds')
    deliverable = models.ForeignKey('ProjectDeliverable', on_delete=models.SET_NULL, null=True, blank=True)
    round_number = models.PositiveIntegerField()
    cause = models.CharField(max_length=30, choices=CAUSE_CHOICES, default='client_adjustment')
    requested_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    estimated_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    actual_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    note = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey('UserProfile', on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
```

### 1.5 Campo en `Task` (`orbit_core_task`)
```python
progress_percent = models.PositiveSmallIntegerField(
    null=True,
    blank=True,
    help_text="Avance real declarado explícito de 0 a 100. Si está completada se asume 100."
)
```

---

## 2. Endpoints REST (Django REST Framework)

### 2.1 Dependencias
* `GET /api/v1/projects/{project_id}/dependencies/`  
  Lista dependencias del proyecto filtradas por status y blocking.
* `POST /api/v1/projects/{project_id}/dependencies/`  
  Crear dependencia (Permitido para `client_relationship`, `commercial`, `leader`, `executive`).
* `PATCH /api/v1/dependencies/{id}/`  
  Actualizar estado (ej. `status: "received"`, `received_at: "..."`) o registrar seguimiento (`last_follow_up_at: "..."`, `follow_up_notes: "..."`).
* `GET /api/v1/dependencies/pending-followup/`  
  Endpoint contextual para **Mi Día**: retorna dependencias de cliente pendientes o vencidas asignadas al usuario o de sus cuentas.

### 2.2 Reforecast Atómico
* `POST /api/v1/projects/{project_id}/reforecast/`  
  **Permiso RBAC:** Exclusivo `leader` o `executive`.
  **Payload:**
  ```json
  {
    "new_forecast_end_date": "2026-11-20",
    "delta_business_days": 3,
    "cause": "client_approval_delay",
    "dependency_id": "uuid-dep",
    "note": "Aprobación Gate 1 demorada por revisión de junta directiva",
    "shift_pending_tasks": true
  }
  ```
  **Transacción Atómica (`transaction.atomic()`):**
  1. Inserta `ProjectScheduleChange`.
  2. Actualiza `project.forecast_end_date`.
  3. Si `shift_pending_tasks == true`, desplaza `due_date` de las tareas con `completed == False` en `delta_business_days` hábiles.
  4. La `baseline_end_date` permanece estrictamente intacta.

---

## 3. Reglas Invariantes de Negocio para el Backend

1. **Invarianza de Baseline:** `baseline_start_date` y `baseline_end_date` no se pueden modificar vía `PATCH` normal una vez el proyecto pasa a estado `activo`. Solo administradores de base de datos bajo solicitud excepcional de dirección.
2. **Capacidad del Equipo:** Las ventanas de espera por cliente (`kickoff` y `gates`) no computan horas en `CapacityView` ni en deducciones de disponibilidad.
3. **Presupuesto Canónico:** `sold_hours` es la fuente de verdad contractual para calcular la quema y avance en `ProjectHealth`.
