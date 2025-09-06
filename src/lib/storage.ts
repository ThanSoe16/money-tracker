import { BankAccount, Budget, Expense, Income, CurrencyExchange, ExchangeSettings, WeeklyAlert, MonthlyRecord } from '@/types';

const STORAGE_KEYS = {
  ACCOUNTS: 'money-tracker-accounts',
  BUDGETS: 'money-tracker-budgets',
  EXPENSES: 'money-tracker-expenses',
  INCOME: 'money-tracker-income',
  CURRENCY_EXCHANGES: 'money-tracker-currency-exchanges',
  EXCHANGE_SETTINGS: 'money-tracker-exchange-settings',
  WEEKLY_ALERTS: 'money-tracker-weekly-alerts',
  APP_STATE: 'money-tracker-app-state',
  MONTHLY_RECORDS: 'money-tracker-monthly-records',
} as const;;;

class LocalStorageService {
  private isClient = typeof window !== 'undefined';

  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isClient) return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key ${key}:`, error);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isClient) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage for key ${key}:`, error);
    }
  }

  // Bank Accounts
  getAccounts(): BankAccount[] {
    return this.getItem(STORAGE_KEYS.ACCOUNTS, []);
  }

  setAccounts(accounts: BankAccount[]): void {
    this.setItem(STORAGE_KEYS.ACCOUNTS, accounts);
  }

  addAccount(account: BankAccount): void {
    const accounts = this.getAccounts();
    
    // If this is set as default, remove default from other accounts
    if (account.isDefault) {
      accounts.forEach(acc => acc.isDefault = false);
    }
    
    // If this is the first account, make it default
    if (accounts.length === 0) {
      account.isDefault = true;
    }
    
    accounts.push(account);
    this.setAccounts(accounts);
  }

  updateAccount(accountId: string, updates: Partial<BankAccount>): void {
    const accounts = this.getAccounts();
    const index = accounts.findIndex(acc => acc.id === accountId);
    if (index !== -1) {
      // If setting this as default, remove default from other accounts
      if (updates.isDefault) {
        accounts.forEach(acc => acc.isDefault = false);
      }
      
      accounts[index] = { ...accounts[index], ...updates };
      this.setAccounts(accounts);
    }
  }

  deleteAccount(accountId: string): void {
    const accounts = this.getAccounts();
    const accountToDelete = accounts.find(acc => acc.id === accountId);
    const filtered = accounts.filter(acc => acc.id !== accountId);
    
    // If deleting the default account, set the first remaining account as default
    if (accountToDelete?.isDefault && filtered.length > 0) {
      filtered[0].isDefault = true;
    }
    
    this.setAccounts(filtered);
  }

  getDefaultAccount(): BankAccount | null {
    const accounts = this.getAccounts();
    return accounts.find(acc => acc.isDefault && acc.isActive) || null;
  }

  // Budgets
  getBudgets(): Budget[] {
    return this.getItem(STORAGE_KEYS.BUDGETS, []);
  }

  setBudgets(budgets: Budget[]): void {
    this.setItem(STORAGE_KEYS.BUDGETS, budgets);
  }

  addBudget(budget: Budget): void {
    const budgets = this.getBudgets();
    // Remove existing budget for the same month
    const filtered = budgets.filter(b => b.month !== budget.month);
    filtered.push(budget);
    this.setBudgets(filtered);
  }

  getCurrentBudget(): Budget | null {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const budgets = this.getBudgets();
    return budgets.find(budget => budget.month === currentMonth) || null;
  }

  // Expenses
  getExpenses(): Expense[] {
    return this.getItem(STORAGE_KEYS.EXPENSES, []);
  }

  setExpenses(expenses: Expense[]): void {
    this.setItem(STORAGE_KEYS.EXPENSES, expenses);
  }

  // Income methods
  getIncome(): Income[] {
    return this.getItem<Income[]>(STORAGE_KEYS.INCOME, []);
  }

  setIncome(income: Income[]): void {
    this.setItem(STORAGE_KEYS.INCOME, income);
  }

  addIncome(income: Income): void {
    const incomeList = this.getIncome();
    incomeList.push(income);
    this.setIncome(incomeList);
  }

  deleteIncome(id: string): void {
    const incomeList = this.getIncome();
    const filteredIncome = incomeList.filter(income => income.id !== id);
    this.setIncome(filteredIncome);
  }

  // Currency exchange methods
  getCurrencyExchanges(): CurrencyExchange[] {
    return this.getItem<CurrencyExchange[]>(STORAGE_KEYS.CURRENCY_EXCHANGES, []);
  }

  setCurrencyExchanges(exchanges: CurrencyExchange[]): void {
    this.setItem(STORAGE_KEYS.CURRENCY_EXCHANGES, exchanges);
  }

  addCurrencyExchange(exchange: CurrencyExchange): void {
    const exchanges = this.getCurrencyExchanges();
    exchanges.push(exchange);
    this.setCurrencyExchanges(exchanges);
  }

  // Exchange settings methods
  getExchangeSettings(): ExchangeSettings {
    return this.getItem<ExchangeSettings>(STORAGE_KEYS.EXCHANGE_SETTINGS, {
      rates: {
        'THB_USDT': 30.5,
        'USDT_THB': 1/30.5,
        'THB_MMK': 0.85,
        'MMK_THB': 1/0.85,
        'USDT_MMK': 26,
        'MMK_USDT': 1/26
      },
      lastUpdated: new Date().toISOString(),
      autoUpdate: false
    });
  }

  setExchangeSettings(settings: ExchangeSettings): void {
    this.setItem(STORAGE_KEYS.EXCHANGE_SETTINGS, settings);
  }

  addExpense(expense: Expense): void {
    const expenses = this.getExpenses();
    expenses.push(expense);
    this.setExpenses(expenses);

    // Update budget spending
    const currentBudget = this.getCurrentBudget();
    if (currentBudget && expense.date.startsWith(currentBudget.month)) {
      currentBudget.categories[expense.category].spent += expense.amount;
      this.addBudget(currentBudget); // This will update the existing budget
    }
  }

  deleteExpense(expenseId: string): void {
    const expenses = this.getExpenses();
    const expense = expenses.find(exp => exp.id === expenseId);
    if (expense) {
      const filtered = expenses.filter(exp => exp.id !== expenseId);
      this.setExpenses(filtered);

      // Update budget spending
      const currentBudget = this.getCurrentBudget();
      if (currentBudget && expense.date.startsWith(currentBudget.month)) {
        currentBudget.categories[expense.category].spent -= expense.amount;
        this.addBudget(currentBudget);
      }
    }
  }

  // Weekly Alerts
  getWeeklyAlerts(): WeeklyAlert[] {
    return this.getItem(STORAGE_KEYS.WEEKLY_ALERTS, []);
  }

  setWeeklyAlerts(alerts: WeeklyAlert[]): void {
    this.setItem(STORAGE_KEYS.WEEKLY_ALERTS, alerts);
  }

  addWeeklyAlert(alert: WeeklyAlert): void {
    const alerts = this.getWeeklyAlerts();
    alerts.push(alert);
    this.setWeeklyAlerts(alerts);
  }

  // Utility methods
  getTotalBalance(): number {
    const accounts = this.getAccounts();
    return accounts
      .filter(acc => acc.isActive && acc.accountType !== 'credit')
      .reduce((total, acc) => total + acc.balance, 0);
  }

  // Monthly Records
  getMonthlyRecords(): MonthlyRecord[] {
    return this.getItem<MonthlyRecord[]>(STORAGE_KEYS.MONTHLY_RECORDS, []);
  }

  setMonthlyRecords(records: MonthlyRecord[]): void {
    this.setItem(STORAGE_KEYS.MONTHLY_RECORDS, records);
  }

  addMonthlyRecord(record: MonthlyRecord): void {
    const records = this.getMonthlyRecords();
    const existingIndex = records.findIndex(r => r.month === record.month);
    
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    this.setMonthlyRecords(records);
  }

  getMonthlyRecord(month: string): MonthlyRecord | undefined {
    const records = this.getMonthlyRecords();
    return records.find(r => r.month === month);
  }

  generateMonthlyRecord(month: string): MonthlyRecord {
    const expenses = this.getExpensesForMonth(month);
    const accounts = this.getAccounts();
    const budget = this.getBudgets().find(b => b.month === month);
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryBreakdown = {
      food: 0,
      transport: 0,
      shopping: 0,
      entertainment: 0,
      bills: 0,
      healthcare: 0,
      others: 0,
    };
    
    expenses.forEach(expense => {
      categoryBreakdown[expense.category] += expense.amount;
    });
    
    const accountBalances = accounts.map(account => ({
      accountId: account.id,
      accountName: account.accountNickname,
      balance: account.balance,
    }));
    
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    const budgetUtilization = budget ? (totalExpenses / budget.totalBudget) * 100 : 0;
    
    return {
      id: `monthly-record-${month}-${Date.now()}`,
      month,
      totalIncome: 0, // To be manually updated
      totalExpenses,
      totalSavings: totalBalance,
      budgetUtilization,
      accountBalances,
      categoryBreakdown,
      createdAt: new Date().toISOString(),
    };
  }

  getExpensesForMonth(month: string): Expense[] {
    const expenses = this.getExpenses();
    return expenses.filter(expense => expense.date.startsWith(month));
  }

  getExpensesForWeek(weekStart: string): Expense[] {
    const expenses = this.getExpenses();
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= weekStartDate && expenseDate < weekEndDate;
    });
  }

  // Data export/import
  exportData(): string {
    const data = {
      accounts: this.getAccounts(),
      budgets: this.getBudgets(),
      expenses: this.getExpenses(),
      weeklyAlerts: this.getWeeklyAlerts(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.accounts) this.setAccounts(data.accounts);
      if (data.budgets) this.setBudgets(data.budgets);
      if (data.expenses) this.setExpenses(data.expenses);
      if (data.weeklyAlerts) this.setWeeklyAlerts(data.weeklyAlerts);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  clearAllData(): void {
    if (!this.isClient) return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const storageService = new LocalStorageService();