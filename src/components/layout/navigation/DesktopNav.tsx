
import { Button } from "@/components/ui/button";
import { Bell, LogOut, User, Settings, Users, Calendar, DollarSign, Clock, FileText, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DesktopNavProps {
  isAuthenticated: boolean;
}

const DesktopNav = ({ isAuthenticated }: DesktopNavProps) => {
  const { user, signOut, isManager, isAdmin, isHR, isPayroll } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Calculate managerial and payroll access based on roles
  const hasManagerialAccess = (isManager || isAdmin || isHR) && !isPayroll;
  const hasPayrollAccess = isPayroll || isAdmin;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Briefcase },
    { path: '/people', label: 'Team Members', icon: Users, requiredAccess: hasManagerialAccess },
    { path: '/attendance', label: 'Attendance', icon: Clock },
    { path: '/schedule', label: 'Schedule', icon: Calendar },
    { path: '/leave-management', label: 'Leave', icon: FileText },
    { path: '/payroll', label: 'Payroll', icon: DollarSign, requiredAccess: hasPayrollAccess },
  ].filter(item => !item.requiredAccess || item.requiredAccess === true);

  if (!isAuthenticated) {
    return (
      <div className="hidden lg:flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/auth')}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center space-x-6">
      {/* Navigation Links */}
      <nav className="flex items-center space-x-6">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={cn(
              "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
              location.pathname === item.path 
                ? "text-primary border-b-2 border-primary rounded-none" 
                : "text-muted-foreground"
            )}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Button>
        ))}
      </nav>

      {/* Notifications */}
      <Button variant="ghost" size="icon">
        <Bell className="h-5 w-5" />
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DesktopNav;
