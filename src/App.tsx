import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./components/PrivacyPolicy";
import CreateAccount from "./pages/CreateAccount";
import CookiePolicy from "./pages/CookiePolicy";
import CookieConsent from "./components/CookieConsent";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { LicenseContext, LicenseLevel } from "@/lib/license-context";

// This component handles scrolling to sections when navigating from other pages
const ScrollToSection = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Check if the URL has a hash (section identifier)
    if (location.hash) {
      // Get the element by id (without the # character)
      const elementId = location.hash.substring(1);
      const element = document.getElementById(elementId);
      
      // If the element exists, scroll to it
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 0);
      }
    } else if (location.pathname === '/') {
      // If navigating to the home page without a hash, scroll to top
      window.scrollTo(0, 0);
    }
  }, [location]);
  
  return null;
};

const AppRoutes = () => {
  return (
    <>
      <ScrollToSection />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<SignIn />} /> {/* Alias for signin */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<NotFound />} /> {/* Placeholder for forgot password page */}
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

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
            <AppRoutes />
            <CookieConsent />
          </BrowserRouter>
        </TooltipProvider>
      </LicenseContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
