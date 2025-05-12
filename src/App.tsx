
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./AppRoutes";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./hooks/auth";
import { CurrencyProvider } from "./hooks/use-currency-preference";
import { LanguageProvider } from "@/hooks/use-language";
import { NotificationProvider } from "@/hooks/use-notification-settings";
import AttendanceSyncProvider from "@/components/attendance/AttendanceSyncProvider";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <CurrencyProvider>
              <LanguageProvider>
                <NotificationProvider>
                  <AttendanceSyncProvider>
                    <AppRoutes />
                    <Toaster />
                  </AttendanceSyncProvider>
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
