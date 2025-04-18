
import React from 'react';
import { Cpu, CloudOff, Sliders } from 'lucide-react';

type SecurityFeatureProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const SecurityFeature = ({ icon, title, description }: SecurityFeatureProps) => (
  <div className="text-center">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-droptidy-purple/10">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-semibold">{title}</h3>
    <p className="mx-auto max-w-sm text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

const Security = () => {
  const features = [
    {
      icon: <Cpu className="h-8 w-8 text-droptidy-purple" />,
      title: "Runs 100% locally — no uploads",
      description: "Your files never leave your device. All processing happens locally for maximum privacy and security."
    },
    {
      icon: <CloudOff className="h-8 w-8 text-droptidy-purple" />,
      title: "No cloud dependency",
      description: "DropTidy works offline and doesn't require any cloud services to function, giving you full control over your data."
    },
    {
      icon: <Sliders className="h-8 w-8 text-droptidy-purple" />,
      title: "Full control over privacy actions",
      description: "Choose exactly what gets blurred or removed, with precise control over every aspect of your media's privacy settings."
    }
  ];

  return (
    <section id="security" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Why It's Safe</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            We designed DropTidy with privacy as the foundation. Your media never leaves your device.
          </p>
        </div>
        
        <div className="grid gap-12 md:grid-cols-3">
          {features.map((feature, index) => (
            <SecurityFeature
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

export default Security;
