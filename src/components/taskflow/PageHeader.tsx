import React from 'react';

/**
 * Encabezado estándar de pantalla: título (igual al nombre del menú), una línea de contexto
 * y acciones a la derecha. Mismo patrón en todas las vistas de ECO.
 */
interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
    <div className="min-w-0">
      <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">{title}</h1>
      {description && <div className="text-xs sm:text-sm text-[#64748b] mt-1">{description}</div>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">{actions}</div>}
  </div>
);
