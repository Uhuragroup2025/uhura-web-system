import React, { useState, useEffect } from 'react';
import { NavigationSection } from './types';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Overview } from './sections/Overview';
import { Foundations } from './sections/Foundations';
import { LiquidGlass } from './sections/LiquidGlass';
import { Components } from './sections/Components';
import { Motion } from './sections/Motion';
import { TokensExporter } from './sections/TokensExporter';
import { PromptGuide } from './sections/PromptGuide';
import { TaskFlowPrototype } from './sections/TaskFlowPrototype';
import { Eye, Zap, Volume2, ShieldCheck, Check } from 'lucide-react';

export function App() {
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');
  const [reducedMotionSimulated, setReducedMotionSimulated] = useState(false);

  // Apply reduced motion class dynamically if toggled
  useEffect(() => {
    if (reducedMotionSimulated) {
      document.documentElement.classList.add('force-reduced-motion');
    } else {
      document.documentElement.classList.remove('force-reduced-motion');
    }
  }, [reducedMotionSimulated]);

  const handleNavigate = (section: NavigationSection) => {
    setActiveSection(section);
    // Smooth scroll if motion not reduced, else instant
    window.scrollTo({
      top: 0,
      behavior: reducedMotionSimulated ? 'auto' : 'smooth',
    });
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview onNavigate={handleNavigate} />;
      case 'taskflow-prototype':
        return <TaskFlowPrototype />;
      case 'foundations':
        return <Foundations />;
      case 'liquid-glass':
        return <LiquidGlass />;
      case 'components':
        return <Components />;
      case 'motion':
        return <Motion />;
      case 'tokens':
        return <TokensExporter />;
      case 'prompt-guide':
        return <PromptGuide />;
      default:
        return <Overview onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col selection:bg-[#8a4dff]/20 selection:text-[#501f92]">
      {/* 1. KEYBOARD ACCESSIBILITY: Skip to content link (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-[#501f92] focus:text-white focus:font-bold focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-3 focus:ring-[#d4ff4a]"
      >
        Saltar al contenido principal (Skip to Content)
      </a>

      {/* 2. Top Navigation */}
      <Navbar activeSection={activeSection} onSelectSection={handleNavigate} />

      {/* 3. Accessibility Quick-Bar Banner */}
      <div className="bg-[#140b24] text-white py-2 px-4 border-b border-[#8a4dff]/20 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#c9b7ff]">
            <ShieldCheck className="w-4 h-4 text-[#d4ff4a]" aria-hidden="true" />
            <span className="font-semibold text-white">WCAG 2.2 AA Audited Design System</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="hidden sm:inline text-[11px]">Ratios de contraste calibrados, foco visible y touch targets &ge; 44px</span>
          </div>

          {/* Reduced motion simulation toggle */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="reduced-motion-toggle"
              className="flex items-center gap-2 cursor-pointer bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full transition-colors text-[11px] font-medium"
            >
              <input
                id="reduced-motion-toggle"
                type="checkbox"
                checked={reducedMotionSimulated}
                onChange={(e) => setReducedMotionSimulated(e.target.checked)}
                className="rounded text-[#8a4dff] focus:ring-[#d4ff4a]"
              />
              <span>Simulador Reduced Motion</span>
              {reducedMotionSimulated && (
                <span className="bg-[#d4ff4a] text-[#17131f] px-1.5 py-0.2 rounded font-bold text-[9px]">
                  ACTIVO
                </span>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* 4. Main Content Area with Landmark & ID */}
      <main
        id="main-content"
        tabIndex={-1}
        role="region"
        aria-label="Contenido de la sección seleccionada"
        className={`flex-1 w-full mx-auto focus:outline-none transition-all duration-300 ${
          activeSection === 'taskflow-prototype'
            ? 'max-w-[1920px] px-2 sm:px-4 lg:px-6 pt-2 pb-10'
            : 'max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-16'
        }`}
      >
        {renderSection()}
      </main>

      {/* 5. Branded Footer */}
      <Footer />
    </div>
  );
}

export default App;
