import { contextBridge, ipcRenderer } from 'electron';

// Exponovanie bezpečného rozhrania pre renderer proces
contextBridge.exposeInMainWorld('electron', {
  // Zabezpečená IPC komunikácia
  ipcRenderer: {
    invoke: async (channel: string, ...args: unknown[]) => {
      const validChannels = [
        'clean-image', 
        'clean-video', 
        'create-zip', 
        'read-metadata', 
        'open-folder', 
        'load-settings', 
        'save-settings',
        'select-directory',
        // Autentifikačné kanály
        'register-user',
        'login-user',
        'logout-user',
        'check-auth',
        // Admin kanály
        'get-all-users',
        'update-user',
        'delete-user',
        'get-user-role',
        // Reset hesla
        'initiate-password-reset',
        'complete-password-reset'
      ];
      if (validChannels.includes(channel)) {
        return await ipcRenderer.invoke(channel, ...args);
      }
      throw new Error(`Invalid channel: ${channel}`);
    },
  },
  // Bezpečný prístup k systémovým cestám
  app: {
    getPath: (name: string) => ipcRenderer.invoke('get-path', name),
    showItemInFolder: (path: string) => ipcRenderer.invoke('show-item-in-folder', path),
    openFolder: (path: string) => ipcRenderer.invoke('open-folder', path),
  }
});

export {};