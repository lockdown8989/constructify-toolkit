
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Shield, Mail, Key, User, Clock } from 'lucide-react';
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
    email: employee?.email || '',
    role: employee?.role || 'employee',
    status: employee?.status || 'Active',
    annual_leave_days: employee?.annual_leave_days || 25,
    sick_leave_days: employee?.sick_leave_days || 10,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateEmployee.mutateAsync({
        id: employee.id,
        email: formData.email || null,
        role: formData.role,
        status: formData.status,
        annual_leave_days: formData.annual_leave_days,
        sick_leave_days: formData.sick_leave_days,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
          {/* Account Status Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-semibold">Account Status</h3>
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

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status:</span>
                <Badge variant={formData.status === 'Active' ? 'default' : 'secondary'}>
                  {formData.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Login Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-semibold">Login Information</h3>
            </div>
            
            <div className="space-y-4">
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
                  This email will be used for login and system notifications
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Password Status</span>
                </div>
                <p className="text-sm text-gray-600">
                  {formData.email ? 'Password protected account' : 'No password set - login disabled'}
                </p>
              </div>
            </div>
          </div>

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
