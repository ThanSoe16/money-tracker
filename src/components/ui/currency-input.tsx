import * as React from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number
  onChange?: (value: number) => void
  showSymbol?: boolean
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value = 0, onChange, showSymbol = true, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState('')
    const [isFocused, setIsFocused] = React.useState(false)

    // Initialize input value
    React.useEffect(() => {
      if (value !== undefined && value !== 0) {
        setInputValue(value.toString())
      } else {
        setInputValue('')
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value
      
      // Remove non-numeric characters except decimal point
      input = input.replace(/[^\d.]/g, '')
      
      // Ensure only one decimal point
      const parts = input.split('.')
      if (parts.length > 2) {
        input = parts[0] + '.' + parts.slice(1).join('')
      }
      
      // Limit to 2 decimal places
      if (parts[1] && parts[1].length > 2) {
        input = parts[0] + '.' + parts[1].substring(0, 2)
      }
      
      setInputValue(input)
      
      // Convert to number and call onChange
      const numericValue = parseFloat(input) || 0
      onChange?.(numericValue)
    }

    const handleBlur = () => {
      // Format the number on blur if it's valid
      const numericValue = parseFloat(inputValue) || 0
      if (numericValue > 0) {
        // Format with 2 decimal places
        setInputValue(numericValue.toFixed(2))
      } else if (inputValue === '' || numericValue === 0) {
        setInputValue('')
      }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      // Select all text on focus for easy editing
      e.target.select()
    }

    const handleBlurWithFocus = () => {
      setIsFocused(false)
      handleBlur()
    }

    return (
      <div className="relative">
        {showSymbol && (
          <span className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
            isFocused ? "text-primary" : "text-muted-foreground"
          )}>
            ฿
          </span>
        )}
        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode="decimal"
          pattern="[0-9]*\.?[0-9]*"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlurWithFocus}
          onFocus={handleFocus}
          className={cn(
            showSymbol ? "pl-8" : "",
            "text-base", // Prevent zoom on mobile
            className
          )}
          placeholder={showSymbol ? "0.00" : "฿0.00"}
        />
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }