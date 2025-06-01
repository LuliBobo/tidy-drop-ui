// Web-based file cleaning utilities for browser environment
// This provides fallback functionality when Electron APIs are not available

import JSZip from 'jszip';

interface CleanResult {
  success: boolean;
  originalSize: number;
  cleanedSize: number;
  metadata?: { [key: string]: string | number };
  error?: string;
  cleanedBlob?: Blob;
}

/**
 * Remove EXIF metadata from JPEG images using canvas
 */
export async function cleanImageMetadata(file: File): Promise<CleanResult> {
  try {
    const originalSize = file.size;
    
    // For non-image files, return error
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        originalSize,
        cleanedSize: 0,
        error: 'File is not an image'
      };
    }

    // Create image element to load the file
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return {
        success: false,
        originalSize,
        cleanedSize: 0,
        error: 'Canvas context not available'
      };
    }

    // Load image and process it
    const imageLoadPromise = new Promise<CleanResult>((resolve) => {
      img.onload = () => {
        try {
          // Set canvas dimensions to match image
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          
          // Draw image to canvas (this strips EXIF data)
          ctx.drawImage(img, 0, 0);
          
          // Convert canvas back to blob
          canvas.toBlob((blob) => {
            if (blob) {
              const cleanedSize = blob.size;
              const sizeDifference = originalSize - cleanedSize;
              const percentReduction = ((sizeDifference / originalSize) * 100);
              
              resolve({
                success: true,
                originalSize,
                cleanedSize,
                cleanedBlob: blob,
                metadata: {
                  'File Type': file.type,
                  'Original Size (KB)': Math.round(originalSize / 1024 * 100) / 100,
                  'Cleaned Size (KB)': Math.round(cleanedSize / 1024 * 100) / 100,
                  'Size Reduction (KB)': Math.round(sizeDifference / 1024 * 100) / 100,
                  'Size Reduction (%)': Math.round(percentReduction * 100) / 100,
                  'Image Width': img.naturalWidth,
                  'Image Height': img.naturalHeight,
                  'Megapixels': Math.round((img.naturalWidth * img.naturalHeight / 1000000) * 100) / 100,
                  'Cleaning Method': 'Canvas redraw (removes all EXIF data)',
                  'Status': 'Successfully cleaned'
                }
              });
            } else {
              resolve({
                success: false,
                originalSize,
                cleanedSize: 0,
                error: 'Failed to create cleaned image blob'
              });
            }
          }, 'image/jpeg', 0.95); // High quality JPEG output
        } catch (error) {
          resolve({
            success: false,
            originalSize,
            cleanedSize: 0,
            error: error instanceof Error ? error.message : 'Unknown error during image processing'
          });
        }
      };
      
      img.onerror = () => {
        resolve({
          success: false,
          originalSize,
          cleanedSize: 0,
          error: 'Failed to load image'
        });
      };
    });

    // Create object URL and load image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    
    const result = await imageLoadPromise;
    
    // Clean up object URL
    URL.revokeObjectURL(objectUrl);
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      originalSize: file.size,
      cleanedSize: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Basic video metadata removal (limited in browser environment)
 * Note: Full video metadata removal requires server-side processing
 */
export async function cleanVideoMetadata(file: File): Promise<CleanResult> {
  const originalSize = file.size;
  
  // In browser environment, we can't actually remove video metadata
  // This is a placeholder that returns the original file
  // In a real implementation, you would need server-side processing
  
  try {
    // Create a new blob from the file (this doesn't actually clean metadata)
    const cleanedBlob = new Blob([file], { type: file.type });
    
    return {
      success: true,
      originalSize,
      cleanedSize: cleanedBlob.size,
      cleanedBlob,
      metadata: {
        'File Type': file.type,
        'Original Size (KB)': Math.round(originalSize / 1024 * 100) / 100,
        'File Size (MB)': Math.round(originalSize / 1024 / 1024 * 100) / 100,
        'Processing Method': 'Browser limitation - video metadata removal requires server-side processing',
        'Recommendation': 'For full video metadata removal, use the Electron desktop version',
        'Status': 'File copied (metadata not removed)',
        'Note': 'Web browsers cannot modify video file metadata directly'
      }
    };
  } catch (error) {
    return {
      success: false,
      originalSize,
      cleanedSize: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Create a ZIP file containing cleaned files
 */
export async function createCleanedFilesZip(cleanedFiles: { name: string; blob: Blob }[]): Promise<Blob> {
  const zip = new JSZip();
  
  // Add each cleaned file to the ZIP
  cleanedFiles.forEach((file, index) => {
    const cleanedName = `cleaned_${index + 1}_${file.name}`;
    zip.file(cleanedName, file.blob);
  });
  
  // Generate the ZIP file
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Download a file in the browser
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Check if we're running in a web environment (not Electron)
 */
export function isWebEnvironment(): boolean {
  return typeof window !== 'undefined' && !window.electron;
}

/**
 * Get a temporary output directory path for web environment
 */
export function getWebOutputDir(): string {
  return 'Downloads'; // Browser downloads folder
}

/**
 * Web-compatible folder opening (opens downloads folder)
 */
export function openWebFolder(): void {
  // In web environment, we can't directly open folders
  // Show a notification instead
  console.log('Files will be downloaded to your Downloads folder');
}
