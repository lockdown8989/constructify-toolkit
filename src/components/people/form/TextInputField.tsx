
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EmployeeFormValues } from './employeeSchema';

interface TextInputFieldProps {
  control: Control<EmployeeFormValues>;
  name: keyof EmployeeFormValues;
  label: string;
  placeholder: string;
  type?: string;
}

export function TextInputField({ 
  control, 
  name, 
  label, 
  placeholder, 
  type = 'text' 
}: TextInputFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
