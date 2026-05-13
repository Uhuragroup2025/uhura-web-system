# UHURA GROUP 2026 - LIQUID GLASS DESIGN SYSTEM
## Sistema de Diseño Completo y Estructurado

---

## 📚 ¿QUÉ ES ESTO?

Este es un **DESIGN SYSTEM completo**, NO una landing page.

Es una librería visual estructurada con:
- ✅ Design Tokens exportables (JSON)
- ✅ Foundations (colores, tipografía, espaciado)
- ✅ Liquid Glass System (glassmorphism estructurado)
- ✅ Motion System (animaciones coherentes)
- ✅ Componentes reutilizables con variantes
- ✅ Reglas de uso documentadas

**Objetivo:** Construir múltiples páginas web sin perder consistencia visual.

---

## 🚀 CÓMO USAR ESTE SISTEMA

### 1. Ver el UI Kit

```bash
npm run dev
```

Navega por las 4 secciones:

1. **Foundations** - Tokens base (colores, tipografía, espaciado)
2. **Liquid Glass** - Sistema de glassmorphism con reglas
3. **Components** - Biblioteca de componentes con variantes
4. **Motion** - Sistema de animaciones coherentes

### 2. Exportar Design Tokens

Los tokens están en formato JSON estándar:

```
/design-tokens.json
```

Compatible con:
- Figma (Tokens Studio plugin)
- Style Dictionary
- Tailwind CSS
- CSS Variables

### 3. Implementar en Código

Los componentes están en:

```
/src/app/components/
```

Importar y usar:

```tsx
import { Button } from './components/Button';

<Button variant="primary" size="lg">
  Click me
</Button>
```

---

## 🎨 ESTRUCTURA DEL SISTEMA

### 1. FOUNDATIONS (Base)

#### Colores

```json
{
  "primary": {
    "100": "#c1a1ff",  // Lightest
    "300": "#8945f0",  // Main brand
    "600": "#30108b"   // Darkest
  },
  "accent": {
    "base": "#e1ff64"  // Neon yellow
  },
  "neutral": {
    "0": "#ffffff",    // White
    "800": "#212121"   // Near black
  }
}
```

**Roles:**
- Primary 300: Main CTAs, links
- Accent: Highlights, secondary CTAs
- Neutral 0-900: Text, backgrounds, borders

#### Reglas de Uso de Color (Desde Manual de Marca)

**⚠️ IMPORTANTE: Respetar proporciones máximas por diseño**

| Categoría | Colores | Uso Máximo | Aplicación |
|-----------|---------|------------|------------|
| **Colores Primarios** | Purple #8945f0, #501f92, #c1a1ff<br>White #ffffff | **70% cada uno** | Backgrounds, CTAs principales,<br>Cards, Headers, Navegación |
| **Negro** | Near-black #1a1a1a | **30%** | Tipografía, elementos de<br>alto contraste, íconos |
| **Colores Secundarios** | Yellow #e1ff64 (neon)<br>Cyan #25c8d9<br>Pink #cd79e8 | **15% cada uno** | Highlights, Badges,<br>CTAs secundarios, Acentos |

**Reglas Clave:**
- ✅ Purple es el color dominante (hasta 70% del diseño)
- ✅ Yellow, Cyan, Pink son SOLO para highlights críticos
- ✅ Máximo 2 colores secundarios simultáneos por viewport
- ❌ NO usar más de 15% de cualquier color secundario
- ❌ NO mezclar los 3 colores secundarios en la misma sección

**Ejemplo de Uso Correcto:**
```
Hero Section (100% del viewport):
- Background gradient purple: 60%
- White text/cards: 30%
- Yellow accent badges: 10%
✅ Total = 100%, respeta límites
```

**Ejemplo de Uso Incorrecto:**
```
Section (100% del viewport):
- Yellow backgrounds: 30%  ❌ Excede 15%
- Pink badges: 20%         ❌ Excede 15%
- Cyan buttons: 15%        ❌ 3 colores secundarios simultáneos
```

#### Tipografía

| Hierarchy | Weight | Size | Line Height | Use |
|-----------|--------|------|-------------|-----|
| H1 | Bold | 56px | 72px | Hero headlines |
| H2 | Bold | 40px | 56px | Section titles |
| H3 | Medium | 28px | 40px | Subsections |
| Body Large | Medium | 16px | 27px | Primary text |

**Fonts:**
- **Montserrat**: Primary (headings, UI, body)
- **Georgia Italic**: Accent (keywords, emphasis only)

#### Espaciado

Sistema 4pt base:
```
1 = 4px
2 = 8px
4 = 16px
6 = 24px
8 = 32px
12 = 48px
```

#### Sombras

- **Soft**: `0 2px 4px 0 rgba(0,0,0,0.04)` - Subtle cards
- **Medium**: `0 4px 12px -2px rgba(0,0,0,0.08)` - Standard
- **Strong**: `0 12px 24px -4px rgba(0,0,0,0.12)` - Modals
- **Floating**: `0 24px 48px -8px rgba(0,0,0,0.16)` - Glass cards

---

### 2. LIQUID GLASS SYSTEM

#### 3 Niveles de Glass

| Nivel | Opacity | Blur | Border | Uso |
|-------|---------|------|--------|-----|
| Light | 70% | 16px | white/40 | Gradientes claros |
| Medium | 50% | 24px | white/30 | Modales, overlays |
| Dark | 15% | 32px | purple/20 | Fondos oscuros |

#### ✅ Cuándo Usar Glass

- Hero sections con gradientes
- Cards sobre fondos complejos
- Modales y overlays
- CTAs sobre gradientes morados
- Máximo 2-3 elementos glass por viewport

#### ❌ Cuándo NO Usar Glass

- Fondos blancos planos (no se ve)
- Todo el sitio (pierde propósito)
- Elementos pequeños (badges, iconos)
- Formularios críticos (legibilidad)
- Texto body extenso
- Múltiples capas anidadas

---

### 3. MOTION SYSTEM

#### Duraciones

```css
--duration-fast: 150ms     /* Hover (90% de casos) */
--duration-base: 250ms     /* Cards, transiciones */
--duration-slow: 400ms     /* Inputs, modales */
```

#### Easing

```css
--ease-out: cubic-bezier(0, 0, 0.2, 1)        /* Hover (default) */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)  /* Bidireccional */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1) /* Bounce premium */
```

#### Transform Scales

```css
--scale-hover-button: 1.05  /* Buttons hover */
--scale-hover-card: 1.02    /* Cards hover */
--scale-active: 0.98        /* Active/press */
```

#### Regla de Oro

🎯 **Para el 90% de casos:**
```
duration-fast (150ms) + ease-out + scale(1.05)
```

#### 5 Estados Obligatorios

Todo componente interactivo debe tener:

1. **Default** - Estado base en reposo
2. **Hover** - Mouse sobre el elemento (scale + elevate)
3. **Active** - Click/press (scale reduce)
4. **Focus** - Keyboard navigation (ring 3px)
5. **Disabled** - No interactivo (opacity 0.4)

---

### 4. COMPONENTES

#### Button

**Variantes:**
- `primary` - CTAs principales (1 por sección)
- `secondary` - Destacados alternativos (amarillo neón)
- `ghost` - Acciones terciarias
- `outline` - Alternativas con borde
- `glass` - SOLO sobre gradientes

**Tamaños:**
- `sm`, `md`, `lg`, `xl`

**Props:**
```tsx
<Button
  variant="primary"
  size="lg"
  icon={<Icon />}
  iconPosition="right"
  disabled={false}
>
  Label
</Button>
```

**Reglas:**
- 1 primary button por sección máximo
- Icons a la derecha por default
- Glass variant SOLO sobre fondos complejos

---

#### Badge

**Variantes:**
- `neon` - Highlights críticos (máximo 1-2 por viewport)
- `purple` - Categorías, estados
- `subtle` - Información secundaria
- `glass` - Sobre gradientes
- `outline` - Alternativa con borde

**Tamaños:**
- `xs`, `sm`, `md`, `lg`

**Reglas:**
- NO usar para texto extenso (máximo 2-3 palabras)
- Neon para highlights críticos únicamente

---

#### Card

**Variantes:**
- `default` - Uso estándar sobre fondos blancos
- `elevated` - Mayor elevación visual
- `purple` - Contraste alto
- `gradient` - Premium, CTAs principales
- `glass` - SOLO sobre fondos complejos
- `glass-dark` - Sobre fondos oscuros

**Props:**
```tsx
<Card
  variant="default"
  padding="lg"
  hover={true}
  interactive={true}
>
  {children}
</Card>
```

**Reglas:**
- Añadir `hover` prop SOLO si son clickeables
- Glass variants SOLO sobre fondos NO blancos
- Gradient para elementos premium

---

#### Input

**Variantes:**
- `default` - Uso estándar
- `glass` - SOLO en hero sections con gradientes

**Props:**
```tsx
<Input
  label="Label"
  placeholder="Placeholder"
  error="Error message"
  helperText="Helper text"
  icon={<Icon />}
  variant="default"
  disabled={false}
/>
```

**Reglas:**
- Labels siempre visibles (no solo placeholder)
- Glass variant SOLO en hero sections
- Estados de error claros con mensaje
- Focus ring siempre visible (accesibilidad)

---

#### GlassCard

**Variantes:**
- `light` - 70% opacity, sobre gradientes claros
- `dark` - 30% opacity, sobre fondos oscuros
- `purple` - Con glow effect opcional

**Props:**
```tsx
<GlassCard
  variant="light"
  blur="md"
  padding="lg"
  hover={true}
  glow={false}
  icon={<Icon />}
  title="Title"
  description="Description"
>
  {children}
</GlassCard>
```

**Reglas:**
- SOLO usar sobre fondos NO blancos
- Máximo 2-3 por viewport
- Blur puede ser costoso en móviles (testear)

---

## 📋 REGLAS GENERALES DE USO

### Colores

1. **Primary 300 (#8945f0)**: 70% del uso de marca
2. **Accent (#e1ff64)**: Máximo 15% - solo highlights
3. **Neutral 0-900**: Escala completa para textos y fondos
4. **Gradientes**: Usar con moderación (heros, CTAs premium)

### Tipografía

1. **Montserrat**: Uso general (NO usar italic)
2. **Georgia Italic**: SOLO para palabras de énfasis (no párrafos)
3. **Bold (700)**: Headings principales
4. **Regular (400)**: Body text
5. **Line height**: Mínimo 1.5x para body, 1.2x para headings

### Espaciado

1. Siempre múltiplos de 4px
2. Componentes UI: 16-24px padding
3. Secciones: 48-96px padding vertical
4. Elementos inline: 4-12px gaps

### Glassmorphism

1. SOLO sobre fondos complejos (gradientes, imágenes)
2. Máximo 2-3 elementos glass simultáneos
3. Light (70%) para fondos claros
4. Dark (15%) para fondos oscuros
5. NO usar en fondos blancos planos

### Motion

1. **Hover**: 150ms + ease-out (regla de oro)
2. **Cards**: 250ms + ease-in-out
3. **Inputs**: 400ms (requieren atención)
4. Solo animar `transform` y `opacity` (performance)
5. Siempre implementar los 5 estados

### Responsive

1. Desktop: Grid 12 columnas, max-width 1200px
2. Tablet: Grid 8 columnas, márgenes 32px
3. Mobile: Grid 4 columnas, márgenes 16px
4. Reducir blur en móviles (performance)
5. NO hover effects en touch devices

---

## 📦 ARCHIVOS DEL SISTEMA

```
/design-tokens.json           # Tokens exportables (JSON)
/src/styles/theme.css         # CSS Variables
/src/styles/fonts.css         # Google Fonts
/src/app/components/          # Componentes React
  Button.tsx
  Badge.tsx
  Card.tsx
  Input.tsx
  GlassCard.tsx
  ...
/src/app/sections/            # Secciones del UI Kit
  Foundations.tsx
  LiquidGlass.tsx
  Components.tsx
  Motion.tsx
/src/app/App.tsx              # UI Kit Showcase
```

---

## 🔧 DESARROLLO

### Instalar

```bash
npm install
```

### Ejecutar UI Kit

```bash
npm run dev
```

### Exportar Tokens

Los tokens en `design-tokens.json` se pueden:

1. **Figma**: Importar con Tokens Studio plugin
2. **Código**: Convertir con Style Dictionary
3. **Tailwind**: Mapear a `tailwind.config.js`
4. **WordPress**: Exportar a `theme.json`

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Para Diseñadores

- [ ] Revisar todas las secciones del UI Kit
- [ ] Entender las reglas de cada componente
- [ ] Conocer cuándo usar/no usar glass
- [ ] Importar tokens en Figma
- [ ] Crear mockups usando SOLO componentes del sistema

### Para Desarrolladores

- [ ] Importar design-tokens.json
- [ ] Configurar theme.css con variables
- [ ] Implementar componentes base (Button, Card, Input)
- [ ] Implementar 5 estados en cada componente
- [ ] Testear performance (60fps)
- [ ] Testear accesibilidad (keyboard navigation)
- [ ] Testear responsive (mobile, tablet, desktop)

### Para Producto

- [ ] Definir páginas a construir
- [ ] Mapear componentes necesarios
- [ ] Validar que existen en el sistema
- [ ] Documentar decisiones de uso
- [ ] Revisar consistencia visual

---

## 🎯 PRÓXIMOS PASOS

1. **Figma Library**: Crear librería visual en Figma
2. **WordPress Integration**: Convertir a Gutenberg blocks
3. **Documentation Site**: Deployar UI Kit online
4. **Storybook**: Integrar para desarrollo aislado
5. **Testing**: Unit tests + visual regression

---

## 📞 SOPORTE

Para preguntas sobre el Design System:

- **Documentación**: Este README
- **UI Kit**: Ver secciones interactivas
- **Tokens**: Revisar `design-tokens.json`

---

**Versión:** 2.0.0  
**Fecha:** Abril 2026  
**Status:** ✅ Design System Completo y Estructurado  
**Mantenedor:** Uhura Group Design Team

---

## 🎉 CONCLUSIÓN

Este es un **DESIGN SYSTEM completo**, no una landing page.

Está listo para:
- ✅ Construir múltiples páginas web
- ✅ Implementar en WordPress/Gutenberg
- ✅ Importar en Figma
- ✅ Escalar sin perder consistencia
- ✅ Usar en código (React, Vue, HTML/CSS)

**No diseñes páginas desde cero. Usa este sistema.**
