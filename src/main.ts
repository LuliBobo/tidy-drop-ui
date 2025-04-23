import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import './main/ipcHandlers';
import * as path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Nastav správnu cestu k preloženému preload.js
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // win.loadURL(...);
}

app.whenReady().then(createWindow);

ipcMain.handle('select-output-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0]; // path to selected folder
});

// ...rest of your main process code...