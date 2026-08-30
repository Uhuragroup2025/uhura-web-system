import React, { useState, useRef, useEffect } from 'react';
import { TaskStatus } from '../taskflow/types';
import { ChevronDown, Check } from 'lucide-react';

export interface TaskStatusBadgeProps {
  status: TaskStatus | string;
  completed?: boolean;
  size?: 'xs' | 'sm' | 'md';
  showDot?: boolean;
  interactive?: boolean;
  onChange?: (newStatus: TaskStatus) => void;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  }
> = {
  'To Do': {
    label: 'Por hacer',
    bgClass: 'bg-[#f1f5f9]',
    textClass: 'text-[#475569]',
    borderClass: 'border-[#e2e8f0]',
    dotClass: 'bg-[#94a3b8]'
  },
  'In Progress': {
    label: 'En proceso',
    bgClass: 'bg-[#fef3c7]',
    textClass: 'text-[#92400e]',
    borderClass: 'border-[#fde68a]',
    dotClass: 'bg-[#f59e0b]'
  },
  'Review': {
    label: 'En revisión',
    bgClass: 'bg-[#f3e8ff]',
    textClass: 'text-[#6b21a8]',
    borderClass: 'border-[#e9d5ff]',
    dotClass: 'bg-[#9333ea]'
  },
  'Done': {
    label: 'Completada',
    bgClass: 'bg-[#ecfdf5]',
    textClass: 'text-[#065f46]',
    borderClass: 'border-[#a7f3d0]',
    dotClass: 'bg-[#10b981]'
  }
};

const ALL_STATUSES: { id: TaskStatus; label: string }[] = [
  { id: 'To Do', label: 'Por hacer' },
  { id: 'In Progress', label: 'En proceso' },
  { id: 'Review', label: 'En revisión' },
  { id: 'Done', label: 'Completada' }
];

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  status,
  completed,
  size = 'sm',
  showDot = true,
  interactive = false,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const effectiveStatus = completed ? 'Done' : status;

  const normalizedStatus =
    effectiveStatus === 'Listo' || effectiveStatus === 'Completado' || effectiveStatus === 'Completada'
      ? 'Done'
      : effectiveStatus === 'Por Hacer' || effectiveStatus === 'Por hacer'
      ? 'To Do'
      : effectiveStatus === 'En Proceso' || effectiveStatus === 'En proceso'
      ? 'In Progress'
      : effectiveStatus === 'En Revisión' || effectiveStatus === 'En revision' || effectiveStatus === 'En revisión'
      ? 'Review'
      : effectiveStatus;

  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG['To Do'];

  const sizeClasses = {
    xs: 'h-5 px-2 text-[10px] gap-1 rounded-md font-semibold',
    sm: 'h-6 px-2.5 text-xs gap-1.5 rounded-md font-semibold',
    md: 'h-7 px-3 text-xs gap-1.5 rounded-lg font-bold'
  };

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2'
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!interactive || !onChange) {
    return (
      <span
        className={`inline-flex items-center select-none whitespace-nowrap border ${config.bgClass} ${config.textClass} ${config.borderClass} ${sizeClasses[size]} ${className}`}
      >
        {showDot && <span className={`${dotSizes[size]} rounded-full shrink-0 ${config.dotClass}`} />}
        <span className="leading-none">{config.label}</span>
      </span>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center select-none whitespace-nowrap border transition-all cursor-pointer hover:opacity-90 active:scale-[0.98] ${config.bgClass} ${config.textClass} ${config.borderClass} ${sizeClasses[size]}`}
      >
        {showDot && <span className={`${dotSizes[size]} rounded-full shrink-0 ${config.dotClass}`} />}
        <span className="leading-none">{config.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-40 bg-white rounded-xl border border-[#e2e8f0] shadow-lg p-1 min-w-[140px] animate-in fade-in slide-in-from-top-1">
          {ALL_STATUSES.map((item) => {
            const isSelected = normalizedStatus === item.id;
            const itemCfg = STATUS_CONFIG[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#f8fafc] text-[#0f172a]' : 'hover:bg-[#f8fafc] text-[#475569]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${itemCfg.dotClass}`} />
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#501f92]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
