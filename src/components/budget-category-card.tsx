import * as React from "react"
import { BudgetCategory } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatTHB } from "@/lib/currency"
import { cn } from "@/lib/utils"

interface BudgetCategoryCardProps {
  name: string
  category: BudgetCategory
  icon?: React.ReactNode
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

export function BudgetCategoryCard({ 
  name, 
  category, 
  icon,
  className 
}: BudgetCategoryCardProps) {
  const percentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0
  const remaining = category.allocated - category.spent
  const isOverBudget = category.spent > category.allocated

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className="text-lg">
            {icon || categoryIcons[name] || '📦'}
          </span>
          <span className="flex-1 truncate">
            {categoryLabels[name] || name}
          </span>
          <span className={cn(
            "text-xs font-normal",
            isOverBudget ? "text-red-600" : "text-muted-foreground"
          )}>
            {Math.round(percentage)}%
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <div className="space-y-2">
          <Progress 
            value={Math.min(percentage, 100)} 
            className={cn(
              "h-2",
              isOverBudget && "bg-red-100"
            )}
          />
          {isOverBudget && (
            <Progress 
              value={percentage - 100} 
              className="h-1 bg-red-100 [&>*]:bg-red-500"
            />
          )}
        </div>
        
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Spent:</span>
            <span className={isOverBudget ? "text-red-600 font-medium" : ""}>
              {formatTHB(category.spent)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Budget:</span>
            <span>{formatTHB(category.allocated)}</span>
          </div>
          <div className="flex justify-between border-t pt-1">
            <span className="text-muted-foreground font-medium">
              {isOverBudget ? 'Over by:' : 'Remaining:'}
            </span>
            <span className={cn(
              "font-medium",
              isOverBudget ? "text-red-600" : "text-green-600"
            )}>
              {formatTHB(Math.abs(remaining))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}