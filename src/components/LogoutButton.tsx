import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Po odhlásení presmeruj používateľa na hlavnú stránku
    navigate('/');
  };

  return (
    <Button 
      variant="ghost" 
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
      onClick={handleLogout}
    >
      <LogOut className="w-4 h-4" />
      <span>Log out</span>
    </Button>
  );
};

export default LogoutButton;
