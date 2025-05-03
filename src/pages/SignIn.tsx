
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DropTidyLogo from "@/components/DropTidyLogo";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        console.log("Sign in attempt with:", { email, password });
        setIsSubmitting(false);
        // In a real app, you would handle authentication here
      }, 1000);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="flex flex-col items-center w-full max-w-sm mx-auto lg:w-96">
          <div className="flex items-center mb-8">
            <DropTidyLogo size={40} />
            <span className="ml-3 text-2xl font-bold text-gray-900">DropTidy</span>
          </div>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Sign in to your account
              </CardTitle>
              <CardDescription className="text-center text-gray-500">
                Enter your email and password to sign in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${
                        errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${
                        errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Eye className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-center">
                <Link to="/signup" className="font-medium text-indigo-900 hover:underline">
                  Don't have an account yet? Sign up
                </Link>
              </div>
              <div className="text-sm text-center">
                <Link to="/forgot-password" className="font-medium text-indigo-900 hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
