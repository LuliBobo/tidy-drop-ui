import React, { useState, useCallback } from 'react';
import { removeMetadata, downloadProcessedFile } from '../utils/removeMetadata';

interface FileWithPreview extends File {
  preview?: string;
  processed?: boolean;
}

export const Dropzone: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [processing, setProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    );
    setFiles(filesWithPreview);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    onDrop(droppedFiles);
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    try {
      const updatedFiles = [...files];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const processedBlob = await removeMetadata(file);
        
        // Download the processed file
        downloadProcessedFile(processedBlob, file.name);
        
        // Mark as processed
        updatedFiles[i] = Object.assign({}, file, { processed: true });
      }
      
      setFiles(updatedFiles);
      alert('Metadata removed successfully! Files have been downloaded.');
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing files: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const clearFiles = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="mb-4">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to select
        </p>
        <p className="text-sm text-gray-500">
          Supports images (JPG, PNG) and videos (MP4, MOV)
        </p>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => {
            if (e.target.files) {
              onDrop(Array.from(e.target.files));
            }
          }}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Select Files
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Selected Files:</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={processFiles}
              disabled={processing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? 'Processing...' : 'Remove Metadata'}
            </button>
            <button
              onClick={clearFiles}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Files
            </button>
          </div>
        </div>
      )}
    </div>
  );
};