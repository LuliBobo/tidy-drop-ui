import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const SignUp: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-center">Sign Up</h1>
        <p className="text-center text-gray-600 mt-4">
          Sign up functionality coming soon.
        </p>
        
        <div className="flex justify-center mt-8">
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;