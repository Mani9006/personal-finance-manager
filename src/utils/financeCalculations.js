/**
 * Finance Calculation Utilities
 * Core business logic for personal finance calculations
 */

/**
 * Calculate total income from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Total income amount
 */
export const calculateTotalIncome = (transactions) => {
  if (!Array.isArray(transactions)) return 0;
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
};

/**
 * Calculate total expenses from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Total expense amount
 */
export const calculateTotalExpenses = (transactions) => {
  if (!Array.isArray(transactions)) return 0;
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
};

/**
 * Calculate net balance (income - expenses)
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Net balance
 */
export const calculateBalance = (transactions) => {
  return calculateTotalIncome(transactions) - calculateTotalExpenses(transactions);
};

/**
 * Calculate net worth (assets - liabilities)
 * @param {Array} accounts - Array of account objects with type and balance
 * @returns {number} Net worth
 */
export const calculateNetWorth = (accounts) => {
  if (!Array.isArray(accounts)) return 0;
  const assets = accounts
    .filter((a) => a.type === 'asset')
    .reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
  const liabilities = accounts
    .filter((a) => a.type === 'liability')
    .reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
  return assets - liabilities;
};

/**
 * Group expenses by category
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Category totals keyed by category name
 */
export const getExpensesByCategory = (transactions) => {
  if (!Array.isArray(transactions)) return {};
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      const category = t.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + (parseFloat(t.amount) || 0);
      return acc;
    }, {});
};

/**
 * Get spending trend data for line chart
 * @param {Array} transactions - Array of transaction objects
 * @param {string} period - 'daily' | 'weekly' | 'monthly'
 * @returns {Array} Array of {date, amount} objects
 */
export const getSpendingTrend = (transactions, period = 'monthly') => {
  if (!Array.isArray(transactions)) return [];
  const expenses = transactions.filter((t) => t.type === 'expense');

  const grouped = expenses.reduce((acc, t) => {
    const date = new Date(t.date);
    let key;
    if (period === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (period === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    acc[key] = (acc[key] || 0) + (parseFloat(t.amount) || 0);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Calculate budget utilization percentage
 * @param {number} budgeted - Budgeted amount
 * @param {number} actual - Actual spending
 * @returns {number} Percentage (0-100+)
 */
export const calculateBudgetUtilization = (budgeted, actual) => {
  const b = parseFloat(budgeted) || 0;
  if (b === 0) return 0;
  const a = parseFloat(actual) || 0;
  return Math.round((a / b) * 100);
};

/**
 * Get budget vs actual comparison data
 * @param {Array} budgets - Array of budget objects
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Budget comparison data
 */
export const getBudgetComparison = (budgets, transactions) => {
  if (!Array.isArray(budgets) || !Array.isArray(transactions)) return [];
  const expensesByCategory = getExpensesByCategory(transactions);

  return budgets.map((budget) => {
    const actual = expensesByCategory[budget.category] || 0;
    const utilization = calculateBudgetUtilization(budget.amount, actual);
    return {
      category: budget.category,
      budgeted: parseFloat(budget.amount) || 0,
      actual,
      utilization,
      remaining: Math.max(0, (parseFloat(budget.amount) || 0) - actual),
      overspent: actual > (parseFloat(budget.amount) || 0) ? actual - (parseFloat(budget.amount) || 0) : 0,
    };
  });
};

/**
 * Calculate savings rate
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Savings rate as percentage
 */
export const calculateSavingsRate = (transactions) => {
  const income = calculateTotalIncome(transactions);
  if (income === 0) return 0;
  const balance = calculateBalance(transactions);
  return Math.round((balance / income) * 100);
};

/**
 * Calculate progress toward a savings goal
 * @param {number} current - Current saved amount
 * @param {number} target - Target amount
 * @returns {Object} Progress data
 */
export const calculateGoalProgress = (current, target) => {
  const c = parseFloat(current) || 0;
  const t = parseFloat(target) || 0;
  if (t === 0) return { percentage: 0, remaining: 0 };
  const percentage = Math.min(100, Math.round((c / t) * 100));
  return {
    percentage,
    remaining: Math.max(0, t - c),
    isComplete: c >= t,
  };
};

/**
 * Filter transactions by date range
 * @param {Array} transactions - Array of transaction objects
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {Array} Filtered transactions
 */
export const filterByDateRange = (transactions, startDate, endDate) => {
  if (!Array.isArray(transactions)) return [];
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  return transactions.filter((t) => {
    const tDate = new Date(t.date);
    if (start && tDate < start) return false;
    if (end && tDate > end) return false;
    return true;
  });
};

/**
 * Filter transactions by category
 * @param {Array} transactions - Array of transaction objects
 * @param {string} category - Category name
 * @returns {Array} Filtered transactions
 */
export const filterByCategory = (transactions, category) => {
  if (!Array.isArray(transactions) || !category) return transactions || [];
  return transactions.filter((t) => t.category === category);
};

/**
 * Search transactions by keyword
 * @param {Array} transactions - Array of transaction objects
 * @param {string} query - Search query
 * @returns {Array} Matching transactions
 */
export const searchTransactions = (transactions, query) => {
  if (!Array.isArray(transactions) || !query) return transactions || [];
  const lowerQuery = query.toLowerCase();
  return transactions.filter((t) =>
    (t.description && t.description.toLowerCase().includes(lowerQuery)) ||
    (t.category && t.category.toLowerCase().includes(lowerQuery)) ||
    (t.amount && t.amount.toString().includes(lowerQuery))
  );
};

/**
 * Calculate recurring transaction projections
 * @param {Array} recurring - Array of recurring transaction objects
 * @param {number} months - Number of months to project
 * @returns {Array} Projected transactions
 */
export const projectRecurringTransactions = (recurring, months = 12) => {
  if (!Array.isArray(recurring)) return [];
  const projections = [];
  const today = new Date();

  recurring.forEach((item) => {
    const frequency = item.frequency || 'monthly';
    const amount = parseFloat(item.amount) || 0;
    let occurrences = months;
    if (frequency === 'weekly') occurrences = months * 4;
    if (frequency === 'biweekly') occurrences = months * 2;
    if (frequency === 'quarterly') occurrences = Math.floor(months / 3);
    if (frequency === 'yearly') occurrences = Math.floor(months / 12);

    for (let i = 0; i < occurrences; i++) {
      const projectedDate = new Date(today);
      if (frequency === 'weekly') projectedDate.setDate(today.getDate() + i * 7);
      else if (frequency === 'biweekly') projectedDate.setDate(today.getDate() + i * 14);
      else if (frequency === 'quarterly') projectedDate.setMonth(today.getMonth() + i * 3);
      else if (frequency === 'yearly') projectedDate.setFullYear(today.getFullYear() + i);
      else projectedDate.setMonth(today.getMonth() + i);

      projections.push({
        ...item,
        date: projectedDate.toISOString().split('T')[0],
        isProjected: true,
      });
    }
  });

  return projections.sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Format date to readable string
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

/**
 * Validate transaction data
 * @param {Object} transaction - Transaction object to validate
 * @returns {Object} Validation result {isValid, errors}
 */
export const validateTransaction = (transaction) => {
  const errors = [];
  if (!transaction) {
    return { isValid: false, errors: ['Transaction data is required'] };
  }
  if (!transaction.amount || parseFloat(transaction.amount) <= 0) {
    errors.push('Amount must be greater than 0');
  }
  if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
    errors.push('Type must be income or expense');
  }
  if (!transaction.category) {
    errors.push('Category is required');
  }
  if (!transaction.date) {
    errors.push('Date is required');
  }
  if (!transaction.description || transaction.description.trim().length < 2) {
    errors.push('Description must be at least 2 characters');
  }
  return { isValid: errors.length === 0, errors };
};

/**
 * Validate budget data
 * @param {Object} budget - Budget object to validate
 * @returns {Object} Validation result {isValid, errors}
 */
export const validateBudget = (budget) => {
  const errors = [];
  if (!budget) {
    return { isValid: false, errors: ['Budget data is required'] };
  }
  if (!budget.category) {
    errors.push('Category is required');
  }
  if (!budget.amount || parseFloat(budget.amount) <= 0) {
    errors.push('Budget amount must be greater than 0');
  }
  if (!budget.period || !['monthly', 'weekly', 'yearly'].includes(budget.period)) {
    errors.push('Period must be monthly, weekly, or yearly');
  }
  return { isValid: errors.length === 0, errors };
};
