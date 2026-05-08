# 💰 Personal Finance Manager

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Recharts-2.10.0-22B5BF?logo=chart.js&logoColor=white" alt="Recharts" />
  <img src="https://img.shields.io/badge/Jest-29.7.0-C21325?logo=jest&logoColor=white" alt="Jest" />
  <img src="https://img.shields.io/badge/ESLint-8.50.0-4B32C3?logo=eslint&logoColor=white" alt="ESLint" />
  <img src="https://img.shields.io/badge/Mobile--First-Responsive-10b981" alt="Mobile First" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
</p>

A **mobile-first Progressive Web Application (PWA)** for managing personal finances. Built with React and designed for everyday use on smartphones, tablets, and desktops. All data stays on your device - complete privacy, no accounts required.

<p align="center">
  <img src="docs/screenshot-dashboard.png" alt="Dashboard" width="280" />
  <img src="docs/screenshot-transactions.png" alt="Transactions" width="280" />
  <img src="docs/screenshot-analytics.png" alt="Analytics" width="280" />
</p>

## ✨ Features

### Core Features
- **📊 Dashboard** - At-a-glance overview with net worth, income, expenses, balance, and savings rate
- **💸 Transaction Tracking** - Log income and expenses with categories, descriptions, tags, and payment methods
- **📈 Spending Analytics** - Interactive charts: pie chart by category, line chart for trends, bar chart for budget vs actual
- **📋 Budget Management** - Create monthly budgets per category with utilization tracking and overspend alerts
- **🎯 Savings Goals** - Set financial goals with progress tracking and contribution logging
- **🔔 Bill Reminders** - Track recurring bills with due dates, auto-pay flags, and payment status
- **💳 Net Worth Calculation** - Track assets and liabilities for real-time net worth display

### Advanced Features
- **🔍 Search & Filter** - Full-text search across transactions with date range, category, and type filters
- **📤 CSV Import/Export** - Import transactions from banks or export for spreadsheet analysis
- **🎲 Demo Data** - Instantly populate with realistic sample data to explore features
- **💾 Data Persistence** - All data saved to localStorage - survives browser restarts
- **🔒 Privacy-First** - No server, no API calls, no tracking - data never leaves your device
- **🌙 Dark Mode** - Automatic dark theme support
- **📱 PWA Ready** - Install as a standalone app on mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd project_18_finance_manager

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`. It's optimized for mobile viewing - use your browser's device emulation (F12 → Toggle Device Toolbar) for the best experience.

### Building for Production

```bash
# Create optimized production build
npm run build

# The build/ folder contains the deployable app
```

### Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Fix lint issues
npm run lint:fix
```

## 📖 Usage Guide

### Your First Transaction
1. Tap the **+** button (bottom right)
2. Select **Income** or **Expense**
3. Enter amount, category, description, and date
4. Toggle **Recurring** for regular transactions
5. Tap **Add Transaction**

### Creating a Budget
1. Navigate to **Budgets** tab
2. Tap **+ New**
3. Select a spending category
4. Set your monthly budget amount
5. Set an alert threshold (default 80%)

### Setting a Savings Goal
1. Navigate to **Goals** tab
2. Tap **+ New Goal**
3. Name your goal (e.g., "Emergency Fund")
4. Set target amount and optional deadline
5. Tap **Add Contribution** to track progress

### Importing Bank Data
1. Go to **Transactions** tab
2. Tap **Import CSV**
3. Select your CSV file (or download the template first)
4. Valid rows are imported, errors are reported

### Exporting Your Data
1. Go to **Settings** → **Data Management**
2. Choose **Export All Data (JSON)** for full backup
3. Or **Export Transactions (CSV)** for spreadsheet use

## 🏗️ Architecture

```
src/
├── components/           # React components
│   ├── App.js           # Main app shell & routing
│   ├── Dashboard.js     # Overview dashboard
│   ├── TransactionForm.js    # Add/edit transaction modal
│   ├── TransactionList.js    # Transaction history with search
│   ├── BudgetManager.js      # Budget CRUD & tracking
│   ├── SpendingChart.js      # Analytics dashboard
│   ├── CategoryPieChart.js   # Pie chart component
│   ├── TrendChart.js         # Line chart component
│   ├── GoalsTracker.js       # Savings goals
│   ├── BillReminders.js      # Bill management
│   └── Settings.js           # App configuration
├── hooks/               # Custom React hooks
│   ├── useLocalStorage.js    # Persistent state
│   ├── useTransactions.js    # Transaction CRUD
│   └── useBudget.js          # Budget management
├── utils/               # Business logic & utilities
│   ├── financeCalculations.js   # Financial formulas
│   ├── dateFilters.js           # Date range utilities
│   ├── csvHandler.js            # CSV import/export
│   ├── demoData.js              # Sample data generator
│   └── uuid.js                  # UUID generator
└── styles/
    └── app.css           # Complete design system
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 (functional components + hooks) |
| Charts | Recharts 2.10 |
| Styling | CSS Custom Properties (design tokens) |
| Storage | localStorage with custom hooks |
| Testing | Jest + Testing Library |
| Linting | ESLint with React/recommended |

### Data Flow

```
User Action → Component Callback → Custom Hook → localStorage → Re-render
```

All state is managed through custom hooks that sync to localStorage automatically. The app uses unidirectional data flow with props down and callbacks up.

## 🧪 Testing

### Test Coverage

| Module | Tests | Coverage |
|--------|-------|----------|
| financeCalculations.js | 18 test suites | Income/Expense calc, balance, net worth, budget, goals, validation |
| csvHandler.js | 5 test suites | Export, import, validation, template |
| dateFilters.js | 11 test suites | Range calculation, filtering, sorting |
| demoData.js | 8 test suites | Generation, UUID, data structure |

### Running Tests

```bash
# Full test suite with coverage report
npm test

# Example output:
# PASS  tests/test_financeCalculations.js
# PASS  tests/test_csvHandler.js
# PASS  tests/test_dateFilters.js
# PASS  tests/test_demoData.js
#
# Coverage: Statements: 78%, Branches: 72%, Functions: 81%, Lines: 79%
```

## 🎨 Design System

### Mobile-First Approach
- **Base:** 320px (small phones)
- **Standard:** 375-428px (iPhone, Android)
- **Tablet:** 640px+ (minor adjustments)

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#10b981` | Primary brand, income, success |
| `--color-expense` | `#ef4444` | Expenses, danger, alerts |
| `--color-bg` | `#f3f4f6` | Page background |
| `--color-surface` | `#ffffff` | Card backgrounds |

### Typography
- **Font:** Inter (Google Fonts)
- **Scale:** 11px (xs) → 28px (xxl)
- **Weight:** 400 regular, 500 medium, 600 semibold, 700 bold

## 🗺️ Roadmap

### Upcoming Features
- [ ] **IndexedDB migration** for larger datasets (>5MB localStorage limit)
- [ ] **Service Worker** for full offline PWA support
- [ ] **Bank sync** via Plaid API integration
- [ ] **Multi-currency support** with live exchange rates
- [ ] **Recurring transaction auto-generation**
- [ ] **Spending insights** and anomaly detection
- [ ] **Export to PDF reports** monthly/quarterly summaries
- [ ] **Face ID / Touch ID** app lock
- [ ] **iCloud/Google Drive sync** encrypted backups

### Performance Goals
- [ ] Virtual scrolling for 1000+ transactions
- [ ] Chart data aggregation for date range optimization
- [ ] Bundle splitting for route-based code splitting
- [ ] Image optimization and lazy loading

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes using conventional commits
4. Push to the branch and open a Pull Request

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Recharts](https://recharts.org/) - Charting library
- [Inter Font](https://fonts.google.com/specimen/Inter) - Typeface
- [Create React App](https://create-react-app.dev/) - Build tooling

---

<p align="center">
  Built with care for managing your financial future 💚
</p>
