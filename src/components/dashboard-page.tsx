'use client'

import * as React from "react"
import { BankAccount, Budget, Expense } from "@/types"
import { storageService } from "@/lib/storage"
import { formatTHB, formatTHBCompact } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BankAccountCard } from "@/components/bank-account-card"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { ExpenseItem } from "@/components/expense-item"
import { WeeklyAlertModal } from "@/components/weekly-alert-modal"
import { useWeeklyAlerts } from "@/hooks/use-weekly-alerts"
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar,
  PieChart,
  CreditCard,
  Target,
  Bell
} from "lucide-react"

export function DashboardPage() {
  const [accounts, setAccounts] = React.useState<BankAccount[]>([])
  const [currentBudget, setCurrentBudget] = React.useState<Budget | null>(null)
  const [recentExpenses, setRecentExpenses] = React.useState<Expense[]>([])
  const [showAddExpense, setShowAddExpense] = React.useState(false)

  const {
    shouldShowAlert,
    hasPermission,
    requestNotificationPermission,
    dismissAlert,
    completeAlert,
  } = useWeeklyAlerts()

  const loadData = React.useCallback(() => {
    setAccounts(storageService.getAccounts())
    setCurrentBudget(storageService.getCurrentBudget())
    
    const allExpenses = storageService.getExpenses()
    // Get last 5 expenses
    const recent = allExpenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
    setRecentExpenses(recent)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleExpenseAdded = () => {
    loadData()
  }

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      storageService.deleteExpense(expenseId)
      loadData()
    }
  }

  // Calculate totals
  const activeAccounts = accounts.filter(acc => acc.isActive)
  const totalBalance = activeAccounts
    .filter(acc => acc.accountType !== 'credit')
    .reduce((sum, acc) => sum + acc.balance, 0)
  
  const totalDebt = Math.abs(activeAccounts
    .filter(acc => acc.accountType === 'credit' && acc.balance < 0)
    .reduce((sum, acc) => sum + acc.balance, 0))

  const netWorth = totalBalance - totalDebt

  // Budget calculations
  const totalSpent = currentBudget 
    ? Object.values(currentBudget.categories).reduce((sum, cat) => sum + cat.spent, 0)
    : 0
  const budgetRemaining = currentBudget ? currentBudget.totalBudget - totalSpent : 0
  const budgetProgress = currentBudget && currentBudget.totalBudget > 0 
    ? (totalSpent / currentBudget.totalBudget) * 100 
    : 0
  const isOverBudget = budgetRemaining < 0

  // Category breakdown for current month
  const categoryBreakdown = currentBudget 
    ? Object.entries(currentBudget.categories)
        .map(([name, category]) => ({
          name,
          spent: category.spent,
          allocated: category.allocated,
          percentage: category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0
        }))
        .sort((a, b) => b.spent - a.spent)
    : []

  const getAccountById = (accountId: string) => {
    return accounts.find(acc => acc.id === accountId)
  }

  const currentMonthName = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Money Tracker 💰
          </h1>
          <p className="text-muted-foreground">
            {currentMonthName} - Your financial overview
          </p>
        </div>
        <div className="flex gap-2">
          {!hasPermission && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={requestNotificationPermission}
            >
              <Bell className="w-4 h-4 mr-2" />
              Enable Alerts
            </Button>
          )}
          <Button onClick={() => setShowAddExpense(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatTHBCompact(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {activeAccounts.filter(acc => acc.accountType !== 'credit').length} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatTHBCompact(netWorth)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalDebt > 0 ? `฿${totalDebt.toLocaleString()} debt` : 'No debt'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : ''}`}>
              {formatTHBCompact(totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentBudget ? `${Math.round(budgetProgress)}% of budget` : 'No budget set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isOverBudget ? 'Over Budget' : 'Budget Left'}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              isOverBudget ? 'text-red-600' : budgetRemaining < (currentBudget?.totalBudget || 0) * 0.1 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {currentBudget ? formatTHBCompact(Math.abs(budgetRemaining)) : '---'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentBudget ? (isOverBudget ? 'Amount over budget' : 'Remaining this month') : 'Set up budget'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      {currentBudget && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Monthly Budget Progress
                </CardTitle>
                <CardDescription>
                  {formatTHB(totalSpent)} of {formatTHB(currentBudget.totalBudget)} spent
                </CardDescription>
              </div>
              <Badge variant={isOverBudget ? "destructive" : budgetProgress > 80 ? "secondary" : "outline"}>
                {Math.round(budgetProgress)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Progress value={Math.min(budgetProgress, 100)} className="h-3" />
              {isOverBudget && (
                <Progress 
                  value={budgetProgress - 100} 
                  className="h-1 bg-red-100 [&>*]:bg-red-500"
                />
              )}
            </div>
            
            {categoryBreakdown.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Top Categories</h4>
                <div className="space-y-2">
                  {categoryBreakdown.slice(0, 3).map(category => (
                    <div key={category.name} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{category.name.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {formatTHB(category.spent)} / {formatTHB(category.allocated)}
                        </span>
                        <span className={`font-medium ${category.percentage > 100 ? 'text-red-600' : ''}`}>
                          {Math.round(category.percentage)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank Accounts */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bank Accounts
            </CardTitle>
            <CardDescription>
              Quick view of your account balances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAccounts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No accounts added yet
              </p>
            ) : (
              activeAccounts.slice(0, 4).map((account) => (
                <BankAccountCard
                  key={account.id}
                  account={account}
                  className="shadow-none border-0 bg-muted/30"
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Expenses
            </CardTitle>
            <CardDescription>
              Your latest spending activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentExpenses.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No expenses recorded yet
              </p>
            ) : (
              recentExpenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  account={getAccountById(expense.accountId)}
                  onDelete={handleDeleteExpense}
                  className="shadow-none border-0 bg-muted/30"
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        onExpenseAdded={handleExpenseAdded}
      />

      {/* Weekly Alert Modal */}
      <WeeklyAlertModal
        open={shouldShowAlert}
        onOpenChange={dismissAlert}
        onCompleted={() => {
          completeAlert()
          loadData()
        }}
      />
    </div>
  )
}