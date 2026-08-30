import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface DropdownOption {
  id: string;
  label: string;
  sublabel?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  options: DropdownOption[];
  value?: string | string[];
  onChange: (value: string) => void;
  onMultiChange?: (values: string[]) => void;
  multiple?: boolean;
  closeOnSelect?: boolean;
  placeholder?: string;
  trigger?: ReactNode;
  searchable?: boolean;
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
  size?: 'sm' | 'md';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  options,
  value,
  onChange,
  onMultiChange,
  multiple = false,
  closeOnSelect,
  placeholder = 'Seleccionar...',
  trigger,
  searchable = false,
  align = 'left',
  className = '',
  menuClassName = '',
  size = 'sm'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const shouldCloseOnSelect = closeOnSelect !== undefined ? closeOnSelect : !multiple;

  const isValueSelected = (optId: string): boolean => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optId);
    }
    return value === optId;
  };

  const selectedOption = !multiple && typeof value === 'string'
    ? options.find((o) => o.id === value)
    : undefined;

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      return;
    }
    if (searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, searchable]);

  const filteredOptions = searchQuery.trim()
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (o.sublabel && o.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
    md: 'h-9 px-3.5 text-xs sm:text-sm gap-2 rounded-lg'
  };

  const handleOptionClick = (optId: string, disabled?: boolean) => {
    if (disabled) return;

    if (multiple) {
      const currentValues = Array.isArray(value) ? [...value] : [];
      const newValues = currentValues.includes(optId)
        ? currentValues.filter((id) => id !== optId)
        : [...currentValues, optId];

      if (onMultiChange) {
        onMultiChange(newValues);
      }
      onChange(optId);
    } else {
      onChange(optId);
    }

    if (shouldCloseOnSelect) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between bg-white hover:bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#cbd5e1] text-[#0f172a] transition-colors cursor-pointer select-none font-medium shadow-2xs ${sizeClasses[size]}`}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
            <span className="truncate">
              {multiple && Array.isArray(value)
                ? value.length === 0
                  ? placeholder
                  : `${value.length} seleccionado${value.length > 1 ? 's' : ''}`
                : selectedOption
                ? selectedOption.label
                : placeholder}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] shrink-0 ml-1.5" />
        </button>
      )}

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } top-full mt-1.5 z-50 bg-white rounded-xl border border-[#e2e8f0] shadow-xl p-1.5 min-w-[220px] max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1 ${menuClassName}`}
        >
          {searchable && (
            <div className="p-1 border-b border-[#f1f5f9] mb-1">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2 text-[#94a3b8]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar opción..."
                  className="w-full pl-7 pr-2 py-1 text-xs rounded-md bg-[#f8fafc] border border-[#e2e8f0] focus:outline-none focus:border-[#501f92] text-[#0f172a]"
                />
              </div>
            </div>
          )}

          <div className="space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[#94a3b8] text-center">No hay resultados</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = isValueSelected(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleOptionClick(opt.id, opt.disabled)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#f5f3ff] text-[#501f92] font-semibold'
                        : 'hover:bg-[#f8fafc] text-[#334155]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div>
                        <span className="block truncate">{opt.label}</span>
                        {opt.sublabel && (
                          <span className="text-[10px] text-[#64748b] block truncate">{opt.sublabel}</span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#501f92] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
