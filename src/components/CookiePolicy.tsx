import React, { useEffect, useState } from 'react';
import { Mail, Cookie, Shield, Settings, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Navbar from './Navbar';

interface CookiePolicyProps {
  embedded?: boolean;
}

const CookiePolicy: React.FC<CookiePolicyProps> = ({ embedded = false }) => {
  const [activeSection, setActiveSection] = useState<string>("what-are-cookies");
  const [currentDate] = useState<string>(new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }));
  
  // Use IntersectionObserver to track active sections when scrolling
  useEffect(() => {
    if (!embedded) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visibleSections = entries.filter(entry => entry.isIntersecting);
          
          if (visibleSections.length > 0) {
            // Sort by intersection ratio (most visible first)
            const mostVisible = [...visibleSections].sort(
              (a, b) => b.intersectionRatio - a.intersectionRatio
            )[0];
            
            const id = mostVisible.target.id;
            setActiveSection(id);
          }
        },
        {
          root: null,
          threshold: [0.1, 0.5],
          rootMargin: '-100px 0px -20% 0px'
        }
      );
      
      // Observe all policy sections
      const sections = document.querySelectorAll('.policy-section');
      sections.forEach(section => {
        observer.observe(section);
      });
      
      return () => {
        observer.disconnect();
      };
    }
  }, [embedded]);
  
  // Scroll to section when nav item is clicked
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className={`${embedded ? '' : 'min-h-screen bg-background'}`}>
      {!embedded && <Navbar />}
      <div className={`${embedded ? 'container mx-auto px-4 py-4' : 'max-w-4xl mx-auto px-4 pt-24 pb-12 sm:px-6 lg:px-8'}`}>
        {!embedded && (
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-2 text-droptidy-purple">
              <Cookie className="h-6 w-6" />
              <h1 className="text-3xl font-bold">Cookie Policy</h1>
            </div>
            <p className="text-gray-600">
              This Cookie Policy explains how <strong>DropTidy</strong> ("we", "us", or "our") 
              uses cookies and similar technologies on our website droptidy.com. By using our website, 
              you consent to our use of cookies in accordance with this policy.
              <span className="block mt-2">Effective Date: {currentDate}</span>
            </p>
          </div>
        )}
        
        <div className="space-y-12">
          {/* Sidebar Navigation for Desktop */}
          {!embedded && (
            <div className="hidden md:block p-4 bg-gray-50 rounded-lg mb-8">
              <h3 className="font-medium text-gray-900 mb-2">Quick Navigation</h3>
              <nav className="flex flex-col space-y-1">
                {[
                  { id: "what-are-cookies", label: "1. What Are Cookies?", icon: <Cookie className="h-4 w-4" /> },
                  { id: "types-of-cookies", label: "2. Types of Cookies", icon: <Shield className="h-4 w-4" /> },
                  { id: "managing-preferences", label: "3. Managing Preferences", icon: <Settings className="h-4 w-4" /> },
                  { id: "third-party-cookies", label: "4. Third-Party Cookies", icon: <ExternalLink className="h-4 w-4" /> },
                  { id: "policy-changes", label: "5. Changes to Policy", icon: <AlertCircle className="h-4 w-4" /> },
                  { id: "contact-us", label: "6. Contact Us", icon: <Mail className="h-4 w-4" /> }
                ].map(item => (
                  <Button 
                    key={item.id}
                    variant={activeSection === item.id ? "secondary" : "ghost"}
                    className="justify-start rounded gap-2"
                    size="sm"
                    onClick={() => scrollToSection(item.id)}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>
          )}
          
          {/* Main Content */}
          <div className="space-y-12">
            {/* Section 1 */}
            <section id="what-are-cookies" className="policy-section space-y-4">
              <div className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-droptidy-purple" />
                <h2 className="text-2xl font-semibold text-gray-900">What Are Cookies?</h2>
              </div>
              <p className="text-gray-600">
                Cookies are small text files placed on your device (computer, tablet, smartphone) by websites 
                that you visit. They are widely used to make websites work, improve user experience, and provide 
                information to site owners.
              </p>
            </section>
            
            {/* Section 2 */}
            <section id="types-of-cookies" className="policy-section space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-droptidy-purple" />
                <h2 className="text-2xl font-semibold text-gray-900">Types of Cookies We Use</h2>
              </div>
              <div className="space-y-3 text-gray-600">
                <p>We use the following types of cookies:</p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Strictly Necessary Cookies</h3>
                    <p className="pl-4">
                      These cookies are essential for the website to function properly. They include, 
                      for example, cookies that allow you to log in, access secure areas, or remember 
                      your cookie preferences.
                    </p>
                    <p className="font-medium pl-4 mt-2">
                      These cookies cannot be disabled.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">Functional Cookies</h3>
                    <p className="pl-4">
                      These help enhance functionality and personalization, such as remembering your preferences 
                      or previous actions.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">Analytics Cookies</h3>
                    <p className="pl-4">
                      These allow us to understand how visitors interact with the website (e.g., page visits, traffic sources) 
                      so we can improve performance.
                    </p>
                    <p className="font-medium pl-4 mt-2">
                      We only use these cookies if you have given us your consent.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Section 3 */}
            <section id="managing-preferences" className="policy-section space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-droptidy-purple" />
                <h2 className="text-2xl font-semibold text-gray-900">Managing Your Cookie Preferences</h2>
              </div>
              <div className="space-y-3 text-gray-600">
                <p>
                  You can manage your cookie preferences at any time by clicking <strong>"Manage Preferences"</strong> in 
                  the cookie banner or via your browser settings.
                </p>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li>Most browsers allow you to control cookies through settings.</li>
                  <li>You can delete existing cookies and block future ones.</li>
                  <li>Disabling cookies may impact your experience on our site.</li>
                </ul>
              </div>
            </section>
            
            {/* Section 4 */}
            <section id="third-party-cookies" className="policy-section space-y-4">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-droptidy-purple" />
                <h2 className="text-2xl font-semibold text-gray-900">Third-Party Cookies</h2>
              </div>
              <div className="space-y-3 text-gray-600">
                <p>
                  We may allow trusted third parties (e.g., analytics providers) to set cookies on our site to help us 
                  analyze usage and improve services. These third parties may have their own cookie policies.
                </p>
                <p className="font-medium">
                  We never share personal data without your explicit consent.
                </p>
              </div>
            </section>
            
            {/* Section 5 */}
            <section id="policy-changes" className="policy-section space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-droptidy-purple" />
                <h2 className="text-2xl font-semibold text-gray-900">Changes to This Policy</h2>
              </div>
              <p className="text-gray-600">
                We may update this Cookie Policy from time to time. When we do, we will revise the "Effective Date" 
                at the top. We encourage you to review this page regularly.
              </p>
            </section>
            
            {/* Section 6 */}
            <section id="contact-us" className="policy-section space-y-4 bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-droptidy-purple" />
                <h2 className="text-2xl font-semibold text-gray-900">Contact Us</h2>
              </div>
              <p className="text-gray-600">
                If you have any questions about our use of cookies or this policy, feel free to contact us at:
              </p>
              <div className="mt-2">
                <p className="text-droptidy-purple font-medium">privacy@droptidy.com</p>
              </div>
            </section>
          </div>
          
          {/* Mobile Navigation */}
          {!embedded && (
            <div className="md:hidden mt-8 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Cookie Policy Sections</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "what-are-cookies", label: "1. What Are Cookies?" },
                  { id: "types-of-cookies", label: "2. Types of Cookies" },
                  { id: "managing-preferences", label: "3. Managing Preferences" },
                  { id: "third-party-cookies", label: "4. Third-Party Cookies" },
                  { id: "policy-changes", label: "5. Changes to Policy" },
                  { id: "contact-us", label: "6. Contact Us" }
                ].map(item => (
                  <Button 
                    key={item.id}
                    variant={activeSection === item.id ? "secondary" : "outline"}
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => scrollToSection(item.id)}
                  >
                    {item.label.split(".")[1]}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;