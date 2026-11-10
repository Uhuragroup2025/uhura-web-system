import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  hint?: string;
}

interface ChipMultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  max?: number;              // Límite opcional (ej. cupos de una licencia)
}

/**
 * Selección múltiple con búsqueda y casillas (sin Ctrl/Cmd+clic).
 * Lo seleccionado se muestra como chips removibles.
 */
export const ChipMultiSelect: React.FC<ChipMultiSelectProps> = ({ options, selected, onChange, placeholder = 'Buscar…', emptyText = 'Sin resultados', max }) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => `${o.label} ${o.hint || ''}`.toLowerCase().includes(q)) : options;
  }, [options, query]);
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else if (!max || selected.length < max) onChange([...selected, id]);
  };

  return (
    <div className="rounded-xl border border-[#cbd5e1] bg-white">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 border-b border-[#f1f5f9]">
          {selected.map((id) => {
            const o = options.find((x) => x.id === id);
            return (
              <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#f5f3ff] text-[#501f92] text-[11px] font-semibold border border-[#ddd6fe]">
                {o?.label || id}
                <button type="button" onClick={() => toggle(id)} className="cursor-pointer hover:text-[#dc2626]" aria-label={`Quitar ${o?.label || id}`}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <div className="relative border-b border-[#f1f5f9]">
        <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-2 text-xs rounded-t-xl focus:outline-none text-[#0f172a]"
        />
      </div>
      <ul className="max-h-40 overflow-y-auto custom-scrollbar py-1">
        {filtered.length === 0 && <li className="px-3 py-2 text-xs text-[#94a3b8]">{emptyText}</li>}
        {filtered.map((o) => {
          const checked = selected.includes(o.id);
          const disabled = !checked && !!max && selected.length >= max;
          return (
            <li key={o.id}>
              <label className={`flex items-center gap-2 px-3 py-1.5 text-xs ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#f8fafc]'}`}>
                <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(o.id)} className="accent-[#501f92]" />
                <span className="text-[#0f172a]">{o.label}</span>
                {o.hint && <span className="text-[#94a3b8]">· {o.hint}</span>}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
