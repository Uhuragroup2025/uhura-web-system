import React, { useState, useEffect } from 'react';
import { ClientProfile, ClientType } from './types';
import { X, Building2, User, Mail, Phone, Tag, ShieldCheck, DollarSign, Check } from 'lucide-react';

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
  const [nit, setNit] = useState('');
  const [type, setType] = useState<ClientType>('Fee mensual');
  const [healthStatus, setHealthStatus] = useState<'Saludable' | 'En Riesgo' | 'Crítico'>('Saludable');
  const [portalActive, setPortalActive] = useState(true);
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [clientSince, setClientSince] = useState('');
  const [brandsInput, setBrandsInput] = useState('');
  const [billedCOP, setBilledCOP] = useState('');
  const [receivableCOP, setReceivableCOP] = useState('');
  const [receivableStatus, setReceivableStatus] = useState('al día');

  useEffect(() => {
    if (client) {
      setName(client.name);
      setNit(client.nit);
      setType(client.type);
      setHealthStatus(client.healthStatus);
      setPortalActive(client.portalActive);
      setContactName(client.commercialInfo.contactName);
      setContactRole(client.commercialInfo.contactRole);
      setContactEmail(client.commercialInfo.contactEmail || '');
      setContactPhone(client.commercialInfo.contactPhone || '');
      setClientSince(client.commercialInfo.clientSince || '');
      setBrandsInput(client.commercialInfo.brands.join(', '));
      setBilledCOP(client.billedCOP);
      setReceivableCOP(client.receivableCOP);
      setReceivableStatus(client.receivableStatus);
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const brands = brandsInput
      .split(',')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const updated: ClientProfile = {
      ...client,
      name: name.trim() || client.name,
      nit: nit.trim() || client.nit,
      type,
      healthStatus,
      portalActive,
      billedCOP: billedCOP.trim() || client.billedCOP,
      receivableCOP: receivableCOP.trim() || client.receivableCOP,
      receivableStatus,
      commercialInfo: {
        ...client.commercialInfo,
        contactName: contactName.trim() || client.commercialInfo.contactName,
        contactRole: contactRole.trim() || client.commercialInfo.contactRole,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        clientSince: clientSince.trim() || client.commercialInfo.clientSince,
        brands: brands.length > 0 ? brands : client.commercialInfo.brands
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
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#e2e8f0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f2ecfb] text-[#501f92] flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#0f172a]">Editar Información de Cuenta</h2>
              <p className="text-xs text-[#64748b]">{client.name}</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* General Information */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-[#501f92] uppercase tracking-wider">
              1. Datos Principales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#334155] mb-1">Nombre de la Empresa / Cliente *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-medium focus:outline-none focus:border-[#501f92] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#334155] mb-1">NIT / Identificación Fiscal *</label>
                <input
                  type="text"
                  required
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-mono focus:outline-none focus:border-[#501f92] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#334155] mb-1">Tipo de Relación Comercial</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ClientType)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-semibold focus:outline-none focus:border-[#501f92] cursor-pointer"
                >
                  <option value="Fee mensual">Fee mensual</option>
                  <option value="Proyecto único">Proyecto único</option>
                  <option value="Interno / No facturable">Interno / No facturable</option>
                  <option value="Mixto">Mixto (Fee + Proyecto único)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#334155] mb-1">Estado de Salud de Cuenta</label>
                <select
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-semibold focus:outline-none focus:border-[#501f92] cursor-pointer"
                >
                  <option value="Saludable">🟢 Saludable</option>
                  <option value="En Riesgo">🟡 En Riesgo</option>
                  <option value="Crítico">🔴 Crítico</option>
                </select>
              </div>
            </div>
          </div>

          {/* Commercial Contact Information */}
          <div className="space-y-3 pt-3 border-t border-[#f1f5f9]">
            <h3 className="font-bold text-xs text-[#501f92] uppercase tracking-wider">
              2. Contacto Comercial & Marcas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#334155] mb-1">Nombre del Contacto</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#334155] mb-1">Cargo / Rol</label>
                <input
                  type="text"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#334155] mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#334155] mb-1">Teléfono</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-mono focus:outline-none focus:border-[#501f92] focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#334155] mb-1">
                  Marcas Asociadas (separadas por comas)
                </label>
                <input
                  type="text"
                  value={brandsInput}
                  onChange={(e) => setBrandsInput(e.target.value)}
                  placeholder="Ej: Danone, Activia, Bonafont"
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Portal and Billing */}
          <div className="space-y-3 pt-3 border-t border-[#f1f5f9]">
            <h3 className="font-bold text-xs text-[#501f92] uppercase tracking-wider">
              3. Configuración de Portal & Cartera
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div>
                  <span className="font-bold text-[#0f172a] block">Acceso a Portal de Cliente</span>
                  <span className="text-[11px] text-[#64748b]">
                    Permite al cliente visualizar entregables y aprobar tareas
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPortalActive(!portalActive)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    portalActive ? 'bg-[#10b981]' : 'bg-[#cbd5e1]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      portalActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block font-semibold text-[#334155] mb-1">Estado de Cartera</label>
                <select
                  value={receivableStatus}
                  onChange={(e) => setReceivableStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] font-semibold focus:outline-none focus:border-[#501f92] cursor-pointer"
                >
                  <option value="al día">Al día (Sin deuda vencida)</option>
                  <option value="en mora">En mora / Facturas pendientes</option>
                  <option value="en cobro">En gestión de cobro pre-jurídico</option>
                </select>
              </div>
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
              className="px-5 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
