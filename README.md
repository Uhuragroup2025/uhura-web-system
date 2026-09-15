# Orbit · Uhura Web System

Repositorio del prototipo funcional de **Orbit**, el sistema operativo interno de Uhura Group para conectar operación, capacidad, proyectos, tareas, horas y la ingeniería de propuestas comerciales.

## Estado actual

Corte: **15 de septiembre de 2026**.

El producto ya cuenta con una base funcional para:

- Clientes y entidades fiscales separadas.
- Proyectos, entregables y bolsas de horas por rol.
- Equipo y asignaciones multirol.
- Tareas atómicas, revisión, bloqueos y retrabajos.
- Time Tracking y capacidad.
- Home contextual / Mi Día.
- Bucky y La Colonia.
- New Business con múltiples cotizaciones.
- Biblioteca de Plantillas de Producto.
- Contrato funcional para Cotizador, todavía sin migrar la lógica financiera de Google Sheets.

## Documentación principal

### Producto y operación

- [`src/docs/ORBIT_PRODUCT_STATUS.md`](./src/docs/ORBIT_PRODUCT_STATUS.md) — **fuente de verdad actual del estado del producto, decisiones vigentes, deuda conocida y próximos pasos**.
- [`src/docs/NEW_BUSINESS_COTIZACION_ARCHITECTURE.md`](./src/docs/NEW_BUSINESS_COTIZACION_ARCHITECTURE.md) — arquitectura funcional de New Business → Cotización → Proyecto.
- [`src/components/taskflow/types.ts`](./src/components/taskflow/types.ts) — contratos y tipos del prototipo.

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
