import React, { useState } from 'react';
import { MessageSquare, CheckCircle2, AlertTriangle, PauseCircle, Clock, Trash2, RefreshCw, KeyRound, X } from 'lucide-react';
import type { GoogleChatIntegration } from '../types';
import {
  GOOGLE_CHAT_STATUS_LABEL,
  buildTestMessagePreview,
  simulateWebhookTest
} from './googleChat';

type CardConfig = GoogleChatIntegration & { isDefaultForProjects?: boolean };

interface GoogleChatIntegrationCardProps {
  config: CardConfig | null | undefined;
  canManage: boolean;            // system_admin
  showMask: boolean;             // Solo system_admin ve la referencia enmascarada
  showDefaultToggle?: boolean;   // Solo a nivel cliente
  contextLabel: string;          // «los proyectos de Neroli» / «este proyecto»
  previewProjectName?: string;
  userName: string;
  onChange: (next: CardConfig | null) => void;
}

const STATUS_STYLE: Record<GoogleChatIntegration['status'], string> = {
  active: 'bg-[#ecfdf5] text-[#166534] border-[#bbf7d0]',
  pending_test: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]',
  inactive: 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]',
  error: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]'
};

const STATUS_ICON: Record<GoogleChatIntegration['status'], React.ReactNode> = {
  active: <CheckCircle2 className="w-3 h-3" />,
  pending_test: <Clock className="w-3 h-3" />,
  inactive: <PauseCircle className="w-3 h-3" />,
  error: <AlertTriangle className="w-3 h-3" />
};

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export const GoogleChatStatusBadge: React.FC<{ status: GoogleChatIntegration['status'] }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLE[status]}`}>
    {STATUS_ICON[status]}
    {GOOGLE_CHAT_STATUS_LABEL[status]}
  </span>
);

export const GoogleChatIntegrationCard: React.FC<GoogleChatIntegrationCardProps> = ({
  config,
  canManage,
  showMask,
  showDefaultToggle = false,
  contextLabel,
  previewProjectName,
  userName,
  onChange
}) => {
  const [mode, setMode] = useState<'view' | 'register' | 'replace'>('view');
  const [spaceName, setSpaceName] = useState('');
  const [url, setUrl] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const hasConfig = Boolean(config && (config.hasWebhook || config.status === 'error'));

  const resetForm = () => {
    setMode('view');
    setUrl(''); // La URL nunca se conserva tras guardar o cancelar
    setSpaceName('');
  };

  const handleSaveAndTest = () => {
    const tested = simulateWebhookTest({
      spaceName: mode === 'replace' ? config?.spaceName || spaceName : spaceName,
      url,
      current: mode === 'replace' ? config : null,
      userName
    });
    // Un reemplazo fallido NO sustituye el webhook vigente: solo registra el intento
    if (mode === 'replace' && config?.hasWebhook && tested.lastTestResult === 'error') {
      onChange({
        ...config,
        lastTestAt: tested.lastTestAt,
        lastTestResult: 'error',
        lastTestMessage: `Reemplazo rechazado: ${tested.lastTestMessage} Se conserva el webhook anterior.`,
        updatedAt: tested.updatedAt,
        updatedByName: userName
      });
      setShowPreview(false);
      resetForm();
      return;
    }
    onChange({
      ...tested,
      ...(showDefaultToggle ? { isDefaultForProjects: mode === 'replace' ? config?.isDefaultForProjects ?? true : isDefault } : {})
    });
    setShowPreview(tested.lastTestResult === 'success');
    resetForm();
  };

  const handleRetest = () => {
    if (!config) return;
    const tested = simulateWebhookTest({ spaceName: config.spaceName, current: config, userName });
    onChange({ ...config, ...tested });
    setShowPreview(tested.lastTestResult === 'success');
  };

  const handleDeactivate = () => {
    if (!config) return;
    onChange({ ...config, status: 'inactive', updatedAt: new Date().toISOString(), updatedByName: userName });
    setShowPreview(false);
  };

  const handleDelete = () => {
    onChange(null);
    setConfirmDelete(false);
    setShowPreview(false);
  };

  const inputCls =
    'w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:ring-2 focus:ring-[#501f92]/20';
  const btn = 'px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5';

  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#ecfdf5] text-[#15803d] flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-[#0f172a]">Google Chat</h4>
            <p className="text-[11px] text-[#64748b]">Novedades importantes para {contextLabel}</p>
          </div>
        </div>
        {hasConfig && config && <GoogleChatStatusBadge status={config.status} />}
      </div>

      {/* Estado actual */}
      {hasConfig && config && mode === 'view' && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
          <div>
            <dt className="text-[#64748b]">Espacio</dt>
            <dd className="font-bold text-[#0f172a]">{config.spaceName || '—'}</dd>
          </div>
          {showMask && (
            <div>
              <dt className="text-[#64748b]">Webhook</dt>
              <dd className="font-mono text-[#0f172a]">{config.webhookMask || 'No registrado'}</dd>
            </div>
          )}
          <div>
            <dt className="text-[#64748b]">Última prueba</dt>
            <dd className="text-[#0f172a]">
              {fmt(config.lastTestAt)}
              {config.lastTestResult && (
                <span className={`ml-1 font-bold ${config.lastTestResult === 'success' ? 'text-[#15803d]' : 'text-[#b91c1c]'}`}>
                  · {config.lastTestResult === 'success' ? 'Satisfactoria' : 'Fallida'}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[#64748b]">Última modificación</dt>
            <dd className="text-[#0f172a]">{config.updatedByName || '—'} · {fmt(config.updatedAt)}</dd>
          </div>
          {showDefaultToggle && (
            <div className="sm:col-span-2">
              <dt className="text-[#64748b]">Proyectos y fees</dt>
              <dd className="text-[#0f172a]">
                {config.isDefaultForProjects ? 'Los proyectos del cliente la heredan por defecto.' : 'No se aplica por defecto a los proyectos.'}
              </dd>
            </div>
          )}
          {config.lastTestResult === 'error' && config.lastTestMessage && (
            <div className="sm:col-span-2 p-2 rounded-lg bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]">
              {config.lastTestMessage}
            </div>
          )}
        </dl>
      )}

      {!hasConfig && mode === 'view' && (
        <p className="text-[11px] text-[#64748b]">
          Sin integración. Las novedades se mantienen solo como notificaciones dentro de ECO.
        </p>
      )}

      {/* Vista previa del mensaje tras una prueba satisfactoria */}
      {showPreview && config?.status === 'active' && mode === 'view' && (
        <div className="rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-3 text-[11px] text-[#0f172a] whitespace-pre-line">
          <span className="block text-[10px] font-bold uppercase text-[#64748b] mb-1">Mensaje de prueba (simulado)</span>
          {buildTestMessagePreview(config.spaceName, previewProjectName)}
        </div>
      )}

      {/* Formularios (solo system_admin) */}
      {canManage && mode !== 'view' && (
        <div className="space-y-2.5 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] p-3">
          {mode === 'register' && (
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold text-[#475569]">Nombre del espacio de Google Chat</span>
              <input value={spaceName} onChange={(e) => setSpaceName(e.target.value)} className={inputCls} placeholder="Ej: Neroli Fragancias" />
            </label>
          )}
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold text-[#475569] flex items-center gap-1">
              <KeyRound className="w-3 h-3" /> {mode === 'replace' ? 'Nueva URL del webhook' : 'URL del webhook'}
            </span>
            <input
              type="password"
              autoComplete="off"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={inputCls}
              placeholder="https://chat.googleapis.com/v1/spaces/…"
            />
            <span className="text-[10px] text-[#64748b] block">No se volverá a mostrar: solo quedará una referencia enmascarada.</span>
          </label>
          {mode === 'register' && showDefaultToggle && (
            <label className="flex items-center gap-2 text-[11px] text-[#334155] cursor-pointer">
              <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded text-[#501f92]" />
              Aplicar como integración predeterminada para los proyectos del cliente
            </label>
          )}
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={resetForm} className={`${btn} text-[#64748b] hover:bg-white`}>Cancelar</button>
            <button
              type="button"
              disabled={!url.trim() || (mode === 'register' && !spaceName.trim())}
              onClick={handleSaveAndTest}
              className={`${btn} text-white bg-[#501f92] hover:bg-[#3d1572] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Guardar y probar
            </button>
          </div>
        </div>
      )}

      {/* Acciones (solo system_admin) */}
      {canManage && mode === 'view' && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#f1f5f9]">
          {!hasConfig && (
            <button type="button" onClick={() => setMode('register')} className={`${btn} text-white bg-[#501f92] hover:bg-[#3d1572] mt-2`}>
              Registrar webhook
            </button>
          )}
          {hasConfig && config && (
            <>
              {config.status === 'active' ? (
                <button type="button" onClick={handleDeactivate} className={`${btn} mt-2 text-[#475569] bg-[#f8fafc] border border-[#e2e8f0] hover:bg-[#f1f5f9]`}>
                  <PauseCircle className="w-3.5 h-3.5" /> Desactivar
                </button>
              ) : config.hasWebhook ? (
                <button type="button" onClick={handleRetest} className={`${btn} mt-2 text-white bg-[#501f92] hover:bg-[#3d1572]`}>
                  <RefreshCw className="w-3.5 h-3.5" /> {config.status === 'inactive' ? 'Reactivar (prueba)' : 'Probar de nuevo'}
                </button>
              ) : null}
              {config.status === 'active' && (
                <button type="button" onClick={handleRetest} className={`${btn} mt-2 text-[#501f92] bg-[#f5f3ff] border border-[#ddd6fe] hover:bg-[#ede9fe]`}>
                  <RefreshCw className="w-3.5 h-3.5" /> Probar
                </button>
              )}
              <button type="button" onClick={() => setMode('replace')} className={`${btn} mt-2 text-[#501f92] bg-[#f5f3ff] border border-[#ddd6fe] hover:bg-[#ede9fe]`}>
                <KeyRound className="w-3.5 h-3.5" /> Reemplazar webhook
              </button>
              <button type="button" onClick={() => setConfirmDelete(true)} className={`${btn} mt-2 ml-auto text-[#b91c1c] hover:bg-[#fef2f2]`}>
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </button>
            </>
          )}
        </div>
      )}

      {/* Confirmación explícita de eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#e2e8f0] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#0f172a]">¿Eliminar la integración?</h3>
              <button onClick={() => setConfirmDelete(false)} className="p-1 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#475569]">
              Se borra la vinculación con «{config?.spaceName}». Para volver a usar Google Chat habrá que registrar un webhook nuevo.
              Si solo quieres pausar los envíos, usa <strong>Desactivar</strong>.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(false)} className={`${btn} text-[#64748b] hover:bg-[#f1f5f9]`}>Cancelar</button>
              <button onClick={handleDelete} className={`${btn} text-white bg-[#dc2626] hover:bg-[#b91c1c]`}>Eliminar integración</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
