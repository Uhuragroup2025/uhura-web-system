# Guía de Carga Inicial y Seeding de Colaboradores (Uhura Group / Orbit)

> **Documento Complementario a `ORBIT_PRODUCT_STATUS.md`**  
> Este documento define la estructura y el dataset base para la inicialización (seeding, fixtures o scripts de migración) del equipo en la base de datos relacional de Orbit desarrollada por Indunova.

---

## 1. Política de Protección de Datos Sensibles y Gobernanza

1. **Desacople de Datos Sensibles:**  
   Los datos de carácter reservado o confidencial —tales como **números de documentos de identidad, salarios y compensaciones, copias de contratos laborales, direcciones residenciales o correos electrónicos personales**— **NO** deben versionarse en archivos markdown públicos o repositorios accesibles fuera del canal de infraestructura.
2. **Canal de Suministro Controlado:**  
   La información contractual y salarial oficial para poblar tablas paramétricas (como `RoleRate` o datos de nómina) será entregada a Indunova a través de canales administrativos seguros por parte de **Laura Viviana Salazar (Administrativa & RRHH)** y **Finanzas de Uhura Group**.
3. **Estabilidad de la Especificación Funcional:**  
   La especificación funcional maestra (`ORBIT_PRODUCT_STATUS.md`) define el comportamiento, reglas de negocio y contratos de API. Este archivo (`INITIAL_TEAM_SEED.md`) concentra los datos de contexto del equipo actual para su inicialización sin alterar la definición funcional si el equipo rota.

---

## 2. Dataset Base: Perfiles Operativos de los 19 Colaboradores

La siguiente tabla consolida los perfiles operativos del equipo Uhura Group al corte de Septiembre 2026, vinculando sus roles en el Catálogo de Servicios, niveles de autorización RBAC y fechas fundacionales de ingreso:

| Nombre Completo | Nombres | Apellidos | Correo Corporativo | Cargo Operativo (`jobTitle`) | Rol Canónico (`StandardUhuraRole`) | Nivel RBAC (`accessLevel`) | Rol Sistema (`role`) | Fecha Ingreso (`fecha_ingreso`) | Líder Directo (`reportsTo`) | Fotografía Canónica (`avatar_url`) |
|---|---|---|---|---|---|---|---|---|---|---|
| **Ana María Giraldo Restrepo** | Ana María | Giraldo Restrepo | `ana.giraldo@uhuragroup.com` | Dirección General / CEO | Perfil Interno Dirección | `DIRECTOR` | `admin` | `2020-06-01` | Dirección General (N/A) | `ana-maria-giraldo.webp` |
| **Nayeliz Paola Brunal Correa** | Nayeliz Paola | Brunal Correa | `nayeliz.brunal@uhuragroup.com` | Digital Content Specialist | `Digital Content Specialist` | `OPERATIVO` | `member` | `2022-02-14` | Camilo Vélez Henao | `nayeliz-brunal.webp` |
| **Luisa Fernanda Urazan Prieto** | Luisa Fernanda | Urazan Prieto | `luisa.urazan@uhuragroup.com` | Operaciones & Cuentas | `Project / Operations Manager` | `LIDER` | `admin` | `2022-04-04` | Catalina Tejada Castaño | `luisa-fernanda-urazan.webp` |
| **Laura Viviana Salazar Perez** | Laura Viviana | Salazar Perez | `laura.salazar@uhuragroup.com` | Administrativa & RRHH | Perfil Interno Soporte | `ADMINISTRATIVO` | `admin` | `2022-03-19` | Ana María Giraldo | `laura-viviana-salazar.webp` |
| **Paola Andrea Monsalve Giron** | Paola Andrea | Monsalve Giron | `paola.monsalve@uhuragroup.com` | Product Lead / Dirección Producto | `Digital Product Strategist` | `DIRECTOR` | `admin` | `2022-07-05` | Ana María Giraldo | `paola-monsalve.webp` |
| **Juan Sebastian Caicedo Correa** | Juan Sebastian | Caicedo Correa | `sebastian.caicedo@uhuragroup.com` | Traffic & Performance Specialist | `Traffic Specialist` | `OPERATIVO` | `member` | `2023-04-12` | Camilo Vélez Henao | `juan-sebastian-caicedo.webp` |
| **Jenny Esmeralda Duque Ramírez** | Jenny Esmeralda | Duque Ramírez | `jenny.duque@uhuragroup.com` | Digital Designer | `Digital Designer` | `OPERATIVO` | `member` | `2023-06-05` | Diego Cadavid Díaz | `esmeralda-duque.webp` |
| **Laura Isabel Gomez Agudelo** | Laura Isabel | Gomez Agudelo | `laura.gomez@uhuragroup.com` | Digital Designer | `Digital Designer` | `OPERATIVO` | `member` | `2023-06-05` | Paola Andrea Monsalve Giron | `laura-isabel-gomez.webp` |
| **Diego Cadavid Díaz** | Diego | Cadavid Díaz | `diego.cadavid@uhuragroup.com` | Creative & Copy Lead | `Creative Strategist` | `LIDER` | `member` | `2023-11-16` | Ana María Giraldo | `diego-cadavid.webp` |
| **Álvaro Antonio Gómez Machuca** | Álvaro Antonio | Gómez Machuca | `alvaro.gomez@uhuragroup.com` | Representante Legal / Dirección | Perfil Interno Dirección | `DIRECTOR` | `admin` | `2024-01-26` | Dirección General (N/A) | *`null` (Fallback `AG`)* |
| **Juan Camilo Torres Ocampo** | Juan Camilo | Torres Ocampo | `camilo.torres@uhuragroup.com` | Creative Strategist | `Creative Strategist` | `OPERATIVO` | `member` | `2024-02-01` | Diego Cadavid Díaz | `juan-camilo-torres.webp` |
| **Catalina Tejada Castaño** | Catalina | Tejada Castaño | `catalina.tejada@uhuragroup.com` | Dirección Comercial | Perfil Interno Comercial | `LIDER` | `admin` | `2024-04-18` | Ana María Giraldo | `catalina-tejada.webp` |
| **Camilo Vélez Henao** | Camilo | Vélez Henao | `camilo.velez@uhuragroup.com` | Growth Lead / Tech | `Tech / Solutions Lead` | `LIDER` | `admin` | `2024-07-01` | Ana María Giraldo | `camilo-velez.webp` |
| **Oscar Iván Cerpa Peñates** | Oscar Iván | Cerpa Peñates | `oscar.cerpa@uhuragroup.com` | Front-End Dev / Fullstack | `Front-End Dev` | `OPERATIVO` | `member` | `2024-09-01` | Paola Andrea Monsalve Giron | `oscar-cerpa.webp` |
| **Sara Rivera Echeverry** | Sara | Rivera Echeverry | `sara.rivera@uhuragroup.com` | Operations & Process | `Project / Operations Manager` | `OPERATIVO` | `member` | `2025-01-20` | Diego Cadavid Díaz | `sara-rivera.webp` |
| **Simón Vélez Henao** | Simón | Vélez Henao | `simon.velez@uhuragroup.com` | Traffic Specialist | `Traffic Specialist` | `OPERATIVO` | `member` | `2025-05-15` | Camilo Vélez Henao | `simon-velez.webp` |
| **Melisa Gil Gómez** | Melisa | Gil Gómez | `melisa.gil@uhuragroup.com` | Community & Content | `Community Manager` | `OPERATIVO` | `member` | `2025-08-04` | Diego Cadavid Díaz | `melisa-gil.webp` |
| **Sara María Lagos Obando** *(Sarimar)* | Sara María | Lagos Obando | `sara.lagos@uhuragroup.com` | Creative Specialist | `Digital Content Specialist` | `OPERATIVO` | `member` | `2026-02-12` | Diego Cadavid Díaz | `sara-maria-lagos.webp` |
| **Diego Alejandro Flores Vargas** | Diego Alejandro | Flores Vargas | `diego.flores@uhuragroup.com` | Media & Design | `Motion / Multimedia Designer` | `OPERATIVO` | `member` | `2026-01-26` | Diego Cadavid Díaz | `diego-alejandro-flores.webp` |

*\*Nota: Las fechas de nacimiento (`birthDate`) oficiales se inyectarán desde el formulario de Equipo & Accesos o mediante el fixture seguro de RRHH al momento de la siembra en producción.*

---

## 3. Ejemplo Estructurado de Fixture para Seeding (JSON)

Para orientar a Indunova en la preparación de scripts de migración o fixtures de Django (`python manage.py loaddata`), se propone la siguiente estructura de entidad:

```json
[
  {
    "model": "orbit_core.userprofile",
    "pk": "usr-ana-001",
    "fields": {
      "email": "ana.giraldo@uhuragroup.com",
      "first_name": "Ana María",
      "last_name": "Giraldo Restrepo",
      "job_title": "Dirección General / CEO",
      "official_role": null,
      "role": "admin",
      "access_level": "DIRECTOR",
      "fecha_ingreso": "2020-06-01",
      "birth_date": null,
      "reports_to": null,
      "avatar_url": null,
      "is_active": true
    }
  },
  {
    "model": "orbit_core.userprofile",
    "pk": "usr-oscar-014",
    "fields": {
      "email": "oscar.cerpa@uhuragroup.com",
      "first_name": "Oscar Iván",
      "last_name": "Cerpa Peñates",
      "job_title": "Front-End Dev / Fullstack",
      "official_role": "Front-End Dev",
      "role": "member",
      "access_level": "OPERATIVO",
      "fecha_ingreso": "2024-09-01",
      "birth_date": null,
      "reports_to": "usr-camilo-013",
      "avatar_url": null,
      "is_active": true
    }
  }
]
```

---

## 4. Reglas de Cálculo en la Carga Inicial

1. **`fecha_ingreso` (Hire Date):** Se almacena como fecha civil pura (`YYYY-MM-DD`). No debe incluir marcas de tiempo (horas/minutos) para evitar problemas de conversión horaria.
2. **Cálculo Derivado de Aniversario:**  
   El backend y el frontend calculan el aniversario anual y los años de antigüedad al momento de consultar el perfil:
   ```python
   # Lógica conceptual de aniversario
   years_completed = current_date.year - user.fecha_ingreso.year
   current_year_anniversary = user.fecha_ingreso.replace(year=current_date.year)
   ```
3. **Asignación de Capacidad Base Inicial:**  
   Cada colaborador debe inicializarse con su jornada contractual configurada (por defecto 40h semanales, con 32h de dedicación efectiva a proyectos y 8h de gestión/ceremonias internas según la política de Uhura).

---

## 5. Mapeo Canónico de Fotografías de Perfil para Seeding de Medios (Indunova)

### 5.1 Convención de Nomenclatura para el Almacenamiento en Bucket / CDN
Cuando Indunova aprovisione el bucket de almacenamiento (GCS / S3 / CDN), las 18 imágenes validadas del equipo deberán cargarse bajo la ruta convenida (e.g. `team/` o `avatars/`) con los siguientes nombres canónicos normalizados (kebab-case en formato WebP):

1. **`ana-maria-giraldo.webp`** — Ana María Giraldo (CEO)
2. **`paola-monsalve.webp`** — Paola Andrea Monsalve (Product Lead)
3. **`luisa-fernanda-urazan.webp`** — Luisa Fernanda Urazán (Operaciones & Cuentas)
4. **`diego-cadavid.webp`** — Diego Cadavid (Creative & Copy Lead)
5. **`esmeralda-duque.webp`** — Jenny Esmeralda Duque Ramírez (Content Creator)
6. **`nayeliz-brunal.webp`** — Nayeliz Paola Brunal Correa (Digital Content Specialist)
7. **`laura-isabel-gomez.webp`** — Laura Isabel Gómez Agudelo (Digital Designer)
8. **`catalina-tejada.webp`** — Catalina Tejada Castaño (Directora Comercial)
9. **`juan-sebastian-caicedo.webp`** — Juan Sebastián Caicedo Correa (Traffic & Performance Specialist)
10. **`oscar-cerpa.webp`** — Oscar Iván Cerpa Peñates (Front-End Dev / Fullstack)
11. **`sara-rivera.webp`** — Sara Rivera Echeverry (Community Manager)
12. **`simon-velez.webp`** — Simón Vélez Henao (Trafficker y DigiOps)
13. **`melisa-gil.webp`** — Melisa Gil Gómez (Creative Designer)
14. **`camilo-velez.webp`** — Camilo Vélez Henao (Growth Lead / Tech)
15. **`juan-camilo-torres.webp`** — Juan Camilo Torres Ocampo (Creative Strategist)
16. **`diego-alejandro-flores.webp`** — Diego Alejandro Flores Vargas (Media & Design)
17. **`sara-maria-lagos.webp`** — Sara María Lagos Obando / Sarimar (Creative Specialist)
18. **`laura-viviana-salazar.webp`** — Laura Viviana Salazar Pérez (Administrativa & RRHH)

### 5.2 Colaborador sin Fotografía (Fallback Canónico)
* **Álvaro Antonio Gómez Machuca** (`u-19`, Representante Legal / Dirección General):  
  No cuenta con fotografía en el lote inicial. Su valor en base de datos debe ser `avatar_url = null`.  
  El frontend de Orbit renderiza automáticamente su fallback canónico: iniciales **`AG`** sobre color institucional **`bg-[#1e293b]`**.

### 5.3 Regla de Desacople de Almacenamiento y Fuente Temporal para Prototipo
* **Arquitectura Definitiva:** El frontend de Orbit consume exclusivamente la URL absoluta expuesta en el campo `avatar_url` de la API de colaboradores (`backend -> avatar_url -> UserAvatar`).
* **Fuente Temporal de Frontend:** Mientras Indunova implementa la persistencia y almacenamiento definitivo en bucket/CDN, las 18 imágenes validadas se encuentran copiadas en `public/assets/team/` y referenciadas temporalmente en `mockData.ts` (e.g. `/assets/team/paola-monsalve.webp`) para efectos de prototipado y QA visual de las interfaces.
* **Sustitución en Producción:** Una vez el backend de Indunova exponga las URLs reales desde su CDN/Cloud Storage, las rutas locales serán sustituidas de forma transparente por la respuesta del API sin requerir ningún cambio en `UserAvatar` ni en los componentes consumidores.
