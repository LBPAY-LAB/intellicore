/**
 * Line Chart Component
 * Sprint 14 - US-070: Visualization Components
 *
 * Simple line chart visualization using SVG.
 */

'use client';

import React from 'react';

interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  height?: number;
  color?: string;
  showDots?: boolean;
  showArea?: boolean;
  showGrid?: boolean;
  title?: string;
}

export function LineChart({
  data,
  height = 200,
  color = '#3B82F6',
  showDots = true,
  showArea = true,
  showGrid = true,
  title,
}: LineChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-gray-400">
        No data available
      </div>
    );
  }

  const padding = { top: 20, right: 10, bottom: 30, left: 40 };
  const chartWidth = 100;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const valueRange = maxValue - minValue || 1;

  // Generate points
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * (chartWidth - 10) + 5;
    const y =
      chartHeight - ((item.value - minValue) / valueRange) * chartHeight + padding.top;
    return { x, y, ...item };
  });

  // Generate path
  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  // Generate area path
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

  // Generate grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: padding.top + chartHeight * (1 - ratio),
    value: minValue + valueRange * ratio,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {title && (
        <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
      )}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${chartWidth} ${height}`}
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {showGrid &&
          gridLines.map((line, i) => (
            <g key={i}>
              <line
                x1="0"
                y1={line.y}
                x2={chartWidth}
                y2={line.y}
                stroke="#E5E7EB"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              <text
                x="0"
                y={line.y - 2}
                className="text-[6px] fill-gray-400"
              >
                {Math.round(line.value).toLocaleString()}
              </text>
            </g>
          ))}

        {/* Area fill */}
        {showArea && (
          <path d={areaPath} fill={color} fillOpacity="0.1" />
        )}

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {showDots &&
          points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="2"
              fill="white"
              stroke={color}
              strokeWidth="1.5"
              className="transition-all duration-200 hover:r-3"
            >
              <title>
                {p.label}: {p.value.toLocaleString()}
              </title>
            </circle>
          ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between px-2 mt-1">
        {data.length <= 10 ? (
          data.map((item, index) => (
            <div
              key={index}
              className="text-xs text-gray-500 text-center truncate"
              style={{ maxWidth: `${100 / data.length}%` }}
            >
              {item.label}
            </div>
          ))
        ) : (
          <>
            <div className="text-xs text-gray-500">{data[0].label}</div>
            <div className="text-xs text-gray-500">
              {data[Math.floor(data.length / 2)].label}
            </div>
            <div className="text-xs text-gray-500">
              {data[data.length - 1].label}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
