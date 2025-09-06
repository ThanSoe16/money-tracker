import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ExchangeSettings, CURRENCIES } from "@/types"
import { storageService } from "@/lib/storage"
import { getCurrencySymbol } from "@/lib/currency"

interface ExchangeSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSettingsUpdated?: () => void
}

export function ExchangeSettingsDialog({ 
  open, 
  onOpenChange, 
  onSettingsUpdated
}: ExchangeSettingsDialogProps) {
  const [settings, setSettings] = React.useState<ExchangeSettings>({
    rates: {},
    lastUpdated: new Date().toISOString(),
    autoUpdate: false
  })
  const [loading, setLoading] = React.useState(false)

  // Load current settings when dialog opens
  React.useEffect(() => {
    if (open) {
      const currentSettings = storageService.getExchangeSettings()
      setSettings(currentSettings)
    }
  }, [open])

  const currencyPairs = React.useMemo(() => {
    const pairs: Array<{from: string, to: string, key: string}> = []
    CURRENCIES.forEach(from => {
      CURRENCIES.forEach(to => {
        if (from !== to) {
          const key = `${from}_${to}`
          pairs.push({ from, to, key })
        }
      })
    })
    return pairs
  }, [])

  const handleRateChange = (key: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setSettings(prev => ({
      ...prev,
      rates: {
        ...prev.rates,
        [key]: numValue
      }
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const updatedSettings: ExchangeSettings = {
        ...settings,
        lastUpdated: new Date().toISOString()
      }
      
      storageService.setExchangeSettings(updatedSettings)
      onSettingsUpdated?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating exchange settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetToDefaults = () => {
    setSettings({
      rates: {
        'THB_USDT': 30.5,
        'USDT_THB': 1/30.5,
        'THB_MMK': 0.85,
        'MMK_THB': 1/0.85,
        'USDT_MMK': 26,
        'MMK_USDT': 1/26
      },
      lastUpdated: new Date().toISOString(),
      autoUpdate: false
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Exchange Rate Settings</DialogTitle>
          <DialogDescription>
            Configure exchange rates for currency conversions. These rates will be used for manual exchanges and account balance calculations.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {currencyPairs.map(({ from, to, key }) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium">
                  1 {getCurrencySymbol(from as 'THB' | 'USDT' | 'MMK')} {from} = ? {getCurrencySymbol(to as 'THB' | 'USDT' | 'MMK')} {to}
                </label>
                <Input
                  type="number"
                  step="0.000001"
                  value={settings.rates[key] || ''}
                  onChange={(e) => handleRateChange(key, e.target.value)}
                  placeholder="0.000000"
                />
              </div>
            ))}
          </div>

          {settings.lastUpdated && (
            <div className="text-xs text-gray-500">
              Last updated: {new Date(settings.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}