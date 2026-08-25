import React, { useState } from 'react';
import { ClientProfile, ClientProjectHistoryItem } from './types';
import { ClientRadarChart } from './ClientRadarChart';
import {
  Building2,
  ChevronRight,
  ArrowLeft,
  Globe,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  TrendingUp,
  DollarSign,
  User,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface ClientDetailViewProps {
  client: ClientProfile;
  onBack: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToProject?: (projectName: string) => void;
  onEditClient?: (client: ClientProfile) => void;
}

export const ClientDetailView: React.FC<ClientDetailViewProps> = ({
  client,
  onBack,
  onNavigateToDashboard,
  onNavigateToProject,
  onEditClient
}) => {
  const [portalActive, setPortalActive] = useState(client.portalActive);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTogglePortal = () => {
    const nextState = !portalActive;
    setPortalActive(nextState);
    showToast(nextState ? `Portal de cliente activado para ${client.name}` : `Portal de cliente desactivado`);
  };

  const getHealthBadge = () => {
    switch (client.healthStatus) {
      case 'Saludable':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-[#16a34a] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
            Saludable
          </span>
        );
      case 'En Riesgo':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-[#f59e0b] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            En Riesgo
          </span>
        );
      case 'Crítico':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-[#ef4444] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
            Crítico
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#0f172a] text-white text-xs font-bold shadow-xl border border-[#334155] flex items-center gap-2 animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-[#d4ff4a]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb Header */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748b]">
        <button
          onClick={onNavigateToDashboard}
          className="hover:text-[#0f172a] hover:underline transition-colors cursor-pointer"
        >
          Dashboard
        </button>
        <span className="text-[#94a3b8]">›</span>
        <button
          onClick={onBack}
          className="hover:text-[#0f172a] hover:underline transition-colors cursor-pointer"
        >
          Clientes
        </button>
        <span className="text-[#94a3b8]">›</span>
        <span className="font-bold text-[#0f172a]">{client.name}</span>
      </div>

      {/* Main Header Title Row with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            {client.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-[#64748b]">
            <span className="font-mono">NIT {client.nit}</span>
            <span>•</span>
            <span className="font-medium">{client.type}</span>
            <span>•</span>
            {getHealthBadge()}
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Portal Status Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              portalActive
                ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                : 'bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                portalActive ? 'bg-[#10b981]' : 'bg-[#94a3b8]'
              }`}
            />
            <span>{portalActive ? 'Portal activo' : 'Portal inactivo'}</span>
          </span>

          {/* Activate/Deactivate Portal Button */}
          <button
            onClick={handleTogglePortal}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
              portalActive
                ? 'bg-[#334155] hover:bg-[#1e293b]'
                : 'bg-[#501f92] hover:bg-[#381566]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{portalActive ? 'Gestionar portal' : 'Activar portal'}</span>
          </button>

          {/* Edit Client */}
          <button
            onClick={() => {
              if (onEditClient) onEditClient(client);
              showToast(`Editar información de ${client.name}`);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#f8fafc] text-[#334155] border border-[#e2e8f0] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#64748b]" />
            <span>Editar</span>
          </button>

          {/* Volver */}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#f8fafc] text-[#334155] border border-[#e2e8f0] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#64748b]" />
            <span>Volver</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: PROYECTOS */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-1">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#64748b]">
            PROYECTOS
          </span>
          <div className="text-3xl font-extrabold text-[#0f172a]">
            {client.projectsCount}
          </div>
          <p className="text-xs text-[#64748b]">
            {client.activeProjectsCount} activos • {client.closedProjectsCount} cerrados
          </p>
        </div>

        {/* Card 2: MARGEN PROMEDIO */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-1">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#64748b]">
            MARGEN PROMEDIO
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
            {client.averageMarginPercent !== null
              ? `${client.averageMarginPercent}%`
              : 'Sin proyectos'}
          </div>
          <p className="text-xs text-[#64748b]">
            {client.averageMarginPercent !== null
              ? 'Margen operativo consolidado'
              : 'Sin histórico cerrado'}
          </p>
        </div>

        {/* Card 3: FACTURADO */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-1">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#64748b]">
            FACTURADO
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
            {client.billedCOP}
          </div>
          <p className="text-xs text-[#64748b]">
            {client.billedInvoicesCount} facturas (COP)
          </p>
        </div>

        {/* Card 4: POR COBRAR */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-1">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#64748b]">
            POR COBRAR
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
            {client.receivableCOP}
          </div>
          <p className="text-xs text-[#64748b]">
            {client.receivableStatus}
          </p>
        </div>
      </div>

      {/* 3 Columns Section: Comportamiento, Relación comercial, Marcas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: Comportamiento Radar Chart (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base text-[#0f172a]">Comportamiento</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f2ecfb] text-[#501f92]">
              Spider Matrix
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center py-2">
            <ClientRadarChart scores={client.behavior} size={280} />
          </div>

          <div className="text-center pt-2 border-t border-[#f1f5f9]">
            <span className="text-[11px] text-[#64748b]">
              Evaluación de rentabilidad, cumplimiento y recurrencia operacional
            </span>
          </div>
        </div>

        {/* Column 2: Relación Comercial (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
            <h3 className="font-bold text-base text-[#0f172a]">Relación comercial</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-[#64748b] font-medium">Contacto</span>
              <span className="text-[#0f172a] font-bold">{client.commercialInfo.contactName}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-[#f8fafc]">
              <span className="text-[#64748b] font-medium">Cargo</span>
              <span className="text-[#0f172a] font-semibold">{client.commercialInfo.contactRole}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-[#f8fafc]">
              <span className="text-[#64748b] font-medium">Cliente desde</span>
              <span className="text-[#0f172a] font-semibold">{client.commercialInfo.clientSince}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-[#f8fafc]">
              <span className="text-[#64748b] font-medium">Marcas</span>
              <span className="text-[#0f172a] font-mono font-bold">
                {client.commercialInfo.brands.length}
              </span>
            </div>

            {client.commercialInfo.contactEmail && (
              <div className="flex justify-between items-center py-1 border-t border-[#f8fafc]">
                <span className="text-[#64748b] font-medium">Email</span>
                <span className="text-[#501f92] font-mono text-[11px] truncate max-w-[180px]">
                  {client.commercialInfo.contactEmail}
                </span>
              </div>
            )}

            {client.commercialInfo.contactPhone && (
              <div className="flex justify-between items-center py-1 border-t border-[#f8fafc]">
                <span className="text-[#64748b] font-medium">Teléfono</span>
                <span className="text-[#0f172a] font-mono text-[11px]">
                  {client.commercialInfo.contactPhone}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Marcas (3 cols) */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
            <h3 className="font-bold text-base text-[#0f172a]">
              Marcas ({client.commercialInfo.brands.length})
            </h3>
          </div>

          <div className="space-y-2">
            {client.commercialInfo.brands.map((brand, idx) => (
              <div
                key={`brand-${idx}`}
                className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between hover:border-[#8a4dff]/40 transition-colors"
              >
                <span className="font-bold text-xs text-[#0f172a]">{brand}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f2ecfb] text-[#501f92]">
                  Activa
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Histórico de proyectos */}
      <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#f1f5f9]">
          <h3 className="font-bold text-base text-[#0f172a]">
            Histórico de proyectos ({client.projectsHistory.length})
          </h3>
          <span className="text-xs text-[#64748b]">
            Presupuestos, rentabilidad y semáforo de ejecución en tiempo real
          </span>
        </div>

        {/* Projects Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e2e8f0] text-[#64748b] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Proyecto</th>
                <th className="py-3 px-3">Marca</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3 text-right">Valor cotizado</th>
                <th className="py-3 px-3 text-right">Margen real</th>
                <th className="py-3 px-3 text-center">Semáforo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {client.projectsHistory.map((prj) => (
                <tr
                  key={prj.id}
                  onClick={() => {
                    if (onNavigateToProject) onNavigateToProject(prj.name);
                    showToast(`Proyecto seleccionado: ${prj.name}`);
                  }}
                  className="hover:bg-[#f8fafc] cursor-pointer transition-colors group"
                >
                  {/* Proyecto */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0f172a] group-hover:text-[#501f92] transition-colors">
                        {prj.name}
                      </span>
                      {prj.tag && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#f2ecfb] text-[#501f92]">
                          {prj.tag}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Marca */}
                  <td className="py-3.5 px-3 text-[#475569] font-medium">
                    {prj.brand}
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        prj.status === 'Activo'
                          ? 'bg-[#ecfdf5] text-[#065f46]'
                          : prj.status === 'Cerrado'
                          ? 'bg-[#f1f5f9] text-[#475569]'
                          : 'bg-[#fffbeb] text-[#92400e]'
                      }`}
                    >
                      {prj.status}
                    </span>
                  </td>

                  {/* Valor cotizado */}
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-[#0f172a]">
                    {prj.quotedValueCOP}
                  </td>

                  {/* Margen real */}
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-[#0f172a]">
                    {prj.realMarginPercent !== null ? `${prj.realMarginPercent}%` : '—'}
                  </td>

                  {/* Semáforo */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          prj.trafficLight === 'verde'
                            ? 'bg-[#10b981] shadow-xs'
                            : prj.trafficLight === 'amarillo'
                            ? 'bg-[#f59e0b] shadow-xs'
                            : 'bg-[#ef4444] shadow-xs'
                        }`}
                        title={`Estado: ${prj.trafficLight}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
