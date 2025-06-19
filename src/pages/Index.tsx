
import { useAuth } from "@/hooks/auth";
import { Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";

const Index = () => {
  const { user, isLoading } = useAuth();
  
  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If user is authenticated, show Dashboard, otherwise redirect to Auth
  return user ? <Dashboard /> : <Navigate to="/auth" />;
};

export default Index;
