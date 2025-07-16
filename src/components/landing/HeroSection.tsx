
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { VideoModal } from './VideoModal';

interface HeroSectionProps {
  isAuthenticated: boolean;
  isManager: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isAuthenticated, isManager }) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleWatchDemo = () => {
    setIsVideoModalOpen(true);
  };

  return (
    <>
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 md:pt-24">
        {/* Enhanced background with subtle animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-indigo-600/30 animate-gradient-shift"></div>
        </div>

        <div className="container mx-auto px-6 md:px-8 text-center relative z-10 max-w-7xl">
          {/* Refined floating elements - Hidden on mobile */}
          <div className="absolute top-32 left-20 w-2 h-2 bg-blue-400/60 rounded-full animate-float opacity-80 hidden xl:block"></div>
          <div className="absolute top-48 right-32 w-3 h-3 bg-purple-400/60 rounded-full animate-float animation-delay-1000 opacity-80 hidden xl:block"></div>
          <div className="absolute bottom-48 left-40 w-2 h-2 bg-indigo-400/60 rounded-full animate-float animation-delay-2000 opacity-80 hidden xl:block"></div>
          <div className="absolute top-40 right-1/4 w-1 h-1 bg-blue-300/40 rounded-full animate-float animation-delay-4000 opacity-60 hidden xl:block"></div>

          {/* Main content with improved spacing */}
          <div className="max-w-5xl mx-auto space-y-8 md:space-y-12 animate-fade-up">
            {/* Professional logo presentation */}
            <div className="flex justify-center mb-12 md:mb-16">
              <div className="relative group">
                <img 
                  src="/lovable-uploads/47194533-9203-42e4-87f9-f999f02d909a.png" 
                  alt="TeamPulse Logo" 
                  className="h-24 w-auto md:h-32 lg:h-40 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>

            {/* Professional badge */}
            <div className="inline-flex items-center gap-3 bg-white/8 backdrop-blur-md rounded-full px-6 py-3 text-sm text-blue-100 border border-white/20 shadow-lg">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span className="font-medium">Enterprise-Grade Workforce Management</span>
            </div>

            {/* Enhanced headline */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                Transform Your
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mt-2">
                  Workforce Management
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-light">
                Streamline scheduling, attendance, and payroll with intelligent automation. 
                <span className="block mt-2 text-lg md:text-xl lg:text-2xl text-gray-300">
                  Built for modern businesses that value efficiency and accuracy.
                </span>
              </p>
            </div>

            {/* Professional CTA buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 pt-8 md:pt-12">
              {!isAuthenticated ? (
                <>
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 md:px-10 py-4 md:py-6 text-lg md:text-xl rounded-2xl shadow-2xl shadow-blue-500/25 transition-all duration-500 hover:scale-105 hover:shadow-blue-500/40 border border-white/10"
                  >
                    <Link to="/auth" className="flex items-center gap-3">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleWatchDemo}
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 md:px-10 py-4 md:py-6 text-lg md:text-xl rounded-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-white/30"
                  >
                    <Play className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                    Watch Demo
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 md:px-10 py-4 md:py-6 text-lg md:text-xl rounded-2xl shadow-2xl shadow-blue-500/25 transition-all duration-500 hover:scale-105"
                  >
                    <Link to="/schedule">
                      {isManager ? 'Manage Teams' : 'View Schedule'}
                      <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-3" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    asChild
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 md:px-10 py-4 md:py-6 text-lg md:text-xl rounded-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105"
                  >
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Trust indicators */}
            <div className="pt-12 md:pt-16">
              <p className="text-sm text-gray-400 mb-6 font-medium tracking-wide uppercase">
                Trusted by innovative companies worldwide
              </p>
              <div className="flex justify-center items-center gap-8 opacity-60">
                <div className="text-white/60 text-sm font-medium">Enterprise Ready</div>
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="text-white/60 text-sm font-medium">GDPR Compliant</div>
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="text-white/60 text-sm font-medium">24/7 Support</div>
              </div>
            </div>
          </div>

          {/* Professional scroll indicator - Hidden on mobile */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
            <div className="flex flex-col items-center gap-2 text-white/60">
              <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/40 rounded-full mt-2 animate-pulse"></div>
              </div>
              <span className="text-xs font-medium">Scroll to explore</span>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
      />
    </>
  );
};
