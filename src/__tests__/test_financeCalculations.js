/**
 * Tests for financeCalculations.js utility functions
 * Comprehensive test suite covering all calculation logic
 * Uses Node.js built-in test runner
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

const {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  calculateNetWorth,
  getExpensesByCategory,
  getSpendingTrend,
  calculateBudgetUtilization,
  getBudgetComparison,
  calculateSavingsRate,
  calculateGoalProgress,
  filterByDateRange,
  filterByCategory,
  searchTransactions,
  formatCurrency,
  formatDate,
  validateTransaction,
  validateBudget,
} = require('../src/utils/financeCalculations');

// Sample transaction data for testing
const mockTransactions = [
  { id: '1', type: 'income', category: 'Salary', amount: 5000, date: '2024-01-01', description: 'January salary' },
  { id: '2', type: 'expense', category: 'Housing', amount: 1500, date: '2024-01-02', description: 'Rent' },
  { id: '3', type: 'expense', category: 'Food', amount: 300, date: '2024-01-03', description: 'Groceries' },
  { id: '4', type: 'income', category: 'Freelance', amount: 800, date: '2024-01-05', description: 'Project' },
  { id: '5', type: 'expense', category: 'Housing', amount: 100, date: '2024-01-06', description: 'Utilities' },
  { id: '6', type: 'expense', category: 'Food', amount: 50, date: '2024-01-07', description: 'Restaurant' },
];

describe('Finance Calculations', () => {
  describe('calculateTotalIncome', () => {
    it('calculates total income correctly', () => {
      assert.strictEqual(calculateTotalIncome(mockTransactions), 5800);
    });

    it('returns 0 for empty array', () => {
      assert.strictEqual(calculateTotalIncome([]), 0);
    });

    it('returns 0 for non-array input', () => {
      assert.strictEqual(calculateTotalIncome(null), 0);
      assert.strictEqual(calculateTotalIncome(undefined), 0);
    });

    it('ignores non-numeric amounts', () => {
      const tx = [
        { type: 'income', amount: 'abc' },
        { type: 'income', amount: 100 },
      ];
      assert.strictEqual(calculateTotalIncome(tx), 100);
    });
  });

  describe('calculateTotalExpenses', () => {
    it('calculates total expenses correctly', () => {
      assert.strictEqual(calculateTotalExpenses(mockTransactions), 1950);
    });

    it('returns 0 for empty array', () => {
      assert.strictEqual(calculateTotalExpenses([]), 0);
    });

    it('returns 0 for non-array input', () => {
      assert.strictEqual(calculateTotalExpenses(null), 0);
    });
  });

  describe('calculateBalance', () => {
    it('calculates balance correctly (income - expenses)', () => {
      assert.strictEqual(calculateBalance(mockTransactions), 3850);
    });

    it('returns 0 for empty array', () => {
      assert.strictEqual(calculateBalance([]), 0);
    });
  });

  describe('calculateNetWorth', () => {
    it('calculates net worth (assets - liabilities)', () => {
      const accounts = [
        { type: 'asset', balance: 50000 },
        { type: 'asset', balance: 10000 },
        { type: 'liability', balance: 20000 },
        { type: 'liability', balance: 5000 },
      ];
      assert.strictEqual(calculateNetWorth(accounts), 35000);
    });

    it('returns 0 for empty array', () => {
      assert.strictEqual(calculateNetWorth([]), 0);
    });

    it('returns 0 for non-array input', () => {
      assert.strictEqual(calculateNetWorth(null), 0);
    });
  });

  describe('getExpensesByCategory', () => {
    it('groups expenses by category', () => {
      const result = getExpensesByCategory(mockTransactions);
      assert.deepStrictEqual(result, {
        Housing: 1600,
        Food: 350,
      });
    });

    it('returns empty object for no expenses', () => {
      assert.deepStrictEqual(getExpensesByCategory([]), {});
    });

    it('returns empty object for non-array', () => {
      assert.deepStrictEqual(getExpensesByCategory(null), {});
    });

    it('uses Uncategorized for missing category', () => {
      const tx = [{ type: 'expense', amount: 100 }];
      assert.deepStrictEqual(getExpensesByCategory(tx), {
        Uncategorized: 100,
      });
    });
  });

  describe('getSpendingTrend', () => {
    it('groups by month by default', () => {
      const result = getSpendingTrend(mockTransactions, 'monthly');
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].amount, 1950);
    });

    it('groups by day', () => {
      const result = getSpendingTrend(mockTransactions, 'daily');
      assert.strictEqual(result.length, 4);
    });

    it('returns empty array for non-array input', () => {
      assert.deepStrictEqual(getSpendingTrend(null), []);
    });
  });

  describe('calculateBudgetUtilization', () => {
    it('calculates utilization percentage', () => {
      assert.strictEqual(calculateBudgetUtilization(1000, 600), 60);
    });

    it('returns 0 when budget is 0', () => {
      assert.strictEqual(calculateBudgetUtilization(0, 100), 0);
    });

    it('handles string inputs', () => {
      assert.strictEqual(calculateBudgetUtilization('1000', '750'), 75);
    });
  });

  describe('getBudgetComparison', () => {
    it('returns budget vs actual comparison', () => {
      const budgets = [
        { category: 'Housing', amount: 1500 },
        { category: 'Food', amount: 500 },
      ];
      const result = getBudgetComparison(budgets, mockTransactions);
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].category, 'Housing');
      assert.strictEqual(result[0].actual, 1600);
      assert.strictEqual(result[0].overspent, 100);
    });

    it('returns empty array for invalid inputs', () => {
      assert.deepStrictEqual(getBudgetComparison(null, []), []);
      assert.deepStrictEqual(getBudgetComparison([], null), []);
    });
  });

  describe('calculateSavingsRate', () => {
    it('calculates savings rate', () => {
      assert.strictEqual(calculateSavingsRate(mockTransactions), 66);
    });

    it('returns 0 when no income', () => {
      assert.strictEqual(calculateSavingsRate([]), 0);
    });
  });

  describe('calculateGoalProgress', () => {
    it('calculates progress percentage', () => {
      const result = calculateGoalProgress(500, 1000);
      assert.strictEqual(result.percentage, 50);
      assert.strictEqual(result.remaining, 500);
      assert.strictEqual(result.isComplete, false);
    });

    it('caps at 100%', () => {
      const result = calculateGoalProgress(1500, 1000);
      assert.strictEqual(result.percentage, 100);
    });

    it('returns 0 for zero target', () => {
      const result = calculateGoalProgress(100, 0);
      assert.strictEqual(result.percentage, 0);
    });

    it('marks complete when reached', () => {
      const result = calculateGoalProgress(1000, 1000);
      assert.strictEqual(result.isComplete, true);
      assert.strictEqual(result.remaining, 0);
    });
  });

  describe('filterByDateRange', () => {
    it('filters transactions by date range', () => {
      const result = filterByDateRange(mockTransactions, '2024-01-01', '2024-01-04');
      assert.strictEqual(result.length, 3);
    });

    it('returns all when no range specified', () => {
      const result = filterByDateRange(mockTransactions, null, null);
      assert.strictEqual(result.length, 6);
    });

    it('returns empty array for non-array input', () => {
      assert.deepStrictEqual(filterByDateRange(null), []);
    });
  });

  describe('filterByCategory', () => {
    it('filters by category', () => {
      const result = filterByCategory(mockTransactions, 'Housing');
      assert.strictEqual(result.length, 2);
    });

    it('returns all when no category specified', () => {
      assert.strictEqual(filterByCategory(mockTransactions, '').length, 6);
    });

    it('returns empty array for non-array', () => {
      assert.deepStrictEqual(filterByCategory(null, 'Food'), []);
    });
  });

  describe('searchTransactions', () => {
    it('searches by description', () => {
      const result = searchTransactions(mockTransactions, 'rent');
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].description, 'Rent');
    });

    it('searches by category', () => {
      const result = searchTransactions(mockTransactions, 'food');
      assert.strictEqual(result.length, 2);
    });

    it('searches by amount', () => {
      const result = searchTransactions(mockTransactions, '5000');
      assert.strictEqual(result.length, 1);
    });

    it('returns all when no query', () => {
      assert.strictEqual(searchTransactions(mockTransactions, '').length, 6);
    });

    it('returns all for null query', () => {
      assert.strictEqual(searchTransactions(mockTransactions, null).length, 6);
    });
  });

  describe('formatCurrency', () => {
    it('formats USD correctly', () => {
      assert.strictEqual(formatCurrency(1234.56), '$1,234.56');
    });

    it('handles zero', () => {
      assert.strictEqual(formatCurrency(0), '$0.00');
    });

    it('returns $0.00 for invalid input', () => {
      assert.strictEqual(formatCurrency('abc'), '$0.00');
    });
  });

  describe('formatDate', () => {
    it('formats date string', () => {
      assert.ok(formatDate('2024-01-15'));
    });

    it('returns empty string for invalid input', () => {
      assert.strictEqual(formatDate(''), '');
    });
  });

  describe('validateTransaction', () => {
    it('validates correct transaction', () => {
      const tx = {
        amount: 100,
        type: 'expense',
        category: 'Food',
        date: '2024-01-01',
        description: 'Test',
      };
      const result = validateTransaction(tx);
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('fails for missing amount', () => {
      const tx = { type: 'expense', category: 'Food', date: '2024-01-01', description: 'Test' };
      const result = validateTransaction(tx);
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.includes('Amount must be greater than 0'));
    });

    it('fails for invalid type', () => {
      const tx = { amount: 100, type: 'invalid', category: 'Food', date: '2024-01-01', description: 'Test' };
      const result = validateTransaction(tx);
      assert.strictEqual(result.isValid, false);
    });

    it('fails for missing category', () => {
      const tx = { amount: 100, type: 'expense', date: '2024-01-01', description: 'Test' };
      const result = validateTransaction(tx);
      assert.strictEqual(result.isValid, false);
    });

    it('fails for short description', () => {
      const tx = { amount: 100, type: 'expense', category: 'Food', date: '2024-01-01', description: 'T' };
      const result = validateTransaction(tx);
      assert.strictEqual(result.isValid, false);
    });

    it('fails for null transaction', () => {
      const result = validateTransaction(null);
      assert.strictEqual(result.isValid, false);
    });
  });

  describe('validateBudget', () => {
    it('validates correct budget', () => {
      const budget = { category: 'Food', amount: 500, period: 'monthly' };
      const result = validateBudget(budget);
      assert.strictEqual(result.isValid, true);
    });

    it('fails for missing category', () => {
      const result = validateBudget({ amount: 500, period: 'monthly' });
      assert.strictEqual(result.isValid, false);
    });

    it('fails for invalid amount', () => {
      const result = validateBudget({ category: 'Food', amount: 0, period: 'monthly' });
      assert.strictEqual(result.isValid, false);
    });

    it('fails for invalid period', () => {
      const result = validateBudget({ category: 'Food', amount: 500, period: 'daily' });
      assert.strictEqual(result.isValid, false);
    });

    it('fails for null budget', () => {
      assert.strictEqual(validateBudget(null).isValid, false);
    });
  });
});
