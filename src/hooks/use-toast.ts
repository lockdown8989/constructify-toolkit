
import { useToast as useToastUI } from "@/components/ui/use-toast";
import { toast as toastUI } from "@/components/ui/use-toast";

// Re-export toast hook and toast function from UI components
export const useToast = useToastUI;
export const toast = toastUI;
