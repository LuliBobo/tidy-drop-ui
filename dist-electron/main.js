import { app, BrowserWindow, ipcMain, dialog, session } from "electron";
import * as path from "path";
process.env.NODE_ENV = process.env.NODE_ENV || "development";
function createWindow() {
  session.defaultSession.clearCache();
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Nastav správnu cestu k preloženému preload.js
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
      // Vypnutie zabezpečenia webu pre vývoj
    }
  });
  win.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({
      requestHeaders: {
        ...details.requestHeaders,
        "User-Agent": "Chrome"
      }
    });
  });
  if (process.env.NODE_ENV === "development") {
    win.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
      console.error("Failed to load URL:", errorCode, errorDescription);
      setTimeout(() => {
        console.log("Attempting to reload...");
        win.loadURL("http://localhost:5173");
      }, 1e3);
    });
    console.log("Loading development URL: http://localhost:5173");
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../index.html"));
  }
}
app.whenReady().then(() => {
  app.commandLine.appendSwitch("ignore-certificate-errors");
  app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");
  createWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.handle("select-output-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"]
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});
