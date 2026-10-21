/**
 * SOW Engine & Templates para UHURA S.A.S.
 * 
 * Modelado a partir de los documentos reales de alcance (SOWs) de Uhura:
 * - Battsaver (Tienda Online Shopify)
 * - Choucair (Rediseño, Optimización y Activación Web en WordPress)
 * 
 * Genera automáticamente documentos blindados con:
 * 1. Tabla de metadatos formales (Cliente, NIT, OC, Supervisores, Proveedor UHURA S.A.S.)
 * 2. Antecedentes y Objetivos de negocio
 * 3. Alcance funcional estructurado por entregables y actividades del scoper
 * 4. Matriz de Riesgos y Plan de Mitigación Obligatoria (Tabla 3 columnas)
 * 5. Gates con Cláusula de Congelamiento y Cláusula de Silencio Positivo
 * 6. Cláusula de Inteligencia Artificial y Tecnologías Automatizadas (Confidencialidad & Ética)
 * 7. Tratamiento de Datos Personales (SIC / Ley 1581)
 * 8. Gestión de Cambios (Change Request con tarifa de horas a demanda)
 * 9. Exclusiones Taxativas del Proyecto
 * 10. Inversión y Forma de Pago (50% anticipo / 50% UAT)
 * 11. Anexo de SLA, Garantía Extendida de 6 Meses y Protocolo de Peritaje Técnico
 * 12. Bloque de Aceptación y Firmas Contractuales (Cliente vs Uhura)
 * 
 * Regla de Oro: Los datos faltantes se marcan visualmente como [COMPLETAR: ...]
 * para que el equipo comercial identifique de inmediato qué rellenar al pegar en Docs.
 */

import { NewBusinessOpportunity, QuoteProposal } from '../types';
import { formatCurrency } from '../../../utils/formatters';

export type SowArchetype = 'ecommerce_shopify' | 'web_wordpress' | 'custom_app';

export interface SowRiskRow {
  risk: string;
  impact: 'Alto' | 'Medio' | 'Alto / Crítico';
  mitigation: string;
}

export interface SowGate {
  id: string;
  name: string;
  uhuraAction: string;
  clientAction: string;
  expectedResult: string;
  freezeClause?: string;
  positiveSilenceClause?: string;
}

/**
 * Detecta automáticamente el arquetipo de solución a partir del título o entregables
 */
export function detectSowArchetype(opportunity: NewBusinessOpportunity, quote?: QuoteProposal): SowArchetype {
  const text = `${opportunity.title} ${opportunity.discoveryNotes || ''} ${
    quote?.deliverables.map((d) => `${d.name} ${d.description || ''}`).join(' ') || ''
  }`.toLowerCase();

  if (
    text.includes('shopify') ||
    text.includes('tienda') ||
    text.includes('ecommerce') ||
    text.includes('e-commerce') ||
    text.includes('carrito') ||
    text.includes('checkout') ||
    text.includes('wompi') ||
    text.includes('battsaver')
  ) {
    return 'ecommerce_shopify';
  }

  if (
    text.includes('wordpress') ||
    text.includes('rediseño') ||
    text.includes('portal') ||
    text.includes('institucional') ||
    text.includes('choucair') ||
    text.includes('landing') ||
    text.includes('sitio web') ||
    text.includes('web')
  ) {
    return 'web_wordpress';
  }

  return 'custom_app';
}

/**
 * Matriz de riesgos predeterminada oficial de Uhura
 */
export function getDefaultSowRisks(clientName: string, archetype: SowArchetype): SowRiskRow[] {
  const commonRisks: SowRiskRow[] = [
    {
      risk: `Entrega tardía de insumos, contenidos, copias de texto clave o credenciales técnicas por parte de ${clientName}.`,
      impact: 'Alto',
      mitigation: `CLIENTE: Entregar oportunamente los accesos, información y contenidos definidos en el cronograma.\nUHURA: Avanzará temporalmente con maquetación genérica y placeholders para validar arquitectura. Si el retraso supera cinco (5) días hábiles, se congelará el cronograma de entregas y requerirá reprogramación.`
    },
    {
      risk: 'Cambios de alcance visual o estructural posteriores a la firma y aprobación formal del Gate 1.',
      impact: 'Alto',
      mitigation: `AMBAS PARTES: Una vez aprobado el Gate 1, se congelará la arquitectura y diseño visual. Cualquier requerimiento de cambios estructurales, adición de páginas o módulos inéditos se gestionará formalmente mediante Orden de Cambio (Change Request) y reestimación de costos.`
    },
    {
      risk: 'Feedback disperso, descoordinado o fuera del plazo por parte de diferentes miembros del equipo del cliente.',
      impact: 'Medio',
      mitigation: `CLIENTE: Designará un único responsable (Supervisor del Cliente) encargado de centralizar, consensuar y emitir el único documento formal de feedback técnico y de diseño. UHURA no procesará feedback proveniente de múltiples canales o personas de forma dispersa.`
    },
    {
      risk: 'No disponibilidad del personal del cliente para realizar pruebas y validación final UAT.',
      impact: 'Alto',
      mitigation: `CLIENTE: Designar personal de pruebas o backup disponible en la ventana de validación pactada.\nUHURA: Aplicará la cláusula de Silencio Positivo: si tras vencer el plazo pactado no se emiten observaciones formales por escrito, se dará por aprobado el hito a satisfacción para paso a producción y facturación.`
    }
  ];

  if (archetype === 'ecommerce_shopify') {
    commonRisks.push({
      risk: 'Demoras en configuración de pasarelas de pago (Wompi/MercadoPago) o logística externa.',
      impact: 'Medio',
      mitigation: `CLIENTE: Gestionar oportunamente apertura y verificación de cuenta bancaria y pasarela de pago, proveyendo credenciales.\nUHURA: Apoyar y guiar técnicamente al cliente en la vinculación e integración.`
    });
  } else {
    commonRisks.push({
      risk: 'Demoras en aprovisionamiento de hosting, servidores DNS o dominios corporativos del cliente.',
      impact: 'Medio',
      mitigation: `CLIENTE: Proveer credenciales de administrador de hosting o registros DNS con al menos cinco (5) días hábiles de anticipación a la fecha de lanzamiento.\nUHURA: Proveer guía técnica de configuración de registros A y CNAME.`
    });
  }

  return commonRisks;
}

/**
 * Compuertas de control (Gates) estándar de Uhura
 */
export function getDefaultSowGates(clientName: string, archetype: SowArchetype, estimatedWeeks: number): SowGate[] {
  if (archetype === 'ecommerce_shopify') {
    return [
      {
        id: 'gate-1',
        name: 'GATE 1 – Arquitectura y Wireframes Aprobados',
        uhuraAction: 'UHURA presentará: Template Shopify seleccionado con estructura de Home, PDP (Ficha de Producto), PLP (Catálogo), Blog, navegación responsive y distribución de bloques de contenido.',
        clientAction: `${clientName} dispondrá de cinco (5) días hábiles para validar y consolidar sus observaciones en un único documento de feedback.`,
        expectedResult: 'Aprobación formal firmada. Da luz verde a UHURA para iniciar la configuración técnica de la tienda sobre Shopify.',
        freezeClause: 'CLÁUSULA DE CONGELAMIENTO: Una vez aprobado este Gate, se congela la arquitectura, navegación y estructura modular. Cualquier solicitud posterior de nuevas páginas o funcionalidades será tramitada vía Change Request.'
      },
      {
        id: 'gate-2',
        name: 'GATE 2 – Recepción de Materiales e Insumos Finales',
        uhuraAction: 'Revisión técnica de compatibilidad, formatos de compresión web y cobertura de espacios definidos en Gate 1.',
        clientAction: `${clientName} entrega banners finales, fotografías de producto en alta resolución, textos definitivos y accesos a pasarelas.`,
        expectedResult: 'Insumos visuales cerrados. UHURA inicia la implementación visual final y montaje de catálogo en Shopify.'
      },
      {
        id: 'gate-3',
        name: 'GATE 3 – Validación Funcional (UAT - User Acceptance Testing)',
        uhuraAction: 'UHURA entregará una versión estable de la tienda en ambiente de pruebas (Staging / URL protegida) para validación integral del cliente.',
        clientAction: `${clientName} dispondrá de cinco (5) días hábiles para ejecutar pruebas funcionales de navegación, carrito, pasarela y checkout responsive.`,
        expectedResult: 'Firma de Acta de Aceptación Técnica.',
        positiveSilenceClause: 'CLÁUSULA DE SILENCIO POSITIVO: Si transcurridos cinco (5) días hábiles desde la entrega del ambiente de pruebas el cliente no emite observaciones formales consolidadas, el hito se considerará aprobado a satisfacción para facturación y paso a Go-Live.'
      },
      {
        id: 'gate-4',
        name: 'GATE 4 – Go Live & Despliegue en Producción',
        uhuraAction: 'Publicación en dominio principal, configuración de pasarela productiva, verificación de analítica (GA4/GTM) y entrega de sesión de capacitación grabada.',
        clientAction: 'Recepción formal de accesos y credenciales maestras.',
        expectedResult: 'Paso oficial a producción y activación del período de garantía técnica de seis (6) meses.'
      }
    ];
  }

  // Web Institucional / WordPress (Choucair standard)
  return [
    {
      id: 'gate-1',
      name: 'GATE 1 – Prototipo y Arquitectura de Experiencia Aprobada',
      uhuraAction: 'UHURA presentará: Propuesta de arquitectura de contenidos, mapa de navegación y prototipo navegable (Figma o Staging) con aplicación de estética visual corporativa y contenidos SEO iniciales.',
      clientAction: `${clientName} revisará la propuesta de arquitectura, usabilidad y navegación en una ventana máxima de hasta diez (10) días hábiles.`,
      expectedResult: `Aprobación firmada por el Supervisor de ${clientName}. Se congela por completo la estructura visual, arquitectura y contenido base, dando luz verde a UHURA para configuración técnica de código.`,
      freezeClause: 'CLÁUSULA DE CONGELAMIENTO: No se admitirán solicitudes de cambios estructurales, rediseños visuales o alteraciones estéticas base posteriores a este Gate. De ocurrir, serán tramitados bajo Change Request.'
    },
    {
      id: 'gate-2',
      name: 'GATE 2 – Implementación en Staging (URL Temporal) y UAT',
      uhuraAction: 'Entrega formal del portal funcional en ambiente de pruebas (Staging), optimizado para velocidad (Core Web Vitals), con SEO técnico y Matriz de Trazabilidad Técnica (versiones de CMS, PHP y plugins).',
      clientAction: `${clientName} ejecutará pruebas de navegación, formularios y comportamiento responsive en un plazo de hasta diez (10) días hábiles, emitiendo un único documento consolidado.`,
      expectedResult: 'Firma del Acta de Cierre a satisfacción. Tras su firma, el portal es publicado oficialmente a producción, se entregan credenciales y entra en vigor la garantía de seis (6) meses.',
      positiveSilenceClause: 'CLÁUSULA DE SILENCIO POSITIVO: En caso de no reportarse observaciones consolidadas en el plazo estipulado de 10 días hábiles, se dará por aprobado el hito a satisfacción y UHURA procederá con la facturación y salida a producción.'
    }
  ];
}

/**
 * Helper para renderizar campos pendientes con formato visual claro
 */
export function renderPlaceholder(value: string | undefined | null, fieldLabel: string, format: 'html' | 'text' | 'ui'): string {
  const isFilled = Boolean(value && value.trim().length > 0 && !value.includes('[COMPLETAR:'));
  if (isFilled) {
    return value!.trim();
  }

  const tag = `[COMPLETAR: ${fieldLabel}]`;
  if (format === 'html') {
    return `<span style="background-color: #fef08a; color: #854d0e; padding: 2px 6px; border-radius: 4px; font-weight: bold; border: 1px dashed #eab308; font-family: monospace;">${tag}</span>`;
  }
  if (format === 'text') {
    return `**${tag}**`;
  }
  return tag;
}

/**
 * Generador de contenido completo estructurado en formato TEXTO / MARKDOWN
 */
export function buildSowPlainText(params: {
  documentVersion?: string;
  opportunity: NewBusinessOpportunity;
  quote: QuoteProposal;
  clientNit?: string;
  orderNumber?: string;
  supervisorClient?: string;
  supervisorClientRole?: string;
  supervisorProvider?: string;
  clientRepresentative?: string;
  clientRepresentativeId?: string;
  clientRepresentativeRole?: string;
  sowSigner?: string;
  sowSignerRole?: string;
  sowSignerId?: string;
  providerCompany?: string;
  providerNit?: string;
  objective?: string;
  scheduleNotes?: string;
  exclusions?: string;
  paymentTerms?: string;
  archetype?: SowArchetype;
}): string {
  const { opportunity, quote } = params;
  const clientName = opportunity.prospectAccountName || 'Cliente';
  const serviceTitle = opportunity.title || 'Servicio de Desarrollo & Producto Digital';
  const archetype = params.archetype || detectSowArchetype(opportunity, quote);
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

  // Metadata formal
  const clientNitText = renderPlaceholder(params.clientNit, 'NIT del Cliente', 'text');
  const ocText = params.orderNumber?.trim() ? params.orderNumber.trim() : renderPlaceholder(params.orderNumber, 'No. Orden de Compra (OC)', 'text');
  const supervisorClientText = renderPlaceholder(params.supervisorClient, 'Nombre y Cargo del Supervisor del Cliente', 'text');
  const supervisorProviderText = params.supervisorProvider?.trim() || 'Luisa Fernanda Urazán Prieto (Especialista en Relacionamiento) / Catalina Tejada';
  const clientRepText = renderPlaceholder(params.clientRepresentative, 'Nombre Representante Legal del Cliente', 'text');
  const clientRepIdText = renderPlaceholder(params.clientRepresentativeId, 'C.C. / ID Representante Legal del Cliente', 'text');
  const clientRepRoleText = params.clientRepresentativeRole?.trim() || 'Representante Legal / Gerente General';

  const providerCompany = params.providerCompany || 'UHURA S.A.S.';
  const providerNit = params.providerNit || '901.093.070-2';
  const sowSigner = params.sowSigner || 'Álvaro Antonio Gómez Machuca';
  const sowSignerRole = params.sowSignerRole || 'Representante Legal / Gerente General';
  const sowSignerId = params.sowSignerId || 'C.C. No. 80.419.145';

  const risks = getDefaultSowRisks(clientName, archetype);
  const gates = getDefaultSowGates(clientName, archetype, estimatedWeeks);

  // Entregables
  const deliverablesSummary = quote.deliverables
    .map((del, dIdx) => {
      const activitiesList = del.backlogItems
        .map((act) => `  - ${act.title}${act.description ? `: ${act.description}` : ''}`)
        .join('\n');
      return `2.${dIdx + 1}. ${del.name}${del.description ? `\n   ${del.description}` : ''}\n${activitiesList}`;
    })
    .join('\n\n');

  const defaultObjective =
    params.objective ||
    (archetype === 'ecommerce_shopify'
      ? `${clientName} busca lanzar su canal de venta digital mediante una tienda online desarrollada sobre Shopify.\nEl objetivo central es construir una experiencia ecommerce moderna enfocada en generar confianza, facilitar la compra y crear una plataforma administrable y escalable para futuras campañas comerciales.`
      : `El objetivo central de este proyecto es el diseño, desarrollo, optimización y activación del proyecto institucional para ${clientName}. Este portal estará enfocado en optimizar la experiencia de usuario (UX/UI), garantizar alta velocidad de carga (Core Web Vitals) y construir una plataforma autoadministrable.`);

  return `================================================================================
DOCUMENTO DE ALCANCE (SOW) - ${serviceTitle.toUpperCase()}
================================================================================
CLIENTE: ${clientName}
NIT CLIENTE: ${clientNitText}
PROVEEDOR: ${providerCompany}
NIT PROVEEDOR: ${providerNit}
FECHA DE EMISIÓN: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
ORDEN DE COMPRA: ${ocText}
VERSIÓN DEL SOW: ${params.documentVersion || '1.0'}
SUPERVISOR CLIENTE: ${supervisorClientText}
SUPERVISOR PROVEEDOR: ${supervisorProviderText}
================================================================================

1. ANTECEDENTES Y OBJETIVO
${defaultObjective}

2. ALCANCE FUNCIONAL Y ESTRUCTURA DE ENTREGABLES
${deliverablesSummary || 'Detalle de entregables derivado del dimensionamiento técnico formal.'}

3. RESPONSABILIDADES Y ENTREGA DE INSUMOS
3.1. Responsabilidad de ${clientName} (El Cliente):
- Suministrar oportunamente textos definitivos, insumos gráficos de marca y accesos técnicos (hosting, DNS, plataformas de pago).
- Designar un Supervisor oficial encargado de la consolidación de feedback y aprobaciones formales.
- Garantizar la revisión de entregables dentro de los tiempos estipulados por Gate de control.

3.2. Responsabilidad de ${providerCompany} (El Proveedor):
- Diseño de arquitectura de experiencia y construcción técnica de la solución.
- Configuración de analítica base (Google Analytics 4, Tag Manager) y optimización de rendimiento.
- Capacitación y transferencia de conocimiento grabada al equipo del cliente.

4. CONFIGURACIONES E INTEGRACIONES
- Analítica: Google Analytics 4 (GA4), Google Tag Manager (GTM) y Microsoft Clarity.
- Conversión y Leads: Configuración de eventos clave de contacto o pasarela de pago según aplique.
- Licencias y costos de suscripción de plataformas de terceros son asumidas por el cliente.

5. ENTREGABLES DEFINITIVOS DEL PROYECTO
${quote.deliverables.map((d, i) => `• Entregable ${i + 1}: ${d.name} (${d.backlogItems.length} componentes certificados)`).join('\n')}
• Sesión de capacitación grabada en administración de contenidos.
• Matriz de Trazabilidad Técnica con snapshot de versiones y credenciales.

6. PROTOCOLO DE PRUEBAS Y VALIDACIÓN (UAT)
- Ambiente de Staging Dedicado: UHURA entregará una versión funcional en URL temporal de pruebas.
- Ventana de Validación: El cliente dispondrá de cinco (5) a diez (10) días hábiles para consolidar observaciones.
- Límite de Observaciones: Exclusivo para errores de funcionamiento o inconsistencias frente a este documento. Solicitudes de nuevas secciones o ideas inéditas se tramitarán vía Change Request.
- Cláusula de Silencio Positivo: Si transcurrido el plazo formal el cliente no emite observaciones formales por escrito, el hito se entenderá por aprobado a satisfacción y UHURA procederá con la facturación y salida a producción.

7. MATRIZ DE RIESGOS Y PLAN DE MITIGACIÓN (OBLIGATORIO)
${risks.map((r, i) => `[Riesgo ${i + 1} - Impacto: ${r.impact}]
- Riesgo: ${r.risk}
- Mitigación / Responsable: ${r.mitigation}`).join('\n\n')}

8. GATES Y CONTROL DEL PROYECTO
${gates.map((g) => `• ${g.name}
  - Acción UHURA: ${g.uhuraAction}
  - Acción Cliente: ${g.clientAction}
  - Resultado: ${g.expectedResult}
  ${g.freezeClause ? `\n  - ${g.freezeClause}` : ''}
  ${g.positiveSilenceClause ? `\n  - ${g.positiveSilenceClause}` : ''}`).join('\n\n')}

9. USO DE INTELIGENCIA ARTIFICIAL Y TECNOLOGÍAS AUTOMATIZADAS
9.1. Optimización: El CLIENTE acepta que UHURA podrá utilizar herramientas de Inteligencia Artificial (IA) generativa y predictiva para la optimización de código, estructuración de contenido y análisis de datos durante la ejecución del proyecto.
9.2. Confidencialidad en IA: UHURA garantiza que NO utilizará datos sensibles, secretos industriales ni información confidencial del CLIENTE para entrenar modelos públicos de IA. Toda interacción con estas herramientas se realiza bajo protocolos estrictos de anonimización.
9.3. Responsabilidad de Resultados: Aunque la IA asiste en el proceso, UHURA mantiene la responsabilidad final sobre la calidad, funcionalidad y seguridad del código entregado, habiendo realizado la curaduría y revisión humana correspondiente.

10. RESPONSABILIDAD DEL CLIENTE Y TRATAMIENTO DE DATOS
10.1. El CLIENTE declara ser el único "Responsable del Tratamiento" de los datos personales recolectados a través de la plataforma (Ley 1581 de 2012 de Colombia). UHURA actúa exclusivamente como "Encargado del Tratamiento" a nivel técnico durante la implementación.
10.2. UHURA no asume responsabilidad por la redacción de Políticas de Privacidad ni por reclamaciones ante la SIC. Los textos legales deben ser suministrados por el CLIENTE.

11. GESTIÓN DE CAMBIOS (CHANGE REQUEST)
Toda solicitud que implique cambios sobre alcance aprobado, nuevas funcionalidades o alteraciones a módulos congelados será tramitada vía Change Request:
1. Análisis de impacto técnico y cronograma.
2. Estimación económica bajo tarifa de horas a demanda acordada ($226.395 COP/hora + IVA).
3. La ejecución únicamente iniciará con la aprobación formal por escrito de la respectiva Orden de Cambio.

12. EXCLUSIONES DEL PROYECTO
- Mantenimiento continuo o soporte no cubierto por la garantía técnica.
- Desarrollos a medida complejos no especificados explícitamente en la sección 2.
- Costos de licencias, hosting, pasarelas de pago y operadores externos.
- Rondas de ajustes ilimitadas (el feedback se consolida estrictamente en las ventanas de los Gates).

13. INVERSIÓN Y FORMA DE PAGO
El valor total del proyecto es de ${formattedPrice} COP antes de IVA, más el IVA del 19% vigente (${ivaValue} COP), para un total con IVA de ${totalWithIva} COP.
Forma de pago acordada:
- 50% de anticipo (${halfPayment} COP antes de IVA) a la firma del presente SOW y kick-off del proyecto.
- 50% final (${halfPayment} COP antes de IVA) a la finalización y aprobación del entregable final (UAT / Gate de cierre).

14. ANEXO: ACUERDO DE NIVEL DE SERVICIO (SLA) Y EXTENSIÓN DE GARANTÍA (6 MESES)
- Vigencia de 6 meses calendario a partir de la firma del Acta de Cierre / Salida a Producción.
- Cobertura: Maquetación responsive en navegadores modernos oficiales y fallos en la lógica interna desarrollada por UHURA.
- Exclusiones directas: Incompatibilidades generadas por actualizaciones automáticas de terceros, manipulación indebida de código por personal del cliente o factores de infraestructura externa.
- Protocolo de Peritaje: Ventana de respuesta de ocho (8) horas laborales. Si el fallo es atribuible a UHURA, se asume el 100% de la corrección; si obedece a factores externos, se factura bajo tarifa de hora a demanda previa notificación.

================================================================================
ACEPTACIÓN DEL DOCUMENTO DE ALCANCE (SOW)
================================================================================
Al firmar este documento, ambas partes aceptan de común acuerdo las condiciones, alcances, exclusiones, cronogramas y compromisos financieros detallados en el presente Statement of Work:

POR EL CLIENTE:                               POR EL PROVEEDOR:
${clientName}                                 ${providerCompany} (NIT ${providerNit})

__________________________________________    __________________________________________
Firma del Representante Legal                 Firma del Representante Legal
Nombre: ${clientRepText}                      Nombre: ${sowSigner}
Cargo: ${clientRepRoleText}                   Cargo: ${sowSignerRole}
Identificación: ${clientRepIdText}            Identificación: ${sowSignerId}
Fecha: ____ / ____ / ________                 Fecha: ____ / ____ / ________
`;
}

/**
 * Generador de contenido enriquecido en formato HTML
 * Listo para copiar al Portapapeles (text/html) y pegar directamente en Google Docs
 * manteniendo tablas, encabezados púrpuras y callouts limpios.
 */
export function buildSowHtml(params: {
  documentVersion?: string;
  opportunity: NewBusinessOpportunity;
  quote: QuoteProposal;
  clientNit?: string;
  orderNumber?: string;
  supervisorClient?: string;
  supervisorClientRole?: string;
  supervisorProvider?: string;
  clientRepresentative?: string;
  clientRepresentativeId?: string;
  clientRepresentativeRole?: string;
  sowSigner?: string;
  sowSignerRole?: string;
  sowSignerId?: string;
  providerCompany?: string;
  providerNit?: string;
  objective?: string;
  scheduleNotes?: string;
  exclusions?: string;
  paymentTerms?: string;
  archetype?: SowArchetype;
}): string {
  const { opportunity, quote } = params;
  const clientName = opportunity.prospectAccountName || 'Cliente';
  const serviceTitle = opportunity.title || 'Servicio de Desarrollo & Producto Digital';
  const archetype = params.archetype || detectSowArchetype(opportunity, quote);
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

  // Metadata formal
  const clientNitHtml = renderPlaceholder(params.clientNit, 'NIT del Cliente', 'html');
  const ocHtml = params.orderNumber?.trim() ? params.orderNumber.trim() : renderPlaceholder(params.orderNumber, 'No. Orden de Compra (OC)', 'html');
  const supervisorClientHtml = renderPlaceholder(params.supervisorClient, 'Nombre y Cargo del Supervisor del Cliente', 'html');
  const supervisorProviderText = params.supervisorProvider?.trim() || 'Luisa Fernanda Urazán Prieto (Especialista en Relacionamiento) / Catalina Tejada';
  const clientRepHtml = renderPlaceholder(params.clientRepresentative, 'Nombre Representante Legal del Cliente', 'html');
  const clientRepIdHtml = renderPlaceholder(params.clientRepresentativeId, 'C.C. / ID Representante Legal del Cliente', 'html');
  const clientRepRoleText = params.clientRepresentativeRole?.trim() || 'Representante Legal / Gerente General';

  const providerCompany = params.providerCompany || 'UHURA S.A.S.';
  const providerNit = params.providerNit || '901.093.070-2';
  const sowSigner = params.sowSigner || 'Álvaro Antonio Gómez Machuca';
  const sowSignerRole = params.sowSignerRole || 'Representante Legal / Gerente General';
  const sowSignerId = params.sowSignerId || 'C.C. No. 80.419.145';

  const risks = getDefaultSowRisks(clientName, archetype);
  const gates = getDefaultSowGates(clientName, archetype, estimatedWeeks);

  const defaultObjective =
    params.objective ||
    (archetype === 'ecommerce_shopify'
      ? `${clientName} busca lanzar su canal de venta digital mediante una tienda online desarrollada sobre Shopify.<br/><br/>El objetivo central del proyecto es construir una experiencia ecommerce moderna enfocada en generar confianza en la categoría, facilitar la compra y crear una plataforma administrable y escalable para futuras campañas comerciales.`
      : `El objetivo central de este proyecto es el rediseño, desarrollo, optimización y activación del nuevo portal institucional para ${clientName}. Este portal estará enfocado en optimizar la experiencia del usuario (UX/UI), mejorar la velocidad de carga (Core Web Vitals) y garantizar una administración independiente y ágil.`);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SOW - ${serviceTitle}</title>
  <style>
    body { font-family: 'Arial', sans-serif; color: #1e293b; line-height: 1.6; font-size: 11pt; }
    h1 { color: #501f92; font-size: 18pt; margin-bottom: 4px; text-transform: uppercase; border-bottom: 2px solid #501f92; padding-bottom: 6px; }
    h2 { color: #501f92; font-size: 13pt; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    h3 { color: #0f172a; font-size: 11pt; margin-top: 14px; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 16px; font-size: 10pt; }
    th { background-color: #501f92; color: #ffffff; text-align: left; padding: 8px; border: 1px solid #43177d; font-weight: bold; }
    td { padding: 8px; border: 1px solid #cbd5e1; vertical-align: top; }
    tr:nth-child(even) td { background-color: #f8fafc; }
    .meta-table td { padding: 6px 10px; border: 1px solid #e2e8f0; }
    .meta-table strong { color: #501f92; }
    .badge-callout { background-color: #f8fafc; border-left: 4px solid #501f92; padding: 10px 14px; margin: 12px 0; }
    .freeze-alert { background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 8px 12px; margin: 8px 0; color: #9a3412; font-size: 9.5pt; }
    .silence-alert { background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 8px 12px; margin: 8px 0; color: #065f46; font-size: 9.5pt; }
    .signature-box { border-top: 1px solid #94a3b8; width: 85%; margin-top: 50px; padding-top: 6px; }
  </style>
</head>
<body>

<h1>DOCUMENTO DE ALCANCE (SOW)</h1>
<p style="font-size: 13pt; font-weight: bold; color: #334155; margin-top: 0;">${serviceTitle}</p>

<table class="meta-table">
  <tr>
    <td style="width: 25%;"><strong>CLIENTE:</strong></td>
    <td style="width: 25%;">${clientName}</td>
    <td style="width: 25%;"><strong>NIT CLIENTE:</strong></td>
    <td style="width: 25%;">${clientNitHtml}</td>
  </tr>
  <tr>
    <td><strong>PROVEEDOR:</strong></td>
    <td>${providerCompany}</td>
    <td><strong>NIT PROVEEDOR:</strong></td>
    <td>${providerNit}</td>
  </tr>
  <tr>
    <td><strong>FECHA DE EMISIÓN:</strong></td>
    <td>${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
    <td><strong>ORDEN DE COMPRA:</strong></td>
    <td>${ocHtml}</td>
  </tr>
  <tr>
    <td><strong>VERSIÓN DEL SOW:</strong></td>
    <td>${params.documentVersion || '1.0'}</td>
    <td><strong>TIPO DE PROYECTO:</strong></td>
    <td>${archetype === 'ecommerce_shopify' ? 'Ecommerce Shopify' : archetype === 'web_wordpress' ? 'Portal Web WordPress' : 'Desarrollo a Medida'}</td>
  </tr>
  <tr>
    <td><strong>SUPERVISOR CLIENTE:</strong></td>
    <td>${supervisorClientHtml}</td>
    <td><strong>SUPERVISOR PROVEEDOR:</strong></td>
    <td>${supervisorProviderText}</td>
  </tr>
</table>

<h2>1. ANTECEDENTES Y OBJETIVO</h2>
<p>${defaultObjective}</p>

<h2>2. ALCANCE FUNCIONAL Y ESTRUCTURA DE ENTREGABLES</h2>
<p>El proyecto comprende la maquetación, desarrollo y certificación de los siguientes componentes técnicos acordados:</p>

${quote.deliverables
  .map(
    (del, idx) => `
  <div style="margin-bottom: 14px;">
    <h3 style="color: #501f92; margin-bottom: 4px;">2.${idx + 1}. ${del.name}</h3>
    ${del.description ? `<p style="margin: 2px 0 6px 0; color: #64748b; font-size: 10pt;">${del.description}</p>` : ''}
    <ul style="margin-top: 4px; padding-left: 20px;">
      ${del.backlogItems.map((act) => `<li><strong>${act.title}</strong>${act.description ? `: ${act.description}` : ''}</li>`).join('')}
    </ul>
  </div>
`
  )
  .join('')}

<h2>3. RESPONSABILIDADES Y ENTREGA DE INSUMOS</h2>
<h3>3.1. Responsabilidad de ${clientName} (El Cliente)</h3>
<ul>
  <li><strong>Entrega de Material y Textos:</strong> Suministrar oportunamente logotipos oficiales, manuales de marca vigentes, fotografías de alta calidad, portafolios comerciales y textos definitivos.</li>
  <li><strong>Credenciales y Accesos Técnicos:</strong> Proporcionar oportunamente los accesos de nivel de administrador a plataformas de hosting, servidores DNS y pasarelas de pago.</li>
  <li><strong>Supervisor de Aprobaciones:</strong> Designar un responsable (Supervisor del Cliente) encargado de la consolidación final de feedback y firma formal de los Gates.</li>
  <li><strong>Tiempos de Respuesta:</strong> Garantizar la revisión de los entregables y la retroalimentación en un plazo máximo de cinco (5) a diez (10) días hábiles por Gate de control.</li>
</ul>

<h3>3.2. Responsabilidad de ${providerCompany} (El Proveedor)</h3>
<ul>
  <li>Diseño de arquitectura de experiencia y construcción de la solución técnica acordada.</li>
  <li>Configuraciones analíticas base (Google Analytics 4, Tag Manager) y parametrización de eventos de conversión.</li>
  <li>Entrenamiento técnico y sesión de transferencia de conocimiento grabada para el equipo del cliente.</li>
</ul>

<h2>4. CONFIGURACIONES E INTEGRACIONES</h2>
<ul>
  <li><strong>Google Analytics 4 (GA4):</strong> Implementación de la etiqueta de seguimiento para monitoreo de tráfico y comportamiento de usuarios.</li>
  <li><strong>Google Tag Manager (GTM):</strong> Contenedor oficial para administración ágil de píxeles y tags.</li>
  <li><strong>Microsoft Clarity:</strong> Instalación de script para mapas de calor y grabaciones de sesiones de usuario.</li>
  <li><strong>Medición de Conversión:</strong> Trackeo de eventos clave (envío de formularios / checkout).</li>
</ul>

<h2>5. ENTREGABLES DEFINITIVOS DEL PROYECTO</h2>
<p>Los productos definitivos suministrados formalmente a ${clientName} comprenden:</p>
<ol>
  ${quote.deliverables.map((d) => `<li><strong>${d.name}:</strong> Componentes desarrollados, maquetados y certificados en ambiente de pruebas.</li>`).join('')}
  <li><strong>Matriz de Trazabilidad Técnica:</strong> Snapshot documentando versiones exactas instaladas (core, plugins, librerías y PHP).</li>
  <li><strong>Sesión de Capacitación:</strong> Transferencia de conocimiento grabada sobre administración de la solución.</li>
</ol>

<h2>6. PROTOCOLO DE PRUEBAS Y VALIDACIÓN (UAT)</h2>
<div class="badge-callout">
  <p style="margin: 0;"><strong>Ambiente de Staging Dedicado:</strong> UHURA entregará una versión funcional en URL temporal de pruebas para validación por parte del cliente.</p>
</div>
<p><strong>Ventana de Revisión:</strong> ${clientName} dispondrá de cinco (5) a diez (10) días hábiles para consolidar observaciones en un <strong>único documento formal</strong>.</p>
<p><strong>Límite de Observaciones:</strong> Exclusivo para errores de funcionamiento o inconsistencias frente a este documento. No se consideran observaciones válidas solicitudes de rediseño estructural, nuevas ideas o módulos inéditos; cualquier requerimiento de este tipo será tramitado vía Change Request.</p>
<div class="silence-alert">
  <strong>CLÁUSULA DE SILENCIO POSITIVO:</strong> Si transcurridos los días hábiles pactados desde la entrega en Staging el cliente no emite observaciones formales por escrito, el hito se entenderá por aprobado a satisfacción y UHURA procederá con la facturación y salida a producción.
</div>

<h2>7. MATRIZ DE RIESGOS Y PLAN DE MITIGACIÓN (OBLIGATORIO)</h2>
<table>
  <thead>
    <tr>
      <th style="width: 32%;">Riesgo Identificado</th>
      <th style="width: 15%;">Impacto</th>
      <th style="width: 53%;">Plan de Mitigación / Responsable</th>
    </tr>
  </thead>
  <tbody>
    ${risks
      .map(
        (r) => `
      <tr>
        <td><strong>${r.risk}</strong></td>
        <td><span style="font-weight: bold; color: ${r.impact === 'Alto' ? '#b91c1c' : '#b45309'};">${r.impact}</span></td>
        <td>${r.mitigation.replace(/\n/g, '<br/>')}</td>
      </tr>
    `
      )
      .join('')}
  </tbody>
</table>

<h2>8. GATES Y CONTROL DEL PROYECTO</h2>
<p>El control del avance técnico se rige bajo compuertas obligatorias de control formal:</p>

${gates
  .map(
    (g) => `
  <div style="margin-bottom: 16px; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; background-color: #fafaf9;">
    <h3 style="color: #501f92; margin-top: 0;">${g.name}</h3>
    <p style="margin: 4px 0;"><strong>Acción de UHURA:</strong> ${g.uhuraAction}</p>
    <p style="margin: 4px 0;"><strong>Acción del Cliente:</strong> ${g.clientAction}</p>
    <p style="margin: 4px 0;"><strong>Resultado Esperado:</strong> ${g.expectedResult}</p>
    ${g.freezeClause ? `<div class="freeze-alert"><strong>${g.freezeClause}</strong></div>` : ''}
    ${g.positiveSilenceClause ? `<div class="silence-alert"><strong>${g.positiveSilenceClause}</strong></div>` : ''}
  </div>
`
  )
  .join('')}

<h2>9. USO DE INTELIGENCIA ARTIFICIAL Y TECNOLOGÍAS AUTOMATIZADAS</h2>
<p><strong>9.1. Optimización:</strong> El CLIENTE acepta que UHURA podrá utilizar herramientas de Inteligencia Artificial (IA) generativa y predictiva para la optimización de código, generación de estructuras de contenido y análisis de datos durante la ejecución del proyecto.</p>
<p><strong>9.2. Confidencialidad en IA:</strong> UHURA garantiza que <strong>NO utilizará datos sensibles, secretos industriales ni información confidencial del CLIENTE para entrenar modelos públicos de IA</strong>. Toda interacción con estas herramientas se realizará bajo protocolos de anonimización.</p>
<p><strong>9.3. Responsabilidad de Resultados:</strong> Aunque la IA asiste en el proceso, UHURA mantiene la responsabilidad final sobre la calidad, funcionalidad y seguridad del código entregado, habiendo realizado la curaduría y revisión humana correspondiente.</p>

<h2>10. RESPONSABILIDAD DEL CLIENTE Y TRATAMIENTO DE DATOS</h2>
<p><strong>10.1. Rol de las Partes:</strong> El CLIENTE declara ser el único "Responsable del Tratamiento" de los datos personales recolectados a través de la plataforma (Ley 1581 de 2012 de Colombia). UHURA actúa exclusivamente como "Encargado del Tratamiento" a nivel técnico durante la implementación.</p>
<p><strong>10.2. Exención de Responsabilidad:</strong> UHURA no asume responsabilidad alguna por la redacción, legalidad o actualización de la Política de Privacidad del CLIENTE, ni por sanciones ante la Superintendencia de Industria y Comercio (SIC). Los textos legales para carga en el CMS son responsabilidad exclusiva del CLIENTE.</p>

<h2>11. GESTIÓN DE CAMBIOS (CHANGE REQUEST)</h2>
<p>Cualquier solicitud que implique modificaciones sobre alcance congelado, nuevas páginas o integraciones adicionales se gestionará formalmente mediante el proceso de Control de Cambios:</p>
<ol>
  <li>Análisis de impacto y estimación de tiempo por parte del analista técnico.</li>
  <li>Estimación económica basada en la tarifa de horas a demanda acordada (<strong>$226.395 COP por hora más IVA</strong>).</li>
  <li>Firma de una Orden de Cambio o Addendum escrito previo a iniciar cualquier ejecución.</li>
</ol>

<h2>12. EXCLUSIONES DEL PROYECTO</h2>
<ul>
  <li>Mantenimiento continuo o soporte no cubierto por la garantía técnica.</li>
  <li>Desarrollo de módulos a medida complejos no descritos en la sección 2.</li>
  <li>Costos de software, licencias, hosting o pasarelas de pago de terceros.</li>
  <li>Rondas ilimitadas de revisión (las validaciones se restringen a las ventanas de los Gates).</li>
  <li>Compra de activos gráficos de stock pagado o producción audiovisual no incluida.</li>
</ul>

<h2>13. INVERSIÓN Y FORMA DE PAGO</h2>
<p>El valor total del proyecto es de <strong>${formattedPrice} COP</strong> antes de IVA, más el IVA del 19% vigente (<strong>${ivaValue} COP</strong>), para una inversión total de <strong>${totalWithIva} COP</strong>.</p>
<p>Forma de pago acordada:</p>
<ul>
  <li><strong>50% de anticipo (${halfPayment} COP antes de IVA)</strong> al iniciar el proyecto y formalizar este SOW.</li>
  <li><strong>50% final (${halfPayment} COP antes de IVA)</strong> a la finalización y aprobación del entregable (UAT / Gate de cierre).</li>
</ul>

<h2>14. ANEXO: ACUERDO DE NIVEL DE SERVICIO (SLA) Y EXTENSIÓN DE GARANTÍA (6 MESES)</h2>
<p>UHURA otorga una garantía técnica extendida de <strong>seis (6) meses calendario</strong> contados a partir de la firma del Acta de Cierre / Salida a Producción:</p>
<ul>
  <li><strong>Cobertura gratuita:</strong> Maquetación responsive en navegadores modernos soportados y fallos en la lógica interna de plantillas desarrolladas directamente por UHURA.</li>
  <li><strong>Exclusiones directas:</strong> Incompatibilidades causadas por actualizaciones automáticas de plugins o del core del CMS, manipulación interna de código o estilos por parte del cliente, o caídas de servidores ajenos a UHURA.</li>
  <li><strong>Protocolo de Peritaje:</strong> Ventana de respuesta inicial de <strong>ocho (8) horas laborales</strong>. Si el fallo es imputable a UHURA, se asume el 100% de la corrección; si proviene de exclusiones externas, las horas se facturan bajo la tarifa de hora extra a demanda pactada.</li>
</ul>

<br/><br/>
<h2>ACEPTACIÓN DEL DOCUMENTO DE ALCANCE (SOW)</h2>
<p>Al firmar este documento, ambas partes aceptan de común acuerdo las condiciones, alcances, exclusiones, cronogramas y compromisos financieros detallados en el presente Statement of Work:</p>

<table style="width: 100%; border: none; margin-top: 30px;">
  <tr style="background: none;">
    <td style="width: 50%; border: none; padding-right: 20px;">
      <p style="margin: 0; font-weight: bold; color: #501f92;">POR EL CLIENTE:</p>
      <p style="margin: 2px 0 0 0; font-weight: bold;">${clientName}</p>
      <div class="signature-box">
        <p style="margin: 2px 0;"><strong>Firma del Representante Legal</strong></p>
        <p style="margin: 2px 0;">Nombre: ${clientRepHtml}</p>
        <p style="margin: 2px 0;">Cargo: ${clientRepRoleText}</p>
        <p style="margin: 2px 0;">Identificación: ${clientRepIdHtml}</p>
        <p style="margin: 2px 0;">Fecha: ____ / ____ / ________</p>
      </div>
    </td>
    <td style="width: 50%; border: none; padding-left: 20px;">
      <p style="margin: 0; font-weight: bold; color: #501f92;">POR EL PROVEEDOR:</p>
      <p style="margin: 2px 0 0 0; font-weight: bold;">${providerCompany}</p>
      <div class="signature-box">
        <p style="margin: 2px 0;"><strong>Firma del Representante Legal</strong></p>
        <p style="margin: 2px 0;">Nombre: ${sowSigner}</p>
        <p style="margin: 2px 0;">Cargo: ${sowSignerRole}</p>
        <p style="margin: 2px 0;">Identificación: ${sowSignerId}</p>
        <p style="margin: 2px 0;">Fecha: ____ / ____ / ________</p>
      </div>
    </td>
  </tr>
</table>

</body>
</html>`;
}
