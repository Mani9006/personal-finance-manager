/**
 * BudgetManager Component
 * Create, monitor, and manage budgets with progress tracking
 */

import React, { useState } from 'react';
import { formatCurrency } from '../utils/financeCalculations';
import { EXPENSE_CATEGORIES } from '../utils/demoData';

const BudgetManager = ({ budgets, budgetUtilization, onAdd, onUpdate, onDelete, currency }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: '', amount: '', period: 'monthly', alertThreshold: 80 });
  const [editingId, setEditingId] = useState(null);

  const availableCategories = EXPENSE_CATEGORIES.map((c) => c.name).filter(
    (cat) => !budgets.find((b) => b.category === cat)
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
      alertThreshold: parseInt(formData.alertThreshold) || 80,
    };

    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd(data);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ category: '', amount: '', period: 'monthly', alertThreshold: 80 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (budget) => {
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
      alertThreshold: budget.alertThreshold || 80,
    });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const totalBudgeted = budgetUtilization.reduce((sum, b) => sum + b.budgeted, 0);
  const totalActual = budgetUtilization.reduce((sum, b) => sum + b.actual, 0);
  const overallUtilization = totalBudgeted > 0 ? Math.round((totalActual / totalBudgeted) * 100) : 0;

  return (
    <div>
      <header className="app-header">
        <h1 className="app-header__title">Budgets</h1>
        <div className="app-header__actions">
          <button className="btn btn--sm btn--primary" onClick={() => setShowForm(true)}>
            + New
          </button>
        </div>
      </header>

      <div className="page-content">
        {/* Overall Summary */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card__header">
            <div>
              <div className="card__title">Overall Budget</div>
              <div className="card__subtitle">{budgetUtilization.length} active budgets</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '36px', fontWeight: 700, color: overallUtilization > 100 ? 'var(--color-expense)' : 'var(--color-text-primary)' }}>
              {overallUtilization}%
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>of total budget used</div>
          </div>
          <div className="budget-item__progress" style={{ height: '12px', marginBottom: '12px' }}>
            <div
              className={`budget-item__progress-bar ${
                overallUtilization >= 100
                  ? 'budget-item__progress-bar--danger'
                  : overallUtilization >= 80
                    ? 'budget-item__progress-bar--warning'
                    : 'budget-item__progress-bar--safe'
              }`}
              style={{ width: `${Math.min(overallUtilization, 100)}%` }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Spent: <strong>{formatCurrency(totalActual, currency)}</strong>
            </span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Budgeted: <strong>{formatCurrency(totalBudgeted, currency)}</strong>
            </span>
          </div>
        </div>

        {/* Budget List */}
        {budgetUtilization.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📊</div>
            <div className="empty-state__title">No budgets yet</div>
            <div className="empty-state__text">Create a budget to start tracking your spending</div>
          </div>
        ) : (
          budgetUtilization.map((budget) => (
            <div key={budget.id} className="budget-item">
              <div style={{ width: '100%' }}>
                <div className="budget-item__header">
                  <div>
                    <div className="budget-item__category">{budget.category}</div>
                    <div className="budget-item__amounts">
                      {formatCurrency(budget.actual, currency)} of {formatCurrency(budget.budgeted, currency)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn--sm btn--ghost" onClick={() => handleEdit(budget)} aria-label="Edit">
                      ✏️
                    </button>
                    <button className="btn btn--sm btn--ghost" onClick={() => onDelete(budget.id)} aria-label="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="budget-item__progress">
                  <div
                    className={`budget-item__progress-bar ${
                      budget.isOverBudget
                        ? 'budget-item__progress-bar--danger'
                        : budget.isNearLimit
                          ? 'budget-item__progress-bar--warning'
                          : 'budget-item__progress-bar--safe'
                    }`}
                    style={{ width: `${Math.min(budget.utilization, 100)}%` }}
                  />
                </div>
                <div className="budget-item__footer">
                  <span
                    className={`budget-item__percent ${
                      budget.isOverBudget
                        ? 'budget-item__percent--danger'
                        : budget.isNearLimit
                          ? 'budget-item__percent--warning'
                          : ''
                    }`}
                  >
                    {budget.isOverBudget
                      ? `Over by ${formatCurrency(budget.overspent, currency)}`
                      : `${budget.utilization}% used`
                    }
                  </span>
                  <span style={{ color: budget.remaining > 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
                    {budget.remaining > 0
                      ? `${formatCurrency(budget.remaining, currency)} left`
                      : `${formatCurrency(budget.overspent, currency)} over`
                    }
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Budget Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? 'Edit Budget' : 'New Budget'}</h2>
              <button className="modal-close" onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  disabled={!!editingId}
                >
                  <option value="">Select category</option>
                  {(editingId ? EXPENSE_CATEGORIES.map((c) => c.name) : availableCategories).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Budget Amount</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Alert Threshold (%)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="80"
                  min="1"
                  max="100"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                />
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  You will be alerted when spending reaches this percentage
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn--secondary btn--block" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--block">
                  {editingId ? 'Update' : 'Create'} Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;
