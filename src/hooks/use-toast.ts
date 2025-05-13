
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title: string;
  description?: string;
  type?: "default" | "success" | "info" | "warning" | "error";
  duration?: number;
};

// Create a simpler interface for our toast function that matches what our app expects
export const toast = ({
  title,
  description,
  type = "default",
  duration = 5000,
}: ToastProps) => {
  const toastType = type === "default" ? undefined : type;

  return sonnerToast(title, {
    description,
    duration,
    // Map our types to sonner's variant
    variant: toastType as "success" | "info" | "warning" | "error" | undefined,
  });
};

export const useToast = () => {
  return {
    toast,
  };
};
