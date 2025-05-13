
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If user is authenticated, redirect to Dashboard, otherwise redirect to Landing Page
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />;
};

export default Index;
