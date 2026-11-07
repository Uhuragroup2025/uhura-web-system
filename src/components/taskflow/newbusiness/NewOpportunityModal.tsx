import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  NewBusinessOpportunity,
  ClientProfile,
  ProductBacklogTemplate,
  QuoteProposal,
  UserItem
} from '../types';
import { isEligibleScopingLeader, isEligibleTeamMember } from './teamCandidates';
import {
  HubSpotCompanyItem,
  HubSpotContactItem,
  HubSpotMeetingNote,
  searchHubspotCompanies
} from './hubspotSimulatedData';
import {
  Target,
  X,
  Building2,
  User,
  Calendar,
  CheckCircle2,
  Sparkles,
  Search,
  ChevronDown,
  Folder,
  Mail
} from 'lucide-react';

interface NewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOpportunity: (newOpp: NewBusinessOpportunity, commercialUserIds?: string[]) => void;
  existingClients: ClientProfile[];
  templates?: ProductBacklogTemplate[];
  initialMode?: 'hubspot' | 'manual';
  users?: UserItem[];
}

export const NewOpportunityModal: React.FC<NewOpportunityModalProps> = ({
  isOpen,
  onClose,
  onSaveOpportunity,
  existingClients = [],
  initialMode = 'hubspot',
  users = []
}) => {
  // Mode toggle: 'hubspot' | 'manual'
  const [mode, setMode] = useState<'hubspot' | 'manual'>(initialMode);

  // Available leaders for assignment (filtered from users)
  const availableUsers = users.filter((user) => user.status === 'Active');
  const eligibleLeaders = availableUsers.filter(isEligibleScopingLeader);

  // Commercial team members filtered strictly by functional capacity 'commercial'
  const commercialUsers: UserItem[] = useMemo(() => {
    return availableUsers.filter(isEligibleTeamMember).filter(
      (u: UserItem) =>
        u.accessLevel === 'commercial' ||
        u.accessLevel === 'client_relationship' ||
        (u.department && u.department.toLowerCase().includes('comercial')) ||
        (u.jobTitle && u.jobTitle.toLowerCase().includes('comercial'))
    );
  }, [availableUsers]);

  // HubSpot Search & Selected Entities State
  const [companySearchQuery, setCompanySearchQuery] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<HubSpotCompanyItem | null>(null);
  const [isSearchingCompany, setIsSearchingCompany] = useState<boolean>(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');

  // Manual Mode State (Replicating Screenshot 2)
  const [accountType, setAccountType] = useState<'new' | 'existing'>('new');
  const [selectedExistingClientId, setSelectedExistingClientId] = useState<string>('');
  const [manualCompanyName, setManualCompanyName] = useState<string>('');
  const [manualContactName, setManualContactName] = useState<string>('');
  const [manualContactEmail, setManualContactEmail] = useState<string>('');
  const [driveFolderUrl, setDriveFolderUrl] = useState<string>('');

  // General fields
  const [title, setTitle] = useState<string>('');
  const [briefText, setBriefText] = useState<string>('');
  const [selectedLeadUserIds, setSelectedLeadUserIds] = useState<string[]>([]);
  const [commercialUserIds, setCommercialUserIds] = useState<string[]>([]);
  const [leadersOpen, setLeadersOpen] = useState(false);
  const [commercialOpen, setCommercialOpen] = useState(false);
  const leadersDropdownRef = useRef<HTMLDivElement>(null);
  const commercialDropdownRef = useRef<HTMLDivElement>(null);

  const toLocalDate = (time: number) => {
    return new Date(time).toISOString().slice(0, 10);
  };
  const [deliveryDate, setDeliveryDate] = useState(() => toLocalDate(Date.now() + 3 * 86400000));
  const [deliveryError, setDeliveryError] = useState('');

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(target)) {
        setIsSearchingCompany(false);
      }
      if (leadersDropdownRef.current && !leadersDropdownRef.current.contains(target)) {
        setLeadersOpen(false);
      }
      if (commercialDropdownRef.current && !commercialDropdownRef.current.contains(target)) {
        setCommercialOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'hubspot');
      setAccountType('new');
      setSelectedExistingClientId(existingClients[0]?.id || '');
      setManualCompanyName('');
      setManualContactName('');
      setManualContactEmail('');
      setDriveFolderUrl('');
      setCompanySearchQuery('');
      setSelectedCompany(null);
      setIsSearchingCompany(false);
      setSelectedContactId('');
      setSelectedNoteId('');
      setTitle('');
      setBriefText('');
      setDeliveryDate(toLocalDate(Date.now() + 3 * 86400000));
      setDeliveryError('');
      setLeadersOpen(false);
      setCommercialOpen(false);
      if (commercialUsers.length > 0) {
        setCommercialUserIds([commercialUsers[0].id]);
      }
      if (eligibleLeaders.length > 0) {
        setSelectedLeadUserIds([eligibleLeaders[0].id]);
      }
    }
  }, [isOpen, initialMode, existingClients]);

  // Filtered HubSpot Companies
  const matchingCompanies = useMemo(() => {
    return searchHubspotCompanies(companySearchQuery);
  }, [companySearchQuery]);

  const hasNoCompanyMatch = useMemo(() => {
    return companySearchQuery.trim().length > 0 && matchingCompanies.length === 0;
  }, [companySearchQuery, matchingCompanies.length]);

  // Handle selecting a company from HubSpot
  const handleSelectCompany = (company: HubSpotCompanyItem) => {
    setSelectedCompany(company);
    setCompanySearchQuery(company.name);
    setIsSearchingCompany(false);

    if (company.contacts.length > 0) {
      setSelectedContactId(company.contacts[0].id);
    } else {
      setSelectedContactId('');
    }

    if (company.notes.length > 0) {
      setSelectedNoteId(company.notes[0].id);
      setBriefText(company.notes[0].fullContent);
    } else {
      setSelectedNoteId('');
      setBriefText('');
    }

    if (!title) {
      setTitle(`Propuesta ${company.name}`);
    }
  };

  const currentContact: HubSpotContactItem | undefined = useMemo(() => {
    if (!selectedCompany) return undefined;
    return selectedCompany.contacts.find((c) => c.id === selectedContactId);
  }, [selectedCompany, selectedContactId]);

  const currentNote: HubSpotMeetingNote | undefined = useMemo(() => {
    if (!selectedCompany) return undefined;
    return selectedCompany.notes.find((n) => n.id === selectedNoteId);
  }, [selectedCompany, selectedNoteId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let clientMatch: ClientProfile | null = null;
    let prospectName = '';
    let contactN = '';
    let contactE = '';
    let hubCompanyId: string | null = null;
    let hubContactId: string | null = null;
    let hubNoteId: string | null = null;
    let hubNoteSnippet: string | undefined = undefined;

    if (mode === 'hubspot') {
      if (!selectedCompany) return;
      hubCompanyId = selectedCompany.id;
      hubContactId = currentContact?.id || null;
      hubNoteId = currentNote?.id || null;
      hubNoteSnippet = currentNote?.snippet || undefined;
      prospectName = selectedCompany.name;
      contactN = currentContact?.name || '';
      contactE = currentContact?.email || '';

      clientMatch = existingClients.find(
        (c) =>
          c.hubspotCompanyId === selectedCompany.id ||
          c.name.toLowerCase().trim() === selectedCompany.name.toLowerCase().trim()
      ) || null;
    } else {
      // Modo manual
      if (accountType === 'existing') {
        const found = existingClients.find((c) => c.id === selectedExistingClientId);
        if (!found) return;
        clientMatch = found;
        prospectName = found.name;
      } else {
        if (!manualCompanyName.trim()) return;
        prospectName = manualCompanyName.trim();
        clientMatch = existingClients.find(
          (c) => c.name.toLowerCase().trim() === prospectName.toLowerCase().trim()
        ) || null;
      }
      contactN = manualContactName.trim();
      contactE = manualContactEmail.trim();
    }

    const oppId = `opp-${Date.now()}`;
    const defaultQuoteId = `quote-${oppId}`;

    const deliveryTime = new Date(`${deliveryDate}T18:00:00`).getTime();
    const deadlineTimestamp = Number.isFinite(deliveryTime)
      ? new Date(deliveryTime).toISOString()
      : new Date(Date.now() + 3 * 86400000).toISOString();
    const safeHandoffHours = Math.max(24, Math.round((new Date(deadlineTimestamp).getTime() - Date.now()) / 3600000));

    const selectedLeaders = eligibleLeaders.filter((user) => selectedLeadUserIds.includes(user.id));
    if (selectedLeaders.length === 0) return;
    const resolvedLeadUserId = selectedLeaders[0].id;
    const resolvedLeadUserName = selectedLeaders.map((u) => u.name).join(', ');

    const selectedCommercials = commercialUsers.filter((user) => commercialUserIds.includes(user.id));
    if (selectedCommercials.length === 0) return;
    const resolvedCommercialOwner = selectedCommercials.map((u) => u.name).join(', ');

    const initialQuote: QuoteProposal = {
      id: defaultQuoteId,
      opportunityId: oppId,
      versionLabel: 'V1 - Alcance Base',
      order: 1,
      status: 'draft',
      deliverables: [],
      totalHoursRollup: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newOpp: NewBusinessOpportunity = {
      id: oppId,
      title: title.trim() || `Propuesta ${prospectName}`,
      type: clientMatch ? 'upsell' : 'new_client',
      clientId: clientMatch ? clientMatch.id : null,
      prospectAccountName: prospectName,
      contactName: contactN || undefined,
      contactEmail: contactE || undefined,
      leadUserId: resolvedLeadUserId,
      leadUserIds: selectedLeaders.map((user) => user.id),
      leadUserName: resolvedLeadUserName,
      commercialOwner: resolvedCommercialOwner,
      handoffHours: safeHandoffHours,
      handoffDeadline: deadlineTimestamp,

      // Datos de HubSpot si aplica
      hubspotCompanyId: hubCompanyId,
      hubspotContactId: hubContactId,
      hubspotBriefNoteId: hubNoteId,
      hubspotBriefNoteSnippet: hubNoteSnippet,
      hubspotDealStage: null,

      driveFolderUrl: driveFolderUrl.trim() || undefined,
      status: 'discovery',
      briefSummary: briefText.trim() || hubNoteSnippet || undefined,
      quotes: [initialQuote],
      startConditions: {
        contractSignedRequired: true,
        contractSignedCompleted: false,
        downPaymentRequired: 'required',
        downPaymentPercentage: 50,
        downPaymentReceived: false,
        fiscalDocsRequiredBeforeBilling: true,
        fiscalDocsCompleted: false,
        onboardingCompleted: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveOpportunity(
      newOpp,
      commercialUsers.filter((user) => commercialUserIds.includes(user.id)).map((user) => user.id)
    );
    onClose();
  };

  const isFormValid =
    mode === 'hubspot'
      ? Boolean(selectedCompany && !hasNoCompanyMatch && selectedContactId && title.trim() && selectedLeadUserIds.length > 0 && commercialUserIds.length > 0)
      : Boolean(
          (accountType === 'existing' ? selectedExistingClientId : manualCompanyName.trim()) &&
          title.trim() &&
          selectedLeadUserIds.length > 0 &&
          commercialUserIds.length > 0
        );

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con icono, badge y Segmented Control (Traer desde HubSpot / Crear manualmente) */}
        <div className="p-5 bg-gradient-to-r from-[#140b24] via-[#2a134a] to-[#501f92] text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-white text-[#501f92] shadow-sm flex items-center justify-center">
                <Target className="w-5 h-5 stroke-[2.2]" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold tracking-tight">Nueva Oportunidad</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#d4ff4a]/20 text-[#d4ff4a] border border-[#d4ff4a]/30">
                    Handoff Comercial
                  </span>
                </div>
                <p className="text-[11px] text-white/75 mt-0.5">
                  Cuando una oportunidad calificada requiere scoping de un líder, Orbit activa el SLA e inicia su tarea de preventa
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Segmented Control: Traer desde HubSpot vs Crear manualmente */}
          <div className="flex items-center p-1 rounded-xl bg-black/25 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setMode('hubspot')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'hubspot'
                  ? 'bg-white text-[#501f92] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#ff5c35]" />
              <span>Traer desde HubSpot</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'manual'
                  ? 'bg-white text-[#501f92] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>Crear manualmente</span>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {mode === 'hubspot' ? (
            /* ========================================================================= */
            /* MODO HUBSPOT (Screenshot 1) */
            /* ========================================================================= */
            <>
              {/* 1. Empresa / cliente en HubSpot */}
              <div className="p-3.5 bg-[#fff7ed] rounded-2xl border border-[#ffedd5] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-[#9a3412] text-xs flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#ea580c]" />
                    <span>Empresa / cliente en HubSpot:</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-[#c2410c] font-medium">Búsqueda en directorio HubSpot</span>
                </div>

                <div className="relative" ref={companyDropdownRef}>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#9a3412]" />
                    <input
                      type="text"
                      required
                      placeholder="Buscar empresa por nombre o dominio (ej: Danone, GeoTours, Bambú...)"
                      value={companySearchQuery}
                      onFocus={() => setIsSearchingCompany(true)}
                      onChange={(e) => {
                        setCompanySearchQuery(e.target.value);
                        setIsSearchingCompany(true);
                        if (selectedCompany && e.target.value !== selectedCompany.name) {
                          setSelectedCompany(null);
                          setSelectedContactId('');
                          setSelectedNoteId('');
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#fed7aa] bg-white text-[#0f172a] text-xs font-semibold focus:ring-2 focus:ring-[#ea580c] focus:outline-none placeholder:text-[#94a3b8] placeholder:font-normal"
                    />
                  </div>

                  {isSearchingCompany && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-[#cbd5e1] shadow-xl z-20 max-h-52 overflow-y-auto divide-y divide-[#f1f5f9]">
                      {matchingCompanies.map((c) => (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => handleSelectCompany(c)}
                          className="w-full p-2.5 text-left hover:bg-[#fff7ed] transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <strong className="text-xs text-[#0f172a] group-hover:text-[#ea580c] block">
                              {c.name}
                            </strong>
                            <span className="text-[10.5px] text-[#64748b]">
                              {c.domain} · {(c as any).city || 'Colombia'}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#64748b]">
                            {c.id}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCompany && (
                  <div className="p-2.5 rounded-xl bg-white border border-[#fed7aa] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0f172a] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                      <span>{selectedCompany.name}</span>
                    </span>
                    <span className="text-[10.5px] text-[#ea580c] font-semibold">
                      {selectedCompany.contacts.length} contacto(s) · {selectedCompany.notes.length} nota(s)
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Contacto principal en HubSpot */}
              <div className="space-y-1">
                <label className="font-bold text-[#475569] block">
                  Contacto principal en HubSpot: <span className="text-red-500">*</span>
                </label>
                {selectedCompany ? (
                  <select
                    required
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#cbd5e1] font-semibold text-[#0f172a] bg-white focus:ring-2 focus:ring-[#501f92] text-xs"
                  >
                    <option value="">Selecciona un contacto asociado...</option>
                    {selectedCompany.contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} ({contact.role || 'Contacto'}) — {contact.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#94a3b8] text-xs italic">
                    Selecciona primero una empresa en HubSpot para habilitar los contactos asociados.
                  </div>
                )}
              </div>

              {/* 3. Brief / nota de reunión en HubSpot */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#475569] block">
                    Brief / nota de reunión en HubSpot: <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-[#64748b]">Texto copiado de notas HubSpot</span>
                </div>
                {selectedCompany ? (
                  <select
                    required
                    value={selectedNoteId}
                    onChange={(e) => {
                      const noteId = e.target.value;
                      setSelectedNoteId(noteId);
                      const note = selectedCompany.notes.find((n) => n.id === noteId);
                      if (note) setBriefText(note.fullContent);
                    }}
                    className="w-full p-2.5 rounded-xl border border-[#cbd5e1] font-medium text-[#0f172a] bg-white focus:ring-2 focus:ring-[#501f92] text-xs"
                  >
                    <option value="">Selecciona una nota de reunión asociada...</option>
                    {selectedCompany.notes.map((note) => (
                      <option key={note.id} value={note.id}>
                        [{note.date}] {note.author ? `${note.author} · ` : ''}{note.snippet.slice(0, 70)}...
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#94a3b8] text-xs italic">
                    Selecciona primero una empresa en HubSpot para consultar sus notas de brief.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ========================================================================= */
            /* MODO MANUAL (Screenshot 2: Idéntico a Producción) */
            /* ========================================================================= */
            <>
              {/* Tipo de Cuenta: Cliente nuevo vs Cliente existente */}
              <div className="p-3.5 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] space-y-2.5">
                <span className="font-bold text-[#475569] block text-xs">Tipo de Cuenta:</span>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#0f172a]">
                    <input
                      type="radio"
                      name="accountType"
                      value="new"
                      checked={accountType === 'new'}
                      onChange={() => setAccountType('new')}
                      className="w-4 h-4 text-[#501f92] focus:ring-[#501f92] cursor-pointer"
                    />
                    <span>Cliente nuevo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#0f172a]">
                    <input
                      type="radio"
                      name="accountType"
                      value="existing"
                      checked={accountType === 'existing'}
                      onChange={() => setAccountType('existing')}
                      className="w-4 h-4 text-[#501f92] focus:ring-[#501f92] cursor-pointer"
                    />
                    <span>Cliente existente</span>
                  </label>
                </div>
              </div>

              {/* Empresa o Cuenta */}
              {accountType === 'new' ? (
                <div className="space-y-1">
                  <label className="font-bold text-[#475569] block">
                    Empresa o Cuenta: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Danone S.A., GeoTours, BrandCo..."
                    value={manualCompanyName}
                    onChange={(e) => {
                      setManualCompanyName(e.target.value);
                      if (!title) setTitle(`Propuesta ${e.target.value}`);
                    }}
                    className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-semibold bg-white focus:ring-2 focus:ring-[#501f92] text-xs"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-bold text-[#475569] block">
                    Seleccionar Cliente existente: <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedExistingClientId}
                    onChange={(e) => {
                      setSelectedExistingClientId(e.target.value);
                      const c = existingClients.find((cli) => cli.id === e.target.value);
                      if (c && !title) setTitle(`Propuesta ${c.name}`);
                    }}
                    className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-semibold bg-white focus:ring-2 focus:ring-[#501f92] text-xs"
                  >
                    <option value="">Selecciona un cliente de la lista...</option>
                    {existingClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {(client as any).brand ? `(${(client as any).brand})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Nombre / Título de la oportunidad */}
          <div className="space-y-1">
            <label className="font-bold text-[#475569] block">
              {mode === 'manual' ? 'Nombre de la Oportunidad / Requerimiento:' : 'Título comercial de la oportunidad:'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Rediseño ecommerce Bonafont..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-bold focus:ring-2 focus:ring-[#501f92] text-xs bg-white"
            />
          </div>

          {/* Brief (opcional) */}
          <div className="space-y-1">
            <label className="font-bold text-[#475569] block">
              Brief {mode === 'manual' ? '(opcional)' : 'adicional / notas'}:
            </label>
            <textarea
              rows={3}
              placeholder="Contexto y requerimiento recibido del cliente"
              value={briefText}
              onChange={(e) => setBriefText(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] bg-white focus:ring-2 focus:ring-[#501f92] text-xs"
            />
          </div>

          {/* Contacto Principal & Email (en modo manual) */}
          {mode === 'manual' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#475569] block">Contacto Principal:</label>
                <input
                  type="text"
                  placeholder="Ej: Carlos Mendoza"
                  value={manualContactName}
                  onChange={(e) => setManualContactName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] bg-white focus:ring-2 focus:ring-[#501f92] text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#475569] block">Email de Contacto:</label>
                <input
                  type="email"
                  placeholder="carlos@empresa.com"
                  value={manualContactEmail}
                  onChange={(e) => setManualContactEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] bg-white focus:ring-2 focus:ring-[#501f92] text-xs"
                />
              </div>
            </div>
          )}

          {/* Responsable de alcance y Owner comercial (Multi-check) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Responsable de Alcance (Multi-check) */}
            <div className="space-y-1 relative" ref={leadersDropdownRef}>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#475569] block text-xs">
                  {mode === 'manual' ? 'Responsables del alcance:' : 'Líder asignado para scoping:'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-[#64748b] font-semibold">
                  {selectedLeadUserIds.length} {selectedLeadUserIds.length === 1 ? 'seleccionado' : 'seleccionados'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLeadersOpen((prev) => !prev);
                  setCommercialOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition-all bg-white cursor-pointer ${
                  selectedLeadUserIds.length === 0
                    ? 'border-red-300 ring-1 ring-red-200'
                    : 'border-[#cbd5e1] hover:border-[#501f92] focus:ring-2 focus:ring-[#501f92]'
                }`}
              >
                <span className="truncate font-semibold text-[#0f172a]">
                  {selectedLeadUserIds.length === 0
                    ? 'Seleccionar responsable(s)...'
                    : selectedLeadUserIds.length === 1
                    ? eligibleLeaders.find((u) => u.id === selectedLeadUserIds[0])?.name || '1 líder'
                    : `${eligibleLeaders.find((u) => u.id === selectedLeadUserIds[0])?.name} +${selectedLeadUserIds.length - 1} más`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#64748b] transition-transform ${leadersOpen ? 'rotate-180' : ''}`} />
              </button>

              {leadersOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-[#cbd5e1] rounded-2xl shadow-xl p-2 space-y-1 max-h-56 overflow-y-auto animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1.5 px-1 border-b border-[#f1f5f9] text-[10px]">
                    <span className="font-bold text-[#64748b] uppercase tracking-wider">Líderes disponibles</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      <button
                        type="button"
                        onClick={() => setSelectedLeadUserIds(eligibleLeaders.map((u) => u.id))}
                        className="text-[#501f92] hover:underline cursor-pointer"
                      >
                        Todos
                      </button>
                      <span className="text-[#cbd5e1]">·</span>
                      <button
                        type="button"
                        onClick={() => setSelectedLeadUserIds([])}
                        className="text-[#64748b] hover:underline cursor-pointer"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                  <div className="space-y-0.5 pt-1">
                    {eligibleLeaders.map((u) => {
                      const isChecked = selectedLeadUserIds.includes(u.id);
                      return (
                        <label
                          key={u.id}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#f8fafc] cursor-pointer text-xs transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedLeadUserIds((prev) =>
                                isChecked ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                              );
                            }}
                            className="w-4 h-4 rounded text-[#501f92] focus:ring-[#501f92] border-[#cbd5e1] cursor-pointer accent-[#501f92]"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-[#0f172a] block truncate">{u.name}</span>
                            <span className="text-[10px] text-[#64748b] block truncate">{u.officialRole || u.role || 'Líder'}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Owner Comercial en Uhura (Multi-check) */}
            <div className="space-y-1 relative" ref={commercialDropdownRef}>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#475569] block text-xs">
                  {mode === 'manual' ? 'Responsable comercial:' : 'Owner Comercial en Uhura:'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-[#64748b] font-semibold">
                  {commercialUserIds.length} {commercialUserIds.length === 1 ? 'seleccionado' : 'seleccionados'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCommercialOpen((prev) => !prev);
                  setLeadersOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition-all bg-white cursor-pointer ${
                  commercialUserIds.length === 0
                    ? 'border-red-300 ring-1 ring-red-200'
                    : 'border-[#cbd5e1] hover:border-[#501f92] focus:ring-2 focus:ring-[#501f92]'
                }`}
              >
                <span className="truncate font-semibold text-[#0f172a]">
                  {commercialUserIds.length === 0
                    ? 'Seleccionar comercial(es)...'
                    : commercialUserIds.length === 1
                    ? commercialUsers.find((u) => u.id === commercialUserIds[0])?.name || '1 comercial'
                    : `${commercialUsers.find((u) => u.id === commercialUserIds[0])?.name} +${commercialUserIds.length - 1} más`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#64748b] transition-transform ${commercialOpen ? 'rotate-180' : ''}`} />
              </button>

              {commercialOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-[#cbd5e1] rounded-2xl shadow-xl p-2 space-y-1 max-h-56 overflow-y-auto animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1.5 px-1 border-b border-[#f1f5f9] text-[10px]">
                    <span className="font-bold text-[#64748b] uppercase tracking-wider">Equipo Comercial</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      <button
                        type="button"
                        onClick={() => setCommercialUserIds(commercialUsers.map((u) => u.id))}
                        className="text-[#ea580c] hover:underline cursor-pointer"
                      >
                        Todos
                      </button>
                      <span className="text-[#cbd5e1]">·</span>
                      <button
                        type="button"
                        onClick={() => setCommercialUserIds([])}
                        className="text-[#64748b] hover:underline cursor-pointer"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                  <div className="space-y-0.5 pt-1">
                    {commercialUsers.map((u) => {
                      const isChecked = commercialUserIds.includes(u.id);
                      return (
                        <label
                          key={u.id}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#f8fafc] cursor-pointer text-xs transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setCommercialUserIds((prev) =>
                                isChecked ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                              );
                            }}
                            className="w-4 h-4 rounded text-[#ea580c] focus:ring-[#ea580c] border-[#cbd5e1] cursor-pointer accent-[#ea580c]"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-[#0f172a] block truncate">{u.name}</span>
                            <span className="text-[10px] text-[#64748b] block truncate">{u.jobTitle || 'Comercial'}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fecha límite del dimensionamiento técnico (no es la entrega del proyecto) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#475569] block">
                Fecha límite del alcance: <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] font-semibold text-[#501f92] bg-[#f5f3ff] px-2 py-0.5 rounded">
                Para el líder técnico
              </span>
            </div>
            <input
              type="date"
              required
              value={deliveryDate}
              onChange={(e) => {
                setDeliveryDate(e.target.value);
                setDeliveryError('');
              }}
              className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium bg-white focus:ring-2 focus:ring-[#501f92] text-xs"
            />
            {deliveryError && <p className="text-[11px] text-red-500 font-bold">{deliveryError}</p>}
          </div>

          {/* Carpeta Google Drive (Screenshot 2) */}
          <div className="p-3.5 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] space-y-1.5">
            <label className="font-bold text-[#334155] flex items-center gap-1.5 text-xs">
              <Folder className="w-4 h-4 text-[#501f92]" />
              <span>Carpeta Google Drive:</span>
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/drive/folders/..."
              value={driveFolderUrl}
              onChange={(e) => setDriveFolderUrl(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs text-[#0f172a] bg-white focus:ring-2 focus:ring-[#501f92]"
            />
            <p className="text-[10.5px] text-[#64748b]">
              Brief, propuesta y documentos relacionados. Repositorio documental oficial del prospecto.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between flex-wrap gap-2">
            <p className="text-[11px] text-[#64748b] italic">
              El líder decidirá si usar plantilla o hacer a medida al abrir <strong>Alcance</strong>.
            </p>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] disabled:bg-[#cbd5e1] disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#d4ff4a]" />
                <span>Crear oportunidad</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
