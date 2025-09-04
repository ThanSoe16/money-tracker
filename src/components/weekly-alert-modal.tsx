import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BankAccount, Budget, WeeklyAlert } from "@/types"
import { storageService } from "@/lib/storage"
import { formatTHB } from "@/lib/currency"
import { Bell, TrendingDown, Calendar, DollarSign } from "lucide-react"
import { startOfWeek, format, addDays } from "date-fns"

interface WeeklyAlertModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCompleted?: () => void
}

export function WeeklyAlertModal({ 
  open, 
  onOpenChange,
  onCompleted 
}: WeeklyAlertModalProps) {
  const [accounts, setAccounts] = React.useState<BankAccount[]>([])
  const [currentBudget, setCurrentBudget] = React.useState<Budget | null>(null)
  const [weeklySpent, setWeeklySpent] = React.useState(0)
  const [updatedBalances, setUpdatedBalances] = React.useState<Record<string, number>>({})
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      const loadedAccounts = storageService.getAccounts().filter(acc => acc.isActive)
      const budget = storageService.getCurrentBudget()
      
      setAccounts(loadedAccounts)
      setCurrentBudget(budget)
      
      // Initialize updated balances with current balances
      const initialBalances: Record<string, number> = {}
      loadedAccounts.forEach(acc => {
        initialBalances[acc.id] = acc.balance
      })
      setUpdatedBalances(initialBalances)

      // Calculate weekly spending
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
      const weekStartString = format(weekStart, 'yyyy-MM-dd')
      const weeklyExpenses = storageService.getExpensesForWeek(weekStartString)
      const totalWeeklySpent = weeklyExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      setWeeklySpent(totalWeeklySpent)
    }
  }, [open])

  const handleBalanceUpdate = (accountId: string, newBalance: number) => {
    setUpdatedBalances(prev => ({
      ...prev,
      [accountId]: newBalance
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    
    try {
      // Update all account balances
      const updatedAccountIds: string[] = []
      for (const [accountId, newBalance] of Object.entries(updatedBalances)) {
        const account = accounts.find(acc => acc.id === accountId)
        if (account && account.balance !== newBalance) {
          storageService.updateAccount(accountId, {
            balance: newBalance,
            lastUpdated: new Date().toISOString()
          })
          updatedAccountIds.push(accountId)
        }
      }

      // Create weekly alert record
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      const alert: WeeklyAlert = {
        id: `alert-${Date.now()}`,
        weekOf: format(weekStart, 'yyyy-MM-dd'),
        alertDate: new Date().toISOString(),
        budgetRemaining: currentBudget ? currentBudget.totalBudget - getCurrentMonthSpending() : 0,
        weeklySpent: weeklySpent,
        accountsUpdated: updatedAccountIds,
        completed: true
      }

      storageService.addWeeklyAlert(alert)

      // Update budget's last alert date if budget exists
      if (currentBudget) {
        const updatedBudget = {
          ...currentBudget,
          lastAlertDate: new Date().toISOString()
        }
        storageService.addBudget(updatedBudget)
      }

      onCompleted?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving weekly check-in:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentMonthSpending = () => {
    if (!currentBudget) return 0
    return Object.values(currentBudget.categories).reduce((sum, cat) => sum + cat.spent, 0)
  }

  const budgetRemaining = currentBudget ? currentBudget.totalBudget - getCurrentMonthSpending() : 0
  const isOverBudget = budgetRemaining < 0

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = addDays(weekStart, 6)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            🔔 Weekly Budget Check-in
          </DialogTitle>
          <DialogDescription>
            {format(new Date(), 'EEEE, MMMM d, yyyy')} - Time for your weekly budget review
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Weekly Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentBudget && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      Monthly Budget
                    </div>
                    <div className="text-lg font-bold">
                      {formatTHB(currentBudget.totalBudget)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <TrendingDown className="h-3 w-3" />
                      Spent This Week
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      {formatTHB(weeklySpent)}
                    </div>
                  </div>
                </div>
              )}
              
              {currentBudget && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {isOverBudget ? 'Over Budget by:' : 'Remaining Budget:'}
                    </span>
                    <span className={`font-bold ${
                      isOverBudget ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatTHB(Math.abs(budgetRemaining))}
                    </span>
                  </div>
                  {isOverBudget && (
                    <div className="mt-1">
                      <Badge variant="destructive" className="text-xs">
                        Budget Exceeded
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Balance Updates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Update Your Bank Balances</CardTitle>
              <DialogDescription>
                Please update your current account balances to keep your tracking accurate.
              </DialogDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: account.color }}
                      />
                      <div>
                        <div className="font-medium text-sm">{account.accountNickname}</div>
                        <div className="text-xs text-muted-foreground">{account.bankName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Last: {formatTHB(account.balance)}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(account.lastUpdated), 'MMM d')}
                      </div>
                    </div>
                  </div>
                  <CurrencyInput
                    value={updatedBalances[account.id] || account.balance}
                    onChange={(value) => handleBalanceUpdate(account.id, value)}
                    placeholder={`Current ${account.accountNickname} balance`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Skip This Week
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Complete Check-in'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}