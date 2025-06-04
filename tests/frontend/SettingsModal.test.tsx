import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsModal from '@/components/SettingsModal';
import { mockIpcRenderer } from 'electron-mock-ipc';

// Mock the toasts
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the Electron IPC renderer
jest.mock('electron', () => ({
  ipcRenderer: mockIpcRenderer,
}));

describe('SettingsModal Component', () => {
  // Define test props
  const mockProps = {
    isOpen: true,
    onOpenChange: jest.fn(),
    outputDir: '/test/output/path',
    setOutputDir: jest.fn(),
    autoOpenFolder: true,
    setAutoOpenFolder: jest.fn(),
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup IPC mock
    global.window.electron = {
      ipcRenderer: {
        invoke: vi.fn().mockResolvedValue(true),
      },
    };
  });

  test('displays saved config values from props', () => {
    render(<SettingsModal {...mockProps} />);
    
    // Check if the output directory is displayed correctly
    expect(screen.getByText('/test/output/path')).toBeInTheDocument();
    
    // Check if the autoOpenFolder switch is checked
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  test('updates when new settings are saved', async () => {
    render(<SettingsModal {...mockProps} />);
    
    // Click save button
    fireEvent.click(screen.getByText('Save changes'));
    
    // Wait for async operations to complete
    await waitFor(() => {
      // Verify IPC call was made with the right arguments
      expect(global.window.electron.ipcRenderer.invoke).toHaveBeenCalledWith(
        'save-settings',
        {
          outputDir: '/test/output/path',
          autoOpenFolder: true,
        }
      );
      
      // Verify parent state is updated
      expect(mockProps.setOutputDir).toHaveBeenCalledWith('/test/output/path');
      expect(mockProps.setAutoOpenFolder).toHaveBeenCalledWith(true);
      
      // Dialog should close
      expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  test('allows selecting a new output directory', async () => {
    const selectedPath = '/new/selected/path';
    
    // Set up the mock to return the selected path for 'select-directory'
    global.window.electron.ipcRenderer.invoke.mockImplementation((channel, ...args) => {
      if (channel === 'select-directory') {
        return Promise.resolve(selectedPath);
      }
      return Promise.resolve(true);
    });
    
    render(<SettingsModal {...mockProps} />);
    
    // Click the select directory button
    const selectDirButton = screen.getByLabelText('Select output directory');
    fireEvent.click(selectDirButton);
    
    // Wait for the dialog result to be processed
    await waitFor(() => {
      expect(global.window.electron.ipcRenderer.invoke).toHaveBeenCalledWith('select-directory');
    });
    
    // Now click save
    fireEvent.click(screen.getByText('Save changes'));
    
    // Wait for save to complete and verify the new path was used
    await waitFor(() => {
      expect(global.window.electron.ipcRenderer.invoke).toHaveBeenCalledWith(
        'save-settings',
        expect.objectContaining({
          outputDir: selectedPath,
        })
      );
    });
  });

  test('toggles autoOpenFolder setting correctly', async () => {
    render(<SettingsModal {...mockProps} />);
    
    // Find and toggle the switch
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    
    // Now click save
    fireEvent.click(screen.getByText('Save changes'));
    
    // Wait for async operations and verify the toggled value is saved
    await waitFor(() => {
      expect(global.window.electron.ipcRenderer.invoke).toHaveBeenCalledWith(
        'save-settings',
        expect.objectContaining({
          autoOpenFolder: false,
        })
      );
    });
  });
});