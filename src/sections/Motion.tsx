import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import {
  Sliders,
  Sparkles,
  Gauge
} from 'lucide-react';

export const Motion: React.FC = () => {
  const [activeDuration, setActiveDuration] = useState('150ms');
  const [activeEasing, setActiveEasing] = useState('cubic-bezier(0, 0, 0.2, 1)');
  const [testScale, setTestScale] = useState(1.05);
  const [testLift, setTestLift] = useState(-2);
  const [isTriggered, setIsTriggered] = useState(false);

  const durationTokens = [
    { name: 'instant', time: '100ms', useCase: 'Tooltips, feedback instantáneo y micro-toggles' },
    { name: 'fast', time: '150ms', useCase: 'Hover en botones y enlaces (90% de interacciones)', isDefault: true },
    { name: 'normal', time: '250ms', useCase: 'Tarjetas, tabs, modales y transiciones de estado' },
    { name: 'slow', time: '400ms', useCase: 'Inputs, formularios, elementos que requieren atención' },
    { name: 'slower', time: '600ms', useCase: 'Scroll reveals, animaciones complejas de entrada' },
  ];

  const easingTokens = [
    { name: 'ease-out', value: 'cubic-bezier(0, 0, 0.2, 1)', desc: 'El default para hover y salidas fluidas' },
    { name: 'ease-in-out', value: 'cubic-bezier(0.4, 0, 0.2, 1)', desc: 'Transiciones bidireccionales (abrir / cerrar)' },
    { name: 'spring', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', desc: 'Efecto rebote premium para highlights' },
  ];

  const fiveStates = [
    { state: '1. Default', desc: 'Estado base en reposo', classes: 'bg-white border-[#e0e0e0] text-[#17131f]' },
    { state: '2. Hover', desc: 'Cursor sobre el elemento (scale 1.05 + -2px)', classes: 'bg-[#501f92] text-white shadow-md -translate-y-1 scale-105' },
    { state: '3. Active', desc: 'Pulsación / click (scale 0.98)', classes: 'bg-[#090513] text-[#d4ff4a] scale-98' },
    { state: '4. Focus', desc: 'Navegación por teclado (ring 3px #8a4dff)', classes: 'bg-white text-[#501f92] ring-3 ring-[#8a4dff] border-transparent' },
    { state: '5. Disabled', desc: 'No interactivo (opacity 0.4, no events)', classes: 'bg-white border-[#e0e0e0] text-[#17131f] opacity-40 cursor-not-allowed' },
  ];

  return (
    <div className="space-y-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="purple" size="sm">Motion System</Badge>
          <span className="text-xs text-[#616161] font-medium">Animaciones Fluidas 60fps</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17131f] tracking-tight mb-3">
          Sistema de Movimiento & Estados 2026
        </h1>
        <p className="text-sm sm:text-base text-[#616161] max-w-3xl leading-relaxed">
          Diseñado bajo la regla de oro: <strong className="font-semibold text-[#501f92]">150ms + ease-out + scale(1.05)</strong>. Solo se animan propiedades de GPU (<code className="text-xs bg-[#501f92]/10 text-[#501f92] px-1.5 py-0.5 rounded">transform</code> y <code className="text-xs bg-[#501f92]/10 text-[#501f92] px-1.5 py-0.5 rounded">opacity</code>) para garantizar 60 cuadros por segundo sin provocar reflows.
        </p>
      </div>

      {/* 1. INTERACTIVE MOTION TESTBENCH */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e0e0] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e0e0]">
          <div>
            <h2 className="text-xl font-extrabold text-[#17131f] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#8a4dff]" />
              Banco de Pruebas de Animación
            </h2>
            <p className="text-xs text-[#616161]">
              Ajusta la duración, curva de aceleración y escala para sentir la respuesta táctil.
            </p>
          </div>
          <Badge variant="neon" size="sm">60fps GPU Guaranteed</Badge>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#fafafa] p-4 rounded-2xl border border-[#e0e0e0]">
          <div>
            <label className="text-xs font-bold text-[#616161] block mb-1.5 uppercase">Duración</label>
            <div className="flex flex-wrap gap-1">
              {['100ms', '150ms', '250ms', '400ms', '600ms'].map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDuration(d)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeDuration === d ? 'bg-[#501f92] text-white shadow-xs' : 'bg-white text-[#616161] border border-[#e0e0e0]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#616161] block mb-1.5 uppercase">Easing</label>
            <select
              value={activeEasing}
              onChange={(e) => setActiveEasing(e.target.value)}
              className="w-full h-9 bg-white border border-[#e0e0e0] rounded-lg text-xs font-semibold px-2 text-[#17131f]"
            >
              <option value="cubic-bezier(0, 0, 0.2, 1)">ease-out (Default 90%)</option>
              <option value="cubic-bezier(0.4, 0, 0.2, 1)">ease-in-out</option>
              <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">spring (Bounce)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#616161] block mb-1.5 uppercase">Escala: {testScale}x</label>
            <input
              type="range"
              min="1.00"
              max="1.15"
              step="0.01"
              value={testScale}
              onChange={(e) => setTestScale(parseFloat(e.target.value))}
              className="w-full accent-[#501f92]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#616161] block mb-1.5 uppercase">Elevación: {testLift}px</label>
            <input
              type="range"
              min="-8"
              max="0"
              step="1"
              value={testLift}
              onChange={(e) => setTestLift(parseInt(e.target.value))}
              className="w-full accent-[#501f92]"
            />
          </div>
        </div>

        {/* Interactive Box Stage */}
        <div className="p-12 rounded-2xl bg-[#090513] border border-[#140b24] flex flex-col sm:flex-row items-center justify-center gap-8 min-h-[220px]">
          {/* Interactive Button Demo */}
          <button
            onMouseEnter={() => setIsTriggered(true)}
            onMouseLeave={() => setIsTriggered(false)}
            style={{
              transitionDuration: activeDuration,
              transitionTimingFunction: activeEasing,
              transform: isTriggered ? `scale(${testScale}) translateY(${testLift}px)` : 'scale(1) translateY(0px)',
            }}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#d4ff4a] to-[#edff9b] text-[#17131f] font-semibold text-sm shadow-[0_0_24px_rgba(212,255,74,0.35)] hover:shadow-[0_0_36px_rgba(212,255,74,0.5)] cursor-pointer flex items-center gap-2 select-none"
          >
            <Sparkles className="w-4 h-4 text-[#17131f]" />
            <span>Hover Interactive (Lime CTA)</span>
          </button>

          {/* Interactive Card Demo */}
          <div
            style={{
              transitionDuration: activeDuration,
              transitionTimingFunction: activeEasing,
            }}
            className="p-5 bg-[#140b24] rounded-2xl border border-[#8a4dff]/30 shadow-sm hover:shadow-lg hover:border-[#8a4dff] hover:-translate-y-1 hover:scale-102 cursor-pointer max-w-xs transition-all text-white"
          >
            <span className="text-[10px] font-bold text-[#d4ff4a] bg-[#d4ff4a]/10 px-2 py-0.5 rounded">
              Card Hover Test
            </span>
            <h4 className="text-sm font-bold text-white mt-2 mb-1">Respuesta Táctil 2026</h4>
            <p className="text-xs text-[#c9b7ff]">Transición suave sin pérdida de cuadros.</p>
          </div>
        </div>
      </section>

      {/* 2. DURATION TOKENS TABLE */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e0e0] shadow-xs space-y-6">
        <div className="pb-4 border-b border-[#e0e0e0]">
          <h2 className="text-xl font-extrabold text-[#17131f] flex items-center gap-2">
            <Gauge className="w-5 h-5 text-[#8a4dff]" />
            Tokens de Duración y Easing
          </h2>
          <p className="text-xs text-[#616161]">
            Valores estándar para cada categoría de interacción del sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Durations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#616161]">Duraciones</h3>
            {durationTokens.map((dur) => (
              <div
                key={dur.name}
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  dur.isDefault ? 'bg-[#501f92]/5 border-[#501f92]/40' : 'bg-[#fafafa] border-[#e0e0e0]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#17131f]">{dur.name}</span>
                    {dur.isDefault && <Badge variant="neon" size="xs">90% Casos</Badge>}
                  </div>
                  <p className="text-[11px] text-[#616161] mt-0.5">{dur.useCase}</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#501f92] bg-white px-2.5 py-1 rounded-lg border border-[#e0e0e0]">
                  {dur.time}
                </span>
              </div>
            ))}
          </div>

          {/* Easing Functions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#616161]">Funciones de Easing</h3>
            {easingTokens.map((ea) => (
              <div key={ea.name} className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e0e0e0]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#17131f]">{ea.name}</span>
                  <code className="text-[10px] font-mono text-[#501f92] bg-[#501f92]/10 px-2 py-0.5 rounded">
                    {ea.value}
                  </code>
                </div>
                <p className="text-[11px] text-[#616161]">{ea.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE 5 MANDATORY STATES */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e0e0] shadow-xs space-y-6">
        <div className="pb-4 border-b border-[#e0e0e0]">
          <h2 className="text-xl font-extrabold text-[#17131f]">Los 5 Estados Obligatorios</h2>
          <p className="text-xs text-[#616161]">
            Todo componente interactivo debe implementar y testear estos 5 estados.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {fiveStates.map((st) => (
            <div key={st.state} className="p-4 bg-[#fafafa] rounded-2xl border border-[#e0e0e0] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#17131f] block mb-1">{st.state}</span>
                <p className="text-[11px] text-[#616161] mb-4">{st.desc}</p>
              </div>
              <div
                className={`w-full py-2.5 rounded-full border text-xs font-semibold text-center transition-all ${st.classes}`}
              >
                Botón Demo
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
