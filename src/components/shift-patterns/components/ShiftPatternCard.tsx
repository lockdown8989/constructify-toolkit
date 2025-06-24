
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Users } from 'lucide-react';
import { ShiftPattern } from '@/types/shift-patterns';

interface ShiftPatternCardProps {
  pattern: ShiftPattern;
  assignedEmployees: any[];
  onEdit: (pattern: ShiftPattern) => void;
  onDelete: (id: string) => void;
}

export const ShiftPatternCard = ({ pattern, assignedEmployees, onEdit, onDelete }: ShiftPatternCardProps) => {
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex flex-col p-4 border rounded-lg gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-base sm:text-lg">{pattern.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatTime(pattern.start_time)} - {formatTime(pattern.end_time)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Break: {pattern.break_duration}min | Grace: {pattern.grace_period_minutes}min
          </p>
          
          {/* Assigned Employees Section */}
          {assignedEmployees.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Assigned Employees ({assignedEmployees.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {assignedEmployees.slice(0, 3).map((employee) => (
                  <Badge key={employee.id} variant="secondary" className="text-xs">
                    {employee.name}
                  </Badge>
                ))}
                {assignedEmployees.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{assignedEmployees.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 self-end sm:self-start">
          <Button variant="outline" size="sm" onClick={() => onEdit(pattern)}>
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(pattern.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
