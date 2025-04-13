
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! The page you're looking for doesn't exist.</p>
        <p className="text-gray-500 mb-8">
          The path <span className="font-mono bg-gray-100 px-2 py-1 rounded">{location.pathname}</span> was not found.
        </p>
        <Button asChild size="lg">
          <Link to="/dashboard" className="inline-flex items-center">
            <Home className="mr-2 h-5 w-5" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
