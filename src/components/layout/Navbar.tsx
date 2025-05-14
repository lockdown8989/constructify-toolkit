
import { useAuth } from "@/hooks/auth"
import { useIsMobile } from "@/hooks/use-mobile"
import NotificationBell from '@/components/notifications/NotificationBell'
import MobileNav from "./navigation/MobileNav"
import ThemeToggle from "./navigation/ThemeToggle"
import UserMenu from "./navigation/UserMenu"
import AuthButtons from "./navigation/AuthButtons"

const Navbar = () => {
  const { user } = useAuth()
  const isMobile = useIsMobile()

  // Check if user exists to determine authentication status
  const isAuthenticated = !!user

  return (
    <div className="border-b sticky top-0 bg-background z-40 safe-area-inset">
      <div className="flex h-16 items-center px-4">
        {isMobile && <MobileNav isAuthenticated={isAuthenticated} />}
        
        {/* Push all the right side elements to the end */}
        <div className="ml-auto flex items-center space-x-2">
          <ThemeToggle />
          
          {/* Add notification bell before user account menu */}
          {isAuthenticated && <NotificationBell />}
          
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <AuthButtons />
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
