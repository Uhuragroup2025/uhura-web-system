import React, { useState } from 'react';
import { NewBusinessOpportunity, OpportunityType, ClientProfile } from '../types';
import { Target, X, Building2, User, Mail, Phone, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface NewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOpportunity: (newOpp: NewBusinessOpportunity) => void;
  existingClients: ClientProfile[];
}

export const NewOpportunityModal: React.FC<NewOpportunityModalProps> = ({
  isOpen,
  onClose,
  onSaveOpportunity,
  existingClients
}) => {
  const [isExistingClient, setIsExistingClient] = useState<boolean>(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [prospectName, setProspectName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<OpportunityType>('new_client');
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [leadUserName, setLeadUserName] = useState<string>('Paola (Lead PM)');
  const [hubspotDealId, setHubspotDealId] = useState<string>('');
  const [briefSummary, setBriefSummary] = useState<string>('');
  const [discoveryNotes, setDiscoveryNotes] = useState<string>('');
  const [targetKickoffDate, setTargetKickoffDate] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const resolvedAccountName = isExistingClient
      ? existingClients.find((c) => c.id === selectedClientId)?.name || 'Cliente Existente'
      : prospectName.trim() || 'Nuevo Prospecto';

    const oppId = `opp-${Date.now()}`;
    const defaultQuoteId = `quote-${oppId}-v1`;

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
      leadUserName: leadUserName.trim() || 'Paola (Lead PM)',
      hubspotDealId: hubspotDealId.trim() || null,
      briefSummary: briefSummary.trim() || undefined,
      discoveryNotes: discoveryNotes.trim() || undefined,
      targetKickoffDate: targetKickoffDate || undefined,
      status: 'quoting',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quotes: [
        {
          id: defaultQuoteId,
          opportunityId: oppId,
          versionLabel: 'V1 - Alcance Inicial',
          order: 1,
          status: 'draft',
          totalHoursRollup: 32,
          currency: 'COP',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deliverables: [
            {
              id: `qdel-${Date.now()}-1`,
              quoteId: defaultQuoteId,
              name: '1. Frente de Implementación Principal',
              description: 'Actividades técnicas prioritarias del proyecto',
              order: 1,
              roleBudgets: [
                {
                  id: `qrb-${Date.now()}-1`,
                  quoteDeliverableId: `qdel-${Date.now()}-1`,
                  roleId: 'Desarrollador Web Front-End',
                  roleName: 'Desarrollador Web Front-End',
                  quotedHours: 24
                },
                {
                  id: `qrb-${Date.now()}-2`,
                  quoteDeliverableId: `qdel-${Date.now()}-1`,
                  roleId: 'Product Lead',
                  roleName: 'Product Lead',
                  quotedHours: 8
                }
              ],
              backlogItems: [
                {
                  id: `act-${Date.now()}-1`,
                  quoteDeliverableId: `qdel-${Date.now()}-1`,
                  title: 'Definición de Arquitectura & Alcance',
                  roleId: 'Product Lead',
                  roleName: 'Product Lead',
                  estimatedHours: 8,
                  order: 1
                },
                {
                  id: `act-${Date.now()}-2`,
                  quoteDeliverableId: `qdel-${Date.now()}-1`,
                  title: 'Desarrollo de Funcionalidades Core',
                  roleId: 'Desarrollador Web Front-End',
                  roleName: 'Desarrollador Web Front-End',
                  estimatedHours: 24,
                  order: 2
                }
              ],
              totalHoursRollup: 32
            }
          ]
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
        <div className="p-5 bg-[#501f92] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/15 text-white">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold">Nueva Oportunidad / Brief</h3>
              <p className="text-xs text-white/80">
                Paso 1: Registra la oportunidad para comenzar el scoping técnico del backlog
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
                placeholder="ej. Empresa Cliente, Nueva Startup..."
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              />
              <p className="text-[10px] text-[#64748b]">
                No necesitas NIT en esta fase; se completará cuando el cliente apruebe la cotización.
              </p>
            </div>
          )}

          {/* Opportunity Title */}
          <div className="space-y-1">
            <label className="font-bold text-[#475569] block">
              Título Comercial de la Oportunidad: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ej. Nueva Plataforma Web Turística, Módulo E-commerce B2B..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
            />
          </div>

          {/* Grid: Lead & Hubspot Deal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                Líder de la Propuesta:
              </label>
              <input
                type="text"
                value={leadUserName}
                onChange={(e) => setLeadUserName(e.target.value)}
                placeholder="ej. Paola (Lead PM), Oscar..."
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#475569] block">
                ID Oportunidad HubSpot (opcional):
              </label>
              <input
                type="text"
                value={hubspotDealId}
                onChange={(e) => setHubspotDealId(e.target.value)}
                placeholder="ej. HUB-GEO-2026-99"
                className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92]"
              />
            </div>
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
                Teléfono:
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

          {/* Brief Summary */}
          <div className="space-y-1">
            <label className="font-bold text-[#475569] block">
              Resumen del Brief / Qué pide el cliente:
            </label>
            <textarea
              rows={3}
              value={briefSummary}
              onChange={(e) => setBriefSummary(e.target.value)}
              placeholder="Describe los objetivos clave, requerimientos funcionales o problemas a resolver..."
              className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-[#0f172a] font-medium focus:ring-2 focus:ring-[#501f92] resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#64748b] hover:text-[#0f172a]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3d1572] rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Crear y Comenzar Scoping
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
