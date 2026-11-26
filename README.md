# ECO · Uhura Web System

> **Nombre del producto:** **ECO** — *Espacio de Creación y Operaciones* (antes «Orbit», renombrado en noviembre de 2026). Los identificadores técnicos (`OrbitAccessLevel`, `CanonicalOrbitAccessLevel`, nombres de archivo como `ORBIT_PRODUCT_STATUS.md`) se conservan para no romper contratos de código ni enlaces.

Repositorio del prototipo funcional de **ECO**, el sistema operativo interno de Uhura Group para conectar operación, capacidad, proyectos, tareas, horas y la ingeniería de propuestas comerciales.

## Estado actual

ECO está en producción (lo construye y opera Indunova en su propio repositorio). **Este repositorio guarda el prototipo funcional y las reglas del producto** que Indunova implementa: lo que está en `main` es lo aprobado.

- Lo que ya está en producción y lo que falta implementar: [`src/docs/ORBIT_PRODUCT_STATUS.md`](./src/docs/ORBIT_PRODUCT_STATUS.md) §8.0.
- Reglas para backend de cada entrega: [`src/docs/BACKEND_REQUIREMENTS.md`](./src/docs/BACKEND_REQUIREMENTS.md) (una sección por ronda; la más reciente al final).

## Cómo trabajamos (producto vivo)

ECO no tiene una «entrega final»: se mejora con entregas periódicas.

| Pieza | Regla |
|---|---|
| `main` | La única verdad: lo aprobado. No se trabaja directo sobre `main`. |
| Una rama por ronda | Sale de `main` con su fecha o tema (ej. `claude/mejoras-2026-11-24`), llega con un pull request y se borra al unirse. |
| Pull request | Resume qué trae la ronda y apunta a su sección de `BACKEND_REQUIREMENTS.md`. Indunova lo revisa e implementa. |
| Versión | Cada ronda unida a `main` se marca con una versión (numeración por acordar con Indunova para que coincida con producción). |
| Registro de cambios | `ORBIT_PRODUCT_STATUS.md` §8.0 y la sección de la ronda en `BACKEND_REQUIREMENTS.md`, en palabras simples. |
| Pedidos a Indunova | Por tickets: **errores** (algo que debía funcionar y no funciona) y **mejoras** (algo nuevo), con entregas semanales. |
| Propuestas en evaluación | Van en su propia rama y no tocan `main` hasta que se aprueben (ej. La Colonia en `claude/new-session-22mvgh`). |

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
- [`design-system/brand/`](./design-system/brand/) — logos y favicons de ECO (kit de marca; la app usa `public/brand/eco-icon-128.png`).

## Flujo objetivo de ECO

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
- **ECO**: ingeniería de propuesta, backlog, cotización y operación.
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
