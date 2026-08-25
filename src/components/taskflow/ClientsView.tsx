import React, { useState } from 'react';
import { ClientProfile } from './types';
import { ClientDetailView } from './ClientDetailView';
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
  Sparkles
} from 'lucide-react';

interface ClientsViewProps {
  clients: ClientProfile[];
  selectedClientId?: string | null;
  onSelectClient?: (clientId: string | null) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToProject?: (projectName: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  selectedClientId: initialSelectedClientId = null,
  onSelectClient,
  onNavigateToDashboard,
  onNavigateToProject
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialSelectedClientId);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Fee Recurrente' | 'Proyecto' | 'Mixto'>('all');
  const [filterHealth, setFilterHealth] = useState<'all' | 'Saludable' | 'En Riesgo'>('all');

  // Handle client selection
  const handleClientClick = (clientId: string) => {
    setSelectedClientId(clientId);
    if (onSelectClient) onSelectClient(clientId);
  };

  const handleBackToList = () => {
    setSelectedClientId(null);
    if (onSelectClient) onSelectClient(null);
  };

  // If a client is selected, show ClientDetailView!
  if (selectedClientId) {
    const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];
    return (
      <ClientDetailView
        client={selectedClient}
        onBack={handleBackToList}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToProject={onNavigateToProject}
      />
    );
  }

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nit.includes(searchQuery) ||
      c.commercialInfo.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || c.type === filterType;
    const matchesHealth = filterHealth === 'all' || c.healthStatus === filterHealth;
    return matchesSearch && matchesType && matchesHealth;
  });

  // Calculate totals
  const totalBilled = clients.reduce((acc, c) => {
    const val = parseFloat(c.billedCOP.replace(/[^0-9.]/g, '')) || 0;
    return acc + val;
  }, 0);
  const totalProjects = clients.reduce((acc, c) => acc + c.projectsCount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <span className="w-2 h-2 rounded-full bg-[#501f92]" />
            <span>Directorio de Cuentas, Jerarquía de Proyectos y Rentabilidad</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] mt-1">
            Cartera de Clientes ({clients.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#501f92] bg-[#f2ecfb] px-3 py-1.5 rounded-xl border border-[#8a4dff]/20">
            {clients.filter((c) => c.portalActive).length} Portales Activos
          </span>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#f2ecfb] text-[#501f92] flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#64748b] uppercase">Clientes Activos</span>
            <div className="text-xl font-extrabold text-[#0f172a]">{clients.length} cuentas</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#64748b] uppercase">Total Proyectos</span>
            <div className="text-xl font-extrabold text-[#0f172a]">{totalProjects} en ejecución</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#64748b] uppercase">Salud Operativa</span>
            <div className="text-xl font-extrabold text-[#0f172a]">
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
            placeholder="Buscar por cliente, NIT o contacto..."
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
              onClick={() => setFilterType('Fee Recurrente')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'Fee Recurrente'
                  ? 'bg-[#501f92] text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Fees
            </button>
            <button
              onClick={() => setFilterType('Proyecto')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'Proyecto'
                  ? 'bg-[#501f92] text-white shadow-2xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Proyectos
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
              Toda salud
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

      {/* Grid of Interactive Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((cli) => (
          <div
            key={cli.id}
            onClick={() => handleClientClick(cli.id)}
            className="p-5 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#8a4dff] hover:shadow-md transition-all cursor-pointer space-y-3.5 group relative"
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  cli.type === 'Fee Recurrente'
                    ? 'bg-[#d4ff4a]/20 text-[#2e5e04] border border-[#d4ff4a]/40'
                    : 'bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]'
                }`}
              >
                {cli.type}
              </span>

              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span
                  className={`w-2 h-2 rounded-full ${
                    cli.healthStatus === 'Saludable'
                      ? 'bg-[#10b981]'
                      : 'bg-[#f59e0b]'
                  }`}
                />
                <span
                  className={
                    cli.healthStatus === 'Saludable'
                      ? 'text-[#16a34a]'
                      : 'text-[#d97706]'
                  }
                >
                  {cli.healthStatus}
                </span>
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

            {/* Contact info snippet */}
            <div className="text-xs text-[#475569] pt-2 border-t border-[#f1f5f9] flex justify-between items-center">
              <span className="truncate max-w-[170px]">• {cli.commercialInfo.contactName}</span>
              <span className="text-[11px] text-[#64748b] font-medium">{cli.projectsCount} proyectos</span>
            </div>

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
  );
};
