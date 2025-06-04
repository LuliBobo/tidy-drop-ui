import React from 'react';
import { render, screen } from '@testing-library/react';
import Features from '@/components/Features';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Brain: ({ className }: { className?: string }) => (
    <div data-testid="brain-icon" className={className}>Brain</div>
  ),
  Eraser: ({ className }: { className?: string }) => (
    <div data-testid="eraser-icon" className={className}>Eraser</div>
  ),
  EyeOff: ({ className }: { className?: string }) => (
    <div data-testid="eye-off-icon" className={className}>EyeOff</div>
  ),
  PenTool: ({ className }: { className?: string }) => (
    <div data-testid="pen-tool-icon" className={className}>PenTool</div>
  ),
  Image: ({ className }: { className?: string }) => (
    <div data-testid="image-icon" className={className}>Image</div>
  ),
  Layers: ({ className }: { className?: string }) => (
    <div data-testid="layers-icon" className={className}>Layers</div>
  ),
}));

describe('Features Component', () => {
  describe('Basic Rendering', () => {
    it('renders all feature cards', () => {
      render(<Features />);
      
      expect(screen.getByText('Local AI Anonymization')).toBeInTheDocument();
      expect(screen.getByText('Bulk Metadata Cleaning')).toBeInTheDocument();
      expect(screen.getByText('Face Blurring')).toBeInTheDocument();
      expect(screen.getByText('Manual Blur Tool')).toBeInTheDocument();
      expect(screen.getByText('Watermark Management')).toBeInTheDocument();
      expect(screen.getByText('Batch Processing')).toBeInTheDocument();
    });

    it('renders section title and subtitle', () => {
      render(<Features />);
      
      expect(screen.getByText('Features You\'ll Love')).toBeInTheDocument();
      expect(screen.getByText(/Powerful privacy tools that make protecting your visual content simple and effective/i)).toBeInTheDocument();
    });

    it('renders all feature icons', () => {
      render(<Features />);
      
      expect(screen.getByTestId('brain-icon')).toBeInTheDocument();
      expect(screen.getByTestId('eraser-icon')).toBeInTheDocument();
      expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();
      expect(screen.getByTestId('pen-tool-icon')).toBeInTheDocument();
      expect(screen.getByTestId('image-icon')).toBeInTheDocument();
      expect(screen.getByTestId('layers-icon')).toBeInTheDocument();
    });
  });

  describe('Feature Descriptions', () => {
    it('displays correct description for Local AI Anonymization', () => {
      render(<Features />);
      
      expect(screen.getByText(/Your files never leave your device/i)).toBeInTheDocument();
      expect(screen.getByText(/All processing happens locally/i)).toBeInTheDocument();
    });

    it('displays correct description for Bulk Metadata Cleaning', () => {
      render(<Features />);
      
      expect(screen.getByText(/Remove EXIF, GPS, XMP/i)).toBeInTheDocument();
      expect(screen.getByText(/protect your sensitive information/i)).toBeInTheDocument();
    });

    it('displays correct description for Face Blurring', () => {
      render(<Features />);
      
      expect(screen.getByText(/Automatically detect and blur faces/i)).toBeInTheDocument();
      expect(screen.getByText(/both photos and videos/i)).toBeInTheDocument();
    });

    it('displays correct description for Manual Blur Tool', () => {
      render(<Features />);
      
      expect(screen.getByText(/Precisely control what gets blurred/i)).toBeInTheDocument();
      expect(screen.getByText(/easy-to-use manual blurring tools/i)).toBeInTheDocument();
    });

    it('displays correct description for Watermark Management', () => {
      render(<Features />);
      
      expect(screen.getByText(/Remove existing watermarks/i)).toBeInTheDocument();
      expect(screen.getByText(/add your own custom branding/i)).toBeInTheDocument();
    });

    it('displays correct description for Batch Processing', () => {
      render(<Features />);
      
      expect(screen.getByText(/Save time by processing multiple files/i)).toBeInTheDocument();
      expect(screen.getByText(/efficient batch tools/i)).toBeInTheDocument();
    });
  });

  describe('Feature Cards Layout', () => {
    it('renders six feature cards', () => {
      render(<Features />);
      
      const featureCards = screen.getAllByRole('heading', { level: 3 });
      expect(featureCards).toHaveLength(6);
    });

    it('applies correct CSS classes to feature cards', () => {
      render(<Features />);
      
      const firstCard = screen.getByText('Local AI Anonymization').closest('div');
      expect(firstCard).toHaveClass('rounded-xl', 'bg-white', 'p-6', 'shadow-sm');
    });

    it('applies correct styling to icons', () => {
      render(<Features />);
      
      const brainIcon = screen.getByTestId('brain-icon');
      expect(brainIcon).toHaveClass('h-6', 'w-6', 'text-droptidy-purple');
    });
  });

  describe('Section Structure', () => {
    it('has proper section id for navigation', () => {
      render(<Features />);
      
      const featuresSection = screen.getByText('Features You\'ll Love').closest('section');
      expect(featuresSection).toHaveAttribute('id', 'features');
    });

    it('uses semantic HTML structure', () => {
      render(<Features />);
      
      // Check for section element by finding the element with id="features"
      const section = screen.getByText('Features You\'ll Love').closest('section');
      expect(section).toBeInTheDocument();
      
      // Check for heading hierarchy
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6);
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive grid classes', () => {
      render(<Features />);
      
      const gridContainer = screen.getByText('Local AI Anonymization').closest('div')?.parentElement;
      expect(gridContainer).toHaveClass('grid');
    });

    it('applies proper spacing and padding', () => {
      render(<Features />);
      
      const section = screen.getByText('Features You\'ll Love').closest('section');
      expect(section).toHaveClass('py-20');
    });
  });

  describe('Dark Mode Support', () => {
    it('includes dark mode classes in feature cards', () => {
      render(<Features />);
      
      const featureCard = screen.getByText('Local AI Anonymization').closest('div');
      expect(featureCard).toHaveClass('dark:bg-gray-800');
    });

    it('includes dark mode classes in descriptions', () => {
      render(<Features />);
      
      const description = screen.getByText(/Your files never leave your device/i);
      expect(description).toHaveClass('dark:text-gray-300');
    });
  });

  describe('Accessibility', () => {
    it('has accessible heading structure', () => {
      render(<Features />);
      
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Features');
      
      const subHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(subHeadings).toHaveLength(6);
    });

    it('provides meaningful alt text context through headings', () => {
      render(<Features />);
      
      expect(screen.getByRole('heading', { name: 'Local AI Anonymization' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Bulk Metadata Cleaning' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Face Blurring' })).toBeInTheDocument();
    });
  });

  describe('Content Accuracy', () => {
    it('emphasizes privacy and local processing', () => {
      render(<Features />);
      
      expect(screen.getByText(/never leave your device/i)).toBeInTheDocument();
      expect(screen.getByText(/locally for maximum privacy/i)).toBeInTheDocument();
    });

    it('highlights key metadata types', () => {
      render(<Features />);
      
      expect(screen.getByText(/EXIF, GPS, XMP/i)).toBeInTheDocument();
    });

    it('mentions both photos and videos support', () => {
      render(<Features />);
      
      expect(screen.getByText(/both photos and videos/i)).toBeInTheDocument();
    });

    it('includes efficiency messaging', () => {
      render(<Features />);
      
      expect(screen.getByText(/Save time/i)).toBeInTheDocument();
      expect(screen.getByText(/single click/i)).toBeInTheDocument();
      expect(screen.getByText(/efficient batch tools/i)).toBeInTheDocument();
    });
  });

  describe('Component Isolation', () => {
    it('renders independently without external dependencies', () => {
      expect(() => render(<Features />)).not.toThrow();
    });

    it('maintains consistent styling across renders', () => {
      const { rerender } = render(<Features />);
      
      const firstRenderCard = screen.getByText('Local AI Anonymization').closest('div');
      const firstRenderClasses = firstRenderCard?.className;
      
      rerender(<Features />);
      
      const secondRenderCard = screen.getByText('Local AI Anonymization').closest('div');
      expect(secondRenderCard).toHaveClass(firstRenderClasses || '');
    });
  });
});
