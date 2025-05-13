
import { useAuth } from "@/hooks/use-auth";
import LandingPage from "./LandingPage";
import Dashboard from "./Dashboard";

const Index = () => {
  const { user } = useAuth();
  
  // If user is authenticated, show Dashboard, otherwise show Landing Page
  return user ? <Dashboard /> : <LandingPage />;
};

export default Index;
