/**
 * TransactionList Component
 * Full transaction history with search, filter, and CSV import/export
 */

import React, { useState, useMemo } from 'react';
import {
  formatCurrency,
  formatDate,
  searchTransactions,
  filterByCategory,
} from '../utils/financeCalculations';
import {
  filterByDateRangeKey,
  getAllDateRanges,
  getDateRangeLabel,
} from '../utils/dateFilters';
import { exportToCSV, importFromCSV, downloadCSV, readFileAsText } from '../utils/csvHandler';

const TransactionList = ({ transactions, onEdit, onDelete, onImport, showToast, currency }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('all_time');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search
    if (searchQuery.trim()) {
      result = searchTransactions(result, searchQuery);
    }

    // Category filter
    if (categoryFilter) {
      result = filterByCategory(result, categoryFilter);
    }

    // Date range filter
    if (dateRangeFilter && dateRangeFilter !== 'all_time') {
      result = filterByDateRangeKey(result, dateRangeFilter);
    }

    // Type filter
    if (typeFilter) {
      result = result.filter((t) => t.type === typeFilter);
    }

    return result;
  }, [transactions, searchQuery, categoryFilter, dateRangeFilter, typeFilter]);

  const handleExportCSV = () => {
    const csv = exportToCSV(filteredTransactions);
    const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
    showToast('Transactions exported');
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await readFileAsText(file);
      const result = importFromCSV(text);

      if (result.errors.length > 0) {
        showToast(`${result.errors.length} rows had errors`, 'warning');
        console.warn('Import errors:', result.errors);
      }

      if (result.transactions.length > 0) {
        onImport(result.transactions);
        showToast(`${result.transactions.length} transactions imported`);
      } else if (result.errors.length === 0) {
        showToast('No transactions found in file', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }

    // Reset file input
    e.target.value = '';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setDateRangeFilter('all_time');
    setTypeFilter('');
  };

  const hasActiveFilters = searchQuery || categoryFilter || dateRangeFilter !== 'all_time' || typeFilter;

  const getCategoryColor = (category) => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    let hash = 0;
    for (let i = 0; i < (category || '').length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div>
      <header className="app-header">
        <h1 className="app-header__title">Transactions</h1>
        <div className="app-header__actions">
          <button className="btn btn--sm btn--secondary" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Hide' : 'Filter'}
          </button>
        </div>
      </header>

      <div className="page-content">
        {/* Search */}
        <div className="search-bar">
          <div className="search-input-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--color-surface)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {/* Type filter */}
              <select
                className="form-select"
                style={{ flex: '1 1 120px' }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              {/* Category filter */}
              <select
                className="form-select"
                style={{ flex: '1 1 150px' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Date range filter */}
              <select
                className="form-select"
                style={{ flex: '1 1 150px' }}
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
              >
                {Object.keys(getAllDateRanges()).map((key) => (
                  <option key={key} value={key}>{getDateRangeLabel(key)}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button className="btn btn--sm btn--ghost" onClick={clearFilters}>
                ✕ Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="filter-bar">
            {typeFilter && (
              <span className="filter-chip active" onClick={() => setTypeFilter('')}>
                {typeFilter} ✕
              </span>
            )}
            {categoryFilter && (
              <span className="filter-chip active" onClick={() => setCategoryFilter('')}>
                {categoryFilter} ✕
              </span>
            )}
            {dateRangeFilter !== 'all_time' && (
              <span className="filter-chip active" onClick={() => setDateRangeFilter('all_time')}>
                {getDateRangeLabel(dateRangeFilter)} ✕
              </span>
            )}
          </div>
        )}

        {/* Import/Export */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button className="btn btn--sm btn--secondary" onClick={handleExportCSV}>
            Export CSV
          </button>
          <label className="btn btn--sm btn--secondary" style={{ cursor: 'pointer' }}>
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              style={{ display: 'none' }}
            />
          </label>
          {hasActiveFilters && (
            <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--color-text-secondary)', alignSelf: 'center' }}>
              {filteredTransactions.length} result{filteredTransactions.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Transaction List */}
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <div className="empty-state__title">
              {hasActiveFilters ? 'No matching transactions' : 'No transactions yet'}
            </div>
            <div className="empty-state__text">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Add your first transaction'}
            </div>
          </div>
        ) : (
          <div className="transaction-list">
            {filteredTransactions.map((t) => (
              <div key={t.id} className="transaction-item">
                <div
                  className="transaction-item__icon"
                  style={{
                    background: t.type === 'income'
                      ? 'var(--color-income-bg)'
                      : `${getCategoryColor(t.category)}20`,
                    color: t.type === 'income' ? 'var(--color-income)' : getCategoryColor(t.category),
                  }}
                >
                  {t.type === 'income' ? '↓' : '↑'}
                </div>
                <div className="transaction-item__details">
                  <div className="transaction-item__description">{t.description}</div>
                  <div className="transaction-item__meta">
                    <span style={{ color: getCategoryColor(t.category), fontWeight: 500 }}>{t.category}</span>
                    {' • '}
                    {formatDate(t.date)}
                    {t.paymentMethod && ` • ${t.paymentMethod}`}
                    {t.isRecurring && ' • 🔄'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={`transaction-item__amount transaction-item__amount--${t.type}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      className="btn btn--sm btn--ghost"
                      style={{ padding: '4px', fontSize: '16px' }}
                      onClick={() => onEdit(t)}
                      aria-label="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn--sm btn--ghost"
                      style={{ padding: '4px', fontSize: '16px' }}
                      onClick={() => onDelete(t.id)}
                      aria-label="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
