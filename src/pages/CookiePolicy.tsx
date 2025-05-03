
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        {/* Sticky section navigation */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border py-3 px-4 shadow-sm">
          <div className="container mx-auto max-w-4xl flex items-center gap-4 overflow-x-auto pb-1">
            <RouterLink 
              to="#overview" 
              className="text-sm px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 whitespace-nowrap transition-colors"
            >
              Overview
            </RouterLink>
            <RouterLink 
              to="#what-are-cookies" 
              className="text-sm px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 whitespace-nowrap transition-colors"
            >
              What Are Cookies
            </RouterLink>
            <RouterLink 
              to="#types-of-cookies" 
              className="text-sm px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 whitespace-nowrap transition-colors"
            >
              Types of Cookies
            </RouterLink>
            <RouterLink 
              to="#managing-preferences" 
              className="text-sm px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 whitespace-nowrap transition-colors"
            >
              Managing Preferences
            </RouterLink>
            <RouterLink 
              to="#third-party-cookies" 
              className="text-sm px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 whitespace-nowrap transition-colors"
            >
              Third-Party Cookies
            </RouterLink>
            <RouterLink 
              to="#contact" 
              className="text-sm px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 whitespace-nowrap transition-colors"
            >
              Contact
            </RouterLink>
          </div>
        </div>

        {/* Cookie policy content */}
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            <section id="overview" className="scroll-mt-32">
              <div className="flex items-center gap-2 mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-droptidy-purple">
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                  <path d="M8.5 8.5v.01" />
                  <path d="M16 15.5v.01" />
                  <path d="M12 12v.01" />
                </svg>
                <h1 className="text-3xl font-bold">Cookie Policy</h1>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300">
                Effective Date: May 1, 2025
              </p>
              
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                This Cookie Policy explains how DropTidy ("we", "us", or "our") uses cookies and similar 
                technologies on our website droptidy.com. By using our website, you consent to our use 
                of cookies in accordance with this policy.
              </p>
            </section>
            
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
            
            <section id="what-are-cookies" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Cookies are small text files placed on your device (computer, tablet, smartphone) by websites 
                that you visit. They are widely used to make websites work, improve user experience, and 
                provide information to site owners.
              </p>
            </section>
            
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
            
            <section id="types-of-cookies" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>
              <p className="text-gray-600 dark:text-gray-300">
                We use the following types of cookies:
              </p>
              
              <div className="mt-4 space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">a. Strictly Necessary Cookies</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    These cookies are essential for the website to function properly. They include, for example, 
                    cookies that allow you to log in, access secure areas, or remember your cookie preferences.
                  </p>
                  <p className="mt-2 font-medium text-gray-600 dark:text-gray-300">
                    These cookies cannot be disabled.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">b. Functional Cookies</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    These help enhance functionality and personalization, such as remembering your preferences 
                    or previous actions.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">c. Analytics Cookies</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    These allow us to understand how visitors interact with the website (e.g., page visits, 
                    traffic sources) so we can improve performance.
                  </p>
                  <p className="mt-2 font-medium text-gray-600 dark:text-gray-300">
                    We only use these cookies if you have given us your consent.
                  </p>
                </div>
              </div>
            </section>
            
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
            
            <section id="managing-preferences" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold mb-4">3. Managing Your Cookie Preferences</h2>
              <p className="text-gray-600 dark:text-gray-300">
                You can manage your cookie preferences at any time by clicking "Manage Preferences" 
                in the cookie banner or via your browser settings.
              </p>
              
              <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Most browsers allow you to control cookies through settings.</li>
                <li>You can delete existing cookies and block future ones.</li>
                <li>Disabling cookies may impact your experience on our site.</li>
              </ul>
            </section>
            
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
            
            <section id="third-party-cookies" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
              <p className="text-gray-600 dark:text-gray-300">
                We may allow trusted third parties (e.g., analytics providers) to set cookies on our site 
                to help us analyze usage and improve services. These third parties may have their own cookie policies.
              </p>
              <p className="mt-4 font-medium text-gray-600 dark:text-gray-300">
                We never share personal data without your explicit consent.
              </p>
            </section>
            
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
            
            <section id="changes" className="scroll-mt-32">
              <h2 className="text-2xl font-semibold mb-4">5. Changes to This Policy</h2>
              <p className="text-gray-600 dark:text-gray-300">
                We may update this Cookie Policy from time to time. When we do, we will revise the "Effective Date" 
                at the top. We encourage you to review this page regularly.
              </p>
            </section>
            
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
            
            <section id="contact" className="scroll-mt-32 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-300">
                If you have any questions about our use of cookies or this policy, feel free to contact us at:
              </p>
              <div className="mt-4 flex items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-droptidy-purple mr-2">
                  <path d="M21.5 18l-8-7 8-7H3v14h18.5z" />
                </svg>
                <a href="mailto:privacy@droptidy.com" className="text-droptidy-purple font-medium hover:underline">
                  privacy@droptidy.com
                </a>
              </div>
            </section>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookiePolicy;
