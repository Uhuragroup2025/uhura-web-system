import React, { useState } from 'react';
import { NewBusinessOpportunity, OpportunityType, ClientProfile, ProductBacklogTemplate, QuoteDeliverable, QuoteBacklogItem } from '../types';
import { Target, X, Building2, User, Mail, Phone, Calendar, FileText, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import { computeRoleBudgetsFromActivities, computeTotalHoursFromRoleBudgets } from '../templates/templateEngine';

interface NewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOpportunity: (newOpp: NewBusinessOpportunity) => void;
  existingClients: ClientProfile[];
  templates?: ProductBacklogTemplate[];
}

export const NewOpportunityModal: React.FC<NewOpportunityModalProps> = ({
  isOpen,
  onClose,
  onSaveOpportunity,
  existingClients,
  templates = []
}) => {
  const [isExistingClient, setIsExistingClient] = useState<boolean>(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [prospectName, setProspectName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<OpportunityType>('new_client');
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [leadUserName, setLeadUserName] = useState<string>('Product Lead');
  const [hubspotDealId, setHubspotDealId] = useState<string>('');
  const [hubspotDealUrl, setHubspotDealUrl] = useState<string>('');
  const [briefUrl, setBriefUrl] = useState<string>('');
  const [driveFolderUrl, setDriveFolderUrl] = useState<string>('');
  const [briefSummary, setBriefSummary] = useState<string>('');
  const [discoveryNotes, setDiscoveryNotes] = useState<string>('');
  const [targetKickoffDate, setTargetKickoffDate] = useState<string>('');
  const [scopeOrigin, setScopeOrigin] = useState<'empty' | 'template'>('empty');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const resolvedAccountName = isExistingClient
      ? existingClients.find((c) => c.id === selectedClientId)?.name || 'Cliente Existente'
      : prospectName.trim() || 'Nuevo Prospecto';

    const oppId = `opp-${Date.now()}`;
    const defaultQuoteId = `quote-${oppId}-v1`;

    let initialDeliverables: QuoteDeliverable[] = [];
    let initialTotalHours = 0;

    // Si el usuario eligió partir de una plantilla oficial, cargamos sus entregables y actividades
    if (scopeOrigin === 'template' && selectedTemplateId) {
      const tpl = templates.find((t) => t.id === selectedTemplateId);
      if (tpl) {
        initialDeliverables = tpl.deliverables.map((td, dIdx) => {
          const delId = `qdel-${oppId}-${dIdx + 1}`;
          const backlogItems: QuoteBacklogItem[] = td.activities.map((act, aIdx) => ({
            id: `act-${oppId}-${dIdx + 1}-${aIdx + 1}`,
            quoteDeliverableId: delId,
            title: act.title,
            description: act.description,
            roleId: act.roleName,
            roleName: act.roleName,
            estimatedHours: act.estimatedHours,
            order: aIdx + 1
          }));

          const roleBudgets = computeRoleBudgetsFromActivities(
            backlogItems.map((b) => ({
              roleId: b.roleName,
              roleName: b.roleName,
              estimatedHours: b.estimatedHours
            }))
          ).map((rb, rIdx) => ({
            id: `qrb-${delId}-${rIdx}`,
            quoteDeliverableId: delId,
            roleId: rb.roleId,
            roleName: rb.roleName,
            quotedHours: rb.quotedHours
          }));

          const delTotalHours = computeTotalHoursFromRoleBudgets(roleBudgets);

          return {
            id: delId,
            quoteId: defaultQuoteId,
            name: td.name,
            description: td.description,
            order: dIdx + 1,
            roleBudgets,
            backlogItems,
            totalHoursRollup: delTotalHours
          };
        });

        const allActivities = initialDeliverables.flatMap((d) => d.backlogItems);
        const globalBudgets = computeRoleBudgetsFromActivities(
          allActivities.map((b) => ({
            roleId: b.roleName,
            roleName: b.roleName,
            estimatedHours: b.estimatedHours
          }))
        );
        initialTotalHours = computeTotalHoursFromRoleBudgets(globalBudgets);
      }
    }

    const userEnteredDriveFolder = driveFolderUrl.trim();
    const resolvedDriveFolder = userEnteredDriveFolder || undefined;

    const newOpp: NewBusinessOpportunity = {
      id: oppId,
      title: title.trim() || `Propuesta ${resolvedAccountName}`,
      type: isExistingClient ? 'upsell' : type,
      clientId: isExistingClient ? selectedClientId : null,
      prospectAccountName: resolvedAccountName,
      contactName: contactName.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      leadUserId: 'usr-paola',
      leadUserName: leadUserName.trim() || 'Product Lead',
      hubspotDealId: hubspotDealId.trim() || null,
      hubspotDealUrl: hubspotDealUrl.trim() || null,
      hubspotCompanyId: isExistingClient ? (existingClients.find(c => c.id === selectedClientId)?.hubspotCompanyId || null) : null,
      briefSummary: briefSummary.trim() || undefined,
      briefUrl: briefUrl.trim() || undefined,
      discoveryNotes: discoveryNotes.trim() || undefined,
      targetKickoffDate: targetKickoffDate || undefined,
      status: 'quoting',
      driveFolderUrl: resolvedDriveFolder,
      driveStandardFolders: resolvedDriveFolder ? {
        rootFolderUrl: resolvedDriveFolder,
        briefFolderUrl: `${resolvedDriveFolder}/00-brief`,
        proposalsFolderUrl: `${resolvedDriveFolder}/01-propuestas`,
        adminDocsFolderUrl: `${resolvedDriveFolder}/02-documentos-administrativos`,
        inputsFolderUrl: `${resolvedDriveFolder}/03-insumos`
      } : undefined,
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
      updatedAt: new Date().toISOString(),
      quotes: [
        {
          id: defaultQuoteId,
          opportunityId: oppId,
          versionLabel: 'V1 - Alcance Inicial',
          order: 1,
          status: 'draft',
          totalHoursRollup: initialTotalHours,
          currency: 'COP',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deliverables: initialDeliverables
        }
      ]
    };

    onSaveOpportunity(newOpp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-[#1e113a] to-[#501f92] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/15 text-[#d4ff4a]">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Crear desde Brief</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#d4ff4a]/20 text-[#d4ff4a]">
                  New Business
                </span>
              </div>
              <p className="text-xs text-white/80">
                Inicia el dimensionamiento técnico y scoping recibido de Comercial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Client Destination Toggle */}
          <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-2">
            <span className="font-bold text-[#0f172a] block">
              Tipo de Cuenta:
            </span>
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

          {/* Account Selector / Input */}
          {isExistingClient ? (
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
                Nombre de la Empresa o Prospecto: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ej. GeoTours, BrandCo, Startup..."
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              />
              <p className="text-[10px] text-[#64748b]">
                No necesitas NIT en esta fase; Vivian lo completará cuando el cliente apruebe la cotización.
              </p>
            </div>
          )}

          {/* Opportunity Title */}
          <div className="space-y-1">
            <label className="font-bold text-[#475569] block">
              Título del Requerimiento / Scoping: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ej. Rediseño Portal Web & Motor de Reservas..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
            />
          </div>

          {/* Grid: Lead & Hubspot Deal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Líder Asignado para Scoping:
              </label>
              <select
                value={leadUserName}
                onChange={(e) => setLeadUserName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium bg-white focus:ring-2 focus:ring-[#501f92]"
              >
                <option value="Product Lead">Product Lead</option>
                <option value="Growth Manager">Growth Manager</option>
                <option value="CEO">CEO</option>
                <option value="Creative Lead">Creative Lead</option>
                <option value="Directora Comercial">Directora Comercial</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Deal de HubSpot (Link o ID opcional):
              </label>
              <input
                type="text"
                value={hubspotDealUrl}
                onChange={(e) => setHubspotDealUrl(e.target.value)}
                placeholder="ej. https://app.hubspot.com/contacts/... o ID"
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              />
            </div>
          </div>

          {/* Documentos & Drive Referencias */}
          <div className="p-3.5 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-2.5">
            <span className="font-bold text-[#0f172a] block">
              Documentos & Repositorio de Google Drive:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#475569] block">
                  Link al Brief del Cliente:
                </label>
                <input
                  type="text"
                  value={briefUrl}
                  onChange={(e) => setBriefUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/..."
                  className="w-full p-2 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#475569] block">
                  Carpeta Drive del Prospecto:
                </label>
                <input
                  type="text"
                  value={driveFolderUrl}
                  onChange={(e) => setDriveFolderUrl(e.target.value)}
                  placeholder="ej. PROSPECTOS / NOMBRE_EMPRESA"
                  className="w-full p-2 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
                />
              </div>
            </div>
            <p className="text-[10px] text-[#64748b]">
              Uhura organiza automáticamente las referencias a las 4 carpetas estándar: <code>00. BRIEF</code>, <code>01. PROPUESTAS</code>, <code>02. DOC ADMINISTRATIVOS</code> y <code>03. INSUMOS</code>.
            </p>
          </div>

          {/* Grid: Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Nombre Contacto:
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="ej. Carlos Mendoza"
                className="w-full p-2 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Email de Contacto:
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="carlos@empresa.com"
                className="w-full p-2 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Teléfono / WhatsApp:
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+57 311 000 0000"
                className="w-full p-2 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              />
            </div>
          </div>

          {/* Scope Origin / Catálogo de Servicios */}
          <div className="p-3.5 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-2.5">
            <span className="font-bold text-[#0f172a] block">
              Punto de Partida del Scoping:
            </span>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#475569]">
                <input
                  type="radio"
                  name="scopeOrigin"
                  checked={scopeOrigin === 'empty'}
                  onChange={() => {
                    setScopeOrigin('empty');
                    setSelectedTemplateId('');
                  }}
                  className="text-[#501f92] focus:ring-[#501f92]"
                />
                <span>En blanco (scoping personalizado desde cero)</span>
              </label>

              {templates.length > 0 && (
                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#475569]">
                  <input
                    type="radio"
                    name="scopeOrigin"
                    checked={scopeOrigin === 'template'}
                    onChange={() => {
                      setScopeOrigin('template');
                      if (!selectedTemplateId && templates[0]) {
                        setSelectedTemplateId(templates[0].id);
                      }
                    }}
                    className="text-[#501f92] focus:ring-[#501f92]"
                  />
                  <span>Importar desde Catálogo de Servicios</span>
                </label>
              )}
            </div>

            {scopeOrigin === 'template' && (
              <div className="pt-2 border-t border-[#e2e8f0] space-y-1">
                <label className="font-bold text-[#475569] block">
                  Selecciona el Servicio del Catálogo:
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] bg-white text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.deliverables.length} entregables base)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Discovery / Brief Notes */}
          <div className="space-y-1">
            <label className="font-bold text-[#475569] block">
              Resumen del Brief / Requerimientos Clave:
            </label>
            <textarea
              rows={3}
              value={briefSummary}
              onChange={(e) => setBriefSummary(e.target.value)}
              placeholder="Objetivos principales entregados por comercial, alcance preliminar, expectativas de fecha de salida..."
              className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
            />
          </div>

          {/* Kickoff target */}
          <div className="space-y-1">
            <label className="font-bold text-[#475569] block">
              Fecha Tentativa de Inicio (Kick-off):
            </label>
            <input
              type="date"
              value={targetKickoffDate}
              onChange={(e) => setTargetKickoffDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
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
              <span>Crear y Comenzar Scoping</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

