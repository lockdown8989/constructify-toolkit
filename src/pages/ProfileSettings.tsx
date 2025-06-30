
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Palette, Globe, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import PersonalInfoForm from '@/components/profile-settings/PersonalInfoForm';
import RegionalPreferencesForm from '@/components/profile-settings/RegionalPreferencesForm';
import DeleteAccountSection from '@/components/profile-settings/DeleteAccountSection';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Settings</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your account preferences and settings</p>
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="regional" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Regional
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PersonalInfoForm user={user} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize how the application looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Theme and appearance settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regional">
            <Card>
              <CardHeader>
                <CardTitle>Regional Preferences</CardTitle>
                <CardDescription>
                  Set your location, language, and regional preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RegionalPreferencesForm user={user} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Account Management</CardTitle>
                <CardDescription>
                  Manage your account settings and data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeleteAccountSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileSettings;
