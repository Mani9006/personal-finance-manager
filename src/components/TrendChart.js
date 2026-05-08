/**
 * TrendChart Component
 * Line chart showing spending/income trends over time
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../utils/financeCalculations';

const TrendChart = ({ transactions, period = 'monthly', currency = 'USD' }) => {
  const data = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) return [];

    const grouped = {};

    transactions.forEach((t) => {
      if (!t.date) return;
      const date = new Date(t.date);
      let key;

      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = { date: key, income: 0, expense: 0 };
      }

      const amount = parseFloat(t.amount) || 0;
      if (t.type === 'income') {
        grouped[key].income += amount;
      } else {
        grouped[key].expense += amount;
      }
    });

    return Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        ...d,
        income: Math.round(d.income * 100) / 100,
        expense: Math.round(d.expense * 100) / 100,
        net: Math.round((d.income - d.expense) * 100) / 100,
      }));
  }, [transactions, period]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ fontWeight: 600, marginBottom: '6px' }}>
          {period === 'monthly'
            ? new Date(label + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : new Date(label).toLocaleDateString()
          }
        </div>
        {payload.map((p) => (
          <div key={p.dataKey} style={{ color: p.color, display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span>{p.name}:</span>
            <span style={{ fontWeight: 500 }}>{formatCurrency(p.value, currency)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '24px' }}>
        <div className="empty-state__icon">📈</div>
        <div className="empty-state__title">No trend data available</div>
      </div>
    );
  }

  const formatXAxisLabel = (value) => {
    if (period === 'monthly') {
      const date = new Date(value + '-01');
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
    return new Date(value).getDate().toString();
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
          tickFormatter={formatXAxisLabel}
          tickLine={false}
          axisLine={{ stroke: 'var(--color-border)' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
          tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
          tickLine={false}
          axisLine={{ stroke: 'var(--color-border)' }}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '13px', paddingTop: '8px' }}
        />
        <Line
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 3, fill: '#10b981' }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          name="Expense"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 3, fill: '#ef4444' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
