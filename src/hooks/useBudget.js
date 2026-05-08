/**
 * useBudget Hook
 * Manages budget creation, monitoring, and alerts
 */

import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { validateBudget, generateUUID } from '../utils/financeCalculations';
import { getExpensesByCategory } from '../utils/financeCalculations';

const BUDGETS_KEY = 'budgets';

export const useBudget = (transactions = []) => {
  const [budgets, setBudgets] = useLocalStorage(BUDGETS_KEY, []);
  const [error, setError] = useState(null);

  /**
   * Add a new budget
   * @param {Object} budget - Budget data
   * @returns {Object|null} Created budget or null
   */
  const addBudget = useCallback((budget) => {
    setError(null);

    const validation = validateBudget(budget);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return null;
    }

    // Check for duplicate category
    const existing = budgets.find((b) => b.category === budget.category);
    if (existing) {
      setError(`Budget for "${budget.category}" already exists`);
      return null;
    }

    const newBudget = {
      ...budget,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };

    setBudgets((prev) => [...prev, newBudget]);
    return newBudget;
  }, [budgets, setBudgets]);

  /**
   * Update a budget
   * @param {string} id - Budget ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated budget or null
   */
  const updateBudget = useCallback((id, updates) => {
    setError(null);

    if (!id) {
      setError('Budget ID is required');
      return null;
    }

    let updatedBudget = null;

    setBudgets((prev) => {
      const index = prev.findIndex((b) => b.id === id);
      if (index === -1) {
        setError('Budget not found');
        return prev;
      }

      updatedBudget = {
        ...prev[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const newBudgets = [...prev];
      newBudgets[index] = updatedBudget;
      return newBudgets;
    });

    return updatedBudget;
  }, [setBudgets]);

  /**
   * Delete a budget
   * @param {string} id - Budget ID
   * @returns {boolean} Success status
   */
  const deleteBudget = useCallback((id) => {
    setError(null);

    if (!id) {
      setError('Budget ID is required');
      return false;
    }

    setBudgets((prev) => prev.filter((b) => b.id !== id));
    return true;
  }, [setBudgets]);

  /**
   * Get budget utilization data
   */
  const budgetUtilization = useMemo(() => {
    if (!Array.isArray(budgets) || !Array.isArray(transactions)) return [];
    const expensesByCategory = getExpensesByCategory(transactions);

    return budgets.map((budget) => {
      const actual = expensesByCategory[budget.category] || 0;
      const budgeted = parseFloat(budget.amount) || 0;
      const utilization = budgeted > 0 ? Math.round((actual / budgeted) * 100) : 0;

      return {
        ...budget,
        actual,
        utilization: Math.min(utilization, 999),
        remaining: Math.max(0, budgeted - actual),
        overspent: actual > budgeted ? actual - budgeted : 0,
        isOverBudget: utilization >= 100,
        isNearLimit: utilization >= (budget.alertThreshold || 80) && utilization < 100,
      };
    });
  }, [budgets, transactions]);

  /**
   * Get budgets that are over or near limit
   */
  const alerts = useMemo(() => {
    return budgetUtilization.filter((b) => b.isOverBudget || b.isNearLimit);
  }, [budgetUtilization]);

  /**
   * Total budgeted amount
   */
  const totalBudgeted = useMemo(() => {
    return budgets.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
  }, [budgets]);

  /**
   * Total actual spending across budgeted categories
   */
  const totalActual = useMemo(() => {
    return budgetUtilization.reduce((sum, b) => sum + b.actual, 0);
  }, [budgetUtilization]);

  return {
    budgets,
    budgetUtilization,
    alerts,
    totalBudgeted,
    totalActual,
    error,
    addBudget,
    updateBudget,
    deleteBudget,
    setError,
  };
};

export default useBudget;
