import { ipcRenderer } from 'electron';

export function sendMessage(channel: string, message: any) {
  ipcRenderer.send(channel, message);
}

export function listenForResponse(channel: string, callback: (response: any) => void) {
  ipcRenderer.on(channel, (_, response) => callback(response));
}