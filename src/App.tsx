
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./hooks/auth";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { CurrencyProvider } from "@/hooks/use-currency-preference";
import { LanguageProvider } from "@/hooks/use-language";
import { NotificationProvider } from "@/hooks/use-notification-settings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; 
import AppRoutes from "./routes/routes";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
          <AuthProvider>
            <CurrencyProvider>
              <LanguageProvider>
                <NotificationProvider>
                  <AppRoutes />
                  <Toaster />
                </NotificationProvider>
              </LanguageProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
