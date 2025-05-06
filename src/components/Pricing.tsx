import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// Add the Stripe checkout URLs
const STRIPE_URLS = {
  proPlan: {
    monthly: 'https://buy.stripe.com/test_abc123', // Replace with your monthly Pro plan URL
    yearly: 'https://buy.stripe.com/test_xyz456'   // Replace with your yearly Pro plan URL
  }
};

const openStripeCheckout = (plan: string, isYearly: boolean) => {
  if (plan === 'Pro') {
    const checkoutUrl = isYearly ? STRIPE_URLS.proPlan.yearly : STRIPE_URLS.proPlan.monthly;
    window.open(checkoutUrl, '_blank');
  }
};

type PricingPlan = {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  buttonText: string;
  lifetime?: boolean;
};

const PricingCard = ({ 
  plan, 
  isYearly 
}: { 
  plan: PricingPlan; 
  isYearly: boolean;
}) => {
  const price = plan.lifetime 
    ? plan.yearlyPrice 
    : isYearly 
      ? plan.yearlyPrice 
      : plan.monthlyPrice;

  const period = plan.lifetime 
    ? 'lifetime' 
    : isYearly 
      ? '/year' 
      : '/month';

  const handlePlanClick = () => {
    if (plan.name === 'Pro') {
      openStripeCheckout('Pro', isYearly);
    }
  };

  return (
    <Card className={`rounded-xl p-6 ${
      plan.highlighted 
        ? 'border-droptidy-purple bg-gradient-to-b from-droptidy-purple/5 to-transparent relative shadow-lg' 
        : 'border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'
    }`}>
      {plan.highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-droptidy-purple">
          Most Popular
        </Badge>
      )}
      
      <div className="mb-4">
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
      </div>
      
      <div className="mb-6">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-gray-500 dark:text-gray-400 ml-1">{period}</span>
        
        {isYearly && !plan.lifetime && plan.name !== "Free" && (
          <p className="text-sm text-droptidy-purple mt-1">
            Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toFixed(0)}/year
          </p>
        )}
      </div>
      
      <ul className="mb-6 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check size={16} className="text-droptidy-purple" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        className={`w-full ${
          plan.highlighted 
            ? 'bg-droptidy-purple hover:bg-droptidy-purple-dark' 
            : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600'
        }`}
        onClick={handlePlanClick}
      >
        {plan.buttonText}
      </Button>
    </Card>
  );
};

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans: PricingPlan[] = [
    {
      name: "Free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: "Basic privacy protection",
      features: [
        "5 files/day",
        "Offline metadata stripping",
        "Basic face blurring",
        "Standard export quality"
      ],
      buttonText: "Get Started"
    },
    {
      name: "Pro",
      monthlyPrice: 7,
      yearlyPrice: 70,
      description: "For individual creators",
      features: [
        "Unlimited images",
        "AI face blur",
        "ZIP export",
        "Priority support",
        "Advanced metadata removal"
      ],
      highlighted: true,
      buttonText: "Upgrade to Pro"
    },
    {
      name: "Studio",
      monthlyPrice: 25,
      yearlyPrice: 250,
      description: "For professional content creators",
      features: [
        "Video anonymization",
        "Manual blur tools",
        "Watermark editing",
        "Batch processing",
        "Custom export presets",
        "Premium support"
      ],
      buttonText: "Try Studio"
    },
    {
      name: "Lifetime",
      monthlyPrice: 0,
      yearlyPrice: 59,
      description: "Basic version forever",
      features: [
        "One-time purchase",
        "Basic Pro features",
        "Free updates",
        "Standard support",
        "3 devices"
      ],
      lifetime: true,
      buttonText: "Get Lifetime"
    }
  ];

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Choose the plan that works best for your privacy needs
          </p>
          
          <div className="flex items-center justify-center gap-3">
            <Label htmlFor="billing-toggle" className="text-sm font-medium">
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-droptidy-purple"
            />
            <div className="flex items-center gap-1.5">
              <Label htmlFor="billing-toggle" className="text-sm font-medium">
                Yearly
              </Label>
              <Badge variant="outline" className="text-xs bg-droptidy-purple/10 text-droptidy-purple border-droptidy-purple/20">
                Save up to 16%
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} isYearly={isYearly} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
