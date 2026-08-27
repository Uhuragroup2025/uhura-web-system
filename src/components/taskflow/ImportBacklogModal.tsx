import React, { useState } from 'react';
import { TaskItem, ProjectPhaseItem } from './types';
import {
  X,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';

interface ImportBacklogModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  clientName: string;
  phases: ProjectPhaseItem[];
  onImportTasks: (importedTasks: Partial<TaskItem>[]) => void;
}

const SAMPLE_CSV_DATA = `Fase	Frente	Tarea	Rol	Responsable	Horas	Inicio	Entrega	Dependencia
Discovery & Estrategia	Investigación	Benchmark de competencia y arquitectura	Product Lead	Andrés Ríos	4	2026-09-01	2026-09-03	
Discovery & Estrategia	Investigación	Entrevistas a usuarios & mapa de empatía	Product Lead	Andrés Ríos	6	2026-09-04	2026-09-08	Benchmark de competencia y arquitectura
UI/UX & Prototipado	Diseño UI	Design System & Tokens en Figma	Web Designer	Catalina Tejada	12	2026-09-09	2026-09-15	Entrevistas a usuarios & mapa de empatía
UI/UX & Prototipado	Diseño UI	Wireframes interactivos de Checkout y Catálogo	Web Designer	Catalina Tejada	16	2026-09-16	2026-09-24	Design System & Tokens en Figma
Implementación Frontend & Backend	Desarrollo Web	Setup de repositorio Next.js + Tailwind CSS	Front End	Laura Gómez	8	2026-09-25	2026-09-28	Wireframes interactivos de Checkout y Catálogo
Implementación Frontend & Backend	Desarrollo Web	Maquetación de Catálogo y Filtros de Productos	Front End	Laura Gómez	18	2026-09-29	2026-10-10	Setup de repositorio Next.js + Tailwind CSS
Implementación Frontend & Backend	Integraciones	Integración con Pasarela de Pagos (Wompi / PayU)	Tech Lead	Andrés Ríos	14	2026-10-11	2026-10-18	Maquetación de Catálogo y Filtros de Productos
QA & Testing	Calidad	Pruebas de estrés y pasarela en Sandbox	QA Lead	Paola (Lead PM)	8	2026-10-19	2026-10-24	Integración con Pasarela de Pagos (Wompi / PayU)
Despliegue & Cierre	Go-Live	Configuración de Dominio, SSL y CDN en Cloudflare	Tech Lead	Andrés Ríos	4	2026-10-25	2026-10-27	Pruebas de estrés y pasarela en Sandbox`;

export const ImportBacklogModal: React.FC<ImportBacklogModalProps> = ({
  isOpen,
  onClose,
  projectName,
  clientName,
  phases,
  onImportTasks
}) => {
  const [rawText, setRawText] = useState(SAMPLE_CSV_DATA);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parse text whenever rawText changes or on mount
  React.useEffect(() => {
    try {
      if (!rawText.trim()) {
        setParsedRows([]);
        return;
      }

      const lines = rawText.trim().split('\n');
      if (lines.length <= 1) {
        setParsedRows([]);
        return;
      }

      // Check header or parse lines directly
      const rows: any[] = [];
      const isHeader = lines[0].toLowerCase().includes('tarea') || lines[0].toLowerCase().includes('fase');
      const dataLines = isHeader ? lines.slice(1) : lines;

      dataLines.forEach((line, idx) => {
        const cols = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
        if (cols.length >= 3) {
          const fase = cols[0]?.trim() || (phases[0]?.name || 'Discovery');
          const frente = cols[1]?.trim() || 'General';
          const title = cols[2]?.trim() || `Actividad ${idx + 1}`;
          const role = cols[3]?.trim() || 'Front End';
          const assigneeName = cols[4]?.trim() || 'Laura Gómez';
          const hours = parseFloat(cols[5]?.trim() || '4') || 4;
          const startDate = cols[6]?.trim() || '2026-09-01';
          const dueDate = cols[7]?.trim() || '2026-09-15';
          const dependency = cols[8]?.trim() || '';

          rows.push({
            fase,
            frente,
            title,
            budgetedRole: role,
            assigneeName,
            budgetedHours: hours,
            startDate,
            dueDate,
            dependencyTaskTitle: dependency
          });
        }
      });

      setParsedRows(rows);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg('No se pudo procesar el formato de texto. Verifica la separación por tabulación o comas.');
    }
  }, [rawText, phases]);

  if (!isOpen) return null;

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    const tasksToCreate: Partial<TaskItem>[] = parsedRows.map((r, idx) => ({
      id: `t-imp-${Date.now()}-${idx}`,
      title: r.title,
      description: `Actividad importada para el frente ${r.frente} en la fase ${r.fase}`,
      projectName,
      clientName,
      board: projectName,
      frente: r.frente,
      fase: r.fase,
      phase: r.fase,
      department: r.frente,
      budgetedRole: r.budgetedRole,
      executedRoleSnapshot: r.budgetedRole,
      projectType: 'fixed_milestones',
      categoryType: 'client',
      assignee: {
        name: r.assigneeName,
        initials: r.assigneeName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'TM',
        avatarBg: 'bg-[#501f92]',
        role: r.budgetedRole
      },
      startDate: r.startDate,
      dueDate: r.dueDate,
      baselineStartDate: r.startDate,
      baselineDueDate: r.dueDate,
      date: r.startDate,
      dueStatus: 'normal',
      dueText: 'En cronograma',
      status: 'To Do',
      priority: 'Medium',
      completed: false,
      budgetedHours: r.budgetedHours,
      consumedSeconds: 0,
      dependencyTaskTitle: r.dependencyTaskTitle || undefined,
      tags: [r.frente, r.fase, r.budgetedRole]
    }));

    onImportTasks(tasksToCreate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-[#e2e8f0] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#501f92]/10 border border-[#501f92]/20 flex items-center justify-center text-[#501f92]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0f172a]">
                Importar Backlog al Proyecto
              </h2>
              <p className="text-xs text-[#64748b]">
                {projectName} · Mapeo: Fase → Frente → Tarea → Rol → Responsable → Horas → Fechas → Dependencias
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#fee2e2] text-xs text-[#991b1b] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#ef4444]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8fafc] p-3 rounded-2xl border border-[#e2e8f0]">
            <span className="text-xs text-[#475569]">
              Pega tus filas desde Excel/Google Sheets o usa nuestra plantilla de desarrollo web:
            </span>

            <button
              type="button"
              onClick={() => setRawText(SAMPLE_CSV_DATA)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f5f3ff] text-[#501f92] border border-[#e9d5ff] text-xs font-bold hover:bg-[#ede9fe] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cargar Plantilla Web & E-commerce</span>
            </button>
          </div>

          {/* Text Area Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0f172a] block">
              Datos tabular (Separados por tabulaciones o comas)
            </label>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full text-xs font-mono p-3.5 rounded-2xl bg-white text-[#0f172a] border-2 border-[#cbd5e1] focus:border-[#501f92] focus:ring-2 focus:ring-[#501f92]/20 outline-none leading-relaxed shadow-inner placeholder-[#94a3b8]"
              placeholder="Fase	Frente	Tarea	Rol	Responsable	Horas	Inicio	Entrega	Dependencia"
            />
          </div>

          {/* Preview Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#0f172a] flex items-center gap-2">
                <span>Vista Previa del Backlog a Importar</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                  {parsedRows.length} tareas listas
                </span>
              </h3>
              <span className="text-xs font-mono font-bold text-[#501f92]">
                Total: {parsedRows.reduce((a, b) => a + (b.budgetedHours || 0), 0)} h estimadas
              </span>
            </div>

            <div className="border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-2xs max-h-60 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] font-bold text-[#64748b] uppercase tracking-wider sticky top-0">
                    <th className="py-2.5 px-3">FASE</th>
                    <th className="py-2.5 px-3">FRENTE</th>
                    <th className="py-2.5 px-3">TAREA</th>
                    <th className="py-2.5 px-3">ROL</th>
                    <th className="py-2.5 px-3">RESPONSABLE</th>
                    <th className="py-2.5 px-3 text-right">HORAS</th>
                    <th className="py-2.5 px-3">FECHAS</th>
                    <th className="py-2.5 px-3">DEPENDENCIA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {parsedRows.map((r, i) => (
                    <tr key={i} className="hover:bg-[#f8fafc]">
                      <td className="py-2 px-3">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                          {r.fase}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-[#501f92]">{r.frente}</td>
                      <td className="py-2 px-3 font-bold text-[#0f172a]">{r.title}</td>
                      <td className="py-2 px-3 text-[11px] text-[#475569]">{r.budgetedRole}</td>
                      <td className="py-2 px-3 text-[11px] text-[#334155]">{r.assigneeName}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#0f172a]">
                        {r.budgetedHours}h
                      </td>
                      <td className="py-2 px-3 text-[10px] text-[#64748b]">
                        {r.startDate} → {r.dueDate}
                      </td>
                      <td className="py-2 px-3 text-[10px] text-[#64748b] truncate max-w-[120px]">
                        {r.dependencyTaskTitle || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
          <span className="text-xs text-[#64748b]">
            Las tareas importadas se crearán como entidades <strong>Tarea</strong> oficiales del proyecto.
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#cbd5e1] text-xs font-bold text-[#475569] hover:bg-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={parsedRows.length === 0}
              onClick={handleConfirmImport}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                parsedRows.length > 0
                  ? 'bg-[#501f92] hover:bg-[#381566] text-white cursor-pointer'
                  : 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Importar {parsedRows.length} Tareas al Backlog</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
