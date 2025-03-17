
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth';
import DesktopNav from './DesktopNav';
import MobileNavMenu from './MobileNavMenu';
import NavActions from './NavActions';

// Nav items configuration
const NAV_ITEMS = [
  { name: 'Dashboard', path: '/' },
  { name: 'People', path: '/people' },
  { name: 'Salary', path: '/payroll' },
  { name: 'Leave', path: '/leave' },
  { name: 'Profile', path: '/profile' },
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
          {!isMobile && <DesktopNav navItems={NAV_ITEMS} />}
          
          {/* User Actions */}
          <NavActions 
            userEmail={user?.email}
            userRole={getUserRole()}
            isMobile={isMobile}
            onSignOut={handleSignOut}
          />
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobile && mobileMenuOpen && (
        <MobileNavMenu
          navItems={NAV_ITEMS}
          currentPath={location.pathname}
          onItemClick={() => setMobileMenuOpen(false)}
          onSignOut={handleSignOut}
        />
      )}
    </>
  );
};

export default Navbar;
