
import { toast as sonnerToast, type ToastT as SonnerToast, useToaster } from "sonner";

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
  id?: string | number;
}

export type ToastActionElement = React.ReactElement<{
  onClick: () => void;
  className?: string;
  altText?: string;
}>;

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
  // Get the toaster instance from sonner
  const { toasts: sonnerToasts } = useToaster();
  
  // Map sonner toasts to our format expected by the Toaster component
  const toasts = sonnerToasts.map(sonnerToast => ({
    id: sonnerToast.id,
    title: sonnerToast.title,
    description: sonnerToast.description,
    action: sonnerToast.action ? {
      label: sonnerToast.action.label,
      onClick: sonnerToast.action.onClick,
    } : undefined,
    variant: (sonnerToast as any).type || "default"
  }));

  return {
    toast,
    toasts,
  };
};
