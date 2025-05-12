/**
 * Global TypeScript declarations for Electron APIs in DropTidy
 * 
 * This file defines the typings for Electron-specific globals exposed through
 * the preload script to ensure proper TypeScript type checking and autocompletion
 * in both Electron and web environments.
 */

// Import Electron types required for full typing
import { IpcRendererEvent } from 'electron';

/**
 * Extends the Window interface to include our Electron API
 */
declare global {
  /**
   * Type definition for valid IPC channels for type safety
   */
  type ValidIpcChannel = 
    | 'clean-image'
    | 'clean-video'
    | 'create-zip'
    | 'read-metadata'
    | 'open-folder'
    | 'load-settings'
    | 'save-settings'
    | 'select-directory'
    | 'get-path'
    | 'show-item-in-folder';

  /**
   * Type for an IPC renderer event handler 
   */
  type IpcEventHandler<T = any> = (event: IpcRendererEvent, ...args: T[]) => void;

  /**
   * Interface for the IPC renderer exposed through the contextBridge
   */
  interface ElectronIpcRenderer {
    /**
     * Invoke an IPC method in the main process and wait for a result
     * 
     * @param channel - The IPC channel name (must be a valid channel)
     * @param args - Arguments to pass to the IPC method
     * @returns A promise with the result from the main process
     * @throws Error if an invalid channel is used
     */
    invoke<T = any>(channel: ValidIpcChannel, ...args: unknown[]): Promise<T>;

    /**
     * Register a listener for IPC events from the main process
     * 
     * @param channel - The IPC channel name to listen on
     * @param listener - The callback function to execute when events are received
     */
    on<T = any>(channel: string, listener: IpcEventHandler<T>): void;

    /**
     * Remove a previously registered IPC event listener
     * 
     * @param channel - The IPC channel name
     * @param listener - The callback function to remove
     */
    removeListener<T = any>(channel: string, listener: IpcEventHandler<T>): void;
  }

  /**
   * Interface for Electron app-related functionality exposed through the contextBridge
   */
  interface ElectronApp {
    /**
     * Get a path to a special directory or file
     * 
     * @param name - Name of the path (e.g. 'userData', 'documents', etc.)
     * @returns Promise resolving to the requested path
     */
    getPath(name: string): Promise<string>;

    /**
     * Show an item in the OS file explorer
     * 
     * @param path - The path to show in the file explorer
     * @returns Promise resolving when the operation is complete
     */
    showItemInFolder(path: string): Promise<void>;

    /**
     * Open a folder in the default file manager
     * 
     * @param path - The path to the folder
     * @returns Promise resolving when the operation is complete
     */
    openFolder(path: string): Promise<void>;
  }

  /**
   * Interface for all Electron-specific APIs exposed to the renderer
   */
  interface ElectronAPI {
    /**
     * IPC renderer interface for communication with the main process
     */
    ipcRenderer: ElectronIpcRenderer;

    /**
     * App-specific functionality
     */
    app: ElectronApp;
  }

  /**
   * Augment the Window interface to include our Electron API
   */
  interface Window {
    /**
     * DropTidy's Electron API
     * This is available only when running in Electron, and will be undefined in web environments.
     */
    electron?: ElectronAPI;
    
    /**
     * Node.js process object exposed in Electron environments
     * This is used for environment detection and will be undefined in web environments.
     */
    process?: {
      versions?: {
        electron?: string;
        node?: string;
      };
      platform?: string;
      arch?: string;
    };
  }
}

// Prevent TS error about missing exports
export {};
