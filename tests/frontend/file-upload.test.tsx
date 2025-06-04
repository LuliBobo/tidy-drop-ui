import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, jest } from '@jest/globals';
import React from 'react';

// Mock component for testing
const FileUploadComponent = ({ onFileSelect }: { onFileSelect?: (file: File) => void }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div>
      <h1>File Upload</h1>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        data-testid="file-input"
      />
      <button type="button">Upload File</button>
    </div>
  );
};

describe('FileUploadComponent', () => {
  test('should render file upload interface', () => {
    render(<FileUploadComponent />);
    
    expect(screen.getByText('File Upload')).toBeInTheDocument();
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload File' })).toBeInTheDocument();
  });

  test('should accept image and video files', () => {
    render(<FileUploadComponent />);
    
    const fileInput = screen.getByTestId('file-input');
    expect(fileInput).toHaveAttribute('accept', 'image/*,video/*');
  });

  test('should call onFileSelect when file is selected', async () => {
    const mockOnFileSelect = jest.fn();
    render(<FileUploadComponent onFileSelect={mockOnFileSelect} />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });
  });

  test('should handle file input without onFileSelect callback', () => {
    render(<FileUploadComponent />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    
    // Should not throw error when no callback is provided
    expect(() => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }).not.toThrow();
  });
});
