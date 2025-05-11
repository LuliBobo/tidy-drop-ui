import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  MessageSquare, 
  Shield, 
  Star, 
  Settings, 
  ExternalLink 
} from 'lucide-react';
import UpgradeModal from './UpgradeModal';

type FooterNavigationProps = {
  onOpenSettings?: () => void;
  className?: string;
};

const FooterNavigation: React.FC<FooterNavigationProps> = ({ 
  onOpenSettings,
  className = ''
}) => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  return (
    <>
      <nav className={`flex flex-wrap gap-4 ${className}`} aria-label="Main navigation links">
        <Link 
          to="/download" 
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Download DropTidy application"
        >
          <Download className="h-4 w-4" />
          <span className="group-hover:underline">Download</span>
        </Link>
        
        <Link 
          to="/feedback" 
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Provide feedback on DropTidy"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="group-hover:underline">Feedback</span>
        </Link>
        
        <Link 
          to="/privacy" 
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          aria-label="View our privacy policy"
        >
          <Shield className="h-4 w-4" />
          <span className="group-hover:underline">Privacy</span>
        </Link>
        
        <button 
          onClick={() => setIsUpgradeModalOpen(true)} 
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Upgrade to Pro version"
        >
          <Star className="h-4 w-4" />
          <span className="group-hover:underline">Upgrade</span>
        </button>
        
        {onOpenSettings ? (
          <button
            onClick={onOpenSettings}
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" />
            <span className="group-hover:underline">Settings</span>
          </button>
        ) : (
          <Link 
            to="/settings" 
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" />
            <span className="group-hover:underline">Settings</span>
          </Link>
        )}
        
        <a 
          href="https://www.producthunt.com/posts/droptidy" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Visit us on Product Hunt, opens in a new tab"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="group-hover:underline">Product Hunt</span>
        </a>
      </nav>
      
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onOpenChange={setIsUpgradeModalOpen} 
      />
    </>
  );
};

export default FooterNavigation;