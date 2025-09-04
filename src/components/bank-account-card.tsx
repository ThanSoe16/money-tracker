import * as React from "react"
import { BankAccount } from "@/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatTHB } from "@/lib/currency"
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
        "relative transition-all duration-200 hover:shadow-md hover:scale-105 animate-slide-in",
        className
      )}
      style={{ borderTopColor: account.color, borderTopWidth: '3px' }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <h3 className="font-semibold text-sm leading-none truncate">
                {account.accountNickname}
              </h3>
              {account.isDefault && (
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {account.bankName}
            </p>
            {account.country !== 'TH' && (
              <Badge variant="outline" className="text-xs mt-1 w-fit">
                {account.country === 'MM' ? 'Myanmar' : 'Global'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onEdit(account)}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={() => onDelete(account.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-end justify-between">
          <div>
            <div 
              className={cn(
                "text-lg font-bold",
                isCredit && isNegative ? "text-red-600" : "text-foreground",
                !isCredit && isNegative ? "text-red-600" : ""
              )}
            >
              {formatTHB(account.balance)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span 
                className="inline-block w-2 h-2 rounded-full" 
                style={{ backgroundColor: account.color }}
              />
              <span className="text-xs text-muted-foreground capitalize">
                {account.accountType}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              Updated
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(account.lastUpdated).toLocaleDateString('th-TH', {
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