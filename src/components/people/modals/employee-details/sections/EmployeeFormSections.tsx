import React from 'react';
import { X, Shield, Mail, Key, User, Clock, Settings, Building, DollarSign, Calendar, Calculator } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Employee } from '@/components/people/types';
import { formatCurrency } from '@/utils/format';

interface PersonalInfoSectionProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    location: string;
  };
  handleInputChange: (field: string, value: any) => void;
  isLoading?: boolean;
}

const PersonalInfoSectionComponent: React.FC<PersonalInfoSectionProps> = ({
  formData,
  handleInputChange,
  isLoading = false
}) => (
  <div className="space-y-4" role="group" aria-labelledby="personal-info-heading">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
        <User className="h-4 w-4 text-blue-600" aria-hidden="true" />
      </div>
      <h3 id="personal-info-heading" className="text-lg font-medium text-gray-900">
        Personal Information
      </h3>
    </div>
    
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
            First Name <span className="text-red-500" aria-label="required">*</span>
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="First name"
            className="android-input android-focus-ring"
            autoComplete="given-name"
            autoCapitalize="words"
            autoCorrect="off"
            spellCheck="false"
            disabled={isLoading}
            required
            aria-describedby="firstName-error"
          />
          <div id="firstName-error" className="sr-only" aria-live="polite"></div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
            Last Name <span className="text-red-500" aria-label="required">*</span>
          </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Last name"
            className="android-input android-focus-ring"
            autoComplete="family-name"
            autoCapitalize="words"
            autoCorrect="off"
            spellCheck="false"
            disabled={isLoading}
            required
            aria-describedby="lastName-error"
          />
          <div id="lastName-error" className="sr-only" aria-live="polite"></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email Address <span className="text-red-500" aria-label="required">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="employee@company.com"
          className="android-input android-focus-ring"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          inputMode="email"
          disabled={isLoading}
          required
          aria-describedby="email-help email-error"
        />
        <p id="email-help" className="text-xs text-gray-500">
          Synchronized with manager's team view
        </p>
        <div id="email-error" className="sr-only" aria-live="polite"></div>
      </div>
    
      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium text-gray-700">
          Location
        </Label>
        <Select 
          value={formData.location} 
          onValueChange={(value) => handleInputChange('location', value)}
          disabled={isLoading}
        >
          <SelectTrigger className="android-select" aria-describedby="location-help">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Office">Office</SelectItem>
            <SelectItem value="Remote">Remote</SelectItem>
            <SelectItem value="Hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
        <p id="location-help" className="text-xs text-gray-500">
          Work location preference
        </p>
      </div>
    </div>
  </div>
);

export const PersonalInfoSection = React.memo(PersonalInfoSectionComponent);

interface LoginInfoSectionProps {
  formData: {
    loginEmail: string;
  };
  handleInputChange: (field: string, value: any) => void;
  isLoading?: boolean;
}

const LoginInfoSectionComponent: React.FC<LoginInfoSectionProps> = ({
  formData,
  handleInputChange,
  isLoading = false
}) => (
  <div className="space-y-4" role="group" aria-labelledby="login-info-heading">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
        <Shield className="h-4 w-4 text-blue-600" aria-hidden="true" />
      </div>
      <h3 id="login-info-heading" className="text-lg font-medium text-gray-900">
        Login Information
      </h3>
    </div>
    
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="loginEmail" className="text-sm font-medium text-gray-700">
          Login Email <span className="text-red-500" aria-label="required">*</span>
        </Label>
        <Input
          id="loginEmail"
          type="email"
          value={formData.loginEmail}
          onChange={(e) => handleInputChange('loginEmail', e.target.value)}
          placeholder="employee@company.com"
          className="android-input android-focus-ring"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          inputMode="email"
          disabled={isLoading}
          required
          aria-describedby="loginEmail-error"
        />
        <div id="loginEmail-error" className="sr-only" aria-live="polite"></div>
      </div>
    
      <Card className="p-3 bg-blue-50 border-blue-200 material-elevation-1">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <span className="text-sm font-medium text-blue-900">Sync Status</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Manager Team:</span>
            <Badge 
              variant={formData.loginEmail ? 'default' : 'secondary'} 
              className="text-xs"
              aria-label={formData.loginEmail ? 'Account is active' : 'Setup required'}
            >
              {formData.loginEmail ? 'Active' : 'Setup Required'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export const LoginInfoSection = React.memo(LoginInfoSectionComponent);

interface EmploymentDetailsSectionProps {
  formData: {
    position: string;
    department: string;
    managerId: string;
    start_date: string;
    status: string;
    lifecycle: string;
    role: string;
  };
  handleInputChange: (field: string, value: any) => void;
  isLoading?: boolean;
}

const EmploymentDetailsSectionComponent: React.FC<EmploymentDetailsSectionProps> = ({
  formData,
  handleInputChange,
  isLoading = false
}) => (
  <div className="space-y-4" role="group" aria-labelledby="employment-heading">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center">
        <Building className="h-4 w-4 text-green-600" aria-hidden="true" />
      </div>
      <h3 id="employment-heading" className="text-lg font-medium text-gray-900">
        Employment Details
      </h3>
    </div>
    
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="position" className="text-sm font-medium text-gray-700">
          Job Title <span className="text-red-500" aria-label="required">*</span>
        </Label>
        <Input
          id="position"
          value={formData.position}
          onChange={(e) => handleInputChange('position', e.target.value)}
          placeholder="Software Developer"
          className="android-input android-focus-ring"
          autoComplete="organization-title"
          disabled={isLoading}
          required
          aria-describedby="position-error"
        />
        <div id="position-error" className="sr-only" aria-live="polite"></div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="department" className="text-sm font-medium text-gray-700">
          Department
        </Label>
        <Input
          id="department"
          value={formData.department}
          onChange={(e) => handleInputChange('department', e.target.value)}
          placeholder="Engineering"
          className="android-input android-focus-ring"
          disabled={isLoading}
          aria-describedby="department-help"
        />
        <p id="department-help" className="text-xs text-gray-500">
          Employee's department or team
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="start_date" className="text-sm font-medium text-gray-700">
            Start Date <span className="text-red-500" aria-label="required">*</span>
          </Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => handleInputChange('start_date', e.target.value)}
            className="android-input android-focus-ring"
            disabled={isLoading}
            required
            aria-describedby="start_date-error"
          />
          <div id="start_date-error" className="sr-only" aria-live="polite"></div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium text-gray-700">
            Status
          </Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => handleInputChange('status', value)}
            disabled={isLoading}
          >
            <SelectTrigger className="android-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  </div>
);

export const EmploymentDetailsSection = React.memo(EmploymentDetailsSectionComponent);

interface SalarySectionProps {
  formData: {
    salary: number;
    annual_leave_days: number;
    sick_leave_days: number;
  };
  handleInputChange: (field: string, value: any) => void;
  salaryBreakdown: {
    annual: number;
    monthly: number;
    weekly: number;
    daily: number;
    hourly: number;
  };
  isLoading?: boolean;
}

const SalarySectionComponent: React.FC<SalarySectionProps> = ({
  formData,
  handleInputChange,
  salaryBreakdown,
  isLoading = false
}) => (
  <div className="space-y-4" role="group" aria-labelledby="salary-heading">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center">
        <DollarSign className="h-4 w-4 text-green-600" aria-hidden="true" />
      </div>
      <h3 id="salary-heading" className="text-lg font-medium text-gray-900">
        Salary & Benefits
      </h3>
    </div>
    
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="salary" className="text-sm font-medium text-gray-700">
          Annual Salary (£) <span className="text-red-500" aria-label="required">*</span>
        </Label>
        <Input
          id="salary"
          type="number"
          value={formData.salary || ''}
          onChange={(e) => handleInputChange('salary', e.target.value)}
          placeholder="50000"
          className="android-input android-focus-ring"
          min="0"
          step="1000"
          disabled={isLoading}
          required
          aria-describedby="salary-breakdown salary-error"
        />
        <div id="salary-error" className="sr-only" aria-live="polite"></div>
      </div>
      
      {salaryBreakdown.annual > 0 && (
        <Card className="p-3 bg-green-50 border-green-200" id="salary-breakdown">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-green-600" aria-hidden="true" />
              <span className="text-sm font-medium text-green-900">Salary Breakdown</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
              <div>Monthly: {formatCurrency(salaryBreakdown.monthly)}</div>
              <div>Weekly: {formatCurrency(salaryBreakdown.weekly)}</div>
              <div>Daily: {formatCurrency(salaryBreakdown.daily)}</div>
              <div>Hourly: {formatCurrency(salaryBreakdown.hourly)}</div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="annual_leave_days" className="text-sm font-medium text-gray-700">
            Annual Leave (days)
          </Label>
          <Input
            id="annual_leave_days"
            type="number"
            value={formData.annual_leave_days || ''}
            onChange={(e) => handleInputChange('annual_leave_days', e.target.value)}
            placeholder="25"
            className="android-input android-focus-ring"
            min="0"
            max="50"
            disabled={isLoading}
            aria-describedby="annual_leave-help"
          />
          <p id="annual_leave-help" className="text-xs text-gray-500">
            Days per year
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sick_leave_days" className="text-sm font-medium text-gray-700">
            Sick Leave (days)
          </Label>
          <Input
            id="sick_leave_days"
            type="number"
            value={formData.sick_leave_days || ''}
            onChange={(e) => handleInputChange('sick_leave_days', e.target.value)}
            placeholder="10"
            className="android-input android-focus-ring"
            min="0"
            max="30"
            disabled={isLoading}
            aria-describedby="sick_leave-help"
          />
          <p id="sick_leave-help" className="text-xs text-gray-500">
            Days per year
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const SalarySection = React.memo(SalarySectionComponent);
