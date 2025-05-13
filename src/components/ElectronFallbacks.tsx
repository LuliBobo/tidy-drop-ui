/**
 * Electron API Fallbacks for Web Deployment
 * 
 * This module provides web-safe fallbacks for Electron APIs that can be used
 * during web deployment. It helps maintain TypeScript integrity by providing
 * proper function signatures and behavior.
 * 
 * Example usage:
 * Import functions from this module instead of using direct Electron API calls.
 * This allows your code to gracefully handle both Electron and web environments.
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
export function getPath(name: 'home' | 'appData' | 'userData' | 'temp' | 'downloads' | 'documents' | 'desktop' | 'pictures' | 'videos'): string {
  if (isWebBuild) {
    const webFallbacks: Record<string, string> = {
      'home': '/home',
      'appData': '/appData',
      'userData': '/userData',
      'temp': '/temp',
      'downloads': '/downloads',
      'documents': '/documents',
      'desktop': '/desktop',
      'pictures': '/pictures',
      'videos': '/videos'
    };
    
    return webFallbacks[name] || '/';
  }
  
  try {
    return getElectron().app.getPath(name) || '/';
  } catch (error: unknown) {
    console.error(`Error getting path for ${name}:`, error);
    return '/';
  }
}

/**
 * Selects a directory using system file dialog
 * Falls back to a toast message and default path in web environment
 */
export async function selectDirectory(): Promise<string | null> {
  if (isWebBuild) {
    toast({
      title: "Web Version Limitation",
      description: "Directory selection is only available in the desktop app",
      variant: "default"
    });
    return null;
  }

  try {
    return await getElectron().ipcRenderer.invoke('select-directory');
  } catch (error: unknown) {
    console.error("Error selecting directory:", error);
    return null;
  }
}

/**
 * Loads settings from storage
 * Uses localStorage in web environment
 */
export async function loadSettings<T extends Record<string, unknown>>(defaultSettings: T): Promise<T> {
  if (isWebBuild) {
    try {
      const stored = localStorage.getItem('droptidy-settings');
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (e: unknown) {
      console.error('Failed to load settings from localStorage:', e);
    }
    return defaultSettings;
  } 
  
  try {
    const settings = await getElectron().ipcRenderer.invoke('load-settings') as unknown as T;
    return settings || defaultSettings;
  } catch (error: unknown) {
    console.error('Failed to load settings:', error);
    return defaultSettings;
  }
}

/**
 * Saves settings to storage
 * Uses localStorage in web environment
 */
export async function saveSettings<T extends Record<string, unknown>>(settings: T): Promise<boolean> {
  if (isWebBuild) {
    try {
      localStorage.setItem('droptidy-settings', JSON.stringify(settings));
      return true;
    } catch (e: unknown) {
      console.error('Failed to save settings to localStorage:', e);
      return false;
    }
  }
  
  try {
    // Type casting to match the expected interface
    const settingsToSave = {
      outputDir: (settings as Record<string, unknown>).outputDir as string || '',
      autoOpenFolder: (settings as Record<string, unknown>).autoOpenFolder as boolean || false
    };
    return await getElectron().ipcRenderer.invoke('save-settings', settingsToSave) as boolean;
  } catch (error: unknown) {
    console.error('Failed to save settings:', error);
    return false;
  }
}
