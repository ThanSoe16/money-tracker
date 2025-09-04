import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CurrencyInput } from "@/components/ui/currency-input"
import { UpdateBudgetForm, Budget, EXPENSE_CATEGORIES } from "@/types"
import { storageService } from "@/lib/storage"
import { formatTHB } from "@/lib/currency"

interface BudgetSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBudgetSaved?: (budget: Budget) => void
  existingBudget?: Budget
}

const categoryLabels: Record<string, string> = {
  food: 'Food & Dining',
  transport: 'Transportation',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  bills: 'Bills & Utilities',
  healthcare: 'Healthcare',
  others: 'Others',
}

export function BudgetSetupDialog({ 
  open, 
  onOpenChange, 
  onBudgetSaved,
  existingBudget 
}: BudgetSetupDialogProps) {
  const [form, setForm] = React.useState<UpdateBudgetForm>({
    totalBudget: 0,
    categories: {
      food: 0,
      transport: 0,
      shopping: 0,
      entertainment: 0,
      bills: 0,
      healthcare: 0,
      others: 0,
    }
  })

  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (existingBudget) {
      setForm({
        totalBudget: existingBudget.totalBudget,
        categories: {
          food: existingBudget.categories.food.allocated,
          transport: existingBudget.categories.transport.allocated,
          shopping: existingBudget.categories.shopping.allocated,
          entertainment: existingBudget.categories.entertainment.allocated,
          bills: existingBudget.categories.bills.allocated,
          healthcare: existingBudget.categories.healthcare.allocated,
          others: existingBudget.categories.others.allocated,
        }
      })
    } else {
      setForm({
        totalBudget: 0,
        categories: {
          food: 0,
          transport: 0,
          shopping: 0,
          entertainment: 0,
          bills: 0,
          healthcare: 0,
          others: 0,
        }
      })
    }
  }, [existingBudget, open])

  const totalAllocated = Object.values(form.categories).reduce((sum, amount) => sum + amount, 0)
  const remaining = form.totalBudget - totalAllocated
  const isOverAllocated = totalAllocated > form.totalBudget

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.totalBudget <= 0) return

    setLoading(true)

    try {
      const currentMonth = new Date().toISOString().slice(0, 7)
      
      const budget: Budget = {
        id: existingBudget?.id || `budget-${currentMonth}`,
        month: currentMonth,
        totalBudget: form.totalBudget,
        categories: {
          food: { allocated: form.categories.food, spent: existingBudget?.categories.food.spent || 0 },
          transport: { allocated: form.categories.transport, spent: existingBudget?.categories.transport.spent || 0 },
          shopping: { allocated: form.categories.shopping, spent: existingBudget?.categories.shopping.spent || 0 },
          entertainment: { allocated: form.categories.entertainment, spent: existingBudget?.categories.entertainment.spent || 0 },
          bills: { allocated: form.categories.bills, spent: existingBudget?.categories.bills.spent || 0 },
          healthcare: { allocated: form.categories.healthcare, spent: existingBudget?.categories.healthcare.spent || 0 },
          others: { allocated: form.categories.others, spent: existingBudget?.categories.others.spent || 0 },
        },
        weeklyAlerts: existingBudget?.weeklyAlerts || true,
        lastAlertDate: existingBudget?.lastAlertDate || '',
      }

      storageService.addBudget(budget)
      onBudgetSaved?.(budget)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving budget:', error)
    } finally {
      setLoading(false)
    }
  }

  const distributeEqually = () => {
    const amountPerCategory = Math.floor(form.totalBudget / EXPENSE_CATEGORIES.length)
    const newCategories = { ...form.categories }
    
    EXPENSE_CATEGORIES.forEach(category => {
      newCategories[category] = amountPerCategory
    })

    setForm(prev => ({ ...prev, categories: newCategories }))
  }

  const handleCategoryChange = (category: keyof typeof form.categories, value: number) => {
    setForm(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value
      }
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingBudget ? 'Edit Budget' : 'Set Monthly Budget'}
          </DialogTitle>
          <DialogDescription>
            {existingBudget 
              ? 'Update your monthly budget and category allocations.'
              : 'Set your monthly budget and allocate amounts to different categories.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Total Monthly Budget</label>
            <CurrencyInput
              value={form.totalBudget}
              onChange={(value) => setForm(prev => ({ ...prev, totalBudget: value }))}
              placeholder="Enter your monthly budget"
            />
          </div>

          {form.totalBudget > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Category Allocation</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={distributeEqually}
                >
                  Distribute Equally
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXPENSE_CATEGORIES.map((category) => (
                  <div key={category} className="space-y-2">
                    <label className="text-sm font-medium">
                      {categoryLabels[category]}
                    </label>
                    <CurrencyInput
                      value={form.categories[category]}
                      onChange={(value) => handleCategoryChange(category, value)}
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Budget:</span>
                  <span className="font-medium">{formatTHB(form.totalBudget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Allocated:</span>
                  <span className={isOverAllocated ? "text-red-600 font-medium" : "font-medium"}>
                    {formatTHB(totalAllocated)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="font-medium">
                    {isOverAllocated ? 'Over-allocated by:' : 'Remaining:'}
                  </span>
                  <span className={`font-medium ${
                    isOverAllocated ? 'text-red-600' : remaining > 0 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {formatTHB(Math.abs(remaining))}
                  </span>
                </div>
                {isOverAllocated && (
                  <p className="text-xs text-red-600">
                    You&apos;ve allocated more than your total budget. Please adjust the amounts.
                  </p>
                )}
                {remaining > 0 && !isOverAllocated && (
                  <p className="text-xs text-orange-600">
                    You have unallocated budget remaining.
                  </p>
                )}
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || form.totalBudget <= 0}
            >
              {loading ? 'Saving...' : existingBudget ? 'Update Budget' : 'Save Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}