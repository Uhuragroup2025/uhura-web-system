import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export const PromptGuide: React.FC = () => {
  const [promptType, setPromptType] = useState<'landing' | 'presentation' | 'email' | 'component'>('landing');
  const [topic, setTopic] = useState('Consultoría en Inteligencia Artificial y Transformación Digital B2B');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const generatePrompt = () => {
    switch (promptType) {
      case 'landing':
        return `Crea una landing page para "${topic}" siguiendo estrictamente el Design System de Uhura Group (2026 Canonical v3.1.0).

REGLAS OBLIGATORIAS:
1. Fondo y Profundidad: Usar --uhura-dark (#090513) y --uhura-panel (#140b24) para secciones inmersivas, o --uhura-light (#f2ecfb) para secciones claras.
2. Botón CTA Contextual: En secciones oscuras usar degradado Lime (#d4ff4a a #edff9b) con texto Ink (#17131f) y resplandor lime; en secciones claras usar Violet (#8a4dff) con texto blanco.
3. Hero Section: Headline con Montserrat ExtraBold y palabras clave de acento en Playfair Display Italic.
4. Colores secundarios: Lime (#d4ff4a) y Cyan (#4be5ff) como acentos puntuales (máximo 15% cada uno).
5. Tipografía: Montserrat para el 95% del contenido. Playfair Display Italic SOLO para 1-2 palabras de énfasis editorial.
6. Espaciado: Todos los márgenes y paddings deben ser múltiplos de 4px (sistema 4pt).`;

      case 'presentation':
        return `Crea una presentación ejecutiva para "${topic}" siguiendo el Design System de Uhura Group 2026.

REGLAS OBLIGATORIAS:
1. Slide de Portada: Fondo oscuro (#090513) con gradiente primario (#8a4dff a #501f92), título principal en Montserrat ExtraBold blanco con acento en Playfair Display Italic.
2. Contenido interno: Fondos claros (#f2ecfb / #ffffff), tipografía principal en #17131f.
3. Cifras y métricas: Destacar números clave con Lime (#d4ff4a) sobre fondos oscuros o Purple (#501f92) sobre fondos claros.
4. Tipografía: Montserrat para todos los titulares y datos.
5. Sin efectos innecesarios: No usar glassmorphism si el fondo es plano.`;

      case 'email':
        return `Diseña un email marketing profesional sobre "${topic}" para Uhura Group.

REGLAS OBLIGATORIAS:
1. Header: Banner corporativo con degradado primario #8a4dff a #501f92 y logo de Uhura Group.
2. Botón CTA: Botón principal con esquinas redondeadas en #8a4dff con texto blanco en Montserrat SemiBold.
3. Tipografía: Montserrat con fallback Arial, sans-serif. Alto contraste sobre fondo claro.
4. Restricciones técnicas: Sin efectos de glassmorphism o filtros complejos incompatibles con clientes de correo.`;

      case 'component':
        return `Diseña un componente React en TypeScript para "${topic}" usando los tokens canónicos de Uhura 2026.

REGLAS OBLIGATORIAS:
1. Importar tokens desde CSS Variables (--uhura-dark, --uhura-lime, --uhura-purple, --uhura-violet, --uhura-lavender).
2. Implementar soporte contextual: tema oscuro (Lime CTA) y tema claro (Violet CTA).
3. Transición estándar de 150ms con ease-out animando exclusivamente transform y opacity para garantizar 60fps.
4. Padding interno y márgenes con valores múltiplos de 4px.`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePrompt());
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="space-y-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="purple" size="sm">AI System Guide</Badge>
          <span className="text-xs text-[#616161] font-medium">Instrucciones Canónicas 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17131f] tracking-tight mb-3">
          Guía de IA & Generador de Prompts
        </h1>
        <p className="text-sm sm:text-base text-[#616161] max-w-3xl leading-relaxed">
          Instrucciones para que asistentes de inteligencia artificial generen interfaces, documentos y campañas 100% alineadas a los tokens canónicos de Uhura Group 2026.
        </p>
      </div>

      {/* Interactive Generator */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e0e0] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e0e0]">
          <div>
            <h2 className="text-xl font-extrabold text-[#17131f] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8a4dff]" />
              Generador de Prompts para Asistentes IA
            </h2>
            <p className="text-xs text-[#616161]">
              Copia y pega este prompt al solicitar piezas a cualquier modelo de lenguaje.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            contextTheme="light"
            icon={copiedPrompt ? <Check className="w-3.5 h-3.5 text-[#d4ff4a]" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={handleCopy}
          >
            {copiedPrompt ? 'Prompt Copiado' : 'Copiar Prompt'}
          </Button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#616161] block mb-2">
              Tipo de Pieza
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['landing', 'presentation', 'email', 'component'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setPromptType(type)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    promptType === type ? 'bg-[#501f92] text-white shadow-xs' : 'bg-[#fafafa] text-[#616161] border border-[#e0e0e0]'
                  }`}
                >
                  {type === 'landing' ? 'Landing Page' : type === 'presentation' ? 'Presentación' : type === 'email' ? 'Email Marketing' : 'Componente UI'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#616161] block mb-2">
              Tema o Producto
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: Consultoría B2B, Lanzamiento SaaS..."
              className="w-full h-10 px-3 rounded-xl border border-[#e0e0e0] text-xs font-medium text-[#17131f] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
            />
          </div>
        </div>

        {/* Generated Output */}
        <div className="p-5 rounded-2xl bg-[#090513] border border-[#140b24] font-mono text-xs text-[#f2ecfb] whitespace-pre-wrap leading-relaxed shadow-inner">
          {generatePrompt()}
        </div>
      </section>

      {/* Compliance Checklist Guide */}
      <section className="bg-gradient-to-br from-[#090513] via-[#140b24] to-[#501f92] text-white rounded-3xl p-6 sm:p-8 border border-[#8a4dff]/40 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-6 h-6 text-[#d4ff4a]" />
          <h3 className="text-lg font-extrabold">Checklist de Control de Calidad Visual 2026</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-white/90">
          <div className="flex items-start gap-2 bg-white/10 p-3 rounded-xl backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-[#d4ff4a] shrink-0 mt-0.5" />
            <span><strong>Fondo Canónico:</strong> Uso de #090513 (Dark) o #f2ecfb (Light) según contexto.</span>
          </div>
          <div className="flex items-start gap-2 bg-white/10 p-3 rounded-xl backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-[#d4ff4a] shrink-0 mt-0.5" />
            <span><strong>Botón Contextual:</strong> CTA Lime sobre dark (#d4ff4a) y Violet sobre light (#8a4dff).</span>
          </div>
          <div className="flex items-start gap-2 bg-white/10 p-3 rounded-xl backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-[#d4ff4a] shrink-0 mt-0.5" />
            <span><strong>Vidrio en contexto:</strong> Ningún componente Liquid Glass está sobre fondo blanco liso.</span>
          </div>
          <div className="flex items-start gap-2 bg-white/10 p-3 rounded-xl backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-[#d4ff4a] shrink-0 mt-0.5" />
            <span><strong>Playfair Display Italic:</strong> Énfasis editorial exclusivo en palabras clave sin negrita.</span>
          </div>
        </div>
      </section>
    </div>
  );
};
