import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '@/components/Navbar';

// Mock AuthContext
const mockAuthContext = {
  isLoggedIn: false,
  username: null,
  isAdmin: false,
  role: null,
  login: jest.fn(),
  logout: jest.fn(),
  checkAuthStatus: jest.fn()
};

jest.mock('@/contexts/AuthContext', () => ({
  AuthContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children
  },
  useAuth: () => mockAuthContext
}));

// Mock the child components
jest.mock('@/components/DropTidyLogo', () => {
  return function MockDropTidyLogo() {
    return <div data-testid="drop-tidy-logo">DropTidy Logo</div>;
  };
});

jest.mock('@/components/LogoutButton', () => {
  return function MockLogoutButton() {
    return <button data-testid="logout-button">Logout</button>;
  };
});

// Mock UI components
jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet">{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-content">{children}</div>,
  SheetDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-description">{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-title">{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-trigger">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Intersection Observer
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Helper function to render Navbar with required providers
const renderNavbar = (authContextValue: any, pathname = '/') => {
  // Mock useLocation
  jest.doMock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => ({ pathname }),
    useNavigate: () => jest.fn(),
  }));

  // Update the mock auth context for this test
  Object.assign(mockAuthContext, authContextValue);

  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('light');
  });

  describe('Basic Rendering', () => {
    it('renders the navbar with logo and navigation links', () => {
      const mockAuthContext = {
        isLoggedIn: false,
        username: null,
        isAdmin: false,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthStatus: jest.fn(),
      };

      renderNavbar(mockAuthContext);

      expect(screen.getByTestId('drop-tidy-logo')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('Pricing')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
    });

    it('shows login button when user is not logged in', () => {
      const mockAuthContext = {
        isLoggedIn: false,
        username: null,
        isAdmin: false,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthStatus: jest.fn(),
      };

      renderNavbar(mockAuthContext);

      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
    });

    it('shows logout button and username when user is logged in', () => {
      const mockAuthContext = {
        isLoggedIn: true,
        username: 'testuser',
        isAdmin: false,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthStatus: jest.fn(),
      };

      renderNavbar(mockAuthContext);

      expect(screen.getByText('Welcome, testuser')).toBeInTheDocument();
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });

    it('shows admin link when user is admin', () => {
      const mockAuthContext = {
        isLoggedIn: true,
        username: 'admin',
        isAdmin: true,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthStatus: jest.fn(),
      };

      renderNavbar(mockAuthContext);

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('toggles theme when theme button is clicked', async () => {
      const mockAuthContext = {
        isLoggedIn: false,
        username: null,
        isAdmin: false,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthStatus: jest.fn(),
      };

      renderNavbar(mockAuthContext);

      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(themeButton);

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      });
    });

    it('applies stored theme preference on load', () => {
      mockLocalStorage.getItem.mockReturnValue('dark');

      const mockAuthContext = {
        isLoggedIn: false,
        username: null,
        isAdmin: false,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthStatus: jest.fn(),
      };

      renderNavbar(mockAuthContext);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme');
    });
  });

  describe('Mobile Menu', () => {
    it('opens mobile menu when hamburger button is clicked', () => {
      const mockAuthContext = {
        isLoggedIn: false,
        username: null,
        isAdmin: false,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthStatus: jest.fn(),
      };

      renderNavbar(mockAuthContext);

      const menuButton = screen.getByTestId('sheet-trigger');
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Navigation States', () => {
    it('handles privacy page correctly', () => {
      const mockAuthContext = {
        isLoggedIn: false,
        username: null,
        isAdmin: false,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthStatus: jest.fn(),
      };

      renderNavbar(mockAuthContext, '/privacy');

      // Component should render differently on privacy page
      expect(screen.getByTestId('drop-tidy-logo')).toBeInTheDocument();
    });

    it('handles cookie policy page correctly', () => {
      const mockAuthContext = {
        isLoggedIn: false,
        username: null,
        isAdmin: false,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthStatus: jest.fn(),
      };

      renderNavbar(mockAuthContext, '/cookie-policy');

      expect(screen.getByTestId('drop-tidy-logo')).toBeInTheDocument();
    });

    it('handles terms of service page correctly', () => {
      const mockAuthContext = {
        isLoggedIn: false,
        username: null,
        isAdmin: false,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthStatus: jest.fn(),
      };

      renderNavbar(mockAuthContext, '/terms-of-service');

      expect(screen.getByTestId('drop-tidy-logo')).toBeInTheDocument();
    });
  });
});
