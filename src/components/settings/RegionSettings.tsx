
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CountryInput from './CountryInput';
import LanguageSelector from './LanguageSelector';
import CurrencySelector from './CurrencySelector';

const RegionSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CountryInput />
        <LanguageSelector />
        <CurrencySelector />
      </CardContent>
    </Card>
  );
};

export default RegionSettings;
