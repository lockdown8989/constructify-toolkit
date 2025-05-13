
import { toast as sonnerToast, useToast as useSonnerToast } from "sonner";

export const toast = sonnerToast;

export const useToast = () => {
  return {
    toast: sonnerToast
  };
};
