export type PathName = 'home' | 'appData' | 'userData' | 'sessionData' | 'temp' | 'exe' | 'module' | 
                'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | 
                'recent' | 'logs' | 'crashDumps';

export interface CleanResult {
  success: boolean;
  originalSize?: number;
  cleanedSize?: number;
  metadata?: { [key: string]: string | number };
}

export interface ElectronAPI {
  ipcRenderer: {
    invoke(channel: 'clean-image', filePath: string): Promise<CleanResult>;
    invoke(channel: 'clean-video', input: string, outputPath: string): Promise<CleanResult>;
    invoke(channel: 'create-zip', files: string[]): Promise<string>;
    invoke(channel: 'load-settings'): Promise<{ outputDir: string; autoOpenFolder: boolean }>;
    invoke(channel: 'save-settings', settings: { outputDir: string; autoOpenFolder: boolean }): Promise<boolean>;
    invoke(channel: 'select-directory'): Promise<string | null>;
  };
  app: {
    getPath(name: PathName): string;
    showItemInFolder(path: string): void;
    openFolder(path: string): void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
