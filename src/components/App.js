/**
 * App Component - Main Application Container
 * Manages routing between views and global state
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useBudget } from '../hooks/useBudget';
import { useLocalStorage, clearAllStoredData } from '../hooks/useLocalStorage';
import { generateAllDemoData, generateUUID } from '../utils/demoData';
import Dashboard from './Dashboard';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';
import BudgetManager from './BudgetManager';
import SpendingChart from './SpendingChart';
import GoalsTracker from './GoalsTracker';
import BillReminders from './BillReminders';
import Settings from './Settings';

const VIEWS = {
  DASHBOARD: 'dashboard',
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  ANALYTICS: 'analytics',
  GOALS: 'goals',
  BILLS: 'bills',
  SETTINGS: 'settings',
};

const App = () => {
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [toast, setToast] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addMultipleTransactions,
    clearAllTransactions,
    categories,
  } = useTransactions();

  const {
    budgets,
    budgetUtilization,
    alerts,
    addBudget,
    updateBudget,
    deleteBudget,
  } = useBudget(transactions);

  const [goals, setGoals] = useLocalStorage('goals', []);
  const [bills, setBills] = useLocalStorage('bills', []);
  const [accounts, setAccounts] = useLocalStorage('accounts', []);
  const [settings, setSettings] = useLocalStorage('settings', {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    weekStartsOn: 'Sunday',
    defaultView: 'dashboard',
    darkMode: false,
    notifications: true,
  });

  // Initialize with demo data if empty
  useEffect(() => {
    if (!initialized) {
      const hasData = transactions.length > 0 || budgets.length > 0;
      if (!hasData) {
        const demoData = generateAllDemoData();
        addMultipleTransactions(demoData.transactions);
        demoData.budgets.forEach((b) => addBudget(b));
        setGoals(demoData.goals);
        setBills(demoData.bills);
        setAccounts(demoData.accounts);
        showToast('Demo data loaded! Replace with your own data anytime.', 'success');
      }
      setInitialized(true);
    }
  }, [initialized, transactions.length, budgets.length, addMultipleTransactions, addBudget, setGoals, setBills, setAccounts]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const handleAddTransaction = useCallback((transaction) => {
    const result = addTransaction(transaction);
    if (result) {
      showToast('Transaction added successfully');
      setShowForm(false);
    }
    return result;
  }, [addTransaction, showToast]);

  const handleUpdateTransaction = useCallback((id, updates) => {
    const result = updateTransaction(id, updates);
    if (result) {
      showToast('Transaction updated successfully');
      setShowForm(false);
      setEditingTransaction(null);
    }
    return result;
  }, [updateTransaction, showToast]);

  const handleDeleteTransaction = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const success = deleteTransaction(id);
      if (success) showToast('Transaction deleted');
    }
  }, [deleteTransaction, showToast]);

  const handleEditTransaction = useCallback((transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingTransaction(null);
  }, []);

  const handleAddGoal = useCallback((goal) => {
    const newGoal = {
      ...goal,
      id: generateUUID(),
      currentAmount: parseFloat(goal.currentAmount) || 0,
      targetAmount: parseFloat(goal.targetAmount) || 0,
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [...prev, newGoal]);
    showToast('Savings goal added');
  }, [setGoals, showToast]);

  const handleUpdateGoal = useCallback((id, updates) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g))
    );
    showToast('Goal updated');
  }, [setGoals, showToast]);

  const handleDeleteGoal = useCallback((id) => {
    if (window.confirm('Delete this goal?')) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      showToast('Goal deleted');
    }
  }, [setGoals, showToast]);

  const handleAddBill = useCallback((bill) => {
    const newBill = {
      ...bill,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };
    setBills((prev) => [...prev, newBill]);
    showToast('Bill reminder added');
  }, [setBills, showToast]);

  const handleToggleBillPaid = useCallback((id) => {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isPaid: !b.isPaid } : b))
    );
  }, [setBills]);

  const handleDeleteBill = useCallback((id) => {
    if (window.confirm('Delete this bill reminder?')) {
      setBills((prev) => prev.filter((b) => b.id !== id));
      showToast('Bill deleted');
    }
  }, [setBills, showToast]);

  const handleUpdateSettings = useCallback((newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Settings saved');
  }, [setSettings, showToast]);

  const handleResetData = useCallback(() => {
    if (window.confirm('WARNING: This will delete ALL your data. This cannot be undone. Are you sure?')) {
      clearAllStoredData();
      window.location.reload();
    }
  }, []);

  const handleLoadDemoData = useCallback(() => {
    if (window.confirm('This will replace your current data with demo data. Continue?')) {
      clearAllTransactions();
      const demoData = generateAllDemoData();
      addMultipleTransactions(demoData.transactions);
      demoData.budgets.forEach((b) => addBudget(b));
      setGoals(demoData.goals);
      setBills(demoData.bills);
      setAccounts(demoData.accounts);
      showToast('Demo data loaded');
    }
  }, [clearAllTransactions, addMultipleTransactions, addBudget, setGoals, setBills, setAccounts, showToast]);

  const renderView = () => {
    const commonProps = {
      transactions,
      categories,
      currency: settings.currency,
    };

    switch (currentView) {
      case VIEWS.DASHBOARD:
        return (
          <Dashboard
            {...commonProps}
            budgets={budgets}
            budgetUtilization={budgetUtilization}
            goals={goals}
            bills={bills}
            accounts={accounts}
            alerts={alerts}
            onNavigate={setCurrentView}
            onEditTransaction={handleEditTransaction}
          />
        );
      case VIEWS.TRANSACTIONS:
        return (
          <TransactionList
            {...commonProps}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onImport={addMultipleTransactions}
            showToast={showToast}
          />
        );
      case VIEWS.BUDGETS:
        return (
          <BudgetManager
            budgets={budgets}
            budgetUtilization={budgetUtilization}
            onAdd={addBudget}
            onUpdate={updateBudget}
            onDelete={deleteBudget}
            categories={categories}
            currency={settings.currency}
          />
        );
      case VIEWS.ANALYTICS:
        return (
          <SpendingChart
            {...commonProps}
            budgets={budgets}
            budgetUtilization={budgetUtilization}
          />
        );
      case VIEWS.GOALS:
        return (
          <GoalsTracker
            goals={goals}
            onAdd={handleAddGoal}
            onUpdate={handleUpdateGoal}
            onDelete={handleDeleteGoal}
            currency={settings.currency}
          />
        );
      case VIEWS.BILLS:
        return (
          <BillReminders
            bills={bills}
            onAdd={handleAddBill}
            onTogglePaid={handleToggleBillPaid}
            onDelete={handleDeleteBill}
            currency={settings.currency}
          />
        );
      case VIEWS.SETTINGS:
        return (
          <Settings
            settings={settings}
            onUpdate={handleUpdateSettings}
            onResetData={handleResetData}
            onLoadDemoData={handleLoadDemoData}
            transactions={transactions}
            showToast={showToast}
          />
        );
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  const navItems = [
    { key: VIEWS.DASHBOARD, label: 'Home', icon: '🏠' },
    { key: VIEWS.TRANSACTIONS, label: 'Transactions', icon: '📝' },
    { key: VIEWS.BUDGETS, label: 'Budgets', icon: '📊' },
    { key: VIEWS.ANALYTICS, label: 'Analytics', icon: '📈' },
    { key: VIEWS.GOALS, label: 'Goals', icon: '🎯' },
    { key: VIEWS.BILLS, label: 'Bills', icon: '🔔' },
    { key: VIEWS.SETTINGS, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Main Content */}
      <main className="page-content page-content--no-pad">
        {renderView()}
      </main>

      {/* Floating Add Button */}
      {currentView !== VIEWS.SETTINGS && (
        <button
          className="btn--fab"
          onClick={() => {
            setEditingTransaction(null);
            setShowForm(true);
          }}
          aria-label="Add transaction"
        >
          +
        </button>
      )}

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
          onClose={handleCloseForm}
          categories={categories}
          initialData={editingTransaction}
          currency={settings.currency}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`bottom-nav__item ${currentView === item.key ? 'active' : ''}`}
            onClick={() => setCurrentView(item.key)}
            aria-label={item.label}
            aria-current={currentView === item.key ? 'page' : undefined}
          >
            <span role="img" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
