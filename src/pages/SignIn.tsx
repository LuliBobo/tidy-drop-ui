import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useAuth } from '@/contexts/AuthContext';

const signInSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(1, 'Password is required'),
});

type SignInForm = z.infer<typeof signInSchema>;

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  });

  const { login } = useAuth();

  const onSubmit = async (data: SignInForm) => {
    try {
      setIsLoading(true);
      // Získanie používateľského mena a hesla z formulára
      const { username, password } = data;
      
      // Pre Electron verziu
      if (window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke('login-user', username, password);
        if (result.success) {
          // Aktualizácia AuthContext
          login(username);
          
          toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.',
          });
          
          navigate('/');
        } else {
          toast({
            variant: 'destructive',
            title: 'Login failed',
            description: result.message || 'Invalid username or password. Please try again.',
          });
        }
      } 
      // Pre web verziu
      else {
        // Simulácia API volania
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Demo prihlásenie (v produkcii by tu bolo API volanie)
        if (username === 'demo' && password === 'password') {
          // Aktualizácia AuthContext
          login(username);
          
          toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.',
          });
          
          navigate('/');
        } else {
          toast({
            variant: 'destructive',
            title: 'Login failed',
            description: 'Invalid username or password. Please try again.',
          });
        }
      }
    } catch (error) {
      console.error('Signin error:', error);
      toast({
        variant: 'destructive',
        title: 'Login error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">Sign in to your account</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900 dark:text-gray-100">Username</FormLabel>
                  <FormControl>
                    <Input className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500 dark:text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-[#6366F1] hover:bg-[#5558D6]"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          <Link to="/reset-password" className="text-gray-600 hover:text-[#6366F1] block mb-2">
            Forgot your password?
          </Link>
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#6366F1] hover:text-[#5558D6]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
