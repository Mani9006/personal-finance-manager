/**
 * TransactionForm Component
 * Modal form for adding/editing transactions
 */

import React, { useState, useEffect } from 'react';
import { validateTransaction } from '../utils/financeCalculations';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/demoData';

const CATEGORIES = {
  expense: EXPENSE_CATEGORIES.map((c) => c.name),
  income: INCOME_CATEGORIES.map((c) => c.name),
};

const TransactionForm = ({ onSubmit, onClose, categories = [], initialData, currency = 'USD' }) => {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Credit Card',
    tags: [],
    isRecurring: false,
    recurringFrequency: 'monthly',
  });
  const [errors, setErrors] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'expense',
        amount: initialData.amount?.toString() || '',
        category: initialData.category || '',
        description: initialData.description || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        paymentMethod: initialData.paymentMethod || 'Credit Card',
        tags: initialData.tags || [],
        isRecurring: initialData.isRecurring || false,
        recurringFrequency: initialData.recurringFrequency || 'monthly',
      });
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    const validation = validateTransaction(data);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (isEditing) {
      onSubmit(initialData.id, data);
    } else {
      onSubmit(data);
    }
  };

  const availableCategories = CATEGORIES[formData.type] || [];

  const paymentMethods = ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Mobile Pay', 'Check', 'Other'];
  const frequencies = ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {errors.length > 0 && (
          <div style={{ background: 'var(--color-expense-bg)', color: 'var(--color-expense)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {errors.map((err, i) => (
              <div key={i}>• {err}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Type Selector */}
          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="radio-group">
              <button
                type="button"
                className={`radio-group__item radio-group__item--income ${formData.type === 'income' ? 'active' : ''}`}
                onClick={() => handleChange('type', 'income')}
              >
                Income
              </button>
              <button
                type="button"
                className={`radio-group__item radio-group__item--expense ${formData.type === 'expense' ? 'active' : ''}`}
                onClick={() => handleChange('type', 'expense')}
              >
                Expense
              </button>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount ({currency})</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              required
            >
              <option value="">Select category</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              {categories
                .filter((c) => !availableCategories.includes(c))
                .map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="What was this for?"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              maxLength={200}
              required
            />
          </div>

          {/* Payment Method */}
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-select"
              value={formData.paymentMethod}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
            >
              {paymentMethods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button type="button" className="btn btn--secondary" onClick={handleAddTag}>
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary-dark)',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: 0 }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Recurring */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                className={`toggle ${formData.isRecurring ? 'active' : ''}`}
                onClick={() => handleChange('isRecurring', !formData.isRecurring)}
                aria-label="Toggle recurring"
              >
                <div className="toggle__thumb" />
              </button>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Recurring Transaction</span>
            </div>
            {formData.isRecurring && (
              <select
                className="form-select"
                style={{ marginTop: '8px' }}
                value={formData.recurringFrequency}
                onChange={(e) => handleChange('recurringFrequency', e.target.value)}
              >
                {frequencies.map((f) => (
                  <option key={f} value={f}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn--secondary btn--block" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary btn--block">
              {isEditing ? 'Update' : 'Add'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
