import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

// Web-safe way to determine if we're in web build
const isWebBuild = true; // Always true in the web version file

/**
 * A hook that provides access to electronAPI with fallbacks for web environment
 */
export function useElectronAPI() {
  const [api] = useState({
    isWeb: true,
    isElectron: false
  });
  
  return api;
}

/**
 * Opens a folder dialog and returns the selected folder paths
 * Falls back to a toast message in web environment
 */
export async function openFolder(): Promise<boolean> {
  toast({
    title: "Web Version",
    description: "Opening folders is only available in the desktop app",
    variant: "default"
  });
  return false;
}

/**
 * Shows an item in the system file explorer
 * Falls back to a toast message in web environment
 */
export async function showItemInFolder(filePath: string): Promise<void> {
  toast({
    title: "Web Version",
    description: "Showing files in folder is only available in the desktop app",
    variant: "default"
  });
  return;
}

/**
 * Gets a path from the system
 * Falls back to a reasonable default in web environment
 */
export async function getPath(name: string): Promise<string> {
  // Web fallbacks for common path types
  switch (name) {
    case 'desktop':
      return '/Desktop';
    case 'documents':
      return '/Documents';
    case 'downloads':
      return '/Downloads';
    case 'pictures':
      return '/Pictures';
    case 'userData':
      return '/User_Data';
    default:
      return '';
  }
}

/**
 * Writes data to a file
 * Falls back to a toast message in web environment
 */
export async function writeFile(path: string, data: string): Promise<void> {
  toast({
    title: "Web Version",
    description: "File operations are only available in the desktop app",
    variant: "default"
  });
  return;
}

/**
 * Reads data from a file
 * Falls back to a toast message in web environment
 */
export async function readFile(path: string): Promise<string> {
  toast({
    title: "Web Version",
    description: "File operations are only available in the desktop app",
    variant: "default"
  });
  return "";
}

/**
 * Save data to persistent storage
 * Uses localStorage in web environment
 */
export async function saveData(data: any): Promise<boolean> {
  try {
    localStorage.setItem("dropTidy_userData", JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error saving data:", error);
    toast({
      title: "Error",
      description: "Failed to save data",
      variant: "destructive"
    });
    return false;
  }
}

/**
 * Load data from persistent storage
 * Uses localStorage in web environment
 */
export async function loadData(): Promise<any> {
  try {
    const data = localStorage.getItem("dropTidy_userData");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading data:", error);
    toast({
      title: "Error", 
      description: "Failed to load data",
      variant: "destructive"
    });
    return null;
  }
}
