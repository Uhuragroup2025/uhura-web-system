import { HubSpotDealStage } from '../types';

export interface HubSpotContactItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface HubSpotMeetingNote {
  id: string;
  date: string;
  author: string;
  snippet: string;
  fullContent: string;
}

export interface HubSpotCompanyItem {
  id: string;
  name: string;
  domain: string;
  industry: string;
  contacts: HubSpotContactItem[];
  notes: HubSpotMeetingNote[];
}

export const HUBSPOT_SIMULATED_COMPANIES: HubSpotCompanyItem[] = [
  {
    id: 'hs-comp-danone',
    name: 'Danone S.A.',
    domain: 'danone.com',
    industry: 'Alimentos & Bebidas',
    contacts: [
      {
        id: 'hs-cnt-dan-01',
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@danone.com',
        phone: '+57 (311) 889-0012',
        role: 'Director de Marketing Digital'
      },
      {
        id: 'hs-cnt-dan-02',
        name: 'Valentina Restrepo',
        email: 'vrestrepo@danone.com',
        phone: '+57 (310) 554-1190',
        role: 'Product Lead Ecommerce'
      }
    ],
    notes: [
      {
        id: 'hs-note-dan-101',
        date: '24 Oct 2026',
        author: 'Luisa Fernanda Urazán (Comercial)',
        snippet: 'Reunión Discovery: Requieren rediseño completo de ecommerce Bonafont B2C y módulo corporativo con Pasarela PayU...',
        fullContent: 'Reunión Discovery: Requieren rediseño completo de ecommerce Bonafont B2C y módulo corporativo con Pasarela PayU. Necesitan lanzar en 6 semanas para temporada navideña. Presupuesto aprobado preliminar de 45M COP.'
      },
      {
        id: 'hs-note-dan-102',
        date: '18 Oct 2026',
        author: 'Catalina Gómez (Dirección Comercial)',
        snippet: 'Llamada de exploración inicial: Interés en servicio continuo de performance y pauta digital multicanal...',
        fullContent: 'Llamada de exploración inicial: Interés en servicio continuo de performance y pauta digital multicanal para Q1. Buscan agencia con reporting automatizado.'
      }
    ]
  },
  {
    id: 'hs-comp-geotours',
    name: 'GeoTours Colombia',
    domain: 'geotours.co',
    industry: 'Turismo & Hotelería',
    contacts: [
      {
        id: 'hs-cnt-geo-01',
        name: 'Mariana Restrepo',
        email: 'mrestrepo@geotours.co',
        phone: '+57 (314) 776-5544',
        role: 'Gerente General'
      },
      {
        id: 'hs-cnt-geo-02',
        name: 'Esteban Cárdenas',
        email: 'ecardenas@geotours.co',
        phone: '+57 (301) 332-9011',
        role: 'Coordinador de Operaciones'
      }
    ],
    notes: [
      {
        id: 'hs-note-geo-201',
        date: '25 Oct 2026',
        author: 'Luisa Fernanda Urazán (Comercial)',
        snippet: 'Briefing técnico: Portal turístico con motor de reservas sincronizado a Booking API y pagos en dólares y pesos...',
        fullContent: 'Briefing técnico: Portal turístico con motor de reservas sincronizado a Booking API y pagos en dólares y pesos. Duración estimada 8 semanas. Requieren cotización urgente.'
      }
    ]
  },
  {
    id: 'hs-comp-bambu',
    name: 'Bambú BPO',
    domain: 'bambubpo.com',
    industry: 'Servicios Empresariales',
    contacts: [
      {
        id: 'hs-cnt-bam-01',
        name: 'Felipe Jaramillo',
        email: 'felipe@bambubpo.com',
        phone: '+57 (300) 443-1289',
        role: 'VP de Crecimiento'
      }
    ],
    notes: [
      {
        id: 'hs-note-bam-301',
        date: '22 Oct 2026',
        author: 'Catalina Gómez (Dirección Comercial)',
        snippet: 'Reunión de alineación: Campaña integral B2B de generación de leads en LinkedIn y landing de conversión...',
        fullContent: 'Reunión de alineación: Campaña integral B2B de generación de leads en LinkedIn y landing de conversión. Modalidad mixta: landing puntual + fee mensual de creativos y pauta.'
      }
    ]
  },
  {
    id: 'hs-comp-acrip',
    name: 'Acrip Nacional',
    domain: 'acrip.co',
    industry: 'Gremial / RRHH',
    contacts: [
      {
        id: 'hs-cnt-acr-01',
        name: 'Beatriz Salazar',
        email: 'bsalazar@acrip.co',
        phone: '+57 (315) 880-9921',
        role: 'Directora de Comunicaciones'
      }
    ],
    notes: [
      {
        id: 'hs-note-acr-401',
        date: '26 Oct 2026',
        author: 'Luisa Fernanda Urazán (Comercial)',
        snippet: 'Nota de reunión: Rediseño del portal de afiliados y revista digital con sistema de suscripción y acceso privado...',
        fullContent: 'Nota de reunión: Rediseño del portal de afiliados y revista digital con sistema de suscripción y acceso privado. Alcance en 5 semanas.'
      }
    ]
  },
  {
    id: 'hs-comp-alqueria',
    name: 'Alquería S.A.',
    domain: 'alqueria.com.co',
    industry: 'Consumo Masivo',
    contacts: [
      {
        id: 'hs-cnt-alq-01',
        name: 'Andrés Morales',
        email: 'andres.morales@alqueria.com.co',
        phone: '+57 (312) 667-4400',
        role: 'Líder de Transformación Digital'
      }
    ],
    notes: [
      {
        id: 'hs-note-alq-501',
        date: '27 Oct 2026',
        author: 'Catalina Gómez (Dirección Comercial)',
        snippet: 'Discovery: App interna de seguimiento de rutas y micrositio de sostenibilidad para stakeholders...',
        fullContent: 'Discovery: App interna de seguimiento de rutas y micrositio de sostenibilidad para stakeholders. Esperan propuesta de arquitectura antes del viernes.'
      }
    ]
  }
];

export const HUBSPOT_PIPELINE_NAME = 'Pipeline Comercial Ventas Uhura';

export const HUBSPOT_STAGES: { stage: HubSpotDealStage; description: string; badgeColor: string }[] = [
  {
    stage: 'Presentación a cliente',
    description: 'Propuesta enviada y en sustentación con los tomadores de decisión.',
    badgeColor: 'bg-[#501f92]/10 text-[#501f92] border-[#d8b4fe]'
  },
  {
    stage: 'Cierre ganado',
    description: 'Servicio aprobado formalmente por el cliente. Habilita creación de proyecto.',
    badgeColor: 'bg-[#059669]/10 text-[#047857] border-[#a7f3d0]'
  },
  {
    stage: 'Cierre perdido',
    description: 'Servicio no aprobado por el cliente. No se convertirá en proyecto.',
    badgeColor: 'bg-[#dc2626]/10 text-[#dc2626] border-[#fecaca]'
  },
  {
    stage: 'Enviado para facturar',
    description: 'Servicio aprobado y en trámite de anticipo/facturación. No bloquea el proyecto.',
    badgeColor: 'bg-[#3b82f6]/10 text-[#1d4ed8] border-[#bfdbfe]'
  }
];

export const searchHubspotCompanies = (query: string): HubSpotCompanyItem[] => {
  const q = query.toLowerCase().trim();
  if (!q) return HUBSPOT_SIMULATED_COMPANIES;
  return HUBSPOT_SIMULATED_COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q)
  );
};

export const getHubspotCompanyById = (id?: string | null): HubSpotCompanyItem | undefined => {
  if (!id) return undefined;
  return HUBSPOT_SIMULATED_COMPANIES.find((c) => c.id === id);
};

let counter = 1000;
export const generateSimulatedDealId = (serviceName: string): string => {
  counter += 1;
  const hash = Math.floor(10000 + Math.random() * 90000);
  return `hs-deal-${hash}`;
};
