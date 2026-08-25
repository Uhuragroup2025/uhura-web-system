import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  Sparkles,
  ArrowRight,
  ChevronDown,
  Search,
  Check,
  CreditCard,
  TrendingUp,
  Shield,
  Layers,
  BarChart3,
  Bot,
  Send,
  HelpCircle,
  FileText,
  Users,
  Briefcase,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  DollarSign,
  Smartphone,
  PieChart,
  Globe,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const CleanDesignShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'bento' | 'ai-module' | 'mega-menu' | 'hero-form'>('all');
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string; flag: string }>({
    code: '+57',
    name: 'Colombia',
    flag: '🇨🇴'
  });
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [aiQuery, setAiQuery] = useState('¿Cuál es el gasto previsto para el trimestre?');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(true);

  const countries = [
    { code: '+57', name: 'Colombia', flag: '🇨🇴' },
    { code: '+52', name: 'México', flag: '🇲🇽' },
    { code: '+55', name: 'Brasil', flag: '🇧🇷' },
    { code: '+56', name: 'Chile', flag: '🇨🇱' },
    { code: '+1', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: '+34', name: 'España', flag: '🇪🇸' },
  ];

  const handleAskAi = (query: string) => {
    setIsAiThinking(true);
    setAiResponse(null);
    setTimeout(() => {
      setIsAiThinking(false);
      setAiResponse('Gasto previsto: $184,500,000 COP (-4.2% vs Q3). 3 alertas de desvío resueltas automáticamente por Clara Intelligence.');
    }, 700);
  };

  return (
    <section className="space-y-10">
      {/* Header with Clara Aesthetics Philosophy */}
      <div className="bg-gradient-to-r from-[#090513] via-[#140b24] to-[#1c0e35] p-6 sm:p-8 rounded-3xl border border-[#8a4dff]/30 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="accent" size="sm" isDot>
                Clara Inspired Clean Architecture
              </Badge>
              <Badge variant="brand" size="sm">
                Bordes Hairline 1px & Espaciado Puro
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Patrones de Alta Sobriedad & Finanzas Modernas
            </h2>
            <p className="text-xs sm:text-sm text-[#c9b7ff] max-w-3xl mt-1.5 leading-relaxed">
              Inspirado en la dirección visual de <strong>Clara</strong>: fondos planos sin saturación excesiva, micro-chips flotantes (`Mensual`, `Viajes`), módulos de IA conversacional en Dark Mode sobrio, mega-menús jerarquizados y formularios de conversión sin fricción.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10">
            {[
              { id: 'all', label: 'Todos los Patrones' },
              { id: 'bento', label: '1. Bento & Micro-Chips' },
              { id: 'ai-module', label: '2. Módulo AI Sobrio' },
              { id: 'mega-menu', label: '3. Mega-Menú Pro' },
              { id: 'hero-form', label: '4. Formulario Zero-Friction' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#d4ff4a] text-[#17131f] font-bold shadow-xs'
                    : 'text-[#c9b7ff] hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Pillars Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#d4ff4a] uppercase tracking-wider block">Regla 1</span>
            <h4 className="text-xs font-bold text-white">Hairlines de 1px</h4>
            <p className="text-[11px] text-[#c9b7ff]">Bordes ultra finos y nítidos. Eliminación de bordes gruesos de 2px.</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#4be5ff] uppercase tracking-wider block">Regla 2</span>
            <h4 className="text-xs font-bold text-white">Micro-Chips Flotantes</h4>
            <p className="text-[11px] text-[#c9b7ff]">Mini componentes desacoplados para ilustrar flujos sin saturar.</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#cd79e8] uppercase tracking-wider block">Regla 3</span>
            <h4 className="text-xs font-bold text-white">Conversacional Fluido</h4>
            <p className="text-[11px] text-[#c9b7ff]">Globos de diálogo y pills de consulta rápida con icono interactivo.</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#ffffff] uppercase tracking-wider block">Regla 4</span>
            <h4 className="text-xs font-bold text-white">Lime CTA 100%</h4>
            <p className="text-[11px] text-[#c9b7ff]">Acento vibrante reservado únicamente para el llamado a la acción primario.</p>
          </div>
        </div>
      </div>

      {/* PATTERN 1: BENTO GRID WITH FLOATING MICRO-ELEMENTS */}
      {(activeTab === 'all' || activeTab === 'bento') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#501f92] text-white flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="text-lg font-extrabold text-[#17131f]">Bento Grid & Micro-Chips Flotantes (Light Mode)</h3>
              </div>
              <p className="text-xs text-[#616161]">
                Espaciado amplio (`p-8`), esquinas suaves (`rounded-3xl`), sombras tenues y mini-etiquetas contextuales.
              </p>
            </div>
            <Badge variant="neutral" size="xs">Light Canvas #FCFCFD</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#fcfcfd] p-6 sm:p-8 rounded-3xl border border-[#e5e7eb]">
            {/* Card A: Tarjeta Corporativa con Avatar y Micro-Pills */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[340px] hover:border-[#8a4dff]/40 transition-all duration-200">
              {/* Top Visual: Interactive Mockup */}
              <div className="relative bg-[#f7f9fd] rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center min-h-[170px] overflow-hidden">
                {/* Floating User Pill */}
                <div className="absolute top-3 left-4 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#501f92] to-[#8a4dff] text-white flex items-center justify-center text-[10px] font-bold">
                    AD
                  </div>
                  <span className="text-xs font-bold text-slate-800">Andre D.</span>
                </div>

                {/* Floating Category Pills */}
                <div className="absolute top-3 right-4 flex flex-col gap-1.5 items-end">
                  <span className="text-[11px] font-semibold text-[#501f92] bg-[#8a4dff]/10 px-2.5 py-0.5 rounded-full border border-[#8a4dff]/20">
                    📅 Mensual
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    ✈️ Viajes
                  </span>
                </div>

                {/* Card representation */}
                <div className="w-52 bg-gradient-to-r from-[#17131f] to-[#281c3d] text-white p-4 rounded-xl shadow-md border border-white/10 mt-6 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-white/70">
                    <span>Virtual Business</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="text-base font-extrabold tracking-tight text-white">
                    $ 2,000,000 <span className="text-[10px] text-[#c9b7ff] font-normal">COP</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[9px] text-[#c9b7ff]">
                    <span>•••• 4829</span>
                    <span className="font-bold text-white">Mastercard</span>
                  </div>
                </div>

                {/* Micro Tag Pills under card */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                  <span className="text-[10px] font-medium bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                    Transporte
                  </span>
                  <span className="text-[10px] font-medium bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                    Hotel
                  </span>
                  <span className="text-[10px] font-medium bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                    Alimentación
                  </span>
                  <span className="text-[10px] font-bold bg-[#d4ff4a] text-[#17131f] px-1.5 py-0.5 rounded-md">
                    +23
                  </span>
                </div>
              </div>

              {/* Bottom Typography */}
              <div className="pt-6">
                <h4 className="text-xl font-extrabold text-[#17131f] tracking-tight mb-2">
                  Tarjetas Corporativas Uhura
                </h4>
                <p className="text-xs text-[#616161] leading-relaxed">
                  Tarjetas corporativas globales con controles personalizables: autonomía para tu equipo con visibilidad en tiempo real para finanzas.
                </p>
              </div>
            </div>

            {/* Card B: Control de Gastos & Progress Bars Limpias */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-[340px] hover:border-[#8a4dff]/40 transition-all duration-200">
              {/* Top Visual: Progress Bars Clean Mockup */}
              <div className="relative bg-[#f7f9fd] rounded-2xl p-6 border border-slate-100 flex flex-col justify-center min-h-[170px] space-y-3.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Marketing & Growth</span>
                    <span className="text-slate-900 font-bold">25%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#501f92] rounded-full w-[25%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Producto & Tecnología</span>
                    <span className="text-[#501f92] font-bold">50%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#8a4dff] rounded-full w-[50%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>People & Cultura</span>
                    <span className="text-slate-900 font-bold">25%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#501f92] rounded-full w-[25%]" />
                  </div>
                </div>
              </div>

              {/* Bottom Typography */}
              <div className="pt-6">
                <h4 className="text-xl font-extrabold text-[#17131f] tracking-tight mb-2">
                  Control y Aprobación de Gastos
                </h4>
                <p className="text-xs text-[#616161] leading-relaxed">
                  Plataforma unificada que automatiza reportes, aprobaciones y cumplimiento: cero fricción operativa y control absoluto de presupuestos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PATTERN 2: CONVERSATIONAL AI MODULE (DARK MIDNIGHT SOBRIO) */}
      {(activeTab === 'all' || activeTab === 'ai-module') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#501f92] text-white flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="text-lg font-extrabold text-[#17131f]">Módulo Conversacional AI (Dark Midnight Sobrio)</h3>
              </div>
              <p className="text-xs text-[#616161]">
                Contenedor azul noche / midnight con destellos bokeh difusos, globo de diálogo y pill de búsqueda interactivo.
              </p>
            </div>
            <Badge variant="accent" size="xs">Midnight #090513</Badge>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#090513] via-[#0d071d] to-[#1a0e33] p-8 sm:p-12 text-white border border-white/10 shadow-2xl">
            {/* Soft Ambient Bokeh (Inspirado en Clara) */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-[#501f92]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8a4dff]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Heading & CTA */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8a4dff]/20 text-[#c9b7ff] border border-[#8a4dff]/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4ff4a]" />
                    Uhura Intelligence
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                  Conversa con tus datos financieros en tiempo real
                </h2>

                <p className="text-sm text-[#c9b7ff] leading-relaxed max-w-lg">
                  Motor de inteligencia artificial que procesa transacciones, detecta anomalías antes del cierre de mes y genera recomendaciones ejecutivas automatizadas.
                </p>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    contextTheme="dark"
                    icon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => handleAskAi(aiQuery)}
                  >
                    Saber más
                  </Button>
                </div>
              </div>

              {/* Right Column: Conversational Simulation Stage */}
              <div className="lg:col-span-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
                  {/* Floating AI Speech Bubble */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8a4dff] to-[#cd79e8] text-white flex items-center justify-center shadow-md flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="bg-[#8a4dff] text-white px-4 py-3 rounded-2xl rounded-tl-xs shadow-md text-sm font-semibold max-w-xs">
                      ¡Hola! ¿Cómo podemos ayudarte hoy?
                    </div>
                  </div>

                  {/* Interactive Query Pill Input */}
                  <div className="pt-4">
                    <label className="text-[11px] font-bold text-[#c9b7ff] uppercase tracking-wider block mb-2">
                      Pregunta sugerida (Haz clic para probar)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        className="w-full bg-white text-[#17131f] placeholder-slate-400 text-xs sm:text-sm font-medium py-3.5 pl-4 pr-12 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-[#d4ff4a]"
                      />
                      <button
                        onClick={() => handleAskAi(aiQuery)}
                        disabled={isAiThinking}
                        className="absolute right-2 w-8 h-8 rounded-full bg-[#17131f] text-white flex items-center justify-center hover:bg-[#501f92] transition-colors cursor-pointer"
                        aria-label="Enviar pregunta"
                      >
                        {isAiThinking ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#d4ff4a]" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Response Box */}
                  {aiResponse && (
                    <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 text-xs text-emerald-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Respuesta de Uhura Intelligence</span>
                      </div>
                      <p>{aiResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PATTERN 3: MEGA-MENU ARCHITECTURE (DROPDOWN PRO) */}
      {(activeTab === 'all' || activeTab === 'mega-menu') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#501f92] text-white flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="text-lg font-extrabold text-[#17131f]">Mega-Menú Jerarquizado & Cards de Novedades</h3>
              </div>
              <p className="text-xs text-[#616161]">
                Panel desplegable estructurado en columnas temáticas con iconos encapsulados y módulo de novedades lateral.
              </p>
            </div>
            <button
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className="px-3 py-1 text-xs font-bold text-[#501f92] bg-[#8a4dff]/10 rounded-lg hover:bg-[#8a4dff]/20 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>{megaMenuOpen ? 'Ocultar Despliegue' : 'Mostrar Despliegue'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {megaMenuOpen && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-8 animate-in fade-in duration-200">
              {/* Simulated Navigation Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 font-extrabold text-sm text-[#17131f]">
                    <div className="w-7 h-7 rounded-lg bg-[#501f92] text-white flex items-center justify-center text-xs font-black">
                      U
                    </div>
                    <span>UHURA</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-5 text-xs font-semibold text-slate-600">
                    <span className="hover:text-[#501f92] cursor-pointer">Productos</span>
                    <span className="hover:text-[#501f92] cursor-pointer">Soluciones</span>
                    <span className="hover:text-[#501f92] cursor-pointer">Clientes</span>
                    <span className="text-[#501f92] font-bold bg-slate-100 px-2.5 py-1 rounded-md cursor-pointer flex items-center gap-1">
                      Recursos <ChevronDown className="w-3 h-3 rotate-180" />
                    </span>
                    <span className="hover:text-[#501f92] cursor-pointer">Precios</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" contextTheme="light">
                    Ingreso Clientes
                  </Button>
                  <Button variant="primary" size="sm" contextTheme="light">
                    Regístrate
                  </Button>
                </div>
              </div>

              {/* Mega-Menu Grid (3 Columns + 1 Feature Card) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
                {/* Col 1: Insights */}
                <div className="lg:col-span-3 space-y-4">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Insights & Eventos
                  </h4>
                  <div className="space-y-3">
                    {[
                      { title: 'Eventos y Webinars', desc: 'Conferencias globales y demos en vivo.', icon: <Users className="w-4 h-4" /> },
                      { title: 'Blog Corporativo', desc: 'Artículos de expertos en finanzas.', icon: <FileText className="w-4 h-4" /> },
                      { title: 'Lanzamientos de Producto', desc: 'Actualizaciones periódicas de la suite.', icon: <Sparkles className="w-4 h-4" /> },
                      { title: 'Reportes de Inteligencia', desc: 'Guías basadas en datos para CFOs.', icon: <BarChart3 className="w-4 h-4" /> },
                    ].map((item, i) => (
                      <div key={i} className="group p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#501f92]/10 text-[#501f92] flex items-center justify-center flex-shrink-0 group-hover:bg-[#501f92] group-hover:text-white transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-[#501f92] transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 2: Compañía */}
                <div className="lg:col-span-3 space-y-4">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Compañía
                  </h4>
                  <div className="space-y-3">
                    {[
                      { title: 'Sala de Prensa', desc: 'Titulares oficiales y comunicados.', icon: <Globe className="w-4 h-4" /> },
                      { title: 'Carreras & Vacantes', desc: '¡Estamos contratando talento!', icon: <Briefcase className="w-4 h-4" />, badge: 'Hiring' },
                      { title: 'Cámbiate a Uhura', desc: 'Cómo migrar tu stack en minutos.', icon: <RefreshCw className="w-4 h-4" /> },
                    ].map((item, i) => (
                      <div key={i} className="group p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#501f92]/10 text-[#501f92] flex items-center justify-center flex-shrink-0 group-hover:bg-[#501f92] group-hover:text-white transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="group-hover:text-[#501f92] transition-colors">{item.title}</span>
                            {item.badge && <Badge variant="accent" size="xs">{item.badge}</Badge>}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 3: Soporte */}
                <div className="lg:col-span-3 space-y-4">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Soporte & Herramientas
                  </h4>
                  <div className="space-y-3">
                    {[
                      { title: 'Centro de Ayuda 24/7', desc: 'Respuestas instantáneas y guías.', icon: <HelpCircle className="w-4 h-4" /> },
                      { title: 'Calculadora de ROI', desc: 'Calcula tu ahorro operativo anual.', icon: <DollarSign className="w-4 h-4" /> },
                      { title: 'API & Desarrolladores', desc: 'Documentación técnica e integraciones.', icon: <Sliders className="w-4 h-4" /> },
                    ].map((item, i) => (
                      <div key={i} className="group p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#501f92]/10 text-[#501f92] flex items-center justify-center flex-shrink-0 group-hover:bg-[#501f92] group-hover:text-white transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-[#501f92] transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 4: Featured Product Release Card */}
                <div className="lg:col-span-3 bg-gradient-to-br from-[#faf8ff] to-[#f2ecfb] p-5 rounded-2xl border border-[#8a4dff]/20 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#501f92] uppercase tracking-wider block mb-2">
                      Novedades & Lanzamientos
                    </span>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs mb-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#8a4dff] text-white flex items-center justify-center text-xs font-bold">
                        MR
                      </div>
                      <div className="text-[11px]">
                        <div className="font-bold text-slate-900">Campos Contables Dinámicos</div>
                        <div className="text-slate-500">Captura de metadata en el origen</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Sincronización instantánea de facturas con ERP y validación fiscal automática.
                    </p>
                  </div>

                  <a
                    href="#release"
                    onClick={(e) => e.preventDefault()}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#501f92] hover:text-[#8a4dff] transition-colors"
                  >
                    <span>Lanzamientos de producto</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PATTERN 4: ZERO-FRICTION CORPORATE HERO FORM */}
      {(activeTab === 'all' || activeTab === 'hero-form') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#501f92] text-white flex items-center justify-center text-xs font-bold">4</span>
                <h3 className="text-lg font-extrabold text-[#17131f]">Formulario Zero-Friction con Selector de País Integrado</h3>
              </div>
              <p className="text-xs text-[#616161]">
                Inputs de 52px con esquinas suaves, selector de prefijo internacional embebido y CTA Lime de máxima conversión.
              </p>
            </div>
            <Badge variant="brand" size="xs">High Conversion</Badge>
          </div>

          <div className="bg-gradient-to-b from-[#1351d8] via-[#1048c2] to-[#0c3aa1] text-white p-8 sm:p-12 rounded-3xl border border-blue-400/20 shadow-2xl flex flex-col items-center text-center">
            <div className="max-w-2xl space-y-4 mb-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Control de gastos y tarjetas empresariales para tu compañía
              </h2>
              <p className="text-sm sm:text-base text-blue-100 max-w-lg mx-auto">
                Todo lo que tu empresa gasta, bajo control. Tarjetas, pagos y aprobaciones en una sola plataforma.
              </p>
            </div>

            {/* Zero-Friction Form */}
            <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-md space-y-3">
              {/* Email Input */}
              <input
                type="email"
                placeholder="E-mail corporativo"
                className="w-full h-13 px-4 rounded-xl bg-white text-[#17131f] text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-3 focus:ring-[#d4ff4a] shadow-md"
              />

              {/* Phone Input with Country Selector */}
              <div className="relative flex items-center bg-white rounded-xl shadow-md h-13">
                <button
                  type="button"
                  onClick={() => setShowCountryMenu(!showCountryMenu)}
                  className="flex items-center gap-1 px-3.5 h-full text-slate-800 font-semibold text-xs border-r border-slate-200 hover:bg-slate-50 rounded-l-xl transition-colors cursor-pointer"
                >
                  <span className="text-base">{selectedCountry.flag}</span>
                  <span>{selectedCountry.code}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {showCountryMenu && (
                  <div className="absolute top-14 left-0 w-48 bg-white text-[#17131f] rounded-xl shadow-xl border border-slate-200 z-50 p-1 divide-y divide-slate-100 animate-in fade-in duration-150">
                    {countries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c);
                          setShowCountryMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-slate-50 rounded-lg text-left cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                        </span>
                        <span className="text-slate-400 font-mono">{c.code}</span>
                      </button>
                    ))}
                  </div>
                )}

                <input
                  type="tel"
                  placeholder="Teléfono móvil"
                  className="w-full h-full px-4 rounded-r-xl bg-transparent text-[#17131f] text-sm font-medium placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Terms */}
              <p className="text-[11px] text-blue-100/80 pt-1 text-left px-1">
                Al crear una cuenta, aceptas nuestros <a href="#" className="underline font-semibold text-white">Términos y Condiciones</a> y <a href="#" className="underline font-semibold text-white">Política de Privacidad</a>.
              </p>

              {/* Lime Full-Width CTA */}
              <button
                type="submit"
                className="w-full h-13 rounded-xl bg-[#79e028] hover:bg-[#6bd020] active:bg-[#5ebf18] text-[#17131f] font-extrabold text-sm tracking-tight shadow-lg transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer mt-2"
              >
                Empieza ahora
              </button>

              {/* Secondary Explore Link */}
              <div className="pt-3">
                <a
                  href="#explore"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#d4ff4a] transition-colors"
                >
                  <span>Explora nuestra plataforma</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
