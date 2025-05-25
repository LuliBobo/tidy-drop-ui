// Web configuration for the application
import { PlatformMode } from './databaseAdapter';
import { electronLog } from './logger';

/**
 * Detect if the application is running in the web environment
 */
export function isWebEnvironment(): boolean {
  return typeof window !== 'undefined' && !window.isElectronApp;
}

/**
 * Get the platform mode based on the current environment
 */
export function getPlatformMode(): PlatformMode {
  return isWebEnvironment() ? PlatformMode.WEB : PlatformMode.ELECTRON;
}

/**
 * Get the database configuration for the web environment
 */
export function getWebDatabaseConfig(): Record<string, unknown> {
  try {
    // Try to get configuration from environment variables
    const host = process.env.DB_HOST || '';
    const port = process.env.DB_PORT || '5432';
    const database = process.env.DB_NAME || '';
    const user = process.env.DB_USER || '';
    const password = process.env.DB_PASSWORD || '';
    const ssl = process.env.DB_SSL === 'true';
    
    // Check for required configuration
    if (!host || !database || !user) {
      throw new Error('Missing required database configuration');
    }
    
    return {
      host,
      port: parseInt(port),
      database,
      user,
      password,
      ssl
    };
  } catch (error) {
    electronLog.error('Error getting web database config:', error);
    return {};
  }
}

/**
 * Initialize the web environment
 * This function should be called when the application starts in web mode
 */
export async function initializeWebEnvironment(): Promise<boolean> {
  try {
    // Check if we're in a web environment
    if (!isWebEnvironment()) {
      return false;
    }
    
    // Additional initialization can be added here
    
    return true;
  } catch (error) {
    electronLog.error('Error initializing web environment:', error);
    return false;
  }
}
