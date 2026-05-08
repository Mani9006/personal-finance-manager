/**
 * Dashboard Component
 * Main overview with summary cards, recent transactions, and quick insights
 */

import React, { useMemo } from 'react';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  calculateNetWorth,
  calculateSavingsRate,
  formatCurrency,
  getExpensesByCategory,
} from '../utils/financeCalculations';
import { getThisMonthRange, filterByDateRangeKey } from '../utils/dateFilters';
import CategoryPieChart from './CategoryPieChart';

const Dashboard = ({
  transactions,
  budgets,
  budgetUtilization,
  goals,
  bills,
  accounts,
  alerts,
  onNavigate,
  currency,
}) => {
  const monthRange = useMemo(() => getThisMonthRange(), []);

  const thisMonthTransactions = useMemo(() => {
    return filterByDateRangeKey(transactions, 'this_month');
  }, [transactions]);

  const totalIncome = useMemo(() => calculateTotalIncome(thisMonthTransactions), [thisMonthTransactions]);
  const totalExpenses = useMemo(() => calculateTotalExpenses(thisMonthTransactions), [thisMonthTransactions]);
  const balance = useMemo(() => calculateBalance(thisMonthTransactions), [thisMonthTransactions]);
  const netWorth = useMemo(() => calculateNetWorth(accounts), [accounts]);
  const savingsRate = useMemo(() => calculateSavingsRate(thisMonthTransactions), [thisMonthTransactions]);

  const expensesByCategory = useMemo(() => {
    return getExpensesByCategory(thisMonthTransactions);
  }, [thisMonthTransactions]);

  const topSpending = useMemo(() => {
    return Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [expensesByCategory]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const upcomingBills = useMemo(() => {
    return bills
      .filter((b) => !b.isPaid)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 3);
  }, [bills]);

  const goalProgress = useMemo(() => {
    return goals.slice(0, 3).map((g) => ({
      ...g,
      percentage: g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0,
    }));
  }, [goals]);

  const quickActions = [
    { label: 'Add Transaction', icon: '➕', action: () => window.dispatchEvent(new Event('openTransactionForm')) },
    { label: 'View Budgets', icon: '📊', action: () => onNavigate('budgets') },
    { label: 'Analytics', icon: '📈', action: () => onNavigate('analytics') },
    { label: 'Goals', icon: '🎯', action: () => onNavigate('goals') },
  ];

  return (
    <div>
      {/* Header */}
      <header className="app-header">
        <h1 className="app-header__title">💰 Finance Manager</h1>
        <div className="app-header__actions">
          {alerts.length > 0 && (
            <button
              className="btn btn--sm btn--danger"
              onClick={() => onNavigate('budgets')}
            >
              {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </header>

      {/* Net Worth Banner */}
      <div className="card" style={{ margin: '16px 16px 0', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}>
        <div className="net-worth__label" style={{ color: 'rgba(255,255,255,0.8)' }}>Net Worth</div>
        <div className="net-worth__value" style={{ color: 'white' }}>
          {formatCurrency(netWorth, currency)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
          <span>Assets: {formatCurrency(accounts.filter(a => a.type === 'asset').reduce((s, a) => s + a.balance, 0), currency)}</span>
          <span>Liabilities: {formatCurrency(Math.abs(accounts.filter(a => a.type === 'liability').reduce((s, a) => s + a.balance, 0)), currency)}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="page-content">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-card__label">Income</div>
            <div className="summary-card__value summary-card__value--income">
              {formatCurrency(totalIncome, currency)}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Expenses</div>
            <div className="summary-card__value summary-card__value--expense">
              {formatCurrency(totalExpenses, currency)}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Balance</div>
            <div className={`summary-card__value ${balance >= 0 ? 'summary-card__value--balance' : 'summary-card__value--expense'}`}>
              {formatCurrency(balance, currency)}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Savings Rate</div>
            <div className={`summary-card__value ${savingsRate >= 20 ? 'summary-card__value--income' : 'summary-card__value--expense'}`}>
              {savingsRate}%
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="btn btn--secondary"
              style={{ flexDirection: 'column', padding: '12px 4px', fontSize: '11px', gap: '4px' }}
              onClick={action.action}
            >
              <span style={{ fontSize: '24px' }} role="img" aria-hidden="true">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

        {/* Spending by Category */}
        {Object.keys(expensesByCategory).length > 0 && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card__header">
              <div>
                <div className="card__title">Spending by Category</div>
                <div className="card__subtitle">This month</div>
              </div>
            </div>
            <CategoryPieChart data={expensesByCategory} currency={currency} compact />
          </div>
        )}

        {/* Top Spending Categories */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card__header">
            <div className="card__title">Top Spending</div>
          </div>
          {topSpending.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px' }}>
              No expenses this month yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topSpending.map(([category, amount]) => {
                const maxAmount = topSpending[0][1];
                const pct = Math.round((amount / maxAmount) * 100);
                return (
                  <div key={category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                      <span style={{ fontWeight: 500 }}>{category}</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(amount, currency)}</span>
                    </div>
                    <div className="budget-item__progress">
                      <div
                        className="budget-item__progress-bar budget-item__progress-bar--danger"
                        style={{ width: `${pct}%`, opacity: 0.6 + (pct / 100) * 0.4 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Goal Progress Preview */}
        {goalProgress.length > 0 && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card__header">
              <div className="card__title">Savings Goals</div>
              <button className="btn btn--sm btn--ghost" onClick={() => onNavigate('goals')}>
                View All
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {goalProgress.map((goal) => (
                <div key={goal.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                    <span style={{ fontWeight: 500 }}>{goal.name}</span>
                    <span style={{ fontWeight: 600 }}>{goal.percentage}%</span>
                  </div>
                  <div className="goal-card__progress">
                    <div
                      className="goal-card__progress-bar"
                      style={{ width: `${goal.percentage}%`, background: goal.color }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {formatCurrency(goal.currentAmount, currency)} of {formatCurrency(goal.targetAmount, currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Bills */}
        {upcomingBills.length > 0 && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card__header">
              <div className="card__title">Upcoming Bills</div>
              <button className="btn btn--sm btn--ghost" onClick={() => onNavigate('bills')}>
                View All
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingBills.map((bill) => (
                <div
                  key={bill.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px',
                    background: 'var(--color-bg)',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="bill-item__status bill-item__status--upcoming" />
                    <span style={{ fontWeight: 500 }}>{bill.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(bill.amount, currency)}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                      Due {new Date(bill.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Alerts */}
        {alerts.length > 0 && (
          <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--color-expense)' }}>
            <div className="card__header">
              <div className="card__title" style={{ color: 'var(--color-expense)' }}>
                ⚠️ Budget Alerts
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  <strong>{alert.category}</strong>:{' '}
                  {alert.isOverBudget
                    ? `Over budget by ${formatCurrency(alert.overspent, currency)} (${alert.utilization}%)`
                    : `${alert.utilization}% used (${formatCurrency(alert.remaining, currency)} remaining)`
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="card">
          <div className="card__header">
            <div className="card__title">Recent Transactions</div>
            <button className="btn btn--sm btn--ghost" onClick={() => onNavigate('transactions')}>
              View All
            </button>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <div className="empty-state__icon">📝</div>
              <div className="empty-state__title">No transactions yet</div>
              <div className="empty-state__text">Tap + to add your first transaction</div>
            </div>
          ) : (
            <div className="transaction-list">
              {recentTransactions.map((t) => (
                <div key={t.id} className="transaction-item" style={{ padding: '12px' }}>
                  <div
                    className="transaction-item__icon"
                    style={{
                      background: t.type === 'income' ? 'var(--color-income-bg)' : 'var(--color-expense-bg)',
                      width: '40px',
                      height: '40px',
                      fontSize: '18px',
                    }}
                  >
                    {t.type === 'income' ? '↓' : '↑'}
                  </div>
                  <div className="transaction-item__details">
                    <div className="transaction-item__description">{t.description}</div>
                    <div className="transaction-item__meta">{t.category} • {new Date(t.date).toLocaleDateString()}</div>
                  </div>
                  <div className={`transaction-item__amount transaction-item__amount--${t.type}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
