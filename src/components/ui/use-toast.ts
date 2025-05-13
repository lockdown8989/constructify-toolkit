
// Import from react-hot-toast or your toast library
import { Toast, ToastActionElement, toast as shadcnToast } from "@/components/ui/toast";

// Re-export the types
export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
export type ToastActionProps = React.ComponentPropsWithoutRef<typeof ToastActionElement>;

// Create the useToast hook
export const useToast = () => {
  const { toasts, dismiss, toast } = shadcnToast;
  return { toasts, dismiss, toast };
};

// Re-export the toast function for direct use
export const toast = shadcnToast;
