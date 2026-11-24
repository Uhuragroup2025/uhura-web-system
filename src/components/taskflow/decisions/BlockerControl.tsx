/**
 * Bloqueo de la tarea con «¿Quién te ayudó?» (BACKEND_REQUIREMENTS §32.9).
 * Al quitar el bloqueo, la persona puede elegir quién la ayudó: eso da 15 ECOINS a esa persona.
 */
import React, { useState } from 'react';
import { TaskItem, TaskBlockerInfo, UserItem } from '../types';
import { registerUnblock } from '../colonia/plaza/contributionsStore';
import { Lock, Unlock } from 'lucide-react';

interface Props {
  task: TaskItem;
  currentUser?: UserItem;
  users: UserItem[];
  onUpdateBlockerInfo?: (taskId: string, info: TaskBlockerInfo | undefined) => void;
}

export const BlockerControl: React.FC<Props> = ({ task, currentUser, users, onUpdateBlockerInfo }) => {
  const blocked = !!task.blockerInfo?.isBlocked;
  const [mode, setMode] = useState<null | 'block' | 'unblock'>(null);
  const [reason, setReason] = useState('');
  const [helperId, setHelperId] = useState('');
  if (!onUpdateBlockerInfo) return null;

  const block = () => {
    if (!reason.trim()) return;
    onUpdateBlockerInfo(task.id, { isBlocked: true, reason: 'dependency', reasonText: reason.trim(), responsibleParty: 'Uhura / Interno', blockedAt: new Date().toISOString() });
    setMode(null); setReason('');
  };
  const unblock = () => {
    onUpdateBlockerInfo(task.id, { isBlocked: false, unblockedAt: new Date().toISOString() });
    const helper = users.find((u) => u.id === helperId);
    if (helper && currentUser) registerUnblock(task.id, task.title, { id: currentUser.id, name: currentUser.name }, { id: helper.id, name: helper.name });
    setMode(null); setHelperId('');
  };

  if (blocked) {
    return (
      <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-3 text-xs space-y-2">
        <p className="font-bold text-[#991b1b] flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Tarea bloqueada</p>
        <p className="text-[#7f1d1d]">{task.blockerInfo?.reasonText || 'Sin motivo escrito'}</p>
        {mode === 'unblock' ? (
          <div className="space-y-1.5">
            <label className="block font-bold text-[#334155]">¿Quién te ayudó a desbloquearla? (opcional)</label>
            <select className="w-full rounded-lg border border-[#e2e8f0] bg-white px-2 py-1 text-xs" value={helperId} onChange={(e) => setHelperId(e.target.value)}>
              <option value="">Nadie en especial</option>
              {users.filter((u) => u.status !== 'Inactive' && u.id !== currentUser?.id).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <p className="text-[10.5px] text-[#64748b]">Si eliges a alguien, recibe 15 ECOINS por ayudarte.</p>
            <div className="flex justify-end gap-1.5">
              <button type="button" onClick={() => setMode(null)} className="rounded-lg px-2 py-1 font-bold text-[#64748b] cursor-pointer">Cancelar</button>
              <button type="button" onClick={unblock} className="rounded-lg bg-[#166534] px-2.5 py-1 font-bold text-white cursor-pointer">Quitar bloqueo</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setMode('unblock')} className="inline-flex items-center gap-1 font-bold text-[#166534] cursor-pointer"><Unlock className="w-3.5 h-3.5" /> Ya se desbloqueó</button>
        )}
      </div>
    );
  }
  return mode === 'block' ? (
    <div className="rounded-2xl border border-[#e2e8f0] p-3 text-xs space-y-1.5">
      <label className="block font-bold text-[#334155]">¿Qué te frena?</label>
      <input className="w-full rounded-lg border border-[#e2e8f0] px-2 py-1 text-xs" placeholder="Ej.: falta el acceso a Shopify" value={reason} onChange={(e) => setReason(e.target.value)} />
      <div className="flex justify-end gap-1.5">
        <button type="button" onClick={() => setMode(null)} className="rounded-lg px-2 py-1 font-bold text-[#64748b] cursor-pointer">Cancelar</button>
        <button type="button" onClick={block} className="rounded-lg bg-[#dc2626] px-2.5 py-1 font-bold text-white cursor-pointer">Marcar bloqueada</button>
      </div>
    </div>
  ) : (
    <button type="button" onClick={() => setMode('block')} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#94a3b8] hover:text-[#dc2626] cursor-pointer"><Lock className="w-3 h-3" /> Marcar la tarea como bloqueada</button>
  );
};
