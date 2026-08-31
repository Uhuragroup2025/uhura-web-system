import React, { useState } from 'react';
import { ClientProfile, ClientType } from './types';
import { ClientDetailView } from './ClientDetailView';
import { EditClientModal } from './EditClientModal';
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
  RotateCcw
} from 'lucide-react';

interface ClientsViewProps {
  clients: ClientProfile[];
  selectedClientId?: string | null;
  onSelectClient?: (clientId: string | null) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToProject?: (projectName: string) => void;
  onOpenNewProjectForClient?: (clientId: string) => void;
  onUpdateClient?: (updatedClient: ClientProfile) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  selectedClientId: initialSelectedClientId = null,
  onSelectClient,
  onNavigateToDashboard,
  onNavigateToProject,
  onOpenNewProjectForClient,
  onUpdateClient
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialSelectedClientId);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | ClientType>('all');
  const [filterHealth, setFilterHealth] = useState<'all' | 'Saludable' | 'En Riesgo'>('all');
  const [showHistoricalList, setShowHistoricalList] = useState(true);

  // Edit modal state
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  // Active clients vs Historical clients
  // A client is considered active if it has activeProjectsCount > 0 or is marked as active
  const activeClients = clients.filter((c) => c.activeProjectsCount > 0);
  const historicalClients = clients.filter((c) => c.activeProjectsCount === 0);

  // Filter clients
  const filteredActiveClients = activeClients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nit.includes(searchQuery) ||
      c.commercialInfo.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.commercialInfo.brands.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType =
      filterType === 'all' ||
      c.type === filterType ||
      (filterType === 'Fee mensual' && (c.type === 'Fee mensual' || c.type === 'Fee Recurrente')) ||
      (filterType === 'Proyecto único' && (c.type === 'Proyecto único' || c.type === 'Proyecto'));
    const matchesHealth = filterHealth === 'all' || c.healthStatus === filterHealth;
    return matchesSearch && matchesType && matchesHealth;
  });

  const filteredHistoricalClients = historicalClients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nit.includes(searchQuery) ||
      c.commercialInfo.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate totals
  const totalProjects = clients.reduce((acc, c) => acc + c.projectsCount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <span className="w-2 h-2 rounded-full bg-[#501f92]" />
            <span>Directorio de Cuentas, Jerarquía de Proyectos y Salud Operativa</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] mt-1">
            Cartera de Clientes ({clients.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#501f92] bg-[#f2ecfb] px-3 py-1.5 rounded-xl border border-[#8a4dff]/20">
            {clients.filter((c) => c.portalActive).length} Portales Habilitados
          </span>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#f2ecfb] text-[#501f92] flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block truncate">Clientes Activos</span>
            <div className="text-base sm:text-lg lg:text-xl font-extrabold text-[#0f172a] truncate">{activeClients.length} cuentas en curso</div>
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
          <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block truncate">Salud Operativa</span>
            <div className="text-base sm:text-lg lg:text-xl font-extrabold text-[#0f172a] truncate">
              {Math.round((clients.filter((c) => c.healthStatus === 'Saludable').length / clients.length) * 100)}% Saludable
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
            placeholder="Buscar por cliente, NIT, marca o contacto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-medium text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#501f92] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#f8fafc] p-1 rounded-xl border border-[#e2e8f0] text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#501f92] text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('Fee mensual')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'Fee mensual'
                  ? 'bg-[#501f92] text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Fee mensual
            </button>
            <button
              onClick={() => setFilterType('Proyecto único')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'Proyecto único'
                  ? 'bg-[#501f92] text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Proyecto único
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#f8fafc] p-1 rounded-xl border border-[#e2e8f0] text-xs">
            <button
              onClick={() => setFilterHealth('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterHealth === 'all'
                  ? 'bg-[#0f172a] text-white'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Todos
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

      {/* SECTION 1: ACTIVE CLIENTS (CARDS FORMAT) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#0f172a] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>Clientes Activos ({filteredActiveClients.length})</span>
          </h3>
          <span className="text-xs text-[#64748b]">Cuentas con proyectos o tareas en ejecución</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActiveClients.map((cli) => (
            <div
              key={cli.id}
              onClick={() => handleClientClick(cli.id)}
              className="p-5 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#8a4dff] hover:shadow-md transition-all cursor-pointer space-y-3.5 group relative"
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    cli.type === 'Fee mensual' || cli.type === 'Fee Recurrente'
                      ? 'bg-[#d4ff4a]/20 text-[#2e5e04] border border-[#d4ff4a]/40'
                      : cli.type === 'Interno / No facturable'
                      ? 'bg-[#f2ecfb] text-[#501f92] border border-[#8a4dff]/30'
                      : 'bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]'
                  }`}
                >
                  {cli.type}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleEditClick(e, cli)}
                    title="Editar información de cliente"
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

              {/* Client Name & NIT */}
              <div>
                <h3 className="font-extrabold text-base text-[#0f172a] group-hover:text-[#501f92] transition-colors flex items-center justify-between">
                  <span>{cli.name}</span>
                  <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#501f92] group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-[11px] font-mono text-[#64748b]">NIT: {cli.nit}</p>
              </div>

              {/* Contact info snippet & Brands */}
              <div className="text-xs text-[#475569] pt-2 border-t border-[#f1f5f9] flex justify-between items-center">
                <span className="truncate max-w-[170px]">• {cli.commercialInfo.contactName}</span>
                <span className="text-[11px] text-[#64748b] font-medium">{cli.projectsCount} proyectos</span>
              </div>

              {/* Brands tags */}
              {cli.commercialInfo.brands && cli.commercialInfo.brands.length > 0 && (
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
                  <span className="text-sm font-bold text-[#501f92]">{cli.billedCOP}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#64748b] block">Margen</span>
                  <span className="text-sm font-bold text-[#0f172a]">
                    {cli.averageMarginPercent !== null ? `${cli.averageMarginPercent}%` : '—'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: HISTORICAL / INACTIVE CLIENTS (CLEAN LIST FORMAT) */}
      {historicalClients.length > 0 && (
        <div className="pt-4 border-t border-[#f1f5f9] space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowHistoricalList(!showHistoricalList)}
              className="text-sm font-extrabold text-[#64748b] hover:text-[#0f172a] flex items-center gap-2 cursor-pointer"
            >
              <Archive className="w-4 h-4 text-[#94a3b8]" />
              <span>Clientes Históricos / Inactivos ({historicalClients.length})</span>
              <span className="text-xs font-normal text-[#94a3b8]">
                {showHistoricalList ? '(Ocultar lista)' : '(Mostrar lista)'}
              </span>
            </button>
            <span className="text-xs text-[#94a3b8]">Cuentas sin proyectos activos</span>
          </div>

          {showHistoricalList && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#f1f5f9] text-[11px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f8fafc]">
                      <th className="py-3 px-4">CLIENTE / NIT</th>
                      <th className="py-3 px-4">TIPO</th>
                      <th className="py-3 px-4">CONTACTO</th>
                      <th className="py-3 px-4">PROYECTOS HISTÓRICOS</th>
                      <th className="py-3 px-4 text-right">FACTURADO TOTAL</th>
                      <th className="py-3 px-4 text-right pr-6">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredHistoricalClients.map((cli) => (
                      <tr
                        key={cli.id}
                        onClick={() => handleClientClick(cli.id)}
                        className="hover:bg-[#f8fafc] cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-[#0f172a] block">{cli.name}</span>
                            <span className="text-[11px] font-mono text-[#64748b]">NIT: {cli.nit}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#475569]">{cli.type}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-[#0f172a] font-medium">{cli.commercialInfo.contactName}</span>
                          <span className="text-[11px] text-[#64748b] block">{cli.commercialInfo.contactRole}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#64748b]">
                          {cli.closedProjectsCount} cerrados
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0f172a]">
                          {cli.billedCOP}
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
                    ))}
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
    </div>
  );
};
