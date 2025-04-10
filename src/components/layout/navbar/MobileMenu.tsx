
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  MessageCircle, 
  AtSign, 
  Inbox, 
  Folder, 
  Users, 
  Contact, 
  BarChart2, 
  User, 
  LogOut, 
  HelpCircle, 
  Keyboard, 
  Settings, 
  Moon, 
  FileText, 
  ChevronRight,
  Home,
  Phone
} from "lucide-react";
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
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const menuItems = [
    { 
      title: "Main", 
      items: [
        { name: "Home", icon: <Home className="h-5 w-5" />, path: "/" },
        { name: "All Conversations", icon: <MessageCircle className="h-5 w-5" />, path: "/conversations" },
        { name: "Mentions", icon: <AtSign className="h-5 w-5" />, path: "/mentions" },
        { name: "Unattended", icon: <Inbox className="h-5 w-5" />, path: "/unattended" },
        { name: "Contact", icon: <Phone className="h-5 w-5" />, path: "/contact" }
      ] 
    },
    { 
      title: "Organization", 
      items: [
        { name: "Folders", icon: <Folder className="h-5 w-5" />, path: "/folders" },
        { name: "Teams", icon: <Users className="h-5 w-5" />, path: "/teams" },
        { name: "Contacts", icon: <Contact className="h-5 w-5" />, path: "/contacts" },
        { name: "Reports", icon: <BarChart2 className="h-5 w-5" />, path: "/reports" }
      ] 
    },
    ...(isAuthenticated ? [{ 
      title: "Account", 
      items: [
        { name: "Profile", icon: <User className="h-5 w-5" />, path: "/profile" },
        { name: "Support", icon: <HelpCircle className="h-5 w-5" />, path: "/support", action: true },
        { name: "Keyboard Shortcuts", icon: <Keyboard className="h-5 w-5" />, path: "/shortcuts", action: true },
        { name: "Settings", icon: <Settings className="h-5 w-5" />, path: "/settings", action: true },
        { name: "Appearance", icon: <Moon className="h-5 w-5" />, path: "/appearance", action: true },
        { name: "Documentation", icon: <FileText className="h-5 w-5" />, path: "/docs", action: true }
      ] 
    }] : [])
  ];

  return (
    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-10 w-10 rounded-full p-0 flex items-center justify-center"
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="flex flex-col p-0 max-w-[85vw] sm:max-w-sm rounded-r-xl shadow-lg safe-area-inset momentum-scroll"
      >
        {isAuthenticated && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 relative">
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background z-10">
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

        <div className="overflow-y-auto flex-1 pb-safe">
          {menuItems.map((section, idx) => (
            <div key={idx} className="px-2 py-3">
              <div className="font-medium text-sm text-muted-foreground px-3 mb-1">{section.title}</div>
              <nav className="grid gap-0.5">
                {section.items.map((item, itemIdx) => (
                  <Link 
                    key={itemIdx} 
                    to={item.action ? "#" : item.path}
                    onClick={() => {
                      if (item.action) {
                        // Handle action items
                        console.log(`Action: ${item.name}`);
                      } else {
                        setIsMenuOpen(false);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 text-sm rounded-lg touch-target", 
                      location.pathname === item.path 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "hover:bg-muted/80 active:bg-muted",
                      "transition-colors duration-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full",
                        location.pathname === item.path 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground"
                      )}>
                        {item.icon}
                      </div>
                      <span>{item.name}</span>
                    </div>
                    {!item.action && <ChevronRight className="h-4 w-4 text-muted-foreground/50" />}
                  </Link>
                ))}
              </nav>
            </div>
          ))}

          {isAuthenticated && (
            <div className="px-2 py-3">
              <div className="mb-4 px-3">
                <p className="font-medium text-sm text-muted-foreground mb-2">Availability</p>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full justify-between h-12 touch-target"
                  onClick={handleAvailabilityChange}
                >
                  <div className="flex items-center">
                    <div className={cn("h-3 w-3 rounded-full mr-2", availabilityOptions[availability].color)} />
                    {availabilityOptions[availability].label}
                  </div>
                </Button>
              </div>
              
              <div className="flex items-center justify-between px-3">
                <p className="text-sm">Mark offline automatically</p>
                <Switch 
                  checked={autoOffline} 
                  onCheckedChange={setAutoOffline} 
                  className="data-[state=checked]:bg-blue-500 scale-110" 
                />
              </div>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <div className="p-4 mt-auto border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start touch-target h-12 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={() => {
                signOut();
                setIsMenuOpen(false);
              }}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Log out
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
