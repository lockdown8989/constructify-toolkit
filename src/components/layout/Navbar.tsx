
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  User, 
  Calendar, 
  Building2, 
  Clock,
  FileText,
  Wallet,
  Users,
  UserPlus,
  ClipboardList,
  Bell
} from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const { user, signOut, isManager } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Building2 className="h-4 w-4 mr-2" /> },
    { name: 'People', path: '/people', icon: <Users className="h-4 w-4 mr-2" /> },
    { name: 'Schedule', path: '/schedule', icon: <Calendar className="h-4 w-4 mr-2" /> },
  ];
  
  const employeeItems = [
    { name: 'Requests', path: '/schedule-requests', icon: <Clock className="h-4 w-4 mr-2" /> },
    { name: 'My Workflow', path: '/employee-workflow', icon: <FileText className="h-4 w-4 mr-2" /> },
    { name: 'Leave', path: '/leave-management', icon: <Calendar className="h-4 w-4 mr-2" /> },
    { name: 'Salary', path: '/salary', icon: <Wallet className="h-4 w-4 mr-2" /> },
  ];
  
  const managerItems = isManager ? [
    { name: 'Hiring', path: '/hiring', icon: <UserPlus className="h-4 w-4 mr-2" /> },
    { name: 'Shift Management', path: '/schedule-management', icon: <ClipboardList className="h-4 w-4 mr-2" /> },
    { name: 'Attendance', path: '/attendance-monitoring', icon: <Clock className="h-4 w-4 mr-2" /> },
  ] : [];

  return (
    <div className="bg-white border-b border-gray-200 fixed top-0 left-0 w-full z-40 shadow-sm">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <span className="text-primary">Team</span>
          <span className="text-teampulse-accent">Pulse</span>
        </Link>

        {isMobile ? (
          <div className="flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex space-x-4 px-2">
              {[...navItems, ...employeeItems, ...managerItems].map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={cn(
                    "flex items-center whitespace-nowrap text-sm py-1.5 px-1.5",
                    pathname === item.path ? 
                      "text-primary font-medium border-b-2 border-primary" : 
                      "text-gray-500 hover:text-gray-800"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <NavigationMenu className="hidden md:flex mx-6 flex-1 justify-center">
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.path}>
                  <Link to={item.path}>
                    <NavigationMenuLink 
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname === item.path ? "bg-accent text-accent-foreground" : ""
                      )}
                    >
                      {item.icon}
                      {item.name}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
              
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(
                  pathname === '/schedule-requests' || 
                  pathname === '/employee-workflow' || 
                  pathname === '/leave-management' || 
                  pathname === '/salary'
                    ? "bg-accent text-accent-foreground" : ""
                )}>
                  Employee
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[250px] gap-3 p-4">
                    {employeeItems.map((item) => (
                      <li key={item.path} className="row-span-1">
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.path}
                            className={cn(
                              "flex select-none flex-col rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              pathname === item.path ? "bg-accent text-accent-foreground" : ""
                            )}
                          >
                            <div className="flex items-center">
                              {item.icon}
                              <span className="text-sm font-medium">{item.name}</span>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              {isManager && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(
                    pathname === '/hiring' || 
                    pathname === '/schedule-management' || 
                    pathname === '/attendance-monitoring'
                      ? "bg-accent text-accent-foreground" : ""
                  )}>
                    Manager
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[250px] gap-3 p-4">
                      {managerItems.map((item) => (
                        <li key={item.path} className="row-span-1">
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.path}
                              className={cn(
                                "flex select-none flex-col rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                pathname === item.path ? "bg-accent text-accent-foreground" : ""
                              )}
                            >
                              <div className="flex items-center">
                                {item.icon}
                                <span className="text-sm font-medium">{item.name}</span>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        )}

        {user ? (
          <div className="flex items-center gap-2">
            {isManager && (
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                    <AvatarImage src={user?.user_metadata?.avatar_url || `https://avatar.vercel.sh/${user?.email?.split('@')[0]}.png`} alt={user?.user_metadata?.full_name} />
                    <AvatarFallback className="bg-primary/5 text-primary">
                      {user?.user_metadata?.full_name?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mr-2" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex cursor-pointer items-center">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link to="/auth">
            <Button variant="default" size="sm">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
