import React, { useState } from 'react';
import { UserItem, OrbitAccessLevel } from '../types';
import { Shield, Sparkles, ChevronUp, ChevronDown, Check, UserCheck, AlertTriangle } from 'lucide-react';

interface DevQaRoleSimulatorProps {
  currentUser: UserItem;
  availableUsers: UserItem[];
  onSelectUser: (user: UserItem) => void;
}

// Colaborador sintético exclusivo para probar el nivel 'collaborator' en QA sin inventar datos de empleados reales
const DEMO_COLLABORATOR_USER: UserItem = {
  id: 'qa-collaborator',
  name: 'Colaborador Demo',
  email: 'collaborator.qa@uhuragroup.com',
  initials: 'CD',
  avatarBg: 'bg-[#0284c7]',
  role: 'Member',
  status: 'Active',
  tasksCount: 6,
  joinedDate: 'Mar 2024',
  capacityHours: 40,
  utilizedPercent: 85,
  jobTitle: 'Front-End / Digital Specialist',
  officialRole: 'Front-End Dev',
  professionalRole: 'Front-End Dev',
  accessLevel: 'collaborator'
};

/**
 * SIMULADOR DE ROLES Y PERMISOS (SOLO QA Y DESARROLLO)
 * 
 * ⚠️ AVISO DE ARQUITECTURA:
 * Este componente es una herramienta TEMPORAL de auditoría y pruebas para validar
 * el comportamiento reactivo de la matriz RBAC en el prototipo.
 * 
 * NO forma parte del producto final de producción.
 * En producción definitiva:
 * - `currentUser` se obtiene exclusivamente mediante sesión autenticada (JWT / Google Workspace OAuth).
 * - Las reglas de autorización deben ejecutarse de forma estricta e idéntica en la API del backend.
 */
export const DevQaRoleSimulator: React.FC<DevQaRoleSimulatorProps> = ({
  currentUser,
  availableUsers,
  onSelectUser
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filtramos solo los usuarios confirmados oficialmente con accessLevel definido
  const confirmedUsers = availableUsers.filter((u) => Boolean(u.accessLevel));

  const simulationOptions: Array<{ label: string; user: UserItem; badge: string; badgeColor: string }> = [
    ...confirmedUsers.map((u) => ({
      label: u.name,
      user: u,
      badge: `${u.professionalRole || u.jobTitle} · ${u.accessLevel}`,
      badgeColor:
        u.accessLevel === 'executive'
          ? 'bg-purple-100 text-purple-800 border-purple-200'
          : u.accessLevel === 'commercial'
          ? 'bg-blue-100 text-blue-800 border-blue-200'
          : u.accessLevel === 'administrative'
          ? 'bg-amber-100 text-amber-800 border-amber-200'
          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
    })),
    {
      label: 'Colaborador Operativo (Prueba RBAC)',
      user: DEMO_COLLABORATOR_USER,
      badge: 'Front-End Dev · collaborator',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    }
  ];

  return (
    <aside
      aria-label="Simulador de Permisos y Roles de Desarrollo"
      className="fixed bottom-3 right-3 z-50 max-w-sm rounded-xl border border-[#8a4dff]/40 bg-[#0d0718]/95 text-white shadow-2xl backdrop-blur-md transition-all text-xs"
    >
      {/* Header bar del simulador */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between gap-3 px-3 py-2 cursor-pointer select-none hover:bg-white/5 rounded-t-xl"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#8a4dff]/30 text-[#d4ff4a]">
            <Shield className="w-3 h-3" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
              <span>Simulador QA</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#8a4dff]/40 text-[#d4ff4a] uppercase">
                Dev
              </span>
            </div>
            <p className="text-[10px] text-[#c9b7ff]/70 truncate max-w-[170px]">
              {currentUser.name} ({currentUser.accessLevel || 'pending'})
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={isExpanded ? 'Contraer simulador' : 'Expandir simulador'}
          className="p-1 text-[#c9b7ff]/70 hover:text-white"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Contenido expandido con opciones de rol */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-[#261845] space-y-2">
          <div className="flex items-start gap-1.5 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-[10px] leading-tight">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
            <span>
              Herramienta exclusiva de desarrollo para probar visibilidad y guards RBAC. En producción, la identidad se obtiene de la sesión del usuario.
            </span>
          </div>

          <div className="space-y-1 max-h-56 overflow-y-auto custom-scrollbar pr-1">
            {simulationOptions.map((opt) => {
              const isCurrent = currentUser.id === opt.user.id;
              return (
                <button
                  key={opt.user.id}
                  onClick={() => {
                    onSelectUser(opt.user);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-[#8a4dff]/30 border border-[#8a4dff]/60 text-white font-semibold'
                      : 'hover:bg-white/5 text-[#c9b7ff] border border-transparent'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate font-medium text-xs text-white">{opt.label}</p>
                    <p className="text-[10px] text-[#c9b7ff]/70 truncate">{opt.badge}</p>
                  </div>
                  {isCurrent && <Check className="w-3.5 h-3.5 text-[#d4ff4a] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
