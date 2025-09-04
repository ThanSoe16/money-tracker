# Money Tracker - Application Instructions

## Overview
Build a comprehensive Money Tracker application for managing multiple bank accounts, monthly budgets, weekly balance updates, and expense tracking with Thai Baht (THB) currency support.

## Core Features

### 1. Bank Account Management
- **Add Bank Accounts**: Create multiple bank accounts with:
  - Bank name (e.g., "Kasikorn Bank", "Bangkok Bank", "SCB")
  - Account nickname (e.g., "Main Savings", "Emergency Fund")
  - Account type (Savings, Checking, Credit Card)
  - Current balance in THB
  - Bank logo/color theme
- **Update Balances**: Manually update account balances
- **Account Overview**: Visual cards showing all accounts
- **Total Wealth**: Sum of all positive balances

### 2. Monthly Budget System
- **Set Monthly Budget**: Define budget amount (e.g., 10,000 THB)
- **Budget Categories**: 
  - Food & Dining
  - Transportation
  - Shopping
  - Entertainment
  - Bills & Utilities
  - Healthcare
  - Others
- **Category Allocation**: Assign budget amounts to each category
- **Remaining Budget**: Real-time calculation of remaining budget

### 3. Weekly Alert System
- **Weekly Check-ins**: Alert every Sunday for budget updates
- **Balance Review**: Prompt to update all bank account balances
- **Spending Summary**: Show week's expenses and remaining budget
- **Progress Tracking**: Visual progress of budget usage
- **Alert Notifications**: Browser notifications for weekly reminders

### 4. Expense Tracking
- **Add Expenses**: Quick expense entry with:
  - Amount in THB
  - Category selection
  - Description/notes
  - Date (default to today)
  - Payment method (which bank account)
- **Expense History**: List of all transactions
- **Category Breakdown**: Pie chart of spending by category
- **Daily/Weekly/Monthly Views**: Filter expenses by time period

### 5. Records & History
- **Transaction Log**: All balance updates and expenses
- **Monthly Reports**: Detailed spending analysis
- **Budget Performance**: Track budget adherence over time
- **Export Data**: Download records as CSV/PDF

## User Interface Design

### Layout Structure
```
Header
├── App Title: "Money Tracker 💰"
├── Current Month Display
├── Total Balance Overview
└── Quick Add Expense Button

Dashboard Sections
├── Bank Accounts Grid
├── Monthly Budget Overview
├── Weekly Progress Card
├── Recent Transactions
└── Category Spending Chart

Navigation
├── Accounts
├── Budget
├── Expenses
├── Reports
└── Settings
```

### Design Requirements
- **Thai Baht Currency**: All amounts display as "฿X,XXX.XX"
- **Bank Colors**: Use actual Thai bank brand colors
- **Modern UI**: shadcn/ui components throughout
- **Mobile Responsive**: Optimized for phone usage
- **Dark/Light Mode**: Theme toggle support
- **Animations**: Smooth transitions and micro-interactions

## Data Structures

### Bank Account Object
```javascript
{
  id: unique_id,
  bankName: "Kasikorn Bank",
  accountNickname: "Main Savings",
  accountType: "savings", // savings, checking, credit
  balance: 50000, // in THB
  color: "#4CAF50", // bank brand color
  logo: "kasikorn-logo",
  lastUpdated: "2025-01-15",
  isActive: true
}
```

### Budget Object
```javascript
{
  id: unique_id,
  month: "2025-01",
  totalBudget: 10000,
  categories: {
    food: { allocated: 4000, spent: 2500 },
    transport: { allocated: 1500, spent: 800 },
    shopping: { allocated: 2000, spent: 0 },
    entertainment: { allocated: 1000, spent: 300 },
    bills: { allocated: 1500, spent: 1500 }
  },
  weeklyAlerts: true,
  lastAlertDate: "2025-01-07"
}
```

### Expense Object
```javascript
{
  id: unique_id,
  amount: 250, // THB
  category: "food",
  description: "Lunch at restaurant",
  date: "2025-01-15",
  accountId: "kasikorn-main",
  paymentMethod: "debit_card",
  location: "Bangkok",
  isRecurring: false
}
```

### Weekly Alert Object
```javascript
{
  id: unique_id,
  weekOf: "2025-01-13", // Monday of the week
  alertDate: "2025-01-19", // Sunday
  budgetRemaining: 7200,
  weeklySpent: 1800,
  accountsUpdated: ["kasikorn-main", "scb-savings"],
  completed: false
}
```

## Functional Requirements

### Core Functions
- `addBankAccount(accountData)`: Creates new bank account
- `updateAccountBalance(accountId, newBalance)`: Updates account balance
- `deleteBankAccount(accountId)`: Removes bank account
- `setMonthlyBudget(budgetData)`: Creates/updates monthly budget
- `addExpense(expenseData)`: Records new expense
- `updateBudgetSpending(category, amount)`: Updates category spending
- `triggerWeeklyAlert()`: Shows weekly budget reminder
- `calculateTotalBalance()`: Sums all account balances
- `generateWeeklyReport()`: Creates spending summary

### Thai Banking Integration
- **Popular Thai Banks**: Pre-configured bank list with colors
  - Kasikorn Bank (Green - #138F2D)
  - Bangkok Bank (Blue - #1E4D8B)
  - Siam Commercial Bank (Purple - #4E148C)
  - Krung Thai Bank (Light Blue - #00A0DF)
  - Government Savings Bank (Pink - #E91E63)

### Currency Formatting
- **THB Display**: Always show "฿" symbol
- **Number Format**: Use Thai number formatting (฿12,345.67)
- **Decimal Places**: Show 2 decimal places for precision
- **Large Numbers**: Format as ฿1.2M for millions

## Weekly Alert System

### Alert Logic
1. **Check Every Sunday**: Browser checks if weekly alert needed
2. **Show Alert Modal**: Prompt user to update balances
3. **Balance Update Form**: Quick form to update all accounts
4. **Budget Summary**: Show current week's spending
5. **Save Record**: Store weekly snapshot for history

### Alert Content
```
🔔 Weekly Budget Check-in
Current Date: January 19, 2025

Monthly Budget: ฿10,000
Spent This Week: ฿1,800
Remaining Budget: ฿7,200

Please update your bank balances:
- Kasikorn Main: ฿_____ (last: ฿48,200)
- SCB Savings: ฿_____ (last: ฿25,000)
- BBL Credit: ฿_____ (last: ฿-2,500)
```

## shadcn/ui Components

### Component Usage
- **Card**: Account cards, budget overview, weekly alerts
- **Button**: Add expense, update balance, category buttons
- **Input**: Amount inputs, account details, search
- **Dialog**: Add account modal, weekly alert modal
- **Progress**: Budget progress bars, category usage
- **Badge**: Account types, expense categories
- **Alert**: Weekly notifications, budget warnings
- **Tabs**: Navigate between accounts, expenses, reports
- **Calendar**: Date picker for expenses
- **Select**: Bank selection, category dropdown

### Custom Components
- **CurrencyInput**: Thai Baht input with formatting
- **BankAccountCard**: Account display with balance
- **BudgetProgressRing**: Circular budget progress
- **ExpenseItem**: Transaction list item
- **WeeklyAlertModal**: Weekly check-in dialog

## Animation Requirements

### Entrance Animations
- **Account Cards**: Fade in with stagger
- **Balance Updates**: Number counter animation
- **New Expenses**: Slide in from bottom
- **Weekly Alert**: Modal slide down with bounce

### Interaction Animations
- **Balance Changes**: Smooth number transitions
- **Budget Progress**: Animated progress bars
- **Category Spending**: Pie chart animations
- **Button Presses**: Subtle scale animations

### Visual Feedback
- **Success**: Green checkmark for successful updates
- **Warnings**: Yellow alert for budget limits
- **Errors**: Red shake animation for invalid inputs
- **Loading**: Skeleton loading for data fetching

## Features Implementation

### 1. Dashboard Overview
- Total balance across all accounts
- Current month budget status
- Quick expense add button
- Recent transactions list
- Weekly spending chart

### 2. Account Management
- Grid view of all bank accounts
- Add new account with bank selection
- Edit account details and balances
- Transfer money between accounts
- Account transaction history

### 3. Budget Planning
- Set monthly budget amount
- Allocate to categories
- Track spending vs budget
- Visual progress indicators
- Budget alerts and warnings

### 4. Expense Tracking
- Quick add expense form
- Categorize expenses automatically
- Photo receipts (future feature)
- Recurring expense setup
- Expense search and filters

### 5. Reporting & Analytics
- Monthly spending reports
- Category analysis charts
- Budget performance trends
- Export data functionality
- Year-over-year comparisons

## Technical Requirements

### Technology Stack
- React with hooks (useState, useEffect, useReducer)
- shadcn/ui components
- Tailwind CSS for styling
- Lucide React for icons
- Recharts for data visualization
- Date-fns for date handling
- Local Storage for data persistence

### Data Persistence
- **Local Storage**: Store all data locally
- **Data Structure**: JSON format for easy export
- **Backup**: Manual export/import functionality
- **Auto-save**: Save changes immediately

### Browser Notifications
- **Permission Request**: Ask for notification permission
- **Weekly Alerts**: Browser notifications on Sundays
- **Budget Warnings**: Alert when approaching budget limit
- **Balance Reminders**: Remind to update balances

### Mobile Optimization
- **Touch-friendly**: Large touch targets
- **Swipe Actions**: Swipe to delete/edit expenses
- **Responsive**: Works on all screen sizes
- **Fast Input**: Quick expense entry

## Security & Privacy
- **Local Data**: All data stays on user's device
- **No Server**: No external data transmission
- **Privacy First**: No tracking or analytics
- **Data Control**: User owns and controls all data

## Future Enhancements
- **Bank API Integration**: Connect to Thai bank APIs
- **Receipt Scanning**: OCR for receipt processing
- **Investment Tracking**: Track stocks and crypto
- **Bill Reminders**: Automatic bill notifications
- **Savings Goals**: Set and track savings targets
- **Multi-currency**: Support other currencies
- **Family Sharing**: Share budgets with family
- **AI Insights**: Spending pattern analysis

## Implementation Priority
1. **Phase 1**: Basic account and expense tracking
2. **Phase 2**: Budget system and categories
3. **Phase 3**: Weekly alerts and notifications
4. **Phase 4**: Reports and analytics
5. **Phase 5**: Advanced features and optimizations

This instruction set provides comprehensive guidance for building a full-featured Money Tracker application tailored for Thai users with multiple bank accounts and budget management needs.