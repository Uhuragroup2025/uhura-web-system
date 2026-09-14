import React, { useState } from 'react';
import { ClientProfile, ClientStatus, ClientType } from './types';
import { ClientDetailView } from './ClientDetailView';
import { EditClientModal } from './EditClientModal';
import { CreateClientModal } from './CreateClientModal';
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Briefcase,
  Building2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Edit3,
  Globe,
  Archive,
  RotateCcw,
  FileText,
  User,
  ShieldCheck,
  PauseCircle,
  PlayCircle
} from 'lucide-react';

interface ClientsViewProps {
  clients: ClientProfile[];
  selectedClientId?: string | null;
  onSelectClient?: (clientId: string | null) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToProject?: (projectName: string) => void;
  onOpenNewProjectForClient?: (clientId: string) => void;
  onUpdateClient?: (updatedClient: ClientProfile) => void;
  onCreateClient?: (newClient: ClientProfile) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  selectedClientId: initialSelectedClientId = null,
  onSelectClient,
  onNavigateToDashboard,
  onNavigateToProject,
  onOpenNewProjectForClient,
  onUpdateClient,
  onCreateClient
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialSelectedClientId);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | ClientStatus>('all');
  const [filterHealth, setFilterHealth] = useState<'all' | 'Saludable' | 'En Riesgo'>('all');
  const [showArchivedList, setShowArchivedList] = useState(false);

  // Edit modal state
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Create modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Handle client selection
  const handleClientClick = (clientId: string) => {
    setSelectedClientId(clientId);
    if (onSelectClient) onSelectClient(clientId);
  };

  const handleBackToList = () => {
    setSelectedClientId(null);
    if (onSelectClient) onSelectClient(null);
  };

  const handleEditClick = (e: React.MouseEvent, client: ClientProfile) => {
    e.stopPropagation();
    setEditingClient(client);
    setIsEditModalOpen(true);
  };

  const handleSaveClient = (updated: ClientProfile) => {
    if (onUpdateClient) {
      onUpdateClient(updated);
    }
  };

  const handleCreateNewClient = (newClient: ClientProfile) => {
    if (onCreateClient) {
      onCreateClient(newClient);
    } else if (onUpdateClient) {
      onUpdateClient(newClient);
    }
  };

  // If a client is selected, show ClientDetailView!
  if (selectedClientId) {
    const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];
    return (
      <>
        <ClientDetailView
          client={selectedClient}
          onBack={handleBackToList}
          onNavigateToDashboard={onNavigateToDashboard}
          onNavigateToProject={onNavigateToProject}
          onOpenNewProject={() => {
            if (onOpenNewProjectForClient) onOpenNewProjectForClient(selectedClient.id);
          }}
          onEditClient={(c) => {
            setEditingClient(c);
            setIsEditModalOpen(true);
          }}
          onUpdateClient={onUpdateClient}
        />
        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          client={editingClient}
          onSaveClient={handleSaveClient}
        />
      </>
    );
  }

  // Active clients, paused clients, archived clients
  const activeClients = clients.filter((c) => (c.status || 'active') === 'active');
  const pausedClients = clients.filter((c) => c.status === 'paused');
  const archivedClients = clients.filter((c) => c.status === 'archived');

  // Filter clients
  const filterClientsList = (list: ClientProfile[]) =>
    list.filter((c) => {
      const primaryTax = c.taxEntities?.find((t) => t.isPrimary) || c.taxEntities?.[0];
      const primaryContact = c.contacts?.find((con) => con.isPrimary) || c.contacts?.[0];

      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (primaryTax?.nit && primaryTax.nit.includes(searchQuery)) ||
        (c.nit && c.nit.includes(searchQuery)) ||
        (primaryContact?.name && primaryContact.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.commercialInfo?.contactName && c.commercialInfo.contactName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.taxEntities?.some((t) => t.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || t.nit.includes(searchQuery)) ||
        c.contacts?.some((con) => con.name.toLowerCase().includes(searchQuery.toLowerCase()) || con.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.commercialInfo?.brands?.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = filterStatus === 'all' || (c.status || 'active') === filterStatus;
      const matchesHealth = filterHealth === 'all' || c.healthStatus === filterHealth;

      return matchesSearch && matchesStatus && matchesHealth;
    });

  const filteredActiveClients = filterClientsList(activeClients);
  const filteredPausedClients = filterClientsList(pausedClients);
  const filteredArchivedClients = filterClientsList(archivedClients);

  // Calculate totals
  const totalProjects = clients.reduce((acc, c) => acc + (c.projectsCount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <span className="w-2 h-2 rounded-full bg-[#501f92]" />
            <span>Cuentas Sombrilla Operativas, Multi-NIT y Directorio de Contactos</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] mt-1">
            Cartera de Clientes ({clients.length})
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Cuenta</span>
          </button>
          <span className="text-xs font-bold text-[#501f92] bg-[#f2ecfb] px-3 py-1.5 rounded-xl border border-[#8a4dff]/20">
            {clients.filter((c) => c.portalActive).length} Portales Habilitados
          </span>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block truncate">Clientes en Operación</span>
            <div className="text-base sm:text-lg lg:text-xl font-extrabold text-[#0f172a] truncate">
              {activeClients.length} activos {pausedClients.length > 0 && `• ${pausedClients.length} pausados`}
            </div>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center font-bold shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block truncate">Total Proyectos</span>
            <div className="text-base sm:text-lg lg:text-xl font-extrabold text-[#0f172a] truncate">{totalProjects} en cartera</div>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex items-center gap-3.5 min-w-0 sm:col-span-2 xl:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-[#f2ecfb] text-[#501f92] flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block truncate">Salud Operativa</span>
            <div className="text-base sm:text-lg lg:text-xl font-extrabold text-[#0f172a] truncate">
              {clients.length > 0 ? Math.round((clients.filter((c) => c.healthStatus === 'Saludable').length / clients.length) * 100) : 100}% Saludable
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por marca, razón social, NIT o contacto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-medium text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#501f92] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-[#f8fafc] p-1 rounded-xl border border-[#e2e8f0] text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-[#501f92] text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterStatus === 'active'
                  ? 'bg-[#501f92] text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterStatus('paused')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterStatus === 'paused'
                  ? 'bg-[#501f92] text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Pausados
            </button>
          </div>

          {/* Health filter */}
          <div className="flex items-center gap-1 bg-[#f8fafc] p-1 rounded-xl border border-[#e2e8f0] text-xs">
            <button
              onClick={() => setFilterHealth('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterHealth === 'all'
                  ? 'bg-[#0f172a] text-white'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterHealth('Saludable')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterHealth === 'Saludable'
                  ? 'bg-[#10b981] text-white'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Saludables
            </button>
            <button
              onClick={() => setFilterHealth('En Riesgo')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterHealth === 'En Riesgo'
                  ? 'bg-[#f59e0b] text-white'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              En Riesgo
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: CLIENTES ACTIVOS (CARDS FORMAT) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#0f172a] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>Cuentas Activas ({filteredActiveClients.length})</span>
          </h3>
          <span className="text-xs text-[#64748b]">Operación vigente en Orbit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActiveClients.map((cli) => {
            const primaryTax = cli.taxEntities?.find((t) => t.isPrimary) || cli.taxEntities?.[0];
            const primaryContact = cli.contacts?.find((con) => con.isPrimary) || cli.contacts?.[0];

            return (
              <div
                key={cli.id}
                onClick={() => handleClientClick(cli.id)}
                className="p-5 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#8a4dff] hover:shadow-md transition-all cursor-pointer space-y-3.5 group relative"
              >
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {cli.isInternal ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f2ecfb] text-[#501f92] border border-[#8a4dff]/30">
                        Uhura Interno
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                        Activo
                      </span>
                    )}
                    {cli.taxEntities && cli.taxEntities.length > 1 && (
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-[#f1f5f9] text-[#64748b]">
                        {cli.taxEntities.length} NITs
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleEditClick(e, cli)}
                      title="Editar cuenta"
                      className="p-1 rounded-lg text-[#94a3b8] hover:text-[#501f92] hover:bg-[#f2ecfb] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          cli.healthStatus === 'Saludable' ? 'bg-[#10b981]' : 'bg-[#f59e0b]'
                        }`}
                      />
                      <span
                        className={
                          cli.healthStatus === 'Saludable' ? 'text-[#16a34a]' : 'text-[#d97706]'
                        }
                      >
                        {cli.healthStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client Name & Primary NIT */}
                <div>
                  <h3 className="font-extrabold text-base text-[#0f172a] group-hover:text-[#501f92] transition-colors flex items-center justify-between">
                    <span>{cli.name}</span>
                    <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#501f92] group-hover:translate-x-0.5 transition-all" />
                  </h3>
                  <p className="text-[11px] font-mono text-[#64748b]">
                    {primaryTax ? `NIT: ${primaryTax.nit}` : (cli.nit || 'Sin NIT asignado')}
                  </p>
                </div>

                {/* Primary Contact snippet & Projects count */}
                <div className="text-xs text-[#475569] pt-2 border-t border-[#f1f5f9] flex justify-between items-center">
                  <span className="truncate max-w-[170px]">
                    • {primaryContact ? primaryContact.name : (cli.commercialInfo?.contactName || 'Sin contacto')}
                  </span>
                  <span className="text-[11px] text-[#64748b] font-medium">
                    {cli.projectsCount || 0} proyectos
                  </span>
                </div>

                {/* Account Manager / Brands tags */}
                {cli.commercialInfo?.brands && cli.commercialInfo.brands.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {cli.commercialInfo.brands.slice(0, 3).map((b, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#f8fafc] text-[#475569] border border-[#e2e8f0]"
                      >
                        {b}
                      </span>
                    ))}
                    {cli.commercialInfo.brands.length > 3 && (
                      <span className="text-[10px] text-[#64748b] px-1 py-0.5">
                        +{cli.commercialInfo.brands.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Billing & Margin Footer */}
                <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#64748b] block">Facturado</span>
                    <span className="text-sm font-bold text-[#501f92]">{cli.billedCOP || '$0'}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#64748b] block">Margen</span>
                    <span className="text-sm font-bold text-[#0f172a]">
                      {cli.averageMarginPercent !== null && cli.averageMarginPercent !== undefined ? `${cli.averageMarginPercent}%` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CLIENTES PAUSADOS (SI EXISTEN) */}
      {filteredPausedClients.length > 0 && (
        <div className="pt-4 border-t border-[#f1f5f9] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#92400e] flex items-center gap-2">
              <PauseCircle className="w-4 h-4 text-[#f59e0b]" />
              <span>Clientes Pausados ({filteredPausedClients.length})</span>
            </h3>
            <span className="text-xs text-[#64748b]">Relación detenida temporalmente · Conserva histórico</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPausedClients.map((cli) => {
              const primaryTax = cli.taxEntities?.find((t) => t.isPrimary) || cli.taxEntities?.[0];
              const primaryContact = cli.contacts?.find((con) => con.isPrimary) || cli.contacts?.[0];

              return (
                <div
                  key={cli.id}
                  onClick={() => handleClientClick(cli.id)}
                  className="p-5 rounded-2xl bg-[#fffdfa] border border-[#fef08a] hover:border-[#f59e0b] hover:shadow-md transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#fffbeb] text-[#92400e] border border-[#fef08a]">
                      Pausado
                    </span>
                    <button
                      onClick={(e) => handleEditClick(e, cli)}
                      className="p-1 rounded-lg text-[#94a3b8] hover:text-[#501f92] hover:bg-[#f2ecfb] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-[#0f172a] group-hover:text-[#92400e] transition-colors">
                      {cli.name}
                    </h3>
                    <p className="text-[11px] font-mono text-[#64748b]">
                      {primaryTax ? `NIT: ${primaryTax.nit}` : (cli.nit || 'Sin NIT')}
                    </p>
                  </div>

                  <div className="text-xs text-[#64748b] pt-2 border-t border-[#f1f5f9] flex justify-between">
                    <span>• {primaryContact?.name || cli.commercialInfo?.contactName || 'Sin contacto'}</span>
                    <span>{cli.closedProjectsCount || 0} cerrados</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: ARCHIVED CLIENTS (CLEAN TABLE FORMAT) */}
      {archivedClients.length > 0 && (
        <div className="pt-4 border-t border-[#f1f5f9] space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowArchivedList(!showArchivedList)}
              className="text-sm font-extrabold text-[#64748b] hover:text-[#0f172a] flex items-center gap-2 cursor-pointer"
            >
              <Archive className="w-4 h-4 text-[#94a3b8]" />
              <span>Clientes Archivados ({archivedClients.length})</span>
              <span className="text-xs font-normal text-[#94a3b8]">
                {showArchivedList ? '(Ocultar lista)' : '(Mostrar lista)'}
              </span>
            </button>
            <span className="text-xs text-[#94a3b8]">Cuentas históricas no disponibles para nueva operación</span>
          </div>

          {showArchivedList && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#f1f5f9] text-[11px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f8fafc]">
                      <th className="py-3 px-4">CLIENTE / NIT</th>
                      <th className="py-3 px-4">ESTADO</th>
                      <th className="py-3 px-4">CONTACTO</th>
                      <th className="py-3 px-4">PROYECTOS HISTÓRICOS</th>
                      <th className="py-3 px-4 text-right">FACTURADO TOTAL</th>
                      <th className="py-3 px-4 text-right pr-6">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredArchivedClients.map((cli) => {
                      const primaryTax = cli.taxEntities?.find((t) => t.isPrimary) || cli.taxEntities?.[0];
                      const primaryContact = cli.contacts?.find((con) => con.isPrimary) || cli.contacts?.[0];

                      return (
                        <tr
                          key={cli.id}
                          onClick={() => handleClientClick(cli.id)}
                          className="hover:bg-[#f8fafc] cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-bold text-[#0f172a] block">{cli.name}</span>
                              <span className="text-[11px] font-mono text-[#64748b]">
                                NIT: {primaryTax?.nit || cli.nit || '—'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[#475569]">
                              Archivado
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[#0f172a] font-medium">
                              {primaryContact?.name || cli.commercialInfo?.contactName || '—'}
                            </span>
                            <span className="text-[11px] text-[#64748b] block">
                              {primaryContact?.roleTitle || cli.commercialInfo?.contactRole || ''}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#64748b]">
                            {cli.closedProjectsCount || 0} cerrados
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0f172a]">
                            {cli.billedCOP || '$0'}
                          </td>
                          <td className="py-3.5 px-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleEditClick(e, cli)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f8fafc] hover:bg-[#501f92] text-[#475569] hover:text-white border border-[#e2e8f0] text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Client Modal */}
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={editingClient}
        onSaveClient={handleSaveClient}
      />

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateClient={handleCreateNewClient}
      />
    </div>
  );
};
