
// Re-export the useToast hook from our custom hooks directory
import { useToast, toast, ToastOptions, ToastProps } from "@/hooks/use-toast";

export { useToast, toast };
export type { ToastOptions, ToastProps };
