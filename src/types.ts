import { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export type BadgeVariant = 
  | 'neutral'
  | 'brand'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'outline'
  | 'glass'
  | 'subtle'
  | 'neon'
  | 'purple'
  | 'cyan'
  | 'pink';
export type BadgeSize = 'xs' | 'sm' | 'md';

export type CardVariant = 'default' | 'elevated' | 'purple' | 'gradient' | 'glass' | 'glass-dark';

export type GlassVariant = 'light' | 'medium' | 'dark' | 'purple';
export type GlassBlur = 'sm' | 'md' | 'lg' | 'xl';
export type GlassGlow = 'none' | 'purple' | 'cyan' | 'neon';

export type InputVariant = 'default' | 'glass';

export type NavigationSection = 
  | 'overview'
  | 'taskflow-prototype'
  | 'foundations'
  | 'liquid-glass'
  | 'components'
  | 'motion'
  | 'tokens'
  | 'prompt-guide';

export interface ColorToken {
  name: string;
  variable: string;
  hex: string;
  category: 'primary' | 'neutral' | 'secondary' | 'semantic';
  usage: string;
  ratio: string;
  textDark?: boolean;
}

export interface GradientToken {
  id: string;
  name: string;
  css: string;
  usage: string;
  distribution: string;
}

export interface MotionToken {
  name: string;
  duration: string;
  value: string;
  useCase: string;
}
