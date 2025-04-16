import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme | ((theme: Theme) => Theme)) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserTheme = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('theme')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching theme:', error);
          return;
        }

        if (data?.theme) {
          setTheme(data.theme as Theme);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUserTheme();
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const updateTheme = async (newTheme: Theme | ((theme: Theme) => Theme)) => {
    const resolvedTheme = typeof newTheme === 'function' ? newTheme(theme) : newTheme;
    
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ theme: resolvedTheme })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating theme:', error);
          toast({
            title: "Error updating theme",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }

    localStorage.setItem(storageKey, resolvedTheme);
    setTheme(resolvedTheme);
  };

  const value = {
    theme,
    setTheme: updateTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
