
import React from 'react';
import { Briefcase, MapPin, DollarSign, Calendar, Users, Mail, Phone } from 'lucide-react';

interface BasicInformationProps {
  department: string;
  site: string;
  siteIcon: string;
  salary: string;
  startDate: string;
  lifecycle: string;
  email: string;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  department,
  site,
  siteIcon,
  salary,
  startDate,
  lifecycle,
  email
}) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <InfoItem icon={<Briefcase className="h-4 w-4 text-apple-blue" />} 
                 label="Department" 
                 value={department} />
        
        <InfoItem icon={<MapPin className="h-4 w-4 text-apple-blue" />} 
                 label="Site" 
                 value={`${siteIcon} ${site}`} />
        
        <InfoItem icon={<DollarSign className="h-4 w-4 text-apple-blue" />} 
                 label="Salary" 
                 value={salary} />
        
        <InfoItem icon={<Calendar className="h-4 w-4 text-apple-blue" />} 
                 label="Start Date" 
                 value={startDate} />
        
        <InfoItem icon={<Users className="h-4 w-4 text-apple-blue" />} 
                 label="Lifecycle" 
                 value={lifecycle} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <InfoItem icon={<Mail className="h-4 w-4 text-apple-blue" />} 
                 label="Email" 
                 value={email} />
        
        <InfoItem icon={<Phone className="h-4 w-4 text-apple-blue" />} 
                 label="Phone" 
                 value={`+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`} />
      </div>
    </>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => {
  return (
    <div className="p-3.5 rounded-xl bg-apple-gray-50 hover:bg-apple-gray-100/80 transition-colors active-touch-state">
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

export default BasicInformation;
