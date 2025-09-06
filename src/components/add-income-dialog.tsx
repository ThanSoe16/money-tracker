import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Checkbox } from "@/components/ui/checkbox"
import { Income, INCOME_CATEGORIES, CURRENCIES } from "@/types"
import { storageService } from "@/lib/storage"
import { getCurrencySymbol } from "@/lib/currency"

interface AddIncomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onIncomeAdded?: (income: Income) => void
}

const categoryLabels: Record<string, string> = {
  salary: 'Salary',
  freelance: 'Freelance',
  investment: 'Investment Returns',
  bonus: 'Bonus',
  other: 'Other',
}

const categoryIcons: Record<string, string> = {
  salary: '💼',
  freelance: '👨‍💻',
  investment: '📈',
  bonus: '🎁',
  other: '💰',
}

interface AddIncomeForm {
  amount: number
  currency: 'THB' | 'USDT' | 'MMK'
  category: Income['category']
  description: string
  accountId: string
  source: string
  isRecurring: boolean
  recurringPeriod?: 'weekly' | 'monthly' | 'yearly'
}

export function AddIncomeDialog({ 
  open, 
  onOpenChange, 
  onIncomeAdded
}: AddIncomeDialogProps) {
  const [form, setForm] = React.useState<AddIncomeForm>({
    amount: 0,
    currency: 'THB',
    category: 'salary',
    description: '',
    accountId: '',
    source: '',
    isRecurring: false,
  })
  const [loading, setLoading] = React.useState(false)

  const accounts = storageService.getAccounts().filter(account => account.isActive)
  const activeAccounts = accounts.sort((a, b) => {
    if (a.isDefault) return -1
    if (b.isDefault) return 1
    return 0
  })

  React.useEffect(() => {
    if (activeAccounts.length > 0 && !form.accountId) {
      setForm(prev => ({ ...prev, accountId: activeAccounts[0].id }))
    }
  }, [activeAccounts, form.accountId])

  const handleSubmit = async () => {
    if (!form.amount || !form.accountId || !form.description.trim()) return
    
    setLoading(true)
    try {
      const income: Income = {
        id: `income_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: form.amount,
        currency: form.currency,
        category: form.category,
        description: form.description,
        date: new Date().toISOString(),
        accountId: form.accountId,
        source: form.source,
        isRecurring: form.isRecurring,
        recurringPeriod: form.isRecurring ? form.recurringPeriod : undefined,
      }

      // Add to storage
      storageService.addIncome(income)

      // Update account balance
      const account = accounts.find(a => a.id === form.accountId)
      if (account) {
        // Convert amount to account currency if needed
        const exchangeSettings = storageService.getExchangeSettings()
        let convertedAmount = form.amount
        
        if (form.currency !== account.currency) {
          const rateKey = `${form.currency}_${account.currency}`
          const exchangeRate = exchangeSettings.rates[rateKey] || 1
          convertedAmount = form.amount * exchangeRate
        }

        storageService.updateAccount(account.id, {
          balance: account.balance + convertedAmount,
          lastUpdated: new Date().toISOString()
        })
      }

      onIncomeAdded?.(income)
      onOpenChange(false)
      
      // Reset form
      setForm({
        amount: 0,
        currency: 'THB',
        category: 'salary',
        description: '',
        accountId: activeAccounts[0]?.id || '',
        source: '',
        isRecurring: false,
      })
    } catch (error) {
      console.error('Error adding income:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>
            Record a new income entry to your account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Amount and Currency */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <CurrencyInput
                value={form.amount}
                onChange={(value) => setForm(prev => ({ ...prev, amount: value }))}
                placeholder="0.00"
                className="text-lg"
              />
            </div>
            <Select
              value={form.currency}
              onValueChange={(value: 'THB' | 'USDT' | 'MMK') => setForm(prev => ({ ...prev, currency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {getCurrencySymbol(currency)} {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <Select
            value={form.category}
            onValueChange={(value: Income['category']) => setForm(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {INCOME_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  <div className="flex items-center gap-2">
                    <span>{categoryIcons[category]}</span>
                    <span>{categoryLabels[category]}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Description */}
          <Input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          />

          {/* Source */}
          <Input
            placeholder="Source (e.g., Company name, Client)"
            value={form.source}
            onChange={(e) => setForm(prev => ({ ...prev, source: e.target.value }))}
          />

          {/* Account */}
          <Select
            value={form.accountId}
            onValueChange={(value) => setForm(prev => ({ ...prev, accountId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {activeAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                    <span>{account.accountNickname}</span>
                    <span className="text-xs text-gray-500">
                      ({getCurrencySymbol(account.currency)} {account.currency})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Recurring options */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recurring"
              checked={form.isRecurring}
              onCheckedChange={(checked) => setForm(prev => ({ 
                ...prev, 
                isRecurring: !!checked,
                recurringPeriod: !!checked ? 'monthly' : undefined
              }))}
            />
            <label htmlFor="recurring" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Recurring income
            </label>
          </div>

          {form.isRecurring && (
            <Select
              value={form.recurringPeriod}
              onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => setForm(prev => ({ ...prev, recurringPeriod: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={loading || !form.amount || !form.accountId || !form.description.trim()}
          >
            {loading ? 'Adding...' : 'Add Income'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}