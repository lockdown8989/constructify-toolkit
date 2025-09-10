
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import { useMobileDebugger } from "@/hooks/useMobileDebugger";
import { MobileAuthErrorBoundary } from "@/components/auth/MobileAuthErrorBoundary";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuthLoadingOptimizer } from "@/components/auth/AuthLoadingOptimizer";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();
  
  // Enable mobile debugging
  useMobileDebugger();
  
  console.log('📱 Index page render:', {
    hasUser: !!user,
    isLoading,
    isMobile,
    userEmail: user?.email,
    pathname: window.location.pathname,
    timestamp: new Date().toISOString()
  });

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600">Loading...</p>
          {isMobile && (
            <p className="text-xs text-gray-400 mt-2">Mobile mode detected</p>
          )}
        </div>
      </div>
    );
  }
  
  // If user is authenticated, show Dashboard with error boundary, otherwise redirect to Auth
  if (user) {
    console.log('✅ User authenticated, showing Dashboard');
    return (
      <AuthLoadingOptimizer>
        <MobileAuthErrorBoundary>
          <Dashboard />
        </MobileAuthErrorBoundary>
      </AuthLoadingOptimizer>
    );
  }

  console.log('❌ User not authenticated, redirecting to /auth');
  return <Navigate to="/auth" />;
};

export default Index;
