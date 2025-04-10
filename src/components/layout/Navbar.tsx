
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import NotificationBell from '@/components/notifications/NotificationBell';
import MobileMenu from "./navbar/MobileMenu";
import DesktopNav from "./navbar/DesktopNav";
import ThemeToggle from "./navbar/ThemeToggle";
import UserMenu from "./navbar/UserMenu";
import AuthButtons from "./navbar/AuthButtons";

const Navbar = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isAuthenticated = !!user;

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        {isMobile ? (
          <MobileMenu />
        ) : (
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Acme</span>
          </Link>
        )}
        
        {!isMobile && <DesktopNav />}
        
        <nav className="ml-auto flex items-center space-x-2">
          <ThemeToggle />
          
          {isAuthenticated && <NotificationBell />}
          
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <AuthButtons />
          )}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
