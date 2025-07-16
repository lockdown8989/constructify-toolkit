
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import LandingPage from "./LandingPage";

const Index = () => {
  const { user } = useAuth();
  
  // If user is authenticated, show Dashboard, otherwise show Landing Page
  return user ? <Dashboard /> : <LandingPage />;
};

export default Index;
