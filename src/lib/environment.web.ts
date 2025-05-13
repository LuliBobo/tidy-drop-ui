/**
 * Environment Detection Utility for Web and Electron
 * 
 * This module provides utility functions to detect the current environment
 * and safely invoke Electron IPC methods with fallbacks for web contexts.
 */
 
/* eslint-disable @typescript-eslint/no-explicit-any */

// Import type only, not the actual module
import type { IpcRendererEvent } from 'electron';

/**
 * Type definition for a cleanup function that removes event listeners
 */
export type CleanupFunction = () => void;

/**
 * Check if running in Electron environment
 * 
 * @returns {boolean} true if running in Electron, false if in browser
 */
export function isElectron(): boolean {
  // Check for explicit web build flag first (most reliable)
  if (import.meta.env.VITE_IS_WEB_BUILD === 'true') {
    return false;
  }

  // Otherwise check for window.electron
  return typeof window !== 'undefined' && window.electron !== undefined;
}

/**
 * Check if running in web environment (inverse of isElectron)
 * 
 * @returns {boolean} true if running in browser, false if in Electron
 */
export function isWeb(): boolean {
  return !isElectron();
}

/**
 * Dynamically imports an Electron module
 * In web environments, returns null and optionally logs a message
 * 
 * @param {string} moduleName - Name of the module to import (e.g., 'electron')
 * @param {boolean} suppressLog - Whether to suppress the console message in web environments
 * @returns {Promise<T | null>} The imported module or null in web environments
 */
export async function importElectron<T = any>(moduleName: string, suppressLog = false): Promise<T | null> {
  // Early return for explicit web builds
  if (import.meta.env.VITE_IS_WEB_BUILD === 'true') {
    if (!suppressLog) {
      console.debug(`Skipping import of Electron module "${moduleName}" in web build`);
    }
    return null;
  }
  
  if (isElectron()) {
    try {
      // Dynamic import to prevent build-time errors
      const module = await import(/* @vite-ignore */ moduleName);
      return module as T;
    } catch (error) {
      console.error(`Failed to import Electron module "${moduleName}":`, error);
      return null;
    }
  } else {
    if (!suppressLog) {
      console.debug(`Skipping import of Electron module "${moduleName}" in web environment`);
    }
    return null;
  }
}

/**
 * Safely invokes an Electron IPC method with a fallback for web environments
 * 
 * @param {string} channel - The IPC channel name
 * @param {unknown[]} args - Arguments to pass to the IPC call
 * @param {Function} webFallback - Optional fallback function to call in web environments
 * @returns {Promise<T>} Result from IPC call or fallback
 */
export async function safeIpcInvoke<T = unknown, Args extends readonly unknown[] = readonly unknown[]>(
  channel: string,
  args: Args = [] as unknown as Args,
  webFallback?: () => Promise<T>
): Promise<T | undefined> {
  try {
    // Check if we're in Electron
    if (isElectron()) {
      // In Electron, use IPC
      const result = await window.electron.ipcRenderer.invoke(channel, ...(args as unknown[]));
      return result as T;
    } else {
      // In web context, use the provided fallback function
      if (webFallback && typeof webFallback === 'function') {
        return await webFallback();
      } else {
        console.warn(`IPC call "${channel}" ignored in web environment and no fallback provided`);
        return undefined;
      }
    }
  } catch (error) {
    console.error(`Error in safeIpcInvoke for channel "${channel}":`, error);
    return undefined;
  }
}

/**
 * Safely registers an IPC event listener with automatic cleanup
 * In web environments, logs a message and returns a no-op cleanup function
 * 
 * @param {string} channel - The IPC channel to listen on
 * @param {Function} listener - Event listener callback
 * @returns {CleanupFunction} Function to remove the event listener
 */
export function safeIpcOn<T = unknown>(
  channel: string,
  listener: (event: IpcRendererEvent, data: T) => void
): CleanupFunction {
  // No-op function for web environment
  const noop = () => { /* no-op */ };
  
  // Check if we're in Electron
  if (isElectron() && window.electron && window.electron.ipcRenderer) {
    try {
      // Register the event listener using the available API
      window.electron.ipcRenderer.on(channel, listener);
      
      // Return cleanup function
      return () => {
        // Remove the listener using the available API
        window.electron.ipcRenderer.off(channel, listener);
      };
    } catch (error) {
      console.error(`Error registering IPC listener for "${channel}":`, error);
    }
  } else {
    // In web environment, return a no-op cleanup function
    console.debug(`IPC listener for "${channel}" not registered in web environment`);
  }
  
  return noop;
}

/**
 * Safely registers a one-time IPC event listener
 * In web environments, logs a message and returns a no-op cleanup function
 * 
 * @param {string} channel - The IPC channel to listen on
 * @param {Function} listener - Event listener callback
 * @returns {CleanupFunction} Function to remove the event listener if it hasn't fired yet
 */
export function safeIpcOnce<T = unknown>(
  channel: string,
  listener: (event: IpcRendererEvent, data: T) => void
): CleanupFunction {
  // No-op function for web environment
  const noop = () => { /* no-op */ };
  
  // Check if we're in Electron
  if (isElectron() && window.electron && window.electron.ipcRenderer) {
    try {
      // Register the one-time event listener
      const ipcRenderer = window.electron.ipcRenderer;
      if (typeof ipcRenderer.once === 'function') {
        ipcRenderer.once(channel, listener);
        // Return cleanup function
        return () => {
        // Return cleanup function
        return () => {
          ipcRenderer.off(channel, listener);
        };
      console.error(`Error registering one-time IPC listener for "${channel}":`, error);
    }
  } else {
    // In web environment, log debug message
    console.debug(`One-time IPC listener for "${channel}" not registered in web environment`);
  }
  
  return noop;
}
