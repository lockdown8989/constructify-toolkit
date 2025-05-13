

import { toast as sonnerToast, type ExternalToast } from "sonner";

export type ToastProps = {
  title: string;
  description?: string;
  type?: "default" | "success" | "info" | "warning" | "error";
  duration?: number;
  // Add variant as an alias for type to maintain compatibility with both APIs
  variant?: "default" | "success" | "info" | "warning" | "destructive";
};

// Create a simpler interface for our toast function that matches what our app expects
export const toast = ({
  title,
  description,
  type = "default",
  variant,
  duration = 5000,
}: ToastProps) => {
  // Handle both type and variant parameters, prioritizing variant if both are provided
  // Map "destructive" variant to "error" type
  let toastType = variant ? 
    (variant === "destructive" ? "error" : variant) : 
    (type === "default" ? undefined : type);

  // Convert our toast props to match sonner's expected format
  const sonnerOptions: ExternalToast = {
    description,
    duration,
  };
  
  // Only add the type if it's defined and valid
  if (toastType) {
    // TypeScript cast - the ExternalToast interface in sonner uses 'type' not 'variant'
    sonnerOptions.type = toastType as any;
  }

  return sonnerToast(title, sonnerOptions);
};

export const useToast = () => {
  return {
    toast,
  };
};

