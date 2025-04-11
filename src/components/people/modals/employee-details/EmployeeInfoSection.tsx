
import React from 'react';
import { Briefcase, MapPin, DollarSign, Calendar, Users, Mail, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Employee } from '@/components/people/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmployeeInfoSectionProps {
  employee: Employee;
}

const EmployeeInfoSection: React.FC<EmployeeInfoSectionProps> = ({
  employee,
}) => {
  return (
    <ScrollArea className="max-h-[calc(100vh-180px)] overflow-y-auto">
      <div className="p-4 sm:p-6 bg-white">
        <h3 className="text-xs font-semibold text-apple-gray-500 mb-5 uppercase tracking-wider">Employee Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          <InfoItem icon={<Briefcase className="h-4 w-4 text-apple-blue" />} 
                   label="Department" 
                   value={employee.department} />
          
          <InfoItem icon={<MapPin className="h-4 w-4 text-apple-blue" />} 
                   label="Site" 
                   value={`${employee.siteIcon} ${employee.site}`} />
          
          <InfoItem icon={<DollarSign className="h-4 w-4 text-apple-blue" />} 
                   label="Salary" 
                   value={employee.salary} />
          
          <InfoItem icon={<Calendar className="h-4 w-4 text-apple-blue" />} 
                   label="Start Date" 
                   value={employee.startDate} />
          
          <InfoItem icon={<Users className="h-4 w-4 text-apple-blue" />} 
                   label="Lifecycle" 
                   value={employee.lifecycle} />
        </div>

        <Separator className="my-6" />

        <h3 className="text-xs font-semibold text-apple-gray-500 mb-5 uppercase tracking-wider">Contact Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          <InfoItem icon={<Mail className="h-4 w-4 text-apple-blue" />} 
                   label="Email" 
                   value={`${employee.name.toLowerCase().replace(/\s/g, '.')}@company.com`} />
          
          <InfoItem icon={<Phone className="h-4 w-4 text-apple-blue" />} 
                   label="Phone" 
                   value={`+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`} />
        </div>
      </div>
    </ScrollArea>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => {
  return (
    <div className="p-3.5 rounded-xl bg-apple-gray-50 hover:bg-apple-gray-100/80 transition-colors">
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 p-2 bg-white rounded-lg shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-xs text-apple-gray-500 mb-1">{label}</p>
          <p className="font-medium break-words text-apple-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeInfoSection;
