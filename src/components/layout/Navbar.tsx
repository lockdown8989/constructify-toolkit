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
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, signOut, isManager } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="bg-white border-b border-gray-200 fixed top-0 left-0 w-full z-40">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="text-2xl font-bold">
          TeamPulse
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/dashboard" className={`text-gray-600 hover:text-gray-800 ${pathname === '/dashboard' ? 'font-medium' : ''}`}>
            Dashboard
          </Link>
          <Link to="/people" className={`text-gray-600 hover:text-gray-800 ${pathname.startsWith('/people') ? 'font-medium' : ''}`}>
            People
          </Link>
          <Link to="/schedule" className={`text-gray-600 hover:text-gray-800 ${pathname === '/schedule' ? 'font-medium' : ''}`}>
            Schedule
          </Link>
          <Link to="/employee-workflow" className={`text-gray-600 hover:text-gray-800 ${pathname === '/employee-workflow' ? 'font-medium' : ''}`}>
            My Workflow
          </Link>
          <Link to="/leave-management" className={`text-gray-600 hover:text-gray-800 ${pathname === '/leave-management' ? 'font-medium' : ''}`}>
            Leave
          </Link>
          <Link to="/salary" className={`text-gray-600 hover:text-gray-800 ${pathname === '/salary' ? 'font-medium' : ''}`}>
            Salary
          </Link>
          {isManager && (
            <Link to="/hiring" className={`text-gray-600 hover:text-gray-800 ${pathname === '/hiring' ? 'font-medium' : ''}`}>
              Hiring
            </Link>
          )}
        </div>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url || `https://avatar.vercel.sh/${user?.email?.split('@')[0]}.png`} alt={user?.user_metadata?.full_name} />
                  <AvatarFallback>{user?.user_metadata?.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-2">
              <DropdownMenuLabel>{user?.user_metadata?.full_name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/auth" className="text-gray-600 hover:text-gray-800">
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
