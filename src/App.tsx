
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; 
import { ThemeProvider } from "@/components/theme-provider";
import { CurrencyProvider } from "@/hooks/use-currency-preference";
import { LanguageProvider } from "@/hooks/use-language";
import { NotificationProvider } from "@/hooks/use-notification-settings";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import RouterComponent from "./routes/routes";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <CurrencyProvider>
          <LanguageProvider>
            <NotificationProvider>
              <RouterComponent />
              {/* Use only one toaster */}
              <SonnerToaster />
            </NotificationProvider>
          </LanguageProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
