import * as React from "react"
import { BankAccount } from "@/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"
import { Edit, Trash2, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface BankAccountCardProps {
  account: BankAccount
  onEdit?: (account: BankAccount) => void
  onDelete?: (accountId: string) => void
  className?: string
}

export function BankAccountCard({ 
  account, 
  onEdit, 
  onDelete, 
  className 
}: BankAccountCardProps) {
  const isCredit = account.accountType === 'credit'
  const isNegative = account.balance < 0
  
  return (
    <Card 
      className={cn(
        "relative transition-all duration-200 hover:shadow-md hover:scale-[1.02] animate-slide-in",
        className
      )}
      style={{ borderLeftColor: account.color, borderLeftWidth: '4px' }}
    >
      <CardHeader className="pb-3 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: account.color }}
              />
              <h3 className="font-semibold text-base leading-none truncate">
                {account.accountNickname}
              </h3>
              {account.isDefault && (
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {account.bankName}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {account.country !== 'TH' && (
                <Badge variant="outline" className="text-xs">
                  {account.country === 'MM' ? 'Myanmar' : 'Global'}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs capitalize">
                {account.accountType}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-6 sm:w-6"
                onClick={() => onEdit(account)}
              >
                <Edit className="h-4 w-4 sm:h-3 sm:w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-6 sm:w-6 text-destructive hover:text-destructive"
                onClick={() => onDelete(account.id)}
              >
                <Trash2 className="h-4 w-4 sm:h-3 sm:w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 p-4">
        <div className="space-y-3">
          <div 
            className={cn(
              "text-2xl sm:text-lg font-bold",
              isCredit && isNegative ? "text-red-600" : "text-green-600",
              !isCredit && isNegative ? "text-red-600" : ""
            )}
          >
            {formatCurrency(account.balance, account.currency)}
          </div>
          
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              Updated {new Date(account.lastUpdated).toLocaleDateString('th-TH', {
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}