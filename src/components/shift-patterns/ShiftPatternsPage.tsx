
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShiftPatternManager from './ShiftPatternManager';

const ShiftPatternsPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shift Pattern Management</h1>
        <p className="text-gray-600 mt-2">
          Configure shift patterns and assign them to employees for accurate attendance tracking
        </p>
      </div>

      <ShiftPatternManager />
    </div>
  );
};

export default ShiftPatternsPage;
