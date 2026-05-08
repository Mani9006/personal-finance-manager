/**
 * Date Filter Utilities
 * Helper functions for filtering data by various date ranges
 */

/**
 * Format date as YYYY-MM-DD in local timezone
 * @param {Date} date
 * @returns {string}
 */
const toLocalISOString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get start of day for a given date
 * @param {Date} date
 * @returns {Date}
 */
export const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day for a given date
 * @param {Date} date
 * @returns {Date}
 */
export const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get start of week (Sunday)
 * @param {Date} date
 * @returns {Date}
 */
export const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get start of month
 * @param {Date} date
 * @returns {Date}
 */
export const startOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get start of year
 * @param {Date} date
 * @returns {Date}
 */
export const startOfYear = (date) => {
  const d = new Date(date);
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the date range for "This Week"
 * @returns {Object} {start, end} as ISO date strings
 */
export const getThisWeekRange = () => {
  const now = new Date();
  const start = startOfWeek(now);
  const end = endOfDay(now);
  return {
    start: toLocalISOString(start),
    end: toLocalISOString(end),
  };
};

/**
 * Get the date range for "This Month"
 * @returns {Object} {start, end} as ISO date strings
 */
export const getThisMonthRange = () => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfDay(now);
  return {
    start: toLocalISOString(start),
    end: toLocalISOString(end),
  };
};

/**
 * Get the date range for "Last Month"
 * @returns {Object} {start, end} as ISO date strings
 */
export const getLastMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  return {
    start: toLocalISOString(start),
    end: toLocalISOString(end),
  };
};

/**
 * Get the date range for "This Year"
 * @returns {Object} {start, end} as ISO date strings
 */
export const getThisYearRange = () => {
  const now = new Date();
  const start = startOfYear(now);
  const end = endOfDay(now);
  return {
    start: toLocalISOString(start),
    end: toLocalISOString(end),
  };
};

/**
 * Get the date range for "Last 3 Months"
 * @returns {Object} {start, end} as ISO date strings
 */
export const getLastThreeMonthsRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const end = endOfDay(now);
  return {
    start: toLocalISOString(start),
    end: toLocalISOString(end),
  };
};

/**
 * Get the date range for "Last 6 Months"
 * @returns {Object} {start, end} as ISO date strings
 */
export const getLastSixMonthsRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const end = endOfDay(now);
  return {
    start: toLocalISOString(start),
    end: toLocalISOString(end),
  };
};

/**
 * Get all predefined date ranges
 * @returns {Object} Named date ranges
 */
export const getAllDateRanges = () => ({
  'this_week': getThisWeekRange(),
  'this_month': getThisMonthRange(),
  'last_month': getLastMonthRange(),
  'last_3_months': getLastThreeMonthsRange(),
  'last_6_months': getLastSixMonthsRange(),
  'this_year': getThisYearRange(),
  'all_time': { start: '2000-01-01', end: new Date().toISOString().split('T')[0] },
});

/**
 * Get human-readable label for date range key
 * @param {string} key - Date range key
 * @returns {string} Human-readable label
 */
export const getDateRangeLabel = (key) => {
  const labels = {
    'this_week': 'This Week',
    'this_month': 'This Month',
    'last_month': 'Last Month',
    'last_3_months': 'Last 3 Months',
    'last_6_months': 'Last 6 Months',
    'this_year': 'This Year',
    'all_time': 'All Time',
  };
  return labels[key] || key;
};

/**
 * Filter items by a named date range
 * @param {Array} items - Array of items with date property
 * @param {string} rangeKey - Key from getAllDateRanges
 * @returns {Array} Filtered items
 */
export const filterByDateRangeKey = (items, rangeKey) => {
  if (!Array.isArray(items)) return [];
  if (!rangeKey || rangeKey === 'all_time') return items;

  const ranges = getAllDateRanges();
  const range = ranges[rangeKey];
  if (!range) return items;

  return items.filter((item) => {
    if (!item.date) return false;
    const itemDate = item.date;
    return itemDate >= range.start && itemDate <= range.end;
  });
};

/**
 * Check if a date is within a given range
 * @param {string} dateStr - ISO date string
 * @param {string} startStr - Start date ISO string
 * @param {string} endStr - End date ISO string
 * @returns {boolean}
 */
export const isDateInRange = (dateStr, startStr, endStr) => {
  if (!dateStr) return false;
  return dateStr >= startStr && dateStr <= endStr;
};

/**
 * Get month name from date string
 * @param {string} dateStr - ISO date string
 * @returns {string} Month name
 */
export const getMonthName = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
};

/**
 * Get relative time description
 * @param {string} dateStr - ISO date string
 * @returns {string} Relative time description
 */
export const getRelativeTimeDescription = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Sort items by date (newest first)
 * @param {Array} items - Array of items with date property
 * @returns {Array} Sorted items
 */
export const sortByDateDesc = (items) => {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });
};
