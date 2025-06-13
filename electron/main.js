const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFile } = require('child_process');

let mainWindow;

// Temp directory for processing files
const TEMP_DIR = path.join(os.tmpdir(), 'droptidy');

// Create temp directory if it doesn't exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // In production, use the built app
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    // In development, load from the dev server
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
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

// IPC handlers
ipcMain.handle('save-temp-file', async (event, { name, data }) => {
  const tempFilePath = path.join(TEMP_DIR, name);
  
  // Convert array back to buffer
  const buffer = Buffer.from(data);
  
  // Write to temp file
  fs.writeFileSync(tempFilePath, buffer);
  
  return { path: tempFilePath };
});

// Clean image metadata using ExifTool
ipcMain.handle('clean-image', async (event, filePath) => {
  try {
    // Generate output file path
    const parsedPath = path.parse(filePath);
    const outputPath = path.join(TEMP_DIR, `cleaned_${parsedPath.name}${parsedPath.ext}`);
    
    return new Promise((resolve, reject) => {
      // Use ExifTool to remove all metadata
      // Note: ExifTool must be installed on the system
      const exiftool = process.platform === 'win32' ? 'exiftool.exe' : 'exiftool';
      
      execFile(exiftool, [
        '-all=',      // Remove all metadata
        '-tagsFromFile', '@',   // Copy some tags from original file
        '-colorspace', // Preserve colorspace
        '-icc_profile',  // Preserve ICC profile
        '-o', outputPath,  // Output file
        filePath          // Input file
      ], (error) => {
        if (error) {
          console.error('ExifTool error:', error);
          reject(error);
          return;
        }
        
        // Read the processed file
        try {
          const cleanedFile = fs.readFileSync(outputPath);
          // Clean up temp files
          fs.unlinkSync(outputPath);
          resolve(cleanedFile);
        } catch (err) {
          reject(err);
        }
      });
    });
  } catch (error) {
    console.error('Error cleaning image:', error);
    throw error;
  }
});

// Clean video metadata - more complex process
ipcMain.handle('clean-video', async (event, inputPath, outputPath) => {
  try {
    return new Promise((resolve, reject) => {
      // Use FFmpeg to strip metadata from video
      // Note: FFmpeg must be installed on the system
      const ffmpeg = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
      
      execFile(ffmpeg, [
        '-i', inputPath,
        '-map_metadata', '-1',     // Remove all metadata
        '-c:v', 'copy',           // Copy video stream without re-encoding
        '-c:a', 'copy',           // Copy audio stream without re-encoding
        outputPath
      ], (error) => {
        if (error) {
          console.error('FFmpeg error:', error);
          reject(error);
          return;
        }
        
        resolve(true);
      });
    });
  } catch (error) {
    console.error('Error cleaning video:', error);
    throw error;
  }
});
