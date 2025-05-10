
import React, { useState } from 'react';
import { useRegionSettings } from '@/hooks/use-region-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Globe, Languages, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RegionSettings = () => {
  const { 
    country, 
    setCountry, 
    language, 
    setLanguage, 
    currency, 
    setCurrency, 
    isLoading 
  } = useRegionSettings();
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  const [countryInput, setCountryInput] = useState(country);
  const [languageInput, setLanguageInput] = useState(language);
  const [currencyInput, setCurrencyInput] = useState(currency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Try to update country
    if (countryInput !== country) {
      await setCountry(countryInput);
    }
    
    // Try to update language
    if (languageInput !== language) {
      await setLanguage(languageInput);
    }
    
    // Try to update currency
    if (currencyInput !== currency) {
      await setCurrency(currencyInput as any);
    }
    
    toast({
      title: "Settings Updated",
      description: "Your region settings have been saved successfully."
    });
  };

  const autoDetectLocation = async () => {
    setIsLocating(true);
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.country) {
        setCountryInput(data.country);
      }
      
      if (data.currency) {
        setCurrencyInput(data.currency);
      }
      
      if (data.languages) {
        const primaryLanguage = data.languages.split(',')[0];
        setLanguageInput(primaryLanguage);
      }
      
      toast({
        title: "Location Detected",
        description: `Detected location: ${data.country_name}`
      });
    } catch (error) {
      console.error('Error detecting location:', error);
      toast({
        title: "Location Detection Failed",
        description: "Could not auto-detect your location.",
        variant: "destructive"
      });
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Region Settings
        </CardTitle>
        <CardDescription>
          Configure your regional preferences for language, currency, and location.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Country
              </Label>
              <div className="flex gap-2">
                <Input 
                  id="country" 
                  value={countryInput} 
                  onChange={(e) => setCountryInput(e.target.value)} 
                  className="flex-1"
                  placeholder="Your country code (e.g., US, GB)" 
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={autoDetectLocation}
                  disabled={isLocating}
                >
                  {isLocating ? "Detecting..." : "Detect"}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-1">
                <Languages className="h-4 w-4" />
                Language
              </Label>
              <Select 
                value={languageInput} 
                onValueChange={setLanguageInput}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency" className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                Currency
              </Label>
              <Select 
                value={currencyInput} 
                onValueChange={setCurrencyInput}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                  <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                  <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                  <SelectItem value="AUD">Australian Dollar (A$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegionSettings;
