// Bank Account Types
export interface BankAccount {
  id: string;
  bankName: string;
  accountNickname: string;
  accountType: 'savings' | 'checking' | 'credit' | 'crypto' | 'investment';
  balance: number; // in THB
  color: string; // bank brand color
  logo: string;
  lastUpdated: string; // ISO date string
  isActive: boolean;
  isDefault: boolean; // default account for expenses
  country: 'TH' | 'MM' | 'Global'; // Thailand, Myanmar, Global (Binance)
}

// Budget Types
export interface BudgetCategory {
  allocated: number;
  spent: number;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM format
  totalBudget: number;
  categories: {
    food: BudgetCategory;
    transport: BudgetCategory;
    shopping: BudgetCategory;
    entertainment: BudgetCategory;
    bills: BudgetCategory;
    healthcare: BudgetCategory;
    others: BudgetCategory;
  };
  weeklyAlerts: boolean;
  lastAlertDate: string; // ISO date string
}

// Expense Types
export interface Expense {
  id: string;
  amount: number; // THB
  category: keyof Budget['categories'];
  description: string;
  date: string; // ISO date string
  accountId: string;
  paymentMethod: 'debit_card' | 'credit_card' | 'cash' | 'transfer';
  location?: string;
  isRecurring: boolean;
}

// Weekly Alert Types
export interface WeeklyAlert {
  id: string;
  weekOf: string; // ISO date string (Monday of the week)
  alertDate: string; // ISO date string (Sunday)
  budgetRemaining: number;
  weeklySpent: number;
  accountsUpdated: string[];
  completed: boolean;
}

// Monthly Record Types
export interface MonthlyRecord {
  id: string;
  month: string; // YYYY-MM format
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  budgetUtilization: number; // percentage
  accountBalances: Array<{
    accountId: string;
    accountName: string;
    balance: number;
  }>;
  categoryBreakdown: {
    food: number;
    transport: number;
    shopping: number;
    entertainment: number;
    bills: number;
    healthcare: number;
    others: number;
  };
  createdAt: string; // ISO date string
  notes?: string;
}

// Bank Configuration
export interface Bank {
  name: string;
  color: string;
  logo: string;
  country: 'TH' | 'MM' | 'Global';
  category: 'traditional' | 'crypto' | 'investment';
}

// UI State Types
export interface AppState {
  accounts: BankAccount[];
  budgets: Budget[];
  expenses: Expense[];
  weeklyAlerts: WeeklyAlert[];
  monthlyRecords: MonthlyRecord[];
  currentBudget: Budget | null;
  loading: boolean;
  error: string | null;
}

// Form Types
export interface AddAccountForm {
  bankName: string;
  accountNickname: string;
  accountType: BankAccount['accountType'];
  balance: number;
  country: BankAccount['country'];
  isDefault: boolean;
}

export interface AddExpenseForm {
  amount: number;
  category: keyof Budget['categories'];
  description: string;
  date: string;
  accountId: string;
  paymentMethod: Expense['paymentMethod'];
  location?: string;
}

export interface UpdateBudgetForm {
  totalBudget: number;
  categories: {
    food: number;
    transport: number;
    shopping: number;
    entertainment: number;
    bills: number;
    healthcare: number;
    others: number;
  };
}

// Constants
export const BANKS: Bank[] = [
  // Thai Banks
  { name: 'Kasikorn Bank (K+)', color: '#138F2D', logo: 'kasikorn', country: 'TH', category: 'traditional' },
  { name: 'Bangkok Bank', color: '#1E4D8B', logo: 'bangkok', country: 'TH', category: 'traditional' },
  { name: 'Siam Commercial Bank', color: '#4E148C', logo: 'scb', country: 'TH', category: 'traditional' },
  { name: 'Krung Thai Bank', color: '#00A0DF', logo: 'krungthai', country: 'TH', category: 'traditional' },
  { name: 'Government Savings Bank', color: '#E91E63', logo: 'gsb', country: 'TH', category: 'traditional' },
  
  // Myanmar Banks
  { name: 'KBZ Bank', color: '#FF6B35', logo: 'kbz', country: 'MM', category: 'traditional' },
  { name: 'CB Bank', color: '#2E8B57', logo: 'cb', country: 'MM', category: 'traditional' },
  { name: 'AYA Bank', color: '#4169E1', logo: 'aya', country: 'MM', category: 'traditional' },
  { name: 'UAB Bank', color: '#DC143C', logo: 'uab', country: 'MM', category: 'traditional' },
  { name: 'AGD Bank', color: '#32CD32', logo: 'agd', country: 'MM', category: 'traditional' },
  { name: 'Yoma Bank', color: '#FF4500', logo: 'yoma', country: 'MM', category: 'traditional' },
  { name: 'MAB Bank', color: '#8A2BE2', logo: 'mab', country: 'MM', category: 'traditional' },
  
  // Global/Crypto
  { name: 'Binance', color: '#F3BA2F', logo: 'binance', country: 'Global', category: 'crypto' },
  { name: 'Coinbase', color: '#0052FF', logo: 'coinbase', country: 'Global', category: 'crypto' },
  { name: 'Kraken', color: '#5741D9', logo: 'kraken', country: 'Global', category: 'crypto' },
];

export const THAI_BANKS = BANKS.filter(bank => bank.country === 'TH');
export const MYANMAR_BANKS = BANKS.filter(bank => bank.country === 'MM');
export const CRYPTO_EXCHANGES = BANKS.filter(bank => bank.category === 'crypto');

export const EXPENSE_CATEGORIES: Array<keyof Budget['categories']> = [
  'food',
  'transport',
  'shopping',
  'entertainment',
  'bills',
  'healthcare',
  'others',
];

export const ACCOUNT_TYPES: Array<BankAccount['accountType']> = [
  'savings',
  'checking',
  'credit',
  'crypto',
  'investment',
];

export const PAYMENT_METHODS: Array<Expense['paymentMethod']> = [
  'debit_card',
  'credit_card',
  'cash',
  'transfer',
];