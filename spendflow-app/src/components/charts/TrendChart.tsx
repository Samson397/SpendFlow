'use client';

import { useMemo } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface TrendChartProps {
  data: Array<{
    period: string;
    amount: number;
    income?: number;
    expenses?: number;
  }>;
  title?: string;
  height?: number;
}

export function TrendChart({ data, title = "Spending Trends", height = 200 }: TrendChartProps) {
  const { formatAmount } = useCurrency();
  const { maxValue, minValue, chartData } = useMemo(() => {
    const values = data.map(d => d.amount);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    // Normalize data points for chart
    const chartData = data.map((item, index) => ({
      ...item,
      x: (index / (data.length - 1)) * 100, // Percentage across chart width
      y: height - 40 - ((item.amount - minValue) / (maxValue - minValue || 1)) * (height - 80), // Y position
    }));

    return { maxValue, minValue, chartData };
  }, [data, height]);

  const createPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      // Create smooth curves using quadratic bezier
      const cpX = (prev.x + curr.x) / 2;
      const cpY = prev.y;

      path += ` Q ${cpX} ${cpY} ${curr.x} ${curr.y}`;
    }

    return path;
  };

  const pathData = createPath(chartData);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
      <h3 className="text-lg font-serif text-slate-100 mb-6 text-center">{title}</h3>

      <div className="relative" style={{ height }}>
        {/* Grid lines */}
        <div className="absolute inset-0">
          {[0, 25, 50, 75, 100].map((percentage) => (
            <div
              key={percentage}
              className="absolute w-full border-t border-slate-600/30"
              style={{ top: `${percentage}%` }}
            />
          ))}
        </div>

        {/* Chart area */}
        <svg
          width="100%"
          height={height}
          className="absolute inset-0"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
        >
          {/* Gradient fill under the line */}
          <defs>
            <linearGradient id="spendingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(245 158 11)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(245 158 11)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Fill area */}
          <path
            d={`${pathData} L 100 ${height} L 0 ${height} Z`}
            fill="url(#spendingGradient)"
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#f59e0b"
              stroke="#1e293b"
              strokeWidth="2"
              className="hover:r-6 transition-all cursor-pointer"
            >
              <title>{`${data[index].period}: ${formatAmount(data[index].amount)}`}</title>
            </circle>
          ))}
        </svg>

        {/* Period labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-400 px-2">
          {data.map((item, index) => (
            <span key={index} className="truncate max-w-16">
              {item.period}
            </span>
          ))}
        </div>

        {/* Value labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-500 py-2">
          <span>{formatAmount(maxValue)}</span>
          <span>{formatAmount((maxValue + minValue) / 2)}</span>
          <span>{formatAmount(minValue)}</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-serif text-slate-100">{formatAmount(maxValue)}</div>
          <div className="text-xs text-slate-400">Peak Spending</div>
        </div>
        <div>
          <div className="text-lg font-serif text-slate-100">{formatAmount(data.reduce((sum, item) => sum + item.amount, 0) / data.length)}</div>
          <div className="text-xs text-slate-400">Average</div>
        </div>
        <div>
          <div className={`text-lg font-serif ${maxValue > data[0]?.amount ? 'text-green-400' : 'text-red-400'}`}>
            {((maxValue - (data[0]?.amount || 0)) / (data[0]?.amount || 1) * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-slate-400">Change</div>
        </div>
      </div>
    </div>
  );
}
