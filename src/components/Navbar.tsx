
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 
      ${isScrolled || isMenuOpen ? 'bg-white/90 backdrop-blur-md shadow-sm dark:bg-gray-900/90' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">DropTidy</span>
          </div>

          {!isMobile && (
            <div className="flex items-center space-x-6">
              <button
                onClick={() => scrollToSection('hero')}
                className="text-sm font-medium text-gray-700 hover:text-droptidy-purple dark:text-gray-300 dark:hover:text-white"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-sm font-medium text-gray-700 hover:text-droptidy-purple dark:text-gray-300 dark:hover:text-white"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-sm font-medium text-gray-700 hover:text-droptidy-purple dark:text-gray-300 dark:hover:text-white"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('video')}
                className="text-sm font-medium text-gray-700 hover:text-droptidy-purple dark:text-gray-300 dark:hover:text-white"
              >
                Video
              </button>
              <button
                onClick={() => scrollToSection('security')}
                className="text-sm font-medium text-gray-700 hover:text-droptidy-purple dark:text-gray-300 dark:hover:text-white"
              >
                About
              </button>
            </div>
          )}

          {!isMobile && (
            <div className="flex items-center space-x-4">
              <Button variant="link" className="text-gray-700 hover:text-droptidy-purple dark:text-gray-300">
                Log in
              </Button>
              <Button className="bg-droptidy-purple hover:bg-droptidy-purple-dark">
                Try Free
              </Button>
            </div>
          )}

          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
        </div>
      </div>

      {isMobile && isMenuOpen && (
        <div className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection('hero')}
                className="flex w-full justify-start py-2 text-left text-sm font-medium text-gray-700 hover:text-droptidy-purple dark:text-gray-300"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="flex w-full justify-start py-2 text-left text-sm font-medium text-gray-700 hover:text-droptidy-purple dark:text-gray-300"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="flex w-full justify-start py-2 text-left text-sm font-medium text-gray-700 hover:text-droptidy-purple dark:text-gray-300"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('video')}
                className="flex w-full justify-start py-2 text-left text-sm font-medium text-gray-700 hover:text-droptidy-purple dark:text-gray-300"
              >
                Video
              </button>
              <button
                onClick={() => scrollToSection('security')}
                className="flex w-full justify-start py-2 text-left text-sm font-medium text-gray-700 hover:text-droptidy-purple dark:text-gray-300"
              >
                About
              </button>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" className="justify-center w-full">
                  Log in
                </Button>
                <Button className="justify-center w-full bg-droptidy-purple hover:bg-droptidy-purple-dark">
                  Try Free
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

