/**
 * SpendingChart Component
 * Analytics dashboard with multiple chart views
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import CategoryPieChart from './CategoryPieChart';
import TrendChart from './TrendChart';
import { formatCurrency, getExpensesByCategory } from '../utils/financeCalculations';
import { filterByDateRangeKey } from '../utils/dateFilters';

const SpendingChart = ({ transactions, budgets, budgetUtilization, currency }) => {
  const [trendPeriod, setTrendPeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState('this_month');

  const filteredTransactions = useMemo(() => {
    if (dateRange === 'all_time') return transactions;
    return filterByDateRangeKey(transactions, dateRange);
  }, [transactions, dateRange]);

  const expensesByCategory = useMemo(() => {
    return getExpensesByCategory(filteredTransactions);
  }, [filteredTransactions]);

  const budgetComparisonData = useMemo(() => {
    return budgetUtilization.map((b) => ({
      category: b.category,
      budgeted: Math.round(b.budgeted * 100) / 100,
      actual: Math.round(b.actual * 100) / 100,
      remaining: Math.round(b.remaining * 100) / 100,
    }));
  }, [budgetUtilization]);

  const CustomBarTooltip = ({ active, payload, label }) => {
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
        <div style={{ fontWeight: 600, marginBottom: '6px' }}>{label}</div>
        {payload.map((p) => (
          <div key={p.dataKey} style={{ color: p.color, display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span>{p.name}:</span>
            <span style={{ fontWeight: 500 }}>{formatCurrency(p.value, currency)}</span>
          </div>
        ))}
      </div>
    );
  };

  const dateRanges = [
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'last_3_months', label: '3 Months' },
    { key: 'last_6_months', label: '6 Months' },
    { key: 'this_year', label: 'This Year' },
    { key: 'all_time', label: 'All Time' },
  ];

  const trendPeriods = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ];

  const categoryColors = {
    budgeted: '#10b981',
    actual: '#ef4444',
    remaining: '#3b82f6',
  };

  return (
    <div>
      <header className="app-header">
        <h1 className="app-header__title">Analytics</h1>
      </header>

      <div className="page-content">
        {/* Date Range Filter */}
        <div className="tabs" style={{ marginBottom: '24px' }}>
          {dateRanges.map((range) => (
            <button
              key={range.key}
              className={`tab ${dateRange === range.key ? 'active' : ''}`}
              onClick={() => setDateRange(range.key)}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Spending by Category - Pie Chart */}
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Spending by Category</div>
              <div className="card__subtitle">Where your money goes</div>
            </div>
          </div>
          <CategoryPieChart data={expensesByCategory} currency={currency} />
        </div>

        {/* Spending Trends - Line Chart */}
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Spending Trends</div>
              <div className="card__subtitle">Income vs Expenses over time</div>
            </div>
            <div className="tabs" style={{ margin: 0 }}>
              {trendPeriods.map((p) => (
                <button
                  key={p.key}
                  className={`tab ${trendPeriod === p.key ? 'active' : ''}`}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={() => setTrendPeriod(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <TrendChart transactions={filteredTransactions} period={trendPeriod} currency={currency} />
        </div>

        {/* Budget vs Actual - Bar Chart */}
        {budgetComparisonData.length > 0 && (
          <div className="card">
            <div className="card__header">
              <div>
                <div className="card__title">Budget vs Actual</div>
                <div className="card__subtitle">How well you are sticking to your budgets</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetComparisonData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                  tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  width={50}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '8px' }} />
                <Bar dataKey="budgeted" name="Budgeted" fill={categoryColors.budgeted} radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill={categoryColors.actual} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border)',
              textAlign: 'center',
            }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Budgeted</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: categoryColors.budgeted }}>
                  {formatCurrency(budgetUtilization.reduce((s, b) => s + b.budgeted, 0), currency)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Spent</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: categoryColors.actual }}>
                  {formatCurrency(budgetUtilization.reduce((s, b) => s + b.actual, 0), currency)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Remaining</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: categoryColors.remaining }}>
                  {formatCurrency(budgetUtilization.reduce((s, b) => s + b.remaining, 0), currency)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-card__label">Total Expenses</div>
            <div className="summary-card__value summary-card__value--expense">
              {formatCurrency(
                filteredTransactions
                  .filter((t) => t.type === 'expense')
                  .reduce((s, t) => s + parseFloat(t.amount), 0),
                currency
              )}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Total Income</div>
            <div className="summary-card__value summary-card__value--income">
              {formatCurrency(
                filteredTransactions
                  .filter((t) => t.type === 'income')
                  .reduce((s, t) => s + parseFloat(t.amount), 0),
                currency
              )}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Categories</div>
            <div className="summary-card__value">
              {Object.keys(expensesByCategory).length}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Transactions</div>
            <div className="summary-card__value">
              {filteredTransactions.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingChart;
