
import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  let variant: "default" | "destructive" | "outline" | "secondary" = "default";
  
  switch (status) {
    case 'Approved':
      variant = "default";
      break;
    case 'Rejected':
      variant = "destructive";
      break;
    case 'Pending':
      variant = "secondary";
      break;
    default:
      variant = "outline";
  }
  
  return (
    <Badge variant={variant}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
