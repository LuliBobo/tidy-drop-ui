import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, MessageCircle } from "lucide-react"
import DropTidyLogo from "./DropTidyLogo";
import { useLicense } from '@/lib/license-context';
import FeedbackForm from './FeedbackForm';

// Web-compatible version - always return false for isElectron
export function isElectron(): boolean {
  return false;
}

const THEME_KEY = "theme";

/**
 * Type definition for theme to ensure type safety
 */
type Theme = "light" | "dark";

/**
 * Gets the preferred theme from localStorage or system preference
 * with proper type checks and fallbacks
 */
function getPreferredTheme(): Theme {
  // Handle SSR case
  if (typeof window === "undefined") return "light";

  try {
    // In web builds, always use localStorage or system preference
    const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    // If no stored theme, check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch (error) {
    console.error("Error getting preferred theme:", error);
  }

  // Default theme
  return "light";
}

/**
 * Navigation component that handles both desktop and mobile navigation
 */
const Navbar = () => {
  const [theme, setTheme] = useState<Theme>(getPreferredTheme());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { license } = useLicense();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = useRef<HTMLDivElement>(null);

  // Determine if running in Electron environment
  const isElectronEnv = false; // Always false for web version
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Initialize theme and set body class
  useEffect(() => {
    const savedTheme = getPreferredTheme();
    setTheme(savedTheme);
    
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light";
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(newTheme);
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Navigation items with proper accessibility
  const navLinks = [
    { name: "Home", path: "/", ariaLabel: "Go to home page" },
    { name: "Privacy", path: "/privacy", ariaLabel: "View privacy policy" },
    { name: "Terms", path: "/terms", ariaLabel: "View terms of service" }
  ];

  // Handle opening file dialog - web-safe version
  const handleOpenFileDialog = () => {
    // Web version - show a message
    alert('File dialog is only available in the desktop app');
    console.log('File dialog not available in web version');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <DropTidyLogo size={24} />
            <span className="font-bold">DropTidy</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                aria-label={link.ariaLabel}
                className={`transition-colors hover:text-foreground/80 ${
                  location.pathname === link.path ? 'text-foreground' : 'text-foreground/60'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center justify-end space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Open feedback form"
            onClick={() => setIsFeedbackOpen(true)}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          
          {/* Show "Try Desktop App" button only in web */}
          <a 
            href="https://droptidy.com/download"
            target="_blank" 
            rel="noreferrer" 
            className="hidden sm:inline-flex"
          >
            <Button 
              variant="outline" 
              className="bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300"
            >
              Download Desktop App
            </Button>
          </a>
  
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                aria-label="Open menu"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Navigate to different sections of DropTidy
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <a 
                  href="https://droptidy.com/download" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                >
                  Download Desktop App
                </a>
              </nav>
            </SheetContent>
          </Sheet>
          
          {isFeedbackOpen && (
            <FeedbackForm 
              open={isFeedbackOpen} 
              onOpenChange={() => setIsFeedbackOpen(false)} 
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
