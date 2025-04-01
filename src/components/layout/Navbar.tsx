
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  User, 
  LogOut,
  Plane,
  SwitchCamera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const location = useLocation();
  const { user, signOut, isAdmin, isHR, isManager } = useAuth();
  const { toast } = useToast();

  const isManagerRole = isAdmin || isHR || isManager;
  
  useEffect(() => {
    // Log current role status for debugging
    if (user) {
      console.log("Current role status:", { isAdmin, isHR, isManager, isManagerRole });
      
      // Double-check roles directly from Supabase
      const checkRoles = async () => {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
          
        if (error) {
          console.error("Error checking roles:", error);
        } else {
          console.log("Roles from database:", data);
        }
      };
      
      checkRoles();
    }
  }, [user, isAdmin, isHR, isManager, isManagerRole]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "People",
      path: "/people",
      icon: <Users className="h-5 w-5" />,
      requiresManager: true,
    },
    {
      label: "Schedule",
      path: "/schedule",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: "Leave",
      path: "/leave",
      icon: <Plane className="h-5 w-5" />,
    },
    {
      label: "Schedule Requests",
      path: "/schedule-requests",
      icon: <SwitchCamera className="h-5 w-5" />,
    },
    {
      label: "Hiring",
      path: "/hiring",
      icon: <Briefcase className="h-5 w-5" />,
      requiresManager: true,
    },
    {
      label: "Payroll",
      path: "/payroll",
      icon: <DollarSign className="h-5 w-5" />,
      requiresManager: true,
    },
    {
      label: "Salary",
      path: "/salary",
      icon: <DollarSign className="h-5 w-5" />,
      requiresManager: true,
    },
  ];

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-1">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 font-bold"
          >
            <span className="hidden sm:inline-block">HR System</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            {navItems
              .filter((item) => !item.requiresManager || isManagerRole)
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                      : "bg-transparent hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              ))}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline-block">
                  My Account {isManagerRole ? '(Manager)' : '(Employee)'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
