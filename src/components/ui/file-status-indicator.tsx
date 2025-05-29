import React from 'react';

type CleanStatus = 'idle' | 'cleaning' | 'success' | 'error';

interface FileStatusIndicatorProps {
  status: CleanStatus;
  error?: string;
  className?: string;
}

export const FileStatusIndicator: React.FC<FileStatusIndicatorProps> = ({
  status,
  error,
  className = ''
}) => {
  return (
    <span className={`
      inline-block px-2 py-1 text-xs rounded-full transition-colors
      ${status === 'idle' ? 'bg-gray-100 text-gray-600' : ''}
      ${status === 'cleaning' ? 'bg-yellow-100 text-yellow-600 animate-pulse' : ''}
      ${status === 'success' ? 'bg-green-100 text-green-600' : ''}
      ${status === 'error' ? 'bg-red-100 text-red-600' : ''}
      ${className}
    `}>
      {status === 'idle' && '🔵 Ready'}
      {status === 'cleaning' && '🟡 Cleaning...'}
      {status === 'success' && '✅ Done'}
      {status === 'error' && (
        <span title={error} className="text-red-500">
          ❌ {error || 'Failed'}
        </span>
      )}
    </span>
  );
};