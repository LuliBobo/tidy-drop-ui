import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
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

const signUpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpForm = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: SignUpForm) => {
    try {
      setIsLoading(true);
      const { username, password } = data;
      
      // Pre Electron verziu
      if (window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke(
          'register-user', 
          username, 
          password, 
          'user' // Explicitne nastav rolu na 'user'
        );
        
        if (result.success) {
          console.log('Successfully registered user:', username);
          toast({
            title: 'Registration successful',
            description: 'Your account has been created. You can now sign in.',
          });
          navigate('/signin');
        } else {
          throw new Error(result.message || 'Registration failed - username may already exist');
        }
      } else {
        // Pre web verziu - simulacia API volania
        console.log('Sign up data:', data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // V produkcii by tu bolo realne API volanie na server
        localStorage.setItem('registeredUser', username);
        navigate('/signin');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Registration failed. Please try a different username.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">Create an account</h1>
        
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
                  <FormLabel className="text-gray-900 dark:text-gray-100">Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500 dark:text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900 dark:text-gray-100">Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600" {...field} />
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
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>
        </Form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/signin" className="text-[#6366F1] hover:text-[#5558D6]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;