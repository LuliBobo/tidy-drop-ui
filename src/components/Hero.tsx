
import React from 'react';
import { Button } from "@/components/ui/button";
import { Shield, FileCheck, Play } from 'lucide-react';

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-droptidy-purple-light/20 to-transparent py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <div className="mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-droptidy-purple" />
              <span className="text-sm font-medium text-droptidy-purple">Privacy-First Technology</span>
            </div>
            
            <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Protect Your Privacy. <br />
              <span className="text-droptidy-purple">Clean Your Media</span> with One Click.
            </h1>
            
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
              DropTidy uses AI to remove hidden metadata, anonymize faces, and clean sensitive info from your photos and videos — 
              <span className="font-semibold text-droptidy-purple-dark"> locally and securely.</span>
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button className="bg-droptidy-purple hover:bg-droptidy-purple-dark text-white" size="lg">
                Try Free
              </Button>
              
              <Button 
                variant="outline" 
                className="border-droptidy-purple text-droptidy-purple hover:bg-droptidy-purple/10" 
                size="lg"
                onClick={() => scrollToSection('features')}
              >
                <Play className="mr-2 h-4 w-4" /> How It Works
              </Button>
            </div>
          </div>
          
          <div className="relative w-full max-w-md lg:max-w-lg">
            <div className="relative rounded-2xl bg-white p-2 shadow-xl dark:bg-gray-800 animate-float">
              <div className="rounded-xl bg-gray-100 p-6 dark:bg-gray-700">
                <div className="mb-4 flex items-center gap-2">
                  <FileCheck className="h-6 w-6 text-droptidy-purple" />
                  <span className="font-medium">DropTidy Privacy Cleanup</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-droptidy-purple/20 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16L15 10" stroke="#9b87f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 10H15V16" stroke="#9b87f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Metadata Removed</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">GPS, EXIF, Camera Info</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-droptidy-purple/20 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16L15 10" stroke="#9b87f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 10H15V16" stroke="#9b87f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Faces Anonymized</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">AI Privacy Protection</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-droptidy-purple/20 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16L15 10" stroke="#9b87f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 10H15V16" stroke="#9b87f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Watermark Removed</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Clean & Professional</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-600">
                  <div className="h-2 rounded-full bg-droptidy-purple" style={{ width: "100%" }}></div>
                </div>
              </div>
            </div>
            
            <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full bg-droptidy-blue/10 blur-3xl"></div>
            <div className="absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-droptidy-purple/20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
