
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import DesktopSidebar from './navigation/DesktopSidebar';
import MobileNav from './navigation/MobileNav';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  if (!isAuthenticated) {
    return <div>{children}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {!isMobile && <DesktopSidebar isAuthenticated={isAuthenticated} />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {isMobile && <MobileNav isAuthenticated={isAuthenticated} />}
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
