import { toast } from '@/components/ui/use-toast';

// Check if running in web build
const isWebBuild = typeof import.meta.env !== 'undefined' && import.meta.env.VITE_IS_WEB_BUILD === 'true';

/**
 * Safely get Electron module only in desktop environment
 * Returns null in web environment
 */
function getElectron(): any {
  if (typeof window !== 'undefined' && window.electron) {
    return window.electron;
  }
  return null;
}

/**
 * CleanImage function that works in both web and electron environments
 * In web, it shows a toast and performs a simulated operation
 * In electron, it calls the IPC handler to clean the image
 */
export async function cleanImage(filePath: string): Promise<{ success: boolean; originalSize?: number; cleanedSize?: number; metadata?: any } | undefined> {
  if (isWebBuild) {
    toast({
      title: "Web Version",
      description: "Image cleaning requires the desktop app",
      variant: "default"
    });
    
    // Simulate success with fake data for preview
    return {
      success: true,
      originalSize: 10000,
      cleanedSize: 8000,
      metadata: { width: 1920, height: 1080 }
    };
  }
  
  try {
    if (getElectron()?.ipcRenderer) {
      return await getElectron().ipcRenderer.invoke('clean-image', filePath);
    } else {
      throw new Error("Electron IPC not available");
    }
  } catch (error: unknown) {
    console.error("Error cleaning image:", error);
    toast({
      title: "Error",
      description: "Failed to clean image metadata",
      variant: "destructive"
    });
    return undefined;
  }
}

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
    if (getElectron()?.app) {
      await getElectron().app.openFolder(folderPath);
    } else {
      throw new Error("Electron app not available");
    }
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
      description: "This feature is only available in the desktop app",
      variant: "default"
    });
    return;
  }
  
  try {
    if (getElectron()?.app) {
      await getElectron().app.showItemInFolder(filePath);
    } else {
      throw new Error("Electron app not available");
    }
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
      'appData': '/appdata',
      'userData': '/userdata',
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
    if (getElectron()?.app) {
      return getElectron().app.getPath(name) || '/';
    } else {
      throw new Error("Electron app not available");
    }
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
      title: "Web Version",
      description: "Selecting directories is only available in the desktop app",
      variant: "default"
    });
    return null;
  }
  
  try {
    if (getElectron()?.ipcRenderer) {
      const result = await getElectron().ipcRenderer.invoke('select-directory');
      return result.filePaths?.[0] || null;
    } else {
      throw new Error("Electron IPC not available");
    }
  } catch (error: unknown) {
    console.error("Error selecting directory:", error);
    toast({
      title: "Error",
      description: "Failed to select directory",
      variant: "destructive"
    });
    return null;
  }
}

/**
 * Reads image metadata using ExifTool via IPC
 * Falls back to a simulated response in web environment
 */
export async function readMetadata(filePath: string): Promise<any> {
  if (isWebBuild) {
    // Simulate metadata in web environment based on file extension
    const fileExt = filePath.toLowerCase().split('.').pop();
    
    if (fileExt === 'jpg' || fileExt === 'jpeg') {
      return {
        "FileType": "JPEG",
        "ImageWidth": 1920,
        "ImageHeight": 1080,
        "Make": "Web Simulation",
        "Model": "Simulated Camera",
        "Software": "DropTidy Web",
        "FileSize": "2.5 MB"
      };
    } else if (fileExt === 'png') {
      return {
        "FileType": "PNG",
        "ImageWidth": 1280,
        "ImageHeight": 720,
        "Software": "DropTidy Web",
        "FileSize": "1.2 MB"
      };
    } else {
      return {
        "FileType": fileExt?.toUpperCase() || "Unknown",
        "Software": "DropTidy Web",
        "FileSize": "Unknown"
      };
    }
  }
  
  try {
    if (getElectron()?.ipcRenderer) {
      return await getElectron().ipcRenderer.invoke('read-metadata', filePath);
    } else {
      throw new Error("Electron IPC not available");
    }
  } catch (error: unknown) {
    console.error("Error reading metadata:", error);
    toast({
      title: "Error",
      description: "Failed to read file metadata",
      variant: "destructive"
    });
    return {};
  }
}

/**
 * Creates a ZIP archive of multiple files
 * Falls back to a toast message in web environment
 */
export async function createZipExport(filePaths: string[]): Promise<string | undefined> {
  if (isWebBuild) {
    toast({
      title: "Web Version",
      description: "Creating ZIP archives is only available in the desktop app",
      variant: "default"
    });
    return undefined;
  }
  
  try {
    if (getElectron()?.ipcRenderer) {
      return await getElectron().ipcRenderer.invoke('create-zip', filePaths);
    } else {
      throw new Error("Electron IPC not available");
    }
  } catch (error: unknown) {
    console.error("Error creating ZIP:", error);
    toast({
      title: "Error",
      description: "Failed to create ZIP archive",
      variant: "destructive"
    });
    return undefined;
  }
}
