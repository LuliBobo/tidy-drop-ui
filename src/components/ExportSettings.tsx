import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Folder, Download, AlertCircle } from 'lucide-react';
import { isElectron, isWeb, importElectron, safeIpcInvoke } from '@/lib/environment';
import { toast } from '@/hooks/use-toast';

// Define types for our component props and state
interface ExportSettingsProps {
  title?: string;
  onSettingsChange?: (settings: UserSettings) => void;
}

interface UserSettings {
  exportPath?: string;
  autoExport: boolean;
  exportFormat: 'png' | 'jpg' | 'webp';
  quality: number;
}

/**
 * Example component that demonstrates cross-platform patterns
 * This component handles export settings which require filesystem access in Electron
 * but gracefully degrades to web-compatible alternatives when running in a browser
 * but provides web alternatives when running in a browser
 */
export function ExportSettings({ title = 'Export Settings' }: ExportSettingsProps) {
  // State for settings
  const [settings, setSettings] = useState<UserSettings>({
    exportPath: '',
    autoExport: false,
    exportFormat: 'png',
    quality: 90
  });
  
  // Track environment
  const [isElectronEnv, setIsElectronEnv] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load settings based on environment
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      
      // First explicitly check for web build (most reliable)
      if (import.meta.env.VITE_IS_WEB_BUILD === 'true') {
        // In web build, load settings from localStorage
        try {
          const savedSettings = localStorage.getItem('exportSettings');
          if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
          }
          setIsElectronEnv(false);
        } catch (error) {
          console.error('Error loading settings from localStorage:', error);
          toast({
            title: 'Error',
            description: 'Failed to load settings from browser storage.',
            variant: 'destructive'
          });
        }
      } else {
        // Detect environment using our utility
        const electronEnvironment = isElectron();
        setIsElectronEnv(electronEnvironment);
        
        if (electronEnvironment) {
          // In Electron, load settings using IPC
          try {
            const loadedSettings = await safeIpcInvoke<UserSettings>(
              'load-settings',
              ['export'],
              // Web fallback (in case environment detection is wrong)
              async () => {
                const savedSettings = localStorage.getItem('exportSettings');
                return savedSettings ? JSON.parse(savedSettings) : settings;
              }
            );
            
            if (loadedSettings) {
              setSettings(loadedSettings);
            }
          } catch (error) {
            console.error('Error loading settings via IPC:', error);
            toast({
              title: 'Error',
              description: 'Failed to load export settings.',
              variant: 'destructive'
            });
          }
        } else {
          // Web environment detected through utility
          try {
            const savedSettings = localStorage.getItem('exportSettings');
            if (savedSettings) {
              setSettings(JSON.parse(savedSettings));
            }
          } catch (error) {
            console.error('Error loading settings from localStorage:', error);
          }
        }
      }
      
      setIsLoading(false);
    };
    
    loadSettings();
  }, []);
  
  // Save settings based on environment
  const saveSettings = async () => {
    try {
      if (isElectronEnv) {
        // In Electron, save via IPC
        await safeIpcInvoke(
          'save-settings', 
          ['export', settings],
          // Web fallback
          async () => {
            localStorage.setItem('exportSettings', JSON.stringify(settings));
            return { success: true };
          }
        );
        
        toast({
          title: 'Success',
          description: 'Export settings saved successfully.',
          variant: 'default'
        });
      } else {
        // In web, save to localStorage
        localStorage.setItem('exportSettings', JSON.stringify(settings));
        
        toast({
          title: 'Success',
          description: 'Export settings saved to browser storage.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save export settings.',
        variant: 'destructive'
      });
    }
  };
  
  // Handle folder selection (Electron only)
  const selectExportFolder = async () => {
    if (!isElectronEnv) {
      toast({
        title: 'Web Environment',
        description: 'Folder selection is only available in the desktop app.',
        variant: 'default'
      });
      return;
    }
    
    try {
      const selectedPath = await safeIpcInvoke<string>(
        'select-directory',
        ['Select export folder'],
        // Web fallback (shouldn't be reached due to isElectronEnv check)
        async () => {
          console.warn('Folder selection attempted in web environment');
          return '';
        }
      );
      
      if (selectedPath) {
        setSettings(prev => ({ ...prev, exportPath: selectedPath }));
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      toast({
        title: 'Error',
        description: 'Failed to select export folder.',
        variant: 'destructive'
      });
    }
  };
  
  // Handle format change
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ 
      ...prev, 
      exportFormat: e.target.value as 'png' | 'jpg' | 'webp' 
    }));
  };
  
  // Handle quality change
  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ 
      ...prev, 
      quality: parseInt(e.target.value, 10) 
    }));
  };
  
  // Toggle auto export
  const toggleAutoExport = () => {
    setSettings(prev => ({ ...prev, autoExport: !prev.autoExport }));
  };
  
  // Display adaptive UI based on environment
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {isElectronEnv 
            ? "Configure where and how files are exported" 
            : "Configure export settings (limited options available in web version)"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center">Loading settings...</div>
        ) : (
          <>
            {/* Export Path - Only fully functional in Electron */}
            <div className="space-y-2">
              <label htmlFor="exportPath" className="text-sm font-medium">
                Export Location
              </label>
              <div className="flex space-x-2">
                <input
                  id="exportPath"
                  type="text"
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                  value={settings.exportPath}
                  placeholder={isElectronEnv ? "Select a folder..." : "Not available in web version"}
                  disabled={!isElectronEnv}
                  onChange={(e) => setSettings(prev => ({ ...prev, exportPath: e.target.value }))}
                />
                <Button 
                  onClick={selectExportFolder} 
                  disabled={!isElectronEnv}
                  variant="outline"
                  size="sm"
                >
                  Browse...
                </Button>
              </div>
              {!isElectronEnv && (
                <p className="text-xs text-muted-foreground">
                  ⓘ Folder selection requires the desktop application
                </p>
              )}
            </div>
            
            {/* Format Selection - Works in both environments */}
            <div className="space-y-2">
              <label htmlFor="format" className="text-sm font-medium">
                Export Format
              </label>
              <select
                id="format"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={settings.exportFormat}
                onChange={handleFormatChange}
              >
                <option value="png">PNG</option>
                <option value="jpg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            
            {/* Quality Slider - Works in both environments */}
            <div className="space-y-2">
              <label htmlFor="quality" className="text-sm font-medium">
                Quality: {settings.quality}%
              </label>
              <input
                id="quality"
                type="range"
                min="10"
                max="100"
                step="5"
                className="w-full"
                value={settings.quality}
                onChange={handleQualityChange}
              />
            </div>
            
            {/* Auto Export Toggle - Works in both but with different behaviors */}
            <div className="flex items-center space-x-2">
              <input
                id="autoExport"
                type="checkbox"
                className="rounded"
                checked={settings.autoExport}
                onChange={toggleAutoExport}
              />
              <label htmlFor="autoExport" className="text-sm font-medium">
                Automatically export after processing
              </label>
            </div>
            
            {/* Environment-specific notes */}
            {!isElectronEnv && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                <p className="font-medium">Web Version Limitations</p>
                <p className="mt-1">
                  Some features like automatic file system export are only available in the desktop version. 
                  <a href="https://droptidy.com/download" className="font-medium underline ml-1">
                    Download the desktop app
                  </a>
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={saveSettings} 
          disabled={isLoading}
          className="w-full"
        >
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ExportSettings;
