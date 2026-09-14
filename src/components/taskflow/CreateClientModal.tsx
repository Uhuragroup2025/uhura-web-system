import React, { useState } from 'react';
import { ClientProfile, ClientTaxEntity, ClientContact, ClientContactRole, ClientStatus } from './types';
import { X, Building2, User, Mail, Phone, Plus, Trash2, Star, ShieldCheck, Check, AlertCircle, FileText, Globe } from 'lucide-react';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateClient: (newClient: ClientProfile) => void;
}

export const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
  onClose,
  onCreateClient
}) => {
  // 1. Marca Sombrilla / Cuenta
  const [name, setName] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [accountManagerName, setAccountManagerName] = useState('Laura Salazar');
  const [notes, setNotes] = useState('');

  // 2. Razones Sociales (taxEntities) - Inicialmente vacías o con 1 opcional
  const [taxEntities, setTaxEntities] = useState<Array<Omit<ClientTaxEntity, 'id'>>>([
    {
      nit: '',
      businessName: '',
      city: '',
      isPrimary: true,
      alegraContactId: '',
      notes: ''
    }
  ]);

  // 3. Contactos
  const [contacts, setContacts] = useState<Array<Omit<ClientContact, 'id'>>>([
    {
      name: '',
      roleTitle: '',
      email: '',
      phone: '',
      contactType: 'operativo',
      isPrimary: true
    }
  ]);

  // Portal
  const [portalActive, setPortalActive] = useState(true);

  if (!isOpen) return null;

  // Handlers para taxEntities
  const handleAddTaxEntity = () => {
    // Si ya existe alguna con isPrimary, la nueva es false
    const hasPrimary = taxEntities.some((t) => t.isPrimary);
    setTaxEntities([
      ...taxEntities,
      {
        nit: '',
        businessName: '',
        city: '',
        isPrimary: !hasPrimary,
        alegraContactId: '',
        notes: ''
      }
    ]);
  };

  const handleRemoveTaxEntity = (index: number) => {
    // Regla de consistencia: Si se elimina el principal, NO reasignar automáticamente otro
    setTaxEntities(taxEntities.filter((_, idx) => idx !== index));
  };

  const handleTogglePrimaryTax = (index: number) => {
    // Regla de consistencia: Máximo un elemento con isPrimary = true. Si se desmarca, se tolera ninguno.
    setTaxEntities((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, isPrimary: !item.isPrimary };
        }
        // Si el seleccionado se marca como true, los demás pasan a false
        return item.isPrimary && !prev[index].isPrimary ? { ...item, isPrimary: false } : item;
      })
    );
  };

  const handleUpdateTaxEntity = (index: number, field: keyof Omit<ClientTaxEntity, 'id'>, value: any) => {
    setTaxEntities((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  // Handlers para contacts
  const handleAddContact = () => {
    const hasPrimary = contacts.some((c) => c.isPrimary);
    setContacts([
      ...contacts,
      {
        name: '',
        roleTitle: '',
        email: '',
        phone: '',
        contactType: 'operativo',
        isPrimary: !hasPrimary
      }
    ]);
  };

  const handleRemoveContact = (index: number) => {
    // Regla de consistencia: Si se elimina el principal, NO reasignar automáticamente otro
    setContacts(contacts.filter((_, idx) => idx !== index));
  };

  const handleTogglePrimaryContact = (index: number) => {
    // Regla de consistencia: Máximo un elemento con isPrimary = true. Si se desmarca, se tolera ninguno.
    setContacts((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, isPrimary: !item.isPrimary };
        }
        return item.isPrimary && !prev[index].isPrimary ? { ...item, isPrimary: false } : item;
      })
    );
  };

  const handleUpdateContact = (index: number, field: keyof Omit<ClientContact, 'id'>, value: any) => {
    setContacts((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Filtrar taxEntities que tengan al menos NIT o Razón social
    const cleanTaxEntities: ClientTaxEntity[] = taxEntities
      .filter((t) => t.nit.trim() || t.businessName.trim())
      .map((t, idx) => ({
        id: `tax-new-${Date.now()}-${idx}`,
        nit: t.nit.trim(),
        businessName: t.businessName.trim() || name.trim(),
        city: t.city?.trim() || undefined,
        isPrimary: t.isPrimary,
        alegraContactId: t.alegraContactId?.trim() || undefined,
        notes: t.notes?.trim() || undefined
      }));

    // Filtrar contactos que tengan al menos nombre o email
    const cleanContacts: ClientContact[] = contacts
      .filter((c) => c.name.trim() || c.email.trim())
      .map((c, idx) => ({
        id: `con-new-${Date.now()}-${idx}`,
        name: c.name.trim() || 'Contacto',
        roleTitle: c.roleTitle?.trim() || undefined,
        email: c.email.trim(),
        phone: c.phone?.trim() || undefined,
        contactType: c.contactType,
        isPrimary: c.isPrimary
      }));

    const primaryTax = cleanTaxEntities.find((t) => t.isPrimary) || cleanTaxEntities[0];
    const primaryContact = cleanContacts.find((c) => c.isPrimary) || cleanContacts[0];

    const newClient: ClientProfile = {
      id: `cli-${Date.now()}`,
      name: name.trim(),
      isInternal: false,
      status,
      taxEntities: cleanTaxEntities,
      contacts: cleanContacts,
      accountManagerName: accountManagerName.trim(),
      notes: notes.trim() || undefined,
      portalActive,
      healthStatus: 'Saludable',
      // Compatibilidad operativa
      nit: primaryTax ? primaryTax.nit : 'Sin NIT registrado',
      type: 'Proyecto único',
      projectsCount: 0,
      activeProjectsCount: 0,
      closedProjectsCount: 0,
      averageMarginPercent: null,
      billedCOP: '$0',
      billedInvoicesCount: 0,
      receivableCOP: '$0',
      receivableStatus: 'al día',
      commercialInfo: {
        contactName: primaryContact ? primaryContact.name : 'Por asignar',
        contactRole: primaryContact?.roleTitle || 'Contacto operativo',
        contactEmail: primaryContact?.email || '',
        contactPhone: primaryContact?.phone || '',
        clientSince: 'Hoy',
        brands: [name.trim()]
      },
      behavior: {
        rentabilidad: 100,
        cartera: 100,
        cumplimiento: 100,
        relacion: 100
      },
      projectsHistory: []
    };

    onCreateClient(newClient);
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
              <h2 className="font-extrabold text-base text-[#0f172a]">Crear Nueva Cuenta de Cliente</h2>
              <p className="text-xs text-[#64748b]">Marca sombrilla operativa · No bloquea por falta de NIT</p>
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
          {/* 1. Datos de Cuenta / Marca Sombrilla */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-[#501f92] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>1. Marca Sombrilla / Cuenta Operativa</span>
              </h3>
              <span className="text-[11px] text-[#64748b]">Identificador comercial en Orbit</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#334155] mb-1">
                  Nombre Comercial / Marca Sombrilla *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Postobón, Danone, Incolmotos Yamaha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-semibold focus:outline-none focus:border-[#501f92] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#334155] mb-1">Estado de Operación</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClientStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-semibold focus:outline-none focus:border-[#501f92] cursor-pointer"
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

          {/* 2. Razones Sociales / NITs (Multi-NIT, no bloquea creación) */}
          <div className="space-y-3 pt-3 border-t border-[#f1f5f9]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#501f92] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>2. Razones Sociales / Facturación (0 a N)</span>
                </h3>
                <p className="text-[11px] text-[#64748b]">
                  El NIT no bloquea la operación. Si aún está pendiente de registro contable en Alegra, puedes dejarlo vacío.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddTaxEntity}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f2ecfb] text-[#501f92] hover:bg-[#501f92] hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agregar Razón Social</span>
              </button>
            </div>

            {taxEntities.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-center text-[#64748b]">
                <p className="font-medium">No se han registrado razones sociales aún.</p>
                <p className="text-[11px]">La cuenta puede operar sin NIT y asignarse más adelante al facturar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {taxEntities.map((tax, idx) => (
                  <div
                    key={idx}
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
                          onClick={() => handleTogglePrimaryTax(idx)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                            tax.isPrimary
                              ? 'bg-[#501f92] text-white'
                              : 'bg-white text-[#64748b] border border-[#cbd5e1] hover:text-[#501f92]'
                          }`}
                          title="Máximo una entidad principal. Si se desmarca, se tolera ninguna."
                        >
                          <Star className={`w-3 h-3 ${tax.isPrimary ? 'fill-current' : ''}`} />
                          <span>{tax.isPrimary ? 'Razón Social Principal' : 'Hacer Principal'}</span>
                        </button>
                        <span className="text-[11px] text-[#64748b]">Entidad #{idx + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTaxEntity(idx)}
                        className="p-1 rounded-md text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#fee2e2] transition-colors cursor-pointer"
                        title="Eliminar razón social (no reasigna principal automáticamente)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">NIT / ID Fiscal</label>
                        <input
                          type="text"
                          placeholder="Ej: 901.882.341-0"
                          value={tax.nit}
                          onChange={(e) => handleUpdateTaxEntity(idx, 'nit', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] font-mono text-xs focus:outline-none focus:border-[#501f92]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">Razón Social Legal</label>
                        <input
                          type="text"
                          placeholder="Ej: Danone de Colombia S.A.S."
                          value={tax.businessName}
                          onChange={(e) => handleUpdateTaxEntity(idx, 'businessName', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] font-semibold text-xs focus:outline-none focus:border-[#501f92]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">Ciudad</label>
                        <input
                          type="text"
                          placeholder="Ej: Medellín, Bogotá"
                          value={tax.city}
                          onChange={(e) => handleUpdateTaxEntity(idx, 'city', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">ID Alegra / Notas Facturación</label>
                        <input
                          type="text"
                          placeholder="Ref externa de integración (ej: alg-dan-001)"
                          value={tax.alegraContactId}
                          onChange={(e) => handleUpdateTaxEntity(idx, 'alegraContactId', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] font-mono text-xs focus:outline-none focus:border-[#501f92]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Directorio de Contactos (Multi-contacto, tipificado) */}
          <div className="space-y-3 pt-3 border-t border-[#f1f5f9]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#501f92] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>3. Directorio de Contactos (0 a N)</span>
                </h3>
                <p className="text-[11px] text-[#64748b]">
                  Contactos tipificados: operativo, comercial, facturación o directivo.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddContact}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f2ecfb] text-[#501f92] hover:bg-[#501f92] hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agregar Contacto</span>
              </button>
            </div>

            <div className="space-y-3">
              {contacts.map((contact, idx) => (
                <div
                  key={idx}
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
                        onClick={() => handleTogglePrimaryContact(idx)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                          contact.isPrimary
                            ? 'bg-[#501f92] text-white'
                            : 'bg-white text-[#64748b] border border-[#cbd5e1] hover:text-[#501f92]'
                        }`}
                        title="Máximo un contacto principal. Si se desmarca, se tolera ninguno."
                      >
                        <Star className={`w-3 h-3 ${contact.isPrimary ? 'fill-current' : ''}`} />
                        <span>{contact.isPrimary ? 'Contacto Principal' : 'Hacer Principal'}</span>
                      </button>
                      <span className="text-[11px] text-[#64748b]">Contacto #{idx + 1}</span>
                    </div>
                    {contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(idx)}
                        className="p-1 rounded-md text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#fee2e2] transition-colors cursor-pointer"
                        title="Eliminar contacto (no reasigna automáticamente)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">Nombre Completo</label>
                      <input
                        type="text"
                        placeholder="Ej: Carlos Mendoza"
                        value={contact.name}
                        onChange={(e) => handleUpdateContact(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] font-semibold text-xs focus:outline-none focus:border-[#501f92]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">Cargo / Rol</label>
                      <input
                        type="text"
                        placeholder="Ej: Brand & Growth Director"
                        value={contact.roleTitle}
                        onChange={(e) => handleUpdateContact(idx, 'roleTitle', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">Tipo de Contacto</label>
                      <select
                        value={contact.contactType}
                        onChange={(e) => handleUpdateContact(idx, 'contactType', e.target.value as ClientContactRole)}
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
                        placeholder="carlos.mendoza@empresa.com"
                        value={contact.email}
                        onChange={(e) => handleUpdateContact(idx, 'email', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172a] text-xs focus:outline-none focus:border-[#501f92]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#475569] mb-0.5">Teléfono</label>
                      <input
                        type="text"
                        placeholder="+57 (310) 902-8314"
                        value={contact.phone}
                        onChange={(e) => handleUpdateContact(idx, 'phone', e.target.value)}
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
              <span>Crear Cuenta de Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
