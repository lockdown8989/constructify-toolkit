
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
  
  const [formData, setFormData] = useState({
    // Personal Information
    name: employee?.name || '',
    email: employee?.email || '',
    location: employee?.site || 'Office', // Using site instead of location
    
    // Login Information
    loginEmail: employee?.email || '',
    password: '123Qwe@×', // As specified by user
    
    // Profile Information (from second image)
    firstName: employee?.name?.split(' ')[0] || '',
    lastName: employee?.name?.split(' ')[1] || '',
    position: employee?.jobTitle || '',
    department: employee?.department || '',
    managerId: employee?.managerId || '', // Using managerId instead of manager_id
    
    // Employment Details
    jobTitle: employee?.jobTitle || '',
    salary: Number(employee?.salary?.replace(/[^0-9.-]+/g, '') || 0), // Convert string to number
    startDate: employee?.startDate || new Date().toISOString().split('T')[0],
    status: employee?.status || 'Active',
    lifecycle: employee?.lifecycle || 'Active',
    
    // Account Settings
    role: employee?.role || 'employee',
    annual_leave_days: employee?.annual_leave_days || 25,
    sick_leave_days: employee?.sick_leave_days || 10,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Combine first and last name
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      await updateEmployee.mutateAsync({
        id: employee.id,
        name: fullName || formData.name,
        email: formData.loginEmail || null,
        job_title: formData.jobTitle || formData.position,
        department: formData.department,
        salary: formData.salary,
        start_date: formData.startDate,
        status: formData.status,
        lifecycle: formData.lifecycle,
        location: formData.location,
        role: formData.role,
        annual_leave_days: formData.annual_leave_days,
        sick_leave_days: formData.sick_leave_days,
        manager_id: formData.managerId || null,
      });

      toast({
        title: "Account updated",
        description: `${employee.name}'s account has been updated successfully.`,
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
                  placeholder="cupra300c@gmail.com"
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
                  <span className="text-sm font-medium">Account Status</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Status:</span>
                  <Badge variant={formData.loginEmail ? 'default' : 'secondary'}>
                    {formData.loginEmail ? 'Active Account' : 'Setup Required'}
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
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  min="0"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', parseInt(e.target.value) || 0)}
                />
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
                Enter your manager's ID to connect to their account
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeAccountEditDialog;
