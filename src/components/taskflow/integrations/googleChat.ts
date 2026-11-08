/**
 * Google Chat — reglas de negocio del prototipo (simplificado 07 Nov 2026).
 *
 * Cada cliente tiene UN espacio de Google Chat (webhook) que registra system_admin en la ficha
 * del cliente → Integraciones. Cada proyecto decide solo dos cosas:
 *  - «Activar notificaciones»  → se envían al espacio del cliente (si está activo).
 *  - «No enviar» (predeterminado) → solo notificaciones dentro de ECO.
 * Ya no existe un espacio propio por proyecto ni la marca «predeterminado para sus proyectos».
 *
 * Seguridad: la URL solo vive en el input mientras se escribe. Al guardar se valida el
 * formato, se calcula una máscara y la URL se descarta. Las pruebas son SIMULADAS:
 * el prototipo nunca hace solicitudes a Google Chat.
 */
import type {
  ClientProfile,
  GoogleChatIntegration,
  GoogleChatNotificationMode,
  OrbitAccessLevel,
  ProjectSummaryItem
} from '../types';

export type GoogleChatTarget =
  | { source: 'project'; spaceName: string }
  | { source: 'client'; spaceName: string; clientName: string }
  | { source: 'none'; reason: string };

/** 'inherit_client' = activado (usa el espacio del cliente); cualquier otro valor = no se envía. */
export function getProjectChatMode(project: Pick<ProjectSummaryItem, 'googleChatMode'>): GoogleChatNotificationMode {
  // Compatibilidad: el antiguo «espacio propio» ('custom') se trata como activado con el espacio del cliente.
  if (project.googleChatMode === 'inherit_client' || project.googleChatMode === 'custom') return 'inherit_client';
  return 'disabled';
}

export const isProjectChatEnabled = (project: Pick<ProjectSummaryItem, 'googleChatMode'>) =>
  getProjectChatMode(project) === 'inherit_client';

export function resolveGoogleChatTarget(
  project: Pick<ProjectSummaryItem, 'googleChatMode' | 'googleChat'>,
  client?: Pick<ClientProfile, 'name' | 'googleChat'> | null
): GoogleChatTarget {
  if (!isProjectChatEnabled(project)) {
    return { source: 'none', reason: 'Google Chat no está activado para este proyecto.' };
  }
  const cfg = client?.googleChat;
  if (!cfg || !cfg.hasWebhook) {
    return { source: 'none', reason: 'El cliente no tiene Google Chat configurado.' };
  }
  if (cfg.status !== 'active') {
    return { source: 'none', reason: 'La integración del cliente está inactiva o con error.' };
  }
  return { source: 'client', spaceName: cfg.spaceName, clientName: client!.name };
}

/* ---------------- Permisos ---------------- */

/** Registrar, probar, activar/desactivar, reemplazar y eliminar webhooks. */
export const canManageGoogleChat = (level?: OrbitAccessLevel) => level === 'system_admin';

/** Consultar estado, espacio, última prueba y última modificación en la ficha del cliente. */
export const canViewClientIntegrations = (level?: OrbitAccessLevel) =>
  level === 'system_admin' || level === 'executive';

/** Consultar desde el proyecto si hay Google Chat activo y qué espacio usa. */
export const canViewProjectNotifications = (level?: OrbitAccessLevel) =>
  level === 'system_admin' || level === 'executive' || level === 'leader';

/** Activar o desactivar Google Chat en un proyecto (sin registrar URLs). */
export const canChooseProjectChatMode = (level?: OrbitAccessLevel) =>
  level === 'system_admin' || level === 'leader';

/* ---------------- Webhook (simulado) ---------------- */

const WEBHOOK_PATTERN = /^https:\/\/chat\.googleapis\.com\/v1\/spaces\/[A-Za-z0-9_-]+\/messages\?key=[^&\s]+&token=[^&\s]+$/;

export function isValidGoogleChatWebhook(url: string): boolean {
  return WEBHOOK_PATTERN.test(url.trim());
}

/** Referencia enmascarada: solo los últimos 4 caracteres. */
export function maskWebhook(url: string): string {
  const clean = url.trim();
  return `••••••••••••${clean.slice(-4)}`;
}

/**
 * Prueba simulada. Éxito si el formato es el de un webhook de Google Chat.
 * Devuelve la integración actualizada SIN la URL.
 */
export function simulateWebhookTest(params: {
  spaceName: string;
  url?: string;                         // Nueva URL (registro o reemplazo)
  current?: GoogleChatIntegration | null; // Configuración existente (re-prueba / reactivación)
  userName: string;
}): GoogleChatIntegration {
  const now = new Date().toISOString();
  const hasNewUrl = Boolean(params.url && params.url.trim());
  const ok = hasNewUrl ? isValidGoogleChatWebhook(params.url!) : Boolean(params.current?.hasWebhook);
  return {
    spaceName: params.spaceName.trim(),
    hasWebhook: hasNewUrl ? ok || Boolean(params.current?.hasWebhook) : Boolean(params.current?.hasWebhook),
    webhookMask: hasNewUrl && ok ? maskWebhook(params.url!) : params.current?.webhookMask ?? null,
    status: ok ? 'active' : 'error',
    lastTestAt: now,
    lastTestResult: ok ? 'success' : 'error',
    lastTestMessage: ok
      ? 'Mensaje de prueba entregado (simulado).'
      : 'La URL no corresponde a un webhook de Google Chat (https://chat.googleapis.com/v1/spaces/…).',
    updatedAt: now,
    updatedByName: params.userName
  };
}

export function buildTestMessagePreview(spaceName: string, projectName?: string): string {
  return [
    '👋 ¡Hola, equipo! Soy ECO 🦫.',
    '',
    projectName
      ? `Este espacio quedó conectado para las novedades de “${projectName}”.`
      : `Este espacio (“${spaceName}”) quedó conectado para las novedades de sus proyectos.`,
    '',
    '[Ver en ECO]'
  ].join('\n');
}

export const GOOGLE_CHAT_STATUS_LABEL: Record<GoogleChatIntegration['status'], string> = {
  pending_test: 'Pendiente de prueba',
  active: 'Conectado',
  inactive: 'Inactivo',
  error: 'Error'
};
