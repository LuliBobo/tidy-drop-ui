import '@testing-library/jest-dom';

// Mock the IPC renderer
import { mockIpcRenderer } from 'electron-mock-ipc';
import { vi } from 'vitest';

// Mock Electron IPC
vi.mock('electron', () => ({
  ipcRenderer: mockIpcRenderer,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Setup any global test utilities here