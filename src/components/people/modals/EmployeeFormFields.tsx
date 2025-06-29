
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EmployeeFormValues } from './employee-form-schema';
import { TabsContent } from '@/components/ui/tabs';
import PersonalInfoFields from './form-fields/PersonalInfoFields';
import OrganizationFields from './form-fields/OrganizationFields';
import EmploymentStatusFields from './form-fields/EmploymentStatusFields';
import CompensationFields from './form-fields/CompensationFields';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface EmployeeFormFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
  departments: string[];
  sites: string[];
  activeTab: string;
  isMobile: boolean;
}

const EmployeeFormFields: React.FC<EmployeeFormFieldsProps> = ({ 
  form, 
  departments, 
  sites,
  activeTab,
  isMobile
}) => {
  const cardClasses = isMobile ? "border shadow-sm mb-6" : "border shadow-sm";
  const cardContentClasses = "p-4";

  console.log('EmployeeFormFields activeTab:', activeTab);

  return (
    <div className="py-4">
      <TabsContent value="personal" className="mt-0 space-y-6">
        <Card className={cardClasses}>
          <CardContent className={cardContentClasses}>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Personal Information</h3>
            <Separator className="mb-4" />
            <PersonalInfoFields form={form} />
          </CardContent>
        </Card>
        
        <Card className={cardClasses}>
          <CardContent className={cardContentClasses}>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Compensation</h3>
            <Separator className="mb-4" />
            <CompensationFields form={form} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="organization" className="mt-0 space-y-6">
        <Card className={cardClasses}>
          <CardContent className={cardContentClasses}>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Organization Details</h3>
            <Separator className="mb-4" />
            <OrganizationFields form={form} departments={departments} sites={sites} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="employment" className="mt-0 space-y-6">
        <Card className={cardClasses}>
          <CardContent className={cardContentClasses}>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Employment Status</h3>
            <Separator className="mb-4" />
            <EmploymentStatusFields form={form} />
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
};

export default EmployeeFormFields;
