import React from 'react';
import { Badge } from '../ui/Badge';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#090513] text-white border-t border-[#140b24] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8a4dff] to-[#501f92] flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(138,77,255,0.5)]">
                U
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">UHURA GROUP</span>
              <Badge variant="neon" size="xs">Canonical 2026</Badge>
            </div>
            <p className="text-sm text-[#f2ecfb]/70 max-w-md mb-4 leading-relaxed">
              Design System canónico unificado con los estándares de producción de Uhura 2026. Tokens consistentes, botón contextual dinámico (Lime en dark / Violet en light), tipografía con acento editorial y exportación universal.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-[#c9b7ff] bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                Single Source of Truth
              </span>
              <span className="text-xs text-[#d4ff4a] bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                WCAG AA Compliant
              </span>
              <span className="text-xs text-[#4be5ff] bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                Contextual Button Engine
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#c9b7ff] mb-3">
              Fundamentos 2026
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>• Dark & Panel (#090513, #140b24)</li>
              <li>• Púrpura & Violet (#501f92, #8a4dff)</li>
              <li>• Acentos Lime & Cyan (#d4ff4a, #4be5ff)</li>
              <li>• Montserrat + Playfair Display Italic</li>
              <li>• Escala 4pt Fluid Typography</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#c9b7ff] mb-3">
              Tokens & Exportación
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>• Tokens Canónicos (JSON Schema)</li>
              <li>• Tailwind CSS & CSS Variables</li>
              <li>• WordPress theme.json Sync</li>
              <li>• Botón Contextual (Lime/Violet)</li>
              <li>• Motion Engine (150ms 60fps)</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#d4ff4a]" />
            <span>Uhura Group Design System · v3.1.0 Canónico · Sincronizado con Producción</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Diseñado con</span>
            <Sparkles className="w-3.5 h-3.5 text-[#d4ff4a]" />
            <span>para Uhura Group 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
