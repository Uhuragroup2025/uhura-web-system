import React from 'react';
import { X, Info, Bell } from 'lucide-react';
import type { ClientProfile, GoogleChatNotificationMode, ProjectSummaryItem, UserItem } from '../types';
import { GoogleChatIntegrationCard, GoogleChatStatusBadge } from './GoogleChatIntegrationCard';
import {
  canChooseProjectChatMode,
  canManageGoogleChat,
  getProjectChatMode,
  resolveGoogleChatTarget
} from './googleChat';

interface ProjectNotificationsModalProps {
  project: ProjectSummaryItem;
  client?: ClientProfile | null;
  currentUser?: UserItem;
  onClose: () => void;
  onUpdateProject: (updated: ProjectSummaryItem) => void;
}

const OPTIONS: Array<{ id: GoogleChatNotificationMode; label: string; hint: string }> = [
  { id: 'inherit_client', label: 'Usar la integración del cliente', hint: 'Recomendado. Se administra desde la ficha del cliente.' },
  { id: 'disabled', label: 'No enviar notificaciones a Google Chat', hint: 'Las novedades quedan solo dentro de ECO.' },
  { id: 'custom', label: 'Usar un espacio diferente para este proyecto', hint: 'Requiere que un administrador registre el webhook.' }
];

/**
 * Proyecto → ⋮ → Notificaciones.
 * - system_admin: elige cualquier modo y registra/gestiona el webhook propio.
 * - leader: elige heredar o no enviar; consulta estado y espacio (sin URL ni máscara).
 * - executive: solo consulta.
 */
export const ProjectNotificationsModal: React.FC<ProjectNotificationsModalProps> = ({
  project,
  client,
  currentUser,
  onClose,
  onUpdateProject
}) => {
  const level = currentUser?.accessLevel;
  const isAdmin = canManageGoogleChat(level);
  const canChoose = canChooseProjectChatMode(level);
  const mode = getProjectChatMode(project);
  const target = resolveGoogleChatTarget(project, client);
  const clientCfg = client?.googleChat;

  const setMode = (next: GoogleChatNotificationMode) => {
    if (!canChoose) return;
    if (next === 'custom' && !isAdmin && !project.googleChat?.hasWebhook) return;
    onUpdateProject({ ...project, googleChatMode: next });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[#e2e8f0] space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#501f92]/10 text-[#501f92] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#0f172a]">Notificaciones</h3>
              <p className="text-xs text-[#64748b]">{project.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Destino efectivo según la regla de precedencia */}
        <div className={`p-3 rounded-xl border text-xs ${target.source === 'none' ? 'bg-[#f8fafc] border-[#e2e8f0] text-[#475569]' : 'bg-[#ecfdf5] border-[#bbf7d0] text-[#166534]'}`}>
          {target.source === 'project' && <>Las novedades se envían al espacio propio <strong>«{target.spaceName}»</strong>.</>}
          {target.source === 'client' && <>Las novedades se envían a <strong>«{target.spaceName}»</strong>, heredado de {target.clientName}.</>}
          {target.source === 'none' && <>Solo notificaciones dentro de ECO. {target.reason}</>}
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#334155] block">Google Chat</span>
          {OPTIONS.map((opt) => {
            const disabled = !canChoose || (opt.id === 'custom' && !isAdmin && !project.googleChat?.hasWebhook);
            return (
              <label
                key={opt.id}
                className={`flex items-start gap-2.5 p-3 rounded-xl border transition-colors ${
                  mode === opt.id ? 'border-[#501f92] bg-[#faf5ff]' : 'border-[#e2e8f0] bg-white'
                } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[#c4b5fd]'}`}
              >
                <input
                  type="radio"
                  name="google-chat-mode"
                  className="mt-0.5 text-[#501f92]"
                  checked={mode === opt.id}
                  disabled={disabled}
                  onChange={() => setMode(opt.id)}
                />
                <span>
                  <span className="block text-xs font-bold text-[#0f172a]">{opt.label}</span>
                  <span className="block text-[11px] text-[#64748b]">{opt.hint}</span>
                </span>
              </label>
            );
          })}
        </div>

        {/* Detalle del modo heredado */}
        {mode === 'inherit_client' && (
          <div className="rounded-2xl border border-[#e2e8f0] p-3 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#64748b]">Espacio heredado</span>
              {clientCfg?.hasWebhook ? <GoogleChatStatusBadge status={clientCfg.status} /> : <span className="text-[#94a3b8]">Sin configurar</span>}
            </div>
            <p className="font-bold text-[#0f172a]">{clientCfg?.hasWebhook ? clientCfg.spaceName : '—'}</p>
            <p className="text-[#64748b]">Cliente: {client?.name || project.clientName}</p>
            <p className="flex items-start gap-1 text-[#64748b]">
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              Esta configuración se administra desde la ficha del cliente (Integraciones).
            </p>
          </div>
        )}

        {/* Espacio propio del proyecto */}
        {mode === 'custom' && (
          <GoogleChatIntegrationCard
            config={project.googleChat}
            canManage={isAdmin}
            showMask={isAdmin}
            contextLabel="este proyecto"
            previewProjectName={project.name}
            userName={currentUser?.name || 'Sistema'}
            onChange={(next) => onUpdateProject({ ...project, googleChat: next })}
          />
        )}

        {!canChoose && (
          <p className="text-[11px] text-[#64748b]">Tu perfil puede consultar esta configuración, pero no modificarla.</p>
        )}

        <div className="flex justify-end pt-2 border-t border-[#f1f5f9]">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] rounded-xl cursor-pointer">
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
