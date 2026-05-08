/**
 * Tests for csvHandler.js utility functions
 * Covers CSV import/export functionality
 * Uses Node.js built-in test runner
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

const {
  CSV_HEADERS,
  exportToCSV,
  importFromCSV,
  generateCSVTemplate,
} = require('../src/utils/csvHandler');

describe('CSV Handler', () => {
  const mockTransactions = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'expense',
      category: 'Food',
      amount: 45.67,
      description: 'Grocery shopping',
      paymentMethod: 'Credit Card',
      tags: ['groceries'],
      isRecurring: false,
      recurringFrequency: '',
    },
    {
      id: '2',
      date: '2024-01-16',
      type: 'income',
      category: 'Salary',
      amount: 5000.00,
      description: 'Monthly salary',
      paymentMethod: 'Bank Transfer',
      tags: [],
      isRecurring: true,
      recurringFrequency: 'monthly',
    },
  ];

  describe('CSV_HEADERS', () => {
    it('contains expected headers', () => {
      assert.ok(CSV_HEADERS.includes('Date'));
      assert.ok(CSV_HEADERS.includes('Type'));
      assert.ok(CSV_HEADERS.includes('Category'));
      assert.ok(CSV_HEADERS.includes('Amount'));
      assert.ok(CSV_HEADERS.includes('Description'));
    });
  });

  describe('exportToCSV', () => {
    it('exports transactions to CSV format', () => {
      const csv = exportToCSV(mockTransactions);
      assert.ok(csv.includes('Date,Type,Category,Amount,Description'));
      assert.ok(csv.includes('2024-01-15'));
      assert.ok(csv.includes('expense'));
      assert.ok(csv.includes('45.67'));
    });

    it('returns headers only for empty array', () => {
      const csv = exportToCSV([]);
      assert.strictEqual(csv, CSV_HEADERS.join(','));
    });

    it('handles null input', () => {
      const csv = exportToCSV(null);
      assert.strictEqual(csv, CSV_HEADERS.join(','));
    });

    it('escapes fields with commas', () => {
      const tx = [{
        ...mockTransactions[0],
        description: 'Store, with comma',
      }];
      const csv = exportToCSV(tx);
      assert.ok(csv.includes('"Store, with comma"'));
    });

    it('escapes fields with quotes', () => {
      const tx = [{
        ...mockTransactions[0],
        description: 'Store "Special" Item',
      }];
      const csv = exportToCSV(tx);
      assert.ok(csv.includes('"Store ""Special"" Item"'));
    });
  });

  describe('importFromCSV', () => {
    it('imports valid CSV data', () => {
      const csv = [
        CSV_HEADERS.join(','),
        '2024-01-15,expense,Food,45.67,Grocery shopping,Credit Card,,No,',
        '2024-01-16,income,Salary,5000.00,Monthly salary,Bank Transfer,,Yes,monthly',
      ].join('\n');

      const result = importFromCSV(csv);
      assert.strictEqual(result.errors.length, 0);
      assert.strictEqual(result.transactions.length, 2);
      assert.strictEqual(result.transactions[0].type, 'expense');
      assert.strictEqual(result.transactions[0].amount, 45.67);
      assert.strictEqual(result.transactions[1].type, 'income');
      assert.strictEqual(result.transactions[1].amount, 5000.00);
    });

    it('returns error for empty CSV', () => {
      const result = importFromCSV('');
      assert.ok(result.errors.includes('No CSV data provided'));
      assert.strictEqual(result.transactions.length, 0);
    });

    it('returns error for missing headers', () => {
      const result = importFromCSV('Name,Value\ntest,1');
      assert.ok(result.errors[0].includes('CSV headers must include'));
    });

    it('skips rows with invalid amounts', () => {
      const csv = [
        CSV_HEADERS.join(','),
        '2024-01-15,expense,Food,abc,Test,Credit Card,,No,',
      ].join('\n');

      const result = importFromCSV(csv);
      assert.strictEqual(result.transactions.length, 0);
      assert.ok(result.errors.length > 0);
    });

    it('skips rows with invalid types', () => {
      const csv = [
        CSV_HEADERS.join(','),
        '2024-01-15,invalid,Food,45.67,Test,Credit Card,,No,',
      ].join('\n');

      const result = importFromCSV(csv);
      assert.strictEqual(result.transactions.length, 0);
      assert.ok(result.errors.length > 0);
    });

    it('skips rows with invalid dates', () => {
      const csv = [
        CSV_HEADERS.join(','),
        'not-a-date,expense,Food,45.67,Test,Credit Card,,No,',
      ].join('\n');

      const result = importFromCSV(csv);
      assert.strictEqual(result.transactions.length, 0);
      assert.ok(result.errors.length > 0);
    });

    it('handles semicolon-separated tags', () => {
      const csv = [
        CSV_HEADERS.join(','),
        '2024-01-15,expense,Food,45.67,Test,Credit Card,groceries;organic,No,',
      ].join('\n');

      const result = importFromCSV(csv);
      assert.deepStrictEqual(result.transactions[0].tags, ['groceries', 'organic']);
    });

    it('handles insufficient columns', () => {
      const csv = [
        CSV_HEADERS.join(','),
        '2024-01-15,expense',
      ].join('\n');

      const result = importFromCSV(csv);
      assert.ok(result.errors[0].includes('Insufficient columns'));
    });
  });

  describe('generateCSVTemplate', () => {
    it('generates template with headers and example row', () => {
      const template = generateCSVTemplate();
      assert.ok(template.includes(CSV_HEADERS.join(',')));
      assert.ok(template.includes('expense'));
      assert.ok(template.includes('Food & Dining'));
    });
  });
});
