import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Upload, FileVideo, FileImage, Lock } from 'lucide-react';
import 'animate.css';

const Hero = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const firstHeadlineRef = useRef<HTMLSpanElement>(null);
  const secondHeadlineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Split and animate first headline
    if (firstHeadlineRef.current) {
      const text = firstHeadlineRef.current.textContent || '';
      firstHeadlineRef.current.innerHTML = '';
      Array.from(text).forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char; // Use non-breaking space for spaces
        span.className = 'animate__animated animate__fadeInUp opacity-0';
        span.style.animationDelay = `${i * 0.05}s`;
        span.style.display = 'inline-block';
        firstHeadlineRef.current?.appendChild(span);
      });
    }

    // Split and animate second headline with additional delay
    if (secondHeadlineRef.current) {
      const text = secondHeadlineRef.current.textContent || '';
      secondHeadlineRef.current.innerHTML = '';
      Array.from(text).forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.className = 'animate__animated animate__fadeInUp opacity-0';
        span.style.animationDelay = `${1 + (i * 0.05)}s`; // Start 1 second after first headline
        span.style.display = 'inline-block';
        secondHeadlineRef.current?.appendChild(span);
      });
    }

    // Trigger animations
    const spans = document.querySelectorAll('.animate__fadeInUp');
    spans.forEach(span => {
      span.addEventListener('animationstart', () => {
        (span as HTMLElement).style.opacity = '1';
      });
    });
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
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

  return <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-droptidy-purple-light/20 to-transparent py-20 lg:py-32 flex items-center justify-center">
    <div className="container mx-auto px-4 max-w-6xl w-full">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl w-full">
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="text-sm font-medium text-droptidy-purple">Privacy-First Technology</span>
          </div>
          <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            <span ref={firstHeadlineRef} className="block text-foreground mb-2">
              Protect Your Privacy.
            </span>
            <span className="block text-[#8465ff]">
              Clean up your photos with one click.
            </span>
          </h1>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            DropTidy removes hidden metadata from your media files. Just drag, clean, and download.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link to="/signup">
              <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white" size="lg">
                Get Started Free
              </Button>
            </Link>
            <Button variant="outline" className="border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1]/10" size="lg" onClick={() => scrollToSection('features')}>
              See Features
            </Button>
          </div>
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="relative rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800 animate-float">
              <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`rounded-xl bg-gray-100 p-8 dark:bg-gray-700 transition-all duration-300 ${dragActive ? 'border-2 border-droptidy-purple border-dashed' : ''}`}>
                <div className="mb-6 flex items-center gap-2 justify-center">
                  <Upload className="h-6 w-6 text-droptidy-purple" />
                  <span className="font-medium text-lg">Upload or Drag Files</span>
                </div>
                <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex justify-center mb-6 space-x-6">
                    <FileImage className="h-16 w-16 text-droptidy-purple opacity-50" />
                    <FileVideo className="h-16 w-16 text-droptidy-purple opacity-50" />
                  </div>
                  <p className="text-gray-500 text-base">
                    Drag & Drop Photos/Videos or <span className="text-droptidy-purple font-semibold">Browse</span>
                  </p>
                </div>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*" 
                  ref={inputRef} 
                  onChange={handleChange} 
                  className="hidden"
                  title="File upload"
                  aria-label="Upload photos or videos"
                />
                {files.length > 0 && <div className="mt-6">
                  <p className="text-sm font-medium mb-2 text-center">Uploaded Files:</p>
                  <ul className="space-y-2 max-w-md mx-auto">
                    {files.map((file, index) => <li key={index} className="flex items-center space-x-2 bg-white p-2 rounded-md shadow-sm">
                      {file.type.startsWith('image/') ? <FileImage className="h-5 w-5 text-droptidy-purple" /> : <FileVideo className="h-5 w-5 text-droptidy-purple" />}
                      <span className="text-xs truncate">{file.name}</span>
                    </li>)}
                  </ul>
                </div>}
                
                {/* Privacy guarantee message */}
                <div className="mt-6 flex items-center justify-center text-sm">
                  <div className="inline-flex items-center p-2 px-3 bg-green-50 text-green-800 rounded-full dark:bg-green-900/30 dark:text-green-300">
                    <Lock className="h-4 w-4 mr-2" />
                    🔒 100% Local Processing — Your files never leave your device.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>;
};

export default Hero;
