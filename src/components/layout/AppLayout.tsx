
import { Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import Navbar from "./Navbar";
import DesktopSidebar from "./navigation/DesktopSidebar";

const AppLayout = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen w-full">
      {/* Only render Desktop Sidebar when not on mobile */}
      {!isMobile && <DesktopSidebar isAuthenticated={isAuthenticated} />}
      
      <div className="flex flex-col flex-grow w-full min-w-0">
        <Navbar />
        <div className="container py-2 px-2 sm:py-4 sm:px-4 md:px-6 flex-1 max-w-full overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
