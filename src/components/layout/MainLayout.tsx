
import React from 'react';
import DesktopNav from './navigation/DesktopNav';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNav from './navigation/MobileNav';
import { useAuth } from '@/hooks/use-auth';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <h1 className="text-xl font-semibold">TeamPulse</h1>
            </div>
            <div className="h-0 flex-1 flex flex-col overflow-y-auto bg-white dark:bg-gray-800">
                <nav className="flex-1 px-2 py-4">
                    <DesktopNav />
                </nav>
            </div>
        </div>
      </div>
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      {isMobile && <MobileNav isAuthenticated={isAuthenticated} />}
    </div>
  );
};

export default MainLayout;
