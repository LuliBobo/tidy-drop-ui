
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "./dialog";
import CookiePolicy from "../CookiePolicy";

interface CookiePolicyDialogProps {
  variant?: "link" | "ghost" | "outline" | "default";
  size?: "default" | "sm";
  className?: string;
}

export function CookiePolicyDialog({ 
  variant = "link", 
  size = "default",
  className = ""
}: CookiePolicyDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          Cookie Policy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <div className="pr-6">
          <CookiePolicy embedded />
        </div>
      </DialogContent>
    </Dialog>
  );
}