
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Settings, User } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/' },
  { name: 'People', path: '/people' },
  { name: 'Hiring', path: '/hiring' },
  { name: 'Devices', path: '/devices' },
  { name: 'Apps', path: '/apps' },
  { name: 'Salary', path: '/salary' },
  { name: 'Calendar', path: '/calendar' },
  { name: 'Reviews', path: '/reviews' },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-3 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-xl font-medium bg-gray-100 px-6 py-2 rounded-full transition-transform hover:scale-105"
        >
          Crextio
        </Link>
        
        {/* Navigation */}
        <nav className="bg-white px-1 py-1 rounded-full shadow-sm">
          <ul className="flex items-center space-x-1">
            {NAV_ITEMS.map((item) => {
              const isActive = 
                (item.path === '/' && location.pathname === '/') || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-black text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
