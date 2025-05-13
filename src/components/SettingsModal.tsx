import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    openFolder: async (path: string): Promise<boolean> => {
      console.log('openFolder not available in web version', path);
      return false;
    },
    showItemInFolder: async (path: string): Promise<void> => {
      console.log('showItemInFolder not available in web version', path);
    },
    getPath: (type: string): string => {
      console.log('getPath not available in web version', type);
      return '/';
    }
  },
  ipcRenderer: {
    invoke: async <T = unknown>(channel: string, ...args: unknown[]): Promise<T> => {
      console.log(`ipcRenderer.invoke not available in web: ${channel}`, args);
      return null as unknown as T;
    }
  }
};

// Helper function to safely access Electron APIs
const getElectron = () => {
  return isWebBuild ? electronAPI : window.electron;
};

interface SettingsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  outputDir: string;
  setOutputDir: (path: string) => void;
  autoOpenFolder: boolean;
  setAutoOpenFolder: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsProps> = ({
  isOpen,
  onOpenChange,
  outputDir,
  setOutputDir,
  autoOpenFolder,
  setAutoOpenFolder
}) => {
  const { toast } = useToast();
  const [tempOutputDir, setTempOutputDir] = useState(outputDir);
  const [tempAutoOpenFolder, setTempAutoOpenFolder] = useState(autoOpenFolder);

  // Update temp values when props change (e.g. when settings are loaded)
  useEffect(() => {
    setTempOutputDir(outputDir);
    setTempAutoOpenFolder(autoOpenFolder);
  }, [outputDir, autoOpenFolder]);

  const handleSave = async () => {
    try {
      if (isWebBuild) {
        // Web version - store in localStorage
        try {
          localStorage.setItem('droptidy-settings', JSON.stringify({
            outputDir: tempOutputDir,
            autoOpenFolder: tempAutoOpenFolder
          }));
        } catch (e) {
          console.error('Failed to save settings to localStorage:', e);
          throw e; // Re-throw to be caught by outer try-catch
        }
      } else {
        // Electron version - save via IPC
        await getElectron().ipcRenderer.invoke('save-settings', {
          outputDir: tempOutputDir,
          autoOpenFolder: tempAutoOpenFolder
        });
      }
      
      // Update parent state
      setOutputDir(tempOutputDir);
      setAutoOpenFolder(tempAutoOpenFolder);
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated."
      });
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error saving settings",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSelectFolder = async () => {
    try {
      if (isWebBuild) {
        // Web version - show toast and use mock path
        toast({
          title: "Web Version Limitation",
          description: "Folder selection is only available in the desktop app. Using default location.",
          variant: "default"
        });
        setTempOutputDir("/Downloads/DropTidy");
        return;
      }

      // Electron version - use direct API call
      const selectedPath = await getElectron().ipcRenderer.invoke<string | null>('select-directory');
      
      if (selectedPath) {
        setTempOutputDir(selectedPath);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      toast({
        title: "Error selecting folder",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="outputDir">Output Directory</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-ellipsis overflow-hidden whitespace-nowrap">
                {tempOutputDir}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleSelectFolder} 
                disabled={isWebBuild}
                aria-label="Select output directory"
                title={isWebBuild ? "Not available in web version" : "Select output directory"}
              >
                <Folder className={`h-4 w-4 ${isWebBuild ? "opacity-50" : ""}`} />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="autoOpenFolder" className="cursor-pointer">Automatically open folder after cleaning</Label>
            <Switch 
              id="autoOpenFolder" 
              checked={tempAutoOpenFolder} 
              onCheckedChange={setTempAutoOpenFolder} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;