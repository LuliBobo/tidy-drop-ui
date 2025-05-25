import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiresAdmin = false 
}) => {
  const { isLoggedIn, isAdmin } = useAuth();
  
  // Not logged in at all - redirect to login
  if (!isLoggedIn) {
    toast({
      variant: 'destructive',
      title: 'Authentication required',
      description: 'Please sign in to access this page.',
      duration: 5000, // Predĺžená doba zobrazenia notifikácie
    });
    return <Navigate to="/signin" replace />;
  }
  
  // If admin access is required but user is not admin
  if (requiresAdmin && !isAdmin) {
    toast({
      variant: 'destructive',
      title: 'Access denied',
      description: 'You need administrator privileges to access this page.',
      duration: 5000, // Predĺžená doba zobrazenia notifikácie
    });
    return <Navigate to="/" replace />;
  }
  
  // Otherwise render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
