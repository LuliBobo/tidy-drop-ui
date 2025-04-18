
import React from 'react';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import VideoAnonymization from '@/components/VideoAnonymization';
import Security from '@/components/Security';
import Testimonials from '@/components/Testimonials';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <Features />
        <Pricing />
        <VideoAnonymization />
        <Security />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
