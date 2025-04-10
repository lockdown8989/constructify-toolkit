
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./hooks/auth";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { CurrencyProvider } from "@/hooks/use-currency-preference";
import AppRoutes from "./routes/routes";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <AuthProvider>
          <CurrencyProvider>
            <AppRoutes />
            <Toaster />
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
