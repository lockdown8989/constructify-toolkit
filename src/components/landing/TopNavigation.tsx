
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, MessageSquare } from 'lucide-react';

interface TopNavigationProps {
  isAuthenticated: boolean;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ isAuthenticated }) => {
  const navItems = [
    { name: 'Features', href: '#features', icon: Users },
    { name: 'How It Works', href: '#how-it-works', icon: Clock },
    { name: 'Testimonials', href: '#testimonials', icon: Calendar },
    { name: 'Contact', href: '#footer', icon: MessageSquare },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Professional Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/lovable-uploads/6498c422-3293-40e4-99c1-a94a137934f6.png" 
              alt="TeamPulse Logo" 
              className="h-8 w-8 md:h-10 md:w-10 transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-xl md:text-2xl font-bold text-white tracking-tight">TeamPulse</span>
          </Link>

          {/* Center Navigation - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-200 hover:text-white transition-all duration-300 text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 hover:scale-105 transform"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </a>
            ))}
          </div>

          {/* Professional Auth Buttons */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {!isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  asChild
                  size="sm"
                  className="text-gray-200 hover:text-white hover:bg-white/10 hidden sm:flex transition-all duration-300 rounded-lg"
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button 
                  asChild 
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 px-6 py-2 font-medium"
                >
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            ) : (
              <Button 
                asChild 
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 px-6 py-2 font-medium"
              >
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
