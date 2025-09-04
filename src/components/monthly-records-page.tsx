"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CalendarDays, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  PieChart,
  Plus,
  FileText
} from "lucide-react";
import { format, subMonths } from "date-fns";
import { formatTHB, formatTHBCompact } from "@/lib/currency";
import { storageService } from "@/lib/storage";
import { MonthlyRecord } from "@/types";

export function MonthlyRecordsPage() {
  const [monthlyRecords, setMonthlyRecords] = React.useState<MonthlyRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = React.useState(format(new Date(), 'yyyy-MM'));
  const [currentRecord, setCurrentRecord] = React.useState<MonthlyRecord | null>(null);
  const [editingNotes, setEditingNotes] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [income, setIncome] = React.useState(0);

  React.useEffect(() => {
    loadMonthlyRecords();
  }, []);

  const loadCurrentRecord = React.useCallback(() => {
    const existing = monthlyRecords.find(r => r.month === selectedMonth);
    if (existing) {
      setCurrentRecord(existing);
      setNotes(existing.notes || "");
      setIncome(existing.totalIncome);
    } else {
      setCurrentRecord(null);
      setNotes("");
      setIncome(0);
    }
  }, [monthlyRecords, selectedMonth]);

  React.useEffect(() => {
    loadCurrentRecord();
  }, [loadCurrentRecord]);

  const loadMonthlyRecords = () => {
    const records = storageService.getMonthlyRecords();
    setMonthlyRecords(records.sort((a, b) => b.month.localeCompare(a.month)));
  };

  const generateRecord = () => {
    const record = storageService.generateMonthlyRecord(selectedMonth);
    record.totalIncome = income;
    record.notes = notes;
    
    storageService.addMonthlyRecord(record);
    loadMonthlyRecords();
  };

  const updateRecord = () => {
    if (!currentRecord) return;
    
    const updatedRecord = {
      ...currentRecord,
      totalIncome: income,
      notes,
    };
    
    storageService.addMonthlyRecord(updatedRecord);
    loadMonthlyRecords();
    setEditingNotes(false);
  };

  const getAvailableMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const month = subMonths(now, i);
      months.push(format(month, 'yyyy-MM'));
    }
    return months;
  };

  const categoryLabels: Record<string, string> = {
    food: 'Food & Dining',
    transport: 'Transportation', 
    shopping: 'Shopping',
    entertainment: 'Entertainment',
    bills: 'Bills & Utilities',
    healthcare: 'Healthcare',
    others: 'Others',
  };

  const getBudgetStatus = (utilization: number) => {
    if (utilization <= 80) return { color: 'bg-green-500', label: 'On Track', variant: 'default' as const };
    if (utilization <= 100) return { color: 'bg-yellow-500', label: 'Warning', variant: 'secondary' as const };
    return { color: 'bg-red-500', label: 'Over Budget', variant: 'destructive' as const };
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Monthly Records</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your monthly financial summaries</p>
        </div>
      </div>

      {/* Month Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
            Select Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end w-full">
            <div className="flex-1 min-w-0">
              <label className="text-sm font-medium block mb-2">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="text-base" style={{ fontSize: '16px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMonths().map(month => (
                    <SelectItem key={month} value={month}>
                      {format(new Date(month + '-01'), 'MMMM yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-sm font-medium block mb-2">Monthly Income</label>
              <Input
                type="number"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                placeholder="0"
                className="text-base"
                style={{ fontSize: '16px' }}
              />
            </div>
            <Button 
              onClick={currentRecord ? updateRecord : generateRecord}
              className="w-full sm:w-auto mt-2 sm:mt-0"
            >
              {currentRecord ? 'Update Record' : 'Generate Record'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentRecord && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="w-full">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Income</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                      {formatTHBCompact(currentRecord.totalIncome)}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Expenses</p>
                    <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">
                      {formatTHBCompact(currentRecord.totalExpenses)}
                    </p>
                  </div>
                  <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Net Savings</p>
                    <p className={`text-lg sm:text-2xl font-bold truncate ${
                      (currentRecord.totalIncome - currentRecord.totalExpenses) >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {formatTHBCompact(currentRecord.totalIncome - currentRecord.totalExpenses)}
                    </p>
                  </div>
                  <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Budget Usage</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <p className="text-lg sm:text-2xl font-bold">
                        {currentRecord.budgetUtilization.toFixed(1)}%
                      </p>
                      <Badge 
                        variant={getBudgetStatus(currentRecord.budgetUtilization).variant}
                        className="text-xs w-fit"
                      >
                        {getBudgetStatus(currentRecord.budgetUtilization).label}
                      </Badge>
                    </div>
                  </div>
                  <PieChart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 w-full">
                {Object.entries(currentRecord.categoryBreakdown).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg w-full overflow-hidden">
                    <span className="text-sm sm:text-base font-medium truncate pr-2 flex-1 min-w-0">{categoryLabels[category]}</span>
                    <span className="text-sm sm:text-base font-bold whitespace-nowrap flex-shrink-0">{formatTHB(amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Account Balances */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Account Balances</CardTitle>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 w-full">
                {currentRecord.accountBalances.map((account) => (
                  <div key={account.accountId} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg w-full overflow-hidden">
                    <span className="text-sm sm:text-base font-medium truncate pr-2 flex-1 min-w-0">{account.accountName}</span>
                    <span className={`text-sm sm:text-base font-bold whitespace-nowrap flex-shrink-0 ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatTHB(account.balance)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-lg sm:text-xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  Notes
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingNotes(!editingNotes)}
                  className="w-fit"
                >
                  {editingNotes ? 'Cancel' : 'Edit'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-hidden">
              {editingNotes ? (
                <div className="space-y-3 sm:space-y-4 w-full">
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this month..."
                    className="text-base"
                    style={{ fontSize: '16px' }}
                  />
                  <Button onClick={updateRecord} className="w-full sm:w-auto">Save Notes</Button>
                </div>
              ) : (
                <p className="text-sm sm:text-base text-muted-foreground break-words">
                  {currentRecord.notes || "No notes added yet."}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!currentRecord && (
        <Card className="w-full">
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center py-6 sm:py-8 px-4 w-full">
              <CalendarDays className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg font-medium mb-2">No record for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</p>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">Generate a monthly record to see your financial summary</p>
              <Button onClick={generateRecord} className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Generate Record
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}