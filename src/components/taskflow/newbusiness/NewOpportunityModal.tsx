import React, { useState } from 'react';
import {
  NewBusinessOpportunity,
  OpportunityType,
  ClientProfile,
  ProductBacklogTemplate,
  QuoteProposal,
  UserItem
} from '../types';
import { initialUsers } from '../mockData';
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
  Sliders
} from 'lucide-react';

interface NewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOpportunity: (newOpp: NewBusinessOpportunity) => void;
  existingClients: ClientProfile[];
  templates?: ProductBacklogTemplate[];
  initialMode?: 'hubspot' | 'manual';
  users?: UserItem[];
}

// Preset realistic HubSpot deals for quick testing / dev simulation
const HUBSPOT_DEMO_DEALS = [
  {
    id: 'hs-deal-1049281',
    dealName: 'Rediseño ecommerce Bonafont',
    accountName: 'Danone S.A.',
    contactName: 'Carlos Mendoza',
    contactEmail: 'carlos.mendoza@danone.com',
    contactPhone: '+57 (311) 889-0012',
    dealUrl: 'https://app.hubspot.com/contacts/8821940/deal/1049281',
    commercialOwner: 'Cata · Directora Comercial',
    suggestedLeadUserId: 'u-2', // Paola Monsalve / Product Lead
    driveFolderUrl: 'https://drive.google.com/drive/folders/1Danone-Bonafont-Ecommerce-2026'
  },
  {
    id: 'hs-deal-2098144',
    dealName: 'Plataforma Turística & Motor de Reservas',
    accountName: 'GeoTours Colombia',
    contactName: 'Mariana Restrepo',
    contactEmail: 'mrestrepo@geotours.co',
    contactPhone: '+57 (314) 776-5544',
    dealUrl: 'https://app.hubspot.com/contacts/8821940/deal/2098144',
    commercialOwner: 'Cata · Directora Comercial',
    suggestedLeadUserId: 'u-4', // Diego Cadavid / Creative Strategy Lead
    driveFolderUrl: 'https://drive.google.com/drive/folders/1GeoTours-Plataforma-2026'
  },
  {
    id: 'hs-deal-3829105',
    dealName: 'Campaña Digital Performance Q4',
    accountName: 'Bambú BPO',
    contactName: 'Felipe Jaramillo',
    contactEmail: 'felipe@bambubpo.com',
    contactPhone: '+57 (300) 443-1289',
    dealUrl: 'https://app.hubspot.com/contacts/8821940/deal/3829105',
    commercialOwner: 'Cata · Directora Comercial',
    suggestedLeadUserId: 'u-5', // Esmeralda Duque Ramírez / Growth Manager
    driveFolderUrl: 'https://drive.google.com/drive/folders/1Bambu-Performance-Q4'
  }
];

export const NewOpportunityModal: React.FC<NewOpportunityModalProps> = ({
  isOpen,
  onClose,
  onSaveOpportunity,
  existingClients,
  initialMode = 'hubspot',
  users = initialUsers
}) => {
  const [entryMode, setEntryMode] = useState<'hubspot' | 'manual'>(initialMode);

  // Available leaders for assignment (filtered from users)
  const availableUsers = users && users.length > 0 ? users : initialUsers;
  const eligibleLeaders = availableUsers.filter(
    (u) =>
      u.accessLevel === 'leader' ||
      u.accessLevel === 'executive' ||
      u.accessLevel === 'system_admin' ||
      u.role === 'Admin' ||
      (u.jobTitle && (u.jobTitle.includes('Lead') || u.jobTitle.includes('Manager') || u.jobTitle.includes('CEO') || u.jobTitle.includes('Director'))) ||
      true // fallback to any member if list is short
  );

  // HubSpot Fetch State
  const [hubspotQuery, setHubspotQuery] = useState<string>('');
  const [isFetchingHubspot, setIsFetchingHubspot] = useState<boolean>(false);
  const [hubspotFetched, setHubspotFetched] = useState<boolean>(false);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number | null>(null);
  const [showDemoSelector, setShowDemoSelector] = useState<boolean>(true);

  // Common Fields
  const [isExistingClient, setIsExistingClient] = useState<boolean>(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [prospectName, setProspectName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  
  // Dynamic Leader Assignment (defaults to first leader or u-2)
  const defaultLeader = eligibleLeaders.find((u) => u.id === 'u-2') || eligibleLeaders[0];
  const [selectedLeadUserId, setSelectedLeadUserId] = useState<string>(defaultLeader?.id || 'u-2');
  const [commercialOwner, setCommercialOwner] = useState<string>('Cata · Directora Comercial');
  
  const [hubspotDealId, setHubspotDealId] = useState<string>('');
  const [hubspotDealUrl, setHubspotDealUrl] = useState<string>('');
  const [driveFolderUrl, setDriveFolderUrl] = useState<string>('');
  
  // SLA editable with 36h default
  const [handoffHours, setHandoffHours] = useState<number>(36);
  const [isCustomHandoff, setIsCustomHandoff] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle Fetching Deal from HubSpot (simulated / parsed fallback)
  const handleFetchFromHubspot = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hubspotQuery.trim()) return;

    setIsFetchingHubspot(true);

    setTimeout(() => {
      const queryLower = hubspotQuery.toLowerCase().trim();
      const matched = HUBSPOT_DEMO_DEALS.find(
        (d) =>
          d.id.toLowerCase().includes(queryLower) ||
          d.dealName.toLowerCase().includes(queryLower) ||
          d.accountName.toLowerCase().includes(queryLower) ||
          d.dealUrl.toLowerCase().includes(queryLower)
      );

      if (matched) {
        setProspectName(matched.accountName);
        setTitle(matched.dealName);
        setContactName(matched.contactName);
        setContactEmail(matched.contactEmail);
        setContactPhone(matched.contactPhone);
        setHubspotDealId(matched.id);
        setHubspotDealUrl(matched.dealUrl);
        setCommercialOwner(matched.commercialOwner);
        if (matched.suggestedLeadUserId) {
          setSelectedLeadUserId(matched.suggestedLeadUserId);
        }
        setDriveFolderUrl(matched.driveFolderUrl);
      } else {
        // Real-world fallback: Parse entered URL or treat string as deal ID
        let parsedId = hubspotQuery.trim();
        let parsedUrl = hubspotQuery.trim();

        if (parsedUrl.includes('deal/')) {
          const match = parsedUrl.match(/deal\/(\d+)/);
          if (match && match[1]) {
            parsedId = `hs-deal-${match[1]}`;
          }
        } else if (!parsedUrl.startsWith('http')) {
          parsedId = parsedId.startsWith('hs-deal-') ? parsedId : `hs-deal-${parsedId}`;
          parsedUrl = `https://app.hubspot.com/contacts/deal/${parsedId.replace('hs-deal-', '')}`;
        }

        setHubspotDealId(parsedId);
        setHubspotDealUrl(parsedUrl);
        // Leave title and prospect to be confirmed by user if not existing
        if (!title) {
          setTitle(`Oportunidad HubSpot #${parsedId}`);
        }
      }

      setHubspotFetched(true);
      setIsFetchingHubspot(false);
    }, 400);
  };

  const handleSelectDemoDeal = (deal: typeof HUBSPOT_DEMO_DEALS[0], index: number) => {
    setSelectedDemoIndex(index);
    setHubspotQuery(deal.dealUrl);
    setProspectName(deal.accountName);
    setTitle(deal.dealName);
    setContactName(deal.contactName);
    setContactEmail(deal.contactEmail);
    setContactPhone(deal.contactPhone);
    setHubspotDealId(deal.id);
    setHubspotDealUrl(deal.dealUrl);
    setCommercialOwner(deal.commercialOwner);
    if (deal.suggestedLeadUserId) {
      setSelectedLeadUserId(deal.suggestedLeadUserId);
    }
    setDriveFolderUrl(deal.driveFolderUrl);
    setHubspotFetched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const resolvedAccountName = isExistingClient
      ? existingClients.find((c) => c.id === selectedClientId)?.name || 'Cliente Existente'
      : prospectName.trim() || 'Nuevo Prospecto';

    const oppId = `opp-${Date.now()}`;
    const defaultQuoteId = `quote-${oppId}-v1`;

    const userEnteredDriveFolder = driveFolderUrl.trim();
    const resolvedDriveFolder = userEnteredDriveFolder || undefined;

    // Calculate SLA deadline based on editable handoff hours
    const safeHandoffHours = Math.max(1, Number(handoffHours) || 36);
    const deadlineTimestamp = new Date(Date.now() + safeHandoffHours * 3600 * 1000).toISOString();

    // Resolve assigned leader dynamically
    const assignedUser = eligibleLeaders.find((u) => u.id === selectedLeadUserId) || eligibleLeaders[0];
    const resolvedLeadUserId = assignedUser.id;
    const resolvedLeadUserName = `${assignedUser.name} · ${assignedUser.officialRole || assignedUser.jobTitle || assignedUser.professionalRole || assignedUser.role || 'Líder de Proyecto'}`;

    const initialQuote: QuoteProposal = {
      id: defaultQuoteId,
      opportunityId: oppId,
      versionLabel: 'V1 - Alcance Inicial',
      order: 1,
      status: 'draft',
      totalHoursRollup: 0,
      currency: 'COP',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliverables: [] // Blank initial deliverables - the leader chooses template vs custom in "Alcance"
    };

    const newOpp: NewBusinessOpportunity = {
      id: oppId,
      title: title.trim() || `Propuesta ${resolvedAccountName}`,
      type: isExistingClient ? 'upsell' : 'new_client',
      clientId: isExistingClient ? selectedClientId : null,
      prospectAccountName: resolvedAccountName,
      contactName: contactName.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      leadUserId: resolvedLeadUserId,
      leadUserName: resolvedLeadUserName,
      handoffHours: safeHandoffHours,
      handoffDeadline: deadlineTimestamp,
      hubspotDealId: hubspotDealId.trim() || (entryMode === 'hubspot' ? 'hs-deal-manual' : null),
      hubspotDealUrl: hubspotDealUrl.trim() || null,
      hubspotCompanyId: isExistingClient
        ? existingClients.find((c) => c.id === selectedClientId)?.hubspotCompanyId || null
        : null,
      briefUrl: resolvedDriveFolder,
      driveFolderUrl: resolvedDriveFolder,
      driveStandardFolders: resolvedDriveFolder
        ? {
            rootFolderUrl: resolvedDriveFolder,
            briefFolderUrl: `${resolvedDriveFolder}/00-brief`,
            proposalsFolderUrl: `${resolvedDriveFolder}/01-propuestas`,
            adminDocsFolderUrl: `${resolvedDriveFolder}/02-documentos-administrativos`,
            inputsFolderUrl: `${resolvedDriveFolder}/03-insumos`
          }
        : undefined,
      status: 'discovery', // Fresh handoff ready for sizing in Alcance
      quotes: [initialQuote],
      administrativeChecklist: {
        rutStatus: 'pending',
        idCardStatus: 'pending',
        billingEmail: contactEmail.trim() || '',
        alegraCreated: false,
        responsibleName: 'Vivian'
      },
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

    onSaveOpportunity(newOpp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header con tabs de origen: HubSpot vs Manual */}
        <div className="p-5 bg-gradient-to-r from-[#140b24] via-[#2a134a] to-[#501f92] text-white">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-white/10 text-[#d4ff4a]">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold tracking-tight">Nueva Oportunidad</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#d4ff4a]/20 text-[#d4ff4a]">
                    Handoff Comercial
                  </span>
                </div>
                <p className="text-xs text-white/75">
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

          {/* Mode Tabs */}
          <div className="flex items-center p-1 bg-white/10 rounded-xl backdrop-blur-xs">
            <button
              type="button"
              onClick={() => setEntryMode('hubspot')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                entryMode === 'hubspot'
                  ? 'bg-white text-[#ff5c35] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#ff5c35]" />
              <span>Traer desde HubSpot</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('manual')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                entryMode === 'manual'
                  ? 'bg-white text-[#501f92] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>+ Crear Manualmente</span>
            </button>
          </div>
        </div>

        {/* Formulario Simplificado */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* SECCIÓN 1: HUBSPOT DEAL IMPORT (Fallback Manual URL/ID con Mock Dev opcional) */}
          {entryMode === 'hubspot' && (
            <div className="p-3.5 bg-[#fff7ed] rounded-2xl border border-[#ffedd5] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#9a3412] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff5c35]" />
                  HubSpot Deal (URL o ID)
                </span>
                <span className="text-[10px] text-[#c2410c] font-medium">Source of truth comercial</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Pegar URL o ID del deal (ej. https://app.hubspot.com/... o 1049281)"
                  value={hubspotQuery}
                  onChange={(e) => setHubspotQuery(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-[#fed7aa] bg-white text-[#0f172a] text-xs focus:ring-2 focus:ring-[#ff5c35] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleFetchFromHubspot()}
                  disabled={isFetchingHubspot || !hubspotQuery.trim()}
                  className="px-3.5 py-2.5 rounded-xl bg-[#ff5c35] hover:bg-[#e0441e] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1"
                >
                  {isFetchingHubspot ? (
                    <span>Obteniendo...</span>
                  ) : (
                    <>
                      <span>Vincular</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Selector de deals simulados (Exclusivo Mock / Dev) */}
              <div className="pt-1 border-t border-[#fed7aa]/60">
                <div className="flex items-center justify-between py-1">
                  <span className="text-[10px] font-bold text-[#9a3412] flex items-center gap-1">
                    <Code2 className="w-3 h-3 text-[#ff5c35]" />
                    <span>Selector de prueba (Mock Dev):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDemoSelector(!showDemoSelector)}
                    className="text-[10px] text-[#c2410c] hover:underline cursor-pointer"
                  >
                    {showDemoSelector ? 'Ocultar demos' : 'Mostrar deals de prueba'}
                  </button>
                </div>

                {showDemoSelector && (
                  <div className="space-y-1 mt-1">
                    <span className="text-[9.5px] text-[#7c2d12] block">
                      En producción la vinculación es por URL/ID real de HubSpot. En este prototipo puedes usar estos deals de muestra:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-0.5">
                      {HUBSPOT_DEMO_DEALS.map((deal, idx) => (
                        <button
                          key={deal.id}
                          type="button"
                          onClick={() => handleSelectDemoDeal(deal, idx)}
                          className={`p-2 rounded-xl border text-left transition-colors cursor-pointer text-[11px] ${
                            selectedDemoIndex === idx
                              ? 'bg-white border-[#ff5c35] text-[#9a3412] shadow-xs'
                              : 'bg-white/70 hover:bg-white border-[#fed7aa] text-[#475569]'
                          }`}
                        >
                          <p className="font-bold truncate">{deal.accountName}</p>
                          <p className="text-[10px] text-[#64748b] truncate">{deal.dealName}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {hubspotFetched && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#047857] font-semibold bg-[#ecfdf5] p-2 rounded-xl border border-[#a7f3d0]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                  <span>Datos de HubSpot vinculados exitosamente ({hubspotDealId})</span>
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN 2: CUENTA & OPORTUNIDAD */}
          {entryMode === 'manual' && (
            <div className="p-3 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] space-y-2">
              <span className="font-bold text-[#0f172a] block">Tipo de Cuenta:</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#475569]">
                  <input
                    type="radio"
                    name="clientMode"
                    checked={!isExistingClient}
                    onChange={() => setIsExistingClient(false)}
                    className="text-[#501f92] focus:ring-[#501f92]"
                  />
                  <span>Nuevo Prospecto (sin NIT todavía)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#475569]">
                  <input
                    type="radio"
                    name="clientMode"
                    checked={isExistingClient}
                    onChange={() => setIsExistingClient(true)}
                    className="text-[#501f92] focus:ring-[#501f92]"
                  />
                  <span>Cliente Operativo Existente</span>
                </label>
              </div>
            </div>
          )}

          {/* Cuenta */}
          {entryMode === 'manual' && isExistingClient ? (
            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Selecciona el Cliente Existente: <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] bg-white text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              >
                <option value="">-- Elige un cliente existente --</option>
                {existingClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Empresa o Cuenta: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ej. Danone S.A., GeoTours, BrandCo..."
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              />
            </div>
          )}

          {/* Oportunidad */}
          <div className="space-y-1">
            <label className="font-bold text-[#475569] block">
              Nombre de la Oportunidad / Requerimiento: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ej. Rediseño ecommerce Bonafont..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
            />
          </div>

          {/* Contacto Principal (Nombre & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">Contacto Principal:</label>
              <input
                type="text"
                placeholder="ej. Carlos Mendoza"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">Email de Contacto:</label>
              <input
                type="email"
                placeholder="carlos@empresa.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              />
            </div>
          </div>

          {/* SECCIÓN 3: ASIGNACIÓN DINÁMICA DE LÍDER & SLA EDITABLE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Líder Asignado para Scoping: <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedLeadUserId}
                onChange={(e) => setSelectedLeadUserId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-bold bg-white focus:ring-2 focus:ring-[#501f92]"
              >
                {eligibleLeaders.map((leader) => (
                  <option key={leader.id} value={leader.id}>
                    {leader.name} ({leader.officialRole || leader.jobTitle || leader.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#475569] block">Deadline de Handoff (SLA):</label>
                <span className="text-[10px] text-[#501f92] font-semibold">Predeterminado 36h</span>
              </div>
              
              {!isCustomHandoff ? (
                <div className="flex gap-1.5">
                  <select
                    value={handoffHours}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomHandoff(true);
                      } else {
                        setHandoffHours(Number(e.target.value));
                      }
                    }}
                    className="flex-1 p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium bg-white focus:ring-2 focus:ring-[#501f92]"
                  >
                    <option value={24}>24 horas (urgente)</option>
                    <option value={36}>36 horas (estándar Uhura)</option>
                    <option value={48}>48 horas</option>
                    <option value={72}>72 horas (complejo)</option>
                    <option value="custom">✏️ Personalizado en horas...</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={handoffHours}
                    onChange={(e) => setHandoffHours(Math.max(1, Number(e.target.value)))}
                    className="flex-1 p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-bold bg-white focus:ring-2 focus:ring-[#501f92]"
                    placeholder="ej. 36"
                  />
                  <span className="text-xs text-[#64748b] font-medium">horas</span>
                  <button
                    type="button"
                    onClick={() => setIsCustomHandoff(false)}
                    className="text-[11px] text-[#501f92] font-bold hover:underline cursor-pointer"
                  >
                    Presets
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 4: GOOGLE DRIVE (SIMPLIFICADO A UN SOLO CAMPO LIMPIO) */}
          <div className="p-3.5 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] space-y-1.5">
            <label className="font-bold text-[#0f172a] flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-[#501f92]" />
              <span>Carpeta Google Drive:</span>
            </label>
            <input
              type="text"
              placeholder="https://drive.google.com/drive/folders/..."
              value={driveFolderUrl}
              onChange={(e) => setDriveFolderUrl(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92] bg-white"
            />
            <p className="text-[10px] text-[#64748b]">
              Brief, propuesta y documentos relacionados. Repositorio documental oficial del prospecto.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
            <div className="text-[11px] text-[#64748b]">
              El líder decidirá si usar plantilla o hacer a medida al abrir <strong>Alcance</strong>.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#3b156b] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
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
