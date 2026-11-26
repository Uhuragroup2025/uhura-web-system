/**
 * Ayuda corta junto a un título (25 Nov 2026): un ícono «i» que al hacer clic abre una explicación.
 * Se cierra con otro clic, al hacer clic fuera o con Escape. Se dibuja sobre todo (portal), así no lo
 * recortan tablas con scroll ni ventanas modales.
 */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface InfoTipProps {
  /** Nombre corto de lo que explica, para lectores de pantalla («Revisión del cliente»). */
  label: string;
  children: React.ReactNode;
}

export const InfoTip: React.FC<InfoTipProps> = ({ label, children }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (!r) return;
      const width = 260;
      const left = Math.min(Math.max(8, r.left + r.width / 2 - width / 2), window.innerWidth - width - 8);
      setPos({ top: r.bottom + 6, left });
    };
    place();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !boxRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="inline-flex align-middle ml-1 p-0.5 rounded-full text-[#94a3b8] hover:text-[#501f92] hover:bg-[#f5f3ff] cursor-pointer"
        aria-label={`¿Qué es «${label}»?`}
        aria-expanded={open}
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && pos && createPortal(
        <div
          ref={boxRef}
          role="tooltip"
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: 260 }}
          className="z-[3000] rounded-xl border border-[#e2e8f0] bg-white shadow-xl px-3 py-2.5 text-left text-[12px] font-normal normal-case tracking-normal leading-relaxed text-[#334155]"
        >
          <strong className="block text-[#0f172a] mb-0.5">{label}</strong>
          {children}
        </div>,
        document.body
      )}
    </>
  );
};
