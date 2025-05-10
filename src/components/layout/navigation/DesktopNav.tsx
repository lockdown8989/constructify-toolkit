
import { Link } from "react-router-dom"

interface DesktopNavProps {
  isAuthenticated: boolean
}

const DesktopNav = ({ isAuthenticated }: DesktopNavProps) => {
  if (!isAuthenticated) {
    // For unauthenticated users, show landing page navigation
    return (
      <div className="hidden md:flex gap-6 ml-6">
        <Link to="/landing" className="text-sm font-medium transition-colors hover:text-primary">
          Home
        </Link>
        <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary">
          About
        </Link>
      </div>
    )
  }

  // For authenticated users
  return (
    <div className="hidden md:flex gap-6 ml-6">
      <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
        Dashboard
      </Link>
      <Link to="/schedule" className="text-sm font-medium transition-colors hover:text-primary">
        Schedule
      </Link>
      <Link to="/people" className="text-sm font-medium transition-colors hover:text-primary">
        People
      </Link>
      <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary">
        About
      </Link>
    </div>
  )
}

export default DesktopNav
