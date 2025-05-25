// Deklarácia pre window.electron
interface Window {
  electron?: {
    ipcRenderer: {
      invoke(channel: "clean-image", filePath: string): Promise<{
        success: boolean;
        originalSize?: number;
        cleanedSize?: number;
        metadata?: Record<string, string | number>;
        convertedPath?: string;
      }>;
      invoke(channel: "clean-video", input: string, outputPath: string): Promise<{
        success: boolean;
        originalSize?: number;
        cleanedSize?: number;
      }>;
      invoke(channel: "create-zip", files: string[]): Promise<{
        success: boolean;
        zipPath: string;
      }>;
      invoke(channel: "read-metadata", filePath: string): Promise<{
        success: boolean;
        metadata?: Record<string, any>;
      }>;
      invoke(channel: "open-folder", path: string): Promise<boolean>;
      invoke(channel: "load-settings"): Promise<{
        outputDir: string;
        autoOpenFolder: boolean;
      }>;
      invoke(channel: "save-settings", settings: any): Promise<boolean>;
      invoke(channel: "select-directory"): Promise<string | undefined>;
      // Autentifikačné metódy
      invoke(channel: "register-user", username: string, password: string): Promise<boolean>;
      invoke(channel: "login-user", username: string, password: string): Promise<boolean>;
      invoke(channel: "logout-user"): Promise<boolean>;
      invoke(channel: "check-auth"): Promise<{isLoggedIn: boolean, username: string | null}>;
      // Feedback 
      invoke(channel: "send-feedback", values: any): Promise<{
        success: boolean;
        savedLocally: boolean;
        error?: string;
      }>;
      // Generic invoke for any other channels
      invoke(channel: string, ...args: any[]): Promise<any>;
    };
    app: {
      getPath(name: 'home' | 'appData' | 'userData' | 'sessionData' | 'temp' | 'exe' | 'module' | 
                'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos' | 
                'recent' | 'logs' | 'crashDumps'): Promise<string>;
      showItemInFolder(path: string): Promise<void>;
      openFolder(path: string): Promise<boolean>;
    };
  };
  isElectronApp?: boolean;
  process?: {
    type: string;
  };
}
