
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LEAVE_TYPES = [
  { id: 'Holiday', label: 'Holiday', color: 'bg-blue-500' },
  { id: 'Sickness', label: 'Sickness', color: 'bg-red-500' },
  { id: 'Personal', label: 'Personal', color: 'bg-purple-500' },
  { id: 'Parental', label: 'Parental', color: 'bg-green-500' },
  { id: 'Annual', label: 'Annual', color: 'bg-blue-500' },
  { id: 'Sick', label: 'Sick', color: 'bg-red-500' },
  { id: 'Other', label: 'Other', color: 'bg-gray-600' },
];

interface LeaveTypeFilterProps {
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
  onClose: () => void;
}

export default function LeaveTypeFilter({ selectedTypes, onTypeChange, onClose }: LeaveTypeFilterProps) {
  const handleTypeToggle = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onTypeChange(selectedTypes.filter(id => id !== typeId));
    } else {
      onTypeChange([...selectedTypes, typeId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedTypes.length === LEAVE_TYPES.length) {
      onTypeChange([]);
    } else {
      onTypeChange(LEAVE_TYPES.map(type => type.id));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Filter Leave Types</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 text-sm"
            >
              {selectedTypes.length === LEAVE_TYPES.length ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-sm text-gray-600">
              {selectedTypes.length} of {LEAVE_TYPES.length} selected
            </span>
          </div>
          
          <div className="space-y-3">
            {LEAVE_TYPES.map((type) => (
              <div key={type.id} className="flex items-center space-x-3">
                <Checkbox
                  id={type.id}
                  checked={selectedTypes.includes(type.id)}
                  onCheckedChange={() => handleTypeToggle(type.id)}
                />
                <div className={`w-3 h-3 rounded-full ${type.color}`} />
                <label
                  htmlFor={type.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onClose} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
