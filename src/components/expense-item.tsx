import * as React from "react"
import { Expense, BankAccount } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatTHB } from "@/lib/currency"
import { Trash2, MapPin, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExpenseItemProps {
  expense: Expense
  account?: BankAccount
  onDelete?: (expenseId: string) => void
  className?: string
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

const categoryLabels: Record<string, string> = {
  food: 'Food & Dining',
  transport: 'Transportation',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  bills: 'Bills & Utilities',
  healthcare: 'Healthcare',
  others: 'Others',
}

const paymentMethodLabels: Record<string, string> = {
  debit_card: 'Debit',
  credit_card: 'Credit',
  cash: 'Cash',
  transfer: 'Transfer',
}

export function ExpenseItem({ 
  expense, 
  account,
  onDelete, 
  className 
}: ExpenseItemProps) {
  const expenseDate = new Date(expense.date)
  const isToday = expenseDate.toDateString() === new Date().toDateString()
  const isYesterday = expenseDate.toDateString() === new Date(Date.now() - 86400000).toDateString()

  const getDateLabel = () => {
    if (isToday) return 'Today'
    if (isYesterday) return 'Yesterday'
    return expenseDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: expenseDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  return (
    <Card className={cn("hover:shadow-md transition-all duration-200 hover:scale-[1.02] animate-slide-in", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="text-2xl flex-shrink-0">
              {categoryIcons[expense.category] || '📦'}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-medium text-sm leading-tight truncate pr-2">
                  {expense.description}
                </h3>
                <div className="text-lg font-bold text-red-600 flex-shrink-0">
                  {formatTHB(expense.amount)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {categoryLabels[expense.category]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {paymentMethodLabels[expense.paymentMethod]}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{getDateLabel()}</span>
                </div>
                
                {account && (
                  <div className="flex items-center gap-1">
                    <span 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: account.color }}
                    />
                    <span className="truncate">{account.accountNickname}</span>
                  </div>
                )}
                
                {expense.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{expense.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0 ml-2"
              onClick={() => onDelete(expense.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}