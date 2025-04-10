
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  LogOut, 
  Settings, 
  Keyboard, 
  HelpCircle, 
  FileText, 
  Moon, 
  Circle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [autoOffline, setAutoOffline] = useState(false);
  const [availability, setAvailability] = useState<"online" | "away" | "offline">("online");

  if (!user) return null;

  const availabilityOptions = {
    online: { label: "Online", color: "bg-green-500" },
    away: { label: "Away", color: "bg-yellow-500" },
    offline: { label: "Offline", color: "bg-gray-400" }
  };

  const handleAvailabilityChange = () => {
    // Cycle through statuses: online -> away -> offline -> online
    if (availability === "online") setAvailability("away");
    else if (availability === "away") setAvailability("offline");
    else setAvailability("online");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 relative">
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background z-10">
            <span className={cn("absolute inset-0 rounded-full", availabilityOptions[availability].color)} />
          </span>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
            <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end" forceMount>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
              <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-medium leading-none">
                {user?.user_metadata?.full_name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <div className="mb-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Set your availability</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-between"
              onClick={handleAvailabilityChange}
            >
              <div className="flex items-center">
                <div className={cn("h-2 w-2 rounded-full mr-2", availabilityOptions[availability].color)} />
                {availabilityOptions[availability].label}
              </div>
              <Circle className="h-4 w-4 opacity-50" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">Mark offline automatically</p>
            <Switch 
              checked={autoOffline} 
              onCheckedChange={setAutoOffline} 
              className="data-[state=checked]:bg-blue-500" 
            />
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Contact support</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard shortcuts</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Moon className="mr-2 h-4 w-4" />
            <span>Change appearance</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>Read documentation</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => signOut()}
          className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
