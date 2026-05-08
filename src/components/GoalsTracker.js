/**
 * GoalsTracker Component
 * Track and manage savings goals with progress visualization
 */

import React, { useState } from 'react';
import { formatCurrency, calculateGoalProgress } from '../utils/financeCalculations';

const GOAL_COLORS = [
  '#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6',
];

const GoalsTracker = ({ goals, onAdd, onUpdate, onDelete, currency }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    category: 'Savings',
    color: GOAL_COLORS[0],
  });
  const [editingId, setEditingId] = useState(null);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [contributeAmount, setContributeAmount] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      deadline: '',
      category: 'Savings',
      color: GOAL_COLORS[0],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
      });
    } else {
      onAdd(formData);
    }
    resetForm();
  };

  const handleEdit = (goal) => {
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      category: goal.category,
      color: goal.color || GOAL_COLORS[0],
    });
    setEditingId(goal.id);
    setShowForm(true);
  };

  const handleContribute = (e) => {
    e.preventDefault();
    if (!contributeGoal || !contributeAmount) return;

    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount <= 0) return;

    onUpdate(contributeGoal.id, {
      currentAmount: contributeGoal.currentAmount + amount,
    });
    setContributeGoal(null);
    setContributeAmount('');
  };

  const categories = ['Savings', 'Travel', 'Technology', 'Housing', 'Vehicle', 'Education', 'Emergency', 'Retirement', 'Other'];

  const sortedGoals = [...goals].sort((a, b) => {
    const progressA = a.targetAmount > 0 ? (a.currentAmount / a.targetAmount) : 0;
    const progressB = b.targetAmount > 0 ? (b.currentAmount / b.targetAmount) : 0;
    return progressB - progressA;
  });

  const totalTarget = goals.reduce((sum, g) => sum + (parseFloat(g.targetAmount) || 0), 0);
  const totalSaved = goals.reduce((sum, g) => sum + (parseFloat(g.currentAmount) || 0), 0);

  return (
    <div>
      <header className="app-header">
        <h1 className="app-header__title">Savings Goals</h1>
        <div className="app-header__actions">
          <button className="btn btn--sm btn--primary" onClick={() => setShowForm(true)}>
            + New Goal
          </button>
        </div>
      </header>

      <div className="page-content">
        {/* Summary */}
        <div className="summary-cards" style={{ marginBottom: '24px' }}>
          <div className="summary-card">
            <div className="summary-card__label">Total Goals</div>
            <div className="summary-card__value">{goals.length}</div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Total Target</div>
            <div className="summary-card__value">{formatCurrency(totalTarget, currency)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Total Saved</div>
            <div className="summary-card__value summary-card__value--income">
              {formatCurrency(totalSaved, currency)}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Overall Progress</div>
            <div className="summary-card__value summary-card__value--income">
              {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Goal List */}
        {sortedGoals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🎯</div>
            <div className="empty-state__title">No savings goals yet</div>
            <div className="empty-state__text">Create a goal to start saving towards something meaningful</div>
          </div>
        ) : (
          sortedGoals.map((goal) => {
            const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount);
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-card__header">
                  <div>
                    <div className="goal-card__name">{goal.name}</div>
                    <div className="goal-card__deadline">
                      {goal.category}
                      {daysLeft !== null && ` • ${daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn--sm btn--ghost" onClick={() => handleEdit(goal)} aria-label="Edit">
                      ✏️
                    </button>
                    <button className="btn btn--sm btn--ghost" onClick={() => onDelete(goal.id)} aria-label="Delete">
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="goal-card__amounts">
                  <span className="goal-card__current">
                    {formatCurrency(goal.currentAmount, currency)}
                  </span>
                  <span className="goal-card__target">
                    of {formatCurrency(goal.targetAmount, currency)}
                  </span>
                </div>

                <div className="goal-card__progress">
                  <div
                    className="goal-card__progress-bar"
                    style={{
                      width: `${Math.min(progress.percentage, 100)}%`,
                      background: goal.color || GOAL_COLORS[0],
                    }}
                  />
                </div>

                <div className="goal-card__footer">
                  <span>{progress.percentage}% complete</span>
                  <span style={{ color: progress.isComplete ? 'var(--color-income)' : 'var(--color-text-secondary)' }}>
                    {progress.isComplete
                      ? 'Goal reached!'
                      : `${formatCurrency(progress.remaining, currency)} remaining`
                    }
                  </span>
                </div>

                <button
                  className="btn btn--sm btn--primary"
                  style={{ marginTop: '12px', width: '100%' }}
                  onClick={() => {
                    setContributeGoal(goal);
                    setContributeAmount('');
                  }}
                >
                  Add Contribution
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Goal Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? 'Edit Goal' : 'New Savings Goal'}</h2>
              <button className="modal-close" onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Goal Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Emergency Fund"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Target Amount</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Amount</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline (optional)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {GOAL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: color,
                        border: formData.color === color ? '3px solid var(--color-text-primary)' : '3px solid transparent',
                        cursor: 'pointer',
                      }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn--secondary btn--block" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--block">
                  {editingId ? 'Update' : 'Create'} Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeGoal && (
        <div className="modal-overlay" onClick={() => setContributeGoal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add to {contributeGoal.name}</h2>
              <button className="modal-close" onClick={() => setContributeGoal(null)}>✕</button>
            </div>
            <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Current: {formatCurrency(contributeGoal.currentAmount, currency)} of{' '}
              {formatCurrency(contributeGoal.targetAmount, currency)}
            </div>
            <form onSubmit={handleContribute}>
              <div className="form-group">
                <label className="form-label">Contribution Amount</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  autoFocus
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn--secondary btn--block"
                  onClick={() => setContributeGoal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--block">
                  Add Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsTracker;
