/**
 * Demo Data Generator
 * Creates realistic sample data for first-time users
 */

// Category definitions with colors and icons
export const EXPENSE_CATEGORIES = [
  { name: 'Housing', color: '#ef4444', icon: '🏠' },
  { name: 'Food & Dining', color: '#f97316', icon: '🍽️' },
  { name: 'Transportation', color: '#3b82f6', icon: '🚗' },
  { name: 'Utilities', color: '#eab308', icon: '💡' },
  { name: 'Entertainment', color: '#a855f7', icon: '🎬' },
  { name: 'Shopping', color: '#ec4899', icon: '🛍️' },
  { name: 'Healthcare', color: '#14b8a6', icon: '🏥' },
  { name: 'Education', color: '#6366f1', icon: '📚' },
  { name: 'Personal Care', color: '#f43f5e', icon: '💇' },
  { name: 'Insurance', color: '#64748b', icon: '🛡️' },
  { name: 'Savings', color: '#22c55e', icon: '💰' },
  { name: 'Travel', color: '#06b6d4', icon: '✈️' },
];

export const INCOME_CATEGORIES = [
  { name: 'Salary', color: '#22c55e', icon: '💼' },
  { name: 'Freelance', color: '#3b82f6', icon: '💻' },
  { name: 'Investments', color: '#a855f7', icon: '📈' },
  { name: 'Gifts', color: '#ec4899', icon: '🎁' },
  { name: 'Refunds', color: '#14b8a6', icon: '↩️' },
  { name: 'Other Income', color: '#64748b', icon: '💵' },
];

/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
let idCounter = 0;
const generateId = () => {
  idCounter += 1;
  return `demo_${Date.now()}_${idCounter}`;
};

/**
 * Generate a random date within a range
 * @param {number} daysBack - Maximum days back from today
 * @returns {string} ISO date string
 */
const randomDate = (daysBack = 90) => {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return past.toISOString().split('T')[0];
};

/**
 * Generate random amount within range
 * @param {number} min - Minimum amount
 * @param {number} max - Maximum amount
 * @returns {number} Random amount
 */
const randomAmount = (min, max) => {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
};

/**
 * Pick a random item from array
 * @param {Array} arr
 * @returns {any} Random item
 */
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Sample descriptions for each category
const DESCRIPTIONS = {
  'Housing': ['Monthly rent payment', 'Mortgage payment', 'Property tax', 'Home maintenance', 'HOA fees'],
  'Food & Dining': ['Grocery shopping', 'Restaurant dinner', 'Coffee shop', 'Fast food', 'Food delivery', 'Farmers market'],
  'Transportation': ['Gas station', 'Uber ride', 'Public transit pass', 'Car insurance', 'Car wash', 'Parking fee'],
  'Utilities': ['Electric bill', 'Water bill', 'Internet service', 'Phone bill', 'Streaming service'],
  'Entertainment': ['Movie tickets', 'Concert tickets', 'Video game purchase', 'Bookstore', 'Subscription service'],
  'Shopping': ['Clothing purchase', 'Electronics', 'Home decor', 'Online shopping', 'Department store'],
  'Healthcare': ['Doctor visit', 'Pharmacy', 'Dental checkup', 'Gym membership', 'Vitamins'],
  'Education': ['Online course', 'Textbooks', 'Workshop fee', 'Professional certification'],
  'Personal Care': ['Haircut', 'Skincare products', 'Spa treatment', 'Laundry service'],
  'Insurance': ['Health insurance', 'Life insurance', 'Renter insurance'],
  'Savings': ['Emergency fund deposit', 'Investment account', 'Retirement contribution'],
  'Travel': ['Flight booking', 'Hotel stay', 'Rental car', 'Travel insurance'],
  'Salary': ['Monthly salary', 'Bonus payment', 'Overtime pay'],
  'Freelance': ['Client payment', 'Project milestone', 'Consulting fee'],
  'Investments': ['Dividend payment', 'Stock sale', 'Interest earned'],
};

/**
 * Generate sample transactions
 * @param {number} count - Number of transactions to generate
 * @returns {Array} Array of transaction objects
 */
export const generateTransactions = (count = 50) => {
  const transactions = [];

  for (let i = 0; i < count; i++) {
    const isIncome = Math.random() < 0.25;
    const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const category = pickRandom(categories);
    const descriptions = DESCRIPTIONS[category.name] || ['Transaction'];

    transactions.push({
      id: generateId(),
      date: randomDate(120),
      type: isIncome ? 'income' : 'expense',
      category: category.name,
      amount: isIncome
        ? randomAmount(500, 5000)
        : randomAmount(5, 300),
      description: pickRandom(descriptions),
      paymentMethod: pickRandom(['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Mobile Pay']),
      tags: [],
      isRecurring: Math.random() < 0.15,
      recurringFrequency: Math.random() < 0.15 ? pickRandom(['weekly', 'monthly', 'yearly']) : '',
      createdAt: new Date().toISOString(),
    });
  }

  return transactions.sort((a, b) => b.date.localeCompare(a.date));
};

/**
 * Generate sample budgets
 * @returns {Array} Array of budget objects
 */
export const generateBudgets = () => {
  const budgetData = [
    { category: 'Housing', amount: 1500 },
    { category: 'Food & Dining', amount: 600 },
    { category: 'Transportation', amount: 400 },
    { category: 'Utilities', amount: 250 },
    { category: 'Entertainment', amount: 200 },
    { category: 'Shopping', amount: 300 },
    { category: 'Healthcare', amount: 200 },
    { category: 'Savings', amount: 500 },
  ];

  return budgetData.map((b) => ({
    id: generateId(),
    category: b.category,
    amount: b.amount,
    period: 'monthly',
    alertThreshold: 80,
    createdAt: new Date().toISOString(),
  }));
};

/**
 * Generate sample savings goals
 * @returns {Array} Array of goal objects
 */
export const generateGoals = () => [
  {
    id: generateId(),
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 6500,
    deadline: '2024-12-31',
    category: 'Savings',
    color: '#ef4444',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Vacation to Japan',
    targetAmount: 5000,
    currentAmount: 2800,
    deadline: '2024-08-15',
    category: 'Travel',
    color: '#3b82f6',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'New Laptop',
    targetAmount: 2000,
    currentAmount: 1200,
    deadline: '2024-06-01',
    category: 'Technology',
    color: '#a855f7',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Home Down Payment',
    targetAmount: 50000,
    currentAmount: 15000,
    deadline: '2026-01-01',
    category: 'Housing',
    color: '#22c55e',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Generate sample bill reminders
 * @returns {Array} Array of bill objects
 */
export const generateBills = () => [
  {
    id: generateId(),
    name: 'Rent',
    amount: 1500,
    dueDate: '2024-01-01',
    frequency: 'monthly',
    category: 'Housing',
    isPaid: false,
    autoPay: true,
    reminderDays: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Electric Bill',
    amount: 120,
    dueDate: '2024-01-15',
    frequency: 'monthly',
    category: 'Utilities',
    isPaid: false,
    autoPay: false,
    reminderDays: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Internet',
    amount: 80,
    dueDate: '2024-01-10',
    frequency: 'monthly',
    category: 'Utilities',
    isPaid: true,
    autoPay: true,
    reminderDays: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Car Insurance',
    amount: 150,
    dueDate: '2024-01-20',
    frequency: 'monthly',
    category: 'Insurance',
    isPaid: false,
    autoPay: true,
    reminderDays: 7,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Gym Membership',
    amount: 50,
    dueDate: '2024-01-05',
    frequency: 'monthly',
    category: 'Healthcare',
    isPaid: true,
    autoPay: false,
    reminderDays: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Streaming Services',
    amount: 35,
    dueDate: '2024-01-12',
    frequency: 'monthly',
    category: 'Entertainment',
    isPaid: false,
    autoPay: true,
    reminderDays: 1,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Generate sample accounts for net worth calculation
 * @returns {Array} Array of account objects
 */
export const generateAccounts = () => [
  { id: generateId(), name: 'Checking Account', type: 'asset', balance: 4500, institution: 'Chase' },
  { id: generateId(), name: 'Savings Account', type: 'asset', balance: 12000, institution: 'Ally' },
  { id: generateId(), name: 'Investment Account', type: 'asset', balance: 25000, institution: 'Fidelity' },
  { id: generateId(), name: '401(k)', type: 'asset', balance: 45000, institution: 'Vanguard' },
  { id: generateId(), name: 'Credit Card', type: 'liability', balance: -1200, institution: 'Amex' },
  { id: generateId(), name: 'Student Loan', type: 'liability', balance: -15000, institution: 'Sallie Mae' },
  { id: generateId(), name: 'Car Loan', type: 'liability', balance: -8000, institution: 'Capital One' },
];

/**
 * Generate all demo data
 * @returns {Object} Complete demo dataset
 */
export const generateAllDemoData = () => ({
  transactions: generateTransactions(60),
  budgets: generateBudgets(),
  goals: generateGoals(),
  bills: generateBills(),
  accounts: generateAccounts(),
  settings: {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    weekStartsOn: 'Sunday',
    defaultView: 'dashboard',
    darkMode: false,
    notifications: true,
  },
});

/**
 * Simple UUID generator (no external dependency needed)
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
