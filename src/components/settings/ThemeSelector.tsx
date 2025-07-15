
import { useTheme } from "@/components/theme-provider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const ThemeSelector = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  const isDarkTheme = theme === "dark";
  
  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme enabled`,
      description: `Application theme has been changed to ${newTheme} mode.`,
    });
  };
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          {isDarkTheme ? (
            <Moon className="h-5 w-5 text-primary" />
          ) : (
            <Sun className="h-5 w-5 text-primary" />
          )}
        </div>
        <div>
          <Label htmlFor="dark-mode" className="text-base font-medium">
            Dark Theme
          </Label>
          <p className="text-sm text-muted-foreground">
            {isDarkTheme ? "Dark mode enabled" : "Light mode enabled"}
          </p>
        </div>
      </div>
      <Switch 
        id="dark-mode"
        checked={isDarkTheme}
        onCheckedChange={handleThemeChange}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
};
