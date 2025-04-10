
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/auth"
import { useIsMobile } from "@/hooks/use-mobile"
import NotificationBell from '@/components/notifications/NotificationBell'
import MobileNav from "./navigation/MobileNav"
import DesktopNav from "./navigation/DesktopNav"
import UserMenu from "./navigation/UserMenu"
import ThemeToggle from "./navigation/ThemeToggle"
import AuthButtons from "./navigation/AuthButtons"

const Navbar = () => {
  const { user, signOut } = useAuth()
  const isMobile = useIsMobile()

  // Check if user exists to determine authentication status
  const isAuthenticated = !!user

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        {isMobile ? (
          <MobileNav isAuthenticated={isAuthenticated} />
        ) : (
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">TeamPulse</span>
          </Link>
        )}
        
        {!isMobile && <DesktopNav isAuthenticated={isAuthenticated} />}
        
        <nav className="ml-auto flex items-center space-x-2">
          <ThemeToggle />
          
          {/* Add notification bell before user account menu */}
          {isAuthenticated && <NotificationBell />}
          
          {isAuthenticated ? (
            <UserMenu user={user} signOut={signOut} />
          ) : (
            <AuthButtons />
          )}
        </nav>
      </div>
    </div>
  )
}

export default Navbar
