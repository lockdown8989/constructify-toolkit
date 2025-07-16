
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import TopNavigation from '@/components/landing/TopNavigation';
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
      {/* Enhanced background with professional gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Professional grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20"></div>
      </div>

      {/* Top Navigation */}
      <TopNavigation />

      {/* Main content */}
      <div className="relative z-10">
        <HeroSection isAuthenticated={isAuthenticated} isManager={isManager} />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FooterSection />
      </div>

      {/* Professional floating chatbot */}
      <FloatingChatbot />
    </div>
  );
};

export default LandingPage;
