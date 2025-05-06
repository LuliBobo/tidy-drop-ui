import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import VideoAnonymization from '@/components/VideoAnonymization';
import Security from '@/components/Security';
import Testimonials from '@/components/Testimonials';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

// Function to extract section from URL parameters
const getSectionFromUrl = (): string | null => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('section');
  }
  return null;
};

const Index = () => {
  const location = useLocation();

  // Handle scroll to section when navigating from another page
  useEffect(() => {
    const sectionId = getSectionFromUrl();
    
    if (sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Small timeout to ensure page has rendered
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <section id="hero">
          <Hero />
        </section>
        <section id="features">
          <Features />
        </section>
        <section id="pricing">
          <Pricing />
        </section>
        <section id="video">
          <VideoAnonymization />
        </section>
        <section id="security">
          <Security />
        </section>
        <section id="testimonials">
          <Testimonials />
        </section>
        <section id="cta">
          <CTASection />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
