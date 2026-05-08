# Personal Finance Manager - Architecture Documentation

## Overview

The Personal Finance Manager is a **React-based, mobile-first Progressive Web Application (PWA)** designed for personal finance tracking. All data is stored locally using `localStorage`, ensuring complete privacy and offline functionality.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  App.js (Router)                                             │
│  ├── Dashboard.js (Overview, Net Worth, Quick Actions)      │
│  ├── TransactionList.js (Search, Filter, CSV Import/Export) │
│  ├── TransactionForm.js (Add/Edit Modal)                    │
│  ├── BudgetManager.js (Budget CRUD, Progress Tracking)      │
│  ├── SpendingChart.js (Analytics Dashboard)                 │
│  │   ├── CategoryPieChart.js (Pie Chart)                   │
│  │   └── TrendChart.js (Line Chart)                        │
│  ├── GoalsTracker.js (Savings Goals)                        │
│  ├── BillReminders.js (Recurring Bills)                     │
│  └── Settings.js (Preferences, Data Management)             │
├─────────────────────────────────────────────────────────────┤
│                    STATE MANAGEMENT LAYER                    │
├─────────────────────────────────────────────────────────────┤
│  useLocalStorage.js (Persistent State Hook)                 │
│  useTransactions.js (Transaction CRUD)                      │
│  useBudget.js (Budget Management)                           │
├─────────────────────────────────────────────────────────────┤
│                    BUSINESS LOGIC LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  financeCalculations.js (Core Calculations)                 │
│  dateFilters.js (Date Range Filtering)                      │
│  csvHandler.js (CSV Import/Export)                          │
│  demoData.js (Sample Data Generation)                       │
├─────────────────────────────────────────────────────────────┤
│                    DATA PERSISTENCE LAYER                    │
├─────────────────────────────────────────────────────────────┤
│  localStorage (Browser Storage)                              │
│  ├── pfm_transactions                                        │
│  ├── pfm_budgets                                             │
│  ├── pfm_goals                                               │
│  ├── pfm_bills                                               │
│  ├── pfm_accounts                                            │
│  └── pfm_settings                                            │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Header (sticky)
├── Page Content (dynamic based on currentView)
│   ├── Dashboard
│   │   ├── SummaryCards (income, expenses, balance, savings rate)
│   │   ├── CategoryPieChart
│   │   ├── TopSpendingList
│   │   ├── GoalProgressPreview
│   │   ├── UpcomingBills
│   │   └── RecentTransactions
│   ├── TransactionList
│   │   ├── SearchBar
│   │   ├── FilterPanel (type, category, date range)
│   │   ├── ImportExportControls
│   │   └── TransactionItems
│   ├── BudgetManager
│   │   ├── OverallBudgetSummary
│   │   ├── BudgetItems (with progress bars)
│   │   └── BudgetFormModal
│   ├── SpendingChart
│   │   ├── DateRangeTabs
│   │   ├── CategoryPieChart
│   │   ├── TrendChart
│   │   └── BudgetVsActualBarChart
│   ├── GoalsTracker
│   │   ├── GoalCards (with progress bars)
│   │   ├── GoalFormModal
│   │   └── ContributeModal
│   ├── BillReminders
│   │   ├── SummaryCards
│   │   ├── BillLists (overdue, upcoming, paid)
│   │   └── BillFormModal
│   └── Settings
│       ├── Preferences (dark mode, notifications, currency)
│       ├── DataManagement (export/import, demo data, reset)
│       └── About
├── FAB (Floating Action Button for adding transactions)
├── TransactionFormModal (overlay)
└── BottomNavigation
```

## Data Flow

### Unidirectional Data Flow Pattern

1. **State** lives in custom hooks (useLocalStorage, useTransactions, useBudget)
2. **Props** pass data down to components
3. **Callbacks** pass events up to modify state
4. **localStorage** persists state automatically

```
User Action → Component Callback → Hook Function → State Update → localStorage Sync → Re-render
```

### Example: Adding a Transaction

1. User taps FAB → `showForm = true`
2. User fills form → submits via `handleSubmit`
3. `onSubmit(formData)` called from props
4. `addTransaction(data)` in `useTransactions` hook
5. Validation via `validateTransaction(data)`
6. UUID generated → transaction appended to array
7. `setTransactions(newState)` triggers localStorage update
8. React re-renders with new data

## Custom Hooks

### useLocalStorage

**Purpose:** Persistent state management backed by localStorage.

**API:**
```typescript
const [value, setValue, removeValue] = useLocalStorage(key, initialValue);
```

**Features:**
- Automatic JSON serialization/deserialization
- Cross-tab synchronization via `storage` event
- Error handling for quota exceeded
- Prefixed keys (`pfm_`) to avoid collisions

### useTransactions

**Purpose:** Complete CRUD operations for transactions.

**API:**
```typescript
const {
  transactions,
  incomeTransactions,
  expenseTransactions,
  categories,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addMultipleTransactions,
  clearAllTransactions,
} = useTransactions();
```

**Features:**
- Input validation via `validateTransaction()`
- Auto-sort by date descending
- Computed subsets (income/expense only)
- Unique category extraction

### useBudget

**Purpose:** Budget management with utilization tracking.

**API:**
```typescript
const {
  budgets,
  budgetUtilization,
  alerts,
  totalBudgeted,
  totalActual,
  addBudget,
  updateBudget,
  deleteBudget,
} = useBudget(transactions);
```

**Features:**
- Duplicate category prevention
- Real-time utilization calculation
- Alert generation (near/over budget)
- Remaining/overspent computation

## Utility Modules

### financeCalculations.js

Core business logic for all financial calculations:

| Function | Description |
|----------|-------------|
| `calculateTotalIncome()` | Sum of all income transactions |
| `calculateTotalExpenses()` | Sum of all expense transactions |
| `calculateBalance()` | Income minus expenses |
| `calculateNetWorth()` | Assets minus liabilities |
| `getExpensesByCategory()` | Group expenses by category name |
| `getSpendingTrend()` | Time-series spending data |
| `calculateBudgetUtilization()` | Percentage of budget used |
| `getBudgetComparison()` | Budget vs actual per category |
| `calculateSavingsRate()` | Savings as % of income |
| `calculateGoalProgress()` | Goal completion metrics |
| `formatCurrency()` | Locale-aware currency formatting |
| `validateTransaction()` | Transaction data validation |
| `validateBudget()` | Budget data validation |

### dateFilters.js

Date range utilities for time-based filtering:

| Function | Description |
|----------|-------------|
| `getThisMonthRange()` | Current month start/end |
| `getLastMonthRange()` | Previous month start/end |
| `getThisYearRange()` | Current year start/end |
| `getLastThreeMonthsRange()` | Last 3 months range |
| `getLastSixMonthsRange()` | Last 6 months range |
| `filterByDateRangeKey()` | Filter items by named range |
| `sortByDateDesc()` | Sort by date newest first |

### csvHandler.js

CSV import/export with RFC 4180 compliance:

| Function | Description |
|----------|-------------|
| `exportToCSV()` | Convert transactions to CSV string |
| `importFromCSV()` | Parse CSV to transaction objects |
| `downloadCSV()` | Trigger browser CSV download |
| `readFileAsText()` | Read File object as text |
| `generateCSVTemplate()` | Generate import template |

**Validation on import:**
- Required fields: Date, Type, Category, Amount, Description
- Amount must be positive number
- Type must be "income" or "expense"
- Date must be valid
- Reports per-row errors without failing entire import

### demoData.js

Realistic sample data generator:

| Function | Description |
|----------|-------------|
| `generateTransactions(n)` | Create n realistic transactions |
| `generateBudgets()` | Create sample budgets |
| `generateGoals()` | Create savings goals |
| `generateBills()` | Create bill reminders |
| `generateAccounts()` | Create financial accounts |
| `generateAllDemoData()` | Complete dataset |

## Responsive Design

### Mobile-First Approach

- **Base:** 320px viewport (small phones)
- **Primary:** 375-428px (modern phones)
- **Tablet:** 640px+ (minor adjustments)

### Key Design Decisions

| Element | Mobile Behavior |
|---------|-----------------|
| Bottom Nav | Fixed, 7 tabs with icons |
| FAB | Floating above bottom nav |
| Cards | Full width, vertical stack |
| Modals | Slide up from bottom |
| Charts | ResponsiveContainer auto-scales |
| Forms | Full-width inputs, stacked |

### CSS Custom Properties

All design tokens use CSS custom properties for theming:
- Colors (primary, semantic, neutral)
- Spacing (xs, sm, md, lg, xl)
- Typography (Inter font stack)
- Shadows (3 levels)
- Border radius (4 levels)

Dark mode support via `prefers-color-scheme: dark`.

## Security & Privacy

- **No external API calls** - all data stays on device
- **localStorage** data is sandboxed to origin
- **No authentication** required
- **No tracking** or analytics
- **CSV export** allows user-owned backups

## Performance Considerations

1. **Memoization** via `useMemo` for expensive calculations
2. **Callback memoization** via `useCallback` to prevent re-renders
3. **Lazy loading** - charts only render when tab is active
4. **Virtual scrolling** - lists are capped and paginated
5. **localStorage** writes are debounced naturally by React batching

## Future Architecture Improvements

1. **IndexedDB** migration for larger dataset support
2. **Service Worker** for full offline PWA support
3. **State management** via Context API or Zustand for complex state sharing
4. **Data sync** via encrypted cloud backup (optional)
5. **Plaid/YNAB API** integration for bank account linking
6. **React Native** wrapper for native app distribution
