import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import UpgradeModal from "./UpgradeModal";

interface UpgradePromptProps {
  dailyLimit: number;
  processedToday: number;
  onUpgradeClick?: () => void;
}

export function UpgradePrompt({ dailyLimit, processedToday, onUpgradeClick }: UpgradePromptProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const usagePercentage = (processedToday / dailyLimit) * 100;
  const remainingFiles = Math.max(0, dailyLimit - processedToday);

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Card className="p-6 border-droptidy-purple/20 bg-gradient-to-b from-droptidy-purple/5 to-transparent">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Free Plan Limit</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You have processed {processedToday} out of {dailyLimit} files today
            </p>
          </div>

          <Progress value={usagePercentage} className="bg-gray-100" />

          <div className="pt-2 space-y-4">
            {remainingFiles === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You've reached your daily limit. Upgrade to Pro for unlimited files!
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {remainingFiles} files remaining today. Need more? Go Pro for unlimited access!
              </p>
            )}

            <Button 
              onClick={handleUpgradeClick}
              className="w-full bg-droptidy-purple hover:bg-droptidy-purple/90"
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </Card>
      
      <UpgradeModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}