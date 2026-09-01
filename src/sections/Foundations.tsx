import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Copy, Check, Info, Sparkles, Type, Grid, Sliders, Waves } from 'lucide-react';

export const Foundations: React.FC = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [grainIntensity, setGrainIntensity] = useState<'none' | 'soft' | 'analog'>('analog');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // UNIFIED TOKENS FROM UHURA 2026 WEB SYSTEM
  const primaryColors = [
    { name: 'Uhura Dark (Base)', hex: '#090513', variable: '--uhura-dark', role: 'Fondo oscuro principal del sitio, profundidad máxima', textDark: false },
    { name: 'Uhura Panel', hex: '#140b24', variable: '--uhura-panel', role: 'Superficie de tarjetas y paneles oscuros elevados', textDark: false },
    { name: 'Uhura Ink', hex: '#17131f', variable: '--uhura-ink', role: 'Texto oscuro sobre fondos claros, tintes de alto contraste', textDark: false },
    { name: 'Uhura Purple (Brand)', hex: '#501f92', variable: '--uhura-purple', role: 'Púrpura insignia, gradientes y fondos de marca', textDark: false },
    { name: 'Uhura Violet (Vibrant)', hex: '#8a4dff', variable: '--uhura-violet', role: 'CTA claro, enlaces interactivos y resplandores', textDark: false },
    { name: 'Uhura Lavender (Soft)', hex: '#c9b7ff', variable: '--uhura-lavender', role: 'Texto secundario en dark mode, bordes sutiles', textDark: true },
  ];

  const secondaryColors = [
    { name: 'Uhura Lime (CTA Key)', hex: '#d4ff4a', variable: '--uhura-lime', role: 'Botón CTA en dark mode, métricas y badges críticos (Max 15%)', textDark: true },
    { name: 'Uhura Cyan', hex: '#4be5ff', variable: '--uhura-cyan', role: 'Acentos tecnológicos, badges de estado e iluminación (Max 15%)', textDark: true },
    { name: 'Uhura Blue', hex: '#4f7dff', variable: '--uhura-blue', role: 'Acentos corporativos y transiciones de gradiente (Max 15%)', textDark: false },
    { name: 'Uhura Pink Accent', hex: '#cd79e8', variable: '--uhura-pink', role: 'Badges especiales y degradados mesh (Max 15%)', textDark: false },
    { name: 'Uhura Light Surface', hex: '#f2ecfb', variable: '--uhura-light', role: 'Fondos de paneles claros con tinte lavanda sutil', textDark: true },
    { name: 'Uhura Light 2 (Sky)', hex: '#eaf5ff', variable: '--uhura-light-2', role: 'Variante clara con tinte cian para contrastes', textDark: true },
  ];

  // 6 OFFICIAL 2026 GRADIENTS ENHANCED WITH AUTHENTIC MULTI-POINT AURORA & PRESERVING SURFACE LIGHT
  const gradients = [
    {
      id: 'violet-mono',
      name: '1. Gradient Violet Deep (Slide 4)',
      css: 'radial-gradient(140% 120% at 50% 20%, #8b45ff 0%, #6f26d9 35%, #501f92 70%, #340c66 100%)',
      desc: 'Violeta vibrante y etéreo con halo de luz superior suave, sin bandas marcadas.',
      tag: 'Brand Core (Slide 4)',
      slideRef: 'Slide 4',
    },
    {
      id: 'aurora-lime-cyan',
      name: '2. Aurora Multi-Mesh Vibrante (Slide 6)',
      css: 'radial-gradient(110% 110% at -5% 105%, #d4ff4a 0%, #76ef6b 25%, #2ad0ca 45%, transparent 75%), radial-gradient(120% 120% at 10% 15%, #38e1ff 0%, #3b82f6 40%, transparent 80%), radial-gradient(130% 130% at 105% -5%, #a855f7 0%, #7c3aed 45%, transparent 80%), radial-gradient(120% 120% at 105% 105%, #6d28d9 0%, #4c1d95 60%, transparent 80%), #4755f5',
      desc: 'Degradado fluido continuo: el Lime inferior izquierdo se diluye suavemente en un Cyan amplio que se funde sin cortes en el Violeta e Índigo superior.',
      tag: 'Aurora Keynote (Slide 6)',
      slideRef: 'Slide 6',
    },
    {
      id: 'aurora-soft-pastel',
      name: '3. Aurora Soft Glow (Slide 8)',
      css: 'radial-gradient(100% 100% at -5% 105%, #d4ff4a 0%, #6ee7b7 30%, #38bdf8 55%, transparent 80%), radial-gradient(120% 120% at 105% 95%, #e879f9 0%, #c084fc 35%, #818cf8 65%, transparent 85%), radial-gradient(120% 120% at 85% 0%, #7e22ce 0%, #6366f1 50%, transparent 85%), radial-gradient(100% 100% at 20% 30%, #38e1ff 0%, #60a5fa 45%, transparent 80%), #501f92',
      desc: 'Atmósfera difusa y luminosa con transición sedosa entre Lime (#d4ff4a), Cyan etéreo, núcleo Índigo y suave resplandor Magenta/Lavanda (#e879f9) a la derecha.',
      tag: 'Soft Aurora (Slide 8)',
      slideRef: 'Slide 8',
    },
    {
      id: 'deep-mesh-cyan',
      name: '4. Deep Cosmic Glow (Slide 11)',
      css: 'radial-gradient(130% 90% at 50% -15%, rgba(42, 10, 80, 0.6) 0%, rgba(60, 18, 116, 0.3) 25%, transparent 60%), radial-gradient(110% 110% at -10% 110%, rgba(228, 255, 110, 0.95) 0%, rgba(180, 252, 106, 0.75) 20%, rgba(94, 234, 212, 0.45) 45%, transparent 70%), radial-gradient(120% 120% at 110% 110%, rgba(6, 182, 212, 0.9) 0%, rgba(14, 165, 233, 0.8) 25%, rgba(59, 130, 246, 0.6) 50%, rgba(99, 102, 241, 0.3) 75%, transparent 90%), radial-gradient(130% 130% at -5% -5%, rgba(216, 180, 254, 0.85) 0%, rgba(192, 132, 252, 0.7) 25%, rgba(168, 85, 247, 0.45) 50%, transparent 80%), radial-gradient(140% 140% at 90% 30%, rgba(76, 29, 149, 0.95) 0%, rgba(67, 56, 202, 0.75) 40%, transparent 85%), radial-gradient(160% 160% at 45% 45%, #7e22ce 0%, #6b21a8 30%, #581c87 60%, #3b0764 100%)',
      desc: 'Nube de color difusa y sedosa con inicio sutil en violeta profundo en la parte superior que transiciona hacia el violeta central, conservando el resplandor lavanda, el destello lima y el cian inferior.',
      tag: 'Cosmic Contrast (Slide 11)',
      slideRef: 'Slide 11',
    },
    {
      id: 'holographic-flow',
      name: '5. Gradient Holographic Flow',
      css: 'linear-gradient(135deg, #8a4dff 0%, #4be5ff 45%, #d4ff4a 100%)',
      desc: 'Para elementos interactivos premium, badges de innovación tecnológica y bordes con iluminación.',
      tag: 'Highlights & CTAs',
      slideRef: 'System Core',
    },
    {
      id: 'surface',
      name: '6. Gradient Surface Light',
      css: 'linear-gradient(180deg, #f2ecfb 0%, #ffffff 100%)',
      desc: 'Para fondos sutiles con relieve vertical en secciones claras.',
      tag: 'Secciones Claras',
      slideRef: 'Oficial Inalterado',
    },
  ];

  const typographyScale = [
    { tag: 'Display (H1 Home)', size: 'clamp(34px, 4.1vw, 56px)', weight: '800 (ExtraBold)', leading: '1.06', sample: 'Uhura Group 2026', usage: 'H1 exclusivo de la Homepage' },
    { tag: 'Page (H1 Subpáginas)', size: 'clamp(36px, 4vw, 54px)', weight: '800 (ExtraBold)', leading: '1.04', sample: 'Arquitectura & Design System', usage: 'H1 para páginas secundarias (Nosotros, Casos)' },
    { tag: 'Section (H2)', size: 'clamp(30px, 3.2vw, 44px)', weight: '700 (Bold)', leading: '1.08', sample: 'Foundations & Tokens Canónicos', usage: 'Títulos de sección principal' },
    { tag: 'Subsection (H3)', size: 'clamp(25px, 2.4vw, 34px)', weight: '700 (Bold)', leading: '1.14', sample: 'Componentes y Variantes', usage: 'Subsecciones intermedias' },
    { tag: 'Card (H4)', size: 'clamp(18px, 1.55vw, 24px)', weight: '700 (Bold)', leading: '1.16', sample: 'Liquid Glass Sandbox', usage: 'Títulos dentro de tarjetas y sidebars' },
    { tag: 'Metric / KPI', size: 'clamp(34px, 4vw, 58px)', weight: '800 (ExtraBold)', leading: '1.0', sample: '+380%', usage: 'Cifras y métricas con acento Lime' },
    { tag: 'Body Large', size: 'clamp(17px, 1.3vw, 19px)', weight: '500 (Medium)', leading: '1.72', sample: 'El diseño digital requiere consistencia estricta en cada interacción.', usage: 'Párrafos de introducción y lead' },
    { tag: 'Body Standard', size: 'clamp(16px, 1.2vw, 18px)', weight: '400 (Regular)', leading: '1.68', sample: 'Texto secundario, descripciones y documentación de soporte.', usage: 'Cuerpo de texto principal' },
    { tag: 'Small / Caption', size: '13px / 12px', weight: '400 (Regular)', leading: '1.6', sample: 'Notas técnicas, metadatos y tooltips del sistema.', usage: 'Microcopy y etiquetas' },
  ];

  const spacingScale = [
    { token: 'space-1', px: '4px', usage: 'Gaps mínimos entre iconos y texto' },
    { token: 'space-2', px: '8px', usage: 'Padding interno de badges, micro spacing' },
    { token: 'space-3', px: '12px', usage: 'Gaps entre elementos inline' },
    { token: 'space-4', px: '16px', usage: 'Padding de botones estándar, gap en inputs' },
    { token: 'space-6', px: '24px', usage: 'Padding de tarjetas y cards' },
    { token: 'space-8', px: '32px', usage: 'Separación entre bloques dentro de sección' },
    { token: 'space-10', px: '64px', usage: 'Separación entre secciones estándar' },
    { token: 'space-12', px: '96px', usage: 'Padding vertical en hero desktop' },
  ];

  return (
    <div className="space-y-16">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="purple" size="sm">Foundations</Badge>
          <span className="text-xs text-[#c9b7ff] font-medium">Core Brand System 2026 Unificado</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17131f] tracking-tight mb-3">
          Bases Visuales & Tokens Canónicos
        </h1>
        <p className="text-sm sm:text-base text-[#616161] max-w-3xl leading-relaxed">
          Estructura de color cerrada con la paleta de producción de Uhura 2026: Púrpuras primarios (<code className="text-xs bg-[#501f92]/10 text-[#501f92] px-1 py-0.5 rounded font-mono">#501f92</code> / <code className="text-xs bg-[#8a4dff]/10 text-[#8a4dff] px-1 py-0.5 rounded font-mono">#8a4dff</code>), acento Lime para CTAs en dark mode (<code className="text-xs bg-[#d4ff4a]/20 text-[#17131f] px-1 py-0.5 rounded font-mono">#d4ff4a</code>), tipografía Montserrat + Playfair Display y escala fluida.
        </p>
      </div>

      {/* 1. COLOR PALETTE */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e0e0]">
          <div>
            <h2 className="text-2xl font-extrabold text-[#17131f] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#8a4dff]" />
              Paleta Principal de Marca (Uhura Foundation)
            </h2>
            <p className="text-xs text-[#616161]">
              Colores nucleares de fondo, profundidad y tipografía del sitio web y aplicaciones.
            </p>
          </div>
          <Badge variant="purple" size="sm">Tokens Nucleares</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {primaryColors.map((color) => (
            <div
              key={color.variable}
              className="bg-white rounded-2xl border border-[#e0e0e0] overflow-hidden shadow-xs hover:border-[#8a4dff] transition-all duration-150 group"
            >
              <div
                className="h-28 p-4 flex flex-col justify-between transition-transform duration-150 group-hover:scale-[1.02]"
                style={{ backgroundColor: color.hex }}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${color.textDark ? 'text-[#17131f]' : 'text-white'}`}>
                    {color.name}
                  </span>
                  <button
                    onClick={() => copyToClipboard(color.hex, color.name)}
                    className={`p-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
                      color.textDark
                        ? 'bg-black/10 hover:bg-black/20 text-[#17131f]'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                    title="Copiar código HEX"
                  >
                    {copiedText === color.name ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`font-bold ${color.textDark ? 'text-[#17131f]' : 'text-white'}`}>{color.hex}</span>
                  <span className={`text-[10px] opacity-80 ${color.textDark ? 'text-[#17131f]' : 'text-white'}`}>{color.variable}</span>
                </div>
              </div>
              <div className="p-3.5 bg-white">
                <p className="text-xs text-[#616161] leading-snug">{color.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Palette */}
        <div className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e0e0]">
            <div>
              <h2 className="text-2xl font-extrabold text-[#17131f] flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#d4ff4a]" />
                Colores de Acento & Superficies (Máximo 15% cada uno)
              </h2>
              <p className="text-xs text-[#616161]">
                <strong>Regla estricta:</strong> Usar como llamadas a la acción, KPIs y badges. Nunca superar el 15% del viewport.
              </p>
            </div>
            <Badge variant="neon" size="sm">Max 15% Acentos</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {secondaryColors.map((color) => (
              <div
                key={color.variable}
                className="bg-white rounded-2xl border border-[#e0e0e0] overflow-hidden shadow-xs hover:border-[#8a4dff] transition-all duration-150 group"
              >
                <div
                  className="h-28 p-4 flex flex-col justify-between transition-transform duration-150 group-hover:scale-[1.02]"
                  style={{ backgroundColor: color.hex }}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${color.textDark ? 'text-[#17131f]' : 'text-white'}`}>
                      {color.name}
                    </span>
                    <button
                      onClick={() => copyToClipboard(color.hex, color.name)}
                      className={`p-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
                        color.textDark
                          ? 'bg-black/10 hover:bg-black/20 text-[#17131f]'
                          : 'bg-white/20 hover:bg-white/30 text-white'
                      }`}
                      title="Copiar HEX"
                    >
                      {copiedText === color.name ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`font-bold ${color.textDark ? 'text-[#17131f]' : 'text-white'}`}>{color.hex}</span>
                    <span className={`text-[10px] opacity-80 ${color.textDark ? 'text-[#17131f]' : 'text-white'}`}>{color.variable}</span>
                  </div>
                </div>
                <div className="p-3.5 bg-white">
                  <p className="text-xs text-[#616161] leading-snug">{color.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. THE 6 OFFICIAL GRADIENTS WITH FILM NOISE TEXTURE */}
      <section className="space-y-6 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e0e0]">
          <div>
            <h2 className="text-2xl font-extrabold text-[#17131f] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8a4dff]" />
              Los 6 Gradientes Oficiales 2026 & Malla Granular
            </h2>
            <p className="text-xs text-[#616161]">
              Degradados radiales y de malla orgánica fiel a los Keynotes 2026 de Uhura con emulación de textura de grano (Film Grain Noise).
            </p>
          </div>

          {/* Granularity / Noise Texture Controller */}
          <div className="flex items-center gap-2 bg-[#f2ecfb] p-1.5 rounded-2xl border border-[#8a4dff]/20">
            <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-[#501f92]">
              <Waves className="w-3.5 h-3.5" />
              <span>Granulosidad:</span>
            </div>
            <div className="flex items-center bg-white rounded-xl p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setGrainIntensity('none')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  grainIntensity === 'none'
                    ? 'bg-[#501f92] text-white shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Liso
              </button>
              <button
                type="button"
                onClick={() => setGrainIntensity('soft')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  grainIntensity === 'soft'
                    ? 'bg-[#501f92] text-white shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Soft
              </button>
              <button
                type="button"
                onClick={() => setGrainIntensity('analog')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  grainIntensity === 'analog'
                    ? 'bg-[#501f92] text-white shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                Film Grain
              </button>
            </div>
          </div>
        </div>

        {/* SVG Noise Filter Asset Definition (Embedded lightweight) */}
        <svg className="hidden" aria-hidden="true">
          <filter id="uhuraNoiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={grainIntensity === 'soft' ? '0.65' : '0.85'}
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.5" />
              <feFuncG type="linear" slope="1.5" />
              <feFuncB type="linear" slope="1.5" />
            </feComponentTransfer>
          </filter>
        </svg>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gradients.map((grad) => {
            const isLight = grad.id === 'surface';
            return (
              <div
                key={grad.id}
                className="rounded-2xl overflow-hidden border border-[#e0e0e0] shadow-sm bg-white flex flex-col justify-between"
              >
                <div
                  className="h-48 p-5 flex flex-col justify-between relative shadow-inner overflow-hidden"
                  style={{ background: grad.css }}
                >
                  {/* Film Grain Texture Layer with High Visibility SVG grain */}
                  {grainIntensity !== 'none' && grad.id !== 'surface' && (
                    <>
                      <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300 bg-repeat"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                          opacity: grainIntensity === 'soft' ? 0.22 : 0.38,
                          mixBlendMode: 'overlay',
                        }}
                      />
                      <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                        style={{
                          filter: 'url(#uhuraNoiseFilter)',
                          opacity: grainIntensity === 'soft' ? 0.15 : 0.28,
                          mixBlendMode: 'color-dodge',
                        }}
                      />
                    </>
                  )}

                  <div className="flex items-center justify-between relative z-10">
                    <Badge variant="glass" size="xs">{grad.tag}</Badge>
                    <button
                      onClick={() => copyToClipboard(grad.css, grad.name)}
                      className={`p-1.5 rounded-lg backdrop-blur-md transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                        isLight
                          ? 'bg-[#501f92]/10 hover:bg-[#501f92]/20 text-[#501f92]'
                          : 'bg-black/30 hover:bg-black/50 text-white'
                      }`}
                    >
                      {copiedText === grad.name ? <Check className="w-3.5 h-3.5 text-[#d4ff4a]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar CSS</span>
                    </button>
                  </div>
                  <div className="relative z-10">
                    <h3 className={`text-base sm:text-lg font-bold drop-shadow-xs ${isLight ? 'text-[#17131f]' : 'text-white'}`}>
                      {grad.name}
                    </h3>
                  </div>
                </div>
                <div className="p-4 bg-white space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#616161] leading-relaxed">{grad.desc}</p>
                  </div>
                  <code className="text-[10px] font-mono text-[#501f92] bg-[#f2ecfb] p-2.5 rounded-xl block overflow-x-auto whitespace-pre-wrap border border-[#8a4dff]/15">
                    {grad.css}
                  </code>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. TYPOGRAPHY */}
      <section className="space-y-6 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e0e0]">
          <div>
            <h2 className="text-2xl font-extrabold text-[#17131f] flex items-center gap-2">
              <Type className="w-5 h-5 text-[#8a4dff]" />
              Arquitectura Tipográfica Unificada 2026
            </h2>
            <p className="text-xs text-[#616161]">
              Diferenciación estratégica entre la narrativa web/branding y la densidad de interfaz del software SaaS (Orbit).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="purple" size="sm">Montserrat (Web)</Badge>
            <Badge variant="cyan" size="sm">Plus Jakarta Sans (Orbit SaaS)</Badge>
            <Badge variant="subtle" size="sm">Playfair Display (Énfasis)</Badge>
          </div>
        </div>

        {/* Callout Grid: Web vs SaaS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#501f92]/5 border border-[#8a4dff]/30 space-y-2 text-xs text-[#501f92]">
            <div className="flex items-center gap-2 font-bold text-sm text-[#17131f]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8a4dff]" />
              <span>1. Ecosistema Web & Marketing</span>
            </div>
            <p className="text-[#616161] leading-relaxed">
              <strong>Montserrat (95%)</strong> para títulos de gran escala, botones y cuerpo general. <strong>Playfair Display Italic (5%)</strong> exclusivamente para palabras clave de acento editorial.
            </p>
            <div className="pt-2 border-t border-[#8a4dff]/20 font-mono text-[11px] text-[#501f92]">
              font-family: 'Montserrat', system-ui;
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#d4ff4a]/10 border border-[#d4ff4a]/40 space-y-2 text-xs text-[#17131f]">
            <div className="flex items-center gap-2 font-bold text-sm text-[#17131f]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span>2. Orbit Platform (SaaS Exception)</span>
            </div>
            <p className="text-[#616161] leading-relaxed">
              <strong>Plus Jakarta Sans</strong> (con fallback a <strong>Inter</strong>) para UI de alta densidad, tablas financieras, badges, semáforos y métricas con <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded border border-[#d4ff4a]/50">tabular-nums</code>.
            </p>
            <div className="pt-2 border-t border-[#d4ff4a]/40 font-mono text-[11px] text-[#17131f]">
              font-family: 'Plus Jakarta Sans', 'Inter', system-ui;
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e0e0e0] overflow-hidden shadow-xs">
          <div className="divide-y divide-[#e0e0e0]">
            {typographyScale.map((item, idx) => (
              <div key={idx} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#fafafa] transition-colors">
                <div className="md:w-1/3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8a4dff] bg-[#8a4dff]/10 px-2 py-0.5 rounded">
                      {item.tag}
                    </span>
                    <span className="text-[11px] font-mono text-[#757575]">{item.size}</span>
                  </div>
                  <span className="text-[11px] text-[#616161] block mt-1">{item.weight} · Line {item.leading}</span>
                </div>

                <div className="md:w-1/2">
                  <div
                    style={{
                      fontSize: idx === 0 ? '36px' : idx === 1 ? '32px' : idx === 2 ? '26px' : idx === 5 ? '34px' : '16px',
                      lineHeight: item.leading,
                      fontWeight: parseInt(item.weight.split(' ')[0]) || 600,
                    }}
                    className={`truncate ${idx === 5 ? 'text-[#8a4dff] font-extrabold' : 'text-[#17131f]'}`}
                  >
                    {item.sample}
                  </div>
                </div>

                <div className="md:w-1/4 text-right">
                  <span className="text-xs text-[#616161]">{item.usage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 4PT SPACING SCALE */}
      <section className="space-y-6 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e0e0]">
          <div>
            <h2 className="text-2xl font-extrabold text-[#17131f] flex items-center gap-2">
              <Grid className="w-5 h-5 text-[#8a4dff]" />
              Sistema de Espaciado 4pt Canónico
            </h2>
            <p className="text-xs text-[#616161]">
              Todos los márgenes, paddings y gaps deben ser múltiplos estrictos de 4px.
            </p>
          </div>
          <Badge variant="purple" size="sm">Base 4px</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {spacingScale.map((space) => (
            <div key={space.token} className="p-3.5 bg-white rounded-xl border border-[#e0e0e0] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#8a4dff]">{space.token}</span>
                <span className="text-xs font-mono font-semibold text-[#17131f]">{space.px}</span>
              </div>
              <div className="h-4 bg-[#8a4dff]/10 rounded flex items-center mb-2 overflow-hidden">
                <div
                  className="h-full bg-[#8a4dff] rounded"
                  style={{ width: `${Math.min(parseInt(space.px) * 1.5, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#616161] leading-tight">{space.usage}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
