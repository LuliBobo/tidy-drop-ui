import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileVideo } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
};

type CleanStatus = 'idle' | 'cleaning' | 'success' | 'error';

interface FileWithStatus {
  file: File;
  path: string;
  size: number;
  status: CleanStatus;
}

interface DropzoneProps {
  onFilesAdded?: (files: File[]) => void;
  maxFiles?: number;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded, maxFiles = 10 }) => {
  const [files, setFiles] = useState<FileWithStatus[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const fileObjs = acceptedFiles.map(file => ({
      file,
      path: (file as File & { path?: string }).path || file.name,
      size: file.size,
      status: 'idle' as CleanStatus,
    }));
    setFiles(fileObjs);
    onFilesAdded?.(acceptedFiles);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles,
  });

  const handleClean = async (filePath: string, idx: number) => {
    setFiles(prev =>
      prev.map((f, i) =>
        i === idx ? { ...f, status: 'cleaning' } : f
      )
    );
    try {
      const result = await window.electron.ipcRenderer.invoke('clean-image', filePath);
      setFiles(prev =>
        prev.map((f, i) =>
          i === idx
            ? { ...f, status: result ? 'success' : 'error' }
            : f
        )
      );
    } catch {
      setFiles(prev =>
        prev.map((f, i) =>
          i === idx ? { ...f, status: 'error' } : f
        )
      );
    }
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ease-in-out cursor-pointer
          ${isDragActive 
            ? 'border-droptidy-purple bg-droptidy-purple/5' 
            : 'border-gray-300 hover:border-droptidy-purple bg-gray-50/50 hover:bg-droptidy-purple/5'
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <Upload 
            className={`w-12 h-12 ${
              isDragActive ? 'text-droptidy-purple' : 'text-gray-400'
            }`}
          />
          <div className="space-y-1">
            <p className="text-lg font-medium">
              {isDragActive 
                ? 'Drop your files here...' 
                : 'Drag & Drop your files here'}
            </p>
            <p className="text-sm text-gray-500">
              or click to select files
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{files.length} file(s) selected</span>
            <span>Total size: {formatFileSize(totalSize)}</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((fileItem, index) => (
              <div
                key={`${fileItem.path}-${index}`}
                className="relative group rounded-lg border bg-white p-2 shadow-sm"
              >
                {fileItem.file.type.startsWith('image/') ? (
                  <div className="aspect-square w-full rounded-md overflow-hidden">
                    <img
                      src={URL.createObjectURL(fileItem.file)}
                      alt={fileItem.file.name}
                      className="h-full w-full object-cover"
                      onLoad={(e) => {
                        // Clean up the object URL after the image loads
                        const img = e.target as HTMLImageElement;
                        URL.revokeObjectURL(img.src);
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full rounded-md bg-gray-100 flex items-center justify-center">
                    <FileVideo className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="mt-2 text-xs truncate" title={fileItem.file.name}>
                  {fileItem.file.name}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(fileItem.size)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {fileItem.status === 'idle' && (
                    <button 
                      onClick={() => handleClean(fileItem.path, index)} 
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                    >
                      Vyčistiť
                    </button>
                  )}
                  {fileItem.status === 'cleaning' && (
                    <span className="text-xs text-yellow-600">🟡 Cleaning…</span>
                  )}
                  {fileItem.status === 'success' && (
                    <span className="text-xs text-green-600">✅ Cleaned successfully</span>
                  )}
                  {fileItem.status === 'error' && (
                    <span className="text-xs text-red-600">❌ Failed to clean</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropzone;
