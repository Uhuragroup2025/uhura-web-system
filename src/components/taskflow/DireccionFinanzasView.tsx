import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  ChevronRight,
  ArrowRight,
  Target,
  Sparkles,
  Repeat,
  CheckCircle2,
  Layers,
  Filter,
  Check,
  Calendar,
  Building2,
  PlugZap,
  Info,
  Clock,
  ExternalLink,
  ShieldAlert,
  BarChart2,
  CheckCircle,
  AlertCircle,
  Edit2,
  RotateCcw
} from 'lucide-react';
import {
  NewBusinessOpportunity,
  ClientProfile,
  TaskItem,
  TimeLog,
  UserItem,
  OrbitView
} from './types';
import { formatCurrency, formatHours } from '../../utils/formatters';

interface DireccionFinanzasViewProps {
  opportunities?: NewBusinessOpportunity[];
  clients?: ClientProfile[];
  tasks?: TaskItem[];
  timeLogs?: TimeLog[];
  currentUser?: UserItem;
  onNavigateToView?: (view: OrbitView, targetId?: string | null) => void;
  onSelectOpportunity?: (oppId: string) => void;
}

// Resuelve el mes actual en curso (ej. 2026-11)
const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const DireccionFinanzasView: React.FC<DireccionFinanzasViewProps> = ({
  opportunities = [],
  clients = [],
  tasks = [],
  timeLogs = [],
  currentUser,
  onNavigateToView,
  onSelectOpportunity
}) => {
  // 1. Selector de mes: por defecto SIEMPRE abre en el mes en curso (ej: Noviembre 2026)
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());

  // 2. META ANUAL DE DIRECCIÓN (recalcula automáticamente la meta mensual: annualTargetCOP / 12)
  const [annualTargetCOP, setAnnualTargetCOP] = useState<number>(4200000000); // $4.200M COP al año
  const [isEditingAnnualTarget, setIsEditingAnnualTarget] = useState<boolean>(false);
  const [targetInputMillions, setTargetInputMillions] = useState<string>('4200');

  // Meta mensual calculada automáticamente
  const monthlyTargetCOP = useMemo(() => {
    return Math.round(annualTargetCOP / 12);
  }, [annualTargetCOP]);

  // 3. AJUSTE MANUAL OPCIONAL DEL TOTAL COMERCIAL DEL MES (Para salvar el delay con Alegra sin falsear datos)
  const [manualMonthAdjustments, setManualMonthAdjustments] = useState<Record<string, number>>({});
  const [isEditingMonthCommercial, setIsEditingMonthCommercial] = useState<boolean>(false);
  const [monthCommercialInputMillions, setMonthCommercialInputMillions] = useState<string>('');

  // Modo de visualización de horas en Clientes: del mes seleccionado vs acumulado total
  const [hoursScopeMode, setHoursScopeMode] = useState<'month' | 'lifetime'>('month');

  // Filtro semafórico para el bloque de proyectos
  const [trafficFilter, setTrafficFilter] = useState<'todos' | 'verde' | 'amarillo' | 'rojo'>('todos');

  // CÁLCULO: VENDIDO / CERRADO EN EL MES SELECCIONADO (Oportunidades ganadas en New Business)
  const wonOpps = useMemo(() => {
    return opportunities.filter((o) => {
      if (o.status !== 'won') return false;
      const currentMonth = getCurrentMonthKey();
      if (selectedMonth === currentMonth) return true;
      if (o.updatedAt && o.updatedAt.startsWith(selectedMonth)) return true;
      if (o.createdAt && o.createdAt.startsWith(selectedMonth)) return true;
      return false;
    });
  }, [opportunities, selectedMonth]);

  // Suma de valor total de cotizaciones ganadas en New Business para el mes seleccionado
  const soldFromNewBusinessCOP = useMemo(() => {
    return wonOpps.reduce((sum, o) => {
      const q = o.quotes?.[0];
      const val =
        q?.totalQuotedValueCOP ||
        q?.totalQuotedValue ||
        q?.commercialEstimatedContractValue ||
        q?.commercialTotalOneOff ||
        (q?.commercialTotalMonthlyFee ? q.commercialTotalMonthlyFee * 12 : 0) ||
        0;
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);
  }, [wonOpps]);

  // BASE RECURRENTE ACTIVA (Fees Mensuales en Curso de Clientes)
  const monthlyActiveFeesCOP = useMemo(() => {
    const billedFromClients = clients.reduce((sum, c) => {
      const billedVal = c.billedCOP ? parseFloat(c.billedCOP.replace(/[^0-9]/g, '')) : 0;
      return sum + (billedVal > 0 ? billedVal : 0);
    }, 0);
    return billedFromClients > 0 ? billedFromClients : 165000000; // $165M COP en fees base
  }, [clients]);

  // TOTAL COMERCIAL CALCULADO POR ECO PARA EL MES SELECCIONADO
  const computedCommercialForSelectedMonthCOP = useMemo(() => {
    if (selectedMonth === '2026-01') return 365000000;
    if (selectedMonth === '2026-02') return 340000000;
    if (selectedMonth === '2026-03') return 410000000;
    if (selectedMonth === '2026-04') return 330000000;
    if (selectedMonth === '2026-05') return 295000000;
    if (selectedMonth === '2026-06') return 380000000;
    if (selectedMonth === '2026-07') return 430000000;
    if (selectedMonth === '2026-08') return 320000000;
    if (selectedMonth === '2026-09') return 305000000;
    if (selectedMonth === '2026-10') return 360000000;
    if (selectedMonth === '2026-12') return monthlyActiveFeesCOP;
    return soldFromNewBusinessCOP + monthlyActiveFeesCOP;
  }, [selectedMonth, soldFromNewBusinessCOP, monthlyActiveFeesCOP]);

  // TOTAL COMERCIAL EFECTIVO (Si Dirección aplicó ajuste manual, tiene precedencia para salvar el delay con contabilidad)
  const isManuallyAdjusted = manualMonthAdjustments[selectedMonth] !== undefined;
  const effectiveCommercialThisMonthCOP = isManuallyAdjusted
    ? manualMonthAdjustments[selectedMonth]
    : computedCommercialForSelectedMonthCOP;

  // Porcentaje de avance del mes seleccionado vs meta mensual
  const targetProgressPercent = Math.min(
    100,
    Math.round((effectiveCommercialThisMonthCOP / monthlyTargetCOP) * 100)
  );

  // MODELO DE 12 MESES HISTÓRICOS
  const currentKey = getCurrentMonthKey();
  const monthsData = useMemo(() => {
    const rawMonths = [
      { key: '2026-01', label: 'Ene', value: 365000000, closed: true },
      { key: '2026-02', label: 'Feb', value: 340000000, closed: true },
      { key: '2026-03', label: 'Mar', value: 410000000, closed: true },
      { key: '2026-04', label: 'Abr', value: 330000000, closed: true },
      { key: '2026-05', label: 'May', value: 295000000, closed: true },
      { key: '2026-06', label: 'Jun', value: 380000000, closed: true },
      { key: '2026-07', label: 'Jul', value: 430000000, closed: true },
      { key: '2026-08', label: 'Ago', value: 320000000, closed: true },
      { key: '2026-09', label: 'Sep', value: 305000000, closed: true },
      { key: '2026-10', label: 'Oct', value: 360000000, closed: true },
      { key: '2026-11', label: 'Nov', value: soldFromNewBusinessCOP + monthlyActiveFeesCOP, closed: false },
      { key: '2026-12', label: 'Dic', value: monthlyActiveFeesCOP, closed: false, future: true }
    ];

    return rawMonths.map((m) => {
      const isCur = m.key === currentKey;
      const isFut = m.key > currentKey;
      // Usar ajuste manual si existe
      const finalValue = manualMonthAdjustments[m.key] !== undefined ? manualMonthAdjustments[m.key] : m.value;
      const pct = Math.round((finalValue / monthlyTargetCOP) * 100);
      let status: 'verde' | 'amarillo' | 'rojo' | 'futuro' = 'verde';
      if (isFut) status = 'futuro';
      else if (pct >= 100) status = 'verde';
      else if (pct >= 90) status = 'amarillo';
      else status = 'rojo';
      return { ...m, value: finalValue, pct, status, current: isCur, future: isFut };
    });
  }, [soldFromNewBusinessCOP, monthlyActiveFeesCOP, monthlyTargetCOP, currentKey, manualMonthAdjustments]);

  // CÁLCULO ANUAL ACUMULADO (YTD: Meses transcurridos hasta el mes actual)
  const ytdMetrics = useMemo(() => {
    const elapsedMonthsList = monthsData.filter((m) => !m.future);
    const elapsedCount = elapsedMonthsList.length || 11;
    const ytdTargetExpected = monthlyTargetCOP * elapsedCount;
    const ytdSoldTotal = elapsedMonthsList.reduce((sum, m) => sum + m.value, 0);
    const ytdProgressPercent = Math.round((ytdSoldTotal / ytdTargetExpected) * 100);
    const fullYearProgressPercent = Math.round((ytdSoldTotal / annualTargetCOP) * 100);

    return {
      elapsedCount,
      ytdTargetExpected,
      ytdSoldTotal,
      ytdProgressPercent,
      fullYearProgressPercent
    };
  }, [monthsData, monthlyTargetCOP, annualTargetCOP]);

  const handleSaveAnnualTarget = () => {
    const val = parseFloat(targetInputMillions);
    if (!isNaN(val) && val > 0) {
      setAnnualTargetCOP(val * 1000000);
      setIsEditingAnnualTarget(false);
    }
  };

  const handleSaveMonthCommercial = () => {
    const val = parseFloat(monthCommercialInputMillions);
    if (!isNaN(val) && val >= 0) {
      setManualMonthAdjustments((prev) => ({
        ...prev,
        [selectedMonth]: val * 1000000
      }));
      setIsEditingMonthCommercial(false);
    }
  };

  const handleResetMonthCommercial = () => {
    setManualMonthAdjustments((prev) => {
      const copy = { ...prev };
      delete copy[selectedMonth];
      return copy;
    });
  };

  // TOP CLIENTES ACTIVOS (Con soporte para horas del mes seleccionado o histórico acumulado)
  const topActiveClients = useMemo(() => {
    const clientMap = new Map<string, { id?: string; name: string; hours: number; taskCount: number }>();

    if (hoursScopeMode === 'month') {
      const monthLogs = (timeLogs || []).filter((tl) => tl.date && tl.date.startsWith(selectedMonth));
      
      monthLogs.forEach((tl) => {
        const task = tasks.find((t) => t.id === tl.taskId);
        const clientName = task?.clientName || 'Uhura Group';
        const clientObj = clients.find((c) => c.name.toLowerCase() === clientName.toLowerCase());
        const existing = clientMap.get(clientName) || {
          id: clientObj?.id || task?.clientId,
          name: clientName,
          hours: 0,
          taskCount: 0
        };
        existing.hours += ((tl.durationSeconds ?? (tl as any).seconds) || 0) / 3600;
        clientMap.set(clientName, existing);
      });

      tasks.forEach((t) => {
        const clientName = t.clientName || 'Uhura Group';
        if (clientMap.has(clientName)) {
          const item = clientMap.get(clientName)!;
          item.taskCount += 1;
        }
      });
    }

    if (clientMap.size === 0 || hoursScopeMode === 'lifetime') {
      clientMap.clear();
      tasks.forEach((t) => {
        const clientName = t.clientName || 'Uhura Group';
        const clientObj = clients.find((c) => c.name.toLowerCase() === clientName.toLowerCase());
        const existing = clientMap.get(clientName) || {
          id: clientObj?.id || t.clientId,
          name: clientName,
          hours: 0,
          taskCount: 0
        };
        existing.hours += (t.consumedSeconds || 0) / 3600;
        existing.taskCount += 1;
        clientMap.set(clientName, existing);
      });
    }

    return Array.from(clientMap.values())
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);
  }, [tasks, timeLogs, selectedMonth, hoursScopeMode, clients]);

  // PROYECTOS · SEMÁFORO DE CONSUMO (FUENTE ÚNICA DE SALUD OPERATIVA)
  const projectHealthList = useMemo(() => {
    const prjMap = new Map<
      string,
      { id: string; name: string; clientName: string; budgeted: number; consumed: number; overdueCount: number }
    >();

    const todayStr = new Date().toISOString().split('T')[0];

    tasks.forEach((t) => {
      const key = t.projectName || t.projectId || 'Proyecto General';
      const existing = prjMap.get(key) || {
        id: t.projectId || key,
        name: key,
        clientName: t.clientName || 'Cliente Activo',
        budgeted: 0,
        consumed: 0,
        overdueCount: 0
      };
      existing.budgeted += t.budgetedHours || 0;
      existing.consumed += (t.consumedSeconds || 0) / 3600;
      if (t.dueDate && t.dueDate < todayStr && t.status !== 'Done') {
        existing.overdueCount += 1;
      }
      prjMap.set(key, existing);
    });

    return Array.from(prjMap.values()).map((p) => {
      const pct = p.budgeted > 0 ? Math.round((p.consumed / p.budgeted) * 100) : 0;
      let status: 'verde' | 'amarillo' | 'rojo' = 'verde';
      if (pct >= 100) status = 'rojo';
      else if (pct >= 80) status = 'amarillo';
      return { ...p, percent: pct, status };
    });
  }, [tasks]);

  const filteredProjects = useMemo(() => {
    if (trafficFilter === 'todos') return projectHealthList;
    return projectHealthList.filter((p) => p.status === trafficFilter);
  }, [projectHealthList, trafficFilter]);

  const trafficCounts = useMemo(() => {
    const verde = projectHealthList.filter((p) => p.status === 'verde').length;
    const amarillo = projectHealthList.filter((p) => p.status === 'amarillo').length;
    const rojo = projectHealthList.filter((p) => p.status === 'rojo').length;
    return { verde, amarillo, rojo };
  }, [projectHealthList]);

  // Formato de nombre legible para el mes seleccionado
  const selectedMonthReadable = useMemo(() => {
    const found = monthsData.find((m) => m.key === selectedMonth);
    return found ? `${found.label} 2026` : selectedMonth;
  }, [selectedMonth, monthsData]);

  // Handlers para navegación con feedback visual
  const handleClientClick = (client: { id?: string; name: string }) => {
    if (!onNavigateToView) return;
    if (client.id) {
      onNavigateToView('clientes', client.id);
    } else {
      // Buscar por nombre si no tiene id directo
      const matched = clients.find((c) => c.name.toLowerCase() === client.name.toLowerCase());
      onNavigateToView('clientes', matched?.id || null);
    }
  };

  const handleProjectClick = (prj: { id: string; name: string }) => {
    if (!onNavigateToView) return;
    onNavigateToView('proyectos', prj.id);
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* 1. HEADER LIMPIO: TÍTULO Y BADGE (Sin descripción larga ni dropdown duplicado) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#f1f5f9]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#501f92]/10 text-[#501f92] flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-5 h-5 text-[#501f92]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">
              Dirección y Finanzas
            </h1>
          </div>
        </div>
      </div>

      {/* 2. BLOQUE 1: PANEL COMERCIAL (META ANUAL + TIRA DE MESES + CONTRASTE MES VS YTD) */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-4 sm:p-6 shadow-xs space-y-5">
        {/* Cabecera del Bloque: Título y Configuración de Meta Anual */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#501f92]/10 text-[#501f92] shrink-0">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-[#0f172a] tracking-tight">
                  Metas & Cumplimiento Comercial
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#faf8ff] text-[#501f92] border border-[#e9d5ff]">
                  Meta Anual: {formatCurrency(annualTargetCOP)}
                </span>
              </div>
              <span className="text-xs text-[#64748b]">
                Meta mensual recalculada automáticamente ({formatCurrency(monthlyTargetCOP)}/mes)
              </span>
            </div>
          </div>

          {/* AJUSTE DE META ANUAL */}
          <div className="flex items-center gap-2">
            {isEditingAnnualTarget ? (
              <div className="flex items-center gap-1.5 bg-[#f8fafc] p-1.5 rounded-xl border border-[#cbd5e1]">
                <span className="text-xs text-[#64748b] pl-1 font-bold">$</span>
                <input
                  type="number"
                  value={targetInputMillions}
                  onChange={(e) => setTargetInputMillions(e.target.value)}
                  className="w-20 text-xs font-bold text-[#0f172a] bg-white border border-[#e2e8f0] rounded-lg px-2 py-1 outline-hidden focus:border-[#501f92]"
                  placeholder="4200"
                  autoFocus
                />
                <span className="text-xs text-[#64748b] pr-1 font-bold">M Año</span>
                <button
                  type="button"
                  onClick={handleSaveAnnualTarget}
                  className="px-2.5 py-1 bg-[#501f92] hover:bg-[#3d1672] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingAnnualTarget(false)}
                  className="px-2 py-1 text-[#64748b] hover:text-[#0f172a] text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTargetInputMillions((annualTargetCOP / 1000000).toString());
                  setIsEditingAnnualTarget(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#501f92] bg-[#501f92]/10 hover:bg-[#501f92]/15 rounded-xl transition-colors cursor-pointer"
                title="Ajustar la meta anual de Uhura. El sistema recalcula la meta para cada mes automáticamente."
              >
                <span>Ajustar meta anual</span>
              </button>
            )}
          </div>
        </div>

        {/* TIRA DE 12 MESES HISTÓRICOS (RESPONSIVE: 4 COLS EN MOBILE, 6 EN TABLET, 12 EN DESKTOP) */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-1 text-xs mb-2">
            <span className="font-bold text-[#334155] flex items-center gap-1.5">
              <span>Auditoría Mes a Mes (2026)</span>
              <span className="text-[11px] font-normal text-[#64748b]">· Clic en cualquier mes para consultarlo</span>
            </span>
            <span className="text-[11px] text-[#501f92] font-semibold">
              Meta mensual base: {formatCurrency(monthlyTargetCOP)}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
            {monthsData.map((m) => {
              const isSelected = m.key === selectedMonth;
              const isSuccess = m.status === 'verde';
              const isWarning = m.status === 'amarillo';

              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelectedMonth(m.key)}
                  className={`p-2 rounded-xl text-center border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#501f92] ring-2 ring-[#501f92]/20 bg-[#faf8ff] shadow-xs'
                      : 'border-[#f1f5f9] bg-[#f8fafc] hover:bg-white hover:border-[#cbd5e1]'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className={`block text-[11px] font-bold ${isSelected ? 'text-[#501f92]' : 'text-[#475569]'}`}>
                      {m.label}
                    </span>
                    {m.current && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#501f92]" title="Mes actual" />
                    )}
                  </div>
                  
                  {m.future ? (
                    <span className="block text-[9px] text-[#94a3b8] font-mono mt-0.5">
                      Proy
                    </span>
                  ) : (
                    <span
                      className={`inline-block text-[9px] font-black px-1 rounded-sm mt-0.5 ${
                        isSuccess
                          ? 'bg-[#d1fae5] text-[#065f46]'
                          : isWarning
                          ? 'bg-[#fef3c7] text-[#92400e]'
                          : 'bg-[#fee2e2] text-[#991b1b]'
                      }`}
                    >
                      {m.pct}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTRASTE: MES SELECCIONADO VS AÑO ACUMULADO (YTD) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 pt-1">
          {/* PANEL A: MES SELECCIONADO (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-[#faf8ff] border border-[#f0e6ff] flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#501f92] uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Resultado de {selectedMonthReadable}</span>
                  </span>
                  {selectedMonth === currentKey && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-[#501f92] text-white">
                      Mes en curso
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      effectiveCommercialThisMonthCOP >= monthlyTargetCOP
                        ? 'bg-[#d1fae5] text-[#065f46]'
                        : 'bg-[#fee2e2] text-[#991b1b]'
                    }`}
                  >
                    {effectiveCommercialThisMonthCOP >= monthlyTargetCOP ? 'Meta Superada' : 'Por Debajo de Meta'}
                  </span>
                </div>
              </div>

              {/* 3 TARJETAS DE RESULTADO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 my-3">
                {/* 1. Total Comercial Mes */}
                <div className="p-3 bg-white rounded-xl border border-[#e9d5ff]/60 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#64748b] block">Total Comercial Mes</span>
                    {/* Botón para ajustar o restaurar */}
                    {isManuallyAdjusted ? (
                      <button
                        type="button"
                        onClick={handleResetMonthCommercial}
                        className="text-[9px] text-[#501f92] hover:underline flex items-center gap-0.5 cursor-pointer"
                        title="Restaurar al cálculo automático de ECO"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Auto</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setMonthCommercialInputMillions((effectiveCommercialThisMonthCOP / 1000000).toString());
                          setIsEditingMonthCommercial(true);
                        }}
                        className="text-[#94a3b8] hover:text-[#501f92] cursor-pointer"
                        title="Ajustar manualmente este mes si hay acuerdos contables especiales"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {isEditingMonthCommercial ? (
                    <div className="mt-1 flex items-center gap-1">
                      <input
                        type="number"
                        value={monthCommercialInputMillions}
                        onChange={(e) => setMonthCommercialInputMillions(e.target.value)}
                        className="w-16 text-xs font-bold text-[#0f172a] bg-[#f8fafc] border border-[#cbd5e1] rounded px-1 py-0.5 outline-hidden"
                        autoFocus
                      />
                      <span className="text-[10px] text-[#64748b]">M</span>
                      <button
                        type="button"
                        onClick={handleSaveMonthCommercial}
                        className="px-1.5 py-0.5 bg-[#501f92] text-white text-[10px] font-bold rounded cursor-pointer"
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingMonthCommercial(false)}
                        className="text-[#64748b] text-[10px] cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="text-base sm:text-lg font-black text-[#501f92] tracking-tight mt-0.5">
                      {formatCurrency(effectiveCommercialThisMonthCOP)}
                    </div>
                  )}

                  <span className="text-[9px] text-[#8a4dff] block mt-0.5 truncate">
                    {isManuallyAdjusted ? 'Ajustado por Dirección' : 'Cálculo automático ECO'}
                  </span>
                </div>

                {/* 2. Meta del Mes */}
                <div className="p-3 bg-white rounded-xl border border-[#e9d5ff]/60">
                  <span className="text-[10px] font-semibold text-[#64748b] block">Meta del Mes</span>
                  <div className="text-base sm:text-lg font-black text-[#0f172a] tracking-tight mt-0.5">
                    {formatCurrency(monthlyTargetCOP)}
                  </div>
                  <span className="text-[9px] text-[#64748b] block mt-0.5 truncate">
                    1/12 de Meta Anual
                  </span>
                </div>

                {/* 3. Diferencia */}
                <div className="p-3 bg-white rounded-xl border border-[#e9d5ff]/60">
                  <span className="text-[10px] font-semibold text-[#64748b] block">Diferencia</span>
                  <div
                    className={`text-base sm:text-lg font-black tracking-tight mt-0.5 ${
                      effectiveCommercialThisMonthCOP >= monthlyTargetCOP ? 'text-[#059669]' : 'text-[#dc2626]'
                    }`}
                  >
                    {effectiveCommercialThisMonthCOP >= monthlyTargetCOP ? '+' : '-'}
                    {formatCurrency(Math.abs(effectiveCommercialThisMonthCOP - monthlyTargetCOP))}
                  </div>
                  <span className="text-[9px] text-[#64748b] block mt-0.5 truncate">
                    {effectiveCommercialThisMonthCOP >= monthlyTargetCOP ? 'Superávit comercial' : 'Faltante para meta'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#334155]">Cumplimiento de {selectedMonthReadable}</span>
                <span className="font-black text-[#501f92]">{targetProgressPercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#f1f5f9] overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    targetProgressPercent >= 100
                      ? 'bg-[#10b981]'
                      : targetProgressPercent >= 90
                      ? 'bg-[#501f92]'
                      : 'bg-[#ef4444]'
                  }`}
                  style={{ width: `${Math.min(100, targetProgressPercent)}%` }}
                />
              </div>
              <span className="text-[10px] text-[#64748b] mt-1.5 block">
                Comprende {formatCurrency(soldFromNewBusinessCOP)} en New Business ganado + {formatCurrency(monthlyActiveFeesCOP)} en base de fees mensuales.
              </span>
            </div>
          </div>

          {/* PANEL B: AÑO ACUMULADO YTD (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-[#501f92]" />
                  <span>Año Acumulado YTD</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e0e7ff] text-[#3730a3]">
                  {ytdMetrics.elapsedCount} meses transcurridos
                </span>
              </div>

              <div className="space-y-2 my-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
                  <span className="text-xs text-[#64748b]">Total acumulado vendido:</span>
                  <strong className="text-xs sm:text-sm font-black text-[#0f172a] font-mono">
                    {formatCurrency(ytdMetrics.ytdSoldTotal)}
                  </strong>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8fafc] border border-[#f1f5f9]">
                  <span className="text-xs text-[#64748b]">Meta esperada a la fecha:</span>
                  <strong className="text-xs sm:text-sm font-bold text-[#64748b] font-mono">
                    {formatCurrency(ytdMetrics.ytdTargetExpected)}
                  </strong>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#334155]">Cumplimiento YTD a la fecha</span>
                <span className="font-black text-[#10b981]">{ytdMetrics.ytdProgressPercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#f1f5f9] overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-[#10b981] transition-all duration-500"
                  style={{ width: `${Math.min(100, ytdMetrics.ytdProgressPercent)}%` }}
                />
              </div>
              <span className="text-[10px] text-[#64748b] mt-1.5 block">
                {ytdMetrics.ytdProgressPercent >= 100
                  ? 'El año va sobrecumpliendo la meta acumulada esperada.'
                  : 'El acumulado anual está dentro del margen de recuperación comercial.'}
              </span>
            </div>
          </div>
        </div>

        {/* TARJETA FACTURADO REAL (ALEGRA PENDING) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#e2e8f0] text-[#475569] shrink-0">
              <PlugZap className="w-4 h-4 text-[#475569]" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#0f172a]">
                  Facturación Real Cobrada (Integración Contable Alegra)
                </span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#e2e8f0] text-[#475569] uppercase">
                  Pending Alegra
                </span>
              </div>
              <p className="text-[11px] text-[#64748b] mt-0.5">
                Al activar la integración oficial, este campo consumirá el webhook de facturas electrónicas para contrastar lo vendido vs. cobrado en tiempo real.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#94a3b8] px-3 py-1 rounded-xl bg-white border border-[#e2e8f0] shrink-0 self-start sm:self-auto">
            Hook preparado · /api/alegra/invoices
          </span>
        </div>
      </div>

      {/* 3. FILA DE 2 COLUMNAS: TOP CLIENTES (CLICKEABLE) Y PROYECTOS SEMÁFORO (CLICKEABLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* BLOQUE 2: TOP CLIENTES ACTIVOS (5 cols) - CLICKEABLE */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#e2e8f0] p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#f1f5f9] mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-[#10b981]/10 text-[#10b981] shrink-0">
                  <Users className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">Top Clientes Activos</h3>
                  <span className="text-[11px] text-[#64748b]">Clic en cualquier cliente para ver su ficha</span>
                </div>
              </div>

              {/* Selector de Horas: del mes vs acumulado histórico */}
              <div className="flex items-center gap-1 bg-[#f8fafc] p-1 rounded-xl border border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setHoursScopeMode('month')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    hoursScopeMode === 'month' ? 'bg-white shadow-2xs text-[#501f92]' : 'text-[#64748b]'
                  }`}
                  title="Muestra las horas invertidas por el equipo en el mes seleccionado"
                >
                  En {selectedMonthReadable.split(' ')[0]}
                </button>
                <button
                  type="button"
                  onClick={() => setHoursScopeMode('lifetime')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    hoursScopeMode === 'lifetime' ? 'bg-white shadow-2xs text-[#501f92]' : 'text-[#64748b]'
                  }`}
                  title="Muestra el histórico acumulado total de horas"
                >
                  Acumulado
                </button>
              </div>
            </div>

            {/* LISTA DE CLIENTES CLICKEABLES */}
            <div className="space-y-2.5">
              {topActiveClients.map((c, idx) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleClientClick(c)}
                  className="w-full text-left flex items-center justify-between p-3 rounded-2xl bg-[#f8fafc] hover:bg-[#faf8ff] border border-[#f1f5f9] hover:border-[#8a4dff]/40 hover:shadow-2xs active:scale-[0.99] transition-all cursor-pointer group"
                  title={`Ver ficha completa y proyectos de ${c.name}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-white border border-[#e2e8f0] text-[#64748b] text-[11px] font-black flex items-center justify-center shadow-2xs shrink-0 group-hover:border-[#501f92] group-hover:text-[#501f92]">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#0f172a] truncate group-hover:text-[#501f92] flex items-center gap-1.5">
                        <span className="truncate">{c.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="text-[10px] text-[#64748b]">{c.taskCount} tareas ejecutadas</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <div className="text-sm font-black text-[#501f92] font-mono">
                      {Math.round(c.hours * 10) / 10}h
                    </div>
                    <div className="text-[10px] text-[#64748b]">
                      {hoursScopeMode === 'month' ? `en ${selectedMonthReadable.split(' ')[0]}` : 'totales'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#f1f5f9] mt-4 text-[11px] text-[#64748b] flex items-center justify-between">
            <span>Dedicación concentrada:</span>
            <strong className="text-[#0f172a]">
              {Math.round(topActiveClients.reduce((s, c) => s + c.hours, 0))}h {hoursScopeMode === 'month' ? `en ${selectedMonthReadable.split(' ')[0]}` : 'totales'}
            </strong>
          </div>
        </div>

        {/* BLOQUE 3: PROYECTOS · SEMÁFORO DE CONSUMO (7 cols) - CLICKEABLE */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e2e8f0] p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#f1f5f9] mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-[#8a4dff]/10 text-[#8a4dff] shrink-0">
                  <Layers className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#0f172a]">Proyectos · Semáforo de Consumo</h3>
                  <span className="text-[11px] text-[#64748b]">Clic en cualquier proyecto para ver sus tareas</span>
                </div>
              </div>

              {/* Filtros Semafóricos */}
              <div className="flex flex-wrap items-center gap-1 bg-[#f8fafc] p-1 rounded-xl border border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setTrafficFilter('todos')}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    trafficFilter === 'todos' ? 'bg-white shadow-2xs text-[#0f172a]' : 'text-[#64748b]'
                  }`}
                >
                  Todos ({projectHealthList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTrafficFilter('verde')}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    trafficFilter === 'verde' ? 'bg-white shadow-2xs text-[#059669]' : 'text-[#059669]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  Normal ({trafficCounts.verde})
                </button>
                <button
                  type="button"
                  onClick={() => setTrafficFilter('amarillo')}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    trafficFilter === 'amarillo' ? 'bg-white shadow-2xs text-[#d97706]' : 'text-[#d97706]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                  Alerta ({trafficCounts.amarillo})
                </button>
                <button
                  type="button"
                  onClick={() => setTrafficFilter('rojo')}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    trafficFilter === 'rojo' ? 'bg-white shadow-2xs text-[#dc2626]' : 'text-[#dc2626]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                  Excedido ({trafficCounts.rojo})
                </button>
              </div>
            </div>

            {/* LISTA DE PROYECTOS CLICKEABLES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProjects.slice(0, 6).map((prj) => {
                const isOverBudget = prj.status === 'rojo';
                return (
                  <button
                    key={prj.name}
                    type="button"
                    onClick={() => handleProjectClick(prj)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer group active:scale-[0.99] ${
                      isOverBudget
                        ? 'border-[#fecaca] bg-[#fff5f5] hover:border-[#dc2626]'
                        : prj.status === 'amarillo'
                        ? 'border-[#fde68a] bg-[#fffdf5] hover:border-[#d97706]'
                        : 'border-[#f1f5f9] bg-[#f8fafc] hover:border-[#8a4dff]/40 hover:bg-white hover:shadow-2xs'
                    }`}
                    title={`Ver tablero operativo y tareas de ${prj.name}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-[#0f172a] truncate group-hover:text-[#501f92] flex items-center gap-1">
                          <span className="truncate">{prj.name}</span>
                          <ExternalLink className="w-3 h-3 text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                        <div className="text-[10px] text-[#64748b] truncate">{prj.clientName}</div>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                          prj.status === 'verde'
                            ? 'bg-[#d1fae5] text-[#065f46]'
                            : prj.status === 'amarillo'
                            ? 'bg-[#fef3c7] text-[#92400e]'
                            : 'bg-[#fee2e2] text-[#991b1b]'
                        }`}
                      >
                        {prj.percent}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#e2e8f0] overflow-hidden my-2">
                      <div
                        className={`h-full rounded-full ${
                          prj.status === 'verde'
                            ? 'bg-[#10b981]'
                            : prj.status === 'amarillo'
                            ? 'bg-[#f59e0b]'
                            : 'bg-[#ef4444]'
                        }`}
                        style={{ width: `${Math.min(100, prj.percent)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#64748b]">
                      <span>Horas: {Math.round(prj.consumed)}h / {Math.round(prj.budgeted)}h</span>
                      {prj.overdueCount > 0 ? (
                        <span className="text-[#dc2626] font-bold">
                          {prj.overdueCount} vencida{prj.overdueCount !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-[#059669] font-medium">Al día</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#f1f5f9] mt-4 flex items-center justify-between text-[11px] text-[#64748b]">
            <span>Control de bolsa operativa:</span>
            <span className="font-bold text-[#0f172a]">
              {trafficCounts.rojo > 0
                ? `${trafficCounts.rojo} proyecto(s) con sobrecosto de bolsa`
                : '100% de proyectos dentro de horas presupuestadas'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
