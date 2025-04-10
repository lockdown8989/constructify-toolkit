
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
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
      
      <div className="flex p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
        <div 
          className={`flex-1 flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-colors ${
            !isDarkTheme ? "bg-white dark:bg-slate-700 shadow-sm" : ""
          }`} 
          onClick={() => setTheme("light")}
        >
          <Sun className={`h-8 w-8 mb-2 ${!isDarkTheme ? "text-amber-500" : "text-muted-foreground"}`} />
          <span className={`text-sm font-medium ${!isDarkTheme ? "text-foreground" : "text-muted-foreground"}`}>{t('light')}</span>
        </div>
        <div 
          className={`flex-1 flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-colors ${
            isDarkTheme ? "bg-slate-900 shadow-sm" : ""
          }`} 
          onClick={() => setTheme("dark")}
        >
          <Moon className={`h-8 w-8 mb-2 ${isDarkTheme ? "text-indigo-400" : "text-muted-foreground"}`} />
          <span className={`text-sm font-medium ${isDarkTheme ? "text-foreground" : "text-muted-foreground"}`}>{t('dark')}</span>
        </div>
      </div>
    </div>
  );
};
