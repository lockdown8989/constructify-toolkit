
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DAYS_OF_WEEK, ShiftPattern, EmployeeShiftAssignment } from '@/types/shift-patterns';

interface DaySpecificAssignmentsProps {
  shiftPatterns: ShiftPattern[];
  assignments: EmployeeShiftAssignment;
  onAssignmentChange: (key: string, value: string) => void;
}

const DaySpecificAssignments = ({ shiftPatterns, assignments, onAssignmentChange }: DaySpecificAssignmentsProps) => {
  return (
    <div className="border-t pt-4">
      <h4 className="font-medium mb-4">Day-Specific Assignments</h4>
      <div className="grid gap-3">
        {DAYS_OF_WEEK.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <Label className="w-20">{label}</Label>
            <div className="flex-1 ml-4">
              <Select 
                value={assignments[key] || ''} 
                onValueChange={(value) => onAssignmentChange(key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Use default or select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Use default pattern</SelectItem>
                  {shiftPatterns.map((pattern) => {
                    if (!pattern || !pattern.id || !pattern.name) {
                      return null;
                    }
                    
                    return (
                      <SelectItem key={pattern.id} value={pattern.id}>
                        {pattern.name} ({pattern.start_time} - {pattern.end_time})
                      </SelectItem>
                    );
                  }).filter(Boolean)}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DaySpecificAssignments;
