/**
 * Web-compatible logger implementation
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

// Web-compatible logger
const electronLog = {
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
      level: 'info' as const
    }
  }
};

// Export web-compatible logger
export { electronLog };

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
