import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./components/PrivacyPolicy";
import CookiePolicyPage from "./pages/CookiePolicy";
import TermsOfServicePage from "./pages/terms-of-service";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import { LicenseContext, LicenseLevel } from "@/lib/license-context";
import { CookieConsent } from "./components/ui/cookie-consent"

const queryClient = new QueryClient();

const App = () => {
  const [license, setLicense] = useState<LicenseLevel>('free');

  return (
    <QueryClientProvider client={queryClient}>
      <LicenseContext.Provider value={{ license, setLicense }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookie-policy" element={<CookiePolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/sign-in" element={<SignIn />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <CookieConsent />
        </TooltipProvider>
      </LicenseContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
