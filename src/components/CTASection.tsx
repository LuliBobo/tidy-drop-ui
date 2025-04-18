
import React from 'react';
import { Button } from "@/components/ui/button";

const CTASection = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-droptidy-purple py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Clean Before You Share
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Join thousands who trust DropTidy to protect their visual content.
            Take control of your privacy today.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-droptidy-purple hover:bg-gray-100"
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => scrollToSection('video')}
            >
              Explore Studio Features
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
