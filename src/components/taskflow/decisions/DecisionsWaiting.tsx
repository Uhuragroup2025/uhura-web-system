/**
 * Mi Día · «Decisiones que te esperan» (BACKEND_REQUIREMENTS §32.7).
 * Decisiones en revisión donde la persona es revisora y aún no responde.
 * No suman a pendientes, carga ni capacidad. Al tocar una, abre la tarea en la sección Decisiones.
 */
import React from 'react';
import { Scale, ChevronRight } from 'lucide-react';
import { businessHoursLeft, waitingFor } from './decisionStore';
import { useDecisionsVersion } from './DecisionsSection';

export const openTaskDecisions = (taskId?: string) => {
  if (taskId) window.dispatchEvent(new CustomEvent('eco:open-task', { detail: { taskId, focus: 'decisiones' } }));
};

export const DecisionsWaiting: React.FC<{ userId?: string }> = ({ userId }) => {
  useDecisionsVersion();
  if (!userId) return null;
  const list = waitingFor(userId);
  if (!list.length) return null;
  return (
    <div className="pt-3 border-t border-[#f1f5f9]">
      <p className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a]"><Scale className="w-3.5 h-3.5 text-[#501f92]" /> Decisiones que te esperan · {list.length}</p>
      <ul className="mt-2 space-y-1.5">
        {list.map((d) => (
          <li key={d.id}>
            <button type="button" onClick={() => openTaskDecisions(d.taskId)} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#faf5ff] hover:bg-[#f3e8ff] border border-[#ede9fe] text-left text-xs cursor-pointer">
              <span className="flex-1 min-w-0">
                <span className="block truncate font-semibold text-[#0f172a]">{d.title}</span>
                <span className="block truncate text-[10.5px] text-[#64748b]">{d.author.name.split(' ')[0]} · {d.projectName} · cierra en {businessHoursLeft(d.closesAt)} h hábiles. Si no respondes, cuenta como acuerdo.</span>
              </span>
              <ChevronRight className="w-4 h-4 shrink-0 text-[#a78bfa]" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
