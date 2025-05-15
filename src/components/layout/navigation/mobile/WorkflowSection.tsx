
import { Clock } from "lucide-react";
import MobileNavLink from "./MobileNavLink";

interface WorkflowSectionProps {
  hasManagerialAccess: boolean;
  onClose: () => void;
}

const WorkflowSection = ({ hasManagerialAccess, onClose }: WorkflowSectionProps) => {
  return (
    <>
      {hasManagerialAccess ? (
        <MobileNavLink
          to="/employee-workflow"
          icon={Clock}
          label="My Employee Shifts"
          onClick={onClose}
        />
      ) : (
        <MobileNavLink
          to="/employee-workflow"
          icon={Clock}
          label="Overview"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default WorkflowSection;
