import React, { useState } from 'react';
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
import { Menu } from "lucide-react"
import DropTidyLogo from "./DropTidyLogo";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Security', href: '#security' },
  { label: 'Testimonials', href: '#testimonials' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
