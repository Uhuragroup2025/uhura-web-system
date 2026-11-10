import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface RoleMultiSelectProps {
  options: readonly string[];
  selected: string[];
  onChange: (roles: string[]) => void;
  placeholder?: string;
}

/**
 * Desplegable de selección múltiple para roles profesionales.
 * El primer rol seleccionado es el principal (se usa por defecto al cotizar y asignar).
 */
export const RoleMultiSelect: React.FC<RoleMultiSelectProps> = ({ options, selected, onChange, placeholder = 'Seleccionar roles…' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const toggle = (role: string) =>
    onChange(selected.includes(role) ? selected.filter((r) => r !== role) : [...selected, role]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full min-h-[40px] px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-xs text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex flex-wrap gap-1">
          {selected.length === 0 && <span className="text-[#94a3b8]">{placeholder}</span>}
          {selected.map((r, i) => (
            <span key={r} className={`px-2 py-0.5 rounded-md font-semibold ${i === 0 ? 'bg-[#501f92] text-white' : 'bg-[#f5f3ff] text-[#501f92]'}`} title={i === 0 ? 'Rol principal' : undefined}>
              {r}
            </span>
          ))}
        </span>
        <ChevronDown className="w-4 h-4 text-[#64748b] shrink-0" />
      </button>
      {open && (
        <ul role="listbox" aria-multiselectable="true" className="absolute z-40 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-[#e2e8f0] rounded-xl shadow-lg py-1">
          {options.map((role) => {
            const checked = selected.includes(role);
            return (
              <li key={role}>
                <button
                  type="button"
                  role="option"
                  aria-selected={checked}
                  onClick={() => toggle(role)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-[#f8fafc] cursor-pointer"
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-[#501f92] border-[#501f92]' : 'border-[#cbd5e1]'}`}>
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span className="text-[#0f172a]">{role}</span>
                  {checked && selected[0] === role && <span className="ml-auto text-[10px] font-bold text-[#501f92]">Principal</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
