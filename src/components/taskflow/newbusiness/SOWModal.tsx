import React, { useState } from 'react';
import { NewBusinessOpportunity, QuoteProposal } from '../types';
import { formatFinancialCurrency } from '../financial/financialEngine';
import {
  CompanyLegalSignerConfig,
  DEFAULT_UHURA_LEGAL_SIGNER
} from './slaEngine';
import {
  FileText,
  X,
  Copy,
  Printer,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  DollarSign,
  AlertCircle,
  Download
} from 'lucide-react';

interface SOWModalProps {
  isOpen: boolean;
  opportunity: NewBusinessOpportunity;
  quote: QuoteProposal;
  onClose: () => void;
  onSaveSOWData?: (updatedSowData: any) => void;
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
  const totalCOP =
    quote.financialSummary?.finalPriceWithTaxCOP ||
    quote.financialSummary?.subtotalBeforeTaxCOP ||
    quote.totalQuotedValueCOP ||
    0;
  const formattedPrice = formatFinancialCurrency(totalCOP, 'COP');
  const estimatedWeeks = quote.financialConfig?.projectDurationWeeks || 8;

  // Snapshot de configuración legal: preserva el guardado en el SOW si ya existía o toma la config de la compañía
  const signerName = opportunity.sowData?.sowSigner || companyLegalConfig.name;
  const signerRole = opportunity.sowData?.sowSignerRole || companyLegalConfig.role;
  const signatureProvider = opportunity.sowData?.signatureProvider || companyLegalConfig.signatureProvider;

  // Estado del SOW editable
  const [objective, setObjective] = useState<string>(
    opportunity.sowData?.objective ||
      `Diseño, desarrollo y despliegue del proyecto "${serviceTitle}" para ${clientName}, asegurando altos estándares de calidad, arquitectura escalable y entrega en los tiempos acordados.`
  );

  const [scheduleNotes, setScheduleNotes] = useState<string>(
    opportunity.sowData?.scheduleNotes ||
      `Duración estimada: ${estimatedWeeks} semanas calendario a partir del kick-off formal y entrega oportuna de insumos por parte del cliente.`
  );

  const [exclusions, setExclusiones] = useState<string>(
    opportunity.sowData?.exclusions ||
      `• Servicios de hosting, dominios o licenciamiento de terceros no contemplados en el alcance.\n• Adquisición de contenidos fotográficos o audiovisuales de stock pagado.\n• Modificaciones a la arquitectura aprobada una vez superada la fase de diseño UI/UX.`
  );

  const [paymentTerms, setPaymentTerms] = useState<string>(
    opportunity.sowData?.paymentTerms ||
      `• 50% de anticipo a la firma del presente SOW para dar inicio a la planificación y diseño.\n• 50% restante contra entrega final a satisfacción en ambiente de producción.`
  );

  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Generamos el texto estructurado de entregables sin horas internas
  const deliverablesSummary = quote.deliverables.map((del, dIdx) => {
    const activitiesList = del.backlogItems
      .map((act) => `    - ${act.title}${act.description ? `: ${act.description}` : ''}`)
      .join('\n');
    return `${dIdx + 1}. ${del.name}${del.description ? `\n   ${del.description}` : ''}\n${activitiesList}`;
  }).join('\n\n');

  const handleCopyToClipboard = () => {
    const fullSowText = `=====================================================
STATEMENT OF WORK (SOW) - UHURA GROUP
ANEXO TÉCNICO Y DE ALCANCE AL CONTRATO MARCO
=====================================================

Fecha: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
Cliente: ${clientName}
Proveedor: UHURA GROUP S.A.S. (NIT 901.458.921-3)
Servicio: ${serviceTitle}
Versión de Alcance: ${quote.versionLabel}

-----------------------------------------------------
1. OBJETO DEL DOCUMENTO
-----------------------------------------------------
${objective}

-----------------------------------------------------
2. ALCANCE Y ENTREGABLES FORMALES
-----------------------------------------------------
${deliverablesSummary}

-----------------------------------------------------
3. CRONOGRAMA ESTIMADO
-----------------------------------------------------
${scheduleNotes}

-----------------------------------------------------
4. EXCLUSIONES EXPLÍCITAS
-----------------------------------------------------
${exclusions}

-----------------------------------------------------
5. VALOR DEL SERVICIO Y FORMA DE PAGO
-----------------------------------------------------
Valor Total Acordado: ${formattedPrice} COP (+ IVA si aplica)

Términos de Pago:
${paymentTerms}

-----------------------------------------------------
6. APROBACIÓN Y FIRMAS CONTRACTUALES
-----------------------------------------------------
Firma legal mediante ${signatureProvider}.

Por UHURA GROUP S.A.S.              Por ${clientName}
Firma: ________________________     Firma: ________________________
Nombre: ${signerName}               Nombre: ${opportunity.contactName || 'Representante Legal'}
Cargo: ${signerRole}                Cargo: Cliente / Representante Autorizado
Fecha: ____ / ____ / ________       Fecha: ____ / ____ / ________

Nota: El líder responsable de scoping (${opportunity.leadUserName || 'Líder de Scoping'}) coordina la solución y dimensionamiento técnico. La representación legal contractual corresponde a ${signerName} (${signerRole}).
`;

    navigator.clipboard.writeText(fullSowText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAndClose = () => {
    if (onSaveSOWData) {
      onSaveSOWData({
        title: `SOW - ${serviceTitle}`,
        clientName,
        serviceName: serviceTitle,
        objective,
        deliverablesScope: deliverablesSummary,
        scheduleNotes,
        exclusions,
        commercialValueFormatted: formattedPrice,
        paymentTerms,
        status: opportunity.sowData?.status || 'ready_for_review',
        sowSigner: signerName,
        sowSignerRole: signerRole,
        signatureProvider: signatureProvider,
        signatureReferenceUrl: opportunity.sowData?.signatureReferenceUrl,
        signedDocUrl: opportunity.sowData?.signedDocUrl,
        lastUpdatedAt: new Date().toISOString()
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#e2e8f0] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header con barra de herramientas */}
        <div className="p-4 bg-[#1e113a] text-white flex items-center justify-between border-b border-[#261845]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#8a4dff]/25 text-[#d4ff4a]">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Statement of Work (SOW)</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-[#c9b7ff]">
                  Plantilla Contractual
                </span>
              </div>
              <p className="text-xs text-[#c9b7ff]">
                {clientName} · {serviceTitle} (Versión: {quote.versionLabel})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                copied
                  ? 'bg-[#10b981] text-white shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Copiar texto listo para pegar en Google Docs"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar para Docs'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Imprimir o exportar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#c9b7ff] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nota de confidencialidad y secreto operativo */}
        <div className="bg-[#eff6ff] px-5 py-2.5 border-b border-[#bfdbfe] flex items-center justify-between text-xs text-[#1e40af]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2563eb] shrink-0" />
            <span>
              <strong>Gobernanza de Alcance:</strong> El SOW expone entregables y actividades formales, 
              <strong> protegiendo las horas y tarifas internas por rol</strong> (secreto operativo de Uhura).
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-[#93c5fd]">
            {quote.deliverables.length} Entregables · {formattedPrice} COP
          </span>
        </div>

        {/* Cuerpo del Documento (Hoja de Estilo Formal) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#f8fafc]">
          <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm space-y-6 text-xs text-[#1e293b] leading-relaxed max-w-3xl mx-auto">
            {/* Membrete formal de Uhura */}
            <div className="border-b border-[#e2e8f0] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-[#0f172a]">UHURA GROUP S.A.S.</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#475569]">
                    NIT 901.458.921-3
                  </span>
                </div>
                <p className="text-[11px] text-[#64748b]">
                  Agencia de Producto Digital, Tecnología & Growth
                </p>
                <p className="text-[11px] text-[#64748b]">
                  Medellín / Bogotá, Colombia · legal@uhuragroup.com
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748b] block">
                  STATEMENT OF WORK
                </span>
                <span className="font-mono font-bold text-xs text-[#501f92]">
                  SOW-{opportunity.id.slice(-6).toUpperCase()}
                </span>
                <p className="text-[11px] text-[#64748b]">
                  Fecha: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* 1. Partes y Objeto */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[#0f172a] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                1. Objeto del Acuerdo
              </h4>
              <p className="text-[#475569]">
                El presente anexo técnico formaliza los términos de alcance, entregables y compromisos pactados entre{' '}
                <strong>UHURA GROUP S.A.S.</strong> y <strong>{clientName}</strong> para el proyecto{' '}
                <strong>"{serviceTitle}"</strong>.
              </p>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-[#cbd5e1] text-xs focus:ring-2 focus:ring-[#501f92] bg-[#fdfefe]"
                placeholder="Objetivo del proyecto..."
              />
            </div>

            {/* 2. Alcance y Entregables Formales */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#0f172a] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                2. Alcance y Entregables Formales
              </h4>
              <p className="text-[#475569]">
                Uhura ejecutará y entregará los siguientes componentes detallados según la cotización aprobada:
              </p>

              <div className="space-y-3">
                {quote.deliverables.map((del, idx) => (
                  <div key={del.id} className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0f172a] text-xs">
                        {idx + 1}. {del.name}
                      </span>
                      <span className="text-[10px] font-semibold text-[#64748b]">
                        {del.backlogItems.length} actividades contempladas
                      </span>
                    </div>
                    {del.description && (
                      <p className="text-[11px] text-[#64748b] italic">{del.description}</p>
                    )}
                    <ul className="list-disc list-inside space-y-1 text-[#334155] pl-1">
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

            {/* 3. Cronograma Estimado */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[#0f172a] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                3. Cronograma Estimado
              </h4>
              <textarea
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border border-[#cbd5e1] text-xs focus:ring-2 focus:ring-[#501f92] bg-[#fdfefe]"
                placeholder="Notas de cronograma..."
              />
            </div>

            {/* 4. Exclusiones de Alcance */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[#0f172a] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                4. Exclusiones de Alcance
              </h4>
              <p className="text-[11px] text-[#64748b]">
                Para proteger la certidumbre operativa, los siguientes conceptos quedan expresamente excluidos salvo acuerdo adicional:
              </p>
              <textarea
                value={exclusions}
                onChange={(e) => setExclusiones(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-[#cbd5e1] text-xs focus:ring-2 focus:ring-[#501f92] bg-[#fdfefe]"
                placeholder="Exclusiones..."
              />
            </div>

            {/* 5. Inversión y Forma de Pago */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[#0f172a] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#501f92]" />
                5. Inversión Comercial y Condiciones de Pago
              </h4>
              <div className="p-4 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#501f92] tracking-wider block">
                    Valor Total del Contrato
                  </span>
                  <span className="text-base font-extrabold text-[#0f172a]">{formattedPrice} COP</span>
                  <span className="text-[11px] text-[#64748b] block">(Valores antes de IVA)</span>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#501f92]/10 text-[#501f92]">
                  Moneda Oficial: Pesos Colombianos (COP)
                </span>
              </div>
              <textarea
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-[#cbd5e1] text-xs focus:ring-2 focus:ring-[#501f92] bg-[#fdfefe]"
                placeholder="Términos de pago..."
              />
            </div>

            {/* 6. Espacio para Firmas */}
            <div className="border-t border-[#e2e8f0] pt-6 space-y-4">
              <div className="flex items-center justify-between text-[11px] text-[#64748b] bg-[#f8fafc] p-2.5 rounded-xl border border-[#e2e8f0]">
                <span>
                  🔐 <strong>Firma Contractual Legal:</strong> Proveedor electrónico <strong>{signatureProvider}</strong>.
                </span>
                <span>
                  Líder de Scoping: <strong className="text-[#0f172a]">{opportunity.leadUserName || 'Líder Asignado'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
                <div className="space-y-4">
                  <div className="h-16 border-b border-dashed border-[#94a3b8] flex items-end pb-1">
                    <span className="text-[10px] text-[#94a3b8] font-mono">{signatureProvider} (UHURA)</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a]">Por UHURA GROUP S.A.S.</p>
                    <p className="text-xs font-semibold text-[#501f92]">{signerName}</p>
                    <p className="text-[11px] text-[#64748b]">{signerRole}</p>
                    <p className="text-[10px] text-[#94a3b8]">Medellín / Bogotá, Colombia</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-16 border-b border-dashed border-[#94a3b8] flex items-end pb-1">
                    <span className="text-[10px] text-[#94a3b8] font-mono">{signatureProvider} (Cliente)</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#0f172a]">Por {clientName}</p>
                    <p className="text-xs font-semibold text-[#0f172a]">
                      {opportunity.contactName || 'Representante Legal / Autorizado'}
                    </p>
                    <p className="text-[11px] text-[#64748b]">Aceptación Contractual</p>
                    <p className="text-[10px] text-[#94a3b8]">Firma Electrónica</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicador de archivo en Drive */}
            <div className="p-3.5 rounded-xl bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#475569]">
              <span>
                📁 <strong>Almacenamiento estándar:</strong> Guarda el PDF firmado por el cliente en{' '}
                <strong className="text-[#0f172a]">02. DOCUMENTOS ADMINISTRATIVOS</strong> dentro del Drive del cliente.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#e2e8f0] flex items-center justify-between">
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-bold text-[#0f172a] transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4 text-[#501f92]" />
              <span>Copiar para Google Docs</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndClose}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#501f92] hover:bg-[#3b156b] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#d4ff4a]" />
              <span>Guardar SOW en Oportunidad</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
