
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
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-14 md:pt-16">
        {/* Background video placeholder */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          {/* Floating elements - Hidden on mobile */}
          <div className="absolute top-20 left-20 w-6 h-6 bg-blue-400 rounded-full animate-float opacity-60 hidden lg:block"></div>
          <div className="absolute top-40 right-32 w-4 h-4 bg-purple-400 rounded-full animate-float animation-delay-1000 opacity-60 hidden lg:block"></div>
          <div className="absolute bottom-40 left-32 w-8 h-8 bg-indigo-400 rounded-full animate-float animation-delay-2000 opacity-60 hidden lg:block"></div>

          {/* Main content */}
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm text-blue-200 border border-white/20">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
              <span>The Future of Employee Management</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight">
              Smarter Employee
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                Scheduling Starts Here
              </span>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Manage shifts, clock-ins, calendars, and payroll with ease. 
              Transform your workforce management with intelligent automation.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 pt-6 md:pt-8">
              {!isAuthenticated ? (
                <>
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 md:px-8 py-4 md:py-6 text-base md:text-lg rounded-xl shadow-2xl shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40"
                  >
                    <Link to="/auth" className="flex items-center gap-2">
                      Try the Demo
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleWatchDemo}
                    className="border-white/30 text-white hover:bg-white/10 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  >
                    <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Watch Demo
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 md:px-8 py-4 md:py-6 text-base md:text-lg rounded-xl shadow-2xl shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                  >
                    <Link to="/schedule">
                      {isManager ? 'Manage Schedule' : 'View My Schedule'}
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    asChild
                    className="border-white/30 text-white hover:bg-white/10 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  >
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Scroll indicator - Hidden on mobile */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
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
