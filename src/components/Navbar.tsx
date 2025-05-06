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

const THEME_KEY = "theme";

function getPreferredTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || "dark") return stored;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  return mq.matches ? "dark" : "light";
}

interface NavLink {
  label: string;
  href: string;
  sectionId: string;
}

// Updated navLinks with sectionId for intersection observer
const navLinks: NavLink[] = [
  { label: 'Home', href: '#hero', sectionId: 'hero' },
  { label: 'Features', href: '#features', sectionId: 'features' },
  { label: 'Pricing', href: '#pricing', sectionId: 'pricing' },
  { label: 'Security', href: '#security', sectionId: 'security' },
];

const Navbar = () => {
  const [theme, setTheme] = useState<"light" | "dark">(getPreferredTheme());
  const location = useLocation();
  const navigate = useNavigate();
  const { license } = useLicense();
  const isPrivacyPage = location.pathname === '/privacy';
  const isCookiePolicyPage = location.pathname === '/cookie-policy';
  const isTermsOfServicePage = location.pathname === '/terms-of-service';
  const [activeSection, setActiveSection] = useState<string>('hero');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Listen to system preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Set up intersection observer for sections
  useEffect(() => {
    // Don't set up observers on non-index pages
    if (location.pathname !== '/') return;

    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Filter for elements that are currently intersecting
        const intersectingEntries = entries.filter(entry => entry.isIntersecting);
        
        // If we have intersecting entries, use the one with the highest ratio
        if (intersectingEntries.length > 0) {
          // Sort by intersection ratio (highest first)
          const sortedEntries = [...intersectingEntries].sort(
            (a, b) => b.intersectionRatio - a.intersectionRatio
          );
          
          // Get the ID of the most visible section
          const mostVisibleId = sortedEntries[0].target.id;
          setActiveSection(mostVisibleId);
        }
      },
      {
        // Root is the viewport
        root: null,
        // Start detecting when element is 10% visible
        threshold: [0.1, 0.5],
        // Consider the whole viewport plus some margin
        rootMargin: '-80px 0px -20% 0px' 
      }
    );

    // Observe all sections
    navLinks.forEach(link => {
      const section = document.getElementById(link.sectionId);
      if (section) {
        observerRef.current?.observe(section);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [location.pathname]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleNavigation = (href: string, sectionId: string) => {
    if (isPrivacyPage || isCookiePolicyPage || isTermsOfServicePage) {
      // If on privacy or cookie policy or terms of service page, navigate to main page first
      navigate('/' + href);
    } else {
      // On main page, scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-background/95 backdrop-blur-sm z-50 shadow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <DropTidyLogo size={36} />
          <span className="text-xl font-bold text-indigo-600 logo-text" aria-label="DropTidy">
            DropTidy
          </span>
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          {navLinks.map((link) => (
            <button 
              key={link.href} 
              onClick={() => handleNavigation(link.href, link.sectionId)} 
              className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                activeSection === link.sectionId
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                  : 'text-gray-700 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400'
              }`}
              aria-current={activeSection === link.sectionId ? "page" : undefined}
            >
              {link.label}
            </button>
          ))}
          <Badge variant={license === 'pro' ? "default" : "secondary"} className="mr-2">
            {license === 'pro' ? '✨ Pro' : 'Free'}
          </Badge>
          <Link to="/privacy">
            <Button variant="outline">Privacy Policy</Button>
          </Link>
          <FeedbackForm />
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              // Sun icon (light mode)
              <svg width="24" height="24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="5" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </g>
              </svg>
            ) : (
              // Moon icon (dark mode)
              <svg width="24" height="24" fill="none" aria-hidden="true">
                <path
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:w-64">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                Navigate through DropTidy
                <Badge variant={license === 'pro' ? "default" : "secondary"}>
                  {license === 'pro' ? '✨ Pro' : 'Free'}
                </Badge>
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              {navLinks.map((link) => (
                <Button 
                  variant={activeSection === link.sectionId ? "secondary" : "ghost"}
                  key={link.href} 
                  onClick={() => handleNavigation(link.href, link.sectionId)} 
                  className="justify-start"
                >
                  {link.label}
                </Button>
              ))}
              <Link to="/privacy">
                <Button variant="outline" className="justify-start">Privacy Policy</Button>
              </Link>
              <Link to="/cookie-policy">
                <Button variant="outline" className="justify-start">Cookie Policy</Button>
              </Link>
              <Link to="/terms-of-service">
                <Button variant="outline" className="justify-start">Terms of Service</Button>
              </Link>
              <FeedbackForm 
                trigger={
                  <Button variant="outline" className="justify-start gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Send Feedback
                  </Button>
                }
              />
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  // Sun icon (light mode)
                  <svg width="24" height="24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="5" fill="currentColor" />
                    <g stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </g>
                  </svg>
                ) : (
                  // Moon icon (dark mode)
                  <svg width="24" height="24" fill="none" aria-hidden="true">
                    <path
                      d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
