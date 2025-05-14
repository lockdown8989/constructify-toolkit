
import React, { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';

export interface CountryInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const CountryInput = ({ value, onChange }: CountryInputProps) => {
  return (
    <Input
      id="country"
      value={value}
      onChange={onChange}
      placeholder="Enter your country"
    />
  );
};

export default CountryInput;
