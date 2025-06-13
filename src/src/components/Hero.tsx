import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FileVideo, FileImage, Lock, Loader2, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Using global electron interface from /src/types/electron.d.ts

const Hero = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
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
        span.className = 'opacity-0 translate-y-4 transition-all duration-500 ease-out';
        span.style.animationDelay = `${i * 0.05}s`;
        span.style.display = 'inline-block';
        // Trigger animation after a small delay
        setTimeout(() => {
          span.classList.remove('opacity-0', 'translate-y-4');
        }, i * 50);
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
        span.className = 'opacity-0 translate-y-4 transition-all duration-500 ease-out';
        span.style.animationDelay = `${1 + (i * 0.05)}s`; // Start 1 second after first headline
        span.style.display = 'inline-block';
        // Trigger animation after a small delay
        setTimeout(() => {
          span.classList.remove('opacity-0', 'translate-y-4');
        }, 1000 + (i * 50));
        secondHeadlineRef.current?.appendChild(span);
      });
    }

    // No longer need to manually trigger animations since we're using setTimeout
  }, []);

  const handleCleanFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload some files first.",
        variant: "destructive",
      });
      return;
    }

    // Check for large files when using web mode (sessionStorage has limitations)
    const MAX_FILE_SIZE_WEB = 50 * 1024 * 1024; // 50MB limit for web mode
    const hasLargeFiles = files.some(file => file.size > MAX_FILE_SIZE_WEB);
    
    if (!window.electronAPI && hasLargeFiles) {
      toast({
        title: "Large files detected",
        description: "Some files exceed the 50MB limit for web processing. Please use the desktop app for large files.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const cleaned: string[] = [];

    try {
      // Check if we're in an Electron environment
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Use Electron backend for actual cleaning
        for (const file of files) {
          try {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            
            if (isImage) {
              // Create a temporary file path for processing
              const tempPath = URL.createObjectURL(file);
              const result = await window.electronAPI.invoke.cleanImage(tempPath);
              if (result.success) {
                cleaned.push(file.name);
                
                // Check if the image was converted (typically for HEIC files)
                if (result.convertedPath) {
                  console.log(`File ${file.name} was converted to ${result.convertedPath}`);
                  // Notify the user about the conversion
                  toast({
                    title: "HEIC file converted",
                    description: `${file.name} was converted to JPEG format for better compatibility.`,
                  });
                }
              }
            } else if (isVideo) {
              const tempPath = URL.createObjectURL(file);
              const outputPath = `cleaned_${file.name}`;
              
              const result = await window.electronAPI.invoke.cleanVideo(tempPath, outputPath);
              if (result.success) {
                cleaned.push(file.name);
              }
            }
          } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
          }
        }
      } else {
        // Web browser environment - redirect to FileCleaner page
        toast({
          title: "Preparing cleaner...",
          description: "Your files are being prepared. You'll be redirected to the cleaning interface.",
        });
        
        try {
          // Store files in sessionStorage for the cleaner page
          const fileData = await Promise.all(files.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            return {
              name: file.name,
              type: file.type,
              size: file.size,
              data: Array.from(new Uint8Array(arrayBuffer))
            };
          }));
          
          sessionStorage.setItem('filesToClean', JSON.stringify(fileData));
          
          // Use different routing strategies for Electron and web
          if (window.isElectronApp || window.electronAPI) {
            console.log('Detected Electron environment, using hash routing');
            // For Electron, use hash-based routing with #/
            window.location.href = '#/cleaner';
          } else {
            console.log('Detected web environment, using browser routing');
            // For web, use regular routing
            window.location.href = '/cleaner';
          }
          
          return;
        } catch (error) {
          console.error('Error preparing files:', error);
          toast({
            title: "Error preparing files",
            description: "Failed to prepare files for cleaning. Please try again.",
            variant: "destructive",
          });
        }
      }

      if (cleaned.length > 0) {
        toast({
          title: "Files cleaned successfully!",
          description: `Removed metadata from ${cleaned.length} file(s). Your files are now ready for download.`,
        });
      } else {
        toast({
          title: "No files were processed",
          description: "Please check your files and try again.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Error cleaning files:', error);
      toast({
        title: "Error cleaning files",
        description: "An error occurred while processing your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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

  const handleDeleteFile = (indexToDelete: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToDelete));
    toast({
      title: "File removed",
      description: "The file has been removed from the upload list.",
    });
  };

  const handleClearAllFiles = () => {
    setFiles([]);
    toast({
      title: "All files removed",
      description: "All files have been cleared from the upload list.",
    });
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
          <div className="relative w-full max-w-2xl mx-auto" id="file-upload">
            <div className="relative rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800 animate-pulse">
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
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-center flex-grow">Uploaded Files:</p>
                    <button 
                      onClick={handleClearAllFiles}
                      className="text-xs text-red-500 hover:text-red-700 hover:underline px-2 py-1"
                    >
                      Clear All
                    </button>
                  </div>
                  <ul className="space-y-2 max-w-md mx-auto">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between space-x-2 bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
                        <div className="flex items-center space-x-2 overflow-hidden">
                          {file.type.startsWith('image/') ? <FileImage className="h-5 w-5 text-droptidy-purple" /> : <FileVideo className="h-5 w-5 text-droptidy-purple" />}
                          <span className="text-xs text-black dark:text-white truncate">{file.name}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteFile(index)}
                          className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          title="Remove file"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>}
                
                {/* Privacy guarantee message */}
                <div className="mt-6 flex items-center justify-center text-sm">
                  <div className="inline-flex items-center p-2 px-3 bg-green-50 text-green-800 rounded-full dark:bg-green-900/30 dark:text-green-300">
                    <Lock className="h-4 w-4 mr-2" />
                    🔒 100% Local Processing — Your files never leave your device.
                  </div>
                </div>

                {/* Clean button */}
                <div className="mt-8 flex justify-center">
                  <Button 
                    className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white px-12 py-6 text-xl font-bold shadow-lg rounded-lg transform transition-all hover:scale-105" 
                    size="lg"
                    onClick={handleCleanFiles}
                    disabled={isProcessing || files.length === 0}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Cleaning...
                      </>
                    ) : (
                      'Clean'
                    )}
                  </Button>
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
