import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';

/**
 * Selector de emojis (ronda 2): reacciones y comentarios.
 * - Muestra primero los más usados por la persona (se recuerdan en este navegador).
 * - «+» abre todos los emojis por categoría.
 * - Se cierra al hacer clic afuera, con Esc o al elegir.
 */

const USAGE_KEY = 'eco_emoji_usage_v1';
const DEFAULT_FREQUENT = ['👍', '❤️', '🚀', '👀', '🎉', '🔥', '✅', '🙌'];

const CATEGORIES: { name: string; emojis: string[] }[] = [
  { name: 'Caras', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋', '😜', '🤪', '😎', '🤓', '🧐', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😬', '😌', '😴', '🤯', '🥳', '🥺', '😢', '😭', '😤', '😡', '🤬', '😱', '😨', '😰', '😓', '🤗', '🤭', '🫡', '🫠', '😷', '🤒', '🤠', '😈'] },
  { name: 'Gestos', emojis: ['👍', '👎', '👌', '🤌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '👋', '🫶', '👏', '🙌', '👐', '🤲', '🙏', '🤝', '💪', '✍️', '👀', '🧠', '🫵'] },
  { name: 'Trabajo', emojis: ['✅', '☑️', '✔️', '❌', '⚠️', '🚧', '⏳', '⌛', '⏰', '📅', '📌', '📍', '📎', '🔗', '📝', '📄', '📊', '📈', '📉', '📁', '🗂️', '💼', '💻', '🖥️', '📱', '🧩', '🛠️', '🔧', '⚙️', '🔍', '💡', '📣', '📢', '🔔', '📦', '🚀', '🎯', '🏆', '🥇', '💰', '🧾'] },
  { name: 'Símbolos', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💯', '🔥', '✨', '⭐', '🌟', '💫', '⚡', '💥', '🎉', '🎊', '🎈', '🎁', '👑', '💎', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '➡️', '⬅️', '⬆️', '⬇️', '🔄', '❓', '❗', '💬', '💭'] },
  { name: 'Naturaleza y comida', emojis: ['☀️', '🌤️', '🌧️', '🌈', '❄️', '🌊', '🌱', '🌿', '🌸', '🌻', '🍀', '🐝', '🦋', '🐶', '🐱', '🦊', '🐻', '🐼', '🦁', '🐸', '☕', '🍵', '🍕', '🍔', '🌮', '🍩', '🍪', '🎂', '🍰', '🍿', '🥂', '🍻'] }
];

const readUsage = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(USAGE_KEY) || '{}') || {};
  } catch {
    return {};
  }
};

const recordUsage = (emoji: string) => {
  try {
    const u = readUsage();
    u[emoji] = (u[emoji] || 0) + 1;
    localStorage.setItem(USAGE_KEY, JSON.stringify(u));
  } catch {
    /* sin almacenamiento */
  }
};

const frequentEmojis = (): string[] => {
  const used = Object.entries(readUsage())
    .sort((a, b) => b[1] - a[1])
    .map(([e]) => e);
  return Array.from(new Set([...used, ...DEFAULT_FREQUENT])).slice(0, 8);
};

interface Props {
  /** Contenido del botón que abre el selector. */
  trigger: React.ReactNode;
  triggerClassName?: string;
  triggerTitle?: string;
  onPick: (emoji: string) => void;
  /** Dónde se abre respecto al botón. */
  placement?: 'top-left' | 'top-right';
}

export const EmojiPopover: React.FC<Props> = ({ trigger, triggerClassName, triggerTitle, onPick, placement = 'top-left' }) => {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ left: number; bottom: number } | null>(null);

  // Se dibuja flotando sobre la página (portal) para que ningún contenedor lo recorte.
  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const place = () => {
      const r = rootRef.current!.getBoundingClientRect();
      const width = showAll ? 288 : 300;
      const left = placement === 'top-right' ? r.right - width : r.left;
      setCoords({
        left: Math.max(8, Math.min(left, window.innerWidth - width - 8)),
        bottom: window.innerHeight - r.top + 6
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, showAll, placement]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setShowAll(false);
  }, [open]);

  const pick = (emoji: string) => {
    recordUsage(emoji);
    onPick(emoji);
    setOpen(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={triggerClassName}
        title={triggerTitle}
        aria-label={triggerTitle}
        aria-expanded={open}
      >
        {trigger}
      </button>
      {open && coords && createPortal(
        <div
          ref={popRef}
          style={{ position: 'fixed', left: coords.left, bottom: coords.bottom }}
          className={`z-[1000] bg-white border border-[#e2e8f0] shadow-xl animate-in fade-in zoom-in-95 duration-100 ${
            showAll ? 'w-72 rounded-2xl p-2' : 'rounded-full p-1.5'
          }`}
        >
          {!showAll ? (
            <div className="flex items-center gap-0.5">
              {frequentEmojis().map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => pick(e)}
                  className="p-1 text-sm rounded-full hover:bg-[#f1f5f9] hover:scale-125 transition-transform cursor-pointer"
                >
                  {e}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="ml-0.5 p-1 rounded-full text-[#64748b] hover:text-[#501f92] hover:bg-[#f5f3ff] cursor-pointer"
                title="Ver todos los emojis"
                aria-label="Ver todos los emojis"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Todos los emojis</span>
                <button type="button" onClick={() => setOpen(false)} className="p-0.5 text-[#94a3b8] hover:text-[#0f172a] cursor-pointer" aria-label="Cerrar">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {[{ name: 'Más usados', emojis: frequentEmojis() }, ...CATEGORIES].map((cat) => (
                  <div key={cat.name}>
                    <span className="text-[10px] font-semibold text-[#94a3b8] block mb-1 px-1">{cat.name}</span>
                    <div className="grid grid-cols-8 gap-0.5">
                      {cat.emojis.map((e) => (
                        <button
                          key={`${cat.name}-${e}`}
                          type="button"
                          onClick={() => pick(e)}
                          className="p-1 text-base rounded-lg hover:bg-[#f1f5f9] cursor-pointer"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
