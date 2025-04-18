import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Shield, FileCheck, Play, Upload, FileVideo, FileImage } from 'lucide-react';

const Hero = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    setFiles(prev => [...prev, ...fileArray]);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      handleFiles(e.target.files);
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
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`rounded-xl bg-gray-100 p-6 dark:bg-gray-700 transition-all duration-300 ${
                  dragActive ? 'border-2 border-droptidy-purple border-dashed' : ''
                }`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Upload className="h-6 w-6 text-droptidy-purple" />
                  <span className="font-medium">Upload or Drag Files</span>
                </div>
                
                <div 
                  onClick={() => inputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-center mb-4 space-x-4">
                    <FileImage className="h-12 w-12 text-droptidy-purple opacity-50" />
                    <FileVideo className="h-12 w-12 text-droptidy-purple opacity-50" />
                  </div>
                  <p className="text-gray-500">Drag & Drop Photos/Videos or <span className="text-droptidy-purple">Browse</span></p>
                </div>

                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*"
                  ref={inputRef}
                  onChange={handleChange}
                  className="hidden" 
                />

                {files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Uploaded Files:</p>
                    <ul className="space-y-2">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center space-x-2 bg-white p-2 rounded-md shadow-sm">
                          {file.type.startsWith('image/') ? <FileImage className="h-5 w-5 text-droptidy-purple" /> : <FileVideo className="h-5 w-5 text-droptidy-purple" />}
                          <span className="text-xs truncate">{file.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
