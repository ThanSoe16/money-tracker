import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrencyInput } from "@/components/ui/currency-input"
import { AddExpenseForm, Expense, EXPENSE_CATEGORIES, PAYMENT_METHODS, Budget } from "@/types"
import { storageService } from "@/lib/storage"

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExpenseAdded?: (expense: Expense) => void
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

const categoryIcons: Record<string, string> = {
  food: '🍽️',
  transport: '🚗',
  shopping: '🛍️',
  entertainment: '🎬',
  bills: '💳',
  healthcare: '🏥',
  others: '📦',
}

const paymentMethodLabels: Record<string, string> = {
  debit_card: 'Debit Card',
  credit_card: 'Credit Card',
  cash: 'Cash',
  transfer: 'Bank Transfer',
}

export function AddExpenseDialog({ 
  open, 
  onOpenChange, 
  onExpenseAdded
}: AddExpenseDialogProps) {
  const [form, setForm] = React.useState<AddExpenseForm>({
    amount: 0,
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    paymentMethod: 'debit_card',
    location: '',
  })

  const [loading, setLoading] = React.useState(false)
  const [accounts, setAccounts] = React.useState(storageService.getAccounts())

  React.useEffect(() => {
    if (open) {
      const allAccounts = storageService.getAccounts()
      const defaultAccount = storageService.getDefaultAccount()
      
      setAccounts(allAccounts)
      setForm({
        amount: 0,
        category: 'food',
        description: '',
        date: new Date().toISOString().split('T')[0],
        accountId: defaultAccount?.id || '',
        paymentMethod: 'debit_card',
        location: '',
      })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.amount <= 0 || !form.description || !form.accountId) return

    setLoading(true)

    try {
      const expense: Expense = {
        id: `expense-${Date.now()}`,
        amount: form.amount,
        category: form.category,
        description: form.description,
        date: form.date,
        accountId: form.accountId,
        paymentMethod: form.paymentMethod,
        location: form.location,
        isRecurring: false,
      }

      storageService.addExpense(expense)

      // Update account balance if it's not a credit card
      const account = accounts.find(acc => acc.id === form.accountId)
      if (account && account.accountType !== 'credit') {
        storageService.updateAccount(account.id, { 
          balance: account.balance - form.amount,
          lastUpdated: new Date().toISOString()
        })
      } else if (account && account.accountType === 'credit') {
        // For credit cards, subtract from balance (making it more negative)
        storageService.updateAccount(account.id, { 
          balance: account.balance - form.amount,
          lastUpdated: new Date().toISOString()
        })
      }

      onExpenseAdded?.(expense)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving expense:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeAccounts = accounts.filter(acc => acc.isActive)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Record a new expense and update your budget tracking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount *</label>
            <CurrencyInput
              value={form.amount}
              onChange={(value) => setForm(prev => ({ ...prev, amount: value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category *</label>
            <Select 
              value={form.category} 
              onValueChange={(value: keyof Budget['categories']) => setForm(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center gap-2">
                      <span>{categoryIcons[category]}</span>
                      <span>{categoryLabels[category]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <Input
              placeholder="e.g., Lunch at restaurant"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account *</label>
            <Select 
              value={form.accountId} 
              onValueChange={(value) => setForm(prev => ({ ...prev, accountId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {activeAccounts
                  .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: account.color }}
                        />
                        <span>{account.accountNickname}</span>
                        {account.isDefault && (
                          <span className="text-xs bg-primary text-primary-foreground px-1 rounded">
                            Default
                          </span>
                        )}
                        <span className="text-muted-foreground text-xs">
                          ({account.bankName})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method</label>
            <Select 
              value={form.paymentMethod} 
              onValueChange={(value: Expense['paymentMethod']) => setForm(prev => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {paymentMethodLabels[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location (Optional)</label>
            <Input
              placeholder="e.g., Bangkok, Siam"
              value={form.location}
              onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || form.amount <= 0 || !form.description || !form.accountId}
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}