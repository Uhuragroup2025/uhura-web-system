/**
 * Plazo del alcance en palabras simples (25 Nov 2026): «Quedan ~12 h hábiles» en vez de
 * «Plazo del alcance: 28 h hábiles · quedan ~12 h hábiles» o «SLA ~36h handoff».
 *
 * Horario hábil: lunes a viernes, 8:00–12:00 y 14:00–18:00 hora Colombia (UTC−5), sin festivos.
 * El detalle completo (plazo total y fecha en que vence) va en el tooltip.
 */
import { useEffect, useState } from 'react';
import { NewBusinessOpportunity } from '../types';
import { isBusinessDay } from '../health/projectHealthEngine';

const CO_OFFSET_H = -5;
const WORK_BLOCKS: [number, number][] = [[8, 12], [14, 18]];

/** Horas hábiles (Colombia) entre dos instantes; negativo si `to` es anterior a `from`. */
export function businessHoursBetween(from: Date, to: Date): number {
  if (to < from) return -businessHoursBetween(to, from);
  let total = 0;
  // Recorre día por día en hora Colombia
  const startCo = new Date(from.getTime() + CO_OFFSET_H * 3600_000);
  const endCo = new Date(to.getTime() + CO_OFFSET_H * 3600_000);
  const day = new Date(Date.UTC(startCo.getUTCFullYear(), startCo.getUTCMonth(), startCo.getUTCDate()));
  while (day <= endCo) {
    if (isBusinessDay(day)) {
      for (const [h1, h2] of WORK_BLOCKS) {
        const a = Math.max(day.getTime() + h1 * 3600_000, startCo.getTime());
        const b = Math.min(day.getTime() + h2 * 3600_000, endCo.getTime());
        if (b > a) total += (b - a) / 3600_000;
      }
    }
    day.setUTCDate(day.getUTCDate() + 1);
  }
  return total;
}

export interface ScopeTimeLeft {
  /** Texto corto para la etiqueta: «Quedan ~12 h hábiles», «Vencido hace ~3 h hábiles». */
  label: string;
  /** Detalle para el tooltip. */
  title: string;
  tone: 'ok' | 'warning' | 'late' | 'done';
}

const fmtDeadline = (d: Date) =>
  d.toLocaleString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'America/Bogota' });

/** Cuánto le queda al responsable del alcance. Sin fecha límite, muestra el plazo total. */
export function scopeTimeLeft(opp: Pick<NewBusinessOpportunity, 'handoffHours' | 'handoffDeadline' | 'status'>, now = new Date()): ScopeTimeLeft {
  const total = opp.handoffHours || 36;
  const done = ['internal_review', 'won', 'lost', 'converted'].includes(String(opp.status || ''));
  if (done) return { label: 'Alcance entregado', title: `Plazo del alcance: ${total} h hábiles`, tone: 'done' };
  const deadline = opp.handoffDeadline ? new Date(opp.handoffDeadline) : null;
  if (!deadline || isNaN(deadline.getTime())) {
    return { label: `Plazo: ~${total} h hábiles`, title: `Plazo del alcance: ${total} h hábiles (lun–vie, 8–12 y 2–6, hora Colombia)`, tone: 'ok' };
  }
  const left = businessHoursBetween(now, deadline);
  const title = `Plazo del alcance: ${total} h hábiles · vence ${fmtDeadline(deadline)} (lun–vie, 8–12 y 2–6, hora Colombia)`;
  if (left <= 0) return { label: `Vencido hace ~${Math.max(1, Math.round(-left))} h hábiles`, title, tone: 'late' };
  return { label: `Quedan ~${Math.max(1, Math.round(left))} h hábiles`, title, tone: left <= total * 0.25 ? 'warning' : 'ok' };
}

export const SCOPE_TONE_CLASS: Record<ScopeTimeLeft['tone'], string> = {
  ok: 'text-[#0369a1]',
  warning: 'text-[#b45309]',
  late: 'text-[#dc2626]',
  done: 'text-[#059669]'
};

/**
 * Reloj para la etiqueta del plazo: devuelve «ahora» y se actualiza solo cada `minutes` minutos,
 * así «Quedan ~N h hábiles» baja sin recargar la pantalla.
 */
export function useScopeClock(minutes = 5): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), minutes * 60_000);
    return () => window.clearInterval(id);
  }, [minutes]);
  return now;
}
