
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; 
import { ThemeProvider } from "@/components/theme-provider";
import { CurrencyProvider } from "@/hooks/use-currency-preference";
import { LanguageProvider } from "@/hooks/use-language";
import { NotificationProvider } from "@/hooks/use-notification-settings";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/auth";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App({ children }: { children?: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <LanguageProvider>
          <CurrencyProvider>
            <NotificationProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
              <Toaster />
              <SonnerToaster />
            </NotificationProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
