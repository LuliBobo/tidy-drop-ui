/**
 * Web-compatible cleaner implementation
 */

// Web-compatible imports
import path from 'path-browserify';
import { appendToCleaningLog } from './logger';
import { isWeb } from '@/lib/environment';

// Web-compatible logger
const electronLog = {
  info: (message: string) => console.info('[INFO]', message),
  warn: (message: string) => console.warn('[WARN]', message),
  error: (message: string) => console.error('[ERROR]', message),
  debug: (message: string) => console.debug('[DEBUG]', message),
  transports: {
    file: {
      resolvePathFn: () => '',
      level: 'info' as const,
      format: '',
      maxSize: 0,
      sync: false
    },
    console: {
      level: 'info' as const
    }
  }
};

// Web-compatible spawn simulation
interface SpawnProcess {
  stdout: {
    on: (event: string, callback: (data: Buffer) => void) => void;
  };
  stderr: {
    on: (event: string, callback: (data: Buffer) => void) => void;
  };
  on: (event: string, callback: (code: number) => void) => void;
}

const spawn = (): SpawnProcess => {
  const process = {
    stdout: {
      on: (event: string, callback: (data: Buffer) => void) => {}
    },
    stderr: {
      on: (event: string, callback: (data: Buffer) => void) => {}
    },
    on: (event: string, callback: (code: number) => void) => {
      if (event === 'close') {
        setTimeout(() => callback(1), 100); // Simulate failure
      }
    }
  };
  return process;
};

// Web-safe fs simulation
const fs = {
  existsSync: () => false,
  mkdirSync: () => {},
  readFileSync: () => '',
  writeFileSync: () => {},
  copyFileSync: () => {},
  statSync: () => ({ size: 0, isDirectory: () => false }),
  promises: {
    stat: async () => ({ size: 0, isDirectory: () => false })
  }
};

interface MetadataInfo {
  [key: string]: string | number;
}

interface CleanResult {
  success: boolean;
  originalSize?: number;
  cleanedSize?: number;
  metadata?: MetadataInfo;
}

// Mock function for web environment
export const readMetadata = async (filePath: string): Promise<MetadataInfo> => {
  if (isWeb()) {
    console.log('Metadata reading not available in web version');
    return { note: 'Metadata reading not available in web version' };
  }
  
  try {
    electronLog.info(`Reading metadata from: ${filePath}`);

    // In web, return mock metadata
    return {
      FileName: path.basename(filePath),
      FileSize: '0',
      FileType: 'Mock File',
      WebMock: 'true'
    };
  } catch (error) {
    electronLog.error(`Error reading metadata: ${error}`);
    return {};
  }
};

// Mock function for web environment
export const cleanImage = async (
  inputPath: string,
  outputDir: string,
  options = { quality: 85 }
): Promise<CleanResult> => {
  if (isWeb()) {
    console.log('Image cleaning not available in web version');
    
    // For web demo, log the attempt
    appendToCleaningLog({
      inputPath,
      outputPath: path.join(outputDir, path.basename(inputPath)),
      status: "success",
      timestamp: new Date().toISOString(),
      fileType: "image"
    });
    
    return { success: true };
  }
  
  // In web, always return mock success
  return { success: true, originalSize: 0, cleanedSize: 0 };
};

// Mock function for web environment
export const cleanVideo = async (
  inputPath: string,
  outputDir: string
): Promise<CleanResult> => {
  if (isWeb()) {
    console.log('Video cleaning not available in web version');
    
    // For web demo, log the attempt
    appendToCleaningLog({
      inputPath,
      outputPath: path.join(outputDir, path.basename(inputPath)),
      status: "success",
      timestamp: new Date().toISOString(),
      fileType: "video"
    });
    
    return { success: true };
  }
  
  // In web, always return mock success
  return { success: true, originalSize: 0, cleanedSize: 0 };
};

// Mock function for web environment
export const getDefaultOutputDirectory = (): string => {
  if (isWeb()) {
    return '/mock/output/directory';
  }
  
  // Return a mock path for web
  return '/cleaned';
};

// Mock function for web environment
export const ensureOutputDirectoryExists = (dirPath: string): boolean => {
  if (isWeb()) {
    console.log('Directory creation not available in web version');
    return true;
  }
  
  // In web, always return success
  return true;
};
