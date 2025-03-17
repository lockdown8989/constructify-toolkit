
import React from 'react';
import { Control } from 'react-hook-form';
import { TextInputField } from './TextInputField';
import { StatusSelect } from './StatusSelect';
import { EmployeeFormValues } from './employeeSchema';

interface EmployeeFormFieldsProps {
  control: Control<EmployeeFormValues>;
}

export function EmployeeFormFields({ control }: EmployeeFormFieldsProps) {
  return (
    <>
      <TextInputField
        control={control}
        name="name"
        label="Full Name"
        placeholder="John Doe"
      />
      
      <TextInputField
        control={control}
        name="job_title"
        label="Job Title"
        placeholder="Software Engineer"
      />
      
      <TextInputField
        control={control}
        name="department"
        label="Department"
        placeholder="Engineering"
      />
      
      <TextInputField
        control={control}
        name="site"
        label="Site/Location"
        placeholder="New York Office"
      />
      
      <TextInputField
        control={control}
        name="salary"
        label="Annual Salary"
        placeholder="75000"
        type="number"
      />
      
      <StatusSelect control={control} />
    </>
  );
}
