# FIGMA INTEGRATION & AUTOMATION GUIDE
## Uhura Group 2026 - Liquid Glass Design System

---

## 📋 OVERVIEW

This guide explains how to integrate the Liquid Glass Design System with Figma, what can be automated, what requires manual work, and how to architect the complete design-to-frontend pipeline.

---

## 🤖 PART 1: AUTOMATIC FIGMA INTEGRATION

### What Can Be Automated with Figma Variables

Figma Variables support direct synchronization of design tokens. Using plugins like **Tokens Studio for Figma**, you can automatically import and sync:

#### ✅ Fully Automatable Tokens

| Token Type | Source File | Figma Variable Type | Notes |
|------------|-------------|---------------------|-------|
| **Colors** | `primitive.color.*` | Color Variables | All hex values convert directly |
| **Spacing** | `primitive.space.*` | Number Variables | Maps to auto-layout spacing |
| **Border Radius** | `primitive.border-radius.*` | Number Variables | Corner radius properties |
| **Opacity** | `primitive.opacity.*` | Number Variables | Layer opacity values |
| **Typography - Size** | `primitive.font-size.*` | Number Variables | Text size properties |
| **Typography - Weight** | `primitive.font-weight.*` | Number Variables | Font weight selection |
| **Typography - Line Height** | `primitive.line-height.*` | Number Variables | Line height ratios |
| **Shadows** | `semantic.shadow.*` | Effect Styles | Converted to drop shadow effects |

#### ⚠️ Partially Automatable Tokens

| Token Type | Limitation | Workaround |
|------------|------------|------------|
| **Gradients** | Figma doesn't support gradient variables yet | Create Color Styles manually |
| **Blur** | Not directly variable-supported | Create Effect Styles manually |
| **Motion (duration/easing)** | No native animation variables | Document in component descriptions |
| **Complex Shadows** | Multiple shadows need manual setup | Export as Effect Styles |

---

### Automation Workflow with Tokens Studio

#### Step 1: Install Tokens Studio Plugin

1. Open Figma → Plugins → Browse → Search "Tokens Studio"
2. Install "Tokens Studio for Figma"
3. Run plugin in your design file

#### Step 2: Import Primitive Tokens

```json
// Import design-tokens-v3-primitive.json
{
  "primitive": {
    "color": {
      "purple": {
        "400": { "value": "#8945f0", "type": "color" }
      }
    }
  }
}
```

**Plugin Configuration:**
- Set token type: "Primitives"
- Map to: Figma Variables (Local)
- Create variable collections: "Primitive Tokens"

#### Step 3: Import Semantic Tokens

```json
// Import design-tokens-v3-semantic.json
{
  "semantic": {
    "brand": {
      "primary": {
        "default": { "value": "{primitive.color.purple.400}" }
      }
    }
  }
}
```

**Plugin Configuration:**
- Set token type: "Semantic"
- Enable token aliasing (references)
- Map to: Figma Variables (Local)
- Create variable collections: "Semantic Tokens"

#### Step 4: Apply Variables to Components

Once imported, variables appear in Figma's Variables panel:

```
Variables
├── Primitive Tokens
│   ├── color/purple/400 → #8945f0
│   ├── space/4 → 16px
│   └── border-radius/xl → 16px
└── Semantic Tokens
    ├── brand/primary/default → {color/purple/400}
    └── spacing/component/md → {space/6}
```

**Apply to layers:**
- Select layer → Fill → Click variable icon → Choose `semantic/brand/primary/default`
- Auto-layout → Gap → Click variable icon → Choose `semantic/spacing/component/md`

---

### GitHub Token Sync (Advanced Automation)

For teams using version control:

#### Option A: GitHub Actions + Token Sync

1. Store tokens in GitHub repository
2. Configure Tokens Studio to pull from GitHub
3. Automatic updates when tokens change

**Setup:**
```yaml
# .github/workflows/sync-tokens.yml
name: Sync Design Tokens to Figma
on:
  push:
    paths:
      - 'design-tokens-v3-*.json'
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Sync to Figma
        uses: tokens-studio/figma-sync@v1
        with:
          figma-file-key: ${{ secrets.FIGMA_FILE_KEY }}
          token-files: 'design-tokens-v3-*.json'
```

#### Option B: Style Dictionary Pipeline

Transform tokens for multiple platforms:

```bash
npm install style-dictionary
```

**Configuration:**
```js
// style-dictionary.config.js
module.exports = {
  source: ['design-tokens-v3-*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables'
      }]
    },
    figma: {
      transformGroup: 'figma',
      buildPath: 'figma/',
      files: [{
        destination: 'figma-tokens.json',
        format: 'json/nested'
      }]
    }
  }
};
```

---

## 🎨 PART 2: MANUAL FIGMA WORK REQUIRED

### What Cannot Be Automated

These elements require designer expertise and manual creation in Figma:

#### 1. Component Visual Design

**What:** The actual visual composition of components (Button, Card, Input, etc.)

**Why Manual:**
- Layout decisions (flex direction, alignment)
- Visual hierarchy (size relationships, spacing balance)
- Micro-interactions (hover state design)
- Icon integration and sizing
- Text hierarchy within components

**Process:**
1. Create component frame
2. Apply variables for colors/spacing
3. Configure auto-layout
4. Design all 5 states (default, hover, active, focus, disabled)
5. Add component properties (variant, size, icon, etc.)

**Example - Button Component:**
```
Button [Component]
├── Variants
│   ├── variant=primary, size=lg, state=default
│   ├── variant=primary, size=lg, state=hover
│   ├── variant=secondary, size=md, state=default
│   └── ... (40+ variants for all combinations)
├── Properties
│   ├── variant: primary | secondary | ghost | outline | glass
│   ├── size: sm | md | lg | xl
│   ├── state: default | hover | active | focus | disabled
│   ├── icon: boolean
│   └── iconPosition: left | right
└── Auto-layout
    ├── Direction: Horizontal
    ├── Padding: {semantic.spacing.component.*} (variable)
    ├── Gap: {semantic.spacing.component.sm} (variable)
    └── Fill: {semantic.interactive.default.background} (variable)
```

---

#### 2. Auto-Layout Configuration

**What:** Responsive behavior, padding, gap, alignment, constraints

**Why Manual:**
- Design intent requires human judgment
- Context-specific layout behavior
- Nesting relationships
- Responsive breakpoint decisions

**Best Practices:**
- Use variables for padding/gap values
- Set "Hug contents" for buttons/badges
- Set "Fill container" for cards/sections
- Configure constraints for responsive behavior

---

#### 3. Component Variants Organization

**What:** Variant property structure and naming

**Why Manual:**
- Naming conventions must match codebase
- Variant relationships are design decisions
- Boolean vs. dropdown property choices

**Recommended Structure:**
```
Component/variant=value,size=value,state=value

Examples:
- Button/variant=primary,size=lg,state=default
- Card/variant=glass,padding=lg,hover=true
- Badge/variant=neon,size=md
```

**Match with React Props:**
```tsx
// Figma variant names should match React prop values
<Button variant="primary" size="lg" />
//      ↓ matches ↓
Button/variant=primary,size=lg
```

---

#### 4. Complex Visual Effects

**What:** Gradients, glassmorphism, advanced shadows

**Why Manual:**
- Gradients aren't supported as variables yet
- Glassmorphism requires layering (background blur, borders, fills)
- Multi-layer shadows need careful composition

**Manual Setup - Glass Card:**
```
GlassCard [Frame]
├── Fill: Linear gradient (manual)
├── Effects
│   ├── Background Blur: 16px
│   ├── Drop Shadow: {semantic.shadow.floating} (variable)
│   └── Inner Shadow: for depth
└── Stroke: rgba(255,255,255,0.4) (manual, can't use variable for alpha)
```

---

#### 5. Documentation & Usage Guidelines

**What:** Component descriptions, usage rules, examples

**Why Manual:**
- Context requires human explanation
- Usage rules based on design intent
- Visual examples need curation

**Add to Component Descriptions:**
```markdown
## Button - Primary Variant

**When to use:**
- Main CTA per section (max 1)
- Critical actions (Sign up, Submit, Purchase)
- On white or light backgrounds

**When NOT to use:**
- Multiple primaries in same section (use secondary instead)
- On gradient backgrounds (use glass variant)
- For tertiary actions (use ghost variant)

**Properties:**
- variant: "primary"
- size: sm | md | lg | xl
- icon: optional, right-aligned by default

**Accessibility:**
- Min contrast ratio: 4.5:1
- Focus ring: 3px offset
- Touch target: 44x44px minimum
```

---

#### 6. Interactive Prototypes

**What:** Click flows, micro-animations, state transitions

**Why Manual:**
- User flow design decisions
- Animation timing/easing choices
- Context-specific interactions

**Prototype Guidelines:**
- Show all 5 interaction states
- Document transition durations (reference Motion System tokens)
- Demonstrate hover → active → focus flows
- Test keyboard navigation

---

## 🏗️ PART 3: DESIGN-TO-FRONTEND ARCHITECTURE

### Complete Pipeline Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     DESIGN SYSTEM PIPELINE                   │
└─────────────────────────────────────────────────────────────┘

1. TOKEN CREATION (Source of Truth)
   ├── design-tokens-v3-primitive.json    (Raw values)
   └── design-tokens-v3-semantic.json     (Role-based)
          ↓
2. FIGMA SYNC (Design Tool)
   ├── Tokens Studio Plugin → Import tokens
   ├── Create Variables (automated)
   ├── Build Components (manual design)
   └── Document usage (manual)
          ↓
3. TOKEN TRANSFORMATION (Build Process)
   ├── Style Dictionary
   │   ├── Output: CSS Variables (theme.css)
   │   ├── Output: SCSS Variables
   │   ├── Output: Tailwind Config
   │   └── Output: WordPress theme.json
   └── Version Control (GitHub)
          ↓
4. COMPONENT DEVELOPMENT (Frontend)
   ├── React Components (src/app/components/)
   │   ├── Use CSS Variables from tokens
   │   ├── Match Figma component API
   │   └── Implement 5 states
   ├── Storybook Documentation
   │   ├── Visual component catalog
   │   └── Props documentation
   └── Unit + Visual Regression Tests
          ↓
5. IMPLEMENTATION (WordPress/Pages)
   ├── Gutenberg Blocks (WordPress)
   ├── Page Templates
   └── Theme Integration
```

---

### Detailed Architecture Layers

#### Layer 1: Design Tokens (Single Source of Truth)

**Location:** `/design-tokens-v3-*.json`

**Responsibility:**
- Define all primitive values (colors, spacing, etc.)
- Define semantic mappings (brand.primary → purple.400)
- Version controlled in Git
- Never edited by hand in downstream systems

**Workflow:**
1. Designer/dev updates token files
2. Commit to Git
3. Triggers automated pipelines (Figma sync + build process)

---

#### Layer 2: Figma (Design & Documentation)

**Location:** Figma workspace/project

**Responsibility:**
- Visual design of components
- Usage documentation
- Prototypes and flows
- Design QA and reviews

**Sync Strategy:**

**Automated (Tokens Studio):**
- Color variables
- Spacing variables
- Typography primitives
- Border radius
- Opacity values

**Manual (Designer Work):**
- Component visual design
- Auto-layout configuration
- Variant structure
- Documentation
- Prototypes

**Export for Development:**
- Design specs (Dev Mode)
- Component screenshots
- Measurement references
- Asset exports (icons, images)

---

#### Layer 3: Token Build Pipeline (Transformation)

**Location:** `/build-scripts/` + CI/CD

**Tools:**
- Style Dictionary (token transformation)
- GitHub Actions (automation)
- PostCSS (CSS processing)

**Transformations:**

```bash
# Install
npm install style-dictionary --save-dev

# Run build
npx style-dictionary build
```

**Outputs:**

1. **CSS Variables** (`src/styles/tokens.css`)
```css
:root {
  --color-brand-primary-default: #8945f0;
  --spacing-component-md: 1.5rem;
  --border-radius-button: 1rem;
}
```

2. **Tailwind Config** (`tailwind.config.js`)
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-primary': '#8945f0',
      },
      spacing: {
        'component-md': '1.5rem',
      }
    }
  }
}
```

3. **WordPress Theme JSON** (`theme.json`)
```json
{
  "version": 2,
  "settings": {
    "color": {
      "palette": [
        {
          "slug": "brand-primary",
          "color": "#8945f0",
          "name": "Brand Primary"
        }
      ]
    }
  }
}
```

---

#### Layer 4: Component Development (React/Code)

**Location:** `/src/app/components/`

**Responsibility:**
- Implement components matching Figma design
- Use CSS variables from token build
- Implement all 5 interaction states
- Accessibility compliance (WCAG AA)
- Unit and integration tests

**Component API Alignment:**

**Figma Component:**
```
Button/variant=primary,size=lg,icon=true,iconPosition=right
```

**React Component:**
```tsx
<Button 
  variant="primary" 
  size="lg" 
  icon={<Icon />} 
  iconPosition="right"
>
  Label
</Button>
```

**Implementation Pattern:**
```tsx
// Button.tsx
export const Button = ({ variant, size, icon, iconPosition, children }) => {
  return (
    <button
      className={`
        btn 
        btn--${variant} 
        btn--${size}
        ${icon ? 'btn--with-icon' : ''}
      `}
      style={{
        backgroundColor: 'var(--color-interactive-default-background)',
        padding: 'var(--spacing-component-md)',
        borderRadius: 'var(--border-radius-button)',
        transition: 'all var(--duration-fast) var(--ease-out)',
      }}
    >
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
};
```

---

#### Layer 5: Documentation & QA (Storybook)

**Location:** `.storybook/` + deployed docs site

**Responsibility:**
- Visual component catalog
- Interactive prop playground
- Usage guidelines
- Code examples
- Visual regression testing

**Storybook Story Example:**
```tsx
// Button.stories.tsx
export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Primary button for main CTAs. Max 1 per section.',
      },
    },
  },
};

export const Primary = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Click me',
  },
};

export const AllStates = () => (
  <div>
    <Button variant="primary">Default</Button>
    <Button variant="primary" className="hover">Hover</Button>
    <Button variant="primary" className="active">Active</Button>
    <Button variant="primary" className="focus">Focus</Button>
    <Button variant="primary" disabled>Disabled</Button>
  </div>
);
```

---

### Recommended File Structure

```
uhura-design-system/
├── design-tokens-v3-primitive.json      # Source of truth (primitives)
├── design-tokens-v3-semantic.json       # Source of truth (semantic)
│
├── figma/
│   └── README.md                        # Figma setup instructions
│
├── build-scripts/
│   ├── style-dictionary.config.js       # Token transformation config
│   └── figma-sync.yml                   # GitHub Actions workflow
│
├── src/
│   ├── styles/
│   │   ├── tokens.css                   # Generated from build
│   │   ├── theme.css                    # Manual overrides
│   │   └── fonts.css                    # Font imports
│   │
│   └── app/
│       ├── components/                  # React components
│       │   ├── Button.tsx
│       │   ├── Card.tsx
│       │   └── ...
│       │
│       └── sections/                    # UI Kit sections
│           ├── Foundations.tsx
│           └── ...
│
├── wordpress/
│   └── theme.json                       # Generated for WordPress
│
├── docs/
│   ├── README_DESIGN_SYSTEM.md
│   ├── FIGMA_INTEGRATION_GUIDE.md       # This file
│   └── INDEX.md
│
└── .storybook/
    └── ...                              # Storybook config
```

---

## 🔄 WORKFLOW EXAMPLES

### Scenario 1: Adding a New Color

**Step 1: Update Token File**
```json
// design-tokens-v3-primitive.json
"color": {
  "green": {
    "500": { "value": "#10b981", "type": "color" }
  }
}
```

**Step 2: Map Semantic Token**
```json
// design-tokens-v3-semantic.json
"feedback": {
  "success": {
    "default": { "value": "{primitive.color.green.500}" }
  }
}
```

**Step 3: Sync to Figma**
- Run Tokens Studio → Sync
- New variable appears: `semantic/feedback/success/default`

**Step 4: Build for Code**
```bash
npm run build:tokens
```

**Output:**
```css
/* tokens.css */
:root {
  --color-feedback-success-default: #10b981;
}
```

**Step 5: Use in Component**
```tsx
<Badge variant="success">Success</Badge>
```

```css
.badge--success {
  background-color: var(--color-feedback-success-default);
}
```

---

### Scenario 2: Designing a New Component

**Step 1: Design in Figma (Manual)**
- Create component frame
- Apply variables for colors/spacing
- Configure auto-layout
- Create variants (size, state, etc.)
- Add documentation

**Step 2: Export Specs**
- Dev Mode → Copy CSS
- Export assets (icons, images)
- Screenshot reference

**Step 3: Implement in React**
```tsx
// src/app/components/NewComponent.tsx
export const NewComponent = ({ variant, size }) => {
  return (
    <div 
      className={`new-component new-component--${variant} new-component--${size}`}
      style={{
        padding: 'var(--spacing-component-md)',
        borderRadius: 'var(--border-radius-card)',
        backgroundColor: 'var(--color-surface-card-default)',
      }}
    >
      {/* Component content */}
    </div>
  );
};
```

**Step 4: Document in Storybook**
```tsx
// NewComponent.stories.tsx
export default {
  title: 'Components/NewComponent',
  component: NewComponent,
};
```

**Step 5: Visual QA**
- Compare Storybook render with Figma design
- Test all variants and states
- Check responsive behavior

---

### Scenario 3: Updating Typography Scale

**Step 1: Update Primitive Token**
```json
// design-tokens-v3-primitive.json
"font-size": {
  "h1": { "value": "3.75rem", "type": "dimension" }  // Changed from 3.5rem
}
```

**Step 2: Rebuild**
```bash
npm run build:tokens
```

**Step 3: Sync Figma**
- Tokens Studio → Sync
- All components using `font-size/h1` variable update automatically

**Step 4: Test**
- Check all affected components in Storybook
- Visual regression testing
- Responsive checks

---

## ✅ CHECKLIST: FIGMA SETUP

### Initial Setup

- [ ] Install Tokens Studio plugin in Figma
- [ ] Create Figma design file for Design System
- [ ] Import `design-tokens-v3-primitive.json` as Variables
- [ ] Import `design-tokens-v3-semantic.json` as Variables
- [ ] Verify all color variables created correctly
- [ ] Verify all spacing variables created correctly
- [ ] Create Color Styles for gradients (manual)
- [ ] Create Effect Styles for shadows (manual)
- [ ] Create Text Styles linked to variables

### Component Development

- [ ] Create base component frames
- [ ] Apply variables to all properties
- [ ] Configure auto-layout with variable spacing
- [ ] Build all variants (size, state, etc.)
- [ ] Implement 5 interaction states
- [ ] Add component properties (match React API)
- [ ] Write component documentation
- [ ] Create usage examples
- [ ] Build prototype for interactions

### Documentation

- [ ] Create cover page explaining the system
- [ ] Document token categories
- [ ] Document component usage rules
- [ ] Add DO/DON'T visual examples
- [ ] Create responsive behavior examples
- [ ] Document accessibility guidelines

### Maintenance

- [ ] Set up GitHub token sync (optional)
- [ ] Configure Tokens Studio to pull from GitHub
- [ ] Define update workflow (who can edit tokens)
- [ ] Schedule regular design-dev sync meetings
- [ ] Set up Figma version control strategy

---

## 🚀 NEXT STEPS

### For Designers

1. **Set up Figma file** with imported variables
2. **Build component library** applying variables
3. **Document usage rules** in component descriptions
4. **Create prototypes** showing interaction states
5. **Regular sync** with development team

### For Developers

1. **Configure Style Dictionary** for token transformation
2. **Implement React components** matching Figma API
3. **Set up Storybook** for component documentation
4. **Write tests** for visual regression
5. **WordPress integration** (Gutenberg blocks)

### For Product

1. **Review component library** in Figma
2. **Map page requirements** to existing components
3. **Identify gaps** in component coverage
4. **Prioritize new components** needed
5. **Define acceptance criteria** for design-dev handoff

---

## 📞 SUPPORT & RESOURCES

### Documentation
- [README_DESIGN_SYSTEM.md](./README_DESIGN_SYSTEM.md) - Complete system overview
- [INDEX.md](./INDEX.md) - File structure and navigation
- [design-tokens-v3-primitive.json](./design-tokens-v3-primitive.json) - Raw token values
- [design-tokens-v3-semantic.json](./design-tokens-v3-semantic.json) - Semantic mappings

### External Resources
- [Tokens Studio for Figma](https://tokens.studio/) - Plugin documentation
- [Style Dictionary](https://amzn.github.io/style-dictionary/) - Token transformation
- [W3C Design Tokens](https://tr.designtokens.org/format/) - Token format spec
- [Figma Variables](https://help.figma.com/hc/en-us/articles/15339657135383) - Official guide

---

**Version:** 1.0.0  
**Date:** May 2026  
**Status:** ✅ Complete Integration Guide  
**Maintainer:** Uhura Group Design Team
