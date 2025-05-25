import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PasswordResetForm from '@/components/PasswordResetForm';

const ResetPassword: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
          <Link to="/signin">
            <Button variant="outline" size="sm">Back to Sign In</Button>
          </Link>
        </div>
        
        <PasswordResetForm />
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Remember your password?{' '}
            <Link to="/signin" className="text-[#6366F1] hover:text-[#5558D6]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
