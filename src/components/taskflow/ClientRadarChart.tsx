import React, { useState } from 'react';
import { ClientBehaviorScores } from './types';

interface ClientRadarChartProps {
  scores: ClientBehaviorScores;
  size?: number;
}

const AXIS_CONFIG: { key: keyof ClientBehaviorScores; label: string; angleDeg: number }[] = [
  { key: 'rentabilidad', label: 'Rentabilidad', angleDeg: 270 },            // Arriba
  { key: 'cartera', label: 'Cartera', angleDeg: 0 },                       // Derecha
  { key: 'cumplimiento', label: 'Cumplimiento', angleDeg: 90 },             // Abajo
  { key: 'relacion', label: 'Recurrencia / Relación', angleDeg: 180 },      // Izquierda
];

const TICKS = [25, 50, 75, 100];

export const ClientRadarChart: React.FC<ClientRadarChartProps> = ({ scores, size = 320 }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; value: number; x: number; y: number } | null>(null);

  const center = size / 2;
  const maxRadius = size * 0.35; // Leave room for labels

  // Helper to convert polar to cartesian
  const getCoordinates = (angleDeg: number, valueRatio: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const r = valueRatio * maxRadius;
    const x = center + r * Math.cos(angleRad);
    const y = center + r * Math.sin(angleRad);
    return { x, y };
  };

  // Generate polygon points for grid rings (25, 50, 75, 100)
  const getRingPolygonPoints = (tickValue: number) => {
    const ratio = tickValue / 100;
    return AXIS_CONFIG.map((axis) => {
      const { x, y } = getCoordinates(axis.angleDeg, ratio);
      return `${x},${y}`;
    }).join(' ');
  };

  // Generate data polygon points
  const dataPoints = AXIS_CONFIG.map((axis) => {
    const val = scores[axis.key] ?? 50;
    const ratio = Math.max(0, Math.min(100, val)) / 100;
    return {
      axis,
      val,
      ...getCoordinates(axis.angleDeg, ratio)
    };
  });

  const dataPolygonString = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg width={size} height={size} className="overflow-visible">
        {/* Concentric Grid Polygons */}
        {TICKS.map((tick) => (
          <polygon
            key={`ring-${tick}`}
            points={getRingPolygonPoints(tick)}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray={tick < 100 ? '2,2' : undefined}
          />
        ))}

        {/* Radial Axis Lines */}
        {AXIS_CONFIG.map((axis) => {
          const { x, y } = getCoordinates(axis.angleDeg, 1.0);
          return (
            <line
              key={`axis-line-${axis.key}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Center Vertical Axis Value Markers (100, 75, 50, 25) */}
        {TICKS.map((tick) => {
          const ratio = tick / 100;
          const yPos = center - ratio * maxRadius;
          return (
            <text
              key={`tick-text-${tick}`}
              x={center}
              y={yPos - 2}
              textAnchor="middle"
              className="text-[10px] fill-[#64748b] font-mono font-medium"
            >
              {tick}
            </text>
          );
        })}

        {/* Data Area (Translucent Purple Fill + Crisp Stroke) */}
        <polygon
          points={dataPolygonString}
          fill="rgba(138, 77, 255, 0.18)"
          stroke="#501f92"
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Center Point */}
        <circle cx={center} cy={center} r="2.5" fill="#501f92" />

        {/* Data Points / Interactive Nodes */}
        {dataPoints.map((pt) => (
          <g
            key={`pt-${pt.axis.key}`}
            className="cursor-pointer group"
            onMouseEnter={() => setHoveredPoint({ label: pt.axis.label, value: pt.val, x: pt.x, y: pt.y })}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {/* Outer halo */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r="6"
              fill="rgba(80, 31, 146, 0.2)"
              className="group-hover:scale-150 transition-transform"
            />
            {/* Inner dot */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="#501f92"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </g>
        ))}

        {/* Axis Labels Placed Around the Perimeter */}
        {AXIS_CONFIG.map((axis) => {
          const labelDistRatio = 1.25;
          const { x, y } = getCoordinates(axis.angleDeg, labelDistRatio);
          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (axis.angleDeg === 0) textAnchor = 'start';
          if (axis.angleDeg === 180) textAnchor = 'end';

          return (
            <text
              key={`label-${axis.key}`}
              x={x}
              y={axis.angleDeg === 90 ? y + 8 : axis.angleDeg === 270 ? y - 2 : y + 4}
              textAnchor={textAnchor}
              className="text-[11px] font-semibold fill-[#334155]"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute pointer-events-none px-2.5 py-1 rounded-lg bg-[#0f172a] text-white text-[11px] font-bold shadow-lg border border-[#334155] z-20 transform -translate-x-1/2 -translate-y-full mb-2"
          style={{ left: hoveredPoint.x, top: hoveredPoint.y }}
        >
          <span>{hoveredPoint.label}: </span>
          <span className="text-[#d4ff4a]">{hoveredPoint.value}/100</span>
        </div>
      )}
    </div>
  );
};
