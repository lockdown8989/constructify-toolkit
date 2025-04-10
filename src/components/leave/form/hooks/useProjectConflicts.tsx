
import { useEffect } from "react";
import { checkProjectConflicts } from "@/utils/leave-utils";
import type { ProjectConflict } from "@/utils/leave-utils";
import type { Project } from "@/hooks/use-projects";

/**
 * Hook to check for project conflicts with leave dates
 */
export const useProjectConflicts = (
  startDate: Date | undefined,
  endDate: Date | undefined,
  departmentProjects: Project[],
  setConflicts: (conflicts: ProjectConflict[]) => void
) => {
  // Update conflicts when dates or projects change
  useEffect(() => {
    if (startDate && endDate && departmentProjects.length > 0) {
      const projectConflicts = checkProjectConflicts(startDate, endDate, departmentProjects);
      setConflicts(projectConflicts);
    } else {
      setConflicts([]);
    }
  }, [startDate, endDate, departmentProjects, setConflicts]);
};
