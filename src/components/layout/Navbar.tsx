
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Settings, User, Menu, X, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/' },
  { name: 'People', path: '/people' },
  { name: 'Leave', path: '/leave' },
  { name: 'Hiring', path: '/hiring' },
  { name: 'Devices', path: '/devices' },
  { name: 'Apps', path: '/apps' },
  { name: 'Salary', path: '/salary' },
  { name: 'Calendar', path: '/calendar' },
  { name: 'Reviews', path: '/reviews' },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, signOut, isAdmin, isHR } = useAuth();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getUserRole = () => {
    if (isAdmin) return 'Admin';
    if (isHR) return 'HR';
    return 'Employee';
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 transition-all duration-300 ${
          scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl font-medium bg-gray-100 px-4 sm:px-6 py-2 rounded-full transition-transform hover:scale-105"
          >
            Crextio
          </Link>
          
          {/* Mobile Menu Button */}
          {isMobile && (
            <button 
              onClick={toggleMobileMenu}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors ml-auto mr-2"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
          
          {/* Desktop Navigation */}
          {!isMobile && (
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
          )}
          
          {/* User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {!isMobile && (
              <>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
              </>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                  <User className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.email}</span>
                    <span className="text-xs text-muted-foreground">{getUserRole()}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-16 pb-6 px-4 bg-white/95 backdrop-blur-md animate-fade-in overflow-auto">
          <nav className="pt-4">
            <ul className="flex flex-col items-stretch space-y-2">
              {NAV_ITEMS.map((item) => {
                const isActive = 
                  (item.path === '/' && location.pathname === '/') || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                
                return (
                  <li key={item.name} className="w-full">
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-base font-medium transition-all w-full text-center ${
                        isActive 
                          ? 'bg-black text-white' 
                          : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
              
              <li className="w-full">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all w-full text-center ${
                    location.pathname === '/profile'
                      ? 'bg-black text-white' 
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  Profile
                </Link>
              </li>
              
              <li className="w-full">
                <button
                  onClick={handleSignOut}
                  className="block px-4 py-3 rounded-xl text-base font-medium transition-all w-full text-center text-red-600 bg-red-50 hover:bg-red-100"
                >
                  Sign Out
                </button>
              </li>
            </ul>
          </nav>
          
          <div className="mt-8 flex justify-center space-x-6">
            <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
              <Settings className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
              <Bell className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
