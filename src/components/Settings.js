/**
 * Settings Component
 * App configuration, data management, and preferences
 */

import React, { useState } from 'react';
import { useLocalStorage, exportAllData, importAllData } from '../hooks/useLocalStorage';
import { exportToCSV, downloadCSV, generateCSVTemplate } from '../utils/csvHandler';

const Settings = ({ settings, onUpdate, onResetData, onLoadDemoData, transactions, showToast }) => {
  const [showDataSection, setShowDataSection] = useState(false);
  const [showAboutSection, setShowAboutSection] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const handleExportJSON = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Data exported');
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(transactions);
    downloadCSV(csv, `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Transactions exported to CSV');
  };

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    downloadCSV(template, 'import_template.csv');
    showToast('Template downloaded');
  };

  const handleImportJSON = () => {
    if (!importText.trim()) {
      showToast('Paste JSON data first', 'error');
      return;
    }
    const success = importAllData(importText);
    if (success) {
      showToast('Data imported successfully');
      setShowImportModal(false);
      setImportText('');
      setTimeout(() => window.location.reload(), 500);
    } else {
      showToast('Invalid JSON data', 'error');
    }
  };

  const toggleDarkMode = () => {
    onUpdate({ darkMode: !settings.darkMode });
  };

  const toggleNotifications = () => {
    onUpdate({ notifications: !settings.notifications });
  };

  const totalTransactions = transactions.length;
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div>
      <header className="app-header">
        <h1 className="app-header__title">Settings</h1>
      </header>

      <div className="page-content">
        {/* Preferences */}
        <div style={{ marginBottom: '24px' }}>
          <div className="section-divider">Preferences</div>
          <div className="settings-item">
            <div>
              <div className="settings-item__label">Dark Mode</div>
              <div className="settings-item__description">Switch between light and dark theme</div>
            </div>
            <button
              className={`toggle ${settings.darkMode ? 'active' : ''}`}
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              <div className="toggle__thumb" />
            </button>
          </div>
          <div className="settings-item">
            <div>
              <div className="settings-item__label">Notifications</div>
              <div className="settings-item__description">Get alerts for budget limits and due bills</div>
            </div>
            <button
              className={`toggle ${settings.notifications ? 'active' : ''}`}
              onClick={toggleNotifications}
              aria-label="Toggle notifications"
            >
              <div className="toggle__thumb" />
            </button>
          </div>
          <div className="settings-item">
            <div>
              <div className="settings-item__label">Currency</div>
            </div>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '100px' }}
              value={settings.currency}
              onChange={(e) => onUpdate({ currency: e.target.value })}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>
        </div>

        {/* Data Management */}
        <div style={{ marginBottom: '24px' }}>
          <div
            className="section-divider"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowDataSection(!showDataSection)}
          >
            Data Management {showDataSection ? '▲' : '▼'}
          </div>

          {showDataSection && (
            <>
              {/* Data Stats */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <div className="card__title" style={{ marginBottom: '12px', fontSize: '16px' }}>Data Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Transactions:</span>{' '}
                    <strong>{totalTransactions}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Total Income:</span>{' '}
                    <strong style={{ color: 'var(--color-income)' }}>
                      ${totalIncome.toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Total Expenses:</span>{' '}
                    <strong style={{ color: 'var(--color-expense)' }}>
                      ${totalExpenses.toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Net:</span>{' '}
                    <strong style={{ color: (totalIncome - totalExpenses) >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
                      ${(totalIncome - totalExpenses).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Export/Import Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="btn btn--secondary" onClick={handleExportJSON}>
                  💾 Export All Data (JSON)
                </button>
                <button className="btn btn--secondary" onClick={handleExportCSV}>
                  📄 Export Transactions (CSV)
                </button>
                <button className="btn btn--secondary" onClick={handleDownloadTemplate}>
                  📋 Download CSV Template
                </button>
                <button className="btn btn--secondary" onClick={() => setShowImportModal(true)}>
                  📥 Import Data (JSON)
                </button>
                <button className="btn btn--secondary" onClick={onLoadDemoData}>
                  🎲 Load Demo Data
                </button>
              </div>

              {/* Danger Zone */}
              <div style={{ marginTop: '24px' }}>
                <div className="section-divider" style={{ color: 'var(--color-expense)' }}>Danger Zone</div>
                <button className="btn btn--danger btn--block" onClick={onResetData}>
                  🗑️ Reset All Data
                </button>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px', textAlign: 'center' }}>
                  This will permanently delete all your data. Export first if you want to keep it.
                </div>
              </div>
            </>
          )}
        </div>

        {/* About */}
        <div>
          <div
            className="section-divider"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowAboutSection(!showAboutSection)}
          >
            About {showAboutSection ? '▲' : '▼'}
          </div>

          {showAboutSection && (
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                Personal Finance Manager
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                Version 1.0.0
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                A mobile-first personal finance management app built with React.
                Track expenses, manage budgets, and achieve your savings goals.
                All data is stored locally on your device for privacy.
              </p>
              <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Built with React, Recharts, and localStorage
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Import Data</h2>
              <button className="modal-close" onClick={() => setShowImportModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Paste your JSON backup data below. This will replace all current data.
            </p>
            <textarea
              className="form-textarea"
              rows={8}
              placeholder="Paste JSON data here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="btn btn--secondary btn--block" onClick={() => setShowImportModal(false)}>
                Cancel
              </button>
              <button className="btn btn--primary btn--block" onClick={handleImportJSON}>
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
