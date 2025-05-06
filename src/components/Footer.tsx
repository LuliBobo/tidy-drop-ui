import { Link, useLocation, useNavigate } from 'react-router-dom';
import DropTidyLogo from "./DropTidyLogo";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const scrollToSection = (id: string) => {
    // If we're already on the homepage, just scroll to the section
    if (isHomePage) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth'
        });
      }
    } else {
      // If we're on another page, navigate to home and then scroll
      navigate(`/?section=${id}`);
    }
  };

  const handleCookiePolicy = () => {
    if (isHomePage) {
      // If we're on the homepage, check if cookie-policy section exists
      const cookiePolicySection = document.getElementById('cookie-policy');
      if (cookiePolicySection) {
        cookiePolicySection.scrollIntoView({
          behavior: 'smooth'
        });
      } else {
        // If there's no section on the page, navigate to the separate page
        navigate('/cookie-policy');
      }
    } else {
      // If we're not on the homepage, check if we're on the cookie policy page
      if (location.pathname === '/cookie-policy') {
        // Already on the cookie policy page, do nothing
        return;
      }
      // Otherwise navigate to cookie policy page
      navigate('/cookie-policy');
    }
  };

  const handleTermsOfService = () => {
    if (isHomePage) {
      // If we're on the homepage, check if terms-of-service section exists
      const termsOfServiceSection = document.getElementById('terms-of-service');
      if (termsOfServiceSection) {
        termsOfServiceSection.scrollIntoView({
          behavior: 'smooth'
        });
      } else {
        // If there's no section on the page, navigate to the separate page
        navigate('/terms-of-service');
      }
    } else {
      // If we're not on the homepage, check if we're on the terms of service page
      if (location.pathname === '/terms-of-service') {
        // Already on the terms of service page, do nothing
        return;
      }
      // Otherwise navigate to terms of service page
      navigate('/terms-of-service');
    }
  };

  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 py-12 text-white">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <DropTidyLogo size={36} />
              <span className="text-xl font-bold select-none">DropTidy</span>
            </div>
            <p className="text-gray-400 mb-4">
              Privacy-first tools for cleaning and protecting your visual content.
            </p>
            <p className="text-sm text-gray-500">
              © {year} DropTidy. All rights reserved.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Company</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollToSection('security')} className="text-gray-400 hover:text-white transition-colors">
                  About
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Product</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-white transition-colors">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Changelog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleTermsOfService}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={handleCookiePolicy}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Cookie Policy
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  GDPR Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
