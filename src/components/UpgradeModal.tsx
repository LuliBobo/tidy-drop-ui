import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Zap, Shield, Download, Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Stripe URLs for checkout
const STRIPE_URLS = {
  proPlan: {
    monthly: 'https://buy.stripe.com/test_abc123', // Replace with your monthly Pro plan URL
    yearly: 'https://buy.stripe.com/test_xyz456'   // Replace with your yearly Pro plan URL
  }
};

interface UpgradeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProFeatures = [
  {
    icon: <Zap className="h-5 w-5 text-droptidy-purple" />,
    title: 'Unlimited Files',
    description: 'Process as many files as you need without daily limits'
  },
  {
    icon: <Shield className="h-5 w-5 text-droptidy-purple" />,
    title: 'Advanced Metadata Removal',
    description: 'Enhanced algorithms to remove all potentially sensitive data'
  },
  {
    icon: <Download className="h-5 w-5 text-droptidy-purple" />,
    title: 'ZIP Export',
    description: 'Export all your cleaned files in a convenient ZIP package'
  },
  {
    icon: <Star className="h-5 w-5 text-droptidy-purple" />,
    title: 'AI Face Blur',
    description: 'Automatically detect and blur faces in your images'
  },
  {
    icon: <Clock className="h-5 w-5 text-droptidy-purple" />,
    title: 'Priority Support',
    description: 'Get answers to your questions within 24 hours'
  }
];

export function UpgradeModal({ isOpen, onOpenChange }: UpgradeModalProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Open Stripe checkout in a new tab
      const checkoutUrl = isYearly ? STRIPE_URLS.proPlan.yearly : STRIPE_URLS.proPlan.monthly;
      window.open(checkoutUrl, '_blank');
      setIsProcessing(false);
      onOpenChange(false);
    }, 500);
  };

  const monthlyPrice = 7;
  const yearlyPrice = 70;
  const savingsPercent = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade to <span className="text-droptidy-purple">Pro</span>
          </DialogTitle>
          <DialogDescription className="text-center">
            Unlock unlimited files and premium features
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center justify-center gap-3">
              <Label htmlFor="billing-toggle" className={`text-sm font-medium ${!isYearly ? 'text-droptidy-purple font-semibold' : ''}`}>
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-droptidy-purple"
              />
              <div className="flex items-center gap-1.5">
                <Label htmlFor="billing-toggle" className={`text-sm font-medium ${isYearly ? 'text-droptidy-purple font-semibold' : ''}`}>
                  Yearly
                </Label>
                <Badge variant="outline" className="text-xs bg-droptidy-purple/10 text-droptidy-purple border-droptidy-purple/20">
                  Save {savingsPercent}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Current Price */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Price</p>
            <div className="flex justify-center items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold">${isYearly ? yearlyPrice : monthlyPrice}</span>
              <span className="text-gray-600 dark:text-gray-400">
                {isYearly ? '/year' : '/month'}
              </span>
            </div>
            {isYearly && (
              <p className="text-sm text-droptidy-purple mt-1">
                Save ${monthlyPrice * 12 - yearlyPrice} compared to monthly
              </p>
            )}
          </div>

          {/* Features List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pro Features Include:</h3>
            <ul className="space-y-3">
              {ProFeatures.map((feature, index) => (
                <li key={index} className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Free vs Pro comparison */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 border rounded-lg">
              <div className="font-medium mb-2">Free</div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gray-500" />
                  <span>5 files per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gray-500" />
                  <span>Basic metadata removal</span>
                </li>
              </ul>
            </div>
            <div className="p-3 border border-droptidy-purple rounded-lg bg-droptidy-purple/5">
              <div className="font-medium mb-2">Pro</div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-droptidy-purple" />
                  <span>Unlimited files</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-droptidy-purple" />
                  <span>Advanced features</span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Subscriptions automatically renew. Cancel anytime.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Maybe Later
          </Button>
          <Button 
            onClick={handleUpgrade} 
            className="w-full sm:w-auto bg-droptidy-purple hover:bg-droptidy-purple/90"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Upgrade Now - $${isYearly ? yearlyPrice : monthlyPrice}${isYearly ? '/year' : '/month'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UpgradeModal;