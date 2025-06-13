/**
 * Interface for metadata removal functionality
 * This utility provides a simple interface for removing metadata from files
 */

export interface MetadataRemovalOptions {
  preserveColorProfile?: boolean;
  preserveOrientation?: boolean;
  outputQuality?: number; // For images (1-100)
}

/**
 * Removes metadata from a file
 * @param file - The file to process
 * @param options - Optional settings for metadata removal
 * @returns Promise that resolves when processing is complete
 */
export async function removeMetadata(
  file: File, 
  options: MetadataRemovalOptions = {}
): Promise<Blob> {
  try {
    // Check if we're in Electron environment
    if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
      // Electron environment - use IPC to call backend ExifTool
      const filePath = await saveFileTemporarily(file);
      const result = await window.electron.ipcRenderer.invoke('clean-image', filePath);
      
      if (!result) {
        throw new Error('Failed to process file with ExifTool');
      }
      
      // Parse the result and return as blob
      return new Blob([result], { type: file.type });
    } else {
      // Web environment - use client-side processing
      return await removeMetadataClientSide(file, options);
    }
  } catch (error) {
    console.error('Error removing metadata:', error);
    throw new Error(`Failed to remove metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Client-side metadata removal for web environment
 */
async function removeMetadataClientSide(
  file: File, 
  options: MetadataRemovalOptions
): Promise<Blob> {
  const { preserveOrientation = false, outputQuality = 90 } = options;

  if (file.type.startsWith('image/')) {
    return await processImageClientSide(file, preserveOrientation, outputQuality);
  } else if (file.type.startsWith('video/')) {
    // For videos, we can't easily strip metadata client-side
    // Return original file with warning
    console.warn('Video metadata removal requires Electron app');
    return file;
  } else {
    throw new Error('Unsupported file type for metadata removal');
  }
}

/**
 * Process image file to remove metadata client-side
 */
async function processImageClientSide(
  file: File, 
  preserveOrientation: boolean, 
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image to canvas (this strips metadata)
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        // Convert back to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          },
          file.type,
          quality / 100
        );
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Helper function for Electron environment
 */
async function saveFileTemporarily(file: File): Promise<string> {
  // Convert file to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Send to Electron backend for temporary saving
  const result = await window.electron?.ipcRenderer.invoke('save-temp-file', {
    name: file.name,
    data: Array.from(uint8Array)
  });
  
  return result.path;
}

/**
 * Download processed file
 */
export function downloadProcessedFile(blob: Blob, originalFileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  // Add "cleaned" prefix to filename
  const cleanFileName = `cleaned_${originalFileName}`;
  a.download = cleanFileName;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Type definitions for Electron IPC (if available)
declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        invoke(channel: string, data?: any): Promise<any>;
      };
    };
  }
}