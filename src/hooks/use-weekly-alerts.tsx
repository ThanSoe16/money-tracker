'use client'

import * as React from "react"
import { storageService } from "@/lib/storage"
import { startOfWeek, format, isAfter, subDays } from "date-fns"

export function useWeeklyAlerts() {
  const [shouldShowAlert, setShouldShowAlert] = React.useState(false)
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null)

  // Check if we should show the weekly alert
  const checkWeeklyAlert = React.useCallback(() => {
    const now = new Date()
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
    const currentWeekStartString = format(currentWeekStart, 'yyyy-MM-dd')

    // Check if we already completed this week's check-in
    const weeklyAlerts = storageService.getWeeklyAlerts()
    const thisWeekAlert = weeklyAlerts.find(alert => 
      alert.weekOf === currentWeekStartString && alert.completed
    )

    if (thisWeekAlert) {
      setShouldShowAlert(false)
      return false
    }

    // Check if current budget exists and has weekly alerts enabled
    const currentBudget = storageService.getCurrentBudget()
    if (!currentBudget || !currentBudget.weeklyAlerts) {
      setShouldShowAlert(false)
      return false
    }

    // Check if it's been more than 7 days since last alert
    const lastAlertDate = currentBudget.lastAlertDate
    if (lastAlertDate) {
      const lastAlert = new Date(lastAlertDate)
      const sevenDaysAgo = subDays(now, 7)
      if (isAfter(lastAlert, sevenDaysAgo)) {
        setShouldShowAlert(false)
        return false
      }
    }

    // Show alert if it's Sunday (day 0) or later in the week
    const dayOfWeek = now.getDay()
    const shouldShow = dayOfWeek === 0 || dayOfWeek >= 1 // Sunday or any day after Monday
    
    setShouldShowAlert(shouldShow)
    return shouldShow
  }, [])

  // Request notification permission
  const requestNotificationPermission = React.useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setHasPermission(permission === 'granted')
      return permission === 'granted'
    }
    setHasPermission(false)
    return false
  }, [])

  // Show browser notification
  const showBrowserNotification = React.useCallback(() => {
    if (!hasPermission || !('Notification' in window)) return

    const currentBudget = storageService.getCurrentBudget()
    if (!currentBudget) return

    const totalSpent = Object.values(currentBudget.categories).reduce((sum, cat) => sum + cat.spent, 0)
    const remaining = currentBudget.totalBudget - totalSpent

    new Notification('💰 Weekly Budget Check-in', {
      body: `Time to update your account balances! Budget remaining: ฿${remaining.toLocaleString()}`,
      icon: '/favicon.ico',
      tag: 'weekly-budget-alert'
    })
  }, [hasPermission])

  // Initialize permissions and check alerts on mount
  React.useEffect(() => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted')
    }
    
    // Small delay to ensure storage is ready
    const timer = setTimeout(() => {
      checkWeeklyAlert()
    }, 1000)

    return () => clearTimeout(timer)
  }, [checkWeeklyAlert])

  // Show notification if alert should be shown and we have permission
  React.useEffect(() => {
    if (shouldShowAlert && hasPermission) {
      showBrowserNotification()
    }
  }, [shouldShowAlert, hasPermission, showBrowserNotification])

  // Periodic check every hour
  React.useEffect(() => {
    const interval = setInterval(() => {
      checkWeeklyAlert()
    }, 60 * 60 * 1000) // Check every hour

    return () => clearInterval(interval)
  }, [checkWeeklyAlert])

  const dismissAlert = React.useCallback(() => {
    setShouldShowAlert(false)
  }, [])

  const completeAlert = React.useCallback(() => {
    setShouldShowAlert(false)
    // The WeeklyAlertModal will handle the actual completion logic
  }, [])

  return {
    shouldShowAlert,
    hasPermission,
    requestNotificationPermission,
    dismissAlert,
    completeAlert,
    checkWeeklyAlert,
  }
}