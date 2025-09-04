import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Checkbox } from "@/components/ui/checkbox"
import { AddAccountForm, BankAccount, BANKS, ACCOUNT_TYPES } from "@/types"
import { storageService } from "@/lib/storage"

interface AddAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccountAdded?: (account: BankAccount) => void
  editAccount?: BankAccount
}

export function AddAccountDialog({ 
  open, 
  onOpenChange, 
  onAccountAdded,
  editAccount 
}: AddAccountDialogProps) {
  const [form, setForm] = React.useState<AddAccountForm>({
    bankName: '',
    accountNickname: '',
    accountType: 'savings',
    balance: 0,
    country: 'TH',
    isDefault: false,
  })

  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (editAccount) {
      setForm({
        bankName: editAccount.bankName,
        accountNickname: editAccount.accountNickname,
        accountType: editAccount.accountType,
        balance: editAccount.balance,
        country: editAccount.country,
        isDefault: editAccount.isDefault,
      })
    } else {
      setForm({
        bankName: '',
        accountNickname: '',
        accountType: 'savings',
        balance: 0,
        country: 'TH',
        isDefault: false,
      })
    }
  }, [editAccount, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.bankName || !form.accountNickname) return

    setLoading(true)

    try {
      const selectedBank = BANKS.find(bank => bank.name === form.bankName)
      
      const account: BankAccount = {
        id: editAccount?.id || `account-${Date.now()}`,
        bankName: form.bankName,
        accountNickname: form.accountNickname,
        accountType: form.accountType,
        balance: form.balance,
        color: selectedBank?.color || '#6B7280',
        logo: selectedBank?.logo || 'default',
        lastUpdated: new Date().toISOString(),
        isActive: true,
        country: form.country,
        isDefault: form.isDefault,
      }

      if (editAccount) {
        storageService.updateAccount(editAccount.id, account)
      } else {
        storageService.addAccount(account)
      }

      onAccountAdded?.(account)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving account:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editAccount ? 'Edit Account' : 'Add Bank Account'}
          </DialogTitle>
          <DialogDescription>
            {editAccount 
              ? 'Update your bank account information.'
              : 'Add a new bank account to track your finances.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Country/Region</label>
            <Select 
              value={form.country} 
              onValueChange={(value: BankAccount['country']) => {
                setForm(prev => ({ ...prev, country: value, bankName: '' }))
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TH">🇹🇭 Thailand</SelectItem>
                <SelectItem value="MM">🇲🇲 Myanmar</SelectItem>
                <SelectItem value="Global">🌍 Global (Crypto/Investment)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bank/Institution</label>
            <Select 
              value={form.bankName} 
              onValueChange={(value) => setForm(prev => ({ ...prev, bankName: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a bank or exchange" />
              </SelectTrigger>
              <SelectContent>
                {BANKS
                  .filter(bank => bank.country === form.country)
                  .map((bank) => (
                    <SelectItem key={bank.name} value={bank.name}>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: bank.color }}
                        />
                        {bank.name}
                        {bank.category === 'crypto' && <span className="text-xs text-muted-foreground">(Crypto)</span>}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account Nickname</label>
            <Input
              placeholder="e.g., Main Savings, Emergency Fund"
              value={form.accountNickname}
              onChange={(e) => setForm(prev => ({ ...prev, accountNickname: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account Type</label>
            <Select 
              value={form.accountType} 
              onValueChange={(value: BankAccount['accountType']) => setForm(prev => ({ ...prev, accountType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    <span className="capitalize">
                      {type === 'crypto' ? 'Crypto Exchange' : 
                       type === 'investment' ? 'Investment Account' : 
                       type}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Current Balance</label>
            <CurrencyInput
              value={form.balance}
              onChange={(value) => setForm(prev => ({ ...prev, balance: value }))}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isDefault"
              checked={form.isDefault}
              onCheckedChange={(checked) => 
                setForm(prev => ({ ...prev, isDefault: checked === true }))
              }
            />
            <label htmlFor="isDefault" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Set as default account for expenses
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !form.bankName || !form.accountNickname}>
              {loading ? 'Saving...' : editAccount ? 'Update Account' : 'Add Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}