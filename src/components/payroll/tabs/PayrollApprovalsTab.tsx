
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, Eye, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format';

interface PendingApproval {
  id: string;
  employeeName: string;
  department: string;
  amount: number;
  type: 'overtime' | 'bonus' | 'adjustment' | 'leave';
  submittedDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const PayrollApprovalsTab: React.FC = () => {
  const { toast } = useToast();
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  // Sample pending approvals data
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([
    {
      id: '1',
      employeeName: 'John Smith',
      department: 'Engineering',
      amount: 320.50,
      type: 'overtime',
      submittedDate: '2024-01-15',
      reason: 'Weekend emergency deployment work',
      status: 'pending'
    },
    {
      id: '2',
      employeeName: 'Sarah Johnson',
      department: 'Marketing',
      amount: 500.00,
      type: 'bonus',
      submittedDate: '2024-01-14',
      reason: 'Quarterly performance bonus',
      status: 'pending'
    },
    {
      id: '3',
      employeeName: 'Mike Davis',
      department: 'Finance',
      amount: 150.00,
      type: 'adjustment',
      submittedDate: '2024-01-13',
      reason: 'Travel expense reimbursement',
      status: 'pending'
    }
  ]);

  const handleApprove = async (approvalId: string) => {
    setPendingApprovals(prev => 
      prev.map(approval => 
        approval.id === approvalId 
          ? { ...approval, status: 'approved' as const }
          : approval
      )
    );

    toast({
      title: "Approval Granted",
      description: "The payroll adjustment has been approved successfully.",
    });
    
    setShowDetailModal(false);
    setApprovalNote('');
  };

  const handleReject = async (approvalId: string) => {
    if (!approvalNote.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this approval.",
        variant: "destructive"
      });
      return;
    }

    setPendingApprovals(prev => 
      prev.map(approval => 
        approval.id === approvalId 
          ? { ...approval, status: 'rejected' as const }
          : approval
      )
    );

    toast({
      title: "Approval Rejected",
      description: "The payroll adjustment has been rejected.",
    });
    
    setShowDetailModal(false);
    setApprovalNote('');
  };

  const handleViewDetails = (approval: PendingApproval) => {
    setSelectedApproval(approval);
    setShowDetailModal(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'overtime': return 'bg-blue-100 text-blue-800';
      case 'bonus': return 'bg-green-100 text-green-800';
      case 'adjustment': return 'bg-yellow-100 text-yellow-800';
      case 'leave': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const pendingCount = pendingApprovals.filter(a => a.status === 'pending').length;
  const totalPendingAmount = pendingApprovals
    .filter(a => a.status === 'pending')
    .reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPendingAmount)}</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Approvals processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApprovals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell className="font-medium">{approval.employeeName}</TableCell>
                  <TableCell>{approval.department}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(approval.type)} variant="secondary">
                      {approval.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(approval.amount)}</TableCell>
                  <TableCell>{new Date(approval.submittedDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(approval.status)}
                      <span className="capitalize">{approval.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(approval)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {approval.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(approval.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleViewDetails(approval)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approval Details</DialogTitle>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Employee Information</h4>
                <p><strong>Name:</strong> {selectedApproval.employeeName}</p>
                <p><strong>Department:</strong> {selectedApproval.department}</p>
                <p><strong>Type:</strong> {selectedApproval.type}</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedApproval.amount)}</p>
                <p><strong>Submitted:</strong> {new Date(selectedApproval.submittedDate).toLocaleDateString()}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Reason</h4>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                  {selectedApproval.reason}
                </p>
              </div>

              {selectedApproval.status === 'pending' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Approval Note (optional for approval, required for rejection)</label>
                    <Textarea
                      value={approvalNote}
                      onChange={(e) => setApprovalNote(e.target.value)}
                      placeholder="Add a note about this approval/rejection..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(selectedApproval.id)}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReject(selectedApproval.id)}
                      className="text-red-600 hover:text-red-700 flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
