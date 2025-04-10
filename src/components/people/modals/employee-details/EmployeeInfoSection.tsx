
import React from 'react';
import { Briefcase, MapPin, DollarSign, Calendar, Users, Mail, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Employee } from '@/components/people/types';

interface EmployeeInfoSectionProps {
  employee: Employee;
}

const EmployeeInfoSection: React.FC<EmployeeInfoSectionProps> = ({
  employee,
}) => {
  return (
    <div className="p-4 sm:p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Employee Information</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <InfoItem icon={<Briefcase className="h-4 w-4 text-indigo-500" />} 
                 label="Department" 
                 value={employee.department} />
        
        <InfoItem icon={<MapPin className="h-4 w-4 text-indigo-500" />} 
                 label="Site" 
                 value={`${employee.siteIcon} ${employee.site}`} />
        
        <InfoItem icon={<DollarSign className="h-4 w-4 text-indigo-500" />} 
                 label="Salary" 
                 value={employee.salary} />
        
        <InfoItem icon={<Calendar className="h-4 w-4 text-indigo-500" />} 
                 label="Start Date" 
                 value={employee.startDate} />
        
        <InfoItem icon={<Users className="h-4 w-4 text-indigo-500" />} 
                 label="Lifecycle" 
                 value={employee.lifecycle} />
      </div>

      <Separator className="my-4 sm:my-6" />

      <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Contact Information</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <InfoItem icon={<Mail className="h-4 w-4 text-indigo-500" />} 
                 label="Email" 
                 value={`${employee.name.toLowerCase().replace(/\s/g, '.')}@company.com`} />
        
        <InfoItem icon={<Phone className="h-4 w-4 text-indigo-500" />} 
                 label="Phone" 
                 value={`+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`} />
      </div>
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => {
  return (
    <div className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-2 bg-white rounded-md shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="font-medium break-words">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeInfoSection;
