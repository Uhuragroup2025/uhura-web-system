# Orbit · Uhura Web System

Repositorio del prototipo funcional de **Orbit**, el sistema operativo interno de Uhura Group para conectar operación, capacidad, proyectos, tareas, horas y la ingeniería de propuestas comerciales.

## Estado actual

Corte: **04 de noviembre de 2026** (v3.4.0 — Rama `feat/hubspot-commercial-sync-flow`).

El producto cuenta con una base funcional completa y alineada para:

- Clientes y entidades fiscales separadas.
- Proyectos independientes 1:1:1 por servicio ganado (Regla canónica Ticket #132).
- Asignación de líderes operativos independientes por cada servicio.
- Estados dinámicos de proyectos («Por empezar» vs «En ejecución» según fecha de arranque).
- Cronograma recalculado de tareas en paralelo.
- Estructura comercial granular en Cotización (1 calculadora con decimales y multidivisa por servicio).
- Operación 100% desacoplada en Modo Manual (sin requerir token de HubSpot).
- Equipo y asignaciones multirol con universo canónico de 18 colaboradores.
- Tareas atómicas, revisión, bloqueos y retrabajos.
- Time Tracking y capacidad.
- Home contextual / Mi Día.
- Bucky y La Colonia.

## Documentación principal

### Producto y arquitectura

- [`ORBIT_ARCHITECTURE_SPEC.md`](./ORBIT_ARCHITECTURE_SPEC.md) — **Especificación canónica de arquitectura, flujo 1:1:1, modo manual y conversión a proyectos**.
- [`src/docs/BACKEND_REQUIREMENTS.md`](./src/docs/BACKEND_REQUIREMENTS.md) — **Contrato de requerimientos para backend (Django/Postgres), endpoints, modelos `DECIMAL`, ticket #132 y auditoría**.
- [`src/docs/ORBIT_PRODUCT_STATUS.md`](./src/docs/ORBIT_PRODUCT_STATUS.md) — **Fuente de verdad del estado de producto, decisiones vigentes, deuda resuelta y roadmap**.
- [`src/components/taskflow/types.ts`](./src/components/taskflow/types.ts) — Contratos TypeScript y tipos del prototipo.

### Design System

- [`ai-context.md`](./ai-context.md) — contexto base de marca y reglas para IA.
- [`design-system/`](./design-system/) — tokens, estilos y documentación del sistema visual.
- [`INDEX.md`](./INDEX.md) — índice histórico del Design System.

## Flujo objetivo de Orbit

```text
New Business
  → Plantilla de Producto
  → Backlog + horas por rol
  → Cotización(es)
  → Aprobación parcial o total
  → Cliente
  → Proyecto
  → Entregables
  → Tareas
  → Asignación por capacidad
  → Time Logs
  → Rollups operativos
```

## Frontera entre sistemas

- **HubSpot**: CRM, pipeline y seguimiento comercial.
- **Orbit**: ingeniería de propuesta, backlog, cotización y operación.
- **Alegra**: realidad fiscal, facturación y cartera.

## Desarrollo local

```bash
npm install
npm run dev
```

Build de producción:

```bash
npm run build
```

Typecheck:

```bash
npm run typecheck
```

> Nota: actualmente `npm run build` ejecuta `vite build` y el typecheck corre por separado. Esta decisión debe revisarse antes del freeze técnico de producción.

## Stack frontend

- React 18
- TypeScript
- Vite 6
- Tailwind CSS 4
- Motion
- Lucide React

## Regla de documentación

Cuando exista contradicción entre una pantalla demo y una decisión documentada en `ORBIT_PRODUCT_STATUS.md`, prevalece la decisión de producto documentada hasta que el prototipo sea alineado.
