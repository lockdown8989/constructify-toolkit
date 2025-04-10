
import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import AvailabilityRequestForm from './AvailabilityRequestForm';
import AvailabilityRequestList from './AvailabilityRequestList';

const AvailabilityManagement = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  
  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Please sign in to manage your availability.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Availability Management
          </CardTitle>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Set Availability
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {showForm ? (
          <AvailabilityRequestForm onClose={() => setShowForm(false)} />
        ) : (
          <AvailabilityRequestList />
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityManagement;
