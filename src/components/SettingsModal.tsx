import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      // Save the settings to config file via IPC
      await window.electron.ipcRenderer.invoke('save-settings', {
        outputDir: tempOutputDir,
        autoOpenFolder: tempAutoOpenFolder
      });
      
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
      const selectedPath = await window.electron.ipcRenderer.invoke('select-directory');
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
                aria-label="Select output directory"
              >
                <Folder className="h-4 w-4" />
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