'use client'

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardPage } from "@/components/dashboard-page"
import { AccountsPage } from "@/components/accounts-page"
import { BudgetPage } from "@/components/budget-page"
import { ExpensesPage } from "@/components/expenses-page"
import { PWAPrompt } from "@/components/pwa-prompt"
import { OfflineIndicator } from "@/components/offline-indicator"
import { Home, Wallet, Target, Receipt } from "lucide-react"

export function MainLayout() {
  const [activeTab, setActiveTab] = React.useState("dashboard")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1">
        {/* Content */}
        <div className="flex-1 pb-20"> {/* Add bottom padding for navigation */}
          <TabsContent value="dashboard" className="mt-0 h-full">
            <DashboardPage />
          </TabsContent>
          
          <TabsContent value="accounts" className="mt-0 h-full">
            <AccountsPage />
          </TabsContent>
          
          <TabsContent value="budget" className="mt-0 h-full">
            <BudgetPage />
          </TabsContent>
          
          <TabsContent value="expenses" className="mt-0 h-full">
            <ExpensesPage />
          </TabsContent>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 bottom-nav">
          <div className="container mx-auto px-4">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4 h-16 bg-transparent gap-1 py-2">
              <TabsTrigger 
                value="dashboard" 
                className="flex flex-col items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs py-2 px-1 h-auto rounded-lg transition-all duration-200 data-[state=active]:scale-105"
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="accounts" 
                className="flex flex-col items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs py-2 px-1 h-auto rounded-lg transition-all duration-200 data-[state=active]:scale-105"
              >
                <Wallet className="h-5 w-5" />
                <span className="font-medium">Accounts</span>
              </TabsTrigger>
              <TabsTrigger 
                value="budget" 
                className="flex flex-col items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs py-2 px-1 h-auto rounded-lg transition-all duration-200 data-[state=active]:scale-105"
              >
                <Target className="h-5 w-5" />
                <span className="font-medium">Budget</span>
              </TabsTrigger>
              <TabsTrigger 
                value="expenses" 
                className="flex flex-col items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs py-2 px-1 h-auto rounded-lg transition-all duration-200 data-[state=active]:scale-105"
              >
                <Receipt className="h-5 w-5" />
                <span className="font-medium">Expenses</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* PWA Install Prompt */}
        <PWAPrompt />
      </Tabs>
      
      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  )
}