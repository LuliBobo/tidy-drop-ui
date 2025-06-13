declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: string, ...args: unknown[]): Promise<unknown>;
      };
    };
  }
}

export {};