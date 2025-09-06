'use client'

import * as React from "react"
import { BankAccount } from "@/types"
import { storageService } from "@/lib/storage"
import { formatCurrency, convertCurrency } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BankAccountCard } from "@/components/bank-account-card"
import { AddAccountDialog } from "@/components/add-account-dialog"
import { AddIncomeDialog } from "@/components/add-income-dialog"
import { CurrencyExchangeDialog } from "@/components/currency-exchange-dialog"
import { ExchangeSettingsDialog } from "@/components/exchange-settings-dialog"
import { Plus, Wallet, TrendingUp, TrendingDown, ArrowUpCircle, RefreshCw, Settings } from "lucide-react"

export function AccountsPage() {
  const [accounts, setAccounts] = React.useState<BankAccount[]>([])
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [showIncomeDialog, setShowIncomeDialog] = React.useState(false)
  const [showExchangeDialog, setShowExchangeDialog] = React.useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = React.useState(false)
  const [editingAccount, setEditingAccount] = React.useState<BankAccount | undefined>()

  const loadAccounts = React.useCallback(() => {
    setAccounts(storageService.getAccounts())
  }, [])

  React.useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  // Calculate total balance in THB equivalent
  const totalBalance = React.useMemo(() => {
    const exchangeSettings = storageService.getExchangeSettings()
    return accounts
      .filter(acc => acc.isActive && acc.accountType !== 'credit')
      .reduce((sum, acc) => {
        if (acc.currency === 'THB') {
          return sum + acc.balance
        } else {
          const rateKey = `${acc.currency}_THB`
          const rate = exchangeSettings.rates[rateKey] || 1
          return sum + convertCurrency(acc.balance, acc.currency, 'THB', rate)
        }
      }, 0)
  }, [accounts])

  const totalDebt = React.useMemo(() => {
    const exchangeSettings = storageService.getExchangeSettings()
    return Math.abs(accounts
      .filter(acc => acc.isActive && acc.accountType === 'credit' && acc.balance < 0)
      .reduce((sum, acc) => {
        const balance = Math.abs(acc.balance)
        if (acc.currency === 'THB') {
          return sum + balance
        } else {
          const rateKey = `${acc.currency}_THB`
          const rate = exchangeSettings.rates[rateKey] || 1
          return sum + convertCurrency(balance, acc.currency, 'THB', rate)
        }
      }, 0))
  }, [accounts])

  const netWorth = totalBalance - totalDebt

  const handleAccountAdded = () => {
    loadAccounts()
    setEditingAccount(undefined)
  }

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account)
    setShowAddDialog(true)
  }

  const handleDeleteAccount = (accountId: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      storageService.deleteAccount(accountId)
      loadAccounts()
    }
  }

  const activeAccounts = accounts.filter(acc => acc.isActive)
  const savingsAccounts = activeAccounts.filter(acc => acc.accountType === 'savings')
  const checkingAccounts = activeAccounts.filter(acc => acc.accountType === 'checking')
  const creditAccounts = activeAccounts.filter(acc => acc.accountType === 'credit')

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Bank Accounts</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your bank accounts and track your balances
          </p>
        </div>
        {/* Mobile-first button layout */}
        <div className="grid grid-cols-2 sm:flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddDialog(true)}
            className="sm:order-last"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Add Account</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowIncomeDialog(true)}
          >
            <ArrowUpCircle className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Add Income</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowExchangeDialog(true)}
            className="col-span-2 sm:col-span-1"
          >
            <RefreshCw className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Exchange Currency</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettingsDialog(true)}
            className="col-span-2 sm:col-span-1"
          >
            <Settings className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Exchange Settings</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {formatCurrency(totalBalance, 'THB')}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {accounts.filter(acc => acc.accountType !== 'credit').length} accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {formatCurrency(totalDebt, 'THB')}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {creditAccounts.length} credit accounts
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${netWorth >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'} sm:col-span-2 lg:col-span-1`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netWorth, 'THB')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total assets minus debts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Sections */}
      {activeAccounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by adding your first bank account to track your finances
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Savings Accounts */}
          {savingsAccounts.length > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Savings Accounts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {savingsAccounts.map((account) => (
                  <BankAccountCard
                    key={account.id}
                    account={account}
                    onEdit={handleEditAccount}
                    onDelete={handleDeleteAccount}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Checking Accounts */}
          {checkingAccounts.length > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Checking Accounts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {checkingAccounts.map((account) => (
                  <BankAccountCard
                    key={account.id}
                    account={account}
                    onEdit={handleEditAccount}
                    onDelete={handleDeleteAccount}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Credit Accounts */}
          {creditAccounts.length > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Credit Cards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {creditAccounts.map((account) => (
                  <BankAccountCard
                    key={account.id}
                    account={account}
                    onEdit={handleEditAccount}
                    onDelete={handleDeleteAccount}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Account Dialog */}
      <AddAccountDialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open)
          if (!open) setEditingAccount(undefined)
        }}
        onAccountAdded={handleAccountAdded}
        editAccount={editingAccount}
      />

      {/* Add Income Dialog */}
      <AddIncomeDialog
        open={showIncomeDialog}
        onOpenChange={setShowIncomeDialog}
        onIncomeAdded={() => {
          loadAccounts() // Refresh accounts to show updated balances
        }}
      />

      {/* Currency Exchange Dialog */}
      <CurrencyExchangeDialog
        open={showExchangeDialog}
        onOpenChange={setShowExchangeDialog}
        onExchangeAdded={() => {
          loadAccounts() // Refresh accounts to show updated balances
        }}
      />

      {/* Exchange Settings Dialog */}
      <ExchangeSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        onSettingsUpdated={() => {
          // Optionally refresh UI to show updated exchange rates
        }}
      />
    </div>
  )
}