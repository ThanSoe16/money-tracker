import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { CurrencyExchange, CURRENCIES } from "@/types";
import { storageService } from "@/lib/storage";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

interface CurrencyExchangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExchangeAdded?: (exchange: CurrencyExchange) => void;
}

interface ExchangeForm {
  fromAmount: number;
  fromCurrency: "THB" | "USDT" | "MMK";
  toCurrency: "THB" | "USDT" | "MMK";
  exchangeRate: number;
  fromAccountId: string;
  toAccountId: string;
  description: string;
  fees: number;
}

export function CurrencyExchangeDialog({
  open,
  onOpenChange,
  onExchangeAdded,
}: CurrencyExchangeDialogProps) {
  const [form, setForm] = React.useState<ExchangeForm>({
    fromAmount: 0,
    fromCurrency: "THB",
    toCurrency: "USDT",
    exchangeRate: 0,
    fromAccountId: "",
    toAccountId: "",
    description: "",
    fees: 0,
  });
  const [loading, setLoading] = React.useState(false);

  const accounts = React.useMemo(() => 
    storageService.getAccounts().filter((account) => account.isActive),
    []
  );
  const exchangeSettings = React.useMemo(() => 
    storageService.getExchangeSettings(),
    []
  );

  // Filter accounts by currency (memoized to prevent infinite re-renders)
  const fromAccounts = React.useMemo(() => 
    accounts.filter((account) => account.currency === form.fromCurrency),
    [accounts, form.fromCurrency]
  );
  
  const toAccounts = React.useMemo(() => 
    accounts.filter((account) => account.currency === form.toCurrency),
    [accounts, form.toCurrency]
  );

  // Calculate exchange rate from settings when currencies change
  React.useEffect(() => {
    if (form.fromCurrency !== form.toCurrency) {
      const rateKey = `${form.fromCurrency}_${form.toCurrency}`;
      const rate = exchangeSettings.rates[rateKey];
      if (rate) {
        setForm((prev) => ({ ...prev, exchangeRate: rate }));
      }
    }
  }, [form.fromCurrency, form.toCurrency, exchangeSettings]);

  // Reset account selections when currency changes
  React.useEffect(() => {
    setForm((prev) => ({ ...prev, fromAccountId: fromAccounts[0]?.id || "" }));
  }, [fromAccounts]);

  React.useEffect(() => {
    setForm((prev) => ({ ...prev, toAccountId: toAccounts[0]?.id || "" }));
  }, [toAccounts]);

  const toAmount = (form.fromAmount - (form.fees || 0)) * form.exchangeRate;

  const handleSubmit = async () => {
    if (
      !form.fromAmount ||
      !form.exchangeRate ||
      !form.fromAccountId ||
      !form.toAccountId
    )
      return;

    setLoading(true);
    try {
      const exchange: CurrencyExchange = {
        id: `exchange_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        fromAmount: form.fromAmount,
        fromCurrency: form.fromCurrency,
        toAmount,
        toCurrency: form.toCurrency,
        exchangeRate: form.exchangeRate,
        fromAccountId: form.fromAccountId,
        toAccountId: form.toAccountId,
        date: new Date().toISOString(),
        description: form.description,
        fees: form.fees || 0,
      };

      // Add to storage
      storageService.addCurrencyExchange(exchange);

      // Update account balances
      const fromAccount = accounts.find((a) => a.id === form.fromAccountId);
      const toAccount = accounts.find((a) => a.id === form.toAccountId);

      if (fromAccount) {
        storageService.updateAccount(fromAccount.id, {
          balance: fromAccount.balance - form.fromAmount,
          lastUpdated: new Date().toISOString(),
        });
      }

      if (toAccount) {
        storageService.updateAccount(toAccount.id, {
          balance: toAccount.balance + toAmount,
          lastUpdated: new Date().toISOString(),
        });
      }

      onExchangeAdded?.(exchange);
      onOpenChange(false);

      // Reset form
      setForm({
        fromAmount: 0,
        fromCurrency: "THB",
        toCurrency: "USDT",
        exchangeRate: 0,
        fromAccountId: "",
        toAccountId: "",
        description: "",
        fees: 0,
      });
    } catch (error) {
      console.error("Error adding currency exchange:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Currency Exchange</DialogTitle>
          <DialogDescription>
            Exchange money between different currencies across your accounts.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* From Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">From</h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Amount</label>
                  <CurrencyInput
                    value={form.fromAmount}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, fromAmount: value }))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-500 mb-1">Currency</label>
                  <Select
                    value={form.fromCurrency}
                    onValueChange={(value: "THB" | "USDT" | "MMK") =>
                      setForm((prev) => ({ ...prev, fromCurrency: value }))
                    }
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
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">From Account</label>
                <Select
                  value={form.fromAccountId}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, fromAccountId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {fromAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: account.color }}
                          />
                          <span>{account.accountNickname}</span>
                          <span className="text-xs text-gray-500">
                            {formatCurrency(account.balance, account.currency)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Exchange Rate</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>1 {form.fromCurrency} =</span>
                <span className="font-medium">{form.toCurrency}</span>
              </div>
              <Input
                type="number"
                step="0.000001"
                value={form.exchangeRate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    exchangeRate: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="Enter exchange rate"
                className="text-center text-lg font-mono"
              />
            </div>
          </div>

          {/* Fees */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Exchange Fees <span className="text-xs text-gray-500">(in {form.fromCurrency})</span>
            </h4>
            <CurrencyInput
              value={form.fees}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, fees: value }))
              }
              placeholder="0.00"
              showSymbol={false}
            />
          </div>

          {/* To Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">To</h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Amount (You will receive)</label>
                  <Input
                    value={formatCurrency(toAmount, form.toCurrency, false)}
                    readOnly
                    className="bg-gray-50 text-lg font-semibold text-green-600"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-500 mb-1">Currency</label>
                  <Select
                    value={form.toCurrency}
                    onValueChange={(value: "THB" | "USDT" | "MMK") =>
                      setForm((prev) => ({ ...prev, toCurrency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.filter((c) => c !== form.fromCurrency).map(
                        (currency) => (
                          <SelectItem key={currency} value={currency}>
                            {getCurrencySymbol(currency)} {currency}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To Account</label>
                <Select
                  value={form.toAccountId}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, toAccountId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {toAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: account.color }}
                          />
                          <span>{account.accountNickname}</span>
                          <span className="text-xs text-gray-500">
                            {formatCurrency(account.balance, account.currency)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Description <span className="text-xs text-gray-400">(Optional)</span></h4>
            <Input
              placeholder="Add a note for this exchange..."
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          {/* Summary */}
          {form.fromAmount > 0 && form.exchangeRate > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-3">
              <h4 className="text-sm font-semibold text-blue-900">Exchange Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">You pay:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(form.fromAmount, form.fromCurrency)}
                  </span>
                </div>
                {(form.fees || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fees:</span>
                    <span className="font-medium text-red-500">
                      -{formatCurrency(form.fees || 0, form.fromCurrency)}
                    </span>
                  </div>
                )}
                <hr className="border-blue-200" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">You receive:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(toAmount, form.toCurrency)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              loading ||
              !form.fromAmount ||
              !form.exchangeRate ||
              !form.fromAccountId ||
              !form.toAccountId ||
              form.fromCurrency === form.toCurrency
            }
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Processing..." : "Exchange Currency"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
