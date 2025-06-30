
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ManagerIdField from './ManagerIdField';
import BasicInfoFields from './BasicInfoFields';
import EmailField from './EmailField';
import WeeklyAvailabilitySection from './WeeklyAvailabilitySection';
import { useProfileForm } from './useProfileForm';
import { useAuth } from '@/hooks/use-auth';

const ProfileForm = () => {
  const { user, isManager, isPayroll, isAdmin } = useAuth();
  
  const {
    formData,
    isLoading,
    isSaving,
    handleChange,
    handleSubmit,  
    isEditable
  } = useProfileForm();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BasicInfoFields 
            formData={formData}
            onChange={handleChange}
            isEditable={isEditable}
          />
          
          <EmailField 
            email={formData.email}
            onChange={handleChange}
            isEditable={false}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                name="job_title"
                value={formData.job_title || ''}
                onChange={handleChange}
                placeholder="Your job title"
                disabled={!isEditable}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={formData.department || ''}
                onChange={handleChange}
                placeholder="Your department"
                disabled={!isEditable}
              />
            </div>
          </div>

          <ManagerIdField
            managerId={formData.manager_id}
            onChange={handleChange}
            isManager={isManager}
            isEditable={isEditable}
          />
        </CardContent>
      </Card>

      <WeeklyAvailabilitySection 
        formData={formData}
        onChange={handleChange}
        isEditable={isEditable}
      />

      {isEditable && (
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default ProfileForm;
