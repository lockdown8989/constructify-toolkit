
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Employee } from '@/components/people/types';
import { Calendar, MapPin, Mail, DollarSign, Building, Users, Clock, Key, Shield } from 'lucide-react';

interface EmployeeInfoSectionProps {
  employee: Employee;
  isEditing: boolean;
  onSave: () => void;
  onEdit: () => void;
}

const EmployeeInfoSection: React.FC<EmployeeInfoSectionProps> = ({
  employee,
  isEditing,
  onSave,
  onEdit
}) => {
  const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | undefined }) => (
    <div className="flex items-start space-x-3 py-3">
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-500">{label}:</div>
        <div className="text-base text-gray-900 font-medium">{value || 'Not specified'}</div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Personal Information Card */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <InfoItem 
            icon={Users} 
            label="Full Name" 
            value={employee.name} 
          />
          <InfoItem 
            icon={Mail} 
            label="Email Address" 
            value={employee.email || 'Not specified'} 
          />
          <InfoItem 
            icon={MapPin} 
            label="Location" 
            value={`${employee.site} ${employee.siteIcon}`} 
          />
        </CardContent>
      </Card>

      {/* Login Information Card */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Login Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <InfoItem 
            icon={Mail} 
            label="Login Email" 
            value={employee.email || 'No email configured'} 
          />
          <InfoItem 
            icon={Key} 
            label="Password Status" 
            value={employee.email ? 'Password protected' : 'No password set'} 
          />
          <div className="flex items-start space-x-3 py-3">
            <div className="flex-shrink-0 mt-0.5">
              <Shield className="h-4 w-4 text-gray-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-500">Account Status:</div>
              <div className="text-base text-gray-900 font-medium">
                <Badge 
                  variant="outline" 
                  className={`${employee.email ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'} font-medium`}
                >
                  {employee.email ? 'Active Account' : 'Setup Required'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Details Card */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Employment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <InfoItem 
            icon={Building} 
            label="Job Title" 
            value={employee.jobTitle} 
          />
          <InfoItem 
            icon={Users} 
            label="Department" 
            value={employee.department} 
          />
          <InfoItem 
            icon={Calendar} 
            label="Start Date" 
            value={employee.startDate} 
          />
          <InfoItem 
            icon={DollarSign} 
            label="Annual Salary" 
            value={employee.salary} 
          />
          {employee.hourly_rate && employee.hourly_rate > 0 && (
            <InfoItem 
              icon={Clock} 
              label="Hourly Rate" 
              value={`£${employee.hourly_rate.toFixed(2)} per hour`} 
            />
          )}
          <div className="flex items-start space-x-3 py-3">
            <div className="flex-shrink-0 mt-0.5">
              <Clock className="h-4 w-4 text-gray-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-500">Employment Status:</div>
              <div className="mt-1">
                <Badge 
                  variant="outline" 
                  className={`${employee.statusColor === 'green' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'} font-medium`}
                >
                  {employee.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Information Card */}
      {(employee.annual_leave_days || employee.sick_leave_days) && (
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Leave Entitlements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoItem 
              icon={Calendar} 
              label="Annual Leave Days" 
              value={employee.annual_leave_days?.toString()} 
            />
            <InfoItem 
              icon={Calendar} 
              label="Sick Leave Days" 
              value={employee.sick_leave_days?.toString()} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeeInfoSection;
