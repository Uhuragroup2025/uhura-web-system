/**
 * Bloqueo de la tarea: «Marcar la tarea como bloqueada» con su motivo (§15, aviso al líder,
 * a Comercial y a Relación con clientes del proyecto) y «Ya se desbloqueó».
 */
import React, { useState } from 'react';
import { TaskItem, TaskBlockerInfo, UserItem } from './types';
import { Lock, Unlock } from 'lucide-react';

interface Props {
  task: TaskItem;
  currentUser?: UserItem;
  users?: UserItem[];
  onUpdateBlockerInfo?: (taskId: string, info: TaskBlockerInfo | undefined) => void;
}

export const BlockerControl: React.FC<Props> = ({ task, onUpdateBlockerInfo }) => {
  const blocked = !!task.blockerInfo?.isBlocked;
  const [editing, setEditing] = useState(false);
  const [reason, setReason] = useState('');
  if (!onUpdateBlockerInfo) return null;

  const block = () => {
    if (!reason.trim()) return;
    onUpdateBlockerInfo(task.id, {
      isBlocked: true,
      reason: 'dependency',
      reasonText: reason.trim(),
      responsibleParty: 'Uhura / Interno',
      blockedAt: new Date().toISOString(),
    });
    setEditing(false);
    setReason('');
  };

  if (blocked) {
    return (
      <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-3 text-xs space-y-2">
        <p className="font-bold text-[#991b1b] flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Tarea bloqueada</p>
        <p className="text-[#7f1d1d]">{task.blockerInfo?.reasonText || 'Sin motivo escrito'}</p>
        <button
          type="button"
          onClick={() => onUpdateBlockerInfo(task.id, { isBlocked: false, unblockedAt: new Date().toISOString() })}
          className="inline-flex items-center gap-1 font-bold text-[#166534] cursor-pointer"
        >
          <Unlock className="w-3.5 h-3.5" /> Ya se desbloqueó
        </button>
      </div>
    );
  }
  return editing ? (
    <div className="rounded-2xl border border-[#e2e8f0] p-3 text-xs space-y-1.5">
      <label className="block font-bold text-[#334155]">¿Qué te frena?</label>
      <input
        className="w-full rounded-lg border border-[#e2e8f0] px-2 py-1 text-xs"
        placeholder="Ej.: falta el acceso a Shopify"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="flex justify-end gap-1.5">
        <button type="button" onClick={() => setEditing(false)} className="rounded-lg px-2 py-1 font-bold text-[#64748b] cursor-pointer">Cancelar</button>
        <button type="button" onClick={block} className="rounded-lg bg-[#dc2626] px-2.5 py-1 font-bold text-white cursor-pointer">Marcar bloqueada</button>
      </div>
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#94a3b8] hover:text-[#dc2626] cursor-pointer"
    >
      <Lock className="w-3 h-3" /> Marcar la tarea como bloqueada
    </button>
  );
};
