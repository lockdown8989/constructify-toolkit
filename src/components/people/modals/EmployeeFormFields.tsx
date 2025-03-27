
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EmployeeFormValues } from './employee-form-schema';
import PersonalInfoFields from './form-fields/PersonalInfoFields';
import OrganizationFields from './form-fields/OrganizationFields';
import CompensationFields from './form-fields/CompensationFields';
import EmploymentStatusFields from './form-fields/EmploymentStatusFields';

interface EmployeeFormFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
  departments: string[];
  sites: string[];
}

const EmployeeFormFields: React.FC<EmployeeFormFieldsProps> = ({
  form,
  departments = [],
  sites = [],
}) => {
  return (
    <>
      <PersonalInfoFields form={form} />
      <OrganizationFields 
        control={form.control} 
        departments={departments} 
        sites={sites} 
      />
      <CompensationFields form={form} />
      <EmploymentStatusFields form={form} />
    </>
  );
};

export default EmployeeFormFields;
