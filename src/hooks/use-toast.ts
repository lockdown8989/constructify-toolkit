
import { toast as sonnerToast, type ToastOptions as SonnerToastOptions } from 'sonner';

export interface ToastOptions extends SonnerToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const toast = ({
    title,
    description,
    variant = 'default',
    action,
    ...props
  }: ToastOptions) => {
    return sonnerToast[variant === 'destructive' ? 'error' : 
           variant === 'success' ? 'success' : 
           variant === 'warning' ? 'warning' : 
           variant === 'info' ? 'info' : 'default']
    (title, {
      description,
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined,
      ...props
    });
  };

  return {
    toast
  };
}

export { toast } from 'sonner';
