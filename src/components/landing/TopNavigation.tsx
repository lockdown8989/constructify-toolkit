import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Settings } from 'lucide-react';

interface TopNavigationProps {
  isAuthenticated: boolean;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ isAuthenticated }) => {
  const navItems = [
    { name: 'Features', href: '#features', icon: Users },
    { name: 'How It Works', href: '#how-it-works', icon: Clock },
    { name: 'Testimonials', href: '#testimonials', icon: Calendar },
    { name: 'Contact', href: '#footer', icon: Settings },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SchedulePro</span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium flex items-center gap-2 hover:scale-105 transform transition-transform"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  asChild
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            ) : (
              <Button 
                asChild 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
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