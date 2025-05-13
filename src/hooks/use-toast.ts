
import { toast as sonnerToast, type ToastT as SonnerToast } from "sonner";

export interface ToastProps {
  title?: string;
  description?: string;
  type?: "default" | "success" | "info" | "warning" | "destructive";
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// This will forward our toast function to sonner's toast
export const toast = ({ 
  title, 
  description, 
  type = "default",
  variant,
  duration, 
  action 
}: ToastProps) => {
  const actualType = type || variant || "default";
  
  return sonnerToast(title as string, {
    description,
    duration,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
    // Type assertion to handle the fact that Sonner's ExternalToast doesn't include 'type'
    ...({ type: actualType } as any),
  });
};

export const useToast = () => {
  return {
    toast,
  };
};
