import { app, BrowserWindow, ipcMain, shell, session, dialog } from 'electron';
import { initialize, enable } from '@electron/remote/main';
import * as path from 'path';
import * as fs from 'fs-extra';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { cleanImage, cleanVideo, createZipExport, readMetadata } from '../backend/cleaner';
import { electronLog } from '../backend/logger';

// Vypnutie hardvérovej akcelerácie ak je potrebné
app.disableHardwareAcceleration();

// V prípade zlyhania GPU procesov
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializácia remote modulu
initialize();

// Path to the app's configuration directory
const APP_DATA_DIR = path.join(app.getPath('userData'), 'DropTidy');
const CONFIG_PATH = path.join(APP_DATA_DIR, 'config.json');

// Make sure the app data directory exists
if (!fs.existsSync(APP_DATA_DIR)) {
  fs.mkdirSync(APP_DATA_DIR, { recursive: true });
}

// Settings interface
interface AppSettings {
  outputDir: string;
  autoOpenFolder: boolean;
}

// Default settings values
const DEFAULT_SETTINGS: AppSettings = {
  outputDir: path.join(app.getPath('home'), 'Cleaned'),
  autoOpenFolder: false
};

// Load settings from config file or create with defaults if it doesn't exist
function loadSettings(): AppSettings {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const settingsData = fs.readFileSync(CONFIG_PATH, 'utf8');
      const settings = JSON.parse(settingsData);
      return { ...DEFAULT_SETTINGS, ...settings };
    }
    return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }
// Save settings to config file
function saveSettings(settings: AppSettings) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

// Load settings on startup
const appSettings = loadSettings();

// Konfigurácia výstupného adresára - now uses settings value
const OUTPUT_DIR = appSettings.outputDir;

// Vytvorenie výstupného adresára ak neexistuje
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Pomocná funkcia pre konverziu blob URL na dočasný súbor
export async function blobUrlToTempFile(blobUrl: string, fileName: string): Promise<string> {
  const response = await fetch(blobUrl);
  const buffer = await response.arrayBuffer();
  const tempPath = path.join(app.getPath('temp'), fileName);
  await fs.writeFile(tempPath, Buffer.from(buffer));
  return tempPath;
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    backgroundColor: '#ffffff',
    paintWhenInitiallyHidden: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(path.dirname(__dirname), 'preload/preload.js'),
      backgroundThrottling: false,
      offscreen: false,
      spellcheck: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  enable(mainWindow.webContents);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(path.dirname(__dirname), 'index.html'));
  }

  // Obsluha zlyhaní a zamrznutí okna pomocou IPC
  ipcMain.on('renderer-crash', () => {
    console.error('Okno zlyhalo! Reštartujem...');
    mainWindow.destroy();
    createWindow();
  });

  ipcMain.on('renderer-hang', () => {
    console.error('Okno neodpovedá! Reštartujem...');
    mainWindow.destroy();
    createWindow();
  });

  // Monitorovanie stavu okna
  mainWindow.on('unresponsive', () => {
    ipcMain.emit('renderer-hang');
  });

  return mainWindow;
}

app.whenReady().then(() => {
  // Configure network security: Block all outgoing network requests
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    // Allow local file access
    if (details.url.startsWith('file:') || 
        details.url.startsWith('devtools:') || 
        // Allow localhost in development mode only
        (process.env.NODE_ENV === 'development' && details.url.includes('localhost')) ||
        // Allow feedback webhook
        (process.env.FEEDBACK_WEBHOOK_URL && details.url.startsWith(process.env.FEEDBACK_WEBHOOK_URL)) ||
        // Allow specific external resources
        details.url.startsWith('https://cdn.gpteng.co/') ||
        details.url.includes('images.unsplash.com')) {
      return callback({ cancel: false });
    }
    
    // Block all other HTTP/HTTPS requests
    if (details.url.startsWith('http')) {
      console.log('Blocked network request:', details.url);
      return callback({ cancel: true });
    }
    
    // Allow other protocols
    callback({ cancel: false });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Existing IPC handlers
ipcMain.handle('clean-image', async (_, filePath: string) => {
  return await cleanImage(filePath);
});

ipcMain.handle('clean-video', async (_, input: string, output: string) => {
  return await cleanVideo(input, output);
});

ipcMain.handle('create-zip', async (_, files: string[]) => {
  return await createZipExport(files);
});

ipcMain.handle('read-metadata', async (_, filePath: string) => {
  return await readMetadata(filePath);
});

ipcMain.handle('open-folder', async (_, folderPath: string) => {
  try {
    return await shell.openPath(folderPath);
  } catch (error) {
    console.error('Error opening folder:', error);
    return (error as Error).message;
  }
});

// New IPC handlers for settings management
ipcMain.handle('get-path', (_, name) => {
  return app.getPath(name);
});

ipcMain.handle('show-item-in-folder', (_, path) => {
  return shell.showItemInFolder(path);
});

// Load settings from config file
ipcMain.handle('load-settings', () => {
  return loadSettings();
});

// Save settings to config file
ipcMain.handle('save-settings', (_, settings) => {
  // Create output directory if it doesn't exist
  if (settings.outputDir && !fs.existsSync(settings.outputDir)) {
    fs.mkdirSync(settings.outputDir, { recursive: true });
  }
  
  return saveSettings(settings);
});

// Open dialog to select directory
ipcMain.handle('select-directory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory']
  });
  
  if (!canceled && filePaths.length > 0) {
    return filePaths[0];
  }
  return null;
});

// Add the new IPC handler for sending feedback to an external platform
ipcMain.handle('send-feedback', async (_, feedback) => {
  try {
    // Log the feedback locally first (useful for debugging)
    electronLog.info(`Feedback received: ${JSON.stringify(feedback)}`);
    
    // Use the webhook URL from environment variables or a default one
    // In production, this should be set in your build environment
    const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL || 'https://your-webhook-url.com';
    
    // Send data to the external platform
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...feedback,
        timestamp: new Date().toISOString(),
        appVersion: app.getVersion(),
        platform: process.platform
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send feedback: ${response.status} - ${errorText}`);
    }
    
    electronLog.info('Feedback sent successfully');
    return { success: true };
  } catch (error) {
    electronLog.error(`Error sending feedback: ${error}`);
    // If there's an error sending feedback online, save it locally as a fallback
    try {
      const feedbacksDir = path.join(APP_DATA_DIR, 'feedback');
      if (!fs.existsSync(feedbacksDir)) {
        fs.mkdirSync(feedbacksDir, { recursive: true });
      }
      
      const feedbackFile = path.join(
        feedbacksDir, 
        `feedback-${new Date().toISOString().replace(/:/g, '-')}.json`
      );
      
      fs.writeFileSync(
        feedbackFile, 
        JSON.stringify({
          ...feedback,
          timestamp: new Date().toISOString(),
          appVersion: app.getVersion(),
          platform: process.platform,
          saveReason: `${error}`
        }, null, 2)
      );
      
      electronLog.info(`Feedback saved locally to ${feedbackFile}`);
      return { success: true, savedLocally: true };
    } catch (localError) {
      electronLog.error(`Error saving feedback locally: ${localError}`);
      return { success: false, error: `${error}. Additionally, failed to save locally: ${localError}` };
    }
  }
});