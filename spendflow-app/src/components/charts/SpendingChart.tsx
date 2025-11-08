'use client';

import { useMemo } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface SpendingChartProps {
  data: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  title?: string;
  height?: number;
}

export function SpendingChart({ data, title = "Spending Breakdown", height = 300 }: SpendingChartProps) {
  const { formatAmount } = useCurrency();
  const total = useMemo(() => data.reduce((sum, item) => sum + item.amount, 0), [data]);

  const radius = Math.min(height / 2 - 20, 100);
  const centerX = radius + 20;
  const centerY = radius + 20;

  const getCoordinates = (percentage: number, index: number) => {
    const angle = (percentage / 100) * 360;
    const startAngle = data.slice(0, index).reduce((sum, item) => sum + (item.percentage / 100) * 360, 0);
    const endAngle = startAngle + angle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return {
      path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      centerAngle: startAngle + angle / 2,
    };
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
      <h3 className="text-lg font-serif text-slate-100 mb-6 text-center">{title}</h3>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Pie Chart */}
        <div className="shrink-0">
          <svg width={radius * 2 + 40} height={radius * 2 + 40} className="drop-shadow-lg">
            {data.map((item, index) => {
              const coords = getCoordinates(item.percentage, index);
              return (
                <path
                  key={item.category}
                  d={coords.path}
                  fill={item.color}
                  stroke="#1e293b"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{`${item.category}: ${formatAmount(item.amount)} (${item.percentage.toFixed(1)}%)`}</title>
                </path>
              );
            })}
            {/* Center circle for donut effect */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.4}
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="2"
            />
            {/* Center text */}
            <text
              x={centerX}
              y={centerY - 8}
              textAnchor="middle"
              className="text-sm font-serif fill-slate-300"
            >
              Total
            </text>
            <text
              x={centerX}
              y={centerY + 8}
              textAnchor="middle"
              className="text-lg font-serif fill-slate-100 font-bold"
            >
              {formatAmount(total)}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {data.map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-slate-200">{item.category}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-serif text-slate-100">{formatAmount(item.amount)}</div>
                <div className="text-xs text-slate-400">{item.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
