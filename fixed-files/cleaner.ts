/**
 * Web-compatible cleaner implementation
 */

// Web-compatible imports
import path from 'path-browserify';
import { electronLog } from './logger';
import { isWeb } from '@/lib/environment.web';

// Interface definitions
interface MetadataInfo {
  [key: string]: string | number | boolean;
}

interface CleanResult {
  success: boolean;
  originalSize?: number;
  cleanedSize?: number;
  metadata?: MetadataInfo;
}

interface CleaningLogEntry {
  inputPath: string;
  outputPath: string;
  status: "success";
  timestamp: string;
  fileType: "image" | "video";
  originalSize?: number;
  cleanedSize?: number;
}

// Web-compatible log function
export const appendToCleaningLog = (entry: CleaningLogEntry): void => {
  try {
    const logData = JSON.stringify(entry);
    localStorage.setItem(`cleaning-log-${Date.now()}`, logData);
    console.log('Cleaning log entry saved:', entry);
  } catch (error) {
    console.error('Failed to append to cleaning log:', error);
  }
};

// Mock function for web environment
export const readMetadata = async (filePath: string): Promise<MetadataInfo> => {
  console.log('Reading metadata from:', filePath);

  // In web, return mock metadata
  return {
    FileName: path.basename(filePath),
    FileSize: '0',
    FileType: 'Mock File',
    Format: 'Unknown',
    Width: 0,
    Height: 0
  };
};

// Mock function for web environment
export const cleanImage = async (filePath: string): Promise<CleanResult> => {
  console.log('Web mock: cleaning image', filePath);
  
  // In web, return mock result
  return {
    success: true,
    originalSize: 5000000,
    cleanedSize: 2000000,
    metadata: {
      width: 1920,
      height: 1080,
      format: 'jpeg',
      cleaned: "true"
    }
  };
};

// Mock function for web environment
export const cleanVideo = async (filePath: string): Promise<CleanResult> => {
  console.log('Web mock: cleaning video', filePath);
  
  // In web, return mock result
  return {
    success: true,
    originalSize: 10000000,
    cleanedSize: 3000000,
    metadata: {
      duration: '00:01:30',
      format: 'mp4',
      cleaned: "true"
    }
  };
};

// Mock function for web environment
export const createZip = async (files: string[]): Promise<string> => {
  console.log('Web mock: creating zip with files', files);
  
  // In web, return mock zip path
  return 'mock-cleaned-files.zip';
};

// Helper function to check if running in web environment
export const isWebEnvironment = (): boolean => {
  return true;
};

// Function to display a message on web
export const showWebNotice = (message: string): void => {
  console.log(`Web Notice: ${message}`);
};
