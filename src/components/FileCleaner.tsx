import { app, BrowserWindow } from 'electron';
import * as path from 'path';
cleaning' | 'success' | 'error';
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {tatus;
      // Nastav správnu cestu k preloženému preload.js
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,seState<FileItem[]>([]);
    },
  });t handleDrop = (acceptedFiles: File[]) => {
onst newFiles: FileItem[] = acceptedFiles.map((f) => ({
  // win.loadURL(...);      file: f,
} ⚠️ Toto funguje len v Electron, nie v čistom prehliadači
     status: 'idle',
app.whenReady().then(createWindow);    let success = false;
    try {
      if (isImage) {
        success = await window.electron.ipcRenderer.invoke('clean-image', fileItem.path);
      } else if (isVideo) {
        const output = fileItem.path.replace(/(\.\w+)$/, '_cleaned$1');
        success = await window.electron.ipcRenderer.invoke('clean-video', fileItem.path, output);
      }
    } catch {
      success = false;
    }

    updateStatus(fileItem.path, success ? 'success' : 'error');
  };

  return (
    <div className="space-y-4 p-4">
      {/* Dropzone implementuj podľa potreby, napr. react-dropzone */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => files.forEach(handleClean)}
      >
        Vyčistiť Meta Dáta
      </button>

      <ul className="space-y-2">
        {files.map(({ file, status }) => (
          <li
            key={file.path}
            className="flex justify-between items-center p-2 border rounded"
          >
            <span>{file.name}</span>
            <span>
              {status === 'idle' && '🕒 Čaká...'}
              {status === 'cleaning' && '🔄 Čistenie...'}
              {status === 'success' && '✅ Hotovo'}
              {status === 'error' && '❌ Chyba'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};