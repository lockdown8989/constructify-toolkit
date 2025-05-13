
// This is a re-export file to maintain backward compatibility
// while transitioning to the new import path
import { useToast as shadcnUseToast, toast as shadcnToast } from "@/components/ui/use-toast";

export const useToast = shadcnUseToast;
export const toast = shadcnToast;
