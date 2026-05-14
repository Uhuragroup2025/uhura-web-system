# WORDPRESS / GUTENBERG INTEGRATION GUIDE

Guía para implementar el Design System de Uhura Group 2026 en WordPress con Gutenberg.

---

## 📦 ESTRUCTURA DE ARCHIVOS

```
wp-content/themes/uhura-2026/
├── style.css
├── functions.php
├── theme.json                    # Design tokens
├── assets/
│   ├── css/
│   │   ├── foundations.css       # Variables CSS
│   │   ├── fonts.css             # Google Fonts
│   │   └── components.css        # Estilos de componentes
│   ├── js/
│   │   ├── blocks.js             # Bundle de blocks
│   │   └── components/
│   │       ├── Button.js
│   │       ├── Hero.js
│   │       └── ...
│   └── images/
├── blocks/                        # Gutenberg blocks
│   ├── hero/
│   │   ├── block.json
│   │   ├── edit.js
│   │   ├── save.js
│   │   └── style.css
│   ├── service-card/
│   └── partners-grid/
└── template-parts/
    ├── header.php
    └── footer.php
```

---

## 🎨 THEME.JSON

Configuración de Design Tokens para Gutenberg:

```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 2,
  "settings": {
    "color": {
      "custom": true,
      "customGradient": true,
      "palette": [
        {
          "slug": "uhura-purple-dark",
          "color": "#30108b",
          "name": "Purple Dark"
        },
        {
          "slug": "uhura-purple-primary",
          "color": "#501f92",
          "name": "Purple Primary"
        },
        {
          "slug": "uhura-purple-medium",
          "color": "#8945f0",
          "name": "Purple Medium"
        },
        {
          "slug": "uhura-purple-light",
          "color": "#c1a1ff",
          "name": "Purple Light"
        },
        {
          "slug": "uhura-neon-yellow",
          "color": "#e1ff64",
          "name": "Neon Yellow"
        },
        {
          "slug": "uhura-neutral-light",
          "color": "#eeeeee",
          "name": "Neutral Light"
        },
        {
          "slug": "white",
          "color": "#ffffff",
          "name": "White"
        },
        {
          "slug": "black",
          "color": "#1a1a1a",
          "name": "Black"
        }
      ],
      "gradients": [
        {
          "slug": "purple-cyan",
          "gradient": "linear-gradient(135deg, #8945f0 0%, #6dd5ed 100%)",
          "name": "Purple to Cyan"
        },
        {
          "slug": "purple-pink",
          "gradient": "linear-gradient(135deg, #8945f0 0%, #ff6ec4 100%)",
          "name": "Purple to Pink"
        },
        {
          "slug": "purple-yellow",
          "gradient": "linear-gradient(135deg, #501f92 0%, #e1ff64 100%)",
          "name": "Purple to Yellow"
        }
      ]
    },
    "typography": {
      "customFontSize": true,
      "fontSizes": [
        {
          "slug": "small",
          "size": "0.875rem",
          "name": "Small"
        },
        {
          "slug": "normal",
          "size": "1rem",
          "name": "Normal"
        },
        {
          "slug": "large",
          "size": "1.5rem",
          "name": "Large"
        },
        {
          "slug": "x-large",
          "size": "2rem",
          "name": "X-Large"
        },
        {
          "slug": "xx-large",
          "size": "2.5rem",
          "name": "XX-Large"
        },
        {
          "slug": "xxx-large",
          "size": "3.5rem",
          "name": "XXX-Large"
        }
      ],
      "fontFamilies": [
        {
          "slug": "montserrat",
          "fontFamily": "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          "name": "Montserrat"
        },
        {
          "slug": "plus-jakarta",
          "fontFamily": "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          "name": "Plus Jakarta Sans"
        }
      ],
      "fontWeights": [
        {
          "slug": "normal",
          "weight": "400",
          "name": "Normal"
        },
        {
          "slug": "medium",
          "weight": "500",
          "name": "Medium"
        },
        {
          "slug": "semibold",
          "weight": "600",
          "name": "Semibold"
        },
        {
          "slug": "bold",
          "weight": "700",
          "name": "Bold"
        },
        {
          "slug": "extrabold",
          "weight": "800",
          "name": "Extrabold"
        }
      ]
    },
    "spacing": {
      "units": ["px", "rem", "vh", "vw", "%"],
      "spacingSizes": [
        { "slug": "1", "size": "0.25rem", "name": "1" },
        { "slug": "2", "size": "0.5rem", "name": "2" },
        { "slug": "3", "size": "0.75rem", "name": "3" },
        { "slug": "4", "size": "1rem", "name": "4" },
        { "slug": "5", "size": "1.25rem", "name": "5" },
        { "slug": "6", "size": "1.5rem", "name": "6" },
        { "slug": "8", "size": "2rem", "name": "8" },
        { "slug": "10", "size": "2.5rem", "name": "10" },
        { "slug": "12", "size": "3rem", "name": "12" },
        { "slug": "16", "size": "4rem", "name": "16" },
        { "slug": "20", "size": "5rem", "name": "20" },
        { "slug": "24", "size": "6rem", "name": "24" }
      ]
    },
    "layout": {
      "contentSize": "1200px",
      "wideSize": "1400px"
    }
  },
  "styles": {
    "color": {
      "background": "var(--wp--preset--color--white)",
      "text": "var(--wp--preset--color--black)"
    },
    "typography": {
      "fontFamily": "var(--wp--preset--font-family--montserrat)",
      "fontSize": "var(--wp--preset--font-size--normal)",
      "fontWeight": "var(--wp--preset--font-weight--normal)",
      "lineHeight": "1.6"
    },
    "elements": {
      "h1": {
        "typography": {
          "fontSize": "var(--wp--preset--font-size--xxx-large)",
          "fontWeight": "var(--wp--preset--font-weight--bold)",
          "lineHeight": "1.2"
        }
      },
      "h2": {
        "typography": {
          "fontSize": "var(--wp--preset--font-size--xx-large)",
          "fontWeight": "var(--wp--preset--font-weight--bold)",
          "lineHeight": "1.25"
        }
      },
      "h3": {
        "typography": {
          "fontSize": "var(--wp--preset--font-size--x-large)",
          "fontWeight": "var(--wp--preset--font-weight--semibold)",
          "lineHeight": "1.3"
        }
      },
      "button": {
        "typography": {
          "fontSize": "var(--wp--preset--font-size--normal)",
          "fontWeight": "var(--wp--preset--font-weight--semibold)"
        },
        "spacing": {
          "padding": {
            "top": "0.75rem",
            "right": "1.5rem",
            "bottom": "0.75rem",
            "left": "1.5rem"
          }
        }
      }
    }
  }
}
```

---

## 🔌 FUNCTIONS.PHP

Registro de assets y configuración del theme:

```php
<?php
/**
 * Uhura Group 2026 Theme Functions
 */

// Enqueue styles and scripts
function uhura_enqueue_assets() {
    // Google Fonts
    wp_enqueue_style(
        'uhura-fonts',
        'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap',
        [],
        null
    );

    // Theme foundations
    wp_enqueue_style(
        'uhura-foundations',
        get_template_directory_uri() . '/assets/css/foundations.css',
        [],
        '1.0.0'
    );

    // Components CSS
    wp_enqueue_style(
        'uhura-components',
        get_template_directory_uri() . '/assets/css/components.css',
        ['uhura-foundations'],
        '1.0.0'
    );

    // Main theme style
    wp_enqueue_style(
        'uhura-style',
        get_stylesheet_uri(),
        ['uhura-components'],
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'uhura_enqueue_assets');

// Theme support
function uhura_theme_support() {
    // Add theme support
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('editor-styles');
    add_theme_support('wp-block-styles');
    add_theme_support('align-wide');
    add_theme_support('responsive-embeds');

    // Register navigation menus
    register_nav_menus([
        'primary' => __('Primary Menu', 'uhura'),
        'footer' => __('Footer Menu', 'uhura'),
    ]);
}
add_action('after_setup_theme', 'uhura_theme_support');

// Register Gutenberg blocks
function uhura_register_blocks() {
    $blocks = [
        'hero',
        'service-card',
        'partners-grid',
        'icon-card',
    ];

    foreach ($blocks as $block) {
        register_block_type(
            get_template_directory() . '/blocks/' . $block
        );
    }
}
add_action('init', 'uhura_register_blocks');
```

---

## 🧱 EJEMPLO: HERO BLOCK

### blocks/hero/block.json

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 2,
  "name": "uhura/hero",
  "title": "Hero Section",
  "category": "uhura-blocks",
  "icon": "cover-image",
  "description": "Hero section with gradient background and CTA",
  "keywords": ["hero", "header", "banner"],
  "supports": {
    "align": ["wide", "full"],
    "html": false
  },
  "attributes": {
    "variant": {
      "type": "string",
      "default": "gradient",
      "enum": ["gradient", "purple", "image"]
    },
    "badge": {
      "type": "string",
      "default": ""
    },
    "title": {
      "type": "string",
      "default": ""
    },
    "subtitle": {
      "type": "string",
      "default": ""
    },
    "ctaText": {
      "type": "string",
      "default": "Ver más"
    },
    "ctaUrl": {
      "type": "string",
      "default": "#"
    },
    "backgroundImage": {
      "type": "string",
      "default": ""
    }
  },
  "textdomain": "uhura",
  "editorScript": "file:./edit.js",
  "editorStyle": "file:./editor.css",
  "style": "file:./style.css"
}
```

### blocks/hero/edit.js

```jsx
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    RichText,
    MediaUpload,
} from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    TextControl,
    Button,
} from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
    const { variant, badge, title, subtitle, ctaText, ctaUrl, backgroundImage } = attributes;

    const blockProps = useBlockProps({
        className: `uhura-hero uhura-hero--${variant}`,
    });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Hero Settings', 'uhura')}>
                    <SelectControl
                        label={__('Variant', 'uhura')}
                        value={variant}
                        options={[
                            { label: 'Gradient', value: 'gradient' },
                            { label: 'Purple', value: 'purple' },
                            { label: 'Image', value: 'image' },
                        ]}
                        onChange={(value) => setAttributes({ variant: value })}
                    />

                    {variant === 'image' && (
                        <MediaUpload
                            onSelect={(media) => setAttributes({ backgroundImage: media.url })}
                            type="image"
                            value={backgroundImage}
                            render={({ open }) => (
                                <Button onClick={open} isPrimary>
                                    {__('Select Background Image', 'uhura')}
                                </Button>
                            )}
                        />
                    )}

                    <TextControl
                        label={__('Badge Text', 'uhura')}
                        value={badge}
                        onChange={(value) => setAttributes({ badge: value })}
                    />

                    <TextControl
                        label={__('CTA URL', 'uhura')}
                        value={ctaUrl}
                        onChange={(value) => setAttributes({ ctaUrl: value })}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                {variant === 'image' && backgroundImage && (
                    <div className="uhura-hero__background">
                        <img src={backgroundImage} alt="" />
                    </div>
                )}

                <div className="uhura-hero__content">
                    {badge && (
                        <span className="uhura-badge uhura-badge--neon">
                            {badge}
                        </span>
                    )}

                    <RichText
                        tagName="h1"
                        value={title}
                        onChange={(value) => setAttributes({ title: value })}
                        placeholder={__('Hero Title', 'uhura')}
                    />

                    <RichText
                        tagName="p"
                        value={subtitle}
                        onChange={(value) => setAttributes({ subtitle: value })}
                        placeholder={__('Hero Subtitle', 'uhura')}
                        className="uhura-hero__subtitle"
                    />

                    <TextControl
                        value={ctaText}
                        onChange={(value) => setAttributes({ ctaText: value })}
                        placeholder={__('CTA Text', 'uhura')}
                    />
                </div>
            </div>
        </>
    );
}
```

### blocks/hero/save.js

```jsx
import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function Save({ attributes }) {
    const { variant, badge, title, subtitle, ctaText, ctaUrl, backgroundImage } = attributes;

    const blockProps = useBlockProps.save({
        className: `uhura-hero uhura-hero--${variant}`,
    });

    return (
        <section {...blockProps}>
            {variant === 'image' && backgroundImage && (
                <div className="uhura-hero__background">
                    <img src={backgroundImage} alt="" />
                    <div className="uhura-hero__overlay"></div>
                </div>
            )}

            <div className="uhura-hero__content container">
                {badge && (
                    <span className="uhura-badge uhura-badge--neon uhura-badge--lg">
                        {badge}
                    </span>
                )}

                <RichText.Content tagName="h1" value={title} />

                {subtitle && (
                    <RichText.Content
                        tagName="p"
                        value={subtitle}
                        className="uhura-hero__subtitle"
                    />
                )}

                {ctaText && (
                    <a
                        href={ctaUrl}
                        className="uhura-button uhura-button--secondary uhura-button--lg"
                    >
                        {ctaText}
                    </a>
                )}
            </div>
        </section>
    );
}
```

### blocks/hero/style.css

```css
.uhura-hero {
    position: relative;
    min-height: 500px;
    overflow: hidden;
    padding: var(--wp--preset--spacing--20) var(--wp--preset--spacing--6);
    display: flex;
    align-items: center;
}

.uhura-hero--gradient {
    background: linear-gradient(135deg, #8945f0 0%, #501f92 50%, #6dd5ed 100%);
    color: white;
}

.uhura-hero--purple {
    background-color: var(--wp--preset--color--uhura-purple-medium);
    color: white;
}

.uhura-hero--image {
    position: relative;
}

.uhura-hero__background {
    position: absolute;
    inset: 0;
    z-index: 0;
}

.uhura-hero__background img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.4;
}

.uhura-hero__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(137, 69, 240, 0.9) 0%, rgba(80, 31, 146, 0.8) 50%, rgba(109, 213, 237, 0.7) 100%);
}

.uhura-hero__content {
    position: relative;
    z-index: 10;
    max-width: 900px;
}

.uhura-hero h1 {
    margin-bottom: var(--wp--preset--spacing--6);
    font-size: var(--wp--preset--font-size--xxx-large);
    font-weight: var(--wp--preset--font-weight--bold);
    line-height: 1.2;
}

.uhura-hero__subtitle {
    font-size: var(--wp--preset--font-size--large);
    margin-bottom: var(--wp--preset--spacing--8);
    opacity: 0.9;
}

.uhura-badge {
    display: inline-block;
    margin-bottom: var(--wp--preset--spacing--8);
}

@media (max-width: 768px) {
    .uhura-hero h1 {
        font-size: var(--wp--preset--font-size--xx-large);
    }
}
```

---

## 🎨 COMPONENTES CSS

### assets/css/components.css

```css
/* ===========================
   UHURA COMPONENTS LIBRARY
   =========================== */

/* Button Component */
.uhura-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--wp--preset--font-family--montserrat);
    font-weight: var(--wp--preset--font-weight--semibold);
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: all 200ms ease;
}

.uhura-button--primary {
    background-color: var(--wp--preset--color--uhura-purple-medium);
    color: white;
    box-shadow: var(--shadow-md);
}

.uhura-button--primary:hover {
    background-color: var(--wp--preset--color--uhura-purple-primary);
    box-shadow: var(--shadow-lg);
}

.uhura-button--secondary {
    background-color: var(--wp--preset--color--uhura-neon-yellow);
    color: var(--wp--preset--color--black);
    box-shadow: var(--shadow-md);
}

.uhura-button--secondary:hover {
    background-color: #d4f050;
    box-shadow: var(--shadow-lg);
}

.uhura-button--ghost {
    background-color: transparent;
    color: var(--wp--preset--color--uhura-purple-medium);
}

.uhura-button--ghost:hover {
    background-color: rgba(193, 161, 255, 0.2);
}

.uhura-button--sm {
    padding: 0.5rem 1rem;
    font-size: var(--wp--preset--font-size--small);
    border-radius: 0.5rem;
}

.uhura-button--md {
    padding: 0.75rem 1.5rem;
    font-size: var(--wp--preset--font-size--normal);
    border-radius: 0.75rem;
}

.uhura-button--lg {
    padding: 1rem 2rem;
    font-size: var(--wp--preset--font-size--large);
    border-radius: 1rem;
}

/* Badge Component */
.uhura-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--wp--preset--font-weight--bold);
    border-radius: 9999px;
    white-space: nowrap;
}

.uhura-badge--neon {
    background-color: var(--wp--preset--color--uhura-neon-yellow);
    color: var(--wp--preset--color--black);
}

.uhura-badge--purple {
    background-color: var(--wp--preset--color--uhura-purple-medium);
    color: white;
}

.uhura-badge--sm {
    padding: 0.25rem 0.75rem;
    font-size: var(--wp--preset--font-size--small);
}

.uhura-badge--md {
    padding: 0.5rem 1.5rem;
    font-size: var(--wp--preset--font-size--normal);
}

.uhura-badge--lg {
    padding: 0.75rem 2rem;
    font-size: var(--wp--preset--font-size--large);
}

/* Card Component */
.uhura-card {
    border-radius: 1rem;
    transition: all 300ms ease;
}

.uhura-card--default {
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: var(--shadow-md);
}

.uhura-card--purple {
    background-color: var(--wp--preset--color--uhura-purple-medium);
    color: white;
    box-shadow: var(--shadow-lg);
}

.uhura-card--gradient {
    background: linear-gradient(135deg, #8945f0 0%, #501f92 100%);
    color: white;
    box-shadow: var(--shadow-xl);
}

.uhura-card--hover:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
}

/* Utility: Container */
.container {
    width: 100%;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--wp--preset--spacing--6);
    padding-right: var(--wp--preset--spacing--6);
}

/* Utility: Text accent italic */
.text-accent-italic {
    font-family: var(--wp--preset--font-family--plus-jakarta);
    font-style: italic;
    font-weight: var(--wp--preset--font-weight--medium);
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Phase 1: Setup
- [ ] Crear estructura de carpetas del theme
- [ ] Copiar `theme.json` con todos los tokens
- [ ] Configurar `functions.php` con enqueues
- [ ] Importar Google Fonts

### Phase 2: Assets
- [ ] Copiar `foundations.css` (variables CSS)
- [ ] Copiar `components.css` (estilos de componentes)
- [ ] Configurar build process (si usas React/JSX)

### Phase 3: Blocks
- [ ] Crear Hero Block
- [ ] Crear Service Card Block
- [ ] Crear Partners Grid Block
- [ ] Crear Icon Card Block
- [ ] Testear todos los blocks en el editor

### Phase 4: Templates
- [ ] Crear template de Landing Page
- [ ] Crear template de Página Corporativa
- [ ] Crear template de Blog
- [ ] Header y Footer templates

### Phase 5: Testing
- [ ] Responsive testing (mobile, tablet, desktop)
- [ ] Cross-browser testing
- [ ] Accesibilidad (WCAG 2.1 AA)
- [ ] Performance (Lighthouse > 90)
- [ ] Gutenberg editor experience

---

## 📚 RECURSOS

- [WordPress Block Editor Handbook](https://developer.wordpress.org/block-editor/)
- [Theme.json Documentation](https://developer.wordpress.org/block-editor/how-to-guides/themes/theme-json/)
- [Gutenberg Components](https://wordpress.github.io/gutenberg/)

---

**Última actualización:** Abril 2026
