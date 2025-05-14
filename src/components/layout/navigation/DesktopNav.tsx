
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/auth"
import { useIsMobile } from "@/hooks/use-mobile"
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import { ChevronDown, Home, User, Users, Calendar, FileText, Workflow, DollarSign, Receipt, Utensils, Clock, ClipboardCheck, Coffee } from "lucide-react"

interface DesktopNavProps {
  isAuthenticated: boolean
}

const DesktopNav = ({ isAuthenticated }: DesktopNavProps) => {
  const { isAdmin, isHR, isManager } = useAuth()
  const hasManagerialAccess = isManager || isAdmin || isHR
  const location = useLocation()
  
  if (!isAuthenticated) {
    // For unauthenticated users, show minimal navigation
    return (
      <div className="hidden md:flex gap-6 ml-6">
        <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
          Home
        </Link>
        <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary">
          About
        </Link>
      </div>
    )
  }

  // For authenticated users - use navigation menu with dropdowns
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <Link 
                to="/schedule" 
                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
              >
                <div className="mb-2 mt-4 text-lg font-medium">
                  Schedule Overview
                </div>
                <p className="text-sm leading-tight text-muted-foreground">
                  View and manage the main schedule calendar
                </p>
              </Link>
              
              {hasManagerialAccess && (
                <Link 
                  to="/shift-calendar" 
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                >
                  <div className="mb-2 mt-4 text-lg font-medium">
                    Staff Schedule
                  </div>
                  <p className="text-sm leading-tight text-muted-foreground">
                    Manage employee shifts and assignments
                  </p>
                </Link>
              )}
              
              <Link 
                to="/employee-workflow" 
                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
              >
                <div className="mb-2 mt-4 text-lg font-medium">
                  {hasManagerialAccess ? "My Employee Shifts" : "My Schedule"}
                </div>
                <p className="text-sm leading-tight text-muted-foreground">
                  {hasManagerialAccess ? "Manage your team's shifts" : "View your upcoming shifts"}
                </p>
              </Link>
              
              <Link 
                to="/leave-management" 
                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
              >
                <div className="mb-2 mt-4 text-lg font-medium">
                  Leave Management
                </div>
                <p className="text-sm leading-tight text-muted-foreground">
                  Request and manage time off and leave
                </p>
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {hasManagerialAccess && (
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <Users className="h-4 w-4 mr-2" />
              Team
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[400px] gap-3 p-4">
                <Link 
                  to="/people" 
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                >
                  <div className="mb-2 mt-4 text-lg font-medium">
                    Team Members
                  </div>
                  <p className="text-sm leading-tight text-muted-foreground">
                    View and manage employee profiles
                  </p>
                </Link>
                
                <Link 
                  to="/attendance" 
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                >
                  <div className="mb-2 mt-4 text-lg font-medium">
                    Attendance
                  </div>
                  <p className="text-sm leading-tight text-muted-foreground">
                    Track employee attendance and time records
                  </p>
                </Link>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <DollarSign className="h-4 w-4 mr-2" />
            Finance
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[400px] gap-3 p-4">
              <Link 
                to="/salary" 
                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
              >
                <div className="mb-2 mt-4 text-lg font-medium">
                  Salary
                </div>
                <p className="text-sm leading-tight text-muted-foreground">
                  View salary information and history
                </p>
              </Link>
              
              {hasManagerialAccess && (
                <Link 
                  to="/payroll" 
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                >
                  <div className="mb-2 mt-4 text-lg font-medium">
                    Payslip Management
                  </div>
                  <p className="text-sm leading-tight text-muted-foreground">
                    Generate and manage employee payslips
                  </p>
                </Link>
              )}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link to="/about" className={navigationMenuTriggerStyle()}>
            <FileText className="h-4 w-4 mr-2" />
            About
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default DesktopNav
