
import { toast as sonnerToast, type ToastT, type ExternalToast } from "sonner"
import { ReactNode } from "react"

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  action?: React.ReactNode;
  duration?: number;
}

export function useToast() {
  const toast = (props: ToastProps) => {
    const { variant, ...rest } = props
    const variantToType = {
      default: undefined,
      destructive: "error",
      success: "success",
      warning: "warning",
    } as const
    
    // Convert our toast props to sonner's format
    const sonnerOptions: ExternalToast = {
      description: props.description,
      duration: props.duration,
    }
    
    if (props.action) {
      sonnerOptions.action = props.action
    }

    // Use the appropriate toast type based on variant
    if (variant && variantToType[variant]) {
      return sonnerToast[variantToType[variant] as keyof typeof sonnerToast](
        props.title || "", 
        sonnerOptions
      )
    } else {
      return sonnerToast(props.title || "", sonnerOptions)
    }
  }

  return { toast }
}

// Re-export the original toast function for direct use
export { sonnerToast as toast }
