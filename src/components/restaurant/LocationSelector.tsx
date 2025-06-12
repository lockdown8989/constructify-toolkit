
import React, { useState } from 'react';
import { ChevronDown, Plus, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocations, useAddLocation, useDeleteLocation } from '@/hooks/use-locations';

interface LocationSelectorProps {
  locationName: string;
  setLocationName: (name: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  locationName,
  setLocationName
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');
  
  const { data: locations = [], isLoading } = useLocations();
  const addLocation = useAddLocation();
  const deleteLocation = useDeleteLocation();

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) return;
    
    await addLocation.mutateAsync({
      name: newLocationName.trim(),
      address: newLocationAddress.trim() || undefined
    });
    
    setNewLocationName('');
    setNewLocationAddress('');
    setIsAddDialogOpen(false);
    setLocationName(newLocationName.trim());
  };

  const handleDeleteLocation = async (locationId: string, locationNameToDelete: string) => {
    if (locations.length <= 1) {
      return; // Don't allow deletion of the last location
    }
    
    await deleteLocation.mutateAsync(locationId);
    
    // If we deleted the currently selected location, switch to the first available one
    if (locationName === locationNameToDelete) {
      const remainingLocations = locations.filter(loc => loc.id !== locationId);
      if (remainingLocations.length > 0) {
        setLocationName(remainingLocations[0].name);
      }
    }
  };

  return (
    <div className="flex items-center">
      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 font-medium text-base hover:bg-gray-50 px-2 py-1 rounded-md"
            disabled={isLoading}
          >
            <span>{locationName}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {locations.map((location) => (
            <DropdownMenuItem 
              key={location.id}
              className="flex items-center justify-between"
            >
              <button
                className="flex-1 text-left"
                onClick={() => setLocationName(location.name)}
              >
                <div className="font-medium">{location.name}</div>
                {location.address && (
                  <div className="text-sm text-gray-500">{location.address}</div>
                )}
              </button>
              {locations.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLocation(location.id, location.name);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Location
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="location-name">Location Name</Label>
                  <Input
                    id="location-name"
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    placeholder="Enter location name"
                  />
                </div>
                <div>
                  <Label htmlFor="location-address">Address (Optional)</Label>
                  <Input
                    id="location-address"
                    value={newLocationAddress}
                    onChange={(e) => setNewLocationAddress(e.target.value)}
                    placeholder="Enter address"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAddLocation}
                    disabled={!newLocationName.trim() || addLocation.isPending}
                    className="flex-1"
                  >
                    {addLocation.isPending ? 'Adding...' : 'Add Location'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LocationSelector;
