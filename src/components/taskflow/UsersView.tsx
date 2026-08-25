import React, { useState } from 'react';
import { UserItem, UserRole, UserStatus } from './types';
import {
  User,
  UserCheck,
  Shield,
  Mail,
  Plus,
  Search,
  ChevronDown,
  Calendar,
  Edit2,
  Trash2,
  MoreVertical
} from 'lucide-react';

interface UsersViewProps {
  users: UserItem[];
  onInviteUser: () => void;
  onDeleteUser?: (id: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onInviteUser,
  onDeleteUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'Active').length;
  const adminUsers = users.filter((u) => u.role === 'Admin').length;
  const invitedUsers = users.filter((u) => u.status === 'Invited').length;

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Title & Invite Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
            Users
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Manage team members and their permissions
          </p>
        </div>
        <button
          onClick={onInviteUser}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#501f92] text-white text-xs font-semibold hover:bg-[#381566] shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Invite User</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-[#6b7280]">Total Users</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight mt-3">
            {totalUsers}
          </p>
        </div>

        {/* Active */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-[#6b7280]">Active</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight mt-3">
            {activeUsers}
          </p>
        </div>

        {/* Admins */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#faf5ff] text-[#9333ea] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-[#6b7280]">Admins</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight mt-3">
            {adminUsers}
          </p>
        </div>

        {/* Invited */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-[#6b7280]">Invited</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight mt-3">
            {invitedUsers}
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e7eb] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-[#9ca3af] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#e5e7eb] rounded-xl text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Roles Filter */}
          <div className="relative w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white border border-[#e5e7eb] text-[#374151] px-4 py-2 pr-9 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
              <option value="Viewer">Viewer</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6b7280] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white border border-[#e5e7eb] text-[#374151] px-4 py-2 pr-9 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Invited">Invited</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6b7280] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#f3f4f6] text-[11px] font-bold text-[#6b7280] uppercase tracking-wider bg-[#fafafa]">
                <th className="py-3.5 px-6 font-semibold">USER</th>
                <th className="py-3.5 px-6 font-semibold">ROLE</th>
                <th className="py-3.5 px-6 font-semibold">STATUS</th>
                <th className="py-3.5 px-6 font-semibold">TASKS</th>
                <th className="py-3.5 px-6 font-semibold">JOINED DATE</th>
                <th className="py-3.5 px-6 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6] text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#9ca3af] text-sm">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#fafafa] transition-colors">
                    {/* USER */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${user.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}
                        >
                          {user.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#111827]">{user.name}</p>
                          <p className="text-xs text-[#6b7280]">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}
                    <td className="py-4 px-6">
                      {user.role === 'Admin' ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-[#faf5ff] text-[#9333ea] border border-[#f3e8ff]">
                          <Shield className="w-3 h-3" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-[#eff6ff] text-[#2563eb]">
                          {user.role}
                        </span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium inline-block ${
                          user.status === 'Active'
                            ? 'bg-[#f0fdf4] text-[#16a34a]'
                            : 'bg-[#fffbeb] text-[#d97706]'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* TASKS */}
                    <td className="py-4 px-6 text-xs text-[#374151]">
                      <span className="font-bold text-[#111827]">{user.tasksCount}</span> tasks
                    </td>

                    {/* JOINED DATE */}
                    <td className="py-4 px-6 text-xs text-[#6b7280]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#9ca3af]" />
                        <span>{user.joinedDate}</span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-[#9ca3af]">
                        <button
                          className="p-1.5 hover:text-[#4f46e5] hover:bg-[#f3f4f6] rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {onDeleteUser && (
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="p-1.5 hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="p-1.5 hover:text-[#111827] hover:bg-[#f3f4f6] rounded-lg transition-colors"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
