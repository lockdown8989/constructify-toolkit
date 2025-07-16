
import { Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import Navbar from "./Navbar";
import DesktopSidebar from "./navigation/DesktopSidebar";

const AppLayout = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar - Always render on desktop */}
      {!isMobile && (
        <div className="flex-shrink-0">
          <DesktopSidebar isAuthenticated={isAuthenticated} />
        </div>
      )}
      
      <div className="flex flex-col flex-grow w-full">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="container py-4 px-4 md:px-6 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
