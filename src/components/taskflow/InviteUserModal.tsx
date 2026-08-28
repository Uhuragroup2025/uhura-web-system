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
        <div className="flex items-center justify-between pb-4 border-b border-[#f3f4f6]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#111827]">Invite Team Member</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9ca3af] hover:text-[#111827] hover:bg-[#f3f4f6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Carlos Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="carlos@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Workspace Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Member', 'Admin', 'Viewer'] as UserRole[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    role === r
                      ? 'bg-[#eef2ff] border-[#4f46e5] text-[#4f46e5]'
                      : 'bg-white border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9fafb]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#f3f4f6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] rounded-xl shadow-xs transition-colors"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
