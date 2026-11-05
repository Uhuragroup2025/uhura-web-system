# Orbit (Uhura Web System) — Especificación Canónica de Arquitectura & Operación

Este documento compila las definiciones oficiales de arquitectura y reglas de negocio del sistema Orbit (Uhura Web System), acordadas entre el equipo de Producto/Operaciones de Uhura Group (Paola Monsalve, Catalina Tejada) y el equipo de desarrollo de Indunnova.

---

## 1. Arquitectura Canónica 1:1:1

```
                     ┌──────────────────────────────┐
                     │ Oportunidad Comercial (Orbit)│
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
- **Badge de Estado unificado:** Ubicado inmediatamente debajo del nombre del proyecto como primer chip antes de los Gates contractuales:
  `Estado: Pendiente de iniciar` (badge azul) o `Estado: En ejecución` (badge verde) seguido de `🛡️ Gates incluidos: 2` y `🔄 Tandas de ajuste: 2 por gate`.
- **Botón diferenciador antes de iniciar:** Si el proyecto no ha sido formalmente iniciado o su fecha de arranque es futura, se muestra el botón prioritario **`Iniciar proyecto 🚀`** (en verde lima `#d4ff4a`, alto contraste).
- **Botón de seguimiento una vez iniciado:** Al iniciar el proyecto formalmente, el botón cambia a **`Iniciado | 📅 Inicio: [fecha] · Fin: [fecha] (Ajustar)`**, informando que está en curso y permitiendo ajustar las fechas en caso de replanificación.

---

## 7. Formalización Documental: Columna Dedicada de SOW en Clientes

En la vista de detalle de cada Cliente (`/clientes` -> Proyectos de la Cuenta):
- La tabla de proyectos cuenta con una **columna dedicada de SOW**, separada del nombre del proyecto.
- Si el proyecto cuenta con SOW formalizado, se despliega el botón **«Ver SOW»** con icono de documento, permitiendo consultar el contrato y entregables acordados sin sobrecargar el nombre del proyecto.

---

## 8. Módulo de Capacidad: Jornada de 42h, Barras Duales y Vista Unificada por Área

- **Jornada Base Estándar:** `42 horas semanales` (`8.4h/día` para deducción de festivos y ausencias aprobadas en Google Calendar / Orbit).
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
