
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ShiftSwap, useUpdateShiftSwap, useDeleteShiftSwap } from '@/hooks/use-shift-swaps';

export function ShiftSwapList({ swapRequests, isLoading }) {
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { mutate: updateSwap } = useUpdateShiftSwap();
  const { mutate: deleteSwap } = useDeleteShiftSwap();
  
  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <p className="text-muted-foreground">Loading shift swap requests...</p>
      </div>
    );
  }
  
  if (!swapRequests || swapRequests.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">No shift swap requests found</p>
      </div>
    );
  }
  
  const handleOpenDialog = (swap) => {
    setSelectedSwap(swap);
    setResponseNotes(swap.notes || '');
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setSelectedSwap(null);
    setResponseNotes('');
    setDialogOpen(false);
  };
  
  const handleApprove = () => {
    if (selectedSwap) {
      updateSwap({
        id: selectedSwap.id,
        updates: {
          status: 'Approved',
          notes: responseNotes
        }
      });
      handleCloseDialog();
    }
  };
  
  const handleReject = () => {
    if (selectedSwap) {
      updateSwap({
        id: selectedSwap.id,
        updates: {
          status: 'Rejected',
          notes: responseNotes
        }
      });
      handleCloseDialog();
    }
  };
  
  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this shift swap request?')) {
      updateSwap({
        id: id,
        updates: {
          status: 'Cancelled',
          updated_at: new Date().toISOString()
        }
      });
    }
  };
  
  return (
    <div className="space-y-4">
      {swapRequests.map((swap) => (
        <Card key={swap.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <div className="font-medium">Shift Swap Request</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(swap.created_at).toLocaleDateString()}
                </div>
                
                {swap.notes && (
                  <p className="text-sm mt-2 text-muted-foreground">
                    {swap.notes}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${swap.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                    swap.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'}
                `}>
                  {swap.status}
                </div>
                
                <div className="flex gap-2 mt-2">
                  {swap.status === 'Pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-green-600 border-green-500 hover:bg-green-50"
                        onClick={() => handleOpenDialog(swap)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Respond
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 border-red-500 hover:bg-red-50"
                        onClick={() => handleCancel(swap.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Shift Swap Request</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">
              Response Notes
            </label>
            <Textarea
              value={responseNotes}
              onChange={(e) => setResponseNotes(e.target.value)}
              rows={4}
              placeholder="Enter any notes for this response..."
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
              onClick={handleReject}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={handleApprove}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
