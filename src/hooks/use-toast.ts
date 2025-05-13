
import { useToast as useToastUI, toast as toastUI } from "@/components/ui/toast";

// Re-export toast hook and toast function directly from UI components
export const useToast = useToastUI;
export const toast = toastUI;
