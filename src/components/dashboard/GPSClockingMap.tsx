
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Users, Settings, AlertCircle } from 'lucide-react';
import { useGPSRestrictions } from '@/hooks/use-gps-restrictions';
import { useEmployeeLocations } from '@/hooks/use-employee-locations';
import GPSMapView from './gps-map/GPSMapView';
import AddRestrictionDialog from './gps-map/AddRestrictionDialog';

const GPSClockingMap = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRestriction, setSelectedRestriction] = useState<string | null>(null);
  
  const { 
    restrictions, 
    isLoading: restrictionsLoading, 
    addRestriction, 
    updateRestriction, 
    deleteRestriction 
  } = useGPSRestrictions();
  
  const { 
    employeeLocations, 
    isLoading: locationsLoading 
  } = useEmployeeLocations();

  const activeRestrictions = restrictions?.filter(r => r.is_active) || [];
  const totalEmployees = employeeLocations?.length || 0;
  const employeesInZone = employeeLocations?.filter(loc => loc.is_within_restriction)?.length || 0;

  if (restrictionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            GPS Clocking Restrictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading GPS restrictions...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              GPS Clocking Restrictions
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Zone
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activeRestrictions.length}</div>
              <div className="text-sm text-gray-500">Active Zones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{employeesInZone}</div>
              <div className="text-sm text-gray-500">In Zone</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{totalEmployees}</div>
              <div className="text-sm text-gray-500">Total Staff</div>
            </div>
          </div>

          {/* Map View */}
          <div className="h-64 rounded-lg overflow-hidden border">
            <GPSMapView
              restrictions={activeRestrictions}
              employeeLocations={employeeLocations || []}
              selectedRestriction={selectedRestriction}
              onRestrictionSelect={setSelectedRestriction}
            />
          </div>

          {/* Active Restrictions List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Active Restrictions</h4>
            {activeRestrictions.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <AlertCircle className="h-4 w-4" />
                No GPS restrictions configured
              </div>
            ) : (
              <div className="space-y-1">
                {activeRestrictions.slice(0, 3).map((restriction) => (
                  <div
                    key={restriction.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedRestriction(restriction.id)}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">{restriction.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {restriction.radius_meters}m
                    </Badge>
                  </div>
                ))}
                {activeRestrictions.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{activeRestrictions.length - 3} more zones
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddRestrictionDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={addRestriction}
      />
    </>
  );
};

export default GPSClockingMap;
