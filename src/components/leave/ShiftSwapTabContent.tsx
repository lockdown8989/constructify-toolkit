
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { ShiftSwap } from '@/hooks/use-shift-swaps';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface ShiftSwapTabContentProps {
  swapRequests: ShiftSwap[] | undefined;
  handleAcceptSwap: (id: string) => void;
  handleRejectSwap: (id: string) => void;
  canManage: boolean;
  formatDate: (date: string) => string;
}

export const ShiftSwapTabContent: React.FC<ShiftSwapTabContentProps> = ({
  swapRequests,
  handleAcceptSwap,
  handleRejectSwap,
  canManage,
  formatDate
}) => {
  if (!swapRequests || swapRequests.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">No shift swap requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {swapRequests.map((swap) => (
        <Card key={swap.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  <span className="font-semibold">{swap.requester?.name || "Employee"}</span>
                  {' requests to swap shift with '}
                  <span className="font-semibold">{swap.recipient?.name || "Another employee"}</span>
                </p>
                
                <p className="text-sm text-muted-foreground mt-1">
                  Date: {formatDate(swap.created_at)}
                </p>
                
                {swap.notes && (
                  <p className="text-sm mt-2 border-l-2 border-gray-200 pl-2 italic">
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
                
                {canManage && swap.status === 'Pending' && (
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => handleAcceptSwap(swap.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => handleRejectSwap(swap.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
