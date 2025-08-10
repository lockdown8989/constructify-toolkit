
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShiftPattern } from '@/types/shift-patterns';

interface DefaultPatternSelectorProps {
  shiftPatterns: ShiftPattern[];
  selectedPatternId: string;
  onPatternChange: (patternId: string) => void;
}

const DefaultPatternSelector = ({ shiftPatterns, selectedPatternId, onPatternChange }: DefaultPatternSelectorProps) => {
  return (
    <div>
      <Label htmlFor="default-pattern">Default Shift Pattern</Label>
      <Select 
        value={selectedPatternId && selectedPatternId.length > 0 ? selectedPatternId : '__none__'} 
        onValueChange={(val) => onPatternChange(val === '__none__' ? '' : val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select default pattern..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">No default pattern</SelectItem>
          {shiftPatterns.map((pattern) => {
            if (!pattern || !pattern.id || !pattern.name) {
              console.warn('Invalid shift pattern data:', pattern);
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
  );
};

export default DefaultPatternSelector;
