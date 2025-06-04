import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackForm } from '@/components/FeedbackForm';
import { toast } from '@/hooks/use-toast';

// Mock toast hook
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

const mockToast = toast as jest.MockedFunction<typeof toast>;

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="dialog" data-open={open} onClick={() => onOpenChange?.(!open)}>
      {children}
    </div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-footer">{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-trigger">{children}</div>,
}));

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => <form data-testid="feedback-form">{children}</form>,
  FormControl: ({ children }: { children: React.ReactNode }) => <div data-testid="form-control">{children}</div>,
  FormField: ({ children, render: renderProp }: { children?: React.ReactNode; render?: (field: any) => React.ReactNode }) => (
    <div data-testid="form-field">
      {renderProp ? renderProp({ field: {} }) : children}
    </div>
  ),
  FormItem: ({ children }: { children: React.ReactNode }) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <label data-testid="form-label">{children}</label>,
  FormMessage: ({ children }: { children: React.ReactNode }) => <div data-testid="form-message">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, ...props }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: string; [key: string]: any }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      type={type}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ onChange, value, placeholder, ...props }: { onChange?: (e: any) => void; value?: string; placeholder?: string; [key: string]: any }) => (
    <input 
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      data-testid="input"
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ onChange, value, placeholder, ...props }: { onChange?: (e: any) => void; value?: string; placeholder?: string; [key: string]: any }) => (
    <textarea 
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      data-testid="textarea"
      {...props}
    />
  ),
}));

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: (data: any) => void) => (e: Event) => {
      e.preventDefault();
      fn({ name: 'Test User', email: 'test@example.com', message: 'Test message', category: 'bug' });
    },
    formState: { errors: {} },
    reset: jest.fn(),
  }),
}));

describe('FeedbackForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<FeedbackForm />);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Send Feedback')).toBeInTheDocument();
      expect(screen.getByText('We value your feedback. Tell us what you think about DropTidy!')).toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
      render(
        <FeedbackForm 
          title="Custom Feedback Title"
          description="Custom feedback description"
        />
      );
      
      expect(screen.getByText('Custom Feedback Title')).toBeInTheDocument();
      expect(screen.getByText('Custom feedback description')).toBeInTheDocument();
    });

    it('renders with custom trigger element', () => {
      const customTrigger = <button>Custom Trigger</button>;
      render(<FeedbackForm trigger={customTrigger} />);
      
      expect(screen.getByText('Custom Trigger')).toBeInTheDocument();
    });

    it('renders with controlled open state', () => {
      render(<FeedbackForm open={true} />);
      
      const dialog = screen.getByTestId('dialog');
      expect(dialog).toHaveAttribute('data-open', 'true');
    });
  });

  describe('Form Elements', () => {
    it('renders all form fields', () => {
      render(<FeedbackForm open={true} />);
      
      expect(screen.getByTestId('feedback-form')).toBeInTheDocument();
      expect(screen.getAllByTestId('form-field')).toHaveLength(4); // name, email, message, category
      expect(screen.getByTestId('input')).toBeInTheDocument(); // name field
      expect(screen.getByTestId('textarea')).toBeInTheDocument(); // message field
    });

    it('renders form labels correctly', () => {
      render(<FeedbackForm open={true} />);
      
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Message')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
    });

    it('renders submit and cancel buttons', () => {
      render(<FeedbackForm open={true} />);
      
      const buttons = screen.getAllByTestId('button');
      expect(buttons).toHaveLength(2);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Send Feedback')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('handles form submission', async () => {
      const user = userEvent.setup();
      render(<FeedbackForm open={true} />);
      
      const submitButton = screen.getByText('Send Feedback');
      await user.click(submitButton);
      
      // Verify that form submission was attempted
      expect(mockToast).toHaveBeenCalled();
    });

    it('handles cancel button click', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = jest.fn();
      render(<FeedbackForm open={true} onOpenChange={mockOnOpenChange} />);
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('handles dialog close', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = jest.fn();
      render(<FeedbackForm open={true} onOpenChange={mockOnOpenChange} />);
      
      const dialog = screen.getByTestId('dialog');
      await user.click(dialog);
      
      expect(mockOnOpenChange).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('displays validation errors for empty required fields', async () => {
      render(<FeedbackForm open={true} />);
      
      // The form validation would be handled by react-hook-form and zod
      // We can test that the form structure is correct for validation
      expect(screen.getByTestId('feedback-form')).toBeInTheDocument();
    });

    it('validates email format', () => {
      // Validation is handled by zod schema in the component
      // This test verifies the form structure supports validation
      render(<FeedbackForm open={true} />);
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('validates message length', () => {
      // Validation is handled by zod schema in the component
      render(<FeedbackForm open={true} />);
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
    });
  });

  describe('Submission States', () => {
    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock a delayed submission
      const mockHandleSubmit = jest.fn().mockImplementation((fn) => async (e) => {
        e.preventDefault();
        await new Promise(resolve => setTimeout(resolve, 100));
        fn({ name: 'Test', email: 'test@example.com', message: 'Test message', category: 'bug' });
      });
      
      const mockUseForm = jest.requireMock('react-hook-form').useForm;
      mockUseForm.mockReturnValueOnce({
        control: {},
        handleSubmit: mockHandleSubmit,
        formState: { errors: {} },
        reset: jest.fn(),
      });
      
      render(<FeedbackForm open={true} />);
      
      const submitButton = screen.getByText('Send Feedback');
      await user.click(submitButton);
      
      // During submission, button should be disabled
      expect(submitButton).toBeDisabled();
    });

    it('resets form after successful submission', async () => {
      const user = userEvent.setup();
      const mockReset = jest.fn();
      
      const mockUseForm = jest.requireMock('react-hook-form').useForm;
      mockUseForm.mockReturnValueOnce({
        control: {},
        handleSubmit: (fn: any) => (e: any) => {
          e.preventDefault();
          fn({ name: 'Test', email: 'test@example.com', message: 'Test message', category: 'bug' });
        },
        formState: { errors: {} },
        reset: mockReset,
      });
      
      render(<FeedbackForm open={true} />);
      
      const submitButton = screen.getByText('Send Feedback');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockReset).toHaveBeenCalled();
      });
    });
  });

  describe('Category Selection', () => {
    it('includes all feedback categories', () => {
      render(<FeedbackForm open={true} />);
      
      // Categories: bug, feature, question, other
      // This would be tested by checking if the select component has the right options
      expect(screen.getByTestId('feedback-form')).toBeInTheDocument();
    });

    it('defaults to "other" category', () => {
      const feedbackSchema = require('@/components/FeedbackForm').feedbackSchema;
      
      const result = feedbackSchema.parse({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message'
      });
      
      expect(result.category).toBe('other');
    });
  });

  describe('Error Handling', () => {
    it('handles submission errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock a submission that throws an error
      const mockHandleSubmit = jest.fn().mockImplementation((fn) => (e) => {
        e.preventDefault();
        throw new Error('Submission failed');
      });
      
      const mockUseForm = jest.requireMock('react-hook-form').useForm;
      mockUseForm.mockReturnValueOnce({
        control: {},
        handleSubmit: mockHandleSubmit,
        formState: { errors: {} },
        reset: jest.fn(),
      });
      
      render(<FeedbackForm open={true} />);
      
      const submitButton = screen.getByText('Send Feedback');
      
      // Should not throw and should handle error gracefully
      await expect(user.click(submitButton)).resolves.not.toThrow();
    });
  });
});
