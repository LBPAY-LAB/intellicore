/**
 * Pie Chart Component
 * Sprint 14 - US-070: Visualization Components
 *
 * Simple pie/donut chart visualization using SVG.
 */

'use client';

import React from 'react';

interface PieChartData {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  donut?: boolean;
  showLegend?: boolean;
  showLabels?: boolean;
  title?: string;
}

export function PieChart({
  data,
  size = 200,
  donut = false,
  showLegend = true,
  showLabels = true,
  title,
}: PieChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-gray-400">
        No data available
      </div>
    );
  }

  const defaultColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#8B5CF6', // purple
    '#F59E0B', // orange
    '#EF4444', // red
    '#6B7280', // gray
    '#EC4899', // pink
    '#14B8A6', // teal
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10;
  const innerRadius = donut ? radius * 0.6 : 0;

  // Generate pie slices
  let currentAngle = -90; // Start from top
  const slices = data.map((item, index) => {
    const percentage = total > 0 ? item.value / total : 0;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const innerX1 = centerX + innerRadius * Math.cos(startRad);
    const innerY1 = centerY + innerRadius * Math.sin(startRad);
    const innerX2 = centerX + innerRadius * Math.cos(endRad);
    const innerY2 = centerY + innerRadius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const path = donut
      ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${innerX2} ${innerY2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1} Z`
      : `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    const labelAngle = startAngle + angle / 2;
    const labelRad = (labelAngle * Math.PI) / 180;
    const labelRadius = donut ? (radius + innerRadius) / 2 : radius * 0.6;
    const labelX = centerX + labelRadius * Math.cos(labelRad);
    const labelY = centerY + labelRadius * Math.sin(labelRad);

    return {
      path,
      color: item.color || defaultColors[index % defaultColors.length],
      label: item.label,
      value: item.value,
      percentage,
      labelX,
      labelY,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {title && (
        <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
      )}
      <div className="flex items-center justify-center gap-6">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, index) => (
            <g key={index}>
              <path
                d={slice.path}
                fill={slice.color}
                className="transition-all duration-200 hover:opacity-80 cursor-pointer"
              >
                <title>
                  {slice.label}: {slice.value.toLocaleString()} (
                  {(slice.percentage * 100).toFixed(1)}%)
                </title>
              </path>
              {showLabels && slice.percentage > 0.05 && (
                <text
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px] fill-white font-medium pointer-events-none"
                >
                  {(slice.percentage * 100).toFixed(0)}%
                </text>
              )}
            </g>
          ))}
          {donut && (
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xl font-bold fill-gray-700"
            >
              {total.toLocaleString()}
            </text>
          )}
        </svg>

        {showLegend && (
          <div className="flex flex-col gap-2">
            {slices.map((slice, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-sm text-gray-600 truncate max-w-[120px]">
                  {slice.label}
                </span>
                <span className="text-sm text-gray-400">
                  ({(slice.percentage * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
