import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ClientProfile, ClientStatus, UserItem } from './types';
import { ClientDetailView } from './ClientDetailView';
import { EditClientModal } from './EditClientModal';
import { CreateClientModal } from './CreateClientModal';
import {
  Search,
  Plus,
  Building2,
  ChevronRight,
  Edit3,
  MoreVertical,
  Archive,
  FolderPlus,
  ExternalLink,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface ClientsViewProps {
  clients: ClientProfile[];
  currentUser?: UserItem;
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
  currentUser,
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

  // Card action menu state
  const [activeMenuClientId, setActiveMenuClientId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Edit modal state
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Create modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Close card menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuClientId(null);
      }
    };
    if (activeMenuClientId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuClientId]);

  // Determine whether current user is administrative / commercial
  const isCommercialOrAdmin = useMemo(() => {
    if (!currentUser) return true;
    const level = currentUser.accessLevel;
    const role = (currentUser.role || '').toLowerCase();
    const officialRole = (currentUser.officialRole || '').toLowerCase();
    return (
      level === 'executive' ||
      level === 'system_admin' ||
      role === 'commercial' ||
      role === 'admin' ||
      role.includes('comercial') ||
      officialRole.includes('comercial') ||
      officialRole.includes('directora') ||
      officialRole.includes('admin')
    );
  }, [currentUser]);

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
    setActiveMenuClientId(null);
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

  // If a client is selected, show ClientDetailView
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

  // Active, paused, and archived counts
  const activeClients = clients.filter((c) => (c.status || 'active') === 'active');
  const pausedClients = clients.filter((c) => c.status === 'paused');
  const archivedClients = clients.filter((c) => c.status === 'archived');
  const totalProjects = clients.reduce((acc, c) => acc + (c.projectsCount || 0), 0);
  const atRiskCount = clients.filter((c) => c.healthStatus === 'En Riesgo').length;

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
        c.commercialInfo?.brands?.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = filterStatus === 'all' || (c.status || 'active') === filterStatus;
      const matchesHealth = filterHealth === 'all' || c.healthStatus === filterHealth;

      return matchesSearch && matchesStatus && matchesHealth;
    });

  const filteredActiveClients = filterClientsList(activeClients);
  const filteredPausedClients = filterClientsList(pausedClients);
  const filteredArchivedClients = filterClientsList(archivedClients);

  // Combined active and paused when displaying directory
  const displayClients = filterStatus === 'archived'
    ? filteredArchivedClients
    : filterStatus === 'paused'
    ? filteredPausedClients
    : filterStatus === 'active'
    ? filteredActiveClients
    : [...filteredActiveClients, ...filteredPausedClients];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & RESUMEN EN UNA SOLA LÍNEA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight">
            Cartera de Clientes
          </h2>
          {/* Resumen ejecutivo en una sola línea */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-[#64748b] mt-1 font-medium">
            <span className="font-bold text-[#0f172a]">{clients.length} cuentas</span>
            <span className="text-[#cbd5e1]">·</span>
            <span className="text-emerald-700 font-semibold">{activeClients.length} activas</span>
            {pausedClients.length > 0 && (
              <>
                <span className="text-[#cbd5e1]">·</span>
                <span className="text-amber-700 font-semibold">{pausedClients.length} pausadas</span>
              </>
            )}
            <span className="text-[#cbd5e1]">·</span>
            <span>{totalProjects} proyectos</span>
            <span className="text-[#cbd5e1]">·</span>
            <span className={atRiskCount > 0 ? 'text-amber-600 font-bold' : 'text-[#64748b]'}>
              {atRiskCount} en riesgo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Cuenta</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA ÚNICA DE FILTROS LIMPIA: [Buscar cliente...] [Estado ▾] [Salud ▾] */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-[#e2e8f0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar cliente, marca o contacto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-medium text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#501f92] focus:bg-white transition-all"
          />
        </div>

        {/* Dropdowns de Estado y Salud */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl font-semibold text-[#0f172a] focus:outline-none focus:border-[#501f92] cursor-pointer"
          >
            <option value="all">Estado: Todos</option>
            <option value="active">Activos ({activeClients.length})</option>
            <option value="paused">Pausados ({pausedClients.length})</option>
            <option value="archived">Archivados ({archivedClients.length})</option>
          </select>

          <select
            value={filterHealth}
            onChange={(e) => setFilterHealth(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl font-semibold text-[#0f172a] focus:outline-none focus:border-[#501f92] cursor-pointer"
          >
            <option value="all">Salud: Todas</option>
            <option value="Saludable">Saludables</option>
            <option value="En Riesgo">En riesgo</option>
          </select>

          {(searchQuery || filterStatus !== 'all' || filterHealth !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setFilterHealth('all');
              }}
              className="text-xs font-bold text-[#501f92] hover:underline px-1.5 cursor-pointer shrink-0"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* 3. CARDS DE CLIENTE: MÁS BAJAS, ESCANEABLES (3 COLUMNAS EN DESKTOP) */}
      {displayClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-[#94a3b8] space-y-2">
          <Building2 className="w-8 h-8 mx-auto text-[#cbd5e1]" />
          <p className="text-xs font-semibold">No se encontraron clientes con los filtros aplicados.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setFilterHealth('all');
            }}
            className="text-xs font-bold text-[#501f92] hover:underline"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {displayClients.map((cli) => {
            const primaryContact = cli.contacts?.find((con) => con.isPrimary) || cli.contacts?.[0];
            const isMenuOpen = activeMenuClientId === cli.id;

            return (
              <div
                key={cli.id}
                onClick={() => handleClientClick(cli.id)}
                className="p-4 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#8a4dff] hover:shadow-2xs transition-all cursor-pointer space-y-2.5 group relative flex flex-col justify-between"
              >
                <div className="space-y-2">
                  {/* Fila 1: Nombre + Estado / Salud + Menú ⋯ */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-sm text-[#0f172a] group-hover:text-[#501f92] transition-colors truncate">
                        {cli.name}
                      </h3>

                      {/* Estado · Salud en una sola línea */}
                      <div className="flex items-center gap-1 text-[11px] font-semibold mt-0.5">
                        <span className={cli.status === 'paused' ? 'text-amber-700' : 'text-emerald-700'}>
                          {cli.status === 'paused' ? 'Pausado' : 'Activo'}
                        </span>
                        <span className="text-[#cbd5e1]">·</span>
                        <span className="flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
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
                        </span>
                      </div>
                    </div>

                    {/* Menú ⋯ secundario */}
                    <div
                      className="relative shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveMenuClientId(isMenuOpen ? null : cli.id)}
                        className="p-1 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                        title="Opciones de cuenta"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Popover desplegable */}
                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-[#e2e8f0] shadow-lg py-1.5 z-30 text-xs animate-in fade-in zoom-in-95 duration-100"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuClientId(null);
                              handleClientClick(cli.id);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#f8fafc] text-[#0f172a] font-medium flex items-center gap-2 cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-[#64748b]" />
                            <span>Ver detalle de cuenta</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleEditClick(e, cli)}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#f8fafc] text-[#0f172a] font-medium flex items-center gap-2 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#64748b]" />
                            <span>Editar cuenta</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuClientId(null);
                              handleClientClick(cli.id);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#f8fafc] text-[#0f172a] font-medium flex items-center gap-2 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#64748b]" />
                            <span>Gestionar razón social / NIT</span>
                          </button>

                          {onOpenNewProjectForClient && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuClientId(null);
                                onOpenNewProjectForClient(cli.id);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-[#f8fafc] text-[#501f92] font-semibold flex items-center gap-2 border-t border-[#f1f5f9] cursor-pointer"
                            >
                              <FolderPlus className="w-3.5 h-3.5 text-[#501f92]" />
                              <span>Crear nuevo proyecto</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fila 2: Contacto principal · Proyectos */}
                  <div className="text-xs text-[#475569] flex items-center justify-between gap-2">
                    <span className="truncate font-medium">
                      {primaryContact ? primaryContact.name : (cli.commercialInfo?.contactName || 'Sin contacto')}
                    </span>
                    <span className="text-[11px] text-[#64748b] font-semibold shrink-0">
                      {cli.projectsCount || 0} {cli.projectsCount === 1 ? 'proyecto' : 'proyectos'}
                    </span>
                  </div>

                  {/* Fila 3: Marcas (tags compactos) */}
                  {cli.commercialInfo?.brands && cli.commercialInfo.brands.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      {cli.commercialInfo.brands.slice(0, 3).map((b, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#f8fafc] text-[#475569] border border-[#e2e8f0]"
                        >
                          {b}
                        </span>
                      ))}
                      {cli.commercialInfo.brands.length > 3 && (
                        <span className="text-[10px] text-[#94a3b8] font-mono px-1">
                          +{cli.commercialInfo.brands.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Fila 4: Métrica Principal según Rol (RBAC) */}
                <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-xs mt-1">
                  {isCommercialOrAdmin ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#64748b] uppercase font-bold">Facturado</span>
                        <span className="font-bold text-[#501f92]">{cli.billedCOP || '$0'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#64748b] uppercase font-bold">Margen</span>
                        <span className="font-bold text-[#0f172a]">
                          {cli.averageMarginPercent !== null && cli.averageMarginPercent !== undefined
                            ? `${cli.averageMarginPercent}%`
                            : '—'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] text-[#475569] font-medium">
                        {cli.projectsCount || 0} proyectos en cartera
                      </span>
                      <span
                        className={`text-[11px] font-bold ${
                          cli.healthStatus === 'Saludable' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {cli.healthStatus === 'Saludable' ? 'Al día' : '1 en riesgo'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. SECCIÓN SECUNDARIA: ARCHIVADOS (OPCIONAL O CUANDO HAY FILTRO) */}
      {filterStatus === 'all' && archivedClients.length > 0 && (
        <div className="pt-2 border-t border-[#f1f5f9]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowArchivedList(!showArchivedList)}
              className="text-xs font-bold text-[#64748b] hover:text-[#0f172a] flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Archive className="w-3.5 h-3.5 text-[#94a3b8]" />
              <span>Cuentas Archivadas ({archivedClients.length})</span>
              <span className="text-[10px] font-normal text-[#94a3b8]">
                {showArchivedList ? '— ocultar' : '— ver'}
              </span>
            </button>
            <span className="text-[11px] text-[#94a3b8]">Histórico conservado</span>
          </div>

          {showArchivedList && (
            <div className="mt-2 bg-white rounded-2xl border border-[#e2e8f0] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f8fafc]">
                      <th className="py-2.5 px-4">CLIENTE</th>
                      <th className="py-2.5 px-4">ESTADO</th>
                      <th className="py-2.5 px-4">CONTACTO</th>
                      <th className="py-2.5 px-4">PROYECTOS</th>
                      <th className="py-2.5 px-4 text-right pr-4">ACCIÓN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {archivedClients.map((cli) => (
                      <tr
                        key={cli.id}
                        onClick={() => handleClientClick(cli.id)}
                        className="hover:bg-[#f8fafc] cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-4 font-bold text-[#0f172a]">{cli.name}</td>
                        <td className="py-2.5 px-4">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#f1f5f9] text-[#64748b]">
                            Archivado
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-[#475569]">
                          {cli.contacts?.[0]?.name || cli.commercialInfo?.contactName || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-[#64748b] font-mono">
                          {cli.closedProjectsCount || 0} cerrados
                        </td>
                        <td className="py-2.5 px-4 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleEditClick(e, cli)}
                            className="text-xs font-bold text-[#501f92] hover:underline"
                          >
                            Editar
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

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateClient={handleCreateNewClient}
      />
    </div>
  );
};
