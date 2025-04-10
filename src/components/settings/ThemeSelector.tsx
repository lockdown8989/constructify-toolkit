
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeSelector = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  const isDarkTheme = theme === "dark";
  
  return (
    <div className="space-y-2">
      <Label htmlFor="dark-mode">Dark Theme</Label>
      <div className="flex items-center space-x-4">
        <Sun className="h-5 w-5 text-muted-foreground" />
        <Switch 
          id="dark-mode"
          checked={isDarkTheme}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
        <Moon className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground ml-2">
          {isDarkTheme ? "Dark mode enabled" : "Light mode enabled"}
        </span>
      </div>
    </div>
  );
};
