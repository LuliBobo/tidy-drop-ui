import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger
} from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { safeIpcInvoke, isElectron } from '@/lib/environment';

// Define the feedback form validation schema
const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Please provide more details (minimum 10 characters)").max(1000, "Message cannot exceed 1000 characters"),
  category: z.enum(["bug", "feature", "question", "other"]).default("other")
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

/**
 * Response type for feedback submission
 * Compatible with both Electron IPC and Web API responses
 */
interface FeedbackResponse {
  success: boolean;
  savedLocally?: boolean;
  error?: string;
}

/**
 * Web API response from the feedback endpoint
 */
interface WebApiFeedbackResponse {
  success?: boolean;
  message?: string;
  error?: string;
  // Use more specific types for additional properties
  timestamp?: string;
  id?: string;
  status?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Convert a web API response to our standardized FeedbackResponse format
 * This ensures consistent typing across platforms
 */
const toFeedbackResponse = (
  response: Response, 
  data: WebApiFeedbackResponse
): FeedbackResponse => {
  return {
    success: response.ok && (data.success !== false),
    error: !response.ok ? data.message || data.error || 'Failed to send feedback' : undefined
  };
}

interface FeedbackFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  open,
  onOpenChange,
  trigger,
  title = "Send Feedback",
  description = "We value your feedback. Tell us what you think about DropTidy!"
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(open || false);
  const [isElectronEnv] = useState(isElectron());

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
      category: 'other'
    },
  });

  // Handle the form submission
  const onSubmit = async (values: FeedbackFormValues) => {
    setIsSubmitting(true);
    try {
      // In web builds, always use the web implementation directly
      // This prevents even trying to use Electron APIs during web builds
      if (import.meta.env.VITE_IS_WEB_BUILD === 'true') {
        try {
          console.log('Using web implementation for feedback submission');
          // In a web environment, call our Netlify serverless function
          const response = await fetch('/.netlify/functions/feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...values,
              source: 'web',
              timestamp: new Date().toISOString()
            })
          });
          
          const data = await response.json() as WebApiFeedbackResponse;
          
          // Store the result for consistent handling below
          const result = toFeedbackResponse(response, data);
          
          // Continue with the same response handling
          if (result.success) {
            console.log('Feedback submitted successfully in web environment', values.category);
            
            toast({
              title: "Feedback sent",
              description: "Thank you for your feedback!",
              variant: "default"
            });
            
            // Reset form and close dialog
            form.reset({
              name: '',
              email: '',
              message: '',
              category: 'other'
            });
            
            handleDialogClose();
          } else {
            throw new Error(result.error || "Failed to send feedback");
          }
          
          return; // Exit early since we've handled everything
        } catch (fetchError) {
          // Handle network errors and format them consistently
          console.error('Feedback submission network error:', fetchError);
          throw fetchError; // Will be caught by the outer try/catch
        }
      }
      
      // For Electron or when not explicitly in web build, use our environment utility with fallback
      const result = await safeIpcInvoke<FeedbackResponse>(
        'send-feedback',
        [values],
        // Web fallback implementation using Netlify serverless function
        async () => {
          try {
            // In a web environment, call our Netlify serverless function
            const response = await fetch('/.netlify/functions/feedback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                ...values,
                source: 'web',
                timestamp: new Date().toISOString()
              })
            });
            
            const data = await response.json() as WebApiFeedbackResponse;
            
            // Use the converter function to ensure consistent response format
            return toFeedbackResponse(response, data);
          } catch (fetchError) {
            // Handle network errors and format them consistently
            console.error('Feedback submission network error:', fetchError);
            return {
              success: false,
              error: fetchError instanceof Error 
                ? fetchError.message 
                : 'Network error while sending feedback'
            };
          }
        }
      );
      
      // Safely handle potentially undefined result
      if (!result) {
        console.error('Feedback submission returned undefined result');
        throw new Error("No response received from feedback submission");
      }
      
      // Log the result based on environment for debugging
      console.log(`Feedback submission ${result.success ? 'succeeded' : 'failed'} in ${isElectronEnv ? 'Electron' : 'web'} environment`);
      
      // Handle the response with proper type checking
      if (result.success) {
        // Log different messages based on environment
        console.log(
          `Feedback submitted successfully in ${isElectronEnv ? 'Electron' : 'web'} environment`,
          values.category
        );
        
        toast({
          title: "Feedback sent",
          description: result.savedLocally 
            ? "We couldn't send your feedback online, but we've saved it locally for later submission." 
            : "Thank you for your feedback!",
          variant: "default"
        });
        
        // Reset form and close dialog
        form.reset({
          name: '',
          email: '',
          message: '',
          category: 'other'
        });
        
        handleDialogClose();
      } else {
        // Handle error case with safe access to error message
        const errorMessage = result.error || "Failed to send feedback";
        throw new Error(errorMessage);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `There was a problem sending your feedback: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    const controlledClose = onOpenChange ? onOpenChange(false) : null;
    if (controlledClose === undefined) {
      setDialogOpen(false);
    }
  };

  // Handle dialog open
  const handleDialogOpen = (open: boolean) => {
    const controlledOpen = onOpenChange ? onOpenChange(open) : null;
    if (controlledOpen === undefined) {
      setDialogOpen(open);
    }
  };

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : dialogOpen;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <MessageCircle className="h-4 w-4" />
            Feedback
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="question">Question</option>
                      <option value="other">Other</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please share your thoughts or describe the issue you're experiencing..." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Submit Feedback"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;