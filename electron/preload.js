const { contextBridge, ipcRenderer } = require('electron');

// List of allowed IPC channels for security
const validChannels = [
  'clean-image',
  'clean-video',
  'save-temp-file'
];

// Expose protected methods that allow the renderer process to use IPC
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, data) => {
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
      
      throw new Error(`Unauthorized IPC channel: ${channel}`);
    }
  }
});
