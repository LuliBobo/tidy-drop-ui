// Import path polyfill for web compatibility
import * as pathBrowserify from 'path-browserify';

// Check if running in web build environment
const isWebBuild = typeof import.meta.env !== 'undefined' && import.meta.env.VITE_IS_WEB_BUILD === 'true';

// Use path module based on environment
const path = pathBrowserify;

interface CleaningLogEntry {
  inputPath: string;
  outputPath: string;
  status: "success";
  timestamp: string;
  fileType: "image" | "video";
  originalSize?: number;
  cleanedSize?: number;
}

let electronLog: {
  transports: {
    file: {
      resolvePathFn: (arg?: unknown) => string;
      level: string;
    };
  };
  info: (message: string) => void;
  error: (message: string) => void;
};

let fs: {
  ensureDirSync: (path: string) => void;
  existsSync: (path: string) => boolean;
  writeFileSync: (path: string, data: string, options: string) => void;
  appendFileSync: (path: string, data: string, options: string) => void;
};

let logPath = '';
let homedir = '';

// Initialize modules based on environment
async function initializeModules() {
  if (!isWebBuild) {
    try {
      // These imports will only be executed in Node.js/Electron environment
      const fsModule = await import('fs-extra');
      fs = fsModule.default;
      
      const osModule = await import('os');
      homedir = osModule.homedir();
      
      const electronLogModule = await import('electron-log');
      electronLog = electronLogModule.default;
      
      // Set up log paths
      logPath = path.join(homedir, 'Cleaned', 'cleaned-log.json');
      
      // Configure electron-log
      electronLog.transports.file.resolvePathFn = () => path.join(homedir, 'Cleaned', 'app-logs.log');
      electronLog.transports.file.level = 'info';
      
      // Ensure the log directory exists
      fs.ensureDirSync(path.dirname(logPath));
      if (!fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, '', 'utf8');
      }
      
    } catch (error: unknown) {
      console.error('Error initializing Node.js modules:', error);
      initializeWebFallbacks();
    }
  } else {
    // Use web fallbacks in browser environment
    initializeWebFallbacks();
  }
}

// Web fallback implementations for Node.js/Electron functionality
function initializeWebFallbacks() {
  fs = {
    ensureDirSync: () => {},
    existsSync: () => false,
    writeFileSync: () => {},
    appendFileSync: () => {}
  };
  
  electronLog = {
    transports: {
      file: {
        resolvePathFn: () => '',
        level: 'info'
      }
    },
    info: (message: string) => console.log('[INFO]', message),
    error: (message: string) => console.error('[ERROR]', message)
  };
  
  logPath = 'web-log.json';
}

// Initialize modules
initializeModules();

// Export electronLog for use in other modules
export { electronLog };

export const appendToCleaningLog = (entry: CleaningLogEntry): void => {
  if (isWebBuild) {
    console.log('[WEB LOG]', entry);
    return;
  }
  
  try {
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(logPath, line, 'utf8');
  } catch (error: unknown) {
    console.error('Error appending to cleaning log:', error);
  }
};
