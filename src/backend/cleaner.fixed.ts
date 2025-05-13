import * as pathBrowserify from 'path-browserify';

// Use path module based on environment
const path = pathBrowserify;

// Check if running in web build environment
const isWebBuild = typeof import.meta.env !== 'undefined' && import.meta.env.VITE_IS_WEB_BUILD === 'true';

// Define interfaces for our modules
interface FileStat {
  size: number;
}

interface FSModule {
  stat: (path: string) => Promise<FileStat>;
  readFile: (path: string) => Promise<Uint8Array>;
  writeFile: (path: string, data: Uint8Array) => Promise<void>;
  existsSync: (path: string) => boolean;
  mkdirSync: (path: string, options: { recursive: boolean }) => void;
  ensureDir: (path: string) => Promise<void>;
}

interface ChildProcess {
  stdout: { 
    on: (event: string, callback: (data: { toString(): string }) => void) => void 
  };
  on: (event: string, callback: (codeOrError: number | Error) => void) => void;
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

// Import Node.js modules conditionally to avoid errors in web build
let fs: FSModule;
let spawn: (command: string, args: string[]) => ChildProcess;
let electronLog: {
  info: (message: string) => void;
  error: (message: string) => void;
  debug?: (message: string) => void;
  transports?: {
    file: {
      resolvePathFn: (arg?: unknown) => string;
      level: string;
      format: string;
      maxSize: number;
      sync: boolean;
    };
    console: {
      level: string;
    };
  };
};
let appendToCleaningLog: (entry: CleaningLogEntry) => void;

// Define web fallbacks for Node/Electron functionality
if (!isWebBuild) {
  // These imports will only be executed in Node.js/Electron environment
  const initializeNodeModules = async () => {
    try {
      fs = (await import('fs-extra')).default as unknown as FSModule;
      const childProcess = await import('child_process');
      spawn = childProcess.spawn as (command: string, args: string[]) => ChildProcess;
      electronLog = (await import('electron-log')).default as typeof electronLog;
      
      // Import logger only in Electron environment
      const loggerModule = await import('./logger');
      appendToCleaningLog = loggerModule.appendToCleaningLog;
      
      // Configure electron-log
      if (electronLog.transports) {
        electronLog.transports.file.resolvePathFn = () => path.join(process.env.HOME || '', 'DropTidy/logs.txt');
        electronLog.transports.file.level = 'info';
        electronLog.transports.console.level = 'debug';
        electronLog.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}';
        electronLog.transports.file.maxSize = 10 * 1024 * 1024; // 10MB
        electronLog.transports.file.sync = true;
      }
      
      // Create log directory if it doesn't exist
      const logDir = path.join(process.env.HOME || '', 'DropTidy');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (error) {
      console.error('Error initializing Node.js modules:', error);
      initializeWebFallbacks();
    }
  };
  
  // Initialize Node.js modules
  initializeNodeModules();
} else {
  // Use web fallbacks in browser environment
  initializeWebFallbacks();
}

// Web fallback implementations for Node.js/Electron functionality
function initializeWebFallbacks() {
  fs = {
    stat: async (_path: string) => ({ size: 0 }),
    readFile: async () => new Uint8Array(),
    writeFile: async () => {},
    existsSync: () => false,
    mkdirSync: () => {},
    ensureDir: async () => {}
  };
  
  spawn = (command: string, args: string[]) => {
    console.log(`[WEB] Simulating command: ${command} ${args.join(' ')}`);
    
    return {
      stdout: {
        on: (_event: string, _callback: (data: { toString(): string }) => void) => {
          // No-op in web environment
        }
      },
      on: (event: string, callback: (codeOrError: number | Error) => void) => {
        if (event === 'close') {
          // Simulate successful process completion
          setTimeout(() => callback(0), 100);
        }
      }
    };
  };
  
  electronLog = {
    info: (message: string) => console.log('[INFO]', message),
    error: (message: string) => console.error('[ERROR]', message),
    debug: (message: string) => console.debug('[DEBUG]', message),
    transports: {
      file: {
        resolvePathFn: () => '',
        level: 'info',
        format: '',
        maxSize: 0,
        sync: false
      },
      console: {
        level: 'debug'
      }
    }
  };
  
  appendToCleaningLog = () => {
    // No-op in web environment
  };
}

// Define a safe logging function that works in both environments
const safeLog = (level: string, message: string): void => {
  if (isWebBuild) {
    if (level === 'error') {
      console.error(message);
    } else {
      console.log(message);
    }
  } else {
    if (level === 'info' || level === 'error') {
      electronLog[level](message);
    } else {
      electronLog.info(message);
    }
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

export const readMetadata = async (filePath: string): Promise<MetadataInfo> => {
  try {
    safeLog('info', `Reading metadata from: ${filePath}`);

    // In web environment, return empty metadata
    if (isWebBuild) {
      safeLog('info', `[WEB] Simulating metadata read from: ${filePath}`);
      return {};
    }

    const result = await new Promise<string>((resolve, reject) => {
      const command = 'exiftool';
      const args = ['-json', filePath];
      const process = spawn(command, args);
      
      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`ExifTool exited with code ${code}`));
        }
      });

      process.on('error', (err: Error) => {
        safeLog('error', `Error reading metadata: ${err.message}`);
        reject(err);
      });
    });

    const metadata = JSON.parse(result)[0];
    safeLog('info', `Successfully read metadata from ${filePath}`);
    return metadata;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    safeLog('error', `Error reading metadata: ${errorMessage}`);
    return {};
  }
};

export const cleanImage = async (filePath: string): Promise<CleanResult> => {
  try {
    // In web environment, simulate cleaning
    if (isWebBuild) {
      safeLog('info', `[WEB] Simulating image cleaning: ${filePath}`);
      return { 
        success: true, 
        originalSize: 0, 
        cleanedSize: 0,
        metadata: {}
      };
    }

    const originalSize = (await fs.stat(filePath)).size;
    const metadata = await readMetadata(filePath);
    safeLog('info', `Starting image cleaning: ${filePath}`);

    const result = await new Promise<boolean>((resolve, reject) => {
      const command = 'exiftool';
      const args = ['-all=', '-overwrite_original', filePath];
      const process = spawn(command, args);

      process.on('close', (code) => resolve(code === 0));
      process.on('error', (err: Error) => {
        safeLog('error', `Error cleaning image: ${err.message}`);
        reject(err);
      });
    });

    if (result) {
      const cleanedSize = (await fs.stat(filePath)).size;
      safeLog('info', `Successfully cleaned image. Size reduction: ${originalSize - cleanedSize} bytes`);
      
      // Add JSON logging in Electron environment
      appendToCleaningLog({
        inputPath: filePath,
        outputPath: filePath, // For images, input and output are the same since we overwrite
        status: "success",
        timestamp: new Date().toISOString(),
        fileType: "image",
        originalSize,
        cleanedSize
      });
      
      return { success: true, originalSize, cleanedSize, metadata };
    }
    
    safeLog('error', 'Failed to clean image');
    return { success: false };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    safeLog('error', `Error in cleanImage: ${errorMessage}`);
    return { success: false };
  }
};

export const cleanVideo = async (input: string, output: string): Promise<CleanResult> => {
  try {
    // In web environment, simulate cleaning
    if (isWebBuild) {
      safeLog('info', `[WEB] Simulating video cleaning: ${input}`);
      return { 
        success: true, 
        originalSize: 0, 
        cleanedSize: 0
      };
    }

    const originalSize = (await fs.stat(input)).size;
    safeLog('info', `Starting video cleaning: ${input}`);

    const result = await new Promise<boolean>((resolve, reject) => {
      const command = 'ffmpeg';
      const args = ['-i', input, '-map_metadata', '-1', '-c:v', 'copy', '-c:a', 'copy', output];
      const process = spawn(command, args);

      process.on('close', (code) => resolve(code === 0));
      process.on('error', (err: Error) => {
        safeLog('error', `Error cleaning video: ${err.message}`);
        reject(err);
      });
    });

    if (result) {
      const cleanedSize = (await fs.stat(output)).size;
      safeLog('info', `Successfully cleaned video. Size reduction: ${originalSize - cleanedSize} bytes`);
      
      // Add JSON logging in Electron environment
      appendToCleaningLog({
        inputPath: input,
        outputPath: output,
        status: "success",
        timestamp: new Date().toISOString(),
        fileType: "video",
        originalSize,
        cleanedSize
      });
      
      return { success: true, originalSize, cleanedSize };
    }

    safeLog('error', 'Failed to clean video');
    return { success: false };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    safeLog('error', `Error in cleanVideo: ${errorMessage}`);
    return { success: false };
  }
};

export const createZipExport = async (files: string[]): Promise<string> => {
  try {
    // In web environment, simulate zip creation
    if (isWebBuild) {
      safeLog('info', `[WEB] Simulating ZIP export for ${files.length} files`);
      return 'web-export.zip'; // Return dummy path
    }

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const zipPath = path.join(process.env.HOME || '', 'DropTidy/export.zip');

    safeLog('info', 'Starting ZIP export');
    
    for (const file of files) {
      const content = await fs.readFile(file);
      zip.file(path.basename(file), content);
    }

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    await fs.ensureDir(path.dirname(zipPath));
    await fs.writeFile(zipPath, buffer as Uint8Array);
    
    safeLog('info', `Successfully created ZIP export: ${zipPath}`);
    return zipPath;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    safeLog('error', `Error creating ZIP export: ${errorMessage}`);
    throw error;
  }
};
