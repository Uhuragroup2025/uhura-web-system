import React, { useState, useEffect } from 'react';
import { ClientProfile, ClientTaxEntity, ClientContact, ClientContactRole, ClientStatus } from './types';
import { X, Building2, User, Mail, Phone, Plus, Trash2, Star, ShieldCheck, Check, AlertCircle, FileText, Globe } from 'lucide-react';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfile | null;
  onSaveClient: (updatedClient: ClientProfile) => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  onClose,
  client,
  onSaveClient
}) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [accountManagerName, setAccountManagerName] = useState('');
  const [notes, setNotes] = useState('');
  const [portalActive, setPortalActive] = useState(true);
  const [receivableStatus, setReceivableStatus] = useState('al día');
  const [brandsInput, setBrandsInput] = useState('');

  // Tax entities
  const [taxEntities, setTaxEntities] = useState<ClientTaxEntity[]>([]);

  // Contacts
  const [contacts, setContacts] = useState<ClientContact[]>([]);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setStatus(client.status || 'active');
      setAccountManagerName(client.accountManagerName || '');
      setNotes(client.notes || '');
      setPortalActive(Boolean(client.portalActive));
      setReceivableStatus(client.receivableStatus || 'al día');
      setBrandsInput(client.commercialInfo?.brands?.join(', ') || '');
      
      // Si el cliente no tenía taxEntities explícitos pero tenía NIT, crear uno base
      if (client.taxEntities && client.taxEntities.length > 0) {
        setTaxEntities(client.taxEntities);
      } else if (client.nit && client.nit !== 'Sin NIT registrado') {
        setTaxEntities([
          {
            id: `tax-init-${client.id}`,
            nit: client.nit,
            businessName: client.name,
            isPrimary: true
          }
        ]);
      } else {
        setTaxEntities([]);
      }

      // Si el cliente no tenía contacts explícitos pero tenía commercialInfo
      if (client.contacts && client.contacts.length > 0) {
        setContacts(client.contacts);
      } else if (client.commercialInfo?.contactName) {
        setContacts([
          {
            id: `con-init-${client.id}`,
            name: client.commercialInfo.contactName,
            roleTitle: client.commercialInfo.contactRole,
            email: client.commercialInfo.contactEmail || '',
            phone: client.commercialInfo.contactPhone || '',
            contactType: 'comercial',
            isPrimary: true
          }
        ]);
      } else {
        setContacts([]);
      }
    }
  }, [client]);

  if (!isOpen || !client) return null;

  // Handlers Tax Entities
  const handleAddTaxEntity = () => {
    const hasPrimary = taxEntities.some((t) => t.isPrimary);
    setTaxEntities([
      ...taxEntities,
      {
        id: `tax-edit-${Date.now()}-${taxEntities.length}`,
        nit: '',
        businessName: '',
        city: '',
        isPrimary: !hasPrimary,
        alegraContactId: '',
        notes: ''
      }
    ]);
  };

  const handleRemoveTaxEntity = (id: string) => {
    // Regla de consistencia: Si se elimina el principal, NO reasignar automáticamente otro
    setTaxEntities((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTogglePrimaryTax = (id: string) => {
    // Regla de consistencia: Máximo un elemento con isPrimary = true. Si se desmarca, se tolera ninguno.
    setTaxEntities((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, isPrimary: !item.isPrimary };
        }
        return item.isPrimary ? { ...item, isPrimary: false } : item;
      })
    );
  };

  const handleUpdateTaxEntity = (id: string, field: keyof ClientTaxEntity, value: any) => {
    setTaxEntities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Handlers Contacts
  const handleAddContact = () => {
    const hasPrimary = contacts.some((c) => c.isPrimary);
    setContacts([
      ...contacts,
      {
        id: `con-edit-${Date.now()}-${contacts.length}`,
        name: '',
        roleTitle: '',
        email: '',
        phone: '',
        contactType: 'operativo',
        isPrimary: !hasPrimary
      }
    ]);
  };

  const handleRemoveContact = (id: string) => {
    // Regla de consistencia: Si se elimina el principal, NO reasignar automáticamente otro
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleTogglePrimaryContact = (id: string) => {
    // Regla de consistencia: Máximo un elemento con isPrimary = true. Si se desmarca, se tolera ninguno.
    setContacts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, isPrimary: !item.isPrimary };
        }
        return item.isPrimary ? { ...item, isPrimary: false } : item;
      })
    );
  };

  const handleUpdateContact = (id: string, field: keyof ClientContact, value: any) => {
    setContacts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Regla protegida: UHURA_INTERNAL_CLIENT no se puede archivar ni cambiar de interno
    const isUhuraInternal = client.isInternal || client.id === 'cli-uhura-internal';
    const finalStatus: ClientStatus = isUhuraInternal ? 'active' : status;

    const brands = brandsInput
      .split(',')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const primaryTax = taxEntities.find((t) => t.isPrimary) || taxEntities[0];
    const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];

    const updated: ClientProfile = {
      ...client,
      name: name.trim(),
      status: finalStatus,
      accountManagerName: accountManagerName.trim() || undefined,
      notes: notes.trim() || undefined,
      portalActive,
      receivableStatus,
      taxEntities,
      contacts,
      // Actualizar campos derivados y de compatibilidad
      nit: primaryTax ? primaryTax.nit : 'Sin NIT registrado',
      commercialInfo: {
        contactName: primaryContact ? primaryContact.name : (client.commercialInfo?.contactName || 'Por asignar'),
        contactRole: primaryContact?.roleTitle || client.commercialInfo?.contactRole || 'Contacto',
        contactEmail: primaryContact?.email || client.commercialInfo?.contactEmail || '',
        contactPhone: primaryContact?.phone || client.commercialInfo?.contactPhone || '',
        clientSince: client.commercialInfo?.clientSince || 'Hoy',
        brands: brands.length > 0 ? brands : (client.commercialInfo?.brands || [name.trim()]),
        tier: client.commercialInfo?.tier
      }
    };

    onSaveClient(updated);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#e2e8f0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f2ecfb] text-[#501f92] flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#0f172a]">Editar Cuenta de Cliente</h2>
              <p className="text-xs text-[#64748b]">
                {client.name} {client.isInternal && '• Cliente Interno Uhura Group'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* 1. Datos Principales de Cuenta */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-[#501f92] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>1. Marca Sombrilla / Cuenta Operativa</span>
              </h3>
              {client.isInternal && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#f2ecfb] text-[#501f92] border border-[#8a4dff]/20">
                  Cuenta Interna Protegida
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#334155] mb-1">
                  Nombre Comercial / Marca Sombrilla *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  disabled={client.isInternal}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-semibold focus:outline-none focus:border-[#501f92] focus:bg-white disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#334155] mb-1">Estado de Operación</label>
                <select
                  value={status}
                  disabled={client.isInternal}
                  onChange={(e) => setStatus(e.target.value as ClientStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-semibold focus:outline-none focus:border-[#501f92] cursor-pointer disabled:opacity-60"
                >
                  <option value="active">🟢 Activo (Operación vigente)</option>
                  <option value="paused">🟡 Pausado (Detenido temporalmente)</option>
                  <option value="archived">⚪ Archivado (Histórico)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#334155] mb-1">Account Manager (Uhura)</label>
                <input
                  type="text"
                  value={accountManagerName}
                  onChange={(e) => setAccountManagerName(e.target.value)}
                  placeholder="Ej: Catalina Tejada, Laura Salazar"
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#334155] mb-1">Portal de Cliente</label>
                <button
                  type="button"
                  onClick={() => setPortalActive(!portalActive)}
                  className={`w-full py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    portalActive
                      ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                      : 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{portalActive ? 'Portal Activo' : 'Portal Inactivo'}</span>
                </button>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-[#334155] mb-1">Marcas Asociadas (separadas por comas)</label>
                <input
                  type="text"
                  value={brandsInput}
                  onChange={(e) => setBrandsInput(e.target.value)}
                  placeholder="Ej: Marca Principal, Línea B2B, Marca Retail"
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-[#334155] mb-1">Notas de la Cuenta / Observaciones</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones de relación, expectativas del cliente o contexto comercial..."
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* 2. Razones Sociales (Multi-NIT) */}
          <div className="space-y-3 pt-3 border-t border-[#f1f5f9]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#501f92] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>2. Razones Sociales / Facturación ({taxEntities.length})</span>
                </h3>
                <p className="text-[11px] text-[#64748b]">
                  Máximo una principal. Si no se marca ninguna, el sistema lo tolera sin error.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddTaxEntity}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f2ecfb] text-[#501f92] hover:bg-[#501f92] hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar razón social</span>
              </button>
            </div>

            {taxEntities.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-center text-[#64748b]">
                <p className="font-medium">No hay razones sociales registradas.</p>
                <p className="text-[11px]">La cuenta opera sin NIT hasta que se agregue una entidad fiscal.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {taxEntities.map((tax, idx) => (
                  <div
                    key={tax.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      tax.isPrimary
                        ? 'bg-[#faf5ff] border-[#8a4dff]/40 shadow-xs'
                        : 'bg-[#f8fafc] border-[#e2e8f0]'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e2e8f0]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePrimaryTax(tax.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                            tax.isPrimary
                              ? 'bg-[#501f92] text-white'
                              : 'bg-white text-[#64748b] border border-[#cbd5e1] hover:text-[#501f92]'
                          }`}
                          title="Máximo un NIT principal"
                        >
                          <Star className={`w-3 h-3 ${tax.isPrimary ? 'fill-current' : ''}`} />
                          <span>{tax.isPrimary ? 'Razón Social Principal' : 'Hacer Principal'}</span>
                        </button>
                        <span className="text-[11px] text-[#64748b]">Entidad #{idx + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTaxEntity(tax.id)}
                        className="p-1 rounded-md text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#fee2e2] transition-colors cursor-pointer"
                        title="Eliminar razón social (no reasigna automáticamente)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">NIT / ID Fiscal</label>
                        <input
                          type="text"
                          value={tax.nit}
                          onChange={(e) => handleUpdateTaxEntity(tax.id, 'nit', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] font-mono text-xs focus:outline-none focus:border-[#501f92]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">Razón Social Legal</label>
                        <input
                          type="text"
                          value={tax.businessName}
                          onChange={(e) => handleUpdateTaxEntity(tax.id, 'businessName', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] font-semibold text-xs focus:outline-none focus:border-[#501f92]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">Ciudad</label>
                        <input
                          type="text"
                          value={tax.city || ''}
                          onChange={(e) => handleUpdateTaxEntity(tax.id, 'city', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">ID Alegra / Notas Facturación</label>
                        <input
                          type="text"
                          value={tax.alegraContactId || ''}
                          onChange={(e) => handleUpdateTaxEntity(tax.id, 'alegraContactId', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] font-mono text-xs focus:outline-none focus:border-[#501f92]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Directorio de Contactos (Multi-contacto) */}
          <div className="space-y-3 pt-3 border-t border-[#f1f5f9]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#501f92] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>3. Directorio de Contactos ({contacts.length})</span>
                </h3>
                <p className="text-[11px] text-[#64748b]">
                  Roles: operativo, comercial, facturación o directivo.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddContact}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f2ecfb] text-[#501f92] hover:bg-[#501f92] hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar contacto</span>
              </button>
            </div>

            <div className="space-y-3">
              {contacts.map((contact, idx) => (
                <div
                  key={contact.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    contact.isPrimary
                      ? 'bg-[#faf5ff] border-[#8a4dff]/40 shadow-xs'
                      : 'bg-[#f8fafc] border-[#e2e8f0]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e2e8f0]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePrimaryContact(contact.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                          contact.isPrimary
                            ? 'bg-[#501f92] text-white'
                            : 'bg-white text-[#64748b] border border-[#cbd5e1] hover:text-[#501f92]'
                        }`}
                        title="Máximo un contacto principal"
                      >
                        <Star className={`w-3 h-3 ${contact.isPrimary ? 'fill-current' : ''}`} />
                        <span>{contact.isPrimary ? 'Contacto Principal' : 'Hacer Principal'}</span>
                      </button>
                      <span className="text-[11px] text-[#64748b]">Contacto #{idx + 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(contact.id)}
                      className="p-1 rounded-md text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#fee2e2] transition-colors cursor-pointer"
                      title="Eliminar contacto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">Nombre Completo</label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleUpdateContact(contact.id, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] font-semibold text-xs focus:outline-none focus:border-[#501f92]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">Cargo / Rol</label>
                      <input
                        type="text"
                        value={contact.roleTitle || ''}
                        onChange={(e) => handleUpdateContact(contact.id, 'roleTitle', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">Tipo de Contacto</label>
                      <select
                        value={contact.contactType}
                        onChange={(e) => handleUpdateContact(contact.id, 'contactType', e.target.value as ClientContactRole)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] font-semibold text-xs focus:outline-none focus:border-[#501f92] cursor-pointer"
                      >
                        <option value="operativo">Operativo</option>
                        <option value="comercial">Comercial</option>
                        <option value="facturacion">Facturación / Pagos</option>
                        <option value="directivo">Directivo / Sponsor</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">Correo Electrónico</label>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => handleUpdateContact(contact.id, 'email', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">Teléfono</label>
                      <input
                        type="text"
                        value={contact.phone || ''}
                        onChange={(e) => handleUpdateContact(contact.id, 'phone', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] font-mono text-xs focus:outline-none focus:border-[#501f92]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#f1f5f9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#64748b] font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] disabled:opacity-50 text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
