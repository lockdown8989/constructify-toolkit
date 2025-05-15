
import React from 'react';
import { format } from 'date-fns';
import { useAvailability, useUpdateAvailability, useDeleteAvailability } from '@/hooks/availability';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const AvailabilityRequestList: React.FC = () => {
  const { availabilityData, isLoading } = useAvailability();
  const { updateAvailability } = useUpdateAvailability();
  const { deleteAvailability } = useDeleteAvailability();
  
  if (isLoading) {
    return <div className="text-center py-4">Loading availability data...</div>;
  }
  
  if (availabilityData.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-gray-50">
        <p className="text-gray-500">No availability records found.</p>
        <p className="text-sm text-gray-400 mt-1">Click the "Set Availability" button to add your first record.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {availabilityData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{format(new Date(item.date), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{item.start_time} - {item.end_time}</TableCell>
              <TableCell>
                <Badge variant={item.is_available ? "success" : "destructive"}>
                  {item.is_available ? 'Available' : 'Unavailable'}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{item.notes || '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => updateAvailability({
                      id: item.id,
                      is_available: !item.is_available
                    })}
                  >
                    {item.is_available ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Availability Record</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this availability record? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteAvailability(item.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AvailabilityRequestList;
