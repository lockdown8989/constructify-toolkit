
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

  // Comprehensive site/office options
  const siteOptions = [
    // General Office Types
    "Head Office",
    "Regional Office",
    "Branch Office",
    "Local Office",
    "Remote Office",
    "Shared Workspace",
    "Co-Working Space",
    "Virtual Office",
    "Satellite Office",
    "Mobile Office",
    "Back Office",
    "Front Office",
    "Field Office",
    "Main Site",
    "Central Office",
    "Hub Office",
    "Customer Service Centre",
    "Admin Centre",
    
    // Council / Government Specific
    "Town Hall",
    "Civic Centre",
    "Council Chambers",
    "Council Depot",
    "Waste Depot",
    "Recycling Centre",
    "Highways Depot",
    "Parks Depot",
    "Housing Office",
    "Community Centre",
    "Public Health Clinic",
    "Children's Services Centre",
    "Adult Social Care Office",
    "Environmental Health Office",
    "Trading Standards Office",
    "Licensing Office",
    "Registry Office",
    "Social Services Office",
    "Emergency Response Centre",
    "Benefits Office",
    "Planning Office",
    "Education Centre",
    "Library",
    "Leisure Centre",
    "Crematorium",
    "Cemetery Office",
    "Registrar Office",
    "Social Housing Hub",
    "Day Care Centre",
    "Youth Centre",
    
    // Emergency Services
    "Police Station",
    "Fire Station",
    "Ambulance Station",
    "Emergency Operations Centre",
    
    // Healthcare
    "GP Surgery",
    "NHS Trust Office",
    "Primary Care Centre",
    "Community Health Centre",
    "Walk-In Clinic",
    "Hospital",
    "Outpatient Centre",
    "Mental Health Centre",
    "Rehabilitation Centre",
    
    // Transport & Infrastructure
    "Transport Hub",
    "Bus Depot",
    "Train Depot",
    "Highway Maintenance Yard",
    "Ports Office",
    "Airport Operations Office",
    "Logistics Centre",
    "Distribution Centre",
    
    // Utilities / Waste / Environment
    "Waste Transfer Station",
    "Landfill Site",
    "Incineration Plant",
    "Water Treatment Plant",
    "Sewage Treatment Plant",
    "Energy Centre",
    "Flood Management Centre",
    "Environmental Monitoring Station",
    
    // Education / Training
    "School Site",
    "University Campus",
    "College Site",
    "Training Centre",
    "Apprenticeship Centre",
    
    // Miscellaneous Public Services
    "Citizens Advice Bureau",
    "Job Centre",
    "Probation Office",
    "Courts / Magistrates Office",
    "Immigration Office",
    "Passport Office",
    "Revenue & Customs Office",
    "Archives & Records Centre",
    "Coroner's Office"
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
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
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {siteOptions.map((site) => (
                  <SelectItem key={site} value={site}>
                    {site}
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
        name="location"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Schedule Location</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
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
