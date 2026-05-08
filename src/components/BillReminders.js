/**
 * BillReminders Component
 * Manage recurring bills and payment reminders
 */

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../utils/financeCalculations';

const BILL_CATEGORIES = ['Housing', 'Utilities', 'Insurance', 'Healthcare', 'Entertainment', 'Transportation', 'Subscriptions', 'Other'];
const FREQUENCIES = ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'];

const BillReminders = ({ bills, onAdd, onTogglePaid, onDelete, currency }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    frequency: 'monthly',
    category: 'Utilities',
    autoPay: false,
    reminderDays: 3,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      dueDate: '',
      frequency: 'monthly',
      category: 'Utilities',
      autoPay: false,
      reminderDays: 3,
    });
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      amount: parseFloat(formData.amount),
      isPaid: false,
    });
    resetForm();
  };

  // Categorize bills
  const { upcoming, paid, overdue } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [];
    const paid = [];
    const overdue = [];

    bills.forEach((bill) => {
      if (bill.isPaid) {
        paid.push(bill);
      } else {
        const due = new Date(bill.dueDate);
        if (due < today) {
          overdue.push(bill);
        } else {
          upcoming.push(bill);
        }
      }
    });

    upcoming.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    overdue.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    paid.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    return { upcoming, paid, overdue };
  }, [bills]);

  const totalUpcoming = upcoming.reduce((sum, b) => sum + b.amount, 0);
  const totalOverdue = overdue.reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = paid.reduce((sum, b) => sum + b.amount, 0);

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    return `Due in ${diff} days`;
  };

  const renderBillItem = (bill, status) => (
    <div key={bill.id} className="bill-item">
      <div
        className="bill-item__icon"
        style={{
          background:
            status === 'overdue' ? 'var(--color-expense-bg)' :
            status === 'paid' ? 'var(--color-income-bg)' :
            '#fef3c7',
        }}
      >
        <div
          className="bill-item__status"
          style={{
            background:
              status === 'overdue' ? 'var(--color-expense)' :
              status === 'paid' ? 'var(--color-income)' :
              'var(--chart-3)',
          }}
        />
      </div>
      <div className="bill-item__details">
        <div className="bill-item__name">{bill.name}</div>
        <div className="bill-item__meta">
          {bill.category} • {getDaysUntilDue(bill.dueDate)}
          {bill.autoPay && ' • Auto-pay'}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="bill-item__amount">{formatCurrency(bill.amount, currency)}</div>
        <button
          className="btn btn--sm"
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            background: bill.isPaid ? 'var(--color-expense-bg)' : 'var(--color-income-bg)',
            color: bill.isPaid ? 'var(--color-expense)' : 'var(--color-income)',
            borderRadius: '6px',
          }}
          onClick={() => onTogglePaid(bill.id)}
        >
          {bill.isPaid ? 'Unpay' : 'Pay'}
        </button>
        <button
          className="btn btn--sm btn--ghost"
          style={{ padding: '4px', fontSize: '16px' }}
          onClick={() => onDelete(bill.id)}
          aria-label="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <header className="app-header">
        <h1 className="app-header__title">Bill Reminders</h1>
        <div className="app-header__actions">
          <button className="btn btn--sm btn--primary" onClick={() => setShowForm(true)}>
            + Add Bill
          </button>
        </div>
      </header>

      <div className="page-content">
        {/* Summary Cards */}
        <div className="summary-cards" style={{ marginBottom: '24px' }}>
          <div className="summary-card">
            <div className="summary-card__label">Upcoming</div>
            <div className="summary-card__value">{formatCurrency(totalUpcoming, currency)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Paid</div>
            <div className="summary-card__value summary-card__value--income">{formatCurrency(totalPaid, currency)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Overdue</div>
            <div className="summary-card__value summary-card__value--expense">{formatCurrency(totalOverdue, currency)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-card__label">Total Bills</div>
            <div className="summary-card__value">{bills.length}</div>
          </div>
        </div>

        {/* Bill Lists */}
        {bills.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔔</div>
            <div className="empty-state__title">No bills yet</div>
            <div className="empty-state__text">Add recurring bills to get reminders</div>
          </div>
        ) : (
          <>
            {/* Overdue */}
            {overdue.length > 0 && (
              <>
                <div className="section-divider" style={{ color: 'var(--color-expense)' }}>
                  Overdue ({overdue.length})
                </div>
                {overdue.map((b) => renderBillItem(b, 'overdue'))}
              </>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <>
                <div className="section-divider" style={{ color: 'var(--chart-3)' }}>
                  Upcoming ({upcoming.length})
                </div>
                {upcoming.map((b) => renderBillItem(b, 'upcoming'))}
              </>
            )}

            {/* Paid */}
            {paid.length > 0 && (
              <>
                <div className="section-divider" style={{ color: 'var(--color-income)' }}>
                  Paid ({paid.length})
                </div>
                {paid.map((b) => renderBillItem(b, 'paid'))}
              </>
            )}
          </>
        )}
      </div>

      {/* Add Bill Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Bill Reminder</h2>
              <button className="modal-close" onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Bill Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Electricity Bill"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount</label>
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
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
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
                    {BILL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select
                    className="form-select"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f} value={f}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Reminder Days Before</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="3"
                    min="0"
                    max="30"
                    value={formData.reminderDays}
                    onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      type="button"
                      className={`toggle ${formData.autoPay ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, autoPay: !formData.autoPay })}
                    >
                      <div className="toggle__thumb" />
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Auto-pay enabled</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn--secondary btn--block" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--block">
                  Add Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillReminders;
