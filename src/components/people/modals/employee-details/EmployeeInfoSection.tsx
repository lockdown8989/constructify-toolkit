
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
    <div className="p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-4">EMPLOYEE INFORMATION</h3>
      
      <div className="space-y-4">
        <InfoItem icon={<Briefcase className="h-4 w-4 text-gray-400" />} 
                 label="Department" 
                 value={employee.department} />
        
        <InfoItem icon={<MapPin className="h-4 w-4 text-gray-400" />} 
                 label="Site" 
                 value={`${employee.siteIcon} ${employee.site}`} />
        
        <InfoItem icon={<DollarSign className="h-4 w-4 text-gray-400" />} 
                 label="Salary" 
                 value={employee.salary} />
        
        <InfoItem icon={<Calendar className="h-4 w-4 text-gray-400" />} 
                 label="Start Date" 
                 value={employee.startDate} />
        
        <InfoItem icon={<Users className="h-4 w-4 text-gray-400" />} 
                 label="Lifecycle" 
                 value={employee.lifecycle} />
      </div>

      <Separator className="my-4" />

      <h3 className="text-sm font-medium text-gray-500 mb-4">CONTACT INFORMATION</h3>
      
      <div className="space-y-4">
        <InfoItem icon={<Mail className="h-4 w-4 text-gray-400" />} 
                 label="Email" 
                 value={`${employee.name.toLowerCase().replace(/\s/g, '.')}@company.com`} />
        
        <InfoItem icon={<Phone className="h-4 w-4 text-gray-400" />} 
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
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
};

export default EmployeeInfoSection;
