import { useState, useEffect } from "react"
import { Button } from "./button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./sheet"

const COOKIE_CONSENT_KEY = "cookie-consent"

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(allConsent))
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(minimalConsent))
    setShowBanner(false)
  }

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences))
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t shadow-lg dark:bg-gray-800 dark:border-gray-700">
      <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          We use cookies to enhance your browsing experience and analyze our traffic. 
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="link" className="px-1 h-auto">
                Manage preferences
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Cookie Preferences</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="necessary-cookies" className="flex-1">
                      <h4 className="font-medium">Necessary Cookies</h4>
                      <p className="text-sm text-gray-500">Required for the website to function properly</p>
                    </label>
                    <input 
                      id="necessary-cookies"
                      type="checkbox" 
                      checked 
                      disabled 
                      className="h-4 w-4"
                      aria-label="Necessary cookies"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="analytics-cookies" className="flex-1">
                      <h4 className="font-medium">Analytics Cookies</h4>
                      <p className="text-sm text-gray-500">Help us improve our website</p>
                    </label>
                    <input 
                      id="analytics-cookies"
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="h-4 w-4"
                      aria-label="Analytics cookies"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="marketing-cookies" className="flex-1">
                      <h4 className="font-medium">Marketing Cookies</h4>
                      <p className="text-sm text-gray-500">Used to show you relevant ads</p>
                    </label>
                    <input 
                      id="marketing-cookies"
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="h-4 w-4"
                      aria-label="Marketing cookies"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button onClick={handleSavePreferences} className="w-full">
                    Save preferences
                  </Button>
                  <div className="flex justify-center">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="px-0 h-auto text-sm"
                      onClick={() => window.open('/cookie-policy', '_blank')}
                    >
                      Cookie Policy
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          {" · "}
          <Button 
            variant="link" 
            className="px-0 h-auto"
            onClick={() => window.open('/cookie-policy', '_blank')}
          >
            Cookie Policy
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRejectAll}>
            Reject all
          </Button>
          <Button onClick={handleAcceptAll}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  )
}