/**
 * Tests for dateFilters.js utility functions
 * Covers date range calculations and filtering
 * Uses Node.js built-in test runner
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

const {
  startOfDay,
  startOfMonth,
  startOfYear,
  getThisWeekRange,
  getThisMonthRange,
  getLastMonthRange,
  getThisYearRange,
  getLastThreeMonthsRange,
  getLastSixMonthsRange,
  getDateRangeLabel,
  filterByDateRangeKey,
  isDateInRange,
  getMonthName,
  sortByDateDesc,
} = require('../src/utils/dateFilters');

describe('Date Filters', () => {
  describe('startOfDay', () => {
    it('returns start of day', () => {
      const d = new Date('2024-06-15T14:30:00');
      const result = startOfDay(d);
      assert.strictEqual(result.getHours(), 0);
      assert.strictEqual(result.getMinutes(), 0);
      assert.strictEqual(result.getSeconds(), 0);
    });
  });

  describe('startOfMonth', () => {
    it('returns first day of month', () => {
      const d = new Date('2024-06-15');
      const result = startOfMonth(d);
      assert.strictEqual(result.getDate(), 1);
      assert.strictEqual(result.getMonth(), 5);
    });
  });

  describe('startOfYear', () => {
    it('returns first day of year', () => {
      const d = new Date('2024-06-15');
      const result = startOfYear(d);
      assert.strictEqual(result.getMonth(), 0);
      assert.strictEqual(result.getDate(), 1);
      assert.strictEqual(result.getFullYear(), 2024);
    });
  });

  describe('getThisMonthRange', () => {
    it('returns valid date range', () => {
      const range = getThisMonthRange();
      assert.ok(range.start);
      assert.ok(range.end);
      assert.ok(range.start <= range.end);
    });

    it('start string ends with -01', () => {
      const range = getThisMonthRange();
      assert.ok(range.start.endsWith('-01'));
    });
  });

  describe('getLastMonthRange', () => {
    it('returns valid date range', () => {
      const range = getLastMonthRange();
      assert.ok(range.start);
      assert.ok(range.end);
      assert.ok(range.start < range.end);
    });
  });

  describe('getThisYearRange', () => {
    it('returns valid date range', () => {
      const range = getThisYearRange();
      assert.ok(range.start);
      assert.ok(range.end);
      // Start should be YYYY-01-01 format
      assert.ok(range.start.endsWith('-01-01'));
    });
  });

  describe('getLastThreeMonthsRange', () => {
    it('returns range spanning 3 months', () => {
      const range = getLastThreeMonthsRange();
      const start = new Date(range.start);
      const end = new Date(range.end);
      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      assert.ok(diffMonths >= 2);
    });
  });

  describe('getLastSixMonthsRange', () => {
    it('returns range spanning 6 months', () => {
      const range = getLastSixMonthsRange();
      const start = new Date(range.start);
      const end = new Date(range.end);
      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      assert.ok(diffMonths >= 5);
    });
  });

  describe('getThisWeekRange', () => {
    it('returns valid week range', () => {
      const range = getThisWeekRange();
      assert.ok(range.start);
      assert.ok(range.end);
    });
  });

  describe('getDateRangeLabel', () => {
    it('returns labels for known ranges', () => {
      assert.strictEqual(getDateRangeLabel('this_week'), 'This Week');
      assert.strictEqual(getDateRangeLabel('this_month'), 'This Month');
      assert.strictEqual(getDateRangeLabel('last_month'), 'Last Month');
      assert.strictEqual(getDateRangeLabel('this_year'), 'This Year');
      assert.strictEqual(getDateRangeLabel('all_time'), 'All Time');
    });

    it('returns key for unknown range', () => {
      assert.strictEqual(getDateRangeLabel('unknown'), 'unknown');
    });
  });

  describe('filterByDateRangeKey', () => {
    const items = [
      { date: '2024-01-15', name: 'January' },
      { date: '2024-02-20', name: 'February' },
      { date: '2024-03-10', name: 'March' },
      { date: '2023-12-01', name: 'December' },
    ];

    it('returns all items for all_time', () => {
      const result = filterByDateRangeKey(items, 'all_time');
      assert.strictEqual(result.length, items.length);
    });

    it('returns empty array for non-array input', () => {
      assert.deepStrictEqual(filterByDateRangeKey(null, 'this_month'), []);
    });

    it('returns all items for empty range key', () => {
      const result = filterByDateRangeKey(items, '');
      assert.strictEqual(result.length, items.length);
    });
  });

  describe('isDateInRange', () => {
    it('returns true for date in range', () => {
      assert.strictEqual(isDateInRange('2024-06-15', '2024-01-01', '2024-12-31'), true);
    });

    it('returns false for date outside range', () => {
      assert.strictEqual(isDateInRange('2024-06-15', '2024-07-01', '2024-12-31'), false);
    });

    it('returns false for empty date', () => {
      assert.strictEqual(isDateInRange('', '2024-01-01', '2024-12-31'), false);
    });
  });

  describe('getMonthName', () => {
    it('returns month name for valid date', () => {
      assert.ok(getMonthName('2024-06-15'));
    });

    it('returns empty string for empty input', () => {
      assert.strictEqual(getMonthName(''), '');
    });

    it('returns empty string for invalid date', () => {
      assert.strictEqual(getMonthName('invalid'), '');
    });
  });

  describe('sortByDateDesc', () => {
    it('sorts items by date descending', () => {
      const items = [
        { date: '2024-01-01', name: 'First' },
        { date: '2024-03-01', name: 'Third' },
        { date: '2024-02-01', name: 'Second' },
      ];
      const result = sortByDateDesc(items);
      assert.strictEqual(result[0].name, 'Third');
      assert.strictEqual(result[1].name, 'Second');
      assert.strictEqual(result[2].name, 'First');
    });

    it('returns empty array for non-array input', () => {
      assert.deepStrictEqual(sortByDateDesc(null), []);
    });

    it('handles items without dates', () => {
      const items = [
        { date: '2024-01-01' },
        { name: 'No date' },
        { date: '2024-03-01' },
      ];
      const result = sortByDateDesc(items);
      assert.ok(result);
      assert.strictEqual(result.length, 3);
    });
  });
});
