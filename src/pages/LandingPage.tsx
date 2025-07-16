
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { TopNavigation } from '@/components/landing/TopNavigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FooterSection } from '@/components/landing/FooterSection';
import { FloatingChatbot } from '@/components/landing/FloatingChatbot';

const LandingPage: React.FC = () => {
  const { user, isManager } = useAuth();
  const isAuthenticated = !!user;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Background animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Top Navigation */}
      <TopNavigation isAuthenticated={isAuthenticated} />

      {/* Main content */}
      <div className="relative z-10">
        <HeroSection isAuthenticated={isAuthenticated} isManager={isManager} />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FooterSection />
      </div>

      {/* Floating chatbot */}
      <FloatingChatbot />
    </div>
  );
};

export default LandingPage;
