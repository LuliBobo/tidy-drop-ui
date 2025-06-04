import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LogoutButton from '@/components/LogoutButton';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock AuthContext
const mockLogout = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  LogOut: () => <div data-testid="logout-icon">LogOut Icon</div>,
}));

// Test wrapper with Router
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('LogoutButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders logout button with icon and text', () => {
    render(
      <TestWrapper>
        <LogoutButton />
      </TestWrapper>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
  });

  test('has correct styling classes', () => {
    render(
      <TestWrapper>
        <LogoutButton />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('flex', 'items-center', 'gap-2');
    expect(button).toHaveClass('text-gray-600', 'hover:text-gray-900');
    expect(button).toHaveClass('dark:text-gray-300', 'dark:hover:text-white');
  });

  test('calls logout and navigate when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <LogoutButton />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('handles async logout correctly', async () => {
    const user = userEvent.setup();
    mockLogout.mockResolvedValue(undefined);
    
    render(
      <TestWrapper>
        <LogoutButton />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // Wait for logout to complete before navigation
    expect(mockLogout).toHaveBeenCalledTimes(1);
    
    // Give time for async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('button is clickable and accessible', () => {
    render(
      <TestWrapper>
        <LogoutButton />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    expect(button).toBeEnabled();
  });
});
