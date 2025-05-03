
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Check, X, Settings } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
}

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consentStatus = localStorage.getItem('cookieConsent');
    if (!consentStatus) {
      setShowBanner(true);
    } else {
      // Load saved preferences if they exist
      try {
        const savedPreferences = JSON.parse(localStorage.getItem('cookiePreferences') || '{}');
        setPreferences({
          necessary: true, // Always true
          analytics: savedPreferences.analytics || false,
          functional: savedPreferences.functional || false,
        });
      } catch (error) {
        console.error('Error parsing saved cookie preferences:', error);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allPreferences = {
      necessary: true,
      analytics: true,
      functional: true,
    };
    setPreferences(allPreferences);
    saveConsent('accepted', allPreferences);
    toast.success("All cookies accepted", {
      description: "Your preferences have been saved",
      icon: <Check className="h-4 w-4" />,
    });
  };

  const handleRejectAll = () => {
    const minimalPreferences = {
      necessary: true,
      analytics: false,
      functional: false,
    };
    setPreferences(minimalPreferences);
    saveConsent('rejected', minimalPreferences);
    toast.success("All optional cookies rejected", {
      description: "Your preferences have been saved",
      icon: <X className="h-4 w-4" />,
    });
  };

  const handleSavePreferences = () => {
    saveConsent('customized', preferences);
    setShowPreferences(false);
    toast.success("Cookie preferences saved", {
      description: "Your custom settings have been applied",
      icon: <Settings className="h-4 w-4" />,
    });
  };

  const saveConsent = (status: string, prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', status);
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
    setShowBanner(false);
  };

  const handleTogglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't toggle necessary cookies
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-sm text-foreground flex-1">
              We use cookies and similar technologies as described in our Cookie Notice. 
              By clicking 'Accept All', you agree to our use of cookies for analytics and functionality purposes.
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPreferences(true)}
                className="flex-1 md:flex-none"
              >
                Manage Preferences
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRejectAll}
                className="flex-1 md:flex-none"
              >
                Reject All
              </Button>
              <Button 
                size="sm" 
                onClick={handleAcceptAll}
                className="bg-droptidy-purple hover:bg-droptidy-purple/90 text-white flex-1 md:flex-none"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Dialog */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Customize which cookies you want to accept. Strictly necessary cookies cannot be disabled as they are essential for the website to function.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Strictly Necessary Cookies</h4>
                <p className="text-sm text-muted-foreground">
                  Required for the website to function properly.
                </p>
              </div>
              <Switch checked disabled className="opacity-50" />
            </div>
            
            {/* Analytics Cookies */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Analytics Cookies</h4>
                <p className="text-sm text-muted-foreground">
                  Help us understand how you use our website.
                </p>
              </div>
              <Switch 
                checked={preferences.analytics}
                onCheckedChange={() => handleTogglePreference('analytics')}
              />
            </div>
            
            {/* Functional Cookies */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Functional Cookies</h4>
                <p className="text-sm text-muted-foreground">
                  Enable enhanced functionality and personalization.
                </p>
              </div>
              <Switch 
                checked={preferences.functional}
                onCheckedChange={() => handleTogglePreference('functional')}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSavePreferences} className="bg-droptidy-purple hover:bg-droptidy-purple/90 text-white">
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
