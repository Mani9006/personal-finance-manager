/**
 * CategoryPieChart Component
 * Pie chart showing spending breakdown by category
 */

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '../utils/financeCalculations';

const COLORS = [
  '#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
  '#f43f5e', '#64748b', '#22c55e', '#a855f7', '#eab308',
];

const CategoryPieChart = ({ data, currency = 'USD', compact = false }) => {
  const chartData = useMemo(() => {
    if (!data || typeof data !== 'object') return [];
    const entries = Object.entries(data)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);

    if (entries.length <= 8) return entries;

    // Group smaller categories as "Other"
    const top = entries.slice(0, 7);
    const other = entries.slice(7).reduce((sum, e) => sum + e.value, 0);
    if (other > 0) {
      top.push({ name: 'Other', value: Math.round(other * 100) / 100 });
    }
    return top;
  }, [data]);

  const total = useMemo(() => chartData.reduce((sum, d) => sum + d.value, 0), [chartData]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    return (
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '13px',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div>{formatCurrency(value, currency)}</div>
        <div style={{ color: 'var(--color-text-secondary)' }}>{percentage}%</div>
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '24px' }}>
        <div className="empty-state__icon">📊</div>
        <div className="empty-state__title">No data available</div>
      </div>
    );
  }

  const chartHeight = compact ? 200 : 280;

  return (
    <div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={compact ? 45 : 60}
            outerRadius={compact ? 75 : 100}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="chart-legend">
        {chartData.map((entry, index) => {
          const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={entry.name} className="chart-legend__item">
              <div
                className="chart-legend__dot"
                style={{ background: COLORS[index % COLORS.length] }}
              />
              <span>{entry.name} ({percentage}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPieChart;
