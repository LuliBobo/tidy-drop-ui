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

// Define the feedback form validation schema
const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Please provide more details (minimum 10 characters)").max(1000, "Message cannot exceed 1000 characters"),
  category: z.enum(["bug", "feature", "question", "other"]).default("other")
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

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
      const result = await window.electron.ipcRenderer.invoke('send-feedback', values);
      
      if (result.success) {
        toast({
          title: "Feedback sent",
          description: result.savedLocally 
            ? "We couldn't send your feedback online, but we've saved it locally for later submission." 
            : "Thank you for your feedback!",
          variant: result.savedLocally ? "default" : "default"
        });
        form.reset();
        handleDialogClose();
      } else {
        throw new Error(result.error || "Failed to send feedback");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `There was a problem sending your feedback: ${error}`,
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