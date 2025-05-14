
import React, { ChangeEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';

export interface CountryInputProps {
  country: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isLocating?: boolean;
  onDetect?: () => void;
}

const CountryInput = ({ country, onChange, isLocating, onDetect }: CountryInputProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Input
        id="country"
        name="country"
        value={country}
        onChange={onChange}
        placeholder="Enter your country"
        className="flex-1"
      />
      {onDetect && (
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          onClick={onDetect}
          disabled={isLocating}
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};

export default CountryInput;
