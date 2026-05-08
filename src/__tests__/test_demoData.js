/**
 * Tests for demoData.js utility functions
 * Validates demo data generation
 * Uses Node.js built-in test runner
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

const {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  generateTransactions,
  generateBudgets,
  generateGoals,
  generateBills,
  generateAccounts,
  generateAllDemoData,
  generateUUID,
} = require('../src/utils/demoData');

describe('Demo Data', () => {
  describe('Category Definitions', () => {
    it('EXPENSE_CATEGORIES has items', () => {
      assert.ok(EXPENSE_CATEGORIES.length > 0);
      assert.ok(EXPENSE_CATEGORIES[0].name);
      assert.ok(EXPENSE_CATEGORIES[0].color);
    });

    it('INCOME_CATEGORIES has items', () => {
      assert.ok(INCOME_CATEGORIES.length > 0);
      assert.ok(INCOME_CATEGORIES[0].name);
    });
  });

  describe('generateTransactions', () => {
    it('generates requested number of transactions', () => {
      const transactions = generateTransactions(10);
      assert.strictEqual(transactions.length, 10);
    });

    it('generates default count of 50', () => {
      const transactions = generateTransactions();
      assert.strictEqual(transactions.length, 50);
    });

    it('each transaction has required fields', () => {
      const transactions = generateTransactions(5);
      transactions.forEach((t) => {
        assert.ok(t.id);
        assert.ok(t.date);
        assert.ok(t.type);
        assert.ok(['income', 'expense'].includes(t.type));
        assert.ok(t.category);
        assert.ok(typeof t.amount === 'number');
        assert.ok(t.amount > 0);
        assert.ok(t.description);
        assert.ok(t.paymentMethod);
        assert.ok(typeof t.isRecurring === 'boolean');
        assert.ok(t.createdAt);
      });
    });

    it('transactions are sorted by date descending', () => {
      const transactions = generateTransactions(10);
      for (let i = 1; i < transactions.length; i++) {
        assert.ok(transactions[i - 1].date >= transactions[i].date);
      }
    });

    it('generates both income and expense types', () => {
      const transactions = generateTransactions(100);
      const hasIncome = transactions.some((t) => t.type === 'income');
      const hasExpense = transactions.some((t) => t.type === 'expense');
      assert.ok(hasIncome);
      assert.ok(hasExpense);
    });
  });

  describe('generateBudgets', () => {
    it('generates budgets', () => {
      const budgets = generateBudgets();
      assert.ok(budgets.length > 0);
    });

    it('each budget has required fields', () => {
      const budgets = generateBudgets();
      budgets.forEach((b) => {
        assert.ok(b.id);
        assert.ok(b.category);
        assert.ok(b.amount);
        assert.ok(typeof b.amount === 'number');
        assert.ok(b.period);
        assert.ok(b.createdAt);
      });
    });
  });

  describe('generateGoals', () => {
    it('generates goals', () => {
      const goals = generateGoals();
      assert.ok(goals.length > 0);
    });

    it('each goal has required fields', () => {
      const goals = generateGoals();
      goals.forEach((g) => {
        assert.ok(g.id);
        assert.ok(g.name);
        assert.ok(g.targetAmount);
        assert.ok(g.currentAmount);
        assert.ok(g.deadline);
        assert.ok(g.category);
        assert.ok(g.color);
        assert.ok(g.targetAmount > g.currentAmount);
      });
    });
  });

  describe('generateBills', () => {
    it('generates bills', () => {
      const bills = generateBills();
      assert.ok(bills.length > 0);
    });

    it('each bill has required fields', () => {
      const bills = generateBills();
      bills.forEach((b) => {
        assert.ok(b.id);
        assert.ok(b.name);
        assert.ok(b.amount);
        assert.ok(b.dueDate);
        assert.ok(b.frequency);
        assert.ok(b.category);
        assert.ok(typeof b.isPaid === 'boolean');
        assert.ok(typeof b.autoPay === 'boolean');
        assert.ok(typeof b.reminderDays === 'number');
      });
    });
  });

  describe('generateAccounts', () => {
    it('generates accounts', () => {
      const accounts = generateAccounts();
      assert.ok(accounts.length > 0);
    });

    it('has both assets and liabilities', () => {
      const accounts = generateAccounts();
      const hasAssets = accounts.some((a) => a.type === 'asset');
      const hasLiabilities = accounts.some((a) => a.type === 'liability');
      assert.ok(hasAssets);
      assert.ok(hasLiabilities);
    });

    it('each account has required fields', () => {
      const accounts = generateAccounts();
      accounts.forEach((a) => {
        assert.ok(a.id);
        assert.ok(a.name);
        assert.ok(a.type);
        assert.ok(a.balance);
        assert.ok(a.institution);
      });
    });
  });

  describe('generateAllDemoData', () => {
    it('generates complete demo dataset', () => {
      const data = generateAllDemoData();
      assert.ok(data.transactions);
      assert.ok(data.budgets);
      assert.ok(data.goals);
      assert.ok(data.bills);
      assert.ok(data.accounts);
      assert.ok(data.settings);
    });

    it('settings has required fields', () => {
      const data = generateAllDemoData();
      assert.ok(data.settings.currency);
      assert.ok(data.settings.dateFormat);
      assert.ok(typeof data.settings.darkMode === 'boolean');
    });
  });

  describe('generateUUID', () => {
    it('generates valid UUID format', () => {
      const uuid = generateUUID();
      assert.ok(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid));
    });

    it('generates unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      assert.notStrictEqual(uuid1, uuid2);
    });
  });
});
