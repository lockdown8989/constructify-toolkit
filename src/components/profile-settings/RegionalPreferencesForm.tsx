
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CountryInput from '@/components/settings/CountryInput';
import { LanguageSelector } from '@/components/settings/LanguageSelector';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { useRegionSettings } from '@/hooks/use-region-settings';

const RegionalPreferencesForm: React.FC = () => {
  const { user, isAdmin, isManager, isHR } = useAuth();
  const { toast } = useToast();
  
  const {
    regionData,
    isLocating,
    isSaving,
    isEmployee,
    handleChange,
    handleLanguageChange,
    handleSubmit,
    autoDetectLocation
  } = useRegionSettings(user);

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Country
            </label>
            <CountryInput
              country={regionData.country}
              onChange={handleChange}
              isLocating={isLocating}
              onDetect={autoDetectLocation}
            />
          </div>
          
          {!isEmployee && (
            <div className="space-y-2">
              <label htmlFor="language" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Preferred Language
              </label>
              <LanguageSelector 
                language={regionData.preferred_language} 
                onChange={handleLanguageChange} 
              />
            </div>
          )}
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default RegionalPreferencesForm;
