import React from 'react';
import { Dropzone } from './components/Dropzone';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              DropTidy
            </h1>
            <p className="text-sm text-gray-600">
              Remove metadata from your images and videos
            </p>
          </div>
        </div>
      </header>
      
      <main className="py-12">
        <Dropzone />
      </main>
      
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 DropTidy. Simple, secure metadata removal.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;