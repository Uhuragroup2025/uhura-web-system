import React, { useState, useRef, useEffect } from 'react';
import { STANDARD_UHURA_ROLES } from '../taskflow/types';
import { Briefcase, ChevronDown, Check } from 'lucide-react';

export interface RoleChipProps {
  role: string;
  size?: 'xs' | 'sm' | 'md';
  interactive?: boolean;
  onChange?: (newRole: string) => void;
  showIcon?: boolean;
  className?: string;
}

export const RoleChip: React.FC<RoleChipProps> = ({
  role,
  size = 'sm',
  interactive = false,
  onChange,
  showIcon = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    xs: 'h-5 px-2 text-[10px] gap-1 rounded-md font-medium',
    sm: 'h-6 px-2.5 text-xs gap-1.5 rounded-md font-medium',
    md: 'h-7 px-3 text-xs gap-1.5 rounded-lg font-semibold'
  };

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

  const displayRole = role || 'Diseñador Gráfico';

  if (!interactive || !onChange) {
    return (
      <span
        className={`inline-flex items-center select-none whitespace-nowrap bg-[#f8fafc] text-[#475569] border border-[#e2e8f0] ${sizeClasses[size]} ${className}`}
      >
        {showIcon && <Briefcase className="w-3 h-3 text-[#64748b] shrink-0" />}
        <span className="truncate max-w-[140px] sm:max-w-none">{displayRole}</span>
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
        className={`inline-flex items-center select-none whitespace-nowrap bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0] hover:border-[#cbd5e1] transition-colors cursor-pointer active:scale-[0.98] ${sizeClasses[size]}`}
      >
        {showIcon && <Briefcase className="w-3 h-3 text-[#64748b] shrink-0" />}
        <span className="truncate max-w-[140px]">{displayRole}</span>
        <ChevronDown className="w-3 h-3 text-[#94a3b8] shrink-0 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-40 bg-white rounded-xl border border-[#e2e8f0] shadow-lg p-1.5 min-w-[200px] max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-1">
          <div className="px-2 py-1 text-[10px] font-bold text-[#64748b] border-b border-[#f1f5f9] mb-1">
            Rol cotizado presupuestado
          </div>
          {STANDARD_UHURA_ROLES.map((r) => {
            const isSelected = displayRole === r;
            return (
              <button
                key={r}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(r);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#f5f3ff] text-[#501f92] font-bold' : 'hover:bg-[#f8fafc] text-[#334155]'
                }`}
              >
                <span>{r}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#501f92]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
