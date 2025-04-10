
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./hooks/auth";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { CurrencyProvider } from "@/hooks/use-currency-preference";
import { LanguageProvider } from "@/hooks/use-language";
import { NotificationProvider } from "@/hooks/use-notification-settings";
import AppRoutes from "./routes/routes";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
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
  );
}

export default App;
