import React, { useState } from 'react';
import type { UserItem, UserProfileAuditEntry } from '../types';

/**
 * «Acceso a ECO» en el perfil de la persona (igual a producción).
 * Solo system_admin. Asigna o cambia el usuario de ingreso y restablece el acceso con una
 * contraseña temporal que escribe quien administra y entrega por un canal privado.
 *
 * Prototipo: la contraseña NUNCA se guarda ni se muestra; solo se valida y queda en el
 * historial el hecho «Acceso restablecido» (sin el valor). En producción la recibe el backend
 * por HTTPS, la guarda con hash y obliga a cambiarla en el primer ingreso.
 */

interface Props {
  user: UserItem;
  allUsers: UserItem[];
  adminName: string;
  onUpdateUser: (u: UserItem) => void;
}

const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;
const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Nunca';

export const UserAccessCard: React.FC<Props> = ({ user, allUsers, adminName, onUpdateUser }) => {
  const [username, setUsername] = useState(user.loginUsername || '');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const isInactive = user.status === 'Inactive';
  const hasUsername = Boolean(user.loginUsername);
  const status = isInactive
    ? { label: 'Desactivado', cls: 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]' }
    : user.hasPassword
    ? { label: 'Con contraseña', cls: 'bg-[#ecfdf5] text-[#166534] border-[#bbf7d0]' }
    : { label: 'Sin acceso asignado', cls: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]' };

  const audit = (field: string, prev: string | null, next: string | null): UserProfileAuditEntry => ({
    id: `audit-${Date.now()}-${field}`,
    userId: user.id,
    field,
    previousValue: prev,
    newValue: next,
    changedAt: new Date().toISOString(),
    changedByUserId: 'current-user',
    changedByUserName: adminName
  });

  const handleUsername = () => {
    const next = username.trim().toLowerCase();
    if (!USERNAME_RE.test(next)) {
      setMsg({ kind: 'error', text: 'Usa de 3 a 32 caracteres: letras minúsculas, números, punto, guion o guion bajo. Sin espacios.' });
      return;
    }
    if (next === user.loginUsername) {
      setMsg({ kind: 'error', text: 'Ese ya es su usuario de ingreso.' });
      return;
    }
    if (allUsers.some((u) => u.id !== user.id && (u.loginUsername || '').toLowerCase() === next)) {
      setMsg({ kind: 'error', text: 'Ese usuario ya lo tiene otra persona.' });
      return;
    }
    onUpdateUser({
      ...user,
      loginUsername: next,
      profileHistory: [audit('Usuario de ingreso', user.loginUsername || null, next), ...(user.profileHistory || [])]
    });
    setUsername(next);
    setMsg({ kind: 'ok', text: hasUsername ? 'Usuario cambiado. La contraseña no cambia; avísale por un canal privado.' : 'Usuario asignado. Ahora asígnale una contraseña temporal.' });
  };

  const handlePassword = () => {
    if (!user.loginUsername) {
      setMsg({ kind: 'error', text: 'Primero asigna un usuario de ingreso.' });
      return;
    }
    if (pwd.length < 8) {
      setMsg({ kind: 'error', text: 'La contraseña temporal debe tener mínimo 8 caracteres.' });
      return;
    }
    if (pwd !== pwd2) {
      setMsg({ kind: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    // La contraseña no se guarda en el prototipo: solo el hecho queda en el historial.
    onUpdateUser({
      ...user,
      hasPassword: true,
      mustChangePassword: true,
      profileHistory: [audit('Acceso', null, user.hasPassword ? 'Acceso restablecido (contraseña temporal)' : 'Acceso asignado (contraseña temporal)'), ...(user.profileHistory || [])]
    });
    setPwd('');
    setPwd2('');
    setMsg({ kind: 'ok', text: 'Listo. Entrégale la contraseña por un canal privado; deberá cambiarla al entrar.' });
  };

  const setActive = (active: boolean) => {
    onUpdateUser({
      ...user,
      status: active ? 'Active' : 'Inactive',
      profileHistory: [audit('Estado', user.status || null, active ? 'Activo' : 'Desactivado'), ...(user.profileHistory || [])]
    });
    setConfirmDeactivate(false);
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff] disabled:bg-[#f8fafc] disabled:text-[#94a3b8]';
  const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-[#475569] mb-1.5';

  return (
    <section className="bg-white rounded-3xl border border-[#e2e8f0] p-5 sm:p-6 shadow-xs space-y-4" aria-labelledby="access-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="access-title" className="text-base font-bold text-[#0f172a] tracking-tight">Acceso a ECO</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.cls}`}>{status.label}</span>
      </div>
      <p className="text-sm text-[#475569]">
        Usuario de ingreso: <strong className="text-[#0f172a]">{user.loginUsername || 'Sin asignar'}</strong> · Último ingreso:{' '}
        <strong className="text-[#0f172a]">{fmt(user.lastLoginAt)}</strong>
      </p>

      <div>
        <label htmlFor={`username-${user.id}`} className={labelCls}>Usuario de ingreso</label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            id={`username-${user.id}`}
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
            disabled={isInactive}
            autoComplete="off"
            placeholder="ej. nombre.apellido"
            className={inputCls}
          />
          <button
            type="button"
            onClick={handleUsername}
            disabled={isInactive}
            className="sm:w-56 shrink-0 px-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm font-bold text-[#0f172a] hover:bg-[#f8fafc] cursor-pointer disabled:opacity-50"
          >
            {hasUsername ? 'Cambiar usuario' : 'Asignar usuario'}
          </button>
        </div>
        <p className="text-xs text-[#94a3b8] mt-1.5">Sin espacios. La contraseña no cambia; avísale a la persona por un canal privado.</p>
      </div>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_14rem] gap-2.5 items-end">
          <div>
            <label htmlFor={`pwd-${user.id}`} className={labelCls}>Contraseña temporal</label>
            <input id={`pwd-${user.id}`} type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="new-password" disabled={isInactive} className={inputCls} />
          </div>
          <div>
            <label htmlFor={`pwd2-${user.id}`} className={labelCls}>Repítela</label>
            <input id={`pwd2-${user.id}`} type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} autoComplete="new-password" disabled={isInactive} className={inputCls} />
          </div>
          <button
            type="button"
            onClick={handlePassword}
            disabled={isInactive}
            className="px-4 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            {user.hasPassword ? 'Restablecer acceso' : 'Asignar acceso'}
          </button>
        </div>
        <p className="text-xs text-[#94a3b8] mt-1.5">Mínimo 8 caracteres. Entrégala por un canal privado; el historial registra el cambio, nunca la contraseña.</p>
      </div>

      {msg && (
        <p role="status" className={`text-xs px-3 py-2 rounded-xl border ${msg.kind === 'ok' ? 'bg-[#ecfdf5] border-[#bbf7d0] text-[#166534]' : 'bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]'}`}>
          {msg.text}
        </p>
      )}

      <div className="pt-4 border-t border-[#f1f5f9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-[#475569]">
          {isInactive
            ? 'Usuario desactivado: no puede entrar ni aparece para asignar trabajo. Su historia se conserva.'
            : 'Al desactivarla no puede entrar ni aparece para asignar trabajo. Su historia de horas y proyectos se conserva.'}
        </p>
        {isInactive ? (
          <button onClick={() => setActive(true)} className="px-4 py-2 rounded-xl border border-[#16a34a] text-[#166534] text-sm font-bold cursor-pointer shrink-0">Reactivar usuario</button>
        ) : confirmDeactivate ? (
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setConfirmDeactivate(false)} className="px-3 py-2 rounded-xl text-sm font-bold text-[#64748b] cursor-pointer">Cancelar</button>
            <button onClick={() => setActive(false)} className="px-4 py-2 rounded-xl bg-[#dc2626] text-white text-sm font-bold cursor-pointer">Confirmar desactivación</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDeactivate(true)} className="px-4 py-2 rounded-xl border border-[#fecaca] text-[#b91c1c] text-sm font-bold cursor-pointer shrink-0">Desactivar usuario</button>
        )}
      </div>
    </section>
  );
};
