import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  NewBusinessOpportunity,
  OpportunityType,
  ClientProfile,
  ProductBacklogTemplate,
  QuoteProposal,
  UserItem
} from '../types';
import { isEligibleScopingLeader, isEligibleTeamMember } from './teamCandidates';
import {
  HUBSPOT_SIMULATED_COMPANIES,
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
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Clock,
  Folder,
  Briefcase,
  Search,
  ArrowRight,
  Code2,
  Sliders,
  AlertCircle,
  FileText,
  ChevronDown
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
  existingClients,
  users = []
}) => {
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
  const leadersDropdownRef = useRef<HTMLDivElement>(null);
  const commercialDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');

  // General fields
  const [title, setTitle] = useState<string>('');
  const [briefText, setBriefText] = useState<string>('');
  const [selectedLeadUserIds, setSelectedLeadUserIds] = useState<string[]>([]);
  const [commercialUserIds, setCommercialUserIds] = useState<string[]>([]);
  const [leadersOpen, setLeadersOpen] = useState(false);
  const [commercialOpen, setCommercialOpen] = useState(false);

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
  }, [isOpen]);

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

    // Auto-select primary contact
    if (company.contacts.length > 0) {
      setSelectedContactId(company.contacts[0].id);
    } else {
      setSelectedContactId('');
    }

    // Auto-select first brief note
    if (company.notes.length > 0) {
      setSelectedNoteId(company.notes[0].id);
      setBriefText(company.notes[0].fullContent);
    } else {
      setSelectedNoteId('');
      setBriefText('');
    }

    // Auto suggest opportunity title
    if (!title) {
      setTitle(`Propuesta ${company.name}`);
    }
  };

  // Selected contact object
  const currentContact: HubSpotContactItem | undefined = useMemo(() => {
    if (!selectedCompany) return undefined;
    return selectedCompany.contacts.find((c) => c.id === selectedContactId);
  }, [selectedCompany, selectedContactId]);

  // Selected brief note object
  const currentNote: HubSpotMeetingNote | undefined = useMemo(() => {
    if (!selectedCompany) return undefined;
    return selectedCompany.notes.find((n) => n.id === selectedNoteId);
  }, [selectedCompany, selectedNoteId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompany) {
      return;
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

    // Verify if company matches an existing Orbit client
    const existingClientMatch = existingClients.find(
      (c) =>
        c.hubspotCompanyId === selectedCompany.id ||
        c.name.toLowerCase().trim() === selectedCompany.name.toLowerCase().trim()
    );

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
      title: title.trim() || `Propuesta ${selectedCompany.name}`,
      type: existingClientMatch ? 'upsell' : 'new_client',
      clientId: existingClientMatch ? existingClientMatch.id : null,
      prospectAccountName: selectedCompany.name,
      contactName: currentContact?.name,
      contactEmail: currentContact?.email,
      contactPhone: currentContact?.phone,
      leadUserId: resolvedLeadUserId,
      leadUserIds: selectedLeaders.map((user) => user.id),
      leadUserName: resolvedLeadUserName,
      commercialOwner: resolvedCommercialOwner,
      handoffHours: safeHandoffHours,
      handoffDeadline: deadlineTimestamp,

      // Guardar de forma simulada datos de HubSpot
      hubspotCompanyId: selectedCompany.id,
      hubspotContactId: currentContact?.id || null,
      hubspotBriefNoteId: currentNote?.id || null,
      hubspotBriefNoteSnippet: currentNote?.snippet || undefined,
      hubspotDealStage: null, // Los negocios en HubSpot se crean posteriormente desde Cotización

      status: 'discovery', // Inicia en discovery listo para dimensionamiento en Alcance
      briefSummary: briefText.trim() || currentNote?.snippet || undefined,
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

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con icono de alto contraste y diseño minimalista */}
        <div className="p-5 bg-gradient-to-r from-[#140b24] via-[#2a134a] to-[#501f92] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-white text-[#501f92] shadow-sm flex items-center justify-center">
                <Target className="w-5 h-5 stroke-[2.2]" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold tracking-tight">Nueva Oportunidad</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ff5c35]/25 text-[#fed7aa] border border-[#ff5c35]/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5c35]" />
                    HubSpot Sync
                  </span>
                </div>
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
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
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

              {/* Dropdown de Empresas HubSpot */}
              {isSearchingCompany && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-[#cbd5e1] shadow-xl z-20 max-h-52 overflow-y-auto divide-y divide-[#f1f5f9]">
                  {matchingCompanies.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => handleSelectCompany(c)}
                      className="w-full text-left p-2.5 hover:bg-[#fff7ed] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <strong className="text-[#0f172a] block text-xs">{c.name}</strong>
                        <span className="text-[10.5px] text-[#64748b]">
                          {c.domain} · {c.industry}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f1f5f9] text-[#501f92]">
                        ID: {c.id}
                      </span>
                    </button>
                  ))}
                  {matchingCompanies.length === 0 && (
                    <div className="p-3 text-center text-xs text-[#64748b]">
                      No se encontraron empresas con ese término.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mensaje obligatorio si la empresa no existe en HubSpot */}
            {hasNoCompanyMatch && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Esta empresa no se encuentra registrada en HubSpot.</strong>
                  <p className="mt-0.5 text-red-600">
                    Primero debe crearse en HubSpot antes de abrir la oportunidad en Orbit. No se permite crear empresas ni contactos manuales desde este prototipo.
                  </p>
                </div>
              </div>
            )}

            {/* Empresa seleccionada pill */}
            {selectedCompany && (
              <div className="p-2.5 rounded-xl bg-white border border-[#fed7aa] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                  <div>
                    <span className="font-extrabold text-[#0f172a]">{selectedCompany.name}</span>
                    <span className="text-[10px] text-[#64748b] ml-2">({selectedCompany.domain})</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#c2410c] bg-[#fff7ed] px-2 py-0.5 rounded border border-[#fed7aa]">
                  {selectedCompany.id}
                </span>
              </div>
            )}
          </div>

          {/* 2. Contacto principal en HubSpot (habilitado tras seleccionar empresa) */}
          <div className="space-y-1">
            <label className="font-bold text-[#475569] block flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#501f92]" />
                <span>Contacto principal en HubSpot:</span>
                <span className="text-red-500">*</span>
              </span>
              {selectedCompany && (
                <span className="text-[10px] text-[#64748b]">
                  {selectedCompany.contacts.length} contactos asociados
                </span>
              )}
            </label>

            {selectedCompany ? (
              <select
                required
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] font-semibold text-[#0f172a] bg-white focus:ring-2 focus:ring-[#501f92] text-xs"
              >
                <option value="">Selecciona un contacto...</option>
                {selectedCompany.contacts.map((cnt) => (
                  <option key={cnt.id} value={cnt.id}>
                    {cnt.name} ({cnt.role || 'Contacto'} · {cnt.email})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#94a3b8] text-xs italic">
                Selecciona primero una empresa en HubSpot para habilitar los contactos asociados.
              </div>
            )}

            {currentContact && (
              <div className="flex items-center gap-3 text-[11px] text-[#475569] pt-1 pl-1">
                <span>📧 {currentContact.email}</span>
                {currentContact.phone && <span>📞 {currentContact.phone}</span>}
                <span className="text-[#94a3b8] font-mono text-[10px]">ID: {currentContact.id}</span>
              </div>
            )}
          </div>

          {/* 3. Brief / Nota de reunión en HubSpot */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#475569] block flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#501f92]" />
                <span>Brief / nota de reunión en HubSpot:</span>
                <span className="text-red-500">*</span>
              </span>
              <span className="text-[10px] text-[#64748b]">Texto copiado de notas HubSpot</span>
            </label>

            {selectedCompany ? (
              <div className="space-y-2">
                <select
                  required
                  value={selectedNoteId}
                  onChange={(e) => {
                    const noteId = e.target.value;
                    setSelectedNoteId(noteId);
                    const note = selectedCompany.notes.find((n) => n.id === noteId);
                    if (note) {
                      setBriefText(note.fullContent);
                    }
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

                {currentNote && (
                  <div className="p-3 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] space-y-1">
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="font-bold text-[#501f92]">
                        📅 {currentNote.date} · ✍️ {currentNote.author}
                      </span>
                      <span className="text-[#64748b] font-mono text-[10px]">ID: {currentNote.id}</span>
                    </div>
                    <p className="text-[11px] text-[#334155] leading-relaxed italic">
                      "{currentNote.fullContent}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#94a3b8] text-xs italic">
                Selecciona primero una empresa en HubSpot para consultar sus notas de brief.
              </div>
            )}
          </div>

          {/* 4. Título de la oportunidad */}
          <div className="space-y-1">
            <label className="font-bold text-[#475569] block">
              Título comercial de la oportunidad: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Rediseño Ecommerce Bonafont & Campaña Q4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-bold focus:ring-2 focus:ring-[#501f92] text-xs bg-white"
            />
          </div>

          {/* 5. Responsable de alcance y Owner comercial (Multi-check) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Responsable de Alcance (Líder asignado) - Multi-check */}
            <div className="space-y-1 relative" ref={leadersDropdownRef}>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#475569] block text-xs">
                  Líder asignado para scoping: <span className="text-red-500">*</span>
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
                    ? 'Seleccionar líder(es)...'
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

            {/* Owner Comercial en Uhura - Multi-check */}
            <div className="space-y-1 relative" ref={commercialDropdownRef}>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#475569] block text-xs">
                  Owner Comercial en Uhura: <span className="text-red-500">*</span>
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

          {/* Fecha max. de entrega (sin hora) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#475569] block">
                Fecha max. de entrega: <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] font-semibold text-[#501f92] bg-[#f5f3ff] px-2 py-0.5 rounded">
                Fecha de entrega
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

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedCompany || hasNoCompanyMatch || !selectedContactId}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] disabled:bg-[#cbd5e1] disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4 text-[#d4ff4a]" />
              <span>Crear Oportunidad →</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
