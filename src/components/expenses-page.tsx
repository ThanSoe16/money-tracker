'use client'

import * as React from "react"
import { Expense, BankAccount } from "@/types"
import { storageService } from "@/lib/storage"
import { formatTHB } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExpenseItem } from "@/components/expense-item"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { Plus, Receipt, Filter, Calendar } from "lucide-react"
import { EXPENSE_CATEGORIES } from "@/types"

const categoryLabels: Record<string, string> = {
  food: 'Food & Dining',
  transport: 'Transportation',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  bills: 'Bills & Utilities',
  healthcare: 'Healthcare',
  others: 'Others',
}

export function ExpensesPage() {
  const [expenses, setExpenses] = React.useState<Expense[]>([])
  const [accounts, setAccounts] = React.useState<BankAccount[]>([])
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>('month')

  const loadData = React.useCallback(() => {
    setExpenses(storageService.getExpenses())
    setAccounts(storageService.getAccounts())
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

  // Filter expenses based on selected filters
  const filteredExpenses = React.useMemo(() => {
    let filtered = [...expenses]

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === selectedCategory)
    }

    // Period filter
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay())
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    switch (selectedPeriod) {
      case 'today':
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= today
        })
        break
      case 'week':
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= thisWeekStart
        })
        break
      case 'month':
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= thisMonthStart
        })
        break
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [expenses, selectedCategory, selectedPeriod])

  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  // const categoryTotals = React.useMemo(() => {
  //   const totals: Record<string, number> = {}
  //   filteredExpenses.forEach(expense => {
  //     totals[expense.category] = (totals[expense.category] || 0) + expense.amount
  //   })
  //   return totals
  // }, [filteredExpenses])

  // Group expenses by date
  const groupedExpenses = React.useMemo(() => {
    const groups: Record<string, Expense[]> = {}
    filteredExpenses.forEach(expense => {
      const dateKey = expense.date
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(expense)
    })
    return groups
  }, [filteredExpenses])

  const getAccountById = (accountId: string) => {
    return accounts.find(acc => acc.id === accountId)
  }

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return 'Today'
      case 'week': return 'This Week'
      case 'month': return 'This Month'
      case 'all': return 'All Time'
      default: return 'This Month'
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your spending
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                {getPeriodLabel()} Summary
              </CardTitle>
              <CardDescription>
                {filteredExpenses.length} expenses totaling {formatTHB(totalAmount)}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">
                {formatTHB(totalAmount)}
              </div>
              <p className="text-sm text-muted-foreground">Total spent</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EXPENSE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {categoryLabels[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {selectedCategory !== 'all' || selectedPeriod !== 'month' 
                ? 'No expenses found' 
                : 'No expenses yet'
              }
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {selectedCategory !== 'all' || selectedPeriod !== 'month'
                ? 'Try adjusting your filters or add a new expense.'
                : 'Start tracking your spending by adding your first expense.'
              }
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedExpenses)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dayExpenses]) => {
              const expenseDate = new Date(date)
              const isToday = expenseDate.toDateString() === new Date().toDateString()
              const isYesterday = expenseDate.toDateString() === new Date(Date.now() - 86400000).toDateString()
              
              const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
              
              const getDateLabel = () => {
                if (isToday) return 'Today'
                if (isYesterday) return 'Yesterday'
                return expenseDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: expenseDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                })
              }

              return (
                <div key={date} className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <h3 className="font-semibold text-lg">{getDateLabel()}</h3>
                    <div className="text-right">
                      <div className="font-medium text-red-600">{formatTHB(dayTotal)}</div>
                      <div className="text-xs text-muted-foreground">
                        {dayExpenses.length} expense{dayExpenses.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {dayExpenses.map((expense) => (
                      <ExpenseItem
                        key={expense.id}
                        expense={expense}
                        account={getAccountById(expense.accountId)}
                        onDelete={handleDeleteExpense}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onExpenseAdded={handleExpenseAdded}
      />
    </div>
  )
}