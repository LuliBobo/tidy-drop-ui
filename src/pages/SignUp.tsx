
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DropTidyLogo from "@/components/DropTidyLogo";

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Japan",
  "Brazil",
  "India",
  "China",
];

const roles = ["Individual", "Student", "Professional", "Business", "Enterprise"];

const referralSources = [
  "Google Search",
  "Social Media",
  "Friend or Colleague",
  "Blog or Article",
  "YouTube",
  "Podcast",
  "Conference or Event",
  "Other",
];

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    phone: "",
    role: "",
    referralSource: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [marketing, setMarketing] = useState(true);
  const [newsletter, setNewsletter] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (!formData.country) newErrors.country = "Please select a country";
    if (!formData.role) newErrors.role = "Please select a role";
    if (!formData.referralSource) newErrors.referralSource = "Please tell us how you heard about us";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        console.log("Sign up data:", { ...formData, marketing, newsletter });
        setIsSubmitting(false);
        // In a real app, you would handle registration here
      }, 1000);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <DropTidyLogo size={40} />
            <span className="ml-3 text-2xl font-bold text-gray-900">DropTidy</span>
          </div>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Create your account
              </CardTitle>
              <CardDescription className="text-center text-gray-500">
                Get started with DropTidy today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`${
                        errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`${
                        errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${
                        errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className={`${
                          errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                        autoComplete="new-password"
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
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => handleSelectChange("country", value)}
                    >
                      <SelectTrigger
                        id="country"
                        className={`${
                          errors.country ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="mt-1 text-xs text-red-600">{errors.country}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone number (optional)
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="role" className="text-sm font-medium">
                      Role
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleSelectChange("role", value)}
                    >
                      <SelectTrigger
                        id="role"
                        className={`${
                          errors.role ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="referralSource" className="text-sm font-medium">
                      How did you hear about us?
                    </Label>
                    <Select
                      value={formData.referralSource}
                      onValueChange={(value) => handleSelectChange("referralSource", value)}
                    >
                      <SelectTrigger
                        id="referralSource"
                        className={`${
                          errors.referralSource ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {referralSources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.referralSource && (
                      <p className="mt-1 text-xs text-red-600">{errors.referralSource}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={marketing}
                      onCheckedChange={(checked) => setMarketing(checked === true)}
                    />
                    <Label htmlFor="marketing" className="text-sm font-normal">
                      I agree to receive updates from DropTidy
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={newsletter}
                      onCheckedChange={(checked) => setNewsletter(checked === true)}
                    />
                    <Label htmlFor="newsletter" className="text-sm font-normal">
                      I agree to receive newsletter on file organization and productivity
                    </Label>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-indigo-900 hover:bg-indigo-800 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : "Sign up"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <div className="w-full text-sm text-center">
                <Link to="/signin" className="font-medium text-indigo-900 hover:underline">
                  Already have an account? Log in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
