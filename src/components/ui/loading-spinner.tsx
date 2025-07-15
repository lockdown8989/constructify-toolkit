import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const LoadingSpinner = ({ className, size = "md" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className="flex items-center justify-center p-8" role="status" aria-label="Loading">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;