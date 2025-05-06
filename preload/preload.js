import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electron", {
  // Zabezpečená IPC komunikácia
  ipcRenderer: {
    invoke: async (channel, ...args) => {
      const validChannels = [
        "clean-image",
        "clean-video",
        "create-zip",
        "read-metadata",
        "open-folder",
        "load-settings",
        "save-settings",
        "select-directory"
      ];
      if (validChannels.includes(channel)) {
        return await ipcRenderer.invoke(channel, ...args);
      }
      throw new Error(`Invalid channel: ${channel}`);
    }
  },
  // Bezpečný prístup k systémovým cestám
  app: {
    getPath: (name) => ipcRenderer.invoke("get-path", name),
    showItemInFolder: (path) => ipcRenderer.invoke("show-item-in-folder", path),
    openFolder: (path) => ipcRenderer.invoke("open-folder", path)
  }
});
