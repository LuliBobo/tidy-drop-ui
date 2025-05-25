import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '@/components/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const AdminPage = () => {
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users away from this page
  useEffect(() => {
    // Ak používateľ nie je prihlásený, presmeruj na prihlasovaciu stránku
    if (!isLoggedIn) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'Please sign in to access the admin panel.',
      });
      navigate('/signin');
      return;
    }
    
    // Ak používateľ je prihlásený, ale nie je admin, presmeruj na hlavnú stránku
    if (!isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Access denied',
        description: 'You do not have permission to access the admin panel.',
      });
      navigate('/');
    }
  }, [isLoggedIn, isAdmin, navigate]);

  // If not admin, don't render the admin content
  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            You do not have administrator privileges required to access this page.
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => navigate('/')}>
              Return to Homepage
            </Button>
            {!isLoggedIn && (
              <Button variant="outline" onClick={() => navigate('/signin')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fafaf9] dark:bg-gray-900">
      <AdminDashboard />
    </div>
  );
};

export default AdminPage;
