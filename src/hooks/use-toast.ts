
import { toast as sonnerToast } from "sonner"

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
    }

    return sonnerToast(props.title, {
      description: props.description,
      action: props.action,
      type: variant ? variantToType[variant] : undefined,
      duration: props.duration,
    })
  }

  return { toast }
}

export { sonnerToast as toast }
