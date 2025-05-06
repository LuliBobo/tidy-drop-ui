import { ipcMain, dialog } from 'electron';

// Mock electron ipcMain and dialog
jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
  },
  dialog: {
    showOpenDialog: jest.fn(),
  },
}));

describe('IPC Handlers', () => {
  let selectDirectoryHandler: (event: any) => Promise<string | null>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock the ipcMain.handle method to capture the handler function
    (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => {
      if (channel === 'select-directory') {
        selectDirectoryHandler = handler;
      }
    });
    
    // Register the handler (simulating what happens in main.ts)
    ipcMain.handle('select-directory', async () => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory']
      });
      
      if (!canceled && filePaths.length > 0) {
        return filePaths[0];
      }
      return null;
    });
  });

  test('should return selected directory path when dialog is confirmed', async () => {
    // Mock dialog.showOpenDialog to return a selected path
    const mockPath = '/selected/directory/path';
    (dialog.showOpenDialog as jest.Mock).mockResolvedValue({
      canceled: false,
      filePaths: [mockPath]
    });
    
    // Call the handler function (would be called when renderer process invokes the channel)
    const result = await selectDirectoryHandler({});
    
    // Verify the expected path is returned
    expect(result).toBe(mockPath);
    expect(dialog.showOpenDialog).toHaveBeenCalledWith({
      properties: ['openDirectory', 'createDirectory']
    });
  });
  
  test('should return null when dialog is canceled', async () => {
    // Mock dialog.showOpenDialog to simulate user cancellation
    (dialog.showOpenDialog as jest.Mock).mockResolvedValue({
      canceled: true,
      filePaths: []
    });
    
    // Call the handler function
    const result = await selectDirectoryHandler({});
    
    // Verify null is returned when dialog is canceled
    expect(result).toBe(null);
  });

  test('should return null when no directories are selected', async () => {
    // Mock dialog.showOpenDialog to return no paths (edge case)
    (dialog.showOpenDialog as jest.Mock).mockResolvedValue({
      canceled: false,
      filePaths: []
    });
    
    // Call the handler function
    const result = await selectDirectoryHandler({});
    
    // Verify null is returned when no directories are selected
    expect(result).toBe(null);
  });
});