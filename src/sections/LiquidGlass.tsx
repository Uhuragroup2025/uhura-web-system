import React, { useState } from 'react';
import { GlassVariant, GlassBlur, GlassGlow } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Layers
} from 'lucide-react';

export const LiquidGlass: React.FC = () => {
  const [selectedBg, setSelectedBg] = useState<'dark' | 'hero' | 'mesh' | 'panel' | 'light'>('dark');
  const [glassVariant, setGlassVariant] = useState<GlassVariant>('dark');
  const [glassBlur, setGlassBlur] = useState<GlassBlur>('md');
  const [glassGlow, setGlassGlow] = useState<GlassGlow>('purple');
  const [enableHover, setEnableHover] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Background visual styles
  const getBackgroundStyle = () => {
    switch (selectedBg) {
      case 'dark':
        return { backgroundColor: '#090513' };
      case 'hero':
        return { background: 'linear-gradient(135deg, #090513 0%, #140b24 50%, #501f92 100%)' };
      case 'mesh':
        return {
          backgroundColor: '#090513',
          backgroundImage:
            'radial-gradient(at 0% 0%, #501f92 0%, transparent 60%), radial-gradient(at 100% 100%, #8a4dff 0%, transparent 60%), radial-gradient(at 100% 0%, rgba(212, 255, 74, 0.25) 0%, transparent 30%), radial-gradient(at 0% 100%, rgba(75, 229, 255, 0.2) 0%, transparent 40%)',
        };
      case 'panel':
        return { backgroundColor: '#140b24' };
      case 'light':
        return { backgroundColor: '#f2ecfb' };
      default:
        return { backgroundColor: '#090513' };
    }
  };

  // Usability & Guardrail Analyzer
  const analyzeCombination = () => {
    const isLightBg = selectedBg === 'light';
    const isGlassOnLight = isLightBg && (glassVariant === 'light' || glassVariant === 'medium');
    const isDarkGlassOnLight = isLightBg && (glassVariant === 'dark' || glassVariant === 'purple');
    const isNeonGlowOnLight = isLightBg && glassGlow === 'neon';
    const isGoodDarkCombo = !isLightBg && (glassVariant === 'dark' || glassVariant === 'purple');

    if (isGlassOnLight) {
      return {
        status: 'prohibited',
        badge: '❌ COMBINACIÓN BLOQUEADA POR DESIGN SYSTEM (WCAG FAIL)',
        title: 'Vidrio Claro sobre Fondo Claro: Ilegible e Inutilizable',
        description:
          'El glass blanco sobre fondo claro pierde contraste óptico (ratio < 2.5:1), haciendo que los bordes y textos se vuelvan invisibles o deslavados. Las instrucciones del Design System prohíben estrictamente esta combinación; en fondos claros, la IA genera tarjetas sólidas blancas (#ffffff) con sombra suave.',
        canBeAssigned: false,
      };
    }

    if (isDarkGlassOnLight) {
      return {
        status: 'prohibited',
        badge: '❌ BLOQUEADA: Vidrio Oscuro sobre Fondo Claro',
        title: 'Vidrio Semitransparente sobre Fondo Claro',
        description:
          'Al superponer un vidrio semitransparente oscuro (#140b24) sobre un fondo claro, la mezcla cromática genera un tono lavanda pálido que destruye el contraste del texto blanco (ratio < 1.8:1). La IA NUNCA asignará esta combinación.',
        canBeAssigned: false,
      };
    }

    if (isNeonGlowOnLight) {
      return {
        status: 'warning',
        badge: '⚠️ RESPLANDOR NO PERMITIDO EN FONDO CLARO',
        title: 'Glow Neon sobre Fondo Claro',
        description:
          'El resplandor Lime (#d4ff4a) sobre fondos claros produce un halo amarillento sucio con bajo contraste. El resplandor ambiental solo está permitido en Dark Mode.',
        canBeAssigned: false,
      };
    }

    if (isGoodDarkCombo) {
      return {
        status: 'approved',
        badge: '✅ COMBINACIÓN CANÓNICA 100% APROBADA',
        title: 'Combinación Oficial Uhura 2026 (WCAG AA Compliant)',
        description:
          'Fondo oscuro profundo con tarjeta Liquid Glass, texto blanco/lavanda de alto contraste (> 7:1) y botón CTA contextual Lime (#d4ff4a). Esta es exactamente la combinación que la IA asignará automáticamente en landings, dashboards y componentes.',
        canBeAssigned: true,
      };
    }

    return {
      status: 'neutral',
      badge: 'ℹ️ COMBINACIÓN SECUNDARIA',
      title: 'Uso Condicional',
      description: 'Combinación de soporte con uso restringido a componentes secundarios.',
      canBeAssigned: true,
    };
  };

  const analysis = analyzeCombination();

  const glassLevels = [
    {
      level: 'Dark Glass (Canónico 2026)',
      opacity: 'Dark panel (rgba(20, 11, 36, 0.85))',
      blur: '24px (lg)',
      border: 'rgba(138, 77, 255, 0.25)',
      usage: 'Tarjetas principales sobre fondos oscuros (#090513 o mallas cósmicas)',
      variant: 'dark' as GlassVariant,
      recommendedOn: 'Fondos Dark, Hero, Mesh o Panel',
    },
    {
      level: 'Purple Glass',
      opacity: 'Purple deep (rgba(80, 31, 146, 0.50))',
      blur: '24px (lg)',
      border: 'rgba(201, 183, 255, 0.30)',
      usage: 'Tarjetas destacadas o de features clave con resplandor ambiental',
      variant: 'purple' as GlassVariant,
      recommendedOn: 'Fondos Dark o Hero',
    },
    {
      level: 'Light Glass (Solo sobre Hero Oscuro)',
      opacity: '70% white (rgba(255, 255, 255, 0.80))',
      blur: '16px (md)',
      border: 'rgba(255, 255, 255, 0.50)',
      usage: 'Exclusivamente sobre fondos de alto contraste (NUNCA sobre fondos claros)',
      variant: 'light' as GlassVariant,
      recommendedOn: 'Overlays sobre gradientes intensos',
    },
    {
      level: 'Medium Glass (Modales & Overlays)',
      opacity: '50% white (rgba(255, 255, 255, 0.60))',
      blur: '24px (lg)',
      border: 'rgba(255, 255, 255, 0.40)',
      usage: 'Modales de confirmación flotantes sobre fondos con desenfoque de fondo',
      variant: 'medium' as GlassVariant,
      recommendedOn: 'Backdrop overlays',
    },
  ];

  const generatedCode = `<GlassCard
  variant="${glassVariant}"
  blur="${glassBlur}"
  glow="${glassGlow}"
  hover={${enableHover}}
>
  <h3>Contenido en Liquid Glass 2026</h3>
  <p>Texto legible con desenfoque calibrado y contraste.</p>
</GlassCard>`;

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-16">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="purple" size="sm">Liquid Glass System</Badge>
          <span className="text-xs text-[#616161] font-medium">Gobernanza de Usabilidad & Reglas 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17131f] tracking-tight mb-3">
          Sistema de Vidrio Líquido & Guardrails
        </h1>
        <p className="text-sm sm:text-base text-[#616161] max-w-3xl leading-relaxed">
          Laboratorio óptico interactivo con validador de usabilidad en tiempo real. Comprueba qué combinaciones están formalmente aprobadas por el Design System y cuáles están bloqueadas para generación por IA por no cumplir con WCAG AA.
        </p>
      </div>

      {/* 1. INTERACTIVE GLASS SANDBOX */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e0e0] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e0e0]">
          <div>
            <h2 className="text-xl font-extrabold text-[#17131f] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#8a4dff]" />
              Laboratorio Interactivo de Vidrio & Validador de Reglas
            </h2>
            <p className="text-xs text-[#616161]">
              Modifica los parámetros para observar el comportamiento y comprobar si la IA tiene permitido asignarla en una landing.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={copyCode}
          >
            {copiedCode ? 'Código Copiado' : 'Copiar JSX'}
          </Button>
        </div>

        {/* Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Background Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#616161] block mb-2">
              Fondo de Prueba
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['dark', 'hero', 'mesh', 'panel', 'light'] as const).map((bg) => (
                <button
                  key={bg}
                  onClick={() => setSelectedBg(bg)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    selectedBg === bg
                      ? 'bg-[#501f92] text-white shadow-xs'
                      : 'bg-[#f5f5f5] text-[#616161] hover:bg-[#eeeeee]'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Glass Variant */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#616161] block mb-2">
              Nivel de Glass
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['dark', 'purple', 'light', 'medium'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setGlassVariant(v)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    glassVariant === v
                      ? 'bg-[#501f92] text-white shadow-xs'
                      : 'bg-[#f5f5f5] text-[#616161] hover:bg-[#eeeeee]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Blur Level */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#616161] block mb-2">
              Desenfoque (Blur)
            </label>
            <div className="grid grid-cols-4 gap-1">
              {(['sm', 'md', 'lg', 'xl'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setGlassBlur(b)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all cursor-pointer ${
                    glassBlur === b
                      ? 'bg-[#501f92] text-white shadow-xs'
                      : 'bg-[#f5f5f5] text-[#616161] hover:bg-[#eeeeee]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Glow Effect */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#616161] block mb-2">
              Efecto Glow
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['none', 'purple', 'cyan', 'neon'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGlassGlow(g)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    glassGlow === g
                      ? 'bg-[#501f92] text-white shadow-xs'
                      : 'bg-[#f5f5f5] text-[#616161] hover:bg-[#eeeeee]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Canvas Area */}
        <div
          style={getBackgroundStyle()}
          className="relative rounded-3xl min-h-[380px] p-8 sm:p-12 flex items-center justify-center transition-all duration-300 overflow-hidden border border-black/10 shadow-inner"
        >
          {/* Background ambient elements */}
          {selectedBg !== 'light' && (
            <>
              <div className="absolute top-6 left-10 w-32 h-32 rounded-full bg-[#8a4dff]/30 blur-2xl pointer-events-none" />
              <div className="absolute bottom-6 right-10 w-40 h-40 rounded-full bg-[#d4ff4a]/20 blur-2xl pointer-events-none" />
            </>
          )}

          {/* Rendered Glass Card */}
          <div className="w-full max-w-md relative z-10">
            <GlassCard
              variant={glassVariant}
              blur={glassBlur}
              glow={glassGlow}
              hover={enableHover}
              padding="lg"
            >
              <div className="flex items-center justify-between mb-4">
                <Badge
                  variant={glassVariant === 'light' || glassVariant === 'medium' ? 'purple' : 'neon'}
                  size="sm"
                >
                  {glassVariant.toUpperCase()} GLASS · {glassBlur.toUpperCase()} BLUR
                </Badge>
                {glassGlow !== 'none' && (
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      glassVariant === 'light' || glassVariant === 'medium'
                        ? 'bg-[#17131f]/10 text-[#17131f]'
                        : 'bg-black/40 text-[#c9b7ff]'
                    }`}
                  >
                    Glow {glassGlow}
                  </span>
                )}
              </div>

              <h3
                className={`text-xl font-extrabold mb-2 ${
                  glassVariant === 'dark' || glassVariant === 'purple' ? 'text-white' : 'text-[#17131f]'
                }`}
              >
                Uhura Liquid Glass Card
              </h3>

              <p
                className={`text-xs leading-relaxed mb-6 ${
                  glassVariant === 'dark' || glassVariant === 'purple' ? 'text-[#c9b7ff]' : 'text-[#616161]'
                }`}
              >
                Esta tarjeta se renderiza con opacidad calibrada y filtro de desenfoque óptico que asegura legibilidad sin causar reflows en el navegador.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/20">
                <span
                  className={`text-[11px] font-medium ${
                    glassVariant === 'dark' || glassVariant === 'purple' ? 'text-[#c9b7ff]' : 'text-[#757575]'
                  }`}
                >
                  Hover: {enableHover ? '1.02 scale' : 'Off'}
                </span>
                <Button
                  variant="primary"
                  contextTheme={glassVariant === 'dark' || glassVariant === 'purple' ? 'dark' : 'light'}
                  size="sm"
                >
                  Acción
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Real-Time Guardrail Feedback */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            analysis.status === 'approved'
              ? 'bg-[#d4ff4a]/10 border-[#d4ff4a]/40 text-[#17131f]'
              : analysis.status === 'prohibited'
              ? 'bg-rose-50 border-rose-200 text-[#17131f]'
              : 'bg-amber-50 border-amber-200 text-[#17131f]'
          }`}
        >
          <div className="flex items-start gap-3">
            {analysis.status === 'approved' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    analysis.status === 'approved'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {analysis.badge}
                </span>
                <span className="text-xs font-bold text-[#17131f]">{analysis.title}</span>
              </div>
              <p className="text-xs text-[#424242] leading-relaxed">
                {analysis.description}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#616161]">
                <strong>¿La IA asignará esto al pedir una landing?</strong>{' '}
                {analysis.canBeAssigned ? (
                  <span className="text-emerald-700 font-bold">
                    SÍ. Es el estándar canónico esperado para fondos oscuros.
                  </span>
                ) : (
                  <span className="text-rose-700 font-bold">
                    NO. Las reglas de diseño del sistema prohíben explícitamente generar esta combinación no usable.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 4 OFFICIAL GLASS LEVELS */}
      <section className="space-y-6">
        <div className="pb-4 border-b border-[#e0e0e0]">
          <h2 className="text-2xl font-extrabold text-[#17131f] tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#8a4dff]" />
            Gobernanza Canónica de Liquid Glass 2026
          </h2>
          <p className="text-xs text-[#616161]">
            Especificaciones y reglas de compatibilidad de cada nivel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {glassLevels.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white border border-[#e0e0e0] shadow-xs flex flex-col justify-between hover:border-[#8a4dff] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-base text-[#17131f]">{item.level}</h3>
                  <Badge variant={item.variant === 'dark' || item.variant === 'purple' ? 'neon' : 'purple'} size="xs">
                    {item.variant}
                  </Badge>
                </div>
                <div className="space-y-2 text-xs text-[#616161] mb-4">
                  <p>• <strong>Opacidad:</strong> {item.opacity}</p>
                  <p>• <strong>Desenfoque:</strong> {item.blur}</p>
                  <p>• <strong>Borde óptico:</strong> {item.border}</p>
                  <p>• <strong>Uso recomendado:</strong> {item.usage}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-[#f0f0f0] text-[11px] text-[#8a4dff] font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#501f92]" />
                <span>Permitido en: {item.recommendedOn}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. USAGE MATRIX (CUÁNDO SÍ / CUÁNDO NO) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cuándo Sí */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-extrabold text-[#17131f]">✅ Cuándo SÍ Asignar Liquid Glass</h3>
          </div>
          <ul className="space-y-3 text-xs text-[#616161]">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span><strong>Hero sections inmersivos</strong> con fondos oscuros (#090513) o gradientes cósmicos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span><strong>Tarjetas flotantes</strong> con texto blanco sobre fondos oscuros (contraste &gt; 7:1).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span><strong>Modales y overlays</strong> que refractan fondos oscuros sin degradar la tipografía.</span>
            </li>
          </ul>
        </div>

        {/* Cuándo No */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-rose-600" />
            <h3 className="text-lg font-extrabold text-[#17131f]">❌ Combinaciones Prohibidas por el Sistema</h3>
          </div>
          <ul className="space-y-3 text-xs text-[#616161]">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">•</span>
              <span><strong>Glass sobre fondos claros (#f2ecfb o blanco):</strong> La IA tiene prohibido usar vidrio transparente en fondos claros; siempre debe usar tarjetas sólidas blancas con sombras limpias.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">•</span>
              <span><strong>Glow Neon en fondos claros:</strong> Produce halos amarillentos sucios sin contraste. Solo permitido en dark mode.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">•</span>
              <span><strong>Texto de cuerpo sin contraste WCAG AA:</strong> Todo texto de párrafo debe superar 4.5:1.</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};
