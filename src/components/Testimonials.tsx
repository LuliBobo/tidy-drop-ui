
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type TestimonialProps = {
  quote: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  initials: string;
};

const TestimonialCard = ({ quote, name, role, location, avatar, initials }: TestimonialProps) => (
  <Card className="overflow-hidden rounded-xl border-0 bg-white shadow-md dark:bg-gray-800">
    <CardContent className="p-6">
      <svg
        className="mb-4 h-8 w-8 text-droptidy-purple/60"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11.6 2C4.9 2 2 6.6 2 11.3V20.7C2 21.4 2.6 22 3.3 22H8.7C9.4 22 10 21.4 10 20.7V14C10 13.3 9.4 12.7 8.7 12.7H5.8C6.7 7.6 8.8 5.3 13.8 5.3H17.3C18 5.3 18.7 4.7 18.7 3.9V3.3C18.7 2.6 18 2 17.3 2H11.6Z"
          fill="currentColor"
        />
        <path
          d="M15.4 12.7H12.5C13.4 7.6 15.5 5.3 20.5 5.3H21.3C22 5.3 22.7 4.7 22.7 3.9V3.3C22.7 2.6 22 2 21.3 2H18.7C12 2 9.1 6.6 9.1 11.3V20.7C9.1 21.4 9.7 22 10.4 22H15.8C16.5 22 17.1 21.4 17.1 20.7V14C17.1 13.3 16.2 12.7 15.4 12.7Z"
          fill="currentColor"
        />
      </svg>
      
      <blockquote className="mb-4 text-lg text-gray-700 dark:text-gray-300">
        "{quote}"
      </blockquote>
      
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-droptidy-purple text-white">{initials}</AvatarFallback>
        </Avatar>
        
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{role}, {location}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Testimonials = () => {
  const testimonials = [
    {
      quote: "DropTidy has been a lifesaver for our team. We deal with sensitive visual content daily, and the ability to quickly anonymize faces and strip metadata has streamlined our workflow tremendously.",
      name: "Sarah Johnson",
      role: "Creative Director",
      location: "New York",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop",
      initials: "SJ"
    },
    {
      quote: "As a street photographer, I was always concerned about privacy when sharing my work online. DropTidy lets me respect the privacy of my subjects while still showcasing my photography.",
      name: "Miguel Hernandez",
      role: "Photographer",
      location: "Barcelona",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=250&auto=format&fit=crop",
      initials: "MH"
    },
    {
      quote: "The video anonymization feature in the Studio plan is worth every penny. It's saved me countless hours of manual work when preparing documentary footage for public viewing.",
      name: "Rebecca Chen",
      role: "Documentary Filmmaker",
      location: "Toronto",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=250&auto=format&fit=crop",
      initials: "RC"
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">What People Are Saying</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Don't just take our word for it – hear from people who use DropTidy every day.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              location={testimonial.location}
              avatar={testimonial.avatar}
              initials={testimonial.initials}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
