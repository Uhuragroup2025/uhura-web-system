import { UserItem, TeamLifeEvent, TeamAbsenceEvent } from '../types';

export interface OperationalMilestone {
  id: string;
  title: string;
  type: 'critical_delivery' | 'deployment_freeze' | 'accounting_close' | 'company_milestone';
  date: string;
  formattedDate: string;
  clientOrDepartment?: string;
  description: string;
  impactLevel: 'alto' | 'medio' | 'critico';
}

export const DEFAULT_OPERATIONAL_MILESTONES: OperationalMilestone[] = [
  {
    id: 'op-1',
    title: 'Entrega Crítica: Campaña Navidad Danone',
    type: 'critical_delivery',
    date: '2026-09-20',
    formattedDate: '20 de Sep',
    clientOrDepartment: 'Danone S.A.',
    description: 'Aprobación final de masters gráficos para pauta digital en Meta & TikTok.',
    impactLevel: 'critico'
  },
  {
    id: 'op-2',
    title: 'Congelamiento de Despliegue (Code Freeze): BattSaver',
    type: 'deployment_freeze',
    date: '2026-09-25',
    formattedDate: '25 de Sep',
    clientOrDepartment: 'Rock and Ride S.A.S.',
    description: 'No se admiten PRs ni cambios en producción previa auditoría de pasarela Wompi.',
    impactLevel: 'alto'
  },
  {
    id: 'op-3',
    title: 'Cierre Contable & Facturación Mensual Uhura',
    type: 'accounting_close',
    date: '2026-09-30',
    formattedDate: '30 de Sep',
    clientOrDepartment: 'Administración & Finanzas',
    description: 'Corte de horas reportadas en Orbit OS y emisión de cobros recurrentes de clientes.',
    impactLevel: 'critico'
  }
];

export interface ProcessedTeamLifeResult {
  todayEvents: TeamLifeEvent[];
  upcomingEvents: TeamLifeEvent[];
  activeAbsences: TeamLifeEvent[];
  operationalMilestones: OperationalMilestone[];
  allEvents: TeamLifeEvent[];
  featuredEvent?: TeamLifeEvent | null;
  copilotSummary: {
    birthdaysToday: number;
    anniversariesToday: number;
    peopleOnVacation: number;
    returnsToday: number;
  };
}

/**
 * Normaliza una fecha a día y mes para comparar sin importar el año
 */
function getDayAndMonth(dateStr: string): { month: number; day: number } | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length >= 3) {
    return {
      month: parseInt(parts[1], 10),
      day: parseInt(parts[2], 10)
    };
  }
  return null;
}

/**
 * Calcula la diferencia en días en un ciclo anual (0 = hoy, 1..3 = próximos días)
 */
function getDaysUntilAnniversary(targetMonth: number, targetDay: number, refDate: Date): number {
  const currentMonth = refDate.getMonth() + 1; // 1-12
  const currentDay = refDate.getDate();

  if (targetMonth === currentMonth && targetDay === currentDay) {
    return 0;
  }

  const thisYear = refDate.getFullYear();
  let targetDate = new Date(thisYear, targetMonth - 1, targetDay);
  
  if (targetDate.getTime() < refDate.getTime() && targetDate.toDateString() !== refDate.toDateString()) {
    // Ya pasó este año, evaluar próximo año
    targetDate = new Date(thisYear + 1, targetMonth - 1, targetDay);
  }

  const diffTime = targetDate.getTime() - refDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Mensaje de reconocimiento humano según años de antigüedad en Uhura Group
 */
export function getAnniversaryRecognitionMessage(userName: string, years: number): string {
  if (years === 1) {
    return `¡Hoy ${userName} cumple su primer año en Uhura Group! 🦫💜 ¡Gracias por sumar tu talento a la colonia!`;
  } else if (years === 2) {
    return `¡Hoy ${userName} cumple 2 años en Uhura 🦫💜! Dos años construyendo proyectos excepcionales juntos.`;
  } else if (years >= 3) {
    return `¡Hoy ${userName} celebra ${years} años en Uhura! 🌟 Pilar y referente indispensable de nuestra colonia.`;
  }
  return `¡Hoy ${userName} cumple ${years} años en Uhura 🦫💜! Felicitaciones por tu entrega y calidez.`;
}

/**
 * Procesa la lista de usuarios y extrae los eventos humanos y operativos para Bucky
 */
export function processTeamLifeEvents(
  users: UserItem[],
  referenceDate: Date = new Date(2026, 8, 16), // 16 de Septiembre 2026 por defecto de mock
  absenceEvents: TeamAbsenceEvent[] = []
): ProcessedTeamLifeResult {
  const todayEvents: TeamLifeEvent[] = [];
  const upcomingEvents: TeamLifeEvent[] = [];
  const activeAbsences: TeamLifeEvent[] = [];
  const allEvents: TeamLifeEvent[] = [];

  let birthdaysToday = 0;
  let anniversariesToday = 0;
  let peopleOnVacation = 0;
  let returnsToday = 0;

  users.forEach((user) => {
    // 1. CUMPLEAÑOS
    if (user.birthDate) {
      const dm = getDayAndMonth(user.birthDate);
      if (dm) {
        const days = getDaysUntilAnniversary(dm.month, dm.day, referenceDate);
        if (days === 0) {
          birthdaysToday++;
          const event: TeamLifeEvent = {
            id: `evt-bday-${user.id}`,
            userId: user.id,
            userName: user.name,
            userRole: user.jobTitle || user.officialRole || 'Equipo Uhura',
            userAvatarBg: user.avatarBg,
            userInitials: user.initials,
            type: 'birthday',
            date: user.birthDate,
            headline: `¡Hoy cumple años ${user.name.split(' ')[0]}! 🎉🎂`,
            message: `¡Pásate a felicitar a ${user.name}! Hoy celebra su cumpleaños en la colonia Uhura.`,
            daysRemaining: 0,
            isActiveNow: true
          };
          todayEvents.push(event);
          allEvents.push(event);
        } else if (days > 0 && days <= 3) {
          const event: TeamLifeEvent = {
            id: `evt-bday-soon-${user.id}`,
            userId: user.id,
            userName: user.name,
            userRole: user.jobTitle || user.officialRole || 'Equipo Uhura',
            userAvatarBg: user.avatarBg,
            userInitials: user.initials,
            type: 'birthday',
            date: user.birthDate,
            headline: `Cumpleaños en ${days} día${days > 1 ? 's' : ''} 🎈`,
            message: `El ${user.birthDateFormatted || 'próximos días'} cumple años ${user.name}. ¡Prepara tu saludo!`,
            daysRemaining: days,
            isActiveNow: false
          };
          upcomingEvents.push(event);
          allEvents.push(event);
        }
      }
    }

    // 2. ANIVERSARIO EN UHURA
    if (user.anniversaryDate) {
      const dm = getDayAndMonth(user.anniversaryDate);
      if (dm) {
        const days = getDaysUntilAnniversary(dm.month, dm.day, referenceDate);
        const years = user.anniversaryYears || 2;
        if (days === 0) {
          anniversariesToday++;
          const message = getAnniversaryRecognitionMessage(user.name, years);
          const event: TeamLifeEvent = {
            id: `evt-anniv-${user.id}`,
            userId: user.id,
            userName: user.name,
            userRole: user.jobTitle || user.officialRole || 'Equipo Uhura',
            userAvatarBg: user.avatarBg,
            userInitials: user.initials,
            type: 'anniversary',
            date: user.anniversaryDate,
            headline: `¡Hoy ${user.name.split(' ')[0]} cumple ${years} año${years > 1 ? 's' : ''} en Uhura! 🦫💜`,
            message,
            daysRemaining: 0,
            yearsCount: years,
            isActiveNow: true
          };
          todayEvents.push(event);
          allEvents.push(event);
        } else if (days > 0 && days <= 4) {
          const event: TeamLifeEvent = {
            id: `evt-anniv-soon-${user.id}`,
            userId: user.id,
            userName: user.name,
            userRole: user.jobTitle || user.officialRole || 'Equipo Uhura',
            userAvatarBg: user.avatarBg,
            userInitials: user.initials,
            type: 'anniversary',
            date: user.anniversaryDate,
            headline: `Aniversario en ${days} día${days > 1 ? 's' : ''} 🦫`,
            message: `${user.name} cumplirá ${years} año${years > 1 ? 's' : ''} en Uhura Group muy pronto.`,
            daysRemaining: days,
            yearsCount: years,
            isActiveNow: false
          };
          upcomingEvents.push(event);
          allEvents.push(event);
        }
      }
    }

    // 3. VACACIONES Y AUSENCIAS
    if (user.vacationStatus) {
      const v = user.vacationStatus;
      if (v.onVacation) {
        peopleOnVacation++;
        const event: TeamLifeEvent = {
          id: `evt-vac-active-${user.id}`,
          userId: user.id,
          userName: user.name,
          userRole: user.jobTitle || user.officialRole || 'Equipo Uhura',
          userAvatarBg: user.avatarBg,
          userInitials: user.initials,
          type: 'vacation',
          date: v.startDate || 'Activa',
          returnDate: v.returnDate,
          headline: `${user.name.split(' ')[0]} en Vacaciones 🏖️`,
          message: `${user.name} está en período de vacaciones aprobado hasta el ${v.returnDate || 'próxima semana'}. Bucky avisará si se le intenta asignar trabajo operativo.`,
          isActiveNow: true
        };
        activeAbsences.push(event);
        allEvents.push(event);
      } else if (v.startDate) {
        // Chequeo si inicia pronto
        const dm = getDayAndMonth(v.startDate);
        if (dm) {
          const days = getDaysUntilAnniversary(dm.month, dm.day, referenceDate);
          if (days === 1) {
            const event: TeamLifeEvent = {
              id: `evt-vac-soon-${user.id}`,
              userId: user.id,
              userName: user.name,
              userRole: user.jobTitle || user.officialRole || 'Equipo Uhura',
              userAvatarBg: user.avatarBg,
              userInitials: user.initials,
              type: 'vacation',
              date: v.startDate,
              headline: `Mañana ${user.name.split(' ')[0]} inicia vacaciones 🌴`,
              message: `${user.name} saldrá a vacaciones aprobadas a partir de mañana. Cierra entregas pendientes con tiempo.`,
              daysRemaining: 1,
              isActiveNow: false
            };
            upcomingEvents.push(event);
            allEvents.push(event);
          }
        }
      }
    }
  });

  // 4. AUSENCIAS ESTRUCTURADAS (Google Calendar -> Orbit TeamAbsenceEvent)
  const refIso = referenceDate.toISOString().slice(0, 10);
  absenceEvents.forEach((abs) => {
    if (abs.status !== 'active') return;
    const targetUser = users.find((u) => u.id === abs.userId);
    const userName = targetUser?.name || abs.userName || 'Colaborador';
    const isCurrentlyActive = refIso >= abs.startDate && refIso <= abs.endDate;

    if (isCurrentlyActive) {
      const alreadyIn = activeAbsences.some((a) => a.userId === abs.userId);
      if (!alreadyIn) {
        peopleOnVacation++;
        const event: TeamLifeEvent = {
          id: `evt-abs-active-${abs.id}`,
          userId: abs.userId,
          userName,
          userRole: targetUser?.jobTitle || targetUser?.officialRole || 'Equipo Uhura',
          userAvatarBg: targetUser?.avatarBg,
          userInitials: targetUser?.initials,
          type: abs.type === 'vacation' ? 'vacation' : 'absence',
          date: abs.startDate,
          headline: `${userName.split(' ')[0]} en ausencia programada`,
          message: `${userName} tiene registrada ausencia (${abs.title}) hasta el ${abs.endDate}.`,
          returnDate: abs.endDate,
          isActiveNow: true
        };
        activeAbsences.push(event);
        allEvents.push(event);
      }
    } else if (abs.startDate > refIso) {
      const diffDays = Math.ceil((new Date(abs.startDate).getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 0 && diffDays <= 7) {
        const event: TeamLifeEvent = {
          id: `evt-abs-soon-${abs.id}`,
          userId: abs.userId,
          userName,
          userRole: targetUser?.jobTitle || targetUser?.officialRole || 'Equipo Uhura',
          userAvatarBg: targetUser?.avatarBg,
          userInitials: targetUser?.initials,
          type: abs.type === 'vacation' ? 'vacation' : 'absence',
          date: abs.startDate,
          headline: `En ${diffDays} día${diffDays > 1 ? 's' : ''}: ausencia de ${userName.split(' ')[0]}`,
          message: `${userName} iniciará ${abs.title} del ${abs.startDate} al ${abs.endDate}. ${abs.source === 'google_calendar' ? '(Sincronizado vía Google Calendar)' : ''}`,
          daysRemaining: diffDays,
          isActiveNow: false
        };
        upcomingEvents.push(event);
        allEvents.push(event);
      }
    }
  });

  const featuredEvent = todayEvents.length > 0
    ? todayEvents[0]
    : upcomingEvents.length > 0
      ? upcomingEvents[0]
      : activeAbsences.length > 0
        ? activeAbsences[0]
        : null;

  return {
    todayEvents,
    upcomingEvents,
    activeAbsences,
    operationalMilestones: DEFAULT_OPERATIONAL_MILESTONES,
    allEvents,
    featuredEvent,
    copilotSummary: {
      birthdaysToday,
      anniversariesToday,
      peopleOnVacation,
      returnsToday
    }
  };
}

/**
 * Validador operativo para asignaciones de tareas.
 * Bucky avisa si el colaborador está de vacaciones o ausencia programada (consumiendo TeamAbsenceEvent).
 */
export function checkAssigneeAvailability(
  userNameOrId: string,
  users: UserItem[],
  absenceEvents: TeamAbsenceEvent[] = [],
  referenceDateStr: string = '2026-09-16'
): {
  isAvailable: boolean;
  isOnVacation: boolean;
  hasFutureAbsence?: boolean;
  futureAbsenceText?: string;
  reason?: string;
  alertTitle?: string;
  alertMessage?: string;
  returnDate?: string;
  warningLevel: 'warning' | 'info' | 'ok';
} {
  const user = users.find(
    (u) => u.id === userNameOrId || u.name.toLowerCase() === userNameOrId.toLowerCase()
  );

  if (!user) {
    return {
      isAvailable: true,
      isOnVacation: false,
      warningLevel: 'ok'
    };
  }

  // 1. Verificar ausencia activa hoy (TeamAbsenceEvent de Orbit / Google Calendar)
  const activeAbsence = absenceEvents.find(
    (abs) =>
      abs.userId === user.id &&
      abs.status === 'active' &&
      referenceDateStr >= abs.startDate &&
      referenceDateStr <= abs.endDate
  );

  if (activeAbsence) {
    const sourceLabel = activeAbsence.source === 'google_calendar' ? ' (Google Calendar)' : '';
    return {
      isAvailable: false,
      isOnVacation: true,
      reason: 'absence_active',
      alertTitle: `🦫 Bucky Copiloto: ${user.name.split(' ')[0]} tiene ausencia registrada`,
      alertMessage: `${user.name} tiene ${activeAbsence.title} aprobada hasta el ${activeAbsence.endDate}${sourceLabel}. Bucky te recomienda no sobrecargar su retorno y considerar un respaldo operativo.`,
      returnDate: activeAbsence.endDate,
      warningLevel: 'warning'
    };
  }

  // 2. Verificar vacationStatus en el perfil de usuario (compatibilidad previa)
  if (user.vacationStatus?.onVacation) {
    const returnDate = user.vacationStatus.returnDate || 'pronto';
    return {
      isAvailable: false,
      isOnVacation: true,
      reason: 'vacation_active',
      alertTitle: `🦫 Bucky Copiloto: ${user.name.split(' ')[0]} está de vacaciones`,
      alertMessage: `${user.name} se encuentra en período de descanso aprobado hasta el ${returnDate}. Bucky te recomienda no sobrecargar su retorno y considerar un respaldo operativo.`,
      returnDate,
      warningLevel: 'warning'
    };
  }

  // 3. Verificar ausencia futura en los próximos 14 días (impacto en staffing / cronograma)
  const futureAbsence = absenceEvents.find(
    (abs) =>
      abs.userId === user.id &&
      abs.status === 'active' &&
      abs.startDate > referenceDateStr
  );

  if (futureAbsence) {
    const sourceLabel = futureAbsence.source === 'google_calendar' ? ' (Google Calendar)' : '';
    return {
      isAvailable: true,
      isOnVacation: false,
      hasFutureAbsence: true,
      futureAbsenceText: `${futureAbsence.title} (${futureAbsence.startDate})`,
      alertTitle: `🦫 Bucky Copiloto: Ausencia próxima para ${user.name.split(' ')[0]}`,
      alertMessage: `${user.name} tiene ${futureAbsence.title} programada del ${futureAbsence.startDate} al ${futureAbsence.endDate}${sourceLabel}. Tenlo en cuenta al definir entregables.`,
      returnDate: futureAbsence.endDate,
      warningLevel: 'info'
    };
  }

  return {
    isAvailable: true,
    isOnVacation: false,
    warningLevel: 'ok'
  };
}

/**
 * Resuelve la frase que Bucky dice en su globo de diálogo sobre eventos de equipo
 */
export function resolveBuckyTeamLifeSpeech(result: ProcessedTeamLifeResult): {
  speech: string;
  headline: string;
  badge: string;
  type: 'birthday' | 'anniversary' | 'vacation' | 'operational';
} | null {
  if (result.todayEvents.length > 0) {
    const ev = result.todayEvents[0];
    if (ev.type === 'birthday') {
      return {
        headline: `¡Cumpleaños en la Colonia! 🎉`,
        speech: `¡Hoy cumple años ${ev.userName.split(' ')[0]}! Pásate a felicitarle y celebra su día 🎂💜`,
        badge: 'Cumpleaños Hoy',
        type: 'birthday'
      };
    }
    if (ev.type === 'anniversary') {
      return {
        headline: `Aniversario Uhura 🦫💜`,
        speech: `¡Hoy ${ev.userName.split(' ')[0]} cumple ${ev.yearsCount || 2} años en Uhura! Reconozcamos su gran labor en el equipo 🌟`,
        badge: 'Aniversario Hoy',
        type: 'anniversary'
      };
    }
  }

  if (result.activeAbsences.length > 0) {
    const abs = result.activeAbsences[0];
    return {
      headline: `Equipo en Vacaciones 🏖️`,
      speech: `${abs.userName.split(' ')[0]} está de vacaciones hasta el ${abs.returnDate || 'próxima semana'}. ¡Cuidando su descanso y no asignándole carga urgente! 🌴`,
      badge: 'Vacaciones Activas',
      type: 'vacation'
    };
  }

  if (result.upcomingEvents.length > 0) {
    const up = result.upcomingEvents[0];
    if (up.type === 'birthday') {
      return {
        headline: `Cumpleaños Cerca 🎈`,
        speech: `En ${up.daysRemaining} días cumple años ${up.userName.split(' ')[0]}. ¡Bucky ya está preparando los saludos! 🪵✨`,
        badge: 'Próximo Cumpleaños',
        type: 'birthday'
      };
    }
  }

  return null;
}
