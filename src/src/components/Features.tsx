
import React from 'react';
import { Brain, Eraser, EyeOff, PenTool, Image, Layers } from 'lucide-react';

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-droptidy-purple/10">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-semibold">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

const Features = () => {
  const features = [
    {
      icon: <Brain className="h-6 w-6 text-droptidy-purple" />,
      title: "Local AI Anonymization",
      description: "Your files never leave your device. All processing happens locally for maximum privacy."
    },
    {
      icon: <Eraser className="h-6 w-6 text-droptidy-purple" />,
      title: "Bulk Metadata Cleaning",
      description: "Remove EXIF, GPS, XMP and more with a single click to protect your sensitive information."
    },
    {
      icon: <EyeOff className="h-6 w-6 text-droptidy-purple" />,
      title: "Face Blurring",
      description: "Automatically detect and blur faces in both photos and videos to maintain anonymity."
    },
    {
      icon: <PenTool className="h-6 w-6 text-droptidy-purple" />,
      title: "Manual Blur Tool",
      description: "Precisely control what gets blurred with our easy-to-use manual blurring tools."
    },
    {
      icon: <Image className="h-6 w-6 text-droptidy-purple" />,
      title: "Watermark Management",
      description: "Remove existing watermarks or add your own custom branding to your media."
    },
    {
      icon: <Layers className="h-6 w-6 text-droptidy-purple" />,
      title: "Batch Processing",
      description: "Save time by processing multiple files simultaneously with our efficient batch tools."
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Features You'll Love</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Powerful privacy tools that make protecting your visual content simple and effective.
          </p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
