
import { useAuth } from "@/hooks/auth";
import { Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, isLoading } = useAuth();
  
  console.log('Index page state:', { user: !!user, isLoading });
  
  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If user is authenticated, show Dashboard, otherwise redirect to Auth
  if (user) {
    console.log('User authenticated, showing Dashboard');
    return <Dashboard />;
  } else {
    console.log('User not authenticated, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }
};

export default Index;
