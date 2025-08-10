
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePayrollSettings } from '@/hooks/use-payroll-settings';

const PayrollSettings = () => {
  const { user, isPayroll } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { settings, setSettings, isLoading, isSaving, save } = usePayrollSettings();

  if (!isPayroll) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">This page is only accessible to payroll users.</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    const result = await save(settings);
    if (result.success) {
      toast({
        title: "Settings Saved",
        description: "Payroll settings have been updated successfully.",
      });
    } else {
      toast({
        title: "Save Failed",
        description: result.error ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="container py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/payroll')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payroll
          </Button>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Payroll Settings</h1>
          </div>
        </div>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={settings.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pay-period">Pay Period</Label>
              <select
                id="pay-period"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={settings.payPeriod}
                onChange={(e) => handleInputChange('payPeriod', e.target.value)}
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={settings.payrollCurrency}
                onChange={(e) => handleInputChange('payrollCurrency', e.target.value)}
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-hours">Default Working Hours (per week)</Label>
              <Input
                id="default-hours"
                type="number"
                value={settings.defaultWorkingHours}
                onChange={(e) => handleInputChange('defaultWorkingHours', Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax & Deductions */}
        <Card>
          <CardHeader>
            <CardTitle>Tax & Deductions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => handleInputChange('taxRate', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ni-rate">National Insurance Rate (%)</Label>
              <Input
                id="ni-rate"
                type="number"
                step="0.1"
                value={settings.niRate}
                onChange={(e) => handleInputChange('niRate', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pension-rate">Pension Contribution (%)</Label>
              <Input
                id="pension-rate"
                type="number"
                step="0.1"
                value={settings.pensionRate}
                onChange={(e) => handleInputChange('pensionRate', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtime-rate">Overtime Rate (multiplier)</Label>
              <Input
                id="overtime-rate"
                type="number"
                step="0.1"
                value={settings.overtimeRate}
                onChange={(e) => handleInputChange('overtimeRate', Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Processing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Default Payment Method</Label>
              <select
                id="payment-method"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={settings.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="processing-delay">Processing Delay (days)</Label>
              <Input
                id="processing-delay"
                type="number"
                value={settings.processingDelay}
                onChange={(e) => handleInputChange('processingDelay', Number(e.target.value))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-approve">Auto-approve Payroll</Label>
                <p className="text-sm text-gray-500">Automatically approve payroll processing</p>
              </div>
              <Switch
                id="auto-approve"
                checked={settings.autoApprovePayroll}
                onCheckedChange={(checked) => handleInputChange('autoApprovePayroll', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Send email notifications for payroll events</p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status & Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Payroll System Status</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Last Processing Date</span>
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Next Processing Date</span>
              <span className="text-sm text-gray-600">
                {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Quick Actions</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Export Settings
                </Button>
                <Button variant="outline" size="sm">
                  Import Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PayrollSettings;
