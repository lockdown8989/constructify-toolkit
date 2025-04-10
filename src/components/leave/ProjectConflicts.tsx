
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { ProjectConflict } from '@/utils/leave-utils';
import type { Conflict } from './form/hooks/useFormState';

interface ProjectConflictsProps {
  conflicts: ProjectConflict[] | Conflict[];
}

const ProjectConflicts: React.FC<ProjectConflictsProps> = ({ conflicts }) => {
  if (conflicts.length === 0) return null;
  
  return (
    <div className="space-y-3">
      {conflicts.map((conflict, index) => {
        const icon = conflict.conflictSeverity === 'High' ? 
          <AlertTriangle className="h-4 w-4" /> : 
          conflict.conflictSeverity === 'Medium' ? 
            <AlertCircle className="h-4 w-4" /> : 
            <Info className="h-4 w-4" />;
        
        // Get deadline from either format of conflict object
        const deadline = 'deadline' in conflict ? conflict.deadline : 
                        'projectDeadline' in conflict ? conflict.projectDeadline : '';
        
        // Get days until deadline
        const daysUntilDeadline = 'daysUntilDeadline' in conflict ? conflict.daysUntilDeadline : 0;
        
        // Get priority
        const priority = 'priority' in conflict ? conflict.priority : 'Unknown';
        
        return (
          <Alert key={index} className={`${
            conflict.conflictSeverity === 'High' ? 'border-red-500 bg-red-50 text-red-800' : 
            conflict.conflictSeverity === 'Medium' ? 'border-amber-500 bg-amber-50 text-amber-800' : 
            'border-blue-500 bg-blue-50 text-blue-800'
          }`}>
            {icon}
            <AlertTitle>Project Deadline Conflict</AlertTitle>
            <AlertDescription>
              {conflict.projectName} is due on {deadline} ({daysUntilDeadline} days after your leave ends).
              This is a {priority.toLowerCase()} priority project.
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
};

export default ProjectConflicts;
