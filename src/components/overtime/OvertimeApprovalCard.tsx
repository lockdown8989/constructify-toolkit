import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDuration } from '@/utils/time-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface OvertimeApprovalCardProps {
  attendance: {
    id: string;
    employee_id: string;
    overtime_minutes: number;
    overtime_status: string;
    check_in: string;
    date: string;
    employees?: {
      name: string;
      job_title: string;
    };
  };
  onApprovalUpdate: () => void;
}

const OvertimeApprovalCard: React.FC<OvertimeApprovalCardProps> = ({ 
  attendance, 
  onApprovalUpdate 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [managerNotes, setManagerNotes] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const { toast } = useToast();

  const handleApproval = async (approved: boolean, notes?: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc('approve_overtime', {
        p_attendance_id: attendance.id,
        p_approved: approved,
        p_manager_notes: notes || null
      });

      if (error) throw error;

      if (data) {
        toast({
          title: approved ? "Overtime Approved" : "Overtime Rejected",
          description: `${attendance.employees?.name}'s overtime has been ${approved ? 'approved' : 'rejected'}.`,
          variant: approved ? "default" : "destructive",
        });
        onApprovalUpdate();
        setShowDialog(false);
        setManagerNotes('');
      }
    } catch (error) {
      console.error('Error processing overtime approval:', error);
      toast({
        title: "Error",
        description: "Failed to process overtime approval. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openDialog = (type: 'approve' | 'reject') => {
    setActionType(type);
    setShowDialog(true);
  };

  const getStatusBadge = () => {
    switch (attendance.overtime_status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Pending Approval
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              {attendance.employees?.name || 'Unknown Employee'}
            </CardTitle>
            {getStatusBadge()}
          </div>
          <div className="text-sm text-gray-600">
            {attendance.employees?.job_title}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {new Date(attendance.date).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                Check-in: {new Date(attendance.check_in).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">
                Overtime: {formatDuration(attendance.overtime_minutes)}
              </span>
            </div>
          </div>

          {attendance.overtime_status === 'pending' && (
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => openDialog('approve')}
                className="bg-green-600 hover:bg-green-700"
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              
              <Button
                onClick={() => openDialog('reject')}
                variant="destructive"
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Overtime
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                You are about to {actionType} {formatDuration(attendance.overtime_minutes)} of overtime 
                for {attendance.employees?.name}.
              </p>
            </div>
            
            <div>
              <Label htmlFor="manager-notes">Manager Notes (Optional)</Label>
              <Textarea
                id="manager-notes"
                placeholder="Add any notes about this overtime decision..."
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              
              <Button
                onClick={() => handleApproval(actionType === 'approve', managerNotes)}
                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                variant={actionType === 'reject' ? 'destructive' : 'default'}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `${actionType === 'approve' ? 'Approve' : 'Reject'} Overtime`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OvertimeApprovalCard;