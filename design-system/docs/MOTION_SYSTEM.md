# UHURA GROUP 2026 - MOTION SYSTEM
## Sistema Completo de Animaciones e Interacciones

---

## 🎯 FILOSOFÍA DEL MOTION SYSTEM

### Principios Core

1. **Coherencia**: Todas las animaciones siguen las mismas reglas
2. **Propósito**: Cada animación tiene un objetivo funcional
3. **Performance**: Optimizado para 60fps (transform + opacity)
4. **Accesibilidad**: Respeta `prefers-reduced-motion`
5. **Feedback**: El usuario siempre sabe qué está pasando

### Jerarquía de Velocidad

```
Instant (100ms)  → Tooltips, microinteracciones críticas
Fast (150ms)     → Hover effects, cambios de color
Base (250ms)     → Transiciones de cards, modales
Slow (400ms)     → Transiciones de página, inputs
Slower (600ms)   → Animaciones complejas, carruseles
```

**Regla:** A mayor elemento o complejidad, más lenta la transición.

---

## ⚙️ DESIGN TOKENS - DURATIONS

### Duraciones (CSS Variables)

```css
--duration-instant: 100ms;  /* Tooltips, feedback inmediato */
--duration-fast:    150ms;  /* Hover effects, iconos */
--duration-base:    250ms;  /* Cards, botones, transiciones generales */
--duration-slow:    400ms;  /* Inputs, modales, page transitions */
--duration-slower:  600ms;  /* Carruseles, animaciones complejas */
```

### Cuándo usar cada duración

| Duración | Uso | Ejemplo |
|----------|-----|---------|
| **instant** (100ms) | Tooltips, feedback instantáneo | Tooltip al hover |
| **fast** (150ms) | Hover en elementos pequeños | Iconos, badges, links |
| **base** (250ms) | Transiciones estándar | Cards, botones, dropdowns |
| **slow** (400ms) | Elementos que requieren atención | Inputs, modales, notificaciones |
| **slower** (600ms) | Animaciones elaboradas | Carruseles, acordeones, page transitions |

---

## 🌀 EASING FUNCTIONS

### Curvas de Aceleración

```css
/* Linear - Velocidad constante (rara vez usar) */
--ease-linear: linear;

/* Ease In - Acelera al final (elementos que desaparecen) */
--ease-in: cubic-bezier(0.4, 0, 1, 1);

/* Ease Out - Desacelera al final (HOVER, la más usada) */
--ease-out: cubic-bezier(0, 0, 0.2, 1);

/* Ease In-Out - Suave en ambos extremos (transiciones bidireccionales) */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Spring - Bounce effect (microinteracciones premium) */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Smooth - Natural y fluido (general purpose) */
--ease-smooth: cubic-bezier(0.65, 0, 0.35, 1);

/* Sharp - Preciso y directo (alertas, notificaciones) */
--ease-sharp: cubic-bezier(0.4, 0, 0.6, 1);
```

### Cuándo usar cada easing

| Easing | Cuándo | Por qué |
|--------|--------|---------|
| **ease-out** | Hover, apariciones | Acelera rápido al inicio (responde inmediatamente) y desacelera al final (suave) |
| **ease-in** | Desapariciones, exits | El elemento se va acelerando hasta desaparecer |
| **ease-in-out** | Transiciones reversibles | Simétrico: entra suave, sale suave |
| **ease-spring** | Microinteracciones, iconos | Bounce sutil que se siente premium |
| **ease-smooth** | Transiciones largas | Movimiento natural y orgánico |
| **ease-sharp** | Alertas, urgencias | Directo y rápido, llama la atención |

**Regla de oro:**
- 🟢 **Hover**: `ease-out` + `fast` (150ms)
- 🔵 **Cards**: `ease-in-out` + `base` (250ms)
- 🟣 **Microinteracciones**: `ease-spring` + `fast` (150ms)

---

## 📏 TRANSFORM SCALES

### Escalas de Transformación

```css
--scale-hover:        1.02;   /* Hover sutil en cards (2%) */
--scale-hover-button: 1.05;   /* Hover en botones (5%) */
--scale-active:       0.98;   /* Active/pressed state (click) */
--scale-press:        0.95;   /* Click effect explícito */
```

### Reglas de Uso

1. **Cards**: `scale(1.02)` - Sutil, elegante
2. **Buttons**: `scale(1.05)` - Más prominente, llama a la acción
3. **Active**: `scale(0.98)` - Feedback de "presionado"
4. **Icons**: `scale(1.1)` - Microinteracción pronunciada

**⚠️ Importante:**
- NO escalar más de 1.1x (parece exagerado)
- NO combinar scale con rotación (excepto casos específicos)
- Siempre combinar con `translate-y` para elevación

---

## ⬆️ ELEVATIONS (Translate-Y)

### Niveles de Elevación

```css
--lift-subtle:   -2px;  /* Hover sutil */
--lift-moderate: -4px;  /* Hover prominente */
--lift-strong:   -8px;  /* Elementos destacados (raro) */
```

### Combinación con Shadows

```css
/* Pattern: Hover */
hover:scale-[1.02]
hover:-translate-y-[var(--lift-subtle)]
hover:shadow-lg

/* Pattern: Botones */
hover:scale-[1.05]
hover:-translate-y-[var(--lift-subtle)]
hover:shadow-xl
```

**Regla:** A mayor `scale`, mayor `shadow`, pero `translate-y` se mantiene sutil.

---

## ✨ GLOW EFFECTS

### Efectos de Brillo

```css
--glow-purple: 0 0 20px rgba(137, 69, 240, 0.3);
--glow-neon:   0 0 20px rgba(225, 255, 100, 0.4);
--glow-cyan:   0 0 20px rgba(109, 213, 237, 0.3);
```

### Cuándo Usar Glow

✅ **Usar en:**
- CTAs principales en hover
- Cards premium con glassmorphism
- Elementos destacados sobre fondos oscuros

❌ **NO usar en:**
- Fondos claros (no se ve)
- Elementos pequeños (badges, icons)
- Múltiples elementos a la vez (confuso)

**Implementación:**
```css
hover:shadow-[var(--glow-purple)]
```

---

## 🎭 ESTADOS DE INTERACCIÓN

### 1. DEFAULT (Base State)

Estado inicial del componente en reposo.

**Características:**
- Sin hover
- Sin focus
- Sin active
- Colores base
- Shadows base

---

### 2. HOVER (Mouse Over)

Feedback visual al pasar el cursor.

**Timing:**
- Duration: `var(--duration-fast)` (150ms)
- Easing: `var(--ease-out)`

**Transformaciones:**
| Componente | Scale | Translate-Y | Shadow | Otros |
|------------|-------|-------------|--------|-------|
| Button | 1.05 | -2px | lg → xl | Brightness +5% |
| Card | 1.02 | -2px | md → lg | - |
| Card (elevated) | 1.02 | -4px | lg → 2xl | - |
| GlassCard | 1.02 | -2px | lg → xl | Glow (opcional) |
| Badge | 1.05 | 0 | - | Brightness +5% |
| Icon | 1.1 | 0 | - | - |

**Ejemplo (Button Primary):**
```tsx
hover:enabled:bg-uhura-purple-primary
hover:enabled:shadow-xl
hover:enabled:scale-[var(--scale-hover-button)]
hover:enabled:-translate-y-[var(--lift-subtle)]
```

---

### 3. ACTIVE (Click/Press)

Feedback durante el click.

**Timing:**
- Duration: `var(--duration-instant)` (100ms)
- Easing: `var(--ease-in-out)`

**Transformaciones:**
- Scale: `var(--scale-active)` (0.98)
- Translate-Y: `0` (vuelve a posición original)
- Shadow: Reduce 1 nivel

**Ejemplo:**
```tsx
active:enabled:scale-[var(--scale-active)]
active:enabled:translate-y-0
active:enabled:shadow-lg
```

**Regla:** Active siempre es MÁS PEQUEÑO que default para simular "presión".

---

### 4. FOCUS (Keyboard Navigation)

Indicador para navegación por teclado (accesibilidad).

**Timing:**
- Duration: `var(--duration-instant)` (100ms)
- Easing: `var(--ease-out)`

**Características:**
- Ring de 3px con color `var(--focus-ring-color)`
- Offset de 2px
- Opacidad 30%

**Implementación:**
```tsx
focus:outline-none
focus:ring-[var(--focus-ring-width)]
focus:ring-uhura-purple-medium/30
focus:ring-offset-2
```

**⚠️ Importante:**
- NUNCA eliminar el focus ring sin reemplazarlo
- Debe ser visible sobre cualquier fondo
- Debe cumplir WCAG 2.1 AA (contrast ratio 3:1)

---

### 5. DISABLED (No Interactivo)

Estado inactivo/deshabilitado.

**Características:**
- Opacity: `var(--opacity-disabled)` (0.4)
- Cursor: `not-allowed`
- Sin hover
- Sin active
- Sin transform

**Implementación:**
```tsx
disabled:opacity-[var(--opacity-disabled)]
disabled:cursor-not-allowed
disabled:transform-none
```

**Regla:** NO aplicar efectos visuales complejos. Solo opacity + cursor.

---

## 🧩 MICROINTERACCIONES POR COMPONENTE

### Button

| Estado | Duration | Easing | Transform | Shadow |
|--------|----------|--------|-----------|--------|
| Default | - | - | scale(1) | lg |
| Hover | 150ms | ease-out | scale(1.05) + translateY(-2px) | xl |
| Active | 100ms | ease-in-out | scale(0.98) + translateY(0) | lg |
| Focus | 100ms | ease-out | - | + ring |
| Disabled | - | - | - | lg (no change) |

**Código completo:**
```tsx
className="
  transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]
  hover:enabled:scale-[var(--scale-hover-button)]
  hover:enabled:-translate-y-[var(--lift-subtle)]
  hover:enabled:shadow-xl
  active:enabled:scale-[var(--scale-active)]
  active:enabled:translate-y-0
  focus:ring-[var(--focus-ring-width)] focus:ring-uhura-purple-medium/30
  disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed
"
```

---

### Card

| Estado | Duration | Easing | Transform | Shadow |
|--------|----------|--------|-----------|--------|
| Default | - | - | scale(1) | sm |
| Hover | 250ms | ease-in-out | scale(1.02) + translateY(-2px) | lg |
| Active | 100ms | ease-in-out | scale(0.98) + translateY(0) | md |
| Focus-within | 100ms | ease-out | - | + ring |

**Especial: Cards interactivas**
```tsx
hover:scale-[var(--scale-hover)]
hover:-translate-y-[var(--lift-subtle)]
hover:shadow-lg
active:scale-[var(--scale-active)]
active:translate-y-0
```

---

### GlassCard (con Glow)

| Estado | Duration | Easing | Efectos Especiales |
|--------|----------|--------|-------------------|
| Default | - | - | backdrop-blur-md |
| Hover | 250ms | ease-in-out | Glow effect, border opacity +20% |
| Active | 100ms | ease-in-out | Glow remove, scale 0.98 |

```tsx
hover:shadow-[var(--glow-purple)]
hover:border-white/70
hover:scale-[var(--scale-hover)]
```

---

### Badge (Interactive)

| Estado | Duration | Easing | Transform |
|--------|----------|--------|-----------|
| Default | - | - | scale(1) |
| Hover | 150ms | ease-out | scale(1.05) |
| Active | 100ms | ease-in-out | scale(0.95) |

**Especial:** Badge con icono tiene microinteracción:
```tsx
/* Badge container */
hover:scale-105

/* Icon inside badge */
group-hover:scale-110
```

---

### Input

| Estado | Duration | Easing | Efectos |
|--------|----------|--------|---------|
| Default | - | - | border normal |
| Hover | 400ms | ease-in-out | Border color change, subtle shadow |
| Focus | 400ms | ease-in-out | Ring + border transparent |
| Error | 200ms | ease-sharp | Border red + ring red |

**Por qué `slow` (400ms)?**
Inputs requieren tiempo para que el usuario perciba el cambio sin distracción.

```tsx
transition-all duration-[var(--duration-slow)] ease-[var(--ease-in-out)]
hover:enabled:border-uhura-purple-light
hover:enabled:shadow-sm
focus:ring-[var(--focus-ring-width)] focus:ring-uhura-purple-medium/30
```

---

### Icon (Standalone)

| Estado | Duration | Easing | Transform |
|--------|----------|--------|-----------|
| Default | - | - | scale(1) |
| Hover | 150ms | ease-spring | scale(1.1) + rotate(5deg) opcional |

**Spring effect:**
```tsx
transition-transform duration-[var(--duration-fast)] ease-[var(--ease-spring)]
hover:scale-110
```

**Cuándo rotar:**
✅ Iconos de acción (refresh, expand)
❌ Iconos decorativos

---

## 📱 RESPONSIVE CONSIDERATIONS

### Reducir animaciones en móviles

**Por qué:**
- Performance (menos potencia)
- Touch interactions (no hover)
- Batería

**Estrategia:**

```css
@media (hover: none) {
  /* Dispositivos táctiles: NO hover effects */
  .card:hover {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  /* Usuarios con sensibilidad al movimiento */
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Regla móvil:**
- ✅ Active states (tap feedback)
- ✅ Focus states
- ❌ Hover states
- ❌ Animaciones complejas

---

## 🎬 ANIMACIONES DE ENTRADA/SALIDA

### Fade In

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in var(--duration-base) var(--ease-out);
}
```

**Uso:** Modales, toasts, tooltips

---

### Slide In (desde abajo)

```css
@keyframes slide-in-bottom {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in-bottom {
  animation: slide-in-bottom var(--duration-base) var(--ease-out);
}
```

**Uso:** Notificaciones, cards que entran

---

### Scale In (con bounce)

```css
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in var(--duration-base) var(--ease-spring);
}
```

**Uso:** Modales, dropdowns

---

## ⚡ PERFORMANCE GUIDELINES

### Propiedades Optimizadas (GPU-accelerated)

✅ **Siempre usar:**
- `transform` (translate, scale, rotate)
- `opacity`

❌ **Evitar animar:**
- `width` / `height`
- `margin` / `padding`
- `left` / `top` (usar `transform` en su lugar)
- `border-width`

### Ejemplo: INCORRECTO vs CORRECTO

**❌ INCORRECTO (causa reflow):**
```css
.card:hover {
  width: 310px; /* De 300px a 310px */
  height: 410px;
}
```

**✅ CORRECTO (GPU accelerated):**
```css
.card:hover {
  transform: scale(1.03); /* 3% más grande */
}
```

---

### Will-Change (usar con cuidado)

```css
/* Solo en elementos que VAN a animar */
.button {
  will-change: transform, opacity;
}
```

**⚠️ Advertencia:**
NO usar `will-change` en todos los elementos. Consume memoria.

**Regla:**
- ✅ Elementos que animan frecuentemente (carruseles, drag & drop)
- ❌ Elementos con hover ocasional

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Por cada componente:

- [ ] Estado **Default** definido
- [ ] Estado **Hover** con `duration-fast` (150ms) y `ease-out`
- [ ] Estado **Active** con `scale-active` (0.98)
- [ ] Estado **Focus** con ring visible (WCAG AA)
- [ ] Estado **Disabled** con `opacity-disabled` (0.4)
- [ ] Transiciones optimizadas (solo `transform` y `opacity`)
- [ ] Microinteracciones de iconos (si aplica)
- [ ] Glow effects en contextos oscuros (opcional)
- [ ] Respeta `prefers-reduced-motion`
- [ ] Funciona en dispositivos táctiles (sin hover)

---

## 🎯 MATRIZ DE DECISIÓN RÁPIDA

### ¿Qué duration usar?

| Elemento | Tamaño | Complejidad | Duration |
|----------|--------|-------------|----------|
| Icon | Pequeño | Simple | fast (150ms) |
| Button | Mediano | Simple | fast (150ms) |
| Badge | Pequeño | Simple | fast (150ms) |
| Card | Grande | Medio | base (250ms) |
| Modal | Grande | Complejo | slow (400ms) |
| Input | Mediano | Requiere atención | slow (400ms) |
| Page transition | Pantalla | Muy complejo | slower (600ms) |

### ¿Qué easing usar?

| Acción | Easing |
|--------|--------|
| Hover en cualquier cosa | ease-out |
| Click/Active | ease-in-out |
| Aparecer (fade in) | ease-out |
| Desaparecer (fade out) | ease-in |
| Microinteracción (icon) | ease-spring |
| Modal/Drawer | ease-smooth |

### ¿Cuánto escalar?

| Elemento | Scale Hover | Scale Active |
|----------|-------------|--------------|
| Button | 1.05 | 0.98 |
| Card | 1.02 | 0.98 |
| Badge | 1.05 | 0.95 |
| Icon | 1.1 | 1.0 |

---

## 🚀 EJEMPLOS COMPLETOS

### Button Primary (Full State)

```tsx
<button className="
  /* Base */
  px-6 py-3 rounded-xl
  bg-uhura-purple-medium text-white
  font-bold shadow-lg
  
  /* Transitions */
  transition-all
  duration-[var(--duration-fast)]
  ease-[var(--ease-out)]
  
  /* Hover */
  hover:enabled:bg-uhura-purple-primary
  hover:enabled:shadow-xl
  hover:enabled:scale-[var(--scale-hover-button)]
  hover:enabled:-translate-y-[var(--lift-subtle)]
  hover:enabled:brightness-105
  
  /* Active */
  active:enabled:scale-[var(--scale-active)]
  active:enabled:translate-y-0
  active:enabled:shadow-lg
  
  /* Focus */
  focus:outline-none
  focus:ring-[var(--focus-ring-width)]
  focus:ring-uhura-purple-medium/30
  focus:ring-offset-2
  
  /* Disabled */
  disabled:opacity-[var(--opacity-disabled)]
  disabled:cursor-not-allowed
  disabled:transform-none
">
  Comenzar ahora
</button>
```

---

### Glass Card con Glow (Interactive)

```tsx
<div className="
  /* Base */
  p-8 rounded-3xl
  bg-white/70 backdrop-blur-md
  border border-white/50
  shadow-lg
  
  /* Transitions */
  transition-all
  duration-[var(--duration-base)]
  ease-[var(--ease-in-out)]
  cursor-pointer
  
  /* Hover */
  hover:bg-white/85
  hover:border-white/70
  hover:shadow-[var(--glow-purple)]
  hover:scale-[var(--scale-hover)]
  hover:-translate-y-[var(--lift-subtle)]
  
  /* Active */
  active:bg-white/70
  active:scale-[var(--scale-active)]
  active:translate-y-0
  active:shadow-lg
  
  /* Focus */
  focus-within:ring-[var(--focus-ring-width)]
  focus-within:ring-uhura-purple-medium/30
">
  {/* Content */}
</div>
```

---

## 📚 RECURSOS Y REFERENCIAS

### Herramientas

- [Cubic Bezier Generator](https://cubic-bezier.com/)
- [Easing Functions Cheat Sheet](https://easings.net/)
- [Can I Use: CSS Transforms](https://caniuse.com/transforms3d)

### Inspiración

- Material Design Motion Guidelines
- Apple Human Interface Guidelines (Motion)
- Stripe Design System
- Vercel Design System

---

**Versión:** 1.0.0  
**Fecha:** Abril 2026  
**Status:** ✅ Production Ready  
**Mantenedor:** Uhura Group Design Team
