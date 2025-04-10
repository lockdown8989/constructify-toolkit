
import React from "react";
import { Link } from "react-router-dom";
import { Menu, MessageCircle, AtSign, Inbox, Folder, Users, Contact, BarChart2, User, LogOut, HelpCircle, Keyboard, Settings, Moon, FileText } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const MobileMenu = () => {
  const { user, signOut } = useAuth();
  const isAuthenticated = !!user;
  const [autoOffline, setAutoOffline] = useState(false);
  const [availability, setAvailability] = useState<"online" | "away" | "offline">("online");

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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0 max-w-[85vw] sm:max-w-sm">
        {isAuthenticated && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 relative">
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background z-10">
                  <span className={cn("absolute inset-0 rounded-full", availabilityOptions[availability].color)} />
                </span>
                <AvatarImage 
                  src={user?.user_metadata?.avatar_url} 
                  alt={user?.user_metadata?.full_name} 
                />
                <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{user?.user_metadata?.full_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        <SheetHeader className="p-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto flex-1">
          <div className="px-4 py-2">
            <div className="font-medium text-sm text-muted-foreground mb-2">Main</div>
            <nav className="grid gap-1">
              <Link to="/" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted">
                <MessageCircle className="h-4 w-4" />
                All Conversations
              </Link>
              <Link to="/mentions" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted">
                <AtSign className="h-4 w-4" />
                Mentions
              </Link>
              <Link to="/unattended" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted">
                <Inbox className="h-4 w-4" />
                Unattended
              </Link>
            </nav>
          </div>

          <Separator className="my-2" />

          <div className="px-4 py-2">
            <div className="font-medium text-sm text-muted-foreground mb-2">Organization</div>
            <nav className="grid gap-1">
              <Link to="/folders" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted">
                <Folder className="h-4 w-4" />
                Folders
              </Link>
              <Link to="/teams" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted">
                <Users className="h-4 w-4" />
                Teams
              </Link>
              <Link to="/contacts" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted">
                <Contact className="h-4 w-4" />
                Contacts
              </Link>
              <Link to="/reports" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted">
                <BarChart2 className="h-4 w-4" />
                Reports
              </Link>
            </nav>
          </div>

          {isAuthenticated && (
            <>
              <Separator className="my-2" />
              
              <div className="px-4 py-2">
                <div className="mb-4">
                  <p className="font-medium text-sm text-muted-foreground mb-2">Availability</p>
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
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm">Mark offline automatically</p>
                  <Switch 
                    checked={autoOffline} 
                    onCheckedChange={setAutoOffline} 
                    className="data-[state=checked]:bg-blue-500" 
                  />
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="px-4 py-2">
                <div className="font-medium text-sm text-muted-foreground mb-2">Account</div>
                <nav className="grid gap-1">
                  <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted w-full text-left">
                    <HelpCircle className="h-4 w-4" />
                    Contact support
                  </button>
                  <button className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted w-full text-left">
                    <Keyboard className="h-4 w-4" />
                    Keyboard shortcuts
                  </button>
                  <button className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted w-full text-left">
                    <Settings className="h-4 w-4" />
                    Profile settings
                  </button>
                  <button className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted w-full text-left">
                    <Moon className="h-4 w-4" />
                    Change appearance
                  </button>
                  <button className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted w-full text-left">
                    <FileText className="h-4 w-4" />
                    Read documentation
                  </button>
                </nav>
              </div>
            </>
          )}
        </div>

        {isAuthenticated && (
          <div className="p-4 mt-auto">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
