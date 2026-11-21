/**
 * Puente entre ECO y la pestaña «Cronograma y acuerdos» (19 Nov 2026).
 *
 * La vista para el cliente se abre en una pestaña propia (?app=eco&cronograma=1). Esa pestaña es otra
 * instancia de la app y no ve los datos en memoria de ECO, así que:
 *  - ECO publica una «foto» de los datos (sin funciones) en localStorage y por BroadcastChannel.
 *  - La pestaña la muestra y, cuando alguien edita, devuelve un comando; ECO lo aplica y publica la
 *    foto nueva. Así las dos ventanas quedan iguales en tiempo real.
 * En producción esto es la misma pantalla leyendo el proyecto por su ruta (/proyectos/:id/cronograma).
 */
import type { ClientKickoffViewProps } from './ClientKickoffView';
import type { PhaseSteps } from '../schedule/clientTimeline';

export const CLIENT_SCHEDULE_PARAM = 'cronograma';
const SNAPSHOT_KEY = 'eco-cronograma-snapshot';
const MESSAGE_KEY = 'eco-cronograma-message';
const CHANNEL_NAME = 'eco-cronograma';

type Callbacks = 'onChangeClientContacts' | 'onChangeSteps' | 'onChangeCommitmentDate' | 'onChangeAgreements' | 'onClientApproval' | 'onApply' | 'onClose' | 'standalone' | 'readOnly' | 'onOpenInNewTab';
export type ClientViewData = Omit<ClientKickoffViewProps, Callbacks> & { canApply: boolean };

export type ClientViewCommand =
  | { type: 'hello' }
  | { type: 'closed' }
  | { type: 'contacts'; approver: string; backup: string }
  | { type: 'steps'; steps: PhaseSteps[] }
  | { type: 'commitmentDate'; key: string; date: string }
  | { type: 'agreements'; list: string[] }
  | { type: 'approval'; approval: { name: string; date: string } | null }
  | { type: 'apply' };

export type BridgeMessage =
  | { kind: 'snapshot'; data: ClientViewData | null }
  | { kind: 'command'; cmd: ClientViewCommand };

export function toClientViewData(props: ClientKickoffViewProps): ClientViewData {
  const { onChangeClientContacts, onChangeSteps, onChangeCommitmentDate, onChangeAgreements, onClientApproval, onApply, onClose, standalone, readOnly, onOpenInNewTab, ...data } = props;
  void onChangeClientContacts; void onChangeSteps; void onChangeCommitmentDate; void onChangeAgreements; void onClientApproval; void onClose; void standalone; void readOnly; void onOpenInNewTab;
  return { ...data, canApply: Boolean(onApply) };
}

export function isClientScheduleWindow(): boolean {
  try {
    return new URLSearchParams(window.location.search).get(CLIENT_SCHEDULE_PARAM) === '1';
  } catch {
    return false;
  }
}

export function clientScheduleUrl(data?: ClientViewData | null): string {
  const base = `${window.location.origin}${window.location.pathname}?app=eco&${CLIENT_SCHEDULE_PARAM}=1`;
  return data ? `${base}#d=${encodeSnapshot(data)}` : base;
}

/**
 * La foto también viaja en el enlace (#d=…), así la pestaña muestra los datos aunque se abra en otro
 * navegador o el panel no comparta almacenamiento. Sin conexión con ECO queda en solo lectura.
 */
export function encodeSnapshot(data: ClientViewData): string {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return encodeURIComponent(btoa(bin));
}

export function readSnapshotFromHash(): ClientViewData | null {
  try {
    const m = window.location.hash.match(/[#&]d=([^&]+)/);
    if (!m) return null;
    const bin = atob(decodeURIComponent(m[1]));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as ClientViewData;
  } catch {
    return null;
  }
}

export function saveSnapshot(data: ClientViewData | null) {
  try {
    if (data) localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(data));
  } catch {
    /* sin almacenamiento: la pestaña recibe la foto por el canal */
  }
}

export function readSnapshot(): ClientViewData | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as ClientViewData) : null;
  } catch {
    return null;
  }
}

/**
 * Canal entre pestañas: BroadcastChannel y, como respaldo, el evento `storage`.
 * Cada mensaje lleva un id para no procesarlo dos veces.
 */
export function openBridge(onMessage: (msg: BridgeMessage) => void) {
  const seen = new Set<string>();
  const handle = (packet: { id: string; msg: BridgeMessage } | null) => {
    if (!packet || seen.has(packet.id)) return;
    seen.add(packet.id);
    onMessage(packet.msg);
  };
  let channel: BroadcastChannel | null = null;
  try {
    channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;
    if (channel) channel.onmessage = (e) => handle(e.data);
  } catch {
    channel = null;
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key !== MESSAGE_KEY || !e.newValue) return;
    try {
      handle(JSON.parse(e.newValue));
    } catch {
      /* mensaje inválido */
    }
  };
  window.addEventListener('storage', onStorage);

  return {
    post(msg: BridgeMessage) {
      const packet = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, msg };
      seen.add(packet.id);
      try {
        channel?.postMessage(packet);
      } catch {
        /* canal cerrado */
      }
      try {
        localStorage.setItem(MESSAGE_KEY, JSON.stringify(packet));
      } catch {
        /* sin almacenamiento */
      }
    },
    close() {
      window.removeEventListener('storage', onStorage);
      try {
        channel?.close();
      } catch {
        /* ya cerrado */
      }
    }
  };
}
