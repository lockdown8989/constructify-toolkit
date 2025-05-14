
import { useState, useCallback } from "react";
import { toast as sonnerToast } from "sonner";

type ToastType = "default" | "destructive" | "success" | "warning" | "info";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = useCallback(({ title, description, variant = "default", duration = 5000 }: ToastOptions) => {
    const id = Date.now().toString();
    
    const newToast = { title, description, variant, duration };
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // Use appropriate variant for sonner toast
    switch (variant) {
      case "destructive":
        sonnerToast.error(title, { description, duration });
        break;
      case "success":
        sonnerToast.success(title, { description, duration });
        break;
      case "warning":
        sonnerToast.warning(title, { description, duration });
        break;
      case "info":
        sonnerToast.info(title, { description, duration });
        break;
      default:
        sonnerToast(title, { description, duration });
    }
    
    return id;
  }, []);
  
  return { toast, toasts };
};

// Export a simplified toast function for direct imports
export const toast = (options: ToastOptions) => {
  const { variant = "default", duration = 5000 } = options;
  
  switch (variant) {
    case "destructive":
      sonnerToast.error(options.title, { description: options.description, duration });
      break;
    case "success":
      sonnerToast.success(options.title, { description: options.description, duration });
      break;
    case "warning":
      sonnerToast.warning(options.title, { description: options.description, duration });
      break;
    case "info":
      sonnerToast.info(options.title, { description: options.description, duration });
      break;
    default:
      sonnerToast(options.title, { description: options.description, duration });
  }
};
