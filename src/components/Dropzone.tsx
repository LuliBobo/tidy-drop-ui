import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { FileVideo, AlertCircle, X } from 'lucide-react';
import { FileStatusIndicator } from './ui/file-status-indicator';
import { getRemainingQuota, checkDailyQuotaExceeded, getCurrentLicense } from '@/lib/utils';
import { LICENSE_FEATURES } from '@/lib/types';

// Define possible states for file processing
export type CleanStatus = 'idle' | 'cleaning' | 'success' | 'error';

// Type definitions for file metadata and status
interface FileItem {
  file: File;
  path: string;
  status: CleanStatus;
  outputPath?: string;
  error?: string;
}

// Component props interface with detailed options
interface DropzoneProps {
  onFilesAdded?: (files: FileItem[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedFileTypes?: string[];
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesAdded,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB default
  acceptedFileTypes = ['image/*', 'video/*']
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [remainingFiles, setRemainingFiles] = useState(getRemainingQuota());
  const currentLicense = getCurrentLicense();

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.file.type.startsWith('image/')) {
          URL.revokeObjectURL(file.path);
        }
      });
    };
  }, [files]);

  // Handle file drop with validation
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(f => f.errors.map(e => e.message)).flat();
      setError(`Invalid files: ${errors.join(', ')}`);
      return;
    }

    // Check if user exceeded daily quota
    if (checkDailyQuotaExceeded()) {
      setError(`Daily limit of ${LICENSE_FEATURES[currentLicense].maxFilesPerDay} files reached. Upgrade to Pro for unlimited files.`);
      return;
    }

    // Filter out video files for free users
    const filteredFiles = acceptedFiles.filter(file => {
      if (file.type.startsWith('video/') && !LICENSE_FEATURES[currentLicense].allowVideoProcessing) {
        setError('Video processing is only available in Pro plan');
        return false;
      }
      return true;
    });

    if (filteredFiles.length === 0) return;

    const remainingQuota = getRemainingQuota();
    const allowedCount = Math.min(remainingQuota, filteredFiles.length);
    
    if (allowedCount < filteredFiles.length) {
      setError(`Only ${allowedCount} files can be processed with your remaining quota`);
    }

    const newFiles = filteredFiles.slice(0, allowedCount).map(file => ({
      file,
      path: URL.createObjectURL(file),
      status: 'idle' as CleanStatus
    }));
    
    setFiles(prev => {
      const updatedFiles = [...prev, ...newFiles];
      onFilesAdded?.(updatedFiles);
      return updatedFiles;
    });

    setRemainingFiles(getRemainingQuota() - allowedCount);
  }, [onFilesAdded, currentLicense]);

  // Remove file handler with keyboard support
  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const updatedFiles = prev.filter((_, i) => i !== index);
      onFilesAdded?.(updatedFiles);
      return updatedFiles;
    });
  }, [onFilesAdded]);

  // Configure dropzone with validation options
  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedFileTypes.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    noKeyboard: false,
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4" role="region" aria-label="File upload area">
      {/* Accessible dropzone area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isFocused ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
        `}
      >
        <input {...getInputProps()} aria-label="File input" />
        <p className="text-gray-600">
          {isDragActive ? "Drop files here..." : "Drag 'n' drop files here, or click to select"}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {currentLicense === 'free' ? 
            `${remainingFiles} files remaining today (max ${LICENSE_FEATURES.free.maxFilesPerDay} per day)` : 
            'Unlimited files available'}
        </p>
      </div>

      {/* Error message display */}
      {error && (
        <div 
          className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2"
          role="alert"
        >
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4" role="list" aria-label="Uploaded files">
          {files.map((file, index) => (
            <div
              key={`${file.path}-${index}`}
              className="relative group rounded-lg border bg-white p-2 shadow-sm"
              role="listitem"
            >
              {/* Remove file button */}
              <button
                onClick={() => removeFile(index)}
                onKeyPress={(e) => e.key === 'Enter' && removeFile(index)}
                className="absolute -right-2 -top-2 z-10 p-1 bg-white rounded-full shadow-md 
                  opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                aria-label={`Remove ${file.file.name}`}
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>

              {/* File preview with fallback */}
              {file.file.type.startsWith('image/') ? (
                <div className="aspect-square w-full rounded-md overflow-hidden">
                  <img
                    src={file.path}
                    alt={`Preview of ${file.file.name}`}
                    className="h-full w-full object-cover"
                    onLoad={(e) => {
                      URL.revokeObjectURL((e.target as HTMLImageElement).src);
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-square w-full rounded-md bg-gray-100 flex items-center justify-center">
                  <FileVideo className="h-8 w-8 text-gray-400" aria-hidden="true" />
                </div>
              )}

              {/* File information */}
              <div className="mt-2 space-y-1">
                <p className="text-sm font-medium text-gray-700 truncate" title={file.file.name}>
                  {file.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <FileStatusIndicator status={file.status} error={file.error} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropzone;
