import React, { useState, useEffect, useCallback } from 'react';
import path from 'path';
import { Download, AlertTriangle, Folder, Settings as SettingsIcon } from 'lucide-react';
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  incrementDailyQuota, 
  getRemainingQuota,
  getCurrentLicense 
} from "@/lib/utils";
import { FileStatusIndicator } from './ui/file-status-indicator';
import { LICENSE_FEATURES } from '@/lib/types';
import SettingsModal from './SettingsModal';
import UpgradeModal from './UpgradeModal';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';

// Using global type definitions from /src/types/electron.d.ts

// CleanResult type is defined in the global window.electron interface

interface FileItem {
  file: File;
  path: string;
  status: 'idle' | 'cleaning' | 'success' | 'error';
  outputPath?: string;
  originalSize?: number;
  cleanedSize?: number;
  metadata?: { [key: string]: string | number };
  error?: string;
}

export const FileCleaner: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [remainingQuota, setRemainingQuota] = useState(getRemainingQuota());
  const [isBatchCleaning, setIsBatchCleaning] = useState(false);
  const [currentLicense, setCurrentLicense] = useState(getCurrentLicense());
  const [error, setError] = useState<string | null>(null);
  const [outputDir, setOutputDir] = useState('');
  const [autoOpenFolder, setAutoOpenFolder] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Load files from sessionStorage (when redirected from Hero component)
  useEffect(() => {
    try {
      const filesDataJson = sessionStorage.getItem('filesToClean');
      if (filesDataJson) {
        const filesData = JSON.parse(filesDataJson);
        
        // Define proper type for file data from sessionStorage
        interface StoredFileData {
          name: string;
          type: string;
          size: number;
          data: number[];
        }
        
        // Convert the file data back to File objects
        const reconstructedFiles = filesData.map((fileData: StoredFileData) => {
          const blob = new Blob([new Uint8Array(fileData.data)], { type: fileData.type });
          const file = new File([blob], fileData.name, { type: fileData.type });
          
          // Create a file URL for processing
          const path = URL.createObjectURL(blob);
          
          return {
            file,
            path,
            status: 'idle' as 'idle' | 'cleaning' | 'success' | 'error'
          };
        });
        
        setFiles(reconstructedFiles);
        
        // Clear sessionStorage after retrieving files
        sessionStorage.removeItem('filesToClean');
        
        toast({
          title: "Files loaded",
          description: `${reconstructedFiles.length} files are ready to be processed.`,
        });
      }
    } catch (error) {
      console.error('Error loading files from sessionStorage:', error);
      setError('Failed to load uploaded files. Please try again.');
    }
  }, []);
  
  // Load settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (!window.electron) {
          console.error("Electron not available");
          return;
        }
        
        const settings = await window.electron.ipcRenderer.invoke('load-settings');
        setOutputDir(settings.outputDir);
        setAutoOpenFolder(settings.autoOpenFolder);
      } catch (error) {
        console.error('Error loading settings:', error);
        // Set default output directory if loading fails
        if (window.electron) {
          const homePath = await window.electron.app.getPath('home');
          setOutputDir(path.join(homePath, 'Cleaned'));
        }
      }
    };
    
    loadSettings();
    setRemainingQuota(getRemainingQuota());
    setCurrentLicense(getCurrentLicense());
  }, []);

  // Update remaining quota after each file is processed
  useEffect(() => {
    const successfulFiles = files.filter(f => f.status === 'success').length;
    if (successfulFiles > 0) {
      setRemainingQuota(getRemainingQuota());
    }
  }, [files]);

  const updateFileStatus = (
    filename: string,
    status: 'idle' | 'cleaning' | 'success' | 'error',
    outputPath?: string,
    originalSize?: number,
    cleanedSize?: number,
    metadata?: { [key: string]: string | number },
    error?: string
  ) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.file.name === filename 
          ? { 
              ...file, 
              status, 
              outputPath, 
              originalSize, 
              cleanedSize, 
              metadata, 
              error 
            } 
          : file
      )
    );
  };

  const handleClean = useCallback(async (fileItem: FileItem) => {
    if (fileItem.file.type.startsWith('video/') && !LICENSE_FEATURES[currentLicense].allowVideoProcessing) {
      updateFileStatus(
        fileItem.file.name,
        'error',
        undefined,
        undefined,
        undefined,
        undefined,
        'Video processing requires Pro license'
      );
      return;
    }

    updateFileStatus(fileItem.file.name, 'cleaning');
    const isImage = fileItem.file.type.startsWith('image/');
    const isVideo = fileItem.file.type.startsWith('video/');

    try {
      if (isImage) {
        const cleanedFileName = `cleaned_${Date.now()}_${fileItem.file.name}`;
        const result = await window.electron?.ipcRenderer.invoke('clean-image', fileItem.path);
        if (result && result?.success) {
          incrementDailyQuota();
          setRemainingQuota(getRemainingQuota());
          
          // Handle HEIC file conversions
          if (result && result?.convertedPath) {
            // For converted HEIC files, use the converted path directly
            updateFileStatus(
              fileItem.file.name,
              'success',
              result?.convertedPath,
              result?.originalSize,
              result?.cleanedSize,
              result?.metadata,
              'Converted to JPEG format'
            );
          } else {
            updateFileStatus(
              fileItem.file.name,
              'success',
              path.join(outputDir, cleanedFileName),
              result?.originalSize,
              result?.cleanedSize,
              result?.metadata
            );
          }
          
          // Auto-open folder after cleaning if enabled
          if (autoOpenFolder && result && result?.success) {
            window.electron?.app.openFolder(outputDir);
          }
        } else {
          updateFileStatus(fileItem.file.name, 'error', undefined, undefined, undefined, undefined, 'Failed to clean image');
        }
      } else if (isVideo) {
        const cleanedFileName = `cleaned_${Date.now()}_${fileItem.file.name}`;
        const result = await window.electron?.ipcRenderer.invoke(
        'clean-video',
          fileItem.path,
          path.join(outputDir, cleanedFileName)
        );
        if (result && result?.success) {
          incrementDailyQuota();
          setRemainingQuota(getRemainingQuota());
          updateFileStatus(
            fileItem.file.name,
            'success',
            path.join(outputDir, cleanedFileName),
            result?.originalSize,
            result?.cleanedSize
          );
          
          // Auto-open folder after cleaning if enabled
          if (autoOpenFolder && result && result?.success) {
            window.electron?.app.openFolder(outputDir);
          }
        } else {
          updateFileStatus(fileItem.file.name, 'error', undefined, undefined, undefined, undefined, 'Failed to clean video');
        }
      }
    } catch (error) {
      updateFileStatus(
        fileItem.file.name,
        'error',
        undefined,
        undefined,
        undefined,
        undefined,
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      console.error('Error cleaning file:', error);
    }
  }, [outputDir, updateFileStatus, currentLicense, autoOpenFolder]);

  const handleBatchClean = useCallback(async () => {
    if (!LICENSE_FEATURES[currentLicense].allowBatchProcessing) {
      setError('Batch processing requires Pro license');
      return;
    }

    setIsBatchCleaning(true);
    const idleFiles = files.filter(f => f.status === 'idle');
    
    try {
      await Promise.all(idleFiles.map(file => handleClean(file)));
    } finally {
      setIsBatchCleaning(false);
    }
  }, [files, handleClean, currentLicense]);

  const handleExportZip = async () => {
    try {
      setIsExporting(true);
      
      if (!window.electron) {
        throw new Error("Electron not available");
      }
      
      const successfulFiles = files
        .filter(f => f.status === 'success' && f.outputPath)
        .map(f => f.outputPath as string);
      
      if (successfulFiles.length === 0) return;
      
      const zipResult = await window.electron.ipcRenderer.invoke('create-zip', successfulFiles);
      
      if (zipResult.success && zipResult.zipPath) {
        window.electron.app.showItemInFolder(zipResult.zipPath);
      }
    } catch (error) {
      console.error('Error creating zip:', error);
      toast({
        title: "Export Failed",
        description: "Could not create zip file",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenOutputFolder = useCallback(() => {
    window.electron?.app.openFolder(outputDir);
  }, [outputDir]);

  // Function to format metadata for display
  const formatMetadataValue = (value: unknown): string => {
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value);
  };

  // Filter important metadata fields
  const getImportantMetadata = (metadata: { [key: string]: string | number }) => {
    const importantFields = [
      'GPSLatitude',
      'GPSLongitude',
      'CreateDate',
      'ModifyDate',
      'Make',
      'Model',
      'Software',
      'Artist',
      'Copyright',
      'ImageSize',
      'Megapixels'
    ];
    
    return Object.entries(metadata)
      .filter(([key]) => importantFields.some(field => key.includes(field)))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  };

  return (
    <div className="space-y-4 p-4">
      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-800 hover:text-red-900"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* License status alerts */}
      {remainingQuota === 0 && currentLicense === 'free' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You've reached your daily limit of {LICENSE_FEATURES.free.maxFilesPerDay} files. 
            <button 
              onClick={() => setIsUpgradeModalOpen(true)} 
              className="ml-2 text-red-700 underline hover:text-red-800"
            >
              Upgrade to Pro
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* License feature limitations alert */}
      {currentLicense === 'free' && files.some(f => f.file.type.startsWith('video/')) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Video processing is only available in Pro plan. 
            <button 
              onClick={() => setIsUpgradeModalOpen(true)} 
              className="ml-2 text-blue-600 underline hover:text-blue-700"
            >
              Learn more
            </button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleBatchClean}
            disabled={
              remainingQuota === 0 || 
              isBatchCleaning || 
              !LICENSE_FEATURES[currentLicense].allowBatchProcessing
            }
          >
            {isBatchCleaning ? 'Cleaning...' : 'Clean Metadata'}
          </button>
          
          {files.some(f => f.status === 'success') && (
            <>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                onClick={handleExportZip}
                disabled={isExporting || !LICENSE_FEATURES[currentLicense].allowCustomExport}
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export ZIP'}
              </button>
              
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
                onClick={handleOpenOutputFolder}
              >
                <Folder className="h-4 w-4" />
                Open Folder
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Settings"
          >
            <SettingsIcon className="h-4 w-4" />
          </Button>

          {/* License quota indicator */}
          <div className="text-sm">
            <span className="text-gray-600">
              {currentLicense === 'free' && remainingQuota > 0 
                ? `${remainingQuota} files remaining today` 
                : currentLicense === 'pro' 
                  ? 'Unlimited files available' 
                  : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.file.name}
              className={`flex justify-between items-center p-3 border rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedFile?.file.name === file.file.name ? 'border-blue-500' : ''
              }`}
              onClick={() => setSelectedFile(file)}
            >
              <div className="flex flex-col flex-grow gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{file.file.name}</span>
                  <FileStatusIndicator 
                    status={file.status} 
                    error={file.error}
                    className="text-sm px-3 py-1" 
                  />
                </div>
                
                {file.status === 'success' && file.originalSize && file.cleanedSize && (
                  <div className="flex flex-col gap-1">
                    <Progress 
                      value={((1 - file.cleanedSize / file.originalSize) * 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Original: {(file.originalSize / 1024).toFixed(1)} KB</span>
                      <span>Cleaned: {(file.cleanedSize / 1024).toFixed(1)} KB</span>
                      <span className="text-green-600 font-medium">
                        {((1 - file.cleanedSize / file.originalSize) * 100).toFixed(1)}% reduced
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        {selectedFile && selectedFile.metadata && (
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-4">Metadata to be removed:</h3>
            <div className="space-y-2">
              {Object.entries(getImportantMetadata(selectedFile.metadata)).map(([key, value]) => (
                <div key={key} className="flex justify-between items-start border-b pb-2">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="text-gray-600 text-right ml-4">{formatMetadataValue(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        outputDir={outputDir}
        setOutputDir={setOutputDir}
        autoOpenFolder={autoOpenFolder}
        setAutoOpenFolder={setAutoOpenFolder}
      />

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onOpenChange={setIsUpgradeModalOpen} 
      />
    </div>
  );
};