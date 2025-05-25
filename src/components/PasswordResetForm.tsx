import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast';

// Step 1: Email/Username submission
const requestResetSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

// Step 2: Code verification and new password
const completeResetSchema = z.object({
  code: z.string().min(4, 'Code must be at least 4 characters'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RequestResetForm = z.infer<typeof requestResetSchema>;
type CompleteResetForm = z.infer<typeof completeResetSchema>;

const PasswordResetForm: React.FC = () => {
  const [step, setStep] = useState<'request' | 'complete'>('request');
  const [username, setUsername] = useState('');
  const [resetCode, setResetCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form for requesting reset
  const requestForm = useForm<RequestResetForm>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      username: '',
    }
  });

  // Form for completing reset
  const completeForm = useForm<CompleteResetForm>({
    resolver: zodResolver(completeResetSchema),
    defaultValues: {
      code: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Handle request password reset
  const onRequestReset = async (data: RequestResetForm) => {
    try {
      setIsLoading(true);
      const { username } = data;
      setUsername(username);

      if (window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke('initiate-password-reset', username);
        
        if (result.success) {
          toast({
            title: 'Reset code sent',
            description: 'If the account exists, a reset code has been sent.',
          });
          
          // In production, the code would be sent via email
          // For this demo, we store it to use in the next step
          if (result.code) {
            setResetCode(result.code);
          }
          
          // Move to step 2
          setStep('complete');
        } else {
          throw new Error(result.message || 'Failed to send reset code');
        }
      } else {
        // Web version - mock success
        toast({
          title: 'Reset code sent',
          description: 'If the account exists, a reset code has been sent.',
        });
        
        // For demo purposes, generate a fake code
        const mockCode = 'DEMO123';
        setResetCode(mockCode);
        toast({
          title: 'Demo mode',
          description: `Your reset code is: ${mockCode}`,
        });
        
        // Move to step 2
        setStep('complete');
      }
    } catch (error) {
      console.error('Reset request error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle complete password reset
  const onCompleteReset = async (data: CompleteResetForm) => {
    try {
      setIsLoading(true);
      const { code, newPassword } = data;

      if (window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke(
          'complete-password-reset', 
          username, 
          code, 
          newPassword
        );
        
        if (result.success) {
          toast({
            title: 'Password reset successful',
            description: 'Your password has been reset. You can now log in with your new password.',
          });
          
          // Reset the form and go back to step 1
          completeForm.reset();
          setStep('request');
          setUsername('');
          setResetCode(null);
        } else {
          throw new Error(result.message || 'Failed to reset password');
        }
      } else {
        // Web version - mock success
        toast({
          title: 'Password reset successful',
          description: 'Your password has been reset. You can now log in with your new password.',
        });
        
        // Reset the form and go back to step 1
        completeForm.reset();
        setStep('request');
        setUsername('');
        setResetCode(null);
      }
    } catch (error) {
      console.error('Reset completion error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Display the reset code (for demo purposes only)
  const showResetCode = () => {
    if (!resetCode) return null;

    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-md mb-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>Demo Mode:</strong> Your reset code is: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 py-0.5 rounded">{resetCode}</code>
        </p>
        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
          In a real application, this would be sent via email.
        </p>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md">
      {step === 'request' ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Reset Your Password</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Enter your username and we'll send you a code to reset your password.
          </p>
          
          <Form {...requestForm}>
            <form onSubmit={requestForm.handleSubmit(onRequestReset)} className="space-y-4">
              <FormField
                control={requestForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Enter Reset Code</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Please enter the code you received and choose a new password.
          </p>
          
          {showResetCode()}
          
          <Form {...completeForm}>
            <form onSubmit={completeForm.handleSubmit(onCompleteReset)} className="space-y-4">
              <FormField
                control={completeForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reset Code</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={completeForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={completeForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setStep('request')} 
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default PasswordResetForm;
