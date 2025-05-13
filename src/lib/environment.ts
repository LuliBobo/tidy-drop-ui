/**
 * Environment Detection Utility
 * 
 * This module provides utility functions to detect the current environment (Electron vs web browser)
 * and safely invoke Electron IPC methods with fallbacks for web contexts.
 * 
 * Use these utilities to write code that works in both Electron and web browser environments,
 * ensuring a consistent experience regardless of the context.
 * 
 * Example usage:
 * 
 * ```typescript
 * // Check current environment
 * if (isElectron()) {
 *   console.log('Running in Electron');
 * } else {
 *   console.log('Running in browser');
 * }
 * 
 * // Safely import Electron module
 * const electron = await importElectron<typeof import('electron')>('electron');
 * if (electron) {
 *   // Use Electron APIs
 *   const { app } = electron;
 * }
 * 
 * // Safely invoke IPC with fallback
 * const result = await safeIpcInvoke<string>(
 *   'get-file-path', 
 *   ['document'],
 *   async () => '/browser/mock/path.txt'
 * );
 * 
 * // Register IPC event listener with cleanup
 * const cleanup = safeIpcOn('file-changed', (event, filePath) => {
 *   console.log('File changed:', filePath);
 * });
 * 
 * // Later, when component unmounts
 * cleanup();
 * ```
 * 
 * @packageDocumentation
 */
 
/* eslint-disable @typescript-eslint/no-explicit-any */

// Import type only, not the actual module
import type { IpcRendererEvent } from 'electron';

/**
 * Type definition for IPC invoke channel name
 */
export type IpcChannel = string;

/**
 * Type definition for IPC arguments
 */
export type IpcArgs = any[];

/**
 * Type for IPC invoke result with proper error handling
 */
export type IpcResult<T> = Promise<{ success: true; data: T } | { success: false; error: string }>;

/**
 * Generic type for IPC channel definitions with typed arguments and return values
 */
export interface IpcChannelDefinition<TArgs extends any[] = any[], TResult = any> {
  channel: IpcChannel;
  args: TArgs;
  result: TResult;
}

/**
 * Type for an IPC renderer event handler
 */
export type IpcEventHandler<T = any> = (event: IpcRendererEvent, ...args: T[]) => void;

/**
 * Safely check if the application is running in an Electron environment
 * 
 * This checks multiple properties to determine if we're in Electron:
 * 1. First checks for VITE_IS_WEB_BUILD environment variable (highest priority)
 * 2. Presence of window.process and userAgent containing 'Electron'
 * 3. Existence of the electron bridge in window.electron
 * 4. Checking navigator.userAgent for Electron
 * 5. Checking for process.versions.electron in Node.js environment
 * 
 * The function handles SSR scenarios where window might not be available
 * and prevents false positives from browser extensions.
 * 
 * @returns {boolean} - True if running in Electron, false otherwise
 */
/**
 * Check if the code is running in an Electron context.
 * Uses multiple detection methods for reliability.
 * 
 * @returns {boolean} True if running in Electron, false otherwise
 */
export function isElectron(): boolean {
  // HIGHEST PRIORITY: Check for explicit environment variable
  // This is set during our Netlify builds and web development
  if (import.meta.env && import.meta.env.VITE_IS_WEB_BUILD === 'true') {
    console.debug('Running in web mode due to VITE_IS_WEB_BUILD=true');
    return false;
  }
  
  // Handle SSR case where window is not defined
  if (typeof window === 'undefined') {
    // Check for Node.js process in non-browser environment
    return typeof process !== 'undefined' && 
           process?.versions?.electron !== undefined;
  }

  // For development - check localStorage override
  try {
    const envOverride = localStorage.getItem('DROPTIDY_FORCE_ENVIRONMENT');
    if (envOverride === 'web') {
      console.debug('Forced web environment via localStorage override');
      return false;
    } else if (envOverride === 'electron') {
      console.debug('Forced electron environment via localStorage override');
      return true;
    }
  } catch (e) {
    // Ignore localStorage errors
  }

  try {
    // Check for the presence of Electron-specific properties
    const userAgent = navigator?.userAgent?.toLowerCase() || '';
    
    // Multiple detection methods for better reliability
    return (
      // Method 1: Check window.process
      (window as any).process?.versions?.electron !== undefined ||
      // Method 2: Check for electron bridge exposed by contextBridge (most reliable)
      (window as any).electron !== undefined ||
      // Method 3: Check user agent (less reliable but useful as fallback)
      userAgent.indexOf('electron') !== -1
    );
  } catch (e) {
    // If any error occurs during detection, assume we're not in Electron
    console.warn('Error detecting environment:', e);
    return false;
  }
}

/**
 * Check if the application is running in a web browser environment
 * This is simply the inverse of isElectron, but provided as a separate
 * function for code readability
 */
export function isWeb(): boolean {
  return !isElectron();
}

/**
 * Helper for conditionally importing Electron-specific modules
 * This approach prevents TypeScript errors during builds for web environments
 * by ensuring the import is only attempted at runtime when in Electron
 * 
 * @template T The expected module type
 * @param moduleName The name of the Electron module to import
 * @returns A promise that resolves to the imported module or null in web environments
 * 
 * @example
 * const electron = await importElectron<typeof import('electron')>('electron');
 * if (electron) {
 *   // Use Electron APIs safely
 *   const { BrowserWindow } = electron;
 * }
 */
export async function importElectron<T = any>(moduleName: string): Promise<T | null> {
  // Early return for explicit web builds
  if (import.meta.env.VITE_IS_WEB_BUILD === 'true') {
    console.debug(`Skipping import of Electron module "${moduleName}" in web build`);
    return null;
  }
  
  // Only attempt to import if we're in Electron
  if (isElectron()) {
    try {
      // Dynamic import to prevent build-time errors
      const module = await import(/* @vite-ignore */ moduleName);
      return module as T;
    } catch (error) {
      console.error(`Error importing Electron module "${moduleName}":`, error);
      return null;
    }
  }
  
  return null;
}

/**
 * Safely invoke an Electron IPC method with fallback for web contexts
 * 
 * This function handles:
 * 1. Type-safe IPC invocation in Electron environments
 * 2. Graceful fallback to provided function in web environments
 * 3. SSR scenarios where window may not be defined
 * 
 * @param channel - The IPC channel name
 * @param args - Arguments to pass to the IPC method
 * @param webFallback - Optional fallback function to execute in web context
 * @returns A promise with the result or error
 * @throws Will re-throw any errors from IPC calls or fallbacks to allow proper handling
 */
export async function safeIpcInvoke<T>(
  channel: IpcChannel,
  args?: IpcArgs,
  webFallback?: () => Promise<T>
): Promise<T | undefined> {
  try {
    // Handle SSR case where window is not defined
    if (typeof window === 'undefined') {
      if (webFallback && typeof webFallback === 'function') {
        return await webFallback();
      }
      console.warn(`IPC call "${channel}" ignored in SSR context and no fallback provided`);
      return undefined;
    }

    if (isElectron()) {
      // In Electron, use the IPC renderer to invoke the method
      const ipcRenderer = (window as any).electron?.ipcRenderer;
      
      if (ipcRenderer && typeof ipcRenderer.invoke === 'function') {
        return await ipcRenderer.invoke(channel, ...(args || []));
      } else {
        console.error('IPC renderer not available despite being in Electron environment');
        return undefined;
      }
    } else if (webFallback && typeof webFallback === 'function') {
      // In web context, use the provided fallback function
      return await webFallback();
    } else {
      console.warn(`IPC call "${channel}" ignored in web environment and no fallback provided`);
      return undefined;
    }
  } catch (error) {
    console.error(`Error in safeIpcInvoke for channel "${channel}":`, error);
    throw error; // Re-throw to allow caller to handle errors
  }
}

/**
 * Register an IPC listener that works in Electron but does nothing in web environment
 * 
 * @param channel - The IPC channel name to listen on
 * @param listener - The callback function to execute when the event is received
 * @returns A cleanup function to remove the listener
 */
export function safeIpcOn(
  channel: IpcChannel,
  listener: IpcEventHandler
): () => void {
  if (isElectron()) {
    const ipcRenderer = (window as any).electron?.ipcRenderer;
    if (ipcRenderer && typeof ipcRenderer.on === 'function') {
      ipcRenderer.on(channel, listener);
      
      // Return a cleanup function
      return () => {
        if (ipcRenderer && typeof ipcRenderer.removeListener === 'function') {
          ipcRenderer.removeListener(channel, listener);
        }
      };
    }
  }
  
  // Return a no-op cleanup function for web environment
  return () => {};
}

/**
 * Get the current environment name as a string
 * Useful for debugging and logging purposes
 * 
 * @returns {'electron' | 'web'} - Name of the current environment
 */
export function getEnvironmentName(): 'electron' | 'web' {
  return isElectron() ? 'electron' : 'web';
}

/**
 * Check for the availability of a specific IPC channel in the current environment
 * Useful for feature detection and conditional rendering
 * 
 * @param channelName - The name of the IPC channel to check
 * @returns {boolean} - True if the channel is available, false otherwise
 */
export function hasIpcChannel(channelName: IpcChannel): boolean {
  if (!isElectron()) return false;
  
  const validChannels = [
    'clean-image',
    'clean-video',
    'create-zip',
    'read-metadata',
    'open-folder',
    'load-settings',
    'save-settings',
    'select-directory'
  ];
  
  return validChannels.includes(channelName);
}
