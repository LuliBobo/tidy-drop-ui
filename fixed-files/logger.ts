/**
 * Web-compatible logger implementation
 * This is a simplified version for web environments without Electron dependencies
 */

// Define log interfaces
interface CleaningLogEntry {
  inputPath: string;
  outputPath: string;
  status: "success";
  timestamp: string;
  fileType: "image" | "video";
  originalSize?: number;
  cleanedSize?: number;
}

// Web-compatible logger that mimics electron-log
export const electronLog = {
  info: (message: string) => console.info('[INFO]', message),
  warn: (message: string) => console.warn('[WARN]', message),
  error: (message: string) => console.error('[ERROR]', message),
  debug: (message: string) => console.debug('[DEBUG]', message),
  transports: {
    file: {
      getFile: () => null,
      resolvePathFn: () => '',
      level: 'info' as const,
      format: '',
      maxSize: 0,
      sync: false
    },
    console: {
      level: 'info' as const,
      format: '',
      useStyles: true
    }
  }
};

// Helper function to safely log to localStorage in web environment
export const logToStorage = (key: string, data: any): void => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      data
    };
    localStorage.setItem(`droptidy-log-${key}-${timestamp}`, JSON.stringify(logEntry));
  } catch (error) {
    console.error('Failed to log to storage:', error);
  }
};

// Function to get all logs from storage
export const getLogsFromStorage = (): any[] => {
  try {
    const logs: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('droptidy-log-')) {
        const logData = localStorage.getItem(key);
        if (logData) {
          logs.push(JSON.parse(logData));
        }
      }
    }
    return logs;
  } catch (error) {
    console.error('Failed to get logs from storage:', error);
    return [];
  }
};

// Default export for compatibility
export default electronLog;
