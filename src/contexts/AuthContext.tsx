import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  isAdmin: boolean;
  role: string | null;
  login: (username: string, role?: string) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);

  // Skontroluj stav prihlásenia
  const checkAuthStatus = async () => {
    try {
      // Pre Electron verziu
      if (window.electron?.ipcRenderer) {
        const authStatus = await window.electron.ipcRenderer.invoke('check-auth');
        if (authStatus.isLoggedIn) {
          setIsLoggedIn(true);
          setUsername(authStatus.username);
          
          // Získaj rolu používateľa
          const roleInfo = await window.electron.ipcRenderer.invoke('get-user-role');
          setIsAdmin(roleInfo.isAdmin);
          setRole(roleInfo.role);
        }
      } 
      // Pre web verziu
      else {
        const storedUsername = localStorage.getItem('username');
        const authToken = localStorage.getItem('authToken');
        const storedRole = localStorage.getItem('userRole');
        
        if (authToken && storedUsername) {
          setIsLoggedIn(true);
          setUsername(storedUsername);
          setRole(storedRole);
          setIsAdmin(storedRole === 'admin');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  // Skontroluj stav pri načítaní
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (username: string, userRole: string = 'user') => {
    setIsLoggedIn(true);
    setUsername(username);
    
    // Pre Electron verziu
    if (window.electron?.ipcRenderer) {
      // Získaj rolu používateľa
      const roleInfo = await window.electron.ipcRenderer.invoke('get-user-role');
      setIsAdmin(roleInfo.isAdmin);
      setRole(roleInfo.role);
    }
    // Pre web verziu uložiť do localStorage
    else {
      localStorage.setItem('username', username);
      localStorage.setItem('authToken', 'demo-token-' + Date.now()); // V reálnej aplikácii by tu bol JWT token
      localStorage.setItem('userRole', userRole);
      setRole(userRole);
      setIsAdmin(userRole === 'admin');
    }
  };

  const logout = async () => {
    try {
      // Pre Electron verziu
      if (window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke('logout-user');
        if (!result) {
          throw new Error('Logout failed');
        }
      }
      // Pre web verziu
      else {
        localStorage.removeItem('username');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
      }
      
      setIsLoggedIn(false);
      setUsername(null);
      setIsAdmin(false);
      setRole(null);
      toast({
        title: 'Successfully logged out',
        description: 'You have been logged out from your account.',
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: 'There was a problem logging out. Please try again.',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      username, 
      isAdmin, 
      role, 
      login, 
      logout, 
      checkAuthStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Using global electron interface from /src/types/electron.d.ts
