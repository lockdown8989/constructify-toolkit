
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, Laptop } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";

export const ThemeSelector = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  const isDarkTheme = theme === "dark";
  const isSystemTheme = theme === "system";
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="dark-mode" className="text-base font-medium">
            {t('darkMode')}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t('useDarkTheme')}
          </p>
        </div>
        <Switch 
          id="dark-mode"
          checked={isDarkTheme}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          className="data-[state=checked]:bg-blue-500"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
        <div 
          className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-colors ${
            theme === "light" ? "bg-white dark:bg-slate-700 shadow-sm" : ""
          }`} 
          onClick={() => setTheme("light")}
        >
          <Sun className={`h-8 w-8 mb-2 ${theme === "light" ? "text-amber-500" : "text-muted-foreground"}`} />
          <span className={`text-sm font-medium ${theme === "light" ? "text-foreground" : "text-muted-foreground"}`}>{t('light')}</span>
        </div>
        
        <div 
          className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-colors ${
            theme === "dark" ? "bg-slate-900 shadow-sm" : ""
          }`} 
          onClick={() => setTheme("dark")}
        >
          <Moon className={`h-8 w-8 mb-2 ${theme === "dark" ? "text-indigo-400" : "text-muted-foreground"}`} />
          <span className={`text-sm font-medium ${theme === "dark" ? "text-foreground" : "text-muted-foreground"}`}>{t('dark')}</span>
        </div>
        
        <div 
          className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-colors ${
            theme === "system" ? "bg-white dark:bg-slate-700 shadow-sm" : ""
          }`} 
          onClick={() => setTheme("system")}
        >
          <Laptop className={`h-8 w-8 mb-2 ${theme === "system" ? "text-blue-500" : "text-muted-foreground"}`} />
          <span className={`text-sm font-medium ${theme === "system" ? "text-foreground" : "text-muted-foreground"}`}>{t('system')}</span>
        </div>
      </div>
    </div>
  );
};
