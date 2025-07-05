
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Shield, Mail, Key, User, Clock, Settings, Building, DollarSign, Calendar } from 'lucide-react';
import { Employee } from '@/components/people/types';
import { useToast } from '@/hooks/use-toast';
import { useUpdateEmployee } from '@/hooks/use-employees';
import { useEmployeeSync } from '@/hooks/use-employee-sync';

interface EmployeeAccountEditDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeAccountEditDialog: React.FC<EmployeeAccountEditDialogProps> = ({
  employee,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const updateEmployee = useUpdateEmployee();
  const { syncEmployee, isSyncing } = useEmployeeSync();
  
  const [formData, setFormData] = useState({
    // Personal Information
    name: employee?.name || '',
    email: employee?.email || '',
    location: employee?.site || 'Office',
    
    // Login Information - Use the employee's actual email
    loginEmail: employee?.email || '',
    password: '123Qwe@×', // As specified by user
    
    // Profile Information
    firstName: employee?.name?.split(' ')[0] || '',
    lastName: employee?.name?.split(' ')[1] || '',
    position: employee?.jobTitle || '',
    department: employee?.department || '',
    managerId: employee?.managerId || '',
    
    // Employment Details
    job_title: employee?.jobTitle || '',
    salary: Number(employee?.salary || 0),
    start_date: employee?.startDate || new Date().toISOString().split('T')[0],
    status: employee?.status || 'Active',
    lifecycle: employee?.lifecycle || 'Active',
    
    // Account Settings
    role: employee?.role || 'employee',
    annual_leave_days: employee?.annual_leave_days || 25,
    sick_leave_days: employee?.sick_leave_days || 10,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when employee prop changes
  React.useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        location: employee.site || 'Office',
        loginEmail: employee.email || '',
        password: '123Qwe@×',
        firstName: employee.name?.split(' ')[0] || '',
        lastName: employee.name?.split(' ')[1] || '',
        position: employee.jobTitle || '',
        department: employee.department || '',
        managerId: employee.managerId || '',
        job_title: employee.jobTitle || '',
        salary: Number(employee.salary || 0),
        start_date: employee.startDate || new Date().toISOString().split('T')[0],
        status: employee.status || 'Active',
        lifecycle: employee.lifecycle || 'Active',
        role: employee.role || 'employee',
        annual_leave_days: employee.annual_leave_days || 25,
        sick_leave_days: employee.sick_leave_days || 10,
      });
    }
  }, [employee]);

  if (!employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Combine first and last name
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      // Prepare update data for the standard update hook
      const updateData = {
        id: employee.id,
        name: fullName || formData.name,
        email: formData.loginEmail || formData.email,
        job_title: formData.job_title || formData.position,
        department: formData.department,
        salary: formData.salary,
        site: formData.location,
        start_date: formData.start_date,
        status: formData.status,
        lifecycle: formData.lifecycle,
        role: formData.role,
        annual_leave_days: formData.annual_leave_days,
        sick_leave_days: formData.sick_leave_days,
        manager_id: formData.managerId || null,
      };

      // Prepare sync data for the sync hook with correct field mappings
      const syncData = {
        id: employee.id,
        name: fullName || formData.name,
        email: formData.loginEmail || formData.email,
        jobTitle: formData.job_title || formData.position,
        department: formData.department,
        salary: formData.salary,
        site: formData.location,
        startDate: formData.start_date,
        status: formData.status,
        lifecycle: formData.lifecycle,
        role: formData.role,
        annual_leave_days: formData.annual_leave_days,
        sick_leave_days: formData.sick_leave_days,
        managerId: formData.managerId || undefined,
      };

      console.log('Updating employee with data:', updateData);
      console.log('Syncing employee data:', syncData);

      // First update the employee record
      await updateEmployee.mutateAsync(updateData);

      // Then sync with manager team
      await syncEmployee(syncData);

      toast({
        title: "Account updated",
        description: `${employee.name}'s account has been updated and synchronized with manager team.`,
        variant: "default"
      });

      onClose();
    } catch (error) {
      console.error("Error updating employee account:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update account",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            Edit Account - {employee.name}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="First name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="employee@company.com"
              />
              <p className="text-xs text-gray-500">
                This email will be synchronized with your manager's team view
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select 
                value={formData.location} 
                onValueChange={(value) => handleInputChange('location', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Login Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-semibold">Login Information</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginEmail">Login Email</Label>
                <Input
                  id="loginEmail"
                  type="email"
                  value={formData.loginEmail}
                  onChange={(e) => handleInputChange('loginEmail', e.target.value)}
                  placeholder="employee@company.com"
                />
                <p className="text-xs text-gray-500">
                  This email will be used for login and system notifications
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password"
                />
                <p className="text-xs text-gray-500">
                  Current password: {formData.password}
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Synchronization Status</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Manager Team Sync:</span>
                  <Badge variant={formData.loginEmail ? 'default' : 'secondary'}>
                    {formData.loginEmail ? 'Active' : 'Setup Required'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Employment Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-semibold">Employment Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position/Job Title</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Job title"
                />
                <p className="text-xs text-gray-500">
                  Will be synchronized with manager's team view
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Department"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  min="0"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', Number(e.target.value) || 0)}
                />
                <p className="text-xs text-gray-500">
                  Salary information will be synchronized with manager
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerId">Manager's ID</Label>
              <Input
                id="managerId"
                value={formData.managerId}
                onChange={(e) => handleInputChange('managerId', e.target.value)}
                placeholder="Enter manager's ID (e.g., MGR-94226)"
              />
              <p className="text-xs text-gray-500">
                Enter your manager's ID to sync with their team view
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Employment Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Leave Entitlements Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-semibold">Leave Entitlements</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annual_leave">Annual Leave Days</Label>
                <Input
                  id="annual_leave"
                  type="number"
                  min="0"
                  max="365"
                  value={formData.annual_leave_days}
                  onChange={(e) => handleInputChange('annual_leave_days', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sick_leave">Sick Leave Days</Label>
                <Input
                  id="sick_leave"
                  type="number"
                  min="0"
                  max="365"
                  value={formData.sick_leave_days}
                  onChange={(e) => handleInputChange('sick_leave_days', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isSyncing}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isSyncing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting || isSyncing ? 'Saving Changes...' : 'Save & Sync Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeAccountEditDialog;
