import React, { useState, useEffect, useMemo } from 'react';
import { NewBusinessOpportunity, QuoteProposal, SowDocumentData } from '../types';
import { formatCurrency } from '../../../utils/formatters';
import {
  CompanyLegalSignerConfig,
  DEFAULT_UHURA_LEGAL_SIGNER,
  UHURA_OFFICIAL_LEGAL_ENTITY
} from './slaEngine';
import {
  detectSowArchetype,
  SowArchetype,
  buildSowPlainText,
  buildSowHtml,
  getDefaultSowRisks,
  getDefaultSowGates,
  renderPlaceholder
} from './sowTemplates';
import {
  FileText,
  X,
  Copy,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  DollarSign,
  AlertCircle,
  Download,
  Building2,
  User,
  Layers,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  Info,
  CheckSquare
} from 'lucide-react';

interface SOWModalProps {
  isOpen: boolean;
  opportunity: NewBusinessOpportunity;
  quote: QuoteProposal;
  onClose: () => void;
  onSaveSOWData?: (updatedSowData: SowDocumentData) => void;
  companyLegalConfig?: CompanyLegalSignerConfig;
}

export const SOWModal: React.FC<SOWModalProps> = ({
  isOpen,
  opportunity,
  quote,
  onClose,
  onSaveSOWData,
  companyLegalConfig = DEFAULT_UHURA_LEGAL_SIGNER
}) => {
  const clientName = opportunity.prospectAccountName || 'Cliente';
  const serviceTitle = opportunity.title || 'Servicio de Desarrollo & Producto Digital';
  const currency = quote.currency || 'COP';
  const totalValue =
    quote.totalQuotedValue ||
    quote.totalQuotedValueCOP ||
    quote.financialSummary?.finalPriceWithTaxCOP ||
    quote.financialSummary?.subtotalBeforeTaxCOP ||
    0;
  const formattedPrice = formatCurrency(totalValue, currency);
  const ivaValue = formatCurrency(Math.round(totalValue * 0.19), currency);
  const totalWithIva = formatCurrency(Math.round(totalValue * 1.19), currency);
  const halfPayment = formatCurrency(Math.round(totalValue / 2), currency);
  const estimatedWeeks = quote.estimatedWeeks || quote.financialConfig?.projectDurationWeeks || 6;

  // Detección inicial de arquetipo
  const detectedArchetype = useMemo(() => {
    return (opportunity.sowData?.archetype as SowArchetype) || detectSowArchetype(opportunity, quote);
  }, [opportunity, quote]);

  const [archetype, setArchetype] = useState<SowArchetype>(detectedArchetype);
  const [activeTab, setActiveTab] = useState<'preview' | 'clauses'>('preview');

  // Metadatos Formales
  const [clientNit, setClientNit] = useState<string>(opportunity.sowData?.clientNit || '');
  const [orderNumber, setOrderNumber] = useState<string>(opportunity.sowData?.orderNumber || '');
  const [supervisorClient, setSupervisorClient] = useState<string>(opportunity.sowData?.supervisorClient || '');
  const [supervisorClientRole, setSupervisorClientRole] = useState<string>(opportunity.sowData?.supervisorClientRole || '');
  const [supervisorProvider, setSupervisorProvider] = useState<string>(
    opportunity.sowData?.supervisorProvider || 'Luisa Fernanda Urazán Prieto (Especialista en Relacionamiento) / Catalina Tejada'
  );

  // Representación Legal Cliente
  const [clientRepresentative, setClientRepresentative] = useState<string>(
    opportunity.sowData?.clientRepresentative || opportunity.contactName || ''
  );
  const [clientRepresentativeId, setClientRepresentativeId] = useState<string>(
    opportunity.sowData?.clientRepresentativeId || ''
  );
  const [clientRepresentativeRole, setClientRepresentativeRole] = useState<string>(
    opportunity.sowData?.clientRepresentativeRole || 'Representante Legal / Gerente General'
  );

  // Representación Legal UHURA S.A.S.
  const [selectedSignerIndex, setSelectedSignerIndex] = useState<number>(0);
  const currentSigner = selectedSignerIndex === 0
    ? UHURA_OFFICIAL_LEGAL_ENTITY.primarySigner
    : UHURA_OFFICIAL_LEGAL_ENTITY.alternateSigner;

  // Cláusulas Editables
  const [objective, setObjective] = useState<string>(
    opportunity.sowData?.objective ||
      (detectedArchetype === 'ecommerce_shopify'
        ? `${clientName} busca lanzar su canal de venta digital mediante una tienda online desarrollada sobre Shopify.\nEl objetivo central del proyecto es construir una experiencia ecommerce enfocada en generar confianza en la categoría, facilitar la compra y crear una plataforma administrable y escalable para futuras campañas comerciales.`
        : `El objetivo central de este proyecto es el rediseño, desarrollo, optimización y activación del portal institucional para ${clientName}. Este portal estará enfocado en optimizar la experiencia del usuario (UX/UI), mejorar la velocidad de carga (Core Web Vitals) y garantizar una administración independiente y ágil.`)
  );

  const [scheduleNotes, setScheduleNotes] = useState<string>(
    opportunity.sowData?.scheduleNotes ||
      `Duración estimada: ${estimatedWeeks} semanas productivas efectivas a partir del kick-off formal y entrega oportuna de insumos por parte del cliente.`
  );

  const [exclusions, setExclusions] = useState<string>(
    opportunity.sowData?.exclusions ||
      `• Servicios de hosting, dominios o licenciamiento de terceros no contemplados en el alcance.\n• Adquisición de contenidos fotográficos o audiovisuales de stock pagado.\n• Modificaciones a la arquitectura aprobada una vez superada la fase de diseño UI/UX (Gate 1).\n• Rondas ilimitadas de revisión (se restringen a las ventanas formales pactadas).`
  );

  const [paymentTerms, setPaymentTerms] = useState<string>(
    opportunity.sowData?.paymentTerms ||
      `• 50% de anticipo (${halfPayment} COP antes de IVA) a la firma del presente SOW para dar inicio a la planificación y arquitectura.\n• 50% restante (${halfPayment} COP antes de IVA) contra entrega final y aprobación en ambiente de pruebas (UAT).`
  );

  const [copied, setCopied] = useState<boolean>(false);
  const [showMetadataDrawer, setShowMetadataDrawer] = useState<boolean>(false);

  // Detección de campos pendientes por rellenar
  const pendingFields = useMemo(() => {
    const list: string[] = [];
    if (!clientNit.trim()) list.push('NIT Cliente');
    if (!supervisorClient.trim()) list.push('Supervisor del Cliente');
    if (!clientRepresentative.trim()) list.push('Nombre Representante Legal Cliente');
    if (!clientRepresentativeId.trim()) list.push('C.C. Representante Legal Cliente');
    return list;
  }, [clientNit, supervisorClient, clientRepresentative, clientRepresentativeId]);

  // Contenido generado en caliente
  const generatedHtml = useMemo(() => {
    return buildSowHtml({
      opportunity,
      quote,
      clientNit,
      orderNumber,
      supervisorClient,
      supervisorClientRole,
      supervisorProvider,
      clientRepresentative,
      clientRepresentativeId,
      clientRepresentativeRole,
      sowSigner: currentSigner.name,
      sowSignerRole: `${currentSigner.role} · ${UHURA_OFFICIAL_LEGAL_ENTITY.companyName}`,
      sowSignerId: currentSigner.idNumber,
      providerCompany: UHURA_OFFICIAL_LEGAL_ENTITY.companyName,
      providerNit: UHURA_OFFICIAL_LEGAL_ENTITY.nit,
      objective,
      scheduleNotes,
      exclusions,
      paymentTerms,
      archetype
    });
  }, [
    opportunity,
    quote,
    clientNit,
    orderNumber,
    supervisorClient,
    supervisorClientRole,
    supervisorProvider,
    clientRepresentative,
    clientRepresentativeId,
    clientRepresentativeRole,
    currentSigner,
    objective,
    scheduleNotes,
    exclusions,
    paymentTerms,
    archetype
  ]);

  const generatedPlain = useMemo(() => {
    return buildSowPlainText({
      opportunity,
      quote,
      clientNit,
      orderNumber,
      supervisorClient,
      supervisorClientRole,
      supervisorProvider,
      clientRepresentative,
      clientRepresentativeId,
      clientRepresentativeRole,
      sowSigner: currentSigner.name,
      sowSignerRole: `${currentSigner.role} · ${UHURA_OFFICIAL_LEGAL_ENTITY.companyName}`,
      sowSignerId: currentSigner.idNumber,
      providerCompany: UHURA_OFFICIAL_LEGAL_ENTITY.companyName,
      providerNit: UHURA_OFFICIAL_LEGAL_ENTITY.nit,
      objective,
      scheduleNotes,
      exclusions,
      paymentTerms,
      archetype
    });
  }, [
    opportunity,
    quote,
    clientNit,
    orderNumber,
    supervisorClient,
    supervisorClientRole,
    supervisorProvider,
    clientRepresentative,
    clientRepresentativeId,
    clientRepresentativeRole,
    currentSigner,
    objective,
    scheduleNotes,
    exclusions,
    paymentTerms,
    archetype
  ]);

  // Copia inteligente compatible con Google Docs (HTML enriquecido con tablas + fallback texto)
  const handleCopyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const textBlob = new Blob([generatedPlain], { type: 'text/plain' });
        const htmlBlob = new Blob([generatedHtml], { type: 'text/html' });
        await navigator.clipboard.write([
          new window.ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob
          })
        ]);
      } else {
        await navigator.clipboard.writeText(generatedPlain);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
    } catch {
      // Fallback
      navigator.clipboard.writeText(generatedPlain);
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
    }
  };

  const handleSaveAndClose = () => {
    if (onSaveSOWData) {
      onSaveSOWData({
        title: `SOW - ${serviceTitle}`,
        clientName,
        clientNit,
        orderNumber,
        archetype,
        supervisorClient,
        supervisorClientRole,
        supervisorProvider,
        clientRepresentative,
        clientRepresentativeId,
        clientRepresentativeRole,
        serviceName: serviceTitle,
        objective,
        deliverablesScope: quote.deliverables.map((d) => d.name).join(', '),
        scheduleNotes,
        exclusions,
        commercialValueFormatted: formattedPrice,
        paymentTerms,
        status: opportunity.sowData?.status || 'ready_for_review',
        sowSigner: currentSigner.name,
        sowSignerRole: `${currentSigner.role} · ${UHURA_OFFICIAL_LEGAL_ENTITY.companyName}`,
        sowSignerId: currentSigner.idNumber,
        providerCompany: UHURA_OFFICIAL_LEGAL_ENTITY.companyName,
        providerNit: UHURA_OFFICIAL_LEGAL_ENTITY.nit,
        signatureProvider: 'Adobe Acrobat Sign',
        signatureReferenceUrl: opportunity.sowData?.signatureReferenceUrl,
        signedDocUrl: opportunity.sowData?.signedDocUrl,
        lastUpdatedAt: new Date().toISOString()
      });
    }
    onClose();
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const risks = getDefaultSowRisks(clientName, archetype);
  const gates = getDefaultSowGates(clientName, archetype, estimatedWeeks);

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con estilo Uhura Black & Purple */}
        <div className="p-4 sm:p-5 bg-[#0f172a] text-white flex items-center justify-between border-b border-[#1e293b] flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#501f92] text-[#d4ff4a] shadow-inner shadow-black/30">
              <FileText className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold tracking-tight text-white">
                  Documento de Alcance (SOW)
                </h3>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {clientName} · {serviceTitle} ({quote.versionLabel})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg active:scale-95 ${
                copied
                  ? 'bg-[#10b981] hover:bg-[#059669] text-white ring-2 ring-white scale-105'
                  : 'bg-white hover:bg-[#f1f5f9] text-[#501f92] border-2 border-[#501f92] ring-2 ring-[#d4ff4a] hover:scale-[1.02]'
              }`}
              title="Copiar contenido listo con tablas y colores corporativos para pegar en Google Docs"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <Copy className="w-4 h-4 text-[#501f92]" />
              )}
              <span className="font-extrabold tracking-tight">
                {copied ? '¡Copiado para Docs!' : 'Copiar para Docs'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-barra de Navegación & Control de Campos */}
        <div className="bg-[#f8fafc] px-5 py-2.5 border-b border-[#e2e8f0] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-white text-[#501f92] shadow-xs border border-[#cbd5e1]'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Vista Documento Final</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('clauses')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'clauses'
                  ? 'bg-white text-[#501f92] shadow-xs border border-[#cbd5e1]'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Personalizar Cláusulas</span>
            </button>
          </div>

          {/* Alerta de campos a rellenar */}
          {pendingFields.length > 0 ? (
            <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-[11px] font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>{pendingFields.length}</strong> datos por completar (resaltarán como <code className="bg-amber-200/80 px-1 py-0.5 rounded font-mono font-bold text-amber-900">[COMPLETAR]</code> al pegar en Docs)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Todos los datos formales completados</span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CUERPO PRINCIPAL DEL MODAL */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#f1f5f9] text-xs">
          
          {/* TAB 1: VISTA PREVIA DEL DOCUMENTO COMPLETO */}
          {activeTab === 'preview' && (
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Hoja de Documento Corporativo Uhura A4 */}
              <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#cbd5e1] shadow-md space-y-7 text-[#1e293b] leading-relaxed">
                
                {/* Membrete y Título */}
                <div className="border-b-2 border-[#501f92] pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#501f92] tracking-tight uppercase">
                      Documento de Alcance (SOW)
                    </h1>
                    <p className="text-sm font-bold text-[#334155] mt-1">
                      {serviceTitle}
                    </p>
                  </div>

                  <div className="text-left sm:text-right text-[11px] space-y-0.5 text-[#64748b]">
                    <span className="font-black text-[#501f92] text-xs block">UHURA S.A.S.</span>
                    <span>NIT: 901.093.070-2</span>
                    <span className="block font-mono text-[#0f172a] font-bold">
                      Versión: {quote.versionLabel || '1.0 – Final para Firma'}
                    </span>
                    <span>Fecha: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>

                {/* Tabla de Metadatos Formales */}
                <div className="rounded-xl border border-[#cbd5e1] overflow-hidden bg-[#fafafa]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#cbd5e1] text-xs">
                    <div className="p-3.5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#501f92]">CLIENTE:</span>
                        <strong className="text-[#0f172a]">{clientName}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#501f92]">NIT CLIENTE:</span>
                        {clientNit.trim() ? (
                          <span className="font-mono text-[#0f172a]">{clientNit}</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                            [COMPLETAR: NIT del Cliente]
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#501f92]">SUPERVISOR CLIENTE:</span>
                        {supervisorClient.trim() ? (
                          <span className="text-[#0f172a]">{supervisorClient}</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                            [COMPLETAR: Supervisor Cliente]
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#501f92]">ORDEN DE COMPRA:</span>
                        {orderNumber.trim() ? (
                          <span className="font-mono text-[#0f172a]">{orderNumber}</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                            [COMPLETAR: OC si aplica]
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 space-y-2 bg-[#f8fafc]">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#501f92]">PROVEEDOR:</span>
                        <strong className="text-[#0f172a]">UHURA S.A.S.</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#501f92]">NIT PROVEEDOR:</span>
                        <span className="font-mono text-[#0f172a]">901.093.070-2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#501f92]">SUPERVISOR UHURA:</span>
                        <span className="text-[#0f172a] truncate max-w-[220px]" title={supervisorProvider}>
                          {supervisorProvider}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#501f92]">REPRESENTANTE UHURA:</span>
                        <span className="text-[#0f172a]">{currentSigner.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1. Antecedentes y Objetivo */}
                <div className="space-y-2">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#501f92] flex items-center gap-2 border-b border-[#e2e8f0] pb-1">
                    <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                    1. Antecedentes y Objetivo
                  </h2>
                  <p className="text-[#334155] whitespace-pre-line leading-relaxed">
                    {objective}
                  </p>
                </div>

                {/* 2. Alcance Funcional & Entregables */}
                <div className="space-y-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#501f92] flex items-center gap-2 border-b border-[#e2e8f0] pb-1">
                    <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                    2. Alcance Funcional y Estructura de Entregables
                  </h2>
                  <p className="text-[#475569]">
                    UHURA implementará y certificará los siguientes entregables según el dimensionamiento técnico acordado:
                  </p>

                  <div className="space-y-3 pt-1">
                    {quote.deliverables.map((del, dIdx) => (
                      <div key={del.id} className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#0f172a] text-xs">
                            2.{dIdx + 1}. {del.name}
                          </span>
                          <span className="text-[10px] font-semibold text-[#64748b]">
                            {del.backlogItems.length} actividades
                          </span>
                        </div>
                        {del.description && (
                          <p className="text-[11px] text-[#64748b] italic">{del.description}</p>
                        )}
                        <ul className="list-disc list-inside space-y-1 text-[#334155] pl-1 pt-1">
                          {del.backlogItems.map((act) => (
                            <li key={act.id} className="text-[11px]">
                              <strong>{act.title}</strong>
                              {act.description && <span className="text-[#64748b]"> — {act.description}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Responsabilidades y Entrega de Insumos */}
                <div className="space-y-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#501f92] flex items-center gap-2 border-b border-[#e2e8f0] pb-1">
                    <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                    3. Responsabilidades y Entrega de Insumos
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
                      <strong className="text-[#0f172a] block">3.1. Responsabilidad de {clientName}:</strong>
                      <ul className="list-disc list-inside space-y-1 text-[#475569]">
                        <li>Entrega oportuna de textos, logotipos y manuales de marca.</li>
                        <li>Credenciales y accesos a hosting, servidores DNS y pasarelas de pago.</li>
                        <li>Designación de Supervisor único para consolidación de feedback.</li>
                        <li>Revisión de entregables dentro del plazo de 5 a 10 días hábiles por Gate.</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
                      <strong className="text-[#0f172a] block">3.2. Responsabilidad de UHURA S.A.S.:</strong>
                      <ul className="list-disc list-inside space-y-1 text-[#475569]">
                        <li>Diseño de arquitectura de experiencia y construcción técnica de la solución.</li>
                        <li>Configuración analítica base (GA4, GTM, Clarity) y eventos de conversión.</li>
                        <li>Capacitación técnica grabada en administración de la plataforma.</li>
                        <li>Entrega de Matriz de Trazabilidad Técnica con snapshot de software.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 4. Protocolo de Pruebas UAT & Silencio Positivo */}
                <div className="space-y-2">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#501f92] flex items-center gap-2 border-b border-[#e2e8f0] pb-1">
                    <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                    4. Protocolo de Pruebas (UAT) y Cláusula de Silencio Positivo
                  </h2>
                  <p className="text-[#334155]">
                    El proyecto se valida en un ambiente de Staging dedicado (URL temporal de pruebas). El cliente dispondrá de cinco (5) a diez (10) días hábiles para consolidar observaciones técnicas en un único documento.
                  </p>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                    <strong>CLÁUSULA DE SILENCIO POSITIVO:</strong> Si transcurrido el plazo formal desde la entrega en Staging el cliente no emite observaciones formales por escrito, el hito se entenderá por aprobado a satisfacción y UHURA procederá con la facturación y paso a Go-Live.
                  </div>
                </div>

                {/* 5. Matriz de Riesgos y Plan de Mitigación (Obligatorio) */}
                <div className="space-y-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#501f92] flex items-center gap-2 border-b border-[#e2e8f0] pb-1">
                    <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                    5. Matriz de Riesgos y Plan de Mitigación (Obligatorio)
                  </h2>
                  <div className="overflow-x-auto rounded-xl border border-[#cbd5e1]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#501f92] text-white">
                          <th className="p-2.5 font-bold border-r border-[#43177d] w-1/3">Riesgo Identificado</th>
                          <th className="p-2.5 font-bold border-r border-[#43177d] w-20 text-center">Impacto</th>
                          <th className="p-2.5 font-bold">Plan de Mitigación / Responsable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e8f0]">
                        {risks.map((r, rIdx) => (
                          <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                            <td className="p-2.5 font-semibold text-[#0f172a] border-r border-[#e2e8f0]">
                              {r.risk}
                            </td>
                            <td className="p-2.5 text-center border-r border-[#e2e8f0]">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.impact === 'Alto'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {r.impact}
                              </span>
                            </td>
                            <td className="p-2.5 text-[#334155] whitespace-pre-line leading-relaxed">
                              {r.mitigation}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6. Gates y Cláusula de Congelamiento */}
                <div className="space-y-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#501f92] flex items-center gap-2 border-b border-[#e2e8f0] pb-1">
                    <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                    6. Gates y Control del Proyecto
                  </h2>
                  <div className="space-y-3">
                    {gates.map((g) => (
                      <div key={g.id} className="p-3.5 rounded-xl border border-[#e2e8f0] bg-[#fafaf9] space-y-1.5">
                        <span className="font-extrabold text-[#501f92] text-xs block">{g.name}</span>
                        <p className="text-[#334155]"><strong>Acción UHURA:</strong> {g.uhuraAction}</p>
                        <p className="text-[#334155]"><strong>Acción Cliente:</strong> {g.clientAction}</p>
                        <p className="text-[#334155]"><strong>Resultado:</strong> {g.expectedResult}</p>
                        {g.freezeClause && (
                          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
                            🔒 {g.freezeClause}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Cláusula de IA y Tratamiento de Datos */}
                <div className="space-y-2">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#501f92] flex items-center gap-2 border-b border-[#e2e8f0] pb-1">
                    <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                    7. Uso de Inteligencia Artificial y Tratamiento de Datos
                  </h2>
                  <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2 text-[#334155] leading-relaxed">
                    <p>
                      <strong>Confidencialidad en IA:</strong> UHURA garantiza que <strong>NO utilizará datos sensibles, secretos industriales ni información confidencial del CLIENTE para entrenar modelos públicos de IA</strong>. Toda interacción con herramientas de IA asistida se realiza bajo protocolos de anonimización y con curaduría y responsabilidad humana al 100%.
                    </p>
                    <p>
                      <strong>Tratamiento de Datos (Ley 1581):</strong> El CLIENTE es el único "Responsable del Tratamiento" de los datos captados. UHURA actúa exclusivamente como "Encargado del Tratamiento" a nivel técnico.
                    </p>
                  </div>
                </div>

                {/* 8. Gestión de Cambios (Change Request) */}
                <div className="space-y-2">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#501f92] flex items-center gap-2 border-b border-[#e2e8f0] pb-1">
                    <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                    8. Gestión de Cambios (Change Request)
                  </h2>
                  <p className="text-[#334155]">
                    Toda solicitud técnica posterior al congelamiento de los Gates se valorará bajo la tarifa de horas a demanda (<strong>$226.395 COP por hora más IVA</strong>) y requerirá la firma formal de una Orden de Cambio antes de su ejecución.
                  </p>
                </div>

                {/* 9. Inversión Comercial y Forma de Pago */}
                <div className="space-y-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#501f92] flex items-center gap-2 border-b border-[#e2e8f0] pb-1">
                    <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                    9. Inversión Comercial y Condiciones de Pago
                  </h2>
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#faf5ff] to-[#f5f3ff] border border-[#e9d5ff] flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#501f92] tracking-wider block">
                        Valor Total del Acuerdo
                      </span>
                      <span className="text-lg font-black text-[#0f172a]">{formattedPrice} COP</span>
                      <span className="text-[11px] text-[#64748b] block">
                        + IVA 19% ({ivaValue} COP) = Total {totalWithIva} COP
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full bg-[#501f92] text-[#d4ff4a] text-xs font-black shadow-xs">
                        50% Anticipo / 50% UAT
                      </span>
                      <span className="text-[11px] text-[#475569] block mt-1">
                        Dos pagos iguales de {halfPayment} COP antes de IVA
                      </span>
                    </div>
                  </div>
                </div>

                {/* 10. Garantía Técnica Extendida (6 Meses) */}
                <div className="space-y-2">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#501f92] flex items-center gap-2 border-b border-[#e2e8f0] pb-1">
                    <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                    10. Garantía Técnica (6 Meses) y Protocolo de Peritaje
                  </h2>
                  <p className="text-[#334155]">
                    UHURA otorga una garantía técnica extendida de <strong>seis (6) meses</strong> sobre maquetación responsive y lógica desarrollada directamente. Incluye protocolo de peritaje técnico con tiempo de respuesta de <strong>ocho (8) horas laborales</strong>.
                  </p>
                </div>

                {/* 11. Bloque de Firmas Formales */}
                <div className="border-t-2 border-[#cbd5e1] pt-6 space-y-4">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#501f92] text-center">
                    Aceptación del Documento de Alcance (SOW)
                  </h2>
                  <p className="text-center text-[#64748b] text-[11px]">
                    Al firmar este documento, ambas partes aceptan formalmente las condiciones, alcances, exclusiones y cronogramas acordados:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                    {/* Firma Cliente */}
                    <div className="space-y-4">
                      <span className="font-extrabold text-[#501f92] block">POR EL CLIENTE:</span>
                      <div className="h-20 border-b border-dashed border-[#94a3b8] flex items-end pb-1">
                        <span className="text-[10px] text-[#94a3b8] font-mono">Adobe Acrobat Sign (Cliente)</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <p className="font-black text-[#0f172a]">{clientName}</p>
                        <p className="text-[#334155]">
                          Nombre:{' '}
                          {clientRepresentative.trim() ? (
                            <strong>{clientRepresentative}</strong>
                          ) : (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                              [COMPLETAR: Nombre Representante Legal]
                            </span>
                          )}
                        </p>
                        <p className="text-[#334155]">Cargo: {clientRepresentativeRole}</p>
                        <p className="text-[#334155]">
                          Identificación:{' '}
                          {clientRepresentativeId.trim() ? (
                            <span className="font-mono">{clientRepresentativeId}</span>
                          ) : (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                              [COMPLETAR: C.C. Representante Legal]
                            </span>
                          )}
                        </p>
                        <p className="text-[#64748b] text-[11px]">Fecha: ____ / ____ / ________</p>
                      </div>
                    </div>

                    {/* Firma Uhura */}
                    <div className="space-y-4">
                      <span className="font-extrabold text-[#501f92] block">POR EL PROVEEDOR:</span>
                      <div className="h-20 border-b border-dashed border-[#94a3b8] flex items-end pb-1">
                        <span className="text-[10px] text-[#94a3b8] font-mono">Adobe Acrobat Sign (UHURA)</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <p className="font-black text-[#0f172a]">UHURA S.A.S. (NIT 901.093.070-2)</p>
                        <p className="text-[#334155]">Nombre: <strong>{currentSigner.name}</strong></p>
                        <p className="text-[#334155]">Cargo: {currentSigner.role}</p>
                        <p className="text-[#334155]">Identificación: <span className="font-mono">{currentSigner.idNumber}</span></p>
                        <p className="text-[#64748b] text-[11px]">Fecha: ____ / ____ / ________</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: PERSONALIZAR CLÁUSULAS */}
          {activeTab === 'clauses' && (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-[#cbd5e1] shadow-xs space-y-5">
              <div className="border-b border-[#e2e8f0] pb-3">
                <h4 className="font-extrabold text-sm text-[#0f172a] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#501f92]" />
                  <span>Ajustes Puntuales de Cláusulas</span>
                </h4>
                <p className="text-xs text-[#64748b]">
                  Personaliza los textos específicos de este acuerdo antes de exportar o guardar.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#475569] block text-[11px]">1. Antecedentes y Objetivo de Negocio:</label>
                <textarea
                  rows={4}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs focus:ring-2 focus:ring-[#501f92]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#475569] block text-[11px]">Notas de Cronograma:</label>
                <textarea
                  rows={2}
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs focus:ring-2 focus:ring-[#501f92]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#475569] block text-[11px]">Exclusiones Taxativas:</label>
                <textarea
                  rows={3}
                  value={exclusions}
                  onChange={(e) => setExclusions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs focus:ring-2 focus:ring-[#501f92]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#475569] block text-[11px]">Condiciones de Pago:</label>
                <textarea
                  rows={3}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs focus:ring-2 focus:ring-[#501f92]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="px-4 py-2 rounded-xl bg-[#501f92] text-white font-bold text-xs hover:bg-[#3d1572] cursor-pointer"
                >
                  Ver en Documento Final →
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer del Modal con Acciones */}
        <div className="p-4 bg-white border-t border-[#e2e8f0] flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm ${
                copied
                  ? 'bg-[#10b981] text-white border-2 border-[#059669]'
                  : 'bg-white hover:bg-[#f8fafc] text-[#501f92] border-2 border-[#501f92] hover:scale-[1.02]'
              }`}
              title="Copia el documento enriquecido con tablas y estilos para pegar en Google Docs"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <Copy className="w-4 h-4 text-[#501f92]" />
              )}
              <span>{copied ? '¡Copiado para Docs!' : 'Copiar para Docs'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndClose}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#3b156b] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#d4ff4a]" />
              <span>Guardar SOW</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
