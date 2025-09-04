'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = React.useState(false)

  React.useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      
      // Show our custom install prompt
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Store dismissal to avoid showing again for a while
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  // Don't show if dismissed recently (within 7 days)
  React.useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - dismissedTime < sevenDays) {
        setShowPrompt(false)
      }
    }
  }, [])

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg border-primary/20 bg-background/95 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">Install Money Tracker</CardTitle>
              <CardDescription className="text-sm">
                Install our app for quick access and offline use
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
            >
              Not now
            </Button>
            <Button
              size="sm"
              onClick={handleInstall}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}