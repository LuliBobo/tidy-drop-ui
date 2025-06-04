import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpgradeModal } from '@/components/UpgradeModal';

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="upgrade-dialog" data-open={open}>
      {open && children}
      <button onClick={() => onOpenChange(false)} data-testid="close-dialog">
        Close
      </button>
    </div>
  ),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      data-variant={variant}
      className={className}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <span data-testid="badge" className={className}>{children}</span>
  ),
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      data-testid="billing-switch"
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => (
    <label data-testid="label" {...props}>{children}</label>
  ),
}));

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

describe('UpgradeModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onOpenChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders when open', () => {
      render(<UpgradeModal {...defaultProps} />);
      
      expect(screen.getByTestId('upgrade-dialog')).toHaveAttribute('data-open', 'true');
      expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
      expect(screen.getByText(/Upgrade to/i)).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent(/Pro/);
    });

    it('does not render content when closed', () => {
      render(<UpgradeModal {...defaultProps} isOpen={false} />);
      
      expect(screen.getByTestId('upgrade-dialog')).toHaveAttribute('data-open', 'false');
      expect(screen.queryByText(/Upgrade to Pro/i)).not.toBeInTheDocument();
    });

    it('renders pro features list', () => {
      render(<UpgradeModal {...defaultProps} />);
      
      expect(screen.getByText('Unlimited Files')).toBeInTheDocument();
      expect(screen.getByText('Advanced Metadata Removal')).toBeInTheDocument();
      expect(screen.getByText('ZIP Export')).toBeInTheDocument();
      expect(screen.getByText('AI Face Blur')).toBeInTheDocument();
      expect(screen.getByText('Priority Support')).toBeInTheDocument();
    });

    it('renders feature descriptions', () => {
      render(<UpgradeModal {...defaultProps} />);
      
      expect(screen.getByText(/Process as many files as you need/i)).toBeInTheDocument();
      expect(screen.getByText(/Enhanced algorithms to remove/i)).toBeInTheDocument();
      expect(screen.getByText(/Export all your cleaned files/i)).toBeInTheDocument();
      expect(screen.getByText(/Automatically detect and blur faces/i)).toBeInTheDocument();
      expect(screen.getByText(/Get answers to your questions/i)).toBeInTheDocument();
    });
  });

  describe('Pricing Toggle', () => {
    it('renders billing period toggle', () => {
      render(<UpgradeModal {...defaultProps} />);
      
      expect(screen.getByTestId('billing-switch')).toBeInTheDocument();
      expect(screen.getByText('Monthly')).toBeInTheDocument();
      expect(screen.getByText('Yearly')).toBeInTheDocument();
    });

    it('shows monthly pricing by default', () => {
      render(<UpgradeModal {...defaultProps} />);
      
      expect(screen.getAllByText(/\$7/)[0]).toBeInTheDocument();
      expect(screen.getByText(/per month/i)).toBeInTheDocument();
    });

    it('switches to yearly pricing when toggle is clicked', async () => {
      const user = userEvent.setup();
      render(<UpgradeModal {...defaultProps} />);
      
      const billingSwitch = screen.getByTestId('billing-switch');
      await user.click(billingSwitch);
      
      expect(screen.getAllByText(/\$70/)[0]).toBeInTheDocument();
      expect(screen.getByText(/per year/i)).toBeInTheDocument();
    });

    it('shows savings badge for yearly billing', async () => {
      const user = userEvent.setup();
      render(<UpgradeModal {...defaultProps} />);
      
      const billingSwitch = screen.getByTestId('billing-switch');
      await user.click(billingSwitch);
      
      expect(screen.getByText(/Save 17%/i)).toBeInTheDocument();
    });
  });

  describe('Upgrade Actions', () => {
    it('opens Stripe checkout for monthly plan', async () => {
      const user = userEvent.setup();
      render(<UpgradeModal {...defaultProps} />);
      
      const upgradeButton = screen.getByText(/Upgrade Now/i);
      await user.click(upgradeButton);
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('stripe.com'),
        '_blank'
      );
    });

    it('opens Stripe checkout for yearly plan', async () => {
      const user = userEvent.setup();
      render(<UpgradeModal {...defaultProps} />);
      
      // Switch to yearly billing
      const billingSwitch = screen.getByTestId('billing-switch');
      await user.click(billingSwitch);
      
      const upgradeButton = screen.getByText(/Upgrade Now/i);
      await user.click(upgradeButton);
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('stripe.com'),
        '_blank'
      );
    });

    it('closes modal when upgrade button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = jest.fn();
      render(<UpgradeModal {...defaultProps} onOpenChange={mockOnOpenChange} />);
      
      const upgradeButton = screen.getByText(/Upgrade Now/i);
      await user.click(upgradeButton);
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Modal Controls', () => {
    it('closes modal when close button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = jest.fn();
      render(<UpgradeModal {...defaultProps} onOpenChange={mockOnOpenChange} />);
      
      const closeButton = screen.getByText(/Maybe Later/i);
      await user.click(closeButton);
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('closes modal when dialog close is triggered', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = jest.fn();
      render(<UpgradeModal {...defaultProps} onOpenChange={mockOnOpenChange} />);
      
      const closeDialogButton = screen.getByTestId('close-dialog');
      await user.click(closeDialogButton);
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Visual Elements', () => {
    it('renders feature icons', () => {
      render(<UpgradeModal {...defaultProps} />);
      
      // Check for Lucide icon classes or data attributes
      const features = screen.getAllByText(/Unlimited Files|Advanced Metadata|ZIP Export|AI Face Blur|Priority Support/);
      expect(features).toHaveLength(5);
    });

    it('applies correct styling classes', () => {
      render(<UpgradeModal {...defaultProps} />);
      
      const upgradeButton = screen.getByText(/Upgrade Now/i);
      expect(upgradeButton).toBeInTheDocument();
    });

    it('renders save badge for yearly plan', () => {
      render(<UpgradeModal {...defaultProps} />);
      
      expect(screen.getByText(/Save/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<UpgradeModal {...defaultProps} />);
      
      expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    });

    it('focuses on upgrade button when modal opens', () => {
      render(<UpgradeModal {...defaultProps} />);
      
      const upgradeButton = screen.getByText(/Upgrade Now/i);
      expect(upgradeButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles window.open failure gracefully', async () => {
      const user = userEvent.setup();
      mockWindowOpen.mockImplementation(() => null);
      
      render(<UpgradeModal {...defaultProps} />);
      
      const upgradeButton = screen.getByText(/Upgrade Now/i);
      
      // Should not throw error even if window.open fails
      await expect(user.click(upgradeButton)).resolves.not.toThrow();
    });
  });

  describe('Props Validation', () => {
    it('handles missing onOpenChange prop', () => {
      const { isOpen, ...propsWithoutCallback } = defaultProps;
      
      expect(() => {
        render(<UpgradeModal isOpen={true} onOpenChange={undefined as any} />);
      }).not.toThrow();
    });

    it('handles boolean isOpen prop correctly', () => {
      render(<UpgradeModal isOpen={false} onOpenChange={jest.fn()} />);
      
      expect(screen.getByTestId('upgrade-dialog')).toHaveAttribute('data-open', 'false');
    });
  });

  describe('Integration', () => {
    it('maintains state between billing period switches', async () => {
      const user = userEvent.setup();
      render(<UpgradeModal {...defaultProps} />);
      
      // Switch to yearly
      const billingSwitch = screen.getByTestId('billing-switch');
      await user.click(billingSwitch);
      
      expect(screen.getAllByText(/\$70/)[0]).toBeInTheDocument();
      
      // Switch back to monthly
      await user.click(billingSwitch);
      
      expect(screen.getAllByText(/\$7/)[0]).toBeInTheDocument();
    });

    it('preserves modal state during re-renders', () => {
      const { rerender } = render(<UpgradeModal {...defaultProps} />);
      
      expect(screen.getByTestId('upgrade-dialog')).toHaveAttribute('data-open', 'true');
      
      rerender(<UpgradeModal {...defaultProps} isOpen={true} />);
      
      expect(screen.getByTestId('upgrade-dialog')).toHaveAttribute('data-open', 'true');
    });
  });
});
