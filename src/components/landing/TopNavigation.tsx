
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';

const TopNavigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src="/lovable-uploads/47194533-9203-42e4-87f9-f999f02d909a.png" 
                alt="TeamPulse" 
                className="h-8 w-auto animate-pulse-glow"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TeamPulse
            </span>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Features
            </a>
            <a href="#solutions" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Solutions
            </a>
            <Button
              variant="ghost"
              onClick={() => navigate('/privacy')}
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center gap-1"
            >
              <Shield className="h-4 w-4" />
              Privacy
            </Button>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="hidden sm:inline-flex hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
