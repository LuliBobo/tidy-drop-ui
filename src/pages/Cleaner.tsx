import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileCleaner } from '@/components/FileCleaner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CleanerPage: React.FC = () => {
  const [hasFiles, setHasFiles] = React.useState(false);

  // Initialize files from sessionStorage if available
  React.useEffect(() => {
    try {
      const filesJson = sessionStorage.getItem('filesToClean');
      if (filesJson) {
        console.log('Found files to process in session storage');
        setHasFiles(true);
      }
    } catch (error) {
      console.error('Error accessing sessionStorage:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 container mx-auto px-4 max-w-6xl py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Clean Your Files
          </h1>
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {!hasFiles && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4 mb-6 text-yellow-800 dark:text-yellow-200">
            <p className="text-center">
              No files have been uploaded yet. You can upload files on the{' '}
              <Link to="/" className="underline font-medium">
                home page
              </Link>{' '}
              or directly here in the cleaner interface.
            </p>
          </div>
        )}

        <FileCleaner />
      </main>
      <Footer />
    </div>
  );
};

export default CleanerPage;
