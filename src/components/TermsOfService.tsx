import { Mail, Lock, FileText } from 'lucide-react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';

interface TermsOfServiceProps {
  embedded?: boolean;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ embedded = false }) => {

  return (
    <div className="min-h-screen bg-background">
      {!embedded && <Navbar />}
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Introduction */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-droptidy-purple">
              <FileText className="h-6 w-6" />
              <h1 className="text-3xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-gray-600">
              These Terms of Service ("Terms") govern your use of the DropTidy service ("DropTidy", "we", "us", or "our"). 
              By accessing or using our services, you agree to be bound by these Terms. If you do not agree, do not use DropTidy.
              Last updated: April 2025.
            </p>
          </section>

          {/* Service Overview */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">1. Service Overview</h2>
            <div className="space-y-3 text-gray-600">
              <p>DropTidy provides tools that allow users to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Upload photos and videos</li>
                <li>Automatically remove metadata (EXIF, GPS, timestamps, device info)</li>
                <li>Optionally blur faces or sensitive elements using AI</li>
                <li>Download cleaned files locally</li>
                <li>Use batch editing features (premium users only)</li>
              </ul>
            </div>
          </section>

          {/* User Accounts */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">2. User Accounts</h2>
            <p className="text-gray-600">
              Certain features may require a user account. You are responsible for safeguarding your account credentials 
              and for all activities under your account.
            </p>
          </section>

          {/* User Responsibility */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">3. User Responsibility</h2>
            <div className="space-y-3 text-gray-600">
              <p>You are solely responsible for the content you upload. You agree not to upload any content that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violates any laws or regulations</li>
                <li>Is offensive, harmful, or illegal</li>
                <li>Includes personal data of others without their consent</li>
              </ul>
            </div>
          </section>

          {/* Privacy and Data Handling */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-gray-900">4. Privacy and Data Handling</h2>
            </div>
            <p className="text-gray-600">
              All files are processed locally (when using our local version), and we do not store your media 
              unless explicitly stated. Please refer to our <Link to="/privacy" className="text-droptidy-purple hover:underline">Privacy Policy</Link> for more information.
            </p>
          </section>

          {/* Acceptable Use */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">5. Acceptable Use</h2>
            <div className="space-y-3 text-gray-600">
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Reverse-engineer, copy, or distribute any part of DropTidy</li>
                <li>Use the service for unlawful or abusive purposes</li>
                <li>Interfere with or disrupt our systems or servers</li>
              </ul>
            </div>
          </section>

          {/* Changes to the Service */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-droptidy-purple" />
              <h2 className="text-2xl font-semibold text-gray-900">6. Changes to the Service</h2>
            </div>
            <p className="text-gray-600">
              We reserve the right to modify, suspend, or discontinue DropTidy at any time, 
              with or without notice.
            </p>
          </section>

          {/* Disclaimer and Liability */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">7. Disclaimer and Liability</h2>
            <p className="text-gray-600">
              DropTidy is provided "as is" without warranties of any kind. We do not guarantee uninterrupted 
              or error-free service and are not liable for any data loss, damages, or misuse resulting from 
              use of the service.
            </p>
          </section>

          {/* Payments and Subscriptions */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">8. Payments and Subscriptions</h2>
            <p className="text-gray-600">
              Some features require a paid subscription. All payments are final unless otherwise stated. 
              Pricing is subject to change with prior notice.
            </p>
          </section>

          {/* Governing Law */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">9. Governing Law</h2>
            <p className="text-gray-600">
              These Terms are governed by the laws of the Slovak Republic. Any disputes shall be resolved 
              in the jurisdiction of Bratislava District Court.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-droptidy-purple" />
              <h2 className="text-2xl font-semibold text-gray-900">10. Contact</h2>
            </div>
            <p className="text-gray-600">
              For questions or support regarding these Terms:
            </p>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <p className="text-droptidy-purple font-medium">info@droptidy.com</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-droptidy-purple font-medium">www.droptidy.com</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;