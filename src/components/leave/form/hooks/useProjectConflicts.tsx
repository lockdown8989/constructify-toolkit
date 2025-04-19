
import { useEffect } from "react";
import { checkProjectConflicts } from "@/utils/leave-utils";
import type { ProjectConflict } from "@/utils/leave-utils";
import type { Conflict } from "./useFormState";
import type { Project } from "@/hooks/use-projects";

/**
 * Hook to check for project conflicts with leave dates
 */
export const useProjectConflicts = (
  startDate: Date | undefined,
  endDate: Date | undefined,
  departmentProjects: Project[],
  setConflicts: (conflicts: Conflict[]) => void
) => {
  // Update conflicts when dates or projects change
  useEffect(() => {
    if (startDate && endDate && departmentProjects.length > 0) {
      const projectConflicts = checkProjectConflicts(startDate, endDate, departmentProjects);
      // Map ProjectConflict to Conflict type
      const mappedConflicts: Conflict[] = projectConflicts.map(conflict => ({
        projectName: conflict.projectName,
        deadline: conflict.deadline,
        daysUntilDeadline: conflict.daysUntilDeadline,
        priority: conflict.priority,
        conflictSeverity: conflict.conflictSeverity,
        // Include for backward compatibility
        projectDeadline: conflict.deadline,
        department: ''
      }));
      setConflicts(mappedConflicts);
    } else {
      setConflicts([]);
    }
  }, [startDate, endDate, departmentProjects, setConflicts]);
};
