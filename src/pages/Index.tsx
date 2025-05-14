
import { useAuth } from "@/hooks/auth";
import { Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";

const Index = () => {
  const { user } = useAuth();
  
  // If user is authenticated, show Dashboard, otherwise redirect to Auth
  return user ? <Dashboard /> : <Navigate to="/auth" />;
};

export default Index;
