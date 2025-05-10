
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; 
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./hooks/auth";
import { CurrencyProvider } from "@/hooks/use-currency-preference";
import { LanguageProvider } from "@/hooks/use-language";
import { NotificationProvider } from "@/hooks/use-notification-settings";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import RouterComponent from "./routes/routes";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="ui-theme">
            <CurrencyProvider>
              <LanguageProvider>
                <NotificationProvider>
                  <RouterComponent />
                  <Toaster />
                  <SonnerToaster />
                </NotificationProvider>
              </LanguageProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
