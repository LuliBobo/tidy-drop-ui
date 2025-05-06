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
      // TODO: Implement actual signup logic here
      console.log('Sign up data:', data);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-8">Create an account</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
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