# Orbit · Guía de Arquitectura Evolutiva: People Master

> **ESTADO DE ESTE DOCUMENTO:** Documento de Arquitectura y Visión de Producto Futura.  
> **DESTINATARIO TÉCNICO:** Indunova (Backend Django REST Framework / PostgreSQL) y Equipo de Producto Uhura Group.  
> **ALCANCE Y BLOQUEO:** Este documento define el modelo conceptual hacia el cual evolucionará la gestión de personas en Orbit en fases posteriores. **NO hace parte del alcance actual y NO bloquea la integración frontend ↔ backend del core operativo en curso.**

---

## 1. Contexto y Decisión Arquitectónica

Orbit se encuentra cerrando la integración técnica de su core operativo (Proyectos, Tareas, New Business, Capacidad, Staffing, Time Tracking y Mi Día). El perfil de colaborador actual (`UserProfile` en backend / `UserItem` en frontend) cubre con suficiencia la identidad operativa, la jerarquía, la matriz RBAC, las fechas clave y el avatar.

A partir del análisis de la base administrativa de gestión humana de Uhura Group, se identifica la oportunidad de evolucionar a futuro hacia un **People Master** integral. Sin embargo, para preservar la agilidad, la estabilidad de los contratos de API y la privacidad de datos sensibles, se adopta la siguiente directriz arquitectónica:

> **PRINCIPIO DE AISLAMIENTO DE DOMINIOS:**  
> `UserProfile` no es ni será una "mega-tabla de RRHH".  
> La identidad operativa actual permanece estable y cerrada en su contrato v1. Los futuros dominios administrativos (compensación, contratos legales, dotación, seguridad y salud en el trabajo) se estructurarán en entidades satélite desacopladas cuando sea requerida su implementación.

---

## 2. Alcance Actual: Identidad Operativa y de Acceso (`UserProfile` / `UserItem`)

El modelo actual representa exclusivamente al colaborador como actor operativo dentro del ecosistema de trabajo de Uhura Group.

### Campos Core Persistidos (Contrato v1 Vigente):
- **`id`:** Identificador único (UUID).
- **`name` / `fullName`:** Nombre completo (con segregación de `firstName` y `lastName`).
- **`email`:** Correo corporativo `@uhuragroup.com` (identificador único de acceso).
- **`jobTitle`:** Cargo operativo visible en la organización.
- **`officialRole` / `professionalRole`:** Rol canónico del Catálogo de Servicios (`StandardUhuraRole`).
- **`accessLevel`:** Nivel de autorización según la Matriz Canónica RBAC (`CanonicalOrbitAccessLevel`: 7 niveles cerrados).
- **`department`:** Área o departamento operativo.
- **`leaderId` / `reportsTo`:** Clave foránea al líder directo de reporte.
- **`city`:** Ciudad de residencia para visibilidad de equipo distribuido.
- **`birthDate`:** Fecha de nacimiento en formato ISO `YYYY-MM-DD`.
- **`fecha_ingreso` / `joinedDate`:** Fecha contractual de vinculación laboral en formato ISO `YYYY-MM-DD` (Hire Date; de edición restringida; antigüedad y aniversario se derivan de ella).
- **`capacityHours`:** Capacidad semanal contractual en horas (base para el motor de capacidad).
- **`status`:** Estado de cuenta (`Active` | `Inactive` | `Invited`).
- **`avatar_url` / `avatarUrl`:** URL de la fotografía de perfil.

### Subsistemas Core Alimentados por este Modelo:
1. **Equipo & Accesos:** Directorio operativo, jerarquía y asignación de permisos RBAC.
2. **Mi Día:** Bandeja diaria, clima, y eventos de equipo (cumpleaños próximos y aniversarios).
3. **Capacidad y Staffing:** Horas contratadas disponibles para presupuestación y asignación de tareas.
4. **Bucky Engine:** Contexto para saludos, métricas y reconocimientos.
5. **Seguridad & RBAC:** Control de autorización para acceso a módulos y alcances de datos.

---

## 3. Modelo Conceptual Futuro: Entidades Satélite de People Master

Para evitar que `UserProfile` acumule decenas de columnas de diversa naturaleza administrativa, el futuro People Master se conceptualiza como un conjunto de entidades relacionadas con el colaborador:

```text
User / Employee (Core Operativo y Acceso)
│
├── EmployeeProfile (1:1 opcional)
│   └── Datos personales ampliados: tipo de documento legal, número de identificación,
│       nacionalidad, estado civil, dirección de residencia, teléfono personal.
│
├── EmploymentRecord (1:N histórico)
│   └── Historial contractual: tipo de contrato (indefinido, prestación de servicios, etc.),
│       fecha de inicio/fin, razón social empleadora, cláusulas de dedicación, jornada formal.
│
├── CompensationRecord (1:N histórico)
│   └── Historial de compensación: salario base, variaciones, moneda, tipo de pago,
│       esquemas variables o bonificaciones, fechas efectivas.
│
├── EmergencyContact (1:N)
│   └── Contactos de emergencia: nombre, parentesco, teléfono principal, teléfono secundario.
│
├── AssetAssignment (1:N)
│   └── Dotación y activos: equipo de cómputo, serial, marca, especificaciones,
│       fecha de asignación, acta de entrega, periféricos, licencias individuales de software.
│
├── LeaveRecord / LeaveLedger (1:N transaccional)
│   └── Libro mayor de vacaciones y licencias: días causados por ley, días disfrutados,
│       saldo acumulado, compensaciones en dinero, soportes de aprobación.
│
└── SSTRecord (1:N según necesidad estricta)
    └── Seguridad y Salud en el Trabajo: fechas de exámenes médicos ocupacionales
        (ingreso, periódico, egreso), restricciones operativas si aplican, entidad ARL.
```

> **NOTA DE DOMINIO:** Estos nombres y relaciones son conceptuales y referenciales. No constituyen contratos técnicos definitivos ni comprometen la arquitectura de tablas actual.

---

## 4. Ficha Humana: Experiencia de Presentación, No Ficha de RRHH

La **Ficha Humana** (`TeamHumanProfileModal`) cumple un rol cultural y de cercanía dentro de la plataforma y debe mantenerse bajo las siguientes pautas:
- **No duplicidad:** No es una entidad independiente en base de datos. Consume directamente el mismo `UserItem` / `UserProfile`.
- **Datos visibles pertinentes:** Fotografía, nombre, cargo, ciudad, cumpleaños (con edad calculada en tiempo de ejecución), fecha de ingreso (aniversario y años de antigüedad derivados), pasatiempos (`hobbies`), mascotas (`petNames`) y sueños o metas personales (`personalDream`).
- **Aislamiento estricto:** Queda prohibido mezclar información contractual, salarial, de dotación o médica en esta experiencia. La Ficha Humana representa a la persona en el equipo, no a su expediente de personal.

---

## 5. Evolución del Módulo Equipo & Accesos (Visión 360)

A futuro, cuando se implemente People Master, la interfaz de administración del colaborador podrá organizarse en una vista 360 con pestañas temáticas:
- **Perfil:** Identidad profesional, datos biográficos básicos y ficha humana editable.
- **Trabajo:** Cargo, líder directo, área operativa, horas de capacidad semanal y rol oficial.
- **Accesos:** Nivel canónico RBAC, credenciales y alcances de módulo.
- **Administración:** Vinculación contractual, datos de compensación y contactos de emergencia (restringido).
- **Activos:** Inventario de equipos y herramientas asignadas.
- **Vacaciones:** Balance de días causados vs. disfrutados e historial de solicitudes.

**Regla de alcance:** Esta estructura multi-pestaña **NO se implementa en la fase actual**; el módulo actual de *Equipo & Accesos* permanece enfocado en la gestión operativa del equipo y la matriz RBAC.

---

## 6. Privacidad, Seguridad y Gobernanza de Datos Sensibles

### 6.1. Clasificación de Datos Restringidos
Los siguientes datos tienen carácter confidencial y restringido:
- Documento de identificación personal (cédula de ciudadanía, extranjería, pasaporte).
- Salarios, tarifas de nómina individuales, esquemas de bonificación e historial de pagos.
- Tipo de contrato legal, minutas contractuales y actas de terminación.
- Dirección domiciliaria personal y teléfonos privados.
- Afiliaciones a entidades de seguridad social (EPS, Fondo de Pensiones, Cesantías).
- Datos de salud, exámenes médicos ocupacionales y registros de SST.
- Contactos de emergencia familiares.

### 6.2. Reglas Mandatorias de Gobernanza:
1. **Prohibición en Repositorios:** Ningún dato confidencial real de personas debe versionarse en Git ni dejarse almacenado en mocks o archivos estáticos de frontend.
2. **Los 7 Niveles Canónicos RBAC Permanecen Intactos:**  
   No se creará un rol `hr_admin` dentro del enum `accessLevel`. La matriz RBAC de 7 niveles (`collaborator`, `leader`, `client_relationship`, `commercial`, `administrative`, `executive`, `system_admin`) se mantiene sin alteraciones.
3. **Gobierno por Capacidades / Permisos Específicos:**  
   La futura visibilidad y edición de datos sensibles de People se gobernará mediante permisos o capacidades funcionales específicas e independientes del `accessLevel` (por ejemplo: `people.hr.read`, `people.hr.write`, `people.compensation.read`, `people.compensation.write`, `people.sst.read`, `people.assets.manage` —nombres referenciales).
4. **Aislamiento Técnico para `system_admin`:**  
   El rol `system_admin` es un perfil técnico de gestión de plataforma y seguridad de sistemas; **no tiene acceso automático ni por defecto a información salarial, contractual o médica** de los colaboradores.
5. **Protección en Reposo y Auditoría:**  
   Los datos sensibles deberán contar con controles reforzados de acceso, auditoría y protección en reposo. La estrategia técnica definitiva de persistencia y cifrado se definirá de manera concertada con los equipos de backend e infraestructura antes de iniciar la implementación de People Master.
6. **Criterio de Necesidad Funcional en SST:**  
   No se debe asumir que toda la información existente en las bases administrativas actuales deba migrarse a Orbit. La inclusión futura de datos de SST o registros ocupacionales dependerá de una justificación funcional clara, de la legislación aplicable y de las políticas de privacidad de Uhura Group.

---

## 7. Resumen de Frontera: Core Actual vs. Futuro People Master

| Aspecto | Core Actual (Fase Actual) | Futuro People Master (Evolutivo) |
| :--- | :--- | :--- |
| **Objetivo** | Operación de proyectos, staffing y seguridad | Gestión integral del ciclo de vida del colaborador |
| **Entidad Principal** | `UserProfile` / `UserItem` | `User` + Entidades satélite especializadas |
| **Gobernanza RBAC** | 7 niveles canónicos cerrados | 7 niveles canónicos + permisos granulares de People |
| **Capacidad** | Semanal operativa (`capacityHours`) | Historial de variaciones y afectación prestacional |
| **Cultura** | Ficha Humana contextual | Ficha Humana + Expediente administrativo |
| **Integración Indunova** | **En curso (v1)** — sin dependencias adicionales | Fase posterior independiente |

---

*Documento complementario a [`src/docs/ORBIT_PRODUCT_STATUS.md`](./ORBIT_PRODUCT_STATUS.md) y [`src/docs/INITIAL_TEAM_SEED.md`](./INITIAL_TEAM_SEED.md).*
