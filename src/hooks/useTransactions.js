/**
 * useTransactions Hook
 * Manages all transaction-related state and operations
 */

import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { validateTransaction, generateUUID } from '../utils/financeCalculations';
import { sortByDateDesc } from '../utils/dateFilters';

const TRANSACTIONS_KEY = 'transactions';

export const useTransactions = () => {
  const [transactions, setTransactions] = useLocalStorage(TRANSACTIONS_KEY, []);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Add a new transaction
   * @param {Object} transaction - Transaction data (without id)
   * @returns {Object|null} Created transaction or null on error
   */
  const addTransaction = useCallback((transaction) => {
    setError(null);

    const validation = validateTransaction(transaction);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return null;
    }

    const newTransaction = {
      ...transaction,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => sortByDateDesc([...prev, newTransaction]));
    return newTransaction;
  }, [setTransactions]);

  /**
   * Update an existing transaction
   * @param {string} id - Transaction ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated transaction or null
   */
  const updateTransaction = useCallback((id, updates) => {
    setError(null);

    if (!id) {
      setError('Transaction ID is required');
      return null;
    }

    let updatedTransaction = null;

    setTransactions((prev) => {
      const index = prev.findIndex((t) => t.id === id);
      if (index === -1) {
        setError('Transaction not found');
        return prev;
      }

      updatedTransaction = {
        ...prev[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const newTransactions = [...prev];
      newTransactions[index] = updatedTransaction;
      return sortByDateDesc(newTransactions);
    });

    return updatedTransaction;
  }, [setTransactions]);

  /**
   * Delete a transaction
   * @param {string} id - Transaction ID
   * @returns {boolean} Success status
   */
  const deleteTransaction = useCallback((id) => {
    setError(null);

    if (!id) {
      setError('Transaction ID is required');
      return false;
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    return true;
  }, [setTransactions]);

  /**
   * Add multiple transactions (e.g., from CSV import)
   * @param {Array} newTransactions - Array of transactions to add
   */
  const addMultipleTransactions = useCallback((newTransactions) => {
    setError(null);

    if (!Array.isArray(newTransactions)) {
      setError('Invalid transactions array');
      return;
    }

    const validTransactions = newTransactions
      .map((t) => {
        const validation = validateTransaction(t);
        if (!validation.isValid) return null;
        return {
          ...t,
          id: t.id || generateUUID(),
          createdAt: t.createdAt || new Date().toISOString(),
        };
      })
      .filter(Boolean);

    setTransactions((prev) => sortByDateDesc([...prev, ...validTransactions]));
  }, [setTransactions]);

  /**
   * Clear all transactions
   */
  const clearAllTransactions = useCallback(() => {
    setError(null);
    setTransactions([]);
  }, [setTransactions]);

  /**
   * Get transactions filtered by type
   */
  const incomeTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'income'),
    [transactions]
  );

  const expenseTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'expense'),
    [transactions]
  );

  /**
   * Get unique categories from transactions
   */
  const categories = useMemo(() => {
    const cats = new Set();
    transactions.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats).sort();
  }, [transactions]);

  return {
    transactions,
    incomeTransactions,
    expenseTransactions,
    categories,
    error,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addMultipleTransactions,
    clearAllTransactions,
    setError,
  };
};

export default useTransactions;
