# Auditoría flujo E2E — Oportunidad → Proyecto → Ejecución → Cierre

Fecha: 2026-11-07 · Rama: `entrega-final-indunova` (base `ef8b4e1`)
Método: recorrido real en el prototipo (Comercial → PM → Colaborador) con una oportunidad de prueba
("Sitio Web Informativo WordPress", 140 h, 6 semanas, $42M) + lectura del código.

---

## 1. Problema central: el cronograma no nace de la lógica del proyecto

| Dato | Dónde se define hoy | Problema |
|---|---|---|
| Semanas del servicio | Alcance (manual, la plantilla no lo trae) | Se ignora después |
| Fecha de entrega | Conversión: **hoy + 2 meses fijo** | No usa semanas, horas, gates ni tandas |
| Tandas de ajuste | Conversión **y otra vez** en Kickoff | Cambiar 2→4 no mueve ninguna fecha |
| Días de aprobación por gate / espera kickoff | `scheduleConfig` (5 / 3 días) | Solo se muestran como texto |
| Duración en Kickoff | Se vuelve a pedir (salió 9 sem, el alcance dice 6) | Doble fuente de verdad |
| Deadlines de tareas | Kickoff reparte **linealmente por orden de tarea en días calendario** | Ignora horas, días hábiles, gates, tandas y capacidad |
| Tareas de ajuste | La plantilla trae tareas fijas ("Ajustes internos cliente (1 ronda)") y gates como tareas de 1 h | No se conectan con las tandas configuradas |

**Consecuencia:** la línea base nunca incluye los tiempos del cliente (revisión + tandas), así que cualquier
proyecto aparece desviado aunque vaya según lo vendido.

## 2. Hallazgos por rol

### Comercial (New Business)
- C1. "Fecha máx. de entrega" en Nueva Oportunidad es el plazo del **scoping**, pero se lee como entrega del proyecto.
- C2. Los requisitos para "Marcar como listo" (link de Drive + Guardar) solo aparecen en un tooltip del botón deshabilitado.
- C3. Al importar plantilla, semanas = vacío → Resumen muestra "0 Sem." hasta llenarlo a mano.
- C4. Cotización muestra "HubSpot: closedwon" y a la vez "Sin negocio en HubSpot".
- C5. Conversión: fecha de entrega "Sugerida" = hoy + 2 meses, independiente del alcance.

### PM (Proyecto)
- P1. Tandas y duración se piden dos veces (Conversión y Kickoff).
- P2. Encabezado dice "Tandas: 4 por gate"; el bloque de Gobernanza en Resumen dice "2 rondas por gate · 1 tanda grande + 1 menor" (texto fijo).
- P3. Estado "Pendiente de iniciar" mientras Cronograma dice "Activo" y los entregables "En Ejecución".
- P4. Equipo Asignado: todos con 8 h/sem por defecto. No sale de horas por rol ÷ semanas (Front-End: 90 h / 6 sem = 15 h/sem) → Capacidad subestimada.
- P5. Roles inconsistentes: Esmeralda entra como *Content Creator* (rol sin horas cotizadas) y en la Matriz aparece bajo *Digital Content Specialist*; Paola (Product Lead, 18 h de ejecución) aparece como "Gobernanza".
- P6. No existe cierre de proyecto: solo "Archivar". `ProjectSettingsTab.tsx` no se usa en ningún lado (código muerto).
- P7. Pestañas actuales: Resumen · Tareas · Matriz Horas por Rol. "Equipo Asignado" ya vive en Resumen (bien), pero Resumen mezcla entregables, gobernanza, forecast y equipo sin jerarquía.

### Colaborador (Mi Día / Tareas)
- K1. Mi Día queda vacío tras el kickoff: las tareas no reciben `scheduledDate`, solo `dueDate`, y Mi Día solo muestra lo que vence hoy. El colaborador no ve qué empezar.
- K2. "Radar del equipo" muestra una vacación de octubre como "sale en 2 días" (datos mock vencidos).

## 3. Flujo objetivo (una sola fuente de verdad por dato)

| Etapa | Dueño | Define | Nunca vuelve a pedir |
|---|---|---|---|
| Alcance | Líder técnico | Entregables, horas por rol, semanas de producción | — |
| Cotización / Ganada | Comercial | Valor, modalidad, servicios ganados | Horas, semanas |
| Conversión | Comercial + Líder | Tandas incluidas y días hábiles por tanda (por servicio). **Sin fechas**: el proyecto nace «Por iniciar» | — |
| Iniciar proyecto | PM | Fecha de arranque → **línea base calculada** (semanas del alcance precargadas, tandas confirmables); congela línea base y programa tareas | Semanas (vienen del alcance) |
| Ejecución | PM / Colaborador | Avance, tandas consumidas, reforecast | — |
| Cierre | PM | Checklist (entregables aprobados, horas reales vs cotizadas, tandas usadas, fecha real) → Cerrado | — |

**Fórmula de línea base propuesta**

```
fin_base = inicio
         + espera_kickoff (días hábiles)
         + días_producción  (semanas del alcance, o horas ÷ capacidad semanal asignada)
         + gates × días_aprobación_gate
         + gates × tandas_incluidas × días_por_tanda
```
- Tanda dentro de lo incluido → consume holgura planificada, **no** es desvío.
- Tanda extra (> incluidas) → mueve forecast + marca iteración adicional (posible sobrecosto).
- Deadlines de tareas: repartidos por entregable/gate en días hábiles, con `scheduledDate` para que aparezcan en Mi Día.

## 4. Fases siguientes
1. **Lógica de cronograma** (sección 3): motor único, conversión calcula, kickoff solo confirma, tareas con fechas reales.
2. **Simplificar Proyecto**: Resumen con jerarquía clara (salud → fechas base/forecast → tandas x/y → equipo → servicios); quitar textos fijos; vista ligera para colaborador.
3. **Cierre de proyecto** + limpieza (código muerto, datos mock) + actualizar `BACKEND_REQUIREMENTS.md` para Indunova.
