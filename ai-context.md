# UHURA GROUP — AI CONTEXT FILE
## Design System · Liquid Glass 2026 · v3.0.0

> **Instrucciones para la IA:** Este archivo es el contexto base del Design System de Uhura Group.
> Toda pieza que crees (web, presentación, landing, email, documento) debe seguir estas reglas sin excepción.
> Si algo no está especificado aquí, elige la opción más consistente con el sistema purple-first.

---

## 🏢 QUIÉNES SOMOS

**Uhura Group** es una empresa de tecnología y consultoría digital.
- Tono de comunicación: profesional, directo, moderno, sin jerga innecesaria
- Personalidad de marca: innovadora, confiable, premium pero accesible
- Audiencia: empresas B2B, tomadores de decisión, equipos de tecnología y marketing

---

## 🎨 SISTEMA DE COLOR — REGLA 70 / 30 / 15

### Paleta Principal (usar 70% del diseño)

| Nombre | Hex | Uso |
|--------|-----|-----|
| Purple Main | `#8945f0` | CTAs principales, links, elementos interactivos |
| Purple Dark | `#501f92` | Fondos de secciones, headers, footers |
| Purple Darkest | `#30108b` | Fondos oscuros premium, footer |
| Purple Light | `#c1a1ff` | Fondos suaves, hover states, bordes |
| White | `#ffffff` | Fondos claros, texto sobre purple |

### Negro / Neutros (usar máximo 30%)

| Nombre | Hex | Uso |
|--------|-----|-----|
| Near Black | `#1a1a1a` | Tipografía principal sobre fondos claros |
| Dark | `#212121` | Headings sobre fondos blancos |
| Body Text | `#616161` | Texto secundario, descripciones |
| Subtle | `#bdbdbd` | Bordes, separadores, disabled |
| Background | `#fafafa` | Fondo de página (secciones claras) |

### Colores Secundarios — MÁXIMO 15% cada uno, nunca los 3 juntos

| Nombre | Hex | Cuándo usar |
|--------|-----|-------------|
| Neon Yellow | `#e1ff64` | Badges de highlight, CTAs secundarios, pills de "Nuevo" |
| Cyan | `#25c8d9` | Accents, badges de estado, micro-animaciones |
| Pink | `#cd79e8` | Accents femeninos, badges especiales |

### ❌ LO QUE NUNCA DEBES HACER CON LOS COLORES

- Usar Yellow, Cyan o Pink como fondo de secciones grandes
- Usar los 3 colores secundarios simultáneamente en la misma sección
- Usar más del 15% de cualquier color secundario por viewport
- Usar colores hardcoded — siempre referenciar los tokens
- Mezclar más de 2 familias de color en un mismo componente

### ✅ Ejemplo de distribución correcta en un hero

```
Hero section (100% viewport):
- Gradient purple background: 60% ← correcto
- Texto blanco / cards blancas: 30% ← correcto
- Badge neon yellow "Nuevo": 10% ← correcto
Total: 100% ✅
```

---

## 🌈 GRADIENTES — Los 6 oficiales

Solo usar estos gradientes. No inventar combinaciones nuevas.

```css
/* 1. Primary — El más usado. Para fondos de sección, CTAs premium */
linear-gradient(135deg, #8945f0 0%, #501f92 100%)

/* 2. Hero — Para heros principales con profundidad */
linear-gradient(135deg, #501f92 0%, #8945f0 50%, #25c8d9 100%)

/* 3. Holographic — Para elementos premium, holograms, features especiales */
linear-gradient(135deg, #8945f0 0%, #25c8d9 50%, #e1ff64 100%)

/* 4. Mesh — Para fondos con efecto malla (radial multicolor) */
radial-gradient(at 0% 0%, #8945f0, transparent 50%),
radial-gradient(at 100% 100%, #25c8d9, transparent 50%),
radial-gradient(at 100% 0%, #cd79e8, transparent 50%)

/* 5. Accent — Para CTAs secundarios, badges */
linear-gradient(135deg, #e1ff64 0%, #d4f050 100%)

/* 6. Surface — Para fondos sutiles en secciones claras */
linear-gradient(180deg, #fafafa 0%, #ffffff 100%)
```

---

## ✍️ TIPOGRAFÍA

### Familias

| Fuente | Uso | Variante |
|--------|-----|----------|
| **Montserrat** | TODO: headings, UI, body, botones, navegación | Normal únicamente |
| **Georgia** | Solo palabras de énfasis aisladas en texto | Solo italic |

**Regla:** Montserrat para el 95% del contenido. Georgia Italic SOLO para 1-2 palabras de énfasis dentro de un párrafo, nunca para frases completas ni headings.

### Jerarquía tipográfica

| Elemento | Tamaño | Peso | Line Height | Uso |
|----------|--------|------|-------------|-----|
| H1 | 56px | 800 (ExtraBold) | 72px | Hero headlines, título principal |
| H2 | 40px | 800 (ExtraBold) | 56px | Títulos de sección |
| H3 | 28px | 700 (Bold) | 40px | Subsecciones, card titles |
| H4 | 26px | 700 (Bold) | 32px | Títulos menores |
| H5 | 22px | 600 (SemiBold) | 32px | Labels, subtítulos |
| H6 | 20px | 600 (SemiBold) | 28px | Microtítulos |
| Body Large | 16px | 500 (Medium) | 27px | Texto principal de párrafos |
| Body Medium | 14px | 400 (Regular) | 20px | Texto secundario, descripciones |
| Body Small | 12px | 400 (Regular) | 16px | Captions, notas al pie |
| Button | 14px | 600 (SemiBold) | 21px | Texto de botones |

### ❌ NO hacer con tipografía

- Usar Montserrat italic (solo Georgia para itálicas)
- Usar más de 2 tamaños de font en la misma sección visual
- Combinar Georgia con peso bold
- Line height menor a 1.5x en textos de body

---

## 📐 ESPACIADO — Sistema 4pt

Todos los espaciados son múltiplos de 4px.

| Token | Valor | Uso típico |
|-------|-------|------------|
| space-1 | 4px | Gaps mínimos entre iconos y texto |
| space-2 | 8px | Padding interno de badges |
| space-3 | 12px | Gaps entre elementos inline |
| space-4 | 16px | Padding de botones, gaps entre campos |
| space-6 | 24px | Padding de cards, gaps entre componentes |
| space-8 | 32px | Separación entre bloques dentro de sección |
| space-12 | 48px | Padding vertical de secciones |
| space-16 | 64px | Separación entre secciones medianas |
| space-20 | 80px | Padding vertical de secciones importantes |
| space-24 | 96px | Padding vertical de secciones hero/premium |

**Regla:** Nunca usar valores que no sean múltiplo de 4px (ej: 10px, 15px, 22px están prohibidos).

---

## 💎 LIQUID GLASS SYSTEM — Glassmorphism

### Los 4 niveles de glass

| Nivel | Opacity | Blur | Border | Cuándo usar |
|-------|---------|------|--------|-------------|
| Light | 70% white | 16px | rgba(255,255,255, 0.4) | Cards sobre gradientes claros |
| Medium | 50% white | 24px | rgba(255,255,255, 0.3) | Modales, overlays |
| Dark | 15% purple | 32px | rgba(137,69,240, 0.2) | Cards sobre fondos oscuros |
| Purple | 25% purple | 24px | rgba(193,161,255, 0.4) | Cards premium con glow |

### ✅ CUÁNDO usar glass

- Hero sections con gradientes de fondo
- Cards sobre fondos complejos (gradientes, imágenes)
- Modales y overlays
- Máximo 2-3 elementos glass por viewport

### ❌ CUÁNDO NO usar glass

- Fondos blancos planos (el efecto no se ve)
- Texto de body extenso (ilegible)
- Formularios críticos de conversión
- Más de 3 capas anidadas de glass
- Elementos pequeños como badges o iconos aislados
- Toda una página completa (pierde propósito)

---

## ⚡ MOTION SYSTEM — Animaciones

### Duraciones

| Token | Valor | Uso |
|-------|-------|-----|
| instant | 100ms | Tooltips, feedback inmediato |
| fast | 150ms | **Hover (90% de los casos)** |
| normal | 250ms | Cards, transiciones de página |
| slow | 400ms | Inputs, modales, formularios |
| slower | 600ms | Animaciones complejas, scroll reveals |

### Easing

| Nombre | Valor | Uso |
|--------|-------|-----|
| ease-out | `cubic-bezier(0, 0, 0.2, 1)` | Hover — el default para todo |
| ease-in-out | `cubic-bezier(0.4, 0, 0.2, 1)` | Bidireccional (open/close) |
| spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bounce premium (uso limitado) |

### Escalas de transformación

```css
hover-button:  scale(1.05) + translateY(-2px)
hover-card:    scale(1.02) + translateY(-4px)
active/press:  scale(0.98)
disabled:      opacity(0.4), no transform
```

### 🎯 Regla de oro del motion

**Para el 90% de interacciones:** `150ms + ease-out + scale(1.05)`

**Solo animar:** `transform` y `opacity` — son las únicas propiedades que no causan reflow (60fps garantizado).

### 5 estados obligatorios en todo componente interactivo

1. **Default** — Estado base en reposo
2. **Hover** — Mouse sobre el elemento
3. **Active** — Click/press (reduce scale)
4. **Focus** — Navegación por teclado (ring 3px purple)
5. **Disabled** — No interactivo (opacity 0.4, no pointer events)

---

## 🧩 COMPONENTES — Reglas de uso

### Button

**5 variantes:**
- `primary` — CTA principal. **Máximo 1 por sección.**
- `secondary` — Amarillo neón. Alternativas o CTAs secundarios.
- `ghost` — Acciones terciarias, dentro de cards.
- `outline` — Sobre fondos oscuros con borde purple.
- `glass` — **SOLO sobre gradientes/imágenes**, nunca sobre blanco.

**Tamaños:** `sm` (height 32px) · `md` (40px) · `lg` (48px) · `xl` (56px)

**Reglas:**
- Icono siempre a la derecha del texto por default
- Máximo 1 botón `primary` por sección visual
- No usar `glass` variant sobre fondos blancos

---

### Badge

**7 variantes:** `neon` · `purple` · `cyan` · `pink` · `outline` · `glass` · `subtle`

**Tamaños: SOLO `xs` y `sm`** — Los badges nunca son grandes.

**Reglas:**
- Máximo 2-3 palabras de texto
- `neon` (yellow) solo para highlights críticos: "Nuevo", "Beta", "Hot"
- No usar badges como botones (si tiene acción, usar Button)
- Máximo 1-2 badges `neon` por viewport

---

### Card

**6 variantes:**
- `default` — Sobre fondos blancos, sombra soft
- `elevated` — Mayor sombra, mayor importancia visual
- `purple` — Background purple sólido, texto blanco
- `gradient` — Background gradient primary, para CTAs premium
- `glass` — **SOLO sobre fondos complejos, no sobre blanco**
- `glass-dark` — Sobre fondos oscuros/purple

**Reglas:**
- Agregar hover effect SOLO si la card es clickeable
- `glass` variants SIEMPRE sobre fondo que no sea blanco liso
- `gradient` para los 1-2 elementos más importantes de la sección

---

### GlassCard

Para contenido sobre fondos complejos. Tiene `glow` opcional.

**Props:** `variant` (light/medium/dark/purple) · `blur` (sm/md/lg/xl) · `hover` · `glow`

**Regla:** Máximo 3 GlassCards visibles simultáneamente en el viewport.

---

### Input / Formulario

**2 variantes:** `default` (sobre fondos claros) · `glass` (SOLO en heros con gradiente)

**Reglas:**
- Labels siempre visibles (nunca solo placeholder)
- Focus ring visible siempre (accesibilidad)
- Mensajes de error claros con texto explicativo
- Transición de 400ms (requieren atención del usuario)

---

## 🔤 GLOW EFFECTS

Para highlights, CTAs premium y estados hover de elementos importantes.

```css
/* Purple glow — El más usado */
glow-purple-sm: 0 0 10px rgba(137, 69, 240, 0.3)
glow-purple-md: 0 0 20px rgba(137, 69, 240, 0.4)
glow-purple-lg: 0 0 40px rgba(137, 69, 240, 0.5)

/* Neon yellow glow — Para CTAs accent */
glow-neon: 0 0 20px rgba(225, 255, 100, 0.4)

/* Cyan glow — Para highlights secundarios */
glow-cyan: 0 0 20px rgba(37, 200, 217, 0.4)
```

---

## 📱 RESPONSIVE / GRID

| Breakpoint | Columnas | Gutter | Margen | Max-width |
|------------|----------|--------|--------|-----------|
| Desktop | 12 col | 24px | 48px | 1200px |
| Tablet | 8 col | 16px | 32px | — |
| Mobile | 4 col | 16px | 16px | — |

**Reglas responsive:**
- Reducir o eliminar blur en mobile (performance)
- Sin hover effects en dispositivos touch
- Tamaños tipográficos reducen ~20% en mobile
- Padding de secciones: 96px desktop → 64px tablet → 48px mobile

---

## 🖼️ SOMBRAS

| Token | Valor CSS | Uso |
|-------|-----------|-----|
| soft | `0 2px 4px 0 rgba(0,0,0,0.04)` | Cards sutiles, inputs en reposo |
| medium | `0 4px 12px -2px rgba(0,0,0,0.08)` | Cards estándar |
| strong | `0 12px 24px -4px rgba(0,0,0,0.12)` | Modales, overlays |
| floating | `0 24px 48px -8px rgba(0,0,0,0.16)` | Glass cards, elementos flotantes |

---

## 📋 CHECKLIST DE CONSISTENCIA VISUAL

Antes de entregar cualquier pieza, verificar:

- [ ] Purple domina visualmente (~70% del diseño)
- [ ] No hay más de 2 colores secundarios simultáneos en la misma sección
- [ ] Ningun color secundario supera el 15% del viewport
- [ ] Solo se usan los 6 gradientes oficiales
- [ ] La tipografía es Montserrat (Georgia solo para énfasis aislados)
- [ ] Los espaciados son múltiplos de 4px
- [ ] No hay más de 3 elementos glass por viewport
- [ ] Los glass elements están SIEMPRE sobre fondos no blancos
- [ ] Hay máximo 1 botón primary por sección
- [ ] Los badges son xs o sm (nunca large)
- [ ] Las animaciones usan solo transform y opacity

---

## 🚫 REGLAS ABSOLUTAS — NUNCA ROMPER

1. **Nunca** usar colores fuera de la paleta oficial
2. **Nunca** usar glass sobre fondo blanco liso
3. **Nunca** usar más del 15% de Yellow/Cyan/Pink
4. **Nunca** los 3 colores secundarios en la misma sección
5. **Nunca** Montserrat italic (solo Georgia para itálicas)
6. **Nunca** espaciados que no sean múltiplo de 4px
7. **Nunca** más de 1 botón primary por sección
8. **Nunca** badges en tamaño large o xl
9. **Nunca** animar propiedades que no sean transform u opacity
10. **Nunca** más de 3 glass elements por viewport

---

## 💡 EJEMPLOS DE PROMPTS VÁLIDOS

**Para crear una landing:**
> "Crea una landing page para [producto] siguiendo el design system de Uhura Group.
> Usa el gradiente hero en el header, botón primary purple, badge neon para el highlight
> principal, y cards glass sobre el fondo de gradiente. El texto debe ser en Montserrat.
> Máximo 2 colores secundarios visibles."

**Para crear una presentación:**
> "Crea una presentación de [tema] para Uhura Group. Usa fondo gradient primary en las
> slides principales, texto blanco Montserrat Bold para títulos, accent yellow solo para
> datos clave o números importantes. Máximo 15% de elementos en colores secundarios."

**Para crear un email:**
> "Diseña un email marketing para Uhura Group sobre [tema]. Header con gradient primary,
> CTA button en purple #8945f0, tipografía Montserrat. Sin glass effects (no aplica en email)."

---

**Versión:** 3.0.0
**Fecha:** Mayo 2026
**Marca:** Uhura Group
**Sistema:** Liquid Glass Design System
**Mantenedor:** Uhura Group Design Team

> Este archivo es la fuente de verdad para cualquier IA que genere contenido de Uhura Group.
> En caso de duda: purple, Montserrat, espaciado en múltiplos de 4, sin glass sobre blanco.
