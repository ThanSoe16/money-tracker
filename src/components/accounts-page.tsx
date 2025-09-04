'use client'

import * as React from "react"
import { BankAccount } from "@/types"
import { storageService } from "@/lib/storage"
import { formatTHB } from "@/lib/currency"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BankAccountCard } from "@/components/bank-account-card"
import { AddAccountDialog } from "@/components/add-account-dialog"
import { Plus, Wallet, TrendingUp, TrendingDown } from "lucide-react"

export function AccountsPage() {
  const [accounts, setAccounts] = React.useState<BankAccount[]>([])
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [editingAccount, setEditingAccount] = React.useState<BankAccount | undefined>()

  const loadAccounts = React.useCallback(() => {
    setAccounts(storageService.getAccounts())
  }, [])

  React.useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  const totalBalance = React.useMemo(() => {
    return accounts
      .filter(acc => acc.isActive && acc.accountType !== 'credit')
      .reduce((sum, acc) => sum + acc.balance, 0)
  }, [accounts])

  const totalDebt = React.useMemo(() => {
    return Math.abs(accounts
      .filter(acc => acc.isActive && acc.accountType === 'credit' && acc.balance < 0)
      .reduce((sum, acc) => sum + acc.balance, 0))
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
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bank Accounts</h1>
          <p className="text-muted-foreground">
            Manage your bank accounts and track your balances
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatTHB(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {accounts.filter(acc => acc.accountType !== 'credit').length} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatTHB(totalDebt)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {creditAccounts.length} credit accounts
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
              {formatTHB(netWorth)}
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
              <h2 className="text-xl font-semibold mb-4">Savings Accounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <h2 className="text-xl font-semibold mb-4">Checking Accounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <h2 className="text-xl font-semibold mb-4">Credit Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  )
}