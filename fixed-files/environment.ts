/**
 * Web-safe environment utilities
 * Provides web-compatible alternatives to Electron APIs
 */

// Define app types
export interface IsTyApp {
  isElectron: boolean;
  isWeb: boolean;
  isDev: boolean;
  isProd: boolean;
}

// Web paths fallbacks
const WEB_PATHS = {
  userData: '/user-data',
  appData: '/app-data',
  temp: '/temp',
  home: '/home',
  downloads: '/downloads',
  documents: '/documents',
  desktop: '/desktop',
  pictures: '/pictures',
  videos: '/videos'
};

// Always returns false in web builds
export function isElectron(): boolean {
  return false;
}

// Always returns true in web builds
export function isWeb(): boolean {
  return true;
}

// Stub for importing Electron modules
export async function importElectron<T = any>(moduleName: string, suppressLog = false): Promise<T | null> {
  if (!suppressLog) {
    console.debug(`Web build: Import of ${moduleName} not available`);
  }
  return null;
}

// Stub for IPC renderer invoke
export async function safeIpcInvoke<T = unknown>(
  channel: string,
  args: unknown[] = [],
  webFallback?: () => Promise<T>
): Promise<T | undefined> {
  console.log(`Web build: IPC invoke to ${channel} not available`);
  
  if (webFallback && typeof webFallback === 'function') {
    return await webFallback();
  }
  
  return undefined;
}

// Type definition for cleanup function
export type CleanupFunction = () => void;

// Stub for IPC renderer on
export function safeIpcOn<T = unknown>(
  channel: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  listener: (event: any, data: T) => void
): CleanupFunction {
  console.log(`Web build: IPC on listener for ${channel} not available`);
  return () => { /* no-op */ };
}

// Stub for IPC renderer once
export function safeIpcOnce<T = unknown>(
  channel: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  listener: (event: any, data: T) => void
): CleanupFunction {
  console.log(`Web build: IPC once listener for ${channel} not available`);
  return () => { /* no-op */ };
}

// Stub for Electron paths
export function getPath(pathName: string): string {
  return WEB_PATHS[pathName as keyof typeof WEB_PATHS] || '/';
}

// Environment detection object
export const environment: IsTyApp = {
  isElectron: false,
  isWeb: true,
  isDev: import.meta.env.DEV, 
  isProd: import.meta.env.PROD
};
