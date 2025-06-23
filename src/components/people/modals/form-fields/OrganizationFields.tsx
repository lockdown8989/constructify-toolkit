
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EmployeeFormValues } from '../employee-form-schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocations } from '@/hooks/use-locations';

interface OrganizationFieldsProps {
  form: UseFormReturn<EmployeeFormValues>;
  departments: string[];
  sites: string[];
}

const OrganizationFields: React.FC<OrganizationFieldsProps> = ({ 
  form, 
  departments = [],
  sites = []
}) => {
  const { data: locations = [] } = useLocations();

  // Comprehensive department list
  const departmentOptions = [
    "Accounting",
    "Adult Social Services",
    "Animal Control",
    "Business Development",
    "Children's Services",
    "Climate & Sustainability",
    "Compliance",
    "Customer Service",
    "Data Science",
    "DevOps",
    "Economic Development",
    "Education & Schools",
    "Elderly & Disability Services",
    "Emergency Management",
    "Environmental Services",
    "Event Management",
    "Facilities Management",
    "Faculty Development",
    "Finance",
    "Fire Department",
    "Food & Beverage",
    "Front Desk",
    "Governance & Elections",
    "Guest Services",
    "Hazardous Waste Management",
    "Health & Social Care",
    "Healthcare IT",
    "Housing & Community Development",
    "Human Resources",
    "Internal Audit",
    "IT (Information Technology)",
    "IT & Digital Services",
    "Laboratory",
    "Legal",
    "Legal & Compliance",
    "Libraries & Cultural Services",
    "Licensing & Regulatory Services",
    "Logistics",
    "Maintenance",
    "Marketing",
    "Medical Administration",
    "Merchandising",
    "Nursing",
    "Operations",
    "Org Mapping",
    "Parks & Recreation",
    "Patient Services",
    "Payroll",
    "Pharmacy",
    "Planning & Zoning",
    "Police Department",
    "Procurement / Purchasing",
    "Procurement & Contracts",
    "Product Management",
    "Production",
    "Public Health",
    "Public Relations",
    "Public Safety",
    "Public Works",
    "Quality Assurance",
    "Quality Control",
    "Radiology",
    "Reception",
    "Recycling & Waste Management",
    "Refuse Collection",
    "Research Administration",
    "Research & Development",
    "Safety & Environmental",
    "Sales",
    "Sanitation Services",
    "Security",
    "Software Engineering",
    "Strategy & Planning",
    "Street Cleaning",
    "Student Services",
    "Supply Chain",
    "Tax & Revenue",
    "Technical Support",
    "Tourism & Events",
    "Training & Development",
    "Transportation & Traffic",
    "UI/UX Design",
    "Waste Services",
    "Waste Management",
    "Water & Sewer Services",
    "Youth Services"
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="site"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Site/Office</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {sites.length > 0 ? (
                  sites.map((site) => (
                    <SelectItem key={site} value={site}>
                      {site}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="HQ - San Francisco">HQ - San Francisco</SelectItem>
                    <SelectItem value="New York Office">New York Office</SelectItem>
                    <SelectItem value="Remote - US">Remote - US</SelectItem>
                    <SelectItem value="Remote - International">Remote - International</SelectItem>
                    <SelectItem value="London">London</SelectItem>
                    <SelectItem value="Remote EU">Remote EU</SelectItem>
                    <SelectItem value="San Francisco">San Francisco</SelectItem>
                    <SelectItem value="New York">New York</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Schedule Location</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule location" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.name}>
                    {location.name}
                    {location.address && (
                      <span className="text-sm text-gray-500 ml-2">
                        - {location.address}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default OrganizationFields;
