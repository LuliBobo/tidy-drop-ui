
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage, FileVideo } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
};

interface DropzoneProps {
  onFilesAdded?: (files: File[]) => void;
  maxFiles?: number;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded, maxFiles = 10 }) => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    setFiles(newFiles);
    onFilesAdded?.(newFiles);
  }, [files, maxFiles, onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles,
  });

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
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group rounded-lg border bg-white p-2 shadow-sm"
              >
                {file.type.startsWith('image/') ? (
                  <div className="aspect-square w-full rounded-md overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-full w-full object-cover"
                      onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full rounded-md bg-gray-100 flex items-center justify-center">
                    <FileVideo className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="mt-2 text-xs truncate">{file.name}</div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
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
