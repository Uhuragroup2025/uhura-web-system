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
  /** Para que system_admin registre aquí mismo el espacio del cliente si aún no existe. */
  onUpdateClient?: (updated: ClientProfile) => void;
}

const OPTIONS: Array<{ id: GoogleChatNotificationMode; label: string; hint: string }> = [
  { id: 'inherit_client', label: 'Activar notificaciones', hint: 'Las novedades importantes llegan al espacio de Google Chat del cliente.' },
  { id: 'disabled', label: 'No enviar notificaciones a Google Chat', hint: 'Predeterminado. Las novedades quedan solo dentro de ECO.' }
];

/**
 * Proyecto → ⋮ → Notificaciones (simplificado 07 Nov 2026).
 * - Dos opciones: activar (usa el espacio del cliente) o no enviar (predeterminado).
 * - Si el cliente aún no tiene espacio: system_admin lo registra aquí mismo (queda en el
 *   cliente y sirve para todos sus proyectos); los demás ven a quién pedírselo.
 * - leader: activa o desactiva; executive: solo consulta.
 */
export const ProjectNotificationsModal: React.FC<ProjectNotificationsModalProps> = ({
  project,
  client,
  currentUser,
  onClose,
  onUpdateProject,
  onUpdateClient
}) => {
  const level = currentUser?.accessLevel;
  const isAdmin = canManageGoogleChat(level);
  const canChoose = canChooseProjectChatMode(level);
  const mode = getProjectChatMode(project);
  const target = resolveGoogleChatTarget(project, client);
  const clientCfg = client?.googleChat;

  const setMode = (next: GoogleChatNotificationMode) => {
    if (!canChoose) return;
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
          {target.source === 'project' && <>Las novedades se envían a <strong>«{target.spaceName}»</strong>.</>}
          {target.source === 'client' && <>Las novedades se envían a <strong>«{target.spaceName}»</strong>, el espacio de {target.clientName}.</>}
          {target.source === 'none' && <>Solo notificaciones dentro de ECO. {target.reason}</>}
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#334155] block">Google Chat</span>
          {OPTIONS.map((opt) => {
            const disabled = !canChoose;
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

        {/* Activado: espacio del cliente (o registrarlo si aún no existe) */}
        {mode === 'inherit_client' && (
          clientCfg?.hasWebhook ? (
            <div className="rounded-2xl border border-[#e2e8f0] p-3 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#64748b]">Espacio del cliente</span>
                <GoogleChatStatusBadge status={clientCfg.status} />
              </div>
              <p className="font-bold text-[#0f172a]">{clientCfg.spaceName}</p>
              <p className="flex items-start gap-1 text-[#64748b]">
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                Es el mismo espacio para todos los proyectos de {client?.name || project.clientName}. Se cambia en la ficha del cliente → Integraciones.
              </p>
            </div>
          ) : isAdmin && client && onUpdateClient ? (
            <div className="space-y-2">
              <p className="text-[11px] text-[#64748b]">
                {client.name} aún no tiene espacio de Google Chat. Regístralo aquí: quedará en la ficha del cliente y servirá para todos sus proyectos.
              </p>
              <GoogleChatIntegrationCard
                config={client.googleChat}
                canManage
                showMask
                contextLabel={`los proyectos de ${client.name}`}
                previewProjectName={project.name}
                userName={currentUser?.name || 'Sistema'}
                onChange={(next) => onUpdateClient({ ...client, googleChat: next ? { ...next, isDefaultForProjects: true } : null })}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-3 text-[11px] text-[#92400e] flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Quedará activo cuando un administrador del sistema registre el webhook de {client?.name || project.clientName} (ficha del cliente → Integraciones). Mientras tanto, las novedades quedan dentro de ECO.
              </span>
            </div>
          )
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
