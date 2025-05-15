
import { Calendar, Calendar as CalendarIcon, Users } from "lucide-react";
import MobileNavLink from "./MobileNavLink";
import MobileNavDivider from "./MobileNavDivider";

interface WorkflowSectionProps {
  hasManagerialAccess: boolean;
  onClose: () => void;
}

const WorkflowSection = ({ hasManagerialAccess, onClose }: WorkflowSectionProps) => {
  return (
    <>
      <MobileNavDivider label="Workflow" />
      
      <MobileNavLink
        to="/employee-workflow"
        icon={Users}
        label={hasManagerialAccess ? "Employee Shifts" : "My Schedule"}
        onClick={onClose}
      />
      
      {!hasManagerialAccess && (
        <>
          <MobileNavLink
            to="/employee-calendar"
            icon={CalendarIcon}
            label="Employee Calendar"
            onClick={onClose}
          />
        </>
      )}
      
      {hasManagerialAccess && (
        <MobileNavLink
          to="/shift-calendar"
          icon={Calendar}
          label="Restaurant Schedule"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default WorkflowSection;
