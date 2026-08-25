import React, { useState } from 'react';
import { NavigationSection } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { GlassCard } from '../components/ui/GlassCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Palette,
  Box,
  Activity,
  FileCode
} from 'lucide-react';

interface OverviewProps {
  onNavigate: (section: NavigationSection) => void;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate }) => {
  const [checkedRules, setCheckedRules] = useState<Record<number, boolean>>({});

  const toggleRule = (index: number) => {
    setCheckedRules((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const absoluteRules = [
    { text: 'Paleta canónica estricta: Púrpuras (#501f92, #8a4dff, #c9b7ff), Dark (#090513), Panel (#140b24) y Acento Lime (#d4ff4a).', category: 'Color' },
    { text: 'Botón Contextual: En fondo oscuro usa degradado Lime (#d4ff4a -> #edff9b) con texto Ink; en fondo claro usa Violet (#8a4dff) con texto blanco.', category: 'Botones' },
    { text: 'Nunca usar glass sobre fondo blanco liso (solo sobre gradientes, orbes difuminados o fondos oscuros).', category: 'Liquid Glass' },
    { text: 'Nunca superar el 15% de Acentos (Lime, Cyan, Blue, Pink) por viewport.', category: 'Color' },
    { text: 'Tipografía oficial: Montserrat (95% UI) y Playfair Display Italic exclusivamente para palabras de énfasis editorial.', category: 'Tipografía' },
    { text: 'Nunca usar espaciados que no sean múltiplos de 4px (ej: 10px, 15px, 22px prohibidos).', category: 'Espaciado' },
    { text: 'Métricas / KPIs: Usar siempre valor Lime con label Lavender sobre fondos oscuros, o valor Purple sobre claros.', category: 'Componentes' },
    { text: 'Badges compactos: Usar exclusivamente alturas xs (20px) o sm (24px) con texto en una sola línea.', category: 'Componentes' },
    { text: 'Motion & Governor: Limitar animaciones a 60fps / 30fps con frame budget y fallback en reduced motion.', category: 'Motion' },
    { text: 'Arquitectura semántica: Mantener un único estándar de tokens sincronizado con uhura-site-2026.', category: 'Gobierno' },
    { text: 'Bordes Hairline 1px & Micro-Chips: Usar exclusivamente bordes finos de 1px (evitar 2px pesados en botones/cards) y estructurar datos con micro-etiquetas contextuales.', category: 'Arquitectura' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Showcase with Canonical Hero Gradient */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#090513] via-[#140b24] to-[#501f92] p-8 sm:p-12 lg:p-16 text-white shadow-[0_20px_50px_rgba(9,5,19,0.5)] border border-[#8a4dff]/20">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#8a4dff]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#4be5ff]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-10 w-72 h-72 bg-[#d4ff4a]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="neon" size="sm" isDot>
              Uhura 2026 Canonical
            </Badge>
            <Badge variant="glass" size="sm">
              Design System v3.1.0
            </Badge>
            <span className="text-xs text-[#c9b7ff] font-medium">Single Source of Truth</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6">
            Uhura Web System <br />
            <span className="text-[#d4ff4a] font-editorial italic font-normal">Design System</span> & UI Kit
          </h1>

          <p className="text-base sm:text-lg text-[#f2ecfb]/90 font-normal leading-relaxed mb-8 max-w-2xl">
            Tokens canónicos, fundamentos cromáticos, tipografía con <span className="font-editorial text-[#d4ff4a]">Playfair Display</span> de acento, botón contextual (Lime / Violet) y sistema de componentes sincronizado con la web en producción.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="primary"
              size="lg"
              contextTheme="dark"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigate('taskflow-prototype')}
            >
              Ver Prototipo TaskFlow SaaS
            </Button>
            <Button
              variant="glass"
              size="lg"
              icon={<Box className="w-4 h-4" />}
              onClick={() => onNavigate('components')}
            >
              Explorar Componentes
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-[#c9b7ff] border-[#8a4dff]/40 hover:bg-[#8a4dff] hover:text-white"
              icon={<FileCode className="w-4 h-4" />}
              onClick={() => onNavigate('tokens')}
            >
              Exportar Tokens
            </Button>
          </div>
        </div>

        {/* Floating Glass Preview Card inside Hero */}
        <div className="mt-10 lg:mt-0 lg:absolute lg:right-12 lg:bottom-12 w-full lg:w-80">
          <GlassCard variant="dark" blur="lg" glow="purple" hover padding="md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4ff4a]">
                Paleta 2026 Canónica
              </span>
              <Badge variant="purple" size="xs">Producción</Badge>
            </div>
            <div className="space-y-2 text-xs text-white">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#8a4dff]">Purple & Dark Base</span>
                <span className="text-[#c9b7ff]">#090513 / #501f92</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gradient-to-r from-[#090513] via-[#501f92] to-[#8a4dff]" />

              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-[#d4ff4a]">CTA Lime Glow</span>
                <span className="text-[#c9b7ff]">#d4ff4a</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#d4ff4a]" />

              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-[#4be5ff]">Cyan & Lavender</span>
                <span className="text-[#c9b7ff]">#4be5ff / #c9b7ff</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gradient-to-r from-[#4be5ff] to-[#c9b7ff]" />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#17131f]">Módulos del Sistema</h2>
            <p className="text-sm text-[#616161]">Accede directamente a cada sección interactiva y prototipos en vivo</p>
          </div>
          <Badge variant="subtle" size="sm">7 Módulos</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Featured Prototype Card */}
          <Card
            variant="default"
            hoverable
            className="group cursor-pointer border-[#8a4dff]/40 hover:border-[#8a4dff] bg-gradient-to-br from-white to-[#f5f3ff] relative overflow-hidden"
            onClick={() => onNavigate('taskflow-prototype')}
          >
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d4ff4a] text-[#17131f] shadow-2xs">
                PROTOTIPO FIGMA
              </span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#4f46e5]/10 flex items-center justify-center text-[#4f46e5] group-hover:bg-[#4f46e5] group-hover:text-white transition-colors duration-150">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17131f]">TaskFlow Workspace Pro</h3>
                <span className="text-xs text-[#616161]">Prototipo SaaS interactivo</span>
              </div>
            </div>
            <p className="text-xs text-[#616161] leading-relaxed">
              Dashboard ejecutivo, gestión My Tasks y panel de Users con permisos según los referentes de Figma.
            </p>
          </Card>
          <Card
            variant="default"
            hoverable
            className="group cursor-pointer border-[#8a4dff]/20 hover:border-[#8a4dff]"
            onClick={() => onNavigate('foundations')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#501f92]/10 flex items-center justify-center text-[#501f92] group-hover:bg-[#501f92] group-hover:text-white transition-colors duration-150">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17131f]">Foundations</h3>
                <span className="text-xs text-[#616161]">Tokens de color, tipografía y espacio</span>
              </div>
            </div>
            <p className="text-xs text-[#616161] leading-relaxed">
              Paleta oficial unificada, 6 gradientes, jerarquía Montserrat + Playfair Display Italic y escala 4pt.
            </p>
          </Card>

          <Card
            variant="default"
            hoverable
            className="group cursor-pointer border-[#8a4dff]/20 hover:border-[#8a4dff]"
            onClick={() => onNavigate('liquid-glass')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#4be5ff]/10 flex items-center justify-center text-[#17131f] group-hover:bg-[#4be5ff] transition-colors duration-150">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17131f]">Liquid Glass & Ambient</h3>
                <span className="text-xs text-[#616161]">Glassmorphism estructurado</span>
              </div>
            </div>
            <p className="text-xs text-[#616161] leading-relaxed">
              4 niveles de opacidad, 4 niveles de desenfoque, glow effects, orbes difuminados y reglas de contraste.
            </p>
          </Card>

          <Card
            variant="default"
            hoverable
            className="group cursor-pointer border-[#8a4dff]/20 hover:border-[#8a4dff]"
            onClick={() => onNavigate('components')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#501f92]/10 flex items-center justify-center text-[#501f92] group-hover:bg-[#501f92] group-hover:text-white transition-colors duration-150">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17131f]">Componentes</h3>
                <span className="text-xs text-[#616161]">UI Kit con variantes contextuales</span>
              </div>
            </div>
            <p className="text-xs text-[#616161] leading-relaxed">
              Botón Contextual (Lime/Violet), Badges, Cards, GlassCards e Inputs con estados interactivos.
            </p>
          </Card>

          <Card
            variant="default"
            hoverable
            className="group cursor-pointer border-[#8a4dff]/20 hover:border-[#8a4dff]"
            onClick={() => onNavigate('motion')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#cd79e8]/10 flex items-center justify-center text-[#cd79e8] group-hover:bg-[#cd79e8] group-hover:text-white transition-colors duration-150">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17131f]">Motion System</h3>
                <span className="text-xs text-[#616161]">Animaciones y performance</span>
              </div>
            </div>
            <p className="text-xs text-[#616161] leading-relaxed">
              Duraciones de 100ms a 600ms, easing curves calibradas, frame budget de 60fps y accesibilidad.
            </p>
          </Card>

          <Card
            variant="default"
            hoverable
            className="group cursor-pointer border-[#8a4dff]/20 hover:border-[#8a4dff]"
            onClick={() => onNavigate('tokens')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#d4ff4a]/20 flex items-center justify-center text-[#17131f] group-hover:bg-[#d4ff4a] transition-colors duration-150">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17131f]">Tokens & Export</h3>
                <span className="text-xs text-[#616161]">Figma, CSS, Tailwind & WordPress</span>
              </div>
            </div>
            <p className="text-xs text-[#616161] leading-relaxed">
              Descarga y copia JSON de tokens 2026, variables CSS canónicas y configuración WordPress theme.json.
            </p>
          </Card>

          <Card
            variant="default"
            hoverable
            className="group cursor-pointer border-[#8a4dff]/20 hover:border-[#8a4dff]"
            onClick={() => onNavigate('prompt-guide')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#501f92]/10 flex items-center justify-center text-[#501f92] group-hover:bg-[#501f92] group-hover:text-white transition-colors duration-150">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17131f]">AI Rules & Prompts</h3>
                <span className="text-xs text-[#616161]">Guía para asistentes IA</span>
              </div>
            </div>
            <p className="text-xs text-[#616161] leading-relaxed">
              Generador de prompts estructurados siguiendo las reglas de diseño de Uhura 2026.
            </p>
          </Card>
        </div>
      </div>

      {/* 10 Absolute Rules Interactive Checklist */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e0e0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#e0e0e0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-[#501f92]" />
              <h2 className="text-xl font-extrabold text-[#17131f]">Las 10 Reglas Canónicas del Sistema</h2>
            </div>
            <p className="text-xs text-[#616161]">
              Reglas de diseño del sistema Uhura 2026. Valida que tu diseño o código cumple el 100% de los requisitos.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#616161]">
              Cumplimiento: {Object.values(checkedRules).filter(Boolean).length} / 10
            </span>
            <button
              onClick={() => {
                const all: Record<number, boolean> = {};
                absoluteRules.forEach((_, i) => (all[i] = true));
                setCheckedRules(all);
              }}
              className="text-xs font-semibold text-[#501f92] hover:underline cursor-pointer"
            >
              Marcar todos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {absoluteRules.map((rule, idx) => {
            const isChecked = !!checkedRules[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleRule(idx)}
                className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-start gap-3 select-none ${
                  isChecked
                    ? 'bg-[#501f92]/5 border-[#501f92]/40'
                    : 'bg-[#fafafa] border-[#e0e0e0] hover:border-[#bdbdbd]'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckCircle2 className="w-4 h-4 text-[#501f92]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-[#bdbdbd]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#501f92] bg-[#501f92]/10 px-1.5 py-0.5 rounded">
                      REGLA #{idx + 1}
                    </span>
                    <span className="text-[10px] font-medium text-[#757575]">{rule.category}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isChecked ? 'text-[#17131f] font-medium' : 'text-[#616161]'}`}>
                    {rule.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
