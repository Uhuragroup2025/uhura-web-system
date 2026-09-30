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

| Nombre Completo | Nombres | Apellidos | Correo Corporativo | Cargo Operativo (`jobTitle`) | Rol Canónico (`StandardUhuraRole`) | Nivel RBAC (`accessLevel`) | Rol Sistema (`role`) | Fecha Ingreso (`fecha_ingreso`) | Líder Directo (`reportsTo`) |
|---|---|---|---|---|---|---|---|---|---|
| **Ana María Giraldo Restrepo** | Ana María | Giraldo Restrepo | `ana.giraldo@uhuragroup.com` | Dirección General / CEO | Perfil Interno Dirección | `DIRECTOR` | `admin` | `2020-06-01` | Dirección General (N/A) |
| **Nayeliz Paola Brunal Correa** | Nayeliz Paola | Brunal Correa | `nayeliz.brunal@uhuragroup.com` | Digital Content Specialist | `Digital Content Specialist` | `OPERATIVO` | `member` | `2022-02-14` | Camilo Vélez Henao |
| **Luisa Fernanda Urazan Prieto** | Luisa Fernanda | Urazan Prieto | `luisa.urazan@uhuragroup.com` | Operaciones & Cuentas | `Project / Operations Manager` | `LIDER` | `admin` | `2022-04-04` | Ana María Giraldo |
| **Laura Viviana Salazar Perez** | Laura Viviana | Salazar Perez | `laura.salazar@uhuragroup.com` | Administrativa & RRHH | Perfil Interno Soporte | `ADMINISTRATIVO` | `admin` | `2022-03-19` | Ana María Giraldo |
| **Paola Andrea Monsalve Giron** | Paola Andrea | Monsalve Giron | `paola.monsalve@uhuragroup.com` | Product Lead / Dirección Producto | `Digital Product Strategist` | `DIRECTOR` | `admin` | `2022-07-05` | Ana María Giraldo |
| **Juan Sebastian Caicedo Correa** | Juan Sebastian | Caicedo Correa | `sebastian.caicedo@uhuragroup.com` | Traffic & Performance Specialist | `Traffic Specialist` | `OPERATIVO` | `member` | `2023-04-12` | Camilo Vélez Henao |
| **Jenny Esmeralda Duque Ramírez** | Jenny Esmeralda | Duque Ramírez | `jenny.duque@uhuragroup.com` | Digital Designer | `Digital Designer` | `OPERATIVO` | `member` | `2023-06-05` | Diego Cadavid Díaz |
| **Laura Isabel Gomez Agudelo** | Laura Isabel | Gomez Agudelo | `laura.gomez@uhuragroup.com` | Digital Designer | `Digital Designer` | `OPERATIVO` | `member` | `2023-06-05` | Paola Andrea Monsalve Giron |
| **Diego Cadavid Díaz** | Diego | Cadavid Díaz | `diego.cadavid@uhuragroup.com` | Creative & Copy Lead | `Creative Strategist` | `LIDER` | `member` | `2023-11-16` | Ana María Giraldo |
| **Álvaro Antonio Gómez Machuca** | Álvaro Antonio | Gómez Machuca | `alvaro.gomez@uhuragroup.com` | Representante Legal / Dirección | Perfil Interno Dirección | `DIRECTOR` | `admin` | `2024-01-26` | Dirección General (N/A) |
| **Juan Camilo Torres Ocampo** | Juan Camilo | Torres Ocampo | `camilo.torres@uhuragroup.com` | Creative Strategist | `Creative Strategist` | `OPERATIVO` | `member` | `2024-02-01` | Diego Cadavid Díaz |
| **Catalina Tejada Castaño** | Catalina | Tejada Castaño | `catalina.tejada@uhuragroup.com` | Dirección Comercial | Perfil Interno Comercial | `LIDER` | `admin` | `2024-04-18` | Ana María Giraldo |
| **Camilo Vélez Henao** | Camilo | Vélez Henao | `camilo.velez@uhuragroup.com` | Growth Lead / Tech | `Tech / Solutions Lead` | `LIDER` | `admin` | `2024-07-01` | Ana María Giraldo |
| **Oscar Iván Cerpa Peñates** | Oscar Iván | Cerpa Peñates | `oscar.cerpa@uhuragroup.com` | Front-End Dev / Fullstack | `Front-End Dev` | `OPERATIVO` | `member` | `2024-09-01` | Paola Andrea Monsalve Giron |
| **Sara Rivera Echeverry** | Sara | Rivera Echeverry | `sara.rivera@uhuragroup.com` | Operations & Process | `Project / Operations Manager` | `OPERATIVO` | `member` | `2025-01-20` | Diego Cadavid Díaz |
| **Simón Vélez Henao** | Simón | Vélez Henao | `simon.velez@uhuragroup.com` | Traffic Specialist | `Traffic Specialist` | `OPERATIVO` | `member` | `2025-05-15` | Camilo Vélez Henao |
| **Melisa Gil Gómez** | Melisa | Gil Gómez | `melisa.gil@uhuragroup.com` | Community & Content | `Community Manager` | `OPERATIVO` | `member` | `2025-08-04` | Diego Cadavid Díaz |
| **Sara María Lagos Obando** *(Sarimar)* | Sara María | Lagos Obando | `sara.lagos@uhuragroup.com` | Creative Specialist | `Digital Content Specialist` | `OPERATIVO` | `member` | `2026-02-12` | Diego Cadavid Díaz |
| **Diego Alejandro Flores Vargas** | Diego Alejandro | Flores Vargas | `diego.flores@uhuragroup.com` | Media & Design | `Motion / Multimedia Designer` | `OPERATIVO` | `member` | `2026-01-26` | Diego Cadavid Díaz |

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
