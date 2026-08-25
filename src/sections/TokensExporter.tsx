import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Copy, Check, Download } from 'lucide-react';

export const TokensExporter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tokens-v3' | 'css-vars' | 'tailwind' | 'wordpress'>('tokens-v3');
  const [copied, setCopied] = useState(false);

  const tokensV3Json = `{
  "$schema": "https://tr.designtokens.org/format/v1/schema.json",
  "name": "Uhura Group 2026 - Liquid Glass Design Tokens",
  "version": "3.1.0",
  "color": {
    "uhura": {
      "ink": { "value": "#17131f", "type": "color" },
      "dark": { "value": "#090513", "type": "color" },
      "panel": { "value": "#140b24", "type": "color" },
      "purple": { "value": "#501f92", "type": "color" },
      "violet": { "value": "#8a4dff", "type": "color" },
      "lavender": { "value": "#c9b7ff", "type": "color" },
      "blue": { "value": "#4f7dff", "type": "color" },
      "cyan": { "value": "#4be5ff", "type": "color" },
      "lime": { "value": "#d4ff4a", "type": "color" },
      "light": { "value": "#f2ecfb", "type": "color" },
      "light2": { "value": "#eaf5ff", "type": "color" }
    },
    "gradient": {
      "primary": { "value": "linear-gradient(135deg, #8a4dff 0%, #501f92 100%)", "type": "gradient" },
      "hero": { "value": "linear-gradient(135deg, #501f92 0%, #8a4dff 50%, #4be5ff 100%)", "type": "gradient" },
      "holographic": { "value": "linear-gradient(135deg, #8a4dff 0%, #4be5ff 50%, #d4ff4a 100%)", "type": "gradient" },
      "accent": { "value": "linear-gradient(135deg, #d4ff4a 0%, #edff9b 100%)", "type": "gradient" }
    }
  },
  "typography": {
    "fontFamily": {
      "primary": { "value": "Montserrat, sans-serif", "type": "fontFamily" },
      "editorial": { "value": "Playfair Display, Georgia, serif", "type": "fontFamily" }
    }
  }
}`;

  const cssVars = `/* Uhura Group 2026 — Canonical CSS Variables */
:root {
  /* Brand Foundations */
  --uhura-ink: #17131f;
  --uhura-dark: #090513;
  --uhura-panel: #140b24;
  --uhura-purple: #501f92;
  --uhura-violet: #8a4dff;
  --uhura-lavender: #c9b7ff;
  --uhura-blue: #4f7dff;
  --uhura-cyan: #4be5ff;
  --uhura-lime: #d4ff4a;
  --uhura-light: #f2ecfb;
  --uhura-light-2: #eaf5ff;
  --uhura-muted-dark: rgba(255, 255, 255, 0.72);
  --uhura-muted-light: rgba(23, 19, 31, 0.66);

  /* Contextual Mappings */
  --context-accent-primary: var(--uhura-lime);
  --context-accent-secondary: var(--uhura-cyan);
  --button-primary-background: linear-gradient(135deg, var(--uhura-lime), #edff9b);
  --button-primary-color: var(--uhura-ink);

  /* Fluid Typography Scale */
  --type-display: clamp(34px, 4.1vw, 56px);
  --type-page: clamp(36px, 4vw, 54px);
  --type-section: clamp(30px, 3.2vw, 44px);
  --type-subsection: clamp(25px, 2.4vw, 34px);
  --type-card: clamp(18px, 1.55vw, 24px);
  --type-metric: clamp(34px, 4vw, 58px);
  --type-body-lg: clamp(17px, 1.3vw, 19px);
  --type-body: clamp(16px, 1.2vw, 18px);
  --type-small: 13px;
  --type-caption: 12px;
  --type-label: 11px;
}`;

  const tailwindSnippet = `// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        uhura: {
          ink: '#17131f',
          dark: '#090513',
          panel: '#140b24',
          purple: '#501f92',
          violet: '#8a4dff',
          lavender: '#c9b7ff',
          blue: '#4f7dff',
          cyan: '#4be5ff',
          lime: '#d4ff4a',
          light: '#f2ecfb',
        }
      },
      fontFamily: {
        primary: ['Montserrat', 'sans-serif'],
        editorial: ['Playfair Display', 'Georgia', 'serif'],
      }
    }
  }
}`;

  const wordpressThemeJson = `{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "title": "Uhura Group 2026 Theme",
  "settings": {
    "color": {
      "palette": [
        { "slug": "uhura-dark", "name": "Uhura Dark", "color": "#090513" },
        { "slug": "uhura-panel", "name": "Uhura Panel", "color": "#140b24" },
        { "slug": "uhura-ink", "name": "Uhura Ink", "color": "#17131f" },
        { "slug": "uhura-purple", "name": "Uhura Purple", "color": "#501f92" },
        { "slug": "uhura-violet", "name": "Uhura Violet", "color": "#8a4dff" },
        { "slug": "uhura-lavender", "name": "Uhura Lavender", "color": "#c9b7ff" },
        { "slug": "uhura-lime", "name": "Uhura Lime", "color": "#d4ff4a" },
        { "slug": "uhura-cyan", "name": "Uhura Cyan", "color": "#4be5ff" },
        { "slug": "uhura-light", "name": "Uhura Light Surface", "color": "#f2ecfb" }
      ],
      "gradients": [
        {
          "slug": "gradient-primary",
          "name": "Gradient Primary",
          "gradient": "linear-gradient(135deg, #8a4dff 0%, #501f92 100%)"
        },
        {
          "slug": "gradient-hero",
          "name": "Gradient Hero",
          "gradient": "linear-gradient(135deg, #501f92 0%, #8a4dff 50%, #4be5ff 100%)"
        },
        {
          "slug": "gradient-accent",
          "name": "Gradient Lime Accent",
          "gradient": "linear-gradient(135deg, #d4ff4a 0%, #edff9b 100%)"
        }
      ]
    },
    "typography": {
      "fontFamilies": [
        { "slug": "montserrat", "name": "Montserrat", "fontFamily": "Montserrat, sans-serif" },
        { "slug": "playfair", "name": "Playfair Display Italic", "fontFamily": "'Playfair Display', Georgia, serif" }
      ]
    }
  }
}`;

  const getActiveContent = () => {
    switch (activeTab) {
      case 'tokens-v3':
        return tokensV3Json;
      case 'css-vars':
        return cssVars;
      case 'tailwind':
        return tailwindSnippet;
      case 'wordpress':
        return wordpressThemeJson;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([getActiveContent()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab === 'css-vars' ? 'theme.css' : activeTab === 'tailwind' ? 'tailwind.config.js' : activeTab === 'wordpress' ? 'theme.json' : 'design-tokens-v3.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="purple" size="sm">Tokens & Export</Badge>
          <span className="text-xs text-[#616161] font-medium">Exportación Multiplataforma</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17131f] tracking-tight mb-3">
          Design Tokens & Integraciones 2026
        </h1>
        <p className="text-sm sm:text-base text-[#616161] max-w-3xl leading-relaxed">
          Tokens estructurados compatibles con Tokens Studio (Figma), Tailwind CSS, variables CSS canónicas y WordPress Gutenberg block themes (<code className="text-xs bg-[#501f92]/10 text-[#501f92] px-1.5 py-0.5 rounded">theme.json</code>).
        </p>
      </div>

      {/* Main Exporter Panel */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e0e0] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e0e0]">
          {/* Format Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#f5f5f5] p-1.5 rounded-2xl border border-[#e0e0e0]">
            <button
              onClick={() => setActiveTab('tokens-v3')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tokens-v3' ? 'bg-[#501f92] text-white shadow-xs' : 'text-[#616161] hover:text-[#17131f]'
              }`}
            >
              Figma Tokens Studio (JSON)
            </button>
            <button
              onClick={() => setActiveTab('css-vars')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'css-vars' ? 'bg-[#501f92] text-white shadow-xs' : 'text-[#616161] hover:text-[#17131f]'
              }`}
            >
              CSS Variables (theme.css)
            </button>
            <button
              onClick={() => setActiveTab('tailwind')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tailwind' ? 'bg-[#501f92] text-white shadow-xs' : 'text-[#616161] hover:text-[#17131f]'
              }`}
            >
              Tailwind CSS Config
            </button>
            <button
              onClick={() => setActiveTab('wordpress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'wordpress' ? 'bg-[#501f92] text-white shadow-xs' : 'text-[#616161] hover:text-[#17131f]'
              }`}
            >
              WordPress theme.json
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={handleCopy}
            >
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              contextTheme="light"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownload}
            >
              Descargar
            </Button>
          </div>
        </div>

        {/* Code Display Area */}
        <div className="relative rounded-2xl bg-[#090513] text-[#f2ecfb] p-5 overflow-hidden font-mono text-xs shadow-inner border border-[#140b24]">
          <pre className="overflow-x-auto max-h-[460px] leading-relaxed select-all">
            {getActiveContent()}
          </pre>
        </div>
      </section>
    </div>
  );
};
