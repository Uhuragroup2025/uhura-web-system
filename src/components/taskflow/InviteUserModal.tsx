import React, { useState } from 'react';
import { UserItem, UserRole } from './types';
import { X, Mail, Shield, User, Check } from 'lucide-react';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: UserItem) => void;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onAddUser
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Member');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'US';

    const bgColors = ['bg-[#501f92]', 'bg-[#e11d48]', 'bg-[#0284c7]', 'bg-[#16a34a]', 'bg-[#ea580c]', 'bg-[#7c3aed]'];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];

    const newUser: UserItem = {
      id: `u-${Date.now()}`,
      name,
      email,
      initials,
      avatarBg: randomBg,
      role,
      status: 'Invited',
      tasksCount: 0,
      joinedDate: 'Today'
    };

    onAddUser(newUser);
    setName('');
    setEmail('');
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5e7eb] animate-in zoom-in-95 duration-100">
        <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9]">
          <div>
            <h3 className="text-base font-bold text-[#0f172a]">Invitar Colaborador</h3>
            <p className="text-xs text-[#64748b] mt-0.5">Agrega un nuevo miembro al equipo de Orbit</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Carlos Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              placeholder="carlos@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">
              Rol Inicial en el Espacio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Member', 'Admin', 'Viewer'] as UserRole[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    role === r
                      ? 'bg-[#f5f3ff] border-[#8a4dff] text-[#501f92]'
                      : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]'
                  }`}
                >
                  {r === 'Member' ? 'Colaborador' : r === 'Admin' ? 'Admin' : 'Observador'}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#501f92] hover:bg-[#381566] rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              Enviar Invitación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
