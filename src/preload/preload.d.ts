export {};

export interface IElectronAPI {
  ipcRenderer: {
    invoke(channel: 'clean-image', filePath: string): Promise<CleanResult>;
    invoke(channel: 'clean-video', input: string, outputPath: string): Promise<CleanResult>;
    invoke(channel: 'create-zip', files: string[]): Promise<string>;
    invoke(channel: 'read-metadata', filePath: string): Promise<any>; 
    invoke(channel: 'open-folder', folderPath: string): Promise<string>;
    invoke(channel: 'load-settings'): Promise<Settings>;
    invoke(channel: 'save-settings', settings: Settings): Promise<boolean>;
    invoke(channel: 'select-directory'): Promise<string | null>;
  };
  app: {
    getPath(name: string): Promise<string>;
    showItemInFolder(path: string): Promise<void>;
    openFolder(path: string): Promise<string>;
  };
}

export interface CleanResult {
  success: boolean;
  originalSize?: number;
  cleanedSize?: number;
  metadata?: Record<string, string | number>;
}

export interface Settings {
  outputDir: string;
  autoOpenFolder: boolean;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
