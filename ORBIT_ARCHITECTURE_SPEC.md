# ECO (Uhura Web System) — Especificación Canónica de Arquitectura & Operación

Este documento compila las definiciones oficiales de arquitectura y reglas de negocio del sistema ECO (Uhura Web System), acordadas entre el equipo de Producto/Operaciones de Uhura Group (Paola Monsalve, Catalina Tejada) y el equipo de desarrollo de Indunnova.

---

## 1. Arquitectura Canónica 1:1:1

```
                     ┌──────────────────────────────┐
                     │ Oportunidad Comercial (ECO)│
                     └──────────────┬───────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
  Servicio 1: "SEO"        Servicio 2: "Web"        Servicio 3: "Ads"
           │                        │                        │
     (Si hay HubSpot)         (Si hay HubSpot)         (Si hay HubSpot)
           ▼                        ▼                        ▼
    Deal 1 en HubSpot        Deal 2 en HubSpot        Deal 3 en HubSpot
           │                        │                        │
     (Cierre ganado)          (Cierre ganado)          (Cierre perdido)
           ▼                        ▼                        ▼
  Proyecto Indep. 1        Proyecto Indep. 2             (EXCLUIDO)
    Líder: Camilo            Líder: Ana María         No genera proyecto
```

- **Regla Fundamental:** Cada servicio del alcance técnico es una unidad comercial y operativa independiente.
- **Cotización:** En la pestaña Cotización, cada servicio cuenta con su propio bloque/calculadora independiente con su modalidad (`fixed_project` o `fee_monthly`), su valor, su vigencia (en caso de fee) y su moneda (`COP` o `USD`).
- **Conversión (Ticket #132):** Al convertir una oportunidad a proyectos, el backend **NUNCA** debe agrupar los servicios en un solo proyecto. Cada servicio ganado genera **un registro independiente en la tabla de proyectos**, asociado al mismo Cliente en el directorio.

---

## 2. Tipos de Datos en Base de Datos (Decimales Obligatorios)

- **Valores económicos:** Los campos de valor cotizado, montos mensuales y totales deben estar definidos como `DECIMAL(14,2)` o `NUMERIC(14,2)` en PostgreSQL / SQL.
- **Prohibido usar `INTEGER`:** En cotizaciones en USD o con valores ajustados con centavos, usar `INTEGER` trunca los montos o revienta validaciones de esquema.

---

## 3. Modo Desacoplado / Manual (Tolerancia a Fallos de HubSpot)

La operación de New Business y Comercial en Uhura **nunca se bloquea por falta de conexión o fallas de token en HubSpot**:
1. **Creación de oportunidad manual:** Si HubSpot no responde o no está configurado, Comercial crea la oportunidad directamente con empresa, contacto, brief, carpetas de Drive, líderes de scoping y commercial owners (multicheck).
2. **Aprobación comercial manual con confirmación granular:** Si HubSpot no está disponible o es una oportunidad manual, Comercial presiona **«Marcar como ganada 🏆»**. El sistema despliega un modal interactivo donde Comercial confirma exactamente qué servicios fueron aprobados por el cliente, define qué hacer con los desmarcados (marcarlos como *Cierre perdido* o dejarlos en negociación), calcula el total ganado y registra la auditoría.
3. **Reconciliación posterior:** Cuando se cargue el token de HubSpot o se restablezca el servicio, los botones de creación de deals y sincronización quedan habilitados para sincronizar los negocios sin duplicar datos.
4. **Cierre perdido:** Cualquier servicio con etapa confirmada de «Cierre perdido» se muestra atenuado, se excluye de la sumatoria económica del contrato ganado y **NUNCA genera proyecto operativo**.

---

## 4. Asignación de Líderes Operativos por Servicio

- Al abrir el modal de conversión a proyectos, cada servicio ganado despliega un selector independiente de **Líder Operativo**.
- Comercial puede asignar el mismo líder o diferentes líderes por servicio (ej. Ana María Giraldo para Diseño, Camilo Vélez para Desarrollo, Catalina Tejada para Social Media).
- En el payload de conversión (`/api/convert-opportunity`), cada objeto dentro del array `projects` envía:
  ```json
  {
    "serviceId": "svc-123",
    "serviceName": "Rediseño Web WordPress",
    "projectName": "Rediseño Web WordPress — Danone S.A.",
    "projectType": "fixed_project",
    "soldValue": 15000000.00,
    "leadUserId": "usr-ana-giraldo",
    "leadUserName": "Ana María Giraldo",
    "deliverableIds": ["del-1", "del-2"]
  }
  ```
- El backend debe persistir el `lead_user_id` en el registro de cada proyecto creado.

---

## 5. Cronograma y Recálculo de Tareas

- Cada proyecto independiente tiene su propio cronograma (`startDate` y `endDate`).
- Al confirmar el inicio o programar un proyecto con duración en semanas, el sistema distribuye proporcionalmente los deadlines de las tareas del backlog según su orden y entregable.
- Cada proyecto corre en paralelo sin cruzarse ni sobreescribir las fechas de otros proyectos del mismo cliente.

---

## 6. Estados Operativos Dinámicos y Botón de Inicio («Iniciar proyecto 🚀»)

Para evitar confusiones en los proyectos activos en `/proyectos`:
- **Badge de Estado unificado:** Ubicado inmediatamente debajo del nombre del proyecto como primer chip:
  `Estado: Por iniciar` (aún no se pulsa «Iniciar proyecto»), `Programado · inicia [fecha]` (iniciado con fecha futura), `En ejecución`, `Cerrado` o `Archivado`, seguido del chip de rondas de ajuste incluidas (p. ej. `🔄 Rondas de ajuste: 2 × 5 días`, solo proyectos únicos). *(Actualizado 07 Nov 2026: el modelo de gates × tandas se reemplazó por rondas de ajuste.)*
- **Botón diferenciador antes de iniciar:** Si el proyecto no ha sido formalmente iniciado o su fecha de arranque es futura, se muestra el botón prioritario **`Iniciar proyecto 🚀`** (en verde lima `#d4ff4a`, alto contraste).
- **Botón de seguimiento una vez iniciado:** Al iniciar el proyecto formalmente, el botón cambia a **`Iniciado | 📅 Inicio: [fecha] · Fin: [fecha] (Ajustar)`**, informando que está en curso y permitiendo ajustar las fechas en caso de replanificación.

---

## 7. Formalización Documental: Columna Dedicada de SOW en Clientes

En la vista de detalle de cada Cliente (`/clientes` -> Proyectos de la Cuenta):
- La tabla de proyectos cuenta con una **columna dedicada de SOW**, separada del nombre del proyecto.
- Si el proyecto cuenta con SOW formalizado, se despliega el botón **«Ver SOW»** con icono de documento, permitiendo consultar el contrato y entregables acordados sin sobrecargar el nombre del proyecto.

---

## 8. Módulo de Capacidad: Jornada de 42h, Barras Duales y Vista Unificada por Área

- **Jornada Base Estándar:** `42 horas semanales` (`8.4h/día` para deducción de festivos y ausencias aprobadas en Google Calendar / ECO).
- **Dos Barras Independientes por Colaborador:**
  1. **Barra 1 — `Planificado`:** Suma las horas presupuestadas/asignadas (`budgetedHours`) de las tareas asignadas al colaborador en el periodo frente a su capacidad neta semanal.
  2. **Barra 2 — `Ejecutado` (en amarillo `#f59e0b`):** Suma las horas reales registradas (`TimeLog`) por el colaborador en el periodo frente a su capacidad neta semanal.
- **Cálculo Realista de Horas Libres (`Libre`):**
  $$\text{Libre} = \max(0, \text{Capacidad Neta} - \max(\text{Planificado}, \text{Ejecutado}))$$
  De esta forma, si un colaborador registra horas en tareas sin presupuesto previo, su disponibilidad semanal se descuenta en tiempo real.
- **Gobernanza de Vistas y Filtro por Área:**
  - `collaborator`: accede únicamente a **`Mi Capacidad`** (balance personal, tareas y timer).
  - `leader`, `commercial`, `administrative`, `executive`, `client_relationship`, `system_admin`: acceden a la vista unificada **`Organización`** con filtro por área (`Todas las áreas`, `Área Creatividad`, `Área Growth`, `Área Producto`, `Área Administrativa`, `Área Comercial`, `C-Level / Dirección`), eliminando la pestaña redundante «Mi Equipo».
- **Definición de las 3 Tarjetas KPI Superiores (Vista Organización):**
  1. **`Capacidad Global`:**
     - Muestra el total de horas **Planificadas** (`sum(assigned)`) frente al total de horas **Disponibles Netas** (`sum(netCapacity)`) de los colaboradores visibles en el filtro activo, junto con el total de horas **Ejecutadas/Registradas** (`sum(executed)`) y su barra termométrica de doble segmento (*Ejecutado*, *Pendiente*, *Libre*).
  2. **`Estado de Carga de la Organización`:**
     - Muestra el `%` promedio de utilización (`round((totalAssigned / totalCapacity) * 100)`), el badge de salud (`Capacidad Saludable` si `overloadedCount === 0`, o `Sobrecarga Detectada` si hay colaboradores con carga > capacidad neta) y el conteo de colaboradores sobrecargados vs. con disponibilidad.
  3. **`Ritmo de Avance (Pacing)`:**
     - Compara el porcentaje de horas ejecutadas sobre la **Meta Productiva (`85%` de la capacidad neta = `35.7h/semana` en jornada de `42h`)** frente al porcentaje de días hábiles transcurridos en la semana (`Lunes = 20%`, `Martes = 40%`, `Miércoles = 60%`, `Jueves = 80%`, `Viernes = 100%`), indicando si el equipo está *En Ritmo* (`±10%`), *Adelantado* (`> +10%`) o *Rezagado* (`< -10%`).
- **Umbrales Realistas de Carga y Sobrecarga (Factor Productivo `85%`):**
  - Sobre la jornada contractual de **`42.0h/semana`** (`8.4h/día`), se reserva un **`15%` (`6.3h/semana`)** para chats, correos, ceremonias internas y pausas, estableciendo **`35.7h/semana` (`85%`)** como capacidad productiva sostenible:
    - 🔵 **Disponible (`< 75%` → `< 31.5h`):** Holgura real para nuevas asignaciones.
    - 🟢 **En Ritmo (`75% – 85%` → `31.5h – 35.7h`):** Carga productiva ideal y sostenible.
    - 🟡 **Al Límite (`86% – 100%` → `35.8h – 42.0h`):** Alerta temprana (supera el 85% productivo; riesgo de absorber chats/correos en horas extra).
    - 🔴 **Sobrecarga (`> 100%` → `> 42.0h`):** Sobrecarga crítica por encima de la jornada legal/contractual.

- **Distribución Oficial de Perfiles por Área (Filtro `Organización`):**
  - **`Área Producto`:** Paola Monsalve (Product Lead), Laura Isabel Gómez (Digital Designer), Oscar Cerpa (Desarrollador Web Front-End).
  - **`Área Growth`:** Camilo Vélez (Growth Manager), Nayeliz Brunal (Digital Content Specialist), Juan Sebastian Caicedo (Traffic & Performance Specialist), Simón Vélez (Trafficker Media / DigiOps Specialist).
  - **`Área Creatividad`:** Diego Cadavid (Creative & Copy Lead), Esmeralda Duque Ramírez (Content Creator), Sara Rivera (Community Manager), Melisa Gil (Creative Designer), Juan Camilo Torres (Creative Strategist), Diego Alejandro Flores Vargas (Media & Design), Sara María Lagos Obando (Creative Specialist).
  - **`Área Comercial`:** Catalina Tejada (Directora Comercial), Luisa Fernanda Urazán (Operaciones & Cuentas / Client Relationship).
  - **`Área Administrativa`:** Laura Viviana Salazar Perez (Administrativa & RRHH).
  - **`C-Level`:** Ana María Giraldo (Dirección General / CEO), Álvaro Antonio Gómez Machuca (Representante Legal / Dirección).
- **Asignación Multi-Colaborador (`assigneeAllocations`) vs. `Seguidores` (`0h` en Capacidad):**
  - **Bolsa Única y Prorrateo (`Colaboradores`):** Una tarea tiene una bolsa única de horas presupuestadas (`budgetedHours`, ej. `4.0h`). Si tiene **1 colaborador**, absorbe el `100%` (`4.0h`). Si tiene **`N > 1` colaboradores**, la bolsa se reparte entre ellos (`assigneeAllocations`, auto-división equitativa por defecto o editable manualmente), **nunca** duplicando el `100%` de las horas a cada colaborador.
  - **`Seguidores` y `Project Lead` (`0.0h` en Capacidad):** Quienes solo requieren visibilidad, acompañamiento o coordinación (ej. *Client Relationship* solicitando insumos al cliente o *Project Lead* revisando entregables) deben ubicarse en **`Seguidores`** o **`Project Lead`**. Su impacto en Capacidad es **`0.0h`** y **no descuentan tiempo** de la bolsa de ejecución del colaborador (sus tiempos implícitos de gestión/revisión se cubren con el `15%` de colchón operativo de las `42.0h` o con bolsas propias de gestión).
  - **Reasignación (`Mover a Seguidores`):** Al reemplazar un ejecutor (`Persona X → Persona Y`), se debe mover a `Persona X` a **`Seguidores`** (acción rápida 1-clic en el modal) para liberar su capacidad **Planificada** futura sin perder sus `TimeLogs` históricos en su barra de **Ejecutado**.

---

## 9. Timer Global de Tareas: Estado Único, Controles Homologados y Cambio de Tarea

- **Estado Único Compartido y Persistencia:**
  - Existe un único estado `activeTimer` por usuario compartido en toda la aplicación (Encabezado Global, Detalle de Tarea, `Mi Día` y `Tareas`), persistido ante recarga de vista (`localStorage` / backend).
  - Al pausar (`isPaused = true`), el contador deja de avanzar y el control cambia a **Reanudar**.
- **Controles por Punto de Entrada:**
  - **Encabezado Global:** muestra cliente, nombre de la tarea, tiempo transcurrido, botón **Pausar / Reanudar** y botón **Detener**.
  - **Detalle de Tarea:** al estar activa la tarea, reemplaza `Iniciar Timer` por **Pausar / Reanudar** y **Detener**.
  - **Miniaturas / Filas (`Mi Día` y `Tareas`):** destacan la tarea activa con la etiqueta **`En curso`** y muestran **dos controles independientes usando solamente iconos** (`Pausar/Reanudar` y `Detener`, sin escribir la palabra *Pausar*).
- **Flujo `Cerrar el actual y cambiar`:**
  1. Si existe un timer activo e intentan iniciar otra tarea, se solicita confirmación entre **`Seguir con el actual`** (cierra el aviso sin cambios) y **`Cerrar el actual y cambiar`**.
  2. Al elegir **`Cerrar el actual y cambiar`**, se pausa el timer vigente y se abre el flujo de **`Registrar tiempo`** para confirmar las horas de la **tarea anterior**.
  3. Al confirmar el registro, el `TimeLog` se guarda **únicamente en la tarea anterior** y se **inicia automáticamente** el timer de la nueva tarea, actualizando encabezado, detalle y listas.
  4. Si el usuario **cancela el registro**, se mantiene el timer anterior activo y **no** se inicia el nuevo (sin duplicar registros ni perder tiempo).

---

## 10. Reglas de «Mi Día», Sincronización de Colaboradores y Notificaciones

- **Contenido Estricto de «Mi Día»:**
  - `Mi Día` debe mostrar únicamente lo accionable **hoy** para el usuario autenticado, ordenado por **prioridad** (`Urgente/Alta` primero):
    1. Tareas donde el usuario es **Colaborador** (`assignee` o `collaborators`) cuya fecha de entrega o programación (`dueDate` / `scheduledDate`) sea **hoy** (o vencidas pendientes).
    2. Tareas que requieren su **revisión o aprobación** (`status = Review` donde es `reviewer` o `Project Lead`).
    3. La tarea que tenga **en curso** con el timer activo.
- **Sincronización Inmediata al Cambiar o Sumar Colaboradores:**
  - **Al retirar/reemplazar un colaborador:** La tarea debe desaparecer inmediatamente de su **Capacidad** planificada, de su vista **Mi Día** y de **Mis Tareas**.
  - **Al asignar o sumar un colaborador:** La tarea debe aparecer inmediatamente en **Mis Tareas** (y en **Mi Día** si vence hoy o requiere su revisión), ordenada por prioridad y fecha de entrega.
- **Notificaciones de Asignación y Revisión:**
  - Todo cambio de asignación o adición como colaborador/revisor debe emitir una notificación en tiempo real en la campanita del encabezado indicando **título de la tarea, cliente/proyecto y prioridad**, con acceso directo al detalle de la tarea.
  - Al desplegar la campanita de notificaciones, las alertas visibles se marcan automáticamente como **leídas** (ocultando el punto rojo), y solo vuelve a activarse cuando llega una nueva notificación.
  - **Flujo de Estados por Rol en el Detalle de Tarea:**
    - Las listas de tareas (`Mi Día` y `Mis Tareas`) **no** incluyen checkbox circular de completado rápido; toda transición de cierre y aprobación se realiza desde el detalle de la tarea.
    - **Colaborador:**
      - Ve **`Iniciar tarea`** (en `To Do`) y **`Solicitar revisión →`** (en `In Progress`).
      - Cualquier acción del colaborador sobre una tarea en `To Do` (iniciar timer, enviar comentario, subir entregable o registrar tiempo) la pasa **automáticamente a `In Progress` (`En proceso`)**.
    - **Project Lead / Seguidor / Revisor:**
      - **No** ve el botón `Solicitar revisión →`.
      - Ve **`Completar y aprobar`** para cerrar y aprobar la tarea directamente (o al marcarla manualmente como completada, se da por aprobada en estado `Done`).
      - Cuando un colaborador pulsa `Solicitar revisión →` (estado `Review`), se habilitan los botones **`Devolver`** (regresa a `In Progress` para ajustes) y **`Aprobar y Completar`** (cierra en `Done`).
  - **Visibilidad de Desvíos Presupuestales (`¿Qué requiere mi atención?`):**
    - Cuando una tarea supera sus horas cotizadas (`horas ejecutadas > horas cotizadas`), la alerta **`Desvío X.Xh / Yh cotizadas`** se muestra obligatoriamente a **Comercial** (`commercial` / `client_relationship`) y al **Líder del proyecto asignado** (`projectLead` / `leader` de ese proyecto).

---

## 11. Imputación por Fecha de Trabajo Ejecutado, Perfil Personal y La Colonia

- **Imputación de `TimeLog` por Fecha de Trabajo Ejecutado (`work_date`):**
  - Todo registro de tiempo (por timer o carga manual) se acredita al usuario autenticado que lo ejecuta (`userId`) y se imputa al día correspondiente a su **`Fecha del trabajo ejecutado`** (`work_date`, por defecto el día vigente, o la fecha seleccionada en el formulario manual, ej. ayer).
  - En **Mi Capacidad**, la distribución semanal (`Lunes` a `Viernes`) y el desglose **`Timesheets · [Día]`** reflejan cada `TimeLog` en el día exacto de su `work_date`, permitiendo hacer clic en cualquier día y abrir directamente el detalle de cada tarea registrada.
- **Perfil Personal (`Mi Perfil` desde el Header) y Gobernanza de Edición:**
  - Al hacer clic en la foto de perfil del encabezado principal, se abre **únicamente el perfil del usuario autenticado** (sin directorio de otros colaboradores).
  - **Autoservicio restringido:** independientemente de su `accessLevel`, cada usuario solo puede editar sus **Pasatiempos e intereses** (`hobbies`) y **Su sueño o meta personal** (`personalDream`).
  - **Vacaciones sincronizadas con Calendar:** el perfil muestra el estado y fechas de vacaciones en sincronización automática con **Google Calendar / Equipo & Accesos**.
  - **Edición de terceros:** la modificación de datos contractuales, roles, capacidad o perfiles de otros usuarios es exclusiva del **Administrador desde `Equipo & Accesos`**.
- **La Colonia (`Cónoce la colonia Uhureña` & `Jugar en la colonía`):**
  - Muestra el muro cultural de solo lectura del equipo y el acceso directo **`Jugar en la colonía`** (minijuegos de Bucky), sin modal de directorio ni edición cruzada de perfiles.
