/**
 * Electron API Fallbacks for Web Deployment
 * 
 * This module provides web-safe fallbacks for Electron APIs that can be used
 * during web deployment. It helps maintain TypeScript integrity by providing
 * proper function signatures and behavior.
 * 
 * @example
 * // Instead of:
 * if (isElectron()) {
 *   window.electron?.app.openFolder(path);
 * } else {
 *   // Empty or incomplete code
 * }
 * 
 * // Use:
 * import { openFolder } from './ElectronFallbacks';
 * await openFolder(path);
 */

import { toast } from '@/hooks/use-toast';

// Check if running in web build environment
const isWebBuild = import.meta.env.VITE_IS_WEB_BUILD === 'true';

// Define types for Electron API
type ElectronApiType = {
  app: {
    openFolder: (path: string) => Promise<boolean>;
    showItemInFolder: (path: string) => Promise<void>;
    getPath: (type: string) => string;
  };
  ipcRenderer: {
    invoke: <T = unknown>(channel: string, ...args: unknown[]) => Promise<T>;
  };
};

// Dummy functions to replace Electron API calls
const electronAPI: ElectronApiType = {
  app: {
    openFolder: async () => {
      console.log('openFolder not available in web');
      return false;
    },
    showItemInFolder: async () => {
      console.log('showItemInFolder not available in web');
    },
    getPath: (name) => {
      const webFallbacks: Record<string, string> = {
        'home': '/home',
        'appData': '/appData',
        'userData': '/userData',
        'temp': '/temp',
        'downloads': '/downloads',
        'documents': '/documents'
      };
      return webFallbacks[name] || '/';
    }
  },
  ipcRenderer: {
    invoke: async <T = unknown>(): Promise<T> => {
      console.log('ipcRenderer.invoke not available in web');
      return null as unknown as T;
    }
  }
};

// Helper function to safely access Electron APIs
const getElectron = () => {
  return isWebBuild ? electronAPI : window.electron;
};

/**
 * Opens a folder in the system file explorer
 * Falls back to a toast message in web environment
 */
export async function openFolder(folderPath: string): Promise<void> {
  if (isWebBuild) {
    toast({
      title: "Web Version",
      description: "Opening folders is only available in the desktop app",
      variant: "default"
    });
    return;
  }
  
  try {
    await getElectron().app.openFolder(folderPath);
  } catch (error) {
    console.error("Error opening folder:", error);
    toast({
      title: "Error",
      description: "Failed to open folder",
      variant: "destructive"
    });
  }
}

/**
 * Shows an item in the system file explorer
 * Falls back to a toast message in web environment
 */
export async function showItemInFolder(filePath: string): Promise<void> {
  if (isWebBuild) {
    toast({
      title: "Web Version",
      description: "Showing files in folder is only available in the desktop app",
      variant: "default"
    });
    return;
  }
  
  try {
    await getElectron().app.showItemInFolder(filePath);
  } catch (error) {
    console.error("Error showing item in folder:", error);
    toast({
      title: "Error",
      description: "Failed to show item in folder",
      variant: "destructive"
    });
  }
}

/**
 * Gets a path from the system
 * Falls back to a reasonable default in web environment
 */
export function getPath(name: 'home' | 'appData' | 'userData' | 'temp' | 'downloads' | 'documents' | string): string {
  if (isWebBuild) {
    const webFallbacks: Record<string, string> = {
      'home': '/home',
      'appData': '/appData',
      'userData': '/userData',
      'temp': '/temp',
      'downloads': '/downloads',
      'documents': '/documents'
    };
    
    return webFallbacks[name] || '/';
  }
  
  try {
    return getElectron().app.getPath(name as string) || '/';
  } catch (error) {
    console.error(`Error getting path for ${name}:`, error);
    return '/';
  }
}

/**
 * Selects a directory using system file dialog
 * Falls back to a toast message and default path in web environment
 */
export async function selectDirectory(defaultPath?: string): Promise<string | null> {
  return await safeIpcInvoke<string | null>(
    'select-directory',
    [defaultPath],
    async () => {
      toast({
        title: "Web Version Limitation",
        description: "Directory selection is only available in the desktop app",
        variant: "default"
      });
      return null;
    }
  );
}

/**
 * Loads settings from storage
 * Uses localStorage in web environment
 */
export async function loadSettings<T extends Record<string, any>>(defaultSettings: T): Promise<T> {
  return await safeIpcInvoke<T>(
    'load-settings',
    [],
    async () => {
      try {
        const stored = localStorage.getItem('droptidy-settings');
        if (stored) {
          return JSON.parse(stored) as T;
        }
      } catch (e) {
        console.error('Failed to load settings from localStorage:', e);
      }
      return defaultSettings;
    }
  ) || defaultSettings;
}

/**
 * Saves settings to storage
 * Uses localStorage in web environment
 */
export async function saveSettings<T extends Record<string, any>>(settings: T): Promise<boolean> {
  return await safeIpcInvoke<boolean>(
    'save-settings',
    [settings],
    async () => {
      try {
        localStorage.setItem('droptidy-settings', JSON.stringify(settings));
        return true;
      } catch (e) {
        console.error('Failed to save settings to localStorage:', e);
        return false;
      }
    }
  ) || false;
}
