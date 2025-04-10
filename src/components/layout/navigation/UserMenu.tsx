import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { User } from "@supabase/supabase-js"
import { useAuth } from "@/hooks/auth"
import { Badge } from "@/components/ui/badge"
import { Settings } from "lucide-react"
import WorkflowNotificationBell from '@/components/workflow/WorkflowNotificationBell'

interface UserMenuProps {
  user: User;
  signOut: () => void;
}

const UserMenu = ({ user, signOut }: UserMenuProps) => {
  const { isManager, isAdmin, isHR } = useAuth();
  
  const getUserRole = () => {
    if (isAdmin) return "Admin";
    if (isHR) return "HR";
    if (isManager) return "Manager";
    return "Employee";
  };
  
  const getRoleBadgeVariant = () => {
    if (isAdmin) return "destructive";
    if (isHR) return "secondary";     
    if (isManager) return "default";
    return "outline";                 
  };

  return (
    <div className="flex items-center gap-2">
      <WorkflowNotificationBell />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
              <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.user_metadata?.full_name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
              <div className="mt-2">
                <Badge variant={getRoleBadgeVariant()} className="mt-1">
                  {getUserRole()}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut()}
            className="cursor-pointer"
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
