
import { differenceInCalendarDays, addDays, parseISO, format } from 'date-fns';
import type { Project } from '@/hooks/use-projects';

export interface ProjectConflict {
  projectName: string;
  deadline: string;
  daysUntilDeadline: number;
  priority: string;
  conflictSeverity: 'High' | 'Medium' | 'Low';
}

// Calculate the number of days between two dates (excluding weekends)
export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    currentDate = addDays(currentDate, 1);
  }
  
  return count;
}

// Check if there are any project deadlines that conflict with the leave dates
export function checkProjectConflicts(
  startDate: Date, 
  endDate: Date, 
  projects: Project[]
): ProjectConflict[] {
  const conflicts: ProjectConflict[] = [];
  const leaveEndDate = new Date(endDate);
  
  // Look for projects with deadlines within 2 weeks after the leave end date
  const twoWeeksAfterLeave = addDays(leaveEndDate, 14);
  
  for (const project of projects) {
    const deadlineDate = parseISO(project.deadline);
    
    // If the deadline is between the leave end date and 2 weeks after
    if (deadlineDate >= leaveEndDate && deadlineDate <= twoWeeksAfterLeave) {
      const daysUntilDeadline = differenceInCalendarDays(deadlineDate, leaveEndDate);
      
      // Determine conflict severity based on days until deadline and priority
      let conflictSeverity: 'High' | 'Medium' | 'Low' = 'Low';
      
      if (project.priority === 'High' && daysUntilDeadline <= 7) {
        conflictSeverity = 'High';
      } else if (project.priority === 'High' || daysUntilDeadline <= 5) {
        conflictSeverity = 'Medium';
      }
      
      conflicts.push({
        projectName: project.name,
        deadline: format(deadlineDate, 'MMM d, yyyy'),
        daysUntilDeadline,
        priority: project.priority,
        conflictSeverity
      });
    }
  }
  
  return conflicts;
}
