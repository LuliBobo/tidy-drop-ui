// useDatabase.ts - React hook for using the database adapter
import { useState, useEffect } from 'react';
import { User, ImportResult, ExportResult } from '../backend/types';

/**
 * React hook for interacting with the database functionality
 */
export function useDatabase() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Export user data
   */
  const exportUserData = async (): Promise<ExportResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Show file save dialog
      const savePath = await (window.electron.ipcRenderer as any).invoke('select-directory');
      
      if (!savePath) {
        setIsLoading(false);
        return { success: false, message: 'Export cancelled' };
      }
      
      // Create export path with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const exportPath = `${savePath}/droptidy-users-export-${timestamp}.json`;
      
      // Call the export API
      const result = await (window.electron.ipcRenderer as any).invoke('export-user-data', exportPath);
      
      setIsLoading(false);
      return result;
    } catch (error) {
      setError(`Export failed: ${error}`);
      setIsLoading(false);
      return { success: false, message: `Export failed: ${error}` };
    }
  };
  
  /**
   * Import user data
   */
  const importUserData = async (mode: 'replace' | 'merge' = 'merge'): Promise<ImportResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Show file open dialog
      const openResult = await (window.electron.ipcRenderer as any).invoke('select-directory');
      
      if (!openResult) {
        setIsLoading(false);
        return { success: false, message: 'Import cancelled' };
      }
      
      // Call the import API
      const result = await (window.electron.ipcRenderer as any).invoke('import-user-data', openResult, mode);
      
      setIsLoading(false);
      return result;
    } catch (error) {
      setError(`Import failed: ${error}`);
      setIsLoading(false);
      return { success: false, message: `Import failed: ${error}` };
    }
  };
  
  return {
    exportUserData,
    importUserData,
    isLoading,
    error
  };
}

// Declare the electron API for TypeScript
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>;
      };
    };
  }
}
