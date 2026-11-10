# Guía de Carga Inicial y Seeding de Colaboradores (Uhura Group / ECO)

> **Documento Complementario a `ORBIT_PRODUCT_STATUS.md`**
> Este documento define la estructura y el dataset base referencial para la inicialización (seeding, fixtures o scripts de migración) del equipo en la base de datos relacional de ECO desarrollada por Indunova.
> **Fecha de Actualización:** 26 de octubre de 2026 — Alineación con decisiones confirmadas de producto y política de privacidad de repositorios públicos.

> **AVISO DE PRIVACIDAD Y GOBERNANZA:**
> La documentación pública define reglas, estructuras y comportamientos. La identidad nominal de colaboradores, correos, relaciones de reporte, calendarios individuales y crosswalk con backend se administra exclusivamente mediante **Equipo Canónico Privado**.

---

## 1. Política de Protección de Datos Sensibles y Gobernanza de la Matriz Privada

1. **Protección de Datos en Repositorio Público:**
   En estricto cumplimiento de las políticas de privacidad y seguridad para repositorios públicos, este documento **no publica nombres de personas, apellidos, correos electrónicos corporativos ni personales, números de identificación, direcciones domiciliarias, fechas de nacimiento, fechas de ingreso, ciudades, salarios ni Backend User IDs**.
2. **Canal de Suministro Seguro a Indunova:**
   La información sensible requerida para el crosswalk técnico y la creación de credenciales de acceso es administrada de forma reservada por el área administrativa y entregada a Indunova por canales administrativos seguros y cifrados.
3. **Contraste con la Matriz de Equipo Canónico Privado:**
   Todos los cargos, roles oficiales, niveles de acceso y dependencias de reporte están rigurosamente contrastados contra la matriz autoritativa privada (*Equipo Canónico Privado*).
4. **Validación del Universo de Colaboradores (18 Activos):**
   El universo canónico vigente de ECO está formalmente cerrado y confirmado en **exactamente 18 colaboradores activos**. La referencia histórica preliminar a 19 colaboradores ha sido corregida y descartada en la matriz autoritativa.
5. **Gobernanza del Perfil Ejecutivo (`executive`):**
   El perfil `executive` adicional definido en Equipo Canónico Privado forma parte de los 18 colaboradores activos y debe contar con usuario ECO. Su asociación con Backend User ID se resolverá durante el crosswalk con Indunova.
6. **Gobernanza de Perfiles `system_admin`:**
   Existen dos usuarios iniciales con Access Level `system_admin` con idénticos permisos técnicos en plataforma. La diferenciación funcional y operativa (soporte técnico / producto digital vs. soporte administrativo y configuración de capacidades/calendarios) corresponde a su rol en la organización, según se define en Equipo Canónico Privado, sin exponer identidades nominales en la documentación pública.

---

## 2. Estructura y Distribución de Colaboradores Activos del Equipo Canónico (18 Puestos)

La siguiente tabla resume la distribución estructural y operativa de los **18 colaboradores activos** del equipo canónico según su nivel RBAC, área funcional, rol oficial del Catálogo de Servicios, calendario laboral asignado y capacidad semanal base (42 horas):

| Puestos Activos | Nivel RBAC (`accessLevel`) | Área Operativa | Rol Canónico Oficial | Calendario Laboral | Capacidad Semanal Base |
|:---:|---|---|---|:---:|:---:|
| 2 | `executive` | Dirección General / Administrativo | CEO | Colombia (2) | 42h |
| 2 | `system_admin` | Producto Digital / Administrativo | Product Lead / Administrativa | Colombia (2) | 42h |
| 1 | `commercial` | Comercial | Directora Comercial | México (1) | 42h |
| 1 | `client_relationship` | Comercial | Client Relationship Strategist | Colombia (1) | 42h |
| 2 | `leader` | Creatividad / Growth | Creative Strategy Lead / Growth Manager | Colombia (1) / México (1) | 42h |
| 10 | `collaborator` | Creatividad / Growth / Producto Digital | Diseñadores, Creadores de Contenido, Dev Front-End, Traffickers Media | Colombia (7) / México (3) | 42h |
| **18** | **Total Colaboradores Activos** | — | — | **Colombia (13) / México (5)** | **42h por persona** |

> *Nota:* La correspondencia nominal exacta, correos corporativos, cargos operativos, líderes directos de reporte (`reportsTo`), calendarios laborales individuales y crosswalk con Backend User ID se mantienen exclusivamente en la matriz privada **Equipo Canónico Privado** y el canal administrativo seguro con Indunova.

---

## 3. Cuentas duplicadas e históricas identificadas para conciliación por Indunova

Los pares de cuentas duplicadas y los perfiles históricos que requieren conciliación están identificados en Equipo Canónico Privado. Indunova deberá aplicar la inactivación lógica preservando todas las relaciones e historial.

### Reglas Técnicas de Conciliación en Base de Datos:
1. **Conservación de Cuentas Activas Canónicas:** Conservar activo únicamente el perfil canónico oficial (`is_active = True`) de cada uno de los 18 colaboradores activos.
2. **Inactivación Lógica Obligatoria:** Inactivar los registros duplicados y perfiles históricos identificados en la matriz privada (`is_active = False` / `status: 'Inactive'`).
3. **Preservación Íntegra de Historial:** Preservar íntegramente las tareas, horas registradas (`TimeLog`), proyectos pasados y el historial de relaciones asociadas a los perfiles inactivados.
4. **Exclusión de Selectores y Filtros Operativos:** Excluir automáticamente los perfiles inactivos de los selectores activos de asignación de tareas, responsables de entregables y filtros de planificación de capacidad.
5. **Prohibición de Borrado Físico:** Bajo ninguna circunstancia se ejecutarán borrados físicos (`DELETE`) en base de datos.

---

## 4. Reglas Canónicas de Capacidad y Calendarios

1. **Capacidad Semanal Base:**
   - Predeterminada en **42 horas semanales** por persona para todos los colaboradores activos.
   - Editable individualmente en *Equipo & Accesos* exclusivamente por usuarios con nivel `system_admin`.
   - El estado "Sin configurar" solo debe presentarse si en base de datos el valor no existe (`null`).
2. **Calendarios Laborales (Colombia y México):**
   - Configurados explícitamente por persona (`colombia` o `mexico`).
   - La ciudad de residencia es informativa y **nunca determina el calendario laboral**.
   - Los festivos se calculan estrictamente según el calendario asignado (Ley Emiliani para Colombia vs. Ley Federal del Trabajo para México).
   - **No retroactividad:** Las modificaciones de calendario o capacidad entran en vigor a partir de su fecha de vigencia y no alteran semanas históricas cerradas.
3. **Rol de Google Calendar:**
   > Google Calendar puede apoyar la sincronización de ausencias y vacaciones, pero no reemplaza el calendario laboral Colombia o México configurado explícitamente en Equipo & Accesos.
4. **Fórmula Canónica de Capacidad Neta Semanal:**
   $$\text{Capacidad Neta Semanal} = \text{Capacidad Semanal Base} - \text{Horas Festivos del Calendario} - \text{Ausencias Aprobadas}$$
5. **Distribución Diaria Referencial:**
   No se asumen 8 horas fijas por día; se deriva dinámicamente como $\frac{\text{Capacidad Base}}{5}$ para semanas hábiles estándar de 5 días (8.4 horas/día sobre 42h).

---

## 5. Estructura Referencial de Fixture para Seeding (JSON)

> **Posible implementación técnica, sujeta a validación de Indunova.**
> Los siguientes fixtures utilizan datos enteramente ficticios para ilustrar el esquema relacional esperado sin exponer identidades reales ni dejar claves foráneas colgantes.

```json
[
  {
    "model": "orbit_core.userprofile",
    "pk": "usr-ejemplo-001",
    "fields": {
      "first_name": "Usuario",
      "last_name": "Ejemplo 1",
      "job_title": "Rol de ejemplo 1",
      "official_role": "Rol cotizable de ejemplo 1",
      "access_level": "collaborator",
      "work_calendar": "colombia",
      "weekly_capacity_hours": 42.0,
      "calendar_effective_date": "2026-10-26",
      "reports_to": null,
      "is_active": true
    }
  },
  {
    "model": "orbit_core.userprofile",
    "pk": "usr-ejemplo-002",
    "fields": {
      "first_name": "Usuario",
      "last_name": "Ejemplo 2",
      "job_title": "Rol de ejemplo 2",
      "official_role": "Rol cotizable de ejemplo 2",
      "access_level": "collaborator",
      "work_calendar": "mexico",
      "weekly_capacity_hours": 42.0,
      "calendar_effective_date": "2026-10-26",
      "reports_to": "usr-ejemplo-001",
      "is_active": true
    }
  }
]
```
