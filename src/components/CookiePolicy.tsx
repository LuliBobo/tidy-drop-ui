import { Cookie, Shield, Settings, Bell } from 'lucide-react';
import Navbar from './Navbar';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Introduction */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-droptidy-purple">
              <Cookie className="h-6 w-6" />
              <h1 className="text-3xl font-bold">Cookie Policy</h1>
            </div>
            <p className="text-gray-600">
              This Cookie Policy explains how DropTidy uses cookies and similar technologies 
              to provide, customize, and improve your experience with our services. 
              Last updated: April 2025.
            </p>
          </section>

          {/* What are Cookies */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-droptidy-purple" />
              <h2 className="text-2xl font-semibold text-gray-900">What Are Cookies?</h2>
            </div>
            <div className="space-y-3 text-gray-600">
              <p>
                Cookies are small text files that are placed on your device when you visit our website. 
                They help us provide you with a better experience by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remembering your preferences and settings</li>
                <li>Maintaining your session and login status</li>
                <li>Understanding how you use our services</li>
                <li>Improving site performance and functionality</li>
              </ul>
            </div>
          </section>

          {/* Types of Cookies We Use */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-droptidy-purple" />
              <h2 className="text-2xl font-semibold text-gray-900">Types of Cookies We Use</h2>
            </div>
            <div className="space-y-3 text-gray-600">
              <p>We use the following types of cookies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Essential Cookies:</strong> Required for basic site functionality. These cannot be disabled.
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Help remember your settings and customize your experience.
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site.
                </li>
                <li>
                  <strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign performance.
                </li>
              </ul>
            </div>
          </section>

          {/* Managing Cookies */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-droptidy-purple" />
              <h2 className="text-2xl font-semibold text-gray-900">Managing Your Cookie Preferences</h2>
            </div>
            <div className="space-y-3 text-gray-600">
              <p>
                You can control and/or delete cookies as you wish. You can delete all cookies that are 
                already on your device and you can set most browsers to prevent them from being placed. 
                However, if you do this, you may have to manually adjust some preferences every time 
                you visit our site and some features may not work as intended.
              </p>
              <p>
                To modify your cookie settings on DropTidy, you can:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use our cookie consent banner settings</li>
                <li>Adjust your browser settings to manage cookies</li>
                <li>Contact our support team for assistance</li>
              </ul>
            </div>
          </section>

          {/* Updates to Policy */}
          <section className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900">Updates to This Policy</h2>
            <p className="text-gray-600">
              We may update this Cookie Policy from time to time to reflect changes in our practices 
              or for operational, legal, or regulatory reasons. When we make changes, we will update 
              the "Last Updated" date at the top of this policy and notify you as required by law.
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                For questions about our cookie practices, please contact us at{' '}
                <span className="text-droptidy-purple font-medium">privacy@droptidy.com</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;