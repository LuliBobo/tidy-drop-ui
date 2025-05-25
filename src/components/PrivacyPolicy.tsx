
import { Mail, Lock, FileText } from 'lucide-react';
import Navbar from './Navbar';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Introduction */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-droptidy-purple">
              <FileText className="h-6 w-6" />
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-gray-600">
              At DropTidy, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, and protect your personal information when you use our AI-powered content processing services.
              Last updated: April 2025.
            </p>
          </section>

          {/* Data We Collect */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Data We Collect</h2>
            <div className="space-y-3 text-gray-600">
              <p>When you use DropTidy, we may collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (email, name, organization)</li>
                <li>Uploaded content (images and videos)</li>
                <li>Usage data and analytics</li>
                <li>Payment information (processed securely by our payment providers)</li>
                <li>Technical information (IP address, browser type, device information)</li>
              </ul>
            </div>
          </section>

          {/* How We Use Your Data */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">How We Use Your Data</h2>
            <div className="space-y-3 text-gray-600">
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and improve our AI content processing services</li>
                <li>Maintain and enhance our platform security</li>
                <li>Communicate important updates and information</li>
                <li>Process payments and maintain billing records</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-gray-900">Cookies and Tracking</h2>
            </div>
            <p className="text-gray-600">
              We use cookies and similar technologies to enhance your experience on our platform.
              These help us understand how you interact with our services, remember your preferences,
              and provide personalized features. You can control cookie settings through your browser preferences.
            </p>
          </section>

          {/* Consent */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-droptidy-purple" />
              <h2 className="text-2xl font-semibold text-gray-900">Your Consent</h2>
            </div>
            <div className="space-y-3 text-gray-600">
              <p>
                By using DropTidy, you consent to our privacy practices as described in this policy.
                You can withdraw your consent at any time by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Deleting your account</li>
                <li>Contacting our privacy team</li>
                <li>Adjusting your privacy settings</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-droptidy-purple" />
              <h2 className="text-2xl font-semibold text-gray-900">Contact Us</h2>
            </div>
            <p className="text-gray-600">
              If you have any questions about our privacy practices or would like to exercise
              your privacy rights, please contact our privacy team at:
            </p>
            <div className="mt-2">
              <p className="text-droptidy-purple font-medium">privacy@droptidy.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
