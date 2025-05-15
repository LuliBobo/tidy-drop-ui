/**
 * Web-compatible cleaner implementation
 */

// Web-compatible imports
import path from 'path-browserify';
import { electronLog } from './logger.web';
import { isWeb } from '@/lib/environment.web';

// Interface definitions
interface MetadataInfo {
  [key: string]: string | number;
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
    MockWeb: "true"
  };
};

// Mock function for web environment
export const cleanImage = async (
  inputPath: string,
  outputDir: string,
  options = { quality: 85 }
): Promise<CleanResult> => {
  console.log('Image cleaning not available in web version');
  
  // For web demo, log the attempt
  const outputPath = path.join(outputDir, path.basename(inputPath));
  
  appendToCleaningLog({
    inputPath,
    outputPath,
    status: "success",
    timestamp: new Date().toISOString(),
    fileType: "image"
  });
  
  return { success: true, originalSize: 100, cleanedSize: 50 };
};

// Mock function for web environment
export const cleanVideo = async (
  inputPath: string,
  outputDir: string
): Promise<CleanResult> => {
  console.log('Video cleaning not available in web version');
  
  // For web demo, log the attempt
  const outputPath = path.join(outputDir, path.basename(inputPath));
  
  appendToCleaningLog({
    inputPath,
    outputPath,
    status: "success",
    timestamp: new Date().toISOString(),
    fileType: "video"
  });
  
  return { success: true, originalSize: 1000, cleanedSize: 500 };
};

// Mock function for web environment
export const getDefaultOutputDirectory = (): string => {
  return '/web-mock/cleaned';
};

// Mock function for web environment
export const ensureOutputDirectoryExists = (_dirPath: string): boolean => {
  console.log('Directory creation simulated in web version');
  return true;
};
