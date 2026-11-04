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
