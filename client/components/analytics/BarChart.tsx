/**
 * Bar Chart Component
 * Sprint 14 - US-070: Visualization Components
 *
 * Simple bar chart visualization using SVG.
 */

'use client';

import React from 'react';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  showValues?: boolean;
  showLabels?: boolean;
  title?: string;
}

export function BarChart({
  data,
  height = 200,
  showValues = true,
  showLabels = true,
  title,
}: BarChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-gray-400">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const barWidth = 100 / data.length;

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

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {title && (
        <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
      )}
      <div style={{ height }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
        >
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 40);
            const x = index * barWidth + barWidth * 0.1;
            const y = height - barHeight - 20;
            const color = item.color || defaultColors[index % defaultColors.length];

            return (
              <g key={index}>
                <rect
                  x={`${x}%`}
                  y={y}
                  width={`${barWidth * 0.8}%`}
                  height={barHeight}
                  fill={color}
                  rx="2"
                  className="transition-all duration-300 hover:opacity-80"
                />
                {showValues && (
                  <text
                    x={`${x + barWidth * 0.4}%`}
                    y={y - 5}
                    textAnchor="middle"
                    className="text-[8px] fill-gray-600"
                  >
                    {item.value.toLocaleString()}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {showLabels && (
        <div className="flex justify-around mt-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="text-xs text-gray-500 text-center truncate px-1"
              style={{ width: `${barWidth}%` }}
              title={item.label}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
