'use client'

import * as React from "react"
import { Budget } from "@/types"
import { storageService } from "@/lib/storage"
import { formatTHB } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BudgetCategoryCard } from "@/components/budget-category-card"
import { BudgetSetupDialog } from "@/components/budget-setup-dialog"
import { Progress } from "@/components/ui/progress"
import { Settings, TrendingUp, TrendingDown, Wallet } from "lucide-react"

export function BudgetPage() {
  const [currentBudget, setCurrentBudget] = React.useState<Budget | null>(null)
  const [showBudgetDialog, setShowBudgetDialog] = React.useState(false)

  const loadCurrentBudget = React.useCallback(() => {
    const budget = storageService.getCurrentBudget()
    setCurrentBudget(budget)
  }, [])

  React.useEffect(() => {
    loadCurrentBudget()
  }, [loadCurrentBudget])

  const handleBudgetSaved = () => {
    loadCurrentBudget()
  }

  if (!currentBudget) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Monthly Budget</h1>
            <p className="text-muted-foreground">
              Set up your monthly budget and track your spending
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No budget set for this month</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your monthly budget to start tracking your expenses and staying on track with your financial goals.
            </p>
            <Button onClick={() => setShowBudgetDialog(true)}>
              Set Up Budget
            </Button>
          </CardContent>
        </Card>

        <BudgetSetupDialog
          open={showBudgetDialog}
          onOpenChange={setShowBudgetDialog}
          onBudgetSaved={handleBudgetSaved}
        />
      </div>
    )
  }

  const totalSpent = Object.values(currentBudget.categories).reduce((sum, cat) => sum + cat.spent, 0)
  // const totalAllocated = Object.values(currentBudget.categories).reduce((sum, cat) => sum + cat.allocated, 0)
  const remaining = currentBudget.totalBudget - totalSpent
  const budgetProgress = currentBudget.totalBudget > 0 ? (totalSpent / currentBudget.totalBudget) * 100 : 0
  const isOverBudget = totalSpent > currentBudget.totalBudget

  const currentMonthName = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monthly Budget</h1>
          <p className="text-muted-foreground">
            {currentMonthName} - Track your spending across categories
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowBudgetDialog(true)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Edit Budget
        </Button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTHB(currentBudget.totalBudget)}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly budget amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : ''}`}>
              {formatTHB(totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(budgetProgress)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isOverBudget ? 'Over Budget' : 'Remaining'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              isOverBudget ? 'text-red-600' : 'text-green-600'
            }`}>
              {formatTHB(Math.abs(remaining))}
            </div>
            <p className="text-xs text-muted-foreground">
              {isOverBudget ? 'Amount over budget' : 'Budget remaining'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <div className="text-sm font-bold">
              {Math.round(budgetProgress)}%
            </div>
          </CardHeader>
          <CardContent>
            <Progress 
              value={Math.min(budgetProgress, 100)} 
              className="h-3"
            />
            {isOverBudget && (
              <Progress 
                value={budgetProgress - 100} 
                className="h-1 mt-1 bg-red-100 [&>*]:bg-red-500"
              />
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Overall budget usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(currentBudget.categories).map(([categoryName, category]) => (
            <BudgetCategoryCard
              key={categoryName}
              name={categoryName}
              category={category}
            />
          ))}
        </div>
      </div>

      {/* Budget Setup Dialog */}
      <BudgetSetupDialog
        open={showBudgetDialog}
        onOpenChange={setShowBudgetDialog}
        onBudgetSaved={handleBudgetSaved}
        existingBudget={currentBudget}
      />
    </div>
  )
}