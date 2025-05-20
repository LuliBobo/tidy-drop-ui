
import React from 'react';
import { Button } from "@/components/ui/button";
import { Video, EyeOff, Brain, Cpu, Layers, PenTool } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type FeatureItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const FeatureItem = ({ icon, title, description }: FeatureItemProps) => (
  <div className="flex gap-4">
    <div className="mt-1 flex-shrink-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-droptidy-purple/10">
        {icon}
      </div>
    </div>
    <div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </div>
);

const VideoAnonymization = () => {
  const features = [
    {
      icon: <Video className="h-5 w-5 text-droptidy-purple" />,
      title: "Automatically detects and blurs faces",
      description: "Our advanced AI automatically identifies and blurs faces throughout your videos."
    },
    {
      icon: <Brain className="h-5 w-5 text-droptidy-purple" />,
      title: "AI frame-by-frame processing",
      description: "Precise AI processing ensures consistent anonymization across every frame."
    },
    {
      icon: <Cpu className="h-5 w-5 text-droptidy-purple" />,
      title: "Runs locally on user's device",
      description: "Your videos never leave your device, ensuring maximum privacy and security."
    },
    {
      icon: <Layers className="h-5 w-5 text-droptidy-purple" />,
      title: "Studio plan unlocks batch & high-res",
      description: "Process multiple videos simultaneously and work with high-resolution content."
    },
    {
      icon: <PenTool className="h-5 w-5 text-droptidy-purple" />,
      title: "Manual blur for license plates, faces, logos",
      description: "Take full control with precise manual blurring tools for sensitive content."
    }
  ];

  return (
    <section id="video" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <Badge className="mb-4 bg-droptidy-purple/20 text-droptidy-purple hover:bg-droptidy-purple/30">
              <EyeOff className="mr-1 h-3 w-3" /> Premium Feature
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">AI-Powered Video Anonymization</h2>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
              Protect faces in motion – frame by frame.
            </p>
            
            <div className="space-y-6 mb-8">
              {features.map((feature, index) => (
                <FeatureItem
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
          
          <div>
            <Card className="overflow-hidden rounded-xl border-0 bg-white shadow-lg dark:bg-gray-800">
              <div className="relative">
                <div className="aspect-video bg-gray-100 dark:bg-gray-700">
                  <div className="flex h-full items-center justify-center">
                    <div className="relative">
                      <Video className="h-16 w-16 text-droptidy-purple opacity-20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="sm" className="rounded-full h-10 w-10 p-0 bg-droptidy-purple hover:bg-droptidy-purple-dark">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                  <p className="font-medium">Video Anonymization Demo</p>
                </div>
              </div>
              <CardContent className="p-6">
                <blockquote className="border-l-4 border-droptidy-purple pl-4 italic text-gray-600 dark:text-gray-300">
                  "DropTidy's video anonymization has been a game-changer for our documentary work. We can now protect the identity of our sources without sacrificing quality."
                </blockquote>
                <p className="mt-4 text-sm font-medium">— Alex Rivera, Documentary Filmmaker</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoAnonymization;
