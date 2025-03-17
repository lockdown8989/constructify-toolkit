
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { ProjectConflict } from '@/utils/leave-utils';

interface ProjectConflictsProps {
  conflicts: ProjectConflict[];
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
        
        const variantColor = conflict.conflictSeverity === 'High' ? 
          'destructive' : 
          conflict.conflictSeverity === 'Medium' ? 
            'warning' : 
            'info';
            
        return (
          <Alert key={index} variant={variantColor as any}>
            {icon}
            <AlertTitle>Project Deadline Conflict</AlertTitle>
            <AlertDescription>
              {conflict.projectName} is due on {conflict.deadline} ({conflict.daysUntilDeadline} days after your leave ends).
              This is a {conflict.priority.toLowerCase()} priority project.
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
};

export default ProjectConflicts;
