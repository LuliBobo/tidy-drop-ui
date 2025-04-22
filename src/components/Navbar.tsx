import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Home } from "lucide-react"
import DropTidyLogo from "./DropTidyLogo";

const THEME_KEY = "theme";

function getPreferredTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  return mq.matches ? "dark" : "light";
}

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Home', href: '#hero' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Security', href: '#security' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(getPreferredTheme());

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

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-background z-50 shadow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropTidyLogo size={36} />
          <span className="text-xl font-bold text-indigo-600" aria-label="DropTidy" style={{letterSpacing: "0.04em"}}>
            DropTidy
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          {navLinks.map((link) => (
            <button key={link.href} onClick={() => scrollToSection(link.href.slice(1))} className="text-gray-700 hover:text-indigo-500 transition-colors">
              {link.label}
            </button>
          ))}
          <Link to="/privacy">
            <Button variant="outline">Privacy Policy</Button>
          </Link>
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
              <SheetDescription>
                Navigate through DropTidy
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              {navLinks.map((link) => (
                <Button variant="ghost" key={link.href} onClick={() => scrollToSection(link.href.slice(1))} className="justify-start">
                  {link.label}
                </Button>
              ))}
              <Link to="/privacy">
                <Button variant="outline" className="justify-start">Privacy Policy</Button>
              </Link>
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
