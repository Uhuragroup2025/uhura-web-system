import React, { useState } from 'react';
import { ClientProfile, ClientProjectHistoryItem, ClientTaxEntity, ClientContact } from './types';
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
  Plus,
  AlertTriangle,
  FileCheck,
  Percent,
  Check,
  FileText,
  Star,
  Tag
} from 'lucide-react';

interface ClientDetailViewProps {
  client: ClientProfile;
  onBack: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToProject?: (projectName: string) => void;
  onOpenNewProject?: () => void;
  onEditClient?: (client: ClientProfile) => void;
  onUpdateClient?: (client: ClientProfile) => void;
}

export const ClientDetailView: React.FC<ClientDetailViewProps> = ({
  client,
  onBack,
  onNavigateToDashboard,
  onNavigateToProject,
  onOpenNewProject,
  onEditClient,
  onUpdateClient
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
    if (onUpdateClient) {
      onUpdateClient({
        ...client,
        portalActive: nextState
      });
    }
    showToast(nextState ? `Acceso a portal habilitado para ${client.name}` : `Acceso a portal deshabilitado`);
  };

  // Detailed Health Breakdown Dimensions
  const getHealthDimensions = () => {
    const margin = client.averageMarginPercent ?? 0;
    const rentStatus = margin >= 35 ? 'verde' : margin >= 25 ? 'amarillo' : 'rojo';
    const rentNote =
      margin >= 35
        ? `Margen operativo promedio ${margin}% (supera meta >30%)`
        : margin >= 25
        ? `Margen operativo ${margin}% (cercano al piso operativo 25%)`
        : `Margen bajo: ${margin}% (riesgo financiero)`;

    const carteraScore = client.behavior?.cartera ?? 90;
    const isOverdue = client.receivableStatus?.toLowerCase().includes('mora') || client.receivableStatus?.toLowerCase().includes('cobro');
    const cartStatus = carteraScore >= 80 && !isOverdue ? 'verde' : carteraScore >= 60 ? 'amarillo' : 'rojo';
    const cartNote =
      cartStatus === 'verde'
        ? `Facturación al día · Sin facturas vencidas (${client.billedInvoicesCount || 0} facturas emitidas)`
        : `Cartera en mora: ${client.receivableCOP} pendiente de pago`;

    const cumplScore = client.behavior?.cumplimiento ?? 90;
    const cumplStatus = cumplScore >= 85 ? 'verde' : cumplScore >= 70 ? 'amarillo' : 'rojo';
    const cumplNote =
      cumplScore >= 85
        ? `${cumplScore}% de entregas a tiempo en proyectos y entregables`
        : `${cumplScore}% de cumplimiento · Alerta de desvíos en horas`;

    const recScore = client.behavior?.relacion ?? client.behavior?.recurrencia ?? 80;
    const recStatus = recScore >= 80 ? 'verde' : recScore >= 60 ? 'amarillo' : 'rojo';
    const recNote =
      recScore >= 80
        ? `Relación sólida con la cuenta · Operación continua`
        : `Relación en desarrollo · Proyectos por demanda puntual`;

    return {
      rentabilidad: { status: rentStatus, title: 'Rentabilidad', note: rentNote, score: `${margin}%` },
      cartera: { status: cartStatus, title: 'Cartera & Cobranza', note: cartNote, score: `${carteraScore}/100` },
      cumplimiento: { status: cumplStatus, title: 'Cumplimiento & Plazos', note: cumplNote, score: `${cumplScore}%` },
      relacion: { status: recStatus, title: 'Recurrencia / Relación', note: recNote, score: `${recScore}%` }
    };
  };

  const healthDims = getHealthDimensions();

  // Primary tax entity & contact
  const primaryTax = client.taxEntities?.find((t) => t.isPrimary) || client.taxEntities?.[0];
  const primaryContact = client.contacts?.find((c) => c.isPrimary) || client.contacts?.[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Activo · En Operación', bg: 'bg-[#ecfdf5]', text: 'text-[#065f46]', dot: 'bg-[#10b981]' };
      case 'paused':
        return { label: 'Pausado · Conserva Histórico', bg: 'bg-[#fffbeb]', text: 'text-[#92400e]', dot: 'bg-[#f59e0b]' };
      case 'archived':
        return { label: 'Archivado · Histórico', bg: 'bg-[#f1f5f9]', text: 'text-[#475569]', dot: 'bg-[#94a3b8]' };
      default:
        return { label: 'Activo', bg: 'bg-[#ecfdf5]', text: 'text-[#065f46]', dot: 'bg-[#10b981]' };
    }
  };

  const statusInfo = getStatusBadge(client.status || 'active');

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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
              {client.name}
            </h1>
            {client.isInternal && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#f2ecfb] text-[#501f92] border border-[#8a4dff]/20">
                Cliente Interno Uhura Group
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-[#64748b]">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-bold text-[11px] ${statusInfo.bg} ${statusInfo.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
            <span>•</span>
            <span className="font-mono text-[#334155]">
              {primaryTax ? `NIT: ${primaryTax.nit}` : 'Sin NIT fiscal asignado'}
            </span>
            {client.accountManagerName && (
              <>
                <span>•</span>
                <span className="font-medium text-[#475569]">
                  Lead Uhura: <strong>{client.accountManagerName}</strong>
                </span>
              </>
            )}
            <span>•</span>
            <span
              className={`inline-flex items-center gap-1.5 font-bold ${
                client.healthStatus === 'Saludable' ? 'text-[#16a34a]' : 'text-[#d97706]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  client.healthStatus === 'Saludable' ? 'bg-[#10b981]' : 'bg-[#f59e0b]'
                }`}
              />
              {client.healthStatus}
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* NUEVO PROYECTO (Primary CTA) */}
          <button
            onClick={onOpenNewProject}
            disabled={client.status === 'archived'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo proyecto</span>
          </button>

          {/* Portal Toggle Button */}
          <button
            onClick={handleTogglePortal}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              portalActive
                ? 'bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]'
                : 'bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{portalActive ? 'Portal Habilitado' : 'Habilitar Portal'}</span>
          </button>

          {/* Edit Client */}
          <button
            onClick={() => {
              if (onEditClient) onEditClient(client);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#f8fafc] text-[#334155] border border-[#e2e8f0] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#64748b]" />
            <span>Editar Cuenta</span>
          </button>

          {/* Volver */}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#f8fafc] text-[#334155] border border-[#e2e8f0] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
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
            {client.projectsCount || 0}
          </div>
          <p className="text-xs text-[#64748b]">
            {client.activeProjectsCount || 0} activos • {client.closedProjectsCount || 0} cerrados
          </p>
        </div>

        {/* Card 2: MARGEN PROMEDIO */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-1">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#64748b]">
            MARGEN PROMEDIO
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
            {client.averageMarginPercent !== null && client.averageMarginPercent !== undefined
              ? `${client.averageMarginPercent}%`
              : 'Sin proyectos'}
          </div>
          <p className="text-xs text-[#64748b]">
            {client.averageMarginPercent !== null && client.averageMarginPercent !== undefined
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
            {client.billedCOP || '$0'}
          </div>
          <p className="text-xs text-[#64748b]">
            {client.billedInvoicesCount || 0} facturas emitidas
          </p>
        </div>

        {/* Card 4: POR COBRAR */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-1">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#64748b]">
            POR COBRAR
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
            {client.receivableCOP || '$0'}
          </div>
          <p className="text-xs text-[#64748b]">
            Estado: <strong className="text-[#0f172a]">{client.receivableStatus || 'al día'}</strong>
          </p>
        </div>
      </div>

      {/* SECCIÓN ESTRUCTURAL CORE: RAZONES SOCIALES (NITs) & DIRECTORIO DE CONTACTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bloque 1: Razones Sociales / Facturación */}
        <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#501f92]" />
              <div>
                <h3 className="font-bold text-sm text-[#0f172a]">Razones Sociales / Facturación ({client.taxEntities?.length || 0})</h3>
                <p className="text-[11px] text-[#64748b]">Multi-NIT para facturación y contratos contables</p>
              </div>
            </div>
            <button
              onClick={() => onEditClient && onEditClient(client)}
              className="text-xs font-bold text-[#501f92] hover:underline cursor-pointer"
            >
              Gestionar NITs
            </button>
          </div>

          {(!client.taxEntities || client.taxEntities.length === 0) ? (
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-center text-[#64748b] text-xs">
              <p className="font-medium text-[#0f172a]">Sin razones sociales registradas</p>
              <p className="text-[11px] mt-0.5">La cuenta opera con normalidad. Puedes vincular el NIT fiscal cuando se emita facturación.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {client.taxEntities.map((tax) => (
                <div
                  key={tax.id}
                  className={`p-3.5 rounded-xl border text-xs transition-colors ${
                    tax.isPrimary
                      ? 'bg-[#faf5ff] border-[#8a4dff]/40 shadow-xs'
                      : 'bg-[#f8fafc] border-[#e2e8f0]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#0f172a]">{tax.nit}</span>
                      {tax.isPrimary && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#501f92] text-white">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          Principal
                        </span>
                      )}
                    </div>
                    {tax.city && (
                      <span className="text-[11px] text-[#64748b] font-medium">{tax.city}</span>
                    )}
                  </div>
                  <div className="font-semibold text-[#334155]">{tax.businessName}</div>
                  {tax.notes && (
                    <div className="text-[11px] text-[#64748b] mt-1 pt-1 border-t border-[#e2e8f0]/60">
                      {tax.notes}
                    </div>
                  )}
                  {tax.alegraContactId && (
                    <div className="text-[10px] font-mono text-[#501f92] mt-1">
                      ID Alegra: {tax.alegraContactId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bloque 2: Directorio de Contactos Tipificados */}
        <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#501f92]" />
              <div>
                <h3 className="font-bold text-sm text-[#0f172a]">Directorio de Contactos ({client.contacts?.length || 0})</h3>
                <p className="text-[11px] text-[#64748b]">Contactos tipificados: operativo, comercial, facturación y directivo</p>
              </div>
            </div>
            <button
              onClick={() => onEditClient && onEditClient(client)}
              className="text-xs font-bold text-[#501f92] hover:underline cursor-pointer"
            >
              Gestionar Contactos
            </button>
          </div>

          {(!client.contacts || client.contacts.length === 0) ? (
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-center text-[#64748b] text-xs">
              <p className="font-medium text-[#0f172a]">Sin contactos vinculados</p>
              <p className="text-[11px] mt-0.5">Agrega interlocutores de la cuenta para coordinar aprobaciones y entregables.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {client.contacts.map((con) => (
                <div
                  key={con.id}
                  className={`p-3.5 rounded-xl border text-xs transition-colors ${
                    con.isPrimary
                      ? 'bg-[#faf5ff] border-[#8a4dff]/40 shadow-xs'
                      : 'bg-[#f8fafc] border-[#e2e8f0]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0f172a]">{con.name}</span>
                      {con.isPrimary && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#501f92] text-white">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          Principal
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#e2e8f0] text-[#334155]">
                      {con.contactType}
                    </span>
                  </div>
                  {con.roleTitle && (
                    <div className="text-[11px] text-[#64748b] font-medium mb-1.5">{con.roleTitle}</div>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#475569] pt-1 border-t border-[#e2e8f0]/60">
                    {con.email && (
                      <span className="flex items-center gap-1 font-mono text-[#501f92]">
                        <Mail className="w-3 h-3 text-[#64748b]" />
                        {con.email}
                      </span>
                    )}
                    {con.phone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-[#64748b]" />
                        {con.phone}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HEALTH DIAGNOSTIC EXPLANATION SECTION */}
      <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#501f92]" />
            <h3 className="font-bold text-sm text-[#0f172a]">Diagnóstico de Salud de Cuenta</h3>
          </div>
          <span className="text-xs text-[#64748b]">Desglose de 4 dimensiones operativas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Dimension 1: Rentabilidad */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#334155]">{healthDims.rentabilidad.title}</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  healthDims.rentabilidad.status === 'verde'
                    ? 'bg-[#10b981]'
                    : healthDims.rentabilidad.status === 'amarillo'
                    ? 'bg-[#f59e0b]'
                    : 'bg-[#ef4444]'
                }`}
              />
            </div>
            <p className="text-[11px] text-[#64748b] leading-relaxed">
              {healthDims.rentabilidad.note}
            </p>
          </div>

          {/* Dimension 2: Cartera */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#334155]">{healthDims.cartera.title}</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  healthDims.cartera.status === 'verde'
                    ? 'bg-[#10b981]'
                    : 'bg-[#ef4444]'
                }`}
              />
            </div>
            <p className="text-[11px] text-[#64748b] leading-relaxed">
              {healthDims.cartera.note}
            </p>
          </div>

          {/* Dimension 3: Cumplimiento */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#334155]">{healthDims.cumplimiento.title}</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  healthDims.cumplimiento.status === 'verde'
                    ? 'bg-[#10b981]'
                    : healthDims.cumplimiento.status === 'amarillo'
                    ? 'bg-[#f59e0b]'
                    : 'bg-[#ef4444]'
                }`}
              />
            </div>
            <p className="text-[11px] text-[#64748b] leading-relaxed">
              {healthDims.cumplimiento.note}
            </p>
          </div>

          {/* Dimension 4: Relación */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#334155]">{healthDims.relacion.title}</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  healthDims.relacion.status === 'verde'
                    ? 'bg-[#10b981]'
                    : 'bg-[#f59e0b]'
                }`}
              />
            </div>
            <p className="text-[11px] text-[#64748b] leading-relaxed">
              {healthDims.relacion.note}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Columns Section: Radar, Marcas, Contexto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: Comportamiento Radar Chart (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-base text-[#0f172a]">Modelo de Salud de Cuenta</h3>
              <p className="text-[11px] text-[#64748b]">4 Dimensiones clave</p>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#f2ecfb] text-[#501f92] border border-[#8a4dff]/20">
              Salud: {client.behavior ? Math.round((client.behavior.rentabilidad + (client.behavior.cartera ?? 90) + client.behavior.cumplimiento + (client.behavior.relacion ?? client.behavior.recurrencia ?? 80)) / 4) : 90}/100
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center py-2">
            {client.behavior ? (
              <ClientRadarChart scores={client.behavior} size={280} />
            ) : (
              <div className="text-center text-[#64748b] py-12 text-xs">Sin histórico suficiente para radar</div>
            )}
          </div>

          <div className="text-center pt-2 border-t border-[#f1f5f9]">
            <span className="text-[11px] text-[#64748b]">
              Rentabilidad · Cartera · Cumplimiento · Recurrencia / Relación
            </span>
          </div>
        </div>

        {/* Column 2: Marcas Asociadas (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
            <h3 className="font-bold text-base text-[#0f172a]">
              Marcas Asociadas ({client.commercialInfo?.brands?.length || 0})
            </h3>
          </div>

          <div className="space-y-2">
            {client.commercialInfo?.brands && client.commercialInfo.brands.length > 0 ? (
              client.commercialInfo.brands.map((brand, idx) => (
                <div
                  key={`brand-${idx}`}
                  className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between hover:border-[#8a4dff]/40 transition-colors"
                >
                  <span className="font-bold text-xs text-[#0f172a]">{brand}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f2ecfb] text-[#501f92]">
                    Activa
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-center text-[#64748b] text-xs">
                Sin marcas registradas
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Observaciones y Contexto (3 cols) */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
            <h3 className="font-bold text-base text-[#0f172a]">Notas & Contexto</h3>
          </div>

          {client.notes ? (
            <p className="text-xs text-[#475569] leading-relaxed bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
              {client.notes}
            </p>
          ) : (
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-center text-[#64748b] text-xs">
              Sin notas adicionales registradas.
            </div>
          )}

          {client.commercialInfo?.clientSince && (
            <div className="pt-2 text-[11px] text-[#64748b]">
              Cliente desde: <strong className="text-[#0f172a]">{client.commercialInfo.clientSince}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Histórico de proyectos */}
      <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#f1f5f9]">
          <div>
            <h3 className="font-bold text-base text-[#0f172a]">
              Proyectos de la Cuenta ({client.projectsHistory?.length || 0})
            </h3>
            <span className="text-xs text-[#64748b]">
              Presupuestos, rentabilidad y semáforo de ejecución en tiempo real
            </span>
          </div>

          <button
            onClick={onOpenNewProject}
            disabled={client.status === 'archived'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8fafc] hover:bg-[#501f92] text-[#501f92] hover:text-white border border-[#e2e8f0] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Crear Proyecto</span>
          </button>
        </div>

        {/* Projects Table */}
        {(!client.projectsHistory || client.projectsHistory.length === 0) ? (
          <div className="p-8 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-center text-[#64748b] text-xs">
            <Briefcase className="w-6 h-6 mx-auto mb-2 text-[#94a3b8]" />
            <p className="font-bold text-[#0f172a]">Esta cuenta no tiene proyectos asignados aún.</p>
            <p className="mt-1">Crea un proyecto único o un fee mensual para iniciar el seguimiento de horas y entregables.</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
